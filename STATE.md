# STATE.md — الحالة الرسمية للمشروع (أول ملف يُفتح في أي جلسة)

> **قانون (AGENTS.md §3.6):** ده أول ملف أي وكيل يقرأه قبل أي شغل — وبيتحدث إلزاميًا في نفس الفريم اللي بيغيّر الحالة.
> الملف محدود بـ 100 سطر بوابةً (`scripts/docs_audit.py`) — اكتب مضغوط.
> **قانون التوحيد (Phase 115):** الملف ده هو **المصدر الرسمي والوحيد** لحالة المشروع الحية — `PROGRESS.md` و`QA_CHECKLIST.md` مجمدون في `archive/`.
> **آخر تحديث:** 2026-09-08 (المرحلة 147 — **الاختبار الحي الشامل لأنظمة البريد + lead capture**: 9 حسابات اختبار عبر الإنتاج الحي — الأدوات الست بريد delivered+opened، النشرة تسجيل lead، relay الاستعادة/Magic Link delivered أول مرة، tool_leads 45→54) — فوق مرحلة 146 (هوية النشرة + مسح Gmail)

## المرحلة الحالية
- **المرحلة:** 147 — الاختبار الحي الشامل (أمر المالك «ابداء تجربة حية لكل انظمة البريد بحسابات اختبار وتاكد ان جميع الادوات يعمل داخلها البريد وايضا يتم تسجيلهم فى قائمة ال lead capture» 2026-09-08) فوق مرحلة 146:
- **(ز) 147 — اختبار حي شامل 9 حسابات (+tags على بريد المالك) عبر الإنتاج الحي — كلها خضراء:** ① الأدوات الست كلها POST /api/send-email → 200 `{ok,leadSaved:true}` + بريد Brevo REST **delivered+opened** (أحداث Brevo) + lead type=tool لكل أداة — ② النشرة POST /api/tools/lead → lead type=newsletter (بدون بريد بالتصميم) — ③ relay Supabase SMTP أول إثبات حي: استعادة كلمة المرور + Magic Link عبر `/auth/v1/recover` و`/auth/v1/otp` → **delivered** من no-reply@alkemos.com — ④ تسجيل عضوين `/auth/v1/signup` → فوري + lead type=member (تريغر handle_new_user_add_lead) — tool_leads 45→54 (9/9 صفوف سُجلت) — **ملاحظة تشغيلية موثقة:** التسجيل بلا بريد تأكيد بالتصميم (تريغر 0074 `alkemos_autoconfirm_email` يختم email_confirmed_at لحظة الإنشاء — تحقق حيًا رغم config autoconfirm=false) — حدود المعدل اختُبرت واقعيًا: send-email 5/10min/IP أجبرت الدفعتين (4+2) + 3/ساعة/بريد تجاوزت بوسوم +tags
- **(و) 146 — هوية النشرة:** مُرسِل `newsletter@alkemos.com` (Alkemos Newsletter — id=3، نشط تلقائيًا بدل بريد تحقق لأن النطاق موثق dkimError:false) + إرسال اختبار حي **delivered** في ثانية واحدة إلى بريد المالك — مُرسِل Gmail لم يعد موجودًا في Brevo (القائمة: no-reply + newsletter فقط) — النشرات تُرسل من لوحة Brevo بالمُرسِل الجديد (الاشتراكات تُحفظ في tool_leads type=newsletter) · **مسح Gmail:** صفحة /contact تعرض `contact@alkemos.com` (كانت بريد Gmail علنًا) + تعليق send-email مُعاد صياغته + `.env.example` (EMAIL_SERVER_* → BREVO_API_KEY/EMAIL_FROM) + README/GUIDE (nodemailer → Brevo REST) · auth.ts COACH_EMAILS وSECURITY.md (هوية المالك) بقيا كما هما
- **(هـ) 145 — GHA تنظيف النشرات:** `vercel-cleanup.yml` يوميًا 01:00 UTC (+workflow_dispatch مع خيار DRY RUN) يشغّل `scripts/vercel-cleanup/vercel-cleanup.mjs` (Node خالص بلا اعتماديات، نمط db-backup) — يحافظ دائمًا على نشر الإنتاج الحي المربوط بالـaliases + نافذة KEEP_HOURS (48 ساعة) + أحدث KEEP_PREVIEWS previews، ويحذف الباقي (خروج صادق: أحمر = فشل API) — **السكربت متحقق حيًا ضد الـAPI الحقيقي** (DRY RUN + حذف فعلي لنشر متجاوز) — **مفعّل: سر VERCEL_TOKEN أضيفه المالك وتحقق الـ workflow حيًا** (dispatch أخضر: preflight ✓ + خطة keep/purge صحيحة على الـ API الحقيقي + to purge: 0) — التنظيف الآن آلي يوميًا 01:00 UTC
- **(أ) التسجيل الفوري (0074):** تريغر `alkemos_autoconfirm_email` (BEFORE INSERT على auth.users — محصّن بمعالج استثناء، نمط 0073) يختم email_confirmed_at عند الإنشاء + العميل يعيد تسجيل دخول فوري بكلمة المرور لو GoTrue حجب الجلسة (config ما زال mailer_autoconfirm=false) + فتح الحسابات العالقة قديمًا — التسجيل يدخل الداشبورد مباشرة بدل شاشة «افحص بريدك» الميتة
- **(ب) كوكيز GDPR (بانر Phase 144):** فئات الكوكيز الأربع (ضرورية/تفضيلات/تحليلات/إعلانات) في `<details>` بلا JS + رابط سياسة الخصوصية داخل البانر + قبول/رفض متكافئ + سجل 365 يومًا + سحب الموافقة بضغطة من زر «إعدادات الكوكيز» بصفحة الخصوصية (حدث alkemos:consent-reopen) + قسم كوكيز دقيق ثنائي اللغة في /privacy — **الأداء:** سطح مصمت بلا marble-card (يقتل فخ الطبقات + LCP الصوري) + contain + حجز padding للـbody قبل الرسم (لا يغطي الأزرار أبدًا — إصلاح ملاحظة /auth) مع بقاء SSR-first-paint وإخفاء pre-paint للعائدين
- **(ج) إصلاحات QA الحية:** 13 مفتاح ترجمة ناقص أُضيف للقاموسين (جذر «COACH.SUBSCRIPTION» الخام — t() كان يرجّع المفتاح نفسه) + جرس إشعارات الأدمن ثنائي اللغة (كان «إشعارات الكوتش» ثابتًا) + تحقق ظاهر ثنائي اللغة في حاسبتي BMI ونسبة الدهون (كان صامتًا)
- **(د) 144.1 — Vercel Function Storage (أمر المالك «حل مشكله خطة فيرسال المجانية»):** بريد استنفاد 100% من حصة 10 GB → التشخيص: 123 نشرًا محتفظًا خلال أيام (كل push = نشر بحزم دوال كاملة) → حُذف 118 قديمًا عبر API (بقي نشر الإنتاج الحي + 2 preview) — alkemos.com وأقسامها 200 بعد التنظيف
- **آخر كوميت متحقق منه:** 5de2f4c (المرحلة 146) · **الإنتاج:** alkemos.com حي · **CI:** البوابة خضراء على main

