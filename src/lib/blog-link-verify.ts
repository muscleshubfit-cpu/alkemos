/**
 * src/lib/blog-link-verify.ts — AUDIT_REPORT.md §9-المرحلة 2, item 2
 * (2026-09-29): the citation-link verification gate.
 *
 * WHY (audit §9-2.2 — «سياسة استشهادات صادقة», option أ): the honest
 * citation policy now ALLOWS the writing phases to cite evidence as
 * links to the whitelisted authority domains (EDITORIAL_AUTHORITY_
 * DOMAINS — WHO / NIH / CDC / Mayo / ACSM / ISSN), which is better for
 * GEO than the old blanket ban. The flip side of allowing links is
 * TRUSTING them: a generated article that ships a dead 404 "citation"
 * is a worse E-E-A-T signal than no citation (and models on the free
 * chain DO hallucinate URLs). This module is the deterministic verify
 * gate the audit asked for («بوابة تحقق من الروابط (HEAD request)»).
 *
 * POLICY (deliberately fail-OPEN on uncertainty, remove only on
 * CONFIDENT death — a wrong removal is worse than an unverified link):
 *   • verify every EXTERNAL http(s) markdown link in the final body
 *     (site-internal links, tool links, and images are not evidence
 *     citations — they are the site's own fabric, checked by other
 *     layers);
 *   • HEAD with redirect-follow + a short timeout, ONE retry on
 *     network error/timeout;
 *   • 200-299 / 3xx → verified; 404 / 410 → DEAD (the link is removed,
 *     the anchor text survives as plain prose);
 *   • anything else (403 / 405 / 429 / 5xx / timeout / DNS failure) →
 *     UNVERIFIED = kept (many authorities reject HEAD or bot-UAs; a
 *     flaky network must never amputate a good citation);
 *   • hard cap on checked URLs (time budget) + total wall clock — the
 *     P5 route must stay fast; beyond the cap, links pass unverified.
 *
 * Runs at P5 AFTER the tool-link pass and BEFORE the quality battery —
 * the G4 authority-link floor then measures the VERIFIED state (a
 * dead authority link removed + no other authority link left → the
 * battery fails honestly → backstop regenerates; exactly the audit's
 * «أي فشل → إعادة توليد» mechanism).
 *
 * `fetchImpl` is injectable so unit tests never touch the network.
 */

export type LinkVerifyResult = {
  /** URLs actually checked (cap-limited). */
  checked: string[];
  /** Confirmed-dead URLs (removed from the body). */
  dead: string[];
  /** URLs whose check was inconclusive (kept, reported). */
  unverified: string[];
  /** URLs skipped by the cap (kept, reported). */
  skipped: string[];
  /** The body with dead links reduced to their anchor text. */
  md: string;
};

/** Markdown links (IMAGES excluded via lookbehind on the `!`):
 * [anchor](url) — the quality-gates scanner shape plus the image
 * exclusion so the two layers can never disagree on what a link is. */
const MD_LINK_RE = /(?<!!)\[([^\]]+)\]\(([^)\s]+)\)/g;

/** Max unique external URLs to check (the time budget; typical articles
 * carry 1-3 external links). Beyond the cap everything passes. */
export const LINK_VERIFY_MAX_URLS = 12;

/** Per-request timeout. */
export const LINK_VERIFY_TIMEOUT_MS = 6_000;

/** Total wall-clock budget for the whole pass. */
export const LINK_VERIFY_TOTAL_BUDGET_MS = 30_000;

type FetchLike = (url: string, init?: RequestInit) => Promise<Response>;

const defaultFetch: FetchLike = (url, init) => fetch(url, init);

/** Extract the unique external https URLs from a markdown body (anchor
 * links only; images and site-internal links excluded). Exported for
 * tests. */
export function collectExternalLinks(bodyMd: string): string[] {
  const urls = new Set<string>();
  for (const m of bodyMd.matchAll(MD_LINK_RE)) {
    const url = m[2];
    if (!/^https?:\/\//i.test(url)) continue;
    let host: string;
    try {
      host = new URL(url).hostname.toLowerCase();
    } catch {
      continue;
    }
    // Site-internal absolute links are the site's own fabric.
    if (host === "alkemos.com" || host.endsWith(".alkemos.com")) continue;
    urls.add(url);
  }
  return [...urls];
}

/** One URL verdict via HEAD (redirect-following; one retry on
 * transport-level failure). Pure transport check — no content sniffing. */
async function checkUrl(
  url: string,
  fetchImpl: FetchLike,
): Promise<"ok" | "dead" | "unverified"> {
  const attempt = async (): Promise<"ok" | "dead" | "unverified"> => {
    try {
      const res = await fetchImpl(url, {
        method: "HEAD",
        redirect: "follow",
        signal: AbortSignal.timeout(LINK_VERIFY_TIMEOUT_MS),
        headers: { "User-Agent": "AlkemosLinkVerify/1.0 (+https://alkemos.com)" },
      });
      if (res.status >= 200 && res.status < 400) return "ok";
      // Confident death only — a missing page (a hallucinated citation
      // URL) is exactly 404/410. Everything else is "cannot tell".
      if (res.status === 404 || res.status === 410) return "dead";
      return "unverified";
    } catch {
      return "unverified";
    }
  };
  const first = await attempt();
  if (first !== "unverified") return first;
  // One retry for transport flakiness (timeouts, connection resets).
  return attempt();
}

/**
 * Verify the external links of a markdown body and remove the
 * CONFIRMED-dead ones (anchor text survives as plain prose — the
 * sentence keeps its meaning, loses only the broken citation).
 */
export async function verifyBodyLinks(
  bodyMd: string,
  opts?: { fetchImpl?: FetchLike; maxUrls?: number; totalBudgetMs?: number },
): Promise<LinkVerifyResult> {
  const fetchImpl = opts?.fetchImpl ?? defaultFetch;
  const maxUrls = opts?.maxUrls ?? LINK_VERIFY_MAX_URLS;
  const budget = opts?.totalBudgetMs ?? LINK_VERIFY_TOTAL_BUDGET_MS;
  const startedAt = Date.now();

  const all = collectExternalLinks(bodyMd);
  const toCheck = all.slice(0, maxUrls);
  const skipped = all.slice(maxUrls);

  const checked: string[] = [];
  const dead: string[] = [];
  const unverified: string[] = [];

  for (const url of toCheck) {
    if (Date.now() - startedAt > budget) {
      // Budget exhausted — the rest pass unverified (fail-open).
      skipped.push(...toCheck.slice(checked.length));
      break;
    }
    checked.push(url);
    const verdict = await checkUrl(url, fetchImpl);
    if (verdict === "dead") dead.push(url);
    else if (verdict === "unverified") unverified.push(url);
  }

  let md = bodyMd;
  for (const url of dead) {
    // [anchor](dead-url) → anchor (only this URL, anchors untouched).
    const escaped = url.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    md = md.replace(new RegExp(`\\[([^\\]]*)\\]\\(${escaped}\\)`, "g"), "$1");
  }

  return { checked, dead, unverified, skipped, md };
}
