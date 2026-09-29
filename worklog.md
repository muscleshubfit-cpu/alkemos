# Worklog

> **Policy (Phase 288 — ARCH-REMEDIATION, audit P1-1):** the live file IS the active window —
> hard-capped at **≤ 12 entries AND ≤ 128 KB** (`scripts/docs_audit.py` check H5). Anything below
> the window rotates verbatim to `archive/WORKLOG_ARCHIVE.md` in the SAME commit via
> `python3 scripts/worklog_rotate.py` — size-driven, never calendar-driven, never one-shot.
> newest on top; append-only; one entry per task (§12.5.1).

---
Task ID: CHAIN-EXPANSION-R3-LIVE-VERIF-2026-09-29
Agent: Super Z (main)
Task: التحقق الحي لـ R3 كما وعد مدخل التنفيذ — قراءة سجلي التشغيلين المراقبين EN/AR بعد الدمج، التأكد من ظهور سطر R3 clamp بنداء blog:content-*، قياس توزيع المزودين، إصلاح ما اكتشفه التحقق (دبوس اختبار أحمر على main)، ثم الإغلاق التوثيقي (توثيق فقط عدا ملف الاختبار).

Work Log:
- (التشغيلان المراقبان — dispatch على كوميت R3 مباشرة) EN ‏36595579697 وAR ‏36595584050 (16:08:55/58 UTC على 544c6f42): P0→P4 خضراء بالكامل بالسلسلة الموسعة (480s + مدخل P2 الثالث) — صفر «All AI providers failed» على أي نداء محتوى: 6/6 نداءات content أنتجت مسودات (EN: ‏OR×2+groq×1 · AR: groq×3) — عزل المزودين المزدوج (دافع R3: OR-abort+NV-503 بتشغيل R2 نفسه 14:36) مكسور حيًا؛ الحادثة الوحيدة المتبقية فشل outline أول محاولة (groq 429 عابر + OR abort) عالجته إعادة المحاولة العابرة ×3 كما صُممت.
- (العلامة الأولى المتوقعة — ظهرت حرفيًا بالتشغيلين) «payload ~8798–8852t exceeds Groq 8k TPM window → R3 clamp: groq entries kept with max_tokens 4748–4802t (floor 3800)» ×6 (3 EN + 3 AR) بنداءات blog:content-{en,ar} — Groq عاد لفئة P2 بالسلسلة كما صُمم (التوقع كان ~4.8–4.9kt؛ الحي ~4.75–4.8kt لاختلاف حجم الحمل قليلًا).
- (التباين المطلوب بالتصميم — تحفظ 2 مثبت حيًا) نداءات review ‏P4 الثقيلة (~10544–11243t EN · ~10661–10837t AR) ظلت مقصاة بالبايت («exceeds Groq 8k TPM window → openrouter/nvidia-only for this call» ×7) — القص المحسوب تحت الحد 3800 والسطر القديم حرفيًا كما تقتضي سابقة الإرجاع.
- (قياس توزيع المزودين — كما تقتضي الخطة) النجاحات: EN ‏14 (groq 5 = 35.7% · OR 6 · NV 3) · AR ‏15 (groq 9 = 60% · OR 4 · NV 2) — الإجمالي groq ‏14/29 (48.3%) · OR ‏10 (34.5%) · NV مباشر 5 (17.2%)؛ groq خدم نداءات المحتوى 4/6 (66.7%) كانت مقصاة كليًا pre-R3؛ إشعارات الأخطاء: OR-ultra abort ×18 (9 بكل تشغيل — نفس هشاشة العصر المقاسة) مقابل groq خطأ واحد عابر (الـ429 أعلاه) وNV ‏503 واحد.
- (فشل التشغيلين الصادق — فئة R4 كما موثق بحدود R3) word-floor: EN ‏1271/911/897 · AR ‏1033/864/855 كلمة < 1300 → RERUN_TARGET=p2-content → دورتا إصلاح R1 كاملتان → «repair budget exhausted (2 cycle(s)) — honest failure (markFailed stands)» — صفر بوابات خُففت؛ ملاحظة مقيسة للمالك: مسودات groq المقصوصة (855–1033 AR) أطول من مسودات السلسلة القديمة غير المقصوصة (752–839 بتشغيل R2) — لا انحدار طول من القصّ، والـword-floor يبقى معيار R4.
- (خلل اكتشفه التحقق وأصلحه بنفس الجلسة) دبوس doc-truth القديم بblog-phase0-quality-gates.test.ts ظل يتوقع «P1/P2 `maxModels: 2`» بعد أن جدّد R3 القانون إلى P1=2 · P2=3 → بوابة الجودة على main حمراء (تشغيل 36595559507: اختبار فاشل واحد) بينما Vercel/بقية الفحوص خضراء — الإصلاح بكوميت 2133df76: الدبوس يتبع القسم المقسوم مع تعليق مرجعي، بعد بطارية كاملة (tsc 0 · eslint 0 · vitest 1881/1881 · next build ✓) — السابقة القانونية: تحديث doc-truth pin تبعًا لتغيير قانون موثق واجب بنفس فريم التغيير (نمط 175) لا بعده.
- (التحقق بعد الدفع) guard/parity/cleanup/Supabase/Vercel أخضر على 2133df76 + quality (مراقبة API — إتمام الفحص موثق بمدخل STATE).

Stage Summary:
- R3 مثبتة حية 100% بالتشغيلين: القصّ per-entry ظهر حرفيًا ×6، Groq خدم 4/6 نداءات محتوى كانت مقصاة كليًا (ودخل أيضًا outline/research/latin-tokens بلا قصّ)، P4 الثقيل بقي خارجًا بالتصميم بالبايت، وعزل OR+NV المزدوج مكسور — والفشل النهائي فئة word-floor (R4) كما موثق بالحدود، بلا أي بوابة خُففت.
- الخلل الوحيد المكتشف (دبوس أحمر على main) أُصلح بكوميت مستقل بعد بطارية كاملة — main أخضر مجددًا.
- Push status: pushed (2133df76 + كوميت الإغلاق التوثيقي) · الشاهد: سجلا التشغيلين عبر API (36595579697/36595584050 — نفس نمط إثبات R1/R2، محلي غير محفوظ بالمستودع).
- Commit SHA (optional, post-push): (git log is the ledger)

---
Task ID: CHAIN-EXPANSION-R3-2026-09-29
Agent: Super Z (main)
Task: أمر المالك 2026-09-29 — تنفيذ المرحلة R3 فقط من خطة docs/EXECUTION-PATH-AUDIT-AND-RECOVERY-PLAN-2026-09-29.md (توسيع السلسلة الفعّالة) مع تطبيق تحفظات الـaudit الأربعة: حارس per-entry · P4 الثقيل خارج نطاق عودة Groq إن لم تسمح الميزانية · علم إرجاع صريح للـclamp · توثيق حدود R3 (لا يعالج word-floor/authority-link). اختبار كامل ثم commit+push إلى main. لا R4/R5 ولا أي Gate أو Business Logic خارج نطاق R3.

