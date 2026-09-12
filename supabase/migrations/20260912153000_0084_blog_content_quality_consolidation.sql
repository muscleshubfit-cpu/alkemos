-- ═══════════════════════════════════════════════════════════════════
-- 0084 — PHASE 178 (SEO-GEO §12.42): content-quality consolidation
-- (owner-approved batch 2026-09-12 «موافق على المقترحات ابدأ تنفيذ كل البنود»)
--
-- Four data-only repairs, all idempotent (replace()/IN-guarded UPDATEs):
--   (A) Unpublish the 5 keyword-cannibalized AR posts — 301 redirects
--       ship in next.config.ts (same phase); sitemap/RSS/listings drop
--       unpublished rows automatically.
--   (B) Complete the 2 dangling "7‑Day" meta_titles (verified against
--       each article's on-page H1).
--   (C) Repair the 14 mid-word-truncated meta_descriptions + excerpts
--       (excerpt shares the same source — readers saw the same cut text
--       as the page intro). Values close the sentence cleanly; derived
--       by the clampMetaDescription law + editorial polish.
--   (D) Strip the 6 raw-search-query stuffing instances from 4 EN
--       article bodies (audit: "(answering *how much protein do i
--       need to build muscle*)" and lowercase query inserts).
--
-- SLUG LAW: no slug is touched. Pure data UPDATEs on published rows.
-- Applied automatically by the Supabase-GitHub integration (Phase 120).
-- ═══════════════════════════════════════════════════════════════════

-- (A1) Unpublish the consolidated posts --------------------------------
UPDATE blog_posts
SET is_published = false, updated_at = now()
WHERE language = 'ar'
  AND slug IN (
    'sleep-recovery-gym-results-3pc8',      -- 301 → sleep-recovery-gym-results
    'sleep-recovery-gym-results-1bbi',      -- 301 → how-many-hours-sleep-for-muscle-growth
    'sleep-hours-muscle-growth',            -- 301 → how-many-hours-sleep-for-muscle-growth
    'sleep-muscle-recovery-gym',            -- 301 → how-many-hours-sleep-for-muscle-growth
    'muscle-building-beginners-step-by-step' -- 301 → how-to-start-muscle-building-beginners
  );

-- (A2) Clear pairing BOTH ways so no hreflang/twin link ever points at
-- an unpublished post (fetchBlogForOG only declares published twins, but
-- the reverse EN row must not keep a dead linked_post_id).
UPDATE blog_posts
SET linked_post_id = NULL, updated_at = now()
WHERE linked_post_id IN (
  SELECT id FROM blog_posts WHERE language = 'ar' AND slug IN (
    'sleep-recovery-gym-results-3pc8',
    'sleep-recovery-gym-results-1bbi',
    'sleep-hours-muscle-growth',
    'sleep-muscle-recovery-gym',
    'muscle-building-beginners-step-by-step'
  )
);
UPDATE blog_posts
SET linked_post_id = NULL, updated_at = now()
WHERE language = 'ar'
  AND slug IN (
    'sleep-recovery-gym-results-3pc8',
    'sleep-recovery-gym-results-1bbi',
    'sleep-hours-muscle-growth',
    'sleep-muscle-recovery-gym',
    'muscle-building-beginners-step-by-step'
  )
  AND linked_post_id IS NOT NULL;

-- (B) Dangling-title completions ----------------------------------------
UPDATE blog_posts
SET meta_title = 'How much protein per day to build muscle? 7‑Day Plan',
    updated_at = now()
WHERE language = 'en' AND slug = 'protein-per-day-muscle-build-plan';

UPDATE blog_posts
SET meta_title = 'How many calories should I eat to lose weight? 7‑Day Plan',
    updated_at = now()
WHERE language = 'en' AND slug = 'calculate-daily-calories-fuel-fat-loss-bulking';

-- (C) Mid-word-truncated descriptions + excerpts (14 rows) -------------
-- Same value stored twice: meta_description (SERP/OG) + excerpt (the
-- visible page intro + RSS summary — readers saw the mid-word cut too).
UPDATE blog_posts SET meta_description = 'Discover the best muscle building workout plan with a 4‑day split that maximizes hypertrophy, speeds up fat loss, and includes nutrition, recovery tips.',
  excerpt = 'Discover the best muscle building workout plan with a 4‑day split that maximizes hypertrophy, speeds up fat loss, and includes nutrition, recovery tips.',
  updated_at = now()
WHERE language = 'en' AND slug = '4-day-split-hypertrophy-fat-loss';

UPDATE blog_posts SET meta_description = 'Discover the truth behind pre‑workout myths for night sessions, learn science‑backed nutrition strategies, and get practical tips for evening training.',
  excerpt = 'Discover the truth behind pre‑workout myths for night sessions, learn science‑backed nutrition strategies, and get practical tips for evening training.',
  updated_at = now()
WHERE language = 'en' AND slug = 'optimize-preworkout-nutrition-evening-training';

UPDATE blog_posts SET meta_description = 'Discover a science‑backed 4‑day upper/lower hypertrophy split with progressive overload templates, macro tracking, supplement guides, and recovery strategies.',
  excerpt = 'Discover a science‑backed 4‑day upper/lower hypertrophy split with progressive overload templates, macro tracking, supplement guides, and recovery strategies.',
  updated_at = now()
WHERE language = 'en' AND slug = '4-day-upper-lower-hypertrophy-split';

UPDATE blog_posts SET meta_description = 'Learn how to use intermittent fasting for muscle gain with a step‑by‑step fasted workout schedule, carb timing, recovery supplements, and injury‑prevention.',
  excerpt = 'Learn how to use intermittent fasting for muscle gain with a step‑by‑step fasted workout schedule, carb timing, recovery supplements, and injury‑prevention.',
  updated_at = now()
WHERE language = 'en' AND slug = 'intermittent-fasting-muscle-gain-workout-plan';

UPDATE blog_posts SET meta_description = 'Discover how to lose belly fat fast with a science‑backed 8‑week plan. Includes muscle building workout plan, macro calculator, and fasting tips.',
  excerpt = 'Discover how to lose belly fat fast with a science‑backed 8‑week plan. Includes muscle building workout plan, macro calculator, and fasting tips.',
  updated_at = now()
WHERE language = 'en' AND slug = 'science-backed-belly-fat-loss-8-weeks';

UPDATE blog_posts SET meta_description = 'Learn how to macro‑track and meal prep for fat loss on a 1800‑calorie diet. Get macro ratios, grocery lists, prep tips, and training guidance.',
  excerpt = 'Learn how to macro‑track and meal prep for fat loss on a 1800‑calorie diet. Get macro ratios, grocery lists, prep tips, and training guidance.',
  updated_at = now()
WHERE language = 'en' AND slug = 'macro-tracking-meal-prep-1800-fat-loss';

UPDATE blog_posts SET meta_description = 'Discover a science‑backed fat loss diet plan using calorie cycling and high‑protein meals, plus macro tips, intermittent fasting, and recovery hacks.',
  excerpt = 'Discover a science‑backed fat loss diet plan using calorie cycling and high‑protein meals, plus macro tips, intermittent fasting, and recovery hacks.',
  updated_at = now()
WHERE language = 'en' AND slug = 'calorie-cycling-fat-loss-diet';

UPDATE blog_posts SET meta_description = 'Discover the science‑backed method to structure a deload week for strength gains, bust common myths, and follow a step‑by‑step plan.',
  excerpt = 'Discover the science‑backed method to structure a deload week for strength gains, bust common myths, and follow a step‑by‑step plan.',
  updated_at = now()
WHERE language = 'en' AND slug = 'deload-week-structure-strength-gains';

UPDATE blog_posts SET meta_description = 'Discover 4 weight‑free progressive overload techniques to smash training plateaus, boost muscle growth, and keep gains moving without adding more load.',
  excerpt = 'Discover 4 weight‑free progressive overload techniques to smash training plateaus, boost muscle growth, and keep gains moving without adding more load.',
  updated_at = now()
WHERE language = 'en' AND slug = 'progressive-overload-no-weight';

UPDATE blog_posts SET meta_description = 'Discover the best muscle building workout plan with a 4‑week beginner hypertrophy program. Learn progressive overload, nutrition, cardio, and recovery.',
  excerpt = 'Discover the best muscle building workout plan with a 4‑week beginner hypertrophy program. Learn progressive overload, nutrition, cardio, and recovery.',
  updated_at = now()
WHERE language = 'en' AND slug = '4-week-beginner-hypertrophy-plan';

UPDATE blog_posts SET meta_description = 'اكتشف الدليل الكامل للإجابة على سؤال كيف أبدأ بناء العضلات للمبتدئين خطوة بخطوة، مع شرح مبسط للآلية، الأدلة العلمية، وخطة تطبيق عملية.',
  excerpt = 'اكتشف الدليل الكامل للإجابة على سؤال كيف أبدأ بناء العضلات للمبتدئين خطوة بخطوة، مع شرح مبسط للآلية، الأدلة العلمية، وخطة تطبيق عملية.',
  updated_at = now()
WHERE language = 'ar' AND slug = 'how-to-start-muscle-building-beginners';

UPDATE blog_posts SET meta_description = 'اكتشفي دليلنا الشامل لتصميم برنامج تمارين بناء العضلات في المنزل للنساء، مع خطة غذائية لحرق الدهون، مكملات بروتين موثوقة، ونصائح استشفاء فعّالة.',
  excerpt = 'اكتشفي دليلنا الشامل لتصميم برنامج تمارين بناء العضلات في المنزل للنساء، مع خطة غذائية لحرق الدهون، مكملات بروتين موثوقة، ونصائح استشفاء فعّالة.',
  updated_at = now()
WHERE language = 'ar' AND slug = 'women-bodyweight-muscle-workout';

UPDATE blog_posts SET meta_description = 'اكتشفي ما هو أفضل مكمل بروتين للنساء في رمضان بعد التمرين، مع توجيهات حول الجرعة المثالية، توقيت الاستهلاك، واختيار بين مصل اللبن والصويا.',
  excerpt = 'اكتشفي ما هو أفضل مكمل بروتين للنساء في رمضان بعد التمرين، مع توجيهات حول الجرعة المثالية، توقيت الاستهلاك، واختيار بين مصل اللبن والصويا.',
  updated_at = now()
WHERE language = 'ar' AND slug = 'best-protein-supplement-women-ramadan';

UPDATE blog_posts SET meta_description = 'اكتشف كيف تختار مكمل كرياتين للرياضيين المناسب للمبتدئين وتتابع تقدمك خطوة بخطوة خلال 6 أسابيع، مع نصائح الصيام المتقطع، تمارين الظهر، ونظام غذائي نباتي.',
  excerpt = 'اكتشف كيف تختار مكمل كرياتين للرياضيين المناسب للمبتدئين وتتابع تقدمك خطوة بخطوة خلال 6 أسابيع، مع نصائح الصيام المتقطع، تمارين الظهر، ونظام غذائي نباتي.',
  updated_at = now()
WHERE language = 'ar' AND slug = 'creatine-beginners-guide';

-- (D) Raw-query keyword-stuffing cleanup (4 EN bodies, 6 patches) ------
UPDATE blog_posts SET content = replace(
    content,
    ' (answering *how much protein do i need to build muscle*)',
    ''),
  updated_at = now()
WHERE language = 'en' AND slug = 'deload-week-structure-strength-gains';

UPDATE blog_posts SET content = replace(
    content,
    'this answers "how much protein do i need to build muscle per day" and protects lean mass',
    'this answers your daily protein needs and protects lean mass'),
  updated_at = now()
WHERE language = 'en' AND slug = 'calories-to-lose-weight-build-muscle-beginner';

UPDATE blog_posts SET content = replace(
    content,
    'this also supports the **how much protein do i need to build muscle per day** target',
    'this also supports your daily protein target'),
  updated_at = now()
WHERE language = 'en' AND slug = 'sleep-better-faster-gym-results';

UPDATE blog_posts SET content = replace(
    replace(
      content,
      'high enough to answer **[how much protein do i need to build muscle](/blog/protein-per-day-muscle-build-plan)**',
      'high enough to hit **[daily protein targets](/blog/protein-per-day-muscle-build-plan)**'),
    '**How much protein do i need to build muscle?**',
    '**How much protein do I need to build muscle?**'),
  updated_at = now()
WHERE language = 'en' AND slug = 'how-to-periodize-nutrition-body-recomposition';

-- VERIFY (read-only, run in SQL editor after apply) ---------------------
-- SELECT slug, is_published FROM blog_posts WHERE language='ar' AND slug IN
--   ('sleep-recovery-gym-results-3pc8','sleep-recovery-gym-results-1bbi',
--    'sleep-hours-muscle-growth','sleep-muscle-recovery-gym',
--    'muscle-building-beginners-step-by-step');  -- expect: 5 × false
-- SELECT count(*) FROM blog_posts
--   WHERE (meta_description ~ '[^.!؟?…]$' AND length(meta_description) > 140)
--     OR meta_description LIKE '%do i need%';  -- expect: 0
