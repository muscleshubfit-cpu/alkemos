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
 * HOME-EXPERIENCE-269 CANARIES — the living-product homepage (owner
 * directive 2026-09-24: «الصفحة تبدو كصفحة تعرض وتشرح منتجًا، وليست
 * كمنتج عالمي حي يجعل المستخدم يفهم القيمة ويشعر بها ويتفاعل معها»),
 * superseding the HOME-REBUILD-258 pins (the 9-block catalog tour).
 *
 * THE NEW ARC — «الصفحة هي أول خمس دقائق من المنتج»:
 *   Promise (Hero) → Proof (numbers that COUNT UP alive) →
 *   THE LIVING PRODUCT #start (three REAL in-page surfaces: the
 *   calorie/macro calculator on the app's own math · an EVO
 *   conversation demo · the interactive muscle-group library
 *   browser) → #train (the PLAN world) → #eat (the interactive
 *   plate) → #evo (planners + EVO + quota transparency) → #learn →
 *   #memberships (growth ladder + the three honest cards) →
 *   featured coaches → #faq → final CTA (+ the EVO door).
 *
 * Guards pin:
 *   1) SINGLE-SOURCE PRICING — unchanged law: prices derive from
 *      memberships.ts lookups (never literals, never a tier grid),
 *      the growth-ladder tier names derive from MEMBERSHIPS, and the
 *      refund line states the REAL 7-day policy.
 *   2) THE LIVING PRODUCT — the calculator runs the app's own math
 *      via fitness-math.ts (single source; the homepage may never
 *      fork the formulas); the EVO demo is LABELED illustrative and
 *      hands off to the floating widget (the CHAT SURFACE LAW); the
 *      library tab filters the REAL curated samples by categorySlug.
 *   3) REAL CONTENT ENTRY POINTS — the curated homepage samples must
 *      exist in the LIVE libraries (drift guard, library-counts
 *      pattern) — 15 exercises (2+ per muscle family, interactive
 *      filter), 8 foods, 3 programs.
 *   4) The account-driven CTA law (Phase 203) — signup/login for
 *      guests, the member console when signed in; the hero and the
 *      page tail stay funnel-free (no memberships links).
 *   5) Arabic is the native anchor; English is independent native copy
 *      — both pinned verbatim.
 */

const LANDING = "src/components/views/LandingView.tsx";
const HEADER = "src/components/SiteHeader.tsx";
const FOOTER = "src/components/SiteFooter.tsx";

