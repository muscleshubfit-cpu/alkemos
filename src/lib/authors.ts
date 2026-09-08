/**
 * Author / Reviewer registry — E-E-A-T foundation (Phase SEO-GEO-2, 2026-09-08).
 *
 * Central definition of every human author and reviewer whose name appears
 * in the Alkemos structured-data layer. Pulling this out of the per-page
 * `seo.ts` schema builders keeps the credentials / jobTitle / url in ONE
 * place — update once, every Article + Organization schema picks it up.
 *
 * Why this matters:
 *   - Google's September 2025 QRG update formalized that raters assess
 *     AI-generated content for genuine E-E-A-T signals. Author + reviewer
 *     bylines + Person schema are the strongest machine-readable signal
 *     that "real human expertise is behind this content."
 *   - The Article schema `author` and `reviewedBy` properties accept a
 *     Person (or Person @id reference). Without this file, every blog
 *     post schema only carried `Organization` as its author — which is
 *     legal JSON-LD but a known weak E-E-A-T signal.
 *
 * Adding a new author:
 *   1. Append to AUTHORS with slug + bilingual bio + credentials
 *   2. Reference the slug from any content's `author` field
 *   3. The schema builder (getArticleSchema) resolves it automatically
 *
 * The owner (Ahmed Zake) is the canonical author of all platform content
 * until additional coaches are added.
 *
 * NOTE: This module is intentionally NOT marked `server-only`. It only
 * contains public author metadata (name, bio, credentials, profile URLs)
 * that is safe to ship to the browser. The client-safe `seo.ts` imports
 * from here, and `seo.ts` is itself imported by client components
 * (LandingView, etc.), so `authors.ts` must be browser-safe too. Any
 * sensitive author data (private contact info, internal notes) should
 * live in a separate server-only module.
 */

export type AuthorRole = "author" | "reviewer" | "editor";

export type AuthorProfile = {
  /** URL-safe slug — also used as the Person @id fragment */
  slug: string;
  /** Display name in English */
  nameEn: string;
  /** Display name in Arabic */
  nameAr: string;
  /** Job title in English (for schema jobTitle + UI byline) */
  jobTitleEn: string;
  /** Job title in Arabic */
  jobTitleAr: string;
  /** Short bio in English (~80 words) for the author card */
  bioEn: string;
  /** Short bio in Arabic (~80 words) for the author card */
  bioAr: string;
  /** List of credentials / certifications (bilingual pair per entry) */
  credentials: Array<{ en: string; ar: string }>;
  /** Same-as links — ONLY verifiable profiles (per E-E-A-T framework) */
  sameAs: string[];
  /** Avatar URL (absolute) — falls back to logo if empty */
  avatarUrl?: string;
  /** Public profile URL on this site (absolute) */
  profileUrl: string;
};

// ============================================================================
// Ahmed Zake — Founder, head author, head reviewer
// ============================================================================

export const AHMED_ZAKE: AuthorProfile = {
  slug: "ahmed-zake",
  nameEn: "Ahmed Zake",
  nameAr: "أحمد زكي",
  jobTitleEn: "Founder & Head Coach, Alkemos",
  jobTitleAr: "المؤسس والمدرب الرئيسي، Alkemos",
  bioEn:
    "Ahmed Zake is the founder of Alkemos and a certified fitness and nutrition coach with over a decade of practical experience training clients online and in person. He built Alkemos to combine the precision of AI-driven plan generation with the accountability of human coaching — closing the gap between generic fitness apps and expensive 1-on-1 trainers. Ahmed oversees every piece of content published on the platform, from the 868-exercise library to the automated blog pipeline, and reviews each article for accuracy before publication.",
  bioAr:
    "أحمد زكي مؤسس Alkemos ومدرب لياقة وتغذية معتمد بخبرة عملية تتجاوز العشر سنوات في تدريب العملاء أونلاين وحضوريًا. بنى Alkemos ليجمع بين دقة توليد الخطط بالذكاء الاصطناعي ومساءلة التدريب البشري — ليسدّ الفجوة بين تطبيقات اللياقة العامة والمدربين الشخصيين المكلفين. يشرف أحمد على كل محتوى يُنشر على المنصة، من مكتبة الـ868 تمرينًا إلى خط المدوّنة الآلي، ويراجع كل مقال للدقّة قبل النشر.",
  credentials: [
    { en: "Certified Personal Trainer (CPT)", ar: "مدرب شخصي معتمد (CPT)" },
    { en: "Nutrition Coach certification", ar: "شهادة مدرب تغذية" },
    { en: "10+ years coaching experience", ar: "أكثر من 10 سنوات خبرة تدريب" },
    { en: "Founder of Alkemos (2026)", ar: "مؤسس Alkemos (2026)" },
  ],
  sameAs: [
    // NOTE (per E-E-A-T framework §Authoritativeness): only include URLs
    // of profiles that ACTUALLY exist and are publicly verifiable. This is
    // the PERSON's own profile list — Ahmed Zake has no verifiable personal
    // profiles yet, so it stays empty. The BRAND's social profiles (created
    // 2026-09-09) live in Organization.sameAs via src/lib/social.ts — do
    // not duplicate them here (Person.sameAs = person, Organization.sameAs
    // = brand; mixing them blurs the entity graph).
    // Adding fake `sameAs` URLs is a Trust signal killer, not a booster.
  ],
  avatarUrl: "https://alkemos.com/images/coach-portrait.jpg",
  profileUrl: "https://alkemos.com/authors/ahmed-zake",
};

