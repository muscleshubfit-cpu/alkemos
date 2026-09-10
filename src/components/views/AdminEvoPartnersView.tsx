"use client";

import { useCallback, useEffect, useState } from "react";
import { useI18n } from "@/lib/i18n";
import { toast } from "sonner";
import { Loader2, Plus, RefreshCw, Copy, KeyRound, Activity } from "lucide-react";

/**
 * AdminEvoPartnersView — EVO-6 (W6) «شركاء EVO»: issue and manage the
 * partner API keys behind /api/evo/v1/chat + the one-line embed widget.
 *
 * Phone-first honesty laws (the owner manages this from a phone):
 * - The RAW key is shown ONCE in a copy-friendly modal with an explicit
 *   warning — it is never retrievable again (hash-only storage, 0082).
 * - The embed one-liner is shown per key with a one-tap copy.
 * - Deactivation is a toggle (UPDATE is_active), never a delete.
 * - Theme fields are the four safe surfaces: accent color, https logo
 *   URL, AR/EN greeting — everything is re-validated server-side.
 */

type PartnerKey = {
  id: string;
  partner_name: string;
  key_prefix: string;
  theme: Record<string, unknown> | null;
  monthly_quota: number;
  is_active: boolean;
  notes: string | null;
  created_at: string;
  usage: { monthSuccess: number; d30Success: number; d30Total: number };
};

type NewKeyPayload = { key: PartnerKey; raw_key: string };

