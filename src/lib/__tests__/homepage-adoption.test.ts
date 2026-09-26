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
 * HOME-REFINE-271 CANARIES — the four-point owner follow-up
 * (2026-09-24) on top of the HOME-REFINE-270 nine-point refinement.
 * + the 2026-09-24 hand-off frame: the #train AI-builder CTA is
 *   retired (ONE browse-all CTA) and the homepage builders persist
 *   every generated plan via saveGuestPlan so «افتح الأداة الكاملة»
 *   lands on a tool that ALREADY shows the plan.
 *
 * THE CORRECTED ARC (F1–F4):
 *   Promise (Hero, TWO CTAs: auth + memberships) → Proof (ONE compact
 *   row) → #start (the calculator, independent) → #evo (EVO, its own
 *   CONCISE section — two-turn demo, no artwork under the copy, the
 *   desktop warrior side-art stays) → #plan (the smart-planning
 *   builders, now running the REAL generation endpoints in-page) →
 *   #library (the RESTORED interactive muscle-group exercise
 *   browser) → #eat (the interactive plate) → #train (the READY-MADE
 *   PROGRAMS carousel) → #diet (the ready-made diet-plan library
 *   carousel) → #learn (أحدث المقالات, latest-first) → #memberships
 *   (small cards + coaching card) → featured coaches → #faq → footer
 *   (flat, fully displayed, SHORTENED — 18 primary links).
 *
 * Guards pin:
 *   1) SINGLE-SOURCE PRICING — unchanged law: prices derive from
 *      memberships.ts lookups (never literals, never a tier grid) and
 *      the refund line states the REAL 7-day policy.
 *   2) THE CALCULATOR runs the app's own math via fitness-math.ts
 *      (single source; the homepage may never fork the formulas).
 *   3) THE EVO SECTION owns EVO alone: the demo is LABELED illustrative
 *      and hands off to the floating widget (the CHAT SURFACE LAW).
 *   4) THE SMART-PLANNING SECTION (#plan) is REAL: both builders call
 *      the REAL demo endpoints (/api/ai/workout-plan-demo ·
 *      /api/ai/meal-plan-demo — the unified pool) and render the
 *      generated plan in-page — real planner vocabulary (ai-
 *      workout-planner.ts), live previews, BOTH tool CTAs — and
 *      ZERO EVO or coach references inside the section (the owner's
 *      explicit law).
 *      PARITY (owner directive 2026-09-24 «الادوات على الرئيسية تطابق
 *      الادوات الاصلية — الخانات المطلوبة وباقى تفاصيل التوليد»): the
 *      builders carry EVERY generation field the tool pages carry —
 *      the meal side's FREE calorie target (1200–4000, like the tool)
 *      and BOTH sides' optional notes (≤200 chars) ride the fetch
 *      bodies AND the saveGuestPlan envelopes (the tool re-hydrates
 *      them). The retired preset-chips register stays dead.
 *   5) The curated samples exist in the LIVE libraries (drift guard)
 *      — 15 exercises, 8 foods, 3 programs, 4 diet systems.
 *   6) The hero drives the account action + the memberships page (the
 *      owner's two-button directive); the retired final-CTA band and
 *      the old tab wrapper stay dead.
 *   7) Arabic is the native anchor; English is independent native copy
 *      — both pinned verbatim.
 */

const LANDING = "src/components/views/LandingView.tsx";
const HEADER = "src/components/SiteHeader.tsx";
const FOOTER = "src/components/SiteFooter.tsx";

