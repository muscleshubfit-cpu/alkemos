import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, authRequired } from "@/lib/auth-server";
import { supabaseAdmin, isSupabaseAdminConfigured } from "@/lib/supabase/admin";
import type { Database } from "@/lib/supabase/types";
import { adminLeadPatchBodySchema, uuidQueryIdSchema } from "@/lib/validation/schemas";

// tool_slug is a DB enum — this union is its mirror (types.ts tool_leads.Row).
type ToolSlug = Database["public"]["Tables"]["tool_leads"]["Row"]["tool_slug"];

/**
 * GET /api/admin/leads?tool=calorie-calculator
 *
 * Returns all tool leads, optionally filtered by tool_slug.
 * Uses the service-role key to bypass RLS (the caller is verified
 * as a coach via requireAdmin before we get here).
 */
export async function GET(request: NextRequest) {
  if (authRequired) {
    const auth = await requireAdmin(request);
    if (auth instanceof Response) return auth;
  }

  if (!isSupabaseAdminConfigured || !supabaseAdmin) {
    return NextResponse.json(
      { error: "Server not configured" },
      { status: 500 },
    );
  }

  const { searchParams } = new URL(request.url);
  const tool = searchParams.get("tool");
  // M23 fix: support offset for pagination
  const offset = parseInt(searchParams.get("offset") || "0", 10) || 0;
  const limit = Math.min(parseInt(searchParams.get("limit") || "500", 10) || 500, 1000);

  let q = supabaseAdmin
    .from("tool_leads")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (tool && tool !== "all") {
    // Trust-boundary cast: an invalid tool value simply matches no rows at
    // the DB enum level (identical runtime behavior to the old `as any`).
    q = q.eq("tool_slug", tool as ToolSlug);
  }

  const { data, error, count } = await q;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // M23 fix: return total count for pagination UI
  return NextResponse.json({ leads: data || [], total: count ?? 0, offset, limit });
}

/**
 * PATCH /api/admin/leads
 *
 * Update a lead's contacted/converted flags.
 * Body: { id: string, contacted?: boolean, converted?: boolean }
 */
export async function PATCH(request: NextRequest) {
  if (authRequired) {
    const auth = await requireAdmin(request);
    if (auth instanceof Response) return auth;
  }

  if (!isSupabaseAdminConfigured || !supabaseAdmin) {
    return NextResponse.json(
      { error: "Server not configured" },
      { status: 500 },
    );
  }

  const body = await request.json().catch(() => ({}));

  // Wave 3 zod gate — shape only; the two legacy 400 classes below are
  // re-derived verbatim on gate failure (compat law).
  const parsed = adminLeadPatchBodySchema.safeParse(body);
  if (!parsed.success) {
    const raw = (body ?? {}) as Record<string, unknown>;
    if (!raw.id) {
      return NextResponse.json({ error: "id is required" }, { status: 400 });
    }
    const rawUpdate: Record<string, boolean> = {};
    if (typeof raw.contacted === "boolean") rawUpdate.contacted = raw.contacted;
    if (typeof raw.converted === "boolean") rawUpdate.converted = raw.converted;
    if (Object.keys(rawUpdate).length === 0) {
      return NextResponse.json({ error: "Nothing to update" }, { status: 400 });
    }
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid request" },
      { status: 400 },
    );
  }

  const { id, contacted, converted } = parsed.data;

  if (!id) {
    return NextResponse.json({ error: "id is required" }, { status: 400 });
  }

  const update: Partial<
    Pick<Database["public"]["Tables"]["tool_leads"]["Update"], "contacted" | "converted">
  > = {};
  if (typeof contacted === "boolean") update.contacted = contacted;
  if (typeof converted === "boolean") update.converted = converted;

  if (Object.keys(update).length === 0) {
    return NextResponse.json({ error: "Nothing to update" }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from("tool_leads")
    .update(update)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ lead: data });
}

/**
 * DELETE /api/admin/leads?id=<uuid>
 *
 * Delete a lead (GDPR / right-to-erasure).
 * M24 fix: previously no DELETE endpoint existed — PII could not be purged.
 */
export async function DELETE(request: NextRequest) {
  if (authRequired) {
    const auth = await requireAdmin(request);
    if (auth instanceof Response) return auth;
  }

  if (!isSupabaseAdminConfigured || !supabaseAdmin) {
    return NextResponse.json(
      { error: "Server not configured" },
      { status: 500 },
    );
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  // Wave 3 zod gate — the 2B DELETE-id fail-fast class: missing re-derives
  // the legacy «id is required» 400 verbatim; garbage that legacy silently
  // no-op'd 200 now 400s BEFORE the doomed DB roundtrip.
  const parsedId = uuidQueryIdSchema.safeParse(id ?? "");
  if (!parsedId.success) {
    if (!id) {
      return NextResponse.json({ error: "id is required" }, { status: 400 });
    }
    return NextResponse.json(
      { error: parsedId.error.issues[0]?.message ?? "Invalid request" },
      { status: 400 },
    );
  }

  const { error } = await supabaseAdmin
    .from("tool_leads")
    .delete()
    .eq("id", parsedId.data);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
