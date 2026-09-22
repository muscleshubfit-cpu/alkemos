import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { EXERCISES } from "@/lib/exercises";
import { FOODS } from "@/lib/foods";
import { WORKOUT_PROGRAMS } from "@/lib/workout-programs";
import {
  EXERCISE_SAMPLE_SLUGS,
  FOOD_SAMPLE_SLUGS,
  PROGRAM_SAMPLE_SLUGS,
  getHomeSamples,
} from "@/lib/home-samples";

/**
 * HOME-REDESIGN-256 CANARIES — the 8-section homepage discovery order
 * (owner order 2026-09-22: audit + redesign of the Alkemos homepage on
 * a premium global fitness-platform benchmark), superseding the Phase
 * 202/203 structural pins this file used to carry.
 *
 * These guards pin the structural laws of the NEW homepage:
 *   1) NO PRICES on the homepage — the Memberships & Coaching section
 *      renders the REAL tier ladder from memberships.ts (taglines +
 *      feature lists, display strings only) but never a price, never a
 *      subscribe CTA (the /memberships + /coaching pages own pricing
 *      and the subscribe flows).
 *   2) REAL CONTENT ENTRY POINTS — the curated homepage samples must
 *      exist in the LIVE libraries (drift guard, library-counts
 *      pattern) so Training + Nutrition always render actual browsable
 *      content, never empty grids.
 *   3) THE NEW SECTION MAP — Hero («ابنِ لياقتك. بطريقتك.») → Explore
 *      (#explore: Exercises / Nutrition / Tools / Articles) → EVO
 *      (#evo — the CTA opens the FLOATING widget via
 *      openEvoFloatingChat; the widget stays the ONLY chat surface) →
 *      Training + Nutrition (#experience — ONE connected section) →
 *      Content & Knowledge (#knowledge) → Memberships & Coaching
 *      (#memberships) → FAQ (#faq) → Final CTA («ابدأ رحلتك مع
 *      Alkemos»).
 *   4) The hero + the final CTA stay ACCOUNT-DRIVEN (signup/login/
 *      console) — neither links the memberships page (the Memberships
 *      section owns that link).
 */

const LANDING = "src/components/views/LandingView.tsx";
const HEADER = "src/components/SiteHeader.tsx";
const FOOTER = "src/components/SiteFooter.tsx";

