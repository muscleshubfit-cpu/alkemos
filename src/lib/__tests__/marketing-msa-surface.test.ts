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
  // Phase 193: the tools hub + the foods hub intro are public marketing
  // headlines too (كوبساتك / شوف الماكروز findings).
  "src/app/tools/page.tsx",
  "src/components/foods/FoodsExplorer.tsx",
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
      "src/app/coaching/page.tsx": ["بيحلل الأنماط", "إيه اللي شغال", "بيستناك", "ابدأ تحوّلي", "المدربين حقيقيين"],
      "src/components/views/LandingView.tsx": ["اختار وابدأ", "قبل ما تاكلها", "ابني بيزنسك", "بدون تخطيط زيادة", "10 دولار بس", "تعرّف على مدربينا المعتمدين"],
      "src/app/tools/page.tsx": ["كوبساتك", "شوف الماكروز"],
      "src/components/foods/FoodsExplorer.tsx": ["شوف السعرات", "اللي محتاجها"],
      "src/components/views/AffiliateProgramView.tsx": ["مفيش معالجة دفعات", "إزاي بيشتغل", "لمين ده مناسب", "بتاعك", "هتلاقي رابط"],
      "src/app/for-coaches/page.tsx": ["اقبض بنفسك", "ضيف عملاءك", "شوف العضويات", "يستهل يشتغل", "عايز مميزات"],
      "src/app/for-coaches/content.ts": ["بتدفع", "مين اللي", "إزاي بحصّل", "إيه اللي بيدفعه", "هيبقوا تابعين", "تقدر تشترك"],
      "src/lib/i18n.tsx": ["2 meal + 2 exercise swaps / day", "Unlimited daily swaps"],
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
});
