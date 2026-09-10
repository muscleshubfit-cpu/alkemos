-- 0081: EVO-5 (docs/EVO-MASTER-PLAN.md §4 W5 المتبقي — eval harness · كاش ·
-- تصدير · لوحة تحليلات) — the three platform-observability tables of the phase.
--
-- OWNER ORDER: «ابدأ evo 5» (2026-09-11) — EVO-1..4 already shipped (164-167).
--
-- TABLES (all three RLS enabled with ZERO client policies BY DESIGN — the
-- 0080 evo_nutrition_patterns posture, documented deviation from the
-- owner/coach pattern law in INDEX.md):
--   1. evo_chat_cache — frequent-question answer cache for EVO chat.
--      Served ONLY to requests that carry NO personal context (anonymous
--      or logged-in-free users with empty history, no memory facts, no
--      plan/swap intent, no crisis). Service-role is the only reader/writer
--      (the chat route + the admin analytics route). No client row exists,
--      so no client policy exists. "دلالي" here = deterministic text
--      normalization + pg_trgm similarity — NO embeddings provider (the
--      3-provider law: a 4th provider would need an explicit owner order).
--   2. evo_call_stats — one row per REAL EVO model dispatch (chain, cache
--      or local fallback): provider, language, coarse intent, latency,
--      cache flag. Powers /admin/evo-analytics (provider success, cache
--      hit rate, intent distribution). Written best-effort server-side —
--      never in the user's latency path, never breaks chat.
--   3. evo_eval_runs — the weekly eval harness results (GHA
--      evo-weekly-eval.yml): reference AR/EN questions answered by the
--      REAL system prompt + provider chain, scored by a cheap judge model.
--      The quality curve that accompanies every prompt change.
--
-- THE RPC evo_cache_lookup: exact-hash hit first, then pg_trgm similarity
-- (>= p_min_sim, same language, unexpired) — one round trip from the chat
-- route. search_path pinned per the migration law.

create extension if not exists pg_trgm;

create table if not exists public.evo_chat_cache (
  id uuid primary key default gen_random_uuid(),
  -- sha256 of normalizeEvoQuestion(text) — the lookup key.
  question_hash text not null unique,
  -- the normalized question text (pg_trgm similarity search target).
  question_norm text not null,
  language text not null default 'ar' check (language in ('ar', 'en')),
  answer text not null,
  -- provenance of the stored answer (provider:model / local).
  source text not null,
  hits integer not null default 0,
  created_at timestamptz not null default now(),
  last_hit_at timestamptz,
  expires_at timestamptz not null
);

alter table public.evo_chat_cache enable row level security;

create index if not exists evo_chat_cache_trgm_idx
  on public.evo_chat_cache using gin (question_norm gin_trgm_ops);
create index if not exists evo_chat_cache_expires_idx
  on public.evo_chat_cache (expires_at asc);

create table if not exists public.evo_call_stats (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  -- null = anonymous visitor (no account to attach).
  user_id uuid,
  language text not null default 'ar' check (language in ('ar', 'en')),
  -- coarse intent the system actually distinguishes today.
  intent text not null default 'general'
    check (intent in ('general', 'plan_nutrition', 'plan_workout', 'swap')),
  -- provider label: openrouter | groq | nvidia | cache | local.
  provider text not null,
  cache_hit boolean not null default false,
  success boolean not null default true,
  latency_ms integer
);

alter table public.evo_call_stats enable row level security;

create index if not exists evo_call_stats_created_idx
  on public.evo_call_stats (created_at desc);

create table if not exists public.evo_eval_runs (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  -- stable id from the reference question set (src/lib/evo-eval.ts).
  question_id text not null,
  language text not null check (language in ('ar', 'en')),
  provider text,
  model text,
  -- judge score 0-10 (decimal allowed).
  score numeric(3, 1) not null check (score >= 0 and score <= 10),
  safety_pass boolean not null default true,
  language_match boolean not null default true,
  notes text,
  -- first 400 chars of the answer — admin review context, no user PII
  -- (the eval set is platform-owned reference questions, not user traffic).
  answer_excerpt text
);

alter table public.evo_eval_runs enable row level security;

create index if not exists evo_eval_runs_created_idx
  on public.evo_eval_runs (created_at desc);

-- One round trip: exact hash hit first, otherwise the most similar
-- unexpired same-language question at or above the similarity floor.
-- Caller: service-role only (the chat route). search_path pinned.
create or replace function public.evo_cache_lookup(
  p_hash text,
  p_norm text,
  p_lang text,
  p_min_sim double precision default 0.92
)
returns table (
  id uuid,
  question_hash text,
  answer text,
  source text
)
language sql
stable
set search_path = public
as $$
  select c.id, c.question_hash, c.answer, c.source
  from public.evo_chat_cache c
  where c.expires_at > now()
    and c.language = p_lang
    and (
      c.question_hash = p_hash
      or similarity(c.question_norm, p_norm) >= p_min_sim
    )
  order by
    (c.question_hash = p_hash) desc,
    similarity(c.question_norm, p_norm) desc,
    c.created_at desc
  limit 1;
$$;

comment on table public.evo_chat_cache is
  'EVO-5 frequent-question answer cache (W5). Served only to context-free requests (empty history, no subscriber context, no memory, no plan/swap intent, no crisis). Zero client policies by design — service-role only (0080 posture).';
comment on table public.evo_call_stats is
  'EVO-5 per-dispatch call telemetry for /admin/evo-analytics (provider success, cache hit rate, intent distribution, latency). Zero client policies by design — service-role only (0080 posture).';
comment on table public.evo_eval_runs is
  'EVO-5 weekly eval harness results (GHA evo-weekly-eval.yml): reference AR/EN questions scored by a cheap judge model — the quality curve per prompt change. Zero client policies by design — service-role only (0080 posture).';
