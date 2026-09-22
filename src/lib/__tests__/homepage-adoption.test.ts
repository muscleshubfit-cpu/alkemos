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
 * HOME-BLUEPRINT-257 CANARIES — the 10-section homepage progression
 * (owner-approved blueprint, 2026-09-23), superseding the
 * HOME-REDESIGN-256 8-section pins.
 *
 * The page tells ONE progression:
 *   Outcome (Hero «خطتك للياقة تبدأ من هنا.») → Explore (All-in-One:
 *   Train / Eat / Track & Plan) → Personalize (Plan «خطة تناسبك، لا خطة
 *   تناسب الجميع.») → Train («تدرّب بثقة.» 868+) → Eat («اعرف ما تأكل.
 *   خطط لما تحتاجه.» 8,830+) → EVO («مدربك الذكي، عندما تحتاجه.») →
 *   Learn («تعلّم. طبّق. تقدّم.») → Memberships + Online Coaching
 *   («خذ خطوتك التالية.») → FAQ → Final CTA («ابدأ اليوم. وابنِ
 *   روتينًا يناسبك.»).
 *
 * Guards pin:
 *   1) NO PRICES on the homepage — the Memberships + Coaching section
 *      presents TWO paths (real tier NAME chips from memberships.ts +
 *      the real coaching promise) but never a price, never a tier
 *      grid, never a subscribe CTA (the /memberships + /coaching pages
 *      own pricing and the subscribe flows).
 *   2) REAL CONTENT ENTRY POINTS — the curated homepage samples must
 *      exist in the LIVE libraries (drift guard, library-counts
 *      pattern) so Train + Eat always render actual browsable content.
 *   3) THE EVO CHAT SURFACE LAW — the section CTA opens the FLOATING
 *      widget via openEvoFloatingChat; the widget stays the ONLY chat
 *      surface; the /chat route stays dead.
 *   4) The hero + the final CTA stay ACCOUNT-DRIVEN (signup/login/
 *      console) — neither links the memberships page (the Memberships
 *      section owns that link).
 *   5) Arabic is the owner's anchor lines; English is independent
 *      native copy — both pinned verbatim.
 */

const LANDING = "src/components/views/LandingView.tsx";
const HEADER = "src/components/SiteHeader.tsx";
const FOOTER = "src/components/SiteFooter.tsx";

