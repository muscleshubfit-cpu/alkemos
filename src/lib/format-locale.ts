/**
 * format-locale.ts — NOTIF-I18N-250
 *
 * One shared locale-formatting law for every client surface: numbers and
 * dates speak the ACTIVE UI language, not the browser's accident.
 *
 * Why it exists (live evidence 2026-09-22, frame 250 sweep):
 *   - The member dashboard's AR mirror rendered «30 يوم متبقٍ» «84.5كجم»
 *     «10/21/2026» with Latin digits + US date order, while the site header
 *     and the admin dashboard rendered the SAME data as «٣٩» «٣١» — two
 *     numeral systems on one screen for one user.
 *   - Notification bells rendered `toLocaleString()` with no locale — the
 *     format depended on the visitor's device (en-US inside the AR UI).
 *
 * The admin dashboard already used Intl "ar-EG" (Arabic-Indic digits) —
 * this helper generalizes that convention to every surface. Currency
 * amounts stay Latin on purpose (the admin finance tiles keep "$44.97"):
 * pass opts to opt out for specific values.
 */

export type UiLang = "en" | "ar";

export function localeTagFor(lang: UiLang): string {
  return lang === "ar" ? "ar-EG" : "en-US";
}

/** Format a number in the UI language (ar → Arabic-Indic digits). */
export function formatNumberFor(
  value: number | string,
  lang: UiLang,
  opts?: Intl.NumberFormatOptions,
): string {
  const n = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(n)) {
    // Honest passthrough: non-numeric input (placeholders like "—") is
    // returned untouched rather than coerced to NaN/0.
    return typeof value === "string" ? value : String(value);
  }
  return new Intl.NumberFormat(localeTagFor(lang), opts).format(n);
}

/** Format a date in the UI language. Invalid input → "" (honest empty). */
export function formatDateFor(
  value: string | number | Date,
  lang: UiLang,
  opts?: Intl.DateTimeFormatOptions,
): string {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return new Intl.DateTimeFormat(
    localeTagFor(lang),
    opts ?? { year: "numeric", month: "short", day: "numeric" },
  ).format(d);
}

/** Format a date+time in the UI language (bell rows, activity feeds). */
export function formatDateTimeFor(
  value: string | number | Date,
  lang: UiLang,
): string {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return new Intl.DateTimeFormat(localeTagFor(lang), {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(d);
}
