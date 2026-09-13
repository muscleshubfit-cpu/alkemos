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