Work Log:
- (Audit أولًا — أمر المالك بنفس الجلسة) تحقق قراءة-فقط من المفاتيح الأربعة حيًا (orKeys=2 + Groq + NVIDIA في سجلات 36582658309 وVercel env وGitHub Secrets) ومن أن دافع R3 حي (نفاد سلسلة OR-abort+NV-503 داخل تشغيل R2 نفسه 14:36) — النتائج بمدخل الجلسة أعلاه وقُررت التحفظات الأربعة قبل التنفيذ.
- (1 — الحارس per-entry بai-provider.ts) استبدال skipGroq الجماعي بقرار لكل مدخل: groqWindow = 7200 − ceil(prompt/4) − 800؛ عند تجاوز المنادي للنافذة يُقصّ maxTokens لمداخل Groq إلى النافذة ويبقون بالسلسلة ما دام القصّ ≥ GROQ_CLAMP_FLOOR (3800) — وإلا يُسقطون بسطر السجل القديم **بالبايت** («payload ~Nt exceeds Groq 8k TPM window → openrouter/nvidia-only for this call»)؛ المنادي بلا maxTokens لا يتغير سلوكه أبدًا (القصّ يستحيل رياضيًا مع 2048)؛ سلسلة fast معفاة كما كانت؛ مداخل non-Groq ترسل قيمة المنادي بالبايت (ChainEntry.maxTokens اختياري + attemptOptions).
- (2 — علم الإرجاع، تحفظ 3) GROQ_MAX_TOKENS_CLAMP=0 يعيد سلوك pre-R3 حرفيًا (الإسقاط الجماعي + نفس السطر) — موثق بSECURITY §2.2 و.env.example وAGENTS §8؛ تراجع الميزانية = قيمة env واحدة بالـ workflow (480000→360000).
- (3 — الميزانية والعمق) blog-post-{en,ar}.yml: AI_CHAIN_TOTAL_BUDGET_MS 360000→480000 (سابقة process-ai-jobs 161.4؛ timeout 120min لم يُمس) + blog-pipeline.ts: P2 maxModels 2→3 (eff = min(150s, 480/3=160s) = 150s كما هي) + تحديث تعليقات P2/P4 وrun-step.mts وprocess-ai-jobs.yml لأرقام الميزانية الجديدة (لا تعديل سلوك).
- (4 — الحدود موثقة، تحفظ 4) ملاحظة الحالة تحت R3 بالخطة + STATE: فئة P4 (~10.4–11.1k) تبقى بلا Groq **بالتصميم** (القصّ 2590–3128 < 3800)، وR3 لا يعالج word-floor (752<1300 — فئة R4) ولا authority-link (G4) — كلاهما أثبت حيًا بتشغيلي 36571415573 و36582658309.
- (الاختبارات) `src/lib/__tests__/ai-provider-r3-groq-clamp.test.ts` ‏6/6: فئة P2 الحية (est 8700t → قصّ 4900 بجسم الطلب الفعلي ومداخل OR تبقى 6400) · فئة P4 الحية (10472t → إسقاط بالسطر القديم بالبايت وبلا أي نداء groq) · علم الإرجاع (نفس الحمل يُسقط) · الحمولة الصغيرة (2100t بلا حارس) · إعفاء fast chain · الحد 3800 بالضبط (يُقبل) و3799 (يُسقط) — order-agnostic لعدّاد التدوير المشترك.
- (البطارية الكاملة §3.5) tsc ✓ 0 · vitest ✓ 1881/1881 (1875+6) · eslint ✓ 0 (1 تحذير مسبق بملف لم يُمس) · next build ✓ · docs_audit/docs_parity ✓ (تُشغلان مع فحوص الجودة).
- (التوثيق بنفس الفريم — قانون §3.8) AGENTS §8: PROVIDER BALANCE (الحارس per-entry + الإرجاع) + RATE-LIMIT (P2 maxModels 3) + ترويسة Last updated · TECH_REFERENCE §5/§6 بنفس النص · DEVELOPER_GUIDE §2 بند R3 · README فقرة R3 · SECURITY §2.2 العلم الجديد · .env.example التعريف · STATE فريم 305 + المفتوح الآن · صف الحالة تحت Phase R3 بالخطة.

Stage Summary:
- R3 منفذة بالكامل ضمن نطاقها: 3 ملفات كود كما بالخطة (ai-provider.ts + blog-pipeline.ts + workflows) مع تحفظات الـaudit الأربعة مدمجة، وصفر مساس بأي Gate أو Editorial Rule أو Business Logic خارج النطاق (R4/R5 لم يُلمسا؛ legacy-ar-cleanup.yml بقي 360000 عمدًا — خارج نطاق الخطة).
- Push status: pushed to main · التحقق الحي: تشغيلان مراقبان EN/AR بعد الدمج (قياس أسبوعي: نسبة نجاح أول نموذج وتوزيع المزودين) — أول علامة متوقعة بالسجل: «R3 clamp: groq entries kept with max_tokens ~4.8–4.9kt» بنداء blog:content-*.

---
Task ID: LATIN-REPAIR-R2-LIVE-VERIF-2026-09-29
Agent: Super Z (main)
Task: اختبار R2 الحي — workflow_dispatch يدوي لـ AR على main (6adf9461) + مراقبة كاملة + تحقق DB قراءة-فقط (توثيق فقط؛ صفر مساس بأي كود).

Work Log:
- dispatch يدوي (run 36582658309، 14:26→14:53 UTC): P0-P4 ✓ ثم P5 فشلت 3 مرات ببوابة word-floor (839/791/752 كلمة < 1300) → دورتا إصلاح R1 كاملتان (p2 force=1، سلسلة p2→p3→p4) ثم الفشل الصادق عند نفاد الميزانية (2/2) — صف الطابور 49d9b736…: ‏failed مع bundle محفوظ (تحقق DB قراءة-فقط).
- مسار R2 اشتغل 4 مرات داخل P4: (14:33) 23 توكنًا → قاموس 0 + نداء 11 → تحقق ✓ · (14:43) 21 → توكن متبقٍ crp → فشل تحقق صادق بنفس الرسالة الحرفية (retry الخطوة عالجها) · (14:47) 8 → نداء 7 → ✓ · (14:53) 8 → نداء 6 → ✓.
- النداء الصغير blog:latin-tokens-ar دخل Groq ‏4/4 (groq:openai/gpt-oss-120b، ‏~2.1s للنداء) بينما نداءات المقال الكامل (review-ar ‏~10.5k tokens) ظلت مقصاة («exceeds Groq 8k TPM window» ×8 بالسجل) — التباين الذي بُنيت R2 له.
- وسم المسار القديم blog:latin-repair-ar غائب كليًا (0 ظهورًا) — الإرجاع LATIN_REPAIR_LEGACY غير مفعّل والمسار الجديد هو الحي.
- القاموس طبّق 0 (توكنات موضوع البروبيوتيك خارج مجموعة المصدر) والنداء الصغير عالجها — تقسيم العمل كما صُمم، والقضاة (`validateMsaConversion`/`scanLatinContamination`) بالبايت.

Stage Summary:
- R2 مثبتة حية 100%؛ فشل التشغيل النهائي فئة word-floor (هدف R3 المستقبلي) خارج نطاق R2 — لا بوابة خُففت.
- الشاهد: run_36582658309_full.log — محلي فقط، لم يُحفظ بالمستودع (نمط إثبات R1 ‏run 36571415573).
- Push status: pushed
- Commit SHA (optional, post-push): (git log is the ledger)

---
Task ID: LATIN-REPAIR-R2-2026-09-29
Agent: Super Z (main)
Task: تنفيذ Phase R2 كاملة من خطة تعافي مسار التنفيذ (docs/EXECUTION-PATH-AUDIT-AND-RECOVERY-PLAN-2026-09-29.md §10) — الإصلاح اللاتيني الموضعي للمسار العربي، بأمر المالك (R2 فقط؛ البوابات دون أي تعديل).

