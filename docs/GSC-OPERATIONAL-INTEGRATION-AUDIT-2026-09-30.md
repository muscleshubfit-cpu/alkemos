# GSC Operational-Integration Audit — 2026-09-30

> **Provenance:** owner order 2026-09-30 (read-only architectural audit of how Google Search
> Console can become an **ongoing operational capability** — evidence source for the project's
> existing and future operations, NOT a reporting/statistics feature). Zero code, workflow, DB,
> or config changes were made by this audit; the only repo mutations are the documentation you
> are reading plus its registry/worklog/STATE rows (§11).
> **Status:** **LIVE — the authoritative spec for the future GSC implementation phases G1–G5
> (§8).** Execution starts ONLY by owner order; the exact starting point is §9.
> **Evidence base:** the repository at commit `bf451de2` (HEAD of `origin/main` at audit time),
> the two live GSC connection-test runs (§2), live production probes (§1.2), and the GSC API's
> public capabilities. External API facts that must be re-verified during implementation are
> marked **[verify]**.

---

## 1. Scope and method

### 1.1 What was inspected (read-only)

- **CI surface:** all 23 workflows in `.github/workflows/` (triggers, cadences, secrets, scripts,
  write surfaces) — including the temporary `gsc-connection-test.yml` (v2) and its two live runs.
- **Content pipeline:** `src/lib/blog-research.ts` (P0 topic research), `blog-topics.ts` (static
  fallback pools), `blog-queue.ts` + `/api/cron/blog/p0..p5` (queue contract, bundle stamps,
  repair loop), `blog-pipeline.ts`, `intent-map.ts` (22 hand-curated intent clusters).
- **SEO/GEO surface:** `src/lib/seo.ts`, `sitemap-xml.ts`, `sitemap-lastmod.ts`, `blog-sitemap.ts`,
  the 6 sitemap child routes + index, `public/robots.txt`, `llms.txt`/`llms-full.txt`,
  `scripts/geo/answer-visibility-probe.mts` + `geo-answer-visibility.yml`.
- **Data model:** `supabase/migrations/` — specifically 0096 (one-off cannibalization data
  migration) and 0097 (`review_status` owner-review workflow); the migration INDEX ledger.
- **Remediation channels:** `link-db-remediation`, `stats-db-remediation`,
  `content-audit-db-remediation`, `meta-title-remediation`, `legacy-ar-cleanup`,
  `remediate-blog-images`, `retro-pair-blog` (all dispatch-only, DRY_RUN-first, write only
  whitelisted `blog_posts` fields).
- **Admin/observability precedent:** `/api/admin/evo-analytics` + `AdminEvoAnalyticsView.tsx`
  (requireAdmin-gated analytics surface), `/api/ai/queue-health` (bundle-stamp counters:
  `researchSource:"fallback"`, `repairLoop`).
- **Migration/rebrand surface:** `next.config.ts` redirects (8 consolidation 301s), migration
  `0070_rebrand_alkemos`, host-level redirect behavior.
- **Docs corpus:** `AGENTS.md` (binding law), `STATE.md`, `docs/README.md` (registry),
  `docs/CI_GATES.md`, `AUDIT_REPORT.md` §9 (generation audit — the origin of the GSC
  recommendation), `docs/SEO-GEO-MASTER-PLAN.md`, `docs/SEO-CWV-THRESHOLDS.md`,
  `docs/FOOD-DATA-ARABIZATION-PLAN-2026-09-19.md`, recovery/secrets registries.
- **Secrets inventory:** GitHub repo secrets list (names only, via API) + `.env.example` +
  `docs/RECOVERY-SECRETS-SOURCES.md`.

### 1.2 Live probes performed (2026-09-30, read-only GETs)

| Probe | Result |
|---|---|
| `https://alkemos.com/robots.txt` | unified `User-agent: *` policy, 7 `Sitemap:` lines (index + 6 children) |
| `https://alkemos.com/sitemap.xml` | sitemap index, 6 children, every child `<lastmod>` = 2026-09-30 (the forced-refresh policy) |
| `https://musclehubeg.vercel.app/` | **301 → https://alkemos.com/** (host-level rebrand redirect live) |
| `https://www.alkemos.com/` | **301 → https://alkemos.com/** |
| `http://alkemos.com/` | **301 → https://** (HSTS `max-age=63072000; preload` in `vercel.json:27-29`) |

### 1.3 What this audit deliberately did NOT do

No code/workflow/DB/config changes, no Google-API calls of its own (the evidence below comes
from the owner-dispatched connection-test runs), no secret values read or echoed (secret names
only), and no implementation of any item in §8 — per the audit order and AGENTS.md §12.10.

---

## 2. Existing GSC capabilities (what exists TODAY)

### 2.1 Proven, working connection — nothing consumes it yet

| Capability | Evidence |
|---|---|
| GitHub secret `GOOGLE_SEARCH_CONSOLE_CREDENTIALS` | present (updated 2026-09-29T23:30Z; service-account JSON, accepted raw or base64) |
| Service account | `alkemos-gsc-reader@muscleshub.iam.gserviceaccount.com` — added to both properties (proven, below) |
| OAuth scope | `https://www.googleapis.com/auth/webmasters.readonly` — **read-only by construction** (`gsc-connection-test.yml:75`) |
| Proven auth + read path | 2 successful dispatch runs: `36647573294` (2026-09-29 23:53Z) and `36649457709` (2026-09-30 00:15Z) — both **success** |
| API calls proven | `sites.list` (property discovery, exact IDs from the API) + `searchAnalytics/query` (3 calls/property: totals, top-20 queries, top-20 pages) |
| Properties visible to the SA | 2: `sc-domain:alkemos.com` (primary, domain property) and `https://musclehubeg.vercel.app/` (the OLD pre-rebrand property — discovered, not guessed) |

