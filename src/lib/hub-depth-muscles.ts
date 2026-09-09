/**
 * Muscle-hub depth content (guide + FAQ) — Phase SEO-GEO-5.2.
 * Scope: the 7 populated muscle hubs. muscles/cardio is empty in the
 * library (§12.14) and stays exempt — see hub-depth.ts for the contract.
 *
 * Every exercise named below is verified to exist in src/lib/exercises.ts
 * (anti-fabrication law). Counts are intentionally omitted from prose —
 * the page header shows the live count.
 */

import type { HubDepthContent } from "./hub-depth";

export const MUSCLE_DEPTH: Record<string, HubDepthContent> = {
  chest: {
    guideEn:
      "The chest (pectorals) moves the upper arm across the body and drives every pressing motion — pushing a door, lifting a child, or locking out a barbell. Because it crosses the shoulder joint from the sternum to the humerus, it responds to two complementary patterns: pressing (moving the load away from the torso) and flye-style adduction (squeezing the arms together under load). A complete chest plan uses both.\n\n" +
      "Our library covers the muscle from every angle and tool: barbell pressing (Barbell Bench Press, Incline Bench Press), dumbbell work (Dumbbell Flyes for the stretch position), cable tension (Cable Chest Press), and bodyweight variations (Decline Push-Up, Plyo Push-Up) that scale from first push-up to advanced power work.\n\n" +
      "Programming that consistently works:\n" +
      "- 10–20 hard sets per week, split across 2 non-consecutive sessions\n" +
      "- 6–12 reps on presses, 10–15 on flyes, taken within 1–3 reps of failure\n" +
      "- Progressive overload: add reps or load when the top of the range becomes smooth\n" +
      "- At least 48 hours between chest sessions for recovery",
    guideAr:
      "عضلات الصدر (الصدرية) تحرّك الذراع أفقيًا نحو منتصف الجسم وتقود كل حركة دفع — من دفع باب إلى تثبيت البار في بنش بريس. ولأنها تمتد من عظمة القص إلى عضد الذراع، تستجيب لنمطين متكاملين: الدفع (إبعاد الحمل عن الجذع) والتقارب بنمط الذبابة (ضم الذراعين تحت حمل). الخطة الكاملة للصدر تجمع النمطين معًا.\n\n" +
      "تغطي مكتبتنا العضلة من كل الزوايا وبكل الأدوات: الدفع بالبار (بنش بريس بالبار، بنش مائل)، العمل بالدمبل (تمارين الذبابة لمدى الحركة المطّاطي)، الشد المستمر بالكابل (ضغط الصدر بالكابل)، وتحارب وزن الجسم (ضغط متدرّج، ضغط انفجاري) التي تتدرّج من أول تمرين دفع حتى المستويات المتقدمة.\n\n" +
      "خطة تدريبية مجرّبة:\n" +
      "- من 10 إلى 20 مجموعة مكثفة أسبوعيًا موزّعة على جلسين غير متتاليين\n" +
      "- 6–12 تكرارًا في الدفع، و10–15 في الذبابة، بمحاولة تفشل تُحسب ضمن 1–3 تكرارات\n" +
      "- زيادة تدريجية: ارفع التكرارات أو الوزن حين يصير أعلى المدى سلسًا\n" +
      "- 48 ساعة فاصلة على الأقل بين جلستي الصدر للاستشفاء",
    faq: [
      {
        qEn: "What are the best chest exercises?",
        aEn:
          "Start with a compound press — Barbell Bench Press or Incline Bench Press — as your primary lift, then add a flye pattern like Dumbbell Flyes or Cable Chest Press to load the muscle in its stretched position. For bodyweight training, Push-Up variations (Decline Push-Up for the upper chest bias, Plyo Push-Up for power) carry you a long way. Combine one press plus one flye per session and progress them over months.",
        qAr: "ما أفضل تمارين الصدر؟",
        aAr:
          "ابدأ بتمرين دفع مركّب — بنش بريس بالبار أو البنش المائل — كرفعك الأساسي، ثم أضف نمط ذبابة مثل تمارين الذبابة بالدمبل أو ضغط الصدر بالكابل لتحميل العضلة في وضعية التمدد. وفي تدريب وزن الجسم تكفيك تحارب الضغط (الضغط المتدرّج لميول أعلى للصدر، والانفجاري للقوة). اجمع تمرين دفع وتمرين ذبابة في كل جلسة وطوّرهما شهورًا.",
      },
      {
        qEn: "How often should I train chest per week?",
        aEn:
          "Twice a week on non-consecutive days is the sweet spot for most trainees. Muscle recovery after a hard session takes roughly 48 hours, and chest volume accumulates quickly because pressing also recruits the shoulders and triceps. Keep weekly volume around 10–20 hard sets; if you press heavy one day, make the second session lighter and higher-rep rather than repeating maximum loads.",
        qAr: "كم مرة أدرّب الصدر أسبوعيًا؟",
        aAr:
          "مرتان أسبوعيًا في يومين غير متتاليين هي النقطة المثلى لأغلب المتدربين. تستغرق العضلة نحو 48 ساعة للاستشفاء بعد جلسة مكثفة، وتتراكم حصيلة الصدر بسرعة لأن الدفع يشرك الكتفين والترايسبس أيضًا. حافظ على 10–20 مجموعة مكثفة أسبوعيًا؛ وإذا دفعت بأوزان ثقيلة يومًا ما، اجعل الجلسة الثانية أخف وتكرارات أعلى بدل تكرار الأقصى.",
      },
      {
        qEn: "Are push-ups as effective as the bench press?",
        aEn:
          "For building chest muscle, yes — as long as the set is hard enough. Research consistently shows comparable hypertrophy between push-ups and bench press when effort and volume are matched. The bench press wins for convenient small-increment loading at heavy weights; push-ups win for accessibility and shoulder-friendly scaling through leverage (elevate the feet for Decline Push-Up as loads grow). Many lifters get the best of both: press heavy once a week, push-ups as a second session.",
        qAr: "هل تمارين الضغط بنفس فعالية البنش؟",
        aAr:
          "لبناء عضلة الصدر، نعم — بشرط أن تكون المجموعة صعبة بما يكفي. تُظهر الدراسات باستمرار تكافؤ النمو بين الضغط والبنش عند تساوي الجهد والحجم. يتفوق البنش في زيادة الوزن بزيادات صغيرة على الأوزان الثقيلة، ويتفوق الضغط في سهولة الوصول وتدرّجه اللطيف على المفاصل عبر تغيير زاوية الجسم (ارفع القدمين للضغط المتدرّج مع تقدم الأحمال). الجمع بينهما أفضل: دفع ثقيل مرة أسبوعيًا وضغط في جلسة ثانية.",
      },
      {
        qEn: "How long does it take to see chest growth?",
        aEn:
          "Strength usually moves first: most beginners add noticeable weight or reps to their main press within 2–4 weeks. Visible muscle change follows later — expect the first clear differences in the mirror at 8–12 weeks of consistent training with progressive overload and adequate protein. Take monthly photos and log your lifts; the tape measure and the logbook are more honest than day-to-day mirror checks.",
        qAr: "متى تظهر نتائج تدريب الصدر؟",
        aAr:
          "القوة تتحرك أولًا عادةً: يضيف أغلب المبتدئين وزنًا أو تكرارات ملحوظة على تمرينهم الأساسي خلال 2–4 أسابيع. أما التغير البصري فيلي لاحقًا — توقّع أول فروق واضحة بعد 8–12 أسبوعًا من التدريب المنتظم بالزيادة التدريجية والبروتين الكافي. صوّر نفسك شهريًا وسجّل أوزانك؛ المقياس والسجل أصدق من النظر اليومي في المرآة.",
      },
      {
        qEn: "Why don't I feel my chest during bench presses?",
        aEn:
          "Usually it is technique, not anatomy. The three most common causes: grip too wide or too narrow, elbows flared straight out at 90 degrees (which shifts load to the shoulders), and weight so heavy the body borrows momentum. Fix it by retracting your shoulder blades, keeping a moderate grip, lowering the load 10–20%, and controlling the lowering phase for 2–3 seconds. The chest will take over once the pressing path is stable.",
        qAr: "لماذا لا أشعر بعضلة صدري أثناء البنش؟",
        aAr:
          "السبب غالبًا تقني لا تشريحي. أشيع ثلاثة أسباب: قبضة أوسع أو أضيق من اللازم، مرفقان متباعدان 90 درجة (فيُنقل الحمل إلى الكتفين)، ووزن أثقل من قدرة التحكم فيأتي بالزخم. عالجها بسحب لوحي الكتف للخلف، وقبضة معتدلة، وخفض الوزن 10–20%، والهبوط المتحكَّم به خلال 2–3 ثوانٍ. ستستلم الصدر العمل بمجرد ثبات مسار الدفع.",
      },
      {
        qEn: "Can I train chest every day?",
        aEn:
          "No — daily pressing works against you. A hard chest session creates muscle damage that needs about 48 hours to repair; training the same muscle daily keeps it in a permanently broken-down state, so strength stalls and joints complain. Two to three focused sessions per week build more chest in a year than six fatigued ones. If you love pressing often, rotate intensities: heavy day, technique day, pump day — with rest days between.",
        qAr: "هل أستطيع تدريب الصدر يوميًا؟",
        aAr:
          "لا — الدفع اليومي يعمل ضدك. جلسة الصدر المكثفة تخلق تلفًا عضليًا يحتاج نحو 48 ساعة للترميم؛ وتدريب العضلة نفسها يوميًا يُبقيها في حالة تكسّر دائم، فتتوقف القوة وتشتكي المفاصل. جلستان إلى ثلاث مركّزات أسبوعيًا تبني صدرًا أكثر خلال سنة من ست جلسات منهكة. إن أحببت الدفع المتكرر، نوّع الشدة: يوم ثقيل ويوم تقنية ويوم ضخ بينها أيام راحة.",
      },
    ],
  },

  back: {
    guideEn:
      "The back is not one muscle but a team: the lats (width and pulling power), the mid-back rhomboids and traps (posture and shoulder-blade control), and the erectors that keep your spine tall under load. Because these roles differ, back training needs two distinct patterns — vertical pulls (chin toward the bar) and horizontal rows (elbows behind the torso) — plus a hinge to load the lower back honestly.\n\n" +
      "The library covers all three: Pull-Ups and the Wide-Grip Lat Pulldown for vertical pulling, Bent-Over Barbell Row and Bent-Over Two-Dumbbell Row for horizontal thickness, One-Arm Lat Pulldown for unilateral balance, and the Barbell Deadlift for the posterior chain from hamstrings to upper back.\n\n" +
      "A weekly structure that works:\n" +
      "- One vertical-pull focus and one row focus per session, 2 sessions per week\n" +
      "- 10–20 total hard sets across the patterns, 6–12 reps on rows, 8–15 on pulldowns\n" +
      "- Full stretch at the bottom of every pull — the stretched position drives growth\n" +
      "- Neck, traps and erectors get indirect work; add shrugs only if they lag",
    guideAr:
      "الظهر ليس عضلة واحدة بل فريق متكامل: العضلة الجناحية (العرض والقوة الساحبة)، ومعينات الوسط وشبه المنحرفة (القوام والتحكم بلوحَي الكتف)، والناصبات التي تُقيم عمودك الفقري تحت الحمل. ولتنوّع الأدوار، يحتاج الظهر نمطين مختلفين — السحب الرأسي (نحو البار) والتجديف الأفقي (المرفقان خلف الجذع) — إضافة إلى حركة المفصلية لتحميل أسفل الظهر بأمانة.\n\n" +
      "تغطي المكتبة الأنماط كلها: العلق الواسع والسحب الرأسي بالكابل، والتجديف بالبار والتجديف بالدمبلين للسماكة، والسحب بذراع واحدة للتوازن، والرفعة الميتة للسلسلة الخلفية من أوتار الركبة حتى أعلى الظهر.\n\n" +
      "بنية أسبوعية فعالة:\n" +
      "- تركيز سحب رأسي وتركيز تجديف في كل جلسة، بجلستين أسبوعيًا\n" +
      "- 10–20 مجموعة مكثفة إجمالًا، بـ6–12 تكرارًا للتجديف و8–15 للسحب الرأسي\n" +
      "- تمدد كامل أسفل كل سحبة — وضعية الاستطالة هي محرك النمو\n" +
      "- الرقبة والناصبات تحصل على عمل غير مباشر؛ أضف الشراگ فقط إن كانت متأخرة",
    faq: [
      {
        qEn: "What are the best back exercises for width and thickness?",
        aEn:
          "Width comes from vertical pulling — Pull-Ups and the Wide-Grip Lat Pulldown are the anchors. Thickness comes from horizontal rows — Bent-Over Barbell Row and Bent-Over Two-Dumbbell Row are the workhorses. The Barbell Deadlift builds the erectors and traps that frame everything else. One vertical pull, one row, and one hinge per back session is a complete template; add a unilateral move like One-Arm Lat Pulldown if one side lags.",
        qAr: "ما أفضل تمارين الظهر للعرض والسماكة؟",
        aAr:
          "العرض يأتي من السحب الرأسي — العلق والسحب الواسع بالكامل هما العمودان. والسماكة من التجديف الأفقي — تجديف البار وتجديف الدمبلين هما حصان العمل. أما الرفعة الميتة فتبني الناصبات وأسفل الظهر التي تؤطر البقية. سحبة رأسية وتجديفة ومفصلية في كل جلسة ظهر = قالب كامل؛ وأضف حركة أحادية كالسحب بذراع واحدة إذا كان أحد الجانبين متأخرًا.",
      },
      {
        qEn: "How do I widen my lats?",
        aEn:
          "Train vertical pulls hard and often, and chase the stretch: at the bottom of every Pull-Up or Lat Pulldown, let the lats lengthen fully under control before pulling. Volume matters too — 10–20 hard weekly sets across pulldowns, pull-ups and rows. Grip width matters less than people think; a comfortable grip taken through a full range with a 2–3 second controlled descent beats gimmick grips every time.",
        qAr: "كيف أوسّع عضلات الجناح؟",
        aAr:
          "درّب السحب الرأسي بجد وجهد وكرره، وطارد التمدد: أسفل كل علقة أو سحبة، اترك العضلة تتمدد كاملًا تحت السيطرة قبل السحب. والحجم مهم أيضًا — 10–20 مجموعة مكثفة أسبوعيًا موزعة على السحب والعلق والتجديف. عرض القبضة أقل أهمية مما يُظن؛ قبضة مريحة بمدى كامل وهبوط متحكَّم 2–3 ثوانٍ تتفوق على أي قبضة غريبة.",
      },
      {
        qEn: "Is the deadlift enough for back development?",
        aEn:
          "The deadlift is superb for the erectors, traps and overall posterior chain, but it is a hinge — not a pull. Your lats get isometric work holding the bar close, yet they never shorten and lengthen through a range the way growth requires. Treat the deadlift as the foundation, then add rows and vertical pulls on top of it. A back built on deadlifts alone ends up thick at the bottom and narrow at the top.",
        qAr: "هل الرفعة الميتة كافية لبناء الظهر؟",
        aAr:
          "الرفعة الميتة ممتازة للناصبات وشبه المنحرفة والسلسلة الخلفية كلها، لكنها حركة مفصلية — لا سحب. تحصل الجناحية على عمل ثابت لإمساك البار قريبًا، لكنها لا تقصر ولا تتمدد عبر مدى كما يتطلب النمو. اعتبر الرفعة أساسًا ثم ابنِ فوقها التجديف والسحب الرأسي. ظهر مبني على الرفعة وحدها ينتهي سميكًا أسفل وضيقًا أعلى.",
      },
      {
        qEn: "Pull-ups or lat pulldowns — which is better?",
        aEn:
          "They are the same movement with different loading tools. Pull-Ups load you with bodyweight and build serious strength; the Lat Pulldown lets you choose any load, which makes it ideal for beginners and for extra volume when you are already fatigued. If you cannot do full pull-ups yet, work through the Band-Assisted Pull-Up and pulldowns. Most good programs use both: pull-ups for strength, pulldowns for controlled volume.",
        qAr: "العلق أم السحب بالكابل — أيهما أفضل؟",
        aAr:
          "هي الحركة نفسها بأدوات حمل مختلفة. العلق يحملك بوزن جسمك ويبني قوة حقيقية؛ والسحب يتيح لك اختيار أي وزن، وهذا مثالي للمبتدئين وللحجم الإضافي حين تكون مُتعَبًا أصلًا. إن لم تستطع العلق الكامل بعد، فتدرّج عبر العلق بمساعدة المطاط والسحب بالكابل. أغلب البرامج الجيدة تجمعهما: علق للقوة وسحب لحجم متحكَّم به.",
      },
      {
        qEn: "How do I protect my lower back on back day?",
        aEn:
          "Three habits cover most of it. First, brace: take a breath into your belly and keep it before every heavy row or deadlift. Second, keep the spine neutral — the movement happens at the hips and shoulders, not by rounding or arching the lower back. Third, earn heavy hinges gradually: master the pattern light for weeks before the bar gets heavy. And never combine maximum deadlifts with fatigued, high-rep rows in the same session.",
        qAr: "كيف أحمي أسفل ظهري في يوم الظهر؟",
        aAr:
          "ثلاث عادات تغطي أغلب الأمر. أولًا الشدّ: خذ نفَسًا في بطنك واحتفظ به قبل كل تجديف ثقيل أو رفعة. ثانيًا حياد العمود الفقري — الحركة تحدث من الوركين والكتفين، لا بانحناء أسفل الظهر. ثالثًا استحقاق الأحمال الثقيلة تدريجيًا: أتقن النمط بأوزان خفيفة لأسابيع قبل أن يثقل البار. ولا تجمع أبدًا رفعة أقصى مع تجديف مُتعَب عالي التكرار في الجلسة نفسها.",
      },
      {
        qEn: "How often should I train back each week?",
        aEn:
          "Twice weekly suits most people: enough frequency to practice the patterns and accumulate 10–20 quality sets, with 2–3 days between sessions for recovery. If your back is a priority, a third lighter session (pulldowns and machine rows only) beats stacking more volume into two heavy days. Count indirect work too — deadlifts and heavy carries on leg day still load the back and belong in your weekly picture.",
        qAr: "كم مرة أدرّب الظهر أسبوعيًا؟",
        aAr:
          "مرتان أسبوعيًا تناسب أغلب الناس: تكرار كافٍ لإتقان الأنماط وجمع 10–20 مجموعة جيدة، مع 2–3 أيام بين الجلسات للاستشفاء. إن كان ظهرك أولوية، فجلسة ثالثة خفيفة (سحب كابل وتجديف آلات فقط) أفضل من حشو حجم إضافي في يومين ثقيلين. واحسب العمل غير المباشر — الرفعات والتجديفات الثقيلة يوم الأرجل تُحمّل الظهر أيضًا وتدخل في حصيلتك الأسبوعية.",
      },
    ],
  },

  shoulders: {
    guideEn:
      "The shoulder is three muscles in one cap: the anterior delt (front, works in every press), the lateral delt (the side cap that creates visual width), and the posterior delt (rear, the most neglected and the most responsible for healthy shoulder mechanics). Presses build the front and overall strength; direct raises are what actually develop the side and rear heads.\n\n" +
      "The library's 125-exercise shoulder family spans presses (Barbell Shoulder Press, Arnold Dumbbell Press), lateral raises (Cable Seated Lateral Raise and dumbbell variants), rear-delt work (Cable Rear Delt Fly, Face Pull), and advanced bodyweight (Handstand Push-Ups) — plus 22 kettlebell options for those who train with them.\n\n" +
      "Programming guide:\n" +
      "- 1–2 overhead presses per week for strength, 2–3 direct raise movements for shape\n" +
      "- 12–20 hard sets weekly across all three heads; rear delts get at least a quarter of them\n" +
      "- 8–12 reps on presses, 12–20 on raises — light raise work needs high reps to grow\n" +
      "- Count pressing days: chest day's presses already tax the front delts",
    guideAr:
      "الكتف ثلاث عضلات في قبعة واحدة: الأمامية (تعمل في كل دفعة)، والجانبية (القبعة الجانبية التي تصنع العرض البصري)، والخلفية (الأكثر إهمالًا والأكثر مسؤولية عن صحة ميكانيكا الكتف). الدفعات تبني الأمامية والقوة العامة؛ أما الرفوف المباشرة فهي ما يُنمّي الجانبية والخلفية فعلًا.\n\n" +
      "تشمل عائلة الكتف في المكتبة الدفعات (ضغط كتف بالبار، ضغط أرنولد بالدمبل)، والرفوف الجانبية (بالكابل وبالدمبل)، وعمل الكتف الخلفي (ذبابة كابل خلفية، وشبك الوجه)، والحركات المتقدمة بوزن الجسم (وقفة اليد) — مع 22 خيارًا بالكيتل بيل لمحبيها.\n\n" +
      "دليل التنظيم:\n" +
      "- دفعة واحدة أو اثنتان فوق الرأس أسبوعيًا للقوة، وحركتا رفع مباشرتان للشكل\n" +
      "- 12–20 مجموعة مكثفة أسبوعيًا موزعة على الرؤوس الثلاثة؛ والخلفية تأخذ ربعها على الأقل\n" +
      "- 8–12 تكرارًا في الدفعات و12–20 في الرفوف — عمل الرفوف الخفيف ينمو بالتكرارات العالية\n" +
      "- احسب أيام الدفع: بنش الصدر يُتعب الكتف الأمامي أصلًا",
    faq: [
      {
        qEn: "What are the best shoulder exercises?",
        aEn:
          "One press, one lateral raise, one rear-delt move covers all three heads: Barbell Shoulder Press or Arnold Dumbbell Press for strength and the front delt, Cable Seated Lateral Raise for the side cap, and Face Pull or Cable Rear Delt Fly for the rear. That trio, progressed over months, builds balanced shoulders better than any single \"best\" exercise. Add shrugs if your traps lag behind the rest of the cap.",
        qAr: "ما أفضل تمارين الكتف؟",
        aAr:
          "دفعة ورفعة جانبية وحركة كتف خلفي تغطي الرؤوس الثلاثة: ضغط الكتف بالبار أو ضغط أرنولد للقوة والأمامية، والرف الجانبي بالكابل للقبعة الجانبية، وشبك الوجه أو الذبابة الخلفية بالكابل للخلفية. هذه الثلاثية بتدرّج شهري تبني كتفًا متوازنًا أفضل من أي «أفضل تمرين» منفرد. أضف الشراگ إذا كانت شبه المنحرفة متأخرة.",
      },
      {
        qEn: "How do I build wider shoulders?",
        aEn:
          "Width lives in the lateral delts, so train them directly and frequently: 12–20 weekly sets of overhead pressing plus dedicated lateral raises, most in the 12–20 rep range taken close to failure. Progress by adding reps, then load. Keep posture tall — rounded shoulders visually shrink even developed delts. And be patient: the lateral delt is a small muscle, so visible width changes typically show after 8–12 weeks of consistent work.",
        qAr: "كيف أوسّع كتفي؟",
        aAr:
          "العرض يسكن العضلة الجانبية، فدرّبها مباشرة وباستمرار: 12–20 مجموعة أسبوعية تجمع الدفع فوق الرأس مع رفوف جانبية مخصصة، أغلبها بمدى 12–20 تكرارًا قريبًا من الفشل. تدرّج بزيادة التكرارات ثم الوزن. وحافظ على قوام مرفوع — الأكتاف المحدَّبة تُصغّر بصريًا حتى العضلات المبنية. وكن صبورًا: الجانبية عضلة صغيرة، والتغير البصري يظهر عادة بعد 8–12 أسبوعًا.",
      },
      {
        qEn: "Why do my shoulders hurt when I press overhead?",
        aEn:
          "Commonly it is a volume and balance problem, not a damaged joint: months of pressing with zero rear-delt and rotator work lets the front of the shoulder overpower everything behind it. Cut pressing volume by a third for two weeks, add Face Pulls and rear-delt flyes twice a week, warm up with controlled circular motions before pressing, and stop every set 2–3 reps short of failure. Pain that persists beyond that warrants a professional assessment.",
        qAr: "لماذا يؤلمني كتفي عند الدفع فوق الرأس؟",
        aAr:
          "السبب الشائع مشكلة حجم وتوازن لا مفصل متضرر: أشهر من الدفع بلا أي عمل للكتف الخلفي والكُفة المدورة تجعل أمام الكتف يتفوق على كل ما خلفه. قلّل حجم الدفع للثلث لأسبوعين، وأضف شبك الوجه والذبابة الخلفية مرتين أسبوعيًا، وسخّن بحركات دائرية متحكَّمة قبل الدفع، وتوقف عن كل مجموعة قبل الفشل بمقدار 2–3 تكرار. والألم المستمر بعدها يستحق تقييمًا من مختص.",
      },
      {
        qEn: "How many sets should I do for shoulders each week?",
        aEn:
          "Aim for 12–20 hard weekly sets across all three delt heads, split over 2 sessions. Remember that chest and triceps days already load the front delts through pressing — so direct shoulder work can lean toward raises and rear-delt moves rather than more pressing. A practical split: presses plus lateral raises on day one, rear-delt and lighter raise work on day two, both within 1–3 reps of failure.",
        qAr: "كم مجموعة أحتاج للكتف أسبوعيًا؟",
        aAr:
          "استهدف 12–20 مجموعة مكثفة أسبوعيًا على الرؤوس الثلاثة، موزعة على جلستين. وتذكّر أن أيام الصدر والترايسبس تُحمّل الكتف الأمامي بالفعل عبر الدفع — لذا يمكن أن يميل عمل الكتف المباشر نحو الرفوف والخلفية بدل مزيد من الدفعات. تقسيم عملي: دفعات ورفوف جانبية اليوم الأول، وعمل خلفي ورفوف خفيفة اليوم الثاني، كلاهما ضمن 1–3 تكرارات من الفشل.",
      },
      {
        qEn: "Dumbbell or barbell for shoulder pressing?",
        aEn:
          "Both work; they differ in feel and limit. The barbell lets you load the heaviest and progress in small increments — best for pure strength. Dumbbells offer a longer range of motion, force each arm to pull its own weight (fixing left-right gaps), and are easier on cranky shoulders because you can angle the path. A simple rule: barbell press as your main strength lift, dumbbell press as your second movement of the week.",
        qAr: "الدمبل أم البار لضغط الكتف؟",
        aAr:
          "كلاهما ينجح؛ والفرق في الإحصاء والحد. البار يتيح أعلى الأحمال وزيادات صغيرة — الأفضل للقوة الصافية. والدمبل يمنح مدى أطول ويُلزم كل ذراع بحمل ثقلها (يصلح الفوارق بين الجانبين)، وألطف على الأكتاف المتحسسة لأنك تستطيع ميلان المسار. قاعدة بسيطة: ضغط البار تمرين القوة الرئيسي، وضغط الدمبل الحركة الثانية في الأسبوع.",
      },
      {
        qEn: "Are behind-the-neck presses necessary?",
        aEn:
          "No — and for most people they are not worth the risk. Pressing behind the neck puts the shoulder in extreme external rotation under load, which demands exceptional mobility to do safely. Everything the front press offers — strength, front and side delt development, triceps work — is available with a safer bar path in front of the head. If your overhead mechanics are healthy and coached, it is optional history, not a requirement.",
        qAr: "هل الدفع خلف الرقبة ضروري؟",
        aAr:
          "لا — ولأغلب الناس لا يستحق المخاطرة. الدفع خلف الرقبة يضع الكتف في دوران خارجي أقصى تحت الحمل، وهذا يتطلب مرونة استثنائية ليكون آمنًا. وكل ما يقدمه الدفع الأمامي — القوة وبناء الأمامية والجانبية وعمل الترايسبس — متاح بمسار بار أكثر أمانًا أمام الرأس. إن كانت ميكانيكا كتفك سليمة وبتوجيه، فهو تاريخ اختياري لا شرط.",
      },
    ],
  },

  legs: {
    guideEn:
      "The legs hold more than half your muscle mass, which is why leg day feels systemic and why leg training drives results everywhere else. Four functions to train: knee extension (quads), hip extension (glutes and hamstrings), single-leg balance (adductors, stabilizers), and ankle extension (calves). A complete plan touches all four weekly.\n\n" +
      "With 297 exercises, legs are the library's largest family: barbell squats (Barbell Squat, Box Squat), hinges (Romanian Deadlift, Barbell Hip Thrust), lunges (Barbell Walking Lunge, Bodyweight Walking Lunge), machine work (Leg Press, Leg Extensions, Lying Leg Curls), calf raises (Seated Calf Raise), and a deep bodyweight section for home trainees.\n\n" +
      "Programming guide:\n" +
      "- 2 leg sessions per week: one squat-dominant, one hinge-dominant\n" +
      "- 10–20 hard sets weekly; large muscles recover in 48–72 hours\n" +
      "- 5–10 reps on heavy compound lifts, 10–20 on machine and single-leg work\n" +
      "- Calves and adductors: direct work 2x weekly, 12–20 reps, stretched position emphasized",
    guideAr:
      "الأرجل تحمل أكثر من نصف كتلة عضلات جسمك، ولهذا يشعر يوم الأرجل بتأثيره في كل الجسم، ولماذا يدفعه التدريب لنتائج في كل مكان آخر. أربع وظائف تدرّبها: بسط الركبة (الفخذ الأمامية)، وبسط الورك (المؤخرة وأوتار الركبة)، والتوازن الأحادي (الضامّة والمثبتات)، وبسط الكاحل (السمانة). الخطة الكاملة تلمس الأربعة أسبوعيًا.\n\n" +
      "بعائلة من 297 تمرينًا، الأرجل هي الأكبر في المكتبة: سكوات بالبار (سكوات، سكوات صندوقي)، ومفصلية (رفعة رومانية، دفع الورك بالبار)، وطعنات (طعن متجول بالبار ووزن الجسم)، وآلات (ضغط الأرجل، البسط، ثني الأوتار)، وسمانة (جلوسًا)، وقسم وزن جسم عميق لمتدربي المنزل.\n\n" +
      "دليل التنظيم:\n" +
      "- جلستان أسبوعيًا: واحدة سكواتية والأخرى مفصلية\n" +
      "- 10–20 مجموعة مكثفة أسبوعيًا؛ العضلات الكبيرة تستشف خلال 48–72 ساعة\n" +
      "- 5–10 تكرارات في المركّبات الثقيلة و10–20 في الآلات والأحادي\n" +
      "- السمانة والضامّة: عمل مباشر مرتين أسبوعيًا، 12–20 تكرارًا، مع التأكيد على وضعية التمدد",
    faq: [
      {
        qEn: "What are the best leg exercises?",
        aEn:
          "Four patterns cover the legs: a squat (Barbell Squat or Leg Press), a hinge (Romanian Deadlift or Barbell Hip Thrust), a lunge (Barbell Walking Lunge), and a direct calf raise (Seated Calf Raise). Squats and presses bias the quads, hinges and hip thrusts bias the glutes and hamstrings, lunges tie strength into balance. Train all four patterns weekly and you will never need to hunt for exotic variations.",
        qAr: "ما أفضل تمارين الأرجل؟",
        aAr:
          "أربعة أنماط تغطي الأرجل: سكوات (سكوات بالبار أو ضغط الأرجل)، ومفصلية (الرفعة الرومانية أو دفع الورك)، وطعنة (الطعن المتجول)، ورف سمانة مباشر (جلوسًا). السكوات والضغط يميلان للفخذ الأمامي، والمفصلية ودفع الورك للمؤخرة والأوتار، والطعن يربط القوة بالتوازن. درّب الأنماط الأربعة أسبوعيًا ولن تحتاج البحث عن تنويعات غريبة.",
      },
      {
        qEn: "How many times a week should I train legs?",
        aEn:
          "Twice weekly is the standard for good reason: legs carry so much mass that each session creates a large recovery demand, typically 48–72 hours. One squat-dominant day and one hinge-dominant day distribute the load sensibly. Beginners can start with one full-body session including legs and add the second within a month. Advanced lifters who want more leg volume should add lighter machine work, not repeat maximum squats.",
        qAr: "كم مرة أدرّب الأرجل أسبوعيًا؟",
        aAr:
          "مرتان أسبوعيًا هي المعيار لسبب وجيه: الأرجل تحمل كتلة هائلة وكل جلسة تخلق طلب استشفاء كبيرًا يتراوح بين 48–72 ساعة. يوم سكواتي ويوم مفصلي يوزعان الحمل بذكاء. يستطيع المبتدئ البدء بجلسة شاملة واحدة تشمل الأرجل وإضافة الثانية خلال شهر. والمتقدمون الراغبون في حجم أكبر يضيفون آلات خفيفة لا إعادة سكوات الأقصى.",
      },
      {
        qEn: "Are squats enough for glute development?",
        aEn:
          "Squats build glutes, but they are a knee-dominant lift — the glutes share the work with the quads. Hip-dominant moves bias the glutes directly: the Barbell Hip Thrust loads them hardest at full contraction, and Romanian Deadlifts load them at full stretch. The strongest glute programs pair a squat pattern with a thrust or hinge pattern. Add lunges for the single-leg stability that keeps both heavy lifts progressing.",
        qAr: "هل السكوات كافٍ لبناء المؤخرة؟",
        aAr:
          "السكوات يبني المؤخرة لكنه حركة ركبة أولًا — المؤخرة تشارك العمل مع الفخذ الأمامي. أما الحركات الوركية فتميل للمؤخرة مباشرة: دفع الورك بالبار يحملها بأقصى انقباض، والرفعة الرومانية بأقصى تمدد. أقوى برامج المؤخرة تجمع نمط سكوات مع نمط دفع أو مفصلية. وأضف الطعنات لثبات الساق الواحد الذي يُبقي الرفّين الثقيلين يتقدمان.",
      },
      {
        qEn: "Can I build legs with bodyweight exercises only?",
        aEn:
          "Yes, up to an intermediate level — the library holds 143 bodyweight leg exercises for a reason. Bodyweight Squats and Walking Lunges build the base; progress by slowing the tempo, adding pauses, moving to single-leg variations, and raising volume. Beyond that plateau, external load becomes the honest next step for continued strength: even one barbell or a pair of dumbbells unlocks years of progression on the same patterns.",
        qAr: "هل أبني أرجل بوزن الجسم فقط؟",
        aAr:
          "نعم حتى مستوى متوسط — ولذلك تضم المكتبة 143 تمرين رجل بوزن الجسم. سكوات وزن الجسم والطعنات المتجولة تبني الأساس؛ وتدرّج بإبطاء الزمن، وإضافة الوقفات، والانتقال للأحادي، ورفع الحجم. وبعد ذلك الهضبة، يصير الحمل الخارجي الخطوة القادمة الصادقة للقوة المستمرة: حتى بار واحد أو دمبلان يفتحان سنوات تدرج على الأنماط نفسها.",
      },
      {
        qEn: "Why is leg day so exhausting compared to other days?",
        aEn:
          "Because the legs are your largest muscle group — a hard squat or leg-press session recruits enormous muscle mass at once, which raises heart rate, oxygen demand and the after-session recovery cost far above an arm or shoulder day. Work with it, not against it: schedule leg days before rest days or lighter sessions, sleep well, keep leg-session volume in the 10–20 hard-set range, and eat enough around training.",
        qAr: "لماذا يوم الأرجل مُنهك مقارنة ببقية الأيام؟",
        aAr:
          "لأن الأرجل أكبر مجموعة عضلية — جلسة السكوات أو ضغط الأرجل المكثفة تستشرك كتلة عضلية هائلة دفعة واحدة، فيرتفع النبض والطلب الأكسجيني وتكلفة الاستشفاء بعدها فوق أي يوم ذراع أو كتف بمراحل. تعامل مع الواقع لا ضده: جدول يوم الأرجل قبل يوم راحة أو جلسة خفيفة، نام جيدًا، وأبقِ حجم الجلسة بين 10–20 مجموعة مكثفة، وكُل بما يكفي حول التدريب.",
      },
      {
        qEn: "How do I fix knee discomfort during squats?",
        aEn:
          "First the technique basics: sit back into the squat rather than dropping straight down, keep knees tracking over the toes, and control the descent — the knee dislikes sudden ballistic folding under load. Box Squats teach the hip-dominant path safely. Improve ankle mobility, and cap depth at the range you can control. If discomfort persists at light loads or includes swelling and locking, stop loading and see a professional — that pattern needs diagnosis, not a harder warm-up.",
        qAr: "كيف أعالج انزعاج الركبة أثناء السكوات؟",
        aAr:
          "أساسيات التقنية أولًا: اجلس للخلف في السكوات لا هبوطًا مستقيمًا، وأبقِ الركبتين في اتجاه أصابع القدم، وهبوط متحكَّم — الركبة تكره الطيّ المفاجئ تحت الحمل. السكوات الصندوقي يعلّم المسار الوركي بأمان. حسّن مرونة الكاحل، وحدّد العمق عند المدى الذي تتحكم به. وإن استمر الانزعاج بأوزان خفيفة أو صاحبه تورم وقفل، فتوقف عن التحميل وراجع مختصًا — هذه الصورة تحتاج تشخيصًا لا تسخينًا أقوى.",
      },
    ],
  },

  biceps: {
    guideEn:
      "The biceps crosses two joints — it flexes the elbow and supinates the forearm (turning the palm up) — so curls that combine both actions train it most completely. Its neighbor, the brachialis, sits underneath and pushes the biceps up visually; hammer-grip curls bias it. That is why a biceps plan is really a curl-family plan, not a single exercise.\n\n" +
      "The library holds 78 arm-flexor exercises: barbell work (Barbell Curl, Close-Grip Standing Barbell Curl), dumbbells (Hammer Curls, Concentration Curls, Incline Hammer Curls for the stretched long head), cable tension (Cable Preacher Curl), and machine isolation (Machine Preacher Curls).\n\n" +
      "Programming guide:\n" +
      "- 8–14 hard sets per week across 2–3 sessions; small muscles need less volume than you think\n" +
      "- 8–12 reps, full range, strict form — momentum steals the stimulus from the biceps\n" +
      "- One supinated curl plus one hammer/neutral curl weekly covers biceps and brachialis\n" +
      "- Chin-ups and heavy rows count as indirect biceps work; program direct curls around them",
    guideAr:
      "عضلة البايسبس تعبر مفصلين — تثني الكوع وتقلب الساعد (رفع الكف للأعلى) — لذا فإن التمارين التي تجمع الفعلين تدرّبها أكمل تدريب. وجارتها العضلة العضدية تجلس تحتها وتدفع البايسبس بصريًا للأعلى؛ وقبضة المطرقة تميل لها. ولهذا فإن خطة البايسبس هي فعلًا خطة عائلة الثني لا تمرين واحد.\n\n" +
      "تضم المكتبة 78 تمرينًا لثنيات الذراع: عمل البار (ثني بالبار، ثني واقف قبضة ضيقة)، والدمبل (ثني مطرقة، ثني تركيز، ثني مائل مطرقة للرأس الطويل الممدود)، وشد الكابل (ثني كاهلي بالكابل)، وعزل الآلة.\n\n" +
      "دليل التنظيم:\n" +
      "- 8–14 مجموعة مكثفة أسبوعيًا عبر 2–3 جلسات؛ العضلة الصغيرة تحتاج حجمًا أقل مما تتصور\n" +
      "- 8–12 تكرارًا، مدى كامل، تقنية صارمة — الزخم يسرق الحافز من البايسبس\n" +
      "- ثني بقبضة مقلوبة وآخر بمطرقة أسبوعيًا يغطيان البايسبس والعضدية\n" +
      "- العلق والتجديف الثقيل عمل غير مباشر للبايسبس؛ برمج الثني المباشر حولهما",
    faq: [
      {
        qEn: "What are the best biceps exercises?",
        aEn:
          "A short, honest list beats a long one: Barbell Curl as the heavy base, Incline Hammer Curls or any curl taken from a stretched position for the long head, Hammer Curls for the brachialis thickness under the biceps, and Concentration Curls or Cable Preacher Curl for strict isolation at the end of the session. Two to three of these, progressed consistently, grow the whole arm-flexor group.",
        qAr: "ما أفضل تمارين البايسبس؟",
        aAr:
          "قائمة قصيرة صادقة تتفوق على طويلة: ثني البار كأساس ثقيل، وثني مائل مطرقة أو أي ثني من وضعية تمدد للرأس الطويل، وثني المطرقة لسماكة العضدية تحت البايسبس، وثني التركيز أو ثني الكاهل بالكابل للعزل الصارم نهاية الجلسة. اثنان أو ثلاثة منها بتدرّج ثابت يُنمّيان مجموعة ثني الذراع كلها.",
      },
      {
        qEn: "How often should I train biceps?",
        aEn:
          "Two to three short sessions weekly with 8–14 total hard sets is plenty — the biceps is a small muscle that also works hard in every pull-up, row and deadlift you do. One dedicated slot after back day plus one or two curl movements at the end of other sessions covers it. More than that mostly produces soreness, not growth.",
        qAr: "كم مرة أدرّب البايسبس؟",
        aAr:
          "جلستان إلى ثلاث قصيرة أسبوعيًا بإجمالي 8–14 مجموعة مكثفة تكفي تمامًا — البايسبس عضلة صغيرة تعمل بجد أيضًا في كل علقة وتجديف ورفعة. موعد مخصص بعد يوم الظهر وحركة أو حركتا ثني نهاية جلسات أخرى تغطيان الحاجة. أكثر من ذلك ينتج تعبًا أكثر منه نموًا.",
      },
      {
        qEn: "Why aren't my biceps growing?",
        aEn:
          "The usual culprit is momentum: swinging the torso, heaving the elbow forward, dropping the weight fast. Every shortcut moves tension away from the biceps. Fix it with a 2–3 second controlled lowering phase, elbows pinned at your sides, full stretch at the bottom, and a weight that leaves 1–3 reps in reserve. Growth also needs time — visible arm changes typically appear after 8–12 weeks of this stricter execution.",
        qAr: "لماذا لا ينمو البايسبس عندي؟",
        aAr:
          "المتهم الأول الزخم: تأرجح الجذع، ودفع الكوع للأمام، وإسقاط الوزن بسرعة. كل اختصار ينقل الشد بعيدًا عن البايسبس. عالجه بهبوط متحكَّم 2–3 ثوانٍ، ومرفقان مثبتان على الجانبين، وتمدّد كامل أسفل الحركة، ووزن يترك 1–3 تكرارات احتياط. والنمو يحتاج وقتًا — تغيّر الذراع البصري يظهر عادة بعد 8–12 أسبوعًا من التنفيذ الأصعب هذا.",
      },
      {
        qEn: "Should I lift heavy or light for biceps?",
        aEn:
          "Load matters less than proximity to failure with clean form. Research on hypertrophy shows similar muscle growth across a wide rep range — roughly 6 to 20 — as long as sets end within a few reps of failure. For biceps specifically, moderate loads in the 8–12 range are the practical choice: heavy enough to be meaningful, light enough to keep the elbows happy and the technique strict.",
        qAr: "أثقل أم أخف لبناء البايسبس؟",
        aAr:
          "الوزن أقل أهمية من القرب من الفشل بتقنية نظيفة. تُظهر أبحاث التضخيم نموًا عضليًا متكافئًا عبر مدى تكرارات واسع — تقريبًا 6 إلى 20 — بشرط أن تنتهي المجموعات قريبة من الفشل. وللبايسبس تحديدًا، الأوزان المعتدلة بمدى 8–12 هي الخيار العملي: ثقيلة بما تكفي للمعنى، وخفيفة بما يكفي لراحة الكوع وصرامة التقنية.",
      },
      {
        qEn: "Do chin-ups build biceps?",
        aEn:
          "Yes — an underhand-grip pull-up is one of the best compound biceps exercises that exists. The elbows flex under your full bodyweight through a complete range, which is exactly the biceps job description. Program chin-ups or Pull-Ups as your pull of choice and count them toward weekly arm volume; then the direct curls you add afterwards need far fewer sets to finish the job.",
        qAr: "هل العلق يبني البايسبس؟",
        aAr:
          "نعم — العلق بقبضة مقلوبة من أفضل تمارين البايسبس المركّبة الموجودة أصلًا. الكوعان يثنيان تحت كامل وزن جسمك عبر مدى كامل، وهذا بالضبط وصف وظيفة البايسبس. برمج العلق كسحبتك المفضلة واحسبه ضمن الحجم الأسبوعي للذراعين؛ حينها تحتاج الثني المباشر الذي يليه مجموعات أقل بكثير لإتمام العمل.",
      },
      {
        qEn: "How long until my arms look bigger?",
        aEn:
          "Arms are measured in months, not weeks. With consistent progressive training and enough protein, most trainees notice firmer sleeves at 8–12 weeks and a clear tape-measure difference around the 6-month mark. The upper arm also grows indirectly — triceps make up most of its mass, so pressing and overhead work quietly contribute. Track circumference monthly and let the log, not the mirror, tell the story.",
        qAr: "متى تبدو ذراعاي أكبر؟",
        aAr:
          "الذراعان تُقاسان بالأشهر لا بالأسابيع. بتدريب تدريجي ثابت وبروتين كافٍ، يلاحظ أغلب المتدربين ثباتًا أكبر في الكمّ عند 8–12 أسبوعًا وفرقًا واضحًا بالشريط عند علامة الستة أشهر. والذراع تنمو غير مباشر أيضًا — الترايسبس يشكل أغلب كتلتها، فالضغط والعمل فوق الرأس يساهمان بهدوء. قِس المحيط شهريًا ودع السجل لا المرآة يحكي القصة.",
      },
    ],
  },

  triceps: {
    guideEn:
      "The triceps has three heads and makes up roughly two-thirds of the upper arm's mass — which means most of \"bigger arms\" is actually triceps work. All three heads extend the elbow; the long head additionally attaches at the shoulder, so it trains best when the arm moves overhead or behind the body, where it runs stretched under load.\n\n" +
      "The library's 71-exercise family includes compound pressing (Close-Grip Barbell Bench Press), bodyweight extension (Bench Dips), cable work (Triceps Pushdown for constant tension, Triceps Overhead Extension with Rope for the stretched long head), and loaded stretching (Band Skull Crusher, Close-Grip EZ Bar Press).\n\n" +
      "Programming guide:\n" +
      "- 8–14 hard sets per week on top of pressing days, split across 2–3 sessions\n" +
      "- 8–12 reps on compounds and pushdowns, 10–15 on stretch-biased movements\n" +
      "- One press, one pushdown, one overhead/stretch movement weekly covers all three heads\n" +
      "- Elbows stay tucked and move only at the joint — flaring shifts work away from the triceps",
    guideAr:
      "الترايسبس ثلاثة رؤوس ويشكل نحو ثلثي كتلة الذراع العلوية — أي أن أغلب «تكبير الذراع» هو فعلًا عمل ترايسبس. الرؤوس الثلاثة تبسط الكوع؛ والرأس الطويل يرتبط إضافيًا بالكتف، فيتدرّب أفضل حين يتحرك الذراع فوق الرأس أو خلف الجسم حيث يمتد تحت الحمل.\n\n" +
      "تضم عائلة المكتبة (71 تمرينًا) الدفع المركّب (بنش ضيق بالبار)، والبسط بوزن الجسم (غطس على المقعد)، وعمل الكابل (دفع الترايسبس بالحبل لشد ثابت، والبسط فوق الرأس بالحبل للرأس الطويل)، والتمدد المحمّل (تمزيق بمطاط، ضغط ضيق بمونة EZ).\n\n" +
      "دليل التنظيم:\n" +
      "- 8–14 مجموعة مكثفة أسبوعيًا فوق أيام الدفع، موزعة على 2–3 جلسات\n" +
      "- 8–12 تكرارًا للمركّبات والدفع، و10–15 للحركات المائلة للتمدد\n" +
      "- دفعة ودفع متمدد وحركة فوق الرأس أسبوعيًا تغطي الرؤوس الثلاثة\n" +
      "- المرفقان قريبان ولا يتحركان إلا عند المفصل — التباعد ينقل العمل بعيدًا عن الترايسبس",
    faq: [
      {
        qEn: "What are the best triceps exercises?",
        aEn:
          "Cover all three heads with three movements: Close-Grip Barbell Bench Press as the heavy compound, Triceps Pushdown (rope or V-bar attachment) for constant-tension extension, and a stretch-position move like Band Skull Crusher for the long head. Bench Dips are an excellent bodyweight addition. Progress these four over months and the back of your arm has no choice but to grow.",
        qAr: "ما أفضل تمارين الترايسبس؟",
        aAr:
          "غطِّ الرؤوس الثلاثة بثلاث حركات: بنش ضيق بالبار كمركّب ثقيل، ودفع الترايسبس بالحبل أو بمقبض V لبسط بشد ثابت، وحركة من وضعية التمدد كالتمزيق بالمطاط للرأس الطويل. والغطس على المقعد إضافة ممتازة بوزن الجسم. طوّر هذه الأربعة شهورًا ولن يكون خلف ذراعك أمام النمو إلا النمو.",
      },
      {
        qEn: "Why are triceps so important for bigger arms?",
        aEn:
          "Simple anatomy: the triceps occupies about two-thirds of the upper arm's volume, the biceps only about a third. Trainees who chase biceps peaks while ignoring triceps work on the smaller share of the arm. Balanced arm training leans triceps-first — presses, pushdowns and extensions — with dedicated biceps volume layered on top. That is also why big pressers often carry big arms without many curls.",
        qAr: "لماذا الترايسبس مهم جدًا لتكبير الذراع؟",
        aAr:
          "تشريح بسيط: الترايسبس يشغل نحو ثلثي حجم الذراع العلوية، والبايسبس نحو الثلث فقط. المتدربون الذين يطاردون قمة البايسبس ويتجاهلون الترايسبس يعملون على الحصة الأصغر من الذراع. التدريب المتوازن يميل للترايسبس أولًا — دفعات ودفعات متمددة — مع حجم بايسبس مخصص فوقها. ولهذا أيضًا يحمل الدافعون الكبار أذرعًا كبيرة بثنيات قليلة.",
      },
      {
        qEn: "Are dips or pushdowns better for triceps?",
        aEn:
          "They are different tools for the same job. Dips (Bench Dips for most trainees) are a compound movement — you move your whole body, so the load is naturally high and the shoulders and chest assist. Pushdowns are isolation with constant cable tension, easier to progress in small steps and kinder to fatigued joints. The practical answer: dips early in the session for load, pushdowns late for controlled volume.",
        qAr: "الغطس أم الدفع بالكابل للترايسبس؟",
        aAr:
          "هما أداتان مختلفتان للوظيفة نفسها. الغطس (على المقعد لأغلب المتدربين) حركة مركّبة — تحرك جسمك كله فالحمل مرتفع طبيعيًا ويساعد الكتفان والصدر. والدفع عزل بشد كابل ثابت، أسهل تدرّجًا بخطوات صغيرة وألطف على المفاصل المتعبة. الإجابة العملية: غطس مبكرًا في الجلسة للحمل، ودفع متأخرًا لحجم متحكَّم به.",
      },
      {
        qEn: "How often should I train triceps?",
        aEn:
          "Two to three sessions weekly, with 8–14 direct hard sets, remembering that every chest and shoulder press already loads the triceps hard. Space sessions at least 48 hours apart and keep the last set of each movement within 1–3 reps of failure. If your elbows start complaining, drop to two sessions and replace one pushdown movement with a band variation for a week.",
        qAr: "كم مرة أدرّب الترايسبس؟",
        aAr:
          "جلستان إلى ثلاث أسبوعيًا بإجمالي 8–14 مجموعة مكثفة مباشرة، مع تذكّر أن كل دفعة صدر أو كتف تُحمّل الترايسبس بقوة أصلًا. فصّل الجلسات بـ48 ساعة على الأقل وأبقِ آخر مجموعة كل حركة ضمن 1–3 تكرارات من الفشل. وإن بدأ الكوعان بالشكوى، انزل لجلستين واستبدل حركة دفع بتنويع مطاط أسبوعًا.",
      },
      {
        qEn: "Why do my elbows hurt during triceps pushdowns?",
        aEn:
          "Elbow discomfort at pushdowns usually traces to three things: snapping the arm violently straight at lockout, letting the elbows drift forward and flare during the rep, and stacking pushdowns right after heavy close-grip pressing. Keep the elbows pinned to your ribs, control both halves of the rep, stop short of grinding lockouts, and warm the elbows with light band extensions first. Persistent or sharp pain — especially with gripping — needs professional assessment.",
        qAr: "لماذا يؤلمني الكوع أثناء دفع الترايسبس؟",
        aAr:
          "انزعاج الكوع عند الدفع يعود عادة لثلاثة أمور: فرد الذراع بعنف عند القفل، وانحراف المرفقين أمامًا وتباعدهم أثناء التكرار، وتراص الدفع مباشرة بعد بنش ضيق ثقيل. ثبّت المرفقين قرب ضلوعك، وتحكّم في نصفي التكرار، وتوقف قبل قفل شاق، وسخّن الكوعين ببسط مطاط خفيف أولًا. والألم المستمر أو الحاد — خصوصًا مع الإمساك — يحتاج تقييم مختص.",
      },
      {
        qEn: "How do I target the long head of the triceps?",
        aEn:
          "Put the arm overhead or behind the body. Because the long head crosses the shoulder joint, movements that raise the arm — overhead extensions like Triceps Overhead Extension with Rope, and skull-crusher patterns — place it in its stretched, highest-growth position. Standard pushdowns and presses stay valuable for the lateral and medial heads; the long head just needs its stretch work included weekly.",
        qAr: "كيف أستهدف الرأس الطويل للترايسبس؟",
        aAr:
          "ارفع الذراع فوق الرأس أو خلف الجسم. لأن الرأس الطويل يعبر مفصل الكتف، الحركات التي ترفع الذراع — البسط فوق الرأس كبسط الترايسبس بالحبل، وأنماط التمزيق — تضعه في وضعية تمدده الأعلى نموًا. وتبقى الدفعات القياسية قيّمة للرأسين الجانبي والأوسط؛ الرأس الطويل يحتاج فقط أن يكون عمل تمدده حاضرًا أسبوعيًا.",
      },
    ],
  },

  core: {
    guideEn:
      "The core is more than the six-pack: it is the obliques that rotate and resist rotation, the deep transverse layer that braces, the rectus that flexes the trunk, and the lower-back stabilizers that keep the spine safe under load. Training only crunches trains one function of at least four — and the functions you skip are the ones that make squats, deadlifts and daily life safer and stronger.\n\n" +
      "The library's 99-exercise core family covers every function: anti-extension (Plank, Ab Roller), flexion (Crunches, Cable Crunch), rotation and anti-rotation (Russian Twist, Cable Russian Twists), leg-driven lower-ab work (Hanging Leg Raise), and conditioning (Air Bike).\n\n" +
      "Programming guide:\n" +
      "- Train core 2–4x weekly at the end of sessions, 5–10 minutes per session\n" +
      "- Rotate one brace, one flexion and one rotation movement across the week\n" +
      "- 2–3 sets of 30–60 seconds for holds, 10–20 reps for dynamic movements\n" +
      "- Visible abs come from body-fat level, not from rep counts — train the core, manage the kitchen",
    guideAr:
      "الكور أكثر من عضلات الست باك: إنه المائلات التي تُدير الجذع وتقاوم الدوران، والطبقة العميقة التي تُشدّ الجذع، والمستقيمة التي تثني الجذع، ومثبتات أسفل الظهر التي تحمي العمود الفقري تحت الحمل. تدريب الثني وحده يدرب وظيفة واحدة من أربع على الأقل — والوظائف المتروكة هي ما يجعل السكوات والرفعات والحياة اليومية أقوى وأأمن.\n\n" +
      "تغطي عائلة الكور في المكتبة (99 تمرينًا) كل الوظائف: مقاومة البسط (بلانك، عجلة البطن)، والثني (عضلات البطن، ثني الكابل)، والدوران ومقاومته (لف روسي، لف روسي بالكابل)، وعمل أسفل البطن بالساقين (رفع الأرجل معلقًا)، واللياقة (الدراجة الهوائية).\n\n" +
      "دليل التنظيم:\n" +
      "- درّب الكور 2–4 مرات أسبوعيًا نهاية الجلسات، 5–10 دقائق لكل جلسة\n" +
      "- نوّع حركة شدّ وحركة ثني وحركة دوران عبر الأسبوع\n" +
      "- 2–3 مجموعات من 30–60 ثانية للحفظ، و10–20 تكرارًا للحركات الديناميكية\n" +
      "- ظهور عضلات البطن من مستوى الدهون لا من عدد التكرارات — درّب الكور وأدر المطبخ",
    faq: [
      {
        qEn: "What are the best core exercises?",
        aEn:
          "Three movements cover the main functions: the Plank (and its harder progressions) for bracing and anti-extension, the Hanging Leg Raise for the lower-abdominal and hip-flexor chain, and the Cable Crunch for loaded flexion that can actually be progressed in weight. Add a rotation move like the Russian Twist if your sport or life demands it. That is a complete core menu in under ten minutes.",
        qAr: "ما أفضل تمارين الكور؟",
        aAr:
          "ثلاث حركات تغطي الوظائف الرئيسية: البلانك (وتدرجاته الأصعب) للشدّ ومقاومة البسط، ورفع الأرجل المعلق لسلسلة أسفل البطن وقابضي الورك، وثني الكابل لثني محمّل يمكن تدرّجه بالوزن فعلًا. أضف حركة دوران كاللف الروسي إن كانت رياضتك أو حياتك تطلبه. هذه قائمة كور كاملة في أقل من عشر دقائق.",
      },
      {
        qEn: "Do crunches give you visible abs?",
        aEn:
          "Crunches build the abdominal muscle underneath, but visibility is decided by the layer of fat above it — and fat is managed by total calories, not by any exercise. Training abs makes them thicker and better shaped; a calorie deficit makes them visible. Do both: direct core work 2–4 times weekly, and a moderate deficit with high protein when the goal is definition. Our calorie calculator can set that deficit for you.",
        qAr: "هل تمارين البطن تُظهر عضلاتك؟",
        aAr:
          "تمارين البطن تبني العضلة تحتها، لكن الظهور تحدده طبقة الدهون فوقها — والدهون تُدار بالسعرات الكلية لا بأي تمرين. تدريب البطن يجعلها أسمك وأشكل أفضل؛ والعجز الحراري هو ما يُظهرها. افعل الاثنين: عمل كور مباشر 2–4 مرات أسبوعيًا، وعجز معتدل ببروتين عالٍ حين يكون الهدف التحديد. وحاسبة السعرات عندنا تضبط لك هذا العجز.",
      },
      {
        qEn: "How often should I train core?",
        aEn:
          "Two to four short sessions weekly is ideal — the core recovers faster than large muscles, but it also works isometrically in every squat, deadlift and carry. Ten minutes at the end of a session, rotating between a brace, a flexion and a rotation movement, beats one long weekly ab marathon. If your lower back feels chronically tight, reduce flexion volume and prioritize bracing and hip-hinge quality.",
        qAr: "كم مرة أدرّب الكور؟",
        aAr:
          "جلستان إلى أربع قصيرة أسبوعيًا هي المثالية — الكور يستشف أسرع من العضلات الكبيرة، لكنه يعمل أيضًا بشكل ثابت في كل سكوات ورفعة وحمل. عشر دقائق نهاية الجلسة بالتنويع بين شدّ وثني ودوران تتفوق على ماراثون بطن أسبوعي طويل. وإن كان أسفل ظهرك مشدودًا مزمنًا، قلّل حجم الثني وأولِ الشدّ وجودة المفصلية.",
      },
      {
        qEn: "Do I need direct core work if I squat and deadlift?",
        aEn:
          "Heavy compounds train the core isometrically — bracing under load is real work — but they do not develop the visible abdominal wall much, nor rotation strength. Direct core training fills both gaps: it thickens the abs, improves control in the stretched and rotated positions, and builds endurance in the stabilizers for when heavy sets get long. Ten minutes, 2–4 times a week, is the whole price.",
        qAr: "هل أحتاج عمل كور مباشر مع السكوات والرفعات؟",
        aAr:
          "المركّبات الثقيلة تدرّب الكور ثابتًا — الشدّ تحت الحمل عمل حقيقي — لكنها لا تُنمّي جدار البطن الظاهر كثيرًا ولا قوة الدوران. التدريب المباشر يسد الفجوتين: يُسمك البطن، ويحسّن التحكم في وضعيتي التمدد والدوران، ويبني تحمل المثبتات حين تطول المجموعات الثقيلة. عشر دقائق، 2–4 مرات أسبوعيًا، هذا كل الثمن.",
      },
      {
        qEn: "Is the ab roller a good core exercise?",
        aEn:
          "Excellent — it is one of the strongest anti-extension progressions available: as the wheel rolls out, your core must resist arching under growing leverage. Start from the knees with a short rollout range, progress the distance session by session, and only move to standing rollouts once you can keep the lower back flat throughout. Stop the set the moment your hips begin to sag — that is fatigue, not weakness.",
        qAr: "هل عجلة البطن تمرين جيد؟",
        aAr:
          "ممتازة — إنها من أقوى تدرجات مقاومة البسط المتاحة: كلما تدحرجت العجلة، يجب أن يقاوم كورك التقوس تحت زخم متزايد. ابدأ على الركبتين بمدى دحرجة قصير، وطوّر المسافة جلسة بعد جلسة، ولا تنتقل للوقوف إلا حين تحافظ على استواء أسفل الظهر كاملًا. أوقف المجموعة لحظة بدء هبوط الوركين — هذه تعب لا ضعف.",
      },
      {
        qEn: "How do I get visible abs?",
        aEn:
          "Three levers, in order of impact: a sustained calorie deficit (moderate, protein-sparing), consistent full-body training that keeps muscle while fat drops, and direct core work so the abs underneath are worth revealing. Genetics decide where fat leaves last — for most people that is the midsection — so patience matters. Use our calorie and macro calculators to set the numbers, then let 8–16 weeks of consistency do the rest.",
        qAr: "كيف أُظهر عضلات بطني؟",
        aAr:
          "ثلاثة مفاتيح بترتيب التأثير: عجز حراري مستدام (معتدل يحمي العضل)، وتدريب شامل ثابت يُبقي العضل أثناء هبوط الدهون، وعمل كور مباشر حتى تستحق العضلات تحتها الظهور. الوراثة تحدد آخر مكان تخرج منه الدهون — ولأغلب الناس هو منطقة الوسط — فالصبر مهم. استخدم حاسبات السعرات والماكروز لضبط الأرقام ثم دع 8–16 أسبوعًا من الثبات تفعل الباقي.",
      },
    ],
  },
};