Work Log:
- جمع أدلة حية (قراءة-فقط من قاعدة الإنتاج): 21 صف AR بنافذة التدقيق — كل نصوص post-review نظيفة لهجويًا (strong=0)؛ فشل latin-repair السبعة سببها نداء المقال الكامل (~9.5k tokens يقصي Groq ويعيد نصًا إنجليزيًا we-need-to-replace)؛ بناء القاموس من جدول الـprompt نفسه + مقيسات المسودات الحية (bmr/tdee/epa/dha/alkaline/whey/isolate/monohydrate/atp/hcl/meq/amino acids/bench press/heart rate variability/scapular wall slides/deadlift/squat/shakes/sleep/timing/intake/deload).
- `src/lib/blog-pipeline.ts`: القاموس الحتمي `LATIN_REPAIR_DICTIONARY` (مفاتيح عبارات قبل كلماتها) + محرك `applyLatinTokenMap` يطابق دلالات الكاشف بالبايت (أسوار كود/صور/URLs/أهداف روابط محمية؛ أقواس الإشارة (Whey) محمية؛ الملتصق كريAlkaline يُفك حتميًا بمسافة) + `translateLatinTokens` النداء الصغير (tag ‏`blog:latin-tokens-ar`، ‏payload قائمة الـtokens وحدها، est<2.6k ⇒ Groq داخل، ‏JSON {token→عربي}) بفحص قيمة-بقيمة `isValidArabicTermValue` (عربي خالص/بلا لاتيني/بلا لهجة قوية/مصطلح ≤8 كلمات/بلا روابط) + `repairArabicLatinContamination` الجديدة (قاموس ← فحص ← نداء صغير للباقي ← نفس القضاة) + المسار القديم محفوظ حرفيًا كإرجاع `LATIN_REPAIR_LEGACY=1` (blog-msa.ts لم يُمس إطلاقًا).
- الاختبارات `src/lib/__tests__/blog-latin-repair-r2.test.ts` — 10/10 أخضر: فئة 09-11 (marketed/evidences/shake/alkalin بصفر نداءات AI) · كريAlkaline الملتصق (حتى داخل قوس إشارة) · فئة 09-16 (bmr/tdee/epa/dha/alkaline) · العبارات قبل الكلمات (amino acids/bench press/heart rate variability) · كناري payload (نداء واحد يحمل tokens فقط بلا المقال + est<7200) · فئة الرد الإنجليزي (فشل صادق بنفس الرسالة) · فئة القيمة اللهجية إيه×6 والقيمة اللاتينية (رفض قيمة-بقيمة → فشل صادق) · إرجاع legacy (يرى المقال كاملًا بخياراته الحرفية) · كناري عدم تصادم القاموس مع whitelist ونقاء قيمه · كناري المحرك (fence/gloss/URLs/أهداف روابط بالبايت + إصلاح anchor مع بقاء الهدف).
- البطارية (فريم src): tsc ✓ 0 · eslint ✓ 0 · vitest ✓ كاملًا أخضر · next build ✓ خروج 0 · docs_parity + docs_audit + stale-refs ✓ (بعد التوثيق).
- (التوثيق بنفس الفريم) AGENTS §8 (ARABIC PURITY LAW — Localized repair + RATE-LIMIT انقسام موقع latin-repair + رأس الملف) · README (قسم Automated content pipeline) · DEVELOPER_GUIDE (قسم طبقة إعادة المحاولة) · STATE فريم 304 (مع توثيق الإثبات الحي لR1 بتشغيل 36571415573) · علامة «منفذة» على Phase R2 بخطة التدقيق · .env.example + SECURITY §2.2 لعلم الإرجاع.

Stage Summary:
- فئة الفشل الأكبر تاريخيًا في المسار العربي (5/7: latin-repair validation) أصبحت موضعية: الفئة الشائعة (مصطلحات/اختصارات معروفة) تُصلح حتميًا بصفر نداءات AI، والباقي بنداء صغير يدخل Groq (85% نجاة حية) بدل نداء المقال الكامل المقصي له — بلا أي تعديل لأي بوابة أو عتبة (blog-msa.ts بالبايت).
- الإرجاع: LATIN_REPAIR_LEGACY=1 (مسار Phase-176 حرفيًا). R3/R4/R5 لم تُمس — بانتظار أوامر المالك.
- أول إثبات حي متوقع: أول تشغيل AR قادم يلتقط كاشف P4 لاتينيًا.
- Push status: pushed
- Commit SHA (optional, post-push): (git log is the ledger)

---
Task ID: REPAIR-LOOP-R1-PHASE-303-2026-09-29
Agent: Super Z (main)
Task: تنفيذ Phase R1 كاملة من خطة تعافي مسار التنفيذ (docs/EXECUTION-PATH-AUDIT-AND-RECOVERY-PLAN-2026-09-29.md §10) — عقد rerunTarget + حلقة الإصلاح داخل التشغيل + p2 ?force=1، بأمر المالك (R1 فقط، بلا لمس أي Gate/قاعدة جودة/Business Logic خارجها).

Work Log:
- (A1) `src/lib/blog-repair-target.ts` جديد: خريطة حتمية رسالة↔هدف (word-floor→p2-content · battery/لاتيني/Artifacts→p4-review · ما عداهم→null بمافيهم infra/quota/dup) + `rerunTarget` في جسم 500 من p5-publish (كل البوابات وعتباتها بالبايت كما هي؛ جسم null يبقى بالشكل القديم حرفيًا).
- (A4) p2-content يقبل `?force=1`: يتخطى fast-exit الـresume فقط (بوابة الحالة كما هي — الصفوف outlined/failed وحدها) ويولّد فوق المسودة مع بقاء research0/outline/images في الـbundle؛ الاستجابة تحمل regenerated:true.
- (A2) run-step.mts: جسم 500 يحمل rerunTarget ⇒ exit code 3 + سطر `RERUN_TARGET=<step>` في stdout (تحقق مغلق المجموعة من P5_RERUN_TARGETS؛ أي شيء آخر يبقى exit 1) + تمرير P2_FORCE_REGENERATE إلى `force=1` لخطوة p2 وحدها.
- (A3) run-step.sh: عند exit 3 — فحوص عقد (هدف صالح/خطوة P5/QUEUE_ID موجود/ميزانية) ثم حلقة إصلاح ≤2 دورة (MAX_REPAIRS): تنفيذ الخطوة المستهدفة وكل ما بينها وp4 على نفس الصف (نداءات متكررة بـMAX_REPAIRS=0 — لا تداخل) ثم إعادة P5 فورًا بلا backoff؛ P0–P4 تبقى على سلوك ×3 العابر؛ الإرجاع = exit 3→1 (الحلقة تتعطل تلقائيًا).
- (الاختبارات) `blog-repair-target.test.ts` ‏14 دبوسًا بالرسائل الحية من التدقيق §3.1 (419/1077 كلمة · FAQ-0 الصف 38f230fb · لاتيني · infra→null · هدف خارج العقد→null) + `blog-repair-contract.test.ts` ‏5 سلوكية تستدعي مساري P5/P2 فعليًا (word-floor→p2-content · FAQ-0→p4-review · Post-insert بلا عقد · resume بلا force · force-regen يحفظ الأرتيفاكتات ويستبدل content وحده) + `scripts/blog-runner/run-step-loop-test.sh` مصفوفة تكامل 7 سيناريوهات ببيئة GHA محاكاة (stub npx — بلا شبكة/DB/AI): السلاسل الكاملة/الميزانية/الفشل العابر/حراس العقد.
- (البطارية) tsc ✓ 0 · vitest ✓ 1,865/1,865 · eslint ✓ 0 (تحذير قديم واحد) · next build ✓ خروج 0 · حلقة التكامل ✓ 7/7 (0.17s) · stale-refs ✓.
- (إصلاح انجراف كوميت التدقيق e4c877a — بوابة docs كانت حمراء بثلاثة) H: مدخل التدقيق أُدخل أسفل الملف — أُصلح بالإدخال فوق + التدوير؛ H5: 13 مدخلًا — تدوير النافذة إلى 12 بscripts/worklog_rotate.py؛ M: مستند التدقيق بلا صف سجل — صف EXECUTING أُضيف بdocs/README.md.
- (التوثيق بنفس الفريم) AGENTS §8 قانون REPAIR LOOP LAW + تحديث رأس الملف · README (قسم Automated content pipeline) · DEVELOPER_GUIDE (قسم طبقة إعادة المحاولة) · STATE فريم 303 + QA + ضغط السلم التاريخي (293–296 إلى الأرشيف) · علامة «منفذة» على Phase R1 بخطة التدقيق.

Stage Summary:
- R1 منفذة بالكامل ومختبرة محليًا: فئة فشل P5 الحتمي (آخر 3 فشل EN) صارت قابلة للإصلاح داخل نفس التشغيل على نفس الصف — بلا أي تعديل لأي بوابة أو عتبة أو قاعدة تحريرية (قيد المالك محفوظ).
- التراجع: إرجاع exit 3 إلى 1 في run-step.mts يعيد السلوك الحالي حرفيًا (الحلقة تتعطل تلقائيًا).
- R2–R5 لم تُمس إطلاقًا — بانتظار أوامر المالك؛ أول إثبات حي = أول تشغيل EN/AR قادم يمر بفشل P5 قابل للإصلاح.
- Push status: pushed
- Commit SHA (optional, post-push): (git log is the ledger)

---
Task ID: AUDIT2-LINK-APPLY-2026-09-29
Agent: Super Z (main)
Task: إغلاق قناة علاج الروابط الميتة بالتطبيق والتحقق الحي (متابعة فريم 302 — أمر المالك الخيار أ).

