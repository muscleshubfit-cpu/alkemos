-- ============================================================================
-- 20260917210000_0088_admin_notifications_rls_restore.sql
-- 0088 — PHASE 225 / C1 fix (UX-audit 2026-09-18, owner order «نفّذ إصلاح C1
--        الآن… طبّق migration 0088 وفق الخطة المعتمدة»): restore the
--        restrictive admin_notifications RLS policies on the live DB.
--
-- ROOT CAUSE (docs/DEEP-UX-AUDIT-REPORT-2026-09-18.md — C1):
--   The repo's intended final state (last-writer-wins, defined identically in
--   RUN_ON_SUPABASE_0030C_MULTI_COACH_ADMIN_RLS_NOTIFS.sql:146-174 and
--   restored by 0056 = 20260901120000_restore_rls_after_incident_and_drop_probe.sql:265-294)
--   was NOT what production was enforcing: a fresh B2B coach read 38 rows
--   targeted at OTHER coaches (new clients with full emails = PII, payment
--   requests, new tickets) + the mark-all-read blanket UPDATE reached rows
--   he does not own. Verified live pre-fix (QA account qa.c1fix.coach1,
--   2026-09-17 20:5x UTC): 75 visible rows = 38 others + 35 legacy broadcast
--   + 2 own. The live policy is wider than the repo definition (same drift
--   class as the Phase 61 incident — probable live variant: the 0003-era
--   bare is_coach() wording).
--
-- WHAT THIS FILE DOES (minimal fix — approved plan, nothing else):
--   1. ensure RLS is enabled (idempotent; covers the disabled-RLS variant)
--   2. drop + recreate the THREE canonical policies with the 0030C wording
--      VERBATIM (admin_notifs_select_coach / _insert_coach / _update_coach)
--   3. read-only diagnostics at the end (policies/rules/triggers/columns) —
--      the output lands in the migration run log for the owner
--   4. NOTIFY pgrst, 'reload schema'
--
-- WHAT IT DELIBERATELY DOES NOT DO (owner directive 2026-09-18):
--   - NO sweep/deletion of unknown-named policies: permissive RLS policies
--     OR together, so a foreign wide policy would survive this restore —
--     the diagnostics section prints every policy on the table so any
--     foreign one is PROVEN from the run log before a follow-up decision.
--   - NO changes to data, triggers, rules, or any other table.
--   - NO app-code change (the bell's select("*") relies on RLS by design).
--
-- SIDE FINDING (pre-existing, documented in the 225 worklog, NOT fixed here
-- — out of C1 scope): every REST UPDATE on admin_notifications currently
-- fails with 23502 (not-null on type/title/… even when the payload does not
-- touch them) for ALL callers including owners — a live rewriting object
-- (rule/trigger) outside the repo is suspected; the read-only diagnostics
-- below dump pg_rules + pg_trigger so the owner can see it from the log.
--
-- Idempotent: safe to re-run. Auto-applied by the Supabase–GitHub
-- integration when this commit lands on main (0056 precedent — same
-- restore class).
-- ============================================================================

-- ---------- 1) RLS must be on (defensive, idempotent) ----------
alter table public.admin_notifications enable row level security;

-- ---------- 2) SELECT: admin sees all; staff sees legacy broadcast (null)
--               + rows targeted at themselves — 0030C verbatim ----------
drop policy if exists admin_notifs_select_coach on public.admin_notifications;
create policy admin_notifs_select_coach
  on public.admin_notifications for select
  to authenticated
  using (
    public.is_admin()
    or (
      public.is_staff()
      and (target_coach_id is null or target_coach_id = auth.uid())
    )
  );

-- ---------- 3) INSERT: staff only — 0030C verbatim ----------
drop policy if exists admin_notifs_insert_coach on public.admin_notifications;
create policy admin_notifs_insert_coach
  on public.admin_notifications for insert
  to authenticated
  with check (public.is_staff());

-- ---------- 4) UPDATE: admin any; staff = broadcast + own rows — 0030C verbatim ----------
drop policy if exists admin_notifs_update_coach on public.admin_notifications;
create policy admin_notifs_update_coach
  on public.admin_notifications for update
  to authenticated
  using (
    public.is_admin()
    or (
      public.is_staff()
      and (target_coach_id is null or target_coach_id = auth.uid())
    )
  );

-- ============================================================================
-- READ-ONLY DIAGNOSTICS (owner log evidence — writes NOTHING)
-- ============================================================================

-- D1 — object kind + RLS flag (r = ordinary table, v = view)
select c.relname as object, c.relkind, c.relrowsecurity as rls_enabled,
       c.relforcerowsecurity as rls_forced
from pg_class c
join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public' and c.relname = 'admin_notifications';

-- D2 — every policy on the table (canonical = exactly the three names above;
--       anything else is a foreign policy and, being permissive, would keep
--       the leak alive — a follow-up owner decision, not swept here)
select policyname, cmd, roles, qual, with_check
from pg_policies
where schemaname = 'public' and tablename = 'admin_notifications'
order by policyname;

-- D3 — rules (UPDATE-rewrite suspicion from the 23502 side finding)
-- (pg_rules is a view — no oid column — so we read its own definition column)
select r.rulename, r.definition
from pg_rules r
where r.tablename = 'admin_notifications' and r.schemaname = 'public';

-- D4 — triggers on the table
select t.tgname, pg_get_triggerdef(t.oid) as definition
from pg_trigger t
join pg_class c on c.oid = t.tgrelid
join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public' and c.relname = 'admin_notifications'
  and not t.tgisinternal;

-- D5 — column inventory (NOT NULL / defaults — 23502 context)
select column_name, data_type, is_nullable, column_default
from information_schema.columns
where table_schema = 'public' and table_name = 'admin_notifications'
order by ordinal_position;

notify pgrst, 'reload schema';

-- ============================================================================
-- VERIFY (post-apply expectation):
--   D1: relkind = r, rls_enabled = t
--   D2: exactly 3 policies, names = admin_notifs_{select,insert,update}_coach
--   A logged-in coach (non-admin): SELECT rows where target_coach_id is not
--   null and <> auth.uid() returns 0 rows (the C1 leak metric).
-- ============================================================================
