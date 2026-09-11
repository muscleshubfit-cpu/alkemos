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

**البوابات (محلياً قبل الدفع):** tsc 0 · eslint 0/0 · vitest **697/697** · next build exit 0 · docs_audit ✓ · docs_parity ✓.

**المتبقي من P0 — البند 1 (فك حظر زواحف AI):** تحقيق API مكتمل بنفس الجلسة: قراءة `GET /zones/{id}/ai-audit/robots` تنجح وتؤكد القواعد المُدارة حية، لكن **لا نقطة كتابة عامة** للميزة (AI Crawl Control = لوحة فقط وفق توثيق Cloudflare الرسمي) · لا قاعدة WAF مخصصة موجودة أصلاً (طور `http_request_firewall_custom` فارغ) — الحظر **استشاري عبر robots.txt فقط** والصفحات نفسها ترجع 200 لزواحف GPTBot/ClaudeBot (متحقق حياً). **إجراء المالك المطلوب (دقيقتان في لوحة Cloudflare):** المنطقة alkemos.com → Security → AI Crawl Control → تبويب Crawlers → للزواحف التسعة (GPTBot · ClaudeBot · CCBot · Google-Extended · Amazonbot · Applebot-Extended · Bytespider · meta-externalagent · CloudflareBrowserRenderingCrawler) اختر **Allow** من عمود Actions — أو تبويب Settings/Signals → عطّل **Managed robots.txt** بالكامل (يزيل القسم المُدار وسطر Content-Signal) · **التحقق بعد التنفيذ:** `curl -s https://alkemos.com/robots.txt | grep -c 'Disallow: /$'` يجب أن يرجع 0 (تبقى فقط قواعد المسارات الخاصة الخاصة بالمستودع).

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
