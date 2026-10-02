-- ═══════════════════════════════════════════════════════════════════
-- 0100 — W2-1a (P-03) NOTIFICATIONS BELL INDEX + RETENTION PRUNE
-- (2026-10-03)
-- ═══════════════════════════════════════════════════════════════════
-- Full-stack audit 2026-10-02, finding P-03 (docs/
-- FULL-STACK-AUDIT-AND-REMEDIATION-PLAN-2026-10-02.md §4.4 + wave row
-- §6.3 W2-1a, owner order 2026-10-03 «نفذ البند التالى»): the
-- notifications table carries ZERO indexes (the 112-migration sweep
-- found none — its admin twin got one in 0030C) while the client bell
-- reads `.eq(user_id).order(created_at desc).limit(20)` on every load
-- (src/lib/data/notifications.ts) — a growing sequential scan per bell
-- on a table that grows monotonically (open operations insert rows)
-- with NO pruning anywhere. (W2-1a was renumbered from the plan's
-- 0099 — W1-2c took that number first.)
--
-- THE FIX — two additive parts, both in this one frame:
--
--   1. Composite index (user_id, created_at DESC) — the plan's literal
--      fix direction. The user_id leading column serves BOTH the
--      bell's read (eq + order + limit 20 → index range scan per user,
--      independent of table size) and the mark-all-read update filter
--      (.eq(user_id).eq(read,false)).
--
--   2. prune_notifications(retention) RPC + weekly runner — the
--      retention POLICY. Rows older than the window are dead weight
--      (the bell renders the latest 20 only). Default 90 days,
--      clamped to [7, 3650] so a fat-fingered 0/negative can never
--      nuke fresh rows and a typo can't ask for a century. The runner
--      (scripts/notifications-prune.mjs via .github/workflows/
--      notifications-prune.yml — weekly Saturday 03:17 UTC, the lean
--      db-backup node pattern) rides the SAME secrets
--      evo-weekly-eval/db-backup already carry; nothing new to
--      provision. A missed schedule is BENIGN by design: the prune
--      catches up next week and the index keeps every bell read fast
--      regardless of table size.
--
-- Service-role only door (the 0098 capture_paypal_subscription
-- pattern) — the runner carries the service key; PUBLIC execute
-- revoked. The service_role retains EXECUTE on schema functions after
-- the revoke (Supabase default privileges — live-proven by
-- extend_subscription: revoked from public in 0042, called with
-- supabaseAdmin by /api/coach/subscriptions/activate ever since).
--
-- Idempotent. Applied automatically by the Supabase-GitHub
-- integration (Phase 120). Rollback: revert the commit + drop the
-- index and the RPC manually (both additive, zero data touched by
-- the schema parts — the prune only ever removes rows PAST the
-- retention window).
-- ═══════════════════════════════════════════════════════════════════

-- ============================================================
-- PART 1 — the bell index (the audit's literal fix direction)
-- ============================================================
create index if not exists idx_notifications_user_created_desc
  on public.notifications (user_id, created_at desc);

-- ============================================================
-- PART 2 — prune_notifications(): the retention policy as an RPC.
-- SECURITY DEFINER + pinned search_path (0042/0098 pattern).
-- Age-based retention only — no per-user reshaping, no RLS change,
-- no trigger on the hot insert path. Returns the deleted row count
-- (the runner's observability: the workflow log records it).
-- ============================================================
create or replace function public.prune_notifications(
  p_retention_days int default 90
)
returns int
language plpgsql
security definer
set search_path = public
as $$
declare
  v_days    int;
  v_deleted int;
begin
  -- Service-role only (0098 door pattern — the workflow runner is
  -- the sole caller, carrying SUPABASE_SERVICE_ROLE_KEY).
  if coalesce((current_setting('request.jwt.claims', true)::jsonb)->>'role', '')
     <> 'service_role' then
    raise exception 'prune_notifications: service role only';
  end if;

  -- Clamp the window: floor 7 days (a 0/negative can never nuke
  -- fresh rows), ceiling 3650 days (10 years — the honest maximum).
  v_days := least(greatest(coalesce(p_retention_days, 90), 7), 3650);

  delete from public.notifications
  where created_at < now() - make_interval(days => v_days);

  get diagnostics v_deleted = ROW_COUNT;
  return v_deleted;
end;
$$;

-- No implicit PUBLIC execute on the maintenance RPC (0042/0098
-- hygiene pattern — service_role keeps EXECUTE via the platform's
-- default privileges).
revoke execute on function public.prune_notifications(int) from public;

notify pgrst, 'reload schema';

-- ============================================================
-- VERIFY (read-only) — expect: bell_index=t | rpc_service_role_only=t
-- | rpc_clamped=t  (all three false/absent = the migration did not
-- land — check the Supabase integration run before anything else)
-- ============================================================
select
  (select exists (select 1 from pg_indexes
     where schemaname = 'public'
       and tablename = 'notifications'
       and indexname = 'idx_notifications_user_created_desc'))
    as bell_index,

  (select position('prune_notifications: service role only' in
     coalesce(pg_get_functiondef('public.prune_notifications(int)'::regprocedure), '')) > 0)
    as rpc_service_role_only,

  (select position('least(greatest(coalesce(p_retention_days, 90), 7), 3650)' in
     coalesce(pg_get_functiondef('public.prune_notifications(int)'::regprocedure), '')) > 0)
    as rpc_clamped;

-- END OF SCRIPT 0100
