-- 0077: evo_feedback — 👍/👎 quality signal on EVO chat replies
-- Phase EVO-1 (docs/EVO-MASTER-PLAN.md §4 W5.1) — owner directive 2026-09-10
-- «تحسين المساعد الذكى» + D3-style privacy: feedback is quality telemetry,
-- NOT user content mining — snippets are truncated admin-review context only.
--
-- WRITE PATH: the browser posts to /api/ai/feedback (zod-style validation +
-- per-IP rate limit) which inserts via service-role. Direct browser writes
-- are still allowed for the owner's own rows / anonymous (client_id null)
-- for defense-in-depth — UPDATE/DELETE: nobody (append-only, plan_swaps law).
-- READ PATH: admin weekly review only (is_admin() — 0073 law).

create table if not exists public.evo_feedback (
  id uuid primary key default gen_random_uuid(),
  -- null = anonymous rater (EVO chat works logged-out)
  client_id uuid references public.profiles(id) on delete set null,
  feedback text not null check (feedback in ('up', 'down')),
  -- optional free-text reason (down-rating follow-up), capped by the route
  reason text,
  -- the widget message id (client-side `msg-...` id — traceability not FK)
  message_id text,
  -- {question, reply} each truncated to <=500 chars server-side — admin context
  snippet jsonb,
  created_at timestamptz not null default now()
);

alter table public.evo_feedback enable row level security;

-- INSERT: authenticated users stamp their own id (or leave null); anonymous
-- may only insert fully-anonymous rows (client_id null).
drop policy if exists evo_feedback_insert_authed on public.evo_feedback;
create policy evo_feedback_insert_authed
  on public.evo_feedback for insert
  to authenticated
  with check (client_id = auth.uid() or client_id is null);

drop policy if exists evo_feedback_insert_anon on public.evo_feedback;
create policy evo_feedback_insert_anon
  on public.evo_feedback for insert
  to anon
  with check (client_id is null);

-- SELECT: admin weekly review only — raters don't read the ledger back.
drop policy if exists evo_feedback_select_admin on public.evo_feedback;
create policy evo_feedback_select_admin
  on public.evo_feedback for select
  to authenticated
  using (public.is_admin());

-- NO update/delete policies — append-only by absence (plan_swaps pattern).

create index if not exists evo_feedback_created_idx
  on public.evo_feedback (created_at desc);
create index if not exists evo_feedback_score_idx
  on public.evo_feedback (feedback, created_at desc);
