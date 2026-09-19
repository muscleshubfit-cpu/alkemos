# Non-Blog Content Rewrite — Execution Report

**Executed:** 2026-09-19 (UTC) · **Final content quality gate:** 2026-09-19 (UTC) · **Scope:** all public non-blog pages, Arabic + English
**Strategy source of truth:** `docs/content-strategy.md` (v1.1, revised in the quality gate)
**Law applied:** copy follows the implementation; claims must be verifiable; Arabic is an
independent market written in natural MSA — never a translation of English.

## 1. What was rebuilt and why

### 1.1 Critical copy-vs-implementation errors (fixed)

1. Schema "5 generations per day" (retired limit) → unified pool: 2/month for visitors (`tool-schema.ts` ×4).
2. Schema "nothing saved" for AI planners → persistence law: device → free-account permanent (`tool-schema.ts` ×2).
3. AI workout planner "4–6 exercises/day" vs validator 3–8 → corrected to 3–8.
4. Program detail pages rendered the WRONG-language description (AR page showed EN) → ternary swap fixed (`ProgramDetailClient.tsx:121`).
5. Coaching Service schema advertised retired Starter/Elite range ($20–$40, 2 offers) while the page sells one $39.99 plan → single Offer $39.99 (`seo.ts`).
6. Meal-planner metadata promised "download or export for free" (export is paid) → honest save/export split (EN+AR layouts).
7. Water-tracker EN title promised "Reminder" (no such feature) → "Daily Hydration Goal & Log".
8. Macro-calculator metadata claimed goal-based (no goal input exists) → calorie-target + presets reality (EN+AR).
9. AI meal-planner systems "match the macro calculator" → they match the diet-plan library (4 systems).
10. FAQ visible copy vs FAQ JSON-LD drift ("human optimization platform"; "coach" vs "team" reviews) → single-source refactor: visible Q&As derive from `faq-content.ts`.
11. MFP comparison EN "20-year head start" vs AR "سبع سنوات" → AR corrected (MFP launched 2005).
12. OfferCatalog Free = "Limited access to basics" vs page "not a crippled demo" → honest free-tier description.
13. EN program meta leaked raw enum values ("for general. home.") → human labels via GOAL/LOCATION/LEVEL maps (EN+AR).
14. Contact page: logged-out visitors saw "Message sent! We'll reply soon" (message only saved to localStorage) → honest routing copy.
15. Meal-planner tier badge rendered raw Latin slug in Arabic UI → TIER_NAME_AR map (مجاني/بريميوم/برو/كوتشينج).

### 1.2 Unproven claims (removed or softened)
- "Most Popular" Pro badge (zero-subscriber reality) → "موصى بها / Recommended".
- "certified coaches / مدربون معتمدون" without a named certifier → "professional/human coaches" (About, coaching trust card, EVO grid, Organization schema, PageBottomPromo).
- "vetted coaches" in all three comparisons → "a human coach at $39.99/mo".
- AR vision "المنصة الأولى للكوتشينج" stated as fact → ambition framing.
- "leading fitness platform" → goal framing; "for fast fat loss" → "built for fat loss".
- Bands "cost less than $20" → "usually cost less than $20"; "Free and accurate" puffery → method + numbers; unqualified "الأدق" → dropped.

### 1.3 Arabic quality (MSA) — dialect eliminated from public surfaces
Fixed Egyptian/colloquial strings on: water tracker (كوبساتك/بيتخزن/فاضل/اكتب وزنك صح), body-fat (لازم يكون), tool CTAs (محتاج), meal planner (حدك الأقصى/باقتي/فطار), register page (فيه مشكلة… جرب تاني/ضيف/اقبض), LeadCaptureCard (حصل خطأ/بعتنا لك), program rest-day (خد راحة… بيحتاجها), exercise share (التمرين ده), food detail (شوف… تتحدث/أكلات مشابهة), PageBottomPromo (جاهز توصل), privacy CTA (تحب تغيّر), questionnaire hint (عشان الكوتش), EVO weekly emails (مفيش/ده/لو لأ/مع بعض/مش/لسه/معندكش), EVO chat error (حصل خطأ), name validation (لازم يكون), profile toasts (جرب تاني).

