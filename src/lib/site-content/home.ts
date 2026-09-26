/**
 * SITE-CONTENT/HOME — the admin-editable homepage marketing copy
 * (SITE-CONTENT-281).
 *
 * SINGLE SOURCE LAW: these defaults ARE the copy that used to live
 * inline in LandingView.tsx, moved verbatim (byte-identical values,
 * including diacritics and punctuation) so the homepage-adoption
 * canaries can keep pinning them — at their new single source. The
 * homepage FAQ set here (5 hesitation-removers) stays SEPARATE from
 * the /faq page's 10-question set (static-pages.ts) exactly as before.
 *
 * SCOPE GUARD (what is deliberately NOT here):
 *   - Interactive tool labels (calculator inputs/CTA/notes, planner
 *     buttons, quota chips) — tool UX, not marketing copy.
 *   - Count-bearing eyebrows + proof-strip labels + tier feature rows
 *     + the EVO fair-use line + the refund note — every one restates a
 *     VERIFIED number or policy from its single source (memberships.ts
 *     law / refund.ts / EVO quota); editing them from a form would let
 *     the site drift from its enforced limits.
 *   - Functional auth CTAs ("Log in / Sign up" …) — tied to auth flows.
 *
 * Admin metadata (labels/hints/groups) rides the same objects — one
 * registry drives BOTH the resolver and the /admin/site-content form.
 */

import {
  applySiteTokens,
  localeValue,
  pickFaqOverride,
  pickTextOverride,
  type SiteCopyMap,
  type SiteFaqItem,
} from "./core";

export type { SiteCopyMap, SiteFaqItem };

export type HomeCopy = {
  heroTitle: string;
  heroSubtitle: string;
  heroPillTraining: string;
  heroPillNutrition: string;
  heroPillPlanning: string;
  heroNode: string;
  startEyebrow: string;
  startTitle: string;
  startBody: string;
  evoEyebrow: string;
  evoTitle: string;
  evoBody: string;
  evoDemoLabel: string;
  evoDemoUser: string;
  evoDemoEvo: string;
  evoContinueCta: string;
  planEyebrow: string;
  planTitle: string;
  planBody: string;
  planAllowance: string;
  planAllowanceChip: string;
  libraryTitle: string;
  libraryBody: string;
  eatTitle: string;
  eatBody: string;
  eatCta: string;
  trainEyebrow: string;
  trainTitle: string;
  trainBody: string;
  trainCta: string;
  dietTitle: string;
  dietBody: string;
  dietCta: string;
  learnTitle: string;
  learnCta: string;
  membershipsEyebrow: string;
  membershipsTitle: string;
  membershipsBody: string;
  coachingTitle: string;
  coachingBody: string;
  coachingCta: string;
  coachesTitle: string;
  coachesBody: string;
  faqEyebrow: string;
  faqTitle: string;
};

export type HomeTextField = {
  prop: keyof HomeCopy;
  key: string;
  multiline?: boolean;
  labelEn: string;
  labelAr: string;
  hintEn?: string;
  hintAr?: string;
  defaultEn: string;
  defaultAr: string;
};

export type HomeCopyGroup = {
  key: string;
  labelEn: string;
  labelAr: string;
  fields: HomeTextField[];
};

