-- 0080: evo_nutrition_patterns — anonymized platform nutrition knowledge (W4)
-- Phase EVO-4 (docs/EVO-MASTER-PLAN.md §4 W4, E1+E2+E3) — owner decree
-- 2026-09-10 «نعم يتعلم من كل شيء»: approved coach/admin plans, user meal
-- planner plans, and swap behavior feed PLATFORM-LEVEL knowledge that the
-- plan generator injects as reference — all AGGREGATE, fully anonymized.
--
-- HONEST ENGINEERING (W4 header law): provider model weights are frozen —
-- "learning" here is retrieval/aggregation/feedback, which measurably moves
-- plan quality over time without fine-tuning.
--
-- ONE NEW TABLE (sources are all EXISTING tables — zero source schema):
--   E1  calories_by_goal · macros_by_goal · meal_count · food_frequency
--       computed weekly by the deterministic aggregator (NO LLM — zero cost)
--       from plans (approved meal) + meal_plans + external_plans (final).
--   E2  exemplar — compact anonymized skeleton of one high-structure
--       approved plan, injected as the few-shot reference. Deterministic
--       extraction from STRUCTURED fields only (meals/macros/numbers) —
--       free-text fields (overview/notes/title) never enter, so no person
--       name can leak by construction.
--   E3  swap_volume — weekly meal/exercise swap totals from plan_swaps
--       (volume signal; plan_swaps stores the TYPE, not food identity —
--       documented limit). swap_removed / swap_added — REAL food-identity
--       learning: /api/plans/member-edit (mode swap) diffs old vs new plan
--       content and increments these buckets (service-role, best-effort).
--
-- RLS POSTURE — deliberate deviation from the owner/coach pattern law
-- (documented in INDEX.md): this table has NO per-owner rows — it is
-- platform-level aggregate knowledge consumed server-side by the generator
-- (service-role bypasses RLS). Zero client policies, same anti-tamper
-- posture as evo_memory_state (0078): no authenticated client can read or
-- write it; admin analytics can add a scoped select policy in EVO-5.

create table if not exists public.evo_nutrition_patterns (
  id uuid primary key default gen_random_uuid(),
  -- knowledge family (E1 aggregation / E2 exemplar / E3 swap learning)
  bucket text not null check (
    bucket in (
      'calories_by_goal',
      'macros_by_goal',
      'meal_count',
      'food_frequency',
      'exemplar',
      'swap_volume',
      'swap_removed',
      'swap_added'
    )
  ),
  -- within-family dimension: goal class ('fat-loss'|'muscle-gain'|'maintain'),
  -- normalized food name, meal-count value, swap_type, or 'latest' (exemplar)
  key text not null,
  -- aggregate payload (avg/min/max distributions, counts, exemplar skeleton,
  -- swap increments) — shape documented per bucket in evo-nutrition-learning.ts
  payload jsonb not null default '{}'::jsonb,
  -- how many source plans/events contributed (honesty floor for injection:
  -- thin samples are labeled as such or withheld)
  sample_size integer not null default 0,
  computed_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  unique (bucket, key)
);

alter table public.evo_nutrition_patterns enable row level security;

-- INTENTIONALLY NO POLICIES (service-role only — evo_memory_state posture).
-- The generator/runner/aggregator all run server-side; nothing client-facing
-- ever reads this table. RLS enabled = authenticated/anonymous deny-by-default.

create index if not exists evo_nutrition_patterns_bucket_idx
  on public.evo_nutrition_patterns (bucket);

comment on table public.evo_nutrition_patterns is
  'EVO-4 (W4 E1+E2+E3): anonymized platform nutrition knowledge injected into plan generation. Aggregate-only; sources are existing plans/meal_plans/external_plans/plan_swaps tables. Service-role writes/reads — zero client policies by design.';
comment on column public.evo_nutrition_patterns.bucket is
  'Knowledge family: calories_by_goal/macros_by_goal/meal_count/food_frequency (E1) · exemplar (E2) · swap_volume/swap_removed/swap_added (E3).';
comment on column public.evo_nutrition_patterns.sample_size is
  'Source-plan/event count behind this aggregate. The injector withholds or labels thin samples instead of presenting noise as knowledge.';
comment on column public.evo_nutrition_patterns.computed_at is
  'Staleness marker — the weekly workflow upserts E1/E2/E3(swap_volume) wholesale; swap_removed/swap_added accumulate live from member-edit diffs.';
