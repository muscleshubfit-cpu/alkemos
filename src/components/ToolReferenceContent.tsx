"use client";

import { useI18n } from "@/lib/i18n";
import type {
  Bi,
  ContentBlock,
  ReferenceTable,
  ToolReference,
} from "@/lib/content/tool-reference";

/**
 * ToolReferenceContent — Phase SEO-GEO-6.5 (§12.19 P1-6).
 *
 * Shared RENDERER for the six standalone tool pages' deep reference
 * content (calculator.net standard). The renderer is chrome only —
 * every tool passes its own unique ToolReference module (owner law:
 * «تاكد ان كل اداة صفحة مستقلة» — content is never shared between
 * tools, only the presentation).
 *
 * FAQ renders as visible headings + paragraphs (no FAQPage schema —
 * §12.19 DO-NOT list). Tables scroll horizontally on narrow screens.
 */

function RefTable({ table, lang }: { table: ReferenceTable; lang: "en" | "ar" }) {
  const isAr = lang === "ar";
  return (
    <figure className="my-4">
      <figcaption className="mb-2 text-sm font-medium text-[var(--text)]">
        {table.caption[lang]}
      </figcaption>
      <div className="overflow-x-auto rounded-xl border border-[var(--edge)]">
        <table className="w-full min-w-[420px] border-collapse text-sm font-normal">
          <thead>
            <tr className="bg-[var(--tint)]">
              {table.columns.map((c, i) => (
                <th
                  key={i}
                  scope="col"
                  className="border-b border-[var(--edge)] px-3 py-2 text-start font-medium text-[var(--text)]"
                >
                  {c[lang]}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {table.rows.map((r, ri) => (
              <tr key={ri} className="odd:bg-[var(--tint)]/40">
                {r[lang].map((cell, ci) => (
                  <td
                    key={ci}
                    className="border-b border-[var(--edge)]/60 px-3 py-2 text-[var(--muted-foreground)]"
                  >
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </figure>
  );
}

function Block({ block, lang }: { block: ContentBlock; lang: "en" | "ar" }) {
  if (block.kind === "p") {
    return <p className="mt-3 leading-relaxed">{block.text[lang]}</p>;
  }
  if (block.kind === "h3") {
    return (
      <h3 className="mt-6 text-base font-semibold tracking-tight text-[var(--text)]">
        {block.text[lang]}
      </h3>
    );
  }
  if (block.kind === "list") {
    const Tag = block.ordered ? "ol" : "ul";
    return (
      <Tag
        className={
          block.ordered
            ? "mt-3 list-decimal space-y-1.5 ps-5 leading-relaxed"
            : "mt-3 list-disc space-y-1.5 ps-5 leading-relaxed"
        }
      >
        {block.items.map((item: Bi, i: number) => (
          <li key={i}>{item[lang]}</li>
        ))}
      </Tag>
    );
  }
  return <RefTable table={block.table} lang={lang} />;
}

export function ToolReferenceContent({ content }: { content: ToolReference }) {
  const { lang } = useI18n();
  const isAr = lang === "ar";

  return (
    <div className="mt-12 space-y-4 text-base font-normal leading-relaxed text-[var(--muted-foreground)]">
      {/* Lead paragraph */}
      <p>{content.intro[isAr ? "ar" : "en"]}</p>

      {/* H2 sections with stable anchors */}
      {content.sections.map((section) => (
        <section key={section.id} id={section.id} className="scroll-mt-24">
          <h2 className="mt-8 text-xl font-semibold tracking-tight text-[var(--text)]">
            {section.heading[isAr ? "ar" : "en"]}
          </h2>
          {section.blocks.map((b, i) => (
            <Block key={i} block={b} lang={isAr ? "ar" : "en"} />
          ))}
        </section>
      ))}

      {/* Visible FAQ — plain text, never FAQPage schema */}
      {content.faqs.length > 0 && (
        <section id="faq" className="scroll-mt-24">
          <h2 className="mt-8 text-xl font-semibold tracking-tight text-[var(--text)]">
            {isAr
              ? "الأسئلة الشائعة حول هذه الأداة"
              : "Frequently asked questions about this tool"}
          </h2>
          {content.faqs.map((f, i) => (
            <div key={i} className="mt-4">
              <h3 className="text-base font-semibold tracking-tight text-[var(--text)]">
                {f.q[isAr ? "ar" : "en"]}
              </h3>
              <p className="mt-1.5 leading-relaxed">
                {f.a[isAr ? "ar" : "en"]}
              </p>
            </div>
          ))}
        </section>
      )}
    </div>
  );
}
