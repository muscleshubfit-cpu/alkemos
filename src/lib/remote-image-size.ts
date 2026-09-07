/**
 * PHASE 139 (deep speed audit, 2026-09-07) — render-time remote-image sizing.
 *
 * WHY: images.unoptimized=true (Vercel free-tier guard) means next/image
 * passes remote URLs through untouched, so the browser downloads the FULL
 * Pexels `src.landscape` 1200x627 JPEG (~31-87KB each) for cards and
 * article heroes that render at 400-896 CSS px. The blog list page
 * measured ~350KB of Pexels card images. The Pexels CDN (imgix) honors
 * `w`/`h`/`fit=crop`/`fm=webp` query params, so the SAME stored DB url can
 * be re-sized at render time with zero pipeline changes:
 *   1200x627 jpeg 141KB -> 800x450 webp ~55KB / 600x338 webp 39KB.
 *
 * SAFETY:
 *   - Only `images.pexels.com` URLs are rewritten; every other host
 *     (Unsplash/Pixabay/local) passes through UNCHANGED.
 *   - Host + path never change, so next.config remotePatterns and every
 *     URL-comparison flow keep working (image-safety's
 *     normalizeImageUrlForCompare is query-string-insensitive BY DESIGN —
 *     "Pexels/Unsplash CDN URLs differ only in resize params").
 *   - `aspect` is the display box's width/height ratio (cards 16/9, hero
 *     2/1); fit=crop then reproduces the crop object-cover already gave.
 */
export function sizedRemoteImage(
  url: string | null | undefined,
  width: number,
  aspect?: number,
): string | null {
  if (!url) return null;
  if (!url.startsWith("https://images.pexels.com/")) return url;
  try {
    const u = new URL(url);
    const w = Math.round(width);
    u.searchParams.set("w", String(w));
    if (aspect && aspect > 0) {
      u.searchParams.set("h", String(Math.round(w / aspect)));
    }
    u.searchParams.set("fit", "crop");
    u.searchParams.set("fm", "webp");
    return u.toString();
  } catch {
    return url;
  }
}
