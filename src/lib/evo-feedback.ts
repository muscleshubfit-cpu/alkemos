/**
 * EVO feedback input handling (EVO-1 — W5.1 of docs/EVO-MASTER-PLAN.md).
 *
 * Pure validation/normalization for the 👍/👎 feedback stream — the API
 * route is a thin wrapper around parseEvoFeedbackInput. Kept client-safe
 * so the widget reuses the same caps before POSTing.
 *
 * ABUSE POSTURE: the route additionally rate-limits per IP (rate-limit.ts).
 * This module caps EVERYTHING free-text so a hostile payload can never
 * reach the DB with unbounded content.
 */

export const FEEDBACK_REASON_MAX = 300;
export const FEEDBACK_SNIPPET_MAX = 500;

export type EvoFeedbackValue = "up" | "down";

export type EvoFeedbackInput = {
  feedback: EvoFeedbackValue;
  reason: string | null;
  messageId: string | null;
  question: string | null;
  reply: string | null;
};

export type ParsedFeedback =
  | { ok: true; value: EvoFeedbackInput }
  | { ok: false; error: string };

function cap(value: unknown, max: number): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  return trimmed.slice(0, max);
}

/** Validate + normalize a feedback payload. Never throws. */
export function parseEvoFeedbackInput(
  body: unknown,
): ParsedFeedback {
  if (!body || typeof body !== "object") {
    return { ok: false, error: "Invalid payload" };
  }
  const raw = body as Record<string, unknown>;

  const feedback = raw.feedback;
  if (feedback !== "up" && feedback !== "down") {
    return { ok: false, error: "feedback must be 'up' or 'down'" };
  }

  // reason: only meaningful for down — accepted for both, capped hard.
  const reason = cap(raw.reason, FEEDBACK_REASON_MAX);

  const messageId = cap(raw.messageId, 80);

  return {
    ok: true,
    value: {
      feedback,
      reason,
      messageId,
      question: cap(raw.question, FEEDBACK_SNIPPET_MAX),
      reply: cap(raw.reply, FEEDBACK_SNIPPET_MAX),
    },
  };
}
