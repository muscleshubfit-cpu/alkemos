import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { scanArabicDialect, scanLatinContamination } from "@/lib/blog-msa";

/**
 * PHASE 178 (§12.42) — marketing-surface MSA law. The 2026-09-12 live
 * content audit found the two highest-authority Arabic marketing pages
 * (/ar/evo — 12 STRONG Egyptian markers, /ar — 5) plus coaching/
 * memberships FAQ copy written in Egyptian dialect while the whole blog
 * + tools surface rides the Pan-Arab MSA law 175/176. The owner approved
 * unification; these guards keep the marketing surface MSA forever.
 *
 * Same tokenizer as tool-msa-surface.test.ts (comments stripped — law
 * TEXTS quoting dialect examples can never false-positive; string
 * literals with Arabic feed the scanners; EN-only literals are skipped
 * for Latin; ${...} interpolation is code, not copy).
 */

const MARKETING_SURFACE_FILES = [
  // EVO landing (shared by /evo and /ar/evo — the AR mirror re-exports)
  "src/app/evo/page.tsx",
  // Homepage landing (shared by / and /ar)
  "src/components/views/LandingView.tsx",
  // Memberships (FAQ + tier copy — the §12.41-هـ pending item, now MSA)
  "src/app/memberships/page.tsx",
  // Coaching landing (EVO FAQ + program copy)
  "src/app/coaching/page.tsx",
  // Phase 193 (§12.50-B3): the two B2B/B2C marketing surfaces converted
  // from full-Egyptian copy to Pan-Arab MSA in the same pass.
  "src/components/views/AffiliateProgramView.tsx",
  "src/app/for-coaches/page.tsx",
  "src/app/for-coaches/content.ts",
  // Phase 193 (§12.50-B3): the tools hub + the foods hub intro are public marketing
  // headlines too (كوبساتك / شوف الماكروز findings).
  "src/app/tools/page.tsx",
  "src/components/foods/FoodsExplorer.tsx",
  // Phase 194 (Copy Refinement Pass): the remaining public surfaces
  // converted to MSA — the food detail CTA, programs empty state,
  // contact hero, the floating EVO widget (public on every page), the
  // auth/checkout funnel, and the for-coaches AR mirror metadata.
  "src/app/foods/[slug]/FoodDetailClient.tsx",
  "src/app/programs/page.tsx",
  "src/components/views/ContactView.tsx",
  "src/components/EvoFloatingWidget.tsx",
  "src/components/views/AuthView.tsx",
  "src/app/for-coaches/register/page.tsx",
  "src/app/ar/for-coaches/layout.tsx",
  "src/app/ar/for-coaches/register/layout.tsx",
  // PHASE 204 (owner order 2026-09-15 — internal-pages MSA cleanup): the
  // program library data + program detail CTA, the affiliate share
  // templates + toolkit UI, the static pages (about/terms/faq visible
  // copy), the FAQ JSON-LD source, and the foods-library labels joined
  // the law — the whole public non-blog surface is MSA-guarded now.
  "src/lib/workout-programs.ts",
  "src/app/programs/[slug]/ProgramDetailClient.tsx",
  // NOTE: src/lib/affiliate-content.ts is deliberately NOT in the scanned
  // manifest — its escapeHtml() quote-regexes desync the naive string
  // tokenizer (pre-existing). It stays guarded by the raw Phase 204
  // banned-phrase canary below.
  "src/components/views/AffiliateToolkit.tsx",
  "src/components/views/StaticPageView.tsx",
  "src/lib/faq-content.ts",
  "src/lib/tools-shared.ts",
  "src/lib/foods-shared.ts",
  "src/components/foods/FoodsFilters.tsx",
] as const;

const AR_RUN = /[\u0600-\u06FF]/;

interface SurfaceCopy {
  arLiterals: string[];
  dialectText: string;
}

