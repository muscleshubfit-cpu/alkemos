-- ═══════════════════════════════════════════════════════════════════
-- 0098 — W0-3 (S-01) ATOMIC PAYPAL CAPTURE IDEMPOTENCY (2026-10-02)
-- ═══════════════════════════════════════════════════════════════════
-- Full-stack audit 2026-10-02, finding S-01 (docs/
-- FULL-STACK-AUDIT-AND-REMEDIATION-PLAN-2026-10-02.md §4.1 + design
-- §6.4, owner order 2026-10-02 = the §7 pre-approval this law
-- requires). The replay window: POST /api/paypal/capture-order treated
-- PayPal's 422 ORDER_ALREADY_CAPTURED as "success" — the SUBSCRIPTION
-- arm then called extend_subscription() which extends on EVERY call by
-- design (0018: "safe to call multiple times (each call extends)") —
-- one payment = unlimited months for whoever replays the request. The
-- WALLET arm's ref_id check was read-then-act: two PARALLEL requests
-- both passed the empty check and both credited (double credit). The
-- 0042 evidence gate only guards the COACH door — the service_role
-- door PayPal enters is exempt (p_request_id null).
--
-- THE FIX — claim-first atomicity, same proven repo patterns as
-- 0015/0057 (unique + 23505) and 0042 (atomic consumption), but the
-- decision moves from the application down into the DATABASE:
--
--   1. subscription_requests.paypal_order_id column + PARTIAL unique
--      index → the INSERT of the payment record IS the atomic claim.
--      All historical rows are NULL → no conflict, no backfill.
--   2. coach_wallet_transactions PARTIAL unique index on (ref_id)
--      WHERE kind='topup' → closes the concurrent wallet race.
--      Admin adjustments insert ref_id=null and coach activations are
--      kind='activation' → no other writer is affected (verified).
--   3. RPC capture_paypal_subscription(): claim insert + managed
--      23505 ("already processed" → idempotent success) + the
--      extend_subscription() call — ALL IN ONE TRANSACTION: an
--      extension failure rolls the claim back (no lock without
--      effect, no poisoned state — a retry starts clean).
--   4. coach_adjust_wallet(): catches the 23505 on the ledger insert
--      → returns the LIVE balance without crediting (race resolved).
--
-- Additive only: no table dropped, no policy changed, no behavior
-- change for any non-PayPal writer. Callers are updated to the RPC in
-- the SAME commit (the 0042 precedent).
--
-- Applied automatically by the Supabase-GitHub integration (Phase 120).
-- Idempotent. Rollback: revert the commit + drop the two indexes, the
-- column and the RPC manually (all additive).
-- ═══════════════════════════════════════════════════════════════════

-- ============================================================
-- PART 1 — the claim column on subscription_requests
-- ============================================================
alter table public.subscription_requests
  add column if not exists paypal_order_id text;

-- ============================================================
-- PART 2 — the atomic claim lock (partial unique index)
-- Historical rows are all NULL → the WHERE excludes them → no
-- conflict, no backfill needed.
-- ============================================================
create unique index if not exists uq_subscription_requests_paypal_order
  on public.subscription_requests (paypal_order_id)
  where paypal_order_id is not null;

-- ============================================================
-- PART 3 — the wallet top-up race lock
-- Only PayPal top-ups carry a deterministic UUID5 ref_id with
-- kind='topup' — admin adjustments (ref_id=null) and coach
-- activations (kind='activation') are excluded by the predicate,
-- so ONLY the raced double-credit is blocked.
-- ============================================================
create unique index if not exists uq_coach_wtxn_topup_ref
  on public.coach_wallet_transactions (ref_id)
  where ref_id is not null and kind = 'topup';

