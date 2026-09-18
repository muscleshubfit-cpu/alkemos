/**
 * SHARE URL LAW — single source for canonical share URLs (Phase 230).
 *
 * P0 fix (Deep Audit of Social Sharing, owner order 2026-09-18 «نفّذ الآن
 * P0 بالكامل من تقرير Deep Audit لنظام Social Sharing»): every ShareButtons
 * surface used to resolve its share URL from `window.location.href` AFTER
 * mount (useEffect) — the server rendered EMPTY share hrefs (wa.me text
 * with no link, Facebook sharer with `u=`, Twitter/LinkedIn/Telegram with
 * an empty `url=`), and pre-Phase-227 those empty hrefs were PERMANENT in
 * the live DOM (React does not patch mismatched attributes). Even after
 * the 227 mountedUrl fix, a pre-hydration click still hit an empty href,
 * and `window.location.href` leaked query/hash params (utm_*, cb) into
 * shared URLs (live-verified: a page opened with `?cb=29859` shared
 * `https://alkemos.com/evo?cb=29859`).
 *
 * THE LAW (enforced by the required `path` prop on ShareButtons + the
 * source guards in share-url.test.ts):
 *   1. The share URL is DETERMINISTIC from the FIRST server render —
 *      built from a page-declared canonical path, never from
 *      window.location.
 *   2. Query and hash fragments are STRIPPED — trackers never leak into
 *      a share.
 *   3. Locale-aware: `lang="ar"` prefixes `/ar` (the URL-space law of
 *      the AR mirrors), idempotently — a path already carrying `/ar`
 *      is never double-prefixed.
 *   4. The result is ALWAYS a complete absolute https URL — an empty
 *      share href is structurally impossible.
 *
 * Blog articles (SocialShare) already followed this law with their own
 * deterministic `articleUrl` (untouched here); CoachShareButtons is a
 * separate surface by the same-phase scope decision (Phase 230 touches
 * ShareButtons only).
 */

/** Absolute site origin — trailing slashes normalized. */
export const SHARE_BASE_URL = (
  process.env.NEXT_PUBLIC_APP_URL || "https://alkemos.com"
).replace(/\/+$/, "");

export type ShareLang = "en" | "ar";

/**
 * Build the absolute canonical share URL for a page path.
 *
 * @param path the page's canonical path in its EN form (e.g. "/evo",
 *             "/tools/bmi-calculator", "/foods/chicken-breast") — any
 *             query/hash fragment is stripped defensively.
 * @param lang current UI language — "ar" prefixes the /ar URL space
 *             (unless the path already carries it).
 * @returns absolute https URL, never empty, never tracker-carrying.
 */
export function canonicalShareUrl(path: string, lang: ShareLang): string {
  // 1) Strip query + hash, collapse to a clean "/a/b" form (also
  //    normalizes duplicate/leading/trailing slashes in one pass).
  const clean = "/" + path.split(/[?#]/)[0].split("/").filter(Boolean).join("/");

  // 2) Locale-aware /ar prefix — idempotent (never "/ar/ar/...").
  const localized =
    lang === "ar" && clean !== "/ar" && !clean.startsWith("/ar/")
      ? `/ar${clean === "/" ? "" : clean}`
      : clean;

  // 3) Absolute URL — the root path collapses to the bare origin.
  return `${SHARE_BASE_URL}${localized === "/" ? "" : localized}`;
}
