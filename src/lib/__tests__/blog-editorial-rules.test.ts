import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
  sanitizeImageQuery,
  hasFemaleSubjectSignal,
} from "@/lib/image-safety";

/**
 * PHASE 173 (owner order — article-quality + article-page fixes) tests.
 *
 * The phase closed seven live-proven defects with prompt/render contracts
 * that are LOAD-BEARING: silent deletion of any of them reopens the
 * defect, so each law gets a read-the-source canary (the repo's Phase
 * 172 prompt-contract pattern) plus behavioral tests for the image
 * subject law:
 *
 *   1. In-article links must be visually discoverable (Alkemos brand
 *      blue + underline) — the old [&_a] override rendered them as
 *      muted-gray no-underline text (live: 5 links in the AR water
 *      article, all invisible as links).
 *   2. No duplicated closing TEXT CTA inside generated article content —
 *      the page already renders BlogMembershipCard after the article.
 *   3. The blog coach card sells the Coaching MEMBERSHIP (the real
 *      product), never a non-existent single "session".
 *   4. Unfilled AdSense slots collapse instead of reserving ~344px of
 *      dead space before the FAQ (measured live: 280px aswift host div
 *      with ZERO iframes + my-8 margins).
 *   5. Arabic articles are Pan-Arab Modern Standard Arabic — the old
 *      LANG_RULE literally requested «بنبرة مصرية/خليجية» and legacy AR
 *      articles shipped عشان×8 / مش×12 / ازاي×2.
 *   6. NO women or girls in any NEW article image (owner law 2026-09-11)
 *      — an explicit condition in query generation AND in the final
 *      selection-time verification, not a negative-prompt-only rule.
 */

const srcDir = join(process.cwd(), "src");
const libDir = join(srcDir, "lib");
const read = (p: string) => readFileSync(p, "utf-8");

const pipelineSrc = read(join(libDir, "blog-pipeline.ts"));
const researchSrc = read(join(libDir, "blog-research.ts"));
const processorsSrc = read(join(libDir, "ai-job-processors.ts"));
const blogImagesSrc = read(join(libDir, "blog-images.ts"));
const blogServerSrc = read(join(libDir, "blog-server.ts"));
const articlePageSrc = read(join(srcDir, "components", "blog", "BlogArticlePage.tsx"));
const blogComponentsSrc = read(join(srcDir, "components", "blog", "BlogComponents.tsx"));
const adSenseSrc = read(join(srcDir, "components", "AdSenseAd.tsx"));

// ─────────────────────────────────────────────────────────────────
// 1. In-article link visibility (Alkemos brand + underline)
// ─────────────────────────────────────────────────────────────────
describe("Phase 173 — in-article link styling contract", () => {
  it("the prose container styles links in brand blue WITH underline (discoverable)", () => {
    expect(articlePageSrc).toContain("[&_a]:text-[#0071e3]");
    expect(articlePageSrc).toContain("[&_a]:underline");
    expect(articlePageSrc).toContain("[&_a]:underline-offset-4");
  });

  it("the muted-gray no-underline link override is gone", () => {
    expect(articlePageSrc).not.toContain("[&_a]:no-underline");
    expect(articlePageSrc).not.toContain("[&_a]:text-[var(--muted-2)]");
  });

  it("the renderMarkdown link rule keeps the link path untouched (text + href only)", () => {
    const blogSrc = read(join(libDir, "blog.ts"));
    expect(blogSrc).toContain('if (!isSafeUrl(url)) return text; // strip unsafe links to plain text');
  });
});

