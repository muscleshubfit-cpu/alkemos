import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

/**
 * Supabase session middleware.
 *
 * CRITICAL for OAuth: @supabase/ssr's browser client stores the PKCE code
 * verifier in localStorage by default. But the /auth/callback route handler
 * runs on the server, which can't read localStorage. The fix is to use
 * @supabase/ssr's createServerClient in middleware — it syncs the auth
 * session (and PKCE verifier) to cookies, so both client and server share
 * the same storage.
 *
 * Without this middleware, Google OAuth fails with:
 * "PKCE code verifier not found in storage. This can happen if the auth
 * flow was initiated in a different browser or device, or if the storage
 * was cleared."
 *
 * This middleware also refreshes expired sessions on every request.
 */
/**
 * SEO locale law (2026-09-01): shared predicate — Arabic ONLY means
 * exactly `/ar` or the `/ar/…` subtree (same rule as the root layout's
 * `isArabicPath` in src/app/layout.tsx). A loose startsWith("/ar") would
 * misclassify future routes like /archive as Arabic.
 */
function isArabicPath(pathname: string): boolean {
  return pathname === "/ar" || pathname.startsWith("/ar/");
}

/**
 * SEO-GEO-4 (2026-09-08, owner directive «ابدأ (ج) ثم (أ)» — audit finding
 * #5): edge-cacheability for public HTML.
 *
 * TWO findings were live-verified locally (`next start`):
 *   1. The route response's Cache-Control (framework dynamic default
 *      `private, no-cache, no-store…`) OVERRIDES any Cache-Control set
 *      here in middleware — middleware is the WRONG layer for it.
 *   2. next.config.ts headers() DOES win over the framework default.
 * The public Cache-Control therefore lives in next.config.ts headers()
 * (single source of truth — see the SEO-GEO-4 rule there).
 *
 * What THIS file still owns: the `mhe:locale` cookie is now written ONLY
 * when the value actually changes. The old unconditional write put
 * Set-Cookie on EVERY response, and any response with Set-Cookie is
 * uncacheable at every CDN edge — that made the next.config policy
 * theoretical. With the change-only write, the vast majority of public
 * responses carry no Set-Cookie and become edge-cacheable. Locale
 * correctness never depends on this cookie for /ar paths (the
 * x-pathname header wins in the root layout).
 *
 * The PRIVATE-path exclusion list (api/admin/auth/checkout/dashboard/
 * questionnaires/progress/plans/profile/support/referral/preview/coach)
 * lives in next.config.ts's SEO-GEO-4 headers rule — the single layer
 * that wins over the framework's dynamic Cache-Control default.
 */

export async function middleware(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // ──────────────────────────────────────────────────────────────────
  // H1 fix (Option B): Locale detection — ALWAYS runs, even in demo
  // mode (when Supabase env vars are not set). This is critical because
  // the root layout (`src/app/layout.tsx`) depends on the `x-pathname`
  // header + `mhe:locale` cookie to render `<html lang dir>` correctly.
  //
  // Precedence (enforced in the root layout, NOT here):
  //   1. URL pathname (`/ar/...` → `ar`) — always wins
  //   2. `mhe:locale` cookie (fallback for non-`/ar` routes)
  //   3. Default `en`
  //
  // The cookie is always set to match the current pathname so that:
  //   - `/ar/*` requests always get `mhe:locale=ar` (cookie can NOT override)
  //   - English requests get `mhe:locale=en` (resets any stale `ar` cookie)
  // ──────────────────────────────────────────────────────────────────
  const pathname = request.nextUrl.pathname;
  // Route locale — DYNAMIC, derived from the URL itself: `/ar/*` routes are
  // Arabic, every other route is English. This drives the Content-Language
  // header, the `x-pathname` header (read by the root layout to render
  // `<html lang dir>`) and the `mhe:locale` cookie.
  const isArabic = isArabicPath(pathname);

  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  // Content-Language header — additional crawler signal (kept from
  // original implementation, now always set even in demo mode).
  response.headers.set("Content-Language", isArabic ? "ar-EG" : "en-US");

  // Expose the pathname to the root layout via a custom header. The
  // root layout cannot receive `params` (it's the parent of all routes,
  // not a dynamic segment), so `headers().get('x-pathname')` is the
  // cleanest server-side way to know which URL the user requested.
  response.headers.set("x-pathname", pathname);

  // Write a `mhe:locale` cookie so the root layout can read it via
  // `cookies()` as a fallback when the pathname doesn't determine the
  // locale. SEO-GEO-4: written ONLY when the value actually changes —
  // an unconditional write put Set-Cookie on EVERY response, which
  // makes the response uncacheable at any CDN edge.
  const desiredLocale = isArabic ? "ar" : "en";
  if (request.cookies.get("mhe:locale")?.value !== desiredLocale) {
    response.cookies.set("mhe:locale", desiredLocale, {
      path: "/",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 365, // 1 year — survives browser restarts
    });
  }

  // If Supabase isn't configured, skip session refresh (demo mode).
  // The locale headers/cookies above are already set — return now.
  if (!supabaseUrl || !supabaseAnonKey) {
    return response;
  }

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({
          request: {
            headers: request.headers,
          },
        });
        // Re-apply locale headers/cookies on the new response object
        // (the `setAll` callback creates a new `NextResponse` that
        // replaces the original, so we must re-set our locale headers
        // on it to avoid losing them). SEO-GEO-4: same change-only
        // cookie write as the main path (see the block comment above).
        const isAr = isArabicPath(pathname);
        response.headers.set("Content-Language", isAr ? "ar-EG" : "en-US");
        response.headers.set("x-pathname", pathname);
        const desired = isAr ? "ar" : "en";
        if (request.cookies.get("mhe:locale")?.value !== desired) {
          response.cookies.set("mhe:locale", desired, {
            path: "/",
            sameSite: "lax",
            maxAge: 60 * 60 * 24 * 365,
          });
        }
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options),
        );
      },
    },
  });

  // Refresh the session (this also sets the cookies via setAll above).
  // IMPORTANT: do not run any code between createServerClient and
  // supabase.auth.getUser — the session refresh depends on this ordering.
  await supabase.auth.getUser();

  return response;
}

export const config = {
 matcher: [
 // Run on all routes except static assets and Next internals.
 "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|txt|xml|js|css)$).*)",
 ],
};
