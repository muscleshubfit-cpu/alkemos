import { NextResponse } from "next/server";
import { buildEvoEmbedScript } from "@/lib/evo-embed-script";

/**
 * EVO-6 (W6) — GET /embed/evo.js — the one-line embed script.
 *
 * Served as a classic cross-origin script (no CORS needed for <script src>),
 * short edge-cache TTL: the script is origin-generic (it derives the widget
 * origin from its own src at runtime), identical for every partner, so the
 * next.config public-cache rule (s-maxage=3600) winning over route headers
 * is FINE here — unlike /embed/widget, nothing per-key is ever rendered
 * into this response.
 *
 * The key is read client-side from data-key at injection time — this
 * response is per-request stateless and carries no credential.
 */
export async function GET() {
  return new NextResponse(buildEvoEmbedScript(), {
    status: 200,
    headers: {
      "Content-Type": "application/javascript; charset=utf-8",
      "Cache-Control": "public, max-age=300",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
