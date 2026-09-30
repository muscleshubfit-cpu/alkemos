#!/usr/bin/env node
/**
 * P2-12 production origin verify (cache-bust bypass — same technique as
 * seo-p210-origin-verify): every hub page that renders PageBanner must
 * serve BOTH imgs with width="1280" height="477"; fetchPriority=high on
 * light and loading="lazy" on dark must survive; every route must be 200.
 */
const BASE = "https://alkemos.com";
const HUBS = ["/tools", "/exercises", "/programs", "/foods", "/blog", "/memberships"];
const routes = [];
for (const h of HUBS) routes.push(h, "/ar" + h);
// blog category pages also render the blog banner
for (const c of ["workout", "nutrition", "supplements", "weight-loss", "muscle-gain", "health", "recipes", "science", "fitness", "wellness"]) {
  routes.push(`/blog/category/${c}`, `/ar/blog/category/${c}`);
}

let pass = 0, fail = 0;
for (const r of routes) {
  const cb = Date.now() + Math.random().toString(36).slice(2, 8);
  const res = await fetch(BASE + r + "?cb=" + cb, { headers: { "cache-control": "no-cache" } });
  const html = await res.text();
  const imgs = [...html.matchAll(/<img[^>]*header-[^>]*>/g)].map((m) => m[0]);
  const light = imgs.find((t) => t.includes("-light.webp"));
  const dark = imgs.find((t) => t.includes("-dark.webp"));
  const ok =
    res.status === 200 &&
    light && dark &&
    light.includes('width="1280"') && light.includes('height="477"') &&
    dark.includes('width="1280"') && dark.includes('height="477"') &&
    light.includes('fetchPriority="high"') &&
    dark.includes('loading="lazy"');
  if (ok) {
    pass++;
    console.log(`✓ ${res.status}  ${r}`);
  } else {
    fail++;
    console.log(`✗ ${res.status}  ${r}  light=${light ? "found" : "MISSING"} dark=${dark ? "found" : "MISSING"}`);
  }
}
console.log(`\n${pass}/${pass + fail} routes verified — ${fail === 0 ? "ALL GREEN" : "FAILURES PRESENT"}`);
process.exit(fail === 0 ? 0 : 1);
