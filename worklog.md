# Worklog

> **Policy (Phase 288 — ARCH-REMEDIATION, audit P1-1):** the live file IS the active window —
> hard-capped at **≤ 12 entries AND ≤ 128 KB** (`scripts/docs_audit.py` check H5). Anything below
> the window rotates verbatim to `archive/WORKLOG_ARCHIVE.md` in the SAME commit via
> `python3 scripts/worklog_rotate.py` — size-driven, never calendar-driven, never one-shot.
> newest on top; append-only; one entry per task (§12.5.1).

---
---
---
Task ID: SOCIAL-OG-3-2026-09-30
Agent: Super Z (main)
Task: أمر المالك 2026-09-30 «نعم ابدأ التنفيذ للخطة، أيضاً تأكد من وجود أزرار مشاركة في كل الصفحات العامة ثم نفذ الاختبارات ووثق وادفع إلى المستودع» — تنفيذ خطة إصلاح نظام صور المشاركة كاملة بعد جولتي تدقيق اليوم (السبب الجذري: تصميم البطاقات نفسه أزرق Apple بلا علاقة بالهوية + og-home عامة على ~90 رابط).

Work Log:
- (إعادة التصميم الجذرية) scripts/generate-og-cards.py: هوية العلامة الفعلية بدل تدرج #1d1d1f→#0071e3 — خلفية دافئة #FAF8F5→#EAE3D8 + خطوط آلة #E5DFD6 + دائرة A سوداء دافئة #201D1A + نصوص دافئة، وأُعيد توليد الـ50 بطاقة (20 معاد تصميمها + 30 جديدة: 12 عائلة × لغتين لكل سطح كان يستخدم og-home + 3 مقارنات × لغتين ثابتة) — تحقق PIL: صفر بكسل أزرق بالـ50، وتحقق bidi حتمي للعربي (ارتباط 0.984 مع مرجع RTL مقابل 0.522 LTR) + فحص VLM بصري نظيف.
- (المولد الديناميكي) route.tsx: دعم type=compare من src/lib/comparisons.ts (بيانات نقية edge-safe) بدل البحث في blog_posts فقط — العناوين الثنائية الحقيقية الآن؛ إعادة تصميم بالهوية الفاتحة ذاتها؛ إصلاح ترتيب فوتر AR: أثبتنا تجريبياً بnext/og أن Satori يتجاهل direction بترتيب flex فيرسم DOM كما هو — الكلمة العربية تُطلب أخيرة بالـDOM فتظهر أقصى اليمين [Alkemos][مدونة] (كانت معكوسة).
- (المقارنات تترك المولد) صفحات /compare/[slug] EN+AR تعلن البطاقة الثابتة og-compare-<slug>-<lang>.png?v=3 بog+twitter+JSON-LD (قانون §12.40) — عنوان صحيح + صفر cold start بمسار الزاحف؛ فرع type=compare بالمولد يبقى للروابط القديمة المخزنة بالمنصات.
- (إعادة التوصيل + الكاش) 30 سطحاً EN+AR على بطاقات مخصصة (programs/memberships/coaching/diet-plan+cells/equipment/authors/compare/about/contact/faq/affiliate/legal/register→for-coaches) — og-home بقيت للجذور الحقيقية وصفحات المدربين فقط؛ رفع ?v=2→?v=3 بكل الميتاداتا (79 ملفاً) = إجبار كل منصة على جلب البطاقة الجديدة.
- (أزرار المشاركة) +23 سطحاً عاماً (25 ملفاً): مقارنات hub+detail، فهرس المدونة و10 تصنيفات (مكونات مشتركة)، عضلات، مجموعات، معدات، كُتّاب hub+صفحات، خطط غذائية، مخططا AI، about/faq (StaticPageView بpath-aware)، contact — بقانون المسار القياسي؛ privacy/terms مستثناة موثقاً (لا نية مشاركة).
- (الحرس) اختبار بصري آلي جديد og-image-visual.test.ts (51): فاك PNG نقي بلا تبعيات (zlib+unfilter) يفرض على كل بطاقة: 1200×630 + صفر أزرق قوي + زوايا دافئة فاتحة + حبر فعلي (البطاقة الفارغة تفشل)؛ تحديث قوانين التغطية (71): كل سلاگ COMPARISONS له زوج بطاقات على القرص، لا PNG يتيمة، فرع compare بالمسار؛ توسيع سجلات share-url/share-unified لقانون الأسطح الكامل.
- (البوابات) tsc 0 · eslint 0 · vitest 1,977/1,977 · next build 2,023 صفحة · دخان حي بnext start + UA فيسبوك: المقارنات والأسطح المعاد توصيلها تُصدر البطاقات الصحيحة ?v=3، البطاقات 200 image/png، رابط المولد القديم ?type=compare&v=2 يرسم التصميم الفاتح الجديد بعنوان AR الصحيح (فحص بكسلي)، وأزرار المشاركة تُرسم SSR بالصفحتين EN+AR.

