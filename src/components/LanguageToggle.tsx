"use client";

import { useI18n } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Languages } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { getBlogPost, getLinkedPost } from "@/lib/blog";

/**
 * Site-wide language toggle. M31 fix: now navigates to the /ar/ mirror
 * (or back to the English URL) when a mirror exists, so the URL matches
 * the language and can be shared/bookmarked correctly.
 *
 * Pages with Arabic mirrors (/ar/*):
 *   /            <-> /ar
 *   /blog        <-> /ar/blog
 *   /blog/[slug] <-> /ar/blog/[slug] (via linked_post_id)
 *   /exercises   <-> /ar/exercises
 *   /programs    <-> /ar/programs (AR mirror 2026-08-31 — full-training
 *                   audit follow-up; detail pages mirror the same way)
 *   /foods       <-> /ar/foods
 *   /memberships <-> /ar/memberships
 *   /about       <-> /ar/about (AR expansion 2026-08-30)
 *   /faq         <-> /ar/faq (AR expansion 2026-08-30)
 *   /coaches/[slug] <-> /ar/coaches/[slug] (same slug — multi-coach
 *                   public landing, migration 0032 i18n follow-up)
 *   /tools       <-> /ar/tools (SEO-GEO-4, 2026-09-08 — every calculator
 *                   now has an Arabic mirror: /ar/tools/* + /ar/meal-planner)
 *   /compare     <-> /ar/compare (SEO-GEO-4, 2026-09-08 — comparison
 *                   index + detail pages mirror by prefix swap)
 * 
 * Pages without Arabic mirrors (e.g. /coaching, /evo, /privacy, /terms,
 * /contact, /affiliate): just toggle the UI language (the page content
 * is already bilingual via useI18n, so the user sees the new language
 * without a URL change).
 */