Work Log:
- (CI/النشر) e3513c6c على main: 6/6 خضراء (Vercel ✓ = الإنتاج على كود التوسيع · Supabase Preview ✓ · quality ✓ · guard ✓ · parity ✓ · cleanup ✓).
- (القناة) DRY_RUN عبر GHA (تشغيل 36508876750): أخضر — 4/4 رقع، البديلان HEAD-ok من IP العدّاء أيضًا، صفر كتابات · APPLY (تشغيل 36508959487 بDRY_RUN=0): 4 صفوف كُتبت (content/reading_time/updated_at فقط)، 0 فشل.
- (تحقق قاعدي فوري) الأربعة: الروابط الميتة اختفت والبدائل حاضرة والإسناد الجديد صادق بالقاعدة.
- (تحقق حي بعد ISR عبر cache-bust) الأربع صفحات تحمل المحتوى المصحح: EN calories «Evidence generally suggests» (رابط WHO الحي باقٍ) · AR protein «CDC Nutrition» → nutrition hub الحي · EN 12-week «The CDC emphasizes» → CDC sleep الحي (رابط NCBI الكرياتين باقٍ) · AR sleep «مراكز السيطرة على الأمراض والوقاية منها (CDC) – إرشادات النوم» → CDC sleep (رابط NCBI باقٍ) — العناوين العارية تنتظر TTL كاش Cloudflare (نفس ظاهرة 299 الموثقة؛ purge مالك اختياري).
- (إثبات حي إضافي غير مخطط له — أول توليد عبر البوابات) تشغيل EN المجدول لليوم (36507693416 على 951b9b62): سلسلة المجانية فشلت بالكامل (nemotron مهلة + NVIDIA 503) والمسودة الاحتياطية الناقصة حُجبت بصدق 3 محاولات («FAQ count 0 خارج 4-7 | مرسايا «ISSN position stand on protein timing» و«foam roller recovery guide» غير قواعديتين») — لم يُنشر شيء ناقص: قانون «الرفض بدل النشر» يعمل حيًا؛ ملاحظة أن إحدى المراسي المرفوضة كانت مرساة استشهاد ISSN (النموذج حاول الاستشهاد لكن بمرساة مكدسة — القانون يرفضها حتى بلا رابط حي).

Stage Summary:
- القناة منفذة ومغلقة: 4/4 رقع مكتوبة والتحقق الحي موجب (عبر cache-bust)؛ صفر روابط ميتة مؤكدة في المحتوى الخدمي.
- البوابات مثبتة حيًا بالتشغيل المجدول الفعلي (حجب صادق لمسودة ناقصة عبر بطارية G2-G6).
- المتبقي على المالك: CF purge اختياري لتعجيل العناوين العارية (وإلا يتحقق مع TTL) · مراجعة المقالات المعلقة كما هي.
- Push status: pushed (كوميت توثيقي [vercel skip] بعده).
- Commit SHA (optional, post-push): (git log is the ledger)

---
Task ID: AUDIT2-LINK-WIDEN-2026-09-29
Agent: Super Z (main)
Task: أمر المالك 2026-09-29 — تدقيق مستقل جديد (رقم 2) لنظام الروابط الخارجية «هل تُضاف ولا تُحجب؟» + تنفيذ الخيار (أ) العلاج الرجعي للروابط الميتة + حل مشكلة المقالات الرياضية (قائمة السلطات كانت طبية بالكامل فلا هدف استشهادي طبيعي للمقال الرياضي عند بوابة G4).

Work Log:
- (تدقيق 2 — قراءة-فقط) القانون طبقةً طبقة: FACT GUARD يسمح الاستشهاد كروابط لنطاقات السلطات (EN+AR) · P2 تعليمة 9 تأمر بإضافة حتى رابطين · P4 يحافظ عليهم ويضيف · بوابة HEAD تحذف الميت المؤكد فقط (404/410) وتبقي غير الحاسم fail-open · بوابة G4 تُلزم برابط سلطة واحد على الأقل — تحجب المقال بلا روابط لا الروابط نفسها · بوابة اللاتيني AR تستثني عناوين URL صراحة قبل المسح · المسار المعروض يرسم `<a>` حقيقي · الاختبارات المستهدفة 53/53 خضراء.
- (قياس حي 95 صفحة، صفر أخطاء جلب) 33/95 تحمل روابط خارجية — و100% منها روابط سلطة من القائمة (صفر روابط غير سلطة في الموقع كله) · التوزيع: NCBI 18 · WHO 17 · Mayo 9 · CDC 3 · ACSM 2 · PubMed 2 · ODS 2 · لا regression: مقالتا 28/9 بلا روابط نُشرتا 00:19/11:35 UTC قبل أول كوميت للبوابات (20:57 UTC) وأول مقال عبر G4 لم يُولد بعد (البوابة حية ساعات).
- (اكتشافات التدقيق) 4 روابط ميتة (404) معروضة على الزوار في 4 مقالات منشورة — البوابة تفحص وقت النشر فقط ولا فحص رجعي (فجوة جديدة قيست أول مرة) · 13 رابطًا غير قابل للتحقق ب403 (Mayo/ODS/ACSM يرفضون HEAD) — ليست ميتة: قرار إبقاء موثق بالرقع.
- (أمر المالك — حل الرياضيين) EDITORIAL_AUTHORITY_DOMAINS من 9 إلى 14: + nsca.com (قوة وتكييف) · health.gov (ODPHP — إرشادات النشاط البدني الأمريكية) · nasm.org + acefitness.org (جهات اعتماد اللياقة — نفس مراسي اعتمادات الكابتن) · eatright.org (أكاديمية التغذية وعلماء الحميات) — نصا FACT GUARD ‏EN+AR محدثان بالقائمة والفاصل «جهات صحية وجهات علوم الرياضة والتدريب والتغذية معًا»، وP2/P4 يتكونان تلقائيًا من الثابت (لا مساس) · دبوس الاختبار محدث إلى 14 · AGENTS.md §8 (سطر الاستشهاد الصادق) محدث.
- (أمر المالك — الخيار أ) قناة GHA كسابقة الإحصاءات: scripts/blog-runner/link-db-remediation.mts + link-db-patches.json (4 رقع byte-exact مستخرجة من القاعدة الحية: إزالة رابط CDC healthyweight الميت الحامل ادعاء «Studies show» بلا مسمى → بديل الصياغة العامة الذي يوصي به FACT GUARD نفسه مع بقاء رابط WHO الحي بالصف · CDC protein الميت → nutrition hub الحي (200) · إسناد «WHO sleep guidelines» الكاذب بالمقالتين EN+AR → CDC sleep الحي (200) بإسناد صادق) + link-db-remediation.yml (dispatch-only، DRY_RUN=1 افتراضيًا، يكتب content/reading_time/updated_at فقط) + صف CI_GATES · بوابة جديدة: فحص HEAD لكل URL بديل قبل أي كتابة (البديل الميت المؤكد يُجهض) + تحقق بنيوي (الميت يختفي · البديل موجود · الصور/العناوين لا تتغير · نسبة الطول 0.9-1.1) · DRY_RUN محلي أخضر: 4/4 رقع، البدائل ok، صفر إخفاقات.
- (بوابات الفريم) tsc 0 · eslint 0 · vitest 1,846/1,846 · next build 2,023/2,023 · docs_audit ✓ · docs_parity ✓ · stale-refs ✓ · migration_audit ✓ · ui-wiring ✓ · التدوير ✓.

Stage Summary:
- جواب سؤال المالك مثبت بالقياس: الروابط مسموحة ومطلوبة ولا تُحجب — والبوابة تفعل العكس تمامًا (تحجب المقالة بلا روابط)؛ والمقالات الرياضية صار لها جهات سلطة طبيعية بعد التوسيع (14 نطاقًا).
- فجوة التدقيق (روابط ميتة معروضة) علاجها جاهز بالقناة: APPLY عبر dispatch بعد الدفع، ثم تحقق حي بعد ISR.
- المتبقي على المالك: لا شيء جديد — مراجعة المقالات المعلقة باقية كما هي.
- Push status: pushed (كوميت واحد على main — الهوية muscleshubfit@gmail.com).
- Commit SHA (optional, post-push): (git log is the ledger)

