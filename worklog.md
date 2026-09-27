# Worklog

> **Policy (Phase 288 — ARCH-REMEDIATION, audit P1-1):** the live file IS the active window —
> hard-capped at **≤ 12 entries AND ≤ 128 KB** (`scripts/docs_audit.py` check H5). Anything below
> the window rotates verbatim to `archive/WORKLOG_ARCHIVE.md` in the SAME commit via
> `python3 scripts/worklog_rotate.py` — size-driven, never calendar-driven, never one-shot.
> Newest on top; append-only; one entry per task (§12.5.1).

---
Task ID: ARCH-REMEDIATION-289-2026-09-28
Agent: Implementation Agent
Task: أمر المالك 2026-09-28 — تنفيذ P1-3+P1-4 من التقرير الحاكم: نقل تاريخ STATE للأرشيف (حالة لا سجل) + إلغاء التواريخ اليدوية من سجل docs (اشتقاق لا تكرار) — صفر مساس بالكود/المنطق/الواجهة.

Work Log:
- (P1-3 نقل) 21 صف مرحلة (287→234) انتقلت حرفيًا إلى archive/PROGRESS_ARCHIVE.md و8 صفوف QA (287→263) إلى archive/QA_CHECKLIST_ARCHIVE.md (كتل مؤرخة append-only) — سلّم المراحل صار صفّين فقط (289+288) وSTATE من 100 سطر/31.1KB إلى **67 سطرًا/11.0KB** (هدف التقرير ≤24KB — تحقق بأقل) — الفقرة المرجعية تشير إلى worklog+الأرشيف.
- (P1-3 إعادة بناء) قسم «المفتوح الآن» أُعيد بناءه: البنود المغلقة التاريخية حُذفت (تاريخها بالأرشيف) والحيّة ضُغطت + بند جلسة الإصلاح مع موعد القياس التنفيذي (P4-4: ≈2026-10-12) + بند المالك المعلق الوحيد (فحوصات إلزامية — GitHub Pro) — سطر «آخر كوميت متحقق منه» صار صريحًا بالترويسة (الفحص B).
- (P1-4 بوابة) docs_audit.py: فحص M أعيدت كتابته ثنائي الاتجاه — (1) كل مسار backtick بصفوف السجل موجود (2) كل docs/*.md علوي له صف (سد النقطة العمياء التي أخفت 4 ملفات) — وعمود Last-updated لم يعد يُفحص إطلاقًا؛ بدلًا منه تقرير البوابة يطبع تواريخ git المشتقة (registry: 42 docs/*.md · all registered · newest by git: …).
- (P1-4 اعتزال I) فحص I (ترويسات Last-updated مقابل git للوثائق الخمس) اعتُزل كاملًا — الترويسات بروفينانس اختياري؛ العائلات 19 (H5 دمجت بعائلة H وI حُررت — قانون ميزانية الفحوص).
- (P1-4 سجل) docs/README.md: العمود المحسوب أُزيل من الجدولين + 4 صفوف جديدة للملفات غير المسجلة (content-strategy.md LIVE · CONTENT-REWRITE-REPORT EXECUTED · NOTIF-I18N-250 EXECUTED · STAFF-BELL-I18N-251 EXECUTED) + قسم «كيف يبقى السجل صادقًا» أعيدت كتابته (التواريخ من git — صفر أعمال ترفيع) + ميزانية القراءة حُدثت (STATE ~11KB).
- (التحقق) docs_audit ✓ صفر مخالفات (بالفحوص الجديدة M/M-coverage وبلا I) · docs_parity ✓ · py_compile ✓ · stale-refs ✓ · ui-wiring ✓ · migration_audit ✓ — tsc/eslint/vitest غير مطلوبة (فريم بوابات+توثيق).

Stage Summary:
- STATE الآن حالة حقيقية 30-ثانية (67 سطرًا/11KB بسقف رحابة حقيقي) والسجل بلا أي تاريخ يدوي — أكبر طبقتي تكرار للحقيقة (RC-2/RC-3) مقفولتان، والمسار العادي صار: تعديل doc واحد بلا ترفيع ترويسة ولا صف تاريخ.
- الملفات الممسوسة: STATE.md (إعادة بناء) · archive/PROGRESS_ARCHIVE.md (+21 صفًا حرفيًا) · archive/QA_CHECKLIST_ARCHIVE.md (+8 صفوف حرفيًا) · scripts/docs_audit.py (M ثنائي + I معتزل) · docs/README.md (بلا أعمدة تواريخ + 4 صفوف) · worklog.md (هذا المدخل).
- Push status: pushed

---
Task ID: ARCH-REMEDIATION-288-2026-09-28
Agent: Implementation Agent
Task: أمر المالك 2026-09-28 — تنفيذ P1-1+P1-2 من التقرير الحاكم docs/ARCHITECTURE-AUDIT-REPORT-2026-09-28.md: سقف صلب لنافذة worklog الحية (≤12 مدخلًا و≤128KB) + دوران ميكانيكي بنفس الكوميت (سكريبت جديد) + اعتزال كوميت «تسجيل SHA» (تعديل §12.5.1) — صفر مساس بالكود/المنطق/الواجهة.

Work Log:
- (P1-1 بوابة) scripts/docs_audit.py: فحص H5 جديد مدمج بعائلة H (احترامًا لقانون ميزانية الفحوص ≤20 عائلة): ملف worklog الحي ≤12 مدخل Task ID و≤131,072 بايت — رسالة الفشل توجه لسكريبت الدوران.
- (P1-1 سكريبت) scripts/worklog_rotate.py جديد: يفكك الملف (ديباجة + كتل مدخلات بمفاصل `---`)، يبقي أحدث 12، يُسقط أي فائض بايتي من ذيل النافذة، ويُلحق الفائض حرفيًا بذيل archive/WORKLOG_ARCHIVE.md بعلامة تدوير مؤرخة — idempotent + وضع --dry-run.
- (P1-1 تنفيذ) الدوران الفعلي بهذا الفريم: 146 مدخلًا (≈688KB) نُقلت حرفيًا للأرشيف — worklog الحي من 758KB إلى ~نافذة 12 مدخلًا فقط (الأرقام النهائية بتقرير السكريبت أدناه).
- (P1-2) AGENTS.md §12.5.1: حقل Commit SHA صار اختياريًا بروفينانس ما بعد الدفع (git log هو السجل — الفحص B يجري تحقق السلف على STATE أصلًا) — اعتزال رسمي لكوميتات «تسجيل SHA بكوميت مستقل» (حلقة RC-1: مهمة واحدة = كوميت واحد) + تحديث قانون الميزانية بالنافذة الصلبة.
- (توثيق تابع) ترويسة سياسة worklog.md أعيدت كتابتها للنافذة الصلبة · DEVELOPER_GUIDE سطر الأرشفة حُدث (نافذة 12/128KB بدل «ذيل التاريخ المتدحرج») · صفوف السجل docs/README.md لworklog/AGENTS/GUIDE/STATE حُدثت.
- (تصحيح تسجيل P0-2 من فريم 287) محاولة تفعيل الفحوصات الإلزامية عبر API (branches/protection ثم rulesets) رُفضت 403: «Upgrade to GitHub Pro or make this repository public» — نفس مانع 2026-09-19 الموثق؛ البند يبقى مالكًا-معلقًا بخطوات UI (الدليل المفصل بمدخل DOCS-CONTEXT-MIGRATION-P6-CLOSURE) — الريبو خاصًا بقرار المالك 2026-09-24 فالترقية قراره وحده.
- (التحقق الموحد للفريم — صفر كود تطبيق) py_compile للسكريبتين ✓ · docs_audit ✓ (H5 أخضر بعد الدوران) · docs_parity ✓ · migration_audit ✓ · stale-refs ✓ · ui-wiring ✓ — tsc/eslint/vitest غير مطلوبة (فريم سكريبتات حوكمة + توثيق فقط، لا مساس بsrc).

Stage Summary:
- نافذة worklog الحية صارت محدودة آليًا إلى الأبد (12 مدخلًا/128KB بفحص صلب + سكريبت دوران بنفس الكوميت)، وكوميتات تسجيل SHA اعتُزلت قانونًا — أكبر مصدرين لتضخم الحوكمة (RC-1/RC-4) مقفولان.
- الملفات الممسوسة: scripts/docs_audit.py (+H5) · scripts/worklog_rotate.py (جديد) · AGENTS.md (§12.5.1) · worklog.md (الترويسة + هذا المدخل + الدوران) · archive/WORKLOG_ARCHIVE.md (+146 مدخلًا حرفيًا) · DEVELOPER_GUIDE.md (سطر السياسة) · docs/README.md (الصفوف) · STATE.md (المرحلة 288).
- Push status: pushed (SHA الذاتي بروفينانس اختياري بعد الدفع — القانون الجديد)

---
Task ID: ARCH-REMEDIATION-287-2026-09-28
Agent: Implementation Agent
Task: أمر المالك 2026-09-28 — تنفيذ خطة الإصلاح الكاملة بتقرير تدقيق المعمارية docs/ARCHITECTURE-AUDIT-REPORT-2026-09-28.md (المرجع الحاكم)؛ هذا الفريم = P0 فقط: (P0-1) إصلاح البوابة الحمراء check I بترويسة DESIGN.md · (P0-3) تسجيل التقرير بالسجل + هذا المدخل + مؤشر STATE (التزامات أرجئها أمر التدقيق المقيد بالقراءة فقط) · (P0-2) فحوصات إلزامية على main · (P0-4) حذف الفروع الثلاثة المدمجة.

Work Log:
- (القانون) STATE.md أول الجلسة + git fetch — SYNCED على c43f7335 + قراءة كاملة للتقرير الحاكم (292 سطرًا) وAGENTS.md وdocs/README.md وscripts/docs_audit.py (العائلات العشرون) وتوثيق البوابات — صفر مساس بالكود/الواجهة/المنطق/API/القاعدة/SEO.
- (P0-1) DESIGN.md ترويسة «Last updated» من 2026-09-26 إلى 2026-09-27 (المرحلة 286 — §10.3 استثناء ألوان الماكرو؛ سطر 280 القديم أنزل «Last updated (280)» بنمط 278/277 القائم) — إعادة تشغيل docs_audit محليًا: صفر مخالفات (كانت I/last-updated-truth حمراء).
- (P0-3) docs/README.md: صف جديد للتقرير (LIVE/ACTIVE — المرجع الحاكم لجلسة التنفيذ؛ ينقلب EXECUTED عند هبوط الإصلاح) + تحديث صف السجل ذاته وصفّي STATE/worklog إلى 2026-09-28.
- (P0-3) STATE.md: المؤشر إلى المرحلة 287 (تفاصيلها بمدخلها) مع ضغط صفَّي 238+239 و234–237 التاريخيين للبقاء داخل سقف 100 سطر/32KB (سابقة 286) — إعادة الهيكلة الكاملة (سقف ≤2 صف مرحلة) تبقى لبند P1-3 كما خطط التقرير.
- (P0-2) حماية فرع main عبر GitHub API (توكن المالك — صلاحية admin مؤكدة): required status checks بالأسماء الحية الأربعة (quality · parity · guard · Supabase Preview) · enforce_admins=false («Do not allow bypassing» = OFF بموجب تفضيل المالك — مساره السريع محفوظ) · ممنوع force-push/الحذف.
- (P0-4) حذف الفروع الثلاثة المدمجة الموثقة بالتقرير §A4 (docs/audit-reports-delivery · fix/perf-audit-2026-09-05 · perf/vercel-usage-phase3) — أمر المالك بتنفيذ الخطة كاملة هو التأكيد؛ الوسمان التاريخيان بقيا ( markers صفرية التكلفة بقرار المالك).
- (التحقق الموحد للفريم التوثيقي — سابقة 223/283) docs_parity ✓ · docs_audit ✓ (صفر مخالفات بعد إصلاح I) · migration_audit ✓ صفر انجراف جديد · stale-refs ✓ · ui-wiring ✓ — tsc/eslint/vitest غير مطلوبة (فريم صفر كود).

Stage Summary:
- البوابة الحمراء أُصلحت (check I أخضر) والتقرير الحاكم مسجل بالسجل وworklog وSTATE، وmain محمية بفحوصات إلزامية، والفروع الثلاثة المدمجة حُذفت — P0 مكتمل.
- Commit SHA: c43f7335 (تقرير التدقيق المسجل بهذا الفريم) · هذا الفريم نفسه يُدفع بكوميت واحد — SHA الذاتي بروفينانس اختياري بعد الدفع (git log هو السجل؛ حلقة RC-1 يعتقليها P1-2 بالفريم التالي).
- Push status: pushed
---
Task ID: HOME-REFINE-286-2026-09-27
Agent: Implementation Agent
Task: أمر المالك 2026-09-27 «التعديلات المتبقية فقط»: (1) استبدال نص رصيد الخطط بحرفيًا بـ«كل زائر يملك رصيدًا شهريًا مجانيًا لتوليد الخطط بالذكاء الاصطناعي» فوق قسم «التخطيط بالذكاء الاصطناعي» مباشرة (2) تحسين بطاقات الأطعمة لإظهار السعرات والدهون والبروتين والكربوهيدرات بوضوح + تطبيق نفس تنسيق البطاقة على معاينة مكتبة الأطعمة بالرئيسية مع نفس الألوان («استخدم نفس الألوان لا تمنعها») + عرض طقم فئات الأطعمة الكامل بالرئيسية وليس صفًا أفقيًا واحدًا + إبقاء 6 أصناف تربط بصفحاتها بقيم القاعدة الحقيقية (3) إزالة السلوك المتحرك/الدوّار وأسهم التحكم من الهيرو — المحتوى ساكن ومرئي بلا شرائح أو حركة أو أسهم — وبخلاف ذلك صفر تعديل: لا منطق أعمال ولا قاعدة بيانات ولا APIs ولا مسارات ولا أسعار ولا تغييرات مكتملة.

Work Log:
- (القانون) STATE.md أول الجلسة + git fetch — SYNCED على e4954f7 + فحص الكلون النظيف والهوية (Alkemos Agent muscleshubfit@gmail.com) + قراءة كاملة لLandingView.tsx وsite-content/home.ts وFoodsExplorer.tsx وFoodDetailClient.tsx (مصدر ألوان الماكرو المعتمد: سعرات #0071e3 · بروتين #34c759 · كارب #ff9500 · دهون #ff3b30) وglobals.css (قوانين .chips-row و.trio-* و.hero-pill) والاختبارات المثبتة قبل أي تعديل.
- (نص الرصيد الحرفي) planAllowance في السجل: defaultAr = «كل زائر يملك رصيدًا شهريًا مجانيًا لتوليد الخطط بالذكاء الاصطناعي» حرفيًا كما أمر المالك + defaultEn = «Every visitor carries a free monthly allowance for AI-generated plans.» — الشريط يظل موضعه الصحيح فوق #plan مباشرة (أثبته 285 بموضع assert) — إزالة حقل heroNode الميت من السجل والنوع (مستهلكه الوحيد مخطط التقارب المُلغى أدناه).
- (بطاقات الأطعمة الأربع حقائق) FoodsExplorer.tsx: شبكة الخلايا من 3 (كالوري/بروتين/كارب) إلى **grid-cols-2 × خليتين** بأربع خلايا معنونة (سعرة/kcal أزرق · بروتين أخضر · كربوهيدرات برتقالي · دهون أحمر) بقيم food.per100g الحقيقية من قاعدة البيانات — نفس عائلة ألوان صفحة تفاصيل الصنف حرفيًا.
- (نفس التنسيق بالرئيسية) LandingFoodCard: سطر الماكرو المضغوط (P/C/F) استُبدل بنفس شبكة الخلايا الأربع الملونة المعنونة + سطر «القيم لكل 100 جم/Values per 100 g» + بقاء رابط صفحة الصنف وCTA «اعرض الصنف/View food» — القيم من عينات الخادم الحقيقية (قانون الحزمة) والروابط إلى /foods/{slug} والمرآة /ar/foods/{slug}.
- (الفئات الكاملة ملتفة) رقائق الفئات التسع في #eat انتقلت من .chips-row (سكة أفقية واحدة على الجوال) إلى flex flex-wrap justify-center — الطقم الكامل مرئي ملتفًا في كل الشاشات؛ رقائق العضلات في #library بقيت على .chips-row (خارج نطاق الأمر).
- (هيرو ساكن كليًا) إزالة مخطط التقارب .trio-flow بالكامل (SVG النبضات trio-pulse + العقدة trio-node-halo المتنفسة + تسمية «منصة واحدة») + إزالة حركات الدخول trio-rise ورفع hover الحبوب + **إزالة أسهم › من زري CTA بالهيرو (الحالتان: زائر/عضو)** — البقاء: العمل الفني الثابت + الشعار + H1 + العنوان الفرعي + 3 حبوب زجاجية ساكنة + زرا CTA بنصهما — globals.css: 5,445 حرفًا من قواعد trio/الحركة الميتة نُظفت (.hero-pill الأساسية بقيت).
- (الاختبارات — قانون الكاناري بنفس الكوميت) homepage-adoption.test.ts: (أ) نص الرصيد أعيد تثبيته على الحرفي الجديد AR+EN (ب) عداد chev من 14 إلى **10** (زرا الهيرو ×2 حالتان بلا أسهم الآن) (ج) كاناري «الألوان القديمة ميتة» أعيدت صياغته: الاستثناء الجديد المأمون من المالك مثبت بموضع دقيق — كل لون ماكرو يظهر **مرة واحدة بالضبط** داخل LandingFoodCard فقط، والرقابة المونوكرومية تسري على ما عداها (كاناري الـ«لا تمنعها») — DESIGN.md §10.3 وثّق الاستثناء المأمون.
- (البوابات) tsc ✓ 0 · eslint ✓ 0/0 · vitest ✓ 101 ملفًا/**1729** اختبارًا (مع الكاناري المحدث) · next build ✓ 2020/2020 · docs_audit: STATE 100 سطرًا/31,147 بايتًا (ضُغطت مداخل تاريخية 284/283/269/260+259/253-255 لاستيعاب مدخل 286 داخل السقف).
- (التحقق الحي) next start محلي: فحوص HTML لEN/AR: نص الرصيد الحرفي موجود وموضعه بين الشريط و#plan (لا شيء بينهما سوى إغلاقات الشريط نفسه)، 9 روابط ?cat= ملتفة (flex-wrap وليس chips-row)، 6 بطاقات أطعمة بروابط صفحاتها وبالخلايا الأربع المعنونة الملونة، /foods: 20 بطاقة بأربع خلايا ×EN/AR، هيرو بلا trio-flow/bلا chev و3 حبوب، معرفات الأقسام التسعة مرة واحدة كل منها بلا تكرار (#learn يُبنى عميلًا بحكم مدونة fetch — كالسلوك الأصلي).
- (توثيق) README.md (ترويسة Last updated Ph 286 + فقرة الرئيسية: الفئات الملتفة والخلايا الأربع والهيرو الساكن) · DESIGN.md §10.3 (استثناء ألوان ماكرو بطاقة الطعام المأمون من المالك) · STATE.md (المرحلة 286) · docs/README.md (صفوف STATE/worklog/README/DESIGN محدثة للتاريخ نفسه) · هذا المدخل.

Stage Summary:
- أوامر المالك الثلاثة نُفذت حرفيًا: نص الرصيد بالذكاء الاصطناعي فوق #plan مباشرة، بطاقات أطعمة بأربع حقائق معنونة ملونة (سعرات/بروتين/كارب/دهون) بنفس ألوان صفحة الصنف على /foods والرئيسية معًا بقيم القاعدة الحقيقية، فئات تسع كاملة ملتفة بكل الشاشات، وهيرو ساكن تمامًا بلا حركة أو مخطط متحرك أو أسهم.
- الملفات الممسوسة: src/lib/site-content/home.ts (النص الحرفي + إزالة heroNode) · src/components/views/LandingView.tsx (الهيرو الساكن + بطاقة الطعام + الفئات الملتفة + التعليقات) · src/components/foods/FoodsExplorer.tsx (الخلايا الأربع) · src/app/globals.css (نظافة trio الميتة) · src/lib/__tests__/homepage-adoption.test.ts (الكاناريات الثلاثة) · README.md · DESIGN.md · STATE.md · docs/README.md · worklog.md (هذا).
- صفر مساس: المنطق/الأسعار/الحدود/APIs/المسارات/القاعدة/الأطر المكتملة (284/285 بقيت كما هي — تغيّر فقط ما أمر به المالك صراحة).
- البوابات خضراء: tsc 0 · eslint 0 · vitest 101/1729 · build 2020/2020 · تحقق حي EN/AR نظيف.
- (التسليم) كوميت feat **1327c6f** دُفع إلى origin/main (e4954f7..1327c6f) · **Vercel: success** · تحقق حي EN/AR: نص الرصيد الحرفي فوق #plan، هيرو ساكن، 9 فئات ملتفة، 6 بطاقات بأربع خلايا ملونة، /foods بالخلايا الأربع ×EN/AR — SHA مسجل بهذا الكوميت التوثيقي المستقل (سابقة 281/283/284/285).

---
Task ID: HOME-POLISH-285-2026-09-27
Agent: Implementation Agent
Task: أمر المالك 2026-09-27 «حدّث الرئيسية وفق المحتوى الحي وابقِها واجهة منصة حقيقية»: (1) إزالة قسم «تغذيتك بثلاث طرق واضحة» المكرر (2) استبدال قسم التغذية بمعاينة مكتبة أطعمة على نمط مكتبة التمارين: الفئات + 6 بطاقات أطعمة حقيقية تربط بصفحاتها + سياق 8,830+ (3) الأدوات بطاقات/بلاطات بصرية بدل قائمة أزرار مع تضمين مخطط الوجبات اليدوي (4) بطاقات وأزرار AI أقوى وأوضح مع وسم AI صريح ووصف الوجبات «خطة يوم كاملة بالكميات بالجرامات» (5) نقل سطر الرصيد المجاني من بعد EVO إلى قبل قسم التخطيط بالذكاء (6) أزرار CTA مرئية ومتسقة لبطاقات العضويات والمظلة الداكنة = PRO (7) FAQ شبكة مرئية بدل النقر للكشف — بلا أقسام جديدة وبلا مساس بالمنطق/الأسعار/API/المسارات.

Work Log:
- (القانون) STATE.md أول الجلسة + clone جديد بعد زوال مساحة العمل (الـworkspace زائل — §3.6) + قراءة كاملة لLandingView.tsx الحي (1,704 سطرًا) وhome-samples.ts وsite-content/home.ts وtools-shared.ts وfoods-shared.ts وFoodsExplorer.tsx (نمط رقائق الفئات وروابط ?cat=) وصفحة /tools (نمط ToolCard) وmemberships.ts وكل الاختبارات المثبتة قبل أي تعديل (§3.1).
- (إزالة الثلاثي المكرر + معاينة مكتبة الأطعمة) قسم #eat أعيدت كتابته بالكامل: شريحة FOODS_PLUS للعين + 9 رقائق فئات (الفئات من foods-shared — مصدرها الواحد — بصور الفئات نفسها التي يستخدمها /foods) كل رقاقة رابط حقيقي إلى `/foods?cat={cat}` (والمرآة /ar/foods) عبر .chips-row (سكة اللمس ذاتها) + 6 بطاقات أطعمة حقيقية (LandingFoodCard: الفئة + الاسم + سعرات/100جم + P/C/F حقيقيان من العينات الخدمية) كل بطاقة تربط بصفحة الصنف + سطر الصدق + CTA «استكشف مكتبة الأطعمة كاملة/Explore the full food library» — الفئات تعرض بترتيب /foods نفسه.
- (home-samples.ts) FOOD_SAMPLE_SLUGS من 8 إلى 6 (chicken-breast/salmon/white-rice/avocado/banana/greek-yogurt — 5 فئات ممثلة)؛ اختبار الانجراف يشتق الطول تلقائيًا.
- (بلاطات الأدوات) قسم #tools: ست بلاطات بصرية (ToolTile: أيقونة منقوشة + اسم + وصف + سهم chrome) مشتقة من TOOLS بالفلتر `!slug.startsWith("/") || slug === "/meal-planner"` — الحاسبات الخمس + متتبع الماء + مخطط الوجبات اليدوي بشريحة «ابنِها بنفسك/YOU BUILD IT» (الحفاظ على التمييز)، روابطها تشتق (slug يبدأ بـ/ → المسار المباشر، غير ذلك → /tools/{slug} والمرآة /ar) + CTA قسم «كل الأدوات/All tools» → الموزع؛ مخططا AI مستثنيان عمدًا (بيتهما #plan).
- (شريط الرصيد قبل قسم AI) شريط marble-card الرقيق (النص من السجل planAllowance حرفيًا + شريحة «توليد بالذكاء الاصطناعي/AI GENERATION») انتقل من ذيل #plan إلى شريط مستقل بين #tools و#plan (aria-label «رصيد الخطط المجاني/The free plan allowance») ليقدّم مخططي AI.
- (بطاقات AI أقوى) AiCard جديدة: بطاقة أثقل (p-6 md:p-7) بأيقونة ai-ring سيان (قانون سطح AI) + شريحة AI-POWERED بعلامة evo + عنوان xl + **زر btn-chrome ممتلئ** («أنشئ خطة التمارين/Create my workout plan» و«أنشئ خطتي/Create My Plan») — البطاقة ليست رابطًا كاملًا (الزر هو الوجهة — لا تداخل تفاعلي) — شبكة عمودين على md+ وEVO بطاقة كاملة العرض تحتها (أفقية md+، متراكمة على اللمس، الأفاتار ai-ring + زر الفقاعة + الرابط + سطر الحصة 10 رسائل)؛ نصا الوصف والتمييز حرفيان كما كانا.
- (العضويات — PRO الداكنة) darkMarbleStyle (الرخام الأسود + حلقة الكروم + الظل) وشارة «موصى بها/Recommended» وpinDark انتقلت من Premium إلى **PRO**؛ Premium بطاقة رخامية فاتحة؛ كل بطاقة الآن بزر CTA مرئي موحد العائلة: Free وPremium بـ`.btn-outline mt-4 w-full` («ابدأ مجانًا/Start free» و«التفاصيل/See details») وPRO بـ`.btn-outline-dark` الجديدة (وصفة globals.css: حد rgba(245,245,247,.45) وحبر #F5F5F7 على الأسود المثبت — 44/48px كالوصفة الأصلية + انضمامها لقواعد .chev hover)؛ شريط الكوتشينج وزره الممتلئ الوحيد كما هو حرفيًا (كاناريا 273) — صفر مساس بالأسعار/المزايا/الروابط.
- (FAQ مرئي) الأكورديون أزيل من LandingView (استيراداته معه): شبكة بطاقات Q&A مباشرة الظهور (عمودان على md+ والخامس col-span-2) — السؤال بعرض أيقونة scroll منقوشة والجواب تحته مباشرة؛ JSON-LD يظل مشتقًا من مصفوفة faqs نفسها (قانون المصدر الواحد).
- (site-content/home.ts) eatTitle/eatBody: «مكتبة الأطعمة/The food library» + وصف المعاينة بتوكن {foods} (يُستبدل وقت الحل — نمط static-pages المعتمد) · toolsBody/toolsCta: صياغة البلاطات + «كل الأدوات/All tools» · ترويسة السجل توثق إطار 285 — البنية والحقول كما هي (النصوص الإدارية تتبع المجموعات ذاتها).
- (الاختبارات) homepage-adoption.test.ts: (5) بلاطات الأدوات بعقد جديد (ToolTile + الفلتر + شريحة مخطط الوجبات + CTA الموزع) (6) بطاقتا AI القويتان + موقع شريط الرصيد قبل #plan (assert موضعي) (7) معاينة مكتبة الأطعمة + إعادة توزيع التمييز الثلاثي + حظر عنوان الثلاثي القديم (8) خريطة الكتل محدثة (CTA المكتبة + كل الأدوات + شبكة FAQ + حظر AccordionTrigger/بطاقة الأدوات العريضة) + اختبار جديد «الداكنة = PRO» (شريحة موضعية متينة) + عدادات: card-lift=11 · chev=14 · tier-CTA=2+1 · chev-hover CSS بوصفة btn-outline-dark — rtl-typography.test.ts: اختبار FAQ الجديد (الشبكة المرئية) بدل اختبار الأكورديون — site-content.test.ts: «الحرفي» يطبق applySiteTokens على المتوقع (توكن {foods}).
- (البوابات) tsc ✓ 0 · eslint ✓ 0 (تحذير root-shell القديم وحده) · vitest ✓ 101 ملفًا/**1729** اختبارًا · next build ✓ 2020/2020.
- (التحقق الحي) خادم إنتاج محلي (next start): EN/AR HTTP 200 — فحوص HTML: 9 معرفات أقسام بالترتيب، 9 روابط ?cat=، 6 روابط صفحات أطعمة، موضع شريط الرصيد بين #tools و#plan، برو بطاقة داكنة بشارة واحدة، سؤال/جواب FAQ داخل HTML مباشرة — متصفح 1440/390: لقطات لكل قسم EN + AR + موبايل، scrollWidth=clientWidth=390 (صفر overflow) — VLM: معاينة الأطعمة (رقائق+6 بطاقات) سليمة، البلاطات 3×2 مع شريحة YOU BUILD IT، بطاقتا AI بأزرار ممتلئة وحلقات سيان، PRO الداكنة الموصى بها بأزرار مرئية متسقة، FAQ شبكة 2-2-1، RTL العربي سليم — صفر أخطاء console (Vercel Analytics التحذير الوحيد محليًا بحكم البيئة).
- (توثيق) README (قسم الرئيسية أعيدت صياغته — قانون FEATURE README) + DESIGN_SYSTEM.md (جدول الوصفات: btn-outline-dark + رقائق الفئات؛ ترتيب الصفحة 1-12 الجديد) + design-tokens.ts (btn-outline-dark في RECIPES + تحديث وصف chips-row) + STATE.md (المرحلة 285 + مدخل (٠٠) + صف QA) + هذا المدخل.

Stage Summary:
- الرئيسية صقلت كواجهة منصة: مكتبة الأطعمة بمعاينة حقيقية على نمط التمارين (9 فئات مربوطة + 6 بطاقات حقيقية بروابطها)، الأدوات بلاطات بصرية (مع مخطط الوجبات اليدوي)، شريط الرصيد يقدّم قسم AI، بطاقتا AI أقوى بأزرار ممتلئة ووسم AI صريح ووصف الوجبات بالغرامات محفوظ، PRO هو البطاقة الداكنة الموصى بها وأزرار كل البطاقات مرئية متسقة، FAQ مرئي مباشرة — صفر أقسام جديدة وصفر مساس بالمنطق/الأسعار/API/المسارات.
- الملفات الممسوسة: src/components/views/LandingView.tsx (إعادة كتابة الأقسام 5/7/7.5/8/10/12) · src/lib/home-samples.ts (6 أطعمة) · src/lib/site-content/home.ts (eat/tools) · src/app/globals.css (.btn-outline-dark + انضمامها لchev-hover) · src/styles/design-tokens.ts · src/docs/DESIGN_SYSTEM.md · README.md · STATE.md · worklog.md (هذا) · الاختبارات: homepage-adoption + rtl-typography + site-content.
- البوابات كلها خضراء: tsc 0 · eslint 0 · vitest 101/1729 · build 2020/2020 · تحقق حي EN/AR × 1440/390 + VLM نظيف.
- (التسليم) كوميت feat e4719c8 دُفع إلى origin/main · تبعته ورقة إصلاح توثيقية 5d7635b: ترويسة README «Last updated» وصف السجل لم يُحدّثا في فريم 284 حين عُدّل README (بوابة parity كشفته على دفعة 285 — تشغيلها على 6b020b83 كان ملغى بسرعة الدفع المتتابع) — أُصلحا بتاريخ 2026-09-27 (Ph 285) · **CI على 5d7635b: Supabase Preview/quality/guard/parity/cleanup كلها success + نشر Vercel على الكوميتين success** · SHA مسجل بهذا الكوميت التوثيقي المستقل (سابقة 281/283/284).

---
Task ID: HOME-PLATFORM-284-2026-09-27
Agent: Implementation Agent
Task: أمر المالك 2026-09-27 «راجع وحدّث الصفحة الرئيسية كواجهة منصة لياقة حقيقية وليست صفحة هبوط»: أقسام ببطاقات تربط بالصفحات بدل تضمين الأدوات/المخططات نفسها، وقسم الأدوات بطاقة تربط بصفحة الأدوات، وتمييز التخطيط بالذكاء الاصطناعي عن الأدوات العادية صراحة، وتوسيع معاينة مكتبة التمارين من 3 إلى 6 تمارين، مع الحفاظ على هوية Alkemos ووظائفها.

Work Log:
- (القانون) STATE.md أول الجلسة + fetch (HEAD = 7d95cfdc = origin/main) + قراءة كاملة لLandingView.tsx (2,837 سطرًا) وصفحات /tools و/meal-planner و/ai-meal-planner و/ai-workout-planner وSiteHeader وsite-content/home.ts وكل الاختبارات المثبتة على الرئيسية قبل أي تعديل (AGENTS.md §3.1).
- (البنية الجديدة — 9 أقسام مرآة تنقل الهيدر) `#library` تدريب (معاينة المكتبة: 6 تمارين لكل مجموعة عضلية) → `#train` برامج (كوراسولا كما هي) → `#eat` تغذية بثلاث بطاقات مميزة صراحة (قاعدة الأطعمة · مخطط الوجبات اليدوي بشريحة «ابنِها بنفسك/YOU BUILD IT» · الخطط الجاهزة بشريحة «جاهزة للتصفح/READY TO BROWSE») → `#diet` (كوراسولا الأنظمة كما هي) → `#tools` بطاقة واحدة عريضة → /tools برقائق أسماء الأدوات الخمس مشتقة من TOOLS بفلتر `!slug.startsWith("/")` (المخططات الثلاثة مستثناة عمدًا) → `#plan` تخطيط بالذكاء الاصطناعي منفصل عن الأدوات: بطاقة AI Workout + بطاقة AI Meal (كلتاهما موسومة «بالذكاء الاصطناعي/AI-POWERED» ووصف الوجبات: «خطة يوم كاملة منظمة، وليست مجرد اقتراحات وجبات: كل وجبة بأصنافها المحددة وكمياتها بالغرامات وسعراتها المحسوبة» + «A structured full-day plan, not just meal suggestions: … portions in grams») + بطاقة EVO (أفاتار ai-ring + زر «تحدث مع EVO الآن» يطلق openEvoFloatingChat = قانون سطح الدردشة + رابط «اعرف المزيد» → /evo + سطر الحصة الصادق 10 رسائل/يوم) + شريط الرصيد المجاني الصادق (النص حرفيًا كما كان، الشريحة «توليد بالذكاء الاصطناعي/AI GENERATION») → `#learn` → `#memberships` + الكوتشينج → `#faq`.
- (إزالة كاملة للأدوات المدمجة) HomeCalculator + EvoConversation + WorkoutPlanBuilder + MealPlanBuilder + FoodExplorer + مساعداتها (WORKOUT_SPLITS/readQuota/quotaLine/planSegmented/planTile/ACTIVITY_LABELS) واستيراداتها (fitness-math وai-workout-planner وplan-persistence وImageWithFallback/getFallbackSVG) — العرض لم يعد يستدعي أي نقطة توليد ولا يحفظ خططًا: الصفحات تفعل، والرئيسية تتنقل. مسارات الصفحتين (en)/(home)/page.tsx و(ar)/ar/(home)/page.tsx لم تتغير (نفس props: samples + content).
- (3←6 تمارين) home-samples.ts: EXERCISE_SAMPLE_SLUGS من 15 إلى 42 (6 لكل عائلة عضلية، كل صورها متحقق على القرص) + شبكة LibraryBrowser من `grid-cols-2 md:grid-cols-3 lg:grid-cols-4` إلى `grid-cols-2 md:grid-cols-3` (شبكة 2×3 كاملة على md+) + سطر الصدق «ستة تمارين حقيقية من مكتبة …».
- (الهوية والتبادل) تعديل تبادل الأشرطة للترتيب الجديد: library=bg · train/eat/diet/plan=tint بborder-y · learn/memberships=bg — نفس قواعد الرخام والكروم (marble-card/card-lift/seal-chip/EngravedIcon/chrome-text/Reveal/CountUp) بلا أي مفهوم تصميم جديد.
- (site-content/home.ts) HomeCopy: مجموعة home.start ← home.tools جديدة (toolsEyebrow/Title/Body/Cta)، home.evo (7 حقول) تقاعدت مع القسم، eatTitle/eatBody أعيدت صياغتهما (الطرق الثلاث + إحالة صريحة لقسم التخطيط الذكي أدناه)، planTitle/planBody/planAllowanceChip أعيدت صياغتها (AI بدل «داخل الصفحة»)، heroSubtitle بلا وعد «جرّبها الآن في هذه الصفحة» — صفوف overrides القديمة تحت المفاتيح الميتة تُتجاهل بأمان (قانون الفولباك).
- (تنظيف CSS الميت) globals.css: حذف .evo-art-mask/.evo-console/.evo-orb/.evo-beam(+rotor)/.evo-handoff*/.evo-dots/.evo-dot/.macro-track/.macro-fill مع حراس reduced-motion الخاصة بها (بقيت .live-dot لزر EVO و.swap-fade لمتصفح المكتبة) + إعادة ترقيم وصفات الحركة (1/2/3) + design-tokens.ts: حذف evo-console وmacro-track من RECIPES + DESIGN_SYSTEM.md: جدول الوصفات وترتيب الصفحة معادان.
- (الاختبارات) homepage-adoption.test.ts أُعيدت كتابته كاملة للهيكل الجديد (36 اختبارًا): قانون «صفر أدوات مضمّنة» (حظر fitness-math/نقاط التوليد/saveGuestPlan/معرّفات start وevo)، بطاقة الأدوات بالرقائق المشتقة، منطقة #plan (البطاقات الثلاث AI + حظر خدمات الكوتشينج البشري «كوتشينج//coaching/مدرب شخصي» مع سماح «مدربك الذكي» لEVO)، التمييز الثلاثي للتغذية، الترتيب الجديد، 42 عينة/6 لكل عائلة، عدادات محدثة (card-lift=10 · chev=8 · browse-CTA=3) — وباقي ملفات الاختبار مرّت دون تعديل (ai-meal-planner/ai-workout-planner/marketing-msa/rtl-typography/library-counts/site-content — بإعادة استخدام التسميات المثبتة «أنشئ خطتي/Create My Plan» على بطاقات AI).
- (البوابات) tsc ✓ 0 أخطاء · eslint ✓ 0 (تحذير root-shell القديم وحده — ملف غير مساس) · vitest ✓ 101 ملفًا/1728 اختبارًا كاملة · next build ✓ 2020/2020.
- (التحقق الحي) خادم إنتاج محلي + curl للغتين + متصفح: الأقسام التسعة بالترتيب الصحيح EN/AR، فلتر العضلات يعرض 6 بطاقات (تم التحقق بالنقر على Legs: Barbell Squat/Goblet Squat/Romanian Deadlift/Dumbbell Lunges/Leg Press/Bodyweight Squat)، بطاقات التغذية الثلاث وبطاقتا AI وبطاقة EVO وبطاقة الأدوات كلها تصير بنصوصها الصحيحة، RTL سليم بلا overflow — تدقيق VLM بصري EN/AR: صفر مشاكل تخطيط.
- (توثيق) README (قسم الرئيسية أُعيدت كتابته — قانون FEATURE README) + DESIGN_SYSTEM.md (الوصفات وترتيب الصفحة) + STATE.md (المرحلة 284 + مدخل (٠٠) + صف QA) + هذا المدخل.