function extractCopy(src: string): SurfaceCopy {
  let out = "";
  const literals: string[] = [];
  let buf = "";
  let inString: '"' | "'" | "`" | null = null;
  for (let i = 0; i < src.length; i++) {
    const c = src[i];
    const next = i + 1 < src.length ? src[i + 1] : "";
    if (inString) {
      if (c === "\\") {
        buf += c + next;
        i++;
        continue;
      }
      if (c === inString) {
        if (buf) literals.push(buf);
        buf = "";
        inString = null;
        out += " ";
        continue;
      }
      buf += c;
      continue;
    }
    if (c === "/" && next === "/") {
      while (i < src.length && src[i] !== "\n") i++;
      out += " ";
      continue;
    }
    if (c === "/" && next === "*") {
      i += 2;
      while (i < src.length && !(src[i] === "*" && src[i + 1] === "/")) i++;
      i++;
      out += " ";
      continue;
    }
    if (c === '"' || c === "'" || c === "`") {
      inString = c;
      continue;
    }
    out += c;
  }
  const arLiterals = literals.filter((l) => AR_RUN.test(l));
  return { arLiterals, dialectText: out + "\n" + literals.join("\n") };
}

function loadSurface(rel: string): SurfaceCopy {
  return extractCopy(readFileSync(rel, "utf8"));
}

