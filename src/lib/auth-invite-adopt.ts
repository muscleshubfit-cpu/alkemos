/**
 * auth-invite-adopt — H1-2026 FIX (UX-TEST-REPORT-2026-09-21 §3).
 *
 * PROBLEM (H1-2026, reproduced live twice on production 2026-09-21 with
 * independent accounts qa.ux0921.client3 / qa.ux0922.client3 + SQL proof):
 * a coach invite calls GoTrue `inviteUserByEmail`, which creates the
 * auth.users row IMMEDIATELY with an EMPTY password. When the invited
 * person later signs up like any visitor (he usually never saw the invite
 * email), GoTrue answers the anti-enumeration duplicate signal (M2), the
 * UI says «Account already exists — sign in with your password», and the
 * login with the password he JUST chose fails — the chosen password was
 * never stored. Deadlock: the only exit is the emailed invite link, so
 * the highest-conversion B2B path (coach → new client) can strand real
 * customers with no self-serve way in.
 *
 * FIX (report's preferred solution 1 — «تفعيل عند التسجيل»): when the
 * duplicate-email signal fires, the client calls
 * POST /api/auth/complete-invite with the SAME form values; the server
 * ADOPTS the shadow invite row: writes the chosen password, confirms the
 * email, and lets the normal signIn proceed. The email link stays valid
 * as an alternative path; the assignment created at invite time is kept.
 *
 * ADOPTION GATE (this module — pure, unit-tested): adopt ONLY a user who
 * (a) was created by an invite (`invited_at` set — GoTrue stamps it, the
 * instant-signup path never does) AND (b) has NEVER signed in
 * (`last_sign_in_at` null). Verified live via production SQL 2026-09-21:
 * both stranded invitees show was_invited=true + never_signed_in=true +
 * encrypted_password=''. A user who registered normally (password set at
 * signup) NEVER has invited_at, so their password can never be overwritten
 * by this path. Double gate = defense in depth.
 *
 * Pure display-layer signal — zero API/DB schema change (no migration;
 * the M2 fix precedent, audit constraint #3).
 */

/** Minimal GoTrue admin-user shape (only what the gate reads). */
export type GoTrueAdminUserLike = {
  invited_at?: string | null;
  last_sign_in_at?: string | null;
};

/**
 * True when the GoTrue admin user record is a PENDING INVITE: created by
 * inviteUserByEmail (invited_at stamped) and never activated (no sign-in
 * ever). Only such a record may have its password written by the
 * complete-invite adoption path.
 *
 * Honest fallback: any missing/non-string field fails the gate CLOSED —
 * never mislabels an activated or self-registered account as adoptable.
 */
export function isAdoptableInvitedUser(
  user: GoTrueAdminUserLike | null | undefined,
): boolean {
  if (!user) return false;
  if (typeof user.invited_at !== "string" || user.invited_at.length === 0) {
    return false;
  }
  // Null/undefined = never signed in. Any timestamp = account already
  // used at least once → NOT adoptable (protects activated users).
  if (typeof user.last_sign_in_at === "string" && user.last_sign_in_at.length > 0) {
    return false;
  }
  return true;
}

/**
 * Client-side call to the adoption endpoint (data layer only — never
 * imported by UI components). Returns true ONLY on a definitive
 * { ok:true }; any network/HTTP failure resolves false so the caller
 * falls back to the existing M2 «account exists» screen (no regression —
 * the endpoint is a rescue path, not a new hard dependency).
 */
export async function requestInviteAdoption(
  email: string,
  password: string,
  fullName?: string | null,
  phone?: string | null,
): Promise<boolean> {
  try {
    const res = await fetch("/api/auth/complete-invite", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        password,
        ...(fullName ? { full_name: fullName } : {}),
        ...(phone ? { phone } : {}),
      }),
    });
    if (!res.ok) return false;
    const data = (await res.json().catch(() => null)) as { ok?: boolean } | null;
    return data?.ok === true;
  } catch {
    return false;
  }
}
