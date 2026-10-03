# VERCEL-BACKUP-MIGRATION-PLAN-2026-10-03.md — خطة النسخة الاحتياطية على حساب Vercel الجديد

> **المصدر:** أمر المالك 2026-10-03 «ابدأ الآن بمرحلة Audit + تجهيز خطة تنفيذ النسخة الاحتياطية فقط» — Phase-aware ID: `VERCEL-BACKUP-MIGRATION-PLAN-2026-10-03` (worklog.md).
> **النطاق الحاكم:** نسخة احتياطية **قابلة للتشغيل والتحقق فقط** — **ليس** نقل Production. لا DNS cutover · لا فصل دومين · لا حذف/تعديل للحساب القديم · لا تدوير أو حذف Secrets · لا تغيير Cloudflare/Supabase/GitHub · **لا تنفيذ لأي خطوة من هذه الخطة دون أمر مالك لاحق**.
> **قانون الأسرار (§7 + `docs/RECOVERY-SECRETS-SOURCES.md`):** هذا الملف يحمل أسماء ومصادر فقط — **صفر قيم**. أي متغير مستقبلي يُضاف للنسخة يوثَّق مصدره في `RECOVERY-SECRETS-SOURCES.md` بنفس الفريم.
> **المرجعية عند التعارض:** الواقع المقيس عبر API في تاريخ هذا الفريم هو الحاكم (ملاحظة B9 مثالًا: `serverlessFunctionRegion` في API يعرض `iad1` بينما `vercel.json` هو المرجع الحاكم `fra1`).
> **سجل التنفيذ:** البند §8-2 (نقل متغيرات البيئة القابلة للقراءة آليًا) نُفّذ بأمر المالك 2026-10-03 «نفّذ الآن فقط البندين» — سجل التنفيذ والتحقق في §12. كل خطوة أخرى في هذه الخطة ما زالت تنتظر أمر مالك.

---

## 1. الوضع الحالي — Production (الحساب القديم، لا يُمس)

| البند | الحالة المقيسة (2026-10-03) |
|---|---|
| الحساب/الفريق | `muscleshubfit` · فريق `muscleshubfit-2941s-projects` (vercel.com/muscleshubfit-2941s-projects) · **خطة Hobby** (مؤكد من metadata النشر) |
| المشروع | `alkemos` · مربوط بـ GitHub App على `muscleshubfit-cpu/alkemos` · Production Branch: `main` · Node 24.x · framework `nextjs` |
| آخر نشر Production جاهز | `4cf5c4bc` (READY · PROMOTED) يحمل كل الأسماء: `alkemos.com` · `www.alkemos.com` (301) · `musclehubeg.vercel.app` (301) · الأسماء التلقائية للفريق |
| Crons (من `vercel.json` — المرجع الوحيد) | `/api/cron/progress-reminder` أحدًا 07:00 UTC · `/api/cron/dispatch-pipelines` يوميًا 23:40 UTC |
| الإعدادات المميزة | Web Analytics **مفعّل** · Speed Insights **معطّل** · gitForkProtection · OIDC مفعّل (غير مستخدم كوديًا) · لا Deploy Hooks · `ignoreCommand` + `[vercel skip]` يعملان (شاهد: آخر docs-commit أنتج نشرًا CANCELED بلا خدمة) |
| DNS/Cloudflare (zone-level — تبقى كما هي) | A `alkemos.com` → `76.76.21.21` (proxied) · CNAME `www` → `cname.vercel-dns.com` (proxied) — **كلاهما Vercel-generic لا يعتمد على حساب** · 3 قواعد كاش + قاعدة زواحف اجتماعية + BLOCKLIST-1 · SSL Full(strict) · MX Zoho + DKIM Brevo + SPF/DMARC |
| Supabase (لا يتغير) | مشروع واحد `wyopqryzfjifyeyvyxfy` (eu-central-1) · site_url `alkemos.com` · SMTP Brevo · redirect_allow_list يتضمن نمط `alkemos-*-muscleshubfit-2941s-projects.vercel.app/**` (مرتبط بفريق **القديم**) |
| GitHub Actions | 25 workflow نشطة · 15 سرًا · متغير واحد `SITE_URL` · الاعتماد الوحيد على Vercel القديم: سر `VERCEL_TOKEN` (توكن project-scoped يخدم `vercel-cleanup`) |

