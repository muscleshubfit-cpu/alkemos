import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { requireCoach } from "@/lib/auth-server";
import { supabaseAdmin, isSupabaseAdminConfigured } from "@/lib/supabase/admin";
import { coachInviteBodySchema } from "@/lib/validation/schemas";
import { rateLimit, clientIp } from "@/lib/rate-limit";
import type { Database } from "@/lib/supabase/types";

/**
 * COACH INVITES HIS OWN CLIENT (owner answer 1 — «الطريقتين»):
 * the coach brings clients either through his landing page (0033
 * attribution via coach_slug metadata) OR by personally inviting an
 * email. This route is path #2.
 *
 * POST /api/coach/clients/invite  { email, full_name? }
 *
 * - requireCoach (staff). A COACH's invite carries coach_id metadata →
 *   the 0033 trigger assigns the new client to HIM. An ADMIN's invite
 *   carries NO coach_id → site client → auto-assigned to the admin.
 * - The invited person receives the standard Supabase invite email and
 *   sets his own password (same flow as the admin add-coach invite).
 * - An email already registered as a CLIENT is REFUSED (409): per the
 *   owner's model coaches have no claim on existing clients — only the
 *   admin can reassign them (admin answer 2). That keeps the affiliate
 *   / site-client pool untouchable by coaches.
 *
 * Wave 2A (2026-09-17): zod boundary gate — email trim/lowercase/≤254
 * + full_name ≤120 (the legacy slice point) + unknown-key stripping.
 * The legacy invalid_email class is re-derived verbatim on gate
 * failure; a >120 full_name (previously truncated silently) is the
 * only new 400.
 *
 * W1-2b (S-03, Phase 331 — 2026-10-02 audit): this endpoint used to
 * go from auth straight to inviteUserByEmail with NO rate limit (its
 * sibling invite/resend was limited 5/min/IP + 3/h/email) — and coach
 * registration is PUBLIC by design, so any anonymous user could
 * become a coach and use this route as a spam sender from the site's
 * domain, draining the Supabase email quota and minting unbounded
 * auth.users rows. Now it carries the SAME limits as resend (the
 * plan's «مطابق resend») plus a per-coach cap on PENDING invites:
 *
 *   • 5/min/IP + 3/hour/email via the shared cross-instance limiter
 *     (src/lib/rate-limit.ts — Upstash when configured, in-memory
 *     dev/demo fallback). Keys are namespaced `invite-send:` — the
 *     resend route's `invite-resend:` counters are a DIFFERENT action
 *     (re-notification of an existing pending invitee) and must
 *     neither starve nor be starved by fresh invitations.
 *   • PENDING_INVITES_CAP per coach: a coach with too many UNACCEPTED
 *     invitations (0092 law: invited_at set, never signed in) gets an
 *     honest 429 until his invitees activate. The count is the 0092
 *     single source itself — get_coach_client_stats().pending_invites
 *     — read via the REQUESTER's own session (anon key + cookies),
 *     because the SECURITY DEFINER RPC scopes by auth.uid() and the
 *     service-role client would see nobody (auth.uid() null). Coach
 *     role ONLY: the S-03 threat is the public coach signup; admin
 *     inviters are owner-controlled staff, and for them the stats RPC
 *     counts the whole site anyway (is_admin branch) — not their own.
 *     If the RPC errors the cap FAILS OPEN (logged): the rate limits
 *     still bound abuse, and a DB outage breaks inviteUserByEmail
 *     itself — no rows are minted through a dead database.
 */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// W1-2b limits — the resend route's exact pair (S-03 «مطابق resend»).
const IP_WINDOW = 60 * 1000;
const IP_MAX = 5;
const EMAIL_WINDOW = 60 * 60 * 1000;
const EMAIL_MAX = 3;
// A real coaching roster rarely holds more than a few dozen
// UNACCEPTED invitations (pending = never signed in — only the
// invitee's activation clears it); a spammer hits the cap fast.
const PENDING_INVITES_CAP = 30;

