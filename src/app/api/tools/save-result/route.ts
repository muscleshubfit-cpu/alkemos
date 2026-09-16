import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { requireUser, authRequired } from "@/lib/auth-server";
import { getLimits, type MembershipTier } from "@/lib/memberships";
import {
  savedResultBodySchema,
  SAVED_RESULT_TOOL_SLUGS,
} from "@/lib/validation/schemas";

/**
 * POST /api/tools/save-result
 *
 * Saves a tool result to the saved_results table.
 * Enforces membership limits (Free: 3, Premium: 50, Pro: 200).
 * Staff (coach/admin) are UNLIMITED — owner decree 2026-09-01:
 * «الادمن بلا حدود في كل وظائف الموقع».
 *
 * Body:
 *   { tool_slug: string, title?: string, result_data: object }
 *
 * P1-7 (deep-audit 2026-09-16, owner-approved §7): the body passes the
 * central zod gate FIRST — title ≤200 chars and result_data ≤10KB
 * (MAX_RESULT_JSON_BYTES) now 400 instead of landing in the DB
 * unbounded. Legacy failure classes keep their exact responses: the
 * fallback below re-derives "Invalid tool" / "Missing result_data"
 * before the zod message, and falsy result_data values (0/""/false)
 * keep the legacy "Missing result_data" path on the success side.
 */
export async function POST(request: NextRequest) {
  if (!authRequired) {
    return NextResponse.json({ ok: true, demo: true });
  }

  const auth = await requireUser(request);
  if (auth instanceof Response) return auth;

  const ALLOWED_TOOLS: readonly string[] = SAVED_RESULT_TOOL_SLUGS;

  const body = await request.json().catch(() => ({}));
  const parsed = savedResultBodySchema.safeParse(body);
  if (!parsed.success) {
    // Legacy responses preserved verbatim (§3.8 compat law):
    const raw = (body ?? {}) as Record<string, unknown>;
    if (!ALLOWED_TOOLS.includes(raw.tool_slug as string)) {
      return NextResponse.json({ error: "Invalid tool" }, { status: 400 });
    }
    if (!raw.result_data) {
      return NextResponse.json({ error: "Missing result_data" }, { status: 400 });
    }
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid request" },
      { status: 400 },
    );
  }
  const { tool_slug, title, result_data } = parsed.data;

  // Legacy falsy semantics: 0/false/"" were always "Missing result_data".
  if (!result_data) {
    return NextResponse.json({ error: "Missing result_data" }, { status: 400 });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  const supabase = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  // Check current count for this user
  const { count } = await supabase
    .from("saved_results")
    .select("*", { count: "exact", head: true })
    .eq("user_id", auth.id);

  // Use the real membership tier from the auth user (resolved from
  // the subscriptions table inside requireUser).
  const tier: MembershipTier = auth.membership_tier;
  const limits = getLimits(tier);
  const maxSaved = limits.savedResultsLimit;
  // Phase 71 — staff bypass: admins/coaches never hit the cap.
  const unlimited = auth.is_staff === true;

  if (!unlimited && maxSaved !== null && (count || 0) >= maxSaved) {
    return NextResponse.json(
      {
        error: "Limit reached",
        limit: maxSaved,
        current: count,
        message: `You've reached your limit of ${maxSaved} saved results. Upgrade your membership for more.`,
      },
      { status: 403 },
    );
  }

  // Insert
  const { data, error } = await supabase
    .from("saved_results")
    .insert({
      user_id: auth.id,
      tool_slug,
      title: title || null,
      result_data,
    })
    .select("id, created_at")
    .single();

  if (error) {
    console.error("[api/tools/save-result] Insert failed:", error.message);
    return NextResponse.json({ error: "Failed to save" }, { status: 500 });
  }

  return NextResponse.json({
    ok: true,
    id: data?.id,
    created_at: data?.created_at,
    remaining: !unlimited && maxSaved !== null ? maxSaved - ((count || 0) + 1) : null,
  });
}
