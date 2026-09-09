/**
 * Equipment-hub depth content (guide + FAQ) — Phase SEO-GEO-5.2.
 * Scope: the 7 populated equipment hubs. equipment/none is empty in the
 * library (§12.14) and stays exempt — see hub-depth.ts for the contract.
 *
 * Every exercise named below is verified to exist in src/lib/exercises.ts
 * with this exact equipment assignment (anti-fabrication law).
 */

import type { HubDepthContent } from "./hub-depth";

export const EQUIPMENT_DEPTH: Record<string, HubDepthContent> = {
  barbell: {
    guideEn:
      "The barbell remains the reference tool for strength: one rigid bar means the same bar path every rep, the smallest possible load jumps between sessions, and the heaviest compound loading the human body accepts — squat, deadlift, press, row. When the goal is measurable, progressive strength, few tools compete with it.\n\n" +
      "The library's barbell family spans the classics: Barbell Squat and Barbell Deadlift for the lower body and posterior chain, Barbell Bench Press and Barbell Shoulder Press for the upper body, Bent-Over Barbell Row for the back, and Barbell Hip Thrust for the glutes — plus specialty variations (Box Squat, Close-Grip Barbell Bench Press) for lifters who need them.\n\n" +
      "Getting the most from the bar:\n" +
      "- Learn the big four with light weight first; technique debt compounds with load\n" +
      "- Progress in small increments — 2.5 kg on lower-body lifts, 1–2.5 kg on upper-body\n" +
      "- Always use a rack with safety pins when training alone\n" +
      "- Warm up with the empty bar and climb in jumps that shrink as the weight grows",
    guideAr:
      "يظل البار الأداة المرجعية للقوة: بار واحد جامد يعني مسارًا واحدًا لكل تكرار، وأصغر زيادات ممكنة بين الجلسات، وأثقل تحميل مركّب يقبلله جسم الإنسان — سكوات ورفعة ودفعة وتجديف. حين يكون الهدف قوة قابلة للقياس ومتدرجة، تقل الأدوات التي تنافسه.\n\n" +
      "تمتد عائلة البار في المكتبة على الكلاسيكيات: سكوات ورفعة ميتة للجزء السفلي والسلسلة الخلفية، وبنش وضغط كتف للعلوي، وتجديف بار للظهر، ودفع ورك للمؤخرة — مع تنويعات خاصة (سكوات صندوقي، بنش قبضة ضيقة) لمن يحتاجها.\n\n" +
      "أقصى استفادة من البار:\n" +
      "- تعلّم الأربعة الكبار بوزن خفيف أولًا؛ دَين التقنية يتراكم مع الحمل\n" +
      "- تدرّج بزيادات صغيرة — 2.5 كجم للجزء السفلي و1–2.5 كجم للعلوي\n" +
      "- استخدم دائمًا رَفّ بأعمدة أمان عند التدريب وحدك\n" +
      "- سخّن بالبار الفارغ وصعد بفجوات تضيق كلما كبر الوزن",
    faq: [
      {
        qEn: "Is barbell training good for beginners?",
        aEn:
          "Yes — with coaching or honest self-study. The barbell is actually ideal for learning because the load starts from an empty bar and grows by tiny, measurable steps, which builds technique and confidence together. Start with the empty bar for squats, presses and rows, film yourself from the side, and add weight only when the movement looks identical to the previous session.",
        qAr: "هل التدريب بالبار مناسب للمبتدئين؟",
        aAr:
          "نعم — بتوجيه أو دراسة ذاتية صادقة. البار مثالي فعلًا للتعلم لأن الحمل يبدأ من بار فارغ وينمو بخطوات صغيرة قابلة للقياس، وهذا يبني التقنية والثقة معًا. ابدأ بالبار الفارغ في السكوات والضغط والتجديف، وصوّر نفسك من الجانب، وأضف وزنًا فقط حين تبدو الحركة مطابقة لجلستك السابقة.",
      },
      {
        qEn: "Barbell or dumbbells — which builds more muscle?",
        aEn:
          "Both build muscle equally well when volume and effort match. The barbell's advantage is load: you can go heavier on squats, deadlifts and presses, which favors maximal strength. Dumbbells offer a longer range of motion, independent arms that fix side-to-side gaps, and friendlier angles for cranky joints. The strongest programs use both — barbell as the heavy primary lift, dumbbells for volume and variation.",
        qAr: "البار أم الدمبل — أيهما يبني عضلات أكثر؟",
        aAr:
          "كلاهما يبني العضلات بالتساوي حين يتساوى الحجم والجهد. ميزة البار هي الحمل: تستطيع الثقل أكثر في السكوات والرفعات والضغط، وهذا يخدم القوة القصوى. الدمبل يمنح مدى أطول وذراعين مستقلتين يصلحان الفوارق وزوايا ألطف للمفاصل الحساسة. أقوى البرامج تجمعهما — بار كرفع أساسي ثقيل ودمبل للحجم والتنويع.",
      },
      {
        qEn: "How do I stay safe training with a barbell alone?",
        aEn:
          "Three rules cover most of the risk. Train inside a power rack with safety pins set just below your bottom position. Never put collars-free or maximal bench presses outside the rack — bail sideways only as a trained last resort. And leave 1–2 reps in reserve on solo sessions: grinding a failed rep without a spotter is where injuries happen, not during controlled hard work.",
        qAr: "كيف أتدرب بالبار بأمان وحدك؟",
        aAr:
          "ثلاث قواعد تغطي أغلب الخطر. تدرّب داخل رَفّ قدرة بأعمدة أمان مثبتة أسفل وضعك الأدنى بقليل. لا تجرِ أبدًا بنشًا أقصى خارج الرَفّ — والانقباض الجانبي ملاذ أخير مدرّب عليه فقط. واترك 1–2 تكرار احتياط في الجلسات الفردية: صراع التكرار الفاشل بلا مساعد هو موضع الإصابات لا العمل المكثف المتحكَّم به.",
      },
      {
        qEn: "How fast should I add weight to the bar?",
        aEn:
          "Slower than feels impressive and faster than feels like nothing: 2.5 kg per session on lower-body lifts and 1–2.5 kg on upper-body lifts is the classic sustainable rate for beginners. When a weight stops moving weekly, switch to double progression — add reps until you own the top of the range, then add load. Months of small jumps beat weeks of big ones followed by a stall.",
        qAr: "ما سرعة زيادة الوزن على البار؟",
        aAr:
          "أبطأ مما يبدو مبهرًا وأسرع مما يبدو لا شيء: 2.5 كجم للجلسة في الجزء السفلي و1–2.5 كجم في العلوي هي السرعة الكلاسيكية المستدامة للمبتدئين. حين يتوقف وزن أسبوعيًا عن الحركة، انتقل للتدرج المزدوج — ارفع التكرارات حتى تملك أعلى المدى ثم ارفع الوزن. شهور من القفزات الصغيرة تتفوق على أسابيع من الكبيرة تليها هضبة.",
      },
      {
        qEn: "Is a barbell and rack enough for a home gym?",
        aEn:
          "A barbell, an adjustable rack, and plates cover the highest-value training per square meter available: squats, deadlifts, presses and rows from one setup. Add a bench and you hold the entire compound base of the library's barbell family. Adjustable dumbbells make a smart second purchase for isolation and unilateral work; machines can wait indefinitely.",
        qAr: "هل بار ورَفّ يكفيان لصالة منزلية؟",
        aAr:
          "بار ورَفّ قابل للتعديل وأوزان تغطي أعلى قيمة تدريب لكل متر مربع: سكوات ورفعات وضغطات وتجديف من تجهيزة واحدة. أضف مقعدًا وتمتلك القاعدة المركّبة كاملة لعائلة البار في المكتبة. الدمبل القابل للتعديل شراء ثانٍ ذكي للعزل والأحادي؛ والآلات يمكن أن تنتظر إلى ما لا نهاية.",
      },
      {
        qEn: "Why does the barbell hurt my wrists when I press?",
        aEn:
          "Usually the bar is resting on the wrong part of the hand: it should stack directly over the forearm bones, not sit back in the fingers, and the wrist stays straight rather than bent backward. Check grip width — too wide or too narrow bends the wrist sideways. Light wrist wraps can help during the transition, but they are a temporary aid; fixing bar position is the real fix.",
        qAr: "لماذا يؤلمني المعصم مع البار عند الضغط؟",
        aAr:
          "عادة البار يستقر على موضع خاطئ من اليد: يجب أن يرتكب مباشرة فوق عظام الساعد لا أن يتراجع للأصابع، ويبقى المعصم مستقيمًا لا منحنيًا للخلف. افحص عرض القبضة — الأوسع أو الأضيق من اللازم يثني المعصم جانبيًا. أربطة معصم خفيفة قد تساعد فترة انتقالية لكنها مساعدة مؤقتة؛ إصلاح موضع البار هو الحل الحقيقي.",
      },
    ],
  },

  dumbbell: {
    guideEn:
      "Dumbbells train both sides of the body independently, which quietly fixes the left-right imbalances a barbell can hide. Each arm carries its own load through a longer, more natural range of motion, stabilizers work harder, and joints can angle freely instead of following a fixed bar path. For home training they are the most versatile purchase available.\n\n" +
      "The library's 122-exercise dumbbell family covers everything: Dumbbell Bench Press and Incline Dumbbell Flyes for the chest, Arnold Dumbbell Press for shoulders, Bent-Over Two-Dumbbell Row for the back, Dumbbell Squat and Dumbbell Step-Ups for legs, and a complete curl family for the arms.\n\n" +
      "Getting the most from dumbbells:\n" +
      "- Match sides to the weaker arm — the stronger side waits and catches up\n" +
      "- Choose the next weight up when the top of your rep range feels smooth\n" +
      "- Keep wrists straight and dumbbells stacked over forearms on all presses\n" +
      "- With fixed-weight sets, progress through reps, tempo and rest before adding load",
    guideAr:
      "الدمبل يدرب جانبي الجسم باستقلال، وهذا يصلح بهدوء الفوارق بين اليمين واليسار التي يستطيع البار إخفاءها. كل ذراع تحمل وزنها عبر مدى أطول وأكثر طبيعية، والمثبتات تعمل بجهد أكبر، والمفاصل تميل بحرية بدل اتباع مسار بار ثابت. وللتدريب المنزلي هي الأكثر تنوعًا بين المشتريات المتاحة.\n\n" +
      "تغطي عائلة الدمبل في المكتبة (122 تمرينًا) كل شيء: ضغط دمبل وذبابة مائلة للصدر، وضغط أرنولد للكتف، وتجديف دمبلين للظهر، وسكوات الدمبل ودرجاته للأرجل، وعائلة ثني كاملة للذراعين.\n\n" +
      "أقصى استفادة من الدمبل:\n" +
      "- طابق الجانبين على الذراع الأضعف — الأقوى تنتظر وتلحق\n" +
      "- اختر الوزن الأعلى التالي حين يصير أعلى مدى تكراراتك سلسًا\n" +
      "- أبقِ المعصمين مستقيمين والدمبل فوق الساعد على كل الضغطات\n" +
      "- مع الأوزان الثابتة، تدرّج بالتكرارات والزمن والراحة قبل رفع الوزن",
    faq: [
      {
        qEn: "Can you build real muscle with just dumbbells?",
        aEn:
          "Yes. Muscle growth responds to mechanical tension taken close to failure, and a pair of dumbbells can deliver that for every muscle group. Research comparing free-weight and machine training shows similar hypertrophy at matched effort; the same logic applies here. The practical limit is loading for advanced lower-body strength — even there, single-leg variations extend the progression for years.",
        qAr: "هل أبني عضلات حقيقية بالدمبل فقط؟",
        aAr:
          "نعم. النمو العضلي يستجيب للشد الميكانيكي القريب من الفشل، وزوج دمبل يوفر ذلك لكل مجموعة عضلية. تشير الأبحاث المقارنة بين الأوزان الحرة والآلات إلى تكافؤ النمو عند تساوي الجهد؛ والمنطق نفسه ينطبق هنا. الحد العملي هو التحميل لقوة الجزء السفلي المتقدمة — وحتى هناك، التنويعات الأحادية تمدّ التدرج لسنوات.",
      },
      {
        qEn: "What dumbbell weight should a beginner start with?",
        aEn:
          "The weight that lets you complete 8–12 clean reps where the last two feel genuinely challenging — for most beginners that lands around 4–8 kg for upper-body moves and 8–16 kg for squats and lunges. It differs per exercise, and that is normal. Buy adjustable dumbbells or a light, medium and heavy pair rather than one \"beginner weight\" you will outgrow in a month.",
        qAr: "ما وزن الدمبل المناسب لبداية المبتدئ؟",
        aAr:
          "الوزن الذي يتيح 8–12 تكرارًا نظيفًا يصعب فيه آخر تكرارين فعلًا — ولأغلب المبتدئين يقع حول 4–8 كجم لحركات الجزء العلوي و8–16 كجم للسكوات والطعنات. يختلف الوزن من تمرين لآخر وهذا طبيعي. اشترِ دمبلًا قابلًا للتعديل أو ثلاث درجات خفيف ومتوسط وثقيل بدل «وزن مبتدئ» واحد ستتجاوزه خلال شهر.",
      },
      {
        qEn: "Why do dumbbell presses feel harder than barbell presses?",
        aEn:
          "Two honest reasons. First, each arm works alone, so the weaker side sets the pace and stabilizers fight extra to control two independent weights. Second, the range of motion is usually longer — the dumbbells can descend below chest level where a bar stops. Feeling harder at the same nominal load is not regression; it is the dumbbells asking more of the whole shoulder girdle.",
        qAr: "لماذا يبدو ضغط الدمبل أصعب من ضغط البار؟",
        aAr:
          "سببان صادقان. الأول أن كل ذراع تعمل وحدها، فالجانب الأضعف يحدد الإيقاع وتجاهد المثبتات أكثر للسيطرة على وزنين مستقلين. والثاني أن المدى عادة أطول — يمكن للدمبل النزول تحت مستوى الصدر حيث يتوقف البار. صعوبة الشعور عند الوزن الاسمي نفسه ليست تراجعًا؛ إنها الدمبل يطلب أكثر من حزام الكتف كله.",
      },
      {
        qEn: "How do I progress with fixed-weight dumbbells?",
        aEn:
          "When the next dumbbell jump is too big, progress inside the weight you have: add reps each session until you exceed your target range, slow the lowering phase to 3–4 seconds, shorten rest periods, or move to a harder variation of the same pattern. All four raise the challenge without new iron. Only when a set becomes long and grindy is it time to buy or grab the heavier pair.",
        qAr: "كيف أتدرج مع دمبل بأوزان ثابتة؟",
        aAr:
          "حين تكون قفزة الدمبل التالي كبيرة جدًا، تدرّج داخل الوزن المتاح: ارفع تكرارًا كل جلسة حتى تتجاوز مدى هدفك، وأبطئ الهبوط إلى 3–4 ثوانٍ، وقصّر فترات الراحة، أو انتقل لتنويع أصعب للنمط نفسه. الأربعة ترفع التحدي بلا حديد جديد. وحين تصير المجموعة طويلة شاقة، حان وقت الوزن الأثقل.",
      },
      {
        qEn: "Are adjustable dumbbells worth buying for home?",
        aEn:
          "For most home trainees, yes — one adjustable pair replaces a wall of fixed dumbbells, covers the entire dumbbell section of the library, and costs less than the space it saves. Check the change mechanism speed (dial and selector systems are fastest), the weight ceiling, and the handle length for comfort during presses. The one trade-off is durability: treat them gently and they last for years.",
        qAr: "هل الدمبل القابل للتعديل يستحق الشراء للمنزل؟",
        aAr:
          "لأغلب متدربي المنزل، نعم — زوج قابل للتعديل يحل محل جدار من الدمبل الثابت، ويغطي قسم الدمبل كاملًا في المكتبة، ويكلف أقل من المساحة التي يوفرها. افحص سرعة آلية التغيير (أنظمة القرص والانتقاء أسرع)، والحد الأعلى للوزن، وطول المقبض للراحة أثناء الضغط. الثمن الوحيد هو المتانة: عاملها برفق وتعيش سنوات.",
      },
      {
        qEn: "Which dumbbell exercises fix muscle imbalances?",
        aEn:
          "Any unilateral movement — one arm or one leg at a time: the dumbbell family offers One-Arm Dumbbell Bench Press, single-arm shoulder presses, Concentration Curls, and single-leg work like Dumbbell Step-Ups. Always start with the weaker side, match its reps with the strong side, and never do extra sets for the strong side. Gaps close within a couple of months of consistent unilateral training.",
        qAr: "أي تمارين الدمبل تصلح عدم التوازن العضلي؟",
        aAr:
          "أي حركة أحادية — ذراع أو ساق في المرة: توفر عائلة الدمبل ضغط الدمبل أحادي الذراع، والضغطات أحادية للكتف، وثني التركيز، وعمل أحادي الساق كدرجات الدمبل. ابدأ دائمًا بالجانب الأضعف، وطابق تكراراته مع الأقوى، ولا تنفذ مجموعات إضافية للجانب القوي. الفوارق تُغلق خلال شهرين من التدريب الأحادي الثابت.",
      },
    ],
  },

  bodyweight: {
    guideEn:
      "Bodyweight training is the largest equipment family in the library for a reason: it needs zero equipment, scales from absolute beginner to advanced athlete through leverage and tempo, and trains the body as one coordinated system rather than isolated parts. Push, pull, squat, hinge, brace — every fundamental pattern has a bodyweight version.\n\n" +
      "Highlights from the 348-exercise family: Pull-Ups as the king of vertical pulling, Push-Up variations from Incline Push-Up (easier) through Decline Push-Up to Plyo Push-Up (power), Bodyweight Squat and Bodyweight Walking Lunge for legs, Plank and Ab Roller for the core, Bodyweight Mid-Row for pulling volume without a bar, and Mountain Climbers for conditioning.\n\n" +
      "How to progress without adding weight:\n" +
      "- Change the leverage: elevate the feet, move to single-arm or single-leg versions\n" +
      "- Slow the tempo: 3–4 second lowering phases make familiar moves new again\n" +
      "- Add pauses at the hardest point of the range\n" +
      "- When a set exceeds ~20 reps comfortably, it is time for the next harder variation",
    guideAr:
      "تدريب وزن الجسم أكبر عائلة معدات في المكتبة لسبب وجيه: لا يحتاج أي معدات، ويتدرج من المبتدئ تمامًا إلى الرياضي المتقدم عبر الرافعة والزمن، ويدرب الجسم كمنظوم متكاملة لا كأجزاء معزولة. دفع وسحب وسكوات ومفصلية وشدّ — لكل نمط أساسي نسخة بوزن الجسم.\n\n" +
      "أبرز عائلة الـ348 تمرينًا: العلق ملك السحب الرأسي، وتنويعات الضغط من الضغط المائل (أسهل) عبر المتدرّج إلى الانفجاري (القوة)، وسكوات وطعن متجول بوزن الجسم للأرجل، وبلانك وعجلة البطن للكور، وتجديف وسطي بوزن الجسم لحجم سحب بلا بار، ومتسلق الجبل للياقة.\n\n" +
      "كيف تتدرج بلا أوزان:\n" +
      "- غيّر الرافعة: ارفع القدمين، وانتقل لنسخ أحادية الذراع أو الساق\n" +
      "- أبطئ الزمن: هبوط 3–4 ثوانٍ يعيد جعل الحركات المألوفة جديدة\n" +
      "- أضف وقفات عند أصعب نقطة في المدى\n" +
      "- حين تتجاوز المجموعة ~20 تكرارًا بارتياح، حان وقت التنويع الأصعب التالي",
    faq: [
      {
        qEn: "Can you build muscle with bodyweight training only?",
        aEn:
          "Yes, up to a solid intermediate level. Growth requires hard sets close to failure, and bodyweight exercises provide them through leverage: an Incline Push-Up grows a beginner's chest as effectively as any press. The honest ceiling arrives for advanced lower-body strength — legs eventually need external load to keep progressing. Upper body and core can be trained with bodyweight far longer than most people assume.",
        qAr: "هل أبني عضلات بتدريب وزن الجسم فقط؟",
        aAr:
          "نعم حتى مستوى متوسط متين. النمو يطلب مجموعات صعبة قريبة من الفشل، وتمارين وزن الجسم توفرها عبر الرافعة: الضغط المائل يُنمّي صدر المبتدئ بفعالية أي دفعة. السقف الصادق يظهر في القوة المتقدمة بالجزء السفلي — الأرجل تحتاج في النهاية حملًا خارجيًا لمواصلة التقدم. أما الجزء العلوي والكور فيمكن تدريبهما بوزن الجسم أطول بكثير مما يظن الناس.",
      },
      {
        qEn: "How do I progress past regular push-ups?",
        aEn:
          "Follow the leverage ladder in the library: Incline Push-Up (hands elevated — easiest) to standard Push-Up, to Decline Push-Up (feet elevated — harder), then Plyo Push-Up for power and close-grip versions for triceps emphasis. Each step changes the load without equipment. Master 15–20 clean reps at one level before stepping up, and keep the body rigid from shoulders to heels throughout.",
        qAr: "كيف أتجاوز الضغط العادي؟",
        aAr:
          "اتبع سلم الرافعة في المكتبة: الضغط المائل (اليدين مرفوعتين — الأسهل) إلى الضغط القياسي، إلى المتدرّج (القدمان مرفوعتان — الأصعب)، ثم الانفجاري للقوة ونسخ القبضة الضيقة لتركيز الترايسبس. كل درجة تغيّر الحمل بلا معدات. أتقن 15–20 تكرارًا نظيفًا في مستوى قبل الصعود، وأبقِ الجسم صلبًا من الكتفين للكعبين طوال الحركة.",
      },
      {
        qEn: "What is the best bodyweight back exercise?",
        aEn:
          "The Pull-Up — nothing else loads the lats through a full vertical pull so honestly. If you cannot do one yet, Band-Assisted Pull-Ups and negative pull-ups build toward it. For horizontal pulling without equipment, the Bodyweight Mid-Row under a sturdy table or low bar fills the role of a row. Train vertical and horizontal pulling weekly, just as you would in a gym.",
        qAr: "ما أفضل تمرين ظهر بوزن الجسم؟",
        aAr:
          "العلق — لا شيء آخر يحمّل الجناحية بسحب رأسي كامل بهذه الأمانة. إن لم تستطع واحدة بعد، فالعلق بمساعدة المطاط والعلق السلبي يبنيان الطريق إليها. وللسحب الأفقي بلا معدات، يلعب التجديف الوسطي تحت طاولة متينة أو بار منخفض دور التجديف. درّب السحب الرأسي والأفقي أسبوعيًا كما في الصالة تمامًا.",
      },
      {
        qEn: "How often should I do bodyweight workouts?",
        aEn:
          "The same recovery rules as weighted training apply: each muscle group gets 48 hours between hard sessions. Two to four full-body sessions weekly covers most goals — beginners thrive on three. Because bodyweight work often feels less draining than heavy barbell sessions, the common mistake is training the same push and pull patterns daily; rotate intensities and patterns instead.",
        qAr: "كم مرة أتدرب بوزن الجسم؟",
        aAr:
          "قواعد الاستشفاء نفسها للتدريب بالأوزان تنطبق: كل مجموعة عضلية تأخذ 48 ساعة بين الجلسات المكثفة. جلستان إلى أربع شاملة أسبوعيًا تغطي أغلب الأهداف — والمبتدئون يزدهرون بثلاث. ولأن عمل وزن الجسم يبدو أقل إنهكًا من جلسات البار الثقيلة، الخطأ الشائع هو تدريب أنماط الدفع والسحب نفسها يوميًا؛ نوّع الشدات والأنماط بدلًا من ذلك.",
      },
      {
        qEn: "Are bodyweight squats enough for legs?",
        aEn:
          "They build a foundation — mobility, coordination, and early strength — but plateau sooner than the upper body because the legs are strong relative to bodyweight. When Bodyweight Squats exceed 25–30 comfortable reps, move to Bodyweight Walking Lunges, then single-leg progressions. For continued strength development beyond that, add load: a Goblet Squat or Barbell Squat extends the same pattern for years.",
        qAr: "هل سكوات وزن الجسم يكفي للأرجل؟",
        aAr:
          "يبني أساسًا — مرونة وتناسق وقوة مبكرة — لكنه يصل لهضبة أسرع من الجزء العلوي لأن الأرجل قوية نسبة لوزن الجسم. حين يتجاوز سكوات وزن الجسم 25–30 تكرارًا بارتياح، انتقل للطعن المتجول، ثم التدرجات الأحادية. وللاستمرار في تطوير القوة بعدها، أضف حملًا: سكوات جوبلت أو بالبار يمدّ النمط نفسه لسنوات.",
      },
      {
        qEn: "Is bodyweight training good for fat loss?",
        aEn:
          "It helps twice: full-body circuits burn real calories during the session, and keeping muscle through resistance work protects your metabolism while the diet creates the deficit. The deficit itself still comes from the kitchen — use our calorie calculator to set it. A practical template: 2–3 weekly full-body bodyweight sessions (squat, push, pull, brace), high protein, moderate deficit.",
        qAr: "هل تدريب وزن الجسم جيد لخسارة الدهون؟",
        aAr:
          "يساعد مرتين: الدوائر الشاملة تحرق سعرات حقيقية أثناء الجلسة، والحفاظ على العضل عبر العمل المقاوم يحمي الأيض بينما يخلق النظام الغذائي العجز. والعجز نفسه ما يزال من المطبخ — استخدم حاسبة السعرات لضبطه. قالب عملي: 2–3 جلسات شاملة أسبوعيًا (سكوات، دفع، سحب، شدّ)، بروتين عالٍ، عجز معتدل.",
      },
    ],
  },

  cable: {
    guideEn:
      "Cable machines pull through a motor-driven stack, which gives them a property free weights cannot match: tension that stays constant through the entire range of motion. At the top of a dumbbell flye gravity goes easy on you; at the top of a cable flye the stack still pulls. That constant tension, plus adjustable angles from floor to overhead, makes cables the precision tool of the gym.\n\n" +
      "The library's 81-exercise cable family shows the range: Wide-Grip Lat Pulldown and Face Pull for the back and rear delts, Cable Chest Press for pressing with constant load, Cable Crunch for loaded flexion, Cable Seated Lateral Raise for the side delts, and Cable Preacher Curl for strict arm isolation.\n\n" +
      "How to train with cables:\n" +
      "- Set the pulley height deliberately — it decides which part of the arc loads hardest\n" +
      "- Move slowly through both halves of the rep; momentum has nowhere to hide against a stack\n" +
      "- Judge effort by proximity to failure, not by the number on the stack\n" +
      "- Cables pair well after free-weight compounds: constant tension finishes tired muscles cleanly",
    guideAr:
      "آلات الكابل تسحب عبر رجّ حديدي محرك، وهذا يمنحها خاصية لا يضاهيها الوزن الحر: شد ثابت عبر كامل مدى الحركة. أعلى ذبابة دمبل يخفف عنك الجاذبية؛ وأعلى ذبابة كابل ما يزال الرجّ يسحب. هذا الشد الثابت مع زوايا قابلة للضبط من الأرض إلى فوق الرأس يجعل الكابل أداة الدقة في الصالة.\n\n" +
      "تُظهر عائلة الكابل في المكتبة (81 تمرينًا) الاتساع: السحب الواسع وشبك الوجه للظهر والكتف الخلفي، وضغط الصدر بالكابل لدفع بشد ثابت، وثني الكابل لثني محمّل، والرف الجانبي الجالس للكتف الجانبي، وثني الكاهل للعزل الصارم للذراع.\n\n" +
      "كيف تتدرب بالكابل:\n" +
      "- اضبط ارتفاع البكرة بوعي — إنه يحدد أي جزء من القوس يُحمّل الأصعب\n" +
      "- تحرك ببطء في نصفي التكرار؛ الزخم لا مكان له للاختباء أمام رجّ\n" +
      "- احكم الجهد بالقرب من الفشل لا برقم الرجّ\n" +
      "- الكابل شريك ممتاز بعد المركّبات الحرة: الشد الثابت يُنهي العضلات المتعبة بنظافة",
    faq: [
      {
        qEn: "Are cable exercises effective for building muscle?",
        aEn:
          "Yes — muscle grows from mechanical tension, and cables deliver tension continuously through every degree of the rep, including positions where free weights go slack. Studies comparing cable, machine and free-weight training show comparable hypertrophy at matched effort. Where cables truly shine is isolation and the stretched or contracted end-ranges of movements like flyes, raises and pushdowns.",
        qAr: "هل تمارين الكابل فعالة لبناء العضلات؟",
        aAr:
          "نعم — العضلة تنمو من الشد الميكانيكي، والكابل يوفر شدًا متصلًا عبر كل درجة من التكرار، حتى المواضع التي يهدأ فيها الوزن الحر. تُظهر المقارنات بين الكابل والآلات والأوزان الحرة تكافؤ النمو عند تساوي الجهد. وحيث يتألق الكابل فعلًا هو العزل وطرفي المدى الممدود والمقبوض لحركات كالذبابة والرفوف والدفع.",
      },
      {
        qEn: "Cables or free weights — which should I use?",
        aEn:
          "Use both, in a sensible order. Free-weight compounds build the strength base: they load heaviest and train stabilization. Cables then add constant-tension volume, precise angles and joint-friendly isolation — especially valuable for rear delts, arms, and finishing movements. A simple split: free weights first in the session while fresh, cable work second while fatigued but precise.",
        qAr: "الكابل أم الأوزان الحرة — أيهما أستخدم؟",
        aAr:
          "استخدم الاثنين بترتيب مدروس. المركّبات الحرة تبني قاعدة القوة: تُحمّل الأثقل وتدرب التثبيت. ثم يضيف الكابل حجمًا بشد ثابت وزوايا دقيقة وعزلًا لطيفًا على المفاصل — وخصوصًا قيّمًا للكتف الخلفي والذراعين وحركات الإنهاء. تقسيم بسيط: أوزان حرة أول الجلسة وأنت منتعش، وعمل كابل ثانيًا وأنت متعب لكن دقيق.",
      },
      {
        qEn: "Why do cable exercises feel lighter than they look?",
        aEn:
          "Because there is no inertia: a dumbbell must be accelerated and decelerated, a stack only needs to be pulled steadily. The number on the stack also sits at a different joint-leverage point than a barbell load. Neither means the cable is easy — judge effort the honest way: how close the last reps came to failure. A cable set ending 1–2 reps shy of failure did exactly its job.",
        qAr: "لماذا تبدو تمارين الكابل أخف من شكلها؟",
        aAr:
          "لعدم وجود قصور ذاتي: الدمبل يحتاج تسريعًا وإبطاءً، أما الرجّ فيكفي سحبه بانتظام. ورقم الرجّ أيضًا يجلس عند نقطة رافعة مختلفة عن حمل البار. ولا يعني أيٌّ من ذلك أن الكابل سهل — احكم الجهد بالطريقة الصادقة: مدى قرب التكرارات الأخيرة من الفشل. مجموعة كابل تنتهي قبل الفشل بتكرار أو اثنين أدّت وظيفتها تمامًا.",
      },
      {
        qEn: "What height should I set the cable pulley?",
        aEn:
          "Match the pulley to the resistance profile you want: high setting pulls downward (lat pulldowns, pushdowns, standing crunches), middle setting pulls horizontally (face pulls, chest flyes, rows), low setting pulls upward (lateral raises, curls, upright rows). Moving the pulley changes which part of the movement is hardest — the same attachment at three heights is three different exercises.",
        qAr: "ما الارتفاع المناسب لبكرة الكابل؟",
        aAr:
          "طابق البكرة مع شكل المقاومة المطلوب: الوضع العالي يسحب للأسفل (سحب، دفع، ثني واقف)، والأوسط يسحب أفقيًا (شبك الوجه، ذبابة الصدر، تجديف)، والمنخفض يسحب للأعلى (رفوف جانبية، ثنيات، تجديف رأسي). تحريك البكرة يغيّر أي جزء من الحركة هو الأصعب — نفس الملحق بثلاثة ارتفاعات يعني ثلاثة تمارين مختلفة.",
      },
      {
        qEn: "Are cables good for beginners?",
        aEn:
          "Excellent, actually. The fixed path removes the balance demand that makes free weights intimidating, the load adjusts in small increments, and the machine cannot fall on you. Beginners can learn pressing, pulling and raising patterns on cables with honest feedback, then transfer the movement vocabulary to free weights. One caution: do not let cables fully replace loaded carries and hinge patterns — those still need free-weight or bodyweight versions.",
        qAr: "هل الكابل مناسب للمبتدئين؟",
        aAr:
          "ممتاز فعلًا. المسار الثابت يزيل طلب التوازن الذي يجعل الأوزان الحرة مرعبة، والوزن يتغير بخطوات صغيرة، والآلة لا تسقط عليك. يستطيع المبتدئ تعلم أنماط الدفع والسحب والرف بالكابل بردّ فعل صادق، ثم نقل مفردات الحركة للأوزان الحرة. تنبيه واحد: لا تدع الكابل يستبدل كليًا أنماط الحمل والمفصلية — تلك ما تزال تحتاج نسخًا حرة أو بوزن الجسم.",
      },
      {
        qEn: "What are the best cable back exercises?",
        aEn:
          "The pulldown family leads: Wide-Grip Lat Pulldown for width, Close-Grip Front Lat Pulldown for a stronger contraction, and One-Arm Lat Pulldown to fix side imbalances. Face Pull earns its place for rear delts and shoulder health, and seated cable rows fill the horizontal pattern. Rotate two or three of them weekly and the cables will carry a serious share of your back volume.",
        qAr: "ما أفضل تمارين الظهر بالكابل؟",
        aAr:
          "عائلة السحب في المقدمة: السحب الواسع للعرض، والسحب الضيق الأمامي لانقباض أقوى، والسحب أحادي لإصلاح الفوارق. وشبك الوجه يستحق مقعده للكتف الخلفي وصحة الكتف، والتجديف الجالس يملأ النمط الأفقي. دوّر اثنين أو ثلاثة منها أسبوعيًا وسيحمل الكابل حصة جادة من حجم ظهرك.",
      },
    ],
  },

  machine: {
    guideEn:
      "Machines guide the resistance along a fixed path, which trades one thing (free-path balance) for three others: safety near failure, zero setup time, and isolation a joint can trust. The seat and handles adjust the machine to your anatomy, the weight moves in one controlled arc, and grinding a hard set cannot drop anything on you. For beginners, older trainees, and anyone pushing close to failure alone, that profile is a feature, not a compromise.\n\n" +
      "The library's 67-exercise machine family covers the essentials: Leg Press, Leg Extensions and Lying Leg Curls for the lower body, Machine Preacher Curls and Butterfly (pec deck) for isolation, Seated Calf Raise, and the Ab Crunch Machine.\n\n" +
      "How to train on machines:\n" +
      "- Set up first: align the moving joint with the machine's pivot and secure the pads\n" +
      "- Use the full controlled range the machine allows — half-reps waste the isolation\n" +
      "- Push sets close to failure freely; the fixed path makes it safe\n" +
      "- Pair machines after free-weight compounds to add volume without fresh-strength demands",
    guideAr:
      "الآلات توجّه المقاومة عبر مسار ثابت، فتبادل أمرًا (التوازن في المسار الحر) بثلاثة أخرى: أمان قرب الفشل، وصفير في التجهيز، وعزل يثق به المفصل. المقعد والمقابض تضبط الآلة على تشريحك، والوزن يتحرك في قوس متحكَّم واحد، وصراع مجموعة صعبة لا يُسقط عليك شيئًا. للمبتدئين والمتدربين الأكبر سنًا وكل من يدفع قرب الفشل وحدُه، هذا الملف ميزة لا تنازل.\n\n" +
      "تغطي عائلة الآلات في المكتبة (67 تمرينًا) الأساسيات: ضغط الأرجل والبسط وثني الأوتار للجزء السفلي، وثني الكاهل وذبابة الفراشة للعزل، ورف السمانة جالسًا، وآلة عضلات البطن.\n\n" +
      "كيف تتدرب على الآلات:\n" +
      "- الجهّز أولًا: طابق المفصل المتحرك مع محور الآلة وثبّت الوسائد\n" +
      "- استخدم المدى الكامل المتحكَّم الذي تتيحه الآلة — نصف التكرارات تهدر العزل\n" +
      "- ادفع مجموعاتك قرب الفشل بحرية؛ المسار الثابت يجعله آمنًا\n" +
      "- اقرن الآلات بعد المركّبات الحرة لإضافة حجم بلا طلبات قوة جديدة",
    faq: [
      {
        qEn: "Are machines as effective as free weights?",
        aEn:
          "For muscle growth — yes. Hypertrophy follows tension and effort, and machines deliver both; comparative studies show similar gains at matched intensity. Free weights additionally train balance and carry over more to athletic skills, which is why most programs lead with them. Machines then stack safe volume, especially for legs and isolation work. Muscles do not read equipment labels — they respond to load near failure.",
        qAr: "هل الآلات بنفس فعالية الأوزان الحرة؟",
        aAr:
          "لبناء العضلات — نعم. التضخيم يتبع الشد والجهد، والآلات توفرهما؛ والمقارنات تُظهر مكاسب متكافئة عند تساوي الشدة. الأوزان الحرة تضيف تدريب التوازن وتنتقل أكثر للمهارات الرياضية، ولهذا تقدّمها أغلب البرامج. ثم تكديس الآلات حجمًا آمنًا، خصوصًا للأرجل والعزل. العضلات لا تقرأ لوحات المعدات — تستجيب للحمل قرب الفشل.",
      },
      {
        qEn: "Are weight machines bad for your joints?",
        aEn:
          "No — used correctly, the opposite: the fixed path actually reduces the degrees of freedom a joint must control, which is why machines are staples in rehabilitation settings. The real risk is setup error: a seat too high or low twists the joint through the arc. Take ten seconds to align the moving joint with the machine's pivot and set the pads; if a machine cannot fit your body comfortably, use a different one.",
        qAr: "هل آلات الأوزان ضارة بالمفاصل؟",
        aAr:
          "لا — عند الاستخدام الصحيح، العكس: المسار الثابت يقلل فعلًا درجات الحرية التي يتحكم بها المفصل، ولهذا تعد الآلات عمودًا فقريًا في إعدادات التأهيل. الخطر الحقيقي خطأ التجهيز: مقعد أعلى أو أخفض من اللازم يلوّي المفصل عبر القوس. خُذ عشر ثوانٍ لمطابقة المفصل المتحرك مع محور الآلة وضبط الوسائد؛ وإن لم تتلاءم آلة مع جسمك بارتياح، استخدم غيرها.",
      },
      {
        qEn: "Can I build a full physique on machines only?",
        aEn:
          "Mostly yes for hypertrophy — every muscle group has machine options and growth follows effort. The gaps worth patching: hip-hinge patterns (deadlift-family work) and loaded carries have no machine equivalent, and they build real-world strength and posterior-chain resilience. A pragmatic plan: machines as the backbone, plus a weekly hinge pattern from dumbbells, a barbell, or bodyweight to cover the missing movement family.",
        qAr: "هل أبني جسمًا كاملًا بالآلات فقط؟",
        aAr:
          "للتضخيم نعم في الغالب — لكل مجموعة عضلية خيارات آلات والنمو يتبع الجهد. الفجوات التي تستحق الترقيع: أنماط المفصلية (عائلة الرفعة) والحملات المحمّلة بلا مقابل آلي، وهما تبنيان قوة واقعية ومرونة السلسلة الخلفية. خطة عملية: الآلات هيكلًا أساسيًا، مع نمط مفصلي أسبوعي بالدمبل أو البار أو وزن الجسم لتغطية العائلة الحركية الناقصة.",
      },
      {
        qEn: "How do I set up a machine correctly?",
        aEn:
          "Three checks, ten seconds: the moving joint (knee, elbow, hip) lines up with the machine's pivot axis; pads sit against the right landmarks (shin for leg extensions, hips locked for leg press); and the range stays comfortable end to end with no pinch points. Then do one light rehearsal rep. A well-set machine turns into a different exercise — most \"machine discomfort\" is actually setup discomfort.",
        qAr: "كيف أجهّز الآلة بشكل صحيح؟",
        aAr:
          "ثلاث فحوصات في عشر ثوانٍ: المفصل المتحرك (ركبة، كوع، ورك) يستقيم مع محور دوران الآلة؛ والوسائد تجلس على الملامح الصحيحة (الساق لتمديد الركبة، والوركان مثبتان لضغط الأرجل)؛ والمدى يبقى مريحًا طرفًا لطرف بلا نقاط انضغاط. ثم تكرار تمثيلي خفيف واحد. الآلة المجهزة جيدًا تتحول لتمرين مختلف — أغلب «انزعاج الآلات» هو فعلًا انزعاج تجهيز.",
      },
      {
        qEn: "Why do machine exercises feel easier than free weights?",
        aEn:
          "The machine removes the stabilizing work — balance, path control, body positioning — so the target muscle does less of the total job. That is precisely the isolation you paid for. The fix is honest effort: take machine sets as close to failure as you would a barbell set. A leg press finished two reps shy of failure builds the same quadriceps tension any squat would demand.",
        qAr: "لماذا تبدو تمارين الآلات أخف من الأوزان الحرة؟",
        aAr:
          "الآلة تُزيل عمل التثبيت — التوازن وضبط المسار ووضع الجسم — فتقوم العضلة المستهدفة بحصة أصغر من العمل الكلي. وهذا بالضبط العزل الذي دفعت ثمنه. والعلاج جهد صادق: خذ مجموعات الآلة إلى قرب الفشل كما تفعل مع مجموعة بار. ضغط أرجل ينتهي قبل الفشل بتكرارين يبني شد الفخذ الأمامي نفسه الذي يطلبه أي سكوات.",
      },
      {
        qEn: "What are the best machine exercises to prioritize?",
        aEn:
          "Start with the leg trio — Leg Press, Leg Extensions and Lying Leg Curls — because machines load the lower body safely near failure like nothing else. Add Butterfly for chest isolation, Machine Preacher Curls for strict arm work, and Seated Calf Raise for a stubborn muscle that responds to strict range. Those six cover the machine family's highest-value ground for most programs.",
        qAr: "ما أفضل تمارين الآلات لأولوية التنفيذ؟",
        aAr:
          "ابدأ بثلاثي الأرجل — ضغط الأرجل والبسط وثني الأوتار — لأن الآلات تُحمّل الجزء السفلي بأمان قرب الفشل كلا شيء آخر. أضف ذبابة الفراشة لعزل الصدر، وثني الكاهل لعمل ذراع صارم، ورف السمانة جالسًا لعضلة عنيدة تستجيب للمدى الصارم. هذه الستة تغطي أعلى قيمة في عائلة الآلات لأغلب البرامج.",
      },
    ],
  },

  kettlebell: {
    guideEn:
      "A kettlebell's mass sits offset from the handle, which changes everything: every lift must also control a swinging, rotating load. That single design choice makes kettlebells the best tool in the gym for power-endurance — generating force repeatedly while staying braced — and for unilateral stability work that barbells and dumbbells only approximate.\n\n" +
      "The library's 52-exercise kettlebell family includes the essentials: Goblet Squat for a self-correcting squat pattern, Alternating Kettlebell Press and Bent Press for overhead strength, Advanced Kettlebell Windmill for mobility under load, Alternating Kettlebell Row and Alternating Renegade Row for pulling with anti-rotation, and double-bell cleans for conditioning.\n\n" +
      "How to train with kettlebells:\n" +
      "- Learn patterns light — the offset load punishes rushed technique harder than any barbell\n" +
      "- Keep the wrist neutral and the bell resting on the forearm, not gripped by the hand, in rack positions\n" +
      "- Blend strength sets (5–8 reps, heavy) with longer grind or interval sets (10–20 reps, moderate)\n" +
      "- Two to four sessions weekly; ballistics are systemically expensive — respect recovery",
    guideAr:
      "كتلة الكيتل بيل تجلس بإزاحة عن المقبض، وهذا يغيّر كل شيء: كل رفعة يجب أيضًا أن تسيطر على حمل يتأرجح ويدور. هذا الاختيار التصميمي وحده يجعل الكيتل بيل أفضل أداة في الصالة لقوة التحمل — توليد القوة مرارًا مع بقاء الشدّ — ولعمل الثبات الأحادي الذي يقلّده البار والدمبل فقط.\n\n" +
      "تضم عائلة الكيتل بيل في المكتبة (52 تمرينًا) الأساسيات: سكوات جوبلت لنمط سكوات يصحح نفسه، وضغط متبادل وبنت بريس للقوة فوق الرأس، وطاحونة الكيتل المتقدمة للمرونة تحت الحمل، وتجديف متبادل وتجديف متمرد للسحب مع مقاومة الدوران، وتنظيفات بجرسين مزدوجين للياقة.\n\n" +
      "كيف تتدرب بالكيتل بيل:\n" +
      "- تعلّم الأنماط بوزن خفيف — الحمل المزاح يعاقب التقنية المتعجلة أشد من أي بار\n" +
      "- أبقِ المعصم محايدًا والجرسة ترتاح على الساعد لا مُقبوضة باليد في وضعيات الرَفّ\n" +
      "- امزج مجموعات القوة (5–8 تكرارات ثقيلة) بمجموعات أطول أو فترية (10–20 تكرارًا معتدلة)\n" +
      "- جلستان إلى أربع أسبوعيًا؛ القذفيات مكلفة جهازيًا — احترم الاستشفاء",
    faq: [
      {
        qEn: "What are kettlebells best for?",
        aEn:
          "Three zones of excellence: power-endurance (repeated forceful hinge and press patterns), unilateral stability (the offset load recruits the whole shoulder and hip girdle), and efficient conditioning that builds work capacity without a treadmill. If your goals include athletic power, grip strength and training that doubles as cardio, a kettlebell earns its corner of the gym faster than any single tool.",
        qAr: "ما الذي يتفوق فيه الكيتل بيل؟",
        aAr:
          "ثلاث مناطق تفوق: قوة التحمل (أنماط مفصلية وضغط متكررة قوية)، والثبات الأحادي (الحمل المزاح يستشرك حزام الكتف والورك كاملًا)، ولياقة فعّالة تبني قدرة العمل دون جهاز جري. إن كانت أهدافك قوة رياضية وقبضة وتدريب يعمل كارديو في الوقت نفسه، فالكيتل بيل يستحق ركنه في الصالة أسرع من أي أداة منفردة.",
      },
      {
        qEn: "Kettlebell or dumbbell — which should I buy first?",
        aEn:
          "Different tools for different jobs. The kettlebell's offset handle suits ballistics, carries and unilateral grind work; the dumbbell suits strict presses, rows and progressive loading in small jumps. For a first purchase, decide by goal: conditioning and athletic power lean kettlebell, classic strength and hypertrophy lean dumbbell. Many home gyms settle on one adjustable dumbbell pair plus one or two kettlebells and never look back.",
        qAr: "كيتل بيل أم دمبل — أيهما أشتري أولًا؟",
        aAr:
          "أداتان لوظيفتين مختلفتين. مقبض الكيتل المزاح يناسب القذفيات والحملات والعمل الأحادي الشاق؛ والدمبل يناسب الضغطات الصارمة والتجديف والتحميل بزيادات صغيرة. لشراء أول، قرر بالهدف: اللياقة والقوة الرياضية تميل للكيتل، والقوة الكلاسيكية والتضخيم للدمبل. كثير من الصالات المنزلية تستقر على زوج دمبل قابل للتعديل مع كيتل أو اثنين ولا تندم.",
      },
      {
        qEn: "Should beginners start with light kettlebells?",
        aEn:
          "Absolutely — lighter than your ego suggests. The offset load makes familiar movements feel unfamiliar: an 8–12 kg bell is plenty for learning presses, goblet squats and rows with clean technique. Rush the weight and the lower back pays for it. Once patterns are smooth and wrists stay neutral under fatigue, step up gradually — kettlebells progress in bigger jumps than dumbbells, which is one more reason to start light.",
        qAr: "هل يبدأ المبتدئ بكيتل بيل خفيف؟",
        aAr:
          "قطعًا — أخف مما يقترحه غرورك. الحمل المزاح يجعل الحركات المألوفة غريبة: جرسة 8–12 كجم تكفي لتعلم الضغطات وسكوات الجوبلت والتجديف بتقنية نظيفة. استعجل الوزن ويدفع أسفل ظهرك الثمن. حين تصير الأنماط سلسة ويبقى المعصم محايدًا تحت التعب، اصعد تدريجيًا — الكيتل يتدرج بقفزات أكبر من الدمبل، وهذا سبب إضافي للبدء خفيفًا.",
      },
      {
        qEn: "Are kettlebells good for beginners overall?",
        aEn:
          "The right entry exercises are: Goblet Squat teaches a squat pattern that self-corrects, Alternating Kettlebell Press builds overhead strength safely, and rows teach the hinge position. Ballistic patterns (cleans, jerks) deserve coaching or patient self-study before heavy use. Start with the grinds, add ballistics light and slow, and a kettlebell becomes one of the most rewarding tools a beginner can own.",
        qAr: "هل الكيتل بيل مناسب للمبتدئين إجمالًا؟",
        aAr:
          "تمارين الدخول الصحيحة كذلك: سكوات الجوبلت يعلّم نمط سكوات يصحح نفسه، وضغط الكيتل المتبادل يبني قوة فوق الرأس بأمان، والتجديف يعلّم وضعية المفصلية. أما الأنماط القذفية (التنظيف والنطح) فتستحق توجيهًا أو دراسة ذاتية صبورة قبل الأوزان الثقيلة. ابدأ بالحركات الشاقة، وأضف القذفيات خفيفة وبطيئة، وسيصير الكيتل من أكثر الأدوات مكافأة للمبتدئ.",
      },
      {
        qEn: "How often should I train with kettlebells?",
        aEn:
          "Two to four sessions weekly works for most goals. Ballistic and interval work taxes the whole system — heart, grip, posterior chain — so space demanding sessions at least 48 hours apart and fill gaps with lighter grind work (presses, rows, windmills). If you combine kettlebell days with barbell strength training, treat hard kettlebell conditioning as its own training day, not an add-on.",
        qAr: "كم مرة أتدرب بالكيتل بيل؟",
        aAr:
          "جلستان إلى أربع أسبوعيًا تناسب أغلب الأهداف. العمل القذفي والفتري يُتعب المنظومة كلها — القلب والقبضة والسلسلة الخلفية — فافصل الجلسات المكثفة بـ48 ساعة على الأقل واملأ الفجوات بعمل شاق أخف (ضغطات، تجديف، طواحين). وإن جمعت أيام الكيتل مع قوة البار، فاعتبر التكييف الكيتلي الصعب يوم تدريب قائم بذاته لا إضافة.",
      },
      {
        qEn: "Can kettlebells replace a full gym?",
        aEn:
          "For strength-endurance, conditioning and mobility — largely yes: one or two bells cover hundreds of sessions. For maximal strength, no tool replaces heavy progressive loading; a barbell still wins squats and deadlifts outright. A realistic home setup pairs one or two kettlebells with an adjustable dumbbell set and a pull-up option, covering power, conditioning and hypertrophy without a single machine.",
        qAr: "هل يستبدل الكيتل بيل صالة كاملة؟",
        aAr:
          "لقوة التحمل والتكييف والمرونة — نعم في الغالب: جرسة أو جرستان تغطيان مئات الجلسات. وللقوة القصوى، لا أداة تستبدل التحميل التدريجي الثقيل؛ البار ما يزال يفوز بالسكوات والرفعات بوضوح. تجهيزة منزلية واقعية تقرن كيتل أو اثنين بمجموعة دمبل قابل للتعديل وخيار علق، فتغطي القوة والتكييف والتضخيم بلا آلة واحدة.",
      },
    ],
  },

  band: {
    guideEn:
      "Resistance bands apply a property no iron offers: resistance that grows as the band stretches — easiest where you are weakest, hardest where the muscle is strongest. That ascending curve suits joint-friendly warm-ups, exercises that stall at lockout, and training anywhere a doorframe or a hook exists. Bands are also the lightest complete gym ever packed into a bag.\n\n" +
      "The library's 20-exercise band family covers the useful ground: Back Flyes with Bands and Band Pull Apart for rear delts and posture, Band Skull Crusher for triceps, Calf Raises with Bands, Band Good Morning for the posterior chain, and Bench Press with Bands for pressing without iron.\n\n" +
      "How to train with bands:\n" +
      "- Anchor securely and inspect for wear before every session — a snapped band stings\n" +
      "- Stand on the band or anchor it; slack, not tension, is the beginner's usual mistake\n" +
      "- Progress by shortening slack, doubling up bands, slowing tempo, then adding harder variations\n" +
      "- Bands pair brilliantly with iron: add them to barbell lifts for accommodating resistance",
    guideAr:
      "أشرطة المقاومة تطبق خاصية لا يقدمها الحديد: مقاومة تزداد كلما تمدد الشريط — الأسهل حيث أنت الأضعف، والأصعب حيث العضلة أقوى. هذا المنحنى الصاعد يناسب التسخين اللطيف على المفاصل، والحركات التي تتوقف عند القفل، والتدريب أينما وُجد إطار باب أو خطّاف. والأشرطة أيضًا أخف صالة كاملة حُزمت في حقيبة على الإطلاق.\n\n" +
      "تغطي عائلة الشريط في المكتبة (20 تمرينًا) الأرض المفيدة: ذبابة خلفية وشبك الشريط للكتف الخلفي والقوام، وتمزيق بالشريط للترايسبس، ورف سمانة بالشريط، ومفصلية بالشريط للسلسلة الخلفية، وضغط الصدر بالشريط للدفع بلا حديد.\n\n" +
      "كيف تتدرب بالأشرطة:\n" +
      "- ثبّت التثبيت بإحكام وافحص البلى قبل كل جلسة — الشريط المنفلت يلسع\n" +
      "- قف على الشريط أو ثبّته؛ الارتخاء لا الشد هو خطأ المبتدئ المعتاد\n" +
      "- تدرّج بتقصير الارتخاء ثم مضاعفة الأشرطة ثم إبطاء الزمن ثم تنويعات أصعب\n" +
      "- الأشرطة شريك رائع للحديد: أضفها لرفعات البار لمقاومة متلائمة مع المدى",
    faq: [
      {
        qEn: "Do resistance bands actually build muscle?",
        aEn:
          "Yes — when the sets are hard. Research comparing band and free-weight training finds similar hypertrophy when effort is matched, because growth responds to tension near failure, whatever supplies it. Bands differ in the resistance curve, not the muscle-building mechanism. Keep reps in the same near-failure ranges you would use with weights, progress the tension over time, and muscle follows.",
        qAr: "هل أشرطة المقاومة تبني العضلات فعلًا؟",
        aAr:
          "نعم — حين تكون المجموعات صعبة. المقارنات بين تدريب الأشرطة والأوزان الحرة تجد تكافؤ النمو عند تساوي الجهد، لأن النمو يستجيب للشد قرب الفشل أيا كان مصدره. تختلف الأشرطة في منحنى المقاومة لا في آلية بناء العضلة. حافظ على التكرارات في مدى القرب من الفشل نفسه المستخدم مع الأوزان، ودرّج الشد مع الزمن، وستتبعك العضلة.",
      },
      {
        qEn: "Bands or weights — which is better?",
        aEn:
          "Weights win on progressive loading: 2.5 kg jumps beat guessing band tension, and heavy strength work belongs to iron. Bands win on portability, joint-friendly angles, ascending resistance for lockout-stubborn lifts, and warm-ups. The strongest use is combined: barbell and dumbbell training as the base, bands for assistance work, finishers and travel. Neither replaces the other — they cover different ground.",
        qAr: "الأشرطة أم الأوزان — أيهما أفضل؟",
        aAr:
          "الأوزان تتفوق بالتحميل التدريجي: قفزة 2.5 كجم تتفوق على تخمين شد الشريط، وعمل القوة الثقيل ملك الحديد. والأشرطة تتفوق بالحمل والزوايا اللطيفة على المفاصل والمقاومة الصاعدة للرفعات العنيدة عند القفل والتسخين. الاستخدام الأقوى مُقترن: تدريب بار ودمبل كأساس، وأشرطة للمساعدة والإنهاء والسفر. لا يُغني أحدهما عن الآخر — يغطيان أرضًا مختلفة.",
      },
      {
        qEn: "What band resistance should I start with?",
        aEn:
          "Own two or three tensions rather than one: a light band for warm-ups and shoulder work, a medium band where most exercises live, a heavy band for legs, pull-up assistance and pressing. The honest test is the same as any tool — the last two reps of a set should be genuinely hard. A band that lets you breeze past 25 reps provides stretching, not training.",
        qAr: "ما شد الشريط المناسب للبداية؟",
        aAr:
          "امتلك شدّين أو ثلاثة لا واحدًا: شريط خفيف للتسخين وعمل الكتف، ومتوسط حيث تعيش أغلب التمارين، وثقيل للأرجل ومساعدة العلق والضغط. الاختبار الصادق كأي أداة — آخر تكرارين من المجموعة يجب أن يكونا صعبين فعلًا. الشريط الذي يتيح تجاوز 25 تكرارًا بسهولة يقدم تمددًا لا تدريبًا.",
      },
      {
        qEn: "What are resistance bands best used for?",
        aEn:
          "Four high-value roles: warm-ups that activate shoulders and hips before heavy lifting, assistance and isolation (Band Pull Apart, Back Flyes with Bands, Band Skull Crusher), pull-up assistance and shoulder-health rotation work (External Rotation with Band), and complete training while traveling. They also add accommodating resistance to barbell lifts for advanced lifters — extra load exactly where the lift is strongest.",
        qAr: "ما أفضل استخدامات أشرطة المقاومة؟",
        aAr:
          "أربعة أدوار عالية القيمة: تسخين يستشرك الكتفين والوركين قبل الرفع الثقيل، والمساعدة والعزل (شبك الشريط، ذبابة خلفية، تمزيق بالشريط)، ومساعدة العلق وعمل صحة الكتف الدوراني، وتدريب كامل أثناء السفر. وتضيف أيضًا مقاومة متلائمة لرفعات البار للمتقدمين — حمل إضافي بالضبط حيث الرفعة أقوى.",
      },
      {
        qEn: "How do I stop resistance bands from slipping or snapping?",
        aEn:
          "Three habits: inspect the band before every session — small cracks and white stress lines mean retirement; anchor to rated points (a door anchor, a sturdy rack) rather than sharp edges; and lay the band flat against skin or clothing instead of letting it roll on itself. Store them away from sunlight and heat. Treated this way, quality bands last years instead of months.",
        qAr: "كيف أمنع الأشرطة من الانزلاق أو التمزق؟",
        aAr:
          "ثلاث عادات: افحص الشريط قبل كل جلسة — الشقوق الصغيرة وخطوط الإجهاد البيضاء تعني التقاعد؛ وثبّته على نقاط مصنّعة للغرض (مثبت باب، رَفّ متين) لا على حواف حادة؛ واجعله مسطحًا على الجلد أو الملابس بدل التدحرج على نفسه. وخزّنها بعيدًا عن الشمس والحرارة. بهذه المعاملة تعيش الأشرطة الجيدة سنوات بدل أشهر.",
      },
      {
        qEn: "How do I make band exercises harder over time?",
        aEn:
          "In order of simplicity: shorten the slack (move your grip or stance closer to the anchor), stack a second band, slow the lowering phase to three seconds, add a pause at peak tension, then switch to a harder variation of the pattern. Because bands have no numbered plates, track reps and tension combinations in a log — progression by record-keeping works exactly like loading by kilograms.",
        qAr: "كيف أجعل تمارين الأشرطة أصعب مع الوقت؟",
        aAr:
          "بترتيب البساطة: قصّر الارتخاء (قرّب قبضتك أو وقفتك من التثبيت)، ورصّ شريطًا ثانيًا، وأبطئ الهبوط إلى ثلاث ثوانٍ، وأضف وقفة عند ذروة الشد، ثم انتقل لتنويع أصعب للنمط. ولأن الأشرطة بلا أطباق مرقمة، تتبّع توليفات التكرار والشد في سجل — التدرج بالتوثيق يعمل تمامًا كالتحميل بالكيلوجرامات.",
      },
    ],
  },
};