describe("HOME-REFINE-271 — the refined homepage canaries", () => {
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
  it("the hero carries exactly the two CTAs: login/signup + the memberships page", () => {
    const src = readFileSync(LANDING, "utf8");
    // The primary account action (signup; the auth page carries the
    // login toggle — one button covers both actions).
    expect(src).toContain('"/auth?mode=signup"');
    // The two-button pair + label pins.
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
    // The hero H1 + subtitle pairs (native anchors).
    expect(src).toContain("تدرّب بذكاء. وتغذَّ بدقة.");
    expect(src).toContain("Train smarter. Eat with precision.");
    expect(src).toContain("جرّبها الآن في هذه الصفحة");
    expect(src).toContain("Try it right on this page");
  });

  // (3) THE PROOF STRIP — one compact row (R2): the four auditable
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
    // EMBER-INK-279 re-pin: the stats row rides INSIDE the template
    // hero (the 2/4-col border-t grid under the CTA pair).
    expect(src).toContain("mt-10 grid grid-cols-2 gap-x-6 gap-y-6 border-t border-white/10 pt-8 md:grid-cols-4");
    // The retired centered-band classes stay dead.
    expect(src).not.toContain("flex max-w-5xl flex-wrap items-baseline justify-center gap-x-6 gap-y-1.5 md:gap-x-10");
    // The retired BIG-stat markup stays dead (no icon-tile stat grid).
    expect(src).not.toContain("grid max-w-5xl grid-cols-2 gap-y-8 md:grid-cols-4");
  });

  // (4) THE CALCULATOR SECTION (#start) — the app's own math, never
  //     forked, now an independent section with its own headline.
  it("the calculator section (#start) runs the real math as its own section", () => {
    const src = readFileSync(LANDING, "utf8");
    expect(src, "the #start section is missing").toContain('id="start"');
    // The math single source — the homepage calculator imports the
    // shared formulas, never re-implements them.
    expect(src).toContain('from "@/lib/fitness-math"');
    expect(src).toContain("calculateCalorieTargets");
    expect(src).toContain("isValidCalculatorInput");
    for (const banned of [
      // A forked formula would look like this (the Mifflin constants
      // must never appear in the view — they live in fitness-math.ts).
      "10 * w",
      "6.25 *",
      "10 * weightKg",
      "6.25 * heightCm",
      "- 5 * age",
    ]) {
      expect(src, `the view forked the calculator math: "${banned}"`).not.toContain(banned);
    }
    // The calculator CTA pair + the honest math note.
    expect(src).toContain("احسب أرقامي الآن");
    expect(src).toContain("Calculate my numbers");
    expect(src).toContain("بنفس معادلات حاسبة السعرات في المنصة");
    expect(src).toContain("The same math as the platform's calorie calculator");
  });

  // (5) THE EVO SECTION — EVO owns its own section (R3/R5): the
  //     labeled demo, the widget hand-off, and the retired mixed
  //     «التخطيط الذكي و EVO» framing stays dead.
  it("the EVO section owns EVO alone: labeled demo + widget hand-off + honest quota", () => {
    const src = readFileSync(LANDING, "utf8");
    expect(src, "the EVO section is missing").toContain('id="evo"');
    expect(src).toContain("openEvoFloatingChat");
    // The section headline pair.
    expect(src).toContain("تحدّث مع EVO — بالعربية أو الإنجليزية.");
    expect(src).toContain("Talk to EVO — in Arabic or English.");
    // The demo is HONEST: labeled illustrative, and its CTA opens
    // the floating widget (the chat-surface law).
    expect(src).toContain("نموذج توضيحي لمحادثة");
    expect(src).toContain("AN ILLUSTRATIVE EXCHANGE");
    expect(src).toContain("أكمل المحادثة مع EVO");
    expect(src).toContain("Continue this conversation");
    // The honest visitor quota (EVO fair use).
    expect(src).toContain("10 رسائل يوميًا مع EVO — دون تسجيل");
    expect(src).toContain("10 messages a day with EVO — no signup");
    // The retired /chat route stays dead (the widget is the surface).
    expect(src).not.toContain('href="/chat"');
    expect(src).not.toContain('"/chat"');
    // The retired mixed-section headline + framing stay dead.
    expect(src).not.toContain("التخطيط الذكي و EVO");
    expect(src).not.toContain("SMART PLANNING + EVO");
    expect(src).not.toContain("خطة مبنية حولك — ومدرب يواكب تقدّمك.");
    expect(src).not.toContain("A plan built around you — and a coach who keeps it moving.");
    // The warrior-art recipe stays (the Phase 127 owner artwork).
    expect(src).toContain("evo-art-mask");
    expect(src).toContain("evo-hero-light.webp");
  });

  // (6) THE SMART-PLANNING SECTION (#plan) — REAL generation like the
  //     tools (271 F3): both builders call the REAL demo endpoints and
  //     render the generated plan in-page — real planner vocabulary,
  //     real matrix levels, live previews, both tool CTAs — and NO EVO /
  //     NO coach inside.
  it("the #plan section runs the REAL AI generation (workout + nutrition), clean of EVO and coach references", () => {
    const src = readFileSync(LANDING, "utf8");
    expect(src, "the #plan section is missing").toContain('id="plan"');
    // The vocabulary single source: the homepage imports the REAL
    // planner option functions (labels can never drift from the tool).
    expect(src).toContain('from "@/lib/ai-workout-planner"');
    expect(src).toContain("workoutGoalOptions");
    expect(src).toContain("workoutLevelOptions");
    expect(src).toContain("workoutEquipmentOptions");
    // Both builders exist.
    expect(src).toContain("function WorkoutPlanBuilder");
    expect(src).toContain("function MealPlanBuilder");
    // The REAL engine: both demo endpoints are called in-page (the
    // unified free pool — guests included), with the guest id minted
    // by the shared plan-persistence module (same identity as the
    // tools — the incognito-reset hole stays closed).
    expect(src).toContain('"/api/ai/workout-plan-demo"');
    expect(src).toContain('"/api/ai/meal-plan-demo"');
    expect(src).toContain("ensureGuestId");
    // THE HAND-OFF LAW (owner directive 2026-09-24: «الخطة المولده لا
    // تظهر فى صفحة الأداة»): both builders persist every successful
    // generation with the SAME envelope the tool pages re-hydrate
    // from — the homepage import carries saveGuestPlan and BOTH kinds
    // are written with their inputs.
    expect(src).toContain('import { ensureGuestId, saveGuestPlan } from "@/lib/plan-persistence"');
    expect(src.match(/saveGuestPlan\("workout"/g)?.length).toBe(1);
    expect(src.match(/saveGuestPlan\("nutrition"/g)?.length).toBe(1);
    // PARITY LAW (owner directive 2026-09-24: «الادوات على الرئيسية
    // تطابق الادوات الاصلية — الخانات المطلوبة وباقى تفاصيل التوليد»):
    // the meal builder carries the TOOL's free calorie field (numeric
    // 1200–4000 — not the retired 6-preset chips), both builders carry
    // the tool's optional notes (≤200 chars), and BOTH the fetch bodies
    // AND the persistence envelopes carry the notes so the full tool
    // re-hydrates the EXACT selections that produced the plan.
    expect(src).toContain('min={1200}');
    expect(src).toContain('max={4000}');
    expect(src.match(/maxLength=\{200\}/g)?.length).toBe(2);
    expect(src.match(/notes: notes \|\| undefined/g)?.length).toBe(2);
    expect(src).toContain(
      'saveGuestPlan("workout", generated, { goal, level, days, equipment: equip, notes })',
    );
    expect(src).toContain(
      'saveGuestPlan("nutrition", generated, { calories: Number(calories), system: systemSlug, notes })',
    );
    // The retired preset-chips register stays dead (the tool's free
    // input replaced it — the chips capped at 3000, the tool reaches
    // 4000 with any integer).
    expect(src).not.toContain("pickCalories(lv)");
    // The honest quota chip register (same as the tool pages).
    expect(src).toContain("رصيد الشهر");
    expect(src).toContain("This month:");
    // The generate buttons (initial labels pinned) + both tool CTAs
    // (locale-aware, on the generated plan + the section).
    expect(src).toContain("أنشئ خطتي");
    expect(src).toContain("Create My Plan");
    expect(src).toContain("أنشئ خطة التمارين");
    expect(src).toContain("Create my workout plan");
    expect(src).toContain('href={isAr ? "/ar/ai-workout-planner" : "/ai-workout-planner"}');
    expect(src).toContain('href={isAr ? "/ar/ai-meal-planner" : "/ai-meal-planner"}');
    // The free-pool honesty line.
    expect(src).toContain("رصيدًا شهريًا مجانيًا لتوليد الخطط");
    expect(src).toContain("free monthly plan allowance");
    // REGION LAW: the #plan region must be clean of EVO and of any
    // coach/مدرب reference (the owner's explicit directive — EVO owns
    // #evo; human coaching is a separate paid membership).
    const planStart = src.indexOf('id="plan"');
    const nextStart = src.indexOf('id="library"');
    expect(planStart).toBeGreaterThan(-1);
    expect(nextStart).toBeGreaterThan(planStart);
    const planRegion = src.slice(planStart, nextStart);
    expect(planRegion, "EVO leaked into the #plan region").not.toContain("EVO");
    expect(planRegion, "a coach reference leaked into the #plan region").not.toContain("مدرب");
    expect(planRegion, "a coach reference leaked into the #plan region").not.toContain("coach");
  });

  // (7) The block map + the real content entry points.
  it("the refined block map and its browse-all links exist", () => {
    const src = readFileSync(LANDING, "utf8");
    for (const required of [
      // The section ids, in the corrected 271 order
      'id="start"',
      'id="evo"',
      'id="plan"',
      'id="library"',
      'id="eat"',
      'id="train"',
      'id="diet"',
      'id="learn"',
      'id="memberships"',
      'id="faq"',
      // The RESTORED interactive exercise library (271 F1): the
      // muscle-group picker + its browse-all CTA.
      "مكتبة التمارين",
      "The exercise library",
      "اختر مجموعة عضلية",
      "Pick a muscle group",
      "استكشف مكتبة التمارين كاملة",
      "Explore the full exercise library",
      // The ready-made programs carousel (271 F1) + its ONE focused
      // browse-all CTA (the AI-builder CTA retired 2026-09-24 — the
      // smart-planning builders in #plan own that job)
      "برامج التمارين الجاهزة",
      "Ready-made training programs",
      "كل البرامج",
      "All programs",
      // The Eat section (the interactive plate) + section CTA
      "اعرف أرقام طبقك قبل أن تأكله.",
      "Know your plate's numbers before you eat it.",
      "استكشف قاعدة الأطعمة",
      "Explore the food database",
      // The diet-plan library carousel + its CTA
      "مكتبة الخطط الغذائية الجاهزة",
      "The ready-made diet-plan library",
      'href={isAr ? "/ar/diet-plan" : "/diet-plan"}',
      // The blog section (simple title) + CTA
      "أحدث المقالات",
      "Latest Articles",
      "استكشف المحتوى",
      "Explore the articles",
      // The memberships + coaching endpoints
      'href={isAr ? "/ar/memberships" : "/memberships"}',
      'href={isAr ? "/ar/coaching" : "/coaching"}',
      // Locale-aware browse-all entry points
      'href={isAr ? "/ar/exercises" : "/exercises"}',
      'href={isAr ? "/ar/foods" : "/foods"}',
      // The samples prop drives the content sections (server-provided
      // real data — the bundle law holds).
      "samples.exercises",
      "samples.foods",
      "samples.programs",
      "samples.dietSystems",
      // VRD-V8R: the memberships section gains the page's eyebrow
      // rhythm naming the WHOLE services act, and the three cards read
      // REAL feature rows (memberships.ts limits — the checkseal mark
      // the /memberships lists render; zero invented claims).
      "العضويات والكوتشينج",
      "MEMBERSHIPS & COACHING",
      "توليدان شهريًا للخطط الذكية",
      "2 AI plans a month",
      "كل مزايا المستوى المجاني",
      "Everything in the Free tier",
      "تجربة بلا إعلانات",
      "Ad-free experience",
      "theme-img-pin-dark",
      // VRD-V8R: the FAQ closer gains the eyebrow + a finished
      // marble-card surface (the pinned AccordionTrigger classes stay).
      "الأسئلة الشائعة",
      "COMMON QUESTIONS",
      'className="marble-card p-2 md:p-4 [&>*:last-child]:border-b-0"',
    ]) {
      expect(src, `content entry point missing: ${required}`).toContain(required);
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
      // The retired four-turn EVO demo lines (the concise two-turn
      // demo replaced them — 271 F2).
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
      // The retired #train AI-builder CTA (owner directive
      // 2026-09-24 — «امسحه»; #plan owns AI plan creation).
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
    ]) {
      expect(src, `retired block string returned: "${banned}"`).not.toContain(banned);
    }
  });

  // (8) The blog carousel is LATEST-FIRST (R6): the newest posts lead
  //     the row (featured fills the tail).
  it("the blog carousel puts the latest posts first", () => {
    const src = readFileSync(LANDING, "utf8");
    expect(src).toContain("posts={[...latestPosts, ...featuredPosts].slice(0, 10)}");
    expect(src).not.toContain("posts={[...featuredPosts, ...latestPosts]");
  });

  // (9) The section ORDER: calculator → EVO → plan → library → eat →
  //     train → diet → learn → memberships → faq (the corrected arc —
  //     the interactive library sits right after the planners, and
  //     the programs carousel joins the diet carousel right before
  //     the blog).
  it("the sections render in the corrected order", () => {
    const src = readFileSync(LANDING, "utf8");
    const order = [
      'id="start"',
      'id="evo"',
      'id="plan"',
      'id="library"',
      'id="eat"',
      'id="train"',
      'id="diet"',
      'id="learn"',
      'id="memberships"',
      'id="faq"',
    ].map((needle) => src.indexOf(needle));
    for (let i = 1; i < order.length; i++) {
      expect(order[i], `section ${i} out of the corrected order`).toBeGreaterThan(order[i - 1]);
    }
    // The proof strip sits between the hero and the calculator
    // (proof directly under the promise).
    const proofAt = src.indexOf('aria-label={isAr ? "المنصة بالأرقام" : "The platform in numbers"}');
    expect(proofAt).toBeGreaterThan(-1);
    expect(proofAt).toBeLessThan(order[0]);
    // The programs + diet carousels sit right before the blog (the
    // owner's placement directive — 271 F1 corrected the pair).
    expect(order[5]).toBeLessThan(order[7]);
    expect(order[6]).toBeLessThan(order[7]);
  });
});

