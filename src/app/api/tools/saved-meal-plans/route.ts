import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { requireUser, authRequired } from "@/lib/auth-server";
import { isSupabaseAdminConfigured } from "@/lib/supabase/admin";
import { savedToolDeleteIdSchema } from "@/lib/validation/schemas";

/**
 * GET /api/tools/saved-meal-plans
 *   Returns all saved meal plans for the authenticated user.
 *
 * DELETE /api/tools/saved-meal-plans?id=xxx
 *   Deletes a specific meal plan.
 *
 * Wave 2B (2026-09-17): same DELETE id gate as saved-results —
 * missing id keeps the legacy «Missing id» 400 verbatim; garbage ids
 * (previously a silent no-op 200) now 400 before the doomed DB
 * roundtrip. Ownership stays .eq("user_id", auth.id).
 */
export async function GET(request: NextRequest) {
  if (!authRequired) {
    return NextResponse.json({ results: [] });
  }

  const auth = await requireUser(request);
  if (auth instanceof Response) return auth;

  // Phase 216 (P2-7 — deep-audit confirmed-17): config gate before the
  // raw env reads — graceful 500 instead of a crash when the service
  // key is missing (same law as the rest of the API).
  if (!isSupabaseAdminConfigured) {
    return NextResponse.json({ error: "Server not configured" }, { status: 500 });
  }
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  const supabase = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data, error } = await supabase
    .from("meal_plans")
    .select("*")
    .eq("user_id", auth.id)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ results: data || [] });
}

export async function DELETE(request: NextRequest) {
  if (!authRequired) {
    return NextResponse.json({ ok: true, demo: true });
  }

  const auth = await requireUser(request);
  if (auth instanceof Response) return auth;

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }
  // Wave 2B zod gate — garbage ids 400 before the doomed roundtrip.
  const parsedId = savedToolDeleteIdSchema.safeParse(id);
  if (!parsedId.success) {
    return NextResponse.json(
      { error: parsedId.error.issues[0]?.message ?? "Invalid request" },
      { status: 400 },
    );
  }

  // Phase 216 (P2-7 — deep-audit confirmed-17): config gate before the
  // raw env reads — graceful 500 instead of a crash when the service
  // key is missing (same law as the rest of the API).
  if (!isSupabaseAdminConfigured) {
    return NextResponse.json({ error: "Server not configured" }, { status: 500 });
  }
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  const supabase = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { error } = await supabase
    .from("meal_plans")
    .delete()
    .eq("id", id)
    .eq("user_id", auth.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
