/**
 * SITE-CONTENT/ADMIN — the /admin/site-content editor's data layer
 * (SITE-CONTENT-281). Mirrors the blog-admin.ts pattern exactly: the
 * BROWSER Supabase client (the logged-in admin's session) + RLS
 * admin-only write policies (migration 0094) — no new API routes, no
 * service-role exposure to the browser, the same trust model the blog
 * and coach-page editors already ride.
 */

import { isSupabaseConfigured } from "@/lib/supabase/config";
import type { Json, Database } from "@/lib/supabase/types";
import type { SiteCopyMap } from "./core";

export type SiteContentAudit = {
  key: string;
  updated_at: string | null;
  updated_by: string | null;
};

/** Read the live override rows (values + audit stamps) for the editor. */
export async function adminFetchSiteContent(): Promise<
  { values: SiteCopyMap; audits: Record<string, SiteContentAudit> }
> {
  if (!isSupabaseConfigured) return { values: {}, audits: {} };
  const { supabase } = await import("@/lib/supabase/client");
  if (!supabase) return { values: {}, audits: {} };
  try {
    const { data, error } = await supabase
      .from("site_content")
      .select("key, value_en, value_ar, updated_at, updated_by");
    if (error || !data) return { values: {}, audits: {} };
    const values: SiteCopyMap = {};
    const audits: Record<string, SiteContentAudit> = {};
    for (const row of data as Array<{
      key: string;
      value_en: unknown;
      value_ar: unknown;
      updated_at: string;
      updated_by: string | null;
    }>) {
      values[row.key] = { en: row.value_en ?? undefined, ar: row.value_ar ?? undefined };
      audits[row.key] = { key: row.key, updated_at: row.updated_at, updated_by: row.updated_by };
    }
    return { values, audits };
  } catch {
    return { values: {}, audits: {} };
  }
}

type SiteContentValue = Database["public"]["Tables"]["site_content"]["Insert"]["value_en"];

/** One upserted override row (admin-only via RLS; the touch trigger stamps audit columns). */
export async function adminUpsertSiteContent(
  key: string,
  valueEn: SiteContentValue,
  valueAr: SiteContentValue,
): Promise<boolean> {
  if (!isSupabaseConfigured) return false;
  const { supabase } = await import("@/lib/supabase/client");
  if (!supabase) return false;
  const { error } = await supabase
    .from("site_content")
    .upsert({ key, value_en: valueEn ?? null, value_ar: valueAr ?? null }, { onConflict: "key" });
  if (error) {
    console.error("[adminUpsertSiteContent] Error:", error);
    return false;
  }
  return true;
}

/** Delete override rows → the affected keys fall back to their code defaults. */
export async function adminResetSiteContent(keys: string[]): Promise<boolean> {
  if (keys.length === 0) return true;
  if (!isSupabaseConfigured) return false;
  const { supabase } = await import("@/lib/supabase/client");
  if (!supabase) return false;
  // The proven `.delete().in("id", ids)` shape (TOOL RESULTS UX LAW) —
  // key is the PK here.
  const { error } = await supabase.from("site_content").delete().in("key", keys);
  if (error) {
    console.error("[adminResetSiteContent] Error:", error);
    return false;
  }
  return true;
}
