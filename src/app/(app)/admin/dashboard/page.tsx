"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useI18n } from "@/lib/i18n";
import {
  getAdminClientsStats,
  listSubscriptionRequests,
  sumSubscriptionRequestsByStatus,
  type AdminClientsStats,
} from "@/lib/data";
import { PageHeader, StatTile, fmtMoney, fmtNum } from "@/components/admin/ui";

/**
 * ADMIN DASHBOARD (/admin/dashboard) — Phase 246 reorganization
 * (owner: «داش بورد الادمن محتاج اعاده تنظيم وتحسين وعدم تكرار — ابتكر
 * أفضل حل يكون مريح ومنظم»).
 *
 * What changed and why:
 * - ONE canonical source per number. The clients tile used to read
 *   get_coach_client_stats (role='client' only) while /admin/clients showed
 *   get_admin_clients_stats (every profile) — two different metrics under
 *   one label family (owner bug: dashboard count ≠ table count). The
 *   dashboard now reads getAdminClientsStats() — the SAME RPC the clients
 *   page uses — so the totals match BY DEFINITION, with the honest
 *   clients/coaches breakdown in the tile's sub-line.
 * - A "needs attention" strip: the two live queues (pending payments,
 *   page reviews) surface as actionable cards ONLY when non-zero — the
 *   comfortable default is silence, not a permanent orange tile.
 * - KPIs grouped by domain (accounts / subscriptions / money) instead of
 *   one undifferentiated strip of six.
 * - Revenue sums ride the shared pure subscription-sums helper (the same
 *   reduce was duplicated here and on /admin/finances).
 * - Quick actions stay the four daily ones (Phase 142 law: the sidebar is
 *   the single complete map — never a second copy of it).
 *
 * All counters are best-effort — a failing source hides its tile, never
 * breaks the page.
 */

type QuickCard = { href: string; emoji: string; ar: string; en: string };

const QUICK: { ar: string; en: string; cards: QuickCard[] }[] = [
  {
    ar: "الإجراءات اليومية",
    en: "Daily actions",
    cards: [
      // Phase 103: members + accounts merged into /admin/clients
      { href: "/admin/clients", emoji: "👥", ar: "جدول العملاء", en: "Clients table" },
      { href: "/admin/payments", emoji: "💳", ar: "طلبات العضويات", en: "Membership requests" },
      { href: "/admin/coach-pages", emoji: "🗂️", ar: "مراجعة الصفحات", en: "Page reviews" },
      { href: "/admin/finances", emoji: "💰", ar: "المالية", en: "Finances" },
    ],
  },
];

