#!/usr/bin/env node
/**
 * Storage backup — download EVERY Supabase Storage object to disk, with a
 * checksum manifest for restore + integrity verification.
 *
 * (P0-3(c) of docs/EMERGENCY-RECOVERY-HARDENING-PLAN-2026-09-20.md —
 *  owner order 2026-09-20 evening: "أنشئ آلية النسخ الاحتياطي الآلية لجميع
 *  ملفات Supabase Storage الفعلية … مع التحقق من إمكانية استعادتها")
 *
 * WHY: the daily db-backup snapshots cover TABLE DATA only; Storage FILES
 * had no backup at all (audit B4). This script closes that gap: every
 * object of every bucket is downloaded and digested, then committed (by
 * .github/workflows/storage-backup.yml) to the PRIVATE repo
 * muscleshubfit-cpu/musclehubeg-backups → storage-backups/YYYY-MM-DD/.
 *
 * PII LAW (stricter than the census): the DOWNLOADED FILES are user
 * uploads (questionnaire photos, client avatars, payment receipts, coach
 * profile images). They must NEVER go to the public code repo, NEVER to
 * GitHub artifacts (public downloads) — ONLY the private backup repo.
 * The manifest.json additionally records object PATHS (they embed user
 * ids) — same law: private repo only.
 *
 * LOG PRIVACY LAW: stdout/stderr carry COUNTS and TOTALS only — never
 * object names or paths (these logs run in the PUBLIC repo's Actions).
 * The single sanctioned exception: an object that FAILED to download is
 * logged WITH its bucket+path, because a red job must be debuggable
 * (uid is a pseudonymous UUID, and failure lines are the operational
 * necessity the census law carves out).
 *
 * ISOLATION LAW: shares NOTHING with db-backup.mjs / storage-inventory.mjs
 * — separate script, separate workflow, separate schedule (06:00 UTC,
 * after the 05:30 snapshot + 05:45 census), separate output path. A
 * storage-backup failure can never affect the snapshot pipeline.
 *
 * Integrity: every downloaded object is sha256-digested; manifest size is
 * cross-checked against the list-API metadata size. Loud failure on any
 * download error (the workflow turns that into a red job — B3's "fail
 * loudly" law).
 *
 * Safety caps (fail loudly, never truncate silently): 20,000 objects /
 * 1 GiB total. Today's reality: 24 objects / 4.5 MB — far below; the caps
 * exist so growth forces a strategy review (git is not an object store
 * beyond ~1 GiB).
 *
 * Output layout (target dir):
 *   <dir>/manifest.json            — buckets[] + objects[] (paths+sha256)
 *   <dir>/files/<bucket>/<path>    — every object, at its exact path
 *   (exact paths are REQUIRED for restore — DB rows reference them)
 *
 * Usage:
 *   NEXT_PUBLIC_SUPABASE_URL=… SUPABASE_SERVICE_ROLE_KEY=… \
 *     node scripts/storage-backup.mjs [targetDir]
 */
import { createHash } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";

const PAGE = 100; // Supabase storage list() caps at 100 per request
const MAX_DEPTH = 6; // user-id/… folder nesting safety cap
const MAX_OBJECTS = 20000; // runaway safety cap (loud failure beyond)
const MAX_BYTES = 1073741824; // 1 GiB total cap (loud failure beyond)

const url = (process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || "").replace(/\/+$/, "");
const key = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
const outDir = process.argv[2] || "storage-backup";

if (!url || !key) {
  console.error("storage-backup: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required");
  process.exit(2);
}

const headers = {
  apikey: key,
  Authorization: `Bearer ${key}`,
};

/** Path traversal guard — object paths come from the API and must stay
 *  inside files/<bucket>/ when written to disk. */
function safeRelativePath(p) {
  if (!p || p.includes("..") || p.startsWith("/") || p.includes("\\") || p.includes("\0")) return null;
  const segments = p.split("/").filter((s) => s.length > 0);
  if (segments.length === 0) return null;
  return segments.join("/");
}

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

/** Walk one bucket (paginated + folder recursion — folders come back as
 *  { name, id: null, metadata: null }; see the 2026-09-20 census fix).
 *  Yields { path, size, mimeType, etag } for every OBJECT. */
async function* walkObjects(name) {
  const walk = async function* (prefix, depth) {
    if (depth > MAX_DEPTH) throw new Error(`depth cap exceeded under bucket ${name}`);
    for (let offset = 0; ; offset += PAGE) {
      const res = await fetch(`${url}/storage/v1/object/list/${encodeURIComponent(name)}`, {
        method: "POST",
        headers: { ...headers, "content-type": "application/json" },
        cache: "no-store",
        body: JSON.stringify({ prefix, limit: PAGE, offset, sortBy: { column: "name", order: "asc" } }),
      });
      if (!res.ok) {
        const body = await res.text().catch(() => "");
        throw new Error(`HTTP ${res.status} list ${name}: ${body.slice(0, 200)}`);
      }
      const entries = await res.json();
      if (!Array.isArray(entries)) throw new Error(`non-array page for ${name}`);
      for (const e of entries) {
        if (e && e.metadata && typeof e.metadata.size === "number") {
          yield {
            path: prefix + String(e.name),
            size: e.metadata.size,
            mimeType: typeof e.metadata.mimetype === "string" && e.metadata.mimetype ? e.metadata.mimetype : "application/octet-stream",
            etag: typeof e.metadata.eTag === "string" ? e.metadata.eTag : null,
          };
        } else if (e && typeof e.name === "string" && e.name) {
          yield* walk(`${prefix}${e.name}/`, depth + 1);
        }
      }
      if (entries.length < PAGE) break;
    }
  };
  yield* walk("", 1);
}

