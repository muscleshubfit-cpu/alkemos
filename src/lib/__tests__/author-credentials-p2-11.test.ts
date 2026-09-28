import { describe, expect, it } from "vitest";
import { existsSync, statSync } from "node:fs";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { AHMED_ZAKE, getPersonSchema, getProfilePageSchema } from "../authors";
import { SOCIAL_PROFILE_URLS } from "../social";

/**
 * P2-11 canary (content-audit 2026-09-28 — «تسمية جهات الاعتماد في ملف
 * المؤسس»). The owner supplied the certificates image as the SINGLE SOURCE
 * OF TRUTH and two owner-verified Facebook profiles. Guarded contracts:
 *
 *   1. Every certificate credential names its ISSUING BODY (ACSM / ACE /
 *      ISSA / NASM) — the exact audit finding was "CPT بلا جهة إصدار".
 *   2. The credential list carries the EIGHT verified certifications and
 *      nothing invented: no certificate numbers, no dates, no membership or
 *      accreditation IDs (owner instruction: names + issuers ONLY).
 *   3. Person.sameAs carries EXACTLY the two owner-verified personal
 *      Facebook URLs — and stays disjoint from Organization.sameAs
 *      (person vs brand entity graph).
 *   4. The certificates image assets exist on disk (the visual proof).
 *   5. Both EN and AR founder profile pages render the certificates
 *      figure (bilingual parity).
 */

const PUBLIC_DIR = resolve(__dirname, "../../../public");
const EN_PAGE = resolve(__dirname, "../../app/(en)/authors/[slug]/page.tsx");
const AR_PAGE = resolve(__dirname, "../../app/(ar)/ar/authors/[slug]/page.tsx");

const EXPECTED_ISSUERS = ["ACSM", "ACE", "ISSA", "NASM"] as const;

describe("P2-11 — founder credentials: named issuers + verified profiles", () => {
  it("every certificate credential names its issuing body", () => {
    const certs = AHMED_ZAKE.credentials.filter(
      (c) => !/experience|Founder/i.test(c.en),
    );
    // the eight verified certificates from the owner-supplied image
    expect(certs).toHaveLength(8);
    for (const c of certs) {
      const namesIssuer = EXPECTED_ISSUERS.some((i) =>
        `${c.en} ${c.ar}`.includes(i),
      );
      expect(namesIssuer, `credential must name an issuer: ${c.en}`).toBe(true);
    }
  });

  it("carries the exact eight certifications as named on the certificates", () => {
    const en = AHMED_ZAKE.credentials.map((c) => c.en);
    expect(en).toContain("Certified Personal Trainer — American College of Sports Medicine (ACSM)");
    expect(en).toContain("Certified Personal Trainer — American Council on Exercise (ACE)");
    expect(en).toContain("Certified Personal Trainer — International Sports Sciences Association (ISSA)");
    expect(en).toContain("Fitness Nutrition Specialist — American Council on Exercise (ACE)");
    expect(en).toContain("Fitness Nutrition Specialist (FNS) — National Academy of Sports Medicine (NASM)");
    expect(en).toContain("Specialist in Sports Nutrition — International Sports Sciences Association (ISSA)");
    expect(en).toContain("Weight Management Specialist — American Council on Exercise (ACE)");
    expect(en).toContain("Fitness Coach — International Sports Sciences Association (ISSA)");
  });

  it("publishes NO certificate numbers, dates or membership IDs (names + issuers only)", () => {
    for (const c of AHMED_ZAKE.credentials) {
      // certificate numbers like 1800217 / 180557 / 196227 and dates like
      // 05-25-2019 must never leak into the published strings
      expect(c.en).not.toMatch(/\d{5,}/);
      expect(c.ar).not.toMatch(/\d{5,}/);
      expect(c.en).not.toMatch(/\b\d{2}[./-]\d{2}[./-]\d{2,4}\b/);
      expect(c.ar).not.toMatch(/\b\d{2}[./-]\d{2}[./-]\d{2,4}\b/);
    }
  });

  it("Person.sameAs = exactly the two owner-verified Facebook profiles", () => {
    expect(AHMED_ZAKE.sameAs).toEqual([
      "https://www.facebook.com/AhmedZakePT/",
      "https://www.facebook.com/SpEeRr/",
    ]);
    // person vs brand disjointness (entity-graph law)
    const brand = new Set<string>(SOCIAL_PROFILE_URLS);
    for (const url of AHMED_ZAKE.sameAs) {
      expect(brand.has(url), `person URL leaked into brand set: ${url}`).toBe(false);
    }
  });

  it("Person schema exposes hasCredential + sameAs for the knowledge graph", () => {
    const person = getPersonSchema(AHMED_ZAKE) as Record<string, unknown>;
    const hasCredential = person.hasCredential as string[];
    expect(hasCredential.length).toBeGreaterThanOrEqual(8);
    expect(hasCredential.some((c) => c.includes("(ACSM)"))).toBe(true);
    expect(person.sameAs).toEqual(AHMED_ZAKE.sameAs);
    // cert-supported knowsAbout additions
    const knowsAbout = person.knowsAbout as string[];
    expect(knowsAbout).toContain("Sports nutrition");
    expect(knowsAbout).toContain("Weight management");
  });

  it("ProfilePage schema mainEntity is the same Person entity", () => {
    const page = getProfilePageSchema(AHMED_ZAKE);
    const main = page.mainEntity as Record<string, unknown>;
    expect(main["@id"]).toBe(AHMED_ZAKE.profileUrl);
    expect(main.sameAs).toEqual(AHMED_ZAKE.sameAs);
  });

  it("certificates image assets exist on disk and are non-trivial", () => {
    for (const file of [
      "images/founder-certificates.webp",
      "images/founder-certificates.jpg",
    ]) {
      const p = resolve(PUBLIC_DIR, file);
      expect(existsSync(p), `missing asset: ${file}`).toBe(true);
      expect(statSync(p).size).toBeGreaterThan(50_000);
    }
  });

  it("both EN and AR founder profile pages render the certificates figure", () => {
    for (const pagePath of [EN_PAGE, AR_PAGE]) {
      const src = readFileSync(pagePath, "utf8");
      expect(src).toContain("founder-certificates.webp");
      expect(src).toContain("<figure");
      expect(src).toContain("<figcaption");
    }
  });
});
