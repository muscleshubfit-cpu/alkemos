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
 * HOME-REBUILD-258 CANARIES — the rebuilt homepage (owner directive
 * 2026-09-24: re-evaluate the homepage from scratch as a GLOBAL product
 * interface), superseding the HOME-BLUEPRINT-257 pins.
 *
 * The page tells ONE progression in NINE blocks:
 *   Promise (Hero «تدرّب بذكاء. وتغذَّ بدقة.») → Proof (the platform in
 *   numbers) → Explore (three paths) → Train («تدرّب بثقة.» 868+) →
 *   Eat («اعرف ما تأكل. خطط لما تحتاجه.» 8,830+) → Intelligence (AI
 *   planners + EVO «خطة مبنية حولك — ومدرب يواكب تقدّمك.») → Learn
 *   («تعلّم. طبّق. تقدّم.») → Free-vs-Paid («مجاني فعلًا. والترقية
 *   قرارك.») → FAQ → Final CTA.
 *
 * Guards pin:
 *   1) SINGLE-SOURCE PRICING — the Free-vs-Paid section shows REAL
 *      prices derived from memberships.ts lookups (never literals,
 *      never a full tier grid) + the honest 7-day refund line. The
 *      hero/final-CTA regions stay funnel-free (no memberships links,
 *      no subscribe CTAs).
 *   2) REAL CONTENT ENTRY POINTS — the curated homepage samples must
 *      exist in the LIVE libraries (drift guard, library-counts
 *      pattern) so Train + Eat always render actual browsable content.
 *   3) THE EVO CHAT SURFACE LAW — the section CTA opens the FLOATING
 *      widget via openEvoFloatingChat; the widget stays the ONLY chat
 *      surface. The merged Intelligence section carries quota
 *      transparency (the unified pool + the daily EVO limit).
 *   4) The account-driven CTA law (Phase 203) — signup/login for
 *      guests, the member console when signed in.
 *   5) Arabic is the native anchor; English is independent native copy
 *      — both pinned verbatim.
 */

const LANDING = "src/components/views/LandingView.tsx";
const HEADER = "src/components/SiteHeader.tsx";
const FOOTER = "src/components/SiteFooter.tsx";

