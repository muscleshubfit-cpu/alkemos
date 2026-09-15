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
 * PHASE 202 CANARIES — the homepage «Product-Website» order (owner
 * directive 2026-09-15: «أعد تصميم الـHomepage لتصبح Homepage حقيقية
 * لموقع Fitness Platform هدفه الانتشار والاستخدام، وليس البيع»).
 *
 * These guards pin the three structural laws of the redesign:
 *   1) NO PRICING SURFACES on the homepage — no membership tier cards,
 *      no price tables, no sales CTAs (the /memberships page and every
 *      business rule are untouched elsewhere).
 *   2) REAL CONTENT ENTRY POINTS — the curated homepage samples must
 *      exist in the LIVE libraries (drift guard, library-counts
 *      pattern) so the Training / Nutrition sections always render
 *      actual browsable content, never empty grids.
 *   3) THE NEW NAVIGATION CONTRACT — the header carries the five core
 *      services (Training / Nutrition / Tools / AI / Coaching), the
 *      footer is the ecosystem service map with the owner's new
 *      tagline, and EVO has no dedicated promotional section on the
 *      homepage (the floating widget is the access point).
 */

const LANDING = "src/components/views/LandingView.tsx";
const HEADER = "src/components/SiteHeader.tsx";
const FOOTER = "src/components/SiteFooter.tsx";

describe("Phase 202 — homepage adoption redesign canaries", () => {
  // (1) NO PRICING / SALES-FUNNEL SURFACES on the homepage.
  it("the homepage carries no membership pricing, tier cards, or sales CTAs", () => {
    const src = readFileSync(LANDING, "utf8");
    for (const banned of [
      // Tier prices (memberships.ts is the single source — never here)
      "$14.99",
      "$29.99",
      "$39.99",
      '$0',
      // Tier card / sales CTA markup
      'id="memberships"',
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

  // (2) The EVO promotional card is retired — the floating widget is
  //     the access point (owner order: «EVO: موجود بالفعل كـFloating
  //     Widget؛ لا تنشئ له قسمًا دعائيًا جديدًا»).
  it("EVO has no dedicated promotional section on the homepage", () => {
    const src = readFileSync(LANDING, "utf8");
    expect(src).not.toContain("evo-hero-card");
    expect(src).not.toContain("evo-hero-art");
    expect(src).not.toContain('id="evo"');
    // The old warrior-card headline is gone too.
    expect(src).not.toContain("Your 24/7 Smart Coach");
    expect(src).not.toContain("مدربك الذكي 24/7");
  });

  // (3) The real content entry points exist: the three sample sections
  //     with their browse-all links.
  it("the content entry-point sections and their browse-all links exist", () => {
    const src = readFileSync(LANDING, "utf8");
    for (const required of [
      'id="training"',
      'id="nutrition"',
      'id="articles"',
      'id="tools"',
      'id="coaching"',
      'id="faq"',
      // Locale-aware browse-all entry points
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

  // (4) The usage-first hero: the primary CTA scrolls to the free tools
  //     (no /memberships destination from the hero).
  it("the hero CTA pair points at usage (tools anchor + exercise library), not the sales funnel", () => {
    const src = readFileSync(LANDING, "utf8");
    expect(src).toContain('href="#tools"');
    expect(src).toContain("Try the Free Tools");
    expect(src).toContain("جرّب الأدوات المجانية");
    // The hero's primary button must not link the memberships page.
    expect(src).not.toContain('href={isAr ? "/ar/memberships" : "/memberships"}');
  });

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

describe("Phase 202 — homepage sample drift guard (real content, curated)", () => {
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
    for (const ex of samples.exercises) {
      expect(ex.image.startsWith("https://")).toBe(true);
    }
  });
});
