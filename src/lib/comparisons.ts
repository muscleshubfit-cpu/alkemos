/**
 * Comparison pages — SEO/GEO master plan §6.3 (Phase SEO-GEO-3, 2026-09-08).
 *
 * "Alkemos vs [Competitor]" pages target high-intent, high-commercial-value
 * queries from users actively comparing fitness platforms before they sign
 * up or pay. These queries have lower competition than head terms and
 * convert at 3–5× the rate of top-of-funnel blog traffic.
 *
 * Every comparison page ships:
 *   - Comparison table (features, prices, content depth, AI coach, languages)
 *   - Long-form review (~1500 words) with verdict
 *   - ItemList schema listing both products
 *   - Article schema (with author + reviewedBy Persons from Phase SEO-GEO-2)
 *   - Internal links to /memberships, /evo, /exercises, /foods
 *
 * Adding a new comparison:
 *   1. Append to COMPARISONS with slug + competitor data + verdict
 *   2. The page + sitemap pick it up automatically
 *   3. No code changes needed
 *
 * Data accuracy: prices and feature lists are based on public competitor
 * websites as of the "dataAsOf" date. Re-verify quarterly.
 */

export type ComparisonRow = {
  /** Feature label (bilingual) */
  labelEn: string;
  labelAr: string;
  /** Alkemos's value for this feature */
  alkemosValue: string;
  /** Competitor's value for this feature */
  competitorValue: string;
  /** "win" | "loss" | "tie" — drives the row's visual treatment */
  outcome: "win" | "loss" | "tie";
};

export type Comparison = {
  slug: string;
  competitorName: string;
  competitorNameAr: string;
  competitorUrl: string;
  dataAsOf: string; // ISO date

  titleEn: string;
  titleAr: string;
  h1En: string;
  h1Ar: string;
  introEn: string;
  introAr: string;
  descriptionEn: string;
  descriptionAr: string;

  verdictEn: string;
  verdictAr: string;

  rows: ComparisonRow[];

  /** Long-form body sections (bilingual). Each section = {heading, paragraphs[]} */
  bodyEn: Array<{ heading: string; paragraphs: string[] }>;
  bodyAr: Array<{ heading: string; paragraphs: string[] }>;
};

