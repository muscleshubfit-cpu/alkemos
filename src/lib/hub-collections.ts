/**
 * Hub & Collection definitions — SEO/GEO master plan (Phase SEO-GEO-1, 2026-09-08).
 *
 * Living in `src/lib/` (server-only safe — no client imports needed). This
 * module centralizes the metadata for the three new hub/collection page
 * families so the route handlers, sitemap generator, and internal-link
 * widgets all share one source of truth.
 *
 * Three families:
 *   1. /muscles/[group]      — exercise collections by primary muscle group
 *   2. /equipment/[type]     — exercise collections by equipment
 *   3. /collections/[slug]   — food collections by goal/tag
 *
 * Each family mirrors under /ar/* (Arabic). Every entry produces:
 *   - A standalone hub page with H1 + intro + grid + ItemList schema
 *   - A sitemap entry in /sitemap-collections.xml
 *   - Internal links from the parent listing page (exercises/foods)
 *
 * Design constraints (AGENTS.md):
 *   - Slug stability: never rename a published slug (link-permanence law).
 *   - Bilingual: every entry has both `en` and `ar` strings.
 *   - No external data: definitions are static, derived from existing
 *     EXERCISES / FOODS arrays (no new content authoring needed to ship).
 */

import "server-only";

import { EXERCISES, type ExerciseCategory, type Equipment } from "./exercises";
import { FOODS } from "./foods";
import { TAG_LABELS } from "./foods-shared";

// ============================================================================
// 1. MUSCLE GROUP HUBS — /muscles/[group]
// ============================================================================

export type MuscleHub = {
  slug: string;
  category: ExerciseCategory;
  titleEn: string;
  titleAr: string;
  h1En: string;
  h1Ar: string;
  introEn: string;
  introAr: string;
  descriptionEn: string;
  descriptionAr: string;
};