function siteUrl(): string {
  return (
    process.env.NEXT_PUBLIC_SITE_URL || "https://alkemos.com"
  ).replace(/\/$/, "");
}

/**
 * The coach's OWN pending-invite count — the 0092 single source
 * (get_coach_client_stats().pending_invites: invited_at set + never
 * signed in, SECURITY DEFINER, auth.uid()-scoped). Called with the
 * REQUESTER's session (the getAuthUser cookie pattern) so the RPC sees
 * the calling coach — the service-role client would see nobody.
 * Returns null when the count is unavailable (no auth env / RPC
 * error) — callers treat null as "cap unknown" (fail-open, logged).
 */
async function coachPendingInvites(request: NextRequest): Promise<number | null> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
  if (!url.startsWith("http") || !anonKey) return null;

  const supabase = createServerClient<Database>(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll() {
        // No-op: read-only scope check, no cookie refresh needed here.
      },
    },
  });

  const { data, error } = await supabase.rpc("get_coach_client_stats");
  if (error || !Array.isArray(data) || data.length === 0) {
    if (error) {
      console.error("[api/coach/clients/invite] get_coach_client_stats failed:", error.message);
    }
    return null;
  }
  return Number(data[0]?.pending_invites ?? 0);
}

export async function POST(request: NextRequest) {
  const auth = await requireCoach(request);
  if (auth instanceof Response) return auth;

  if (!isSupabaseAdminConfigured || !supabaseAdmin) {
    return NextResponse.json({ error: "Server not configured" }, { status: 500 });
  }

  // W1-2b (S-03): the resend route's IP window comes FIRST — even
  // junk bodies burn it (flood brake), matching the sibling's order.
  const ip = clientIp(request);
  const ipLimit = await rateLimit(`invite-send:ip:${ip}`, IP_MAX, IP_WINDOW);
  if (!ipLimit.allowed) {
    return NextResponse.json(
      { error: "rate_limited", message: "محاولات كثيرة — انتظر دقيقة ثم حاول مرة أخرى" },
      { status: 429, headers: { "Retry-After": "60" } },
    );
  }

  const body = await request.json().catch(() => ({} as Record<string, unknown>));

  // Wave 2A zod gate — legacy invalid_email re-derived verbatim on failure.
  const parsed = coachInviteBodySchema.safeParse(body);
  if (!parsed.success) {
    const raw = (body ?? {}) as Record<string, unknown>;
    if (!EMAIL_RE.test(String(raw.email ?? "").trim().toLowerCase())) {
      return NextResponse.json(
        { error: "invalid_email", message: "اكتب بريدًا إلكترونيًا صحيحًا" },
        { status: 400 },
      );
    }
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid request" },
      { status: 400 },
    );
  }

  const email = parsed.data.email;
  const fullName = (parsed.data.full_name ?? "").trim().slice(0, 120) || null;

  // W1-2b (S-03): same per-email ceiling as resend (3/hour) — a fresh
  // invitation to the same mailbox is bounded independently of the
  // resend counters (different action, different namespace).
  const emailLimit = await rateLimit(`invite-send:email:${email}`, EMAIL_MAX, EMAIL_WINDOW);
  if (!emailLimit.allowed) {
    return NextResponse.json(
      { error: "rate_limited", message: "تم إرسال عدة دعوات لهذا البريد مؤخرًا — حاول بعد ساعة" },
      { status: 429 },
    );
  }

  if (!EMAIL_RE.test(email)) {
    return NextResponse.json(
      { error: "invalid_email", message: "اكتب بريدًا إلكترونيًا صحيحًا" },
      { status: 400 },
    );
  }

  // Existing profile? Coaches may NOT invite existing clients.
  // W1-2a (S-04, Phase 330): EXACT match — the old `.ilike` treated the
  // input as a PATTERN (`a%@x.com` matched `ahmed@x.com`), so a
  // pattern-shaped email surfaced OTHER people's accounts as a false
  // 409 "already registered". Emails are stored lowercase (zod
  // emailSchema lowercases).
  const { data: existing } = await supabaseAdmin
    .from("profiles")
    .select("id, role")
    .eq("email", email.toLowerCase())
    .maybeSingle();

  if (existing) {
    return NextResponse.json(
      {
        error: existing.role === "client" ? "already_registered_client" : "already_registered_staff",
        message:
          existing.role === "client"
            ? "هذا الإيميل عميل مسجل بالفعل — الأدمن فقط يمكنه تعيينه لك"
            : "هذا الإيميل من فريق العمل بالفعل",
      },
      { status: 409 },
    );
  }

  // W1-2b (S-03): the per-coach pending-invites cap — coaches only
  // (the S-03 threat is the PUBLIC coach signup; admins are
  // owner-controlled staff). Fail-open on an unavailable count (the
  // rate limits above still bound the abuse window).
  if (auth.role === "coach") {
    const pending = await coachPendingInvites(request);
    if (pending !== null && pending >= PENDING_INVITES_CAP) {
      return NextResponse.json(
        {
          error: "pending_invite_cap",
          message:
            `لديك ${pending} دعوة منتظرة للتفعيل — لن تُرسل دعوات جديدة حتى يفعّل عملاؤك حساباتهم أو يتدخل الدعم لتنظيف القائمة`,
        },
        { status: 429 },
      );
    }
  }

  // Metadata drives the 0033 trigger: coach → his client; admin → site client.
  const metadata: Record<string, string> = {
    ...(fullName ? { full_name: fullName } : {}),
    ...(auth.role === "coach" ? { coach_id: auth.id } : {}),
  };

  // PHASE 143 (live UX test finding — honest exits): on production this
  // exact call CRASHED the whole Vercel function (Cloudflare text-502, no
  // app headers, nothing persisted, coach saw only «Invite failed»).
  // Isolation proof: no-auth → clean 401 · existing-email → clean 409 ·
  // wallet/ads/whatsapp routes → 200 — the crash lives INSIDE
  // inviteUserByEmail (a THROW, not a {error} return). Wrap it so ANY
  // throw becomes an honest JSON 502 carrying the underlying reason —
  // the UI toast surfaces `message`, which makes the root cause (most
  // likely the project's SMTP/GoTrue email path) visible to the coach
  // and to the owner instead of a dead lambda.
  let invited: Awaited<ReturnType<typeof supabaseAdmin.auth.admin.inviteUserByEmail>>["data"];
  let inviteErr: Awaited<ReturnType<typeof supabaseAdmin.auth.admin.inviteUserByEmail>>["error"];
  try {
    const res = await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
      data: metadata,
      redirectTo: `${siteUrl()}/auth?next=/dashboard`,
    });
    invited = res.data;
    inviteErr = res.error;
  } catch (e) {
    return NextResponse.json(
      {
        error: "invite_failed",
        message: `فشل إرسال الدعوة (استثناء): ${e instanceof Error ? e.message : "سبب غير معروف"}`,
      },
      { status: 502 },
    );
  }

  if (inviteErr || !invited?.user) {
    return NextResponse.json(
      {
        error: "invite_failed",
        message: `فشل إرسال الدعوة: ${inviteErr?.message ?? "سبب غير معروف"}`,
      },
      { status: 502 },
    );
  }

  const userId = invited.user.id;

  // Safety net: make sure the profile exists and (for coaches) the
  // assignment row exists, in case the trigger hasn't fired yet.
  const { data: prof } = await supabaseAdmin
    .from("profiles")
    .select("id")
    .eq("id", userId)
    .maybeSingle();

  if (!prof) {
    await supabaseAdmin.from("profiles").upsert(
      {
        id: userId,
        email,
        full_name: fullName ?? email,
        role: "client",
      },
      { onConflict: "id" },
    );
  }

  if (auth.role === "coach") {
    await supabaseAdmin
      .from("coach_assignments")
      .upsert(
        {
          client_id: userId,
          coach_id: auth.id,
          assigned_by: auth.id,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "client_id" },
      );
  }

  return NextResponse.json({ ok: true, action: "invited", email });
}