export const COMPARISONS: Comparison[] = [
  // ==========================================================================
  // 1. Alkemos vs MyFitnessPal
  // ==========================================================================
  {
    slug: "alkemos-vs-myfitnesspal",
    competitorName: "MyFitnessPal",
    competitorNameAr: "MyFitnessPal",
    competitorUrl: "https://www.myfitnesspal.com",
    dataAsOf: "2026-09-08",

    titleEn: "Alkemos vs MyFitnessPal — Full Comparison (2026) | Alkemos",
    titleAr: "Alkemos مقابل MyFitnessPal — مقارنة كاملة (2026) | Alkemos",
    h1En: "Alkemos vs MyFitnessPal",
    h1Ar: "Alkemos مقابل MyFitnessPal",
    introEn:
      "A head-to-head comparison between Alkemos and MyFitnessPal — two platforms that overlap on food tracking but differ sharply on coaching, exercise instruction, AI features, and pricing model. MyFitnessPal is the established calorie tracker with 350M+ users; Alkemos is a newer platform that combines food tracking with a full exercise library, workout programs, free calculators, and an AI coach. This page breaks down where each wins.",
    introAr:
      "مقارنة مباشرة بين Alkemos و MyFitnessPal — منصتان تتقاطعان في تتبّع الطعام لكن تختلفان حادّة في التدريب، شرح التمارين، ميزات الذكاء الاصطناعي، ونموذج التسعير. MyFitnessPal هو متتبّع السعرات المعروف بأكثر من 350 مليون مستخدم؛ Alkemos منصة أحدث تجمع بين تتبّع الطعام ومكتبة تمارين كاملة، برامج تدريب، حاسبات مجانية، ومدرب ذكاء اصطناعي. هذه الصفحة تُفصّل أين يتفوّق كل منهما.",
    descriptionEn:
      "Alkemos vs MyFitnessPal 2026 comparison: food tracking, exercise library, AI coach, pricing, languages, and which platform fits your goals.",
    descriptionAr:
      "مقارنة Alkemos مقابل MyFitnessPal 2026: تتبّع الطعام، مكتبة التمارين، مدرب الذكاء الاصطناعي، الأسعار، اللغات، وأي منصة تناسب أهدافك.",

    verdictEn:
      "Pick MyFitnessPal if you only want calorie tracking and already have a workout routine. Pick Alkemos if you want a complete platform — exercise instruction, workout programs, AI coaching, and food data — in one place, especially if you read Arabic.",
    verdictAr:
      "اختر MyFitnessPal إذا كنت تريد تتبّع السعرات فقط ولديك روتين تمارين بالفعل. اختر Alkemos إذا كنت تريد منصة كاملة — شرح التمارين، برامج التدريب، تدريب ذكاء اصطناعي، وبيانات أطعمة — في مكان واحد، خاصة إذا كنت تقرأ بالعربية.",

    rows: [
      {
        labelEn: "Food database size",
        labelAr: "حجم قاعدة الأطعمة",
        alkemosValue: "8,830 foods (USDA-backed + curated)",
        competitorValue: "Millions (user-contributed, varying accuracy)",
        outcome: "loss",
      },
      {
        labelEn: "Exercise library",
        labelAr: "مكتبة التمارين",
        alkemosValue: "868 exercises with step-by-step instructions",
        competitorValue: "No exercise library",
        outcome: "win",
      },
      {
        labelEn: "Workout programs",
        labelAr: "برامج التدريب",
        alkemosValue: "Ready-made programs (home & gym, all levels)",
        competitorValue: "No workout programs",
        outcome: "win",
      },
      {
        labelEn: "AI coach",
        labelAr: "مدرب الذكاء الاصطناعي",
        alkemosValue: "EVO AI — plan generation, swaps, 24/7 chat",
        competitorValue: "No AI coach (premium has basic insights)",
        outcome: "win",
      },
      {
        labelEn: "Free fitness calculators",
        labelAr: "حاسبات اللياقة المجانية",
        alkemosValue: "6 free (calorie, BMI, macro, body fat, water, meal planner)",
        competitorValue: "Premium-only calculators",
        outcome: "win",
      },
      {
        labelEn: "Arabic language support",
        labelAr: "دعم اللغة العربية",
        alkemosValue: "Full bilingual (Arabic + English) with RTL",
        competitorValue: "English-only interface",
        outcome: "win",
      },
      {
        labelEn: "Pricing (premium)",
        labelAr: "التسعير (النسخة المدفوعة)",
        alkemosValue: "$14.99/mo or $119/yr",
        competitorValue: "$19.99/mo or $79.99/yr",
        outcome: "tie",
      },
      {
        labelEn: "Barcode scanner",
        labelAr: "ماسح الباركود",
        alkemosValue: "Not available",
        competitorValue: "Yes (extensive packaged-food database)",
        outcome: "loss",
      },
      {
        labelEn: "Human coaching",
        labelAr: "التدريب البشري",
        alkemosValue: "Available ($39.99/mo) with vetted coaches",
        competitorValue: "Not available",
        outcome: "win",
      },
    ],

    bodyEn: [
      {
        heading: "Where MyFitnessPal wins",
        paragraphs: [
          "MyFitnessPal has the largest food database on the internet — millions of user-contributed entries, including restaurant meals, packaged foods, and regional brands. If your primary goal is calorie tracking and you eat a lot of packaged foods, MyFitnessPal's barcode scanner (premium feature) and 14-million-food database are unmatched. Alkemos's 8,830-food database is curated and USDA-backed for accuracy, but it cannot compete on raw count.",
          "MyFitnessPal also has a 20-year head start on mobile UX. The app is polished, syncs with every wearable (Apple Watch, Garmin, Fitbit), and has social features that Alkemos does not (friend feeds, challenges). If you want a pure tracker that integrates with your existing fitness ecosystem, MyFitnessPal remains the safer bet.",
        ],
      },
      {
        heading: "Where Alkemos wins",
        paragraphs: [
          "Alkemos wins decisively on platform breadth. MyFitnessPal is a calorie tracker — Alkemos is a complete fitness platform. The 868-exercise library with step-by-step form instructions, ready-made workout programs for every goal and equipment setup, six free fitness calculators (calorie, BMI, macro, body fat, water, meal planner), and the EVO AI coach together cover what would cost you 3–4 separate subscriptions on the MyFitnessPal model.",
          "The EVO AI coach is the single biggest differentiator. MyFitnessPal's premium tier offers 'insights' — basic charts and trends. Alkemos's EVO reads your health data, builds you a personalized nutrition and workout plan, suggests meal and exercise swaps based on your preferences, and answers fitness questions 24/7. This is closer to having a human coach than a tracker.",
          "Arabic speakers have no real choice: MyFitnessPal is English-only. Alkemos is fully bilingual with native RTL support, including Arabic exercise names, Arabic food names, and an Arabic AI coach. For the 400M+ Arabic speakers underserved by Western fitness apps, this alone is the deciding factor.",
        ],
      },
      {
        heading: "Pricing comparison",
        paragraphs: [
          "MyFitnessPal Premium is $19.99/month or $79.99/year. Alkemos Premium is $14.99/month or $119/year — slightly cheaper monthly, slightly more annually, but with dramatically more features included. Alkemos Pro ($29.99/month) doubles plan limits and removes ads; MyFitnessPal has no equivalent tier. Alkemos Coaching ($39.99/month) adds a human coach; MyFitnessPal offers no human coaching at any price.",
          "The free tier comparison is even sharper. Alkemos Free includes the full exercise library, the full food database, all six calculators, and limited EVO AI access. MyFitnessPal Free is essentially a calorie counter with ads — no macros, no insights, no barcode scanner. For users who want to evaluate the platform before paying, Alkemos Free is meaningfully more useful.",
        ],
      },
    ],
    bodyAr: [
      {
        heading: "أين يتفوّق MyFitnessPal",
        paragraphs: [
          "MyFitnessPal يملك أكبر قاعدة أطعمة على الإنترنت — ملايين المدخلات المُساهمة من المستخدمين، بما في ذلك وجبات المطاعم، الأطعمة المُعلّبة، والعلامات الإقليمية. إذا كان هدفك الأساسي تتبّع السعرات وتتناول الكثير من الأطعمة المُعلّبة، ماسح الباركود في MyFitnessPal (ميزة مدفوعة) وقاعدة الـ14 مليون طعام لا تُضاهى. قاعدة الـ8,830 طعام في Alkemos مُختارة ومستندة لـ USDA للدقّة، لكنها لا تستطيع المنافسة في العدد الصرف.",
          "MyFitnessPal أيضًا لديه سبع سنوات سبق في تجربة المستخدم للجوال. التطبيق مصقول، يتزامن مع كل ساعة ذكية (Apple Watch، Garmin، Fitbit)، وله ميزات اجتماعية لا يملكها Alkemos (تغذية الأصدقاء، التحدّيات). إذا كنت تريد متتبّعًا خالصًا يتكامل مع نظام لياقتك الحالي، MyFitnessPal يبقى الخيار الأكثر أمانًا.",
        ],
      },
      {
        heading: "أين يتفوّق Alkemos",
        paragraphs: [
          "Alkemos يتفوّق بوضوح في اتساع المنصة. MyFitnessPal متتبّع سعرات — Alkemos منصة لياقة كاملة. مكتبة الـ868 تمرينًا مع شرح خطوة بخطوة، برامج التدريب الجاهزة لكل هدف وتجهيز، ست حاسبات لياقة مجانية (سعرات، BMI، ماكروز، نسبة دهون، ماء، مخطّط وجبات)، ومدرب الذكاء الاصطناعي EVO مجتمعةً تغطّي ما كلّفك 3–4 اشتراكات منفصلة في نموذج MyFitnessPal.",
          "مدرب EVO الذكي هو الفارق الأكبر. النسخة المدفوعة من MyFitnessPal تُقدّم «رؤى» — رسوم بيانية واتجاهات أساسية. EVO في Alkemos يقرأ بياناتك الصحية، يبني لك خطة تغذية وتمارين مخصصة، يقترح تبديلات للوجبات والتمارين حسب تفضيلاتك، ويُجيب على أسئلة اللياقة 24/7. هذا أقرب لامتلاك مدرب بشري من امتلاك متتبّع.",
          "الناطقون بالعربية ليس لديهم خيار حقيقي: MyFitnessPal إنجليزي فقط. Alkemos ثنائي اللغة بالكامل مع دعم RTL أصلي، بما في ذلك أسماء التمارين بالعربية، أسماء الأطعمة بالعربية، ومدرب ذكاء اصطناعي عربي. لأكثر من 400 مليون ناطق بالعربية غير مخدومين من تطبيقات اللياقة الغربية، هذه وحدها هي العامل الحاسم.",
        ],
      },
      {
        heading: "مقارنة الأسعار",
        paragraphs: [
          "MyFitnessPal Premium بسعر $19.99/شهر أو $79.99/سنة. Alkemos Premium بسعر $14.99/شهر أو $119/سنة — أرخص قليلًا شهريًا، أغلى قليلًا سنويًا، لكن بميزات أكثر بكثير. Alkemos Pro ($29.99/شهر) يُضاعف حدود الخطط ويُزيل الإعلانات؛ MyFitnessPal لا يملك مستوى مكافئ. Alkemos Coaching ($39.99/شهر) يُضيف مدربًا بشريًا؛ MyFitnessPal لا يُقدّم تدريبًا بشريًا بأي سعر.",
          "مقارنة المستوى المجاني أوضح. Alkemos مجاني يضم مكتبة التمارين الكاملة، قاعدة الأطعمة الكاملة، كل الحاسبات الست، ووصول محدود لـ EVO. MyFitnessPal مجاني أساسًا عداد سعرات مع إعلانات — لا ماكروز، لا رؤى، لا ماسح باركود. للمستخدمين الذين يريدون تقييم المنصة قبل الدفع، Alkemos مجاني أكثر فائدة بشكل معنوي.",
        ],
      },
    ],
  },

  // ==========================================================================
  // 2. Alkemos vs Freeletics
  // ==========================================================================
  {
    slug: "alkemos-vs-freeletics",
    competitorName: "Freeletics",
    competitorNameAr: "Freeletics",
    competitorUrl: "https://www.freeletics.com",
    dataAsOf: "2026-09-08",

    titleEn: "Alkemos vs Freeletics — AI Coaching & Bodyweight Training (2026) | Alkemos",
    titleAr: "Alkemos مقابل Freeletics — تدريب الذكاء الاصطناعي وتمارين وزن الجسم (2026) | Alkemos",
    h1En: "Alkemos vs Freeletics",
    h1Ar: "Alkemos مقابل Freeletics",
    introEn:
      "Alkemos and Freeletics both offer AI-driven fitness coaching, but they target very different users. Freeletics built its reputation on bodyweight HIIT workouts for busy people; Alkemos is a broader platform covering gym training, nutrition, food tracking, and calculators alongside its AI coach. This comparison helps you pick the right one for your training style.",
    introAr:
      "Alkemos و Freeletics كلاهما يُقدّم تدريب لياقة بالذكاء الاصطناعي، لكنهما يستهدفان مستخدمين مختلفين جدًا. Freeletics بنى سمعته على تمارين HIIT بوزن الجسم للأشخاص المشغولين؛ Alkemos منصة أوسع تغطّي تدريب الجيم، التغذية، تتبّع الطعام، والحاسبات بجانب مدربه الذكي. هذه المقارنة تساعدك في اختيار المناسبة لأسلوب تدريبك.",
    descriptionEn:
      "Alkemos vs Freeletics 2026: AI coach quality, exercise variety, nutrition tracking, pricing, and which fits your training style.",
    descriptionAr:
      "Alkemos مقابل Freeletics 2026: جودة مدرب الذكاء الاصطناعي، تنوّع التمارين، تتبّع التغذية، الأسعار، وأيها يناسب أسلوب تدريبك.",

    verdictEn:
      "Pick Freeletics if you want pure bodyweight HIIT with a focus on quick, intense sessions. Pick Alkemos if you train at a gym, want nutrition + training in one platform, or read Arabic.",
    verdictAr:
      "اختر Freeletics إذا كنت تريد HIIT بوزن الجسم بتركيز على جلسات سريعة مكثّفة. اختر Alkemos إذا كنت تتدرّب في جيم، تريد التغذية + التدريب في منصة واحدة، أو تقرأ بالعربية.",

    rows: [
      {
        labelEn: "Training focus",
        labelAr: "تركيز التدريب",
        alkemosValue: "Full-spectrum (gym, home, bodyweight, equipment-based)",
        competitorValue: "Bodyweight HIIT only",
        outcome: "win",
      },
      {
        labelEn: "Exercise library size",
        labelAr: "حجم مكتبة التمارين",
        alkemosValue: "868 exercises across all equipment",
        competitorValue: "~200 bodyweight movements",
        outcome: "win",
      },
      {
        labelEn: "AI coach",
        labelAr: "مدرب الذكاء الاصطناعي",
        alkemosValue: "EVO AI — plan generation + 24/7 chat + swaps",
        competitorValue: "AI Coach (workout personalization)",
        outcome: "tie",
      },
      {
        labelEn: "Nutrition tracking",
        labelAr: "تتبّع التغذية",
        alkemosValue: "8,830-food database + AI meal planner",
        competitorValue: "Basic nutrition advice (no food tracking)",
        outcome: "win",
      },
      {
        labelEn: "Workout programs",
        labelAr: "برامج التدريب",
        alkemosValue: "Ready-made + AI-generated",
        competitorValue: "AI-generated only (no preset programs)",
        outcome: "win",
      },
      {
        labelEn: "Arabic language",
        labelAr: "اللغة العربية",
        alkemosValue: "Full Arabic + RTL",
        competitorValue: "English + 8 European languages (no Arabic)",
        outcome: "win",
      },
      {
        labelEn: "Pricing",
        labelAr: "التسعير",
        alkemosValue: "$14.99/mo Premium · $29.99/mo Pro",
        competitorValue: "~$95/yr (Standard) · ~$150/yr (Premium)",
        outcome: "win",
      },
      {
        labelEn: "Audio coaching",
        labelAr: "التدريب الصوتي",
        alkemosValue: "Not available",
        competitorValue: "Yes (motivational audio cues)",
        outcome: "loss",
      },
      {
        labelEn: "Community",
        labelAr: "المجتمع",
        alkemosValue: "Coach marketplace + affiliate program",
        competitorValue: "Large global community + challenges",
        outcome: "tie",
      },
    ],

    bodyEn: [
      {
        heading: "Where Freeletics wins",
        paragraphs: [
          "Freeletics is the gold standard for bodyweight HIIT. If you have zero equipment, 20 minutes a day, and want to sweat hard, Freeletics's AI Coach generates workouts that are genuinely tough and well-paced. The audio coaching (premium feature) calls out exercises and rep counts so you can keep your phone on the floor — a small UX touch that matters a lot during a burpee set.",
          "Freeletics also has a large, active global community with weekly challenges and leaderboards. For users motivated by social accountability, this is a real feature, not a marketing bullet. Alkemos does not yet have a comparable community surface.",
        ],
      },
      {
        heading: "Where Alkemos wins",
        paragraphs: [
          "Alkemos wins on platform breadth. Freeletics is a bodyweight-only app — if you ever want to lift a barbell, use a cable machine, or follow a structured 4-day gym split, Freeletics cannot help you. Alkemos covers every equipment type: barbell, dumbbell, cable, machine, kettlebell, band, and bodyweight. The 868-exercise library dwarfs Freeletics's ~200 movements.",
          "Nutrition is the other major gap. Freeletics offers basic nutrition advice but no food tracking — you'd need a separate app (usually MyFitnessPal) for that. Alkemos ships an 8,830-food database, six free calculators, an AI meal planner, and full macro tracking inside the same subscription. Paying for Freeletics + MyFitnessPal Premium costs more than Alkemos Pro and gives you less integration.",
          "The pricing differential is significant. Freeletics Premium is roughly $150/year; Alkemos Pro is $239/year but includes unlimited EVO AI, 8 AI plan generations/month, no ads, AND nutrition tracking. For the same training + nutrition use case, Alkemos is the better value.",
        ],
      },
    ],
    bodyAr: [
      {
        heading: "أين يتفوّق Freeletics",
        paragraphs: [
          "Freeletics هو المعيار الذهبي لتمارين HIPT بوزن الجسم. إذا كان لديك صفر معدات، 20 دقيقة يوميًا، وتريد التعرّق بقوة، مدرب Freeletics الذكي يولّد تمارين صعبة فعلًا وإيقاعها جيد. التدريب الصوتي (ميزة مدفوعة) يُنادي على التمارين وعدد التكرارات لتُبقي هاتفك على الأرض — لمسة UX صغيرة تهمّ كثيرًا خلال سلسلة بيربي.",
          "Freeletics أيضًا لديه مجتمع عالمي كبير ونشط مع تحدّيات أسبوعية ولوحات صدارة. للمستخدمين الذين يحفّزهم المساءلة الاجتماعية، هذه ميزة حقيقية وليست نقطة تسويق. Alkemos لا يملك بعد سطح مجتمع مكافئ.",
        ],
      },
      {
        heading: "أين يتفوّق Alkemos",
        paragraphs: [
          "Alkemos يتفوّق في اتساع المنصة. Freeletics تطبيق بوزن الجسم فقط — إذا أردت يومًا رفع بار، استخدام ماكينة كابل، أو اتباع تقسيم 4 أيام جيم منظّم، Freeletics لا يستطيع مساعدتك. Alkemos يغطّي كل أنواع المعدات: بار، دمبل، كابل، ماكينة، كيتل بيل، مطاط، ووزن الجسم. مكتبة الـ868 تمرين تُطغّي على الـ200 حركة تقريبًا في Freeletics.",
          "التغذية هي الفجوة الكبرى الأخرى. Freeletics يُقدّم نصائح تغذية أساسية لكن لا تتبّع للطعام — ستحتاج تطبيقًا منفصلًا (عادة MyFitnessPal) لذلك. Alkemos يُقدّم قاعدة 8,830 طعام، ست حاسبات مجانية، مخطّط وجبات بالذكاء الاصطناعي، وتتبّع ماكروز كامل داخل نفس الاشتراك. دفع Freeletics + MyFitnessPal Premium يكلّف أكثر من Alkemos Pro ويمنحك تكاملًا أقل.",
          "فارق التسعير معنوي. Freeletics Premium حوالي $150/سنة؛ Alkemos Pro $239/سنة لكنه يضم EVO غير محدود، و8 توليدات خطط AI شهريًا، بلا إعلانات، وتتبّع تغذية. لنفس حالة الاستخدام تدريب + تغذية، Alkemos قيمة أفضل.",
        ],
      },
    ],
  },

  // ==========================================================================
  // 3. Alkemos vs ExRx.net
  // ==========================================================================
  {
    slug: "alkemos-vs-exrx",
    competitorName: "ExRx.net",
    competitorNameAr: "ExRx.net",
    competitorUrl: "https://exrx.net",
    dataAsOf: "2026-09-08",

    titleEn: "Alkemos vs ExRx.net — Exercise Library Comparison (2026) | Alkemos",
    titleAr: "Alkemos مقابل ExRx.net — مقارنة مكتبة التمارين (2026) | Alkemos",
    h1En: "Alkemos vs ExRx.net",
    h1Ar: "Alkemos مقابل ExRx.net",
    introEn:
      "ExRx.net has been the internet's exercise reference since 1999 — a 2,100+ exercise database used by coaches, physical therapists, and kinesiology students worldwide. Alkemos is newer and smaller (868 exercises) but ships with a modern UI, AI coach, Arabic translations, and full workout programs. This comparison helps you choose the right tool for your use case.",
    introAr:
      "ExRx.net كان مرجع التمارين على الإنترنت منذ 1999 — قاعدة 2,100+ تمرين يستخدمها المدربون وأخصائيو العلاج الطبيعي وطلاب علم الحركة حول العالم. Alkemos أحدث وأصغر (868 تمرينًا) لكنه يأتي بواجهة حديثة، مدرب ذكاء اصطناعي، ترجمات عربية، وبرامج تمارين كاملة. هذه المقارنة تساعدك في اختيار الأداة المناسبة لحالتك.",
    descriptionEn:
      "Alkemos vs ExRx.net 2026: exercise count, UI quality, AI coach, Arabic support, pricing model, and best use case for each.",
    descriptionAr:
      "Alkemos مقابل ExRx.net 2026: عدد التمارين، جودة الواجهة، مدرب الذكاء الاصطناعي، الدعم العربي، نموذج التسعير، وأفضل حالة استخدام لكل منهما.",

    verdictEn:
      "Use ExRx.net as a free reference if you are a coach or kinesiology student. Use Alkemos if you want exercise instruction + AI coaching + nutrition + programs in one modern, bilingual platform.",
    verdictAr:
      "استخدم ExRx.net كمرجع مجاني إذا كنت مدربًا أو طالب علم حركة. استخدم Alkemos إذا كنت تريد شرح تمارين + تدريب ذكاء اصطناعي + تغذية + برامج في منصة حديثة ثنائية اللغة واحدة.",

    rows: [
      {
        labelEn: "Exercise count",
        labelAr: "عدد التمارين",
        alkemosValue: "868 exercises",
        competitorValue: "2,100+ exercises",
        outcome: "loss",
      },
      {
        labelEn: "Mobile UX",
        labelAr: "تجربة الجوال",
        alkemosValue: "Modern responsive design + PWA installable",
        competitorValue: "Legacy 1999 design, poor on mobile",
        outcome: "win",
      },
      {
        labelEn: "AI coach",
        labelAr: "مدرب الذكاء الاصطناعي",
        alkemosValue: "EVO AI — plan generation + 24/7 chat",
        competitorValue: "No AI (static reference)",
        outcome: "win",
      },
      {
        labelEn: "Arabic translations",
        labelAr: "الترجمات العربية",
        alkemosValue: "Full Arabic + RTL for every exercise",
        competitorValue: "English-only",
        outcome: "win",
      },
      {
        labelEn: "Workout programs",
        labelAr: "برامج التدريب",
        alkemosValue: "Ready-made programs + AI-generated",
        competitorValue: "Workout templates (advanced)",
        outcome: "tie",
      },
      {
        labelEn: "Nutrition database",
        labelAr: "قاعدة بيانات التغذية",
        alkemosValue: "8,830 foods + AI meal planner",
        competitorValue: "No food database",
        outcome: "win",
      },
      {
        labelEn: "Pricing",
        labelAr: "التسعير",
        alkemosValue: "Free tier + $14.99–$39.99/mo",
        competitorValue: "Free (ad-supported) + $5/mo ad-free",
        outcome: "loss",
      },
      {
        labelEn: "Kinesiology depth",
        labelAr: "عمق علم الحركة",
        alkemosValue: "Basic muscle + equipment metadata",
        competitorValue: "Deep joint articulation + muscle architecture",
        outcome: "loss",
      },
    ],

    bodyEn: [
      {
        heading: "Where ExRx.net wins",
        paragraphs: [
          "ExRx.net is unmatched as a kinesiology reference. Every exercise page documents joint articulations, primary and secondary muscle actions, and the biomechanics behind the movement. For physical therapists, kinesiology students, and strength coaches who need to understand WHY an exercise works (not just HOW to do it), ExRx.net is the gold standard and will remain so for the foreseeable future.",
          "ExRx.net is also free (ad-supported) with a $5/month ad-free option. If you only need a reference you can look up exercises on occasionally, paying nothing (or $5/month) beats any Alkemos subscription. The 2,100+ exercise count also wins on raw volume — Alkemos cannot match it today.",
        ],
      },
      {
        heading: "Where Alkemos wins",
        paragraphs: [
          "Alkemos wins on every axis except raw exercise count and kinesiology depth. The UI is modern, mobile-first, and installable as a PWA — ExRx.net's 1999 design is painful on a phone. Every exercise on Alkemos ships with Arabic translations and RTL layout; ExRx.net is English-only.",
          "Alkemos is also a complete training platform, not just a reference. The EVO AI coach builds you a personalized plan using exercises from the library, suggests swaps based on your equipment and goals, and answers your training questions 24/7. ExRx.net has workout templates, but they are static — you do the programming yourself. Alkemos also includes a full food database, free calculators, and workout programs that ExRx.net does not offer at all.",
          "For the average trainee (not a coach or PT), Alkemos is the better daily driver. Use ExRx.net as a free reference when you want to dig deeper into the biomechanics of a specific movement; use Alkemos for your actual training, nutrition, and progress tracking.",
        ],
      },
    ],
    bodyAr: [
      {
        heading: "أين يتفوّق ExRx.net",
        paragraphs: [
          "ExRx.net لا يُضاهى كمرجع لعلم الحركة. كل صفحة تمرين توثّق مفاصل العظام، تأثيرات العضلات الأساسية والثانوية، والبيوميكانيك خلف الحركة. لأخصائيي العلاج الطبيعي، طلاب علم الحركة، ومدربي القوة الذين يحتاجون فهم لماذا التمرين يعمل (وليس فقط كيف يؤدّى)، ExRx.net هو المعيار الذهبي وسيبقى كذلك للمستقبل المنظور.",
          "ExRx.net أيضًا مجاني (مدعوم بالإعلانات) مع خيار $5/شهر بدون إعلانات. إذا كنت تحتاج فقط مرجعًا تبحث فيه عن التمارين أحيانًا، عدم الدفع (أو $5/شهر) يتفوّق على أي اشتراك Alkemos. عدد التمارين 2,100+ أيضًا يفوز بالحجم الصرف — Alkemos لا يستطيع مضاهاته اليوم.",
        ],
      },
      {
        heading: "أين يتفوّق Alkemos",
        paragraphs: [
          "Alkemos يتفوّق على كل محور عدا عدد التمارين الصرف وعمق علم الحركة. الواجهة حديثة، mobile-first، وقابلة للتثبيت كـ PWA — تصميم ExRx.net من 1999 مؤلم على الهاتف. كل تمرين في Alkemos يأتي بترجمات عربية وتخطيط RTL؛ ExRx.net إنجليزي فقط.",
          "Alkemos أيضًا منصة تدريب كاملة، ليس مجرد مرجع. مدرب EVO الذكي يبني لك خطة مخصصة باستخدام تمارين من المكتبة، يقترح تبديلات حسب معداتك وأهدافك، ويُجيب على أسئلة تدريبك 24/7. ExRx.net لديه قوالب تمارين، لكنها ثابتة — أنت تبرمج بنفسك. Alkemos أيضًا يضم قاعدة أطعمة كاملة، حاسبات مجانية، وبرامج تمارين لا يُقدّمها ExRx.net إطلاقًا.",
          "للمتدرّب العادي (ليس مدربًا أو أخصائي علاج طبيعي)، Alkemos هو الأفضل للاستخدام اليومي. استخدم ExRx.net كمرجع مجاني عندما تريد التعمّق في بيوميكانيك حركة معيّنة؛ استخدم Alkemos لتدريبك الفعلي، تغذيتك، وتتبّع تقدّمك.",
        ],
      },
    ],
  },
];

export function getComparisonBySlug(slug: string): Comparison | null {
  return COMPARISONS.find((c) => c.slug === slug) ?? null;
}
