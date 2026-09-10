/**
 * EVO-5 (W5) — conversation export (pure helpers + zero dependencies).
 *
 * W5.6 «تصدير المحادثة (نسخ/PDF)»: the widget header gains two small
 * buttons — «نسخ المحادثة» (clipboard markdown) and «حفظ PDF» (a print
 * window with a styled transcript — every mobile/desktop browser's print
 * dialog offers "Save as PDF", so NO pdf library and NO new dependency
 * is introduced; the paste-able text is the copy deliverable).
 *
 * READ-ONLY BY DESIGN: the exporter never writes history (hydration-gated
 * persistence law untouched) and never calls an API (no wiring surface).
 * Both builders are pure — unit-tested for shape, escaping and locale.
 */

export type EvoExportMessage = {
  role: "user" | "assistant";
  content: string;
};

export type EvoExportLocale = "ar" | "en";

/** Escape user/model text for safe HTML interpolation in the print view. */
function esc(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Plain-text lines allowed in transcript bubbles (blocks injection). */
function safeLine(text: string): string {
  return text.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, "").trim();
}

/**
 * Build the paste-able transcript (the «نسخ» deliverable). Only REAL
 * messages — quota/error bubbles are skipped exactly like the 👍/👎
 * rating skips them (⏰ limit / عذراً prefixes).
 */
export function buildEvoTranscriptMarkdown(
  messages: EvoExportMessage[],
  locale: EvoExportLocale,
): string {
  const isAr = locale === "ar";
  const title = isAr ? "محادثة EVO — Alkemos" : "EVO conversation — Alkemos";
  const dateStr = new Date().toLocaleDateString(isAr ? "ar-EG" : "en-GB");
  const userLabel = isAr ? "أنت" : "You";
  const evoLabel = "EVO";
  const lines = messages
    .filter((m) => m.content && m.content.trim().length > 0)
    .filter(
      (m) =>
        !(m.role === "assistant" && m.content.startsWith("⏰")) &&
        !(m.role === "assistant" && m.content.startsWith("عذراً")),
    )
    .map((m) => {
      const who = m.role === "user" ? userLabel : evoLabel;
      return `**${who}:** ${safeLine(m.content)}`;
    });
  return [title, dateStr, "—".repeat(20), ...lines, "", isAr ? "alkemos.com" : "alkemos.com"].join(
    "\n",
  );
}

/**
 * Build the styled print document (the «حفظ PDF» deliverable). Bubbles
 * mirror the widget's user-right / EVO-left layout, direction auto per
 * locale, no scripts — a pure static document for window.print().
 */
export function buildEvoPrintHtml(
  messages: EvoExportMessage[],
  locale: EvoExportLocale,
): string {
  const isAr = locale === "ar";
  const title = isAr ? "محادثة EVO — Alkemos" : "EVO conversation — Alkemos";
  const dateStr = new Date().toLocaleDateString(isAr ? "ar-EG" : "en-GB");
  const userLabel = isAr ? "أنت" : "You";
  const bubbles = messages
    .filter((m) => m.content && m.content.trim().length > 0)
    .filter(
      (m) =>
        !(m.role === "assistant" && m.content.startsWith("⏰")) &&
        !(m.role === "assistant" && m.content.startsWith("عذراً")),
    )
    .map((m) => {
      const who = m.role === "user" ? userLabel : "EVO";
      const isUser = m.role === "user";
      return `<div class="row ${isUser ? "user" : "evo"}">
  <span class="who">${esc(who)}</span>
  <div class="bubble">${esc(safeLine(m.content)).replace(/\n/g, "<br/>")}</div>
</div>`;
    })
    .join("\n");
  return `<!doctype html>
<html lang="${locale}" dir="${isAr ? "rtl" : "ltr"}">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1"/>
<title>${esc(title)}</title>
<style>
  * { box-sizing: border-box; }
  body { font-family: -apple-system, "Segoe UI", Tahoma, sans-serif; color: #1d1d1f; margin: 0; padding: 24px; background: #fff; }
  h1 { font-size: 18px; margin: 0 0 4px; }
  .date { color: #6e6e73; font-size: 12px; margin-bottom: 20px; }
  .row { display: flex; flex-direction: column; margin-bottom: 12px; max-width: 85%; }
  .row.user { align-items: flex-end; margin-inline-start: auto; }
  .who { font-size: 11px; color: #6e6e73; margin-bottom: 2px; }
  .bubble { padding: 10px 14px; border-radius: 16px; font-size: 14px; line-height: 1.6; white-space: pre-wrap; }
  .user .bubble { background: #1d1d1f; color: #fff; }
  .evo .bubble { background: #f5f5f7; color: #1d1d1f; }
  footer { margin-top: 24px; color: #6e6e73; font-size: 11px; text-align: center; }
  @media print { body { padding: 0; } }
</style>
</head>
<body>
<h1>${esc(title)}</h1>
<div class="date">${esc(dateStr)}</div>
${bubbles}
<footer>alkemos.com — EVO</footer>
</body>
</html>`;
}
