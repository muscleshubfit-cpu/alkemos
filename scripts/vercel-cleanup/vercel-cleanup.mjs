#!/usr/bin/env node
/**
 * Vercel stale-deployment cleanup — Phase 145 (owner directive 2026-09-08).
 *
 * WHY: the Hobby (free) plan includes 10 GB of "Function Storage" — the
 * retained serverless-function bundles of every kept deployment. This repo
 * deploys on EVERY push to main (~17 deploys/day during active phases) and
 * burned through the whole quota in under a week (VERCEL-FS-CLEANUP-2026-09-08:
 * 123 retained deployments in 5 days → 100% → new deployments blocked).
 * Vercel auto-purges only far older deployments, so the accumulation wins.
 *
 * WHAT: keeps the CURRENT production deployment (the one holding the domain
 * aliases) + everything newer than KEEP_HOURS + the newest KEEP_PREVIEWS
 * preview deployments, and DELETEs every other READY deployment via the
 * Vercel REST API. Superseded deployments are always reproducible from git
 * (`vercel` rebuilds any commit), so purging them loses nothing.
 *
 * RUNTIME: Node 22 global fetch — ZERO dependencies (db-backup.mjs pattern).
 * Auth: VERCEL_TOKEN from GitHub Actions secrets (never in code — §3.2).
 *
 * HONEST EXIT: GREEN run = listing + every deletion call succeeded (or
 * nothing needed purging). RED run = an API call failed after retries —
 * the ✗ lines name the exact deployment UID and HTTP status.
 *
 * Env:
 *   VERCEL_TOKEN         (required) Vercel API token — project scope suffices
 *   VERCEL_PROJECT_NAME  (optional, default "alkemos")
 *   KEEP_HOURS           (optional, default "48")  freshness window to always keep
 *   KEEP_PREVIEWS        (optional, default "2")   newest previews to always keep
 *   DRY_RUN              (optional, "1"/"true" — list only, delete nothing)
 */

const API = "https://api.vercel.com";

const TOKEN = process.env.VERCEL_TOKEN || "";
const PROJECT_NAME = process.env.VERCEL_PROJECT_NAME || "alkemos";
const KEEP_HOURS = Number(process.env.KEEP_HOURS || "48");
const KEEP_PREVIEWS = Number(process.env.KEEP_PREVIEWS || "2");
const DRY_RUN = /^(1|true|yes)$/i.test(process.env.DRY_RUN || "");

let stepSummary = "";
function log(line) {
  console.log(line);
  stepSummary += line + "\n";
}