## 2. ما تم تجهيزه بالفعل — الحساب الجديد (فحص قراءة فقط عبر API)

تم بيد المالك قبل هذا الفريم، وتأكد قياسًا:

- حساب Vercel جديد (username `alkemos`) + فريق **`aalkemos`** (vercel.com/aalkemos) — الدور OWNER.
- مشروع **`alkemos`** جديد: framework `nextjs` (مكتشف تلقائيًا) · **Node 24.x مضبوط أصلًا** · `gitForkProtection` مفعّل · OIDC مفعّل (الوضع الافتراضي).
- **Git integration مربوط**: org `muscleshubfit-cpu` · repo `alkemos` · **Production Branch: `main`** · `gitProviderOptions.createDeployments: enabled` (الدفع إلى main سينشر تلقائيًا ما لم تُطبق آلية §6).
- Build/PM settings: `vercel.json` في المستودع هو المرجع (`next build` · `bun install` · regions `fra1` · headers · ignoreCommand) — لا يحتاج أي ضبط يدوي إضافي.
- **الحالة الحالية المثالية للعزل**: صفر deployments جاهزة (`targets: {}` — النشر الوحيد CANCELED من دفعة docs) · متغيرات البيئة: **نُقل 29/29 مدخلًا قابلًا للقراءة آليًا (§12) وبقيت 8 يدوية (MANUAL_REQUIRED — §12.2)** · صفر crons مسجلة (endpoint يرد not_found) · **لا integrations مثبتة على الفريق الجديد** (واجهة Vercel تعرض اقتراح ربط Supabase — **لا تُفعّل**؛ انظر §3-B7).
- نطاق المشروع التلقائي: `alkemos.vercel.app` (متاح ومحجوز للمشروع الجديد) · لا نطاقات مخصصة · لا team domains.

## 3. ما ينقص قبل أن تصبح النسخة قابلة للتشغيل والتحقق

| # | البند | التفصيل |
|---|---|---|
| A1 | **Environment Variables** (الجدول §4) | **منفّذ جزئيًا 2026-10-03 (§12)**: 29/29 مدخلًا قابلًا للقراءة نُقل آليًا بنفس الأسماء/الأهداف/الأنواع وتحقق قيم 29/29 (فك تشفير من الجديد نفسه ومقارنة). الباقي: 8 قيم Sensitive يدوية (§12.2). **شرط البناء**: `NEXT_PUBLIC_*` تُدمج وقت البناء — أول نشر كامل الميزات ينتظر الإدخال اليدوي لـ `NEXT_PUBLIC_PAYPAL_CLIENT_ID` و`NEXT_PUBLIC_ADSENSE_CLIENT` (GA وSupabase العام نُقلا آليًا) |
| A2 | **إستراتيجية منع نشر Production تلقائيًا** | مع `createDeployments: enabled` + Production Branch `main`: أول دفعة كود إلى main تنشئ أول Production Deployment في الحساب الجديد → **تسجيل الـ crons → خطر التشغيل المزدوج** (التفصيل والحل في §6) |
| A3 | **أول Preview Deployment + بطارية تحقق** | §7 — لم يحدث أي نشر بعد |
| A4 | **Web Analytics** | غير مفعّل في المشروع الجديد (بيانات التحليلات لا تنتقل — تبدأ من صفر عند التفعيل؛ يُوصى بها وقت cutover لا قبله) |
| A5 | **مؤشر استخدام الحساب الجديد** | النسخ الاحتياطية اليومية تتراكم (Hobby 10GB · ~350MB/نشر · انتهاء تلقائي 30 يومًا + الاحتفاظ بـ10) — يُراقب ولا يُعدّل شيء الآن |
| B1 | **قيم PayPal اليدوية** | `PAYPAL_CLIENT_ID` · `PAYPAL_CLIENT_SECRET` · `PAYPAL_WEBHOOK_ID` · `PAYPAL_MODE` · `NEXT_PUBLIC_PAYPAL_CLIENT_ID` — من لوحة PayPal Developer (مصادرها في `RECOVERY-SECRETS-SOURCES.md` §2.2) |
| B2 | **قيمة AdSense اليدوية** | `NEXT_PUBLIC_ADSENSE_CLIENT` — من لوحة AdSense |
| B3 | (مؤجل بقرار المالك — **لا يُنفذ الآن**) تحديث `redirect_allow_list` في Supabase | إضافة نمط الفريق الجديد `https://alkemos-*-aalkemos.vercel.app/**` (+ `https://alkemos.vercel.app/**`) — شرط اختبار auth على preview؛ Production غير متأثر |
| B4 | (وقت cutover مستقبلًا) استبدال سر `VERCEL_TOKEN` في GitHub | بتوكن جديد من الحساب الجديد (project-scoped يكفي) — **لا يُلمس الآن** وإلا فقد `vercel-cleanup` هدفه (المشروع القديم) |
| B5 | (توصية مالك) فحص انتهاء `BACKUP_REPO_TOKEN` | الإجراء اليدوي الموثق في `RECOVERY-SECRETS-SOURCES.md` §4 — خارج نطاق هذه الخطة |
| B6 | **عدم تفعيل تكامل Vercel↔Supabase** | Production الحالي لا يستخدمه (env vars فقط). أي «ربط مباشر» من واجهة Vercel قد يقدم إنشاء مشروع Supabase جديد — **ممنوع**؛ النسخة تستهدف نفس المشروع `wyopqryzfjifyeyvyxfy` عبر env vars فقط |
| B7 | **عدم ضبط متغيرات اختيارية غير مضبوطة أصلًا** | `UNSPLASH_ACCESS_KEY` · `PIXABAY_API_KEY` (مصادر failover اختيارية) · `COACH_EMAILS` (للكود افتراضي معلوم) · `NEXT_PUBLIC_APP_URL` · `AI_PROVIDER/AI_MODEL/AI_BASE_URL` · `LATIN_REPAIR_LEGACY` · `GROQ_MAX_TOKENS_CLAMP` (أذرع rollback فارغة) — تركها فارغة = نفس سلوك Production الحرفي |