describe("HOME-EXPERIENCE-269 — the living product canaries", () => {
  // (1) The Free-vs-Paid section derives every price from the SINGLE
  //     source (memberships.ts) — no price literals, no tier grid, no
  //     subscribe-now sales CTA. The refund line states the REAL policy.
  //     The growth ladder renders the MEMBERSHIPS tier names (the
  //     repositioning journey) — never hand-written tier strings.
  it("the Free-vs-Paid section derives prices + ladder tiers from memberships.ts and states the refund policy", () => {
    const src = readFileSync(LANDING, "utf8");
    // Required: the section exists and reads the SINGLE source via
    // lookups (tier names + prices derive — the page can never drift
    // from /memberships).
    expect(src, "the memberships section is missing").toContain('id="memberships"');
    expect(src).toContain('from "@/lib/memberships"');
    expect(src).toContain("MEMBERSHIPS.find");
    expect(src).toContain("MEMBERSHIPS.filter");
    // Price derivation pins (no literals anywhere).
    expect(src).toContain("paidFromMonthly");
    expect(src).toContain("coachingPriceLabel");
    expect(src).toContain("freePriceLabel");
    // The growth ladder derives its tier names from the same source.
    expect(src).toContain("const ladder = [");
    expect(src).toContain("step.tier?.nameAr");
    expect(src).toContain("step.tier?.nameEn");
    for (const banned of [
      // Price literals (memberships.ts is the single source — never here)
      "$14.99",
      "$29.99",
      "$39.99",
      "$0",
      // The full tier-grid renderer (the homepage shows THREE cards,
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

  // (2) THE LIVING PRODUCT — the interactive core exists, its three
  //     surfaces are the real product, and every law holds: the math
  //     comes from fitness-math.ts (never forked), the EVO demo is
  //     labeled and hands off to the floating widget, and the library
  //     tab filters the real samples.
  it("the living product (#start) runs the real math, the labeled EVO demo, and the sample filter", () => {
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
    // The three tab surfaces exist as tabpanels.
    expect(src.match(/role="tabpanel"/g)?.length).toBe(3);
    expect(src).toContain('hidden={startTab !== "calc"}');
    expect(src).toContain('hidden={startTab !== "evo"}');
    expect(src).toContain('hidden={startTab !== "lib"}');
    // The EVO demo is HONEST: labeled illustrative, and its CTA opens
    // the floating widget (the chat-surface law).
    expect(src).toContain("نموذج توضيحي لمحادثة");
    expect(src).toContain("AN ILLUSTRATIVE EXCHANGE");
    expect(src).toContain("أكمل المحادثة مع EVO");
    expect(src).toContain("Continue this conversation");
    // The library tab filters the real samples by categorySlug.
    expect(src).toContain("e.categorySlug === cat");
    expect(src).toContain("samples.exercises.filter");
    // The living-product headline pair (native anchors).
    expect(src).toContain("لا تقرأ عن المنصة. استخدمها الآن.");
    expect(src).toContain("Don't read about it. Use it right now.");
    // The visitor-free-proof pair.
    expect(src).toContain("تجربة حية — دون تسجيل");
    expect(src).toContain("LIVE ON THIS PAGE — NO SIGNUP");
    // The calculator CTA pair + the honest math note.
    expect(src).toContain("احسب أرقامي الآن");
    expect(src).toContain("Calculate my numbers");
    expect(src).toContain("بنفس معادلات حاسبة السعرات في المنصة");
    expect(src).toContain("The same math as the platform's calorie calculator");
  });

  // (3) The EVO CHAT SURFACE LAW (unchanged) — the Intelligence
  //     section + every EVO CTA dispatch openEvoFloatingChat; the
  //     widget stays the ONLY chat surface; quota transparency stays.
  it("every EVO surface dispatches openEvoFloatingChat and the quota transparency stays", () => {
    const src = readFileSync(LANDING, "utf8");
    expect(src, "the EVO section is missing").toContain('id="evo"');
    expect(src).toContain("openEvoFloatingChat");
    // The Intelligence headline pair + the CTA labels.
    expect(src).toContain("خطة مبنية حولك — ومدرب يواكب تقدّمك.");
    expect(src).toContain("A plan built around you — and a coach who keeps it moving.");
    expect(src).toContain("جرّب EVO");
    expect(src).toContain("Try EVO");
    // Quota transparency: the free AI-plan allowance + the daily EVO
    // messages, stated in BOTH languages.
    expect(src).toContain("monthly AI-plan allowance and 10 messages a day");
    expect(src).toContain("رصيدًا شهريًا لخطط الذكاء الاصطناعي و10 رسائل يوميًا");
    // The retired /chat route stays dead (the widget is the surface).
    expect(src).not.toContain('href="/chat"');
    expect(src).not.toContain('"/chat"');
    // The retired Phase-127 class names stay dead.
    expect(src).not.toContain("evo-hero-card");
    expect(src).not.toContain("evo-hero-art");
    // The retired headlines + feature rows stay dead.
    expect(src).not.toContain("EVO — مدربك الذكي");
    expect(src).not.toContain("EVO — Your AI Coach");
    expect(src).not.toContain("Your 24/7 Smart Coach");
    expect(src).not.toContain('"مدربك الذكي 24/7"');
    expect(src).not.toContain("Answers sized to your data");
    // The merged section retired the standalone Plan section headline.
    expect(src).not.toContain("خطة تناسبك، لا خطة تناسب الجميع.");
    expect(src).not.toContain("A plan built for you, not for everyone.");
  });

  // (4) The new block map + the real content entry points.
  it("the living-arc block map and its browse-all links exist", () => {
    const src = readFileSync(LANDING, "utf8");
    for (const required of [
      // The section ids, in the living-arc order
      'id="start"',
      'id="train"',
      'id="eat"',
      'id="evo"',
      'id="learn"',
      'id="memberships"',
      'id="faq"',
      // The hero pair (native anchors — the SERP message match)
      "تدرّب بذكاء. وتغذَّ بدقة.",
      "Train smarter. Eat with precision.",
      // The hero supporting pair points AT the living experience.
      "جرّبها الآن في هذه الصفحة",
      "Try it right on this page",
      // The hero CTA pair + the living secondary CTA
      "ابدأ مجانًا",
      "Start free",
      'href="#start"',
      // The proof strip (auditable numbers — verified constants only)
      'aria-label={isAr ? "المنصة بالأرقام" : "The platform in numbers"}',
      "proofStats",
      "EX_PLUS",
      "FOODS_PLUS",
      "TOOLS_COUNT",
      "<CountUp",
      // The Train section (the plan world) + its dual CTA
      "خطة كاملة تقودك، أسبوعًا بأسبوع.",
      "A complete plan to guide you, week by week.",
      "ابنِ خطتك بالذكاء الاصطناعي",
      "Build your plan with AI",
      "كل البرامج",
      "All programs",
      // The Eat section (the interactive plate) + section CTA
      "اعرف أرقام طبقك قبل أن تأكله.",
      "Know your plate's numbers before you eat it.",
      "استكشف قاعدة الأطعمة",
      "Explore the food database",
      // The Learn section (owner line + CTA)
      "تعلّم. طبّق. تقدّم.",
      "Learn. Apply. Progress.",
      "استكشف المحتوى",
      "Explore the articles",
      // The Free-vs-Paid section (headline + real endpoints)
      "مجاني فعلًا. والترقية قرارك.",
      "Free, for real. Upgrading is your call.",
      'href={isAr ? "/ar/memberships" : "/memberships"}',
      'href={isAr ? "/ar/coaching" : "/coaching"}',
      // The Final CTA pair (owner's Arabic line + native English)
      "ابدأ اليوم. وابنِ روتينًا يناسبك.",
      "Start today. Build a routine that fits you.",
      // The EVO door on the final band.
      "أو تحدث مع EVO أولًا",
      "Or talk to EVO first",
      // Locale-aware browse-all entry points
      'href={isAr ? "/ar/exercises" : "/exercises"}',
      'href={isAr ? "/ar/foods" : "/foods"}',
      // The AI planners (the Intelligence section CTAs)
      'href={isAr ? "/ar/ai-meal-planner" : "/ai-meal-planner"}',
      'href={isAr ? "/ar/ai-workout-planner" : "/ai-workout-planner"}',
      // The samples prop drives the content sections (server-provided
      // real data — the bundle law holds).
      "samples.exercises",
      "samples.foods",
      "samples.programs",
    ]) {
      expect(src, `content entry point missing: ${required}`).toContain(required);
    }
  });

  // (5) The hero + final CTA drive the account action, not the sales
  //     funnel: signup/login for guests, the member console when signed
  //     in — and NEITHER region links the memberships page (the
  //     Free-vs-Paid section is the only surface that does).
  it("the hero and final CTA drive the account action, not the sales funnel", () => {
    const src = readFileSync(LANDING, "utf8");
    expect(src).toContain('"/auth?mode=signup"');
    expect(src).toContain('"/auth?mode=login"');
    // The retired Phase 202/256 usage-CTA labels stay dead.
    expect(src).not.toContain("Try the Free Tools");
    expect(src).not.toContain("جرّب الأدوات المجانية");
    expect(src).not.toContain("Create your free account");
    expect(src).not.toContain("أنشئ حسابك المجاني");
    // SCOPED funnel guard: the HERO region (everything before the
    // living product) and the PAGE TAIL (FAQ + final CTA) must never
    // link memberships — the Free-vs-Paid section is the only surface
    // that does.
    const startAt = src.indexOf('id="start"');
    const faqAt = src.indexOf('id="faq"');
    expect(startAt).toBeGreaterThan(-1);
    expect(faqAt).toBeGreaterThan(startAt);
    for (const region of [src.slice(0, startAt), src.slice(faqAt)]) {
      for (const href of ['"/memberships"', '"/ar/memberships"']) {
        expect(region, `hero/final CTA region links the memberships page: ${href}`).not.toContain(href);
      }
    }
  });

  // (6) The block ORDER: the living product precedes Train precedes
  //     Eat precedes EVO precedes Learn precedes Memberships — the
  //     visitor USES the product before reading about any of it.
  it("the sections render in the living-arc order (Promise→Proof→Living→Train→Eat→EVO→Learn→Memberships→FAQ)", () => {
    const src = readFileSync(LANDING, "utf8");
    const order = [
      'id="start"',
      'id="train"',
      'id="eat"',
      'id="evo"',
      'id="learn"',
      'id="memberships"',
      'id="faq"',
    ].map((needle) => src.indexOf(needle));
    for (let i = 1; i < order.length; i++) {
      expect(order[i], `section ${i} out of the living-arc order`).toBeGreaterThan(order[i - 1]);
    }
    // The proof strip sits between the hero and the living product
    // (proof directly under the promise — the research-driven law).
    const proofAt = src.indexOf('aria-label={isAr ? "المنصة بالأرقام" : "The platform in numbers"}');
    expect(proofAt).toBeGreaterThan(-1);
    expect(proofAt).toBeLessThan(order[0]);
  });
});

describe("HOME-EXPERIENCE-269 — header/footer contract (unchanged law)", () => {
  // (7) The header carries the five core services as VISIBLE navigation
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

  // (8) The footer is the ecosystem service map with the owner's
  //     tagline pair.
  it("the footer is the service-map navigation with the tagline", () => {
    const src = readFileSync(FOOTER, "utf8");
    for (const required of [
      // Service-map column headers
      '"Training"',
      '"Nutrition"',
      '"Tools & AI"',
      '"Coaching & Services"',
      '"Company"',
      // The tagline (verbatim).
      "Built with care for the fitness community",
      "صُنع بعناية لمجتمع اللياقة",
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

describe("VRD-V2 — footer disclosure rebuild + surfaces contract", () => {
  // Audit C-8 + §12: below lg the five service lists collapse into TWO
  // native <details> groups; lg+ keeps the six-column service map. The
  // rebuild must never drop or fork a link.
  it("mobile: two native disclosure groups with 44px summary rows; desktop: the 5-column map survives", () => {
    const src = readFileSync(FOOTER, "utf8");
    // The two mobile disclosure groups (native <details>, zero JS).
    for (const required of [
      'className="footer-disc group"',
      "<details",
      "<summary",
      '"الخدمات" : "Services"',
      '"المنصة" : "Platform"',
      "min-h-11",
      "group-open:rotate-180",
      "lg:hidden",
    ]) {
      expect(src, `footer disclosure missing: ${required}`).toContain(required);
    }
    // Desktop keeps the flat service map (hidden below lg).
    expect(src).toContain("lg:grid lg:grid-cols-5");
    // The §12 type ramp landed (13px links / 11px headings).
    expect(src).toContain("text-[13px] leading-7");
    expect(src).toContain("text-[11px] font-semibold");
    expect(src).not.toContain("text-[10px] font-semibold");
  });

  // HREF-SYNC LAW: every footer link lives in BOTH the mobile disclosure
  // copy and the desktop column copy — each locale-aware href appears
  // EXACTLY twice.
  it("href-sync: every footer link href appears exactly twice (mobile + desktop copies)", () => {
    const src = readFileSync(FOOTER, "utf8");
    const hrefs = src.match(/href=\{isAr \? "[^"]+" : "[^"]+"\}/g) ?? [];
    expect(hrefs.length).toBeGreaterThanOrEqual(54);
    const counts = new Map<string, number>();
    for (const h of hrefs) counts.set(h, (counts.get(h) ?? 0) + 1);
    const offenders = [...counts.entries()].filter(([, n]) => n !== 2);
    expect(
      offenders,
      `footer hrefs not exactly ×2 (missing from one copy or duplicated): ${JSON.stringify(offenders)}`,
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

describe("VRD-V3 — homepage density & CTA standard contract", () => {
  // §16.2 / C-9: on touch the hero holds a real stage (56vh floor) and
  // the three actions STACK full-width; md+ keeps the centered row.
  it("hero: mobile CTA stacking with a quiet centered Log in + the 56vh stage floor", () => {
    const src = readFileSync(LANDING, "utf8");
    const css = readFileSync("src/app/globals.css", "utf8");
    // The stacking container (mobile column → md row).
    expect(src).toContain("flex flex-col items-stretch justify-center gap-3 md:mt-6 md:flex-row md:flex-wrap");
    // Both hero CTAs go full-width on touch and auto on md+.
    expect(src).toContain('className="btn-chrome w-full px-7 py-3 text-sm md:w-auto md:px-8 md:py-3 md:text-base"');
    expect(src).toContain('className="btn-outline w-full px-6 py-2.5 text-sm font-medium md:w-auto md:py-2.5 md:text-base"');
    // The quiet Log in link.
    expect(src).toContain("mt-4 self-center text-sm font-medium underline decoration-[var(--edge)] underline-offset-4 transition-opacity hover:opacity-70 md:mt-0");
    // The stage floor (mobile only).
    expect(css).toContain("min-height: max(56vh, calc(100vw * 713 / 1280))");
  });

  // §16.3 / C-11: the muscle chips ride ONE scroll-snap row on touch —
  // now inside the living library tab (the interaction moved; the
  // recipe law is unchanged).
  it("chips: single scroll-snap row with symmetric edge fades on touch", () => {
    const src = readFileSync(LANDING, "utf8");
    const css = readFileSync("src/app/globals.css", "utf8");
    expect(src).toContain('className="chips-row scrollbar-none mt-3"');
    for (const required of [
      ".chips-row {",
      "scroll-snap-type: x proximity",
      "flex-wrap: nowrap",
      "mask-image: linear-gradient(",
      "scroll-snap-align: start",
    ]) {
      expect(css, `chips-row recipe missing: ${required}`).toContain(required);
    }
  });

  // §11 food cards (C-1 VLM note): the food selector cards keep the
  // aligned macro rows (min-h title floor) + gap-2 rhythm — the same
  // recipe now lives inside the interactive FoodExplorer.
  it("food cards: aligned macro rows (min-h title floor) + gap-2 rhythm", () => {
    const src = readFileSync(LANDING, "utf8");
    expect(src).toContain("mt-1 min-h-10 text-base font-semibold leading-tight tracking-tight line-clamp-2");
    expect(src).toContain('className="mt-2 grid grid-cols-3 gap-1 text-[10px] font-normal"');
    expect(src).toContain('className="chrome-text mt-2 text-xs font-semibold"');
  });

  // §13.2 / C-15: the CTA sizing standard — primary 48px touch / 52px
  // md+, secondary 44px touch / 48px md+.
  it("CTA standard: btn-chrome 48/52 · btn-outline 44/48", () => {
    const css = readFileSync("src/app/globals.css", "utf8");
    expect(css).toContain(".btn-chrome { min-height: 52px; }");
    expect(css).toContain(".btn-outline { min-height: 48px; }");
    const chromeBlock = css.slice(css.indexOf(".btn-chrome {"), css.indexOf(".btn-chrome:hover"));
    expect(chromeBlock).toContain("min-height: 48px");
    const outlineBlock = css.slice(css.indexOf(".btn-outline {"), css.indexOf(".btn-outline:hover"));
    expect(outlineBlock).toContain("min-height: 44px");
  });

  // §13.3 / O-3: the Premium & Pro card carries the section's ONE filled
  // primary; Free and Coaching keep the quiet outline.
  it("memberships asymmetry (O-3): filled CTA on Premium & Pro, outline on Free + Coaching", () => {
    const src = readFileSync(LANDING, "utf8");
    expect(src).toContain(': "/memberships"} className="btn-chrome px-6 py-2.5 text-sm font-medium"');
    expect(src.match(/className="btn-outline px-6 py-2\.5 text-sm font-medium">/g)?.length).toBeGreaterThanOrEqual(2);
  });

  // §11 unified hover: every INTERACTIVE homepage card family rides the
  // .card-lift recipe. HOME-EXPERIENCE-269: five families (the retired
  // paths cards were the sixth — the exercise grid, food selectors,
  // program cards, blog cards, coach cards remain).
  it("unified card hover: card-lift on all five interactive card families; recipe + reduced-motion guard in css", () => {
    const src = readFileSync(LANDING, "utf8");
    const css = readFileSync("src/app/globals.css", "utf8");
    expect(src.match(/marble-card card-lift/g)?.length).toBe(5);
    expect(src.match(/transition-transform duration-300 hover:-translate-y-0\.5/g)?.length).toBe(1);
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
});

describe("HOME-EXPERIENCE-269 — the motion-safety contract", () => {
  // The living-page motion layer: every animation is once-only,
  // transform/opacity-only, and gated by prefers-reduced-motion. The
  // .rv reveal recipe must never hide content from no-JS users (the
  // armed state exists only post-mount in React state).
  it("motion: the reveal/count-up/swap recipes exist and every keyframe respects reduced motion", () => {
    const css = readFileSync("src/app/globals.css", "utf8");
    const src = readFileSync(LANDING, "utf8");
    for (const required of [
      ".rv {",
      ".home-tabs {",
      ".home-tab {",
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
    for (const recipe of [".rv", ".home-tab", ".macro-fill", ".live-dot", ".swap-fade"]) {
      expect(joined, `reduced-motion guard missing for: ${recipe}`).toContain(recipe);
    }
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

describe("HOME-EXPERIENCE-269 — copy voice canaries", () => {
  // K-1: «توليدات» is a mechanical pseudo-plural — the natural MSA
  // verbal noun is the only register. It appears 3× (the Premium & Pro
  // card + the two membership-related FAQ answers).
  it("K-1: the pseudo-plural «توليدات» stays dead; the verbal noun is the register", () => {
    const src = readFileSync(LANDING, "utf8");
    expect(src).not.toContain("توليدات");
    expect(src.match(/توليد خطط أكثر/g)?.length).toBe(3);
  });

  // K-2: the coaches H2 keeps the «featured» meaning.
  it("K-2: the featured-coaches H2 says «مميزون»", () => {
    const src = readFileSync(LANDING, "utf8");
    expect(src).toContain('"مدربون مميزون على Alkemos"');
    expect(src).not.toContain("مدربون على المنصة");
  });

  // K-5: the muscle chip keeps the plain transliterated register.
  it("K-5: the core chip is plain «كور» — no slash pair", () => {
    const src = readFileSync(LANDING, "utf8");
    expect(src).toContain('labelAr: "كور"');
    expect(src).not.toContain("بطن/كور");
  });

  // K-6: the retired hero subtitle pair stays dead.
  it("K-6: the retired hero subtitles stay dead", () => {
    const src = readFileSync(LANDING, "utf8");
    expect(src).not.toContain("خطتك للياقة تبدأ من هنا.");
    expect(src).not.toContain("Your fitness plan starts here.");
    expect(src).not.toContain("تدريب وتغذية وأدوات ذكية — خطة واحدة تقترب بك من هدفك.");
    expect(src).not.toContain("Training, nutrition, and smart tools — one plan that moves with you toward your goal.");
    // The 258 subtitle pair retired by the living rebuild (the new
    // pair points AT the in-page experience).
    expect(src).not.toContain("بالكل والإنجليزية.»"); // (fragment guard — the 258 line)
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

describe("HOME-EXPERIENCE-269 — FAQ canaries", () => {
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

  // The living library law: the muscle chips precede the filtered
  // samples; the retired CTA labels stay dead.
  it("the living library tab: chips precede the filtered samples; the retired CTA labels stay dead", () => {
    const src = readFileSync(LANDING, "utf8");
    const chipsAt = src.indexOf("Pick a muscle group");
    const ctaAt = src.indexOf("استكشف مكتبة التمارين كاملة");
    // The filter is DEFINED before the JSX; the rendered grid
    // (filtered.map) must come after the chips so the interaction
    // reads chips → samples in source order.
    const filterAt = src.indexOf("samples.exercises.filter");
    const gridAt = src.indexOf("filtered.map");
    expect(chipsAt, "the Pick-a-muscle-group label is missing").toBeGreaterThan(-1);
    expect(ctaAt, "the living library CTA label is missing").toBeGreaterThan(-1);
    expect(filterAt, "the exercise samples filter is missing").toBeGreaterThan(-1);
    expect(gridAt, "the filtered samples grid is missing").toBeGreaterThan(-1);
    expect(chipsAt).toBeLessThan(gridAt);
    expect(ctaAt).toBeGreaterThan(gridAt);
    // The retired quiet/duplicate bottom links stay dead.
    expect(src).not.toContain("Browse all exercises");
    expect(src).not.toContain("كل التمارين ›");
    expect(src).not.toContain("Browse all foods ›");
    expect(src).not.toContain("تصفّح كل الأطعمة ›");
    expect(src).not.toContain("All Exercises");
  });
});

describe("HOME-EXPERIENCE-269 — homepage sample drift guard (real content, curated)", () => {
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

  it("getHomeSamples returns the full curated sets with real data + 2+ exercises per muscle family", () => {
    const samples = getHomeSamples();
    expect(samples.exercises).toHaveLength(EXERCISE_SAMPLE_SLUGS.length);
    expect(samples.foods).toHaveLength(FOOD_SAMPLE_SLUGS.length);
    expect(samples.programs).toHaveLength(PROGRAM_SAMPLE_SLUGS.length);
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
    // The interactive filter law: every one of the seven muscle
    // families carries at least TWO curated samples (a filter with
    // one result is a dead filter).
    const families = ["chest", "back", "shoulders", "legs", "biceps", "triceps", "core"];
    for (const fam of families) {
      const count = samples.exercises.filter((e) => e.categorySlug === fam).length;
      expect(
        count,
        `muscle family "${fam}" carries ${count} curated samples — the interactive filter needs 2+`,
      ).toBeGreaterThanOrEqual(2);
    }
  });
});
