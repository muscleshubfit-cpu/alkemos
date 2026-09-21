-- ============================================================================
-- 0092 — coach invite-pending visibility (UX-TEST-REPORT-2026-09-21 m-C + m-D)
-- ============================================================================
-- WHY (the live evidence, docs/UX-TEST-VERIFICATION-ROUND2-2026-09-21.md §4):
--   After a coach invites a client, the invited client appears in the coach
--   console immediately (profiles row exists — the invite creates it), but
--   the coach cannot distinguish «invited, never joined» from a real
--   no-subscription client (m-C). Worse, the dashboard counters lied:
--   «Total clients: 0» while the filter «No subscription: 1» and a visible
--   row were on the same screen (m-D). m-D has TWO layers:
--     (1) UI staleness — getCoachClientStats() loads once on mount and is
--         never refreshed after an invite (fixed in CoachView, same frame).
--     (2) This migration makes the invite state VISIBLE in the data layer:
--         a pending-invite marker on every list row + a dedicated counter,
--         so the coach's numbers and his eyes finally agree.
--
-- WHAT (additive only — both functions keep their EXACT signatures):
--   * get_coach_client_list_paged: + `invite_pending boolean` column and a
--     new p_filter value 'invite_pending'.
--   * get_coach_client_stats: + `pending_invites bigint` column.
--
-- THE MARKER (same law the H1-2026 adoption gate is built on):
--   invite_pending := the auth row was created by inviteUserByEmail
--   (encrypted_password='') AND the client has NEVER signed in
--   (last_sign_in_at is null). Any real signup, adoption via
--   /api/auth/complete-invite, email-link activation, or OAuth sign-in sets
--   a password or a last_sign_in_at — so the flag flips to false the moment
--   the client actually joins, and it can NEVER be true for a
--   self-registered or activated account. The security-definer functions
--   (owner: postgres) read auth.users internally; only the derived boolean
--   is exposed — no auth column leaves the database.
--
-- SCOPE/SAFETY: drop + create end to end (0072 pattern, idempotent).
--   No table is touched. No RLS touched. No money path touched. Signature
--   and argument defaults unchanged → zero caller breakage; existing
--   callers simply ignore the new columns until wired.
-- ============================================================================