export function LanguageToggle() {
 const { lang, setLang } = useI18n();
 const pathname = usePathname() || "/";
 const router = useRouter();

 const handleToggle = async () => {
 const nextLang = lang === "ar" ? "en" : "ar";

 // Blog article page: /blog/[slug] <-> /ar/blog/[slug] (via linked_post_id)
 const enMatch = pathname.match(/^\/blog\/([^/]+)$/);
 const arMatch = pathname.match(/^\/ar\/blog\/([^/]+)$/);
 if (enMatch || arMatch) {
 const currentSlug = (enMatch || arMatch)![1];
 const currentArticleLang: "en" | "ar" = enMatch ? "en" : "ar";
 setLang(nextLang);
 try {
 const post = await getBlogPost(currentArticleLang, currentSlug);
 const linked = post ? await getLinkedPost(post) : null;
 if (linked) {
 router.push(linked.language === "ar" ? `/ar/blog/${linked.slug}` : `/blog/${linked.slug}`);
 return;
 }
 } catch {
 // fall through to list-page fallback below
 }
 // No translated version exists yet — land on the blog list in the new language.
 router.push(nextLang === "ar" ? "/ar/blog" : "/blog");
 return;
 }

 // Multi-coach public landing: /coaches/[slug] <-> /ar/coaches/[slug].
 // Same slug serves both languages (migration 0032), so the mirror is
 // a pure prefix swap — no lookup needed (unlike the blog pair).
 const coachEnMatch = pathname.match(/^\/coaches\/([^/]+)$/);
 const coachArMatch = pathname.match(/^\/ar\/coaches\/([^/]+)$/);
 if (coachEnMatch || coachArMatch) {
 const slug = (coachEnMatch || coachArMatch)![1];
 setLang(nextLang);
 router.push(nextLang === "ar" ? `/ar/coaches/${slug}` : `/coaches/${slug}`);
 return;
 }

 // Program detail: /programs/[slug] <-> /ar/programs/[slug].
 // Same slug serves both languages (static data), so the mirror is a pure
 // prefix swap — AR expansion 2026-08-31 (Phase 59 audit follow-up).
 const progEnMatch = pathname.match(/^\/programs\/([^/]+)$/);
 const progArMatch = pathname.match(/^\/ar\/programs\/([^/]+)$/);
 if (progEnMatch || progArMatch) {
 const slug = (progEnMatch || progArMatch)![1];
 setLang(nextLang);
 router.push(nextLang === "ar" ? `/ar/programs/${slug}` : `/programs/${slug}`);
 return;
 }

 // Comparison pages: /compare/[slug] <-> /ar/compare/[slug] (same slug,
 // static bilingual data — pure prefix swap). SEO-GEO-4, 2026-09-08.
 const compareEnMatch = pathname.match(/^\/compare\/([^/]+)$/);
 const compareArMatch = pathname.match(/^\/ar\/compare\/([^/]+)$/);
 if (compareEnMatch || compareArMatch) {
 const slug = (compareEnMatch || compareArMatch)![1];
 setLang(nextLang);
 router.push(nextLang === "ar" ? `/ar/compare/${slug}` : `/compare/${slug}`);
 return;
 }

 // Tools pages: /tools/[slug] <-> /ar/tools/[slug] (same slug, bilingual
 // client pages — pure prefix swap). SEO-GEO-4, 2026-09-08.
 const toolEnMatch = pathname.match(/^\/tools\/([^/]+)$/);
 const toolArMatch = pathname.match(/^\/ar\/tools\/([^/]+)$/);
 if (toolEnMatch || toolArMatch) {
 const slug = (toolEnMatch || toolArMatch)![1];
 setLang(nextLang);
 router.push(nextLang === "ar" ? `/ar/tools/${slug}` : `/tools/${slug}`);
 return;
 }

 // M31 fix: routes with known Arabic mirrors — navigate to the mirror URL.
 const MIRROR_ROUTES = [
 { en: "/", ar: "/ar" },
 { en: "/blog", ar: "/ar/blog" },
 { en: "/exercises", ar: "/ar/exercises" },
 { en: "/programs", ar: "/ar/programs" },
 { en: "/foods", ar: "/ar/foods" },
 { en: "/memberships", ar: "/ar/memberships" },
 { en: "/about", ar: "/ar/about" },
 { en: "/faq", ar: "/ar/faq" },
 { en: "/for-coaches", ar: "/ar/for-coaches" },
 { en: "/for-coaches/register", ar: "/ar/for-coaches/register" },
 { en: "/tools", ar: "/ar/tools" },
 { en: "/meal-planner", ar: "/ar/meal-planner" },
 // §12.27: the diet-plan matrix is bilingual — the toggle swaps trees.
 { en: "/diet-plan", ar: "/ar/diet-plan" },
 // §12.28: the AI meal-planner trial pair.
 { en: "/ai-meal-planner", ar: "/ar/ai-meal-planner" },
 { en: "/compare", ar: "/ar/compare" },
 // SEO-GEO-6.4 (P1-9): evo + coaching now have Arabic mirrors.
 { en: "/evo", ar: "/ar/evo" },
 { en: "/coaching", ar: "/ar/coaching" },
 ];

 for (const route of MIRROR_ROUTES) {
 if (pathname === route.en) {
 setLang(nextLang);
 router.push(nextLang === "ar" ? route.ar : route.en);
 return;
 }
 if (pathname === route.ar) {
 setLang(nextLang);
 router.push(nextLang === "ar" ? route.ar : route.en);
 return;
 }
 }

 // §12.27: the diet-plan matrix CELLS are server components on dynamic
 // mirror routes (/diet-plan/{level}/{system} ↔ /ar/diet-plan/…) — exact
 // matching can't cover 24 pairs, so the subtree swaps by prefix.
 if (pathname.startsWith("/diet-plan/")) {
 setLang(nextLang);
 router.push(nextLang === "ar" ? `/ar${pathname}` : pathname);
 return;
 }
 if (pathname.startsWith("/ar/diet-plan/")) {
 setLang(nextLang);
 router.push(nextLang === "ar" ? pathname : pathname.replace(/^\/ar/, ""));
 return;
 }

 // Pages without Arabic mirrors: just toggle the UI language.
 // The page content is already bilingual via useI18n, so the user sees
 // the new language immediately without a URL change.
 setLang(nextLang);
 };

 return (
 <Button
 variant="ghost"
 size="sm"
 className="gap-2"
 onClick={handleToggle}
 aria-label="Toggle language"
 >
 <Languages className="h-4 w-4" />
 <span className="text-xs font-semibold">{lang === "ar" ? "EN" : "ع"}</span>
 </Button>
 );
}
