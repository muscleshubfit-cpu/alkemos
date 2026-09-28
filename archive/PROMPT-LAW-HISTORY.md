# PROMPT-LAW-HISTORY — أرشيف سرد قوانين التوليد (append-only)

> **القانون (AUDIT_REPORT §9-المرحلة 2, بند 6 — 2026-09-29):** دورة التشذيب
> الربع سنوية للتعليمات تنقل أي سرد مرحلي («Phase narrative») من ملفات
> الـ prompts إلى هنا حرفيًا — ملفات الـ prompts تحمل قانونها الحالي فقط.
> الأرشيف append-only: لا يُحذف ولا يُعدل؛ يضاف إليه فقط.

---

## الدورة الأولى — 2026-09-29 (PHASE2-QUALITY)

**سجل المراجعة «قانون حي × حارس × أثر مقاس» (الدورة 1):**

| القانون | الحارس | الأثر المقاس | القرار |
|---|---|---|---|
| Latin gate (176) | scanLatinContamination + P4/P5 gates + canaries | 0/49 لهجة؛ 6 إخفاقات latin-gate في عصر الإقران — حجب فعلي | إبقاء |
| بوابة الطول (0.3) | P5 word floor 1300 | مسودة 419 كلمة حُجبت حيًا (Phase 0) | إبقاء |
| بطارية P5 (1.4) | blog-quality-gates.ts | إخفاقا quality-gate في عصر الإقران — الحجب يعمل | إبقاء |
| حصة اليوم الواحد (171) | countAutomatedPublishedToday | 6 صفوف skipped_daily_quota في عصر الإقران | إبقاء |
| FAQ relevance (176) | filterFaqsByRelevance + canaries | إسقاط أسئلة خارج الموضوع موثق بالسجلات | إبقاء (مدمج أصلًا بمصدر دستوري واحد 298) |
| رؤية الـ fallback (1.3) | stamp + P0 alert + queue-health | الطابع يظهر في الصفوف الجديدة | إبقاء |
| الإقران الثنائي (157) | P0 protocol + P5 handshake | 8/143 صفًا فقط (السبب: ندرة نجاح نداء الاقتران) | تفعيل: نوافذ 72h/48h + retry + قياس queue-health — قرار المرحلة 2 |
| keyword chips الظاهرة | (قالب العرض) | حشو ظاهر 97/97 (قياس التدقيق) | **مُزال** (المرحلة 0) |
| سطر «Sources cited» | (قالب العرض) | ادعاء كاذب 97/97 (قياس التدقيق) | **مُزال** (المرحلة 0) |
| ادعاءات المراجعة الآلية | (قالب العرض + schema) | ادعاء كاذب 97/97 (C2/F2) | **مُستبدل** بسير المراجعة الصادق 0097 (المرحلة 2) |
| حصر المصادر المطلق (FACT GUARD) | prompt فقط سابقًا | 62/97 بلا رابط خارجي؛ F9 إحصاءات مختلقة | **تعديل**: سماح استشهاد بروابط سلطات + بوابة HEAD (المرحلة 2) |

**السرد المنقول حرفيًا (من blog-pipeline.ts):**

### blog-pipeline.ts — file header chronicle (Phases 1→189 overview)

```ts
/**
 * src/lib/blog-pipeline.ts — PIPELINE V2 · PHASES 1, 2, 4 (+ image guard)
 *
 * Owner directive 2026-08-27 — article generation restructured into:
 *   P1 outline  : pick ONE topic from P0 suggestions → SEO title,
 *                 subtitle, intro/5-7 H2/conclusion outline, LSI
 *                 keywords, image plan (subject + type per image).
 *   P2 content  : full 1500–2500-word article in the SAME language,
 *                 following the outline and naturally answering the
 *                 P0 FAQs.
 *   P4 review   : proofread/flow/dedup pass, keyword-coverage check,
 *                 conservative fact-check (never invent citations),
 *                 internal+external links, closing Call-to-Action.
 *
 * All calls go through callFreeAIFallbackChain (OpenRouter + Groq only,
 * strongest free models first, automatic fall-through to the next model
 * on failure). IMAGE MODESTY GUARD is enforced here on every prompt.
 */
```

### PHASE 173 — the Arabic MSA editorial-law narrative (owner directive)

```ts
// PHASE 173 (owner directive — Arabic editorial law): Modern Standard
// Arabic ONLY, natural and easy for EVERY Arabic reader (Pan-Arab). The
// old rule asked for «بنبرة مصرية/خليجية ودّية» — that wording is what
// produced Egyptian-dialect articles (live evidence: legacy AR posts use
// عشان/مش/ازاي/بتاع; the AR title defect «كم ماء احتاج»). The law now
// explicitly bans local dialects, dialect-only vocabulary, literal
// translation, weak grammar/spelling, and malformed headings, without
// imposing heavy literary Arabic or fixed sentence templates (no forced
// repetition across articles — natural phrasing per context).
// AUDIT_REPORT §9-المرحلة 1, item 2 (2026-09-29): the law TEXT now
// lives in src/lib/blog-editorial-law.ts (EDITORIAL_LANG_RULE — the
// single editorial constitution shared with the fallback generator);
// re-exported here under its historical name so every existing
// importer and canary keeps working (the Phase-175 AR_MSA_EDITOR_LAW
// move pattern, generalized per the audit's «دستور prompts موحّد»).
```

### PHASE 176 — FAQ section evidence narrative (protein-timing incident)

