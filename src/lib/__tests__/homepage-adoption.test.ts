import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { EXERCISES } from "@/lib/exercises";
import { FOODS } from "@/lib/foods";
import { WORKOUT_PROGRAMS } from "@/lib/workout-programs";
import { DIET_SYSTEMS } from "@/lib/diet-plan-matrix";
import {
  EXERCISE_SAMPLE_SLUGS,
  FOOD_SAMPLE_SLUGS,
  PROGRAM_SAMPLE_SLUGS,
  getHomeSamples,
} from "@/lib/home-samples";

/**
 * HOME-PLATFORM-284 CANARIES (owner order 2026-09-27 — «الصفحة
 * الرئيسية كواجهة منصة حقيقية وليست صفحة هبوط») — the homepage is a
 * true PLATFORM homepage: concise SECTIONS with CARDS that link to
 * the real pages, mirroring the header's service nav.
 *
 * THE PLATFORM ARC:
 *   Promise (Hero, TWO CTAs: auth + memberships) → Proof (ONE compact
 *   row) → #library (TRAINING — the muscle-group browser preview, SIX
 *   real exercises per family) → #train (PROGRAMS — the ready-made
 *   carousel) → #eat (NUTRITION — three clearly-differentiated
 *   cards: the food database · the MANUAL Meal Planner · the
 *   READY-MADE diet-plan library) → #diet (the diet-systems carousel)
 *   → #tools (TOOLS — ONE card linking to the /tools hub, NOT the
 *   embedded calculators) → #plan (AI PLANNING — the AI Workout
 *   Planner + the AI Meal Planner cards, both explicitly AI-powered,
 *   the meal card promising a STRUCTURED full-day plan with grams —
 *   plus EVO, the AI coach with the chat-surface law) → #learn
 *   (أحدث المقالات, latest-first) → #memberships (small cards +
 *   coaching band) → featured coaches → #faq → footer (flat,
 *   fully displayed — 18 primary links).
 *
 * Guards pin:
 *   1) SINGLE-SOURCE PRICING — unchanged law: prices derive from
 *      memberships.ts lookups (never literals, never a tier grid) and
 *      the refund line states the REAL 7-day policy.
 *   2) NO EMBEDDED TOOLS — the calculator/builders/food-explorer are
 *      GONE from the view: no fitness-math import, no planner-option
 *      imports, no demo endpoints, no guest-plan persistence. The
 *      homepage NAVIGATES; the tool pages DO.
 *   3) THE TOOLS SECTION IS A CARD — one wide card → /tools; its
 *      chips derive from the tools-shared single source (the three
 *      planners filtered OUT — they own their sections).
 *   4) AI PLANNING IS DISTINCT — #plan carries the three AI surfaces
 *      (AI Workout Planner · AI Meal Planner · EVO), every card
 *      explicitly AI-powered, the meal card promising quantities in
 *      grams (not mere suggestions), and NO human-coaching service
 *      reference inside the region.
 *   5) THE NUTRITION TRIO IS DIFFERENTIATED — the manual Meal Planner
 *      («ابنِها بنفسك»), the AI Meal Planner (AI section), and the
 *      ready-made diet plans («جاهزة للتصفح») each state their
 *      approach; the AI cross-reference is explicit.
 *   6) The curated samples exist in the LIVE libraries (drift guard)
 *      — 42 exercises (six per muscle family), 8 foods, 3 programs,
 *      4 diet systems.
 *   7) The hero drives the account action + the memberships page (the
 *      owner's two-button directive); the retired embedded-surface
 *      strings stay dead.
 *   8) Arabic is the native anchor; English is independent native copy
 *      — both pinned verbatim.
 */

const LANDING = "src/components/views/LandingView.tsx";
const HEADER = "src/components/SiteHeader.tsx";
const FOOTER = "src/components/SiteFooter.tsx";
// SITE-CONTENT-281 re-pin: the default marketing copy moved from inline
// LandingView literals to its single source — src/lib/site-content/home.ts
// (Supabase overrides sit ON TOP of these defaults at render time). The
// canaries below read BOTH surfaces: structure pins stay on the view,
// copy pins follow the copy to its new single source. «both» = the
// concatenated pair, so banned retired strings are banned in EITHER file.
const COPY_HOME = "src/lib/site-content/home.ts";
const readBoth = () =>
  readFileSync(LANDING, "utf8") + "\n" + readFileSync(COPY_HOME, "utf8");

