/**
 * SITE-CONTENT/SERVER — the server-side override fetch (SITE-CONTENT-281).
 *
 * PATTERN (the blog precedent, exactly): a fresh anon-key client per
 * call (no cookies, no session), wrapped in unstable_cache with a
 * 300 s revalidate — the SAME freshness window the blog article pages
 * use (ISR revalidate = 300). The public routes that consume this
 * (homepage EN/AR + about/privacy/terms/faq EN/AR) export
 * `revalidate = 300` so the page re-render and the data cache expire
 * together: an admin save is live within ~5 minutes WITHOUT any
 * deploy — and never costs a git commit or a CI run.
 *
 * NEVER import this from a client component (server data path only);
 * never let a public page import the Supabase browser client to read
 * overrides (Phase-182/224 bundle law).
 */

import { createClient } from "@supabase/supabase-js";
import { unstable_cache } from "next/cache";
import type { SiteCopyMap } from "./core";

type SiteContentRow = {
  key: string;
  value_en: unknown;
  value_ar: unknown;
};

const SITE_CONTENT_CACHE_KEY = ["site-content-overrides"];

const fetchSiteContentUncached = async (): Promise<SiteCopyMap> => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseAnonKey) return {};

  try {
    // Anon key + RLS public-read policy (migration 0094) — no session,
    // no service role. The table holds public marketing copy only.
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const { data, error } = await supabase
      .from("site_content")
      .select("key, value_en, value_ar");
    if (error || !data) return {};
    const map: SiteCopyMap = {};
    for (const row of (data as SiteContentRow[]) ?? []) {
      map[row.key] = { en: row.value_en ?? undefined, ar: row.value_ar ?? undefined };
    }
    return map;
  } catch {
    // Fail-open to the code defaults — the site renders exactly as it
    // does today whenever the overrides can't be read.
    return {};
  }
};

/**
 * Cached override map (5-minute revalidate). One cache entry serves
 * every public route in the same render window.
 */
export const fetchSiteContentOverrides = unstable_cache(
  fetchSiteContentUncached,
  SITE_CONTENT_CACHE_KEY,
  { revalidate: 300 },
);
