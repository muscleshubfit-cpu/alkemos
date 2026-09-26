"use client";
import { AdminSiteContentView } from "@/components/views/AdminSiteContentView";

/**
 * /admin/site-content — SITE-CONTENT-281: the site-copy editor (the
 * blog-admin route pattern — a thin client page rendering its view;
 * AdminGate + AdminShell wrap it via the (app)/admin layout).
 */
export default function Page() {
  return <AdminSiteContentView />;
}
