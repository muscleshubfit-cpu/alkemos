#!/usr/bin/env node
/**
 * notifications-prune — W2-1a (P-03) retention runner (2026-10-03)
 *
 * The retention half of migration 0100: calls the
 * prune_notifications() RPC weekly (scheduled by
 * .github/workflows/notifications-prune.yml — Saturday 03:17 UTC)
 * with the service-role key. The RPC deletes notifications rows
 * older than the retention window and returns the count; the bell
 * only ever renders the latest 20 per user, so pruned rows are dead
 * weight by construction.
 *
 * Lean by design (the db-backup.mjs pattern): plain node + raw
 * PostgREST fetch — no dependency install, no framework hop, a
 * weekly run costs seconds. The retention DEFAULT lives in the
 * migration (single source); NOTIFICATIONS_RETENTION_DAYS overrides
 * it per-run (validated + clamped to the RPC's own [7, 3650]
 * window, so what the log says is what the SQL does).
 *
 * Missed-schedule behavior is benign by design: the next run catches
 * up, and the 0100 index keeps every bell read fast regardless of
 * table size (the SCHEDULE HEALTH LAW tradeoff this job is allowed
 * to make — it publishes nothing).
 *
 * Exports are side-effect-free (main-guarded) so the canary
 * (src/lib/__tests__/notifications-retention.test.ts) imports the
 * core directly.
 *
 * Usage:
 *   SUPABASE_URL=… SUPABASE_SERVICE_ROLE_KEY=… node scripts/notifications-prune.mjs
 * Env:
 *   SUPABASE_URL | NEXT_PUBLIC_SUPABASE_URL   — project URL (required)
 *   SUPABASE_SERVICE_ROLE_KEY                 — service key (required)
 *   NOTIFICATIONS_RETENTION_DAYS              — optional int, default 90
 * Exit codes: 0 = pruned (0 deleted is healthy too) · 2 = missing
 *             env / bad retention value · 1 = the RPC call failed.
 */

import { pathToFileURL } from "node:url";

export const DEFAULT_RETENTION_DAYS = 90;
// Mirror of the RPC's own clamp (migration 0100) — the belt under the
// database's suspenders: the log never claims a window the SQL won't honor.
export const MIN_RETENTION_DAYS = 7;
export const MAX_RETENTION_DAYS = 3650;

/**
 * Resolve the retention window from a raw env-style string.
 * Empty/undefined → 90 (the migration default). Integers are clamped
 * to [MIN, MAX]; anything non-integer THROWS (an honest RED beats a
 * silently-wrong window).
 */
export function resolveRetentionDays(raw) {
  if (raw === undefined || raw === null || String(raw).trim() === "") {
    return DEFAULT_RETENTION_DAYS;
  }
  const n = Number(String(raw).trim());
  if (!Number.isInteger(n)) {
    throw new Error(
      `notifications-prune: NOTIFICATIONS_RETENTION_DAYS must be an integer, got: ${JSON.stringify(raw)}`,
    );
  }
  return Math.min(Math.max(n, MIN_RETENTION_DAYS), MAX_RETENTION_DAYS);
}

/**
 * Call the prune_notifications() RPC over PostgREST. Returns the
 * deleted row count. Throws on missing config, non-2xx, or a payload
 * that is not a number — the caller (main/workflow) surfaces it as a
 * RED exit, never a false GREEN.
 */
export async function runPrune({
  url,
  key,
  retentionDays = DEFAULT_RETENTION_DAYS,
  fetchImpl = fetch,
}) {
  if (!url || !key) {
    throw new Error(
      "notifications-prune: SUPABASE_URL (or NEXT_PUBLIC_SUPABASE_URL) and SUPABASE_SERVICE_ROLE_KEY are required",
    );
  }
  const res = await fetchImpl(
    `${url.replace(/\/+$/, "")}/rest/v1/rpc/prune_notifications`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: key,
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify({ p_retention_days: retentionDays }),
    },
  );
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(
      `notifications-prune: HTTP ${res.status} from rpc/prune_notifications: ${body.slice(0, 200)}`,
    );
  }
  const payload = await res.json();
  const count = typeof payload === "number" ? payload : Number(payload);
  if (!Number.isFinite(count)) {
    throw new Error(
      `notifications-prune: unexpected RPC payload (expected number): ${JSON.stringify(payload).slice(0, 120)}`,
    );
  }
  return count;
}

async function main() {
  const url = (
    process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || ""
  ).replace(/\/+$/, "");
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

  let days;
  try {
    days = resolveRetentionDays(process.env.NOTIFICATIONS_RETENTION_DAYS);
  } catch (e) {
    console.error(e.message);
    process.exit(2);
  }

  try {
    const deleted = await runPrune({ url, key, retentionDays: days });
    console.log(
      `notifications-prune: pruned ${deleted} notification row(s) older than ${days} day(s)`,
    );
    // machine-readable final line (workflow summaries / greppable)
    console.log(JSON.stringify({ ok: true, deleted, retention_days: days }));
  } catch (e) {
    console.error(e.message);
    process.exit(1);
  }
}

// Main guard: only run as a CLI entry point — importing the module
// (the canary) must stay side-effect-free.
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  await main();
}
