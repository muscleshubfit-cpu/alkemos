"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { CoachWalletView } from "@/components/views/CoachWalletView";

/**
 * COACH WALLET (0035) — /coach/wallet
 *
 * PHASE 142 (owner: «يجب الفصل بين ادمن / مدرب موقع / مدرب مستقل»):
 * B2B-COACH-ONLY surface. The wallet is the B2B partner's money rail —
 * he pays THE SITE a per-client fee from it. An ADMIN has no personal
 * B2B wallet (he manages everyone's money from /admin/wallets) and a
 * SITE coach is follow-up staff with no per-client billing — both
 * bounce to their own consoles; clients bounce to /dashboard.
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
      // admin → his console (money management lives there);
      // site coach → his follow-up console.
      router.replace(profile.role === "admin" ? "/admin/dashboard" : "/coach");
    }
  }, [loading, profile, isB2BCoach, router]);

  if (loading || !isB2BCoach) return null;
  return <CoachWalletView />;
}
