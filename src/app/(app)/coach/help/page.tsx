"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { CoachHelpView } from "@/components/views/CoachHelpView";

/**
 * «دعم المدربين» (0037) — /coach/help
 *
 * COACHES-ONLY (both kinds — site & B2B) since Phase 142: the dedicated
 * coach → site support channel. The ADMIN is the RECEIVING side of this
 * channel (his inbox is /admin/coach-support inside the admin console)
 * — he bounces there instead of filing tickets to himself; clients
 * bounce to /dashboard.
 */
export default function Page() {
  const { profile, loading, isCoach } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!profile) {
      router.replace("/auth");
      return;
    }
    if (profile.role === "admin") {
      // the admin receives coach support — his inbox lives in his console.
      router.replace("/admin/coach-support");
      return;
    }
    if (!isCoach) {
      router.replace("/dashboard");
    }
  }, [loading, profile, isCoach, router]);

  if (loading || !isCoach || profile?.role === "admin") return null;
  return <CoachHelpView />;
}
