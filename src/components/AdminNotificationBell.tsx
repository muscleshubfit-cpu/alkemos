"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Bell, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
 Popover,
 PopoverContent,
 PopoverTrigger,
} from "@/components/ui/popover";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/hooks/use-auth";
import { useNav } from "@/hooks/use-nav";
import { cn } from "@/lib/utils";
// P3-10 (deep-audit Phase 217 — safeNext expansion): same law as the
// client bell — notification links pass the shared open-redirect
// validator before any router.push.
import { safeNext } from "@/lib/safe-redirect";
// NOTIF-I18N-250 + STAFF-BELL-I18N-251: system notifications render in the
// ACTIVE UI language (catalog + payload, honest verbatim fallback); staff
// bell rows do the same — the crew bell speaks the VIEWER's language.
import { formatDateTimeFor } from "@/lib/format-locale";
import { localizeAdminNotification } from "@/lib/notification-i18n";
// PHASE 182: type-only import (erased at compile) — the notification
// functions are dynamically imported at their call sites so this
// header-mounted bell never pulls @supabase/ssr into first-load JS.
import type { AdminNotificationRow } from "@/lib/data";

export function AdminNotificationBell() {
 const { t, lang } = useI18n();
 const isAr = lang === "ar";
 const { navigate } = useNav();
 const router = useRouter();
 // Phase 246 — role-aware feed: the admin goes through the filtered
 // GET /api/notifications/admin (owner bug: «الاشعارات كلها تظهر للادمن»);
 // coaches keep the RLS fetch (own rows + broadcasts).
 const { profile } = useAuth();
 const isAdmin = profile?.role === "admin";
 const [open, setOpen] = useState(false);
 const [items, setItems] = useState<AdminNotificationRow[]>([]);
 const [loading, setLoading] = useState(true);

 useEffect(() => {
 let interval: ReturnType<typeof setInterval> | undefined;
 const load = async () => {
 try {
 const { listAdminNotifications, listAdminNotificationsForAdmin } = await import("@/lib/data");
 const data = isAdmin
 ? await listAdminNotificationsForAdmin()
 : await listAdminNotifications();
 setItems(data);
 } catch (e) {
 // Phase 247: a throw used to leave the bell stuck on «loading» forever
 // (unhandled rejection, setLoading never reached) — mirror the member
 // bell: keep the last good items, log loudly, stop the spinner.
 console.error("[AdminNotificationBell] load failed:", e);
 } finally {
 setLoading(false);
 }
 };
 load();
 // VERCEL-USAGE cleanup (2026-09-16): pause polling while the tab is
 // hidden (same law as NotificationBell) — background tabs no longer
 // burn API invocations + middleware getUser() hops all day.
 const handleVisibility = () => {
 if (document.hidden) {
 clearInterval(interval);
 } else {
 load();
 interval = setInterval(load, 30000);
 }
 };
 document.addEventListener("visibilitychange", handleVisibility);
 interval = setInterval(load, 30000);
 return () => {
 clearInterval(interval);
 document.removeEventListener("visibilitychange", handleVisibility);
 };
 }, [isAdmin]);

 const unread = items.filter((n) => !n.read).length;

 const handleMarkRead = async () => {
 const { markAdminNotificationsRead } = await import("@/lib/data");
 // Phase 246 — scope the write to the ids the bell actually shows (the
 // old update touched EVERY read=false row — for an admin that meant
 // marking OTHER coaches' rows read).
 await markAdminNotificationsRead(items.map((n) => n.id));
 setItems((prev) => prev.map((n) => ({ ...n, read: true })));
 };

 const handleNavigate = (link?: string | null) => {
 if (!link) return;
 if (link === "coach") navigate("coach");
 else if (link === "coach-support") navigate("coach-support");
 // 0043: legacy rows carry "coach-payments"; new rows carry
 // "/admin/payments" — both land on the admin-only review page.
 else if (link === "coach-payments" || link === "/admin/payments") navigate("admin-payments");
 // 0049 — anything else that is a real path (e.g. the coach-pages
 // review queue "/admin/coach-pages") opens directly — through the
 // shared open-redirect validator (P3-10 Phase 217); invalid links
 // do not navigate at all.
 else if (link.startsWith("/")) {
 const safeLink = safeNext(link);
 if (safeLink !== "/" || link === "/") router.push(safeLink);
 }
 };

 // 0049 — clicking a notification = READ (same rule as the client bell).
 // Optimistic flip + fire-and-forget DB update; RLS lets admins update
 // any row and staff update their own/broadcast rows.
 const handleItemClick = (n: { id: string; read: boolean; link?: string | null }) => {
 setOpen(false);
 if (!n.read) {
 setItems((prev) => prev.map((x) => (x.id === n.id ? { ...x, read: true } : x)));
 void import("@/lib/data")
 .then(({ markAdminNotificationRead }) => markAdminNotificationRead(n.id))
 .catch((e) => console.error("[AdminNotificationBell] mark read failed:", e));
 }
 handleNavigate(n.link);
 };

 return (
 <Popover open={open} onOpenChange={setOpen}>
 <PopoverTrigger asChild>
 <Button variant="ghost" size="sm" className="relative px-2">
 <Bell className="h-4 w-4" />
 {unread > 0 && (
 <span className="absolute -end-0.5 -top-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-gold px-1 text-[10px] font-bold text-gold-foreground">
 {unread > 9 ? "9+" : unread}
 </span>
 )}
 </Button>
 </PopoverTrigger>
 <PopoverContent align="end" className="w-80 p-0">
 <div className="flex items-center justify-between border-b border-border px-3 py-2">
 {/* Phase 144 (2026-09-08): this bell lives in the ADMIN console — the
     hardcoded «إشعارات الكوتش» (coach notifications) title was wrong for
     admins and untranslated for English users. Bilingual + role-neutral. */}
 <span className="text-sm font-semibold">
 {isAr ? "الإشعارات" : "Notifications"}
 </span>
 {unread > 0 && (
 <button
 onClick={handleMarkRead}
 className="flex items-center gap-1 text-xs text-gold hover:underline"
 >
 <Check className="h-3 w-3" />
 {isAr ? "تعليم الكل كمقروء" : "Mark all as read"}
 </button>
 )}
 </div>
 <div className="max-h-80 overflow-y-auto scrollbar-thin">
 {loading ? (
 <p className="px-3 py-8 text-center text-sm text-muted-foreground">{t("common.loading")}</p>
 ) : items.length === 0 ? (
 <p className="px-3 py-8 text-center text-sm text-muted-foreground">
 {isAr ? "لا توجد إشعارات" : "No notifications"}
 </p>
 ) : (
 items.map((n) => {
 const view = localizeAdminNotification(n, lang);
 return (
 <button
 key={n.id}
 onClick={() => handleItemClick(n)}
 className={cn(
 "flex w-full flex-col gap-0.5 border-b border-border/60 px-3 py-2.5 text-start transition-colors hover:bg-secondary",
 !n.read && "bg-gold/5",
 )}
 >
 <span className="text-sm font-medium">{view.title}</span>
 {view.body && <span className="line-clamp-2 text-xs text-muted-foreground">{view.body}</span>}
 <span className="text-[10px] text-muted-foreground">
 {formatDateTimeFor(n.created_at, lang)}
 </span>
 </button>
 );
 })
 )}
 </div>
 </PopoverContent>
 </Popover>
 );
}
