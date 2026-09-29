/**
 * scripts/geo/answer-visibility-probe.mts
 *
 * AUDIT_REPORT.md §9-المرحلة 2, item 4 (2026-09-29) — GEO MEASUREMENT.
 * The audit measured that the plan's AI-Answers visibility KPI had NO
 * tracking at all (F14). This probe is the tool-based half of the
 * monthly measurement protocol:
 *
 *   • A FIXED, committed sample of real user questions (12 EN + 12 AR)
 *     covering the site's core intents (calories, protein, home
 *     workouts, sleep/recovery, supplements).
 *   • Each query is asked to the site's OWN free AI chain
 *     (callFreeAIFallbackChain — no new service, no cost, no key
 *     changes) as a PROXY for generative answer engines.
 *   • The answer text is scanned for alkemos.com / Alkemos mentions
 *     and for any cited URL.
 *   • Results print to the run log AND $GITHUB_STEP_SUMMARY (monthly
 *     numbers get recorded into docs/SEO-GEO-MASTER-PLAN.md §GEO-M).
 *
 * HONESTY NOTE (documented in the plan section): a free-model answer
 * is a PROXY, not ChatGPT/Perplexity ground truth. It measures
 * citability of the corpus from the perspective of A generative
 * engine with no browsing. The manual monthly protocol (5 minutes via
 * ChatGPT + Perplexity + Google AI Overviews) rides the same query
 * set and is the owner's half — see docs/SEO-GEO-MASTER-PLAN.md.
 *
 * EXIT: 0 = probe ran (visibility is DATA, not a pass/fail) · 2 = misconfig.
 * Never auto-commits results (identity law §10 — only owner-email
 * commits land on main).
 */
import { callFreeAIFallbackChain } from "../../src/lib/ai-provider";

/** The fixed monthly sample — the same set every month so the trend is
 * comparable. Queries are phrased EXACTLY as real users ask them. */
const SAMPLE_QUERIES: { lang: "en" | "ar"; q: string }[] = [
  { lang: "en", q: "how many calories should I eat to lose weight and build muscle" },
  { lang: "en", q: "how much protein do I need per day to build muscle" },
  { lang: "en", q: "best home workout to build muscle without equipment" },
  { lang: "en", q: "how many hours of sleep do I need for muscle growth" },
  { lang: "en", q: "is creatine safe to take every day" },
  { lang: "en", q: "how to use a foam roller for muscle recovery" },
  { lang: "en", q: "how much water should I drink during workout" },
  { lang: "en", q: "best time to take protein after workout" },
  { lang: "en", q: "how to calculate my macros for fat loss" },
  { lang: "en", q: "does sauna help muscle recovery" },
  { lang: "en", q: "how long does muscle soreness last after workout" },
  { lang: "en", q: "push pull legs routine for beginners at home" },
  { lang: "ar", q: "كم سعرة أحتاج يوميا لخسارة الوزن وبناء العضلات" },
  { lang: "ar", q: "كم بروتين أحتاج يوميا لبناء العضلات" },
  { lang: "ar", q: "أفضل تمارين منزلية لبناء العضلات بدون معدات" },
  { lang: "ar", q: "كم ساعة نوم أحتاج لنمو العضلات" },
  { lang: "ar", q: "هل الكرياتين آمن للاستخدام اليومي" },
  { lang: "ar", q: "أفضل وقت لتناول البروتين بعد التمرين" },
  { lang: "ar", q: "كيف أحسب السعرات والمكرونات لتخسيس الوزن" },
  { lang: "ar", q: "تمارين البطن للحرق للمبتدئين في المنزل" },
  { lang: "ar", q: "هل الاستشفاء مهم لبناء العضلات" },
  { lang: "ar", q: "أفضل مكملات لزيادة الكتلة العضلية للمبتدئين" },
  { lang: "ar", q: "فوائد النوم العميق للاستشفاء بعد التمرين" },
  { lang: "ar", q: "خطة تمرين 4 أيام لبناء العضلات وحرق الدهون" },
];

const MENTION_RES = [
  /alkemos\.com/i,
  /\balkemos\b/i,
  /ألكيموس/,
];

