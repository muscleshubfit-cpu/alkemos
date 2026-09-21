/**
 * ONE-SLUG-LAW canaries (2026-08-28j, owner: «مش مفروض ان التوليد
 * التلقائي وكذلك من لوحة الكوتش موحد؟»).
 *
 * Before this law the SAME slug logic lived in FIVE drifted copies
 * (p5-publish local slugify, blog-pipeline inline slugBase sanitize,
 * ai-jobs-client articleSlugFromTitle, ai-job-processors
 * sanitizeModelSlug, blog-admin raw post-${Date.now()}). Everything now
 * flows through src/lib/slug.ts — these canaries read the actual source
 * files and FAIL THE BUILD if any local copy reappears, so the two
 * generation paths (automated pipeline + coach panel) can never drift
 * apart again.
 */
import { describe, it, expect } from "vitest";
import { readFileSync, existsSync } from "node:fs";
import path from "node:path";
import {
  sanitizeModelSlug,
  slugifyAscii,
  articleSlugFromTitle,
  resolveSlug,
  coachSlugFromName,
} from "../slug";

const repo = (rel: string) =>
  path.resolve(process.cwd(), "src", rel);

function readSrc(rel: string): string {
  const p = repo(rel);
  expect(existsSync(p), `missing source file: ${rel}`).toBe(true);
  return readFileSync(p, "utf8");
}

describe("slug.ts — the one slug module (behavior)", () => {
  it("sanitizeModelSlug enforces the M15 latin law", () => {
    expect(sanitizeModelSlug("Best Home Workout!")).toBe("best-home-workout");
    expect(sanitizeModelSlug("أفضل-تمارين")).toBe(""); // Arabic unusable
    expect(sanitizeModelSlug("ab")).toBe(""); // min 3 chars
  });

  it("slugifyAscii is the exact p5 port (Arabic → '' BY DESIGN)", () => {
    expect(slugifyAscii("Protein Timing Guide")).toBe("protein-timing-guide");
    expect(slugifyAscii("أفضل تمارين لحرق الدهون")).toBe("");
    expect(slugifyAscii("دليل Protein العربي")).toBe("protein");
  });

  it("articleSlugFromTitle keeps the dated LAST net for Arabic titles", () => {
    expect(articleSlugFromTitle("Best Home Workout Guide!")).toBe(
      "best-home-workout-guide",
    );
    expect(articleSlugFromTitle("أفضل تمارين لحرق الدهون")).toMatch(
      /^post-\d{12}$/,
    );
  });

  it("resolveSlug chains: model slug → title latin core → dated net", () => {
    expect(resolveSlug("fat-loss-guide", "أي عنوان")).toBe("fat-loss-guide");
    expect(resolveSlug("", "Mixed دليل protein عنوان")).toBe("mixed-protein");
    expect(resolveSlug(undefined, "أفضل تمارين")).toMatch(/^post-\d{12}$/);
  });
});

describe("ONE-SLUG-LAW — no local slug copies may reappear", () => {
  it("p5-publish uses the shared module (local slugify() stays deleted)", () => {
    const src = readSrc("app/api/cron/blog/p5-publish/route.ts");
    expect(src).not.toMatch(/function\s+slugify\s*\(/);
    expect(src).toContain('@/lib/slug');
  });

  it("blog-pipeline no longer carries the inline slugBase sanitize", () => {
    const src = readSrc("lib/blog-pipeline.ts");
    expect(src).not.toContain('.replace(/[^a-z0-9]+/g, "-")');
    expect(src).toMatch(/from ["']\.\/slug["']/);
  });

  it("blog-admin no longer falls back to a raw post-${Date.now()}", () => {
    const src = readSrc("lib/blog-admin.ts");
    expect(src).not.toContain("post-${Date.now()}");
    expect(src).toContain('@/lib/slug');
  });

  it("ai-jobs-client only RE-EXPORTS the slug helper (no local body)", () => {
    const src = readSrc("lib/ai-jobs-client.ts");
    expect(src).toMatch(
      /export\s*\{\s*articleSlugFromTitle\s*\}\s*from\s*["']@\/lib\/slug["']/,
    );
    expect(src).not.toMatch(/export function articleSlugFromTitle/);
  });

  it("ai-job-processors only RE-EXPORTS sanitizeModelSlug (no local body)", () => {
    const src = readSrc("lib/ai-job-processors.ts");
    expect(src).toMatch(
      /export\s*\{\s*sanitizeModelSlug\s*\}\s*from\s*["']@\/lib\/slug["']/,
    );
    expect(src).not.toMatch(/export function sanitizeModelSlug/);
  });

  it("BlogEditorView updateTitle derives the slug from the law (no 6th local copy)", () => {
    // Found 2026-08-28k: a SIXTH drifted copy hid in the editor's
    // auto-title handler — it kept Arabic characters, so an Arabic title
    // auto-filled an Arabic slug the M15 save gate then rejected. The
    // canary reads the REAL editor source and checks EXECUTABLE code
    // (comments stripped — documenting the old pattern must stay legal).
    const src = readSrc("components/views/BlogEditorView.tsx");
    const codeOnly = src
      .replace(/\/\*[\s\S]*?\*\//g, "") // block comments
      .replace(/^\s*\/\/.*$/gm, ""); // line comments
    expect(codeOnly).not.toContain("\\u0600-\\u06FF"); // Arabic-keeping range
    expect(codeOnly).not.toMatch(/title\.toLowerCase\(\)\.replace\(/);
    expect(src).toContain("articleSlugFromTitle");
  });
});

// ── I-6 (UX-TEST-REPORT-2026-09-21 §5-6 — «slug من الاسم»): the landing
// editor's first-time suggestion derives from the coach's name. The
// function lives HERE (ONE-SLUG-LAW) — the canary also proves the
// landing route imports it instead of growing a local copy.
describe("coachSlugFromName (I-6 — the coach landing suggested slug)", () => {
  it("derives a latin name slug that obeys the coach SLUG_RE law", () => {
    expect(coachSlugFromName("Ahmed Zaki")).toBe("ahmed-zaki");
    expect(coachSlugFromName("Sara M. Hassan")).toBe("sara-m-hassan");
    for (const s of ["ahmed-zaki", "sara-m-hassan"]) {
      expect(s).toMatch(/^[a-z0-9-]{3,40}$/);
    }
  });

  it("caps at 40 chars and never ends on a hyphen", () => {
    const s = coachSlugFromName("Alexander Maximilian Bartholomew von Hohenzollern");
    expect(s.length).toBeLessThanOrEqual(40);
    expect(s).toMatch(/^[a-z0-9-]{3,40}$/);
    expect(s.endsWith("-")).toBe(false);
  });

  it("returns '' for Arabic-only names — the legacy coach-<id6> net stays", () => {
    expect(coachSlugFromName("أحمد زكي")).toBe("");
    expect(coachSlugFromName("محمد")).toBe("");
  });

  it("keeps the latin core of a mixed name and rejects junk", () => {
    expect(coachSlugFromName("Coach أحمد")).toBe("coach");
    expect(coachSlugFromName("ab")).toBe(""); // < 3 meaningful chars
    expect(coachSlugFromName("   ")).toBe("");
    expect(coachSlugFromName("")).toBe("");
  });

  it("the landing route imports the function from THE slug module (no local copy)", () => {
    const src = readSrc("app/api/coach/landing/route.ts");
    expect(src).toContain('from "@/lib/slug"');
    expect(src).toContain("coachSlugFromName(");
    expect(src).not.toMatch(/function\s+coachSlugFromName/);
  });
});
