"use client";

import { useCallback, useEffect, useState } from "react";
import { useI18n } from "@/lib/i18n";
import { toast } from "sonner";
import { Loader2, RefreshCw, MessageCircle, Zap, Timer, ThumbsUp, ThumbsDown, Brain } from "lucide-react";

/**
 * AdminEvoAnalyticsView — EVO-5 (W5.8) «لوحة تحليلات Evo للأدمن».
 *
 * One page, seven honest sections (all read-only, 30-day window):
 *   1. KPI cards — dispatches · cache hit rate · avg latency · 👍/👎
 *   2. Provider table — calls · success % · avg latency (cache + local included)
 *   3. Intent distribution — general / plan_nutrition / plan_workout / swap
 *   4. Quota consumption — the tamper-proof evo_chat_usage ledger by source
 *   5. Daily volume — last 30 days bar list
 *   6. Top cached questions — by hits (normalized text)
 *   7. Eval quality — latest weekly run: avg score + per-question rows
 *
 * Data: GET /api/admin/evo-analytics (requireAdmin + service-role — the
 * 0081 tables have zero client policies, so the browser never reads them
 * directly; the route is the only reader).
 */

type AnalyticsPayload = {
  window_days: number;
  calls: {
    total: number;
    cacheHits: number;
    cacheHitRate: number;
    localFallbacks: number;
    avgLatencyMs: number | null;
  };
  providers: Array<{ provider: string; calls: number; successRate: number; avgLatencyMs: number | null }>;
  intents: Array<{ intent: string; count: number }>;
  daily: Array<{ day: string; count: number }>;
  quota: Array<{ source: string; count: number }>;
  feedback: { up: number; down: number; total: number };
  cache: { top: Array<{ question_norm: string; language: string; hits: number }> };
  eval: {
    runAt: string | null;
    avgScore: number;
    count: number;
    safetyFailures: number;
    languageMismatches: number;
    rows: Array<{
      question_id: string;
      language: string;
      provider: string | null;
      model: string | null;
      score: number;
      safety_pass: boolean;
      language_match: boolean;
      notes: string | null;
    }>;
  };
};

const PROVIDER_LABELS: Record<string, { ar: string; en: string }> = {
  openrouter: { ar: "OpenRouter", en: "OpenRouter" },
  groq: { ar: "Groq", en: "Groq" },
  nvidia: { ar: "NVIDIA", en: "NVIDIA" },
  cache: { ar: "الكاش", en: "Cache" },
  local: { ar: "الرد المحلي (احتياط)", en: "Local fallback" },
};

const INTENT_LABELS: Record<string, { ar: string; en: string }> = {
  general: { ar: "أسئلة عامة", en: "General Q&A" },
  plan_nutrition: { ar: "نية خطة غذائية", en: "Nutrition plan intent" },
  plan_workout: { ar: "نية برنامج تمارين", en: "Workout plan intent" },
  swap: { ar: "استبدال", en: "Swap" },
};

const QUOTA_LABELS: Record<string, { ar: string; en: string }> = {
  chat: { ar: "رسائل شات", en: "Chat messages" },
  plan_nutrition: { ar: "خطط تغذية", en: "Nutrition plans" },
  plan_workout: { ar: "برامج تمارين", en: "Workout plans" },
};

function Card({
  label,
  value,
  sub,
  icon,
  color,
}: {
  label: string;
  value: string;
  sub?: string;
  icon: React.ReactNode;
  color: string;
}) {
  return (
    <div className="rounded-2xl border border-[#e8e8ed] bg-white p-4">
      <div className="flex items-center gap-2">
        <span className="grid h-8 w-8 place-items-center rounded-full" style={{ backgroundColor: `${color}1a`, color }}>
          {icon}
        </span>
        <span className="text-xs font-medium text-[#6e6e73]">{label}</span>
      </div>
      <p className="mt-2 text-2xl font-bold text-[#1d1d1f]">{value}</p>
      {sub && <p className="mt-0.5 text-[11px] text-[#6e6e73]">{sub}</p>}
    </div>
  );
}

