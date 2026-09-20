#!/usr/bin/env node
/**
 * Storage inventory — daily metadata-only census of Supabase Storage buckets.
 *
 * (P0-3(b) of docs/EMERGENCY-RECOVERY-HARDENING-PLAN-2026-09-20.md)
 *
 * WHY: the daily db-backup snapshots dump table DATA only — Supabase Storage
 * FILES have no backup at all (audit B4). Until the owner decides on a file
 * backup strategy, this census gives permanent visibility of what is at
 * risk: per-bucket object counts and total byte sizes, committed beside the
 * daily snapshots in the PRIVATE repo muscleshubfit-cpu/musclehubeg-backups
 * → storage-inventory/YYYY-MM-DD/storage-inventory.json.
 *
 * PRIVACY LAW: counts and byte totals ONLY — never object names, paths,
 * prefixes or user IDs (filenames embed user identifiers). If you extend
 * this script, keep that law.
 *
 * ISOLATION LAW: this script shares NOTHING with db-backup.mjs — separate
 * script, separate workflow (.github/workflows/storage-inventory.yml),
 * separate output path. A census failure can never affect the snapshot
 * pipeline. Best-effort per bucket: a bucket error is recorded as
 * {ok:false} and never fails the run; only a TOTAL failure (cannot even
 * list buckets) exits non-zero so the (continue-on-error) workflow step
 * is visibly flagged.
 *
 * Output layout (target dir):
 *   <dir>/storage-inventory.json  — { generatedAt, trigger, source, buckets,
 *                                     totals: {buckets, objects, bytes, failed} }
 *
 * Usage:
 *   SUPABASE_URL=… SUPABASE_SERVICE_ROLE_KEY=… \
 *     node scripts/storage-inventory.mjs [targetDir]
 */

import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";

const PAGE = 100; // Supabase storage list() caps at 100 per request
const MAX_DEPTH = 6; // user-id/… folder nesting safety cap
const MAX_OBJECTS = 50000; // per-bucket runaway safety cap

const url = (process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || "").replace(/\/+$/, "");
const key = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
const outDir = process.argv[2] || "storage-inventory";

if (!url || !key) {
  console.error("storage-inventory: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required");
  process.exit(2);
}

const headers = {
  apikey: key,
  Authorization: `Bearer ${key}`,
  "content-type": "application/json",
};

async function listBuckets() {
  const res = await fetch(`${url}/storage/v1/bucket`, { headers, cache: "no-store" });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`HTTP ${res.status} /storage/v1/bucket: ${body.slice(0, 200)}`);
  }
  const buckets = await res.json();
  if (!Array.isArray(buckets)) throw new Error("non-array bucket list");
  return buckets.sort((a, b) => String(a.name).localeCompare(String(b.name)));
}

/**
 * Walk one bucket (paginated + folder recursion). Returns
 * {objectCount, totalBytes, truncated}. Privacy: only counts/sizes are
 * ever collected — names/paths are read transiently for pagination order
 * and immediately discarded.
 */
async function countBucket(name) {
  const state = { objectCount: 0, totalBytes: 0, truncated: false };
  const walk = async (prefix, depth) => {
    if (depth > MAX_DEPTH || state.objectCount >= MAX_OBJECTS) {
      state.truncated = true;
      return;
    }
    for (let offset = 0; ; offset += PAGE) {
      const res = await fetch(`${url}/storage/v1/list/${encodeURIComponent(name)}`, {
        method: "POST",
        headers,
        cache: "no-store",
        body: JSON.stringify({ prefix, limit: PAGE, offset, sortBy: { column: "name", order: "asc" } }),
      });
      if (!res.ok) {
        const body = await res.text().catch(() => "");
        throw new Error(`HTTP ${res.status} list ${name}[${prefix}]: ${body.slice(0, 200)}`);
      }
      const entries = await res.json();
      if (!Array.isArray(entries)) throw new Error(`non-array page for ${name}`);
      for (const e of entries) {
        if (e && e.metadata && typeof e.metadata.size === "number") {
          state.objectCount += 1;
          state.totalBytes += e.metadata.size;
        } else if (e && typeof e.id === "string" && e.id) {
          await walk(e.id, depth + 1);
        }
        if (state.objectCount >= MAX_OBJECTS) {
          state.truncated = true;
          return;
        }
      }
      if (entries.length < PAGE) break;
    }
  };
  await walk("", 1);
  return state;
}

function stableStringify(value) {
  return JSON.stringify(value, null, 2) + "\n";
}

async function main() {
  const t0 = Date.now();
  const manifest = {
    generatedAt: new Date().toISOString(),
    source: url,
    trigger: process.env.STORAGE_INVENTORY_TRIGGER || "manual",
    privacy: "counts+bytes only — no object names/paths (P0-3 privacy law)",
    buckets: [],
    totals: { buckets: 0, objects: 0, bytes: 0, failed: 0 },
  };

  let buckets;
  try {
    buckets = await listBuckets();
    console.log(`storage-inventory: ${buckets.length} buckets discovered`);
  } catch (e) {
    // TOTAL failure — record it and exit non-zero (step is continue-on-error,
    // so the snapshot pipeline is still untouched).
    manifest.totals.failed += 1;
    manifest.listError = String(e.message).slice(0, 300);
    await mkdir(outDir, { recursive: true });
    await writeFile(join(outDir, "storage-inventory.json"), stableStringify(manifest), "utf8");
    console.error(`storage-inventory FATAL (bucket listing): ${e.message}`);
    process.exit(1);
  }

  for (const b of buckets) {
    const row = {
      name: b.name,
      public: Boolean(b.public),
      objectCount: 0,
      totalBytes: 0,
      truncated: false,
      ok: true,
    };
    try {
      const counted = await countBucket(b.name);
      Object.assign(row, counted);
      manifest.totals.objects += counted.objectCount;
      manifest.totals.bytes += counted.totalBytes;
    } catch (e) {
      row.ok = false;
      row.error = String(e.message).slice(0, 300);
      manifest.totals.failed += 1;
      console.warn(`WARN ${b.name}: ${e.message}`);
    }
    manifest.buckets.push(row);
  }
  manifest.totals.buckets = buckets.length;

  await mkdir(outDir, { recursive: true });
  await writeFile(join(outDir, "storage-inventory.json"), stableStringify(manifest), "utf8");

  const secs = ((Date.now() - t0) / 1000).toFixed(1);
  console.log(
    `storage-inventory: ${manifest.totals.buckets} buckets · ${manifest.totals.objects} objects · ` +
      `${(manifest.totals.bytes / 1024).toFixed(0)} KB · failed=${manifest.totals.failed} · ${secs}s → ${outDir}`,
  );
}

main().catch((e) => {
  console.error(`storage-inventory FATAL: ${e.message}`);
  process.exit(1);
});
