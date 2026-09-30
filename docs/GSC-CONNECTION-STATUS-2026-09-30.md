# GSC Connection Status — 2026-09-30

> **Provenance:** owner order 2026-09-30 (documentation-only). This minimal note **replaces
> the deleted GSC audit** `docs/GSC-OPERATIONAL-INTEGRATION-AUDIT-2026-09-30.md` — the audit's
> full content is preserved verbatim in git history (created `5fd41d49`, corrected `3f46c8a0`,
> deleted by this order). Zero changes to code, workflows, secrets, database, or GSC
> configuration accompanied this note.

## 1. The connection: live and verified (readonly)

- The GSC connection is **live and verified**, using the **existing** service-account secret
  `GOOGLE_SEARCH_CONSOLE_CREDENTIALS` (GitHub repo secret) with **readonly** access — scope
  `webmasters.readonly`, service account `alkemos-gsc-reader@muscleshub.iam.gserviceaccount.com`.
- Evidence: the two successful `.github/workflows/gsc-connection-test.yml` runs
  (36647573294 · 36649457709) authenticated against Google and listed BOTH properties —
  `sc-domain:alkemos.com` and the legacy `https://musclehubeg.vercel.app/` — with a measured
  28-day search baseline.
- Nothing in this setup was changed by the owner order; the existing service account, secret,
  and readonly access stay exactly as verified above.

## 2. Permanent integration: intentionally deferred 30–60 days

- **Owner decision (2026-09-30):** permanent GSC integration is **intentionally deferred for
  30–60 days** (re-audit window: **2026-10-30 → 2026-11-29**). No GSC collector, storage,
  readers, scheduled workflows, or admin surfaces are to be implemented during this window.
- The binding owner principle of 2026-09-30 stands unchanged: GSC never determines
  new-content topics — discovery stays with live external research; GSC remains
  post-publication evidence only.

## 3. Re-audit is a hard prerequisite before any implementation

- Any future GSC implementation — code, workflow, database, or configuration — **must be
  re-audited first**: a fresh audit of the then-current repository state and GSC capabilities
  is required before any implementation begins.
- Until that re-audit, the GSC surface remains exactly what it is today: the existing readonly
  service-account secret plus the dispatch-only connection test — untouched.
