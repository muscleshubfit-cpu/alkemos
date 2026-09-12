-- ═══════════════════════════════════════════════════════════════════
-- 0085 — PHASE 183: UNIFIED AI PLAN-GENERATION LEDGER (ai_plan_usage)
--
-- Owner decree 2026-09-13 «البوول الموحد» (spec "Alkemos — Membership
-- & Plan Changes"; owner: zero live subscribers at cutover — no balance
-- migration needed):
--   * ONE monthly pool per identity — nutrition + workout generations
--     COMBINED: free 2 · premium 4 · pro 8 · coaching 8.
--   * SUCCESS-ONLY accounting: a row exists ONLY after a plan was
--     actually generated and validated (failed attempts, input edits,
--     navigation, re-viewing an existing plan = never counted).
--   * Guests (no account) get the FREE pool — keyed by a server-side
--     salted hash of a client-generated guest id (localStorage UUID) —
--     no signup wall, soft nudge only.
--
-- DESIGN (mirrors 0022/0028 tamper-proof ledgers):
--   * RLS ENABLED, NO client policies — only the service_role key
--     (supabaseAdmin) reads/writes. Nothing is browser-writable, so
--     clearing storage or skipping client inserts cannot reset the
--     pool.
--   * user_id uuid (members) OR guest_key text (visitors) — exactly
--     one of the two per row (CHECK constraint).
--   * kind: nutrition | workout (both burn the SAME unified pool —
--     counting is per-identity, not per-kind).
--   * surface: planner (demo pages) | evo (chat plan intents) |
--     coach (ai_jobs done on behalf of the client — owner decree
--     2026-09-01 «توليد الخطط بيتحسب من الرصيد سواء عن طريق المدرب
--     او عن طريق ايفو»).
--
-- LEGACY SURFACES (kept, untouched):
--   * evo_chat_usage (0022) — still records EVERY chat dispatch
--     before dispatch (daily message quota + burst evidence). Its
--     plan_nutrition/plan_workout rows are no longer the plan-quota
--     source; the unified pool reads THIS table only.
--   * ai_jobs — still the async queue; the runner additionally writes
--     a success row here when a plan job finishes 'done'.
--
-- Applied automatically by the Supabase-GitHub integration (Phase 120).
-- IDEMPOTENT: safe to re-run (IF NOT EXISTS everywhere).
-- ═══════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.ai_plan_usage (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  guest_key text,
  kind text NOT NULL CHECK (kind IN ('nutrition','workout')),
  surface text NOT NULL DEFAULT 'planner' CHECK (surface IN ('planner','evo','coach')),
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT ai_plan_usage_identity_check CHECK (
    (user_id IS NOT NULL AND guest_key IS NULL) OR
    (user_id IS NULL AND guest_key IS NOT NULL)
  )
);

CREATE INDEX IF NOT EXISTS idx_ai_plan_usage_user_created
  ON public.ai_plan_usage (user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_ai_plan_usage_guest_created
  ON public.ai_plan_usage (guest_key, created_at DESC);

ALTER TABLE public.ai_plan_usage ENABLE ROW LEVEL SECURITY;
-- No policies ON PURPOSE (tamper-proof, service-role only — mirrors
-- evo_chat_usage 0022 / evo_anon_usage 0028).

-- AFTER APPLYING ON PRODUCTION (integration usually handles it):
-- NOTIFY pgrst, 'reload schema';
