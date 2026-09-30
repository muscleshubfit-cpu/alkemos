#!/usr/bin/env node
/** P2-10 smoke: verify trimmed descriptions served locally (next start) — all must be ≤160 */
const BASE = 'http://localhost:3457';
const LIMIT = 160;

const routes = [
  '/', '/ar',
  '/evo', '/ar/evo',
  '/for-coaches', '/ar/for-coaches',
  '/coaching', '/ar/coaching',
  '/compare', '/ar/compare',
  '/memberships', '/ar/memberships',
  '/macro-tracker', '/ar/macro-tracker',
  '/tools', '/ar/tools',
  '/tools/calorie-calculator', '/ar/tools/calorie-calculator',
  '/tools/water-tracker', '/ar/tools/water-tracker',
  '/tools/bmi-calculator', '/ar/tools/bmi-calculator',
  '/tools/macro-calculator', '/ar/tools/macro-calculator',
  '/meal-planner', '/ar/meal-planner',
  '/affiliate', '/ar/affiliate',
  '/ai-workout-planner', '/ar/ai-workout-planner',
  '/faq', '/ar/faq',
  '/about', '/ar/about',
  '/terms', '/ar/terms',
  '/authors', '/ar/authors',
  '/contact', '/ar/contact',
  '/privacy', '/ar/privacy',
  '/exercises', '/ar/exercises',
  '/programs', '/ar/programs',
  '/diet-plan', '/ar/diet-plan',
  '/programs/home-beginner-fullbody', '/ar/programs/home-beginner-fullbody',
  '/programs/home-fat-loss-hiit', '/ar/programs/home-fat-loss-hiit',
  '/programs/home-core-specialization', '/ar/programs/home-core-specialization',
  '/programs/home-dumbbell-ppl', '/ar/programs/home-dumbbell-ppl',
  '/programs/gym-beginner-fullbody', '/ar/programs/gym-beginner-fullbody',
  '/programs/gym-ppl-intermediate', '/ar/programs/gym-ppl-intermediate',
  '/programs/gym-strength-5x5', '/ar/programs/gym-strength-5x5',
  '/guides/macro-tracking-accuracy', '/ar/guides/macro-tracking-accuracy',
  '/foods/methodology', '/ar/foods/methodology',
  '/exercises/34-sit-up',
  '/exercises/standing-dumbbell-straight-arm-front-delt-raise-above-head',
  '/exercises/lying-close-grip-barbell-triceps-extension-behind-the-head',
  '/foods/chicken-breast',
];

let pass = 0, fail = 0;
for (const r of routes) {
  const res = await fetch(BASE + r);
  const html = await res.text();
  const m = html.match(/<meta name="description" content="([^"]*)"/);
  const desc = m ? m[1] : null;
  const status = res.status;
  if (status === 200 && desc && desc.length <= LIMIT) {
    pass++;
    console.log(`✓ ${String(desc.length).padStart(3)}  ${status}  ${r}`);
  } else {
    fail++;
    console.log(`✗ ${desc ? desc.length : 'NO-DESC'}  ${status}  ${r}  ${desc ? JSON.stringify(desc.slice(0, 90)) : ''}`);
  }
}
console.log(`\n${pass} passed · ${fail} failed (limit ${LIMIT})`);
process.exit(fail ? 1 : 0);
