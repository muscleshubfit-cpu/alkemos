/**
 * recovery-otp — RECOVERY-OTP MODE (2026-09-22, owner order «نفذ خيار otp»).
 *
 * The forgot-password flow's OTP half: the recovery email carries a
 * 6-digit code (Supabase {{ .Token }}) that the user types on
 * /auth/reset?mode=code — supabase.auth.verifyOtp({ type: "recovery" })
 * then sets the session in THAT browser without any PKCE verifier cookie
 * or one-time link click, which makes it the cross-device / link-scanner
 * proof recovery path.
 *
 * Users paste or type codes in messy forms: Arabic-Indic digits (٠-٩),
 * Eastern Arabic-Indic (۰-۹), spaces and dashes («123 456», «123-456»).
 * This module is the single normalizer for the entry surface — pure and
 * dependency-free so the law is unit-testable.
 */

/** Arabic-Indic (U+0660–0669) and Eastern Arabic-Indic (U+06F0–06F9) → ASCII. */
const ARABIC_DIGIT_MAP: Record<string, string> = {
  "٠": "0", "١": "1", "٢": "2", "٣": "3", "٤": "4",
  "٥": "5", "٦": "6", "٧": "7", "٨": "8", "٩": "9",
  "۰": "0", "۱": "1", "۲": "2", "۳": "3", "۴": "4",
  "۵": "5", "۶": "6", "۷": "7", "۸": "8", "۹": "9",
};

/**
 * Normalize a typed/pasted OTP: map Arabic-Indic digits to ASCII, strip
 * every non-digit (spaces, dashes, letters). Returns digits only — an
 * empty string when nothing digit-like was present.
 */
export function normalizeOtpToken(raw: string | null | undefined): string {
  if (!raw) return "";
  let out = "";
  for (const ch of raw) {
    if (ch >= "0" && ch <= "9") {
      out += ch;
    } else if (ARABIC_DIGIT_MAP[ch]) {
      out += ARABIC_DIGIT_MAP[ch];
    }
    // everything else (spaces, dashes, letters) is dropped
  }
  return out;
}

/**
 * A normalized token is submittable only when it is exactly 6 digits
 * (Supabase's default mailer_otp_length). Guards against partial entry
 * and stray keystrokes reaching verifyOtp.
 */
export function isValidOtpToken(token: string): boolean {
  return /^\d{6}$/.test(token);
}