describe("HOME-PLATFORM-284 — the platform homepage canaries", () => {
  // (1) The memberships section derives every price from the SINGLE
  //     source (memberships.ts) — no price literals, no tier grid, no
  //     subscribe-now sales CTA. The refund line states the REAL policy.
  it("the memberships section derives every price from memberships.ts and states the refund policy", () => {
    const src = readFileSync(LANDING, "utf8");
    // Required: the section exists and reads the SINGLE source via
    // lookups (tier names + prices derive — the page can never drift
    // from /memberships).
    expect(src, "the memberships section is missing").toContain('id="memberships"');
    expect(src).toContain('from "@/lib/memberships"');
    expect(src).toContain("MEMBERSHIPS.find");
    // Price derivation pins (no literals anywhere).
    expect(src).toContain("premiumPriceLabel");
    expect(src).toContain("proPriceLabel");
    expect(src).toContain("coachingPriceLabel");
    expect(src).toContain("freePriceLabel");
    for (const banned of [
      // Price literals (memberships.ts is the single source — never here)
      "$14.99",
      "$29.99",
      "$39.99",
      "$0",
      // The full tier-grid renderer (the homepage shows SMALL cards,
      // not the pricing table — /memberships owns that)
      "MEMBERSHIPS.map",
      "getPriceString",
      // Subscribe/sales CTA labels
      "اشترك الآن",
      "Subscribe now",
      "قارن كل العضويات",
      "Compare all plans",
      "قارن الباقات",
      "Compare plans",
    ]) {
      expect(src, `pricing/sales phrase returned: "${banned}"`).not.toContain(banned);
    }
    // The refund line — the honest 7-day conditional refund (refund.ts).
    expect(src).toContain("7-day refund");
    expect(src).toContain("الاسترداد خلال 7 أيام");
  });

  // (2) THE HERO — the owner's two-button directive: login/signup +
  //     the premium-memberships page, side by side (stacked on touch).
  //     HOME-PLATFORM-284: the subtitle no longer promises «try it
  //     right on this page» — the tools live on their own pages now.
  it("the hero carries exactly the two CTAs and the platform subtitle", () => {
    const src = readFileSync(LANDING, "utf8");
    const copy = readFileSync(COPY_HOME, "utf8");
    // The primary account action (signup; the auth page carries the
    // login toggle — one button covers both actions).
    expect(src).toContain('"/auth?mode=signup"');
    // The two-button pair + label pins (the functional auth CTA labels
    // stay in the view — only the marketing copy is registry-backed).
    expect(src).toContain("تسجيل الدخول / حساب جديد");
    expect(src).toContain("Log in / Sign up");
    expect(src).toContain("العضويات المميزة");
    expect(src).toContain("Premium memberships");
    // BOTH hero CTAs keep the VRD-V3 stacking classes (full-width on
    // touch, auto on md+).
    expect(src).toContain('className="btn-chrome w-full px-7 py-3 text-sm md:w-auto md:px-8 md:py-3 md:text-base"');
    expect(src).toContain('className="btn-outline w-full px-6 py-2.5 text-sm font-medium md:w-auto md:py-2.5 md:text-base"');
    // The retired hero extras stay dead: the #start secondary CTA and
    // the quiet standalone login link.
    expect(src).not.toContain('href="#start"');
    expect(src).not.toContain("/auth?mode=login");
    // The hero H1 + subtitle pairs (native anchors — pinned to the
    // site-content single source, SITE-CONTENT-281 / 284).
    expect(copy).toContain("تدرّب بذكاء. وتغذَّ بدقة.");
    expect(copy).toContain("Train smarter. Eat with precision.");
    // 284: the subtitle now frames the PLATFORM (no in-page trial
    // promise) and keeps the Arabic-and-English fact.
    expect(copy).toContain("بالعربية والإنجليزية.");
    expect(copy).toContain("in Arabic and English.");
    // The retired in-page-trial promise stays dead in EITHER file.
    expect(readBoth()).not.toContain("جرّبها الآن في هذه الصفحة");
    expect(readBoth()).not.toContain("Try it right on this page");
  });

  // (3) THE PROOF STRIP — one compact row: the four auditable
  //     numbers, small type, numbers + labels inline, count-up alive.
  it("the proof strip is one compact row of auditable numbers (count-up preserved)", () => {
    const src = readFileSync(LANDING, "utf8");
    expect(src).toContain('aria-label={isAr ? "المنصة بالأرقام" : "The platform in numbers"}');
    expect(src).toContain("proofStats");
    expect(src).toContain("<CountUp");
    // The dynamic count constants (library-counts law).
    expect(src).toContain("EX_PLUS");
    expect(src).toContain("FOODS_PLUS");
    expect(src).toContain("TOOLS_COUNT");
    // The SSR-honest fallback (no-JS users see the truth).
    expect(src).toContain("const shown = display ?? value;");
    // The compact one-row classes (numbers + labels inline).
    expect(src).toContain("flex max-w-5xl flex-wrap items-baseline justify-center gap-x-6 gap-y-1.5 md:gap-x-10");
    // The retired BIG-stat markup stays dead (no icon-tile stat grid).
    expect(src).not.toContain("grid max-w-5xl grid-cols-2 gap-y-8 md:grid-cols-4");
  });

  // (4) NO EMBEDDED TOOLS — the 284 core law: the homepage NAVIGATES to
  //     the tool pages; the calculator math, the planner vocabulary,
  //     the demo endpoints, and the guest-plan persistence all live on
  //     the tool pages, never in the view.
  it("no embedded tool runs on the homepage — it only links to the tool pages", () => {
    const src = readFileSync(LANDING, "utf8");
    for (const banned of [
      // The retired embedded components.
      "function HomeCalculator",
      "function WorkoutPlanBuilder",
      "function MealPlanBuilder",
      "function FoodExplorer",
      "function EvoConversation",
      // The calculator math source (the tool page owns it).
      'from "@/lib/fitness-math"',
      "calculateCalorieTargets",
      "isValidCalculatorInput",
      // The planner vocabulary (the tool pages own it).
      'from "@/lib/ai-workout-planner"',
      "workoutGoalOptions",
      "workoutLevelOptions",
      "workoutEquipmentOptions",
      // The in-page generation endpoints (the tool pages own them).
      '"/api/ai/workout-plan-demo"',
      '"/api/ai/meal-plan-demo"',
      // The homepage-side guest-plan persistence (retired with the
      // builders — nothing is generated on the homepage anymore).
      "ensureGuestId",
      "saveGuestPlan",
      // The retired section ids.
      'id="start"',
      'id="evo"',
    ]) {
      expect(src, `an embedded tool surface returned: "${banned}"`).not.toContain(banned);
    }
    // The forked-formula ban (the Mifflin constants must never appear
    // in the view — they live in fitness-math.ts).
    for (const banned of ["10 * w", "6.25 *", "10 * weightKg", "6.25 * heightCm", "- 5 * age"]) {
      expect(src, `the view forked the calculator math: "${banned}"`).not.toContain(banned);
    }
  });

  // (5) THE TOOLS SECTION — ONE card linking to the /tools hub (the
  //     owner's explicit directive: NOT the actual calculators). The
  //     chips derive from the tools-shared single source; the three
  //     planners are filtered out (they own their sections).
  it("the tools section is one card to the /tools hub with derived chips", () => {
    const src = readFileSync(LANDING, "utf8");
    const copy = readFileSync(COPY_HOME, "utf8");
    expect(src, "the #tools section is missing").toContain('id="tools"');
    // ONE wide card → the tools hub (locale-aware).
    expect(src).toContain('href={isAr ? "/ar/tools" : "/tools"}');
    // The chips derive from the single source (never literals).
    expect(src).toContain('import { TOOLS, TOOLS_COUNT } from "@/lib/tools-shared"');
    expect(src).toContain("TOOLS.filter((t) => !t.slug.startsWith(\"/\")).map((t) =>");
    // The section copy follows the registry (SITE-CONTENT-281).
    expect(copy).toContain("اعرف أرقامك قبل أي خطوة.");
    expect(copy).toContain("Know your numbers before anything else.");
    // The retired calculator-section framing stays dead.
    expect(readBoth()).not.toContain("THE CALORIE & MACRO CALCULATOR");
    expect(readBoth()).not.toContain("حاسبة السعرات والماكروز");
  });

  // (6) THE AI PLANNING SECTION (#plan) — the AI family's navigation
  //     surface, deliberately distinct from #tools: the AI Workout
  //     Planner + the AI Meal Planner (explicitly AI-powered cards —
  //     the meal card promises a STRUCTURED full-day plan with
  //     portions in grams, not mere suggestions) + EVO with the
  //     chat-surface law, and NO human-coaching service inside.
  it("the #plan section carries the three AI cards, clean of human-coaching services", () => {
    const src = readFileSync(LANDING, "utf8");
    const copy = readFileSync(COPY_HOME, "utf8");
    expect(src, "the #plan section is missing").toContain('id="plan"');
    // The three AI surfaces — locale-aware card links.
    expect(src).toContain('href={isAr ? "/ar/ai-workout-planner" : "/ai-workout-planner"}');
    expect(src).toContain('href={isAr ? "/ar/ai-meal-planner" : "/ai-meal-planner"}');
    expect(src).toContain('href={isAr ? "/ar/evo" : "/evo"}');
    // EXPLICITLY AI-POWERED: every planner card carries the AI chip and
    // its full AI name (the owner's directive).
    expect(src).toContain('"بالذكاء الاصطناعي" : "AI-POWERED"');
    expect(src).toContain("مخطط التمارين بالذكاء الاصطناعي");
    expect(src).toContain("AI Workout Planner");
    expect(src).toContain("مخطط الوجبات بالذكاء الاصطناعي");
    expect(src).toContain("AI Meal Planner");
    // THE AI MEAL PLANNER PROMISE (the owner's wording): a STRUCTURED
    // full-day plan with portions/grams — NOT merely meal suggestions.
    expect(src).toContain("وليست مجرد اقتراحات وجبات");
    expect(src).toContain("not just meal suggestions");
    expect(src).toContain("كمياتها بالغرامات وسعراتها المحسوبة");
    expect(src).toContain("portions in grams, and calculated calories");
    // The generate CTAs (the pinned benefit-first labels, now on the
    // AI cards).
    expect(src).toContain("أنشئ خطتي");
    expect(src).toContain("Create My Plan");
    expect(src).toContain("أنشئ خطة التمارين");
    expect(src).toContain("Create my workout plan");
    // The section framing follows the registry — AI, not calculators.
    expect(copy).toContain("التخطيط بالذكاء الاصطناعي");
    expect(copy).toContain("AI PLANNING");
    // The honest free-allowance bar (single source re-pinned — the
    // text lives in the registry, the bar lives in the view).
    expect(readBoth()).toContain("رصيدًا شهريًا مجانيًا لتوليد الخطط");
    expect(readBoth()).toContain("free monthly plan allowance");
    expect(readBoth()).toContain("توليد بالذكاء الاصطناعي");
    expect(readBoth()).toContain("AI GENERATION");
    // The EVO card: the chat surface stays the floating widget (the
    // law) + the honest visitor quota.
    expect(src).toContain("openEvoFloatingChat");
    expect(src).toContain("10 رسائل يوميًا مع EVO — دون تسجيل");
    expect(src).toContain("10 messages a day with EVO — no signup");
    expect(src).not.toContain('href="/chat"');
    expect(src).not.toContain('"/chat"');
    // REGION LAW (284): the #plan region carries the AI family and NO
    // human-coaching service (coaching is a separate paid membership —
    // EVO's «مدربك الذكي» is the AI coach, allowed by design).
    const planStart = src.indexOf('id="plan"');
    const nextStart = src.indexOf('id="learn"');
    expect(planStart).toBeGreaterThan(-1);
    expect(nextStart).toBeGreaterThan(planStart);
    const planRegion = src.slice(planStart, nextStart);
    expect(planRegion, "a coaching service leaked into the #plan region").not.toContain("كوتشينج");
    expect(planRegion, "a coaching service leaked into the #plan region").not.toContain("/coaching");
    expect(planRegion, "a coaching service leaked into the #plan region").not.toContain("مدرب شخصي");
    expect(planRegion, "a coaching service leaked into the #plan region").not.toContain("Online Coaching");
  });

  // (7) THE NUTRITION TRIO — Meal Planner / AI Meal Planner / ready-made
  //     Diet Plans stay clearly differentiated: the manual planner chip,
  //     the ready-made chip, and the AI cross-reference in the copy.
  it("the nutrition section differentiates the manual planner, the AI planner, and the ready-made plans", () => {
    const src = readFileSync(LANDING, "utf8");
    const copy = readFileSync(COPY_HOME, "utf8");
    expect(src, "the #eat section is missing").toContain('id="eat"');
    // The three nutrition surfaces — locale-aware card links.
    expect(src).toContain('href={isAr ? "/ar/foods" : "/foods"}');
    expect(src).toContain('href={isAr ? "/ar/meal-planner" : "/meal-planner"}');
    expect(src).toContain('href={isAr ? "/ar/diet-plan" : "/diet-plan"}');
    // The explicit differentiation chips.
    expect(src).toContain('"ابنِها بنفسك" : "YOU BUILD IT"');
    expect(src).toContain('"جاهزة للتصفح" : "READY TO BROWSE"');
    // The manual planner's body states WHO builds the meal.
    expect(src).toContain("أنت من يبني الوجبة");
    expect(src).toContain("You build the meal");
    // The AI cross-reference is explicit (the AI planner lives in the
    // AI section below — the owner's differentiation directive).
    expect(copy).toContain("قسم التخطيط الذكي أدناه");
    expect(copy).toContain("the AI Planning section below");
    // The section copy follows the registry.
    expect(copy).toContain("تغذيتك بثلاث طرق واضحة");
    expect(copy).toContain("Your nutrition, three clear ways");
  });

  // (8) The block map + the real content entry points.
  it("the platform block map and its browse-all links exist", () => {
    const both = readBoth();
    for (const required of [
      // The section ids, in the 284 platform order
      'id="library"',
      'id="train"',
      'id="eat"',
      'id="diet"',
      'id="tools"',
      'id="plan"',
      'id="learn"',
      'id="memberships"',
      'id="faq"',
      // TRAINING — the muscle-group picker + its browse-all CTA.
      "مكتبة التمارين",
      "The exercise library",
      "اختر مجموعة عضلية",
      "Pick a muscle group",
      "استكشف مكتبة التمارين كاملة",
      "Explore the full exercise library",
      // PROGRAMS — the carousel + its ONE focused browse-all CTA.
      "برامج التمارين الجاهزة",
      "Ready-made training programs",
      "كل البرامج",
      "All programs",
      // NUTRITION — the food-database card copy + the retired
      // explorer framing replaced by the trio.
      "استكشف قاعدة الأطعمة",
      "Explore the food database",
      // DIET — the diet-plan library carousel + its CTA.
      "مكتبة الخطط الغذائية الجاهزة",
      "The ready-made diet-plan library",
      // LEARN — the simple title + CTA.
      "أحدث المقالات",
      "Latest Articles",
      "استكشف المحتوى",
      "Explore the articles",
      // The memberships + coaching endpoints.
      'href={isAr ? "/ar/memberships" : "/memberships"}',
      'href={isAr ? "/ar/coaching" : "/coaching"}',
      // Locale-aware browse-all entry points.
      'href={isAr ? "/ar/exercises" : "/exercises"}',
      'href={isAr ? "/ar/foods" : "/foods"}',
      // The samples prop drives the content sections (server-provided
      // real data — the bundle law holds).
      "samples.exercises",
      "samples.programs",
      "samples.dietSystems",
      // VRD-V8R: the memberships section keeps the eyebrow rhythm +
      // the REAL limit-derived feature rows (memberships.ts limits).
      "العضويات والكوتشينج",
      "MEMBERSHIPS & COACHING",
      "توليدان شهريًا للخطط الذكية",
      "2 AI plans a month",
      "كل مزايا المستوى المجاني",
      "Everything in the Free tier",
      "تجربة بلا إعلانات",
      "Ad-free experience",
      "theme-img-pin-dark",
      // VRD-V8R: the FAQ closer keeps the eyebrow + the finished
      // marble-card surface (the pinned AccordionTrigger classes stay).
      "الأسئلة الشائعة",
      "COMMON QUESTIONS",
      'className="marble-card mt-8 p-2 md:mt-10 md:p-4 [&>*:last-child]:border-b-0"',
    ]) {
      expect(both, `content entry point missing: ${required}`).toContain(required);
    }
    // The retired block strings stay dead.
    for (const banned of [
      // The living-product tab wrapper.
      "لا تقرأ عن المنصة. استخدمها الآن.",
      "Don't read about it. Use it right now.",
      "تجربة حية — دون تسجيل",
      "LIVE ON THIS PAGE — NO SIGNUP",
      "ثلاثة أسطح حقيقية",
      "Three real Alkemos surfaces",
      // The retired programs-grid headline (the carousel replaced it).
      "خطة كاملة تقودك، أسبوعًا بأسبوع.",
      "A complete plan to guide you, week by week.",
      // The retired four-turn EVO demo lines.
      "وزني 84 كجم، وأتدرب أربعة أيام في الأسبوع.",
      "تم. سعراتك اليومية الآن 2,150 سعرة",
      // The big free-vs-paid section.
      "مجاني فعلًا. والترقية قرارك.",
      "Free, for real. Upgrading is your call.",
      "const ladder = [",
      // The retired blog title.
      "تعلّم. طبّق. تقدّم.",
      "Learn. Apply. Progress.",
      // The retired final CTA band.
      "ابدأ اليوم. وابنِ روتينًا يناسبك.",
      "Start today. Build a routine that fits you.",
      "أو تحدث مع EVO أولًا",
      "Or talk to EVO first",
      // The retired #train AI-builder CTA (the AI cards in #plan own
      // that job now).
      "ابنِ خطتك بالذكاء الاصطناعي",
      "Build your plan with AI",
      // VRD-V8R: the free-prose card one-liners are retired — replaced
      // by the REAL limit-derived feature rows (they never return).
      "كل المكتبات والأدوات، ورصيد شهري للخطط الذكية.",
      "Every library and tool, plus a monthly AI-plan allowance.",
      "EVO بلا حدود، و4 خطط شهريًا، وتصدير كامل.",
      "Unlimited EVO, 4 plans a month, full export.",
      "8 خطط شهريًا، وتجربة بلا إعلانات.",
      "8 plans a month, and an ad-free experience.",
      // The retired in-page generation framing (the 284 law).
      "خطتك تُبنى هنا — فعلًا.",
      "Your plan is built right here.",
      "توليد حقيقي داخل الصفحة",
      "REAL IN-PAGE GENERATION",
      "توليد حقيقي داخل الصفحة، بنفس محرك الأدوات",
    ]) {
      expect(both, `retired block string returned: "${banned}"`).not.toContain(banned);
    }
  });

  // (9) The blog carousel is LATEST-FIRST (R6): the newest posts lead
  //     the row (featured fills the tail).
  it("the blog carousel puts the latest posts first", () => {
    const src = readFileSync(LANDING, "utf8");
    expect(src).toContain("posts={[...latestPosts, ...featuredPosts].slice(0, 10)}");
    expect(src).not.toContain("posts={[...featuredPosts, ...latestPosts]");
  });

  // (10) The section ORDER (the 284 platform arc): library → train →
  //      eat → diet → tools → plan → learn → memberships → faq —
  //      mirroring the header's service nav (Training · Nutrition ·
  //      Tools · AI · Coaching), with the proof strip directly under
  //      the hero.
  it("the sections render in the platform order", () => {
    const src = readFileSync(LANDING, "utf8");
    const order = [
      'id="library"',
      'id="train"',
      'id="eat"',
      'id="diet"',
      'id="tools"',
      'id="plan"',
      'id="learn"',
      'id="memberships"',
      'id="faq"',
    ].map((needle) => src.indexOf(needle));
    for (let i = 1; i < order.length; i++) {
      expect(order[i], `section ${i} out of the platform order`).toBeGreaterThan(order[i - 1]);
    }
    // The proof strip sits between the hero and the training section
    // (proof directly under the promise).
    const proofAt = src.indexOf('aria-label={isAr ? "المنصة بالأرقام" : "The platform in numbers"}');
    expect(proofAt).toBeGreaterThan(-1);
    expect(proofAt).toBeLessThan(order[0]);
    // The programs + diet carousels sit before the tools/AI cluster,
    // and the AI section closes the product act before #learn.
    expect(order[1]).toBeLessThan(order[4]);
    expect(order[3]).toBeLessThan(order[4]);
    expect(order[5]).toBeLessThan(order[6]);
  });
});

