import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { supabaseAdmin, isSupabaseAdminConfigured } from "@/lib/supabase/admin";
import { emailSchema, MAX_COACH_NAME_LEN } from "@/lib/validation/schemas";
import { rateLimit, clientIp } from "@/lib/rate-limit";
import { isAdoptableInvitedUser } from "@/lib/auth-invite-adopt";

/**
 * H1-2026 FIX (UX-TEST-REPORT-2026-09-21 §3, owner order «ابدأ تنفيذ
 * الخطوة التالية» 2026-09-21 — the order IS the §7 pre-approval for this
 * auth-flow change; see SECURITY.md §9.8).
 *
 * COMPLETE-INVITE ADOPTION — the stranded-invitee rescue path.
 *
 * A coach invite pre-creates the auth.users row with an EMPTY password
 * (GoTrue inviteUserByEmail). If the invited person signs up like any
 * visitor (the common case — he never saw the email), GoTrue answers the
 * M2 duplicate signal and the account is unreachable: «Account already
 * exists» → «Invalid login credentials», forever, unless the emailed link
 * works. This route completes what the invite started: the SAME signup
 * form data (email + the password the person just chose) activates the
 * pending invite — password written, profile name/phone updated, normal
 * signIn then proceeds client-side.
 *
 * POST /api/auth/complete-invite  { email, password, full_name?, phone? }
 *
 * SAFETY (defense in depth — see lib/auth-invite-adopt.ts):
 * - GATE: the target must have `invited_at` set AND `last_sign_in_at`
 *   null (pending invite, never activated). Self-registered users always
 *   lack invited_at → their password can NEVER be rewritten here.
 * - ANTI-ENUMERATION: the answer is a uniform { ok:false } for every
 *   non-adoptable case (unknown email, already active, not invited) —
 *   no new account-state oracle beyond what signup already reveals.
 * - RATE LIMIT: 5 attempts / 10 min / IP (shared lib/rate-limit store —
 *   Upstash in production, memory fallback in dev; coachreg precedent).
 * - NO NEW EXTERNAL CALLS (§7): the HIBP breach check stays CLIENT-side
 *   (AuthView already ran it before signUp; the same password value
 *   arrives here — server-side HIBP would be a new external dependency).
 * - MONEY/RLS untouched: writes go through the service-role admin auth
 *   API + a bounded profiles update by primary key — no coach_assignments,
 *   wallet, or RLS policy change.
 */

const PASSWORD_MIN = 8; // Phase 134 server parity (password_min_length=8)
const PASSWORD_MAX = 128; // GoTrue's own practical ceiling

const RATE_LIMIT_WINDOW = 10 * 60 * 1000; // 10 minutes
const RATE_LIMIT_MAX = 5; // signup-adjacent — a real person retries once

const PHONE_RE = /^[+\d][\d\s-]{6,19}$/; // coachregister cleanPhone precedent

/** Optional profile fields the adopter may refresh (invite stored the
 *  COACH-typed name; the person's own form value is authoritative). */
const fullNameSchema = z.string().trim().min(1).max(MAX_COACH_NAME_LEN);

const completeInviteBodySchema = z.object({
  email: emailSchema,
  password: z.string().min(PASSWORD_MIN).max(PASSWORD_MAX),
  full_name: fullNameSchema.optional(),
  phone: z.unknown().optional(), // shape-checked below (cleanPhone precedent)
});

function cleanPhone(v: unknown): string | null {
  const s = String(v ?? "").trim();
  if (!s) return null;
  if (!PHONE_RE.test(s)) return null;
  return s.slice(0, 20);
}

export async function POST(request: NextRequest) {
  if (!isSupabaseAdminConfigured || !supabaseAdmin) {
    return NextResponse.json({ error: "Server not configured" }, { status: 500 });
  }

  const ip = clientIp(request);
  const rate = await rateLimit(`inviteadopt:${ip}`, RATE_LIMIT_MAX, RATE_LIMIT_WINDOW);
  if (!rate.allowed) {
    return NextResponse.json(
      { error: "rate_limited", message: "محاولات كثيرة — انتظر قليلًا ثم حاول مرة أخرى" },
      {
        status: 429,
        headers: { "Retry-After": String(Math.ceil((rate.resetAt - Date.now()) / 1000)) },
      },
    );
  }

  const body = await request.json().catch(() => ({} as Record<string, unknown>));
  const parsed = completeInviteBodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "invalid_request" }, { status: 400 });
  }

  const { email, password } = parsed.data;
  const fullName = parsed.data.full_name ?? null;
  const phone = cleanPhone(parsed.data.phone);

  // 1) The invite flow guarantees a profiles row (trigger + invite-API
  //    safety net). Its id IS the auth user id.
  const { data: profile } = await supabaseAdmin
    .from("profiles")
    .select("id, role")
    .ilike("email", email)
    .maybeSingle();

  if (!profile?.id) {
    // Unknown email — uniform non-committal answer (anti-enumeration).
    return NextResponse.json({ ok: false }, { status: 200 });
  }

  // 2) GATE: pending invite only. getUserById is the GoTrue admin read;
  //    invited_at + last_sign_in_at are the two stamped fields the fix
  //    verified live on production (both stranded invitees: invited=true,
  //    never_signed_in=true, encrypted_password='').
  const { data: userData, error: userErr } = await supabaseAdmin.auth.admin.getUserById(profile.id);
  const gtu = userData?.user;
  if (userErr || !gtu || !isAdoptableInvitedUser(gtu)) {
    return NextResponse.json({ ok: false }, { status: 200 });
  }

  // 3) ADOPT: write the chosen password + confirm (idempotent — the
  //    autoconfirm trigger already stamped email_confirmed_at at invite
  //    time; email_confirm:true keeps GoTrue's flag consistent with it).
  const { error: updErr } = await supabaseAdmin.auth.admin.updateUserById(profile.id, {
    password,
    email_confirm: true,
  });
  if (updErr) {
    return NextResponse.json(
      { ok: false, error: "adopt_failed", message: `تعذر إكمال تفعيل الحساب: ${updErr.message}` },
      { status: 502 },
    );
  }

  // 4) Refresh the profile identity with the person's own form values
  //    (the invite row may hold the coach-typed placeholder). Bounded by
  //    primary key; RLS-neutral (service role) — no other column touched.
  const patch: Partial<{ full_name: string; phone: string }> = {};
  if (fullName) patch.full_name = fullName;
  if (phone) patch.phone = phone;
  if (Object.keys(patch).length > 0) {
    await supabaseAdmin.from("profiles").update(patch).eq("id", profile.id);
  }

  return NextResponse.json({ ok: true });
}
