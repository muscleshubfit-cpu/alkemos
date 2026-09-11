/**
 * SEO Utilities — structured data (JSON-LD) for search engines + AI.
 *
 * This file centralizes all structured data schemas so they're consistent
 * across pages. Each function returns a JSON-LD object that can be injected
 * into a page's <script type="application/ld+json"> tag.
 *
 * Schemas included:
 *   - Organization (site-wide, with founder Person — Phase SEO-GEO-2)
 *   - WebSite (site-wide, with SearchAction)
 *   - Service (for coaching page)
 *   - FAQPage (⚠️ DEPRECATED — Google retired rich results May 2026)
 *   - BreadcrumbList (for navigation)
 *   - HowTo (⚠️ DEPRECATED — Google retired rich results Sept 2023)
 *   - Article (for blog posts — with author Person + reviewedBy)
 *   - SoftwareApplication (for EVO AI coach)
 *   - ExerciseAction (for exercise detail pages)
 *   - ItemList (for list pages)
 *
 * Reference: docs/SEO-SCHEMA-REFERENCE.md (from claude-seo project)
 * Reference: docs/SEO-EEAT-FRAMEWORK.md (E-E-A-T signals)
 * Reference: docs/SEO-GEO-MASTER-PLAN.md §6 (content strategy)
 */

import { AHMED_ZAKE, getPersonSchema, type AuthorProfile } from "./authors";
import { SOCIAL_PROFILE_URLS } from "./social";

const SITE_URL = "https://alkemos.com";
const SITE_NAME = "Alkemos";
const SITE_LOGO = `${SITE_URL}/logo.png`;

/**
 * Serialize a JSON-LD object for <script type="application/ld+json">
 * injection (audit M7, 2026-09-07).
 *
 * `JSON.stringify` alone does NOT escape `</script>`: an admin/AI-authored
 * title or answer containing that sequence would break out of the script
 * element and inject markup into the page. Escaping `<` as `\u003c` makes
 * the payload inert inside a script context while staying valid JSON.
 * Use EVERYWHERE a schema is fed to dangerouslySetInnerHTML.
 */
export function jsonLd(obj: unknown): string {
  return JSON.stringify(obj).replace(/</g, "\\u003c");
}

/**
 * Organization schema — describes the company/site.
 * Used on all pages (in layout.tsx).
 *
 * Phase 117 completion (owner directive 2026-09-04): Organization is the
 * FINAL schema choice INSTEAD of LocalBusiness — the owner confirmed
 * there is no local business activity and the project is global.
 * Owner-required fields: name · url · logo · description (short version
 * of the homepage atomic answer) · sameAs. Deliberately NO address /
 * phone / geo fields. sameAs carries ONLY the canonical site URL: a
 * repo-wide search found no OWNED social profiles (facebook/twitter/t.me
 * hits are share-button targets, not profiles) — the owner said to add
 * social links "إن وجدت" (if found) and none exist. areaServed:
 * Worldwide + knowsLanguage stay (global reach, not local presence).
 *
 * Phase SEO-GEO-2 (2026-09-08): added `founder` Person field pointing
 * at the Ahmed Zake ProfilePage @id. This is a strong E-E-A-T signal —
 * it tells Google's Knowledge Graph that a real human stands behind
 * the organization, not just an anonymous brand. Pairs with the
 * `author` Person on every Article schema (getArticleSchema).
 *
 * Phase SEO-GEO-4.6 (2026-09-09): `sameAs` now carries the REAL owned
 * profiles (owner created them — §12.10 entity-building executed):
 * Trustpilot · Product Hunt · Facebook · Instagram · X, from the single
 * source src/lib/social.ts. This is the deferred technical attribution
 * step — it gives the Knowledge Graph the brand-entity links that
 * disambiguate Alkemos from the Alkimos suburb in brand queries.
 */
export function getOrganizationSchema() {
  const founderPerson = getPersonSchema(AHMED_ZAKE);
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    url: SITE_URL,
    logo: SITE_LOGO,
    description:
      "منصة التدريب الرقمي المتكاملة: أكثر من 868 تمرينًا، 8830 أكلة بالقيم الغذائية، برامج جاهزة، حاسبات مجانية، ومدربون معتمدون مع ذكاء اصطناعي EVO.",
    sameAs: [SITE_URL, ...SOCIAL_PROFILE_URLS],
    areaServed: "Worldwide",
    knowsLanguage: ["ar", "en"],
    founder: founderPerson,
  };
}