describe("HOME-PLATFORM-284 — header/footer contract", () => {
  // (11) The header carries the five core services as VISIBLE navigation
  //      (desktop nav) with the secondary services demoted to the
  //      drawer's «More» group.
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

  // (12) The footer is the flat fully-displayed service map (R9),
  //      SHORTENED (271 F4): every list trimmed to its PRIMARY
  //      entry points — the header nav carries the dropped surfaces.
  it("the footer is the flat fully-displayed service map", () => {
    const src = readFileSync(FOOTER, "utf8");
    for (const required of [
      // Service-map column headers
      '"Training"',
      '"Nutrition"',
      '"Tools & AI"',
      '"Coaching & Services"',
      '"Company"',
      // The collapsed tools hub link (the five individual tool links
      // became ONE — 271 F4).
      'href={isAr ? "/ar/tools" : "/tools"}',
      // The flat responsive grid (2 cols touch · 3 md · 6 lg).
      "grid grid-cols-2 gap-x-6 gap-y-10 md:grid-cols-3 lg:grid-cols-6",
      // The tagline (verbatim).
      "Built with care for the fitness community",
      "صُنع بعناية لمجتمع اللياقة",
    ]) {
      expect(src, `footer flat service map missing: ${required}`).toContain(required);
    }
    // The disclosure groups are GONE (the owner's directive).
    expect(src).not.toContain("<details");
    expect(src).not.toContain("<summary");
    expect(src).not.toContain("footer-disc");
    expect(src).not.toContain("ChevronDown");
    // The old tagline and the old column labels are gone.
    expect(src).not.toContain("Arab fitness community");
    expect(src).not.toContain("مجتمع اللياقة العربي");
    expect(src).not.toContain("Paid Services");
    expect(src).not.toContain("الخدمات المدفوعة");
    // The §12 type ramp stays (13px links / 11px headings).
    expect(src).toContain("text-[13px] leading-7");
    expect(src).toContain("text-[11px] font-semibold");
  });

  // (13) HREF-ONCE LAW (the flat footer): every locale-aware footer
  //      href appears EXACTLY ONCE (single copy — no mobile/desktop
  //      duplication anymore). 271 F4: the trimmed map carries 18
  //      primary links (was 27 — the header nav absorbed the rest).
  it("href-once: every footer link href appears exactly once", () => {
    const src = readFileSync(FOOTER, "utf8");
    const hrefs = src.match(/href=\{isAr \? "[^"]+" : "[^"]+"\}/g) ?? [];
    expect(hrefs.length).toBeGreaterThanOrEqual(18);
    expect(hrefs.length).toBeLessThanOrEqual(20);
    const counts = new Map<string, number>();
    for (const h of hrefs) counts.set(h, (counts.get(h) ?? 0) + 1);
    const offenders = [...counts.entries()].filter(([, n]) => n !== 1);
    expect(
      offenders,
      `footer hrefs not exactly ×1 (duplicated or forked): ${JSON.stringify(offenders)}`,
    ).toEqual([]);
  });

  // S-5 (audit C-16): the cookie bar is theme-aware GLASS.
  it("cookie bar: theme-aware glass surface + no-backdrop-filter fallback", () => {
    const css = readFileSync("src/app/globals.css", "utf8");
    for (const required of [
      "color-mix(in srgb, var(--card) 92%, transparent)",
      "color-mix(in srgb, var(--card) 88%, transparent)",
      "backdrop-filter: blur(16px)",
      "@supports not ((backdrop-filter: blur(1px))",
    ]) {
      expect(css, `cookie glass missing: ${required}`).toContain(required);
    }
  });
});

