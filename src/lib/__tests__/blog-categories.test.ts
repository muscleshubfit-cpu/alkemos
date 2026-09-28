import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import {
  BLOG_CATEGORIES,
  VALID_CATEGORY_IDS,
  normalizeCategory,
  getCategoryLabel,
} from "@/lib/blog-categories";
import { BLOG_CATEGORY_CONTENT } from "@/lib/blog-category-content";

/**
 * PHASE 192 — category registry fork guard (live incident 2026-09-14).
 *
 * The registry lived TWICE: blog.ts (client, 10 ids) and blog-server.ts
 * (server, 8 ids — fitness/wellness missing). The server category-page
 * gate rejected exactly the ids the client stored: /blog/category/fitness
 * and /wellness (+ AR mirrors) 404'd live, and the category chip on any
 * article row carrying those ids linked a 404 (live rows:
 * optimal-rest-periods-resistance-training, cold-bath-home-wellness).
 *
 * Guarded contracts:
 *   1. ONE registry — the canonical list lives ONLY in blog-categories.ts;
 *      blog.ts and blog-server.ts re-export it (no second literal copy).
 *   2. Registry ⇄ content-map parity: every canonical id has a category
 *      content page, and every content key is a canonical id.
 *   3. Canonical ids normalize to THEMSELVES (a stored `fitness` row can
 *      never normalize away to `workout` and 404 its own category URL).
 *   4. The label lookup is bilingual-complete.
 */

describe("blog-categories — single-source registry (fork guard)", () => {
  it("blog.ts re-exports — no second literal list in the client module", () => {
    const src = readFileSync("src/lib/blog.ts", "utf8");
    expect(src).toContain('from "./blog-categories"');
    expect(src).not.toMatch(/export const BLOG_CATEGORIES = \[/);
    expect(src).not.toMatch(/export function normalizeCategory/);
  });

  it("blog-server.ts re-exports — no second literal list in the server module", () => {
    const src = readFileSync("src/lib/blog-server.ts", "utf8");
    expect(src).toContain('from "./blog-categories"');
    expect(src).not.toMatch(/export const BLOG_CATEGORIES = \[/);
    expect(src).not.toMatch(/export function normalizeCategory/);
  });

  it("registry ⇄ BLOG_CATEGORY_CONTENT parity (10/10 both ways)", () => {
    const ids = BLOG_CATEGORIES.map((c) => c.id);
    const contentKeys = Object.keys(BLOG_CATEGORY_CONTENT);
    for (const id of ids) {
      expect(BLOG_CATEGORY_CONTENT[id], `id ${id} has no content page`).toBeTruthy();
    }
    expect(new Set(contentKeys).size).toBe(ids.length);
    for (const key of contentKeys) {
      expect(VALID_CATEGORY_IDS.has(key), `content key ${key} is not a canonical id`).toBe(true);
    }
  });

  it("canonical ids normalize to THEMSELVES (fitness/wellness included)", () => {
    for (const id of BLOG_CATEGORIES.map((c) => c.id)) {
      expect(normalizeCategory(id)).toBe(id);
    }
  });

  it("synonyms still map to their family (AI-hallucination cleanup intact)", () => {
    expect(normalizeCategory("training")).toBe("workout");
    expect(normalizeCategory("diet")).toBe("nutrition");
    expect(normalizeCategory("bodybuilding")).toBe("muscle-gain");
    expect(normalizeCategory("garbage-nonsense")).toBe("nutrition");
    expect(normalizeCategory(null)).toBe("nutrition");
  });

  it("labels are bilingual-complete", () => {
    expect(getCategoryLabel("fitness", "ar")).toBe("لياقة");
    expect(getCategoryLabel("fitness", "en")).toBe("Fitness");
    expect(getCategoryLabel("unknown-x", "en")).toBe("unknown-x");
  });
});

/**
 * CONTENT-AUDIT P1-8 (2026-09-28, audit §2.4) → §4.4 UNWIND (same day):
 * the five misfiled rows were migrated into blog_posts by the GHA
 * remediation channel (run 36366488858, verified post-write), so the
 * override map now carries ZERO entries. These canaries pin that end
 * state: no stale override may reappear, and the mechanism itself
 * (effectiveCategory) must keep flowing the stored category through
 * normalizeCategory.
 */
import { effectiveCategory } from "../blog-categories";

describe("effectiveCategory (content-audit P1-8 — §4.4 unwound, DB is the source)", () => {
  it("the override map carries no stale entries — the five rows live in the DB now", () => {
    const src = readFileSync("src/lib/blog-categories.ts", "utf8");
    for (const slug of [
      "red-light-therapy-muscle-recovery-mistakes",
      "foam-roller-recovery-4-week-guide",
      "4-day-upper-lower-hypertrophy-split",
      "choose-best-wearable-sleep-tracker-athletes",
      "sleep-muscle-growth-science",
    ]) {
      expect(src, `stale override for ${slug}`).not.toContain(`"${slug}"`);
    }
  });

  it("the migrated rows resolve through their (now-correct) stored category", () => {
    expect(effectiveCategory("red-light-therapy-muscle-recovery-mistakes", "wellness")).toBe("wellness");
    expect(effectiveCategory("foam-roller-recovery-4-week-guide", "wellness")).toBe("wellness");
    expect(effectiveCategory("4-day-upper-lower-hypertrophy-split", "workout")).toBe("workout");
    expect(effectiveCategory("choose-best-wearable-sleep-tracker-athletes", "fitness")).toBe("fitness");
    expect(effectiveCategory("sleep-muscle-growth-science", "science")).toBe("science");
  });

  it("stored category flows through normalizeCategory for every other slug", () => {
    expect(effectiveCategory("creatine-loading-strength-hypertrophy-guide", "supplements")).toBe("supplements");
    expect(effectiveCategory("some-unknown-post", "training")).toBe("workout");
  });

  it("all corrected targets are valid category ids (the registry shape pins this)", () => {
    for (const id of ["wellness", "workout", "fitness", "science"]) {
      expect(VALID_CATEGORY_IDS.has(id)).toBe(true);
    }
  });
});
