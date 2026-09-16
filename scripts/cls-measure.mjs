/**
 * PHASE 216 (P2-5) — lab CLS measurement for the two homepages
 * (EN `/` + AR `/ar`) at mobile 390×844, with per-shift attribution
 * so the fix targets the real source instead of a guess.
 *
 * Usage: node scripts/cls-measure.mjs <port>
 */
import { chromium } from "playwright";

const port = process.argv[2] || "3100";
const BASE = port === "prod" ? "https://alkemos.com" : `http://localhost:${port}`;

const browser = await chromium.launch();
const results = [];

for (const path of ["/", "/ar"]) {
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
    userAgent:
      "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1",
  });
  const page = await context.newPage();

  await page.addInitScript(() => {
    window.__cls = 0;
    window.__shifts = [];
    const po = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (!entry.hadRecentInput) {
          window.__cls += entry.value;
          const src = entry.sources?.[0]?.node;
          window.__shifts.push({
            value: +entry.value.toFixed(4),
            time: Math.round(entry.startTime),
            node: src
              ? `${src.nodeName}${src.id ? "#" + src.id : ""}.${(src.className && String(src.className).split(" ")[0]) || ""}`
              : "(unattributed)",
          });
        }
      }
    });
    po.observe({ type: "layout-shift", buffered: true });
  });

  await context.route("**/*", (route) =>
    new Promise((res) => setTimeout(() => res(route.continue()), 40)),
  );
  const cdp = await context.newCDPSession(page);
  await cdp.send("Network.emulateNetworkConditions", {
    downloadThroughput: Math.floor((1.6 * 1024 * 1024) / 8), // slow 3g-ish
    uploadThroughput: Math.floor((750 * 1024) / 8),
    latency: 300,
    offline: false,
  });
  await cdp.send("Emulation.setCPUThrottlingRate", { rate: process.env.CPU_RATE ? Number(process.env.CPU_RATE) : 4 });
  await page.goto(BASE + path + "?cls=216b", { waitUntil: "load" });
  // let late shifts (fonts/lazy content) settle
  await page.waitForTimeout(2500);

  const data = await page.evaluate(() => ({
    cls: +window.__cls.toFixed(4),
    shifts: window.__shifts,
  }));
  results.push({ path, ...data });
  await context.close();
}

await browser.close();

for (const r of results) {
  console.log(`\n=== ${r.path} — CLS ${r.cls} ===`);
  for (const s of r.shifts
    .slice()
    .sort((a, b) => b.value - a.value)
    .slice(0, 8)) {
    console.log(
      `  ${String(s.time).padStart(6)}ms  ${s.value.toFixed(4)}  ${s.node}`,
    );
  }
}