describe("HOME-REDESIGN-256 — homepage redesign canaries", () => {
  // (1) The tier ladder renders WITHOUT any pricing or subscribe CTA.
  it("the Memberships & Coaching section carries no prices, price fields, or subscribe CTAs", () => {
    const src = readFileSync(LANDING, "utf8");
    // Required: the section exists and reads the SINGLE source.
    expect(src, "the memberships section is missing").toContain('id="memberships"');
    expect(src).toContain('from "@/lib/memberships"');
    expect(src).toContain("MEMBERSHIPS.map");
    for (const banned of [
      // Tier prices (memberships.ts is the single source — never here)
      "$14.99",
      "$29.99",
      "$39.99",
      "$0",
      // The price FIELDS/price renderer never reach the homepage source
      "priceMonthly",
      "priceYearly",
      "getPriceString",
      // Subscribe/sales CTA labels
      "اشترك الآن",
      "Subscribe now",
      "قارن كل العضويات",
      "Compare all plans",
      "قارن الباقات",
      "Compare plans",
      // The retired sales closing card
      "Try the platform free",
      "جرّب المنصة مجانًا",
      // The retired "Why Alkemos" comparison table
      "Why Alkemos",
      "لماذا Alkemos",
      "comparisonRows",
    ]) {
      expect(src, `pricing/sales phrase returned: "${banned}"`).not.toContain(banned);
    }
  });

  // (2) The EVO section exists (owner order 2026-09-22) and its CTA
  //     opens the FLOATING WIDGET — the only chat surface law holds.
  it("the EVO section CTA dispatches openEvoFloatingChat and never links a chat page", () => {
    const src = readFileSync(LANDING, "utf8");
    expect(src, "the EVO section is missing").toContain('id="evo"');
    expect(src).toContain("openEvoFloatingChat");
    // The section headline pair (h2) — Arabic original + native English.
    expect(src).toContain("EVO — مدربك الذكي");
    expect(src).toContain("EVO — Your AI Coach");
    // The retired /chat route stays dead (the widget is the surface).
    expect(src).not.toContain('href="/chat"');
    expect(src).not.toContain('"/chat"');
    // The retired Phase-127 class names stay dead (the mask recipe is
    // .evo-art-mask now).
    expect(src).not.toContain("evo-hero-card");
    expect(src).not.toContain("evo-hero-art");
    // The old standalone card headline stays dead.
    expect(src).not.toContain("Your 24/7 Smart Coach");
    expect(src).not.toContain('"مدربك الذكي 24/7"');
  });

  // (3) The new section map + the real content entry points exist.
  it("the 8-section map and its browse-all links exist", () => {
    const src = readFileSync(LANDING, "utf8");
    for (const required of [
      // The section ids (explore / evo pinned by their own tests above)
      'id="explore"',
      'id="experience"',
      'id="knowledge"',
      'id="faq"',
      // The new hero H1 pair (Arabic original + native English)
      "ابنِ لياقتك. بطريقتك.",
      "Build your fitness. Your way.",
      // The final CTA pair (owner's Arabic line + native English)
      "ابدأ رحلتك مع Alkemos",
      "Start your journey with Alkemos",
      // The Explore hub links (real routes, not anchors)
      'href: "/ar/exercises"',
      'href: "/exercises"',
      'href: "/ar/foods"',
      'href: "/foods"',
      'href: "/ar/tools"',
      'href: "/tools"',
      'href: "/ar/blog"',
      'href: "/blog"',
      // Locale-aware browse-all entry points inside the experience section
      'isAr ? "/ar/exercises" : "/exercises"',
      'isAr ? "/ar/foods" : "/foods"',
      'isAr ? "/ar/programs" : "/programs"',
      // The samples prop drives the content sections (server-provided
      // real data — the bundle law holds).
      "samples.exercises",
      "samples.foods",
      "samples.programs",
    ]) {
      expect(src, `content entry point missing: ${required}`).toContain(required);
    }
  });

  // (4) The hero + final CTA stay account-driven: signup/login for
  //     guests, the member console when signed in — and NEITHER links
  //     the memberships page (the Memberships section owns that link).
  it("the hero and final CTA drive the account action, not the sales funnel", () => {
    const src = readFileSync(LANDING, "utf8");
    expect(src).toContain('"/auth?mode=signup"');
    expect(src).toContain("Create your free account");
    expect(src).toContain("أنشئ حسابك المجاني");
    expect(src).toContain('"/auth?mode=login"');
    // The retired Phase 202 usage-CTA pair stays dead (the usage paths
    // belong to the Explore cards + the connector card, never the hero).
    expect(src).not.toContain("Try the Free Tools");
    expect(src).not.toContain("جرّب الأدوات المجانية");
    // SCOPED funnel guard: the HERO region (everything before the
    // Explore section) and the PAGE TAIL (FAQ + final CTA) must never
    // link memberships — the Memberships section is the only surface
    // that does.
    const exploreAt = src.indexOf('id="explore"');
    const faqAt = src.indexOf('id="faq"');
    expect(exploreAt).toBeGreaterThan(-1);
    expect(faqAt).toBeGreaterThan(exploreAt);
    for (const region of [src.slice(0, exploreAt), src.slice(faqAt)]) {
      for (const href of ['"/memberships"', '"/ar/memberships"']) {
        expect(region, `hero/final CTA region links the memberships page: ${href}`).not.toContain(href);
      }
    }
  });
});

describe("HOME-REDESIGN-256 — header/footer contract (unchanged law)", () => {
  // (5) The header carries the five core services as VISIBLE navigation
  //     (desktop nav) with the secondary services demoted to the
  //     drawer's «More» group.
  it("the header exposes the five core services and demotes the secondary ones", () => {
    const src = readFileSync(HEADER, "utf8");
    for (const required of [
      "SERVICE_NAV",
      '"Training"',
      '"Nutrition"',
      '"Tools"',
      '"AI"',
      '"Coaching"',
      // The desktop dropdown panel (hover + focus-within).
      "group-focus-within:visible",
      // The secondary services live in the slim «More» drawer group.
      'id: "more"',
      "خدمات أخرى",
    ]) {
      expect(src, `header service nav missing: ${required}`).toContain(required);
    }
    // The old sales-first group label is gone.
    expect(src).not.toContain('"Paid Services"');
    expect(src).not.toContain("الخدمات المدفوعة");
  });

  // (6) The footer is the ecosystem service map with the owner's new
  //     tagline pair.
  it("the footer is the service-map navigation with the new tagline", () => {
    const src = readFileSync(FOOTER, "utf8");
    for (const required of [
      // Service-map column headers
      '"Training"',
      '"Nutrition"',
      '"Tools & AI"',
      '"Coaching & Services"',
      '"Company"',
      // The owner's new tagline (verbatim).
      "Built with care for the fitness community",
      "صُنع بحب لمجتمع اللياقة",
    ]) {
      expect(src, `footer service map missing: ${required}`).toContain(required);
    }
    // The old tagline and the old column labels are gone.
    expect(src).not.toContain("Arab fitness community");
    expect(src).not.toContain("مجتمع اللياقة العربي");
    expect(src).not.toContain("Paid Services");
    expect(src).not.toContain("الخدمات المدفوعة");
  });
});

