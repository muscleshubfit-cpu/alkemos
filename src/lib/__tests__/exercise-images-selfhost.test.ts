import { describe, it, expect } from "vitest";
import { existsSync, readFileSync, statSync } from "node:fs";
import { resolve } from "node:path";
import { EXERCISES } from "../exercises";
import {
  getExerciseImageUrl,
  getExerciseImages,
} from "../exercise-images";

/**
 * Batch 2 law (§12.53 item 2, 2026-09-16 — owner order «نفّذ دفعة 2 الخاصة
 * باستضافة صور التمارين ذاتيًا»): every exercise image is a SELF-HOSTED
 * WebP asset under public/images/exercises/ — the raw.githubusercontent.com
 * hot-link dependency is retired (not a CDN: max-age=300, rate limits,
 * repo-move risk). The dataset's folder/number naming is preserved; only
 * the extension maps .jpg → .webp (q85, method 6, original dimensions —
 * content quality unchanged by owner law).
 *
 * Guarded contracts:
 *   1. The URL builder maps dataset .jpg keys to local .webp assets.
 *   2. Passthrough laws (http / leading-slash / empty) are unchanged.
 *   3. EVERY imageKey of EVERY exercise resolves to an existing,
 *      non-empty .webp file on disk (868 exercises × 2 images).
 *   4. The builder source contains no raw.githubusercontent.com URL.
 */
const PUBLIC_DIR = resolve(__dirname, "../../../public");

describe("exercise images self-hosting (batch 2 — §12.53 item 2)", () => {
  it("maps dataset .jpg keys to self-hosted .webp assets", () => {
    expect(getExerciseImageUrl("Bench_Press/0.jpg")).toBe(
      "/images/exercises/Bench_Press/0.webp",
    );
    expect(getExerciseImageUrl("3_4_Sit-Up/1.jpg")).toBe(
      "/images/exercises/3_4_Sit-Up/1.webp",
    );
  });

  it("keeps the passthrough laws unchanged", () => {
    expect(getExerciseImageUrl("/images/categories/exercises/chest.png")).toBe(
      "/images/categories/exercises/chest.png",
    );
    expect(getExerciseImageUrl("https://example.com/photo.jpg")).toBe(
      "https://example.com/photo.jpg",
    );
    expect(getExerciseImageUrl("")).toBe("");
  });

  it("splits comma-separated keys and maps each to its local WebP", () => {
    expect(getExerciseImages("A_Pose/0.jpg, A_Pose/1.jpg")).toEqual([
      "/images/exercises/A_Pose/0.webp",
      "/images/exercises/A_Pose/1.webp",
    ]);
  });

  it("every exercise imageKey resolves to an existing non-empty .webp on disk", () => {
    const missing: string[] = [];
    for (const ex of EXERCISES) {
      for (const url of getExerciseImages(ex.imageKey)) {
        if (!url.startsWith("/images/exercises/")) {
          missing.push(`${ex.slug}: unexpected non-local url ${url}`);
          continue;
        }
        const p = resolve(PUBLIC_DIR, url.slice(1));
        if (!existsSync(p)) {
          missing.push(`${ex.slug}: missing file ${url}`);
        } else if (statSync(p).size === 0) {
          missing.push(`${ex.slug}: empty file ${url}`);
        }
      }
    }
    expect(missing).toEqual([]);
  });

  it("the URL builder code no longer references raw.githubusercontent.com", () => {
    // Comments may narrate the migration history (repo law: history
    // narration in comments is allowed) — the CODE path must not carry
    // the retired host.
    const stripComments = (s: string) =>
      s
        .replace(/\/\*[\s\S]*?\*\//g, " ")
        .replace(/(^|[^:])\/\/[^\n]*/g, "$1 ");
    const src = stripComments(
      readFileSync(resolve(__dirname, "../exercise-images.ts"), "utf8"),
    );
    expect(src).not.toContain("raw.githubusercontent.com");
  });
});