describe("HOME-BLUEPRINT-257 — homepage redesign canaries", () => {
  // (1) The Memberships + Coaching section presents TWO PATHS without
  //     any pricing, tier grid, or subscribe CTA.
  it("the Memberships + Coaching section carries no prices, tier grid, or subscribe CTAs", () => {
    const src = readFileSync(LANDING, "utf8");
    // Required: the section exists and reads the SINGLE source (real
    // tier names as chips — the only membership data on this page).
    expect(src, "the memberships section is missing").toContain('id="memberships"');
    expect(src).toContain('from "@/lib/memberships"');
    expect(src).toContain("MEMBERSHIPS.filter");
    for (const banned of [
      // The retired tier GRID renderer
      "MEMBERSHIPS.map",
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

  // (2) The EVO section exists and its CTA opens the FLOATING WIDGET —
  //     the only chat surface law holds. EVO is positioned as the
  //     intelligent layer (no numbered feature-card rows).
  it("the EVO section CTA dispatches openEvoFloatingChat and never links a chat page", () => {
    const src = readFileSync(LANDING, "utf8");
    expect(src, "the EVO section is missing").toContain('id="evo"');
    expect(src).toContain("openEvoFloatingChat");
    // The owner's Arabic anchor line + its native English counterpart.
    expect(src).toContain("مدربك الذكي، عندما تحتاجه.");
    expect(src).toContain("Your smart coach, when you need one.");
    // The blueprint CTA pair.
    expect(src).toContain("جرّب EVO");
    expect(src).toContain("Try EVO");
    // The retired /chat route stays dead (the widget is the surface).
    expect(src).not.toContain('href="/chat"');
    expect(src).not.toContain('"/chat"');
    // The retired Phase-127 class names stay dead (the mask recipe is
    // .evo-art-mask now).
    expect(src).not.toContain("evo-hero-card");
    expect(src).not.toContain("evo-hero-art");
    // The retired headline + numbered feature-card rows stay dead.
    expect(src).not.toContain("EVO — مدربك الذكي");
    expect(src).not.toContain("EVO — Your AI Coach");
    expect(src).not.toContain("Your 24/7 Smart Coach");
    expect(src).not.toContain('"مدربك الذكي 24/7"');
    expect(src).not.toContain("Answers sized to your data");
  });

  // (3) The 10-section map + the real content entry points exist.
  it("the 10-section map and its browse-all links exist", () => {
    const src = readFileSync(LANDING, "utf8");
    for (const required of [
      // The section ids, in blueprint order
      'id="paths"',
      'id="plan"',
      'id="train"',
      'id="eat"',
      'id="evo"',
      'id="learn"',
      'id="memberships"',
      'id="faq"',
      // The hero pair (owner's Arabic + native English)
      "خطتك للياقة تبدأ من هنا.",
      "Your fitness plan starts here.",
      // The hero supporting pair
      "تدريب، تغذية، وأدوات ذكية تساعدك على اتخاذ قرارات أفضل والتقدم نحو هدفك.",
      "Training, nutrition, and smart tools that help you make better decisions and keep moving toward your goal.",
      // The hero CTA pair + secondary explore CTA
      "ابدأ مجانًا",
      "Start free",
      "استكشف التمارين",
      "Explore exercises",
      // The All-in-One path trio (Train / Eat / Track & Plan)
      "منصة واحدة، ثلاثة مسارات.",
      "One platform, three paths.",
      'href: "/ar/exercises"',
      'href: "/exercises"',
      'href: "/ar/foods"',
      'href: "/foods"',
      'href: "/ar/tools"',
      'href: "/tools"',
      // The Personalized Plan section (owner line + planner CTAs)
      "خطة تناسبك، لا خطة تناسب الجميع.",
      "A plan built for you, not for everyone.",
      'href={isAr ? "/ar/ai-meal-planner" : "/ai-meal-planner"}',
      'href={isAr ? "/ar/ai-workout-planner" : "/ai-workout-planner"}',
      // The Train section (owner line + real count + section CTA)
      "تدرّب بثقة.",
      "Train with confidence.",
      "استكشف مكتبة التمارين",
      "Explore the exercise library",
      // The Eat section (owner line + real count + section CTA)
      "اعرف ما تأكل. خطط لما تحتاجه.",
      "Know what you eat. Plan what you need.",
      "استكشف قاعدة الأطعمة",
      "Explore the food database",
      // The Learn section (owner line + CTA)
      "تعلّم. طبّق. تقدّم.",
      "Learn. Apply. Progress.",
      "استكشف المحتوى",
      "Explore the articles",
      // The Memberships + Coaching two-path section (owner line)
      "خذ خطوتك التالية.",
      "Take your next step.",
      'href={isAr ? "/ar/memberships" : "/memberships"}',
      'href={isAr ? "/ar/coaching" : "/coaching"}',
      // The Final CTA pair (owner's Arabic line + native English)
      "ابدأ اليوم. وابنِ روتينًا يناسبك.",
      "Start today. Build a routine that fits you.",
      // Locale-aware browse-all entry points inside Train/Eat
      'href={isAr ? "/ar/exercises" : "/exercises"}',
      'href={isAr ? "/ar/foods" : "/foods"}',
      // The samples prop drives the content sections (server-provided
      // real data — the bundle law holds).
      "samples.exercises",
      "samples.foods",
      "samples.programs",
    ]) {
      expect(src, `content entry point missing: ${required}`).toContain(required);
    }
  });

  // (4) The hero + final CTA drive the account action, not the sales
  //     funnel: signup/login for guests, the member console when signed
  //     in — and NEITHER links the memberships page (the Memberships
  //     section is the only surface that does).
  it("the hero and final CTA drive the account action, not the sales funnel", () => {
    const src = readFileSync(LANDING, "utf8");
    expect(src).toContain('"/auth?mode=signup"');
    expect(src).toContain('"/auth?mode=login"');
    // The retired Phase 202/256 usage-CTA labels stay dead (the usage
    // paths belong to the path cards + section CTAs, never the hero).
    expect(src).not.toContain("Try the Free Tools");
    expect(src).not.toContain("جرّب الأدوات المجانية");
    expect(src).not.toContain("Create your free account");
    expect(src).not.toContain("أنشئ حسابك المجاني");
    // SCOPED funnel guard: the HERO region (everything before the
    // paths section) and the PAGE TAIL (FAQ + final CTA) must never
    // link memberships — the Memberships section is the only surface
    // that does.
    const pathsAt = src.indexOf('id="paths"');
    const faqAt = src.indexOf('id="faq"');
    expect(pathsAt).toBeGreaterThan(-1);
    expect(faqAt).toBeGreaterThan(pathsAt);
    for (const region of [src.slice(0, pathsAt), src.slice(faqAt)]) {
      for (const href of ['"/memberships"', '"/ar/memberships"']) {
        expect(region, `hero/final CTA region links the memberships page: ${href}`).not.toContain(href);
      }
    }
  });

  // (5) The blueprint ORDER: Train precedes Eat precedes EVO precedes
  //     Learn precedes Memberships — the progression is the product.
  it("the sections render in the blueprint order (Outcome→Explore→Personalize→Train→Eat→EVO→Learn→Memberships→FAQ)", () => {
    const src = readFileSync(LANDING, "utf8");
    const order = [
      'id="paths"',
      'id="plan"',
      'id="train"',
      'id="eat"',
      'id="evo"',
      'id="learn"',
      'id="memberships"',
      'id="faq"',
    ].map((needle) => src.indexOf(needle));
    for (let i = 1; i < order.length; i++) {
      expect(order[i], `section ${i} out of blueprint order`).toBeGreaterThan(order[i - 1]);
    }
  });
});

describe("HOME-BLUEPRINT-257 — header/footer contract (unchanged law)", () => {
  // (6) The header carries the five core services as VISIBLE navigation
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

  // (7) The footer is the ecosystem service map with the owner's new
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

describe("HOME-BLUEPRINT-257 — FAQ canaries", () => {
  // The FIVE owner-specified questions (Arabic anchors + independent
  // English). Every claim mirrors the implementation; the retired
  // HOME-REDESIGN-256 question set stays dead.
  it("the homepage FAQ answers the five blueprint questions; the retired set stays dead", () => {
    const src = readFileSync(LANDING, "utf8");
    for (const required of [
      "هل يمكنني استخدام Alkemos مجانًا؟",
      "Can I use Alkemos for free?",
      "كيف يعمل EVO؟",
      "How does EVO work?",
      "هل أحتاج إلى اشتراك؟",
      "Do I need a subscription?",
      "هل يناسبني Alkemos إذا كنت مبتدئًا؟",
      "Does Alkemos suit beginners?",
      "ما الفرق بين العضوية والتدريب الأونلاين؟",
      "What's the difference between a membership and online coaching?",
    ]) {
      expect(src, `blueprint FAQ question missing: ${required}`).toContain(required);
    }
    // The retired question sets stay dead (256 usage set + older
    // illogical ones).
    for (const banned of [
      "Do I need an account or subscription to use the tools?",
      "Can I try AI plan generation for free?",
      "Will my plan disappear if I don't create an account?",
      "How does online coaching work?",
      "Is my data safe?",
      "Does the site support Arabic?",
      "هل تدعم المنصة اللغة العربية؟",
      "How many exercises and foods are there?",
      "كم عدد التمارين والأطعمة المتاحة؟",
    ]) {
      expect(src, `retired FAQ question returned: "${banned}"`).not.toContain(banned);
    }
  });

  // The Train section keeps the browse-paths-first law: the muscle-group
  // chips row precedes the samples; the old duplicate CTA labels stay
  // retired.
  it("the muscle-group chips precede the samples; the retired CTA labels stay dead", () => {
    const src = readFileSync(LANDING, "utf8");
    const chipsAt = src.indexOf("Browse by muscle group");
    const ctaAt = src.indexOf("استكشف مكتبة التمارين");
    const samplesAt = src.indexOf("samples.exercises.map");
    expect(chipsAt, "the Browse-by-muscle-group label is missing").toBeGreaterThan(-1);
    expect(ctaAt, "the Train section CTA label is missing").toBeGreaterThan(-1);
    expect(samplesAt, "the exercise samples grid is missing").toBeGreaterThan(-1);
    expect(chipsAt).toBeLessThan(samplesAt);
    // The retired quiet/duplicate bottom links stay dead.
    expect(src).not.toContain("Browse all exercises");
    expect(src).not.toContain("كل التمارين ›");
    expect(src).not.toContain("Browse all foods ›");
    expect(src).not.toContain("تصفّح كل الأطعمة ›");
    expect(src).not.toContain("All Exercises");
  });
});

describe("HOME-BLUEPRINT-257 — homepage sample drift guard (real content, curated)", () => {
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
