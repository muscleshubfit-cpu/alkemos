/**
 * Exercise Image Library — SELF-HOSTED from free-exercise-db on GitHub.
 * https://github.com/yuhonas/free-exercise-db (MIT license — attribution
 * in public/images/README.md).
 *
 * Each exercise has 2 images (0.jpg = start, 1.jpg = end).
 *
 * Batch 2 — §12.53 item 2 (2026-09-16, owner order «نفّذ دفعة 2 الخاصة
 * باستضافة صور التمارين ذاتيًا»): images were previously hot-linked
 * from raw.githubusercontent.com (not a CDN: max-age=300, rate limits,
 * and a repo move/transfer would break every exercise image). They are
 * now SELF-HOSTED as optimized WebP (q85, method 6, ORIGINAL dimensions —
 * zero visual change to content quality) under public/images/exercises/
 * with immutable long-cache headers. The source dataset's folder/number
 * naming is preserved exactly; only the extension maps .jpg → .webp.
 *
 * images.unoptimized stays true (§12.53 one-variable-per-batch law);
 * self-hosted WebP removes the need for the optimization hop anyway.
 *
 * Guard: exercise-images-selfhost.test.ts pins the mapping + on-disk
 * existence of every referenced asset. Rollback = revert this commit
 * (git history preserves the old GitHub builder).
 *
 * Usage:
 * import { getExerciseImageUrl } from "@/lib/exercise-images";
 * <img src={getExerciseImageUrl("Bench_Press/0.jpg")} />
 * → /images/exercises/Bench_Press/0.webp
 */

const IMAGE_BASE = "/images/exercises";

/**
 * Get the full image URL for an exercise image path.
 * - If path starts with "/" → local asset (e.g. "/images/categories/exercises/chest.png")
 * - If path starts with "http" → full URL (passthrough)
 * - Otherwise → self-hosted WebP asset (dataset key .jpg → .webp)
 */
export function getExerciseImageUrl(imagePath: string): string {
  if (!imagePath) return "";
  if (imagePath.startsWith("http")) return imagePath;
  if (imagePath.startsWith("/")) return imagePath;
  return `${IMAGE_BASE}/${imagePath.replace(/\.jpg$/i, ".webp")}`;
}

/**
 * Get multiple image URLs for an exercise (comma-separated imageKey).
 * Returns array of URLs.
 */
export function getExerciseImages(imageKey: string): string[] {
  if (!imageKey) return [];
  return imageKey.split(",").map((path) => getExerciseImageUrl(path.trim()));
}

// Keep old function names for backward compatibility with existing code
export function getWgerImageUrl(exerciseName: string): string | null {
  // This function is no longer used — images come from the exercise's imageKey field
  return null;
}

export function getFallbackSVG(category: string): string {
  // Simple SVG fallback for when no image is available
  const svgs: Record<string, string> = {
    chest: `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 140'><rect width='200' height='140' fill='#f5f8fc'/><rect x='0' y='0' width='200' height='2' fill='#0071e3'/><text x='100' y='70' font-size='14' font-weight='600' text-anchor='middle' fill='#475569' font-family='sans-serif'>💪</text></svg>`,
    back: `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 140'><rect width='200' height='140' fill='#f5f8fc'/><rect x='0' y='0' width='200' height='2' fill='#0071e3'/><text x='100' y='70' font-size='14' font-weight='600' text-anchor='middle' fill='#475569' font-family='sans-serif'>🔙</text></svg>`,
    shoulders: `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 140'><rect width='200' height='140' fill='#f5f8fc'/><rect x='0' y='0' width='200' height='2' fill='#0071e3'/><text x='100' y='70' font-size='14' font-weight='600' text-anchor='middle' fill='#475569' font-family='sans-serif'>🏆</text></svg>`,
    legs: `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 140'><rect width='200' height='140' fill='#f5f8fc'/><rect x='0' y='0' width='200' height='2' fill='#0071e3'/><text x='100' y='70' font-size='14' font-weight='600' text-anchor='middle' fill='#475569' font-family='sans-serif'>🦵</text></svg>`,
    biceps: `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 140'><rect width='200' height='140' fill='#f5f8fc'/><rect x='0' y='0' width='200' height='2' fill='#0071e3'/><text x='100' y='70' font-size='14' font-weight='600' text-anchor='middle' fill='#475569' font-family='sans-serif'>💪</text></svg>`,
    triceps: `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 140'><rect width='200' height='140' fill='#f5f8fc'/><rect x='0' y='0' width='200' height='2' fill='#0071e3'/><text x='100' y='70' font-size='14' font-weight='600' text-anchor='middle' fill='#475569' font-family='sans-serif'>💪</text></svg>`,
    core: `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 140'><rect width='200' height='140' fill='#f5f8fc'/><rect x='0' y='0' width='200' height='2' fill='#0071e3'/><text x='100' y='70' font-size='14' font-weight='600' text-anchor='middle' fill='#475569' font-family='sans-serif'>🎯</text></svg>`,
    cardio: `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 140'><rect width='200' height='140' fill='#f5f8fc'/><rect x='0' y='0' width='200' height='2' fill='#0071e3'/><text x='100' y='70' font-size='14' font-weight='600' text-anchor='middle' fill='#475569' font-family='sans-serif'>❤️</text></svg>`,
    default: `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 140'><rect width='200' height='140' fill='#f5f8fc'/><rect x='0' y='0' width='200' height='2' fill='#0071e3'/><text x='100' y='70' font-size='14' font-weight='600' text-anchor='middle' fill='#475569' font-family='sans-serif'>🏋️</text></svg>`,
  };
  return svgs[category] || svgs.default;
}

export function getRestDayImage(): string {
  return getFallbackSVG("default");
}

export function isBrokenImage(url: string): boolean {
  if (!url) return false;
  return url.includes("upload.wikimedia.org") || url.includes("wger.de");
}

export function resolveExerciseImage(existingUrl: string | undefined, exerciseName: string): string {
  if (existingUrl && !isBrokenImage(existingUrl)) return existingUrl;
  return getFallbackSVG("default");
}

export function getExerciseImage(exerciseName: string): string {
  return getFallbackSVG("default");
}

export const EXERCISE_CATEGORIES = [
  { id: "chest", label: "صدر", label_en: "Chest" },
  { id: "back", label: "ظهر", label_en: "Back" },
  { id: "shoulders", label: "أكتاف", label_en: "Shoulders" },
  { id: "legs", label: "أرجل", label_en: "Legs" },
  { id: "biceps", label: "بايسبس", label_en: "Biceps" },
  { id: "triceps", label: "ترايسبس", label_en: "Triceps" },
  { id: "core", label: "بطن/كور", label_en: "Core" },
  { id: "cardio", label: "كارديو", label_en: "Cardio" },
];