describe("HOME-PLATFORM-284 — density, CTA & card contract", () => {
  // The CTA sizing standard — primary 48px touch / 52px md+, secondary
  // 44px touch / 48px md+ (rtl-typography re-pins the recipes too).
  it("CTA standard: btn-chrome 48/52 · btn-outline 44/48", () => {
    const css = readFileSync("src/app/globals.css", "utf8");
    expect(css).toContain(".btn-chrome { min-height: 52px; }");
    expect(css).toContain(".btn-outline { min-height: 48px; }");
    const chromeBlock = css.slice(css.indexOf(".btn-chrome {"), css.indexOf(".btn-chrome:hover"));
    expect(chromeBlock).toContain("min-height: 48px");
    const outlineBlock = css.slice(css.indexOf(".btn-outline {"), css.indexOf(".btn-outline:hover"));
    expect(outlineBlock).toContain("min-height: 44px");
  });

  // O-3 asymmetry (the compact memberships section): the coaching
  // card carries the section's ONE filled CTA; the quiet outline
  // buttons live on the section-level browse CTAs. The unified
  // browse-all section-CTA recipe (48px touch floor) covers the three
  // single-CTA sections (#library, #train, #diet); the blog CTA keeps
  // the quiet px-6 py-2.5 recipe.
  it("memberships asymmetry (O-3): the one filled CTA lives on the coaching card", () => {
    const src = readFileSync(LANDING, "utf8");
    expect(src).toContain(': "/coaching"} className="btn-chrome px-6 py-2.5 text-sm font-medium"');
    expect(src.match(/className="btn-outline px-6 py-2\.5 text-sm font-medium"/g)?.length).toBeGreaterThanOrEqual(1);
    // The unified browse-all section-CTA recipe (48px touch floor):
    // #library, #train, #diet — three single-CTA sections (the AI and
    // nutrition cards carry their own chrome-text arrows).
    expect(src.match(/className="btn-outline px-7 py-3 text-sm font-medium md:text-base"/g)?.length).toBeGreaterThanOrEqual(3);
  });

  // The unified hover law: every INTERACTIVE homepage card family
  // rides the .card-lift recipe — HOME-PLATFORM-284: TEN families
  // (platform-card, evo-card, tools-card, exercise, program, diet,
  // blog, coach, free-card, pro-card).
  it("unified card hover: card-lift on all ten interactive card families; recipe + reduced-motion guard in css", () => {
    const src = readFileSync(LANDING, "utf8");
    const css = readFileSync("src/app/globals.css", "utf8");
    expect(src.match(/marble-card card-lift/g)?.length).toBe(10);
    for (const required of [
      ".marble-card.card-lift:hover {",
      "transform: translateY(-2px)",
      "var(--shadow-lift), var(--card-inner-hl)",
      "border-color: color-mix(in srgb, var(--text) 22%, transparent)",
      ".marble-card.card-lift:hover { transform: none; }",
      "--shadow-lift:",
    ]) {
      expect(css, `card-lift recipe missing: ${required}`).toContain(required);
    }
  });

  // VRD-V8R — the monochrome identity on marketing surfaces: the
  // legacy green/orange value accents stay dead (DESIGN.md §10.3 —
  // #34c759 must never appear on a marketing surface).
  it("food surfaces: legacy accent colors stay dead, mono ramp rules", () => {
    const src = readFileSync(LANDING, "utf8");
    expect(src).not.toContain("text-[#34c759]");
    expect(src).not.toContain("text-[#ff9500]");
  });

  // VRD-V8R — the tint bands carry the hairline frame language: the
  // 284 alternation (bg → tint → bg → tint …) keeps every tint band
  // framed (border-y mid-page, border-t for the closers).
  it("section transitions: tint bands carry the hairline frame", () => {
    const src = readFileSync(LANDING, "utf8");
    for (const required of [
      'id="train" className="scroll-mt-20 border-y border-[var(--edge)] bg-[var(--tint)] px-4 py-10 md:py-20"',
      'id="diet" className="scroll-mt-20 border-y border-[var(--edge)] bg-[var(--tint)] px-4 py-10 md:py-20"',
      'id="plan" className="scroll-mt-20 border-y border-[var(--edge)] bg-[var(--tint)] px-4 py-10 md:py-20"',
      'id="faq" className="scroll-mt-20 border-t border-[var(--edge)] bg-[var(--tint)] px-4 py-10 md:py-20"',
    ]) {
      expect(src, `tint-band frame missing: ${required.slice(0, 60)}`).toContain(required);
    }
  });

  // VRD-V8R — the pinned-dark icon pair for the ALWAYS-dark Premium
  // card: the surface-follow rule lives in globals.css (after the
  // theme pair so it wins the cascade).
  it("theme-img-pin-dark: the surface-follow pair rule exists in css", () => {
    const css = readFileSync("src/app/globals.css", "utf8");
    const pinAt = css.indexOf(".theme-img-pin-dark .theme-img-light { display: none; }");
    const pairAt = css.indexOf('[data-theme="dark"] .theme-img-dark { display: block; }');
    expect(pinAt).toBeGreaterThan(-1);
    expect(pairAt).toBeGreaterThan(-1);
    expect(pinAt).toBeGreaterThan(pairAt);
  });
});