export const HOME_COPY_GROUPS: HomeCopyGroup[] = [
  {
    key: "home.hero",
    labelEn: "Hero",
    labelAr: "المقدمة (Hero)",
    fields: [
      {
        prop: "heroTitle",
        key: "home.hero.title",
        labelEn: "Headline (H1)",
        labelAr: "العنوان الرئيسي (H1)",
        defaultEn: "Train smarter. Eat with precision.",
        defaultAr: "تدرّب بذكاء. وتغذَّ بدقة.",
      },
      {
        prop: "heroSubtitle",
        key: "home.hero.subtitle",
        multiline: true,
        labelEn: "Subtitle paragraph",
        labelAr: "الفقرة التمهيدية",
        defaultEn:
          "The all-in-one platform for your workouts, nutrition, and exact macro targets — powered by EVO, your 24/7 AI coach. Try it right on this page, in Arabic and English.",
        defaultAr:
          "منصة متكاملة تجمع تمارينك، وتغذيتك، وحساب سعراتك بدقة — ومعها EVO، مدربك بالذكاء الاصطناعي لمساعدتك وتعديل خطتك باستمرار. جرّبها الآن في هذه الصفحة، بالعربية والإنجليزية.",
      },
      {
        prop: "heroPillTraining",
        key: "home.hero.pill.training",
        labelEn: "Pillar chip 1",
        labelAr: "رقيق الأعمدة 1",
        defaultEn: "Training",
        defaultAr: "التدريب",
      },
      {
        prop: "heroPillNutrition",
        key: "home.hero.pill.nutrition",
        labelEn: "Pillar chip 2",
        labelAr: "رقيق الأعمدة 2",
        defaultEn: "Nutrition",
        defaultAr: "التغذية",
      },
      {
        prop: "heroPillPlanning",
        key: "home.hero.pill.planning",
        labelEn: "Pillar chip 3",
        labelAr: "رقيق الأعمدة 3",
        defaultEn: "Smart Planning",
        defaultAr: "التخطيط الذكي",
      },
      {
        prop: "heroNode",
        key: "home.hero.node",
        labelEn: "Convergence node label",
        labelAr: "تسمية عقدة التقارب",
        defaultEn: "ONE PLATFORM",
        defaultAr: "منصة واحدة",
      },
    ],
  },
  {
    key: "home.start",
    labelEn: "Calculator section (#start)",
    labelAr: "قسم الحاسبة (#start)",
    fields: [
      {
        prop: "startEyebrow",
        key: "home.start.eyebrow",
        labelEn: "Section eyebrow chip",
        labelAr: "شريحة العنوان الصغير",
        defaultEn: "THE CALORIE & MACRO CALCULATOR",
        defaultAr: "حاسبة السعرات والماكروز",
      },
      {
        prop: "startTitle",
        key: "home.start.title",
        labelEn: "Section heading",
        labelAr: "عنوان القسم",
        defaultEn: "Know your numbers before anything else.",
        defaultAr: "اعرف أرقامك قبل أي خطوة.",
      },
      {
        prop: "startBody",
        key: "home.start.body",
        multiline: true,
        labelEn: "Section paragraph",
        labelAr: "فقرة القسم",
        defaultEn:
          "Calculate your exact daily calories and macro split tailored to your goal — using the platform's own validated formulas, free with no signup.",
        defaultAr:
          "احسب سعراتك اليومية وتوزيع الماكروز المثالي لهدفك بدقة — بنفس معادلات المنصة المعتمدة علمياً، ودون أي تسجيل.",
      },
    ],
  },
  {
    key: "home.evo",
    labelEn: "EVO section (#evo)",
    labelAr: "قسم EVO (#evo)",
    fields: [
      {
        prop: "evoEyebrow",
        key: "home.evo.eyebrow",
        labelEn: "Section eyebrow chip",
        labelAr: "شريحة العنوان الصغير",
        defaultEn: "EVO — YOUR AI COACH",
        defaultAr: "EVO — مدربك الذكي داخل المنصة",
      },
      {
        prop: "evoTitle",
        key: "home.evo.title",
        labelEn: "Section heading",
        labelAr: "عنوان القسم",
        defaultEn: "Talk to EVO — in Arabic or English.",
        defaultAr: "تحدّث مع EVO — بالعربية أو الإنجليزية.",
      },
      {
        prop: "evoBody",
        key: "home.evo.body",
        multiline: true,
        labelEn: "Section paragraph",
        labelAr: "فقرة القسم",
        defaultEn:
          "Understands your fitness goals, delivers clear numbers, and tailors your plan with smart swaps suited to your lifestyle — the bubble at the bottom of this page opens the real chat now.",
        defaultAr:
          "يفهم هدفك الرياضي، ويجيبك بأرقام وحلول عملية، ثم يبني خطتك ويعدّلها ببدائل ذكية تناسب نمط حياتك — والفقاعة أسفل الصفحة تفتح المحادثة الحقيقية الآن.",
      },
      {
        prop: "evoDemoLabel",
        key: "home.evo.demoLabel",
        labelEn: "Demo label chip",
        labelAr: "شريحة تسمية المحادثة",
        hintEn: "Must keep saying the demo is illustrative (honesty law).",
        hintAr: "يجب أن تظل توضح أن المحادثة نموذج توضيحي (قانون الصدق).",
        defaultEn: "AN ILLUSTRATIVE EXCHANGE",
        defaultAr: "نموذج توضيحي لمحادثة",
      },
      {
        prop: "evoDemoUser",
        key: "home.evo.demoUser",
        multiline: true,
        labelEn: "Demo — visitor message",
        labelAr: "المحادثة — رسالة الزائر",
        defaultEn: "I want to lose fat without losing muscle. What works for tonight's dinner?",
        defaultAr: "هدفي خسارة الدهون مع الحفاظ على العضلات. ما الذي يصلح لعشائي الليلة؟",
      },
      {
        prop: "evoDemoEvo",
        key: "home.evo.demoEvo",
        multiline: true,
        labelEn: "Demo — EVO answer",
        labelAr: "المحادثة — رد EVO",
        defaultEn:
          "A meal that fits your goal: 200 g grilled chicken breast with 150 g rice and a green salad — roughly 520 kcal and 52 g protein. Tell me your weight and training days and I'll build your whole week.",
        defaultAr:
          "وجبة تناسب هدفك: 200 جرام صدر دجاج مشوي مع 150 جرام أرز وسلطة خضراء — نحو 520 سعرة و52 جرام بروتين. أخبرني بوزنك وأيام تدريبك وسأبني لك خطة الأسبوع كاملة.",
      },
      {
        prop: "evoContinueCta",
        key: "home.evo.continueCta",
        labelEn: "Chat CTA button",
        labelAr: "زر متابعة المحادثة",
        defaultEn: "Continue this conversation",
        defaultAr: "أكمل المحادثة مع EVO",
      },
    ],
  },
  {
    key: "home.plan",
    labelEn: "Smart planning section (#plan)",
    labelAr: "قسم التخطيط الذكي (#plan)",
    fields: [
      {
        prop: "planEyebrow",
        key: "home.plan.eyebrow",
        labelEn: "Section eyebrow chip",
        labelAr: "شريحة العنوان الصغير",
        defaultEn: "SMART PLANNING",
        defaultAr: "التخطيط الذكي",
      },
      {
        prop: "planTitle",
        key: "home.plan.title",
        labelEn: "Section heading",
        labelAr: "عنوان القسم",
        defaultEn: "Your plan is built right here.",
        defaultAr: "خطتك تُبنى هنا — فعلًا.",
      },
      {
        prop: "planBody",
        key: "home.plan.body",
        multiline: true,
        labelEn: "Section paragraph",
        labelAr: "فقرة القسم",
        defaultEn:
          "Set your choices and hit generate — a full plan (exercises and sets, or meals in grams) is created right on this page by the same engine as the tools.",
        defaultAr:
          "حدّد اختياراتك واضغط زر الإنشاء — خطة كاملة بالتمارين والمجموعات أو بالوجبات والغرامات تتولّد هنا في الصفحة، بنفس محرك الأدوات.",
      },
      {
        prop: "planAllowance",
        key: "home.plan.allowance",
        multiline: true,
        labelEn: "Free-allowance bar text",
        labelAr: "نص شريط الرصيد المجاني",
        defaultEn: "Every visitor carries a free monthly plan allowance — no signup.",
        defaultAr: "كل زائر يملك رصيدًا شهريًا مجانيًا لتوليد الخطط — دون تسجيل.",
      },
      {
        prop: "planAllowanceChip",
        key: "home.plan.allowanceChip",
        labelEn: "Free-allowance chip",
        labelAr: "شريحة الرصيد",
        defaultEn: "REAL IN-PAGE GENERATION",
        defaultAr: "توليد حقيقي داخل الصفحة",
      },
    ],
  },
  {
    key: "home.library",
    labelEn: "Exercise library section (#library)",
    labelAr: "قسم مكتبة التمارين (#library)",
    fields: [
      {
        prop: "libraryTitle",
        key: "home.library.title",
        labelEn: "Section heading",
        labelAr: "عنوان القسم",
        defaultEn: "The exercise library",
        defaultAr: "مكتبة التمارين",
      },
      {
        prop: "libraryBody",
        key: "home.library.body",
        multiline: true,
        labelEn: "Section paragraph",
        labelAr: "فقرة القسم",
        defaultEn:
          "An interactive slice of the library — pick a muscle group to explore targeted exercises with proper form photos and technique cues.",
        defaultAr:
          "عينة تفاعلية من المكتبة — اختر مجموعة عضلية واستكشف التمارين الموجهة المشروحة بصور الأداء الصحيح لتفادي الإصابات.",
      },
    ],
  },
  {
    key: "home.eat",
    labelEn: "Food database section (#eat)",
    labelAr: "قسم قاعدة الأطعمة (#eat)",
    fields: [
      {
        prop: "eatTitle",
        key: "home.eat.title",
        labelEn: "Section heading",
        labelAr: "عنوان القسم",
        defaultEn: "Know your plate's numbers before you eat it.",
        defaultAr: "اعرف أرقام طبقك قبل أن تأكله.",
      },
      {
        prop: "eatBody",
        key: "home.eat.body",
        multiline: true,
        labelEn: "Section paragraph",
        labelAr: "فقرة القسم",
        defaultEn:
          "Accurate calories, protein, carbs, and fat for every 100 g across regional and global staples — pick a food and watch its numbers move.",
        defaultAr:
          "سعرات وبروتين وكربوهيدرات ودهون لكل 100 جرام تشمل المطبخ العربي والعالمي — اختر صنفًا من القاعدة وشاهد أرقامه تتحرك.",
      },
      {
        prop: "eatCta",
        key: "home.eat.cta",
        labelEn: "Section CTA button",
        labelAr: "زر الدعوة للإجراء",
        defaultEn: "Explore the food database",
        defaultAr: "استكشف قاعدة الأطعمة",
      },
    ],
  },
  {
    key: "home.train",
    labelEn: "Ready-made programs section (#train)",
    labelAr: "قسم البرامج الجاهزة (#train)",
    fields: [
      {
        prop: "trainEyebrow",
        key: "home.train.eyebrow",
        labelEn: "Section eyebrow chip",
        labelAr: "شريحة العنوان الصغير",
        defaultEn: "READY-MADE PROGRAMS",
        defaultAr: "برامج جاهزة",
      },
      {
        prop: "trainTitle",
        key: "home.train.title",
        labelEn: "Section heading",
        labelAr: "عنوان القسم",
        defaultEn: "Ready-made training programs",
        defaultAr: "برامج التمارين الجاهزة",
      },
      {
        prop: "trainBody",
        key: "home.train.body",
        multiline: true,
        labelEn: "Section paragraph",
        labelAr: "فقرة القسم",
        defaultEn:
          "Structured workout routines with schedules, exercises, sets, and reps — follow one as-is, or make it your starting point and adapt it to your gear.",
        defaultAr:
          "برامج تدريبية متكاملة بالجداول والتمارين والمجموعات والتكرارات — اتبعها كما هي، أو اجعلها نقطة انطلاق وعدّلها بحسب وقتك ومعداتك.",
      },
      {
        prop: "trainCta",
        key: "home.train.cta",
        labelEn: "Section CTA button",
        labelAr: "زر الدعوة للإجراء",
        defaultEn: "All programs",
        defaultAr: "كل البرامج",
      },
    ],
  },
  {
    key: "home.diet",
    labelEn: "Diet-plan library section (#diet)",
    labelAr: "قسم الخطط الغذائية (#diet)",
    fields: [
      {
        prop: "dietTitle",
        key: "home.diet.title",
        labelEn: "Section heading",
        labelAr: "عنوان القسم",
        defaultEn: "The ready-made diet-plan library",
        defaultAr: "مكتبة الخطط الغذائية الجاهزة",
      },
      {
        prop: "dietBody",
        key: "home.diet.body",
        multiline: true,
        labelEn: "Section paragraph",
        labelAr: "فقرة القسم",
        defaultEn:
          "Balanced diet plans with exact grams and calories per food, from real-world kitchens — from 1,200 to 3,000 kcal.",
        defaultAr:
          "أنظمة غذائية متوازنة بالغرامات والسعرات لكل صنف، من مطبخ عربي مألوف بمكونات يومية — من 1200 إلى 3000 سعرة.",
      },
      {
        prop: "dietCta",
        key: "home.diet.cta",
        labelEn: "Section CTA button",
        labelAr: "زر الدعوة للإجراء",
        defaultEn: "Open the diet-plan library",
        defaultAr: "افتح مكتبة الخطط الغذائية",
      },
    ],
  },
  {
    key: "home.learn",
    labelEn: "Blog section (#learn)",
    labelAr: "قسم المدونة (#learn)",
    fields: [
      {
        prop: "learnTitle",
        key: "home.learn.title",
        labelEn: "Section heading",
        labelAr: "عنوان القسم",
        defaultEn: "Latest Articles",
        defaultAr: "أحدث المقالات",
      },
      {
        prop: "learnCta",
        key: "home.learn.cta",
        labelEn: "Section CTA button",
        labelAr: "زر الدعوة للإجراء",
        defaultEn: "Explore the articles",
        defaultAr: "استكشف المحتوى",
      },
    ],
  },
  {
    key: "home.memberships",
    labelEn: "Memberships section (#memberships)",
    labelAr: "قسم العضويات (#memberships)",
    fields: [
      {
        prop: "membershipsEyebrow",
        key: "home.memberships.eyebrow",
        labelEn: "Section eyebrow chip",
        labelAr: "شريحة العنوان الصغير",
        defaultEn: "MEMBERSHIPS & COACHING",
        defaultAr: "العضويات والكوتشينج",
      },
      {
        prop: "membershipsTitle",
        key: "home.memberships.title",
        labelEn: "Section heading",
        labelAr: "عنوان القسم",
        defaultEn: "Premium memberships",
        defaultAr: "العضويات المميزة",
      },
      {
        prop: "membershipsBody",
        key: "home.memberships.body",
        multiline: true,
        labelEn: "Section paragraph",
        labelAr: "فقرة القسم",
        defaultEn:
          "The free tier is permanent for all core tools — upgrade only when you need higher allowances and advanced features.",
        defaultAr:
          "المستوى المجاني دائم لكافة الأدوات — والترقية اختيارية حين ترغب في سعات أوسع ومزايا متقدمة.",
      },
    ],
  },
  {
    key: "home.coaching",
    labelEn: "Online coaching band",
    labelAr: "شريط التدريب الأونلاين",
    fields: [
      {
        prop: "coachingTitle",
        key: "home.coaching.title",
        labelEn: "Band heading",
        labelAr: "عنوان الشريط",
        defaultEn: "1-on-1 Online Coaching",
        defaultAr: "التدريب الأونلاين الشخصي",
      },
      {
        prop: "coachingBody",
        key: "home.coaching.body",
        multiline: true,
        labelEn: "Band paragraph",
        labelAr: "فقرة الشريط",
        defaultEn:
          "A dedicated certified coach builds your training and nutrition plans, tracks your weekly progress, and stays in direct contact — with all Pro features included.",
        defaultAr:
          "مدرب شخصي معتمد يصمم خطتك التدريبية والغذائية، ويتابع تقدمك أسبوعياً، مع تواصل مباشر ومستمر — شاملاً جميع مزايا باقة برو.",
      },
      {
        prop: "coachingCta",
        key: "home.coaching.cta",
        labelEn: "Band CTA button",
        labelAr: "زر الدعوة للإجراء",
        defaultEn: "Explore online coaching ›",
        defaultAr: "استكشف التدريب الأونلاين ›",
      },
    ],
  },
  {
    key: "home.coaches",
    labelEn: "Featured coaches section",
    labelAr: "قسم المدربين المميزين",
    fields: [
      {
        prop: "coachesTitle",
        key: "home.coaches.title",
        labelEn: "Section heading",
        labelAr: "عنوان القسم",
        defaultEn: "Featured Coaches on Alkemos",
        defaultAr: "مدربون معتمدون على Alkemos",
      },
      {
        prop: "coachesBody",
        key: "home.coaches.body",
        multiline: true,
        labelEn: "Section paragraph",
        labelAr: "فقرة القسم",
        defaultEn:
          "Certified professional coaches ready to guide you step by step — tap any coach to visit their profile.",
        defaultAr:
          "نخبة من المدربين المحترفين المعتمدين لمتابعتك خطوة بخطوة — اضغط على أي مدرب للاطلاع على ملفه وخبراته.",
      },
    ],
  },
  {
    key: "home.faq",
    labelEn: "FAQ section (#faq)",
    labelAr: "قسم الأسئلة الشائعة (#faq)",
    fields: [
      {
        prop: "faqEyebrow",
        key: "home.faq.eyebrow",
        labelEn: "Section eyebrow chip",
        labelAr: "شريحة العنوان الصغير",
        defaultEn: "COMMON QUESTIONS",
        defaultAr: "الأسئلة الشائعة",
      },
      {
        prop: "faqTitle",
        key: "home.faq.title",
        labelEn: "Section heading",
        labelAr: "عنوان القسم",
        defaultEn: "Questions, answered.",
        defaultAr: "أسئلة قبل أن تبدأ.",
      },
    ],
  },
];