-- ---------------------------------------------------------------
-- get_coach_client_list_paged — 0092: + invite_pending (column + filter)
-- ---------------------------------------------------------------
drop function if exists public.get_coach_client_list_paged(int, int, text, text, text, text);
create or replace function public.get_coach_client_list_paged(
  p_limit   int  default 25,
  p_offset  int  default 0,
  p_search  text default null,
  p_filter  text default 'all',    -- all|active|expiring|expired|no_plan|no_questionnaire|pending_payment|premium|pro|coaching|invite_pending
  p_segment text default 'all',    -- admin split: all|coach|site (coach = REAL coach, 0068 gate)
  p_sort    text default 'newest'  -- newest|oldest|name|expiry
)
returns table (
  client_id uuid,
  client_email text,
  client_full_name text,
  client_phone text,
  client_avatar_url text,
  client_created_at timestamptz,
  sub_tier text,
  sub_status text,
  sub_end_date timestamptz,
  sub_months int,
  pending_payments int,
  nutri_q_status text,
  fit_q_status text,
  assigned_coach_id uuid,
  assigned_coach_name text,
  member_kind text,            -- 'b2b' | 'site' — how THIS caller relates to the row
  site_member_active boolean,  -- any active sub (follow-up signal, no tier exposed)
  invite_pending boolean,      -- 0092 (m-C): invited, never joined yet
  total_count bigint
)
language sql
security definer
set search_path = public
as $$
  with base as (
    select
      p.id            as client_id,
      p.email         as client_email,
      p.full_name     as client_full_name,
      p.phone         as client_phone,
      p.avatar_url    as client_avatar_url,
      p.created_at    as client_created_at,

      -- 0041/0043 boundary: one lateral = the SAME best-sub row feeds
      -- all four sub_* columns (admin → best tier; coach → coaching only)
      bs.tier     as sub_tier,
      bs.status   as sub_status,
      bs.end_date as sub_end_date,
      bs.months   as sub_months,

      case when public.is_admin() then
        (select count(*) from public.subscription_requests sr
          where sr.user_id = p.id and sr.status = 'pending')::int
      else 0 end as pending_payments,

      (select nq.status from public.nutrition_questionnaires nq
        where nq.client_id = p.id limit 1) as nutri_q_status,
      (select fq.status from public.fitness_questionnaires fq
        where fq.client_id = p.id limit 1) as fit_q_status,

      ca.coach_id   as assigned_coach_id,
      cp.full_name  as assigned_coach_name,
      cp.role       as assigned_coach_role,

      -- 0072: how the CALLER relates to this row. Admin: a B2B client is
      -- one whose assignment targets a REAL coach (0068 gate — the 0030A
      -- admin row is site follow-up, not a coach relation). Coach: his
      -- own ca row wins (money relation), else his site roster row.
      case
        when public.is_admin() then
          (case when cp.role = 'coach' then 'b2b' else 'site' end)
        when ca.coach_id = auth.uid() then 'b2b'
        else 'site'
      end as member_kind,

      -- 0072: follow-up signal for site members — ANY active sub, no
      -- tier/pricing exposed (the coach tier-visibility law is intact).
      exists (
        select 1 from public.subscriptions s2
        where s2.client_id = p.id
          and s2.status = 'active'
          and s2.end_date > now()
      ) as site_member_active,

      -- 0092 (m-C): unadopted-invite marker — the auth row was created by
      -- inviteUserByEmail (empty password) and the client has never signed
      -- in. Any signup/adoption/OAuth join sets a password or a
      -- last_sign_in_at, so this stays true ONLY while the invite is
      -- pending. Derived boolean only — no auth column is exposed.
      (au.id is not null
        and au.encrypted_password = ''
        and au.last_sign_in_at is null)                          as _invite_pending,

      -- flags used by p_filter (mirrors the JS logic in CoachView)
      (bs.status = 'active' and bs.end_date >  now())                          as _is_active,
      (bs.status = 'active' and bs.end_date >  now()
        and bs.end_date < now() + interval '14 days')                          as _is_expiring,
      (bs.tier is not null and (bs.status <> 'active'
        or bs.end_date <= now()))                                              as _is_expired,
      (bs.tier is null)                                                        as _no_plan,
      case when public.is_admin() then
        exists (select 1 from public.subscription_requests sr
          where sr.user_id = p.id and sr.status = 'pending')
      else false end                                                           as _pending,
      ((select 1 from public.nutrition_questionnaires nq
         where nq.client_id = p.id limit 1) is null
       and (select 1 from public.fitness_questionnaires fq
         where fq.client_id = p.id limit 1) is null)                           as _no_questionnaire
    from public.profiles p
    left join lateral (
      select s.tier, s.status, s.end_date, s.months
      from public.subscriptions s
      where s.client_id = p.id
        and (public.is_admin() or s.tier = 'coaching')
      order by
        case s.tier when 'pro' then 3 when 'premium' then 2 when 'coaching' then 1 else 0 end desc,
        s.created_at desc
      limit 1
    ) bs on true
    left join public.coach_assignments ca on ca.client_id = p.id
    left join public.profiles cp on cp.id = ca.coach_id
    left join public.site_coach_assignments sca on sca.client_id = p.id
    -- 0092 (m-C): auth row for the pending-invite marker only (read-only,
    -- inside the definer boundary; nothing from auth.users leaves the DB
    -- except the derived boolean).
    left join auth.users au on au.id = p.id
    where p.role = 'client'
      and (
        public.is_admin()
        or ca.coach_id = auth.uid()
        or sca.coach_id = auth.uid()
      )
  )
  select
    b.client_id, b.client_email, b.client_full_name, b.client_phone,
    b.client_avatar_url, b.client_created_at,
    b.sub_tier, b.sub_status, b.sub_end_date, b.sub_months,
    b.pending_payments, b.nutri_q_status, b.fit_q_status,
    b.assigned_coach_id, b.assigned_coach_name,
    b.member_kind, b.site_member_active,
    b._invite_pending as invite_pending,
    count(*) over () as total_count
  from base b
  where
    -- p_filter
    case coalesce(p_filter, 'all')
      when 'active'           then b._is_active
      when 'expiring'         then b._is_expiring
      when 'expired'          then b._is_expired
      when 'no_plan'          then b._no_plan
      when 'no_questionnaire' then b._no_questionnaire
      when 'pending_payment'  then b._pending
      when 'premium'          then b.sub_tier = 'premium'
      when 'pro'              then b.sub_tier = 'pro'
      when 'coaching'         then b.sub_tier = 'coaching'
      when 'invite_pending'   then b._invite_pending
      else true
    end
    -- p_segment (admin split; no-op for coaches — already scoped).
    -- 0072: «coach» = assigned to a REAL coach (cp.role='coach') — the
    -- 0030A admin row is «متابعة الإدارة», NOT a B2B coach client.
    -- NOTE: assigned_coach_role is the user_role ENUM {client,coach,admin}
    -- — a coalesce(...,'none') literal breaks it (22P02, the very error
    -- that made the auto-integration run fail); is distinct from is the
    -- NULL-safe, enum-safe form (NULL = unassigned = site member).
    and case coalesce(p_segment, 'all')
      when 'coach' then b.assigned_coach_role = 'coach'
      when 'site'  then b.assigned_coach_role is distinct from 'coach'
      else true
    end
    -- p_search on name / email / phone
    and (
      nullif(btrim(coalesce(p_search, '')), '') is null
      or b.client_full_name ilike '%' || btrim(p_search) || '%'
      or b.client_email     ilike '%' || btrim(p_search) || '%'
      or b.client_phone     ilike '%' || btrim(p_search) || '%'
    )
  order by
    case coalesce(p_sort, 'newest')
      when 'oldest' then b.client_created_at end asc nulls last,
    case coalesce(p_sort, 'newest')
      when 'newest' then b.client_created_at end desc nulls last,
    case coalesce(p_sort, 'newest')
      when 'name' then lower(coalesce(b.client_full_name, b.client_email, '')) end asc nulls last,
    case coalesce(p_sort, 'newest')
      when 'expiry' then b.sub_end_date end asc nulls last,
    -- stable tiebreaker so pages never repeat or skip rows
    b.client_created_at desc,
    b.client_id desc
  limit least(greatest(coalesce(p_limit, 25), 1), 100)
  offset greatest(coalesce(p_offset, 0), 0)