**Measured 28-day baseline (window 2026-09-02 → 2026-09-29, dataState=final, run 36649457709):**

| Property | Clicks | Impressions | CTR | Avg. position |
|---|---:|---:|---:|---:|
| `sc-domain:alkemos.com` | 4 | 4,172 | 0.10% | 55.53 |
| `https://musclehubeg.vercel.app/` | 8 | 4,600 | 0.17% | 16.37 |

These two rows are the site's honest starting point: near-zero clicks, ~4k impressions/28d on
each property, deep positions. Every integration below is sized against this reality (small,
free-tier, early-growth site — the API quotas are effectively infinite for this scale, and the
value is in *direction*, not volume).

### 2.2 The reusable code that already exists

`gsc-connection-test.yml` (v2) contains, inline and **already proven live**:
RS256 JWT signing via `openssl dgst` (stdlib-only — A-12 discipline, no checkout, no installs),
token exchange, JSON/base64 credential parsing with private-key `\n` repair, `sites.list`
discovery with permission levels, a bounded per-property query set (28 complete days,
`dataState=final`), per-property failure isolation with Google's verbatim error text, honest
exit 1, secret materialized to `$RUNNER_TEMP` 0600 + `always()` deletion, and a machine-readable
`RESULT property=… clicks=… impressions=…` log line (`:366-368`). This is the authentication and
query layer a permanent collector can port nearly verbatim (§5).

### 2.3 Where GSC already appears in project operations (documented, manual, or deferred)

- **`AUDIT_REPORT.md:314`** (§9 Phase-1 item 3, 2026-09-29): «إدخال Google Search Console
  (استعلامات فعلية مع impressions/clicks للـ site) كمصدر أساسي لاختيار المواضيع» — the
  originating recommendation. Shipped half: the `researchSource:"fallback"` honest stamping
  (`AGENTS.md:164`, `blog-research.ts:425-434`). **The GSC half was owner-deferred**
  (`STATE.md:28`) — the credential secret now exists and the connection is proven, so this
  deferral is technically unblocked (execution still needs the owner order).
- **`AGENTS.md:164`**: "The GSC real-search source remains owner-blocked (needs the owner's
  Search Console API credentials)." — **now factually stale**: the credentials exist and
  authenticate. Updating this line belongs to the first implementation frame (G1/G2), not to a
  read-only audit.
- **Food-arabization gates** (`docs/FOOD-DATA-ARABIZATION-PLAN-2026-09-19.md` §8, `STATE.md:33`):
  batch 4+ and the band→sitemap wiring decision explicitly «await GSC-gated owner orders» — a
  30-day measurement window was declared "open" on 2026-09-19 but **nothing measures it**.
- **USDA long-tail policy review** (`docs/SEO-GEO-MASTER-PLAN.md:355/:595`, `sitemap-foods.xml`
  route comment): promised "after 90 days of Search Console data" (~2026-12-07 data station) —
  manual review, nothing scheduled.
- **KPI table** (`docs/SEO-GEO-MASTER-PLAN.md:643-646`): GSC named as the weekly/monthly source
  for impressions/clicks/CTR/position/indexed-pages — currently a manual owner task with no
  tooling.
- **Sitemap fetch-incident mitigation** (`src/app/sitemap.xml/route.ts:13-21`, Phase
  SEO-GEO-1.1): the "Couldn't fetch" GSC/Bing fetch-cache lag incident — mitigated defensively
  (forced `lastmod=today` on the index children), but GSC's actual acceptance state of the 7
  sitemaps is not monitored anywhere.
- **`docs/SEO-CWV-THRESHOLDS.md:108`**: already-researched API facts (hourly Search Analytics
  data shipped Apr 2025; branded/non-branded filter Nov 2025; Page Experience report removed) —
  the repo already treats GSC API behavior as a tracked engineering fact.
- **CI registry**: `docs/CI_GATES.md:57` carries the (temporary) GSC-connection-test row, with
  the explicit lifecycle note: «يُحذف بأمر المالك بعد بناء مستهلك GSC دائم» — delete by owner
  order once a permanent GSC consumer exists (`gsc-connection-test.yml:29` says the same).

### 2.4 What does NOT exist today (verified)

- **Zero GSC API usage in application code** — no Google API client, no search-console import,
  no live Google calls anywhere in `src/` (grep-verified). The secret is GitHub-Actions-only.
- **No search-performance storage** — migrations 0096/0097 add only content-review state; no
  table holds impressions/clicks/position/query rows (checked the full migration ledger).
- **No admin surface for search data** — the owner's analytics visibility is EVO-only
  (`/admin/evo-analytics`); `/api/ai/queue-health` reports pipeline health, not search health.
- **No recurring GSC job** — the connection test is `workflow_dispatch`-only by design.
- **Secrets-registry gap** — `GOOGLE_SEARCH_CONSOLE_CREDENTIALS` is absent from
  `docs/RECOVERY-SECRETS-SOURCES.md` (its own law, `:93`, requires a row for new secrets in the
  same frame) and from `.env.example` (the latter is correct: it is a GHA-only secret, never a
  Vercel env var — see §7). The registry row is a real, small compliance gap to close in G1.
- **`researchSource` has only two values** (`"fallback"` | `"model"`) — no `"gsc"` evidence
  class exists in the queue contract yet.

---

## 3. GSC capability inventory relevant to Alkemos

