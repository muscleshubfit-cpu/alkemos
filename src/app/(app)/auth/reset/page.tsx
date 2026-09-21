"use client";

import { Suspense, useState, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useI18n } from "@/lib/i18n";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LanguageToggle } from "@/components/LanguageToggle";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { toast } from "sonner";

/**
 * /auth/reset — I-2 PASSWORD-RESET LANDING (UX-TEST-REPORT-2026-09-21
 * §5-2, owner order «ابدأ التحسينات» 2026-09-22): the SECOND half of the
 * forgot-password flow. «Forgot password?» (AuthView) calls
 * resetPasswordForEmail with redirectTo=/auth/callback?next=/auth/reset —
 * the SAME server route OAuth uses exchanges the PKCE code with the
 * shared cookie strategy and lands here WITH a session; the user sets
 * his new password directly (supabase.auth.updateUser) and goes to his
 * dashboard. No token is ever rendered in a URL the app must parse
 * (detectSessionInUrl=false stays untouched).
 *
 * RECOVERY-LINK-ERROR FIX (2026-09-22, owner live bug report «بعد الضغط
 * على الرابط فتح الموقع مع رسالة خطاء»): when the PKCE exchange fails at
 * /auth/callback — the link is one-time and was already consumed, it
 * expired, or it was opened in a DIFFERENT browser / mail-app WebView
 * than the one that requested it (the verifier cookie lives only in the
 * requesting browser) — the route now lands back HERE with
 * ?recovery_error=1 instead of dumping the user on the homepage with a
 * raw English GoTrue toast. This page renders the honest state: what
 * happened, the three causes, and a «start the recovery again» CTA
 * (same-browser advice included).
 *
 * AUTH-SURFACE NOTE (§7): pre-approved by the owner's «ابدأ التحسينات»
 * order — the report's §5-2 IS the approved spec, H1-2026 precedent
 * (SECURITY.md §9.13/§9.15).
 */

/**
 * RecoveryFailureState — the ?recovery_error=1 landing (see header note).
 * Honest AR/EN copy, no raw GoTrue strings, one clear CTA.
 */
function RecoveryFailureState() {
  const { lang } = useI18n();
  const router = useRouter();
  const isAr = lang === "ar";

  const causes = isAr
    ? [
        "روابط الاستعادة تُستخدم مرة واحدة فقط — وقد استُهلك هذا الرابط (نقرة سابقة أو فاحص روابط في خدمة البريد)",
        "انتهت صلاحية الرابط — روابط الاستعادة قصيرة العمر",
        "فُتح الرابط من متصفح أو تطبيق بريد مختلف عن المتصفح الذي طُلبت منه الاستعادة",
      ]
    : [
        "Recovery links work only once — this one was already consumed (an earlier click or your mail provider's link scanner)",
        "The link expired — recovery links are short-lived",
        "The link was opened in a different browser or mail app than the one you requested the reset from",
      ];

  return (
    <div className="w-full max-w-md px-2">
      <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
        {isAr ? "تعذّر تأكيد رابط الاستعادة" : "We couldn't confirm this recovery link"}
      </h1>
      <p className="mt-2 text-base font-normal text-[var(--muted-foreground)]">
        {isAr
          ? "لا مشكلة — أعد الطلب يستغرق ثوانٍ. الأسباب المحتملة:"
          : "No harm done — request a new link, it takes seconds. Likely causes:"}
      </p>
      <ul className="mt-4 list-disc space-y-2 ps-5 text-sm font-normal text-[var(--muted-foreground)]">
        {causes.map((c) => (
          <li key={c}>{c}</li>
        ))}
      </ul>
      <div className="marble-card mt-6 p-4 text-sm font-normal text-[var(--text)]">
        {isAr
          ? "لضمان نجاح الرابط الجديد: اطلب الاستعادة من نفس المتصفح الذي ستفتح فيه البريد، ثم اضغط الرابط داخل ذلك المتصفح نفسه."
          : "To make the new link work: request the reset from the same browser you'll open the email in, then click the link inside that same browser."}
      </div>
      <button
        type="button"
        onClick={() => router.replace("/auth?mode=login")}
        className="btn-chrome mt-6 w-full px-6 py-3 text-base"
      >
        {isAr ? "ابدأ الاستعادة من جديد" : "Start the recovery again"}
      </button>
    </div>
  );
}