/**
 * WebSite schema — describes the website with search action.
 * Enables Google sitelinks search box.
 */
export function getWebSiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: SITE_URL,
    description:
      "منصة رياضية شاملة: مكتبة تمارين، برامج تدريب، حاسبات لياقة، مكتبة أكلات، ومدونة رياضية.",
    inLanguage: ["ar", "en"],
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${SITE_URL}/blog?search={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

/**
 * Service schema — for the coaching page.
 * Describes the coaching service without naming specific coaches.
 */
export function getCoachingServiceSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name: "Coaching Online — مدربين وأخصائيين تغذية",
    serviceType: "Nutrition and Fitness Coaching",
    provider: {
      "@type": "Organization",
      name: SITE_NAME,
      url: SITE_URL,
    },
    areaServed: "Worldwide",
    description:
      "كوتشينج أونلاين مع مدربين وأخصائيين تغذية محترفين. خطط تغذية مخصصة، برامج تمارين متكيفة، متابعة شخصية، ومساعد ذكاء اصطناعي (EVO) متاح 24/7.",
    offers: {
      "@type": "AggregateOffer",
      priceCurrency: "USD",
      lowPrice: "20",
      highPrice: "40",
      offerCount: "2",
    },
    // Phase SEO-GEO-6.4 (§12.19 P0-5): the hardcoded aggregateRating
    // (4.8 / 500 reviews) was REMOVED — it had no visible review source,
    // which is a fabricated-signal risk on YMYL pages. Re-add ONLY with a
    // real, linkable review source (Trustpilot / app store) — §12.19 P1-7.
  };
}

/**
 * SoftwareApplication schema — for EVO AI coach.
 * Describes EVO as an AI application, not just a chatbot.
 */
export function getEVOApplicationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "EVO — AI Coach",
    applicationCategory: "Health & Fitness Application",
    operatingSystem: "Web",
    description:
      "EVO هو محرك أداء ذكي — ليس مجرد شات بوت. يقرأ بياناتك الصحية وهدفك، يبني لك خطط تغذية وتمارين مخصصة، ويقترح تبديلات ذكية، ويوفر استشارات لياقة وتغذية 24/7 عبر الذكاء الاصطناعي.",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
      description: "مجاني للجميع",
    },
    // Phase SEO-GEO-6.4 (§12.19 P0-5): hardcoded aggregateRating (4.9 /
    // 300) removed — same fabricated-signal law as the Service schema
    // above; re-enable only with a real, linkable review source.
    featureList: [
      "بناء خطط تغذية وتمارين مخصصة من بياناتك",
      "استشارات لياقة وتغذية فورية 24/7",
      "تبديل الوجبات والتمارين بذكاء",
      "تتبع تقدمك ووزنك وقياساتك",
      "متاح للزوار والمشتركين",
    ],
  };
}

/**
 * FAQPage schema — for FAQ sections.
 *
 * ⚠️ DEPRECATED (per SEO-SCHEMA-REFERENCE.md, May 2026):
 * Google retired FAQ rich results for ALL sites on May 7, 2026.
 * This schema no longer produces any SERP feature.
 * Kept for non-Google semantic value only — do NOT add new FAQPage
 * schemas expecting Google rich results.
 * For genuine user Q&A pages, use QAPage instead.
 */
export function getFAQSchema(faqs: Array<{ q: string; a: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.a,
      },
    })),
  };
}

/**
 * BreadcrumbList schema — for navigation breadcrumbs.
 */
export function getBreadcrumbSchema(
  items: Array<{ name: string; url: string }>,
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: `${SITE_URL}${item.url}`,
    })),
  };
}

/**
 * HowTo schema — for tools and exercises.
 *
 * ⚠️ DEPRECATED (per SEO-SCHEMA-REFERENCE.md, September 2023):
 * Google stopped showing how-to rich results entirely since Sept 2023.
 * This schema no longer produces any SERP feature.
 * Kept for non-Google semantic value only — do NOT add new HowTo
 * schemas expecting Google rich results.
 */
export function getHowToSchema(params: {
  name: string;
  description: string;
  steps: string[];
  tool?: string[];
  estimatedCost?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: params.name,
    description: params.description,
    step: params.steps.map((step, index) => ({
      "@type": "HowToStep",
      position: index + 1,
      text: step,
    })),
    ...(params.tool && { tool: params.tool }),
    ...(params.estimatedCost && {
      estimatedCost: {
        "@type": "MonetaryAmount",
        currency: "USD",
        value: params.estimatedCost,
      },
    }),
  };
}

