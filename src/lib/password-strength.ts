/**
 * password-strength — m8 FIX (DEEP-UX-AUDIT-2026-09-18).
 *
 * PROBLEM (audit m8): the signup form's only password guidance was the
 * native minLength=8 — weak passwords were accepted silently, with zero
 * feedback until submit. The audit asked for guidance/indicator.
 *
 * SCOPE LAW: this helper is DISPLAY-ONLY. The enforced gates stay exactly
 * as they are (server password_min_length=8 + the Phase-134 HIBP breach
 * check). Nothing here rejects or accepts anything — it only colors a
 * meter and labels the state so the user can self-correct before submit.
 *
 * Scoring is deterministic and dependency-free:
 *   0 = below the 8-char minimum (nothing to show beyond "too short")
 *   1 = weak  (meets the minimum, single character class)
 *   2 = fair  (length and/or variety improving)
 *   3 = strong (long + mixed classes)
 */

export type PasswordStrengthLevel = 0 | 1 | 2 | 3;

/** Count how many of the four character classes are present. */
function classCount(pw: string): number {
  let n = 0;
  if (/[a-z]/.test(pw)) n++;
  if (/[A-Z]/.test(pw)) n++;
  if (/[0-9]/.test(pw)) n++;
  if (/[^a-zA-Z0-9]/.test(pw)) n++;
  return n;
}

/**
 * Score a candidate password for the live meter.
 * Empty/short input returns 0 (the UI shows the minimum-length hint only).
 */
export function passwordStrength(pw: string): PasswordStrengthLevel {
  if (pw.length < 8) return 0;
  const classes = classCount(pw);
  if (pw.length >= 12 && classes >= 3) return 3;
  if (classes >= 3 || (pw.length >= 10 && classes >= 2) || pw.length >= 14) return 2;
  return 1;
}

/** Bilingual labels for each level (empty/short handled by the hint). */
export function strengthLabel(level: PasswordStrengthLevel, isAr: boolean): string {
  const labels: Record<PasswordStrengthLevel, { ar: string; en: string }> = {
    0: { ar: "قصيرة جدًا", en: "Too short" },
    1: { ar: "ضعيفة", en: "Weak" },
    2: { ar: "متوسطة", en: "Fair" },
    3: { ar: "قوية", en: "Strong" },
  };
  return isAr ? labels[level].ar : labels[level].en;
}
