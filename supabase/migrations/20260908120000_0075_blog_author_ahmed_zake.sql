-- =====================================================================
--  Migration 0075: blog_posts.author → 'Ahmed Zake' (E-E-A-T fix)
--
--  Phase SEO-GEO-4.1 — 2026-09-08
--
--  Context:
--  Phase SEO-GEO-2 (2026-09-08) introduced Ahmed Zake as the canonical
--  Person behind every Article schema's `author` + `reviewedBy` fields.
--  The `resolveAuthor()` helper in src/lib/authors.ts normalizes legacy
--  values ('Alkemos', 'MuscleHub', 'MuscleHubEG') to Ahmed Zake at
--  schema-build time, so the machine-readable JSON-LD was already
--  correct. BUT the visible byline in BlogArticlePage renders
--  `post.author` directly from the DB — so every article displayed
--  "Alkemos" as the author name instead of the human founder's name.
--
--  This migration:
--    1. UPDATEs every existing blog_posts row: author = 'Ahmed Zake'
--       (replaces both legacy 'Alkemos' from 0070 rebrand AND the
--       older 'MuscleHub' from 0013 default — defensive sweep even
--       though 0070 already converted MuscleHub → Alkemos).
--    2. ALTERs the column DEFAULT from 'Alkemos' → 'Ahmed Zake' so
--       any future direct DB insert (ad-hoc SQL, manual row creation)
--       inherits the canonical name without relying on the application
--       layer to set it explicitly.
--
--  The application layer (p5-publish route, BlogEditorView, ai-job-
--  processors) was updated in the same commit to set author: "Ahmed
--  Zake" explicitly — this migration is the DB-side backfill so the
--  61 existing posts immediately display the correct byline.
--
--  Idempotent: safe to re-run. UPDATE is a no-op when author is already
--  'Ahmed Zake'; ALTER COLUMN SET DEFAULT is a no-op when the default
--  is already 'Ahmed Zake'.
--
--  Owner must apply on Supabase SQL Editor (do NOT auto-apply).
--  After applying, run: NOTIFY pgrst, 'reload schema';
--
--  Verification after apply:
--    SELECT author, COUNT(*) FROM blog_posts GROUP BY author;
--    -- Expected: single row → 'Ahmed Zake', 61 (or current post count)
-- =====================================================================

-- 1) Backfill every existing row
UPDATE blog_posts
   SET author = 'Ahmed Zake'
 WHERE author IS DISTINCT FROM 'Ahmed Zake';

-- 2) Change the column default so future direct-DB inserts inherit it
ALTER TABLE public.blog_posts
  ALTER COLUMN author SET DEFAULT 'Ahmed Zake';
