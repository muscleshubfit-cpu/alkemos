/**
 * error-i18n — M1 FIX (DEEP-UX-AUDIT-2026-09-18).
 *
 * PROBLEM (audit M1): server error messages shipped in ONE language and
 * were rendered verbatim inside the OTHER language's UI at the worst
 * moments (payment/activation/login):
 *   (أ) POST /api/coach/subscriptions/activate 402 `insufficient_wallet`
 *       returned a full Arabic message shown inside the ENGLISH coach UI.
 *   (ب) Wrong password at login surfaced Supabase's raw English
 *       "Invalid login credentials" inside the ARABIC auth UI.
 *
 * ROOT CAUSE: the display layer (toast sites) rendered server-locale
 * strings without localizing them. Locale is a PRESENTATION concern, so
 * the fix lives at the presentation layer too — the standard i18n
 * pattern for APIs: the server keeps returning STABLE error codes (plus
 * numeric payloads like balance/cost), and the client renders a
 * UI-language message from the code. No API contract, business logic,
 * or database change (audit constraint #3).
 *
 * Usage — call at the toast/error site where the UI language is known:
 *   localizeApiError(json, { isAr, months })   // for API route JSON bodies
 *   localizeAuthError(rawMessage, isAr)        // for Supabase GoTrue raw strings
 *
 * Fallback law (honest, never invents): unknown codes/messages fall
 * through UNCHANGED — exactly today's behavior — rather than being
 * masked by a generic string.
 */

/* ------------------------------------------------------------------ */
/* API route errors (error code + numeric payload)                     */
/* ------------------------------------------------------------------ */

/**
 * Localize a JSON error body from the app's API routes.
 *
 * Arabic UI: the server's canonical Arabic `message` is returned verbatim
 * (single source — no duplicated copy). English UI: known error codes map
 * to English messages, carrying the numeric payload the server sent.
 * Unknown codes fall back to the raw message (honest fallback).
 *
 * @param json   parsed JSON body of the failed response (may be null —
 *               callers `.catch(() => null)` on transport failures).
 * @param opts   isAr — the UI language at the toast site;
 *               months — the requested duration when known (used to
 *               pluralize the insufficient_wallet message).
 */
export function localizeApiError(
  json: { error?: string; message?: string; balance?: number; cost?: number } | null | undefined,
  opts: { isAr: boolean; months?: number },
): string {
  if (!json) return "";
  // AR UI: server Arabic message stays the single source of truth.
  if (opts.isAr) return json.message || json.error || "";

  // EN UI: map the known codes of /api/coach/subscriptions/activate
  // (the audit-confirmed M1 surface). Codes are the stable contract.
  switch (json.error) {
    case "insufficient_wallet": {
      // Full variant carries balance + cost (pre-debit gate).
      if (typeof json.balance === "number" && typeof json.cost === "number") {
        const months = opts.months;
        const monthsLabel =
          typeof months === "number" ? `${months} ${months === 1 ? "month" : "months"}` : "this plan";
        return `Your wallet balance ($${json.balance}) is not enough to activate ${monthsLabel} — $${json.cost} is required. Top up your wallet first (PayPal / InstaPay / Vodafone Cash) and the activation completes instantly.`;
      }
      // Debit-failure variant (no numeric payload).
      return "Your wallet balance is not enough — top up your wallet first (InstaPay / Vodafone Cash / PayPal).";
    }
    case "coach_tier_forbidden":
      return "Coaches activate the Coaching package only — site memberships (Premium / Pro) are sold on the site itself, never from the coach dashboard.";
    case "not_found":
      return "Client not found.";
    case "not_a_client":
      return "This is not a client — team members cannot have subscriptions activated.";
    case "not_your_client":
      return "This client is not assigned to you.";
    case "activation_failed":
      return "Subscription activation failed — please try again.";
    case "bad_request":
      return "Invalid client.";
    case "bad_tier":
      return "Choose a valid plan (Premium / Pro / Coaching).";
    case "bad_months":
      return "Duration must be between 1 and 12 months.";
    case "bad_amount":
      return "Invalid amount.";
    case "bad_method":
      return "Unknown payment method.";
    case "forbidden":
      return "This page is for coaches only.";
    case "db_error":
      return "Wallet system is not ready yet — please contact support.";
    default:
      // Unknown code: the honest fallback is the server's own message.
      return json.message || json.error || "";
  }
}

/* ------------------------------------------------------------------ */
/* Supabase GoTrue raw auth error strings                              */
/* ------------------------------------------------------------------ */

/**
 * Localize raw Supabase auth error messages (login/signup).
 *
 * English UI: GoTrue messages are already English — returned as-is.
 * Arabic UI: the known messages map to friendly Arabic; unknown strings
 * fall through unchanged (honest fallback — never mask a real error).
 */
