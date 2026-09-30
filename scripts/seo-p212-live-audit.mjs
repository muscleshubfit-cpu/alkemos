#!/usr/bin/env node
/**
 * P2-12 measurement (concurrent): crawl live sitemaps, parse rendered <img>,
 * classify images missing width+height by src pattern and page.
 * Usage: node scripts/seo-p212-live-audit.mjs [--limit N] [--out file.json]
 */
const BASE = "https://alkemos.com";
const CONC = 12;
const args = process.argv.slice(2);
const limitIdx = args.indexOf("--limit");
const LIMIT = limitIdx >= 0 ? +args[limitIdx + 1] : 0;
const outIdx = args.indexOf("--out");
const OUT = outIdx >= 0 ? args[outIdx + 1] : null;

async function fetchText(url) {
  const res = await fetch(url, { headers: { "user-agent": "Mozilla/5.0 (compatible; alkemos-seo-audit/1.0)" } });
  if (!res.ok) throw new Error(`${res.status} ${url}`);
  return res.text();
}

async function pool(items, fn, conc) {
  const results = [];
  let i = 0;
  const workers = Array.from({ length: Math.min(conc, items.length) }, async () => {
    while (i < items.length) {
      const idx = i++;
      try { results[idx] = await fn(items[idx]); } catch (e) { results[idx] = null; }
    }
  });
  await Promise.all(workers);
  return results;
}

// 1. sitemaps
let pages = [];
for (const s of ["/sitemap.xml", "/ar/sitemap.xml"]) {
  try {
    const xml = await fetchText(BASE + s);
    const locs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
    const nested = locs.filter((l) => l.endsWith(".xml"));
    pages.push(...locs.filter((l) => !l.endsWith(".xml")));
    for (const n of nested) {
      try {
        const nx = await fetchText(n);
        pages.push(...[...nx.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]));
      } catch (e) { console.error(`skip ${n}`); }
    }
  } catch (e) { console.error(`skip ${s}`); }
}
pages = [...new Set(pages)];
console.log(`pages from sitemaps: ${pages.length}`);
if (LIMIT) pages = pages.slice(0, LIMIT);

const IMG_RE = /<img\b[^>]*>/gi;
const ATTR = (tag, name) => {
  const m = tag.match(new RegExp(`${name}\\s*=\\s*"([^"]*)"`, "i"));
  return m ? m[1] : null;
};
const patternize = (src) => {
  let pat = src
    .replace(/^https?:\/\/[^/]+/, "")
    .replace(/\/images\/exercises\/[^/]+\//, "/images/exercises/<EX>/")
    .replace(/\/_next\/[^?]+/, "/_next/<ASSET>")
    .replace(/\/exercises\/[a-z0-9-]+\/?/, "/exercises/<SLUG>/")
    .replace(/\/foods\/[a-z0-9-]+/i, "/foods/<FOOD>/")
    .replace(/\/programs\/[a-z0-9-]+/i, "/programs/<PROG>/")
    .replace(/\/guides\/[a-z0-9-]+/i, "/guides/<GUIDE>/")
    .replace(/\/blog\/[a-z0-9-]+/i, "/blog/<POST>/")
    .replace(/\/authors\/[a-z0-9-]+/i, "/authors/<AUTH>/")
    .replace(/compare\/[a-z0-9-]+/i, "compare/<APP>/")
    .replace(/\?.*$/, "")
    .replace(/\/[^/]*\.webp$/, "/<FILE>.webp")
    .replace(/\/[^/]*\.(png|jpg|jpeg|svg)$/i, "/<FILE>.$1");
  return pat || "(inline/data)";
};

const total = { imgs: 0, missing: 0, pages: 0, failPages: 0 };
const byPattern = new Map();
const byPage = new Map();
const missingDetails = []; // per missing img: {page, src, style}

let done = 0;
await pool(pages, async (url) => {
  const html = await fetchText(url);
  done++;
  if (done % 200 === 0) console.log(`  ... ${done}/${pages.length} pages`);
  total.pages++;
  const tags = html.match(IMG_RE) || [];
  for (const tag of tags) {
    total.imgs++;
    const w = ATTR(tag, "width");
    const h = ATTR(tag, "height");
    const has = w != null && h != null && !isNaN(+w) && !isNaN(+h);
    if (!has) {
      total.missing++;
      const src = ATTR(tag, "src") || "";
      const style = ATTR(tag, "style") || "";
      const pat = patternize(src);
      if (!byPattern.has(pat)) byPattern.set(pat, { count: 0, pages: new Set(), sample: src.slice(0, 140), styleSample: style.slice(0, 160) });
      const e = byPattern.get(pat);
      e.count++;
      e.pages.add(url.replace(BASE, ""));
      const rp = url.replace(BASE, "");
      byPage.set(rp, (byPage.get(rp) || 0) + 1);
      if (missingDetails.length < 3000) missingDetails.push({ page: rp, src, style });
    }
  }
}, CONC);

console.log(`\nTOTAL pages crawled: ${total.pages} (fail: ${total.failPages})`);
console.log(`TOTAL imgs: ${total.imgs} | missing width+height: ${total.missing}`);
console.log(`\n=== by src pattern (sorted by count) ===`);
for (const [pat, e] of [...byPattern.entries()].sort((a, b) => b[1].count - a[1].count)) {
  console.log(`${String(e.count).padStart(5)}  pages:${String(e.pages.size).padStart(4)}  ${pat}`);
  console.log(`         sample=${e.sample}`);
  if (e.styleSample) console.log(`         style=${e.styleSample}`);
}
console.log(`\n=== top 20 pages by missing count ===`);
for (const [p, c] of [...byPage.entries()].sort((a, b) => b[1] - a[1]).slice(0, 20)) console.log(`${String(c).padStart(4)}  ${p}`);

if (OUT) {
  const fs = await import("fs");
  fs.writeFileSync(OUT, JSON.stringify({
    total, byPattern: [...byPattern.entries()].map(([pat, e]) => ({ pat, count: e.count, pages: e.pages.size, sample: e.sample, styleSample: e.styleSample })),
    byPage: [...byPage.entries()], missingDetails,
  }, null, 2));
  console.log(`\nwritten: ${OUT}`);
}
