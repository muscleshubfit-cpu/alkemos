-- ============================================================================
-- 0072 — SITE-COACH CONSOLE (Phase 142, 2026-09-07)
-- ============================================================================
-- Owner directive: «فى اخطاء فى لوحة الادمن ( يعامل مثل المدربين b2b وهذا
-- خطاء) و تكرار ازرار واختفاء اخرى ، يجب الفصل بين ادمن / مدرب موقع /
-- مدرب مستقل».
--
-- WHAT THIS MIGRATION FIXES (DB side of the separation):
--   1. THE BROKEN SITE-COACH LOOP (the «اختفاء» part): a site coach
--      (profiles.coach_kind='site', set from /admin/coaches since 0067)
--      had his members assigned in site_coach_assignments — but EVERY
--      coach-side read path keyed ONLY on coach_assignments (B2B money
--      relation): get_coach_client_list_paged / get_coach_client_stats
--      / is_coach_over / progress_photos policies. Result: his console
--      list was EMPTY and direct client-page access was 403. The admin
--      assigned members he could never see. 0072 opens the loop:
--      his roster, his client data reads, his progress photos.
--   2. THE ADMIN-AS-B2B MISCLASSIFICATION on the /coach console (the
--      «الادمن يعامل مثل مدربين b2b» part): 0030A's auto-assignment puts
--      EVERY client on the admin row in coach_assignments, and 0047's
--      segment logic counted `assigned_coach_id is not null` as a coach
--      client → on /coach the segment «عملاء المدربين» = everyone and
--      «عملاء الموقع» = 0. 0068 fixed this for the /admin/clients RPCs
--      only — 0072 applies the SAME `cp.role = 'coach'` gate here
--      (paged segment + stats coach_clients/site_clients).
--
-- SCOPE/SAFETY (unchanged boundaries):
--   * coach_assignments stays the B2B money relation — untouched.
--   * site_coach_assignments stays the money-free B2C roster — untouched.
--   * coach_of() is NOT modified (admin_notifications routing semantics
--     preserved). A NEW site_coach_of() helper is added instead.
--   * is_coach_over() gains the site-coach branch — it is the single
--     choke-point for staff reads on client data (profiles, subs,
--     progress, plans, questionnaires), so one extension opens all of
--     them for the site coach with no per-table surgery.
--   * Sub-tier visibility law («المدرب لا يرى عضويات الموقع») preserved:
--     the lateral still restricts non-admin callers to tier='coaching';
--     site coaches instead get ONLY a boolean site_member_active —
--     follow-up signal without tier/money exposure.
--   * Both RPCs keep their EXACT signatures (arg count/types); the paged
--     return table gains member_kind + site_member_active columns —
--     additive, existing callers ignore unknown keys.
--
-- Idempotent: drop + create end to end. No data touched.
-- ============================================================================

-- ---------------------------------------------------------------
-- PART A — helpers: site_coach_of + extended is_coach_over
-- ---------------------------------------------------------------
create or replace function public.site_coach_of(p_client uuid)
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select s.coach_id
  from public.site_coach_assignments s
  where s.client_id = p_client
  order by s.created_at asc
  limit 1
$$;

grant execute on function public.site_coach_of(uuid) to anon, authenticated;