## 4. جدول Environment Variables المصنّف (أسماء فقط — صفر قيم)

> الأهداف (targets) في العمود تعكس ضبط **المشروع القديم** بالضبط — النسخة تعيد إنتاجها كما هي (production/preview/development).

### 4.1 قابلة للنقل آليًا (غير مصنفة Sensitive — قابلة للقراءة عبر API بفك تشفير per-env، أو لها نسخة في GitHub Actions Secrets)

`NEXT_PUBLIC_SUPABASE_URL` (prod+preview+dev) · `NEXT_PUBLIC_SUPABASE_ANON_KEY` (prod+preview+dev) · `SUPABASE_SERVICE_ROLE_KEY` (prod+preview+dev) · `SUPABASE_URL` (prod — alias يعرفه سكربتات التشغيل) · `CRON_SECRET` (prod+preview+dev) · `PEXELS_API_KEY` (prod+preview+dev) · `OPENROUTER_API` + `OPENROUTER_API_KEY` (prod+preview) · `GROQ_API_KEY` (prod+preview) · `NVIDIA_API_KEY` (prod) · `BREVO_API_KEY` (prod) · `EMAIL_FROM` · `EMAIL_REPLY_TO` (prod) · `GITHUB_DISPATCH_TOKEN` (prod) · `UPSTASH_REDIS_REST_URL` + `UPSTASH_REDIS_REST_TOKEN` (prod+preview) · `NEXT_PUBLIC_GA_ID` (prod) · `EVO_CRON_SECRET` · `EVO_FOLLOWUP_ENABLED` · `EVO_FOLLOWUP_FROM` (prod) · `NEXT_PUBLIC_SITE_URL` (prod+preview — قيمة ظاهرة غير سرية: `https://alkemos.com`)

**مسارات النقل المشروعة (كلها بأمر مالك لاحق):** (أ) نسخ يدوي من لوحة المشروع القديم (القيم ظاهرة في الواجهة) — الأسرع والأبسط؛ (ب) سير عمل مؤقت في GitHub Actions يقرأ الأسرار ويعيد بذرها في المشروع الجديد عبر API دون أن تراها عين بشرية (النمط الموثق في `RECOVERY-SECRETS-SOURCES.md` §1-2)؛ (ج) مفاتيح Supabase كلها قابلة لإعادة الجلب من لوحة المشروع نفسه أو Management API.

### 4.2 تحتاج إدخالًا يدويًا (مصنفة Sensitive في Vercel — **لا يمكن قراءتها عبر API إطلاقًا**)

