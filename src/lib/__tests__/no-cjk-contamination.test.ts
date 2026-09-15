import { describe, it, expect } from "vitest";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";

/**
 * PHASE 205 — no-CJK-contamination law (owner order 2026-09-15, Final
 * Internal Copy Audit). The audit found 23 machine-translation splices
 * where Chinese segments (将有助于恢复، 拉伸، 面向…) had been pasted into
 * Arabic exercise instructions shipped to users. This guard walks every
 * shipped source file, extracts STRING LITERALS only (comments are free
 * to quote CJK in dev notes), and fails on any CJK character.
 *
 * Sanctioned CJK spots (excluded): the blog-content-sanitize engine and
 * the blog/admin cleanup route — they DETECT and STRIP CJK by design —
 * plus all test files (fixtures legitimately construct contaminated
 * samples) and the blog itself (owner-excluded surface with its own
 * sanitizer). Everything else must stay CJK-free forever.
 */

const ROOT = process.cwd();
const CJK = /[\u4e00-\u9fff\u3400-\u4dbf\uf900-\ufaff]/;

/** Skip rule: blog surface (has its own sanitizer), tests, tooling. */
function isSanctioned(rel: string): boolean {
  const p = rel.replaceAll("\\", "/");
  if (p.includes("/__tests__/") || /\.test\.[cm]?[tj]sx?$/.test(p)) return true;
  if (p.startsWith("src/app/blog/") || p.includes("/blog/")) return true;
  if (/\/blog-[^/]+\.ts$/.test(p)) return true; // blog-* engine modules (incl. the sanitizer)
  if (p.startsWith("src/app/api/admin/blog/")) return true;
  return false;
}

function walk(dir: string, out: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const st = statSync(full);
    if (st.isDirectory()) walk(full, out);
    else if (/\.[cm]?[tj]sx?$/.test(entry)) out.push(full);
  }
  return out;
}

/** Extract string literals (comments stripped) — same tokenizer family
 *  as marketing-msa-surface.test.ts. */
function literals(src: string): string[] {
  const out: string[] = [];
  let buf = "";
  let inString: '"' | "'" | "`" | null = null;
  for (let i = 0; i < src.length; i++) {
    const c = src[i];
    const next = i + 1 < src.length ? src[i + 1] : "";
    if (inString) {
      if (c === "\\") { buf += c + next; i++; continue; }
      if (c === inString) { if (buf) out.push(buf); buf = ""; inString = null; continue; }
      buf += c;
      continue;
    }
    if (c === "/" && next === "/") { while (i < src.length && src[i] !== "\n") i++; continue; }
    if (c === "/" && next === "*") { i += 2; while (i < src.length && !(src[i] === "*" && src[i + 1] === "/")) i++; i++; continue; }
    if (c === '"' || c === "'" || c === "`") { inString = c; continue; }
  }
  return out;
}

describe("Phase 205 — CJK contamination law (no Chinese in shipped copy)", () => {
  it("every non-blog source file has zero CJK characters inside string literals", () => {
    const files = walk(join(ROOT, "src"))
      .map((f) => relative(ROOT, f))
      .filter((rel) => !isSanctioned(rel));
    expect(files.length, "walked source files").toBeGreaterThan(100);
    const offenders: string[] = [];
    for (const rel of files) {
      const src = readFileSync(join(ROOT, rel), "utf8");
      for (const lit of literals(src)) {
        if (CJK.test(lit)) {
          const m = lit.match(/.{0,30}[\u4e00-\u9fff][^"]{0,20}/);
          offenders.push(`${rel}: …${m?.[0] ?? lit.slice(0, 50)}…`);
        }
      }
    }
    expect(
      offenders,
      `CJK-contaminated literals (Phase 205 law):\n${offenders.join("\n")}`,
    ).toEqual([]);
  });
});
