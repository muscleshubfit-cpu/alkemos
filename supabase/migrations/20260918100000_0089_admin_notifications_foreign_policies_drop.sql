-- ============================================================================
-- 20260918100000_0089_admin_notifications_foreign_policies_drop.sql
-- 0089 — PHASE 226 / C1 completion (follow-up to 0088 — same owner order
--        2026-09-18, conditional clause now satisfied): drop the THREE
--        PROVEN-foreign policies that kept the C1 leak alive after 0088.
--
-- EVIDENCE — the owner's 225 clause is now MET:
--   The 225 order: «لا تستخدم defensive sweep لحذف Policies غير معروفة إلا
--   إذا أثبت التشخيص أنها دخيلة» — sweep forbidden UNLESS the diagnostics
--   PROVE the policies foreign. The post-push live verification (T1–T6,
--   2026-09-18) supplied the proof:
--   T1 ✓  0088 applied (supabase_migrations: 20260917210000 present).
--   T2 ✗  D2 printed SIX policies: the three CANONICAL ones correctly
--         restored by 0088 (restrictive 0030C wording — verified verbatim)
--         PLUS three FOREIGN ones:
--           admin_notif_select  (SELECT, TO {public}, USING is_coach())
--           admin_notif_insert  (INSERT, TO {public}, WITH CHECK true)
--           admin_notif_update  (UPDATE, TO {public}, USING is_coach())
--   T3 ✗  C1 leak metric STILL LIVE: simulated authenticated non-admin
--         coach (qa.audit224.coach1, id e2de698e-a14a-4674-bc35-1bb511b3fbb1)
--         still sees 38 rows targeted at OTHER coaches (PII emails, payment
--         requests). Permissive RLS policies OR together — the wide foreign
--         select kept the leak alive despite the restored canonical policy.
--   FOREIGN-PROOF (all three, by name):
--     - the names appear in ZERO repo files (grep across *.sql/*.ts/*.md);
--     - the names NEVER existed in ANY commit (git log -S = empty for each);
--     - repo migration 0003 itself works with admin_notifs_*_coach (plural
--       + _coach suffix) — the foreign singular admin_notif_* spelling was
--       never the repo's;
--     - TO {public} is wider than every repo policy on this table (all are
--       TO authenticated) — no repo file ever granted the public-role access;
--     - admin_notif_insert carries WITH CHECK true = ANY role may insert —
--       nothing in the repo ever allowed that.
--   They are exactly the "probable live variant: the 0003-era bare
--   is_coach() wording" the 0088 header suspected — now PROVEN by name.
--
-- WHAT THIS FILE DOES (C1 completion — nothing else):
--   1. drop the three proven-foreign policies (idempotent)
--   2. read-only diagnostics re-print (D1/D2) so the migration run log
--      shows the post-drop state = exactly the three canonical policies
--   3. NOTIFY pgrst, 'reload schema'
--
-- WHAT IT DELIBERATELY DOES NOT DO:
--   - NO other table touched (C1 scope = admin_notifications only — §12.10)
--   - NO data change, NO app-code change, NO canonical policy change
--     (0088 already restored them — verified live, restrictive verbatim)
--
-- COVERAGE CHECK (why dropping loses nothing legitimate):
--   is_coach() == is_staff() == role IN ('coach','admin') (0029B contract),
--   so the canonical select (is_admin() OR (is_staff() AND (null OR own)))
--   covers every staff reader the foreign policy covered — minus the leak.
--   The only browser reader under these policies is the staff bell
--   (listAdminNotifications) whose design needs exactly the canonical scope.
--   Insert paths are service-role (bypass RLS by design) — untouched.
--
-- Idempotent: safe to re-run. Auto-applied by the Supabase–GitHub
-- integration when this commit lands on main (0056/0088 precedent).
-- ============================================================================

-- ============================================================================
-- 1) Drop the three PROVEN-foreign policies (idempotent)
-- ============================================================================

drop policy if exists admin_notif_select on public.admin_notifications;
drop policy if exists admin_notif_insert on public.admin_notifications;
drop policy if exists admin_notif_update on public.admin_notifications;

-- ============================================================================
-- READ-ONLY DIAGNOSTICS (post-drop log evidence — writes NOTHING)
-- ============================================================================

-- D1 — object kind + RLS flag (must stay: relkind r, rls_enabled t)
select c.relname as object, c.relkind, c.relrowsecurity as rls_enabled,
       c.relforcerowsecurity as rls_forced
from pg_class c
join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public' and c.relname = 'admin_notifications';

-- D2 — every policy on the table (post-drop expectation: EXACTLY the three
--       canonical names restored by 0088 — anything else would still be
--       foreign and would prove itself here)
select policyname, cmd, roles, qual, with_check
from pg_policies
where schemaname = 'public' and tablename = 'admin_notifications'
order by policyname;

notify pgrst, 'reload schema';

-- ============================================================================
-- VERIFY (post-apply expectation):
--   D2: exactly 3 policies — admin_notifs_{select,insert,update}_coach
--   A logged-in non-admin coach: SELECT rows where target_coach_id is not
--   null and <> auth.uid() returns 0 rows (the C1 leak metric — finally
--   closed). Coach still sees own rows + legacy broadcast (null) rows.
-- ============================================================================
