import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth-server";
import { isSupabaseAdminConfigured, supabaseAdmin } from "@/lib/supabase/admin";
import {
  isFollowupDue,
  buildFollowupEmail,
  EVO_FOLLOWUP_INTERVAL_DAYS,
} from "@/lib/evo-followup";
import { computeWeightDelta } from "@/lib/evo-coach";

/**
 * POST /api/evo/followup/dispatch — EVO-3 (W2, D4) weekly check-in sender.
 *
 * INFRASTRUCTURE-ONLY IN THIS PHASE (docs/EVO-MASTER-PLAN.md §4 W2):
 *   ACTIVATION GATE 1 — EVO_FOLLOWUP_ENABLED env flag. Anything other
 *   than the exact string "true" → 404 (route invisible, nothing sends).
 *   Activation order (documented in the master plan / STATE):
 *     1. live SMTP/Brevo check with the evo@alkemos.com sender,
 *     2. EVO_FOLLOWUP_ENABLED=true + EVO_CRON_SECRET on the runtime,
 *     3. user-facing opt-in UI (D4: opt-in is MANDATORY — no UI, no sends).
 *
 * CALLERS (either passes):
 *   - a platform ADMIN session (requireAdmin — role==='admin' only), or
 *   - the future cron scheduler with header  x-cron-secret: <EVO_CRON_SECRET>.
 *   Anonymous/no-flag calls get 401/404 — never a user-facing surface.
 *
 * WHAT IT DOES per run:
 *   1. selects opted-in prefs due by the 7-day cadence (batch cap 50),
 *   2. loads each user's REAL data via service-role: profile email/name,
 *      last progress entries, active plan titles,
 *   3. builds the bilingual email with src/lib/evo-followup.ts (real
 *      numbers only — the email cannot invent data),
 *   4. sends via the Brevo REST API (HTTPS/443 — the only path that
 *      works from Vercel serverless; SMTP ports are blocked), sender
 *      evo@alkemos.com (SEND-ONLY per D4 — no reply inbox is read),
 *   5. stamps last_sent_at ONLY on a successful send (failures retry
 *      next run; one user's failure never aborts the batch).
 *
 * COST/ABUSE GUARDS: batch cap 50/run, 7-day per-user cadence, counts
 * only in the response (no emails leaked), every failure logged + counted.
 */

export const runtime = "nodejs";

const BATCH_LIMIT = 50;
const DEFAULT_FROM = "EVO — Alkemos <evo@alkemos.com>";
const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://alkemos.com").replace(
  /\/$/,
  "",
);

