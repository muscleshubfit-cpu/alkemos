import { describe, it, expect } from "vitest";
import {
 localizeNotification,
 arMonthsPhrase,
 enMonthsPhrase,
} from "../notification-i18n";
import {
 formatNumberFor,
 formatDateFor,
 formatDateTimeFor,
 localeTagFor,
} from "../format-locale";

/**
 * NOTIF-I18N-250 canaries — the notification display-layer contract
 * (the M1 error-i18n law applied to the bell):
 *  - known system types localize to the ACTIVE UI language from the
 *    structured payload (migration 0093);
 *  - unknown types, free-text coach broadcasts and legacy rows fall
 *    through VERBATIM (honest fallback, never masked);
 *  - the «1 أشهر» grammar bug (singular numeral + plural noun, seen live
 *    2026-09-22) can never come back — arMonthsPhrase owns the plural law;
 *  - numbers/dates render per UI language (ar-EG → Arabic-Indic).
 */

describe("arMonthsPhrase — Arabic month plural law", () => {
 it("1 → شهر واحد (no numeral, no plural noun)", () => {
 expect(arMonthsPhrase(1)).toBe("شهر واحد");
 });

 it("2 → شهرين (dual)", () => {
 expect(arMonthsPhrase(2)).toBe("شهرين");
 });

 it("3–10 → أشهر with Arabic-Indic digits", () => {
 expect(arMonthsPhrase(3)).toBe("٣ أشهر");
 expect(arMonthsPhrase(10)).toBe("١٠ أشهر");
 });

 it("11+ → شهرًا with Arabic-Indic digits", () => {
 expect(arMonthsPhrase(11)).toBe("١١ شهرًا");
 expect(arMonthsPhrase(12)).toBe("١٢ شهرًا");
 });
});

describe("enMonthsPhrase", () => {
 it("singular for 1, plural otherwise", () => {
 expect(enMonthsPhrase(1)).toBe("1 month");
 expect(enMonthsPhrase(3)).toBe("3 months");
 });
});

describe("localizeNotification — subscription_approved", () => {
 const row = {
 type: "subscription_approved",
 title: "تم تفعيل اشتراكك!",
 body: "تم الموافقة على طلب اشتراكك (premium) لمدة 1 أشهر.",
 payload: { tier: "premium", months: 1 },
 };

 it("EN member reads English (never the raw Arabic body)", () => {
 const out = localizeNotification(row, "en");
 expect(out.title).toBe("Subscription activated!");
 expect(out.body).toContain("Premium");
 expect(out.body).toContain("1 month");
 expect(out.body).not.toMatch(/[\u0600-\u06FF]/);
 });

 it("AR member reads the corrected grammar — «شهر واحد», not «1 أشهر»", () => {
 const out = localizeNotification(row, "ar");
 expect(out.body).toContain("بريميوم");
 expect(out.body).toContain("شهر واحد");
 expect(out.body).not.toContain("1 أشهر");
 });

 it("multi-month payload pluralizes per language", () => {
 const three = { ...row, payload: { tier: "pro", months: 3 } };
 expect(localizeNotification(three, "ar").body).toContain("٣ أشهر");
 expect(localizeNotification(three, "en").body).toContain("3 months");
 });

 it("unknown tier passes through as the product key (legacy bodies did)", () => {
 const odd = { ...row, payload: { tier: "gold_x", months: 2 } };
 expect(localizeNotification(odd, "en").body).toContain("gold_x");
 });
});

describe("localizeNotification — subscription_rejected", () => {
 const row = {
 type: "subscription_rejected",
 title: "تم رفض طلب الاشتراك",
 body: "تم رفض طلب اشتراكك. يرجى التواصل مع الدعم.",
 payload: { reason: "وصل المبلغ ناقصًا" },
 };

 it("EN includes the admin reason, AR keeps canonical phrasing", () => {
 expect(localizeNotification(row, "en").body).toContain("وصل المبلغ ناقصًا");
 expect(localizeNotification(row, "en").title).toBe("Subscription request rejected");
 expect(localizeNotification(row, "ar").body).toContain("تم رفض طلب اشتراكك.");
 });

 it("empty reason renders without a dangling bracket", () => {
 const out = localizeNotification({ ...row, payload: { reason: "" } }, "en");
 expect(out.body).not.toContain("()");
 });
});

describe("localizeNotification — subscription_activated (coach path)", () => {
 const row = {
 type: "subscription_activated",
 title: "تم تفعيل اشتراكك 🎉",
 body: "مدربك قام بتفعيل اشتراكك لمدة 2 شهر — ساري حتى ١٠/١٠/٢٠٢٦.",
 payload: { months: 2, end: "2026-10-10" },
 };

 it("AR uses the dual «شهرين» + Arabic-Indic end date", () => {
 const out = localizeNotification(row, "ar");
 expect(out.body).toContain("شهرين");
 expect(out.body).toMatch(/[٠-٩]/); // Arabic-Indic digits in the date
 });

 it("EN renders a full English sentence with an English date", () => {
 const out = localizeNotification(row, "en");
 expect(out.body).toContain("2 months");
 expect(out.body).not.toMatch(/[\u0600-\u06FF]/);
 });
});

