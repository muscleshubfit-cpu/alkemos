"use client";

import { useState, useEffect } from "react";
import { openEvoFloatingChat } from "@/lib/evo-chat-events";
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
  Briefcase,
  ArrowRight,
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
  // Phase 202: which DESKTOP service dropdown is click-opened. Mouse
  // users get the CSS hover path (group-hover); keyboard users get
  // focus-within; touch users on large screens (hover:none devices —
  // iPad landscape) get this click-toggle path, so every input modality
  // can open the dropdowns.
  const [openMenu, setOpenMenu] = useState<string | null>(null);

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

  // Phase 202: close the click-opened desktop dropdown when clicking
  // (or tapping) anywhere outside the service nav.
  useEffect(() => {
    if (!openMenu) return;
    const onDocPointer = (e: Event) => {
      const target = e.target as HTMLElement | null;
      if (target && !target.closest("[data-service-nav]")) {
        setOpenMenu(null);
      }
    };
    document.addEventListener("click", onDocPointer);
    return () => document.removeEventListener("click", onDocPointer);
  }, [openMenu]);

  // Blog link: admin manages the CMS (/admin/blog); everyone else —
  // including future coach accounts — reads the public blog.
  const blogHref = isAdmin ? "/admin/blog" : isAr ? "/ar/blog" : "/blog";

  // ─── Menu data model (grouped) ─────────────────────────────────────────
  // Phase 202 (owner order 2026-09-15: «Header: اجعل الـNavigation واضحًا
  // للخدمات الأساسية التي يأتي الزائر لاستخدامها: Training / Nutrition /
  // Tools / AI / Coaching، مع تنظيم الخدمات الثانوية مثل For Coaches
  // وAffiliate في مكان مناسب دون أن تهيمن على الواجهة»): the drawer is
  // now organised SERVICE-FIRST (the five core services a visitor comes
  // to USE), and the navbar gained the matching DESKTOP navigation
  // (SERVICE_NAV below). Secondary services (Memberships / Affiliate /
  // For Coaches) live in the slim «More» group + the footer — reachable,
  // never dominant. Legal & basic pages (Privacy, Terms, About, FAQ,
  // Contact) are intentionally NOT in the header — footer only (per
  // Owner directive 2026-08-25).

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

  // Group 2: Training — the training content services (exercises hub,
  // muscle-group hub, equipment hub, programs).
  groups.push({
    id: "training",
    title: isAr ? "التدريب" : "Training",
    items: [
      {
        label: isAr ? "مكتبة التمارين" : "Exercises",
        icon: Dumbbell,
        href: isAr ? "/ar/exercises" : "/exercises",
      },
      {
        label: isAr ? "حسب المجموعة العضلية" : "By Muscle Group",
        icon: Target,
        href: isAr ? "/ar/muscles/chest" : "/muscles/chest",
      },
      // Access-point fix (2026-09-14): the equipment hubs had ZERO nav
      // entries — the sample bodyweight hub joins the drawer (every
      // /equipment/[type] page cross-links the rest).
      {
        label: isAr ? "حسب المعدات" : "By Equipment",
        icon: Dumbbell,
        href: isAr ? "/ar/equipment/bodyweight" : "/equipment/bodyweight",
      },
      {
        label: isAr ? "برامج التدريب" : "Programs",
        icon: ClipboardList,
        href: isAr ? "/ar/programs" : "/programs",
      },
    ],
  });

  // Group 3: Nutrition — the nutrition content services (foods hub,
  // meal planner, ready-made diet plans, collections hub).
  groups.push({
    id: "nutrition",
    title: isAr ? "التغذية" : "Nutrition",
    items: [
      {
        label: isAr ? "مكتبة الأطعمة" : "Foods",
        icon: Utensils,
        href: isAr ? "/ar/foods" : "/foods",
      },
      {
        label: isAr ? "مخطط الوجبات" : "Meal Planner",
        icon: Pizza,
        href: isAr ? "/ar/meal-planner" : "/meal-planner",
      },
      // §12.33: the ready-made diet plans join the content libraries
      // under the owner's name.
      {
        label: isAr ? "مكتبة الخطط الغذائية الجاهزة" : "Diet Plans",
        icon: Pizza,
        href: isAr ? "/ar/diet-plan" : "/diet-plan",
      },
      // Phase SEO-GEO-1 (2026-09-08): the collections hub entry point.
      {
        label: isAr ? "مجموعات الأطعمة" : "Food Collections",
        icon: Pizza,
        href: isAr ? "/ar/collections/high-protein-foods" : "/collections/high-protein-foods",
      },
    ],
  });

  // Group 4: Tools (dropdown — expandable to show the 5 standalone tools
  // + the hub link). The AI planners live in the AI group below (they are
  // AI services — §12.31/§12.32 naming preserved).
  // Per Owner directive 2026-08-25: tools must be a dropdown menu showing
  // all individual tools, NOT a single link to /tools.
  // Access-point fix (2026-09-14): every tool href is now locale-aware.
  groups.push({
    id: "tools",
    title: isAr ? "الأدوات" : "Tools",
    items: [
      {
        label: isAr ? "حاسبة مؤشر كتلة الجسم" : "BMI Calculator",
        icon: Activity,
        href: isAr ? "/ar/tools/bmi-calculator" : "/tools/bmi-calculator",
      },
      {
        label: isAr ? "حاسبة نسبة الدهون" : "Body Fat Calculator",
        icon: Target,
        href: isAr ? "/ar/tools/body-fat-calculator" : "/tools/body-fat-calculator",
      },
      {
        label: isAr ? "حاسبة السعرات" : "Calorie Calculator",
        icon: Calculator,
        href: isAr ? "/ar/tools/calorie-calculator" : "/tools/calorie-calculator",
      },
      {
        label: isAr ? "حاسبة الماكروز" : "Macro Calculator",
        icon: Calculator,
        href: isAr ? "/ar/tools/macro-calculator" : "/tools/macro-calculator",
      },
      {
        label: isAr ? "متتبع شرب الماء" : "Water Tracker",
        icon: Droplet,
        href: isAr ? "/ar/tools/water-tracker" : "/tools/water-tracker",
      },
      {
        label: isAr ? "كل الأدوات" : "All Tools",
        icon: Calculator,
        href: isAr ? "/ar/tools" : "/tools",
      },
    ],
  });

  // Group 5: AI — the AI services (both planners + EVO).
  // ROLE SURFACE LAW: EVO joins Coaching/Memberships in the
  // visitor-facing funnel — staff never see these entries.
  groups.push({
    id: "ai",
    title: isAr ? "الذكاء الاصطناعي" : "AI",
    items: [
      // §12.31: the AI meal planner under its full unified name.
      {
        label: isAr ? "مخطط الوجبات بالذكاء الاصطناعي" : "AI Meal Planner",
        icon: Sparkles,
        href: isAr ? "/ar/ai-meal-planner" : "/ai-meal-planner",
      },
      // §12.32: the AI workout planner.
      {
        label: isAr ? "مخطط التمارين بالذكاء الاصطناعي" : "AI Workout Planner",
        icon: Sparkles,
        href: isAr ? "/ar/ai-workout-planner" : "/ai-workout-planner",
      },
      ...(isCoach
        ? []
        : [
            {
              label: "EVO AI Coach",
              icon: Bot,
              // Phase 216 (P2-2 — owner decision 2026-09-16 «نفّذ الإصلاح»):
              // supersedes the 2026-09-14 freeze — the entry is now
              // language-aware like the logo and the footer (SEO-GEO-6.4).
              href: isAr ? "/ar/evo" : "/evo",
            },
          ]),
    ],
  });

  // Group 6: Coaching — a core service, its own drawer entry.
  // ROLE SURFACE LAW (2026-08-29): hidden from platform staff — the
  // owner/coach must not browse his own sales funnel in the header.
  if (!isCoach) {
    groups.push({
      id: "coaching",
      title: "",
      items: [
        {
          label: isAr ? "الكوتشينج" : "Coaching",
          icon: Users,
          href: isAr ? "/ar/coaching" : "/coaching",
        },
      ],
    });

    // Group 7: More services — the SECONDARY surfaces (Memberships,
    // Affiliate, For Coaches): reachable but never dominant (owner
    // order 2026-09-15). Staff never see the funnel entries.
    groups.push({
      id: "more",
      title: isAr ? "خدمات أخرى" : "More",
      items: [
        {
          label: isAr ? "العضويات" : "Memberships",
          icon: Sparkles,
          href: isAr ? "/ar/memberships" : "/memberships",
        },
        {
          label: isAr ? "برنامج الإفلييت (الشركاء)" : "Affiliate Program",
          icon: Gift,
          // §12.53 item 11 (2026-09-16): locale-aware — AR mirror exists.
          href: isAr ? "/ar/affiliate" : "/affiliate",
        },
        {
          label: isAr ? "للمدربين" : "For Coaches",
          icon: Briefcase,
          href: isAr ? "/ar/for-coaches" : "/for-coaches",
        },
      ],
    });
  }

  // Group 8: Resources — the remaining content verticals (comparisons,
  // blog). The library entries moved into their service groups above.
  groups.push({
    id: "resources",
    title: isAr ? "المحتوى" : "Resources",
    items: [
      // Access-point fix (2026-09-14): the /compare vertical entry.
      {
        label: isAr ? "المقارنات" : "Comparisons",
        icon: LineChart,
        href: isAr ? "/ar/compare" : "/compare",
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

  // ─── DESKTOP SERVICE NAV (Phase 202 — owner order 2026-09-15:
  // «Header: اجعل الـNavigation واضحًا للخدمات الأساسية التي يأتي
  // الزائر لاستخدامها»). The five core services render as visible
  // navbar entries (dropdown for the four families with children, a
  // direct link for Coaching) from lg up; the drawer keeps the FULL
  // menu (including the secondary «More» services) on every size.
  // ROLE SURFACE LAW: Coaching stays hidden from platform staff; EVO
  // keeps its exact /evo path (owner directive 2026-09-14). ───
  const SERVICE_NAV: Array<{
    id: string;
    labelAr: string;
    labelEn: string;
    icon: LucideIcon;
    href?: string;
    items?: Array<{ labelAr: string; labelEn: string; href: string }>;
  }> = [
    {
      id: "training",
      labelAr: "التدريب",
      labelEn: "Training",
      icon: Dumbbell,
      items: [
        { labelAr: "مكتبة التمارين", labelEn: "Exercises", href: isAr ? "/ar/exercises" : "/exercises" },
        { labelAr: "حسب المجموعة العضلية", labelEn: "By Muscle Group", href: isAr ? "/ar/muscles/chest" : "/muscles/chest" },
        { labelAr: "حسب المعدات", labelEn: "By Equipment", href: isAr ? "/ar/equipment/bodyweight" : "/equipment/bodyweight" },
        { labelAr: "برامج التدريب", labelEn: "Programs", href: isAr ? "/ar/programs" : "/programs" },
      ],
    },
    {
      id: "nutrition",
      labelAr: "التغذية",
      labelEn: "Nutrition",
      icon: Utensils,
      items: [
        { labelAr: "مكتبة الأطعمة", labelEn: "Foods", href: isAr ? "/ar/foods" : "/foods" },
        { labelAr: "مخطط الوجبات", labelEn: "Meal Planner", href: isAr ? "/ar/meal-planner" : "/meal-planner" },
        { labelAr: "مكتبة الخطط الغذائية الجاهزة", labelEn: "Diet Plans", href: isAr ? "/ar/diet-plan" : "/diet-plan" },
        { labelAr: "مجموعات الأطعمة", labelEn: "Food Collections", href: isAr ? "/ar/collections/high-protein-foods" : "/collections/high-protein-foods" },
      ],
    },
    {
      id: "tools",
      labelAr: "الأدوات",
      labelEn: "Tools",
      icon: Calculator,
      items: [
        { labelAr: "حاسبة السعرات", labelEn: "Calorie Calculator", href: isAr ? "/ar/tools/calorie-calculator" : "/tools/calorie-calculator" },
        { labelAr: "حاسبة الماكروز", labelEn: "Macro Calculator", href: isAr ? "/ar/tools/macro-calculator" : "/tools/macro-calculator" },
        { labelAr: "حاسبة مؤشر كتلة الجسم", labelEn: "BMI Calculator", href: isAr ? "/ar/tools/bmi-calculator" : "/tools/bmi-calculator" },
        { labelAr: "حاسبة نسبة الدهون", labelEn: "Body Fat Calculator", href: isAr ? "/ar/tools/body-fat-calculator" : "/tools/body-fat-calculator" },
        { labelAr: "متتبع شرب الماء", labelEn: "Water Tracker", href: isAr ? "/ar/tools/water-tracker" : "/tools/water-tracker" },
        { labelAr: "كل الأدوات", labelEn: "All Tools", href: isAr ? "/ar/tools" : "/tools" },
      ],
    },
    {
      id: "ai",
      labelAr: "الذكاء الاصطناعي",
      labelEn: "AI",
      icon: Sparkles,
      items: [
        { labelAr: "مخطط الوجبات بالذكاء الاصطناعي", labelEn: "AI Meal Planner", href: isAr ? "/ar/ai-meal-planner" : "/ai-meal-planner" },
        { labelAr: "مخطط التمارين بالذكاء الاصطناعي", labelEn: "AI Workout Planner", href: isAr ? "/ar/ai-workout-planner" : "/ai-workout-planner" },
        // Phase 216 (P2-2 — owner decision 2026-09-16 «نفّذ الإصلاح»):
        // supersedes the 2026-09-14 freeze — language-aware like the
        // drawer's entry, the logo and the footer (SEO-GEO-6.4).
        { labelAr: "EVO AI Coach", labelEn: "EVO AI Coach", href: isAr ? "/ar/evo" : "/evo" },
      ],
    },
    {
      id: "coaching",
      labelAr: "الكوتشينج",
      labelEn: "Coaching",
      icon: Users,
      href: isAr ? "/ar/coaching" : "/coaching",
    },
  ].filter((section) => section.id !== "coaching" || !isCoach);

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
              theme; tap → home. TPL-BASE: the mark rides the template's
              logo chip (grid h-9 w-9 rounded-xl bg-gradient-to-br
              from-[#ff4d26] to-[#ff9353]) with the wordmark beside it
              — the template's nav lockup. */}
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
              className="group flex items-center gap-2 font-display text-lg font-bold tracking-tight text-[var(--text)] transition-opacity hover:opacity-80"
              aria-label="Alkemos"
            >
              {/* TPL-BASE — the template's logo chip: ember gradient,
                 rounded-xl, mark inside. */}
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-[#ff4d26] to-[#ff9353]">
                <ThemeImg
                  light="/images/brand/mark-helmet-light.png"
                  dark="/images/brand/mark-helmet-dark.png"
                  alt=""
                  width={128}
                  height={128}
                  eager
                  className="h-6 w-6 object-contain"
                />
              </span>
              <span className="hidden sm:inline">Alkemos</span>
            </button>

            {/* DESKTOP SERVICE NAV (Phase 202): the five core services —
                Training / Nutrition / Tools / AI / Coaching — visible
                directly in the navbar from lg up. Dropdowns open on hover
                AND on keyboard focus (focus-within keeps tabbing into the
                panel); the panel wrapper bridges the hover gap (pt-2).
                Logical positioning (start-0) flips correctly under RTL. */}
            <nav
              aria-label={isAr ? "خدمات المنصة" : "Platform services"}
              data-service-nav
              className="ms-2 hidden items-center gap-1 lg:flex"
            >
              {SERVICE_NAV.map((section) => {
                const Icon = section.icon;
                if (section.items) {
                  return (
                    <div key={section.id} className="relative group">
                      {/* VRD-V2 §12: +2px item padding (12→14px) — the
                          VLM pass read the 14px labels as «cramped»
                          against the 64px navbar; label size itself is
                          already 14px (text-sm) and stays. */}
                      <button
                        type="button"
                        aria-haspopup="menu"
                        aria-expanded={openMenu === section.id}
                        onClick={() =>
                          setOpenMenu((prev) => (prev === section.id ? null : section.id))
                        }
                        className="flex items-center gap-1.5 rounded-full px-3.5 py-2 text-sm font-medium text-[color-mix(in_srgb,var(--text)_70%,transparent)] transition-colors hover:text-[var(--text)]"
                      >
                        {isAr ? section.labelAr : section.labelEn}
                        <ChevronDown
                          className="h-3.5 w-3.5 opacity-50 transition-transform duration-200 group-hover:rotate-180 group-focus-within:rotate-180"
                          aria-hidden="true"
                        />
                      </button>
                      {/* Dropdown panel — part of the hover group; the pt-2
                          bridge keeps it open while the pointer moves from
                          the button to the panel. Three open paths: mouse
                          hover (group-hover), keyboard (focus-within), and
                          the click-toggle (openMenu) for hover:none touch
                          screens — see the state above. */}
                      <div
                        className={cn(
                          "absolute start-0 top-full z-50 min-w-[15rem] pt-2 transition-all duration-150 group-focus-within:visible group-focus-within:opacity-100 group-hover:visible group-hover:opacity-100",
                          openMenu === section.id ? "visible opacity-100" : "invisible opacity-0",
                        )}
                      >
                        <div
                          className="rounded-xl border bg-[var(--bg)] p-2 shadow-2xl"
                          style={{ borderColor: "var(--edge)" }}
                          role="menu"
                          aria-label={isAr ? section.labelAr : section.labelEn}
                        >
                          {section.items.map((item) => (
                            <a
                              key={item.href + item.labelEn}
                              href={item.href}
                              role="menuitem"
                              onClick={() => setOpenMenu(null)}
                              className="flex items-center justify-between gap-3 rounded-lg px-3 py-2 text-sm font-normal text-[var(--text)] transition-colors hover:bg-[var(--tint)]"
                            >
                              <span className="flex-1 truncate">{isAr ? item.labelAr : item.labelEn}</span>
                              <ChevronRight className="h-4 w-4 shrink-0 opacity-30 rtl:rotate-180" aria-hidden="true" />
                            </a>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                }
                return (
                  <a
                    key={section.id}
                    href={section.href}
                    className="flex items-center gap-1.5 rounded-full px-3.5 py-2 text-sm font-medium text-[color-mix(in_srgb,var(--text)_70%,transparent)] transition-colors hover:text-[var(--text)]"
                  >
                    {isAr ? section.labelAr : section.labelEn}
                  </a>
                );
              })}
            </nav>
          </div>

          {/* End side: template CTA + theme + language + notifications +
              account — Phase 138 tidy: ALL utility buttons grouped here,
              uniformly sized. TPL-BASE: the landing variant gains the
              template's nav pill (white bg → acid hover, arrow nudge) as
              the “Book 7-day trial” analog: guests get «Start free» →
              signup; members get their console. The app variant stays
              navigation-only (its surfaces already own their CTAs). */}
          <div className="flex items-center gap-2 md:gap-3">
            {variant === "landing" && (
              <a
                href={isLoggedIn ? accountHref : "/auth?mode=signup"}
                className="group hidden items-center gap-2 rounded-full bg-[var(--text)] px-4 py-2 text-sm font-semibold text-[var(--bg)] transition-colors hover:bg-[#d7ff4d] hover:text-[#1a0e0a] md:inline-flex"
              >
                {isLoggedIn
                  ? isAr ? "لوحتك" : "Your dashboard"
                  : isAr ? "ابدأ مجانًا" : "Start free"}
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 rtl:rotate-180 rtl:group-hover:-translate-x-0.5" aria-hidden="true" />
              </a>
            )}

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
