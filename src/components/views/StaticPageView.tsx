"use client";

import { useI18n } from "@/lib/i18n";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { useNav, type View } from "@/hooks/use-nav";
import { CONSENT_REOPEN_EVENT } from "@/components/CookieConsent";
// P3-10/م4 (Phase 217): the About page's library sizes derive from the
// shared count constants (client-safe slices — never the giant arrays),
// so the copy grows with the libraries instead of aging silently.
import { EXERCISES_COUNT } from "@/lib/exercises-shared";
import { FOODS_COUNT } from "@/lib/foods-shared";
import { FAQS_AR, FAQS_EN } from "@/lib/faq-content";

const EX_LIB = `${EXERCISES_COUNT.toLocaleString("en-US")}+`;
const FOOD_LIB = `${FOODS_COUNT.toLocaleString("en-US")}+`;

export function StaticPageView({ page }: { page: "about" | "privacy" | "terms" | "faq" }) {
  const { t, lang } = useI18n();
  const { navigate } = useNav();
  const isAr = lang === "ar";

  const content = getContent(page, isAr);

  /* PHASE 144 (owner directive 2026-09-08 «المعايير العالمية»):
     GDPR withdrawal-as-easy-as-giving — one click on the privacy page
     clears the stored consent record and re-opens the site-wide banner
     (CookieConsent listens for CONSENT_REOPEN_EVENT). Same ease as the
     original Accept/Reject click. */
  const reopenCookieBanner = () => {
    try {
      localStorage.removeItem("mhe_cookie_consent");
    } catch {}
    window.dispatchEvent(new Event(CONSENT_REOPEN_EVENT));
    window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
  };

  return (
    /* Phase 132 (owner feedback: «باقي الموقع إعادة التنسيق ليتبع هوية
       الصفحة الرئيسية»): static pages join the Marble & Chrome identity —
       token surfaces/text, marble-card FAQ box, chrome CTA. The old
       Apple-light palette (bg-white / #f5f5f7 / #0071e3 blue link) is
       retired. */
    <div className="flex min-h-screen flex-col bg-[var(--bg)] text-[var(--text)]">
      <SiteHeader variant="landing" />

      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-20 sm:px-6 md:py-28">
        <h1 className="text-4xl font-semibold tracking-tight md:text-6xl">{content.title}</h1>
        <p className="mt-3 text-sm font-normal text-[var(--muted-foreground)]">{content.updated}</p>

        <div className="mt-16 space-y-12">
          {content.sections.map((section, i) => (
            <section key={i}>
              <h2 className="text-xl font-semibold tracking-tight md:text-2xl">{section.heading}</h2>
              <div className="mt-4 space-y-4 text-base font-normal leading-relaxed text-[var(--muted-2)] md:text-lg">
                {section.paragraphs.map((p, j) => (
                  <p key={j}>{p}</p>
                ))}
                {section.list && (
                  <ul className="mt-4 space-y-2 ps-5">
                    {section.list.map((item, j) => (
                      <li key={j} className="list-disc">{item}</li>
                    ))}
                  </ul>
                )}
                {section.links && (
                  <div className="mt-5 flex flex-wrap gap-2">
                    {section.links.map((l, j) => (
                      <a
                        key={j}
                        href={l.href}
                        className="seal-chip transition-transform duration-300 hover:-translate-y-0.5"
                      >
                        {l.label} <span className="rtl:rotate-180" aria-hidden="true">›</span>
                      </a>
                    ))}
                  </div>
                )}
              </div>
            </section>
          ))}
        </div>

        {/* FAQ specific — marble-card + chrome CTA (identity) */}
        {page === "faq" && (
          <div className="marble-card mt-20 p-10 text-center">
            <p className="text-base font-normal text-[var(--muted-foreground)]">
              {isAr ? "لديك سؤال آخر؟" : "Have another question?"}
            </p>
            <button
              onClick={() => navigate("contact")}
              className="btn-outline mt-4 px-6 py-2.5 text-sm"
            >
              {isAr ? "تواصل معنا" : "Contact us"}
            </button>
          </div>
        )}

        {/* PHASE 144 — GDPR cookie-withdrawal CTA (privacy page only):
            clears the stored consent and re-opens the consent banner. */}
        {page === "privacy" && (
          <div className="marble-card mt-20 p-10 text-center">
            <p className="text-base font-normal text-[var(--muted-foreground)]">
              {isAr
                ? "هل تريد تغيير اختيارك لملفات تعريف الارتباط؟"
                : "Want to change your cookie choice?"}
            </p>
            <button
              onClick={reopenCookieBanner}
              className="btn-chrome mt-4 px-6 py-2.5 text-sm"
            >
              {isAr ? "إعدادات الكوكيز" : "Cookie settings"}
            </button>
          </div>
        )}
      </main>

      {/* Access-point fix (2026-09-14): the slim copyright line is replaced
          by the SHARED marble footer — about/faq/privacy/terms (+ their AR
          mirrors) now carry the same persistent link grid as the homepage,
          ending their isolation from the site's navigation. */}
      <SiteFooter />
 </div>
 );
}