export const MUSCLE_HUBS: MuscleHub[] = [
  {
    slug: "chest",
    category: "chest",
    titleEn: "Chest Exercises — Best Movements for Pec Growth | Alkemos",
    titleAr: "تمارين الصدر — أفضل الحركات لبناء العضلة الصدرية | Alkemos",
    h1En: "Chest Exercises",
    h1Ar: "تمارين الصدر",
    introEn:
      "Browse every chest exercise in the Alkemos library — barbell presses, dumbbell flyes, cable crossovers, bodyweight push-up variations, and machine pec decks. Each entry includes step-by-step instructions, target muscles, equipment needed, and difficulty level. Whether you are training for hypertrophy, strength, or general fitness, this curated index points you to the right movement for your goal.",
    introAr:
      "تصفّح كل تمارين الصدر في مكتبة Alkemos — ضغط بالبار، فلاي بالدمبل، كروسبوفر بالكابل، أنواع ضغط الأرض، وماكينات الصدر. كل تمرين يتضمّن شرحًا تفصيليًا للخطوات، العضلات المستهدفة، المعدات المطلوبة، ومستوى الصعوبة. سواء كان هدفك التضخيم، القوة، أو اللياقة العامة، هذا الفهرس المنسّق يوجّهك للحركة المناسبة لهدفك.",
    descriptionEn:
      "Complete chest exercise library: barbell presses, dumbbell flyes, cable crossovers, and push-up variations with step-by-step instructions and target muscles.",
    descriptionAr:
      "مكتبة شاملة لتمارين الصدر: ضغط بالبار، فلاي بالدمبل، كروسبوفر بالكابل، وأنواع ضغط الأرض مع شرح الخطوات والعضلات المستهدفة.",
  },
  {
    slug: "back",
    category: "back",
    titleEn: "Back Exercises — Build a Thick, Wide Back | Alkemos",
    titleAr: "تمارين الظهر — بناء ظهر سميك وعريض | Alkemos",
    h1En: "Back Exercises",
    h1Ar: "تمارين الظهر",
    introEn:
      "Every back exercise in the Alkemos library — pull-ups, barbell rows, deadlifts, lat pulldowns, seated cable rows, and dumbbell variations. The back is the second-largest muscle group in the upper body and responds best to a mix of vertical and horizontal pulling. This index organizes all back movements by equipment and difficulty so you can pick the right exercise for your training day.",
    introAr:
      "كل تمارين الظهر في مكتبة Alkemos — العقلة، التجديف بالبار، الرفعة الميتة، سحب أمامي، تجديف كابل جالسً، وتنويعات الدمبل. الظهر هو ثاني أكبر مجموعة عضلية في الجزء العلوي من الجسم ويستجيب أفضل لخليط من السحب العمودي والأفقي. هذا الفهرس ينظّم كل حركات الظهر حسب المعدات ومستوى الصعوبة لتختار التمرين المناسب ليوم تدريبك.",
    descriptionEn:
      "Complete back exercise library: pull-ups, rows, deadlifts, and lat pulldowns with form instructions, target muscles, and difficulty ratings.",
    descriptionAr:
      "مكتبة شاملة لتمارين الظهر: العقلة، التجديف، الرفعة الميتة، والسحب الأمامي مع شرح الأداء، العضلات المستهدفة، وتقييمات الصعوبة.",
  },
  {
    slug: "shoulders",
    category: "shoulders",
    titleEn: "Shoulder Exercises — All Deltoid Movements | Alkemos",
    titleAr: "تمارين الأكتاف — كل حركات الدلتا | Alkemos",
    h1En: "Shoulder Exercises",
    h1Ar: "تمارين الأكتاف",
    introEn:
      "The complete shoulder exercise index — overhead presses, lateral raises, rear delt flyes, face pulls, and Arnold presses. Shoulders are trained across three heads (front, side, rear) and this collection covers all of them with barbell, dumbbell, cable, and machine options. Each entry includes primary and secondary muscle targeting so you can build balanced delts.",
    introAr:
      "الفهرس الكامل لتمارين الأكتاف — ضغط فوق الرأس، رفع جانبي، فلاي خلفي، فيس بول، وضغط أرنولد. تُدرَّب الأكتاف عبر ثلاثة رؤوس (أمامي، جانبي، خلفي) وهذه المجموعة تغطّيها كلها بخيارات البار، الدمبل، الكابل، والماكينة. كل تمرين يتضمّن استهداف العضلات الأساسية والثانوية لتبني دلتا متوازنة.",
    descriptionEn:
      "Complete shoulder exercise library: overhead presses, lateral raises, rear delt flyes, and face pulls for all three deltoid heads.",
    descriptionAr:
      "مكتبة شاملة لتمارين الأكتاف: ضغط فوق الرأس، رفع جانبي، فلاي خلفي، وفيس بول لرؤوس الدلتا الثلاثة.",
  },
  {
    slug: "legs",
    category: "legs",
    titleEn: "Leg Exercises — Squats, Deadlifts & Leg Day Movements | Alkemos",
    titleAr: "تمارين الأرجل — سكوات ورفعة ميتة وتمارين يوم الأرجل | Alkemos",
    h1En: "Leg Exercises",
    h1Ar: "تمارين الأرجل",
    introEn:
      "Every leg exercise in the Alkemos library — back squats, front squats, deadlifts, lunges, leg presses, leg curls, calf raises, and glute bridges. Legs are the largest muscle group in the body and demand both compound and isolation work for complete development. This index organizes movements by equipment and primary muscle so you can plan a balanced leg day.",
    introAr:
      "كل تمارين الأرجل في مكتبة Alkemos — سكوات خلفي، سكوات أمامي، رفعة ميتة، الطعنات، ليغ بريس، ليغ كيرل، رفع سمانة، وجلوت بريدج. الأرجل هي أكبر مجموعة عضلية في الجسم وتتطلّب عملًا مركّبًا وعزلًا لتطوير كامل. هذا الفهرس ينظّم الحركات حسب المعدات والعضلة الأساسية لتخطّط يوم أرجل متوازن.",
    descriptionEn:
      "Complete leg exercise library: squats, deadlifts, lunges, leg presses, and calf raises with form cues and target muscles.",
    descriptionAr:
      "مكتبة شاملة لتمارين الأرجل: سكوات، رفعة ميتة، طعنات، ليغ بريس، ورفع سمانة مع إشارات الأداء والعضلات المستهدفة.",
  },
  {
    slug: "biceps",
    category: "biceps",
    titleEn: "Biceps Exercises — Curls & Arm Movements | Alkemos",
    titleAr: "تمارين البايسبس — كيرل وحركات الذراع | Alkemos",
    h1En: "Biceps Exercises",
    h1Ar: "تمارين البايسبس",
    introEn:
      "The biceps exercise collection — barbell curls, dumbbell curls, hammer curls, preacher curls, cable curls, and concentration curls. Although biceps are a small muscle group, training them through multiple angles and grip variations maximizes hypertrophy. This index covers every curl variation in the library with equipment options.",
    introAr:
      "مجموعة تمارين البايسبس — كيرل بالبار، كيرل بالدمبل، هامر كيرل، بريشر كيرل، كيرل بالكابل، وكونسنتريشن كيرل. رغم أن البايسبس مجموعة عضلية صغيرة، إلا أن تدريبها عبر زوايا متعددة وأنواع قبضات مختلفة يُعظّم التضخيم. هذا الفهرس يغطّي كل تنويعات الكيرل في المكتبة بخيارات المعدات.",
    descriptionEn:
      "Complete biceps exercise library: barbell curls, dumbbell curls, hammer curls, and preacher curls with form instructions.",
    descriptionAr:
      "مكتبة شاملة لتمارين البايسبس: كيرل بالبار، كيرل بالدمبل، هامر كيرل، وبريشر كيرل مع شرح الأداء.",
  },
  {
    slug: "triceps",
    category: "triceps",
    titleEn: "Triceps Exercises — Press-Downs, Extensions & Dips | Alkemos",
    titleAr: "تمارين الترايسبس — برس داون، إكستنشن، وديب | Alkemos",
    h1En: "Triceps Exercises",
    h1Ar: "تمارين الترايسبس",
    introEn:
      "Every triceps exercise in the library — close-grip bench press, skull crushers, cable push-downs, overhead extensions, dips, and kickbacks. Triceps make up roughly two-thirds of upper arm mass, so they are essential for both arm size and pressing strength. This index covers all three triceps heads (long, lateral, medial) with equipment variations.",
    introAr:
      "كل تمارين الترايسبس في المكتبة — بنش بريس بقبضة ضيقة، سكول كراشر، برس داون بالكابل، إكستنشن فوق الرأس، ديب، وكيك باك. الترايسبس يُشكّل تقريبًا ثلثي حجم الجزء العلوي من الذراع، لذا فهو أساسي لحجم الذراع وقوة الضغط. هذا الفهرس يغطّي الرؤوس الثلاثة للترايسبس (طويل، جانبي، إنسي) بتنويعات المعدات.",
    descriptionEn:
      "Complete triceps exercise library: close-grip bench, skull crushers, push-downs, overhead extensions, and dips.",
    descriptionAr:
      "مكتبة شاملة لتمارين الترايسبس: بنش بريس بقبضة ضيقة، سكول كراشر، برس داون، إكستنشن فوق الرأس، وديب.",
  },
  {
    slug: "core",
    category: "core",
    titleEn: "Core Exercises — Abs, Obliques & Lower Back | Alkemos",
    titleAr: "تمارين الكور — البطن، المائل، وأسفل الظهر | Alkemos",
    h1En: "Core Exercises",
    h1Ar: "تمارين الكور",
    introEn:
      "The complete core exercise index — planks, crunches, leg raises, Russian twists, ab wheel rollouts, cable woodchoppers, and dead bugs. A strong core transfers to every other lift and reduces lower-back injury risk. This collection organizes movements by equipment and difficulty so beginners and advanced lifters can both find appropriate work.",
    introAr:
      "الفهرس الكامل لتمارين الكور — بلانك، كرانش، رفع الأرجل، تويست روسي، أبا ويل، وودشوبر بالكابل، وديد باغ. الكور القوي ينتقل إلى كل رفعة أخرى ويُقلّل خطر إصابة أسفل الظهر. هذه المجموعة تنظّم الحركات حسب المعدات والصعوبة ليجد المبتدئون والمتقدمون عملًا مناسبًا.",
    descriptionEn:
      "Complete core exercise library: planks, crunches, leg raises, Russian twists, and ab wheel rollouts with form cues.",
    descriptionAr:
      "مكتبة شاملة لتمارين الكور: بلانك، كرانش، رفع الأرجل، تويست روسي، وأبا ويل مع إشارات الأداء.",
  },
  {
    slug: "cardio",
    category: "cardio",
    titleEn: "Cardio Exercises — Conditioning & Fat-Loss Movements | Alkemos",
    titleAr: "تمارين الكارديو — اللياقة القلبية وحرق الدهون | Alkemos",
    h1En: "Cardio Exercises",
    h1Ar: "تمارين الكارديو",
    introEn:
      "Cardio and conditioning movements in the Alkemos library — burpees, mountain climbers, jumping jacks, high knees, battle ropes, and rowing variations. Whether your goal is fat loss, cardiovascular health, or athletic conditioning, this index covers bodyweight and equipment-based options for every fitness level.",
    introAr:
      "تمارين الكارديو واللياقة القلبية في مكتبة Alkemos — بيربي، ماونتن كلايمبر، جمبينج جاك، هاي نيز، باتل روب، وتنويعات التجديف. سواء كان هدفك حرق الدهون، صحة القلب، أو لياقة رياضية، هذا الفهرس يغطّي خيارات وزن الجسم والمعدات لكل مستوى لياقة.",
    descriptionEn:
      "Complete cardio exercise library: burpees, mountain climbers, jumping jacks, and battle ropes for conditioning and fat loss.",
    descriptionAr:
      "مكتبة شاملة لتمارين الكارديو: بيربي، ماونتن كلايمبر، جمبينج جاك، وباتل روب للياقة وحرق الدهون.",
  },
];