describe("HOME-REFINE-271 — header/footer contract", () => {
  // (10) The header carries the five core services as VISIBLE navigation
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

  // (11) The footer is the flat fully-displayed service map (R9),
  //      now SHORTENED (271 F4): every list trimmed to its PRIMARY
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

  // (12) HREF-ONCE LAW (the flat footer): every locale-aware footer
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

describe("HOME-REFINE-271 — density, CTA & card contract", () => {
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

  // §11 food cards (C-1 VLM note): the food selector cards keep the
  // aligned macro rows (min-h title floor) + gap-2 rhythm — the same
  // recipe inside the interactive FoodExplorer (#eat, unchanged).
  it("food cards: aligned macro rows (min-h title floor) + gap-2 rhythm", () => {
    const src = readFileSync(LANDING, "utf8");
    expect(src).toContain("mt-1 min-h-10 text-base font-semibold leading-tight tracking-tight line-clamp-2");
    expect(src).toContain('className="mt-2 grid grid-cols-3 gap-1 text-[10px] font-normal"');
    expect(src).toContain('className="chrome-text mt-2 text-xs font-semibold"');
  });

  // O-3 asymmetry (the compact memberships section): the coaching
  // card carries the section's ONE filled CTA; the quiet outline
  // buttons live on the section-level browse CTAs. (2026-09-24: the
  // #train browse-all CTA was promoted to the unified section-CTA
  // recipe — px-7 py-3, like #library/#eat/#diet — when the section's
  // AI-builder button was retired; the blog CTA keeps the quiet
  // px-6 py-2.5 recipe, and exactly ONE filled px-6 py-2.5 CTA
  // remains: the coaching card.)
  it("memberships asymmetry (O-3): the one filled CTA lives on the coaching card", () => {
    const src = readFileSync(LANDING, "utf8");
    expect(src).toContain(': "/coaching"} className="btn-chrome px-6 py-2.5 text-sm font-medium"');
    expect(src.match(/className="btn-outline px-6 py-2\.5 text-sm font-medium"/g)?.length).toBeGreaterThanOrEqual(1);
    // The unified browse-all section-CTA recipe (48px touch floor):
    // #library, #eat, #train, #diet — four single-CTA sections.
    expect(src.match(/className="btn-outline px-7 py-3 text-sm font-medium md:text-base"/g)?.length).toBeGreaterThanOrEqual(4);
  });

  // The unified hover law: every INTERACTIVE homepage card family
  // rides the .card-lift recipe — HOME-REFINE-270: EIGHT families
  // (exercise, food, program, blog, coach, free-card, pro-card, diet).
  it("unified card hover: card-lift on all eight interactive card families; recipe + reduced-motion guard in css", () => {
    const src = readFileSync(LANDING, "utf8");
    const css = readFileSync("src/app/globals.css", "utf8");
    expect(src.match(/marble-card card-lift/g)?.length).toBe(8);
    for (const required of [
      ".marble-card.card-lift:hover {",
      "transform: translateY(-2px)",
      // EMBER-INK-279 re-pin: the template hover — the hairline
      // strengthens to white/30 + the deeper drop.
      "border-color: rgba(255, 255, 255, 0.30)",
      "0 24px 56px -20px rgba(0, 0, 0, 0.65)",
      ".marble-card.card-lift:hover { transform: none; }",
      "--shadow-lift:",
    ]) {
      expect(css, `card-lift recipe missing: ${required}`).toContain(required);
    }
  });

  // VRD-V8R — the monochrome identity on the #eat selector chips: the
  // legacy green/orange value accents are retired (DESIGN.md §10.3 —
  // #34c759 must never appear on a marketing surface); the pinned
  // aligned-rows recipe stays byte-identical.
  it("food selector chips: legacy accent colors stay dead, mono ramp rules", () => {
    const src = readFileSync(LANDING, "utf8");
    expect(src).not.toContain("text-[#34c759]");
    expect(src).not.toContain("text-[#ff9500]");
    expect(src).toContain('className="block font-semibold" style={{ color: PALETTE.textPrim }}');
  });

  // VRD-V8R — the tint bands carry the proof strip's machined edge
  // language: framed tint bands (evo/library/train) ride border-y,
  // meander-adjacent bands (learn/faq) ride border-t.
  it("section transitions: tint bands carry the hairline frame", () => {
    const src = readFileSync(LANDING, "utf8");
    for (const required of [
      'id="evo" className="scroll-mt-20 border-y border-[var(--edge)] bg-[var(--tint)] px-4 py-10 md:py-20"',
      'id="library" className="scroll-mt-20 border-y border-[var(--edge)] bg-[var(--tint)] px-4 py-10 md:py-20"',
      'id="train" className="scroll-mt-20 border-y border-[var(--edge)] bg-[var(--tint)] px-4 py-10 md:py-20"',
      'id="learn" className="scroll-mt-20 border-t border-[var(--edge)] bg-[var(--tint)] px-4 py-10 md:py-20"',
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

describe("EMBER-INK-279 — the template transplant canaries", () => {
  // The 1devtool landing-fitness-studio baseline: the structural
  // recipes the homepage now rides (marquee band, page atmosphere,
  // ember panel, hero glass card, the closing CTA box).
  it("the template recipes exist in css and ride the homepage", () => {
    const css = readFileSync("src/app/globals.css", "utf8");
    const src = readFileSync(LANDING, "utf8");
    for (const required of [
      ".tpl-marquee { animation: tpl-marquee 36s linear infinite; }",
      "@keyframes tpl-marquee",
      ".glow-ember {",
      ".noise {",
      ".dot-pulse { animation: pulse-dot 1.8s ease-in-out infinite; }",
      ".hero-glow {",
      ".hero-row {",
      ".ember-panel {",
      '[dir="rtl"] .tpl-marquee { animation-direction: reverse; }',
    ]) {
      expect(css, `template recipe missing from css: ${required}`).toContain(required);
    }
    for (const required of [
      "tpl-marquee",
      "hero-glow",
      "glow-ember",
      "noise",
      "dot-pulse",
      "ember-panel",
      "MARQUEE_TERMS_AR",
      "MARQUEE_TERMS_EN",
    ]) {
      expect(src, `template recipe missing from the homepage: ${required}`).toContain(required);
    }
    // The retired Marble-era recipes stay dead — in the MARKUP by bare
    // name, in the CSS by SELECTOR (the retirement comments that name
    // the dead recipes are documentation, not usage).
    for (const banned of [
      "platform-trio",
      "trio-flow",
      "hero-art",
      "hero-bg",
      "meander-divider",
      "footer-meander-top",
    ]) {
      expect(src, `retired Marble recipe returned to the homepage: ${banned}`).not.toContain(banned);
      expect(css, `retired Marble recipe rule returned to css: .${banned}`).not.toContain(`.${banned} {`);
    }
    expect(css, "the chrome-shiny sweep keyframes returned").not.toContain("@keyframes chrome-shiny");
  });

  // The closing CTA box (EMBER-INK-279 supersedes the 270-R8 retirement
  // — the NEW owner order makes the template the baseline): it carries
  // the REAL account action + the EVO hand-off (no faked email capture).
  it("the closing CTA box carries the signup action + the EVO hand-off", () => {
    const src = readFileSync(LANDING, "utf8");
    expect(src).toContain("ابدأ مجانًا.");
    expect(src).toContain("Start free.");
    expect(src).toContain("وقرّر لاحقًا.");
    expect(src).toContain("Decide later.");
    expect(src).toContain("أنشئ حسابك المجاني");
    expect(src).toContain("Create your free account");
    expect(src).toContain("اسأل EVO أولًا");
    expect(src).toContain("Ask EVO first");
    expect(src).toContain("onClick={openEvoFloatingChat}");
    // The retired Marble-era CTA copy stays dead.
    expect(src).not.toContain("ابدأ اليوم. وابنِ روتينًا يناسبك.");
    expect(src).not.toContain("Start today. Build a routine that fits you.");
    expect(src).not.toContain("أو تحدث مع EVO أولًا");
    expect(src).not.toContain("Or talk to EVO first");
  });

  // The programs + diet sections render the template GRIDS (the
  // carousel retirement — numbered cards / 4-col system cards).
  it("the programs and diet sections render the template grids", () => {
    const src = readFileSync(LANDING, "utf8");
    expect(src).toContain('mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3');
    expect(src).toContain("mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4");
    expect(src).toContain('tag={`0${i + 1}`}');
    expect(src).not.toContain('CarouselShell isAr={isAr} ariaLabel={isAr ? "برامج التمارين الجاهزة"');
    expect(src).not.toContain('CarouselShell isAr={isAr} ariaLabel={isAr ? "الأنظمة الغذائية الجاهزة"');
  });
});

describe("HOME-REFINE-271 — the motion-safety contract", () => {
  // The living-page motion layer: every animation is once-only,
  // transform/opacity-only, and gated by prefers-reduced-motion. The
  // .rv reveal recipe must never hide content from no-JS users (the
  // armed state exists only post-mount in React state).
  it("motion: the reveal/count-up/swap recipes exist and every keyframe respects reduced motion", () => {
    const css = readFileSync("src/app/globals.css", "utf8");
    const src = readFileSync(LANDING, "utf8");
    for (const required of [
      ".rv {",
      ".macro-track {",
      ".macro-fill {",
      ".live-dot {",
      ".swap-fade {",
    ]) {
      expect(css, `living-page recipe missing: ${required}`).toContain(required);
    }
    // Every motion recipe stands down under reduced motion.
    const reducedBlocks = css.match(/@media \(prefers-reduced-motion: reduce\)\s*\{[\s\S]*?\n\}/g) ?? [];
    const joined = reducedBlocks.join("\n");
    for (const recipe of [".rv", ".macro-fill", ".live-dot", ".swap-fade"]) {
      expect(joined, `reduced-motion guard missing for: ${recipe}`).toContain(recipe);
    }
    // The retired tab recipe stays dead (the tabs are gone).
    expect(css).not.toContain(".home-tabs");
    expect(css).not.toContain(".home-tab");
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

describe("HOME-REFINE-271 — copy voice canaries", () => {
  // K-1: «توليدات» is a mechanical pseudo-plural — the natural MSA
  // verbal noun is the only register. After the compact-card rebuild
  // the phrase survives in the two membership FAQ answers.
  it("K-1: the pseudo-plural «توليدات» stays dead; the verbal noun is the register", () => {
    const src = readFileSync(LANDING, "utf8");
    expect(src).not.toContain("توليدات");
    expect(src.match(/توليد خطط أكثر/g)?.length).toBe(2);
  });

  // K-2: the coaches H2 keeps the «featured» meaning.
  it("K-2: the featured-coaches H2 says «مميزون»", () => {
    const src = readFileSync(LANDING, "utf8");
    expect(src).toContain('"مدربون مميزون على Alkemos"');
    expect(src).not.toContain("مدربون على المنصة");
  });

  // K-6: the retired hero subtitle pairs stay dead.
  it("K-6: the retired hero subtitles stay dead", () => {
    const src = readFileSync(LANDING, "utf8");
    expect(src).not.toContain("خطتك للياقة تبدأ من هنا.");
    expect(src).not.toContain("Your fitness plan starts here.");
    expect(src).not.toContain("تدريب وتغذية وأدوات ذكية — خطة واحدة تقترب بك من هدفك.");
    expect(src).not.toContain("Training, nutrition, and smart tools — one plan that moves with you toward your goal.");
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

describe("HOME-REFINE-271 — FAQ canaries", () => {
  // The FIVE questions (Arabic anchors + independent English). Every
  // claim mirrors the implementation.
  it("the homepage FAQ answers the five hesitation-remover questions", () => {
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
      expect(src, `FAQ question missing: ${required}`).toContain(required);
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
      expect(src, `retired FAQ question returned: "${banned}"`).not.toContain(banned);
    }
  });
});

describe("HOME-REFINE-271 — homepage sample drift guard (real content, curated)", () => {
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
});