// ─────────────────────────────────────────────────────────────────
// 2. Closing text-CTA removal from generated article content
// ─────────────────────────────────────────────────────────────────
describe("Phase 173 — duplicate closing text CTA removal", () => {
  it("the P4 review prompt no longer instructs a closing CTA paragraph (any variant)", () => {
    // The removal comment references the old name — the LIVE constructs
    // (const definition, instruction line, variants) must stay gone.
    expect(pipelineSrc).not.toContain("const CTA_VARIANTS");
    expect(pipelineSrc).not.toContain("Append a closing Call-to-Action paragraph");
    expect(pipelineSrc).not.toContain("أضف فقرة ختامية تدعو");
  });

  it("the P4 review prompt now explicitly BANS a closing marketing outro (cards render after the article)", () => {
    expect(pipelineSrc).toContain(
      "Do NOT append any closing call-to-action, marketing outro, or \"join Alkemos\" pitch paragraph",
    );
  });

  it("the ctaAdded report field is fully removed (type, contract, parsing)", () => {
    expect(pipelineSrc).not.toContain('ctaAdded: boolean');
    expect(pipelineSrc).not.toContain('"ctaAdded": true');
    expect(pipelineSrc).not.toContain("ctaAdded: Boolean(");
  });
});

// ─────────────────────────────────────────────────────────────────
// 3. Coach card wording — membership, never "book a session"
// ─────────────────────────────────────────────────────────────────
describe("Phase 173 — coach card sells the coaching membership", () => {
  it("the non-existent single-session CTA wording is gone in both languages", () => {
    // Doc comments quote the removed labels; the LIVE label strings
    // (the actual JSX CTA text) must stay gone.
    expect(blogComponentsSrc).not.toContain("احجز جلسة الآن");
    expect(blogComponentsSrc).not.toContain('"Book a session"');
    expect(blogComponentsSrc).not.toContain("Book a Coaching Session with Alkemos");
  });

  it("the card now offers the online-coaching membership in both languages", () => {
    expect(blogComponentsSrc).toContain("اشترك في الكوتشينج الأونلاين مع Alkemos");
    expect(blogComponentsSrc).toContain("Join Alkemos Online Coaching");
    expect(blogComponentsSrc).toContain("عضوية كوتشينج شهرية");
    expect(blogComponentsSrc).toContain("monthly coaching membership");
  });

  it("the /coaching link + checkout logic stay untouched (the landing sells exactly this membership)", () => {
    expect(blogComponentsSrc).toContain('href="/coaching"');
    const membershipCardHref = blogComponentsSrc.match(/href="\/coaching"/g) ?? [];
    expect(membershipCardHref.length).toBeGreaterThan(0);
  });
});

// ─────────────────────────────────────────────────────────────────
// 4. Unfilled AdSense slot collapse (dead space before FAQ)
// ─────────────────────────────────────────────────────────────────
describe("Phase 173 — unfilled AdSense slot collapse", () => {
  it("the component watches the official fill signals (iframe / data-ad-status)", () => {
    expect(adSenseSrc).toContain('ins.getAttribute("data-ad-status") === "filled"');
    expect(adSenseSrc).toContain('ins.querySelectorAll("iframe").length > 0');
  });

  it("an unfilled slot collapses the whole wrapper (margins included) after the grace window", () => {
    expect(adSenseSrc).toContain('adCollapsed ? "hidden" : "my-8"');
  });
});