export function AdminEvoAnalyticsView() {
  const { lang } = useI18n();
  const isAr = lang === "ar";
  const [data, setData] = useState<AnalyticsPayload | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/evo-analytics");
      if (!res.ok) throw new Error(String(res.status));
      setData((await res.json()) as AnalyticsPayload);
    } catch {
      toast.error(isAr ? "تعذر تحميل التحليلات" : "Failed to load analytics");
    } finally {
      setLoading(false);
    }
  }, [isAr]);

  useEffect(() => {
    load();
  }, [load]);

  const label = (m: { ar: string; en: string }) => (isAr ? m.ar : m.en);

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-[#1d1d1f]">
            {isAr ? "تحليلات EVO" : "EVO Analytics"}
          </h1>
          <p className="mt-0.5 text-xs text-[#6e6e73]">
            {isAr
              ? "قرارات التكلفة والجودة ببيانات — نافذة آخر 30 يومًا"
              : "Cost & quality decisions backed by data — 30-day window"}
          </p>
        </div>
        <button
          onClick={load}
          disabled={loading}
          className="btn-chrome inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs"
        >
          {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
          {isAr ? "تحديث" : "Refresh"}
        </button>
      </div>

      {loading && !data ? (
        <div className="grid place-items-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-[#6e6e73]" />
        </div>
      ) : !data ? (
        <p className="py-10 text-center text-sm text-[#6e6e73]">
          {isAr ? "لا بيانات بعد." : "No data yet."}
        </p>
      ) : (
        <div className="space-y-8">
          {/* 1. KPI cards */}
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            <Card
              label={isAr ? "نداءات EVO" : "EVO dispatches"}
              value={String(data.calls.total)}
              icon={<MessageCircle className="h-4 w-4" />}
              color="#0071e3"
            />
            <Card
              label={isAr ? "نسبة إصابة الكاش" : "Cache hit rate"}
              value={`${data.calls.cacheHitRate}%`}
              sub={isAr ? `${data.calls.cacheHits} رد من الكاش` : `${data.calls.cacheHits} served from cache`}
              icon={<Zap className="h-4 w-4" />}
              color="#34c759"
            />
            <Card
              label={isAr ? "متوسط زمن الرد" : "Avg latency"}
              value={data.calls.avgLatencyMs != null ? `${data.calls.avgLatencyMs}ms` : "—"}
              icon={<Timer className="h-4 w-4" />}
              color="#ff9500"
            />
            <Card
              label={isAr ? "التقييمات 👍/👎" : "Ratings 👍/👎"}
              value={`${data.feedback.up}/${data.feedback.down}`}
              icon={
                <span className="flex items-center gap-0.5">
                  <ThumbsUp className="h-3 w-3" />
                  <ThumbsDown className="h-3 w-3" />
                </span>
              }
              color="#af52de"
            />
          </div>

          {/* 2. Providers */}
          <section>
            <h2 className="mb-2 text-sm font-bold text-[#1d1d1f]">
              {isAr ? "المزودون" : "Providers"}
            </h2>
            {data.providers.length === 0 ? (
              <p className="text-xs text-[#6e6e73]">{isAr ? "لا نداءات بعد." : "No dispatches yet."}</p>
            ) : (
              <div className="overflow-hidden rounded-2xl border border-[#e8e8ed]">
                <table className="w-full text-start text-xs">
                  <thead className="bg-[#f5f5f7] text-[#6e6e73]">
                    <tr>
                      <th className="p-2.5 text-start font-medium">{isAr ? "المزود" : "Provider"}</th>
                      <th className="p-2.5 text-start font-medium">{isAr ? "النداءات" : "Calls"}</th>
                      <th className="p-2.5 text-start font-medium">{isAr ? "نجاح" : "Success"}</th>
                      <th className="p-2.5 text-start font-medium">{isAr ? "زمن" : "Latency"}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.providers.map((p) => (
                      <tr key={p.provider} className="border-t border-[#f2f2f7]">
                        <td className="p-2.5 font-medium text-[#1d1d1f]">
                          {label(PROVIDER_LABELS[p.provider] ?? { ar: p.provider, en: p.provider })}
                        </td>
                        <td className="p-2.5 text-[#6e6e73]">{p.calls}</td>
                        <td className="p-2.5 text-[#6e6e73]">{p.successRate}%</td>
                        <td className="p-2.5 text-[#6e6e73]">
                          {p.avgLatencyMs != null ? `${p.avgLatencyMs}ms` : "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          {/* 3. Intents */}
          <section>
            <h2 className="mb-2 text-sm font-bold text-[#1d1d1f]">
              {isAr ? "توزيع النوايا" : "Intent distribution"}
            </h2>
            {data.intents.length === 0 ? (
              <p className="text-xs text-[#6e6e73]">{isAr ? "لا نداءات بعد." : "No dispatches yet."}</p>
            ) : (
              <div className="space-y-2">
                {data.intents.map((i) => {
                  const pct = data.calls.total > 0 ? Math.round((i.count / data.calls.total) * 100) : 0;
                  return (
                    <div key={i.intent} className="flex items-center gap-3">
                      <span className="w-40 shrink-0 text-xs text-[#1d1d1f]">
                        {label(INTENT_LABELS[i.intent] ?? { ar: i.intent, en: i.intent })}
                      </span>
                      <div className="h-2 flex-1 overflow-hidden rounded-full bg-[#f2f2f7]">
                        <div className="h-full rounded-full bg-[#0071e3]" style={{ width: `${pct}%` }} />
                      </div>
                      <span className="w-16 shrink-0 text-end text-xs text-[#6e6e73]">
                        {i.count} ({pct}%)
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {/* 4. Quota consumption */}
          <section>
            <h2 className="mb-2 text-sm font-bold text-[#1d1d1f]">
              {isAr ? "استهلاك الحصص (السجل المضاد للعبث)" : "Quota consumption (tamper-proof ledger)"}
            </h2>
            {data.quota.length === 0 ? (
              <p className="text-xs text-[#6e6e73]">{isAr ? "لا استهلاك بعد." : "No usage yet."}</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {data.quota.map((q) => (
                  <span
                    key={q.source}
                    className="rounded-full bg-[#f5f5f7] px-3 py-1 text-xs font-medium text-[#1d1d1f]"
                  >
                    {label(QUOTA_LABELS[q.source] ?? { ar: q.source, en: q.source })}: {q.count}
                  </span>
                ))}
              </div>
            )}
          </section>

          {/* 5. Daily volume */}
          <section>
            <h2 className="mb-2 text-sm font-bold text-[#1d1d1f]">
              {isAr ? "الحجم اليومي (آخر 30 يومًا)" : "Daily volume (last 30 days)"}
            </h2>
            {data.daily.length === 0 ? (
              <p className="text-xs text-[#6e6e73]">{isAr ? "لا نداءات بعد." : "No dispatches yet."}</p>
            ) : (
              <div className="flex h-24 items-end gap-1">
                {data.daily.map((d) => {
                  const max = Math.max(...data.daily.map((x) => x.count), 1);
                  return (
                    <div
                      key={d.day}
                      title={`${d.day}: ${d.count}`}
                      className="flex-1 rounded-t bg-[#0071e3]/80"
                      style={{ height: `${Math.max((d.count / max) * 100, 4)}%` }}
                    />
                  );
                })}
              </div>
            )}
          </section>

          {/* 6. Top cached questions */}
          <section>
            <h2 className="mb-2 text-sm font-bold text-[#1d1d1f]">
              {isAr ? "أكثر الأسئلة تكرارًا (الكاش)" : "Top cached questions"}
            </h2>
            {data.cache.top.length === 0 ? (
              <p className="text-xs text-[#6e6e73]">
                {isAr ? "الكاش فاضي بعد — بيتعبأ تلقائيًا من الأسئلة الشائعة." : "Cache is empty — it fills automatically from repeat questions."}
              </p>
            ) : (
              <ul className="divide-y divide-[#f2f2f7] overflow-hidden rounded-2xl border border-[#e8e8ed]">
                {data.cache.top.map((c) => (
                  <li key={`${c.language}-${c.question_norm}`} className="flex items-center gap-3 p-2.5">
                    <span className="flex-1 truncate text-xs text-[#1d1d1f]" dir="auto">
                      {c.question_norm}
                    </span>
                    <span className="shrink-0 rounded-full bg-[#f5f5f7] px-2 py-0.5 text-[10px] uppercase text-[#6e6e73]">
                      {c.language}
                    </span>
                    <span className="shrink-0 text-xs font-medium text-[#34c759]">×{c.hits}</span>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {/* 7. Eval quality */}
          <section>
            <h2 className="mb-2 flex items-center gap-1.5 text-sm font-bold text-[#1d1d1f]">
              <Brain className="h-4 w-4 text-[#af52de]" />
              {isAr ? "مقياس الجودة الأسبوعي" : "Weekly eval harness"}
            </h2>
            {!data.eval.runAt ? (
              <p className="text-xs text-[#6e6e73]">
                {isAr
                  ? "لم تعمل دورة تقييم بعد — تُشغّل أسبوعيًا (evo-weekly-eval) أو يدويًا من GitHub Actions."
                  : "No eval run yet — runs weekly (evo-weekly-eval) or manually from GitHub Actions."}
              </p>
            ) : (
              <div>
                <p className="mb-2 text-xs text-[#6e6e73]">
                  {isAr ? "آخر دورة" : "Latest run"}: {new Date(data.eval.runAt).toLocaleString(isAr ? "ar-EG" : "en-GB")} ·{" "}
                  <span className="font-bold text-[#1d1d1f]">
                    {isAr ? "متوسط" : "avg"} {data.eval.avgScore}/10
                  </span>
                  {data.eval.safetyFailures > 0 && (
                    <span className="ms-2 font-medium text-[#ff3b30]">
                      {isAr ? `دروع سلامة: ${data.eval.safetyFailures}` : `safety fails: ${data.eval.safetyFailures}`}
                    </span>
                  )}
                </p>
                <div className="overflow-hidden rounded-2xl border border-[#e8e8ed]">
                  <table className="w-full text-start text-xs">
                    <thead className="bg-[#f5f5f7] text-[#6e6e73]">
                      <tr>
                        <th className="p-2.5 text-start font-medium">{isAr ? "السؤال" : "Question"}</th>
                        <th className="p-2.5 text-start font-medium">{isAr ? "اللغة" : "Lang"}</th>
                        <th className="p-2.5 text-start font-medium">{isAr ? "الدرجة" : "Score"}</th>
                        <th className="p-2.5 text-start font-medium">{isAr ? "سلامة" : "Safety"}</th>
                        <th className="p-2.5 text-start font-medium">{isAr ? "ملاحظة" : "Notes"}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.eval.rows.map((r) => (
                        <tr key={r.question_id} className="border-t border-[#f2f2f7]">
                          <td className="p-2.5 font-medium text-[#1d1d1f]">{r.question_id}</td>
                          <td className="p-2.5 uppercase text-[#6e6e73]">{r.language}</td>
                          <td className={`p-2.5 font-bold ${r.score >= 7 ? "text-[#34c759]" : r.score >= 4 ? "text-[#ff9500]" : "text-[#ff3b30]"}`}>
                            {r.score}
                          </td>
                          <td className="p-2.5">{r.safety_pass ? "✓" : <span className="font-bold text-[#ff3b30]">✗</span>}</td>
                          <td className="p-2.5 text-[#6e6e73]">{r.notes || "—"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  );
}