Garbled AR in hub depth content fixed: الشراگ، الخفاقات (shakes→failures)، الأدهم، تُهدّم الشهية (reversed meaning)، سهلة البلوج، مِح طعامك، النصيحة الحسّية المعيارية، رسّ الوجبات/الترسير، كأي أحد، يقبلله، الانقباض الجانبي، تستطيع الثقل، رجّ حديدي، بمونة EZ، تحارب وزن الجسم، بمحاولة تففشل، يوم ضخ، حصان العمل، and the vegetarian collection's invented "اللابنكي/للنسخة اللبنية" naming.

### 1.4 Terminology unified (strategy §3)
- Tool names identical across hub/header/footer/cross-links/schema (حاسبة مؤشر كتلة الجسم، حاسبة نسبة الدهون، متتبع شرب الماء…).
- Units: سعرة (not كالوري/سعر)، جم (not غ)، Western digits everywhere، الفطور، تثبيت الوزن، الكتلة الصافية، مكتبة الأطعمة title/H1 unify، جميع تمارين X، 868+ تمرينًا / 8,830+ صنفًا غذائيًا grammar.
- MUSCLE_LABELS: الخلفية→أوتار الركبة، اللات→الظهر العريضة، الترابيس→شبه المنحرفة.
- Food tags: untranslated "vegetarian"→نباتي؛ للتخسيس→لخسارة الدهون؛ للتضخيم→لبناء العضلات.

### 1.5 SEO / GEO
- Homepage positioning triplet unified across H1/meta/OG/twitter (EN+AR); keyword array de-stuffed (48→13); dead `landing.*` i18n block deleted.
- AR tools subtree titles lost their "— Alkemos" suffix (nested plain-string layout resets the parent template — live-verified): `/ar/tools/layout.tsx` now pins an absolute hub title + re-declares `template: "%s — Alkemos"` so all five tool pages carry exactly one brand suffix.
- og:locale ar_AR → ar_EG (muscles/equipment/collections/compare-detail/authors).
- "protein calculator" keyword de-duplicated (calorie page); tool-hub metadata now lists all 8 tools.
- About page gained its first internal links (new optional `links` renderer in StaticPageView).
- AR programs meta enriched with real level/location labels; "six comparisons" stale comment → 3; footer year dynamic.

### 1.6 Honesty & conversion
- Memberships meta no longer appends "unlimited EVO" to a tier list including Free; free-trial FAQ de-duplicated; aria-label="No" localized; CTA hyphens → dashes.
- Coaching clichés replaced ("Invest in yourself"/"Your new body is waiting" → concrete honest framing); "Not just a chatbot" ×3 → ×0 on /coaching (kept once on /evo).
- Contact: `[تواصل]` prefix language-aware; body matches the 24-hour promise.

### 1.7 Test pins updated
`marketing-msa-surface.test.ts` + `evo-followup.test.ts` pins moved to the new canonical strings (documented in-file).

## 2. Verification performed
- `tsc --noEmit` clean · `eslint .` clean · `vitest` 91 files / 1531 tests passing · `next build` 2055 pages, zero errors.
- Live spot-checks (next start): `/`, `/ar`, all `/ar/tools/*`, `/ar/memberships`, `/ar/evo`, `/ar/about`, `/ar/coaching`, `/ar/faq`, `/ar/foods`, `/ar/compare`, `/ar/programs/*` — brand suffixes, canonical naming, new copy verified.
- Final dialect sweep: zero colloquial hits on public pages (remaining matches are code comments, private app surfaces, or valid MSA verbs like واقبض على المقبض).

## 3. Out of scope (unchanged, documented)
Blog · the 868-exercise and 8,830-food data rows · business logic (prices/quotas/checkout — legacy starter/elite checkout paths intentionally left functional) · coach/admin private dashboards · E-E-A-T reviewedBy static-date mechanics · /muscles/cardio and /equipment/none empty-hub intros (owner decision needed).

## 4. Recommended follow-ups
1. Link-capable content blocks in tool reference prose (mentions are plain text).
2. Unique per-exercise tips (868 pages share two generic tips).
3. Quarterly re-verification of competitor data in `comparisons.ts` (dataAsOf 2026-09-15).
4. Coach/admin dashboard MSA pass (private surfaces).

---

## 5. Final content quality gate (2026-09-19, separate commit)

Scope: commit `770e3980` only — no new audit, no rewrite. All checks below ran against that
commit's work; every issue found was fixed directly.

### 5.1 `docs/content-strategy.md` corrections
- Date corrected to the actual execution date (2026-09-19 UTC; the previous 2026-09-20 stamp
  was off by one day). Version bumped to 1.1.
- Research sourcing made explicit: the 13 raw SERP result sets captured 2026-09-19 are now
  committed to `docs/research/2026-09-19-serp/` and cited per row in §2.