`PAYPAL_CLIENT_ID` · `PAYPAL_CLIENT_SECRET` · `PAYPAL_WEBHOOK_ID` · `PAYPAL_MODE` · `NEXT_PUBLIC_PAYPAL_CLIENT_ID` (جميعها prod+preview) · `NEXT_PUBLIC_ADSENSE_CLIENT` (prod+preview)

> المصادر الدقيقة لكل قيمة: `docs/RECOVERY-SECRETS-SOURCES.md` §2.2 (لوحات PayPal Developer وAdSense). **Webhook URL في PayPal مرتبط بالدومين `alkemos.com` لا بمشروع Vercel** — لا يحتاج أي تغيير الآن.

### 4.3 لا يجب نقلها الآن (متغيرات ميتة موثقة — `RECOVERY-SECRETS-SOURCES.md` §3)

`SUPABASE_JWT_SECRET` · `SUPABASE_SECRET_KEY` · `SUPABASE_PUBLISHABLE_KEY` · `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` · `SUPABASE_ANON_KEY` (الصيغة الخادمية) · `EVO_PARTNER_API_ENABLED` (ميزة EVO-6 أزيلت — **إحياؤها انتهاك لبوابة guard-stale-refs**)

> نقل هذه القائمة يخلق نسخة موسخة من Production؛ تركها = بيئة أنظف وأقرب لسلوك الكود الفعلي. (تنظيفها من **القديم** بقرار مالك — خارج نطاق هذه الخطة.)

## 5. مخاطر تشغيل المشروعين معًا (تحليل)

1. **Double Cron (الأخطر — مواجه المستخدم):** لحظة تكوّن أول Production Deployment في الحساب الجديد تُسجَّل crons في المشروعين:
   - `progress-reminder` (أحدًا 07:00 UTC): **إشعارات/بريد مكرر يصل عملاء حقيقيين**.
   - `dispatch-pipelines` (يوميًا 23:40 UTC): نداءان على GitHub — منطق التغطية (runs-today + posts-today) يجعل النداء الثاني عادة no-op، لكن نافذة السباق بين نداءين متزامنين قد تُرسل dispatchًا مكررًا لفترة مدونة (تصدّه بوابات الحصة/التكرار في المسار — لكنه ضجيج قابل للتفادي كليًا بقانون §6).
2. **نشر تلقائي مزدوج على كل دفعة:** المستودع واحد والـ GitHub App مربوط من الحسابين → كل push كودي إلى main ينشر Production في القديم **و**Production في الجديد (مع تسجيل crons) — ما لم تُطبق §6.
3. **Storage/Usage:** كل نشر يحجز ~350MB فورًا (قانون VERCEL-USAGE) — الحساب الجديد يبدأ نظيفًا (10GB Hobby) لكن `vercel-cleanup` (التوكن الحالي) ينظف **القديم فقط**؛ تراكم previews الجديدة يُدار بانتهاء 30 يومًا التلقائي + مراقبة، وبعد أي cutover مستقبلي يُعاد توجيه التوكن.
4. **GitHub Actions لا تتضاعف:** مدونة/النسخ/المهام تعمل في GitHub ضد Supabase مباشرة — لا تتأثر بوجود نسخة Vercel (المشروعان يخدمان نفس الواجهات لكن Jobs واحدة في GitHub).
5. **النطاقات:** `alkemos.com` لا يمكن إضافته للمشروع الجديد وهو مرتبط بالقديم (domain conflict) — الحماية الطبيعية ضد «cutover بالخطأ»؛ لا DNS يتغير لأن السجلات Vercel-generic.

## 6. طريقة منع Double Cron / Double Jobs (القانون المركزي)

> **القاعدة المقيسة:** Crons تُسجَّل وتعمل ضد **آخر Production Deployment** للمشروع. المشروع الجديد الآن `targets: {}` (صفر Production Deployments) → **صفر crons ممكنة**. Preview Deployments **لا** تنشئ Production Deployment → **لا تسجل crons**.

