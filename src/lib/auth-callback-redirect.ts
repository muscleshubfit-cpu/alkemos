/**
 * auth-callback-redirect — the redirect decision table for /auth/callback
 * (RECOVERY-LINK-ERROR FIX 2026-09-22, owner live bug report «بعد الضغط على
 * الرابط فتح الموقع مع رسالة خطاء»).
 *
 * THE BUG: the forgot-password email lands on /auth/callback?code=…&next=
 * /auth/reset and the route exchanges the PKCE code server-side using the
 * code-verifier cookie. That verifier cookie exists ONLY in the browser
 * that clicked «Forgot password?» — so when the recovery link is opened
 * in a DIFFERENT browser / mail-app WebView, or the one-time code was
 * already consumed (email scanners that pre-click links, a second click),
 * or it expired, the exchange failed and the route dumped the user on the
 * HOMEPAGE with the raw GoTrue string as a toast («Login failed: invalid
 * request: …») — an English-only dead end on the wrong surface.
 *
 * THE FIX: when the flow is a RECOVERY flow (next=/auth/reset), every
 * failure branch redirects back to /auth/reset?recovery_error=1 — the
 * page the user expects — which renders an honest localized state
 * (link is one-time / expired / opened in another browser) with a
 * «start the recovery again» CTA. The OAUTH surface (Google sign-in)
 * keeps its exact pre-fix behavior (/?auth_error=… toast on the homepage)
 * — this module only ADDS the recovery branch, it never widens the
 * redirect surface: recovery failures go to a fixed literal path, and
 * every non-recovery target still goes through safeNext's same-origin
 * law (open-redirect C17).
 *
 * Pure and dependency-free (safeNext only) so the decision table is
 * unit-testable without mocking next/server.
 */

import { safeNext } from "./safe-redirect";

/** The recovery landing this law protects. */
export const RECOVERY_RESET_PATH = "/auth/reset";

/** Fixed failure flag appended to the recovery landing (no raw messages in URLs). */
export const RECOVERY_FAILURE_FLAG = "recovery_error=1";

/**
 * True when the callback's `next` targets the recovery landing — i.e. the
 * flow was started by resetPasswordForEmail (AuthView forgot-password),
 * not by OAuth. Accepts the bare path and path-with-query forms only;
 * anything else (including "//evil" or absolute URLs) is NOT recovery.
 */
export function isRecoveryNext(next: string | null | undefined): boolean {
  if (!next) return false;
  return next === RECOVERY_RESET_PATH || next.startsWith(`${RECOVERY_RESET_PATH}?`);
}

export interface AuthCallbackInput {
  /** ?code= from the email link / provider redirect (null when absent). */
  code: string | null;
  /** ?next= as forwarded by Supabase (raw — NOT yet sanitized). */
  next: string | null;
  /** ?error= forwarded by the provider / GoTrue (OAuth + link errors). */
  providerError: string | null;
  /** Message from exchangeCodeForSession failure or the thrown exception. */
  exchangeError?: string | null;
}

export interface AuthCallbackRedirect {
  /** Relative redirect target for NextResponse.redirect(origin + href). */
  href: string;
  /** True when this is a recovery flow landing on its failure state. */
  recoveryFailure: boolean;
}

/**
 * The single decision table for /auth/callback. Branch order mirrors the
 * route's pre-fix logic (provider error → missing code → exchange) so the
 * OAuth surface is byte-for-byte compatible; recovery branches were added.
 */
export function authCallbackRedirect(input: AuthCallbackInput): AuthCallbackRedirect {
  const { code, providerError, exchangeError } = input;
  const recovery = isRecoveryNext(input.next);
  const recoveryFailureHref = `${RECOVERY_RESET_PATH}?${RECOVERY_FAILURE_FLAG}`;

  // 1. Provider/GoTrue forwarded an error (used/expired link, provider deny…).
  if (providerError) {
    if (recovery) return { href: recoveryFailureHref, recoveryFailure: true };
    return {
      href: `/?auth_error=${encodeURIComponent(providerError)}`,
      recoveryFailure: false,
    };
  }

  // 2. No code at all (verify dropped it / malformed link). OAuth kept its
  //    silent home redirect; recovery gets its honest landing.
  if (!code) {
    if (recovery) return { href: recoveryFailureHref, recoveryFailure: true };
    return { href: "/", recoveryFailure: false };
  }

  // 3. Exchange failed — the classic recovery cases (verifier cookie in
  //    another browser, one-time code consumed, expired link).
  if (exchangeError) {
    if (recovery) return { href: recoveryFailureHref, recoveryFailure: true };
    return {
      href: `/?auth_error=${encodeURIComponent(exchangeError)}`,
      recoveryFailure: false,
    };
  }

  // 4. Success — same-origin law via safeNext (unchanged from pre-fix).
  return { href: safeNext(input.next), recoveryFailure: false };
}