export async function POST(request: NextRequest) {
  // ACTIVATION GATE 1 — the kill switch. Default OFF (infrastructure phase).
  if (process.env.EVO_FOLLOWUP_ENABLED !== "true") {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // ACTIVATION GATE 2 — admin session OR the cron secret.
  const cronSecret = process.env.EVO_CRON_SECRET;
  const providedSecret = request.headers.get("x-cron-secret");
  const isCron = Boolean(cronSecret) && providedSecret === cronSecret;
  if (!isCron) {
    const admin = await requireAdmin(request);
    if (admin instanceof Response) return admin;
  }

  if (!isSupabaseAdminConfigured || !supabaseAdmin) {
    return NextResponse.json(
      { error: "Service role is not configured" },
      { status: 500 },
    );
  }

  const apiKey = process.env.BREVO_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "Email service is not configured" },
      { status: 500 },
    );
  }

  try {
    // 1) Due prefs — opted-in only (D4), 7-day cadence, batch cap.
    //    The cadence math mirrors isFollowupDue (single definition in the
    //    lib; the SQL narrows the scan, the lib re-validates each row).
    const since = new Date(Date.now() - EVO_FOLLOWUP_INTERVAL_DAYS * 24 * 60 * 60 * 1000).toISOString();
    const { data: prefs, error: prefsErr } = await supabaseAdmin
      .from("evo_followup_prefs")
      .select("client_id, opted_in, language, last_sent_at")
      .eq("opted_in", true)
      .or(`last_sent_at.is.null,last_sent_at.lt.${since}`)
      .order("last_sent_at", { ascending: true, nullsFirst: true })
      .limit(BATCH_LIMIT);

    if (prefsErr) {
      console.error("[api/evo/followup/dispatch] prefs query failed:", prefsErr.message);
      return NextResponse.json({ error: "Query failed" }, { status: 500 });
    }

    const rows = (prefs ?? []).filter((p) =>
      isFollowupDue({ opted_in: p.opted_in, last_sent_at: p.last_sent_at }),
    );

    const fromRaw = process.env.EVO_FOLLOWUP_FROM ?? DEFAULT_FROM;
    const fromMatch = /^\s*(.*?)\s*<([^>]+)>\s*$/.exec(fromRaw);
    const fromEmail = fromMatch?.[2] ?? fromRaw;
    const fromName = fromMatch?.[1] || "EVO — Alkemos";

    let sent = 0;
    let failed = 0;
    let skipped = 0;

    for (const pref of rows) {
      try {
        // 2) REAL data via service-role (fail this user → skip, not abort).
        const [{ data: profile }, { data: progress }, { data: plans }] =
          await Promise.all([
            supabaseAdmin
              .from("profiles")
              .select("email, full_name")
              .eq("id", pref.client_id)
              .maybeSingle(),
            supabaseAdmin
              .from("progress_entries")
              .select("weight, created_at")
              .eq("client_id", pref.client_id)
              .order("created_at", { ascending: true })
              .limit(3),
            supabaseAdmin
              .from("plans")
              .select("title, created_at")
              .eq("client_id", pref.client_id)
              .order("created_at", { ascending: false })
              .limit(3),
          ]);

        const email = typeof profile?.email === "string" ? profile.email.trim() : "";
        if (!email) {
          skipped += 1;
          continue;
        }

        const measurements = (progress ?? []).map((p) => ({
          weight: typeof p.weight === "number" ? p.weight : null,
          waist: null,
          date: p.created_at,
        }));
        const delta = computeWeightDelta(measurements);
        const latestWeight =
          delta.newestWeight ?? measurements[measurements.length - 1]?.weight ?? null;

        const mail = buildFollowupEmail({
          name: profile?.full_name || "",
          language: pref.language === "en" ? "en" : "ar",
          weightDeltaKg: delta.deltaKg,
          latestWeight,
          activePlanTitles: (plans ?? []).map((p) => p.title),
          siteUrl: SITE_URL,
        });

        // 4) Brevo REST over 443 (SMTP ports are blocked on serverless —
        //    verified live 2026-09-08, see /api/send-email). Sender is the
        //    D4 send-only mailbox; no replyTo is set on purpose.
        const brevoRes = await fetch("https://api.brevo.com/v3/smtp/email", {
          method: "POST",
          headers: {
            "api-key": apiKey,
            "Content-Type": "application/json",
            accept: "application/json",
          },
          body: JSON.stringify({
            sender: { name: fromName, email: fromEmail },
            to: [{ email }],
            subject: mail.subject,
            htmlContent: mail.html,
            textContent: mail.text,
          }),
        });

        if (!brevoRes.ok) {
          const errBody = await brevoRes.text();
          console.error(
            `[api/evo/followup/dispatch] Brevo ${brevoRes.status} for one recipient: ${errBody.slice(0, 200)}`,
          );
          failed += 1;
          continue;
        }

        // 5) Stamp ONLY on success — failed sends retry next run.
        const { error: stampErr } = await supabaseAdmin
          .from("evo_followup_prefs")
          .update({
            last_sent_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq("client_id", pref.client_id);
        if (stampErr) {
          // Sent but not stamped → the user may get a second email next
          // run. Logged loudly; acceptable (cadence re-check runs per
          // dispatch, and no duplicate arrives within one run).
          console.error(
            "[api/evo/followup/dispatch] last_sent_at stamp failed:",
            stampErr.message,
          );
        }
        sent += 1;
      } catch (userErr) {
        failed += 1;
        console.error(
          "[api/evo/followup/dispatch] recipient failed (continue):",
          userErr instanceof Error ? userErr.message : userErr,
        );
      }
    }

    return NextResponse.json({
      ok: true,
      scanned: rows.length,
      sent,
      failed,
      skipped,
    });
  } catch (e) {
    console.error(
      "[api/evo/followup/dispatch] Error:",
      e instanceof Error ? e.message : e,
    );
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