describe("HOME-PLATFORM-284 — the motion-safety contract", () => {
  // The living-page motion layer: every animation is once-only,
  // transform/opacity-only, and gated by prefers-reduced-motion. The
  // .rv reveal recipe must never hide content from no-JS users (the
  // armed state exists only post-mount in React state). The 284 frame
  // retired the macro-bar pair with the embedded calculator/explorer —
  // the surviving recipes stay guarded.
  it("motion: the reveal/swap recipes exist and every keyframe respects reduced motion", () => {
    const css = readFileSync("src/app/globals.css", "utf8");
    const src = readFileSync(LANDING, "utf8");
    for (const required of [
      ".rv {",
      ".live-dot {",
      ".swap-fade {",
    ]) {
      expect(css, `living-page recipe missing: ${required}`).toContain(required);
    }
    // Every motion recipe stands down under reduced motion.
    const reducedBlocks = css.match(/@media \(prefers-reduced-motion: reduce\)\s*\{[\s\S]*?\n\}/g) ?? [];
    const joined = reducedBlocks.join("\n");
    for (const recipe of [".rv", ".live-dot", ".swap-fade"]) {
      expect(joined, `reduced-motion guard missing for: ${recipe}`).toContain(recipe);
    }
    // The retired tab recipe stays dead (the tabs are gone), and the
    // macro-bar pair (284) never returns.
    expect(css).not.toContain(".home-tabs");
    expect(css).not.toContain(".home-tab");
    expect(css).not.toContain(".macro-track");
    expect(css).not.toContain(".macro-fill");
    expect(css).not.toContain(".evo-console");
    expect(css).not.toContain(".evo-orb");
    expect(css).not.toContain(".evo-beam");
    expect(css).not.toContain(".evo-art-mask");
    // The reveal arms ONLY after mount (no class-based SSR hiding).
    expect(src).toContain('useState<"idle" | "armed" | "shown">("idle")');
    expect(src).toContain('setPhase("armed")');
    // The reveal + count-up stand down under reduced motion (the two
    // motion components; CSS recipes carry their own guards above).
    expect(src.match(/prefers-reduced-motion: reduce/g)?.length).toBeGreaterThanOrEqual(2);
    // The proof strip renders the SSR value (CountUp falls back to the
    // real number — no-JS users see the truth).
    expect(src).toContain("const shown = display ?? value;");
  });
});