Stage Summary:
- السبب الجذري «المربع الأزرق» مغلق نهائياً: التصميم أصبح هوية الموقع الفعلية، ومحظور بكسلياً بجناح الاختبارات، و?v=3 يجبر كل منصة على إعادة الجلب.
- كل نوع صفحة عامة له بطاقة مخصصة أو صورته الحقيقية + أزرار مشاركة بقانون المسار القياسي.
- المتبقي على المالك: Scrape Again بالروابط المهمة أو انتظار ≤30 يوم TTL (خارج سيطرة الموقع).
- Push status: pushed.
- Commit SHA (optional, post-push): (git log is the ledger)

---
Task ID: GSC-AUDIT-RETRACT-2026-09-30
Agent: Super Z (main)
Task: أمر المالك 2026-09-30 — حذف تقرير تدقيق GSC كاملًا (docs/GSC-OPERATIONAL-INTEGRATION-AUDIT-2026-09-30.md) والإبقاء على مذكرة وحيدة دنيا: الاتصال حي ومُثبَت بالحساب/السر القائم ووصول قراءة-فقط، والاندماج الدائم مؤجل قصدًا 30–60 يومًا مع إعادة تدقيق إلزامية قبل أي تنفيذ — توثيق فقط، صفر مساس بكود/سير عمل/أسرار/قاعدة/إعدادات GSC.

Work Log:
- (الحذف) git rm للتقرير الحاكم — محتواه محفوظ حرفيًا بتاريخ git (أصل 5fd41d49 · تصحيح 3f46c8a0)؛ لا صف سجل يشير إليه بمسار حي بعد الآن (قانون M الاتجاهان).
- (المذكرة البديلة) docs/GSC-CONNECTION-STATUS-2026-09-30.md — دنيا بحكم الأمر: (1) الاتصال حي ومُثبَت بالسر القائم GOOGLE_SEARCH_CONSOLE_CREDENTIALS (نطاق webmasters.readonly · SA alkemos-gsc-reader@muscleshub.iam.gserviceaccount.com — تشغيلا الاختبار 36647573294/36649457709 ناجحان والخاصيتان ظاهرتان بخط أساس 28 يومًا مقيس)؛ (2) الاندماج الدائم مؤجل قصدًا 30–60 يومًا (نافذة إعادة التدقيق 2026-10-30→2026-11-29) — لا جامع/مخزن/قرّاء/بوابات بالفترة؛ (3) إعادة تدقيق إلزامية قبل أي تنفيذ (كود/سير عمل/قاعدة/إعدادات) — السطح يبقى السر القائم + اختبار الاتصال dispatch-only كما هو.
- (المبدأ الملزم باقٍ) GSC لا يحدد مواضيع المحتوى الجديد — الاكتشاف بالبحث الخارجي الحي وأدلة GSC بعد النشر فقط (مذكور بالمذكرة والصف والسطر أدناه).
- (صفر تنفيذ) لم يُمس أي src/workflows/supabase/secrets/إعدادات — لم تُنفَّذ G1 ولا أي مرحلة؛ أمر التأجيل يسري على الكل.
- (الامتثال بنفس الفريم §3.8) صف السجل بdocs/README.md (الصف الجديد للمذكرة + إزالة صف التقرير المحذوف) · STATE.md (سطر آخر تحديث + بند المفتوح الآن) · هذا المدخل + دوران H5 (13→12 مدخلًا بالأرشيف) — كوميت docs-only واحد بعلامة [vercel skip].

