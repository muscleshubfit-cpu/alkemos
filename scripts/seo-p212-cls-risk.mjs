#!/usr/bin/env node
/**
 * P2-12 CLS-risk probe: block ALL image requests, load the page, and check
 * every <img> WITHOUT width+height attributes: does it occupy nonzero space
 * BEFORE any image loads? (zero box => space is NOT reserved => CLS risk).
 *
 * Usage: node scripts/seo-p212-cls-risk.mjs [port|prod] [path ...]
 */
import { chromium } from "playwright";

const arg0 = process.argv[2] || "prod";
const BASE = arg0 === "prod" ? "https://alkemos.com" : `http://localhost:${arg0}`;
const paths = process.argv.slice(3).length
  ? process.argv.slice(3)
  : [
      "/",
      "/ar",
      "/exercises",
      "/ar/exercises",
      "/blog",
      "/blog/category/workout",
      "/foods",
      "/ar/foods",
      "/tools",
      "/memberships",
      "/programs",
      "/programs/gym-ppl-intermediate",
      "/ar/programs/gym-ppl-intermediate",
      "/exercises/34-sit-up",
      "/foods/chicken-breast",
      "/guides/macro-tracking-accuracy",
      "/compare/alkemos-vs-cronometer",
    ];

const browser = await chromium.launch();
let grandTotal = 0,
  grandRisk = 0;

for (const path of paths) {
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
    userAgent:
      "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1",
  });
  // Block every image request — we measure PRE-LOAD layout only.
  await context.route(/(images\.pexels\.com|\/images\/|\/_next\/image|\.webp|\.jpg|\.jpeg|\.png|\.svg|\.gif)/i, (route) => route.abort());

  const page = await context.newPage();
  try {
    await page.goto(BASE + path, { waitUntil: "domcontentloaded", timeout: 45000 });
    await page.waitForTimeout(600); // let CSS apply

    const rows = await page.evaluate(() => {
      const out = [];
      for (const img of document.querySelectorAll("img")) {
        const w = img.getAttribute("width");
        const h = img.getAttribute("height");
        const hasWH = w != null && h != null && !isNaN(+w) && !isNaN(+h);
        if (hasWH) continue;
        const r = img.getBoundingClientRect();
        const style = getComputedStyle(img);
        out.push({
          src: (img.currentSrc || img.src || "").slice(0, 110),
          missing: true,
          w: Math.round(r.width),
          h: Math.round(r.height),
          pos: style.position,
          display: style.display,
          vis: style.visibility,
          ar: style.aspectRatio,
        });
      }
      return out;
    });

    const missing = rows.length;
    // risk = renders in-flow with zero height box (no reservation) while visible
    const risk = rows.filter(
      (r) => r.h === 0 && r.display !== "none" && r.vis !== "hidden",
    );
    grandTotal += missing;
    grandRisk += risk.length;

    console.log(`\n${path}  missingWH:${missing}  zeroBoxRisk:${risk.length}`);
    for (const r of rows.slice(0, 6)) {
      const flag = r.h === 0 ? "⚠️ZERO" : "ok";
      console.log(`   ${flag} box=${r.w}x${r.h} pos=${r.pos} ar=${r.ar}  ${r.src}`);
    }
    for (const r of risk.slice(0, 10)) {
      console.log(`   ⚠️  RISK box=${r.w}x${r.h}  ${r.src}`);
    }
  } catch (e) {
    console.log(`\n${path}  FAIL: ${e.message.slice(0, 120)}`);
  }
  await context.close();
}

await browser.close();
console.log(`\n=== TOTAL missingWH:${grandTotal}  zeroBoxRisk:${grandRisk} ===`);
