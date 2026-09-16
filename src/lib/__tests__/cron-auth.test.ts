import { describe, it, expect, beforeEach, vi } from "vitest";
import { timingSafeSecretEqual, verifyCronAuth } from "@/lib/cron-auth";
import type { NextRequest } from "next/server";

/**
 * P1-6 (deep-audit 2026-09-16, owner-approved §7): the timing-safe
 * secret-comparison discipline of cron-auth.ts. verifyCronAuth is the
 * Bearer/CRON_SECRET form (audit M6 2026-09-07); timingSafeSecretEqual
 * is the shared custom-header atom the EVO followup dispatch route now
 * uses for x-cron-secret/EVO_CRON_SECRET. These pin the fail-closed
 * contract so a regression back to a plain `===` can never land
 * silently.
 */

const SECRET = "test-secret-0123456789abcdef";

function reqWithHeaders(headers: Record<string, string>): NextRequest {
  return { headers: new Headers(headers) } as unknown as NextRequest;
}

describe("timingSafeSecretEqual — custom-header atom (P1-6)", () => {
  it("accepts an exact match", () => {
    expect(timingSafeSecretEqual(SECRET, SECRET)).toBe(true);
  });

  it("rejects a same-length mismatch", () => {
    expect(timingSafeSecretEqual("test-secret-0123456789abcdeg", SECRET)).toBe(
      false,
    );
  });

  it("rejects a different-length value (no length oracle branch)", () => {
    expect(timingSafeSecretEqual("short", SECRET)).toBe(false);
    expect(timingSafeSecretEqual("", SECRET)).toBe(false);
  });

  it("rejects a prefix of the secret", () => {
    expect(timingSafeSecretEqual(SECRET.slice(0, 8), SECRET)).toBe(false);
  });

  it("fail-closed: expected secret unset → false", () => {
    expect(timingSafeSecretEqual(SECRET, undefined)).toBe(false);
    expect(timingSafeSecretEqual(SECRET, "")).toBe(false);
  });

  it("fail-closed: provided secret absent (null header) → false", () => {
    expect(timingSafeSecretEqual(null, SECRET)).toBe(false);
  });
});

describe("verifyCronAuth — Bearer/CRON_SECRET form (M6 + P1-6 refactor)", () => {
  beforeEach(() => {
    vi.unstubAllEnvs();
  });

  it("accepts the correct Bearer token", () => {
    vi.stubEnv("CRON_SECRET", SECRET);
    expect(
      verifyCronAuth(
        reqWithHeaders({ authorization: `Bearer ${SECRET}` }),
      ),
    ).toBe(true);
  });

  it("rejects a wrong Bearer token", () => {
    vi.stubEnv("CRON_SECRET", SECRET);
    expect(
      verifyCronAuth(
        reqWithHeaders({ authorization: "Bearer wrong-secret-value!" }),
      ),
    ).toBe(false);
  });

  it("rejects a non-Bearer authorization header", () => {
    vi.stubEnv("CRON_SECRET", SECRET);
    expect(verifyCronAuth(reqWithHeaders({ authorization: SECRET }))).toBe(
      false,
    );
  });

  it("rejects when the header is absent", () => {
    vi.stubEnv("CRON_SECRET", SECRET);
    expect(verifyCronAuth(reqWithHeaders({}))).toBe(false);
  });

  it("fail-closed: CRON_SECRET unset → false even with a matching header", () => {
    delete process.env.CRON_SECRET;
    expect(
      verifyCronAuth(
        reqWithHeaders({ authorization: `Bearer ${SECRET}` }),
      ),
    ).toBe(false);
  });
});