-- is_coach_over: admin OR the member's B2B coach OR his site coach.
-- (Security-definer choke point — every staff-read policy below inherits.)
create or replace function public.is_coach_over(p_client uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.is_admin()
    or exists (
      select 1 from public.coach_assignments a
      where a.client_id = p_client
        and a.coach_id = auth.uid()
    )
    or exists (
      select 1 from public.site_coach_assignments s
      where s.client_id = p_client
        and s.coach_id = auth.uid()
    )
$$;

-- ---------------------------------------------------------------
-- PART B — profiles read policy: the site coach reads his members
-- ---------------------------------------------------------------
drop policy if exists profiles_select_self_or_coach on public.profiles;
create policy profiles_select_self_or_coach
  on public.profiles for select
  using (
    auth.uid() = id
    or public.is_coach_over(id)
  );

-- ---------------------------------------------------------------
-- PART C — progress photos (table + storage): the site coach sees
--          his members' photos read-only, same as a B2B coach
-- ---------------------------------------------------------------
drop policy if exists progress_photos_select_assigned_coach on public.progress_photos;
create policy progress_photos_select_assigned_coach on public.progress_photos
  for select to authenticated
  using (
    exists (
      select 1 from public.coach_assignments ca
      where ca.client_id = progress_photos.user_id
        and ca.coach_id  = auth.uid()
    )
    or public.site_coach_of(progress_photos.user_id) = auth.uid()
  );

drop policy if exists progress_photos_storage_coach on storage.objects;
create policy progress_photos_storage_coach on storage.objects
  for select to authenticated
  using (
    bucket_id = 'progress-photos'
    and (
      exists (
        select 1 from public.coach_assignments ca
        where ca.client_id = ((storage.foldername(name))[1])::uuid
          and ca.coach_id  = auth.uid()
      )
      or public.site_coach_of(((storage.foldername(name))[1])::uuid) = auth.uid()
    )
  );

-- ---------------------------------------------------------------
-- PART D — get_coach_client_list_paged (0047 rebuilt):
--          ∪ site-coach scope + member_kind + site_member_active
--          + honest segment gate (cp.role='coach', the 0068 fix)
-- ---------------------------------------------------------------
drop function if exists public.get_coach_client_list_paged(int, int, text, text, text, text);
create or replace function public.get_coach_client_list_paged(
  p_limit   int  default 25,
  p_offset  int  default 0,
  p_search  text default null,
  p_filter  text default 'all',    -- all|active|expiring|expired|no_plan|no_questionnaire|pending_payment|premium|pro|coaching
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
  member_kind text,          -- 'b2b' | 'site' — how THIS caller relates to the row
  site_member_active boolean,-- any active sub (follow-up signal, no tier exposed)
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
-- PART E — get_coach_client_stats (same ∪ scope + 0068 gate)
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
  site_clients     bigint
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
         where fq.client_id = p.id limit 1) is null)                          as _no_questionnaire
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
    count(*) filter (where not _has_b2b_coach)
  from base
$$;

grant execute on function public.get_coach_client_stats() to authenticated;

-- ---------------------------------------------------------------
-- Reload PostgREST schema cache
-- ---------------------------------------------------------------
notify pgrst, 'reload schema';

-- ============================================================
-- VERIFY — one grid, one row
--  site_helper_live   : site_coach_of exists + granted
--  coach_gate widened : is_coach_over definition mentions site_coach_assignments
--  profiles_policy    : the select policy keys on is_coach_over only
--  paged_rebuilt      : the paged RPC carries member_kind + site scope
--  paged_coach_gate   : the segment gate uses cp.role='coach'
--  stats_rebuilt      : stats gates the same way + site scope
--  old_rpc_untouched  : legacy get_coach_client_list still in place
-- ============================================================
select
  (select count(*) from pg_catalog.pg_proc
    where proname = 'site_coach_of')                                   as site_helper_live,
  (select count(*) from pg_catalog.pg_proc
    where proname = 'is_coach_over'
      and pg_get_functiondef(oid) like '%site_coach_assignments%')     as coach_gate_widened,
  (select count(*) from pg_catalog.pg_policies
    where schemaname = 'public' and tablename = 'profiles'
      and policyname = 'profiles_select_self_or_coach'
      and qual like '%is_coach_over%')                                 as profiles_policy,
  (select count(*) from pg_catalog.pg_proc
    where proname = 'get_coach_client_list_paged'
      and pg_get_functiondef(oid) like '%member_kind%')                as paged_rebuilt,
  (select count(*) from pg_catalog.pg_proc
    where proname = 'get_coach_client_list_paged'
      and pg_get_functiondef(oid) like '%sca.coach_id = auth.uid()%')  as paged_site_scope,
  (select count(*) from pg_catalog.pg_proc
    where proname = 'get_coach_client_stats'
      and pg_get_functiondef(oid) like '%cp.role = ''coach''')         as stats_coach_gate,
  (select count(*) from pg_catalog.pg_proc
    where proname = 'get_coach_client_list')                           as old_rpc_untouched;

-- Expected: | 1 | 1 | 1 | 1 | 1 | 1 | 1 |