/**
 * Article schema — for blog posts.
 *
 * Phase SEO-GEO-2 (2026-09-08): added `author` as a Person (was Organization
 * before — a weaker E-E-A-T signal). Added `reviewedBy` Person (Ahmed Zake)
 * to satisfy Google's Quality Rater Guidelines for YMYL-adjacent health &
 * fitness content. The author + reviewer Persons both carry `@id` URLs so
 * multiple references on the same page collapse into one Knowledge Graph
 * entity.
 *
 * The `authorProfile` parameter is optional for backward compatibility —
 * if not passed, the schema falls back to the Ahmed Zake Person (the
 * platform's canonical author). Pages should pass the resolved author
 * (from `resolveAuthor(post.author)`) so the schema matches the byline
 * shown in the UI.
 *
 * Phase SEO-GEO-4 (2026-09-08): added `lastReviewed` field — Google's QRG
 * (Sept 2025) treats this as a strong E-E-A-T signal for YMYL-adjacent
 * health/fitness content. It tells raters "a human expert reviewed this
 * article for accuracy on this date" — distinct from dateModified which
 * only signals a content edit (could be a typo fix, not a review). We
 * set lastReviewed = dateModified by default (every edit goes through
 * Ahmed Zake's review per the platform policy documented in /about).
 *
 * Callers should pass real DB dates (published_at + updated_at), NOT
 * new Date().toISOString() at request time — otherwise Google sees every
 * article as "modified just now" on every crawl, which devalues the
 * freshness signal.
 */