function getContent(page: string, isAr: boolean) {
 const date = new Date().toLocaleDateString(isAr ? "ar-EG" : "en-US", { year: "numeric", month: "long", day: "numeric" });

 if (page === "about") {
 return isAr ? {
 title: "عن Alkemos",
 updated: `آخر تحديث: ${date}`,
 sections: [
 { heading: "من نحن", paragraphs: [`Alkemos منصة لياقة وتغذية تعمل بالعربية والإنجليزية: مكتبة تضم ${EX_LIB} تمرينًا بالشرح والصور، وقاعدة أطعمة تضم ${FOOD_LIB} صنفًا غذائيًا بالقيم الغذائية، و8 أدوات مجانية، وبرامج تدريب وخطط غذائية جاهزة، ومدرّب ذكاء اصطناعي اسمه EVO — كل ذلك في مكان واحد.`, "تأسست Alkemos على فكرة بسيطة: المستقبل ليس الإنسان في مواجهة الذكاء الاصطناعي، بل الإنسان مع الذكاء الاصطناعي. أفضل النتائج تأتي حين تلتقي خبرة المدرب مع سرعة الحساب ودقة الأرقام."] },
 { heading: "ماذا تجد على المنصة؟", paragraphs: ["يمكنك البدء مجانًا وبدون تسجيل: احسب سعراتك وماكروزك، أو تصفّح التمارين والبرامج، أو ولّد خطة تغذية أو تمرين بالذكاء الاصطناعي — والحساب المجاني يحفظ كل ما تولّده ويزامنه عبر أجهزتك."], links: [{ label: "الأدوات المجانية", href: "/ar/tools" }, { label: "مكتبة التمارين", href: "/ar/exercises" }, { label: "مكتبة الأطعمة", href: "/ar/foods" }, { label: "برامج التدريب", href: "/ar/programs" }, { label: "الخطط الغذائية الجاهزة", href: "/ar/diet-plan" }] },
 { heading: "رؤيتنا", paragraphs: ["طموحنا أن تصبح Alkemos المرجع اليومي لكل من يريد التدرّب والتغذية بأرقام واضحة في العالم العربي — بمنتج بمستوى أفضل المنصات العالمية، ومحتوى يفهم لغتنا ومطبخنا واحتياجاتنا."] },
 { heading: "المؤسس: أحمد زكي", paragraphs: ["أحمد زكي مؤسس Alkemos، ومدرب لياقة وتغذية بخبرة عملية تتجاوز عشر سنوات في تدريب العملاء أونلاين وحضوريًا. بنى المنصة ليقرّب المسافة بين دقة الخطط المحسوبة وإشراف المدرب الحقيقي، ويسدّ الفجوة بين تطبيقات اللياقة العامة والمدرب الشخصي مرتفع التكلفة.", `يشرف أحمد شخصيًا على المحتوى المنشور: من مكتبة الـ${EX_LIB} تمرينًا، إلى قاعدة الـ${FOOD_LIB} صنف غذائي بالقيم الغذائية، إلى مقالات المدونة — يمرّ كل محتوى على مراجعة للدقة قبل النشر. هكذا تعمل المنصة: قدرات الذكاء الاصطناعي، مع إشراف بشري، ومحتوى مبني على الأدلة.`] },
 { heading: "EVO — مدرّب الذكاء الاصطناعي", paragraphs: ["EVO مدرّب ذكاء اصطناعي يعرف بياناتك: يجيب عن أسئلة التدريب والتغذية من محتوى المنصة نفسها مع روابط له، ويبني خططًا مخصصة، ويقترح بدائل ذكية للوجبات والتمارين. متاح للجميع — الزوار والأعضاء على حد سواء — وفق حدود استخدام واضحة."], links: [{ label: "تعرّف على EVO", href: "/ar/evo" }] },
 { heading: "العضويات والأسعار", paragraphs: ["تعمل المنصة بنموذج بسيط: الفئة المجانية مجانية للأبد وتشمل المنتج كاملًا بحدود استخدام (محادثة EVO 10 رسائل يوميًا، وتوليدي خطة شهريًا). أما الاشتراك فيوسّع الحدود: بريميوم $14.99 شهريًا أو $119 سنويًا، وبرو $29.99 شهريًا أو $239 سنويًا، وكوتشينج $39.99 شهريًا أو $359 سنويًا يضيف مدربًا بشريًا يتابعك أسبوعيًا. كل الأسعار وحدود الاستخدام منشورة بالكامل على صفحة العضويات."], links: [{ label: "العضويات والأسعار", href: "/ar/memberships" }, { label: "الكوتشينج البشري", href: "/ar/coaching" }] },
 ],
 } : {
 title: "About Alkemos",
 updated: `Last updated: ${date}`,
 sections: [
 { heading: "Who We Are", paragraphs: [`Alkemos is a bilingual fitness and nutrition platform: an exercise library of ${EX_LIB} movements with instructions and images, a food database of ${FOOD_LIB} foods with full nutrition data, 8 free tools, ready-made workout programs and diet plans, and EVO, an AI coach that works from your numbers — all in one place.`, "The platform is built on one idea: the future isn't human vs AI — it's human + AI. The best results come from combining a coach's judgment with computation and honest data."] },
 { heading: "What You'll Find", paragraphs: ["You can start free, with no signup: calculate your calories and macros, browse exercises and programs, or generate a nutrition or workout plan with AI — and a free account saves and syncs everything you generate."], links: [{ label: "Free tools", href: "/tools" }, { label: "Exercise library", href: "/exercises" }, { label: "Food database", href: "/foods" }, { label: "Workout programs", href: "/programs" }, { label: "Diet plan library", href: "/diet-plan" }] },
 { heading: "Our Vision", paragraphs: ["Our goal is to make Alkemos the daily reference for anyone who wants to train and eat with clear numbers — a world-class product that also speaks Arabic natively, with content built for an Arab kitchen and an Arab reader."] },
 { heading: "Founder: Ahmed Zake", paragraphs: ["Ahmed Zake is the founder of Alkemos and a fitness and nutrition coach with over ten years of practical experience training clients online and in person. He built the platform to close the gap between generic fitness apps and expensive 1-on-1 coaching — combining computed precision with real accountability.", `Ahmed personally oversees the published content: from the ${EX_LIB}-exercise library, to the ${FOOD_LIB}-food nutrition database, to the blog — every piece goes through his review for accuracy before publication. That is how the platform works: AI capabilities, human oversight, evidence-aware content.`] },
 { heading: "EVO — The AI Coach", paragraphs: ["EVO is an AI coach that knows your data: it answers training and nutrition questions from the platform's own content with links, builds personalized plans, and suggests meal and exercise swaps. Available to everyone — visitors included — with clear, tier-based limits."], links: [{ label: "Meet EVO", href: "/evo" }] },
 { heading: "Memberships & Pricing", paragraphs: ["The model is simple: the Free tier is free forever and includes the full product with usage limits (EVO chat 10 messages/day, 2 plan generations per month). Subscriptions widen the limits: Premium at $14.99/mo or $119/yr, Pro at $29.99/mo or $239/yr, and Coaching at $39.99/mo or $359/yr, which adds a human coach with weekly check-ins. Every price and limit is published in full on the memberships page."], links: [{ label: "Memberships & pricing", href: "/memberships" }, { label: "Human coaching", href: "/coaching" }] },
 ],
 };
 }

 if (page === "privacy") {
 return isAr ? {
 title: "سياسة الخصوصية",
 updated: `آخر تحديث: ${date}`,
 sections: [
 { heading: "جمع البيانات", paragraphs: ["نجمع البيانات التالية عند تسجيلك: الاسم، البريد الإلكتروني، رقم الهاتف، والبيانات الصحية (الوزن، الطول، الهدف، الحساسية الغذائية)."], list: ["البيانات تُستخدم لتوليد خطط مخصصة لك", "لا نشارك بياناتك مع أي طرف ثالث", "بياناتك محفوظة بشكل مشفر على Supabase"] },
 { heading: "استخدام البيانات", paragraphs: ["بياناتك تُستخدم حصراً لـ:"], list: ["توليد خطط تغذية وتمارين مخصصة", "تتبع تقدمك وعرضه لك وللمدرب المعيّن لك", "الرد على أسئلتك عبر المساعد الذكي", "إرسال إشعارات تتعلق بحسابك"] },
 { heading: "أمان البيانات", paragraphs: ["نستخدم Supabase الذي يوفر تشفيرًا على مستوى قاعدة البيانات، مع سياسات RLS (Row Level Security) التي تُبقي بياناتك ظاهرة لك وللمدرب المعيّن لك، ويمكن لفريق المنصة المُصرّح له الوصول إليها فقط في نطاقات محدودة كالدعم والتحقق من المدفوعات."] },
 { heading: "محتوى المدربين", paragraphs: ["الصور والمحتوى الذي ينشره المدرب على صفحته العامة (بما فيه صور نتائج العملاء) يقع تحت مسؤوليته هو، ويلتزم بنشره بموافقة أصحابه. للاستفسار أو حذف أي محتوى يتعلق بك، تواصل مع مدربك مباشرة أو معنا عبر صفحة الاتصال."] },
 { heading: "حقوقك", paragraphs: ["لديك الحق في:"], list: ["طلب نسخة من بياناتك", "طلب حذف حسابك وبياناتك", "تعديل بياناتك في أي وقت من لوحة التحكم"] },
 { heading: "ملفات تعريف الارتباط (Cookies)", paragraphs: ["نستخدم أربع فئات من ملفات تعريف الارتباط. الفئة الضرورية مفعلة دائمًا لتشغيل الموقع؛ أما التحليلات والإعلانات فلا تُفعّل إلا بموافقتك الصريحة من شريط الموافقة، ويُحفظ اختيارك 365 يومًا ثم يُعاد سؤالك."], list: ["الضرورية — جلسة المصادقة والأمان (دائمًا مفعلة، لا تُعطّل)", "التفضيلات — لغتك ومظهرك المفضل", "التحليلات — قياس الاستخدام والأداء (Google Analytics)", "الإعلانات — إعلانات مخصصة (Google AdSense)", "يمكنك سحب موافقتك في أي وقت بنفس سهولة منحها — من زر «إعدادات الكوكيز» بالأسفل"] },
 { heading: "التواصل", paragraphs: ["لأي استفسار حول الخصوصية، تواصل معنا عبر صفحة الاتصال."] },
 ],
 } : {
 title: "Privacy Policy",
 updated: `Last updated: ${date}`,
 sections: [
 { heading: "Data Collection", paragraphs: ["We collect the following when you sign up: name, email, phone number, and health data (weight, height, goal, dietary allergies)."], list: ["Data is used to generate personalized plans", "We never share your data with third parties", "Data is encrypted on Supabase"] },
 { heading: "Data Usage", paragraphs: ["Your data is used exclusively for:"], list: ["Generating personalized nutrition and workout plans", "Tracking your progress (visible to you and your assigned coach)", "Answering your questions via the AI assistant", "Sending account-related notifications"] },
 { heading: "Data Security", paragraphs: ["We use Supabase which provides database-level encryption, with Row Level Security (RLS) policies that keep your data visible to you and your assigned coach — authorized platform staff can access it only in limited support and operations contexts."] },
 { heading: "Coach-Authored Content", paragraphs: ["Photos and content a coach publishes on his public page (including client results photos) are his own responsibility, published with the consent of their owners. To inquire about or remove any content concerning you, contact your coach directly or reach us via the Contact page."] },
 { heading: "Your Rights", paragraphs: ["You have the right to:"], list: ["Request a copy of your data", "Request deletion of your account and data", "Edit your data anytime from the dashboard"] },
 { heading: "Cookies", paragraphs: ["We use four cookie categories. The necessary category is always on to run the site; analytics and advertising cookies are only enabled with your explicit consent via the consent banner, and your choice is stored for 365 days before you are asked again."], list: ["Necessary — auth session & security (always on, cannot be disabled)", "Preferences — your language and theme choice", "Analytics — usage & performance measurement (Google Analytics)", "Advertising — personalized ads (Google AdSense)", "You can withdraw your consent anytime as easily as you gave it — via the “Cookie settings” button below"] },
 { heading: "Contact", paragraphs: ["For any privacy inquiries, contact us via the Contact page."] },
 ],
 };
 }

 if (page === "terms") {
 return isAr ? {
 title: "الشروط والأحكام",
 updated: `آخر تحديث: ${date}`,
 sections: [
 { heading: "قبول الشروط", paragraphs: ["باستخدامك لموقع Alkemos، فإنك توافق على هذه الشروط والأحكام. إذا لم توافق، يرجى عدم استخدام الموقع."] },
 { heading: "الاشتراك", paragraphs: ["الاشتراك في Alkemos يمنحك وصولاً إلى خطط مخصصة، مساعد ذكي، وتتبع تقدم. الأسعار موضحة في صفحة الأسعار.", "يمكنك عدم التجديد في أي وقت. لا توجد عقود ملزمة."] },
 { heading: "الخطط المخصصة", paragraphs: ["الخطط الغذائية والتدريبية مولّدة بالذكاء الاصطناعي ومراجعة من المدرب. النتائج تختلف من شخص لآخر حسب الالتزام والجينات.", "Alkemos لا يقدم نصائح طبية. استشر طبيبك قبل بدء أي برنامج غذائي أو رياضي."] },
 { heading: "تبديلات الوجبات والتمارين", paragraphs: ["التبديلات تعني استبدال وجبات أو تمارين فردية داخل خطتك دون إعادة إنشاء الخطة كاملة.", "حد التبديلات الأسبوعي يعتمد على باقتك: مجاني: لا توجد. بريميوم: 3 تبديلات للوجبات أو التمارين أسبوعيًا. برو: 6 أسبوعيًا. كوتشينج: 6 أسبوعيًا.", "التبديلات تتجدد كل اثنين."] },
 { heading: "المسؤولية", paragraphs: ["منصة Alkemos غير مسؤولة عن أي إصابة أو ضرر صحي ناتج عن اتباع البرنامج دون استشارة طبية."] },
 { heading: "مسؤولية المدربين وعملائهم", paragraphs: ["Alkemos منصة تقنية تسهّل تواصل المدربين مع عملائهم وتدير أدوات العمل فقط — والموقع ليس طرفًا في العلاقة بين المدرب وعميله.", "كل مدرب هو المسؤول الوحيد والمكتمل عن نصائحه وخططه وتوصياته وأي محتوى ينشره على صفحته العامة (بما في ذلك صوره وصور عملائه وروابطه)، وعن تحصيل مبالغ عملائه وتعاملاته معهم خارج المنصة.", "دعم العملاء مسؤولية المدرب نفسه — فريق الموقع يدعم المدربين في شؤون المنصة فقط (المحفظة، التفعيل، الإعلانات، الصفحات العامة). الموقع غير مسؤول عن أي نزاع أو مطالبة أو ضرر ينشأ بين المدرب وعميله، والمسؤولية بالكامل على كل مدرب تجاه عملائه."] },
 { heading: "الملكية الفكرية", paragraphs: ["جميع المحتويات (الخطط، المقالات، التصميم) مملوكة لـ Alkemos ولا يجوز نسخها أو إعادة استخدامها."] },
 { heading: "تعديل الشروط", paragraphs: ["نحتفظ بحق تعديل هذه الشروط في أي وقت. سيتم إشعار المستخدمين بالتغييرات الجوهرية."] },
 ],
 } : {
 title: "Terms & Conditions",
 updated: `Last updated: ${date}`,
 sections: [
 { heading: "Acceptance", paragraphs: ["By using Alkemos, you agree to these terms. If you disagree, please do not use the site."] },
 { heading: "Subscription", paragraphs: ["Subscribing to Alkemos grants access to personalized plans, AI assistant, and progress tracking. Prices are listed on the pricing page.", "You can choose not to renew at any time. No binding contracts."] },
 { heading: "Personalized Plans", paragraphs: ["Nutrition and workout plans are AI-generated and reviewed by the coach. Results vary by individual based on adherence and genetics.", "Alkemos does not provide medical advice. Consult your doctor before starting any nutrition or exercise program."] },
 { heading: "Meal & Exercise Swaps", paragraphs: ["Swaps replace individual meals or exercises within your plan — they never regenerate the whole plan.", "Weekly swap limits depend on your plan: Free: none. Premium: 3 meal/exercise swaps per week. Pro: 6 per week. Coaching: 6 per week.", "Swaps reset every Monday."] },
 { heading: "Liability", paragraphs: ["Alkemos is not liable for any injury or health damage resulting from following the program without medical consultation."] },
 { heading: "Coach & Client Responsibility", paragraphs: ["Alkemos is a technology platform that facilitates the relationship between coaches and their clients and manages the work tools — the site is not a party to the coach–client relationship.", "Each coach is the sole and full party responsible for his advice, plans, recommendations and any content he publishes on his public page (including his photos, his clients' photos and his links), and for collecting his clients' payments and his dealings with them outside the platform.", "Client support is the coach's own responsibility — the site team supports coaches on platform matters only (wallet, activation, ads, public pages). The site is not liable for any dispute, claim or damage arising between a coach and his client; responsibility rests entirely on each coach towards his clients."] },
 { heading: "Intellectual Property", paragraphs: ["All content (plans, articles, design) is owned by Alkemos and may not be copied or reused."] },
 { heading: "Changes to Terms", paragraphs: ["We reserve the right to modify these terms at any time. Users will be notified of significant changes."] },
 ],
 };
 }

 // FAQ — rendered from the SINGLE source (faq-content.ts): the visible
 // Q&As here and the FAQPage JSON-LD on /faq + /ar/faq derive from the
 // same arrays, so the two surfaces can never drift again
 // (docs/content-strategy.md §6.12).
 return {
 title: isAr ? "الأسئلة الشائعة" : "Frequently Asked Questions",
 updated: isAr ? `آخر تحديث: ${date}` : `Last updated: ${date}`,
 sections: (isAr ? FAQS_AR : FAQS_EN).map((f) => ({ heading: f.q, paragraphs: [f.a] })),
 };
}