- **6-A (المسار الموصى به — «نسخة دافئة»):** ضبط Production Branch للمشروع الجديد على فرع عنصر نائب (مثل `backup-staging` — يُنشأ من main ولا يستقبل أي كود) → كل دفعة إلى main تنشر **Preview** في الجديد (تبقى النسخة متزامنة مع كل تغيير Production) بينما Production يبقى حصريًا للقديم → **لا crons إطلاقًا**.
- **6-B (البديل — «نسخة باردة»):** تعطيل نشر Git على المشروع الجديد (`gitProviderOptions.createDeployments: disabled` من إعدادات المشروع) → لا نشر تلقائي إطلاقًا؛ النشر يدوي فقط (`vercel deploy` preview) وقت التحقق الدوري.
- **قوانين صارمة مكملة (أي مسار):**
  1. **ممنوع `vercel --prod`** أو «Redeploy» كـ Production أو أي دفعة إلى فرع الـ Production للمشروع الجديد قبل يوم cutover معلن.
  2. دفعات docs-only تحمل `[vercel skip]` (قانون VERCEL-USAGE-6) → نشر CANCELED بلا خدمة في **الحسابين** (شاهد مقيس: آخر docs-commit أنتج CANCELED في القديم).
  3. بعد كل نشر preview: تحقق أن المشروع الجديد ما زال بلا Production Deployment/crons (لوحة المشروع أو API).
  4. أي نشر إنتاجي اضطراري في الجديد (لا يتصور حاليًا) يعني تفعيل §5-1 فورًا: إزالة الـ crons من الجديد بتعليق سطرين في `vercel.json` بنفس الفريم — لا يُترك أبدًا مشروعان بنش crons نشطة.

## 7. خطة Preview Verification (آمنة — صفر مساس بـ Production)

**شروط مسبقة:** §4.1/§4.2 مضبوطة (لا سيما `NEXT_PUBLIC_*`) + §6 مطبق + التوكنات في مكانها.

1. **إطلاق preview:** من نسخة نظيفة من `main`: `vercel deploy` (بلا `--prod`) أو دفع فرع تحقق — النتيجة URL بالنمط `alkemos-<hash>-aalkemos.vercel.app` محمي بـ Standard Protection (تسجيل دخول مالك الحساب الجديد).
2. **بطارية الدخان (مرآة بطارية RESOURCE-AUDIT-CLOSE):** `/api/build-info` (نفس commit SHA لنشر Production القديم وقتها) · الصفحة الرئيسية EN + `/ar` 200 · `sitemap.xml`/`robots.txt`/`llms-full.txt`/`rss.xml` · صورة OG عينة · `/api/cron/*` ترد **401** (fail-closed) · مقارنة هيدرز الأمان/الكاش مع Production (من `vercel.json` — متطابقة بالوراثة).
3. **إثبات env وقت البناء:** HTML يحمل Supabase URL/client keys وGA ID (NEXT_PUBLIC مدمجة)؛ مكونات PayPal تظهر عند ضبط قيمها اليدوية.
4. **اختبار auth على preview (اختياري ومؤجل):** يتطلب تحديث `redirect_allow_list` في Supabase (§3-B3) — تغيير على Supabase لا يُنفذ إلا بأمر مالك في فريم التحقق.
5. **فحص ما بعد التحقق:** crons = 0 · لا Production target · Usage الجديد ضمن الحدود.
6. **تنظيف:** حذف نشر الـ preview بعد التحقق (يحرر التخزين) — لا أثر على أي مستخدم.

## 8. خطوات جعل النسخة الاحتياطية جاهزة (دون Cutover) — للتنفيذ لاحقًا بأمر مالك

1. إدخال قيم §4.2 يدويًا من اللوحات (المالك).
2. نقل §4.1 — **منفّذ 2026-10-03 (§12)**: المسار (ب) وكيل بأمر مالك عبر API (نقل آلي 29/29 مدخلًا + تحقق قيم — شمل بأمر المالك مفاتيح §4.3 القابلة للقراءة أيضًا؛ انظر §12.4-2).
3. تطبيق §6 (6-A موصى به).
4. أول preview deployment + بطارية §7 كاملة + توثيق نتيجتها في worklog وتحديث عمود حالة هذا الملف في `docs/README.md`.
5. (اختياري وقت cutover لا قبله) تفعيل Web Analytics.
6. **المراقبة الدورية:** صفر crons · صفر production targets في الجديد · Production القديم يخدم `alkemos.com` كالمعتاد · usage الحسابين سليم.
7. النسخة تبقى «دافئة»: كل push إلى main يحدّث preview الجديد تلقائيًا (مسار 6-A) — جاهزية دائمة دون أي تدخل.

## 9. خطة Rollback لهذه المرحلة