describe("HOME-REBUILD-258 — homepage rebuild canaries", () => {
  // (1) The Free-vs-Paid section derives every price from the SINGLE
  //     source (memberships.ts) — no price literals, no tier grid, no
  //     subscribe-now sales CTA. The refund line states the REAL policy.
  it("the Free-vs-Paid section derives prices from memberships.ts and states the refund policy", () => {
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

  // (2) The EVO section exists, its CTA opens the FLOATING WIDGET —
  //     the only chat surface law holds — and the section carries the
  //     quota transparency facts (unified pool + daily EVO limit).
  it("the Intelligence section carries quota transparency and dispatches openEvoFloatingChat", () => {
    const src = readFileSync(LANDING, "utf8");
    expect(src, "the EVO section is missing").toContain('id="evo"');
    expect(src).toContain("openEvoFloatingChat");
    // The new headline pair + the CTA labels.
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

  // (3) The 9-block map + the real content entry points exist.
  it("the 9-block map and its browse-all links exist", () => {
    const src = readFileSync(LANDING, "utf8");
    for (const required of [
      // The section ids, in rebuild order
      'id="paths"',
      'id="train"',
      'id="eat"',
      'id="evo"',
      'id="learn"',
      'id="memberships"',
      'id="faq"',
      // The hero pair (native anchors — the SERP message match)
      "تدرّب بذكاء. وتغذَّ بدقة.",
      "Train smarter. Eat with precision.",
      // The hero supporting pair
      "منصة واحدة تجمع التدريب والتغذية والتخطيط الذكي — ومعها EVO، مدربك بالذكاء الاصطناعي. بالعربية والإنجليزية.",
      "One platform that brings training, nutrition, and smart planning together — with EVO, your AI coach, built in. In Arabic and English.",
      // The hero CTA pair + secondary explore CTA
      "ابدأ مجانًا",
      "Start free",
      "استكشف التمارين",
      "Explore exercises",
      // The proof strip (auditable numbers — verified constants only)
      'aria-label={isAr ? "المنصة بالأرقام" : "The platform in numbers"}',
      "proofStats",
      "EX_PLUS",
      "FOODS_PLUS",
      "TOOLS_COUNT",
      // The Explore path trio (Train / Eat / Track & Plan)
      "من أين تودّ أن تبدأ؟",
      "Where do you want to start?",
      'href: "/ar/exercises"',
      'href: "/exercises"',
      'href: "/ar/foods"',
      'href: "/foods"',
      'href: "/ar/tools"',
      'href: "/tools"',
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
      // The Free-vs-Paid section (new headline + real endpoints)
      "مجاني فعلًا. والترقية قرارك.",
      "Free, for real. Upgrading is your call.",
      'href={isAr ? "/ar/memberships" : "/memberships"}',
      'href={isAr ? "/ar/coaching" : "/coaching"}',
      // The Final CTA pair (owner's Arabic line + native English)
      "ابدأ اليوم. وابنِ روتينًا يناسبك.",
      "Start today. Build a routine that fits you.",
      // Locale-aware browse-all entry points inside Train/Eat
      'href={isAr ? "/ar/exercises" : "/exercises"}',
      'href={isAr ? "/ar/foods" : "/foods"}',
      // The AI planners (the merged Intelligence section CTAs)
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

  // (4) The hero + final CTA drive the account action, not the sales
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
    // SCOPED funnel guard: the HERO region (everything before the proof
    // strip) and the PAGE TAIL (FAQ + final CTA) must never link
    // memberships — the Free-vs-Paid section is the only surface that
    // does.
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

  // (5) The block ORDER: Train precedes Eat precedes EVO precedes Learn
  //     precedes Memberships — the progression is the product.
  it("the sections render in the rebuild order (Promise→Proof→Explore→Train→Eat→EVO→Learn→Memberships→FAQ)", () => {
    const src = readFileSync(LANDING, "utf8");
    const order = [
      'id="paths"',
      'id="train"',
      'id="eat"',
      'id="evo"',
      'id="learn"',
      'id="memberships"',
      'id="faq"',
    ].map((needle) => src.indexOf(needle));
    for (let i = 1; i < order.length; i++) {
      expect(order[i], `section ${i} out of rebuild order`).toBeGreaterThan(order[i - 1]);
    }
    // The proof strip sits between the hero and the paths (the research-
    // driven placement: proof directly under the promise).
    const proofAt = src.indexOf('aria-label={isAr ? "المنصة بالأرقام" : "The platform in numbers"}');
    expect(proofAt).toBeGreaterThan(-1);
    expect(proofAt).toBeLessThan(pathsOrderOf(src));
  });
});

/** Helper: the paths section position (kept tiny + local to this file). */
function pathsOrderOf(src: string): number {
  return src.indexOf('id="paths"');
}

describe("HOME-REBUILD-258 — header/footer contract (unchanged law)", () => {
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

  // (7) The footer is the ecosystem service map with the owner's
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

  // §16.3 / C-11: the muscle chips ride ONE scroll-snap row on touch.
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
  it("density: path cards compact on mobile; memberships cards p-5", () => {
    const src = readFileSync(LANDING, "utf8");
    // Path cards: dense recipe + icon/title row + 2-line clamp.
    expect(src).toContain('className="marble-card card-lift group flex h-full flex-col p-5 md:p-7"');
    expect(src).toContain('className="flex items-center gap-3 md:block"');
    expect(src).toContain("mt-2 line-clamp-2 flex-1 text-sm font-normal leading-relaxed md:line-clamp-none");
    // The three Free-vs-Paid cards: p-5 mobile (md:p-8).
    expect(src.match(/marble-card flex flex-col p-5 md:p-8/g)?.length).toBe(2);
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
  // .card-lift recipe; the old bare translate utility survives ONLY on
  // the tiny seal chips.
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

describe("HOME-REBUILD-258 — copy voice canaries", () => {
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

describe("HOME-REBUILD-258 — FAQ canaries", () => {
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

  // The Train section keeps the browse-paths-first law.
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

describe("HOME-REBUILD-258 — homepage sample drift guard (real content, curated)", () => {
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
    // Every exercise sample carries a SELF-HOSTED WebP image.
    for (const ex of samples.exercises) {
      expect(ex.image.startsWith("/images/exercises/")).toBe(true);
      expect(ex.image.endsWith(".webp")).toBe(true);
    }
  });
});
