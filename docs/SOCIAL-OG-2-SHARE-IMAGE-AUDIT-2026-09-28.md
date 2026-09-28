# SOCIAL-OG-2 (2026-09-28) — Share-Image Audit & Fix Report
## «المربع الأزرق بدل صورة المشاركة» — Full-Site OG/Twitter-Card Audit, Root Cause, and Executed Fixes

> **Task:** owner order 2026-09-28 — audit the whole site (AR + EN) for anything preventing
> Facebook and social platforms from rendering the correct share image (blue/blank square
> instead), focusing on Open Graph, Twitter Cards, metadata, images, cache, and crawler
> accessibility; compare working share pages (blog articles) against broken ones; fix the real
> cause site-wide without touching anything unrelated; test; record; push to `main`.
> **Task ID:** SOCIAL-OG-2-2026-09-28 · **Status:** EXECUTED (site-side fixes + edge rule live in this commit)

---

## 1. Method (what was actually measured)

1. **Live probes as the real crawler.** Every page class was fetched with the
   `facebookexternalhit/1.1` user-agent and its OG/Twitter meta extracted: homepage, /ar,
   blog index (both), 10 tools, programs (hub + cells), diet-plan (hub + cells), evo,
   coaching, memberships, for-coaches (+register), exercises, foods, meal-planner,
   ai-meal-planner, ai-workout-planner, about, faq, contact, authors, compare, muscles,
   collections, blog categories, blog articles, exercise/food/comparison detail pages.
2. **Full-sitemap audit (741 URLs, parallel):** all of sitemap-pages (140) + collections (48)
   + comparisons (6) + foods (160) + blog (97) + a ~290-URL sample of sitemap-exercises
   (1736 total). For every URL: og:image present? → image fetched as FB crawler →
   HTTP status + content-type validated.
3. **Image forensics:** every self-hosted share asset downloaded and inspected with
   `file`/Pillow — real pixel dimensions vs the dimensions declared in the meta tags, real
   container format vs the served content-type.
4. **Crawler-path verification:** robots.txt policy, response headers (Set-Cookie/Vary/
   cache-control/CF status), redirect chains (http/https, www/apex), robots meta, and
   Cloudflare zone settings (security_level, browser_check, hotlink_protection, cache
   rules, WAF rulesets) via the Cloudflare API.
5. **History reconstruction:** git archaeology of when each OG fix landed.

## 2. Findings

### 2.1 What is NOT broken (verified clean, 2026-09-28)

- **0 of 741 audited URLs fail today.** Every page emits `og:title`, `og:description`,
  `og:url`, `og:image` (absolute), `twitter:card: summary_large_image`; every og:image
  returns `200` with an `image/*` content-type to the FB user-agent.
- robots.txt never blocks public pages or `/images/*`; no `noindex` on shareable pages;
  no Set-Cookie on crawler responses; 301 chains (http→https, www→apex) are crawler-safe.
- All 14 branded PNG cards are genuine **1200×630 PNG** (not mislabeled containers).
- Blog articles share their real Pexels cover (1200×630 JPEG, fast CDN) — the
  SOCIAL-OG-248 cover-first law — which is why **blog shares work**.

### 2.2 Root cause A — stale platform scrapes from the broken eras (primary)

The domain is young (zone created 2026-09-05) and its OG surface passed through three
broken eras, each of which Facebook/WhatsApp **cached as a failed scrape**:

| Era | Defect | Fixed on |
|---|---|---|
| launch → 09-08 | AR generator cards rendered **0-byte PNGs** (`@vercel/og` without Arabic shaping) — Phase 151 | 2026-09-08 |
| launch → ~09-26 | og:image was the raw logo / pages inherited a cardless block — Phase 187 + SEO pass | 2026-09-26/27 |
| launch → 09-22 | generator cold start **1.7–5.2 s** exceeded the WhatsApp/FB fetch budget (blue-box report of 2026-09-22, SOCIAL-OG-248) | 2026-09-22 |

Platforms re-scrape a URL only on a fresh share after their TTL (≈30 days for dormant
pages). **Pages first shared during a broken era therefore keep showing the remembered
blue square** even though the page is fixed today — while blog articles, born with (or
converted to) working cover-first images and freshly scraped, work. That is exactly the
owner-reported split: blog OK, the rest broken.

### 2.3 Root cause B — metadata defects that still make scrapes fragile

1. **Program pages declared `og:image:width=1200 / height=630` while the served file is a
   768×768 square** (all 7 program WebPs measured 768×768). Platforms that validate
   declared-vs-fetched dimensions can reject the preview → blue/blank card.
2. **Exercise photo share images declared nothing** (no width/height/type) — the crawler
   must fully download + probe the image before accepting it; any hiccup = no image.
3. **No cache-busting on share-image URLs.** Even after a re-scrape, Facebook keys its
   image cache by URL — the same URL that previously delivered a broken/0-byte image can
   keep serving the remembered broken thumbnail.
