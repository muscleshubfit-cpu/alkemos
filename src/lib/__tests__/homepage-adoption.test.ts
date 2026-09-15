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
    // The old warrior-card headline is gone too. (2026-09-16 owner copy
    // order: the new hero subtitle legitimately contains «مدربك الذكي
    // 24/7» INSIDE its platform-summary sentence, so the guard pins the
    // STANDALONE card headline — the quoted literal form — instead of
    // the bare phrase.)
    expect(src).not.toContain("Your 24/7 Smart Coach");
    expect(src).not.toContain('"مدربك الذكي 24/7"');
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

  // (4) The account-action hero (Phase 203 copy refinement, owner-
  //     approved 2026-09-15): guests get the signup primary + login
  //     secondary (the usage path is owned by the quick-nav chip + the
  //     tools lead card — no duplicated CTA message), signed-in members
  //     get their own console. The hero still never links the sales
  //     funnel.
  it("the hero CTA pair drives the account action (signup/login), not a duplicated usage CTA or the sales funnel", () => {
    const src = readFileSync(LANDING, "utf8");
    expect(src).toContain('"/auth?mode=signup"');
    expect(src).toContain("Create your free account");
    expect(src).toContain("أنشئ حسابك المجاني");
    expect(src).toContain('"/auth?mode=login"');
    // The retired Phase 202 usage-CTA pair stays dead (the usage paths
    // belong to the quick-nav chip + the tools section, never the hero).
    expect(src).not.toContain("Try the Free Tools");
    expect(src).not.toContain("جرّب الأدوات المجانية");
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

describe("Phase 203 — homepage copy refinement canaries", () => {
  // The five REAL usage questions (owner-approved FAQ reselection): every
  // limit in the answers matches the implementation verbatim (unified
  // pool 2/4/8/8 — memberships.ts; guest-plan device persistence —
  // plan-persistence.ts; EVO for everyone with tier-based limits;
  // database-level access control).
  it("the homepage FAQ answers the five usage questions; the retired questions stay dead", () => {
    const src = readFileSync(LANDING, "utf8");
    for (const required of [
      "Do I need an account or subscription to use the tools?",
      "Can I try AI plan generation for free?",
      "Will my plan disappear if I don't create an account?",
      "What is EVO?",
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
    // Batch 2 (§12.53 item 2): every exercise sample carries a SELF-HOSTED
    // WebP image (previously a raw.githubusercontent.com https URL).
    for (const ex of samples.exercises) {
      expect(ex.image.startsWith("/images/exercises/")).toBe(true);
      expect(ex.image.endsWith(".webp")).toBe(true);
    }
  });
});