-- ============================================================
-- PART 4 — capture_paypal_subscription(): claim → extend, one
-- transaction. SECURITY DEFINER + pinned search_path (0042
-- pattern). Service-role only — the capture-order route runs with
-- supabaseAdmin; the JWT claims survive SECURITY DEFINER calls.
--
-- p_tier      = the CANONICAL model tier (0045 guard: the
--               subscriptions row must be premium/pro/coaching —
--               canonicalModelTier() resolves starter→premium,
--               elite→pro in the route before calling).
-- p_plan_tier = the ORIGINAL product id kept on the payment
--               record (0046 law: Starter charges $20 and the
--               record shows what was actually bought) — defaults
--               to p_tier for direct premium/pro purchases.
--
-- Returns jsonb:
--   { "already_processed": false, "subscription": {…} }  fresh capture
--   { "already_processed": true }                        replay/race
-- The caller shapes an idempotent 200 from its own capture context
-- and runs notifications/commission ONLY after this returns.
-- ============================================================
create or replace function public.capture_paypal_subscription(
  p_user_id uuid,
  p_tier text,
  p_months int,
  p_amount_usd numeric,
  p_order_id text,
  p_full_name text,
  p_plan_tier text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_row public.subscriptions%rowtype;
  v_plan_tier text := coalesce(nullif(btrim(coalesce(p_plan_tier, '')), ''), p_tier);
begin
  -- Service-role only (0035 coach_adjust_wallet door pattern)
  if coalesce((current_setting('request.jwt.claims', true)::jsonb)->>'role', '')
     <> 'service_role' then
    raise exception 'capture_paypal_subscription: service role only';
  end if;

  if p_order_id is null or length(btrim(p_order_id)) = 0 then
    raise exception 'capture_paypal_subscription: order id required';
  end if;

  -- CLAIM FIRST — the insert is the atomic lock
  -- (uq_subscription_requests_paypal_order). 23505 = "already
  -- processed" → idempotent success, NEVER a second extension.
  begin
    insert into public.subscription_requests
      (user_id, full_name, whatsapp, plan_tier, duration_months,
       price_usd, payment_method, receipt_path, status, reviewed_at,
       paypal_order_id)
    values
      (p_user_id, p_full_name, null, v_plan_tier, p_months,
       round(p_amount_usd::numeric, 2), 'paypal', null, 'approved', now(),
       btrim(p_order_id));
  exception when unique_violation then
    -- A replay (sequential or the loser of a parallel race): the
    -- claim exists, the extension already happened. Returning (not
    -- raising) keeps the caller's retry path clean.
    return jsonb_build_object('already_processed', true);
  end;

  -- FRESH CAPTURE — the extension runs in the SAME transaction as
  -- the claim: any failure below raises out of this function and
  -- PostgREST rolls the WHOLE call back — no claim row, no
  -- extension, no poisoned state (the canary: extension failure
  -- returns the lock).
  v_row := public.extend_subscription(
    p_client_id        => p_user_id,
    p_tier             => p_tier,
    p_months           => p_months,
    p_subscription_type => case when p_tier = 'coaching'
                                then 'coaching' else 'membership' end,
    p_request_id       => null  -- 0042: service-role = evidence-exempt
  );

  return jsonb_build_object(
    'already_processed', false,
    'subscription', to_jsonb(v_row));
end;
$$;

-- No implicit PUBLIC execute on the money RPC (0042 hygiene pattern)
revoke execute on function public.capture_paypal_subscription(uuid, text, int, numeric, text, text, text) from public;

-- ============================================================
-- PART 5 — coach_adjust_wallet(): resolve the top-up race inside
-- the ONLY wallet writer (0035 PART 4). Additive, normal behavior
-- unchanged: the ledger insert now CLAIMS FIRST (same values, same
-- order of effects inside one transaction) and a 23505 on
-- uq_coach_wtxn_topup_ref returns the LIVE balance without
-- crediting — the parallel loser gets a clean success with the
-- winner's balance instead of a double credit.
-- Narrow residual (accepted, cosmetic only): in the tiny window
-- where BOTH parallel requests already passed the route's quick
-- check, the loser still writes its best-effort history row +
-- coach notification — the MONEY is protected; those tables have
-- no order-id column to key on.
-- ============================================================
create or replace function public.coach_adjust_wallet(
  p_coach_id   uuid,
  p_amount     numeric,
  p_kind       text,
  p_ref_id     uuid default null,
  p_note       text default null,
  p_created_by uuid default null
)
returns numeric
language plpgsql
security definer
set search_path = public
as $$
declare
  v_amount   numeric;
  v_balance  numeric;
  v_new      numeric;
  v_constraint text;
begin
  if coalesce((current_setting('request.jwt.claims', true)::jsonb)->>'role', '')
     <> 'service_role'
   and not public.is_admin() then
    raise exception 'coach_adjust_wallet: service role or admin only';
  end if;

  if p_kind not in ('topup','activation','adjust') then
    raise exception 'coach_adjust_wallet: unknown kind';
  end if;

  v_amount := round(p_amount::numeric, 2);
  if v_amount is null or v_amount = 0 then
    raise exception 'coach_adjust_wallet: amount must not be zero';
  end if;

  insert into public.coach_wallets (coach_id) values (p_coach_id)
  on conflict (coach_id) do nothing;

  select balance into v_balance
  from public.coach_wallets
  where coach_id = p_coach_id
  for update;

  v_new := v_balance + v_amount;
  if v_new < 0 then
    raise exception 'insufficient wallet balance';
  end if;

  -- 0098: the ledger insert now runs BEFORE the balance update —
  -- inside one transaction the order is invisible to every caller,
  -- but it lets the claim (uq_coach_wtxn_topup_ref) veto the race
  -- BEFORE the wallet balance ever moves.
  begin
    insert into public.coach_wallet_transactions
      (coach_id, kind, amount, balance_after, ref_id, note, created_by)
    values
      (p_coach_id, p_kind, v_amount, v_new, p_ref_id, p_note, p_created_by);
  exception when unique_violation then
    get stacked diagnostics v_constraint = CONSTRAINT_NAME;
    if v_constraint is distinct from 'uq_coach_wtxn_topup_ref' then
      raise;  -- not the top-up race lock — fail honestly
    end if;
    -- Top-up already credited (parallel replay): return the LIVE
    -- balance, no second credit, no error — the caller's 200 is
    -- idempotent.
    return v_balance;
  end;

  update public.coach_wallets
  set balance = v_new, updated_at = now()
  where coach_id = p_coach_id;

  return v_new;
end;
$$;

notify pgrst, 'reload schema';

-- ============================================================
-- VERIFY (read-only) — expect: claim_column=t | claim_lock=t |
-- wallet_lock=t | rpc_present=t | rpc_service_role_only=t
-- ============================================================
select
  (select exists (select 1 from pg_attribute
     where attrelid = 'public.subscription_requests'::regclass
       and attname = 'paypal_order_id'
       and not attisdropped))
    as claim_column,

  (select exists (select 1 from pg_indexes
     where schemaname = 'public'
       and indexname = 'uq_subscription_requests_paypal_order'))
    as claim_lock,

  (select exists (select 1 from pg_indexes
     where schemaname = 'public'
       and indexname = 'uq_coach_wtxn_topup_ref'))
    as wallet_lock,

  (select position('capture_paypal_subscription: service role only' in
     coalesce(pg_get_functiondef('public.capture_paypal_subscription(uuid, text, int, numeric, text, text, text)'::regprocedure), '')) > 0)
    as rpc_service_role_only,

  (select position('uq_coach_wtxn_topup_ref' in
     coalesce(pg_get_functiondef('public.coach_adjust_wallet(uuid, numeric, text, uuid, text, uuid)'::regprocedure), '')) > 0)
    as wallet_race_resolved;

-- END OF SCRIPT 0098
