/**
 * PHASE 216 (P2-4) — measure the ACTUAL JS transfer + execution on the
 * homepages (distinguishes executed scripts from prefetched route
 * chunks — the raw HTML reference count overstates the critical path).
 */
import { chromium } from "playwright";

const port = process.argv[2] || "3100";
const browser = await chromium.launch();

for (const path of ["/", "/ar"]) {
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
    deviceScaleFactor: 2,
  });
  const page = await context.newPage();
  const js = [];
  let loadedAt = 0;
  page.on("response", async (res) => {
    const url = res.url();
    if (url.endsWith(".js") && url.includes("/_next/static/")) {
      try {
        const body = await res.body();
        js.push({ url, size: body.length, t: loadedAt ? "post-load" : "critical" });
      } catch {
        js.push({ url, size: 0, t: loadedAt ? "post-load" : "critical" });
      }
    }
  });
  await page.goto(`http://localhost:${port}${path}`, { waitUntil: "load" });
  loadedAt = 1;
  await page.waitForTimeout(3000);
  const crit = js.filter((j) => j.t === "critical");
  const post = js.filter((j) => j.t === "post-load");
  const tot = (arr) => arr.reduce((a, b) => a + b.size, 0);
  console.log(`\n=== ${path} — CRITICAL (at load): ${crit.length} files, ${(tot(crit) / 1024).toFixed(0)}KB ===`);
  for (const j of crit.sort((a, b) => b.size - a.size).slice(0, 14)) {
    console.log(`  ${(j.size / 1024).toFixed(1)}KB  ${j.url.split("/").pop()}`);
  }
  console.log(`--- post-load (idle/lazy): ${post.length} files, ${(tot(post) / 1024).toFixed(0)}KB ---`);
  for (const j of post.sort((a, b) => b.size - a.size).slice(0, 8)) {
    console.log(`  ${(j.size / 1024).toFixed(1)}KB  ${j.url.split("/").pop()}`);
  }
  await context.close();
}
await browser.close();
