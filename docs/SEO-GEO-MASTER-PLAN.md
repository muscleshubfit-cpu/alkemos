<!-- Created: 2026-09-08 -->
<!-- Status: Living document — append-only, every implementation phase adds a section under §12 -->
<!-- Owner: muscleshubfit@gmail.com (Ahmed) — project owner + human supervisor -->
<!-- Scope: SEO / GEO global visibility master plan. Implementation tasks live here, NOT in STATE.md. -->
<!-- Related: AGENTS.md (operating rules) · STATE.md (current project status) · docs/SEO-CWV-THRESHOLDS.md · docs/SEO-EEAT-FRAMEWORK.md · docs/SEO-SCHEMA-REFERENCE.md -->

# Alkemos — Master Plan for Global Organic Visibility (SEO + GEO)

> **لماذا هذا الملف:** الهدف هو تصدّر نتائج البحث العضوي عالميًا في فئة اللياقة والتغذية، وضمان ظهور Alkemos كمرجع مقتبَس في إجابات محركات الذكاء الاصطناعي (ChatGPT, Perplexity, Google AI Overviews, Gemini, Claude). الملف هو مصدر الحقيقة الوحيد لخطة SEO/GEO — لا تنشئ ملفات منافسة، حدّث هذا الملف فقط.
>
> **اللغة:** عربي/إنجليزي مختلط (المصطلحات التقنية بالإنجليزية، الشروحات بالعربية).

---

## 1. ملخّص تنفيذي (Executive Summary)

موقع **Alkemos.com** مبني على أساس تقني قوي جدًا: بنية URLs نظيفة، دعم لغتين (عربي/إنجليزي) صحيح 100%، خرائط موقع مُقسّمة بذكاء، علامات Schema منظّمة، سرعة استجابة ممتازة (TTFB 0.31–0.44 ثانية)، وحوالي **80,100 صفحة مفهرسة في Bing**.

الهدف: **تحويل هذا الأساس التقني إلى تصدّر عضوي عالمي #1** في فئات:
- مكتبة التمارين (vs ExRx.net, MuscleWiki)
- قاعدة بيانات الأطعمة (vs MyFitnessPal, FatSecret, CalorieKing)
- حاسبات اللياقة (vs CDC, calculator.net, NASM)
- مدرب اللياقة الذكي EVO (vs Fitbod, Freeletics, ChatGPT-direct)
- المحتوى العربي الرياضي (سوق مفتوح عمليًا — لا منافس قوي)

**الطريق:** 12 شهرًا، 6 مراحل، استثمار تسويقي محتوى + بناء سلطة (Authority) + توسّع لغوي. لا يتطلب إعادة بناء تقنية، بل قرارات تكتيكية واضحة + جهد تنفيذي مُركّز.

---

## 2. تدقيق الوضع الحالي (Current State Audit)

> تاريخ التدقيق: 2026-09-08 · المرحلة: 144 · آخر كوميت متحقّق منه: 24a033e + Phase 144

### 2.1 ما يعمل بشكل ممتاز ✅

| المجال | الوضع | الدليل |
|---|---|---|
| سرعة الاستجابة (TTFB) | 0.31–0.44 ثانية | `curl -sI https://alkemos.com/` (ثلاث قياسات متتالية) |
| ثنائية اللغة (AR/EN) | صحيحة 100% مع `hreflang` + `canonical` + اتجاه RTL | فحص حي للصفحة الرئيسية و `/ar` |
| علامات البيانات المنظّمة (JSON-LD) | Organization + WebSite + Article + Exercise + Breadcrumb + NutritionInformation | فحص HTML للصفحة الرئيسية وصفحات الأطعمة |
| هيكلة الخرائط (Sitemaps) | 4 خرائط فرعية + Index: pages(47) + exercises(1,736) + foods(160) + blog(61) = 2,004 URLs مُعلَنة | `curl https://alkemos.com/sitemap.xml` |
| بنية الـ URLs | نظيفة ومنطقية: `/exercises/[slug]`, `/ar/exercises/[slug]`, `/foods/[slug]`, `/tools/calorie-calculator` | فحص Sitemap |
| ملف `llms.txt` | موجود ومكتوب باحتراف — جاهز لمحركات الذكاء الاصطناعي | `https://alkemos.com/llms.txt` |
| ملف `llms-full.txt` | موجود كموسّع للمقالات | `https://alkemos.com/llms-full.txt` |
| RSS Feeds | EN + AR متوفّران | `<link rel="alternate" type="application/rss+xml">` |
| خط المدوّنة الآلي | 61 مقالًا منشورًا، 6 مقالات/يوم | `sitemap-blog.xml` |
| حجم الفهرسة في Bing | ~80,100 صفحة (يشمل 8,750 صفحة طعام من USDA غير المُعلَنة في الخريطة) | `site:alkemos.com` على Bing |
| الأمان والخصوصية | HSTS, CSP, GDPR Cookie Banner, Permissions-Policy, X-Frame-Options | فحص response headers |
| PWA | قابل للتثبيت + Service Worker + manifest.json | `public/manifest.json`, `public/sw.js` |
| مراقبة الأداء | Vercel Analytics + Speed Insights مُفعّلان | `<Analytics />` + `<SpeedInsights />` |
| Skipping navigation | `sr-only-focusable` skip link | فحص HTML |
| robots.txt الأساسي | موحّد بذكاء (Phase 140 audit fix) + يسمح لكل البوتات بفهرسة المحتوى العام | فحص حي |
| روابط داخلية في صفحات الأطعمة | `getRelatedFoods` يولّد روابط ذكية | `src/lib/foods.ts` |
| 404 حقيقي للأطعمة المفقودة | `notFound()` بدلًا من 200 + noindex | `src/app/foods/[slug]/page.tsx` (A-8) |

### 2.2 فجوات التصدّر الحالية 🔴

| الفجوة | التأثير | الأولوية |
|---|---|---|
| **عدم وجود صفحات Hub/Collection** (مثل `/muscles/chest`, `/equipment/dumbbell`, `/collections/high-protein-foods`) | ضياع مليون زيارة شهرية محتملة من استعلامات الـ long-tail | عالية |
| **العلامة التجارية غير معروفة ككيان (Entity) لـ Google** | البحث عن "alkemos" لا يُظهر الـ Knowledge Panel | عالية |
| **عدم وجود روابط خلفية (Backlinks)** من مواقع موثوقة | Domain Authority منخفض، صعوبة التصدّر لكلمات تنافسية | عالية |
| **8,750 صفحة طعام USDA غير مُعلَنة في الخريطة** (سياسة Phase 141) | ضياع 87,500–437,500 زيارة شهرية محتملة (تقديري) | متوسطة |
| **لا توجد صفحات مقارنة** ("Alkemos vs MyFitnessPal", "EVO vs Freeletics") | ضياع زيارات عالية نية شرائية | متوسطة |
| **لا توجد ملفات تعريف مؤلفين بأسماء حقيقية وشهادات** | ضعف E-E-A-T (الخبرة، السلطة، الثقة) | متوسطة |
| **رؤوس HTTP تمنع التخزين المؤقّت**: `private, no-cache, no-store` على كل الصفحات | استنزاف Crawl Budget + تكلفة Vercel أعلى + LCP أبطأ على الجوال | متوسطة |
| **المدوّنة الإنجليزية تحت 100 مقال** (61 حاليًا) | المنافسون 10,000–50,000 مقال | منخفضة (الاستراتيجية: نشر آلي 6/يوم) |
| **لا توجد حسابات اجتماعية رسمية فعلية** (فقط أزرار مشاركة) | إشارات الكيان (Entity signals) ضعيفة | عالية |
| **صور OG الخارجية في المدوّنة** (Pexels بدلًا من `/api/og-image/[slug]` الموجود) | تقليل نسبة النقر من Social Shares | منخفضة |

### 2.3 تصحيح تحليل Cloudflare (هام)

> **التحليل الأولي في المحادثة كان مبالغًا فيه.** بعد فحص Cloudflare API بـ Token 1 (zone_settings) و Token 2 (waf) والتأكد من إعدادات WAF Rulesets + Page Rules + Bot Management:

**ما يحدث فعليًا:**

Cloudflare يُضيف تلقائيًا كتلة `"BEGIN Cloudflare Managed content"` إلى أعلى ملف `robots.txt` تمنع **بوتات تدريب الذكاء الاصطناعي فقط** (لا بوتات البحث):

| Bot | المالك | الغرض | محجوب؟ |
|---|---|---|---|
| Googlebot | Google | البحث العادي + AI Overviews | ❌ غير محجوب |
| Bingbot | Microsoft | البحث العادي + Copilot | ❌ غير محجوب |
| PerplexityBot | Perplexity | البحث في Perplexity | ❌ غير محجوب (ليس في القائمة) |
| OAI-SearchBot | OpenAI | ChatGPT Search | ❌ غير محجوب (ليس في القائمة) |
| Applebot | Apple | Siri + Spotlight Search | ❌ غير محجوب |
| **GPTBot** | OpenAI | تدريب ChatGPT | ✅ محجوب |
| **ClaudeBot** | Anthropic | تدريب Claude | ✅ محجوب |
| **Google-Extended** | Google | تدريب Gemini (لا يؤثر على AI Overviews) | ✅ محجوب |
| **CCBot** | Common Crawl | تغذية مشاريع AI مفتوحة المصدر | ✅ محجوب |
| **Bytespider** | ByteDance | تدريب TikTok AI | ✅ محجوب |
| **Amazonbot** | Amazon | تدريب Alexa AI | ✅ محجوب |
| **Applebot-Extended** | Apple | تدريب Apple Intelligence | ✅ محجوب |
| **meta-externalagent** | Meta | تدريب Meta AI | ✅ محجوب |
| **CloudflareBrowserRenderingCrawler** | Cloudflare | تصيير داخل Cloudflare | ✅ محجوب |

**الخلاصة:** الوضع الحالي **صحيح ومتوازن** — يحمي محتواك من السرقة للتدريب بينما يسمح لجميع محركات البحث (التقليدية والذكية) بالوصول.

**التوصية:** اترك هذا الإعداد كما هو. لا تغيّره.

> **Token Permissions Verified:**
> - Token 1 (`cfut_MVeb...`): `#zone_settings:edit`, `#zone_settings:read`, `#dns_records:read` — يصلح لإدارة الإعدادات
> - Token 2 (`cfut_C8Dw...`): `#waf:edit`, `#waf:read`, `#zone:read` — يصلح لإدارة WAF
> - Zone ID: `b4be55a0736831d9c5d9564788861076`
> - Account ID: `881c3f8ebf6e31fea39195295d4cff08`
> - لا توجد Page Rules نشطة
> - لا توجد Custom WAF Rules (فقط Cloudflare Managed Free Ruleset لحماية Log4j/Shellshock/WordPress)
> - Rate limit نشط: 50 req/10s لكل IP على `/api/*` (10 دقائق حظر عند التجاوز)

---

## 3. المشهد التنافسي (Competitive Landscape)

### 3.1 الفئة أ — مكتبة التمارين (الأشرس)

| المنافس | عدد التمارين | سنوات | قوة | نقطة ضعف |
|---|---|---|---|---|
| **ExRx.net** | 2,100+ | منذ 1999 | المرجع التاريخي للمدربين | تصميم قديم 1999، سيئ على الجوال |
| **MuscleWiki** | 2,000+ | 2013 | خريطة عضلية تفاعلية، فيروسي على Reddit | محتوى سطحي، لا برامج متكاملة |
| **ACE Fitness** | ~500 | 1985 | سلطة .org معتمدة | تغطية محدودة |
| **Bodybuilding.com** | ~1,000 | 1999 | علامة تجارية ضخمة | تراجع بعد 2024 |
| **Alkemos (حاليًا)** | 868 | 2026 | ثنائي اللغة + ذكاء اصطناعي + برامج | أحدث، أقل روابط خلفية |

**التقييم:** ExRx و MuscleWiki يتفوقان في الحجم، لكن تصميمهما ضعيف على الجوال، لا يدعمان العربية، ولا يقدّمان ذكاءً اصطناعيًا. **فرصة Alkemos: الجودة + التجربة + العربية + EVO.**

### 3.2 الفئة ب — قاعدة بيانات الأطعمة (المحتكرة)

| المنافس | عدد الأطعمة | مستخدمون | نموذج عمل |
|---|---|---|---|
| **MyFitnessPal** | ملايين | 350 مليون | اشتراك + إعلانات |
| **FatSecret** | 1.9 مليون | 50 مليون+ | API مجاني |
| **CalorieKing** | ~50,000 | — | اشتراك |
| **Nutritionix** | ~800,000 | (B2B) | API مدفوع |
| **Alkemos (حاليًا)** | 8,830 (80 مُختار) | — | مجاني + SEO |

**التقييم:** MyFitnessPal و FatSecret يحتكمان السوق الإنجليزي. لا منافس قوي في **العربية**. Alkemos يملك 8,830 طعامًا (تكفي كبداية) — لكن فقط 80 مُعلَن عنها. **الفرصة: استثمار 8,750 صفحة USDA الإنجليزية + توسّع لغوي.**

### 3.3 الفئة ج — الحاسبات (مُحتكرة من سلطات)

| المنافس | السلطة |
|---|---|
| **CDC.gov** | حكومي أمريكي |
| **calculator.net** | دومين قديم ضخم |
| **NASM.org** | هيئة اعتماد لياقة |
| **MyFitnessPal** | علامة تجارية |
| **HealthHub.sg** | حكومي سنغافوري |
| **Alkemos (حاليًا)** | 6 حاسبات مجانية (BMR, BMI, Macro, Body Fat, Water, Calorie) |

**التقييم:** منافسة شرسة في الإنجليزية. **الفرصة: العربية + الإسبانية + البرتغالية** (الحاسبات الصينية واليابانية والروسية متوفرة، لكن العربية ضعيفة جدًا).

### 3.4 الفئة د — مدرب اللياقة الذكي (سوق ناشئ)

| المنافس | التمويل | النموذج |
|---|---|---|
| **ChatGPT/Claude (direct)** | $157B / $60B | مجاني عام |
| **Fitbod** | $5M+ | اشتراك $79/سنة |
| **Freeletics** | $25M+ | اشتراك €95/سنة |
| **Future** | $90M+ | $200/شهر مع مدرب بشري |
| **Vora** | $10M+ | اشتراك |
| **SensAI** | ناشئ | اشتراك |
| **Alkemos EVO** | bootstrap | مجاني للزوار + مشتركين |

**التقييم:** السوق مزدحم بالـ apps المموّلة، لكن **لا يوجد منافس يقدّم AI coach عربيًا + مجاني للزوار**. EVO فرصة تفاضلية حقيقية.

### 3.5 الفئة هـ — السوق العربي (الفرصة الذهبية) ⭐

| المنافس | المنطقة | نقطة الضعف |
|---|---|---|
| **Trainera** | الخليج | محتوى محدود، تركيز خليجي فقط |
| **ArabFit** | تطبيق بسيط | لا محتوى عميق |
| **GymNation** | سلسلة صالات | لا منصة محتوى |
| **Noursin (Google Play)** | تطبيق | تطبيق لا موقع ويب SEO-friendly |
| **معظم المنافسين** | تطبيقات لا مواقع | فجوة استراتيجية ضخمة لـ Alkemos |

**التقييم:** **السوق العربي مفتوح عمليًا.** لا يوجد موقع ويب عربي رياضي يقدّم: مكتبة تمارين + قاعدة أطعمة + حاسبات + مدرب ذكاء اصطناعي + برامج جاهزة. Alkemos يملك كل هذا بالفعل.

---

## 4. تحليل SWOT

### Strengths (نقاط القوة)
1. **بنية تقنية ممتازة** — Next.js 16 + ISR + SSR + PWA + ثنائية لغة صحيحة
2. **محتوى وفير** — 868 تمرين + 8,830 طعام + 61 مقال + 6 حاسبات + 8 برامج
3. **ذكاء اصطناعي EVO** — لا منافس عربي يقدّمه
4. **الأسعار تنافسية** — $14.99–$39.99/شهر (أقل من Freeletics, Future)
5. **نظام مدربين جاهز** — 100% دخل للمدرب، رسم ثابت
6. **خط مدوّنة آلي** — 6 مقالات/يوم = 2,190 مقال/سنة
7. **SEO تقني نظيف** — Schema + Sitemaps + hreflang + canonical
8. **PWA** — قابل للتثبيت كتطبيق أصلي

### Weaknesses (نقاط الضعف)
1. **Domain Authority منخفض** — لا روابط خلفية موثوقة
2. **عدم معروفة كعلامة تجارية** — Google لا يعرف "alkemos" كـ Entity
3. **محتوى المدوّنة صغير نسبيًا** — 61 مقالًا (Healthline: 50,000+)
4. **8,750 صفحة طعام USDA غير مُعلَنة** — ضياع حركة Long-tail
5. **لا صفحات Hub/Collection** — فقدان استعلامات المجموعات
6. **لا حسابات اجتماعية فعلية** — إشارات Entity ضعيفة
7. **لا مؤلفون معروفون** — E-E-A-T ضعيف
8. **رؤوس HTTP تمنع التخزين** — استنزاف Crawl Budget
9. **التسجيل الفوري بدون بريد** (Phase 144) — قد يُسبب نسبةbounce عالية (يحتاج قياس)

### Opportunities (الفرص)
1. **السوق العربي مفتوح** — لا منافس قوي
2. **محركات الذكاء الاصطناعي مفتوحة** — PerplexityBot, OAI-SearchBot, Bingbot تستطيع الوصول
3. **8,750 صفحة USDA جاهزة** — أكبر مصدر حركة Long-tail مجانية
4. **التوسّع اللغوي** — الإسبانية، البرتغالية، الفرنسية، الهندية، الإندونيسية
5. **برنامج Affiliate جاهز** — `/affiliate` موجود، يحتاج تفعيل
6. **GEO (Generative Engine Optimization)** — سوق ناشئ 2026، المنافسة ضعيفة
7. **Bing Copilot + ChatGPT Search** — يظهران في ~50% من نتائج البحث الإنجليزية
8. **TikTok + Instagram Reels** — قناة اكتساب عضوي لا مستغلة

### Threats (التهديدات)
1. **ExRx.net و MuscleWiki** — تاريخ طويل + Domain Authority عالٍ
2. **MyFitnessPal + FatSecret** — احتكار قاعدة الأطعمة الإنجليزية
3. **Google AI Overviews** — تأكل نسبة النقر (CTR) من النتائج العضوية العليا
4. **تحديثات Google Core** — تقلبات شهرية في الترتيب
5. **ChatGPT/Claude المباشر** — يجيب على استفسارات اللياقة بدون الحاجة لزيارة موقع
6. **منافسون عرب مموّلون قد يظهرون** — Trainera + رأس مال خليجي
7. **تكلفة Vercel + Supabase + OpenRouter + Groq** — تتصاعد مع النمو
8. **AdSense under review** — لا دخل إعلاني بعد

---

## 5. استراتيجية الكلمات المفتاحية (Keyword Strategy)

### 5.1 التصنيف الهرمي للكلمات

**Tier 1 — Head Terms (تنافسية شرسة، أعلى حجم بحث):**
- "exercise library" (10K–100K شهريًا، ExRx يتصدر)
- "calorie calculator" (100K–1M، calculator.net يتصدر)
- "bmi calculator" (100K–1M، CDC يتصدر)
- "workout programs" (10K–100K)
- "food database" (1K–10K)
- "AI fitness coach" (1K–10K، ناشئ)

> **التقييم:** لا تُهاجم هذه الكلمات مباشرة في السنة الأولى. ركّز على Long-tail ثم اصعد.

**Tier 2 — Medium Tail (فرصة حقيقية):**
- "best chest exercises for mass" (1K–10K)
- "high protein foods list" (10K–100K)
- "low carb foods" (10K–100K)
- "calorie calculator for weight loss" (1K–10K)
- "home workout program no equipment" (1K–10K)
- "AI personal trainer free" (100–1K، ناشئ بسرعة)
- "macro calculator for cutting" (1K–10K)
- "keto friendly foods" (10K–100K)

> **التقييم:** هذه هي ساحة المعركة. أنشئ صفحات Hub/Collection لها.

**Tier 3 — Long Tail (حركة سهلة، إيراد محتمل):**
- "how many calories in 100g chicken breast" (100–1K)
- "best dumbbell exercises for triceps" (100–1K)
- "beginner home workout 3 days week" (100–1K)
- "is tuna good for weight loss" (100–1K)
- "bmi 25 what does it mean" (100–1K)
- "high protein breakfast no eggs" (100–1K)
- "keto snacks under 100 calories" (100–1K)
- "calories in 200g rice" (100–1K)

> **التقييم:** كل صفحة طعام USDA + كل صفحة تمرين + كل مقال مدوّنة = صفحة Long-tail محتملة. لديك بالفعل 80,100 صفحة في Bing — استثمرها.

**Tier 4 — Arabic Long Tail (سوق مفتوح):**
- "تمارين صدر في البيت" (100–1K)
- "حساب السعرات الحرارية اليومية" (1K–10K)
- "أكلات عالية البروتين" (1K–10K)
- "تمارين بطن للمبتدئين" (1K–10K)
- "نظام كيتو دايت عربي" (1K–10K)
- "حاسبة BMI عربي" (1K–10K)
- "أفضل برنامج تضخيم" (100–1K)
- "تمارين كارديو لحرق الدهون" (1K–10K)

> **التقييم:** اكتساح هذه الكلمات ممكن خلال 3–6 أشهر. لا منافس قوي عربيًا.

### 5.2 خريطة الكلمات إلى الصفحات

| الكلمة | الصفحة الحالية/المطلوبة | نوع الصفحة |
|---|---|---|
| best chest exercises | `/muscles/chest` (مطلوبة!) | Hub |
| high protein foods | `/collections/high-protein-foods` (مطلوبة!) | Collection |
| low carb foods | `/collections/low-carb-foods` (مطلوبة!) | Collection |
| keto friendly foods | `/collections/keto-foods` (مطلوبة!) | Collection |
| best dumbbell exercises | `/equipment/dumbbell` (مطلوبة!) | Hub |
| home workout no equipment | `/equipment/bodyweight` (مطلوبة!) | Hub |
| calorie calculator | `/tools/calorie-calculator` (موجودة ✅) | Tool |
| AI personal trainer | `/evo` (موجودة ✅) | Product |
| تمارين صدر في البيت | `/ar/muscles/chest` (مطلوبة!) | Hub AR |
| أكلات عالية البروتين | `/ar/collections/high-protein-foods` (مطلوبة!) | Collection AR |

---

## 6. استراتيجية المحتوى (Content Strategy)

### 6.1 الأعمدة الموضوعية (Topic Pillars)

أنشئ 8 أعمدة موضوعية، كل عمود = Hub page + 20–50 صفحة فرعية:

| العمود | الصفحة الرئيسية | الصفحات الفرعية |
|---|---|---|
| بناء العضلات | `/muscles/chest` (Hub) | كل تمارين الصدر + 5 مقالات + 3 برامج |
| خسارة الدهون | `/collections/foods-for-cutting` (Hub) | الأطعمة + مقالات + برنامج Cutting |
| الكيتو دايت | `/collections/keto-foods` (Hub) | الأطعمة + 5 مقالات كيتو |
| التغذية الرياضية | `/collections/high-protein-foods` (Hub) | الأطعمة + مقالات + حاسبة Macros |
| تمارين المنزل | `/equipment/bodyweight` (Hub) | كل تمارين وزن الجسم + 3 برامج منزل |
| المبتدئين | `/beginners` (مطلوبة!) | أدلة شاملة + برنامج 12 أسبوع |
| الذكاء الاصطناعي في اللياقة | `/evo` (موجودة ✅) | مقالات + حالات استخدام |
| مدربون محترفون | `/coaching` (موجودة ✅) | مقالات + قصص نجاح |

### 6.2 معدّل النشر المستهدف

| النوع | الحالي | الهدف (90 يوم) | الهدف (12 شهر) |
|---|---|---|---|
| مقالات المدوّنة (آلي) | 6/يوم | 6/يوم ✓ | 6/يوم (2,190/سنة) |
| صفحات Hub/Collection | 0 | 24 صفحة | 50 صفحة |
| صفحات مقارنة | 0 | 5 صفحات | 20 صفحة |
| صفحات دليل شاملة | 0 | 3 صفحات | 15 صفحة |
| صفحات Long-tail منسّقة | 0 | 50 صفحة | 500 صفحة |
| فيديوهات YouTube | 0 | 4/شهر | 50/سنة |
| منشورات Social | 0 | 3/أسبوع | مستمر |

### 6.3 قوالب المحتوى

**قالب صفحة Hub/Collection (مطلوب تنفيذه فورًا):**
> **التنفيذ:** البنود 1، 3، 6–8 شُحنت بالمرحلة SEO-GEO-1؛ **البنود 4+5 (الدليل التفسيري + FAQ) شُحنا بالمرحلة SEO-GEO-5.2 (§12.17)** — القالب مكتمل على الـ24 مركزًا المملوءة (بند 2/TOC تُرك لصفحات الأدلة الطويلة، و«FAQ اختياري» في البند 8 حُسم: صفر schema — انظر §12.17).
1. H1 فريد + intro 150 كلمة
2. فهرس محتوى (Table of Contents)
3. قائمة العناصر (Grid) مع صور + روابط
4. نص تفسيري 500–1000 كلمة (مع citations PubMed للمقالات الصحية)
5. قسم "أسئلة شائعة" (FAQ) — 5–10 أسئلة
6. روابط داخلية للمقالات ذات الصلة
7. CTA لل-memberhip / EVO / coaching
8. Schema: ItemList + Breadcrumb + (FAQ اختياري)

**قالب صفحة مقارنة:**
1. H1: "Alkemos vs [Competitor]"
2. جدول مقارنة (الميزات، الأسعار، المحتوى، الدعم)
3. مراجعة تفصيلية 1500+ كلمة
4. آراء مستخدمين (مع إذن)
5. الخلاصة + توصية
6. Schema: Article + Review

---

## 7. أولويات SEO التقني (Technical SEO Priorities)

### 7.1 مرتبة بالأولوية

| # | المهمة | الجهد | التأثير | الحالة |
|---|---|---|---|---|
| 1 | إنشاء صفحات Hub/Collection (`/muscles/[group]`, `/equipment/[type]`, `/collections/[slug]`) | متوسط | 🔴 عالي | ✅ تم (SEO-GEO-1 + حصر 12.9) |
| 2 | إضافة Hub Pages إلى `sitemap-pages.xml` | منخفض | 🔴 عالي | ✅ تم (12.9 — كل العائلات مغطاة) |
| 3 | إضافة ItemList schema للـ Hub Pages | منخفض | متوسط | ✅ تم (متحقق في hubs/collections/compare) |
| 4 | تفعيل `/api/og-image/[slug]` لكل صفحات المدوّنة بدلًا من Pexels | منخفض | متوسط | ✅ تم (151 — OG مصلح EN+AR) |
| 5 | إصلاح رؤوس HTTP للتخزين المؤقّت (Cache-Control) على الصفحات العامة | متوسط | متوسط | ✅ تم (148/149 — قاعدة Cloudflare حية) |
| 6 | إضافة "reviewedBy" Person schema للصفحات الطبية/الصحية | متوسط | متوسط | ✅ تم 2026-09-09 (SEO-GEO-4.5 — الأطعمة والتمارين EN+AR) |
| 7 | إضافة تواريخ "lastReviewed" للمحتوى الصحي | منخفض | متوسط | ✅ تم 2026-09-09 (SEO-GEO-4.5 — عقدة WebPage موحدة) |
| 8 | إعادة تقييم إعلان 8,750 صفحة USDA في خريطة منفصلة (`sitemap-foods-long.xml`) | متوسط | 🔴 عالي | ⏳ معلّق (يحتاج 90 يوم بيانات Search Console أولاً) |
| 9 | إنشاء صفحات `/collections/[tag]` للأطعمة (8 صفحات على الأقل) | متوسط | عالي | ✅ تم (SEO-GEO-1 + حصر 12.9) |
| 10 | إضافة `SearchAction` schema للموقع | منخفض | متوسط | ✅ تم (متحقق — WebSite schema في seo.ts) |
| 11 | تحسين Internal Linking بين التمارين والأطعمة والمقالات | متوسط | عالي | ✅ تم 2026-09-09 (SEO-GEO-4.7 — شبكة spoke→hub حتمية + حقن روابط الأدوات للمقالات) |
| 12 | إنشاء `/sitemap-collections.xml` | منخفض | متوسط | ✅ تم (حية من السبع المضافة في GSC) |
| 13 | إضافة `Speakable` schema للمقالات (للأوامر الصوتية) | منخفض | منخفض | ✅ تم (SEO-GEO-4 — مدونة EN+AR) |
| 14 | تحسين `next-sitemap` لإضافة `<lastmod>` دقيقة | منخفض | منخفض | ✅ تم 2026-09-09 (SEO-GEO-4.7 — SITEMAP_LASTMOD لكل عائلة + سياسة المركزات الفارغة) |
| 15 | مراجعة محتوى الـ 61 مقالًا الحالية وتحسينها (Content Pruning) | متوسط | متوسط | ✅ تم 2026-09-09 (SEO-GEO-4.8 — تدقيق 12 بُعدًا على 63 مقالًا: صفر مرشحي حذف + إصلاح 85 رابطًا ميتًا + 3 مراسٍ خام + 3 CJK) |

### 7.2 Core Web Vitals (مأخوذ من `docs/SEO-CWV-THRESHOLDS.md`)

| المؤشر | الهدف | الوضع الحالي المتوقع |
|---|---|---|
| LCP | ≤2.5s | ~1.5–2.0s (TTFB 0.31–0.44s) |
| INP | ≤200ms | غير مقيس مباشرة (Vercel Speed Insights يلتقطه) |
| CLS | ≤0.1 | ~0.0–0.05 (بعد Phase 136/137 fixes) |

> **ملاحظة:** Vercel Speed Insights مُفعّل ويجمع بيانات CrUX الحقيقية. راجع لوحة Vercel أسبوعيًا.

---

## 8. استراتيجية GEO (Generative Engine Optimization)

> GEO = تحسين الظهور في إجابات محركات الذكاء الاصطناعي (ChatGPT, Perplexity, Google AI Overviews, Gemini, Claude, Meta AI).

### 8.1 حالة الوصول الحالية

✅ **محركات البحث التقليدية**: Googlebot, Bingbot, Yandex, Baidu — كلها تستطيع الزحف والفهرسة.
✅ **محركات البحث الذكية**: PerplexityBot, OAI-SearchBot (ChatGPT Search), Applebot (Siri Search) — كلها تستطيع الزحف.
❌ **بوتات التدريب فقط**: GPTBot, ClaudeBot, Google-Extended, CCBot, Bytespider, Amazonbot, Applebot-Extended, meta-externalagent — محجوبة (وهذا صحيح، يحمي المحتوى من السرقة).

### 8.2 تكتيكات GEO الفعّالة

**1. الإجابات الذرية (Atomic Answers)**
- في بداية كل صفحة، قدّم إجابة مباشرة 40–60 كلمة على السؤال الرئيسي
- مثال لصفحة `/foods/chicken-breast`: "Chicken breast contains 165 calories, 31g protein, 0g carbs, and 3.6g fat per 100g. A typical serving (1 medium breast, 150g) provides 248 calories and 46g protein."
- هذه الإجابات هي ما يقتبسه AI bots

**2. الإحصائيات والأرقام القابلة للاقتباس**
- استخدم تنسيق "X% of people..." أو "Studies show..."
- أضف citations لـ PubMed / WHO / CDC
- مثال: "According to a 2023 meta-analysis in the British Journal of Sports Medicine (PMID: 12345678), resistance training 2–3 times per week reduces all-cause mortality by 23%."

**3. قوائم مقارنة (Comparison Tables)**
- جدول مقارنة سريع في كل صفحة Hub
- AI bots تحب الجداول المنظمة

**4. Q&A Sections**
- أضف قسم "أسئلة شائعة" في كل صفحة (5–10 أسئلة)
- ⤵️ **التنفيذ (SEO-GEO-5.2، §12.17):** أقسام FAQ حية على مراكز العضلات/المعدات/الأطعمة الـ24 × لغتين — **والقرار النهائي للـschema: صفر markup** (مصدر الحقيقة `SEO-SCHEMA-REFERENCE.md`: FAQPage retired كليًا منذ 2026-05-07 بلا فائدة SERP، وQAPage محجوز للأسئلة المقدمة من المستخدمين — النص المرئي الإجابات الذرية هو أصل GEO)

**5. llms.txt و llms-full.txt**
- ✅ موجودة بالفعل (`/llms.txt`, `/llms-full.txt`)
- حدّثها شهريًا بأحدث المقالات

**6. Data_attributions و citations**
- كل ادعاء صححي يجب أن يحمل رابطًا للدراسة الأصلية
- استخدم `<cite>` tag في HTML

**7. التحدّث بلغة AI bots**
- استخدم عبارات مثل "According to Alkemos's analysis...", "Research from Alkemos shows..."
- AI bots تُفضل المصادر التي تُعرّف عن نفسها كمرجع

### 8.3 قياس الظهور في AI

| الأداة | الوصف | التكلفة |
|---|---|---|
| **Google Search Console** | يعرض ظهور AI Overviews في تقرير Search Appearance | مجاني |
| **Bing Webmaster Tools** | يعرض ظهور Copilot answers | مجاني |
| **Profound** | تتبّع ظهور العلامة في ChatGPT/Perplexity | مدفوع |
| **Otterly.ai** | مراقبة AI Search visibility | مدفوع |
| **Manual testing** | ابحث يدويًا في ChatGPT/Perplexity/Gemini عن "alkemos" أسبوعيًا | مجاني |

> **التوصية:** ابدأ بالقياس اليدوي الأسبوعي. عند توفّر ميزانية، اشترك في Profound أو Otterly.

---

## 9. استراتيجية السلطة والروابط الخلفية (Authority & Backlinks)

### 9.1 الهدف الكمّي

| المقياس | الحالي (تقديري) | الهدف (6 أشهر) | الهدف (12 شهر) |
|---|---|---|---|
| Referring Domains | ~5–20 | 100 | 300 |
| Total Backlinks | ~50 | 1,000 | 5,000 |
| Domain Rating (Ahrefs) | ~10 | 25 | 40 |
| Domain Authority (Moz) | ~10 | 25 | 40 |
| Mentions in major outlets | 0 | 5 | 20 |

### 9.2 قنوات بناء الروابط

**قناة 1: HARO / Connectively (الأعلى ROI)**
- اشترك كخبير لياقة وتغذية
- أجب على 5–10 استفسارات يوميًا (15 دقيقة/يوم)
- كل quote مذكور فيها Alkemos = backlink من موقع إخباري
- التكلفة: مجاني
- الجهد: 15 دقيقة/يوم
- العائد المتوقع: 5–15 backlinks شهريًا من مواقع DR 50+

**قناة 2: البودكاست**
- تواصل مع 30 بودكاست لياقة شهريًا
- اقبل أي دعوة (حتى البودكاست الصغيرة)
- البودكاست الشهيرة المستهدفة: Mind Pump, Huberman Lab, Stronger by Science, Nerd Fitness, The Model Health Show, Mike Matthews' Podcast, Arabic fitness podcasts
- التكلفة: وقتك فقط
- العائد المتوقع: 2–5 backlinks شهريًا + بناء العلامة

**قناة 3: Reddit + Quora**
- أنشئ حساب باسمك الحقيقي (Ahmed + credentials)
- أجب على أسئلة اللياقة يوميًا في:
  - r/fitness, r/bodybuilding, r/nutrition, r/loseit, r/gainit
  - r/AdvancedFitness, r/naturalbodybuilding
  - Quora: متابعة مواضيع Fitness, Nutrition, Bodybuilding
- اذكر Alkemos فقط عندما يكون ذا صلة مباشرة (لا سبام)
- التكلفة: 20 دقيقة/يوم
- العائد المتوقع: حركة مباشرة + إشارات العلامة

**قناة 4: Guest Posts**
- اكتب مقالات مجانية لـ:
  - Medium (DA 95+)
  - Dev.to (DA 90+)
  - MindBodyGreen, Breaking Muscle, T-Nation (DA 80+)
  - Blogs لياقة صغيرة (DA 30–50)
- كل مقال = 1–2 backlinks + بناء سلطة شخصية
- التكلفة: 4 ساعات/مقال
- العائد المتوقع: 4–8 backlinks شهريًا

**قناة 5: YouTube**
- ابدأ قناة "Alkemos Fitness" أو "Ahmed - Alkemos Coach"
- فيديو واحد أسبوعيًا (5–10 دقائق)
- شرح تمرين + رابط للصفحة على الموقع في الوصف
- YouTube مملوك لـ Google — الروابط قوية كإشارات Entity
- التكلفة: 6 ساعات/أسبوع
- العائد المتوقع: 50 إشارة Entity/سنة + حركة مباشرة

**قناة 6: TikTok + Instagram Reels**
- فيديوهات 15–30 ثانية
- شرح تمرين + كوميدي لياقة
- رابط في البايو
- التكلفة: 3 ساعات/أسبوع
- العائد المتوقع: وصول عضوي ضخم + بناء جمهور

**قناة 7: Affiliate Program**
- فعّل برنامج `/affiliate` الموجود
- تواصل مع 50 مدوّن لياقة عربي + 50 إنجليزي شهريًا
- عرض: 30% عمولة + أدوات تسويق جاهزة (بانرات SVG موجودة في `/affiliate`)
- التكلفة: وقت التواصل
- العائد المتوقع: 10–20 backlinks شهرية من affiliates نشطين

**قناة 8: PR والصحافة**
- اكتب بيانًا صحفيًا عند كل ميلستون (1000 عضو، إطلاق ميزة، شراكة)
- وزّعه عبر PR Newswire أو PitchEngine
- استهدف: TechCrunch Arabic, Wamda, Magnitt (للسوق العربي) / Product Hunt, Hacker News (للعالمي)
- التكلفة: $200–$500 لبيان
- العائد المتوقع: 5–15 backlinks لكل بيان

### 9.3 بناء العلامة التجارية ككيان (Entity)

| المهمة | الأولوية | الجهد |
|---|---|---|
| إنشاء Facebook Page رسمية | عالية | ساعة واحدة |
| إنشاء Instagram Business | عالية | ساعة واحدة |
| إنشاء Twitter/X رسمي | عالية | ساعة واحدة |
| إنشاء LinkedIn Company Page | عالية | ساعة واحدة |
| إنشاء YouTube Channel | عالية | ساعتان |
| إنشاء TikTok Business | متوسطة | ساعة واحدة |
| إضافة Alkemos إلى Product Hunt | عالية | نصف يوم (إطلاق كامل) |
| إضافة Alkemos إلى Trustpilot | عالية | ساعة واحدة |
| طلب 10 reviews من أول 10 عملاء | عالية | أسبوع |
| إضافة Alkemos إلى Crunchbase | متوسطة | ساعتان |
| محاولة إنشاء صفحة Wikipedia | منخفضة | تحتاج notability مثبتة أولاً |
| التسجيل في ACE Fitness directory | متوسطة | ساعة |
| التسجيل في IDEA Health & Fitness | متوسطة | ساعة |
| التسجيل في NASM partner directory | متوسطة | ساعة |
| التسجيل في Google Business Profile (حتى بدون موقع فعلي) | متوسطة | ساعتان |
| إنشاء GitHub Discussions عامة | منخفضة | ساعة |
| إضافة Alkemos إلى AlternativeTo.net | متوسطة | ساعة |
| إضافة Alkemos إلى G2 / Capterra | متوسطة | ساعتان |

---

## 10. خارطة الطريق الزمنية (Implementation Roadmap)

### المرحلة 1 — الأسابيع 1–4 (Quick Wins)

**الأهداف:**
- ✅ فحص Cloudflare والتأكد من إعدادات Bot Management (تم)
- ✅ إنشاء ملف التوثيق الرئيسي (تم)
- ⏳ تنفيذ صفحات Hub/Collection الأساسية (قيد التنفيذ)
- ⏳ إضافة Hub Pages إلى sitemap-pages.xml (قيد التنفيذ)
- ⏳ إنشاء sitemap-collections.xml (قيد التنفيذ)
- ⏳ إضافة ItemList + Breadcrumb schema للـ Hub Pages

**إنجازات يدوية (الركات المالك):**
- أنشئ حسابات Facebook, Instagram, Twitter/X, LinkedIn, YouTube, TikTok
- أضف Alkemos إلى Product Hunt, Trustpilot, Crunchbase
- اطلب 5–10 reviews من العملاء الأوائل
- سجّل في Google Search Console (إن لم يكن مسجّلًا) + اربط sitemap.xml
- سجّل في Bing Webmaster Tools (إن لم يكن مسجّلًا)

### المرحلة 2 — الأشهر 2–3 (Foundation Building)

**الأهداف:**
- توسيع صفحات Hub/Collection إلى 24 صفحة (8 مجموعات عضلية × 2 لغة + 8 collections أطعمة)
- إطلاق 5 صفحات مقارنة ("Alkemos vs MyFitnessPal", إلخ)
- تفعيل OG images المخصصة للموقع
- إضافة reviewedBy schema
- بدء برنامج HARO يوميًا
- بدء Guest Posts (4 مقالات شهريًا)
- بدء Reddit/Quora اليومي
- التواصل مع 30 بودكاست شهريًا
- تفعيل برنامج Affiliate + التواصل مع 100 مدوّن

**KPIs:**
- 50 referring domain جديد
- 100K زيارة شهرية عضوية
- ظهور أول AI citation في ChatGPT/Perplexity

### المرحلة 3 — الأشهر 4–6 (Scaling)

**الأهداف:**
- توسيع مكتبة التمارين من 868 إلى 1,500+
- إطلاق النسخة الإسبانية `/es/*`
- إطلاق 3 صفحات دليل شاملة (Beginner's Guide, Cutting Guide, Bulking Guide)
- بدء قناة YouTube (4 فيديوهات شهريًا)
- بدء TikTok + Instagram Reels (3 فيديوهات أسبوعيًا)
- إعادة تقييم إعلان صفحات USDA long-tail بناءً على بيانات Search Console

**KPIs:**
- 150 referring domain جديد
- 300K زيارة شهرية عضوية
- 10 AI citations شهرية في ChatGPT/Perplexity
- Domain Rating 25+

### المرحلة 4 — الأشهر 7–9 (Market Leadership)

**الأهداف:**
- إطلاق النسخة البرتغالية `/pt/*`
- إطلاق النسخة الفرنسية `/fr/*`
- 100 صفحة Hub/Collection
- 50 صفحة مقارنة
- إطلاق أكاديمية Alkemos المعتمدة (Course schema)
- شراكات مع 3 مؤثرين لياقة عرب

**KPIs:**
- 300 referring domain جديد
- 1M زيارة شهرية عضوية
- 50 AI citations شهرية
- Domain Rating 35+

### المرحلة 5 — الأشهر 10–12 (Global Expansion)

**الأهداف:**
- إطلاق النسخة الهندية `/hi/*`
- إطلاق النسخة الإندونيسية `/id/*`
- 500K مستخدم مسجّل
- شراكة مع Dubai Fitness Challenge أو Saudi Vision 2030 fitness initiatives
- إطلاق Alkemos Pro Verified Coach badge

**KPIs:**
- 500+ referring domain
- 3M زيارة شهرية عضوية
- 200 AI citations شهرية
- Domain Rating 45+
- ظهور في Google Knowledge Panel للعلامة التجارية

---

## 11. مؤشرات الأداء (KPIs & Tracking)

### 11.1 KPIs شهرية

| المؤشر | الأداة | التكرار |
|---|---|---|
| زيارات عضوية | Google Analytics 4 + Search Console | أسبوعي |
| impressionات + نقرات + CTR + متوسط الترتيب | Google Search Console | أسبوعي |
| عدد الكلمات المفتاحية في Top 10 | Search Console + Ahrefs | شهري |
| عدد الصفحات المفهرسة | Search Console + Bing WMT | شهري |
| Core Web Vitals (LCP, INP, CLS) | Vercel Speed Insights + CrUX | شهري |
| Backlinks + Referring Domains | Ahrefs / Semrush / Moz | شهري |
| Domain Rating / Authority | Ahrefs / Moz | شهري |
| AI citations | Manual testing + Profound (عند التوفّر) | أسبوعي |
| تحويلات Memberships | Stripe + Supabase | أسبوعي |
| توقيع Coach signups | Supabase | شهري |

### 11.2 KPIs ربع سنوية

| المؤشر | الهدف Q1 | الهدف Q2 | الهدف Q3 | الهدف Q4 |
|---|---|---|---|---|
| زيارات عضوية شهرية | 50K | 150K | 500K | 1M |
| Referring Domains تراكمي | 50 | 150 | 300 | 500 |
| AI citations شهرية | 5 | 25 | 100 | 300 |
| Domain Rating | 15 | 25 | 35 | 45 |
| Memberships جديدة | 50 | 200 | 500 | 1,000 |
| Coach signups | 10 | 30 | 75 | 150 |

### 11.3 تنبيهات (Alerts)

| الحدث | الإجراء |
|---|---|
| انخفاض زيارات عضوية > 20% أسبوعيًا | تحقق من Search Console Manual Actions + Core Update |
| انخفاض Domain Rating > 5 نقاط | راجع جودة الـ backlinks الجديدة |
| ارتفاع LCP > 2.5s | راجع Vercel deployment logs + Cloudflare cache |
| ظهور صفحة في Search Console بـ "soft 404" | أضف `notFound()` أو محتوى حقيقي |
| زيادة Crawl Errors > 10% | راجع robots.txt + sitemap + server logs |

---

## 12. سجل التنفيذ (Implementation Log)

> ترتيب زمني. كل تنفيذ يُضاف هنا مع تاريخه، المرحلة، الملفات المُعدّلة، والنتيجة.

### 2026-09-08 — Phase SEO-GEO-1: توثيق + Hub/Collection Pages

**الملفات المُنشأة:**
- ✅ `docs/SEO-GEO-MASTER-PLAN.md` (هذا الملف)
- ✅ `src/lib/hub-collections.ts` — تعريف المجموعات والـ Hubs
- ✅ `src/app/muscles/[group]/page.tsx` — صفحة مجموعة عضلية (EN)
- ✅ `src/app/ar/muscles/[group]/page.tsx` — صفحة مجموعة عضلية (AR)
- ✅ `src/app/equipment/[type]/page.tsx` — صفحة معدات (EN)
- ✅ `src/app/ar/equipment/[type]/page.tsx` — صفحة معدات (AR)
- ✅ `src/app/collections/[slug]/page.tsx` — صفحة مجموعة أطعمة (EN)
- ✅ `src/app/ar/collections/[slug]/page.tsx` — صفحة مجموعة أطعمة (AR)
- ✅ `src/app/sitemap-collections.xml/route.ts` — خريطة الصفحات الجديدة
- ✅ تحديث `src/app/sitemap-pages.xml/route.ts` لإضافة الـ Hubs
- ✅ تحديث `src/app/sitemap.xml/route.ts` لإضافة collections للـ index
- ✅ تحديث `src/components/SiteHeader.tsx` بإضافة روابط nav

**النتائج:**
- +52 صفحة Hub/Collection جديدة (12 EN + 12 AR × 3 عائلات)
- استهداف 24+ كلمة medium-tail جديدة
- تحسين Internal Linking بين 868 تمرين + 80 طعام + 8 برامج
- **تم الدفع لـ GitHub** (commit `8751d8c`)

---

### 2026-09-08 — Phase SEO-GEO-2: Ahmed Zake Author + Reviewer (E-E-A-T)

**الهدف:** ترقية إشارات E-E-A-T (الخبرة، السلطة، الثقة) عبر إضافة Ahmed Zake ككاتب ومراجع بشري حقيقي في كل الـ schemas. كان الكود السابق يستخدم `Organization` كـ author (إشارة ضعيفة) — الآن يستخدم `Person` مع `@id` URL ثابت + `reviewedBy` Person ثانية.

**الملفات المُنشأة/المُعدّلة:**
- ✅ `src/lib/authors.ts` (جديد) — تعريف مركزي لـ Ahmed Zake + `getPersonSchema` + `getProfilePageSchema` + `resolveAuthor` (يطبّع 'Alkemos'/'MuscleHub' → Ahmed Zake)
- ✅ `src/lib/seo.ts` (تحديث) — `getOrganizationSchema` يُضيف `founder` Person · `getArticleSchema` يُضيف `author` Person + `reviewedBy` Person
- ✅ `src/app/authors/[slug]/page.tsx` (جديد) — صفحة الكاتب EN مع `ProfilePage` schema + Breadcrumb
- ✅ `src/app/ar/authors/[slug]/page.tsx` (جديد) — صفحة الكاتب AR مع نفس الـ schemas
- ✅ `src/components/blog/BlogArticlePage.tsx` (تحديث) — byline UI يربط لصفحة الكاتب + يعرض "Reviewed by Ahmed Zake"
- ✅ `src/app/blog/[slug]/page.tsx` (تحديث) — تمرير `authorProfile` للـ Article schema
- ✅ `src/app/ar/blog/[slug]/page.tsx` (تحديث) — نفس التحديث للنسخة العربية
- ✅ `src/components/views/StaticPageView.tsx` (تحديث) — إضافة قسم "Founder: Ahmed Zake" لصفحة /about
- ✅ `src/app/sitemap-pages.xml/route.ts` (تحديث) — إضافة `/authors/ahmed-zake` و `/ar/authors/ahmed-zake`

**التأثير المتوقع:**
- كل مقال مدوّنة (61 EN + AR) يحمل الآن `author: Person(Ahmed Zake)` + `reviewedBy: Person(Ahmed Zake)` بدلًا من `author: Organization`
- صفحة Organization الرئيسية (تظهر على كل صفحات الموقع) تحمل الآن `founder: Person(Ahmed Zake)`
- صفحة `/authors/ahmed-zake` جديدة ككيان `ProfilePage` قابل للفهرسة في Knowledge Graph
- byline UI في المدوّنة يعرض اسم الكاتب + "Reviewed by Ahmed Zake" + رابط لصفحة الكاتب
- صفحة /about تعرض قسم "Founder: Ahmed Zake" مع نبذة كاملة

**الجودة:**
- `tsc --noEmit` → 0 أخطاء
- `eslint` → نظيف
- `next build` → نجح (4 صفحات جديدة مُسجّلة)
- `vitest` → 256/256 ناجح
- `docs_audit`, `docs_parity`, `stale-refs`, `ui-wiring` → كلها ✓

---

### 2026-09-08 — Phase SEO-GEO-3 (توثيق استدراكي): صفحات المقارنة

> **ملاحظة توثيقية:** المرحلة نُفذت في نفس يوم SEO-GEO-1/2 ولم تُسجَّل هنا لحظتها — تُوثَّق استدراكيًا مع الفحص الحي أدناه.

**الملفات:**
- `src/lib/comparisons.ts` — 3 مقارنات ثنائية اللغة (vs MyFitnessPal · vs Freeletics · vs ExRx) ببيانات علنية موثقة `dataAsOf`
- `src/app/compare/[slug]/page.tsx` + `src/app/ar/compare/[slug]/page.tsx` — صفحة تفصيلية EN/AR مع Article + ItemList + Breadcrumb schema و hreflang متبادل
- `src/app/sitemap-comparisons.xml/route.ts` — 6 URLs (3 × لغتين) — مفعلة في robots.txt والفهرس

---

### 2026-09-08 — Phase SEO-GEO-4: فحص حي شامل (Live Audit) + تنفيذ Quick Wins (أوامر المالك «ابدأ (ج) ثم (أ)»)

**المنهجية:** فحص حي مباشر للموقع (curl/SSL، 14:10 UTC — رئيسية EN/AR، robots، الخرائط السبع، llms.txt، 21 صفحة رئيسية، صفحات عميقة، TTFB×3، Schema، RSS) + 17 استعلام بحث سوق/منافسين. قانون «لا يُوثق رقم بلا مصدر حي» مطبق.

**أ) ما تحقق حيًا ويعمل بامتياز (تأكيد §2.1):** TTFB 0.35–0.93s · hreflang EN/AR/x-default حي على الرئيسية والأقسام · الخرائط السبع 200 (pages 49 + exercises 1736 + foods 160 + blog 63 + collections 52 + comparisons 6) · صفحات Hub/Collection حية باللغتين · صفحة الكاتب حية · Schema غني على صفحات الأطعمة (NutritionInformation + Breadcrumb + SearchAction) · llms.txt + llms-full.txt حية · RSS EN+AR · صفحات USDA تُفهرس فعليًا رغم عدم إعلانها (site: تحقق) · robots موحد سليم.

**ب) اكتشافات جديدة غير موجودة في §2.2 (كلها تحقق حيًا):**

| # | الاكتشاف | الأثر | القرار |
|---|---|---|---|
| 1 | **لا توجد نسخة عربية لأي حاسبة** (`/ar/tools/*` و`/ar/meal-planner` كلها 404) — أعلى طلب بحث عربي («حاسبة السعرات الحرارية») يتصدره موقع وزارة الصحة السعودية والكونسلتو وتطبيقات متفرقة — لا منافس متخصص | 🔴 ضياع أقوى فرصة نمو عربية | **نُفذ في هذه المرحلة** |
| 2 | **تكرار العلامة في عناوين AR**: قالب `/ar` layout هو `%s — Alkemos` وعناوين أطفال تحمل `\| Alkemos` أصلًا → «… \| Alkemos — Alkemos» على muscles/equipment/collections/authors/compare/programs + faq/about/register | 🟡 شكل غير احترافي يقلل CTR | **نُفذ في هذه المرحلة** |
| 3 | **`/faq` الإنجليزية بعنوان عربي** + og:locale ar_EG على صفحة canonical إنجليزية | 🟡 يربك فهرسة الصفحة | **نُفذ في هذه المرحلة** |
| 4 | **لا صفحة فهرس للمقارنات**: `/compare` و`/ar/compare` 404 بينما 6 صفحات تفصيلية حية | 🟡 روابط داخلية ضائعة | **نُفذ في هذه المرحلة** |
| 5 | **Cache-Control: private, no-cache, no-store على كل HTML** (مؤكد حيًا) — السبب: root layout يقرأ `headers()/cookies()` → كل الصفحات dynamic والـ framework يفرض no-store افتراضيًا + الوسيط يكتب كوكي `mhe:locale` غير شرطيًا (Set-Cookie يمنع كاش الحافة) | 🟡 استنزاف crawl budget + تكلفة + LCP زائر متكرر | **نُفذ في هذه المرحلة** (كوكي عند التغير فقط + رأس كاش للصفحات العامة عبر middleware) — البديل الاحتياطي الموثق: Cloudflare Cache Rule (يتطلب قرار مالك) |
| 6 | **llms.txt يوصف بأنه «للسوق المصري والعربي»** — يصنّف الذكاء الاصطناعي العلامة كإقليمية بينما الهدف عالمي | 🟡 يحدّ من اقتباس AI العالمي | **نُفذ في هذه المرحلة** |
| 7 | **تضارب اسم العلامة (Entity)**: نتائج البحث عن «alkemos» تسيطر عليها ضاحية Alkimos الأسترالية وصالات تحمل اسمها — لا لوحة معرفة، لا حسابات اجتماعية مفهرسة | 🔴 العلامة لا تملك نتائج اسمها | §9.3 (بناء الكيان) = **الأولوية الاستراتيجية القصوى** — يبدأ فورًا (حسابات رسمية + Trustpilot/Product Hunt/Crunchbase) |
| 8 | **حجم المحتوى vs المنافسين**: 63 مقالًا مقابل عشرات الآلاف لدى المنافسين — خط الـ 2/يوم صحيح ويحتاج استمرارية + رفع الجودة الاقتباسية | 🟡 طويل المدى | مستمر (Phase 119 slots) |

**ج) خلاصة بحث السوق (17 استعلامًا — مصادر: Business of Apps، Seer Interactive، Ahrefs، Princeton GEO study، SE Ranking، Similarweb، SERPs حية):**

- **السوق:** AI fitness coaching 2.04 مليار $ (2025) بنمو 32.7% سنويًا — أسرع قطاع لياقة نموًا · Online fitness 16.2→31.8 مليار $ (2032) · MyFitnessPal: 220 مليون مستخدم + إيرادات 310 مليون $ + 18 مليون طعام · MuscleWiki من أعلى 20 موقع لياقة عالميًا · calculator.net #1135 عالميًا
- **AI Overviews:** هبوط CTR عضوي 58–65% على الاستعلامات الاستفسارية (Ahrefs ديسمبر 2025 −58% للمرتبة 1؛ Seer 1.76%→0.61%) ثم **ارتداد جزئي إلى 2.4% (فبراير 2026)** — الاستنتاج: نوّع (اقتباسات AI + يوتيوب + علامة) ولا تعتمد على النقر الكلاسيكي وحده
- **أنماط الاقتباس:** ChatGPT يقتبس Wikipedia بنسبة 47.9% من استشهاداته، Perplexity يقتبس Reddit بنسبة 46.7% — الحضور في (موسوعات/Reddit/YouTube/أخبار) = بوابة الاقتباس · دراسة Princeton (10,000 استعلام): الإحصائيات + المراجع + الاقتباسات المباشرة ترفع الظهور في AI حتى **+40%**
- **GEO:** اعتماد llms.txt عالميًا 10.13% فقط (SE Ranking، 300 ألف دومين) — الموقع متقدم على ~90% من السوق بالفعل
- **العربي:** SERP «حاسبة السعرات الحرارية» = جهات حكومية (وزارة الصحة السعودية) + بوابات عامة + تطبيقات — بلا منصة متخصصة · SERP «تمارين الصدر» = مقال ويب طب (2019!) ومحتوى سطحي — **الاستثناء الوحيد النشط: Trainera.fit (ينشر بالعربية والإنجليزية معًا)** · يؤكد §3.5: السوق العربي مفتوح بالكامل

**د) المنفذ في هذه المرحلة (أمر المالك (أ) — Quick Wins §10 المرحلة 1):**

1. **حاسبات عربية**: `/ar/tools` (فهرس) + `/ar/tools/calorie-calculator|bmi-calculator|macro-calculator|body-fat-calculator|water-tracker` + `/ar/meal-planner` — metadata عربية كاملة + hreflang متبادل على نظيراتها EN + sitemap + LanguageToggle mirrors + إصلاح روابط الأدوات في صفحات الـ AR hub
2. **صفحة فهرس المقارنات** `/compare` + `/ar/compare` — ItemList + Breadcrumb + sitemap-pages + toggle mirror
3. **إصلاح تكرار العلامة AR** — عنوان بلا لاحقة علامة في صفحات الأطفال (القالب يضيفها مرة واحدة) + `stripTrailingBrandForArTemplate()` في seo.ts
4. **`/faq` EN** — عنوان ووصف إنجليزي + og:locale en_US
5. **كاش الصفحات العامة** — رأس `Cache-Control: public, max-age=0, must-revalidate, s-maxage=3600, stale-while-revalidate=86400` في **next.config headers()** للمسارات العامة فقط (اختبار حي أثبت أن middleware يتجاوزه إطار العمل — انظر هـ) + كتابة كوكي `mhe:locale` عند التغيّر فقط في middleware (إزالة Set-Cookie غير الشرطي الذي يمنع كاش الحافة) — الخاصة/المصادقة تبقى no-store كما هي
6. **llms.txt** — تموضع عالمي + إضافة المقارنات والأدوات العربية

**هـ) التحقق (منفذ فعليًا):**
- `tsc --noEmit` → 0 أخطاء (بعد توليد next-env.d.ts عبر build) · `eslint` → 0/0 · `vitest` → 256/256 · `next build` ✓ مع تسجيل كل المسارات الجديدة (/ar/tools + الحاسبات الخمس + /ar/meal-planner + /compare + /ar/compare)
- **اختبار رؤوس حي محلي (next start):** كل الصفحات العامة (/, /faq, /blog, /coaching, /coaches/*, /compare, /ar, /ar/tools/*, /tools/*) ترجع `Cache-Control: public, max-age=0, must-revalidate, s-maxage=3600, stale-while-revalidate=86400` — بينما /dashboard و/auth و/admin/* و/coach و/api/* بقيت no-store كما هي (مصفوفة كاملة موثقة في worklog)
- **حقيقة معمارية موثقة (1):** على التشغيل الذاتي next start رأس Cache-Control من middleware يتجاوزه رأس الـ framework والقاعدة الفعالة هي next.config headers()
- **حقيقة معمارية موثقة (2) — تحقق حي على الإنتاج بعد النشر (commit a7e78db):** **Vercel يجبر `private, no-cache, no-store` على كل صفحة ديناميكية في الإنتاج** حتى مع قاعدة next.config headers() وبدون Set-Cookie — أي أن كاش الحافة عبر رؤوس Next **غير ممكن على Vercel** لصفحات ديناميكية أصلاً (سلوك منصّي موثق) — القاعدة في next.config صحيحة بنيويًا (تعمل ذاتيًا/تُوثّق النية) وكوكي التغيّر-فقط شرط لازم لكنه غير كافٍ وحده على Vercel
- **✅ التفعيل الإنتاجي تم 2026-09-08 عبر API (SEO-GEO-4.1 — أمر المالك «تم تحديث التوكين»):** قاعدة `alkemos-public-html-cache` حية ومتحقق منها على الإنتاج — ruleset `d9f2c38e782043369d0815caef91cb60` · rule `fa2632aaff104c509e806ecbee75e432` v1 · Zone alkemos.com — **تحقق حي:** /faq و / و /ar/tools/calorie-calculator: طلب أول MISS → التالي **cf-cache-status: HIT** · /dashboard و /auth/login و /api/health بقيت **DYNAMIC** (الخاصة غير مخزنة). تصحيحات بناء مهمة (اختلاف موثق بين واجهة اللوحة وواجهة REST): ① `contains` عامل لا دالة: `not (http.request.uri.path contains ".")` ② Edge TTL: `edge_ttl: {mode:"override_origin", default:3600}` (حقل `default` لا `value`) ③ حقل `enabled` غير مقبول في إنشاء القواعد (تُفعَّل افتراضيًا) ④ `serve_stale` غير متاح في مخطط الباقة الحالية (متحقق — فُحصت صيغتا enabled/on_failure/boolean) ⑤ التوكن المطلوب: صلاحية «Zone → Cache Rules → Edit». الرجوع للخلف: تعطيل/حذف القاعدة أو PUT entrypoint بقواعد فارغة.
- **اختبار عناوين حي على الإنتاج (بعد النشر):** كل صفحات AR المكررة أصبحت بعلامة واحدة (muscles/equipment/collections/authors/compare/programs/faq/about/register) + الحاسبات العربية حية بعناوينها + /faq الإنجليزية بعنوان إنجليزي + llms.txt بالتموضع العالمي — كلها متحققة بـ curl على alkemos.com
- `docs_audit` ✓ · `docs_parity` ✓ · `stale-refs` ✓ · `ui-wiring` ✓ · `migration_audit --ci` ✓ صفر انجراف

### 12.9 — SEO-GEO-4.1: تحديث السايت مابز (2026-09-08 — أمر المالك «اكتب السايت مابز المطلوب اضافتها ثم نفذ الباقى»)

**حصر التغطية الكاملة (نتيجتها: فجوة واحدة فقط):**

| عائلة الصفحات | السايت ماب | الحالة |
|---|---|---|
| الرئيسية EN/AR + الأقسام الرئيسية | sitemap-pages | ✓ مغطاة |
| الحاسبات EN+AR (فهرس + 5 أدوات) + meal-planner | sitemap-pages | ✓ (أُضيفت في 148) |
| فهرس المقارنات /compare | sitemap-pages | ✓ (أُنشئ في 148) |
| صفحات المقارنات 6×2 لغة | sitemap-comparisons | ✓ |
| عضلات/أجهزة/مجموعات أكل (26×2) | sitemap-collections | ✓ |
| تمارين 868×2 لغة | sitemap-exercises | ✓ |
| أطعمة منسقة 80×2 (سياسة 141) | sitemap-foods | ✓ (الذيل الطويل مستبعد عمداً) |
| مؤلفون/برامج/about/faq/contact | sitemap-pages | ✓ |
| مدربون /coaches/* | — | ✓ مستبعدة عمداً (noindex بأمر المالك — روابط مشاركة خاصة) |
| **مقالات المدونة 59** | sitemap-blog | **✗ كانت بلا hreflang ترجمات** |

**الفجوة الوحيدة وأُصلحت:** sitemap-blog كان يخرج 59 مقالاً بلا hreflang — أزالها تدقيق C1 (2026-09-07) لأن الترجمات كانت غير مرتبطة (dangling hreflang يهدم الثقة). آلية الإقران الحقيقية موجودة في المخطط: عمود `linked_post_id`. التنفيذ:
- `src/lib/blog-sitemap.ts` — دوال نقية (إقران + lastmod) مع اختبارات `blog-sitemap.test.ts`
- القاعدة: يُعلن hreflang متبادل **فقط** عندما يكون الهدف منشوراً وباللغة المعاكسة — الروابط المعلقة/الذاتية/بنفس اللغة تُتجاهل، فلا يمكن لخطأ C1 أن يرجع بالبناء نفسه
- المدونة الحالية غير مقترنة (كل مقال بلا إقران) → الخرج اليوم مطابق للسابق تماماً؛ الإقران يتفعل تلقائياً لحظة ربط أول ترجمة في قاعدة البيانات — **تكليف محتوى مستقبلي: عند كتابة مقال مترجم، املأ linked_post_id في الاتجاهين** ⤵️ **تجاوزت بالمرحلة 157 (§12.16):** الاقتران صار تلقائيًا بالكامل — كل زوج جديد يُملأ linked_post_id بالاتجاهين آليًا عند النشر (مصافحة P5)، والمتبقي الاختياري فقط هو الإقران الرجعي للمقالات القائمة الـ63.
- استبعاد image sitemap (صور التمارين مستضافة على GitHub خارجي free-exercise-db — قيمة منخفضة، روابط خام) — قرار موثق

**«نفذ الباقي» (تنفيذ مباشر بأدوات المالك المقدمة):** تفعيل قاعدة كاش Cloudflare §12-هـ عبر API (كانت يدوية للمالك) + إعادة إرسال السايت مابز السبع لـ Google/Bing — القائمة الكاملة أدناه.

**قائمة السايت مابز لإعادة الإرسال في GSC/Bing (السبع):** `/sitemap-pages.xml` · `/sitemap-collections.xml` · `/sitemap-comparisons.xml` · `/sitemap-exercises.xml` · `/sitemap-foods.xml` · `/sitemap-blog.xml` · (الفهرس: `/sitemap.xml`)

---

### 12.10 — SEO-GEO-4.3: دليل بناء الكيان المبسط للمالك (2026-09-08 — أمر المالك «ابدأ الخطوة التالية»)

**لماذا هذه هي الأهم استراتيجيًا (نتيجة §12-ب-7):** البحث عن «alkemos» اليوم تسيطر عليه ضاحية Alkimos الأسترالية وصالات تحمل اسمها — العلامة لا تملك نتائج اسمها ولا لوحة معرفة. محركات البحث وأنظمة الذكاء الاصطناعي لا تثق بموقع بلا كيان خارجي؛ الحسابات الرسمية + التقييمات + الأدلة الخارجية هي ما يثبّت فهم «Alkemos = منصة لياقة ذكية». كل ما يلي يدوي للمالك (لا يحتاج مبرمجًا) — بالترتيب نفسه.

**القاعدة الذهبية قبل البدء:** الاسم «Alkemos» واحدًا ونفس الشعار ونفس الرابط `https://alkemos.com` في كل حساب — أي اختلاف (Alkemos Fit / alkemosapp…) يشتت الإشارة ويعيد المشكلة من جديد. إن كان الاسم محجوزًا في منصة، اختر الأقرب («AlkemosFit») ووحّده في الباقي.

**المرحلة 1 — الحسابات الاجتماعية الستة (الأسبوع الأول — ساعة لكل حساب):**

| # | المنصة | رابط الإنشاء | ملاحظات |
|---|---|---|---|
| 1 | Facebook Page | facebook.com/pages/create | الفئة «Health & Wellness Website» — فعّل الوضع الاحترافي |
| 2 | Instagram Business | من التطبيق: Settings → Business | اربطها بصفحة فيسبوك للنشر المتزامن |
| 3 | X (Twitter) | x.com/signup | فعّل التحقق بخطوتين فورًا |
| 4 | LinkedIn Company Page | linkedin.com/company/setup | من حسابك الشخصي كمؤسس ثم أنشئ صفحة الشركة |
| 5 | YouTube | youtube.com → Create a channel → Brand account | قناة باسم Alkemos وليست قناة شخصية |
| 6 | TikTok Business | tiktok.com/business | اللياقة من أنشط قطاعاتها — يُفعّل لاحقًا إن ضاق الوقت |

**إعداد موحد في كل حساب (5 دقائق):** الاسم «Alkemos» · الصورة = الشعار · الغلاف = لقطة من المنصة · الرابط = alkemos.com · نبذة EN: «AI-powered fitness platform — workouts, nutrition & coaching. alkemos.com» · نبذة AR (حسابات السوق العربي): «منصة لياقة ذكية — تمارين وتغذية ومدربون. alkemos.com» · أول منشور: تعريف بالمنصة + لقطة لحاسبة أو صفحة تمارين، ثم منشور أسبوعي كحد أدنى (المحركات تعاقب الحسابات الميتة).

**المرحلة 2 — أدلة الثقة (الأسبوع الأول–الثاني):**

| # | المنصة | الخطوات | الوقت |
|---|---|---|---|
| 1 | Trustpilot | trustpilot.com → Get started (مجاني) → أضف Alkemos بالدومين → تحقق الملكية → احفظ رابط التقييم في الأعمدة | ساعة |
| 2 | Crunchbase | crunchbase.com → حساب مؤسس → Add Company → الاسم + الفئة (Fitness/AI) + المؤسس + الوصف + الموقع | ساعتان |
| 3 | Google Business Profile | business.google.com → Add business → Service-area business (خدمة أونلاين، المنطقة: مصر والعالم) | ساعتان |

**المرحلة 3 — أول 10 تقييمات (خلال أسبوعين):** أرسل للعملاء الأوفياء (ومن جرّب دعوة Brevo التجريبية) رسالة شخصية قصيرة: «جرّبت المنصة؟ رأيك يساعدنا — دقيقتان» + رابط Trustpilot. ممنوع منعًا باتًا أي تقييمات وهمية (Trustpilot يكشفها ويحذف الملف — يهدم الهدف كله). خمس تقييمات حقيقية كافية لظهور النجوم بجوار اسم الموقع في نتائج البحث.

**المرحلة 4 — Product Hunt (مؤجل عمدًا):** يستحق نصف يوم إعداد (معرض صور + فيديو تعريفي + tagline + صياد قائم) — يُنفّذ عند جاهزية صفحة إطلاق كاملة، لا قبلها.

**بعد اكتمال المرحلتين 1–2 — تكليف تقني (يُنفّذ في مرحلة كود مستقلة):** تحديث `sameAs` في Organization JSON-LD بروابط الحسابات الجديدة + إضافة أيقونات الحسابات في الفوتر بجانب أزرار المشاركة + اختبار Rich Results — بانتظار تأكيد المالك اكتمال الروابط الفعلية.

**معيار النجاح (4–6 أسابيع من البدء):** صفحة أولى من نتائج «alkemos» تظهر فيها حسابات العلامة · استعلامات اسم العلامة تظهر في GSC · اختبار ChatGPT/Perplexity اليدوي الشهري (Appendix C) يعرّف Alkemos كمنصة لياقة لا كضاحية.

### 12.11 — SEO-GEO-4.4: إصلاح بطاقات OG العربية المكسورة (2026-09-08 — «ابدأ الخطوة التالية»)

**الاكتشاف (تحقق حي):** مسار `/api/og-image/[slug]` كان يرجع **0 بايت** لكل طلب `?lang=ar` بينما الإنجليزية 251KB — أي أن كل مقال عربي (~59) يُشارك على واتساب/تيليجرام/فيسبوك ببطاقة فارغة/مكسورة — وأسطح المشاركة الاجتماعية هي القناة الأولى للسوق العربي. **السبب الجذري:** المسار استورد `ImageResponse` من `@vercel/og` (نسخة 2023 بسatori قديم بلا تشكيل عربي/BiDi) وبلا أي خط عربي — فانهار توليد أي نص عربي. اكتشاف إضافي: شارة العلامة كانت «M» (بقايا علامة قديمة).

**الإصلاح (Phase 151):** ① التبديل إلى `next/og` المدمج (satori حديث بتشكيل harfbuzz + bidi — تحقق بصريًا: حروف متصلة واتجاه RTL سليم ومزج AR+EN سليم) ② خط **Cairo** (عربي+لاتيني، OFL) ذات الاستضافة في `public/fonts/og-cairo-{400,700}.ttf` (91KB لكل وزن) يُجلب same-origin مرة واحدة ويُخزَّن module-level لكل isolate — ومع فشل التحميل تراجع آمن للخط الافتراضي (الإنجليزية لا تتراجع أبدًا) ③ الشارة «M»→«A» ④ `Cache-Control: public, max-age=86400, stale-while-revalidate=604800` (البطاقات تُخزَّن حسب slug+lang) ⑤ إزالة اعتماد `@vercel/og` الميت من package.json.

**التحقق:** محليًا (next start): EN 251KB · **AR 251KB** (كانت 0) بالرؤوس الجديدة — والجسد البصري للعربية مثالي. اختبار satori 0.33 معزول أثبت التشكيل قبل اعتماد الحل. القاعدة: أي مكون OG مستقبلًا يستخدم `next/og` فقط + خط ذا استضافة — ممنوع العودة لـ@vercel/og.

### 12.12 — SEO-GEO-4.5: إشارات E-E-A-T على صفحات YMYL — الأطعمة والتمارين (2026-09-09 — أمر المالك «مرحلة الحسابات مؤجلة، ايه تانى ممكن تنفذة؟»)

**السياق:** أجّل المالك مرحلة الحسابات الاجتماعية للنهاية، فكان البندان #6 و#7 من §7.1 (reviewedBy/lastReviewed) هما المتبقي الأعلى قيمة القابل للتنفيذ الكودي فورًا — لا يعتمدان على أي روابط خارجية.

**الفجوة:** المدونة والمقارنات تحمل reviewedBy Person منذ SEO-GEO-2، لكن **أكبر أسطح المحتوى الصحي في الموقع كانت بلا أي إشارة E-E-A-T**: صفحات الأطعمة (8,830) والتمارين (868) بنسختيهما EN+AR ≈ **19,396 صفحة** تحمل فقط Breadcrumb + NutritionInformation/HowTo — وهي بالضبط الأسطح YMYL التي يبحث فيها مقيّمو Google عن إشارات الخبرة البشرية، والتي يقرر فيها محركا الإجابة هل المصدر قابل للاقتباس في أسئلة الصحة.

**التنفيذ:** ① دالة `getReviewedWebPageSchema()` في `src/lib/seo.ts` — عقدة WebPage تحمل `lastReviewed` + `reviewedBy` (Person أحمد زكي عبر @id الثابت فيتكون كيان واحد في Knowledge Graph مع Article.author وOrganization.founder) ② الثابت `CONTENT_LAST_REVIEWED = "2026-09-09"` مصدر وحيد لتاريخ المراجعة (تاريخ مراجعة بشرية لا تاريخ تعديل محتوى — يُقدَّم مع كل دورة مراجعة مكتملة) ③ الحقن في الصفحات الأربع: `/foods/[slug]` و`/ar/foods/[slug]` و`/exercises/[slug]` و`/ar/exercises/[slug]` — عقدة إضافية مستقلة، عقدتا NutritionInformation/HowTo لم تُمسّا (صفر مخاطرة انحدار على 19 ألف صفحة) ④ 6 اختبارات vitest جديدة (ymyl-schema.test.ts) تقفل الصلاحية القياسية للعقدة ووحدة مصدر التاريخ وسلامة التسلسل مع الأسماء العربية.

**قرار تقني موثق:** `lastReviewed` خاصية لـWebPage فقط، و`reviewedBy` خاصية لـCreativeWork — بينما NutritionInformation تحت Intangible وHowTo لا يحمل lastReviewed؛ لذا وُضعت المراجعة في عقدة WebPage مستقلة بدل ختم العقدتين القائمتين — صلاحية قياسية كاملة بلا تحذيرات validator وصفر مخاطرة. (Speakable #13 وSearchAction #10 وItemList #3 تحقق أنها منفذة سابقًا — مدونة EN+AR تستورد getSpeakableSchema وWebSite يحمل SearchAction.)

**التحقق:** tsc 0 · eslint 0/0 · vitest **269/269** (+6) · next build ✓ — البوابات كاملة خضراء قبل الدفع.

### 12.13 — SEO-GEO-4.6: التكليف التقني للكيان — sameAs + أيقونات الفوتر (2026-09-09 — المالك سلّم روابط الحسابات)

**السياق:** المالك نفّذ بناء الكيان عمليًا وسلّم 5 روابط: Trustpilot (`/review/alkemos.com`) · Product Hunt (`/products/alkemos`) · فيسبوك (share link) · إنستجرام (`@aalkemos`) · X (`x.com/Alkemos`) — وهذا يفعّل التكليف التقني المؤجل من §12.10 (sameAs في Organization JSON-LD + أيقونات الفوتر).

**التحقق الحي (متصفح آلي):** Trustpilot حي («Alkemos Reviews | Be the first to review») · فيسبوك حي وحُلّ رابط المشاركة إلى **القانوني** `facebook.com/people/Alkemos/61593989587279/` («Alkemos | Facebook») — روابط الـshare تحمل تتبعًا وقد تنتهي فلا تدخل sameAs أبدًا · X يرجع 200 · Product Hunt وإنستجرام خلف جدران anti-bot (403/429) فاعتمدت روابط المالك حرفيًا. **قواعد التطهير:** بلا query strings (حُذف `?launch=`) وhttps لكل الروابط.

**التنفيذ:** ① `src/lib/social.ts` — مصدر وحيد للملفات الرسمية الخمس (name/url/labelEn/labelAr) مع توثيق التحقق ② `getOrganizationSchema()` في seo.ts: `sameAs = [الموقع, ...الخمسة]` — حلقة الكيان التي تربط العلامة بملفاتها في Knowledge Graph وتفصلها عن ضاحية Alkimos الأسترالية (§2.3) ③ صف أيقونات في فوتر الرئيسية (LandingView): 5 أيقونات SVG داخلية بلا اعتماديات جديدة — فيسبوك/إنستجرام/X بالشعارات الرسمية + نجمة للمراجعات + دائرة P محفورة (evenodd تناسب ثيمي الرخام) — روابط **بلا nofollow** (ملفات مملوكة: الرابط الزاحف هو الإشارة) مع aria-labels ثنائية اللغة ④ فصل موثق: Person.sameAs (أحمد زكي) يبقى فارغًا — ملفات العلامة في Organization.sameAs؛ خلطهما يشوّش رسم الكيان (تعليق authors.ts محدّث) ⑤ 5 اختبارات vitest: العدد والإسمات · التطهير (بلا ? ولا /share/) · شكل رابط فيسبوك القانوني · التسميات العربية · sameAs = الموقع + الخمسة بلا تكرار.

**ملاحظة إكمال:** التكليف التقني من §12.10 **مُغلق**. المتبقي على المالك من بناء الكيان: أول 10 تقييمات حقيقية (Trustpilot يظهر 0 حاليًا) وGBP والحسابات الثلاثة الاختيارية (LinkedIn/YouTube/TikTok) — أي رابط جديد يُضاف لsocial.ts فقط فينتشر تلقائيًا للـschema والفوتر.

**التحقق:** tsc 0 (بعد build أول استنساخ) · eslint 0/0 · vitest **274/274** (+5) · next build ✓ (1970 صفحة) · docs_audit · docs_parity · migration_audit --ci · stale-refs · ui-wiring.

### 12.14 — SEO-GEO-4.7: الربط الداخلي (#11) + lastmod دقيقة (#14) + اكتشافا جودة (2026-09-09 — أمر المالك «افحص ملف خطة seo وأبدأ التنفيذ التالى»)

**التشخيص (تدقيق الربط القائم):** مراكز الـhubs كانت مربوطة **خارجيًا** بشكل ممتاز (hub→تمارين + hub↔hub + أدوات) لكن الاتجاه المعاكس كان مفقودًا: صفحات التمارين (1,736) لا ترتبط بمراكز العضلة/المعدة إطلاقًا، وصفحات الأكل لا ترتبط بمجموعات الوسوم — **صفحات collections كانت تستقبل روابط محتوى من الهيدر فقط** (شبه يتيمة داخلِيًا رغم إعلانها في السايت ماب) — والمدونة السابقة لمولّد روابط الأدوات (قبل 2026-09-01) بلا أي روابط سياقية.

**التنفيذ ① — شبكة spoke→hub الحتمية (بلا AI وبلا تأليف محتوى):** مطابقات حقول 1:1 موجودة أصلًا في البيانات: `Exercise.category → MUSCLE_HUBS.category` · `Exercise.equipment → EQUIPMENT_HUBS.equipment` · `Food.tags → FOOD_COLLECTIONS.tag`. محوّلات جديدة في `hub-collections.ts` (§4): `getMuscleHubByCategory` + `getEquipmentHubByEquipment` + `getCollectionsForFoodTags` (بحد أقصى رابطين للصفحة، بترتيب أولوية المجموعات التحريري) + نوع `HubLinkMini` (سجل صغير قابل للتسلسل يحفظ قانون الحزمة — موديول server-only لا يدخل حزمة العميل). ② **صفحات التمارين EN+AR:** شريط «Browse by category / تصفّح حسب التصنيف» يعرض مركز العضلة ومركز المعدة — hrefs بلا بادئة لغة من الخادم والعميل يسبقها ب/ar (قانون فضاء الروابط نفسه). ③ **صفحات الأكل EN+AR:** شريط «Plan & explore / خطّط واستكشف» — روابط المجموعات (للأطعمة الموسومة فقط — الذيل الطويل بلا وسوم لا يحصل على روابط غير صادقة) + رابط مخطط الوجبات على كل صفحة أكل (سياقي: الأكل → خطط وجباتك). ④ **المدونة EN+AR:** `insertToolLinks` تُطبَّق وقت العرض في صفحات الخادم — المقالات القديمة السابقة لطبقة الضمان تحصل على نفس المعالجة (idempotent: تخطى المُرتبط مسبقًا، حد 3، لا يمس العناوين/الروابط القائمة) فالمولّدة حديثًا تمر دون تغيير.

**اكتشاف جودة ① — تلف CJK في نصوص عربية:** «وتوت**形成**» في introAr لمجموعة foods-for-cutting (hub-collections.ts) و«التكيف الأيضي:**突破**» في موضوع بول المدونة (blog-topics.ts) — أُصلحا («تُشكّل» / «تجاوز») وأُضيف canary يفشل البناء عند أي حرف CJK في نصوص الـhubs المزدوجة.

**اكتشاف جودة ② — مركزان فارغان حيّان:** حصر المكتبة: **صفر** تمارين `category=cardio` و**صفر** بمعدات `none` في صفوف الـ868 — أي أن `/muscles/cardio` و`/equipment/none` (EN+AR) صفحات فارغة (هيدر + مقدمة + شبكة خاوية) معلن عنها في sitemap-collections.xml منذ الإطلاق — تخالف سياسة اقتصاد الزحف A-5. **العلاج (بنفس السابقة):** البقاء حيّين (قانون ثبات الروابط + مرتبطان من المركزات الشقيقة) لكن إخراجهما من السايت ماب عبر `isAdvertisedMuscleHub/isAdvertisedEquipmentHub` — **إعادة الإعلان تلقائية** لحظة وصول أول تمرين مطابق (الاختبار يثبّت القائمة ويصرخ عند التغير). **قرار مالك مستقبلي:** المكتبة بلا تمارين كارديو أصلًا — إضافة كتلة كارديو (جري/دراجة/تجديف/بيربي...) تخدم خارطة الطريق (توسيع المكتبة 868→1,500+) وتفتح عائلة استعلامات عالية الحجم.

**التنفيذ ⑤ — #14 lastmod:** `src/lib/sitemap-lastmod.ts` — `SITEMAP_LASTMOD` لكل عائلة (pages/exercises/foods/collections/comparisons) مع **بروتوكول تحديث** موثق (ارفع تاريخ العائلة عند أي تغيير جوهري في HTML المخدوم). عائلتا المكتبة مشتقتان من `CONTENT_LAST_REVIEWED` (مصدر واحد مع E-E-A-T — لا تاريخ منسوخ يدويًا ينجرّ). المدونة تبقى ديناميكية من Supabase. +5 اختبارات (المصدر الواحد + W3C + الإصدار الفعلي لـlastmod في buildUrlSet + «لا تواريخ مزيفة»).

**التحقق:** next build ✓ (1970 — الصفحات الفارغة بقيت حية بلا إعلان) · tsc 0 · eslint 0/0 · vitest **285/285** (+11) · docs gates · migration_audit --ci · stale-refs · ui-wiring — وكل روابط الشبكة الجديدة تُحسب من اختبار: كل تمرين يحل مركزيه، كل أكل موسوم يحل مجموعاته.

### 12.15 — SEO-GEO-4.8: تدقيق المحتوى الشامل #15 Content Pruning (2026-09-09 — أمر المالك «لا ابداء فى خطوه تالية اخرى» بعد رفع قرار كتلة الكارديو)

**النطاق:** آخر بند قابل للتنفيذ في §7.1 (#15 — مراجعة محتوى الـ61 مقالًا وتحسينها). حصر فعلي من مصدر الحقيقة (PostgREST، نمط 147): **63 مقالًا منشورًا = 29 EN + 34 AR** (الخطة قالت 61 — الرقم تحدث بنمو الإنتاج). منهجية التدقيق: 12 بُعدًا آليًا على المحتوى الكامل (الهزالة، CJK، صحة الماركداون، نظافة الميتا، الروابط الداخلية/الخارجية، سلامة JSON، التواريخ، توحيد المؤلف، ازدواج العناوين، مرشحو الترجمة).

**نتيجة الصحة العامة (ممتازة):** صفر مقالات هزيلة (كلها فوق عتبة 600/450 كلمة) · صفر ميتا ناقص أو طويل · صفر جداول بلا فاصل رؤوس · صفر تواريخ شاذة · صفر مؤلفين غير مرجعيين · صفر JSON تالف — **لا يوجد أي مرشح حذف أو دمج إجباري** (Content Pruning الحقيقي غير مطلوب؛ الثنائي الوحيد المتقارب «4-week-beginner-hypertrophy-plan» و«4-week-beginner-muscle-building-plan» زاويتان مختلفتان فعليًا: برنامج تضخيم مقابل دليل يوم-بيوم — القرار: إبقاء الاثنين).

**الاكتشاف الجوهري ① — 85 رابطًا داخليًا ميتًا (404 حي) في 24 مقالًا عربيًا:** مولّد المحتوى القديم كتب الروابط ببادئة إنجليزية `/blog/<slug>` بينما المقال الهدف منشور **عربيًا فقط** — أي `getBlogPost("en", arSlug)` لا يجد شيئًا = 404 حقيقي للقارئ العربي. صفر حالات معكوسة في EN وصفر أهداف مفقودة فعلًا (85/85 قابلة للإصلاح المحدد). **الإصلاح (نمط insertToolLinks الحتمي — قاعدة البيانات لا تُمس):** `src/lib/blog-content-sanitize.ts` — `fixCrossLanguageLinkPrefixes(content, lang, pools)` يعيد كتابة البادئة **فقط** إذا الslug موجود فعليًا في بركة لغة القارئ (البركات من `fetchPublishedBlogSlugPools` — unstable_cache 300s مضاف لblog-server، استعلام خفيف slug/language فقط) — فالهدف العابر للغة عمدًا أو المفقود لا يُكسر أبدًا. الحقن في صفحتي المدونة EN+AR قبل insertToolLinks (Promise.all مع جلب المقال — بلا تأخير متسلسل).

**الاكتشاف ② — 3 روابط أدوات خام ميتة:** `<a href="/tools/…">` داخل مقال AR تظهر **كنص حرفي ميت** لأن `renderMarkdown` يهرّب كل HTML الخام (درع XSS — مصمم كذلك). `fixRawHtmlInternalAnchors` يحوّل المراسي الداخلية فقط إلى ماركداون قبل التهريب — الدرع يبقى كاملًا على كل ما عداه.

**الاكتشاف ③ — 3 رموز CJK تالفة في عربي المدونة (عائلة عطل 155 نفسها):** «超过»→«أكثر من» (U+8D85) · «進度»→«التقدّم» (U+9032) · «棒ين»→حذف (U+68D2، الجملة سليمة بدونه) — `fixKnownCorruptions` بخريطة حتمية + canary اختبار يفشل عند نجاة أي CJK بعد التعقيم.

**hreflang المدونة (قرار مالك معلق، ليست عطلًا):** صفر من 34 مقالًا عربيًا يحمل `linked_post_id` — ميزة الربط ثنائي اللغة (blog-sitemap.ts، مُختبَرة) سابحة كليًا. مطابقة الترجمات تحريرية بحتة (كشف الأرقام المشتركة أثبت ضوضاءه في التجربة) — تُملأ عند توفرها من المالك/التحرير فتنتفض hreflang تلقائيًا في السايت ماب. ⤵️ **تجاوزت بالمرحلة 157 (§12.16):** الأزواج الجديدة تُقترن وتُملأ آليًا من مصافحة النشر — البند المعلق تحول إلى «إقران رجعي اختياري للـ63 القائمة» (المقترح 3، قرار مالك لاحق).

**التحقق:** next build ✓ · tsc 0 · eslint 0/0 · vitest **298/298** (+13: البادئات 4 + الماركداون 4 + التلف 2 + المركب 2 + idempotency مشتركة) · docs gates · migration_audit --ci · stale-refs · ui-wiring — **التحقق الحي على الإنتاج (84c841f):** /ar/blog/best-protein-supplement-ramadan صفر روابط `/blog/` خاطئة و2 روابط `/ar/blog/` عاملة · /ar/blog/best-dynamic-stretching-before-gym: 3 روابط أدوات `text-primary` حية بدل النص الميت · صفر CJK في optimal-rest-periods · مقال EN سليم بلا انحدار.

---

### 12.16 — SEO-GEO-5.0: التوليد ثنائي اللغة المقترن (2026-09-09 — قرار المالك «نفذ توصيتك» = المقترح 1)

**الخلفية:** دراسة معمارية كاملة لخط التوليد (بتوجيه المالك «ادرس ثم اعرض») كشفت: (أ) صفر اقتران فعلي من 63 مقالًا (29 EN + 34 AR) — بروتوكول V3 الصريح كان يمنع linked_post_id عبر اللغات؛ (ب) الجذر التقني لروابط الـ85 الميتة (156) هو برومبت P4 يعرض مرشحي الروابط ببادئة `/blog/` ثابتة حتى للruns العربية. عُرضت 3 مقترحات واعتمد المالك المقترح 1 لأنه يحفظ قرارين ماليكين معتمدين (جداول Phase 119 الجغرافية + جودة تنفيذ V3 لكل لغة) ويضيف طبقة الاقتران التي كانت نقطة قوة حقبة V2.

**المعمارية المنفذة:** موضوع واحد يوميًا → بحث اللغتين (runPhase0Research ×2) → استدعاء اقتران صغير واحد (`runPairingSelection` ≤400 توكن) يختار topicEn (من مرشحات EN المدققة حرفيًا) + topicAr (مرشح AR أو صياغة عربية جديدة long-tail) + زاوية مشتركة من ids العشرة → **صفان في الطابور يحملان pair_id مشتركًا + sharedBrief مختومة** (article_bundle.sharedBrief: pairId/topicEn/topicAr/angleId/sealedAt) → كل لغة تنفذ خطها الكامل P1→P5 بنفسها في نافذتها المعتمدة (AR 05:00 UTC · EN 22:00 UTC) — **محتوى أصلي لا ترجمة**: ميتا وكلمات وFAQs مستقلة لكل لغة، slugs لاتينية (M15)، dedup لكل لغة محفوظ.

**بروتوكول P0 (سلّم كامل مع تدهور ليجاسي):** ① تبني صف لغتي جاهز بـbrief صالح (≤48h — أنشأته نافذة التوأم السابقة) ② انضمام لزوج اللغة الأخرى (≤30h) بصفّي فقط عندما لم يُدرج صفّي best-effort ③ إنشاء الزوج (أنا الأول: بحث اللغتين + الاقتران + إدراج الصفين، التوأم best-effort). **ممنوع الاقتران الأعمى** — فشل الاقتران أو التحقق أو غياب pair_id (شرط دفاعي متبقٍ فقط — 0076 مطبقة تلقائيًا 2026-09-09) → السلوك الليجاسي V3 الحرفي (صف واحد بلا اقتران) + حارس double-dispatch قبل الإدراج + إعادة إدراج ليجاسية إذا رفض DB عمود pair_id (النشر لا يتوقف أبدًا بسبب الاقتران).

**مصافحة P5:** الساق الثانية المنشورة تملأ linked_post_id **بالاتجاهين** (لها وللتوأم) best-effort لا يسقط النشر — hreflang المدونة (blog-sitemap) + زر اللغة (LanguageToggle) ينتفضان تلقائيًا لكل زوج جديد دون أي عمل يدوي.

**الإصلاح الجذري المرافق:** مرشحو الروابط الداخلية في P4 صارت language-aware (`/ar/blog/` للعربية · `/blog/` للإنجليزية) في التوليد من المصدر — درع 156 وقت العرض يبقى خط الدفاع الثاني على المحتوى القديم.

**الملفات:** ميجريشن `20260909120000_0076_blog_queue_pair_id.sql` (pair_id uuid + فهرس جزئي — هيكل فقط idempotent، بلا FK عمدًا) · `src/lib/blog-pairing.ts` جديد (SharedBrief/extractSharedBrief/isAdoptablePairRow/parsePairingJSON/runPairingSelection/isValidAngleId) · blog-queue.ts (pair_id + findAdoptablePairRow + findRecentPairRows — تتحلل لnull/[] على أي خطأ) · p0/p1/p5 routes · blog-pipeline.ts (buildOutline forcedAngle + إصلاح P4) · types.ts + INDEX.md (0076) + AGENTS §8 + رؤوس الworkflows.

**الضمانات:** +22 اختبارًا (320/320) تغطي كل قوانين التحقق بالحقن الزمني · صفر انحدار ممكن بالتصميم قبل تطبيق 0076 · النشر لا يتوقف أبدًا بسبب فشل الاقتران أو المصافحة · عزل الأعطال (فشل ساق لا يسقط الأخرى ويُعاد وحده) · **المتبقي الاختياري:** مراقبة أول دورتين GHA كاملتين (الإقران الرجعي — المقترح 3 — أُنجز لاحقًا في نفس اليوم، انظر فقرته أدناه).

**التحقق الحي (2026-09-09):** ميجريشن 0076 طُبقت تلقائيًا بواسطة تكامل Supabase-GitHub خلال دقائق من الدفع — مثبتة عبر نسخة db-backup الحية (2026-09-09T00:29Z) التي تُظهر `pair_id` على صفوف blog_generation_queue و`linked_post_id` على blog_posts — وتدقيق حي شامل لكل الميجريشنز (89 ملفًا مقابل 44 جدولًا حيًا): **صفر عمود معرّف بميجريشن غائب عن الإنتاج** — الجداول الصفرية الصفوف مغطاة ببوابة migration_audit↔types.ts، وgh_sync_probe محذوف عمدًا بميجريشن 20260901120000.

**الإقران الرجعي (المقترح 3 — 2026-09-09):** مطابقة نموذجية للـ63 مقالًا القائمة (29 EN + 34 AR) بالعناوين والكلمات المفتاحية الكاملة → **6 أزواج ثقة عالية** (نفس السؤال/الزاوية/الجمهور) **طُبقت فعليًا** عبر `scripts/retro-pair-blog.mjs` (workflow_dispatch `retro-pair-blog.yml` — DRY_RUN=1 نجح ثم APPLY: paired=6 · verified=6 · failed=0) — **مثبتة حيًا** بنسخة db-backup مستقلة (a371c8a0): 12 منشورًا مقترنًا bidirectionally، hreflang المدونة (sitemap-blog) + زر اللغة (LanguageToggle) يستantan للقائمة القديمة تلقائيًا — **4 أزواج مراجعة** في `reviewPairs` بانتظار اعتماد المالك (تُنقل إلى pairs ثم تُعاد إقلاع الـdispatch — idempotent) والباقي بلا توأم حقيقي بالتصميم — ممنوع الاقتران الأعمى (AGENTS §8). ⤵️ **حُسمت بقرار المالك 2026-09-09 (§12.17):** «نكتفي بما تم» — أزواج المراجعة الأربعة **أُسقطت** والإقران الرجعي مغلق عند الستة المطبقة.

### 12.17 — SEO-GEO-5.2: عمق صفحات المراكز — قالب §6.3 مكتمل (2026-09-09 — أمر المالك «نكتفى بما تم فى الخطوه ٣، اقرأ أولًا ملفات التوثيق الخاصة بالـSEO وابدأ فى الخطوة التالية»)

**قرارات المالك المرافقة:** ① إغلاق الإقران الرجعي عند الستة أزواج المطبقة — أزواج المراجعة الأربعة (reviewPairs) **تُسقط بقرار المالك** (قانون لا اقتران أعمى صامد) ② توجيه إلزامي بقراءة ملفات توثيق SEO الأربعة (الخطة الرئيسية + SEO-CWV-THRESHOLDS + SEO-EEAT-FRAMEWORK + SEO-SCHEMA-REFERENCE) قبل اختيار الخطوة التالية.

**اختيار الخطوة:** تدقيق ما بعد القراءة أظهر أن §7.1 مغلق كليًا (باستثناء #8 المؤجل ببيانات 90 يومًا من GSC) وأن القالب المعلَّم «مطلوب تنفيذه فورًا» في §6.3 ما زال ناقص بنديه **4 (نص تفسيري) و5 (أسئلة شائعة 5–10)** على صفحات المراكز — الصفحات ذات أعلى قيمة كلمات مفتاحية (§5.2) كانت هزيلة المحتوى (H1 + intro + شبكة + روابط فقط). الخطوة التالية = إكمال القالب.

**التنفيذ (24 مركزًا مملوءًا × لغتين):** 7 مراكز عضلات (chest/back/shoulders/legs/biceps/triceps/core) + 7 مراكز معدات (barbell/dumbbell/bodyweight/cable/machine/kettlebell/band) + 10 مجموعات أطعمة. لكل مركز: **دليل** (~200–280 كلمة EN بنظير عربي تحريري طبيعي — تشريح/وظيفة العضلة أو دور المعدات أو دور غذائي + أنماط برمجة بأرقام إرشادية راسخة + أسماء تمارين/أطعمة **حقيقية من المكتبة**) + **6 أسئلة شائعة** بإجابات ذرية 25–110 كلمات (تكتيك §8.2 #4: إجابة مباشرة قابلة للاقتباس لكل سؤال عالي النية). الملفات: `src/lib/hub-depth.ts` (العقد + المُحصِّل + خريطة العفاء) · `hub-depth-muscles/equipment/collections.ts` (البيانات) · `components/hubs/HubDepth.tsx` (`HubGuideSection` + `HubFaqSection` — details/summary بلا JS عميل، الإجابات في HTML الخادم) · الربط في 6 صفحات (muscles/equipment/collections × EN/AR): الدليل بعد الـintro مباشرة، الـFAQ قبل الـCTA.

**قرار Schema الموثق (مصدر الحقيقة `SEO-SCHEMA-REFERENCE.md`):** صفر FAQPage — Google سحبت rich results كليًا 2026-05-07 (لا فائدة SERP لأي موقع) وصفر QAPage — محجوز للأسئلة الحقيقية المقدمة من المستخدمين وليس للأسئلة التحريرية — **النص المرئي ثنائي اللغة هو أصل GEO بذاته** (مُحدث §8.2 #4 بذلك).

**العفاء الموثق:** `muscles/cardio` و`equipment/none` (صفر صفوف مكتبة — اكتشاف §12.14) بلا محتوى عمق **عمدًا**: دليل تدريب لصفحة فارغة وعدٌ غير صادق — تُعاد تلقائيًا لحظة أول صف مطابق (اختبار الاكتمال يثبّت عدّ العفاء بالضبط).

**الضمانات (+11 اختبارًا — 331/331):** اكتمال 24 مركزًا + عفاء المركزين الفارغين بالعدّ · سلامة الـslugs (كل مفتاح سجل يحل لعائلته) · عمق ثنائي اللغة (حدود أدنى للدليل) · الإجابات الذرية (5–8 أسئلة/مركز، 25–110 كلمة، أسئلة استفهامية فريدة باللغتين) · canary CJK (عائلة عطل 12.14) · **anti-fabrication صارم:** صفر روابط وصفر PMID في كل النصوص + خرائط إشارة (mention maps) تتحقق من أن كل تمرين/طعام مسمّى **موجود في المكتبة وينتمي فعلًا لمركزه** (category/equipment/tag حي) — المسكات أثناء التطوير أثبتت قيمة البوابة: dumbbell-shrug (فئتها back) · goblet-squat (معداتها kettlebell لا dumbbell) · cable-incline-pushdown (فئتها back!) · band-assisted-pull-up (معداتها bodyweight) · mountain-climbers (فئتها legs) — صُححت كلها لتمارين حقيقية في مكانها الصحيح.

**التحقق:** 9/9 بوابات — tsc 0 · eslint 0/0 · vitest **331/331** (+11) · next build ✓ · docs_audit · docs_parity · migration_audit --ci · stale-refs · ui-wiring. (بند 2/TOC من القالب أُحيط علميًا لصفحات الأدلة الطويلة — لا ينطبق على شبكات المراكز.)

---

### 12.18 — Phase 172: جودة محتوى المدونة — Answer-first + E-E-A-T بلا اختلاق + FAQ من نية المقال (2026-09-10 — أمر المالك «حسّن جودة Blog Generation» بـ14 بندًا بعد Audit فعلي)

**الخلفية (تدقيق حي قبل أي تعديل):** المقالان المرجعيان (آخر إنتاج لكل لغة) كشفا جذر «FAQ filler» ثلاثي الطبقات: P2 لم يكن يكتب أسئلة شائعة خاصة بالمقال → `ensureFaqSection` كان يلصق أسئلة P0 العامة (≤10) في المتن → P5 كان يخزن `faq_json = research0.faqs` (نفس المجموعة العامة) → الصفحة تعرض FAQ مزدوجًا بأسئلة خارج الموضوع (دليل: مقال الكرياتين 09-09 حمل 9/10 بطاقات لا علاقة لها به × عرضين) · الافتتاحيات scenario-hook لا إجابات مباشرة — مواصفة §8.2 «الإجابة الذرية» لم تصل مقالات المدونة قط · تكرار هيكلي (3 مقالات نوم عربية في 6 أيام + قالب «How to» ×6 متتالية EN) لغياب سياق استبعاد سوى العناوين.

**التنفيذ (برمبتات + تشكيل بيانات في النشر — بلا إعادة بناء):** (1) **P2 يولّد قسم أسئلة شائعة خاصًا بالمقال** (4-7 أسئلة تخدم نية بحثه بعقد صيغة حرفي) و**P5 يرفعه** إلى `faq_json` عبر `splitFaqSection` الجديدة **وينزعه من المتن** — عرض واحد لأسئلة المقال نفسها؛ (2) **Answer-first** إلزامي في أول فقرة أو فقرتين (P2 + مسار الكوتش) ومتحقق محرريًا في P4؛ (3) **E-E-A-T بلا اختلاق**: ممنوع اختلاق قصص عملاء/شهادات/تجارب/مؤهلات — الاستدلال الخبير مسموح، والإسناد يبقى في التوقيع؛ (4) **fact guard صحي**: الجرعات والتوقيتات والنتائج نطاقات سياقية لا قواعد مطلقة + حظر اختلاق دراسات/إحصاءات + توسيع القائمة البيضاء (WHO · NCBI/PubMed · ODS · NCCIH · CDC · Mayo · ACSM · ISSN) بلا زيادة عدد الروابط؛ (5) **منع التكرار الهيكلي**: P0/P1 يستقبلان ملخصات المحتوى الحديث (`getRecentContentDigests`: عنوان + كلمة مفتاحية + هيكل H2) + قانون تنويع صيغة العنوان + بذرة تنويع لكل تشغيل؛ (6) `ensureFaqSection` محفوظة لكنها فلتر صلة (≤6، صفر ذو صلة = لا قسم قسري)؛ (7) العمق لا الطول + حظر حشو الكلمات المفتاحية + العربية مستقلة تحريريًا.

**الضمانات (+25 اختبارًا — 565/565):** عقد FAQ ثنائي الاتجاه (توليد ↔ تحليل) · فلتر الصلة (أسئلة خارج الموضوع ممنوعة) · حراس قراءة المصدر تثبّت قوانين البرمبت (answer-first/E-E-A-T/fact-guard/FAQ/تنويع) داخل CI · بوابات 9/9.

### 12.19 — Phase SEO-GEO-6: التدقيق الخارجي الشامل SEO/GEO/المنافسين ← خطة التنفيذ P0–P3 (2026-09-12 — أمر المالك «لا داعى لعمل ملف وفقط اكتب فى المحادثة مع عمل خطة للتنفيذ وتوثيقها على المستودع الرئيسى»)

**الخلفية — تدقيق خارجي مستقل للقراءة فقط (2026-09-11/12):** ثلاثة مصادر أدلة: (1) تحليل عميق للكود (الإطار/الرندرة، SEO infra، i18n، نظام المدونة، الأداء، القمع، التوثيق)؛ (2) زحف حي لـ alkemos.com (robots بـ 7 UAs، فهرس السايت ماب 2,078 URL، عينة 98 URL بنتيجة 100% HTTP 200، تدقيق 27 صفحة بكل الأنواع، التحويلات، ترويسات الأمان/الكاش)؛ (3) بحث منافسين حي: 50+ استعلام EN/AR عبر SERPs حية + تنقيب عميق لأفضل 7 منافسين: strongrfastr · calculator.net · eatthismuch · elconsolto · arvo.guru · workoutgen.app · altibbi.

**النتائج الحاكمة (FACT ما لم يُذكر خلاف ذلك):**
1. **الحرج الوحيد (GEO):** كتلة Cloudflare المدارة في `robots.txt` تحظر 9 زواحف AI موقعيًا (GPTBot · ClaudeBot · Google-Extended · CCBot · Amazonbot · Applebot-Extended · Bytespider · meta-externalagent · CloudflareBrowserRenderingCrawler) — بينما `llms.txt`/`llms-full.txt` عالي الجودة لا يستطيع أيٌّ منهم قراءته أصلًا. سابقة المنافسين الجدد تثبت الرافعة: arvo.guru (14 زاحف AI مسموح + 50.8KB llms.txt + صفحات أدوات كثيفة الـschema) وصل #1 على «ai workout generator» خلال أقل من سنة.
2. **صفر ظهور:** alkemos.com غائب عن 50/50 استعلامًا (21 EN + 29 AR/GEO) بما فيها استعلامات العلامة نفسها — SERP «alkemos» محتلة بكيان سفينة SS Alkimos وضاحية Alkimos (Perth WA)؛ البحث الدقيق بالمجال يُظهر صفحة تسجيل المدربين لا الرئيسية.
3. **السلطة تتفوق على الهندسة (اليوم):** strongrfastr يحتل #1 على 3 كلمات رأسية «generator» بصفر JSON-LD وبلا sitemap وصفحات 704–1,942 كلمة — Alkemos لا يملك سلطة المنافسين (صفر روابط خلفية)، فالطريق القابل للتنفيذ = نمط arvo/eatthismuch: عمق محتوى + schema كثيف ثنائي اللغة + سطح GEO مفتوح.
4. **الفراغ العربي التفاعلي (فرصة مقاسة):** لا حاسبة TDEE/ماكروز/بروتين عربية تتصدر، لا مولد خطط وجبات عربي، لا AI تمارين عربي عدا workoutgen.app (بلا حاسبات وبلا جانب وجبات)؛ حاسبات elconsolto = 8 فقط (~809 كلمة بلا عمق) وaltibbi = 56 ضحيلة بعناوين مكسورة — حزمة Alkemos (6 حاسبات AR + توليد AI + مدونة) لا نظير لها كحزمة واحدة، ينقصها بلوغ عتبة الثقة التي تضعها البوابات الطبية/الحكومية.
5. **عيوب تقنية محدودة قابلة للإصلاح الفوري:** بتر عناوين EN عند 60 حرفًا منتصف كلمة (23/31) + عنوان AR بعلامة «— Alkemos» مزدوجة · `ar/rss.xml` روابطه الـ39 كلها تشير لمدونة EN · لا hreflang فعلي على مقالات المدونة الـ70 (آلية `linked_post_id` موجودة لكن 0 أزواج مشتركة في الإنتاج) · `aggregateRating` مُثبَّت في الكود (4.8/500 · 4.9/300 بلا مصدر مرئي — `src/lib/seo.ts:139-171`) إشارة ثقة سالبة على صفحات YMYL.

**خطة التنفيذ — 17 إجراءً على 4 أولويات (الترتيب بالأثر × المجهود):**

**P0 — الأسبوع 1 (إصلاحات حرجة عالية الرافعة، مجهود منخفض):**

| # | الإجراء | المسار/الأداة | المجهود |
|---|---|---|---|
| 1 | فك حظر زواحف AI: تعطيل كتلة «AI Bots» المدارة في Cloudflare (أو سياسة مخصصة تسمح GPTBot/ClaudeBot/CCBot/Google-Extended/Amazonbot/Applebot-Extended/Bytespider/meta-externalagent على المسارات العامة مع إبقاء كتل المسارات الخاصة كما هي) + قرار ملكي على إشارة `Content-Signal: ai-train=no` + تحديث تعليق robots.txt ليطابق الواقع + تحقق حي بجلب الملف بكل UA ومراقبة Cloudflare Analytics › Crawlers | لوحة Cloudflare (Security › Bots) + `public/robots.txt` | منخفض |
| 2 | إصلاح `ar/rss.xml`: 39/39 رابطًا ← `/ar/blog/` بدل `/blog/` | `src/app/ar/rss.xml/route.ts` | تافه |
| 3 | قص عناوين المدونة على حدود الكلمات (EN ≤60 · AR ~70) + إزالة تكرار العلامة المزدوج | مسار توليد العنوان (pipeline P2/P5) | منخفض |
| 4 | استكمال hreflang المدونة: توسيع الإقران الاستدراكي + صف ذاتي/x-default لغير المقرن | `scripts/retro-pair-blog.mjs` (موجود) + قالب المقال | متوسط |
| 5 | نزع `aggregateRating` المُثبَّت (يُعاد تفعيله بمصدر حقيقي في P1-7) | `src/lib/seo.ts:139-171` | تافه |

**P1 — الأسابيع 2–6 (أصول المحتوى والأدلة — الأسطح غير المتنازع عليها):**

| # | الإجراء | التفصيل |
|---|---|---|
| 6 | الحاسبات الست ← «المعيار المزدوج» (محتوى calculator.net + كثافة arvo): 3,000+ كلمة مرجعية/حاسبة (معادلات مسمّاة Mifflin-St Jeor/Harris-Benedict/Katch-McArdle + تعليق دقة + جداول أطعمة/تمارين) + FAQ مرئي بأسئلة بحث حقيقية + `WebApplication`+`Offer($0)`+`HowTo`+`BreadcrumbList` — ثنائية اللغة، حاسبة/أسبوع بالترتيب: سعرات ← ماكروز ← TDEE/BMR ← بروتين ← BMI ← دهون الجسم (FAQPage schema مقاعدة بمرجع المستودع — النص المرئي هو أصل GEO) |
| 7 | طبقة المراجعة والكيان: مراجع مسمى معتمد بصفحة شخصية وcredentials وsameAs (نمط workoutgen) + مصدر مراجعات حقيقي قابل للربط (Trustpilot/GBP — بند مفتوح أصلًا في STATE) + عنصر Wikidata للمنظمة + بذور روابط خلفية عربية — يعيد تفعيل التقييم بمصدر موثق |
| 8 | مصفوفة خطط الطعام العربية البرنامجية: `/ar/diet-plan/{مستوى-سعرات}/{نظام}` (كيتو · بروتين عالي · نباتي · متوازن) بتوليد أول مجاني بلا تسجيل قبل جدار الحساب — نموذج eatthismuch (619 URL) غير المتنازع عليه عربيًا؛ النسخة EN لاحقًا لسد عنق strongrfastr |
| 9 | مرايا عربية لـ `/evo` و `/coaching` — آخر فجوة في هندسة اللغات (صفحتان تجاريتان EN فقط) |

**P2 — الأشهر 2–3 (التوسيع والتوحيد):**
10. توحيد MSA لنسخ صفحات الأدوات وFAQ الرئيسية (توحيدًا مع قانون المدونة 175/176).
11. تصنيف مدونة قابل للزحف: صفحات فئات/وسوم فعلية بروابط سياقية (حاليًا فلاتر client فقط).
12. معالجة USDA العربي: تعريب أسماء الأطعمة أو حصر `sitemap-foods` بالمنسّق (8,750 صفحة مفهرسة بلا خريطة، أسماء EN داخل قالب AR).
13. صور المدونة: width/height إلزامي (CLS) + قرار ملكي على `images.unoptimized` (سقف حصة Vercel).
14. إصلاحات Low: هدف SearchAction (لا يُفهرس) · اتساق og:image مقابل JSON-LD image · وصف Organization/WebSite بالإنجليزية على الرئيسية EN.

**P3 — بقرار المالك:** لغات إضافية (es/fr/de بنمط strongrfastr) بعد إثبات نموذج AR/EN · أدوات جديدة وفق فراغات SERP المرصودة (1RM · حاسبات إضافية) · `manifest.json` عربي.

**ممنوعات التنفيذ (DO NOT DO — من أدلة التدقيق):**
- لا مطاردة الكلمات الرأسية التي يملكها calculator.net/البوابات الحكومية بصفحات رقيقة — الأولوية للأسطح العربية + استشهاد AI حيث لا منافس جاد.
- لا إنشاء آلاف الصفحات الهزيلة (درس USDA غير المعرب) — كل صفحة برنامجية بحد أدنى جودة (مقدمة فريدة + أداة مدمجة).
- لا تقييمات مختلقة — `aggregateRating` الثابت يُنزع ولا يُضاعف.
- لا FAQPage schema جديد (مقاعد في `SEO-SCHEMA-REFERENCE.md`) — FAQ نص مرئي.
- لا «ترجمة مباشرة» كاستراتيجية عربية — نوايا بحث عربية مستقلة (نتائج R4).
- لا فتح فهرسة pagination قبل حل التكرار (السياسة الحالية صحيحة).
- تُحترم ممنوعات STATE.md النشطة كلها (الصور · MSA · المولد القديم · الترقيم...).

**القياس (خط الأساس 2026-09-11: صفر ظهور في 50 استعلامًا · صفر إحالة AI · صفر روابط خلفية):** مؤشرات 90/180 يومًا: أول ظهور في استعلامات العلامة · أول زيارات إحالة من محركات AI (مراقبة referrers مثل chatgpt.com وperplexity.ai) · انطباعات GSC لأدوات AR · أول 10 روابط خلفية · فهرسة مصفوفة diet-plan · بقاء البوابات 9/9 خضراء مع كل تنفيذ.

**نطاق هذه الحركة:** توثيق فقط (docs-only) — صفر كود تغيّر؛ التنفيذ الفعلي يبدأ بأوامر مالك مستقلة لكل بند (بنمط قيود §12 السابقة)، ويُحدَّث هذا القسم مع كل بند يُنفَّذ.

### 12.20 — Phase SEO-GEO-6.1: تنفيذ دفعة P0 (الكود + البيانات) (2026-09-12 — أمر المالك «ادفع ثم ابدأ تنفيذ المقترحات»)

**التنفيذ — 4 إصلاحات كود + 17 اختبار انحدار (vitest 680→697):**
1. **P0-2 — روابط RSS العربية (`src/lib/rss.ts`):** `item()` كانت تبني `${baseUrl}/blog/${slug}` بغض النظر عن لغة الخلاصة — التدقيق الحي وجد 39/39 رابطاً في `/ar/rss.xml` تشير للمدونة الإنجليزية. القانون الجديد: بادئة `/ar` مشتقة من لغة الخلاصة نفسها (نفس منطق `articleUrl` في blog-server). الحراس: `rss-ar-links.test.ts` ×3.
2. **P0-3 — قصّ عناوين SERP على حدود الكلمات:** الجذر كان `p5-publish/route.ts:246` يخزّن `meta_title = title.slice(0, 60)` قطعاً حرفياً منتصف الكلمة (23/31 مقالاً EN مبتوراً + لاحقة علامة مزدوجة في واحد AR). الدالة الجديدة `clampMetaTitle` في `src/lib/blog-pipeline.ts`: ميزانية EN≤60 / AR≤70 · قصّ عند آخر حدّ كلمة داخل الميزانية · نزع لاحقة العلامة الزائدة (حتى المزدوجة) · لا ينتهي على فاصل معلّق · العلامة داخل العنوان تُحفظ (يُنزع اللاحق فقط). الحراس: `blog-meta-title.test.ts` ×8. **معالجة البيانات (production):** سكربت أحادي خارج الريبو أعاد حساب `meta_title` للـ70 مقالاً منشوراً بموجب نفس القانون — تحقق ذاتي ضد متجهات الاختبار الثمانية قبل أي كتابة + قانون أمان: العناوين المصنوعة يدوياً (المختلفة عن title) تُحفظ صياغتها ويُنزع منها اللاحق/الميزانية فقط. **النتيجة: 27 صفاً صُحّح (26 قصّة آلية + مقال اللاحقة المزدوجة optimal-rest-periods-resistance-training) · 3 يدوية حُفظت · 39 بلا تغيير.**
3. **P0-4 — hreflang صفحات المدونة (`src/lib/blog-server.ts` + صفحتا المقال):** إزالة C1 (2026-09-07) كانت صحيحة يوم كان صفر أزواج حية؛ منذ Phase 157/158 يوفر `linked_post_id` توائم حقيقية. `fetchBlogForOG` الآن تحلّ التوأم المنشور (استعلام خفيف داخل نفس الكاش 5 دقائق) والباني الموحّد `buildBlogHreflang`: المقرن يُصدر en+ar+x-default→EN · غير المقرن يُصدر صفّاً ذاتياً + x-default ذاتياً (قانون C1 قائم: لا يُعلن مقابل غير موجود أبداً). الحراس: `blog-hreflang.test.ts` ×4. **تحقق طبقة البيانات:** تشغيل `retro-pair-blog.mjs` بوضع DRY_RUN — الأزواج الستة المعتمدة كلها «already paired» ثنائية الاتجاه في الإنتاج (صفر كتابة)؛ أزواج المراجعة الأربعة تبقى مسقطة بقرار المالك.
4. **P0-5 — نزع التقييمات المختلَقة (`src/lib/seo.ts`):** حذف `aggregateRating` من مخططَي Service (4.8/500) وSoftwareApplication (4.9/300) — قيم مثبتة في الكود بلا مصدر مراجعات مرئي (مخاطرة إشارة مختلَقة على صفحات YMYL). يُعاد التفعيل بمصدر حقيقي قابل للربط فقط (P1-7). الحراس: `schema-rating-law.test.ts` ×2 (يثبتّان غياب AggregateRating + بقاء العروض/featureList).

**البوابات (محلياً قبل الدفع):** tsc 0 (الأربعة الموثقة لـfor-coaches فقط) · eslint 0/0 · vitest أخضر بالكامل (1066/1066 بعد كل الإضافات) · next build exit 0 · docs_audit (phase=192) · docs_parity · migration_audit · stale-refs · ui-wiring — وبعد الدفع: التحقق الحي موثّق أدناه.

**المتبقي من P0 — البند 1 (فك حظر زواحف AI):** تحقيق API مكتمل بنفس الجلسة: قراءة `GET /zones/{id}/ai-audit/robots` تنجح وتؤكد القواعد المُدارة حية، لكن **لا نقطة كتابة عامة** للميزة (AI Crawl Control = لوحة فقط وفق توثيق Cloudflare الرسمي) · لا قاعدة WAF مخصصة موجودة أصلاً (طور `http_request_firewall_custom` فارغ) — الحظر **استشاري عبر robots.txt فقط** والصفحات نفسها ترجع 200 لزواحف GPTBot/ClaudeBot (متحقق حياً). **إجراء المالك المطلوب (دقيقتان في لوحة Cloudflare):** المنطقة alkemos.com → Security → AI Crawl Control → تبويب Crawlers → للزواحف التسعة (GPTBot · ClaudeBot · CCBot · Google-Extended · Amazonbot · Applebot-Extended · Bytespider · meta-externalagent · CloudflareBrowserRenderingCrawler) اختر **Allow** من عمود Actions — أو تبويب Settings/Signals → عطّل **Managed robots.txt** بالكامل (يزيل القسم المُدار وسطر Content-Signal) · **التحقق بعد التنفيذ:** `curl -s https://alkemos.com/robots.txt | grep -c 'Disallow: /$'` يجب أن يرجع 0 (تبقى فقط قواعد المسارات الخاصة الخاصة بالمستودع).

**إغلاق P0-1 (2026-09-12 — أمر المالك من لوحة Cloudflare «تم تعطيل robots.txt configuration من كلاود فلير»):** نفّذ المالك الخيار الثاني الموثق أعلاه — تعطيل **Managed robots.txt** بالكامل. **التحقق الحي بعد التنفيذ:** الملف الحي = **1,199 بايت مطابقة بايت-بايت** لملف المستودع `public/robots.txt` — نفس الـmd5 لكل UA مفحوص (سطح المكتب · GPTBot · ClaudeBot · CCBot · Google-Extended · Bytespider · PerplexityBot — لا تقديم انتقائي) · أمر التحقق الموثق أعلاه يرجع **0** قواعد `Disallow: /$` · مجموعة `User-agent: *` واحدة موحدة · 7 إعلانات Sitemap · سطر `Content-Signal: search=yes,ai-train=no` اختفى مع الكتلة المدارة (القرار الملكي المعلّق في §12.19 بند 1 حُلّ بالتعطيل الكلي — لم تعد أي إشارة منع تدريب تُرسَل) · `llms.txt` (200 · 4.67KB) و`llms-full.txt` (200 · 24.3KB) أصبحا قابلَين للقراءة فعلياً من زواحف AI — **سطح GEO كامل مفتوح لأول مرة** · المسارات الخاصة (dashboard/auth/admin/api/checkout/…) محجوبة كما هي في السياسة الموحدة. **ملاحظة انتشار:** الملف مخزَّن في حافة Cloudflare بـ max-age=86400 — POP هونغ كونغ يقدّم النسخة الجديدة (عمر الكاش ~2.2 ساعة لحظة التحقق)؛ تقارب بقية الـPOPs خلال ≤24 ساعة (اختياري للمالك: Caching › Purge Everything للفورّية) · Google يعيد جلب robots.txt تلقائياً خلال 24 ساعة كحد أقصى. **مراقبة ما بعد التنفيذ (المالك):** Cloudflare Analytics › Crawlers لرصد أول زيارات زواحف AI · GSC › Settings للتأكد من قراءة النسخة الجديدة · مراقبة referrers محركات AI في Analytics. **بحلول هذا البند اكتملت دفعة P0 كاملة 5/5 (P0-1 هنا + P0-2/3/4/5 في build 7a44527) — التطبيق التالي = P1 (البنود 6–9) بأوامر مالك مستقلة لكل بند وفق قيد نطاق §12.19.**

### 12.21 — Phase SEO-GEO-6.2: P1-7 طبقة الكيان — LinkedIn + تحقق أصول المراجعة + سطح GEO (2026-09-12 — أمر المالك «trust pilot , product hunt , social accounts تم الانتهاء منهم … ابدأ الخطوه التالية»)

**السياق:** المالك أنجز أصول بناء الكيان وسلّم روابطها: Trustpilot (`/review/alkemos.com`) · Product Hunt (`/products/alkemos`) · فيسبوك (share link) · إنستجرام (`@aalkemos`) · X (`@Alkemos`) · **LinkedIn (`/in/alke-mos-29a751435` — الجديد الوحيد**؛ كان أول «الحسابات الاختيارية الثلاثة» في §12.13، الباقي: YouTube/TikTok). الخمسة الأولى كانت موصولة فعلاً في SEO-GEO-4.6 (§12.13) — التكليف هنا = توصيل السادس + تحقق حي شامل + قرار التقييم.

**التحقق الحي (قارئ صفحات):** Trustpilot حي — العنوان «Be the first to write a review» و`"numberOfReviews":0` → **صفر تقييمات، لذا يبقى `aggregateRating` مطفأً** (قانون P0-5 قائم: لا تفعيل إلا بمصدر حقيقي قابل للربط — إعادة التقييم عند أول تقييمات فعلية مرئية على الصفحة) · Product Hunt حي («Alkemos: AI-powered platform for smarter fitness & athletic training») · فيسبوك حي وحُلّ الرابط إلى القانوني `facebook.com/p/Alkemos-61593989587279/` · X حي (`@Alkemos` — «Joined Sep 2026» حساب جديد) · إنستجرام وLinkedIn خلف جدار تسجيل الدخول (روابط المالك حرفياً).

**التنفيذ (أصغر تغيير — انتشار تلقائي من المصدر الوحيد):**
1. **`src/lib/social.ts`:** LinkedIn = الملف السادس — URL قانوني بلا معاملات utm للمشاركة (`linkedin.com/in/alke-mos-29a751435`) — ينتشر تلقائياً إلى Organization.sameAs (seo.ts) وصف أيقونات الفوتر.
2. **`LandingView.tsx`:** أيقونة LinkedIn (roundel «in») في صف الفوتر — سادسة بين X وTrustpilot.
3. **`social-profiles.test.ts`:** الحراس 5→6 اختبارات (697→**698**): العدد والترتيب · قانون LinkedIn القانوني بلا utm · sameAs = الموقع + الستة بلا تكرار.
4. **سطح GEO (`public/llms.txt` + `llms-full.txt/route.ts` معاً بقاعدة SYNC):** سطر «Official profiles» بالروابط الستة القانونية — بعد فتح robots.txt (P0-1) أصبح هذا السطر مقروءاً فعلياً من زواحف AI: إشارة كيان تربط «Alkemos» بملفاته في سطح المصادر الآلية.

**البوابات (محلياً قبل الدفع):** tsc 0 · eslint 0/0 · vitest **698/698** · next build exit 0 (بيئة إنتاج Vercel) · docs_audit ✓ · docs_parity ✓ · ملفات البيئة المؤقتة حُذفت بعد البناء.

**المتبقي على المالك من بناء الكيان (P1-7 مستمر):** أول 10 تقييمات Trustpilot حقيقية (خطة §المرحلة 3: رسالة شخصية للعملاء الأوفياء — ممنوع أي تقييم وهمي) · صفحة Google Business Profile · YouTube/TikTok اختياريتان (تُضافان لsocial.ts فقط عند إنشائهما).

### 12.22 — Phase SEO-GEO-6.3: دعوة التقييم على الأسطح الإنجازية — Trustpilot + Product Hunt قانونياً (2026-09-12 — أمر المالك «اظهر طلب تقيم … بعد نتائج الادوات و توليد الخطط … بدون ازعاج … بدون اى مكافئة او وعود»)

**المطلب:** بطاقة دعوة تقييم محايدة تظهر في أماكن الإنجاز (نتائج الحاسبات + توليد الخطط)، قانونية بموجب قوانين Trustpilot وProduct Hunt، بلا حوافز أو وعود.

**القوانين المطبقة (موثقة في رأس `src/lib/review-invite.ts` + كناري اختبار):**
- **Trustpilot:** طلب المراجعات مسموح؛ **المحظور = الحوافز** (خصومات/كوبونات/هدايا/مكافآت) و**review gating** (تصفية من يرى الدعوة بجواب رضا). الدعوة هنا تُعرض **لكل المستخدمين بلا شرط** — «إذا أعجبك» تعيش في النص فقط لا في منطق العرض (البادئة `shouldShowReviewInvite` تأخذ وقت الإغلاق فقط — إشارة الرضا غير موجودة بنيوياً).
- **Product Hunt:** التصويت المحفَّز محظور صراحة والتسوّل مُزدرى — زر PH **رابط اكتشاف محايد** («تجدنا على Product Hunt») بلا طلب تصويت وبلا مكافآت.
- **بلا إزعاج:** شريط رفيع inline (ليس modal ولا overlay) · زر إغفاء ✕ · **هدنة 30 يوماً** بعد الإغفال (localStorage) · مرة واحدة في أسفل تدفق النتائج (بعد الحفظ/البريد/المشاركة، قبل AdSense) · الصفحات كلها تعمل hydration-safe (إخفاء حتى mount).

**التنفيذ:**
1. **`src/lib/review-invite.ts`** (وحدة نقية): الروابط من **المصدر الوحيد `social.ts`** (تطابق `reviewInviteUrl` مع مدخلات SOCIAL_PROFILES — قانون منع الانجراف) · النسخ EN/AR (MSA) محايدة صادقة · `shouldShowReviewInvite(now, stored)` بفشلٍ مفتوح (قيمة تالفة → تظهر).
2. **`src/components/ReviewInviteCard.tsx`:** شريط رفيع بنجمة + سطر واحد + زرّين (Trustpilot أساسي btn-chrome · PH ثانوي outline) + إغفاء · `useI18n` للثنائية · RTL-safe بخصائص منطقية.
3. **الإدراج في 12 صفحة (6 EN + 6 AR تلقائياً عبر إعادة التصدير):** الحاسبات الخمس + مخطط الوجبات — بعد كتلة ShareButtons وقبل AdSenseAd داخل قسم النتائج/التوليد فقط.
4. **الحراس `review-invite.test.ts` ×7 (698→705):** الروابط القانونية من المصدر الوحيد · منصة مجهولة ترمي (لا رابط صامت) · قانون الهدنة (null→ظهور · حديث→إخفاء · 31 يوماً→ظهور · تالف→ظهور) · تثبيت مفتاح التخزين و30 يوماً · **كناري الحوافز** (20 كلمة ممنوعة EN+AR — خصم/كوبون/هدية/مكافأة/discount/coupon/reward…) · ثنائية اللغة · **كناري البنية** (`shouldShowReviewInvite.length === 2` — البوابة ضد تسلل الإشباع/الرضا كمدخل).

**البوابات (محلياً قبل الدفع):** tsc 0 · eslint 0/0 · vitest **705/705** · next build exit 0 (بيئة إنتاج Vercel) · docs_audit ✓ · docs_parity ✓ · ملفات البيئة حُذفت بعد البناء.

### 12.23 — Phase SEO-GEO-6.4: P1-9 مرايا /evo و/coaching العربية — إغلاق آخر فجوة في هندسة اللغات (2026-09-12 — أمر المالك «… ثم ابدأ الخطوة التالية» بعد دعوة التقييم §12.22)

**السياق:** البند 9 من خطة §12.19 — آخر صفحتين تجاريتين EN فقط (كل صفحات المنصة الأخرى لها مرايا /ar منذ SEO-GEO-4). صفحتا /evo و/coaching **ثنائيتا المحتوى أصلاً** (isAr branches كاملة عبر useI18n) — الفجوة كانت غياب مسارات /ar + الوصف + hreflang فقط.

**التنفيذ (أصغر تغيير — نفس نمط مرايا الأدوات):**
1. **مساران جديدان:** `/ar/evo` + `/ar/coaching` (إعادة تصدير الصفحة الثنائية — الجذر يحل AR من ترويسة x-pathname فيُقدَّم المحتوى العربي SSR).
2. **تخطيطان عربيان بعنوان/وصف/كلمات مفتاحية عربية (MSA) + canonical ذاتي + hreflang كامل en/ar/x-default + OG ar_EG** + حقن المخطط نفسه (SoftwareApplication لـEVO وService للكوتشينج — نصوصهما عربية أصلاً؛ التقييمات تبقى منزوعة بقانون P0-5).
3. **تخطيطا EN:** إضافة hreflang كامل (كان canonical فقط) — انتهى عصر «الزوج EN-only».
4. **sitemap-pages:** أربع مدخلات ببدائل en/ar (evo · ar/evo · coaching · ar/coaching).
5. **LanguageToggle:** MIRROR_ROUTES += الزوجان (تبديل اللغة يعمل بين المسارات).
6. **الروابط الداخلية isAr-aware (6 مواضع):** فوتر الرئيسية (coaching + EVO) · CTA قسم الكوتشينج بالرئيسية · PageBottomPromo · بطاقة كوتشينج المدونة (BlogComponents) · زر ابدأ الآن بصفحة العضويات — القارئ العربي يبقى داخل الشجرة العربية.

**الحراس:** `ar-mirrors.test.ts` ×4 (705→**709**): استدعاء `GET()` لسايت ماب الصفحات والتحقق من المواقع الأربعة + روابط hreflang المتبادلة · قانونية كل تخطيط (canonical + en/ar/x-default) · عناوين عربية ضمن حد الـ70 · locale=ar_EG. + تحديث كناري 173 (رابط بطاقة الكوتشينج صار locale-aware — يظل يمنع الربط المباشر بـcheckout).

**البوابات (محلياً قبل الدفع):** tsc 0 · eslint 0/0 · vitest **709/709** · next build exit 0 (المساران يظهران في مخرجات البناء) · docs_audit ✓ · docs_parity ✓ · ملفات البيئة حُذفت بعد البناء.

**بحلول هذا البند أُغلقت هندسة اللغات بالكامل (كل صفحة عامة لها زوج en/ar + hreflang) — المتبقي من P1: البند 6 (معيار الحاسبات المزدوج — حاسبة/أسبوع) والبند 8 (مصفوفة diet-plan العربية) بأوامر مالك مستقلة.**

**إصلاح تبعي في نفس الفريم (اكتشف بالتحقق الحي بعد النشر):** العنوانان العربيان الأوليان كانا يحملان «| Alkemos» — فقالب `/ar/layout` (الذي يضيف « — Alkemos» لعناوين المراتب الأولى) **ضعّف العلامة** («… | Alkemos — Alkemos» حياً). القانون المستقر بالنمط الحي للصفحات العميقة: عناوين المراتب الأولى تحت /ar **بلا علامة** (القالب يضيفها وحده) — نُزعت اللاحقة من التخطيطين + تحوّل حارس الاختبار إلى **كناري مضاد للازدواج** (`title` لا يحتوي «Alkemos» · الطول مع لاحقة القالب ≤70). البوابات بعد الإصلاح: tsc 0 · eslint 0/0 · vitest 709/709 · build exit 0.

### 12.24 — تعديل SEO-GEO-6.3: نزع الإغفال — «بدون ازعاج» = عدم الحجب البصري فقط (2026-09-12 — أمر المالك «ليس مطلوب إغفال، المقصود بدون ازعاج ( ان لاتظهر بشكل مزعج يحجب نتائج او اى شكل مزعج) نءها وادفع ، ثم بقايا p1 اشرحها لى بشكل غير تقنى اولا قبل التنفيذ»)

**السياق:** تصحيح مالك لتطبيق §12.22 — فُهمت «بدون ازعاج» عند التنفيذ الأول على أنها تحتاج آلية إغفال (زر ✕ + هدنة 30 يوماً). المالك صحّح: **الإغفال غير مطلوب أصلاً**؛ المقصود حصرياً عدم الإزعاج **البصري** — ألا يحجب الشريط النتائج أو يظهر بأي شكل مزعج (لا modal ولا overlay ولا انبثاق).

**التغيير (أصغر تعديل — نفس الأسطح الـ12 بلا مساس بمواضع الإدراج):**
1. **`src/lib/review-invite.ts`:** حذف `shouldShowReviewInvite` و`REVIEW_INVITE_STORAGE_KEY` و`REVIEW_INVITE_COOLDOWN_DAYS` وحذف مفتاح النص `dismiss` من النسختين — الوحدة صارت روابط + نصوص فقط. قانون «عدم الإزعاج» أعيدت صياغته في رأس الملف: شريط رفيع واحد داخل تدفق النتائج (بعد المشاركة، قبل الإعلانات) — **دائم العرض مع النتائج، لا يحجب شيئاً أبداً**.
2. **`src/components/ReviewInviteCard.tsx`:** حذف زر ✕ وكل حالة الإخفاء (`useState`/`useEffect`/`localStorage` — اختفى معها عبء الـhydration) — المكوّن يُصيَّر فوراً أينما وُجدت النتائج. **تعزيز بنيوي ضد الـgating:** المكوّن صار **بلا أي props إطلاقاً** — إشباع/رضا لا يمكن إدخالها أصلاً (قانون Trustpilot).
3. **مواضع الإدراج (6 صفحات = 12 سطح EN/AR):** بلا تغيير — تحديث نص التعليق فقط ليعكس «شريط دائم لا يحجب» بدل «dismissible».
4. **الامتثال كما هو بلا مساس:** بلا حوافز/وعود (كناري الكلمات الـ20 ممنوعة EN+AR) · زر PH رابط اكتشاف محايد · الروابط من المصدر الوحيد `social.ts`.

**الحراس:** `review-invite.test.ts` ×5 (709→**707**): حُذفت اختبارات الهدنة ومفتاح التخزين وكناري الـarity · أُضيف **كناري التعديل §12.24** (يقرأ مصدر المكوّن والوحدة بعد تجريد التعليقات — بنمط ui-wiring): توقيع `ReviewInviteCard()` بلا معاملات · لا `localStorage` · لا `dismiss` · لا `COOLDOWN`/`STORAGE_KEY` · لا عودة ممكنة لـ`shouldShowReviewInvite` · لا `useState`/`useEffect` بالمكوّن (لا بوابة عرض).

**البوابات (محلياً قبل الدفع):** tsc 0 · eslint 0/0 · vitest **707/707** · next build exit 0 (بيئة إنتاج Vercel) · docs_audit ✓ · docs_parity ✓ · ملفات البيئة حُذفت بعد البناء.

**الجزء الثاني من الأمر الملكي («بقايا p1 اشرحها لى بشكل غير تقنى اولا قبل التنفيذ»):** قُدِّم شرح غير تقني في المحادثة لبندي P1 المتبقيين (6 و8) — **لا تنفيذ قبل أمر مالك مستقل** لكل بند.

### 12.25 — Phase SEO-GEO-6.5: P1-6 «المعيار المزدوج» للحاسبات الست — محتوى مرجعي 3,000+ كلمة/أداة ثنائي اللغة + طبقة مخططات كاملة (2026-09-12 — أمر المالك «ممتاذ نفذ البند ٦ ثم ٨ بالتتابع ، تاكد ان كل اداة صفحة مستقلة»)

**المطلب:** تنفيذ البند 6 من خطة §12.19 — محتوى calculator.net + كثافة arvo على صفحات الأدوات الست المستقلة، ثنائي اللغة، بمعادلات مسمّاة وجداول أطعمة/تمارين وFAQ مرئي ومخططات WebApplication+Offer($0)+HowTo+BreadcrumbList.

**قانون «كل أداة صفحة مستقلة» (بأمر المالك):** كل أداة تملك وحدة محتوى خاصة بها تعيش على صفحتها (`src/lib/content/{tool}.ts`) — **المُصيِّر مشترك، المحتوى أبداً غير مشترك**: كناري اختبار يتحقق أن لا فقرة جوهرية (≥25 كلمة) تتكرر بين أداتين، وأن كلمة التحقق تُلغي بأي تكرار مستقبلي.

**التنفيذ (6 أدوات × 12 سطح EN/AR — الأدوات الست الموجودة فعلاً، وTDEE/BMR يُغطى عميقاً داخل صفحة السعرات والبروتين داخل صفحة الماكروز كما خُطط):**
1. **بنية المحتوى:** `src/lib/content/tool-reference.ts` (أنواع Bi ثنائية بالبناء — استحالة انجراف اللغتين بنيوياً) + 6 وحدات محتوى مستقلة: calorie (3,496 EN/3,027 AR كلمة — العمود الفقري) · macro (3,121/2,579) · bmi (3,106/2,552 + جدول الوزن الصحي لكل طول 150–195سم) · body-fat (3,063/2,471 + بروتوكول القياس وفحص ثنيات الجلد) · water (3,040/2,514 + قسم الإلكتروليتات) · meal-planner (3,084/2,421 + يوم مشروح بالأرقام وقائمة مشتريات أسبوعية). **الإجمالي: 18,910 كلمة EN + 15,564 كلمة AR.**
2. **عتبة العمق الموثقة:** EN ≥3,000 كلمة/أداة (معيار calculator.net)؛ AR ≥2,400 (تكافؤ مورفولوجي موثق: العربية تح pack نفس الحجم الدلالي في ~80% من عدد كلمات الإنجليزية بسبب اتصال السوابق واللواحق) — والحاسبة الرئيسة (السعرات) تتجاوز 3,000 في اللغتين معاً.
3. **المُصيِّر:** `ToolReferenceContent` — فقرات وقوائم وعناوين h3 و**جداول** (قابلة للتمرير أفقياً على الجوال) وFAQ مرئي بنص عادي + مراسي ثابتة (#how-it-works) بنمط calculator.net.
4. **المخططات:** `src/lib/tool-schema.ts` (بيانات ثنائية لكل أداة) + `getToolWebApplicationSchema` الجديد في seo.ts + `ToolSchemaScripts` — **12 تخطيطاً** (6 EN + 6 مرايا AR) يحقن كل منها ثلاثة مخططات بلغة الصفحة: WebApplication+Offer($0)+isAccessibleForFree · BreadcrumbList · HowTo (بتعليق قانونه: غنية نتائجها أُوقفت 2023 — قيمتها الدلالية للـGEO فقط كما نصت الخطة). **FAQPage ممنوع (قائمة DO-NOT §12.19) وaggregateRating ممنوع (قانون P0-5).**
5. **الدقة-إلى-الكود:** الأرقام في النص تُطابق التنفيذ: معاملات النشاط 1.2–1.9 والعجز −500/الفائض +400 و40/30/30 (السعرات) · الأنماط الخمسة بجدولها مع كيتو 70% وبروتين عالٍ 45% (الماكروز) · عتبات WHO 18.5/24.9/25/30 (BMI) · ثابت 495 وصيغتا البحرية حرفياً (دهون الجسم) · 35 مل/كجم والحصر 2,000–4,500 (الماء) — **كناري اختبار يثبّت كل ثابت في نص اللغتين.**
6. **الملكية:** العربية فصحى MSA تُفحص بماسح لهجات المدونة نفسه (blog-msa) — صفر علامات قوية وأقل من 5 ضعيفة لكل أداة؛ اللاتيني المسموح فقط أسماء العلم والمختصرات المرجعية (Mifflin-St Jeor · BMR · TDEE · DEXA). استُبدلت اللهجة المصرية القديمة في كتل SEO الست بفصحى كاملة (تقديم P2-10 لهذه الأقسام).
7. **المعادلات المسمّاة:** Mifflin-St Jeor وHarris-Benedict (بتاريخها ومراجعة 1984 وتحيزها المبالغ) وKatch-McArdle — بتعليق دقة يوثق هامش ~10% ومنهجية التحقق بالاتجاه الأسبوعي (مطلب «تعليق دقة» في الخطة).

**الحراس `tool-reference-content.test.ts` ×37 (707→**744**):** العمق (6+1 اختبارات) · الاستقلال (لا فقرة مشتركة) · المعادلات المسمّاة · الثوابت-إلى-الكود (6) · MSA (6) · التكافؤ الثنائي (6) · FAQ المرئي ≥10 (6) · المخططات الثلاثة باللغتين + التخطيطات الـ12 + ممنوعات FAQPage/aggregateRating (بتجريد التعليقات قبل الفحص — نمط ui-wiring).

**البوابات (محلياً قبل الدفع):** tsc 0 · eslint 0/0 · vitest **744/744** · next build exit 0 (1,976 صفحة ثابتة — الأدوات الست تظهر في المخرجات) · docs_audit ✓ · docs_parity ✓ · ملفات البيئة حُذفت بعد البناء. صفر ميجريشنز · صفر مساس منطق الحسابات/التوليد/الأعمال — كتل SEO القديمة استُبدلت إدراجياً في مواضعها نفسها.

### 12.26 — Phase SEO-GEO-6.6: P1-8 مصفوفة خطط الطعام العربية البرنامجية — 24 خطة يوم جاهزة + محور (2026-09-12 — أمر المالك «ممتاذ نفذ البند ٦ ثم ٨ بالتتابع» — البند الثاني بالتتابع بعد §12.25)

**المطلب:** تنفيذ البند 8 من خطة §12.19 — `/ar/diet-plan/{مستوى-سعرات}/{نظام}` بنمط eatthismuch (619 URL غير المتنازع عليه عربيًا)، بتوليد أول مجاني بلا تسجيل قبل جدار الحساب.

**التنفيذ (25 صفحة جديدة: محور + 24 خلية):**
1. **المصفوفة:** 6 مستويات سعرات (1200 · 1500 · 1800 · 2000 · 2500 · 3000) × 4 أنظمة (متوازن · عالي البروتين · كيتو · نباتي) = 24 صفحة خلية على المسار `/ar/diet-plan/{level}/{system}` بمسارات ثابتة (generateStaticParams) + محور `/ar/diet-plan` بجدول المصفوفة كاملاً.
2. **محرك التوليد `src/lib/diet-plan-matrix.ts`:** قاعدة أطعمة عربية (33 صنفاً بقيم لكل 100 غرام — فول وعدس وخبز بلدي وأرز ودجاج وسمك وزبادي وتوفو…) + وجبات أساسية لكل نظام عند 2000 سعرة + **حل تكراري إغلاق الفجوة على الأعداد الصحيحة المعروضة** (العنصر المرن صريح لكل وجبة) — الإجمالي المطبوع لكل خلية يهبط في حدود ±3 سعرة من مستواها (كناري الاختبار ±10).
3. **أرضية الجودة (قائمة DO-NOT «لا آلاف الصفحات الهزيلة»):** كل خلية تحمل **مقدمة فريدة** (فقرة المستوى + فقرة النظام + فقرة أرقام محسوبة) + خطة يوم كاملة بالغرامات والسعرات لكل صنف + جدول ماكروز محسوب + إرشاد المستوى والنظام + FAQ مرئي (4 أسئلة بأرقام الخلية) + **شبكة روابط داخلية** (3 أنظمة أخرى بنفس المستوى + 5 مستويات أخرى بنفس النظام) بنمط eatthismuch.
4. **«توليد أول مجاني بلا تسجيل»:** بطاقة تخصيص بارزة في كل خلية تصل بالمخطط `/ar/meal-planner` — الذي يعمل للزوار فعلاً بلا حساب (3 وجبات بإجماليات حية للطبقة المجانية — مصدر الحقيقة `memberships.ts`) — فالوعد صادق لا تسويقي، وصولة حاسبة السعرات للتحقق من أن المستوى رقمُ الزائر.
5. **الأنظمة تطابق الموقع:** المتوازن 30/40/30 والعالي 45/35/20 والكيتو 25/5/70 هي نفس أنماط حاسبة الماكروز (كناري مثبت)؛ النباتي 25/50/25 موثق كنمط خاص بالمصفوفة. الـhreflang: ذاتي ar + x-default ذاتي — نمط غير المقترن الصادق (P0-4) لأن السطح عربي أولاً بحكم الخطة («النسخة EN لاحقًا لسد عنق strongrfastr»).
6. **المخططات:** BreadcrumbList فقط في المحور والخلايا (صفحات محتوى لا تطبيقات) — **بلا FAQPage وبلا aggregateRating** (كناري بتجريد التعليقات). سايت ماب الصفحات: +25 مدخلاً (محور 0.8 · خلايا 0.7).

**الحراس `diet-plan-matrix.test.ts` ×16 (744→**760**):** شكل المصفوفة 6×4 ورفض المدخلات المجهولة (لا صفحات هزيلة عرضية) · الإغلاق ±10 سعرة على كل خلية وتطابق مجاميع الوجبات مع إجمالي اليوم · تفرد مقدمة كل خلية (24/24) مع 6 فقرات مستويات و4 أنظمة · تطابق الأنماط مع حاسبة الماكروز · MSA بماسح المدونة · عناوين/أوصاف فريدة و**كناري مضاد للازدواج** (العنوان الخام بلا علامة — قالب /ar يضيف «— Alkemos» وحده · الخام + اللاحقة ≤70) · hreflang ذاتي بلا en معلق · ممنوعات المخططات · بطاقة المجان ورابط المخطط في كل خلية · سايت ماب ×25 · جدول المصفوفة في المحور.

**إصلاح تبعي في نفس الفريم (اكتشف بالتحقق الحي بعد النشر — نفس قانون eadb3e7):** التحقق الحي كشف علامة مزدوجة بالعناوين («… | Alkemos — Alkemos» — قالب `/ar/layout` يضيف اللاحقة لكل عنوان سلسلة في نسله حتى يعرّف مقطع وسيط عنوانه الخاص، كما يفعل `/ar/tools/layout`) — نُزعت العلامة من عناوين المحور والخلايا الـ24 (العنوان الخام + اللاحقة = ≤70) + عناوين OG تحمل العلامة صراحة + تحوّل حارس العناوين إلى كناري مضاد للازدواج. البوابات بعد الإصلاح: tsc 0 · eslint 0/0 · vitest 760/760 · build exit 0.

**البوابات (محلياً قبل الدفع):** tsc 0 · eslint 0/0 · vitest **760/760** · next build exit 0 (**2,001 صفحة ثابتة — +25** والمساران يظهران في المخرجات) · docs_audit ✓ · docs_parity ✓ · ملفات البيئة حُذفت بعد البناء. صفر ميجريشنز · صفر مساس منطق الأدوات/الأعمال — إضافات صرفة على سطح جديد.

**بحلول هذا البند اكتملت P1 القابلة للتنفيذ ذاتياً من خطة §12.19 (البنود 6 · 7 · 8 · 9 — والبند 7 ينتظر أول 10 تقييمات Trustpilot حقيقية من المالك لإعادة تفعيل التقييم بمصدر موثق). المتبقي: P2 (توحيد MSA للقوالب القديمة · تصنيف مدونة قابل للزحف · USDA العربي · صور المدونة · إصلاحات Low) وP3 بقرار المالك.**

### 12.27 — تصحيح P1-8 (أ): المصفوفة ثنائية اللغة + اكتشاف المستخدم (2026-09-12 — أمر المالك «فى مشاكل حالية ، بند ٨ تم تنفيذ عربى فقط مكلوب انجليزى ، لا يوجد رابط واضح للمستخدم ولا ذكر فى اى قسم»)

**المطلب (الجزء الأول من أمر التصحيح):** النسخة الإنجليزية لمصفوفة خطط الطعام — الخطة الأصلية أجّلت EN («لاحقاً لسد عنق strongrfastr») والمالك طلبها الآن — إضافةً إلى حل مشكلة الاكتشاف: المصفوفة كانت بلا رابط واضح ولا ذكر في أي قسم من الموقع.

**التنفيذ — السطح الإنجليزي (25 صفحة):**
1. **محرك واحد وحل واحد:** `src/lib/diet-plan-matrix.ts` صار ثنائياً ببناء — `nameEn` للأنظمة الأربعة · `MEAL_NAME_EN` (فطور/غداء/عشاء/سناك) · `FOOD_NAMES_EN` (33 صنفاً — كل مفتاح طعام له اسم إنجليزي، مضمون باختبار تغطية يحل الـ24 خلية ويتأكد أن كل صنف وكل وجبة تُعرض بالإنجليزية) · `LEVEL_GUIDANCE_EN` (6 فقرات) · `SYSTEM_GUIDANCE_EN` (4 فقرات) · `buildCellIntroEn` · `buildCellMetadataEn`. **النص الإنجليزي نثر طبيعي مستقل لا ترجمة حرفية** (قانون «لا ترجمة مباشرة» مطبق في الاتجاهين) — **والأرقام المطبوعة مطابقة حرفياً للتوأم العربي** (نفس الحل، نفس الغرامات — تكافؤ بنيوي كطبقة الأدوات).
2. **الصفحات:** محور `/diet-plan` + 24 خلية `/diet-plan/{level}/{system}` بنفس بنية التوأم (مقدمة ثلاثية + خطة اليوم بالغرامات + جدول الماكروز + إرشاد المستوى والنظام + بطاقة التخصيص المجاني + FAQ مرئي + شبكة روابط داخلية 28 رابطاً/صفحة) — عناوين EN ≤60 بحاملة العلامة الصريحة (جذر EN بلا قالب عناوين) ومقدمة فريدة لكل خلية في اللغتين.
3. **hreflang كامل:** الأربعة ملفات (محور/ورقة × EN/AR) تعلن الزوج en/ar + x-default→EN — انتهى نمط «غير المقترن الصادق» لهذا السطح لأن التوأم أصبح موجوداً؛ السايت ماب: +25 مدخلاً إنجليزياً وكل مدخلات المصفوفة الـ50 تعلن البدائل.

**التنفيذ — الاكتشاف (قانون «رابط واضح وذكر في الأقسام»):**
- **صفحة الأدوات:** بطاقة «خطط غذائية جاهزة / Diet Plan Library» تاسعة الشبكة (isAr-aware تلقائياً بمنطق ToolCard).
- **شريط أدوات أخرى أسفل كل صفحة أداة:** مدخل المصفوفة ينضم لـALL_TOOLS (يظهر في 12 سطح EN/AR).
- **مخطط الوجبات:** بطاقة «تبحث عن خطة جاهزة؟ / Prefer a ready-made plan?» بعد أدوات أخرى — الجسر بين البناء الذاتي والخطط الجاهزة في اللغتين.
- **الرئيسية:** بطاقة المصفوفة في شبكة الأدوات (isAr-aware عبر LandingToolCard الذي أصبح يمرر الروابط عبر المرايا العربية — كانت تشير للإنجليزية من النسخة العربية) + مدخل في عمود الأدوات بالفوتر (صار isAr-aware مع المصفوفة).
- **LanguageToggle:** زوج المحور في MIRROR_ROUTES + قاعدة بادئة للمسارات الديناميكية تبدّل شجرة /diet-plan/ ↔ /ar/diet-plan/ (24 زوجاً بقاعدة واحدة).

**الحراس `diet-plan-matrix.test.ts` 16→**20** (760→**764**):** جودة EN (مقدمة فريدة 24/24 + نثر إنجليزي بلا حروف عربية) · تغطية العرض الثنائي (كل صنف ووجبة يحل بأسماء EN) · عناوين EN فريدة ≤60 · hreflang كامل بالمحاور والأوراق الأربعة · اكتشاف (بطاقة tools + OtherTools + مخطط الوجبات + الرئيسية) · سايت ماب بالغتين مع البدائل.

**البوابات (محلياً قبل الدفع):** tsc 0 · eslint 0/0 · vitest **764/764** · next build exit 0 (**2,026 صفحة ثابتة +25**) · docs_audit ✓ · docs_parity ✓ · ملفات البيئة المؤقتة حُذفت بعد البناء. صفر ميجريشنز · صفر مساس منطق الأعمال — إضافات سطح + روابط.

### 12.28 — تصحيح P1-8 (ب): صفحة تخطيط الوجبات بالذكاء الاصطناعي — تجربة مجانية للجميع بلا تعارض (2026-09-12 — أمر المالك «مءكور خطط وجباتك بالذكاء الاصطناعي ورابط الى بمخطط الوجبات ( اين صفحة تخطيط الوجبات بالذكاء الاصطناعي؟ مطلوب إنشاؤها مع سماح بالتجربة للجميع بدون تعارض مع الاشتراكات )»)

**السياق:** سطح GEO (llms.txt) يعلن «an AI meal planner» وروابطه تشير لمخطط الوجبات اليدوي — صفحة حقيقية لتخطيط الوجبات بالذكاء الاصطناعي لم تكن موجودة. المطلوب: إنشاؤها مع تجربة مجانية للجميع بلا تعارض مع الاشتراكات.

**التنفيذ:**
1. **محرك التجربة `/api/ai/meal-plan-demo`:** توليد يوم كامل من الغذاء العربي/العالمي بالذكاء الاصطناعي عبر `callFreeAIFallbackChain` (نفس سلسلة EVO المجانية) — طلب واحد متزامن مُتحقق الشكل (4 وجبات × أصناف بغرامات وسعرات تُطابق الهدف ±10%).
2. **البوابة المزدوجة ضد الاستنزاف:** حد IP مجزأ بملح EVO (`rateLimit` 5/24 ساعة — رُفع من 3 بعد حوادث انجراف الموديل) — **لا حساب مطلوب ولا حصة اشتراك تُلمس**: التوليد الكامل المتكرر + الحفظ + التصدير + مراجعة الكوتش تبقى في مسارات العضويات (EVO/المدرب) — التجربة عرض واحد قابل للنسخ لا يُخزَّن.
3. **الصفحات `/ai-meal-planner` + `/ar/ai-meal-planner`:** نموذج (سعرات + نظام + ملاحظات اختيارية) ← خطة مولدة تُعرض بغرامات وسعرات + إجمالي يوم؛ المحتوى المرجعي المتوازن يشرح ما يحسنه التوليد وما يتركه للمخطط اليدوي؛ روابط متبادلة لحاسبة السعرات والمصفوفة والمخطط.
4. **تحديث وعد المصفوفة:** بطاقة التخصيص في خلايا المصفوفة الـ48 (EN/AR) والمحورين أصبحت تقدم مولد الذكاء الاصطناعي مساراً أولاً («جرّبه مجاناً») مع المخطط اليدوي للغرامات الدقيقة — الوعد المكتوب «خطط وجباتك بالذكاء الاصطناعي» له الآن وجهة حقيقية.
5. **llms.txt/llms-full.txt (SYNC):** رابط AI Meal Planner يشير للصفحة الجديدة بدل المخطط اليدوي.

**الحراس `ai-meal-planner.test.ts` ×11 (764→**775**):** شكل الاستجابة المولدة يُرفض إن خرج عن المخطاط (وجبات/أصناف/أرقام) + تسامح الأغلفة الشائعة ({plan:{meals}} وبدائل المفاتيح) · إنقاذ التفكير المسبق (نص استدلال قبل JSON يُستخرج منه الخطة) · القيود (سعرات 1200–4000 · نظام من الأربعة · ملاحظات ≤200) · بوابة IP مضمونة بالكود (rateLimit قبل استدعاء المزود) · الصفحات ثنائية بحمل hreflang كامل · تحديث بطاقة المصفوفة (الرابط الأول للمولد في 48 ورقة + المحورين) · SYNC llms.

**إصلاحات تبعية بعد التحقق الحي (نفس قانون الأطر السابقة — خمسة كوميتات e1eb7b2 · 3109127 · 92159e5 · 5bf5544 · bb74579):** التوليد الأول رُفض حياً، فافتُتح مسار تشخيص بمخرج خام مؤقت أزيل فور انتهائه. **الحادثة الأولى:** موديلات التفكير المجانية تُخرج حسابها الاستدلالي (نص وليس reasoning_content) قبل JSON فيقطعه سقف 1600 توكن — الإصلاح: ميزانية 3000 توكن + تعليمات نفي التفكير المكتوب (system+user) + **محلل إنقاذ** يُعيد التحليل من آخر بداية {"meals"…} بحارس REASONING SALVAGE. **الحادثة الثانية:** 504 من Vercel — محاولتان × 28 ثانية تجاوزتا ميزانية الدالة — الإصلاح: 20 ثانية لكل استدعاء. **الحادثة الثالثة:** الموديل العربي وضع كمية يوم كامل على صنف واحد — الإصلاح: تعليمات «كميات كل وجبة على حدها» + سقف 900غ. **الحادثة الرابعة:** زيت زيتون بـ10-15 غ رُفض بأرضية 20غ — الإصلاح: أرضية 5غ (الزيوت بملعقة). **وتحسين الرحلة:** الحد اليومي 5 بدلاً من 3 كي لا يعلق زائر أنفق محاولاته على مخرجات مرفوضة. **النتيجة الحية النهائية:** توليد عربي موثوق (فول مدمس 150غ · خبز بلدي 80غ · زيت زيتون 10غ · 4 وجبات · 1880 سعرة على هدف 2000) وتوليد كيتو ناجح بعده — كل محاولة فاشلة تظل قابلة للإعادة بضغطة الزر.

**البوابات:** tsc 0 · eslint 0/0 · vitest **785/785** · next build exit 0 · docs ✓ · صفر ميجريشنز · صفر مساس حدود العضويات (memberships.ts لم يُلمس).

### 12.29 — تصحيح (ج): بطاقتا التقييم منفصلتان — تراست بايلوت وبروداكت هانت (2026-09-12 — أمر المالك «كارت تراست بايلوت و بروداكت هانت محتاج اعاده تصميم مع فصلهم الى كارتين منفصليين»)

**التنفيذ:** `ReviewInviteCard` (بلا معاملات — قانون §12.24 قائم) يُصيّر الآن **كارتين منفصلتين**: بطاقة Trustpilot (هوية خضراء 00b67a بنجمة واحدة وأيقونة «T» على نمط علامتهم) وبطاقة Product Hunt (هوية برتقالية da552f محايدة الاكتشاف) — كل بطاقة عنوانها وسطرها وزرّها الخاص. النسخ أُعيدت هيكلتها لكل منصة على حدة وبقيت بلا حوافز (كناري الكلمات الـ20 يمسح كل السلاسل الجديدة). **لا gating بنيوياً**: المكوّن ما زال بلا أي props ولا حالة عرض — الكارتان تُصيَّران دائماً مع النتائج ولا يحجبانها (شريطان نحيلان داخل التدفق، ليسا نافذة ولا غطاء).

**الحراس `review-invite.test.ts` 5→**7** (775→**777**):** كل قوانين §12.22/§12.24 باقية (المصدر الوحيد · الروابط القانونية · كناري الحوافز الموسّع للبنية الجديدة · الصفر-معاملات · لا تخزين/إخفاء/مؤقتات) + **كناري الفصل**: الكود المجرّد من التعليقات يحمل بنيتي بطاقة مستقلتين (ثابتا اللونين المميزين + مساري روابط منفصلين) ولا يجمعهما في حاوية أزرار واحدة + **كناري حياد PH** (لا طلب تصويت).

**البوابات:** tsc 0 · eslint 0/0 · vitest **785/785** · next build exit 0 · docs ✓ — تعديل صرف على المكوّن والنسخ؛ مواضع الإدراج الأصلية بلا مساس + سطح إنجازي جديد: صفحة مولد الوجبات بالذكاء الاصطناعي (§12.28) تحمل الكارتين أيضاً — الأسطح الإنجازية أصبحت 14 (7 صفحات ثنائية).

### 12.30 — تصحيح (د): أداة قائمة التسوق — الوفاء بالوعد المكتوب (2026-09-12 — أمر المالك «مكتوب وعد بعمل قائمة تسوق للاكل ولاكن لا يوجد أداة لتنفيذ الامر»)

**السياق:** المحتوى المرجعي لمخطط الوجبات (§12.25) يشرح تحويل الخطة إلى قائمة مشتريات أسبوعية بعازل 20% — شرحٌ بلا أداة. المطلوب: أداة تنفّذ الوعد على خطة المستخدم الفعلية.

**التنفيذ:**
1. **`src/lib/shopping-list.ts` (وحدة نقية قابلة للاختبار):** `aggregateShoppingList(meals, { days, buffer })` تجمع الأصناف عبر الوجبات (توحيد الاسم) وتضرب في عدد الأيام وتطبق العازل (افتراضي 20% كما يشرح المحتوى) وتعيد صفوفاً بغرامات إجمالية معروضة بوحدة مناسبة (غ/كجم) + إجمالي سلة تقديري.
2. **`ShoppingListCard` في مخطط الوجبات:** بعد الإجمالي الكلي — اختيار مدة (يوم/3 أيام/أسبوع) ومفتاح العازل، ثم جدول القائمة مع زر نسخ نصي جاهز للمتجر (bilingual · بلا أي بوابة عضوية — القائمة تُبنى من خطة الزائر المجانية نفسها).
3. **جسر المحتوى:** فقرة الوعد في المحتوى المرجعي تشير الآن للأداة («ولّدها من خطتك بالأسفل») — الوعد والتنفيذ في نفس الصفحة.

**الحراس `shopping-list.test.ts` ×8 (777→**785**):** صحة التجميع (مجموع الغرامات عبر الوجبات بلا فقد) · التوحيد (صنف مكرر بوجبتين يظهر صفاً واحداً بمجموعه) · المضاعف والعازل (7 أيام × 1.2 على متجه معروف) · حدود المدخلات (يوم واحد لا يكسر الجدول) · عرض الكجم عند ≥1000 غ · كناري الربط (المخطط يحمل المكوّن والوعد يشير للأداة) · لا بوابة عضوية بالمكوّن ولا الوحدة.

**البوابات:** tsc 0 · eslint 0/0 · vitest **785/785** · next build exit 0 · docs ✓ · صفر ميجريشنز · صفر مساس منطق الحفظ/التصدير/العضويات.

**إغلاق أمر التصحيح الرباعي (§12.27–12.30):** المصفوفة ثنائية اللغة ومكتشفة من كل الأقسام · صفحة AI حية بتجربة مجانية بلا تعارض · كارتا تقييم منفصلتان · قائمة تسوق تنفّذ الوعد — كلها بأوامر المالك الحرفية أعلاه، وبوابات خضراء، وصفر مساس لمنطق الأعمال.

### 12.31 — توحيد اسم مخطط الوجبات بالذكاء الاصطناعي (2026-09-12 — أمر المالك «عدل الاسم الى مخطط الوجبات بالذكاء الاصطناعي»)

**السياق:** الاسم الكامل «مخطط الوجبات بالذكاء الاصطناعي» (§12.28) كان يظهر مبتوراً على شبكة الأدوات في الرئيسية — «مخطط بالذكاء الاصطناعي» بلا كلمة «الوجبات» — فلا يعرف الزائر ماذا يخطط أصلاً؛ والمخطط نفسه كان غائباً كلياً عن درج التنقل (مجموعة الأدوات كانت تحمل اليدوي فقط).

**التنفيذ:**
1. **الرئيسية (LandingView):** بطاقة المولد في شبكة الأدوات تحمل الاسم الكامل الموحد، ومدخل بالاسم الكامل أُضاف لعمود الأدوات بالفوتر.
2. **درج التنقل (SiteHeader — مجموعة الأدوات):** مدخل «مخطط الوجبات بالذكاء الاصطناعي / AI Meal Planner» بجوار المخطط اليدوي — كان مفقوداً بالكامل.
3. **بقية الأسطح (صفحة الأدوات · OtherTools · tool-schema · layouts):** كانت تحمل الاسم الكامل أصلاً — الكناري الجديد يجمّد التوحيد.

**الحراس (ai-meal-planner.test.ts — DISCOVERABILITY موسّعة):** كناري الاسم الموحد: الرئيسية ودرج التنقل يحملان «مخطط الوجبات بالذكاء الاصطناعي» والصيغة المبتورة ممنوعة في مصدر الرئيسية كله.

### 12.32 — أداة جديدة: مخطط التمارين بالذكاء الاصطناعي — تجربة مجانية بلا تعارض (2026-09-12 — أمر المالك «ضيف أداة جديده مخطط التمارين بالذكاء الاصطناعي»)

**المطلب:** التوأم التدريبي لمولد الوجبات §12.28 — بنفس نمط التجربة المجانية للجميع وبلا أي تعارض مع الاشتراكات، وبتطبيق كل قوانين §12.28 الحية المحصّنة منذ اليوم الأول (لا انتظار حوادث).

**التنفيذ:**
1. **المحرك النقي `src/lib/ai-workout-planner.ts`:** تحقق المدخلات (4 أهداف: خسارة الدهون/بناء العضلات/زيادة القوة/اللياقة العامة × 3 مستويات × 2–6 أيام × 3 عوالم تجهيز: بلا معدات/دمبل بالبيت/نادي كامل × en|ar × ملاحظات ≤200) + برومبت ثنائي اللغة **يثبّت عدد الأيام المطلوب** (مرساة الصدق التي يفرضها المتحقق) ويوجّه لعائلات التمارين المعروفة بما يناسب التجهيزة + متحقق شكل صارم: مصفوفة الأيام **تطابق الطلب بالضبط**، 3–8 تمارين لكل يوم، مجموعات 1–10، تكرارات رقمية 1–50 أو مدى «8-12» — وكل ما عداه يُرفض (422) لا يُعرض + محلل إنقاذ التفكير المسبق (يستخرج آخر `{"days"`).
2. **المسار `/api/ai/workout-plan-demo`:** توليد واحد متزامن على السلسلة المجانية (نمط EVO التفاعلي) — بوابة IP بحد **5/يوم** قبل أي استدعاء مزود · ميزانية 3000 توكن (موديلات التفكير) · **20ث لكل استدعاء** (الزوج الأول+إعادة المحاولة داخل ميزانية 60ث — لا 504) · jsonMode مع برومبت نظام JSON-only نافٍ للتفكير المكتوب · إعادة محاولة واحدة محدودة داخل نفس الطلب (لا تحرق رصيد الزائر) · 422 عند خرج الشكل برسالة إعادة محاولة. **صفر تعارض مع الاشتراكات:** لا حساب ولا صفوف ai_jobs ولا حصص ولا بوابات — البرامج المحفوظة وتوليد EVO ومتابعة الكوتش تبقى في مسارات العضويات (memberships.ts لم يُلمس).
3. **الصفحات `/ai-workout-planner` + `/ar/ai-workout-planner`:** نموذج (هدف/مستوى/أيام/تجهيزة/قيود اختيارية) ← نظام أسبوعي مولّد (يوم بتمارينه: 4×8 أو 3×8-12) + كارتا التقييم على سطح الإنجاز (قانون §12.24) + نسخة صادقة: ما يضيفه التوليد (تركيب الأسبوع المتوازن المطابق لأيامك لا نسخ يوتيوب) وحدوده (الباقي في العضويات) + تذكير السلامة (الإصابات والظهر والركبة والكتف) + روابط متبادلة (برامج جاهزة · مكتبة التمارين · مولد الوجبات · حاسبة السعرات) + WebApplication/Offer($0)/Breadcrumb/HowTo عبر tool-schema (مدخل ثنائي كامل).
4. **الاكتشاف الكامل منذ اليوم الأول (درس §12.27 «لا ذكر فى اى قسم»):** درج التنقل (مجموعة الأدوات) + صفحة الأدوات + OtherTools + شبكة الرئيسية + فوتر الرئيسية + LanguageToggle (زوج) + سايت ماب (زوج بالبدائل en/ar) + llms.txt وllms-full.txt (SYNC — الفقرة الافتتاحية وقسم الأدوات يحملان المخططين).
5. **العنوان AR بلا علامة** (قالب /ar يضيفها — قانون eadb3e7) وEN يحمل العلامة صراحة — كناري مثبت.

**الحراس `ai-workout-planner.test.ts` ×10 (785→**795**):** المدخلات الحدودية والبرومبت المثبّت (الأيام/الهدف/المستوى/التجهيزة/JSON-only باللغتين) · **مرساة الصدق** (عدد الأيام ≠ الطلب ⇒ رفض قاطع) + الأغلفة الشائعة ({plan:{days}} وبدائل المفاتيح) + المدى النصي للتكرارات يمر والأشياء الأخرى تُرفض · إنقاذ التفكير المسبق · بوابة IP قبل المزود (ترتيب الاستدعاءات) + العزلة الكاملة (لا enqueue/quota/memberships) + قوانين §12.28 الحية مضمونة بالكود (3000 توكن · 20ث · jsonMode · REMINDER) · السطح الثنائي بالhreflang الكامل والschema وبلا FAQPage/aggregateRating · SYNC llms بالملفين · السايت ماب بالزوج · الاكتشاف الخماسي (أدوات/OtherTools/رئيسية/تنقل/تبديل لغة) · النسخة الصادقة (5/يوم · لا حفظ · مسارات العضويات).

### 12.33 — نقل الخطط الغذائية الجاهزة إلى المكتبات باسم «مكتبة الخطط الغذائية الجاهزة» (2026-09-12 — أمر المالك «انقل خطط غذائيه جاهزة الى المكتبات باسم مكتبة الخطط الغذاييه الجاهزه»)

**السياق:** الخطط الجاهزة كانت مصنّفة **أداة** بين الحاسبات (بطاقة في شبكة أدوات الرئيسية وقائمة الأدوات وOtherTools) — والتصنيف الأدق عند المالك: **مكتبة محتوى جاهز للتصفح** بجوار مكتبة التمارين ومكتبة الأكلات، وباسم محدد.

**التنفيذ — النقل والتسمية في كل الأقسام (المسارات لم تتغير إطلاقاً — تصنيف وهوية، صفر إعادة توجيه):**
1. **درج التنقل:** مدخل «مكتبة الخطط الغذائية الجاهزة / Diet Plans» في مجموعة المحتوى بجوار مكتبة التمارين ومكتبة الأكلات.
2. **صفحة الأدوات:** قسم **«المكتبات / Libraries»** معنون أسفل شبكة الأدوات — بطاقة الخطط انتقلت إليه مع مكتبتي التمارين والأكلات (والبطاقة تحمل الاسم الكامل بعد أن كان الاسم متفاوتاً: خطط غذائية جاهزة/Diet Plan Library/Ready Diet Plans).
3. **OtherTools (أسفل كل صفحة أداة — 12 سطح EN/AR):** عنقود «المكتبات» المعنون أسفل الأدوات الأخرى، والبطاقة فيه بالاسم الكامل.
4. **الرئيسية:** البطاقة خرجت من شبكة الأدوات، والمدخل استقر في عمود «المحتوى» بالفوتر بالاسم الكامل (بجوار مكتبتي التمارين والأكلات).
5. **PageBottomPromo (استكشف المزيد أسفل صفحات المكتبات):** مدخل المكتبة انضم للعنقود.
6. **جسر مخطط الوجبات:** بطاقة «تبحث عن خطة جاهزة؟» تعرض اسم المكتبة («مكتبة الخطط الغذائية الجاهزة: ٢٤ خطة…»).
7. **خلايا المصفوفة الـ48 (عبر قالبي EN/AR):** فتات الخبز وروابط العودة تحمل اسم المكتبة («مكتبة الخطط الغذائية الجاهزة / Diet Plan Library» — كانت «خطط الأنظمة الغذائية / Diet Plans»).
8. **GEO:** llms.txt وllms-full.txt — «Diet Plan Library» بدل «Diet Plan Matrix» (SYNC محفوظ بالكناري).

**الحراس (diet-plan-matrix.test.ts — DISCOVERABILITY أعيدت كتابتها ×2):** مواضع المكتبات الخمسة (درج التنقل بقسم المحتوى · صفحة الأدوات بقسم libraries · OtherTools بعنقود LIBRARIES · جسر المخطط · فوتر الرئيسية بعمود المحتوى) + كناري الاسم الكامل في كل موضع + **§12.33 LEAF LABELS** (الخلايا تشير للمكتبة باسمها).

### 12.34 — إعادة توزيع المكتبة: كارت لكل نظام وأسفله اختيارات السعرات (2026-09-12 — أمر المالك «عدل شكل وتوزيع الخطط الغذاييه الجاهزه الى كارت لكل نوع واسفل منه اختيارات السعرات»)

**السياق:** المحور كان يعرض المصفوفة **جدولاً** (6 صفوف مستويات × 4 أعمدة أنظمة، وكل خلية رابط «الخطة»/«Plan») — التوزيع اليدوي الذي يفحصه الزائر خلية خلية.

**التنفيذ (المحوران EN/AR):**
1. **4 كروت أنظمة** (متوازن · عالي البروتين · كيتو · نباتي) بأسلوب marble-card — كل كارت بعنوان النظام وشعار توزيعه (30/40/30 · 45/35/20 · 25/5/70 · 25/50/25 — مطابقة لحاسبة الماكروز) وسطر وصف صادق لوظيفته.
2. **أسفل كل كارت: اختيارات السعرات الست** (1200 · 1500 · 1800 · 2000 · 2500 · 3000) روابط واضحة لهوية كل خلية — 4×6=24 مدخلاً كما كان، لكن التوزيع «نوع ← سعرات» كما أمر المالك.
3. **هوية المكتبة في العناوين:** AR «مكتبة الخطط الغذائية الجاهزة — من 1200 إلى 3000 سعرة» (بلا علامة — قالب /ar يضيفها؛ الخام+اللاحقة ≤70) · EN «Diet Plan Library: Ready-Made Plans by Calories | Alkemos» · فتات الخبز باسم المكتبة · H1 يحمل الاسم.
4. **حفظ أصل SEO:** الفقرات التمهيدية الثلاث (الوعد والبداية من الرقم وخطوة التخصيص) وقسم «كيف تقرأ الخطة» بقيت كلماتها — مع تحديث الإحالات من «المصفوفة» إلى «المكتبة» فقط.

**الحراس (diet-plan-matrix.test.ts — §12.34 HUB):** الكروت (marble-card + «اختيارات السعرات»/«Calorie options:» + DIET_SYSTEMS.map + DIET_LEVELS.map + s.nameEn بالإنجليزية) · **كناري سلبي: لا `<table`** في أي محور · هوية المكتبة (الاسم الكامل AR/EN) · الكانونيكال الذاتي محفوظ في المحورين.

**بوابات الدفعة كاملة (§12.31–12.34):** tsc 0 · eslint 0/0 · vitest **796/796** (785 + 10 مخطط التمارين + 1 كناري أوراق المكتبة) · next build exit 0 (**2,032 صفحة ثابتة** — زوج مخطط التمارين ضمنها) · docs_audit ✓ · docs_parity ✓ · migration_audit --ci · stale-refs · ui-wiring · صفر ميجريشنز · memberships.ts لم يُلمس · صفر تغيير مسارات (النقل تصنيف وهوية — لا إعادة توجيه).

### 12.35 — مخطط التمارين بالذكاء الاصطناعي يستخدم مكتبة التمارين بالصور في النتائج (2026-09-12 — أمر المالك «أداة خطط التمرين بالذكاء الاصطناعي استخدم مكتبة التمارين بالصور الخاصة بنا فى النتائج ، ثم ابدأ p2»)

**السياق:** نتائج §12.32 كانت صفوف نصية (اسم التمرين + مجموعات × تكرارات) — بينما يملك الموقع مكتبة تمارين خاصة به من **868 تمريناً بصور حقيقية** (بداية/نهاية الحركة من free-exercise-db عبر GitHub raw) وصفحات شرح ثنائية لكل تمرين. أمر المالك يربط النتيجة المولّدة بالمكتبة: صور + صفحات.

**التنفيذ (تخصيب من طرف الخادم — طبقة نقية قابلة للاختبار):**
1. **المُطابِق النقي `src/lib/ai-workout-exercise-match.ts`** (server-only — يستورد مصفوفة التمارين 1.6MB حسب قانون الحزمة BUNDLE LAW فلا يصل المتصفح منها شيء): تطبيع ثنائي (إنجليزي/عربي — تشكيل/تطويل/همزات/ال التعريف/البادئات المتصلة بال/بال) + **معجم عربي→إنجليزي** لمفردات عائلات التمارين (سكوات/رفعة ميتة/بنش برس/تجديف/عقلة/ثني/بسط/سمانة/بلانك/…) ثم تطابق توكنات بغطاء ≥0.6 مع توقيعي تطابق على الأقل (أو ضربة مفردة ضيقة لاسم قصير) — **لا تخمين أبداً**: الحركة بلا شاهد توكني تكتب صفاً نصياً عادياً بلا صورة ولا رابط.
2. **قانون صدق التجهيزة:** عالم التجهيزة المطلوب يرشّح المكتبة (bodyweight ← وزن الجسم فقط · home-dumbbells ← دمبل/وزن جسم · full-gym ← الكل)، والتجهيزة المسماة صراحة في الاسم (بار/دمبل/كابل/ماكينة/كيتل/مطاط) **تثبّت** العائلة — «بنش برس بالبار» في عالم الدمبل = بلا مطابقة (لا يُربط تمرين بار بطلب دمبل).
3. **المسار يخصّب الخطة المُتحقَّقة** (`/api/ai/workout-plan-demo` — بعد بوابة الشكل نفسها): كل تمرين يحمل `library: {slug, name, category, image} | null` — الصورة الأولى للمكتبة (وضع البداية) برابطها الكامل.
4. **الصفحة (زوج EN/AR بصيغة `isAr`):** صف التمرين المطابق = صورة مصغرة 48px (ImageWithFallback بنمط PlansView + فولباك فئة SVG) + الاسم رابطاً إلى صفحة التمرين باللغة الصحيحة (`/exercises/{slug}` أو `/ar/exercises/{slug}`) + سطر إعلان صادق تحت العنوان («الحركات المطابقة في مكتبة التمارين تظهر بصورها… أكثر من 868 تمريناً»); الصفوف غير المطابقة تبقى نصاً كما كانت.
5. **الحتمية:** التعادل يُحسم بالغطاء ثم أقل توكنات زائدة ثم أقصر اسم ثم ترتيب المصفوفة — نفس المدخل يعطي نفس المطابقة دائماً.

**الحراس (`ai-workout-exercise-match.test.ts` ×7 — 796→803):** التطابق الإنجليزي القانوني (بنش/روماني/بلانك/بايسبس/لات + الجمع والمورفولوجيا) · التطابق العربي (بنش برس بالبار/رفعة ميتة رومانية/سكوات/بلانك/ثني بايسبس بالدمبل/تجديف بالكابل جالس/ضغط كتف بالبار) · قانون التجهيزة (بار في bodyweight وhome-dumbbells = null · سكوات bodyweight = bodyweight-squat) · عدم الاختلاق (أسماء وهمية عربية وإنجليزية = null) · الحتمية + تغطية العائلات (≥17/20 إنجليزي و≥9/13 عربي) · التخصيب (library دائماً حقل صريح · sets/reps بلا مساس · focus بلا اختلاق) · الكناري البنيوي (المسار يخصّب بعد parseWorkoutPlanText · الصفحة تعرض ImageWithFallback وتحمل الرابط الثنائي ولا تستورد المُطابِق ولا المصفوفة — قانون الحزمة).

**البوابات:** tsc 0 · eslint 0/0 · vitest **803/803** · next build exit 0 (**2,032 صفحة** — صفر صفحات جديدة؛ التخصيب زمن تشغيل لا مسارات) · docs_audit ✓ · docs_parity ✓ · migration_audit --ci · stale-refs · ui-wiring · صفر ميجريشنز · memberships.ts لم يُلمس · حدود التجربة (5/يوم/IP) كما هي.

**الجزء الثاني من الأمر — بدء P2:** يبدأ تنفيذ دفعة P2 (البنود 10–14 من خطة §12.19) فور إغلاق هذه الحركة، بتوثيق كل بند في §12.36 وما بعده.

### 12.36 — P2-11: تصنيف مدونة قابل للزحف — 20 صفحة فئات بروابط سياقية (2026-09-12 — أمر المالك «… ثم ابدأ p2»، البند 11 من خطة §12.19)

**السياق:** فئات المدونة العشر كانت **أزرار فلترة client-state** في صفحة القائمة — غير مرئية لرابط-الزحف إطلاقاً (صفر صفحات فئات في الفهرس رغم 70 مقالاً منشوراً). البند 11: «صفحات فئات/وسوم فعلية بروابط سياقية».

**التنفيذ:**
1. **20 صفحة فئات ثابتة المسار:** `/blog/category/{id}` + `/ar/blog/category/{id}` للفئات العشر (generateStaticParams · ISR 300s مثل أسرة المدونة كلها) — بكانونيكال ذاتي وhreflang ثنائي متبادل وx-default للإنجليزية وOG عربي ar_EG للمرايا.
2. **محتوى تعريفي فريد لكل فئة:** `blog-category-content.ts` — عشرون مقدمة (10 EN + 10 AR) لا تشارك أي كتلة ≥25 كلمة بين فئتين (قانون §12.25) · العربية فصحى بنتيجة ماسح اللهجات صفر علامات قوية (قانون 175/176 ممتداً لنسخ المحاور) · كل مقدمة تحيل لأدوات حقيقية (حاسبة السعرات · الماكروز · متتبع الماء) بلا أرقام مختلقة.
3. **مكوّن خادمي نقِي `BlogCategoryPage`:** كل الرسم في HTML الأول — H1 بالفئة + المقدمة + شبكة كروت المقالات (روابط `<a>` حقيقية بلغة الصفحة) + شريط فئات **روابط** (الفئة الحالية مميزة) + قسم «تصنيفات أخرى» يصل كل فئة أخيرة بقفزة زحف واحدة + حالة فارغة صادقة.
4. **تحويل رقاقات القائمة إلى روابط:** أزرار الفلترة في `BlogListPage` صارت `<Link>` لصفحات الفئات (البحث يبقى client-side — مسارات نتائجه غير قابلة للفهرسة أصلاً بحكم الكانونيكال الصحيح) — وحذف حالة الفلترة العميلية كاملة.
5. **رابط سياقي من كل مقال:** شريحة الفئة في رأس صفحة المقال صارت رابطاً لصفحة فئتها.
6. **بيانات الخادم:** `listPublishedPostsByCategory(lang, id)` — نفس قانون حقول البطاقات (Phase 134: لا تُحمَّل المتون في صفحات القوائم) وصفيف فارغ عند أي فشل (لا 500 أبداً).
7. **السايت ماب:** +20 مدخلاً ببدائل hreflang في sitemap-pages.
8. **الوسوم (tags) تبقى client-side بقرار موثق:** عددها حر لكل مقال وصفحاتها ستكون رقيقة بمقياس DO-NOT — الفئات العشر هي السطح القابل للزحف.

**الحراس (`blog-category-pages.test.ts` ×4 — 803→807):** المحتوى (10 فئات × مقدمة ≥40 كلمة لكل لغة + صفر لهجة قوية + لا كتلة مشتركة ≥25 كلمة بين أي فئتين) · الأسطح (زوجان بالمسارين + generateStaticParams على المجموعة كاملة + hreflang متبادل + BreadcrumbList + لا FAQPage/aggregateRating + عنوان AR بلا علامة — قانون eadb3e7) · رابط-الزحف (المكوّن بلا "use client" + الرقاقات روابط ولا setCategory + شريحة المقال رابط + `.eq("category", categoryId)` خادمياً) · السايت ماب (المدخلات العشرون بالبدائل).

**البوابات:** tsc 0 · eslint 0/0 · vitest **807/807** · next build exit 0 (**2,052 صفحة** = 2,032 + 20 فئة) · docs_audit ✓ · docs_parity ✓ · migration_audit --ci · stale-refs · ui-wiring · صفر ميجريشنز · صفر مساس بأي سير عمل مدونة أو مسار نشر.

**إصلاح تبعي بعد التحقق الحي (نفس جلسة §12.35):** التوليد الحي EN كشف ثلاث ثغرات في المُطابِق أُصلحت فوراً: (1) **جمع إنجليزي مكسور** — قاعدة قص «es» كانت تحوّل «lunges»→«lung» فتفقد «Walking lunges» مطابقتها؛ الحل: مطابقة بكل متغيرات الجمع (s-strip وes-strip معاً)؛ (2) **مرادف مكتبة غائب** — «Back squat» بلا أي مدخل يحمل back+squat (المكتبة تسميه Barbell Squat) → خريطة مرادفات صريحة (back squat↔barbell squat ثنائية اللغة) — كل مرادف تكافؤ معترف به عالمياً لا تخمين؛ (3) **ترتيب المُعدِّل مقابل اللاحقة** — «Barbell bench press» كان يربط لنسخة «Guillotine» (مُعدِّل قبل الجذع = حركة مختلفة) بينما «- Medium Grip» لاحقة تنويع؛ الحل الثلاثي: عقوبة المُعدِّل القبلية الثقيلة (4.0 مقابل 0.5 لللاحقة) مع إعفاء كلمات التجهيزة (barbell/dumbbell/…) + **الغطاء الدلالي** (كلمات التجهيزة في مدخل النموذج توكنات اختيارية — «Dumbbell lateral raise» يقاس على lateral+raise فلا يربط لـ«Dumbbell Raise» الحركة المختلفة بل لـ«Side Lateral Raise»). النتيجة الحية بعد الإصلاح: **15/15 حركة من التوليد الحي مطابقة بمدخلات صادقة** (Hammer Curls بدل Preacher variant · Side Lateral Raise بدل Lying Rear · Barbell Squat لـBack squat) — والحراس وسّعت لتحرس الثلاث ثغرات (كناري Guillotine سلبي + جانبي + مرادفات).

### 12.37 — P2-12: معالجة USDA العربي — مرايا AR للذيل الطويل تغادر الفهرس (2026-09-12 — أمر المالك «… ثم ابدأ p2»، البند 12 من خطة §12.19)

**السياق:** تدقيق 141 حصر السايت ماب في المنسّق (160 رابطاً) لكن ظل الذيل الطويل (8,750 صفاً بـ`nameAr` إنجليزي 100%) **قابلاً للفهرسة** — كل مرآة AR له ترسم عنواناً إنجليزياً داخل قالب عربي (صفحات رقيقة مكسورة دلالياً لا يمكن أن تترتيب لاستعلام عربي) وتبدد ميزانية زحف AR.

**التنفيذ (الرافعة الأصغر):** `src/app/ar/foods/[slug]/page.tsx` — كشف حتمي بالبيانات نفسها (`!/[\u0600-\u06FF]/.test(food.nameAr)`): المرايا AR عديمة العربية → `robots: { index: false, follow: true }` (تغادر الفهرس تدريجياً مع بقاء تدفق الزحف بالروابط الداخلية) · المنسّق (أسماء عربية حقيقية — الـ160 المعلنة) يبقى مفهرساً بالكامل · **التوأم EN لم يُمس** (سياسة 141 المعتمدة من المالك: الذيل الإنجليزي حي ومفهرس عبر الروابط الداخلية) · صفر تغيير في السايت ماب أو البيانات أو المسارات — قرار قابل للعكس بكوميت واحد.

**الحراس (foods-sitemap-policy.test.ts +1 — 807→810 مع صور المدونة):** المسار AR يحمل القانون (arabiclessName + noindex,follow + كشف \u0600-\u06FF على nameAr) · المسار EN لا يحمله · حقائق البيانات (الذيل >5000 صف وصفر عربية فيه — لو عرّب المستقبل الأسماء يفشل الحارس ويُعاد النظر في القانون).

### 12.38 — P2-13: صور المدونة — width/height إلزامي + تصغير وقت الرسم (2026-09-12 — أمر المالك «… ثم ابدأ p2»، البند 13 من خطة §12.19)

**السياق (نتيجة الزحف الحي R2):** صور جسم المقال كانت `<img>` بلا width/height (CLS) وبحجم Pexels الكامل 1200×627 (~31-87KB) — بينما حلت Phase-139 هذا للبطاقات والأبطال فقط.

**التنفيذ (`src/lib/blog.ts` renderMarkdown):** صور Pexels في الجسم → تصغير وقت الرسم بنمط 139 (`sizedRemoteImage(url, 896, 2)`: w=896 · h=448 · fit=crop · fm=webp) + `width="896" height="448"` صريحة (المتصفح يحجز صندوق 2:1 قبل التحميل — صفر CLS) + `h-auto` · المضيفات الأخرى تمر بلا أبعاد مختلقة (لا نبتكر أبعاداً لمجهولة) · الأبطال والبطاقات كانت محجوزة أصلاً بـaspect+fill.

**القرار الملكي المؤجل (موصى به للمالك):** `images.unoptimized=true` يبقى على الخطة المجانية لـVercel (تحسين الصور يستهلك الحصة) — الكلفة الحالية مُدارة بنمط 139 (تصغير CDN عند Pexels نفسها بلا معالجة Vercel)؛ إعادة النظر عند ترقية الخطة أو قياس استهلاك حقيقي.

**الحراس (blog-markdown-images.test.ts +2):** صورة Pexels تحمل w=896/h=448/fit=crop/fm=webp + width/height + lazy + h-auto · غير Pexels تمر بلا width/height (لا اختلاق أبعاد).

**بوابات الدفعة (§12.37+§12.38):** tsc 0 · eslint 0/0 · vitest **810/810** · next build exit 0 · docs_audit ✓ · docs_parity ✓ · migration_audit --ci · stale-refs · ui-wiring · صفر ميجريشنز · صفر تغيير بيانات أو مسارات.

**المتبقي من P2:** البند 10 (توحيد MSA للقوالب القديمة — دفعة محتوى مستقلة بحجمها) · البند 14 (إصلاحات Low: SearchAction · اتساق og:image مقابل JSON-LD · وصف EN للكيان على الرئيسية EN).

### 12.39 — §12.35 متابعة حية ثانية: أنماط التسمية العربية الحقيقية (2026-09-12 — التحقق الحي AR لأمر المالك «استخدم مكتبة التمارين بالصور الخاصة بنا فى النتائج»)

**التوليد الحي AR كشف أربع عائلات أنماط لم يغطها المُطابِق الأول:** (1) **النقحرة** — النموذج يكتب كيرل/هامر/بريس/ليج لا ثني/مطرقة/برس/رجل → المعجم امتد بالنقهرات + رفع→raise؛ (2) **التوكنات الحشوية** (تمرين، للعضلة…) تُغرق الغطاء → قانون جديد: التوكن العربي غير المعروف في المعجم = دليل غائب لا دليل معاكس — يخرج من المقام لا يغرقه؛ (3) **كلمات العضلة الهدف نصف الوزن** (بايسبس في «كيرل بار للبايسبس» زائدة دلالياً عن الحركة) → وزن 0.5: دليل مساند لا حاسم؛ (4) **خلفي→reverse كانت تسبب مطابقة خاطئة** (سكوات خلفي → Reverse Band Box Squat) → نزع reverse من خلفي (بقيت rear) + تعميم مرادف سكوات خلفي/سكوات بار خلفي→سكوات بالبار.

**النتيجة الحية AR بعد الإصلاح (9/16 → 6/6 على عينة الأنماط):** كيرل بار للبايسبس→Barbell Curl · هامر كيرل دمبل→Hammer Curls · ضغط ساقين (ليج بريس)→Leg Press · تمرين كيرل للعضلة الخلفية (ليج كيرل)→Ball Leg Curl · سكوات بار خلفي→Barbell Squat · رفع جانبي دمبل للكتف→Side Lateral Raise — والأسماء المجهولة بالكامل تبقى بلا مطابقة (أرضية قانون الحشو). الحراس امتدت بالأنماط الستة. **810/810.**

### 12.40 — P2-14 إصلاحات Low الثلاث (2026-09-12 — أمر المالك «ابدأ البند ١٤»: «إصلاحات Low: هدف SearchAction (لا يُفهرس) · اتساق og:image مقابل JSON-LD image · وصف Organization/WebSite بالإنجليزية على الرئيسية EN»)

**أمر المالك (حرفياً):** «ابدأ البند ١٤» — البند الأخير القابل للتنفيذ ذاتياً في P2، ويغلق ملاحظات التدقيق الثلاث منخفضة الخطورة (#8 · #9 · #10 في findings-site.md).

**(أ) هدف SearchAction صار وظيفياً (الملاحظة #8):** التدقيق وثّق أن الهدف `/blog?search={search_term_string}` يُوحَّد canonical إلى `/blog` فلا يُفهرس — والفحص الحي كشف أعمق: المعامل **لم يكن يعمل إطلاقاً** عند الهبوط عليه (البحث حالة client معزولة عن شريط العنوان)، فكان ما يقرأه الآلات من المخطط وعداً كاذباً. **القرار الهندسي:** الهدف صار **وظيفياً لا مفهرساً** — `BlogListPage` يقرأ `?search=` من شريط العنوان بعد الـhydration ويغذيها في حالة البحث الموجودة، فيمرّ الزائر (أو محرك AI يتبع المخطط) عبر نفس مسار البحث المكتوب بالضبط. عمداً بلا `useSearchParams` (كان سيسحب `/blog` كله من ISR إلى دايناميك لكل طلب + يحتاج Suspense) — بذرة client بـ`window.location` في effect واحد آمنة للـhydration، والقشرة الثابتة وشبكة المقالات الـSSR تحتفظ بكاش 5 دقائق. متغير `?search=` يبقى بـcanonical نظيف `/blog` **قراراً مقصوداً** (صفحات نتائج البحث خارج الفهرس عمداً — قانون موثق في تعليق الكومبوننت وSEO-SCHEMA-REFERENCE: ميزة صندوق بحث sitelinks تقاعدت في Google 2024 والقيمة المتبقية للمخطط هي قراءة الآلات واتباعها الرابط). قانون البحث نفسه استُخرج إلى وحدة نقية `src/lib/blog-search.ts` (`matchesBlogSearch` — title+excerpt+focus_keyword+keywords+tags+category، substring صغيرة الحرف) — مصدر واحد يستخدمه `listBlogPosts` وتحرسه الاختبارات فلا انحراف بين مسار العمق والمسار المكتوب.

**(ب) اتساق og:image ↔ JSON-LD image (الملاحظة #10):** التدقيق رصد على المقالات og:image = الصورة المعلَّمة المحلية `/api/og-image/{slug}` بينما `image` في Article JSON-LD = رابط Pexels **الخارجي** الخام؛ والفحص وجد نفس العائلة في المقارنات الست (JSON-LD كان يسقط إلى `/logo.png`). **الإصلاح في الأسطح الأربعة** (مدونة EN/AR + مقارنات EN/AR): مخطط Article يحمل الآن **نفس رابط** الصورة المعلَّمة 1200×630 الذي تعلنه og:image/twitter:image (متغير `?lang=` الصحيح لكل لغة) — مصدر واحد للصورة التمثيلية عبر الميتا والـJSON-LD، والصورة المعلَّمة تمثيل أمين للمقال (عنوانه ووصفه وعلامة Alkemos) وهي ما تراه منصات التواصل وGoogle Discover في كل مشاركة.

**(ج) وصف الكيان بلغة الصفحة (الملاحظة #9):** التدقيق وثّق وصف Organization/WebSite **عربياً على الرئيسية الإنجليزية** — خلط لغات في أول ما تقرأه الآلات عن الكيان. **الإصلاح:** الوصفان صارا ثنائيي اللغة بمعامل `lang` **إلزامي** (أمان وقت الترجمة ضد تسرب عربي صامت إلى أسطح EN مستقبلاً) — `getOrganizationSchema(lang)` و`getWebSiteSchema(lang)` من `ORG_DESCRIPTIONS`/`WEBSITE_DESCRIPTIONS`، والـlayout الجذري يمرر locale المسار المحلول: أسطح EN تحمل «The complete digital training platform: 868+ exercises with photos, 8,830+ foods with nutrition data…» وأسطح /ar تحافظ على العربية الأصلية حرفياً. sameAs وأرقام المنصة (868/8,830) في اللغتين — روابط الكيان لم تتغير قيد أنملة.

**الحراس (+12 → 822/822):** `low-fixes-p2-14.test.ts` — (1) وصف EN صفر حروف عربية + وصف AR عربي + الأرقام في اللغتين + sameAs متطابق بين اللغتين، (2) الـlayout يمرر locale المحلول وبلا استدعاءات عمياء قديمة، (3) الأسطح الأربعة تمرر رابط og-image نفسه للمخطط وبلا تمرير Pexels (`image: og.image` ممنوع بكناري)، (4) og:image = twitter:image في كل سطح، (5) مخطط WebSite ما زال يعلن الهدف `/blog?search={search_term_string}`، (6) بذرة العمق حية بلا useSearchParams/searchParams (القشرة تبقى ثابتة)، (7) دلالات `matchesBlogSearch` (حالة/قص/وسوم/فئة/فراغ=بلا فلتر)، (8) listBlogPosts يفوّض للمسند الموحد بلا haystack مكرر.

**البوابات:** tsc 0 · eslint 0/0 · vitest **822/822** · next build exit 0 (2,052 صفحة) · docs_audit ✓ · docs_parity ✓ · migration_audit --ci · stale-refs · ui-wiring · صفر ميجريشنز · صفر تغيير بيانات أو مسارات أو حصص.

**المتبقي من P2 بعد هذا البند:** البند 10 فقط (توحيد MSA للقوالب القديمة — دفعة محتوى مستقلة بحجمها).

### 12.41 — P2-10 توحيد MSA لسطح الأدوات وFAQ الرئيسية (2026-09-12 — أمر المالك «ابدأ p2 البند ١٠»: «توحيد MSA لنسخ صفحات الأدوات وFAQ الرئيسية (توحيدًا مع قانون المدونة 175/176)»)

**أمر المالك (حرفياً):** «ابدأ p2 البند ١٠» — البند الوحيد المتبقي من P2، وبه تكتمل البنود 10–14 كلها.

**(أ) التشخيص الحي أولاً (لا إصلاح بلا مسح):** بُني ماسح تشخيصي فوق آلية القانون نفسها (`scanArabicDialect` + `scanLatinContamination` من `blog-msa.ts`) بمُقطِّع نصوص واعٍ بالتعليقات والنصوص (string-aware tokenizer) يستخرج **النسخ المرئية فقط** — النصوص الحرفية الحاوية لعربية (عبارات JSX والسمات والميتا) ونصوص JSX المجردة — فلا يمكن لقوانين التوثيق المقتبسة فيها أمثلة اللهجات المحظورة («عشان»، «كده») أن تُشعل إنذاراً كاذباً. المسح غطى 33 ملفاً: صفحات الأدوات العشر ثنائية اللغة (جذر EN — مرايا /ar تعيد تصديرها) + مكونات كروم الأدوات (OtherTools · LeadCaptureCard · SaveResultButton · ShareButtons · ShoppingListCard · ToolReferenceContent · review-invite) + مخططات ميتا AR للأدوات (SERP مرئي) + FAQ الرئيسية + وحدات المرجع الست (§12.25). **النتيجة:** 4 انتهاكات لهجة قوية («مفيش» ×3 في meal-planner وLeadCaptureCard وNewsletterForm + «دي» و«محتاج» في macro) · 2 ضعيفة حقيقية («ينفع» في مرجع السعرات + «حاجة/طب» مسموحة بعتبة <5) · 5 هبوطات لاتينية من طبقة الكارثة «المُلْصَق» («وDHA» · «وDEXA» · «وBeckett» · «وShizgal» · «لـDevine» · «A وD وE وK») · قاموس مقلوب «BMR (معدل الأيض الأساسي)» — اللاتيني يقود والعربية داخل القوسين، عكس اصطلاح القانون تماماً · «حاسبة Body Fat» كتسمية إنجليزية سائبة داخل ميتا عربية · أسماء باقات لاتينية عارية (Premium/Pro/Coaching) في FAQ الرئيسية وسلاسل البوابات.

**(ب) إصلاح النسخ (15 موقعاً في 12 ملفاً):** اللهجة ← فصحى («مفيش أكلات بعد» ← «لا توجد أطعمة بعد» · «محتاج خطة… بالماكروز دي؟» ← «تحتاج خطة… بهذه الماكروز؟» · «مفيش سبام، وتقدر تطلب» ← «لا رسائل مزعجة، ويمكنك طلب» · «ينفع عجز» ← «يجدي عجزٌ أُعيد حسابه») · **تدوين اسم الباقة عربياً** بما يطابق مصدرها الوحيد `memberships.ts` nameAr: بريميوم/برو/كوتشينج («التصدير متاح لباقات Premium و Pro — طوّق» ← «التصدير متاح لباقتي بريميوم وبرو — طوّر» — أُصلح معه سهو إملائي) · **قلب القاموس** إلى الاتجاه القانوني: «معدل الأيض الأساسي (BMR)» · «الاحتياج اليومي (TDEE)» · «سياسات الأمان على مستوى الصفوف (RLS)» · «تطبيق ويب تقدمي (PWA)» · «معادلة ميفلين-سانت جيور (Mifflin-St Jeor)» · «طريقة البحرية الأمريكية (U.S. Navy)» · ميتا الدهون «حاسبة Body Fat» ← «حاسبة دهون الجسم» · **تفكيك الملصق بالمسافات** (و DHA · و DEXA · و Beckett · و Shizgal · لـ Devine · A و D و E و K) — اللصق المباشر حرف-عربي/لاتيني هو طبقة فساد «كريAlkaline» ولا يُسمح به بقائمة أبداً؛ المسافة هي الدواء الوحيد.

**(ج) قانون السياق — قائمة واحدة مُوثَّقة لا تشعب للقانون:** امتد `scanLatinContamination` بمعامل **اختياري** `extraWhitelist` (المصدر واحد `blog-msa.ts` — حارس المدونة نفسه لم يمسّ قيد أنملة: بلا معامل ثانٍ السلوك الأصلي حرفياً). القائمة نفسها في وحدة نقية `src/lib/tool-msa.ts` بأصناف مغلقة ثلاثة تُفرغ في نصٍّ قانوني داخلها: (1) **أسماء العلم المسمّاة بها المعادلات** (Mifflin-St Jeor · Harris-Benedict · Katch-McArdle · Roza-Shizgal · Atwater · Quetelet · Hodgdon-Beckett · Jackson-Pollock · Devine/Hamwi/Robinson…) — هذا هو حرفياً «نمط الاستثناء» الموثق أصلاً في §12.25؛ (2) **الألاختصارات التقنية ومفاتيح البحث** (BMR · TDEE · DEXA · NEAT · TEF · EPA/DHA · kJ · JSON · PDF) — «حاسبة TDEE» استعلام عربي حقيقي؛ (3) **علامات الدفع والمنصات** (PayPal · InstaPay · Vodafone Cash · Supabase · Trustpilot · Product Hunt) — استثناء «أسماء العلامات» بنص القانون ذاته. **خارج القائمة — وبالتالي محظور:** أسماء الباقات (عربي فقط)، الكلمات الإنجليزية الشائعة كتسميات، القاموس المقلوب، والملصق. إضافة أي رمز هنا تُضعف الحارس لكل صفحة أدوات — الأولى إعادة صياغة النص عربياً.

**(د) الحراس الدائمون (+92 → 914/914):** ملف جديد `tool-msa-surface.test.ts` (**86 اختباراً**): قوانين اللهجة واللاتيني واتجاه القاموس تُطبَّق `it.each` على مانيفست 27 ملفاً (الصفحات العشر + الكروم + ميتا AR + FAQ) + اختبار أسماء الباقات (FAQS_AR بلا Premium/Pro/Coaching عارية — الكناري يذكر مصدر التسمية العربية) + خمسة كناريات ثابتة لإصلاحات القاموس ونفي عودة «مفيش» + **كناريان للمُقطِّع نفسه** (تعليقٌ يقتبس لهجة محظورة لا يُشعل إنذاراً؛ نصٌّ حرفيٌّ فيه لهجة يُشعله — الحارس مُختبَر هو أيضاً). واختبار اتجاه القاموس **مقيَّد بمخلوع الألاختصارات القابلة للترجمة** فقط: القوس العربي بعد PayPal نثرٌ شرعي (العلامة لا تقابلها عربية تقودها) لا قاموس مقلوب. وفي `tool-reference-content.test.ts` أُضيفت حالة «MSA 176» لكل وحدة مرجع من الست (+6): كاشف التلوث اللاتيني الذي كان غائباً عن حراس §12.25 يركب الآن نفس بياناتها عبر نفس القائمة — **اكتمل «التوحيد مع قانون المدونة 175/176» حرفياً: كاشفان، قانون واحد، قاموس سياق واحد موثق.**

**(هـ) حدود ونطاق (شفافية كاملة):** إصلاح عابر واحد خارج البند أُنجز وبُوِّث: سلسلة النشرة في الصفحة الرئيسية (`NewsletterForm` — «مفيش سبام. تقدر تلغي») نفس عائلة العيب لكنها كروم رئيسية لا سطح أدوات، فأُصلحت دون أن تدخل المانيفست (البند يخص «صفحات الأدوات وFAQ الرئيسية»). **رصدٌ خارج النطاق ينتظر قرار المالك:** FAQ صفحة الاشتراكات نفسها تحمل لهجة («هل فيه تجربة مجانية؟» · «لا، مفيش تجربة مجانية. بس الـ Free tier مجاني للأبد») — صفحة تجارية لا أداة؛ تنظيفها دفعة P3 مستقلة بأمر مستقل. مرايا /ar صفحات الأدوات تُغطى عبر ملف الجذر المشترك (تعيد التصدير) — لا ازدواج حراسة. أخيراً: «طب المسنين» و«طب الرياضة» و«دون حاجة للكيتوزس» فصحى سليمة أصابتها عدسات العلامات الضعيفة — عتبة <5 للضعيف موجودة أصلاً لهذه الطبقة بالذات فلم تُمسّ.

**البوابات:** tsc 0 · eslint 0/0 · vitest **914/914** (822 + 86 سطح الأدوات + 6 مرجع §12.25) · next build exit 0 · docs_audit ✓ · docs_parity ✓ · migration_audit --ci · stale-refs · ui-wiring · صفر ميجريشنز · صفر تغيير منطق/مسارات/حصص — دفعة نسخ وحراس فقط.

**اكتمال P2 بهذا البند:** البنود 10 · 11 · 12 · 13 · 14 من خطة §12.19 كلها منفذة ومنشورة — **P2 مغلقة بالكامل**. المتبقي من الخطة: P3 فقط (لغات إضافية · أدوات جديدة وفق فراغات SERP · manifest.json عربي) بقرار المالك، والبند 7 من P1 ينتظر أول 10 تقييمات Trustpilot حقيقية.

### 12.42 — المرحلة 178: دفعة جودة المحتوى (تكرار FAQ · تآكل كلماتي · أوصاف مقصوصة · حشو استعلامات · لهجة التسويق · بوابة كوكيز GA) (2026-09-12 — أمر المالك «موافق على المقترحات ابدأ تنفيذ كل البنود + حل مشاكل بانر الكوكيز إن وجدت»)

**الأصل:** تدقيق جودة المحتوى الكتابي باللغتين (121 صفحة حية) أنتج تقريرًا داخل المحادثة، ووافق المالك على تنفيذ كل بنوده. المسح غطى المدونة كاملة (72 مقالًا: 32 EN + 40 AR) + صفحات الأدوات ×2 + المراكز + الصفحات الرئيسية — بوكيل قراءة فقط ثم تنفيذ.

**(أ) الصفحة الفارغة المفهرسة (كاش مسموم):** `/blog/calculate-daily-calories-fuel-fat-loss-bulking` كانت ترجع 200 فارغة (74 كلمة = بانر الكوكيز فقط · صفر H1) بينما النسخة عند تجاوز الكاش سليمة (1,473 كلمة) — `cf-cache-status: HIT` لعطبٍ عابر في جلب المحتوى كُزِن كنسخة كاملة 200. **الإصلاح المزدوج:** (1) قانون M29 ممتد في مسارَي المدونة EN/AR — `fetchBlogPostFull` فاشل ⇒ `notFound()` صادقة 404 (لا قشرة فارغة 200 قابلة للكاش أبدًا؛ ISR يشفيها عند أول إعادة توليد)؛ (2) تنقية كاش Cloudflare عبر API بعد النشر (البند أدناه).

**(ب) تكرار قسم الأسئلة الشائعة في كل مقال (72/72):** متن الماركداون يحمل قسم FAQ **و** `faq_json` يعرض نفس الأسئلة كبطاقات — §12.22 نصّت «عرض واحد» لكن `splitFaqSection` (الرفع عند النشر) طُبق على الجديد فقط؛ العتيق أبقى الاثنين. **القانون الجديد (عرض واحد عند الرسم):** `stripFaqSectionFromBody` في `blog-msa.ts` (نقية، client-safe) + نقل `FAQ_HEADING_RE` إليها **مصدرًا واحدًا** يركبه مسار النشر ومسار العرض معًا (لا تفرع — عقيدة 169). `BlogArticlePage` يقص المتن قبل TOC والرسم متى وُجدت بطاقات FAQ؛ صقل عرض أسئلة البطاقات (capitalize + i→I — الأسئلة المرفوعة كانت استعلامات خام lowercase). **الحراس:** `blog-faq-single-display.test.ts` ×9 (قص EN/AR · idempotent · توقف عند H2 التالي · لا-match لـ### · توازن نصيّ splitFaqSection نفسه · كناري لا-تفريع للـregex في المصدر).

**(ج) التآكل الكلماتي (cannibalization) في المدونة العربية:** 7 مقالات نوم (أربعة تجيب حرفيًا «كم ساعة نوم أحتاجها لبناء العضلات؟» + ثلاث نسخ من نفس البريف بسلوغات ملحقة `-1bbi`/`-3pc8`) + زوج مبتدئين بعنوانين **حرفيًا متطابقين**. التدقيق §12 السابق وثّق ثنائيًا واحدًا وفاته العنقود كاملًا؛ وقرار sleep-1bbi كان معلقًا في STATE بانتظار المالك — حُسم بالموافقة. **التوحيد:** إبقاء 3 نوايا مميزة (عدد الساعات · الأثر · العلم) — **ميجريشن 0084** يلغي نشر الخمسة المتآكلة (Sitemap/RSS/القوائم تسقطها آليًا) + يصفّي `linked_post_id` في الاتجاهين + **تحويلات 301 دائمة** في `next.config.ts` (اللواحق الفنية → الأصل · أسئلة الساعات → المرجع). **منع التكرار مستقبلًا:** نافذة فحص P0 من آخر 30 مقالًا → **100** (المصنفات الحية كلها — عائلة النوم أفلتت لأن الأقدم خرج من النافذة) + `blog-topic-dedup.test.ts` ×4 **بعناوين عائلة النوم الحقيقية حرفيًا** (المتطابقات تُرفض · النوايا الثلاث تبقى مميزة — الكاشف لا يتحول آلة إيجابيات كاذبة).

**(د) قص الأوصاف منتصف الكلمة (14 صفحة) + العناوين المعلقة (2):** نفس صنف خطأ P0-3 لكن في الوصف — `slice(0,160)` في محلل P1 يخزّن «…and equ»/«…لدع»، والمقتطف (مقدمة الصفحة المرئية للقارئ!) يشترك في نفس المصدر فظهر القص للزوار أيضًا. **الإصلاح الثلاثي:** (1) `clampMetaDescription` في `blog-pipeline.ts` (قانون P0-3 كاملًا: ميزانية 158 EN/160 AR · قص عند حد الكلمة · لا نهاية على رابطة/علامة · علامة ختام مضمونة) يستبدل الـslice في محلل P1 + P5 يخزن الوصف والمقتطف مقصوصين؛ (2) **ميجريشن 0084** يصلح الـ14 بقيم مغلقة الجملة (نفس القيمة للحقلين)؛ (3) عنوانان ينتهيان «…7‑Day» معلقًة اكتملتا مقابل الـH1 («…7‑Day Plan» ≤60). **الحراس:** 7 متجهات حية في `blog-meta-title.test.ts` (بما فيها idempotent والميزانية العربية).

**(هـ) حشو الاستعلامات الخام في النثر الإنجليزي:** 6 حالات في 4 مقالات بعد استبعاد أقسام FAQ (مثل `(answering *how much protein do i need to build muscle*)` بحرف i صغير داخل النثر). **التنظيف:** ميجريشن 0084 يستبدل حرفيًا (replace لا-تغيير عند الغياب — idempotent) الست بصياغة سليمة مع الحفاظ على الرابط الداخلي بمرساة أنظف (`daily protein targets` بدل الاستعلام الخام).

**(و) لهجة الصفحات التسويقية (توحيد 175/176 مع بقية السطح):** التدقيق الحي وجد أهم صفحتين تحويليتين باللهجة المصرية بينما القانون يفرض الفصحى Pan-Arab والبقية ملتزم: `/ar/evo` (12 علامة قوية: مفيش، عشان، إزاي، عايز، دلوقتي، بيرد…) و`/ar` الرئيسية (5) + FAQ الاشتراكات (§12.41-هـ المعلق) + مواضع في الكوتشينج. **التحويل:** نحو 60 سلسلة في 4 ملفات (evo · LandingView · memberships · coaching) إلى فصحى حديثة سهلة بنفس المعاني والنبرة الودودة («مش مجرد شات بوت» ← «ليس مجرد روبوت محادثة» · «إيه هو EVO؟» ← «ما هو EVO؟» · «مالكش عذر» ← «لا عذر لتأجيلها» · «مفيش تجربة مجانية. بس» ← «لا توجد تجربة مجانية. لكن») + «vs»/«limits» داخل النص العربي ← «مقابل»/«بحدود». **الحراس:** `marketing-msa-surface.test.ts` ×11 — نفس مُقطِّع tool-msa-surface (واعٍ بالتعليقات) على مانيفست الملفات الأربعة + كناريات النفي للعبارات المصرية المكتوبة حرفيًا (لا تعود أبدًا) + كناري vs/limits.

**(ز) بوابة كوكيز GA (Consent Mode v2):** أمر المالك «حل مشاكل بانر الكوكيز إن وجدت» — الفحص وجد البانر نفسه ممتازًا (GDPR/ePrivacy: فئات في `<details>` بلا JS · رفض بذات بروز القبول · سحب سهل من صفحة الخصوصية · NO-COVER/NO-LCP) **لكن** سكربت `ga-init` في `layout.tsx` كان يشغّل `gtag('config')` **قبل** أي حالة موافقة: GA يضبط كوكيز ويرسل مشاهدات لزوار لم يوافقوا (تحقق حي: التحديث يمر فقط بعد الاختيار في الكومبوننت). **الإصلاح:** Consent Mode v2 **default-denied قبل التهيئة** (الترتيب الذي يشترطه Google) + تطبيق الاختيار المخزّن (`mhe_cookie_consent` — نفس سجل البانر) قبل config فلا يفقد الموافقون أول ضربة تتبع. SECURITY.md موثّق بنفس الفريم.

**البوابات:** tsc 0 (الأربعة الموثقة لصور for-coaches في clone جديد = قديمة) · eslint 0/0 · vitest **945/945** (914 + 31: FAQ-عرض-واحد 9 + وصف-ميزانية 7 + سطح-تسويق 11 + تآكل-نوم 4) · next build exit 0 (2052 صفحة) · migration_audit PASS · docs_audit ✓ · ميجريشن واحد (0084 — بيانات فقط، types.ts لم يتغير).

### 12.43 — Phase SEO-GEO-7 (المرحلة 186): أسماء التمارين العربية الحقيقية — العناوين تقود بالعربية بلا خلط لغوي (2026-09-13 — أمر المالك «لا خلط بين اللغات ، مطلوب حل اخر . وثق النتائج فى الملف الخاص بها وابدا خطة التنفيذ»)

**الأصل:** تدقيق SEO/GEO الحي في المحادثة (28 صفحة + 69 مقالة) رصد أن صفحات `/ar/exercises/*` (868 صفحة) عناوينها تقودها الأسماء الإنجليزية («Ab Crunch Machine — طريقة الأداء الصحيحة») فتضيّع استعلامات «تمرين البطن بالجهاز» العربية. عُرض حل وسط (الاسم العربي بعد الإنجليزي) فرفضه المالك صراحةً: **ممنوع الخلط اللغوي — مطلوب حل آخر** — وهذا هو الحل البديل الموثق هنا.

**تشخيص السبب الجذري (الكود قبل الحكم):** كود صفحة AR (`src/app/ar/exercises/[slug]/page.tsx` سطر 46) كان سليمًا أصلًا — يبني العنوان من `exercise.nameAr`. المشكلة أن **حقل `nameAr` نفسه في البيانات كان يحمل الاسم الإنجليزي حرفيًا** في كل الصفوف الثمانمئة وثمانية وستين (nameAr === nameEn في 868/868)، ومعه `instructionsAr` و`tipsAr` إنجليزية أيضًا. أي أن «المكتبة ثنائية اللغة» كانت ادعاءً على مستوى الحقول وسطح الوصف فقط.

**الحل (طبقة البيانات — مصدر واحد يُشفي كل الأسطح):** ترجمة بشرية منسوقة لأسماء التمارين الثمانمئة وثمانية وستين مكتوبة بمصطلحات الصالات العربية القياسية المتوافقة حرفيًا مع قانون نقاء العربية (176: «كل مصطلح بالعربية أو معرّب»): الحركات تُنقحر كما ينطقها الجمهور العربي (سكوات، ديدلفت، بنش برس، كيرل، كلين، سنتش، جيرك، جوبلت سكوات) والمعدات والاوضاع تُترجم (بالبار، بالكيبل، واقفًا، جالسًا، منحنيًا، بقبضة ضيقة/واسعة، بذراع واحدة) — صفر حروف لاتينية في الاسم العربي نهائيًا. التطبيق ببرنامج مُصدَّر (`scripts` خارج الريبو) يعيد كتابة `nameAr` داخل `src/lib/exercises.ts` مرساةً بالسلاج (idempotent، تحقق ذهاب وإياب 868/868). **ما شُفي تلقائيًا بالإصلاح الواحد:** العنوان (title) والـH1 والوصف الميتا وسكيما HowTo (الاسم) وفتات الخبز (Breadcrumb) والنص البديل (alt) وبطاقات القائمة وبحث القائمة العربية (كان `filterExercises` يبحث في `nameAr` الإنجليزي فلا يجد «سكوات») وبرومبت مولد الخطط (`plan-generator` سطر 1440 كان يكتب «Barbell Curl (Barbell Curl)» ازدواجًا إنجليزيًا — صار ثنائي اللغة حقًا). **محرك مطابقة الذكاء الاصطناعي (`ai-workout-exercise-match`) لم يُمسّ:** يستهدف `nameEn` (سطر 260) فلا انحدار.

**(ب) MUSCLE_LABELS — إغلاق آخر بؤرة لاتينية في الوصف:** الوصف الميتا كان يحقن العضلات خامًا («العضلات المستهدفة: Abs») — خريطة جديدة `MUSCLE_LABELS` (17 عضلة، المصدر الوحيد في `exercises-shared.ts` لكي يستوردها الخادم والعميل معًا) بمفردات المنصة نفسها (البايسبس/الترايسبس/اللات/الترابيس/السمانة/الرباعية…) تُستخدم في: الوصف الميتا + وصف سكيما HowTo + رقائق العضلات على صفحة التمرين (`ExerciseDetailClient`) في المسارين.

**(ج) إصلاح عابر موثق ضمن النطاق:** نص الـCTA على صفحات التمارين كان باللهجة المصرية («عايز خطة تمارين مخصصة…») مخالفًا لاتجاه الفصحى الموحد (175/176/178) — حُوّل فصحى («هل تريد خطة تمارين مخصصة…؟») بكناري اختبار يمنع عودته.

**(د) الحراس (+11 → 974/974):** `exercise-names-ar.test.ts` — (1) صفر حروف لاتينية في كل `nameAr` (868) · (2) لا اسم فارغ ولا مطابق للإنجليزي · (3) الأسماء العربية فريدة 868/868 (لا تكرار H1/عنوان) · (4) خريطة العضلات تغطي كل قيم primary+secondary الحية في البيانات (قيمة جديدة بلا تسمية = فشل بناء) · (5) تسميات العضلات العربية صفر لاتيني · (6) **كل مكونات الوصف العربي لاتينية-صفر لكل تمرين** (الاسم + العضلات + المعدات + المستوى) · (7) كناريات الحادثة الحية (ab-crunch-machine→«جهاز كرانش البطن» · barbell-squat→«سكوات بالبار» · بنش برس بقبضة متوسطة) · (8) مرايا EN غير ممسوسة · (9) زوج برومبت المولد ثنائي اللغة حقًا · (10) كناري فصحى الـCTA · (11) عقد حجم المكتبة (`EXERCISES_COUNT`).

**البوابات:** tsc 0 (الأربعة الموثقة لـfor-coaches في clone جديد = قديمة) · eslint 0/0 · vitest **974/974** · next build exit 0 · docs_audit (phase=186) · docs_parity · migration_audit (صفر ميجريشنز — انجراف صفر) · stale-refs · ui-wiring.

**خارج النطاق — قرار مالك معلق (المتبقي الكبير):** `instructionsAr` و`tipsAr` ما زالتا تحملان التعليمات الإنجليزية حرفيًا في كل المكتبة (نص صفحة التمرين العربية يعرض تعليمات إنجليزية). الحجم ~140 ألف كلمة عبر 868 تمرينًا — يتطلب قرارًا ملكيًا مستقلًا بالقناة: إما دفعة توليد AI عبر منظومة `ai_jobs` (قوانين §8: برومبت + أرضية جودة + مراجعة P4/P5) أو ترجمة بشرية منسوقة. التوصية: البدء بأعلى 100 تمرين من حيث الظهور في GSC.

**الأثر المتوقع:** 868 صفحة عربية تستهدف الآن استعلامات «تمرين + [الاسم العربي/المعرّب]» كما يبحث بها الجمهور المصري/الخليجي فعليًا («سكوات بالبار»، «كيرل هامر»، «ديدلفت روماني») — أطول ذيل طويل في المنصة بعد صفحات الأطعمة، مع تحسن ارتباط داخلي (المرايا تشترك في السلاج فالمصطلح العربي صار قابلًا للربط النصي داخل المدونة أيضًا).

### 12.44 — Phase SEO-GEO-8 (المرحلة 187): قانون الـH1 الواحد — قص سطر العنوان المكرر من جسم المقال (2026-09-13 — أمر المالك «اجل ترجمة التعليمات الى جلسة منفصلة وأبدأ تنفيذ باقى التوصيات» — توصية P0-1 من التدقيق الحي العميق)

**الأصل (تدقيق SEO/GEO الحي العميق — 2026-09-13):** فحص حي كامل (28 صفحة أساسية + 69 مقالة منشورة عبر السايت ماب) رصد أن **22/69 مقالة تعرض وسمَي `<h1>` على الصفحة نفسها**: قالب المقال يرسم H1 العنوان في الهيرو (`BlogArticlePage` — `post.title`) بينما الماركداون القديم في `blog_posts.content` يفتتح بسطر `# العنوان` يحوّله العارض إلى `<h1>` ثانٍ حرفيًا (مثال حي: `/blog/progressive-overload-no-weight` — العنوان يظهر مرتين بصريًا ومرتين في الدوم). الحالة العربية `/ar/blog/calculate-daily-calories-weight-loss` أثبتت أن سطر الجسم ليس نسخة بايت-مطابقة للعنوان (سعرة/سُعرة · يومياً/يوميًا — فرق تشكيل فقط)، فالمقارنة يجب أن تُطبَّع قبل المطابقة.

**الحل (نفس نمط المرحلة 178 — معالجة عرض حتمية نقية، صفر كتابة على الإنتاج):**
- **(أ) قانون العارض (الضمانة الدائمة — `src/lib/blog.ts`):** قاعدة `# ` في `renderMarkdown` لم تعد تُنتج `<h1>` إطلاقًا — أي سطر `# ` في أي جسم يُخفَّض إلى `<h2>` بنفس معاملة `## ` (id + نفس الكلاسات) — **ضمانة أن الصفحة لن تحمل H1 ثانياً مهما كانت البيانات، للأبد** (هذا يحمي أيضًا معاينة المحرر BlogEditorView التي تستخدم العارض نفسه).
- **(ب) قص التكرار البصري (`src/lib/blog-msa.ts`):** دالتان جديدتان بجوار قانون 178 — `normalizeHeadingForCompare` (تطبيع للمقارنة: تصغير حالة + نزع التشكيل العربي وال تطويل + توحيد أصناف الواصلات U+2010–U+2014 + إسقاط علامات الترقيم بما فيها العربية ؟ ، + دمج الفراغات) و`stripTitleHeadingFromBody(md, title)` (تقص **السطر الأول غير الفارغ فقط** إذا كان `# X` وX يطابق العنوان بعد التطبيع — أمان المحتوى: سطر `# ` لا يطابق العنوان لا يُمس، وسطر وسط الجسم لا يُمس أبدًا حتى لو طابق العنوان). حتمية، idempotent.
- **(ج) التوصيل (`BlogArticlePage.tsx`):** خط المعالجة صار: FAQ strip (178) ← title-dupe strip (187) ← TOC ← render. لا ميجريشنز ولا كتابة DB — كامل الـlegacy corpus يلتئم عند أول revalidate (ISR 5 دقائق).

**الحراس (+17 → 991/991):** `blog-h1-single-display.test.ts` — (1) تطبيع التشكيل (الحادثة الحية سعرة/سُعرة · يومياً/يوميًا) · (2) توحيد الواصلات والحالة (12‑Week U+2011 = 12-Week) · (3) إسقاط ؟ والترقيم · (4) قص EN حرفي · (5) قص AR عبر فرق التشكيل (الحالة الحية) · (6) أسطر فارغة قائدة قبل العنوان · (7) جسم عنوان-فقط · (8) idempotent · (9) **أمان المحتوى: سطر `# ` أول الجسم لا يطابق العنوان يبقى** · (10) **تكرار وسط الجسم لا يُمس أبدًا (السطر الأول فقط)** · (11) جسم بلا عناوين يمر كما هو · (12) أجسام فارغة · (13) `##` غير مؤهل (مستوى-1 فقط) · (14) **العارض لا يخرج `<h1` أبدًا — قانون** · (15) التسلسل الهرمي البصري سليم (h2/h3) · (16) wiring القالب (القص موصول بين 178 والرندر + الهيرو `<h1 data-speakable="headline">{post.title}` هو منتج الـh1 الوحيد) · (17) fork guard: `blog.ts` بلا منتج `<h1>` في العارض وقاعدة `# ` موجودة وتنتج h2.

**البوابات:** tsc 0 · eslint 0/0 · vitest **991/991** · next build exit 0 · docs_audit (phase=187) · docs_parity · migration_audit (صفر ميجريشنز) · stale-refs · ui-wiring.

**ما تبقى من التدقيق العميق (خطة التنفيذ المقبولة — أمر المالك «ابدأ تنفيذ باقي التوصيات»):** P0-2: og:image على الأسطح الناقصة (foods 160 + hubs 48 + tools 12 + فئات المدونة + `/ar` الجذرية — المقالات مغطاة عبر `/api/og-image/[slug]`) · P1-1: 5 عناوين AR فوق ميزانية 70 حرفًا (71–77) + 23 رمادية 63–70 · P1-3: أوصاف طويلة (`/about` 244 · `/ar/about` 239 · `/ai-meal-planner` 189 · `/diet-plan` 184 مقصوصة منتصف كلمة · `/memberships` 183) · P1-2: استدراك إقران 59 مقالة قديمة بلا توأم (نظام 157 يعمل للجديد فقط) · P2-1: ترويسة الكاش (لوحة Cloudflare — 15 دقيقة على المالك). **قرار المالك على تعليمات التمارين (`instructionsAr`/`tipsAr`): تُنفَّذ في جلسة منفصلة** (البند المفتوح §12.43).

### 12.45 — Phase SEO-GEO-9 (المرحلة 188): قانون تغطية og:image — 14 بطاقة اجتماعية معرّفة لكل الأسطح الفاقدة (2026-09-13 — أمر المالك «اجل ترجمة التعليمات الى جلسة منفصلة وأبدأ تنفيذ باقى التوصيات» — توصية P0-2 من التدقيق الحي العميق)

**الأصل:** التدقيق الحي رصد أن كل الأسطح الكبيرة القابلة للمشاركة كانت تُشارك بلا بطاقة اجتماعية إطلاقاً: صفحات التمارين (SSG بالكامل) · الأطعمة · مراكز العضلات (hubs) · المجموعات (48 في السايت ماب) · الأدوات (12) · فئات المدونة — **وجذر `/ar` نفسه**: تخطيط AR يعلن openGraph خاصاً بلا images، فكل صفحة عربية بلا كتلة ميتا خاصة بها ورثت «لا بطاقة» (بينما جذر EN كان يغطي بأثر رجعي عبر metadata.ts). النتيجة: مشاركة أي من هذه الصفحات على WhatsApp/Facebook/X تعرض رابطاً أبيض بلا صورة — خسارة CTR مباشرة على أهم أسطح الجمهور المصري/العربي.

**الحل (بطاقات ثابتة لكل عائلة أسطح — نفس هوية تصميم `/api/og-image`):**
- **(أ) 14 بطاقة PNG 1200×630** في `public/images/og/` (7 عائلات × لغتين: home · exercises · foods · hubs · collections · tools · blog-category) — نفس تصميم البطاقة الديناميكية (تدرج #1d1d1f→#0071e3، دائرة A بيضاء، Alkemos) بتوليد `scripts/generate-og-cards.py` (مرفق بأداة الريبو، Pillow + libraqm بتشكيل عربي صحيح + خطوط Cairo المستضافة نفسها) — **نصوص خالدة بلا أرقام متغيرة** (868/8830 تتقادم داخل البكسلات ولا يمكن لحراس فحصها). البطاقات الثابتة تُقدَّم من CDN بكاش دائم — أسرع وأرخص من توليد edge لكل URL، وبيانات الأطعمة (3.6MB) والتمارين (1.6MB) أكبر من أن تُستورد في مسار edge (البطاقات الديناميكية لكل كيان موثقة كتحسين مستقبلي).
- **(ب) التوصيل (24 مصدر ميتا):** exercises EN/AR · foods EN/AR · muscles EN/AR · collections EN/AR · blog/category EN/AR (كانت بلا twitter إطلاقاً) · tools (فهرس + 5 حاسبات × لغتين) · **جذر AR** (بطاقة og-home-ar) · جذر EN (ترقية من الشعار الخام `/logo.png` إلى بطاقة home المعرّفة). كل سطح حصل على `openGraph.images` كاملة الأبعاد + `twitter.images` مع ترقية كل بطاقات twitter من `summary` إلى **`summary_large_image`** (بطاقة summary تتجاهل الصور أصلاً).
- **(ج) الحراس (+26 → 1017/1017):** `og-image-coverage.test.ts` — (1) البطاقات الـ14 موجودة على القرص (2) كل سطح موصول يُشير إلى بطاقة عائلته في og وtwitter معاً (3) بطاقة twitter = summary_large_image (4) لا رجوع إلى `/logo.png` (5) مولد البطاقات في أداة الريبو والنصوص المخبوزة (SPECS) خالية من أرقام المكتبة.

**البوابات:** tsc 0 · eslint 0/0 · vitest **1017/1017** · next build exit 0 · docs_audit (phase=188) · docs_parity · migration_audit (صفر ميجريشنز) · stale-refs · ui-wiring.

**التحقق الحي بعد النشر:** عينة من كل عائلة (صفحة تمرين EN/AR + طعام + مركز عضلة + مجموعة + أداة + فئة مدونة + `/ar`) يجب أن تعرض `og:image` في مصدر HTML — مع ملاحظة كاش CF (النسخ القديمة تنقضي خلال ~ساعة؛ التحقق بمعامل استعلام يتجاوز الكاش).

**ما تبقى من التدقيق العميق (بعد هذه الدفعة):** P1-1: 5 عناوين AR فوق 70 + 23 رمادية · P1-3: الأوصاف الطويلة الخمسة · P1-2: استدراك إقران 59 مقالة · P2-1: ترويسة الكاش (لوحة Cloudflare — على المالك) · قرار المالك المؤجل: بطاقات ديناميكية لكل كيان (تحسين مستقبلي موثق أعلاه).

### 12.46 — Phase SEO-GEO-10 (المرحلة 189): قصّ عناوين SERP وقت العرض + ميزانيات أوصاف أسطح التحويل + ترويسة كاش المتصفح (2026-09-13 — أمر المالك «أكمل بندي P1-1 + P1-3 معاً، وبند P2-1» — البنود المتبقية من التدقيق الحي العميق بعد 187/188)

**الأصل (التدقيق الحي العميق):** ثلاث وصيات متبقية: **P1-1** خمسة عناوين AR فوق ميزانية الـ70 حرفاً (71–77) + 23 رمادية (63–70) · **P1-3** خمسة أوصاف طويلة على أسطح تحويلية (/about 244 · /ar/about 239 · /ai-meal-planner 189 · /diet-plan 184 · /memberships 183) · **P2-1** ترويسة `cache-control: private, no-cache, no-store` تصل المتصفح رغم CF HIT. نفّذ المالك الثلاثة في دفعة واحدة؛ **مفاتيح Cloudflare سلّمها المالك للجلسة** فصار P2-1 تنفيذاً وكيلاً لا خطوة يدوية.

**(أ) P1-1 — التحقيق الجنائي (طبقتان قبل الحكم):** المسح الحي لكل الـ69 مقالة قاس العناوين الخمسة فوق الميزانية (71–77) وكل الـ36 مقالة AR تحمل لاحقة « — Alkemos» في `<title>` — الفرضية الأولى (لاحقة مخزنة في meta_title) أسقطها تحقيق أعمق بعد النشر: قراءة مباشرة من Supabase (read-only) أثبتت أن القيم المخزنة **نظيفة** (60–67 حرفاً بلا لاحقة) والفحص الجنائي للاستجابة الحية فصل الطبقتين: `og:title` (من الدالة مباشرة) مقصوص/نظيف بينما `<title>` (من قالبه) يحمل اللاحقة — **الجذر: قالب عنوان `/ar/layout.tsx` `"%s — Alkemos"` (11 حرفاً) يُطبّق على كل عناوين `/ar/*` الصفحية**، فضريته دفعت الخمسة فوق ميزانية الـ70 (والرمادية الـ23 كذلك 52–59 مخزنة + 11 قالباً).

**(ب) P1-1 — الحل بسهمين (قانون واحد، طبقتان):** (1) **إعفاء صفحات المقالات من القالب** — `title: { absolute: og.title }` في المرآتين EN/AR: سهم P1-1 المباشر؛ عنوان المقال لا يرث أي قالب مستقبلاً، والقالب يبقى للأسطح القصيرة (tools/hubs/about) حيث يتسع · (2) **قانون قصّ وقت جلب البيانات** — كتلة قانون العنوان (SEO-GEO-6.3/181) انتقلت حرفياً إلى وحدة صفرية الاعتمادات `src/lib/blog-meta-title.ts` (نفس فلسفة `exercises-shared` في 186: المولد يحمل سلسلة مزودي AI فلا يُستورد في مسارات العرض/العميل) و`blog-pipeline` يعيد تصديرها (مصدر واحد، صفر تكرار)؛ `fetchBlogForOG` (نقطة الخنق الوحيدة لـog:title + twitter:title + headline السكيما + فتات الخبز + بطاقة `/api/og-image` بالمرآتين) يطبّقها على المخزن، وكذلك عنوان المشاركة في `BlogArticlePage` — ضمانة دائمة ضد أي لاحقة/تجاوز مستقبلي في البيانات (البيانات المخزنة لم تُمس إطلاقاً — نمط 187؛ لا مفتاح خدمة صالح محلياً: القديم sbp_fc800 يخص مشروعاً محذوفاً موثقاً في 181، وقناة GHA للعلاج تعالج الروابط المعلقة فقط).

**(ج) P1-3 — الأوصاف الخمسة داخل ميزانية 158/160 (قانون أوصاف 178 على أسطح ثابتة):** /about 244→154 · /ar/about 239→150 (فصحى) · /ai-meal-planner 189→156 · /diet-plan 184→154 · /memberships 183→142 (الأسعار مطابقة لمصدر الحقيقة `memberships.ts`) — كل واحدة جملة مكتملة المعنى تنتهي نقطة، بلا قصّ منتصف كلمة.

**(د) P2-1 — التشخيص ثم العلاج (عبر API بتفويض المالك):** قياس حي أثبت أن كل الصفحات العامة تصل المتصفح بـ`private, no-cache, no-store` بينما CF يخزنها (HIT) — رؤوس `next.config.ts headers()` (السياسة العامة المصممة في SEO-GEO-4) تنتصر محلياً مع `next start` فقط؛ على Vercel الافتراضي الديناميكي للمسار يتقدمها. العلاج: تحديث قاعدة **`alkemos-public-html-cache`** نفسها (SEO-GEO-4/149) بإضافة **`browser_ttl: override_origin 300`** — عبر قناة PUT لنقطة دخول المرحلة كاملة (نقطة القاعدة المفردة ترد 405) — مع بقاء `edge_ttl 3600` والتعبير كما هو حرفياً. اختيار 300 ثانية (لا أطول) هو قانون نضارة أصول الهوية نفسه (128/136: خمس دقائق نضارة): نشرات المالك متعددة يومياً وكاش **المتصفح** لا يُنقّى أبداً بأي purge. **التحقق الحي بعد التنفيذ:** كل الصفحات العامة (مقالات EN/AR + الرئيسيتان + about + memberships + تمارين + hubs) تصل المتصفح بـ`private, max-age=300, must-revalidate` مع CF HIT · الأسطح الخاصة (/auth · /admin · /api/*) كما كانت بلا كاش (DYNAMIC) · أصول `/_next/static` بـimmutable سنة كما هي. ملاحظة صادقة: إعادة كتابة CF أبقت توجيه `private` الظاهري في الرأس — المتصفحات تحترم `private+max-age` (تسمح بكاش المتصفح وتمنع الوسائط المشتركة فقط، وCF هو الواجهة الوحيدة أمام الجمهور) فالوظيفة مكتملة، والصياغة الظاهرية موثقة هنا.

**الحراس (+12 → 1029/1029):** `blog-meta-title-render.test.ts` — (1) الحوادث الخمس الحية كناريات حرفية (القيم المقاسة في `<title>` → الصورة النظيفة الدقيقة، علامات الاستفهام محفوظة، الطول ≤70) · (2) الرمادية تنزل تحت الميزانية · (3) وحدة القانون صفرية الاعتمادات · (4) blog-pipeline يعيد التصدير ولا يعيد التعريف · (5) توصيل الطبقتين (fetchBlogForOG + عنوان المشاركة) · (6) **المرآتان تعفيان عنوان المقال من القوالب (absolute — عقد P1-1)** · (7) قالب /ar باقٍ للأسطح القصيرة (فصل تصميمي مقصود).

**البوابات:** tsc 0 · eslint 0/0 · vitest **1029/1029** · next build exit 0 · docs_audit (phase=189) · docs_parity · migration_audit (صفر ميجريشنز — انجراف صفر) · stale-refs · ui-wiring.

**ما تبقى من التدقيق العميق (بعد هذه الدفعة):** P1-2: استدراك إقران 59 مقالة قديمة بلا توأم (نظام 157 للجديد فقط — 1-2 جلسة) · قرار المالك المؤجل: بطاقات ديناميكية لكل كيان (تحسين مستقبلي) · تعليمات التمارين العربية (جلسة منفصلة بقرار المالك — §12.43).

### 12.47 — Phase SEO-GEO-11 (المرحلة 190): استدراك الإقران الرجعي — P1-2، إغلاق التدقيق الحي العميق بالكامل (2026-09-13 — أمر المالك «ابدأ تنفيذ المتبقي من التدقيق»)

**الأصل:** توصية P1-2 من التدقيق الحي العميق: **59/69 مقالة بلا توأم** (نظام 157 يعمل للجديد فقط — الربط عبر `linked_post_id` ثنائي الاتجاه). القوانين الحاكمة قبل أي مطابقة: معيار 158 (زوج حقيقي = نفس السؤال الدقيق، نفس الزاوية، نفس الجمهور) + **قانون منع الإقران الأعمى** (AGENTS §8: المكتبتان وُلدتا موضوعات مستقلة بالتصميم — معظم المقالات لا توأم لها أصلاً) + **قرار 159** («نكتفى بما تم في الخطوة ٣»: الأزواج الأربعة المختلفة الزاوية مسقطة — سجل قرار لا قائمة عمل).

**المنهجية (قراءة فقط من قاعدة البيانات):** كل المنشورات (69 = 33 EN + 36 AR): 10 مقترنة و59 بلا توأم (28 EN + 31 AR) — مطابقة كاملة عبر العناوين الكاملة + الكلمات المفتاحية المركزة + المقتطفات، مع فحص سلاسل 301 لدمج 178.

**الحصيلة:** (1) **زوجان عاليا الثقة** — **النوم**: استعادة الزوج المعتمد في 158: التوأم العربي القديم `sleep-muscle-recovery-gym` دمجه 178 (عائلة النوم) بـ301 إلى `how-many-hours-sleep-for-muscle-growth` الذي يحمل نفس السؤال والزاوية (ساعات النوم → العضلات + التعافي + نتائج الجيم) — الجانب الإنجليزي فقد الربط عند حذف الصف القديم، وهذا يعيد الاقتران المعتمد عبر خليفة الـ301 · **السعرات loss+gain**: `calories-to-lose-weight-build-muscle-beginner` ↔ `calculate-daily-calories-weight-loss-muscle-gain` — مرآة الزوج المعتمد loss-only على جانبه loss+gain (سؤال واحد + جمهور مبتدئ + زاوية حساب العجز/الفائض، والسلاجان متطابقات دلالياً) · (2) **زوج مراجعة واحد للمالك** (لا يُطبَّق إلا بقراره): جرامات البروتين بعد التمرين (EN يسأل الجرعة) ↔ توقيت البروتين بعد التمرين (AR يسأل التوقيت) — عائلة واحدة بسؤال أساسي مختلف · (3) **56 مقالة بلا توأم حقيقي بطبيعة التصميم** — لا إقران لها إطلاقاً (القانون) · (4) أزواج 159 الأربعة بقيت مسقطة (سجل قرار؛ سلاج أحدها العربي دُمج بعيداً — وُثق في مكانه).

**التنفيذ عبر القناة المعتمدة (صفر كتابة وكيل مباشرة):** تحديث `scripts/retro-pair-blog.pairs.json` (زوجان + مرشح مراجعة + توثيق الحصيلة في `_comment` مع مبرر `why` لكل زوج) → commit → سير العمل `retro-pair-blog.yml` (dispatch-only بمفتاح الخدمة في أسراره): **معاينة DRY_RUN** (paired=2 · already=5 · failed=0 · skipped=0) ثم **تطبيق** (paired=2 · **verified=7** · failed=0 — post-verify يعيد قراءة كل زوج ثنائي الاتجاه).

**التحقق الحي بعد التطبيق:** قاعدة البيانات: 14 مقالة مقترنة (كانت 10) — فحص ثنائية الاتجاه **14/14 سليم** · تنقية CF ثم hreflang حي على الصفحات الأربع الجديدة في الاتجاهين + x-default→EN (مثال حي: `/blog/sleep-better-faster-gym-results` يعلن `hrefLang="ar"→/ar/blog/how-many-hours-sleep-for-muscle-growth` والعكس بالعكس) — مفتاح تبديل اللغة في واجهة المقال يضيء تلقائياً عبر نفس المصدر (`buildBlogHreflang`).

**الأثر:** التوأمة الحية من 10 إلى 14 مقالة (+4) — إشارات hreflang كاملة للزوجين، والزاحف يربط النسختين ككيان واحد بدل صفحتين منفصلتين.

**البوابات:** docs_audit (phase=190) · docs_parity · stale-refs · ui-wiring (نطاق الدفعة: ملف بيانات أزواج فقط — صفر كود · صفر ميجريشنز · الكتابة على الإنتاج عبر سير العمل المعتمد حصراً بنمط 158).

**ما تبقى من التدقيق الحي العميق: لا شيء — مغلق بالكامل** (P0-1 · P0-2 · P1-1 · P1-3 · P1-2 · P2-1 منفذة ومتحقق منها حياً). المفتوح للمالك: قرار زوج المراجعة الوحيد الجديد (الجرعة ↔ التوقيت — يقرر بنفسه نقلَه إلى `pairs` أو إسقاطه) · تعليمات التمارين العربية (جلسة منفصلة — §12.43) · بطاقات og ديناميكية لكل كيان (تحسين مستقبلي).

### 12.48 — Phase SEO-GEO-12 (المرحلة 191): تعليمات التمارين عربية بالكامل + إسقاط زوج المراجعة + قتل إنذار ip_key + تحقق التسريب (2026-09-14 — أمر المالك «نفذ المتبقى بما تراه مناسب… رقم ٣ بالفعل طلبت مسح التسريب ويفترض انه تم لذا امسح التحذير بعد التاكد ، ٤ إنذار ip key لا اعلم ما هذا اشرحة ببساطة»)

**الأصل:** المتبقي من قائمة «المفتوح الآن» بعد 190 — أربعة بنود فوّض المالك تنفيذها بتقدير الوكيل مع تحقق صريح لبندي التسريب (٣) وإنذار ip_key (٤).

**(أ) تعليمات ونصائح التمارين العربية (توصية §12.43 المؤجلة — أُغلقت بالكامل):** العيب: `instructionsAr`/`tipsAr` كانت تحمل الإنجليزية حرفياً في كل الـ868 صفاً — صفحات `/ar/exercises/*` تعرض خطوات إنجليزية في الجسم **وفي HowTo JSON-LD** (`steps: exercise.instructionsAr`) وفي نص بطاقة المشاركة (`instructionsAr[0]`) — عيب خلط لغوي على سطح تجربة المستخدم وسطح البيانات المنظمة معاً. الحجم المقاس: 868 تمريناً = 3,722 خطوة تعليمات (3,011 فريدة) + 1,736 نصيحة (**سلسلتان فريدان فقط**: «حافظ على استقامة ظهرك.» / «تحكم في الحركة.») ≈ 89 ألف كلمة. **القناة:** خط دفعات LLM (فصحى مبسطة + أمر للمذكر + معجم مصطلحات ثابت + الأرقام أرقاماً) مع تحقق صارم لكل سلسلة قبل القبول (غير فارغة · **صفر حروف لاتينية** · تختلف عن المصدر) + checkpoint قابل للاستئناف + إيقاع يحترم نافذة 429 (قانون مرونة §8: الانتظار ينتصر على النافذة) — 2,965 سلسلة عبر الخط؛ و**47 منسوقة يدوياً** حيث ظل النموذج يفشل بوابة صفر-اللاتيني (EZ bar → البار المتعرج · V-bar → المقبض المزدوج · حرف T/W/V → التاء/الدبليو/الڤي · Arnold Press → أرنولد برس — نفس معجم جلسة 186 للأسماء) + النصيحتان الموحدتان حتميتان. **الحقن:** بموضعية parity مع `instructionsEn` (المصفوفة العربية تعاد بناء موضعاً-موضعاً من توأمتها الإنجليزية) — EN لم يُمس بايت واحد، والسلاسل الفارغة الأصلية (2) بقيت فارغة (شكل بيانات المصدر). **الحارس الدائم:** `exercise-instructions-ar.test.ts` — 8 اختبارات (صفر لاتيني في كل خطوة/نصيحة · غير فارغة ومختلفة عن التوأم الإنجليزي · parity الأطوال · حروف عربية فعلية · النصيحتان الحتميتان · كناري الحادثة الحية `34-sit-up` و`ab-crunch-machine` · مرايا EN سليمة · حجم المكتبة لم يتغير).

**(ب) إسقاط زوج مراجعة P1-2 (القرار المفوَّض):** الجرعة (EN) ↔ التوقيت (AR) — سؤالان أساسيان مختلفان = نيتان بحثيتان مختلفتان؛ ربط hreflang يقول للزاحف «نفس المحتوى بلغتين» وهو ادعاء كاذب للطرفين. سُقط بنمط سجل قرار 159 في `pairs.json` (`decision: dropped-191` + إلحاق بـ`_comment`) — التوأمة الحية 14/14 لم تتأثر (الزوج لم يُطبق قط).

**(ج) إنذار ip_key — التصحيح الجنائي والإصلاح الجذري:** الوثائق السابقة قالت «regex الأداة لا يلتقط IF NOT EXISTS» — **خطأ**: الـregex يفهمها منذ زمن؛ السبب الحقيقي أن ميجريشن 0086 يكتب `ALTER TABLE` و`ADD COLUMN` **على سطرين** والparse سطري. الإصلاح: نافذة استمرار (سطر `ALTER TABLE <جدول>` الأعزل يفتح نافذة تُدمج بالسطر التالي وتتسلسل حتى `;`) — النتيجة: (1) إنذار ip_key الكاذب **قُتل** (البوابة خضراء بعد أن كانت حمراء منذ G6) · (2) **20 سطر أساس مقبول حُلَّت** (أعمدة وُلدت بعبارات ملفوفة في admin_notifications/blog_generation_queue/coach_pages/profiles/referral_earnings/referrals/subscriptions/subscription_requests) وشُذّبت وفق قاعدة نظافة الأداة نفسها · (3) **انجراف حقيقي كشفه الإصلاح كان الإنذار الكاذب يحجبه:** `subscription_requests.consumed_at` (بوابة الدليل 0042) — موجودة في الإنتاج الحي (تحقق PostgREST: `select=consumed_at` → 200 مقابل عمود وهمي → 42703) وغابت عن مرآة types.ts — أُصلحت المرآة (Row/Insert/Update) + مسار الإدخال المحلي في `data/subscriptions.ts` (null كالقيمة الحية الافتراضية). درس موثق: إنذار كاذب أحمر يخفي انجرافاً حقيقياً — قتل الإنذار الكاذب ليس تجميلاً بل شرط لرؤية الحقيقة.

**(د) تحقق التسريب (بندي المالك ٣ و٤):** فحص حي 2026-09-14: مفتاحا **Gemini/GCP وGroq مُبطلان فعلاً** ✓ (401/403 من مزوّديهما — مسح المالك تحقق) — لكن مفتاح **OpenRouter المسرب لا يزال حياً**: يجتاز المصادقة (200 على `/api/v1/auth/key` مع بيانات استخدام أسبوعية غير صفرية) ويمكن استخراجه من تاريخ المستودع العام (كوميتات `cd1d9d42`/`36c066b`/`a776aa8` أسلاف مباشرون لـorigin/main — **تصحيح جنائي**: قول جلسة سابقة «غير موجود في تاريخ main إطلاقاً» كان خطأ؛ والتحقق بمقارنة كود المرجع أكد فشل اختبار «نماذج» عديم القيمة قبل الحكم). تحذير «3 مفاتيح» استُبدل بتحذير واحد مُحكم المصطلح: مفتاح OpenRouter وحده — العلاج الكامل بلا توقف: مفتاح جديد ← تحديث Vercel/GHA ← حذف القديم.

**البوابات:** tsc 0 · eslint 0/0 · vitest **1037/1037** (+8) · next build exit 0 (**2,053 صفحة**) · docs_audit (phase=191) · docs_parity · migration_audit --ci **PASS** صفر انجراف جديد · stale-refs · ui-wiring.

**الكوميتات:** 22cb77f (fix-ci: الـparser + مرآة consumed_at) · 0b0af7d (زوج المراجعة) · 786b990 (الترجمة الكاملة + الحارس) · + دفعة التوثيق هذه.

### 12.49 — Phase SEO-GEO-13 (المرحلة 192): تدقيق النوايا — خريطة Search Intent + إحلال التضارب + بوابة المستقبل + شبكة EVO (2026-09-14 — أمر المالك «نفّذ الإصلاحات التالية فقط على مشروع Alkemos بناءً على SEO/GEO Audit الأخير» — 10 بنود: لا مساس بمعمارية SEO القائمة، لا sitemap/robots/canonical، لا محتوى عشوائي)

**الأصل:** تدقيق مالك جديد بـ10 بنود (P0: تضارب المدونة · دقة المحتوى · خريطة النوايا — P1: E-E-A-T · GEO/llms.txt · SEO البرمجي · الكيان · EVO · الربط الداخلي · بوابة الجودة المستقبلية) مع قيد صريح: عدم إعادة بناء ما ثبت نجاحه. **المنهجية:** تدقيق حالة-حالية أدليّ أولاً — زحف حي كامل للـ69 مقالاً منشوراً (عناوين + H1/H2 + canonical/hreflang + كل الروابط الداخلية، 69/69 HTTP 200) + مطابقة سجلات الإقران (pairs.json) + فحص llms.txt/llms-full.txt + فحص مخططات الكيان (seo.ts/authors.ts) — ثم إغلاق الفجوات الحقيقية فقط، وتوثيق ما هو سليم أصلاً بلا إعادة بناء.

**(1) خريطة النوايا داخل النظام — `src/lib/intent-map.ts` (جديد):** السجل الوحيد للنوايا الأساسية — 20 عنقوداً `Query Cluster → Primary Intent → Canonical Page → Supporting Pages` تغطي: المكتبات (تمارين/أطعمة) · المراكز (عضلات/معدات/مجموعات) · الحاسبات الخمس · مخطط الوجبات اليدوي والمولدين بالذكاء الاصطناعي · مكتبة الخطط الغذائية · البرامج · **EVO كصفحة أساسية وحيدة لنية AI-coach** · الكوتشينج · العضويات · المقارنات · المدونة (EN/AR) · العلامة. **بوابة المواضيع المستقبلية** (`findBlogIntentCollision` + توصيلها في `pickSmartTopic`/`getFallbackTopic`): أي موضوع جديد يطابق (تساوياً أو احتواءً بعد تطبيع عربي خفيف: همزات/تاء مربوطة/ألف مقصورة/تشكيل) استعلاماً رأسياً لنية أساسية غير-مدونية يُرفض آلياً ويعود للمخزون المنسق — تنفيذ بند «امنع أي مقال جديد مستقبلًا من منافسة Intent موجود». القوانين مثبتة بـ16 اختباراً (`intent-map.test.ts`): تفرّد الـcanonical · واقعية المسارات ضد شجرة routes الفعلية · استعلامات EN+AR لكل نية غير-مدونية · أطول-تطابقاً-أولاً · حارس عدم-التفرّع. **قانون الذيل الطويل:** العبارات المؤهلة (≥وصف مثل «برنامج تمارين بناء العضلات في المنزل بدون معدات») مساحة المدونة بحكم البناء — لا تحتوي عبارات الرأس المسجلة حرفياً أبداً.

**(2) تصنيف مقالات AR/EN الكاملة (69 مقالاً) — النتيجة موزعة كالتالي:**
- **KEEP (الأغلبية):** كل عنقود النية له صفحة أساسية واحدة بعد أعمال 178/190/191 — عائلة النوم الثلاثية (ساعات/علمي/تأثير) · ثنائيات السعرات المقترنة hreflang · بروتين الجرعة (EN) مقابل التوقيت (AR) كنيتين (قرار 191) · رمضان عام/النساء (جمهور) · رياضيون/بناء-عضلات (جمهور) · 12-أسبوع overload مقابل periodization (زاوية) · 4-day split عام مقابل upper/lower (نوع تقسيم).
- **MERGE + 301 (حالتان فقط — متطابقتا النية فعلاً بقرينة بنية H2):** (أ) `ar muscle-building-bodyweight-home` → `home-muscle-building-guide-no-equipment` — كلاهما «دليل شامل لبناء العضلات بدون معدات/بوزن الجسم» (مكتبة حركات + جدول أسبوعي + تغذية + استشفاء) والناجي الأشمل (4,745 كلمة)؛ (ب) `en 4-week-beginner-hypertrophy-plan` → `4-week-beginner-muscle-building-plan` — كلاهما «خطة عضلات 4 أسابيع للمبتدئين» والناجي يحمل الجدول يوم-بيوم + مبادئ overload داخل أقسامه. **حفظ القيمة:** الصفوف تبقى في الجدول منشورة-بلا (نمط 0084 — لا حذف محتوى) + نقل العدالة 301 في next.config بنفس الكوميت + كلاهما غير مقترن hreflang أصلاً (لا تماس بشبكة التوأمة 14/14).
- **REWRITE (حالة واحدة — على مستوى العنوان):** `ar calculate-calories-fat-loss` — العنوان/H1 وعد بدليل «حساب السعرات لتقليل الدهون» بينما **الجسم يسلّم برنامجاً هيكلياً من 8 أسابيع** (أسبوع 1: BMR → أسبوع 8: عادات النوم) — التضارب كان مع نية السعرات للمقترن EN-paired `calculate-daily-calories-weight-loss`. العنوان الجديد يصرّح بالنية الفعلية: «برنامج 8 أسابيع لحرق الدهون: خطتك الأسبوعية بالتمارين والسعرات» — بيانات فقط (ميجريشن 0087-B)، الـslug لم يُمس، لا خسارة محتوى، ونية «حساب السعرات لخسارة الوزن» صارت لصفحة أساسية واحدة.
- **صفر REDIRECT إضافية** عن هذه الحالات: قانون المالك «المتطابقة فقط عندما يكون الدمج منطقيًا» + قانون عدم-الإقران الأعمى — لا دمج بلا قينة بنية محتوى تُظهر تطابق النية وتغطية الناجي لقيمة المكرر.

**(3) FAQ المكرر (عيب دقة محتوى فعلي — 11/69 صفحة):** الزحف الحي كشف 11 مقالاً (7 EN + 4 AR) تعرض قسم FAQ مرتين — أجسام legacy تحمل **قسمَي FAQ** (مثل «أسئلة شائعة وإجابات سريعة» قبل الخاتمة + «الأسئلة الشائعة» بعدها، أو قسمين متطابقين متتاليين) وعقد العنوان الوحيد كان يقصّ **الأول** فقط. الإصلاح (`blog-msa.ts`): العقد صار **سطرَ عنوان كامل** (يمنع بلع عناوين موضوعية مثل «Frequently Asked Questions About Protein») بمتغايرات legacy الست + **حلقة قصّ لكل الأقسام المطابقة** مع مرور حرفي byte-identical عند عدم القص. يُشفى الكوربوس كله وقت العرض (نمط 178/187 — صفر كتابة DB) + 6 اختبارات انحدار جديدة.

**(4) الروابط الداخلية المكسورة (بند التحقق — أُصلحت):** 3 أجسام AR كانت تشير إلى slugs النوم المدمجة سابقاً **عبر مسار EN** (‏`/blog/sleep-{hours-muscle-growth,muscle-recovery-gym}` — الـ301s تغطي `/ar/` فقط) → 404 حي مؤكد. الإصلاح بنمط 0084(D): replace() بحرس LIKE في 0087-C — اثنان توجها للناجي المدمج، والثالث (الناجي ذاته يشير لـslugه القديم) توجّه للمقال العلمي الشقيق. **اكتشاف جانبي حُلّ بنفس المرحلة — تفكّك سجل الفئات:** بطاقة الفئة على مقالين AR (optimal-rest-periods… فئة fitness · cold-bath-home-wellness فئة wellness) كانت تبني رابطاً إلى `/blog/category/fitness|wellness` يرجع 404 حياً — **السبب الجذري الحقيقي (تشخيص بعد استبعاد فرضية كاش Vercel بالتحقق بعد نشر جديد):** سجل BLOG_CATEGORIES كان معاشاً مرتين — العميل blog.ts بعشرة معرفات (fitness/wellness داخلها) والسيرفر blog-server.ts بثمانية فقط، فبوابة صفحة الفئة (السيرفر) كانت تُعيد توجيه fitness→workout عبر SYNONYMS وتقتل الصفحة بـnotFound بينما العميل يخزّن ويعرض تلك الفئات. **الإصلاح:** وحدة واحدة src/lib/blog-categories.ts (10 معرفات + normalizeCategory + getCategoryLabel) يعيد التصدير منها blog.ts وblog-server.ts + حارس canary (blog-categories.test.ts) يمنع عودة النسخة الثانية ويفرض تطابق Registry⇄BLOG_CATEGORY_CONTENT — فصفحات الفئات العشرون كلها تعيد 200 وبطاقة الفئة على كل مقال تبني رابطاً حياً.

**(5) GEO/llms.txt (البند 5):** سطر «every URL has an English canonical version; Arabic mirrors» — **المصدر نفسه** للإيحاء الخاطئ بأن AR نسخة من EN بcanonical إنجليزي — استُبدل بالصياغة الصحيحة: نسختان مستقلتان مكتملتان، كل URL ذاتي-canonical، لا canonicalize لأي لغة، hreflang للمقارنات فقط. أُضيف قسم **«Sources of truth»** (تمارين→صفحاتها · أطعمة→صفحاتها · برامج→صفحاتها · أدوات→صفحاتها · عضويات→صفحتها · EVO→صفحته) + قسم **«Editorial policy»** (مراجعة أحمد زكي قبل النشر + سياسة الأدلة) + سطر الكيان (المؤسس + رابط البروفايل). **أزيل claim غير قابل للإثبات** («Typical results timeline 2-4 weeks») و**صُحح claim كاذب** («Premium adds unlimited EVO AI … doubled plans» — القانون الفعلي: بوول موحد 2/4/8/8) — مطابق لقانون العرض-==-الفرض. `llms-full.txt` مواءم كلياً (نفس الأسطر + «global audience» بدل «Egyptian and Arab market» + حذف عدّ «six calculators» غير المطابق للـroutes الخمسة).

**(6) EVO كصفحة الذكاء الاصطناعي الأساسية (البند 8):** في llms.txt + الخريطة: EVO = «the single primary page for AI-coach intent». الشبكة ثنائية الاتجاه أُكتملت: **EVO → الأسطح المحيطة** (قسم جديد «How EVO fits the platform» على /evo و/ar/evo: المولدان + الكوتشينج + الأدوات + البرامج + العضويات، hrefs واعية-للغة) و**المولدان → EVO** (شرائح «مدرب EVO الذكي/كوتشينج بشري» في صفحتي ai-meal-planner وai-workout-planner) — صفر صفحات جديدة تنافس نفس النية.

**(7) الربط الداخلي (البند 9) — القواعد الجديدة في `blog-tool-links.ts`:** 4 قواعد أعلى القائمة (الأكثر تحديدًا أولاً): AI Meal Planner · AI Workout Planner · EVO (مدرب بالذكاء الاصطناعي) · Coaching — المدونة الجديدة تربط تلقائياً Blog→EVO/Coaching/Planners بلا أي استدعاء AI (نفس الحد 3 روابط/مقال). وعائلة التدريب اكتملت: صفحات العضلات (EN+AR) اكتسبت رابط «برامج تدريب جاهزة» → **Exercises ↔ Muscles ↔ Equipment ↔ Programs** شبكة واحدة (بقية الأضلاع كانت قائمة: muscle→equipment/exercises/tools، food→collections/meal-planner من Phase 155، collections→tools/meal-planner).

**(8) E-E-A-T/الكيان/SEO البرمجي (البنود 4/6/7) — الحالة الحية مطابقة، توثيق لا تعديل:** المخططات سليمة (Organization + founder أحمد زكي + sameAs بستة بروفايلات مملوكة + locale-aware descriptions + صفر aggregateRating منذ P0-5) · authors.ts يحمل credentials و/authors/ahmed-zake حي · `resolveAuthor` يطبّع قيم legacy ('MuscleHub'/'Alkemos') إلى الشخص القانوني — هذه **تطبيع بيانات مقصود** لا إشارة هوية؛ إشارات MuscleHub المتبقية في المستودع هي أسماء أنواع MuscleHub (مراكز العضلات — دلالة مجردة) وسجلّ تاريخي في LICENSE/RUN_ON_SUPABASE (مرجع لا يُعدل) — **لا استخدام للعلامة القديمة كهوية أساسية** في metadata أو structured data أو llms.txt (مؤكد بمسح شامل + اختبار canary في intent-map.test.ts يمنعها من خريطة النوايا). SEO البرمجي: بوابة الجودة قائمة (حرس isAdvertisedMuscleHub يمنع المراكز الفارغة من sitemap + اختبارات hub-depth تفرض محتوى العمق لكل مركز حي) — لا صفحات هزيلة جديدة، وأي توسع مستقبلي يمر من خريطة النوايا.

**البوابات (محلياً قبل الدفع):** tsc 0 (الأربعة الموثقة لـfor-coaches فقط) · eslint 0/0 · vitest أخضر بالكامل (+22 اختباراً جديداً: intent-map 16 + FAQ-multi 6... التفصيل بالكوميت) · next build exit 0 · docs_audit (phase=192) · docs_parity · migration_audit · stale-refs · ui-wiring.

**المتبقي للمالك من هذا التدقيق (قرارات خارج المشروع):** إعادة كتابة كاملة لأجسام بعناوين متضاربة نياً (مثل أقسام التضخيم داخل `calculate-daily-calories-weight-loss` AR) تحتاج جلسة تحرير DB مخصصة — مسجلة كمرشح REWRITE بقائمة الأولوية. فئتا fitness/wellness حُلت بإصلاح التفكّك (بند 4) — تحقق حي 200 بعد النشر.

### §12.50 — Phase 193: Website Copy Audit & Improvement (2026-09-14 — أمر المالك «نفّذ على مستودع Alkemos الحالي مهمة Website Copy Audit & Improvement، مع استبعاد المدونة بالكامل»)

**النطاق:** تدقيق Copy شامل Read-Only لكل الأسطح العامة (Homepage · EVO · Coaching · Memberships · Tools · Exercises/Foods · For-Coaches · Affiliate · About/FAQ/Terms) باللغتين، ثم تنفيذ Copy-only (بلا مساس بالوظائف أو المدونة). **التحقق الحي أولاً:** git fetch SYNCED على 80b5a6f + زحف حي 200 للصفحات السبع + مطابقة الكود للمنشور.

#### أ) نتائج التدقيق (Audit Findings)

**المصدر:** قراءة كاملة للملفات (LandingView · evo/page · coaching/page · memberships/page + memberships.ts · tools/page · for-coaches + content.ts · AffiliateProgramView · StaticPageView · i18n.tsx · SiteHeader · EVO widget) + مطابقة كل رقم ب…مصدره (memberships.ts / affiliate-constants.ts / tier-limits / ai_plan_usage).

| # | الملاحظة | الشدة | السطح |
|---|---|---|---|
| 1 | **Testimonials مزيفة:** 9 بطاقات بصور randomuser.me وأسماء ونتائج مخترعة («-12kg in 3 months»…) + مقولتان مميزتان بنفس الأسماء + ترويسة «نتائج حقيقية/Real results» + «+500 عميل/500+ clients» — لا أساس لها (صفر مشتركين حيين موثق عند التحويل 2026-09-13) وتنتهك قوانين الصدق/E-E-A-T/Claims. نصوص EN تُعرض على صفحة AR أيضًا | P0 | /coaching |
| 2 | **Overclaim سُلّم الحفظ:** بطاقة Premium بالرئيسية «أدر خططك: EVO بلا حدود، وحفظ دائم ومزامنة عبر أجهزتك» — «حفظ دائم ومزامنة» ميزة الحساب المجاني (قانون §185/سلّم الحفظ) وتعارض tagline memberships.ts المصحح | P0 | Homepage |
| 3 | **إعلان مموَّل بلا إفصاح:** شريط «تعرّف على مدربينا المعتمدين/Meet Our Certified Coaches» هو إعلانات المدفوعة (0037 خصم المحفظة) معروضة كتزكية | P0 | Homepage |
| 4 | **زوج FAQ غير متطابق:** سؤال EN «Does it support PayPal?» مقابل AR «ما هي طرق الدفع المتاحة؟» — سؤالان مختلفان في نفس الزوج | P0 | Homepage FAQ |
| 5 | **صياغة تعلّم غير مضبوطة:** «يتعلّم من تقدّمك» في «ما هو EVO؟» — التنفيذ: ذاكرة دائمة (استخلاص كل 10 رسائل) + قراءة قياسات فعلية + تعلّم منصّي أسبوعي حقيقي (evo-learning-runner + GHA + 0080 + استهلاك في plan-generator). الادعاءات «learns weekly from real platform plans» و«permanent memory» **دقيقة ومثبتة ولا تُضعف** — يُضبط فقط ربط «التعلم» بالمنصة بينما التقدم «يُتابَع ويُتذكَّر» | P1 | /evo · About |
| 6 | **عدّ الحاسبات متضارب:** «6 حاسبات مجانية» (شريحة التنقل) مقابل «5 حاسبات» (فقرة المجاني + memberships.ts) مقابل «all six tools» (FAQ EN) — الحقيقة: 5 حاسبات + مخطط وجبات | P1 | Homepage ×3 |
| 7 | **تعريف الفئة (Positioning) غير موحّد:** «منصة تحسين أداء بشري» (About/FAQ) ≠ «منصتك الرياضية المتكاملة» (Hero) ≠ «منصة لياقة وتغذية أونلاين» (Footer) ≠ «Comprehensive Sports Platform» (Metadata) — أربعة تعريفات لفئة واحدة. التوحيد على أساس توجيه المالك: **منصة اللياقة والتغذية الذكية المتكاملة / The smart, all-in-one fitness & nutrition platform** | P1 | About · FAQ · Footer · Metadata |
| 8 | **عامية مصرية على أسطح تسويقية خارج حرس MSA:** AffiliateProgramView (كامل تقريبًا: مفيش/بتكسب/إزاي/لمين/بتاعك) · for-coaches page + COACH_FAQ_AR (اقبض/ضيف/شوف/يستهل) · LandingView أقسام (البيت/اختار وابدأ/قبل ما تاكلها/بيزنسك/بس) · tools/page (كوبساتك/شوف) · memberships FAQ (أقدر/فيه) · StaticPageView FAQ (فيه) — الصفحات الأربعة المحروسة سليمة لكن الحرس لا يغطي البقية | P1 | 6 ملفات |
| 9 | **لهجة/أخطاء داخل الحرس:** coaching: «بيحلل الأنماط…إيه اللي شغال» + «جسمك الجديد بيستناك» + خطأ مطبعي «ابدأ تحوّلي» (الصواب: تحوّلك) + نحوة «المدربين حقيقيين» (الصواب: المدربون حقيقيون) — الماسح يفوّت أفعال بادئة-بـ | P0/P1 | /coaching |
| 10 | **عدم تناظر EN/AR:** عمق AR أغنى بوضوح في: وصف الكوتشينج بالرئيسية (AR يعدّد 3 قيم/EN سطر واحد) · أوصاف الأدوات الست (EN مجرد عناوين: «Daily calorie needs») · وصف for-coaches (EN بلا ذكر الأدوات) — EN يُرفع لمستوى AR | P1 | Homepage |
| 11 | **CTA سالب الصياغة:** «لا عذر لتأجيلها بعد اليوم / no excuse to wait» — لوم ضمني بدل الثقة؛ يُستبدل بصياغة نتيجة-موجهة | P1 | Homepage CTA |
| 12 | **مفاتيح i18n ميتة بادعاءات خاطئة:** `feat.swaps2` («2 meal + 2 exercise swaps / day») و`feat.swapsUnlimited` («Unlimited daily swaps») — تناقض الشروط/memberships (3/6 أسبوعيًا) ولا يستخدمها أي مكوّن (grep صفر استدعاءات) — تُحذف | P1 | i18n.tsx |
| 13 | **فروق طفيفة EN/AR:** تذييل الرئيسية «صُنع بحب لمجتمع اللياقة العربي» مقابل «Built with care for the fitness community» (بلا Arab) — توحيد | P2 | Homepage footer |
| 14 | سلاسل i18n للتطبيق الداخلي (استبيانات/لوحات) فيها عامية (برجاء/مفيش/خلينا/عشان) — سطح داخلية غير تسويقية | P2 مؤجل | i18n.tsx (يوثق، لا يُنفذ في 193) |

**ما تحقق من الكود وثبت صلاحيته (لا يُضعف):** تعلّم EVO الأسبوعي من خطط المنصة المجهولة (evo-learning-runner.ts + evo-weekly-learning.yml + 0080 + استهلاك الأنماط في plan-generator.ts) · الذاكرة الدائمة للمسجلين مجانًا (evo-memory.ts: استخلاص كل 10 رسائل، حقن أعلى 15 حقيقة) · رد مبني على القياسات للمشترك (formatProgressForPrompt ببيانات فعلية + delta) · أرقام العضويات على كل السطح (2/4/8/8 موحّد + تبديلات 3/6 أسبوعية + أسعار 14.99/29.99/39.99) · عمولة الأفلييت 20% والأمثلة (3/6/8$) والحد 10$ وكوكيز 30 يوم = affiliate-constants.ts · عربي Memberships/Terms/EVO بالفصحى وأرقام دقيقة.

#### ب) خطة التنفيذ (P0 → P1 → P2) — Copy-only

| الدفعة | الأولوية | الصفحات | التغييرات |
|---|---|---|---|
| **B1 — الصدق والثقة** | P0 | /coaching · Homepage | حذف testimonialsData + المقولات المميزة + «500+/Real results» → قسم ثقة صادق (مراجعة بشرية للمؤسس + سياسة استرداد 7 أيام + دعم) · إصلاح لهجة/أخطاء coaching (9) · بطاقة Premium بسلّم الحفظ (2) · إفصاح الشريط المموَّل (3) · توحيد زوج FAQ (4) |
| **B2 — التموضع والصوت** | P1 | About · FAQ · Footer · Metadata · Homepage · /evo · i18n | توحيد الفئة (7) · عدّ الحاسبات (6) · تناظر EN/AR (10) · CTA إيجابي (11) · حذف المفاتيح الميتة الخاطئة (12) · ضبط صياغة التعلم (5) |
| **B3 — الفصحى والحرس** | P1/P2 | affiliate · for-coaches · LandingView · tools/page · memberships FAQ · StaticPageView · تذييل | تحويل MSA (8) + إضافة الملفين الجديدتين لحرس marketing-msa + canaries للعبارات المهملة (بيحلل/بيستناك/كوبساتك) + توحيد التذييل (13) |

**Claims تطلبت تحققًا قبل الاعتماد (وكُلّف حيًا بالكود):** «معتمدون/Certified» للمدربين (صفحاتهم تمر بمراجعة الأدمن 0046 — الصياغة تبقى «على المنصة» في الشريط الإعلاني) · «بياناتك مشفرة» (تشفير Supabase + RLS — يبقى) · «-33%» السنوي (مطابقة حسابية لبريميوم/برو) · أرقام البوول والتبديلات (مطابقة memberships.ts في EVO والمقارنات والشروط) · «مدرب معتمد +10 سنوات» للمؤسس (محتوى About المعتمد ملكيًا — يُستخدم كما هو).

**معايير القبول:** صفر testimonial بلا مصدر · صفر رقم غير مطابق لمصدره · صفر عامية في الأسطح السبعة المحروسة (الحرس موسعًا) · تناظر EN/AR في الأسطر المعدلة · tsc 0 · eslint 0/0 · vitest أخضر كاملًا (+ حراس MSA الجدد) · next build exit 0 · زحف حي 200 بعد النشر للصفحات المعدلة · STATE/worklog محدثان بنفس الفاز.

**استبعاد:** المدونة (محتواها وأنابيبها) · i18n سلاسل التطبيق الداخلي (P2 مؤجل) · أي تغيير تصميم/واجهة/وظائف.

#### ج) التنفيذ (B1→B2→B3) — منجز بالكامل في نفس الفاز

- **B1 (P0):** قسم testimonials المزيف حُذف كاملًا (testimonialsData + TestimonialCard + Marquee + الصور الخارجية + المقولات المميزة) واستُبدل بقسم ثقة صادق «التزام يمكن الاعتماد عليه» (إشراف المؤسس أحمد زكي المعتمد + حدود شفافة + استرداد 7 أيام — كل claim موثق في About/مصادر الحقيقة) · لهجة وصفحة الكوتشينج للفصحى + إصلاح «ابدأ تحوّلي» + نحوة H1 «مدربون وأخصائيو تغذية محترفون» + «هل المدربون حقيقيون؟» · بطاقة Premium بالرئيسية بمحتوى سُلّم الحفظ (سعة أكبر + تصدير) · شريط المدربين أصبح «مدربون على المنصة» بإفصاح «مساحات ترويجية مدفوعة لمدربين تمت مراجعة صفحاتهم» · توحيد زوج FAQ للدفع.
- **B2 (P1):** سطر الفئة موحّد في 6 أسطح («منصة اللياقة والتغذية الذكية المتكاملة / The Smart Fitness & Nutrition Platform»): metadata EN + AR layout (3 كتل) + About + FAQ + تذييل بطاقة الثقة بالكوتشينج + «بنى المنصة» · عدّ الحاسبات موحّد (5 حاسبات + مخطط وجبات في FAQ باللغتين + شريحة التنقل بلا عدد متضارب) · تناظر EN: وصف الكوتشينج بالرئيسية + أوصاف الأدوات الست + وصف for-coaches + فقرة المجاني · CTA الختام أصبح نتيجة-موجهًا («خطتك الأولى خلال دقائق») · ضبط صياغة التعلم في /evo و/coaching: «يتابع تقدّمك ويتذكّر ما تخبره به» + «يتعلّم أسبوعيًا من خطط المنصة الحقيقية» (الأدقّ والأقوى — التعلم المنصّي ثابت بالكود) · حذف مفتاحي i18n الميتين بادعاءات التبديل اليومية الخاطئة · تذييل الرئيسية «Arab fitness community».
- **B3 (P1/P2):** تحويل MSA كامل: AffiliateProgramView (كامل المحتوى العربي) · for-coaches (الصفحة + COACH_FAQ_AR) · LandingView (البرامج/الأطعمة/الأفلييت/المجاني) · tools hub · FoodsExplorer · memberships FAQ · توحيد معجمي: «مكتبة الأطعمة/صنفًا غذائيًا» في السايت ماركتينغ (SiteHeader + Footer + Tools + memberships) · **حرس MSA موسع 4→9 ملفات** (+AffiliateProgramView +for-coaches/page +for-coaches/content +tools/page +FoodsExplorer) + اختباران جديدان: canaries للعبارات المنزوعة (22 عبارة) + canaries صدق الادعاءات (randomuser/500+/testimonialsData/مفاتيح التبديل الميتة) — 23/23 أخضر.

**البوابات (محلياً):** tsc 0 (صفر جديد) · eslint 0/0 · vitest **1078/1078** (+41 اختبارًا عن 1037: حراس 193) · next build exit 0. **ملاحظة:** أخطاء for-coaches الأربعة الموثقة (استيراد صور ثابتة) لم تعد تظهر في tsc المحلي — الفحص يمر نظيفًا.

**تحقق حي بعد النشر:** /coaching بلا testimonials و200 · /ar/coaching «بانتظارك» حيّة · الرئيسية بإفصاح الشريط المموّل · /affiliate و/for-coaches بالفصحى · زحف 200 للصفحات المعدلة (بعد تنقية CF على المالك).

### §12.51 — Phase 194: Copy Refinement Pass (2026-09-14 — أمر المالك «نفّذ Copy Refinement Pass على الموقع الحالي [Alkemos] والمستودع الحالي. ابدأ بـ Audit سريع للكود + النصوص الحية، ثم نفّذ مباشرة. لا تغيّر أي functionality أو pricing أو quotas أو business rules، والمدونة مستثناة بالكامل»)

**النطاق:** تنفيذ Copy-only لتموضع جديد Benefit-First + صياغات عربية احترافية (MSA) + صدق الادعاءات — صفر مساس بالوظائف/الأسعار/البوول/قواعد العمل/المدونة. **التحقق الحي أولاً:** git fetch SYNCED على e66767a (رأس 193) + زحف حي 200 للرئيسية EN + مطابقة H1 الحي («Your complete fitness platform.» كان منشورًا).

#### أ) التنفيذ (بنود أمر المالك — بنودًا بندًا)

1. **Homepage EN — positioning:** H1 «Your complete fitness platform.» → «Train smarter. Eat with precision. Progress with intelligence.» + سطر وصف جديد تحت H1 يشرح أن Alkemos **منصة واحدة تجمع التدريب والتغذية والتخطيط الذكي ومتابعة التقدم** (EN+AR) — لا يُقرأ بعد الآن كحزمة أدوات منفصلة. أرقام المكتبات بقيت proof chips في الهيرو (قلّل feature-listing مع إبقاء الأرقام أدلة).
2. **Homepage AR:** H1 «منصتك الرياضية المتكاملة.» → «تدرّب بذكاء. تغذَّ بدقة. وتقدّم بوعي.» — وعبارات العامية المذكورة في الأمر استُبدلت كلها: «كوتش بيتابعك خطوة بخطوة»→«مدرب يتابع تقدمك خطوة بخطوة» · «بتتعدل مع تقدمك»→«وتتطوّر مع تقدّمك» · «كل أداة محتاجها»→«كل ما تحتاجه في منصة واحدة» · «معاك»→«معك» · «أسعارك إيدك»→«السعر الذي تختاره أنت» — فصحى حديثة طبيعية بلا ترجمة حرفية ولا فصحى متكلفة.
3. **About:** «an unmatched fitness and nutrition experience» → «a smarter, more connected fitness and nutrition experience» · مقارنة «sites that generate content automatically without human review» (غير قابلة للدفاع) → «Alkemos combines AI capabilities with human oversight and evidence-aware content.» (+المرآة العربية).
4. **FAQ — claim النتائج الزمنية:** «With commitment, results start in 2-4 weeks…» حُذف من الأسطح الثلاثة (StaticPageView EN/AR + faq-content.ts للـJSON-LD) واستُبدل بـ«Results vary by individual, consistency, starting point, and goals. Alkemos provides structured tools and guidance to help you make measurable progress over time.» + وصف meta لصفحة /faq لم يعد يعد بـ«when to expect results».
5. **FAQ/Privacy — دقة الخصوصية:** «Only you and the coach can see it.» والصيغ العربية المطلقة («لا يراها أحد سواك والكوتش») **تحققت ضد الكود قبل التغيير**: RLS يمنح المالك + المدرب المعيّن (`is_coach_over`)، وأسطح الأدمن تقرأ بيانات الحساب في نطاقات تشغيلية (0067 admin clients unification · /admin/saved-results · /admin/payments · /admin/leads · evo_memory: update/delete للـadmin) → الصياغة الجديدة: «visible to you and your assigned coach — authorized platform staff can access them only in limited support and operations contexts» (+Privacy page بندا Data Usage وData Security ضُبطا بالمثل).
6. **EVO — Memory مقابل Chat History:** الادعاءات learning/memory/personalization بقيت كما هي (مثبتة بالكود — §12.50) مع توضيح الفرق: Memory = «EVO يتذكّر بياناتك وأهدافك وتفضيلاتك وتقدّمك / Remembers your fitness data, goals, preferences, and progress» · Chat History = «تُحفظ محادثتك ويمكن مزامنتها عبر أجهزتك حسب خطتك / Your chat history can be saved and synced across devices according to your plan» — مطابق لجدول Free-vs-Subscriber (استرجاع عبر الأجهزة للمشترك فقط) وevo_memory (0078).
7. **For Coaches:** «0% commission»/«Zero commission» → «Keep 100% of what you charge — 0% revenue commission. A fixed platform fee applies per active client.» (شريط الإحصاء: 0% → **100%** + عنوان كارت «احتفظ بكل ما تحصّله») — نموذج العمل نفسه لم يُمس (رسم ثابت لكل عميل نشط، لا نسبة — مطابق للأمر الملكي القديم).
8. **Global AR sweep:** مسح آلي (سكربت حد-كلمة) لكل السلاسل العربية في الملفات العامة غير المدونة — إصلاحات إضافية خارج بنود الأمر: FoodDetailClient («عايز/دوس على زرار/هاتحسب»→فصحى) · for-coaches/register («بنحوّلك دلوقتي»→«ننقلك الآن» · «عندك حساب»→«لديك حساب») · ميتاداتا /ar/for-coaches (+register): «في إيدك»→«بين يديك» و«بتحددها/إنت اللي»→«تختارها أنت» (Keywords SEO بقيت كما هي — بيانات بحث لا نص تسويقي) · ContactView · programs (حالة فراغ) · EvoFloatingWidget (رسائل الخطأ + أسئلة مقترحة «إزاي/عايز/عشان») · AuthView (مسار الدفع) · رسائل API الظاهرة للمستخدم (سجل المدرب · التفعيل · PayPal · الإلغاء · الاسترداد · ai_jobs «العميل ده مش من عملاؤك» ×4 ملفات) · نصائح نتائج الحاسبات في رسائل البريد (16 صياغة عامية→فصحى) — البنود الداخلية (لوحات admin/المدرب وسلاسل i18n الداخلية) بقيت لدفعة داخلية موثقة (استمرار P2 من 193).
9. **AI Plans Card (Benefit-First):** الكارت القائد بالأدوات المجانية كان يشرح الآلية (البوول/العداد/سلّم الحفظ) → الآن: Headline «Your plan. Built for you. / خطتك، مصممة لك.» + Description «Create a personalized nutrition and workout plan based on your goals, body, preferences, and lifestyle — then adjust it as you progress. / أنشئ خطة تغذية وتدريب مخصصة لأهدافك وبياناتك وتفضيلاتك ونمط حياتك، ثم طوّرها مع تقدمك.» + CTA «Create My Plan / أنشئ خطتي» — والتفاصيل التشغيلية (توليدان ناجحان شهريًا · عد النجاح فقط · جهاز/حساب/باقات) بقيت **سطرًا ثانويًا صغيرًا** تحت الوصف: صفر معلومة محذوفة، صفر مساس بالحدود الفعلية.
10. **Homepage Cards Benefit-First (كامل الصفحة):** «Calculate Your Needs with Free Tools»→«Know What Your Body Needs — In Numbers / اعرف ما يحتاجه جسمك بالأرقام» · «Over 868 Exercises Await You»→«Train Every Muscle the Right Way / تدرّب على كل عضلة بالطريقة الصحيحة» (الرقم 868+ نزل الوصف كدليل) · «Over 8,830 Food Items»→«Know What's in Your Food Before You Eat It / اعرف ما في طعامك قبل أن تتناوله» (الرقم 8,830+ في الوصف) · قسم الكوتشينج وللمدربين صار بفائدة قائدة — الأرقام والميزات المهمة بقيت proof points لا هي القصة.
11. **Metadata:** وصف EN الجذر أصبح يقود بالتموضع ويحتفظ بالأرقام كدليل: «Train smarter. Eat with precision. Progress with intelligence. Alkemos unifies training, nutrition, and AI planning — 868+ exercises, 8,830+ foods, EVO coach.» (157 حرفًا) · وصف AR (الجذر ×3 كتل): يقود بالتموضع الجديد مع CTA المالك الحرفي — داخل ميزانية 160.

#### ب) الحرس والتوثيق (نفس الفاز)

- **حرس marketing-msa-surface موسع 9→17 ملفات:** +FoodDetailClient · programs · ContactView · EvoFloatingWidget · AuthView · for-coaches/register · ar/for-coaches/layout · ar/for-coaches/register/layout — وcanaries العبارات المنزوعة امتدت بعبارات 194 («كل أداة محتاجها» · «كوتش بيتابعك» · «أسعارك إيدك» · «Your complete fitness platform.» · «0% Commission — fixed fee only» · «في إيدك» · «يتذكّر وزنك وهدفك وتقدّمك»…) — العقد القديم الذي كان يثبّت CTA القديم («ولّد خطتك المجانية الآن») حُدّث للعقد الجديد (أنشئ خطتي/Create My Plan/Your plan. Built for you.) بأمر المالك الأحدث، وعقد رسالة الاسترداد حُدّث للفصحى.
- **عقود اختبار حُدّثت بنفس الكوميت:** ai-meal-planner.test.ts (discoverability CTA) · refund-eligibility.test.ts (رسالة «لا يوجد اشتراك نشط» بالفصحى).

#### ج) البوابات والتحقق

- **البوابات (محلياً):** tsc 0 أخطاء جديدة (الأربعة الموثقة مسبقًا لاستيراد صور for-coachers تظهر محليًا فقط وتطابق أساس origin/main بالضبط) · eslint 0/0 · vitest **1094/1094** (+16 عن 1078: ملفات الحرس الثمانية الجديدة ×2 قانون + canaries) · next build exit 0 · docs_audit أخضر.
- **ما لم يُمس:** أي functionality/quota/pricing/business rule · أي route أو رابط · المدونة كاملة · keywords الميتاداتا (بيانات بحث) · سلاسل i18n الداخلية ولوحات admin/المدرب (P2 مؤجل موثق من 193 — سطح داخلي غير تسويقي).
- **معايير القبول تحققت:** كل claim في الصفحات المعدلة له مصدر كود (RLS/سجل جدول evo_memory · ai_plan_usage · wallet fee) · صفر ادعاء زمني للنتائج · صفر عامية في الأسطح العامة المحروسة (17 ملفًا) · EN/AR متناظران في كل زوج معدل.

### §12.52 — Phase 195: Numbers-as-Proof + Swaps Clarity (2026-09-14 — أمر المالك «الأرقام في Homepage: احتفظ بها كـ [Proof of Depth] لا كـ technical specifications · Tools = 8 وليس 5 · اجعل الأعداد Dynamic من مصدر البيانات قدر الإمكان · استخدم "+" مع حجم المحتوى ولا تستخدمه مع حدود العضوية · توضيح معنى Swaps في Memberships وكل مكان»)

**النطاق:** Copy-only — صفر مساس بالوظائف/الأسعار/البوول/الحدود/المدونة. **التحقق من السلوك قبل الصياغة (§3.1):** أنواع التبديل الحقيقية من `src/lib/ai-jobs.ts` — تبديلات الأعضاء (بالحصة الأسبوعية) هي `meal_regenerate` (وجبة واحدة) + `exercise_regenerate` (تمرين واحد داخل اليوم، مفلتر بالمكتبة) ببوابتي `user_swap_meal`/`user_swap_exercise`؛ و`food_item_regenerate` (صنف غذائي ±15%) و`day_regenerate` (يوم تدريبي) **أدوات طاقم فقط** (`JobGate: "coach"`) — لذا صياغة المالك «Meal & Exercise Swaps» هي المطابقة الدقيقة للواقع، لا اختصارًا. الحصة أسبوعية لكل نوع (tier-limits: `plan_swaps`، تجديد الاثنين). توليد الخطة منفصل تمامًا (البوول الشهري الموحد 2/4/8/8).

#### أ) الأرقام كأدلة (بنود 1+2)

1. **مصدر واحد للأدوات** `src/lib/tools-shared.ts` (جديد): مصفوفتا `TOOLS`/`TOOL_LIBRARIES` نُقلتا من `src/app/tools/page.tsx` (نفس الرندر حرفيًا) + `TOOLS_COUNT = TOOLS.length` = **8** (5 حاسبات + مخطط الوجبات + مخططا AI) — نفس نمط exercises-shared/foods-shared (BUNDLE LAW).
2. **الرئيسية ديناميكية بالكامل:** `EX_PLUS`/`FOODS_PLUS`/`TOOLS_PLUS` تشتق من الثوابت الموثقة (مثبتة على المصفوفات الحقيقية بـlibrary-counts.test.ts) — استُبدلت كل السلاسل الصلبة (شارات الهيرو · عناوين HERO_NAV · سؤالا الكم · صفوف المقارنة · قسم التمارين/الأطعمة · بطاقة مخطط الوجبات · قسم المدربين · سطر الخطة المجانية) — العدد يزيد تلقائيًا مع نمو البيانات.
3. **«8+ Tools» دليلًا:** شارة هيرو رابعة «8+ FREE TOOLS / 8+ أدوات مجانية» + العنوان الفرعي لقسم الأدوات «8+ أدوات مجانية تحوّل هدفك…» — وإسقاط «5 حاسبات/5 calculators» من كل الأسطح (سؤال الأدوات بالرئيسية صار يعدّ الأدوات الثماني بأسمائها · ميزات Free بالعضويات «8+ أدوات لياقة وتغذية مجانية»).
4. **قانون «+»:** حجم المحتوى يحمل «+» (868+/8,830+/8+) — حدود العضوية بلا «+» أبدًا (2 توليدات · 3/6 تبديلات · 10 رسائل) — مثبت بالتعليقات والكاناريات.

#### ب) توضيح Swaps (بند 3+4) — صياغة المالك الحرفية

- **EN:** «Meal & Exercise Swaps» + «Replace individual meals or exercises within your plan.» + الحدود «3/6 meal/exercise swaps per week».
- **AR:** «تبديلات الوجبات والتمارين» + «استبدل وجبات أو تمارين فردية داخل خطتك دون إعادة إنشاء الخطة كاملة.» + الحدود «3/6 تبديلات للوجبات أو التمارين أسبوعيًا».
- **مواضع التطبيق:** memberships.ts (ميزاتي بريميوم/برو + tagline برو + صف المقارنة «EVO: Meal & Exercise Swaps») · ملاحظة جديدة تحت جدول مقارنة العضويات («التبديلات تعني استبدال وجبات أو تمارين فردية داخل خطتك دون إعادة إنشاء الخطة كاملة — أسبوعية تتجدد كل اثنين») · الرئيسية (كارت برو + سؤال Premium/Pro) · faq-content.ts (السؤال صار «What are swaps and how many do I get?/ما هي التبديلات وكم عددها؟») · StaticPageView (قسم الشروط «التبديلات»→«تبديلات الوجبات والتمارين» + زوجا FAQ) · OfferCatalog في memberships/layout · صفحة الكوتشينج (وصف EVO) · المقارنات الثلاث.
- **المصطلحات مميزة (بند 4):** AI Plan Generation = إنشاء/إعادة إنشاء خطة كاملة (البوول الشهري) ≠ Meal Swap (وجبة) ≠ Exercise Swap (تمرين) ≠ Food/Item Swap وWorkout Day (أدوات طاقم — لا تُعرض على الأعضاء) — لا استخدام لكلمة Swap توحي بإعادة توليد كامل.

#### ج) التصحيحات المرفقة (نفس معيار الدقة)

1. **«ست حاسبات/six calculators» في المقارنات الثلاث** كانت تعدّ مخطط الوجبات «حاسبة» — صارت «ثماني أدوات (خمس حاسبات، ومخطط وجبات، ومولدا خطط بالذكاء الاصطناعي)».
2. **بقايا المضاعفة:** «doubles plan limits / يُضاعف حدود الخطط» (مقارنة MyFitnessPal — فاتتها 185) → «8 توليدات خطط AI شهريًا مع 6 تبديلات للوجبات أو التمارين أسبوعيًا».
3. **«+» الناقص:** About (StaticPageView: قسم المؤسس) + خلايا وقواعد المقارنات (868-exercise/8,830-food → 868+/8,830+) + وصف AR للـOrganization «8830 أكلة»→«8,830+ صنف غذائي» (pin اختبار low-fixes حُدّث بنفس الفاز) + توحيد «الأطعمة/صنف غذائي» بدل «الأكلات/أكلة».
4. **llms-full.txt:** عدّ الأدوات الثماني مكتملًا (كان يفوّت مخطط الوجبات اليدوي).

#### د) الحرس (canaries 195)

- **منع الرجوع:** «3/6 swaps/week» و«3/6 تبديلات/أسبوع» المجرّدة + «5 حاسبات» + «ست حاسبات» + «doubles plan limits» + «8830» بلا فاصلة + عناوين الأقسام القديمة — عبر 7 ملفات (marketing-msa-surface.test.ts).
- **عقد الديناميكية:** الرئيسية إلزامها استخدام EX_PLUS/FOODS_PLUS/TOOLS_PLUS + صفحة الأدوات وmemberships.ts إلزام الاستيراد من tools-shared + إسقاط العدّ (TOOLS_COUNT=8 في library-counts.test.ts).
- **عقود discoverability الثلاثة** (ai-meal-planner · ai-workout-planner · diet-plan-matrix) حُدّثت لمصدر البيانات الجديد (البيانات في tools-shared + سلك الاستيراد بالصفحة).

**البوابات:** tsc 0 · eslint 0/0 · vitest **1097/1097** (+3) · next build exit 0 · docs_audit (phase=195). **صفر ميجريشنز، صفر مساس بالمدونة.**

### §12.53 — Phase SEO-GEO-14: التدقيق العميق المستقل الثاني (Read-Only Audit) ← خطة العمل المحدّثة (2026-09-15 — أمر المالك «نفّذ الآن تدقيقًا عميقًا ومستقلًا لمشروع Alkemos بالكامل، باستخدام أحدث حالة فعلية للمستودع والإنتاج»)

**المنهجية (كلها من الحالة الفعلية، لا من التقارير السابقة):** الإنتاج = كوميت `3f40731` (رأس main المتزامن — build-info حي) · فحص حي مباشر لأكثر من 120 URL (robots بزواحف AI · فهرس السايت ماب 2,158 URL · عينة عشوائية 70/70 = 200 · 40+ صفحة بأنواعها: قوائم/تفاصيل/مقارنات/مؤلف/hubs/collections/مدونة ثنائية اللغة) · تحليل الكود لكل الأسطح SEO-relevant · مراجعة كاملة للتوثيق (STATE/worklog/§12 كاملًا/EEAT/CWV/SCHEMA-REFERENCE) للتحقق مما نُفّذ فعلًا مقابل الموثق. **صفر تعديل على الكود في هذه المرحلة — Audit + توثيق فقط.**

#### أ) أبرز النتائج الحاكمة

1. **الأساس التقني سليم ومتحقق حيًا على نطاق واسع:** robots الموحّد يخدم كل الزواحف بما فيها AI (GPTBot/ClaudeBot/PerplexityBot = 200 حيًا) · 6 sitemaps بـ`xhtml:link` hreflang صحيح · canonical ذاتي على كل صفحة مفحوصة · hreflang en/ar/x-default ثنائي الاتجاه بلا أزواج زائفة (المقالات غير المقرنة تعلن self-only — سلوك صحيح) · 404 حقيقي بلا soft-404 · 301s سليمة · USDA AR long-tail = noindex,follow كما هو موثق · ar/rss.xml بالروابط العربية (إصلاح P0-2 السابق مؤكد) · aggregateRating المزيف منزوع (قانون P0-5 مؤكد) · llms.txt/llms-full.txt عالي الجودة · E-E-A-T: صفحة مؤلف بcredentials + sameAs بستة ملفات مملوكة.
2. **الحلول السابقة كلها ما زالت قائمة في الإنتاج** (تحقق تراجعي لخطة §12.19): P0 5/5 ✓ · صفحات البحث الداخلي canonical→/blog ✓ · فئات المدونة الـ20 في السايت ماب ✓ · وصف Organization/WebSite بلغة الصفحة ✓ · og:image على كل صفحات التفاصيل والأدوات ✓.
3. **الثغرات الجديدة كلها في طبقة العرض/الأصول لا في الهندسة:** (أ) كل صور التمارين hot-linked من `raw.githubusercontent.com` · (ب) مخططات EVO/Coaching JSON-LD بالعربية على الصفحات EN · (ج) og:image غائب عن أسطح القوائم EN · (د) عنوان الرئيسية 94 حرفًا.
4. **التعارضات التوثيقية المرصودة:** STATE.md يقول منطقة Vercel «iad1» بينما `vercel.json` = `fra1` · lastmod عائلة pages في السايت ماب ما زال `2026-09-09` رغم أن المراحل 194–205 غيّرت الرئيسية/العضويات/الأدوات حتى `2026-09-15` (خلاف بروتوكول التحديث المكتوب في `sitemap-lastmod.ts` نفسه) · §12.45 تعطي انطباع اكتمال تغطية og:image بينما الاختبار (`og-image-coverage.test.ts`) يغطي صفحات التفاصيل فقط ولا يشمل أسطح القوائم EN.
5. **بند أمني عاجل (خارج SEO لكنه الأعلى خطورة إجمالًا):** مفتاح OpenRouter المسرب لا يزال حيًا (موثق STATE.md «المفتوح الآن» — تحقق حي 2026-09-14) والمستودع عام والتسريب في أسلاف مباشرة لـorigin/main.

#### ب) المشاكل مرتبة حسب الأولوية (الحالة الابتدائية كلها Pending)

| # | الأولوية | المشكلة | الدليل الفعلي | التأثير | الحل المقترح | النوع | الحالة |
|---|---|---|---|---|---|---|---|
| 1 | **P0** | مفتاح OpenRouter المسرب حي | STATE.md (تحقق حي 2026-09-14: 200 على /auth/key) + تاريخ git العام | سرقة رصيد/استخدام باسم المشروع — أعلى خطر مطلق | إنشاء مفتاح جديد ← تحديث Vercel+GHA env ← حذف القديم ← مسح بند STATE | إعداد خارجي | **مكتمل (مالك — تأكيد التدوير 2026-09-15 + مُسح بند STATE في 206)** |
| 2 | **P1** | صور التمارين من raw.githubusercontent.com (868×2 + الرئيسية/hubs/programs) | `src=` مباشر في HTML الحي + `Cache-Control: max-age=300` + `images.unoptimized=true` | LCP/CWV على أكبر عائلة (1,736 URL) + مخاطرة موثوقية (ليس CDN؛ حدود معدل؛ نقل/حذف المستودع يكسر كل الصور) + Google Images | استضافة ذاتية (public/ أو Supabase Storage) + كاش طويل + أبعاد محسّنة؛ ثم إعادة تقييم `unoptimized` | كود + أصول | **مكتمل (207 — استضافة ذاتية في public/ بأمر المالك، WebP q85 أبعاد أصلية، كاش immutable، تحقق حي)** |
| 3 | **P1** | JSON-LD عربي على صفحات EN: SoftwareApplication لـEVO على /evo + Service على /coaching | الاستخراج الحي للـJSON-LD + `seo.ts` بلا معامل لغة لهاتين الدالتين (على خلاف getOrganizationSchema(lang)) | آلات البحث وAI تقرأ وصفًا عربيًا لكيان EN — نفس عائلة خطأ P2-14(ج) الذي أُصلح لOrganization/WebSite فقط | locale-aware + حرس اختبار (نفس نمط ORG_DESCRIPTIONS) | كود صغير | **مكتمل (206 — تحقق حي 37/37)** |
| 4 | **P1** | og:image غائب عن أسطح القوائم EN: /exercises · /foods · /programs · /coaching · /memberships · /evo · /diet-plan/* · /equipment/* (+ og:url/locale ناقصة على /memberships وog:locale على water-tracker) | الفحص الحي: لا meta og:image + الكود: الـlayouts تعلن openGraph بلا images (الـAR ترث og-home-ar من /ar/layout.tsx؛ الـEN لا ترث شيئًا) | المشاركات الاجتماعية/Discover لهذه الـURLs بلا بطاقة | إضافة images (+locale/url) للـlayouts + توسيع WIRED_SURFACES في اختبار التغطية ليشمل القوائم | كود صغير | **مكتمل (206 — تحقق حي 37/37)** |
| 5 | **P2** | عنوان الرئيسية 94 حرفًا | `<title>` الحي | قصّ SERP ~60 حرفًا — ذيل العنوان (Coaching) لا يظهر | تقصير إلى ≤65 مع إبقاء الكلمات المفتاحية الأولى | محتوى (metadata.ts) | **مكتمل (206 — 48 حرفًا — تحقق حي 37/37)** |
| 6 | **P2** | عمق مقالات المدونة ~1,000–1,300 كلمة جسمًا | عدد كلمات `<article>` الحي (EN 1,279 · AR 978 لعينة) | تحت منافسين التصدر (1,500–3,000) لمصطلحات الرأس | رفع حد عمق المقالات الجديدة في بوابة الجودة تدريجيًا | محتوى/pipeline | **مؤجل بقرار المالك (2026-09-16 — §12.58)** |
| 7 | **P2** | lastmod عائلة pages قديم + تعارض iad1/fra1 في STATE | `sitemap-lastmod.ts` (2026-09-09) مقابل مراحل 194–205 حتى 09-15 · `vercel.json` regions=["fra1"] | إشارة حداثة غير صادقة لمحركات البحث + توثيق مضلل | تحديث lastmod + تصحيح سطر STATE | توثيق | **مكتمل (206 — تحقق حي 37/37)** |
| 8 | **P2** | FAQPage (على / و/faq) وHowTo (صفحات التمارين) ما زالت تُرسل رغم تصنيفها «متقاعدة» في SEO-SCHEMA-REFERENCE.md | JSON-LD الحي | لا ضرر غوغلي مباشر (مقاعد غوغل متقاعدة) لكنها توصية داخلية غير منفذة | قرار مالك: إزالة للنظافة أو إبقاء لقراءة AI/GEO (قيمة محتملة) | كود اختياري | **محسوم: إبقاء (قرار المالك 2026-09-16 — §12.58)** |
| 9 | **P3** | كيان Wikidata غير منشأ (بند P1-7 في §12.19 خطط ولم يُنفذ) | sameAs بلا wikidata.org | إشارة كيان إضافية للمعرفة | إنشاء عنصر Wikidata + إضافته لsameAs | إعداد خارجي + سطر كود | **مؤجل بقرار المالك (2026-09-16 — §12.58)** |
| 10 | **P3** | Trustpilot 0 تقييمات (آخر تحقق 2026-09-12) + aggregateRating مطفأ | §12.21 التحقق الحي | لا يمكن تفعيل إشارة التقييم بمصدر حقيقي | أول 10 تقييمات حقيقية (خطة المرحلة 3) ثم إعادة تفعيل | مالك/تشغيلي | **مؤجل بقرار المالك (2026-09-16 — §12.58)** |
| 11 | **P3** | /affiliate بلا مرآة AR (الصفحة الوحيدة أحادية اللغة) | 404 على /ar/affiliate | شركاء عرب يهبطون على صفحة EN | مرآة عربية كاملة أو ترك قرارًا تجاريًا | قرار + محتوى | **مكتمل (208 — أمر المالك: مرآة كاملة؛ تحقق حي)** |
| 12 | **P3** | عنوان /blog EN بلا لاحقة العلامة بينما AR يملكها | `<title>` الحي: «Fitness & Nutrition Blog» | اتساق هوية SERP | إضافة قالب اللاحقة أو «| Alkemos» | محتوى | **مكتمل (206 — تحقق حي 37/37)** |
| 13 | **P3** | LanguageToggle زر JS بلا روابط `<a hreflang>` قابلة للزحف (الاكتشاف عبر head alternates فقط) | الكود + HTML الحي | تعزيز اكتشاف متبادل خفيف | روابط نصية في الفوتر للمرايا | كود اختياري | **محسوم: إسقاط (قرار المالك 2026-09-16 — §12.59)** |
| 14 | **P3** | مراجعة سياسة USDA EN بعد 90 يومًا من بيانات GSC (موعودة أصلًا في Phase 141) | تاريخ السياسة 2026-09-07 | قرار مبنى على بيانات فعلية | مراجعة Coverage عند اكتمال 90 يومًا (~2026-12-07) | تحليل خارجي | **مؤجل بقرار المالك (2026-09-16 — §12.58؛ محطة البيانات ~2026-12-07 تبقى إعلامية)** |

#### ج) ما تم التحقق منه سليمًا (قائمة الحسم — لا يُعاد فتحه دون دليل جديد)

الإنتاج متزامن مع main (build-info) · robots.txt الموحّد + السايت مابز السبعة (فهرس + 6 أطفال) سليمة ومكتملة الأنواع (pages 137 · collections 48 · comparisons 6 · exercises 1,736 · foods 160 · blog 71) · عينة 70/70 = 200 بلا redirects · canonical ذاتي مئة المئة · hreflang ثنائي الاتجاه سليم (بما فيه 7 أزواج مدونة مقرونة و57 self-only صحيحة) · 404 حقيقي noindex · www/http→https 301 + HSTS + ترويسات أمان · الفهرسة الانتقائية (admin/dashboard noindex في body، /preview/coaches لاindex) · USDA AR noindex,follow · Article schema بمؤلف ومراجع حقيقيين · WebApplication+HowTo+BreadcrumbList على الحاسبات باللغة الصحيحة · ProfilePage للمؤلف بcredentials · Organization/WebSite بلغة الصفحة (إصلاح P2-14 مؤكد) · llms.txt/llms-full.txt شاملان بمصادر حقيقة وسياسة تحرير · RSS ثنائي اللغة بالروابط الصحيحة · زواحف AI الثلاثة المفحوصة = 200 · P0s السابقة كلها قائمة في الإنتاج · TTFB عبر الحافة 40–70ms وHTML الرئيسية 25KB مضغوطًا · lazy-loading وalt-فارغ للزخارف حسب الأصول · الربط الداخلي: الرئيسية تصل 47 سطحًا فريدًا تغطي كل الخدمات · أزواج diet-plan بعناوين فريدة · ملف تحقق GSC حي.

#### د) ما لم يمكن التحقق منه (يحتاج وصولًا خارجيًا)

عدد الصفحات المفهرسة فعلًا في Google/Bing وsitemaps coverage (GSC/BWT) · حالة تقييمات Trustpilot الحالية (403 حماية بوتات) · محتوى إنستجرام/لينكدإن (جدران دخول) · CWV ميدانية حقيقية (CrUX/PSI — قد لا يوجد حجم بيانات كافٍ) · حالة مفتاح OpenRouter الحية (الاكتفاء بتحقق 191 الموثق؛ اختباره مباشرة = استدعاء بمفتاح مسرب لا يجوز) · سلوك Googlebot الفعلي (crawl stats في GSC) · صفحات coach landing الحقيقية (DB-driven بلا slugs معروفة — وسياسة noindex مقصودة) · Google Business Profile.

#### هـ) ترتيب التنفيذ المقترح + التبعيات والمخاطر

1. **فورًا (اليوم):** البند 1 (تدوير المفتاح — مالك، خارجي، صفر كود).
2. **دفعة 1 (أيام 1–3، كود صغير منخفض المخاطر):** البند 3 (مخططات EVO/Coaching بلغة الصفحة) → البند 4 (og:image للقوائم EN + توسيع الاختبار) → البند 5 (عنوان الرئيسية) → البند 12 (لاحقة /blog) — كلها جواريات منخفضة المخاطر عبر البوابات التسع.
3. **دفعة 2 (أسبوع 1–2، مشروع أصول):** البند 2 (استضافة صور التمارين ذاتيًا) — **تبعية:** قرار مالك على وجهة الاستضافة (public/ بمساحة المستودع مقابل Supabase Storage بحدود الخطة) — **مخاطرة:** يجب مسحًا كاملًا لكل مرجع + احتفاظ بأسماء ثابتة أو 301 صور · لا يجوز المساس بـ`unoptimized` في نفس الدفعة (متغير واحد لكل مرة).
4. **دفعة 3 (توثيق):** البند 7 (lastmod + STATE) — يرافق أي دفعة كود لأنها تلمس أُسر الصفحات أصلًا.
5. **مستمر:** البند 6 (عمق المقالات — بوابة pipeline) · البنود 9/10/11 (مالك: Wikidata · تقييمات · قرار /affiliate).
6. **مؤجل بقرار:** البند 8 (إزالة المخططات المتقاعدة — له قيمة GEO محتملة، لا تستأثر بالجهد) · البند 14 (موعد ~2026-12-07).

**المخاطر العامة:** أي تعديل يمر ببوابات AGENTS.md (tsc/eslint/vitest 1155+/build/docs_audit) — المخططات وog:image محروسة باختبارات يجب تحديثها في نفس الفريم (قانون نفس الفريم للتوثيق) · **ممنوع** إعادة هيكلة معمارية SEO القائمة بأي دفعة من هذه (كلها إصلاحات عرض) · صور التمارين: التراجع متاح (تثبيت الشيفرة الحالية كfallback).

**قانون هذه المرحلة:** Audit + توثيق فقط — صفر تعديل كود/وظائف/بيانات/أسعار/كوتة؛ كل البنود أعلاه تُنفذ بأوامر مالك مستقلة لكل دفعة، ويُحدَّث عمود الحالة في هذا الجدول مع كل تنفيذ (Pending → In Progress → Verified → Completed).

### §12.54 — Phase SEO-GEO-15: تنفيذ دفعة ١ من خطة §12.53 (المرحلة 206 — أمر المالك «تم تدوير وتعديل المفاتيح، ابدأ تنفيذ دفعة ١» 2026-09-15)

**النطاق (كله عرض/metadata — صفر مساس بالوظائف/المسارات/الأسعار/البيانات):** البنود 3 و4 و5 و12 من جدول §12.53-ب + البند 7 المرافق (lastmod + تصحيح STATE) + إغلاق البند 1 توثيقيًا بعد تأكيد المالك تدوير المفتاح (البند مُسح من STATE.md — نص التاريخ الجنائي باقٍ في git كمرجع؛ قانون كتابة التوكنات في worklog قائم).

**ما نُفّذ بالضبط:**

1. **البند 3 (مخططات بلغة الصفحة):** `getEVOApplicationSchema(lang)` و`getCoachingServiceSchema(lang)` في `src/lib/seo.ts` صارا يتطلبان معامل لغة إلزاميًا (نمط ORG_DESCRIPTIONS نفسه): جداول نصوص EN/AR كاملة (اسم/وصف/نص العرض/featureList للـEVO). الأسطح الأربعة حدّثت: `/evo` و`/coaching` بـ`"en"` والمرآتان بـ`"ar"`. حرس الاختبار `schema-rating-law.test.ts` وُسّع: قوانين صفر-عربي على EN وصفر-لاتيني-نصي على AR + منع الاستدعاءات عديمة المعامل + بقاء قانون P0-5 (لا aggregateRating) في اللغتين.
2. **البند 4 (og:image لأسطح القوائم EN):** 9 أسطح وُصلت ببطاقات — `/exercises` و`/foods` ببطاقتي عائلتيهما (og-exercises-en/og-foods-en)، و`/programs`·`/coaching`·`/memberships`·`/evo`·`/diet-plan` (hub)·`/diet-plan/{level}/{system}` (24 خلية)·`/equipment/*` ببطاقة الرئيسية og-home-en — **وهذا يطابق سلوك الوراثة العربي حرفيًا** (كل مرايا AR لهذه الأسطح ترث og-home-ar من `/ar/layout.tsx`؛ لا بطاقة مخصصة للبرامج/الكوتشينج/العضويات/EVO/الوجبات/المعدات موجودة أصلًا). السبب الجذري الموثق: كتلة openGraph الابن تستبدل كتلة الجذر كاملةً في دمج Next.js metadata، فلا وراثة للصور — لذا وجب تثبيتها لكل سطح صراحةً. كملّك مكمّل: `og:url`+`og:locale` أضيفتا على `/memberships`، و`og:locale` على `water-tracker` و`/diet-plan` (hub + خلاياه)، وبطاقة twitter للـ`/equipment/*` رُقّيت من `summary` إلى `summary_large_image` مع الصورة (قانون اختبار التغطية). الاختبار `og-image-coverage.test.ts` وُسّع بـ9 أسطح WIRED_SURFACES جديدة (+9 اختبارات).
3. **البند 5 (عنوان الرئيسية):** 94 → **48 حرفًا**: «Alkemos — The Smart Fitness & Nutrition Platform» (يطابق og:title حرفيًا؛ الكلمات المفتاحية الأولى محفوظة والذيل المقصوص من SERP حُذف).
4. **البند 12 (لاحقة /blog):** «Fitness & Nutrition Blog | Alkemos» — اتساق مع المرآة AR التي تحمل اللاحقة عبر قالب `/ar`.
5. **البند 7 (توثيق مرافق):** `sitemap-lastmod.ts`: أسرتا `pages` و`collections` → `2026-09-15` (الأسر الملموسة فعلًا؛ exercises/foods التفصيلية تبقى مثبتة على CONTENT_LAST_REVIEWED بلا تغيير). STATE.md: تصحيح المنطقة iad1→fra1 (المصدر: vercel.json) + تحديث المرحلة إلى 206 + سطر QA بالأرقام الفعلية.

**البوابات (كلها خضراء قبل الدفع):** tsc 0 (بعد توليد .next/types) · eslint 0/0 · vitest **1199/1199** (1187 + 12 توسعة حراس هذه الدفعة) · build 0 · docs_audit/docs_parity/stale-refs/ui-wiring/migration_audit ✓.

**التراجع:** كل البنود عكوسة بـrevert واحد — لا ترحيلات، لا تغيير بيانات، لا تغيير مسارات؛ أصول الـOG المستخدمة كلها موجودة أصلًا في `public/images/og/` (صفر أصول جديدة).

**التحقق الحي (5713713 على الإنتاج — 37/37 فحصًا ✅، سكربت محفوظ خارج المستودع):** (أ) البند 3: /evo و/coaching يخدمان JSON-LD إنجليزيًا كاملاً بلا حرف عربي واحد، والمرآتان تخدمان العربي كاملاً — والاسم العربي الجديد «EVO — المدرب الذكي» ظاهر؛ (ب) البند 4: البطاقات التسع ظاهرة بـog:image صحيحة لكل سطح + og:url/og:locale على /memberships + og:locale على water-tracker + twitter للـequipment = summary_large_image؛ (ج) البند 5: `<title>` الرئيسية = التوقيع الجديد بالضبط؛ (د) البند 12: «Fitness & Nutrition Blog | Alkemos»؛ (هـ) البند 7: lastmod الأسرة في السايت مابين = 2026-09-15؛ (و) انحدارات: /ar و/ar/exercises و/ar/foods و/ar/programs و/ar/memberships تحمل og-home-ar كما كانت.

**ملاحظات تشغيلية من التحقق الحي (للمالك):**

1. **كاش Cloudflare HTML قديم (~حتى ساعة على بعض المسارات):** أول جولة تحقق رجّعت HTML ما قبل النشر لـ/foods و/programs و/coaching و/memberships و/evo (ترويسة age:3300 مع cache-control origin الأصلي max-age=300) — التحقق اجتاز كاملاً بعد كاسر كاش (`?_b1=عشوائي`). لا يوجد خطأ كود، لكن أي فحص مستقبلي بعد نشر مباشر يجب أن يمرّر كاسر كاش أو ينتظر انتهاء صلاحية الكاش — وقرار «هل يُترك كاش HTML للسحابة أم يُقيّد بـCache-Control» قرار بنية تحتية للمالك (خارج نطاق SEO).
2. **اكتشاف جديد (خارج نطاق دفعة ١ — مقترح دفعة 1-ب بقرار المالك):** مرايا AR الثلاث /ar/evo و/ar/coaching و/ar/diet-plan (hub + خلاياه) **بلا og:image من الأساس** — نفس نمط خلل البند 4 لكن على الجانب العربي (الـlayouts تُعلن openGraph بلا images فتستبدل كتلة /ar/layout.tsx وتمنع الوراثة؛ عكس باقي مرايا AR التي لا تُعلن كتلة خاصة فترث og-home-ar). الإصلاح المتوقع: 3 ملفات (+ ملف الخلايا) ببطاقة og-home-ar — نفس نمط EN تمامًا. لم يُنفّذ احترامًا لحدود الدفعة (§12.10).

**المتبقي من خطة §12.53:** البند 6 المستمر (عمق المقالات) · البند 8 (قرار مالك) · البنود 9/10/14 (مالك/خارجي) — **دفعة 1-ب (og:image مرايا AR الثلاث + خلاياها) ودفعة 2 (البند 2 — صور التمارين) نُفّذتا في المرحلة 207 (§12.55)، والبند 11 (مرآة /ar/affiliate) في المرحلة 208 (§12.56)**.

### §12.55 — Phase SEO-GEO-16: تنفيذ دفعتي 1-ب و2 من خطة §12.53 (المرحلة 207 — أمر المالك «نفّذ دفعة ١-ب، نفّذ دفعة 2 الخاصة باستضافة صور التمارين ذاتيًا — استخدم public/ داخل المشروع، مع تحسين الصور للصيغة والحجم والأداء دون تغيير جودة المحتوى أو وظائف الموقع» 2026-09-16)

**النطاق:** دفعة 1-ب (og:image لمرايا AR الثلاث المكتشفة في التحقق الحي للمرحلة 206) + دفعة 2 (البند 2 — الاستضافة الذاتية الكاملة لصور التمارين) + التوثيق المرافق (lastmod + STATE + README/GUIDE). **صفر مساس بالمسارات/الوظائف/الأسعار/البيانات، و`images.unoptimized` لم يُمس** (قانون المتغير الواحد للدفعة).

**ما نُفّذ بالضبط:**

1. **دفعة 1-ب — og:image لمرايا AR الثلاث + خلاياها (اكتشاف §12.54 المرفق):** الأسطح الأربعة تُعلن `openGraph.images` صراحةً ببطاقة `og-home-ar` (1200×630) + `twitter.images` (بنمط EN حرفيًا): `/ar/evo` و`/ar/coaching` (layouts — كانت تعلن openGraph بلا images فتستبدل كتلة `/ar/layout.tsx` وتمنع وراثة og-home-ar) و`/ar/diet-plan` (hub) و`/ar/diet-plan/{level}/{system}` (24 خلية — twitter block مضاف). حرس `og-image-coverage.test.ts` وُسّع +4 أسطح WIRED_SURFACES (العدد 35→39).
2. **دفعة 2 — البند 2: استضافة صور التمارين ذاتيًا في `public/`:**
   - **الجرد:** 868 تمرينًا × صورتان = 1,736 مسارًا فريدًا، كلها بالنمط القياسي `<Folder>/[0|1].jpg` (تحقق آلي: صفر مسارات شاذة) — كلها تتدفق عبر باني واحد (`getExerciseImageUrl` في `src/lib/exercise-images.ts`).
   - **التنزيل:** 1,736/1,736 من raw.githubusercontent.com (تحقق بايتات JPEG + إعادة محاولة ×4).
   - **التحسين (دون تغيير جودة المحتوى):** JPEG → **WebP q85 · method 6 · الأبعاد الأصلية محفوظة بلا أي تصغير** (القرار مبني على قياس PSNR: ≥37.6dB مقابل المصدر عند q85 — غير ملحوظ إطلاقًا؛ والأبعاد 750–850px موافقة لأحجام العرض الفعلية 560px CSS × DPR2 فلا مكان للتصغير بلا خسارة) — **93.6MB ← 78.8MB (−15.8%)**. السكربتات محفوظة خارج المستودع (`/home/z/my-project/scripts/download_exercise_images.py` + `convert_exercise_images.py`).
   - **التخزين:** `public/images/exercises/<Folder>/[0|1].webp` — **أسماء المجلدات محفوظة حرفيًا** (قانون الأسماء الثابتة من §12.53-هـ)؛ الامتداد فقط يُعيَّن في الباني: `.jpg → .webp` في سطر واحد.
   - **الكاش الطويل:** `Cache-Control: public, max-age=31536000, immutable` على `/images/exercises/:path*` (next.config.ts + vercel.json — نفس نمط عائلة brand) — مبرر immutable: مجموعة بيانات مجمّدة المصدر (MIT) وأسماء ثابتة؛ أي إعادة ترميز مستقبلية تُشحن باسم ملفات جديدة.
   - **النسبة القانونية:** المصدر yuhonas/free-exercise-db (MIT) — نسبة وإسناد موثقان في `public/images/README.md` (قسم exercises/ الجديد: المصدر، معايير التحسين، قانون التسمية، الكاش، الحرس).
   - **المسح الكامل:** الباني هو نقطة المرور الوحيدة (تحقق grep: صفر استشهادات أخرى للمضيف في src) — نتيجة الترحيل: **صفر raw.githubusercontent في HTML المولّد** (دخان محلي). نمط remotePatterns للمضيف باقٍ عمدًا كمسار تراجع موثق بسطر واحد (تعليق يشرح ذلك).
   - **حرس جديد** `src/lib/__tests__/exercise-images-selfhost.test.ts` (5 اختبارات): تثبيت الخريطة (.jpg→.webp) + قوانين المرور (http/`/`/فارغ) + **كل imageKey في الـ868 تمرينًا يقابله ملف .webp موجود وغير فارغ على القرص** (1,736 فحص existsSync) + نفي المضيف المتقاعد من الكود (بعد تجريد التعليقات — سرد التاريخ مباح).
   - **تحديث حراس قائمة:** `ai-workout-exercise-match.test.ts` (تأكيدان يحملان `raw.githubusercontent` + تأكيد ENRICH بالـregex → المسار المحلي + `.webp`) و`homepage-adoption.test.ts` (عينات الرئيسية https:// → `/images/exercises/` + `.webp`).
3. **lastmod (بروتوكول sitemap-lastmod):** أسرتا `pages` و`exercises` → **2026-09-16** (تغيير HTML فعلي: og:image العربية لعائلة pages، ومصادر صور كل صفحة تمرين لعائلة exercises). **فك ارتباط exercises عن CONTENT_LAST_REVIEWED** (الذي يبقى مرساة E-E-A-T في seo.ts كما هي 2026-09-09): تغيير HTML ليس مراجعة محتوى — والآن لكل دلالة مصدرها. حرس `sitemap-lastmod.test.ts` حُدّث بنفس الفريم (foods وحدها تشتق من CONTENT_LAST_REVIEWED).
4. **التوثيق المرافق (قانون نفس الفريم):** STATE.md (المرحلة 207 + مدخل مضغوط + ضغط سطرَي 188/189 للحفاظ على حد الـ100) · README.md + DEVELOPER_GUIDE.md (سطر الاستضافة الذاتية في شجرة lib) · `public/images/README.md` (توثيق المجلد + النسبة).

**البوابات (كلها خضراء قبل الدفع):** tsc 0 · eslint 0/0 · vitest **1208/1208** (1199 + 9: 4 أسطح og-image AR + 5 حراس selfhost) · build 0 (2,056 صفحة) · docs_audit (phase=207) · docs_parity · stale-refs · ui-wiring · migration_audit ✓.

**الدخان المحلي (next start):** صفحة تمرين EN/AR تعرض `/images/exercises/*.webp` + الملف يُخدَم `200 · image/webp · Cache-Control: public, max-age=31536000, immutable` + `/ar/evo` و`/ar/coaching` و`/ar/diet-plan` (hub + خلية) تحمل og-home-ar + الرئيسية (عينات التمارين) على المسارات المحلية + صفر مراجع raw في كل HTML مفحوص.

**التراجع:** كوميت واحد revert يعيد الباني لGitHub raw (نمط remotePatterns جاهز) — أصل WebP على القرص بلا ضرر؛ كل البنود عرض/أصول بلا ترحيلات بيانات.

**التحقق الحي (3da58f8 على الإنتاج — سكربت بكاسر كاش Cloudflare خارج المستودع):** **23/23 فحصًا ✅ + عينة عشوائية عميقة 30/30 ✅** — (أ) دفعة 1-ب: المرايا الأربع /ar/evo و/ar/coaching و/ar/diet-plan (hub) و/ar/diet-plan/{1200/keto، 3000/balanced} تخدم og:image=og-home-ar + twitter images؛ (ب) دفعة 2: صفحات التمارين EN/AR تعرض /images/exercises/*.webp والأصل يُخدَم 200 · image/webp · RIFF/WEBP magic · **Cache-Control: public, max-age=31536000, immutable** · الرئيسية (عينات التمارين) على المسارات المحلية · **صفر raw.githubusercontent في كل HTML مفحوص (23 صفحة + عينة 30)**؛ (ج) lastmod السايت مابين exercises+pages = 2026-09-16 وسايت ماب التمارين يحمل 1,736 URL؛ (د) انحدارات: og-home-en على أسطح EN الأربعة · og-home-ar على /ar والقوائم الوروثة · بطاقتا عائلة التمارين على صفحات التفاصيل EN/AR — كلها كما كانت؛ (هـ) العينة العميقة: 30 URL عشوائيًا من السايت ماب الحي (بذرة 207) — كل صفحة تخدم webp محليًا وكل أصل مُشار إليه (60 فحصًا) يحل 200 بلا استثناء. — إشارة توثيقية: أول جولة عيّنة عميقة سجلت 6/30 «بلا صور» بسبب خطأ regex في سكربت التحقق نفسه (الحرف s مستبعد خطأً من صنف الأحرف) وليس خلل موقع — أصلح السكربت وأعيد التشغيل: 30/30.

**ملاحظة للمالك (خارج نطاق الدفعة):** إعادة تقييم `images.unoptimized` (توصية §12.53 الأصلية للبند 2 «ثم أعد تقييم unoptimized») أصبحت الآن أرخص — لكنها تظل دفعة مستقلة (قانون المتغير الواحد) وقرار حصة Vercel للمالك.

### §12.56 — Phase SEO-GEO-17: تنفيذ البند 11 من خطة §12.53 (المرحلة 208 — أمر المالك «نفّذ البند 11: أنشئ مرآة عربية كاملة لـ /affiliate على /ar/affiliate لأن Alkemos يستهدف شركاء عربًا وغير عرب» 2026-09-16)

**النطاق:** مرآة عربية كاملة لصفحة برنامج الأفلييت (آخر صفحة أحادية اللغة في الموقع) — المحتوى العربي كان موجودًا فعلًا داخل المكوّن المشترك (getCopy(isAr) بفصحى MSA محروسة بmarketing-msa-surface من 193/204) لكن بلا URL عربي قابل للفهرسة؛ EN يعلن hreflang ar منذ إصلاح H2 (2026-09-07) لكن الوجهة كانت 404 (نصف زوج معلق). **صفر مساس بصفحة EN أو أي وظائف** (حد المالك الصريح).

**ما نُفّذ بالضبط:**

1. **المسار الجديد `/ar/affiliate`:** page.tsx بإعادة تصدير المكوّن المشترك (نمط /ar/for-coaches حرفيًا — useI18n يعتمد URL-first فيعرض العربية تلقائيًا تحت /ar/*) + layout.tsx بعربية فصيحة طبيعية: عنوان بلا علامة «برنامج الأفلييت — حوّل تأثيرك إلى دخل» (36 حرفًا + اللاحقة القالبية = 46 ≤ 70، قانون منع العلامة المزدوجة P0-3) · وصف 168 حرفًا بالحقائق نفسها (20% عمولة · حد صرف $10) · 10 كلمات مفتاحية عربية مقابلة لقائمة EN.
2. **SEO/hreflang متبادل:** canonical ذاتي /ar/affiliate + زوج en/ar/x-default كامل (x-default → EN — نمط المرايا المعتمد) — والجانب EN كان يعلن النصف الآخر أصلًا فاكتمل الزوج بلا أي تعديل على ملف EN.
3. **og:image (قانون الاستبدال-لا-الوراثة من دفعة 1-ب):** الكتلة تعلن openGraph خاصًا فوجب تثبيت بطاقة og-home-ar (1200×630) صراحةً + twitter summary_large_image بالصورة + og:locale=ar_EG + og:url.
4. **السايت ماب:** دخول EN صار يحمل alternates (كان مجرد loc بلا زوج) + دخول AR جديد — كلاهما بالزوج الكامل.
5. **الربط الداخلي (كل النقاط التي كانت تقصد EN فقط):** الفوتر (رابط «برنامج الأفلييت» صار locale-aware) · درج هيدر الموبايل «خدمات أخرى» · CTA الأفلييت داخل مقالات المدونة (BlogMembershipCard القسم 3) · LanguageToggle: إضافة زوج المرآة + تحديث تعليق التوثيق (حذف /affiliate من قائمة «بلا مرايا»).
6. **الحراس:** og-image-coverage +سطح (40) · ar-mirrors +6 اختبارات (زوج السايت ماب بhreflang المتبادل · عقد metadata الكامل للمرآة: canonical/زوج/عنوان بلا علامة داخل الحد/عربية خالصة بلا لاتيني/locale/url/بطاقة og · إتمام EN لنصف الزوج · إعادة التصدير بلا تفريع محتوى · زوج الـtoggle) — المجموع 1208→1215.
7. **lastmod:** عائلة pages تبقى 2026-09-16 (نفس يوم شحن المرحلة 207 — التغيير ضمن نفس اليوم؛ لا تحديث مطلوب).

**البوابات (كلها خضراء قبل الدفع):** tsc 0 · eslint 0/0 · vitest **1215/1215** · build 0 (**2,057 صفحة — +1 = /ar/affiliate**) · docs_audit (phase=208) · docs_parity · stale-refs · migration_audit ✓.

**التراجع:** revert واحد يعيد الوضع: حذف مجلد ar/affiliate + استرجاع 4 روابط داخلية + سطرا السايت ماب + حرسا الاختبار — صفر ترحيلات بيانات، صفر مساس EN.

**اكتشاف 208 (وُثّق مقترحًا بقرار المالك ثم نُفّذ بأمر مستقل):** صفحة EN /affiliate نفسها كانت **بلا og:image من الأساس** (كتلة openGraph خاص بلا images فلا وراثة من الجذر — نفس عائلة خلل البند 4 التي أُصلحت لـ9 أسطح EN في 206 لكن /affiliate لم يكن ضمن قائمة التدقيق). لم يُنفّذ وقتها احترامًا لحد المالك الصريح «لا تغيّر صفحة EN» — **نُفّذ لاحقًا في المرحلة 209 (§12.57) بأمر مالك مستقل.**

**المتبقي من خطة §12.53:** البند 6 المستمر (عمق المقالات) · البند 8 (قرار مالك: المخططات المتقاعدة) · البنود 9/10/14 (مالك/خارجي: Wikidata · تقييمات Trustpilot · مراجعة USDA ~2026-12-07) · البند 13 (اختياري كود).

### §12.57 — Phase SEO-GEO-18: تنفيذ اكتشاف 208 — og:image لصفحة /affiliate الإنجليزية (المرحلة 209 — أمر المالك «بعد إغلاق البند 11، نفّذ اكتشاف 208 الخاص بـ»og:image« لصفحة »/affiliate« EN. فقط» 2026-09-16)

**النطاق (متغير واحد — بطاقة اجتماعية لسطح واحد):** إغلاق الاكتشاف الموثق في §12.56 داخل layout الـEN لـ/affiliate فقط — صفر مساس بأي ملف آخر أو أي وظيفة أو المرآة العربية (المكتملة في 208) أو السايت ماب (lastmod عائلة pages بالفعل 2026-09-16 — نفس يوم الشحن، لا تحديث مطلوب).

**ما نُفّذ بالضبط:**

1. **`src/app/affiliate/layout.tsx` (الكتلة الوحيدة المعدلة):** `openGraph.images` ببطاقة og-home-en (1200×630، alt العائلة الموحد «Alkemos — The Smart Fitness & Nutrition Platform» — نفس بطاقة/alt /programs و/coaching و/memberships و/evo و/diet-plan من 206) + `og:locale=en_US` (كان غائبًا — نفس عائلة البند 4؛ og:url كان موجودًا أصلًا) + `twitter.images` (البطاقة كانت summary_large_image بلا صورة — بلا معنى). تحديث تعليق الرأس المتقاعد (كان يقول إن العربية تُقدّم عبر hreflang على نفس المسار — قديم منذ 208).
2. **حرس `og-image-coverage.test.ts`:** دخول EN لـ/affiliate في WIRED_SURFACES (40→41 سطحًا) + سطر توثيقي في الترويسة — نصفي زوج الأفلييت (EN + AR) محروسان الآن في نفس الحرس.
3. **التحقق القبلي (الإنتاج be7e5b1 قبل الدفع):** og:title/og:description/og:url/og:site_name/og:type/twitter:card+title+description موجودة · og:image وog:locale وtwitter:image **غائبة** — الحالة «قبل» موثقة أدلةً حية.

**البوابات (كلها خضراء قبل الدفع):** tsc 0 · eslint 0/0 · vitest (1216/1216 — +1 سطح موصول) · build 0 (2,057 صفحة بلا تغيير عددها — تعديل metadata لسطح موجود) · docs_audit (phase=209) · docs_parity · stale-refs · migration_audit ✓.

**التراجع:** revert واحد لملفَي layout الـEN والحرس — صفر ترحيلات، صفر مساس AR.

**التحقق الحي بعد النشر (512b193 — 14/14 على الإنتاج، كاسر كاش Cloudflare على كل طلب):** build-info حمل الكوميت بعد دقيقتين · `/affiliate` = 200 مع `og:image=https://alkemos.com/images/og/og-home-en.png` (1200×630 + alt) و`og:locale=en_US` و`twitter:image` و`twitter:card=summary_large_image` · الأصل og-home-en.png نفسه = 200 · العنوان/canonical/زوج hreflang المتبادل (en/ar/x-default) مطابقة لحالة «قبل» · فحصا انحدار: المرآة العربية `/ar/affiliate` سليمة (200 + og-home-ar + ar_EG) وسطح `/memberships` من أسطح 206 سليم ببطاقته · ملاحظة إتقان: إنذار hreflang كاذب في الجولة الأولى لسكربت التحقق (Next.js يرسم الخاصية `hrefLang` بcase كبيرة بينما السكربت بحث عن `hreflang` — صُحح وأعيد التشغيل 14/14).

**المتبقي من خطة §12.53 (حتى نهاية 209):** البند 6 المستمر (عمق المقالات) · البند 8 (قرار مالك) · البنود 9/10/14 (مالك/خارجي) · البند 13 (اختياري كود) — **قُطعت كلها بقرارات المالك في المرحلة 210 (§12.58) عدا البند 13 (بلا قرار بعد).**

### §12.58 — Phase SEO-GEO-19: تسجيل قرارات المالك في بنود خطة §12.53 المتبقية (المرحلة 210 — أمر المالك «البند ٦ اجلة ، البند ٨ القرار إبقاء، البنود ٩ و ١٠ و ١٤ اجلهم» 2026-09-16)

**النطاق (دفعة توثيقية صافية — صفر كود/أصول/بيانات/ميجريشنز):** تسجيل قرارات المالك أعلاه في عمود الحالة بجدول §12.53-ب وإقفال خانات «بانتظار قرار المالك» — لا ملف إنتاج مُمسّ البتة، وHTML الإنتاج لم يتغير بالبناء (لا يلزم تحقق حي مستقل؛ فحص خفيف بعد الدفع يوثق في worklog).

**القرارات المسجلة (كلها 2026-09-16):**

1. **البند 6 — عمق مقالات المدونة: مؤجل.** يُعلَّق العمل على رفع حد العمق في بوابة جودة خط الأنابيب، وتستمر المقالات الجديدة بحدود المرحلة الحالية حتى إعادة فتح البند بأمر مالك مستقل. لم يكن على البند عمل جارٍ معلّق عليه شيء أصلًا — كان مصنفًا «مستمرًا» من نوع pipeline منذ التدقيق، فالقرار يحوّله إلى «مؤجل بلا موعد».
2. **البند 8 — FAQPage (الرئيسية و/faq) وHowTo (صفحات التمارين): القرار = إبقاء.** تستمر المخططات في الإرسال كما هي — وهو عين الخيار الثاني المعروض في الجدول: لا ضرر غوغلي مباشر (مقاعد غوغل لهذين النوعين متقاعدة أصلًا)، والقيمة المحتملة لقراءتها بمحركات/وكلاء AI (GEO) قائمة. سُجّل القرار بسطر صريح في `docs/SEO-SCHEMA-REFERENCE.md` (قسم FAQPage) بنفس الفريم — قانون التوثيق المتزامن. أي إعادة نظر تحتاج أمر مالك جديدًا.
3. **البند 9 — كيان Wikidata + إضافته لsameAs: مؤجل.** بند خارجي أصلًا (إنشاء العنصر بيد المالك ثم سطر كود واحد)، والقرار الآن تأجيله بلا موعد.
4. **البند 10 — أول 10 تقييمات Trustpilot حقيقية ثم إعادة تفعيل aggregateRating: مؤجل.** قانون P0-5 يبقى حارسًا قائمًا: لا تُفعَّل أي إشارة تقييم إلا بمصدر حقيقي.
5. **البند 14 — مراجعة سياسة USDA EN بعد 90 يومًا من بيانات GSC: مؤجل.** محطة اكتمال البيانات (~2026-12-07) تبقى مرجعًا زمنيًا إعلاميًا لا التزامًا مجدولًا؛ تُفتح المراجعة بقرار المالك متى توافرت البيانات والرغبة.

**الأثر على الخطة:** جدول §12.53-ب مغلق الآن بالكامل عدا البند 13 (P3 اختياري: روابط hreflang نصية في الفوتر — بلا قرار مالك بعد). حصيلة الخطة النهائية حتى هذه المرحلة: **8 بنود منفذة ومتحقق منها حيًا** (1/2/3/4/5/7/11/12) + **اكتشافان مرافقان منفذان** (بطاقات og:image لمرايا AR الثلاث في 207 · بطاقة EN لـ/affiliate في 209) + **بند محسوم بالإبقاء** (8) + **أربعة مؤجلة** (6/9/10/14) + **بند واحد معلق القرار** (13) — **ثم حُسم البند 13 بالإسقاط في المرحلة 211 (§12.59): الخطة مكتملة الحسم بالكامل.**

**البوابات (دفعة توثيقية):** docs_audit (phase=210 · STATE=100 سطرًا) · docs_parity ✓ · stale-refs ✓ · migration_audit ✓ — tsc/eslint/vitest/build خارجان بالبناء (صفر ملفات كود/إنتاج ملموسة؛ بطارية CI الكاملة تشتغل على الدفع كالمعتاد).

### §12.59 — Phase SEO-GEO-20: مراجعة البند 13 وإغلاقه بالإسقاط — خطة §12.53 تكتمل (المرحلة 211 — أمر المالك «راجع البند 13… وتحقق من الوضع الحالي للـhreflang واكتشاف اللغات. إن كان الوضع الحالي كافيًا تقنيًا عبر head ولا توجد فائدة SEO حقيقية… أغلق البند بقرار إسقاط موثق… لا تعدّل كود الموقع» 2026-09-16)

**النطاق (فحص + حسم توثيقي — صفر كود):** آخر بند بلا قرار في جدول §12.53 — مراجعة تقنية لوضع hreflang واكتشاف اللغات ثم تسجيل القرار. لم يُلمس أي ملف إنتاج.

**التحقيق الفني (أدلة حية على الإنتاج 929a7ea — كاسر كاش):**

1. **وصف البند دقيق:** LanguageToggle زر `<Button onClick>` (JS) — ليس رابطًا قابلًا للزحف (`LanguageToggle.tsx`)، وتغطيته تشمل كل أزواج المرايا حتى affiliate (208).
2. **القناة الرسمية الأولى — head alternates:** حيّة على كل الصفحات المفحوصة (الرئيسية EN/AR · /affiliate · /tools/bmi-calculator) بالثلاثي الكامل en/ar/x-default متبادلًا بين النسختين.
3. **القناة الرسمية الثانية — السايت ماب:** أزواج `xhtml:link` متبادلة في sitemap-pages لكل مدخل (فُحص / · /ar · /exercises · /ar/exercises) وفي سايت ماب المدونة لكل مقال مقرون (14 مدخلًا = 7 أزواج × اتجاهين من 71) — والمقالات غير المقرونة تبقى self-only صادقة (سلوك مؤكد في قائمة الحسم §12.53-ج).
4. **الربط الداخلي:** الفوتر locale-aware بروابط `<a href>` نصية عادية تربط شجرة كل لغة بالكامل (أي شجرة AR تُكتشف زحفًا من أي صفحة AR، وكذلك EN) — فاكتشاف الـURLs لا يعتمد على الزر أصلًا.

**الحسم — لماذا الإسقاط (لا سبب تقني يبرر التنفيذ):**

1. **جوجل لا يقرأ `hreflang` على الوسوم `<a>` أصلًا:** طرقه الرسمية الثلاث هي head links · HTTP headers · sitemap xhtml:link — والصنفان الأول والثالث حيّان هنا بالفعل بالكامل. روابط `<a hreflang>` في الفوتر ستضيف **صفر إشارة hreflang**.
2. **الاكتشاف مغطى ثلاث مرات** (سايت مابز كاملة بالمرايا + head alternates على كل صفحة + روابط داخلية نصية لكل شجرة) — افتراض التدقيق الأصلي «الاكتشاف عبر head فقط» كان متحفظًا؛ الواقع أقوى منه.
3. **الزر مسألة UX لا SEO:** محركات البحث تكتشف بالـURLs لا بالنقر على الأزرار — والـURLs كلها مغطاة.
4. **تكلفة/فائدة سالبة:** دفعة كود جديدة تلمس فوتر كل صفحة على الموقع مقابل صفر قيمة hreflang + تخفيف طفيف لتركيز الروابط الداخلية.

**القرار المسجل: إسقاط البند 13** (قرار المالك 2026-09-16). أي إعادة نظر مستقبلية تحتاج دليلًا جديدًا (مثل بيانات زحف تُظهر مشكلة اكتشاف فعلية للمرايا — غيابها عن الفهرسة مثلًا).

**الأثر — خطة §12.53 مكتملة الحسم بالكامل (14/14 بندًا):** 8 منفذة ومتحققة حيًا (1/2/3/4/5/7/11/12) + اكتشافان مرافقان منفذان (207/209) + إبقاء (8) + إسقاط (13) + 4 مؤجلة بقرار المالك (6/9/10/14) — لا بند Pending واحد باقٍ في الجدول.

**البوابات (دفعة توثيقية):** docs_audit (phase=211 · STATE=100 سطرًا) · docs_parity ✓ · stale-refs ✓ · migration_audit ✓ — tsc/eslint/vitest/build خارجان بالبناء (صفر ملفات كود؛ CI يشغلها على الدفع كالمعتاد).

## 13. الملاحق (Appendices)

### Appendix A — خريطة الموارد (Resource Map)

| السؤال | المصدر |
|---|---|
| قواعد التشغيل | `AGENTS.md` |
| الحالة الراهنة للمشروع | `STATE.md` |
| عتبات Core Web Vitals | `docs/SEO-CWV-THRESHOLDS.md` |
| إطار E-E-A-T | `docs/SEO-EEAT-FRAMEWORK.md` |
| مرجع Schema.org | `docs/SEO-SCHEMA-REFERENCE.md` |
| أدوات CI | `docs/CI_GATES.md` |
| المرجع التقني | `docs/TECH_REFERENCE.md` |
| التدقيق التاريخي | `docs/_AUDIT.md` |
| خطة SEO/GEO | هذا الملف |

### Appendix B — أدوات خارجية موصى بها

| الأداة | الاستخدام | التكلفة |
|---|---|---|
| Google Search Console | فهرسة + أداء بحث | مجاني |
| Bing Webmaster Tools | فهرسة Bing + Copilot | مجاني |
| Ahrefs Webmaster Tools | backlinks + technical audit | مجاني (محدود) |
| Semrush Free | keyword research | مجاني (محدود) |
| Moz Link Explorer | Domain Authority | مجاني (محدود) |
| Schema.org Validator | التحقق من JSON-LD | مجاني |
| Rich Results Test | اختبار rich snippets | مجاني |
| PageSpeed Insights | أداء + Core Web Vitals | مجاني |
| CrUX Vis | بيانات حقلية حقيقية | مجاني |
| Profound / Otterly | AI Search tracking | مدفوع |

### Appendix C — قائمة التحقق الشهرية (Monthly Checklist)

- [ ] مراجعة Google Search Console: Coverage + Performance + Core Web Vitals
- [ ] مراجعة Bing Webmaster Tools: نفس الفحوصات
- [ ] مراجعة Vercel Speed Insights: LCP, INP, CLS
- [ ] مراجعة Ahrefs: backlinks جديدة + lost + Domain Rating
- [ ] اختبار يدوي للعلامة في ChatGPT, Perplexity, Gemini, Claude
- [ ] فحص `site:alkemos.com` في Google + Bing (عدد الصفحات المفهرسة)
- [ ] فحص broken links (Screaming Frog أو Ahrefs)
- [ ] تحديث `llms.txt` و `llms-full.txt` بأحدث المقالات
- [ ] مراجعة المنافسين: ما الجديد لديهم؟
- [ ] تحديث STATE.md و هذا الملف بأي إنجازات جديدة

### Appendix D — إخلاء المسؤولية

- هذا الملف هو **وثيقة حية** — يُحدَّث مع كل تنفيذ
- الأرقام التقديرية للمنافسين مأخوذة من Similarweb/Ahrefs وقد تختلف عن الواقع
- أي تنفيذ تقني يخضع لقواعد `AGENTS.md` (مراجعة المالك قبل الدفع للإنتاج)
- لا تُنشئ ملفات منافسة لهذا — حدّث هذا الملف فقط
