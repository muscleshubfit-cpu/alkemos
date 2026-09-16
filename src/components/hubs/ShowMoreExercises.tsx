"use client";

import { useState } from "react";
import Link from "next/link";
import type { HubExerciseCard } from "@/components/hubs/hub-exercises-shared";

/**
 * PHASE 216 (P2-3 — deep-audit confirmed-9): the equipment/muscles hub
 * pages rendered EVERY exercise card server-side (348 cards on
 * /equipment/bodyweight = 550KB served HTML + a ~330KB RSC payload —
 * the heaviest pages on the site). The hub now server-renders only the
 * first HUB_INITIAL_EXERCISES cards (the constant lives in the
 * server-safe hub-exercises-shared module — importing a plain value
 * from this "use client" file into a server component yields the
 * client-reference proxy, the classic RSC gotcha) and hands the REST to
 * this client island as a compact projection (localized strings
 * pre-resolved on the server — no label maps ship with it). One click
 * reveals the remaining cards — every exercise stays reachable (the
 * acceptance law: "no loss of internal links"), the ItemList schema
 * keeps its top-50 slice, and the served page drops to a fraction of
 * the size.
 */

export function ShowMoreExercises({
  cards,
  lang,
}: {
  cards: HubExerciseCard[];
  lang: "en" | "ar";
}) {
  const [expanded, setExpanded] = useState(false);

  if (cards.length === 0) return null;

  if (!expanded) {
    return (
      <li className="sm:col-span-2 lg:col-span-3">
        <button
          type="button"
          onClick={() => setExpanded(true)}
          className="w-full p-4 rounded-lg border border-border bg-card hover:border-primary transition-colors text-sm font-medium text-muted-foreground"
        >
          {lang === "ar"
            ? `عرض ${cards.length} تمرينًا آخرًا`
            : `Show ${cards.length} more exercises`}
        </button>
      </li>
    );
  }

  return (
    <>
      {cards.map((c) => (
        <li key={c.href}>
          <Link
            href={c.href}
            className="block p-4 rounded-lg border border-border bg-card hover:border-primary transition-colors"
          >
            <div className="font-semibold text-foreground">{c.name}</div>
            <div className="mt-2 flex flex-wrap gap-2 text-xs">
              <span className="px-2 py-0.5 rounded bg-muted text-muted-foreground">
                {c.chip}
              </span>
              <span
                className="px-2 py-0.5 rounded text-white"
                style={{ background: c.levelColor }}
              >
                {c.levelLabel}
              </span>
            </div>
            <div className="mt-2 text-xs text-muted-foreground">
              {lang === "ar" ? `العضلات الأساسية: ${c.muscles}` : `Primary: ${c.muscles}`}
            </div>
          </Link>
        </li>
      ))}
    </>
  );
}