// ─────────────────────────────────────────────────────────────────
// 5. Arabic — Pan-Arab Modern Standard Arabic editorial law
// ─────────────────────────────────────────────────────────────────
describe("Phase 173 — Arabic Pan-Arab MSA editorial law", () => {
  it("LANG_RULE.ar demands Modern Standard Arabic for all Arab readers (no dialect)", () => {
    expect(pipelineSrc).toContain("العربية الفصحى الحديثة");
    expect(pipelineSrc).toContain("Pan-Arab Modern Standard Arabic");
  });

  it("LANG_RULE.ar explicitly bans the Egyptian dialect request that produced legacy dialect content", () => {
    // The comment quotes the old rule; the LIVE rule text must not ask
    // for an Egyptian/Gulf tone anymore.
    expect(pipelineSrc).not.toContain("الفصحى المبسطة بنبرة مصرية");
    expect(pipelineSrc).toContain("ممنوع منعًا باتًا: أي لهجة محلية (مصرية أو خليجية أو غيرها)");
  });

  it("LANG_RULE.ar bans dialect-only vocabulary, literal translation, and weak grammar", () => {
    expect(pipelineSrc).toContain("عشان، مش، ازاي، بتاع");
    expect(pipelineSrc).toContain("الترجمة الحرفية عن الإنجليزية");
    expect(pipelineSrc).toContain("أخطاء النحو والإملاء");
  });

  it("LANG_RULE.ar carries the correct-title exemplar (كم من الماء أحتاج؟ not كم ماء احتاج)", () => {
    expect(pipelineSrc).toContain("كم من الماء أحتاج يوميًا؟");
    expect(pipelineSrc).toContain("لا «كم ماء احتاج»");
  });

  it("P0 research also demands Pan-Arab MSA (no Egyptian/Gulf wording)", () => {
    expect(researchSrc).toContain("Pan-Arab MSA, no local dialect");
    expect(researchSrc).not.toContain("Egyptian/Gulf friendly MSA");
  });

  it("the coach-path generator system prompt carries the same MSA law", () => {
    expect(processorsSrc).toContain("Pan-Arab Modern Standard Arabic");
    expect(processorsSrc).not.toContain("مدونة لياقة وتغذية مصرية");
  });
});

// ─────────────────────────────────────────────────────────────────
// 6. Image subject law — no women or girls in NEW article images
// ─────────────────────────────────────────────────────────────────
describe("Phase 173 — image subject law (behavioral: image-safety)", () => {
  it("hasFemaleSubjectSignal catches EN female-subject wording", () => {
    expect(hasFemaleSubjectSignal("a woman doing squats in the gym")).toBe(true);
    expect(hasFemaleSubjectSignal("woman in sportswear holding dumbbells")).toBe(true);
    expect(hasFemaleSubjectSignal("two women talking after workout")).toBe(true);
    expect(hasFemaleSubjectSignal("female athlete training outdoors")).toBe(true);
    expect(hasFemaleSubjectSignal("young girl drinking water")).toBe(true);
    expect(hasFemaleSubjectSignal("lady running on treadmill")).toBe(true);
  });

  it("hasFemaleSubjectSignal catches AR female-subject wording", () => {
    expect(hasFemaleSubjectSignal("امرأة تتمرن في الجيم")).toBe(true);
    expect(hasFemaleSubjectSignal("فتاة تشرب الماء بعد التمرين")).toBe(true);
    expect(hasFemaleSubjectSignal("نساء في صالة رياضية")).toBe(true);
    expect(hasFemaleSubjectSignal("سيدة تحمل الدمبل")).toBe(true);
    expect(hasFemaleSubjectSignal("بنات يتدربن")).toBe(true);
  });

  it("hasFemaleSubjectSignal KEEPS men and non-human subjects (adult men allowed when people needed)", () => {
    expect(hasFemaleSubjectSignal("a man doing barbell squats")).toBe(false);
    expect(hasFemaleSubjectSignal("men training in a gym")).toBe(false);
    expect(hasFemaleSubjectSignal("dumbbell rack close up")).toBe(false);
    expect(hasFemaleSubjectSignal("healthy protein meal bowl")).toBe(false);
    expect(hasFemaleSubjectSignal("empty gym interior")).toBe(false);
    expect(hasFemaleSubjectSignal("")).toBe(false);
  });

  it("no false positives on common fitness words that merely CONTAIN letters", () => {
    expect(hasFemaleSubjectSignal("together we train")).toBe(false);
    expect(hasFemaleSubjectSignal("herman hergewidget does not appear here")).toBe(false);
  });

  it("sanitizeImageQuery strips female words from search queries (bias killed at the source)", () => {
    const en = sanitizeImageQuery("woman drinking water after workout");
    expect(en.query).not.toMatch(/wom/i);
    expect(en.query).toContain("drinking water after workout");

    const cover = sanitizeImageQuery("كم من الماء تحتاجه المرأة يوميًا");
    expect(cover.query).not.toContain("المرأة");

    const ar = sanitizeImageQuery("امرأة تتمرن بالدمبل في الجيم");
    expect(ar.query).not.toContain("امرأة");
  });

  it("sanitizeImageQuery keeps male-subject queries intact", () => {
    const q = sanitizeImageQuery("man training with dumbbells");
    expect(q.query).toContain("man training with dumbbells");
  });
});

