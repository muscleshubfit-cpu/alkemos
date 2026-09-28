-- ═══════════════════════════════════════════════════════════════════
-- 0096 — AUDIT_REPORT.md §9-المرحلة 1, item 5 (2026-09-29): the three
-- audit-CONFIRMED cannibalization clusters (F4), treated with a
-- documented editorial decision each (owner order: «نفّذها بالكامل وفق
-- التقرير»). Same data-only law as 0084/0087 — SLUG LAW: no slug is
-- touched, content preserved in-table, everything idempotent.
--
--   (A) UNPUBLISH the 2 duplicate-intent rows (301 redirects ship in
--       next.config.ts in the SAME push — the 178/192 pattern):
--         1. EN calories pair (title Jaccard 0.78 — both articles
--            answer literally «How many calories should I eat to lose
--            weight»). SURVIVOR: calculate-daily-calories-fuel-fat-loss
--            -bulking (exact-match question title + calculator/7-day
--            planner structure; the survivor's bulking planner covers
--            the redirected article's muscle-gain angle). REDIRECTED:
--            calories-to-lose-weight-build-muscle-beginner — it carried
--            the audit's §10.2 keyword-stuffing live evidence («your
--            daily target for "how many calories should i eat to lose
--            weight"») and a scattered structure (workout plan +
--            supplements + belly-fat exercises) overlapping other posts.
--         2. AR program-design pair (same «تصميم برنامج تمارين بناء
--            العضلات في المنزل» intent, near-identical H2 skeletons:
--            تصميم البرنامج/النظام الغذائي/المكملات/الاستشفاء).
--            SURVIVOR: muscle-building-home-workout-guide (دليل خطوة
--            بخطوة — the stronger structured skeleton). REDIRECTED:
--            muscle-building-home-workout-plan — its no-equipment angle
--            is already comprehensively served by home-muscle-building
--            -guide-no-equipment.
--   (B) CLEAR pairing both ways so no hreflang/twin link ever points at
--       an unpublished post (0084 A2 pattern).
--   (C) INTENT DIFFERENTIATION for the EN recovery cluster ×4 (audit
--       F4: four articles sharing the literal title template «How to
--       Use X for Muscle Recovery», similarity 0.62-0.86). Each
--       modality is a DISTINCT long-tail query (foam roller / sauna /
--       red light / contrast therapy) so merging would orphan real
--       intents — the treatment is BREAKING THE SHARED TEMPLATE while
--       keeping each modality's keyword. The four articles' H2
--       skeletons are ALREADY genuinely distinct (mistakes #1-5 /
--       hormone-timing science / 7-day schedule / 4-week progression)
--       — only the title template was shared. New titles match each
--       article's actual structure (all ≤60 chars = the clampMetaTitle
--       EN budget; meta_description values remain accurate for the new
--       titles and are NOT touched; slugs unchanged):
--         red-light   «…: 5 Mistakes to Avoid»   (mistakes intent)
--         sauna       «…: Hormone-Optimizing Timing Guide» (science intent)
--         contrast    «…: The 7-Day Plan»        (plan intent)
--         foam-roller «…: A 4-Week Progression Plan» (program intent)
--   (D) VERIFY — read-only counts.
--
-- The AR «دليل شامل» equipment pair (no-equipment × simple-weights) is
-- deliberately NOT touched: «بدون معدات» and «بأوزان بسيطة» are distinct
-- real search intents (same reasoning as the sleep trio kept in 178) —
-- documented decision, no action. The AR chest pair (chest-muscle-home
-- -workout-guide × chest-muscle-bodyweight-home) was observed during
-- implementation as a CANDIDATE cluster the audit did not measure —
-- left for the owner with this note (no unmeasured action).
--
-- Applied automatically by the Supabase-GitHub integration (Phase 120).
-- ═══════════════════════════════════════════════════════════════════

-- (A) Unpublish the 2 consolidated duplicate-intent posts -----------
UPDATE blog_posts
SET is_published = false, updated_at = now()
WHERE slug IN (
    'calories-to-lose-weight-build-muscle-beginner',  -- EN · 301 → calculate-daily-calories-fuel-fat-loss-bulking
    'muscle-building-home-workout-plan'               -- AR · 301 → muscle-building-home-workout-guide
  )
  AND is_published = true;

-- (B) No hreflang/twin link may point at an unpublished post ---------
UPDATE blog_posts
SET linked_post_id = NULL, updated_at = now()
WHERE linked_post_id IN (
    SELECT id FROM blog_posts
    WHERE slug IN (
        'calories-to-lose-weight-build-muscle-beginner',
        'muscle-building-home-workout-plan'
      )
);

-- (C) Intent differentiation — EN recovery cluster retitles ----------
-- title (the H1) AND meta_title move together (the page <title> rides
-- clampMetaTitle of the same value); slug/og/anchors untouched.
UPDATE blog_posts
SET title = 'Red Light Therapy for Muscle Recovery: 5 Mistakes to Avoid',
    meta_title = 'Red Light Therapy for Muscle Recovery: 5 Mistakes to Avoid',
    updated_at = now()
WHERE slug = 'red-light-therapy-muscle-recovery-mistakes' AND language = 'en';

UPDATE blog_posts
SET title = 'Sauna for Muscle Recovery: Hormone-Optimizing Timing Guide',
    meta_title = 'Sauna for Muscle Recovery: Hormone-Optimizing Timing Guide',
    updated_at = now()
WHERE slug = 'sauna-muscle-recovery-hormone-optimization' AND language = 'en';

UPDATE blog_posts
SET title = 'Contrast Therapy for Muscle Recovery: The 7-Day Plan',
    meta_title = 'Contrast Therapy for Muscle Recovery: The 7-Day Plan',
    updated_at = now()
WHERE slug = 'contrast-therapy-7day-recovery-plan' AND language = 'en';

UPDATE blog_posts
SET title = 'Foam Roller Muscle Recovery: A 4-Week Progression Plan',
    meta_title = 'Foam Roller Muscle Recovery: A 4-Week Progression Plan',
    updated_at = now()
WHERE slug = 'foam-roller-recovery-4-week-guide' AND language = 'en';

-- (D) VERIFY ----------------------------------------------------------
-- Expect: 0 rows still published for the 2 redirected slugs; 4 recovery
-- rows carrying the new titles; 0 linked_post_id pointing at them.
SELECT
  (SELECT count(*) FROM blog_posts
    WHERE slug IN ('calories-to-lose-weight-build-muscle-beginner',
                   'muscle-building-home-workout-plan')
      AND is_published = true) AS redirected_still_published_expect_0,
  (SELECT count(*) FROM blog_posts
    WHERE slug = 'red-light-therapy-muscle-recovery-mistakes'
      AND title = 'Red Light Therapy for Muscle Recovery: 5 Mistakes to Avoid') AS red_light_retitle_expect_1,
  (SELECT count(*) FROM blog_posts
    WHERE slug = 'sauna-muscle-recovery-hormone-optimization'
      AND title = 'Sauna for Muscle Recovery: Hormone-Optimizing Timing Guide') AS sauna_retitle_expect_1,
  (SELECT count(*) FROM blog_posts
    WHERE linked_post_id IN (
      SELECT id FROM blog_posts
      WHERE slug IN ('calories-to-lose-weight-build-muscle-beginner',
                     'muscle-building-home-workout-plan'))) AS dangling_twins_expect_0;
