#!/usr/bin/env node
/**
 * Storage restore — rebuild Supabase Storage objects from a storage-backup
 * directory produced by scripts/storage-backup.mjs (owner order 2026-09-20
 * evening: prove restorability, not just creation).
 *
 * MODES (deliberately locked, most-likely-safe first):
 *
 *   1. DRY-RUN (default, zero network writes):
 *        node scripts/storage-restore.mjs <backupDir>
 *      Re-reads every file under files/, recomputes sha256, compares to
 *      manifest.json, verifies every ORIGINAL bucket exists on the target
 *      project, and prints the restore plan (counts only). This is the
 *      integrity gate the restore drill runs before touching anything.
 *
 *   2. DRILL RESTORE (writes ONLY to one disposable bucket):
 *        node scripts/storage-restore.mjs <backupDir> --execute --into-bucket restore-drill-20260920 --create-bucket
 *      Uploads every object into the named bucket (path prefixed by the
 *      original bucket name — no cross-bucket path collisions), reads every
 *      object back and sha256-compares it, and reports the match count.
 *      This is the non-destructive end-to-end restore proof (Drill #2):
 *      same upload/download/integrity primitives a real recovery uses,
 *      zero contact with production buckets.
 *
 *   3. REAL RESTORE (writes to ORIGINAL bucket names — for a NEW project):
 *        node scripts/storage-restore.mjs <backupDir> --execute --confirm-original
 *      Requires the explicit --confirm-original flag; refuses if any
 *      target bucket is missing on the target project (bucket definitions
 *      come from migrations — see the runbook), and overwrites objects at
 *      identical paths (x-upsert). Read-back verification runs afterwards
 *      exactly like the drill. NEVER point this at production casually:
 *      it overwrites same-path objects. It exists for the recovery
 *      runbook's step "restore Storage on the fresh project".
 *
 *   4. DRILL CLEANUP:
 *        node scripts/storage-restore.mjs --delete-bucket restore-drill-20260920
 *      Deletes every object in the bucket, then the bucket itself.
 *      Refuses any bucket name not matching ^restore-drill- (hard guard —
 *      production buckets can never be deleted through this script).
 *
 * LOG PRIVACY LAW (same as storage-backup.mjs): stdout/stderr carry COUNTS
 * and TOTALS only — these logs run in the PUBLIC repo's Actions. Paths are
 * printed ONLY on failure lines (debug necessity) and in the manifest
 * (private repo only).
 *
 * Exit codes: 0 ok · 1 verification/restore failure · 2 usage error.
 *
 * Usage:
 *   SUPABASE_URL=… SUPABASE_SERVICE_ROLE_KEY=… node scripts/storage-restore.mjs <backupDir> [flags]
 *   SUPABASE_URL=… SUPABASE_SERVICE_ROLE_KEY=… node scripts/storage-restore.mjs --delete-bucket <name>
 */
import { createHash } from "node:crypto";
import { readFile, readdir, stat } from "node:fs/promises";
import { join } from "node:path";

const url = (process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || "").replace(/\/+$/, "");
const key = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

if (!url || !key) {
  console.error("storage-restore: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required");
  process.exit(2);
}

const headers = {
  apikey: key,
  Authorization: `Bearer ${key}`,
};
const jsonHeaders = { ...headers, "content-type": "application/json" };

const DRILL_BUCKET_RE = /^restore-drill-[a-z0-9-]+$/;

const args = process.argv.slice(2);
const flag = (name) => args.includes(`--${name}`);
const value = (name) => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 && i + 1 < args.length ? args[i + 1] : null;
};
const backupDir = args.find((a) => !a.startsWith("--"));

const sha256 = (buf) => createHash("sha256").update(buf).digest("hex");

async function listBuckets() {
  const res = await fetch(`${url}/storage/v1/bucket`, { headers, cache: "no-store" });
  if (!res.ok) throw new Error(`HTTP ${res.status} /storage/v1/bucket`);
  const buckets = await res.json();
  const map = new Map();
  for (const b of buckets) map.set(String(b.name), b);
  return map;
}

