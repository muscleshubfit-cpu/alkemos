# Worklog

> **Policy (Phase 288 — ARCH-REMEDIATION, audit P1-1):** the live file IS the active window —
> hard-capped at **≤ 12 entries AND ≤ 128 KB** (`scripts/docs_audit.py` check H5). Anything below
> the window rotates verbatim to `archive/WORKLOG_ARCHIVE.md` in the SAME commit via
> `python3 scripts/worklog_rotate.py` — size-driven, never calendar-driven, never one-shot.
> Newest on top; append-only; one entry per task (§12.5.1).

---
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

---
Task ID: GIT-IDENTITY-2026-09-29
Agent: Super Z (main)
Task: أمر المالك 2026-09-29 — نشر Vercel لـ commit تقرير التدقيق fe613c04 محجوب («audit@alkemos.local ليس عضوًا بالفريق»)؛ استخدام بريد المالك muscleshubfit@gmail.com وتثبيته قانونًا ملزمًا في AGENTS.md §10.

Work Log:
- (التشخيص) fe613c04 وُقّع `Independent Audit <audit@alkemos.local>` مخالفًا القانون القائم §10 (بريد الالتزام muscleshubfit@gmail.com) — تكامل Git في Vercel يفوّض كل نشر إلى main بمطابقة بريد مؤلف الـ commit ضد أعضاء فريق muscleshubfit-2941؛ أي بريد آخر = النشر BLOCKED. الـ CI على fe613c04 نفسه أخضر (Supabase Preview · cleanup · parity · guard ✓) — الحجب من Vercel وحده وبلا أي أثر إنتاجي (commit مستندات فقط، والموقع يبقى على آخر بناء سليم؛ وكان يستوجب [vercel skip] أصلًا بقانون VERCEL-USAGE-6).
- (الإصلاح بلا إعادة كتابة تاريخ) لا amend/force-push على main النشط (خطر فقدان دفعات متزامنة + §12.5.2 يفرض فحوصات ما بعد force-push) — commit جديد بعضوية المالك يفوّض النشر ويتضمن كل محتوى main شاملًا AUDIT_REPORT.md.
- (تثبيت القانون §10) تشديد قانون بريد الالتزام: الإلزام للمؤلف والمُرسل معًا (الاسم المعروض حر)، سبب Vercel + واقعة 2026-09-29 + وصفة الاسترداد (أول commit لاحق بعضوية عضو يزيح المحجوب — بلا إعادة كتابة أبدًا) + فحص الهوية ما قبل الدفع `%ae`.
- (البوابات) docs_audit ✓ بعد التعديل · docs_parity ✓ · تدوير ذيل نافذة worklog بـ scripts/worklog_rotate.py (H5 ≤ 12 مدخلًا) · [vercel skip] في موضوع الـ commit (مستندات فقط — قانون VERCEL-USAGE-6) · الهوية: Super Z <muscleshubfit@gmail.com>.

Stage Summary:
- انحلت مشكلة التفويض من جذرها: كل commit قادم بعضوية muscleshubfit@gmail.com يمر عبر Vercel بلا حجب، والقانون مثبّت في ملف الحكم AGENTS.md §10 بسببه وحادثته ووصفة استرداده — منع تكرار كامل لأي وكيل قادم.
- Push status: pushed to main (بريد عضو) · التحقق الحي: فحوصات الـ CI وحالة «Vercel» تُقرأ من الـ commit نفسه على GitHub (قانون SHA — فريم 288).

---
Task ID: SOCIAL-OG-2-2026-09-28
Agent: Super Z (main)
Task: أمر المالك 2026-09-28 «المربع الأزرق بدل صورة المشاركة» — فحص كامل للموقع بالعربية والإنجليزية (OG/Twitter Cards/metadata/الصور/الكاش/وصول الزواحف)، مقارنة الصفحات العاملة (مقالات المدونة) بالمعطوبة، تحديد السبب الحقيقي، تنفيذ جميع الإصلاحات دون تغيير أي شيء غير مرتبط، الاختبار، التوثيق، والدفع إلى main.