// ============================================================================
// Registry — every author the platform knows about
// ============================================================================

export const AUTHORS: AuthorProfile[] = [AHMED_ZAKE];

/** Resolve an author by slug → AuthorProfile. Throws on unknown slug. */
export function getAuthorBySlug(slug: string): AuthorProfile | null {
  return AUTHORS.find((a) => a.slug === slug) ?? null;
}

/**
 * Resolve an author from a free-text `author` string (as stored in the
 * `blog_posts.author` column). The DB historically stored 'MuscleHub',
 * 'Alkemos', or 'Ahmed Zake' — we normalize all of those to the canonical
 * Ahmed Zake Person, since he is the de-facto author of every post on
 * the platform today.
 *
 * When additional coaches are onboarded, expand the matching map below
 * or store author_slug directly on blog_posts and prefer that column.
 */
export function resolveAuthor(dbAuthor: string | null | undefined): AuthorProfile {
  if (!dbAuthor) return AHMED_ZAKE;
  const normalized = dbAuthor.trim().toLowerCase();
  // Historical aliases — all point to Ahmed Zake (the founder) until the
  // platform adds a second human author.
  if (
    normalized === "ahmed zake" ||
    normalized === "alkemos" ||
    normalized === "musclehub" ||
    normalized === "musclehubeg"
  ) {
    return AHMED_ZAKE;
  }
  // Try a direct slug match (case-insensitive)
  const direct = AUTHORS.find(
    (a) => a.slug.toLowerCase() === normalized.replace(/\s+/g, "-"),
  );
  return direct ?? AHMED_ZAKE;
}

// ============================================================================
// Schema builders — return JSON-LD Person objects
// ============================================================================

/**
 * Build a schema.org Person JSON-LD object for an author.
 *
 * Used as the `author` field in Article schema, the `reviewedBy` field,
 * and the `founder` field in Organization schema.
 *
 * The `@id` is a stable URL so multiple references to the same person
 * across the page (e.g. as author AND reviewer) collapse into one
 * entity in Google's Knowledge Graph.
 */
export function getPersonSchema(author: AuthorProfile) {
  const person: Record<string, unknown> = {
    "@type": "Person",
    "@id": author.profileUrl,
    name: author.nameEn,
    alternateName: author.nameAr,
    jobTitle: author.jobTitleEn,
    description: author.bioEn,
    url: author.profileUrl,
    image: author.avatarUrl,
    worksFor: {
      "@type": "Organization",
      name: "Alkemos",
      url: "https://alkemos.com",
    },
    knowsAbout: [
      "Fitness coaching",
      "Nutrition coaching",
      "Strength training",
      "Hypertrophy training",
      "Fat loss",
      "Macronutrient planning",
      "Workout programming",
    ],
  };

  // Only add sameAs if we have real, verifiable profile URLs (E-E-A-T
  // framework warning: empty sameAs is better than fake sameAs).
  if (author.sameAs.length > 0) {
    person.sameAs = author.sameAs;
  }

  // Credentials → hasCredential (Schema.org property, recognized by Google)
  if (author.credentials.length > 0) {
    person.hasCredential = author.credentials.map((c) => c.en);
  }

  return person;
}

/**
 * Build a ProfilePage JSON-LD object for an author's profile page.
 * Used on /authors/[slug] to mark the page as an entity-about-a-Person.
 */
export function getProfilePageSchema(author: AuthorProfile) {
  return {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    mainEntity: getPersonSchema(author),
    name: `${author.nameEn} — Author at Alkemos`,
    url: author.profileUrl,
    description: author.bioEn,
  };
}