async function uploadObject(bucket, path, buf, mimeType) {
  const segments = path.split("/").map(encodeURIComponent).join("/");
  const res = await fetch(`${url}/storage/v1/object/${encodeURIComponent(bucket)}/${segments}`, {
    method: "POST",
    headers: { ...headers, "content-type": mimeType || "application/octet-stream", "x-upsert": "true" },
    body: new Uint8Array(buf),
    cache: "no-store",
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`HTTP ${res.status} upload: ${body.slice(0, 200)}`);
  }
}

async function downloadObject(bucket, path) {
  const segments = path.split("/").map(encodeURIComponent).join("/");
  const res = await fetch(`${url}/storage/v1/object/${encodeURIComponent(bucket)}/${segments}`, { headers, cache: "no-store" });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`HTTP ${res.status} download: ${body.slice(0, 200)}`);
  }
  return Buffer.from(await res.arrayBuffer());
}

async function walkFiles(dir, prefix = "") {
  const out = [];
  let entries;
  try {
    entries = await readdir(join(dir, prefix), { withFileTypes: true });
  } catch {
    return out; // missing dir = empty
  }
  for (const e of entries) {
    const rel = prefix ? `${prefix}/${e.name}` : e.name;
    if (e.isDirectory()) out.push(...(await walkFiles(dir, rel)));
    else out.push(rel);
  }
  return out;
}

async function loadManifest(dir) {
  const raw = await readFile(join(dir, "manifest.json"), "utf8");
  const m = JSON.parse(raw);
  if (!m || !Array.isArray(m.objects) || !Array.isArray(m.buckets)) throw new Error("manifest.json is not a storage-backup manifest");
  return m;
}

/** Verify backup integrity on disk (dry-run core). Returns per-object
 *  results; never touches the network beyond the bucket-existence check. */
async function verifyBackup(dir, manifest, liveBuckets) {
  let okCount = 0;
  let missing = 0;
  let corrupt = 0;
  const missingBuckets = new Set();
  for (const b of manifest.buckets) {
    if (!liveBuckets.has(b.name)) missingBuckets.add(b.name);
  }
  for (const obj of manifest.objects) {
    let buf = null;
    try {
      buf = await readFile(join(dir, "files", obj.bucket, obj.path));
    } catch {
      missing += 1;
      console.error(`WARN file missing on disk: ${obj.bucket}/${obj.path}`);
      continue;
    }
    const digest = sha256(buf);
    if (digest !== obj.sha256 || buf.length !== obj.size) {
      corrupt += 1;
      console.error(`WARN integrity mismatch: ${obj.bucket}/${obj.path}`);
      continue;
    }
    okCount += 1;
  }
  // files/ must not contain anything the manifest does not know (silent extras = drift)
  let extras = 0;
  for (const b of manifest.buckets) {
    const onDisk = await walkFiles(join(dir, "files", b.name)); // paths relative to the bucket dir
    const known = new Set(manifest.objects.filter((o) => o.bucket === b.name).map((o) => o.path));
    for (const f of onDisk) if (!known.has(f)) extras += 1;
  }
  return { okCount, missing, corrupt, extras, missingBuckets: [...missingBuckets] };
}