function fail(msg) {
  console.error("✗ " + msg);
  process.exit(1);
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function api(path, { method = "GET", params = null } = {}) {
  let url = API + path;
  if (params) url += "?" + new URLSearchParams(params).toString();
  for (let attempt = 1; attempt <= 4; attempt++) {
    let resp;
    try {
      resp = await fetch(url, {
        method,
        headers: { Authorization: "Bearer " + TOKEN },
      });
    } catch (err) {
      if (attempt === 4) fail(`network error on ${method} ${path}: ${err.message}`);
      await sleep(10 * attempt * 1000);
      continue;
    }
    if (resp.status === 429) {
      const wait = 15 * attempt;
      log(`  ⧗ 429 rate-limited — sleeping ${wait}s (attempt ${attempt}/4)`);
      await sleep(wait * 1000);
      continue;
    }
    if (resp.status === 401 || resp.status === 403) {
      fail(`${method} ${path} → HTTP ${resp.status} — VERCEL_TOKEN missing scope/expired`);
    }
    const raw = await resp.text();
    let body = {};
    try {
      body = raw ? JSON.parse(raw) : {};
    } catch {
      body = { _raw: raw.slice(0, 200) };
    }
    return { status: resp.status, body };
  }
  fail(`${method} ${path} → rate-limited beyond retries`);
}

async function resolveProjectId() {
  const { status, body } = await api(`/v9/projects/${encodeURIComponent(PROJECT_NAME)}`);
  if (status !== 200 || !body.id) {
    fail(`GET /v9/projects/${PROJECT_NAME} → HTTP ${status} — project not reachable with this token`);
  }
  return body.id;
}

async function listReadyDeployments(projectId) {
  const all = [];
  let until = null;
  for (let page = 0; page < 50; page++) {
    const params = { limit: "100", projectId, state: "READY" };
    if (until) params.until = String(until);
    const { status, body } = await api("/v6/deployments", { params });
    if (status !== 200) fail(`GET /v6/deployments → HTTP ${status}`);
    const batch = body.deployments || [];
    all.push(...batch);
    if (batch.length < 100) return all;
    until = batch[batch.length - 1].createdAt - 1;
  }
  fail("deployment listing exceeded the pagination guard (50 pages × 100) — aborting to stay safe");
}

function fmtAge(ms) {
  const h = Math.round((Date.now() - ms) / 3600000);
  return h < 24 ? `${h}h` : `${Math.round(h / 24)}d`;
}

async function main() {
  if (!TOKEN) fail("VERCEL_TOKEN is empty — add it as a GitHub repository secret (Settings ▸ Secrets and variables ▸ Actions)");
  log(`=== Vercel cleanup — project "${PROJECT_NAME}"${DRY_RUN ? " — DRY RUN (deletes nothing)" : ""} ===`);
  log(`keep: production (current) + last ${KEEP_HOURS}h + ${KEEP_PREVIEWS} newest previews`);

  const projectId = await resolveProjectId();
  const deps = (await listReadyDeployments(projectId)).sort((a, b) => b.createdAt - a.createdAt);
  log(`READY deployments found: ${deps.length}`);

  const keep = new Set();

  // 1) Current production deployment (holds alkemos.com aliases) — never delete.
  const prod = deps.find((d) => d.target === "production");
  if (prod) {
    keep.add(prod.uid);
    log(`KEEP production: ${prod.uid} (${fmtAge(prod.createdAt)} old)`);
  } else {
    // Safety net: never purge into an unaliased state — keep the newest overall.
    const newest = deps[0];
    if (newest) {
      keep.add(newest.uid);
      log(`⚠ no target=production deployment found — safety-keeping newest: ${newest.uid}`);
    }
  }

  // 2) Freshness window.
  const cutoff = Date.now() - KEEP_HOURS * 3600 * 1000;
  for (const d of deps) {
    if (d.createdAt >= cutoff && !keep.has(d.uid)) {
      keep.add(d.uid);
      log(`KEEP fresh: ${d.uid} (${fmtAge(d.createdAt)} old)`);
    }
  }

  // 3) Newest previews regardless of age.
  const previews = deps.filter((d) => d.target !== "production");
  for (const d of previews.slice(0, KEEP_PREVIEWS)) {
    if (!keep.has(d.uid)) {
      keep.add(d.uid);
      log(`KEEP preview: ${d.uid} (${fmtAge(d.createdAt)} old)`);
    }
  }

  const toDelete = deps.filter((d) => !keep.has(d.uid));
  log(`to purge: ${toDelete.length}${toDelete.length ? "" : " — nothing to purge ✓"}`);

  let deleted = 0;
  let failed = 0;
  for (const d of toDelete) {
    const { status, body } = await api(`/v13/deployments/${d.uid}`, { method: "DELETE" });
    if (status === 200 || status === 204) {
      deleted++;
      log(`  ✓ deleted ${d.uid} (${fmtAge(d.createdAt)} old)`);
    } else {
      failed++;
      console.error(`  ✗ FAILED ${d.uid} → HTTP ${status} ${JSON.stringify(body).slice(0, 120)}`);
    }
    await sleep(300); // gentle pacing — this is a shared API quota
  }

  log(`=== done: deleted=${deleted} failed=${failed} kept=${keep.size} total=${deps.length} ===`);
  if (failed > 0) fail(`${failed} deletion call(s) failed — run is RED by the honest-exit law`);

  if (process.env.GITHUB_STEP_SUMMARY) {
    const fs = await import("node:fs");
    const title = DRY_RUN ? "Vercel cleanup (DRY RUN)" : "Vercel cleanup";
    fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, `### ${title}\n\n\`\`\`\n${stepSummary}\n\`\`\`\n`);
  }
}

main().catch((e) => fail(e && e.message ? e.message : String(e)));
