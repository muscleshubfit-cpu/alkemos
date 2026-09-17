import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth-server";
import { processSubscriptionInitialPaymentServer } from "@/lib/affiliate-engine-server";
import { affiliateCommissionBodySchema } from "@/lib/validation/schemas";

/**
 * POST /api/affiliate/commission — Phase 66 (owner-approved).
 *
 * Runs the affiliate commission for a MANUAL receipt approval from the
 * SERVER instead of the admin's browser. The Phase 64 study proved the
 * old browser-side engine call failed silently twice: the referrals
 * INSERT policy blocked the tracking row, and affiliate_transactions /
 * affiliate_commissions never existed in production. With 0057 live the
 * tables exist — this route makes the manual path actually work.
 *
 * Body: { userId, amount, reference, productId }
 *   - userId     the paying client (subscription_requests.user_id)
 *   - amount     price actually paid (USD)
 *   - reference  subscription_requests.id → idempotency key
 *   - productId  plan tier bought
 *
 * The coach-clients gate (owner decree 2026-08-30) runs INSIDE the server
 * engine — shared verbatim with the PayPal capture path.
 *
 * Non-blocking by contract: the caller (reviewSubscriptionRequest) treats
 * failures as log-only so payment approval is never blocked.
 */
export async function POST(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (auth instanceof Response) return auth;

  const body = await request.json().catch(() => ({} as Record<string, unknown>));

  // Wave 3 zod gate — shape only (§7 owner-approved: the engine's
  // coach-clients gate + idempotency stay untouched route policy); the
  // legacy bad_request 400 is re-derived verbatim on gate failure.
  const parsed = affiliateCommissionBodySchema.safeParse(body);
  if (!parsed.success) {
    const raw = (body ?? {}) as Record<string, unknown>;
    const rawUserId = String(raw.userId ?? "").trim();
    const rawAmount = Number(raw.amount);
    const rawReference = String(raw.reference ?? "").trim();
    if (!rawUserId || !rawReference || !Number.isFinite(rawAmount) || rawAmount <= 0) {
      return NextResponse.json({ error: "bad_request" }, { status: 400 });
    }
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid request" },
      { status: 400 },
    );
  }

  const userId = parsed.data.userId;
  const amount = Number(parsed.data.amount);
  const reference = parsed.data.reference;
  const productId = parsed.data.productId ?? "";

  if (!userId || !reference || !Number.isFinite(amount) || amount <= 0) {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }

  try {
    const commission = await processSubscriptionInitialPaymentServer(
      userId,
      amount,
      reference,
      productId || "unknown",
    );
    return NextResponse.json({
      ok: true,
      // null = skipped (coach's client / no referral) — not an error
      commission: commission ? { amount: commission.amount } : null,
    });
  } catch (e) {
    console.error("[api/affiliate/commission] error:", e);
    // 200 with error flag — the approval already happened; commission is
    // best-effort and MUST NOT make the admin's browser show a failure.
    return NextResponse.json({ ok: false, error: "engine_error" }, { status: 200 });
  }
}