## المفتوح الآن
- **P1 SMTP/Brevo (مُهيأ بالكامل — باقي فحص الدعوة الحية):** مسار كامل عبر API: DNS (MX Zoho ×3 + SPF موحّد + CNAME DKIM) → المالك وثّق النطاق في Brevo → مُرسِلا `no-reply@alkemos.com` (Auth/الأدوات) و`newsletter@alkemos.com` (النشرة — مرحلة 146) → **Supabase custom SMTP** (Management API: بيانات كاملة + **rate_limit_email_sent 2→30** + قالب دعوة ثنائي اللغة RTL) — **Vercel serverless يحجب SMTP الصادر (25/465/587)** → **مسار `/api/send-email` على Brevo REST API عبر HTTPS** (env: `BREVO_API_KEY` + EMAIL_FROM/REPLY_TO، حُذفت EMAIL_SERVER_*) — البوابات: tsc 0 · eslint 0 · vitest 256/256 · build ✓ — **المتبقي:** دعوة عميل حقيقية من التطبيق (E2E للمالك — القالب موثق والrelay مثبت delivered في 147) + أول نشرة من لوحة Brevo بالمُرسِل الجديد · ملاحظة: صندوق استقبال `newsletter@` غير موجود على Zoho — للردود استخدم replyTo آخر أو أنشئ الصندوق
- **CSP (وفق خطة موثقة):** RO منشور 2026-09-05 13:34Z → الفرض مؤجل لـ2026-09-12 مع إضافة paypal+google-analytics لـconnect-src (كما هو موثق)
- **AdSense lazy-load (مقصود):** الموقع قيد مراجعة AdSense والوسم **يجب** أن يبقى server-rendered → بعد الموافقة فقط
- **لاحق (هيكلي):** تأجيل عميل Supabase (68KB) = إعادة هيكلة 12+ وحدة auth · تقسيم hydration الرئيسية
- **فحص حي لاحق (كوميت 144):** تسجيل حساب جديد حيًا → دخول فوري + بانر الكوكيز الجديد — يوثق في worklog بعد التحقق

