# Alkemos — The Smart Fitness & Nutrition Platform

> **Live:** [alkemos.com](https://alkemos.com)
> **Stack:** Next.js 16 · React 19 · TypeScript · Supabase · Tailwind CSS 4 · OpenRouter + Groq + NVIDIA NIM (AI) · Vercel
> **Quality:** every push is audited by automated CI gates — types, lint, tests, schema-drift, docs parity, anti-regression
> **Status:** in production · current live status: [`STATE.md`](./STATE.md)
> **Last updated:** 2026-09-24

Alkemos is a bilingual (English + full Arabic RTL mirror) fitness and nutrition
platform that unifies training, nutrition, and AI planning in one product:
real content libraries, free planning tools, an AI coach (**EVO**), human
coaching, and an automated bilingual blog — backed by membership tiers, an
affiliate program, a complete B2B coach system, and a full admin platform.

This repository holds the entire production platform. The repository is
**private** (owner decision 2026-09-24) — the code is **proprietary and
confidential**, accessible only to owner-authorized collaborators
(see [License](#-license)).

---

## 🧭 What Alkemos offers

### The refined homepage (`src/components/views/LandingView.tsx`)
The homepage IS the product's first five minutes — the visitor USES the
platform before any signup, through independent interactive sections:
a real calorie/macro calculator running the app's own formulas
(`src/lib/fitness-math.ts` — the single source the tools page shares),
an EVO section (labeled conversation demo whose CTA opens the real
floating chat widget, warrior artwork), an interactive smart-planning
section (`#plan`: a workout-plan builder + a nutrition-plan builder
with live previews — real planner vocabulary from
`src/lib/ai-workout-planner.ts`, real diet-matrix splits via
`src/lib/home-samples.ts`), an interactive food macro explorer, and
blog-style carousels for the exercise library and the ready-made
diet-plan library (both fed by the server-provided curated samples).
The hero carries exactly two CTAs (login/signup + the memberships
page) over a compact one-row proof strip; memberships render as small
cards (prices derive from `memberships.ts` — never literals) plus one
online-coaching card. Motion is once-only, transform/opacity-only, and
fully `prefers-reduced-motion`-safe (DESIGN.md §7.1.2/§7.4.2).

### Free content & tools — no account needed
- **Exercise library** — 868 exercises with start/end position images
  (self-hosted WebP), bilingual names / instructions / tips in modern standard
  Arabic + English, filterable by muscle group, equipment, and level
  (`src/lib/exercises.ts`)
- **Food database** — 8,830 foods with per-100g macros, bilingual labels and
  search (`src/lib/foods.ts`); the hand-curated foods plus a bounded,
  batch-expanded USDA band carry real Arabic names (`SEO_FOOD_BAND` in
  `src/lib/seo-food-band.ts` is the single source for the band;
  `/api/food-search` takes `?lang=ar|en` for language-matched result names)
- **Workout programs** — 7 structured, ready-to-follow programs for home,
  home-equipment, and gym, from beginner to advanced
  (`src/lib/workout-programs.ts`)
- **Free tools** — calorie calculator, BMI, macros, body-fat %, water tracker,
  and an interactive meal planner, each with email delivery of results and
  bilingual inline validation (`src/lib/tools-shared.ts` is the single source
  of the tools list)
- **AI planners** — AI meal planner and AI workout planner with a free trial,
  no signup required (a plan generated without an account stays on that device
  until you create one, then syncs to the account)
- **Blog & comparison hub** — bilingual articles plus focused
  "Alkemos vs …" comparison pages (`/blog`, `/compare`)

### EVO — the AI coach
- Floating chat widget on every page + a dedicated `/evo` experience, with
  **live SSE streaming** answers (raw tokens arrive as they are generated)
- **10 messages/day free** (subscribers unlimited), free memory of goals and
  preferences, and opt-in weekly follow-up emails
- A safety layer answers self-harm / eating-disorder signals with a static safe
  redirect — those never reach a model (`src/lib/evo-safety.ts`); plan and
  swap requests are quota-gated through an intent layer (`src/lib/evo-intent.ts`)
- Dispatch telemetry, a frequent-question cache, and a weekly automated AR/EN
  quality eval, surfaced read-only at `/admin/evo-analytics`

### Memberships

| Tier | Price | AI plan generations / month* | EVO chat | Plan swaps | Saved results |
|---|---|---|---|---|---|
| Free (& guests, no signup) | $0 | 2 | 10 msgs/day | — | 3 |
| Premium | $14.99/mo · $119/yr | 4 | Unlimited | 3/week | 50 + export |
| Pro | $29.99/mo · $239/yr | 8 | Unlimited | 6/week | 200 + export, ad-free |
| Coaching | $39.99/mo · $359/yr | 8 + human coach | Unlimited | 6/week | 200 + export |

\* One unified monthly pool for nutrition + workout generations combined —
only successful generations count; failed attempts and edits never burn quota.
Prices, quotas, and tier features are defined in a single source:
`src/lib/memberships.ts` + the quota engine `src/lib/tier-limits.ts`.
Every paid tier carries a 7-day conditional refund (no-features-used,
ledger-based — `src/lib/refund.ts`).

### For coaches (B2B)
- **Client dashboard** — lifecycle filter tabs and per-client management
  (overview, subscription, plans, AI plans, questionnaires, progress)
- **AI plans** — generation draws from the client's own balance
  (ownership-checked); manual edits and per-element regeneration are unlimited
- **Wallet system** — fixed per-client activation pricing paid to the platform,
  receipt-reviewed top-ups (InstaPay / Vodafone Cash / PayPal), activation
  gated on sufficient balance
- **Public coach page** — claimable slug, landing editor, ads, certificates
  (`/coaches/[slug]`)
- **Affiliate program** — 20% commission on referred subscription payments,
  $10 minimum payout, 7-day hold, automatic reversal on refunds
  (`src/lib/affiliate-engine-server.ts`)

### Site coaches (B2C) & the admin platform
- Every coach is `site` (platform-employed) or `b2b` (independent business) —
  one-tap toggle in the admin roster
- Site coaches follow up platform members 1↔1 through a dedicated assignments
  surface, deliberately separate from the B2B money relation
- **Admin Panel** (`/admin`, admin-only): unified client roster with
  role/lifecycle filters, finances (site money vs coach money), payments and
  the refund console, blog CMS, coach-system center, wallets, leads,
  referrals, saved results, and EVO analytics
- **Payments** — PayPal (create / capture / webhook) plus manual review
  (InstaPay / Vodafone Cash / bank transfer)

---

## 🏗️ Architecture at a glance

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| UI | React 19 · Tailwind CSS 4 · shadcn/ui |
| Language | TypeScript 5 (strict) |
| Database | Supabase — Postgres, Auth, Storage, Row Level Security |
| AI | OpenRouter + Groq + NVIDIA NIM, one unified layer (`src/lib/ai-provider.ts`) |
| Payments | PayPal + manual review |
| Email | Brevo REST API |
| Charts | Recharts (lazy-loaded) |
| Forms | react-hook-form + zod |
| Testing | Vitest + Testing Library |
| PWA | manifest + service worker (installable) |
| Deployment | Vercel (Frankfurt — fra1) |

### Repository layout

```
alkemos/
├── src/
│   ├── app/                    # Next.js App Router — public site, /ar Arabic
│   │                           #   mirror, authenticated member area, /admin,
│   │                           #   and /api routes
│   ├── components/             # Page-level views, shadcn/ui primitives,
│   │                           #   shared components (header, footer, EVO widget)
│   ├── hooks/                  # React hooks (auth, nav, tier, voice input…)
│   ├── lib/                    # Business logic, data layer, datasets, AI,
│   │                           #   i18n, share links, SEO — e.g.
│   │                           #   memberships.ts (tiers/pricing single source),
│   │                           #   tier-limits.ts (quota engine),
│   │                           #   exercises.ts / foods.ts (server-only datasets),
│   │                           #   ai-provider.ts (unified AI layer),
│   │                           #   seo.ts (JSON-LD generators)
│   │   └── supabase/           # Clients + generated DB types
│   └── middleware.ts           # Session refresh + locale/lang/dir handling
├── supabase/migrations/        # Versioned migration registry (INDEX.md = ledger)
├── scripts/                    # CI gate scripts + pipeline runners
├── .github/workflows/          # CI gates + scheduled content/ops pipelines
├── docs/                       # Project documentation (index: docs/README.md)
├── public/                     # Static assets, exercise images, PWA files
├── archive/                    # Frozen historical records (append-only)
├── STATE.md                    # Live project status (official status file)
├── DEVELOPER_GUIDE.md          # Developer onboarding + architecture
└── SECURITY.md · CONTRIBUTING.md · LICENSE
```

### Bilingual by architecture
- A full Arabic RTL mirror at `/ar/*` — every public surface exists in both
  languages with reciprocal hreflang pairs
- Dynamic `lang` / `dir` on the root HTML tag per route locale, and a
  `Content-Language` header from middleware
- A custom lightweight i18n provider (no next-intl) with shared AR/EN copy in
  the source

### Data layer
- Supabase Postgres with **Row Level Security on every auto-applied table**
  and role-aware RPCs for the admin roster
- The schema evolves through a **versioned migration registry** —
  `supabase/migrations/` with [`INDEX.md`](./supabase/migrations/INDEX.md) as
  the binding ledger; migrations apply to production automatically through the
  Supabase–GitHub integration
- TypeScript DB types are generated from the schema
  (`src/lib/supabase/types.ts`)
- Daily automated JSON backups run to a **private** repository
  (`.github/workflows/db-backup.yml`) — user data never lands in this repo

### AI layer
One unified provider layer (`src/lib/ai-provider.ts`) is the only path to any
model — OpenRouter, Groq, and NVIDIA NIM — offering sequential
strongest-model chains, a `Promise.any` race mode for fast swaps, and SSE
streaming for chat. Every sequential path is budget-clamped so
`maxModels × timeoutMs` never exceeds ~52s (the serverless limit), and
long-running generation (the blog pipeline, queued AI jobs) runs on GitHub
Actions runners instead of serverless functions.

### Automated content pipeline
The bilingual blog is generated end-to-end — research → outline → article →
images → review → publish — as scheduled GitHub Actions workflows, one English
and one Arabic article per day. The pipeline carries editorial gates: Arabic
modern-standard purity checks, image-safety rules, FAQ single-display, and
topic selection deduplicated against the search-intent map
(`src/lib/intent-map.ts`) so articles never compete with canonical pages.

### SEO / GEO
JSON-LD structured data across the site (`src/lib/seo.ts`), dynamic XML
sitemaps (pages, blog, foods, exercises, collections, comparisons), a
`robots.txt` that welcomes AI crawlers, `llms.txt` + `llms-full.txt` for
generative engines, bilingual RSS feeds, and dedicated Open Graph cards per
surface family.

### Automated quality gates
Every push and pull request is audited on GitHub Actions by gates that
re-derive the truth from the code itself:

- **quality** — `tsc --noEmit` (0 errors), ESLint, and the full Vitest suite
- **parity** — migration-registry heading vs filesystem truth, schema ↔ types
  mirror audit, and the knowledge-system consistency audit
- **guard** — anti-regression scan for retired identifiers
- **Supabase Preview** — migrations run against a preview database before
  production

Full narrative — what each gate derives and why: [`docs/CI_GATES.md`](./docs/CI_GATES.md)

---

## 🚀 Getting started

### Prerequisites
- **Node.js 20.9+** (CI runs Node 22 — or **Bun 1.3+**)
- A **Supabase** project (free tier works)
- An **OpenRouter** API key (free tier works — the platform uses free models;
  Groq and NVIDIA NIM keys extend the fallback chain)

### Install & run

```bash
git clone https://github.com/muscleshubfit-cpu/alkemos.git   # private repo — requires owner-granted access
cd alkemos
bun install                  # or: npm install
cp .env.example .env.local   # then fill in your keys
bun dev                      # or: npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Minimum environment for a working instance (full annotated reference in
[`.env.example`](./.env.example)):

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
OPENROUTER_API=sk-or-v1-xxxxxxxxxxxxx
```

**Demo mode:** without Supabase variables the app runs on localStorage —
demo coach `ahmed@coach.app` / `coach123`, demo client
`client@demo.app` / `client123` (seeded in `src/lib/data/auth.ts`).

### Database setup
Apply `supabase/migrations/` to your Supabase project (numeric files first,
then timestamped files in order — or simply `supabase db push` with the CLI).
The registry, naming laws, and manual-script rules live in
[`supabase/migrations/INDEX.md`](./supabase/migrations/INDEX.md).

### Deployment (Vercel)
Import the repository on Vercel, add the environment variables, and deploy.
[`vercel.json`](./vercel.json) carries the production posture: Frankfurt
region, security headers (HSTS, CSP + report-only, X-Frame-Options,
Referrer-Policy, Permissions-Policy), immutable caching for static assets and
exercise images, and scheduled jobs (weekly progress reminder, daily pipeline
dispatch). Site URL, analytics, and ads integrations are env-configured.

---

## 📚 Documentation

| Doc | What it covers |
|---|---|
| [`STATE.md`](./STATE.md) | Live project status — the single official status file |
| [`docs/README.md`](./docs/README.md) | Documentation index & lifecycle registry |
| [`DEVELOPER_GUIDE.md`](./DEVELOPER_GUIDE.md) | Developer onboarding + architecture deep-dive |
| [`docs/TECH_REFERENCE.md`](./docs/TECH_REFERENCE.md) | Supabase, RLS, migrations, storage — deep technical reference |
| [`docs/CI_GATES.md`](./docs/CI_GATES.md) | The CI quality gates — what each derives and why |
| [`supabase/migrations/INDEX.md`](./supabase/migrations/INDEX.md) | Binding migration registry |
| [`.env.example`](./.env.example) | Annotated environment variable reference |
| [`SECURITY.md`](./SECURITY.md) | Security policy |
| [`CONTRIBUTING.md`](./CONTRIBUTING.md) | Contribution policy (proprietary — issues only) |
| [`LICENSE`](./LICENSE) | Proprietary license terms |

---

## 📝 License

This project is **proprietary**. All rights reserved.

The repository is **private** (owner decision 2026-09-24). Access is granted
solely at the owner's discretion, and the code is **NOT open source** — you may
NOT redistribute it, deploy a competing service, remove the license notice, or
use it to train commercial code-generation models. Production infrastructure,
customer data, financial data, and confidential business information never
appear in this repository.

Full terms: [`LICENSE`](./LICENSE) · security policy: [`SECURITY.md`](./SECURITY.md) ·
contributions: [`CONTRIBUTING.md`](./CONTRIBUTING.md)
