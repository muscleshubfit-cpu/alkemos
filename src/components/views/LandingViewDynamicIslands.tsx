"use client";

// ============================================================
// LandingViewDynamicIslands — SEO-P1-6 (frame 315, plan §5 steps
// 1–2): the homepage's two DATA-FETCH sections, split out of the
// old 1,851-line "use client" LandingView and loaded through
// next/dynamic (WITHOUT ssr:false — not allowed in a server
// component, and functionally a no-op here because both sections
// render NOTHING on the server today: their initial state is empty
// and their markup is gated on the fetched data).
//
// WHY a separate file from LandingViewIslands.tsx: the static
// islands (Reveal/CountUp/…) are imported by the server view at
// module level, so anything living in that file would ride the
// initial bundle. Keeping the blog fetch in ITS OWN module behind
// the dynamic() boundary takes it off the hydration-critical path
// (Next ships it as a NON-BLOCKING async script) and out of the
// page's main chunk graph — the KPI mandate of plan §2/§6 (islands
// file layout refinement, documented in the frame's worklog entry;
// the plan's island inventory and behavior contract are untouched).
//
// Zero behavior change (plan §4): the fetches keep their exact
// timing semantics — the blog carousel still loads via deferIdle
// (2500ms, so the Supabase chunk never competes with LCP/INP) and
// the coaches strip still fetches at mount with silent failure.
// The locale arrives as an `isAr` prop from the server pages (the
// BlogListPage precedent: server-resolved, URL-pinned — see the
// plan's §3 boundary analysis).
// ============================================================

import { useState, useEffect } from "react";
import Image from "next/image";
import { useAuth } from "@/hooks/use-auth";
import { listBlogPosts, getCategoryLabel, selectHomeBlogCarousels, type BlogPostCard } from "@/lib/blog";
import { deferIdle } from "@/lib/defer-idle";
import { EngravedIcon } from "@/components/ThemeImg";
import { CarouselShell, Reveal } from "./LandingViewIslands";

// ============================================================
// Site palette — the Marble & Chrome identity resolves through
// the CSS variables in globals.css (:root + [data-theme="dark"]).
// (Duplicated verbatim from the server view — plan §4.4.)
// ============================================================
const PALETTE = {
  textPrim: "var(--text)",
  textSec: "var(--muted-foreground)",
  textMuted: "var(--muted-foreground)",
  border: "var(--edge)",
  surface: "var(--card)",
  sectionWhite: "var(--bg)",
  sectionGray: "var(--tint)",
  halo: "var(--tint)",
};

function BlogCarousel({
  posts,
  featuredSlugs = [],
  isAr,
}: {
  posts: BlogPostCard[];
  /** Featured slugs render as the dark lead card; ONE carousel since
      Phase 198 Batch 2 (selection logic untouched). */
  featuredSlugs?: string[];
  isAr: boolean;
}) {
  const featuredSet = new Set(featuredSlugs);

  return (
    <CarouselShell isAr={isAr} ariaLabel={isAr ? "أحدث المقالات" : "Latest articles"}>
      {posts.map((post) => {
        const isFeatured = featuredSet.has(post.slug);
        return (
          <a
            key={post.id}
            href={`${isAr ? "/ar" : ""}/blog/${encodeURIComponent(post.slug)}`}
            className="marble-card card-lift group block shrink-0"
            style={{
              color: isFeatured ? "#F5F5F7" : PALETTE.textPrim,
              width: isFeatured ? "18rem" : "20rem",
              backgroundColor: isFeatured ? "#0B0B0D" : undefined,
            }}
          >
            {post.featured_image && (
              <div className="relative aspect-[16/10] w-full overflow-hidden">
                <Image
                  src={post.featured_image}
                  alt={post.cover_alt || post.title}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                  loading="lazy"
                />
              </div>
            )}
            <div className="p-5">
              <p
                className="text-[10px] font-semibold uppercase tracking-[0.14em]"
                style={{ color: isFeatured ? "rgba(245,245,247,0.65)" : "var(--muted-foreground)" }}
              >
                {getCategoryLabel(post.category, isAr ? "ar" : "en")}
              </p>
              <h3 className="mt-2 text-lg font-semibold leading-tight tracking-tight line-clamp-2">
                {post.title}
              </h3>
              {post.excerpt && (
                <p
                  className="mt-2 line-clamp-2 text-sm font-normal"
                  style={{ color: isFeatured ? "rgba(255,255,255,0.7)" : PALETTE.textSec }}
                >
                  {post.excerpt}
                </p>
              )}
              <p className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold" style={{ color: isFeatured ? "#F5F5F7" : PALETTE.textPrim }}>
                <EngravedIcon name="scroll" alt="" size={14} className="h-3.5 w-3.5" />
                {isAr ? "اقرأ ›" : "Read ›"}
              </p>
            </div>
          </a>
        );
      })}
    </CarouselShell>
  );
}