$$;

grant execute on function public.get_coach_client_list_paged(int, int, text, text, text, text) to authenticated;

-- ---------------------------------------------------------------
-- get_coach_client_stats — 0092: + pending_invites counter
-- ---------------------------------------------------------------
drop function if exists public.get_coach_client_stats();
create or replace function public.get_coach_client_stats()
returns table (
  total            bigint,
  active           bigint,
  expiring         bigint,
  no_plan          bigint,
  no_questionnaire bigint,
  pending_payment  bigint,
  expired          bigint,
  premium          bigint,
  pro              bigint,
  coaching         bigint,
  coach_clients    bigint,
  site_clients     bigint,
  pending_invites  bigint
)
language sql
security definer
set search_path = public
as $$
  with base as (
    select
      p.id,
      -- 0072 (0068 gate): a «coach client» has an assignment onto a REAL
      -- coach — the 0030A admin row is site follow-up, never B2B.
      (ca.coach_id is not null and cp.role = 'coach') as _has_b2b_coach,
      bs.tier,
      (bs.status = 'active' and bs.end_date > now())                          as _is_active,
      (bs.status = 'active' and bs.end_date > now()
        and bs.end_date < now() + interval '14 days')                         as _is_expiring,
      (bs.tier is not null and (bs.status <> 'active'
        or bs.end_date <= now()))                                             as _is_expired,
      case when public.is_admin() then
        exists (select 1 from public.subscription_requests sr
          where sr.user_id = p.id and sr.status = 'pending')
      else false end                                                          as _pending,
      ((select 1 from public.nutrition_questionnaires nq
         where nq.client_id = p.id limit 1) is null
       and (select 1 from public.fitness_questionnaires fq
         where fq.client_id = p.id limit 1) is null)                          as _no_questionnaire,
      -- 0092 (m-C): the same pending-invite marker as the list RPC.
      (au.id is not null
        and au.encrypted_password = ''
        and au.last_sign_in_at is null)                                       as _invite_pending
    from public.profiles p
    left join lateral (
      select s.tier, s.status, s.end_date
      from public.subscriptions s
      where s.client_id = p.id
        and (public.is_admin() or s.tier = 'coaching')
      order by
        case s.tier when 'pro' then 3 when 'premium' then 2 when 'coaching' then 1 else 0 end desc,
        s.created_at desc
      limit 1
    ) bs on true
    left join public.coach_assignments ca on ca.client_id = p.id
    left join public.profiles cp on cp.id = ca.coach_id
    left join public.site_coach_assignments sca on sca.client_id = p.id
    -- 0092 (m-C): auth row for the pending-invite marker only.
    left join auth.users au on au.id = p.id
    where p.role = 'client'
      and (
        public.is_admin()
        or ca.coach_id = auth.uid()
        or sca.coach_id = auth.uid()
      )
  )
  select
    count(*),
    count(*) filter (where _is_active),
    count(*) filter (where _is_expiring),
    count(*) filter (where tier is null),
    count(*) filter (where _no_questionnaire),
    count(*) filter (where _pending),
    count(*) filter (where _is_expired),
    count(*) filter (where tier = 'premium'),
    count(*) filter (where tier = 'pro'),
    count(*) filter (where tier = 'coaching'),
    count(*) filter (where _has_b2b_coach),
    count(*) filter (where not _has_b2b_coach),
    count(*) filter (where _invite_pending)
  from base
$$;

grant execute on function public.get_coach_client_stats() to authenticated;
