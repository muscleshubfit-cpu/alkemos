import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin, isSupabaseAdminConfigured } from "@/lib/supabase/admin";
import { isAuthConfigured, requireUser, type AuthUser } from "@/lib/auth-server";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { parseEvoFeedbackInput } from "@/lib/evo-feedback";

/**
 * EVO feedback endpoint (EVO-1 — W5.1 of docs/EVO-MASTER-PLAN.md).
 *
 * POST /api/ai/feedback  body: { feedback: "up"|"down", reason?, messageId?,
 *                                question?, reply? }
 *
 * The 👍/👎 quality signal for EVO chat replies. Written to `evo_feedback`
 * (migration 0077) via SERVICE-ROLE — the browser never writes the table
 * directly, so every row has passed validation + the per-IP rate limit
 * (20/min — a human rates a handful of replies per session).
 *
 * PRIVACY (D3-consistent): snippets are truncated context for the admin
 * weekly review ONLY — same content the admin can already read in
 * chat_messages, never sent anywhere else.
 *
 * RESILIENCE: feedback is telemetry, not a user action — every failure
 * degrades to 200 {saved:false} so a broken ledger can never break the
 * chat UX.
 */
export const maxDuration = 15;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null);
    const parsed = parseEvoFeedbackInput(body);
    if (!parsed.ok) {
      return NextResponse.json({ error: parsed.error }, { status: 400 });
    }

    // Identity is optional — anonymous ratings land with client_id null.
    let user: AuthUser | null = null;
    if (isAuthConfigured) {
      const auth = await requireUser(request);
      if (!(auth instanceof Response)) user = auth;
    }

    // Per-IP fixed window — identical shape to the send-email guard (H3).
    const rl = await rateLimit(`evo-feedback:${clientIp(request)}`, 20, 60_000);
    if (!rl.allowed) {
      return NextResponse.json(
        { error: "Too many ratings — slow down." },
        { status: 429, headers: { "Retry-After": "60" } },
      );
    }

    if (!isSupabaseAdminConfigured || !supabaseAdmin) {
      // Demo mode (no Supabase env): acknowledge without persisting —
      // the widget UX must stay unaffected.
      return NextResponse.json({ saved: false, reason: "not-configured" });
    }

    const { error } = await supabaseAdmin.from("evo_feedback").insert({
      client_id: user?.id ?? null,
      feedback: parsed.value.feedback,
      reason: parsed.value.reason,
      message_id: parsed.value.messageId,
      snippet:
        parsed.value.question || parsed.value.reply
          ? {
              question: parsed.value.question,
              reply: parsed.value.reply,
            }
          : null,
    });
    if (error) {
      console.error("[api/ai/feedback] insert failed:", error.message);
      return NextResponse.json({ saved: false, reason: "insert-failed" });
    }

    return NextResponse.json({ saved: true });
  } catch (e) {
    console.error("[api/ai/feedback] unexpected:", e);
    return NextResponse.json({ saved: false, reason: "server-error" });
  }
}