export const HOME_TEXT_FIELDS: HomeTextField[] = HOME_COPY_GROUPS.flatMap((g) => g.fields);

/** The homepage's own 5-question FAQ set (hesitation-removers). */
export const HOME_FAQ_DEFAULT: { en: SiteFaqItem[]; ar: SiteFaqItem[] } = {
  en: [
    {
      q: "Can I use Alkemos for free?",
      a: "Yes. Access is completely free — exercises, food database, routines, and smart calculators work instantly without signup. Every visitor receives a monthly allowance for AI meal and workout plans, plus daily coaching with EVO. Creating a free account syncs and saves your plans across devices.",
    },
    {
      q: "How does EVO work?",
      a: "EVO is your specialized AI fitness and nutrition coach, accessible from the bubble on every page. Ask questions, request custom workout and meal splits tailored to your stats, and make smart instant swaps for foods and exercises.",
    },
    {
      q: "Do I need a subscription?",
      a: "No subscription is required to enjoy the core platform. Memberships are completely optional, unlocking higher AI plan limits, unlimited EVO coaching conversations, full exports, and an ad-free experience.",
    },
    {
      q: "Does Alkemos suit beginners?",
      a: "Absolutely. Every movement is paired with clear visual form cues to keep you safe and injury-free, while our structured programs start from zero-equipment home basics and progress alongside you.",
    },
    {
      q: "What's the difference between a membership and online coaching?",
      a: "A membership expands your digital toolkit with unlimited EVO chat, more AI plans, and an ad-free workspace. Online coaching pairs you with a dedicated certified coach who personally designs your routine, tracks your weekly progress, and stays in direct touch — with all Pro perks included.",
    },
  ],
  ar: [
    {
      q: "هل يمكنني استخدام Alkemos مجانًا؟",
      a: "نعم. المنصة مجانية بالكامل: التمارين والأطعمة والبرامج والأدوات تعمل مباشرة ودون الحاجة لتسجيل، مع رصيد شهري لتوليد خطط التغذية والتمارين بالذكاء الاصطناعي، ومحادثات يومية مع EVO. وعند إنشاء حساب مجاني، تُحفظ خططك وتتزامن عبر جميع أجهزتك.",
    },
    {
      q: "كيف يعمل EVO؟",
      a: "EVO هو رفيقك الذكي المخصص للياقة والتغذية، تجده في أسفل كل صفحة. يمكنك استشارته في التمارين والأنظمة، أو طلب خطة مصممة خصيصاً لأهدافك وظروفك، مع تبديل ذكي وفوري لأي تمرين أو وجبة.",
    },
    {
      q: "هل أحتاج إلى اشتراك؟",
      a: "لا يلزمك أي اشتراك لاستخدام المنصة والاستفادة من ميزاتها الأساسية. العضويات اختيارية تماماً، وتمنحك سعة توليد أكبر للخطط الذكية، ومحادثات غير محدودة مع EVO، وتجربة خالية من الإعلانات.",
    },
    {
      q: "هل يناسبني Alkemos إذا كنت مبتدئًا؟",
      a: "نعم بالتأكيد. كل تمرين مزود بصور توضيحية وتعليمات الأداء الصحيح لحمايتك من الإصابات، وتوفر المنصة برامج تدريبية وتغذوية تبدأ من مستوى الصفر والتمارين المنزلية وتتطور معك تدريجياً.",
    },
    {
      q: "ما الفرق بين العضوية والتدريب الأونلاين؟",
      a: "العضوية توسّع ما تفعله داخل المنصة رقمياً: توليد خطط أكثر، ومحادثة غير محدودة مع EVO، وتصدير كامل، وتجربة بلا إعلانات. أما التدريب الأونلاين فيضيف مدربًا شخصيًا معتمدًا يصمم خططك بنفسه، ويتابع تطورك أسبوعيًا مع تواصل مباشر ومستمر — ويشمل كل مزايا برو.",
    },
  ],
};

/**
 * Resolve the full homepage copy set for the active locale. One pass,
 * typed output — LandingView reads plain properties afterwards.
 */
export function resolveHomeCopy(copy: SiteCopyMap | undefined, isAr: boolean): HomeCopy {
  const out = {} as HomeCopy;
  for (const field of HOME_TEXT_FIELDS) {
    const override = pickTextOverride(localeValue(copy?.[field.key], isAr));
    out[field.prop] = applySiteTokens(override ?? (isAr ? field.defaultAr : field.defaultEn));
  }
  return out;
}

/** Resolve the homepage FAQ items (visible accordion + JSON-LD source). */
export function resolveHomeFaq(copy: SiteCopyMap | undefined, isAr: boolean): SiteFaqItem[] {
  const override = pickFaqOverride(localeValue(copy?.["home.faq"], isAr));
  return override ?? (isAr ? HOME_FAQ_DEFAULT.ar : HOME_FAQ_DEFAULT.en);
}
