import { describe, it, expect } from "vitest";
import { EXERCISES, getExerciseBySlug } from "@/lib/exercises";
import { EXERCISES_COUNT } from "@/lib/exercises-shared";

/**
 * PHASE 191 (2026-09-14, owner order «نفذ المتبقى بما تراه مناسب») —
 * ARABIC EXERCISE INSTRUCTIONS + TIPS LAW.
 *
 * Root cause fixed: `instructionsAr`/`tipsAr` shipped the ENGLISH text
 * verbatim for all 868 rows, so the Arabic exercise pages rendered
 * English steps in the page body AND inside the Arabic HowTo JSON-LD
 * (steps: exercise.instructionsAr) — a language-mixing defect on both
 * the UX surface and the GEO/structured-data surface. The fix replaces
 * the arrays with real MSA translations (imperative voice, established
 * Arabic fitness terminology per the 176 Arabic-purity law). These
 * guards keep the invariant true forever — a new exercise row with
 * English instructionsAr/tipsAr FAILS the build.
 *
 * Channel note: produced by the Phase-191 batch pipeline
 * (scripts in the session workspace: extract → LLM batches with
 * fail-closed validation: non-empty · zero Latin · differs from
 * source → slug-anchored injection). The deterministic tips pair is
 * asserted verbatim below.
 */

const LATIN = /[A-Za-z]/;

describe("exercise-instructions-ar (Phase 191)", () => {
  it("every exercise instructionsAr step contains ZERO Latin letters", () => {
    const offenders: string[] = [];
    for (const e of EXERCISES) {
      for (const step of e.instructionsAr) {
        if (LATIN.test(step)) offenders.push(`${e.slug}: ${step.slice(0, 60)}`);
      }
    }
    expect(offenders.slice(0, 15), `steps with Latin: ${offenders.length} total`).toEqual([]);
    expect(offenders.length).toBe(0);
  });

  it("every exercise tipsAr string contains ZERO Latin letters", () => {
    const offenders: string[] = [];
    for (const e of EXERCISES) {
      for (const t of e.tipsAr) {
        if (LATIN.test(t)) offenders.push(`${e.slug}: ${t.slice(0, 60)}`);
      }
    }
    expect(offenders.slice(0, 15), `tips with Latin: ${offenders.length} total`).toEqual([]);
    expect(offenders.length).toBe(0);
  });

  it("every instructionsAr/tipsAr step is non-empty and differs from its EN twin (no untranslated leftovers)", () => {
    const offenders: string[] = [];
    for (const e of EXERCISES) {
      if (e.instructionsAr.length !== e.instructionsEn.length) {
        offenders.push(`${e.slug}: length parity ${e.instructionsAr.length}≠${e.instructionsEn.length}`);
        continue;
      }
      if (e.tipsAr.length !== e.tipsEn.length) {
        offenders.push(`${e.slug}: tips length parity`);
        continue;
      }
      for (let i = 0; i < e.instructionsEn.length; i++) {
        const ar = e.instructionsAr[i];
        const en = e.instructionsEn[i];
        // empty EN steps stay empty in AR (source data shape — parity law)
        if (!en.trim()) continue;
        if (!ar.trim() || ar.trim() === en.trim()) {
          offenders.push(`${e.slug}[${i}]: untranslated/empty`);
        }
      }
      for (let i = 0; i < e.tipsEn.length; i++) {
        const ar = e.tipsAr[i];
        const en = e.tipsEn[i];
        if (!en.trim()) continue;
        if (!ar.trim() || ar.trim() === en.trim()) {
          offenders.push(`${e.slug} tip[${i}]: untranslated/empty`);
        }
      }
    }
    expect(offenders.slice(0, 15), `${offenders.length} untranslated: ${offenders.slice(0, 5).join(" | ")}`).toEqual([]);
    expect(offenders.length).toBe(0);
  });

  it("every non-empty instructionsAr step is genuinely Arabic (has Arabic script)", () => {
    const ARABIC = /[\u0600-\u06FF]/;
    const offenders: string[] = [];
    for (const e of EXERCISES) {
      for (let i = 0; i < e.instructionsAr.length; i++) {
        if (!e.instructionsEn[i].trim()) continue; // empty source parity
        const step = e.instructionsAr[i];
        if (!ARABIC.test(step)) offenders.push(`${e.slug}: ${step.slice(0, 50)}`);
      }
    }
    expect(offenders.length).toBe(0);
  });

  it("the two uniform tips are the deterministic Phase-191 translations", () => {
    const ex = getExerciseBySlug("barbell-squat");
    expect(ex?.tipsAr).toEqual(["حافظ على استقامة ظهرك.", "تحكم في الحركة."]);
  });

  it("incident canaries — the audited live examples now lead with Arabic", () => {
    const situp = getExerciseBySlug("34-sit-up");
    expect(situp?.instructionsAr[0]).toBe("استلقِ على الأرض وثبّت قدميك. يجب أن تكون ركبتيك منحنيتين.");
    const machine = getExerciseBySlug("ab-crunch-machine");
    expect(machine?.instructionsAr[0]).toContain("جهاز البطن");
    expect(machine?.instructionsAr[1]).toContain("الزفير");
  });

  it("EN mirrors untouched — instructionsEn/tipsEn remain the canonical English", () => {
    const ex = getExerciseBySlug("34-sit-up");
    expect(ex?.instructionsEn[0]).toBe(
      "Lie down on the floor and secure your feet. Your legs should be bent at the knees.",
    );
    expect(ex?.tipsEn).toEqual(["Keep your back straight.", "Control the movement."]);
  });

  it("library size unchanged by the batch (guard contract)", () => {
    expect(EXERCISES.length).toBe(EXERCISES_COUNT);
    expect(EXERCISES.every((e) => e.instructionsAr.length > 0)).toBe(true);
  });
});
