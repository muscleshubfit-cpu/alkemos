"use client";
import { AdminEvoAnalyticsView } from "@/components/views/AdminEvoAnalyticsView";

/**
 * /admin/evo-analytics — EVO-5 (W5.8): intent distribution · provider
 * success (provenance) · quota consumption · cache hits · weekly eval
 * curve. Admin-only (AdminGate wraps /admin/* in the layout).
 */
export default function Page() {
  return <AdminEvoAnalyticsView />;
}
