import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { requireAdmin, authRequired } from "@/lib/auth-server";
import type { Database } from "@/lib/supabase/types";
import {
  generatePartnerKey,
  validatePartnerTheme,
} from "@/lib/evo-partner";

/**
 * /api/admin/evo-partners — EVO-6 (W6) partner key management.
 *
 * ADMIN-ONLY (requireAdmin BEFORE any query) + service-role — the 0082
 * tables carry ZERO client policies: a key row is a credential, so the
 * browser NEVER reads evo_api_keys directly; this route is the only
 * writer/reader and every mutation is admin-attributed by the session.
 *
 * GET    → keys list + per-key usage (current-month success / 30d total,
 *          aggregated in-process over a bounded ledger read — the same
 *          honest aggregation shape as /api/admin/evo-analytics).
 * POST   → create key: { partner_name, monthly_quota?, theme?, notes? }.
 *          The RAW key is returned ONCE and never stored (sha256 hash is
 *          the only credential material persisted — rotation = create a
 *          new key + deactivate the old one).
 * PATCH  → update: { id, partner_name?, monthly_quota?, is_active?,
 *          theme?, notes? } — deactivation is UPDATE is_active=false
 *          (the «الإيقاف UPDATE لا delete» law; there is NO delete path).
 *
 * Theme writes pass validatePartnerTheme (whitelist) — a partner can
 * never smuggle markup/URLs/CSS beyond the five safe variables.
 */

export const maxDuration = 15;

type PartnerKeyRow = Database["public"]["Tables"]["evo_api_keys"]["Row"];
type UsageRow = Database["public"]["Tables"]["evo_api_usage"]["Row"];

export async function GET(request: NextRequest) {
  if (!authRequired) {
    return NextResponse.json({ demo: true });
  }
  const auth = await requireAdmin(request);
  if (auth instanceof Response) return auth;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceKey) {
    return NextResponse.json(
      { error: "Supabase service-role is not configured" },
      { status: 503 },
    );
  }
  const supabase = createClient<Database>(supabaseUrl, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const monthStart = new Date(
    Date.UTC(
      new Date().getUTCFullYear(),
      new Date().getUTCMonth(),
      1,
      0,
      0,
      0,
      0,
    ),
  ).toISOString();
  const since30d = new Date(Date.now() - 30 * 86_400_000).toISOString();

  const [keysRes, usageRes] = await Promise.all([
    supabase
      .from("evo_api_keys")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(200),
    supabase
      .from("evo_api_usage")
      .select("api_key_id, status, created_at")
      .gte("created_at", since30d)
      .order("created_at", { ascending: false })
      .limit(20_000),
  ]);

  if (keysRes.error) {
    return NextResponse.json({ error: keysRes.error.message }, { status: 500 });
  }

  const keys = (keysRes.data ?? []) as PartnerKeyRow[];
  const usage = (usageRes.data ?? []) as Pick<UsageRow, "api_key_id" | "status" | "created_at">[];

  // In-process aggregation (bounded reads) — per key: current-month
  // successes, 30-day successes, 30-day total attempts (the abuse view).
  const statsBy: Record<
    string,
    { monthSuccess: number; d30Success: number; d30Total: number }
  > = {};
  for (const u of usage) {
    const s = (statsBy[u.api_key_id] ??= {
      monthSuccess: 0,
      d30Success: 0,
      d30Total: 0,
    });
    s.d30Total += 1;
    if (u.status === "success") {
      s.d30Success += 1;
      if (u.created_at >= monthStart) s.monthSuccess += 1;
    }
  }

  return NextResponse.json({
    keys: keys.map((k) => ({
      id: k.id,
      partner_name: k.partner_name,
      key_prefix: k.key_prefix,
      theme: k.theme,
      monthly_quota: k.monthly_quota,
      is_active: k.is_active,
      notes: k.notes,
      created_at: k.created_at,
      usage: statsBy[k.id] ?? { monthSuccess: 0, d30Success: 0, d30Total: 0 },
    })),
  });
}

