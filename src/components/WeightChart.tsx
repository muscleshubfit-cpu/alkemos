"use client";

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

/**
 * WeightChart — the ONE weight AreaChart (Phase 247 dedup: ClientWeightChart
 * was a byte-for-byte twin differing only in colors; both are now variants
 * of this file).
 *
 * Kept in its own file so recharts (~600KB) stays code-split out of the
 * main bundle — the two lazy `dynamic()` importers (ProgressView member
 * chart + CoachClientView client chart) only fetch it when rendered.
 */
export function WeightChart({
  data,
  variant = "member",
  lang = "ar",
}: {
  data: Array<{ date: string; weight: number }>;
  /** member = the app chrome law (#0071e3) · client = the staff view's softer slate. */
  variant?: "member" | "client";
  /** STAGE-253: localizes the tooltip series name (default ar — the core-audience law). */
  lang?: "ar" | "en";
}) {
  const stroke = variant === "client" ? "#1F8FFF" : "#0071e3";
  const grid = variant === "client" ? "#E2E8F0" : "#d2d2d7";
  const tick = variant === "client" ? "#475569" : "#6e6e73";
  const gradientId = variant === "client" ? "clientWeightGradient" : "weightGradient";
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={stroke} stopOpacity={variant === "client" ? 0.5 : 0.3} />
            <stop offset="100%" stopColor={stroke} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke={grid} />
        <XAxis dataKey="date" tick={{ fontSize: 12, fill: tick }} />
        <YAxis tick={{ fontSize: 12, fill: tick }} domain={["auto", "auto"]} />
        <Tooltip
          contentStyle={
            variant === "client"
              ? undefined
              : {
                  borderRadius: 12,
                  border: "1px solid #d2d2d7",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                }
          }
        />
        <Area
          type="monotone"
          dataKey="weight"
          name={lang === "ar" ? "الوزن" : "Weight"}
          stroke={stroke}
          strokeWidth={2.5}
          fill={`url(#${gradientId})`}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
