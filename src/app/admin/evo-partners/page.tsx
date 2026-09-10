"use client";
import { AdminEvoPartnersView } from "@/components/views/AdminEvoPartnersView";

/**
 * /admin/evo-partners — EVO-6 (W6): partner API keys + embed widget
 * management. Admin-only (AdminGate wraps /admin/* in the layout).
 */
export default function Page() {
  return <AdminEvoPartnersView />;
}
