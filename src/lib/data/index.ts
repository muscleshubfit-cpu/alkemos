// Barrel re-export for the data layer.
//
// This preserves the public surface of the original `src/lib/data.ts`:
// all existing imports `from "@/lib/data"` continue to work unchanged.
// The implementation is now split into domain-specific modules under
// src/lib/data/ for maintainability.

export * from "./helpers";
export * from "./auth";
export * from "./plans";
export * from "./progress";
export * from "./tickets";
export * from "./notifications";
export * from "./subscriptions";
export * from "./chat";
export * from "./questionnaires";
export * from "./referrals";
// NOTE (Phase 171 — blog-audit proposal أ): "./blog" is GONE. The legacy
// client-side blog data layer (listBlogPosts/getBlogPost WITHOUT language)
// was deleted — it collided by name with the LIVE lang-aware versions in
// `@/lib/blog` and silently resurrected the old reading system when
// imported from this barrel. Blog reads go through `@/lib/blog` only.
export * from "./coach";