function ResetForm() {
  const { lang, t } = useI18n();
  const router = useRouter();
  const searchParams = useSearchParams();
  const isAr = lang === "ar";

  // RECOVERY-LINK-ERROR FIX: the callback route lands failed recovery
  // attempts HERE — render the honest failure state instead of the form.
  const recoveryFailed = searchParams.get("recovery_error") === "1";

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const busyRef = useRef(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busyRef.current) return;
    if (password.length < 8) {
      toast.error(
        isAr
          ? "كلمة المرور يجب أن تكون 8 أحرف على الأقل"
          : "Password must be at least 8 characters",
      );
      return;
    }
    if (password !== confirm) {
      toast.error(
        isAr
          ? "كلمتا المرور غير متطابقتين"
          : "The two passwords do not match",
      );
      return;
    }
    busyRef.current = true;
    setLoading(true);
    try {
      const { supabase } = await import("@/lib/supabase/client");
      if (!supabase || !isSupabaseConfigured) {
        toast.error(isAr ? "الخدمة غير مهيأة حاليًا" : "Service is not configured");
        return;
      }
      const { error } = await supabase.auth.updateUser({ password });
      if (error) {
        // An expired/used recovery link arrives here session-less — the
        // honest answer is «start the recovery again», not a raw GoTrue
        // string (M1 law).
        toast.error(
          isAr
            ? "انتهت صلاحية رابط الاستعادة أو استُخدم سابقًا — ابدأ الاستعادة من جديد"
            : "The recovery link expired or was already used — start the recovery again",
          { id: "auth-error" },
        );
        return;
      }
      toast.success(
        isAr ? "تم تحديث كلمة المرور بنجاح" : "Password updated successfully",
        { id: "auth-ok" },
      );
      router.replace("/dashboard");
    } finally {
      busyRef.current = false;
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-[var(--bg)] text-[var(--text)]">
      <header className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4">
        <button
          className="text-lg font-semibold tracking-tight"
          onClick={() => router.replace("/")}
        >
          Alkemos
        </button>
        <LanguageToggle />
      </header>

      <main className="flex flex-1 items-center justify-center px-4 py-10">
        {recoveryFailed ? (
          <RecoveryFailureState />
        ) : (
        <div className="w-full max-w-md px-2">
          <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
            {isAr ? "عيّن كلمة مرور جديدة" : "Set a new password"}
          </h1>
          <p className="mt-2 text-base font-normal text-[var(--muted-foreground)]">
            {isAr
              ? "اختر كلمة مرور جديدة لحسابك وستُسجَّل بها فورًا."
              : "Choose a new password for your account — it takes effect immediately."}
          </p>

          {!isSupabaseConfigured && (
            <div className="marble-card mt-6 p-4 text-sm font-normal text-[var(--muted-foreground)]">
              {t("auth.demoNotice")}
            </div>
          )}

          <form onSubmit={submit} className="mt-8 space-y-5">
            <div className="space-y-2">
              <Label htmlFor="new-password" className="text-sm font-medium">
                {isAr ? "كلمة المرور الجديدة" : "New password"}
              </Label>
              <Input
                id="new-password"
                type="password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="rounded-xl border-[var(--edge)] bg-[var(--card)] px-4 py-3 text-base"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password" className="text-sm font-medium">
                {isAr ? "تأكيد كلمة المرور" : "Confirm password"}
              </Label>
              <Input
                id="confirm-password"
                type="password"
                required
                minLength={8}
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="••••••••"
                className="rounded-xl border-[var(--edge)] bg-[var(--card)] px-4 py-3 text-base"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="btn-chrome w-full px-6 py-3 text-base disabled:opacity-50"
            >
              {loading
                ? isAr ? "جارٍ الحفظ…" : "Saving…"
                : isAr ? "حفظ كلمة المرور" : "Save password"}
            </button>
          </form>

          <p className="mt-8 text-center text-sm font-normal text-[var(--muted-foreground)]">
            {isAr ? "الرابط لا يعمل؟ " : "Link not working? "}
            <button
              type="button"
              onClick={() => router.replace("/auth?mode=login")}
              className="font-normal text-[var(--muted-2)] underline-offset-4 transition-opacity hover:opacity-70 hover:underline"
            >
              {isAr ? "ابدأ الاستعادة من جديد" : "Start the recovery again"}
            </button>
          </p>
        </div>
        )}
      </main>

      <footer className="mt-auto border-t border-[var(--edge)] py-6 text-center text-xs font-normal text-[var(--muted-foreground)]">
        © {new Date().getFullYear()} Alkemos. {isAr ? "كل الحقوق محفوظة." : "All rights reserved."}
      </footer>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={null}>
      <ResetForm />
    </Suspense>
  );
}
