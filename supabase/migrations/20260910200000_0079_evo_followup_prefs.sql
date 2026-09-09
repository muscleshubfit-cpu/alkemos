-- 0079: evo_followup_prefs — opt-in ledger for EVO's weekly proactive check-in email
-- Phase EVO-3 (docs/EVO-MASTER-PLAN.md §4 W2) — owner decree D4 (2026-09-10):
-- «موافق على D4 والبريد evo@alkemos.com ارسال فقط بدون استقبال» + «البريد معمول بالفعل».
--
-- SCOPE OF THIS PHASE (EVO-3): INFRASTRUCTURE ONLY — the table, the pure
-- email builder (src/lib/evo-followup.ts) and the admin-gated dispatch route
-- (/api/evo/followup/dispatch) ship here, but ACTIVATION happens later:
--   1. live SMTP/Brevo check with the evo@alkemos.com sender (verified domain),
--   2. EVO_FOLLOWUP_ENABLED=true on the runtime,
--   3. the user-facing opt-in UI (nothing sends to anyone who did not opt in
--      — D4 makes opt-in MANDATORY, so no UI before activation by design).
--
-- WRITE PATHS: the owner updates their own row (opt-in / opt-out via update,
-- never delete — D2 spirit: no user-facing "forget me"), admins manage
-- everything, and the dispatch route stamps last_sent_at via service-role
-- (service-role bypasses RLS — the evo_memory_state posture).
-- SEND-FROM: evo@alkemos.com is SEND-ONLY — replies are not received or read
-- from it; the email footer points to real site surfaces instead.

create table if not exists public.evo_followup_prefs (
  -- one row per member (1:1 with profiles)
  client_id uuid primary key references public.profiles(id) on delete cascade,
  -- D4: the weekly check-in email is strictly opt-in. Default false —
  -- nobody is enrolled silently, ever.
  opted_in boolean not null default false,
  -- email language, captured at opt-in time (site is AR-first)
  language text not null default 'ar' check (language in ('ar', 'en')),
  -- stamped by the dispatch route (service-role) on each successful send;
  -- null = never sent yet
  last_sent_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.evo_followup_prefs enable row level security;

-- SELECT: the owner reads their own preference; admins audit the ledger.
drop policy if exists evo_followup_prefs_select on public.evo_followup_prefs;
create policy evo_followup_prefs_select
  on public.evo_followup_prefs for select
  to authenticated
  using (client_id = auth.uid() or public.is_admin());

-- INSERT: a member enrolls themselves (client_id must be their own id).
drop policy if exists evo_followup_prefs_insert_own on public.evo_followup_prefs;
create policy evo_followup_prefs_insert_own
  on public.evo_followup_prefs for insert
  to authenticated
  with check (client_id = auth.uid());

-- UPDATE: member flips opted_in / language on their own row (this is the
-- opt-out path — never a delete); admins may update any row.
drop policy if exists evo_followup_prefs_update on public.evo_followup_prefs;
create policy evo_followup_prefs_update
  on public.evo_followup_prefs for update
  to authenticated
  using (client_id = auth.uid() or public.is_admin())
  with check (client_id = auth.uid() or public.is_admin());

-- DELETE: admin-only (D2 — no user-facing deletion; opt-out is an update).
drop policy if exists evo_followup_prefs_delete_admin on public.evo_followup_prefs;
create policy evo_followup_prefs_delete_admin
  on public.evo_followup_prefs for delete
  to authenticated
  using (public.is_admin());

-- Dispatch query shape: WHERE opted_in AND (last_sent_at IS NULL OR
-- last_sent_at < now() - 7 days) — covered by this partial index.
create index if not exists evo_followup_prefs_due_idx
  on public.evo_followup_prefs (last_sent_at asc)
  where opted_in = true;

comment on table public.evo_followup_prefs is
  'EVO weekly check-in email opt-in ledger (EVO-3 W2, D4). Opt-in mandatory; infrastructure-only until SMTP is verified live and EVO_FOLLOWUP_ENABLED=true.';
comment on column public.evo_followup_prefs.opted_in is
  'Owner consent for the weekly check-in email from evo@alkemos.com (send-only). Default false.';
comment on column public.evo_followup_prefs.last_sent_at is
  'Successful dispatch timestamp stamped by /api/evo/followup/dispatch (service-role). Null = never sent.';