describe("Phase 173 — image subject law (source contracts)", () => {
  it("the selection gate screens every source's alt-texts for female subjects", () => {
    expect(blogImagesSrc).toContain("hasFemaleSubjectSignal(alt)");
  });

  it("the P1 image plan carries the explicit no-women owner law", () => {
    expect(pipelineSrc).toContain("PHASE 173 OWNER LAW (absolute): NEVER any woman, girl, or female subject");
    expect(pipelineSrc).toContain("if a person is ever needed, adult MEN only");
  });

  it("the coach-path image_queries contract carries the law in both languages", () => {
    expect(processorsSrc).toContain("ممنوع تمامًا أي مشهد يضم نساء أو فتيات");
    expect(processorsSrc).toContain("never any scene featuring women or girls");
  });

  it("the image_prompt tool carries the law (generation prompts, not negative-prompt-only)", () => {
    expect(processorsSrc).toContain("the image must NEVER contain women or girls");
  });
});

// ─────────────────────────────────────────────────────────────────
// PHASE 174 — admin AI tools ride the SAME blog system (owner order
// «افحص توليد مقالات وادوات الذكاء الاصطناعي من صفحة الادمن وتاكد انها
// تتبع نفس منظومة المدونة») + the AR-blog 500s incident closure
// ─────────────────────────────────────────────────────────────────
describe("Phase 174 — admin AI tools parity with the blog pipeline", () => {
  it("the coach-path (admin) generator no longer DEMANDS a closing CTA in its hard requirements", () => {
    expect(processorsSrc).not.toContain("خاتمة بدعوة لاتخاذ إجراء");
    expect(processorsSrc).not.toContain("conclusion with a call-to-action");
  });

  it("the coach-path generator now carries the Phase-173 closing-CTA BAN (cards render after the article)", () => {
    expect(processorsSrc).toContain(
      "ممنوع إضافة أي فقرة ختامية تسويقية أو دعوة للاشتراك أو انضمام Alkemos",
    );
    expect(processorsSrc).toContain(
      "do NOT append any closing call-to-action, marketing outro",
    );
  });

  it("the article_tool editor transforms carry the Pan-Arab MSA law (legacy-dialect input converts to MSA)", () => {
    // PHASE 175: the law text was EXTRACTED to src/lib/blog-msa.ts so the
    // legacy-cleanup runner rides the exact same contract (no fork). The
    // canary follows the text: the editor tools must IMPORT the law, and
    // the law itself (with the dialect→MSA conversion clause) must stay
    // intact in its new single source of truth. Behavioral coverage of
    // the law text lives in blog-msa.test.ts.
    expect(processorsSrc).toContain('AR_MSA_EDITOR_LAW } from "@/lib/blog-msa"');
    expect(processorsSrc).toContain("? AR_MSA_EDITOR_LAW");
    const msaLawSrc = read(join(libDir, "blog-msa.ts"));
    expect(msaLawSrc).toContain("عند إعادة صياغة نص موجود بالعامية حوّله إلى الفصحى");
    expect(msaLawSrc).toContain("Pan-Arab Modern Standard Arabic");
  });

  it("the editor CTA tool sells only REAL products and bans the non-existent session wording", () => {
    expect(processorsSrc).toContain("اذكر منتجات Alkemos الحقيقية فقط");
    expect(processorsSrc).toContain("NEVER a single \"book a session\" offer");
  });
});

