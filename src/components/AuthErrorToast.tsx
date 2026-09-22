"use client";

import { useEffect } from "react";
import { useI18n } from "@/lib/i18n";

/**
 * AuthErrorToast — the OAuth-callback error listener, extracted from the
 * old "use client" homepage page.tsx (Phase 202 homepage restructure:
 * the homepage route became a SERVER component so it can pass the real
 * curated library samples to LandingView; this tiny island keeps the
 * exact same behavior — nothing user-visible changed).
 *
 * Behavior (verbatim from the pre-Phase-202 homepage): when the OAuth
 * callback redirects back with ?auth_error=..., clean the URL and show
 * a friendly toast. Renders nothing.
 *
 * STAGE-253 (i18n sweep): the toasts speak the viewer's UI language —
 * the component is mounted inside I18nProvider (root-shell) on both
 * homepage mirrors, so `lang` is the same URL-first law every view uses.
 */
export function AuthErrorToast() {
  const { lang } = useI18n();

  useEffect(() => {
    if (typeof window === "undefined") return;
    const url = new URL(window.location.href);
    const authError = url.searchParams.get("auth_error");
    if (authError) {
      window.history.replaceState({}, document.title, url.pathname);
      import("sonner").then(({ toast }) => {
        toast.error(
          authError === "server-config"
            ? lang === "ar"
              ? "خطأ في إعدادات الخادم. يرجى التواصل مع الدعم."
              : "Server configuration error. Please contact support."
            : lang === "ar"
              ? `فشل تسجيل الدخول: ${authError}`
              : `Login failed: ${authError}`,
        );
      });
    }
  }, [lang]);

  return null;
}
