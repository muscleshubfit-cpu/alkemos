/**
 * src/lib/coaching-faq.ts — the /coaching FAQ, single source (EN + AR).
 *
 * CONTENT-AUDIT P1-2 (2026-09-28, audit §1.4): the coaching FAQ renders
 * inside a Radix Accordion whose closed panels are NOT in the served DOM —
 * AI crawlers that do not execute JavaScript saw 6 H3 questions and zero
 * answers (live-verified: questions at ~85KB into the body, answers
 * absent; no FAQPage JSON-LD on the page). The data now lives in this
 * server-safe module so:
 *   - the page (client) renders the accordion from the same array;
 *   - each language layout (server) emits a FAQPage JSON-LD built from
 *     it — the answers become machine-readable in the SERVER HTML, which
 *     is the surface non-JS crawlers actually read.
 *
 * Note (SEO-SCHEMA-REFERENCE, May 2026): Google retired FAQ rich results;
 * this schema is GEO-only value (AI answer engines still parse JSON-LD) —
 * exactly the audit's citation gap.
 */

export type CoachingFaqItem = { q: string; a: string };

export const COACHING_FAQ: Record<"en" | "ar", CoachingFaqItem[]> = {
  en: [
    {
      q: "What is Alkemos coaching?",
      a: "Online coaching with professional coaches and nutrition specialists. Personalized plans + EVO AI + personal follow-up.",
    },
    {
      q: "What is EVO?",
      a: "The platform's AI coach: it answers your questions, builds plans, and can save them to your plans dashboard with meal/exercise swaps.",
    },
    {
      q: "Are plans personalized?",
      a: "Yes, every plan is built from your questionnaires by a human coach, and you can request swaps anytime.",
    },
    {
      q: "Is the coach a real human?",
      a: "Yes — the Coaching plan includes a human coach who builds your plans, follows your progress weekly, makes the swaps personally, and is reachable directly through the platform.",
    },
    {
      q: "Payment methods?",
      a: "PayPal (primary), InstaPay, and Vodafone Cash.",
    },
    {
      q: "Is my data secure?",
      a: "Yes — access to your data is controlled at the database level itself: only you can view your records, along with the coach assigned to you (if any) and the authorized platform team when needed for support and operations.",
    },
  ],
  ar: [
    {
      q: "ما هو التدريب الأونلاين في Alkemos؟",
      a: "تدريب أونلاين مع مدربين وأخصائيي تغذية محترفين. خطط مخصصة + EVO AI + متابعة شخصية.",
    },
    {
      q: "ما هو EVO؟",
      a: "مدرّب الذكاء الاصطناعي في المنصة: يجيب عن أسئلتك، ويبني لك خططًا، ويستطيع حفظها في لوحة خططك مع إمكانية استبدال الوجبات والتمارين.",
    },
    {
      q: "هل الخطط مخصصة؟",
      a: "نعم، تُبنى كل خطة من استبياناتك على يد مدرب بشري، ويمكنك طلب استبدالات من خطتك في أي وقت.",
    },
    {
      q: "هل المدرب بشري فعلًا؟",
      a: "نعم — باقة التدريب الأونلاين تشمل مدربًا بشريًا يبني خططك ويتابع تقدمك أسبوعيًا ويقترح التعديلات بنفسه، وتتواصل معه مباشرة عبر المنصة.",
    },
    {
      q: "ما هي طرق الدفع؟",
      a: "PayPal (الطريقة الرئيسية)، InstaPay، و Vodafone Cash.",
    },
    {
      q: "هل بياناتي آمنة؟",
      a: "نعم — الوصول إلى بياناتك محكوم على مستوى قاعدة البيانات نفسها: لا يطّلع عليها إلا أنت، والمدرب المعيّن لك إن وُجد، وفريق المنصة المصرّح له عند الحاجة للدعم والتشغيل.",
    },
  ],
};