```ts
  // PHASE 176 (owner report «التعديلات الجديدة اختفت مرة أخرى» — live
  // evidence: the 09-11 protein-timing article force-fitted CREATINE and
  // INTERMITTENT-FASTING questions because the prompt dumped ALL ten
  // niche-generic P0 FAQs into instruction 4 and a weak P2 model answered
  // every one of them as body sections + FAQ cards): only research
  // questions that share vocabulary with THIS article's title ride into
  // the writing prompt at all (the same relevance matcher the
  // ensureFaqSection append path already used — one shared law).
```

### Phase SEO-GEO-6.3 / PHASE 189 — the meta-title clamp chronicle

```ts
// ═══════════════════════════════════════════════════════════════
// Phase SEO-GEO-6.3 (§12.19 P0-3) — SERP-safe meta title clamp
// ═══════════════════════════════════════════════════════════════
//
// PHASE 189 (SEO-GEO-10, deep-audit P1-1): the whole law block —
// META_TITLE_MAX, BRAND_SUFFIX_RE, TRAILING_JUNK_RE,
// DANGLING_CONNECTIVES, endsWithDanglingConnective, stripDanglingTail,
// stripDanglingConnectives, clampMetaTitle — moved VERBATIM to
// src/lib/blog-meta-title.ts (zero-dependency module) so render-time
// surfaces (blog-server.ts fetchBlogForOG + the client-side article
// share title) can apply the law WITHOUT importing the AI provider
// chain this file carries. Re-exported here unchanged — every existing
// importer (p5-publish, the Phase-181 remediation runner, the tests)
// keeps working; blog-meta-title-render.test.ts guards the
// single-source/no-duplication contract.
```

### PHASE 178 — the meta-description clamp chronicle (mid-word cuts)

```ts
// ─────────────────────────────────────────────────────────────────
// PHASE 178 — meta description clamp (the P0-3 title law, applied to
// descriptions). Live audit 2026-09-12: the legacy `.slice(0, 160)` in
// the P1 outline parser cut descriptions MID-WORD — 14 published rows
// carry SERP descriptions (and page intros — excerpt shares the same
// source) ending "…and equ" / "…tips, and equ" / "…لدع". The law:
//   1. Budget 158 EN / 160 AR (SERP display ~155-160).
//   2. Over-budget → cut at the LAST WORD BOUNDARY that fits.
//   3. Never end on a connector/punctuation island ("…and", "…و", "،").
//   4. Guarantee a sentence-final mark — a clamped description ends
//      cleanly, never mid-clause. Used by the P1 outline parse AND the
//      P5 publisher (excerpt + meta_description share the value).
// ─────────────────────────────────────────────────────────────────
```

### PHASE 176 — filterFaqsByRelevance forensics narrative

```ts
/**
 * PHASE 176 — deterministic FAQ relevance filter for the P5 lift (and
 * the research0 fallback faq_json). Live evidence: the 09-11
 * protein-timing article lifted SIX questions of which creatine-forms,
 * intermittent-fasting, and basal-metabolism questions were off-topic
 * for a protein-TIMING article — P4's model-ignored instruction alone
 * could not stop them. A question survives only when it shares ≥2
 * meaningful (prefix-normalized) words with the article's title+focus
 * hint. Degradation: an unusable hint (<2 words) keeps everything
 * (never false-drop on a broken hint). This FILTERS; it never adds.
 */
```

### PHASE 172.1 — FAQ lift forensics (live-run 34500011890)

```ts
  // PHASE 172.1 (live-run 34500011890 forensics — faqLifted:0 on a correctly
  // formatted FAQ): the writing model (nemotron) separates "**question**"
  // from its answer with a SINGLE newline, not the blank line the contract
  // shows. Parsing is therefore LINE-based, not block-based: any bold-only
  // line (or ### subheading) inside the section opens a question; any other
  // non-empty line appends to the open answer. Tolerates blank-line AND
  // single-newline formats, and multiple Q/A pairs inside one block.
  // `**Label:**` bold lines (trailing colon) stay answer text — they are
  // emphasis, not questions.
```

### PHASE 173 — closing-CTA removal narrative (owner directive)

```ts
  // PHASE 173 (owner directive — duplicate closing CTA removal): the
  // review step used to instruct the model to append a closing CTA
  // paragraph (the PHASE 62 CTA_VARIANTS rotation, five variants per
  // language). The article page ALREADY renders the BlogMembershipCard
  // after the article (coaching membership + plans + affiliate) — the
  // in-text CTA was a duplicate CTA, so the instruction and its
  // `ctaAdded` report field are REMOVED entirely. The editor article
  // generator and every other CTA location are untouched.
```

### PHASE 176 — the Latin-contamination repair-pass narrative

```ts
// ═══════════════════════════════════════════════════════════════
// PHASE 176 — Arabic Latin-contamination repair pass (P4 backstop).
//
// Owner report «التعديلات الجديدة اختفت مرة أخرى» — the 09-11 AR
// article shipped bare English INSIDE Arabic sentences ("يُ marketed"،
// "لا توجد evidences"، "shake مصل اللبن"، "الكرياتين alkalin").
// Prompt laws steer models; the weak free chain still drifts. This is
// the deterministic CODE side (the Phase-168 doctrine: facts belong to
// code, language belongs to the model):
//   1. scanLatinContamination (blog-msa.ts) detects the tokens
//   2. ONE targeted AI repair call replaces ONLY those tokens
//   3. validateMsaConversion re-gates the result deterministically
//      (links/images/headings/length preserved + zero dialect + zero
//      Latin) — a failing repair THROWS so the runner's ×3 retry
//      re-runs P4 with a fresh model draw
// ═══════════════════════════════════════════════════════════════
```

---