- **النسخة الاحتياطية قابلة للإلغاء الكامل بلا أي أثر:** حذف المشروع الجديد (أو فصل Git فقط) لا يمس Production/DNS/Cloudflare/Supabase/GitHub — لأن شيئًا منها لم يتغير.
- أي rollback أعمق غير مطلوب في هذه المرحلة (لا يوجد cutover). خطة rollback الـ cutover المستقبلية: §10/§11.

## 10. شروط مستقبلية — فقط عند اضطرارنا لنقل Production (سيناريو Pause في الحساب القديم)

**المُفعِّل الوحيد المفترض:** إيقاف/تعليق الحساب القديم (Hobby overage pause مثلًا) أو أمر مالك صريح بالنقل. عند تحققه فقط، وبترتيب «فرع مخصص»:

1. تجميد الدفعات إلى main (نافذة هادئة بعيدة عن 23:40 UTC و07:00 UTC أحدًا).
2. المشروع الجديد: Production Branch يعود إلى `main` → نشر Production أول (أو `vercel --prod`) من نفس commit آخر نشر جاهز.
3. تحقق `build-info` على `alkemos.vercel.app` (نفس SHA).
4. فصل `alkemos.com`/`www` من المشروع القديم (**إن كان الحساب القديم متاحًا**؛ إن كان مقفولًا/معلقًا: تذكرة دعم Vercel لتحرير الدومين — هذه بالضبط القيمة التأمينية للنسخة الاحتياطية).
5. إضافة الدومينين للمشروع الجديد (www كـ redirect 301 كما في القديم؛ اختياريًا `musclehubeg.vercel.app`) — **لا تغيير DNS** (السجلات generic).
6. تحقق فوري على الدومين ثم Purge كاش Cloudflare (edge TTL يصل 43200s — المحتوى نفسه لكنها خطوة صحية).
7. استبدال سر `VERCEL_TOKEN` في GitHub بتوكن الحساب الجديد (يعيد توجيه `vercel-cleanup`) + تحديث `redirect_allow_list` في Supabase إن لزم للـ previews.
8. مراقبة 48 ساعة (crons تشتغل من الجديد وحده · Jobs · صفحات · مدفوعات) قبل أي قرار على القديم.

## 11. قائمة التحقق النهائية قبل أي Cutover مستقبلي

- [ ] §4.1 ✓ منفّذ (§12: 29/29 بنفس الأسماء والأهداف والقيم) + §4.2 إدخال يدوي بالمالك (8 قيم MANUAL_REQUIRED — §12.2) — البند يكتمل بإدخالها.
- [ ] بطارية §7 خضراء على آخر commit Production.
- [ ] §6 ما زال مطبقًا (صفر crons/production في الجديد) حتى لحظة الـ cutover نفسها.
- [ ] نافذة زمنية بعيدة عن جدولا الـ crons.
- [ ] `redirect_allow_list` (Supabase) محدث بنمط الفريق الجديد (عند الحاجة للـ previews).
- [ ] نسخة احتياطية من آخر deployment قديم جاهزة للعودة (`4cf5c4bc` أو أحدث) + خطة عكس الخطوات موثقة.
- [ ] Purge كاش Cloudflare بعد التبديل.
- [ ] سر `VERCEL_TOKEN` في GitHub مستبدل ومُختبَر (تشغيل `vercel-cleanup` يدويًا dry-run).
- [ ] مسار دعم Vercel جاهز (إن كان القديم مقفولًا والدومين محتجزًا).
- [ ] مراقبة 48 ساعة خضراء قبل أي تفكيك للحساب القديم (المحذوف أبدًا قبل انتهائها).

## 12. سجل تنفيذ نقل متغيرات البيئة (2026-10-03 — أمر المالك «نفّذ الآن فقط البندين»)

> **ما نُفّذ في هذا الفريم:** البند 2 من §8 فقط (نقل متغيرات البيئة القابلة للقراءة آليًا إلى المشروع الاحتياطي) + هذا التوثيق. **لم يُنفّذ أي شيء آخر:** لا نشر Production (إنشاء متغيرات البيئة لا يشغّل أي بناء — مقيس)، لا DNS، لا cutover، لا Cloudflare، لا Supabase، لا تعديل كود. **المشروع القديم لم يُمس** (قراءة فقط — مقيس ببصمة المداخل قبل/بعد).

### 12.1 ما نُقل فعليًا — 29/29 مدخلًا آليًا (نفس المفتاح/الأهداف/النوع حرفيًا)