describe("Phase 174 — slug-pool cache is JSON-safe (26 AR articles 500ed in production)", () => {
  it("the unstable_cache primitive stores ARRAYS, never Sets (Sets JSON-serialize to {})", () => {
    // The cached function must return string arrays — the exported wrapper
    // is the only place Sets are built.
    expect(blogServerSrc).not.toContain(
      "async (): Promise<{ en: Set<string>; ar: Set<string> }> => {",
    );
    expect(blogServerSrc).toContain("Promise<{ en: string[]; ar: string[] }>");
  });

  it("the exported wrapper rebuilds real Sets for every caller (API unchanged)", () => {
    expect(blogServerSrc).toContain("export async function fetchPublishedBlogSlugPools");
    expect(blogServerSrc).toMatch(/new Set\(Array\.isArray\(raw\?\.en\)/);
    expect(blogServerSrc).toMatch(/new Set\(Array\.isArray\(raw\?\.ar\)/);
  });

  it("the sanitizer normalizes pools defensively (a JSON-roundtripped Set can never 500 a page)", () => {
    const sanitizeSrc = read(join(libDir, "blog-content-sanitize.ts"));
    expect(sanitizeSrc).toContain("function toSet");
    expect(sanitizeSrc).toContain("normalizePools(pools)");
  });
});

// ─────────────────────────────────────────────────────────────────
// PHASE 176 — closing the "disappearing fixes" gaps (owner report
// «التعديلات الجديدة اختفت مرة أخرى — الدليل آخر توليد مقالين»):
// Latin contamination law, fallback pool concept-diversity, and the
// coach single-shot generator's Latin clause.
// ─────────────────────────────────────────────────────────────────
import { fallbackResearch } from "@/lib/blog-research";

describe("Phase 176 — Latin-contamination law reaches every prompt surface", () => {
  it("LANG_RULE.ar (P1 + P2 + P4) bans raw Latin mixing inside Arabic prose", () => {
    expect(pipelineSrc).toContain("ممنوع أيضًا خلط كلمات إنجليزية/لاتينية سائبة داخل الجمل العربية");
    expect(pipelineSrc).toContain("مصل اللبن (Whey)");
  });
  it("the coach single-shot generator (dispatch-fallback path) carries the same clause", () => {
    expect(processorsSrc).toContain("بلا خلط كلمات إنجليزية/لاتينية سائبة");
  });
  it("the shared law (blog-msa.ts) carries the clause the editor tools + cleanup runner ride", () => {
    const msaSrc = read(join(libDir, "blog-msa.ts"));
    expect(msaSrc).toContain("خلط كلمات إنجليزية/لاتينية سائبة");
  });
});

describe("Phase 176 — curated fallback pool: concept-level diversity (the duplicate-topic fix)", () => {
  it("both language pools carry 15 diverse topics (the live failure: 5 topics → 4th sleep article)", () => {
    expect(researchSrc).toContain("FALLBACK_TOPICS_AR");
    expect(researchSrc).toContain("FALLBACK_TOPICS_EN");
    const arCount = (researchSrc.match(/topic: "/g) || []).length;
    expect(arCount).toBeGreaterThanOrEqual(30); // 15 AR + 15 EN
  });

  it("a sleep-covered recent list filters the sleep fallback topic OUT (the 09-11 AR failure)", () => {
    const recent = [
      "كم ساعة نوم أحتاج لتنمية العضلات؟",
      "كم ساعة نوم يحتاج الرياضي لبناء العضلات؟ دليل للنتائج",
      "النوم والاستشفاء: المفتاح المنسي لنتائج أسرع في الجيم",
    ];
    const out = fallbackResearch("ar", recent).topics;
    expect(out).not.toContain("الاستشفاء والنوم: المفتاح المنسي لنتائج أسرع في الجيم");
  });

  it("a calories-covered recent list filters the calories fallback topic OUT (the 09-11 EN failure)", () => {
    const recent = ["How many calories should I eat to lose weight and build muscle?"];
    const out = fallbackResearch("en", recent).topics;
    expect(out).not.toContain("How to Calculate Your Daily Calories Accurately for Fat Loss or Bulking");
  });

  it("an empty recent list returns the full rotated pool (fresh blog startup path)", () => {
    const out = fallbackResearch("ar", []).topics;
    expect(out.length).toBeGreaterThanOrEqual(10);
  });
});
