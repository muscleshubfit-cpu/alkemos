import { describe, expect, it } from "vitest";

import {
  authCallbackRedirect,
  isRecoveryNext,
  RECOVERY_RESET_PATH,
} from "../auth-callback-redirect";

/**
 * RECOVERY-LINK-ERROR FIX (2026-09-22) — owner live bug report: clicking a
 * real recovery email link landed on the homepage with the raw GoTrue
 * string as a toast when the PKCE exchange failed (link opened in another
 * browser / one-time code consumed / expired). The decision table must
 * route EVERY recovery failure branch to /auth/reset?recovery_error=1
 * while keeping the OAuth (Google) surface byte-for-byte unchanged.
 */

const RECOVERY_FAILURE = `${RECOVERY_RESET_PATH}?recovery_error=1`;

describe("isRecoveryNext", () => {
  it("accepts the bare recovery path", () => {
    expect(isRecoveryNext("/auth/reset")).toBe(true);
  });

  it("accepts the recovery path with a query string", () => {
    expect(isRecoveryNext("/auth/reset?x=1")).toBe(true);
  });

  it("rejects look-alike paths, empty and hostile values", () => {
    expect(isRecoveryNext("/auth/reset-password")).toBe(false);
    expect(isRecoveryNext("/auth/resetx")).toBe(false);
    expect(isRecoveryNext("/dashboard")).toBe(false);
    expect(isRecoveryNext("//evil.com")).toBe(false);
    expect(isRecoveryNext("https://evil.com")).toBe(false);
    expect(isRecoveryNext(null)).toBe(false);
    expect(isRecoveryNext(undefined)).toBe(false);
    expect(isRecoveryNext("")).toBe(false);
  });
});

describe("authCallbackRedirect — recovery flow (next=/auth/reset)", () => {
  const next = "/auth/reset";

  it("provider error → honest recovery landing, no raw message in URL", () => {
    const r = authCallbackRedirect({
      code: null,
      next,
      providerError: "invalid_request",
    });
    expect(r).toEqual({ href: RECOVERY_FAILURE, recoveryFailure: true });
  });

  it("GoTrue error_description-style provider error → same fixed landing", () => {
    const r = authCallbackRedirect({
      code: null,
      next,
      providerError: "Email link is invalid or has already been used",
    });
    expect(r.href).toBe(RECOVERY_FAILURE);
    expect(r.href).not.toContain("Email");
  });

  it("missing code → recovery landing", () => {
    const r = authCallbackRedirect({ code: null, next, providerError: null });
    expect(r).toEqual({ href: RECOVERY_FAILURE, recoveryFailure: true });
  });

  it("exchange failure (verifier in another browser / used code) → recovery landing", () => {
    const r = authCallbackRedirect({
      code: "pkce-code",
      next,
      providerError: null,
      exchangeError:
        "invalid request: both auth code and code verifier should be non-empty",
    });
    expect(r).toEqual({ href: RECOVERY_FAILURE, recoveryFailure: true });
  });

  it("exception message → recovery landing", () => {
    const r = authCallbackRedirect({
      code: "pkce-code",
      next,
      providerError: null,
      exchangeError: "fetch failed",
    });
    expect(r.href).toBe(RECOVERY_FAILURE);
  });

  it("success → lands on the sanitized recovery path WITH its query preserved", () => {
    expect(
      authCallbackRedirect({ code: "pkce-code", next, providerError: null }).href,
    ).toBe("/auth/reset");
    expect(
      authCallbackRedirect({ code: "pkce-code", next: "/auth/reset?a=1", providerError: null })
        .href,
    ).toBe("/auth/reset?a=1");
  });

  it("success with an UNSAFE next is still clamped by the safeNext law", () => {
    expect(
      authCallbackRedirect({ code: "pkce-code", next: "https://evil.com", providerError: null })
        .href,
    ).toBe("/");
    expect(
      authCallbackRedirect({ code: "pkce-code", next: "//evil.com", providerError: null }).href,
    ).toBe("/");
  });
});

describe("authCallbackRedirect — OAuth flow (no recovery next) unchanged", () => {
  it("provider error → homepage toast URL exactly as pre-fix", () => {
    const r = authCallbackRedirect({
      code: null,
      next: "/",
      providerError: "access_denied",
    });
    expect(r).toEqual({
      href: `/?auth_error=${encodeURIComponent("access_denied")}`,
      recoveryFailure: false,
    });
  });

  it("missing code → silent home redirect (pre-fix behavior)", () => {
    expect(
      authCallbackRedirect({ code: null, next: "/", providerError: null }),
    ).toEqual({ href: "/", recoveryFailure: false });
  });

  it("exchange failure → homepage toast URL with the encoded GoTrue message", () => {
    const msg = "invalid request: both auth code and code verifier should be non-empty";
    const r = authCallbackRedirect({
      code: "pkce-code",
      next: "/",
      providerError: null,
      exchangeError: msg,
    });
    expect(r).toEqual({
      href: `/?auth_error=${encodeURIComponent(msg)}`,
      recoveryFailure: false,
    });
  });

  it("recovery-looking paths under other prefixes are NOT recovery", () => {
    // A hostile next like "/dashboard?recovery_error=1" must not gain the
    // recovery branch — it stays on the OAuth surface rules.
    const r = authCallbackRedirect({
      code: "pkce-code",
      next: "/dashboard",
      providerError: null,
      exchangeError: "boom",
    });
    expect(r.recoveryFailure).toBe(false);
    expect(r.href).toBe(`/?auth_error=${encodeURIComponent("boom")}`);
  });
});