describe("localizeNotification — plan_activated + questionnaire_status", () => {
 it("plan_activated names the plan kind per language", () => {
 const meal = {
 type: "plan_activated",
 title: "تم تفعيل خطة جديدة لك!",
 body: "خطتك الجديدة جاهزة الآن.",
 payload: { plan_type: "meal" },
 };
 expect(localizeNotification(meal, "en").body).toContain("meal plan");
 expect(localizeNotification(meal, "ar").body).toContain("الغذائية");
 });

 it("questionnaire_status approved / needs_info localize both sides", () => {
 const approved = {
 type: "questionnaire_status",
 title: "تمت الموافقة على استبيانك",
 body: "استبيان التغذية: تمت الموافقة على استبيانك",
 payload: { qtype: "nutrition", status: "approved" },
 };
 expect(localizeNotification(approved, "en").title).toBe("Your questionnaire was approved");
 expect(localizeNotification(approved, "ar").body).toContain("التغذية");

 const needsInfo = {
 type: "questionnaire_status",
 title: "يحتاج استبيانك لمزيد من المعلومات",
 body: "استبيان اللياقة: يحتاج استبيانك لمزيد من المعلومات",
 payload: { qtype: "fitness", status: "needs_info" },
 };
 expect(localizeNotification(needsInfo, "en").title).toBe("Your questionnaire needs more info");
 expect(localizeNotification(needsInfo, "en").body).toContain("fitness");
 });
});

describe("localizeNotification — honest fallback law", () => {
 it("unknown type falls through verbatim (free-text coach broadcasts)", () => {
 const row = { type: "coach_broadcast", title: "رسالة من مدربك", body: "نص حر من المدرب" };
 expect(localizeNotification(row, "en")).toEqual({ title: row.title, body: row.body });
 });

 it("known type with MISSING payload fields falls back to the stored text", () => {
 const row = {
 type: "subscription_approved",
 title: "تم تفعيل اشتراكك!",
 body: "نص قديم محفوظ قبل 0093.",
 payload: null,
 };
 expect(localizeNotification(row, "en").body).toBe("نص قديم محفوظ قبل 0093.");
 });

 it("partial payload (no months) falls back — never renders a broken sentence", () => {
 const row = {
 type: "subscription_approved",
 title: "تم تفعيل اشتراكك!",
 body: "النص الأصلي.",
 payload: { tier: "premium" },
 };
 expect(localizeNotification(row, "ar").body).toBe("النص الأصلي.");
 });
});

describe("format-locale — UI-language numbers and dates", () => {
 it("localeTagFor maps ar→ar-EG, en→en-US", () => {
 expect(localeTagFor("ar")).toBe("ar-EG");
 expect(localeTagFor("en")).toBe("en-US");
 });

 it("AR renders Arabic-Indic digits; EN stays Latin", () => {
 expect(formatNumberFor(30, "ar")).toBe("٣٠");
 expect(formatNumberFor(84.5, "ar")).toBe("٨٤٫٥");
 expect(formatNumberFor(84.5, "en")).toBe("84.5");
 });

 it("numeric strings are formatted; non-numeric strings pass through honestly", () => {
 expect(formatNumberFor("2", "ar")).toBe("٢");
 expect(formatNumberFor("—", "ar")).toBe("—");
 });

 it("maximumFractionDigits keeps deltas to one decimal", () => {
 expect(formatNumberFor(0.4499999, "en", { maximumFractionDigits: 1 })).toBe("0.4");
 });

 it("dates render per language; invalid input → empty string", () => {
 expect(formatDateFor("2026-10-21", "ar")).toMatch(/[٠-٩]/);
 expect(formatDateFor("2026-10-21", "en")).toMatch(/2026/);
 expect(formatDateFor("not-a-date", "ar")).toBe("");
 expect(formatDateTimeFor("not-a-date", "en")).toBe("");
 });
});

/**
 * STAGE-253 — progress_weekly_reminder: the weekly cron bell speaks the
 * viewer's language. Fixed-copy type (the only variable is the optional
 * greeting name), so even legacy rows without payload localize — nothing
 * is invented, there is no data to guess.
 */
describe("progress_weekly_reminder — weekly bell i18n (STAGE-253)", () => {
 it("EN member with name gets an English bell", () => {
 expect(
 localizeNotification(
 {
 type: "progress_weekly_reminder",
 title: "حان وقت تسجيل تقدمك الأسبوعي!",
 body: "مرحباً أحمد، متنساش تسجل متابعتك",
 payload: { name: "Ahmed" },
 },
 "en",
 ),
 ).toEqual({
 title: "Time to log your weekly progress!",
 body: "Hi Ahmed — don't forget your weekly check-in (weight, measurements, energy). It helps your coach track your progress!",
 });
 });

 it("AR member keeps a correct Arabic bell from the payload", () => {
 const out = localizeNotification(
 {
 type: "progress_weekly_reminder",
 title: "حان وقت تسجيل تقدمك الأسبوعي!",
 body: "مرحباً أحمد، متنساش تسجل متابعتك",
 payload: { name: "أحمد" },
 },
 "ar",
 );
 expect(out.title).toBe("حان وقت تسجيل تقدمك الأسبوعي!");
 expect(out.body).toContain("مرحبًا أحمد");
 expect(out.body).toContain("متابعتك الأسبوعية");
 });

 it("legacy rows (no payload) still localize — fixed-copy type, no data guessed", () => {
 expect(
 localizeNotification(
 {
 type: "progress_weekly_reminder",
 title: "حان وقت تسجيل تقدمك الأسبوعي!",
 body: "مرحباً، متنساش تسجل متابعتك الأسبوعية",
 },
 "en",
 ).title,
 ).toBe("Time to log your weekly progress!");
 });

 it("empty name → greeting without a name in both languages", () => {
 expect(
 localizeNotification(
 {
 type: "progress_weekly_reminder",
 title: "t",
 body: "b",
 payload: { name: "" },
 },
 "ar",
 ).body,
 ).toMatch(/^مرحبًا،/);
 expect(
 localizeNotification(
 {
 type: "progress_weekly_reminder",
 title: "t",
 body: "b",
 payload: {},
 },
 "en",
 ).body,
 ).toMatch(/^Hi —/);
 });
});