export function getMuscleHubBySlug(slug: string): MuscleHub | null {
  return MUSCLE_HUBS.find((h) => h.slug === slug) ?? null;
}

export function getExercisesForMuscleHub(hub: MuscleHub) {
  return EXERCISES.filter((e) => e.category === hub.category);
}

// ============================================================================
// 2. EQUIPMENT HUBS — /equipment/[type]
// ============================================================================

export type EquipmentHub = {
  slug: string;
  equipment: Equipment;
  titleEn: string;
  titleAr: string;
  h1En: string;
  h1Ar: string;
  introEn: string;
  introAr: string;
  descriptionEn: string;
  descriptionAr: string;
};

export const EQUIPMENT_HUBS: EquipmentHub[] = [
  {
    slug: "barbell",
    equipment: "barbell",
    titleEn: "Barbell Exercises — Complete Barbell Movement Library | Alkemos",
    titleAr: "تمارين البار — مكتبة حركات البار الكاملة | Alkemos",
    h1En: "Barbell Exercises",
    h1Ar: "تمارين البار",
    introEn:
      "Every barbell exercise in the Alkemos library — bench press, squats, deadlifts, overhead press, rows, and curl variations. Barbells are the foundational tool for strength and hypertrophy because they allow the greatest absolute loading. This index covers every barbell movement with primary muscles, difficulty, and step-by-step form cues.",
    introAr:
      "كل تمارين البار في مكتبة Alkemos — بنش بريس، سكوات، رفعة ميتة، ضغط فوق الرأس، تجديف، وتنويعات الكيرل. البار هو الأداة الأساسية للقوة والتضخيم لأنه يسمح بأكبر حمل مطلق. هذا الفهرس يغطّي كل حركات البار مع العضلات الأساسية، الصعوبة، وإشارات الأداء خطوة بخطوة.",
    descriptionEn:
      "Complete barbell exercise library: bench press, squats, deadlifts, overhead press, and rows with form instructions.",
    descriptionAr:
      "مكتبة شاملة لتمارين البار: بنش بريس، سكوات، رفعة ميتة، ضغط فوق الرأس، وتجديف مع شرح الأداء.",
  },
  {
    slug: "dumbbell",
    equipment: "dumbbell",
    titleEn: "Dumbbell Exercises — Full Dumbbell Movement Index | Alkemos",
    titleAr: "تمارين الدمبل — فهرس حركات الدمبل الكامل | Alkemos",
    h1En: "Dumbbell Exercises",
    h1Ar: "تمارين الدمبل",
    introEn:
      "The complete dumbbell exercise collection — dumbbell presses, flyes, curls, rows, lunges, and Romanian deadlifts. Dumbbells offer unique advantages over barbells: greater range of motion, independent arm training to fix imbalances, and easier home-gym setups. This index organizes every dumbbell movement by muscle group and difficulty.",
    introAr:
      "المجموعة الكاملة لتمارين الدمبل — ضغط بالدمبل، فلاي، كيرل، تجديف، طعنات، ورفعة ميتة رومانية. الدمبل يقدّم مزايا فريدة على البار: مدى حركة أكبر، تدريب ذراع مستقل لإصلاح الاختلالات، وإعداد جيم منزلي أسهل. هذا الفهرس ينظّم كل حركات الدمبل حسب المجموعة العضلية والصعوبة.",
    descriptionEn:
      "Complete dumbbell exercise library: presses, flyes, curls, rows, lunges, and Romanian deadlifts with form instructions.",
    descriptionAr:
      "مكتبة شاملة لتمارين الدمبل: ضغط، فلاي، كيرل، تجديف، طعنات، ورفعة ميتة رومانية مع شرح الأداء.",
  },
  {
    slug: "bodyweight",
    equipment: "bodyweight",
    titleEn: "Bodyweight Exercises — No-Equipment Home Workouts | Alkemos",
    titleAr: "تمارين وزن الجسم — تمارين منزلية بدون معدات | Alkemos",
    h1En: "Bodyweight Exercises",
    h1Ar: "تمارين وزن الجسم",
    introEn:
      "Every bodyweight exercise in the Alkemos library — push-ups, pull-ups, squats, lunges, planks, burpees, and dozens of variations. Bodyweight training is the most accessible form of resistance training: zero equipment, zero cost, and you can do it anywhere. This index covers every no-equipment movement so you can build a complete home workout.",
    introAr:
      "كل تمارين وزن الجسم في مكتبة Alkemos — ضغط أرض، عقلة، سكوات، طعنات، بلانك، بيربي، وعشرات التنويعات. تدريب وزن الجسم هو أكثر أشكال تدريب المقاومة وصولًا: صفر معدات، صفر تكلفة، ويمكنك أداؤه في أي مكان. هذا الفهرس يغطّي كل حركة بدون معدات لتبني تمرينًا منزليًا كاملًا.",
    descriptionEn:
      "Complete bodyweight exercise library: push-ups, pull-ups, squats, planks, and burpees for home workouts without equipment.",
    descriptionAr:
      "مكتبة شاملة لتمارين وزن الجسم: ضغط أرض، عقلة، سكوات، بلانك، وبيربي لتمارين منزلية بدون معدات.",
  },
  {
    slug: "cable",
    equipment: "cable",
    titleEn: "Cable Exercises — Cable Machine Movement Library | Alkemos",
    titleAr: "تمارين الكابل — مكتبة حركات ماكينة الكابل | Alkemos",
    h1En: "Cable Exercises",
    h1Ar: "تمارين الكابل",
    introEn:
      "The cable exercise collection — lat pulldowns, cable rows, cable flyes, push-downs, woodchoppers, and lateral raises. Cable machines provide constant tension throughout the entire range of motion, making them uniquely effective for hypertrophy. This index covers every cable movement with primary muscles and difficulty ratings.",
    introAr:
      "مجموعة تمارين الكابل — سحب أمامي، تجديف كابل، فلاي كابل، برس داون، وودشوبر، ورفع جانبي. ماكينات الكابل توفّر توترًا مستمرًا عبر مدى الحركة الكامل، مما يجعلها فعّالة بشكل فريد للتضخيم. هذا الفهرس يغطّي كل حركات الكابل مع العضلات الأساسية وتقييمات الصعوبة.",
    descriptionEn:
      "Complete cable exercise library: lat pulldowns, cable rows, flyes, push-downs, and woodchoppers with form instructions.",
    descriptionAr:
      "مكتبة شاملة لتمارين الكابل: سحب أمامي، تجديف كابل، فلاي، برس داون، وودشوبر مع شرح الأداء.",
  },
  {
    slug: "machine",
    equipment: "machine",
    titleEn: "Machine Exercises — Selectorized & Plate-Loaded | Alkemos",
    titleAr: "تمارين الماكينات — الماكينات الانتقائية والمحمّلة بالأوزان | Alkemos",
    h1En: "Machine Exercises",
    h1Ar: "تمارين الماكينات",
    introEn:
      "Every machine-based exercise in the library — leg press, hack squat, chest press machine, pec deck, lat pulldown machine, and ab crunch machine. Machines stabilize the load for you, making them safer for beginners and ideal for isolation work at the end of a session. This index organizes all machine movements by target muscle.",
    introAr:
      "كل تمرين بالماكينة في المكتبة — ليغ بريس، هاك سكوات، ماكينة صدر، بيك ديك، ماكينة سحب، وماكينة كرنش. الماكينات تُثبّت الحمل نيابة عنك، مما يجعلها أكثر أمانًا للمبتدئين ومثالية لعمل العزل في نهاية الجلسة. هذا الفهرس ينظّم كل حركات الماكينات حسب العضلة المستهدفة.",
    descriptionEn:
      "Complete machine exercise library: leg press, hack squat, chest press, pec deck, and ab crunch machines with instructions.",
    descriptionAr:
      "مكتبة شاملة لتمارين الماكينات: ليغ بريس، هاك سكوات، ماكينة صدر، بيك ديك، وماكينة كرنش مع الشرح.",
  },
  {
    slug: "kettlebell",
    equipment: "kettlebell",
    titleEn: "Kettlebell Exercises — Swings, Cleans & Turkish Get-Ups | Alkemos",
    titleAr: "تمارين الكيتل بيل — سوينغ، كلين، وتركش جت أب | Alkemos",
    h1En: "Kettlebell Exercises",
    h1Ar: "تمارين الكيتل بيل",
    introEn:
      "The kettlebell exercise collection — swings, goblet squats, Turkish get-ups, cleans, snatches, and windmills. Kettlebells are uniquely effective for power development, conditioning, and functional strength because their offset center of mass engages stabilizers that dumbbells cannot. This index covers every kettlebell movement with form cues and difficulty.",
    introAr:
      "مجموعة تمارين الكيتل بيل — سوينغ، جوبليت سكوات، تركش جت أب، كلين، سنتش، وويندميل. الكيتل بيل فعّال بشكل فريد لتطوير القوة، اللياقة، والقوة الوظيفية لأن مركز كتلته المُزاح يُشغّل المُثبّتات التي لا يستطيع الدمبل الوصول إليها. هذا الفهرس يغطّي كل حركات الكيتل بيل مع إشارات الأداء والصعوبة.",
    descriptionEn:
      "Complete kettlebell exercise library: swings, goblet squats, Turkish get-ups, cleans, and snatches with form instructions.",
    descriptionAr:
      "مكتبة شاملة لتمارين الكيتل بيل: سوينغ، جوبليت سكوات، تركش جت أب، كلين، وسنتش مع شرح الأداء.",
  },
  {
    slug: "band",
    equipment: "band",
    titleEn: "Resistance Band Exercises — Travel & Home Workouts | Alkemos",
    titleAr: "تمارين المطاط — تمارين السفر والمنزل | Alkemos",
    h1En: "Resistance Band Exercises",
    h1Ar: "تمارين المطاط",
    introEn:
      "The resistance band exercise library — band rows, band presses, band curls, band pull-aparts, and band squats. Resistance bands are the most portable training tool available: they fit in a backpack, cost less than $20, and provide full-body resistance training for travel or home. This index covers every band movement with target muscles.",
    introAr:
      "مكتبة تمارين المطاط — تجديف مطاط، ضغط مطاط، كيرل مطاط، بول أبارت مطاط، وسكوات مطاط. المطاط هو أكثر أدوات التدريب قابلية للحمل: يُناسب حقيبة الظهر، يكلّف أقل من $20، ويوفّر تدريب مقاومة لكامل الجسم للسفر أو المنزل. هذا الفهرس يغطّي كل حركات المطاط مع العضلات المستهدفة.",
    descriptionEn:
      "Complete resistance band exercise library: band rows, presses, curls, pull-aparts, and squats for travel and home workouts.",
    descriptionAr:
      "مكتبة شاملة لتمارين المطاط: تجديف، ضغط، كيرل، بول أبارت، وسكوات للسفر والمنزل.",
  },
  {
    slug: "none",
    equipment: "none",
    titleEn: "No-Equipment Exercises — Bodyweight Only Workouts | Alkemos",
    titleAr: "تمارين بدون معدات — تمرين وزن الجسم فقط | Alkemos",
    h1En: "No-Equipment Exercises",
    h1Ar: "تمارين بدون معدات",
    introEn:
      "Every no-equipment exercise in the library — push-ups, squats, lunges, planks, sit-ups, and burpees. These movements require absolutely nothing and form the foundation of any home or travel workout. This index is the ultimate resource for training anywhere, anytime, with zero cost.",
    introAr:
      "كل تمرين بدون معدات في المكتبة — ضغط أرض، سكوات، طعنات، بلانك، سيت أب، وبيربي. هذه الحركات لا تتطلّب شيئًا على الإطلاق وتشكّل أساس أي تمرين منزلي أو للسفر. هذا الفهرس هو المورد النهائي للتدريب في أي مكان، أي وقت، بتكلفة صفر.",
    descriptionEn:
      "Complete no-equipment exercise library: push-ups, squats, lunges, planks, and burpees for anywhere workouts.",
    descriptionAr:
      "مكتبة شاملة لتمارين بدون معدات: ضغط أرض، سكوات، طعنات، بلانك، وبيربي للتمرين في أي مكان.",
  },
];