export function getArticleSchema(params: {
  title: string;
  description: string;
  slug: string;
  image?: string;
  datePublished: string;
  dateModified?: string;
  author?: string;
  authorProfile?: AuthorProfile;
}) {
  const profile = params.authorProfile ?? AHMED_ZAKE;
  const authorPerson = getPersonSchema(profile);
  const reviewerPerson = getPersonSchema(AHMED_ZAKE);
  const dateModified = params.dateModified || params.datePublished;
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: params.title,
    description: params.description,
    image: params.image || SITE_LOGO,
    datePublished: params.datePublished,
    dateModified: dateModified,
    // lastReviewed = dateModified (every edit is reviewed by Ahmed Zake
    // per platform policy on /about). Distinct from dateModified because
    // it signals human review, not just a content change.
    lastReviewed: dateModified,
    author: authorPerson,
    reviewedBy: reviewerPerson,
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      logo: {
        "@type": "ImageObject",
        url: SITE_LOGO,
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${SITE_URL}/blog/${params.slug}`,
    },
  };
}

/**
 * Speakable schema — for voice-search optimization (Phase SEO-GEO-4, 2026-09-08).
 *
 * Marks the sections of the page that are most relevant for voice assistants
 * (Siri, Google Assistant, Alexa) to read aloud when a user asks a question
 * the article answers. Per schema.org/SpeakableSpecification, the `cssSelector`
 * points at the headline + summary elements via their stable class names.
 *
 * We mark two elements as speakable:
 *   1. `[data-speakable="headline"]` — the article H1 (short, punchy answer)
 *   2. `[data-speakable="summary"]` — the article excerpt/subtitle (1–2 sentence
 *      elaboration that voice assistants can read in ~10 seconds)
 *
 * The BlogArticlePage component adds these `data-speakable` attributes to
 * the matching elements so the selectors resolve. Without the attributes,
 * the schema is valid JSON-LD but does nothing — voice assistants won't
 * know which content to read.
 *
 * Speakable is supported by Google Assistant, Amazon Alexa, Apple Siri,
 * and Microsoft Cortana. The schema does NOT guarantee a voice answer —
 * it only makes the content ELIGIBLE for selection.
 */
export function getSpeakableSchema(params: {
  url: string;
  headlineSelector: string;
  summarySelector: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    url: params.url,
    speakable: {
      "@type": "SpeakableSpecification",
      cssSelector: [params.headlineSelector, params.summarySelector],
    },
  };
}

/**
 * YMYL review date — Phase SEO-GEO-4.5 (2026-09-09).
 *
 * Single source for the "last reviewed for accuracy" date stamped on the
 * static YMYL detail pages (foods + exercises, EN + AR mirrors). The date
 * advances whenever a human review pass over these libraries completes —
 * it is a REVIEW date, not a content-change date, so it must not be
 * confused with `dateModified`. Platform policy (per /about, same policy
 * behind the Article schema's reviewedBy): every published piece is
 * reviewed by Ahmed Zake before it ships.
 */
export const CONTENT_LAST_REVIEWED = "2026-09-09";

/**
 * Reviewed WebPage schema — Phase SEO-GEO-4.5 (§7.1 items #6 + #7).
 *
 * The blog + comparison pages carried `reviewedBy` + `lastReviewed` since
 * Phase SEO-GEO-2, but the LARGEST health-content surfaces on the site did
 * not: the 8,830 food pages and 868 exercise pages (× 2 language mirrors ≈
 * 19.4K pages) shipped only Breadcrumb + NutritionInformation / HowTo.
 * Those are exactly the YMYL surfaces where Google's QRG raters look for
 * human-expertise signals — and where AI answer engines decide whether a
 * source is citable for health questions.
 *
 * Why a standalone WebPage node: `lastReviewed` is a property of WebPage
 * (and `reviewedBy` of CreativeWork, which WebPage extends), while
 * NutritionInformation sits under Intangible and HowTo cannot carry
 * `lastReviewed` — stamping the review on a dedicated WebPage node keeps
 * every property strictly schema.org-valid (no validator warnings) with
 * zero risk to the existing nutrition / HowTo nodes on ~19K pages.
 *
 * `reviewedBy` resolves to the shared Ahmed Zake Person (@id-stable, so it
 * collapses into the same Knowledge Graph entity already referenced by
 * Article.author / Organization.founder).
 */
export function getReviewedWebPageSchema(params: {
  url: string;
  name: string;
  lastReviewed?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    url: params.url,
    name: params.name,
    lastReviewed: params.lastReviewed ?? CONTENT_LAST_REVIEWED,
    reviewedBy: getPersonSchema(AHMED_ZAKE),
  };
}

/**
 * Exercise schema — for exercise detail pages.
 * Combines HowTo + Exercise schema.
 */
export function getExerciseSchema(params: {
  name: string;
  description: string;
  muscles: string[];
  equipment: string;
  instructions: string[];
}) {
  return {
    "@context": "https://schema.org",
    "@type": "ExerciseAction",
    name: params.name,
    description: params.description,
    exerciseType: "https://schema.org/ExerciseAction",
    equipment: params.equipment,
    muscleAction: params.muscles.join(", "),
    step: params.instructions.map((step, index) => ({
      "@type": "HowToStep",
      position: index + 1,
      text: step,
    })),
  };
}

/**
 * ItemList schema — for list pages (exercises, foods, programs).
 */
export function getItemListSchema(params: {
  name: string;
  description: string;
  items: Array<{ name: string; url: string }>;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: params.name,
    description: params.description,
    itemListElement: params.items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      url: `${SITE_URL}${item.url}`,
    })),
  };
}

/**
 * Helper: render JSON-LD as a script tag string.
 * Use in page components: <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify(schema)}} />
 */
export function renderJsonLd(schema: object) {
  return JSON.stringify(schema);
}

/**
 * SEO-GEO-4 (2026-09-08, owner directive «ابدأ (ج) ثم (أ)»): AR title
 * dedup fix.
 *
 * The `/ar` nested layout (src/app/ar/layout.tsx) declares the Next.js
 * title template `%s — Alkemos`. Several Arabic pages were feeding it
 * titles that ALREADY end with a brand suffix ("| Alkemos" / "— Alkemos"
 * / "على Alkemos"), so the live <title> rendered the brand TWICE
 * (live-verified: "…تمارين الصدر | Alkemos — Alkemos"). This helper
 * strips the trailing brand so the template appends exactly ONE
 * "— Alkemos". Mid-title brand mentions (e.g. "انضم كمدرب في Alkemos…")
 * are intentionally preserved — only the duplicated SUFFIX is removed.
 *
 * Scope: ONLY the `metadata.title` value fed to the AR template. The
 * og/twitter `title` fields bypass Next.js templates, so they keep the
 * original suffixed strings.
 */
export function stripTrailingBrandForArTemplate(title: string): string {
  return title
    .replace(/\s*\|\s*Alkemos\s*$/u, "")
    .replace(/\s*—\s*Alkemos\s*$/u, "")
    .replace(/\s+على\s+Alkemos\s*$/u, "");
}

export { SITE_URL, SITE_NAME, SITE_LOGO };