---
---
---
Task ID: PHASE2-DEPLOY-VERIFY-2026-09-29
Agent: Super Z (main)
Task: نشر المرحلة 2 (كوميت 1ab53b0b) + إغلاقها بالتحقق الحي: CI، تطبيق 0097، تنفيذ علاج الإحصاءات عبر القناة، أول قياس GEO، وتحقق صدق القالب/المسارات — ثم توثيق الإغلاق.

Work Log:
- (CI) 1ab53b0b على main: الفحوصات 5/5 خضراء (Supabase Preview ✓ quality ✓ guard ✓ parity ✓ cleanup ✓) — Preview أخضر = 0097 عبر قاعدة المعاينة بلا أخطاء.
- (0097 حيًا) استعلام قراءة فقط على الإنتاج: الأعمدة موجودة وكل المقالات المنشورة تحمل review_status='pending' + last_reviewed_at=null (الحالة الصادقة).
- (القالب الصادق حيًا) EN `/blog/magnesium-forms-sleep-recovery`: «AI-generated · medical review pending» مرة واحدة، صفر «Reviewed by Ahmed Zake»، Article schema بلا reviewedBy/lastReviewed، وFAQPage (المرحلة 0) باقٍ · AR `/ar/blog/sleep-recovery-gym-results`: «مولّد بالذكاء الاصطناعي · بانتظار المراجعة الطبية» · صف التواريخ: «Updated» الصادق بدل «Last reviewed» الكاذب القديم.
- (علاج الإحصاءات — القناة) dispatch لstats-db-remediation بDRY_RUN=0: تشغيل 36500135029 نجح — 15 صفًا/19 رقعة كُتبت (content/reading_time/updated_at فقط)، 0 فشل، والقرارات الموثقة طُبعت · تحقق قاعدي: الادعاء القديم مُزال والتخفيف موجود · تحقق حي بعد نافذة ISR (دورتا انتظار لتقادم التوليد): EN magnesium + AR sleep-recovery + AR dynamic-stretching كلها تحمل النص المخفف والادعاءات الرقمية المختلقة اختفت.
- (قياس GEO) أول dispatch فشل بERR_MODULE_NOT_FOUND: سكربت المسبار ضحية فخ /scripts/* الشامل في .gitignore (committed-untracked — نفس فئة worklog_rotate في 288) → إصلاح 1e5ffd4b: استثناء !/scripts/geo/ بنفس الفريم + سطر توثيق بالفخ · dispatch ثانٍ: تشغيل 36501359231 نجح — **خط الأساس: 0/24 (0%) · صفر إخفاقات سلسلة** (EN 0/12 · AR 0/12) — قيمة البداية الصادقة المقاسة في التقرير نفسه؛ السطر مسجل بجدول §8.4 بخطة SEO.
- (المسارات الحية) POST /api/admin/blog/review بلا جلسة → 401 Unauthorized (البوابة الإدارية مثبتة) · /api/ai/queue-health → 401 كما بفريم 299 (إضافة قياس الإقران خلف نفس البوابة).
- (الإقران/المسبار القادم) نوافذ 72h/48h + retry تعمل من كود 1ab53b0b؛ إثبات التبني الحي يتراكم تلقائيًا في قياس queue-health مع تشغيلات نوفمبر التالية — لا إجراء هنا قبل أن تتراكم العينة.

Stage Summary:
- المرحلة 2 مغلقة: نشر أخضر + علاج منفذ + خط أساس مقيس + صدق القالب/السكيما/المسارات مثبت حيًا بالقياس.
- أثر فوري مقيس: 19 ادعاء إحصائيًا مختلقًا نُزع من 15 مقالة منشورة (كلها ظاهرة للزوار) وادعاء مراجعة كاذب اختفى من 95 صفحة (الاثنان بالتوليد الجديد منعٌ بنيويًا).
- المتبقي على المالك: مراجعة المقالات المعلقة من Admin▸Blog (زر اعتماد) · الذراع اليدوية لGEO · CF purge قديم إن ظهر كاش متقاعد.
- Push status: pushed (1e5ffd4b — كوميت توثيقي [vercel skip] بعده).
- Commit SHA (optional, post-push): (git log is the ledger)

---
Task ID: PHASE2-QUALITY-2026-09-29
Agent: Super Z (main)
Task: أمر المالك 2026-09-29 — تنفيذ المرحلة 2 (30-90 يومًا «النضج») من AUDIT_REPORT.md §9 بالترتيب، بنفس منهجية المرحلة 1 (audit → implementation → tests → live verification → documentation → commit/push)، بلا نموذج/خدمة مدفوعة وبلا إعادة فتح بنود المراحل 0/1.

Work Log:
- (تشخيص حي قبل التنفيذ — قراءة فقط) الإقران: 143 صف طابور، 8 فقط بpair_id؛ في عصر الإقران (11/9→) 53 صفًا و4 فقط مع pair_id (7.5%) وزوجان مكتملان فقط — القيد الفعلي نداء الاقتران أحادي المحاولة على سلسلة تفشل (صفر صفوف researched متقادمة = النوافذ لم تكن القيد) · الإحصاءات المختلقة: مسح جمل «فعل أدلة + دقة رقمية بلا رابط» = 16 مقالة/20 جملة، كلها بالجسم الظاهر (مؤشرات النافذة/التشخيل موثقة) · بيانات Supabase عبر management API للمشروع المرتبط (سكربتات التشخيص محلية غير محفوظة — الأرقام أعلاه من مخرجاتها).
- (بند 2.1 — سير مراجعة المالك) ميجريشن 0097: عمودا blog_posts review_status ‏('pending'/'reviewed' + CHECK + فهرس جزئي) وlast_reviewed_at ‏(null=لم تُراجع) — إضافي بلا إعادة كتابة (كل الصفوف القائمة «pending» الصادقة) + types.ts + INDEX.md بنفس الكوميت · القالب الصادق: BlogArticlePage يطبع «AI-generated · medical review pending»/«مولّد بالذكاء الاصطناعي · بانتظار المراجعة الطبية» حتى مراجعة فعلية، وصف «آخر مراجعة» من last_reviewed_at الحقيقي فقط (كان updated_at الآلي)، وصف غير المراجَع «آخر تحديث» الصادق · seo.ts HONEST REVIEW LAW: Article schema يحذف reviewedBy/lastReviewed كليًا عند غياب المراجعة (undefined = سلوك legacy لصفحات المقارنات المملوكة يدويًا) · P5 ينشر review_status:'pending' + last_reviewed_at:null أبدًا آليًا · مسار الإجراء: POST /api/admin/blog/review (أدمن فقط + zod + 404/400 صادقة) + BlogAdminView: بطاقة إحصاء «بانتظار مراجعتك» + شريط عمل + شرائح حالة المراجعة + زر «اعتماد» لكل صف منشور معلق + المحرر: نشر/حفظ المالك يختم المراجعة الحقيقية (نفس الختم) · نافذة الانتقال: fetchBlogForOG يهبط لقائمة الأعمدة السابقة إذا لم يكن 0097 مطبقًا بعد (لا 404).
- (بند 2.2 — سياسة استشهادات صادقة، الخيار أ) تعديل EDITORIAL_FACT_GUARD (مصدر وحيد): السماح بالاستشهاد كروابط markdown لنطاقات السلطات التسعة حصرًا بشرط اليقين من الوجود + إبقاء حظر الاختلاق مطلقًا (الأقناس المثبتة محفوظة وممددة) + مواءمة تعليمة P2-5 وP4-4 · بوابة التحقق blog-link-verify.ts: HEAD يتبع التحويلات لكل رابط خارجي (≤12 · ≤30s) — الموت المؤكد (404/410) يحذف الرابط ويبقي النص المرتبط قبل البطارية (قيمة G4 تقيس الحالة المتحققة)، وغير الحاسم (403/405/429/timeout) يُبقي fail-open.
- (بند 2.3 — علاج الإحصاءات المختلقة رجعيًا) قناة GHA المعتمدة نفسها: scripts/blog-runner/stats-db-remediation.mts + stats-db-patches.json — 19 رقعة تخفيف منسّقة مستخرجة byte-exact من القاعدة الحية (كل find يطابق مرة واحدة) تخفف الدقة المختلقة (٪/نسب مسندة لدراسات غير مسماة) وتبقي النطاقات التوصوية الشائعة كإطار عام + قرارا إبقاء موثقان (جرعة الكرياتين القياسية؛ جملة مايو كلينك برابط سلطة حقيقي) + stats-db-remediation.yml (dispatch-only، DRY_RUN=1 افتراضيًا، يكتب content/reading_time/updated_at فقط) — تراكم الرقع multi-patch بقانون planFor (سابقة remediation-2028) · DRY_RUN محلي أخضر: 15 صفًا/19 رقعة، بوابات التحقق صفر إخفاقات، صفر كتابات.
- (بند 2.4 — قياس GEO) scripts/geo/answer-visibility-probe.mts: 24 استعلامًا ثابتًا (12 EN+12 AR) عبر سلسلة النماذج المجانية نفسها (بروكسي بلا تصفح، بلا خدمة جديدة) بفحص ذكر Alkemos/الروابط + geo-answer-visibility.yml (شهريًا 1 من الشهر + dispatch؛ النتائج بالسجل/الملخص فقط — لا auto-commit بقانون الهوية) + §8.4 بروتوكول كامل وسجل شهري بdocs/SEO-GEO-MASTER-PLAN.md مربوطًا بمؤشرات الخطة.
- (بند 2.5 — تفعيل الإقران) التشخيص فوق → الإصلاح على السبب: runPairingSelection يعيد المحاولة كاملة (محاولتان، maxModels 2→3، دوران المزود بينها، قوانين parse صارمة بلا مساس) + توسيع النوافذ 48h→72h/30h→48h (إنقاذ اليوم الثاني لفشل اللغة — المحتوى evergreen) + queue-health يقيس نسبة تبنّي 7 أيام ويصدر تحذيرًا <25% («تفعيل الإقران أو إيقاف وعوده» — القرار الآن مقيس لا مزعوم).
- (بند 2.6 — دورة التشذيب الربع سنوية) قانون QUARTERLY EDITORIAL-LAW PRUNING بAGENTS.md §8 (أول أسبوع من يناير/أبريل/يوليو/أكتوبر — نفس كادر §12.5.2) + تنفيذ الدورة الأولى: سجل «قانون حي × حارس × أثر مقاس» (11 صفًا بقراراتها، منها 3 إزالات منفذة بالمراحل 0/2) + نقل 9 كتل سرد مرحلي من blog-pipeline.ts حرفيًا إلى archive/PROMPT-LAW-HISTORY.md واستبدالها بتعليقات القانون الحالي فقط (السلاسل البرمجية لم تُمس — الكناريات خضراء).
- (بوابات) tsc 0 · eslint 0 (تحذير واحد قديم) · vitest 1,846/1,846 (+30: 8 link-verify + 14 review-workflow + 6 pairing-retry + قيَم FACT GUARD الجديدة + تحديث دبابيس النوافذ) · next build ✓ 2,023/2,023 · docs_audit ✓ (صفا CI_GATES للوركفلوهات الجديدة + مسار README كامل) · docs_parity ✓ · stale-refs ✓ · ui-wiring ✓ · migration_audit ✓ (0097) — التحقق الحي بعد النشر بمدخل متابعة.

Stage Summary:
- المرحلة 2 منفذة بندًا بندًا وفق التقرير: مراجعة المالك الصادقة (0097 من القالب حتى لوحة الأدمن) · استشهادات صادقة ببوابة HEAD · علاج الـ corpus القديم بقناة GHA · قياس GEO مجاني مربوط بالـ KPIs · إقران مفعَّل بالتشخيص والقياس · دورة تشذيب مفعَّلة بأول سجل قرارات.
- الإضافات الهيكلية: ميجريشن 0097 (عمودان + فهرس) · مساران جديدان (admin/blog/review + workflowان dispatch/شهري) · وحدتان (blog-link-verify.ts + بروتوكول GEO) · أرشيف PROMPT-LAW-HISTORY.
- المعلق بقرار مالك (موثق): ذراع ChatGPT/Perplexity اليدوية من قياس GEO (~5 دقائق شهريًا) ومراجعة المقالات الـ95 المعلقة من لوحة الأدمن (نفس الزر).
- Push status: pushed (كوميت واحد على main — الهوية muscleshubfit@gmail.com).
- Commit SHA (optional, post-push): (git log is the ledger)

Task ID: PHASE1-DEPLOY-VERIFY-2026-09-29
Agent: Super Z (main)
Task: بلاغ المالك 2026-09-29 — بريد Vercel «Preview deployment failed» للكوميت 205f61b على فرع phase1-verify (فشل 22:06 UTC): تشخيص السبب الجذري بالأدلة، وإكمال التحقق الحي بعد النشر الموعود بمدخل PHASE1-QUALITY («يلي اكتمال Vercel في نفس الجلسة»)، ثم الإغلاق النظيف للفرع والتوثيق.

Work Log:
- (تشخيص 1 — الإنتاج سليم) نفس الكوميت 205f61ba منشور إنتاجيًا بنجاح: حالة «Vercel» على GitHub ‏success «Deployment has completed» 22:08:26 UTC · فحوصات الكوميت 6/6 خضراء (Supabase Preview · Vercel Preview Comments · guard · cleanup · quality · parity) — العطل معاين-only بلا أي أثر إنتاجي.
- (تشخيص 2 — استبعاد الكود كليًا) ثلاث نسخ بناء محلية باردة لنفس الشجرة: نظيفة 97 ثانية · بلا أي متغيرات بيئة: نجاح (SSG يتحمل غياب المفاتيح) · بمفاتيح Supabase معطوبة: نجاح — ذروة RSS ‏1,612MB على آلة 4GB ⇒ OOM مستبعد، timeout مستبعد (97 ث مقابل سقف 45 دقيقة)، وفرق التبعيات مستبعد (بناء الإنتاج بنفس bun.lock نجح).
- (تشخيص 3 — التسلسل الحاسم من reflog + GHA API) 21:54:21 كوميت dc058fd2 ودُفع فرع phase1-verify → المعاين #1 (dc058fd2) يبني من ~21:55 → التشغيل الحي 36489146598 على الفرع 21:54:29→22:04:45 (فشل البوابة الصادق الموثق سلفًا) → 22:06:13 amend إلى 205f61ba مع force-push للفرع ودفع main في نفس الدقيقة → المعاين #1 استُبدل قسرًا والمعاين #2 (205f61ba) فشل خلال دقيقة إنشائه (سباق ref/supersession على فتحة البناء الواحدة بخطة Hobby) → الإنتاج اصطف خلفه وأكمل بعد دقيقتين بكاش دافئ. workflow الـcleanup بريء نصًّا (سكربته لا تستعرض QUEUED/BUILDING/INITIALIZING أصلًا).
- (الحكم) ليست عيوب كود — فشل معاين عابر من نمط supersession/‏ref-race (force-push لفرع أثناء بناء معاين جارٍ + دفع متزامن لmain على فتحة بناء واحدة). القانون التشغيلي المستفاد: لا force-push لفرع تحقق والمعاين يبني — انتظر اكتماله أو احذف الفرع قبل إعادة الدفع.
- (التحقق الحي بعد النشر — بندًا بندًا) 301 EN ✓ حيًا فورًا على العاري (→ calculate-daily-calories-fuel-fat-loss-bulking) · 301 AR ✓ أصليًا (cache-bust يرجع 301 → muscle-building-home-workout-guide) · migration 0096 مطبق كاملًا: المنحوزان خارج sitemap-blog.xml والناجيان باقيان · العناوين الجديدة ×4 ✓ أصليًا حرفيًا (أثبتها cache-bust لكلٍّ منها — مطابقة لنص الميجريشن) · queue-health منشور ومحمي (401 بلا جلسة coach — requireAdmin يعمل كما صُمم).
- (الفجوة المكتشفة — كاش Cloudflare قديم) 5 URLs تُقدَّم من نسخ CF مخزنة 19:07 UTC قبل النشرين (وهي بعينها صفحات زحف التدقيق — cf-cache-status HIT بعمر ≈3.8 ساعة): AR redirect العاري + مقالات الاستشفاء الأربعة بعناوينها القديمة. الأصل خلف الكاش سليم كله؛ جلسات Phase 0/1 أغفلت طقس purge بعد النشر (سابقة SOCIAL-OG-2) — الفهرس وsitemap و301 الإنجليزي كلها صحيحة الآن.
- (الإجراء) حذف فرع phase1-verify عن بعد بعد أداء غرضه (سابقة phase0-verify) · لا إعادة بناء للمعاين (قانون VERCEL-USAGE-6 — كلفة عدادات صفرية القيمة؛ والفاشل يلتقطه cleanup الساعي بعد 6 ساعات بقانون VERCEL-USAGE-5) · CF purge متعذر آليًا بالجلسة (لا توكن CF هنا ولا workflow يملكه — قانون §3.2) ⇒ إجراء مالك واحد متبقٍ (أدناه).
- (البوابات — إطار توثيقي بحكم Phase 290) docs_audit ✓ · docs_parity ✓ · بطارية الكود غير مستحقة (صفر مساس بsrc/supabase/build-config).

Stage Summary:
- عطل المعاين مُشخَّص بالدليل الكامل: عابر بيئي (supersession/‏force-push) لا كود — الإنتاج على الكوميت نفسه أخضر ومتحقق منه حيًا بندًا بندًا.
- إجراء المالك الوحيد المتبقي: Cloudflare purge للروابط الخمسة أو purge_everything (لوحة CF ▸ Caching ▸ Purge) — حتى ذلك الحين يرى الزائر النسخ القديمة على العاري من تلك الروابط فقط.
- Push status: pushed to main · فرع phase1-verify محذوف من origin بعد اكتمال الغرض.

---
Task ID: PHASE1-QUALITY-2026-09-29
Agent: Super Z (main)
Task: أمر المالك 2026-09-29 — تنفيذ المرحلة التالية بعد Phase 0 من AUDIT_REPORT.md (المرحلة 1 «قلب الجودة») بالكامل وفق التقرير وبنفس منهجية التدقيق/التنفيذ/الاختبار/التحقق الحي، وبقرار المالك الصريح: لا نموذج مدفوع ولا اشتراك جديد — ثم تحديث STATE.md وworklog.md والدفع إلى main.

Work Log:
- (1.1 مؤجل بقرار المالك الموثق) ترقية نموذج P2/P4 المدفوعة غير قابلة للتنفيذ بأمر المالك نفسه («النموذج المدفوع غير ممكن حاليًا») — التقدير الكلفوي باقٍ بالتقرير §9-1.1 لقرار المالك.
- (1.2 دستور التحرير الموحد) ملف جديد src/lib/blog-editorial-law.ts يصدّر كتل LANG/ANSWER-FIRST/EEAT/FACT-GUARD/DEPTH/FAQ-CONTRACT + نطاقات السلطات التسعة + قانون anchors — منقولة byte-exact من P2/P4 (تأكيد آلي بالمقارنة الحرفية أثناء الاستخراج)؛ P1/P2/P4 يبنى منها prompts حرفية كما كانت، والمسار الاحتياطي (runArticleGenerate) استبدل نصوصه المُعاد صياغتها (فروع F8) بالكتل الكنسية وFAQ عيّره من 4-6 إلى نطاق 4-7 المشترك — كناري no-fork سلوكي جديد يلتقط الـprompts الفعلية لكل بناة (10 اختبارات) + إعادة توجيه دبابيس LANG_RULE القائمة للملف الجديد (blog-editorial-rules + blog-faq-quality — نمط سابقة 175).
- (1.3 رؤية fallback البحث) علامة researchSource:"fallback"|"model" في bundle كل صف يدرجه P0 (مسارات CREATE/التوأم/JOIN/التراجع) + تنبيه console.error صاخب بمسار P0 عند الفشل الكامل للسلسلة + سطر إنذار بلوحة queue-health (مسح 24 ساعة LIKE على الباندل — best-effort) — جزء GSC مؤجل: يحتاج اعتمادات Search Console API للمالك (خدمة خارجية بقراره).
- (1.4 بطارية P5 الموسعة) ملف جديد src/lib/blog-quality-gates.ts نقي (بلا DB/شبكة): G2 عدد H2 ≥5 · G3 FAQ النهائي داخل 4-7 (سقف 7 يُطبق الآن على مسار research0 المتدهور أيضًا — كان يرفع حتى 10) · G4 ≥1 رابط سلطة خارجي من نطاقات EDITORIAL_AUTHORITY_DOMAINS (المدونة كلها YMYL) · G5 كاشف anchors غير قواعدية (قوائم كلمات ≥4 كلمات بلا كلمات وظيفية أو حشو >5 كلمات — عنوان المقال المنشور مطابقًا مسموح، EN+AR) · G6 كاشف عبارات البحث المنقولة بين تنصيص §C4 (EN: مقتبس ≥4 كلمات كله صغير بعلامة بحث؛ AR: يبدأ بكم/كيف/ما... — تصحيح جوهري: \b لا يعمل بعد الحروف العربية فاستُبدل بمرساة فراغ) — أي انتهاك فشل صادق «quality-gate battery failed — ... — rerun p4-review» بنفس آلية Latin/الطول (markFailed + backstop 23:40).
- (1.5 علاج عناقيد التزاحم الثلاث المؤكدة F4) قرار تحريري موثق لكل عنقود بعد فحص حي للعناوين وهياكل H2: (أ) زوج السعرات EN (تشابه 0.78 — كلاهما يجيب حرفيًا «How many calories should I eat to lose weight») → 301 + إلغاء نشر calories-to-lose-weight-build-muscle-beginner (حمل دليل حشو §10.2) لصالح calculate-daily-calories-fuel-fat-loss-bulking (عنوان السؤال الحرفي + بنية الحاسبة/المخطط)؛ (ب) زوج «تصميم برنامج» AR → 301 + إلغاء نشر muscle-building-home-workout-plan لصالح muscle-building-home-workout-guide (زاوية «بدون معدات» يغطيها الدليل الشامل المخصص أصلًا)؛ (ج) عنقود الاستشفاء EN ×4 → تمييز intent بكسر قالب العنوان المشترك «How to Use X for Muscle Recovery» عبر إعادة عنونة الأربعة (أخطاء/توقيت هرموني/خطة 7 أيام/برنامج 4 أسابيع ≤60 حرفًا — الهياكل الداخلية متمايزة أصلًا) — كل ذلك بميجريشن 0096 (بيانات فقط idempotent: A إلغاء النشر + B تصفير linked_post_id المعلق بنمط 0084-A2 + C إعادة العونة + D VERIFY) + سطرا الإعادة في next.config.ts بنمط 178/192 + صف INDEX.md — زوج «دليل شامل» بالمعدات (بدون معدات × أوزان بسيطة) بقي بقرار موثق نيتين بحثيتين حقيقيتين، وزوج الصدر AR رُصد أثناء التنفيذ مرشحًا غير مقاس بالتقرير ويُترك للمالك.
- (الاختبارات) +31: 10 كناري دستور/سلوكية no-fork (التقاط الـprompt الفعلي لكل بناة وإثبات احتوائه الكتل المصدرة حرفيًا) + 11 وحدة بوابات (كل كاشف باتجاهي الإيجاب/السالب EN+AR) + 6 سلوكية P5 تستدعي المعالج الفعلي: 5 حجب موجه (أقسام 4 · بلا رابط سلطة · FAQ خارج النطاق · عبارة منقولة · anchor قائمة كلمات — كلها 500 + markFailed بالتشخيص) + نشر كامل ناجح لمقالة مستوفية (200 + insert + published — إثبات عدم الحجب الكاذب على المسار الحي كاملًا).
- (البوابات) tsc ✓ 0 · vitest ✓ 1,816/1,816 · eslint ✓ 0 · next build ✓ 2,022/2,022 · docs_audit ✓ · docs_parity ✓ · stale-refs ✓ · migration_audit ✓ (0096 بيانات فقط — صفر انجراف).
- (الاختبار الحي — قبل دفع main) دُفع كود هذا الفريم كفرع تحقق phase1-verify وأُطلق عليه blog-post-en.yml بمدخلات فارغة (تشغيل تلقائي كامل P0→P5 بنماذج الإنتاج المجانية وSupabase الحي — التشغيل 36489146598): **P0→P4 خضراء بالكامل بالدستور الموحد** (prompts المبنية من الكتل المشتركة عملت بلا أي كسر مع نماذج الإنتاج) · **قانون fallback أُطلق حيًا في نفس التشغيل**: سلسلة بحث EN فشلت كاملة (gpt-oss شكلًا غير صالح ×2 + nemotron مهلة) → طُبع التنبيه الجديد حرفيًا بسجل التشغيل «⚠ RESEARCH FALLBACK (en): … topics come from the STATIC curated pool» + researchFallback:true بالاستجابة + الصف 6809be9a مختوم researchSource:fallback بالباندل (سكاناريو الـ24% الذي قاسه التقرير C3 حدث في هذا التشغيل بالذات) · **بوابة P5 حجبت المسودة الناقصة**: 1077 كلمة < أرضية 1300 — فشل صادق بثلاث محاولات («p5: article too short (1077 words < 1300-word floor) — rerun p2-content») ولم يُنشر شيء (بوابة الطول تسبق البطارية fail-fast — هذا تشغيل مجاني ساقط بالضبط كما وصف التقرير F1: nemotron/gpt-oss لا يبلغان المواصفة والنظام رفضه بدل نشره).

Stage Summary:
- المرحلة 1 منفذة بندًا بندًا وفق التقرير: 1.2+1.3+1.4+1.5 كاملة، 1.1 (النموذج المدفوع) وجزء GSC من 1.3 مؤجلان بقرار المالك الموثق؛ صفر خدمات خارجية، صفر نماذج مدفوعة، صفر مساس بbusiness logic خارج ما يوجبه التقرير.
- توقع تشغيلي صادق للمالك: البطارية ترفع سقف الرفض — على السلسلة المجانية الحالية قد تُحجب مسودات كانت ستنشر سابقًا (هذا مقصود التقرير: «يوقف النشر الناقص فورًا»)، وفتحة اليوم يعبئها backstop 23:40 بمحاولة جديدة؛ مؤشر النجاح بعيد المدت (وسيط ≥1500) يظل مرهونًا بقرار 1.1 المدفوع المؤجل.
- Push status: pushed to main · التحقق الحي بعد النشر (301s + العناوين الجديدة عبر ISR + خروج المنحوزين من sitemap + لوحة queue-health) يلي اكتمال Vercel في نفس الجلسة.

---

---
Task ID: PHASE0-QUALITY-2026-09-29
Agent: Super Z (main)
Task: أمر المالك 2026-09-29 — تنفيذ المرحلة 0 فقط من AUDIT_REPORT.md (§9) لتحسين جودة توليد المقالات بالموارد والنماذج الحالية، دون توسيع النطاق أو إعادة بناء الـpipeline أو إضافة prompts فوق القديمة، مع اختبار التوليد والنشر فعليًا وإثبات أن بوابة الجودة تمنع الضعيف.

Work Log:
- (0.1 صدق القالب) حذف ادعاء «Sources cited in article / تحقق من المصادر المنشورة في المقال» (تدقيق F2: 97/97 صفحة والواقع 62/97 بلا أي رابط خارجي وFACT GUARD يحظر تسمية المصادر) + حذف بلوك الـkeyword chips المرئية `#tag` (F7: حشو كلمات مفتاحية خام ظاهر للقارئ) من BlogArticlePage.tsx — بقاء tags في DB/النوع دون عرض؛ التعليق القديم الخاطئ عن JSON-LD صُحّح.
- (0.2 GEO) FAQPage JSON-LD من faq_json في صفحتي الخادم EN/AR (F5: 0/97 رغم جاهزية البيانات في كل مقالة) — عبر getFAQSchema الموجود في seo.ts (مصدر واحد، لا fork)، بلا حشو (لا faq_json → لا schema)، من الخادم = مرئي للزواحف بلا JS، لقيمة محركات الإجابة تحديدًا (rich results تقاعدت مايو 2026 بقانون seo.ts — نفس نهج coaching/for-coaches).
- (0.3 بوابة الطول) P5_WORD_FLOOR=1300 في مسار p5-publish: `countWords(review.markdown)` (نفس أساس reading_time وخط الأساس المقيس n=109) — أقل من 1300 → throw → markQueueItemFailed برسالة «p5: article too short (N words < 1300-word floor) — rerun p2-content» → backstop 23:40 يعبّئ فتحة اليوم (نفس آلية Latin gate القائمة حرفيًا)؛ الترتيب قبل حراس الحصة/التكرار (فشل سريع بلا DB roundtrips).
- (0.4 صدق الوثائق) AGENTS.md §8: الأساس صار 1500–2500 (ask الرئيسي) + floor ‏1300 في P5 + 5–7 H2 + الإبقاء على 1100–1400 كمواصفة المسار الاحتياطي (drafts فقط) بدل كونه المعيار؛ سطر maxModels: ‏2/4 بدل «5»؛ خطة SEO: ‏1 مقالة/يوم/لغة (Phase 119) بدل «6 مقالات/يوم» في الموضعين.
- (0.5 مؤجل بقرار موثق) ربط og:image بالمولّد المحلي يُعكس على إصلاح SOCIAL-OG/SOCIAL-OG-2 (أمر مالك 2026-09-22 «اجعل النشر يستخدم صورة المقال» + تحقق حي 11/11 يوم 2026-09-28) والسبب الجذري الموثق للمربع الأزرق هو cold render ‏1.7–5.2s للمولد — التأجيل موثق في حقل shareImage بblog-server.ts ويتطلب قرار مالك صريحًا بقبول المخاطرة؛ قوانين og الحية لم تُمس (og-image-coverage + low-fixes-p2-14 خضراء).
- (الاختبارات) كناري جديد blog-phase0-quality-gates.test.ts: ‏12 pinًا بنيويًا (0.1–0.4) + اختباران سلوكيان يستدعيان معالج P5 فعليًا بمحددات مضبوطة: مسودة 804 كلمة → 500 + markQueueItemFailed برسالة البوابة (الحجب مثبت) ومسودة 1500 كلمة → عبرت البوابة لحراسة الحصة التالية (daily-quota-met — لا حجب كاذب).
- (البوابات) tsc ✓ 0 · vitest ✓ 1,785/1,785 · eslint ✓ 0 · next build ✓ 2,022/2,022 · docs_audit ✓ · docs_parity ✓ · stale-refs ✓.
- (الاختبار الحي — قبل دفع main) دُفع كود هذا الفريم كفرع تحقق phase0-verify وأُطلق workflow التوليد الفعلي عليه (blog-post-en.yml بمدخلات فارغة = تشغيل تلقائي كامل P0→P5 بنماذج الإنتاج المجانية وSupabase الحي): P0→P4 نجحت كلها، وP5 **حجب المسودة (419 كلمة < 1300) بالبوابة الجديدة** — الصف failed بالرسالة «p5: article too short (419 words < 1300-word floor) — rerun p2-content» — مسودة كانت ستنشر تحت الأرضية القديمة (400 كلمة فقط)؛ ملاحظة تشغيلية: حصة EN الآلية لليوم كانت مستهلكة أصلًا بصف تلقائي منشور (bd789e80 أُنشئ 00:16 UTC)، لذا حتى المسودة الكافية كانت ستتخطى بحارس الحصة اليوم — أول نشر كامل تحت البوابة يكون في الفتحات المجدولة التالية (05:00 AR / 22:00 EN) وبقانون الحصة القائم.

Stage Summary:
- المرحلة 0 منفذة 4/5 بنود كاملة + 0.5 مؤجل بتوثيق تعارض قرار مالك؛ صفر prompts جديدة، صفر نماذج مدفوعة، صفر مساس بbusiness logic خارج البوابة المطلوبة، صفر إحياء لتعليمات قديمة.
- Push status: pushed to main · الإثبات الحي: تشغيل توليد فعلي على فرع التحقق — البوابة حجبت مسودة 419 كلمة كانت ستنشر بالكود القديم (أرضية 400)، وP0→P4 خضراء بالكامل؛ التحقق الحي لصفحات المقالات القائمة (زوال chips/الادعاء + FAQPage JSON-LD عبر ISR) يلي اكتمال نشر Vercel مباشرة في نفس الجلسة.
- ملاحظة تشغيلية: فشل الصف اليوم صادق ومقيس (لا نشر ناقص) وحارس الحصة/backstop 23:40 يعملان كما صُمما (تغطية اليوم محققة بصف 00:16 — لا تعبئة ليلية إضافية).

