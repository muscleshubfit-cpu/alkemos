import Image from "next/image";
import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { PageBanner } from "@/components/PageBanner";
import { sizedRemoteImage } from "@/lib/remote-image-size";
import { BLOG_CATEGORIES } from "@/lib/blog-server";
import { BLOG_CATEGORY_CONTENT } from "@/lib/blog-category-content";
import type { BlogPostCard } from "@/lib/blog";

/**
 * BLOG CATEGORY PAGE — the crawlable category surface (P2-11, §12.19
 * item 11: «تصنيف مدونة قابل للزحف: صفحات فئات فعلية بروابط سياقية»).
 *
 * A SERVER component: the category list, the H1, the unique intro, and
 * every article card anchor live in the first HTML payload — crawlers
 * and AI crawlers see the full link graph without executing anything
 * (the old category chips were client-state buttons, invisible to the
 * link graph). Rendered by /blog/category/[slug] and
 * /ar/blog/category/[slug] (generateStaticParams × 10 per language).
 *
 * HONESTY LAWS (canary-pinned in blog-category-pages.test.ts):
 *   - Every post card links to a real published article URL in the
 *     page's own language.
 *   - The category navigation is LINKS (not filter buttons) so every
 *     sibling category page is one crawlable hop away.
 *   - Empty category → an honest empty state, never fabricated cards.
 */

export function BlogCategoryPage({
  lang,
  categoryId,
  posts,
}: {
  lang: "en" | "ar";
  categoryId: string;
  posts: BlogPostCard[];
}) {
  const isAr = lang === "ar";
  const content = BLOG_CATEGORY_CONTENT[categoryId];
  const label = (id: string) => {
    const cat = BLOG_CATEGORIES.find((c) => c.id === id);
    return cat ? (isAr ? cat.ar : cat.en) : id;
  };
  const prefix = isAr ? "/ar/blog" : "/blog";

  return (
    <div className="flex min-h-screen flex-col bg-[var(--bg)] text-[var(--text)]">
      <SiteHeader variant="landing" />

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-20 sm:px-6 md:py-28">
        <div className="mb-12">
          <PageBanner section="blog" />
        </div>

        {/* Hero — the category's own identity */}
        <div className="mb-10 text-center">
          <p className="text-sm font-normal text-[var(--muted-foreground)]">
            <Link href={prefix} className="underline-offset-4 hover:underline">
              {isAr ? "مدونة Alkemos" : "Alkemos Blog"}
            </Link>
            <span className="mx-2" aria-hidden="true">›</span>
            <span>{label(categoryId)}</span>
          </p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight md:text-6xl">
            {isAr ? content.titleAr : content.titleEn}
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg font-normal leading-relaxed text-[var(--muted-foreground)]">
            {isAr ? content.introAr : content.introEn}
          </p>
        </div>

        {/* Category navigation — real links (the crawlable chip row) */}
        <nav aria-label={isAr ? "تصنيفات المدونة" : "Blog categories"} className="mb-12 flex flex-wrap justify-center gap-2">
          <Link
            href={prefix}
            className={`rounded-full px-4 py-2 text-xs font-normal transition-all ${
              "bg-[var(--tint)] text-[var(--muted-foreground)] hover:text-[var(--text)]"
            }`}
          >
            {isAr ? "كل المقالات" : "All articles"}
          </Link>
          {BLOG_CATEGORIES.map((cat) => (
            <Link
              key={cat.id}
              href={`${prefix}/category/${cat.id}`}
              className={`rounded-full px-4 py-2 text-xs font-normal transition-all ${
                cat.id === categoryId
                  ? "bg-[var(--text)] text-[var(--bg)]"
                  : "bg-[var(--tint)] text-[var(--muted-foreground)] hover:text-[var(--text)]"
              }`}
            >
              {isAr ? cat.ar : cat.en}
            </Link>
          ))}
        </nav>

        {/* Posts grid — server-rendered article anchors */}
        {posts.length === 0 ? (
          <div className="py-20 text-center text-base font-normal text-[var(--muted-foreground)]">
            {isAr
              ? "لا توجد مقالات منشورة في هذا التصنيف بعد — ستظهر هنا فور نشرها."
              : "No published articles in this category yet — they will appear here as soon as they publish."}
            <div className="mt-6">
              <Link
                href={prefix}
                className="rounded-full border border-[var(--edge)] px-5 py-2.5 text-sm font-normal transition-colors hover:border-[var(--chrome-edge)]"
              >
                {isAr ? "تصفّح كل المقالات" : "Browse all articles"}
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <a
                key={post.id}
                href={isAr ? `/ar/blog/${post.slug}` : `/blog/${post.slug}`}
                className="marble-card group block overflow-hidden transition-transform duration-300 hover:-translate-y-0.5"
              >
                {post.featured_image && (
                  <div className="relative aspect-video overflow-hidden">
                    <Image
                      src={sizedRemoteImage(post.featured_image, 800, 16 / 9) || post.featured_image}
                      alt={post.cover_alt || post.title}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 400px"
                      className="object-cover"
                    />
                  </div>
                )}
                <div className="p-6">
                  <div className="flex items-center gap-3 text-xs font-normal text-[var(--muted-foreground)]">
                    <span className="seal-chip">{label(post.category)}</span>
                    <span>
                      {post.reading_time} {isAr ? "دقائق" : "min"}
                    </span>
                  </div>
                  <h2 className="mt-3 text-lg font-semibold leading-tight tracking-tight">
                    {post.title}
                  </h2>
                  <p className="mt-2 line-clamp-2 text-sm font-normal text-[var(--muted-foreground)]">
                    {post.excerpt}
                  </p>
                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-xs font-normal text-[var(--muted-foreground)]">
                      {post.author}
                    </span>
                    <span className="chrome-text text-xs font-semibold">
                      {isAr ? "اقرأ المزيد ›" : "Read more ›"}
                    </span>
                  </div>
                </div>
              </a>
            ))}
          </div>
        )}

        {/* Contextual cross-links — every sibling category one hop away */}
        <div className="mt-16 border-t border-[var(--edge)] pt-8">
          <h2 className="text-center text-base font-semibold tracking-tight">
            {isAr ? "تصنيفات أخرى" : "Other categories"}
          </h2>
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            {BLOG_CATEGORIES.filter((c) => c.id !== categoryId).map((cat) => (
              <Link
                key={cat.id}
                href={`${prefix}/category/${cat.id}`}
                className="rounded-full border border-[var(--edge)] px-4 py-2 text-xs font-normal text-[var(--muted-foreground)] transition-colors hover:border-[var(--chrome-edge)] hover:text-[var(--text)]"
              >
                {isAr ? cat.ar : cat.en}
              </Link>
            ))}
          </div>
        </div>
      </main>

      <footer className="mt-auto border-t border-[var(--edge)] py-6 text-center text-xs font-normal text-[var(--muted-foreground)]">
        © {new Date().getFullYear()} Alkemos. {isAr ? "كل الحقوق محفوظة." : "All rights reserved."}
      </footer>
    </div>
  );
}
