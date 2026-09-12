/**
 * Supabase public config — dependency-free split of `@/lib/supabase/client`
 * (Phase 182, 2026-09-12).
 *
 * WHY: client.ts statically imports @supabase/ssr (~68KB gz) and used to be
 * statically reachable from the ROOT layout (AuthProvider → @/lib/data →
 * client.ts), so the library shipped in EVERY page's first-load JS — public
 * marketing pages included, where ~80% of it is never used. client.ts is now
 * loaded ONLY via dynamic import() (data layer chunk, blog fetchers, evo
 * chat, widget). Modules that merely need the "is Supabase configured?"
 * flag — or the public env values — import THIS zero-dependency module so a
 * flag check can never drag the Supabase bundle along.
 */

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

/**
 * Returns true when real Supabase credentials are configured.
 * When false, the app falls back to a local-only demo mode backed by
 * localStorage so the UI is fully usable without a backend.
 */
export const isSupabaseConfigured = Boolean(
  supabaseUrl && supabaseAnonKey && supabaseUrl.startsWith("http"),
);

export const SUPABASE_URL = supabaseUrl;
export const SUPABASE_ANON_KEY = supabaseAnonKey;