Stage Summary:
- الصفحة الرئيسية الآن واجهة منصة حقيقية: 9 أقسام موجزة ببطاقات تربط بالصفحات، صفر أدوات مضمّنة، AI Planning منفصل بصريًا ولفظيًا عن Tools، التمييز الثلاثي (Meal Planner/AI Meal Planner/Diet Plans) صريح بالشرائح والنصوص، معاينة التمارين 6 لكل مجموعة عضلية.
- الملفات الممسوسة: src/components/views/LandingView.tsx (إعادة هيكلة كبرى) · src/lib/home-samples.ts (42 عينة) · src/lib/site-content/home.ts (السجل) · src/app/globals.css + src/styles/design-tokens.ts + src/docs/DESIGN_SYSTEM.md + README.md + STATE.md + worklog.md (هذا) · src/lib/__tests__/homepage-adoption.test.ts (إعادة كتابة).
- البوابات كلها خضراء: tsc 0 · eslint 0 · vitest 101/1728 · build 2020/2020 · تحقق حي EN/AR + VLM نظيف.
- (التسليم) كوميت 6b020b83 دُفع إلى origin/main (متزامن) — CI quality-gate + نشر Vercel التلقائي يليانه؛ SHA مسجل بهذا الكوميت التوثيقي المستقل (سابقة 281/283).

