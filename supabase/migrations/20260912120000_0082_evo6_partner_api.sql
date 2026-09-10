-- 0082: EVO-6 (docs/EVO-MASTER-PLAN.md §4 W6 — API عام + ويدجت تضمين +
-- white-label) — the two partner-platform tables of the phase.
--
-- OWNER ORDER: «ابدأ evo 6» (2026-09-10) — EVO-1..5 already shipped (164-168).
--
-- TABLES (both RLS enabled with ZERO client policies BY DESIGN — the
-- 0080/0081 platform-observability posture, documented deviation from the
-- owner/coach pattern law in INDEX.md. Here the posture is a SECRET-SAFETY
-- requirement, not just observability: an API key row is a credential —
-- a client-readable key table would let any authenticated user mint or
-- read partner keys. Service-role is the ONLY reader/writer: the partner
-- chat route (hash lookup), the admin partners route (requireAdmin) and
-- the admin analytics aggregation):
--   1. evo_api_keys — partner credentials for /api/evo/v1/chat.
--      The RAW key is shown ONCE at creation (admin UI) and NEVER stored:
--      key_hash = sha256(raw) is the lookup identity, key_prefix (first
--      12 chars) exists ONLY for admin display/rotation bookkeeping.
--      theme jsonb = white-label surface (accent color, logo URL, AR/EN
--      greeting) validated by validatePartnerTheme before any write.
--      monthly_quota = served-message ceiling per UTC month (success rows
--      of evo_api_usage). Deactivation is UPDATE is_active=false — there
--      is no DELETE path in the product (same «الإيقاف UPDATE لا delete»
--      law as evo_followup_prefs).
--   2. evo_api_usage — the honest per-request metering ledger: ONE row per
--      partner chat request attempt with its final status
--      (success / rate_limited / quota_exceeded / rejected / error).
--      Quota enforcement counts CURRENT-MONTH success rows; the full
--      ledger (including rejections) is the abuse-audit trail. Powers
--      /admin/evo-partners usage stats.

create table if not exists public.evo_api_keys (
  id uuid primary key default gen_random_uuid(),
  -- partner display name (admin-facing).
  partner_name text not null,
  -- sha256 hex of the raw key — the ONLY credential material stored.
  key_hash text not null unique,
  -- first 12 chars of the raw key (e.g. pk_live_ab12cd) — display only,
  -- never sufficient to authenticate.
  key_prefix text not null,
  -- white-label surface, validated by validatePartnerTheme server-side.
  theme jsonb not null default '{}'::jsonb,
  -- max SUCCESSFUL chat requests per UTC calendar month.
  monthly_quota integer not null default 1000 check (monthly_quota > 0),
  -- kill switch per key — deactivation is UPDATE, never delete.
  is_active boolean not null default true,
  -- admin notes (contact, contract reference) — never exposed publicly.
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.evo_api_keys enable row level security;

create index if not exists evo_api_keys_active_idx
  on public.evo_api_keys (is_active) where is_active;

create table if not exists public.evo_api_usage (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  api_key_id uuid not null references public.evo_api_keys(id) on delete cascade,
  -- endpoint label (v1: 'chat' only — future endpoints extend the check).
  endpoint text not null default 'chat' check (endpoint in ('chat')),
  -- final status of the request attempt.
  status text not null check (status in
    ('success', 'rate_limited', 'quota_exceeded', 'rejected', 'error')),
  -- served from evo_chat_cache (cost-free dispatch) or not.
  cache_hit boolean not null default false,
  latency_ms integer,
  -- coarse client identity for the abuse audit (same clientIp derivation
  -- as the rest of the platform — the last trusted proxy hop).
  client_ip text
);

alter table public.evo_api_usage enable row level security;

create index if not exists evo_api_usage_key_time_idx
  on public.evo_api_usage (api_key_id, created_at desc);
create index if not exists evo_api_usage_status_idx
  on public.evo_api_usage (status, created_at desc);