// ── BlogSection — the #learn island (moved verbatim from the old
//    client LandingView: the deferred fetch + the conditional
//    section). The copy strings arrive as props from the server
//    (the site-content registry resolves on the server side —
//    the copy stays single-source in site-content/home.ts). ──
export function BlogSection({
  learnTitle,
  learnCta,
  isAr,
}: {
  learnTitle: string;
  learnCta: string;
  isAr: boolean;
}) {
  const { isCoach } = useAuth();
  const [latestPosts, setLatestPosts] = useState<BlogPostCard[]>([]);
  const [featuredPosts, setFeaturedPosts] = useState<BlogPostCard[]>([]);

  useEffect(() => {
    // Supabase client chunk loads on demand — deferred to idle so it
    // never competes with LCP/INP on slow networks.
    deferIdle(() => {
      void (async () => {
        const posts = await listBlogPosts(isAr ? "ar" : "en");
        const { latest, featured } = selectHomeBlogCarousels(posts);
        setLatestPosts(latest);
        setFeaturedPosts(featured);
      })();
    }, 2500);
  }, [isAr]);

  const blogHref = isCoach ? "/admin/blog" : isAr ? "/ar/blog" : "/blog";

  if (latestPosts.length === 0) return null;
  return (
    <section id="learn" className="scroll-mt-20 bg-[var(--bg)] px-4 py-10 md:py-20">
      <div className="mx-auto max-w-6xl">
        <Reveal className="text-center">
          <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">
            {learnTitle}
          </h2>
        </Reveal>
        <div className="mt-10">
          <BlogCarousel
            posts={[...latestPosts, ...featuredPosts].slice(0, 10)}
            featuredSlugs={featuredPosts.map((p) => p.slug)}
            isAr={isAr}
          />
        </div>
        <div className="mt-6 text-center">
          <a href={blogHref} className="btn-outline px-6 py-2.5 text-sm font-medium">
            {learnCta}
            <span className="chev rtl:rotate-180" aria-hidden="true">›</span>
          </a>
        </div>
      </div>
    </section>
  );
}

// ── FeaturedCoachesStrip — the 0037 «أعلن معنا» paid-ad island
//    (moved verbatim: fetch at mount, silent failure, renders only
//    when active ads exist — a failed/empty call never affects the
//    homepage). The section copy arrives as props from the server
//    registry. ──
type FeaturedCoach = { slug: string | null; name: string; headline: string; photo: string | null };

export function FeaturedCoachesStrip({
  coachesTitle,
  coachesBody,
  isAr,
}: {
  coachesTitle: string;
  coachesBody: string;
  isAr: boolean;
}) {
  const [featuredCoaches, setFeaturedCoaches] = useState<FeaturedCoach[]>([]);

  useEffect(() => {
    // Silent fetch — the strip only renders when active ads exist, so a
    // failed/empty call must never affect the homepage.
    fetch("/api/coaches/featured")
      .then((r) => (r.ok ? r.json() : null))
      .then((json) => setFeaturedCoaches(json?.coaches ?? []))
      .catch(() => setFeaturedCoaches([]));
  }, []);

  if (featuredCoaches.length === 0) return null;
  return (
    <section className="bg-[var(--bg)] px-4 pb-10 md:pb-20">
      <div className="mx-auto max-w-6xl">
        <h2 className="text-center text-3xl font-semibold tracking-tight md:text-4xl" style={{ color: PALETTE.textPrim }}>
          {coachesTitle}
        </h2>
        <p className="mx-auto mt-3 max-w-md text-center text-base font-normal" style={{ color: PALETTE.textSec }}>
          {coachesBody}
        </p>
        <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4">
          {featuredCoaches.map((coach, i) => {
            const href = coach.slug ? `${isAr ? "/ar" : ""}/coaches/${coach.slug}` : "/coaching";
            return (
              <a
                key={`${coach.slug || coach.name}-${i}`}
                href={href}
                className="marble-card card-lift group block p-5 text-center"
              >
                {coach.photo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={coach.photo}
                    alt={coach.name}
                    className="mx-auto h-16 w-16 rounded-full object-cover ring-4 ring-[var(--tint)]"
                  />
                ) : (
                  <div className="mx-auto grid h-16 w-16 place-items-center rounded-full border border-[var(--edge)] bg-[var(--tint)] text-xl font-semibold text-[var(--text)]">
                    {(coach.name.trim().charAt(0) || "M")}
                  </div>
                )}
                <p className="mt-3 truncate text-sm font-semibold" style={{ color: PALETTE.textPrim }}>
                  {coach.name}
                </p>
                {coach.headline && (
                  <p className="mt-1 line-clamp-2 text-xs font-normal" style={{ color: PALETTE.textSec }}>
                    {coach.headline}
                  </p>
                )}
              </a>
            );
          })}
        </div>
      </div>
    </section>
  );
}
