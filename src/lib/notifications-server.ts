/**
 * notifications-server — Phase 246 (owner bug: «الاشعارات كلها تظهر للادمن»).
 *
 * Server-side routing helpers for the `admin_notifications` staff bell.
 *
 * WHY: the staff-bell SELECT is RLS-scoped (`is_admin() or (is_staff() and
 * (target_coach_id is null or target_coach_id = auth.uid()))` — 0088), so an
 * ADMIN received every row: broadcasts plus rows targeted at ANY coach
 * (new-client / questionnaire / plan-approval pings of other coaches, page
 * approvals, referral-commission copies…). Three emit sites also broadcast
 * with NULL target although their content is admin business (ad purchase,
 * coach support mail, payout request) — leaking to every coach.
 *
 * The law now:
 * - EMIT side: admin-business events target the PRIMARY admin explicitly
 *   (first admin by created_at — the resolution POST /api/notifications/admin
 *   has always used). Coaches stop receiving them via RLS immediately.
 * - READ side: admins fetch through GET /api/notifications/admin which
 *   filters to `target_coach_id is null OR target_coach_id in (admin ids)`
 *   with the service role — precise multi-admin visibility without touching
 *   RLS (no security migration needed).
 */
import { supabaseAdmin, isSupabaseAdminConfigured } from "@/lib/supabase/admin";

/** The admin ids, oldest first. Empty when unconfigured (demo mode). */
export async function getAdminIds(): Promise<string[]> {
  if (!isSupabaseAdminConfigured || !supabaseAdmin) return [];
  const { data } = await supabaseAdmin
    .from("profiles")
    .select("id")
    .eq("role", "admin")
    .order("created_at", { ascending: true });
  return ((data as { id: string }[] | null) ?? []).map((r) => r.id);
}

/**
 * The PRIMARY admin (first by created_at) — the established single target
 * for emit sites. Null when no admin exists; callers fall back to a NULL
 * broadcast so the event is never silently lost.
 */
export async function getPrimaryAdminId(): Promise<string | null> {
  const ids = await getAdminIds();
  return ids[0] ?? null;
}

/**
 * Pure builder of the supabase `.or()` filter for the admin feed.
 * `target_coach_id.is.null` (broadcasts) plus `in.(ids)` when admins exist.
 */
export function adminFeedOrFilter(adminIds: string[]): string {
  const parts = ["target_coach_id.is.null"];
  if (adminIds.length > 0) {
    parts.push(`target_coach_id.in.(${adminIds.join(",")})`);
  }
  return parts.join(",");
}
