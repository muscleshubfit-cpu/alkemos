-- 0076 — Phase 157 (SEO-GEO-5.0): bilingual pairing column for the generation queue
-- Owner directive «نفذ توصيتك» = Proposal 1: one daily topic → TWO queue rows
-- (en + ar) sharing a common pair_id + a sealed sharedBrief in article_bundle.
-- Each language still executes its FULL P1→P5 pipeline by itself, in its own
-- geographic window (AR 05:00 UTC · EN 22:00 UTC — Phase 119 tables preserved).
--
-- STRUCTURE ONLY + IDEMPOTENT:
--   * pair_id uuid NULL — legacy V3 rows (and every degraded run) keep NULL.
--   * Partial index: fast "find my pair sibling" lookups (P0 adopt/join + P5 handshake).
--   * No FK on purpose: the twin row is inserted moments later by the same run
--     (best-effort) and can legitimately never exist (degraded path) — a FK
--     would turn an allowed state into an error.
-- Safe before/after code deploy: code treats a missing column as "pairing
-- unavailable" and degrades to the exact legacy V3 behavior (single row).
--
-- Apply note (manual path per STATE): SQL Editor then
--   NOTIFY pgrst, 'reload schema';

-- NOTE: the ALTER stays on ONE line on purpose — scripts/migration_audit.py
-- parses ALTER ... ADD COLUMN line-oriented; keep it single-line if edited.
ALTER TABLE public.blog_generation_queue ADD COLUMN IF NOT EXISTS pair_id uuid;

CREATE INDEX IF NOT EXISTS blog_generation_queue_pair_id_idx
  ON public.blog_generation_queue (pair_id)
  WHERE pair_id IS NOT NULL;

COMMENT ON COLUMN public.blog_generation_queue.pair_id IS
  'Phase 157 bilingual pairing: rows sharing a pair_id are the en+ar twins of ONE daily topic (sharedBrief sealed in article_bundle). NULL = legacy independent run. No FK by design — the twin is best-effort.';
