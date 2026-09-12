/**
 * EVO coach-behavior helpers — pure, client-safe, unit-tested.
 *
 * EVO-3 (docs/EVO-MASTER-PLAN.md §4 W2 — «سلوك المدرب الحقيقي»):
 *   W2.1 FIRST-MEETING INTERVIEW — when a subscriber asks for a plan but
 *        never filled the matching questionnaire, EVO interviews like a
 *        real coach (3-4 short questions) instead of generating from
 *        nothing or refusing dryly.
 *   W2.2 REAL PROGRESS READING — the subscriber's last weight/waist
 *        measurements become a compact prompt block with a computed
 *        delta, so recommendations change with the actual numbers
 *        («نزلت 1.5كغ هذا الشهر — نثبت الكالوري»).
 *   W2.4 CONTEXT CAP BY TIER — paid subscribers get a larger chat
 *        history window (16 vs 10 messages) — the owner-approved cost
 *        trade-off in the master plan.
 *
 * Everything here is deterministic string/number shaping — no IO, no
 * provider calls (3-provider law untouched), safe to import anywhere.
 */

import type { EvoPlanDomain } from "@/lib/evo-intent";

/* ------------------------------------------------------------------ */
/*  W2.4 — history cap by tier                                         */
/* ------------------------------------------------------------------ */

/** Free-tier / anonymous window (unchanged since the streaming era). */
export const EVO_HISTORY_CAP_FREE = 10;
/** Paid-tier window — owner-approved cost trade-off (master plan W2). */
export const EVO_HISTORY_CAP_PAID = 16;

/**
 * The route clamps the raw payload to the PAID cap (the larger one) and
 * then slices again by tier — one hard clamp, one policy slice.
 */
export function resolveHistoryCap(isPaidTier: boolean): number {
  return isPaidTier ? EVO_HISTORY_CAP_PAID : EVO_HISTORY_CAP_FREE;
}

/* ------------------------------------------------------------------ */
/*  W2.2 — real progress into the prompt                               */
/* ------------------------------------------------------------------ */

/** Mirrors the route's EvoClientContext.recent_measurements entry. */
export type EvoMeasurement = {
  weight: number | null;
  waist: number | null;
  date: string;
};

export type EvoWeightDelta = {
  /** newest minus oldest, kg, 1 decimal — null when not computable */
  deltaKg: number | null;
  /** null when no delta; |delta| < 0.2 counts as "stable" (scale noise) */
  direction: "down" | "up" | "stable" | null;
  oldestWeight: number | null;
  newestWeight: number | null;
};

/**
 * Delta between the OLDEST and NEWEST weight in the window. The route
 * feeds entries ordered oldest → newest (listProgress ascending); the
 * caller passes them through as-is. Needs at least two entries with
 * non-null weights on different dates — anything else is "not
 * computable" and the prompt simply shows the raw readings instead.
 */
export function computeWeightDelta(
  measurements: EvoMeasurement[] | undefined | null,
): EvoWeightDelta {
  const usable = (measurements ?? []).filter(
    (m) => m && typeof m.weight === "number" && Number.isFinite(m.weight),
  );
  if (usable.length < 2) {
    return {
      deltaKg: null,
      direction: null,
      oldestWeight: usable[0]?.weight ?? null,
      newestWeight: usable[usable.length - 1]?.weight ?? null,
    };
  }
  const oldest = usable[0];
  const newest = usable[usable.length - 1];
  if (oldest.date === newest.date) {
    return {
      deltaKg: null,
      direction: null,
      oldestWeight: oldest.weight ?? null,
      newestWeight: newest.weight ?? null,
    };
  }
  const delta = Math.round(((newest.weight ?? 0) - (oldest.weight ?? 0)) * 10) / 10;
  return {
    deltaKg: delta,
    direction: Math.abs(delta) < 0.2 ? "stable" : delta < 0 ? "down" : "up",
    oldestWeight: oldest.weight ?? null,
    newestWeight: newest.weight ?? null,
  };
}

function fmtDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/**
 * Compact Arabic prompt block (the system prompt's data section is
 * Arabic-labelled — the model replies in the USER's language anyway).
 * Returns "" when there is nothing real to show — the section never
 * appears empty AND never invents numbers (Platform Truth law).
 */
export function formatProgressForPrompt(
  measurements: EvoMeasurement[] | undefined | null,
): string {
  const usable = (measurements ?? []).filter(
    (m) => m && (typeof m.weight === "number" || typeof m.waist === "number"),
  );
  if (usable.length === 0) return "";

  const readings = usable
    .map((m) => {
      const parts: string[] = [];
      if (typeof m.weight === "number") parts.push(`${m.weight}كغ`);
      if (typeof m.waist === "number") parts.push(`الوسط ${m.waist}سم`);
      const d = fmtDate(m.date);
      return d ? `${parts.join(" · ")} (${d})` : parts.join(" · ");
    })
    .join(" → ");

  const delta = computeWeightDelta(usable);
  let deltaLine = "";
  if (delta.deltaKg !== null && delta.deltaKg !== 0) {
    const label =
      delta.direction === "down"
        ? `انخفاض ${Math.abs(delta.deltaKg)}كغ`
        : `ارتفاع ${delta.deltaKg}كغ`;
    deltaLine = `\nالتغير عبر الفترة: ${label} — اربط توصياتك بهذا الرقم الفعلي.`;
  }

  return `\n\nآخر قياسات المسجلة (الأقدم → الأحدث): ${readings}${deltaLine}`;
}

/* ------------------------------------------------------------------ */
/*  W2.1 — first-meeting interview gate                                */
/* ------------------------------------------------------------------ */

/**
 * True when a PAID subscriber asks for a plan but never filled the
 * questionnaire that domain is generated from:
 *   nutrition → nutrition questionnaire, workout → fitness questionnaire.
 * Anonymous/free users CAN generate plans since Phase 183 (unified pool,
 * 2026-09-13) but have no questionnaire on file — the interview is a
 * subscriber-context protocol and stays skipped for them (the model asks
 * its own short clarifying question per the coach stance).
 */
export function needsFirstMeetingInterview(input: {
  isSubscriber: boolean;
  isPlanCreation: boolean;
  planDomain: EvoPlanDomain;
  hasNutritionQuestionnaire: boolean;
  hasFitnessQuestionnaire: boolean;
}): boolean {
  if (!input.isSubscriber || !input.isPlanCreation) return false;
  return input.planDomain === "nutrition"
    ? !input.hasNutritionQuestionnaire
    : !input.hasFitnessQuestionnaire;
}

/**
 * The prompt section injected when the gate fires. Written as coach
 * behavior, not robot script: 3-4 questions max, ONE per reply, then a
 * short compiled profile, then the plan — in the SAME reply. Existing
 * hard laws (plain text, no medical advice, never invent numbers) are
 * restated inline because plan turns tend to be long.
 */
export const EVO_FIRST_MEETING_PROTOCOL = `FIRST-MEETING PROTOCOL (this subscriber has no questionnaire on file yet):
- The user just asked you for a plan without having filled the platform questionnaire. Do NOT refuse, and do NOT generate from nothing.
- Interview like a real coach: ask a MAXIMUM of 4 short questions across replies — ONE question per reply. For a workout plan: the goal, training days/experience, available equipment/place, injuries. For a meal plan: the goal, current weight/height, allergies or disliked foods, daily meals count preference.
- Use what the user already told you in this chat — never re-ask an answered question.
- When you have the answers (or after 4 questions), do all of this in ONE reply: (1) present the compiled profile in 2-3 short lines, (2) state plainly any assumption you had to fill in (e.g. "assumed 3 training days — correct me if wrong"), (3) generate the plan directly in the chat.
- Build every number from the user's own answers. If a needed number was never given, say your assumption openly — NEVER invent measurements or claim they told you.
- If the user mentions an injury or a medical condition during the interview, keep the plan safe around it and recommend medical clearance — still no medical advice.`;