describe("marketing-surface MSA (Phase 178 — §12.42)", () => {
  it.each(MARKETING_SURFACE_FILES)(
    "dialect law 175: %s — zero STRONG markers, fewer than 5 weak",
    (rel) => {
      const { dialectText } = loadSurface(rel);
      const scan = scanArabicDialect(dialectText);
      expect(
        scan.strong,
        `strong dialect markers: ${JSON.stringify(scan.strongHits)}`,
      ).toBe(0);
      expect(
        scan.weak,
        `weak dialect markers: ${JSON.stringify(scan.weakHits)}`,
      ).toBeLessThan(5);
    },
  );

  it.each(MARKETING_SURFACE_FILES)(
    "marketing Latin law: %s — no bare 'vs' / 'limits' inside Arabic copy",
    (rel) => {
      // The audit's two Latin-in-Arabic finds on the marketing surface:
      // «EVO للزوار vs EVO للمشتركين» and «الزوار بـ limits» — the MSA
      // rewrite uses «مقابل» and «بحدود استخدام». Pin both classes.
      const { arLiterals } = loadSurface(rel);
      const offenders = arLiterals.filter((l) =>
        /\b(?:vs|limits?)\b/i.test(l.replace(/\$\{[^}]*\}/g, " ")),
      );
      expect(
        offenders,
        `bare Latin "vs"/"limits" in Arabic copy: ${JSON.stringify(offenders)}`,
      ).toEqual([]);
    },
  );

  it("EVO page: the hero/subtitle copy is MSA, not dialect (the live finding)", () => {
    const src = readFileSync("src/app/evo/page.tsx", "utf8");
    // The exact dialect phrases the live audit found on /ar/evo — none
    // of them may return in ANY string literal.
    for (const banned of [
      "مش مجرد شات بوت",
      "عشان يساعدك",
      "بيرد على أسئلتك",
      "إزاي EVO",
      "بيشتغل",
      "دلوقتي",
      "مفيش زيادة",
      "شوف الباقات",
    ]) {
      expect(src, `dialect phrase returned: "${banned}"`).not.toContain(banned);
    }
  });

  it("LandingView: the CTA/FAQ dialect phrases stay dead (the live finding)", () => {
    const src = readFileSync("src/components/views/LandingView.tsx", "utf8");
    for (const banned of [
      "دلوقتي مجانًا",
      "مالكش عذر",
      "علشان تفتح",
      "اللي عايزين",
      "كام عدد",
      "أكتر من 868",
      "أيوه بالكامل",
    ]) {
      expect(src, `dialect phrase returned: "${banned}"`).not.toContain(banned);
    }
  });

  it("memberships/coaching FAQ: the documented §12.41-هـ dialect stays dead", () => {
    const memberships = readFileSync("src/app/memberships/page.tsx", "utf8");
    const coaching = readFileSync("src/app/coaching/page.tsx", "utf8");
    for (const banned of ["مفيش تجربة مجانية", "هتفضل شغالة", "لو ما جدّدتش"]) {
      expect(memberships, `dialect phrase returned: "${banned}"`).not.toContain(banned);
    }
    for (const banned of ["مش مجرد شات بوت", "بتتبني", "وتقدر تطلب", "بكل حاجة"]) {
      expect(coaching, `dialect phrase returned: "${banned}"`).not.toContain(banned);
    }
  });

  // PHASE 193 (§12.50-B3) — the scanner missed b-prefixed Egyptian verbs
  // and a few lexical items; every phrase REMOVED in the copy audit is
  // pinned dead here (the canary law: removed copy never returns).
  it("Phase 193 copy audit: the removed Egyptian phrases stay dead across the marketing surface", () => {
    const surfaces: Record<string, string[]> = {
      // Phase 193 lists — extended in Phase 194 with the phrases removed by
      // the Copy Refinement Pass (merged per-file; no duplicate keys).
      "src/app/coaching/page.tsx": ["بيحلل الأنماط", "إيه اللي شغال", "بيستناك", "ابدأ تحوّلي", "المدربين حقيقيين", "كل أداة محتاجها", "EVO معاك", "بتتعدل مع تقدمك"],
      "src/components/views/LandingView.tsx": ["اختار وابدأ", "قبل ما تاكلها", "ابني بيزنسك", "بدون تخطيط زيادة", "10 دولار بس", "تعرّف على مدربينا المعتمدين", "كوتش بيتابعك", "أسعارك إيدك", "أدوات المنصة معاك", "شغال معاك", "صفر٪ عمولة", "Your complete fitness platform.", "منصتك الرياضية المتكاملة."],
      "src/app/tools/page.tsx": ["كوبساتك", "شوف الماكروز"],
      "src/components/foods/FoodsExplorer.tsx": ["شوف السعرات", "اللي محتاجها"],
      "src/components/views/AffiliateProgramView.tsx": ["مفيش معالجة دفعات", "إزاي بيشتغل", "لمين ده مناسب", "بتاعك", "هتلاقي رابط"],
      "src/app/for-coaches/page.tsx": ["اقبض بنفسك", "ضيف عملاءك", "شوف العضويات", "يستهل يشتغل", "عايز مميزات", "بيتم من محفظتك", "كوتش بيتابع عميله", "0% Commission — fixed fee only"],
      "src/app/for-coaches/content.ts": ["بتدفع", "مين اللي", "إزاي بحصّل", "إيه اللي بيدفعه", "هيبقوا تابعين", "تقدر تشترك"],
      "src/lib/i18n.tsx": ["2 meal + 2 exercise swaps / day", "Unlimited daily swaps"],
      // Phase 194 — the newly-converted surfaces pin their removed phrases:
      "src/app/foods/[slug]/FoodDetailClient.tsx": ["عايز توصل", "دوس على زرار", "عايز خطة وجبات"],
      "src/app/for-coaches/register/page.tsx": ["بنحوّلك دلوقتي", "عندك حساب بالفعل"],
      "src/app/ar/for-coaches/layout.tsx": ["في إيدك", "بتحددها", "إنت اللي"],
      "src/components/views/AuthView.tsx": ["عشان تكمّل", "هترجع تلقائيًا"],
      "src/components/EvoFloatingWidget.tsx": ["إزاي أعمل", "عايز برنامج", "جرب تاني", "عشان تكمل"],
      "src/app/programs/page.tsx": ["مفيش برامج"],
      "src/components/views/ContactView.tsx": ["ابعتلنا رسالة وهنرد"],
      "src/app/evo/page.tsx": ["وتستمر معك على كل جهاز", "يتذكّر وزنك وهدفك وتقدّمك"],
    };
    for (const [rel, bannedList] of Object.entries(surfaces)) {
      const src = readFileSync(rel, "utf8");
      for (const banned of bannedList) {
        expect(src, `${rel}: removed phrase returned: "${banned}"`).not.toContain(banned);
      }
    }
  });

  // PHASE 193 — claims-accuracy canaries (the P0 findings): fabricated
  // testimonials and the «500+ clients» claim must never return, and the
  // dead wrong i18n swap claims stay deleted.
  it("Phase 193 claims honesty: no fabricated testimonials / client counts / wrong swap limits", () => {
    const coaching = readFileSync("src/app/coaching/page.tsx", "utf8");
    for (const banned of [
      "randomuser.me",
      "500+ clients",
      "+500 عميل",
      "Real results",
      "نتائج حقيقية",
      "Lost 12kg in 3 months",
      "testimonialsData",
      "TestimonialCard",
    ]) {
      expect(coaching, `fabricated-claim string returned: "${banned}"`).not.toContain(banned);
    }
    const i18n = readFileSync("src/lib/i18n.tsx", "utf8");
    for (const banned of ["feat.swaps2", "feat.swapsUnlimited"]) {
      expect(i18n, `dead wrong-claims key returned: "${banned}"`).not.toContain(banned);
    }
  });

  // PHASE 195 (owner directive — numbers-as-proof + swaps clarity): (1) the
  // tools count is 8 (not 5) and the homepage derives ALL content-volume
  // numbers from the shared verified constants — the hardcoded literals may
  // not return; (2) bare «swaps» wording that could read as a full plan
  // regeneration is replaced with «meal/exercise swaps» everywhere the
  // limits are shown; (3) "+" marks content volume ONLY — membership limits
  // never carry it.
  it("Phase 195: dynamic counts + swaps clarity canaries across the marketing surface", () => {
    const surfaces: Record<string, string[]> = {
      "src/components/views/LandingView.tsx": [
        "8830",
        "5 حاسبات",
        "6 تبديلات أسبوعيًا",
        "6 تبديلات أسبوعياً",
        "3 تبديلات/أسبوع",
        "6 تبديلات/أسبوع",
        "3 swaps/week",
        "6 swaps/week",
        "868+ تمرين\"",
        "868+ EXERCISES\"",
        "8830+ صنفًا",
        "8,830+ FOODS\"",
      ],
      "src/lib/memberships.ts": [
        "8830",
        "5 حاسبات",
        "5 free fitness calculators",
        "EVO: 3 تبديلات/أسبوع",
        "EVO: 6 تبديلات/أسبوع",
        "EVO: 3 swaps/week",
        "EVO: 6 swaps/week",
        "قاعدة بيانات الأكلات",
        "feature: \"EVO: تبديلات\"",
        "featureEn: \"EVO: Swaps\"",
      ],
      "src/app/memberships/layout.tsx": ["6 swaps/week"],
      "src/lib/faq-content.ts": ["3 swaps/week", "3 استبدالات", "كم عدد الاستبدالات", "ويقترح تبديلات ذكية. متاح"],
      "src/components/views/StaticPageView.tsx": [
        "3 swaps/week",
        "6 swaps/week",
        "3 تبديلات/أسبوع",
        "6 تبديلات/أسبوع",
        "3 تبديلات أسبوعياً",
        "6 تبديلات أسبوعياً",
        "8830",
        "868-exercise",
        "8,830-food",
        "كم تبديل أسبوعياً",
        "heading: \"Swaps\"",
        "heading: \"التبديلات\"",
      ],
      "src/lib/comparisons.ts": [
        "six free fitness calculators",
        "all six calculators",
        "six free calculators",
        "ست حاسبات",
        "doubles plan limits",
        "يُضاعف حدود الخطط",
        "8,830-food",
        "868-exercise",
        "(868 exercises)",
        "(868 تمرينًا)",
        "alkemosValue: \"868 exercises\"",
        "8,830 طعام",
      ],
      "src/lib/seo.ts": ["8830"],
    };
    for (const [rel, bannedList] of Object.entries(surfaces)) {
      const src = readFileSync(rel, "utf8");
      for (const banned of bannedList) {
        expect(src, `${rel}: Phase 195 phrase returned: "${banned}"`).not.toContain(banned);
      }
    }
    // (4) The dynamic contract: the homepage + memberships derive their
    // numbers from the shared constants (grow automatically with data).
    const landing = readFileSync("src/components/views/LandingView.tsx", "utf8");
    for (const required of ["EX_PLUS", "FOODS_PLUS", "TOOLS_PLUS"]) {
      expect(landing, `dynamic count constant missing: ${required}`).toContain(required);
    }
    // (5) The tools hub + memberships consume the single source.
    const toolsPage = readFileSync("src/app/tools/page.tsx", "utf8");
    expect(toolsPage).toContain('from "@/lib/tools-shared"');
    const memberships = readFileSync("src/lib/memberships.ts", "utf8");
    expect(memberships).toContain('from "@/lib/tools-shared"');
    // (6) The Memberships page carries the owner's swaps clarification.
    const membershipsPage = readFileSync("src/app/memberships/page.tsx", "utf8");
    expect(membershipsPage).toContain("دون إعادة إنشاء الخطة كاملة");
    expect(membershipsPage).toContain("never a full plan regeneration");
  });

  // PHASE 196 (owner directive — copy micro-fixes): the four error classes
  // may not return: (1) a bare «5 calculators» tools-count phrase on the
  // homepage (the count is 8+ — the «eight free tools — five calculators
  // (…)» enumeration lives only in comparisons/llms, never as a count
  // claim); (2) the double-marked «أكثر من 868+» — a count carries EITHER
  // «أكثر من N» OR «N+», never both, and AR/EN stay in the same marking;
  // (3) user-facing copy of the RETIRED weekly generation cap (1+1 / 2+2 —
  // the unified monthly pool is the only truth; memberships.ts keeps the
  // historical code comment, which is not copy); (4) copy implying EVO
  // belongs to Coaching alone (EVO is part of every membership — coaching
  // includes it in full, zero entitlement change).
  it("Phase 196: tools-count + count-marking + retired weekly cap + EVO-ownership canaries", () => {
    const surfaces: Record<string, string[]> = {
      "src/components/views/LandingView.tsx": [
        "the 5 calculators",
        "الحاسبات الخمس",
        "5 حاسبات",
        "أكثر من ${EX_PLUS}",
        "أكثر من 868",
      ],
      "src/lib/seo.ts": ["أكثر من 868", "868-exercise"],
      "src/lib/authors.ts": ["868-exercise", "الـ868 تمرينًا"],
      "src/app/ar/meal-planner/layout.tsx": ["8830"],
      "src/app/ai-workout-planner/page.tsx": ["أكثر من 868"],
      "src/lib/blog-category-content.ts": ["868 تمريناً", "868 entries"],
      "src/app/coaching/page.tsx": [
        "not a separate subscription",
        "لا اشتراك منفصل",
        "جزء من باقة الكوتشينج",
      ],
    };
    for (const [rel, bannedList] of Object.entries(surfaces)) {
      const src = readFileSync(rel, "utf8");
      for (const banned of bannedList) {
        expect(src, `${rel}: Phase 196 phrase returned: "${banned}"`).not.toContain(banned);
      }
    }
    // (3) The RETIRED weekly generation cap (1+1 / 2+2) may never appear on
    // a user-facing marketing surface.
    for (const rel of [
      "src/components/views/LandingView.tsx",
      "src/app/memberships/layout.tsx",
      "src/lib/faq-content.ts",
      "src/components/views/StaticPageView.tsx",
      "src/lib/comparisons.ts",
    ]) {
      const src = readFileSync(rel, "utf8");
      for (const banned of ["1+1", "2+2", "weekly cap"]) {
        expect(src, `${rel}: retired weekly-cap phrase returned: "${banned}"`).not.toContain(banned);
      }
    }
    // (4) The unified EVO-ownership message: the coaching page carries the
    // every-membership fact in BOTH languages.
    const coaching = readFileSync("src/app/coaching/page.tsx", "utf8");
    expect(coaching).toContain("part of every Alkemos membership");
    expect(coaching).toContain("جزء من كل عضويات Alkemos");
  });

  // PHASE 197 (owner directive — competitor comparison tables refresh):
  // the three /compare pages + the shared comparisons.ts data must carry
  // only VERIFIED-CURRENT competitor facts (re-verified 2026-09-14 against
  // the competitors' own pages) and must reflect the CURRENT Alkemos
  // service set (8 free tools · 868+/8,830+ libraries · Coaching) — stale
  // numbers and unverified claims may never return.
  it("Phase 197: competitor-comparison accuracy + Alkemos service coverage canaries", async () => {
    const src = readFileSync("src/lib/comparisons.ts", "utf8");
    // Stale / unverified competitor claims (banned):
    for (const banned of [
      "6 free (calorie", // tools miscount — 8 tools since Phase 195
      "5 calculators", // 2026-09-15 accuracy fix: 4 calculators + water tracker
      "خمس حاسبات", // same miscount in Arabic
      "2,100", // stale ExRx count (2,200+ verified from exrx.net)
      "350M", // stale MFP user count (280M+ company-reported 2026)
      "~$95/yr", // stale Freeletics pricing
      "~$150/yr", // stale Freeletics pricing
      "roughly $150/year", // stale Freeletics body claim
      "حوالي $150/سنة", // stale Freeletics body claim (AR)
      "$5/mo ad-free", // unverified ExRx pricing claim
      "$5/month ad-free", // unverified ExRx pricing claim
      "$5/شهر", // unverified ExRx pricing claim (AR)
      "8,830 foods", // content volume always carries "+"
      "English + 8 European languages", // stale Freeletics language list
    ]) {
      expect(src, `Phase 197 stale/unverified claim returned: "${banned}"`).not.toContain(banned);
    }
    // Verified-current claims + Alkemos service coverage (required):
    for (const required of [
      "8 free tools (4 calculators, water tracker, meal planner, 2 AI planners)",
      "8,830+ foods",
      "2,200+",
      "280M+",
      "~$80/yr", // Freeletics 12-mo Training Coach (App Store, verified)
      'dataAsOf: "2026-09-15"', // re-verification date on all three (2026-09-15 refresh)
      "Premium+ tier ($24.99/month or $99.99/year)", // MFP Premium+
      "AI Nutrition Coach (meal plans & recipes — no food tracking)",
    ]) {
      expect(src, `Phase 197 verified claim missing: "${required}"`).toContain(required);
    }
    // Every comparison covers the human-coaching + affiliate services of
    // Alkemos (2026-09-15 owner directive — service coverage), and every
    // table row carries bilingual cells (the AR pages render the Ar fields).
    const { COMPARISONS } = await import("@/lib/comparisons");
    for (const c of COMPARISONS) {
      expect(
        c.rows.some((r) => r.labelEn === "Human coaching" && r.alkemosValue.length > 0),
        `${c.slug}: missing the Human coaching row`,
      ).toBe(true);
      expect(
        c.rows.some((r) => r.labelEn === "Affiliate program"),
        `${c.slug}: missing the Affiliate program row`,
      ).toBe(true);
      expect(c.dataAsOf, `${c.slug}: dataAsOf not re-verified`).toBe("2026-09-15");
      for (const r of c.rows) {
        expect(
          r.alkemosValueAr.length > 0 && r.competitorValueAr.length > 0,
          `${c.slug} row "${r.labelEn}": missing Arabic cell values`,
        ).toBe(true);
      }
      // Structural EN/AR parity: body sections align 1:1 (headings + counts).
      expect(c.bodyEn.length, `${c.slug}: bodyEn/bodyAr section count drift`).toBe(c.bodyAr.length);
      c.bodyEn.forEach((section, i) => {
        expect(
          section.paragraphs.length,
          `${c.slug}: bodyEn[${i}] paragraph count drift`,
        ).toBe(c.bodyAr[i].paragraphs.length);
      });
      // "+" law: content-volume numbers always carry "+" in table cells
      // (EN and AR cells alike — 2026-09-15 bilingual-cells refresh).
      for (const row of c.rows) {
        for (const value of [row.alkemosValue, row.competitorValue, row.alkemosValueAr, row.competitorValueAr]) {
          if (value.includes("8,830")) {
            expect(value, `row "${row.labelEn}": 8,830 without "+"`).toContain("8,830+");
          }
          if (value.includes("868")) {
            expect(value, `row "${row.labelEn}": 868 without "+"`).toContain("868+");
          }
        }
      }
    }
    // Homepage quick-comparison: heterogeneous app classes use honest
    // class-level cells (بعضها/Some) — never a bare assumption ❌.
    // PHASE 202 (owner order 2026-09-15: «قلل لغة الشرح التسويقي» — the
    // homepage quick-comparison table retired with the memberships
    // section, see homepage-adoption.test.ts): the honest-cell law now
    // applies to the /compare tables exclusively — verified by the
    // c.rows loop above over comparisons.ts. The homepage pins below
    // keep the retired table dead (it must not return as inline rows).
    const landing = readFileSync("src/components/views/LandingView.tsx", "utf8");
    expect(landing).not.toContain("appsAr:");
    expect(landing).not.toContain("appsEn:");
    expect(landing).not.toContain("comparisonRows");
  });

  // PHASE 204 (owner order — تنظيف وتوحيد النصوص في الصفحات الداخلية):
  // every phrase removed by the internal-pages cleanup stays dead, and
  // the contradictory «حجز جلسة/Book» framing of the Coaching SUBSCRIPTION
  // (ai-job-processors.ts already bans it in generated CTAs) is pinned
  // dead on the static surfaces too — the service is a subscription you
  // join, never a session you book.
  it("Phase 204: the removed internal-page phrases stay dead (dialect + old claims + terminology)", () => {
    const surfaces: Record<string, string[]> = {
      "src/lib/workout-programs.ts": [
        "الجيم", "اللي ", "عايز", "تمرينة", "الكور", "تعلية",
        "بالوزن الجسم", "في البيت", "بس. مثالي",
      ],
      "src/app/programs/[slug]/ProgramDetailClient.tsx": [
        "عايز خطة", "ليك؟", "بتعمل خطط",
      ],
      "src/lib/affiliate-content.ts": [
        "بتدور", "الرابط ده", "مفيش", "إيه الأخبار", "حابب", "بتتعمل",
        "بتوريك", "بيحمّسك", "اسكتشات", "بيأثرش", "equipment اللي",
        "affiliate link — أقدر", "رابط affiliate،",
      ],
      "src/components/views/AffiliateToolkit.tsx": [
        "بتاعك", "الرابط ده", "متشاركوش", "هتشوفها", "بتتسجل", "مكان بتعمل",
      ],
      "src/components/views/StaticPageView.tsx": [
        "هل فيه كوتش", "كوتش ذكاء", "شات بوت", "وأكلات (", "من هو EVO",
        "وصول لخطط", "من الكوتش", "الكوتش بمراجعته", "كم يستغرق رؤية نتائج",
      ],
      "src/lib/faq-content.ts": [
        "حجزه", "you can book", "Who is EVO",
      ],
      "src/app/memberships/page.tsx": [
        "كوتش بشري", "يراجعه الكوتش", 'q: isAr ? "طرق الدفع؟"',
        "Pro يعطيك صلاحيات المنصة",
      ],
      "src/app/coaching/page.tsx": [
        "من هو EVO", "Who is EVO", "مشفرة على Supabase",
        'q: isAr ? "طرق الدفع؟"', 'q: isAr ? "بياناتي آمنة؟"',
      ],
      "src/app/evo/page.tsx": ["كوتش ذكاء اصطناعي", "شات بوت"],
      "src/app/coaches/[slug]/page.tsx": ["Book private coaching"],
      "src/app/ar/coaches/[slug]/page.tsx": ["احجز متابعة"],
      "src/app/for-coaches/page.tsx": [
        "للكوتشات", "أسئلة الكوتشات", "ابدأ شغلك", "في الجيم",
      ],
      "src/app/ar/for-coaches/layout.tsx": ["فلوسك", "شغل كوتش"],
      "src/app/ar/for-coaches/register/layout.tsx": ["انشاء حساب كوتش"],
      "src/components/views/ContactView.tsx": ['"سجل دخول وافتح'],
      "src/lib/comparisons.ts": ["والجيم،"],
    };
    for (const [rel, bannedList] of Object.entries(surfaces)) {
      const src = readFileSync(rel, "utf8");
      for (const banned of bannedList) {
        expect(src, `${rel}: Phase 204 phrase returned: "${banned}"`).not.toContain(banned);
      }
    }
    // The unified replacements are present (terminology + facts):
    const workoutPrograms = readFileSync("src/lib/workout-programs.ts", "utf8");
    expect(workoutPrograms).toContain('gym: { ar: "النادي الرياضي"');
    const faqJsonld = readFileSync("src/lib/faq-content.ts", "utf8");
    expect(faqJsonld).toContain("اشتراك كوتشينج بشري منفصل يمكنك الانضمام إليه");
    expect(faqJsonld).toContain("coaching subscription you can join");
    const faqVisible = readFileSync(
      "src/components/views/StaticPageView.tsx",
      "utf8",
    );
    expect(faqVisible).toContain('heading: "هل يوجد مدرب بشري؟"');
    expect(faqVisible).toContain('heading: "ما هو EVO؟"');
    const aboutVisible = faqVisible;
    expect(aboutVisible).toContain("والأطعمة (8,830+)");
    expect(aboutVisible).toContain("4 توليدات خطط شهريًا");
    const arCoaches = readFileSync("src/app/ar/coaches/[slug]/page.tsx", "utf8");
    expect(arCoaches).toContain("اشترك في متابعة خاصة");
  });
});