Stage Summary:
- التقرير الحاكم حُذف؛ البديل مذكرة وحيدة docs/GSC-CONNECTION-STATUS-2026-09-30.md: اتصال حي/مُثبَت (سر قائم، قراءة-فقط) · تأجيل قصدي 30–60 يومًا · إعادة تدقيق قبل أي تنفيذ.
- الملفات: حذف docs/GSC-OPERATIONAL-INTEGRATION-AUDIT-2026-09-30.md · docs/GSC-CONNECTION-STATUS-2026-09-30.md (جديد) · docs/README.md · STATE.md · worklog.md (+أرشيف الدوران) — لا شيء غيرها.
- Push status: pushed
- Commit SHA (optional, post-push): (git log is the ledger)

---
Task ID: GSC-AUDIT-CORRECTION-2026-09-30
Agent: Super Z (main)
Task: أمر المالك 2026-09-30 — تصحيح مستهدف للتقرير الحاكم docs/GSC-OPERATIONAL-INTEGRATION-AUDIT-2026-09-30.md: إزالة أي اتجاه لاستخدام GSC في اختيار مواضيع المحتوى الجديد (وثائق فقط — صفر كود/سير عمل/قاعدة/إعدادات، وبدون تنفيذ G1).

Work Log:
- (المبدأ) استُبدلت IP-1 بالنص الملزم: «GSC must not determine new-content topics. New-content discovery remains driven by live external research. GSC provides post-publication search evidence for optimization, content expansion, cannibalization detection, and validation.» — مع تدفق البيانات الصريح: بحث خارجي حي → قرار المحتوى → النشر → استجابة Google → قياس GSC → تحسين/توسع (الحلقة تعود عند التحسين/التوسع، لا عند قرار المحتوى).
- (G2) أعيد تعريفها من «تغذية بحث P0» إلى «GSC Evidence & Optimization Loop» — تعمل بعد وجود المحتوى فقط: gsc-data.ts (القارئ المطبوع الوحيد) + أول مستهلكي ما بعد النشر (قائمة تحسين/توسع للمقالات المنشورة) + عدادات أدلة queue-health — سلسلة P0 تبقى مطابقة بايت-بايت (researchSource بقيمتيه نهائيًا) + كاناري يثبت أن بحث P0 خالٍ من GSC.
- (تعارضات صُحّحت فقط) §2.3 (بند AUDIT_REPORT:314 أصبح superseded — «أبدًا» لا «مرجأ») · §2.4 (لا قيمة gsc مخططة) · §3 (الدور بعد النشر فقط) · مخطط §5 (المستهلك الأول = أدلة التحسين/التوسع — لا P0) · §5.1 · §6-بند5 · §7.1 · §7.2 · §9 (إعادة صياغة إطار G2 الأعلى قيمة + نقل هدف fallback-rate 24%→3% خارج نطاق GSC).
- (غير المُغيَّر — بأمر المالك) معمارية G1 كاملة (الجامع/المخزن/الاعتماد/النطاق/الإيقاع) + IP-2..IP-12 كما هي + لا تنفيذ لأي مرحلة.
- (الامتثال) قسم change history §11.1 بالتقرير (صف الأصل 5fd41d49 وصف هذا التصحيح) + صف docs/README.md (وصف IP-1 والحالة) + سطرا STATE.md (آخر تحديث + المفتوح الآن) + هذا المدخل + دوران H5 — كوميت docs-only واحد بعلامة [vercel skip].

Stage Summary:
- التقرير الحاكم يمنع الآن صراحةً اختيار GSC للمواضيع: الاكتشاف = بحث خارجي حي؛ أدلة GSC = بعد النشر فقط (تحسين/توسع/كشف تزاحم/تحقق)؛ G2 = حلقة أدلة وتحسين بعد النشر تعتمد على G1.
- الملفات: docs/GSC-OPERATIONAL-INTEGRATION-AUDIT-2026-09-30.md (التصحيح + §11.1) · docs/README.md (الصف) · STATE.md (سطران) · worklog.md (هذا المدخل + الأرشيف عند الدوران) — لا شيء غيرها.
- Push status: pushed
- Commit SHA (optional, post-push): (git log is the ledger)