describe("HOME-REDESIGN-256 — FAQ canaries", () => {
  // The six REAL questions (five carried over + the coaching one): every
  // limit in the answers matches the implementation verbatim (unified
  // pool 2/4/8/8 — memberships.ts; guest-plan device persistence —
  // plan-persistence.ts; EVO for everyone with tier-based limits;
  // coaching features — memberships.ts coaching entry; database-level
  // access control).
  it("the homepage FAQ answers the six usage questions; the retired questions stay dead", () => {
    const src = readFileSync(LANDING, "utf8");
    for (const required of [
      "Do I need an account or subscription to use the tools?",
      "Can I try AI plan generation for free?",
      "Will my plan disappear if I don't create an account?",
      "What is EVO?",
      "How does online coaching work?",
      "Is my data safe?",
    ]) {
      expect(src, `usage question missing: ${required}`).toContain(required);
    }
    // The Arabic-support question is illogical on a page the visitor is
    // already reading IN Arabic; the count question is answered by the
    // live seal chips + section copy.
    for (const banned of [
      "Does the site support Arabic?",
      "هل تدعم المنصة اللغة العربية؟",
      "How many exercises and foods are there?",
      "كم عدد التمارين والأطعمة المتاحة؟",
    ]) {
      expect(src, `retired FAQ question returned: "${banned}"`).not.toContain(banned);
    }
  });

  // The exercise-library browse paths sit ABOVE the samples: the
  // «Browse by muscle group» chips row + the clear All Exercises CTA;
  // the old quiet duplicate bottom link is retired.
  it("the muscle-group chips + All Exercises CTA precede the samples; the duplicate bottom link is retired", () => {
    const src = readFileSync(LANDING, "utf8");
    const chipsAt = src.indexOf("Browse by muscle group");
    const ctaAt = src.indexOf('"All Exercises"');
    const samplesAt = src.indexOf("samples.exercises.map");
    expect(chipsAt, "the Browse-by-muscle-group label is missing").toBeGreaterThan(-1);
    expect(ctaAt, "the All Exercises CTA label is missing").toBeGreaterThan(-1);
    expect(samplesAt, "the exercise samples grid is missing").toBeGreaterThan(-1);
    expect(chipsAt).toBeLessThan(samplesAt);
    expect(ctaAt).toBeLessThan(samplesAt);
    // The retired quiet bottom link stays dead.
    expect(src).not.toContain("Browse all exercises");
    expect(src).not.toContain("كل التمارين ›");
  });
});

describe("HOME-REDESIGN-256 — homepage sample drift guard (real content, curated)", () => {
  // The curated homepage samples must exist in the LIVE libraries —
  // if a data file renames/retires a curated entry, this fails so the
  // curation is consciously updated (library-counts pattern).
  it("every curated exercise slug exists in the live exercise library", () => {
    for (const slug of EXERCISE_SAMPLE_SLUGS) {
      const found = EXERCISES.find((e) => e.slug === slug);
      expect(found, `curated exercise missing from EXERCISES: ${slug}`).toBeTruthy();
    }
  });

  it("every curated food slug exists in the live food database", () => {
    for (const slug of FOOD_SAMPLE_SLUGS) {
      const found = FOODS.find((f) => f.slug === slug);
      expect(found, `curated food missing from FOODS: ${slug}`).toBeTruthy();
    }
  });

  it("every curated program slug exists in the live programs library", () => {
    for (const slug of PROGRAM_SAMPLE_SLUGS) {
      const found = WORKOUT_PROGRAMS.find((p) => p.slug === slug);
      expect(found, `curated program missing from WORKOUT_PROGRAMS: ${slug}`).toBeTruthy();
    }
  });

  it("getHomeSamples returns the full curated sets with real data", () => {
    const samples = getHomeSamples();
    expect(samples.exercises).toHaveLength(EXERCISE_SAMPLE_SLUGS.length);
    expect(samples.foods).toHaveLength(FOOD_SAMPLE_SLUGS.length);
    expect(samples.programs).toHaveLength(PROGRAM_SAMPLE_SLUGS.length);
    // Real data spot-checks: the chicken-breast macros are the live DB
    // values (per-100g), and every exercise sample carries an image.
    const chicken = samples.foods.find((f) => f.slug === "chicken-breast");
    expect(chicken?.calories).toBe(165);
    expect(chicken?.protein).toBe(31);
    // Batch 2 (§12.53 item 2): every exercise sample carries a SELF-HOSTED
    // WebP image (previously a raw.githubusercontent.com https URL).
    for (const ex of samples.exercises) {
      expect(ex.image.startsWith("/images/exercises/")).toBe(true);
      expect(ex.image.endsWith(".webp")).toBe(true);
    }
  });
});