export function getEquipmentHubBySlug(slug: string): EquipmentHub | null {
  return EQUIPMENT_HUBS.find((h) => h.slug === slug) ?? null;
}

export function getExercisesForEquipmentHub(hub: EquipmentHub) {
  return EXERCISES.filter((e) => e.equipment === hub.equipment);
}

// ============================================================================
// 3. FOOD COLLECTIONS — /collections/[slug]
// ============================================================================

export type FoodCollection = {
  slug: string;
  tag: string;
  titleEn: string;
  titleAr: string;
  h1En: string;
  h1Ar: string;
  introEn: string;
  introAr: string;
  descriptionEn: string;
  descriptionAr: string;
};

export const FOOD_COLLECTIONS: FoodCollection[] = [
  {
    slug: "high-protein-foods",
    tag: "high-protein",
    titleEn: "High Protein Foods — Complete List with Macros | Alkemos",
    titleAr: "أطعمة عالية البروتين — قائمة كاملة بالماكروز | Alkemos",
    h1En: "High Protein Foods",
    h1Ar: "أطعمة عالية البروتين",
    introEn:
      "A curated list of high-protein foods from the Alkemos nutrition database — chicken breast, lean beef, eggs, tuna, salmon, turkey, Greek yogurt, cottage cheese, and more. Each entry includes calories, protein, carbs, and fat per 100g, plus the default serving size and weight in grams. Whether you are building muscle, losing fat, or hitting a daily protein target, this collection gives you the macros you need at a glance.",
    introAr:
      "قائمة مُختارة لأطعمة عالية البروتين من قاعدة تغذية Alkemos — صدور دجاج، لحم بقري قليل الدهن، بيض، تونة، سلمون، ديك رومي، زبادي يوناني، جبن قريش، والمزيد. كل عنصر يتضمّن السعرات، البروتين، الكارب، والدهون لكل 100 جرام، بالإضافة إلى حجم الحصة الافتراضي والوزن بالجرام. سواء كنت تبني عضلات، تفقد دهون، أو تسعى لهدف بروتين يومي، هذه المجموعة تمنحك الماكروز بنظرة سريعة.",
    descriptionEn:
      "Complete list of high protein foods with calories, protein, carbs, and fat per 100g. Chicken, beef, eggs, tuna, salmon, and more.",
    descriptionAr:
      "قائمة كاملة لأطعمة عالية البروتين مع السعرات والبروتين والكارب والدهون لكل 100 جرام. دجاج، لحم، بيض، تونة، سلمون، والمزيد.",
  },
  {
    slug: "low-carb-foods",
    tag: "low-carb",
    titleEn: "Low Carb Foods — Best Options for Keto & Cutting | Alkemos",
    titleAr: "أطعمة قليلة الكارب — أفضل الخيارات للكيتو والتخسيس | Alkemos",
    h1En: "Low Carb Foods",
    h1Ar: "أطعمة قليلة الكارب",
    introEn:
      "Every low-carb food in the Alkemos database — meats, fish, eggs, cheese, oils, and low-carb vegetables. Low-carb eating is the foundation of ketogenic diets, fat-loss phases, and blood-sugar management. This collection filters the curated food library to only those with minimal carbohydrate content, with full macros per 100g and per serving.",
    introAr:
      "كل أطعمة قليلة الكارب في قاعدة Alkemos — لحوم، أسماك، بيض، جبن، زيوت، وخضار قليلة الكارب. الأكل قليل الكارب هو أساس الحميات الكيتونية، مراحل خسارة الدهون، وإدارة سكر الدم. هذه المجموعة تُفلتر المكتبة المُختارة لتشمل فقط الأطعمة ذات الكاربوهيدرات الأدنى، مع الماكروز الكاملة لكل 100 جرام ولكل حصة.",
    descriptionEn:
      "Complete list of low carb foods with macros per 100g. Meats, fish, eggs, cheese, and low-carb vegetables for keto and cutting.",
    descriptionAr:
      "قائمة كاملة لأطعمة قليلة الكارب مع الماكروز لكل 100 جرام. لحوم، أسماك، بيض، جبن، وخضار قليلة الكارب للكيتو والتخسيس.",
  },
  {
    slug: "keto-friendly-foods",
    tag: "keto-friendly",
    titleEn: "Keto Friendly Foods — Complete Ketogenic Diet List | Alkemos",
    titleAr: "أطعمة صديقة للكيتو — قائمة حمية الكيتو الكاملة | Alkemos",
    h1En: "Keto Friendly Foods",
    h1Ar: "أطعمة صديقة للكيتو",
    introEn:
      "The complete collection of keto-friendly foods from the Alkemos nutrition database. The ketogenic diet requires under 20–50g of carbohydrates per day, with the majority of calories from fat and moderate protein. This curated list shows every food tagged keto-friendly, with full macros per 100g so you can plan your keto meals accurately.",
    introAr:
      "المجموعة الكاملة لأطعمة صديقة للكيتو من قاعدة تغذية Alkemos. حمية الكيتو تتطلّب أقل من 20–50 جرام كاربوهيدرات يوميًا، مع أغلب السعرات من الدهون وبروتين معتدل. هذه القائمة المُختارة تعرض كل أطعمة الكيتو، مع الماكروز الكاملة لكل 100 جرام لتخطّط وجبات الكيتو بدقة.",
    descriptionEn:
      "Complete list of keto-friendly foods with macros per 100g. Meats, fish, eggs, cheese, oils, and low-carb vegetables for ketogenic diets.",
    descriptionAr:
      "قائمة كاملة لأطعمة صديقة للكيتو مع الماكروز لكل 100 جرام. لحوم، أسماك، بيض، جبن، زيوت، وخضار قليلة الكارب لحميات الكيتو.",
  },
  {
    slug: "low-fat-foods",
    tag: "low-fat",
    titleEn: "Low Fat Foods — Best Options for Cutting & Lean Bulking | Alkemos",
    titleAr: "أطعمة قليلة الدهون — أفضل الخيارات للتخسيس والتضخيم النظيف | Alkemos",
    h1En: "Low Fat Foods",
    h1Ar: "أطعمة قليلة الدهون",
    introEn:
      "Every low-fat food in the Alkemos library — chicken breast, egg whites, tuna, turkey, white fish, fat-free dairy, and most fruits and vegetables. Low-fat foods are staples of cutting phases, lean bulking, and medical diets that restrict dietary fat. This collection lists all curated low-fat foods with full per-100g macros.",
    introAr:
      "كل أطعمة قليلة الدهون في مكتبة Alkemos — صدور دجاج، بياض البيض، تونة، ديك رومي، سمك أبيض، ألبان خالية الدهون، ومعظم الفواكه والخضار. الأطعمة قليلة الدهون هي أساس مراحل التخسيس، التضخيم النظيف، والحميات الطبية المُقيّدة للدهون. هذه المجموعة تعرض كل الأطعمة المُختارة قليلة الدهون مع الماكروز الكاملة لكل 100 جرام.",
    descriptionEn:
      "Complete list of low fat foods with macros per 100g. Chicken breast, egg whites, tuna, turkey, white fish, and fat-free dairy.",
    descriptionAr:
      "قائمة كاملة لأطعمة قليلة الدهون مع الماكروز لكل 100 جرام. صدور دجاج، بياض البيض، تونة، ديك رومي، سمك أبيض، وألبان خالية الدهون.",
  },
  {
    slug: "vegan-protein-sources",
    tag: "vegan",
    titleEn: "Vegan Protein Sources — Complete Plant-Based List | Alkemos",
    titleAr: "مصادر البروتين النباتي — قائمة كاملة للأطعمة النباتية | Alkemos",
    h1En: "Vegan Protein Sources",
    h1Ar: "مصادر البروتين النباتي",
    introEn:
      "The complete collection of vegan foods in the Alkemos nutrition database. Building muscle on a plant-based diet is entirely possible with the right food choices — tofu, tempeh, lentils, chickpeas, quinoa, nuts, and seeds all deliver meaningful protein per serving. This list organizes every vegan-friendly food in the library with full macros per 100g.",
    introAr:
      "المجموعة الكاملة للأطعمة النباتية في قاعدة تغذية Alkemos. بناء العضلات على حمية نباتية ممكن تمامًا بالاختيارات الصحيحة — التوفو، التمبيه، العدس، الحمص، الكينوا، المكسرات، والبذور كلها تُقدّم بروتينًا معتبرًا لكل حصة. هذه القائمة تنظّم كل أطعمة النباتيين في المكتبة مع الماكروز الكاملة لكل 100 جرام.",
    descriptionEn:
      "Complete list of vegan protein sources with macros per 100g. Tofu, tempeh, lentils, chickpeas, quinoa, nuts, and seeds.",
    descriptionAr:
      "قائمة كاملة لمصادر البروتين النباتي مع الماكروز لكل 100 جرام. توفو، تمبيه، عدس، حمص، كينوا، مكسرات، وبذور.",
  },
  {
    slug: "vegetarian-protein-sources",
    tag: "vegetarian",
    titleEn: "Vegetarian Protein Sources — Eggs, Dairy & Plant Protein | Alkemos",
    titleAr: "مصادر البروتين النباتي (للنسخة اللبنية) — بيض، ألبان، وبروتين نباتي | Alkemos",
    h1En: "Vegetarian Protein Sources",
    h1Ar: "مصادر البروتين النباتي (اللابنكي)",
    introEn:
      "Every vegetarian food in the Alkemos library — eggs, dairy (Greek yogurt, cottage cheese, milk), plus all the plant-based protein sources like lentils, tofu, and quinoa. Vegetarian eating is more flexible than vegan because it allows eggs and dairy, which makes hitting protein targets significantly easier. This collection covers every vegetarian option with full macros per 100g.",
    introAr:
      "كل أطعمة النباتيين (اللابنكيين) في مكتبة Alkemos — البيض، الألبان (الزبادي اليوناني، الجبن القريش، الحليب)، بالإضافة إلى كل مصادر البروتين النباتي مثل العدس، التوفو، والكينوا. الأكل النباتي اللابنكي أكثر مرونة من النباتي الصافي لأنه يسمح بالبيض والألبان، مما يجعل تحقيق أهداف البروتين أسهل بكثير. هذه المجموعة تغطّي كل الخيارات النباتية اللابنية مع الماكروز الكاملة لكل 100 جرام.",
    descriptionEn:
      "Complete list of vegetarian protein sources with macros per 100g. Eggs, dairy, lentils, tofu, quinoa, and more.",
    descriptionAr:
      "قائمة كاملة لمصادر البروتين النباتي اللابنكي مع الماكروز لكل 100 جرام. بيض، ألبان، عدس، توفو، كينوا، والمزيد.",
  },
  {
    slug: "foods-for-cutting",
    tag: "good-for-cutting",
    titleEn: "Foods for Cutting — Best Options for Fat Loss | Alkemos",
    titleAr: "أطعمة للتخسيس — أفضل الخيارات لخسارة الدهون | Alkemos",
    h1En: "Foods for Cutting",
    h1Ar: "أطعمة للتخسيس",
    introEn:
      "The best foods for a cutting phase from the Alkemos library — high protein, low calorie, low fat options that maximize satiety while keeping you in a calorie deficit. Chicken breast, egg whites, tuna, white fish, leafy greens, and berries form the backbone of any successful cut. This collection organizes every cutting-friendly food with full macros so you can plan your fat-loss phase precisely.",
    introAr:
      "أفضل أطعمة مرحلة التخسيس من مكتبة Alkemos — خيارات عالية البروتين، منخفضة السعرات، منخفضة الدهون تُعظّم الشبع مع إبقائك في عجز سعرات. صدور دجاج، بياض البيض، تونة، سمك أبيض، خضار ورقية، وتوت تُشكّل العمود الفقري لأي تخسيس ناجح. هذه المجموعة تنظّم كل أطعمة التخسيس مع الماكروز الكاملة لتخطّط مرحلة خسارة الدهون بدقة.",
    descriptionEn:
      "Complete list of foods for cutting with macros per 100g. Chicken breast, egg whites, tuna, white fish, leafy greens, and berries.",
    descriptionAr:
      "قائمة كاملة لأطعمة التخسيس مع الماكروز لكل 100 جرام. صدور دجاج، بياض البيض، تونة، سمك أبيض، خضار ورقية، وتوت.",
  },
  {
    slug: "foods-for-bulking",
    tag: "good-for-bulking",
    titleEn: "Foods for Bulking — High-Calorie Options for Muscle Gain | Alkemos",
    titleAr: "أطعمة للتضخيم — خيارات عالية السعرات لبناء العضلات | Alkemos",
    h1En: "Foods for Bulking",
    h1Ar: "أطعمة للتضخيم",
    introEn:
      "The best bulking foods from the Alkemos nutrition database — calorie-dense options that make hitting a surplus easy without having to eat enormous volumes. Salmon, lean beef, whole eggs, nuts, nut butters, dried fruits, whole grains, and olive oil are staples of any successful bulk. This collection lists every bulking-friendly food with full per-100g macros.",
    introAr:
      "أفضل أطعمة التضخيم من قاعدة تغذية Alkemos — خيارات غنية بالسعرات تجعل تحقيق الفائض سهلًا دون الحاجة لأكل أحجام ضخمة. سلمون، لحم بقري قليل الدهن، بيض كامل، مكسرات، زبدة المكسرات، فواكه مجففة، حبوب كاملة، وزيت زيتون هي أساس أي تضخيم ناجح. هذه المجموعة تعرض كل أطعمة التضخيم مع الماكروز الكاملة لكل 100 جرام.",
    descriptionEn:
      "Complete list of foods for bulking with macros per 100g. Salmon, beef, whole eggs, nuts, dried fruits, whole grains, and olive oil.",
    descriptionAr:
      "قائمة كاملة لأطعمة التضخيم مع الماكروز لكل 100 جرام. سلمون، لحم، بيض كامل، مكسرات، فواكه مجففة، حبوب كاملة، وزيت زيتون.",
  },
  {
    slug: "no-cook-foods",
    tag: "no-cook",
    titleEn: "No-Cook Foods — Ready-to-Eat Options for Busy Days | Alkemos",
    titleAr: "أطعمة بدون طبخ — خيارات جاهزة للأيام المزدحمة | Alkemos",
    h1En: "No-Cook Foods",
    h1Ar: "أطعمة بدون طبخ",
    introEn:
      "Every no-cook food in the Alkemos library — canned tuna, Greek yogurt, cottage cheese, nuts, seeds, fruit, protein shakes, and pre-cooked options. These foods are essential for travel, office meals, or days when you have zero time to cook but still need to hit your protein target. This collection lists every ready-to-eat option with full macros per 100g.",
    introAr:
      "كل أطعمة بدون طبخ في مكتبة Alkemos — تونة معلبة، زبادي يوناني، جبن قريش، مكسرات، بذور، فواكه، بروتين شيك، وخيارات مطبوخة مسبقًا. هذه الأطعمة أساسية للسفر، وجبات المكتب، أو الأيام التي ليس لديك فيها وقت للطبخ لكن ما زلت بحاجة لتحقيق هدف البروتين. هذه المجموعة تعرض كل خيار جاهز للأكل مع الماكروز الكاملة لكل 100 جرام.",
    descriptionEn:
      "Complete list of no-cook foods with macros per 100g. Canned tuna, Greek yogurt, cottage cheese, nuts, fruit, and protein shakes.",
    descriptionAr:
      "قائمة كاملة لأطعمة بدون طبخ مع الماكروز لكل 100 جرام. تونة معلبة، زبادي يوناني، جبن قريش، مكسرات، فواكه، وبروتين شيك.",
  },
  {
    slug: "quick-prep-foods",
    tag: "quick-prep",
    titleEn: "Quick Prep Foods — 5-Minute Meal Options | Alkemos",
    titleAr: "أطعمة تحضير سريع — خيارات وجبات في 5 دقائق | Alkemos",
    h1En: "Quick Prep Foods",
    h1Ar: "أطعمة تحضير سريع",
    introEn:
      "The complete collection of quick-prep foods in the Alkemos library — eggs, oats, canned tuna, microwave rice, pre-washed greens, and other foods you can turn into a meal in under five minutes. These options are perfect for post-workout meals, quick breakfasts, or any time you need nutrition fast. Each entry includes full macros per 100g and per serving.",
    introAr:
      "المجموعة الكاملة لأطعمة التحضير السريع في مكتبة Alkemos — بيض، شوفان، تونة معلبة، أرز ميكروويف، خضار مغسولة مسبقًا، وأطعمة أخرى يمكنك تحويلها إلى وجبة في أقل من خمس دقائق. هذه الخيارات مثالية لوجبات ما بعد التمرين، فطور سريع، أو أي وقت تحتاج فيه تغذية سريعة. كل عنصر يتضمّن الماكروز الكاملة لكل 100 جرام ولكل حصة.",
    descriptionEn:
      "Complete list of quick-prep foods with macros per 100g. Eggs, oats, canned tuna, microwave rice, and pre-washed greens.",
    descriptionAr:
      "قائمة كاملة لأطعمة التحضير السريع مع الماكروز لكل 100 جرام. بيض، شوفان، تونة معلبة، أرز ميكروويف، وخضار مغسولة مسبقًا.",
  },
];