export function AdminEvoPartnersView() {
  const { lang } = useI18n();
  const isAr = lang === "ar";

  const [keys, setKeys] = useState<PartnerKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [nameInput, setNameInput] = useState("");
  const [quotaInput, setQuotaInput] = useState("1000");
  const [accentInput, setAccentInput] = useState("#0071e3");
  const [logoInput, setLogoInput] = useState("");
  const [greetingArInput, setGreetingArInput] = useState("");
  const [greetingEnInput, setGreetingEnInput] = useState("");
  const [oneTime, setOneTime] = useState<NewKeyPayload | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/evo-partners");
      const data = await res.json();
      if (res.ok) setKeys(data.keys ?? []);
      else toast.error(data.error ?? "Failed to load keys");
    } catch {
      toast.error(isAr ? "تعذر التحميل" : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, [isAr]);

  useEffect(() => {
    load();
  }, [load]);

  const copy = (text: string, okAr: string, okEn: string) => {
    navigator.clipboard
      .writeText(text)
      .then(() => toast.success(isAr ? okAr : okEn))
      .catch(() => toast.error(isAr ? "تعذر النسخ" : "Copy failed"));
  };

  const createKey = async () => {
    if (creating) return;
    setCreating(true);
    try {
      const theme: Record<string, string> = {};
      if (accentInput.trim()) theme.accent = accentInput.trim();
      if (logoInput.trim()) theme.logo_url = logoInput.trim();
      if (greetingArInput.trim()) theme.greeting_ar = greetingArInput.trim();
      if (greetingEnInput.trim()) theme.greeting_en = greetingEnInput.trim();
      const res = await fetch("/api/admin/evo-partners", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          partner_name: nameInput,
          monthly_quota: Number(quotaInput) || 1000,
          theme,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Create failed");
        return;
      }
      setOneTime(data as NewKeyPayload);
      setShowCreate(false);
      setNameInput("");
      setQuotaInput("1000");
      setAccentInput("#0071e3");
      setLogoInput("");
      setGreetingArInput("");
      setGreetingEnInput("");
      load();
    } finally {
      setCreating(false);
    }
  };

  const patchKey = async (id: string, patch: Record<string, unknown>) => {
    setBusyId(id);
    try {
      const res = await fetch("/api/admin/evo-partners", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, ...patch }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Update failed");
        return;
      }
      toast.success(isAr ? "تم التحديث" : "Updated");
      load();
    } finally {
      setBusyId(null);
    }
  };

  const embedLine = (raw: string) =>
    `<script src="https://alkemos.com/embed/evo.js" data-key="${raw}"></script>`;

  return (
    <div className="space-y-6" dir={isAr ? "rtl" : "ltr"}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold">
            {isAr ? "شركاء EVO" : "EVO partners"}
          </h1>
          <p className="text-sm text-[var(--muted-foreground)]">
            {isAr
              ? "مفاتيح API وويدجت التضمين لكل شريك — المفتاح الخام يظهر مرة واحدة فقط عند الإنشاء."
              : "Partner API keys + embed widgets — the raw key is shown ONCE at creation."}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={load}
            className="grid h-9 w-9 place-items-center rounded-full border border-[var(--edge)]"
            aria-label={isAr ? "تحديث" : "Refresh"}
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
          </button>
          <button
            onClick={() => setShowCreate((v) => !v)}
            className="flex items-center gap-1.5 rounded-full bg-[#0071e3] px-4 py-2 text-sm font-medium text-white"
          >
            <Plus className="h-4 w-4" />
            {isAr ? "مفتاح جديد" : "New key"}
          </button>
        </div>
      </div>

      {showCreate && (
        <div className="space-y-3 rounded-2xl border border-[var(--edge)] p-4">
          <div className="grid gap-3 md:grid-cols-2">
            <label className="block text-sm">
              <span className="mb-1 block font-medium">
                {isAr ? "اسم الشريك *" : "Partner name *"}
              </span>
              <input
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                className="w-full rounded-lg border border-[var(--edge)] bg-transparent px-3 py-2 text-sm"
                maxLength={120}
              />
            </label>
            <label className="block text-sm">
              <span className="mb-1 block font-medium">
                {isAr ? "الحصة الشهرية (رسائل)" : "Monthly quota (messages)"}
              </span>
              <input
                value={quotaInput}
                onChange={(e) => setQuotaInput(e.target.value.replace(/\D/g, ""))}
                inputMode="numeric"
                className="w-full rounded-lg border border-[var(--edge)] bg-transparent px-3 py-2 text-sm"
              />
            </label>
            <label className="block text-sm">
              <span className="mb-1 block font-medium">
                {isAr ? "لون الهوية (#hex)" : "Accent color (#hex)"}
              </span>
              <input
                value={accentInput}
                onChange={(e) => setAccentInput(e.target.value)}
                className="w-full rounded-lg border border-[var(--edge)] bg-transparent px-3 py-2 text-sm"
                placeholder="#0071e3"
              />
            </label>
            <label className="block text-sm">
              <span className="mb-1 block font-medium">
                {isAr ? "شعار الشريك (رابط https)" : "Partner logo (https URL)"}
              </span>
              <input
                value={logoInput}
                onChange={(e) => setLogoInput(e.target.value)}
                className="w-full rounded-lg border border-[var(--edge)] bg-transparent px-3 py-2 text-sm"
                placeholder="https://…"
                dir="ltr"
              />
            </label>
            <label className="block text-sm">
              <span className="mb-1 block font-medium">
                {isAr ? "رسالة الترحيب (عربي)" : "Greeting (Arabic)"}
              </span>
              <input
                value={greetingArInput}
                onChange={(e) => setGreetingArInput(e.target.value)}
                className="w-full rounded-lg border border-[var(--edge)] bg-transparent px-3 py-2 text-sm"
                maxLength={300}
              />
            </label>
            <label className="block text-sm">
              <span className="mb-1 block font-medium">
                {isAr ? "رسالة الترحيب (إنجليزي)" : "Greeting (English)"}
              </span>
              <input
                value={greetingEnInput}
                onChange={(e) => setGreetingEnInput(e.target.value)}
                className="w-full rounded-lg border border-[var(--edge)] bg-transparent px-3 py-2 text-sm"
                maxLength={300}
              />
            </label>
          </div>
          <button
            onClick={createKey}
            disabled={creating || nameInput.trim().length < 2}
            className="flex items-center gap-2 rounded-full bg-[#34c759] px-5 py-2 text-sm font-semibold text-white disabled:opacity-40"
          >
            {creating && <Loader2 className="h-4 w-4 animate-spin" />}
            {isAr ? "أنشئ المفتاح" : "Create key"}
          </button>
        </div>
      )}

      {loading && keys.length === 0 ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-[var(--muted-foreground)]" />
        </div>
      ) : keys.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[var(--edge)] p-8 text-center text-sm text-[var(--muted-foreground)]">
          {isAr
            ? "لا مفاتيح بعد — أنشئ أول مفتاح شريك."
            : "No keys yet — create the first partner key."}
        </div>
      ) : (
        <div className="space-y-4">
          {keys.map((k) => {
            const pct = Math.min(
              100,
              Math.round((k.usage.monthSuccess / Math.max(1, k.monthly_quota)) * 100),
            );
            return (
              <div
                key={k.id}
                className="space-y-3 rounded-2xl border border-[var(--edge)] p-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <KeyRound className="h-4 w-4 text-[#0071e3]" />
                    <span className="font-semibold">{k.partner_name}</span>
                    <code
                      className="rounded bg-black/5 px-1.5 py-0.5 text-[11px]"
                      dir="ltr"
                    >
                      {k.key_prefix}…
                    </code>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${
                        k.is_active
                          ? "bg-[#34c759]/15 text-[#34c759]"
                          : "bg-black/10 text-[var(--muted-foreground)]"
                      }`}
                    >
                      {k.is_active
                        ? isAr
                          ? "مفعّل"
                          : "Active"
                        : isAr
                          ? "موقوف"
                          : "Disabled"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() =>
                        patchKey(k.id, { is_active: !k.is_active })
                      }
                      disabled={busyId === k.id}
                      className="rounded-full border border-[var(--edge)] px-3 py-1.5 text-xs font-medium"
                    >
                      {busyId === k.id
                        ? "…"
                        : k.is_active
                          ? isAr
                            ? "إيقاف"
                            : "Disable"
                          : isAr
                            ? "تفعيل"
                            : "Enable"}
                    </button>
                  </div>
                </div>

                {/* Quota meter — current UTC month successes vs quota */}
                <div>
                  <div className="mb-1 flex items-center justify-between text-[11px] text-[var(--muted-foreground)]">
                    <span className="flex items-center gap-1">
                      <Activity className="h-3 w-3" />
                      {isAr
                        ? `${k.usage.monthSuccess} رسالة هذا الشهر من ${k.monthly_quota}`
                        : `${k.usage.monthSuccess} / ${k.monthly_quota} messages this month`}
                    </span>
                    <span dir="ltr">
                      {isAr
                        ? `30 يوم: ${k.usage.d30Success} ناجح / ${k.usage.d30Total} محاولة`
                        : `30d: ${k.usage.d30Success} ok / ${k.usage.d30Total} total`}
                    </span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-black/10">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${pct}%`,
                        backgroundColor: pct >= 100 ? "#ff3b30" : "#0071e3",
                      }}
                    />
                  </div>
                </div>

                {/* Embed line — the one-tap deliverable (needs the raw key,
                    which only exists at creation; prefix-only reminder here) */}
                <div className="rounded-xl bg-black/5 p-3 text-xs">
                  <div className="mb-1 font-medium">
                    {isAr ? "سطر التضمين (بالمفتاح الخام من لحظة الإنشاء):" : "Embed line (with the raw key from creation):"}
                  </div>
                  <code dir="ltr" className="break-all">
                    {embedLine(k.key_prefix + "••••••••••••••••••••••••")}
                  </code>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ONE-TIME raw key modal */}
      {oneTime && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md space-y-4 rounded-2xl bg-[var(--bg)] p-5">
            <div className="text-lg font-bold">
              {isAr ? "المفتاح الخام — يظهر مرة واحدة فقط" : "Raw key — shown ONCE only"}
            </div>
            <p className="text-sm text-[var(--muted-foreground)]">
              {isAr
                ? "انسخه الآن واحفظه بأمان — لن نتمكن من عرضه مرة أخرى (المخزن هاش فقط)."
                : "Copy it now and store it safely — it cannot be shown again (we store the hash only)."}
            </p>
            <code
              dir="ltr"
              className="block break-all rounded-xl bg-black/5 p-3 text-sm"
            >
              {oneTime.raw_key}
            </code>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() =>
                  copy(
                    oneTime.raw_key,
                    "تم نسخ المفتاح",
                    "Key copied",
                  )
                }
                className="flex items-center gap-1.5 rounded-full bg-[#0071e3] px-4 py-2 text-sm font-medium text-white"
              >
                <Copy className="h-4 w-4" />
                {isAr ? "نسخ المفتاح" : "Copy key"}
              </button>
              <button
                onClick={() =>
                  copy(
                    embedLine(oneTime.raw_key),
                    "تم نسخ سطر التضمين",
                    "Embed line copied",
                  )
                }
                className="flex items-center gap-1.5 rounded-full border border-[var(--edge)] px-4 py-2 text-sm font-medium"
              >
                <Copy className="h-4 w-4" />
                {isAr ? "نسخ سطر التضمين كاملًا" : "Copy full embed line"}
              </button>
              <button
                onClick={() => setOneTime(null)}
                className="rounded-full bg-[#34c759] px-4 py-2 text-sm font-semibold text-white"
              >
                {isAr ? "حفظت — إغلاق" : "Saved — close"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