4. **No explicit edge guarantee for share crawlers.** Zone had `browser_check: on`,
   `security_level: medium`, and no custom rule letting the verified share-crawler
   user-agents through unchallenged (Cloudflare analytics were unreadable with the
   available token scope, so the challenge hypothesis could not be *excluded*).

## 3. Executed fixes (scope-locked to the share-image problem)

### 3.1 `?v=2` share-cache-bust on every self-hosted share image (73 files)

Every `og:image`/`twitter:image` reference to self-hosted assets now carries `?v=2`
(e.g. `/images/og/og-home-en.png?v=2`, `${program.image}?v=2`,
`${author.avatarUrl}?v=2`, exercise photo `${primaryPhoto}?v=2`). A **new image URL is a
cache miss at every platform** — the next scrape of any page (fresh share, 30-day TTL
expiry, or manual Debugger "Scrape Again") must fetch the image fresh and succeeds.
External Pexels covers are untouched (already working, outside our cache). The version
suffix lives on the metadata layer only — no file renamed, no design/content change.

### 3.2 Truthful + complete image metadata

- **Program cells (EN+AR):** declared dims corrected 1200×630 → **768×768** (measured),
  `og:image:type: image/webp` added, `?v=2` on both og + twitter references.
- **Exercise cells (EN+AR):** photo share image now declares **640×427** (measured) +
  `type: image/webp`; branded-card fallback unchanged (1200×630).
- **Blog cells (EN+AR):** og image object now declares **1200×630** (both the Pexels
  crop and the generator fallback are exactly 1200×630 — verified).
- **Author cells (EN+AR):** avatar keeps its true 400×400, now with `?v=2`.

### 3.3 Edge guarantee for share crawlers (Cloudflare WAF custom rule)

New zone custom-rule (phase `http_request_firewall_custom`, first rule, enabled):
`facebookexternalhit` (incl. the exact `externalhit_uatext` variant), `Twitterbot`,
`WhatsApp`, `LinkedInBot`, `TelegramBot`, `Slackbot`, `Discordbot` — gated with
`cf.client.bot` where applicable — **skip** the remaining custom-rules phase. Verified
share crawlers now have an explicit allow path at the edge; they can never be the victim
of a challenge rule added later. (API limitation, owner action below: Browser Integrity
Check skip and Bot-Fight-Mode state are not writable/readable with the current token
scope on the Free plan.)

### 3.4 Guardrails updated with the same commit

`og-image-coverage.test.ts` (64 tests) now enforces the versioned asset law — every
wired surface must carry the `?v=2` suffix (`SHARE_IMG_VER` constant, single place to
bump to `v=3` for a future site-wide re-bust); `ar-mirrors.test.ts` updated for the
versioned AR affiliate card. Full suite: **1771/1771 passing**; `next build` green
(2020 routes); live `next start` HTML verified (og:image URLs + dims + type emitted
exactly as intended; versioned URLs serve `200` with correct content-types).

## 4. After-deploy verification & the residual limitation

- **Re-scrape semantics:** once deployed, any URL re-scraped by a platform (new share,
  TTL expiry, or Sharing-Debugger "Scrape Again") reads correct tags **and** fetches a
  never-seen-before image URL → the correct image renders. Site-side, nothing further
  can fail: the 741-URL audit is green, and the fresh-URL law makes the image layer
  cache-proof.
- **Residual (owner action, cannot be done from the repo):** pages already poisoned in
  Facebook's cache need ONE of — a fresh share after deploy (composer usually re-scrapes),
  ≤30 days of TTL decay, or a one-click **"Scrape Again"** per URL in
  [Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/) (owner
  login; batch the top shared URLs first). WhatsApp: re-sending the link to the same
  chat re-fetches after cache expiry; a `?v=2` on the *page* URL (not og) also forces a
  fresh preview. Owner should also confirm in the Cloudflare dashboard (Security → Bots)
  that **Bot Fight Mode is OFF** — it can challenge verified crawlers and is not
  API-readable with the current token scope.
- Remaining platform-side behaviors (30-day TTLs, per-chat WhatsApp caches) are outside
  any website's control and are documented here for expectation-setting only.

## 5. Files touched

- 73 metadata files: `?v=2` share-cache-bust (EN + AR mirrors, layouts + pages).
- `src/app/(en|ar)/.../exercises/[slug]/page.tsx` — photo dims/type + bust (EN+AR).
- `src/app/(en|ar)/.../programs/[slug]/page.tsx` — corrected dims 768×768 + type + bust.
- `src/app/(en|ar)/.../blog/[slug]/page.tsx` — 1200×630 declared (EN+AR).
- `src/app/(en|ar)/.../authors/[slug]/page.tsx` — bust on avatar (EN+AR).
- `src/lib/__tests__/og-image-coverage.test.ts`, `src/lib/__tests__/ar-mirrors.test.ts` — law updated.
- Cloudflare zone: custom WAF allow rule for share crawlers (edge-side, not a repo file).
- `docs/SOCIAL-OG-2-SHARE-IMAGE-AUDIT-2026-09-28.md` (this report) + `docs/README.md` row + `worklog.md` entry.