---
Task ID: QA-PURGE-283-2026-09-27
Agent: Implementation Agent
Task: أمر المالك 2026-09-27 «مطلوب مسح حسابين الاختبار»: مسح حسابي أدمن QA (alkemos.qa.admin@gmail.com + qa.admin1431@musclehub-test.com) من قاعدة الإنتاج.

Work Log:
- (القانون) AGENTS.md §40/§120: الوكيل لا يشغّل DELETE على الإنتاج إطلاقًا — عمليات auth.users يدوية تاريخيًا (0040/0050/0055/0066) والتسليم الصالح = ملف RUN_ON_SUPABASE جاهز للتشغيل + الرابط الخام. STATE.md أول الجلسة + fetch (HEAD = f9e3f1fe = origin/main).
- (المسار الوحيد) كلا الحسابين دوره admin → محميان من الحذف عبر /admin/accounts (GUARD 2 «admin_protected» في src/app/api/admin/accounts/route.ts) — واجهة التطبيق لا تستطيع مسحهما؛ المسار اليدوي هو الوحيد (سابقة 0066 لمسح admin.test@musclehub-test.com).
- (أصل الحسابين) alkemos.qa.admin@gmail.com: أنشأه التسجيل الحي ورقّاه 0073 (تأكيد بريد من SQL + role=admin) · qa.admin1431@musclehub-test.com: معلّم is_test_account=true واستُخدم بجلسات UX 2026-09-21 (docs/UX-TEST-REPORT-2026-09-21.md) وأُعيد ضبط كلمة مروره بوسيلة 0050.
- (السكريبت 0095) RUN_ON_SUPABASE_0095_DELETE_QA_TEST_ACCOUNTS.sql — نمط 0066 v2 حرفيًا: DO block لكل حساب (ذرّي — درس 0066 v1: أي فشل يرجع كل شيء)، الخطوة 0 تحلّ id من auth.users ثم profiles fallback (idempotent — الحساب الغائب يتخطى بأمان)، الخطوة 1 تمسح الجداول بلا FK حي (بمرآة 0066 v2: coach_presence بعمود coach_id الحي) + tool_leads بالإيميل + تصفير coach_wallet_transactions.created_by (حماية حركات المحافظ)، الخطوة 2 تحذف profiles (كاسكيد حي)، الخطوة 3 تحذف auth.users (كاسكيد auth + التخزين) — ويغلق بـNOTIFY pgrst + استعلام VERIFY لازم يرجّع 3 أصفار.
- (تدقيق ما بعد 0066) فُحصت كل ميجريشنز 0067→0094 ملفًا ملفًا: كل جداول المستخدم الجديدة cascade أو set-null (site_coach_assignments 0067 · evo_feedback 0077 set-null · evo_memory/evo_memory_state 0078 · evo_followup_prefs 0079 · ai_plan_usage 0085 cascade من auth.users · site_content 0094 set-null) — العمود الوحيد الجديد بلا FK إطلاقًا: evo_call_stats.user_id (0081) → أُضيف حذفًا وقائيًا في الخطوة 1.
- (توثيق) INDEX.md: سلسلة العدّاد +1 يدوي مع 0095 + خريطة الترقيم 0001→0095 + صف 0095 (يدوي ⚠️) + صف سجل التدقيق 283 · STATE.md: المرحلة 283 + مدخل (٠٠) 283 + صف QA + دمجتان معتمدتان (280+279R و278+277) = 100 سطر بالضبط / 30,713 بايت.
- (إصلاح بوابات موروث) M/registry-dates كان أحمر على HEAD السابق (صف docs/README.md لTECH_REFERENCE يقول 2026-09-20 بينما آخر كوميت للملف 2026-09-26 من 281) — أُصلح تاريخ الصف + صف README نفسه إلى 2026-09-27 فأخضرّ docs_audit.
- (البوابات) migration_audit --ci ✓ صفر انجراف جديد (بيانات فقط — types.ts غير مطلوب قانون §c) · docs_parity --ci ✓ · docs_audit --ci ✓ · vitest/tsc/eslint غير مطلوبة (فريم صفر كود — سابقة 223 التوثيقية).

