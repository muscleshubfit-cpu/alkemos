import { describe, it, expect } from "vitest";
import {
  isFollowupDue,
  buildFollowupEmail,
  EVO_FOLLOWUP_INTERVAL_DAYS,
} from "@/lib/evo-followup";

/**
 * EVO-3 (W2.3, D4) — weekly check-in email pure layer.
 * Laws under test:
 *   - OPT-IN MANDATORY: a non-opted-in row is NEVER due, whatever the
 *     cadence state;
 *   - 7-day cadence from the last SUCCESSFUL send;
 *   - the email carries ONLY the numbers given to it (Platform Truth
 *     law for email) and degrades to honest nudges when data is missing;
 *   - send-only (D4): the footer points to the site, never to a reply
 *     inbox, and always discloses the opt-in origin + opt-out path.
 */

const NOW = new Date("2026-09-10T12:00:00Z");
const daysAgo = (n: number) =>
  new Date(NOW.getTime() - n * 24 * 60 * 60 * 1000).toISOString();

describe("isFollowupDue (D4 opt-in gate + cadence)", () => {
  it("never sends to a non-opted-in user — even if never sent", () => {
    expect(
      isFollowupDue({ opted_in: false, last_sent_at: null }, NOW),
    ).toBe(false);
  });

  it("a freshly opted-in user (never sent) is due immediately", () => {
    expect(isFollowupDue({ opted_in: true, last_sent_at: null }, NOW)).toBe(
      true,
    );
  });

  it("respects the 7-day cadence from the last send", () => {
    expect(
      isFollowupDue({ opted_in: true, last_sent_at: daysAgo(6) }, NOW),
    ).toBe(false);
    expect(
      isFollowupDue({ opted_in: true, last_sent_at: daysAgo(7) }, NOW),
    ).toBe(true);
    expect(
      isFollowupDue({ opted_in: true, last_sent_at: daysAgo(30) }, NOW),
    ).toBe(true);
    expect(EVO_FOLLOWUP_INTERVAL_DAYS).toBe(7);
  });

  it("a corrupt timestamp is treated as never sent (fail-open to due)", () => {
    expect(
      isFollowupDue({ opted_in: true, last_sent_at: "not-a-date" }, NOW),
    ).toBe(true);
  });
});

describe("buildFollowupEmail — real data only", () => {
  const base = {
    name: "أحمد",
    language: "ar" as const,
    weightDeltaKg: null,
    latestWeight: null,
    activePlanTitles: [],
    siteUrl: "https://alkemos.com",
  };

  it("AR down-trend cites the actual numbers", () => {
    const mail = buildFollowupEmail({
      ...base,
      weightDeltaKg: -1.5,
      latestWeight: 88.5,
    });
    expect(mail.subject).toContain("EVO");
    expect(mail.text).toContain("88.5كغ");
    expect(mail.text).toContain("1.5كغ");
    expect(mail.text).toContain("استمر");
  });

  it("AR up-trend is honest, not shaming", () => {
    const mail = buildFollowupEmail({
      ...base,
      weightDeltaKg: 1.2,
      latestWeight: 91.2,
    });
    expect(mail.text).toContain("زدت 1.2كغ");
    expect(mail.text).toContain("نراجع");
  });

  it("no measurements → an honest nudge, never an invented number", () => {
    const mail = buildFollowupEmail(base);
    expect(mail.text).toContain("مفيش قياسات");
    expect(mail.text).not.toMatch(/\d+(\.\d+)?\s*كغ/);
  });

  it("latest-only data asks for a new measurement without a delta claim", () => {
    const mail = buildFollowupEmail({ ...base, latestWeight: 90 });
    expect(mail.text).toContain("90كغ");
    expect(mail.text).toContain("سجل قياس جديد");
  });

  it("lists active plan titles; empty list nudges instead of lying", () => {
    const withPlans = buildFollowupEmail({
      ...base,
      activePlanTitles: ["خطة التضخيم", "خطة الصيف"],
    });
    expect(withPlans.text).toContain("خطة التضخيم، خطة الصيف");
    const withoutPlans = buildFollowupEmail(base);
    expect(withoutPlans.text).toContain("معندكش خطة مفعّلة");
  });

  it("EN variant renders fully in English", () => {
    const mail = buildFollowupEmail({
      ...base,
      language: "en",
      weightDeltaKg: -0.8,
      latestWeight: 84.2,
    });
    expect(mail.subject).toContain("weekly check-in");
    expect(mail.text).toContain("84.2kg");
    expect(mail.text).toContain("down 0.8kg");
    expect(mail.html).toContain('lang="en"');
    expect(mail.html).not.toContain('lang="ar"');
  });

  it("CTA points at the REAL profile route (Platform Truth)", () => {
    const mail = buildFollowupEmail(base);
    expect(mail.html).toContain("https://alkemos.com/profile");
    expect(mail.text).toContain("https://alkemos.com/profile");
  });

  it("send-only (D4): footer discloses the opt-in origin + opt-out path", () => {
    const mail = buildFollowupEmail(base);
    expect(mail.text).toContain("فعّلت المتابعة الأسبوعية");
    expect(mail.text).toContain("لتوقفها");
    expect(mail.html).toContain("لتوقفها عدّل تفضيل المتابعة");
  });

  it("escapes the user's name in HTML (injection-safe email)", () => {
    const mail = buildFollowupEmail({
      ...base,
      name: '<script>alert("x")</script>',
    });
    expect(mail.html).not.toContain("<script>");
    expect(mail.html).toContain("&lt;script&gt;");
  });

  it("caps a very long name at 80 chars", () => {
    const mail = buildFollowupEmail({ ...base, name: "أ".repeat(200) });
    expect(mail.text).not.toContain("أ".repeat(81));
  });
});
