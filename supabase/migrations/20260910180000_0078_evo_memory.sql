-- 0078: evo_memory + evo_memory_state — EVO permanent memory (W3)
-- Phase EVO-2 (docs/EVO-MASTER-PLAN.md §4 W3) — owner decree 2026-09-10
-- «ابدأ التنفيذ» + decisions D1/D2 (163.1):
--   D1  memory is FREE for every logged-in user (anonymous has no memory —
--       no account, no client_id, nothing to attach facts to). The PAID
--       gating of chat_messages history restore (Phase 69) is untouched.
--   D2  NO user-facing "forget everything" UI — deletion/deactivation is
--       admin-side on documented support requests only (is_admin law 0073).
--
-- EXTRACTION (server-side only): api/ai/chat counts dispatched messages per
-- user in evo_memory_state; every 10th message a cheap fast-chain call
-- (same 3-provider law — no 4th provider) extracts 3-5 durable facts.
-- PII denial-list lives in the extraction prompt (src/lib/evo-memory.ts):
-- no diagnoses/medications/mental-health detail/contacts/finances.
-- WRITES: service-role (browser never writes these tables directly).

create table if not exists public.evo_memory (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.profiles(id) on delete cascade,
  -- one durable third-person fact, <=300 chars (capped again in evo-memory.ts)
  fact text not null check (char_length(fact) between 1 and 300),
  category text not null default 'other'
    check (category in ('goal', 'preference', 'lifestyle', 'constraint', 'other')),
  source text not null default 'auto_extract'
    check (source in ('auto_extract', 'admin')),
  confidence numeric not null default 0.7 check (confidence >= 0 and confidence <= 1),
  -- deactivation (not deletion) keeps history for admin review (D2)
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.evo_memory enable row level security;

-- SELECT: chat_owner_or_coach pattern (0001 + 0030B) — the user reads their
-- own memory, their assigned coach reads clients' memory (coaching context).
drop policy if exists evo_memory_select_owner_or_coach on public.evo_memory;
create policy evo_memory_select_owner_or_coach
  on public.evo_memory for select
  to authenticated
  using (auth.uid() = client_id or public.is_coach_over(client_id));

-- INSERT: authenticated users may stamp only their own rows (defense-in-depth;
-- the real write path is service-role inside api/ai/chat).
drop policy if exists evo_memory_insert_self on public.evo_memory;
create policy evo_memory_insert_self
  on public.evo_memory for insert
  to authenticated
  with check (auth.uid() = client_id);

-- UPDATE: owner may correct/deactivate their own facts; admin may deactivate
-- on support requests (D2 — no user UI exists, dashboard/service-role only).
drop policy if exists evo_memory_update_owner_or_admin on public.evo_memory;
create policy evo_memory_update_owner_or_admin
  on public.evo_memory for update
  to authenticated
  using (auth.uid() = client_id or public.is_admin())
  with check (auth.uid() = client_id or public.is_admin());

-- DELETE: admin only (D2 — manual deletion on documented support requests;
-- never touches usage counters, unlike the removed chat-clear flow).
drop policy if exists evo_memory_delete_admin on public.evo_memory;
create policy evo_memory_delete_admin
  on public.evo_memory for delete
  to authenticated
  using (public.is_admin());

-- Injection query shape: top-15 active facts, newest first.
create index if not exists evo_memory_inject_idx
  on public.evo_memory (client_id, is_active, updated_at desc);

comment on table public.evo_memory is
  'EVO permanent memory (EVO-2 W3) — durable third-person facts extracted every 10th chat message by the fast chain; FREE for all logged-in users (D1 163.1); PII denial-list enforced in extraction prompt; admin-side deletion only (D2).';

-- ── evo_memory_state — server-side extraction counter ──────────────────────
-- Anti-tamper posture (evo_chat_usage 0022 philosophy): the browser never
-- sees or writes this table. Zero policies for non-admin roles by design —
-- service-role bypasses RLS and is the ONLY writer (upsert increment +
-- reset after extraction). Admin gets read-only for support/debugging.
create table if not exists public.evo_memory_state (
  client_id uuid primary key references public.profiles(id) on delete cascade,
  messages_since_extract integer not null default 0
    check (messages_since_extract >= 0),
  last_extracted_at timestamptz,
  updated_at timestamptz not null default now()
);

alter table public.evo_memory_state enable row level security;

drop policy if exists evo_memory_state_select_admin on public.evo_memory_state;
create policy evo_memory_state_select_admin
  on public.evo_memory_state for select
  to authenticated
  using (public.is_admin());

comment on table public.evo_memory_state is
  'EVO-2 W3 — per-user counter of dispatched chat messages since last memory extraction (server-side, service-role only writer; zero client policies by design). Extraction fires at >=10 and resets the counter.';
