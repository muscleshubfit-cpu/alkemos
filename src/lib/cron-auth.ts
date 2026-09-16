import type { NextRequest } from "next/server";
import { timingSafeEqual } from "crypto";

/**
 * Timing-safe comparison for a custom-header secret against its
 * expected env value — the shared discipline of every cron-style
 * gate in the repo (audit M6 2026-09-07; P1-6 deep-audit 2026-09-16
 * extended it beyond the Bearer form).
 *
 * Fail-closed: unset expected secret or any mismatch → false. A
 * length mismatch burns an equal-length comparison anyway, so the
 * failure branch costs the same as the success branch (no length
 * oracle). `provided` may be null (header absent).
 */
export function timingSafeSecretEqual(
  provided: string | null,
  expected: string | undefined,
): boolean {
  if (!expected) return false;

  const a = Buffer.from(provided ?? "", "utf8");
  const b = Buffer.from(expected, "utf8");
  if (a.length !== b.length) {
    timingSafeEqual(b, b);
    return false;
  }
  return timingSafeEqual(a, b);
}

/**
 * CRON_SECRET verification with a CONSTANT-TIME comparison (audit M6,
 * 2026-09-07). All 8 cron routes previously compared the bearer token
 * with `!==`, a short-circuit string compare that leaks prefix match
 * timing to a network observer. Vercel Cron sends:
 *   Authorization: Bearer <CRON_SECRET>
 * Fail-closed: unset secret or any mismatch → false.
 */
export function verifyCronAuth(request: NextRequest): boolean {
  const auth = request.headers.get("authorization") || "";
  const got = auth.startsWith("Bearer ") ? auth.slice(7) : "";
  return timingSafeSecretEqual(got, process.env.CRON_SECRET);
}