النقل عبر Vercel API: قراءة القيم من المشروع القديم بفك التشفير per-env (المصدر)، والإنشاء في المشروع الجديد بتوكن الفريق الجديد — **بنية مدخلات مطابقة حرفيًا للقديم** (25 مفتاحًا فريدًا = 29 مدخلًا؛ التفصيل في 12.4-1):

| المفاتيح | Targets (كما في القديم) | النوع |
|---|---|---|
| `CRON_SECRET` · `PEXELS_API_KEY` · `SUPABASE_SERVICE_ROLE_KEY` | production+preview+development | encrypted |
| `NEXT_PUBLIC_SITE_URL` | production+preview | **plain** (كما في القديم — قيمة ظاهرة غير سرية `https://alkemos.com`) |
| `OPENROUTER_API` · `OPENROUTER_API_KEY` · `GROQ_API_KEY` · `UPSTASH_REDIS_REST_URL` · `UPSTASH_REDIS_REST_TOKEN` | production+preview | encrypted |
| `NEXT_PUBLIC_SUPABASE_URL` | production · preview · development — **ثلاثة مداخل منفصلة** (كما في القديم) | encrypted |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | production · preview · development — **ثلاثة مداخل منفصلة** (كما في القديم) | encrypted |
| `NEXT_PUBLIC_GA_ID` · `NVIDIA_API_KEY` · `BREVO_API_KEY` · `EMAIL_FROM` · `EMAIL_REPLY_TO` · `GITHUB_DISPATCH_TOKEN` · `EVO_CRON_SECRET` · `EVO_FOLLOWUP_ENABLED` · `EVO_FOLLOWUP_FROM` · `EVO_PARTNER_API_ENABLED` | production | encrypted |
| `SUPABASE_URL` · `SUPABASE_ANON_KEY` · `SUPABASE_PUBLISHABLE_KEY` · `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | production | encrypted |

### 12.2 ما بقي — 8 قيم MANUAL_REQUIRED (مصنفة Sensitive في القديم: لا تُقرأ عبر API إطلاقًا)

| المفتاح | Targets في القديم | المصدر/الحالة |
|---|---|---|
| `PAYPAL_CLIENT_ID` | production+preview | لوحة PayPal Developer (`RECOVERY-SECRETS-SOURCES.md` §2.2) |
| `PAYPAL_CLIENT_SECRET` | production+preview | نفس المصدر |
| `PAYPAL_WEBHOOK_ID` | production+preview | نفس المصدر (الـ Webhook مرتبط بالدومين `alkemos.com` لا بمشروع Vercel — لا تغيير مطلوب) |
| `PAYPAL_MODE` | production+preview | نفس المصدر |
| `NEXT_PUBLIC_PAYPAL_CLIENT_ID` | production+preview | نفس المصدر — **يُدمج وقت البناء** (لا تعمل مكونات PayPal في أي نشر قبل إدخاله) |
| `NEXT_PUBLIC_ADSENSE_CLIENT` | production+preview | لوحة AdSense — **يُدمج وقت البناء** |
| `SUPABASE_JWT_SECRET` | production | MANUAL_REQUIRED تنفيذًا للأمر — **بترتيب §4.3: متغير ميت موثق؛ التوصية عدم إدخاله إطلاقًا** (الإدخال بلا أثر وظيفي؛ القرار للمالك) |
| `SUPABASE_SECRET_KEY` | production | نفس الترتيب (§4.3) |

> **قاعدة التنفيذ الصارمة (التُزمت بها):** لم تُقرأ أي قيمة Sensitive، ولم يُخمَّن أو يُنشأ أي بديل/placeholder — مقيس: **صفر مداخل مصنفة sensitive في المشروع الجديد**.

### 12.3 التحقق بعد النقل (كله مقيس عبر API في نفس الفريم)

- **الأسماء:** 29/29 موجودة في الجديد · **الأهداف:** 29/29 مطابقة مجموعة-بمجموعة للقديم · **الأنواع:** مطابقة (plain/encrypted).
- **القيم (التحقق الذهبي):** فُكّ تشفير كل مدخل من **المشروع الجديد نفسه** وقورن بالقيمة المقروءة من القديم → **29/29 متطابقة**.
- **لا ناقص:** صفر مداخل مفقودة · **لا متعارض:** صفر تكرارات (مفتاح+أهداف) · **لا دخيل:** صفر مداخل غير مخططة.
- **المشروع القديم لم يُمس:** بصمة الـ 37 مدخلًا (id/key/target/type/updatedAt) متطابقة قبل/بعد — 37 كما هي (8 Sensitive + 29 مقروءة).
- **أثر جانبي صفري على النشر:** لا بناء أُشعل — آخر نشر في الجديد ما زال CANCELED (دفعة docs `ec6977a5`) · endpoint الـ crons ما زال يرد not_found (صفر crons — عزلة §6 قائمة).

### 12.4 الاختلافات والملاحظات المكتشفة أثناء النقل

1. **بنية المداخل لا بنية المفاتيح:** §4.1 وثّق `NEXT_PUBLIC_SUPABASE_URL`/`NEXT_PUBLIC_SUPABASE_ANON_KEY` بصيغة مدخل واحد (prod+preview+dev) — الواقع المقيس: **كل منهما 3 مداخل منفصلة** (مدخل لكل target). النقل أعاد إنتاج البنية الحرفية (29 مدخلًا لا 21) — لذا عدد مداخل الجديد = عدد مداخل القديم القابلة للقراءة بالضبط.
2. **تجاوز §4.3 بأمر المالك (قرار موثّق):** أمر هذا الفريم نصّ «انقل جميع القيم التي يمكن قراءتها آليًا» فشمل النقل 4 مفاتيح §4.3 القابلة للقراءة (`EVO_PARTNER_API_ENABLED` · `SUPABASE_ANON_KEY` · `SUPABASE_PUBLISHABLE_KEY` · `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`). **أثرها صفر على سلوك الكود** (متغيرات ميتة لا يقرؤها الكود) — بيئة النسخة صارت «مرآة كاملة» بدل «النسخة النظيفة» التي أوصت بها §4.3؛ التوصية الأصلية تظل سارية للتنظيف من **القديم** (بقرار مالك، خارج نطاق هذه الخطة).
3. **تقاطع Sensitive ∩ §4.3:** `SUPABASE_JWT_SECRET` و`SUPABASE_SECRET_KEY` حسّاسيتان (غير مقروءتين) وموثقتان ميتتين في §4.3 — سُجلتا MANUAL_REQUIRED تنفيذًا لأمر المالك، مع توصية §4.3 بعدم إدخالهما يدويًا إطلاقًا (§12.2).
4. **النوع محفوظ حرفيًا:** `NEXT_PUBLIC_SITE_URL` نُقل **plain** كما في القديم؛ البقية encrypted؛ لم يُنشأ أي مدخل sensitive في الجديد (النوع sensitive بلا القيمة الحقيقية لا معنى له).
5. **بوابة أول نشر كامل الميزات:** `NEXT_PUBLIC_PAYPAL_CLIENT_ID` و`NEXT_PUBLIC_ADSENSE_CLIENT` يدمرج مع البناء — أول نشر للنسخة قبل إدخالهما اليدوي يعمل لكن بلا مكونات PayPal/AdSense (بينما GA وSupabase العام نُقلا آليًا) — يرفع أهمية ترتيب §8: الإدخال اليدوي (الخطوة 1) قبل أول preview كامل الميزات.
6. **`hiddenProductionEnvCount = 0`** في القديم — لا متغيرات مخفية إضافية وراء العداد؛ الـ 37 هي الكل.

---

> **امتثال:** إطار docs-only (§79 — بوابات docs الثابتة فقط محليًا) · `[vercel skip]` في الالتزام (VERCEL-USAGE-6) · لا أسرار ولا قيم (§7) · صف في `docs/README.md` بنفس الفريم · مدخل `worklog.md` أعلى الملف · المصادر أحادية: أسماء/مصادر env من `RECOVERY-SECRETS-SOURCES.md`، حالة Production من القياس الحي، حالة الجديد من API الفريق الجديد (قراءة فقط).
> **تحديث فريم ENV-TRANSFER-BACKUP-2026-10-03 (أمر المالك «نفّذ الآن فقط البندين»):** أُضيف §12 (سجل نقل المتغيرات المنفّذ) وحُدّثت §2/§3-A1/§8-2/§11 — **القيم المنقولة لم تُخزَّن في أي ملف داخل المستودع** (أسماء/أهداف/عدادات فقط؛ التقرير الكامل بالقيم محلي خارج المستودع). ما نُفّذ: البند §8-2 وحده؛ عزلة §6 ما زالت قائمة (صفر deployments جاهزة · صفر crons).
