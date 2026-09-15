import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
 return twMerge(clsx(inputs))
}

/**
 * Arabic plural rule for week counts (owner order 2026-09-16:
 * «12 أسابيع» → «12 أسبوعًا»):
 *   1 → أسبوع · 2 → أسبوعين · 3–10 → أسابيع · 11+ → أسبوعًا
 * Keeps 6/8-week labels grammatical while fixing 12+ displays.
 */
export function weeksUnitAr(n: number): string {
  if (n === 1) return "أسبوع";
  if (n === 2) return "أسبوعين";
  return n >= 3 && n <= 10 ? "أسابيع" : "أسبوعًا";
}