export default function AdminDashboardPage() {
  const { lang } = useI18n();
  const isAr = lang === "ar";
  const [stats, setStats] = useState<AdminClientsStats | null>(null);
  const [pendingPages, setPendingPages] = useState<number | null>(null);
  const [revenueApproved, setRevenueApproved] = useState<number | null>(null);
  const [revenuePending, setRevenuePending] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        // Phase 246: getAdminClientsStats — the clients page's own RPC —
        // replaces getCoachClientStats (the coach-scoped lens that made
        // this page disagree with the clients table).
        const [st, pagesRes, reqs] = await Promise.all([
          getAdminClientsStats(),
          fetch("/api/admin/coach-pages").catch(() => null),
          listSubscriptionRequests("all"),
        ]);
        if (cancelled) return;
        setStats(st);
        if (pagesRes && pagesRes.ok) {
          const data = await pagesRes.json();
          if (data?.counts) setPendingPages(Number(data.counts.pending) || 0);
        }
        setRevenueApproved(sumSubscriptionRequestsByStatus(reqs, "approved"));
        setRevenuePending(sumSubscriptionRequestsByStatus(reqs, "pending"));
      } catch {
        /* tiles stay hidden */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const accountsSub = stats
    ? isAr
      ? `منهم ${fmtNum(stats.member_site + stats.client_of_coach, isAr)} عميل · ${fmtNum(stats.coach_site + stats.coach_b2b, isAr)} مدرب`
      : `${fmtNum(stats.member_site + stats.client_of_coach, isAr)} clients · ${fmtNum(stats.coach_site + stats.coach_b2b, isAr)} coaches`
    : undefined;
  const pendingPayments = stats?.pending_payment ?? 0;
  const needsAttention = pendingPayments > 0 || (pendingPages ?? 0) > 0;

  return (
    <div className="space-y-8">
      <PageHeader
        title={isAr ? "الرئيسية" : "Dashboard"}
        sub={
          isAr
            ? "الأرقام المصنفة بمصدر واحد لكل رقم — والتنقل الكامل من القائمة الجانبية."
            : "Grouped numbers, one source per metric — full navigation lives in the sidebar."
        }
      />

      {/* Needs-attention strip — the two live queues, ONLY when non-zero */}
      {needsAttention && (
        <div className="grid gap-3 sm:grid-cols-2">
          {pendingPayments > 0 && (
            <Link
              href="/admin/payments"
              className="group flex items-center justify-between gap-3 rounded-2xl border border-[#ff9500]/30 bg-[#ff9500]/[0.06] p-4 transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/5"
            >
              <span className="flex items-center gap-3">
                <span className="text-2xl">⏳</span>
                <span>
                  <span className="block font-medium">
                    {isAr ? "طلبات دفع بانتظار المراجعة" : "Payments awaiting review"}
                  </span>
                  <span className="text-xs text-[#6e6e73]">
                    {isAr ? "إيصالات رفعها عملاء الموقع" : "Site members' payment receipts"}
                  </span>
                </span>
              </span>
              <span className="flex items-center gap-2">
                <span className="rounded-full bg-[#ff9500]/15 px-3 py-1 text-sm font-semibold text-[#c77700]">
                  {fmtNum(pendingPayments, isAr)}
                </span>
                <span className="text-[#6e6e73] transition-transform group-hover:translate-x-0.5 rtl:rotate-180">
                  ›
                </span>
              </span>
            </Link>
          )}
          {(pendingPages ?? 0) > 0 && (
            <Link
              href="/admin/coach-pages"
              className="group flex items-center justify-between gap-3 rounded-2xl border border-[#ff9500]/30 bg-[#ff9500]/[0.06] p-4 transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/5"
            >
              <span className="flex items-center gap-3">
                <span className="text-2xl">🗂️</span>
                <span>
                  <span className="block font-medium">
                    {isAr ? "صفحات مدربين بانتظار المراجعة" : "Coach pages awaiting review"}
                  </span>
                  <span className="text-xs text-[#6e6e73]">
                    {isAr ? "إقرار أو رفض من قائمة المراجعة" : "Approve or reject from the queue"}
                  </span>
                </span>
              </span>
              <span className="flex items-center gap-2">
                <span className="rounded-full bg-[#ff9500]/15 px-3 py-1 text-sm font-semibold text-[#c77700]">
                  {fmtNum(pendingPages ?? 0, isAr)}
                </span>
                <span className="text-[#6e6e73] transition-transform group-hover:translate-x-0.5 rtl:rotate-180">
                  ›
                </span>
              </span>
            </Link>
          )}
        </div>
      )}

      {/* KPI groups — one canonical source per number */}
      <div className="space-y-6">
        <section className="space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-[#6e6e73]">
            {isAr ? "الحسابات" : "Accounts"}
          </h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <StatTile
              label={isAr ? "إجمالي الحسابات" : "Total accounts"}
              value={stats ? fmtNum(stats.total, isAr) : null}
              sub={accountsSub}
              href="/admin/clients"
            />
            <StatTile
              label={isAr ? "العملاء" : "Clients"}
              value={stats ? fmtNum(stats.member_site + stats.client_of_coach, isAr) : null}
              href="/admin/clients"
            />
            <StatTile
              label={isAr ? "المدربون" : "Coaches"}
              value={stats ? fmtNum(stats.coach_site + stats.coach_b2b, isAr) : null}
              href="/admin/coaches"
            />
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-[#6e6e73]">
            {isAr ? "الاشتراكات" : "Subscriptions"}
          </h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <StatTile
              label={isAr ? "اشتراكات نشطة" : "Active subs"}
              value={stats ? fmtNum(stats.active, isAr) : null}
              tone="green"
              href="/admin/clients"
            />
            <StatTile
              label={isAr ? "تنتهي خلال أسبوعين" : "Expiring in 2 weeks"}
              value={stats ? fmtNum(stats.expiring, isAr) : null}
              tone="orange"
              href="/admin/clients"
            />
            <StatTile
              label={isAr ? "اشتراكات منتهية" : "Expired subs"}
              value={stats ? fmtNum(stats.expired, isAr) : null}
              tone="red"
              href="/admin/clients"
            />
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-[#6e6e73]">
            {isAr ? "المالية" : "Money"}
          </h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <StatTile
              label={isAr ? "إيرادات معتمدة" : "Approved revenue"}
              value={revenueApproved !== null ? fmtMoney(revenueApproved) : null}
              sub={
                revenuePending !== null && revenuePending > 0
                  ? isAr
                    ? `${fmtMoney(revenuePending)} معلّقة`
                    : `${fmtMoney(revenuePending)} pending`
                  : undefined
              }
              tone="blue"
              href="/admin/finances"
            />
          </div>
        </section>
      </div>

      {/* Compact quick actions — the sidebar carries the full map */}
      <div className="space-y-6">
        {QUICK.map((group) => (
          <section key={group.en} className="space-y-3">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-[#6e6e73]">
              {isAr ? group.ar : group.en}
            </h2>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {group.cards.map((card) => (
                <Link
                  key={card.href}
                  href={card.href}
                  className="group flex items-center gap-3 rounded-2xl border border-[#d2d2d7] bg-white p-4 transition-all hover:-translate-y-0.5 hover:border-[#1d1d1f]/40 hover:shadow-lg hover:shadow-black/5"
                >
                  <span className="text-2xl">{card.emoji}</span>
                  <span className="font-medium">{isAr ? card.ar : card.en}</span>
                  <span className="ms-auto text-[#6e6e73] transition-transform group-hover:translate-x-0.5 rtl:rotate-180">
                    ›
                  </span>
                </Link>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