async function downloadObject(bucket, path) {
  const segments = path.split("/").map(encodeURIComponent).join("/");
  const res = await fetch(`${url}/storage/v1/object/${encodeURIComponent(bucket)}/${segments}`, {
    headers,
    cache: "no-store",
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`HTTP ${res.status} download: ${body.slice(0, 200)}`);
  }
  const buf = Buffer.from(await res.arrayBuffer());
  return buf;
}

const sha256 = (buf) => createHash("sha256").update(buf).digest("hex");

function stableStringify(value) {
  return JSON.stringify(value, null, 2) + "\n";
}

async function main() {
  const t0 = Date.now();
  const manifest = {
    generatedAt: new Date().toISOString(),
    source: url,
    trigger: process.env.STORAGE_BACKUP_TRIGGER || "manual",
    script: "scripts/storage-backup.mjs",
    privacy: "PRIVATE-REPO-ONLY — object paths (embed user ids) + user-uploaded files; never the public repo, never artifacts",
    buckets: [],
    objects: [],
    totals: { buckets: 0, objects: 0, bytes: 0, failed: 0, byteMismatch: 0 },
  };

  let buckets;
  try {
    buckets = await listBuckets();
    console.log(`storage-backup: ${buckets.length} buckets discovered`);
  } catch (e) {
    console.error(`storage-backup FATAL (bucket listing): ${e.message}`);
    process.exit(1);
  }

  for (const b of buckets) {
    const row = {
      name: b.name,
      public: Boolean(b.public),
      file_size_limit: typeof b.file_size_limit === "number" ? b.file_size_limit : null,
      allowed_mime_types: Array.isArray(b.allowed_mime_types) ? b.allowed_mime_types : null,
      objectCount: 0,
      totalBytes: 0,
      ok: true,
    };
    try {
      for await (const obj of walkObjects(b.name)) {
        if (manifest.totals.objects >= MAX_OBJECTS || manifest.totals.bytes >= MAX_BYTES) {
          console.error(
            `storage-backup FATAL: safety cap reached (${manifest.totals.objects} objects / ${manifest.totals.bytes} bytes) — ` +
              `the file-backup strategy needs revisiting (git is not an object store at this scale); aborting BEFORE writing an incomplete backup`,
          );
          process.exit(1);
        }
        const rel = safeRelativePath(obj.path);
        if (!rel) {
          row.ok = false;
          manifest.totals.failed += 1;
          console.error(`WARN unsafe path rejected in ${b.name}: [path withheld — see manifest]`);
          continue;
        }
        let buf;
        try {
          buf = await downloadObject(b.name, obj.path);
        } catch (e) {
          row.ok = false;
          manifest.totals.failed += 1;
          // Sanctioned exception (header LOG PRIVACY LAW): red jobs must be debuggable.
          console.error(`WARN download failed ${b.name}/${obj.path}: ${e.message}`);
          continue;
        }
        const digest = sha256(buf);
        const sizeMismatch = buf.length !== obj.size;
        if (sizeMismatch) {
          row.ok = false;
          manifest.totals.byteMismatch += 1;
          console.error(`WARN byte-size mismatch ${b.name}/${obj.path}: listed ${obj.size}, downloaded ${buf.length}`);
        }
        await mkdir(dirname(join(outDir, "files", b.name, rel)), { recursive: true });
        await writeFile(join(outDir, "files", b.name, rel), buf);
        manifest.objects.push({ bucket: b.name, path: rel, size: buf.length, listedSize: obj.size, mimeType: obj.mimeType, sha256: digest });
        row.objectCount += 1;
        row.totalBytes += buf.length;
        manifest.totals.objects += 1;
        manifest.totals.bytes += buf.length;
      }
    } catch (e) {
      row.ok = false;
      row.error = String(e.message).slice(0, 300);
      manifest.totals.failed += 1;
      console.warn(`WARN bucket walk ${b.name}: ${e.message}`);
    }
    manifest.buckets.push(row);
  }
  manifest.totals.buckets = buckets.length;

  await mkdir(outDir, { recursive: true });
  await writeFile(join(outDir, "manifest.json"), stableStringify(manifest), "utf8");

  const secs = ((Date.now() - t0) / 1000).toFixed(1);
  console.log(
    `storage-backup: ${manifest.totals.buckets} buckets · ${manifest.totals.objects} objects · ` +
      `${(manifest.totals.bytes / 1024).toFixed(0)} KB · failed=${manifest.totals.failed} · byteMismatch=${manifest.totals.byteMismatch} · ${secs}s → ${outDir}`,
  );
  if (manifest.totals.failed > 0 || manifest.totals.byteMismatch > 0) {
    console.error("storage-backup: NOT complete — see WARN lines above; the workflow must fail this run");
    process.exit(1);
  }
}

main().catch((e) => {
  console.error(`storage-backup FATAL: ${e.message}`);
  process.exit(1);
});