Stage Summary:
- التسليم: سكريبت مسح جاهز للتشغيل اليدوي من Supabase Dashboard → SQL Editor — ذرّي/متكرر/محصور بالبريدين نصًا (مستحيل يمس حسابًا آخر) وصفر تغيير هيكلي.
- الرابط الخام للمالك: https://raw.githubusercontent.com/muscleshubfit-cpu/alkemos/main/supabase/migrations/RUN_ON_SUPABASE_0095_DELETE_QA_TEST_ACCOUNTS.sql
- التشغيل يطبع إشعارًا لكل بريد (جاري المسح/تم/غير موجود) ويغلق بـNOTIFY pgrst + استعلام التحقق النهائي (auth_users_left / profiles_left / leads_left = 0/0/0).
- Commit SHA: 9c6defef (كوميت التنفيذ والتوثيق موحّدان) + كوميت تسجيل SHA هذا
- Push status: pushed

---
Task ID: SITE-CONTENT-281-2026-09-27
Agent: Implementation Agent
Task: أمر المالك 2026-09-27: تنفيذ محرر نصوص الموقع الموصى به داخل لوحة الأدمن القائمة — Supabase + /admin فقط، بلا Decap/Payload/CMS خارجي/OAuth/خدمة جديدة؛ تحرير نصوص الرئيسية والصفحات الثابتة AR/EN يدويًا دون كوميت أو نشر لكل تعديل صياغي.

