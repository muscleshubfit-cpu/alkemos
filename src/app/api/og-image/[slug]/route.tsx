import { NextRequest } from "next/server";
import { ImageResponse } from "next/og";
import { fetchBlogForOG } from "@/lib/blog-server";

/**
 * Dynamic OG image generator.
 *
 * GET /api/og-image/[slug]?lang=en|ar
 *
 * Returns a 1200×630 PNG image optimized for social sharing (Twitter,
 * Facebook, LinkedIn, WhatsApp, Telegram). Generated on-the-fly using
 * next/og (Satori under the hood) — no static image generation needed.
 *
 * Design:
 *   - Dark gradient background (#1d1d1f → #0071e3)
 *   - Alkemos brand mark (A) + name top-left
 *   - Article title centered (auto-fit font size based on length)
 *   - Article description (truncated to 120 chars)
 *   - Site URL "alkemos.com" footer
 *
 * Phase 151 (2026-09-08 — AR OG bug): the previous implementation imported
 * ImageResponse from @vercel/og (bundled 2023-era Satori without Arabic
 * shaping/bidi). Every ?lang=ar request returned a 0-byte PNG (verified
 * live: EN 251KB / AR 0B), so ALL Arabic articles shared broken cards on
 * WhatsApp/Telegram/Facebook — the core Arabic market surfaces. Fix:
 *   1. ImageResponse now comes from next/og (modern Satori with harfbuzz
 *      shaping + bidi — Arabic verified rendering correctly, joined
 *      glyph forms, RTL order, mixed AR+EN lines).
 *   2. Cairo (Google font, Arabic+Latin, OFL) is SELF-HOSTED at
 *      public/fonts/og-cairo-{400,700}.ttf and fetched same-origin on
 *      first use, then cached module-level per warm isolate. No external
 *      runtime dependency. If fonts fail to load, we degrade gracefully
 *      to the bundled default (EN still renders — never worse than before).
 *   3. Brand mark fixed "M" → "A" (leftover from the old brand).
 *   4. Cache-Control: public 1day + SWR so social crawlers and CDNs
 *      cache cards; keyed by slug+lang (both languages cached apart).
 */

export const runtime = "edge";
export const maxDuration = 30;

const APP_URL =
  process.env.NEXT_PUBLIC_APP_URL || "https://alkemos.com";

type CairoFont = {
  name: "Cairo";
  data: ArrayBuffer;
  weight: 400 | 700;
  style: "normal";
};

// Module-level cache: one fetch pair per warm edge isolate.
let cairoFontsPromise: Promise<CairoFont[] | null> | null = null;

function loadCairoFonts(): Promise<CairoFont[] | null> {
  if (!cairoFontsPromise) {
    cairoFontsPromise = Promise.all([
      fetch(`${APP_URL}/fonts/og-cairo-400.ttf`),
      fetch(`${APP_URL}/fonts/og-cairo-700.ttf`),
    ])
      .then(async ([r400, r700]) => {
        if (!r400.ok || !r700.ok) return null;
        const [data400, data700] = await Promise.all([
          r400.arrayBuffer(),
          r700.arrayBuffer(),
        ]);
        return [
          { name: "Cairo", data: data400, weight: 400, style: "normal" },
          { name: "Cairo", data: data700, weight: 700, style: "normal" },
        ] as CairoFont[];
      })
      .catch(() => null);
  }
  return cairoFontsPromise;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const lang = (request.nextUrl.searchParams.get("lang") as "en" | "ar") || "en";

  // Defaults if post not found
  let title = "Alkemos — Fitness & Nutrition Platform";
  let description = "AI-powered fitness & nutrition coaching platform";

  try {
    const og = await fetchBlogForOG(slug, lang);
    if (og) {
      title = og.title;
      description = og.description;
    }
  } catch {
    // keep defaults
  }

  // Truncate description to fit
  const descTruncated =
    description.length > 120
      ? description.slice(0, 117) + "…"
      : description;

  // Auto-fit font size based on title length
  const titleLength = title.length;
  const titleFontSize = titleLength > 80 ? 36 : titleLength > 50 ? 48 : titleLength > 30 ? 60 : 72;

  const fonts = await loadCairoFonts();

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "linear-gradient(135deg, #1d1d1f 0%, #0071e3 100%)",
          padding: 60,
          fontFamily: fonts ? "Cairo" : "sans-serif",
          color: "white",
        }}
      >
        {/* Header: brand */}
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 28,
              background: "white",
              color: "#0071e3",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 32,
              fontWeight: 700,
            }}
          >
            A
          </div>
          <div style={{ fontSize: 32, fontWeight: 700, letterSpacing: -0.5 }}>
            Alkemos
          </div>
        </div>

        {/* Title + description */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div
            style={{
              fontSize: titleFontSize,
              fontWeight: 700,
              lineHeight: 1.15,
              letterSpacing: -1,
              maxWidth: 1000,
            }}
          >
            {title}
          </div>
          <div
            style={{
              fontSize: 24,
              fontWeight: 400,
              opacity: 0.85,
              maxWidth: 900,
              lineHeight: 1.3,
            }}
          >
            {descTruncated}
          </div>
        </div>

        {/* Footer: URL */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontSize: 20,
            opacity: 0.7,
          }}
        >
          <div>alkemos.com</div>
          {lang === "ar" ? (
            // flex gap keeps the AR/Latin bidi boundary from collapsing
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div>مدونة</div>
              <div>Alkemos</div>
            </div>
          ) : (
            <div>Alkemos Blog</div>
          )}
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      ...(fonts ? { fonts } : {}),
      headers: {
        "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
      },
    },
  );
}
