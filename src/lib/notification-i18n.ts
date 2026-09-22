/**
 * notification-i18n.ts — NOTIF-I18N-250
 *
 * Render-side localization for SYSTEM notifications — the M1 law
 * (lib/error-i18n.ts: localize server text at the DISPLAY layer) applied
 * to the client bell.
 *
 * Live evidence (frame 250 sweep 2026-09-22): an EN-UI member received
 * «تم تفعيل اشتراكك! تم الموافقة على طلب اشتراكك (premium) لمدة 1 أشهر.»
 * — raw Arabic inside the English UI, plus a real grammar bug («1 أشهر»
 * mixes the singular numeral with the plural noun).
 *
 * Design (mirrors error-i18n.ts exactly):
 *   - The DB row keeps its legacy Arabic text at rest (single source,
 *     backward compatible — old rows and free-text coach broadcasts render
 *     verbatim through the honest fallback).
 *   - System creation sites additionally write structured `payload`
 *     fields (migration 0093: payload jsonb, additive).
 *   - Known system `type`s re-render localized title/body from the
 *     catalog + payload at DISPLAY time; anything unknown (or a row whose
 *     payload is missing a required field) falls back to the stored text
 *     verbatim — the fallback is truthful, never a guess.
 */

import { formatDateFor, formatNumberFor, type UiLang } from "@/lib/format-locale";

export type NotificationLang = UiLang;

export type LocalizableNotification = {
  type: string;
  title: string;
  body: string;
  payload?: Record<string, unknown> | null;
};

/** Arabic month phrase law: 1 شهر واحد · 2 شهرين · 3–10 أشهر · 11+ شهرًا */
export function arMonthsPhrase(n: number): string {
  if (n === 1) return "شهر واحد";
  if (n === 2) return "شهرين";
  if (n >= 3 && n <= 10) return `${formatNumberFor(n, "ar")} أشهر`;
  return `${formatNumberFor(n, "ar")} شهرًا`;
}

export function enMonthsPhrase(n: number): string {
  return `${formatNumberFor(n, "en")} month${n === 1 ? "" : "s"}`;
}

const asString = (v: unknown): string =>
  typeof v === "string" || typeof v === "number" ? String(v) : "";

const asMonths = (v: unknown): number | null => {
  const n = typeof v === "number" ? v : typeof v === "string" ? Number(v) : NaN;
  return Number.isFinite(n) && n > 0 ? n : null;
};

// Canonical model tiers (0045/0046) — the label law matches the stored
// legacy bodies (plan key passthrough for anything unmapped).
const TIER_LABELS: Record<string, { en: string; ar: string }> = {
  free: { en: "Free", ar: "مجاني" },
  premium: { en: "Premium", ar: "بريميوم" },
  pro: { en: "Pro", ar: "برو" },
  coaching: { en: "Coaching", ar: "كوتشينج" },
  starter: { en: "Starter", ar: "ستارتر" },
  elite: { en: "Elite", ar: "إيليت" },
};

const tierLabel = (tier: string, lang: NotificationLang): string =>
  TIER_LABELS[tier]?.[lang] ?? tier;

type CatalogEntry = {
  title: (p: Record<string, unknown>, lang: NotificationLang) => string;
  body: (p: Record<string, unknown>, lang: NotificationLang) => string;
};

