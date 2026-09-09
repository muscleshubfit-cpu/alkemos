/**
 * HubDepthSections — server-rendered depth sections for hub/collection
 * pages (SEO/GEO master plan Phase SEO-GEO-5.2, template §6.3 items 4+5).
 *
 * Two independent sections so pages can place them at different depths:
 *   HubGuideSection — explanatory guide text right after the page intro
 *   HubFaqSection   — atomic-answer FAQ accordions before the page CTA
 *
 * Deliberately NO schema markup: per docs/SEO-SCHEMA-REFERENCE.md,
 * FAQPage rich results were fully retired by Google (2026-05-07) and
 * QAPage is reserved for genuine user-submitted Q&A — the visible
 * bilingual Q&A text itself is the GEO asset (master plan §8.2 #4).
 *
 * No client JS: <details>/<summary> accordions keep the answers in
 * server-rendered HTML (crawlable, zero hydration cost).
 */

import type { HubDepthContent } from "@/lib/hub-depth";

type DepthLang = "en" | "ar";

/** Parse the guide body: blank-line-separated blocks; "- " lines become one <ul>. */
function parseGuide(text: string): Array<{ kind: "p"; text: string } | { kind: "ul"; items: string[] }> {
  const blocks: Array<{ kind: "p"; text: string } | { kind: "ul"; items: string[] }> = [];
  for (const raw of text.split("\n\n")) {
    const lines = raw.split("\n").map((l) => l.trim()).filter(Boolean);
    if (lines.length === 0) continue;
    if (lines.every((l) => l.startsWith("- "))) {
      blocks.push({ kind: "ul", items: lines.map((l) => l.slice(2)) });
    } else {
      blocks.push({ kind: "p", text: lines.join(" ") });
    }
  }
  return blocks;
}

export function HubGuideSection({
  depth,
  lang,
  title,
}: {
  depth: HubDepthContent;
  lang: DepthLang;
  title: string;
}) {
  const body = lang === "ar" ? depth.guideAr : depth.guideEn;
  const blocks = parseGuide(body);
  return (
    <section aria-label={title} className="mb-10">
      <h2 className="text-xl md:text-2xl font-semibold mb-4">{title}</h2>
      <div className="space-y-3 text-sm md:text-base text-muted-foreground leading-relaxed">
        {blocks.map((block, i) =>
          block.kind === "p" ? (
            <p key={i}>{block.text}</p>
          ) : (
            <ul key={i} className="list-disc pl-5 space-y-1.5">
              {block.items.map((item, j) => (
                <li key={j}>{item}</li>
              ))}
            </ul>
          ),
        )}
      </div>
    </section>
  );
}

export function HubFaqSection({
  depth,
  lang,
  title,
}: {
  depth: HubDepthContent;
  lang: DepthLang;
  title: string;
}) {
  const faq = depth.faq.map((f) =>
    lang === "ar" ? { q: f.qAr, a: f.aAr } : { q: f.qEn, a: f.aEn },
  );
  return (
    <section aria-label={title} className="mb-10">
      <h2 className="text-xl md:text-2xl font-semibold mb-4">{title}</h2>
      <div className="space-y-2">
        {faq.map((item, i) => (
          <details
            key={i}
            className="group rounded-lg border border-border bg-card open:bg-muted/40 transition-colors"
          >
            <summary className="flex cursor-pointer items-center justify-between gap-3 px-4 py-3 text-sm md:text-base font-medium text-foreground marker:content-none [&::-webkit-details-marker]:hidden">
              <span>{item.q}</span>
              <span
                aria-hidden
                className="shrink-0 text-muted-foreground transition-transform group-open:rotate-45"
              >
                +
              </span>
            </summary>
            <div className="px-4 pb-4 text-sm text-muted-foreground leading-relaxed">
              {item.a}
            </div>
          </details>
        ))}
      </div>
    </section>
  );
}
