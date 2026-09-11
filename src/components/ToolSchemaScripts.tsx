import { jsonLd } from "@/lib/seo";
import { getToolSchemas } from "@/lib/tool-schema";

/**
 * ToolSchemaScripts — Phase SEO-GEO-6.5 (§12.19 P1-6).
 *
 * Server component rendered from each tool layout (EN) and each AR mirror
 * layout — emits the localized WebApplication + BreadcrumbList + HowTo
 * JSON-LD for that page. See src/lib/tool-schema.ts for the data and the
 * laws (no FAQPage, no aggregateRating).
 */
export function ToolSchemaScripts({ tool, lang }: { tool: string; lang: "en" | "ar" }) {
  const schemas = getToolSchemas(tool, lang);
  return (
    <>
      {schemas.map((s, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: jsonLd(s) }}
        />
      ))}
    </>
  );
}
