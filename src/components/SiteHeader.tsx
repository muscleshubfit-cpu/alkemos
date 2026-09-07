"use client";

import { useState, useEffect } from "react";
import { openEvoFloatingChat } from "@/lib/evo-chat-context";
import {
  Menu,
  X,
  Home,
  FileText,
  Calculator,
  Dumbbell,
  Utensils,
  LayoutDashboard,
  ClipboardList,
  LineChart,
  MessageCircle,
  LifeBuoy,
  Gift,
  LogIn,
  LogOut,
  ShieldCheck,
  Bot,
  ChevronRight,
  ChevronDown,
  Bell,
  User,
  Sparkles,
  Users,
  Globe,
  Droplet,
  Target,
  Activity,
  Pizza,
  Megaphone,
  Wallet,
  ShieldQuestion,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { LanguageToggle } from "@/components/LanguageToggle";
import { ThemeToggle } from "@/components/ThemeToggle";
import { ThemeImg } from "@/components/ThemeImg";
import { useI18n } from "@/lib/i18n";
import { useNav } from "@/hooks/use-nav";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";
import { NotificationBell } from "@/components/NotificationBell";
import { AdminNotificationBell } from "@/components/AdminNotificationBell";

// Wrapper for header — smaller bell icon
function NotificationBellHeader({ isAdmin = false }: { isAdmin?: boolean }) {
  return (
    <div className="NotificationBellHeader">
      {isAdmin ? <AdminNotificationBell /> : <NotificationBell />}
    </div>
  );
}

/**
 * Site header — Apple-style clean bar.
 *
 * Layout: [MENU] [MARK] ...... [THEME] [LANG] [LOGIN/LOGOUT] [BELL]
 *
 * Phase 138 (owner directive 2026-09-07): the logo is the helmet MARK
 * only (no wordmark), anchored at the start side next to the menu button.
 * All utility buttons (theme / language / login / bell) are grouped
 * together on the end side. The hamburger opens a slide-in drawer for
 * full navigation.
 */
export function SiteHeader({ variant = "landing" }: { variant?: "landing" | "app" }) {
  const { t, lang } = useI18n();
  const { navigate } = useNav();
  const { profile, isCoach, isAdmin, isSiteCoach, isB2BCoach, signOutAsync } = useAuth();

  // Phase 51 — the header ACCOUNT button opens the role's own CONSOLE for
  // staff (admin → /admin, coach → /coach) instead of the member-style
  // /profile page («عضويتك/أدواتك/حدودك»). Members keep /profile. Staff
  // still reach /profile via the «الصفحة الشخصية» card inside their
  // dashboards.
  const accountHref = isAdmin ? "/admin" : isCoach ? "/coach" : "/profile";
  const isLoggedIn = !!profile;
  const isAr = lang === "ar";
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open]);

  // Blog link: admin manages the CMS (/admin/blog); everyone else —
  // including future coach accounts — reads the public blog.
  const blogHref = isAdmin ? "/admin/blog" : isAr ? "/ar/blog" : "/blog";

  // ─── Menu data model (grouped) ─────────────────────────────────────────
  // The drawer is organised into clear sections:
  //   1. Home
  //   2. Paid Services (Coaching + Memberships + EVO AI Coach) — premium offerings
  //   3. Affiliate Program — monetization for promoters
  //   4. Tools (expandable dropdown) — 6 free calculators + meal planner
  //   5. Resources — content libraries (Exercises, Programs, Foods, Blog)
  //   6. Authenticated-only items (Dashboard, My Plans, etc.) — appended below
  //   7. Coach-only items — appended when isCoach
  //
  // Legal & basic pages (Privacy, Terms, About, FAQ, Contact) are intentionally
  // NOT in the header — they live in the footer only (per Owner directive
  // 2026-08-25). Visitors scanning the header should see the product offering
  // first; legal/contact pages are secondary.

  type MenuItem = {
    label: string;
    icon: LucideIcon;
    href?: string;
    onClick?: () => void;
  };

  type MenuGroup = {
    id: string;
    title: string;
    items: MenuItem[];
  };

  const groups: MenuGroup[] = [];

  // Group 1: Home
  groups.push({
    id: "home",
    title: "",
    items: [
      {
        label: isAr ? "الرئيسية" : "Home",
        icon: Home,
        onClick: () => navigate("landing"),
      },
    ],
  });

  // Group 2: Paid Services (Coaching + Memberships + EVO AI Coach)
  // ROLE SURFACE LAW (2026-08-29): hidden from platform staff — the
  // owner/coach must not browse his own sales funnel in the header.
  if (!isCoach) {
    groups.push({
      id: "paid-services",
      title: isAr ? "الخدمات المدفوعة" : "Paid Services",
      items: [
        {
          label: isAr ? "الكوتشينج" : "Coaching",
          icon: Users,
          href: "/coaching",
        },
        {
          label: isAr ? "العضويات" : "Memberships",
          icon: Sparkles,
          // AR-aware (Phase 45 follow-up, owner-approved): /memberships has an
          // Arabic mirror at /ar/memberships — send Arabic users there.
          // /coaching and /evo have no AR mirrors, so they stay as-is.
          href: isAr ? "/ar/memberships" : "/memberships",
        },
        {
          label: "EVO AI Coach",
          icon: Bot,
          href: "/evo",
        },
      ],
    });
  }

  // Group 3: Affiliate Program (public marketing page) — staff never see it
  if (!isCoach) {
    groups.push({
      id: "affiliate",
      title: isAr ? "الأفلييت" : "Affiliate",
      items: [
        {
          label: isAr ? "برنامج الأفلييت" : "Affiliate Program",
          icon: Gift,
          href: "/affiliate",
        },
      ],
    });
  }

  // Group 4: Tools (dropdown — expandable to show all 6 tools + meal planner)
  // Per Owner directive 2026-08-25: tools must be a dropdown menu showing all
  // individual tools, NOT a single link to /tools.
  groups.push({
    id: "tools",
    title: isAr ? "الأدوات" : "Tools",
    items: [
      {
        label: isAr ? "حاسبة BMI" : "BMI Calculator",
        icon: Activity,
        href: "/tools/bmi-calculator",
      },
      {
        label: isAr ? "حاسبة الدهون" : "Body Fat Calculator",
        icon: Target,
        href: "/tools/body-fat-calculator",
      },
      {
        label: isAr ? "حاسبة السعرات" : "Calorie Calculator",
        icon: Calculator,
        href: "/tools/calorie-calculator",
      },
      {
        label: isAr ? "حاسبة الماكروز" : "Macro Calculator",
        icon: Calculator,
        href: "/tools/macro-calculator",
      },
      {
        label: isAr ? "متتبع الماء" : "Water Tracker",
        icon: Droplet,
        href: "/tools/water-tracker",
      },
      {
        label: isAr ? "مخطط الوجبات" : "Meal Planner",
        icon: Pizza,
        href: "/meal-planner",
      },
    ],
  });

  // Group 5: Resources (content libraries — exercises / programs / foods / blog)
  groups.push({
    id: "resources",
    title: isAr ? "المحتوى" : "Resources",
    items: [
      {
        label: isAr ? "مكتبة التمارين" : "Exercises",
        icon: Dumbbell,
        href: "/exercises",
      },
      {
        label: isAr ? "برامج التدريب" : "Programs",
        icon: ClipboardList,
        href: "/programs",
      },
      {
        label: isAr ? "مكتبة الأكلات" : "Foods",
        icon: Utensils,
        href: "/foods",
      },
      {
        label: isAr ? "المدونة" : "Blog",
        icon: FileText,
        href: blogHref,
      },
    ],
  });

  // Group 6: Account (authenticated items)
  if (isLoggedIn && !isCoach) {
    groups.push({
      id: "account",
      title: isAr ? "حسابي" : "My Account",
      items: [
        { label: isAr ? "لوحة التحكم" : "Dashboard", icon: LayoutDashboard, onClick: () => navigate("dashboard") },
        { label: isAr ? "خططي" : "My Plans", icon: FileText, onClick: () => navigate("plans") },
        { label: isAr ? "تقدمي" : "My Progress", icon: LineChart, onClick: () => navigate("progress") },
        // EVO CHAT SURFACE LAW: opens the floating widget — never a /chat page.
        { label: isAr ? "كوتش EVO" : "EVO Coach", icon: Bot, onClick: () => openEvoFloatingChat() },
        { label: isAr ? "الاستبيانات" : "Questionnaires", icon: ClipboardList, onClick: () => navigate("questionnaires") },
        { label: isAr ? "الإحالات" : "Referrals", icon: Gift, onClick: () => navigate("referral") },
        { label: isAr ? "الدعم" : "Support", icon: LifeBuoy, onClick: () => navigate("support") },
      ],
    });
  }

  // Group 7a: Coach work items — PHASE 142 role-aware split (owner:
  // «يجب الفصل بين ادمن / مدرب موقع / مدرب مستقل»):
  //   - B2B COACH: the FULL business set, INCLUDING wallet + affiliate —
  //     they existed only in the app sidebar before, so a coach browsing
  //     public pages could never reach them (the «اختفاء ازرار» part).
  //   - SITE COACH: B2C follow-up items only — no money surfaces.
  //   - ADMIN: NO coach group at all — one link to HIS console (7b).
  if (isLoggedIn && isB2BCoach) {
    groups.push({
      id: "coach",
      title: isAr ? "إدارة الكوتش" : "Coach Admin",
      items: [
        { label: isAr ? "لوحة الكوتش" : "Coach Dashboard", icon: LayoutDashboard, onClick: () => navigate("coach") },
        { label: isAr ? "صفحتي العامة" : "My Public Page", icon: Globe, onClick: () => navigate("coach-landing") },
        // 0035 wallet — the B2B partner's money rail (was drawer-missing).
        { label: isAr ? "محفظتي" : "My Wallet", icon: Wallet, onClick: () => navigate("coach-wallet") },
        { label: isAr ? "أفيليت المدربين" : "Coach Affiliate", icon: Gift, onClick: () => navigate("coach-affiliate") },
        // 0043 TERMINOLOGY: site-membership payment requests are admin-only;
        // the coach's B2B money surface is his client page + wallet.
        { label: isAr ? "دعم العملاء" : "Client Support", icon: LifeBuoy, onClick: () => navigate("coach-support") },
        // 0037 — «أعلن معنا» + the dedicated coach→site support channel
        { label: isAr ? "أعلن معنا" : "Advertise with us", icon: Megaphone, onClick: () => navigate("coach-ads") },
        { label: isAr ? "دعم المدربين" : "Coach Support", icon: ShieldQuestion, onClick: () => navigate("coach-help") },
      ],
    });
  }
  if (isLoggedIn && isSiteCoach) {
    groups.push({
      id: "coach",
      title: isAr ? "لوحة مدرب الموقع" : "Site Coach",
      items: [
        { label: isAr ? "أعضائي للمتابعة" : "My members", icon: LayoutDashboard, onClick: () => navigate("coach") },
        { label: isAr ? "صفحتي العامة" : "My Public Page", icon: Globe, onClick: () => navigate("coach-landing") },
        { label: isAr ? "دعم العملاء" : "Client Support", icon: LifeBuoy, onClick: () => navigate("coach-support") },
        { label: isAr ? "دعم المدربين" : "Coach Support", icon: ShieldQuestion, onClick: () => navigate("coach-help") },
      ],
    });
  }

  // Group 7b: ADMIN — PHASE 142: the old 5-item «إدارة المنصة» group
  // (leads / saved / site-memberships / referrals / blog) duplicated the
  // /admin sidebar. ONE entry now: his console — everything lives there.
  if (isLoggedIn && isAdmin) {
    groups.push({
      id: "admin",
      title: isAr ? "إدارة المنصة" : "Platform Admin",
      items: [
        {
          label: isAr ? "لوحة الأدمن" : "Admin Console",
          icon: ShieldCheck,
          href: "/admin/dashboard",
        },
      ],
    });
  }

  // Expandable group state (only Tools is expandable by default)
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(
    new Set(["tools"]), // Tools group is open by default so users see all tools
  );

  const toggleGroup = (groupId: string) => {
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(groupId)) next.delete(groupId);
      else next.add(groupId);
      return next;
    });
  };

  const handleItemClick = (item: MenuItem) => {
    setOpen(false);
    if (item.onClick) item.onClick();
  };

  return (
    <>
      {/* G1 → Phase 126 «Marble & Chrome»: navbar-chrome (mission §1) —
          sticky, blur(12px), translucent bg, chrome bottom border.
          2-zone layout (Phase 138): [menu][helmet mark] start / [theme]
          [lang][bell][account] end. Phase 138 (owner directive 2026-09-07):
          «عدل لوجو الهيدر لشكل الرسمة بدون الكتابة وانقله الى الجانب مع
          تنسيق ازرار الهيدر» — the header logo is now the owner's helmet
          MARK only (no wordmark), anchored at the start side right after
          the menu button (the center-anchored navbar wordmark pair is
          retired). With the wordmark gone from the center there is nothing
          left for the theme toggle to crowd (the original Phase 128
          concern), so it returns to the actions group — every utility
          button now lives together on the end side, uniformly sized.
          Phase 127 note: the «Start now» chrome CTA stays REMOVED (owner
          request) — the navbar is navigation-only. */}
      <header className="navbar-chrome sticky top-0 z-40 w-full">
        <div
          className={cn(
            "mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6",
            variant === "app" && "max-w-6xl",
          )}
        >
          {/* Start side: hamburger + helmet mark — Phase 138. Mark pair
              (light/dark, ~5.7KB each) ThemeImg CSS-switches with the
              theme; tap → home. */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setOpen(true)}
              className="flex h-9 w-9 items-center justify-center rounded-lg text-[var(--text)] transition-colors hover:bg-[var(--tint)]"
              aria-label={isAr ? "فتح القائمة" : "Open menu"}
            >
              <Menu className="h-5 w-5" />
            </button>
            <button
              onClick={() => navigate("landing")}
              className="flex h-10 w-10 items-center justify-center rounded-lg transition-colors hover:bg-[var(--tint)]"
              aria-label="Alkemos"
            >
              <ThemeImg
                light="/images/brand/mark-helmet-light.png"
                dark="/images/brand/mark-helmet-dark.png"
                alt="Alkemos"
                /* PHASE 138: helmet MARK (no wordmark) 128x128 shown at 36px
                    (covers 3x DPR). Dark variant = luminosity-inverted
                    engraving so the mark pops on dark chrome. */
                width={128}
                height={128}
                eager
                className="h-9 w-9 object-contain"
              />
            </button>
          </div>

          {/* End side: theme + language + notifications + account — Phase
              138 tidy: ALL utility buttons grouped here, uniformly sized. */}
          <div className="flex items-center gap-2 md:gap-3">
            {/* Theme toggle — light/dark/auto (returned from the menu side:
                Phase 128 moved it left only to un-crowd the centered logo,
                which no longer exists). */}
            <ThemeToggle />

            {/* Language toggle — always visible */}
            <LanguageToggle />

            {/* Notifications bell — only for logged in users.
                Coaches see AdminNotificationBell (admin_notifications table),
                regular users see NotificationBell (user notifications table). */}
            {isLoggedIn && (
              <NotificationBellHeader isAdmin={isCoach} />
            )}

            {/* Account icon — profile photo if logged in, generic icon if not */}
            {isLoggedIn ? (
              <a
                href={accountHref}
                className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full ring-2 ring-[var(--edge)] transition-all hover:ring-[var(--chrome-edge)]"
                aria-label={isAr ? "حسابي" : "My account"}
              >
                {profile?.avatar_url ? (
                  // eslint-disable-next-line @next/next/no-img-element -- avatar URL is a user-provided arbitrary host; next/image would need a wildcard remotePatterns entry (weakens the image allowlist) and this is a 36px decorative thumbnail (QR-asset precedent)
                  <img
                    src={profile.avatar_url}
                    alt={profile.full_name || "Profile"}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="flex h-full w-full items-center justify-center bg-[var(--text)] text-sm font-medium text-[var(--bg)]">
                    {(profile?.full_name || "U")[0].toUpperCase()}
                  </span>
                )}
              </a>
            ) : (
              <button
                onClick={() => navigate("auth", { mode: "login" })}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--tint)] text-[var(--text)] transition-colors hover:bg-[var(--edge)]"
                aria-label={isAr ? "تسجيل الدخول" : "Log in"}
              >
                <User className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Slide-in drawer */}
      <div
        className={cn(
          "fixed inset-0 z-50 transition-all duration-300",
          open ? "pointer-events-auto" : "pointer-events-none",
        )}
        aria-hidden={!open}
      >
        <div
          className={cn(
            "absolute inset-0 bg-black/20 backdrop-blur-sm transition-opacity duration-300",
            open ? "opacity-100" : "opacity-0",
          )}
          onClick={() => setOpen(false)}
        />

        <aside
          className={cn(
            "absolute inset-y-0 end-0 flex w-[85vw] max-w-sm flex-col border-s bg-[var(--bg)] shadow-2xl transition-transform duration-300 ease-out",
            open ? "translate-x-0" : "rtl:-translate-x-full ltr:translate-x-full",
          )}
          style={{ borderInlineStartColor: "var(--edge)" }}
          role="dialog"
          aria-modal="true"
          aria-label={isAr ? "القائمة الرئيسية" : "Main menu"}
        >
          {/* Drawer header — Phase 138: helmet MARK (same as the navbar bar,
              no wordmark), tap → home. */}
          <div className="flex h-16 items-center justify-between border-b border-[var(--edge)] px-4">
            <button
              onClick={() => {
                setOpen(false);
                navigate("landing");
              }}
              className="flex h-10 w-10 items-center justify-center rounded-lg transition-colors hover:bg-[var(--tint)]"
              aria-label="Alkemos"
            >
              <ThemeImg
                light="/images/brand/mark-helmet-light.png"
                dark="/images/brand/mark-helmet-dark.png"
                alt="Alkemos"
                width={128}
                height={128}
                eager
                className="h-9 w-9 object-contain"
              />
            </button>
            <button
              onClick={() => setOpen(false)}
              className="flex h-10 w-10 items-center justify-center rounded-lg text-[var(--text)] transition-colors hover:bg-[var(--tint)]"
              aria-label={isAr ? "إغلاق القائمة" : "Close menu"}
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Menu items — grouped layout */}
          <nav className="flex-1 overflow-y-auto p-3" aria-label={isAr ? "القائمة الرئيسية" : "Main menu"}>
            {groups.map((group, gi) => {
              const isExpanded = expandedGroups.has(group.id);
              const canCollapse = group.id === "tools"; // Only Tools is collapsible (others always show items)
              const showHeader = group.title !== "";
              return (
                <section key={group.id} className={gi > 0 ? "mt-4" : ""}>
                  {showHeader && (
                    <button
                      type="button"
                      onClick={() => canCollapse && toggleGroup(group.id)}
                      className={
                        "mb-1 flex w-full items-center justify-between px-3 pt-2 pb-1 text-[10px] font-semibold uppercase tracking-wider text-[var(--muted-foreground)] " +
                        (canCollapse ? "cursor-pointer hover:text-[var(--text)]" : "cursor-default")
                      }
                      aria-expanded={canCollapse ? isExpanded : undefined}
                      disabled={!canCollapse}
                    >
                      <span>{group.title}</span>
                      {canCollapse && (
                        <ChevronDown
                          className={"h-3.5 w-3.5 transition-transform " + (isExpanded ? "rotate-180" : "")}
                          aria-hidden="true"
                        />
                      )}
                    </button>
                  )}
                  {(!canCollapse || isExpanded) && (
                    <ul className="space-y-0.5">
                      {group.items.map((item, i) => {
                        return (
                          <li key={`${group.id}-${i}`}>
                            {item.href ? (
                              <a
                                href={item.href}
                                onClick={() => setOpen(false)}
                                className={"flex items-center gap-3 rounded-lg px-3 py-2.5 text-start text-sm font-normal transition-colors text-[var(--text)] hover:bg-[var(--tint)] " + (canCollapse ? "ps-6" : "")}
                              >
                                <item.icon className="h-4 w-4 shrink-0 text-[var(--muted-foreground)]" aria-hidden="true" />
                                <span className="flex-1">{item.label}</span>
                                <ChevronRight className="h-4 w-4 shrink-0 opacity-30 rtl:rotate-180" aria-hidden="true" />
                              </a>
                            ) : (
                              <button
                                onClick={() => handleItemClick(item)}
                                className={"flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-start text-sm font-normal transition-colors text-[var(--text)] hover:bg-[var(--tint)] " + (canCollapse ? "ps-6" : "")}
                              >
                                <item.icon className="h-4 w-4 shrink-0 text-[var(--muted-foreground)]" aria-hidden="true" />
                                <span className="flex-1">{item.label}</span>
                                <ChevronRight className="h-4 w-4 shrink-0 opacity-30 rtl:rotate-180" aria-hidden="true" />
                              </button>
                            )}
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </section>
              );
            })}
          </nav>

          {/* Bottom section — account + logout */}
          <div className="border-t border-[var(--edge)] p-3">
            {isLoggedIn ? (
              <>
                {/* Account link */}
                <a
                  href={accountHref}
                  onClick={() => setOpen(false)}
                  className="mb-1 flex items-center gap-3 rounded-lg px-3 py-3 text-start text-sm font-normal transition-colors text-[var(--text)] hover:bg-[var(--tint)]"
                >
                  {profile?.avatar_url ? (
                    // eslint-disable-next-line @next/next/no-img-element -- avatar URL is a user-provided arbitrary host; next/image would need a wildcard remotePatterns entry (weakens the image allowlist) and this is a 28px decorative thumbnail (QR-asset precedent)
                    <img
                      src={profile.avatar_url}
                      alt={profile.full_name || "Profile"}
                      className="h-7 w-7 rounded-full object-cover"
                    />
                  ) : (
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--text)] text-xs font-medium text-[var(--bg)]">
                      {(profile?.full_name || "U")[0].toUpperCase()}
                    </span>
                  )}
                  <span className="flex-1 truncate">{profile?.full_name || (isAr ? "حسابي" : "My account")}</span>
                  <ChevronRight className="h-4 w-4 shrink-0 opacity-30 rtl:rotate-180" />
                </a>
                {/* Logout */}
                <button
                  onClick={async () => {
                    await signOutAsync();
                    navigate("landing");
                    setOpen(false);
                  }}
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-start text-sm font-normal transition-colors text-[#ff453a] hover:bg-[#ff453a]/5"
                >
                  <LogOut className="h-4 w-4" />
                  <span>{isAr ? "تسجيل الخروج" : "Logout"}</span>
                </button>
              </>
            ) : (
              <button
                onClick={() => {
                  navigate("auth", { mode: "login" });
                  setOpen(false);
                }}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-start text-sm font-normal transition-colors text-[var(--text)] hover:bg-[var(--tint)]"
              >
                <LogIn className="h-4 w-4" />
                <span>{isAr ? "تسجيل الدخول" : "Log in"}</span>
              </button>
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-[var(--edge)] px-4 py-3 text-center text-xs font-normal text-[var(--muted-foreground)]">
            <p>© {new Date().getFullYear()} Alkemos</p>
          </div>
        </aside>
      </div>
    </>
  );
}
