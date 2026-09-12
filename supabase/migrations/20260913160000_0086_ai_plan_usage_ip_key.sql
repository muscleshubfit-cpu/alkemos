-- ═══════════════════════════════════════════════════════════════════
-- 0086 — G6 FIX (owner report 2026-09-13): GUEST POOL IP DIMENSION
--
-- THE HOLE (owner-tested live): the Phase 183 guest pool was keyed ONLY
-- by the salted hash of a client-minted localStorage UUID. A brand-new
-- incognito window (or cleared storage, or a blocked-storage browser)
-- mints a brand-new UUID → brand-new identity → the monthly balance
-- "reset" back to 2/2. The ledger itself was always tamper-proof, but
-- the IDENTITY it counted was client-controlled.
--
-- THE FIX (dual-dimension guest identity — mirrors the D3 law the
-- anonymous EVO chat already follows):
--   * ai_plan_usage rows for guests now ALSO carry `ip_key` — a salted
--     SHA-256 of the client IP (same scheme + salt as the chat anon
--     key, so planner rows and EVO rows from one network collide).
--   * Enforcement + display read BOTH dimensions:
--       used = max(count(guest_key), count(ip_key))  — this month
--     Incognito/clear-storage (fresh guest_key, same IP) → still
--     blocked. Router/IP rotation (fresh IP, same browser) → still
--     blocked. Both vectors neutralized; members (user_id) unchanged.
--   * No raw IPs stored. Rotating EVO_ANON_SALT invalidates existing
--     IP counters (documented, same as D3).
--
-- Trade-off (accepted, same as anonymous chat D3): multiple genuine
-- users behind one shared IP (home NAT / office / CGNAT) share the
-- guest trial pool — the signup nudge stays SOFT (create a free
-- account for your own pool), never a wall.
--
-- Only the service-role key writes/reads (RLS, no client policies) —
-- unchanged posture. Applied automatically by the Supabase-GitHub
-- integration. IDEMPOTENT: safe to re-run (IF NOT EXISTS everywhere).
-- ═══════════════════════════════════════════════════════════════════

-- 1. The IP dimension column (guest rows only in practice; members
--    keep user_id as their sole identity — IP counting never applies
--    to signed-in users).
ALTER TABLE public.ai_plan_usage
  ADD COLUMN IF NOT EXISTS ip_key text;

-- 2. Monthly count lookup for the IP dimension.
CREATE INDEX IF NOT EXISTS idx_ai_plan_usage_ip_created
  ON public.ai_plan_usage (ip_key, created_at DESC)
  WHERE ip_key IS NOT NULL;

-- 3. Backfill NOTHING on purpose: zero-subscriber fresh system (owner
--    decree), and pre-G6 guest rows (≤ a handful, first hours of
--    Phase 183) keep counting via their guest_key dimension only.

-- AFTER APPLYING ON PRODUCTION (integration usually handles it):
-- NOTIFY pgrst, 'reload schema';