describe("HOME-PLATFORM-284 — copy voice canaries", () => {
  // K-1: «توليدات» is a mechanical pseudo-plural — the natural MSA
  // verbal noun is the only register. After the compact-card rebuild
  // the phrase survives in the membership FAQ answers.
  it("K-1: the pseudo-plural «توليدات» stays dead; the verbal noun is the register", () => {
    const both = readBoth();
    expect(both).not.toContain("توليدات");
    expect(both.match(/توليد خطط أكثر/g)?.length).toBe(1);
  });

  // K-2: the coaches H2 keeps the «featured/certified» meaning.
  it("K-2: the featured-coaches H2 says «معتمدون»", () => {
    const both = readBoth();
    expect(both).toContain('"مدربون معتمدون على Alkemos"');
    expect(both).not.toContain("مدربون على المنصة");
  });

  // K-6: the retired hero subtitle pairs stay dead (banned in EITHER
  //      file — the registry must not resurrect them either).
  it("K-6: the retired hero subtitles stay dead", () => {
    const both = readBoth();
    expect(both).not.toContain("خطتك للياقة تبدأ من هنا.");
    expect(both).not.toContain("Your fitness plan starts here.");
    expect(both).not.toContain("تدريب وتغذية وأدوات ذكية — خطة واحدة تقترب بك من هدفك.");
    expect(both).not.toContain("Training, nutrition, and smart tools — one plan that moves with you toward your goal.");
  });

  // Exit criterion: the FAQ JSON-LD must stay single-source — the
  // visible array is the only source; the schema derives from it.
  it("the FAQ JSON-LD stays derived from the visible faqs array (single source)", () => {
    const src = readFileSync(LANDING, "utf8");
    expect(src).toContain("const faqSchema = getFAQSchema(faqs);");
    // No hardcoded schema construction in the view — the JSON-LD types
    // live only in lib/seo.ts.
    expect(src).not.toContain('"@type"');
    expect(src).not.toContain('"Question"');
  });
});