export async function POST(request: NextRequest) {
  if (!authRequired) {
    return NextResponse.json({ demo: true });
  }
  const auth = await requireAdmin(request);
  if (auth instanceof Response) return auth;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceKey) {
    return NextResponse.json(
      { error: "Supabase service-role is not configured" },
      { status: 503 },
    );
  }
  const supabase = createClient<Database>(supabaseUrl, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const body = await request.json().catch(() => null);
  if (typeof body !== "object" || body === null || Array.isArray(body)) {
    return NextResponse.json({ error: "body must be a JSON object" }, { status: 400 });
  }
  const rec = body as Record<string, unknown>;

  const partnerName =
    typeof rec.partner_name === "string" ? rec.partner_name.trim() : "";
  if (partnerName.length < 2 || partnerName.length > 120) {
    return NextResponse.json(
      { error: "partner_name must be 2-120 chars" },
      { status: 400 },
    );
  }

  let monthlyQuota = 1000;
  if (rec.monthly_quota !== undefined && rec.monthly_quota !== null) {
    if (
      typeof rec.monthly_quota !== "number" ||
      !Number.isInteger(rec.monthly_quota) ||
      rec.monthly_quota < 1 ||
      rec.monthly_quota > 1_000_000
    ) {
      return NextResponse.json(
        { error: "monthly_quota must be an integer 1-1,000,000" },
        { status: 400 },
      );
    }
    monthlyQuota = rec.monthly_quota;
  }

  const themeCheck = validatePartnerTheme(rec.theme);
  if (!themeCheck.ok) {
    return NextResponse.json({ error: themeCheck.error }, { status: 400 });
  }

  const notes =
    rec.notes === undefined || rec.notes === null
      ? null
      : typeof rec.notes === "string" && rec.notes.trim().length <= 500
        ? rec.notes.trim()
        : null;

  // The raw key exists ONLY in this response — never persisted, never
  // retrievable again (rotation = new key + deactivate the old one).
  const generated = generatePartnerKey();
  const { data: inserted, error: insertErr } = await supabase
    .from("evo_api_keys")
    .insert({
      partner_name: partnerName,
      key_hash: generated.hash,
      key_prefix: generated.prefix,
      theme: themeCheck.theme,
      monthly_quota: monthlyQuota,
      notes,
    })
    .select("id, partner_name, key_prefix, theme, monthly_quota, is_active, notes, created_at")
    .single();

  if (insertErr || !inserted) {
    return NextResponse.json(
      { error: insertErr?.message ?? "insert failed" },
      { status: 500 },
    );
  }

  return NextResponse.json({ key: inserted, raw_key: generated.raw });
}

export async function PATCH(request: NextRequest) {
  if (!authRequired) {
    return NextResponse.json({ demo: true });
  }
  const auth = await requireAdmin(request);
  if (auth instanceof Response) return auth;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceKey) {
    return NextResponse.json(
      { error: "Supabase service-role is not configured" },
      { status: 503 },
    );
  }
  const supabase = createClient<Database>(supabaseUrl, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const body = await request.json().catch(() => null);
  if (typeof body !== "object" || body === null || Array.isArray(body)) {
    return NextResponse.json({ error: "body must be a JSON object" }, { status: 400 });
  }
  const rec = body as Record<string, unknown>;
  const id = typeof rec.id === "string" ? rec.id : "";
  if (!/^[0-9a-f-]{36}$/i.test(id)) {
    return NextResponse.json({ error: "id must be a uuid" }, { status: 400 });
  }

  type KeyUpdate = Database["public"]["Tables"]["evo_api_keys"]["Update"];
  const patch: KeyUpdate = { updated_at: new Date().toISOString() };

  if (rec.partner_name !== undefined) {
    const name = typeof rec.partner_name === "string" ? rec.partner_name.trim() : "";
    if (name.length < 2 || name.length > 120) {
      return NextResponse.json({ error: "partner_name must be 2-120 chars" }, { status: 400 });
    }
    patch.partner_name = name;
  }
  if (rec.monthly_quota !== undefined) {
    if (
      typeof rec.monthly_quota !== "number" ||
      !Number.isInteger(rec.monthly_quota) ||
      rec.monthly_quota < 1 ||
      rec.monthly_quota > 1_000_000
    ) {
      return NextResponse.json(
        { error: "monthly_quota must be an integer 1-1,000,000" },
        { status: 400 },
      );
    }
    patch.monthly_quota = rec.monthly_quota;
  }
  if (rec.is_active !== undefined) {
    if (typeof rec.is_active !== "boolean") {
      return NextResponse.json({ error: "is_active must be boolean" }, { status: 400 });
    }
    patch.is_active = rec.is_active;
  }
  if (rec.theme !== undefined) {
    const themeCheck = validatePartnerTheme(rec.theme);
    if (!themeCheck.ok) {
      return NextResponse.json({ error: themeCheck.error }, { status: 400 });
    }
    patch.theme = themeCheck.theme;
  }
  if (rec.notes !== undefined) {
    patch.notes =
      rec.notes === null
        ? null
        : typeof rec.notes === "string" && rec.notes.trim().length <= 500
          ? rec.notes.trim()
          : null;
  }

  const { data, error } = await supabase
    .from("evo_api_keys")
    .update(patch)
    .eq("id", id)
    .select("id, partner_name, key_prefix, theme, monthly_quota, is_active, notes, created_at")
    .single();

  if (error || !data) {
    return NextResponse.json(
      { error: error?.message ?? "update failed" },
      { status: 500 },
    );
  }

  return NextResponse.json({ key: data });
}
