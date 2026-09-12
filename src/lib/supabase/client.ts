"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "./types";
import { isSupabaseConfigured, SUPABASE_URL, SUPABASE_ANON_KEY } from "./config";

// Flag re-export keeps the old import surface (`from "@/lib/supabase/client"`)
// working. Post-Phase-182 every remaining STATIC importer of this module is a
// gated-route chunk (profile, coach/admin views) — public first-load JS only
// reaches it via dynamic import(). Flag-only consumers moved to ./config.
export { isSupabaseConfigured };

/**
 * Browser Supabase client.
 *
 * IMPORTANT: this is @supabase/ssr's createBrowserClient (not the regular
 * createClient). It syncs the auth session + PKCE verifier to COOKIES
 * (not localStorage), which is required for the server-side /auth/callback
 * route handler to be able to exchange the OAuth code.
 *
 * The matching middleware.ts uses createServerClient with the same cookie
 * strategy, so client and server share the same storage.
 *
 * PHASE 182 (2026-09-12): this module's chunk is fetched ONLY through
 * dynamic import() — public pages no longer pay ~68KB (gz) of @supabase/ssr
 * in first-load JS. Call sites: the @/lib/data layer, blog.ts fetchers,
 * evo-chat-context, EvoFloatingWidget, use-auth's OAuth fallback. The
 * client itself is still created EAGERLY at module eval (single GoTrue
 * instance, one auth listener, cookie sync) — the laziness lives in WHEN
 * this module's chunk is fetched, not in client construction.
 */
export const supabase = isSupabaseConfigured
 ? createBrowserClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        detectSessionInUrl: false, // /auth/callback handles this server-side
        flowType: "pkce",
        persistSession: true,
        autoRefreshToken: true,
      },
    })
 : null;
