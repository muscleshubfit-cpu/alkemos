"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useI18n } from "@/lib/i18n";
import {
  getAdminClientsPaged,
  getAdminClientsStats,
  type AdminClientsStats,
} from "@/lib/data";
import { MEMBERSHIPS } from "@/lib/memberships";
import { getTier, type TierId } from "@/lib/plans";
import { Pagination } from "@/components/Pagination";
import { FlaskConical } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  PageHeader,
  StatTile,
  MemberStatusBadge,
  TierBadge,
  SegmentedTabs,
  EmptyState,
  memberStatus,
  fmtNum,
} from "@/components/admin/ui";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

/**
 * UNIFIED ADMIN CLIENTS PAGE (/admin/clients) — Phase 103 (0067).
 *
 * Owner directive: «الاعضاء/ الحسابات / ادارة العملاء الكاملة : كلهم نفس
 * الغرض مفروض صفحة واحده تشمل كل دول» + «العملاء تشمل جميع عملاء الموقع
 * ومنهم مدربين b2b وعملائهم مع ازرار تصفيه تحديد نوع العملاء».
 *
 * ONE surface that merges what used to live in three places:
 *   - /admin/members (membership lifecycle table — role='client' only)
 *   - /admin/accounts (every account + test-mark + delete tools)
 *   - the /coach admin-mode listing (the old dashboard — links removed)
 *
 * Data: get_admin_clients_paged (0067 + 0068 type fix) — EVERY profile
 * (clients, B2B coaches, site coaches, admins) with membership lifecycle +
 * B2B coach + site-coach follow-up + coach_kind + test flag. 0068 law: a
 * client is «عميل مدرب B2B» only when his assignment targets a real coach
 * — the 0030A admin auto-assignment is «متابعة الإدارة» (member_site),
 * NOT a B2B relation. Type filter buttons are the owner's customer-type
 * split; lifecycle tabs / tier / test / sort /
 * search mirror the members page.
 *
 * Phase 143 (owner: «الضغط فى اى مكان فى صف العميل يفتح ادارة العميل
 * (كانت تعمل من قبل واختفت) والغى زر تعليم تجريبى وزر مسح»):
 * the WHOLE client row opens /coach/<id> — the same Phase-54 law the
 * coach console has always had, restored here after the Phase-103
 * unification replaced the old admin-mode listing (where it worked).
 * The per-row danger tools (test mark, two-step delete) and the
 * bulk-delete machinery (checkbox column, select-all, floating bar)
 * are REMOVED from this surface by the same directive — the guarded
 * /api/admin/accounts endpoints stay available to admin tooling.
 */

type Row = {
  client_id: string;
  client_full_name: string | null;
  client_email: string | null;
  client_phone: string | null;
  role: string;
  coach_kind: string;
  is_test_account: boolean;
  sub_tier: string | null;
  sub_status: string | null;
  sub_end_date: string | null;
  sub_months: number | null;
  pending_payments: number | null;
  assigned_coach_name: string | null;
  assigned_coach_role: string | null;
  site_coach_name: string | null;
  b2b_clients: number;
  site_members: number;
};

type SortKey = "newest" | "oldest" | "name" | "expiry";
type TypeKey = "all" | "member_site" | "client_of_coach" | "coach_site" | "coach_b2b" | "admin";

const PAGE_SIZES = [25, 50, 100];