export function getFoodCollectionBySlug(slug: string): FoodCollection | null {
  return FOOD_COLLECTIONS.find((c) => c.slug === slug) ?? null;
}

export function getFoodsForCollection(collection: FoodCollection) {
  return FOODS.filter(
    (f) => (f.tags?.length ?? 0) > 0 && f.tags.includes(collection.tag),
  );
}

/** Sanity: every collection's tag must be a known tag (defined in
 *  foods-shared.ts TAG_LABELS). Verified at module-load time — fails
 *  the build immediately if a typo sneaks in.
 *
 *  We derive the set from TAG_LABELS keys directly (the source of truth)
 *  rather than POPULAR_TAGS — POPULAR_TAGS is a UI-display subset and
 *  intentionally does not include every valid tag. */
const ALL_KNOWN_TAGS = new Set(Object.keys(TAG_LABELS));
for (const c of FOOD_COLLECTIONS) {
  if (!ALL_KNOWN_TAGS.has(c.tag)) {
    throw new Error(
      `Food collection "${c.slug}" uses unknown tag "${c.tag}" — add it to foods-shared.ts TAG_LABELS first.`,
    );
  }
}

// ============================================================================
// 4. SPOKE→HUB INTERNAL LINKING RESOLVERS — Phase 155 (SEO-GEO-4.7, §7.1 #11)
// ============================================================================
//
// Discovery audit (Phase 155): the hub pages were already well-linked OUT
// (hub → spokes + cross-hubs + tools), but the detail ("spoke") pages only
// linked within their own family — food pages never linked the tag
// collections (which were discoverable almost exclusively through the
// header nav), and exercise pages never linked their muscle/equipment hubs.
// These resolvers make the spoke→hub direction deterministic and
// data-driven: no content authoring, no AI, exact 1:1 field matches.

