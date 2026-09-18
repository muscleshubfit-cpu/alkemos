/**
 * auth-signup-signals — M2 FIX (DEEP-UX-AUDIT-2026-09-18).
 *
 * PROBLEM (audit M2): signing up with an ALREADY-REGISTERED email showed
 * «افحص بريدك / Check your email» — while production signup needs NO email
 * confirmation (owner decision — instant registration) and NO email is
 * ever sent. Returning users with a registered address waited for a
 * message that would never arrive (a misleading dead-end).
 *
 * ROOT CAUSE (verified live against production GoTrue 2026-09-18): a
 * signup for an existing email answers HTTP 200 (no error!) with a FAKE
 * user object whose `identities` array is EMPTY (anti-email-enumeration
 * behavior) and NO session:
 *
 *   {"id":"<fake-uuid>","email":"…","identities":[],
 *    "confirmation_sent_at":"…","app_metadata":{…}, …}
 *
 * The instant-retry login (the 0074 auto-confirm pattern) then fails —
 * the just-typed password belongs to no account — and the flow fell
 * through to the generic needs-confirmation screen (the M2 dead-end).
 *
 * A GENUINE new signup always carries ≥1 identity in that array, so an
 * EMPTY identities array is the deterministic duplicate-email signal.
 *
 * OWNER DECISION (2026-09-18, resolves audit m9): email confirmation
 * stays OFF — registration remains instant. The fix therefore routes
 * the duplicate case to an honest «account exists — sign in» screen
 * instead of faking a confirmation flow.
 *
 * Pure display-layer signal — zero API / business-logic / DB change
 * (audit constraint #3).
 */

/** Minimal GoTrue signup user shape (only what the signal reads). */
export type GoTrueSignupUserLike = {
  identities?: Array<unknown> | null;
};

/**
 * True when the signUp response is GoTrue's anti-enumeration duplicate
 * answer: a truthy user object with an EMPTY `identities` array.
 *
 * Honest fallback: null/undefined user, or a missing/non-array
 * `identities` field, is NOT a duplicate (falls through unchanged to
 * the existing flow — never mislabels a genuine signup).
 */
export function isDuplicateEmailSignup(
  user: GoTrueSignupUserLike | null | undefined,
): boolean {
  if (!user) return false;
  return Array.isArray(user.identities) && user.identities.length === 0;
}