- Rows that were NOT SERP-captured (AR BMI cluster, EN calorie/TDEE cluster) are now marked
  **(desk)** so they can never be quoted as SERP findings.
- Competitor lists corrected to exactly what the stored result sets contain: prospre,
  Cronometer, TrueCoach, Everfit removed (never in the captures); replaced by the actual
  observed results (arabianbodybuilding, template.net, clove.kitchen, calfix, eatthismuch,
  mealthinker, nutriscan, promealplan, coachcatalyst).
- The unverifiable "$100–300/mo" global coaching range was removed; the row now points at the
  captured pricing guides without asserting an exact range.
- Superiority framing removed: the §2 column "who we beat / join" is now "What the results
  showed", plus an explicit **no-ranking-claims** note (snapshots ≠ rankings; Alkemos asserts
  no superiority over any named competitor).
- Fixed a garbled EN/AR hybrid string in the anti-cannibalization rules ("AI/tوليد").

### 5.2 Copy-vs-implementation fixes (4 code files)
1. `/meal-planner` EN title promised "Build & Download" and the OG description promised
   "download it for free" — but JSON export is Premium+ (`meal-planner/page.tsx` gate). Title
   → "Build Custom Meal Plans Free"; OG → "…8,830+ foods… — free, no signup" (matching the
   already-honest meta description). The meta/OG/title now agree with the gate and with the AR
   twin.
2. Water-tracker keywords still targeted the non-existent reminder feature
   ("hydration reminder" EN, "تذكير شرب الماء" AR) although the title/description had been
   fixed — keywords now describe what the tool does ("daily water intake", "سجل شرب الماء").
3. AR water-tracker og:title/twitter:title duplicated the long page title (siblings use the
   bare tool name) — aligned to "متتبع شرب الماء".
4. AR BMI title/og/twitter used "حاسبة كتلة الجسم BMI" while the H1, hub, nav, footer,
   cross-links and JSON-LD all use the canonical "حاسبة مؤشر كتلة الجسم" — metadata aligned
   to the canonical name ("مؤشر" added; "حاسبة كتلة الجسم" kept as a keyword variant).

Verified unchanged and accurate: premium-card "export and sync" (Premium does include
meal-planner export + saved-results export), calculator JSON download (free, any tier), PDF
(premium+), all tier numbers (2/4/8 generations, 10 msgs/day, 3–1/6–10/8–50 planner caps,
3/50/200 saved results, 3/6 swaps), all prices ($14.99/119, $29.99/239, $39.99/359).

### 5.3 Comparisons neutrality
- All three comparison pages keep factual, sourced cells with wins BOTH ways (Alkemos loses
  rows: food-database size, barcode, exercise count vs ExRx, community vs Freeletics) and
  verdicts that name who should pick the competitor.
- The MFP "280M+ users" figure was re-verified live (2026-09-19): Wikipedia attributes 280M
  users to the company for 2026; MFP pricing $19.99/mo · $79.99/yr also re-confirmed.
  Verification saved to `docs/research/2026-09-19-serp/en-mfp-users-verification.json`.

### 5.4 Production verification (alkemos.com, 2026-09-19)
Commit `770e3980` is deployed and live (earlier stale reads were CDN cache, `age: ~10,000s`).
- New copy confirmed live: EN+AR homepage positioning, memberships meta, meal-planner honest
  export split (EN+AR), EVO unified-pool language (EN+AR).
- Banned claims confirmed absent in production HTML: "Most Popular", "certified coaches",
  "مدربون معتمدون", "vetted", FAQ drift phrase, water-tracker "Reminder".
- AR tools brand-suffix law verified live on all five tool pages (exactly one "— Alkemos").
- og:locale ar_EG verified on AR hubs; FAQ JSON-LD verified identical to visible copy (20
  Q&As, single source `faq-content.ts`).
- Title sweep across 21 affected pages: no metadata/layout inheritance breakage.
- The gate's own fixes (water keywords, BMI canonical title, meal-planner EN title/OG) were
  re-checked live on production after the gate commit deployed — all confirmed.

### 5.5 Verification suite (gate commit)
- `tsc --noEmit` clean · `eslint .` clean · `vitest` 91 files / 1531 tests passing ·
  `next build` 2055/2055 pages, zero errors.

### 5.6 Out of scope (unchanged)
Blog · exercise/food data rows · business logic, prices, quotas, checkout · private dashboards.
