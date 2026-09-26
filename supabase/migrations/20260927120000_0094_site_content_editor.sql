-- ============================================================================
-- 20260927120000_0094_site_content_editor.sql
-- 0094 — SITE-CONTENT-281: the Supabase-backed site-content editor
-- ============================================================================
-- WHY (owner task order 2026-09-27 «Implement the recommended Site Content
--   editor in the existing Alkemos admin»):
--   The site's static marketing copy (homepage sections + about/privacy/
--   terms/FAQ pages) was welded into TSX literals. Every wording change
--   required a GitHub commit → full CI run → full Vercel rebuild on a
--   Hobby plan already over its storage quota. This migration introduces
--   the ONE table the in-house admin editor reads/writes, so wording
--   changes become an instant admin save (ISR revalidate = 300 s, the
--   blog precedent) with ZERO deploys.
--
-- WHAT THIS FILE DOES (additive only — owner pre-approved the RLS per
--   AGENTS.md §7 in the same task order):
--   1. create public.site_content (key PK + per-locale jsonb values +
--      audit columns). NULL value = «use the code default» — a missing
--      row can never blank a page (the fallback law).
--   2. RLS enabled + THREE policies: public SELECT (anon included — the
--      marketing site renders server-side with the anon key, exactly the
--      blog_posts public-read pattern), and admin-only INSERT / UPDATE /
--      DELETE via the canonical public.is_admin() predicate (0029B).
--   3. A BEFORE INSERT/UPDATE touch trigger stamps updated_at + updated_by
--      (auth.uid()) — the audit trail the admin editor surfaces per field.
--   4. NOTIFY pgrst to reload the schema.
--
-- WHAT IT DELIBERATELY DOES NOT DO:
--   - No seed rows: the code registry is the default source; the table
--     starts EMPTY and the site renders from defaults until the owner
--     saves an override (fail-safe by construction).
--   - No changes to blog_posts / coach_pages or any existing table,
--     policy, trigger, or function.
--
-- Idempotent: safe to re-run. Auto-applied by the Supabase–GitHub
-- integration when this commit lands on main (Phase 120 law).
-- ============================================================================

-- ---------- 1) The table (additive) ----------
create table if not exists public.site_content (
  key         text primary key,
  value_en    jsonb,
  value_ar    jsonb,
  updated_at  timestamptz not null default now(),
  updated_by  uuid references auth.users (id) on delete set null
);

-- ---------- 2) RLS: public read, admin-only writes ----------
alter table public.site_content enable row level security;

-- Public read — the marketing site fetches overrides with the anon key
-- (same trust model as published blog_posts: no PII, public copy only).
drop policy if exists site_content_public_read on public.site_content;
create policy site_content_public_read
  on public.site_content for select
  to anon, authenticated
  using (true);

-- Admin-only writes — the canonical 0029B predicate (never a role literal).
drop policy if exists site_content_admin_insert on public.site_content;
create policy site_content_admin_insert
  on public.site_content for insert
  to authenticated
  with check (public.is_admin());

drop policy if exists site_content_admin_update on public.site_content;
create policy site_content_admin_update
  on public.site_content for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- DELETE = «reset this key to its code default» (the admin editor's
-- reset button) — admin-only, same predicate.
drop policy if exists site_content_admin_delete on public.site_content;
create policy site_content_admin_delete
  on public.site_content for delete
  to authenticated
  using (public.is_admin());

-- ---------- 3) Audit stamp (updated_at + updated_by, server-side) ----------
create or replace function public.site_content_touch()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  new.updated_at := now();
  new.updated_by := auth.uid();
  return new;
end;
$$;

drop trigger if exists site_content_touch on public.site_content;
create trigger site_content_touch
  before insert or update on public.site_content
  for each row execute function public.site_content_touch();

-- ---------- 4) PostgREST schema reload ----------
notify pgrst, 'reload schema';

-- VERIFY (SQL Editor — no login session needed):
--   select key, value_en is not null as has_en, value_ar is not null as has_ar,
--          updated_at, updated_by
--     from public.site_content order by key;
--   -- expected: 0 rows on a fresh install (the code registry is the default).
--   --
--   select policyname, cmd from pg_policies
--    where schemaname='public' and tablename='site_content' order by policyname;
--   -- expected 4 rows:
--   --   site_content_admin_delete | DELETE
--   --   site_content_admin_insert | INSERT
--   --   site_content_admin_update | UPDATE
--   --   site_content_public_read  | SELECT