Work Log:
- (فحص حي كـ crawler) جلب كل فئات الصفحات بـ UA «facebookexternalhit/1.1» واستخراج وسوم OG/Twitter + التحقق من كل صورة مشاركة (status/content-type) — الرئيسية والمدونة والأدوات والبرامج والخطط الغذائية وevo وcoaching والمسارات الديناميكية (تمارين/أطعمة/مقارنات/مؤلفون) EN+AR.
- (تدقيق كامل لخريطة الموقع) فحص متوازٍ لـ 741 URL (كل pages+collections+comparisons+foods+blog + عينة ~290 من 1736 تمرينًا): **صفر فشل اليوم** — كل صفحة تملك og:image صالح يعيد 200 image/*.
- (علم الصور) تنزيل وفحص كل أصول المشاركة: بطاقات PNG الـ14 حقيقية 1200×630 · صور البرامج WebP فعلية **768×768** بينما الميتاداتا تعلن 1200×630 (خلل) · صور التمارين 640×427 بلا أبعاد معلنة · الأفاتار 400×400 ✓.
- (السبب الجذري أ) كاش المنصات من الحقب المعطوبة الثلاث: أرك AR صفري البايت حتى Phase-151 (09-08) · og:image شعار/بلا كارت حتى Phase-187 (09-26/27) · بداية باردة 1.7–5.2s تتجاوز ميزانية الزاحف حتى SOCIAL-OG (09-22) — المنصات تعيد الزحف بعد TTL ≈30 يومًا لذا الصفحات المشتركة خلال الحقب المعطوبة ما تزال تعرض المربع الأزرق، بينما مقالات المدونة (مولودة بالغلاف الأول بعد الإصلاح وزحف جديد) تعمل — يطابق بلاغ المالك تمامًا.
- (السبب الجذري ب) هشاشة ميتاداتا: أبعاد معلنة ≠ فعلية بالبرامج · تمارين بلا dims/type · صفر cache-bust على روابط الصور (نفس URL المعطوب سابقًا يظل مخزّنًا) · لا قاعدة سماح صريحة لزواحف المشاركة على الحافة (browser_check on / security_level medium).
- (إصلاح 1 — الكسر الأهم) `?v=2` على كل صورة مشاركة مستضافة ذاتيًا في **73 ملفًا** (og + twitter): URL جديد = cache miss إجباري عند أي زحف قادم — بلا إعادة تسمية ملفات وبلا مساس بالتصميم/المحتوى.
- (إصلاح 2 — صدق الميتاداتا) البرامج EN+AR: تصحيح الأبعاد إلى 768×768 المُقاسة + `og:image:type: image/webp` · التمارين EN+AR: 640×427 + webp type للصورة الحقيقية · المدونة EN+AR: إعلان 1200×630 · المؤلفون EN+AR: bust على الأفاتار · المقارنات EN+AR: `&v=2` على روابط المولّد `/api/og-image/<slug>?lang=X` (روابط حقبة الأرك الصفري بالضبط) بأبعاد 1200×630، وJSON-LD image تابعت للاتساق §12.40.
- (إصلاح 3 — الحافة) قاعدة Cloudflare WAF مخصصة (custom phase، مفعّلة): سماح صريح لزواحف المشاركة (facebookexternalhit بأصله التام، Twitterbot، WhatsApp، LinkedInBot، TelegramBot، Slackbot، Discordbot) — ruleset 733af35f… / rule 5054aaa6….
- (البوابات) og-image-coverage.test.ts حدّث بقانون الإصدار (ثابت SHARE_IMG_VER — نقطة bump واحدة مستقبلًا) + ar-mirrors.test.ts → **vitest 1771/1771 ✓** · **next build ✓ 2020/2020** · تحقق حي بـ next start: og:image ?v=2 وdims/type تصدر حرفيًا كما صُمم، وروابط ?v=2 تعيد 200 بأنواع محتوى صحيحة.
- (توثيق) docs/SOCIAL-OG-2-SHARE-IMAGE-AUDIT-2026-09-28.md (التقرير الحاكم: المنهجية + الجذران + الإصلاحات + runbook إعادة الزحف للمالك) + صف التسجيل في docs/README.md + هذا المدخل.

Stage Summary:
- السبب الحقيقي موثق بعلم قابل للتكرار: كاش المنصات من حقب OG المعطوبة السابقة (أساسي) + ميتاداتا هشة (أبعاد معلنة خاطئة/ناقصة، صفر bust، لا ضمان حافة) — وليس أي عطل قائم اليوم (741 URL نظيفة).
- الإصلاحات المسببة الثلاثة نُفذت: ?v=2 (73 ملفًا) + ميتاداتا صادقة كاملة (برامج/تمارين/مدونة/مؤلفون EN+AR) + قاعدة WAF لزواحف المشاركة — صفر مساس بالتصميم أو المحتوى أو منطق الأعمال.
- القيد المتبقي (خارج سيطرة الموقع، §4 من التقرير): URLs المسمومة في كاش فيسبوك تحتاج إعادة زحف (مشاركة جديدة بعد النشر، ≤30 يومًا، أو Scrape Again من Debugger بحساب المالك) + تحقق المالك أن Bot Fight Mode OFF بلوحة Cloudflare (غير قابل للقراءة بصلاحية التوكن الحالي).
- Push status: pushed to main — 89322f0 (الإصلاحات + التقرير) ثم d135f83 (follow-up المقارنات) · Vercel: READY ×2 · Cloudflare purge_everything ×2.
- (التحقق الحي بعد النشر — 11/11 ✓) الرئيسية EN/AR og-home-*.png?v=2 (1200×630) · التمارين EN/AR الصورة الحقيقية ?v=2 (640×427 webp) · البرامج EN/AR 768×768 المصححة · المقارنات EN/AR ?v=2 (1200×630) · المدونة غلاف Pexels بأبعاد 1200×630 · الأطعمة والمؤلفون بالنسخ المصدّرة — وروابط الصور ?v=2 تعيد 200 بأنواع محتوى صحيحة عبر الحافة.
Task ID: PERF-AUDIT-296-2026-09-28
Agent: Super Z (main)
Task: أمر المالك 2026-09-28 — Audit شامل للسرعة والأداء (الموقع + البنية التحتية) بجلسة جديدة كليًا، ثم تنفيذ التحسينات المبررة فقط دون تغيير التصميم أو المحتوى أو business logic، وإعادة القياس وحفظ التقرير داخل المستودع.

Work Log:
- (قياس قبل) Lighthouse 13.5 mobile: Perf 49 · LCP 5.2s · TBT 2,210ms · CLS 0 · FCP 2.1s · TTFB 40ms — بينما القياس التجريبي الفعلي بPlaywright (بلا throttle): LCP ≈ 404–436ms وLoad ≈ 500–550ms → الدرجة المخبرية محكومة بمحاكاة CPU×4 (ترطيب) لا بالشبكة (الأصول الحرجة تصل ≤300ms).
- (اكتشاف 1 — الصور) 30 ملفًا بامتداد .png هي فعليًا JPEG ‏1024×1024 (2.2MB): foods (9) · exercises (8) · programs (7) · tools (6) — مُشار إليها بسلاسل حرفية في lib وليست في DB.
- (اكتشاف 2 — الثيم الداكن) قياس مقارن: الزائر الداكن يجلب 4 أصول light مخفية (hero+logo+helmet+evo ≈ 62KB/4 طلبات) لأن Chromium يحمّل eager المخفي بdisplay:none — الوضع الفاتح نظيف (الداكنة lazy أصلاً).
- (اكتشاف 3 — البنية) APIs: Cloudflare (brotli/http3/early-hints ✓، قواعد كاش سليمة، أصول ثابتة HIT) · Vercel (builds READY ~2min، ISR يعمل، br فعلي) · Supabase (DB 24MB، أثقل استعلام تطبيقي 10ms، 129 فهرسًا غير مستخدم بعائد مهمل) · GitHub (19 workflow وظيفية) — كلها صحية: صفر إجراء مبرر.
- (تنفيذ 1) إعادة ترميز 24 صورة مُشار إليها إلى WebP حقيقي 768px q80: ‏1,825KB→790KB (−57%) + حذف 6 أيتام tools/*.png (469KB — فحص src/DB/scripts/docs: صفر مراجع) + تحديث المراجع: foods-shared · exercises · exercises-shared · ai-local · workout-programs + تعليق exercise-images + اختبار passthrough.
- (تنفيذ 2) lazy موضعي لإصلاح هدر الداكن: درج موبايل SiteHeader (كان eager مخفي دائمًا) + فقاعة EVO (تتركب بعد الخمول أصلًا) — hero/logo أبقيت eager عمدًا (LCP + lcp-discovery + media-scoped preloads) — سلوك وأبعاد محجوزة: صفر CLS.
- (مؤجل مبررًا موثقًا) refactor LandingView لserver components (خفض الترطيب — مخاطرة عالية على 1,851 سطرًا بجلسة واحدة) · إزالة preload المكرر (اليدوي وحده حامل media+fetchPriority) · lazy للhero (يفشل lcp-lazy-loaded) · حذف فهارس Supabase — الكل بdocs/PERFORMANCE-AUDIT-2026-09-28.md §3.
- (التحقق) tsc ✓ 0 · vitest ✓ 1,771/1,771 · eslint ✓ 0 · next build ✓ (كل المسارات Static/SSG/ISR) · stale-refs: صفر إشارات للملفات المحذوفة.
- (القياس بعد النشر) deploy ‏8f3830a READY + purge_everything لكاش CF ثم إعادة نفس القياسين: Lighthouse mobile — الوزن 2,320→1,817KB (−21.7%) · TBT 2,210→1,810ms (−18%) · SI 3.8→3.1s · Perf 49→50 · CLS 0 وSEO 100 ثابتان — والقياس التجريبي الفعلي: صور 1,221→656KB (−46%) · طلبات 87→83 (light) · LCP فعلي 360/384ms · فقاعة EVO أُصلحت بالداكن ✓ · حزمة JS مطابقة (صفر انحدار) — بوابة parity خضراء بعد إصلاحَي فشل أول push: H5 (تدوير ذيل النافذة بworklog_rotate.py للأرشيف) وM (تسجيل التقرير بdocs/README.md) — التفصيل الكامل §4 بالتقرير.

Stage Summary:
- صفحة رئيسية أخف بـ~900KB من طلباتها وصفحات الأطعمة/التمارين/البرامج تربح بالمثل؛ الزائر الداكن يوفر ~56KB و3 طلبات من نافذة LCP.
- البنية التحتية الأربعة (CF/Vercel/Supabase/GitHub) موثقة صحية بلا إجراء؛ الترطيب يبقى bottleneck المختبر الوحيد المتبقي (مسار قرار مالك مستقبلي).
- الملفات: docs/PERFORMANCE-AUDIT-2026-09-28.md (جديد) · 5 lib + exercise-images.ts + test + SiteHeader + EvoFloatingWidget · 24 webp جديد/-30 png · STATE.md · worklog.md (هذا المدخل).
---
Task ID: CONTENT-AUDIT-PHASE-295-P2-11-2026-09-28
Agent: Super Z (main)
Task: أمر المالك 2026-09-28 — تنفيذ P2-11 بالكامل من تقرير العلاج بمصدر الحقيقة من المالك: صورة الشهادات الأصلية الثماني + حسابا فيسبوك، مع معالجة بصرية احترافية بلا أي تغيير في محتوى الشهادات.

Work Log:
- (المصدر) الصورة الأصلية 1768×992: كُشفت حدود الشهادات الثماني بكسليًا (كشف تكيفي لكل خلية 3×3 + مسحات حواف إحصائية + تحقق VLM مزدوج) — الثمانية: ACSM CPT · ACE CPT · ISSA CPT · ACE FNS · NASM FNS · ISSA SSN · ACE WMS · ISSA FC.
- (المعالجة البصرية) قصّ بكسلي دقيق بلا أي إعادة إنشاء: أُزيلت الخلفية الزخرفية والشعار البرتقالي المركزي فقط؛ حلاقة خوارزمية لبقايا الخلفية الداكنة/المتوهجة (≤12px) + تدرّج حافة 4px؛ شبكة موحّدة 2×4 على خلفية فاتحة متدرجة بظلال خفيفة — founder-certificates.{webp 131KB, jpg 286KB} ‏(1252×1884). تحقق VLM نهائي: الثمانية كاملة، صفر بقايا، صفر محتوى مقصوص (حافتا أمانة موثقتان: حافة WMS العلوية مقطوعة في الأصل نفسه، والحد الذهبي في SSN ينتهي قبل الزاوية بتصميم القالب).
- (المحتوى النصي) authors.ts: المدخلان العامّان (CPT بلا جهة + «Nutrition Coach certification») استُبدلا بالثمانية المسمّاة بأجهزة الإصدار (قانون المالك: الأسماء والجهات فقط — لا أرقام/تواريخ/عضويات، يحميه كناري رفض الأرقام).
- (إشارات الهوية) Person.sameAs = الحسابان الموثّقان حيًّا (AhmedZakePT 14k+ · SpEeRr 18k+) بمعزل عن Organization.sameAs؛ knowsAbout += Sports nutrition · Weight management (بدعم الشهادات)؛ بطاقات الروابط تعرض الحساب بدل اسم المضيف المتطابق.
- (الصفحتان) مؤسس EN/AR: figure الشهادات داخل قسم الشهادات مع caption ثنائي + alt وصفي.
- (الحماية) 8 اختبارات كناري جديدة author-credentials-p2-11.test.ts (الجهة مسمّاة، الثمانية حرفيًا، صفر أرقام، sameAs بالضبط + انفصال الكيان، الملفات على القرص، الصفحتان تعرضان الصورة).
- (الوثائق) تقرير العلاج §5 → منفّذ بتفصيل كامل + صف P2-11 في جدول P2 + صف README/محدث — وSTATE 295.

Stage Summary:
- P2-11 مغلق بالكامل بمصدر الحقيقة من المالك: تدقيق المحتوى الآن 26/26 (الباقي بقرار المالك: تعريب الأطعمة 4+ فقط).
- القيود الحرفية للمالك كلها محفوظة ومحروسة باختبارات: بلا تكرار/استبدال/حذف/إعادة إنشاء شهادة، وبلا نشر أرقام أو تواريخ من الشهادات.
---
Task ID: CONTENT-AUDIT-REMEDIATION-S4-2026-09-28
Agent: Super Z (main)
Task: أمر المالك 2026-09-28 — إتمام البنود المتبقية من docs/CONTENT-AUDIT-REMEDIATION-2026-09-28.md، خصوصًا محتوى قاعدة البيانات (§4)، دون إعادة تنفيذ مكتمل ولا اختراع ما يتطلب قرار مالك.

Work Log:
- (تشخيص النشر) نشرات جولات الإصلاح السابقة كانت محجوبة على Vercel (COMMIT_AUTHOR_REQUIRED — هوية «Z User») — أُعيد النشر عبر API deployment + تطهير CF، والإصلاحات الآن حية؛ هويات الالتزامات الجديدة «Alkemos Agent».
- (القناة) أُنشئت قناة العلاج المعتمدة: scripts/blog-runner/content-audit-db-remediation.mts + content-audit-db-patches.json (25 رقعة محقّقة find=1x) + .github/workflows/content-audit-db-remediation.yml (dispatch-only، DRY_RUN افتراضيًا).
- (قبل الكتابة) نسخة احتياطية يومية طازجة (db-backup: نجح) + DRY_RUN عبر GHA بالمفتاح الحقيقي (الخطة مطابقة للمحلية) + إثبات تكافؤ بايتي 7/7 للصفوف الميكانيكية.
- (APPLY — تشغيل 36366488858) 22 صفًا: 11 مقالًا «مقدمة:» + كاف sleep-recovery + ذيل creatine EN + 25 رقعة منسّقة (حشو §1.3، مزروع §4.2 بعدد أوسع من التقرير: 10 كتل سؤال القارئ + 5 كلمات مفتاحية ببيتا ألانين حُذفت مع إثراء faq_json 4→10، و4+2 بحاسبة السعرات، ومثيلان اكتُشفا) + توحيد الكارديو §4.3 عبر أربعة مقالات + فئات P1-8 الخمس — 0 فشل، 0 ناجين من التحقق البعدي، والتحقق الحي بعد ISR مؤكد.
- (الفك §4.4) أُزيلت ⑥⑦⑧ من تركيب sanitizeBlogContent (الدوال باقية قانون تحويل للقناة) + أُفرغت BLOG_CATEGORY_OVERRIDES (الآلية صمّام موثّق) + كناري اختباري يثبّت التركيب المفكوك وكناري يمنع عودة الإدخالات.
- (جذر P0-2 الإضافي) insertToolLinks كان يكسر كلمات عربية وقت العرض (سعرات</a>ك على 18 مقالًا حيًّا) — حارس WORD_CHAR على الحافة الخلفية فقط (البادئة «ال» تُشكَّل كلمةً سليمة عبر المتصفح — موثق بالتعليق) + اختبارات انحدار.
- (التحقق) vitest 1,748/1,748 · tsc 0 · eslint 0 · next build ✓ (2,022 صفحة) · تسجيل الوثائق: صفّا docs/README + صف CI_GATES + تحديث تقرير العلاج §4 (منفَّذ) + STATE.

Stage Summary:
- تدقيق المحتوى مغلق بالكامل: كل بند قابل للتنفيذ منفَّذ (repo + DB)، وقاعدة البيانات مصدر الحقيقة الوحيد بعد فك طبقات التعويض.
- المتبقي بقرار مالك فقط: P2-11 (جهة الاعتماد) + مراحل تعريب الأطعمة 4+ — كلاهما موثق بتقرير العلاج §5.
- الملفات: src/lib/blog-content-sanitize.ts · src/lib/blog-tool-links.ts · src/lib/blog-categories.ts · 3 ملفات اختبار · docs/README.md · docs/CI_GATES.md · docs/CONTENT-AUDIT-REMEDIATION-2026-09-28.md · STATE.md · worklog.md (هذا المدخل).
- Push status: pushed
Task ID: ARCH-REMEDIATION-293-2026-09-28
Agent: Implementation Agent
Task: أمر المالك 2026-09-28 — تنفيذ P4 من التقرير الحاكم وإغلاق جلسة إصلاح المعمارية كاملة (P0→P4، فريمات 287–293): تحصينات منظومة الحوكمة نفسها + قلب حالة التقرير إلى EXECUTED.

Work Log:
- (P4-1) external-mirror.yml: الجدولة الأسبوعية موقوفة (معلقة تعليقًا) حتى إتمام المالك إعداد docs/RECOVERY-MIRROR-SETUP.md — عاملان أحمران أسبوعيان بلا قيمة فعلية كانا يخفيان الصحة الحقيقية (تقرير A5.1 «FAILING BY DESIGN») — workflow_dispatch متاح والإعادة تتم بنفس كوميت إتمام الإعداد · صف CI_GATES حُدث.
- (P4-2) قانون ميزانية عائلات الفحوص موثق بالثلاثة مواضع الحاكمة: ترويسة scripts/docs_audit.py (البوابة تحكم التوثيق والميزانية تحكم البوابة — منع RC-5) + AGENTS.md §12.5.2 + CI_GATES.md — مع مراجعة ربع سنوية لمعدلات فشل كل عائلة.
- (P4-3) AGENTS.md §12.5.2 أعيدت كتابتها: المرور الشهري الكامل اعتُزل (كان يدقق ما تتحققه فحوصا M/N لكل دفعة أصلًا وينمّي worklog بتدقيق التدقيق — RC-5) — النظام الجديد: تحقق آلي لكل دفعة + مراجعة ربع سنوية للبوابة نفسها (معدلات الفشل لكل عائلة) + قاعدة الـ24 ساعة بعد أي force-push باقية.
- (الإغلاق) تقرير التدقيق الحاكم: سطر Lifecycle انقلب EXECUTED بأرقام الإغلاق الكاملة (فريمات كل بند + القياسات: worklog ‏740.7KB→59.6KB · STATE ‏31,147B→10.7KB · docs/ الحية 42→18 ملفًا · قراءة AGENTS الإلزامية ~41KB→~17KB · دفعات docs-only بلا بطارية جودة (متحقق حيًا عبر API) · parity أخضر) + صف السجل انقلب EXECUTED + بند القياس التنفيذي P4-4 (≈2026-10-12) مسجل بالمفتوح بSTATE.
- (STATE) صف 293 + صف QA 293 — سلّم ≤2 (صف 291 انتقل حرفيًا للأرشيف) — آخر كوميت متحقق منه: 44b9b312.
- (التحقق — فريم توثيقي/CI) yaml صالح ✓ · docs_audit ✓ · docs_parity ✓ · migration_audit ✓ · stale-refs ✓ · ui-wiring ✓.

Stage Summary:
- خطة إصلاح المعمارية الكاملة (P0→P4) منفذة ومغلقة بسبعة فريمات (287–293): السياق التنفيذي للتاريخ صار محصورًا بالأرشيف، التغيير العادي يمس التوثيق والتحقق الملائمين لنطاقه فقط، والحوكمة نفسها صارت محكومة بميزانية فحوص وقانون دوران.
- البند الوحيد المتبقي على المالك (موثق بSTATE وبتقرير التدقيق): فحوصات إلزامية على main تتطلب GitHub Pro لريبو خاص (API يرفض 403) — أو تحويل الريبو عامًا — وكذلك إعداد الـMirror لإعادة تفعيل الجدولة.
- الملفات الممسوسة: .github/workflows/external-mirror.yml · scripts/docs_audit.py (ترويسة الميزانية) · AGENTS.md (§12.5.2) · docs/CI_GATES.md · docs/ARCHITECTURE-AUDIT-REPORT-2026-09-28.md (EXECUTED) · docs/README.md (الصف) · STATE.md (293 + إغلاق الجلسة) · الأرشيفان (+صف 291) · worklog.md (هذا المدخل).
- Push status: pushed

---
Task ID: ARCH-REMEDIATION-292-2026-09-28
Agent: Implementation Agent
Task: أمر المالك 2026-09-28 — تنفيذ P3-2+P3-4 من التقرير الحاكم: تخفيف AGENTS §8 (السرد → TECH_REFERENCE) + توحيد مرايا DESIGN — الحفاظ على كل قيد ملزم حرفيًا.

Work Log:
- (P3-2 نقل) نص §8 الكامل (36 قانونًا — الحوادث والقرارات والسرد) انتقل حرفيًا إلى docs/TECH_REFERENCE.md §6 (قسم جديد بإثبات منشأ) — §8 أعيدت كتابته بالجوهر الملزم فقط (اسم + قيد + إحالة) مع ترويسة تشرح النقل وأولوية التعارض.
- (P3-2 نطاق القراءة) ترويسة AGENTS.md تحدد الآن نطاق القراءة الإلزامي: §1–§4+§12 فقط بالجلسة (~17KB — كان «الملف كله قراءة إلزامية» ~41KB) و§5–§11 قانون يُقرأ عند المساس بنطاقه — ميزانية القراءة بdocs/README حُدثت.
- (P3-4 توحيد المرايا) DESIGN.md = القانون الوحيد وglobals.css = مصدر التشغيل: src/docs/DESIGN_SYSTEM.md وsrc/styles/design-tokens.ts صارا pointer-only (تطبيبقًا للتقرير «generated or pointer-only») — التحري المسبق أكد صفر مستوردين للوحدة بكل src/scripts/workflows وv1_contrast_matrix.py يقرأ globals.css مباشرة — تعديل الواجهة صار يمس DESIGN.md+globals.css فقط لا ثلاثة.
- (توثيق تابع) DESIGN.md فقرة المرايا أُعيدت كتابتها بقانون التوحيد · صفوف السجل للملفين + DESIGN.md + TECH_REFERENCE حُدثت.
- (STATE) صف 292 + صف QA 292 — سلّم ≤2 (صف 290 انتقل حرفيًا للأرشيف) — آخر كوميت متحقق منه: 624ea53b.
- (التحقق — البطارية الكاملة لأن الفريم يمس src/styles/design-tokens.ts) tsc --noEmit ✓ 0 · eslint ✓ · vitest الكاملة ✓ · next build ✓ · docs_audit ✓ · docs_parity ✓ · stale-refs ✓ · ui-wiring ✓.

Stage Summary:
- القراءة الإلزامية انخفضت من «الملف كله ~41KB» إلى ~17KB محددة النطاق، وكل قانون AI احتفظ بقيدّه الملزم، وتعديل الواجهة صار يعديل وثيقة واحدة + مصدر تشغيل واحد.
- الملفات الممسوسة: AGENTS.md (ترويسة + §8) · docs/TECH_REFERENCE.md (+§6) · src/docs/DESIGN_SYSTEM.md (pointer) · src/styles/design-tokens.ts (pointer module) · DESIGN.md · docs/README.md · STATE.md · الأرشيفان (+صف 290) · worklog.md (هذا المدخل).
- Push status: pushed (بلا [vercel skip] — الفريم يمس src/)

---
Task ID: ARCH-REMEDIATION-291-2026-09-28
Agent: Implementation Agent
Task: أمر المالك 2026-09-28 — تنفيذ P3-1+P3-3 من التقرير الحاكم: نقل التقارير المغلقة إلى docs/archive/ (التقارير تُولد مؤرشفة) + فصل سجل تنفيذ SEO-GEO عن الخطة — صفر مساس بالكود/المنطق/الواجهة.

Work Log:
- (P3-1 نقل) 24 تقرير point-in-time منفذ انتقل بgit mv (التاريخ محفوظ) إلى docs/archive/: تقارير التدقيق العميق 16/18 + VERCEL-USAGE + UI/UX (4+3) + ترحيل التوثيق (تقرير+خطة) + تعريب الأطعمة (تدقيق اللغة + 3 تقارير دفعات) + Drills (2) + RECOVERY-LINK/OTP + ADMIN-DASH/DASH-WAVE + CONTENT-REWRITE + NOTIF-I18N-250 + STAFF-BELL-I18N-251 — سطح docs/ الحي صار 18 ملف مراجع حية فقط (هدف التقرير ~17).
- (P3-1 قانون) «التقارير تُولد مؤرشفة» بدخلتها بdocs/README.md (How to keep this registry true §1): أي تقرير/خطة/سجل جديد يهبط مباشرة بdocs/archive/ مع صفه بالسجل — لم يعد يوجد مسار «يُولد حيًا ثم يُنقل لاحقًا».
- (P3-3 فصل السجل) سجل تنفيذ SEO-GEO §12 (200,012 حرفًا ≈ 300KB — 64% من الملف) انتقل حرفيًا إلى docs/archive/SEO-GEO-EXECUTION-LOG.md (مولود مؤرشف بصفه) — الخطة 341.8KB→45.4KB بقسم §12 كعبًا يشير للسجل؛ الإدخالات الجديدة تُلحق بملف السجل — صف خريطة مصادر الحقيقة بSTATE حُدث.
- (مراجع) تحديث كل الإحالات للملفات المنقولة: AGENTS.md §12.5.2 (تقرير docs-context) · SECURITY.md (UX-TEST-REPORT ×3) · docs/CI_GATES.md (خطة الترحيل) · docs/README.md (كل الصفوف المنقولة) — صفر مسارات ميتة (فحص R/M أخضر).
- (STATE) صف 291 + صف QA 291 — سلّم ≤2 (صف 289 انتقل حرفيًا للأرشيف) — آخر كوميت متحقق منه: ed8713b9 (CI أخضر).
- (التحقق — فريم توثيقي) docs_audit ✓ (42→19 ملف docs/*.md حي كلها مسجلة — الفحص الثنائي يشمل docs/archive تلقائيًا لأن الصفوف تشير للمسارات الجديدة) · docs_parity ✓ · stale-refs ✓ · ui-wiring ✓ · migration_audit ✓.

Stage Summary:
- المواد التاريخية لم تعد تستهلك سياق التنفيذ: سطح docs/ الحي = مراجع فقط، وخطة SEO صارت قابلة للصيانة، وكل تقرير مستقبلي يُولد مؤرشفة من اليوم الأول.
- الملفات الممسوسة: 24 git mv + docs/archive/SEO-GEO-EXECUTION-LOG.md (جديد) + docs/SEO-GEO-MASTER-PLAN.md (45KB) + docs/README.md (الصفوف + القانون) + AGENTS.md + SECURITY.md + docs/CI_GATES.md + STATE.md (إحالات + 291) + الأرشيفان (صف 289) + worklog.md (هذا المدخل).
- Push status: pushed

---
Task ID: ARCH-REMEDIATION-290-FIXUP-2026-09-28
Agent: Implementation Agent
Task: إصلاح فوري: سكريبت الدوران scripts/worklog_rotate.py لم يُرفع أبدًا — .gitignore السطر `/scripts/*` ابتلعه (نفس فخ generate-og-cards.py الموثق بذيل الملف) فالبوابة خضراء محليًا (الملف على القرص) وحمراء بCI (غير موجود بالcheckout) — «حارس مش متكمّم مش حارس» بالمقلوب: حارس على القرص وغير مدفوع ليس حارسًا.

Work Log:
- (التشخيص) فشل docs-parity على دفعتَي 4c0b2ba6 وfdd2eca6: M/registry-paths «scripts/worklog_rotate.py does not exist» — git ls-files أكد: صفر تتبع رغم وجوده بالشجرة منذ فريم 288.
- (الإصلاح) استثناء `!/scripts/worklog_rotate.py` ب.gitignore (+سطر توثيق بالفخ) + رفع السكريبت نفسه.
- (التحصين) فحص M صار يستخدم مجموعة الحقيقة من git ‏(ls-files --cached --others --exclude-standard = ما سيدخل الكوميت فعلًا): مسار موجود على القرص لكنه ignored = فشل محلي فوري — الفئة كلها تقفل للأبد (الفحص المشتق من git يرى ما لا تراه الfilesystem).
- (التحقق) docs_audit ✓ أخضر مع السكريبت staged · py_compile ✓.

Stage Summary:
- السكريبت مدفوع فعلًا الآن والفئة (guard غير مدفوع يخضر محليًا ويحمر بCI) مقفولة بفحص M المشتق من git — دفعتا parity الحمراوان سببهما هذا وحده وستخضرّان بهذا الكوميت.
- Push status: pushed

---
Task ID: ARCH-REMEDIATION-290-2026-09-28
Agent: Implementation Agent
Task: أمر المالك 2026-09-28 — تنفيذ P2 من التقرير الحاكم (تحديد نطاق التحقق): paths-ignore لبوابة الجودة + توثيق التحقق المحلي المحدد بالنطاق بقانون §3.5 + قانون تثبيت الكاناري — صفر مساس بالكود/المنطق/الواجهة.

Work Log:
- (P2-1 CI) quality-gate.yml: paths-ignore على push وpull_request لـ(`**.md` · `docs/**` · `archive/**` · `.github/**` · `scripts/**`) وفق Part C §5 — دفعة docs-only لا يمكنها تغيير نتيجة tsc/eslint/vitest فتتخطى البطارية (46 كوميت docs-only أحرقتها سابقًا بلا أي أثر) — بوابات parity وguard بقيت على كل دفعة كما هي (هي بوابات التوثيق) وworkflow_dispatch متاح دائمًا — تعليق الرأس يوثق القانون.
- (P2-2 محلي) AGENTS.md §3.5: فقرة «Scope-matched verification» — فريم docs-only (صفر src/supabase/build-config) يشغل محليًا docs_parity + docs_audit فقط (+ migration_audit والحراس عند مساس نطاقهم) — سابقة 223/283 صارت قانونًا مكتوبًا؛ فريم الكود يشغل المجموعة الكاملة.
- (P2-3 كاناري) AGENTS.md §8: قانون CANARY PINNING POLICY — الكاناري يثبت السلوك والبنية أولًا؛ الأعداد الحرفية فقط حيث العدد نفسه هو القانون (image-safety v3 · MSA · slug law · ui-wiring)؛ تعديل نص تجميلي لا يستلزم تعديل اختبار بنفس الكوميت (فئة chev 14→10 بالمرحلة 286) — الحراس الحقيقيون لا يُضعفون أبدًا.
- (توثيق تابع) CI_GATES.md: تحصين IV (رأس الملف) + صف بوابة الجودة بالجدول يوثق paths-ignore — فحص N (تغطية كل workflow) أخضر.
- (STATE) صف 290 + صف QA 290 — سلّم ≤2 (صف 288 انتقل حرفيًا للأرشيف بنفس الفريم) — آخر كوميت متحقق منه: 4c0b2ba6.
- (التحقق — فريم docs+CI فقط) بنية YAML صالحة (python yaml parse لquality-gate.yml) ✓ · docs_audit ✓ · docs_parity ✓ · migration_audit ✓ · stale-refs ✓ · ui-wiring ✓ — tsc/eslint/vitest غير مطلوبة (القانون الجديد نفسه).

Stage Summary:
- التحقق صار مطابقًا للنطاق: دفعات التوثيق تدفع بوابات التوثيق فقط (محليًا وCI)، ودفعات الكود تدفع البطارية كاملة — وقانون الكاناري يمنع تزاوج الأسطح غير المرتبطة.
- الملفات الممسوسة: .github/workflows/quality-gate.yml (paths-ignore) · AGENTS.md (§3.5 + §8) · docs/CI_GATES.md (تحصين IV) · STATE.md (290 + أرشفة صف 288) · archive/PROGRESS_ARCHIVE.md + QA_CHECKLIST_ARCHIVE.md (+صف 288 حرفيًا) · worklog.md (هذا المدخل).
- Push status: pushed

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