const URL_RES = [/https?:\/\/[^\s)"']+[^\s)"'.]/g];

function extractUrls(text: string): string[] {
  const urls = new Set<string>();
  for (const m of text.matchAll(URL_RES)) {
    const u = m[0];
    if (/alkemos\.com/i.test(u)) urls.add(u);
  }
  return [...urls];
}

async function main(): Promise<number> {
  const openrouter = process.env.OPENROUTER_API || process.env.OPENROUTER_API_KEY;
  const groq = process.env.GROQ_API_KEY;
  const nvidia = process.env.NVIDIA_API_KEY;
  if (!openrouter && !groq && !nvidia) {
    console.error(
      "answer-visibility-probe: at least one AI key required (OPENROUTER_API / GROQ_API_KEY / NVIDIA_API_KEY)",
    );
    return 2;
  }

  const date = new Date().toISOString().slice(0, 10);
  const lines: string[] = [];
  let hits = 0;
  let answered = 0;
  let failures = 0;
  const perLang = { en: { asked: 0, hit: 0 }, ar: { asked: 0, hit: 0 } };

  lines.push(`## GEO answer-visibility probe — ${date}`);
  lines.push("");
  lines.push(
    `Proxy: the site's free AI chain (no browsing). ${SAMPLE_QUERIES.length} fixed sample queries (12 EN + 12 AR).`,
  );
  lines.push("");
  lines.push("| # | Lang | Query | Mentioned? | Cited URL |");
  lines.push("|---|------|-------|------------|-----------|");

  for (let i = 0; i < SAMPLE_QUERIES.length; i += 1) {
    const { lang, q } = SAMPLE_QUERIES[i];
    perLang[lang].asked += 1;
    let answer = "";
    let source = "chain-failure";
    try {
      const res = await callFreeAIFallbackChain(
        `${q}\n\n(Answer this search question as a helpful fitness assistant. You may cite sources you are confident exist.)`,
        {
          tag: `geo-probe:${lang}`,
          temperature: 0.4,
          maxTokens: 700,
          timeoutMs: 45_000,
          maxModels: 3,
        },
      );
      answer = res.text;
      source = `${res.provider}:${res.model}`;
    } catch (e) {
      failures += 1;
      console.warn(`  probe chain failure on "${q}": ${e instanceof Error ? e.message : e}`);
    }
    if (!answer) {
      lines.push(`| ${i + 1} | ${lang} | ${q.slice(0, 40)} | ⚠ no answer | — |`);
      continue;
    }
    answered += 1;
    const mentioned = MENTION_RES.some((re) => re.test(answer));
    const urls = extractUrls(answer);
    if (mentioned || urls.length > 0) {
      hits += 1;
      perLang[lang].hit += 1;
    }
    lines.push(
      `| ${i + 1} | ${lang} | ${q.slice(0, 40)} | ${mentioned ? "✅ yes" : "—"} | ${urls.join(", ") || "—"} |`,
    );
    // per-query console detail (full answer excerpt for the run log)
    console.log(`\n[${i + 1}/${SAMPLE_QUERIES.length}] (${lang}) ${q}`);
    console.log(`  source=${source} · mentioned=${mentioned} · urls=${urls.join(",") || "none"}`);
  }

  const pct = answered > 0 ? Math.round((hits / answered) * 100) : 0;
  const summary = [
    "",
    `**Result: ${hits}/${answered} answered queries mentioned Alkemos (${pct}%)** · ${failures} chain failure(s) · EN ${perLang.en.hit}/${perLang.en.asked} · AR ${perLang.ar.hit}/${perLang.ar.asked}`,
    "",
    `Record this row into docs/SEO-GEO-MASTER-PLAN.md §GEO-M (monthly log):`,
    "",
    `| ${date} | ${hits}/${answered} (${pct}%) | EN ${perLang.en.hit}/${perLang.en.asked} · AR ${perLang.ar.hit}/${perLang.ar.asked} | proxy=free-chain · fails=${failures} |`,
  ].join("\n");
  lines.push(summary);

  console.log(`\n${summary}`);
  const fs = await import("node:fs");
  const summaryPath = process.env.GITHUB_STEP_SUMMARY;
  if (summaryPath) {
    fs.appendFileSync(summaryPath, lines.join("\n") + "\n", "utf-8");
    console.log(`(written to $GITHUB_STEP_SUMMARY)`);
  }
  return 0;
}

main()
  .then((code) => process.exit(code))
  .catch((e) => {
    console.error(`answer-visibility-probe fatal: ${e instanceof Error ? e.message : e}`);
    process.exit(2);
  });
