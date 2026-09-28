-- ═══════════════════════════════════════════════════════════════════
-- 0097 — AUDIT_REPORT.md §9-المرحلة 2, item 1 (2026-09-29): the OWNER
-- REVIEW WORKFLOW. The audit measured (C2/F2) that EVERY published
-- article carried a false E-E-A-T surface: "Reviewed by Ahmed Zake" +
-- "Last reviewed" = the publish date, while P5 publishes with ZERO
-- human review. This migration gives blog_posts the honest state:
--
--   review_status    'pending'  → published, awaiting the owner's review
--                    'reviewed' → the owner actually read/approved it
--   last_reviewed_at the REAL review timestamp — set ONLY by the
--                    admin-gated review action (POST /api/admin/blog/review)
--                    or the owner's own manual publish/edit in the admin
--                    editor. NEVER set automatically.
--
-- Render honesty (same commit): the byline shows "AI-generated · medical
-- review pending" until reviewed; the Article schema OMITS reviewedBy/
-- lastReviewed until a real review exists (seo.ts law).
--
-- Backfill honesty: every existing published row defaults to 'pending'
-- — that is the TRUE state (none of them was human-reviewed). The owner
-- reviews them from the admin blog dashboard; each approval flips the
-- row and stamps last_reviewed_at.
--
-- Applied automatically by the Supabase-GitHub integration (Phase 120).
-- Schema-only + additive: no data rewrite, no RLS change (the columns
-- ride the existing blog_posts policies; the sanctioned write paths are
-- the admin-gated API route and the coach-editor session, same as
-- is_published today).
-- ═══════════════════════════════════════════════════════════════════

-- 1) The review state columns (idempotent, additive) ------------------
alter table public.blog_posts
  add column if not exists review_status text not null default 'pending';

alter table public.blog_posts
  add column if not exists last_reviewed_at timestamptz;

-- Constrain to the two legal states (fail-closed on garbage writes).
-- Existing rows are all 'pending' (the honest default) — the CHECK is
-- satisfied by construction; guarded with NOT VALID-free plain form so
-- the integration applies it in one pass.
do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'blog_posts_review_status_check'
  ) then
    alter table public.blog_posts
      add constraint blog_posts_review_status_check
      check (review_status in ('pending', 'reviewed'));
  end if;
end $$;

-- 2) The owner's pending-review worklist index ------------------------
-- The admin dashboard lists PUBLISHED + pending rows newest-first; a
-- partial index keeps that list one cheap scan forever.
create index if not exists blog_posts_pending_review_idx
  on public.blog_posts (published_at desc)
  where review_status = 'pending' and is_published = true;

-- 3) VERIFY (read-only) -----------------------------------------------
select
  count(*) filter (where is_published)                                        as published_total,
  count(*) filter (where is_published and review_status = 'pending')          as published_pending_review,
  count(*) filter (where last_reviewed_at is not null)                        as with_real_review_date
from public.blog_posts;
