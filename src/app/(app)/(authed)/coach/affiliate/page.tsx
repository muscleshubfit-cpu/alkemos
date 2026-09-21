"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { ReferralView } from "@/components/views/ReferralView";

/**
 * COACH AFFILIATE DASHBOARD — /coach/affiliate (Phase 67, owner-approved).
 *
 * Owner decree 2026-09-01: a referred COACH is part of the affiliate
 * system — he earns 20% of the site fee on every client activation he
 * pays for... and the person who INVITED him earns it too. Staff (coach +
 * admin) previously bounced off /referral (client-only surface), so this
 * staff mirror reuses the same ReferralView against the same tables.
 *
 * PHASE 142 (owner: «يجب الفصل بين ادمن / مدرب موقع / مدرب مستقل»):
 * B2B-COACH-ONLY — the affiliate earnings mirror exists for the
 * independent partner whose activations pay the site fee. An ADMIN has
 * no coach-referral earnings surface (he runs /admin/referrals) and a
 * SITE coach's follow-up work never debits wallets. Both bounce to
 * their own consoles; clients bounce to /dashboard.
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
  return <ReferralView />;
}
