import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/auth-server";
import { supabaseAdmin, isSupabaseAdminConfigured } from "@/lib/supabase/admin";
import { emptyEnvelopeBodySchema } from "@/lib/validation/schemas";
import { getPrimaryAdminId } from "@/lib/notifications-server";

/**
 * POST /api/affiliate/payout-notify — Phase 75 (owner request:
 * «5 إشعارات الأفيليت» — the missing admin bell for payout requests).
 *
 * WHY AN API: createPayoutRequest() runs in the BROWSER (referral.ts) and
 * admin_notifications INSERT is admin-only under RLS — a member asking for
 * a payout can never ring the owner's bell directly. This route does it
 * with the service role, AFTER the browser saved the payout row.
 *
 * ABUSE GUARDS (keep the owner's bell clean):
 *   1. requireUser — must be logged in.
 *   2. The caller must have a referral_payouts row with status='pending'
 *      created in the last 10 minutes (so replaying the call does nothing
 *      and only real fresh requests ring).
 *   3. Dedup — if an unread 'payout_request' bell for this user already
 *      exists (matched by the [uid:...] tag in the body), skip — reloads
 *      never spam the owner.
 *
 * Best-effort by design: always 200 for a valid caller; bell failures are
 * logged, never surfaced as client errors.
 */
export async function POST(request: NextRequest) {
  const auth = await requireUser(request);
  if (auth instanceof Response) return auth;

  if (!isSupabaseAdminConfigured || !supabaseAdmin) {
    return NextResponse.json({ error: "Server not configured" }, { status: 500 });
  }

  // Wave 3 zod gate — the sanctioned 221 empty-envelope class: this
  // route consumes NO request fields (everything derives from auth.id +
  // the DB), so the gate pins the ENVELOPE only — null/unparseable maps
  // to {} pre-gate and any object passes with unknown keys stripped
  // (identical to legacy ignore semantics); a hostile NON-object body
  // (legacy silent ignore → 200 flow) now 400s before the flow.
  const rawBody = await request.json().catch(() => null);
  const parsedBody = emptyEnvelopeBodySchema.safeParse(rawBody ?? {});
  if (!parsedBody.success) {
    return NextResponse.json(
      { error: parsedBody.error.issues[0]?.message ?? "Invalid request" },
      { status: 400 },
    );
  }

  const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000).toISOString();

  // Guard 1 — a genuinely fresh pending payout from this user
  const { data: payout } = await supabaseAdmin
    .from("referral_payouts")
    .select("id, amount, method")
    .eq("user_id", auth.id)
    .eq("status", "pending")
    .gte("created_at", tenMinutesAgo)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!payout) {
    // No fresh pending payout → nothing to announce (not an error)
    return NextResponse.json({ ok: true, notified: false });
  }

  // Guard 2 — dedup unread bells for the same user (body carries [uid:...])
  const { data: existing } = await supabaseAdmin
    .from("admin_notifications")
    .select("id")
    .eq("type", "payout_request")
    .eq("read", false)
    .filter("body", "ilike", `%[uid:${auth.id}]%`)
    .limit(1)
    .maybeSingle();
  if (existing) {
    return NextResponse.json({ ok: true, notified: false, dedup: true });
  }

  const methodLabel =
    (payout as { method: string }).method === "cash_wallet"
      ? "محفظة كاش"
      : (payout as { method: string }).method === "subscription_discount"
        ? "خصم اشتراك"
        : "تحويل بنكي";

  const name = auth.full_name || auth.email || "عضو";

  // Phase 246: payout requests are ADMIN business (/admin/referrals) —
  // the old NULL target broadcast to every coach's bell. Route to the
  // primary admin explicitly (fallback: NULL broadcast).
  const adminTarget = await getPrimaryAdminId();
  const { error } = await supabaseAdmin.from("admin_notifications").insert({
    type: "payout_request",
    title: "طلب صرف عمولة جديد 💸",
    body: `${name} طلب صرف $${Number((payout as { amount: number }).amount).toFixed(2)} عبر ${methodLabel}. راجعه من صفحة الإحالات. [uid:${auth.id}]`,
    link: "/admin/referrals",
    target_role: "admin",
    ...(adminTarget ? { target_coach_id: adminTarget } : {}),
    read: false,
  });

  if (error) {
    console.error("[payout-notify] bell insert failed:", error.message);
    return NextResponse.json({ ok: true, notified: false });
  }

  return NextResponse.json({ ok: true, notified: true });
}
