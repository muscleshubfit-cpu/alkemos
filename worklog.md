# Worklog

> **Policy (Phase 237 — migration Phase 5, option (b) rotation, 2026-09-19):** active region = newest-on-top
> (top-12 entry window + rolling date buffer, currently back to 2026-09-10); the full append-only history
> lives in `archive/WORKLOG_ARCHIVE.md` (pre-2026-09-10 tail rotated there verbatim). The boundary is
> guarded by the derived tail invariant — `scripts/docs_audit.py` H-check.

---
Task ID: I18N-SWEEP-253-2026-09-22
Agent: Super Z (owner session)
Task: أمر المالك «ابدأ في تنفيذ كل المتبقى من قائمة التحسينات» — الإطار الأول من مسح i18n الشامل (وكيل استكشاف وثّق 5 فئات متبقية بعد 250/251): الفئة الأعلى تأثيرًا على العضو + أسطح اللمسة الأولى.

Work Log:
- أثقل فجوة: جرس التقدم الأسبوعي (cron progress-reminder) عربي خام لكل عضو EN — التعليق الموثق بالكود نفسه يؤكد (لا عمود lang بprofiles) → نمط 250/251: الكرون يخزن payload {name} + مدخل progress_weekly_reminder بكتالوج الأعضاء (نسخة ثابتة — الاسم زخرفي اختياري، فالصفوف القديمة بلا payload تتعرّب هي الأخرى بلا اختراع أي بيانات — قانون الصدق)
- أسطح اللمسة الأولى (جذر الموقع): AuthErrorToast توستات إنجليزية على الواجهة العربية ← useI18n (متاح — مركب داخل I18nProvider بroot-shell) · CoachSlugClaimer توست «تم ربطك بالمدرب» عربي لعميل EN ← ثنائي اللغة · VoiceMicButton تسميات aria/tooltip عربية في واجهة EN ← تتبع لغة Speech المحلية نفسها (lang.startsWith("ar")) · LanguageToggle aria-label إنجليزي ← ثنائي
- WeightChart (المتوحّد 247): Tooltip يطبع مفتاح السلسلة الخام «weight» داخل الواجهة العربية ← prop lang (افتراضي ar — قانون الجمهور الأساسي) + name={الوزن/Weight} — المستهلكان ProgressView (lang) وCoachClientView عبر ClientWeightChart (lang) ممرران
- ProgressView:101 «{k}: invalid number» بمفتاح آلة إنجليزي داخل عربي ← رسالة ثنائية بلا مفتاح آلة
- 4 اختبارات كاناري جديدة (EN باسم · AR باسم · صف ليجاسي بلا payload يتعرّب · اسم فارغ بلا تحية) — vitest 99 ملفًا/1674 (+4)
- البوابات: tsc 0 · eslint 0 (الملفات العشرة الممسوسة) · build ✓ BUILD_ID — البقية بعد الدفع بالتحقق الحي

Stage Summary:
- عضو EN لم يعد يقرأ جرسًا أسبوعيًا عربيًا — وكل أسطح اللمسة الأولى (خطأ OAuth · ربط المدرب · الميكروفون · تبديل اللغة · تلميح الرسم البياني) تتكلم لغة المشاهد
- Commit SHA: this commit carries this entry
- Push status: pushed (نشر تلقائي — بلا [vercel skip] — التحقق الحي بعد النشر)

---
Task ID: STATE-SYNC-252-2026-09-22
Agent: Super Z (owner session)
Task: أمر المالك «تاكد من توثيق العمل المكتمل ثم ابدأ في تنفيذ كل المتبقى من قائمة التحسينات» — الجزء 1: التحقق من التوثيق وإصلاح فجوته قبل أي تنفيذ جديد.

Work Log:
- التحقق: worklog كامل ومكتمل القمة (251 تنفيذ + 251 LIVE-VERIF) ومتزامن origin/main (74fe7549) — لكن STATE.md متأخر عند المرحلة 247 بينما 248/249/250/251 منفذة ومدفوعة ومتحقق منها حيًا — مخالفة §3.6 «يتحدث بنفس الفريم»
- القيد: STATE عند 31,829/32,000 بايت (سقف docs_audit صارم) — الإضافة المباشرة مستحيلة → نمط 235 المرخص: ضغط الصفوف التاريخية 243-247 (كل تفاصيلها محفوظة حرفيًا بمدخلات worklog الخاصة بها UX-IMPROVEMENTS-245 · UX-MINORS-244 · H1-2026-FIX-243 · ADMIN-DASH-246 · DASH-WAVE-247) وإعادة الصياغة في صفوف مضغوطة تحفظ الحقائق والإحالات
- STATE.md الجديد: صفوف 252 (المزامنة نفسها) + 251 + 250 + 248+249 مدمجًا مضافة، ترويسة آخر تحديث وقسم QA محدثان ببوابات كل فريم، أول «آخر كوميت متحقق منه» = 211695c2 (B-check) — حجم قبل/بعد: 31,829 → 26,973 بايت · 83 → 88 سطرًا (هامش ~5KB لفريمات التحسينات القادمة) — docs_audit ✓ EXIT=0
- صيانة .gitignore: /testing/ (لقطات التحقق الحي المحلية — نمط قسم Junk الموجود) لتظل خارج git status عمدًا
- عناوين مدخلات LIVE-VERIF الأربعة تحقق منها بحرفها من worklog قبل الاستشهاد بها في الصفوف

Stage Summary:
- التوثيق عاد متطابقًا مع الواقع المنفذ: STATE = 252 وفوقها كل المراحل بصفوف موثقة، والفجوة 248-251 مغلقة دون فقد أي حقيقة (الأرشفة بworklog لا الحذف)
- هامش البايت المستعاد (~5KB) مخصص لفريمات تنفيذ المتبقي القادمة بتعريفات STATE بنفس الفريم — تمريرة ضغط ثانية أجريت على صفوف 250/251/248+249 نفسها لتحقيق الهامش
- Commit SHA: this commit carries this entry
- Push status: pushed (74fe7549..8016b87a — [vercel skip] بلا نشر)

---
Task ID: STAFF-BELL-I18N-251-LIVE-VERIF-2026-09-22
Agent: Super Z (owner session)
Task: التحقق الحي E2E للمرحلة 251 (211695c2) — إثبات أن جرس الطاقم وجرس العضو يتكلمان لغة المشاهد على الإنتاج.

Work Log:
- النشر: /api/build-info = 211695c (~4 دقائق بعد الدفع)
- زرع صفّي اختبار مهيكلين بالحروف الحرفية عبر Management API SQL (new_ticket بحمولة {subject,high:true} موجّه للأدمن الأساسي + referral_commission بحمولة {amount_usd:10,source:subscription_initial} لعضو QA) — id مزدوجان موثقان بالاتجاهين
- جلسة عضو حية EN (qa.ux0922.member1): جرس العضو — «New commission! 🎉 / You earned $10 commission from a new subscription.» كتالوج كامل + الصف القديمة بلا حمولة «Subscription activated! / تم الموافقة على طلب اشتراكك (premium) لمدة 1 أشهر.» العنوان من كتالوج 250 والمتن حرفيًا كما خُزّن (قانون الصدق يحفظ حتى العيب النحوي الموروث) — لقطة 251-member-bell-en.png
- ترقية مؤقتة member1→admin (نمط 246) ثم إعادة العميل فورًا (returning موثق) — جرس الطاقم عبر GET /api/notifications/admin: الصف المزروعة «New support ticket / Subject: 251-staff-live-check — priority (coaching membership)» — العنوان والمتن إنجليزيان ولاحقة الأولوية تُرجم من حقل high المنطقي
- اللقطة نفسها أثبتت القانون المختلط على الصفوف القديمة: عناوين الأنواع الساكنة تُترجم بلا حمولة («New payment request» · «A new coach self-registered» · «New questionnaire to review») وأمتحتها حرفية عربية كما خُزّنت («طلب اشتراك premium لمدة 1 شهر») — القانون لكل حقل: title || row.title
- التنظيف: إعادة الدور client (returning) + حذف الصفين بشرط الحمولة (returning بid) — صفر بقايا بيانات · لقطات محلية فقط (testing/shots/251-*)

Stage Summary:
- المرحلة 251 مثبتة حيًا على الإنتاج بالجرسين: جرس الطاقم وجرس العضو يتكلمان لغة واجهة المشاهد من payload مهيكل، والصفوف القديمة تُعرض حرفيًا بصدق مع تعريب العناوين القابلة للتوطين
- Commit SHA: 211695c2 (الكود + مدخل التنفيذ) — هذا المدخل بكوميت التوثيق
- Push status: pushed

---
Task ID: STAFF-BELL-I18N-251-2026-09-22
Agent: Super Z (owner session)
Task: أمر المالك «ابدأ الخطوه التالية المقترحة ترجمة نصوص جرس الطاقم ثم ابحث عن اى مشاكل مشابهة لحلها» — الموجة 1: كتالوج جرس الطاقم (19 نوعًا) · الموجة 2: مسح المشاكل المشابهة → 12 نوع عضو خارج كتالوج 250.

Work Log:
- التحقق المسبق (لا تكرار): مزامنة origin/main (db767827) — 250 مغلقة بتحقق حي، وحدّها الموثق (جرس الطاقم حرفي) هو هذا الفريم
- جرد كامل لمواضع admin_notifications: 20 موضعًا (5 عميلية عبر POST + 15 سيرفر مباشر) و19 نوعًا — منها 3 أنواع بلواحق إزالة تكرار (refund_request/subscription_cancel_request/coach_page_pending:{uid}:{date})
- الموجة 1 — lib/notification-i18n.ts: ADMIN_CATALOG + localizeAdminNotification (مطابقة النوع الأساسي قبل «:» · قانون UGC: موضوع التذكرة ورد الدعم وسبب الرفض/العكس حرفيًا داخل القالب المترجم · فولباك صادق على مستوى المُدخل · $ لاتينية وأرقام لغة الواجهة · arMonthsPhrase يصلح «لمدة 1 شهر» في الجديد)
- قناة payload: createAdminNotification(+payload) → adminNotificationBodySchema (record optional) → POST يطهره (JSON ≤2000 وإلا {} — منع إساءة) ويخزنه — صفر ميجريشن (0093 سبق وأضاف العمودين)
- 14 موضع إنشاء مررت حقولًا مهيكلة (variant/qtype/tier/months/price_usd/subject/high/plan_type/name/email/coach_name/pkg_ar+en/ends_iso/amount_usd/method/source/reason/note/balance/provider/ended) — المواضع الساكنة (welcome/setup/reminder/approved + coach_support + pages/notify) بلا payload بحاجة
- AdminNotificationBell يعرض عبر الكتالوج — الأدمن والمدرب يقرأ كلٌّ بلغة واجهته من نفس الصف
- الموجة 2 — مسح كل مواضع notifications/createNotification: 12 نوع عضو كانت تكتب عربيًا خامًا بعد 250 (referral_commission ×2 · referral_commission_reversed · payout_paid/rejected · refund_approved/rejected · wallet_adjusted · wallet_topup_approved ×2 manual+paypal · wallet_topup_rejected · coach_ad_started · coach_support_reply/support_reply عنوانيًا) — أضيفت لكتالوج 250 بنفس القانون + payload في 12 موضعًا + friend_referral لمصدر الإحالة
- خارج القانون عمدًا: coach_message (بث المدرب UGC خالص — الفولباك الحرفي هو الصواب)
- البوابات: tsc 0 · eslint 0 (27 ملفًا ممسوسًا) · vitest 99 ملفًا/1670 (+38 اختبارًا) · next build ✓ · docs_audit ✓ · migration_audit ✓ صفر انحراف
- حدود الفريم (docs/STAFF-BELL-I18N-251-2026-09-22.md §4): الصفوف القديمة بلا payload تبقى حرفية (صدق) — التحسن اللغوي يبدأ من لحظة النشر · الحي-E2E بمدخل LIVE-VERIF مستقل

Stage Summary:
- جرس الطاقم يتكلم لغة المشاهد: أدمن EN يقرأ «New payment request — X requested the Premium plan for 2 months — $18.» وجرس العضو كمل — 31 نوع إشعار على المنصة (19 طاقم + 12 عضو) تعرض بلغة الواجهة من payload مهيكل، مع فولباك صادق لا يخمّن
- Commit SHA: 211695c2 (الكود + الوثيقة + مدخل التنفيذ)
- Push status: pushed (db767827..211695c2 — نشر تلقائي، التحقق الحي بمدخل LIVE-VERIF مستقل)

---
Task ID: NOTIF-I18N-250-LIVE-VERIF-2026-09-22
Agent: Super Z (owner session)
Task: التحقق الحي E2E للمرحلة 250 (562ed5be) — إثبات أن الإشعارات والأرقام تتكلم لغة المستخدم على الإنتاج.

Work Log:
- النشر: /api/build-info = 562ed5b (~3 دقائق بعد الدفع) · 0093 سبق تطبيقه على الإنتاج قبل الدفع (العمودان payload jsonb '{}' مثبتان بinformation_schema)
- زرع صف اختبار مهيكل (subscription_approved + payload {tier:premium, months:1}) لحساب QA ثم حذفه بعد الإثبات (returning موثق بالاتجاهين)
- جلسة عميل حية EN: الجرس يعرض «Subscription activated! — Your Premium subscription request was approved — 1 month.» + تاريخ إنجليزي Sep 22, 2026 — الصف القديمة بلا حمولة: العنوان من الكتالوج (لا يحتاج payload) والمتن حرفي كما خُزّن — الفولباك الصادق يعمل بالمشيتين
- المرآة العربية حية: «تمت الموافقة على طلب اشتراكك (بريميوم) لمدة شهر واحد.» — النحو مصحح (كان «1 أشهر») + التير معرّب + التاريخ ٢٢‏/٠٩‏/٢٠٢٦، ١٢:٠٦ م بأرقام هندية — والصف القديمة تُعرض حرفية «1 أشهر» كما كُتبت (قانون الصدق) بتاريخ هندي
- لوحة العضو العربية حية بالكامل: «٣٠ يوم متبقٍ» · «٢١ أكتوبر ٢٠٢٦» · «٨٤٫٥كجم» · خطط ٠/٢ · نتيجة ٥٠/١٠٠ · ٨٤٫٥/٢٨٫١/٢٦٫٧/٦٠٫٨ · مقاسات ٩٢/٩٨/٣٨ — نظام أرقام واحد على الشاشة (لقطة محفوظة)
- التنظيف: صف الاختبار حُذف (returning) — صفر بقايا بيانات

Stage Summary:
- المرحلة 250 مثبتة حيًا باللغتين: الإشعارات تتكلم لغة المستخدم بنحو عربي سليم، والأرقام/التواريخ بقانون موحد على كل الأسطح الممسوسة
- Commit SHA: 562ed5be (الكود + مدخل التنفيذ) — هذا المدخل بكوميت التوثيق
- Push status: pushed

---
Task ID: NOTIF-I18N-250-2026-09-22
Agent: Super Z (owner session)
Task: أمر المالك «ابدأ تنفيذ التحسينات، تأكد أولا من ما تم فيها حتى لا تعيد نفس العمل، افحص ما يمكن تحسينه» — المرحلة 250: الإشعارات تتكلم لغة المستخدم + قانون أرقام/تواريخ موحد على الأسطح الداخلية.

Work Log:
- التحقق المسبق (لا تكرار عمل): مزامنة origin/main (6c237d1f→3e039720) أثبتت أن كل القوائم الموثقة منفذة حيًا — 244 (M-2026+m-B/C/D/E) · 245 (§5 I-1..I-6، وI-7 مغطى جوهريًا بm-B) · 246 (بلاغ المالك الرباعي) · 247 (لوحة العضو) · 248/249 (صور المشاركة) — وفريم 249 تحقق حيًا مني: og:image على /exercises/tire-flip EN+AR = صورة التمرين الفعلية 0.webp
- جولة حية بجلسات أدوار حقيقية: زر الإيصال مثبت حيًا كأدمن مؤقت (/admin/payments → «عرض الإيصال» يفتح صورة الإيصال عبر /api/file، 200 محمّلة — أعيد المالك client فورًا بreturning) · جرس الأدمن يعرض تغذية الطاقم المفلترة (عزل 246 يعمل) · لوحة المدرب منظمة بأرقام هندية
- الفجوتان الحيتان المكتشفتان: (1) إشعارات النظام تُخزَّن بنص عربي خام فيقرأها عضو EN عربيًا + خطأ نحوي حي «لمدة 1 أشهر» (2) لوحة العضو والجرسان يفرضان أرقامًا لاتينية وتاريخًا أمريكيًا (toLocaleString بلا locale = حسب جهاز الزائر) داخل واجهة عربية — بينما ترويسة الموقع وداشبورد الأدمن يعروضان ٣٩/٣١: نظاما أرقام على شاشة واحدة
- الإصلاح بنمط قانون M1 (error-i18n) طبقة أعمق: جديد lib/notification-i18n.ts — كتالوج الأنواع المستقرة (subscription_approved/rejected/activated · plan_activated · questionnaire_status) يعيد العرض من payload مهيكل وقت العرض مع فولباك حرفي صادق (الصفوف القديمة وبثوث المدربين الحرة كما كُتبت لا تُمس) + arMonthsPhrase قانون الجمع العربي (1 شهر واحد · 2 شهرين · 3-10 أشهر · 11+ شهرًا بأرقام هندية) + enMonthsPhrase
- جديد lib/format-locale.ts (formatNumberFor/formatDateFor/formatDateTimeFor — ar→ar-EG أرقام هندية، en→en-US) طُبق على DashboardView (الأيام/تاريخ الانتهاء/الوزن والدلتا/عدّادا الخطط) وHealthMetricsDashboard (النتيجة المركبة/الوزن/الدهون/BMI/الكتلة الصافية/المقاسات الخمسة بإضافة lang لMeasurementCard/خط الأساس مقابل الحالي) والجرسين (التوقيتات) — العملة $ تبقى لاتينية عمدًا (قانون بلاطات المالية)
- 0093 (إضافي نقي — صفر RLS/backfill/توقيعات): payload jsonb default '{}' على notifications وadmin_notifications + أنواع Supabase المولّدة حدّثت للعمودين — مواضع الإنشاء الستة تمرر حقولًا مهيكلة (tier/months · reason · plan_type · qtype/status · months/end ISO · tier/months PayPal) والنص القديم يبقى المصدر عند الراحة — **الميجريشن طُبق على الإنتاج قبل الدفع** (Management API، تحقق information_schema: العمودان jsonb '{}' مثبتان)
- البوابات: tsc 0 · eslint 0 (الملفات الممسوسة) · vitest 98 ملفًا/1632 (+23 اختبارًا) · next build ✓ 2020/2020 · docs_audit ✓ · migration_audit ✓ صفر انحراف
- حدود الفريم (موثقة صدقًا في docs/NOTIF-I18N-250-2026-09-22.md §4): جرس الطاقم يبقى محتواه حرفيًا (نصوص حرة من ~12 موضعًا متعدد الأدوار — ترشيحه لكاتالوج كامل فريم مستقل بأمر ملكي) وتاريخه وحده صار بلغة الواجهة

Stage Summary:
- عضو EN يقرأ إشعارات النظام إنجليزيًا وعضو AR يقرأها عربيًا سليمة الجمع («شهر واحد» لا «1 أشهر») — والصفوف القديمة وبثوث المدربين تُعرض حرفيًا (فولباك صادق لا يخمّن)
- نظام أرقام واحد على الشاشة الواحدة: كل أرقام وتواريخ لوحة العضو والمؤشرات الصحية والجرسين تتكلم لغة الواجهة (٣٠ لا 30 داخل العربية)
- Commit SHA: this commit carries this entry
- Push status: pushed (نشر تلقائي — التحقق الحي بعد النشر بمدخل LIVE-VERIF مستقل)

---
Task ID: SOCIAL-OG-248-LIVE-VERIF-2026-09-22
Agent: Super Z (owner session)
Task: إصلاح بطاقات المشاركة الاجتماعية الزرقاء (بلا صورة) — «اجعل النشر يستخدم صورة الصفحة/المقال المنشور» + إثبات حي E2E.

Work Log:
- التشخيص الحي: og:image للمقالات كان مولّد /api/og-image البارد 1.7–5.2s (مُثبت: EN 5.23s · AR 1.69s) → زواحف واتساب/فيسبوك تتوقف بعد ~3s → بطاقة زرقاء بلا صورة؛ وs-maxage=3600 كان يعيد تعريض الزحف البارد كل ساعة
- الإصلاح (dff3decf): blog-server يبني shareImage مصدراً وحيداً — صورة featured الحقيقية بقصّ Pexels 1200×630 fm=jpeg (CDN <100ms، لا دالة باردة على مسار الزاحف)؛ المولّد احتياط للمقالات بلا صورة فقط؛ s-maxage 3600→86400؛ remote-image-size بارامتر format اختياري (الافتراضي webp — المتصلون الحاليون بلا تغيير)
- الاتساق: og:image = twitter:image = JSON-LD image كلها og.shareImage على المرايتين EN/AR (قانون §12.40 محفوظ)؛ قوانين محدّثة: og-image-coverage + P2-14 + hreflang mock
- التحقق: tsc ✓ · eslint ✓ · vitest 1610/1610 ✓ · نشر dff3decf READY (~40s بعد الدفع)
- إثبات حي: og:image = images.pexels.com/photos/17219736/...w=1200&h=630&fm=jpeg على EN وAR (بعد مسح كاش CF لنطاق alkemos.com — كان يخدم HTML بعمر 21 دقيقة قبله، cf-cache-status HIT/age:1257) · جلب الزاحف للصورة: 200 image/jpeg 89KB/0.51s · المولّد الاحتياطي: 200 PNG

Stage Summary:
- بطاقات المشاركة (واتساب/فيسبوك/X/تيليجرام) تعرض صورة المقال الحقيقية بدل المربع الأزرق — مثبت على الإنتاج
- الحالة الوحيدة المتبقية على المولّد: مقال بلا featured_image (أدفأ الآن — s-maxage يوم كامل + CF يوم)
- ملاحظة تشغيلية: واتساب/فيسبوك يخزّنون معاينات الروابط القديمة — المشاركة الجديدة تُحدّث البطاقة تلقائياً
---
Task ID: DASH-WAVE-247-LIVE-VERIF-2026-09-22
Agent: Super Z (owner session)
Task: التحقق الحي E2E للمرحلة 247 (92e0977d) — إثبات موجة التحسين المتبقية على الإنتاج بجلسات أدوار حقيقية.

Work Log:
- النشر: /api/build-info = 92e0977 (بعد ~3.5 دقيقة من الدفع) · جلسة عميل حية qa.ux0922.member1 على الإنتاج
- لوحة العضو حية EN: شارة «Premium + Active» على بلاطة الاشتراك + «30 days left» + «Renew ›» + تاريخ الانتهاء · شريط الانتباه **صامت صحيحًا** (30 يومًا > 14) · بلاطة Meal plans=0 بلا رابط «View plans» (قانون منع التكرار) وWorkout=2 بزرها · الإجراءات: «Log today's weight» الجديد + «View my plans» + «Support» — و«Complete questionnaires» **مخفية شرطيًا** (الاستبيانات مكتملة لهذا العضو)
- الربط العميق حي: نقرة «Log today's weight» ← هبوط /progress **والحوار مفتوح بالفعل** (Weight kg + Notes + Save) ← حفظ 84.5kg ← توست «Check-in saved» ← عودة الداشبورد: «LATEST WEIGHT 84.5kg» + **لوحة «Health indicators» ظهرت** (كانت لمدربه وحده)
- المرآة العربية حية: «الاشتراك · نشط · 30 يوم متبقٍ (المفتاح الرسمي لا الحرفي القديم) · تجديد › · عرض خططي › · المؤشرات الصحية · سجّل وزن اليوم › · الدعم ›»
- جلسة أدمن حية (ترقية مؤقتة qa.ux0922.member1 ← admin ثم **الإعادة إلى client** موثقة بreturning): /coach — العدّادات الكانونية ٣١/٩/٢/٠ بأرقام عربية + شريط الدفع **صامت عند صفر المعلق** (القانون الكانوني الجديد) + صفر أخطاء صفحة · /admin/payments تُحمّل بجلب all الثابت وتبويباتها سليمة · /admin «٤٤ إجمالي الحسابات منهم ٣١ عميل · ٩ مدرب» بلا شريط انتباه (صفر معلق — صمت صحيح)
- لقطات محلية فقط (testing/shots/247-*) · حد المنهج: إثبات اختلاف الرقم 2-vs-1 لشريط الدفع يتطلب عميلًا بطلبيْن معلقين معًا — الإصلاح بالكود موثق والشريط الكانوني مثبت حيًا بالصمت عند الصفر

Stage Summary:
- لوحة العضو بالمقاييس الجديدة حية باللغتين، والربط العميق يفتح حوار الوزن فعلًا، ولوحة الصحة وصلت للعضو — والعدّادات الكانونية والأشرطة الشرطية تعمل بصمتها الصحيح
- Commit SHA: 92e0977d (الكود + مدخل التنفيذ) — هذا المدخل بكوميت التوثيق
- Push status: pushed

---
Task ID: DASH-WAVE-247-2026-09-22
Agent: Super Z (owner session)
Task: أمر المالك «راجع خطة التنفيذ ثم ابدأ المتبقى من قائمة التحسينات» — المرحلة 247: موجة التحسين المتبقية فوق 246 — تنظيم لوحة العضو (العقل المتخلف عن دفعة 246) + إغلاق خريطة «مصدر واحد لكل رقم» و«صفر فشل صامت» على بقية الأسطح (تدقيق وكيلين متوازيين بأسطر مثبتة قبل أي تنفيذ).

Work Log:
- المراجعة المسبقة: كل القوائم الموثقة مغلقة (UX-TEST §5 السبع · M-2026 · m-A..m-E · H1-2026 · بلاغ 246 الرباعي) — «المتبقى» القابل للتنفيذ خارج §7 = لوحة العضو (تلقى زرًا واحدًا في 246) + بقايا الأدلة المثبتة بالتدقيق
- lib/subscription-view.ts نقيّتان (pickPrimarySubscription · daysLeftOn · effectiveSubStatus) + lib/weight-summary.ts + 13 اختبارًا — كان القانون مكتوبًا 4× (DashboardView ميت+حي · CoachClientView مرتين · getSubscriptionForClient مرتين محليًا) ودلتا الوزن 3× بلونين متناقضين (أخضر/برتقالي مقابل أزرق/رمادي)
- DashboardView معاد تنظيمه: شريط «يحتاج انتباهك» شرطي (اشتراك ≤14 يومًا · منتهي بلا نشط · استبيان needs_info — صمت عند الصفر بقانون الأدمن) · بلاطات صادقة (شارة نشط/منتهي فعليًا بدل «0 يوم متبقي» الكاذبة + أيام برتقالية ≤14 + رابط تجديد) · كارت «ابدأ من هنا» 3 خطوات بالبداية الأولى بدل ميتة «0 خطط» · إجراءات يومية (سجّل وزن اليوم بربط عميق يفتح الحوار · استبيانات شرطية · خططي · الدعم) بدل صدى الشريط الجانبي · HealthMetricsDashboard ديناميكي للعضو (ما كان لمدربه وحده) · هيكل تحميل هيكلي + حالة خطأ صادقة بزر إعادة (كان يصمت فراغًا) · MyCoachCard تحت الأرقام ونداء واتساب المشروط بالفعل
- CoachView: شريط الدفع المعلق للأدمن يقرأ getAdminClientsStats الكانوني (كان يعدّ صفوف الطلبات بينما الشارة/الداشبورد/صفحة العملاء تعدّ العملاء — عميل بطلبين يقول 2 مقابل 1) وحذف نداء listSubscriptionRequests الميت لغير الأدمن · عند فشل RPC الإحصائي: «…» صادقة + إعادة محاولة بدل عدّادات صفحة-25 متسوية بإجمالي · خطأ القائمة لا يهدّئ الجلسة لمسار N+1 (تفرقة missing عن error في getCoachClientListPaged — اتحاد مميز) · reassignClient يتكلم عند الفشل ويحدّث العدّادات عند النجاح · حالات فارغة واعية بالدور (لا نتائج ≠ لا عملاء · دعوة أول عميل للأدمن رابط السجل الموحد)
- الفشل الصامت المتبقي: جرس الأدمن try/catch/finally (كان يعلق «جاري التحميل» للأبد) · fallback تغذية الأدمن يصرخ console.error · PlansView زر ملف ميت ← توست · profile يقرأ error الاشتراك + ملاحظة أهلية استرداد متدهورة صادقة · شارة «بانتظار الدفع» بAdminPaymentsView من مجموعة all الثابتة (كانت تختفي بتبويب approved!) · عنوان صفحة المدربين من الكانوني (كان من صفحة ≤100) · دمج ClientWeightChart التوأم في WeightChart variant="client" · تصحيح تعليق AdminWalletsView (البروكسي لا التوقيع)
- i18n: 12 مفتاح dash.* + plans.openFailed باللغتين — نزع «يوم متبقي» و«الدعم» الحرفيين (الأول خالف المفتاح الرسمي «يوم متبقٍ») — CoachClientView/الأدمن يتشاركان العرض
- البوابات: tsc 0 · eslint 0 (تحذير root-shell قديم غير مرتبط) · vitest 97 ملفًا/1609 (+13) · next build ✓ 2020/2020 · صفر ميجريشن · صفر مساس §7 (middleware/auth/RLS/منطق الدفع/AI بلا ذراع)
- حد المنهج: الحي-E2E بعد النشر بمدخل LIVE-VERIF مستقل (عميل حي: شريط الانتباه + البلاطات + إجراء الوزن العميق · أدمن حي: الشريط والشارة رقمًا واحدًا)

Stage Summary:
- لوحة العضو بلغت لوحة الأدمن: أرقام أولًا، انتباه شرطي، مصدر واحد لكل رقم، صفر تكرار — و«بلا تكرار» صارت قانونًا مطبقًا على كل الأدوار لا الأدمن وحده
- كل حالة فشل متبقية تتكلم (توست/إعادة محاولة/«…» صادقة) — لا زر ميت ولا تعليق أبدٍ ولا تدهور صامت
- Commit SHA: this commit carries this entry
- Push status: pushed immediately after this entry

---
Task ID: ADMIN-DASH-246-LIVE-VERIF-2026-09-22
Agent: Super Z (owner session)
Task: التحقق الحي E2E للمرحلة 246 (f08d263a + المتمم 101a3559) بجلسة أدمن حقيقية — إثبات بنود بلاغ المالك الأربعة على الإنتاج.

Work Log:
- النشر: build-info = f08d263 ثم 101a355 · ترقية مؤقتة qa.ux0922.member1 → admin عبر Management API SQL (نمط Task-1) والإعادة إلى client بعد الفحص
- B1 حي: الداشبورد «44 Total accounts — 31 clients · 9 coaches» = SQL المباشر (44/31/9) = صفحة /admin/clients («Total accounts 44» · «All 44» · «Showing 1–25 of 44») — تطابق ثلاثي حرفي
- B4 حي: شريط «⏳ Payments awaiting review 2» ظهر (طلبان فعلًا) + المجموعات ACCOUNTS/SUBSCRIPTIONS/MONEY + DAILY ACTIONS — وخلال الفحص راجع المالك الطلبين بنفسه (اعتماد 22:53:33 + رفض 22:53:39 UTC موثق بreviewed_at) فاختفى الشريط وفاض الصف — اللوحة عكست الحقيقة لحظة بلحظة (اتساق ذاتي إضافي)
- B3 حي: الجرس الإداري يستدعي GET /api/notifications/admin → 200 بـ30 عنصرًا كلها target_coach_id ∈ (أدمن أو بث) — أنواع payment_request/new_coach/new_client (عملاء بلا مدرب)/questionnaire_submitted (fallback) — صفر pings مدربين خاصة
- B2 حي: نقرة «View receipt ›» الفعلية فتحت تبويبًا يعرض الصورة (400×260) على /api/file?bucket=receipts&path=3af6d0a7…/1790023418399-qa-ux0925-receipt.png (المسار المطبَّع) · الشكل الليجاسي receipts/1788126376316.pdf = 200 application/pdf · الجديد = 200 image/png — الطريق القديم كان سيفشل بالحالتين (بادئة مزدوجة + لا سياسة SELECT)
- المتمم 101a3559: شارة الشريط الجانبي صارت تقرأ getAdminClientsStats نفسه — اللقطة الحية أثناء الفحص أثبتت التعارض القديم (شارة 1 مقابل بطاقة 2 لطلب معلق بحساب مُرقّى)
- لقطات محلية فقط (local-only) · حد المنهج: اختبار تسرب الكوتشز عمليًا ينتظر أول طلب إعلان/شحن/صرف قادم — الإصلاح عند الإرسال موثق بالكود

Stage Summary:
- بنود البلاغ الأربعة مغلقة بإثبات حي: تطابق الأرقام (تعريفي) · زر الإيصال حي بالشكلين · جرس الأدمن معزول · لوحات معاد تنظيمها بلا تكرار — صفر ميجريشن وصفر مساس RLS
- Commit SHA: f08d263a + 101a3559
- Push status: pushed (f08d263a · 101a3559 على origin/main)

---
Task ID: ADMIN-DASH-246-2026-09-22
Agent: Super Z (owner session)
Task: بلاغ المالك «داشبورد الادمن يظهر عدد عملاء وصفحة جدول العملاء يظهر رقم اخر، طلبات الموافقة على الدفع زر الايصال لا يعمل، الاشعارات كلها تظهر للادمن (راجع أيضًا الاشعارات عند باقي الحسابات)، داش بورد الادمن محتاج اعاده تنظيم وتحسين وعدم تكرار — ابتكر أفضل حل يكون مريح ومنظم — كذلك داشبورد كل انواع الحسابات» — مرحلة 246: ثلاثة إصلاحات بجذور مثبتة + إعادة تنظيم اللوحات.

Work Log:
- استكشاف: وكيلان متوازيان (فاحصات admin + notifications/dashboards) — خريطة تكرار كاملة (عدّاد الدفع المعلق 5× · الإيراد reduce مكرر موضعين · الجرس بلا أي فلتر)
- B1 العدّاد: الداشبورد كان يقرأ get_coach_client_stats (role='client' حصرًا) بينما /admin/clients يقرأ get_admin_clients_stats (كل profiles) — الداشبورد الآن يستدعي RPC صفحة العملاء نفسه: بلاطة «إجمالي الحسابات» + تفصيل صادق (منهم عملاء · مدربون) — التطابق تعريفي لا تصادفي
- B2 الإيصال (ميت بفشلين متراكبين): DB يحمل receipts/<uid>/<file> بينما المفتاح داخل bucket هو <uid>/<file> (توقيع receipts/receipts/… = Not Found) + 0071 أسقطت سياسة SELECT على receipts بلا بديل (التوقيع من المتصفح ميت للجميع) + فشل صامت ({data} بلا error وif(url) بلا else) — الحل: قراءة عبر البروكسي المفوّض سلفًا /api/file (staff role≠client + service-role داخليًا — المسار الذي يرجعه /api/upload وكان يُرمى) — جديد lib/receipt-view.ts نقيتان (تطبيع Lيجاسي receipts/<file> والجديد receipts/<uid>/<file>) + إحلال في AdminPaymentsView/AdminWalletsView/CoachWalletView + حذف getReceiptSignedUrl + openReceipt متزامن (popup-safe) — شكل الكتابة لم يُمس (قانون receipt-ownership سليم)
- B3 إشعارات الأدمن: الجرس يقرأ admin_notifications بلا فلتر وRLS (0088) يمنح admin كل صفوف is_staff — بما فيها pings المدربين الخاصة — الحل بلا ميجريشن: جديد GET /api/notifications/admin (service-role بفلتر target_coach_id is null أو ∈ admin ids — adminFeedOrFilter نقية + getAdminIds/getPrimaryAdminId بnotifications-server) + listAdminNotificationsForAdmin + AdminNotificationBell واعٍ بالدور (الكوتش يبقى على RLS fetch) + markAdminNotificationsRead(ids) بمعرفات الظاهر حصرًا (كان يقرأ كل read=false فيمسح صفوف مدربين آخرين!) + إعادة توجيه 3 بثوث عامة للأدمن عند الإرسال (coach_ad/coach_support/payout_request — كانت تصل كل الكوتشز) + إصلاح misroute تذاكر الدعم (target_coach_id = auth.id معرف العميل! ← assigned coach ← fallback admin بنمط المسار العميلي)
- B4 اللوحات: داشبورد الأدمن معاد تنظيمه — شريط «يحتاج انتباهك» (الدفع المعلق + الصفحات) يظهر عند الازدحام حصرًا وصامت عند الصفر + KPI مصنفة ثلاث مجموعات (الحسابات/الاشتراكات/المالية) بمصدر واحد لكل رقم + مجاميع الإيراد بدالة نقية مشتركة sumSubscriptionRequestsByStatus (كانت مكررة موضعين) · CoachView: الإحصائيات الثلاث + شريط الطلبات المعلقة فوق النماذج القابلة للطي (كانت مدفونة تحتها — الأرقام أولًا) · داشبورد العضو: إجراء «الدعم» في السريع
- البوابات: tsc 0 · eslint 0 (تحذير root-shell قديم) · vitest 96 ملفًا/1593 (+14: receipt-view 7 · subscription-sums 4 · adminFeedOrFilter 3) · next build ✓ · docs_audit ✓ (ضغط صفوف 232-238 التاريخية لنمط Phase 235 — 28.9KB < 32KB) · migration_audit ✓ صفر انحراف — صفر ميجريشن — صفر متغير بيئة جديد
- حد المنهج: نقر «الإيصال» الفعلي بإيصال حقيقي معلق وقراءة الجرس بأدوار حية — مدخل LIVE-VERIF مستقل بعد النشر

Stage Summary:
- الأرقام أصبحت مصدر واحد لكل رقم: الداشبورد وجدول العملاء يتطابقان تعريفيًا، الإيراد دالة واحدة، شريط الانتباه بلا تكرار
- زر الإيصال حي عبر بروكسي مفوّض (لا توقيع متصفح ولا سياسة storage مطلوبة — صفر مساس RLS)
- الأدمن يرى إشعارات الأعمال الإدارية حصرًا، والكوتشز توقف تسرب 3 أنواع، والتذاكر تصب لمستلمها الصحيح
- Commit SHA: this commit carries this entry
- Push status: pushed immediately after this entry

---
Task ID: RECOVERY-OTP-TEMPLATE-APPLY-2026-09-22
Agent: Super Z (owner session)
Task: الخطوة الأخيرة لخيار OTP — المالك زوّد الجلسة بمفتاح Supabase شخصي (sbp_) فطُبّق قالب بريد Recovery ثنائي اللغة برمجيًا عبر Management API وتحقق بالقراءة العكسية — إغلاق كامل لمسار الرمز الرقمي.

Work Log:
- PAT صالح: GET /v1/projects أعاد مشروعًا واحدًا wyopqryzfjifyeyvyxfy (alkemos · eu-central-1 · org yqbxqgxoaijteqjmrsbb)
- GET config كشف القالب الحالي = الافتراضي الإنجليزي (254 حرفًا، {{ .ConfirmationURL }} فقط بلا {{ .Token }}) — تأكيد جذري لعدم ظهور الرمز سلفًا
- اكتشاف حاسم: mailer_otp_length = 8 بينما قانون التطبيق /^\d{6}$/ (recovery-otp.ts +11 اختبارًا) — الرمز الصحيح من 8 أرقام كان سيُرفض محليًا قبل أي verifyOtp؛ مواءم إلى 6 في نفس الـPATCH (otp_exp=3600 كما هو فيطابق نص «صالح لساعة»)
- PATCH واحد (scripts/apply-recovery-template.py — urllib فقط، بلا اعتماد جديد): mailer_templates_recovery_content = §2 حرفيًا + mailer_subjects_recovery ثنائي اللغة + أعلام custom_contents (subject/content) = true على نمط قالب الدعوة العربي
- تحقق قراءة عكسية فوري: GET بعد PATCH طابق القالب حرفيًا (طول + متغيرا القالب) وكل المفاتيح؛ الجيران سليمون (autoconfirm=false · external_email=true · قالب الدعوة العربية لم يُمس · SMTP Brevo كما هو) — النسخ المحلية في scripts/ خارج المستودع ومخفاة smtp_pass
- الإنتاج: build-info = 69d5661 (أحدث كوميت كود) · /auth/reset?mode=code = 200 بعلامات الشاشة (Recovery code · Enter your email · six) · /auth/reset = 200
- حد المنهج: قراءة صندوق بريد حقيقي غير ممكنة من الجلسة — الاختبار النهائي ببريد حقيقي (رمز صحيح ← جلسة ← كلمة مرور جديدة ← داشبورد) بيد المالك بخطوات §5 من التقرير

Stage Summary:
- خيار OTP مغلق من الطرفين: التطبيق (b53ad590 + 69d5661 منشور) + القالب المطبق والمتحقق — الذراعان (رابط + رمز) جاهزتان على الإنتاج، والرمز لا يعتمد على كوكي PKCE ولا نقرة رابط فيصمد لفاحصات روابط البريد عبر الأجهزة
- المالك: يطلب الاستعادة من أي متصفح ← رمز 6 أرقام في البريد بعنوان «رمز استعادة كلمة مرورك» ← يدخله من أي جهاز على /auth/reset?mode=code ← كلمة مرور جديدة ودخول مباشر
- Commit SHA: this commit carries this entry [vercel skip]
- Push status: pushed immediately after this entry

---
Task ID: RECOVERY-OTP-MODE-2026-09-22
Agent: Super Z (owner session)
Task: أمر المالك «نفذ خيار otp» 2026-09-22 — مسار استعادة بالرمز الرقمي لا يعتمد على كوكي PKCE ولا نقرة الرابط (يعمل من أي جهاز ويصمد لفاحصات روابط البريد) + القالب الجاهز للصق بيد المالك.

Work Log:
- /auth/reset صارت آلة حالات ثلاثية: failure (recovery_error=1) · code (جديد — بريد + رمز 6 أرقام عبر verifyOtp type=recovery، قابل للربط ?mode=code&email=) · form (تعيين كلمة المرور — يُعاد استخدامه بعد نجاح التحقق لأن الجلسة تُثبَّت في المتصفح الحالي بلا verifier وبلا نقرة رابط)
- نقاط الدخول: CTA ثانوي في حالة الفشل (المنقذ عبر الأجهزة) · رابط ثانوي في نموذج كلمة المرور («الرابط لا يعمل أو على جهاز آخر؟») · شاشة «أرسلنا رابط الاستعادة» في AuthView بصياغة شرطية صادقة + زر «لديك رمز في البريد؟ أدخله هنا» (البريد معبأ مسبقًا في الهدف)
- src/lib/recovery-otp.ts: normalizeOtpToken (الأرقام العربية ٠-٩ والشرقية ۰-۹ ← ASCII، إسقاط المسافات والشرطات) + isValidOtpToken (ستة أرقام حصرًا قبل أي نداء verifyOtp) — قانون سطح الإدخال الموحد +11 اختبارًا
- error-i18n: رسايل فشل verifyOتل تنضم لمجموعة M1 — واكتشاف حي مهم: رسالة gotrue الفعلية للكود الخاطئ «Token has expired or is invalid» (مثبتة بمتصفح حقيقي) تختلف عن «Email OTP has expired or is invalid» الموثقة — كلتاهما مدمجتان (+2 اختبارًا) — fix منفصل 69d56619
- البوابات: tsc 0 · eslint 0 · vitest 1579 (+14 عن 1565) · next build ✓ · صفر ميجريشن
- التحقق الحي بعد النشر (b53ad59 ثم 69d5661): شاشة الرمز EN والبريد معبأ ✓ · كود خاطئ EN ← توست GoTrue الخام (قانون EN: حرفية) ✓ · العربية: ١٢٣٤٥٦ (أرقام عربية!) ← رسالة «رمز الاستعادة غير صحيح أو انتهت صلاحيته — تأكد من الأرقام الستة، أو أعد إرسال رمز جديد.» ✓ · حالة الفشل ← CTA ← شاشة الرمز ✓
- حد المنهج: خطوة واحدة متبقية بيد المالك — قالب بريد Recovery في لوحة Supabase يجب أن يعرض {{ .Token }} (الرمز لا يظهر في القالب الافتراضي) — القالب ثنائي اللغة جاهز في docs/RECOVERY-OTP-MODE-2026-09-22.md §2؛ نجاح المسار الكامل (رمز صحيح ← جلسة ← كلمة مرور جديدة) يُختبر لحظة لصقه (نمط H1/I-2: نقرة البريد بيد المالك)

Stage Summary:
- مسار الاستعادة صار له ذراعان: الرابط (نفس المتصفح) + الرمز (أي متصفح/جهاز — يصمد لـSafeLinks) — كلاهما يهبط على شاشة تعيين كلمة المرور نفسها
- خطوة المالك الوحيدة: لصق القالب (دقيقتان — §2 من التقرير) أو تزويد الجلسة بمفتاح Supabase PAT (sbp_) لتنفيذه برمجيًا عبر Management API
- Commit SHA: b53ad590 + 69d56619
- Push status: pushed (84bdadd9..b53ad590..69d56619 على origin/main)

---
Task ID: RECOVERY-LINK-ERROR-FIX-2026-09-22
Agent: Super Z (owner session)
Task: بلاغ المالك الحي «جربت استعاده كلمة المرور وتم ارسال البريد وبداخلة الرابط وبعد الضغط على الرابط فتح الموقع مع رسالة خطاء» — تشخيص جذري + إصلاح + تحقق حي (كوميت 9f67731b).

Work Log:
- التشخيص المثبت حيًا قبل الإصلاح: GET /auth/callback?code=fake&next=/auth/reset على الإنتاج (741f2f3) رد 307 → /?auth_error=PKCE code verifier not found in storage… — أي أن فشل تبادل PKCE كان يرمي المستخدم على الرئيسية بنص GoTrue خام إنجليزي (توست AuthErrorToast) — وهو «رسالة الخطأ» التي رآها المالك
- الجذر: كوكي code-verifier يُكتب فقط في المتصفح الذي طلب الاستعادة؛ فتح الرابط من متصفح/تطبيق بريد مختلف (WebView)، أو استهلاك الكود لمرة واحدة (فاحص روابط البريد/نقرة مكررة)، أو انتهاء الصلاحية — كلها تُفشل التبادل وتصل الرئيسية بالسطح الخاطئ
- الإصلاح (9f67731b): src/lib/auth-callback-redirect.ts — جدول قرارات تحويل نقي (provider-error / missing-code / exchange-failure / success) كل فروع فشل الاستعادة تهبط /auth/reset?recovery_error=1 · /auth/callback/route.ts محوّل رفيع بترتيب الفروع نفسه ما قبل الإصلاح (سطح OAuth جوجل حرفيًا كما كان: /?auth_error=…) · /auth/reset يقرأ recovery_error ويعرض حالة صادقة AR/EN (الأسباب الثلاثة + نصيحة نفس المتصفح + CTA «ابدأ الاستعادة من جديد» → /auth?mode=login) — لا نصوص GoTrue خام (قانون M1)
- اختبارات +14 (auth-callback-redirect): فروع الاستعادة الأربعة · فروع OAuth الثلاثة حرفيًا · isRecoveryNext (المسارات الشبيهة/المعادية) · قانون safeNext يبقى حارسًا على next
- البوابات: tsc 0 · eslint 0 · vitest 94 ملفًا/1565 (+14) · next build ✓ · صفر ميجريشن
- التحقق الحي بعد النشر (9f67731): /auth/callback?code=fake&next=/auth/reset → 307 إلى /auth/reset?recovery_error=1 ✓ · /auth/callback?code=fake (OAuth) → 307 إلى /?auth_error=… كما هو ✓ · /auth/reset?recovery_error=1 = 200 ✓ · متصفح حقيقي: الحالة EN ثم AR كاملة النص (العنوان + الأسباب الثلاثة + بطاقة نفس المتصفح) + CTA يهبط /auth?mode=login و«نسيت كلمة المرور؟» ظاهرة ✓
- حد المنهج: قراءة صندوق بريد حقيقي ليست ممكنة من الجلسة — نقرة الرابط الحقيقي الأخيرة بيد المالك (نمط I-2 LIVE-VERIF)

Stage Summary:
- فشل رابط الاستعادة لم يعد يُخرج المستخدم من سياقه: هبوط صادق محلي الشكل على /auth/reset نفسها مع زر إعادة المحاولة ونصيحة «نفس المتصفح» — وسطح OAuth لم يتغير بايتًا
- خطوة المالك لإعادة الاختبار: اطلب الاستعادة من نفس المتصفح الذي ستفتح فيه البريد واضغط الرابط داخله؛ إن كان بريده المؤسسي يفحص الروابط مسبقًا (SafeLinks) فسيُستهلك الكود — الخيار الترقيوي الموثق: قالب بريد بكود OTP (يد لوحة Supabase — عرض متبقٍ على المالك)
- Commit SHA: 9f67731b
- Push status: pushed (9f67731b على origin/main — 48c13c18..9f67731b)

---
Task ID: UX-IMPROVEMENTS-LIVE-VERIF-2026-09-22
Agent: Super Z (owner session)
Task: التحقق الحي E2E لدفعة 245 (كوميت 741f2f3f) بعد اكتمال نشر Vercel — إثبات كل تحسين على الإنتاج بجلسات أدوار معزولة (≤40 سطرًا).

Work Log:
- النشر: /api/build-info → 741f2f3 · /auth/reset ترد 200 (مسار جديد) · /api/coach/clients/invite/resend ترد 401 بلا جلسة (مسار جديد محروس)
- I-1 حي: مدرب 0922 يدعو qa.ux0925.client1 ← توست النجاح + الصف يظهر بفلتر «Invite pending 0→1» ← زر «Resend invite» على الصف ← توست «Activation instructions re-sent to …» (200 — البريد عبر Brevo)
- I-2 حي EN+AR: نموذج الدخول يظهر «Forgot password?» ← شاشة الطلب (البريد محفوظ) ← الإرسال يهبط «Recovery link sent / أرسلنا رابط الاستعادة» ردًا موحدًا حتى لبريد غير موجود (مكافحة الاستكشاف) · شاشة «Account already exists» تظهر الزر الجديد «نسيت كلمة المرور؟ استعيدها من بريدك» ← يهبط شاشة الاستعادة والبريد محفوظ (qa.ux0924.client1) · /auth/reset مباشرة بلا جلسة استعادة: الإرسال يعرض الخطأ الصادق «انتهت صلاحية رابط الاستعادة…» (لا نص GoTrue خام) — وصول بريد الاستعادة الحقيقي إلى الصندوق يبقى بيد المالك (حد المنهج الموثق)
- I-3 حي: عضو جديد qa.ux0925.member1 يقدم طلب InstaPay (premium شهر + إيصال qa-ux0925-receipt.png) ← حالة النجاح تعرض: «Request sent successfully» + ORDER SUMMARY (Premium · 1 months · InstaPay · اسم الإيصال · $14.99) + WHAT HAPPENS NEXT? (مراجعة ≤24 ساعة · تفعيل تلقائي · إشعار واتساب بالرقم) + زر العودة — بلا أي تحويل تلقائي (ملاحظة: أول تحقق ظهر الحالة القديمة — كاش CDN لصفحة SSG؛ الكاش-باستر أثبت الجديدة)
- I-4 حي: توليد خطة تمرين لعضو 0925 (200) ← حقل الاسم يظهر معبأً «AI Workout Plan — 3 days» ← تعديل إلى «My 3-Day Starter Split» + «Save name» ← توست «Plan name updated» + إعادة تحميل: الحقل والـAPI يرجعان الاسم الجديد (hydration path أيضًا)
- I-6 حي: تسجيل مدرب جديد qa.ux0925.coach1 باسم «Ahmed QA Test» ← محرر /coach/landing يقترح السلاج «ahmed-qa-test» (وليس coach-<id6>)
- البند 5 حي (موجود سلفًا): درج EVO لعضو 0925 يعرض «plans this month (nutrition + workout): 0/2» + عدّاد الرسائل المتبقية — §12.6: لا تكرار واجهة، الإثبات يغلق البند
- ملاحظة تشغيلية: توليد وجبتان فشلا 422 «missed the required shape» قبل نجاح التمرين — المحاولات الفاشلة لم تخصم الرصيد (2/2 بقي) — تقلب سلسلة AI لا علاقة له بالدفعة
- الحسابات/البيانات المتبقية (نمط alkemos-test.com، الحذف متاح للمالك): qa.ux0925.coach1 (+صفحة غير منشورة) · qa.ux0925.member1 (+طلب اشتراك معلق + إيصال) · qa.ux0922.member1 (+طلب معلق ثانٍ + خطة تمرين معاد تسميتها) · qa.ux0925.client1 (دعوة معلقة) · qa.ux0925.recover1 (لا صف — ردود موحدة فقط)
- لقطات: شوتس3 المحلية (i1-resend · i2-×7 · i3-×2 · i4-×3 · i5) — local-only, not preserved

Stage Summary:
- دفعة 245 مثبتة حيًا E2E بندًا بندًا: I-1 · I-2 · I-3 · I-4 · I-6 + البند 5 مثبت موجود — قائمة UX-TEST-REPORT-2026-09-21 §5 السبع مغلقة كليًا بإثبات حي
- Commit SHA: this commit carries this entry
- Push status: pushed immediately after this entry

---
Task ID: UX-IMPROVEMENTS-245-2026-09-22
Agent: Super Z (owner session)
Task: أمر المالك «ابدأ التحسينات» 2026-09-22 — تنفيذ فرص التحسين المتبقية من UX-TEST-REPORT-2026-09-21 §5 (البند 7 أُغلق بm-B والبند 1 جزئيًا بm-C/0092 في 244): إعادة إرسال الدعوة (I-1) + استعادة كلمة المرور (I-2) + ملخص ما بعد الدفع اليدوي (I-3) + تسمية الخطط المولدة (I-4) + slug المدرب من الاسم (I-6) — البند 5 مثبت موجود سلفًا.

Work Log:
- I-1: جديد POST /api/coach/clients/invite/resend — بوابة الدعوة المعلقة حصرًا عبر isAdoptableInvitedUser نفسها (حد 243: invited_at + بلا أي دخول) — غير المعلق يرد 409 not_pending صادقًا · rate-limit ‏5/د/IP + 3/س/بريد (نمط send-email) · البريد بطاقة تعليمات ثنائية اللغة عبر Brevo نفسه بلا رابط GoTrue هش (المسار الصادق بعد H1 هو نموذج التسجيل الذي يتبنى الصف الظل فورًا) — صفر اعتماد خارجي جديد (§7) · CoachView: زر «إعادة إرسال الدعوة» بصف الدعوة المعلقة (stopPropagation + حالة لكل صف)
- I-2: «نسيت كلمة المرور؟» بثلاثة مواقع (نموذج الدخول + شاشة Account already exists + شاشة الطلب) — resetPasswordForEmail من العميل عبر import ديناميكي (قانون 182) بـredirectTo=/auth/callback?next=/auth/reset — تبادل الكود عبر مسار OAuth نفسه (نفس كوكيز PKCE، detectSessionInUrl=false لم تُمس) · جديد /auth/reset (مجموعة app): تعيين كلمة مرور جديدة (8+ + تطابق) عبر updateUser + رسالة صادقة لرابط منتهٍ/مستخدم · شاشة «أرسلنا رابط الاستعادة» الموحدة (مكافحة الاستكشاف — لا كشف وجود البريد)
- I-3: حالة نجاح الدفع اليدوي في CheckoutView صارت ملخصًا كاملًا: ملخص الطلب (الخطة/المدة/الطريقة/الإيصال/الإجمالي) + «ماذا بعد؟» بثلاث خطوات (مراجعة بحد أقصى 24 ساعة، تفعيل تلقائي عند الاعتماد، إشعار واتساب عند توفر الرقم) + إزالة التحويل التلقائي بعد 3 ثوانٍ (كان يخطف القارئ) — كل البيانات من حالة الصفحة القائمة، صفر نداء جديد
- I-4: memberPlanRenameBodySchema (planId سلسلة محدودة بقانون swap + title 3..120 بسقف save-evo) · member-edit mode:"rename" ببوابة ملكية service-role (نمط swap — العضو يعيد تسمية صفوفه حصرًا والعنوان فقط) · مسارا demo يرجعان saved:{planId,title} · صفحتا المولد: حقل اسم قابل للتحرير معبأ مسبقًا يظهر لحظة الحفظ (توليدًا أو hydration) + زر حفظ الاسم + توست
- I-6: coachSlugFromName في src/lib/slug.ts حصرًا (قانون السلاج الموحد — slugifyAscii ثم سقف 40 بلا شرطة ذيلية، ≥3 حروف، العربية "" عمدًا بلا تحويل لاتيني) · GET /api/coach/landing: سوجست أول مرة من اسم المدرب مع مشية تفرد محدودة (base→-2/-3/-4 ثم coach-<id6> القديم) — الصف الموجود يبقى كما هو والPUT يبقى الحارس
- البند 5 (حصة EVO داخل الدرج) مثبت سلفًا: عداد «خطط AI هذا الشهر» بالدرج (المرحلة 69) + عدّاد «رسائل متبقية اليوم» فوق المرسل + فقاعة تجاوز الحد — §12.6: لا تكرار واجهة؛ الإثبات الحي بمدخل LIVE-VERIF
- اختبارات +9: slug-law ‏+5 (الاشتقاق/سقف 40/العربية ""/المختلطة/كاناري استيراد وحدة السلاج) + validation-schemas ‏+4 (القبول والقص/الحدود/planId/الأشكال المرفوضة)
- البوابات: tsc 0 · eslint 0 (تحذير root-shell القديم غير المرتبط) · vitest 93 ملفًا/1551 (+9) · build ✓ 2020 صفحة (/auth/reset ظاهرة) · docs_audit ✓ · migration_audit ✓ صفر انحراف جديد
- صفر ميجريشن — كل البنود طبقة عرض/مسار API بلا مساس بالجداول أو RLS أو المال

Stage Summary:
- قائمة §5 «فرص التحسين» السبع مغلقة: I-1/I-2/I-3/I-4/I-6 منفذة + البند 7 مغلق بm-B (244) + جزء الحالة/الفلتر/العدّاد من البند 1 مغلق بm-C/0092 (244) + البند 5 مثبت موجود — الإثبات الحي بمدخل LIVE-VERIF بعد النشر
- I-2 يفتح أول مسار استعادة ذاتي للحساب على المنصة (مسار مصادقة — موثق SECURITY §9-15 بموافقة §7 من أمر «ابدأ التحسينات» وسمّ التقرير الصريح، سابقة 243 §9-13)
- البريد الجديد عبر حساب Brevo القائم — لا متغير بيئة جديد (BREVO_API_KEY/EMAIL_FROM موثقان سلفًا §3)
- Commit SHA: this commit carries this entry
- Push status: pushed immediately after this entry

---
Task ID: UX-MINORS-LIVE-VERIF-2026-09-22
Agent: Super Z (owner session)
Task: التحقق الحي E2E لدفعة 244 (كوميت 41c146a9) بعد اكتمال نشر Vercel وتطبيق 0092 — إثبات كل إصلاح على الإنتاج (≤40 سطرًا).

Work Log:
- النشر: /api/build-info → 41c146a · ميجريشن 0092 مطبق تلقائيًا بتكامل Supabase (pg_proc: الدالتان تحملان invite_pending)
- m-E حي: دخول بكلمة خاطئة → توست واحد حرفيًا؛ ثم 3 نقرات «Log in» متتالية سريعًا → ما زال توستًا واحدًا (كان يتراص اثنان)
- M-2026 حي: صفحة العميل EN (/coach/<id> Overview) — الفراغ: «Not enough data to show health indicators yet…» إنجليزيًا خالصًا + body عربي صفر (كان «لا توجد بيانات كافية…» خامًا) · المرآة AR: النص العربي ذاته مع dir=rtl · الوضع الكامل ببيانات: Weight/Body fat/Lean mass/Measurements (cm)/Baseline vs current + شارة BMI «Overweight» (25.9 مطابق لحاسبة الجولة 2) — arabicLeak=false
- m-C/m-D حي: مدرب يدعو qa.ux0924.client1 ← الصف يظهر فورًا بشارة «دعوة معلقة — لم يفعل بعد» بدل «بدون اشتراك» + فلتر «دعوات معلقة» 0→1 وعده الكلي 1→2 في نفس اللحظة دون إعادة تحميل (statsVersion) · الفلتر يعزل الصف المعلق حصرًا
- التبني يقلب المؤشر: العميل المدعو سجّل ← /dashboard فورًا (H1-243 سليم) + SQL: pw_empty=false وnever_signed_in=false · لوحة المدرب بعد التحميل: الشارة اختفت والفلتر عاد 0 و«بدون اشتراك» عادت صادقة
- m-B حي: استبيان 3 خطوات E2E كامل ببيانات جديدة ← الإرسال يهبط شاشة المراجعة «Your questionnaires are submitted» بقيم مقروءة وزر تعديل (كان: نموذج فارغ بعلامات Required)
- m-A حي: /admin/clients كأدمن ← النقر على جسم صف عميل ينتقل /coach/<id> (مؤكد مرتين) — الصفوف غير العملائية خاملة عمدًا (بوابة الدور) والنص موثق مطابق
- مساس كتابة واحد خارج واجهات المنتج: إعادة ضبط كلمة مرور qa.admin1431 (is_test_account=true، وسيلة 0050 — كلمتا الأرشيف Qa#Admin1431x وMH#AdminTest2026x كانا مرفوضين 400) — حساب اختباري معلم حصرًا
- الحسابات: qa.ux0924.client1 (جديد، مُتبنى) — الحذف متاح للمالك من /admin/accounts

Stage Summary:
- دفعة 244 مثبتة حيًا E2E بندًا بندًا: M-2026 · m-B · m-C · m-D · m-E + m-A مؤكد مطابق للتوثيق — قائمة UX-TEST-REPORT-2026-09-21 مغلقة بالكامل (H1-2026 في 243)
- 0092 حي: حالة الدعوة مرئية للمدرب من طبقة البيانات بمؤشر مشتق بولي — لا تسريب لأي عمود من auth.users
- Commit SHA: this commit carries this entry
- Push status: pushed immediately after this entry

---
Task ID: UX-MINORS-244-2026-09-22
Agent: Super Z (owner session)
Task: أمر المالك «ابدأ» 2026-09-22 — إغلاق بقية بنود UX-TEST-REPORT-2026-09-21 بعد إغلاق H1-2026 في 243: M-2026 + m-B + m-C + m-D + m-E (+ حسم m-A بالتحقق الحي) — ميجريشن 0092.

Work Log:
- جذر M-2026 أوسع من التقرير: `HealthMetricsDashboard` كله نصوص عربية مضمّنة (الترويسة، التسميات، الوحدات كجم، تواريخ ar-EG، حالات BMI داخل computeMetrics) — ليس رسالة الفراغ فقط. جديد `lib/health-metrics-i18n.ts`: قاموس EN/AR واحد + مفاتيح BMI مستقرة (underweight/normal/overweight/obese) + hmsLocale — المكوّن يستقبل `lang` من CoachClientView (قانون M1: اللغة عُرض لا منطق) — الحسابات والعتبات والألوان صفر مساس + 5 اختبارات تعاقد
- ميجريشن 0092 (additive فقط، التواقيع ثابتة، drop+create بنمط 0072): `get_coach_client_list_paged` +عمود invite_pending (au.encrypted_password='' وau.last_sign_in_at فارغ — قانون بوابة تبني H1-2026 حصرًا؛ يقلب false لحظة أي تفعيل/تسجيل/OAuth) + فلتر invite_pending · `get_coach_client_stats` +pending_invites — قراءة auth.users داخل security definer والمتسرب سطحًا بولي مشتق فقط — 0072 أساس النسخ حرفيًا (النسخ الحي وليس 0047 القديم) + منح authenticated معاد
- m-C واجهةً: شارة «دعوة معلقة — لم يفعل بعد» بدل «بدون اشتراك» للمدعو غير المفعّل + فلتر «دعوات معلقة» + toast الدعوة يطابق الحقيقة («يظهر هنا فور تفعيله حسابه») — types.ts وCoachClientStats بصفوف إضافية اختيارية
- جذر m-D مثبت: العدّادات تُحمّل مرة عند فتح اللوحة (deps=[]) فتتعارض مع قائمة تنعش — statsVersion: انتعاش القائمة+العدّادات معًا بعد الدعوة، وعند تحرك إجمالي العرض الافتراضي (tab=all·بلا بحث·صفحة 1 — محرس من الرفض الزائف أثناء البحث/الفلاتر، و totalCountRef يمنع ضربة التحميل الأولى)
- m-B: submitAll كانت setStep(1) بعد النجاح ← نموذج فارغ بعلامات Required تحت «Submitted» — الآن setStep(3): المراجعة ترويسة نجاح + القيم المقروءة + تعديل لكل قسم + مزامنة النماذج من صف الخادم المرتجع
- جذر m-E: loading يعطّل الزر بعد إعادة الرسم فقط — النقر المزدوج السريع (أو Enter مرتين) يفلت مرتين = نداءان وتوستا متطابقان (مطابق لملاحظة الجولة الثانية «في كل محاولات M1») — submitBusyRef قفل متزامن في submit وhandleGoogle + معرفات توست ثابتة auth-error/auth-ok (sonner يستبدل ولا يرص)
- m-A: النقر مربوط أصلًا بالكود على صفوف role=client حصرًا (المرحلة 143) — صفوف المدربين/الأدمن خاملة عمدًا (بوابة /coach/[clientId] تخدم clients فقط) — الاحتكاك المرصود غالبًا نقر صف مدرب؛ الحسم بالتحقق الحي بعد النشر
- البوابات: tsc 0 · eslint 0 · vitest 93 ملفًا/1542 (+5) · build ✓ · docs_audit ✓ · migration_audit ✓ صفر انحراف · stale-refs ✓ · ui-wiring ✓ — STATE مضغوط بحد 32KB (سابقة 235: صفّا 242/241 انضغطا — تاريخهما الكامل بworklog)

Stage Summary:
- خمسة بنود مغلقة كودًا (M-2026 · m-B · m-C · m-D · m-E) + m-A محسوم بالتحقق الحي — دفعة ما بعد H1-2026 كاملة
- 0092 يجعل حالة الدعوة مرئية للمدرب من طبقة البيانات — بوابة الأمان نفس قانون تبني H1 (لا يمكن أبدًا إعادة كتابة كلمة مرور حساب غير «دعوة معلقة»)
- الحي-E2E بعد النشر في مدخل LIVE-VERIF مستقل فور اكتمال deploy
- Commit SHA: this commit carries this entry
- Push status: pushed immediately after this entry

---
Task ID: H1-2026-FIX-LIVE-VERIF-2026-09-21
Agent: Super Z (owner session)
Task: التحقق الحي E2E لإصلاح H1-2026 (كوميت ff744b4c) بعد اكتمال نشر Vercel — إثبات أن المدعو يصل حسابه وأن الإنقاذ يعمل (≤40 سطرًا).

Work Log:
- النشر: /api/build-info انتقل إلى ff744b4 (poll خامس — النشر الحي يحمل الإصلاح)
- التدفق الحي (أدوات مستقلة، حسابات qa.ux0923.*): مدرب جديد (qa.ux0923.coach1) تسجيل ذاتي ← دعوة qa.ux0923.client3 (200 + توست) ← جلسة نظيفة سجلت بالبريد المدعو وكلمة مرور جديدة ← **/dashboard فورًا — «Welcome back, QA Invited Client Fix»** (قبل الإصلاح: «Account already exists» ← «Invalid login credentials» بلا مخرج)
- SQL القاطع على الحساب نفسه: pw_empty=false + signed_in=true + was_invited=true (الصف انتقل من دعوة معلقة إلى حساب مفعل بجلسة حية)
- الإنقاذ: الحساب المحشور من جولة الأمس qa.ux0922.client3 ← signup بالبريد نفسه ← تبنٍّ ← دخول /dashboard («Welcome back, QA Invited Client 3») + SQL: pw_empty=false + signed_in=true — qa.ux0921.client3 (الجولة الأولى) ما زال pw_empty=true وقابل للإنقاذ بنفس التدفق متى احتاج المالك
- إشعار المدرب: الجرس 2←3 ويدخل «عميل مدعو أكمل تفعيل حسابه! — عميلك المدعو QA Invited Client Fix (…) أكمل التسجيل»
- الحسابات الجديدة: qa.ux0923.coach1/.client3 (alkemos-test.com) — الحذف متاح للمالك من /admin/accounts

Stage Summary:
- H1-2026 مغلق ومثبت حيًا E2E: تسجيل المدعو = تفعيل فوري + جلسة + إشعار — صفر حصار، ورابط الإيميل بقي مسارًا بديلًا
- بوابة الأمان مثبتة عمليًا: حسابان ذاتيا التسجيل (member1 وcoach1) لم يُمسا، والإنقاذ اشتغل على الدعوتين المعلقتين حصرًا
- Commit SHA: this commit carries this entry
- Push status: pushed immediately after this entry

---
Task ID: H1-2026-FIX-243-2026-09-21
Agent: Super Z (owner session)
Task: أمر المالك «ابدأ تنفيذ الخطوة التالية» 2026-09-21 (الخطوة المعروضة: إصلاح H1-2026) — إغلاق طريق المسدود في تسجيل العميل المدعو («تفعيل عند التسجيل» — الحل 1 من تقرير UX-TEST-REPORT-2026-09-21 §3) — الموافقة §7 المسبقة على تغيير مسار المصادقة موثقة في SECURITY §9-13.

Work Log:
- التصميم من قاعدة الإنتاج أولاً: SQL قراءة-فقط على كلا المدعوين المحشورين (qa.ux0921/0922.client3): was_invited=true + never_signed_in=true + encrypted_password='' → بوابة `invited_at && !last_sign_in_at` عبر GoTrue admin getUserById كافية ومغلقة الأمان — **صفر ميجريشن** (سابقة M2: طبقة إشارة خالصة)
- جديد `src/app/api/auth/complete-invite/route.ts`: rate-limit ‏5/10د/IP (المخزن المشترك، نمط coachreg) · zod (emailSchema + password 8-128 + full_name≤120 + phone cleanPhone) · البوابة المزدوجة ثم updateUserById(password+email_confirm) + تحديث profiles (full_name/phone) بالمفتاح الرئيسي حصراً · رد موحد {ok:false} لكل غير القابل للتبني (مكافحة الاستكشاف) · صفر نداءات خارجية جديدة (HIBP بقي على العميل) · صفر مساس RLS/ميجريشنز/المال
- جديد `src/lib/auth-invite-adopt.ts`: البوابة النقية isAdoptableInvitedUser (تفشل مغلقة على أي حقل غائب) + requestInviteAdoption للعميل (تفشل مغلقة لأي خطأ شبكة ← شاشة M2 بلا انحدار)
- ربط `src/lib/data/auth.ts` signUpEmail: إشارة التكرار (M2) تجرب التبني أولاً ← signInWithPassword الطبيعي + fetchProfile + مسح كوكيز الإسناد + إشعار new_client للمدرب («عميلك المدعو أكمل التسجيل») ← غير القابل للتبني يرى شاشة «Account already exists» كما هي — AuthView صفر تغيير
- اختبارات: `src/lib/__tests__/auth-invite-adopt.test.ts` — 6 كاناري (السلبية الحاسمة: حساب ذاتي التسجيل/مفعّل لا تُمس كلمة مروره)
- البوابات: tsc 0 · eslint 0 (تحذير root-shell قديم غير مرتبط) · vitest 92/1537 (+6) · next build ✓ · docs_audit ✓ · migration_audit ✓ صفر انحراف — إصلاح TS واحد أثناء التنفيذ (نوع patch)
- التوثيق: STATE 243 (ترويسة + صف + QA) + SECURITY §9-13 (أثر الموافقة §7 + الثوابت) + هذا المدخل
- الحي-E2E بعد النشر (سيوثق في مدخل LIVE-VERIF مستقل فور اكتمال deploy): مدرب جديد يدعو بريداً جديداً ← جلسة نظيفة تسجل بالبريد المدعو ← دخول فوري للوحة

Stage Summary:
- H1-2026 مغلق: المدعو يسجل كأي زائر فيصل لحسابه فوراً — رابط الإيميل يبقى مساراً بديلاً والإسناد وقت الدعوة محفوظ
- الأثر الأمني محصور: بوابة مزدوجة تمنع إعادة كتابة كلمة مرور أي حساب غير «دعوة معلقة» — 6 اختبارات تثبتها
- Commit SHA: this commit carries this entry
- Push status: pushed immediately after this entry

---
Task ID: UX-VERIFY-ROUND2-2026-09-21
Agent: Super Z (owner session)
Task: أمر المالك «ابدأ التنفيذ» — جولة تحقق حية مستقلة فوق UX-TEST-REPORT-2026-09-21 (جلسة متصفح جديدة كليًا + SQL قراءة-فقط) وإعادة إثبات H1-2026 بأدلة طازجة.

Work Log:
- الزائر: الرئيسية EN كاملة بصفر أخطاء كونسول · BMI E2E (82kg/178cm → 25.9 · Overweight) · تبديل اللغة ينعكس الرابط + dir=rtl + محتوى عربي خالص · /ar/foods/chicken-breast «صدور دجاج» · موبايل 390px صفر تجاوز أفقي وفوتر 34 عنصرًا بأدنى هدف لمس 24px
- المصادقة: M1 حي بغتين («البريد الإلكتروني أو كلمة المرور غير صحيحة.» عربي داخل AR / «Invalid login credentials» إنجليزي داخل EN — GoTrue 400 مترجم) · m9 حي: qa.ux0922.member1 → /dashboard فورًا · لوحة العضو كاملة البطاقات
- المدرب: qa.ux0922.coach1 تسجيل ذاتي → /coach/landing · دعوة qa.ux0922.client3 (200 + توست) · جرس 2 إشعارًا خاصين
- H1-2026 أُعيد إنتاجه حيًا بالكامل بأدوات مستقلة: جلسة نظيفة سجلت بالبريد المدعو → «Account already exists — Sign in with your password» → الدخول بالكلمة المختارة → «Invalid login credentials» (400) → SQL القاطع: encrypted_password='' + last_sign_in_at=null + created_at بلحظة الدعوة + صف coach_assignments موجود
- ملاحظتان جديدتان خفيفتان: m-D تناقض عدّادات قائمة عملاء المدرب (Total=0 مقابل فلتر No subscription=1 مقابل صف ظاهر) + توست خطأ الدخول مكرر مرتين بنفس اللحظة
- التوثيق: docs/UX-TEST-VERIFICATION-ROUND2-2026-09-21.md + صف في docs/README بنفس الفريم (قانون §3.8 parity)
- البوابات (docs-only): الكوميت يحمل [vercel skip] وفق قانون §10.5-2(أ) — لا كود ولا ميجريشن ولا إعدادات

Stage Summary:
- نتائج تقرير 2026-09-21 صامدة تحت إعادة الفحص المستقل: 12/12 إصلاحًا حية + H1-2026 حي بدليل SQL قاطع — الحلول الثلاثة المقترحة قائمة
- حسابات اليوم: qa.ux0922.member1/.coach1/.client3 (alkemos-test.com) — الحذف متاح للمالك من /admin/accounts
- Commit SHA: this commit carries this entry
- Push status: pushed immediately after this entry

---
Task ID: UX-FULL-TEST-CLOSURE-2026-09-21
Agent: Super Z (owner session)
Task: إغلاق UX-FULL-TEST-2026-09-21 — تنفيذ الخطة كاملة (أمواج A–H) على الإنتاج الحي وتسليم التقرير.

Work Log:
- الزائر: 23 صفحة EN + 10 مرايا AR بمحتوى كامل وRTL · BMI E2E (26.8/Overweight/وزن مثالي) · تبديل اللغة يعكس الرابط · 404 مخصصة سليمة · صفر أخطاء كونسول
- التسجيل والدخول: تسجيل فوري → /dashboard · مؤشر قوة كلمة المرور حي · رسائل الأخطاء i18n سليمة بغتين (M1) · «Account already exists» شاشة صادقة (M2)
- العضو Free: استبيان 3 خطوات E2E بمراجعة مفهومة (m5) · توليد خطة AI حية وحفظ تلقائي · EVO يجيب ويكشف الحصص · check-in E2E · تذكرة دعم E2E · مسح EVO عند الخروج مؤكد (m3) · عدد الأدوات 8 (m4) · رسالة Premium للبدائل (m6)
- المدرب B2B: تسجيل ذاتي → landing editor → Publish → اعتماد الأدمن → صفحة عامة حية · دعوة عميل (200+إسناد) · جرس نظيف (C1) · محفظة وطلب شحن إيصال
- المال بالرصيد الوهمي حصرًا (صفر PayPal): طلب شحن 30$ → اعتماد الأدمن → تفعيل Coaching بـ6$ → خصم وledger (30→24) → العميل يرى «كوتشينج · 30 يوم · مفعّلة بواسطة مدربك» → swaps 6/6 · مسار الدفع اليدوي في checkout E2E بطلب حقيقي اعتمده الأدمن
- الأدمن: 17 صفحة ترندر · اعتماد المدفوعات («Subscription approved and activated!») · مراجعة صفحات المدربين · تحويل B2C كامل (Make site coach → roster → نص لوحة المدرب يتبدل) · دفتر 35 حسابًا بـ4 test accounts
- الموبايل @390px: الفوتر 32×32/24px (m1) · درج EVO 274px (m2)
- تعريب الأطعمة حي: food-search?lang=ar يرد nameAr · /ar/foods/chicken-breast «صدور دجاج»
- الاكتشاف الجديد الأهم (H1-2026 موثق بحسابين + SQL): دعوة المدرب تُنشئ صف auth بكلمة مرور فارغة → العميل المدعو يعلق بين «Account already exists» و«Invalid login credentials» بلا مخرج ذاتي — + M-2026 (خلط عربي خام بواجهة EN في صفحة عميل المدرب) + 3 بنود صغيرة + 7 فرص تحسين
- الحسابات: qa.ux0921.member1/.coach1/.client2/.client3 (جديدة) · qa.admin1431 (موجودة معلمة — أعيد ضبط كلمة مرورها بوسيلة 0050 لأن المؤرشفة قديمة) · صفر مساس ببيانات حقيقية · كل التحقق SQL قراءة-فقط عدا ذلك
- البوابات (docs-only): docs_audit ✓ — الكوميت [vercel skip]

Stage Summary:
- التقرير docs/UX-TEST-REPORT-2026-09-21.md + صفاه في docs/README (الخطة EXECUTED) بنفس الكوميت
- إصلاحات 09-18 كلها حية (12/12) — الاكتشاف الوحيد عالي الخطورة: H1-2026 (طريق مسدود للعميل المدعو) بالحلول الثلاثة المقترحة
- Commit SHA: this commit carries this entry
- Push status: pushed immediately after this entry

---
Task ID: UX-FULL-TEST-2026-09-21
Agent: Super Z (owner session)
Task: أمر المالك «ابدأ بعمل خطة تنفيذ ووثقها وادفعها، ثم ابدأ فى تنفيذها» — خطة اختبار UX شامل لكل أنواع الحسابات على الإنتاج الحي (برصيد وهمي حصرًا — PayPal وكل بوابات الدفع الحقيقية خارج النطاق بأمر المالك).

Work Log:
- استكشاف المصدر: STATE.md + DEVELOPER_GUIDE + تقرير UX السابق docs/DEEP-UX-AUDIT-REPORT-2026-09-18.md (المغلق بالمراحل 225–229) — مصفوفة الأدوار ثبتت من الكود: user_role enum (client/coach/admin) + المدرب B2C site بالتحويل الإداري + الاشتراكات بالتفعيل من محفظة المدرب
- كتابة docs/UX-TEST-PLAN-2026-09-21.md: هدف + علاقة بالتدقيقين السابقين + مصفوفة 6 أدوار (Guest · Free · Premium بالتفعيل · Coach B2B · Coach B2C · Admin) + أمواج تنفيذ A–H (الزائر EN+AR والموبايل · التسجيل والدخول · العضو المجاني · المدرب B2B · الرصيد الوهمي E2E · الأدمن · إعادة تحقق إصلاحات 09-18 · تغييرات 230–242) + قيود ملزمة (صفر كود، صفر دفع حقيقي، صفر مساس بيانات حقيقية، لا أسرار في الملفات) + تسليمات
- تسجيل الوثيقة في docs/README.md بنفس الفريم (قانون §3.8 parity)
- البوابات (docs-only): docs_audit ✓ (تغيير docs/ + worklog حي بصيغة §12.5.1 — لا tsc/build لغياب أي كود) · الكوميت يحمل [vercel skip] وفق قانون §10.5-2(أ)

Stage Summary:
- الخطة موثقة ومسجلة ومدفوعة — التنفيذ يبدأ فور الدفع بالموجات A→H على alkemos.com
- التسليم النهائي المتوقع: docs/UX-TEST-REPORT-2026-09-21.md + ملخص المحادثة (المشاكل · الحلول المطلوبة · فرص التحسين)
- Commit SHA: this commit carries this entry
- Push status: pushed immediately after this entry

---
Task ID: VERCEL-USAGE-6-2026-09-21
Agent: Super Z (owner session)
Task: أمر المالك «بالنسبة الى مشاكل deployment storage, production storage يجب ان تحل» — التحقق الحي النهائي + تأكيد Vercel الرسمي لسلوك العدّادين + تنفيذ §10.5-2(أ).

Work Log:
- التحقق الحي 11:22Z (run 35593698107 — push event بعد دمج PR #5): 3 نشرات فقط — KEEP production (17h) + fresh (0h) + حذف نشر 2d — deleted=1 failed=0؛ الموقع 200؛ أتمتة التنظيف (ساعة + push) خضراء بـ105 تشغيلًا
- تأكيد Vercel الرسمي (staff، community topic 49413، 2026-09-19): «The deployment storage resets every 30 days, at the start of the next period — your new usage will not be reflected immediately» → سلوك §10.3 (الحذف لا يُخصم فورًا) موثق من الجهة الأولى؛ القراءتان المعلقتان (22.5/10 و14.07/10) محاسبة دورة لا حالة فعلية
- تنفيذ §10.5-2(أ): قانون Deploy-skip في §10 — كوميت docs-only يحمل [vercel skip] فلا يُبنى نشر (كل بناء = +0.42GB deployment + +0.29GB functions فورًا على العدّادين) مع بقاء GitHub Actions يعمل (الرمز خاص بـVercel ولا يكتم workflow التنظيف كـ[skip ci]) + أمر Ignored Build Step الجاهز في §10 للحاجز الميكانيكي
- لا إعادة لمحاولة PATCH الاستبقاء (§10.2-3: مرفوض 400 على Hobby — إعداد مقفل) — §10.6 محفوظ: صفر كود موقع/ميجريشن/بناء في هذا الفريم
- البوابات (docs-only): docs_audit + مراجعة القوانين — لا tsc/build لغياب أي تغيير كود

Stage Summary:
- التخزين الفعلي محلول ومثبت: ~1.0–1.4GB فيزيائيًا منذ 09-18 (هامش >7× تحت السقفين) — والعدّادان يظهران محاسبة الدورة حتى إعادة تعيينها أو تسوية Vercel عبر التذكرة
- على المالك (3 خطوات جاهزة): تذكرة الدعم (§10.5-1 بأرقام اليوم + اقتباس الستاف من §10.7) · Ignored Build Step (أمر §10) · تدوير الأسرار (§10.5-3)
- Commit SHA: this commit carries this entry
- Push status: pushed immediately after this entry

---
Task ID: RECOVERY-OPS-CLOSURE-2026-09-20
Agent: Super Z (owner session)
Task: أمر المالك (الاستكمال): فحص BACKUP_REPO_TOKEN + التوكنات الميتة + مصير الحاويات الليجاسي الخمس + إغلاق التوثيق الحي.

Work Log:
- BACKUP_REPO_TOKEN (بند 2): الدليل الوظيفي الحي — db-backup 18/18 نجاحًا (2026-09-05←20، آخرها اليوم 10:00Z) وstorage-inventory 4/4 (آخرها 17:20Z) وكلاهما يدفع بBACKUP_REPO_TOKEN + أول نسخة ملفات (run 35528734912) نجحت به اليوم = التوكن صالح عمليًا الآن؛ فحص تاريخ الانتهاء لا مسار API له إطلاقًا (حد منصة GitHub) → خطوات واجهة مرشدة خطوة-بخطوة أُضيفت في RECOVERY-SECRETS-SOURCES §4 (بما فيها تعريف التوكن الصحيح بالإبداع/آخر استخدام وتحديث الـ secret عند انتهاء قريب) — لا قيمة توكن في أي ملف
- التوكنات الميتة (بند 3): أعيد إثبات موتهما حيًا اليوم — GitHub الأول 401 Bad credentials وVercel الأول 404 User not found — ومسارات السحب API معدومة من الأساس (GitHub: لا API لإدارة PATs المستخدم إطلاقًا؛ Vercel: ‎/v9/tokens و/v1/tokens غير موجودين بالتوكن الحي) → السحب قرار المالك بلوحتي GitHub/Vercel فقط (خطتا واجهة مرشدتان في SECRETS-SOURCES §4) — هما ميتان فلا خطر استخدامي، السحب نظافة صحية فقط
- الحاويات الليجاسي الخمس (بند 4): تحقيق قراءة-فقط بالأدلة — الخمس وُلدت دفعة واحدة 2026-08-02 · صفر كائنات (مستوى storage.objects مباشرة) · صفر سياسات RLS (0071 أسقط الليجاسي ولم يعوض) · مسح 88 عمودًا نصيًا/jsonb عبر كل جداول public عن أي مسار لأي منهن = صفر صف · plans.file_url ‏NULL في 14/14 صفًا (المسار الكودي الوحيد PlansView openFile ميت ثلاثيًا: الزر لا يظهر + createSignedUrl بلا سياسات مرفوض + لا رفع إطلاقًا لأي منهن) · ticket-attachments بلا أي عمود مرفقات في جداول التذاكر → RUNBOOK §5.2 جدول مصير لكل واحدة: الحذف آمن بصفر فقد (qr-codes أول المرشحين — الوحيدة العامة) لكن **لا حذف بلا أمر مالك** (قاعدة الأمر) — القناة عند القرار: ميجريشن idempotent واحد
- الإغلاق (بند 5): STATE بند المفتوح محدث بالكامل · RUNBOOK §5/5.1/5.2 حقيقة الحياة الحالية (10 باكتات/24 كائنًا/4.5MB منسوخة يوميًا وقابلة للاستعادة) · الخطة صفوف P0-3/P2-8/P2-10 حالة ما بعد التنفيذ · README المستودع الخاص وثق المخطط الجديد · Drill #2 موثق (الإطار السابق)

Stage Summary:
- أغلق: B4 كامل الطرفين (نسخ يومي + دريل استعادة مثبت) + فحص التوكن الوظيفي + إثبات التوكنين الميتين مجددًا + توثيق مصير الليجاسي الخمس
- المعلق على المالك (خارج قدرات الوكيل بلا استثناء): إعداد Mirror (3 خطوات) · قرار Hobby · فحص انتهاء BACKUP_REPO_TOKEN بواجهة GitHub · سحب التوكنين الميتين من اللوحتين · قرار حذف الليجاسي الخمس (إن شاء)
- Commit SHA: this commit carries this entry
- Push status: pushed immediately after this entry

---
Task ID: STORAGE-RESTORE-DRILL-2026-09-20
Agent: Super Z (owner session)
Task: Drill #2 (أمر المالك): إثبات أن نسخة ملفات Storage قابلة للاستعادة فعلًا — لا مجرد إنشائها.

Work Log:
- أول نسخة رسمية آلية: dispatch لـ storage-backup.yml على b62c1ca4 — run 35528734912 نجح ودفع storage-backups/2026-09-20 للمستودع الخاص (10 باكتات · 24 كائنًا · 4,738,252 بايت · failed=0 · byteMismatch=0) — تحقق مستقل عبر git trees API: 24 blob بمجموع 4,738,252 بايت حرفيًا + sha256 سليمة لكل كائن
- الدريل: dispatch لـ storage-restore-drill.yml — run 35528872482 نجح: dry-run (24/24 ok · extras=0) ← إنشاء restore-drill-1 خاصة ← رفع 24/24 (uploadFailed=0) ← قراءة راجعة sha256 24/24 مطابقة بايتًا ببايت ← تنظيف if:always() حذف 24 كائنًا والباكت
- تحقق ما بعد الدريل (SQL قراءة فقط): total_buckets=10 · drill_residue=0 · total_objects=24 (16/2/6) — الإنتاج لم يتغير بشيء
- README المستودع الخاص حُدّث (نفس اليوم): توثيق storage-backups/ + أداة الاستعادة + تحذير PII الأشد (صور مستخدمين) — آخر سطر قديم كان ينفي وجود ملفات ستوريج
- docs: تقرير RECOVERY-DRILL-2-STORAGE-REPORT-2026-09-20.md (S1–S8 + أوامر التكرار + الحدود المعروفة: نافذة 24 ساعة) + صف سجله في docs/README + RUNBOOK §5.1 أشار للتنفيذ الموثق + STATE (Drill #2 منفّذ) ضمن سقف البايتات

Stage Summary:
- B4 مغلق بطرفيه: الإنشاء الآلي اليومي موثق والاستعادة مثبتة عمليًا (24/24 رفعًا و24/24 تحققًا راجعًا حرفيًا) والإنتاج سليم بعد التمرين — نسخة لا تُستعاد ليست نسخة، وهذه تُستعاد
- Commit SHA: this commit carries this entry
- Push status: pushed immediately after this entry

---
Task ID: STORAGE-FILE-BACKUP-2026-09-20
Agent: Super Z (owner session)
Task: أمر المالك (الاستكمال من origin/main): آلية النسخ الاحتياطي الآلية لملفات Supabase Storage الفعلية — P0-3(ج) — بعزل تام عن خط النسخ القائم.

Work Log:
- scripts/storage-backup.mjs: تنزيل كل كائنات الباكتات العشر (نفس منطق النزول المُصلح بالجرد — مجلدات id:null) + بصمة sha256 لكل ملف + مطابقة الحجم مقابل ميتاداتا الـ API + سقوف صوتية (20K كائن/1GiB) + قانون سجلات: أعداد فقط بالنجاح، والمسارات في أسطر الفشل وحدها (قابلية التنقيح موثقة) + حارس مسارات (رفض ../ والمطلقة)
- scripts/storage-restore.mjs: أربعة أوضاع مقيّدة — dry-run افتراضيًا (بصمات القرص ضد المانيفست + كشف الباكتات الناقصة) · دريل (--execute --into-bucket restore-drill-* --create-bucket: رفع لباكت مؤقتة بمسار مسبوق باسم الباكت الأصل — لا تصادم عابر للباكتات — ثم قراءة راجعة sha256) · استعادة حقيقية (--confirm-original: ترفض الانطلاق إن نقصت باكت، upsert بنفس المسارات) · تنظيف (--delete-bucket يرفض أي اسم خارج ^restore-drill-)
- workflow جديدان: storage-backup.yml (يوميًا 06:00 UTC بعد 05:30/05/45 — بوابة فشل صوتي: لا يُرفع نسخ ناقص أبدًا) + storage-restore-drill.yml (تشغيل يدوي فقط: dry-run ثم استعادة لباكت restore-drill-<run> خاصة ثم تحقق راجع ثم حذف if:always()) — عزل تام عن db-backup/census (قانون الخطة) + PII: المستودع الخاص حصرًا، صفر artifacts
- فخ /scripts/* في .gitignore عولج بنفس الفريم (سابقة W2) — استثناءان للسكربتين الجديدتين
- تحقق حي محلي ضد الإنتاج (مفتاح service بالذاكرة فقط — لا قيمة في أي ملف): 10 باكتات · 24 كائنًا · 4,738,252 بايت · failed=0 · byteMismatch=0 · 24/24 مطابقة sha256 على القرص · dry-run نظيف (extras=0 بعد إصلاح خلل بادئة عدّ الملفات الزائدة داخل الجلسة قبل الرفع) · حارس الحذف رفض باكت إنتاج بالاسم (exit 2)
- docs: RUNBOOK §5.1 جديدة (الآلية/السلامة/الاستعادة/الدريل/الحدود المتبقية: نافذة ≤24 ساعة) + خطوة «استعادة ملفات Storage» في فحص ما بعد الاستعادة + تحديث سطر قيود الرأس + الخطة: صفوف P0-3/P2-8/P2-10 في خريطة §0 + تحديث قانون التنفيذ + سجل docs/README (صفّا runbook والخطة)
- STATE بند «المفتوح الآن» أُعيدت كتابته (إغلاق قرار النسخ + بقايا المالك الموثقة) داخل سقف 32K بايت الصلب

Stage Summary:
- B4 مغلق آليًا: كل ملفات الستوريج (24 كائنًا/4.5MB عبر 3 باكتات + 7 فارغات) صارت تُنسخ يوميًا ببصمة sha256 لكل ملف إلى المستودع الخاص — أول تشغيل رسمي عبر workflow_dispatch يوثَّق بإطار الدريل التالي
- البوابات: tsc 0 · eslint 0 · vitest 1531/1531 · build 2055/2055 · docs_audit/parity/migration/stale-refs ✓
- Commit SHA: this commit carries this entry
- Push status: pushed immediately after this entry

---
Task ID: STORAGE-CENSUS-FOLDER-FIX-2026-09-20
Agent: Super Z (owner session)
Task: دليل جديد ضد نتيجة W2 (جرد «صفر كائنات») — إصلاح عدّاد جرد Storage وإعادة القياس الرسمي.

Work Log:
- الدليل: جرد 2026-09-20 15:37Z قال صفر كائنات بينما SQL الحي 24 كائنًا — التشخيص بنداء الـ API نفسه الذي يستخدمه السكربت: المجلدات تعود بالشكل {name, id:null, metadata:null} فشرط النزول typeof id==='string' لا يتحقق أبدًا → العدّ لم ينزل تحت أي مجلد uid → صفر صامت لأي باكت ملفاتها داخل مجلدات (كل الباكتس بهذا النمط — ولهذا أخطأ الجرد الأول كله)
- الإصلاح: النزول بالبناء `${prefix}${name}/` مع تعليق يوثق شكل الاستجابة الحي المُقاس — حدود الحماية (MAX_DEPTH 6 · MAX_OBJECTS 50K · الصفحات 100) كما هي وقانون الخصوصية (أعداد وأحجام فقط) لم يُمس
- تحقق E2E محلي ضد الإنتاج (مفتاح service من الذاكرة فقط — لا قيمة مسجلة في أي ملف): 10 باكتات · 24 كائنًا · 4,738,252 بايت · failed=0 — مطابقة تامة لعدّاد SQL لكل باكت على حدة (16/2/6) — والجرد التقط واقع ما بعد الإغلاق: questionnaire-photos ‏public:false وباكت avatars الجديد حاضر
- أُعيد الجرد الرسمي عبر workflow_dispatch بعد الدفع — نتيجة التحقق توثق أدناه

Stage Summary:
- جرد W2 اليومي صادق الآن (كان يُرجع صفرًا لأي ملفات داخل مجلدات) — القياس الرسمي الأول الموثق بعد الإصلاح: 24 كائنًا / ‏4.5MB عبر 3 باكتات (coach-public 2.8MB · questionnaire-photos 1.5MB · receipts 244KB)
- Commit SHA: this commit carries this entry
- Push status: pushed immediately after this entry

---
Task ID: STORAGE-AVATAR-SPLIT-B-2026-09-20
Agent: Super Z (owner session)
Task: إغلاق البند الأمني العاجل من STATE — الفصل 2/2: قلب questionnaire-photos خاصة + إعادة كتابة الأفاتار الوحيد (ميجريشن 0091).

Work Log:
- الشرط الحاكم تحقق قبل الشحن: نشر 6295a99a ‏READY على Vercel (dpl_6Xn8) و0090 مطبق آليًا (schema_migrations + الباكت حية عامة + السياسات الثلاث live بالفحص) — فصفر نافذة كسر بين الكود الجديد والقلب
- فشل CI وحيد على 6295a99a: docs_audit I/last-updated-truth على SECURITY.md (الترويسة 09-18 والكوميت 09-20 — لا يظهر محليًا قبل الالتزام لأن الفحص يقارن بتاريخ آخر كوميت) ← أُصلح بـ d1cac70f
- ميجريشن 0091: قلب public=false (أخيرًا يطابق 0027 بعد 23 يومًا) + إعادة كتابة avatar_url الوحيد لصيغة /api/file الدائمة (regexp متحقق حيًا قبل الشحن: صف واحد مطابق وصيغة الناتج سليمة) — الكائن لم يُنقل (unoptimized: true ⇒ المتصفح يجلب بالكوكيز؛ صفر سياق مجهول لصورة عميل)
- دليل جديد استوجب فحصًا لاحقًا مستقلًا: جرد W2 قال «صفر كائنات» بينما SQL الحي 24 كائنًا — خلل عدّاد مؤكد بالتشخيص (مجلدات uid تعود بـid:null/metadata:null فشرط النزول typeof id==='string' لا يتحقق أبدًا) — إصلاح السكربت بإطار مستقل تالٍ
- docs: INDEX صف 0091 + الترويسة 0001→0091 · RUNBOOK صف questionnaire-photos مُغلق ✓ · STATE بنود المالك (إغلاق 6 + تصحيح واقعة 24 كائنًا في بند قرار النسخ)

Stage Summary:
- questionnaire-photos خاصة أخيرًا والأفاتارات في باكتها العام المخصص — البند الأمني العاجل مغلق بالكامل بالقناة القانونية (ميجريشنز تلقائية)
- Commit SHA: this commit carries this entry
- Push status: pushed immediately after this entry

---
Task ID: STORAGE-AVATAR-SPLIT-A-2026-09-20
Agent: Super Z (owner session)
Task: البند الأمني العاجل من STATE (فحص علنية questionnaire-photos المعلق على المالك) — الفصل 1/2: باكت avatars المخصص + تحويل مسار الأفاتار إليه.

Work Log:
- تحقيق حي قراءة-فقط (Supabase Management API + HTTP probes بلا أي مفتاح) لسبب العلنية: الباكت وُلد قبل 0027 (كائنان حيّان: 70B اختباري 2026-08-11 + أفاتار عميل 1.5MB 2026-08-18) فإدخال 0027 ‏ON CONFLICT DO NOTHING لم يقارب العلم الحي أبدًا؛ 0071 أبقاها عامة «بالتصميم» لمسار الأفاتار (getPublicUrl) — التعارض الجوهري: صنفا خصوصية في باكت واحد (صور أجسام حساسة بتصميم /api/file الخاص × أفاتارات عامة بالضرورة لظهورها في صفحات عامة للمدربين)
- الأثر الحي المقيس: كائنان فقط قابلان للجلب علنًا بدون أي مفتاح (HTTP: NoSuchKey على مسار وهمي = الباكت مُخدَّم علنًا) — لا صور استبيان في الستوريج إطلاقًا (إحصاء jsonb: مدخل data: URL واحد فقط)؛ متأثر فعلي واحد: بروفايل واحد avatar_url بصيغة public URL (يُعاد كتابته في 0091)
- ميجريشن 0090: باكت avatars عام (صور فقط 2MB = سقف بوابة العميل) + سياسات مالك avatars_owner_insert/update/delete بنمط 0071 + ON CONFLICT DO UPDATE (درس انجراف 0027: DO NOTHING أبقى العلنية 23 يومًا)
- كود: profile/page.tsx يرفع ويخدم الأفاتار من avatars (الاعتماد الوحيد على علنية questionnaire-photos في الكود كله — grep مثبت) — فشل الرفع قبل تطبيق 0090 يسقط أنيقًا لـdata URL fallback الموجود
- ترتيب الإطلاق الآمن: هذه الدفعة لا تقلب أي علم — 0091 (قلب private + إعادة كتابة الصف الوحيد) تُدفع فقط بعد READY نشر هذه الدفعة (صفر نافذة كسر)؛ dry-run حي للـregexp قبل الشحن: صف واحد مطابق وصيغة الناتج سليمة
- docs: INDEX صف 0090 · DEVELOPER_GUIDE قائمة الباكتس · TECH_REFERENCE §1.5 بند avatars · SECURITY.md فصل صنوف الخصوصية · RUNBOOK صف avatars (10 حاويات)

Stage Summary:
- الفصل 1/2: avatars حي بالتطبيق الآلي + مسار الأفاتار الجديد منشور — questionnaire-photos لم تُلمس بعد (تُغلق في 0091 بالفريم التالي)
- Commit SHA: this commit carries this entry
- Push status: pushed immediately after this entry

---
Task ID: EMERGENCY-RECOVERY-HARDENING-CLOSURE-2026-09-20
Agent: Super Z (owner session)
Task: إغلاق خطة تقوية الاستعادة — توثيق نتيجة تحقق W4 الحية + حالة الموجات النهائية + بنود المالك المفتوحة.

Work Log:
- تحقق fail-fast الحي للـ workflow الساكن (بعد كوميت bf46c2c0): تشغيل dispatch رقم 35521106368 → فشل متعمد مصمم بـ annotations الدقيقة الثلاثة (EXTERNAL_MIRROR_TOKEN is missing → Settings ▸ Secrets… · MIRROR_REMOTE_MAIN/BACKUPS is missing → Variables tab) + إحالة صريحة لدليل الإعداد — سلوك السكون مثبت كما وعدت الخطة
- الموجات المنفذة على origin/main: W0 تثبيت التقرير+الخطة (4d46e992) · W1 حزمة التوثيق المرجعي (a95db363) · W2 أتمتة الجرد + إصلاحا الفخين (b6cc8a4f · 9bcd5511 · 833f74b6) · W3 تقرير Drill #1 (cf45541f) · W4 تجهيز الـ Mirror (bf46c2c0)
- أدلة الإغلاق المقيسة: CI أخضر على كل الكوميتات · 5 نشرات إنتاجية READY (والتوثيقية الخالصة CANCELED عمدًا بـ ignoreCommand) · دخان حي 200 · جرد الـ 9 حاويات يعمل يوميًا
- STATE.md محدَّث بالحالة النهائية + قائمة بنود المالك السبعة المفتوحة

Stage Summary:
- كل ما هو قابل للتنفيذ داخل GitHub من خطة التقوية **منفَّذ ومتحقق منه** — لا بند آلي متبقٍ
- بنود المالك الموثقة (STATE + الخطة §0): إعداد الـ Mirror (3 خطوات) · قرار نسخ ملفات Storage · فحص BACKUP_REPO_TOKEN · قرار Hobby · سحب التوكنات الميتة · فحص علنية questionnaire-photos الأمني · مصير الحاويات الليجاسي
- Commit SHA: this commit carries this entry
- Push status: pushed immediately after this entry

---
Task ID: EXTERNAL-MIRROR-PREP-2026-09-20
Agent: Super Z (owner session)
Task: الموجة W4 من خطة تقوية الاستعادة — تجهيز P0-1 بالكامل دون إنشاء المرآة (التنفيذ الفعلي بقرار/توكن من المالك).

Work Log:
- scripts/external-mirror/mirror.sh: مرآة كاملة التاريخ لكل المراجع (--mirror) للمستودعين (العام + الخاص بالنسخ/PII) مع تحقق SHA إلزامي بعد كل دفع (exit 1 عند أي عدم تطابق) + رسائل وسائط إلزامية واضحة — قابل للتشغيل من جهاز المالك أو من الـ workflow
- .github/workflows/external-mirror.yml: أسبوعي (الأحد 06:00 UTC) + dispatch — **ساكن بتصميمه**: خطوة preflight تفشل بصوت عالٍ برسائل الإعداد الدقيقة الثلاث (سابقة vercel-cleanup) حتى يضيف المالك: Secret ‏EXTERNAL_MIRROR_TOKEN + Variable ‏MIRROR_REMOTE_MAIN/BACKUPS
- docs/RECOVERY-MIRROR-SETUP.md: دليل المالك لمرة واحدة (اختيار المزود · مستودعا وجهة خاصان إلزاميًا — قانون PII · توكن مدفوع محدود النطاق · الخطوات الثلاث في إعدادات المستودع · التحقق الأول · بديل cron المحلي · التراجع)
- .gitignore: استثناء `!/scripts/external-mirror/` + سطر التوثيق (تطبيق درس فخ /scripts/* من W2 استباقيًا)
- تحقق محلي: bash -n ✓ · YAML ✓ · اختبار غياب الوسائط → رسالة الخطأ الصحيحة + exit 1 ✓ · check-ignore نظيف ✓

Stage Summary:
- P0-1 جاهز للتشغيل بثلاث خطوات إعداد واحدة من المالك (موثقة في دليل الإعداد) — **لم تُنشأ أي مرآة** التزامًا بقيود الخطة
- تحقق الـ fail-fast الحي: dispatch واحد بعد الدفع — النتيجة توثق أدناه في سجل المتابعة
- Commit SHA: this commit carries this entry
- Push status: pushed immediately after this entry

---
Task ID: RECOVERY-DRILL-1-2026-09-20
Agent: Super Z (owner session)
Task: الموجة W3 من خطة تقوية الاستعادة — تنفيذ P1-6: Recovery Drill #1 غير المدمر + تقريره.

Work Log:
- D1–D2: استنساخ المستودع الخاص (قراءة فقط) + إثبات سلامة اللقطة 2026-09-20 برمجيًا: 53 جدولًا (38 غير فارغ + 15 فارغ) · 1121 صفًا = manifest بالضبط
- D3: db-restore dry-run بمتغيرات وهمية (صفر نداءات شبكية) → exit 0 · مجموع جولة أولى 1121 صفًا مطابق — مع توثيق تضاعف طباعة الجولة الثانية في الجاف
- D4–D5: migration_audit (صفر انحراف) + docs_audit/parity/stale-refs خضراء
- D6: بوابة الجودة الكاملة محليًا من HEAD: bun install --frozen-lockfile (680 حزمة · 4.2ث) · tsc صفر · eslint صفر · vitest **1531/1531** (Node) · next build exit 0 — درس موثق: علامة --bun تفشل 5 اختبارات (interop مع zod v4) — المرجع Node كالـ CI
- D7–D9: CI أخضر على كل كوميتات الجلسة · 4 نشرات إنتاجية READY على Vercel (والتوثيقي الخالص CANCELED عمدًا بـ ignoreCommand) · دخان حي: / و/sitemap.xml و/api/build-info = 200
- D10: دمج نتيجة جرد Storage الحي في الدليل: 9 حاويات تعد بنجاح — صفر كائنات (خطر B4 نظري حاليًا)
- docs/RECOVERY-DRILL-REPORT-2026-09-20.md: التقرير الكامل بالأوامر الحرفية للإعادة الشهرية + حدود غير المُثبت + الدروس

Stage Summary:
- Drill #1 يثبت سلسلة الاستعادة المقيسة كاملة: GitHub يبني وحده · البيانات قابلة للاستعادة · الإنتاج يعمل بكل تغييرات التقوية — خط الأساس موثق للتكرار الشهري
- غير المُثبت (بقرار خارجي): --apply على مشروع Supabase جديد · إعادة ربط دومينات Vercel جديد · قيم PayPal/GA/AdSense
- Commit SHA: this commit carries this entry
- Push status: pushed immediately after this entry

---
Task ID: STORAGE-INVENTORY-E2E-FIX-2026-09-20
Agent: Super Z (owner session)
Task: إصلاح متابعة W2 بعد أول تشغيل حي — فخان مكتشفان + تصحيح توثيق الحاويات بالحقيقة الحية.

Work Log:
- فخ 1 (كوميت b6cc8a4f): سطر `/scripts/*` في .gitignore ابتلع السكربت — الكوميت حمل الـ workflow فقط والتشغيل فشل بـ MODULE_NOT_FOUND (نفس فخ generate-og-cards.py الموثق Phase 188) → أُضيف استثناء `!/scripts/storage-inventory.mjs` + سطر التوثيق بالترويسة وفق العرف (كوميت 9bcd5511)
- فخ 2: مسار عدّ الكائنات كان `/storage/v1/list/{bucket}` والصحيح `/storage/v1/object/list/{bucket}` (404 Route not found على كل الحاويات) → أُصلح + إعادة اختبار مسار الفشل محليًا (JSON صحيح + exit 1)
- **اكتشاف بالجرد الحي:** المشروع يحوي **9 حاويات** لا 4 — خمس ليجاسي غير معرّفة في أي ميجريشن وغير مستخدمة في الكود الحالي (meal-plans · plan-pdfs · qr-codes [عام] · ticket-attachments · workout-plans) + **انحراف أمني علِّم للمالك: questionnaire-photos عامة (public:true) حيًّا رغم تعريفها خاصة في 0027** (صور فيزيائية لأعضاء = PII)
- docs/SUPABASE-FULL-RECOVERY-RUNBOOK.md §5 أُعيدت كتابته بالحقيقة الحية المقيسة (جدول 9 حاويات + الأعلام) — التزامًا بقانون تكافؤ التوثيق §3.8
- إعادة تشغيل dispatch ثالث بعد الإصلاح — النتيجة الحية موثقة أدناه في Stage Summary

Stage Summary:
- سباكة الجرد تعمل E2E (الملف يهبط في المستودع الخاص) — الإصلاحان يجعلان العدّ نفسه يعمل
- النتيجة الحية بعد الإصلاح (كوميت هذا الفريم): مسجلة أدناه مباشرة بعد التشغيل
- بند مالك جديد مكتشف: فحص علنية questionnaire-photos (قرار أمني) + مصير الحاويات الليجاسي الخمس
- Commit SHA: this commit carries this entry
- Push status: pushed immediately after this entry

---
Task ID: STORAGE-INVENTORY-AUTOMATION-2026-09-20
Agent: Super Z (owner session)
Task: الموجة W2 من خطة تقوية الاستعادة — تنفيذ P0-3(ب): جرد ميتاداتا يومي معزول لحاويات Supabase Storage (عدّادات وأحجام فقط — صفر أسماء ملفات).

Work Log:
- scripts/storage-inventory.mjs (جديد معزول): تعداد Buckets عبر Storage API بترقيم صفحات + تكرار داخل المجلدات (سقف عمق 6 وسقف أمان 50,000 كائن) — يكتب storage-inventory.json بـ {bucket, public, objectCount, totalBytes, truncated, ok, error} + إجماليات — قانون الخصوصية: عدادات وأحجام فقط مكتوبة أبدًا
- .github/workflows/storage-inventory.yml (جديد معزول): مجدول 05:45 UTC يوميًا (بعد نسخة 05:30) + dispatch — خطوة الجرد continue-on-error وخطوة الـ commit تتخطى نفسها إن لم يُنتج جرد — **عزل كامل عن db-backup.yml/db-backup.mjs (لم يُلمسا إطلاقًا)**
- الوجهة: musclehubeg-backups ▸ storage-inventory/YYYY-MM-DD/ (بجوار snapshots/ وليس داخلها) — بأسرار موجودة مسبقًا فقط (NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY قراءةً + BACKUP_REPO_TOKEN)
- تحقق محلي: node --check ✓ · YAML parse ✓ · اختبار مسار الفشل بمتغيرات وهمية → JSON صحيح مع listError وexit 1 (السلوك المصمم) — التحقيق E2E الحي بتشغيل dispatch موثق أدناه
- ملاحظة نشر: هذا الكوميت يلمس scripts/ + .github/ (مسارات مراقَبة) → نشر إنتاجي كامل متوقع من Vercel (التنظيف الساعي يمتصه كالمعتاد)

Stage Summary:
- رؤية يومية دائمة لما هو معرّض للفقدان في Storage (B4) حتى قرار المالك في نسخ الملفات الفعلية P0-3(ج)
- E2E: تشغيل workflow_dispatch بعد الدفع مباشرة — النتيجة موثقة في تعليق المتابعة أدنى (ملف الجرد يظهر في المستودع الخاص)
- Commit SHA: this commit carries this entry
- Push status: pushed immediately after this entry

---
Task ID: RECOVERY-REFERENCE-DOCS-2026-09-20
Agent: Super Z (owner session)
Task: الموجة W1 من خطة تقوية الاستعادة (docs/EMERGENCY-RECOVERY-HARDENING-PLAN-2026-09-20.md) — تنفيذ P0-2 + P0-4 + P1-5 + P2-7: حزمة التوثيق المرجعي للاستعادة.

Work Log:
- docs/RECOVERY-SECRETS-SOURCES.md (P0-2): مرجع مصادر كل متغير إنتاجي حي (لوحات المزودين/السر الذاتي/قاعدة Supabase) + قاعدة القراءة الآلية لأسرار Actions + جدول المتغيرات الميتة المقيسة (SUPABASE_JWT_SECRET وأخواتها + EVO_PARTNER_API_ENABLED المحظورة بحارس stale-refs) + جدول صلاحية التوكنات + قواعد التدوير — صفر قيم
- docs/SUPABASE-FULL-RECOVERY-RUNBOOK.md (P1-5 + P0-4 + P0-3أ/ج): مسار الاستعادة الكامل — تصنيف برمجي مولد: 41 تلقائيًا (تكامل) + 59 يدويًا بالترتيب مع أعلام البدائل الموثقة في INDEX.md (0019-0023 المدموجة · 0029B الفعالة · 0030/0030A-D) + db-restore جاف ثم --apply + جدول إعدادات Auth (§6.3 من التقرير) + جرد الـ Buckets الأربعة + تسلسل الفحص + القيود غير القابلة للاستعادة
- .env.example (P2-7 جزء B9): تفعيل EMAIL_REPLY_TO وEVO_FOLLOWUP_FROM وEVO_CRON_SECRET (الثلاثة مثبتة أصلًا في إنتاج Vercel) + توثيق اسم SUPABASE_URL البديل للسكربتات — بلا أي قيمة سرية
- DEVELOPER_GUIDE.md (P2-7): إصلاح انحراف B9 — مثال المنطقة sin1→fra1 في §10 وفق الحاكم vercel.json + تحديث الترويسة forward-only
- البروتوكول: صفّا سجل docs/README.md + هذا المدخل
- البوابات المحلية قبل الرفع: docs_audit ✓ · docs_parity ✓ · migration_audit ✓ · stale-refs ✓ + مسح أنماط الأسرار نظيف

Stage Summary:
- حزمة التوثيق المرجعي للاستعادة مكتملة: مصادر الأسرار + runbook استعادة Supabase الكامل — لا يحتاج أي صلاحية خارج GitHub
- المتبقي من الخطة: W2 (جرد Storage الآلي) · W3 (Drill #1) · W4 (تجهيز الـ Mirror) + بنود المالك الخمسة الموثقة في الخطة §0
- Commit SHA: this commit carries this entry
- Push status: pushed immediately after this entry

---
Task ID: EMERGENCY-RECOVERY-FOUNDATION-2026-09-20
Agent: Super Z (owner session)
Task: تثبيت تقرير تدقيق الاستعادة الطارئ + خطة التقوية على origin/main (أمر المالك 2026-09-20) — رفع التقرير كما هو دون أي تغيير في محتواه + خطة تنفيذ مبنية حصريًا على العوائق المُثبتة (B1–B9) بأولويات المالك المحددة.

Work Log:
- فحص قرائي شامل (صفر كتابة على أي خدمة): GitHub (المستودع/Actions/النسخ اليومية 16/16) · Vercel (المشروع/النشر/الدومينات/أسماء المتغيرات) · Supabase (الحالة/النسخ/Auth/Storage) · Cloudflare (المنطقة/DNS/الكاش) · الموقع الحي — كل الأدلة في ملحق أ من التقرير
- التقرير: docs/EMERGENCY-RECOVERY-AUDIT-2026-09-20.md (11 قسمًا) — الحكم: الاستعادة من خارج Vercel ممكنة (RTO 30–60 دقيقة) والعوائق B1–B9 موثقة بالخطورة والأدلة
- الخطة: docs/EMERGENCY-RECOVERY-HARDENING-PLAN-2026-09-20.md — بنود P0-1..P2-10 بخريطة ربط 1:1 للعوائق + موجات تنفيذ W0–W4 + حدود صارمة (لا أسرار · لا src/ · لا خدمات خارجية · لا Mirror فعلي)
- البروتوكول: صفّا سجل docs/README.md + هذا المدخل + سطر حالة واحد في STATE.md (الحد الأدنى الإلزامي لكلٍّ)
- البوابات المحلية قبل الرفع: docs_audit ✓ · docs_parity ✓ · migration_audit ✓ · stale-refs ✓

Stage Summary:
- التقرير مرفوع كما هو (بلا إعادة كتابة) + الخطة المعتمدة جاهزة للتنفيذ بموجات W1–W4 بأمر المالك نفسه
- المعلّق على المالك (موثق بالخطة §0): تنفيذ الـ Mirror الخارجي (مزود + توكن) · قرار نسخ ملفات Storage الفعلية · فحص صلاحية BACKUP_REPO_TOKEN (واجهة GitHub) · قرار خطة Hobby · سحب التوكنات الميتة
- Commit SHA: this commit carries this entry
- Push status: pushed immediately after this entry

---
Task ID: VERCEL-IGNORE-STEP-ACTIVATION-2026-09-20
Agent: Super Z (implementation session)
Task: تفعيل Vercel Ignored Build Step بأمر المالك 2026-09-20 «موافق على التنفيذ ابدأ» وفق خطة التفعيل المعتمدة من تقرير التحقق 2026-09-19 (محاكاة 151 دفعة: 66 SKIP / 85 BUILD / صفر نشرات مفقودة) — إضافة ignoreCommand إلى vercel.json + الاختبارات الحية A/B/C.

Work Log:
- فحص API قبل التنفيذ: v1/v9/v10/v11/v12 ترفض كتابة ignoreCommand (400 additional property) — vercel.json هو المسار البرمجي الموثّق الوحيد، بالأمر الحرفي المعتمد نفسه (انحراف موثّق عن «Dashboard» في الخطة؛ السبب والدليل: docs/VERCEL-IGNORE-STEP-ACTIVATION-2026-09-20.md §1)
- autoExposeSystemEnvars: كان مفعّلًا مسبقًا (لقطة API قبل التغيير) — خطوة 2 من الخطة مشبوعة دون أي لمس
- التفعيل: كوميت 3d8a6ad (vercel.json فقط) ← dpl_838w16Px **READY/PROMOTED** خلال ~47 ثانية — vercel.json صالح والأمر فعّال والبناء اكتمل (متوقع: vercel.json مسار مراقَب)
- اختبار A (هذا الكوميت — ملف docs/ + سجل docs/README.md + هذا المدخل، كلها داخل مجموعة الاستثناء): متوقع CANCELED خلال دقيقة
- اختبار B (الكوميت التالي — تعليق تافه في src/lib/utils.ts): متوقع بناء READY كامل
- اختبار C الحاسم (دفعة كوميتين معًا: كود ثم docs في القمة): متوقع READY — إثبات حي أن VERCEL_GIT_PREVIOUS_SHA يغطي الدفعات المتعددة (القاعدة الساذجة HEAD^ كانت ستضيّع نشرات كود — حالات الفجوة الخمس في تقرير التحقق)

Stage Summary:
- **الاختبارات الأربعة خضراء حيًّا في الإنتاج:** التفعيل 3d8a6ad ← READY/PROMOTED (dpl_838w16Px، ~47ث) · اختبار A docs-only e125dd9 ← **CANCELED** (dpl_2BDGNu9v، ~16ث) · اختبار B كود 642a706 ← READY/PROMOTED (dpl_DB2qWbG8، ~62ث — الأساس كان 3d8a6ad آخر ناجح وليس الملغى) · اختبار C الحاسم (دفعة كود+docs) 5acdd4d ← READY/PROMOTED (dpl_8Tx1g2UL، ~47ث) — القاعدة الساذجة كانت ستضيّع نشر src/lib/slug.ts
- **صفر نشرات مفقودة · شرط الإيقاف لم يُستثر** — الميزة فعّالة نهائيًا؛ التوفير المتوقع ~44% من الدفعات (docs-only تلغى تلقائيًا)
- السجل الكامل: docs/VERCEL-IGNORE-STEP-ACTIVATION-2026-09-20.md (القسمان 3 و5)

---
Task ID: FOOD-ARABIZATION-BATCH-3-2026-09-19
Agent: Super Z (owner session)
Task: Execute the food-arabization plan batch 3 (owner order 2026-09-19 «ابدأ دفعة ٣» — plan §8: one 500-1,000 batch, same laws as the pilot and phase 2: nameAr-only MSA, no slug/nameEn/numeric/category edits, no auto-tags, NO sitemap/indexing policy change, 80 curated + 8,830 slugs frozen) — implement, test, document, direct-push to main, verify remote+CI

Work Log:
- Selection: parsed the remaining 7,294 English-tail rows (after the cumulative 1,456 band), family census, then TWO-STAGE selection: (1) rule-based family groups with explicit exclusions (pork & derivatives · brands via ALL-CAPS detector on nameEn + explicit list · babyfood/infant-formula/alcohol · fast-food/restaurant/school-lunch/USDA-commodity · industrial oils · zero-Arab-demand exotics incl. seal/whale/bear/horse/moose/cisco/burbot/scup/wolffish/ling) and (2) a NEW semantic cut-dedupe for the meat grids — one representative per cut × meatpart × prep × bone with grade/trim/origin noise dropped (anti-thin-content per plan §3.5 risk 1), then part-priority caps for poultry → 953 slugs (within the ordered 500-1,000) across 94 families: protein 292 · carb 224 · snack 125 · vegetable 108 · fruit 64 · fat 52 · dairy 37 · nuts 36 · drink 15
- Selection discipline mid-execution: 3 tribal rows (Alaska Native/Navajo/Northern Plains) and 6 single-brand soup rows caught by the leak audit and REMOVED before translation; leak re-audit green across 7 patterns (pork/alcohol/baby/fastfood/alaska-native/exotic-species/caps-brands)
- Coverage sweep: full beef/organ sweep (كبدة/كلاوي/قلب/لسان/كرشة/رئة/طحال/بنكرياس/غدة التوتة — local + NZ-imported, distinguished) · beef cuts deduped (بريسكت طرفي السرة والمدبب/فلانك/ريب آي/ريش/تندرلوين/سيرلوين وتري تيب/سكيرت/عين الفخذ/كتف للطبخ/كورند بيف) · lamb (موزة أمامية وخلفية/ريش/كتف/تندرلوين/كفتة كباب/مخ) · veal (فخذ/ريش/موزة/سيرلوين/مفروم/أعضاء) · full chicken part grid (صدر/فخذ/ورك/دبابيس/جناح/ظهر/رقبة × مشوي/مقلي/مطهو × لحم فقط/بالجلد + كورنيش/ديك خصي/أحشاء/كبدة/جلد/أقدام) · turkey grid + مفروم 85/15 و93/7 وخالي الدهن · duck (بلدي/بري/بيكن/كبدة) · rabbit بلدي وبري · غزال · جاموس الماء · بيسون · remaining fish species (سلمون بستة أنواع/تروت/تونة/قداك/بولاك/هاليبوت/رنجة/ماكريل مملح/راهب/حليب/تايل) · mollusks (محار شرقي وهادئ/سكالوب/أخطبوط/سبيط/بطلين) · crustaceans (جمبري طازج/كابوريا/استاكوزا/كركند نهر) · non-pork sausages (سلامي بقري ورومي/فرانكفورتر/بولونيا/براتوورست/كيلباسا) · generic soups (كريمة الفطر/الدجاج/الكرفس/الهليون/دجاج بالأرز والنودلز/تشيلي/جامبو/مرق) · bakery (نان/شاباتي/باراثا/بيتا/ذرة/قمح منبت/شوفان/جلوتين فري/بيجل/مافن إنجليزي) · desserts (فودج/كراميل/هلاوة طحينية/تافي/مارشميلو/جيلي/حبوب جيلي) · beverages incl. whey-protein isolate + soy protein + espresso + energy drinks generic + عصائر برتقال وتفاح بكل الحالات · vegetables (فلفل/بروكلي/ملفوف بكل الأصناف/هليون/كرفس/مشروم شيتاكي وبورتابيلا وإنوكي/كيل/أوراق خردل/بامية/باذنجان/ذرة بيضاء وصفراء) · legumes (فاصوليا بـ11 نوعًا/فول أخضر بالقرنة/براعم ماش) · dairy (زبادي يوناني/حليب رايب ومكثف ومجفف/جبن بارميزان وماعز/مارجرين/مايونيز) · oils (لوز/زبدة كاكاو/خردل/خشخاش/ليسيثين) · flours (متعدد الأغراض/صناعي 10-13%/ذرة/سميد) · snacks (شيبس ذرة/فشار/بارات جرانولا/سناكس شرقية)
- Translation: 953 MSA names authored in-session (avg 27.6 chars vs 49.5 for the English originals — 44% compression; culinary terms كرشة/موزة/هلاوة/سبيط/بطلين/فريكة/جامبو/أروغولا), validated fail-closed BEFORE injection: non-empty · Arabic · ZERO Latin · differs from nameEn · 2-80 chars · no CJK · unique · every slug exists · ZERO collision with all 1,536 existing Arabic names — round 1 REJECTED with 20 violations (5 imported-organ duplicates with local twins · جرجير vs existing watercress · 2 rib-variant collisions · portabella-UV twins · unenriched rice/noodles twins · cornmeal vs corn-flour · orange-juice-raw vs curated · 1 batch-internal dupe) — all 20 fixed by honest distinguishing (مستورد/بالدهن/غير مدعم/صنف سيليكت/معرض للأشعة البنفسجية/طازج معصور/كل الأنواع) and re-validated GREEN
- Injection: idempotent slug-anchored replacement (953/953) — post-parse: 8,830/80/8,750 intact · curated-80 hash IDENTICAL (e12bcb26…) · 8,830-slug order hash IDENTICAL (0b2c0ac2…) · every non-target field byte-identical · zero collateral edits (verified against every one of the 8,830 rows) · foods.ts +1,662 bytes ONLY (3,730,216 → 3,731,878 — Arabic names are 44% shorter in chars despite 2-byte UTF-8)
- Band: seo-food-band.ts rebuilt from the pristine git-HEAD Phase-1+2 set ∪ batch 3 → cumulative 2,409 slugs in FOODS order (481 + 975 + 953), header doc extended to Phase 3
- Guards updated (existing quality gate, no new workflows): foods-ar-purity — cumulative band law 1,482-3,481 (pilot + two 500-1,000 batches), nameEn freeze re-pinned d0b5b15d… on 2,409 (vitest-computed), Phase-1/2 canaries kept, +18 Phase-3 canaries (أرنب بلدي/جاموس الماء/كرشة بقري/لسان مستورد/جناح دجاج مقلي/صدر رومي تجزئة/سلمون وردي معلب/أخطبوط/جمبري طازج/شوربة كريمة الفطر/برجر رومي 93-7/نان قمح كامل/هلاوة طحينية/صنوبر/بروتين مصل اللبن/زبادي يوناني فراولة/عصير برتقال طازج/أروغولا) · foods-sitemap-policy — tail-outside-band fact (6,341 rows, 0 Arabic, threshold >6,000), band floor ≥1,482, PILOT-HOLD canary untouched · food-search-lang — unchanged, green
- Deliberately NOT done per owner constraints: sitemap-foods.xml untouched (tags>0 only, 160 URLs — wiring stays a separate owner-gated frame) · tags stay [] · EVO untouched · defaultServingAr stays "100g" · ?lang contract untouched
- Docs: docs/FOOD-ARABIZATION-BATCH-3-REPORT-2026-09-19.md (execution report) + registry row + plan status line + README band wording (batch-expanded, number-law safe) + STATE (Phase 242) + this entry
- Verification (§3.5 full): tsc 0 · eslint 0 · vitest 91 files / 1531 tests GREEN (+1 canary block) · next build ✓ 2055/2055 · docs_audit 0 violations · docs_parity ✓ · migration_audit zero new drift · stale-refs ✓

Stage Summary:
- Band 2,409 cumulative (481+975+953): every /ar/foods mirror of the batch flipped to index,follow automatically via the existing arabiclessName regex (Arabic indexable pages now 2,489); EVO/search Arabic reach 17.4%→28.2%; JSON-LD Arabic for the batch
- All plan guards extended to the cumulative band; curated-80/slug-identity/nameEn frozen by hash; sitemap policy still HELD and guarded; the semantic cut-dedupe keeps the meat grid thin-content-free (one page per cut×prep×part)
- Remaining English tail outside the band: 6,341 rows (mostly brands/pork/babyfood/US-native rows outside legitimate arabization scope by design)
- Commit SHA: b782d51dd60b0a2c44df4f224d253505c88e16c4 (main; dd5d72ff→b782d51d, owner-bypass direct push, verified SYNCED)
- Push status: PUSHED — remote CI on b782d51d all green: quality ✓ · parity ✓ · guard ✓ · cleanup ✓ · Supabase Preview ✓ (polled via API to completion)

---
Task ID: FOOD-ARABIZATION-EXPANSION-2-2026-09-19
Agent: Super Z (owner session)
Task: Execute the food-arabization plan Phase 2 expansion (owner order 2026-09-19 «ابدأ تنفيذ التوسع للمرحلة الثانية» — plan §8: one 500-1,000 batch, same laws as the pilot: nameAr-only MSA, no slug/nameEn/numeric/category edits, no auto-tags, NO sitemap/indexing policy change, 80 curated + 8,830 slugs frozen) — implement, test, document, direct-push to main, verify remote+CI

Work Log:
- Selection: parsed the remaining 8,269 English-tail rows, family census, rule-based selection with explicit caps + a 105-slug PROTECTED set of Egyptian/Arabic essentials (medjool, quince, grape leaves, roselle, tamarind, purslane, taro, cardamom, saffron, fenugreek, grouper, whiting, rice pudding, coconut milk…) + balanced priority trim → 975 slugs (within the ordered 500-1,000)
- Selection discipline: ZERO pork & derivatives (lard/bacon/salami…), ZERO brands (fast-food/cereal/soup dynasties + Uncle Ben's & Zespri caught mid-execution and excluded), ZERO babyfood/infant-formula/alcohol/US-native-tribal, obscure North-American freshwater species skipped; category spread: veg 315 · protein 193 · carb 142 · fruit 121 · snack 74 · dairy 38 · nuts 36 · fat 28 · drink 28
- Translation: 975 MSA names authored in-session (avg 23.2 chars, culinary terms مجهول/كركديه/بربيين/كولقاس/هامور/موسى/ناجل), validated fail-closed BEFORE injection: non-empty · Arabic · ZERO Latin · differs from nameEn · 2-80 chars · no CJK · unique · every slug in selection · zero collision with pilot/curated names (one self-collision class fixed during re-runs)
- Injection: idempotent slug-anchored replacement (975/975; one dropped-in-revision row reverted byte-exact to English before final run) — post-parse: 8,830/80/8,750 intact · curated-80 hash IDENTICAL · 8,830-slug order hash IDENTICAL (0b2c0ac2…) · every non-target field byte-identical · foods.ts +8.1KB
- Band: seo-food-band.ts rebuilt from the pristine Phase-1 git-HEAD set ∪ new batch → cumulative 1,456 slugs in FOODS order (481 pilot + 975)
- Guards updated (existing quality gate, no new workflows): foods-ar-purity — cumulative band law 981-1,481, nameEn freeze re-pinned f657cab4… (vitest-computed), pilot canaries kept, +16 Phase-2 canaries (بلح مجهول/سفرجل/ورق عنب/كركديه/هيل/زعفران/حلبة/هامور/ميرلان/يقطين/رجلة/أرز باللبن/سلق/حليب جوز الهند/كانولا/تمر هندي) · foods-sitemap-policy — tail-outside-band-English fact (7,294 rows, 0 Arabic, threshold >7,000), band floor ≥981, PILOT-HOLD canary untouched · food-search-lang — unchanged, green
- Deliberately NOT done per owner constraints: sitemap-foods.xml untouched (tags>0 only, 160 URLs — wiring stays a separate owner-gated frame) · tags stay [] · EVO untouched · defaultServingAr stays "100g" · ?lang contract untouched
- Docs: docs/FOOD-ARABIZATION-PHASE-2-REPORT-2026-09-19.md (execution report) + registry row + plan status line updated + STATE (Phase 241) + this entry
- Verification (§3.5 full): tsc 0 · eslint 0 · vitest 91 files / 1530 tests GREEN (+1) · next build ✓ 2055/2055 · docs_audit 0 violations · docs_parity ✓ · migration_audit zero new drift · stale-refs ✓

Stage Summary:
- Band 1,456 cumulative (481+975): every /ar/foods mirror of the batch flipped to index,follow automatically via the existing arabiclessName regex (2,912 EN+AR indexable); EVO/search Arabic reach 6.4%→17.4%; JSON-LD Arabic for the batch
- All plan guards extended to the cumulative band; curated-80/slug-identity/nameEn frozen by hash; sitemap policy still HELD and guarded
- Commit SHA: 7f06086651b8ecd53d63fd2745a188031b86cf05 (main; 04a41ed8→7f060866, owner-bypass direct push, verified SYNCED)
- Push status: PUSHED — remote CI on 7f060866 all green: quality ✓ · parity ✓ · guard ✓ · cleanup ✓ · Supabase Preview ✓ (polled via API to completion)

---
Task ID: FOOD-ARABIZATION-PILOT-1-2026-09-19
Agent: Super Z (owner session)
Task: Execute the approved food-arabization plan Phase 1 pilot (owner order 2026-09-19: 300-500 USDA foods, nameAr-only MSA quality, no slug/nameEn/numeric edits, no auto-tags, plan validation gates, fix Arabic search only per plan, NO final sitemap/indexing policy change before pilot-quality verification, 80 curated untouched) — implement, test, document, direct-push to main, verify remote+CI

Work Log:
- Band selection: parsed foods.ts (8,830 = 80 curated + 8,750 tail), family census, then hand-curated 481 Egyptian/Arabic-diet family representatives (poultry cuts+giblets, ground beef all ratios, lamb shank/leg/loin/rib, tilapia/mullet/croaker/sardines, fava/lentils/chickpeas/lupins, molokhia/okra/watercress, pita/rice/bulgur/couscous/semolina, feta/cottage(قريش)/mozzarella, dates/pomegranate/guava, tahini/falafel/hummus, cumin/anise) with family dedupe, zero pork, zero brands/USDA-Commodity/babyfood
- Translation: 481 MSA names authored in-session (avg 18.2 chars; culinary Arabic terms موزة/قريش/طعمية/بحري/دقلة نور), validated fail-closed BEFORE injection: non-empty · Arabic present · ZERO Latin · differs from nameEn · 2-80 chars · no CJK · unique names · every slug exists in tail — one script, exit-1 on any violation
- Injection: slug-anchored regex replacement (481/481 matched) + stale comment fix 8,789→8,750; post-parse verification: counts 8,830/80/8,750 intact · curated-80 SHA-256 IDENTICAL pre/post (e12bcb26…) · slugs-8830 SHA-256 IDENTICAL (0b2c0ac2…) · zero collateral edits outside the band · foods.ts -9.7KB (Arabic names shorter than verbatim USDA chains)
- Phase-0 infra: src/lib/seo-food-band.ts new (single-source manifest + Set, server-only, three-decoupled-signals doc) · /api/food-search ?lang=ar|en (default/unknown = nameEn historical contract; matching untouched) · consumers pass lang: meal-planner FoodSearchInput + CoachClientView PlanViewerModal (lang destructured)
- Guards (plan §6, all in the existing quality gate — no new workflows): foods-ar-purity.test.ts NEW (band purity law + tags-empty + size 300-500 + unique names + 3 freeze hashes + incident canaries) · food-search-lang.test.ts NEW (?lang law, OFF stubbed offline) · foods-sitemap-policy.test.ts UPDATED (tail-outside-band-English fact + P2-12 data line band-aware + NEW PILOT-HOLD canary: route must NOT reference SEO_FOOD_BAND, criterion stays tags-only)
- Deliberately NOT done per owner constraints: sitemap-foods.xml untouched (160 URLs, tags>0 only — wired-band decision deferred post-quality-verification) · tags stay [] for band rows · EVO untouched (benefits automatically per plan §5) · defaultServingAr stays "100g"
- Docs: docs/FOOD-ARABIZATION-PILOT-1-REPORT-2026-09-19.md (execution report) + registry rows (report NEW + plan PROPOSED→EXECUTING) + plan status line + README food-database feature line (band + ?lang, number-law safe) + this entry + STATE refresh (Phase 240)
- Verification (§3.5 full): tsc 0 · eslint 0 · vitest 91 files / 1529 tests GREEN (19 new/updated this frame) · next build ✓ compiled 2055/2055 · docs_audit 0 violations · docs_parity ✓ · migration_audit zero new drift · stale-refs ✓

Stage Summary:
- 481 USDA foods now carry real MSA Arabic nameAr (was verbatim English); band indexability flipped automatically via the existing arabiclessName regex (962 EN+AR pages now indexable); EVO Arabic grounding reach 0.9%→6.4%; meal-planner/coach Arabic surfaces show Arabic names
- All seven plan guards live in CI; curated-80/slugs/nameEn frozen by hash; sitemap policy HELD and guarded against unreviewed wiring
- Commit SHA: b1ba9d706e5f6af11ba3356d4c80f5a8b6e46c09 (main; 9d18dd11→b1ba9d70, owner-bypass direct push, verified SYNCED)
- Push status: PUSHED — remote CI on b1ba9d70 all green: quality ✓ · parity ✓ · guard ✓ · cleanup ✓ · Supabase Preview ✓ (polled via API to completion; this docs frame records the final SHA per the Phase-191 precedent)

---
Task ID: GIT-WORKFLOW-AUDIT-DIRECT-PUSH-2026-09-19
Agent: Super Z (owner session)
Task: Read-only Git/GitHub workflow audit (owner order 2026-09-19: what blocks direct push to main, the best change to restore it WITHOUT disabling the important checks, why the session token variable does not persist between commands, a safe session-long token method that writes nothing to the repo/files/remote URL, review of the delivery script) + same-session execution order after the owner added «Repository admin» to the main-protection bypass list (verify read-only first, then credential-cache setup, pr_flow v2 upgrade, and a REAL direct push to main as the test)

Work Log:
- Ruleset 23682875 «main-protection» audited live via API: the pull_request rule (0 approvals + require_extra_approval_for_unattributed_changes=true) with an EMPTY bypass_actors list was the sole direct-push blocker — classic branch protection off; deletion/non_fast_forward/required_status_checks (quality/parity/guard + Supabase Preview) healthy and kept intact
- Token non-persistence root cause proven in-session: every shell invocation is a fresh isolated process (export survives only within its own command; CWD resets too) — only the filesystem persists; detached background processes DO survive between calls
- Owner action verified read-only AFTER the bypass change: bypass_actors = [RepositoryRole id 5 «Repository admin», bypass_mode always] · current_user_can_bypass = always for muscleshubfit-cpu · all 4 rules still active for everyone else — confirmed before any execution
- Session credential infrastructure (zero writes to repo/files/remote URL): git credential.helper «cache --timeout=14400» — memory-only daemon (socket-only disk footprint, auto-expiry + explicit «git credential-cache exit» purge); token seeded once per session via git credential approve; full-tree leak scan = zero matches; v2 delivery flow reads the token exclusively via git credential fill (never argv — ps-safe), adds 60s HTTP timeouts, a wait action polling the 4 required checks, checks-by-SHA, and a clean action (branch deletion)
- Direct-push test (THIS frame): worklog-only commit pushed directly to main, exercising the owner's bypass grant for the first time — the 4 CI checks still run on push (non-blocking for the bypassing actor); zero code/config/DB changes

Stage Summary:
- Direct push to main restored for the repository admin while the full PR + 4-required-checks path stays enforced for everyone else; recommended operating policy: docs-only via direct push, any code/config/DB change via PR
- Future-session token workflow: seed credential-cache once (transient paste only), operate via git credential fill / the v2 flow, purge at session end — the token value is never persisted anywhere

---
Task ID: FOOD-ARABIZATION-PLAN-2026-09-19
Agent: Super Z (owner session)
Task: Read-only planning audit for Arabizing the USDA food tail (owner order 2026-09-19: rely on the two in-repo audit reports + the actual current code/data state; define precisely which fields need Arabization, nameAr-only vs serving/tags/metadata, impact on size/perf/build/sitemap/SEO-GEO, the best strategy with a technical reason, /api/food-search + Arabic UI behavior, tests/CI guards against English-only Arabic fields, the immutables (slug/EN fields/80 curated), and a concrete execution plan — NO file edits, NO translation start)

Work Log:
- Inputs honored: docs/investor/INVESTOR-TECHNICAL-MASTER.md + docs/FOOD-DATA-LANGUAGE-AUDIT-REPORT-2026-09-19.md + fresh code spot-checks this session
- Field-by-field verdict: nameAr is the ONLY true defect (8,750 rows / 476,882 EN chars / avg 54.5); defaultServingAr "100g" is language-neutral (optional band-only polish, flagged separately); tags must NOT be auto-assigned (curation signal drives sitemap+facets+related+collections — indexability gets DECOUPLED instead); slug/nameEn/numbers/category immutable
- Impact computed: foods.ts 3,732,984 B → +~477KB worst-case verbatim (+12.8%), realistic +5-8% with normalized MSA names; ZERO client-bundle impact (server-only law); build unchanged (no generateStaticParams); indexability flips AUTOMATICALLY via the existing arabiclessName regex (zero route changes); sitemap advertisement switches to a bounded band manifest
- NEW finding beyond the language audit: the EVO layer unlocks for free — evo-search.ts scores nameAr+nameEn (Arabic queries today reach only 80/8,830 rows = 0.9%) and evo-system-prompt.ts:85 injects nameAr into the Arabic prompt (English today for the tail) — Arabization improves EVO grounding with zero AI-layer changes
- Strategy: HYBRID tiered-band expansion (curated 80 → SEO_FOOD_BAND 300-500 pilot → monthly GSC-gated batches → deep-tail decision by data) — reasons: crawl-budget economics on Hobby tier, USDA near-duplicate variant families need family-aware selection, Phase-191 fail-closed batch pipeline precedent scales by batches, GSC measurability, demand skew
- Guards specified: foods-ar-purity band test (zero-Latin law scoped to the band), curated-80 freeze, slug-set freeze, nameEn freeze, food-search ?lang test, CJK extension, foods-sitemap-policy test update (band-aware); all ride vitest/quality gate — no new workflows
- Deliverable: docs/FOOD-DATA-ARABIZATION-PLAN-2026-09-19.md (PROPOSED — execution awaits a new owner order) + registry row; ZERO code/config/DB/data changes in this frame

Stage Summary:
- The plan is decision-ready: one field to translate, one API param to add, one manifest criterion to switch, seven guards to add, everything else stays untouched; phased execution with GSC gates and per-batch revert
- Open owner decisions: band sizes per phase, GSC gate thresholds, whether defaultServingAr gets the optional band polish, deep-tail (Phase 3) continue/freeze

---
Task ID: FOOD-LANG-AUDIT-2026-09-19
Agent: Super Z (owner session)
Task: Read-only audit of Food Data Language Separation (owner order 2026-09-19: verify the source/schema of the 8,830 food records, pin down exactly what "80 bilingual curated vs 8,750 USDA English-only" means, check whether /ar/foods renders English fields from the same records or has another localization layer, live-check Arabic food URLs with representative examples, test whether the defect also exists in exercises or any other dataset, and full SEO/GEO impact split confirmed-vs-likely — NO file edits, NO fixes) + same-session delivery order (deliver both audit reports into the repo and push to main per the repo mechanism)

Work Log:
- Data layer: Food schema is bilingual by design (foods-shared.ts); counts re-derived by parsing foods.ts = 80 tagged curated rows (real Arabic names/servings) + 8,750 USDA rows (nameAr = English verbatim, defaultServingAr "100g", zero Arabic characters — pinned by foods-sitemap-policy.test.ts); stale section comment "8,789 foods" vs actual 8,750 logged as documentation drift
- Policy layer verified from code: sitemap-foods.xml Phase 141 crawl-budget policy (160 advertised URLs, tags>0 criterion) + P2-12 noindex,follow on AR arabicless mirrors only
- LIVE production checks (2026-09-19): sitemap-foods.xml = exactly 160 <loc> · /ar/foods/chicken-breast = index,follow with fully Arabic title/H1 ✓ · /ar/foods/butter-salted = noindex,follow with ENGLISH H1 "Butter, salted" + mixed-language JSON-LD (Breadcrumb/NutritionInformation) + og:locale ar_EG · /foods/butter-salted = index,follow whose hreflang ar twin is the noindex mirror · /ar/foods?page=5 and page=50 = raw English USDA card names inside the AR RTL list · related-foods links on USDA AR pages flow to curated Arabic pages (greek-yogurt/cottage-cheese/milk)
- Cross-dataset scope: exercises carried the SAME root cause and were FIXED at the data level (SEO-GEO-7 names + Phase 191 instructions, zero-Latin law tests) · programs/diet-plans/collections/muscle+equipment hubs/comparisons all carry native Arabic fields · foods is the only remaining dataset with the defect
- Secondary spillovers logged: /api/food-search returns nameEn only (meal planner incl. the AR mirror + coach client show English names), TAG_LABELS vegetarian ar label untranslated ("vegetarian"), llms.txt advertises /ar/foods/[slug] + "8,830+ foods" to AI crawlers (noindex does not bind AI bots)
- Deliverable (audit): docs/FOOD-DATA-LANGUAGE-AUDIT-REPORT-2026-09-19.md — root cause + scope + SEO/GEO impact (confirmed vs needs-GSC) + live examples + full file-source appendix
- Delivery frame (owner order «نفّذ الآن فقط — ادفع التقريرين إلى main»): food report placed at docs/FOOD-DATA-LANGUAGE-AUDIT-REPORT-2026-09-19.md as a byte-identical copy (md5-verified) of the session deliverable + registry row in docs/README.md + this worklog entry; the investor master report (docs/investor/INVESTOR-TECHNICAL-MASTER.md, including its same-day PayPal clarification update) rides in the same frame — both reports' contents untouched per owner order
- ZERO code/config/DB changes — docs-only frame

Stage Summary:
- Root cause: the USDA import copied English into nameAr for 8,750/8,830 rows; the project mitigated by POLICY (sitemap exclusion + AR noindex mirrors), not by data translation; the exercises fix proves the data-level path works in this repo
- Confirmed SEO impact: Arabic food index ceiling = 80 pages by design; 8,750 AR mirrors can never rank; mixed-language JSON-LD remains AI-crawlable (GEO exposure); hreflang clusters for the tail mix index/noindex; 442 AR pagination pages carry links to noindex pages (follow=true by design — equity flows to the curated band)
- Needs GSC/production data: curated-80 impressions vs Arabic demand, EN tail coverage class, mixed-cluster hreflang behavior, crawl-budget share, AI-engine citation behavior, the documented 90-day Phase-141 review checkpoint
- Gates (docs-only frame, run before commit): py_compile ✓ · docs_audit ✓ 0 violations · docs_parity ✓ · migration_audit ✓ · stale-refs ✓ · ui-wiring ✓

---
Task ID: INVESTOR-TECH-AUDIT-2026-09-19
Agent: Super Z (owner session)
Task: Investor Technical Audit (owner order 2026-09-19 «ابدأ الآن Investor Technical Audit لمشروع Alkemos» — استخراج صورة تقنية واستثمارية دقيقة من الكود الفعلي ليكون المصدر الأساسي لبناء Investor Deck عربي/إنجليزي لاحقًا؛ الكود source of truth، صفر تعديل code/config/DB/functionality)

Work Log:
- Audit executed on a clean clone of commit `6795b5b0` (main HEAD): product architecture, stack, data assets, EVO/AI, SEO/GEO, scalability, maturity, business-technical mapping
- Live verification runs (same commands as CI): `bun install --frozen-lockfile` ✓ (680 pkgs) · `vitest run` ✓ **89 files / 1,514 tests all passing (76s)** · `tsc --noEmit` ✓ **0 errors**
- Every metric re-derived from its source (not from docs): 868 exercises (EXERCISES_COUNT + passing count test) · 8,830 foods (FOODS_COUNT; 80 curated bilingual vs USDA English-only tail documented in the sitemap policy) · 7 programs · 24 diet plans · 23 intent clusters · 74 API routes · 118 pages (39 AR) · 102 migrations · 293 RLS CREATE POLICY statements · 16 workflows · prices/quotas/affiliate/activation from memberships.ts / tier-limits.ts / affiliate-constants.ts / coach-limits.ts · fra1 + crons from vercel.json · blog slots from workflows
- Contradictions logged: (1) «bilingual labels» for the whole 8,830-food DB overstated — only 80 hand-curated are bilingual (2) STATE line «PayPal ملغى (229)» vs full PayPal implementation in code/README — **RESOLVED same day by owner clarification (in-session): the cancelled item was the live UX-test item (بند فحص تجربة مستخدم) from the deep-UX-audit §5 checklist, NOT the PayPal payment integration** — contradiction row #2 closed in the report (3) RLS claim is law-true but base-table policies predate the migration registry (dashboard-applied, documented in TECH_REFERENCE)
- Post-audit update (owner clarification, same session): report §11 row 2 + §9 B2C row + header note updated — PayPal integration now framed as fully Implemented (2,307 LOC / 6 files: paypal.ts + create/capture/webhook routes + checkout UI), with two deck caveats: no live-transaction test claim (paid-member UX was verified via the wallet-activation path, Phase 228) and production mode remains `PAYPAL_MODE`-driven (default sandbox) to be confirmed from the dashboard
- Deliverable: `docs/investor/INVESTOR-TECHNICAL-MASTER.md` — 11 sections + Investor Narrative Candidates + Verified Metrics table (each number with its in-repo source) + Public Disclosure Boundaries + examined-files appendix + non-verifiable-from-repo list (traffic/revenue/blog count/EVO live stats need dashboards)
- Parity (§3.8): docs/README.md registry row added for the new doc (this frame); no other file touched — zero code/config/DB change (owner's audit rules honored)
- Not committed / not pushed (no push was ordered; the docs-only changes sit in the working tree for owner review)

Stage Summary:
- Master source of truth for the deferred investor-materials stage is ready at docs/investor/INVESTOR-TECHNICAL-MASTER.md; audit basis = commit 6795b5b0 on 2026-09-19
- Verified-from-code headline numbers: 1,118 commits / 49 days · 238,226 LOC TS-TSX · 1,514/1,514 tests green (run by the auditor, not assumed) · tsc 0 errors (run by the auditor) · ~2,100 static indexable URLs · zero-marginal-cost AI layer (free models × 3 providers + GHA compute)
- Open item CLOSED (owner clarification 2026-09-19): «ملغى (229)» = cancelled live UX-test item only — PayPal integration stays fully implemented; the only remaining pre-deck check is confirming `PAYPAL_MODE=live` (+ live credentials) in the production dashboard, already listed in report §8.3

---
Task ID: PUBLIC-INTERFACE-239-2026-09-19
Agent: Super Z (owner session)
Task: Public-interface rewrite after the docs restructuring (owner order 2026-09-19 «ابدأ الآن بإعادة كتابة الواجهة العامة لمستودع Alkemos بعد اكتمال إعادة هيكلة التوثيق» — README + repo metadata describe current Alkemos only; docs-only frame, zero business-logic/API/DB change)

Work Log:
- README.md rewritten end-to-end (598 → ~250 lines). Retired from the front door: the brand-rename section, historical migration narratives, per-phase feature bullets, incident stories, and internal-surface links (worklog/AGENTS — still reachable one click away via the docs/README.md index). Kept by law: the STATE.md link (docs_audit G) and the number-free law (tools listed by name, no count — P3-2 single-source rule). New shape: what Alkemos is → offering (content & tools / EVO / memberships / coaches B2B / site-coaches + admin) → architecture (stack, layout, bilingual, data, AI, content pipeline, SEO/GEO, CI gates) → developer quick start → docs index → license
- Every number re-verified from its single source BEFORE use: 868 exercises (exercises-shared.ts EXERCISES_COUNT) · 8,830 foods (foods-shared.ts FOODS_COUNT) · 7 programs (workout-programs.ts) · tier prices 14.99/119 · 29.99/239 · 39.99/359 + quotas 2/4/8/8 generations, 10 EVO msgs/day, 3/6 swaps, 3/50/200 saved (memberships.ts) · 20% + $10 payout + 7-day hold (affiliate-constants.ts + engine-server) · REFUND_WINDOW_DAYS=7 (refund.ts) · fra1 region (vercel.json) · blog slots 22:00/05:00 UTC (blog-post-en/ar.yml)
- Two stale PUBLIC claims found & fixed en route: (1) GitHub repo description said «6 free tools» — contradicted the hub array (TOOLS_COUNT=8) and the README number law; description rewritten without a tools count (2) README claimed Vercel region Singapore (sin1) while vercel.json says fra1 (Frankfurt) — fixed
- Parity (§3.8): docs/README.md registry row for README.md bumped to Ph 239 · docs/CI_GATES.md §Backups pointer realigned to the new «Data layer» section · STATE → 239 (+ QA row + investor-materials deferral line) · this entry
- GitHub metadata via API (same frame): description rewritten (bilingual AR/EN smart fitness & nutrition platform… no counts that rot, no «elite»), homepage + topics kept (all accurate)
- Validation this frame: docs_audit ✓ 0 violations · docs_parity ✓ · migration_audit ✓ zero new drift · stale-refs ✓ · quality battery (tsc/eslint/vitest) runs in the push workflow; CI verified green on the pushed SHA after push

Stage Summary:
- The front door now explains CURRENT Alkemos to a first-time developer/investor in one scroll; historical knowledge untouched in its internal homes (worklog/archive/docs registry)
- Investor Deck / Investor Pages explicitly NOT started — deferred independent stage by owner order (recorded in STATE المفتوح الآن)
- Commit SHA: this commit carries this entry
- Push status: pushed immediately after this entry
---
Task ID: DOCS-CONTEXT-MIGRATION-P6-CLOSURE-2026-09-19
Agent: Super Z (owner session)
Task: Migration Phase 6 (owner actions — executed to the limit the session credentials allow) + plan STEP 9 closure (owner order 2026-09-19 «complete the remaining approved Phase 6 owner-only tasks, with the same validation, documentation, commit, push, and verification discipline. Do not redesign or expand the approved plan»)

Work Log:
- Phase 6 attempted with the session PAT (repo permission level shows admin, but the fine-grained token carries Contents write only) — the platform refused both write classes:
  (1) PUT /branches/main/protection (require quality+parity+guard+Supabase Preview · admins not bypassed-blocked · force-push off) → HTTP 403 «Resource not accessible by personal access token»
  (2) PUT /vulnerability-alerts + PUT /automated-security-fixes (Dependabot) → HTTP 403 ×2
  (3) PAT rotation — owner-side security action by nature: the token is the owner's credential and rotating it mid-session would cut this session's own push path
- Check names verified live on 3fdc7a09 BEFORE the attempt: quality · parity · guard · Supabase Preview — all four green on the pushed SHA (the exact contexts the rule must require)
- Closure (STEP 9): both audit-doc banners → EXECUTED with the phase ledger (232–237 + this closure commit); plan §12 DoD checklist final state (6/7 checked; branch protection = the one open owner action); plan §14 Phase-6 box records the 403s; registry rows final; STATE → 238 with the GitHub-security item promoted from «optional» to ordered-pending
- OWNER WALKTHROUGH (§12.9 — ~2 minutes, two settings pages + one token page):
  A. Branch protection: github.com/muscleshubfit-cpu/alkemos → Settings → Branches → «Add branch ruleset» (or classic «Add rule» for main) → Rules → Require status checks to pass → tick exactly: quality · parity · guard · Supabase Preview → «Do not allow bypassing the above rules» = OFF (keeps your direct-push hotfix path) → Create/Save. Success: the ruleset shows on the Branches page and a failing gate blocks non-admin merges. Rollback: delete the ruleset on the same page.
  B. Dependabot: Settings → Code security & analysis → enable «Dependabot alerts» + «Dependabot security updates». Success: both toggles green. (Optional later, needs its own order per §12.5: a dependabot.yml for version-update PRs — a new file.)
  C. Rotate the chat-shared PAT: github.com/settings/tokens → Fine-grained tokens → regenerate/delete the alkemos token. Success: the old token returns 401.
- Validation this frame: docs_audit ✓ 0 violations · docs_parity/migration_audit/stale-refs/ui-wiring ✓ · governed-docs cross-refs clean (Phase-1 state re-verified) · push + Actions + sync check recorded below

Stage Summary:
- Migration Phases 0–5 executed and verified (repo Phases 232–237: 2d9c4e32 · c0fee8a6 · 73ad3065 · ebda6c54 · 2651cfa9 · 3fdc7a09); Phase 6 attempted to the credential limit — the three owner actions are one 2-minute UI walk away (guide above)
- F-01..F-14 closed as far as an agent can execute; F-03 (a gate that is not required is a suggestion) closes the moment walkthrough A is applied — the only remaining migration item
- Commit SHA: this commit carries this entry
- Push status: pushed immediately after this entry
---
Task ID: DOCS-CONTEXT-MIGRATION-P5-2026-09-19
Agent: Super Z (owner session)
Task: Migration Phase 5 — worklog rotation + evidence law (owner order 2026-09-19 «Continue with Phase 5 using option (b) — rotate the historical worklog entries into the archive as specified in the migration plan»; plan §8)

Work Log:
- Rotation (b) = pure verbatim move: worklog.md lines 1783-5253 (entries #74-216 — from AI-ARTICLES-...-161.5-2026-09-09 down to SEO-GEO-14-AUDIT-2026-09-15, the non-monotonic legacy tail F-05 mapped) appended to archive/WORKLOG_ARCHIVE.md behind ONE new «---» separator; pre/post diff of the moved region = identical; archive 3,671 → 7,143 lines / 948,447 bytes (append-only law respected — zero edits above the append point)
- Cut rationale (documented deviation inside the plan's own numbers): the literal 30-day buffer is a no-op against this repo's 11-day history (every live entry is within 30 days — the repo itself is younger); executed to the plan §8(b) quantified outcome instead: worklog 5,253 lines / 1,049,979 bytes → 1,821 lines / 424,587 bytes, inside the «~1.5–2 K lines» band — live region = top-12 window + rolling date buffer back to 2026-09-10 (deepest contiguous cut in band)
- Header note replaced (deprecated Phase-82 «آخر 10 مهام» note retired): active region = newest-on-top; full history in archive/ + derived-invariant pointer
- 6 retained entries normalized to the full §12.5.1 skeleton (option-(a) mechanic applied to the retained region only — labels inserted, content verbatim): PHASE-213/212/211/210/209 (2026-09-16) + PHASE-205 (2026-09-15) — live region is now a single format
- docs_audit.py per plan §8.3: STATE byte cap warning(48,000) → HARD at 32,000 bytes; K skeleton gaps warning → hard fail; both verified firing on a scratch copy (injected 33KB STATE + skeleton-less entry both fail; real repo green) — py_compile ✓
- AGENTS.md: §12.5.1 entry-size guidance (≤60 lines/entry · LIVE-VERIF ≤40 · detail belongs in committed scripts or registry rows) + evidence rule (committed path or «local-only, not preserved» — F-11); §10 commit-message budget (subject ≤72 · body ≤500 · pointer to the worklog entry — F-06, from this phase forward); header bumped (I-check)
- Parity (§3.8): README worklog description + CHANGELOG pointer aligned to the rotation reality; docs/README.md rows (worklog · archive · plan · report · AGENTS · README · STATE · CI_GATES); plan banner + §14 record the (b) choice; report banner — both audit docs now state Phases 0-5 landed
- STATE → 237: (٠٠) row + QA row + open-items line (Phase 6 owner actions = the only remainder); (٠٠) 230 row retired — coverage verified live in worklog (SHARE-P0-230-2026-09-18 + its LIVE-VERIF)
- Validation: 10 random moved entries (fixed seed) verified findable in the archive · top-3 entries byte-identical · docs_audit 0 violations · docs_parity/migration_audit/stale-refs/ui-wiring ✓ — session scripts local-only, not preserved

Stage Summary:
- F-05 + F-14 closed: the 1 MB haystack is now a window-shaped greppable file (top-12 + rolling buffer, single live format) with the boundary guarded structurally by the derived invariant; full history preserved verbatim in archive/
- Docs+script frame — §3.5 reduced battery per Phase-223 precedent; the quality workflow runs the full tsc/eslint/vitest battery on push
- Next per plan §11: Phase 6 owner actions (branch protection · Dependabot · PAT rotation) — then closure (STEP 9)
- Commit SHA: this commit carries this entry
- Push status: pushed immediately after this entry

> guarded by the derived tail invariant — `scripts/docs_audit.py` H-check.

---
Task ID: DOCS-CONTEXT-MIGRATION-STATUS-2026-09-19
Agent: Super Z (owner session)
Task: Migration stop-point documentation — both audit-doc banners now reflect the executed reality (Phases 0-4 landed); execution halted at the plan §8 owner decision point.

Work Log:
- Phases 0-4 of docs/DOCS-CONTEXT-MIGRATION-PLAN-2026-09-19.md executed as repo Phases 232-236, one commit each, all four gate workflows green on every pushed SHA (2d9c4e32 · c0fee8a6 · 73ad3065 · ebda6c54 · 2651cfa9).
- The two banners («PROPOSED — NOT EXECUTED») had become false documentation after execution; updated to APPROVED + EXECUTING with the stop point named (§3.8: wrong-but-confident docs are worse than missing docs).
- Plan §14 approval record filled with the owner execution-order citation; Phase 5 marked «awaiting owner choice»; Phase 6 marked owner-only.
- STOP REASON (plan §11 STEP 7 + owner execution order «stop if the plan reaches an explicit Owner Decision»): Phase 5 requires the owner to pick (a) format-normalization-only vs (b) rotation-recommended (§8) BEFORE any further work; its decision-independent sub-items (§8 items 1-4) ship inside the same Phase-5 commit by design and were therefore NOT pre-executed.

Stage Summary:
- Repository state is self-describing for the next session: STATE's open-items pointer names the Phase-5 decision; docs/README.md registry rows carry EXECUTED/EXECUTING statuses with SHAs; the banners agree.
- Awaiting from the owner: (1) Phase-5 choice a/b; (2) Phase-6 owner-only actions (branch protection, Dependabot, PAT rotation — §9).
- Commit SHA: this commit carries this entry
- Push status: pushed immediately after this entry
---
Task ID: DOCS-CONTEXT-MIGRATION-P4-2026-09-19
Agent: Super Z (owner session)
Task: Migration Phase 4 — docs lifecycle registry (owner order 2026-09-19 «Execute the documented … Migration Plan»; plan §7)

Work Log:
- Created docs/README.md — the registry (plan-sanctioned new file): file / role / status (LIVE · FROZEN · ARCHIVE · HISTORICAL · EXECUTED) / last-updated, seeded from the audit's §3.1–§3.3 inventories + this migration's own rows (both audit docs marked EXECUTED/EXECUTING with their landing SHAs) + the agent-session reading budget (STATE ~22KB → AGENTS §1-§4+§12 → top-3 worklog entries → on-demand via the source map). Includes docs/DEEP-AUDIT-PLAN-2026-09-16.md — a file the 2026-09-19 audit's §3.3 table missed (now registered as EXECUTED, waves 215-217).
- AGENTS.md §12.5 consolidated note repointed: doc lifecycle statuses live in docs/README.md (the frozen docs/_AUDIT.md operative-procedure reference retired — audit F-09's law-side half).
- AGENTS.md §12.5.2 cadence repointed: the monthly audit = re-verify registry rows + re-run the audit report's Appendix-A one-liners (previously «per docs/_AUDIT.md» — a 2026-08-25 snapshot its own header called «not a statement of current status»; the Phase-214 audit had flagged the dead cadence, the pointer itself was never fixed until now).
- README.md «📋 Additional Documentation» now leads with the docs/README.md index link.
- Both governed-doc headers bumped in this same commit (I-check); the §12.5.2 decision point resolved by the plan's documented default (repoint, not deprecate — owner may formally deprecate the cadence anytime; single revert restores the old text).

Stage Summary:
- F-09 + F-12's index half closed: every documentation file now has exactly one lifecycle row; the next audit (or §12.5.2 run) starts from the table instead of re-deriving the pile; the agent reading budget is written down instead of folklore.
- Registry-rows-vs-filesystem check ran in validation: every row's file exists.
- Next per plan §11: Phase 5 — worklog rotation + evidence law — OWNER DECISION POINT (a normalization-only vs b rotation-recommended) — execution stops there until the owner picks.
- Commit SHA: this commit carries this entry (final SHA in the session report §12.9 after push)
- Push status: pushed immediately after this entry
---
Task ID: DOCS-CONTEXT-MIGRATION-P3-2026-09-19
Agent: Super Z (owner session)
Task: Migration Phase 3 — STATE.md de-duplication: history moves out of the status file (owner order 2026-09-19 «Execute the documented … Migration Plan»; plan §6)

Work Log:
- Coverage verification BEFORE any deletion (the plan §13 mitigation): all 26 (٠٠) rows below the top-5 verified covered — live worklog Task IDs for phases 185-205 (PRESENTATION-SAVE-LADDER-185, PHASE-186..PHASE-205, …), 208-229 (C1-*, AUDIT-*, ZOD-*, SHARE-*, …), VERCEL-USAGE-2/3 (worklog:660/687); archived Task IDs for 206/207 (archive/WORKLOG_ARCHIVE.md:3596/3641, confirmed against the audit's §3.2 inventory). Zero uncovered → zero content moved; deletion-only after verified coverage.
- Deleted from STATE.md: the 26 covered (٠٠) rows (229 down to 185+G6/183/181/180/178+184), the 8 older QA rows (gate facts live in each phase's worklog entry), and the 46-level nested phase chain.
- Flattened the phase chain per plan §6.2: «235 (فوق 234) + full-chain pointer to worklog headers / archive» (the chain data exists per-phase in worklog Task IDs).
- STATE.md rebuilt: 100 lines / 82,427 bytes → 68 lines / 21,651 bytes — under the Phase-3 target (≤48,000) and already under the Phase-5 hard cap (32,000). All six required sections preserved; phase parses 235; the A-check byte warning disappears from the gate report.
- QA section now carries the current phase row only (per plan §6.4); older rows' facts verified present in their phases' worklog entries before deletion.

Stage Summary:
- F-07 closed and the mechanical half of F-04 closed: STATE is a status file again — 68 lines / ~22KB ≈ a genuine 30-second read; every deleted fact remains greppable in worklog/archive; five-phase random spot-check below.
- Freed 32 lines of budget for future phases (the cap is a maximum, not a quota).
- Next per plan §11: Phase 4 (docs lifecycle registry — docs/README.md, sanctioned by the plan's approval).
- Commit SHA: this commit carries this entry (final SHA in the session report §12.9 after push)
- Push status: pushed immediately after this entry
---
Task ID: DOCS-CONTEXT-MIGRATION-P2-2026-09-19
Agent: Super Z (owner session)
Task: Migration Phase 2 — gate hardening in scripts/docs_audit.py only (owner order 2026-09-19 «Execute the documented … Migration Plan»; plan §5)

Work Log:
- Derived tail invariant (replaces the hand-bumped constant, closes F-14's mechanism): WORKLOG_TAIL_BASELINE DELETED (was "2026-09-18" after three manual bumps 216/226/232) — H3 now requires no entry below the top-12 window to be newer than the OLDEST DATED ENTRY INSIDE the window. A legitimate window slide can never trip it; a bottom-append (VERCEL-USAGE-4 class) always will. Verified live: current repo passes (max tail 2026-09-18 == min window 2026-09-18).
- K-check: (a) any `## Task ID:` line = malformed header → HARD fail with ::error:: (the F-02 escape class; zero legit occurrences since Phase 0 normalized the last one); (b) entries missing the §12.5.1 skeleton (Agent/Task/Work Log/Stage Summary) → WARNING listing them — 16 pre-Phase-215 entries today (PHASE-205..213 intermediate format + legacy SEO-GEO/bare-number entries); flips to hard-fail with the migration Phase-5 normalization per the plan §13 risk mitigation (warn-first rollout).
- A-check extension: STATE.md byte size now printed in the report line (bytes=81,751 today) + ⚠ warning above 48,000 bytes (the Phase-3 de-dup target); the hard cap (32,000) arrives with migration Phase 5.
- Docstring (H/K descriptions) + the workflow comment block updated (baseline history 216/226/232 documented as retired).
- docs/CI_GATES.md same-commit: knowledge-gate row updated (stale «≤2026-09-15» wording replaced by the derived invariant + the K row) + a Phase-2 hardening provenance line citing the plan.
- Scratch-copy negative tests (a full cp -a clone, never the repo): defect 1 bottom-append dated 2026-09-20 → H3 derived FIRES; defect 2 `## Task ID:` header → K/malformed FIRES; defect 3 STATE inflated to 110 lines → A FIRES; defect 4 skeleton-less entry → K warning (17 = 16+1) NOT a failure; scratch exit=1 with exactly 3 failures. Real-repo run: exit=0 (warnings only). docs_parity/migration_audit/stale-refs/ui-wiring unaffected and green.

Stage Summary:
- The two escape classes this system actually hit (F-01's missed bump, F-02's invisible header) are now structurally impossible: the boundary is derived, not remembered; the malformed header is red on sight.
- Phase-2 warn-first design proven both ways in one run: the scratch fails on the three defect classes while the real repo stays green with 16+1 skeleton warnings.
- Next per plan §11: Phase 3 (STATE.md de-duplication — history moves to worklog; ≤48 KB target).
- Commit SHA: this commit carries this entry (final SHA in the session report §12.9 after push)
- Push status: pushed immediately after this entry
---
Task ID: DOCS-CONTEXT-MIGRATION-P1-2026-09-19
Agent: Super Z (owner session)
Task: Migration Phase 1 — stale-reference hygiene in the governed docs (owner order 2026-09-19 «Execute the documented … Migration Plan»; plan §4)

Work Log:
- Pre-checks re-run: all six Phase-1 targets verified present verbatim (DEVELOPER_GUIDE.md:8 + :757 bare `PROGRESS.md`; DESIGN.md:163-164 live-tense build scripts; README.md:596 deprecated worklog description; AGENTS.md:144 unmarked deleted doc; CHANGELOG.md 0 bytes) — findings reproduce.
- DEVELOPER_GUIDE.md:8 — «See also PROGRESS.md § "Reconciled Status"» → current statistics live in STATE.md; Phase-115-frozen history at archive/PROGRESS.md. Header bumped same-commit (I-check).
- DEVELOPER_GUIDE.md:757 — «انظر PROGRESS.md Phase 5» → archive/PROGRESS_ARCHIVE.md (المرحلة 5) — content location VERIFIED first: Phase 5 record found at archive/PROGRESS_ARCHIVE.md:254 (not in the frozen archive/PROGRESS.md).
- DESIGN.md:163-164 — reworded to past tense. Verified BEFORE writing: build_assets_v127.py / build_assets_v3.py / fix_hero_logo2.py exist in NO git commit (git log --all = empty for each) and no current asset-build path exists — the plan's suggested «git history a3e2bfc4^» pointer is invalid (a3e2bfc4's tree predates/removes nothing — the scripts were never tracked). Truthful wording applied instead: local-only scripts, never committed, documented as history (the repo's established pattern for local-only tools).
- README.md:596 — worklog description now matches reality: «full append-only history; pre-Phase-209 entries also preserved in archive/WORKLOG_ARCHIVE.md».
- AGENTS.md:144 — `docs/EVO-PARTNER-API.md` now carries «(file deleted with the surface)» — link-checkers read history, not a live pointer. Header bumped same-commit.
- CHANGELOG.md — plan's owner-decision item resolved on evidence: the audit claimed «no decision recorded» but worklog.md:3050 documents the Phase-111 owner order «اتركه فارغاً الآن، سنملؤه لاحقاً» (leave empty, we will fill it later). DELETION would contradict that recorded order; the plan's documented alternative (fill with a pointer) contradicts nothing and satisfies «Do not leave it empty». Filled with a 3-line pointer to STATE.md + worklog.md + the archive, citing the Phase-111 provenance. Single revert available if the owner prefers deletion.
- Validation battery (docs-only frame): docs_audit → 0 violations (I-check verifies all four bumped headers ≥ commit date) · docs_parity ✓ · migration_audit --ci ✓ · stale-refs ✓ · ui-wiring ✓ · Appendix-A re-runs: bare `PROGRESS.md` refs in DEVELOPER_GUIDE = 0 (only the STATE/archive pointers remain); DESIGN script mentions now explicitly historical.

Stage Summary:
- F-10 fully closed: every reference in the governed docs now resolves or is explicitly marked historical; CHANGELOG.md has a purpose and provenance note.
- Two evidence-driven deviations from the plan's suggested wording, both verified-before-writing per the plan's own instruction and documented above: (1) DESIGN's git-history pointer (invalid — scripts never in git); (2) CHANGELOG fill-not-delete (Phase-111 order honored).
- Next per plan §11: Phase 2 (docs_audit.py hardening — derived tail invariant + K entry-schema check + A byte report) with scratch-copy negative tests.
- Commit SHA: this commit carries this entry (final SHA in the session report §12.9 after push)
- Push status: pushed immediately after this entry
---
Task ID: DOCS-CONTEXT-MIGRATION-P0-2026-09-19
Agent: Super Z (owner session)
Task: Migration Phase 0 — regularization & unblock (owner order 2026-09-19 «Execute the documented Documentation & Agent-Context Architecture Migration Plan … Begin with STEP 0»)

Work Log:
- Session opened per AGENTS.md §3.6: HEAD == origin/main == f661f075 (fetch verified); STATE.md + top-3 worklog entries + last 5 commit subjects read.
- Plan STEP 1 re-verification: all audit findings still reproduce at f661f075 — docs_audit → exactly 1 violation [H/worklog-tail-freeze] (F-01); docs_parity PASS; VERCEL-USAGE-4 still at worklog bottom with the malformed `## Task ID:` header (F-02); Actions API: parity gate failure on f661f075, quality/stale-refs green.
- Plan Phase 0 step 1 (F-02): VERCEL-USAGE-4 moved from worklog.md bottom (5108-5123) to the top as a standard §12.5.1 entry `Task ID: VERCEL-USAGE-4-2026-09-19` — every bullet verbatim; header normalized + the missing `Task:`/commit lines added per the binding template.
- Plan Phase 0 step 2 (F-01/F-14): WORKLOG_TAIL_BASELINE bumped 2026-09-17 → 2026-09-18 in scripts/docs_audit.py:229 in this same commit (Phase 216/226 documented precedent — the third bump; migration Phase 2 replaces the hand-bumped constant with a window-derived invariant).
- Plan Phase 0 step 3: the audit commit's §12.5.1 entry (`DOCS-CONTEXT-AUDIT-2026-09-19`, commit f661f075) added directly below this one — it shipped without one only because the audit order prohibited touching existing files.
- Plan Phase 0 step 4 (§3.6 duty): STATE.md → Phase 232 (header narrative, chain, (٠٠) 232 entry, open-items pointer to the audit pair, QA row) — 100 lines held via three sanctioned merges ((٠٠) 187+186 · (٠٠) 202+201+200+199 · QA rows 230+229; content joined verbatim, nothing dropped).
- Ordering reconciliation (documented per §12.10): the plan's Phase-0 validation wording anticipated two new entries; §10's no-exception rule adds THIS entry, which as the newest action takes the top per newest-on-top; the audit entry is second (plan wording holds); VERCEL-USAGE-4 lands third — chronologically first of the three 2026-09-19 entries.
- Validation battery (docs-only frame, zero app-code/TS change — reduced §3.5 per VERCEL-USAGE-4/Phase-223 precedent): py_compile scripts/docs_audit.py ✓ · docs_audit → 0 violations (gate green on main for the first time since 8321e718) · docs_parity ✓ · migration_audit --ci ✓ · stale-refs ✓ · ui-wiring ✓.

Stage Summary:
- Phase 0 complete in one revertible commit: main's knowledge gate unblocked (F-01 closed), the misplaced newest entry normalized and parser-visible (F-02 closed), the audit commit's protocol gap closed, STATE current at Phase 232.
- Next per plan §11: Phase 1 (stale-reference hygiene, 6 governed docs) as its own commit — no phases batched.
- Commit SHA: this commit carries this entry (final SHA reported in the session report §12.9 after push)
- Push status: pushed immediately after this entry
---
Task ID: DOCS-CONTEXT-AUDIT-2026-09-19
Agent: Super Z (owner session)
Task: Deep read-only architectural audit of the documentation & agent-context system + documenting the audit and the migration plan in the repository (owner order 2026-09-19 «Perform a deep architectural audit … Do not implement the plan yet»)

Work Log:
- Read-only audit at baseline 8321e718: full 34-file .md inventory (lines/bytes/commits), worklog chronology map (208 parsed entries, 3 format generations, archive boundary anomaly), cross-reference scan, gate re-runs (docs_audit → 1 violation H/worklog-tail-freeze; docs_parity PASS; Actions API: parity gate failure on 8321e718/b1fc74ae).
- Findings F-01..F-14 with file:line evidence + root causes RC-1..RC-7 — P0: gate red on main, bottom-appended parser-invisible entry, advisory-only gates; P1: STATE 79KB/100-line density gaming, worklog 1MB three-generation, triple narrative storage; P2: audit-doc accretion without lifecycle index, stale refs, uncommitted LIVE-VERIF evidence.
- Committed exactly two NEW docs (no existing file touched, per the order): docs/DOCS-CONTEXT-AUDIT-REPORT-2026-09-19.md (findings + root causes + reproducible Appendix-A commands) + docs/DOCS-CONTEXT-MIGRATION-PLAN-2026-09-19.md (status PROPOSED — 7 phases, one commit each, every phase independently revertible).
- This entry could not ship inside f661f075 (the order's no-existing-file-edit constraint) — regularized one frame later by DOCS-CONTEXT-MIGRATION-P0 per the plan's Phase 0 step 3.
- CI on f661f075 verified via Actions API: quality gate ✓ · stale-refs ✓ · parity ✗ = the pre-existing F-01 violation (zero new violations; its fix requires editing existing files, forbidden by the audit order). PAT scrubbed from the remote URL after push; owner reminded to rotate the chat-shared secret.

Stage Summary:
- The audit pair is in-repo at docs/ as the single task specification; execution order arrived 2026-09-19 («Execute the documented … Migration Plan»).
- Commit SHA: f661f075 (docs: agent-context architecture audit + migration plan (2026-09-19))
- Push status: pushed
---
Task ID: VERCEL-USAGE-4-2026-09-19
Agent: Super Z (جلسة المالك المباشرة — «مطلوب تنفيذ حل لمشكلة تجاوز الاستخدام الحالية»)
Task: تنفيذ حل لمشكلة تجاوز الاستخدام الحالية على Vercel (storage overage + Fluid Active CPU) — أمر المالك المباشر 2026-09-19

Work Log:
- فحص API حي: المشروع يحتفظ بـ6 نشرات فقط (5 production 09-18 + preview 09-09) رغم عداد 19.34GB → تشخيص lag عداد Vercel (24-48س) + تسرب نافذة 6 ساعات أمام دفعة 5 نشرات/3.7س + انحراف GitHub cron اليومي 4+ ساعات (هبوط 05:21/16:55 بدل 01:00/13:00).
- ف-1: حذف فوري عبر Vercel REST API لـ5 نشرات stale — احتفاظ بالنشر الحالي الحامل للدومين dpl_GFLaUU (aliasAssigned=true). الحالة الفعلية = نشر واحد (~0.35GB+0.29GB).
- ف-2: KEEP_HOURS default 6→3 في scripts/vercel-cleanup/vercel-cleanup.mjs (+تحديث رياضيات التوثيق بالترويسة).
- ف-3: جدولة vercel-cleanup.yml من 2× يوميًا إلى كل ساعة (:07 UTC) — إلغاء نمط انحراف cron اليومي (4+ ساعات).
- ف-4 (T-3b): PATCH على قاعدة alkemos-public-html-cache في CF Rulesets API — Edge TTL 14400→43200ث (12 ساعة) حماية لسقف Fluid Active CPU (كان 4h10s/4h متجاوزًا)؛ Browser TTL بقيت 300ث.
- ف-5: توثيق §5.4: TECH_REFERENCE §5 + SECURITY §10 + docs/VERCEL-USAGE-AUDIT-2026-09-16.md §9 (القسم الكامل بالأرقام والمقايضات وما تبقى على المالك).
- تحقق §3.5 المخفض: node --check على السكربت + yaml.safe_load على الـworkflow — صفر تغييرات TS في الفريم.

Stage Summary:
- الحالة الفعلية للتخزين: نشر واحد ≈ 0.64GB مجمعة — تحت السقفين بهامش >10×؛ العدادات المبلغ ستسقط تلقائيًا خلال 24-48 ساعة.
- Fluid CPU: رندرات SSR ÷3 (Edge TTL 12 ساعة) — المقايضة: صفحات مخاكشة تتأخر حتى 12 ساعة على PoP دافئ، URLs الجديدة فورية، صفر أثر على اكتشاف الزواحف.
- ما تبقى بيد المالك: مراقبة العداد 48 ساعة · قرار حذف مشروع alkemos-repo الفارغ · تدوير الأسرار المنشورة بالمحادثة.
- Commit SHA: e061302b → 8321e718 (فريم المهمة الكامل؛ هذا المدخل كان ملحقًا بقاع worklog بتنسيق غير قياسي — أُعيد وضعه وتوحيده في مدخل DOCS-CONTEXT-MIGRATION-P0-2026-09-19)
- Push status: pushed
---
Task ID: SHARE-UNIFY-231-LIVE-VERIF-2026-09-18
Agent: Super Z (main)
Task: Phase 231 — LIVE post-push verification of the Social Sharing unification + OG fixes (commit 9bf2101 deployed ~60s, build-info reports 9bf2101)

Work Log:
- build-info: production commit = 9bf2101 (origin/main HEAD) — SYNCED verified via git fetch + rev-parse equality
- CF cache note (documented, out of scope by order): plain HTML fetches served stale edge copies (cf-cache-status HIT, age up to ~8927s — pre-231 HTML with the old empty hrefs/og-home cards); every check below used a fresh cache key (?cb=…), which origin-serves the new build — the stale copies expire by their own TTL with zero config change
- SSR HTML (fresh keys, 8 surfaces): /evo — 5/5 platform hrefs carry https://alkemos.com/evo · /ar/evo — 5/5 carry /ar/evo · /for-coaches + /ar/for-coaches — 3/3 (FB/X/TG) carry the canonical URL with ZERO wa.me/whatsapp in the DOM · zero empty hrefs · zero cb/utm leakage on any surface · og:url correct on /evo /ar/evo /for-coaches /ar/for-coaches /blog /ar/blog /ar (/) — the /ar og:url fix (https://alkemos.com/ar) is LIVE
- Blog index EN+AR: independent metadata live — og:title «Fitness & Nutrition Blog | Alkemos» / «المدونة الرياضية — Alkemos», own og:url /blog + /ar/blog, og-blog-en/ar cards (no longer the homepage card); article metadata untouched
- OG images live: og-evo-en/ar + og-for-coaches-en/ar + og-blog-en/ar — all HTTP 200, content-type image/png, exactly 1200×630
- Tracker leakage: /evo opened with ?cb=29859&utm_source=x → all 5 share hrefs clean (0 leakage)
- Real WhatsApp click (desktop /evo): navigation landed on api.whatsapp.com/send with the FULL payload — «…available to everyone https://alkemos.com/evo» inside the text (the canonical URL rides in the share)
- Real blog article share (EN): /blog/choose-smartwatch-fitness-tracking opened WITH ?cb=… → WhatsApp button click → window.open payload «How to Choose a Smartwatch…\n\n…\n\nRead the full article on Alkemos: https://alkemos.com/blog/choose-smartwatch-fitness-tracking» — canonical article URL + zero cb/utm leakage
- Real AR blog article share: /ar/blog/best-omega-3-supplement-athletes → WhatsApp click → «…اقرأ المقال كاملاً على Alkemos: https://alkemos.com/ar/blog/best-omega-3-supplement-athletes» — AR canonical URL, zero leakage
- for-coaches live DOM: exactly Facebook/X/Telegram + Copy — WhatsApp absent (the decree holds on production); all targets carry the canonical URL
- Browser checks (agent-browser): desktop 1366×900 + iPhone 14 (390×844) on /evo, /ar/evo, /for-coaches, /ar/for-coaches, /blog, /ar/blog + two articles — ZERO page errors, ZERO console errors, ZERO hydration warnings, no horizontal overflow on mobile; Web Share button ABSENT on the no-API desktop with the Copy fallback present and FUNCTIONAL (click → copied Check state live); the Web Share conditional's positive branch (navigator.share present) is pinned by the mount test in share-url.test.tsx
- All checks recorded by scripts (local): scripts/live-verify-231.sh output + agent-browser transcripts (this session)

Stage Summary:
- Phase 231 verified LIVE end-to-end: unified engine ships identical hrefs from SSR, all platform decisions hold in production (for-coaches WhatsApp-free, blog Telegram-free, ShareButtons 5 platforms), OG metadata/cards correct on every fixed surface, no hydration/console errors desktop+mobile
- Remaining known risk (documented, out of scope): CF edge cache may keep serving pre-231 HTML per its own TTL until expiry — fresh keys and post-expiry fetches serve the new build
- Commit SHA: كوميت التوثيق هذا يلي كوميت الإصلاح 9bf2101
- Push status: pushed

---
Task ID: SHARE-UNIFY-231-2026-09-18
Agent: Super Z (main)
Task: Phase 231 — unify the three public share implementations over one engine + close the OG metadata gaps from the Deep Audit (owner order 2026-09-18 «نفّذ الآن جميع إصلاحات Social Sharing المتبقية من تقرير Deep Audit، كمرحلة واحدة بعد إغلاق Phase 230»)

Work Log:
- Session opened per AGENTS.md §3.6: origin/main HEAD = 4a267c3 (Phase 230 docs closure; fix d97a9a7 deployed) — the owner premise «بعد إغلاق Phase 230» verified before any change
- Audited the three components + every usage site + metadata: ShareButtons (12 surfaces, Phase-230 law), SocialShare in BlogComponents.tsx (blog articles — window.open + own `${baseUrl}/blog/…` parallel URL construction + render-time navigator probe), CoachShareButtons (for-coaches — url prop never passed by its only caller → post-mount window.location fallback, WhatsApp absent by decree)
- Audited metadata: /ar (og:url absent — layout block has no url), /blog + /ar/blog (no openGraph/twitter blocks → inherited the ROOT/ar-layout homepage cards), /evo + /ar/evo (og-home cards), /for-coaches + /ar/for-coaches (vertical coach-portrait.jpg 1122×1402 as og:image + twitter:image), programs/coaching/memberships (+ AR mirrors — own og:url correct + documented family-card decision §12.53 item 4 → review-only verdict, no new images)
- Implemented the engine: src/lib/share-links.ts (buildShareLinks — the ONLY share-intent builder; 5 payload formats verbatim; per-surface fbQuote policy: title on ShareButtons, full text on blog/coach; platforms = per-surface config) + src/components/share/useShareActions.ts (copy with execCommand fallback + post-mount Web Share detection — removes the blog bar's render-time navigator probe = latent hydration mismatch; nativeShare: AbortError silent, real failure → copy)
- Migrated the three components as thin wrappers (JSX/classes/icons/labels/texts unchanged): ShareButtons (5 platforms), SocialShare (FB/LI/X/WA — no Telegram as before; props url/ogUrl/image → path + title/description/lang; dead ogUrl/image props deleted with call-site args per §3.8), CoachShareButtons (FB/X/TG — REQUIRED path prop, window.location/mountedUrl retired; labelFor map keeps caller-localized labels)
- Call sites: BlogArticlePage articleUrl = canonicalShareUrl(`/blog/${post.slug}`, lang) (identical output, single source) + SocialShare path prop; for-coaches page passes path="/for-coaches"
- OG cards: +6 SPECS in scripts/generate-og-cards.py (og-evo-en/ar, og-for-coaches-en/ar, og-blog-en/ar — timeless copy, no counts); generator re-run → 20 cards; the original 14 regenerated BYTE-IDENTICAL (deterministic) — only 6 new files added; visual check: AR cards render correct RTL shaping with mirrored brand header/footer
- Metadata edits: src/app/ar/page.tsx (full openGraph block with url=https://alkemos.com/ar — page-level because a child openGraph REPLACES the parent's and a layout-level url would leak to every /ar/* child), /blog + /ar/blog (independent openGraph+twitter: index title/desc/url + og-blog cards), evo layouts EN/AR (og-evo-en/ar + twitter), for-coaches layouts EN/AR (og-for-coaches-en/ar 1200×630 + twitter; page hero portrait untouched)
- Tests: NEW src/lib/__tests__/share-unify.test.tsx ×14 (engine payload formats + hostile-payload encoding; CoachShareButtons SSR EN/AR full canonical URL from first render + ZERO wa.me/whatsapp + copy present; SocialShare clicks open the FULL canonical article URL via window.open EN+AR + no Telegram + Web Share absent without API + copy fallback present; THE COVERAGE GUARD — walks src/**, every <ShareButtons/<SocialShare/<CoachShareButtons usage must be in REGISTERED_SURFACES with its deterministic path (15 registered), unregistered surface fails CI, guard self-checks it actually finds usages) · share-url.test.tsx scope-law test REPLACED by the unification law (no hand-built intents / window.location / mountedUrl in ANY share component + platform decisions pinned: coach ["facebook","x","telegram"], blog ["facebook","linkedin","x","whatsapp"]) · og-image-coverage.test.ts extended (+6 cards, evo pair re-pointed, for-coaches + blog index pairs added)
- Gates: tsc 0 · eslint 0/0 · vitest 1514/1514 (90 files, +19 net) · next build 0 · SSR smoke on `next start`: /evo all 5 hrefs carry https://alkemos.com/evo EN+AR from first render; /for-coaches + /ar/for-coaches FB/X/TG carry the canonical URL, zero wa.me; og:url present on /ar, /blog, /ar/blog; og-evo/og-for-coaches/og-blog cards on all six surfaces; stale-refs/ui-wiring/docs_parity/migration_audit/docs_audit ✓ (phase=231)
- Docs: STATE.md → phase 231 (exactly 100 lines — sanctioned merges: (٠٠) 226+225 and QA rows 228+227) · README Phase-231 feature bullet + stale Phase-230 scope sentence corrected · this entry

Stage Summary:
- One engine + one hook + three thin wrappers; every public share surface now builds its URL from the Phase-230 single source (canonicalShareUrl) with its platforms as config; no window.location anywhere in the share layer; the WhatsApp decree and every platform set preserved verbatim; documented behavioral micro-deltas of the unification: blog copy gains the execCommand fallback, blog Web Share button appears post-mount (same end state, no hydration mismatch), native-share real failures fall back to copy on every surface (cancel stays silent)
- OG gaps closed: /ar og:url · independent /blog + /ar/blog metadata · dedicated EVO EN/AR cards · horizontal 1200×630 for-coaches cards · dedicated blog-index cards; programs/coaching/memberships reviewed and intentionally untouched (documented verdict)
- Remaining risks: none known in code; CF cache may serve pre-231 HTML for up to ~1h after deploy (documented in the Phase-230 audit; out of scope by order)
- Commit SHA: كوميت هذه المرحلة نفسه يحمل هذا المدخل (SHA النهائي يُعلن بعد الدفع)
- Push status: pushed (بعد هذا المدخل مباشرة — التحقق الحي يليه في مدخل SHARE-UNIFY-231-LIVE-VERIF)

---
Task ID: SHARE-P0-230-LIVE-VERIF-2026-09-18
Agent: Super Z (main)
Task: التحقق الحي على alkemos.com بعد دفع المرحلة 230 (d97a9a7d) — تنفيذًا لأمر المالك «اختبر السلوك الفعلي على الإنتاج إن أمكن، Desktop + Mobile · تحقق من عدم وجود hydration errors أو console errors · تحقق بعد الـpush أن الإنتاج يعمل بنفس الإصلاح».

Work Log:
- النشر: d97a9a7d دُفع → Vercel نشره خلال ~75ث (build-info حي يؤكد: commitShort=d97a9a7) — الفحوص عبر تجاوز مخزن CF بمعامل ?cb= (والحكم على التسريب بذات المعامل).
- SSR حي لكل أسطح ShareButtons القابلة للـSSR (16 فحصًا EN+AR): /evo · /ar/evo · /tools/water-tracker زوجًا · /exercises/34-sit-up زوجًا · /foods/chicken-breast زوجًا · /programs/home-fat-loss-hiit زوجًا · /meal-planner زوجًا · /coaching زوجًا · /memberships زوجًا — **كل واحد: 5 روابط (wa.me · FB sharer · X intent · LinkedIn · Telegram) تحمل الـcanonical الكامل للصفحة نفسها (بما فيها مسار /ar للمرايا) وصفر تسريب لمعامل cb داخل أي share href** — النتيجة PASS=16 FAIL=0.
- الأسطح المحكومة بالنتائج (bmi/body-fat/calorie/macro): كتلة المشاركة لا تُرندر في SSR قبل حساب نتيجة (بالتصميم — لا شيء يُسرreg) — تحقق حي بالمتصفح على BMI (حساب فعلي 175سم/70كغ): 5 روابط ظهرت كلها تحمل https://alkemos.com/tools/bmi-calculator كاملًا (نفس البنية والأداة والنمط للثلاث الباقية — محمية بوحدات share-url.test.tsx).
- نقرة واتساب فعلية حيًا على /evo (Desktop): التبويب الجديد وصل api.whatsapp.com/send/?text=EVO+—+AI+Coach+…+https%3A%2F%2Falkemos.com%2Fevo — **الرابط الكامل داخل حمولة واتساب من أول مشاركة** (العَرَض الذي أبلغ عنه المالك مُصلح جذريًا).
- iPhone 14 (محاكاة) على /ar/evo: صفر أخطاء كونسول وصفر hydration errors · التسمية العربية «شارك صفحة EVO» · الروابط الثلاثة المفحوصة (wa/li/tg) تحمل https://alkemos.com/ar/evo · زر النسخ (fallback) حاضر · زر Web Share الأصلي حاضر البيئة الداعمة (يُعرض شرطيًا بالدعم) — وعلى دسكتوب بلا navigator.share اختفى الزر الأصلي وبقي النسخ (سلوك القانون الجديد حيًا).
- ملاحظة تحقق: معامل cb يظهر مرة واحدة في HTML الحي داخل حمولة RSC الداخلية لـNext.js نفسها (serverProvidedParams) — ليس داخل أي share href (فحص صفر تطابق) — ليست تسريبًا من نظام المشاركة.
- التوثيق نفس الجلسة: هذا المدخل — STATE.md مدخل 230 يحمل إشارة إليه.

Stage Summary:
- الإنتاج (d97a9a7d) يعمل بنفس الإصلاح حيًا: كل أسطح ShareButtons الـ12 تشارك canonical كاملًا من أول بايت يصل المتصفح — لا نافذة فارغة ولا تسريب متتبعات — EN وAR — Desktop وMobile — بصفر أخطاء كونسول/hydration.
- أعراض المالك الثلاثة (واتساب بلا رابط · وميض يختفي · مشاركة لا تعمل) مُغلقة جذريًا وبنيةً (لا تعتمد على توقيت hydration إطلاقًا).
- المخاطر المتبقية الموثقة: كاش حافة CF قد يخدم HTML البناء السابق حتى ~ساعة لأي زائر بعد أي نشر (موثق 227/229 — خارج نطاق هذا الأمر بقيد 12) · CoachShareButtons (for-coaches) ما زال بنمط mountedUrl بإبقاءه مقصودًا بقيد 10 — يُوصى بفتحه كنقطة متابعة مستقلة.
- Commit SHA: كوميت docs هذا يحمل هذا المدخل
- Push status: pushed
---
Task ID: SHARE-P0-230-2026-09-18
Agent: Super Z (main)
Task: تنفيذ P0 بالكامل من تقرير Deep Audit لنظام Social Sharing (أمر المالك 2026-09-18 «نفّذ الآن P0 بالكامل…»): روابط مشاركة canonical حتمية من أول SSR عبر مصدر موحّد، منع الـhref الفارغ بنيويًا، منع تسريب query/hash، Web Share شرطي بالدعم مع fallback نسخ — 13 قيدًا صريحًا (بلا مساس SocialShare/CoachShareButtons/metadata/OG/CF-cache/business logic/API/DB).

Work Log:
- المصدر الوحيد الجديد src/lib/share-url.ts — canonicalShareUrl(path, lang): URL مطلق كامل من أول رندر · بادئة /ar للمرايا (idempotent — لا تكرار أبدًا) · strip هيكلي لquery/hash (utm_*/cb لا تصل لمشاركة أبدًا) · تطبيع الشرطات · collapse الجذر للأصل المجرد (لا URL فارغ بنيويًا).
- ShareButtons.tsx: prop `path` إلزامي (بوابة TypeScript نفسها تمنع أي استخدام مستقبلي بلا رابط حتمي) · إسقاط mountedUrl/useEffect/window.location كليًا (الاعتماد على location كان يترك hrefs فارغة قبل hydration — وقبل إصلاح 227 كان يتركها دائمة في DOM الحي بسبب عدم ترقيع React لسمات الاختلاف) · زر Web Share يُعرض فقط عند توفر navigator.share (يُحل بعد mount بstate أولية false — رندر أول متطابق سيرفرًا وعميلًا: صفر خطر hydration mismatch) وزر النسخ دائمًا ظاهر كfallback صريح (السابقة: زر أصلي ميت صامت على دسكتوب بلا API) · المنصات الخمس وpayload الرسائل والنصوص والأصناف بلا تغيير حرفيًا.
- الـ12 استخدامًا تمرر path: /evo · /coaching · /memberships · /meal-planner · /tools/{bmi,body-fat,calorie,macro,water-tracker} (ثابتة) · /exercises/{slug} · /foods/{food.slug} · /programs/{program.slug} (من الـslug — المرايا AR تعيد تصدير نفس المكونات ثنائية اللغة فالمسار الواحد يغطي اللغتين عبر useI18n URL-first).
- الحارس share-url.test.tsx ×18: وحدات canonicalShareUrl ×8 (EN/AR · idempotent · strip utm/cb/# · تطبيع شرطات · collapse الجذر) · SSR renderToStaticMarkup ×7 (EN: واتساب/FB/X/LI/TG تحمل الرابط الكامل من أول render + صفر href فارغ بأنماط u=& وurl=" و?url=& + صفر تسريب مع path محمّل ب?cb&utm# + AR: مسار /ar كامل بلا EN + نسخ fallback موجود + زر Web Share غائب عن SSR) · mount test (navigator.share محاكى → الزر يظهر بعد التركيب) · حراس مصدر ×3 (كل الـ12 سطحًا يمرر path الصحيح حرفيًا · لا window.location ولا mountedUrl في كود ShareButtons بعد تجريد التعليقات · حرس نطاق: واتساب المدونة وسطر for-coaches كما هما — لم يُمسا).
- البوابات: tsc 0 · eslint 0/0 · vitest 1495/1495 (88 ملفًا — +18) · build 0 · check-stale-refs ✓ · check-ui-wiring ✓ (66 هدفًا كلها تحل) · docs_parity ✓ · migration_audit ✓ (صفر انحراف) · docs_audit (phase=230) ✓ (STATE عند 100 سطر بالضبط — ضُغط سطر 224 التاريخي في سطر 223→215) · ملاحظة بيئية: فحصا I/J فشلا على النسخة الضحلة قبل التعميق (نفس موثق 229) ونجحا بعد unshallow.
- README.md: مدخل Phase 230 بقسم For Users (قانون Feature README §3.8 — تعديل مهم لميزة قائمة) · STATE.md → المرحلة 230 (ترويسة + سلسلة + مدخل + صف QA).
- الالتزام الصريح بالقيد 9/10: SocialShare (BlogComponents.tsx) وCoachShareButtons.tsx صفر بايت تغيير (محرسًا باختبار).

Stage Summary:
- قانون SHARE URL LAW ساري: لا href فارغ بنيويًا في SSR ولا قبل hydration على أي من الـ12 سطحًا (EN+AR)، ولا تسريب متتبعات إلى أي مشاركة، والرابط دائمًا canonical على alkemos.com.
- النطاق مُحترم حرفيًا: صفر مساس بالمدونة/for-coaches/الميتاداتا/بطاقات OG/كاش CF/منطق الأعمال/API/DB.
- كل بنود الاختبار الإلزامية للأمر مغطاة باختبارات (SSR نظيف، واتساب بالرابط من أول render، المنصات الخمس، لا تسريب، EN+AR، Web Share شرطي، copy fallback، الـ12 موضعًا، حرس منع عودة SSR empty URL).
- Commit SHA: كوميت هذه المرحلة نفسه يحمل هذا المدخل (SHA النهائي يُعلن بعد الدفع)
- Push status: pushed (بعد هذا المدخل مباشرة — التحقق الحي يليه في مدخل SHARE-P0-230-LIVE-VERIF)
---
Task ID: AUDIT-DECISIONS-229-2026-09-18
Agent: Super Z (main)
Task: تنفيذ قرار المالك m7/أ (حذف fee_per_client من معادلة تكلفة تفعيل المدرب — تسعير ثابت فقط) + إغلاق بنود §5 المتاحة (إلغاء تجربة PayPal بقرار المالك · تحقق برمجي + قائمة فحص المالك للأربع الباقية) — أمر المالك 2026-09-18: «أولًا m7 موافق على (أ)، باقي البنود الخمسة ألغِ تجربة PayPal، باقي البنود موافق ابدأ التنفيذ ثم وثّق وادفع».

Work Log:
- m7 (قرار أ — منطق دفع §7 بموافقة مسبقة صريحة): coach-limits.ts — coachActivationCostUsd(months) دالة أحادية المُعامل: الباقات تفوز دائمًا (6$/16$) وغير الباقات خطية على 6$/شهر؛ حُذف feePerClient كليًا.
- activate/route.ts: حُذف قراءة coach_fees من بوابة المحفظة (استعلام واحد أقل) — walletCost = coachActivationCostUsd(months) والبوابة 402 كما هي؛ فحص missing-table انتقل لwalletRes وحده.
- إحالة مسار الرسم الخاص للتقاعد: git rm لـ /api/admin/coach-fees (GET+PATCH) + إزالة adminCoachFeeBodySchema من validation/schemas.ts + إزالة كتلة اختباره (−4) من validation-schemas.test.ts + إضافة المسار والمخطط لمعرفات check-stale-refs.sh المحظورة (مناعة ضد العودة).
- توحيد العرض على المصدر الوحيد coach-limits.ts: CoachWalletView (شاشة «سعر تفعيل العميل» الثابتة مكان الرسم الشخصي) · /api/coach/wallet (حذف حقلي fee من الحمولة) · /api/admin/wallets + AdminWalletsView (عمود سعر ثابت) · admin/finances (عمود سعر/عمود فاتورة متوقعة = ثابت × عدد العملاء) · AdminAssignmentsView (قسم «اشتراك المدربين» صار قراءة فقط من staff/counts — حُذف المحرّر وخانات الإدخال وsaveFee/refreshFees).
- تعليقات التصحيح: site-assignments/coach-payments/wallet routes + TECH_REFERENCE (جدول coach_fees تراثي) — جدول coach_fees نفسه لم يُمس (لا هجرة — بيانات جامدة).
- اختبارات جديدة: coach-activation-cost.test.ts ×5 (الباقات تفوز · غيرها خطي على 6$ · كل مدة 1..12 > 0 · المعادلة أحادية المُعامل length=1 · مصدر الحزم كما هو).
- §5: PayPal الحي أُلغي بأمر المالك (موثّك كملغى بقرار — لن يُختبر) · Google OAuth: السلسلة موصولة كاملة بالكود (AuthView → signInWithOAuth(google) → /auth/callback PKCE → middleware) · البريد الخارجي: مسار الإرسال ناجح موثق (200) والتسليم بفحص صندوق المالك · واجهة Admin: مسارات الـAPI مُحققة 401/403 بحسب الدور والشاشات بجولة مالك · B2C: زر التحويل جاهز بواجهة /admin/coaches (سطر المدرب → مفتاح النوع) — قائمة فحص المالك الحرفية أُلحقت بتقرير التدقيق §8 (قانون §12.9).
- التوثيق نفس الفريم: تقرير التدقيق (تحديث 229 بالترويسة + صف m7 Fixed + صف §5 + §6 محلولة + §7 حالة التنفيذ + القائمة بالملحق §8) · STATE.md → المرحلة 229 (ترويسة + سلسلة + مدخل + المفتوح + صف QA — 99 سطرًا) · SECURITY.md (Pricing authority بالقرار الجديد + ترويستها) · README.md (Wallet System + Coach System Center + ترويستها) · TECH_REFERENCE.md (علامة تراثي على coach_fees).
- البوابات: tsc 0 · eslint 0/0 · vitest 1477/1477 (87 ملفًا) · build 0 · check-stale-refs ✓ · check-ui-wiring ✓ (66 هدفًا كلها تحل) · docs_parity ✓ · migration_audit ✓ (صفر انحراف) · docs_audit (phase=229) ✓ — علماً بأن فحص J تطلب تعميق النسخة (blobless deepen) لأن نقطة التطعيم بالنسخة الضحلة كانت تزعم تعديل الملفات المجمدة (أثر بيئة محلية لا يظهر بـCI الكامل).
- الدفع: مؤجل لطلب مفتاح PAT من المالك (تعليمة المالك الدائمة «اذا اردت اى مفاتيح او تدخل منى توقف واطلبها» — البيئة الحالية بلا اعتماديات git) — الكوميت جاهز محليًا.

Stage Summary:
- m7 مُصلح جذريًا بقرار (أ): مصدر واحد للتسعير (coach-limits.ts) — المعادلة نقية في المدة، والواجهات الخمس المالية موحدة عليه، ومسار الرسم الشخصي متقاعد بحارس مناعة.
- §5 مُغلقة بما يملكه الوكيل: PayPal ملغى بقرار؛ الأربع الباقية بقائمة فحص المالك §8 (لا بنود متبقية قابلة للتنفيذ من جانب الوكيل).
- كل بنود تقرير DEEP-UX-AUDIT-2026-09-18 منفذة الآن (C1/H1/M1/M2/m1-m9/§5) — الباقي الوحيد: التأكيد الحي بعد النشر (اختياري لمسار 1/3 شهور الذي لم يتغير سعره بالتصميم) + جولات المالك الحية.
- Commit SHA: كوميت هذه المرحلة نفسه يحمل هذا المدخل (SHA النهائي يُعلن بتقرير الجلسة §12.9 بعد الدفع)
- Push status: not-pushed (بانتظار PAT من المالك)
---
Task ID: AUDIT-DECISIONS-228-LIVE-VERIF-2026-09-18
Agent: Super Z (main)
Task: التحقق الحي على alkemos.com بعد دفع المرحلة 228 (ac5942c8) — تنفيذًا لأمر المالك: «أضف رصيدًا للاختبار من حساب الأدمن إلى حساب المدرب ثم أكمل الاختبارات، عدد الأدوات الصحيح + مخططات الذكاء الاصطناعي ومخطط الوجبات».

Work Log:
- النشر: ac5942c8 دُفع → Vercel نشره خلال ~100ث (build-info يؤكد) — ملاحظة سابقة عن كاش حافة CF طُبّقت (تجاوز مخزن بمعامل cb عند الحاجة)
- تجهيز وسائل الاختبار (بأمر المالك): مدرب QA جديد qa.audit228.coach1 عبر التسجيل الذاتي العام (POST /api/coach/register 200) → دخول → محرر صفحة الهبوط → حفظ slug ‏qa-audit-coach-228 (draft/pending كما يفرض قانون مراجعة 0046) · عميل QA جديد qa.audit228.client1 عبر ‎/auth?coach=qa-audit-coach-228 (تعيين 0033 مؤكد قراءة-فقط: coach_assignments → المدرب)
- **رصيد الأدمن إلى المدرب (أمر المالك):** Management API SQL ينفذ بالضبط ما يفعله POST /api/admin/wallets/adjust: SELECT coach_adjust_wallet(p_coach_id=مدرب QA, p_amount=6.00, p_kind='adjust', p_note='QA test credit — audit 228 live verification (owner-ordered, from admin)', p_created_by=<ADMIN_ID>) عبر set_config خدمي مؤقت بالمعاملة (حارس الدالة يطلب service_role/admin) + نفس إشعار wallet_adjusted الذي يرسله المسار — السجل يحمل created_by=الأدمن (من قام بالإضافة) والكاتب المعتمد وحده (قانون المحفظة 0035: row-lock + ledger + لا سالب) — المحفظة 0 → 6.00
- **M1-أ حيًا (الحالة (أ) من M1):** جلسة المدرب بواجهة EN → صفحة العميل → تبويب الاشتراك → تفعيل coaching شهر بمحفظة 0$ → 402 → توست «Your wallet balance ($0) is not enough to activate 1 month — $6 is required. Top up your wallet first…» — صفر حروف عربية داخل الواجهة الإنجليزية (عيب M1-أ الأصلي مؤكد إصلاحه حيًا)
- **التفعيل E2E:** بعد الرصيد: زر التحديث → نجاح — قراءة-فقط: المحفظة 6.00 → 0.00 · subscriptions: coaching نشط 2026-09-18 → 2026-10-18 · coach_payments: سطر (شهر 1 · cash) · إشعار العميل «تم تفعيل اشتراكك 🎉» (subscription_activated)
- **مخططات الذكاء الاصطناعي + مخطط الوجبات (أمر المالك):** جلسة العميل (coaching الآن): /ai-workout-planner ولّد نظامًا فعلًا (تمارين ومجموعات ظاهرة) · /ai-meal-planner ولّد خطة يوم فعلية (+40ث — مسار السلسلة الحرة بسلسلتي إعادة مشروعتين عند انحراف الشكل؛ شوط سابق رجع 422 صريحًا «المحاولة الفاشلة لا تُحسب») — القاعدة تؤكد: صفا plans فعلان (meal ‏«AI Meal Plan — 2000 kcal» + workout ‏«AI Workout Plan — 3 days») ورصيدا البوول الموحد ai_plan_usage (nutrition+workout success-only) · /meal-planner اليدوي يحمل H1 وباني الوجبات
- **M2 حيًا:** EN: ببريد مسجل → شاشة «Account already exists» + البريد صدى + زر Go to login ينتقل للدخول والبريد محفوظ · AR (قلب اللغة بالصفحة): «هذا البريد مسجل بالفعل» — صفر «افحص بريدك/تحقق من بريدك» بالغتين (اختبار مزدوج حي)
- **m4 حيًا:** /profile بحساب العميل: بطاقة Tools = 8 (كانت 6)
- **m3 حيًا (مسار كامل):** فتح ودجت EVO → إرسال «QA 228 test message» → المرآة mhe:evo-chat تحمل الرسالة والرد → خروج من البروفايل → المرآة {"messages":[]} — المحادثة اختفت من الجهاز فعلًا
- تنظيف: لا شيء حُذف — كل أثر QA موثق بتقرير §8 للتنظيف عند الإغلاق الكلي (حسابا 228 + الهبوط draft + رصيد استُهلك + سطر دفع + خطتا AI + رصيدا بوول + 3 إشعارات)

Stage Summary:
- كل بنود الأمر منفذة ومتحققة حيًا: رصيد الأدمن → المدرب ✓ · الاختبارات اكتملت (M1-أ 402 · تفعيل E2E · مولدا AI بخطط فعلية · مخطط الوجبات · M2 EN+AR · m4=8 · m3 مسح الخروج) ✓ · المتبقي الوحيد للمالك: قرار m7 (منطق دفع §7) + وسائل §5 غير المغطاة (PayPal حي/OAuth/بريد خارجي/Admin UI/B2C)
- Commit SHA: ac5942c8 (التنفيذ) + كوميت الإغلاق التوثيقي هذا
- Push status: pushed — SYNCED

---
Task ID: AUDIT-DECISIONS-228-2026-09-18
Agent: Super Z (main)
Task: أمر المالك 2026-09-18 — تنفيذ قرارات المنتج على بنود تدقيق DEEP-UX-AUDIT-2026-09-18 المتبقية: «نفّذ: البريد بدون تأكيد، أضف رصيدًا للاختبار من حساب الأدمن إلى حساب المدرب ثم أكمل الاختبارات، عدد الأدوات الصحيح + مخططات الذكاء الاصطناعي ومخطط الوجبات، نفّذ أي بند آخر متبقٍ، إن احتجت أي مفاتيح أو تدخلًا مني توقف واطلبها» — استئناف نفس منهجية 227 (جذر → إصلاح → بوابات → سلوكي → توثيق → دفع → تحقق حي).

Work Log:
- بروتوكول §3.6: STATE.md (227) + AGENTS.md + git fetch → متزامن (c04ff205) — النطاق من الأمر: m9/M2 (قرار البريد: بلا تأكيد) · m4 (قرار العدد) · m3 (تفويض شامل) · وسائل اختبار §5 جزئيًا (رصيد من الأدمن) — m7 استُبعد (منطق دفع §7 يتطلب اختيارًا صريحًا بين خيارين — يُرفع بالتقرير الختامي) وC1 لم يُمس (مغلق بأمر)
- M2 — تشخيص جذري حي قبل أي إصلاح: POST حي إلى GoTrue الإنتاج ببريد مسجل (qa.audit227.free1) أعاد HTTP **200 بلا خطأ** بمستخدم زائف: id وهمي + **identities: []** + confirmation_sent_at زائف + بلا جلسة (سلوك anti-enumeration) — إعادة الدخول الفورية بكلمة المرور الجديدة تفشل (لا تنتمي لأي حساب) فيسقط المسار القديم لشاشة «افحص بريدك» بينما SMTP غير مهيأ ولا يُرسل بريد أصلًا (المسدود المضلل M2 كما وثّقه التدقيق) — المميّز الحاسم: التسجيل الحقيقي يحمل ≥1 هوية والمكرر يحمل صفرًا
- M2 — الإصلاح (طبقة عرض صرفة، صفر API/DB): src/lib/auth-signup-signals.ts (isDuplicateEmailSignup — نقية وقابلة للاختبار) تُحسَن في signUpEmail فور عودة signUp بلا خطىً → إرجاع duplicateEmail مبكرًا (بلا إشعار new_client زائف لمستخدم لم يُنشأ قط) · تمرير العلم عبر useAuth (signUp wrapper + نوع السياق) · AuthView: شاشة «هذا البريد مسجل بالفعل — سجّل دخولك» بغتين (نفس بنية شاشة M6 + زر انتقال للدخول والإيميل محفوظ) — احترام قرار m9: التسجيل يبقى فوريًا بلا تأكيد
- m3 — الجذر: مرآة mhe:evo-chat تُحفظ لكل تغيير حالة (للجميع — حتى المدفوع كمرآة offline) ولا يمسحها شيء عند الخروج → مستخدم الجهاز التالي يقرأ محادثة سابقه. الإصلاح بنصفين متلازمين (أحدهما وحده ينكسر): evo-chat-events.ts (الموديول الصغير — قانون الحزمة نفسه) يحمل EVO_CHAT_STORAGE_KEY + resetEvoChatOnSignOut() (مسح المرآة + بث EVO_RESET_CHAT_EVENT) · signOut() في data/auth.ts يستدعيها (مسار التصفية الوحيد — كلا موقعي الزر يمران به) · المزود المركّب (evo-chat-context) يصفّر حالته الذاكرية عند الحدث — وإلا أعاد حفظ الرسائل القديمة في أول تغيير حالة لاحق
- m4 — الجذر: إحصائية Tools بصفحة البروفايل رقم صلب «6» (src/app/profile/page.tsx:288) بينما المركز يخدم 8 (Phase 195: «الرقم الحقيقي للأدوات هو 8») والتسويق «8+». الإصلاح بقرار المالك «عدد الأدوات الصحيح + مخططات الذكاء الاصطناعي ومخطط الوجبات»: value = TOOLS_COUNT من tools-shared (المصدر الواحد للمصفوفة نفسها — نفس نمط EXERCISES_COUNT/FOODS_COUNT الموجود بالملف أصلًا)
- الاختبارات: auth-signup-signals.test.ts ×4 (بشكل إجابة GoTrue الحية المسجلة حرفيًا + السالب الحاسم: تسجيل حقيقي ليس مكررًا + fallback صادق) · evo-chat-signout-wipe.test.ts ×6 (سلوك الموديول بـjsdom + كاناري توصيل: signOut يستدعي المسح والمزود يستمع للحدث والمفتاح المشترك بلا نسخة محلية) · library-counts.test.ts +كاناري m4 ×2 (استيراد TOOLS_COUNT + منع عودة الرقم الصلب)
- البوابات: tsc 0 · eslint 0/0 · vitest 1474/1474 (86 ملفًا +12) · build 0 · stale-refs/ui-wiring/docs_parity/docs_audit (phase=228) ✓
- التحقق السلوكي المحلي ببناء الإنتاج (E2E Playwright، بذر demo يدوي لأن seedLocalData يرفض الإنتاج): بروفايل Tools=8 (كان 6) · بذر مرآة محادثة ثم الخروج → المرآة صفر رسائل والمحادثة الخاصة اختفت (يثبت نصف الحدث من طرف المتصفح فعلًا) · مسار demo المكرر = توست خطأ بلا شاشة تأكيد (لا انحدار)
- STATE.md → المرحلة 228 (ترويسة + مدخل + بنك مفتوح + صف QA — دمجتان معتمدتان (226+225) و(218+217+216+215) = 100 سطر بالضبط) — سكربتات الجلسة خارج المستودع كالعادة (state_228_update.py · phase228_local_e2e_prod.js · …)

Stage Summary:
- M2+m9 ✓ · m3 ✓ · m4 ✓ منفذة بجذور مؤكدة (M2 حيًا ضد GoTrue) — m7 بقي قرار المنتج الوحيد (§7 دفع) — التحقق الحي بعد الدفع (رصيد الأدمن → مدرب QA → M1-أ 402/التفعيل/مخططات AI/البروفايل/مسح الخروج) موثق بمدخل worklog التالي بنفس الجلسة
- Commit SHA: ac5942c8
- Push status: pushed — SYNCED

---
Task ID: AUDIT-FIXES-227-LIVE-VERIF-2026-09-18
Agent: Super Z (main)

Task: التحقق الحي على الإنتاج (alkemos.com) بعد دفع المرحلة 227 (214bd3cb) — الموعود بذيل كوميت الإصلاح («موثق بمدخل worklog التالي بنفس الجلسة»): إثبات أن كل بند من البنود السبعة المنفذة يعمل فعلًا ببيئة الإنتاج الحقيقية.

Work Log:
- النشر: Vercel أكمل خلال ~75 ثانية — build-info حي = 214bd3cb على main ✓
- **H1 ✓✓ (زائر مجهول ببروفايل نظيف):** صفر أخطاء hydration على 9 صفحات EN+AR (الرئيسية · memberships · coaching · evo · for-coaches + مرايا ar الأربع — كلها كانت تفشل بـ#418) · روابط المشاركة الحية على /memberships تحمل العنوان الحقيقي alkemos.com/memberships في الخمس (كانت فارغة — المشاركة كانت معطوبة) · صفر أخطاء عبر E2E كامل بالجلسة
- **m1 ✓✓:** فوتر EN 33/33 + AR 33/33 رابطًا كلها ≥24×24px @390px
- **m2 ✓✓:** درج EVO 390px full-bleed + حقل الإدخال 274px (كان ~252) @390px
- **M1-ب ✓✓:** دخول بكلمة مرور خاطئة داخل الواجهة العربية → التوست «البريد الإلكتروني أو كلمة المرور غير صحيحة.» (كانت «Invalid login credentials» خام إنجليزية) — مسار المحفظة 402 (أ) متحقق بالاختبارات الاثني عشر + نفس مسار العرض؛ تحققه الحي الكامل يبقى اختياريًا للمالك بجلسة مدرب
- **حساب QA جديد (qa.audit227.free1@alkemos-test.com — التسجيل المفتوح الفوري):** m8 ✓✓ المؤشر حي على نموذج تسجيل الإنتاج (Weak لكلمة ضعيفة · Strong لقوية + الإرشاد) · m5 ✓✓ استبيان حقيقي خزّن نفس رموز التدقيق الخام (lose_fat/home/beginner/strength/dumbbells + keto) والمراجعة الحية تعرض Lose fat · Home · Beginner · Strength training · Dumbbells · Keto — صفر رموز خام متبقية · m6 ✓✓ بطاقة /plans للباقة المجانية تعرض «Weekly meal & exercise swaps are a Premium feature — your current plan doesn't include them yet.» + رابط See memberships → /memberships — لا «0/0»
- **اكتشاف تشغيلي (موثق بتقرير §8):** Cloudflare يخدم HTML قديمًا من حافة الكاش حتى ~ساعة رغم max-age=300 من الأصل — أول فحص لـ/ أعاد HTML عمره 3594ث (بلا إصلاحات m1/m2) بينما /memberships عمره 70ث (بها) — كل الفحوص أُعيدت بعناوين مُخزَّنة تجاوزًا (?cb=) فجاءت كلها من الأصل ✓ — ملاحظة نشر للمالك: أي دفعة HTML قد تتأخر ظهورًا حتى ~ساعة على الحافة
- توثيق الإغلاق: تقرير التدقيق §0 حُدّث للتصنيف النهائي «Fixed + Verified — حيًا على alkemos.com» للبنود السبعة + حساب qa.audit227.free1 بملحق الاستئناف §8 + ملاحظة كاش CF · STATE.md: ترويسة 227 + ذيل مدخل (٠٠) 227 + صف QA 227 يحملون النتائج الحية (100 سطر بالضبط) · هذا المدخل

Stage Summary:
- البنود السبعة المنفذة بالمرحلة 227 كلها Fixed + Verified حيًا على الإنتاج (H1/M1/m1/m2/m5/m6/m8) — M1-أ (رسالة المحفظة 402) متحقق بالوحدة ومسار العرض، وتحققه الحي الكامل اختياري للمالك بجلسة مدرب
- المتبقي المفتوح للمالك كما هو: قرارات المنتج الخمسة (m9 يحدد M2 · m3 · m4 · m7) + وسائل إغلاق §5 + تنظيف بيانات QA عند إغلاق التدقيق الكلي
- Commit SHA: كوميت الإغلاق التوثيقي لهذه الجلسة يحمل هذا المدخل نفسه (الدفع الأصلي للإصلاحات = 214bd3cb)
- Push status: pushed
Task ID: AUDIT-FIXES-227-2026-09-18
Agent: Super Z (main)

Task: أمر المالك 2026-09-18 — تنفيذ كل بند مفتوح قابل للتنفيذ من تقرير docs/DEEP-UX-AUDIT-REPORT-2026-09-18.md (C1 مغلق نهائيًا — لا يُعاد فحصه · استبعاد Not Testable وقرارات المنتج · تشخيص السبب الجذري قبل كل إصلاح · لا workaround شكلي · لا تغيير Business Logic/API/DB إلا ما يتطلبه إصلاح التقرير نفسه) ثم البوابات والاختبار السلوكي وتحديث التقرير وSTATE/worklog وcommit+push إلى main.

Work Log:
- بروتوكول §3.6 كاملًا: STATE.md (المرحلة 226) · AGENTS.md (281 سطرًا) · آخر مدخلات worklog · git fetch → متزامن مع origin/main (a0183de5) — تحديد النطاق: H1+M1+m1+m2+m5+m6+m8 قابلة للتنفيذ · M2/m3/m4/m7/m9 قرارات منتج · §5 Not Testable · C1 مغلق
- **H1 — تشخيص جذري قبل الإصلاح (منهجية التقرير نفسها):** إعادة الإنتاج بـ next dev + Playwright ببروفايل نظيف — React dev build طبّع عدم التطابق: سمات href لمكوّن ShareButtons تختلف سيرفر/عميل — الجذر: `shareUrl = url || (typeof window !== "undefined" ? window.location.href : "")` يُقرأ أثناء render (ShareButtons.tsx:30) — **اكتشاف جانبي بالفحص:** فحص DOM بعد الـ hydration أثبت أن روابط المشاركة الحية فارغة العنوان فعلًا (React لا يرقّع السمات المتنافرة — قيمة السيرفر الفارغة تبقى) = المشاركة كانت معطوبة وظيفيًا على الإنتاج ويعنيها نفس الجذر · المكوّن الأخوي CoachShareButtons.tsx:36 بنفس النمط (يكسر /ar/for-coaches ويشارك رابط EN من الصفحة العربية)
- **H1 — الإصلاح (جذري لا ترقيعي):** العنوان يُحل بعد mount فقط — `mountedUrl` state + useEffect (السيرفر وأول رندر عميل متطابقان حرفيًا ثم العنوان الحقيقي يُطبق) — `url` prop الحتمي كما هو · المصادر الأخرى بنفس النمط فُحصت ولم تُمس (auth.ts signInWithGoogle داخل معالج حدث · CoachLandingEditor بعد جلب بيانات — ليست أسباب hydration)
- **M1 — الجذر (مؤكد بالتقرير + الفحص):** طبقة العرض تعرض نصوص الخادم خامًا بلغتها (عربية داخل الإنجليزية بتفعيل المحفظة 402 · إنجليزية داخل العربية بـ«Invalid login credentials») — **الإصلاح بنمط i18n القياسي للـ APIs:** src/lib/error-i18n.ts — localizeApiError (كاتالوج من أكواد الأخطاء المستقرة يحمل الحمولة الرقمية balance/cost/months · AR تُبقي رسالة السيرفر حرفيًا كمصدر واحد · المجهول يمرّ حرفيًا — fallback صادق) + localizeAuthError (رسائل GoTrue الخام المعروفة → عربية) — موصول بنقطتي العرض: AuthView (دخول+تسجيل) وCoachClientView (تفعيل الاشتراك) — **صفر تغيير API/منطق أعمال/DB**
- **m1:** SiteFooter — مراسي السوشيال inline-flex h-8 w-8 (الأيقونة البصرية h-4 w-4 كما هي) + كل روابط الفوتر block py-1 (هدف لمس بعرض العمود وارتفاع 24px — WCAG 2.5.8 AA) + فجوة الصف gap-4→gap-2 · **m2:** EvoFloatingWidget — sm:max-w-[380px] (درج full-bleed على الجوال فقط وسطح المكتب 380px كما هو) + حشوة المؤلف p-3→p-2 وفجوة gap-2→gap-1.5 وحشوة الحقل px-4→px-3 — أزرار المايك/الإرسال 40px لم تُمس (روح m1) · **m5:** الجذر مؤكد ببيانات التدقيق الحية (قراءة-فقط §3.3 عبر Management API: استبيان حساب التدقيق خزّن goal=lose_fat · location=home · experience=beginner · preferred=strength · equipment=dumbbells — وطبقة العرض لم تكن تُأقلم إلا gender/activity) — src/lib/questionnaire-display.ts (رموز معروفة → تسميات ثنائية اللغة بتطبيع مسافات/شرطات/حالة · النص الحر يمرّ حرفيًا · الفارغ «—») موصول بمراجعة العضو (QuestionnairesView) وبطاقة المدرب (CoachClientView) · **m6:** بطاقة حصة البدائل — عند limit=0 (الـ Free=evoSwapLimit 0) رسالة plans.swaps.notIncluded + رابط upgradeCta إلى العضويات بدل «0/0 متبقي» المضلل (بغتين) · **m8:** src/lib/password-strength.ts — مؤشر ثلاثي + إرشاد تحت حقل كلمة المرور بالتسجيل فقط (aria-live) — عرض صرف: بوابات minlength=8 + HIBP (المرحلة 134) لم تتغير
- **حرّاس جدد:** src/lib/__tests__/error-i18n.test.ts (12) + questionnaire-display.test.ts (7) + password-strength.test.ts (5) — تثبّت عقود الأقلمة والـfallback الصادق
- **البوابات (فريم كود — كاملة):** tsc 0 · eslint 0/0 · **vitest 1462/1462** (84 ملفًا — +24) · next build 0 (بيئة دخان NEXT_PUBLIC_* حُقنت قبل البناء وحُذفت بعده — لم تُرفع) · check-stale-refs ✓ · check-ui-wiring ✓ · docs_audit (phase=227) · docs_parity/migration_audit ✓ (صفر ميجريشنز هذا الفريم)
- **الاختبار السلوكي (السلوك المتأثر فعليًا):** (1) بناء الإنتاج + Playwright ببروفايل نظيف: صفر أخطاء hydration على 10 صفحات EN+AR (memberships/coaching/evo/for-coaches/الرئيسية + تفاصيل تمرين — كانت تفشل كلها) + روابط المشاركة بالعناوين الحقيقية في DOM + فوتر 33/33 رابطًا ≥24×24px @390 + درج EVO 390px full-bleed بحقل 274px (كان ~252) ومساحة كتابة ~248px (كانت ~218) · (2) demo E2E: مراجعة استبيان برموز خام (lose_fat/home/beginner/strength/dumbbells/keto) → Lose fat/Home/Beginner/Strength training/Dumbbells/Keto — صفر رموز خام متبقية + بطاقة بدائل Free بالشرح والرابط + مؤشر كلمة المرور Weak/Strong/Too short وبنموذج الدخول لا مؤشر
- **التوثيق:** تقرير التدقيق حُدّث بـ§0 حالة التنفيذ (التصنيف الرباعي: Fixed+Verified/Fixed but Not Yet Verified/Not Testable/Requires Product Decision لكل بند) + شارات حالة على H1/M1/M2 وجدول MINOR و§7 · STATE.md → المرحلة 227 (مدخل + بنك المفتوح + صف QA + دمج صفّي QA معتمدان + طي سطر 182 المغلق = 100 سطر بالضبط) · هذا المدخل
- commit fix(...) + push → التكامل GitHub→Supabase بلا ميجريشنز هذا الفريم · التحقق الحي على alkemos.com بعد اكتمال نشر Vercel (زائر مجهول: H1/m1/m2 + حساب QA جديد بالتسجيل المفتوح: m5/m6/m8 + مسار الدخول M1-ب) موثق بمدخل worklog التالي بنفس الجلسة

Stage Summary:
- كل البنود القابلة للتنفيذ بالتقرير نُفذت فعليًا (ليس توثيقًا فقط): H1+M1+m1+m2+m5+m6+m8 — بلا أي تغيير Business Logic/API/DB (إصلاحات طبقة عرض + اختبارات)
- H1 أصلح معه خللًا وظيفيًا مكتشفًا: روابط المشاركة على الإنتاج كانت تشترك بعنوان فارغ (سمة السيرفر المتنافرة لا تُرقَّع) — الإصلاح الجذري أعاد المشاركة للعمل وأغلق #418
- المتبقي خارج التنفيذ بأمر المالك نفسه: قرارات المنتج الخمسة (m9 يحدد شكل M2 · m3 · m4 · m7 + وسائل §5) — موثقة بتقرير §0/§6 بانتظار المالك
- Commit SHA: 214bd3cb
- Push status: pushed
Task ID: C1-226-LIVE-VERIF-2026-09-18
Agent: Super Z (main)

Task: التحقق الحي T1–T6 بعد دفع المرحلة 226 (migration 0089) — الموعود بذيل كوميت b51305c1 («موثق بمدخل worklog التالي في نفس الجلسة») وبمدخل C1-FOREIGN-POLICIES-DROP-226 نفسه.

Work Log:
- الدفع: b51305c1 → origin/main (forward-only · SYNCED متحقق بعد fetch) — التكامل GitHub→Supabase طبق 0089 تلقائيًا خلال ~45 ثانية (poll على supabase_migrations: 20260918100000_0089_admin_notifications_foreign_policies_drop ظهر بالجولة الثالثة)
- **T1 ✓** آخر ميجريشنين مطبقين: 0089 (20260918100000) فوق 0088 (20260917210000) — التطبيق التلقائي سليم
- **T2 ✓** D1: relkind=r · rls_enabled=true — D2: **ثلاث سياسات فقط على admin_notifications وكلها كنسية**: admin_notifs_select_coach (SELECT·authenticated) · admin_notifs_insert_coach (INSERT·authenticated) · admin_notifs_update_coach (UPDATE·authenticated) — **الدخيلة الثلاث سقطت** (كانت 6 قبل 0089) والتشخيص المطبوع بسجل تشغيل 0089 نفسه يوثق حالة ما بعد الإسقاط
- **T3 ✓ — مقياس تسريب C1 = صفر:** محاكاة جلسة PostgREST لمدرب غير أدمن (auth.uid = qa.audit224.coach1، id e2de698e-a14a-4674-bc35-1bb511b3fbb1 — نفس منهجية التحقق الأولي) ترى **0 صفوف** target_coach_id<>auth.uid() — كان 38 قبل 0089 و34 بالتدقيق الأصلي
- **T4 ✓ — لا إفراط في الحجب:** نفس الجلسة ترى 37 صفًا = 2 له (coach_welcome + coach_page_setup) + 35 broadcast قديمة (target_coach_id=null — مرئية للستاف بحكم تصميم 0030C نفسه) — مجموع مطابق 37/37
- **T5 ✓ — مسار الأدمن سليم:** محاكاة جلسة أدمن ترى 75/75 (is_admin() فرع الكنسية يعمل)
- **T6 ✓** D3/D4: صفر rules · صفر triggers على الجدول — الاكتشاف الجانبي (23502 عند REST UPDATE حتى لأصحاب الصفوف) ليس من كائن إعادة كتابة على admin_notifications؛ سببه يبقى مفتوحًا ببنك متابعة المالك (خارج نطاق C1 — لم يُمسك ولم يُشخَّص أكثر)
- منهجية المحاكاة (قراءة-فقط §3.3): set local role authenticated + set_config('request.jwt.claims', sub) داخل معاملة تُلغى بـrollback — تكافئ جلسة PostgREST الحية للجرس حرفيًا (نفس الآلية التي تقيّم بها Supabase السياسات) — سكربت التحقق محفوظ خارج المستودع (نمط c1_probe.py من 225)
- **الحصيلة عبر المرحلتين:** التسريب (C1) مُغلق نهائيًا والمثبت: 225/0088 استرجع الكنسية الحرفية → كشف الدخلاء بالتحقيق → 226/0089 أسقطهم بعد إثبات دخيلتهم → التحقق النهائي أعلاه — البند الوحيد CRITICAL بتقرير docs/DEEP-UX-AUDIT-REPORT-2026-09-18.md صار ✓✓ (البقية H1/M1/M2/m1–m9 تنتظر قرارات المالك كما هي)
- أثر جانبي إيجابي موثق: إسقاط admin_notif_insert (WITH CHECK true · TO public) أغلق أيضًا ثغرة إدراج-لأي-دور على الجدول كانت أوسع من التسريب المقاس

Stage Summary:
- **C1 مُغلق ومُتحقق حيًّا:** T1 ✓ · T2 ✓ (3 كنسية فقط) · T3 ✓ (صفر لغيره — كان 38) · T4 ✓ (2+35=37) · T5 ✓ (75/75) · T6 ✓ (صفر rules/triggers)
- STATE.md حُرِّر بنفس الجلسة: ترويسة «آخر تحديث» + مدخل (٠٠) 226 + صف QA 226 + بنك التدقيق المفتوح — كلها صارت تحمل النتيجة النهائية بدل وعد التحقق
- بيانات QA على الإنتاج (حسابات qa.audit224.* وqa.c1fix.coach1) بقيت عمدًا — التنظيف موقوف «عند إغلاق التدقيق» (التقرير §8) والتدقيق ما زال مفتوحًا ببقية بنوده
- Commit SHA: كوميت هذه الجلسة التوثيقية يحمل هذا المدخل نفسه.
- Push status: pushed

---
Task ID: C1-FOREIGN-POLICIES-DROP-226-2026-09-18
Agent: Super Z (main)

Task: أمر المالك 2026-09-18 («بعد الانتهاء من القراءة، ابدأ في إكمال آخر مهمة مفتوحة») — آخر مهمة مفتوحة = التحقق الحي T1–T6 بعد دفع المرحلة 225 (migration 0088) الموعود بمدخل worklog «بنفس الجلسة» (مدخل 225 نصًّا: «التحقق الحي T1–T6 بعد الدفع موثق بمدخل worklog التالي (نفس الجلسة)») — الجلسة السابقة انتهت قبل توثيقه فاستُكمل هنا: التحقق كشف أن التسريب ما زال حيًّا → إتمام إصلاح C1 بإسقاط السياسات الثلاث الدخيلة المثبتة (migration 0089) وفق البند الشرطي بأمر المالك 225 نفسه («لا تستخدم defensive sweep لحذف Policies غير معروفة إلا إذا أثبت التشخيص أنها دخيلة»).

Work Log:
- بروتوكول الجلسة §3.6: STATE.md قُرئ أولًا (المرحلة 225 — C1 منفذ، التحقق بعد الدفع معلق بمدخل worklog التالي) · git fetch → SYNCED · آخر 3 مدخلات worklog + آخر 5 كوميتات — المهمة المفتوحة حُددت من مصادرها لا من الذاكرة
- **التحقق الحي T1–T6 على الحية (Supabase Management API — قراءة-فقط §3.3؛ محاكاة جلسة PostgREST = set local role authenticated + set_config('request.jwt.claims') داخل معاملة تُلغى — صفر كتابات):**
  - T1 ✓ 0088 مطبق: schema_migrations يسجل 20260917210000_0088_admin_notifications_rls_restore (التكامل GitHub→Supabase نفّذه)
  - T2 ✗ D2 طبع **6 سياسات** على admin_notifications: الكنسية الثلاث (admin_notifs_select/insert/update_coach) مسترجعة بنص 0030C المقيد حرفيًا ✓ **+ 3 دخيلة**: `admin_notif_select` (SELECT · TO {public} · USING is_coach()) · `admin_notif_insert` (INSERT · TO {public} · WITH CHECK true) · `admin_notif_update` (UPDATE · TO {public} · USING is_coach()) — السياسات المتساهلة تُجمَع OR فالدخيلة الواسعة أبقت التسريب حيًّا رغم الاسترجاع
  - T3 ✗ مقياس التسريب C1 ما زال حيًّا: محاكاة جلسة مدرب auth.uid = qa.audit224.coach1 (id e2de698e-a14a-4674-bc35-1bb511b3fbb1 من ملحق تقرير التدقيق §8) ترى **38 صفًا موجهة لغيره** (new_client بإيميلات PII · new_coach · payment_request · new_ticket · questionnaire_submitted · coach_page_pending)
  - T4: نفس الجلسة ترى 75 صفًا = 2 له (coach_welcome + coach_page_setup) + 35 broadcast قديمة (target_coach_id=null — مرئية للستاف بحكم تصميم 0030C نفسه) + 38 لغيره (التسريب)
  - T5 ✓ مسار الأدمن سليم: محاكاة جلسة أدمن (is_admin()) ترى الكل (75/75)
  - T6: D3 (pg_rules) فارغ · D4 (pg_trigger) فارغ — لا كائن إعادة كتابة على الجدول؛ الاكتشاف الجانبي 23502 (فشل REST UPDATE حتى لأصحاب الصفوف) ليس من RULE/trigger على admin_notifications — سببه يبقى مفتوحًا ببنك متابعة المالك (خارج نطاق C1)
- **إثبات الدخيلة (الشرط الملكي تحقق) — بالاسم:** grep المستودع كله (sql/ts/md) عن admin_notif_select/insert/update = **صفر نتائج** · git log -S لكل اسم عبر كل التاريخ = **فارغ** (لم توجد بأي كوميت قط) · ميجريشن 0003 نفسه يعمل بأسماء admin_notifs_*_coach (جمع + لاحقة _coach) · TO {public} لا توجد في أي سياسة مستودع على الجدول (كلها authenticated) · WITH CHECK true (أي دور يُدرج!) لا يسمح بها ملف — وهي حرفيًا «الصيغة العارية من حقبة 0003» المشتبهة بترويسة 0088 («probable live variant»)
- **فحص التغطية قبل الكتابة:** is_coach() = is_staff() = role IN ('coach','admin') (عقد 0029B) → السياسة الكنسية (is_admin() أو (is_staff() و(null أو = auth.uid()))) تغطي كل قارئ ستاف شرعي؛ القارئ الوحيد الخاضع للسياسات = جرس الستاف (listAdminNotifications — AdminNotificationBell) الذي يحتاج نطاق الكنسية بالضبط؛ مسارات الإنشاء كلها service-role (تجاوز RLS بالتصميم) لم تُمس — الإسقاط لا يفقد وصولًا مشروعًا واحدًا
- **migration 0089** (supabase/migrations/20260918100000_0089_admin_notifications_foreign_policies_drop.sql): إسقاط الثلاث الدخيلة المثبتة (idempotent) + ترويسة توثق الأدلة كاملة (نتائج T1–T6 + إثبات الدخيلة + فحص التغطية) + تشخيص D1/D2 قراءة-فقط يطبع حالة ما بعد الإسقاط بسجل تشغيل Supabase (التوقع: 3 كنسية فقط) + notify pgrst reload — **عمدًا لا يشمل:** أي جدول آخر (نطاق C1 حصرًا §12.10) · أي بيانات · أي كود تطبيق · أي مساس بالسياسات الكنسية
- INDEX.md: صف 0089 + مدى الخريطة 0001→0089 (قانون MIGRATION INDEX) · STATE.md: المرحلة 226 + مدخل (٠٠) 226 + تحديث بنك التدقيق المفتوح (C1 على مرحلتين 225+226) + صف QA 226 + دمجتان معتمدتان للبقاء على 100 سطر بالضبط (221+220+219 و223+222) · types.ts لم يتغير (سياسات فقط — لا أعمدة/جداول) → migration_audit نظيف بالضرورة
- البوابات: tsc 0 · eslint 0/0 · migration_audit --ci PASS (صفر انحراف جديد) · docs_parity ✓ (0089) · docs_audit (phase=226) · vitest غير مطلوب (فريم DB صفر كود — سابقة 225/223) · build غير مطلوب (§3.5: لا مساس رندر/مسارات — ملف .sql + توثيق فقط)
- دفع مستقيم forward-only إلى origin/main (التكامل GitHub→Supabase يطبق 0088+0089 تلقائيًا) → التحقق الحي T1–T6 بعد الدفع موثق بمدخل worklog التالي (نفس الجلسة)

Stage Summary:
- إتمام إصلاح C1 الذي بدأته 225: 0088 وحده لم يُغلق التسريب لأن 3 سياسات دخيلة (صيغة 0003 العارية TO public) بقيت تُجمَع OR مع الكنسية المسترجعة — 0089 يسقطها بعد إثبات دخيلتها بالاسم (grep=صفر · git-history=فارغ) وفق البند الشرطي بأمر المالك نفسه
- التحقق الحي قبل الدفع موثق أعلاه (T1–T6 كاملة)؛ التحقق الحي بعد الدفع (التوقع: T2=3 سياسات كنسية فقط · T3=0) بمدخل worklog التالي بنفس الجلسة
- أثر جانبي إيجابي غير مقصود محتمل: إسقاط admin_notif_insert (WITH CHECK true) يغلق أيضًا ثغرة إدراج لأي دور عام على الجدول — كانت أوسع من التسريب المقاس
- Commit SHA: كوميت هذا الفريم يحمل هذا المدخل نفسه.
- Push status: pushed (بعد بوابات §3.5 — التفاصيل أعلاه)

---
Task ID: C1-ADMIN-NOTIFS-RLS-RESTORE-225-2026-09-18
Agent: Super Z (main)

Task: أمر المالك 2026-09-18 — تنفيذ إصلاح C1 من تقرير التدقيق docs/DEEP-UX-AUDIT-REPORT-2026-09-18.md (تسريب RLS في admin_notifications: مدرب b2b يقرأ إشعارات غيره) وفق الخطة المعتمدة: migration 0088 بنص 0030C الحرفي، بلا defensive sweep لسياسات مجهولة إلا بإثبات، بلا أي تغيير خارج C1، ثم commit+push عبر مسار GitHub→Supabase المرتبط، ثم تحقق حي + اختبارات T1–T6.

Work Log:
- الخطة المعتمدة (نفس الجلسة): C1 فقط · السبب الجذري موثق بالتقرير = انجراف DB (السياسة الحية أوسع من 0030C:146–174 = 0056:265–294 المعتمدة بالمستودع)
- **إثبات حي قبل الدفع (2026-09-17 20:5x UTC):** حساب مدرب QA جديد أُنشئ عبر الواجهة الحية (qa.c1fix.coach1@alkemos-test.com — تسجيل ذاتي فوري /for-coaches/register، بوسم QA ضمن منهجية التدقيق نفسها) → جرس /coach أظهر «9+» فور الإنشاء → فحص REST بجلسة المدرب نفسها (سكربت scripts/c1_probe.py خارج المستودع): **75 صفًا مرئيًا = 38 موجهة لغيره (new_client بإيميلات PII · new_coach ×10 · payment_request ×2 · new_ticket ×5 · questionnaire_submitted ×4 · coach_page_pending لمدربين آخرين…) + 35 broadcast قديمة (target_coach_id=null — مرئية للستاف بحكم التصميم 0030C) + 2 له (coach_welcome + coach_page_setup)** — التسريب مؤكد حيًّا لحظة الإصلاح، أضيق من 34 صفًا بالتدقيق الأصلي (نمو الجدول)
- **اكتشاف جانبي أثناء الإثبات (موجود مسبقًا — خارج نطاق C1، لم يُمسك):** كل REST UPDATE على admin_notifications يفشل 400 بكود 23502 على أعمدة NOT NULL لم يطلبها الـpayload (type ثم title عند إرساله) **حتى لصاحب الصف نفسه** — النمط يطابق كائن إعادة كتابة حي (RULE/trigger) خارج ملفات المستودع (فحص grep: لا تريغر معرف بالميجريشنز على هذا الجدول)؛ أثره العملي: «تعليم الكل/الواحد كمقروء» بالجرس يفشل صامتًا خلف القلب التفاؤلي (mark-read معطل فعليًا قبل الإصلاح وبعده) — موثق للمالك كبنك متابعة مستقل، لا يعيق إصلاح C1 (SELECT هو مسار التسريب)
- **migration 0088** (`supabase/migrations/20260917210000_0088_admin_notifications_rls_restore.sql`): تفعيل RLS (idempotent — يغطي احتمال تعطيله) + إسقاط وإعادة إنشاء السياسات الثلاث بنص 0030C **الحرفي** (admin_notifs_select_coach: الأدمن الكل أو (ستاف و(target_coach_id فارغ أو = auth.uid())) · admin_notifs_insert_coach: ستاف · admin_notifs_update_coach: نطاق select نفسه) + **تشخيص قراءة-فقط D1–D5** يطبع بسجل تشغيل Supabase: نوع الكائن/RLS مفعّل · كل سياسات الجدول من pg_policies (أي سياسة دخيلة تُثبت نفسها هناك — السياسات المتساهلة تجمَع OR فكانت ستبقي التسريب) · كل pg_rules (D3 — اشتباه كائن إعادة الكتابة) · كل pg_trigger (D4) · جرد الأعمدة (D5) + notify pgrst 'reload schema' — **بلا** مسح سياسات مجهولة (أمر المالك الصريح) وبلا أي مساس ببيانات/تريغرات/كود تطبيق
- فحص مسارات الإنشاء كلها: supabaseAdmin (service-role) تتجاوز RLS بالتصميم (notifications/admin · coach/register · support/tickets · refund · paypal · affiliate-engine · 0061 trigger definer) — صفر أثر عليها من استرجاع السياسات؛ القارئ الوحيد الخاضع للـRLS هو جرس المتصفح (listAdminNotifications) وهو هدف الإصلاح نفسه
- INDEX.md: صف 0088 (قانون MIGRATION INDEX) · STATE.md: المرحلة 225 + مدخل (٠٠) 225 + تحديث بنك التدقيق المفتوح (C1 ✓ مُصلح، الباقي بلا مساس) + صف QA 225 + دمجتان معتمدتان للبقاء على 100 سطر بالضبط (221+220 و218+217)
- types.ts لم يتغير (سياسات فقط — لا أعمدة/جداول) → migration_audit نظيف بالضرورة

Stage Summary:
- C1 مُصلح بأدنى تغيير ممكن: ملف SQL واحد + صف فهرس — صفر كود تطبيق، صفر مساس بأي بند آخر من التقرير (H1/M1/M2/m1-m9 كلها كما هي)
- التسريب أُثبت حيًّا قبل الدفع (75 صفًا لمدرب جديد) والتحقق الحي T1–T6 بعد الدفع موثق بمدخل worklog التالي (نفس الجلسة)
- بند متابعة جديد للمالك (خارج C1): كائن إعادة كتابة UPDATE حي مشتبه على admin_notifications (كل تحديث REST يفشل 23502) — التشخيص D3/D4 بميجريشن 0088 يطبعانه بسجل التشغيل
- Commit SHA: كوميت هذا الفريم يحمل هذا المدخل نفسه.
- Push status: pushed (بعد بوابات §3.5 — التفاصيل بمدخل التحقق التالي)

---
Task ID: DEEP-UX-AUDIT-224-2026-09-18
Agent: Super Z (main)

Task: أمر المالك 2026-09-18 («وثّق الآن ملخص الـ Deep Full Real-User Experience Audit بالكامل داخل نظام توثيق المشروع» — توثيق فقط: صفر تعديل كود/DB/RLS، صفر حذف أو استبدال توثيق قائم، لا تنفيذ أي إصلاح) — توثيق نتائج تدقيق تجربة المستخدم الحقيقية العميق (قراءة-فقط على `1a37026`/المرحلة 224 الحية) بعد تسليم الملخص داخل المحادثة.

Work Log:
- التقرير الكامل أُنشئ: `docs/DEEP-UX-AUDIT-REPORT-2026-09-18.md` (ملف جديد فقط — لا استبدال لأي توثيق موجود): ترويسة الكوميت 1a37026/224 + النطاق والأدوار الثمانية والحسابات · Findings مرتبة: **C1** تسريب RLS بـadmin_notifications (مدرب b2b قرأ 34 صفًا موجهة لغيره — عملاء بإيميلاتهم؛ السبب مؤكد: سياسة 0030C:146–156 المقيدة غير مطبقة على الحية — Drift) · **H1** ‏#418 hydration على كل الصفحات العامة للزوار المجهولين (سبب غير مؤكد — Black-box؛ مرشح: سكربتات ما قبل الـ hydration بlayout الجذر) · **M1** رسائل API hardcoded بلغة واحدة (مؤكد: activate/route.ts:250–282) · **M2** إيميل مسجل → «افحص بريدك» طريق مسدود (مؤكد: لا إرسال بريد أصلًا) · **m1–m9** بجدول أسباب/تأثير/قابلية استغلال (m7 مُتحقق E2E غير قابل للاستغلال اليوم — coachActivationCostUsd تفرض $6/$16 دائمًا) · Verified-passing مقتصد (البوابات 401/403 كلها سليمة → C1 التسريب الوحيد · المحفظة 402 سيرفريًا · الجلسات · pending-review 404) · Not Testable ×5 مع ما يلزم لإغلاق كل بند · قرارات المنتج الخمسة المطلوبة (m9 تأكيد البريد يحدد شكل إصلاح M2 · m3 سجل EVO جهاز/حساب · m4 عدد الأدوات · m7 رسوم المدربين · وسائل اختبار §5) · Recommended Fix Order: ‏C1→H1→M2→M1→MINOR→قرارات · ملحق استئناف كامل (الحسابات qa.audit224.* + معرف المدرب + بيانات QA المتروكة على الإنتاج + مواقع الأسطر بالمصدر)
- STATE.md: مدخل جديد أول «المفتوح الآن» لتدقيق UX (مؤشر للتقرير — بنود مفتوحة تنتظر قرارات المالك) + دمج سطري QA ‏216+215 المعتمد للبقاء على 100 سطر بالضبط + ملحق سطر «آخر تحديث» — بلا مساس بالمرحلة (224) ولا بـ«آخر كوميت متحقق منه» (91d566b8)
- بوابات ما بعد التوثيق: `python3 scripts/docs_audit.py` — **صفر مخالفات جديدة من هذا التوثيق**: نفس الـ3 مخالفات الموجودة مسبقًا في الكوميت المنشور 1a37026 نفسه (أُثبت باختبار عكسي stash→بوابة→pop على الحالة البكر: B ‏shallow-clone محلي فقط · I ترويسة AGENTS.md لم تُرفع بتزامن مع تعديل كوميت 224 · J دمجات archive بكوميت 224 بلا رفع baseline) — خارج نطاق هذه المهمة التوثيقية (§12.10) وتُوثَّق هنا للمالك · STATE ‏100 سطر · الأقسام الإلزامية كلها سليمة · ترتيب worklog ‏H سليم (المدخل الجديد أعلى بتاريخ 2026-09-18)
- صفر مساس: كود التطبيق · business logic · قاعدة البيانات/RLS · أي توثيق قائم — `git status` يظهر الملفين المعدلين + التقرير الجديد فقط (انظر Stage Summary)

Stage Summary:
- Deliverable: docs/DEEP-UX-AUDIT-REPORT-2026-09-18.md (تقرير التدقيق كاملًا، عربي، قابل للاستئناف ذاتيًا) + مدخل STATE «المفتوح الآن» — المصفوفة الكاملة وثّقت: 1 CRITICAL · 1 HIGH · 2 MEDIUM · 9 MINOR · Not-Testable ×5
- لا إصلاح نُفّذ (بأمر صريح) — كل البنود تنتظر قرارات المالك (§6 بالتقرير) وأمر تنفيذ منفصل لكل موجة إصلاح
- Commit SHA: لا يوجد — توثيق محلي بلا commit (جلسة التدقيق قراءة-فقط؛ التثبيت commit+push بانتظار أمر المالك حسب §3.6 survival law)
- Push status: not-pushed

---

Task ID: LAZY-SUPABASE-182-NARROW-224-2026-09-17
Agent: Super Z (main)

Task: أمر المالك 2026-09-17 («نفّذ الآن النسخة الضيقة من مقترح 182 كما أثبتها التدقيق: أخرج تحميل Supabase من المسارات العامة الأربعة /contact و/ar/contact و/affiliate و/ar/affiliate فقط، دون المساس بمسارات الدخول أو الـ26 مسارًا المحمية. طبّق التغييرات اللازمة فقط، ثم شغّل بوابات §3.5 واختبار الدخان… بعد نجاحها: وثّق الفريم، commit، push إلى origin/main، وتحقق من SYNCED. لا توسّع النطاق») — تنفيذ النسخة الضيقة من مقترح 182

Work Log:
- بروتوكول §3.6: STATE.md قُرئ (223 على 91d566b8) · شجرة نظيفة · مزامنة origin/main SYNCED · نطاق الفريم من تدقيق 182 القراءة-فقط بالجلسة السابقة (4 مسارات عامة فقط تشحن الطبقة ساكنًا)
- **التغييرات (5 ملفات — التغييرات اللازمة فقط):** (1) ContactView.tsx — حذف الاستيراد الساكن createTicket من برميل @/lib/data (الحافة التي كانت تسحب helpers→client.ts لأول تحميل /contact و/ar/contact) واستبداله باستيراد ديناميكي عند نقطة الاستدعاء داخل handleSubmit بنمط NotificationBell المعتمد من 182 نفسها · (2) AffiliateProgramView.tsx — COMMISSION_RATE أعيد مصدره إلى affiliate-constants عديم الاعتماد (مصدره الحقيقي — كان مستوردًا من referral.ts) + getOrCreateReferralCode صار استيرادًا ديناميكيًا داخل حارس profile (يشتغل للمسجل فقط) · (3) AffiliateToolkit.tsx — نفس المعالجة: حذف الاستيراد الساكن من referral.ts واستيراد ديناميكي عند نقطة الاستدعاء · (4) affiliate-content.ts — COMMISSION_RATE/COOKIE_DURATION_DAYS أعيد مصدرهما من affiliate-constants مباشرة (كان الاستيراد من referral.ts يسحب طبقة supabase لكل مستهلكي قوالب المحتوى — الفجوة التي جعلت /affiliate يشحنها) · (5) client.ts — تصحيح تعليق التوثيق الحقيقي: تعليق 182 كان يدّعي «كل مستورد ساكن متبقٍ هو gated-route chunk» وهذا غير دقيق (المسارات الأربعة كانت تنقضه) — التعليق الآن يوثق اكتمال 224 بحقيقته
- **ما لم يُمس (عقد الأمر):** مسارات الدخول (Google OAuth + بريد + admin) صفر مساس — خوف 182 الأصلي «يحتاج جلسة مركّزة باختبار مسارات الدخول» لم يعد مطبقًا لأن الإصلاح لا يقترب منها أصلًا · الـ26 مسارًا المحجوبة (27 مدخلًا مع layout الأدمن) كما هي — use-auth يحمّل الطبقة فورًا هناك (GATED_PREFIXES) فتحويلها عائده الشبكي صفر · صفر مساس بمنطق الأعمال: الدوال نفسها لم تتغير (createTicket/getOrCreateReferralCode توقيعاتها وسلوكها كما هو) — التغيير في توقيت تحميل الوحدة فقط
- **التحقق الثابت (قبل البناء):** مسح الرسم الساكن لكل مدخلات المسارات (سكربت خارج الريبو — 160 ملفًا: صفحات+layouts+loading/error/template/not-found): صفر مسارات عامة تصل client.ts ساكنًا (كانت 4 قبل الفريم: /contact · /ar/contact · /affiliate · /ar/affiliate) · مستوردو referral.ts الساكنون: 5→2 (AdminReferralsView + ReferralView — كلاهما محجوب)
- البوابات: tsc 0 · eslint 0/0 · **vitest 1438/1438 (81 ملفًا)** · **next build 0** (بيئة دخان وهمية NEXT_PUBLIC_* حقنت قبل البناء لأن متغيرات NEXT_PUBLIC تُضمَّن وقت البناء — .env.local حُذف بعد الدخان وغير مرفوع أصلًا)
- **الدخان الحي (Playwright + chromium، next start على 3999):** المسارات الأربعة كزائر مجهول بنافذة 10 ثوانٍ شاملة idle — **(أ) صفر طلبات REST/auth لsupabase** (المضيف الوهمي dummy-smoke-project.supabase.co لم يُطلب أبدًا) · **(ب) تشانك supabase (0x0gy0--68pcx.js — 246KB خام/64KB gz) غائب من سكربتات HTML الأولية** (15-16 سكربت أولي للمسارات) · **(ج) التشانك لم يُجلب إطلاقًا** — حتى عند idle (أدق من تصميم 182 الذي كان يسمح بجلبه عند idle عبر ودجت EVO) · **(د) صفر أخطاء كونسول** (الاستثناء الوحيد الموثق: 404 لـ/_vercel/insights/script.js — سكربت Vercel Analytics موجود فقط في نشر Vercel؛ مثبت أنه أثر محلي عام: يظهر على الرئيسية غير الممسوسة أيضًا) · (هـ) المحتوى يرندر بالغتين (h1 صحيحة بالمسارات الأربعة)
- **التحكم العكسي (إثبات عدم كسر الجهة الأخرى):** /auth (مسار محجوب) ما زال يحمّل تشانك supabase فورًا (سلوك GATED_PREFIXES/use-auth كما هو) + الزائر المجهول فيه صفر REST أيضًا (بناء العميل يقرأ الكوكيز فقط)
- التوثيق: STATE.md — ترويسة 224 + مدخل (٠٠) 224 + بند (مقترح 182) ✓ منفذ (النسخة الضيقة) + صف QA (224) + دمجا 198+ب2+ب3 و194+193 بنمط الدمج المعتمد لإبقاء 100 سطر بالضبط · مدخل worklog هذا

Stage Summary:
- **عقد 182 اكتمل فعلًا الآن:** «Supabase خارج النافذة الحرجة كليًا للزوار المجهولين بالصفحات العامة» — قبل هذا الفريم كانت 4 مسارات عامة (اتصال + أفلييت بكل لغتيهما) تشحن 64KB gz ساكنة بلا حاجة؛ الآن صفر مسارات عامة، والتشانك لم يُجلب أبدًا في الدخان
- صفر انحدار مكتشف: كل البوابات خضراء، الدخان 4/4، والتحكم العكسي على /auth يؤكد أن جهة المصادقة تعمل كتصميمها · الدوال المعنية نفسها لم تتغير — التغيير بنيوي (توقيت تحميل الوحدات) فقط
- المتبقي الوحيد (اختياري — عائده الشبوي صفر): تحويل الـ26 مسارًا المحجوبة حيث use-auth يحمّل الطبقة فورًا أصلًا — لا يُفتح إلا بأمر ملكي
- مرشح اختياري مستقبلي: اختبار حراسة يمنع عودة الاستيراد الساكن لclient.ts من مسار عام (فئة «التلف الصامت» — الفجوة نفسها وجدها تدقيق لا اختبار)
- Commit SHA: كوميت هذا الفريم يحمل هذا المدخل نفسه.
- Push status: pushed (origin/main)

---

---
Task ID: D03-AUDIT-223-2026-09-17
Agent: Super Z (main)

Task: أمر المالك 2026-09-17 («وثّق إغلاق تدقيق D-03 كـ DEFERRED في STATE.md وworklog.md: سجّل أن إعادة هيكلة i18n/[locale] مؤجلة بسبب انخفاض العائد مقابل ارتفاع مخاطر الانحدار، مع حفظ محفزات إعادة الفتح المذكورة في تقرير التدقيق. لا تعدّل أي كود ولا تفتح مهمة تنفيذية جديدة. ثم commit + push إلى origin/main والتحقق من نجاح الدفع») — إغلاق توثيقي كـ DEFERRED لتدقيق D-03 (قراءة-فقط): فريم docs صفر كود

Work Log:
- التدقيق نفسه (قراءة-فقط على رأس a93eaf7d — صفر ملفات عُدّلت وقت التدقيق): **جرد الملف الواحد:** src/lib/i18n.tsx (905 أسطر · "use client" سطر 1 · صفر مكتبات i18n خارجية) — قاموس en أسطر 17–405 (15,963B خام / 362 مفتاحًا) · قاموس ar أسطر 407–805 (20,191B خام / 363 مفتاحًا) · dicts={en,ar} سطر 796: **اللغتان تشحنان للعميل معًا في حزمة واحدة** · سلسلة احتياط ar→en سطر 890
- **الانتشار:** 75 مستوردًا (74 مكون/صفحة client + layout الجذر) · 84 useI18n() · 321 موقع t() — كله على المسار الحرج عبر SiteHeader/LandingView في كل صفحة عامة
- **جذر الديناميكية:** resolveLocale() بsrc/app/layout.tsx:126 يقرأ headers() (سطر 130) → كل مسارات الموقع ƒ Dynamic (بند 65 بخطة التدقيق + م10: [locale] يفتح static generation — لكن كسبه أخذه P1-5(ب))
- **LanguageToggle بنمطين:** صفحات المرايا تنتقل لرابط المرآة (21 MIRROR_ROUTES + 8 PREFIX_MIRROR + 3 أزواج ديناميكية + diet-plan) · الأسطح الخاصة (/checkout /profile /admin /auth) تقلب اللغة بالذاكرة بلا URL (أسطر 223–227) — القواميس الخادمية مستحيلة دون كسر التبديل
- **سطح SEO المحروس:** hreflang على 20+ ملفًا · 28 قسم مرآة /ar/* · 4+ أجنحة اختبارات حراسة · تاريخ انحدارات موثق بالنطاق نفسه (H1/H2 · الكوكيز · endpoints 2026-09-14 · م8/P3-10 · مفتوحان: مؤكد 8 SiteHeader.tsx:304,530 · م9 og:locale)
- **الحكم — مؤجل (DEFERRED):** العائد المتبقي ~14–16KB gzip فقط (~1.9–2% من المسار الحرج 789KB؛ أرضية react-dom 380KB لا تُمس بأي i18n) · مكسب static عوّضه قرار P1-5(ب) (Cloudflare طبقة الكاش الرسمية TTL 3600ث) · أعلى مخاطرة انحدار بالمشروع (75 مستوردًا · 321 t() · 84 useI18n · 28 مرآة) · الخطة نفسها صنفته «طويل المدى» (م10)
- **محفزات إعادة الفتح الأربعة (محفوظة حرفيًا ببطاقة D-03 بSTATE + هنا):** (1) نمو القواميس فوق ~70KB خام/~30KB gzip أو انحدار INP/TBT ميداني موثق (2) كلفة استدعاءات Vercel مشكلة فعلية لم تحلها رفع CF TTL (4–6س) + تمديد unstable_cache (3) ميزة تفرض العمل اللغوي: لغة ثالثة / نطاقات لكل لغة / إزالة طبقة CF / حداثة ISR للمحتوى (4) عند أي فتح: **النسخة الضيقة أولًا** (تقسيم قواميس لكل لغة + استيراد ديناميكي) لا [locale] big-bang
- فريم التوثيق (docs صفر كود): STATE.md — ترويسة 223 + مدخل (٠٠) 223 + بطاقة D-03 (الحكم + المحفزات الأربعة) + صف QA (223) + دمجا 191+190 و185+G6/183/181/180/178+184 بنمط الدمج المعتمد لإبقاء 100 سطر بالضبط — الجراحة بسكربت محمي ذاتيًا (assertions فهرسية: فشل نظيف عند أي انجراف أو تطبيق مزدوج) · مدخل worklog هذا (بنفس الحماية)
- البوابات (فريم .md فقط): docs_audit (phase=223) · docs_parity/check-stale-refs/migration_audit/ui-wiring ✓ · tsc/eslint/vitest أعيد تشغيلها تحققًا رغم صفر ارتباط (الشجرة كوديًا مطابقة لـa93eaf7d حيث كانت خضراء — لا اختبار يقرأ STATE/worklog) · build غير مطلوب (شرط §3.5 «مساس الرندر/المسارات» غير منطبق)

Stage Summary:
- **D-03 يبقى مؤجلًا وحيدًا بين بنود D — بإغلاق تدقيق موثق:** نسبة عائد/مخاطرة الأسوأ بالمشروع (عائد ~2% من مسار حرج مقابل انتشار 75 مستوردًا/321 t() ومخاطرة انحدار قصوى)؛ صفر كود عُدّل، لا مهمة تنفيذية فُتحت
- محفزات إعادة الفتح الأربعة محفوظة حرفيًا ببطاقة D-03 (STATE) وهنا — أي فتح مستقبلي بأمر ملكي يسمي المعرف، والنسخة الضيقة أولًا لا [locale] big-bang
- المفتوح بعد هذا الفريم: بنود المالك الاختيارية فقط (ت-2/t-4/lazy-supabase-182/أمان GitHub)
- Commit SHA: كوميت هذا الفريم يحمل هذا المدخل نفسه.
- Push status: pushed (origin/main)

---

---
Task ID: ZOD-WAVE3-222-2026-09-17
Agent: Super Z (main)

Task: أمر المالك 2026-09-17 («نفّذ Zod Wave 3 بالكامل كما هي محددة في الخطة الأصلية، دون استبعاد أي بند. لا تفتح أي مهمة مؤجلة أخرى. اتبع بروتوكول المشروع كاملًا: IMPLEMENT → VALIDATE → DOCUMENT → COMMIT → PUSH، واعتبر مسارات الدفع ضمن نطاق التنفيذ مع بوابات الأمان المطلوبة») — الموجة الأخيرة من خطة Zod الثلاثية: paypal · admin · cron · affiliate

Work Log:
- بروتوكول §3.6: STATE.md قُرئ (221 على 879f0f4b) · استنساخ نظيف (بيئة جديدة) · مزامنة origin/main SYNCED · AGENTS.md كاملًا · مدخلات 219/220/221 بworklog · تحديد نطاق Wave 3 من المصدرين الموثقين: نص الخطة بSTATE وقت 141 («Zod الموجات 2-3 (مسارات المستخدم/المدرب ثم الدفع وadmin وcron)») + سطر المتبقي الموثق منذ 2A («paypal · admin · cron · affiliate») — **الأمر الملكي نفسه = موافقة §7 الصريحة المسبقة لمسارات الدفع** (متطلب §7: موافقة قبل التنفيذ لا بعده — موثقة بنص الأمر في الكوميت وهذا المدخل وSECURITY §9.7)
- جرد الحقيقة لكل مجموعة: 75 مسارًا إجمالًا · paypal 3 (create-order: purpose dispatch + فرعا topup/subscription · capture-order: orderId · webhook: توقيع على الجسم الخام ثم قراءة هيكلية) · admin 19 + notifications/admin (جرد أفعال كل مسار: GETs بلا جسم بلا بوابات — سابقة 2A الموثقة) · cron 8 + evo-followup (p0 بlang/topic/job_id · p1..p5 بqueueId · dispatch-pipelines/progress-reminder بلا معاملات) · affiliate 3 (commission جسم · payout-notify لا يقرأ جسمًا أصلًا · referred-coaches GET)
- schemas.ts +29 مخططًا (~490 سطرًا) بقانون الطبقات الحرفي: **paypal** — create-order (planTier/durationMonths بنوع الإرث المحكوم بtypeof → فئتاه الإرثيتان تعادان حرفيًا · purpose مفتوح كسياسة إرسال (سابقة mode) · amountUsd/amountEgp بunion رقم/نص لتحفظ قسر Number() — المصفوفة amountUsd:[5] كانت تمر رقمًا 5! الآن 400 فئة مهرّبة معتمدة) · capture-order (orderId 1..100) · webhook (مخطط هيكلي ب4 مستويات اختيارية بعد التوقيع — التوقيع هو الحد الحقيقي) — **admin 15 مخططًا**: accounts×2 (is_test_account بboolean يطابق typeof الإرثي · user_ids سقف مصفوفة 200 فوق سقف المسار 100 الذي يبقى الفئة الإرثية العاملة) · assignments+site-assignments (زوج المعرفات) · blog/cleanup (dry_run) · coach-fees (union) · coach-kind (enum=الفحص الإرثي) · coach-pages/notify · coach-pages (note بسقف slice(0,500)) · coach-support (parent_id نص محدود — UUID_RE سياسة مسار · body بسقف 4000) · external-plans×4: action (فهرسة meal/day/exercise/item/version + إعادة اشتقاق «id مطلوب» و«action غير معروف» — اكتشاف أثناء التنفيذ: item_index كان مفقودًا من الجرد الأولي وأُضيف) + create (ai/status مفتوحان إرسال === · meal/workout مفتوحان لتخلف typeof الافتراضي · title/text بلا min عند البوابة لأن لهما معانٍ مختلفة بالفرعين AI/يدوي — 1-حرف title قانوني بمسار AI) + patch (كل فحوص النطاق الاختيارية تُعاد حرفيًا بترتيب المسار) + delete-id (z.uuid — نمط 2B للمسح الصامت) · leads×2 · refunds (id/action enum + note بسقف سخي 2000 — بلا نقطة قص إرثية) · staff×2 (email شكلًا فقط — EMAIL_RE سياسة مسار كسابقة register · full_name بسقف 120) · wallets×2 (coach_id نص محدود — UUID_RE سياسة مسار · amount union · note trim+min1+300 = القانون الإرثي الكامل) · notifications/admin (enum=ALLOWED_TYPES الخمسة نفسها + title/body/link بسقوف المسار 200/1000/200)
- **كرون 9:** p0 (lang إلزامي بenum + topic/job_id بسقوف نقاط قص المسار 300/64 — القص الصامت الإرثي صار 400 بنمط P1-7) · p1..p5 (queueId trim+1..100 — عبر سكربت scripts/wave3_cron_gates.py للتطابق الحرفي ×5) · evo-followup (emptyEnvelopeBodySchema — نمط 221 المعتمد: لا يقرأ جسمًا أصلًا) — البوابة دائمًا بعد verifyCronAuth (401 أولًا) وبعد فحص الإعداد (500)
- **أفلييت 3:** commission (userId/reference منضمّان + amount union + strip للمفاتيح المهرّبة rate/affiliate_user_id — مدخلات المحرك لا تُضخّم أبدًا) · payout-notify (مغلف فارغ — لا يستهلك حقول الطلب أصلًا: كل شيء من auth.id والـDB) · referred-coaches بلا بوابة (GET بلا جسم — سابقة 2A الموثقة بتعليق schemas.ts)
- المسارات (30 ملفًا): كل بوابة داخل الفعل بعد المصادقة — إعادة الاشتقاق من الجسم الخام بالترتيب الإرثي الدقيق (create-order يتبع حتى تفرّع purpose؛ external-plans يعيد «id مطلوب» ثم «action غير معروف»؛ accounts-DELETE يعيد التطبيع كاملًا ثم «user_id مطلوب» ثم «الحد الأقصى 100 حساب») — **§7: صفر مساس بمنطق المال** (resolvePlanPrice/الخصم الذري/extend_subscription/العمولات/الاسترداد) **أو التوقيع** (التحقق على الجسم الخام قبل البوابة حرفيًا) **أو RLS** — وبعد نجاح البوابة تُستخدم parsed.data فتسري التقليمات والمجردات
- الاختبارات: +89 في validation-schemas.test.ts (194 بالمجموع؛ 1438 كليًا) — صحيح/خاطئ/عدوائي لكل مخطط + الفئات المفتوحة الموثقة (purpose/ai/status/meal/workout إرسال ===) + سقوف نقاط القص + case-insensitive لz.uuid مطابقًا لUUID_RE /i + strip لمفاتيح المهرّبة — **3 تصحيحات اختبار أثناء الجولة** (أخطاء بالاختبارات نفسها لا بالمخططات): person_name بحاجة لmin2 قانوني بعينة الطبقات · إما-أو site-assignments قانون مسار كسابقة tickets ({} يمر بالبوابة والفحص بعدها) · بريد الصيغة الرديئة يمر بالبوابة الشكلية ويموته EMAIL_RE بالمسار (سابقة 2A المسجلة)
- البوابات: tsc 0 (خطانا TS أوليان في تضييق string|null لع enemies .eq صُلحا بقيمة البوابة) · eslint 0/0 · **vitest 1438/1438** (81 ملفًا) · next build 0 (2,056 صفحة) · docs_audit (phase=222) · docs_parity/check-stale-refs/migration_audit ✓
- دخان محلي حي (next start على 3999 + curl ببيئة وهمية حُذفت بعده — .env.local محذوف وغير مرفوع): **المصادقة أولًا** — 401×9 (paypal create-order بجسم سليم وبجسم مهرّب [1,2,3] · capture-order · accounts PATCH · wallets/adjust · refunds · external-plans DELETE · leads DELETE · affiliate/commission · payout-notify · notifications/admin) + webhook 401 توقيع (الحد الحقيقي قبل أي بوابة) + evo-followup 404 kill-switch (سلوك الإطفاء محفوظ) — **كرون بالسر الحقيقي:** 401 بلا سر · 401 بسر خاطئ · ثم 400 الإرثي حرفيًا «Missing/invalid ?lang= parameter — must be 'en' or 'ar'.» · ثم فئة zod الجديدة لtopic 301-حرف · p1: 401 → «Missing queueId query parameter» حرفيًا → فئة zod لqueueId 101-حرف — السلوك بعد المصادقة مغطى بـ194 اختبار canary (بنية الدليل نفسها المعتمدة من 2A/2B: الترتيب حيًا + الفئات وحدات)
- التوثيق: STATE.md — ترويسة 222 + مدخل (٠٠) 222 + سطر حالة الخطة «الخطة الثلاثية مكتملة 100% … لا متبقٍ من الخطة إطلاقًا» + صف QA (222) + دمج 202+201 و200+199 بنمط 209+208 المعتمد لإبقاء 100 سطر بالضبط · SECURITY.md §9.7 محدث بقانون §7 (الموافقة الملكية المسبقة الموثقة + نطاق التشديد) · مدخل worklog هذا

Stage Summary:
- **خطة Zod الثلاثية مكتملة 100%:** الموجة 1 (141) + P1-7 (216) + 2A (219) + 2B كاملة (220+221) + **3 كاملة (222 — بلا استبعاد)** — التغطية المركزية الآن تشمل عائلات المسارات الأربع: العامة + المدربين + المستخدمين + الدفع/الأدمن/الكرون/الأفلييت
- العقد المحفوظ: صفر تغيير برسائل/أحوال الفئات الإرثية لأي حملة كانت تجتاز — إعادة الاشتقاق حرفية بالترتيب الإرثي بكل مسار؛ الفئات الجديدة الوحيدة أنواع خاطئة/متضخمة/مهرّبة كانت تُخزَّن مقصوصة أو تمر صامتة (بنمط P1-7 المعتمد) — والمصادقة أولًا في الملفات الثلاثين
- **§7 موثق ثلاثيًا:** نص الأمر الملكي (الموافقة المسبقة) + الكوميت security: + SECURITY §9.7 — منطق المال/التوقيع/RLS لم يُمس في أي سطر
- المفتوح بعد هذا الفريم: D-03 وحيدًا (قواعد D-rules قائمة) + بنود المالك الاختيارية (ت-2/t-4/lazy-supabase/أمان GitHub) — **لا مهمة مؤجلة أخرى فُتحت بهذا الأمر**
- Commit SHA: كوميت هذا الفريم يحمل هذا المدخل نفسه.
- Push status: pushed (origin/main)

---
Task ID: ZOD-WAVE2B-COMPLETION-221-2026-09-17
Agent: Super Z (main)

Task: أمر المالك 2026-09-17 («صحّح نطاق Wave 2B في التوثيق والحالة: لم أستبعد أي بند من Wave 2B. راجع خطة Zod الأصلية وقارنها بما نُفّذ فعليًا، وحدد أي بنود من Wave 2B لم تُنفذ، ثم نفّذها جميعًا قبل اعتبار Wave 2B مكتملة. لا تفتح Wave 3. حافظ على نفس منهجية وبوابات Wave 2A/2B، وأكمل التوثيق والـcommit والـpush والتحقق من المزامنة») — إكمال Wave 2B وتصحيح السجل

Work Log:
- بروتوكول §3.6: STATE.md قُرئ (221-pre على 50cb379f) · مزامنة origin/main SYNCED · مدخلا 219/220 بworklog
- **حسم المقارنة من المصدرين الموثقين:** مدخل 2A بworklog (سطر «المتبقي الموثق بأمر ملكي يسميه») + سطر حالة الخطة بSTATE — الخطة الأصلية تسمي Wave 2B بسبعة بنود: plans/member-edit ✓(220) · plans/normalize ✗ · support/tickets ✓(220) · ai/* ✓(220: jobs+chat بوابات، feedback/meal-demo/workout-demo تحقق مركزي نقي قائم مؤكد بالفحص الموضعي parseEvoFeedbackInput حاضر بالمسار، planner-plan/quota GET-only، queue-health DELETE بلا جسم) · subscription/cancel ✗ · refund/request ✗ · tools/saved-* DELETE ✓(220) — **الناقص ثلاثة بنود** و220 كان قد نسب استبعادها خطأً لأمر المالك
- جرد الحقيقة للمسارات الثلاثة: normalize (POST بجسم {text, planType, clientId?} — requireCoach أولًا، فئتا 400 إرثيتان بأسبقية text ثم planType، clientId يعاد فحصه UUID_RE برسالة عربية ثم ملكية 403 ثم تفعيل 402) · subscription/cancel وrefund/request POST (**لا يقرأان الجسم إطلاقًا** — كل المدخلات مشتقة خادميًا: جلسة→أهلية→إدراج service-role؛ المستدعى الحقيقي profile/page.tsx يرسل POST بلا جسم إطلاقًا — تحقق حرفي بالمصدر) — وGET refund بلا جسم
- schemas.ts (+مخططان بقانون الطبقات نفسه): **planNormalizeBodySchema** — text z.string().trim().min(1) **بلا سقف مقصودًا** (لا نقطة قص في المسار؛ rawText.slice(0,8000) قص-ثم-معالجة داخل plan-generator سياسة مكتبة — سابقة رسالة الشات في 220: سقفٌ رافض يضرب لصق المدربين الطويل) · planType z.enum(['nutrition','workout']) · clientId z.string().trim().max(100).optional() **نص لا z.uuid** كي لا تتحول سلّم الإرث (UUID_RE/«افتح صفحة العميل...»/403 ملكية/402 تفعيل) لـ400 zod — سابقة planId بمخطط swap — **emptyEnvelopeBodySchema** z.object({}) لمساري الدفع: المغلّف فقط، أي object يمر بمجردة المفاتيح مطابقًا لدلالة التجاهل الإرثية، والجسم غير-المعياري (مصفوفة/سكالار) كان no-op 200 صامتًا صار 400 (نمط DELETE-id المعتمد في 220 حرفيًا) — تعليق مصحح بترويسة قسم 2B: «220 wrongly attributed an exclusion... owner excluded NOTHING»
- المسارات: normalize — البوابة بعد requireCoach، وعند فشلها **إعادة اشتقاق الإرثي حرفيًا بأسبقيته من الجسم الخام** («Missing required field: text» ثم «planType must be 'nutrition' or 'workout'») والباقي فقط (نص غير نصي كان ينهار 500 بTypeError داخل try/catch — فئة خاطئ-النوع المعتمدة) يأخذ رسالة zod 400؛ cancel + refund POST — البوابة بعد requireUser مباشرة وق قبل فحص التكوين (ترتيب saved-results في 220) مع تخطيط null→{} قبل البوابة (POST بلا جسم = الوضع الحقيقي كله) — توثيق ترويسة كامل بكل مسار
- **§7: منطق المال لم يُمس** — الأهلية/نافذة 7 أيام/دفاتر الاستخدام/إدراج refund_requests/cancel_requested_at/جرس الأدمن كلها كما هي؛ البوابة شكل مغلّف فوق حقلٍ غير مستهلك أصلًا (صفر تغيير سلوكي لأي طلب كان يُستهلك — لا شيء كان يُستهلك)
- الاختبارات: +11 بvalidation-schemas.test.ts (105 بالمجموع؛ 1349 كليًا) — normalize: الودجت الحقيقي/بلا clientId/تقليم text+clientId/نصايح «Missing»/planType الشاذ/non-string text/بلا سقف (50K يمر)/clientId ليس uuid يمر بالبوابة/تجريد مفتاحين مهرّبين — المغلف: {} وأي object بمجردة/رفض مصفوفة-سكالار-null-undefined
- البوابات: tsc 0 · eslint 0/0 · vitest 1349/1349 (81 ملفًا) · next build 0 (2,056 صفحة) · docs_audit (phase=221) · docs_parity/check-stale-refs/migration_audit ✓
- دخان محلي حي (next start + curl ببيئة وهمية حُذفت بعده): **401×6** — normalize (جسم سليم/جسم [1,2]) · cancel (بلا جسم/[1]) · refund POST (بلا جسم/'str') — المصادقة أولًا كلها والبوابة لا تنطلق قبلها أبدًا
- التوثيق: STATE.md — ترويسة 221 + مدخل (٠٠) 221 بتصحيح صريح لنسبة 220 الخاطئة + سطر حالة الخطة «الموجة 2B كاملة ✓ (220+221 — سبعة بنود بلا استبعاد) — المتبقي الموجة 3 فقط» + صف QA (221) — مع دمج 207+206 المحفوظتين وفق نمط 209+208 المعتمد لإبقاء الملف عند سطره الأقصى 100 · مدخل worklog هذا

Stage Summary:
- **Wave 2B مكتملة فعليًا الآن: 7/7 بنود الخطة الأصلية خلف الحدود** — تغطية zod الكلية 21 مسارًا بثلاثة ملفات مسارات إضافية (member-edit·tickets·jobs·chat·saved-*×2 من 220 + normalize·cancel·refund من 221)
- تصحيح السجل موثق في الموضعين (STATE مدخل 221 صريح + تعليق schemas.ts): استبعاد البنود الثلاثة لم يكن بأمر ملكي — أُدرجت الآن بلا أي منهجية جديدة
- عقود الأخطاء الإرثية محفوظة حرفيًا بكل الفئات («Missing required field: text» · «planType must be…» · رسائل normalize العربية الثلاث عبر بقاء UUID_RE سياسة مسار) — الفئات الجديدة الوحيدة: نص غير نصي (كان 500 انهيارًا) وجسم مغلّف غير معياري (كان 200 صامت) — النمطان المعتمدان P1-7/DELETE-id
- المتبقي من خطة Zod: **الموجة 3 فقط** (paypal · admin · cron · affiliate) — بلا أمر فتح ملكي
- Commit SHA: كوميت هذا الفريم يحمل هذا المدخل نفسه.
- Push status: pushed (origin/main)

---
Task ID: ZOD-WAVE2B-220-2026-09-17
Agent: Super Z (main)

Task: أمر المالك 2026-09-17 («نفّذ Wave 2B من خطة Zod الأصلية فقط: مسارات المستخدم المحددة في الخطة (plans/member-edit، support/tickets، ai/، tools/saved- DELETE). اتبع نفس المنهجية والبروتوكول المعتمد في Wave 2A...») — بوابة الحدود المركزية لمسارات المستخدم

Work Log:
- بروتوكول §3.6: STATE.md قُرئ (219 على b9597c7b) · استنساخ نظيف (الجلسة الجديدة — بيئة عمل سابقة زالت) · مزامنة origin/main SYNCED · AGENTS.md كاملًا · مدخل Wave 2A + قائمة المتبقي الموثقة (الخطة الأصلية تسمي Wave 2B: plans/member-edit · plans/normalize · support/tickets · ai/* · subscription/cancel · refund/request · tools/saved-* DELETE)
- **حسم النطاق بأمر المالك الحرفي:** 4 مجموعات فقط (member-edit · support/tickets · ai/ · tools/saved- DELETE) — plans/normalize وsubscription/cancel وrefund/request استُبعدت صراحة بالأمر (والأخيرتان تمسان منطق الدفع — §7) وWave 3 مغلق
- جرد الحقيقة: 75 مسارًا · 13 تستورد schemas (موجة 1 + P1-7 + 2A) — المسارات المستهدفة الخمسة ذات الأجسام: member-edit (POST بمساري save-evo/swap) · support/tickets (POST بمساري عضو/طاقم) · ai/jobs (POST enqueue) · ai/chat (POST عمومي) · saved-results/saved-meal-plans (DELETE بمعرّف query) — GET-فقط (planner-plan · quota) وجسم-فقط-داخلي (queue-health DELETE بلا جسم) بلا بوابة مطلوبة
- **اكتشاف توثيقي (صفر مساس):** ai/feedback وmeal-plan-demo وworkout-demo تحتها تحقق مركزي نقي قائم بقدرات كاملة (parseEvoFeedbackInput بevo-feedback.ts · validateDemoRequest بai-meal-planner.ts · validateWorkoutRequest بai-workout-planner.ts — نوع/قائمة/سقوف لكل حقل) يؤدي وظيفة بوابة الحدود أصلًا والودجت يعيد استخدامها قبل الإرسال — إضافة مخططات zod موازية = ازدواج تحقق يحظرته خطة التدقيق نفسها؛ وُثّق ولم يُمس
- schemas.ts +150 سطرًا: 5 مخططات + savedToolDeleteIdSchema (z.uuid بنمط Zod 4) + ثوابت موثقة (MAX_MEMBER_PLAN_TITLE 120 · MAX_MEMBER_PLAN_TEXT 20000 · MAX_TICKET_SUBJECT 200 · MAX_TICKET_BODY 4000 · TICKET_STATUSES · MAX_JOB_TYPE_LEN 100 · MAX_CHAT_HISTORY_ITEMS 16) — قانون الطبقات: zod=نوع/سقف/تقليم/تجريد، والسياسة باقية بالمسارات (توجيه mode على القيم الخام · UUID_RE · ملكية الخطط والاستبدال · الحصص ونوافذ التير · hash الضيف المملح)
- قانون التوافق حرفيًا: كل فئة إرثية معاد اشتقاقها عند فشل البوابة بإعادة التحقق الخام (member-edit: bad_request بالرسالتين العربيتين · tickets: bad_request ×3 «اكتب موضوعًا...» / «لا يوجد رد أو تغيير حالة» / «حالة غير معروفة» بترتيب الفحص الإرثي · chat: Missing message · jobs: Unknown job type · saved-*: Missing id) — الفئات الجديدة فقط (أنواع خاطئة · سقوف فائقة · أشكال مهرّبة) ترجع رسالة zod 400
- قرارات توافقية موثقة بالمخططات: kind بtrim قبل القائمة (« workout » الإرثي يمر) وstatus كذلك · planId يبقى نصًا محدودًا لا z.uuid كي لا تتحول 404 الإرثية لـ400 · type بلا trim (String() الإرثي كان يُمررها للقائمة) · guestId مفتوح (نمط phone) · عناصر history مفتوحة (نمط مصفوفات الوسائط في 2A: العدد فقط ≤16 = نقطة القص نفسها) · رسالة الشات بلا سقف zod (clamp-and-process سياسة موثقة — الإدخال بلا maxLength فسقفٌ هنا يضرب مستخدمين حقيقيين باللصق الطويل) · محتوى swap = z.record (المصفوفات التي كان typeof الإرثي يخزنها فتُفسد شكل الصف صارت 400 — فئة الأشكال المهرّبة المعتمدة)
- البوابات في المسارات الخمسة مع المصادقة أولًا: بوابة tickets أُدرجت داخل كل مسار بعد requireUser/requireStaff (لا 400 قبل 401 — نفس ترتيب 2A) · member-edit/jobs بعد requireUser · معرف DELETE بعد requireUser — المسارات تستخدم parsed.data بعد البوابة (التقليم والتجريد فعّالان)
- الاختبارات: +34 في validation-schemas.test.ts (94 بالمجموع) — صحيح/خاطئ/عدوائي لكل مخطط + تجريد المفاتيح المهرّبة (client_id/status/is_current/approved_at · client_id/priority · requested_by · tier/userId) + canary سقف history (MAX_CHAT_HISTORY_ITEMS = EVO_HISTORY_CAP_PAID من evo-coach) + توثيق اختباري لفصل الطبقات (planId يبقى نصًا · subject بلا حد أدنى بالبوابة · عناصر history تمر كما هي · payload مفتوح)
- البوابات: tsc 0 · eslint 0/0 · vitest 1338/1338 (81 ملفًا) · next build 0 (2,056 صفحة) — docs_audit/docs_parity بعد التوثيق (تحت)
- دخان محلي حي (خادم next start + curl ببيئة وهمية حُذفت بعد الدخان — غير مرفوعة أصلًا): المصادقة أولًا — 401 نظيفة ×6 (member-edit · tickets member · tickets staff · jobs · saved-results DELETE · saved-meal-plans DELETE) · chat (الحمولة العامة الوحيدة بالموجة): فارغ/أبيض/غير-نصي → Missing message 400 حرفيًا (إعادة الاشتقاق) · history بـ17 عنصرًا → رسالة zod 400 (الفئة الجديدة) · المسار السعيد بجسم الودجت (10 عناصر) → 200 برد احتياطي محلي عبر البوابة كاملة — صفر كتابة DB

Stage Summary:
- Wave 2B مغلقة كاملة: حدود كتابة المستخدمين الأربع بأمر المالك خلف البوابة المركزية — تغطية zod الكلية الآن 18/75 مسارًا (العامة + P1-7 + المدربين + المستخدمين)
- العقد المحفوظ: صفر تغيير في رسائل/أحوال الأخطاء الإرثية لأي حملة كانت تمر — التشديد الحصري على ما كان يُخزَّن مقصوصًا أو يُمرَّر صامتة أو يُحذف بلا أثر (نمط P1-7 المعتمد)
- feedback وdemos التوليد الثلاثة بلا بوابة zod عمدًا — تحققها المركزي النقي أداءً لوظيفتها وموثق ذلك هنا؛ أي توحيد مستقبلي لهم داخل zod يحتاج أمرًا ملكيًا صريحًا (ازدواج محظور)
- المتبقي من الخطة الأصلية: Wave 3 (paypal · admin · cron · affiliate) بلا أمر فتح — وبنود Wave 2B المستبعدة بأمر المالك (plans/normalize · subscription/cancel · refund/request) بلا أمر كذلك
- Commit SHA: كوميت هذا الفريم يحمل هذا المدخل نفسه.
- Push status: pushed (origin/main) — أُكمل بجلسة المتابعة بعد وصول PAT المالك (جلسة التنفيذ توقفت عند الدفع فقط: بيئتها بلا اعتماديات git — «could not read Username» — فتوقفت بلا إعادة صامتة ودوّنت الحالة بأمانة)؛ جلسة المتابعة أعادت تشغيل البوابات كاملة خضراء على الشجرة النهائية قبل الدفع (tsc 0 · eslint 0/0 · vitest 1338/1338 · build 0 · docs_audit/docs_parity/check-stale-refs/migration_audit ✓) ثم دفعت وتحققت من المزامنة — بلا أي مساس بمحتوى الكوميت أو بواباته الخمس

---
Task ID: ZOD-WAVE2A-219-2026-09-17
Agent: Super Z (main)

Task: أمر المالك 2026-09-17 («نفّذ الآن Wave 2A الخاصة بـ Zod وفق تدقيق READ-ONLY الأخير... لا تفتح Wave 3 ولا تضف بنودًا خارج النطاق») — بوابة الحدود المركزية لثمانية مسارات كوتش

Work Log:
- بروتوكول §3.6: STATE.md قُرئ (218 على 36b5e207) · مزامنة origin/main SYNCED · آخر مدخلات worklog (PHASE-218 + 217-close) · AGENTS.md كاملًا
- تحديد النطاق من الخطة الأصلية (STATE.md وقت 141): «Zod الموجات 2-3 (مسارات المستخدم/المدرب ثم الدفع وadmin وcron)» — **Wave 2A = نصف المدرب: المسارات الثمانية ذات جسم الطلب تحت coach/** · جرد الحقيقة: 75 مسارًا، 5 فقط تستورد schemas (موجة 1: tools/lead · food-search — P1-7: save-result · save-meal-plan · broadcast) · GET-فقط (coach/wallet · coach/ai-usage) بلا جسم فلا بوابة مطلوبة · paypal/refund/affiliate/admin/cron = موجة 3 لم تُفتح · plans/my/support-tickets/ai = موجة 2B لم تُفتح
- schemas.ts +181 سطرًا: 8 مخططات جسم + ثوابت سقوف موثقة — قانون الطبقات الثابت: zod=نوع/سقف/تقليم/تجريد المفاتيح المهرّبة، والسياسة باقية في المسارات (cleanPhone · safeMediaUrl/safeSocialUrl/safeWhatsappPhone/safeResultsPhotos/safeCertificates · SLUG_RE · EMAIL_RE · UUID_RE · قوائم tier/method/package · ملكية الإيصال · حساب المحفظة والاسترداد)
- قانون التوافق حرفيًا: كل فئة خطأ إرثية معاد اشتقاقها في fallback المسار عند فشل البوابة (register: invalid_name/invalid_email/weak_password · claim+landing: invalid_slug · support: bad_request · ads: bad_package · activate: bad_request/bad_tier/bad_months/bad_amount/bad_method · topup: bad_amount/bad_method/bad_receipt) — الفئات الجديدة الوحيدة (أنواع خاطئة/أحجام فائقة) ترجع رسالة zod 400
- السقوف = نقاط قصّ المسارات نفسها (140/4000/800/120/500/300) = maxLength محرر الصفحة (CoachLandingEditor) — صفر انحدار لمستخدم حقيقي · مصفوفات الوسائط (results_photos/certificates): العدد فقط ≤24 والسياسة تُسقط العناصر العدوائية كما سابقًا (hostile item dropped, never stored)
- register (الحمولة العامة الوحيدة بالموجة): honeypot على الجسم الخام قبل البوابة (النجاح الزائف للبوتات محفوظ لأي قيمة truthy) · phone يبقى مفتوح الشكل (cleanPhone سياسة وحيدة — invalid → null كما الإرث) · password ≤200 واسم ≤120 وبريد ≤254 يُغلقون قبل جولة Supabase createUser
- الاختبارات: +30 في validation-schemas.test.ts (60 بالمجموع) — صحيح/خاطئ/عدوائي لكل مخطط + تجريد مفاتيح مهرّبة (role/coach_id/review_status/p_ref_id/subscription_id) + توثيق اختباري لفصل الطبقات (بريد بصيغة رديئة يمر بالبوابة الشكلية ويموته EMAIL_RE بالمسار)
- البوابات: tsc 0 · eslint 0/0 · vitest 1304/1304 (81 ملفًا) · next build 0 (2,056 صفحة) · docs_audit (phase=219) · docs_parity/stale-refs/migration_audit ✓
- دخان محلي حي (خادم next start + curl): المصادقة أولًا — المسارات المصدّقة السبعة = 401 نظيفة بالترتيب الصحيح · register: honeypot {ok:true} · اسم مفقود → invalid_name 400 (إعادة الاشتقاق الإرثية) · كلمة سر 300 حرف → رسالة zod 400 (الفئة الجديدة) — ثلاث طلقات ضمن حد المعدل 3/10د، صفر كتابة DB (بيئة دخان وهمية محلية .env.local بقيم dummy حُذفت بعد الدخان — غير مرفوعة أصلًا بالـgitignore)

Stage Summary:
- Wave 2A مغلقة كاملة: 8/8 حدود كتابة المدربين خلف البوابة المركزية — تغطية zod الكلية الآن 13/75 مسارًا (العامة + المدربين + الإدراجات المقيدة)
- العقد المحفوظ: صفر تغيير في رسائل/أحوال الأخطاء الإرثية لأي حملة كانت تمر — التشديد الحصري على ما كان يُخزَّن مقصوصًا أو يُمرَّر صامتة (النمط المعتمد P1-7)
- المتبقي الموثق بأمر ملكي يسميه: Wave 2B (plans/member-edit · plans/normalize · support/tickets · ai/* · subscription/cancel · refund/request · tools/saved-* DELETE) ثم Wave 3 (paypal · admin · cron · affiliate)
- Commit SHA: كوميت هذا الفريم يحمل هذا المدخل نفسه.
- Push status: pushed (origin/main)

---
Task ID: PHASE-218-LIVE-VERIF-2026-09-17
Agent: Super Z (main)

Task: التحقق الحي على الإنتاج لفريم PHASE-218 (D-01+D-02) بعد نشر Vercel — إغلاق دليل البوابة الخامس (الإنتاج) وفق عرف المراحل 208–217.

Work Log:
- /api/build-info حيًا: `commit c8f2458a47f9c77597af76957abf44c2d3e34da5` branch main — كوميت الفريم يخدم الإنتاج حرفيًا.
- **D-01 حيًا (بصمة CSS المُقدَّمة):** ملفا CSS الثابتان للرئيسية يضمان **3 أوجه @font-face بـ`font-display:optional` كلها `font-family:Cairo`** (unicode-ranges: العربي U+6??/U+750-77F · لاتيني ممتد U+100-2BA · لاتيني U+??) مقابل **11 بـ`swap`** (Inter/Playfair + الوجوه الأخرى — لم تُمس) — التطابق الحرفي مع تعديل layout.tsx.
- **D-02 حيًا (حدود صادقة):** /api/coaches/featured يعيد مصفوفة فارغة — لا مدرب منشور حاليًا، فلا توجد صفحة coach حية تُفحص HTMLًا (أي slug يهبط notFound بلا ميتاداتا). الدليل المتاح: الحرس الحتمي (يقرأ المصدر ويأكد og+twitter ×2 لغتين) + build 0 (2,056 صفحة) + نفس النمط متحقق حيًا على 41 سطحًا شقيقًا منذ 187/206. فحص HTML حي يُنفذ عند نشر أول صفحة مدرب (الدليل بيد المالك — أدناه).
- دخان عام: / 200 · /ar 200 · /coaching 200 · og:image حاضر برأس الرئيسية (2) — صفر انحدار.

Stage Summary:
- D-01 مثبت حيًا على الإنتاج بالبصمة الكاملة (3 Cairo optional / 11 swap) · D-02 مثبت مصدرًا+حرسًا+بناءً والتحقق الحي المرحّل على أول صفحة مدرب منشورة (خطوة مالك من سطر واحد: curl -s https://alkemos.com/coaches/<slug> | grep -c 'og:image' = 2+).
- Commit SHA: كوميت التحقق هذا يحمل هذا المدخل نفسه.
- Push status: pushed (origin/main)

---
Task ID: PHASE-218-D01-D02-2026-09-17
Agent: Super Z (main)

Task: أمر المالك 2026-09-17 («ابدأ في تنفيذ البنود المؤجلة D-01/D-02») — فتح البندَين المؤجلَين من إغلاق 217 وفق قواعد الفتح الموثقة: D-01 (font-display:optional لخط Cairo) + D-02 (بطاقات og:image لزوج صفحات المدربين). صفر مساس §7 (عرض/ميتاداتا فقط).

Work Log:
- بروتوكول §3.6: STATE.md قُرئ (217 على 315033c2) · مزامنة origin سليمة (SYNCED) · آخر مدخلات worklog + آخر 5 كوميتات.
- **اكتشاف الافتتاح:** رمز D-01/D-02 غير موجود في أي ملف بالمستودع ولا بسجل git كله — بحث شامل (docs · worklog · أرشيف · git log --all) أثبت أن جلسة الإغلاق السابقة كتبت توثيق الإغلاق ولم تدفعه لorigin (قانون الزوال §3.6). المالك وثّق المعرفات الثلاثة ببيانه (D-01 خط Cairo · D-02 بطاقات OG · D-03 i18n) فاعتُمد بيانُه مصدرًا وأُعيد بناء التوثيق كاملًا (مدخل 217-close أدناه + قسم D-rules بSTATE).
- **D-01 ✓ (خط Cairo — عرض فقط):** `src/app/layout.tsx`: Cairo display swap→optional (الوحيدة — Inter/Playfair لم تُمس). الأساس الهندسي: P2-5 (المرحلة 216) حسم CLS الدائم بوجه «Arabic Fallback» بمقاييس Cairo المطابقة (ascent 137.65% / descent 60.32% / size-adjust 94.66%) فصار optional آمنًا؛ نبضة ~0.04 العابرة (موثقة 7d86d043 على الزيارات الباردة البطيئة ~1/3 بالخنق القاسي) لا يمكن أن تحدث أبدًا لأن المتصفح لا يبدّل الخط منتصف الصفحة. المقايضة (قبلها المالك بأمر الفتح): أول زيارة باردة بطيئة قد ترسم العربية بالوجه البديل — والخط يُنزَّل خلفيًا فيُرندر من الكاش من الزيارة التالية. تعليقات الكود حُدثت بنفس الفريم (بلوك Phase 136/218 + inline D-01) — قانون §3.8.
- **D-02 ✓ (بطاقات المدربين — ميتاداتا فقط):** /coaches/[slug] (EN) ومرآتها /ar/coaches/[slug] (AR): openGraph.images ببطاقة العائلة (og-home-en 1200×630 بalt EN المعتمد / og-home-ar بalt «منصة Alkemos الرياضية الشاملة» بنمط المرايا) + twitter.summary_large_image. العيب: بلوك openGraph الابن يستبدل بطاقة الجذر (نمط replace-not-inherit الموثق 206) فكانت كل مشاركة بلا بطاقة — والمدربون يشاركون روابطهم مباشرة (WhatsApp/X) رغم noindex. الحرس: og-image-coverage WIRED_SURFACES +2 سطحًا (58→60 اختبارًا) + ترويسة الحرس توثق D-02.
- صفر مساس بالوظائف/الأسعار/الحدود/البيانات — EN لم تُمس بياناته وAR مرآة مطابقة.
- **البوابات (§3.5 كاملة):** tsc 0 · eslint 0/0 · **vitest 1274/1274** (81 ملفًا — كان 1272: +2 أسطح زوج المدربين) · next build exit 0 (2,056 صفحة) · docs_audit (phase=218 · lines=97) · docs_parity ✓.
- **التوثيق بنفس الفريم (§3.8):** STATE.md (ترويسة 218 · مدخل الفريم · «المفتوح الآن» أعيدت هيكلته: إغلاق 217 + بطاقة تعريف D-01/D-02/D-03 بالهدف/سبب التأجيل/النطاق/الخطر/الشرط + قسم «قواعد فتح أي بند مؤجل» D-rules ×5 + سطر QA 218 — 97 سطرًا) + مدخلا worklog (هذا + 217-close) + تعليقات الكود الذاتية. سطر ميجريشن 0084 المتقادم دُمج في «الحسابات المغلقة» توفيرًا للسطور (نفس فئة ضغط P3-4).

Stage Summary:
- D-01 وD-02 منفذان ومتحقق منهما ببوابات كاملة — دفعة عرض/ميتاداتا نقية · D-03 باقٍ مؤجلاً بشروطه الموثقة (جلسة مركّزة مستقلة بأمر ملكي) · قواعد D-rules صارت قانونًا معيشًا في STATE.md.
- Commit SHA: كوميت هذا الفريم يحمل هذا المدخل نفسه (يُرى بgit log بعد الدفع).
- Push status: pushed (origin/main)

---
Task ID: 217-close
Agent: Super Z (main — إعادة تسجيل بأمر المالك)

Task: إعادة تسجيل مدخل إغلاق المرحلة 217 الذي سجلته جلسة سابقة (2026-09-17) ولم يصل origin — ضاع بقانون الزوال §3.6. مصدر إعادة التسجيل: بيان المالك في جلسة 218 (المواد الخمس أدناه) + حقائق STATE.md وخطة التدقيق عند 315033c2. صفر كود — حوكمة خالصة.

Work Log:
- أُغلق قسم الحالة العامة بوضع «WAVE 3 / المرحلة 217 — مكتملة ومغلقة» (الخطة الثلاثية 215/216/217).
- وُثّقت البنود الثلاثة كمهمات مؤجلة بمعرفاتها:
  - **D-01 (خط Cairo):** الهدف — قتل نبضة CLS العابرة جذريًا (font-display:optional) · سبب التأجيل — مقايضة قرار المالك: احتمال فقد الخط بأول زيارة باردة بطيئة · النطاق المتوقع — layout.tsx فقط · الخطر — منخفض (الوجه البديل بمقاييس مطابقة منذ P2-5) · الشرط قبل التنفيذ — أمر ملكي صريح يقبل المقايضة.
  - **D-02 (بطاقات OG):** الهدف — بطاقة مشاركة اجتماعية لزوج صفحات coaches/[slug] · سبب التأجيل — صفحات noindex (قيمتها المشاركة المباشرة فقط — أولوية أدنى) · النطاق المتوقع — ملفا المرآتين + حرس og-image-coverage · الخطر — منخفض جدًا (ميتاداتا فقط) · الشرط قبل التنفيذ — أمر ملكي صريح.
  - **D-03 (إعادة هيكلة i18n):** الهدف — خفض أعمق للـJS بعد سقف P2-4 · سبب التأجيل — نطاق واسع يمس كل الأسطح · الخطر — انحدار وظيفي يحتاج إعادة اختبار شاملة · الشرط قبل التنفيذ — جلسة مركّزة مستقلة بأمر ملكي.
- أُضيف قسم «قواعد فتح أي بند مؤجل» (D-rules ×5: فتح بأمر ملكي يسمي المعرف · فريم مستقل لكل بند ببوابات §3.5 · تحديث STATE بنفس الفريم · موافقة §7 المسبقة لأي مساس 🔐 · مدخل worklog يوثق الفتح) — أعيدت صياغته الآن في STATE.md «المفتوح الآن» ضمن فريم 218 (النسخة الأصلية ضاعت مع مدخلها).

Stage Summary:
- هذا المدخل هو الحامل المعتمد لتوثيق الإغلاق الأصلي (معرفات D الثلاثة بالمواد الخمس + قواعد الفتح) — أعيد بناؤه بأمانة من بيان المالك، ونُفذ D-01/D-02 في فريم PHASE-218 فوق هذا المدخل مباشرة.
- Commit SHA: كوميت PHASE-218 يحمل هذا المدخل نفسه (إعادة تسجيل — لا كوميت مستقل له).
- Push status: pushed (origin/main) — ضمن كوميت 218.

---
Task ID: DEEP-AUDIT-WAVE3-217-2026-09-17
Agent: Super Z (main)

Task: أمر المالك 2026-09-17 («أوافق على التنفيذ كاملاً») — تنفيذ WAVE 3 (المرحلة 217: نظافة التوثيق الشاملة P3) من خطة التدقيق العميق وفق docs/DEEP-AUDIT-PLAN-2026-09-16.md؛ الموافقة شملت §7 صراحةً البند 🔐 الوحيد المتبقي (P3-11 — receipt_path بعد إسقاط نصفه الأول بVERCEL-USAGE-1).

Work Log:
- بروتوكول §3.6: STATE.md قُرئ (216 على aaa43950) · مزامنة origin سليمة (SYNCED) · آخر مدخلات worklog + آخر 5 كوميتات · خطة وتقرير التدقيق كاملان · تقييم حي لكل بند قبل التنفيذ (أسقط بضعة فرضيات مسح أولية خاطئة — أدناه).
- **P3-1 ✓ (المؤكد 22 — ترويسات):** التحقق أولًا: README/DEVELOPER_GUIDE/SECURITY/AGENTS كانت محدّثة فعلًا (لمسات 2026-09-16 بموجات 215/216) — الوحيد الخارج كان **DESIGN.md** (يدّعي 127/2026-09-06 بينما آخر لمسة git فعلية = 198-ب3 2026-09-14 b5164e9e) → الترويسة صارت تحمل الحقيقة مع ملاحظة عدم تغيير محتوى التصميم · أية وثيقة لُمست في 217 رُفعت ترويستتها بنفس الكوميت بفعل بوابة I.
- **P3-2 ✓ (المؤكد 21+24):** «6 free tools» بالـREADME حُذف الرقم نهائيًا (الخيار المفضل بقانون مصدر الأرقام — مع تعليق يشير للمصدر tools-shared.ts) + اكتشاف بنفس الفئة أُصلح: فقرة «6 Free Tools» بمزايا Key Features كانت تعدّ 6 وتسقط مولدَي AI (عدد المصدر الفعلي 8) صارت «Free Tools» بقائمة مكتملة بلا رقم + «leads from all 6 tools» صارت «from every tool» · .env.example اكتسب COACH_EMAILS/NEXT_PUBLIC_ADSENSE_CLIENT/NEXT_PUBLIC_GA_ID فارغة موثقة · سطر المزودين الأول: OpenRouter + Groq + NVIDIA NIM.
- **P3-3 ✓ (المؤكد 20):** SECURITY.md: sin1→fra1 (مطابقة vercel.json:7) · citation لـstep2-generate المتقاعد استُبدل بمسارَي p2-content/p4-review الحيين (300s) · rate-limit تسجيل المدرب صار يوثق الـlimiter المشترك Upstash (كان يقول in-memory) · **اكتشاف بنفس الفئة أُصلح:** §15.3 كانت توثق سقف الـ100/24h لرسائل البريد كـ«per-instance in-memory ledger» بينما هو محسوب من صفوف tool_leads بالقاعدة + سقوفا per-IP/per-email عبر Upstash — صُححت (البوابة عمياء عن الفئة — مثلها مثل 21) · cron-auth (§3.3) وجدناها مُصلحة مسبقًا في P1-6.
- **P3-4 ✓ (المؤكد 23):** السطر اليتيم كان أُسقط سابقًا (VERCEL-USAGE-3) — المطلوب الحقيقي كان الهامش: STATE.md ضُغط من 100 إلى **94 سطرًا** (دمج مدخلي VERCEL-USAGE-3+2 · دمج بنود الحسابات المغلقة الثلاثة · دمج أسطر QA التاريخية · إسقاط بند sleep المحسوم struck-through) — هامش 6 أسطر فوق سقف البوابة (المعيار ≥3) · سكربت التحويل بقي محليًا خارج المستودع عمدًا (نمط 213 الموثق أعلاه — P3-8).
- **P3-5 ✓ (المؤكد 24):** TECH_REFERENCE قسم **1.4.1** جديد: الجداول الحاكمة 0070–0087 (site_coach 0072 · الإقران الثنائي 0076 · evo_feedback/memory/followup/patterns/observation 0077–0081 · شاهد قبر 0082→0083 · **البوول الموحد ai_plan_usage 0085+0086** بهويته المزدوجة guest_key+ip_key · موجتا البيانات 0084/0087) + §1.5 اكتسب فقرة P3-11.
- **P3-6 ✓ (المؤكد 24):** جدول workflows في CI_GATES اكتمل بالسبعة الناقصة (db-backup · evo-weekly-eval · evo-weekly-learning · legacy-ar-cleanup · meta-title-remediation · retro-pair-blog · vercel-cleanup) — الجدول يسرد الـ14 كلها الآن مع Supabase Integration.
- **P3-7 ✓ (المؤكد 24):** جدول §8 في DEVELOPER_GUIDE اكتمل بالمسارات السبعة الحية الناقصة (ai/feedback · ai/meal-plan-demo · ai/planner-plan · ai/workout-plan-demo · csp-report · evo/followup/dispatch · exercise-mini — مع توثيق auth لكل منها من الكود) + إصلاح «الأدوات الست» في وصف lead · **README اكتسب قسم «EVO Weekly Follow-up Email»** كاملًا بقانون FEATURE README (ماذا يفعل/أين يعيش/كيف يستخدم: بطاقة opt-in على /profile · D4 صارم · أرقام حقيقية فقط · بريد evo@alkemos.com إرسال فقط · مسار dispatch بعلم EVO_FOLLOWUP_ENABLED وx-cron-secret timing-safe).
- **P3-8 ✓ (المؤكد 25):** علامة **Deprecated (2026-09-17)** على سياسة «آخر 10 مهام» بترويسة worklog مع إحالة القالب الحاكم إلى §12.5.1 · توثيق أن `scripts/phase213_state_update.py` كان سكربتًا محليًا لم يُرفع للمستودع قط (في الترويسة نفسها) · القالب نفسه كان ساريًا فعليًا منذ 215 (لا حاجة لتفعيل).
- **P3-9 ✓ (المؤكد 15):** ar/blog/[slug]: مدخل الرئيسية صار `/ar` (كان «/») · ar/programs/[slug]: «Home»→«الرئيسية» و`/`→`/ar` + «Programs»→«برامج التدريب» + **اسم الخطة صار nameAr** (كان nameEn — نفس فئة العيب سطرًا واحدًا تحت) — التحقق الحي المحلي أظهر الفتات الثلاثي العربي كاملًا.
- **P3-10 ✓ (م4/م5/م6/م8/م9/م26/المؤكد 27):** م4: LandingView (هيرو subtitle) + StaticPageView (About ×4 فقرات) + BlogComponents صارت تشتق الأعداد من EXERCISES_COUNT/FOODS_COUNT (كان LandingView يستوردها أصلًا لرقاقات العضلات — الهيرو فقط كان حرفيًا) · م5: سطر AR بواحد نظام أرقام (كان يخلط 868 لاتينية بـ٨٬٨٣٠ هندية) · م6: وصف memberships EN يسرد الأربعة الآن (Free/Premium/Pro/Coaching بأسعار شهرية — 142 حرفًا داخل ميزانية 158، مطابق لتوأمه AR) · م8: LanguageToggle يقرأ query من window.location لحظة النقر ويحمله إلى المرآة (بلا useSearchParams — عمدًا) عبر غلاف withQs لكل المسارات العشرة · safeNext توسّع لجرسي الإشعارات (رابط غير صالح لا يتنقل إطلاقًا — لا سقوط لـ«/») · م9: تناظر og:locale — المسح الأولي الخاطئ (بحث عن «og:locale» الحرفي) أسقط؛ إعادة المسح الصحيح (حقل `locale` في Next.js) كشفت **4 ملفات EN** تعلن openGraph بلا locale بينما مراياها تحمل ar_EG (ai-meal-planner · ai-workout-planner · meal-planner · blog/category) — أُضيف locale: en_US للأربعة؛ بطاقات twitter متناظرة أصلًا (تحقق) · م26: aria-label لحقل بريد النشرة (الـskip-link وجدناه موجودًا مسبقًا — إصلاح C23 — فالبند اقتصر على الlabel) · المؤكد 27 (التقييم المطلوب): /chat كان `permanent: true` (308) بينما توثيق المشروع نفسه يفضل 301 لأقصى توافق مع الزواحف (نفس قانون أسطر 178/192) → حُوّل إلى statusCode: 301 — دخان محلي: 301 + location /evo ✓.
- **P3-11 🔐✓ (المؤكد 18/19 — بموافقة §7 الموثقة أعلاه):** التقييم قبل التنفيذ كشف **اكتشافًا جوهريًا:** رفع الإيصالات كان يحدث من المتصفح مباشرة (`uploadReceipt` في subscriptions.ts يكتب بSupabase client إلى `receipts/<timestamp>.<ext>` بلا uid) — (أ) مخالفة صريحة لقانون الرفع (§8: الرفع حصريًا عبر /api/upload) و(ب) **متعذر عمليًا منذ تحصين 0071** الذي أسقط سياسة INSERT المعممة للتخزين (لم تبق إلا qphotos) — أي أن مسار الشحن اليدوي (InstaPay/Vodafone) كان سيفشل عند الرفع · الإصلاح: `uploadReceipt` صار يرسل POST /api/upload (bucket=receipts) الذي يعيد بناء المسار سيرفر-سايد `receipts/<uid>/<file>` (الميل للملكية بالبناء) · مسار `/api/coach/wallet/topup` يرفض الآن أي receipt_path لا يحمل uid الطالب نفسه في مقطعه الثاني (الملكية إثبات بالمسار) · الصفوف القديمة تحتفظ بمساراتها (أسطح القراءة لم تُمس) · حارسان جديدان في receipt-ownership.test.ts (المسار يحمل التحقق + الكتابة المتقاعدة من المتصفح محظورة).
- **اكتشافان مسحيان صُححا أثناء التنفيذ (بضوابط الفحص قبل التعديل):** مسح og:locale الأول كان على نص «og:locale» بينما الحقل `locale` (أعلاه) · «6 Free Tools» بمزايا README كانت تعدّ 6 وتسقط مولدَي AI (أعلاه).
- **الحرس الجديدة/المحدثة:** library-counts.test.ts +describe «Phase 217 م4+م5» (استيراد الثوابت إلزامي بثلاثة أسطح + لا أعداد حرفية خارج التعليقات + لا أرقام هندية مختلطة) · marketing-msa-surface.test.ts: مسار 204 أعيد تثبيته للصيغة المشتقة «والأطعمة (${FOOD_LIB})» · receipt-ownership.test.ts جديد (اختباران).
- **البوابات (الشجرة النهائية):** tsc 0 · eslint 0/0 · **vitest 1272/1272** (81 ملفًا — كان 1268/80) · next build exit 0 (2,056 صفحة) · دخان خادم الإنتاج المحلي: /chat=301→/evo · فتات ar/programs عربي كامل بالثلاثة مواضع · og:locale en_US على الأربعة المعدلة وar_EG بالمرايا · «868+ exercises» تُرسم من الثوابت · aria-label حي بالـDOM.

Stage Summary:
- WAVE 3 كاملة (11/11): توثيق الوثائق الخمس يطابق git · الرقم المتغير حُذف من README نهائيًا · SECURITY يطابق الكود (region/مسارات/rate-limits) · STATE بهامش 6 أسطر · TECH_REFERENCE يغطي حتى 0087 · جدول workflows كامل · §8 كامل + ميزة EVO followup موثقة أخيرًا · حوكمة الأرشيف مضبوطة · فتات AR عربي خالص · أعداد الموقع كلها مشتقة من مصادرها (تنمو معها) · وصف EN يسرد الباقات الأربع · تبديل اللغة يحفظ المرشحات · إيصالات الشحن بقانون الرفع مع تحقق ملكية — الخطة الثلاثية للتدقيق العميق (215/216/217) مكتملة التسليم بالكامل.
- Commit SHAs: e3fc0854 (fix: P3-9+P3-10) · 13e26605 (security: P3-11) · كوميت الإغلاق الثالث يحمل هذا المدخل نفسه.
- Push status: pushed (origin/main)

---
Task ID: DEEP-AUDIT-WAVE2-216-2026-09-16
Agent: Super Z (main)

Task: أمر المالك 2026-09-16 («بعد الانتهاء من القراءة، ابدأ في phase 216») — تنفيذ WAVE 2 من خطة التدقيق العميق (SEO/OG + أداء P2: البنود P2-1..P2-7) وفق docs/DEEP-AUDIT-PLAN-2026-09-16.md، مع قراري المالك المسبقين على البنادق: P2-2 «نفّذ الإصلاح» (إلغاء تجميد 2026-09-14 لرابط EVO) وP2-6 «أوافق — نفّذه» (موافقة §7 الصريحة).

Work Log:
- بروتوكول §3.6: STATE.md قُرئ (215 على 7981d65f) · استنساخ نظيف متزامن مع origin/main · آخر 3 مدخلات worklog + آخر 5 كوميتات · خطة وتقرير التدقيق العميق كاملان · سؤالا البوابة (P2-2 + P2-6) عُرضا على المالك قبل أي تنفيذ وأُجيبا — الوثيقة أعلاه.
- **P2-1 ✓ (المؤكد 7 — بطاقات og:image):** فحص حي أولًا أثبت الحالة (مثال /faq: og:title..type بلا og:image بينما twitter:image موروث من الأب — سلوك replace-not-inherit لـopenGraph) · مسح حتمي بالمستودع (parser أقواس متوازنة على كتل openGraph) كشف 19 ملفًا يعلن كتلة بلا images: الـ14 المدققة + 3 بنفس الفئة غير مذكورة في التقرير (meal-planner EN/AR + ar/equipment — الثلاثة تم التحقق من فجوتهم حيًا) + صفحتا coaches/[slug] (noindex — خارج نطاق التدقيق، موثقتان هنا كاكتشاف لا أكثر) · الإصلاح: 17 ملفًا رُكّبت لها بطاقات العائلة (og-home أو og-tools حسب السطح — نفس alt النصوص المعتمدة في الأسلاك السابقة) + تثبيت twitter.images في كل ملف + ترقية كروت «summary» إلى summary_large_image في compare ×2 وfor-coaches/register EN وar/equipment (كارت summary يتجاهل الصور — قانون 187) · الحارس: WIRED_SURFACES اتسع بـ20 سطحًا (58→58 اختبارًا بالعد الجديد بعد it.each) — og-image-coverage.test.ts.
- **P2-2 ✓ (المؤكد 8 — رابط EVO بالهيدر):** الموضعان (الدرج :304 وشريط الديسكتوب :532) صارا `href: isAr ? "/ar/evo" : "/evo"` بقرار المالك الموثق في التعليق (إلغاء تجميد 2026-09-14) · لا حراس تثبّت المسار الحرفي (تحقق: intent-map يشير للـcanonical فقط) · homepage-adoption 12/12 خضراء.
- **P2-3 ✓ (المؤكد 9 — صفحات equipment/muscles ضخمة):** مكوّن عميل جديد `ShowMoreExercises.tsx` + وحدة خادم-آمنة `hub-exercises-shared.ts` (الثابت HUB_INITIAL_EXERCISES=60 والنوع HubExerciseCard — **اكتشاف RSC جوهري أثناء التنفيذ:** استيراد قيمة عادية من ملف "use client" إلى مكوّن خادم يعطي وكيل المرجع لا القيمة؛ أول بناء رندر صفر بطاقات وزرًا بعدد 348 — نقل الثابت للوحدة الخادم-الآمنة أصلاها، والحارس يثبّت القانون) · الصفحات الأربع (equipment EN/AR + muscles EN/AR): 60 بطاقة مرندرة من الخادم + إسقاط مضغوط مترجم مسبقًا للبقية يكشفها زر واحد · **القياسات:** /equipment/bodyweight خام 550,675→213,495B (−61%) · AR 578→235KB · muscles/legs 488→209KB (مضغوطًا gzip: 31-34KB — القبول ≤150KB مضغوطًا تحقق بهامش) · القفزة الوظيفية: زر «Show 288 more» يكشف 348/348 بطاقة (متصفح: EN + AR) وأول بطاقة /ar/exercises/34-sit-up تعيد 200 · ItemList بحد الـ50 محفوظ بالحارس hub-exercises-limit.test.ts الجديد (10 اختبارات: الثابت في وحدة بلا use client + السلايس + الجزيرة + العد الكامل + الـ50).
- **P2-4 ✓ (المؤكد 14 — حمل JS):** قياس معملي فعلي (Playwright: حرج عند حدث load مقابل مؤجل بعده): **808KB عبر 17 ملفًا** هي المسار الحرج الحقيقي — مرشحا التدقيق (recharts/react-query) **غير موجودين على المسار** (تحقق بالمحتوى) · المكوّن الفعلي: react-dom ~380KB (48%) + الراوتر + جزر الهيدر/الرئيسية + **EVO كاملًا (الودجت+البروفايدر+الصوت ~109KB) داخل نافذة التحميل** (requestIdleCallback كان يُطلب عند الترطيب فيطلقه المتصفح أثناء التحميل نفسه) · الإصلاح (3 قطع): (أ) فصل `evo-chat-events.ts` — مُوزِّع حدث الفتح بلا أي اعتماديات (كان استيراد openEvoFloatingChat يجر آلة حالة الشات كاملة من السياق) وتحويل المستوردين المتلهفين الأربعة (SiteHeader/AppLayout/evo/profile) إليه (ب) البروفايدر نزل من الجذر إلى داخل الـdynamic() في EvoWidgetLazy (Promise.all — بروفايدر+ودجت كقطعة مؤجلة واحدة؛ المستهلك الوحيد لقيمة السياق هو الودجت نفسه — تحقق بالمستودع) (ج) الخمول يُطلب بعد حدث load حرفيًا (document.readyState===complete أو addEventListener load) · **النتيجة المعايرة:** حرج 808→789KB + الـ109KB الكاملة الآن بعد التحميل (قياس post-load: بروفايدر+ودجت 59.6KB + صوت 26.7KB) — هدف الـ25% من التدقيق بُني على مرشحين ثبت خطؤهما؛ الكتلة المتبقية أرضية react-dom (48%) + جزر أساسية، وتجاوزها يحتاج إعادة هيكلة i18n المعروفة «خارج نطاق الخطة» — **المعايرة موثقة** · **الدخان الوظيفي الحاسم (قانون EVO CHAT SURFACE):** الودجت يركب بعد load ✓ · نقرة الأيقونة العائمة تفتح الدرج مع الرسائل ✓ · مسار الحدث (dispatchEvent mhe:open-evo-chat على /evo) يفتح الدرج ✓ · اختبارات EVO الأربعة 42/42 خضراء.
- **P2-5 ✓ (المؤكد 13 — CLS):** إعادة إنتاج معملي بالخنق (slow-3G + 4×CPU) طابقت التدقيق حرفيًا (AR: CLS 0.1057، SECTION#tools بقفزة 0.0950 عند ~2.7ث) · مسبر زمني على عناصر الهيرو حدد المساهمين بدقة: الفقرة 91→68px + صف الأختام 88→56px = قفزة القسم 55px لأعلى عند تبديل Cairo · **الجذر:** الوجه الاحتياطي التلقائي لـnext/font هو `local(Arial)` — لا حروف عربية فيه — فكل نص عربي كان يتجاوز الوجه المضبوط المقاييس كليًا إلى خط النظام الخام (أطول وأعرض لفًّا) ثم ينكمش عند التبديل (النصف العربي لقصة الخطوط-136 التي أصلحت اللاتيني فقط) · **الإصلاح:** وجه `@font-face "Arabic Fallback"` جديد في globals.css بنفس تجاوزات مقاييس Cairo التي حسبها next/font (ascent 137.65% / descent 60.32% / size-adjust 94.66%) مع سلسلة local تغطي الأنظمة (Segoe UI→Tahoma→Geeza Pro→Noto Naskh/Sans Arabic→DejaVu Sans→FreeSerif→Arial) ووصل بـ`--font-arabic` بعد var(--font-cairo) — لاتيني بطبيعته (سلاسل اللاتيني تطابق عند Cairo Fallback قبله) · **النتيجة المعملية (معيار القبول):** EN CLS **0** (كان 0.103) · AR CLS **0.0102** (كان 0.107) عبر 6+ تشغيلات مستقرة — القبول <0.05 تحقق · أداة القياس دخلت المستودع: `scripts/cls-measure.mjs` (خنق + إسناد شفت) + `scripts/js-transfer-measure.mjs` · **التحقق الحي على الإنتاج (شفافية كاملة):** القفزة الدائمة 55px المُعاد إنتاجها 100% قبل الإصلاح زالت نهائيًا (h1/p/seals وأبعاد الهيرو النهائية ثابتة — إثبات بحجب Cairo: الاحتياطي الجديد يرصد هندسة Cairo ذاتها)، لكن عينة إنتاجية بالخنق المتطرف (slow-3G+300ms+4×CPU) ترصد أحيانًا (~ثلث التشغيلات الباردة البطيئة فقط) هزة لحظية مزدوجة 0.04+0.04 عند لحظة تبديل Cairo نفسها (down-up خلال ~130ms ثم ثبات كامل — أثر إعادة التدفق العابرة لعملية الاستبدال، لا فرق أبعاد نهائي)؛ المستخدمون الدافئون (كاش الخط) لا يرون شيئًا — **خيار الإزالة الجذرية بقرار مالك مستقل: `font-display: optional` لـCairo** (يمنع الاستبدال المتأخر كليًا مقابل احتمال فقد الخط للزيارة الباردة الأولى).
- **P2-6 ✓ (المؤكد 16 — 🔐 بموافقة §7 الموثقة أعلاه):** معالجا 500 في /api/ai/chat (POST) و/api/ai/jobs (POST + GET) يرجعان رسالة عامة ثابتة «Something went wrong on our side. Please try again in a moment.» — e.message الخام يبقى في log الخادم فقط (console.error بالكائن كاملًا) · رسائل JobPayloadError التحققية (400) بقيت كما هي عمدًا (رسائل ملكية قابلة للإصلاح من العميل ليست تفاصيل بنية) · صياغة كوميت security:.
- **P2-7 ✓ (المؤكد 17 — بوابة التكوين):** 6 مواقع في api/tools/* (save-result ×1 · saved-results GET+DELETE · save-meal-plan ×1 · saved-meal-plans GET+DELETE) تستورد isSupabaseAdminConfigured وترد 500 رشيقة «Server not configured» قبل قراءة المتغيرات الخام — نفس نمط coach/claim المعتمد · تأكيد التطابق: البوابة تقرأ نفس متغيري البيئة اللذين تبني العميل بهما (لا انفصال).
- **اكتشافان موثقان خارج نطاق التنفيذ (لا تعديل — §12.10):** (أ) صفحتا /coaches/[slug] و/ar/coaches/[slug] noindex بلا og:image (فئة مختلفة — أسطح مشاركة غير مفهرسة؛ تُدرس بقرار مستقل) (ب) HTML الإنتاج مضغوط br فعلًا على السلك (34.9KB لصفحة المعدات القديمة) — أرقام «مضغوط» في تقرير التدقيق كانت الحجم الخام؛ الوفر الحقيقي لـP2-3 في تكلفة parse/DOM والوحدات وليس السلك.
- **البوابات (الشجرة النهائية):** tsc 0 · eslint 0/0 · **vitest 1268/1268** (80 ملفًا — كان 1216: +20 og-coverage و+10 hub-limit ومرافقات it.each) · next build exit 0 (2,056 صفحة) · docs_audit ✓ · docs_parity ✓ · stale-refs ✓ · migration_audit --ci ✓.

Stage Summary:
- WAVE 2 كاملة (7/7): بطاقات اجتماعية على 17 سطحًا محروسة · رابط EVO لغوي بقرار مالك · أثقل صفحات الموقع خفّت 61% خامًا مع صفر فقدان وصول · CLS العربي شُفي من جذره (وجه احتياطي عربي بمقاييس Cairo) · آلة شات EVO كاملة خارج نافذة التحميل مع دخان وظيفي ثلاثي المسارات · رسائل أخطاء عامة بلا تسريب · بوابات تكوين موحدة — بلا أي مساس بأسعار/كوتة/أعمال تجارية.
- هدف ≥25% لخفض JS عُاير بأدلة: مرشحا التدقيق غير موجودين على المسار والكتلة أرضية إطار + جزر أساسية — التوثيق في الخطة والـworklog؛ WAVE 3 (217) بانتظار أمر المالك.
- Commit SHAs: 38bd0d06 (security: P2-6+P2-7) · 41ed4a32 (perf: P2-1..P2-5) · b5867342 (docs: closure — بما فيها هذا المدخل)
- Push status: pushed (origin/main)

---
Task ID: VERCEL-USAGE-3-2026-09-16
Agent: Super Z (main)

Task: تنفيذ ت-1 وت-3 بأمر المالك المباشر («نفّذ ت-1 وت-3 الآن فقط وفق الخطة الموثقة. طبّق إعدادات Cloudflare المطلوبة، ثم تحقق من الإنتاج وفعالية الكاش وعدم وجود أي أثر جانبي… ثم commit + push. لا تبدأ WAVE 2 / Phase 216 قبل إتمام التحقق») — بعد أن زوّد المالك بتوكن Cloudflare API في الجلسة (استُخدم عبر بيئة الجلسة فقط — صفر أثر في المستودع).

Work Log:
- **ت-1 (قاعدة كاش CF لبطاقات OG):** عبر Rulesets API على الـ ruleset الحاكم «alkemos cache rules (SEO-GEO-4 2026-09-08)» (phase `http_request_cache_settings`): أُضيفت قاعدة «alkemos og-image cache (T-1 VERCEL-USAGE-3 2026-09-16)» بتعبير `starts_with(http.request.uri.path, "/api/og-image/")` — `cache=true` · Edge TTL override **86400ث (يوم)** · Browser TTL **respect_origin** (المسار يرسل أصلًا `public, max-age=86400`).
- **ت-3 (رفع Edge TTL للـ HTML):** في القاعدة نفسها الموجودة «alkemos-public-html-cache» رُفع Edge TTL من 3600 إلى **14400ث (4 ساعات)** (تحديث وصف القاعدة يوثق التغيير) — Browser TTL بقيت 300ث كما رسّختها المرحلة 189.
- **لا تداخل بين القاعدتين:** القاعدة 1 تستثني `/api*` صراحة منذ SEO-GEO-4 — بطاقة OG يطابقها حصريًا القاعدة 2، وHTML العام حصريًا القاعدة 1. طبقة Vercel (ع-4: s-maxage=3600) بقيت عمدًا — طبقتا دفاع (ساعة عند Vercel + يوم عند CF).
- **التحقق الحي بعد التطبيق (alkemos.com، 2026-09-16T15:21–15:25Z):** بطاقة ثابتة og-home-ar وبطاقة مقال = `cf-cache-status: HIT` على حافة CF **لأول مرة** (الفحص التشخيصي قبل التطبيق: كل الجلبات DYNAMIC) · cache-buster جديد = MISS ثم يُكاش (إثبات كاش فعلي لكل URL) · `x-vercel-cache: HIT` أيضًا (ع-4 تعمل) · صفر Set-Cookie · HTML (رئيسية/مدونة/عضويات) = HIT بإعادة كتابة المتصفح نفسها `private, max-age=300` · الدليل الحاكم لت-3 = استجابة Rulesets API نفسها (`edge_ttl override_origin 14400`).
- **صفر آثار جانبية:** `/api/admin/leads` بلا توثيق = 401/DYNAMIC/`max-age=0` · `/auth` و`/api/build-info` = DYNAMIC/no-store · `sitemap.xml` = DYNAMIC (Vercel HIT) · صور التمارين 200/immutable/HIT · robots 200 · `/memberships` 200/HIT · build-info = `5ee4cca` = رأس main (لا انحراف نشر).
- **التوثيق في نفس الفريم (قانون §5.4):** TECH_REFERENCE §5 (قاعدتان بجدول مقارنة) + SECURITY §10 (قاعدتا المنطقة + الأثر الحي بعد ت-1/ت-3) + VERCEL-USAGE-AUDIT-2026-09-16.md §8 (إطار VERCEL-USAGE-3 كاملًا: التنفيذ + الأدلة الحية + الأثر) + تحديث حالتي ت-1/ت-3 في §3/§4 + تعليق route.tsx للبطاقات (صفر تغيير سلوك) + STATE.md (ترويسة + مدخل الفريم — 100 سطر محفوظة بإسقاط سطر متقادم «المرحلة الرسمية الآن: 213»).
- **ملاحظة أمنية للمالك:** التوكن نُشر نصًا في المحادثة — يُنصح بتدويره بعد الاستخدام (نمط المؤكد 1/المرحلة 215 — أُعيد التذكير في §8.4 من وثيقة التدقيق).

Stage Summary:
- ت-1 وت-3 مطبقتان ومتحقَّق منهما حيًا: بطاقات OG تُخدم من حافة CF يومًا كاملًا بصفر دوال/Satori/Supabase/نقل عند إعادة الجلب، ورندرات أصل HTML تقسم ~÷4 على كل PoP — أكبر رافعين متاحين لـ Fluid CPU (3س36د/4س) وTransformations (4K/5K) دون لمس كود المستخدمين.
- لم يبدأ WAVE 2 / المرحلة 216 (تعليق صريح من المالك حتى إتمام التحقق — اكتمل الآن).

Post-push evidence (production carried b810101c — verified 2026-09-16T15:36Z):
- **النشر:** build-info حمل `b810101c` بعد ~دقيقة واحدة من الدفع (15:36Z).
- **ت-1 على النشر الجديد:** بطاقة og-home-ar = 200 PNG · `cf-cache-status: HIT` (حافة CF) + `x-vercel-cache: HIT` (حافة Vercel) — الطبقتان تعملان معًا كما صُمم في §8.
- **ت-3 على النشر الجديد:** الرئيسية = 200 · `cf-cache-status: HIT` · إعادة كتابة المتصفح نفسها `private, max-age=300, must-revalidate`.
- **الآثار الجانبية صفر:** `/api/admin/leads` = 401/DYNAMIC · العضويات والمدونة = 200.
- **GitHub Actions على b810101:** الجودة (tsc/eslint/vitest) نجحت · توازن المستندات نجح · **تنقية النشرات انطلقت تلقائيًا مع الدفع ونجحت** (قانون ع-2 يعمل على كل push).
- **نافذة الرصد المتبقية (اختيارية):** مراقبة `age > 3600` مع `cf-cache-status: HIT` متاحة بعد ~16:08Z (الدليل الحاكم لت-3 = استجابة Rulesets API: `edge_ttl override_origin 14400` — القاعدة هي المصدر وفق قانون P1-5).

---
Task ID: VERCEL-USAGE-2-2026-09-16
Agent: Super Z (main)

Task: ردّ الطوارئ على تقرير استخدام Vercel من المالك («التقرير التالى من vercal ، المشكلة كبيرة» — تنبيهات Exceeded free resources). فريم مستقل يكمل VERCEL-USAGE-1 (نفس اليوم، لا يغيّر ترقيم المراحل).

Work Log:
- **التقرير المُبلَّغ (لوحة المالك):** Deployment Storage **17.13/10GB** + Functions Storage **14.07/10GB** (تجاوز مزدوج) · Speed Insights 9.7K/10K · Fluid Active CPU 3h36m/4h · Image Transformations 4K/5K · Fast Origin Transfer 4.01/10GB · Invocations 358K/1M · Edge Requests 263K/1M · Cache Writes 21K/100K · Web Analytics 3.4K/50K.
- **التشخيص الجذري (أدلة لا تخمين):** سجل تشغيل التنظيف 05:25 UTC اليوم (GitHub API): 80 جاهزًا · حُذف 31 · **بقي 49** — سياسة المرحلة 145 (نافذة 48س) نجحت كما صُممت لكنها **رياضيًا لا تتسع**: ~28 نشرًا/يوم × ~350MB ≈ 17GB. الـ workflow كان يعمل يوميًا بنجاح — العلة في النافذة لا في التنفيذ.
- **ع-1 تضييق السياسة:** `vercel-cleanup.mjs` — نافذة 48→**6 ساعات** · previews 2→**1** (الحساب: ~7 حديثة + production + preview ≈ ~9 × ~350MB ≈ ~3.2GB — هامش ~3× تحت السقف).
- **ع-2 محرّكات التنظيف:** `vercel-cleanup.yml` — تشغيل **مع كل push إلى main** (الاحتجاز يبقى ملتصقًا بأرضية النافذة) + جدولة مزدوجة 01:00+13:00 UTC (تغطي نشرات لوحة التحكم المباشرة؛ 13:00 بعيدة عن كل الفتحات الموثقة) + مدخلات workflow_dispatch جديدة (keep_hours/keep_previews/dry_run).
- **ع-3 إزالة Speed Insights كاملة:** `<SpeedInsights />` من layout.tsx + الاعتمادية من package.json/bun.lock + مدخلا CSP (`vitals.vercel-insights.com` في script-src وconnect-src بـ vercel.json) — كانت 9.7K/10K محترقة ومصدر القياس المعتمد GA؛ **Analytics باقية** (3.4K/50K فقط). الإرجاع = سطر واحد موثق في layout.tsx.
- **ع-4 إصلاح og-image (CPU + Transformations + Invocations معًا):** المسار كان يختم `Set-Cookie: mhe:locale` على كل طلب زاحف بلا كوكيز (المiddleware يعمل عليه) — وهذا **يعطّل أي كاش CDN** ويحرّق قفزة `getUser()` لكل زاحف. الحل: استثناء `/api/og-image/*` من matcher الـ middleware + `s-maxage=3600` في Cache-Control الاستجابة → حافة Vercel تكاش الـ PNG ساعة كاملة. صفر مساس بأي URL مفهرس (الاختبارات تثبّت `/api/og-image/...` — تحقُّق rg قبل التنفيذ).
- **ع-5 نظافة اعتماديات:** إزالة `sharp` المباشرة (rg: صفر مستوردين — `next@16.3.2` يجلبها ذاتيًا عبر optionalDependencies — بلا ادعاء توفير تخزين) + حذف صف `@vercel/og` المتقادم من جدول DEVELOPER_GUIDE (غير مثبتة منذ المرحلة 151 — next/og داخل next) + ملاحظة الإرجاع في next.config.ts.
- **التوثيق:** docs/VERCEL-USAGE-AUDIT-2026-09-16.md §7 جديد (الأرقام المبلّغة + الجذر + ع-1..ع-5 + §7.4 قرارات المالك المتبقية: ت-1 أصبحت أكثر إلحاحًا + ت-2 المتبقي Analytics فقط + ت-3 لتخفيف Fluid CPU) · تحديث ت-2 التاريخية · STATE.md (سطر التحديث + مدخل الفريم + تحديث المعلّقات — lines=100 محفوظة) · SEO-GEO-MASTER-PLAN جدول المراقبة · DEVELOPER_GUIDE جدول الاعتماديات.
- **البوابات:** tsc 0 · eslint 0/0 · vitest 1241/1241 · build 2,056 صفحة · docs_audit ✓ (STATE lines=100 + أرشفة PHASE-207 لقانون النافذة) · docs_parity/stale-refs/migration_audit ✓.

Stage Summary:
- التجاوز المزدوج حُلّ من جذره: النافذة الجديدة 6س + التشغيل مع كل push تخفض الاحتجاز من 49 نشرًا (~17GB) إلى ~9 (~3.2GB) — **يُنتظر هبوط العداد خلال ساعة من أول تشغيل بالسياسة الجديدة** (أول تشغيل انطلق تلقائيًا بحدث الدفع نفسه — انظر الأدلة تحت).
- Speed Insights توقفت عن الاحتراق نهائيًا (97% كانت محترقة)؛ og-image أصبح قابلًا للكاش على حافة Vercel لأول مرة (كان Set-Cookie يعطّله).
- المتبقي على المالك (§7.4): ت-1 قاعدة CF (يوم كامل بدل ساعة — الأعلى أثرًا الآن) · ت-3 اختياري للـ CPU · Redeploy يدوي فقط لو حُجب نشر هذا الكوميت لحظة البناء (يُستبعد — التنظيف يكتمل قبل اكتمال أي بناء).

Post-push evidence (production carried 8e052f85 — verified 2026-09-16T14:37Z):
- **التنقية الأولى بالسياسة الجديدة** (تشغيل push-triggered رقم 35109524504): 59 جاهزًا · **حُذف 54 (فشل 0) · محتجز 5** (production dpl_4guVqP14fvUwfoZXpvHxNDTtwH91 + نافذة 6س + preview) ≈ **~2GB بدل ~17GB** — العداد في لوحة المالك هو الحكم.
- **كاش حافة Vercel لبطاقات og يعمل أول مرة:** `x-vercel-cache: MISS` عند التوليد ثم `HIT (age: 2)` على إعادة الطلب نفسه — الدالة لم تُعد للتشغيل (cf-cache-status: DYNAMIC كما هو متوقع لمسارات api — CF لا يكاشها؛ ت-1 ترفعها لاحقًا إلى يوم كامل) · **صفر Set-Cookie** على طلب زاحف بلا كوكيز (كان الـ middleware يختمه قبل الاستثناء) · بطاقة EN 200 أيضًا.
- **SpeedInsights زالت من الجذر:** صفر مراجع في HTML المولّد + الحزمة غير موجودة في البناء إطلاقًا (package.json/bun.lock) — الأحداث ستتوقف عن التراكم فورًا؛ **Analytics باقية وتعمل** (3.4K أحداث في تقرير المالك تثبت تدفقها؛ سكربتها يُدخل من جهة العميل فلا يظهر في curl — سلوك الحزمة المعروف).
- **نشر 8e052f85 اكتمل وتم الترويج رغم تجاوز التخزين لحظة الدفع** (التنقية فرّغت المساحة قبل اكتمال البناء كما هو مصمم) — الرئيسية 200 · GA موجود.

---
Task ID: VERCEL-USAGE-1-2026-09-16
Agent: Super Z (main)

Task: فحص وتنظيف استهلاك Vercel (أمر المالك المباشر «مطلوب فحص و تنظيف استهلاك vercel» — IM 2026-09-16). فريم مستقل عن موجات خطة التدقيق العميق (لا يغيّر ترقيم 216/217).

Work Log:
- **الفحص:** مسح شامل لمصادر الاستهلاك — كل مسارات API الـ77 (قبل الحذف) + middleware (getUser لكل طلب) + next.config/vercel.json (الكاش/الصور/crons) + workflows (خط المدونة يعمل داخل GitHub Actions in-process — «NO Vercel hop» في run-step.mts → صفر وقت دوال للـ pipeline) + الأصول العامة (96MB، exercises 86MB بكاش immutable يكاشها CF) + سلوك كاش CF الموثق (TECH_REFERENCE §5) + polling العميل + sitemaps/llms (ISR 3600) + robots (يحجب /api/).
- **ن-1 حذف المسار الميت `/api/exercise-image`:** صفر مستدعين (rg شامل — الواجهة تخدم صور التمارين من الاستضافة الذاتية /images/exercises/ منذ الدفعة 2 §12.53-2)؛ كان مسارًا عامًا غير موثق يحرق استدعاء دالة + طلبين صادرين لـ wger.de لكل اسم بارد. حُذف معه: المخطط `exerciseNameSchema` (schemas.ts) + كتلة اختباره (validation-schemas.test.ts) + نمط `wger.de` الميت في next.config remotePatterns + سطر جدول §8 في DEVELOPER_GUIDE.md (ترويسته رُفعت — بوابة I). **يُسقط نصف بند P3-11 من خطة التدقيق** (الحذف أنظف من rate-limit المقترح — تعليق مؤرخ أُضيف لصف الخطة).
- **ن-2 إيقاف الاستقصاء عند إخفاء التبويب** (نمط NotificationBell المعتمد — visibilitychange + استئناف فوري): AdminNotificationBell (30ث) · CoachSupportView (20ث + مستقصي التذكرة المفتوحة 10ث) · AdminCoachSupportView (30ث) · CoachHelpView (30ث). التبويبات الخلفية كانت تحرق استدعاء API + middleware (بقفزة getUser لكل موثق) كل 10–30ث بلا نهاية.
- **التوثيق:** docs/VERCEL-USAGE-AUDIT-2026-09-16.md جديد — خريطة الاستهلاك الكاملة (مرتبة) + ما هو محسّن أصلًا (متحقق منه) + توصيات لوحة التحكم ت-1..ت-4 (كلها بقرار المالك وفق §7: ت-1 قاعدة كاش CF لـ/api/og-image/* = الأعلى أثرًا · ت-2 قرار SpeedInsights/Analytics · ت-3 رفع Edge TTL للـHTML · ت-4 getClaims() في middleware لاحقًا) + جدول حدود Hobby وماذا يحدث عند التجاوز + مسار الفحص الذاتي في لوحة Vercel · STATE.md: مدخل إطار جديد + بند قرارات معلقة في «المفتوح الآن» (بضغط سطرين قديمين للحفاظ على سقف 100) · DEEP-AUDIT-PLAN: تعليق مؤرخ على P3-11.
- **البوابات (الشجرة النهائية):** tsc --noEmit = 0 · eslint . = 0/0 · vitest run = **1241/1241** (79 ملفًا — كان 1243: −2 = كتلة exerciseNameSchema المحذوفة بالضبط، صفر انحدار) · next build ✓ **2,056 صفحة** (كان 2,057: −1 = المسار المحذوف) · docs_audit ✓ (STATE lines=100) · docs_parity ✓ (endpoints=76 — الجدول في DEVELOPER_GUIDE طابَق) · check-stale-refs ✓ · migration_audit ✓.

Stage Summary:
- التنظيف المباشر: مسار ميت غير موثق حُذف بالكامل (استدعاءات + طلاب صادرون لطرف ثالث) + التبويبات الخلفية لم تعد تستنزف API — سلوك الواجهة المرئي بلا تغيير (jsdom يرى التبويب مرئيًا فالحرّاس لم تتأثر).
- الرافعة الأكبر المتبقية خارج الكود: `/api/og-image/[slug]` خارج قاعدة كاش CF (مسار api/) → كل جلب بطاقة سوشيال = دولة Edge + Supabase + Satori عند الأصل. الحل قرار لوحة CF (ت-1 — صفر كود؛ لم يُنقل المسار عمدًا: عشرات الاختبارات تثبّت URL المفهرسة لدى المنصات) — مع ت-2/ت-3/ت-4 موثقة للمالك.
- قرار المعلق: بند P3-11 نصفه الأول أُسقط (الحذف) والباقي receipt_path فقط.
- Push status: pushed (06834dd6).
- Post-push live evidence (production carried 06834dd6 at 2026-09-16T13:50Z via /api/build-info): `/api/exercise-image?name=squat` = **404** (route gone as designed) · `/` = 200 · og-image AR card = 200 image/png (untouched surface) · self-hosted exercise WebP (`Barbell_Bench_Press_-_Medium_Grip/0.webp`) = 200 · `Cache-Control: public, max-age=31536000, immutable` (first fetch cf MISS — the edge entry caches per PoP).

---
Task ID: PHASE-215B-OWNER-DECISIONS-EXECUTION-2026-09-16
Agent: Super Z (main)

Task: Phase 215 closure — the owner's three decisions (order 2026-09-16 «الغى التحذير ، اعتمد الخيار (ب) ، اوافق على تنفيذ p1-6/p1-7»): W0-1 recorded as DROPPED by owner decision · P1-5 closed via option (ب) (Cloudflare adopted as the OFFICIAL production HTML cache layer — documentation-only change) · P1-6 + P1-7 executed with the explicit §7 security approval. This completes WAVE 1 (all 8 P1 items closed); WAVE 2 (216) / WAVE 3 (217) remain pending owner order.

Work Log:
- P1-6 (المؤكد 10) — timing-safe cron auth: new `timingSafeSecretEqual(provided, expected)` atom in `src/lib/cron-auth.ts` (constant-time compare + burned equal-length comparison on length mismatch — no length oracle; fail-closed on unset expected) · `verifyCronAuth` refactored to ride it (single comparison discipline, zero behavior change) · `src/app/api/evo/followup/dispatch/route.ts:67` — the plain `providedSecret === cronSecret` replaced by `timingSafeSecretEqual(providedSecret, cronSecret)`; `EVO_CRON_SECRET` stays a separate independently-rotatable secret · new canary file `src/lib/__tests__/cron-auth.test.ts` (11 tests: exact-match, same-length mismatch, prefix, length-oracle branch, fail-closed unset/absent, Bearer form) · SECURITY.md §3.3 rewritten (verifyCronAuth law + EVO_CRON_SECRET documented) · `.env.example` comment enriched.
- P1-7 (المؤكد 11) — zod bounded inserts: `src/lib/validation/schemas.ts` gained `MAX_TITLE_LEN=200` · `MAX_NOTIF_BODY_LEN=2000` · `MAX_NOTIF_LINK_LEN=500` · `MAX_PLAN_JSON_BYTES=32*1024` (calibration documented: a legit coaching-tier 8-meal plan with per-item macros legitimately reaches low-tens-of-KB — 32KB bounds the insert WITHOUT breaking real saves; the plan's 10KB figure applies verbatim to result_data) · `jsonBytesBounded()` atom (serialized-length refine) · `savedResultBodySchema` (5-slug enum + title + result_data ≤10KB) · `savedMealPlanBodySchema` (title + plan_data ≤32KB, structurally permissive — meals-without-items stays legal) · `broadcastBodySchema` (target enum + uuid userId + userIds ≤1000 + title/body/link ceilings).
- P1-7 route wiring (backward-compat law preserved EXACTLY — every legacy failure class keeps its byte-identical response; routes re-derive the legacy message on zod failure; only NEW ceiling violations get fresh 400s): `save-result/route.ts` (fallback: "Invalid tool" / "Missing result_data"; post-parse falsy guard keeps 0/false/"" legacy semantics) · `save-meal-plan/route.ts` (fallback: "Missing plan_data.meals"; totals walk untouched) · `broadcast/route.ts` (fallbacks: "Missing title or body" / "Invalid target…" / "Missing userId…" / "Missing userIds array…"; the legacy silent slice(0,500) PRESERVED for passing arrays — staff count privileges untouched, only shape bounds tightened; the two post-parse tautologies removed with a comment) · `validation-schemas.test.ts` +16 boundary tests (exact-200/201 · 10KB±1 · 32KB±1 · legit 8×8 coaching plan passes · 1000/1001 userIds · non-uuid rejection · legacy-shape acceptance).
- P1-5 (ب) (المؤكد 2) — Cloudflare adopted as the official cache layer (documentation-only: zero behavior change — comments + docs): `next.config.ts` SEO-GEO-4 rule comment now states the CF cache rule («alkemos cache rules»: cache=true · edge_ttl override 3600 · browser_ttl override 300 · expression = the private-path exclusion list + no-dot paths) rewrites what browsers see while the next.config rule remains the ORIGIN-side policy (Vercel output + non-CF paths) · `src/middleware.ts` comment: same layering truth · SECURITY.md §10: new «Cloudflare — the OFFICIAL production HTML cache layer» subsection (rule provenance SEO-GEO-4 → Phase 189 §12.46-د, verified production effect, layering law: future HTML cache changes are CF-dashboard-first + same-phase doc updates) · docs/TECH_REFERENCE.md new §5 «طبقة الكاش في الإنتاج (Cloudflare)» (architecture diagram, rule table, measured live effect, follow-up law) · SECURITY.md Last-updated header bumped.
- W0-1 — DROPPED by owner order «الغى التحذير» (recorded in the plan file per project convention: «> Dropped (2026-09-16): السبب» — the owner reviewed the exposed-keys warning and declined rotation; not to be re-raised without a new order).
- docs/DEEP-AUDIT-PLAN-2026-09-16.md statuses updated: header (Phase 215 fully complete · 216/217 pending owner order) · WAVE 0 table → drop note · WAVE 1 execution status (P1-5 ✓ (ب) · P1-6 ✓ · P1-7 ✓ with implementation details).
- Gates (§3.5, full suite on the final tree): tsc --noEmit = 0 (absolute — P1-8's clean-clone standard) · eslint . = 0/0 · vitest run = **1243/1243 (79 files)** — was 1216/1216 (78 files): +27 new boundary/canary tests, zero regressions · next build ✓ (2,057 pages, compiled successfully) · docs_audit / docs_parity / check-stale-refs / migration_audit — run post-documentation below (see Stage Summary).

Stage Summary:
- Phase 215 (WAVE 1) is now FULLY closed: 8/8 P1 items executed or closed (P1-1..P1-4, P1-8 previously; P1-5 (ب), P1-6, P1-7 this session) · W0-1 dropped by owner decision.
- Security posture: every cron-style secret comparison in the repo is now timing-safe (M6 discipline universalized); the three unbounded-insert routes are boundary-validated with documented ceilings; zero legacy response changed.
- Cache truth: the documented cache policy now matches the measured production behavior (CF edge 3600s / browser 300s) — the audit's root documentation-lie (المؤكد 2) is closed.
- Commit SHA: fe50d5d0 (P1-6) · 7c08f6de (P1-7) · e4d3b1f5 (P1-5(ب)+W0-1) + this closure commit (worklog+STATE)
- Push status: pushed
- Post-push live evidence (production dcd6d92e, build-info carried the commit 2026-09-16T13:08 UTC): cache-policy truth verified against the NEW documentation — `/` = `private, max-age=300, must-revalidate` + `cf-cache-status: HIT` + `age: 1756` (<3600, the CF edge entry) · `/for-coaches` = same browser header + `cf EXPIRED` → Vercel function re-fetch + re-cache (exactly the documented lifecycle) · `/sitemap-pages.xml` = `public, max-age=3600, stale-while-revalidate=86400` + Vercel PRERENDER + `cf DYNAMIC` (route-set header, outside the CF rule — as documented) · smoke on the changed routes: save-result 401 · save-meal-plan 401 · broadcast 401 · evo/followup/dispatch 401 (the followup kill-switch flag is LIVE on prod — the request passed GATE 1 and was rejected by the admin/cron gate exactly as designed) · homepage 200.

---
Task ID: PHASE-215-AUDIT-REMEDIATION-W1-2026-09-16
Agent: Super Z (main)

Task: Phase 215 — WAVE 1 of the Deep-Audit remediation plan (owner order 2026-09-16 «نفّذ Phase 215 بالكامل حسب الخطة والتقرير المرفقين… عالج جميع بنود P1 في Phase 215 فقط، مع الالتزام بـ IMPLEMENT → VALIDATE → DOCUMENT → COMMIT → PUSH… أي بند 🔐 يحتاج قرارًا مني: توقّف قبله واذكر القرار المطلوب بوضوح»): every non-security P1 item executed through the full cycle; P1-5 verified externally then STOPPED at the owner decision; P1-6/P1-7 (🔐 per §7) NOT implemented — approval requests presented in the §12.9 final report. Phases 216/217 NOT started (owner's explicit boundary).

Work Log:
- P1-8 (المؤكد 12): `src/app/for-coaches/page.tsx` relative public/ image imports (4×) → URL-string refs + intrinsic width/height (the site-wide pattern) — the §3.5 «tsc 0» gate is now ABSOLUTE: 0 errors from a clean install with next-env.d.ts removed. Commit d8f5e552.
- P1-1 (المؤكد 4): SECURITY.md §6 + §9.11 unified with AGENTS.md §3.3/§6 — auto-apply via the Supabase–GitHub integration is the documented DEFAULT; the manual path is the scoped exception set (auth.users 0040/0050/0055/0066 + legacy RUN_ON_SUPABASE_*/VERIFY_* with the raw-link + consolidated-file protocol).
- P1-2 (المؤكد 5): BRAND NAME LAW restored from git history (`git show a3e2bfc4~1:AGENTS.md`): canonical «Musclehubeg» + variants «MuscleHubFit»/«MuscleHubEG»/«MuscleHub Egypt»/«MuscleHub» now forbidden in the law text; lowercase functional identifiers (org muscleshubfit-cpu · musclehubeg-backups · config.toml project_id · owner email) explicitly protected. Commit abfd8357 (P1-1 + P1-2).
- P1-3 (المؤكد 6): one-shot LEGAL worklog reorder — the 206-211 block (7 entries incl. SEO-GEO-15 live-verify) moved from the file bottom to its chronological position between 212 and 205 (reversed to newest-on-top) + 213 raised above 212; 180 entries preserved byte-for-byte (sorted-line multiset differs only by 205's long-missing `---` separator + EOF newline normalization). Local one-shot script OUTSIDE the repo (disclosed — the Phase-213 lesson). Commit 8aec3368.
- P1-4 (المؤكد 3 + 22 + 25): §12.5.2 cadence formally RESUMED — DOC-AUDIT-2026-09-16 entry (first since 2026-08-25) + docs_audit.py v2 TRUTH checks: H worklog newest-on-top (top-12 window + newest-at-top + tail frozen ≤2026-09-15) · I governed-docs Last-updated vs git (forward-only from the gate birthday 2026-09-16) · J frozen-verbatim archive integrity (PROGRESS/QA_CHECKLIST, zero commits since 2026-09-16). Sensitivity PROVEN per the plan's acceptance: on pre-fix abfd8357 the gate fails with exactly the two audit breaks (H/window-order + H/tail-freeze) and passes after. CI_GATES.md row + docs-parity-gate.yml comment updated in the same commit. Commit 7674a7c6.
- P1-5 (المؤكد 2) — external verification COMPLETED (read-only Cloudflare API + live curl), execution STOPPED at the owner decision: zone Browser-Cache-TTL = **0 (Respect Existing Headers — NOT the source)** · zero active legacy Page Rules · exactly ONE Cache Rule «alkemos cache rules (SEO-GEO-4 2026-09-08)» (ruleset d9f2c38e782043369d0815caef91cb60, last_updated 2026-09-13 = Phase 189, v2): `cache=true` + `edge_ttl override_origin 3600` + `browser_ttl override_origin 300` (added Phase 189 per SEO-GEO-MASTER-PLAN §12.46-د), expression = the SEO-GEO-4 private-path exclusion list + no-dot paths. Live 2026-09-16 evidence: `/` and `/for-coaches` = `private, max-age=300, must-revalidate` + `x-vercel-cache: MISS` + `cf-cache-status: EXPIRED` (edge entry expired → Vercel function) ; `/sitemap-pages.xml` = its route-set header (`src/lib/sitemap-xml.ts:23`) + Vercel HIT + cf DYNAMIC. The premise of option (أ) (Browser-Cache-TTL=5min as the source) is DISPROVEN; option (ب) matches the verified reality — DECISION PENDING with the owner.
- P1-6 (المؤكد 10) 🔐 + P1-7 (المؤكد 11) 🔐: NOT implemented — §7 requires explicit owner approval BEFORE implementation (auth-comparison + API-boundary changes). Precise proposals presented in the final report; zero code touched.
- Gates at every push (per item): tsc 0 (absolute from P1-8 on) · eslint 0/0 · vitest 1216/1216 (78 files) · next build success (2,057 pages, BUILD_ID DPXAZMQ-w-p2ZoXl6zQ9D) · docs_audit (v2 with H/I/J) · docs_parity · check-stale-refs · migration_audit — all green locally; CI green on every push.

Stage Summary:
- 5/8 P1 items closed and live; 1/8 (P1-5) fully verified + awaiting the owner decision (أ/ب); 2/8 (P1-6/P1-7) stopped at the §7 gate exactly as the owner instructed. WAVE 2 (216) and WAVE 3 (217) untouched.
- Production verified live at 7674a7c6 via /api/build-info (2026-09-16T06:22 UTC) — every Phase-215 commit deployed.
- The knowledge system gained its first TRUTH gate (order/header-date/archive-freeze) and the §12.5.2 documentation-audit cadence resumed after ~130 phases — the audit's root-cause finding (المؤكد 3) is now structurally guarded.
- Commit SHA: d8f5e552 (P1-8) · abfd8357 (P1-1+P1-2) · 8aec3368 (P1-3) · 7674a7c6 (P1-4) · b3486563 (closure)
- Push status: pushed (SYNCED على origin/main)
- Post-push live evidence (production b3486563, 2026-09-16T06:29 UTC): /api/build-info حمل الكوميت · /for-coaches و/ar/for-coaches = 200 · الصورة عبر next/image مُحسَّنة وقت البناء (/_next/static/immutable/media/coach-portrait.… 42KB jpeg عبر المُحسِّن = 200) — Next 16 يعالج مراجع URL النصية للمجلد public بنفس مسار التحسين وقت البناء، فالتغيير محايد بصريًا تمامًا · CI على GitHub أخضر على كل دفعة (Quality gate + stale-refs + docs-parity بفحوص H/I/J الجديدة تعمل على الإنتاج)

---

Task ID: PHASE-214-DEEP-AUDIT-2026-09-16
Agent: Super Z (main — independent audit session)
Task: Phase 214 — independent comprehensive Deep Audit of the whole project (code + production + docs), owner order 2026-09-16 — READ-ONLY: zero source changes; full findings report + prioritized remediation plan committed as documentation.

Work Log:
- Fresh clone at 9c3ab80d; verified live production == main (via /api/build-info) — zero deploy drift.
- Gates re-run from a clean clone: tsc = 4 pre-existing image-module errors in for-coaches/page.tsx (next-env.d.ts gitignored — documented finding, not new); eslint 0/0; vitest 1216/1216 (78 files); next build SUCCESS (BUILD_ID BZO28s66jBuzk1MZGiUFZ, full route table); docs_audit PASS; migration_audit PASS (zero new drift; RLS on every table).
- Full live crawl: all 2,160 sitemap URLs (6 children) = 100% HTTP 200, zero 404, documented 301s + /chat 308 verified working.
- Live cache forensics: public HTML serves `private, max-age=300, must-revalidate` + x-vercel-cache MISS — NOT the next.config.ts SEO-GEO-4 policy (`public, s-maxage=3600, SWR=86400`); sitemaps/robots DO match config; Cloudflare edge-caches HTML anyway (cf-cache-status HIT, age>25min) — layer undocumented in repo (report finding P1-#2).
- Real performance measurement (headless mobile 390x844): EN / LCP 456ms · CLS 0.103; AR /ar LCP 268ms · CLS 0.107 (both above the 0.1 threshold; shift source SECTION#tools 0.095); first-load homepage = 1,300KB total, 1,009KB JS (26 files); /equipment/bodyweight = 539KB HTML / 348 cards / 2,749 DOM nodes; zero console errors; screenshots archived.
- Sub-agent audits (3 parallel, read-only): AUDIT-2A EN/AR parity (100% route parity; 5 confirmed content findings incl. 14 og:image-missing surfaces + EVO header locale); AUDIT-2B documentation governance (24 confirmed findings incl. brand-law self-corruption, SECURITY.md vs AGENTS.md migration-law contradiction, worklog ordering broken 206-211/213, archive mutated post-freeze, §12.5.2 cadence abandoned since 2026-08-25); AUDIT-2C API security (76 routes — zero IDOR, zero ungated privileged routes, RLS verified; 7 findings incl. evo/followup plain === secret compare + zod on 3/76 only).
- Secrets scan: zero hardcoded keys in repo; only .env.example tracked (values empty — correct). URGENT owner action: the GitHub PAT used for this session appeared verbatim in the chat — rotate immediately after this push (plan W0-1).
- Deliverables committed (docs-only): docs/DEEP-AUDIT-REPORT-2026-09-16.md (full evidence-backed findings, Arabic) + docs/DEEP-AUDIT-PLAN-2026-09-16.md (prioritized waves: W0 token rotation · W1 phase-215 security/cache/governance P1 · W2 phase-216 SEO/perf P2 · W3 phase-217 docs-hygiene P3) + STATE.md phase-214 refresh. Plan NOT executed per owner order.

Stage Summary:
- Audit verdict: no P0 (no exploitable hole, no broken page, no exposed secret in-repo, authz matrix clean across all 76 API routes); 6 confirmed P1 + 8 confirmed P2 + 13+ confirmed P3 — full classified list with file paths in the report.
- Production == main at 9c3ab80d; crawl 2,160/2,160 = 200; all project gates reproduced green (with the tsc-conditional caveat documented).
- Biggest systemic findings: documented SEO-GEO-4 cache policy is not what production serves (Cloudflare layer undocumented) + §12.5.2 documentation-audit cadence abandoned = root cause of the 24 doc findings.
- Remediation plan: docs/DEEP-AUDIT-PLAN-2026-09-16.md (waves W0-W3, per-item acceptance criteria, security items pre-gated by §7 owner approval). EXECUTION PENDING OWNER ORDER.
- Commit SHA: 6f861804 (audit deliverables) + follow-up SHA-recording commit (this one)
- Push status: pushed

---

Task ID: DOC-AUDIT-2026-09-16
Agent: Super Z (main — Phase 215 session)

Task: §12.5.2 periodic documentation audit — the cadence is formally RESUMED (first DOC-AUDIT entry since 2026-08-25; the ~130-phase gap is audit finding المؤكد 3). This entry formalizes the documentation-audit results of the 2026-09-16 independent Deep Audit (Phase 214) and rides Phase 215's P1-4 gate-hardening commit; it sits directly under the Phase 214 entry it documents.

Work Log:
- Audit source: docs/DEEP-AUDIT-REPORT-2026-09-16.md (Phase 214 — full evidence; 27 confirmed findings + 10 notes).
- Doc violations confirmed by that round (report numbering): المؤكد 4 (migration-law contradiction SECURITY↔AGENTS) · المؤكد 5 (self-neutered BRAND NAME LAW) · المؤكد 6 (worklog order: stages 206-211 at the bottom + 213 under 212) · المؤكد 20-25 (SECURITY.md factual errors · README variable number · 5 stale Last-updated headers · STATE orphan line at the 100-line cap · frozen TECH_REFERENCE/CI_GATES/DEVELOPER_GUIDE gaps · archive/PROGRESS.md edited after the Phase-115 freeze + §12.5.1 template abandonment).
- Fixed in Phase 215 (WAVE 1): P1-1 ✓ P1-2 ✓ P1-3 ✓ P1-4 ✓ P1-8 ✓ (commits d8f5e552 · abfd8357 · 8aec3368 + this gate commit).
- Gate hardened — docs_audit.py v2, three TRUTH checks: H worklog newest-on-top (top-12 window: dates non-increasing + same-date phases descending, newest entry at the top, tail frozen ≤ 2026-09-15) · I governed-docs (AGENTS/README/DEVELOPER_GUIDE/SECURITY/DESIGN) Last-updated header vs git history — forward-only from the gate birthday 2026-09-16 · J frozen-verbatim archive integrity (archive/PROGRESS.md + archive/QA_CHECKLIST.md: zero commits since 2026-09-16).
- Sensitivity PROVEN per the plan's acceptance criterion: on the pre-fix state (abfd8357) the new gate fails with exactly the two audit breaks — H/worklog-window-order (213 below 212) + H/worklog-tail-freeze (2026-09-16 entries hiding in the tail) — and passes on the fixed state (8aec3368+).
- Remaining doc debt → WAVE 3 / Phase 217 (P3-1..P3-8): README/DEVELOPER_GUIDE/DESIGN headers, TECH_REFERENCE 0069→0087, CI_GATES workflows table, DEVELOPER_GUIDE §8 routes, .env.example vars, §12.5.1-template/deprecated markers.

Stage Summary:
- The §12.5.2 cadence law is live again: monthly + post-major-feature + post-force-push documentation audits now have a worklog trail AND a gate that catches the documented rot classes (order drift, header lies, archive edits).
- docs_audit.py now verifies TRUTH (order/dates/freeze) in addition to STRUCTURE; pre-gate violations are grandfathered forward-only (baselines: worklog tail 2026-09-15 · gate birth 2026-09-16).
- Commit SHA: d8f5e552 (P1-8) · abfd8357 (P1-1+P1-2) · 8aec3368 (P1-3) + this P1-4 gate commit (full ladder in the Phase 215 closing entry)
- Push status: pushed

---

Task ID: PHASE-213-GEO-PARAGRAPH-REVERT-2026-09-16
Agent: Super Z (main)
Task: Phase 213 — Partial revert of Phase 212 items 8/15 (owner order 2026-09-16): remove the bilingual GEO paragraph added directly after the homepage hero — AR «منصة Alkemos منصة لياقة وتغذية مجانية: احسب سعراتك وماكروزك، تصفّح 868+ تمرينًا، واعرف قيمة أكثر من 8,830 صنف غذائي، وولّد خططك مع EVO — بدون حساب أو دفع.» + EN «Alkemos is a free fitness and nutrition platform where you can calculate calories and macros, browse 868+ exercises, look up 8,830+ foods, and generate plans with EVO — no account or payment required.» — and nothing else from the last edit.

Work Log:
**Scope:** exactly ONE source file (src/components/views/LandingView.tsx) — pure 10-line deletion (4-line comment + 5-line `<p>` element + 1 blank line). Verified zero other text/link/icon/structure touched: `git diff 304e70d0~1 -- LandingView.tsx` still contains all 15 added lines of the OTHER owner-ordered copy (H1, hero line, seal chips, tools H2, lead-card headline, tech line, coaching h2, food-card units, weeksUnitAr wiring) and ZERO GEO references.

### Test-guard audit (owner item 3)
Full-suite grep for the paragraph texts and their distinctive fragments (`no account or payment required`, `بدون حساب أو دفع`, `GEO paragraph`, `look up 8,830+ foods`, `browse 868+ exercises`, `868+ تمرينًا`, `ولّد خططك مع EVO`) across all test files: **ZERO guards added or updated for these paragraphs in 304e70d0.** The two test files that commit touched pin OTHER copy and were intentionally left unchanged:
- `ai-meal-planner.test.ts` → pins the new lead-card headline "A plan built around your goals — not generic templates" (item 6/13 — still live).
- `homepage-adoption.test.ts` → pins the retired warrior-card headline in its STANDALONE quoted form `"مدربك الذكي 24/7"` (item 2/4 — the hero line legitimately contains the phrase inside its sentence; still live).
No test removal/revert was needed — confirmed empirically by the unchanged pass count below.

### Structural restoration proof (owner item 5)
The region between the hero `</section>` and the Greek meander divider returned byte-for-byte to its pre-304e70d0 shape: `</section>` → single blank line → `{/* Greek meander divider — mission §4 */}` (verified against `git show 304e70d0~1`). The working diff vs HEAD is a pure deletion of the 10 added lines; the diff vs the pre-paragraph baseline shows the GEO block gone while every other owner-ordered change remains.

### QA gates
- `tsc --noEmit`: exit 0 (clean).
- `eslint` (LandingView.tsx): 0 problems.
- `vitest run`: **1216/1216 passed** (78 files — identical count to Phase 212: no assertion anywhere depends on the two paragraphs).
- `npm run build`: ✓ Compiled successfully — **2,057/2,057 pages** (identical count; a copy-only deletion cannot change the route table, and it didn't).
- `scripts/docs_audit.py`: phase=213, 100/100 lines ✓.
- Diff audit: 1 file changed, 10 deletions, 0 insertions in source; governance files (STATE.md + this worklog + scripts/phase213_state_update.py) ride the same commit per repo protocol.

Stage Summary:
### Rollback
Single revert of this commit re-instates the GEO paragraph — no other surface is entangled.

---

Task ID: PHASE-212-HOMEPAGE-COPY-UNITS-2026-09-16
Agent: Super Z (main)
Task: Phase 212 — Homepage EN/AR copy refresh + nutrition unit unification (جم/كالوري) + Arabic weeks grammar + affiliate program naming (owner order 2026-09-16 — 18 numbered items, copy-only: zero links/structure/icons changes)

Work Log:
**Scope:** 21 source files + 2 test-guard updates + STATE.md. Verified: zero href target changes (the only href-line diff is a label-only change), zero icon changes, zero business-logic changes.

### (1) Homepage — LandingView.tsx (owner items 1-8 AR, 10-16 EN)
- H1: «تدرّب بذكاء. تغذَّ بدقة. وتقدّم بوعي.» → «تدرّب بذكاء، كُل بوعي، وتقدّم نحو هدفك كل يوم.» / EN → "Train smarter. Eat smarter. Progress with numbers on your side."
- Hero line (AR verbatim item 2): «حاسبات سعرات وماكروز مجانية، 868+ تمرين بالشرح والصور، قاعدة أطعمة بأكثر من 8,830 صنف، وEVO مدربك الذكي 24/7 — ابدأ الآن مجانًا، وأنشئ حسابًا فقط لحفظ خططك ومزامنتها.» / EN item 11 verbatim.
- Seal chips: «صنفًا غذائيًا»→«صنف غذائي بالسعرات والماكروز» + EN `${FOODS_PLUS} foods with calories & macros`; «EVO مدرب ذكي 24/7»→«EVO مدربك الذكي — متاح 24/7» + EN "EVO — your AI coach, 24/7". Note: .seal-chip CSS applies text-transform:uppercase (pre-existing design) — DOM text is verbatim as ordered.
- H2 tools: «اعرف ما يحتاجه جسمك بالأرقام»→«احسب احتياجك اليومي من السعرات والماكروز خلال ثوانٍ» / EN → "Your Daily Targets, Calculated in Seconds".
- Lead-card h3: «خطتك، مصممة لك.»→«خطة تناسبك أنت — لا قوالب جاهزة عامة» / EN → "A plan built around your goals — not generic templates".
- Tech line: full replacement both languages (items 7/14 verbatim).
- NEW GEO paragraph (bilingual, items 8/15) directly after the hero section — plain centered `<p>`, no links/icons/structure touched.
- Coaching h2 EN: "Real Coaching, Not Just a PDF" → "Real Coaching, Not a One-Time PDF" (AR untouched — not in the order).

### (2) Affiliate naming (item 9 — site-wide)
«برنامج الأفلييت» → «برنامج الإفلييت (الشركاء)» — 16 occurrences / 7 files: SiteHeader (nav label), SiteFooter (link label), AffiliateProgramView ×3 (h1 + 2 FAQ/answers), ReferralView (h1 «…والعمولات»), comparisons.ts ×3 labelAr, BlogComponents CTA, ar/affiliate/layout.tsx ×6 (title/description/keyword/OG/Twitter/alt). Phrases «رابط الأفلييت»/«قسم الأفلييت» (no «برنامج») intentionally untouched — outside the order's wording.

### (3) Unit unification g→«جم» / kcal→«كالوري» + space-after-number (item 17 — Arabic nutrition texts)
- LandingView food cards: `{food.protein}g`/`{food.carbs}g` → isAr-aware « جم» (kcal side was already «كالوري»).
- FoodsExplorer card row: kcal + protein/carbs g → isAr-aware.
- FoodsFilters labels: (g/100g)→(جم/100 جم) ×2, (kcal/100g)→(كالوري/100 جم).
- FoodDetailClient: 13 spots — default serving grams, «لكل 100g» label, per-100g grid ×3, grams input unit + presets, computed macros ×4, macro-selector units (unitAr «كالوري»/«جم»), «اضبط Ng», quick-target presets (labelAr «30 جم بروتين»… «300 كالوري» — كربوهيدرات per the MSA law, NOT كارب), share text, related-foods line.
- meal-planner: Stat/MiniStat units ×8, ItemRow (kcal/100g line, grams unit, computed kcal chip), search-result kcal, AR lead-capture summary.
- tools/macro-calculator: result cards ×3 + AR summary/share strings.
- tools/calorie-calculator: macro cards ×3 + AR summary.
- profile: saved-plan stats line (isAr units).
- api/send-email: FieldDef gains `suffixAr` — « كالوري»/« جم» on the 15 kcal/g fields (kg/ml/% shared, untouched); both render sites (HTML rows + text fallback) now language-aware.
- evo-system-prompt: nutrition context «لكل 100g …Ng» → «لكل 100 جم …N جم».

### (4) Arabic weeks grammar — «12 أسابيع»→«12 أسبوعًا» (item 18 — site-wide)
The phrase renders DYNAMICALLY via durationWeeks (three 12-week programs in the live library). Added `weeksUnitAr(n)` to src/lib/utils.ts (1→أسبوع · 2→أسبوعين · 3-10→أسابيع · 11+→أسبوعًا) and wired it in the 5 display sites: LandingView program card, programs listing, ProgramDetailClient (duration + related), ai-job-processors AR note. 6/8-week labels stay grammatically plural (أسابيع) — correct Arabic, zero regression.

### Test guards updated to pin the NEW owner copy (intent preserved)
- homepage-adoption: the retired EVO warrior-card guard now pins the STANDALONE quoted headline `"مدربك الذكي 24/7"` instead of the bare phrase (the new hero sentence legitimately contains it inside the owner-ordered platform summary); structural guards (evo-hero-card/id="evo") unchanged and green.
- ai-meal-planner: pins the new lead-card headline "A plan built around your goals — not generic templates" (was "Your plan. Built for you.").
- tool-msa-surface «كارب» canary: my first draft used «كارب» in the new food-page presets — caught by the canary, corrected to «كربوهيدرات» before commit (the MSA law held).

Stage Summary:
### Post-push live verification (production 304e70d0 — 2026-09-16)
- `/api/build-info` → commit 304e70d0 (branch main) — deploy confirmed.
- EN `/` : all 9 new strings present (H1, hero line, GEO paragraph, tools H2, lead-card headline, tech line, coaching h2, both seal chips) — spot-verified via curl.
- AR `/ar` : all new strings present; ALL replaced old strings gone (H1/hero/H2/خطتك، مصممة لك/التوليدان/EVO مدرب ذكي 24/7). Program card renders «12 أسبوعًا» (PPL) with «8 أسابيع»/«6 أسابيع» correctly plural. Note: «صنفًا غذائيًا مع سعراته…» في مقدمة قسم التغذية بقيت عمدًا — البند 3 استهدف ختم الهيرو فقط (البند الموازي EN «8,830+ FOODS» هو نص الختم حصريًا).
- `/ar/foods` : « كالوري»/« جم» + فلاتر «(جم/100 جم)»/«(كالوري/100 جم)» live. `/ar/foods/chicken-breast` : «القيم الغذائية لكل 100 جم» + «31 جم» + «0 جم» live.
- `/ar/affiliate` : «برنامج الإفلييت (الشركاء)» ×17 live. EN surfaces (kcal/g labels) unchanged as intended.

### QA gates
- `tsc --noEmit`: 0 errors in every touched file (4 pre-existing image-module errors in for-coaches/page.tsx verified IDENTICAL on the pristine tree via git stash).
- `vitest run`: **1216/1216 passed** (78 files).
- `bun run build`: success — 2,057 pages.
- `scripts/docs_audit.py`: phase=212, 99/100 lines ✓.
- Diff audit: zero href target changes, zero icon changes, zero JSX structure changes (only text content + the one owner-ordered GEO `<p>` + the weeksUnitAr helper).

---
Task ID: PHASE-211-SEO-GEO-20-ITEM13-DROPPED-2026-09-16
Agent: Super Z (main)
Task: Phase 211 — SEO-GEO-20: review §12.53 item 13 (the last undecided item), verify the live hreflang/language-discovery state, and close it as DROPPED with a documented rationale (owner order 2026-09-16: «راجع البند 13… إن كان الوضع الحالي كافيًا تقنيًا عبر head ولا توجد فائدة SEO حقيقية… أغلق البند بقرار إسقاط موثق… لا تعدّل كود الموقع»).

Work Log:
**Scope:** review + documented decision ONLY — zero production code touched (owner's explicit limit).

### Technical investigation (live evidence on production 929a7ea, Cloudflare cache-buster)
1. **Item description verified accurate:** LanguageToggle is a `<Button onClick>` (client JS) — not a crawlable `<a href>` (`src/components/LanguageToggle.tsx`); its coverage includes every mirror pair up to /affiliate (208).
2. **Official channel #1 — head alternates:** live on every page checked (EN + AR homepages, /affiliate, /tools/bmi-calculator) with the full reciprocal en/ar/x-default triple.
3. **Official channel #2 — sitemaps:** reciprocal `xhtml:link` pairs in sitemap-pages for every entry (checked / · /ar · /exercises · /ar/exercises) and in sitemap-blog for every paired article (14 entries = 7 pairs × both directions, of 71); unpaired articles stay honestly self-only (settled-list behavior, §12.53-ج).
4. **Internal linking:** the footer is locale-aware with plain textual `<a href>` anchors covering each language tree fully — URL discovery never depended on the toggle.

### The verdict — DROP (no technical reason to implement)
1. Google never reads the `hreflang` attribute on `<a>` anchors: its three officially supported methods are head links tags, HTTP headers, and sitemap xhtml:link — two of which are fully live here. Footer `<a hreflang>` links would add ZERO hreflang signal.
2. Discovery is triple-covered (sitemaps with all mirrors + head alternates on every page + same-tree textual internal links) — the original audit's premise («discovery via head only») was conservative; reality is stronger.
3. The JS toggle is a UX matter, not an SEO one — crawlers discover by URLs, all of which are covered.
4. Negative cost/benefit: a fresh code batch touching the site-wide footer for zero hreflang value + slight link-equity dilution.

### Effect — §12.53 plan is now FULLY CLOSED (14/14 rows decided)
8 executed & live-verified (1/2/3/4/5/7/11/12) + 2 companion discoveries executed (207/209) + keep (8) + drop (13) + 4 postponed by owner (6/9/10/14). Zero Pending rows remain.

### Files changed (docs only)
- docs/SEO-GEO-MASTER-PLAN.md — §12.53 table row 13 → محسوم: إسقاط · §12.58 impact line got the closure pointer · new §12.59 (the decision record with the live evidence).
- STATE.md — phase 211 (header, ladder, new (٠٠) 211 entry, QA header, official-phase footer); the 197+196 history entries merged into one line to hold the 100-line cap; «آخر كوميت متحقق منه» still 929a7ea's parent pin until the post-push evidence commit.
- worklog.md — this entry.

### Gates (docs batch)
docs_audit (phase=211, STATE=100 lines) ✓ · docs_parity ✓ · check-stale-refs ✓ · migration_audit ✓ — tsc/eslint/vitest/build not applicable by construction (zero code files; CI runs the full battery on push).

Stage Summary:
### Rollback
Single revert of the docs commit — zero production impact possible (HTML output unchanged by construction).

### Post-push sanity (light — HTML unchanged by construction)
build-info carried b1b3ce9 ~2 min after the push (checkedAt 2026-09-15T20:30:06Z). Live pages with
Cloudflare cache-buster: / = 200 · /ar = 200 · /affiliate = 200 · /ar/affiliate = 200 — and the very
thing this decision preserves is confirmed intact post-deploy: the full reciprocal hreflang triple
(en / ar / x-default, one element each) on /affiliate. No independent live-verification round needed
for a docs-only batch (HTML unchanged by construction).
---
Task ID: PHASE-210-SEO-GEO-19-OWNER-DECISIONS-2026-09-16
Agent: Super Z (main)
Task: Phase 210 — SEO-GEO-19: record the owner's decisions on the remaining §12.53 items (owner order 2026-09-16 «البند ٦ اجلة ، البند ٨ القرار إبقاء، البنود ٩ و ١٠ و ١٤ اجلهم، ثم افحص ملف توثيق seo واخبرنى ما التالى»)

Work Log:
**Scope:** documentation-only batch — zero production code/assets/data/migrations. The §12.53 table's "awaiting owner decision" cells are closed with the recorded decisions; no production file touched. (Batches 11 + discovery 208 were already shipped & live-verified as phases 208/209 before this.)

### Decisions recorded (all 2026-09-16)
- **Item 6 (blog article depth): POSTPONED** — the pipeline depth-raise work is suspended until reopened by an owner order. Nothing was in flight (it was a "continuous/pipeline" item, never started).
- **Item 8 (FAQPage on home + /faq, HowTo on exercise pages): DECISION = KEEP.** The deprecated-schema markup stays served as-is — exactly the second option in the table: no Google harm (rich-result seats retired anyway), potential AI/GEO reading value. Decision line added to docs/SEO-SCHEMA-REFERENCE.md (FAQPage section) in the same frame. Revisit only by a new owner order.
- **Item 9 (Wikidata entity + sameAs): POSTPONED** (external item by nature).
- **Item 10 (first 10 real Trustpilot reviews → re-enable aggregateRating): POSTPONED** — law P0-5 stays in force: no rating signal without a real source.
- **Item 14 (USDA EN policy review after 90 days of GSC data): POSTPONED** — the ~2026-12-07 data milestone stays informational, not a scheduled commitment.

### Effect on the plan
The §12.53 table is now fully closed EXCEPT item 13 (P3 optional: textual hreflang links in the footer — still undecided). Plan scorecard: 8 items executed & live-verified (1/2/3/4/5/7/11/12) + 2 companion discoveries executed (AR og:image trio in 207 · EN /affiliate card in 209) + 1 decided-keep (8) + 4 postponed (6/9/10/14) + 1 undecided (13).

### Files changed (docs only)
- docs/SEO-GEO-MASTER-PLAN.md — §12.53 table status column (items 6/8/9/10/14) + §12.57 trailing remainder line + new §12.58 section (the decision record).
- docs/SEO-SCHEMA-REFERENCE.md — one owner-decision line in the FAQPage guidance block (same-frame documentation law).
- STATE.md — phase 210: header, phase ladder, new (٠٠) 210 entry, QA header, official-phase footer; the 198-ب2+ب3 history entries merged into one line to hold the 100-line cap; «آخر كوميت متحقق منه» stays 512b193 (the last production-verified commit — nothing shipped past it).
- worklog.md — this entry.

### Gates (docs batch)
docs_audit (phase=210, STATE=100 lines) ✓ · docs_parity ✓ · check-stale-refs ✓ · migration_audit ✓ — tsc/eslint/vitest/build not applicable by construction (zero code files; CI runs the full battery on push as always).

Stage Summary:
### Rollback
Single revert of the docs commit — zero production impact possible (HTML output unchanged by construction).

### Post-push sanity (light — HTML unchanged by construction)
build-info carried 634fe96 ~25s after the push (checkedAt 2026-09-15T20:14:39Z — Vercel auto-deploy;
zero HTML diff by construction). Live pages with Cloudflare cache-buster: / = 200 (title intact:
«Alkemos — The Smart Fitness & Nutrition Platform») · /ar = 200 · /affiliate = 200 · /ar/affiliate = 200
(the single 308 seen was only the trailing-slash redirect of the test URL shape /ar/ → /ar).
No independent live-verification round needed for a docs-only batch.

---
Task ID: PHASE-209-SEO-GEO-18-DISCOVERY208-2026-09-16
Agent: Super Z (main)
Task: Phase 209 — SEO-GEO-18: execute discovery 208 — og:image for the EN /affiliate page (owner order 2026-09-16 «بعد إغلاق البند 11، نفّذ اكتشاف 208 الخاص بـ"og:image" لصفحة "/affiliate" EN. فقط»)

Work Log:
**Scope:** ONE variable — the social card of one EN surface. The layout's own openGraph block REPLACES the root one in Next.js metadata merging (the §12.53 item 4 defect family, fixed for the 9 EN list surfaces in 206 but /affiliate was never on that audit list; the AR mirror got its card in 208). Full detail: §12.57.

### What shipped
- **src/app/affiliate/layout.tsx (the only production file touched):**
  - `openGraph.images` → og-home-en card (1200×630, the family alt «Alkemos — The Smart Fitness & Nutrition Platform» — identical to /programs · /coaching · /memberships · /evo · /diet-plan from 206).
  - `openGraph.locale = "en_US"` (was absent — same item-4 family; og:url already existed).
  - `twitter.images` (the card was already summary_large_image but image-less — pointless with a 1200×630 asset).
  - Header comment refreshed: the old text still described the pre-208 world («AR metadata is provided via hreflang on the same path») — stale since the /ar/affiliate mirror exists.
- **Guard og-image-coverage.test.ts:** the EN entry added to WIRED_SURFACES (40 → 41) + a header-doc line — both halves of the affiliate pair (EN + AR) are now guarded by the same test.
- **Sitemap:** untouched — the pages-family lastmod is already 2026-09-16 (same ship-day, truthful, no bump needed). Internal linking untouched (locale-aware since 208).

### Pre-push "before" evidence (production be7e5b1, Cloudflare cache-buster)
Present: og:title · og:description · og:url · og:site_name · og:type · twitter:card=summary_large_image · twitter:title · twitter:description.
**Absent: og:image · og:locale · twitter:image** — the exact gap the discovery documented.

### Gates (all green before push)
tsc 0 · eslint 0/0 · vitest (1215 → **1216/1216**, +1 wired surface) · build 0 (2,057 pages — metadata-only change on an existing surface, count unchanged) · docs_audit (phase=209, STATE=100 lines) · docs_parity · check-stale-refs · migration_audit ✓

Stage Summary:
### Rollback
Single revert of the two files (EN layout + guard) — zero migrations, zero AR-side changes.

### Live verification on production (512b193 — 14/14 green)
build-info carried the commit ~2 min after push · `/affiliate` = 200 with `og:image=https://alkemos.com/images/og/og-home-en.png` (1200×630 + alt) · `og:locale=en_US` · `twitter:image` + `twitter:card=summary_large_image` · asset og-home-en.png = 200 · title/canonical/hreflang pair identical to the pre-batch state (EN half untouched besides the card) · **regression checks:** `/ar/affiliate` intact (200 + og-home-ar + ar_EG) and `/memberships` intact (card present) · mastery note: one false-negative in the first script round — Next.js renders the attribute `hrefLang` (camel-case) while the script grepped `hreflang`; fixed and re-run → 14/14.

Task ID: SEO-GEO-15-BATCH1-LIVE-VERIFY
Agent: Main (Z User)
Task: التحقق الحي من دفعة ١ (المرحلة 206) على الإنتاج بعد نشر 5713713

Work Log:
- انتظار نشر Vercel حتى build-info = 5713713 (تحقق بعد ~90 ثانية)
- سكربت تحقق حي 37/37 ✅: مخططا EVO/Coaching EN إنجليزيًا كاملاً (صفر عربي) والمرايا AR عربية كاملة (سكربت محفوظ خارج المستودع بكاسر كاش)
- البطاقات التسع EN ظاهرة + og:url/og:locale على /memberships + og:locale على water-tracker + twitter للequipment = summary_large_image
- عنوان الرئيسية «Alkemos — The Smart Fitness & Nutrition Platform» (48 حرفًا) + «Fitness & Nutrition Blog | Alkemos» + lastmod السايت مابين 2026-09-15
- انحدارات AR سليمة (/ar و/ar/exercises و/ar/foods و/ar/programs و/ar/memberships = og-home-ar)
- ملاحظة تشغيلية: Cloudflare يخدم HTML قديمًا حتى ~ساعة على بعض المسارات (age:3300 رغم max-age=300) — التحقق اجتاز بكاسر كاش؛ موثقة للمالك في §12.54
- اكتشاف جديد خارج نطاق الدفعة: /ar/evo و/ar/coaching و/ar/diet-plan بلا og:image أصلًا (نفس نمط البند 4 عربيًا) — مقترح دفعة 1-ب بقرار المالك

Stage Summary:
- دفعة ١ مكتملة ومتحققة حيًا 37/37 على الإنتاج؛ جدول §12.53 حُدّث (البنود 1/3/4/5/7/12 = مكتمل)
- Commit SHA: bbdac64
- Push status: pushed

---
Task ID: SEO-GEO-15-BATCH1-206-2026-09-15
Agent: Main (Z User)
Task: تنفيذ دفعة ١ من خطة تدقيق §12.53 (أمر المالك «تم تدوير وتعديل المفاتيح، ابدأ تنفيذ دفعة ١») — البنود 3/4/5/12 + البند 7 المرافق + إغلاق البند 1 توثيقيًا

Work Log:
- البند 3: getEVOApplicationSchema/getCoachingServiceSchema في seo.ts صارا locale-aware بمعامل إلزامي (نمط ORG_DESCRIPTIONS) — جداول EN/AR كاملة؛ الأسطح الأربعة حدّثت (/evo و/coaching بen والمرآتان بار)
- البند 4: og:image لأسطح القوائم EN — /exercises و/foods ببطاقتي العائلة؛ /programs·/coaching·/memberships·/evo·/diet-plan hub+24 خلية·/equipment/* ببطاقة og-home-en (مطابقة سلوك وراثة AR)؛ +og:url/og:locale على /memberships وog:locale على water-tracker وdiet-plan؛ twitter للequipment رُقّي لsummary_large_image
- البند 5: عنوان الرئيسية 94→47 حرفًا «Alkemos — The Smart Fitness & Nutrition Platform»
- البند 12: «Fitness & Nutrition Blog | Alkemos»
- البند 7: sitemap-lastmod — pages وcollections → 2026-09-15؛ STATE.md — تصحيح iad1→fra1 + مرحلة 206 + مسح بند مفتاح OpenRouter (المالك أكد التدوير — البند 1)
- الحراس بنفس الفريم: schema-rating-law.test.ts وُسّع بقوانين locale + og-image-coverage.test.ts بـ9 أسطح WIRED_SURFACES جديدة
- البوابات: tsc 0 (بعد .next/types) · eslint 0/0 · vitest 1199/1199 · build 0 · docs_audit/docs_parity/stale-refs/ui-wiring/migration_audit ✓

Stage Summary:
- دفعة ١ كاملة عبر البوابات التسع؛ صفر مساس بالوظائف/البيانات/الأسعار؛ كل الأصول المستخدمة موجودة أصلًا
- Commit SHA: 5713713
- Push status: pushed

---

Task ID: PHASE-205-FINAL-INTERNAL-COPY-AUDIT-2026-09-15
Agent: Super Z (main)
Task: Phase 205 — Final Internal Copy Audit «تدقيق عميق READ/WRITE على جميع الصفحات الداخلية AR/EN عدا المدونة» (owner order 2026-09-15)

Work Log:
**Scope:** deep READ/WRITE audit of every internal page AR/EN (visible copy + metadata + JSON-LD + FAQ/schema + shared content) excluding the blog; copy-only — zero functionality/API/DB/quotas/pricing changes.

### Audit (READ pass — scripts/phase205_audit.ts, 123 files scanned)
- **Truth-source verification (all clean):** TOOLS_COUNT=8; Unified Pool 2/4/8/8; prices $0/$14.99/$29.99/$39.99 (+yearly); EVO free 10 msgs/day; swaps 3/6; foods 8,830; exercises 868; affiliate = 20% commission (math verified) + $10 min payout; competitor prices in comparisons.ts = correct external facts; «كوتشينج بشري» = approved Phase-204 term (EN twin «Human coaching»); EN booking language fully retired.
- **Real findings:** 23 CJK machine-translation splices in exercises.ts instructionsAr; «الكارب» ×8 in hub-collections (incl. low-carb collection title/H1/metadata); «الجيم» ×3 + «الصالة» ×5 in hub depth guides; «التونا» ×21 + «سمك التلبية» ×5 typos; «الأكلات/أكلة/أي حاجة رياضية» in EVO widget + seo.ts + ar/foods metadata + breadcrumb JSON-LD; dialect on app surfaces (PlansView toast «هتحتاج تعمله تاني», «كوتش أونلاين» export tag, «كارب» export label, CheckoutView «موافقة الكوتش», CoachView «مفيش نتايج»); «الكارب/كارب» ×2 in ai-local visible plan strings + external-plan-text ×1; ar/foods title branding mismatch.
- **False positives (verified, no action):** exercises.ts «حاجة» ×8 = MSA "need" usage; «كوتش» substring inside «كوتشينج»; tools count "8"/EVO "10 msgs" correct values; affiliate $3/$6/$8 commissions correct; PlansView Latin-in-AR = code-in-template-literal artifacts.

### Fixes (WRITE pass — 14 source files)
1. exercises.ts — all 23 CJK fragments replaced with MSA derived from the parallel EN instructions (surgical replacements with expected-count assertions: scripts/phase205_fix_exercises.py).
2. hub-collections.ts — كارب→كربوهيدرات across the low-carb/keto collection copy + spelling fixes (كاربوهيدرات→كربوهيدرات ×2) + «الأكل»→«الطعام».
3. hub-depth-collections.ts — الجيم→النادي الرياضي ×3; «تُجوّع الجيم»→«تُجوّع تدريبك»; «كما يفعل أي أحد»→«كما يفعل أي شخص آخر»; «ما تزن الأدلة»→«ما تزنه الأدلة»; التونا→التونة ×21; «سمك التلبية»→«سمك البلطي» ×5; الصالة→النادي الرياضي.
4. hub-depth-equipment.ts — الصالة→النادي الرياضي ×4.
5. EvoFloatingWidget.tsx — «اسألني عن التمارين، الأكلات، التغذية، أو أي حاجة رياضية»→«…والأطعمة، والتغذية، أو أي موضوع يخص اللياقة».
6. seo.ts — site description «مكتبة أكلات»→«مكتبة أطعمة».
7. ar/foods/page.tsx — title «قاعدة بيانات الأكلات»→«قاعدة بيانات الأطعمة» (no «| Alkemos» — the /ar layout template appends «— Alkemos»; double-branding caught in live QA and fixed); description rewritten MSA with «8,830+ صنف غذائي».
8. ar/foods/[slug]/page.tsx — breadcrumb JSON-LD «الأكلات»→«الأطعمة».
9. PlansView.tsx — toast dialect→MSA; export brand-tag «كوتش أونلاين»→«مدرب أونلاين»; export macro label «كارب»→«كربوهيدرات»; «ليتمكن الكوتش»→«ليتمكن المدرب».
10. CoachView.tsx — «مفيش نتايج مطابقة»→«لا توجد نتائج مطابقة».
11. CheckoutView.tsx — «موافقة الكوتش»→«موافقة المدرب».
12. ai-local.ts — the two user-visible fallback-plan strings (meal note + macro line) كارب→كربوهيدرات. generateChatReply (dead code, zero importers) left untouched — documented.
13. external-plan-text.ts — macro line كارب→كربوهيدرات.

### Guards (only what prevents regression)
- **NEW** `src/lib/__tests__/no-cjk-contamination.test.ts` — walks every non-blog src file, extracts string literals, fails on any CJK char (sanctioned: the blog sanitizer module, blog routes, all test files). This is the guard for the exact contamination class found.
- marketing-msa-surface manifest +9 files: hub-collections, hub-depth-collections, hub-depth-equipment, hub-depth-muscles, hub-depth, ar/foods/page, ar/foods/[slug]/page, external-plan-text, seo. (exercises.ts stays OUT — its 8 legitimate MSA «حاجة» (need) hits exceed the weak<5 tolerance; covered by the CJK guard instead.)
- Phase-205 describe: every removed phrase pinned dead + every unified replacement pinned present (incl. the tilapia/tuna names, the no-double-branding title, and the CJK fragment bytes).

### Gates
tsc 0 · eslint 0/0 · vitest 1175/1175 (77 files) · build 0 (all routes) · live local QA EN/AR × desktop 1440 + mobile 390: ar/collections/low-carb-foods (title+H1 unified, zero old terms in HTML), ar/foods (title «قاعدة بيانات الأطعمة — Alkemos», H1 «مكتبة الأطعمة»), ar/foods/tilapia (breadcrumb JSON-LD «الأطعمة»), EVO widget (MSA subtitle), ar/exercises/clean + clean-and-jerk + lower-back-smr (fixed instructions live, ZERO-CJK), ar/equipment/cable («أداة الدقة في النادي الرياضي»), ar/collections/high-protein-foods (FAQ «أسطورة النادي الرياضي» + التونة), EN regression clean — zero horizontal overflow anywhere. Screenshots: /home/z/my-project/download/phase205-evidence/.

### Round 2 (live production verification caught the prefixed forms the word-boundary list missed)
The first production check of /ar/foods surfaced "ابحث عن أكلة… / ابحث في مكتبة الأكلات" (FoodsFilters) — the word-boundary banned list never matched «الأكلة/أكلة» because the ال- prefix shields them. A follow-up sweep found and fixed 14 more strings across 7 files:
- FoodsExplorer.tsx — the count labels «أكلة» ×2 → «صنف غذائي» (mirrors ExercisesExplorer's «تمرين» pattern)
- FoodsFilters.tsx — placeholder + aria-label → «ابحث عن صنف غذائي…» / «ابحث في مكتبة الأطعمة»
- PageBottomPromo.tsx — promo card name «مكتبة الأكلات»→«مكتبة الأطعمة», desc «8,830+ أكلة»→«8,830+ صنف غذائي», CTA «شوف خطط الاشتراك ›»→«استعرض خطط الاشتراك ›» (STRONG dialect killed)
- meal-planner/page.tsx — toast «أضف أكلة واحدة»→«أضف صنفًا غذائيًا واحدًا», intro «ابني … ٨٨٣٠+ أكلة وشوف الماكروز»→«ابنِ … 8,830+ صنف غذائي وتابع الماكروز» (dialect شوف + Arabic-Indic digit format unified), search placeholder
- ar/meal-planner/layout.tsx — meta + OG description «8,830+ أكلة»→«8,830+ صنف غذائي» ×2
- FoodDetailClient.tsx — «الأكلة غير موجودة»→«الصنف الغذائي غير موجود», «شارك الأكلة دي»→«شارك هذا الصنف الغذائي» (the weak «دي» killed)
- ar/foods/[slug]/page.tsx — notFound title «الأكلة غير موجودة»→«الصنف الغذائي غير موجود»
- CoachView.tsx — the client-invite hint «هيوصله دعوة على إيميله … يبقى عميلك وتشوف بياناته»→MSA («سيصله بريد إلكتروني بدعوة … يصبح عميلك وتستطيع الاطلاع على بياناته»)
- api/ai/chat/route.ts — the EVO local-reply generic fallback was FULL Egyptian («مقدرش ألاقي … دلوقتي … سؤال تاني محدد أكتر») → natural MSA with the unified counts («مكتبة الأطعمة (8,830+ صنف غذائي)»)

Guards round 2: marketing manifest +4 files (meal-planner page + AR layout + PageBottomPromo + the EVO chat route), Phase-205 canary extended with every round-2 removed phrase + replacements-present pins. Gates re-run: tsc 0 · eslint 0/0 · vitest 1183/1183 · build 0 · local live QA (AR foods/meal-planner/promo + EN regression + mobile 390 zero overflow).

### Round 3 (production sweep caught the library strip + breadcrumb + keywords)
The production sweep (scripts/phase205_prod_sweep.py — 52 URLs) found: (a) the OtherTools libraries-strip «مكتبة الأكلات» rendered on the tool/planner pages → «مكتبة الأطعمة»; (b) the VISIBLE food-detail breadcrumb «الأكلات» in FoodDetailClient (the JSON-LD one was already fixed) → «الأطعمة»; (c) AR for-coaches meta keywords carried «عمل كوتش اونلاين / إدارة عملاء الكوتش / كوتش جيم» → «عمل مدرب اونلاين / إدارة عملاء المدرب / مدرب نادي رياضي» (كوتشينج the service-name kept). The /ar/foods hits were proven STALE EDGE CACHE — with a cache-buster query the origin serves the round-2 copy clean (9× «صنف غذائي», zero أكلة). Guards: manifest +2 (OtherTools, ar/for-coaches layout) + round-3 canaries; tsc 0 · eslint 0/0 · vitest 1187/1187 · build 0.

Stage Summary:
### Final production verification (3f40731 on alkemos.com)
- build-info: commit=3f40731, branch=main
- **Origin sweep — 52 internal URLs AR/EN (cache-buster ?cb=205r3): ZERO banned terms + ZERO CJK.** Checked كارب/الكارب/الجيم/الصالة/أكلة-forms/التونا/التلبية/مفيش/هتحتاج/شوف/هيوصله/دلوقتي/مقدرش/الكوتش/كوتش/CJK on: about/affiliate/AI-planners/coaches/coaching/collections x3/compare/contact/diet-plan/equipment x3/evo/exercises + 4 detail pages/faq/foods + tilapia/for-coaches/meal-planner/memberships/muscles/privacy/programs/terms/tools + 5 tool pages (AR) + 14 EN mirrors.
- Unified copy live: «أطعمة قليلة الكربوهيدرات» title/H1 · «قاعدة بيانات الأطعمة — Alkemos» · exercise instructions with ZERO CJK · breadcrumb «الأطعمة» · «استعرض خطط الاشتراك» promo CTA · «صنف غذائي» counts/placeholders · for-coaches keywords «مدرب».
- Stale CDN note (Phase-204 precedent): 4 default-URL pages (ar/foods, ar/for-coaches, ar/tools/bmi-calculator, ar/tools/body-fat-calculator) serve cf-cache-status:HIT entries populated BEFORE the round-2/3 deploys (age 27-40 min, cache-control max-age=300). 7 of the 11 originally-stale pages refreshed during verification; the remaining 4 aged out within the ~1h CF edge TTL during monitoring. **FINAL CERTIFICATION SWEEP (default URLs, no cache-buster, 52 pages): ALL CLEAN — zero banned terms/CJK on the production internal surface.**

### Out-of-scope findings (documented, not expanded)
- «كارب» macro chip on the homepage (LandingView.tsx:1080) — homepage is a Phase-203-closed surface.
- generateChatReply in ai-local.ts — dead code written in full Egyptian dialect (zero importers); needs a separate delete-or-rewrite decision.
- MT quality of the 868-exercise instruction corpus (typos like «اسحل/تقمص/قلي») — needs a dedicated re-translation pass, not a copy patch.

---
Task ID: PHASE-204-INTERNAL-PAGES-MSA-2026-09-15
Agent: Super Z (main)
Task: تنظيف وتوحيد النصوص في الصفحات الداخلية فقط (أمر المالك 2026-09-15): Programs/Tools/EVO/FAQ/About/Coaching/Memberships + الأسطح التسويقية المشابهة — عامية→فصحى، توحيد مصطلحات/أرقام مع النظام، تصحيح نصوص قديمة متناقضة (حجز جلسة) — صفر مساس بالأسعار/الحدود/business logic/API/DB/التصميم/الرئيسية/المدونة

Work Log:
- (audit قبل التنفيذ — سكربت scripts/phase204_audit.py بمعجم blog-msa الحرفي) 84 ملفًا بالنطاق مُسحت: عامية قوية في workout-programs (عايز×2/اللي×3/بس/البيت/تمرينة/الكور/تعلية/بالوزن الجسم) + ProgramDetailClient (عايز خطة مخصصة ليك/بتعمل) + affiliate-content (إيه/مفيش/مش×3/ده×6/ليه + «equipment» لاتينية سائبة داخل عربية) + AffiliateToolkit (بتاعك/الرابط ده/متشاركوش/اللي هتشوفها) + for-coaches (للكوتشات/شغلك/فلوسك) + StaticPageView (هل فيه كوتش بشري/شات بوت/أكلات) + ContactView (سجل دخول) + ar/for-coaches (فلوسك بميتاداتها) — نص متناقض: «يمكنك حجزه عبر صفحة الكوتشينج» بـfaq-content (EN+AR) + «Book private coaching/احجز متابعة» بوصفي meta الاحتياطيين لصفحتي المدربين + «يراجعه الكوتش» (مرآة العضويات) ضد «الفريق» بfaq-content — مصطلحات غير موحدة: كارب/كاربوس×~45 · اعرف هل×4 · كوتش بدل المدرب×5 · من هو EVO ضد ما هو EVO · بريميوم في About بلا رقم (خطط شهرية/monthly plans)
- (البرامج — workout-programs.ts) الأوصاف الثمانية أُعيدت صياغتها فصحى بتوازن EN (اللي→الذين/عايز→يريد/بس→فقط/البيت→المنزل/تمرينة→جلسة/الكور→عضلات الجذع/تعلية→رفع تدريجيًا/بالوزن الجسم→بوزن الجسم) · LOCATION_LABELS.gym «الجيم»→«النادي الرياضي» · أسماء برامج الجيم الثلاثة (برنامج النادي للمبتدئين/Push Pull Legs — نادي رياضي متوسط/قوة 5×5 — نادي رياضي متقدم) · alt الصور · فواصل HIIT «ثانية شغل/راحة»→«ثانية جهد/راحة» ×17 · صفحة /programs وصفها «منزل، جيم»→«في المنزل أو النادي الرياضي» ومرآة /ar/programs بميتاداتها
- (تفاصيل البرنامج — ProgramDetailClient.tsx) «عايز خطة مخصصة ليك؟»→«تريد خطة مخصصة لك؟» + «منصة Alkemos بتعمل خطط»→«تنشئ منصة Alkemos خططًا مخصصة» (نفس نمط ExercisesDetail المعتمد)
- (الأفلييت — affiliate-content.ts) القوالب العربية الخمسة للمشاركة أُعيدت كتابتها فصحى كاملة بنفس حقائق وبنية قوالب EN (الإفصاح/لا وعود بأرقام/موضع الرابط/الإيموجي كتصميم مشاركة) — «affiliate link» اللاتينية داخل عربية استُبدلت بـ«رابط أفلييت» (مصطلح AffiliateProgramView المعتمد) · «equipment اللي عندك»→«المعدات المتاحة لديك»
- (أدوات الأفلييت — AffiliateToolkit.tsx) نصوص AR UI كلها فصحى (رابط الأفلييت الخاص بك/استخدم هذا الرابط/تُسجّل في حسابك/مرتبط بحسابك وحده/التي سيراها زوار موقعك)
- (for-coaches) «للكوتشات وأخصائيي التغذية»→«للمدربين وأخصائيي التغذية» · «أسئلة الكوتشات»→«أسئلة المدربين» · «ابدأ شغلك في 4 خطوات»→«ابدأ عملك في 4 خطوات» · alt الصورتين «في الجيم»→«في النادي الرياضي» · ميتاداتا AR (صفحة+تسجيل): فلوسك→أموالك ×4 (title/OG/Twitter/وصف التسجيل + نص المشاركة بالصفحة) · كلمة مفتاحية «شغل كوتش»→«عمل كوتش» و«انشاء حساب كوتش»→«إنشاء حساب مدرب» (بقية الكلمات المفتاحية المصرية بُقيت عمدًا — استهداف بحثي موثق بالملف)
- (StaticPageView — About/FAQ/Terks) About: «أكلات (٨٬٨٣٠+)»→«الأطعمة (8,830+)» (توحيد الأرقام الغربية مع بقية الصفحة) · «شات بوت»→«روبوت محادثة» · بريميوم «خطط شهرية»→«4 توليدات خطط شهريًا» (EN: 4 monthly plan generations — الرقم الحقيقي من memberships.ts) · FAQ: «هل فيه كوتش بشري؟»→«هل يوجد مدرب بشري؟» + «كوتش ذكاء اصطناعي»→«مدرب ذكاء اصطناعي» + «من هو EVO؟»→«ما هو EVO؟» (EN: Who→What) + «كم يستغرق رؤية نتائج؟»→«متى سأرى النتائج؟» (توازن مع EN وfaq-content) · Terms: «وصول لخطط»→«وصولًا إلى خطط» + «مراجعة من الكوتش»→«من المدرب» + «يقوم الكوتش بمراجعته»→«الفريق» (مطابقة faq-content)
- (faq-content.ts — JSON-LD لـ/faq) «يمكنك حجزه عبر صفحة الكوتشينج»→«اشتراك كوتشينج بشري منفصل يمكنك الانضمام إليه» (EN: you can book→subscription you can join — مطابقة للنسخة المرئية المصلحة سابقًا) · EN «Who is EVO?»→«What is EVO؟» (توحيد مع AR)
- (coaching/page.tsx) FAQ: «من هو EVO؟»→«ما هو EVO؟» · «طرق الدفع؟»→«ما هي طرق الدفع؟» · «بياناتي آمنة؟»→«هل بياناتي آمنة؟» وجوابها «مشفرة على Supabase مع RLS»→صياغة قاعدة-البيانات المعتمدة من 203 (بلا وعود تتجاوز التنفيذ)
- (memberships/page.tsx) رقاقة «كوتش بشري»→«مدرب بشري» · FAQ: «طرق الدفع؟»→«ما هي طرق الدفع؟» + «يراجعه الكوتش»→«يراجعه الفريق» (مطابقة التطبيق: مراجعة الإيصالات عبر الفريق/الأدمن) + جواب Pro/كوتشينج أُعيدت صياغته («Pro يمنحك مزايا المنصة، والكوتشينج يمنحك مدربًا بشريًا يتابعك شخصيًا»)
- (توحيد كارب→كربوهيدرات — المصطلح المعتمد بالرئيسية 203) tools-shared.ts (وصف الماكروز) + أداة الماكروز (نمط «قليل الكربوهيدرات»/الوصف/ملصق النتيجة/نصا المشاركة) + ميتاداتا AR للماكروز والسعرات + حاسبة السعرات (ملصق+مشاركة) + مخطط الوجبات ×3 + مكتبة الخطط AR (كاربوس→كربوهيدرات) + FoodDetailClient ×3 + وصف meta لصفحة الطعام AR + foods-shared (فئة+وسم) + FoodsFilters + مرجع الماكروز (content/macro-calculator.ts كاملًا) — مع «اعرف هل»→«اعرف إن كان» بصفحة BMI وميتاداتا AR وtools-shared
- (EVO) عنوان المشاركة «كوتش ذكاء اصطناعي»→«مدرب ذكاء اصطناعي» + عمود جدول المقارنة «شات بوت عادي»→«روبوت محادثة عادي» + وصف SoftwareApplication JSON-LD بseo.ts («ليس مجرد شات بوت»→«ليس مجرد روبوت محادثة») — كل حدود AI/الرصيد الموحد بجدول EVO تحققت حرفيًا مقابل memberships.ts (توليدان/10 رسائل/4-8/3-6) — لا انجراف
- (صفحات المدربين) وصف meta الاحتياطي EN «Book private coaching with…»→«Coaching subscriptions with…» وAR «احجز متابعة خاصة مع…»→«اشترك في متابعة خاصة مع…» (الخدمة اشتراك شهري لا جلسة تُحجز — نفس قانون ai-job-processors) · comparisons.ts «والجيم،»→«والنادي الرياضي،» · ai-local.ts ملصق «الجيم»→«النادي الرياضي» (توحيد مصطلح فقط)
- (الحرس — marketing-msa-surface.test.ts) manifest اتسع بـ9 أسطح (workout-programs/ProgramDetailClient/AffiliateToolkit/StaticPageView/faq-content/tools-shared/foods-shared/FoodsFilters — affiliate-content استُثني من المسح الآلي موثقًا: regexes الاقتباس بescapeHtml تفكك tokenizer الساذج، وبقي محروسًا بأقفال العبارات) + describe «Phase 204» يثبّت كل عبارة نُزعت ميتة (بتدور/الرابط ده/مفيش/حابب/بتاعك/متشاركوش/هل فيه كوتش/شات بوت/وأكلات (/من هو EVO/حجزه/you can book/كوتش بشري/يراجعه الكوتش/مشفرة على Supabase/Book private coaching/احجز متابعة/للكوتشات/ابدأ شغلك/فلوسك/شغل كوتش/وصول لخطط/كم يستغرق رؤية نتائج/الجيم/عايز/الكور/تعلية…) ويُلزم البدائل الموحدة حاضرة (النادي الرياضي/اشتراك كوتشينج بشري منفصل يمكنك الانضمام إليه/coaching subscription you can join/هل يوجد مدرب بشري؟/ما هو EVO؟/والأطعمة (8,830+)/4 توليدات خطط شهريًا/اشترك في متابعة خاصة) — tool-msa-surface.test.ts: tools-shared أُضيف للـmanifest + canary كارب/اعرف-هل بـ14 ملفًا
- (اكتشاف إيجابي) القوالب العربية للمشاركة كانت بلهجة مصرية كاملة تُنشر نيابة عن المسوّقين — الآن كل ما ينسخه الأفلييت فصحى بنفس الحقائق
- **البوابات:** tsc 0 (صفر أخطاء) · eslint 0/0 · vitest **1155/1155** (+21 حارس 204) · build 0 (2056/2056) · docs_audit (phase=204) ✓ · docs_parity ✓ · stale-refs ✓ · ui-wiring ✓
- **التحقق المحلي (next start + agent-browser):** 32 مسارًا EN/AR للصفحات المتأثرة = 200 (و/ar/affiliate=404 مُوثق مسبقًا — لا مرآة عربية بالتصميم) · صفر overflow أفقي ×36 سياقًا (ديسكتوب 1440 + جوال 390 RTL) · رقاقة «النادي الرياضي» تُرسم بالفلاتر والكروت واسم برنامج 5×5 الجديد + CTA «تريد خطة مخصصة لك؟» + فواصل «ثانية جهد» ×34 · نقر أكورديون الكوتشينج «هل بياناتي آمنة؟» يفتح جواب قاعدة-البيانات · زر «ابدأ الآن» (زائر) → ‎/auth?mode=signup&next=/checkout?tier=coaching‎ · بطاقة كوتشينج العضويات «ابدأ الآن ›»→‎/ar/coaching‎ · روابط مركز الأدوات AR العشرة سليمة · كارب/اعرف هل/فلوسك/شات بوت/حجز = صفر مواضع حية SSR
- (خارج النطاق عمدًا) LandingView «كارب» (الرئيسية محرّمة هذه المرحلة) · بقايا كارب بأسطح AI الوظيفية (ai-local/plan-generator/evo-system-prompt — تغيير برومبتات AI يحتاج أمر مالك مستقل) · كلمات مفتاحية البحث المصرية (استهداف بحثي موثق) · عناوين مجموعات المكتبة بhub-collections (أسطح SEO للمدونة)
- (جولة 2 — كشفها التحقق الحي) فحص الإنتاج لـf879677 كشف 8 مواضع «كارب» متبقية بـJSON-LD لصفحة الماكروز (tool-schema.ts: وصف SoftwareApplication + خطوات HowTo) + وحدتَي مرجع السعرات ومخطط الوجبات (content/*.ts) — كلها وُحدت على «كربوهيدرات» والحرس KARB_FILES اتسع ليغطيها (كوميت c5a8ebf)

Stage Summary:
- الصفحات الداخلية العامة (غير الرئيسية/المدونة) كلها فصحى طبيعية لكل العرب الآن: البرامج والأفلييت وfor-coaches والأسئلة الشائعة والصفحات الثابتة — بنفس مصطلحات النظام (كربوهيدرات/المدرب/ما هو EVO/النادي الرياضي/اعرف إن كان)
- أُغلق آخر موضعَي «حجز جلسة» على أسطح ثابتة (JSON-LD لـ/faq + وصفا meta لصفحتي المدربين) — الكوتشينج يُباع اشتراكًا تنضم إليه في كل مكان
- مراجعة الإيصالات توحدت على «الفريق» (المطبق فعلًا) وجواب أمان بيانات الكوتشينج توحد مع صياغة 203 المعتمدة · بريميوم في About صار بالرقم الحقيقي (4 توليدات)
- 21 حارس 204 جديد: كل ما نُزع ميثبت ميتًا والبدائل الموحدة إلزامية
- Commit SHA: f879677 (المرحلة) + c5a8ebf (جولة 2 — إتمام مسح كارب الذي كشفه التحقق الحي)
- Push status: pushed (origin/main) — SYNCED
- **التحقق الحي على الإنتاج (c5a8ebf — build-info مطابق):** المسارات الـ32 المتأثرة = 200 · ‎/ar/programs‎: النادي الرياضي ×9 والجيم/عايز = صفر · ‎/ar/faq‎+‎/faq‎: ما هو EVO؟/هل يوجد مدرب بشري؟/الانضمام إليه (EN: What is EVO?/subscription you can join) وحجزه/you can book = صفر · ‎/ar/about‎: 4 توليدات + الأطعمة (8,830+) · ‎/ar/memberships‎: مدرب بشري + يراجعه الفريق · ‎/ar/evo‎: روبوت محادثة عادي + JSON-LD الجديد · ‎/ar/for-coaches‎: أموالك ×9 وفلوسك = صفر · تفاصيل البرنامج بالاسم/CTA/فواصل الجهد الجديدة · كارب = 0 بكل صفحات الأدوات AR (تحقق بمفتاح طلب جديد لوجود كاش CDN منتهٍ على بعض الصفحات — يتساقط تلقائيًا أو بنقاء CF يدوي)

---
Task ID: PHASE-203-COPY-REFINEMENT-2026-09-15
Agent: Super Z (main)
Task: جولة Copy Refinement على أسطح المرحلة 202 (Homepage + Header + Footer) — نصوص وmicro-copy وإعادة تموضع روابط فقط بموافقة المالك النهائية 2026-09-15: صفر مساس بالأسعار/الكوتة/business logic/API/DB/وظائف AI

Work Log:
- (تحقق الحقائق قبل التنفيذ) البوول الموحد مُطابَق من memberships.ts + tier-limits.ts (زائر = توليدان ناجحان شهريًا، نجاح-فقط، تغذية+تمارين معًا) · ثبات خطة الزائر على الجهاز من plan-persistence.ts + صياغة صفحتي المولدين · مسار التسجيل الحقيقي /auth?mode=signup من use-nav.ts (bilingual BY DESIGN — لا مرآة /ar) · حقل بيانات FAQ الأمنية بمطابقة نطاق وصول RLS (المالك المعيّن + فريق مصرّح له للدعم/التشغيل — سابقة faq-content)
- (Hero — LandingView.tsx) الزوج CTA صار حسابيًا: الزوار زر أساسي «Create your free account / أنشئ حسابك المجاني» → ‎/auth?mode=signup‎ + رابط هادئ «Log in / تسجيل الدخول»؛ المسجَّلون (isLoggedIn = !!profile) يرون «Go to your dashboard / انتقل إلى لوحة التحكم» بوجهة قانون أيقونة الحساب (admin→‎/admin‎ · coach→‎/coach‎ · member→‎/dashboard‎)؛ مسارات الاستخدام بقيت ملك chip التنقل السريع ‎#tools‎ وبطاقة الأدوات (لا رسالة مكررة)؛ الوصف تحت H1 صار ملموسًا («أدوات مجانية، ومكتبات حقيقية للتمارين والأطعمة، وEVO مدربك الذكي — ابدأ فورًا، وأنشئ حسابًا مجانيًا لتحفظ خططك») — H1 والـquick-nav والأرقام الديناميكية (EX_PLUS/FOODS_PLUS/TOOLS_PLUS) لم تُمس
- (قسم التمارين — LandingView.tsx) «Browse by muscle group / تصفّح حسب المجموعة العضلية» + رقاقات السبع مجموعات (chest/back/shoulders/legs/biceps/triceps/core بأعداد EXERCISE_CATEGORY_COUNTS الحية) + CTA واضح ‎btn-outline‎ «All Exercises / كل التمارين» → ‎/exercises‎ انتقلت جميعها فوق شبكة العينات؛ الرابط السفلي الهادئ المكرر («كل التمارين ›/Browse all exercises ›») نُزل؛ عنوان القسم حُذفت لاحقته («تصفّحها يبدأ من هنا/Start Browsing») بتوازن EN/AR؛ البيانات وجلب getHomeSamples لم يُلمس
- (FAQ الرئيسية — LandingView.tsx) خمسة أسئلة استخدام حقيقية: (1) هل أحتاج حسابًا أو اشتراكًا؟ (2) هل يمكنني تجربة توليد الخطط مجانًا؟ (3) هل تختفي خطتي إذا لم أنشئ حسابًا؟ (4) ما هو EVO؟ (5) هل بياناتي آمنة؟ — كل حد مطابق للتنفيذ حرفيًا؛ سؤال «هل تدعم المنصة اللغة العربية؟» (غير منطقي لقارئ العربية) وسؤال عدّ المكتبات نُزلا (الأختام الحية وأقسام المحتوى تجيبه)؛ الـFAQPage JSON-LD مشتق من نفس المصفوفة (قانون 117 سليم)
- (صفحة /faq المستقلة) faq-content.ts (JSON-LD): سؤال اللغة استُبدل بـ«What does a free account give me? / ماذا يمنحني الحساب المجاني؟» وإجابة أمان البيانات أعيدت صياغتها بلغة بسيطة (بلا وعود تتجاوز التنفيذ)؛ StaticPageView.tsx (المحتوى المرئي): نفس الزوجين حرفيًا وبقية الصفحة دون مساس؛ وصف الميتا الإنجليزي حُدّث (إسقاط «Arabic support» المرجع لسؤال نُزل)
- (إصلاح رابط مكسور) صفحتا ‎ai-meal-planner/page.tsx‎ و‎ai-workout-planner/page.tsx‎: نَدج التسجيل للزوار كان يشير لـ‎/ar/auth?mode=signup‎ — مسار غير موجود (404 مؤكد حيًا) — وصار يشير للمسار الحقيقي ‎/auth?mode=signup‎ بالنسختين (المرايا العربية re-export نفس الصفحة ثنائية اللغة)
- (ميكرو-فصحى) كارب→كربوهيدرات (وصف حاسبة الماكروز + وصف قسم الأطعمة «وكاربه»→«وكربوهيدراته») · «اعرف هل»→«اعرف إن كان» (بطاقة BMI) · «كن مدرباً»→«للمدربين» (درج الهيدر + عمود الفوتر) · NewsletterForm: «حصل خطأ»→«حدث خطأ» + تنوين (مجانًا/تمامًا/أولًا بأول)
- (الحرس) homepage-adoption.test.ts: اختبار (4) أعيد تثبيته لعقد الهيرو الحسابي (إلزام signup/login + منع رجوع «Try the Free Tools/جرّب الأدوات المجانية») + describe «Phase 203» جديد (أسئلة FAQ الخمسة + منع رجوع السؤالين المنسحبين + ترتيب التصفح فوق العينات + منع الرابط السفلي المكرر)؛ tool-msa-surface.test.ts: pin أمان البيانات أعيد تثبيته للصياغة الجديدة
- **البوابات:** tsc 0 (الأربعة الموثقة فقط — بلا أخطاء جديدة) · eslint 0/0 · vitest **1134/1134** · build 0 (2056/2056) · docs_audit (phase=203) ✓ · docs_parity ✓ · stale-refs ✓ · ui-wiring ✓
- **التحقق المحلي (next start + agent-browser):** EN/AR × ديسكتوب 1440/جوال 390 (RTL): زر التسجيل → ‎/auth?mode=signup‎ يفتح «Create your account» ورابط الدخول → ‎/auth?mode=login‎ · CTA كل التمارين → ‎/exercises‎ (200) ورقاقة صدر → ‎/exercises?cat=chest‎ (200) · أسئلة FAQ الخمسة مرئية ومطابقة JSON-LD بالاتجاهين · إجابة أمان البيانات بالصياغة الجديدة · /faq المستقلة EN/AR بالسؤالين الجديدين وبقية الأسئلة سليمة · الدرج العربي «للمدربين» · فحص المسارات: ‎/ar/auth?mode=signup‎ = 404 (تأكيد الخلع القديم) والـ14 مسارًا المتأثر = 200 · صفر overflow أفقي 390px/1440px

Stage Summary:
- أسطح المرحلة 202 صارت بصياغة إنسانية فصحى طبيعية بلا ادعاءات: هيرو يقود لإنشاء الحساب (بلا تكرار رسالة الاستخدام أسفل الصفحة)، ومكتبة التمارين تُتصفّح قبل العينات، وFAQ يجيب أسئلة الاستخدام الحقيقية الخمسة بحدود مطابقة للكود حرفيًا، وصفحة /faq المستقلة متوافقة
- خطأ الرابط المزدوج (‎/ar/auth?mode=signup‎ 404 في صفحتي المولدين) أُصلح — آخر موضع معروف لمسار غير موجود في قمع التسجيل
- **التحقق الحي على الإنتاج (6d90578 — build-info مطابق):** الصفحات الثمانية المتأثرة = 200 و‎/ar/auth?mode=signup‎ = 404 (المسار المكسور القديم) · فحص SSR مباشر بالنسختين: زرا الهيرو ‎/auth?mode=signup‎+‎login‎ حاضران · «Browse by muscle group/تصفّح حسب المجموعة العضلية» فوق العينات · أسئلة FAQ الجديدة مرئية · /faq المستقلة بالسؤالين الجديدين وإجابة الأمان الجديدة (EN/AR) · النصوص المنسحبة ميتة حيًا (Try the Free Tools/جرّب الأدوات المجانية/كن مدرباً = صفر تكرارات، للمديرين حاضرة)
- Commit SHA: 6d90578 (origin/main — دُفع 2026-09-15 + التحقق الحي أعلاه)
- Push status: pushed (origin/main) — SYNCED

---
Task ID: PHASE-202-HOMEPAGE-ADOPTION-2026-09-15
Agent: Super Z (main)
Task: إعادة تصميم الـHomepage لتصبح Homepage حقيقية لموقع Fitness Platform هدفه الانتشار والاستخدام (أمر المالك 2026-09-15) — نقاط دخول محتوى حقيقية، صفر أسعار، Header خدمي، Footer منظومي

Work Log:
- (بنية البيانات) `src/lib/home-samples.ts` جديد: اختيار Server-side منعزل لـ8 تمارين حقيقية (بنش/عقلة/سكوات/كتف/روماني/كيرل/ترايسبس/بلانك) + 8 أطعمة حقيقية (دجاج/سلمون/أرز/شوفان/بطاطا/أفوكادو/موز/زبادي) + 3 برامج حقيقية من WORKOUT_PROGRAMS — أشكال serializable بلا أي استيراد مكتبات عملاقة للعميل (قانون الـbundle سليم) + slug-lists مُصدَّرة لحرس الانجراف
- (بنية المسار) `(home)/page.tsx` و`ar/page.tsx` صارا Server Components يمرران العينات كـprops؛ تأثير toast الأوثنتيكيكي انتقل حرفيًا إلى جزيرة `src/components/AuthErrorToast.tsx`
- (LandingView) الهيكل الجديد: Hero استخدامي (CTA أساسي → ‎#tools‎ «جرّب الأدوات المجانية/Try the Free Tools» + رابط هادئ → ‎/exercises‎) → Tools & AI (كارت AI القائد محفوظ بعقد 185/194 + شبكة 4 أدوات) → قسم Training (8 كروت تمارين حقيقية بصور ومستويات ومعدات + chips مجموعات عضلية بأعداد حية + 3 كروت برامج حقيقية بصور ومدد وأنساب) → قسم Nutrition (8 كروت أطعمة بسعرات وماكروز حقيقية لكل 100جم) → قسم Articles (الكاروسيل قسمه الخاص — بلا tabs) → كوتشينج مختصر (بلا أسعار، CTA «استكشف الكوتشينج») → شريط المدربين المموَّل (كما هو) → FAQ (أسئلة الاستخدام الأربعة) → الفوتر
- (الإخراجات المأمورة) قسم Memberships (الكروت الثلاثة المسعّرة) + جدول المقارنة + CTA الختام البيعي + كارت EVO الدعائي نُزلت من الرئيسية (ودجت EVO العائم نقطة الوصول) + سؤالا الأسعار والدفع من FAQ — صفحة /memberships والأسعار والكوتات وكل business logic دون أي مساس
- (SiteHeader) تنقل ديسكتوب مرئي للخدمات الخمس (Training/Nutrition/Tools/AI/Coaching) بقوائم تفتح hover (group-hover) + focus-within (لوحة مفاتيح) + click-toggle (شاشات لمس كبيرة hover:none) مع إغلاق خارج-النقر + aria-expanded؛ الدرج أعيد ترتيبه خدمة-أولاً (Training → Nutrition → Tools → AI → Coaching) والثانويات (Memberships/Affiliate/For-Coaches) في مجموعة «More» هادئة؛ قانون ROLE SURFACE محفوظ (الكوتشينج/العضويات/EVO مخفية عن الطاقم)؛ رابط EVO ب مساره الحرفي ‎/evo
- (SiteFooter) الأعمدة أعيد تنظيمها كخريطة خدمات المنظومة (Training/Nutrition/Tools & AI/Coaching & Services/Company) — كل رابط قديم محفوظ بمساره ووعي-لغته (قوانين نقاط الوصول كاملة) + الـtagline الجديد: «Built with care for the fitness community» / «صُنع بحب لمجتمع اللياقة»
- (CSS) كتلة ‎.evo-hero-card/.evo-hero-art‎ الميتة حُذفت من globals.css (38 سطرًا — قانون حذف الميت بنفس الفريم)
- (الحرس) `src/lib/__tests__/homepage-adoption.test.ts` جديد (10 اختبارات): منع أي أسعار/CTA مبيعي/جدول مقارنة على الرئيسية + منع كارت EVO الدعائي + إلزام أقسام ونقاط دخول المحتوى + Hero استخدامي + عقد الهيدر/الفوتر الجديد + drift-guard للعينات المختارة ضد المصفوفات الحية؛ عقد Phase 197 في marketing-msa-surface حُدّث (جدول الرئيسية السريع نزل — قانون الخلايا الصادقة «بعضها/Some» يخص جداول /compare حصرًا الآن)
- **البوابات:** tsc 0 · eslint 0/0 · vitest 1132/1132 · build 0 (2056/2056) · docs_audit (phase=202) ✓ · docs_parity ✓ · stale-refs ✓ · ui-wiring ✓
- **التحقق المحلي (next start + agent-browser):** DOM ×6 سياقات (EN/AR × 1440/390 + داكن + RTL): الخدمات الخمس ظاهرة · قائمة Training تفتح click (vis:visible/op:1/aria-expanded) وتغلق خارج-النقر وعند blur · التنقل عبر menuitem يعمل → ‎/programs‎ · 8+8+3 عينات بأسماء وصور وروابط محلية (11/11 صورة تمرين + 3/3 صورة برنامج بعد التمرير الحمل الكسول) · درج الجوال بالترتيب الخدمي · 50 رابط نقطة دخول = 200 جميعًا · صفر overflow أفقي 390px/1440px · الفوتر بالأعمدة الخمسة والـtagline الجديد + VLM (EN hero · AR desktop · AR mobile) — لقطات download/phase202/

Stage Summary:
- الرئيسية صارت Product-Website: كل خدمة عائلة محتوى بنقطة دخول حقيقية قابلة للتصفح (Discover + Use + Explore) — صفر أسعار وصفر لغة مبيعات على الصفحة؛ صفحة العضويات وكل الأسعار/الكوتات/الـAPIs/الـDB دون مساس
- منصة العينات: نمط Server-selects → client-renders قابل لإعادة الاستخدام لأي صفحة تريد محتوى حقيقيًا دون كسر قانون الـbundle
- Commit SHA: be161f61f29f3acd254dbd0246baf3bb82e449d6 (be161f6)
- Push status: pushed (origin/main) — SYNCED؛ التحقق الحي على الإنتاج (be161f6) أخضر كامل: EN/AR × Desktop/Mobile + المقالات ببيانات Supabase الحية (10 كروت) + EVO ودجت + الفوتر الجديد + صفر overflow — الكاش الحافي لـCF ينتهي خلال دقائق (التحقق تم عبر cache-bust وبنفس القيم بعد انتهاء العمر)

---
Task ID: PHASE-198-UI-ROUNDC2-PAGES-2026-09-14
Agent: Super Z (main)
Task: جولة تدقيق بقية الصفحات (§4 من الخطة) — مسح آلي شامل + قرار + تحصين ThemeImg

Work Log:
- مسح Playwright آلي (scripts/audit-pages-round2.js): 14 مسارًا عامًا × 3 سياقات + 6 مرايا AR — overflow · H1 · حاويات · alt · chrome-text · أزرار · H2 · أزرق
- النتائج: صفر overflow ×48 فحصًا · H1 واحد/مسار · صفر أزرق · بلا Critical/High جديدة — الملاحظ الوحيد (alt) انكشف كإنذار كاذب: كلها أزواج زخرفية alt=""‎ صحيحة وبانرات
- تحصين موقعي: ThemeImg يضيف aria-hidden تلقائيًا عندما alt=""‎ (يهدّئ المدققين الآليين دون مساس بالصور المحتوى)
- ملحق أ وثّق بالخطة + قرار: لا دفعة إصلاح مستقلة للصفحات الثانوية الآن؛ السكربت قابل لإعادة التشغيل بعد أي جولة تصميم مستقبلية
- بوابات: docs_audit(198) ✓ · tsc 0 · build 0

Stage Summary:
- جولة الصفحات مكتملة التوثيق بلا دفعة — الرئيسية كانت الم_surface الوحيد ذا الدفعات الثلاث
- أمر المالك (جولة الواجهة الكاملة) مُنفّذ: تدقيق → خطة → مراجعة تعارض → 3 دفعات → اختبار 5-6 سياقات/دفعة → push → تحقق إنتاجي حي لكل دفعة

---
Task ID: PHASE-198-UI-AUDIT-BATCH3-POLISH-2026-09-14
Agent: Super Z (main)
Task: الدفعة 3 (Polish) الختامية من خطة docs/UI-IMPLEMENTATION-PLAN.md للصفحة الرئيسية — UI-only

Work Log:
- (H4/M-جوال) chips التنقل: صف أفقي واحد snap-scroll بالجوال (‎~60px‎ بدل ‎~570px‎/4 صفوف) + التفاف ممركز md+ — ‎.scrollbar-none‎ جديدة بـglobals.css، الاتجاه RTL سليم تلقائيًا (overflow-x + snap يتبعان dir)
- (تابلت) شبكة العضلات ‏grid-cols-2 md:grid-cols-3 lg:grid-cols-4 (كانت md:grid-cols-4 بكروت ‎~172px‎)
- (M2/M3) سلم H2 موحد ‏md:text-4xl على 9 أقسام (36px — داخل سلم §3 الموثق؛ كان ‏md:text-5xl‎/48px)
- (M1) أزرار الكروت الثلاثة (Free/Premium/Pro) موحدة ‏py-3.5/text-base + CTA الختامية ‏px-9/py-4→px-8/py-3.5 — المقياس الفعلي بعد التوحيد {42, 54} + Hero المصغر (قياس DOM)
- (M2) H3 الكروت موحد ‏text-lg (عضلات · أطعمة · كروت المدونة)؛ (M4) سطر «جميع المستويات / All levels» بكروت العضلات (كانت سطرين عاريين)
- (M7) placeholder النشرة يقصّر («بريدك الإلكتروني / Your email address») — كان يُقتطع بصف sm؛ الأخطاء التحققية تحمل الإرشاد الكامل
- (H7) قصّ أول كارت AR: قياس حي على الإنتاج بعد الدفعة 2 — الكارت الأول كامل الظهور (flush) وscrollLeft=-640 بعد نقرتَي «التالي» بمحاذاة حدود كاملة — مغلق كمحلول بدمج H2 (الخريطة الاتجاهية للأزرار كانت سليمة)
- **البوابات:** tsc 0 · eslint 0 · vitest 1122/1122 · build 0
- **التحقق المحلي (6 سياقات شملت ar-mobile):** صفر overflow ×6 · chips صف واحد (لقطة AR-جوال) · تابلت 3 أعمدة (لقطة) · H2=36px ديسكتوب · placeholder باللغتين — لقطات download/phase198-batch3/

Stage Summary:
- الدفعات الثلاث (198) مكتملة — الرئيسية جاهزة: CTA في أول شاشة · حاوية واحدة · تباين AAA · كروت باقات ثلاثية · مدونة قسم واحد · EVO منحف · صفر أزرق · chips جوال صف واحد
- البنود المغلقة كقرارات قائمة: H8 (خط عربي) · H9 (شريحة Memberships) · M5 (الميندر) · M6 (الكوكيز) · أسهم الكاروسيل 36px أصلاً
- التالي وفق الخطة §4: جولة تدقيق بقية الصفحات (tools/exercises/programs/foods/blog/memberships/coaching/for-coaches/affiliate/evo/static + القوالب المشتركة) بنفس المنهجية

---
Task ID: PHASE-198-UI-AUDIT-BATCH2-HIGH-2026-09-14
Agent: Super Z (main)
Task: الدفعة 2 (High) من خطة docs/UI-IMPLEMENTATION-PLAN.md — دمج المدونة · كارت Free وطي الجدول · تنحيف EVO · صفر أزرق — UI-only

Work Log:
- (H2) قسم المدونة صار قسمًا واحدًا بكاروسيل واحد: المميزة كروت داكنة أول الصف ثم الأحدث (حد 10) — BlogCarousel استلم featuredSlugs بدل variant؛ منطق selectHomeBlogCarousels واختباره لم يُمسا (عرض فقط)
- (H5) كارت EVO: min-h ‏280/340→220/260 + حشو القسم ‏py-16/24→py-12/16 — القسم ‎~534px→~390px‏ ديسكتوب؛ البطاقة المستقلة ووصفتها (127/128/131) محفوظتان — «الدمج بالكوتشينج» من التدقيق ظل مرفوضًا وفق سجل القرارات §0
- (H6) كارت Free ثالث حقيقي ($0 + «المنتج الكامل لا نسخة معطلة» + 4 مزايا بنفس عبارات الفقرة القديمة canary-safe + CTA btn-outline) — الشبكة ‏lg:grid-cols-3؛ الفقرة القديمة أُزيلت ومحتواها بالكارت (يبقى «قارن كل العضويات»)؛ جدول المقارنة انطوى خلف details/summary أصلي (المحتوى كامل بالـHTML — أمر SEO 117 محفوظ، chevron يدور group-open، مؤشر default مخفي .cmp-details)
- (M8) أختام الأفلييت: 3 كروت → شريط marble-card واحد inline بفواصل divide + أرقام chrome-text (النسخ حرفيًا)؛ (M10) pill For-Coaches الأزرق rgba(0,113,227) → ختم داكن شفاف بحافة #3A3F45 — صفر أزرق خارج --ai (فحص computed)؛ (M11) كروت المدربين المميزين bg-white+ظل hover أزرق → marble-card + hover translate النظامي
- **البوابات:** tsc 0 · eslint 0 · vitest 1122/1122 · build 0
- **التحقق البصري المحلي (5 سياقات):** صفر overflow ×5 · memberships بثلاث كروت متساوية (Free $0 outline / Premium / برو الداكن) + الجدول مطوي ويُفتح سليمًا · EVO ‏390px ديسكتوب/318 جوال · شريط أفلييت واحد · pill أحادي — لقطات download/phase198-batch2/ (خارج المستودع) · ملاحظة: قسم المدونة محليًا بلا بيانات (listBlogPosts يحتاج Supabase) — دمج الكاروسيل يتحقق حيًا على الإنتاج بعد النشر

Stage Summary:
- الدفعتان 1+2 منفذتان — أقسام الرئيسية انخفضت ارتفاعًا إجمالًا (مدونة ‎~-500px‏ · EVO ‎~-145px‏ · memberships ‎~-400px‏ ديسكتوب مع الجدول المطوي) وثلاثة كروت باقات متساوية بمعاينة شرائية كاملة Free→Premium→Pro
- الدفعة 3 التالية (Polish): chips الجوال صفًا واحدًا · Tablet 3 أعمدة · مقياس أزرار/H3 · RTL carousel · تمرير alt · input النشرة

---
Task ID: PHASE-198-UI-AUDIT-BATCH1-CRITICAL-2026-09-14
Agent: Super Z (main)
Task: أمر المالك «نفّذ تدقيق الواجهة المعتمد»: توثيق تدقيق الصفحة الرئيسية البصري داخل المشروع + خطة تنفيذ بثلاث دفعات + تنفيذ الدفعة 1 (Critical) باختبار السياقات الخمسة — UI-only بلا مساس بالمسارات/SEO/schema/الأسعار/الحدود/النصوص المعتمدة

Work Log:
- **توثيق (بأمر المالك — استثناء موثق لقانون لا-ملفات-توثيق-جديدة):** docs/UI-AUDIT-HOMEPAGE.md (النتائج C1-C5/H1-H9/M1-M11/Minor + نقاط القوة المحفوظة + بروتوكول إعادة الاختبار) · docs/UI-IMPLEMENTATION-PLAN.md (3 دفعات بمعايير قبول + ثوابت لا-تُمس + §0 سجل مراجعة التعارض مع قرارات المالك السابقة)
- **مراجعة التعارض (أمر المالك 3) — 10 فحوصات موثقة §0:** أبرزها: زرا Hero يلغي حالة Phase 127 «لا أزرار» بقرار مالك جديد معتمد (2026-09-14) · خط العرض العربي Cairo بقاءً لقرار §16 (بند التدقيق H8 أُغلق) · كارت EVO تنحيفًا لا دمجًا حفاظًا على وصفة §7.3 (127/128/131) · الجداول تُطوى Accordion (DOM كامل — لا ضرر SEO) · كارت «Your plan.» وعقود اختبارات المولّدين لا تُمس
- **تنفيذ الدفعة 1 (Critical):** (C1) زرا Hero داخل تركيبة Phase 131 («ابدأ مجانًا» btn-chrome → memberships · «استكشف الأدوات المجانية» outline شفاف 68% خلفية + blur → #tools) باللغتين — LandingView؛ (C2) حاوية موحدة max-w-6xl لـ12 قسم محتوى (evo/tools/exercises/programs/foods/coaching/featured-coaches/for-coaches/memberships/affiliate/quick-nav + blog كما هو) مع بقاء حدود القراءة الداخلية (2xl/3xl)؛ (C3) globals.css: سلّم chrome-text الفاتح → فولاذ داكن (أفتح نقطة #3F444A ≈ 9.8:1 على الأبيض — كان التدرج الخام ~2.1:1) + صنف جديد .chrome-text-on-dark (السلّم الفاتح مثبت للأسطح الداكنة بالثيمين: سعر برو الرئيسية · ‎$39.99 الكوتشينج · برو memberships شهري/سنوي شرطيًا) + خلفية أختام hero-seals ‏55%→85%؛ (C4) صنف .hero-copy (هالة text-shadow بالثيمين على H1 + الوصف — بلا veil احترامًا لقانون السطوع)؛ (C5) --navbar-bg ‏0.72→0.85 بالثيمين (نزيف العمل الفني خلف الشريط أُعيد إنتاجه على tablet عند التمرير)
- **البوابات:** tsc 0 · eslint 0/0 · vitest **1108/1108** · next build exit 0 (next-env.d.ts أُعيد توليده — أخطاء TS2307 للصور كانت أثر نسخة نظيفة لا كسرًا)
- **التحقق البصري (Playwright على build محلي — خمسة سياقات Desktop/Dark/Tablet/Mobile/AR):** صفر overflow أفقي ×5 · زرا Hero حيان بالسياقات الخمسة بمسارات وlabels صحيحة (‎/ar/memberships‏ و«ابدأ مجانًا» بالعربية) · الحاويات max-w-6xl ×10 أقسام · السلّمان كبيران محسوبين بالثيمين · الـnavbar بعد الإصلاح: الداكن نظيف تمامًا والفاتح شبح خفيف ضمن سلوك الشفافية الموثق — اللقطات خارج المستودع (download/phase198-batch1/)
- **التوثيق المصاحب بنفس المرحلة:** DESIGN.md (§4 صفوف chrome-text/navbar-chrome · §5 حاوية الأقسام · §7.1 زرا Hero + هالة hero-copy بسجل القرار) · STATE.md (198 + QA) — تحقق حي على الإنتاج بعد النشر

Stage Summary:
- الدفعة 1 (Critical) منفذة ومختبرة محليًا بالسياقات الخمسة — أبرز أثر تحويلي: أول CTA في أول شاشة بعد ~6 أشهر من إزالة أزرار الـHero، وأرقام كرومية مقروءة AA/AAA بدل ‎2.1:1
- قرارات ملكية موثقة: إضافة زري Hero تلغي Phase 127 (§0 من الخطة) — أُغلقا بندا H8 (خط عربي) وH9 (شريحة Memberships) كقرارات قائمة لا عيوب
- الدفعات 2 (توحيد الكروت · دمج الكاروسيلين · كارت Free + طي الجدول · تنحيف EVO · الأزرق M10/M11) و3 (chips الجوال · Tablet · مقاييس الأزرار/الطباعة · RTL carousel · alt) التالية على docs/UI-IMPLEMENTATION-PLAN.md

---
Task ID: PHASE-196-P197-LIVE-VERIFICATION-2026-09-14
Agent: Super Z (main)
Task: أدلة التحقق الحي للمرحلتين 196 + 197 بعد نشر Vercel (نمط §3.7: runtime claims تتطلب تحققًا من الرابط الإنتاجي)

Work Log:
- انتظار اكتمال نشر Vercel ثم فحص كل الأسطح المستهدفة بالحصول على HTML الحي (cache-busting بعد ملاحظة edge-cache قديم age=2229s في أول محاولة)
- **196/EN الرئيسية:** «No — all 8 tools (the calculators, the meal planner, and the two AI planners)» حية · صفر «5 calculators»
- **196/AR الرئيسية:** «868+ تمرينًا بشرح واضح ومستويات صعوبة متدرّجة» حية · صفر «أكثر من 868» (قسما التمارين وFAQ JSON-LD والـORG schema) · سؤال العد «868+ تمرينًا و8,830+ صنف غذائي» حي
- **196/Coaching EN:** «EVO is part of every Alkemos membership, and your coaching plan includes it in full with no extra subscription» حية · **AR:** «EVO جزء من كل عضويات Alkemos، وباقة الكوتشينج تشمله بكل ميزاته بلا أي اشتراك إضافي.» حية
- **196/Memberships sanity (بلا تغيير):** «3 meal/exercise swaps per week» + «never a full plan regeneration» حية EN · «3 تبديلات للوجبات أو التمارين أسبوعيًا» + «دون إعادة إنشاء الخطة كاملة» حية AR · **/evo:** «available to everyone» + «3–6/week by tier» حية
- **197/المقارنات:** /compare 200 · MFP: «280M+ users» ×2 + «8 free tools (5 calculators, meal planner, 2 AI planners)» ×2 + «Premium+ tier ($24.99/month» ×2 · Freeletics: «Training Coach ~$80/yr (12-mo)» + «Human coaching» + «AI coaching only — no human coaches» + «AI Nutrition Coach (meal plans & recipes — no food tracking)» حية · ExRx: «2,200+ exercises» + «Human coaching» + «Free, ad-supported website + paid exercise apps» حية · «Data as of 2026-09-14» معروض · **المرايا AR الثلاث:** «280 مليون مستخدم» · «التدريب البشري» · «2,200+ تمرين» · «8,830+» (6/8/4 مواضع) حية · **صفر إصابات stale** (350M · 6 free · ~$95/yr · ~200 حركة · 2,100 · $5/mo) على الثماني صفحات
- **197/الرئيسية السريعة:** «Some» ×3 (EN) + «بعضها» ×3 (AR) حية بالخلايا الثلاث المحوّلة

Stage Summary:
- المرحلتان 196 و197 حيتان بالكامل على الإنتاج — كل أهداف التحقق المطلوبة بالأمرين مؤكدة (الرئيسية + Memberships + EVO + Coaching EN/AR · كل صفحات المقارنات EN/AR)
- Commits المغطاة: 12c96b6 (196) · c83971f (197) — SYNCED
- Push status: pushed إلى origin/main

---
Task ID: PHASE-197-COMPETITOR-COMPARISON-REFRESH-2026-09-14
Agent: Super Z (main)
Task: أمر المالك «نفّذ Phase 197 — Competitor Comparison Tables Refresh»: تدقيق كامل أولًا لكل جداول المقارنة مع المنافسين ومصادر بياناتها (ليس جداول الباقات الداخلية) → حصر خدمات Alkemos الحالية → تحديث الجداول EN/AR لتعكس Alkemos فعليًا (AI nutrition/workout planning · EVO · Swaps · مكتبات الأطعمة والتمارين · Meal planner · Calculators/free tools · Coaching) → بيانات منافسين موثقة حديثة فقط، لا افتراضات، ما لا مصدر له يُنزع أو يُعلّم → مراجعة العناوين وال✓/✗ والنصوص المختصرة → EN/AR متطابقان بالمعنى بصياغة طبيعية مستقلة → حماية SEO/GEO → لا مساس بأسعار/entitlements/functionality → canaries + بوابات + STATE/worklog + commit/push + تحقق حي

Work Log:
- بروتوكول §3.6: STATE.md (196 على 2f28621) + AGENTS.md + fetch → SYNCED
- **Audit (1/3 من الأمر):** مصدر واحد مشترك src/lib/comparisons.ts (464 سطرًا) يغذي 8 صفحات data-driven: /compare + /compare/[slug]×3 + المرايا /ar/* — لا أرقام hardcoded بالصفحات؛ جدول رابع بالرئيسية LandingView «Why Alkemos? A quick comparison» (بدائل تقليدية/تطبيقات عامة — ليس باقات داخلية فداخل النطاق)؛ sitemap-comparisons يلتقط تلقائيًا؛ جدول مقارنة العضويات الداخلي (memberships.ts) خارج النطاق بأمر المالك
- **تحقق بيانات المنافسين حيًا بالبحث (2026-09-14) قبل أي صياغة:** MFP: Premium $19.99/شهر · $79.99/سنة مؤكد من صفحاتهم ومراجعات 2026 متعددة + **مستوى Premium+ جديد** ($24.99/شهر · $99.99/سنة يضيف Meal Planner) + قاعدة 14M+ طعام + ماسح الباركود/Meal Scan ميزات مدفوعة ✓ + عدد المستخدمين: كانت «350M+» قديمة — المصادر الحالية تتضارب (Reuters/Wikipedia 2026: 280M+ من الشركة · businessofapps: 220M) → اعتُمد 280M+ (المصدر الأقوى) ووُثق التضارب · Freeletics: التسعير القديم «~$95/yr Standard · ~$150/yr Premium» بلا أساس حي — الرسمي (App Store): $34.99/3 أشهر · $79.99/12 شهرًا للـTraining Coach والحزم أعلى؛ اللغات: إنجليزية + 9 (App Store: French German Italian Japanese Polish Portuguese Russian Spanish Turkish) بلا عربية — كانت «+8 أوروبية»؛ لديهم Nutrition Coach بخطط وجبات ووصفات (موقعهم 2026) وبرامج جاهزة 6/12 أسبوعًا + audio coaching مؤكد ✓ · ExRx: «over 2200» تمرين من موقعهم الرسمي (كانت 2,100+)؛ **«$5/mo ad-free» لم يُعثر له على مصدر → نُزعت** (أمر المالك: ما لا مصدر له لا يُكتب) واستُبدلت بـ«Free, ad-supported website + paid exercise apps» الموثقة
- **حصر خدمات Alkemos (2/3) وتحديث الجداول (3/3):** MyFitnessPal: صف الأدوات «6 free (calorie, BMI, macro, body fat, water, meal planner)» الفاتت canaries 195 (كانت تعدّ المخطط حاسبة وتُسقط مولدَي AI) → «8 free tools (5 calculators, meal planner, 2 AI planners)» · خلية 8,830 → 8,830+ · intro 350M+→280M+ + «free calculators»→«free tools» · متن الأسعار أضاف جملة Premium+ · «no macros, no insights» بالمتني المجاني (ادعاء غير دقيق — MFP المجاني يعرض الماكروز) → «barcode scanning and its deeper insights are Premium-only» الموثقة · Freeletics: صف التمارين «~200 bodyweight movements» (لا مصدر) → «AI-built workouts from a bodyweight movement pool (no public library)» · «Basic nutrition advice» → «AI Nutrition Coach (meal plans & recipes — no food tracking)» الأدق لهم · «AI-generated only (no preset programs)» → «AI-generated + preset training plans» (لديهم برامج جاهزة) بoutcome win→tie · «English + 8 European languages» → «English + 9 more languages (no Arabic)» · التسعير «~$95/…~$150/» → «Training Coach ~$80/yr (12-mo) — nutrition bundle costs more» بoutcome win→tie (الصدق: أرخص سعرًا خامًا) + **صف جديد «Human coaching»**: Alkemos $39.99/mo ✓ مقابل «AI coaching only — no human coaches» · المتني: «roughly $150/year» → «about $80/year» + تصحيح مقارنة الجمع (Freeletics + MFP Premium ≈ $160 > Alkemos Premium $119 — كانت تقارن بـPro خطأً) · ExRx: 2,100+→2,200+ (intro + صف + متن ×لغتين) · خلية 8,830 → 8,830+ · إزالة $5/mo · **صف جديد «Human coaching»**: Alkemos ✓ مقابل «Not available» · الرئيسية «Why Alkemos?»: خلايا «التطبيقات العامة» المبنية على افتراض ❌ (قاعدة أغذية · مدربون معتمدون · مدرب AI) → «بعضها/Some» — لا افتراض عن فئة غير متجانسة (الأمر 4: لا تفترض وجود/غياب ميزة) مع بقاء ❌ للعربية/RTL (موثقة الصحة)
- **EN/AR متطابقان بالمعنى بصياغة مستقلة:** كل تعديل بالجدول والمتن نُفذ باللغتين (خطوط ملاحظة AR: «صورة التسعير دقيقة» «كتالوج محدود بوزن الجسم») — والتوازن البنيوي صار محروسًا
- **الخليط المنهجي الموثق (أمر المالك 6):** Meal/Exercise Swaps (تبديل فردي داخل الخطة) ظهرت فقط بصف EVO كما هي — لم تُخلط مع إعادة التوليد الكامل ولا توليد الخطط ولا تعديل الطاقم؛ جولة 195 أسست الفصل وهذا التحديث لم يلمسه
- **الحرس:** canary «Phase 197» بـmarketing-msa-surface.test.ts — منع: «6 free (calorie» · «2,100» · «350M» · «~$95/yr» · «~$150/yr» · «roughly $150/year» · «حوالي $150/سنة» · «$5/mo ad-free» · «$5/month ad-free» · «$5/شهر» · «8,830 foods» (بلا +) · «English + 8 European languages» — إلزام: «8 free tools (…)» · «8,830+ foods» · «2,200+» · «280M+» · «~$80/yr» · dataAsOf=«2026-09-14» للثلاثة · جملة Premium+ · صف Human coaching بكل مقارنة · توازن bodyEn/bodyAr 1:1 (أقسامًا وفقرات) · قانون «+» على كل خلية تحمل 8,830/868 · خليتا «بعضها/Some» بالرئيسية
- **SEO/GEO محفوظ:** بنية الصفحات وItemList/Article schemas وdataAsOf المعروض و«Reviewed by Ahmed Zake» كما هي — الجداول بقيت جداول (لا نص تسويقي عام) والتحديث غيّر البيانات والخلايا لا البنية
- **البوابات:** tsc 0 · eslint 0/0 · vitest **1099/1099** (+1: canaries 197) · next build exit 0 · docs_audit (phase=197) · stale-refs ✓ · ui-wiring ✓

Stage Summary:
- **النتيجة:** 4 جداول مقارنة (3 منافسين + الرئيسية السريع) تعكس Alkemos الحالي بالكامل (8 أدوات · مكتبتين بـ+ · Coaching بصف مستقل بكل مقارنة) ببيانات منافسين مُعاد التحقق منها حيًا بتاريخ 2026-09-14 موثقة المصادر، وصفر ادعاءات غير مؤكدة (نُزعت $5/mo و~200 حركة و350M)، وoutcomes أعيدت معاينتها بصدق (tieان بجدول Freeletics)، وEN/AR متوازنان بنيويًا ومحروسين
- **صفر مساس:** بأسعار Alkemos/الحدود/البوول/entitlements/الوظائف/المدونة/التصميم — بيانات Alkemos المعروضة في الجداول (14.99/29.99/39.99 · 868+ · 8,830+ · 8 أدوات) كلها من مصادرها في memberships.ts/exercises-shared/foods-shared/tools-shared
- **غير مؤكد/موثق للمراجعة:** تضارب عدد مستخدمي MFP (220M–280M) — اعتُمد 280M+ منقولًا عن الشركة (Reuters 2026)؛ تسعير حزم Freeletics التغذية «يكلّف إضافيًا» بلا رقم (المصادر متضاربة 115–150$/سنة)
- التوثيق: STATE.md (المرحلة 197) + هذا السجل
- Commit SHA: c83971f — الكود + التوثيق بنفس الفاز (السجل الكامل أعلاه)
- Push status: pushed إلى origin/main (2f28621..c83971f) — SYNCED؛ التحقق الحي يُسجل في مدخل لاحق بعد نشر Vercel

---
Task ID: PHASE-196-COPY-MICRO-FIXES-2026-09-14
Agent: Super Z (main)
Task: أمر المالك «نفّذ Phase 196 — Copy Micro-Fixes»: (1) الرئيسية EN أي عبارة 5 calculators → 8+ free tools أو صياغة متسقة مع صفحة Tools؛ (2) الرئيسية AR «أكثر من 868+ تمرينًا» → «868+ تمرينًا»؛ (3) مراجعة weekly cap 1+1/2+2 مقابل مصدر الحقيقة بالعضويات بلا تغيير السلوك أو الحدود؛ (4) توحيد صياغة ملكية EVO عبر EVO/Memberships/Coaching بحيث لا توحي صفحة بأن EVO حصري للكوتشينج؛ (5) البحث عن بقايا مباشرة لنفس الأخطاء في EN/AR/SEO/FAQ/JSON-LD — ثم حراس + بوابات + STATE/worklog + docs/stale/ui-wiring + commit/push + تحقق حي — copy-only بلا أي تحسينات أخرى

Work Log:
- بروتوكول §3.6: STATE.md (195 على 3ec68d1) + AGENTS.md + fetch → SYNCED + آخر مدخلات worklog
- **تدقيق مصدر الحقيقة قبل الصياغة (§3.1):** memberships.ts = swaps 0/3/6/6 أسبوعيًا · توليدات AI 2/4/8/8 شهريًا (رصيد موحد) · EVO chat 10/يوم ثم غير محدود — مسح كامل لكل الأسطح بالمطابقة: صياغات swaps/التوليدات كلها متسقة (3/6 أسبوعيًا · 8 شهريًا)؛ «1+1/2+2» لا وجود لها في copy المستخدم إطلاقًا — فقط تعليق كود تاريخي في memberships.ts:22 يوثق إلغاء القاعدة (يُترك — ليس copy) + تعليقات tier-limits/coach-limits/api-route المماثلة
- **(1) الرئيسية EN (LandingView FAQ الأدوات):** «all 8 tools (the 5 calculators, …)» → «all 8 tools (the calculators, the meal planner, and the two AI planners)» — نزع عدد الحاسبات الفرعي من التعداد (العدّ الكلي 8 هو الرسالة)؛ تعداد «eight free tools — five calculators (…)» بالـcomparisons وllms-full بقي كما هو (نمط 195 المعتمد — تعداد مركب لا ادعاء عدّ)
- **(2) الرئيسية AR:** قسم التمارين «أكثر من ${EX_PLUS} تمرينًا» الذي يرندر «أكثر من 868+ تمرينًا» (الخطأ الملكي الحرفي، مؤكد حيًا قبل الإصلاح) → «${EX_PLUS} تمرينًا»؛ سؤال الـFAQ «كم عدد التمارين والأطعمة؟» AR كان «أكثر من 868 تمرينًا و8,830 صنف غذائي» (بلا + ومخالف لـEN) → مشتق EX_PLUS/FOODS_PLUS مثل نظيره EN
- **(3) Weekly cap:** راجع كل سطر يحمل «أسبوعي» على السطح العام مقابل مصدر الحقيقة — كل الأسطح تصف التبديلات (3/6 أسبوعيًا) لا التوليدات؛ لا صياغة متعارضة → الحد الأدنى: حارس يمنع «1+1»/«2+2»/«weekly cap» من الأسطح التسويقية الخمسة (LandingView · memberships/layout · faq-content · StaticPageView · comparisons) مع إبقاء التعليق التاريخي بمصدر الحقيقة
- **(4) ملكية EVO (coaching/page.tsx):** «وهو جزء من باقة الكوتشينج، لا اشتراك منفصل عنها» / «included in your coaching plan, not a separate subscription» (مؤكد حيًا) توحي بالحصرية رغم أن EVO مجاني للجميع وداخل كل العضويات → «EVO جزء من كل عضويات Alkemos، وباقة الكوتشينج تشمله بكل ميزاته بلا أي اشتراك إضافي» / «EVO is part of every Alkemos membership, and your coaching plan includes it in full with no extra subscription» — رسالة موحدة مع /evo («متاح للجميع») وStaticPageView («Available to everyone — visitors and members alike») بلا أي تغيير entitlement
- **(5) بقايا نفس التناقض (أكثر من/الترقيم/العدّ):** seo.ts ORG AR «أكثر من 868 تمرينًا، 8,830+» (خلط أسلوبين بجملة واحدة) → «868+ تمرينًا، 8,830+» · ar/meal-planner/layout meta «أكثر من 8830 أكلة» (صيغة 8830 القديمة الفاتتها canaries 195) → «8,830+ صنف غذائي» · ai-workout-planner AR ×2 «أكثر من 868 تمريناً» → «868+ تمرينًا» · blog-category-content «البالغة 868 تمريناً»/«library of 868 entries» → «868+» باللغتين · authors.ts (مصدر founder JSON-LD) «868-exercise library»/«مكتبة الـ868 تمرينًا» → «868+» باللغتين
- **الحرس (منع عودة الأخطاء الأربعة):** canary جديد «Phase 196» بـmarketing-msa-surface.test.ts — يمنع: «the 5 calculators»/«الحاسبات الخمس»/«5 حاسبات»/«أكثر من ${EX_PLUS}»/«أكثر من 868» بالرئيسية · «أكثر من 868»/«868-exercise» بـseo.ts · «868-exercise»/«الـ868 تمرينًا» بـauthors.ts · «8830» بـar/meal-planner · «أكثر من 868» بـai-workout-planner · «868 تمريناً»/«868 entries» بـblog-category-content · «not a separate subscription»/«لا اشتراك منفصل»/«جزء من باقة الكوتشينج» بالكوتشينج · «1+1»/«2+2»/«weekly cap» على الأسطح التسويقية الخمسة + إلزام رسالة الـevery-membership باللغتين بالكوتشينج (الحارس أمسك اقتباس العبارة القديمة داخل تعليق الشرح فأعيدت صياغته — يثبت أن الحارس حي)
- **docs/stale/ui-wiring:** docs_audit (phase=196 من STATE) · stale-reference: لا مراجع قديمة مستهدفة (كل التعديلات على ملفات حية مكتشفة بالمسح) · check-ui-wiring.sh: صفر أزرار/نقاط جديدة — copy-only
- **البوابات:** tsc 0 · eslint 0/0 · vitest **1098/1098** (+1: canaries 196) · next build exit 0 · docs_audit ✓

Stage Summary:
- **النتيجة:** الأخطاء الأربعة مغلقة بحراس دائمين: عدّ الأدوات 8+ على كل الرئيسية (التعداد الفرعي نزع من FAQ) · كل الأعداد تحمل ترقيمًا واحدًا (868+/8,830+ بلا «أكثر من» المزدوجة أو المختلطة) على الرئيسية والميتاداتا وJSON-LD · الغطاء الأسبوعي الملغى محروس على الأسطح التسويقية · ملكية EVO موحدة (جزء من كل العضويات — الكوتشينج يشمله كاملًا) بلا أي تغيير في entitlement
- **صفر مساس:** بالوظائف/الأسعار/الحدود/البوول/business rules/المدونة/المسارات/التصميم — copy-only + حراس
- التوثيق: STATE.md (المرحلة 196) + هذا السجل
- Commit SHA: 12c96b6 — الكود + التوثيق بنفس الفاز (السجل الكامل أعلاه)
- Push status: pushed إلى origin/main (3ec68d1..12c96b6) — SYNCED؛ التحقق الحي يُسجل في مدخل لاحق بعد نشر Vercel

---
Task ID: PHASE-195-NUMBERS-PROOF-SWAPS-CLARITY-2026-09-14
Agent: Super Z (main)
Task: أمر المالك «نفّذ Copy Refinement صغير: (1) الأرقام في Homepage proof-of-depth لا مواصفات — Exercises 868+ · Foods 8,830+ · Tools 8 وليس 5 — واجعل أعداد المكتبات Dynamic من مصدر البيانات قدر الإمكان، و"+" لحجم المحتوى فقط لا حدود العضوية؛ (2) حافظ على Benefit-First (Phase 194)؛ (3) مهم جدًا: وضّح أن Swaps تبديلات وجبات/تمارين داخل الخطة لا إعادة توليد كامل — EN/AR بصياغة محددة — في Homepage وMemberships وFAQ وكل مكان؛ (4) تحقق terminology (توليد الخطة ≠ Meal Swap ≠ Food/Item Swap ≠ Workout Day ≠ Exercise Swap)؛ (5) Test → Document → Commit → Push → Verify live» — copy-only بلا مساس بالسلوك أو الحدود

Work Log:
- بروتوكول §3.6: STATE.md (194 على 226aeb3) + AGENTS.md + fetch → SYNCED + آخر مدخلات worklog
- **تحقق السلوك قبل الصياغة (§3.1):** ai-jobs.ts — تبديلات الأعضاء بالحصة الأسبوعية = meal_regenerate (وجبة واحدة) + exercise_regenerate (تمرين داخل اليوم) ببوابتي user_swap_meal/user_swap_exercise؛ food_item_regenerate وday_regenerate أدوات طاقم فقط (JobGate: coach) — صياغة المالك «Meal & Exercise Swaps» مطابقة للواقع حرفيًا؛ الحصة أسبوعية لكل نوع عبر plan_swaps (تجديد الاثنين — tier-limits.ts)؛ /tools = 8 أدوات فعلية (5 حاسبات + مخطط الوجبات + مخططا AI) — «5» كانت ناقصة
- **(1) مصدر واحد جديد src/lib/tools-shared.ts:** مصفوفتا TOOLS/TOOL_LIBRARIES نُقلتا من tools/page.tsx (نفس الرندر) + TOOLS_COUNT = tools.length (8) — نمط exercises-shared/foods-shared؛ الرئيسية تشتق شارة «8+ FREE TOOLS / 8+ أدوات مجانية» (شارة هيرو رابعة) وعنوان قسم الأدوات من نفس المصفوفة — يزيد تلقائيًا مع نمو المنصة
- **(2) أرقام ديناميكية:** LandingView وmemberships.ts تشتق EX_PLUS/FOODS_PLUS من الثوابت الموثقة (مثبتة على المصفوفات بحرس library-counts) — استُبدلت كل السلاسل الصلبة (شارات الهيرو · HERO_NAV · سؤالا الكم · صفوف المقارنة · قسمي التمارين/الأطعمة · بطاقة مخطط الوجبات (وأكلة→صنف غذائي) · قسم المدربين · سطر الخطة المجانية · ميزات Free/مقارنة العضويات) — و«5 حاسبات/5 calculators» أُسقطت من كل الأسطح (سؤال الأدوات يعدّ الثماني بأسمائهم · ميزات Free «8+ أدوات لياقة وتغذية مجانية») — الحدود (2/3/6/10) بلا «+» أبدًا
- **(3) توضيح Swaps بالصياغة الملكية الحرفية (EN+AR):** memberships.ts (ميزاتي بريميوم/برو + tagline برو + صف المقارنة «EVO: Meal & Exercise Swaps/تبديلات الوجبات والتمارين») + ملاحظة جديدة تحت جدول مقارنة العضويات (دون إعادة إنشاء الخطة كاملة + تجدد كل اثنين) · الرئيسية (كارت برو: tagline + قائمة الميزات + سؤال Premium/Pro) · faq-content.ts (السؤال «What are swaps and how many do I get?/ما هي التبديلات وكم عددها؟» يفتت بالتعريف ثم الحدود) · StaticPageView (قسم الشروط «التبديلات»→«تبديلات الوجبات والتمارين» بتعريف الاستبدال الفردي + زوجا FAQ) · memberships/layout OfferCatalog («6 meal/exercise swaps per week») · coaching (وصف EVO) · المقارنات الثلاث (خلية AI coach ×2 + أقسام Where-Alkemos-wins)
- **(4) التصحيحات المرفقة بنفس معيار الدقة:** «ست حاسبات/six calculators» بالثلاث مقارنات كانت تعدّ مخطط الوجبات حاسبة → «ثماني أدوات (خمس حاسبات + مخطط وجبات + مولدا خطط AI)» · بقايا مضاعفة فاتت 185: «doubles plan limits/يُضاعف حدود الخطط» بمقارنة MyFitnessPal → الأرقام المباشرة · «+» الناقص: قسم المؤسس بالـAbout (AR/EN) + خلايا/فقرات المقارنات (868-exercise→868+ · 8,830-food→8,830+ · 868 exercises→868+) · وصف AR للـOrganization «8830 أكلة»→«8,830+ صنف غذائي» (pin low-fixes حُدّث بنفس الفاز) · llms-full.txt أكمل عدّ الأدوات الثماني (أضيف مخطط الوجبات اليدوي) · seo.ts EVO schema «تبديلات ذكية للوجبات والتمارين»
- **(5) الحرس:** canaries 195 بـmarketing-msa-surface.test.ts (منع رجوع «3/6 swaps/week» و«3/6 تبديلات/أسبوع» المجرّدة و«5 حاسبات» و«ست حاسبات» و«doubles plan limits» و«8830» والعناوين القديمة — 7 ملفات) + عقد الديناميكية (EX_PLUS/FOODS_PLUS/TOOLS_PLUS إلزاميًا بالرئيسية + استيراد tools-shared في tools/page وmemberships) + اختباران لعدّ الأدوات (TOOLS_COUNT=8 census) في library-counts.test.ts + عقود discoverability الثلاثة (المخططان + diet-plan) حُدّثت لمصدر البيانات الجديد
- **البوابات:** tsc 0 · eslint 0/0 · vitest **1097/1097** (+3 عن 1094) · next build exit 0 · docs_audit (phase=195 · STATE 86 سطرًا)

Stage Summary:
- **النتيجة:** كل أرقام حجم المحتوى ديناميكية من مصادرها الموثقة وتحمل «+» (868+/8,830+/8+)، وعدد الأدوات صار حقيقيًا (8) بمصدر واحد يغذي الرئيسية والـhub، وكل ظهور لحدود التبديلات على السطح العام يشرح أنها استبدال وجبات/تمارين فردي داخل الخطة لا إعادة توليد — بالمصطلحات الملكية الحرفية EN/AR — ومطابق لسلوك الكود الفعلي (meal/exercise للأعضاء · food_item/day للطاقم)
- **صفر مساس:** بالوظائف/الأسعار/البوول/الحدود/business rules/المدونة/المسارات/التصميم — نقل مصفوفتا الـhub نقل بيانات صرف بنفس الرندر، وعقود الاختبار الثلاثة المتأثرة حُدّثت بنفس الفاز بوعي
- التوثيق: SEO-GEO-MASTER-PLAN §12.52 + STATE.md (المرحلة 195) + هذا السجل
- Commit SHA: 1082e67 — الكود + التوثيق بنفس الفاز (السجل الكامل أعلاه)
- Push status: pushed إلى origin/main (5b016f7..1082e67 + docs 41523bd) — SYNCED
- **التحقق الحي (بعد نشر Vercel):** الرئيسية EN: شارات «868+ EXERCISES · 8,830+ FOODS · 8+ FREE TOOLS» + «6 meal/exercise swaps per week» ×2 + «8+ free tools» ×2 حية · الرئيسية AR: «8+ أدوات مجانية» ×3 + «6 تبديلات للوجبات أو التمارين أسبوعيًا» ×2 + «8,830+ صنفًا غذائيًا» ×6 حية · /memberships: صف «EVO: Meal & Exercise Swaps» + «3 meal/exercise swaps per week» + ملاحظة «never a full plan regeneration» حية · /ar/memberships: «تبديلات الوجبات والتمارين» + «3 تبديلات للوجبات أو التمارين أسبوعيًا» + «دون إعادة إنشاء الخطة كاملة» حية · /faq و/ar/faq: السؤالان الجديدان حيان (ظاهر + JSON-LD) · مقارنة MyFitnessPal: «eight free tools» ×4 + «raises the unified AI pool» ×2 حية · /terms EN: قسم «Meal & Exercise Swaps» حي
- **ملاحظة موثقة (خارج النطاق — سابقة للمرحلة):** /ar/terms يرجع 404 لأن المسار غير موجود أصلًا في الكود (تحقق git show 5b016f7) — غير مرتبط داخليًا وغير موجود في sitemap (404 معزول غير قابل للوصول)؛ ليس انحدارًا من 195
---
Task ID: PHASE-194-COPY-REFINEMENT-PASS-2026-09-14
Agent: Super Z (main)
Task: أمر المالك «نفّذ Copy Refinement Pass على الموقع الحالي [Alkemos] والمستودع الحالي. ابدأ بـ Audit سريع للكود + النصوص الحية، ثم نفّذ مباشرة. لا تغيّر أي functionality أو pricing أو quotas أو business rules، والمدونة مستثناة بالكامل» — بنود الرئيسية EN/AR + About + FAQ + EVO + For Coaches + Global AR sweep + كارت AI Plans + كل الكروت Benefit-First + AI Plans Card + Tests/Build/Doc/Commit/Push/Verify

Work Log:
- بروتوكول §3.6: STATE.md (193 على e66767a) + AGENTS.md + fetch → SYNCED + آخر مدخلات worklog
- **Audit سريع:** قراءة كاملة للملفات المستهدفة (LandingView · StaticPageView · faq-content · faq/meta · evo · for-coaches + register + content · ar/for-coaches layouts) + زحف حي 200 للرئيسية (H1 الحي «Your complete fitness platform.» مؤكد منشورًا) + مسح آلي بحدود كلمات لكل السلاسل العربية في الملفات العامة (سكربت محلي — كوتش/كوتشينج مستثناة كمصطلح علامة)
- **تحقق الادعاءات قبل الكتابة:** الخصوصية — RLS من الميجريشنز (0001: chat_owner_or_coach · 0078: evo_memory select=owner-or-coach_over + update/delete admin · 0067 admin clients unification) + أسطح admin القراءة (/admin/saved-results · /admin/payments · /admin/leads · /admin/evo-analytics) → «فقط أنت والمدرب» غير دقيقة؛ الصياغة الجديدة: المالك + المدرب المعيّن + فريق مُصرّح في نطاقات دعم/تشغيل محدودة · EVO — memory=بيانات/أهداف/تفضيلات/تقدّم (evo_memory 0078) ≠ chat history (تزامن عبر الأجهزة للمشترك) · ادعاءات learning/weekly بقيت كاملة (مثبتة §12.50)
- **Homepage EN/AR:** H1 الجديد + وصف منصة-واحدة تحت H1 (EN+AR) · كارت AI Plans بطاقة-فائدة (headline/description/CTA بأمر المالك حرفيًا) والتفاصيل التشغيلية سطر ثانوي صغير · H2 أدوات/تمارين/أطعمة benefit-first والأرقام في الأوصاف كدليل · الكوتشينج: «مدرب يتابع تقدمك خطوة بخطوة» + «وتتطوّر مع تقدّمك» · للمدرّبين: «السعر الذي تختاره أنت» + 100%/رسم ثابت
- **About/FAQ/EVO/For-Coaches:** unmatched→smarter/more connected · المواقع الآلية→AI+human oversight+evidence-aware · حذف 2-4/8-12 أسبوع من الأسطح الثلاثة (StaticPageView EN/AR + faq-content JSON-LD) + meta /faq · Privacy: دقة RLS في بنود Data Usage/Data Security وأسئلة الأمان باللغتين · EVO: صفّا Memory/Chat History بجدول الاختلافات · for-coaches: شريط 0%→100% + كارت «احتفظ بكل ما تحصّله» + «تتم تفعيل اشتراكات عملائك» (بيتم→تتم) + alt «مدرب يتابع عميله»
- **Global AR sweep (خارج بنود الأمر — نفس المنهج):** FoodDetailClient (عايز/دوس على زرار/هاتحسب) · for-coaches/register (ننقلك الآن/لديك حساب) · ميتاداتا /ar/for-coaches + register/layout (إيدك→بين يديك · بتحددها→تختارها أنت — keywords بقيت بيانات بحث) · ContactView · programs (حالة فراغ) · EvoFloatingWidget (6 سلاسل + إزاي/إيه) · AuthView (مسار الدفع) · رسائل API الظاهرة (سجل المدرب ×3 · تفعيل · ai_jobs/normalize/ai-usage «العميل ده» ×4 · PayPal · إلغاء ×3 · استرداد ×2 · member-edit · إعلانات المدربين) · نصائح بريد الحاسبات (16 صياغة) + رسالة الحصة اليومية
- **الحرس:** marketing-msa-surface 9→17 ملفات (+FoodDetail +programs +Contact +EvoWidget +AuthView +register +ar-layouts) + canaries 194 (العبارات المنزوعة باللغتين بما فيها H1 القديم و«0% Commission») · عقود محدثة بنفس الكوميت: ai-meal-planner discoverability (CTA الجديد «أنشئ خطتي/Create My Plan/Your plan. Built for you.») + refund-eligibility («لا يوجد اشتراك نشط»)
- **Metadata:** وصف EN الجذر يقود بالتموضع مع الأرقام كدليل (157 حرفًا) · وصف AR (×3 كتل) يقود بالتموضع الجديد مع CTA المالك الحرفي · وصف /faq بلا وعد النتائج الزمنية
- **البوابات:** tsc 0 جديد (الأربعة الموثقة مسبقًا لاستيراد صور for-coaches تطابق أساس origin/main بالضبط — تحقق git stash) · eslint 0/0 · vitest **1094/1094** (+16 عن 1078) · next build exit 0 · docs_audit (phase=194 · 84 سطرًا)

Stage Summary:
- **النتيجة:** الرئيسية تقرأ كمنصة ذكية واحدة («تدرّب بذكاء. تغذَّ بدقة. وتقدّم بوعي.») لا مجموعة أدوات — كل الكروت تبيع الفائدة والأرقام أدلة · كل ادعاء له مصدر كود (RLS/البوول/الرسوم) · صفر ادعاء زمني للنتائج · عربية فصحى موحدة على كل الأسطح العامة المحروسة (17 ملفًا بحرس دائم)
- **صفر مساس:** بالوظائف/الأسعار/البوول/business rules/المدونة/المسارات/التصميم — Copy-only + حراس
- **خارج النطاق (موثق):** keywords الميتاداتا (بيانات بحث) · سلاسل i18n الداخلية ولوحات admin/المدرب (استمرار المؤجل P2 من 193 — سطح داخلي غير تسويقي)
- التوثيق: SEO-GEO-MASTER-PLAN §12.51 + STATE.md (المرحلة 194) + هذا السجل
- Commit SHA: 226aeb3a83f41d9e37b8b5490d4776056d903ffe (الكود + التوثيق بنفس الفاز)
- Push status: pushed إلى origin/main + تحقق SYNCED
---
Task ID: PHASE-193-COPY-AUDIT-2026-09-14
Agent: Super Z (main)
Task: أمر المالك «نفّذ على مستودع Alkemos الحالي مهمة Website Copy Audit & Improvement، مع استبعاد المدونة بالكامل» — تدقيق Read-Only شامل (Copy/CTAs/messaging/عربي-إنجليزي/E-E-A-T/دقة الادعاءات) → خطة P0/P1/P2 موثقة في §12.50 → تنفيذ Copy-only كامل

Work Log:
- بروتوكول §3.6: STATE.md (192 على 80b5a6f) + AGENTS.md + fetch → SYNCED + آخر مدخلات worklog
- **القراءة (Read-Only):** 14 ملفاً كاملاً (LandingView · evo · coaching · memberships + memberships.ts · tools · for-coaches + content.ts · AffiliateProgramView · StaticPageView · i18n · SiteHeader · FoodsExplorer · EVO widget) + زحف حي 200 للصفحات السبع + مطابقة كل رقم بمصدره (affiliate-constants · tier-limits)
- **تحقق كود EVO من الادعاءات:** التعلم الأسبوعي من خطط المنصة حقيقي (evo-learning-runner + GHA evo-weekly-learning + 0080 + استهلاك في plan-generator) · الذاكرة الدائمة للمسجلين مجاناً (evo-memory: استخلاص كل 10 رسائل، حقن أعلى 15 حقيقة) · القياسات للمشترك ببيانات فعلية + delta (formatProgressForPrompt) — الادعاءات ثابتة ولا تُضعف؛ ضُبطت الصياغة فقط («يتابع تقدّمك ويتذكّر» + «يتعلّم أسبوعيًا من خطط المنصة»)
- **P0 — الصدق والثقة:** حذف 9 testimonials مزيفة (صور stock + أسماء ونتائج مخترعة «-12kg») + المقولات المميزة + «+500 عميل/Real results» من /coaching → قسم «التزام يمكن الاعتماد عليه» بثلاث بطاقات موثقة (إشراف المؤسس أحمد زكي المعتمد · حدود شفافة · استرداد 7 أيام) · بطاقة Premium بالرئيسية بمحتوى سُلّم الحفظ (حذف «حفظ دائم ومزامنة» = ميزة الحساب المجاني — مطابقة §185) · شريط المدربين «مساحات ترويجية مدفوعة» بدل «مدربينا المعتمدين» (إعلان 0037 بلا إفصاح) · توحيد زوج FAQ للدفع
- **P1 — التموضع والصوت:** سطر الفئة موحّد «منصة اللياقة والتغذية الذكية المتكاملة / The Smart Fitness & Nutrition Platform» على 6 أسطح + ميتاداتا EN/AR (داخل ميزانية 158/160) · عدّ الحاسبات موحّد (5 + مخطط) · تناظر EN/AR (كوتشينج/أدوات/for-coaches/المجاني) · CTA الختام «خطتك الأولى خلال دقائق» · حذف مفتاحي i18n الميتين (تبديلات يومية خاطئة مقابل الحقيقة الأسبوعية 3/6) · تذييل «Arab fitness community»
- **P1/P2 — الفصحى:** تحويل MSA كامل: AffiliateProgramView (المحتوى العربي كله) · for-coaches (الصفحة + COACH_FAQ_AR) · LandingView (البرامج/الأطعمة/الأفلييت/المجاني/أدوات) · tools hub · FoodsExplorer · memberships FAQ + لهجة/أخطاء coaching (بيحلل/بيستناك/ابدأ تحوّلي/المدربين حقيقيين) + توحيد «مكتبة الأطعمة/صنفًا غذائيًا» على السطح العام
- **الحرس:** marketing-msa-surface 4→9 ملفات (+الأفلييت +for-coaches ×2 +tools +FoodsExplorer) + اختباران جديدان: canaries العبارات المنزوعة (~30 عبارة) + canaries صدق الادعاءات (randomuser/500+/testimonialsData/مفاتيح التبديل الميتة) — ملاحظة: الماسح فات أفعالاً بادئة-بـ؛ الكاناريات الحرفية تسد الفجوة حتى درس الماسح
- **البوابات:** tsc 0 · eslint 0/0 · vitest **1078/1078** (+41 عن 192) · next build exit 0 · docs_audit (phase=193) · docs_parity · migration_audit · stale-refs

Stage Summary:
- **التدقيق والتنفيذ مكتملان بنفس الفاز:** أمان الادعاءات مستعاد (صفر شهادات بلا مصدر، صفر أرقام مخترعة، إفصاح إعلاني) + تموضع موحّد + صوت بريميوم فصيح باللغتين على كل الأسطح العامة — Copy-only: صفر مساس بوظيفة/تصميم/مدونة/ميجريشنز
- التوثيق: SEO-GEO-MASTER-PLAN §12.50 (نتائج التدقيق + الخطة + سجل التنفيذ) + STATE.md (المرحلة 193) + هذا السجل
- P2 المؤجلة (موثقة): سلاسل i18n للتطبيق الداخلي (استبيانات/لوحات) بالعامية — سطح داخلية غير تسويقية
- **استدراك التحقق الحي:** الزحف بعد نشر 6e45b93 كشف بقايا خارج coaching/page.tsx لم يغطّها الفحص الأول: preconnect/dns-prefetch لـ randomuser.me في src/app/layout.tsx (كان يُحمَّل على كل زيارة /coaching*) + عنوان coaching/layout.tsx القديم «Coaches & Nutrition Specialists» — أُزيل كلاهما (isCoachingPage حُذف من الـpreconnect router) وعنوان layout أصبح «Professional Coaches & Nutrition Specialists» — نفس البوابات خضراء
- Commit SHA: 6e45b93 (الكود + التوثيق) → استدراك ما بعد النشر
- Push status: pushed (SYNCED على origin/main على 6e45b93 + كوميت الاستدراك)
---
Task ID: PHASE-191-SEO-GEO-12-EXERCISES-AR-IPKEY-LEAK-2026-09-14
Agent: Super Z (main)
Task: أمر المالك «نفذ المتبقى بما تراه مناسب مع العلم رقم ٣ بالفعل طلبت مسح التسريب ويفترض انه تم لذا امسح التحذير بعد التاكد ، ٤ إنذار ip key لا اعلم ما هذا اشرحة ببساطة» — تنفيذ كل بنود «المفتوح الآن» القابلة للتنفيذ + تحقق بندي التسريب وip_key

Work Log:
- بروتوكول §3.6: STATE.md (المرحلة 190 على e759ff4) + AGENTS.md + fetch → SYNCED + آخر مدخلات worklog
- **(بند ٤ — إنذار ip_key): التشخيص الصحيح:** تشغيل migration_audit أكد الإنذار (`NEW phantom columns: ai_plan_usage: ip_key`) ثم التصحيح الجنائي: الـregex **يفهم** `IF NOT EXISTS` منذ زمن — السبب الحقيقي أن 0086 يكتب `ALTER TABLE` و`ADD COLUMN` على سطرين والparse سطري لا يرى ADD — علاجه: نافذة استمرار تدمج السطر الأعزل بتاليه (تتسلسل حتى `;` ولا تعبر حدود `$$`)
- **الإصلاح كشف اندرافاً حقيقياً كان الإنذار الكاذب يحجبه:** `subscription_requests.consumed_at` (بوابة الدليل 0042) — تحقق حي PostgREST: `select=consumed_at` → 200 مقابل عمود وهمي → 42703 — العمود في الإنتاج لكن المرآة types.ts لا تعرفه — أُصلحت Row/Insert/Update + مسار الإدخال المحلي (consumed_at: null كالافتراضي الحي) — و20 سطر أساس محلولة شُذّبت وفق قاعدة نظافة الأداة (البوابة خضراء: صفر اندراف جديد) — Commit 22cb77f
- **(بند ١ — زوج المراجعة): الإسقاط بالقرار المفوَّض:** الجرعة (EN) ↔ التوقيت (AR) سؤالان مختلفان — سجل قرار بنمط 159 في pairs.json (decision: dropped-191) — لا مساس بالإنتاج (لم يُطبق قط؛ التوأمة 14/14 كما هي) — Commit 0b0af7d
- **(بند ٢ — تعليمات التمارين العربية): القياس قبل التنفيذ:** 868 تمريناً = 3,722 خطوة (3,011 فريدة) + 1,736 نصيحة (سلسلتان فريدان فقط) ≈ 89 ألف كلمة — القناة: خط دفعات LLM متسلسل بcheckpoint قابل للاستئناف (فصحى + أمر مذكر + معجم + أرقام كما هي) مع بوابة قبول لكل سلسلة: غير فارغة · صفر لاتيني · تختلف عن المصدر؛ نافذة 429 عولجت بقانون مرونة §8 (انتظار 80 ثانية ينتصر على النافذة بدل إعادة حرقها) — 2,965 سلسلة عبر الخط
- **47 سلسلة منسوقة يدوياً** حيث ظل النموذج يفشل بوابة صفر-اللاتيني (EZ bar/E-Z Curl/V-bar/حرف T-W-V/pvc/fascia/preacher) — بمعجم جلسة 186: البار المتعرج · المقبض المزدوج · حرف التاء/الدبليو/الڤي · أرنولد برس — وخطأ مطبعي واحد (الصقر→الصدر) ضُبط بالمراجعة قبل الحقن
- **الحقن بموضعية parity:** المصفوفة العربية تُبنى موضعاً-موضعاً من instructionsEn (slug-anchored · EN لم يُمس بايت واحد · السلاسل الفارغة الأصلية بقيت فارغة) — بوابات قبل الكتابة: تغطية 100% + صفر لاتيني + لا متطابقة مع المصدر — الحارس الدائم `exercise-instructions-ar.test.ts` (8 اختبارات: الصفر اللاتيني · parity الأطوال · عربية فعلية · النصيحتان الحتميتان · كناري الحادثة · مرايا EN · حجم المكتبة) — Commit 786b990
- **(بند ٣ — التسريب): التحقق الحي عند المزوّدين:** Gemini/GCP → 401 ✓ مُبطل · Groq → 403 ✓ مُبطل (مسح المالك تحقق كما توقع) — لكن **OpenRouter → 200 حي**: `/api/v1/auth/key` يعيد بيانات المفتاح مع استخدام أسبوعي غير صفري، والمستودع عام (تحقق authed: private=False) وكوميتات التسريب (cd1d9d42/36c066b/a776aa8) أسلاف مباشرون لـorigin/main — **تصحيح جنائي موثق:** قول جلسة سابقة «غير موجود في تاريخ main إطلاقاً» كان خطأ (git merge-base --is-ancestor يثبت العكس) — واختبار أول على `/v1/models` اعتُبر لاغياً لأنه endpoint عام (200 حتى بلا مفتاح — عينة ضابطة أثبتته) — التحذير لم يُمسح لأن شرط المالك (بعد التأكد) لم يتحقق إلا ثلثيه: استُبدل «3 مفاتيح» ببند واحد مُحكم: مفتاح OpenRouter + خطوات العلاج بلا توقف (جديد ← Vercel/GHA ← حذف القديم)
- **البوابات:** tsc 0 · eslint 0/0 · vitest **1037/1037** (+8) · next build exit 0 (2,053 صفحة) · docs_audit (phase=191) · docs_parity · migration_audit --ci **PASS** · stale-refs · ui-wiring

Stage Summary:
- **كل بنود «المفتوح الآن» القابلة للتنفيذ أُغلقت:** التعليمات عربية بالكامل (868/868) · زوج المراجعة حُسم (إسقاط) · إنذار ip_key قُتل بجذره + اندراف consumed_at حقيقي كُشف وأُصلح
- تحذير التسريب حُصر في مفتاح واحد حي (OpenRouter) — المفتاحان الآخران مُبطلان ومتحقق منهما حياً؛ العلاج المتبقي مالك خالص (دقيقتان في لوحة المفاتيح)
- سكربتات الجلسة (خارج الريبو): p5_extract · p5_translate (checkpoint) · p5_curate47 · p5_inject · p5_state_update · phase191_leak_verify{,2,3}
- التوثيق: SEO-GEO-MASTER-PLAN §12.48 + STATE.md (المرحلة 191) + README (بند مكتبة التمارين) + هذا السجل
- Commit SHA: 22cb77f (parser+mirror) → 0b0af7d (review pair) → 786b990 (translation) → 5ceab1e (docs) → هذا الالتزام
- Push status: pushed (SYNCED على origin/main) — **التحقق الحي بعد النشر + تنقية CF (purge 200):** /ar/exercises/34-sit-up: خطوات HowTo JSON-LD عربية بالكامل ✓ · خطوات الجسم والنصائح عربية ✓ · صفر إنجليزية في DOM المرئي (الظهور الوحيد للـEN داخل بيانات RSC المسلسلة للمكون ثنائي اللغة — بالتصميم) · /ar/exercises/ez-bar-curl: مصطلح «البار المتعرج» المنسوق حي ✓ · بوابات GitHub الثلاث خضراء على رأس الدفعة: Docs & schema parity ✓ (كانت حمراء بإنذار ip_key) · Quality gate ✓ · stale-refs ✓

---
Task ID: PHASE-190-SEO-GEO-11-RETRO-PAIRING-2026-09-13
Agent: Super Z (main)
Task: أمر المالك «ابدأ تنفيذ المتبقي من التدقيق» — توصية P1-2: استدراك إقران 59 مقالة قديمة بلا توأم (نظام 157 يعمل للجديد فقط) — إغلاق التدقيق الحي العميق بالكامل

Work Log:
- بروتوكول §3.6: STATE.md (189 على bbab1af) + AGENTS.md + fetch → SYNCED + آخر 3 مدخلات worklog
- **قراءة الحالة (Supabase read-only):** 69 منشورة (33 EN + 36 AR) — 10 مقترنة و59 بلا توأم (28 EN + 31 AR) — مطابقة الأرقام مع التدقيق حرفياً
- **المطابقة الكاملة تحت القوانين الحاكمة:** معيار 158 (نفس السؤال الدقيق + نفس الزاوية + نفس الجمهور) + قانون منع الإقران الأعمى (AGENTS §8) + قرار 159 (الأزواج الأربعة المختلفة الزاوية مسقطة — سجل قرار) — عبر العناوين الكاملة + FK + المقتطفات + فحص سلاسل 301 لدمج 178
- **اكتشاف حاسم:** `/ar/blog/sleep-muscle-recovery-gym` (التوأم العربي للزوج المعتمد في 158) يرجّع 301 → `how-many-hours-sleep-for-muscle-growth` — دمج عائلة النوم في 178 هو ما حذف الصف وأفقد الجانب الإنجليزي رابطه — إعادة الربط عبر الخليفة = استعادة زوج معتمد مسبقاً وليست قرار إقران جديد
- **الحصيلة:** زوجان عاليا الثقة (النوم بالاستعادة + السعرات loss+gain كمرآة الزوج المعتمد loss-only) + زوج مراجعة واحد للمالك (جرعة ↔ توقيت البروتين — سؤال أساسي مختلف) + 56 بلا توأم حقيقي بالتصميم + أزواج 159 الأربعة بقيت مسقطة (سلاج أحدها دُمج بعيداً — وُثق في حقل note)
- **التنفيذ عبر القناة المعتمدة (صفر كتابة وكيل مباشرة على الإنتاج):** تحديث pairs.json (زوجان + مراجعة + توثيق الحصيلة في _comment) → commit 6786ba2 → workflow retro-pair-blog.yml: **DRY_RUN** (paired=2 · already=5 · failed=0 · skipped=0) → **APPLY** (paired=2 · **verified=7** · failed=0)
- **التحقق الحي:** قاعدة البيانات 14 مقترنة (كانت 10) — فحص ثنائية الاتجاه 14/14 سليم · تنقية CF (purge_everything) ثم hreflang حي على الصفحات الأربع في الاتجاهين + x-default→EN (مثال: /blog/sleep-better-faster-gym-results يعلن hrefLang="ar" → /ar/blog/how-many-hours-sleep-for-muscle-growth والعكس) — حادثة أثناء التحقق: regex أول أظهر NONE — السبب Next يرسم hrefLang بحرف كبير L — اختُبرت صفحة مقترنة منذ 158 كعينة ضابطة قبل تصحيح التعبير
- **البوابات:** docs_audit (phase=190) · docs_parity · stale-refs · ui-wiring — نطاق الدفعة ملف بيانات أزواج فقط (صفر كود · صفر ميجريشنز)

Stage Summary:
- **التدقيق الحي العميق مغلق بالكامل:** P0-1 (187) · P0-2 (188) · P1-1 + P1-3 + P2-1 (189) · P1-2 (190) — كلها منفذة ومتحققة حياً
- التوأمة الحية 10 → 14 مقالة (+4) بإشارات hreflang كاملة — والمتبقي للمالك: قرار واحد على زوج المراجعة الجديد (الجرعة ↔ التوقيت)
- سكربتات الجلسة (خارج الريبو): p12_list_unpaired.py · p12_validate_slugs.py
- التوثيق: SEO-GEO-MASTER-PLAN §12.47 + STATE.md (المرحلة 190 + خريطة مصادر ملف الأزواج) + هذا السجل
- Commit SHA: 6786ba2 (pairs) → 85f4cb9 (STATE) → d4ae91a (worklog)
- Push status: pushed (SYNCED مع origin/main على d4ae91a)

---
Task ID: PHASE-189-SEO-GEO-10-TITLES-DESCS-CACHE-2026-09-13
Agent: Super Z (main)
Task: أمر المالك «أكمل بندي P1-1 + P1-3 معاً ، وبند p2-1» (مع تسليم مفاتيح Cloudflare للجلسة) — الدفعة الثالثة من توصيات التدقيق الحي العميق بعد 187/188

Work Log:
- بروتوكول الجلسة (§3.6): STATE.md (المرحلة 188 على 0e38f30) + AGENTS.md كامل + fetch → SYNCED + آخر 3 مدخلات worklog
- **مسح حي كمّي (P1-1):** كل مقالات السايت ماب (69) — الخمسة فوق الميزانية (71–77) وكل الـ36 مقالة AR تحمل لاحقة « — Alkemos» في `<title>` · **التحقيق الجنائي بعد النشر فصل الطبقتين:** `og:title` الحي مقصوص/نظيف بينما `<title>` يحمل اللاحقة، وقراءة Supabase المباشرة (read-only بالمفتاح العام) أثبتت أن meta_titles المخزنة نظيفة (60–67 حرفاً) — **الجذر: قالب `/ar/layout.tsx` `"%s — Alkemos"` (11 حرفاً) يلحق بكل عناوين /ar/* الصفحية** وضريبته دفعت الخمسة فوق الـ70
- **(P1-1 أ) الإعفاء من القالب (السهم المباشر):** `title: { absolute: og.title }` في المرآتين EN/AR — عنوان المقال لا يرث أي قالب مستقبلاً؛ القالب يبقى للأسطح القصيرة (tools/hubs/about) حيث يتسع
- **(P1-1 ب) قانون القصّ (ضمانة البيانات):** كتلة SEO-GEO-6.3/181 انتقلت حرفياً إلى `src/lib/blog-meta-title.ts` (صفرية الاعتمادات — نمط exercises-shared في 186) و`blog-pipeline.ts` يعيد التصدير (مصدر واحد) — موصولة في `fetchBlogForOG` (نقطة الخنق لـog/twitter/headline/breadcrumb/بطاقة og-image بالمرآتين) + عنوان المشاركة في BlogArticlePage (مكون عميل) — البيانات المخزنة لم تُمس (نمط 187)
- **(P1-3) الأوصاف الخمسة داخل 158/160:** /about 244→154 · /ar/about 239→150 · /ai-meal-planner 189→156 · /diet-plan 184→154 · /memberships 183→142 (الأسعار من memberships.ts) — جمل مكتملة بلا قصّ منتصف كلمة
- **(P2-1) عبر Cloudflare API بتفويض المالك:** قياس حي: كل الصفحات العامة تصل المتصفح بـ`private, no-cache, no-store` رغم CF HIT (رؤوس next.config headers() تنتصر مع `next start` فقط لا على Vercel الديناميكي) — تحديث قاعدة `alkemos-public-html-cache` (نفس تعبير 149) بإضافة `browser_ttl override 300` عبر PUT لنقطة دخول المرحلة (نقطة القاعدة المفردة ترد 405) مع بقاء edge_ttl 3600 — 300 لقانون نضارة 128/136 (نشرات متعددة يومياً وكاش المتصفح لا يُنقّى) · تنقية purge_everything ناجحة بعد النشر (التوكن الأول يملكها)
- **التحقق الحي لـP2-1 فوراً:** العام (مقالات EN/AR + الرئيسيتان + about + memberships + تمارين + hubs) = `private, max-age=300, must-revalidate` + CF HIT · الخاص (/auth · /admin · /api) بلا كاش كما كان · `/_next/static` immutable سنة — (التوجيه الظاهري private أبقته إعادة كتابة CF؛ المتصفحات تحترمه مع max-age — موثق §12.46)
- **إصلاح حادث CI قائم (القانون: السكربت غير المُرتكب ليس حارساً):** بوابة الجودة حمراء منذ f954e85 — مولّد بطاقات 188 `scripts/generate-og-cards.py` لم يُرتكب قط (بطانية /scripts/* في .gitignore ابتلعته فالحراس تفشل في CI وتمر محلياً حيث الملف موجود على القرص) — استثناء !/scripts/generate-og-cards.py + ارتكاب الملف (فحص أسرار نظيف)
- **الحادثة أثناء التحقق الحي (وثّقت كدرس):** الفرضية الأولى (لاحقة مخزنة) كانت خاطئة — المسح وحده لا يفصل طبقة القالب عن طبقة البيانات؛ الفصل جاء بمقارنة og:title مقابل <title> في نفس الاستجابة ثم قراءة DB — البوابات البعدية (tsc/tests/build) لا تعالج فرضية سبب جذري غير مختبرة
- **الحراس (+12 → 1029/1029):** `blog-meta-title-render.test.ts` — الحوادث الخمس كناريات حرفية (؟ محفوظة) · رمادية تحت الميزانية · الوحدة صفرية الاعتمادات · إعادة التصدير لا التعريف · توصيل الطبقتين · **المرآتان تعفيان المقال من القوالب (absolute)** · قالب /ar باقٍ للأسطح القصيرة
- **البوابات:** tsc 0 · eslint 0/0 · vitest 1029/1029 · next build exit 0 · docs_audit (phase=189) · docs_parity · migration_audit (صفر ميجريشنز — إنذار ip_key الكاذب الموثق قائم) · stale-refs · ui-wiring

Stage Summary:
- تدقيق العميق لم يتبق منه إلا P1-2 (استدراك إقران 59 مقالة — سكربت retro-pair-blog.mjs بالريبو) — P0-1 · P0-2 · P1-1 · P1-3 · P2-1 كلها مغلقة
- P1-1 حل بسهمين من جذر واحد: إعفاء المقالات من قالب العنوان (absolute) + قانون قصّ بيانات دائم بمصدر واحد عبر ثلاث طبقات (المولد p5 + المعالجة 181 + الجلب 189)
- كاش المتصفح: أول تخزين محلي للـHTML في تاريخ المنصة (5 دقائق) فوق كاش الحافة (ساعة) — الأسطح الخاصة محمية بلا تغيير · وCI أخضر ثانيةً بإرتكاب مولّد 188 المفقود
- التوثيق: SEO-GEO-MASTER-PLAN §12.46 + STATE.md (المرحلة 189 + خريطة مصادر القانون) + هذا السجل
- Commit SHA: aa5a74a (السهم 1 + الأوصاف) → e4e4e22 (إصلاح CI: إرتكاب مولّد 188) → 27715c9 (السهم 2: إعفاء المقالات من القالب) → 736a901 (تصحيح التوثيق الجنائي)
- Push status: pushed (SYNCED مع origin/main على 736a901 — CI: بوابة الجودة خضراء (استعادها إصلاح المولّد المفقود) · stale-refs خضراء · بوابة الوثائق حمراء بإنذار ip_key الكاذب الموثق المؤجل دفعة قادمة)
- **التحقق الحي النهائي (بعد نشر 736a901 + تنقية CF):** العناوين الخمسة 67/66/63/62/61 حرفاً بلا لاحقة ✓ · مسح كل الـ69: صفر فوق الميزانية AR وEN ✓ · الأوصاف الخمسة 154/150/156/154/142 داخل 158/160 ✓ · العام max-age=300 والخاص no-store كما يجب ✓

---
Task ID: PHASE-188-SEO-GEO-9-OG-IMAGE-COVERAGE-2026-09-13
Agent: Super Z (main)
Task: أمر المالك «اجل ترجمة التعليمات الى جلسة منفصلة وأبدأ تنفيذ باقى التوصيات» — الدفعة الثانية: توصية P0-2 من التدقيق الحي العميق: تغطية og:image لكل الأسطح الفاقدة (تمارين + أطعمة + hubs + مجموعات + أدوات + فئات مدونة + جذر /ar)

Work Log:
- **مسح المصادر قبل التنفيذ (§3.1):** خريطة كل الأسطح ذات openGraph بلا images: exercises EN/AR (SSG كامل) · foods EN/AR · muscles EN/AR · collections EN/AR (48 بالسايت ماب) · tools ×12 · blog/category EN/AR (بلا twitter أصلاً) · **جذر /ar بلا images نهائياً** (يورث «لا بطاقة» لكل صفحة عربية بلا كتلة خاصة) — جذر EN كان يستخدم /logo.png الخام (بالأبعاد 1200×630 فعلاً)
- **قرار التصميم:** بطاقات ثابتة لكل عائلة بدل ديناميكية لكل كيان — بيانات الأطعمة (3.6MB) والتمارين (1.6MB) أكبر من استيرادها في مسار edge، والثابتة تُقدَّم من CDN بكاش دائم؛ نفس هوية تصميم البطاقة الديناميكية (تدرج #1d1d1f→#0071e3 + دائرة A + Alkemos)
- **(أ) 14 بطاقة PNG 1200×630** في public/images/og/ (7 عائلات × لغتين) بمولد `scripts/generate-og-cards.py` مرفق بأداة الريبو (Pillow + libraqm — تشكيل عربي صحيح + RTL — بخطوط Cairo المستضافة نفسها og-cairo-{400,700}.ttf) · **نصوص خالدة بلا أرقام متغيرة** (868/8830 لا تُخبز في بكسلات لا يفحصها حارس) · تحقق بصري بنموذج رؤية: التشكيل والاتجاه والتخطيط سليمان بلا قصّ
- **(ب) التوصيل (24 مصدر ميتا):** exercises/foods/muscles/collections/blog-category EN+AR · tools (فهرس + 5 حاسبات × لغتين) · جذر AR (بطاقة og-home-ar) · جذر EN (ترقية من /logo.png إلى og-home-en) — كلها openGraph.images كاملة الأبعاد + twitter.images + ترقية summary → summary_large_image (بطاقة summary تتجاهل الصور)
- **(ج) الحراس (+26 → 1017/1017):** og-image-coverage.test.ts — البطاقات الـ14 على القرص · كل سطح يشير لبطاقة عائلته في og+twitter · summary_large_image · لا رجوع لـ/logo.png · مولد البطاقات موجود والنصوص المخبوزة (SPECS) بلا أرقام مكتبة
- **إصلاح أثناء التنفيذ:** سكربت التوصيل أدخل كتلة twitter داخل مصفوفة images في 5 تخطيطات EN (إزاحة regex) — أُصلحت فوراً بنمط بديل محدد + إعادة بوابات كاملة
- **البوابات:** tsc 0 · eslint 0/0 · vitest 1017/1017 · next build exit 0 · docs_audit (phase=188) · docs_parity · migration_audit (صفر ميجريشنز) · stale-refs · ui-wiring
- **التحقق الحي للمرحلة 187 (المكتملة قبيل هذه):** 4/4 مقالات متأثرة تعرض H1 واحداً على الأصل (بما فيها حالة التشكيل AR سعرة/سُعرة) — النسخ القديمة كاش CF مؤقت (~ساعة، يتصل بعيب P2-1 على المالك)

Stage Summary:
- كل الأسطح القابلة للمشاركة صارت تحمل بطاقة اجتماعية معرّفة: 7 عائلات × لغتين + جذر AR الذي كان يورث «لا بطاقة» لكل صفحة عربية بلا كتلة ميتا خاصة
- المولد في أداة الريبو (قابل لإعادة التشغيل عند تغيير الهوية) والحراس تمنع أي تراجع — بما فيها منع خبز أرقام مكتبة متغيرة في النصوص
- البطاقة الديناميكية لكل كيان (طعام/تمرين بعنوانه) موثقة كتحسين مستقبلي (§12.45)
- التوثيق: SEO-GEO-MASTER-PLAN §12.45 + STATE.md (المرحلة 188) + هذا السجل
- Commit SHA: f954e85
- Push status: pushed (SYNCED مع origin/main)

---
Task ID: PHASE-187-SEO-GEO-8-SINGLE-H1-LAW-2026-09-13
Agent: Super Z (main)
Task: أمر المالك «اجل ترجمة التعليمات الى جلسة منفصلة وأبدأ تنفيذ باقى التوصيات» — ترجمة تعليمات التمارين (instructionsAr/tipsAr) تُؤجَّل لجلسة منفصلة بقرار المالك؛ هذه الجلسة تبدأ تنفيذ باقي توصيات التدقيق الحي العميق، أولها P0-1: قانون الـH1 الواحد (22/69 مقالة تعرض `<h1>` مكرراً)

Work Log:
- بروتوكول الجلسة (§3.6): STATE.md قُرئ (المرحلة 186 على fa40a0a) · AGENTS.md قُرئ كاملًا · `git fetch` → SYNCED مع origin/main · آخر 3 مدخلات worklog + آخر 5 كوميتات
- **التحقق الحي قبل الإصلاح (§3.1/§3.7):** مسح حي لكل مقالات السايت ماب (69) — تأكد العيب: 22/69 مقالة بوسمَي `<h1>` (سطر `# العنوان` أول الجسم يتحول في renderMarkdown إلى h1 ثانٍ — `blog.ts` القاعدة `# `) — فحص DOM لمقال حي أثبت أن سطر `# ` هو أول عنصر في حاوية الجسم، والحالة AR `calculate-daily-calories-weight-loss` فرقها تشكيل فقط (سعرة/سُعرة · يومياً/يوميًا)
- **(أ) قانون العارض (الضمانة الدائمة — blog.ts):** قاعدة `# ` في renderMarkdown لم تعد تنتج `<h1>` أبداً — تُخفَّض إلى `<h2>` بنفس معاملة `## ` (id + كلاسات) — أي جسم مستقبلاً لا يستطيع إنتاج H1 ثانٍ مهما كانت البيانات (يشمل معاينة المحرر BlogEditorView)
- **(ب) قص التكرار (blog-msa.ts — نمط 178):** `normalizeHeadingForCompare` (تصغير حالة + نزع التشكيل العربي والتطويل + توحيد الواصلات U+2010–U+2014 + إسقاط الترقيم بما فيه ؟ ، + دمج الفراغات) + `stripTitleHeadingFromBody(md, title)` — تقص السطر الأول غير الفارغ فقط إذا كان `# X` وX يطابق العنوان بعد التطبيع؛ **أمان المحتوى:** سطر لا يطابق العنوان لا يُمس + تكرار وسط الجسم لا يُمس أبداً + `##` غير مؤهل — حتمية idempotent
- **(ج) التوصيل (BlogArticlePage.tsx):** خط المعالجة: FAQ strip (178) ← title-dupe strip (187) ← TOC ← render — الاثنان EN/AR يمران بنفس المكون
- **الحراس (+17 → 991/991):** `blog-h1-single-display.test.ts` — تطبيع التشكيل/الواصلات/الترقيم · قص EN حرفي · قص AR عبر التشكيل (الحالة الحية) · أسطر قائدة · جسم عنوان-فقط · idempotent · أمان المحتوى (سطر غير مطابق يبقى · تكرار وسط الجسم لا يُمس) · `##` غير مؤهل · **العارض لا يخرج `<h1` أبداً — قانون** · wiring القالب + fork guard للمصدر
- **البوابات:** tsc 0 · eslint 0/0 · vitest 991/991 · next build exit 0 · docs_audit (phase=187) · docs_parity · migration_audit (صفر ميجريشنز) · stale-refs · ui-wiring
- **قرار المالك الموثق:** تعليمات التمارين (instructionsAr/tipsAr ~140 ألف كلمة) → جلسة منفصلة (STATE المفتوح الآن) · باقي توصيات التدقيق موثقة للتنفيذ في STATE + §12.44 (P0-2 og:image ← P1-1 العناوين ← P1-3 الأوصاف ← P1-2 الإقران ← P2-1 الكاش على المالك)

Stage Summary:
- **قانون الـH1 الواحد مطبَّق على مستويين:** عارض لا ينتج `<h1>` من الماركداون أبداً (ضمانة بيانات-دائمة) + قص حتمي لسطر العنوان المكرر أول الجسم (بمطابقة مطبَّعة تستوعب فروق التشكيل العربية الحية) — المقالات الـ22 تلتئم عند أول revalidate بلا أي كتابة إنتاج
- **صفر ميجريشنز · صفر كتابة DB:** نمط المرحلة 178 نفسه (معالجة عرض نقية) — خطر إنتاجي معدوم
- **أمان المحتوى مضمون باختبارات:** السطر الأول فقط مؤهل للقص وبشرط مطابقة العنوان بعد التطبيع؛ معاينة المحرر محمية بنفس القانون
- التوثيق: SEO-GEO-MASTER-PLAN §12.44 + STATE.md (المرحلة 187 + المفتوح الآن بخطة التدقيق المتبقية) + هذا السجل
- Commit SHA: 39ab4e5
- Push status: pushed (SYNCED مع origin/main)

---
Task ID: PHASE-186-SEO-GEO-7-ARABIC-EXERCISE-NAMES-2026-09-13
Agent: Super Z (main)
Task: أمر المالك على نتيجة التدقيق الحي SEO/GEO (تمرينات /ar/exercises/* بعناوين تقودها الأسماء الإنجليزية): «لا خلط بين اللغات ، مطلوب حل اخر . وثق النتائج فى الملف الخاص بها وابدا خطة التنفيذ» — حل بديل بلا خلط لغوي + توثيق + تنفيذ كامل

Work Log:
- بروتوكول الجلسة (§3.6): STATE.md قُرئ (المرحلة 185 على 2db439c) · AGENTS.md قُرئ كاملًا · استنساخ نظيف من origin/main · `git fetch` ✓
- **تشخيص السبب الجذري (فحص الكود قبل الحكم):** كود صفحة AR سليم (يبني العنوان من `exercise.nameAr` — سطر 46) لكن **حقل nameAr في البيانات = الاسم الإنجليزي حرفيًا في 868/868 صفًا** (و`instructionsAr`/`tipsAr` كذلك) — «المكتبة ثنائية اللغة» كانت ادعاءً على مستوى الحقول
- **الحل (طبقة البيانات — أثر واحد يُشفي كل الأسطح):** ترجمة بشرية منسوقة لكل الأسماء الثمانمئة وثمانية وستين بمصطلحات الصالات العربية القياسية — نقحرة الحركات وفق قانون 176 (سكوات/ديدلفت/بنش برس/كيرل/كلين/سنتش/جيرك/جوبلت) + ترجمة المعدات والأوضاع (بالبار/بالكيبل/واقفًا/جالسًا/منحنيًا/بقبضة ضيقة/بذراع واحدة) — صفر حروف لاتينية؛ تطبيقها ببرنامج مرساة-بالسلاج (`apply_arabic_exercise_names.py` خارج الريبو: بوابات تغطية 868/868 + صفر لاتيني + تحقق ذهاب وإياب)
- **ما شُفي تلقائيًا بالإصلاح الواحد:** العنوان + H1 + الوصف الميتا + سكيما HowTo + Breadcrumb + alt + بطاقات القائمة + **بحث القائمة العربية** (filterExercises يبحث nameAr — «سكوات» صارت تجد) + **برومبت مولد الخطط** (سطر 1440: كان «Barbell Curl (Barbell Curl)» ازدواجًا — صار ثنائي اللغة حقًا) — محرك مطابقة AI (nameEn سطر 260) لم يُمسّ فلا انحدار
- **MUSCLE_LABELS (17 عضلة — المصدر الوحيد في exercises-shared.ts):** الوصف الميتا كان يحقن العضلات خامًا («العضلات المستهدفة: Abs») — الخريطة تُستخدم في الوصف الميتا + وصف سكيما HowTo + رقائق العضلات في ExerciseDetailClient بمفردات المنصة (البايسبس/الترايسبس/اللات/الترابيس/السمانة)
- **إصلاح عابر موثق:** الـCTA على صفحات التمارين كان باللهجة («عايز خطة…») — فصحى («هل تريد خطة…») + كناري
- **تمييز زوج متطابق:** dumbbell-incline-shoulder-raise مقابل front-incline-dumbbell-raise (اسمان إنجليزيان مختلفان كانا سيترجمان لنفس العربي) — مُيّزا حفاظًا على وحدة الأسماء 868/868
- **الحراس (+11 → 974/974):** `exercise-names-ar.test.ts` — صفر لاتيني في nameAr (868) · لا فارغ/مطابق للإنجليزي · الأسماء العربية فريدة · MUSCLE_LABELS تغطي كل قيم primary+secondary (قيمة جديدة بلا تسمية = فشل بناء) · كل مكونات الوصف العربي لاتينية-صفر لكل تمرين · كناريات الحادثة الحية (جهاز كرانش البطن/سكوات بالبار/بنش برس بقبضة متوسطة) · مرايا EN سليمة · زوج البرومبت ثنائي حقًا · كناري فصحى الـCTA · عقد EXERCISES_COUNT
- **البوابات:** tsc 0 (الأربعة الموثقة لـfor-coaches في clone جديد = قديمة لا جديدة) · eslint 0/0 · vitest **974/974** · docs_audit (phase=186) · docs_parity · migration_audit (صفر ميجريشنز) · stale-refs · ui-wiring · next build exit 0

Stage Summary:
- **قانون «لا خلط لغوي» مُلبّى حرفيًا:** عناوين صفحات التمارين العربية الثمانمئة وثمانية وستين تقود بالعربية بالكامل (عربي أو معرّب — امتثالًا لقانون 176) بلا أي حرف لاتيني واحد — بدل الحل الوسط المرفوض (الإنجليزي + العربي معًا)
- **إصلاح جذر البيانات لا الكود:** كل الأسطح التسعة التقطت الإصلاح تلقائيًا من مصدر واحد (nameAr) + خريطة العضلات أغلقت آخر بؤرة لاتينية في الوصف — ومحرك مطابقة الذكاء الاصطناعي الذي يعمل على nameEn لم يتأثر
- **أثر SEO متوقع:** أطول ذيل عربي في المنصة (868 صفحة) صار يستهدف استعلامات الجمهور الفعلية («سكوات بالبار»، «كيرل هامر»، «ديدلفت روماني») مع فريمة أسماء تمنع تكرار العناوين/H1
- **قرار مالك معلق (المفتوح الآن):** ترجمة تعليمات التنفيذ (instructionsAr/tipsAr إنجليزية في كل المكتبة — ~140 ألف كلمة): قناة AI عبر ai_jobs أو ترجمة منسوقة + أولوية البدء (توصية §12.43: أعلى 100 تمرين في GSC)
- التوثيق: SEO-GEO-MASTER-PLAN §12.43 + STATE.md (المرحلة 186) + README (ادعاء «Arabic + English» صار حقيقيًا — بلا أرقام متغيرة)
- Commit SHA: 5fa6ae6
- Push status: pushed

---
Task ID: PHASE-176-BLOG-REGEN-QUALITY-GAPS-2026-09-11
Agent: Super Z (main)
Task: أمر المالك «افحص منظومة المدونة (لان التعديلات الجديده اختفت مره اخرى) الدليل اخر توليد مقالين» — تشخيص الظاهرة بالبرهان الحي ثم إغلاق الفجوات المكتشفة بالحراس الحتمية (بلا إعادة بناء المحرك)

Work Log:
- بروتوكول الجلسة (§3.6): STATE.md قُرئ (175 مكتملة على 1779577) · استنساخ نظيف · الإنتاج مُتحقق منه حيًا: `/api/build-info` = 1779577 = آخر كوميت — **التعديلات لم تختفِ من الكود أصلًا**
- **تحديد مقالي الدليل (الأدلة الحية):** آخر تولدين اليوم: AR sleep-recovery-gym-results-1bbi (dispatch 06:08 بعد تدهور P0 للفولباك الثابت) + AR best-protein-timing-after-workout (المجدول 05:00، اشتغل 09:22) — ومسار EN (dispatch 05:55) انتهى بـP5 duplicate-en-title (حارس 171 عمل كما صُمم)
- **الفحص الحي للمقالين (fetch الإنتاج):** قوانين 172/173 فعلًا حية فيهما: answer-first حرفيًا ✓ بلا CTA نصي ختامي ✓ صفر لهجة ✓ روابط داخلية ✓ FAQ مرة واحدة ✓ — **لكن اكتُشفت الفجوات الحقيقية التي بدت للمالك كأنها «اختفاء التعديلات»:** (1) 15+ توكن لاتيني سائب داخل النثر العربي (يُ marketed، evidences، shake، casein، simplicity، alkalin، total energy intake...) + الدمج الفاسد «كريAlkaline)» + "vs" داخل H2 — قانون MSA كان يحظر اللهجة والترجمة لا **الخلط اللاتيني**، ولا كاشف حتمي كان موجودًا؛ (2) أسئلة FAQ خارج الموضوع (كرياتين/صيام متقطع/أيض أساسي في مقال توقيت البروتين) لأن splitFaqSection يرفع كل ما كتبه النموذج بلا فلترة + بادئة «السؤال؟» منسوخة حرفيًا في كل بطاقة؛ (3) sleep-1bbi تكرار مفاهيمي رابع (نوم+استشفاء) لأن فولباك P0 الثابت أعاد الموضوع — فحص fresh القديم (0.7 تداخل كلمات) لا يرى التكرار المفاهيمي، والمجموعة 5 موضوعات فقط
- **الإصلاح (أ) — الكاشف اللاتيني الحتمي (blog-msa.ts):** `scanLatinContamination` بحدود كلمات واعية: أسوار الكود تُستثنى · صور Markdown تُستثنى كاملة (alt الإنجليزي قانون IMAGE SOURCE v3) · أهداف الروابط تُحذف والنص المرئي يبقى رقابيًا · الأقواس الاصطلاحية (Whey) مسموحة (اصطلاح MSA) · قائمة بيضاء (Alkemos, EVO, AI, WHO, BMI, mTOR, PubMed, HIIT, kg...) · **قاعدة الدمج الفاسد عربي↔لاتيني (كريAlkaline) تُفحص قبل تجريد الأقواس** لأنها تختبئ داخل قوس اصطلاحي، وبحدود حروف عربية فقط (، ؟ ليست حرفًا — إصلاح false-positive الاكتشف بالاختبار) · بوابة `needsLatinRepair` · **بند لاتيني في validateMsaConversion** (صفر لاتيني بعد التحويل + المقاييس latinBefore/latinAfter) — كل ريبر المقالات القديمة يرثه
- **الإصلاح (ب) — القانون في كل الأسطح (بلا fork):** AR_MSA_EDITOR_LAW (المصدر الوحيد للأدوات والمحرر والرنر) + LANG_RULE.ar (P1+P2+P4) + برومبت المولد الأحادي للكوتش — الثلاثة تحمل بند «ممنوع خلط كلمات إنجليزية/لاتينية سائبة» + أمثلة الإحلال (leucine→الليوسين، marketed→يُسوَّق، vs→مقابل)
- **الإصلاح (ج) — بوابة P4 (AI + تحقق حتمي):** `repairArabicLatinContamination` في blog-pipeline: مسار AI مستهدف واحد بقائمة التوكنات المكتشفة + قواعد الحفاظ الحرفي (روابط/صور/عناوين) + حارس ===CORRECTED=== ثم **validateMsaConversion كاملًا (ctaLinkTolerance=false) + صفر لاتيني** — الفشل يرمي فيعيد runner المحاولة ×3 · يُستدعى فقط عند اكتشاف (صفر كلفة إضافية للمسارات النظيفة) · EN مستثنى
- **الإصلاح (د) — بوابة P5 (آخر خط دفاع، بلا AI حسب عقد المالك):** `filterFaqsByRelevance` على الأسئلة المرفوعة والاحتياطية (research0) — كلمات مشتركة ≥2 مع العنوان+الكلمة المفتاحية **بتطبيع ال التعريف** (البروتين≡بروتين — إصلاح التطابق الحرفي)؛ تلميح مكسور (<2 كلمات) يمرر الكل (لا حذف كاذب) · الإجابات الملوثة لاتينيًا تُحذف · **جسم المقال النهائي: فحص لاتيني حتمي — التلوث يفشل النشر بصدق** (row فاشلة + backstop 23:40 يغطي فتحة اليوم) · faqLifted يُقاس بعد الفلترة + faqRelevanceDropped في الاستجابة
- **الإصلاح (هـ) — منبع P2:** faqBlock لم يعد يفرغ كل أسئلة البحث في برومبت الكتابة — تُفلتر بصلة العنوان (نفس مطابق ensureFaqSection المستخرج `relevantResearchFaqsForTitle` — قانون واحد) · **تجريد بادئة «السؤال؟»** في splitFaqSection عبر `stripFaqQuestionLabel` (مشترك مع رنر التنظيف)
- **الإصلاح (و) — فولباك P0:** مجموعتان مفاهيميتان 15 موضوعًا لكل لغة (تدرج الأوزان، ديلود، تردد التدريب، جيم منزلي، إحماء، كارديو، تحضير وجبات، نحافين، بروتين نباتي...) + **طزاجة جذور المفاهيم**: الموضوع يُعتبر مستهلكًا إن ظهر أي جذر مفهومي في عناوين حديثة (substring — الوسائد العربية وجمع الإنجليزية لا تخفيان التكرار)؛ أقل من 2 طازج = المجموعة المدورة كاملة (المسار لا يموت) — إصلاح حالة 09-11 بالضبط (نوم×4 وسعرات EN)
- **الإصلاح (ز) — رنر التنظيف القديم (legacy-ar-msa.mts):** بوابة الصف = لهجة **أو** لاتيني (ترتيب الخطورة يشمل L) · برومبت التحويل: قاعدة 8 للاستبدال اللاتيني + هدف رقمي «لاتيني سائب = 0 (الحالي: N)» + إصلاح الدمج الفاسد · **وضع FAQ_HYGIENE=1 اختياري**: تمريرة faq_json حتمية بلا AI (تجريد البادئات + فلتر الصلة + حذف الإجابات الملوثة) — الافتراضي OFF يحافظ على عقد كتابة 175 حرفيًا
- **اختبارات (+35 → 666/666):** blog-msa.test: 10 لكاشف اللاتيني (توكنات الحادثة الحية · الدمج الفاسد داخل القوس · vs في العنوان · الاصطلاح (Whey) مسموح · صور/روابط/أسوار/قائمة بيضاء · سطر إنجليزي كامل) + 3 لبند المحول + 3 canaries للقانون والرنر · blog-faq-quality.test: 4 لتجريد البادئة + 4 لفلتر الصلة (حالة البروتين/الكرياتين الحية + التلميح المكسور) + 5 canaries للمسارات · blog-editorial-rules.test: 3 لأسطح القانون + 4 للفولباك (نوم محجوب بسعرات محجوبة + مجموعة كاملة عند الفراغ)
- **البوابات التسع:** bun install --frozen-lockfile ✓ · tsc 0 · eslint 0/0 · vitest 666/666 · next build exit 0 · docs_audit (phase=176) ✓ · docs_parity ✓ · migration_audit --ci ✓ · stale-refs ✓ · ui-wiring ✓
- **النطاق المحترم:** صفر ميجريشنز · صفر إعادة بناء محرك (P0-P5 هيكلًا كما هي) · صفر تعديل checkout/business logic · صفر تعديل بيانات إنتاج من الكود (المقال الملوث يُصلح عبر workflow التنظيف الصريح أدناه) · slug/العناوين/حالة النشر لا تُمس

Stage Summary:
- **ظاهرة «اختفاء التعديلات» مُشخَّصة بالبرهان:** الإنتاج كان على آخر كوميت وكل قوانين 172-175 حية فعلًا في المقالين — الظاهرة كانت ثلاث فجوات غير مغطاة (خلط لاتيني · FAQ خارج الموضوع وبادئة منسوخة · تكرار مفاهيم الفولباك) تُنتج مخرجات تبدو كأنها «النظام القديم عاد»
- **الفجوات مغلقة بحراس حتمية على ثلاث طبقات** (منبع البرومبت + إصلاح P4 المحقق + بوابات P5) — نمط 168 («الحقائق للكود والرأي للنموذج») وقانون 175 (مصدر واحد بلا fork) مطبقان حرفيًا
- مقال الدليل الملوث (best-protein-timing) أُصلح عبر workflow التنظيف المحدَّث · مقال sleep-1bbi تكرار مفاهيمي — توصية مالك معلقة (دمج/حذف)
- المقالات المجدولة غدًا (EN 22:00 UTC · AR 05:00) هي الإثبات التوليدي للقوانين الجديدة

الإغلاق (تحقق ما بعد الدفع):
- **Commits:** decf14a (كود 176 كامل: الكاشف + القوانين + بوابات P2/P4/P5 + الفولباك + الاختبارات 666/666) → 199625e (176.1: توصيل مدخل FAQ_HYGIENE عبر الـworkflow — الـdispatches كانت لا تصل إليه) → 5eb8d83 (176.2: بقعة MSA يدوية للمقال العنيد) — كلها pushed على origin/main
- **CI:** 4/4 على decf14a (quality·parity·guard·supabase-preview) · 5/5 على 5eb8d83 (+msa-cleanup من تشغيلات التنظيف نفسها)
- **تنفيذ إصلاح مقال الدليل (4 dispatches على workflow التنظيف):** (1) APPLY+FAQ_HYGIENE: **وضع FAQ_HYGIENE نظّف faq_json في 38 صفًا** (إسقاط الأسئلة العامة off-topic من مجموعات P0 القديمة 10→2-5 + تجريد البادئات + حذف الإجابات الملوثة) لكن تحويل المحتوى فشل ×4 محاولات (تلف بنية ثم نص تفكير إنجليزي) · (2)+(3) CHUNKED: فشل المقطع 3/9 مرتين (ضغط + تحويل alt الصورة لنثر) — صنف «العنيد» الموثق في 175 · (4) PATCH: بقعة 176.2 اليدوية عبرت المحقق الحتمي و**كُتبت: L 15→0 · كلمات 1195→1208 · reading_time 8→7**
- **التحقق الحي على الإنتاج (مفاتيح كسر كاش فريدة):** marketed/evidences/simplicity/كريAlkaline = صفر · الليوسين/الكازين/مشروب مصل اللبن/مقابل كرياتين ألكالين/يُسوَّق حاضرة · FAQ = 3 أسئلة موضوعية بلا بادئة «السؤال؟» — الكاش الحافة ينضح خلال ≤1 ساعة (سلوك ISR الموثق في 175)
- **DRY حي (12:43 UTC):** 31 مقالة قديمة تحتاج إصلاح لاتيني فقط (bmr/tdee/whey/bcaa/أسماء تمارين إنجليزية/مراسٍ...) — صفر لهجة في الكل (تنظيف 175 صامد) — جاهزة بأمر dispatch واحد (staged) بلا كود جديد
- STATE «آخر كوميت متحقق منه» → 5eb8d83 بالأرقام الحية · المرآة مُزامنة

---
Task ID: PHASE-175-ARABIC-LEGACY-CONTENT-CLEANUP-2026-09-11
Agent: Super Z (main)
Task: أمر المالك «ابدا التنظيف» — تنفيذ توصية 174 المسجلة: تحويل تدريجي للمقالات العربية القديمة إلى الفصحى الحديثة Pan-Arab عبر الأدوات المزوَّدة بقانون MSA (إصلاح لا حذف)

Work Log:
- بروتوكول الجلسة (§3.6): STATE.md قُرئ · SYNCED على 154d3f6 · شجرة نظيفة · تدقيق محلي حتمي (قراءة فقط عبر anon): 23/37 مقالة منشورة تحمل علامات لهجة (عشان/مش/ازاي/كتير/هتلاقي/دلوقتي…) و14 نظيفة — **تصحيح توصية 174:** زوج sleep-recovery-gym-results ليس «مكررًا حرفيًا» (عنوانان مختلفان، 0% تشابه نصي، زاويتان مختلفتان، كلاهما موصول داخليًا) → قرار: صفر حذف، إصلاح الكل
- **البنية (commit 32b4bdc):** `src/lib/blog-msa.ts` (ورقة نقية): AR_MSA_EDITOR_LAW مستخرج نصيًا حرفيًا من محرر الأدات (174 — مصدر واحد بلا fork؛ الكناري يتبع النص) + كاشف لهجات حدود-كلمات (قاعدة false-positives: المشكلة لا تَعُدّ «مش»، زيادة لا تعد «زي») + `validateMsaConversion` (صفر علامات قوية · الضعيفة تتحسن مشروطًا · نسبة كلمات 0.55-1.6 · روابط/صور/عناوين محفوظة · لا «احجز جلس» مضافة) · `scripts/blog-runner/legacy-ar-msa.mts` (runner: queue عبر needsMsaRepair — idempotent · كتابة content/reading_time/updated_at فقط بعد البوابة · خروج صادق 1 عند فشل) · `.github/workflows/legacy-ar-cleanup.yml` (نمط remediate-blog-images: dry_run افتراضيًا + limit + slugs) · +17 اختبارًا
- **التنفيذ المُدرّج (7 dispatches):** DRY_RUN (مطابق محليًا 23/14) → دفعة 1: 2/4 + **إصلاحان جذريان (8fc3780):** ميزانية السلسلة AI_CHAIN_TOTAL_BUDGET_MS=360000 (الوضع الافتراضي 52s كان يقصّ nemotron عند 17 ثانية — نفس قانون blog-post workflows) + رمي السلسلة = إعادة محاولة (30s backoff) لا انهيار → دفعة 2: 5/8 + **175.2 (d2626ca):** رفض المخرجات بلا عربية (نمط nvidia reasoning فارغ) + محاولة رابعة → دفعة 3: 5/8 + **175.4 (d206755):** أهداف رقمية صريحة في البرمبت (عدد الكلمات ±20% · عدد الروابط · عدد الصور) → دفعة 4: 4/8 + **175.5/175.6 (1cbdc23/e2cf39e):** تسامح روابط CTA + محاذاة فقرات + اختبارات مقوّاة (التقطت أحمر قبل CI — درس §3.5 مُعاد) → دفعة 5: 2/7
- **الوضع المجزّأ (175.7-175.9):** تقسيم عند حدود ## وتحويل كل مقطع (برومبت مقطعي + تحقق لكل مقطع ثم للمُجمَّع) — أصلح 2 مقالتين (3pc8 عبر المسار الكامل + best-dynamic-stretching + muscle-building-beginners-step-by-step مجزّأة) · أصلح بالطريق: 0→0 للمقاطع النظيفة + strictLinks للمقاطع غير الأخيرة + سقف مخرجات 1800 (أُعيد لاحقًا 4000 — كان يقطع نماذج reasoning)
- **البقع اليدوية (175.10 — d8027b4):** المقالتان العنيدتان (25+ محاولة AI لكل منهما) حُوِّلتا يدويًا بفصحى كاملة (`scripts/legacy-msa-patches/<slug>.md` — كل الروابط/الصور/العناوين/الجداول محفوظة، نسبة 0.99، فقرات CTA الوسطية حُذفت بقانون 173) عبر وضع PATCH (نفس المُتحقق الحتمي ضد الأصل قبل أي كتابة) — **run أخضر كامل** + جذر آخر مُصلح: منطقة CTA أصبحت قائمة على المحتوى (فقرات تحمل توقيع CTA أينما كانت) لأن «آخر 600 حرف» لم تكن ترى CTA وسط المقال يتبعه disclaimer وFAQ — جذر فشل 5 دفعات متتالية
- **التحقق النهائي:** مسح DB الحتمي: **37/37 صفر علامات قوية، قائمة الإصلاح فارغة** · الإنتاج: 37/37 صفحة 200 والعرض الطازج نظيف (مفاتيح كسر كاش فريدة) · علامات المسح الساذج كانت false-positives سلاسل فرعية (للموظفين→فين، مشوية→شوية، تحليلات→يلا) — موثقة · CI على d8027b4: **5/5 أخضر** · إخفاقات الوسيطة = runs التنظيف نفسها (خروج صادق عند فشل مقالات) لا بوابات الجودة
- **اكتشاف تشغيلي موثّق (بلا تغيير كود):** HTML العام يُخزَّن حافة s-maxage=3600 + SWR (سياسة SEO-GEO-4) — تحديثات محتوى المقالات القائمة تظهر خلال ≤1 ساعة؛ لم يُلحظ من قبل لأن التدفقات العادية تُدرج مقالات جديدة ولا تُحدِّث قائمة

Stage Summary:
- **23/23 مقالة قديمة حُوِّلت لفصحى Pan-Arab كاملة** (18 سلسلة AI + 3 مجزّأ/مسارات + 2 بقع يدوية) — المدونة العربية كلها (37 منشورة) الآن صفر لهجة قوية، والجديد محمي بقانون 173/174/175 (نفس النص عبر blog-msa.ts)
- **صفر حذف** (تصحيح توصية 174 بالبرهان) · صفر ميجريشنز · صفر تعديل slug/عنوان/حالة نشر/صور قديمة · كل فشل أثناء الطريق ترك الصف كما هو (النطاق محفوظ)
- الأدوات باقية قابلة لإعادة التشغيل idempotent: legacy-ar-cleanup.yml (dry/apply/chunked/patch) + validate-patches.mts محليًا
- Commits: 32b4bdc → 8fc3780 → d2626ca → 9b5105b → d206755 → 1cbdc23 → e2cf39e → e5950b2 → ac9b150 → 4f0445e → d8027b4 (كود 175 كله forward-only) · البوابات: tsc 0 · eslint 0/0 · vitest 631/631 · build ✓ · docs_audit (175) · docs_parity · migration_audit --ci · stale-refs · ui-wiring

---
Task ID: PHASE-174-ADMIN-AI-PARITY-AR500-2026-09-11
Agent: Super Z (main)
Task: أمر المالك «افحص توليد مقالات وادوات الذكاء الاصطناعي من صفحة الادمن وتاكد انها تتبع نفس منظومة المدونة، ثم اقترح حل اصلاح للمقالات القديمة ام حذفها؟» — Audit كامل لمسارات توليد المقالات وأدوات الذكاء الاصطناعي في صفحة الأدمن + توحيد أي فجوة مع قوانين المدونة (Phase 172/173) + توصية القديم (إصلاح أم حذف)

Work Log:
- بروتوكول الجلسة (§3.6): STATE.md قُرئ · SYNCED على e061dba · شجرة نظيفة · آخر 3 إدخالات متسقة
- **Audit — مسار التوليد من صفحة الأدمن (BlogAdminView → article_generate):** المسار الأساسي (Phase 162) يوزّع نفس workflows التوليد الآلي (blog-post-{ar|en}.yml — نفس ملفات الكرون اليومي) فيرث كل قوانين 172/173 مجانًا ✓ · مسار الاحتياط (fail-open عند غياب GITHUB_DISPATCH_TOKEN) = مولد المسودة الأحادي runArticleGenerate: فيه MSA Pan-Arab + answer-first + E-E-A-T + fact guard + FAQ بنية المقال + روابط داخلية + قانون صور بلا نساء ✓ لكن فيه **3 فجوات حقيقية** (أصلحها 174 — أدناه)
- **Audit — أدوات الذكاء الاصطناعي الأخرى في الأدمن:** محرر المقالات (15 أداة article_tool: paraphrase/proofread/improve/subheadings/summary/seo_pack/seo_title/meta_desc/faq/cta/منشورات اجتماعية/image_prompt) — image_prompt يحمل قانون 173 للصور ✓ · faq يطلب الفصحى ✓ · **لكن sys prompt للتحويلات النصية لم يكن يحمل قانون MSA** (فجوة) · أزرار الصور (استكمال الناقص /api/blog/fetch-images + suggest-image للمحرر): نفس خط الصور الآمن v3.1 + فحص hasFemaleSubjectSignal في كل المصادر ✓ (لا تلمس الصور المنشورة) · تنظيف النصوص /api/admin/blog/cleanup: find/replace حتمي (ليس AI) ✓ · queue-health رصد فقط ✓
- **🚨 حادث إنتاجي مكتشف أثناء الفحص (P0 — أثبت قبل أي سطر كود):** مسح sitemap-blog.xml الحي: **26/37 مقالًا عربيًا يرجع HTTP 500 على الإنتاج** (كل 31 الإنجليزية 200) — البحث الجذري بالبرهان المتسلسل: (1) reproduce محليًا بـ next build && next start → نفس الـ500 (dev لا يظهره!) · (2) الـstack الحرفي: `TypeError: h.ar.has is not a function` داخل fixCrossLanguageLinkPrefixes · (3) الجذر: fetchPublishedBlogSlugPools (Phase 156) يُغلَّف بـ unstable_cache التي **تُسلسل JSON القيمة المخبأة — Set يتحول إلى {}** فتصبح pools عناصر فارغة بلا .has · (4) المُحفّز: مقالات AR القديمة فيها روابط `](/blog/…)` (عيب 156 المُوثق: 85 رابطًا في ~24 مقالًا) تستدعي callback الاستبدال → crash للصفحة كلها · (5) **برهان الارتباط الكامل:** عدّ الروابط في محتوى كل الـ37 صفًا من DB: 26/26 المكسورة فيها روابط ](/blog/ و11/11 السليمة خالية منها (TP=26 FP=0 FN=0 TN=11) — تعطل منذ نشر 156 (2026-09-09) ولم يُلحظ لأن مقالات التحقق الحي لـ173 (water-intake) بلا روابط EN-prefix
- **الإصلاح (أ) — جذري ثنائي الطبقة:** blog-server.ts: الأساسي المخبّأ fetchPublishedBlogSlugPoolsCached يخزن **مصفوفات نصية JSON-safe** والغلاف المُصدَّر fetchPublishedBlogSlugPools يعيد بناء Sets حقيقية لكل مستدعٍ (نفس واجهة API — صفر تغيير للمستهلكين) · blog-content-sanitize.ts: normalizer دفاعي (toSet/normalizePools) في مدخل fixCrossLanguageLinkPrefixes — أي شكل pools (Set حقيقي / مصفوفة / الـ{} الناتج عن تسلسل JSON / null) يتحول لـSet عامل أو مجموعة فارغة آمنة = خفض مستوى no-op لا 500 أبدًا (عقد الوحدة المُوثق أصلًا)
- **الإصلاح (ب) — فجوة 1 (CTA الختامي في المسار الاحتياطي):** المتطلبات الصارمة في runArticleGenerate كانت تطلب خاتمة بدعوة لاتخاذ إجراء — نفس صنف CTA النصي المكرر الذي أزاله 173 من P4 (الصفحة تعرض البطاقات بعد المقال) — الآن: خاتمة تلخص جوهر المقال فقط + حظر صريح لأي فقرة ختامية تسويقية (نص التعليمة 10 في P4) بالعربية والإنجليزية
- **الإصلاح (ج) — فجوة 2 (قانون MSA لأدوات المحرر):** sys prompt لـ runArticleTool (AR) يحمل الآن قانون الفصحى Pan-Arab كاملًا (حظر اللهجات والعاميات المذكورة بالاسم + حظر الترجمة الحرفية + تصحيح النحو) + **تعليمة تحويل صريحة: نص قديم بالعامية يُحوَّل للفصحى عند إعادة الصياغة** — الأدوات نفسها صارت الرافعة الطبيعية لتنظيف القديم مستقبلًا
- **الإصلاح (د) — فجوة 3 (أداة cta الصادقة):** أداة توليد CTA في المحرر تذكر الآن منتجات Alkemos الحقيقية فقط (عضوية الكوتشينج الشهرية / مخطط الوجبات / الحاسبات المجانية / برامج التدريب) وتحظر نهائيًا صياغة «احجز جلسة» (خدمة غير موجودة — نفس قانون Coach Card في 173)
- **اختبارات:** +11 (المجموع 607): blog-content-sanitize.test.ts: الـrepro الحرفي للإنتاج (JSON roundtrip لـSet→{} لا يرمي + يتحلل no-op) + مصفوفات تعمل + null آمن + Sets الحقيقية بلا تغيير سلوك · blog-editorial-rules.test.ts: 7 canaries لعقود مصدر 174 (حظر CTA الختامي موجود والطلب القديم غائب + MSA للمحرر + cta الصادقة + الخزين JSON-safe والغلاف يعيد Sets + normalizer دفاعي)
- **البوابات:** tsc 0 · eslint 0/0 · vitest 607/607 (+11) · next build exit 0 · **التحقق المحلي على نسخة الإنتاج (next start):** 37/37 مقالات AR ترجع 200 (منها كل الـ26 المكسورة) + مسار cache-hit نفسه 200 + صفحة hiit السابقة تعرض 7 روابط داخلية صُححت من /blog/ إلى /ar/blog/ (عيب 156 يعمل كما صُمم أول مرة منذ نشره!)
- **توصية القديم (سؤال المالك: إصلاح أم حذف؟):** الإصلاح المُتدرّج لا الحذف — البرهان: (1) الـ26 «المعطوبة» لم تكن قديمة رديئة بل سليمة المحتوى معطوبة بباغ عرض قابل للإصلاح (أصلحناه) والحذف كان سيتخلص من 70% المدونة العربية بسبب باج · (2) 68 صفًا منشورًا في sitemap + مخطط الروابط الداخلية يرجع لبعضها (حذفها = 404s متسلسلة) · (3) كلفة التنظيف منخفضة الآن: نفس أدوات المحرر (paraphrase/proofread بفصحى 174) قادرة على تحويل اللهجة + قانون 173 يمنع التلوث الجديد · خطة مقترحة موثقة في STATE: مراجعة عينة → تحويل تدريجي بالأدوات → إعادة فحص — بلا حذف إلا لمقال مكرر حرفيًا (مثل sleep-recovery-gym-results مقابل نسخته -3pc8 المكررة — مرشح دمج/حذف وحيد)

Stage Summary:
- أمر المالك مُنفذ بالكامل: مسارات توليد الأدمن تتبع نفس منظومة المدونة الآن بلا فجوات (3 فجوات أُصلحت بجذرها) + حادث الـ500 الإنتاجي (26 مقالًا عربيًا) مُغلق بإصلاح جذري ثنائي الطبقة + 11 اختبار حارس
- النطاق المحفوظ: صفر إعادة بناء للمحرك · صفر ميجريشنز · صفر تعديل بيانات إنتاج (read-only SELECT فقط) · منشورات ومحتوى قائم لم يُمس · checkout/business logic لم يلمس
- Commit: كود 174 في كوميت واحد (97642de) + docs-close بعده (نمط 172/173) · **التحقق بعد الدفع (2026-09-11):** CI 4/4 أخضر (quality · parity · guard · supabase-preview) · نشر Vercel تلقائي (build-info = 97642de) · **إعادة مسح الإنتاج الكامل: 68/68 مقالاً 200 — صفر فشل (كان 26 عربيًا 500)** · عمق التحقق على creatine-beginners-guide السابقة الكسر: صفحة كاملة 127KB (كانت صفحة خطأ 30KB) بعنوانها و«الأسئلة الشائعة» وروابطها الداخلية الأربع مصححة إلى /ar/blog/ وصفر روابط /blog/ متبقية
- توصية القديم المسجلة: **إصلاح مُتدرّج (تحويل فصحى بالأدوات) لا حذف** — الحذف استثناء وحيد للمكرر الحرفي

---
Task ID: PHASE-173-ARTICLE-QUALITY-UI-2026-09-11
Agent: Super Z (main)
Task: أمر المالك «إصلاح مشاكل جودة المقالات وواجهة المقال» (Audit → Implement → Test → Document → Commit → Push → Verify، بلا إعادة بناء Blog Engine) — 7 نقاط: روابط المحتوى مرئية · إزالة CTA النصي المكرر · Coach Card صادقة · المساحة الميتة قبل FAQ · العربية الفصحى Pan-Arab · عينة القديم توثقًا · + أمر ملكي مطلق: ممنوع النساء في أي صورة جديدة

Work Log:
- بروتوكول الجلسة (§3.6): STATE.md قُرئ · SYNCED على 94b74d8 · شجرة نظيفة · البوابات التسع خضراء في 172
- **Audit بالأدلة قبل أي سطر كود:** (1) تحليل DOM حي (browser على water-intake-athlete-guide الإنتاجية): 5 روابط داخل المتن كلها `muted-2 + no-underline` — محدد `[&_a]:` (specificity 0,1,1) يهزم `text-primary` (0,1,0) للـrenderer · (2) آخر 3 فقرات في المقال الحي: الثالثة = CTA كوتشينج نصي مكرر من التعليمة 10 في برمبت P4 (المصدر الوحيد — P1/P2 لا يطلبانها) · (3) /coaching صفحة حقيقية تبيع عضوية كوتشينج 39.99/شهر عبر checkout?tier=coaching — أي «احجز جلسة» غير موجود كمنتج · (4) قياس مباشر: خانة AdSense = aswift_1_host بـ280px وصفر iframe (غير معبأة) + my-8 = 344px ميتة بين نهاية المقال والـFAQ (زائد تراكم mt-10/my-8/mt-16) · (5) عينة المقالات العربية القديمة: عشان×8 · مش×12 · ازاي×2 · بتاع×2 (baseline) مقابل الخفيف في الجديد (خلاص×2 · حاجة×2) — والجذر الحرفي: LANG_RULE.ar كان يطلب «بنبرة مصرية/خليجية ودّية»!
- **(أ) الروابط مرئية (BlogArticlePage.tsx):** `[&_a]` أصبح أزرق العلامة #0071e3 + underline + decoration 2px بشفافية 40% تكتمل hover + offset 4px + font-medium — تنسيق فقط، صفر تغيير منطق روابط/URLs، بقية التصميم كما هو
- **(ب) CTA النصي (blog-pipeline.ts):** CTA_VARIANTS الخماسي وحقل ctaAdded (type + contract + parsing) أُزيلا بالكامل — التعليمة 10 صارت «أخرج المقال كاملًا بلا أي خاتمة تسويقية — الصفحة تعرض بطاقات CTA بعد المقال» — المقالات القديمة لم تُمس (أمر المالك) والقادمة تنتهي بالخلاصة
- **(ج) Coach Card (BlogComponents.tsx):** «احجز جلسة كوتشينج / Book a session» → «اشترك في الكوتشينج الأونلاين / Join Alkemos Online Coaching» + «اشترك الآن / Join now» + نص يصف عضوية شهرية مرنة — الرابط /coaching كما هو (هي صفحة العضوية الحقيقية — تحقق أعلاه) — checkout لم يُمس
- **(د) المساحة الميتة (AdSenseAd.tsx):** إصلاح جذري لا workaround: مراقبة إشارات تعبئة AdSense الرسمية (iframe داخل ins · data-ad-status="filled") عبر MutationObserver + نافذة سماح 4 ث — الخانة تبقى مرئية أثناءها (الحاوية المخفية تمنع التقديم)، غير المعبأة تُطوى كليًا (hidden = هوامش my-8 تختفي معها)، والتعبئة المتأخرة تعيد الفتح — المعبأة تعرض كما قبل 173 تمامًا
- **(هـ) العربية (3 ملفات):** LANG_RULE.ar (يسري على P1+P2+P4): فصحى حديثة سهلة لكل العرب + حظر صريح للهجات والعاميات المذكورة بالاسم + حظر الترجمة الحرفية والركاكة وأخطاء النحو + مثال «كم من الماء أحتاج يوميًا؟» · blog-research (P0): Pan-Arab MSA · ai-job-processors (مسار الكوتش): نفس القانون في system prompt — بلا قوالب مفروضة (لا repetition)
- **(و) قانون الصور (أمر ملكي مطلق):** ثلاث طبقات صريحة لا negative-prompt وحده: (1) برمبتات التوليد: P1 IMAGE LAW + image_queries contract (AR+EN) + أداة image_prompt تذكر الحظر حرفيًا (رجال بالغون فقط عند الحاجة وإلا مشاهد بلا أشخاص) · (2) تنقية الاستعلام: كلمات أنثوية (EN+AR مع مرأة/امرأة/نساء/فتاة/بنت/سيدة…) تُنزع قبل البحث — بحث غلاف «كم ماء تحتاجه المرأة» لم يعد يستهدف صور نساء · (3) التحقق النهائي: `hasFemaleSubjectSignal` يرفض أي نتيجة alt نصها نسائي في كل المصادر (altTextUnsafe) وكل المسارات (P3 الآلي + suggest-image للمحرر + materialization) — الرفض الكامل = failover للمصدر التالي ثم fallback غير بشري في P3 — الصور المنشورة القديمة لم تُمس
- **اختبارات:** ملف جديد blog-editorial-rules.test.ts (24 اختبار canary: عقود المصدر للقوانين السبعة) + image-safety.test.ts: اختبار «حفظ woman» القديم صار «حفظ man + نزع woman» (قانون المالك الجديد يعلو القديم) + 5 حالات AR_FEMALE أصلح مرأة/امرأة (همزة) — البوابات: tsc 0 · eslint 0/0 · vitest 596/596 (+28) · next build exit 0 · docs_audit phase=173
- **النطاق المحترم:** صفر تغيير في P0-P5 هيكلًا ومحرك الزوايا وFAQ architecture وSEO/schema وميجريشنز وcheckout وروابط داخلية وتوليد الصور خارج الشرط — وأداة cta لمحرر المقالات مستقلة (ليست المكرر) فلم تُمس
- **التوثيق (§3.8 نفس الفريم):** STATE.md → 173 (بحد 100 سطر) + سطر مصدر الحقيقة لقانون الصور + ممنوعات نشطة جديدة + هذا الإدخال

Stage Summary:
- الجودة السبعة مغلقة بجذر مُثبت: روابط مرئية · CTA نصي لن يُولد · Coach Card تبيع المنتج الحقيقي · ~344px ميتة تُطوى عند عدم التعبئة · العربية الجديدة فصحى Pan-Arab (والقديمة موثقة للتنظيف المستقبلي) · النساء مستحيلات في الصور الجديدة (3 طبقات + اختبار حارس)
- المقالات المُجدولة القادمة (EN 22:00 UTC · AR 05:00) هي الإثبات الحي التوليدي الكامل (بلا CTA نصي + فصحى + صور بلا نساء) — التحقق البصري للمكونات الأربعة متاح فور نشر Vercel التلقائي
- مقترح مستقبلي موثق: Arabic Legacy Content Cleanup (جلسة منفصلة بأمر مالك — عينة القديم موثقة أعلاه)
- Commit SHA: 986010b (المهمة كاملة في كوميت واحد: الكود + الاختبارات + التوثيق) · Push: origin/main · **التحقق بعد الدفع (2026-09-11):** CI 3/3 أخضر على 986010b (quality · parity · guard) · **التحقق الحي على الإنتاج (بعد نشر Vercel التلقائي، مقال water-intake-athlete-guide):** (1) الروابط داخل المتن أزرق العلامة rgb(0,113,227) + underline + وزن 500 ✓ (2) خانة الإعلان غير المعبأة مطوية كليًا (hidden · height 0 — كانت 280px+هوامش) ✓ (3) المسافة متن→FAQ صارت 266px شاملة مكوّنات حقيقية (وسوم 94px + مشاركة 36px) بعد أن كانت ~642px ✓ (4) Coach Card: «اشترك في الكوتشينج الأونلاين مع Alkemos» + زر «اشترك الآن» و«احجز جلسة» غير موجودة نصيًا في الصفحة ✓

---
Task ID: BLOG-AUDIT-PROPOSALS-EXECUTED-171-2026-09-10
Agent: Super Z (main)
Task: أمر المالك «نفذ المقترحات كلها» — تنفيذ المقترحات الخمسة المعروضة على المالك في فحص المدونة العميق (BLOG-SYSTEM-DEEP-AUDIT-2026-09-10) بنفس الفريم: (أ) حذف الكود الميت + إخراج blog من برميل data/ · (ب) توحيد المحلل المحصّن 161.5 في مسار الأتوماتيك + مراجعة maxTokens P1 · (ج) إغلاق سباق النشر المزدوج · (د) استكمال .env.example + SECURITY.md · (هـ) تصحيح التعليقات المتقادمة

Work Log:
- بروتوكول الجلسة (§3.6): STATE.md قُرئ أولًا · git fetch — SYNCED على aa65a52 (كوميت الفحص) · آخر 3 إدخالات worklog + آخر 5 كوميتات متسقة · شجرة نظيفة
- **(أ) حذف الكود الميت:** git rm لـ`src/lib/blog-generate.ts` (1249 سطرًا — المولد الأحادي القديم بصيغته الأولى: chunks EN/AR + بحث خارجي + روابط + old word floors — صفر مستوردات في الإنتاج والاختبارات — آخر من لمسه rebrand 121) + `src/lib/data/blog.ts` (43 سطرًا — listBlogPosts() بلا لغة + getBlogPost(slug) — لا مستورد لها: كل المستهلكين الأحياء على `@/lib/blog` بتوقيعات اللغة) — `export * from "./blog"` خارجًا من برميل `src/lib/data/index.ts` مع ملاحظة القانون — تعليق ai-job-processors (parity with blog-generate) صُحح للإشارة للمسار الأحياء — **7 معرفات محظورة في stale-refs**: src/lib/blog-generate · generateArticleBundle · generateEnglishArticle · generateArabicArticle · generateExternalResearch · lib/data/blog · parseJSONLoose — الإحياء ممنوع CI-level دون أمر مالك جديد
- **(ب) توحيد المحلل:** كل مواضع parseJSONLoose الستة (blog-research P0 · blog-pipeline ×4: pickTopicIndex/P1 outline/P2 content/P4 review · blog-pairing parsePairingJSON) صارت تستدعي **parseJSON المحصّن من ai-provider.ts** (161.5: نزع أسوار + استخراج من النثر + إصلاح القطع + تهريب أحرف التحكم الخام داخل النصوص) — نفس قانون استرجاع JSON للمسارين (الكوتش كان محصّنًا منذ 161.5 والأتوماتيك كان يستخدم strict+regex فقط — فجوة الفحص رقم 3) — **maxTokens P1 2600→4000** بتعليق الأدلة الحية (3 تشغيلات EN فاشلة «P1 en: invalid outline JSON from openrouter:nvidia/nemotron-3-ultra-550b-a55b:free» في 09-06/07/09 ×3 محاولات — نموذج reasoning يحرق CoT خفيًا فيقطع JSON المخطط قبل اكتماله)
- **(ج) إغلاق سباق النشر المزدوج (فجوة الفحص رقم 4 — أهم تغيير سلوكي):** ثلاث طبقات حتمية:
  1. **طبقة الموزع** (`dispatch-pipelines/route.ts` + نواة نقية في `blog-pipeline-dispatch.ts`): فترة سماح 90 دقيقة (الفتحة «متوقعة» بعد ساعتها بـ90 د — تأخير جيت هاب الموثق 30-90 د لا يُفسَّر فتحة مفقودة — expectedSlotsThrough نقية) + **التغطية = أقصى(تشغيلات غير فاشلة اليوم، مقالات منشورة فعليًا اليوم)** (postsTodayFor: عدّ blog_posts بالغة اليوم — تحلل لـnull عند تعطل DB فيرجع لعدّ التشغيلات) — النواة النقية computeTopUp مختبرة (18 اختبارًا)
  2. **طبقة P5** (`p5-publish/route.ts` + `blog-queue.ts`): صف آلي (bundle بلا coachRequested) يرفض نشر مقال ثانٍ بنفس يوم UTC للغته → skipped_daily_quota (نمط dupSkip نفسه) — الإسناد ليوم **إنشاء الصف** (countAutomatedPublishedToday: صفوف status=published أُنشئت اليوم — تشغيل متأخر ينشر بعد منتصف الليل لا يأكل فتحة الغد) — يتحلل مفتوحًا عند تعطل DB (لا يحجب النشر بعطل بنية تحتية)
  3. **علامة الكوتش**: P0 يختم `bundle.coachRequested: true` عند (موضوع كوتش ≥10 أحرف) أو (?job_id= من PIPELINE_JOB_ID — يربطه run-step.mts الآن للـURL) — الأزواج المتبناة/المنضمّة بواسطة تشغيل كوتش تُوسم أيضًا (markQueueRowCoachRequested best-effort) — صفوف الكوتش معفاة من حارس P5 (تجاوز مالك 162: طلب المالك مقالًا = المقال ينشر حتى لو اكتملت حصة اليوم الآلية) — العلامة تنجو عبر P1-P4 (كل خطوة تنشر bundle بمبدأ التمديد {...bundle})
  4. **كرون Vercel** (vercel.json): dispatch-pipelines 23:00 → **23:40 UTC** (بعد اكتمال سماح EN 22:00+90=23:30 بـ10 دقائق — الموزع لا ينظر قبل أن تكون نافذة التأخير قد أُغلقت تمامًا)
- **(د) التوثيق البيئي:** .env.example أُضيف له NVIDIA_API_KEY (عنوان قسم AI صار «ثلاثة مزودين» — كان يقول «مزودان فقط» متقادمًا منذ 161) · SUPABASE_SERVICE_ROLE_KEY (server-only محذر) · CRON_SECRET · GITHUB_DISPATCH_TOKEN · PEXELS_API_KEY/UNSPLASH_ACCESS_KEY/PIXABAY_API_KEY (قانون الصور v3) · EVO_FOLLOWUP_ENABLED (+EVO_FOLLOWUP_FROM/EVO_CRON_SECRET اختياريان) · NEXT_PUBLIC_SITE_URL — ملاحظة البحث صارت تذكر المزودين الثلاثة — SECURITY.md §2.1 (ما يُعد سرًا: المزود الثالث + مفاتيح الصور + التوكن) و§3.1 (تحديث 2026-09-09: ثلاثة مزودين + getNvidiaKey) — كل القيم فارغة (§3.2)
- **(هـ) التعليقات المتقادمة:** run-step.mts (تعليق الميزانية 180000→360000 للمدونة/480000 لprocess-ai-jobs + NVIDIA_API_KEY ضمن المطلوبة + قانون الصور v3 في الاختيارية + PIPELINE_JOB_ID موثقًا) · تعليقا workflow «Optional image-provider fallbacks (pollinations is keyless)» في blog-post-en/ar.yml → «IMAGE SOURCE LAW v3» (Pexels أساسي مطلوب + Unsplash/Pixabay احتياط — pollinations متقاعد)
- **النسخ (§3.8 — نفس الفريم):** README (سطر البراند يشير لوحدات الأنابيب الحية بدل blog-generate + وصف كرون 23:40 بقانون السماح وP5 + سطر الإيقاع يوثق فرض 119 في طبقة النشر) · DEVELOPER_GUIDE (شجرة src بلا blog-generate + مسار الكوتش الحقيقي 162 بدل التدفق اليدوي المتقاعد generateArticleBundle/generate-article + الموزع 23:40 + صف الجدول الزمني بلا مسار links/social الميت + مثال kebab-case) · AGENTS.md §8 SCHEDULE HEALTH LAW (الباك ستوب 23:40 + السماح + التغطية + فرض P5) · docs/CI_GATES.md (الظهر المستقل 23:40 بقانونه) · STATE 171 (72 سطرًا) · worklog (هذا الإدخال) — ملفات تاريخية مجمدة (_AUDIT لقطة 2026-08-25) لم تُمس
- **البوابات التسع (§3.5):** tsc 0 · eslint 0/0 · vitest **540/540** (44 ملفًا — 522 + 18 جديدة: blog-daily-quota.test.ts يغطي قانون السماح 90 د والتغطية القصوى وحالات سباق 09-05 الحرفية والعلامة النقية) · next build exit 0 · docs_audit ✓ (phase=171 · 72 سطرًا) · docs_parity ✓ · migration_audit --ci صفر انحراف جديد · stale-refs ✓ (يشمل المعرفات السبعة الجديدة) · ui-wiring ✓

Stage Summary:
- المقترحات الخمسة منفذة كاملة بأمر المالك — الفجوة الأولى (المولد الميت القابل للإحياء) والثانية (برميل data/ المتصادم) والثالثة (المحلل غير الموحد) والرابعة (سباق النشر المزدوج) والخامسة (فجوة التوثيق البيئي) والسادسة (التعليقات) كلها مغلقة
- القانون 119 (مقال آلي واحد/يوم/لغة) صار **مطبقًا في الكود** في ثلاث طبقات بدل الاعتماد على الجدولة وحدها — سلوك الكوتش لم يتغير (معفى عمدًا كتجاوز مالك)
- الحدود الموثقة: يوم المنشور (published_at) قد يظهر مقالين عابرين للمنتصف لكن يوم إنشاء الصف هو المحتسب — صفوف skipped_daily_quota تبقى سجلًا في الطابور — يوم بمقال كوتش قد لا يُعوّض إن ضاعت فتحته (الحصة مقضية بأي مقال)
- Commit SHA: 3d043f3 (feat(blog): Phase 171 — ALL FIVE deep-audit proposals executed)
- Push status: pushed (aa65a52..3d043f3 على origin/main)
- **التحقق الحي بعد الدفع (3d043f3):** CI 3/3 أخضر (quality · parity · guard — 14:11 UTC) · الإنتاج alkemos.com على 3d043f3 (build-info · نشر آلي) · /blog 200 · sitemap-blog يخدم مع hreflang · المسارات المعدولة fail-closed 401 بدون CRON_SECRET (dispatch-pipelines + p5-publish + p0-research — الموزع يعمل على الكود الجديد) — أول فتحة تعمل بالقانون الجديد: AR 05:00 UTC غدًا · أول باك ستوب بالسماح الجديد 23:40 UTC الليلة

---
Task ID: BLOG-SYSTEM-DEEP-AUDIT-2026-09-10
Agent: Super Z (main)
Task: أمر المالك «ابداء فى عمل فحص عميق و دقيق جدا لمنظومة المدونة بعمق والتاكد من عدم وجود توثيقات او ملفات قديمة لها تعيق العمل الحالى او تغير التعديلات (حدث اكثر من مره ان تختفى تعديلات جديده وتعود المنظومة الى أنظمة سابقة)» — فحص عميق قراءة-فقط لمنظومة المدونة + التحقق الحي — بلا أي تغيير سلوكي (المقترحات معروضة على المالك أدناه)

Work Log:
- بروتوكول الجلسة (§3.6): STATE.md قُرئ أولًا · git fetch — SYNCED على ece6ad9 · آخر 3 إدخالات worklog + آخر 5 كوميتات متسقة · استنساخ نظيف + bun install --frozen-lockfile
- **خريطة المنظومة الحية (كلها v3 سليمة):** 6 مسارات p0→p5 تحت /api/cron/blog (كلها بالقوانين الحية: author=Ahmed Zake 0075 · Pexels-first v3 · ONE-SLUG-LAW عبر slugifyAscii/resolveSlug · tool-links · embedBodyImages) · run-step.mts/sh (تهريب queueId + backoff 120s×n) · workflowان blog-post-{en,ar}.yml (cron 22:00/05:00 UTC · budget 360000 · معاملة الكوتش 162) · backstop dispatch-pipelines (23:00 UTC) · blog-pairing + P0 كامل (ADOPT ≤48h · JOIN ≤30h · CREATE + double-dispatch guard + سلّم تدهور ليجاسي) · مسار الكوتش article_generate يرسل الـworkflow نفسه (162) والمولد الأحادي داخل ai-job-processors (161.4/161.5)
- **(ملاحظة 1 — خطر إحياء فعلي، الأهم في الفحص): `src/lib/blog-generate.ts` (1249 سطرًا) كود ميت كامل** — المولد الأحادي القديم بصيغته الأولى (chunks EN/AR + بحث خارجي + روابط + old word floors) — لا يستورده أي ملف إنتاج ولا اختبار (المولد الحي = runArticleGenerate داخل ai-job-processors.ts) — آخر من لمسه rebrand 121 (تغيير نصوص فقط) — مخالفة §3.8 («الكود الميت يُحذف بنفس الفريم — git يحفظ») وخطر النمط الذي وصفه المالك: أي وكيل يبحث عن توليد المقالات قد يجد generateArticleBundle/generateEnglishArticle/generateArabicArticle/generateExternalResearch فيعيد توصيل نظام التوليد القديم فوق الجديد
- **(ملاحظة 2 — تصادم أسماء عبر البرميل): `src/lib/data/blog.ts` (43 سطرًا) طبقة بيانات المدونة القديمة** — listBlogPosts() بلا معامل لغة وgetBlogPost(slug) — مُصدَّرة عبر برميل `@/lib/data` الذي تستورده 5 صفحات أدمن حية — النسخة الحية بنفس الاسمين تعيش في `@/lib/blog` بتوقيعات مختلفة (lang/category/search) — استيراد من البرميل القديم يُعيد نظام القراءة القديم بصمت (RLS-safe لكن بلا فهرسة القائمة/اللغة) — البقية داخل data/ سليمة (RPCs حية عبر البرميل)
- **(ملاحظة 3 — فشل P1 حي وموثق بالأدلة): تحصين 161.5 لم يصل مسار الأتوماتيكي** — تشغيلات GitHub الحية: EN فشل 3 مرات بـ«P1 en: invalid outline JSON from openrouter:nvidia/nemotron-3-ultra-550b-a55b:free» (09-06 dispatch · 09-07 dispatch · **09-09 SCHEDULED — فتحة اليوم نفسها**، ×3 محاولات لكل تشغيل) — الجذر: P0/P1/P2/P4 كلها تتحلل عبر `parseJSONLoose` (blog-research.ts:55 — strict + regex فقط) بينما parseJSON المحصّن (تهريب أحرف التحكم + إصلاح القطع، 161.5) يعيش في ai-provider.ts ويستخدمه مسار الكوتش فقط — نفس عائلة حادثة 161.5 لكن في الجهة الأتوماتيكية + maxTokens P1 2600 مع نموذج verbose
- **(ملاحظة 4 — سباق النشر المزدوج ضد قانون 119):** backstop 23:00 UTC يفحص runsToday فورًا في ~23:02 — تأخر cron المجدول المسائي (GitHub يؤخر 30-90 دقيقة دائمًا) يجعل الفتحة تبدو مفقودة → dispatch إضافي → مقالان/يوم — مثبت حيًا من blog_posts: EN نشر مقالين 09-05 (23:07 + 23:33) ومقالين 09-04 · AR مقالين 09-04 (09:28 + 14:40) — حراسة P5 (duplicate-title) لا تمنعه (موضوعان مختلفان) وحارس P0 double-dispatch لا يغطي التتابع بعد النشر
- **(ملاحظة 5 — فجوة توثيق §3.2/§3.8):** .env.example ينقصه NVIDIA_API_KEY (مزود ثالث منذ 161) · PEXELS_API_KEY (مطلوب fail-fast منذ قانون الصور v3) · PIXABAY/UNSPLASH · GITHUB_DISPATCH_TOKEN · CRON_SECRET · EVO_FOLLOWUP_ENABLED — وSECURITY.md §3.2 يذكر مزودين اثنين فقط (NVIDIA غير موثق) — README يذكرها لكن ليس مكانها القانوني
- **(ملاحظة 6 — تعليقات متقادمة صغيرة):** run-step.mts سطر 10 يقول «set to 180000» (الفعلي 360000 منذ 119) · تعليق workflows «pollinations is keyless» (المصدر متقاعد بقانون الصور v3 — المفاتيح الفعلية Pexels/Unsplash/Pixabay)
- **حادثة bun.lock (09-08 17:21 → 09-09 11:14) محلولة بPhase 160** — لكن أثرها الحي: فتحة EN ليوم 09-08 ضاعت كاملة (صفر مقالات EN يوم 09-08 — تشغيلا 23:02/23:46 فشلا في Install dependencies)
- **التحقق الحي:** الإنتاج على ece6ad9 (build-info ✓) · CI على ece6ad9 = 4/4 (quality · parity · guard · Supabase Preview) · workflows ال12 كلها active (لا de-registration) · الاقتران الثنائي حي: 24 رابط hreflang في sitemap-blog (زوج اليوم: EN calculate-daily-calories-fuel-fat-loss-bulking 09-09 17:17 ↔ AR calculate-daily-calories-weight-loss 09-10 09:29 — ADOPT اشتغل) · 66 منشورًا · AR اليوم منشور 09:29 · فتحة EN الليلة 22:00 UTC
- **الأرشيف والتوثيق التاريخي سليم:** PROGRESS/QA مجمدان بعلامات 🧊 واضحة · _AUDIT.md/_NAV_MAP.md لقطات موسومة HISTORICAL SNAPSHOT 2026-08-25 (يحوي إشارات generate-blog-post.yml القديم كسجل — خطر منخفض بعلامة الرأس) · INDEX.md 0001→0083 مطابق للملفات (0072 المكررة = stub محاذاة ليدجر موثق 0072L) · remediate-blog-images.yml وretro-pair-blog.yml = dispatch-only idempotent (قرار منتهي موثق)
- **البوابات التسع (§3.5):** tsc 0 · eslint 0 · vitest **522/522** (43 ملفًا) · docs_audit ✓ · docs_parity ✓ · migration_audit --ci PASS صفر انحراف جديد · stale-refs ✓ · ui-wiring ✓ · (next build غير ضروري — تغيير docs-only)
- **تشخيص ظاهرة «اختفاء التعديلات» تاريخيًا (كلها موثقة سابقًا ومحروسة الآن):** (1) مسارات Vercel-AI متقاعدة عملت بالتوازي مع بدائلها 2026-08-27 → وُلد stale-refs · (2) run-step.mts أعفى step1-pick بعد تقاعد v1 · (3) تفكك قرص البيئة المؤقتة أثناء جلسة 2026-09-05 (ملفات اختفت من شجرة العمل — §3.6 قانون البقاء) · (4) GitHub de-register للمجدولات (SCHEDULE HEALTH LAW + backstop) · (5) انجراف bun.lock/npm (141/160) — **الفجوة المتبقية غير المغطاة بحارس: الملفات غير المستوردة (ملاحظتا 1+2) — الحارس يفحص المعرفات المحظورة لا الأيتام**

Stage Summary:
- المنظومة الحالية v3 + الاقتران 157 + معاملة الكوتش 162 كلها سليمة معماريًا ومطابقة للتوثيق — لا يوجد نظام قديم «يعمل بالتوازي» اليوم
- المقترحات المعروضة على المالك (بترتيب الأولوية — التنفيذ يحتاج أمرًا ملكيًا وفق §3.4/§12.10): (أ) حذف blog-generate.ts + إخراج blog من برميل data/ (نفس الفريم مع النسخ — git يحفظ) · (ب) توحيد المحلل: نقل تحصين 161.5 (parseJSON) إلى مسار الأتوماتيك P0/P1/P2/P4 + مراجعة maxTokens P1 مع النموذج المتسبب · (ج) إغلاق سباق النشر المزدوج في dispatch-pipelines (فترة سماح أو عدّ المنشور الفعلي بدل عدّ التشغيلات) · (د) استكمال .env.example + SECURITY.md بالمفاتيح الناقصة · (هـ) تصحيح التعليقات المتقادرة (180000/pollinations)
- صفر تغيير سلوكي في هذا الفريم — إدخال توثيقي فقط (docs:)
- Commit SHA: f422b12 (pre-amend — fixup pattern 105-117)
- Push status: pushed

---
Task ID: EVO6-CANCEL-AND-AUDIT-FIXES-170-2026-09-10
Agent: Super Z (main)
Task: أوامر المالك «مطلوب الغاء فكره api الشركاء ، ثم نفذ باقى مقترحاتك واصلح التوثيقات» — إلغاء EVO-6 كليًا + إغلاق فجوتي درع الأزمة وبوابة النوايا (ملاحظتا الفحص العميق 1+2) + إصلاح الانحراف التوثيقي (ملاحظة 4) — ملاحظة 3 (حد معدل الشركاء) سقطت بإلغاء السطح نفسه

Work Log:
- بروتوكول الجلسة (§3.6): STATE.md قُرئ أولًا · git fetch — SYNCED على f419fdf · آخر 3 إدخالات worklog + آخر 5 كوميتات متسقة
- **إلغاء API الشركاء (أمر المالك):** git rm لـ12 ملفًا — `/api/evo/v1/chat` · `/embed/evo.js` + `/embed/widget` + EmbedEvoChat · `/api/admin/evo-partners` + `/admin/evo-partners` + AdminEvoPartnersView · `evo-partner.ts` + `evo-embed-script.ts` + اختباراهما (39 اختبارًا) · `docs/EVO-PARTNER-API.md` — تعديلات: AdminShell (إدخال «شركاء EVO» خارجًا) · next.config (استثناء /embed خارجًا من lookahead الكاش العام) · EvoWidgetLazy (حارس /embed خارجًا — استُعيدت الصورة الأصلية ما قبل 169) · types.ts (تعريف الجدولين خارجًا)
- **ميجريشن 0083** `20260912130000_0083_evo6_partner_api_rollback.sql`: إسقاط idempotent — `evo_api_usage` أولًا (FK) ثم `evo_api_keys` — يطبق تلقائيًا ببوابة معاينة Supabase مع الدفع · INDEX.md: صف 0083 + ملاحظة إسقاط على صف 0082 + العنوان 0001→0083
- **migration_audit.py — معالج drop table جديد (قانون Phase 105 نفسه):** إسقاط الجدول من مجموعة التوقع — كشف جانبي: gh_sync_probe حُل تلقائيًا (DROP في 0056) فقُصّ سطره من ACCEPTED_MISSING_TABLES وفق قانون نظافة الأساس المطبوع
- **حارس stale-refs:** 14 معرفًا ملغى أُضيف للنمط المحظور (المسارات + الوحدات + EVO_PARTNER_API_ENABLED + الجدولان) — الإحياء ممنوع CI-level
- **إغلاق فجوة درع الأزمة (ملاحظة الفحص 1 — 5 من 8 صيغ كانت تصل النموذج):** `evo-safety.ts` — عائلات عربية: «مش عايز/عاوز/+مؤنث/ناوي اعيش» · «زهقت من الحياة/حياتي» · «مش عايز/عاوز اكمل في الحياة/حياتي» · «لا أريد أن أعيش» — عائلات EN: do not/don't/dont want to live **anymore** (+ be here anymore) · wish I was/were dead · want to be dead — حدود الدقة موثقة بالكود: EN تتطلب anymore («I don't want to live in Cairo» شكوى سكن) والعربية تتطلب المفعول الوجودي (اعيش/من الحياة/في الحياة/حياتي) — +4 اختبارات (17 في الملف)
- **إغلاق فجوة بوابة النوايا (ملاحظة الفحص 2 — 9 من 10 صيغ كانت تتجاوز البوابة):** `evo-intent.ts` — (أ) الأمر مذكر/مؤنث + لي/لى ملتصقة أو مفصولة («اعملي/اعمللي/اعمل لي/صممي/أنشئ لي/جهز») (ب) الرغبة («عايز/عاوز/+ة/محتاج/محتاجة/بدي/أريد/نفسي في» + المفعول) (ج) «ممكن» بفعل اختياري («ممكن تعمللي خطة»/«ممكن خطة») (د) المستقبل «ه/ح تعمل» + EN want/need — كل نمط يتطلب مفعول خطة صريحًا فالاستفهامية («إزاي أعمل بنش بريس؟») خارجها — +5 اختبارات (18 في الملف)
- **إصلاح الانحراف التوثيقي (ملاحظة 4):** STATE أُعيد كتابته للمرحلة 170 — توثيق أن EVO_FOLLOWUP_ENABLED مفعّلة حيًا منذ 166.1 (كانت STATE تقول «بانتظار المالك») · إدخال 169 ضُغط لسجله التاريخي (سطحه أُلغي) · المفتوح الآن: خطوة المالك الوحيدة = إزالة EVO_PARTNER_API_ENABLED الميتة من Vercel
- **النسخ (§3.8 — نفس الفريم):** AGENTS.md (EVO-6 PARTNER API LAW → REMOVED بسجل الأمر الملكي) · README (ميزتا الشركاء خارجًا + بند EVO موسع بالبوابتين المقويتين — FEATURE README LAW) · DEVELOPER_GUIDE (صفّا المسارين خارجًا) · EVO-MASTER-PLAN (W6 ملغاة + صف الجدول + القرار 5 مسحوب) · STATE 170 (85 سطرًا) · INDEX.md 0083 · types.ts
- **البوابات التسع محليًا (§3.5):** tsc 0 (بعد stub next-env.d.ts — نمط 141.1) · eslint 0/0 · vitest **522/522** (552 − 39 ملغاة + 4 درع + 5 نوايا) · next build exit 0 (لا مسارات شركاء في الخريطة — /api/evo/followup و/admin/evo-analytics يبقيان) · docs_audit (phase=170 · 85 سطرًا) · docs_parity (0001→0083) · migration_audit --ci PASS صفر انحراف جديد · stale-refs ✓ · ui-wiring ✓ (63 هدف / 74 مسار)

Stage Summary:
- API الشركاء أُلغي كليًا (كود + embed + أدمن + جداول 0082 عبر 0083 + توثيق) — إلغاء محروس بحارس stale-refs ولا إحياء دون أمر مالك جديد
- درع الأزمة يغطي الآن الصيغ الخمس المثبتة حيًا بالفحص + متغيراتها الصرفية — حدود دقة موثقة ومختبرة (كلام الجيم/الدايت/السكن لا يشعل)
- بوابة النوايا تفرض حصص الخطط خادميًا حتمًا على الصيغ العربية الشائعة (الأمر/الرغبة/ممكن/المستقبل) — الاستفهامية خارجها
- evo-cache-server.ts نجا من الإلغاء عمدًا (وحدة الكاش المشتركة لمسار الشات الرئيسي)
- EVO_PARTNER_API_ENABLED متغير ميت — يزوله المالك من Vercel (خطوة توثيقية اختيارية)
- التحقق الحي بعد الدفع (a5da85f): CI 3/3 أخضر · الإنتاج على a5da85f (build-info) · ميجريشن 0083 مطبق حيًا — PostgREST: evo_api_keys/evo_api_usage = 404 PGRST205 (مسقوطان) بينما evo_chat_cache/evo_call_stats = 200 (سليمان) · مسار الشركاء غير موجود (/api/evo/v1/chat → x-matched-path /_not-found · /embed/evo.js → 404) · درع الأزمة حي: «مش عايز اعيش» و«I wish I was dead» يردان الرد الثابت (لا نداء نموذج) · بوابة النوايا حية: «اعملي خطة اكل» مجهولًا = رد subscriber-gate حتمي بروابط
- Commit SHA: a5da85f
- Push status: pushed (a5da85f على origin/main — f419fdf..a5da85f)
---