API surface available to the existing read-only scope (external facts; the ones marked
**[verify]** must be re-confirmed during G1 — Google's docs move):

| Capability | API | Scope needed | Key constraints |
|---|---|---|---|
| Search performance data | `searchAnalytics.query` | `webmasters.readonly` ✅ | dimensions `date / query / page / device / country / searchAppearance`; `dataState=final` (settled, ~2–3d lag) or `all` (incl. fresh/hourly, Apr 2025+); rowLimit ≤ 25,000; documented quotas ~1,200 queries/min and ~250,000 rows/day **[verify]** — both ~4 orders of magnitude above this site's need; per-property data |
| Property discovery | `sites.list` | readonly ✅ | already proven; returns permission level |
| Sitemap status (read) | `sitemaps.list` / `sitemaps.get` | readonly ✅ | per-sitemap `isPending`, `errors`, `warnings`, `lastDownloaded`, processed counts — the automated answer to the "Couldn't fetch" class |
| Sitemap submission | `sitemaps.submit` | **full `webmasters`** ⚠️ | WRITE op — out of the current read-only scope; owner decision (§7, G4) |
| Per-URL index state | URL Inspection API | **documented as full `webmasters`** ⚠️ **[verify]** — some reports say readonly suffices | quotas ~2,000 calls/day, ~600/min **[verify]** → sampling policy mandatory; reflects **last crawl**, not live state |
| Coverage / CWV field data / manual actions / Core Update annotations | — | — | **NO public API** — these stay manual owner checks (the plan's alert playbook §669 already assumes this) |
| URL removal / outages | — | — | Not applicable/not needed |
| Indexing API (`indexing.googleapis.com`) | — | — | Google restricts it to `JobPosting`/`BroadcastEvent` pages — **not applicable** to Alkemos content; sitemap + internal links + redirects are the lawful index path |
| Historical retention | — | — | GSC UI keeps ~16 months; older data is forgotten unless **snapshotted locally** — the collector's core reason to exist |

Data-semantics constraints that shape every integration below:
- GSC shows **the site's own queries** — queries where alkemos.com already earned impressions.
  It is a *demand-response* signal (what Google already exposes us for), NOT a market-research
  tool (what the world searches). Net-new topic discovery still needs model knowledge — GSC
  complements the LLM, it does not replace it.
- Rare/anonymous queries are anonymized by Google; long-tail query rows are lossy.
- Position is an average; per-`(query, page)` rows are the only way to see cannibalization
  (one query surfacing multiple site pages).

---

## 4. Integration points (the audit's core findings)

Every entry: **WHERE** it plugs into the actual repo · **GSC DATA** needed · **ACTION** the
project/agent takes · **STATUS** (exists / partial / missing) · **LIMITS** · and the **LOOP**
(operation → GSC evidence → decision/action → implementation → later validation) — the audit's
selection criterion. Priorities in §8 map to these IDs.

### IP-1 — P0 topic selection grounded in real queries (the §9 deferred item, now unblocked)

- **WHERE:** `src/lib/blog-research.ts` — `researchLanguage()` (`:340-423`, prompt context) and
  `runPhase0Research()` (`:444`); `/api/cron/blog/p0-research/route.ts` (bundle stamp, `:57-83`);
  `src/lib/blog-topics.ts` `pickSmartTopic()` as the secondary consumer.
- **GSC DATA:** `searchAnalytics/query` dimension `[query]` (clicks/impressions/CTR/position,
  28–90d, both languages inferred from page prefix) + `[page]` for per-section demand.
- **ACTION:** inject the site's top real queries (with impression counts) into the research
  prompt as a *grounding block*; rank model-proposed topics by "already-earning-impressions
  queries we under-serve" (impressions present, position > 10, no dedicated intent-map cluster);
  extend `researchSource` with a `"gsc"`/`"gsc+model"` evidence class; keep the LLM for net-new
  topic ideation and phrasing.
- **STATUS:** **MISSING** — today's keyword volumes are model guesses («volume labels are
  estimates», `blog-research.ts:388`), fallback pool static (14 keywords/lang, `:280-338`; topic
  pools 100 EN / 92 AR in `blog-topics.ts`), and the measured fallback rate was 24% of runs
  (`AUDIT_REPORT.md` C3). AUDIT_REPORT §9 Phase-1 item 3 named exactly this integration;
  `STATE.md:28` deferred its GSC half by owner decision — the credentials now exist.
- **LIMITS:** own-queries-only semantics (§3); anonymized rare queries; `final` data lag ~2–3d;
  at ~4k impressions/28d the query list is small (that is fine — it is the *highest-precision*
  demand signal available).
- **LOOP:** daily P0 picks a topic targeting a real under-served query → article publishes
  through P5 → next weeks' GSC `[query, page]` rows show whether that article now earns
  impressions/position for the targeted query → queue-health gains a measurable
  "GSC-grounded topic success rate" → topic-selection law tunes itself on evidence.

### IP-2 — Food-Arabization band expansion gate (the declared-but-unmeasured window)

- **WHERE:** `docs/FOOD-DATA-ARABIZATION-PLAN-2026-09-19.md` §8 (GSC expansion gates: impressions
  /clicks of `/ar/foods/*` band vs. English tail); `STATE.md:33` («المتبقي بقرار مالك بعد أدلة
  GSC»); `sitemap-foods.xml` policy (band not yet wired into the sitemap criterion).
- **GSC DATA:** `[page]` filtered by prefix (`/ar/foods/` vs `/foods/`) — impressions/clicks/CTR
  trend since 2026-09-19 (the batches' landing date).
- **ACTION:** monthly automated evidence row (band vs tail: impressions, clicks, indexed-pages
  proxy) appended to the collector output + admin view; the owner's batch-4 / sitemap-wiring
  decision gets numbers instead of "the window is open".
- **STATUS:** **MISSING** — three batches (2,409 foods) shipped; the measurement window was
  declared open (`docs/README.md:70-72`) with nothing collecting it.
- **LIMITS:** needs ≥30 days of accumulated collector history before the first gate reading
  (G1 must land first); zero-click sparsity early; deep-tail (6,341 pages) will stay invisible
  until the sitemap wiring actually changes.
- **LOOP:** arabize batch → GSC shows /ar/foods impressions trend → owner gate decision
  (expand/hold/wire-sitemap) → next batch or wiring → next month's row validates the decision.

### IP-3 — USDA long-tail sitemap re-admission decision (the ~2026-12-07 data station)

- **WHERE:** `sitemap-foods.xml` route (policy comment: the 8,750-page English-tail decision
  waits for "90 days of Search Console coverage data"); `docs/SEO-GEO-MASTER-PLAN.md:355/:595`;
  Phase-141 policy (tail indexable-but-unadvertised).
- **GSC DATA:** `sitemaps.list/get` (foods sitemap processed/errors/warnings) + `[page]`
  impressions on `/foods/*` + URL-Inspection sampling of tail URLs (G4).
- **ACTION:** at the data station, produce the evidence pack: band-vs-tail performance, sitemap
  acceptance state, sample index-state of unadvertised tail URLs → owner decides
  keep-withdraw / advertise (`sitemap-foods-long.xml`) / noindex-tail.
- **STATUS:** **MISSING** — the decision is promised on a date with no data pipeline feeding it.
- **LIMITS:** the Index Coverage report has **no API** — "Crawled - currently not indexed"
  classifications cannot be read programmatically; the pack must approximate via sitemaps API +
  sampled inspections; GSC's own 16-month retention is irrelevant here but the local snapshot
  preserves the window.
- **LOOP:** policy decision on evidence → (if changed) sitemap/noindex change ships → sitemaps
  API + sampled inspections later validate whether Google honored the new policy.

### IP-4 — Sitemap acceptance monitoring (the "Couldn't fetch" class, permanently)

- **WHERE:** 7 sitemap surfaces (`robots.txt:46-52` + index + 6 children); the documented
  incident `src/app/sitemap.xml/route.ts:13-21` (GSC/Bing "Couldn't fetch" ~12h post-deploy; the
  fix was defensive — forced `lastmod=today`).
- **GSC DATA:** `sitemaps.list`/`get` read state per submitted sitemap: `isPending`, `errors`,
  `warnings`, `lastDownloaded`, processed counts.
- **ACTION:** the weekly collector records the 7 sitemap states into the run row; a child that
  stays failed/pending > 48h becomes a queue-health-style issue + run-summary alert (the
  existing observability pattern, R5 precedent).
- **STATUS:** **MISSING** — mitigation today is passive (forced lastmod); nobody checks whether
  Google actually accepted.
- **LIMITS:** read scope suffices; GSC fetch-cache lag ~24h is normal (documented in-repo) — the
  alert threshold must respect it; `sitemaps.submit` (auto-re-submit) would need the full scope
  — owner decision, G4 option.
- **LOOP:** deploy → collector observes sitemap re-download/processing → anomaly → alert/fix →
  next week's run validates the fix.

### IP-5 — New-content index verification (P5 → inspected-next-day)

- **WHERE:** `/api/cron/blog/p5-publish` (publish moment); `blog_generation_queue` bundle (the
  stamp precedent: `researchSource`, `repairLoop`); `/api/ai/queue-health` (issue surface).
- **GSC DATA:** URL Inspection API — index status, last-crawl, canonical, robots state for each
  newly published post URL.
- **ACTION:** daily/weekly sampled inspection of URLs published in the last N days → stamp
  `inspectedAt`/`indexState` into the queue bundle → a post not indexed after X days raises a
  queue-health issue (not a gate — never blocks publishing).
- **STATUS:** **MISSING.**
- **LIMITS:** quotas (~2,000/day) mandate sampling (only new posts + a rotating sample); the
  API is documented as requiring the **full `webmasters`** scope **[verify]** — if confirmed,
  this is a scope decision (§7.3) or a second SA; inspection reflects the **last crawl**, so
  "not indexed yet" is normal for days — thresholds must be generous.
- **LOOP:** publish → inspect after days → not indexed → investigate (robots/canonical/quality)
  → fix or accept → later inspection validates.

### IP-6 — CTR / meta-title optimization loop (value-ranked, not blanket)

- **WHERE:** `src/lib/blog-meta-title.ts` (the clamp law — single source); the
  `meta-title-remediation.yml` channel (today: scope-driven over ALL published rows);
  `og:image`/title surfaces (AUDIT §9 0.5 already tied OG to CTR).
- **GSC DATA:** `[page]` + `[page, query]` — impressions, CTR, position; site-median CTR by
  position band.
- **ACTION:** a monthly backlog ranked by *opportunity* (impressions ≥ threshold ∧ position
  ≤ 20 ∧ CTR below median) → the existing remediation channel runs on that allowlist instead of
  the whole table; each rewrite's effect is measurable 2–4 weeks later.
- **STATUS:** **PARTIAL** — the remediation rail exists and is proven; the ranking evidence and
  the post-change validation do not.
- **LIMITS:** CTR noise at low impressions (early site!); title changes re-index slowly;
  never let CTR evidence weaken the meta-title LAW itself (the clamp stays byte-identical —
  only the *selection* of rows becomes evidence-driven).
- **LOOP:** GSC flags low-CTR/high-impression pages → allowlisted remediation → SERP re-crawl →
  next month's CTR rows validate the lift.

### IP-7 — Remediation-channel prioritization + post-change validation

- **WHERE:** the DRY_RUN-first remediation family — `link-db-remediation.yml`,
  `stats-db-remediation.yml`, `content-audit-db-remediation.yml`, `legacy-ar-cleanup.yml`
  (all proven channels writing whitelisted `blog_posts` fields).
- **GSC DATA:** `[page]` clicks/impressions (page search-value).
- **ACTION:** order future remediation batches by page value (fix the pages real users actually
  reach first); after each APPLY, track the affected pages' impressions/position trend as the
  validation half of the channel (today channels verify content-state, never search-effect).
- **STATUS:** **MISSING** (the prioritization + validation halves).
- **LIMITS:** attribution lag 2–4 weeks; confounds (Core Updates, seasonality) — validation
  reports trends, not causal proof.
- **LOOP:** GSC ranks pages → channel remediates top pages → GSC trend later shows whether the
  remediation moved anything.

### IP-8 — Recurring cannibalization detection (evidence-driven successor of 0096)

- **WHERE:** migration `0096` (one-off cluster fix: 2 unpublishes + 4 retitles),
  `next.config.ts:97-177` (8 consolidation 301s), `src/lib/intent-map.ts` (22 hand-curated
  clusters with `queries[]` — zero impression data attached), the blog topic dedup gate
  (`isDuplicateTopic`, `findBlogIntentCollision`).
- **GSC DATA:** `[query, page]` rows — a query surfacing ≥ 2 distinct site pages is the
  cannibalization signal.
- **ACTION:** monthly scan over collected rows → flagged clusters (query, pages, split
  impressions/positions) → owner decision per cluster (301/canonical/retitle/intent-split) →
  executed through the EXISTING rails (next.config redirects + a 0096-style data migration +
  the remediation channels).
- **STATUS:** **PARTIAL** — the action rails exist and are proven; detection was a one-off
  manual audit; the intent map's queries are hand-curated, not evidence-fed.
- **LIMITS:** needs lowercase/trim query normalization; needs ≥2-page rows (low-traffic early
  site will produce few clusters — that is honest); the AUDIT §9 target «عناقيد cannibalization
  0 (مراقبة شهرية)» explicitly calls for monthly monitoring.
- **LOOP:** detection → owner decision → rails execute → next month's `[query, page]` rows show
  whether the cluster collapsed into one page.

### IP-9 — Rebrand/migration monitoring (old property → new property)

- **WHERE:** the OLD property `https://musclehubeg.vercel.app/` (live, visible to the SA —
  discovered by the connection test); host-level 301s (verified live, §1.2); rebrand migration
  `0070`; brand-name law (AGENTS §8).
- **GSC DATA:** both properties' `[page]`/`[query]` rows — residual impressions/clicks still
  attributed to old-property URLs, and new-property growth.
- **ACTION:** weekly collector covers BOTH properties (the test already does); monitor old-url
  residual signal decay (should → 0 as 301s consolidate); confirm nothing new canonicalizes to
  the old host; define a retirement threshold for dropping the old property from collection.
- **STATUS:** **MISSING** — the 301s exist; the monitoring does not.
- **LIMITS:** GSC has **no Change-of-Address API** (UI-only feature); data lives per property
  (domain property vs URL-prefix property must be reported separately, never summed blindly);
  old-property history expires at ~16 months — snapshot locally if it matters.
- **LOOP:** rebrand shipped → GSC shows residual old-property impressions → anomalous stickiness
  → investigate redirects/canonicals → later rows validate decay.

### IP-10 — GEO / AI-answers visibility correlation (the GEO-M evidence pair)

- **WHERE:** `geo-answer-visibility.yml` (monthly 07:00 UTC 1st, 24 queries, model-proxy — its
  own honesty note: it probes the site's free AI chain, not real engines);
  `docs/SEO-GEO-MASTER-PLAN.md:443` (GEO-M baseline 0/24, manually copied row); §643-646 KPI
  table; `SEO-CWV-THRESHOLDS.md:108` (AI Overviews appearance already researched).
- **GSC DATA:** total impressions/clicks trend + `searchAppearance` dimension where available
  (AI Overviews appearance data — availability varies **[verify]**).
- **ACTION:** the collector's monthly run (1st of month, before the 07:00 probe) produces the
  GSC side of the row; the pair (GEO probe result ∧ GSC trend) lands in one monthly evidence
  row — automating what today is a manual copy into the plan's table.
- **STATUS:** **PARTIAL** — the probe exists and is scheduled; the GSC side and the pairing do
  not exist.
- **LIMITS:** AI Overviews appearance reporting varies by property/region; the probe's
  model-proxy nature stays (documented honesty note — do not silently claim it measures real
  engines).
- **LOOP:** content/GEO improvements → GEO probe visibility % + GSC impressions trend → both
  measured next month → strategy adjusts.

### IP-11 — Owner review-queue prioritization (0097 workflow, exposure-ordered)

- **WHERE:** migration `0097` (`review_status='pending'`, `last_reviewed_at`), the admin
  «اعتماد» button (`POST /api/admin/blog/review`), STATE's owner-pending item (pending articles
  review); honest-review law (`seo.ts:428-441` — pending articles honestly omit
  `lastReviewed`/`reviewedBy`).
- **GSC DATA:** `[page]` impressions/position for published-pending posts.
- **ACTION:** order the pending review queue by *emerging search exposure* — articles already
  earning impressions get reviewed first, because YMYL E-E-A-T risk is highest where real users
  already land on an unreviewed AI-generated medical-adjacent article.
- **STATUS:** **MISSING** (queue order is recency-based).
- **LIMITS:** young posts have no impressions yet — age-based fallback ordering needed; this is
  an ordering/read-only change to the admin view, never an automatic `last_reviewed_at` writer
  (the 0097 law is absolute).
- **LOOP:** publish (pending) → GSC shows which pending articles earn impressions → owner
  reviews them first → review flips the honest schema claims → later CTR/position trend on
  reviewed articles measures the E-E-A-T investment.

### IP-12 — Owner search-console surface (admin visibility, the evo-analytics precedent)

- **WHERE:** the proven precedent: `/api/admin/evo-analytics` (`requireAdmin`-gated, 5 tables,
  30-day window, bounded limits) + `AdminEvoAnalyticsView.tsx` (7 honest sections);
  `/api/ai/queue-health` (same gating, bundle-stamp counters).
- **GSC DATA:** everything the collector stored (§5).
- **ACTION:** a `requireAdmin`-gated read-only route + view section/page: 28-day totals trend
  (both properties), top queries, top pages, biggest movers (period-over-period), sitemap
  health, the GEO pair row, and the queue-health GSC counters. The Vercel route reads ONLY the
  local Supabase snapshot tables — never calls Google live (secret stays GHA-only, §7).
- **STATUS:** **MISSING** — the owner today has zero search visibility in the admin; the pattern
  to copy is one `requireAdmin` route + one client view away.
- **LIMITS:** data as fresh as the collector cadence (weekly), not live; no new external HTTP
  call (AGENTS §7 review would be triggered by any new external fetch — avoided by design).
- **LOOP:** operations above change things → the owner sees the effect in one place → next
  owner orders are informed by the same surface the evidence came from.

### Integration points considered and rejected (honesty list)

- **GSC as a *writer*** (URL submission, removals, sitemap submit, change-of-address): rejected —
  read-only scope is a security property worth keeping; write ops are per-item owner decisions
  (§7.3), and the Indexing API is not applicable to this content class.
- **GSC data into EVO chat grounding / `llms-full.txt` emphasis**: plausible future (top real
  user queries → EVO reference set), but premature at ~4k impressions/28d — parked as a future
  option, not a phase.
- **GA4 integration**: out of scope of this audit (GSC-only order); the plan already pairs them
  in the KPI table.

---

## 5. Proposed reusable architecture — "one collector, one store, many readers"

The design principle that makes GSC an **ongoing capability** instead of a one-off report:

> **Credentials touch exactly ONE place; data touches everything.**

```
                        ┌──────────────────────────────────────────────────────┐
   Google Search        │  GitHub Actions: gsc-collect.yml  (weekly + monthly  │
   Console API  ◀──────▶│  + dispatch)  →  scripts/gsc/collect.py              │
   (readonly scope)     │  port of the PROVEN gsc-connection-test.yml v2 code: │
                        │  JWT/openssl, sites.list, searchAnalytics/query,    │
                        │  sitemaps.list — stdlib only, zero installs         │
                        └───────────────┬──────────────────────────────────────┘
                                        │ service-role REST insert (own tables only)
                                        ▼
                        ┌──────────────────────────────────────────────────────┐
                        │  Supabase (new migration 00NN, RLS deny-anon):       │
                        │  gsc_runs        — one row per run: window, property,│
                        │                    totals, sitemap states, errors    │
                        │  gsc_metrics     — dimension rows (date/page/query/  │
                        │                    device): clicks, impressions, ctr,│
                        │                    position; unique per window+keys  │
                        └───────────────┬──────────────────────────────────────┘
                                        │ read-only
        ┌───────────────┬───────────────┼────────────────────┬─────────────────┐
        ▼               ▼               ▼                    ▼                 ▼
  P0 research      /api/ai/         /api/admin/          evidence gates    run summary +
  (blog-research   queue-health     search-console       (food band,      worklog rows
   grounding       (GSC counters)   (requireAdmin)       cannibalization) (manual copy —
  block;                                                                  identity law)
  researchSource:"gsc")
```

### 5.1 Why each choice (all anchored in existing repo law/precedent)

- **GHA, not Vercel, holds the credential.** Scheduled jobs follow the native-GHA pattern
  (AGENTS §8 PROVIDER LAYER: "scheduled/batch AI follows the native-GHA pattern, never new
  Vercel-capped endpoints"); Vercel routes must never call Google (60s/function caps, Hobby
  usage meters, and the secret would have to leave GitHub — breaking the GHA-only secret
  hygiene the connection test established). The secret NEVER appears in `.env.example` /
  Vercel env.
- **Port the proven code, don't rewrite it.** `gsc-connection-test.yml`'s inline Python is
  already live-proven twice (auth, both properties, failure isolation, secret handling). The
  collector keeps: stdlib-only (A-12), no checkout, `permissions: contents: read`, 0600
  `$RUNNER_TEMP` credential + `always()` cleanup, per-property failure sections, honest exit 1,
  `RESULT` machine-readable lines, concurrency group with `cancel-in-progress: false`, 10-min
  timeout. It ADDS: date-bucketed queries (so history accumulates — the 28-day rolling window
  forgets; GSC itself forgets at ~16 months), top-50/100 rows instead of 20, both `[query]`,
  `[page]`, and `[query, page]` dimension sets, `sitemaps.list` state capture, and the Supabase
  insert (service-role REST via stdlib `urllib` — no installs; the `.mts`+supabase-js runner
  pattern is the documented alternative if typing is preferred).
- **Snapshot philosophy.** Store what Google will forget. Weekly cadence (e.g. Mon ~06:30 UTC,
  after the weekend's `final` data settles) + monthly deep run on the 1st (before the 07:00 GEO
  probe — IP-10 pairing). A `dry_run` input (default `1`) matches the remediation-channel law
  family for the first dispatches; collection is read-only toward Google and writes only its
  own tables, so flipping to apply is low-risk.
- **Consumers never authenticate.** P0, queue-health, the admin view, and the gates all read
  local tables via the existing patterns (cron routes service-side; `requireAdmin` for admin
  API; canaries per law). A thin `src/lib/gsc-data.ts` read helper (G2/G3) is the single typed
  interface agents/workflows import — one law, no forks (the editorial-law precedent).
- **Scope policy is a security property.** Keep `webmasters.readonly` as the collector's scope.
  Any capability needing the full scope (`sitemaps.submit`; URL Inspection **[verify]**) is a
  separate owner decision with its own row here (§7.3) — never a silent scope widening.
- **Compliance landing checklist for the G1 commit** (the same-commit laws): CI_GATES.md row
  (check N) · workflow committed with its script (guard-commitment corollary) · migration 00NN
  + `supabase/migrations/INDEX.md` row + `src/lib/supabase/types.ts` regen + `migration_audit`
  green · registry row (check M) · worklog entry (H-family) · STATE refresh ·
  RECOVERY-SECRETS-SOURCES.md row for the GHA secret (its own law, `:93`) · delete
  `gsc-connection-test.yml` **by owner order** once the collector proves the same two
  properties (its own header instructs this).
- **RLS for the new tables:** no anon/authenticated policies (deny-by-default); writes
  service-role-only from GHA; reads via `requireAdmin` service client — the evo-stats family
  pattern.

### 5.2 What the architecture deliberately avoids

- No new external HTTP calls from Vercel routes (AGENTS §7 would require pre-approval —
  avoided entirely by the local-snapshot design).
- No auto-commits from workflows (identity law §10 — evidence goes to DB/summary; docs rows
  are manual).
- No writes to any Google property, any existing table, or any content row — the collector
  touches ONLY its own two new tables. Everything else in §4 is a READ of that data plus the
  existing action rails.
- No new dependency (A-12: stdlib only).

---

## 6. Missing capabilities / setup (the gap list, consolidated)

1. **No consumer** of `GOOGLE_SEARCH_CONSOLE_CREDENTIALS` (the temporary test aside).
2. **No storage** — no search-performance tables exist in any migration.
3. **No admin surface** for search data (owner sees EVO stats only).
4. **No recurring schedule** — connection test is dispatch-only by design.
5. **`researchSource` lacks a `"gsc"` class**; queue-health has no GSC counters.
6. **Secrets-registry gap** — `RECOVERY-SECRETS-SOURCES.md` row for the GSC secret missing
   (the `.env.example` absence is CORRECT — GHA-only secret).
7. **`AGENTS.md:164` is stale** ("owner-blocked" — credentials now exist and are proven).
8. **No query↔page evidence** for recurring cannibalization detection (0096 was one-off).
9. **No sitemap acceptance monitoring** (mitigation is passive).
10. **No index verification** for newly published posts.
11. **No data-retention strategy** — without local snapshots, every long-horizon decision
    (foods 90-day gate, 16-month horizons) loses its evidence window.
12. **The KPI table (plan §643-646) and GEO-M pairing are manual copy** — nothing automates
    the GSC side.

---

## 7. Limitations (API, data, and project-law)

### 7.1 GSC API / data constraints
- Read-only scope ⇒ no sitemap submission, no URL submission, no removals. Indexing API is
  JobPosting/BroadcastEvent-only — not applicable (§3).
- No public API for Index Coverage classifications, CWV field data (CrUX is a separate API),
  manual actions, Core Update annotations — those remain manual owner checks (already assumed
  by the plan's alert playbook).
- URL Inspection: ~2,000 calls/day (sampling only); possibly full-scope requirement
  **[verify]**; reflects last crawl, not live state.
- Search Analytics: `final` data lags ~2–3 days (hourly `dataState=all` exists but unsettled);
  rare queries anonymized; ~16-month retention; quotas are no constraint at this scale.
- Own-queries-only semantics: GSC cannot discover demand the site has never earned impressions
  for — it complements (never replaces) LLM topic ideation (IP-1).
- Property split: `sc-domain:alkemos.com` vs the old URL-prefix property — separate datasets;
  the ~2026-12-07 station and any trend math must state which property it used.

### 7.2 Project-law constraints (binding on the implementation)
- Each phase G1–G5 executes **only by explicit owner order** naming the phase (§12.10 /
  D-rules style); one task = one commit; docs in the same frame (§3.8).
- §3.3: the collector never modifies production content data — only its own new tables.
- §10 identity law (muscleshubfit@gmail.com) + no workflow auto-commits; `[vercel skip]` only
  for docs-only frames — G1 (supabase/) and G2/G3 (src/) are real deploys.
- Migration law (§6): idempotent, RLS in-file, INDEX.md row, types.ts regen, no renames.
- The paid-model item of AUDIT §9 Phase-1 remains a separate owner decision — GSC grounding
  works with the free chain and does not presume it.

### 7.3 Explicit owner-decision points inside the plan
1. **Scope widening** (full `webmasters`) if URL Inspection requires it — or keep readonly and
   drop IP-5 (nothing else needs write scope; `sitemaps.submit` is optional convenience).
2. **Deleting `gsc-connection-test.yml`** after the collector proves both properties (its own
   header + CI_GATES row say "by owner order").
3. **Cadence choice** (weekly default; monthly deep) and retention pruning policy for the
   snapshot tables (Supabase free-tier size discipline — e.g. keep `[query,page]` rows 90 days,
   aggregate older).
4. **Whether the old property stays in collection** after residual signal decays (IP-9).

---

## 8. Proposed implementation phases (dependencies + files + verification)

All phases assume the G1 foundation. Sizes are honest one-commit frames, not epics.

### G1 — Permanent collector + storage (foundation; ~1 frame)
- **Files:** `.github/workflows/gsc-collect.yml` (new; weekly Mon 06:30 UTC + monthly 1st
  06:00 UTC + dispatch; input `dry_run`) · `scripts/gsc/collect.py` (port of the proven test
  code + date-bucketed queries + both properties + sitemaps.list + Supabase REST insert) ·
  migration `00NN_gsc_snapshots.sql` (`gsc_runs` + `gsc_metrics`, RLS deny-anon, indexes) ·
  INDEX.md row + `types.ts` regen · CI_GATES row · RECOVERY-SECRETS-SOURCES row · registry row
  · worklog + STATE.
- **Depends on:** nothing (credentials + auth code already proven).
- **Verification:** dispatch run green; rows visible in Supabase; both properties reported
  (matching the connection-test RESULT lines); re-run idempotent (upsert semantics); honest
  failure path proven by temporarily wrong property (or trust the ported per-property
  isolation tests).
- **Rollback:** disable the schedule (workflow edit); tables are additive and harmless to
  drop by a later owner-ordered migration.

### G2 — P0 research grounding (IP-1; ~1 frame; depends G1)
- **Files:** `src/lib/gsc-data.ts` (read helper) · `src/lib/blog-research.ts` (grounding block
  in `researchLanguage()` + candidate ranking) · `/api/cron/blog/p0-research/route.ts`
  (`researchSource` gains `"gsc"`/`"gsc+model"` stamp) · `/api/ai/queue-health` (GSC-grounded
  share counter, fallback counter untouched) · AGENTS §8 RESEARCH law update (the now-stale
  `:164` owner-blocked sentence) · canaries (research-grounding test + queue-health counter
  test + researchSource contract pin).
- **Verification:** unit battery + one live EN or AR run whose bundle shows
  `researchSource:"gsc+model"`; queue-health shows the new counter.
- **Rollback:** env flag `GSC_GROUNDING=0` (the R2/R3 rollback precedent) restoring the exact
  current behavior.

### G3 — Owner surface (IP-12; ~1 frame; depends G1, parallel-safe with G2)
- **Files:** `src/app/api/admin/search-console/route.ts` (`requireAdmin`, reads local tables
  only) + a view (extend AdminEvoAnalyticsView pattern or a new admin page per
  AppLayout/`coachExtraLinks` admin-listing law) + `check-ui-wiring` compliance + FEATURE
  README law (README row) · canary for route gating.
- **Verification:** admin session sees 28-day totals + top queries/pages + movers + sitemap
  health; anonymous 401.
- **Rollback:** route/view removal (additive only).

### G4 — Sitemap + index operations (IP-4 + IP-5; ~1 frame; depends G1 + scope decision §7.3-1)
- **Files:** extend `collect.py` (already captures sitemap states in G1) with the >48h
  stuck-child alert into run summary + a queue-health issue row · (optional, only if scope
  decision) URL Inspection sampler for posts published in the last N days, stamping the queue
  bundle `inspectedAt`/`indexState` (≤ quota budget, rotating sample).
- **Verification:** a full week of green collector runs; forced-stuck simulation locally.
- **Rollback:** alert-only components are inert; inspection sampler disabled by input.

### G5 — Evidence-driven gates & scans (IP-2, 3, 6, 7, 8, 9, 11; ~2–3 frames; depends G1 + 30–90d accumulation)
- **Files (per gate, each its own frame):** food-band evidence query + monthly row (IP-2) ·
  the ~2026-12-07 long-tail evidence pack generation (IP-3) · opportunity-ranked meta-title
  backlog generator feeding the EXISTING `meta-title-remediation.yml` allowlist input (IP-6;
  the channel already accepts `slugs`) · value-ranked remediation ordering + post-APPLY trend
  report (IP-7) · monthly cannibalization scan → owner report (IP-8) · old-property decay
  report (IP-9) · review-queue exposure ordering in the admin blog view (IP-11).
- **Verification:** each produces a DRY_RUN/first-report artifact the owner reads before any
  write; action still rides the existing rails.
- **Rollback:** all read/report-only; nothing to roll back beyond the report generator.

**Dependency graph:** G1 → {G2, G3, G4 (scope), G5 (G5 also needs 30–90 days of G1 history)}.
Nothing in G2–G5 touches the collector's auth layer. Total: ~6–8 commits across the phases.

---

## 9. The future execution starting point (binding)

**The first implementable frame is G1**, exactly as scoped in §8, gated by one owner order.
Minimum viable evidence that G1 succeeded: a dispatched `gsc-collect` run that (a)
authenticates with the existing secret, (b) reports BOTH properties with permission levels,
(c) writes `gsc_runs` + `gsc_metrics` rows for the latest complete window, and (d) captures
the 7 sitemap states. After two green weekly runs, G2 (P0 grounding — the audit-report §9
Phase-1 deferred item) is the highest-value next frame, because it closes the only loop that
feeds the site's core daily operation (content selection) with the only real demand data the
project has ever had access to.

Success metrics already promised by the project that this plan pays into: fallback research
rate 24% → ≤3% (AUDIT §9), monthly cannibalization monitoring (§9 targets), the food-band
gates (STATE), the 90-day USDA station (plan §355/§595), and the KPI table (plan §643-646).

---

## 10. Honesty statement

- This audit implemented NOTHING. §8 is a plan awaiting owner orders; §2.3/§2.4 record the
  state as found, including the stale `AGENTS.md:164` sentence (a fact, not a fix).
- External API facts marked **[verify]** were not testable from this repo (no API calls were
  made by the audit itself); they are documented engineering assumptions to confirm in G1.
- The measured 28-day baseline (§2.1) is a point-in-time snapshot from the owner-dispatched
  connection-test runs (run IDs cited); it will age — the collector exists to make such
  numbers continuously available instead of frozen.

## 11. Documentation footprint of this audit (this commit)

- NEW: `docs/GSC-OPERATIONAL-INTEGRATION-AUDIT-2026-09-30.md` (this file) + its
  `docs/README.md` registry row (check M, same-commit law).
- `worklog.md`: one entry (Task ID `GSC-OPERATIONAL-INTEGRATION-AUDIT-2026-09-30`) + rotation
  to `archive/WORKLOG_ARCHIVE.md` if the 12-entry window overflows (H5 law).
- `STATE.md`: "المفتوح الآن" gains the GSC-plan pointer; last-updated line refreshed.
- Zero changes to: any `src/**`, `.github/**` (workflows), `supabase/**`, `next.config.ts`,
  `vercel.json`, `.env.example`, or any other application file.