/** Max collection links rendered on a single food page (hub hygiene). */
export const MAX_COLLECTION_LINKS_PER_FOOD = 2;

/** Muscle hub for an exercise's primary category (1:1 by design). */
export function getMuscleHubByCategory(
  category: ExerciseCategory,
): MuscleHub | null {
  return MUSCLE_HUBS.find((h) => h.category === category) ?? null;
}

/** Equipment hub for an exercise's equipment type (1:1 by design). */
export function getEquipmentHubByEquipment(
  equipment: Equipment,
): EquipmentHub | null {
  return EQUIPMENT_HUBS.find((h) => h.equipment === equipment) ?? null;
}

/**
 * Food collections matching a food's tags, in FOOD_COLLECTIONS order
 * (deterministic — the array order is the editorial priority), capped at
 * MAX_COLLECTION_LINKS_PER_FOOD. Foods with no tags (the USDA long tail)
 * return [] and render no collection links — honest linking only.
 */
export function getCollectionsForFoodTags(
  tags: string[] | undefined | null,
): FoodCollection[] {
  if (!tags || tags.length === 0) return [];
  const out: FoodCollection[] = [];
  for (const c of FOOD_COLLECTIONS) {
    if (tags.includes(c.tag)) {
      out.push(c);
      if (out.length >= MAX_COLLECTION_LINKS_PER_FOOD) break;
    }
  }
  return out;
}