const CATALOG: Record<string, CatalogEntry> = {
  subscription_approved: {
    title: (_p, lang) => (lang === "ar" ? "تم تفعيل اشتراكك!" : "Subscription activated!"),
    body: (p, lang) => {
      const months = asMonths(p.months);
      const tier = asString(p.tier);
      if (months === null || !tier) return "";
      return lang === "ar"
        ? `تمت الموافقة على طلب اشتراكك (${tierLabel(tier, "ar")}) لمدة ${arMonthsPhrase(months)}.`
        : `Your ${tierLabel(tier, "en")} subscription request was approved — ${enMonthsPhrase(months)}.`;
    },
  },
  subscription_rejected: {
    title: (_p, lang) =>
      lang === "ar" ? "تم رفض طلب الاشتراك" : "Subscription request rejected",
    body: (p, lang) => {
      const reason = asString(p.reason).trim();
      const reasonPart = reason ? (lang === "ar" ? ` (${reason})` : ` (${reason})`) : "";
      return lang === "ar"
        ? `تم رفض طلب اشتراكك.${reasonPart} يرجى التواصل مع الدعم.`
        : `Your subscription request was rejected.${reasonPart} Please contact support.`;
    },
  },
  subscription_activated: {
    title: (_p, lang) =>
      lang === "ar" ? "تم تفعيل اشتراكك 🎉" : "Your subscription is active 🎉",
    body: (p, lang) => {
      const months = asMonths(p.months);
      if (months === null) return "";
      const endIso = asString(p.end);
      const end = endIso ? formatDateFor(endIso, lang) : "";
      return lang === "ar"
        ? `مدربك قام بتفعيل اشتراكك لمدة ${arMonthsPhrase(months)}${end ? ` — ساري حتى ${end}` : ""}.`
        : `Your coach activated your subscription for ${enMonthsPhrase(months)}${end ? ` — valid until ${end}` : ""}.`;
    },
  },
  plan_activated: {
    title: (_p, lang) => (lang === "ar" ? "تم تفعيل خطة جديدة لك!" : "A new plan is ready!"),
    body: (p, lang) => {
      const kind = asString(p.plan_type);
      if (kind !== "meal" && kind !== "workout") return "";
      return lang === "ar"
        ? kind === "meal"
          ? "خطتك الغذائية الجديدة جاهزة الآن. اطّلع عليها من صفحة خططي."
          : "خطتك التدريبية الجديدة جاهزة الآن. اطّلع عليها من صفحة خططي."
        : kind === "meal"
          ? "Your new meal plan is live — open it from My Plans."
          : "Your new workout plan is live — open it from My Plans.";
    },
  },
  questionnaire_status: {
    title: (p, lang) => {
      const status = asString(p.status);
      if (status === "approved") {
        return lang === "ar" ? "تمت الموافقة على استبيانك" : "Your questionnaire was approved";
      }
      if (status === "needs_info") {
        return lang === "ar" ? "يحتاج استبيانك لمزيد من المعلومات" : "Your questionnaire needs more info";
      }
      return "";
    },
    body: (p, lang) => {
      const status = asString(p.status);
      const qtype = asString(p.qtype);
      if (status !== "approved" && status !== "needs_info") return "";
      const q = lang === "ar" ? (qtype === "nutrition" ? "التغذية" : "اللياقة") : qtype === "nutrition" ? "nutrition" : "fitness";
      if (status === "approved") {
        return lang === "ar" ? `استبيان ${q}: تمت الموافقة على استبيانك.` : `Your ${q} questionnaire was approved.`;
      }
      return lang === "ar"
        ? `استبيان ${q}: يحتاج استبيانك لمزيد من المعلومات — راجع مدربك أو حدّث إجاباتك.`
        : `Your ${q} questionnaire needs more info — check with your coach or update your answers.`;
    },
  },
};

/**
 * Localize a notification row for display. Known system types with a
 * complete payload render from the catalog; everything else (old rows,
 * free-text coach broadcasts, unknown types) returns the stored text
 * verbatim — the truthful fallback.
 */
export function localizeNotification(
  row: LocalizableNotification,
  lang: NotificationLang,
): { title: string; body: string } {
  const entry = CATALOG[row.type];
  if (!entry) return { title: row.title, body: row.body };
  const payload = (row.payload ?? {}) as Record<string, unknown>;
  const title = entry.title(payload, lang);
  const body = entry.body(payload, lang);
  return {
    title: title || row.title,
    body: body || row.body,
  };
}
