import { NextRequest, NextResponse } from "next/server";
import { requireCoach, authRequired, type AuthUser } from "@/lib/auth-server";
import { supabaseAdmin, isSupabaseAdminConfigured } from "@/lib/supabase/admin";
import { coachSupportBodySchema } from "@/lib/validation/schemas";

/**
 * COACH → SITE SUPPORT CHANNEL (0037, owner-approved: «دعم للمدربين
 * غير دعم الموقع» — and client support belongs to the COACH himself;
 * the site's support team handles PLATFORM matters for coaches).
 *
 * GET  /api/coach/support → the coach's threads (his messages + admin replies)
 * POST /api/coach/support { subject, body } → open a new thread
 *
 * Table: coach_support_messages (0037) — parent rows are the coach's
 * messages (parent_id null), admin replies reference the parent.
 * RLS lets the coach read/insert his own rows; everything else runs
 * service-side through this route (admin replies come from
 * /api/admin/coach-support).
 *
 * Wave 2A (2026-09-17): the POST body passes the central zod gate
 * (trim + ≤140/≤4000 ceilings + unknown-key stripping) — the legacy
 * bad_request class (empty subject/body) is re-derived verbatim on
 * gate failure; the oversize values that were previously truncated
 * silently now 400 (the documented P1-7 tightening pattern). The
 * ceilings live in the central schema (MAX_SUPPORT_SUBJECT/BODY).
 */

export async function GET(request: NextRequest) {
  let user: AuthUser;
  if (authRequired) {
    const auth = await requireCoach(request);
    if (auth instanceof Response) return auth;
    user = auth;
  } else {
    return NextResponse.json({ error: "Auth not configured" }, { status: 500 });
  }

  if (!isSupabaseAdminConfigured || !supabaseAdmin) {
    return NextResponse.json({ error: "Server not configured" }, { status: 500 });
  }

  const { data, error } = await supabaseAdmin
    .from("coach_support_messages")
    .select("id, parent_id, sender_role, subject, body, status, created_at")
    .eq("coach_id", user.id)
    .order("created_at", { ascending: true })
    .limit(200);

  if (error) {
    const code = (error as { code?: string }).code;
    if (code === "42P01") {
      return NextResponse.json({ threads: [], migration_missing: true });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const rows = (data ?? []) as unknown as Array<Record<string, unknown>>;
  const threads = rows
    .filter((r) => !r.parent_id)
    .map((parent) => ({
      id: String(parent.id),
      subject: String(parent.subject ?? ""),
      body: String(parent.body ?? ""),
      status: String(parent.status ?? "open"),
      created_at: String(parent.created_at),
      messages: rows
        .filter((r) => r.parent_id === parent.id)
        .map((r) => ({
          id: String(r.id),
          sender_role: String(r.sender_role),
          body: String(r.body ?? ""),
          created_at: String(r.created_at),
        })),
    }))
    .reverse(); // newest thread first

  return NextResponse.json({ threads });
}

export async function POST(request: NextRequest) {
  const auth = await requireCoach(request);
  if (auth instanceof Response) return auth;

  if (!isSupabaseAdminConfigured || !supabaseAdmin) {
    return NextResponse.json({ error: "Server not configured" }, { status: 500 });
  }

  const body = await request.json().catch(() => ({} as Record<string, unknown>));

  // Wave 2A zod gate — legacy bad_request re-derived verbatim on failure.
  const parsed = coachSupportBodySchema.safeParse(body);
  if (!parsed.success) {
    const raw = (body ?? {}) as Record<string, unknown>;
    if (!String(raw.subject ?? "").trim() || !String(raw.body ?? "").trim()) {
      return NextResponse.json(
        { error: "bad_request", message: "اكتب موضوع رسالتك ونصها الأول" },
        { status: 400 },
      );
    }
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid request" },
      { status: 400 },
    );
  }

  const subject = parsed.data.subject;
  const text = parsed.data.body;

  if (!subject || !text) {
    return NextResponse.json(
      { error: "bad_request", message: "اكتب موضوع رسالتك ونصها الأول" },
      { status: 400 },
    );
  }

  const { data, error } = await supabaseAdmin
    .from("coach_support_messages")
    .insert({
      coach_id: auth.id,
      sender_role: "coach",
      subject,
      body: text,
      status: "open",
    })
    .select("id")
    .single();

  if (error) {
    const code = (error as { code?: string }).code;
    if (code === "42P01") {
      return NextResponse.json(
        {
          error: "migration_missing",
          message: "جدول الدعم غير موجود — شغّل هجرة 0037 في Supabase أولًا (raw link في المحادثة)",
        },
        { status: 503 },
      );
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Admin visibility — same bell the other coach events ring.
  await supabaseAdmin
    .from("admin_notifications")
    .insert({
      type: "coach_support",
      title: "رسالة دعم من مدرب",
      body: subject,
      link: "/admin/coach-support",
      target_role: "coach",
    });

  return NextResponse.json({ ok: true, id: data?.id ?? null });
}