export function localizeAuthError(raw: string | null | undefined, isAr: boolean): string {
  const msg = (raw || "").trim();
  if (!msg) return "";
  if (!isAr) return msg;

  // GoTrue messages are stable strings; match on the known set.
  // RECOVERY-OTP MODE (2026-09-22, owner order «نفذ خيار otp»): the
  // verifyOtp({ type: "recovery" }) failure strings join the set — a
  // wrong/expired code and a consumed link must speak the UI language
  // on /auth/reset (M1 law: no raw GoTrue strings in the AR UI).
  const KEY_RE =
    /(invalid login credentials|email not confirmed|user already registered|password should be at least|too many requests|network request failed|unable to validate email|email address is invalid|email otp has expired or is invalid|otp has expired|token has expired or is invalid|email link is invalid or has already been used)/i;
  const key = KEY_RE.exec(msg)?.[1]?.toLowerCase();
  switch (key) {
    case "invalid login credentials":
      return "البريد الإلكتروني أو كلمة المرور غير صحيحة.";
    case "email not confirmed":
      return "لم يتم تأكيد البريد الإلكتروني بعد — تواصل مع الدعم لإكمال التأكيد.";
    case "user already registered":
      return "هذا البريد الإلكتروني مسجل بالفعل — سجّل دخولك أو استعادة كلمة المرور.";
    case "password should be at least":
      return "كلمة المرور قصيرة جدًا.";
    case "too many requests":
      return "محاولات كثيرة جدًا — انتظر قليلًا ثم حاول مجددًا.";
    case "network request failed":
      return "تعذر الاتصال بالخدمة — تحقق من الإنترنت وحاول مجددًا.";
    case "unable to validate email":
    case "email address is invalid":
      return "البريد الإلكتروني غير صالح.";
    case "email otp has expired or is invalid":
    case "otp has expired":
    case "token has expired or is invalid": // LIVE-PROVEN 2026-09-22: gotrue's actual verifyOtp failure string (browser E2E, wrong code) — different from the docs-era "Email OTP…" string
      return "رمز الاستعادة غير صحيح أو انتهت صلاحيته — تأكد من الأرقام الستة، أو أعد إرسال رمز جديد.";
    case "email link is invalid or has already been used":
      return "رابط الاستعادة غير صالح أو استُخدم سابقًا — ابدأ الاستعادة من جديد أو أدخل الرمز من بريدك.";
    default:
      return msg;
  }
}

/* ------------------------------------------------------------------ */
/* I18N-SWEEP-255 — client-facing API surfaces (coach invite/resend,   */
/* send-email, tools/lead): stable codes on the wire, UI-language text */
/* at the toast site. Honest fallback: unknown codes pass through.     */
/* ------------------------------------------------------------------ */

/**
 * Coach invite + resend codes (/api/coach/clients/invite[/resend]).
 * Known codes localize to the UI language; unknown codes return null so
 * the caller keeps its existing message||error passthrough.
 */
export function localizeCoachInviteError(
  code: string | null | undefined,
  isAr: boolean,
): string | null {
  switch (code) {
    case "invalid_email":
      return isAr ? "اكتب بريدًا إلكترونيًا صحيحًا" : "Please enter a valid email address";
    case "already_registered_client":
      return isAr
        ? "هذا الإيميل عميل مسجل بالفعل — الأدمن فقط يمكنه تعيينه لك"
        : "This email is already a registered client — only the admin can assign him to you";
    case "already_registered_staff":
      return isAr
        ? "هذا الإيميل من فريق العمل بالفعل"
        : "This email is already a staff member";
    case "invite_failed":
      return isAr
        ? "فشل إرسال الدعوة — حاول مرة أخرى"
        : "Failed to send the invite — please try again";
    case "rate_limited":
      return isAr
        ? "محاولات كثيرة — انتظر دقيقة ثم حاول مرة أخرى"
        : "Too many attempts — wait a minute and try again";
    case "not_found":
      return isAr
        ? "لا توجد دعوة معلقة لهذا البريد"
        : "No pending invitation for this email";
    case "not_pending":
      return isAr
        ? "هذا العميل فعّل حسابه بالفعل — لا حاجة لإعادة الإرسال"
        : "This client already activated his account — no need to resend";
    case "email_not_configured":
      return isAr
        ? "خدمة البريد غير مهيأة — أبلغ الدعم"
        : "Email service is not configured — contact support";
    default:
      return null; // honest fallback — the caller keeps its own passthrough
  }
}

/** /api/send-email codes (LeadCaptureCard). */
export function localizeSendEmailError(
  code: string | null | undefined,
  isAr: boolean,
): string | null {
  switch (code) {
    case "rate_limited":
      return isAr
        ? "طلبات كثيرة — حاول مرة أخرى بعد قليل"
        : "Too many requests — please try again shortly";
    case "daily_limit":
      return isAr
        ? "تم بلوغ الحد اليومي للرسائل — حاول مجددًا غدًا"
        : "Daily email limit reached — please try again tomorrow";
    case "invalid_email":
      return isAr
        ? "اكتب بريدًا إلكترونيًا صحيحًا"
        : "Please enter a valid email address";
    case "invalid_request":
      return isAr ? "طلب غير صالح" : "Invalid request";
    case "not_configured":
      return isAr ? "خدمة البريد غير مهيأة" : "Email service is not configured";
    case "send_failed":
      return isAr
        ? "فشل إرسال البريد — حاول مرة أخرى"
        : "Failed to send the email — please try again";
    default:
      return null;
  }
}

/** /api/tools/lead codes (NewsletterForm). */
export function localizeLeadError(
  code: string | null | undefined,
  isAr: boolean,
): string | null {
  switch (code) {
    case "rate_limited":
      return isAr
        ? "طلبات كثيرة — حاول مرة أخرى بعد قليل"
        : "Too many requests — please try again shortly";
    case "invalid_email":
      return isAr
        ? "اكتب بريدًا إلكترونيًا صحيحًا"
        : "Please enter a valid email address";
    case "invalid_request":
      return isAr ? "طلب غير صالح" : "Invalid request";
    case "save_failed":
    case "internal":
      return isAr
        ? "حدث خطأ — حاول مرة أخرى"
        : "Something went wrong — please try again";
    default:
      return null;
  }
}