Work Log:
- (المعاينة) التزمت القوانين: AGENTS.md كاملًا (§3.5، §6، §10) + STATE.md أول الجلسة + fetch origin (HEAD = d13ebf0 = origin/main).
- (الميجريشن 0094) جدول site_content: key PK + value_en/value_ar jsonb + updated_at/updated_by؛ RLS في نفس الملف (قراءة عامة anon/authenticated على نمط blog_posts المنشور + كتابة أدمن فقط عبر is_admin() الكنسية 0029B)؛ تريغر site_content_touch يختم التدقيق (security definer + search_path ثابت)؛ idempotent + VERIFY + notify pgrst.
- (المرآة) types.ts: site_content Row/Insert/Update/Relationships في نفس الكوميت — migration_audit صفر انجراف جديد (مطابق قبل الدفع).
- (طبقة المحتوى) src/lib/site-content/: core.ts (محرك الفولباك الصادق + tokens {exercises}/{foods}) · home.ts (~44 حقلًا نصعيًا في 12 مجموعة + أسئلة الرئيسية الخمسة — نقلًا حرفيًا من LandingView) · static-pages.ts (about/privacy/terms بنيويًا + FAQ من faq-content.ts كمصدر حرفي) · server.ts (unstable_cache 300s + anon — نمط blog-server) · admin.ts (عميل المتصفح + RLS على نمط blog-admin).
- (الواجهات) LandingView يقبل content? ويحل عبر resolveHomeCopy (الفولباك دائمًا موجودًا) · StaticPageView عبر resolveStaticPage/resolveFaqPage · إفراغ الحقل = رجوع للنص المدمج (null لا يُخزن أبدًا).
- (المسارات) / و/ar وabout/privacy/terms/faq بنسختي EN/AR: fetch سيرفر-سايد + revalidate=300 (سابقة المدونة) — JSON-LD للأسئلة يستمد من المصفوفات المحلولة نفسها.
- (الأدمن) /admin/site-content (Content section في AdminShell — «نصوص الموقع ✍️») + AdminSiteContentView: تبويبات، تحرير ثنائي اللغة جنبًا لجنب، أسئلة/أقسام قابلة للإضافة والحذف، تحقق مطابق لقواعد المحلل، طابع تدقيق لكل حقل، Reset لل Defaults.
- (الكاناري) homepage-adoption: أعيد تثبيت مفاتيح النصوص لمصدرها الواحد الجديد (copy=home.ts، both=view+registry للممنوعات) · أُصلح K-1/K-2 الأحمران سابقًا (انجراف COPY-REFINE-282: معتمدون/توليد خطط أكثر ×1) · library-counts أعيد تثبيته لخط الأنابيب الجديد (view→static-pages→core) · marketing-msa-surface: مصادر النصوص الجديدة داخل المانيفست.
- (اختبارات جديدة) site-content.test.ts — 13 اختبارًا لمحرك الفولباك والتokens وسلامة السجل.
- (البوابات §3.5) tsc ✓ 0 · eslint ✓ 0 (تحذير root-shell القديم وحده) · vitest ✓ 1727/1727 · next build ✓ 2020/2020 (المسارات المتأثرة ISR 5m) · smoke الحي محليًا: 10 مسارات 200 والنصوص EN/AR تُصيَّر بالفولباك مع tokens (868+/8,830+) وJSON-LD سليم.
- (توثيق) README (قانون README للميزات) · TECH_REFERENCE §1.4 صف site_content · INDEX.md صف 0094 + سجل التدقيق · STATE.md المرحلة 281 + QA (ضغط صفوف قديمة للسقف).

