-- ═══════════════════════════════════════════════════════════════════
-- 0087 — PHASE 192 (SEO/GEO audit items 1+2+9): blog intent
-- consolidation — one primary page per search intent
-- (owner directive 2026-09-14: «نفّذ الإصلاحات التالية فقط … أعد توجيه
--  المقالات المتطابقة فقط عندما يكون الدمج منطقيًا»).
--
-- Evidence base: full live crawl of all 69 published posts (titles +
-- H2 structure + internal links) + scripts/retro-pair-blog.pairs.json
-- pairing records. Three dispositions applied:
--
--   (A) MERGE + 301 — two near-identical-intent duplicates, each with a
--       survivor that subsumes the duplicate's sections:
--         ar  muscle-building-bodyweight-home   → home-muscle-building-guide-no-equipment
--             (both = "complete no-equipment/bodyweight home guide";
--              survivor is the most comprehensive: 10-movement library +
--              weekly table + nutrition + recovery)
--         en  4-week-beginner-hypertrophy-plan  → 4-week-beginner-muscle-building-plan
--             (both = "4-week beginner muscle-building plan"; survivor
--              carries the day-by-day schedule + overview + nutrition +
--              recovery; the hypertrophy angle (overload principles,
--              split design) is already covered inside its sections)
--       Both duplicate rows are UNPAIRED by design (never in pairs.json
--       pairs) — pairing is cleared defensively both ways, idempotent.
--       Content is NOT deleted: rows stay in the table unpublished
--       (same law as 0084); sitemap/RSS/listings drop them automatically;
--       the 301s ship in next.config.ts in the SAME phase.
--
--   (B) REWRITE (title-level) — ar calculate-calories-fat-loss: the H1
--       promised a calories-calculation guide («كيف أحسب السعرات لتقليل
--       الدهون بسرعة») while the BODY delivers an 8-week structured
--       fat-loss program (week 1 BMR → week 8 sleep habits). That title
--       cannibalized the calories intent of the EN-paired
--       calculate-daily-calories-weight-loss. The title now states the
--       article's real primary intent (8-week fat-loss program) — one
--       intent per page, no URL change, no content loss. AR meta budget
--       ≤70 chars respected (blog-meta-title law).
--
--   (C) Broken internal links (audit item 9 verification): three AR
--       bodies linked the Phase-178-merged AR sleep slugs through the
--       WRONG (EN) path — /blog/sleep-{hours-muscle-growth,muscle-
--       recovery-gym} → 404 (the 301s only cover the /ar/ paths).
--       Same replace() pattern as 0084 (D); idempotent LIKE-guarded.
--
-- SLUG LAW: no slug is touched. Pure data UPDATEs.
-- Applied automatically by the Supabase-GitHub integration (Phase 120).
-- ═══════════════════════════════════════════════════════════════════

-- (A1) Unpublish the two consolidated duplicates ----------------------
UPDATE blog_posts
SET is_published = false, updated_at = now()
WHERE language = 'ar' AND slug = 'muscle-building-bodyweight-home';

UPDATE blog_posts
SET is_published = false, updated_at = now()
WHERE language = 'en' AND slug = '4-week-beginner-hypertrophy-plan';

-- (A2) Clear pairing BOTH ways (defensive — both rows are unpaired by
--      design; the guard keeps this idempotent) ------------------------
UPDATE blog_posts
SET linked_post_id = NULL, updated_at = now()
WHERE linked_post_id IN (
  SELECT id FROM blog_posts WHERE slug IN (
    'muscle-building-bodyweight-home',
    '4-week-beginner-hypertrophy-plan'
  )
);
UPDATE blog_posts
SET linked_post_id = NULL, updated_at = now()
WHERE slug IN (
  'muscle-building-bodyweight-home',
  '4-week-beginner-hypertrophy-plan'
)
  AND linked_post_id IS NOT NULL;

-- (B) Title-level rewrite to the article's real primary intent --------
UPDATE blog_posts
SET title = 'برنامج 8 أسابيع لحرق الدهون: خطتك الأسبوعية بالتمارين والسعرات',
    meta_title = 'برنامج 8 أسابيع لحرق الدهون: خطة أسبوعية بالتمارين والسعرات',
    meta_description = 'برنامج 8 أسابيع لحرق الدهون يبدأ بحساب معدل الأيض الأساسي وضبط عجز السعرات، ثم تتبع التقدم وتمارين HIIT منزلية وتغذية عالية البروتين ونوم مستقر أسبوعًا بأسبوع.',
    updated_at = now()
WHERE language = 'ar' AND slug = 'calculate-calories-fat-loss'
  AND title = 'كيف أحسب السعرات لتقليل الدهون بسرعة؟ دليل عملي للمبتدئين';

-- (C1) best-protein-supplement-ramadan: merged-slug link via EN path ---
UPDATE blog_posts
SET content = replace(
    content,
    '](/blog/sleep-muscle-recovery-gym)',
    '](/ar/blog/how-many-hours-sleep-for-muscle-growth)'),
  updated_at = now()
WHERE language = 'ar' AND slug = 'best-protein-supplement-ramadan'
  AND content LIKE '%](/blog/sleep-muscle-recovery-gym)%';

-- (C2) best-protein-supplement-women-ramadan: same defect --------------
UPDATE blog_posts
SET content = replace(
    content,
    '](/blog/sleep-hours-muscle-growth)',
    '](/ar/blog/how-many-hours-sleep-for-muscle-growth)'),
  updated_at = now()
WHERE language = 'ar' AND slug = 'best-protein-supplement-women-ramadan'
  AND content LIKE '%](/blog/sleep-hours-muscle-growth)%';

-- (C3) the merged sleep survivor self-referenced its pre-merge slug ---
--      Repoint to the same-family science article (real value, AR side).
UPDATE blog_posts
SET content = replace(
    content,
    '](/blog/sleep-hours-muscle-growth)',
    '](/ar/blog/sleep-muscle-growth-science)'),
  updated_at = now()
WHERE language = 'ar' AND slug = 'how-many-hours-sleep-for-muscle-growth'
  AND content LIKE '%](/blog/sleep-hours-muscle-growth)%';

-- VERIFY (read-only, run in SQL editor after apply) ---------------------
-- SELECT slug, is_published FROM blog_posts WHERE slug IN
--   ('muscle-building-bodyweight-home','4-week-beginner-hypertrophy-plan');  -- expect: 2 × false
-- SELECT slug, title FROM blog_posts WHERE slug = 'calculate-calories-fat-loss';  -- expect: البرنامج title
-- SELECT count(*) FROM blog_posts WHERE language='ar'
--   AND content LIKE '%](/blog/sleep-%';  -- expect: 0