/**
 * Tiny serializable link record passed to client detail components —
 * keeps the (server-only) hub modules out of the client bundle while
 * the pages still render exact bilingual anchors.
 */
export type HubLinkMini = {
  href: string;
  labelEn: string;
  labelAr: string;
};

// ============================================================================
// 5. EMPTY-HUB SITEMAP POLICY — Phase 155 (extends the A-5 crawl economy)
// ============================================================================
//
// Library census (Phase 155, pinned by hub-linking.test.ts): the 868-row
// exercise library contains ZERO rows with category "cardio" and ZERO rows
// with equipment "none" — so /muscles/cardio and /equipment/none (EN+AR)
// are live hub pages rendering an EMPTY grid. Per the A-5 precedent
// ("don't advertise pages that cannot rank"), they stay live (slug law,
// cross-linked from sibling hubs) but are NOT advertised in
// sitemap-collections.xml until the library actually gains matching rows.
// Re-admission is automatic: the helpers below flip to true the moment a
// matching exercise ships.

/** True when the hub's library filter yields at least one exercise. */
export function isAdvertisedMuscleHub(hub: MuscleHub): boolean {
  return getExercisesForMuscleHub(hub).length > 0;
}

/** True when the equipment hub's library filter yields at least one exercise. */
export function isAdvertisedEquipmentHub(hub: EquipmentHub): boolean {
  return getExercisesForEquipmentHub(hub).length > 0;
}