---
Task ID: GSC-OPERATIONAL-INTEGRATION-AUDIT-2026-09-30
Agent: Super Z (main)
Task: أمر المالك 2026-09-30 — تدقيق معماري قراءة-فقط: كل طريقة عملية يمكن لـ Google Search Console أن يدخل بها كقدرة تشغيلية مستمرة (مصدر أدلة لعمليات قائمة/مستقبلية — لا نظام تقارير)، مبنيًا على المستودع الفعلي والاتصال الحي بالسر الموجود، ثم توثيق الخطة بالمستودع. صفر تعديل كود/سير عمل/قاعدة/إعدادات.

Work Log:
- (الأدلة الحية) تشغيلَا اختبار الاتصال (36647573294 · 36649457709) ناجحان: السر GOOGLE_SEARCH_CONSOLE_CREDENTIALS يصادق على Google (SA: alkemos-gsc-reader@muscleshub.iam.gserviceaccount.com · نطاق webmasters.readonly) ويرى خاصيتين عبر sites.list: sc-domain:alkemos.com + الخاصية القديمة https://musclehubeg.vercel.app/ — خط أساس 28 يومًا مقيس: alkemos 4 نقرات/4172 ظهورًا/CTR 0.10%/موضع 55.53 · القديمة 8/4600/0.17%/16.37.
- (فحص حي) robots الموحد + 7 أسطر Sitemap · فهرس السايت ماب بأبنائه الستة وlastmod=اليوم · 301 حية: العلامة القديمة → alkemos.com وwww→apex وhttp→https.
- (المسح المعماري) صفر استهلاك للسر خارج gsc-connection-test.yml المؤقت · صفر جداول أداء بحث في الميجريشنز · صفر سطح أدمن للبحث (evo-analytics فقط) · researchSource بلا قيمة gsc · سطر AGENTS.md:164 (مصدر GSC محجوب مالكياً) متقادم واقعيًا الآن · فجوة صف السر بdocs/RECOVERY-SECRETS-SOURCES.md (قانونه :93) · السر غائب عن .env.example (صحيح — GHA فقط).
- (نقاط الاندماج IP-1..IP-12 مبنية على المكونات الفعلية) تغذية P0 باستعلامات حقيقية (بند AUDIT_REPORT §9-1 المرجأ بقرار مالك — غير محجوب تقنيًا الآن) · بوابات توسيع الأطعمة المعربة (النافذة المعلنة 2026-09-19 بلا أي قياس يجمعها) · محطة ذيل USDA (~2026-12-07) · رصد قبول السايت مابز السبعة (فئة Couldn't fetch الموثقة بsitemap.xml route:13-21) · تحقق فهرسة المنشور الجديد (URL Inspection بعينات) · حلقة CTR/عناوين (ترتيب بالفرصة بدل المسح الشامل) · ترتيب قنوات العلاج بالقيمة + تحقق ما بعد APPLY · كشف تزاحم دوري (خليفة 0096 اليدوي) · مراقبة هجرة العلامة عبر الخاصية القديمة · إقران GEO-M باتجاه GSC شهريًا · ترتيب طابور مراجعة المالك (0097) بالانكشاف · سطح أدمن للبحث (سابقة requireAdmin + عرض).
- (المعمارية المقترحة) «جامع واحد · مخزن واحد · قرّاء كثر»: gsc-collect.yml (أسبوعي + شهري + dispatch — نقل كود الاختبار المُثبت حرفيًا: JWT/openssl · stdlib فقط · بلا checkout/تثبيت A-12) + ميجريشن 00NN (gsc_runs + gsc_metrics بRLS حارماني) + قرّاء محليون فقط (P0 · queue-health · admin · البوابات) — السر لا يغادر GitHub Actions أبدًا وصفر نداءات Google من Vercel.
- (الخطة) G1 الجامع+المخزن → G2 تغذية P0 (researchSource:"gsc+model" + عدّاد queue-health + علم إرجاع GSC_GROUNDING=0) → G3 سطح المالك → G4 سايت ماب+فهرسة (قرار نطاق URL Inspection) → G5 بوابات مبنية على الأدلة بعد 30-90 يومًا تراكم — كل مرحلة بأمر مالك مستقل وكوميت واحد ووثائق بنفس الفريم (قوانين الفريمات مرجعة §7.2 بالتقرير).
- (القيد) صفر تنفيذ الآن · لا مساس بأي src/workflows/supabase/next.config/vercel.json/.env.example · حقائق API الخارجية الموسومة [verify] بالتقرير تُحسم في G1 · حذف gsc-connection-test.yml يبقى بأمر مالك بعد إثبات الجامع (ترويسته تُلزم بذلك).

Stage Summary:
- التقرير الموثق: docs/GSC-OPERATIONAL-INTEGRATION-AUDIT-2026-09-30.md (صفه بسجل docs/README.md بنفس الكوميت — قانون M) — المصدر الحاكم لمرحلة التنفيذ القادمة؛ نقطة البدء الملزمة: التقرير §9 = المرحلة G1 بأمر مالك.
- الاتصال مثبت والبيانات مقيسة (خاصيتان + خط أساس 28 يومًا) — الجزء المرجأ من AUDIT_REPORT §9-1 (بحث حقيقي) صار قابل التنفيذ عند أمر المالك دون أي اعتماد جديد.
- الملفات: docs/GSC-OPERATIONAL-INTEGRATION-AUDIT-2026-09-30.md (جديد) · docs/README.md (صف السجل) · STATE.md (سطر المفتوح الآن + آخر تحديث) · worklog.md (هذا المدخل) — لا شيء غيرها تغيّر.
- Push status: pushed
- Commit SHA (optional, post-push): (git log is the ledger)

---
Task ID: REPAIR-OBSERVABILITY-R5-2026-09-30
Agent: Super Z (main)
Task: أمر المالك 2026-09-30 — تنفيذ المرحلة R5 فقط (الرصد) من خطة docs/EXECUTION-PATH-AUDIT-AND-RECOVERY-PLAN-2026-09-29.md: عدّاد إصلاح في /api/ai/queue-health (عدد الصفوف التي نُشرت بعد repair loop) + سطر في ملخص التشغيل — لقياس «repair-first vs regenerate» فعليًا. Audit سريع أولًا مقابل الكود وAGENTS وSTATE وworklog ثم التنفيذ الكامل إن صحّت الافتراضات. لا انتظار OpenRouter ولا تشغيل workflow حي الآن، ولا أي R6/تغييرات خارج نطاق R5. اختبار كامل ثم commit منفصل + push إلى main + تحقق CI/Vercel.

Work Log:
- (Audit سريع — الافتراضات كلها ما زالت صحيحة) queue-health موجود به نمطا scan جاهزان (fallback/pairing) · حلقة R1 حية (فريم 303) تجعل صنف «نُشر بعد إصلاح» قابلًا للقياس · الـbundle ينجو عبر سلسلة الإصلاح (p2-force ينشر {...bundle, content} وp4 {...bundle, review}) فالختم يدوم حتى النشر · خطوة Summary موجودة بكلا workflow · لا معرفات repairLoop/REPAIRS_USED موجودة — صفحة نظيفة · شرط STATE لقرار R5 مستوفى (R4 منفذة وموثقة بفريم 306) وأمر المالك صريح.
- (1 — الختم التراكمي) `stampQueueRowRepairDirective` بsrc/lib/blog-queue.ts + القارئ الدفاعي `parseBundleRepairLoop`: مسار P5 عند كل توجيه إصلاح (جسم 500 حيث rerunTarget != null) يختم `repairLoop: {directives, lastTarget, lastAt}` في bundle الصف — best-effort بلا رمي أبدًا (نفس قانون markQueueItemFailed)، وفشل قراءة الصف لا يكتب شيئًا (كتابة عمياء قد تمسح bundle حقيقيًا)؛ سابقة researchSource/coachRequested.
- (2 — العدّاد) GET /api/ai/queue-health يحمل `repair` بنافذة 14 يومًا (نافذة قياس التدقيق): published · afterRepair · exhausted · sharePct · recoveryPct — مثل() parse-gated ضد الإيجابيات الكاذبة بمتن الموضوع، رصد محايد بلا سطر issues (مثل pairing)، يتدهور مفتوحًا عند فشل الـscan.
- (3 — سطر الملخص) run-step.sh يصدّر `REPAIRS_USED=n` إلى GITHUB_ENV عند كل دورة إصلاح (الأبناء المتكررون p2..p4 لا يفسدونه أبدًا — الحلقة لا تعيد p5) وسطر ملخص التشغيل بblog-post-{en,ar}.yml يطبعه + يحيل للعدّاد التراكمي.
- (الاختبارات) `blog-repair-r5-observability.test.ts` ‏15/15 (أشكال القارئ الدفاعية · التزايد 1→2→3 · حفظ المفاتيح الشقيقة · عدم الكتابة عند فشل القراءة · العدّاد: النسب المختلطة والإيجابيات الكاذبة والحالات skipped والنافذة الفارغة والتدهور المفتوح) + وصف R5 بblog-repair-contract.test.ts (التوجيه يختم بوسائطه · infra بلا rerunTarget لا يختم · الختم ينجو عبر p2-force إلى الـbundle المكتوب — مصدر قياس العدّاد) + sc8/sc9 بمصفوفة run-step-loop-test.sh (تصدير REPAIRS_USED=1 عند الدورة / لا سطر عند النشر النظيف) + دبوسَا mock بphase0/phase1 تحدّثتا للدالة الجديدة (نفس سابقة R3: الدبوس يتبع تغيير القانون بنفس الفريم).
- (البطارية §3.5 — فريم src كامل) tsc ✓ 0 · vitest ✓ 1,919/1,919 (1901+18) · eslint ✓ 0 (تحذير مسبق واحد بملف لم يُمس) · next build ✓ خروج 0 · run-step-loop-test ✓ ‏9/9 · docs_audit ✓ (STATE ‏28.9KB بعد ضغط السلم 297-302) · docs_parity ✓ · stale-refs ✓ · migration_audit ✓ (لا ميجريشنز — الختم داخل bundle الموجود).
- (التوثيق بنفس الفريم §3.8) AGENTS §8 REPAIR LOOP LAW (بند Repair observability) + ترويسة Last updated · README (فقرة repair) · DEVELOPER_GUIDE (بند R5 بطبقة إعادة المحاولة) · صف الحالة تحت Phase R5 بالخطة (منفذة بالكامل) · STATE فريم 307 + المفتوح الآن + QA.

Stage Summary:
- R5 منفذة بالكامل ضمن نطاقها كما كتبتها الخطة: عدّاد queue-health + سطر ملخص التشغيل، فوق ختم تراكمي بمصدر الحقيقة (bundle الصف) — صفر مساس بأي بوابة أو حالة أو ميزانية إصلاح أو prompt؛ جسم 500 وشكل الاستجابات كما هي بالبايت.
- القياس يتراكم تلقائيًا: أول توجيه إصلاح قادم يختم الصف ويظهر بالعدّاد وسطر الملخص — بلا أي تشغيل حي الآن (بأمر المالك)؛ قراءة العدّاد: GET /api/ai/queue-health للمالك/الأدمن.
- الخطة التنفيذية R1→R5 مكتملة الآن بالكامل (كل مرحلة منفذة وR1-R3 مثبتة حية).
- Push status: pushed · التحقق من CI وVercel بعد الدفع موثق بتقرير الجلسة.
- Commit SHA (optional, post-push): (git log is the ledger)

Task ID: FLOOR-ALIGNMENT-R4-2026-09-30
Agent: Super Z (main)
Task: أمر المالك 2026-09-30 — تنفيذ المرحلة R4 فقط من خطة docs/EXECUTION-PATH-AUDIT-AND-RECOVERY-PLAN-2026-09-29.md (اصطفاف أرضيات التنفيذ + رافع FAQ): علاج سبب word-floor بأدلة التشغيلين الحيين لـR3 (مسودات المحتوى وصلت قصيرة + P4 قد يقلّص) — لا مسّ أي Gate ولا تخفيف أي حد. اختبار كامل ثم commit+push إلى main وتحقق من CI. لا R5 الآن (قرار مستقل بعد نجاح R4 وتوثيقه).

Work Log:
- (الأرضية 1 — P2 داخل generateFullArticle) ثابت مشترك مُصدَّر `BLOG_EXECUTION_WORD_FLOOR = 1200` يحل محل شبكة صلاحية الـparse القديمة (400): مسودة <1200 كلمة تفشل في خطوتها الرخيصة حيث إعادة run-step ×3 = سحبة نموذج جديدة — فئات الأدلة الحية 419/752/911/1271 كانت تحترق في P3+P4 قبل أن ترفضها بوابة P5 ‏(1300)؛ رسالة الخطأ تحمل القياس «(N words < 1200-word execution floor)».
- (الأرضية 2 — P4 داخل reviewAndEnhance، بأمر المالك: P4 قد يقلّص) نفس الثابت: مراجعة محلّلة تخرج <1200 تفشل عند P4 برسالة مميزة لصنف «المراجعة قصّت المسودة» (المقيس الحي 1201→752 بتشغيل 36582658309 · 1409→1369 بتدقيق §3.2) — منفصلة عن رسالة JSON التالفة القديمة بالبايت؛ نطاق 1200–1300 يبقى لحلقة إصلاح R1 ‏(p2 ?force=1) كما صُمم.
- (الرافع — الصيغة النصية الثالثة في splitFaqSection) سطر سؤال نصي يُقبل إن كان ≤25 كلمة، منتهيًا بـ?/؟، بلا block markdown، ولا يسرق أول سطر إجابة قيد التجميع (الحرس: لا يفتح زوجًا جديدًا ما دام جاري الإجابة) — يستعيد صنف «FAQ count 0» الحي (صف 38f230fb: مقال 1369 كلمة أُعدم لأن المراجع أعاد كتابة قسم FAQ نصًا عاديًا) — رافع فقط: عقد كتابة النماذج وكل البوابات (G3/relevance/AR-Latin) كما هي بالبايت.
- (الاختبارات) `src/lib/__tests__/blog-r4-execution-floors.test.ts` ‏20/20: الاتجاهان لكل أرضية (رفض 419/911/752 وعبور 1250) + فصل صنفي رسالتي P4 + الصيغ الثلاث ومزيجها (bold + نصي + H3) بEN وAR + حرس الحدود الثلاثة (سرقة أول سطر الإجابة / السطر >25 كلمة / أسطر القوائم) + السؤال المعلّق بلا إجابة يُسقط + إثبات أن مقال الصف 38f230fb يعبر سلسلة lift→relevance→battery نظيفة (faqs=5، battery=[]) + إعادة إنتاج رسالة G3 الحية حرفيًا «FAQ count 0 outside the 4-7 range».
- (كناريات byte-truth — بند تحقق الخطة) دبابيس مصدر: `const P5_WORD_FLOOR = 1300` في مسار P5 كما هو + G3 يركب EDITORIAL_FAQ_COUNT_RANGE ‏(4-7) المشترك + سلوكًا: faqCount 0 يُخفق و8 يُخفق — لا بوابة خُففت.
- (البطارية §3.5) tsc ✓ 0 · vitest ✓ 1,901/1,901 (1881+20) · eslint ✓ 0 (تحذير مسبق واحد بملف لم يُمس) · docs_audit ✓ (STATE 31,894B بعد ضبط النافذة) · docs_parity ✓ · stale-refs ✓.
- (التوثيق بنفس الفريم) AGENTS §8 ARTICLE QUALITY FLOOR (الأرضيتان + الصيغة الثالثة) + ترويسة Last updated · TECH_REFERENCE §6 نفس البند (كان يحمل أرقام الاحتياطي 1100-1400 القديمة — صُحح للأرقام القانونية) · صف الحالة تحت Phase R4 بالخطة (منفذة بالكامل) · STATE فريم 306 + المفتوح الآن + QA.

Stage Summary:
- R4 منفذة بالكامل ضمن نطاقها: ملف كود واحد كما بالخطة (blog-pipeline.ts: الثابت + الأرضيتان + الرافع) + ملف اختبارات — صفر مساس بأي Gate أو Editorial Rule أو workflow أو route؛ بوابة P5 ‏(1300) وبقية runP5QualityGates بالبايت.
- الأثر المتوقع (قياس التشغيلات القادمة): مسودات 419–1199 تموت عند P2 بسحبات إعادة رخيصة، مراجعة تقصّ تحت 1200 تموت عند P4، وصنف «FAQ count 0» الكاذب يختفي — التحقق الحي بتشغيل مراقب بعد إشارة المالك (لا استهلاق فتحة يومية دون أمره).
- Push status: pushed · التحقق من CI بعد الدفع موثق بتقرير الجلسة.
- Commit SHA (optional, post-push): (git log is the ledger)

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

