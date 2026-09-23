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

describe("VRD-V2 — footer disclosure rebuild + surfaces contract", () => {
  // Audit C-8 (mobile footer 1,273px at 390px) + §12: below lg the five
  // service lists collapse into TWO native <details> groups; lg+ keeps the
  // six-column service map. The rebuild must never drop or fork a link.
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
  // EXACTLY twice. A count of 1 means a fork (a link lost from one
  // breakpoint); a count >2 means a stray third copy crept in.
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

  // S-5 (audit C-16): the cookie bar is theme-aware GLASS — translucent
  // card + backdrop blur, with a solid-card fallback for browsers without
  // backdrop-filter. Contrast through the glass is gated in
  // scripts/v1_contrast_matrix.py (worst-case underlay, both modes).
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
  // the three actions STACK full-width; md+ keeps the centered row and
  // the tablet/desktop floors untouched.
  it("hero: mobile CTA stacking with a quiet centered Log in + the 56vh stage floor", () => {
    const src = readFileSync(LANDING, "utf8");
    const css = readFileSync("src/app/globals.css", "utf8");
    // The stacking container (mobile column → md row).
    expect(src).toContain("flex flex-col items-stretch justify-center gap-3 md:mt-6 md:flex-row md:flex-wrap");
    // Both hero CTAs go full-width on touch and auto on md+ (paddings
    // only feed the floor — the recipe min-heights own 48/52 and 44/48).
    expect(src).toContain('className="btn-chrome w-full px-7 py-3 text-sm md:w-auto md:px-8 md:py-3 md:text-base"');
    expect(src).toContain('className="btn-outline w-full px-6 py-2.5 text-sm font-medium md:w-auto md:py-2.5 md:text-base"');
    // The quiet Log in link: 16px clearance below the stacked pair on
    // touch, back into the row on md+.
    expect(src).toContain("mt-4 self-center text-sm font-medium underline decoration-[var(--edge)] underline-offset-4 transition-opacity hover:opacity-70 md:mt-0");
    // The stage floor (mobile only — tablet/desktop floors unchanged).
    expect(css).toContain("min-height: max(56vh, calc(100vw * 713 / 1280))");
  });

  // §16.3 / C-11: the muscle chips ride ONE scroll-snap row on touch —
  // no ragged wrap, no orphaned chip; md+ reverts to the centered wrap.
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

  // §11 / C-10: below md the path cards go DENSE — icon+title one row,
  // description clamped to 2 lines, p-5, the unified .card-lift hover.
  // The plan + memberships cards drop to p-5 mobile with clamped copy.
  it("density: path cards compact on mobile; plan + memberships cards p-5 with clamped copy", () => {
    const src = readFileSync(LANDING, "utf8");
    // Path cards: dense recipe + icon/title row + 2-line clamp.
    expect(src).toContain('className="marble-card card-lift group flex h-full flex-col p-5 md:p-7"');
    expect(src).toContain('className="flex items-center gap-3 md:block"');
    expect(src).toContain("mt-2 line-clamp-2 flex-1 text-sm font-normal leading-relaxed md:line-clamp-none");
    // Plan card: p-5 mobile (md:p-10 narrative focus kept).
    expect(src).toContain('className="marble-card mx-auto max-w-4xl p-5 md:p-10"');
    // Both memberships cards: p-5 + 3-line clamped copy on touch.
    expect(src.match(/marble-card flex flex-col p-5 md:p-8/g)?.length).toBe(2);
    expect(src.match(/mt-4 line-clamp-3 flex-1 text-sm font-normal leading-relaxed md:line-clamp-none md:text-base/g)?.length).toBe(2);
  });

  // §11 food cards (C-1 VLM note): whole card stays ONE link; the title
  // carries a 2-line floor (min-h-10) so macro grids align across the
  // row; title → macros → link tightens to the gap-2 rhythm.
  it("food cards: aligned macro rows (min-h title floor) + gap-2 rhythm", () => {
    const src = readFileSync(LANDING, "utf8");
    expect(src).toContain("mt-1 min-h-10 text-base font-semibold leading-tight tracking-tight line-clamp-2");
    expect(src).toContain('className="mt-2 grid grid-cols-3 gap-1 text-[10px] font-normal"');
    expect(src).toContain('className="chrome-text mt-2 text-xs font-semibold"');
  });

  // §13.2 / C-15: the CTA sizing standard — primary 48px touch / 52px
  // md+, secondary 44px touch / 48px md+ (carousel arrows already 44px
  // on touch since V0).
  it("CTA standard: btn-chrome 48/52 · btn-outline 44/48", () => {
    const css = readFileSync("src/app/globals.css", "utf8");
    expect(css).toContain(".btn-chrome { min-height: 52px; }");
    expect(css).toContain(".btn-outline { min-height: 48px; }");
    // The mobile floors ride the recipe blocks themselves (48 primary /
    // 44 secondary) — pinned by proximity to the recipe opener.
    const chromeBlock = css.slice(css.indexOf(".btn-chrome {"), css.indexOf(".btn-chrome:hover"));
    expect(chromeBlock).toContain("min-height: 48px");
    const outlineBlock = css.slice(css.indexOf(".btn-outline {"), css.indexOf(".btn-outline:hover"));
    expect(outlineBlock).toContain("min-height: 44px");
  });

  // §13.3 / O-3 (owner-confirmed YES): the memberships card carries the
  // section's ONE filled primary; coaching keeps the quiet outline.
  it("memberships asymmetry (O-3): filled CTA on memberships, outline on coaching", () => {
    const src = readFileSync(LANDING, "utf8");
    expect(src).toContain(': "/memberships"} className="btn-chrome px-6 py-2.5 text-sm font-medium"');
    expect(src).toContain(': "/coaching"} className="btn-outline px-6 py-2.5 text-sm font-medium"');
  });

  // §11 unified hover: every INTERACTIVE homepage card family rides the
  // .card-lift recipe (2px lift + shadow deepening + firmer warm hairline,
  // reduced-motion safe); the old bare translate utility survives ONLY on
  // the tiny seal chips (a different, lighter treatment by design).
  it("unified card hover: card-lift on all six interactive card families; recipe + reduced-motion guard in css", () => {
    const src = readFileSync(LANDING, "utf8");
    const css = readFileSync("src/app/globals.css", "utf8");
    expect(src.match(/marble-card card-lift/g)?.length).toBe(6);
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