## بانتظار موافقة المالك
- Zod الموجات 2-3 (مسارات المستخدم/المدرب ثم الدفع وadmin وcron) — البنية جاهزة في `src/lib/validation/`
- لا عناصر مالية/بيانات معلقة

## ممنوعات نشطة
- `auth.users`: يدويًا فقط **باستثناء** DO-blocks محصّنة بمعالج استثناء تحت توجيه مالك صريح (نمط 0073/0074 المثبت) — التريغر الحالي قابل للإزالة بـDROP موثق داخل 0074 عند تهيئة SMTP
- مزودو AI: **OpenRouter + Groq فقط** — Gemini اتشالت بقرار المالك 2026-08-27
- ممنوع تعديل ميجريشنز مطبَّقة — دايمًا ميجريشن جديدة بصيغة `YYYYMMDDHHMMSS_NNNN` (قانون INDEX.md §3)
- ممنوع أرقام متغيرة داخل README/DEVELOPER_GUIDE — مكانها الكود/INDEX.md (بوابة docs_audit تُفشل الدفع)
- ممنوع إحياء `PROGRESS.md`/`QA_CHECKLIST.md` في الجذر — اتجمدوا في archive/ بأمر Phase 115
- slug العمود لا يُمس أبدًا (قانون ثبات الروابط — المرحلة 121)

## ملخص جودة المرحلة (QA — Phase 147)
- **147 اختبار حي كامل:** 7/7 رسائل delivered+opened (6 أدوات REST + recovery + magic link relay) · 9/9 leads سُجلت في tool_leads (6 tool + 1 newsletter + 2 member) · حد 100/يوم لم يُمس (6 فقط) · سكربتات الجلسة خارج المستودع (live_e2e_147.py وغيرها على UA curl/8.5.0)
- **(محفوظ من 145):** البوابات tsc 0 · eslint 0 · vitest 256/256 · build ✓ · docs_audit ✓ · GHA تنظيف النشرات مفعّل حيًا (dispatch أخضر) · (محفوظ من 144): أدوار 4/4 متحققة حيًا
- **البوابات (كوميت 145):** tsc 0 · eslint 0/0 (جديد) · vitest 256/256 · next build ✓ · docs_audit ✓ · docs_parity ✓ · migration_audit --ci ✓ (صفر انجراف — بلا ميجريشنز) · stale-refs ✓ · ui-wiring ✓
- **145 تحقق حي:** السكربت ضد Vercel API الحقيقي — DRY RUN (خطة keep/purge سليمة على 4 نشرات) + KEEP_HOURS=0 حذف فعلي لنشر إنتاج متجاوز واحد (الإنتاج الحي + 2 preview بقوا، alkemos.com رقم 200 بعده) — مسار DELETE و429-backoff والخروج الصادق مغطاة
- **145 تفعيل حي (بسر المالك):** dispatch أول أحمر 23:52 UTC (السر أُضيف بعدها بلحظات) → إعادة dispatch أخضر 23:57 UTC — preflight ✓ + خطة keep صحيحة (إنتاج حي 0h + 3 fresh ≤48h + 2 preview) + **to purge: 0** — الحالة الصحية لـ Function Storage مؤكدة، والتنظيف اليومي يعمل تلقائيًا
- **(محفوظ من 144):** تدقيق اتساق i18n (0 ناقص) · 0074 محصّن بمعالج استثناء · أدوار 4/4 متحققة حيًا

## خريطة مصادر الحقيقة (ممنوع الوثوق برقم من غير مصدره)

| السؤال | المصدر الوحيد |
|---|---|
| شكل جداول/علاقات DB | `src/lib/supabase/types.ts` + التحقق الحي PostgREST |
| الأسعار والباقات | `src/lib/memberships.ts` |
| حل مستوى العضوية | `src/lib/membership-tier.ts` (Phase 141) |
| حدود التحقق للطلبات | `src/lib/validation/schemas.ts` (A-7) |
| الميجريشنز والترقيم | `supabase/migrations/INDEX.md` |
| الحالة الراهنة | الملف ده (STATE.md) — المصدر الوحيد من Phase 115 |
| التاريخ الكامل | `worklog.md` + `archive/` |
| قوانين التشغيل | `AGENTS.md` |

## بروتوكول فتح الجلسة (النص الإلزامي الكامل: AGENTS.md §3.6)

1. اقرأ `STATE.md` (30 ثانية — الحقيقة الرسمية الوحيدة)
2. `git fetch origin --quiet` → آخر 3 مدخلات `worklog.md` + آخر 5 كوميتات
3. ممنوع الوثوق بأي رقم في أي وثيقة — خد منها من خريطة المصادر أعلاه
4. قانون البقاء: مساحة العمل بتتمسح في أي لحظة → أي معرفة عايزها تعيش = **commit & push في نفس الجلسة**
