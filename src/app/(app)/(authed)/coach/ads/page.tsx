"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { CoachAdsView } from "@/components/views/CoachAdsView";

/**
 * «أعلن معنا» — COACH ADS (0037) — /coach/ads
 *
 * PHASE 142 (owner: «يجب الفصل بين ادمن / مدرب موقع / مدرب مستقل»):
 * B2B-COACH-ONLY surface. Paid ad packages are the independent
 * partner's growth tool (wallet-debited) — an ADMIN never buys ads
 * (he runs the site) and a SITE coach is staff, not an advertiser.
 * Both bounce to their own consoles; clients bounce to /dashboard.
 */
export default function Page() {
  const { profile, loading, isB2BCoach } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!profile) {
      router.replace("/auth");
      return;
    }
    if (!isB2BCoach) {
      router.replace(profile.role === "admin" ? "/admin/dashboard" : "/coach");
    }
  }, [loading, profile, isB2BCoach, router]);

  if (loading || !isB2BCoach) return null;
  return <CoachAdsView />;
}