describe("HOME-PLATFORM-284 — FAQ canaries", () => {
  // The FIVE questions (Arabic anchors + independent English). Every
  // claim mirrors the implementation.
  it("the homepage FAQ answers the five hesitation-remover questions", () => {
    const both = readBoth();
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
      expect(both, `FAQ question missing: ${required}`).toContain(required);
    }
    // The retired question sets stay dead.
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
      expect(both, `retired FAQ question returned: "${banned}"`).not.toContain(banned);
    }
  });
});

describe("HOME-PLATFORM-284 — homepage sample drift guard (real content, curated)", () => {
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

  it("getHomeSamples returns the full curated sets + the real diet systems with real data", () => {
    const samples = getHomeSamples();
    expect(samples.exercises).toHaveLength(EXERCISE_SAMPLE_SLUGS.length);
    expect(samples.foods).toHaveLength(FOOD_SAMPLE_SLUGS.length);
    expect(samples.programs).toHaveLength(PROGRAM_SAMPLE_SLUGS.length);
    // The diet systems mirror the REAL matrix: same slugs, same splits,
    // every line filled (the homepage may never drift from
    // diet-plan-matrix.ts).
    expect(samples.dietSystems).toHaveLength(DIET_SYSTEMS.length);
    for (const system of DIET_SYSTEMS) {
      const slice = samples.dietSystems.find((s) => s.slug === system.slug);
      expect(slice, `diet system missing from the slice: ${system.slug}`).toBeTruthy();
      expect(slice?.split.protein).toBe(system.split.protein);
      expect(slice?.split.carbs).toBe(system.split.carbs);
      expect(slice?.split.fat).toBe(system.split.fat);
      expect(slice?.lineAr.length).toBeGreaterThan(5);
      expect(slice?.lineEn.length).toBeGreaterThan(5);
    }
    // The levels ride along (the count line derives: 6 × 4 = 24).
    expect(samples.dietLevels.length).toBe(6);
    // Real data spot-checks: the chicken-breast macros are the live DB
    // values (per-100g), and every exercise sample carries an image.
    const chicken = samples.foods.find((f) => f.slug === "chicken-breast");
    expect(chicken?.calories).toBe(165);
    expect(chicken?.protein).toBe(31);
    // Every exercise sample carries a SELF-HOSTED WebP image.
    for (const ex of samples.exercises) {
      expect(ex.image.startsWith("/images/exercises/")).toBe(true);
      expect(ex.image.endsWith(".webp")).toBe(true);
    }
  });

  // HOME-PLATFORM-284 (owner directive «وسّع معاينة مكتبة التمارين من
  // 3 إلى 6»): SIX real curated samples per muscle family — the
  // library preview answers every selection with a full 6-card grid.
  it("the exercise curation carries SIX samples per muscle family (the 3→6 expansion)", () => {
    expect(EXERCISE_SAMPLE_SLUGS.length).toBe(42);
    const perFamily = new Map<string, number>();
    for (const slug of EXERCISE_SAMPLE_SLUGS) {
      const ex = EXERCISES.find((e) => e.slug === slug);
      expect(ex, `curated exercise missing: ${slug}`).toBeTruthy();
      const cat = ex!.category;
      perFamily.set(cat, (perFamily.get(cat) ?? 0) + 1);
    }
    for (const family of ["chest", "back", "shoulders", "legs", "biceps", "triceps", "core"]) {
      expect(perFamily.get(family), `family ${family} lost its six-sample curation`).toBe(6);
    }
    // The browser grid renders the six-card 2×3 grid on md+.
    const src = readFileSync(LANDING, "utf8");
    expect(src).toContain("swap-fade mt-7 grid grid-cols-2 gap-4 md:grid-cols-3");
  });
});