export default function AdminClientsPage() {
  const { lang } = useI18n();
  const isAr = lang === "ar";

  const [stats, setStats] = useState<AdminClientsStats | null>(null);
  const [rows, setRows] = useState<Row[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [rpcFailed, setRpcFailed] = useState(false);

  const [type, setType] = useState<TypeKey>("all");
  const [tab, setTab] = useState("all");
  const [test, setTest] = useState("all");
  const [sort, setSort] = useState<SortKey>("newest");
  const [search, setSearch] = useState("");
  const [debounced, setDebounced] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Phase 143: whole-row navigation — client rows open the deep manager.
  const router = useRouter();

  // Debounce search so typing does not hammer the RPC.
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setDebounced(search.trim());
      setPage(1);
    }, 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [search]);

  const loadStats = useCallback(async () => {
    getAdminClientsStats().then((s) => {
      if (s) setStats(s);
    });
  }, []);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getAdminClientsPaged({
        limit: pageSize,
        offset: (page - 1) * pageSize,
        search: debounced,
        filter: tab,
        type,
        test,
        sort,
      });
      if (data === null) {
        setRpcFailed(true);
        setRows([]);
        setTotal(0);
      } else {
        setRpcFailed(false);
        setRows(data as unknown as Row[]);
        const first = (data as unknown as Array<Row & { total_count?: number | string }>)[0];
        const t = Number(first?.total_count ?? 0);
        setTotal(Number.isFinite(t) ? t : data.length);
      }
    } finally {
      setLoading(false);
    }
  }, [pageSize, page, debounced, tab, type, test, sort]);

  useEffect(() => {
    load();
  }, [load]);

  /* ── Type labels & badges ─────────────────────────────────── */

  const typeOf = (r: Row): TypeKey => {
    if (r.role === "admin") return "admin";
    if (r.role === "coach") return r.coach_kind === "site" ? "coach_site" : "coach_b2b";
    // 0068: a client is a «B2B coach client» only when the assignment
    // targets a real coach — the 0030A admin auto-assignment (every site
    // member is followed by the admin) is NOT a B2B relation.
    return r.assigned_coach_role === "coach" ? "client_of_coach" : "member_site";
  };

  const typeBadge = (r: Row) => {
    const t = typeOf(r);
    if (t === "admin")
      return { cls: "bg-[#0071e3]/10 text-[#0071e3]", label: isAr ? "أدمن" : "Admin" };
    if (t === "coach_site")
      return { cls: "bg-[#8b5cf6]/10 text-[#8b5cf6]", label: isAr ? "مدرب موقع" : "Site coach" };
    if (t === "coach_b2b")
      return { cls: "bg-[#8b5cf6]/10 text-[#8b5cf6]", label: isAr ? "مدرب B2B" : "B2B coach" };
    if (t === "client_of_coach")
      return {
        cls: "bg-[#6e6e73]/10 text-[#6e6e73]",
        label: isAr ? "عميل مدرب B2B" : "B2B coach client",
      };
    return { cls: "bg-[#34c759]/10 text-[#34c759]", label: isAr ? "عضو الموقع" : "Site member" };
  };

  /* ── Filter option lists ──────────────────────────────────── */

  const tierLabel = (tier: string | null | undefined) => {
    if (!tier) return "—";
    const m = MEMBERSHIPS.find((x) => x.id === tier);
    if (m) return isAr ? m.nameAr : m.nameEn;
    const legacy = getTier(tier as TierId);
    return legacy ? legacy.id : tier;
  };

  const typeButtons: { key: TypeKey; label: string; count: number | null }[] = [
    { key: "all", label: isAr ? "الكل" : "All", count: stats?.total ?? null },
    { key: "member_site", label: isAr ? "أعضاء الموقع" : "Site members", count: stats?.member_site ?? null },
    { key: "client_of_coach", label: isAr ? "عملاء مدربي B2B" : "B2B clients", count: stats?.client_of_coach ?? null },
    { key: "coach_site", label: isAr ? "مدربو الموقع" : "Site coaches", count: stats?.coach_site ?? null },
    { key: "coach_b2b", label: isAr ? "مدربو B2B" : "B2B coaches", count: stats?.coach_b2b ?? null },
    { key: "admin", label: isAr ? "الإدارة" : "Admins", count: stats?.admin_count ?? null },
  ];

  const tabs = [
    { key: "all", label: isAr ? "كل الحالات" : "All statuses", count: null },
    { key: "active", label: isAr ? "نشط" : "Active", count: stats?.active ?? null },
    { key: "expiring", label: isAr ? "ينتهي قريباً" : "Expiring", count: stats?.expiring ?? null },
    { key: "expired", label: isAr ? "منتهي" : "Expired", count: stats?.expired ?? null },
    {
      key: "pending_payment",
      label: isAr ? "بانتظار الدفع" : "Awaiting payment",
      count: stats?.pending_payment ?? null,
    },
    { key: "no_plan", label: isAr ? "بدون اشتراك" : "No subscription", count: null },
  ];

  const sortOptions: { key: SortKey; label: string }[] = [
    { key: "newest", label: isAr ? "الأحدث تسجيلاً" : "Newest" },
    { key: "oldest", label: isAr ? "الأقدم تسجيلاً" : "Oldest" },
    { key: "name", label: isAr ? "الاسم" : "Name" },
    { key: "expiry", label: isAr ? "قرب الانتهاء" : "Expiry" },
  ];

  return (
    <div className="space-y-8">
      <PageHeader
        title={isAr ? "العملاء" : "Clients"}
        sub={
          isAr
            ? "صفحة واحدة لكل الحسابات: أعضاء الموقع ومدربي B2B وعملاءهم ومدربي الموقع والإدارة — بأزرار تصفية للنوع والحالة. اضغط في أي مكان في صف العميل لفتح إدارته الكاملة."
            : "One page for every account: site members, B2B coaches and their clients, site coaches and admins — with type & status filters. Click anywhere on a client row to open his full management page."
        }
      />

      {/* Stats strip */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-6">
        <StatTile label={isAr ? "إجمالي الحسابات" : "Total accounts"} value={stats ? fmtNum(stats.total, isAr) : null} />
        <StatTile label={isAr ? "أعضاء الموقع" : "Site members"} value={stats ? fmtNum(stats.member_site, isAr) : null} tone="green" />
        <StatTile label={isAr ? "عملاء مدربي B2B" : "B2B clients"} value={stats ? fmtNum(stats.client_of_coach, isAr) : null} tone="blue" />
        <StatTile label={isAr ? "اشتراكات نشطة" : "Active subs"} value={stats ? fmtNum(stats.active, isAr) : null} tone="green" />
        <StatTile label={isAr ? "منتهية" : "Expired"} value={stats ? fmtNum(stats.expired, isAr) : null} tone="red" />
        <StatTile label={isAr ? "حسابات تجريبية" : "Test accounts"} value={stats ? fmtNum(stats.test_count, isAr) : null} tone="orange" />
      </div>

      {/* TYPE filter buttons — the owner's customer-type split */}
      <div className="flex flex-wrap gap-2">
        {typeButtons.map((b) => {
          const active = type === b.key;
          return (
            <button
              key={b.key}
              onClick={() => {
                setType(b.key);
                setPage(1);
              }}
              className={cn(
                "inline-flex items-center gap-2 rounded-full border px-4 py-2.5 text-sm font-medium transition-all",
                active
                  ? "border-[#1d1d1f] bg-[#1d1d1f] text-white"
                  : "border-[#d2d2d7] bg-white text-[#1d1d1f] hover:border-[#1d1d1f]/40 hover:bg-[#f5f5f7]",
              )}
            >
              {b.label}
              {b.count !== null && (
                <span
                  className={cn(
                    "rounded-full px-1.5 py-0.5 text-[10px] font-bold",
                    active ? "bg-white/20 text-white" : "bg-[#f5f5f7] text-[#6e6e73]",
                  )}
                >
                  {fmtNum(b.count, isAr)}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Status tabs + tier/test/sort/search */}
      <div className="flex flex-wrap items-center gap-3">
        <SegmentedTabs
          tabs={tabs}
          active={tab}
          onChange={(k) => {
            setTab(k);
            setPage(1);
          }}
        />
        <select
          value={test}
          onChange={(e) => {
            setTest(e.target.value);
            setPage(1);
          }}
          className="rounded-full border border-[#d2d2d7] bg-white px-4 py-2 text-sm font-normal text-[#1d1d1f] outline-none transition-colors hover:bg-[#f5f5f7]"
        >
          <option value="all">{isAr ? "تجريبي وحقيقي" : "Test & real"}</option>
          <option value="test">{isAr ? "تجريبي فقط" : "Test only"}</option>
          <option value="real">{isAr ? "حقيقي فقط" : "Real only"}</option>
        </select>
        <select
          value={sort}
          onChange={(e) => {
            setSort(e.target.value as SortKey);
            setPage(1);
          }}
          className="rounded-full border border-[#d2d2d7] bg-white px-4 py-2 text-sm font-normal text-[#1d1d1f] outline-none transition-colors hover:bg-[#f5f5f7]"
        >
          {sortOptions.map((o) => (
            <option key={o.key} value={o.key}>
              {o.label}
            </option>
          ))}
        </select>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={isAr ? "بحث بالاسم أو البريد أو الهاتف…" : "Search name, email or phone…"}
          className="min-w-52 flex-1 rounded-full border border-[#d2d2d7] bg-white px-4 py-2 text-sm font-normal outline-none transition-colors placeholder:text-[#86868b] focus:border-[#1d1d1f]/40"
        />
      </div>

      {rpcFailed ? (
        <EmptyState
          text={
            isAr
              ? "تعذر تحميل القائمة — خدمة العملاء الموحدة (مايجريشن 0067) لسه ما اتطبقتش على قاعدة البيانات. أول ما تتطبق هتشتغل لوحدها."
              : "Could not load the list — the unified clients service (migration 0067) is not applied yet. It will work automatically once applied."
          }
        />
      ) : loading && rows.length === 0 ? (
        <div className="py-20 text-center text-base font-normal text-[#6e6e73]">
          {isAr ? "جاري التحميل…" : "Loading…"}
        </div>
      ) : rows.length === 0 ? (
        <EmptyState text={isAr ? "مفيش نتائج مطابقة" : "No matching accounts"} />
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-[#f2f2f7]">
          <Table>
            <TableHeader>
              <TableRow className="bg-[#f5f5f7] hover:bg-[#f5f5f7]">
                <TableHead className="text-start">{isAr ? "الحساب" : "Account"}</TableHead>
                <TableHead className="text-start">{isAr ? "النوع" : "Type"}</TableHead>
                <TableHead className="text-start">{isAr ? "الخطة" : "Tier"}</TableHead>
                <TableHead className="text-start">{isAr ? "الحالة" : "Status"}</TableHead>
                <TableHead className="hidden text-start lg:table-cell">
                  {isAr ? "ينتهي في" : "Ends"}
                </TableHead>
                <TableHead className="hidden text-start xl:table-cell">
                  {isAr ? "الكوتش / المتابعة" : "Coach / follow-up"}
                </TableHead>
                <TableHead className="text-start" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((r) => {
                const status = memberStatus(r);
                const badge = typeBadge(r);
                const isCoachRow = r.role === "coach";
                // Phase 143 (owner directive — the same law the coach
                // console has had since Phase 54): clicking ANYWHERE on a
                // client row opens the client manager /coach/<id>. Coach
                // and admin rows stay inert — the deep manager's role
                // gate only serves role='client'.
                const isClientRow = r.role === "client";
                const openClient = () => router.push(`/coach/${r.client_id}`);
                return (
                  <TableRow
                    key={r.client_id}
                    onClick={isClientRow ? openClient : undefined}
                    title={
                      isClientRow
                        ? isAr
                          ? "افتح إدارة العميل"
                          : "Open client manager"
                        : undefined
                    }
                    className={cn(
                      loading && "opacity-50",
                      isClientRow && "cursor-pointer hover:bg-[#f5f5f7]/70",
                    )}
                  >
                    <TableCell>
                      <div className="flex items-center gap-1.5">
                        <p className="font-medium">{r.client_full_name || "—"}</p>
                        {r.is_test_account && (
                          <span className="inline-flex items-center rounded-full bg-[#ff9500]/10 px-1.5 py-0.5 text-[10px] font-bold text-[#ff9500]">
                            <FlaskConical className="h-3 w-3" />
                            {isAr ? "تجريبي" : "test"}
                          </span>
                        )}
                      </div>
                      <p dir="ltr" className="mt-0.5 text-xs text-[#6e6e73]">
                        {r.client_email || r.client_phone || "—"}
                      </p>
                    </TableCell>
                    <TableCell>
                      <span className={cn("inline-block rounded-full px-2.5 py-0.5 text-xs font-medium", badge.cls)}>
                        {badge.label}
                      </span>
                      {isCoachRow && (
                        <p className="mt-1 text-[11px] text-[#86868b]">
                          {isAr
                            ? `B2B: ${fmtNum(r.b2b_clients, isAr)} · متابعة: ${fmtNum(r.site_members, isAr)}`
                            : `B2B: ${r.b2b_clients} · follow-up: ${r.site_members}`}
                        </p>
                      )}
                    </TableCell>
                    <TableCell>
                      <TierBadge tier={r.sub_tier} label={tierLabel(r.sub_tier)} />
                    </TableCell>
                    <TableCell>
                      <MemberStatusBadge status={status} isAr={isAr} />
                    </TableCell>
                    <TableCell className="hidden whitespace-nowrap text-sm text-[#6e6e73] lg:table-cell">
                      {r.sub_end_date
                        ? new Date(r.sub_end_date).toLocaleDateString(isAr ? "ar-EG" : "en-US", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })
                        : "—"}
                    </TableCell>
                    <TableCell className="hidden text-sm text-[#6e6e73] xl:table-cell">
                      {r.role === "client" ? (
                        <>
                          <p>
                            {r.assigned_coach_role === "admin"
                              ? isAr ? "متابعة الإدارة: " : "Admin follow-up: "
                              : isAr ? "كوتش B2B: " : "B2B coach: "}
                            {r.assigned_coach_role
                              ? r.assigned_coach_name || "—"
                              : "—"}
                          </p>
                          <p>{isAr ? "متابعة الموقع: " : "Site follow-up: "}{r.site_coach_name || "—"}</p>
                        </>
                      ) : (
                        "—"
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap items-center justify-end gap-1.5">
                        {/* Phase 143: the chip is the visible affordance of
                            the clickable row — same destination, kept for
                            clarity and middle-click/keyboard access. */}
                        {isClientRow && (
                          <a
                            href={`/coach/${r.client_id}`}
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              router.push(`/coach/${r.client_id}`);
                            }}
                            className="whitespace-nowrap rounded-full bg-[#f5f5f7] px-3 py-1.5 text-xs font-medium text-[#0071e3] transition-colors hover:bg-[#e8e8ed]"
                          >
                            {isAr ? "إدارة كاملة ›" : "Manage ›"}
                          </a>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}

      <Pagination
        page={page}
        pageSize={pageSize}
        total={total}
        onPageChange={(p) => setPage(p)}
        onPageSizeChange={(s) => {
          setPageSize(s);
          setPage(1);
        }}
        sizes={PAGE_SIZES}
        isAr={isAr}
        busy={loading}
      />
    </div>
  );
}
