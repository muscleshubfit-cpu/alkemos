/**
 * SEO-GEO-4 (2026-09-08): /ar/tools — Arabic mirror of the tools hub.
 *
 * Re-exports the bilingual client hub page. The I18nProvider receives
 * `urlLocale="ar"` from the root layout (middleware x-pathname → /ar/*
 * subtree), so the page renders fully in Arabic server-side — including
 * its H1 and the tool-card grid.
 */
export { default } from "@/app/tools/page";