describe("TPL-REF-280 — the selective template-reference contract", () => {
  // Owner order 2026-09-26 (second frame — after the EMBER-INK-279
  // rollback): the 1devtool landing-fitness-studio template is a
  // VISUAL REFERENCE ONLY. Four quiet techniques adapted INTO the
  // Marble & Chrome language; the guards below pin the scope fence —
  // the template's identity must never cross over, and the Alkemos
  // UX architecture (structure/order/hero/two-button law/light+dark
  // equality/semantic app-view macro colors) must never move.
  const css = readFileSync("src/app/globals.css", "utf8");
  const src = readFileSync(LANDING, "utf8");

  it("(1) .chev: the CTA chevron micro-slide recipe + RTL mirror + reduced-motion guard", () => {
    for (const required of [
      ".chev { transition: translate 0.2s ease; }",
      ".btn-chrome:hover .chev,",
      ".btn-outline:hover .chev { translate: 4px 0; }",
      '[dir="rtl"] .btn-chrome:hover .chev,',
      '[dir="rtl"] .btn-outline:hover .chev { translate: -4px 0; }',
    ]) {
      expect(css, `chev recipe missing: ${required}`).toContain(required);
    }
    const reduced = css.match(/@media \(prefers-reduced-motion: reduce\)\s*\{[\s\S]*?\n\}/g) ?? [];
    expect(reduced.join("\n")).toContain(".chev { transition: none; }");
    // Opt-in scope: every .chev span in the view is a pill-CTA chevron
    // (the 284 frame: the two hero CTAs ×2 + the three browse-all CTAs
    // + the diet/library/platform card arrows — eight in all).
    expect(src.match(/className="chev rtl:rotate-180"/g)?.length).toBe(8);
    expect(src).toContain('className="chev rtl:rotate-180" aria-hidden="true">›</span>');
  });

  it("(2) .ghost-num: the diet-card ghost index numeral recipe (mono ramp, zero new hexes)", () => {
    for (const required of [
      ".ghost-num {",
      "font-family: var(--font-display);",
      "color: color-mix(in srgb, var(--text) 10%, transparent);",
    ]) {
      expect(css, `ghost-num recipe missing: ${required}`).toContain(required);
    }
    // The numeral is decorative (aria-hidden) and indexed from the map.
    expect(src).toContain('className="ghost-num" aria-hidden="true"');
    expect(src).toContain('String(index + 1).padStart(2, "0")');
    expect(src).toContain("index={i}");
    // The ghost derives from --text only — the template's white/10
    // ghost ink never ships (dark-only identity fence).
    expect(css).not.toContain("text-white/10");
  });

  it("(3) featured Premium card: the template's featured-pricing depth, re-toned warm", () => {
    expect(src).toContain('boxShadow: "0 24px 60px -28px rgba(11, 11, 13, 0.55)"');
    // The ember featured treatments never cross over.
    expect(src).not.toContain("#ff4d26");
    expect(src).not.toContain("#ff9353");
    expect(src).not.toContain("#d7ff4d");
  });

  it("(4) display numerals: the proof band rides the display face", () => {
    expect(src).toContain('className="font-display text-lg font-semibold tracking-tight md:text-xl"');
  });

  it("scope fence: the template identity never ships (Ember & Ink / Sora / Outfit / tpl- prefixes)", () => {
    // Guards assert shipped DECLARATIONS, not comment narration (the
    // provenance comments quote the retired names by law — AGENTS.md
    // §8: comments may narrate history, code may not reference it).
    expect(css).not.toMatch(/font-family:[^;\n]*Sora/);
    expect(css).not.toMatch(/font-family:[^;\n]*Outfit/);
    expect(css).not.toMatch(/\.tpl-/);
    expect(css).not.toMatch(/--ember[^-]/);
    expect(css).not.toContain("#FF4D26");
    expect(src).not.toMatch(/font-family:[^;\n"]*Sora/);
    // Light + dark stay equal citizens: both theme blocks still author
    // the full token set (the mode-invariant shim never returns).
    expect(css).toContain('[data-theme="dark"] {');
    expect(css.match(/--muted-2:/g)?.length).toBe(2);
  });
});
