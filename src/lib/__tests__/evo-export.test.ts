import { describe, it, expect } from "vitest";
import {
  buildEvoTranscriptMarkdown,
  buildEvoPrintHtml,
  type EvoExportMessage,
} from "@/lib/evo-export";

/**
 * EVO-5 (W5.6) — conversation export. Copy = the paste-able deliverable
 * (copy-vs-display law); PDF = a static print document that must be
 * injection-safe (HTML-escaped) and must skip quota/error bubbles exactly
 * like the 👍/👎 rating does.
 */
const MESSAGES: EvoExportMessage[] = [
  { role: "user", content: "كام سعرة في صدور دجاج؟" },
  { role: "assistant", content: "حوالي 165 سعرة لكل 100 جرام." },
  { role: "assistant", content: "⏰ You've reached today's EVO chat limit." },
  { role: "assistant", content: "عذراً، حصل خطأ مؤقت." },
  { role: "user", content: "<script>alert(1)</script> وشوف ده \"اقتباس\" & رمز" },
];

describe("buildEvoTranscriptMarkdown", () => {
  it("includes real messages with speaker labels in both locales", () => {
    const ar = buildEvoTranscriptMarkdown(MESSAGES, "ar");
    expect(ar).toContain("محادثة EVO — Alkemos");
    expect(ar).toContain("**أنت:** كام سعرة في صدور دجاج؟");
    expect(ar).toContain("**EVO:** حوالي 165 سعرة لكل 100 جرام.");
    const en = buildEvoTranscriptMarkdown(MESSAGES, "en");
    expect(en).toContain("EVO conversation — Alkemos");
    expect(en).toContain("**You:**");
  });

  it("skips quota and error bubbles (⏰ / عذراً)", () => {
    const md = buildEvoTranscriptMarkdown(MESSAGES, "ar");
    expect(md).not.toContain("⏰");
    expect(md).not.toContain("عذراً، حصل خطأ");
  });

  it("is a PLAIN-TEXT deliverable — raw characters stay literal (clipboard, not HTML)", () => {
    const md = buildEvoTranscriptMarkdown(MESSAGES, "en");
    // A text/plain clipboard payload is inert: no engine renders it as
    // HTML. The literal characters pass through unchanged on purpose.
    expect(md).toContain("<script>alert(1)</script>");
  });
});

describe("buildEvoPrintHtml", () => {
  it("produces a static document with locale direction and no scripts", () => {
    const html = buildEvoPrintHtml(MESSAGES, "ar");
    expect(html).toContain('dir="rtl"');
    expect(html).toContain("محادثة EVO — Alkemos");
    expect(html).not.toContain("<script>");
  });

  it("escapes user content (XSS-safe by construction)", () => {
    const html = buildEvoPrintHtml(MESSAGES, "en");
    expect(html).toContain("&lt;script&gt;alert(1)&lt;/script&gt;");
    expect(html).toContain("&quot;اقتباس&quot;");
    expect(html).toContain("&amp; رمز");
  });

  it("renders user bubbles and EVO bubbles distinctly", () => {
    const html = buildEvoPrintHtml(MESSAGES, "en");
    expect(html).toContain('row user');
    expect(html).toContain('row evo');
  });
});
