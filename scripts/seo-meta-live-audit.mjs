#!/usr/bin/env node
/**
 * SEO P2-10 — live meta description length audit (read-only, production)
 * Fetches every static page from sitemap-pages.xml + sitemap-comparisons.xml
 * and reports descriptions over the 160-char target.
 */
const BASE = 'https://alkemos.com';
const LIMIT = 160;

async function fetchText(url) {
  const res = await fetch(url, { headers: { 'user-agent': 'alkemos-seo-audit/1.0' } });
  if (!res.ok) throw new Error(`${res.status} ${url}`);
  return res.text();
}

function extractUrls(xml) {
  const out = [];
  const re = /<loc>([^<]+)<\/loc>/g;
  let m;
  while ((m = re.exec(xml))) out.push(m[1]);
  return out;
}

function extractDescription(html) {
  const m = html.match(/<meta name="description" content="([^"]*)"/);
  return m ? m[1] : null;
}

const sitemaps = [
  `${BASE}/sitemap-pages.xml`,
  `${BASE}/sitemap-comparisons.xml`,
];

const urls = [];
for (const s of sitemaps) {
  try { urls.push(...extractUrls(await fetchText(s))); } catch (e) { console.error('SITEMAP FAIL', e.message); }
}
console.log(`pages from sitemaps: ${urls.length}`);

const results = [];
let done = 0;
const CONC = 12;
const queue = [...urls];
async function worker() {
  while (queue.length) {
    const url = queue.shift();
    try {
      const html = await fetchText(url);
      const desc = extractDescription(html);
      results.push({ url, len: desc ? desc.length : -1, desc });
    } catch (e) {
      results.push({ url, len: -2, desc: null });
    }
    done++;
    if (done % 40 === 0) console.error(`  … ${done}/${urls.length}`);
  }
}
await Promise.all(Array.from({ length: CONC }, worker));

results.sort((a, b) => b.len - a.len);
const over = results.filter(r => r.len > LIMIT);
const missing = results.filter(r => r.len < 0);

console.log(`\n=== fetched: ${results.length} · over ${LIMIT}: ${over.length} · missing/err: ${missing.length} ===\n`);
for (const r of over) {
  const u = r.url.replace(BASE, '');
  console.log(`${String(r.len).padStart(4)}  ${u}`);
  console.log(`      ${JSON.stringify(r.desc.slice(0, 220))}${r.desc.length > 220 ? '…' : ''}`);
}
if (missing.length) {
  console.log(`\n=== missing/fetch errors ===`);
  for (const r of missing) console.log(`  ${r.len}  ${r.url}`);
}
// distribution
const lens = results.filter(r => r.len >= 0).map(r => r.len);
lens.sort((a, b) => a - b);
if (lens.length) {
  console.log(`\nmin=${lens[0]} median=${lens[Math.floor(lens.length / 2)]} max=${lens[lens.length - 1]}`);
}