async function main() {
  const t0 = Date.now();

  // ── Mode 4: drill cleanup ─────────────────────────────────────────
  if (flag("delete-bucket")) {
    const name = value("delete-bucket");
    if (!name || !DRILL_BUCKET_RE.test(name)) {
      console.error(`storage-restore: --delete-bucket refuses "${name}" — only ${DRILL_BUCKET_RE} buckets are deletable here (production guard)`);
      process.exit(2);
    }
    const live = await listBuckets();
    if (!live.has(name)) {
      console.log(`storage-restore: bucket ${name} already gone — nothing to clean`);
      return;
    }
    const paths = [];
    const walk = async (prefix, depth) => {
      if (depth > 8) return;
      for (let offset = 0; ; offset += 100) {
        const res = await fetch(`${url}/storage/v1/object/list/${encodeURIComponent(name)}`, {
          method: "POST",
          headers: jsonHeaders,
          cache: "no-store",
          body: JSON.stringify({ prefix, limit: 100, offset, sortBy: { column: "name", order: "asc" } }),
        });
        if (!res.ok) throw new Error(`HTTP ${res.status} list ${name}`);
        const entries = await res.json();
        for (const e of entries) {
          if (e && e.metadata && typeof e.metadata.size === "number") paths.push(prefix + String(e.name));
          else if (e && typeof e.name === "string" && e.name) await walk(`${prefix}${e.name}/`, depth + 1);
        }
        if (entries.length < 100) break;
      }
    };
    await walk("", 1);
    let deleted = 0;
    for (let i = 0; i < paths.length; i += 500) {
      const chunk = paths.slice(i, i + 500);
      const res = await fetch(`${url}/storage/v1/object/${encodeURIComponent(name)}`, {
        method: "DELETE",
        headers: jsonHeaders,
        cache: "no-store",
        body: JSON.stringify({ prefixes: chunk }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status} object delete: ${(await res.text().catch(() => "")).slice(0, 200)}`);
      deleted += chunk.length;
    }
    const del = await fetch(`${url}/storage/v1/bucket/${encodeURIComponent(name)}`, { method: "DELETE", headers, cache: "no-store" });
    if (!del.ok) throw new Error(`HTTP ${del.status} bucket delete: ${(await del.text().catch(() => "")).slice(0, 200)}`);
    console.log(`storage-restore: drill cleanup done — ${deleted} objects deleted, bucket ${name} removed`);
    return;
  }

  // ── Modes 1–3 need a backup dir ───────────────────────────────────
  if (!backupDir) {
    console.error("usage: storage-restore.mjs <backupDir> [--execute [--into-bucket X --create-bucket] | --confirm-original] | --delete-bucket <name>");
    process.exit(2);
  }
  const execute = flag("execute");
  const intoBucket = value("into-bucket");
  const createBucket = flag("create-bucket");
  const confirmOriginal = flag("confirm-original");
  if (execute && !intoBucket && !confirmOriginal) {
    console.error("storage-restore: --execute requires a target — either --into-bucket <name> (drill) or --confirm-original (real recovery). Default is dry-run; refusing to guess.");
    process.exit(2);
  }
  if (!execute && (intoBucket || confirmOriginal || createBucket)) {
    console.error("storage-restore: target flags without --execute do nothing — drop them (dry-run) or add --execute");
    process.exit(2);
  }
  if (intoBucket && confirmOriginal) {
    console.error("storage-restore: --into-bucket and --confirm-original are mutually exclusive");
    process.exit(2);
  }

  const manifest = await loadManifest(backupDir);
  const liveBuckets = await listBuckets();

  // ── Mode 1: dry-run (integrity + plan) ────────────────────────────
  console.log(`storage-restore: manifest ${manifest.generatedAt} — ${manifest.totals.buckets} buckets · ${manifest.totals.objects} objects · ${(manifest.totals.bytes / 1024).toFixed(0)} KB`);
  const v = await verifyBackup(backupDir, manifest, liveBuckets);
  const plan = {};
  for (const b of manifest.buckets) plan[b.name] = 0;
  for (const o of manifest.objects) plan[o.bucket] = (plan[o.bucket] || 0) + 1;
  for (const [b, n] of Object.entries(plan)) console.log(`  plan: ${b} → ${n} object(s)`);
  console.log(
    `storage-restore: integrity ${v.okCount}/${manifest.totals.objects} ok · missing=${v.missing} · corrupt=${v.corrupt} · extra-files=${v.extras}` +
      (v.missingBuckets.length ? ` · target-project missing buckets: ${v.missingBuckets.join(", ")}` : ""),
  );
  if (v.missing || v.corrupt || v.extras) {
    console.error("storage-restore: backup integrity FAILED — restore is not safe from this directory");
    process.exit(1);
  }
  if (v.missingBuckets.length && !intoBucket) {
    console.error(`storage-restore: target project lacks buckets ${v.missingBuckets.join(", ")} — create them first (runbook migrations 0027/0037/0090) or use --into-bucket for a drill`);
    process.exit(1);
  }
  if (!execute) {
    console.log("storage-restore: dry-run complete — zero network writes performed");
    return;
  }

  // ── Mode 2/3: execute ─────────────────────────────────────────────
  if (intoBucket && !DRILL_BUCKET_RE.test(intoBucket) && !/^[a-z0-9][a-z0-9-]{1,60}$/.test(intoBucket)) {
    console.error(`storage-restore: invalid bucket name "${intoBucket}"`);
    process.exit(2);
  }
  if (intoBucket && createBucket && !liveBuckets.has(intoBucket)) {
    const res = await fetch(`${url}/storage/v1/bucket`, {
      method: "POST",
      headers: jsonHeaders,
      cache: "no-store",
      body: JSON.stringify({ name: intoBucket, public: false }), // PRIVATE — drill copies include private user files
    });
    if (!res.ok && res.status !== 409) {
      throw new Error(`HTTP ${res.status} create bucket: ${(await res.text().catch(() => "")).slice(0, 200)}`);
    }
    console.log(`storage-restore: drill bucket ${intoBucket} created (private)`);
  }
  if (intoBucket && !liveBuckets.has(intoBucket) && !createBucket) {
    console.error(`storage-restore: bucket ${intoBucket} does not exist on the target — add --create-bucket`);
    process.exit(2);
  }

  const targetFor = (o) => (intoBucket ? { bucket: intoBucket, path: `${o.bucket}/${o.path}` } : { bucket: o.bucket, path: o.path });

  let uploaded = 0;
  let uploadFailed = 0;
  for (const o of manifest.objects) {
    const buf = await readFile(join(backupDir, "files", o.bucket, o.path));
    const t = targetFor(o);
    try {
      await uploadObject(t.bucket, t.path, buf, o.mimeType);
      uploaded += 1;
    } catch (e) {
      uploadFailed += 1;
      console.error(`WARN upload failed ${t.bucket}/${t.path}: ${e.message}`); // sanctioned debug exception (header law)
    }
  }

  let verified = 0;
  let verifyFailed = 0;
  for (const o of manifest.objects) {
    const t = targetFor(o);
    try {
      const back = await downloadObject(t.bucket, t.path);
      if (sha256(back) === o.sha256) verified += 1;
      else {
        verifyFailed += 1;
        console.error(`WARN read-back digest mismatch ${t.bucket}/${t.path}`);
      }
    } catch (e) {
      verifyFailed += 1;
      console.error(`WARN read-back failed ${t.bucket}/${t.path}: ${e.message}`);
    }
  }

  const secs = ((Date.now() - t0) / 1000).toFixed(1);
  const mode = intoBucket ? `drill→${intoBucket}` : "original-buckets";
  console.log(
    `storage-restore: ${mode} — uploaded ${uploaded}/${manifest.totals.objects} · read-back verified ${verified}/${manifest.totals.objects} · ` +
      `uploadFailed=${uploadFailed} · verifyFailed=${verifyFailed} · ${secs}s`,
  );
  if (uploadFailed || verifyFailed || verified !== manifest.totals.objects) {
    console.error("storage-restore: FAILED — not every object round-tripped byte-identically");
    process.exit(1);
  }
  console.log("storage-restore: every object round-tripped byte-identically (sha256)");
}

main().catch((e) => {
  console.error(`storage-restore FATAL: ${e.message}`);
  process.exit(1);
});
