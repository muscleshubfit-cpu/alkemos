/**
 * FAQ content — single source of truth for BOTH language versions.
 *
 * FULL-SITE AUDIT + AR EXPANSION (2026-08-30): previously these arrays
 * lived inline in src/app/faq/page.tsx and fed that page's FAQPage
 * JSON-LD. With the new /ar/faq mirror (same commit) the AR page needs
 * the same data for its Arabic-first schema — so the arrays moved here
 * and both pages import them.
 */

export const FAQS_EN = [
  { q: "What is Alkemos?", a: "A human optimization platform combining the EVO AI engine with a massive exercise and food database for personalized plans and smart tracking." },
  { q: "Who is EVO?", a: "EVO is the AI performance engine. It reads your data and goal, builds personalized nutrition and workout plans, and suggests smart meal and exercise swaps. Available to everyone — visitors and members alike — with tier-based limits." },
  { q: "Is there a human coach?", a: "EVO is an AI coach. If you want human supervision, there's a separate human coaching section you can book via the coaching page." },
  { q: "How many AI plans do I get per month?", a: "One unified monthly pool covers nutrition and workout plans together: the Free tier (visitors included, no signup) gets 2 successful generations per month, Premium 4, Pro 8, and Coaching 8. Failed generations never count, and the pool resets on the 1st of each month." },
  { q: "What are swaps and how many do I get?", a: "Swaps replace individual meals or exercises within your plan — they never regenerate the whole plan. Free: none. Premium: 3 meal/exercise swaps per week. Pro: 6 per week. Coaching: 6 per week. Swaps reset every Monday." },
  { q: "Payment methods?", a: "PayPal (primary — instant and secure), InstaPay, and Vodafone Cash. PayPal processes automatically; manual methods require uploading a receipt which the team reviews within 24 hours." },
  { q: "Is my data safe?", a: "Yes — access to your data is controlled at the database level itself: only you can view your records, along with the coach assigned to you (if any) and the authorized platform team when needed for support and operations." },
  { q: "What does a free account give me?", a: "Every plan you generate is saved to your account instead of staying on one device, synced across your devices, and manageable from your plans page. You also get your dashboard with progress tracking and questionnaires. Creating the account is free." },
  { q: "Mobile friendly?", a: "Yes, fully responsive and installable as a PWA app on mobile." },
  { q: "When will I see results?", a: "Results vary by individual, consistency, starting point, and goals. Alkemos provides structured tools and guidance to help you make measurable progress over time." },
];

export const FAQS_AR = [
  { q: "ما هي منصة Alkemos؟", a: "منصة متكاملة لللياقة والتغذية تجمع بين محرك الذكاء الاصطناعي EVO وقاعدة بيانات ضخمة للتمارين والأطعمة لتقديم خطط مخصصة وتتبع ذكي لكل مستخدم." },
  { q: "ما هو EVO؟", a: "EVO هو محرك الأداء الذكي في المنصة. يقرأ بياناتك وهدفك، ويبني لك خطط تغذية وتمارين مخصصة، ويقترح تبديلات ذكية للوجبات والتمارين. متاح للجميع، للزوار والأعضاء على حد سواء، وفق حدود الاستخدام." },
  { q: "هل يوجد مدرب بشري؟", a: "EVO هو مدرب ذكاء اصطناعي. إذا كنت ترغب في متابعة بشرية مباشرة، يتوفر قسم منفصل للكوتشينج البشري يمكنك حجزه عبر صفحة الكوتشينج." },
  { q: "كم خطة بالذكاء الاصطناعي أحصل عليها شهرياً؟", a: "رصيد شهري موحد واحد يجمع خطط التغذية والتمارين معاً: الباقة المجانية (والزوار دون تسجيل) توليدان ناجحان شهرياً، وبريميوم 4، وبرو 8، وكوتشينج 8. التوليد الفاشل لا يُحتسب إطلاقاً، ويتجدد الرصيد في أول كل شهر." },
  { q: "ما هي التبديلات وكم عددها؟", a: "التبديلات تعني استبدال وجبات أو تمارين فردية داخل خطتك دون إعادة إنشاء الخطة كاملة. الباقة المجانية: لا توجد. بريميوم: 3 تبديلات للوجبات أو التمارين أسبوعيًا. برو: 6 أسبوعيًا. كوتشينج: 6 أسبوعيًا. تتجدد كل اثنين." },
  { q: "ما هي طرق الدفع المتاحة؟", a: "PayPal (الطريقة الرئيسية — فورية وآمنة)، InstaPay، و Vodafone Cash. PayPal يعالج الدفع تلقائياً؛ أما الطرق اليدوية فتتطلب رفع إيصال يقوم الفريق بمراجعته خلال 24 ساعة." },
  { q: "هل بياناتي آمنة؟", a: "نعم — الوصول إلى بياناتك محكوم على مستوى قاعدة البيانات نفسها: لا يطّلع عليها إلا أنت، والمدرب المعيّن لك إن وُجد، وفريق المنصة المصرّح له عند الحاجة للدعم والتشغيل." },
  { q: "ماذا يمنحني الحساب المجاني؟", a: "كل خطة تولّدها تُحفظ في حسابك بدلًا من البقاء على جهاز واحد، وتتزامن عبر أجهزتك، وتديرها من صفحة خططي. كما تحصل على لوحتك الخاصة بمتابعة التقدم والاستبيانات. وإنشاء الحساب مجاني." },
  { q: "هل المنصة متوافقة مع الجوال؟", a: "نعم، الموقع متجاوب بالكامل ويمكن تثبيته كتطبيق ويب تقدمي (PWA) على الجوال." },
  { q: "متى سأرى النتائج؟", a: "تختلف النتائج من شخص لآخر حسب الانتظام ونقطة البداية والأهداف. توفر Alkemos أدوات وإرشادًا منظمًا لمساعدتك على تحقيق تقدم قابل للقياس مع الوقت." },
];