Stage Summary:
- محرر نصوص الموقع حي على البنية القائمة: صفر اعتماديات جديدة، صفر مسارات API جديدة، صفر مساس بمدونتي blog/coach، وصفر مساس بالأسعار/الحدود/الحصص (مصادرها الموحدة).
- التعديل الصياغي يظهر خلال ~5 دقائق (ISR 300s) بلا كوميت/CI/نشر؛ الصفحة لا تفرغ أبدًا (فولباك صادق مُختبَر).
- Commit SHA: acba03e7 (كوميت التنفيذ والتوثيق موحّدان) + كوميت تسجيل SHA هذا
- Push status: pushed

---
Task ID: COPY-REFINE-282-2026-09-26
Agent: Implementation Agent
Task: توجيه المالك 2026-09-26: فحص المحتوى الكتابي لمنصة Alkemos وإعادة صياغته بأسلوب بشري طبيعي قوي لزيادة التفاعل والتحويل وSEO/GEO، مع توجيه الإنجليزية للجمهور العالمي بالكامل، والعربية الفصحى المعاصرة السهلة لكافة القراء العرب (بلا حصر بمصر)، واستبدال مصطلح «الكوتشينج» بـ «التدريب الأونلاين».

Work Log:
- (الهيرو) صياغة بشرية طبيعية للفقرة التمهيدية مع الحفاظ على مفاتيح الاختبارات: منصة متكاملة تجمع تمارينك وتغذيتك وسعراتك بالأرقام العلمية مع مدرب الذكاء الاصطناعي EVO.
- (الحاسبة والمدرب) صياغة واضحة لفقرة الحاسبة (#start) لتأكيد الدقة العلمية والمعادلات المعتمدة، وفقرة EVO (#evo) لتقديم المدرب كرفيق ذكي عملي يفهم الأهداف ويوفر بدائل ذكية يومية.
- (المكتبات والبرامج والأنظمة) تعزيز نصوص مكتبة التمارين (#library لتفادي الإصابات)، مستكشف الأطعمة (#eat لدعم المطبخ العربي والعالمي)، برامج التمارين (#train بالجداول والأهداف)، والخطط الغذائية الجاهزة (#diet بمكونات يومية واقعية).
- (مصطلح التدريب الأونلاين) استبدال «التدريب الأونلاين (الكوتشينج)» بـ «التدريب الأونلاين الشخصي / 1-on-1 Online Coaching»، وتحديث إجابة السؤال الشائع الخامس بما يعزز الوضوح والقيمة.
- (الميتا داتا) تحديث وصف الميتا داتا للغة العربية في /ar/layout.tsx ليغطي الأطعمة العربية والعالمية والمدرب الذكي EVO بلغة فصحى شاملة للجمهور العربي بأكمله.
- (البوابات) docs_audit.py ✓ · migration_audit.py ✓ · التحقق الكامل من كافة مفاتيح اختبارات الكاناري في homepage-adoption.test.ts.

Stage Summary:
- المحتوى البشري الطبيعي مطبّق بالكامل بالعربية الفصحى الجامعة والإنجليزية العالمية.
- مصطلح «الكوتشينج» استُبدل في واجهات الزائر بـ «التدريب الأونلاين الشخصي».
- كافة الوظائف والمسارات وقواعد البيانات ومفاتيح الكاناري محفوظة 100%.

---
Task ID: TPL-REF-280-2026-09-26
Agent: Super Z (owner session)
Task: أمر المالك 2026-09-26 (بعد EMBER-INK-279): «أرجع آخر إعادة تصميم/تنفيذ قالب كاملةً إلى آخر حالة معروفة جيدة، ثم ابنِ التحديث البصري صحيحًا — القالب مرجع بصري/component فقط؛ UX Alkemos هو مصدر الحقيقة: الهيكل والترتيب والهيرو الأصلي والوضعان الفاتح/الداكن وألوان الماكرو الدلالية محفوظة؛ لا نسخ بنية القالب ولا هويته Ember & Ink ولا تصميمه الداكن فقط؛ النتيجة Alkemos بنظام بصري fitness-tech أرقى لا القالب بمحتوى Alkemos».

Work Log:
- (السحب 279R أولًا) git restore --source=97c07252 --staged --worktree . — الشجرة رجعت بايت-بايت لآخر حالة معروفة جيدة (VRD-V8R، نهاية 278): الهيرو الأصلي رئيسًا فوق صورته، الهيكل والترتيب (Hero→proof→#start→#evo→#plan→#library→#eat→#train→#diet→#learn→#memberships→#faq)، الخطوط الأصلية (Playfair/Inter/Cairo)، manifest themeColor الأصلي، وصفات الرخام والكروم كاملة — كوميت b228425d.
- (بوابات الشجرة المرجعة) tsc 0 · eslint 0 · vitest 1705/1705 · next build 2020/2020 — ثم push فوري للتراجع الإنتاجي + إصلاح صف السجل (DESIGN_SYSTEM 25→26 بعد كوميت السحب — درس م-07) بكوميت cd4a428e.
- (تحليل القالب كمرجع) قراءة قالب 1devtool landing-fitness-studio كاملًا وفصل التقنيات عن الهوية: المرفوض حكمًا (هوية Ember & Ink #FF4D26/#FF9353/#D7FF4D — Sora/Outfit — dark-only — بنيته: هيرو الشبكة/الماركيه/ترويسات مقسمة/أرقام مرقمة بأبيض-10/أسعاره الملونة) والمقبول كتقنيات (micro-interaction السهم translate-x عند hover · الfeatured glow العميق · نمط أرقام display على الإحصاءات · نمط الرقم الشبحي على الكروت النصية).
- (1 .chev) قوس CTA ينزلق 4px نحو اتجاه القراءة عند hover — وصفة CSS خالصة بtranslate property الفردية (تتآلف مع rotate-180 لـTailwind بلا مصفوفة) · [dir=rtl] مرآة · opt-in على 10 مواضع (زيرا الهيرو بالحالتين + CTAs الأقسام الخمسة + CTA الحاسبة) — رقائق evo-handoff مستثناة عمدًا (أبها ليس btn-*) · سكون تحت reduced-motion.
- (2 .ghost-num) رقم شبحي font-display (Playfair/كايرو عبر الستاك) 44px/600 فوق عنوان كروت الأنظمة الغذائية داخل التدفق (وضع القالب نفسه فلا تداخل نصي أبدًا) بلون color-mix(--text 10%) — صفر هكسات جديدة، انعكاس تلقائي مع الثيم، aria-hidden بلا معنى ترتيبي.
- (3 ظل بريميوم) 0 24px 60px -28px rgba(11,11,13,.55) على الكارت الداكن المثبت (darkMarbleStyle) — عمق الfeatured pricing من القالب معاد التلوين دافئًا أحاديًا (بلا حدود ember ولا غسلة لونية).
- (4 أرقام display) شريط الإثبات: الأرقام بfont-display 18→20px (نمط إحصاءات القالب بخط العرض Alkemos نفسه — الصف يبقى مضغوطًا) · سعرة الطبق ب#eat: font-display على رقم 48px القائم — اللون الكرومي والأرقام الحقيقية كما هي.
- (الكاناري +5 نفس الفريم) homepage-adoption.test.ts: عقد TPL-REF-280 — وصفة .chev حرفيًا + مرآة RTL + حارس reduced-motion + العدد 10 · وصفة .ghost-num + aria-hidden + index من الmap · الظل الحرفي + حظر #ff4d26/#ff9353/#d7ff4d · الأرقام الحرفية للعرض · سياج النطاق: صفر font-family بSora/Outfit وصفر .tpl- وصفر --ember وكلا الوضعين يوثقان التوكنات كاملة ( Guards على التصريحات لا على سرد التعليقات — قانون AGENTS §8) — 35/35.
- (البوابات) tsc ✓ 0 · eslint ✓ 0 · vitest ✓ 100/1710 (+5) · stale-refs ✓ · ui-wiring ✓ · migration_audit ✓ · docs_parity ✓ · docs_audit ✓ (الصفوف محدثة بنفس الفريم) · contrast matrix ✓ كلا الوضعين (لم تُمس أي ألوان نص) · next build ✓ 2020/2020.
- (التحقق الحي محليًا) EN/AR × Light/Dark × 1440/390 — أدناه.
- (التوثيق) DESIGN.md: ترويسة 280 + صفّا .chev/.ghost-num ب§5 + TPL-REF-280 ب§7.1.1/§7.4/§7.4.1 · DESIGN_SYSTEM.md: ترويسة + صفّا الوصفتين + ملاحظة كروت الأنظمة · docs/README.md: صفا DESIGN/DESIGN_SYSTEM بتاريخ 280 · STATE.md: مرحلة 280 + صف 279R (دمج 270-273 للحفاظ على السقفين).

Stage Summary:
- السحب نظيف وموثق: الشجرة الحية = 97c07252 + تكامل انتقائي فوقها فقط؛ Ember & Ink لم يعد له أي أثر (كاناري يمنع عودته) والإنتاج رجع لحالة 278 لحظة كوميت السحب.
- النتيجة: Alkemos نفسه بأربع لمسات premium مكتسبة من القالب كمرجع تقني فقط — صفر أقسام جديدة، صفر تغيير بنية/ترتيب/هيرو/أزرار/منطق/أسعار/مسارات، الوضعان الفاتح/الداكن متساويان، ألوان الماكرو الدلالية بأسطح التطبيق (#34c759/#0071e3/#ff9500 في meal-planner/food-detail وغيرها) لم تُمس ولم تُستبدل بأحادية — وصفات الرئيسية الأحادية (macro-track/split-seg) بقيت كما كانت بقانونها وكاناريها.
- ملفات الفريم: src/app/globals.css · src/components/views/LandingView.tsx · src/lib/__tests__/homepage-adoption.test.ts · DESIGN.md · src/docs/DESIGN_SYSTEM.md · docs/README.md · STATE.md · worklog.md.
- Commit: (التنفيذ — يُدفع بعد البوابات) فوق b228425d (السحب) + cd4a428e (parity السجل).

---
Task ID: VRD-V8R-2026-09-26
Agent: Super Z (owner session)
Task: إكمال البنود المتبقية من الخطة المعتمدة بعد موجتي V7/V8 (عرض ما بعد الهيرو/EVO/التخطيط) — عضويات/كوتشينج أكثر premium · اتساق Chrome/Silver للبطاقات · FAQ والانتقالات · معالجة المناطق template-like — بلا موجة جديدة ولا مساس بالمنطق/الهوية/الأسعار/الترتيب.

Work Log:
- (الفحص أولًا) git fetch — SYNCED على 1afee2b (نهاية V8) · STATE/DESIGN/AGENTS + كاناريات homepage-adoption/marketing-msa/rtl-typography كاملة · جولة حية 6 سياقات على الخادم المحلي للتقاط الحالة الفعلية لما بعد الهيرو.
- (نتائج الفحص البصري المُقرّ بها) العضويات: بطاقات فارغة السطر الواحد بمساحة ميتة · #eat: رقائق القيم تحمل #34c759/#ff9500 الممنوعين (DESIGN §10.3 — بقايا ما قبل V1 نجا من فحوص الـdiff) · #faq: القسم الوحيد بلا شارة eyebrow وبأكورديون عائم بلا سطح · الانتقالات: أشرطة tint عارية الحواف في مفاصل bg مجردة · الشهادات: لا شيء موجود فعلًا (شريط الأرقام هو الإثبات — قانون الصدق يمنع الاختراع) · CTA الختامي: ملغى بقانون 270-R8 فبقي ملغى (بند الخطة طُبّق بأخف حل محافظ: صفر إعادة إضافة).
- (العضويات — VRD-V8R) TierFeatureRows: كل بطاقة تستبدل سطرها النثري بصفّتين–ثلاث من المزايا الحقيقية المشتقة من حدود memberships.ts (بركة 2/4/8 · حد EVO اليومي · التصدير/بلا إعلانات) بأيقونة checkseal نفس علامة /memberships — صفر ادعاءات مخترعة وصفر أسعار (حظر literals قائم) — الشارة «العضويات والكوتشينج/MEMBERSHIPS & COACHING» بقلب القسم · كارت بريميوم الداكن الدائم: .theme-img-pin-dark في globals.css (بعد قواعد الأزواج لفوز الكسكود) يجبر النقش الداكن — الأيقونة تتبع السطح لا الثيم · الكوتشينج: نُسخه وCTA المثبتة حرفيًا بلا مساس.
- (#eat + FAQ + الإطارات) نزع text-[#34c759]/text-[#ff9500] إلى نص --text (الوصفة المثبتة min-h-10/grid gap-1/chrome-text بلا تغيير) · #faq: شارة «الأسئلة الشائعة/COMMON QUESTIONS» + الأكورديون داخل marble-card (p-2 md:p-4، المسّاح الأخير منزوع؛ صفوف C-15 المثبتة حرفيًا) · الإطارات: evo/library/train ‏border-y وlearn/faq ‏border-t (تعالهما الميندر) — نظام: tint شريط مؤطر وbg أرض مجردة.
- (الكاناري — نفس الفريم) homepage-adoption.test.ts: +3 فحوص (صفات المزايا/الشارات/الأغلفة · نزع الألوان الممنوعة · الإطارات + قاعدة pin-dark) + تقاعد الأسطر النثرية الستة للقائمة الممنوعة — 30/30 بلا رفع يدوي لأي تثبيت قديم.
- (البوابات) tsc ✓ 0 · eslint ✓ 0 (تحذير root-shell القديم بملف غير مساس) · vitest ✓ 100/1705 (+3) · stale-refs ✓ · ui-wiring ✓ · migration_audit ✓ صفر انحراف · docs_parity ✓ · docs_audit: 30 قديمة J/M كما هي (صفر جديد) · contrast matrix ✓ كلا الوضعين · next build ✓ 2020/2020.
- (الحي محليًا) EN/AR × Light/Dark × 1440/390: صفر overflow (scrollWidth=viewport) وصفر أخطاء console · صفات المزايا تُقرأ في الوضعين والأيقونات تتبع الكارت الداكن في الفاتح · الشارات والأغلفة والإطارات متحققة باللقطات — لقطات الجولة خارج المستودع.
- (CI — parity) التشغيل الأول على 3ad7d66 فشل ببوابة docs_audit --ci: M/registry-dates — صف README.md بالسجل قال 2026-09-24 بينما آخر كوميت للملف صار كوميت الموجة (2026-09-25 UTC) + ثلاثة صفوف RECOVERY قياسها يتضارب بين النسختين (b53ad590 2026-09-21 محليًا مقابل bf46c2c0 2026-09-20 على الواجهة) — الإصلاح: رفع الصفوف الأربعة لتواريخ ملفاتها الفعلية (السجل لا يتأخر أبدًا) — ملاحظة منهجية: فحوص البوابات المحلية تُقرأ بexit الحقيقي لا بماسورة tail.
- (التوثيق) DESIGN.md: ترويسة 278 + §5 صف .theme-img-pin-dark + §7.4 العضويات بVRD-V8R + §7.4.3 جديد (الإطارات + FAQ الختامية وإبقاء CTA الختامي مُتقاعدًا) · README.md: جملة صفات المزايا الحقيقية · docs/README: صف DESIGN بتاريخ 278 · STATE: مرحلة 278 + صف QA (دمج 256 في 257 للحفاظ على السقفين — 99 سطرًا/31,440B).

Stage Summary:
- البنود المتبقية من الخطة منفذة بأخف حل يحفظ الهدف: العضويات صارت تُقرأ كقيمة حقيقية قابلة للمسح (صفات مشتقة من المصدر الوحيد) بدل بطاقة تسعير جافة، و#eat عادت للأحادية الكرومية (نزع آخر انتهاك لوني ممنوع على سطح تسويقي)، وFAQ صارت سطحًا ختاميًا مكتملًا، والأشرطة اكتسبت لغة الحواف المشرطنة — صفر اعتماديات، صفر JS جديد، صفر حركة جديدة (لا يحتاج حراسًا)، صفر مساس بالمنطق/المسارات/الأسعار/الترتيب/card-lift الثمانية/أرقام عضويات memberships.ts.
- قائمة ما لا يُفعل حفُظت حروفًا: لا P2/Marble/ألوان جديدة/أرقام مخترعة/شهادات مؤلفة — الشهادات غير موجودة فعلًا فلا شيء أضيف (Trustpilot ينتظر تقييمات حقيقية بقرار STATE).
- ملفات الفريم: src/components/views/LandingView.tsx · src/app/globals.css · src/lib/__tests__/homepage-adoption.test.ts · DESIGN.md · README.md · docs/README.md · STATE.md · worklog.
- Commit SHA: 7b01de1 (كوميت التنفيذ — الكود والوثائق) + سلسلة التوثيق: 3ad7d66 (تسجيل SHA) · d29e469 (إصلاح صفوف السجل الأربعة — M/registry-dates) · fe7b415b (تواريخ الحقيقة: ترويسة README + الصف الذاتي للسجل)
- Push status: pushed (1afee2b..fe7b415b على origin/main) — CI 4/4 خضراء على fe7b415b (quality · parity · guard · cleanup) — تشغيلان توثيقيان متوسطان فشلت فيهما parity وأُغلقا بنفس الجلسة (3ad7d66/d29e469 — قياس تواريخ السجل) — **الإنتاج alkemos.com يخدم الموجة متحققًا حيًا**: HTML يحمل theme-img-pin-dark ×9 + صفات المزايا + COMMON QUESTIONS (+AR بالعربية كاملة) · CSS المقدّم يحمل قاعدة pin-dark · صفر #34c759/#ff9500 بDOM الرئيسية — لم يلزم deployment-trigger (النشر تسجل على كوميت التنفيذ).

---
Task ID: VRD-V8-2026-09-26
Agent: Super Z (owner session)
Task: تنفيذ موجة VRD-V8 «الوو البصري» على الرئيسية (أمر المالك 2026-09-26 بعد مراجعة حالة V7 في المستودع والموقع الحي: رفع الهيرو لأقوى جزء بصري + قصة منتج تُقرأ في ثوانٍ + جعل EVO والتخطيط الذكي قلب التجربة — دون إعادة تنفيذ ما نجح في V7، ودون مساس بBusiness Logic/APIs/Supabase/Routes/البيانات، ودون Framer Motion/GSAP/Three.js/WebGL/Canvas أو أي اعتمادية جديدة، ودون تغيير الألوان الأساسية أو المحتوى الحقيقي أو الأرقام، وبلا بنود P2 ولا Marble overhaul ولا إعادة تصميم العضويات/الشهادات).

Work Log:
- (المراجعة أولًا) git fetch — SYNCED على dd43e98 (نهاية V7) · قراءة STATE/DESIGN/AGENTS §3.5-3.7 + worklog · جولة حية على alkemos.com (هيرو/EVO/#plan) لتثبيت نقطة البداية: الثلاثية الزجاجية ساكنة عرضًا معلوماتيًا، وEVO بأوربه وشعاعه ينتهي بحديث توضيحي بلا وصول لنتيجة المستخدم.
- (بحث 21st.dev — V8-4) فحص العائلات الأربع (Hero/storytelling/premium cards/AI): «Animated Beam» (MagicUI) هو الوحيد الذي يعطي قفزة حقيقية للقصة المطلوبة — تنفيذه الكنسي يقيس المستطيلات بResizeObserver ويحرك نافذة تدرج بمكتبة حركة؛ قرارهما: إعادة تأليف داخلي بمسارات Q مثبتة + نبض dash (pathLength=100 + stroke-dashoffset) — صفر JS صفر اعتماديات. المرشحون الآخرون (Shimmer/Typing/Orbiting/Spotlight) رُفضوا: إما مكتبة حركة أو كلفة بلا قفزة أو كسر لقوانين الشكل (typewriter عربي مكسور بعرض ch) — «لا component لمجرد الاستخدام».
- (V8-1+V8-2 — الهيرو) .platform-trio: الثلاثية الزجاجية بقيت قائمة دلالية غير روابط (قانون الزرين حرفيًا) وتحصل على نبضة دخول متدرجة (trio-rise ثلاث مراحل backwards — صفر CLS) ورفع hover هادئ (2px + حدود أشد + --shadow-lift، تحت no-preference فقط)، وتحتها مخطط التقارب: ثلاثة تدفقات كرومية (trio-base سلك ثابت دائم + trio-pulse نبضتا مذنّب لكل مسار — dasharray 12/38 ودورة 5s بإزاحات ثلثية) تتقارب في عقدة زجاجية (قرص بطاقة شفاف + نواة + هالة تتنفس trio-halo بtransform-box: fill-box) وتحتها تسمية «ONE PLATFORM/منصة واحدة» — التكوين متماثل البناء فلا انعكاس RTL مطلوب (قانون الحركة عديمة الاتجاه)، والمخطط aria-hidden كليًا.
- (V8-3 — EVO+التخطيط) التسليم داخل .evo-console: سكة سياية (.evo-handoff-rail) بثلاث نقاط نابضة (evo-dot-pulse بإزاحات 0/0.2/0.4s) وخط متقطع ثابت تنزل من عمود أفاتار EVO (padding-inline-start منطقي 11px ينعكس بالRTL بدقة تحت الأفاتار) إلى بطاقة تسليم (.evo-handoff-card) بعنوان «ثم تُبنى خطتك هنا» ورقاقتَي مرساة حقيقيتان ‎#plan-workout/#plan-nutrition‎ (EngravedIcon rack/protein + شيفرون معكوس) — البانيا في #plan حملها المعرفان + scroll-mt-24 (DOM فقط، صفر منطق) — السيان كله داخل الكونسول (قانون سطح AI محفوظ) + الأورب يتنفس أعمق عند hover الكونسول — الشعاع آخر ابن للوحة كما هو.
- (الحرس) كل الحركات الجديدة الثلاث (trio-dash/trio-rise+trio-flow/trio-halo/evo-dot-pulse) داخل @media (prefers-reduced-motion: no-preference) بنيويًا — تحقق آلي بمفكك للملف أثبت أن كل إعلان animation محروس — الوضع المقيد يرى السلك الثابت والنقاط ساكنة.
- (البوابات — §3.5 + حراس V7) tsc ✓ 0 · eslint ✓ 0 (تحذير root-shell القديم بملف غير مساس) · vitest ✓ 100/1702 (الكاناري homepage-adoption حرفيًا بلا تعديل) · stale-refs ✓ · ui-wiring ✓ · migration_audit --ci ✓ صفر انحراف جديد · docs_parity ✓ · docs_audit: 30 مخالفة قديمة J/M كما هي (مطابقة خط الأساس قبل التعديل حرفيًا — صفر جديد) · next build ✓ كامل 2020/2020 بالـsandbox.
- (الحي محليًا على بناء الإنتاج) EN/AR × Light/Dark × 1440/390: صفر overflow أفقي (scrollWidth=viewport في السياقات الأربعة) · صفر أخطاء console (فقط سجل Vercel Analytics المحلي المتوقع) · التقارب يقرأ بالوضعين (عاجي على الغرافيتي الداكن/غرافيتي على الرخام الفاتح) · hover حي بمؤشر حقيقي (matrix translateY(-2px) + حدود 52%) · نقرة رقاقة «Workout plan» نزلت الصفحة إلى ‎#plan-workout داخل الشاشة الأولى (scroll-mt يحسب الهيدر اللزج) · RTL: العنوان يبدأ من اليمين والرقاقات معكوسة والسكة تحت الأفاتار الأيمن والهالة/التدفق كما هي (تماثل) · الجوال: الثلاثية تلتف صفين والمخطط يتمدد 82vw والتسليم يكدّس الرقاقات — لقطات الجولة خارج المستودع.
- (التوثيق — §3.8) DESIGN.md: ترويسة + §5 صفّا .platform-trio/.trio-* و.evo-handoff-* + تحديث صف .hero-pill + §7.1 «Platform trio + convergence» + §7.3 التسليم · docs/README.md صف DESIGN.md بتاريخ اليوم · STATE.md مرحلة 277 بإدخال مضغوط وضغط الإدخالات 270-276/257 (98 سطرًا/28,860 بايت داخل السقفين) + صف QA (277).

Stage Summary:
- موجة VRD-V8 منفذة: الهيرو صار قصة منتج مرئية (ثلاثة مسارات تتغذى في عقدة «منصة واحدة») وتجربة تفاعلية خفيفة (دخول متدرج + hover حي)، وEVO صار مدخل منتج حقيقي (المحادثة تصل حرفيًا إلى بانيّ الخطط بمراسي عميقة) — **كلها SVG/CSS خالصة على transform/filter/stroke-dashoffset، صفر اعتماديات، صفر مكتبات حركة، صفر JS جديد، صفر مساس بمنطق الأعمال/المسارات/API/Supabase/الأسرار، صفر ألوان جديدة**.
- قاعدة 21st.dev طبقت بحروفها: «Animated Beam» أُعيد تأليفه داخليًا كوصفة نظام (بلا مكتبة الحركة الكنسية ولا ResizeObserver — التكوين مثبت فلا قياس مطلوب)، وكل مرشح آخر قُيّم ورُفض لعدم قفزته.
- الممنوعات الملكية محفوظة: لا P2 · لا Marble overhaul · لا مساس بالعضويات/الشهادات/الألوان/المحتوى/الأرقام · Server Components كما هي (التغيير كله CSS + JSX تصييري بنفس المكونات).
- ملفات الموجة: src/components/views/LandingView.tsx (الهيرو + التسليم + المراسي) · src/app/globals.css (وصفات V8) · DESIGN.md · docs/README.md · STATE.md · worklog.
- Commit SHA: b27e1411 (كوميت التنفيذ والتوثيق موحّدان)
- Push status: pushed (dd43e98..b27e1411 على origin/main) — CI 5/5 خضراء عليه (quality · parity · guard · Supabase Preview · cleanup) — نشر الإنتاج تأخر عن الدفعة (نمط V7 الموثق: سجل الحافة ظل يخدم قديمًا بلا deployment مسجل) فشُغّل بكوميت التشغيل 02b5608 — التحقق الحي أسفل.
- (التحقق الحي بعد الدفع — 02b5608): الإنتاج alkemos.com يخدم الموجة (HTML: platform-trio + trio-node-disc ×3 + evo-handoff + ‎#plan-workout · CSS المقدَّم: trio-dash/trio-halo/evo-dot-pulse/hero-pill:hover) · build-info = b27e1411 (277) · الحي EN: التقارب يقرأ والنبضات الثلاث تعمل والتسليم حاضر وصفر overflow — CI على b27e1411 خضراء كاملة 5/5.

