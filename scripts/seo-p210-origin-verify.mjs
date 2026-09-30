#!/usr/bin/env node
/** P2-10 production origin verification (cache-bust) — proves the deployed build serves ≤160 everywhere */
const BASE = 'https://alkemos.com';
const LIMIT = 160;
const CB = 'p210v';

const routes = [
  '/', '/ar', '/evo', '/ar/evo', '/for-coaches', '/ar/for-coaches',
  '/coaching', '/ar/coaching', '/compare', '/ar/compare',
  '/memberships', '/ar/memberships', '/macro-tracker', '/ar/macro-tracker',
  '/tools', '/ar/tools',
  '/tools/calorie-calculator', '/ar/tools/calorie-calculator',
  '/tools/water-tracker', '/ar/tools/water-tracker',
  '/tools/bmi-calculator', '/ar/tools/bmi-calculator',
  '/tools/macro-calculator', '/ar/tools/macro-calculator',
  '/meal-planner', '/ar/meal-planner', '/affiliate', '/ar/affiliate',
  '/ai-workout-planner', '/ar/ai-workout-planner',
  '/faq', '/ar/faq', '/about', '/ar/about', '/terms', '/ar/terms',
  '/authors', '/ar/authors', '/contact', '/ar/contact', '/privacy', '/ar/privacy',
  '/exercises', '/ar/exercises', '/programs', '/ar/programs',
  '/diet-plan', '/ar/diet-plan',
  '/guides/macro-tracking-accuracy', '/ar/guides/macro-tracking-accuracy',
  '/foods/methodology', '/ar/foods/methodology',
  ...['home-beginner-fullbody','home-fat-loss-hiit','home-core-specialization','home-dumbbell-ppl','gym-beginner-fullbody','gym-ppl-intermediate','gym-strength-5x5'].flatMap(s => [`/programs/${s}`, `/ar/programs/${s}`]),
  '/exercises/34-sit-up', '/ar/exercises/34-sit-up',
  '/exercises/standing-dumbbell-straight-arm-front-delt-raise-above-head',
  '/exercises/lying-close-grip-barbell-triceps-extension-behind-the-head',
];

let pass = 0, fail = 0;
for (const r of routes) {
  const res = await fetch(`${BASE}${r}?cb=${CB}`, { headers: { 'user-agent': 'alkemos-p210-verify/1.0' } });
  const html = await res.text();
  const m = html.match(/<meta name="description" content="([^"]*)"/);
  const desc = m ? m[1] : null;
  if (res.status === 200 && desc && desc.length <= LIMIT) {
    pass++;
  } else {
    fail++;
    console.log(`✗ ${desc ? desc.length : 'NO-DESC'} ${res.status} ${r} — ${desc ? JSON.stringify(desc.slice(0, 70)) : ''}`);
  }
}
console.log(`\nORIGIN VERIFICATION (cache-bust): ${pass}/${routes.length} pages ≤160 · ${fail} failures`);
process.exit(fail ? 1 : 0);
