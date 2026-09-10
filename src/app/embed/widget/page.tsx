import type { Metadata } from "next";
import { EmbedEvoChat } from "@/components/embed/EmbedEvoChat";
import { hashPartnerKey, isWellFormedPartnerKey, validatePartnerTheme, type PartnerTheme } from "@/lib/evo-partner";
import { isSupabaseAdminConfigured, supabaseAdmin } from "@/lib/supabase/admin";

/**
 * /embed/widget — EVO-6 (W6): the isolated partner chat iframe target.
 *
 * SERVER-SIDE KEY VALIDATION: the presented key arrives in the iframe URL
 * (?key=pk_live_…) — this page hashes it and looks up the ACTIVE row via
 * service-role BEFORE rendering; an invalid/deactivated key (or the owner
 * kill switch) renders a styled unavailable card — a 200, NOT a 404,
 * because a 404 inside a partner-embedded iframe shows the BROWSER's
 * error chrome (the honest outcome is the same: no chat).
 *
 * NO-INDEX + NO edge-cache: embed is in the next.config private-cache
 * lookahead (per-key render); robots come from metadata below. Nothing
 * personal renders here — a partner key holder only ever sees THEIR own
 * theme (and a key is required to render anything at all).
 */

export const metadata: Metadata = {
  title: "EVO",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

function Unavailable({ lang }: { lang: "ar" | "en" }) {
  const isAr = lang === "ar";
  return (
    <div
      dir={isAr ? "rtl" : "ltr"}
      className="flex h-dvh flex-col items-center justify-center gap-3 bg-white px-6 text-center"
      style={{ fontFamily: "-apple-system, 'Segoe UI', Tahoma, sans-serif" }}
    >
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#f5f5f7] text-2xl">
        💬
      </div>
      <div className="text-base font-semibold text-[#1d1d1f]">EVO</div>
      <p className="max-w-[280px] text-sm leading-relaxed text-[#6e6e73]">
        {isAr
          ? "ويدجت EVO غير متاح حاليًا — تأكد أن مفتاح التضمين صحيح ومفعّل، أو تواصل مع فريق Alkemos."
          : "The EVO widget is not available right now — check that your embed key is valid and active, or contact the Alkemos team."}
      </p>
    </div>
  );
}

export default async function EmbedWidgetPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const rawKey = typeof params.key === "string" ? params.key.trim() : "";
  const langParam = typeof params.lang === "string" ? params.lang : "";
  const lang: "ar" | "en" = langParam === "ar" ? "ar" : "en";

  const flagOn = process.env.EVO_PARTNER_API_ENABLED === "true";
  if (
    !flagOn ||
    !isWellFormedPartnerKey(rawKey) ||
    !isSupabaseAdminConfigured ||
    !supabaseAdmin
  ) {
    return <Unavailable lang={lang} />;
  }

  const keyHash = hashPartnerKey(rawKey);
  const { data: keyRow } = await supabaseAdmin
    .from("evo_api_keys")
    .select("theme, is_active")
    .eq("key_hash", keyHash)
    .maybeSingle();

  if (!keyRow || !keyRow.is_active) {
    return <Unavailable lang={lang} />;
  }

  // Stored themes were validated at write time — re-validate defensively
  // (trust nothing from the DB shape): any malformed stored value falls
  // back to platform defaults, never an error page.
  const validated = validatePartnerTheme(keyRow.theme);
  const theme: PartnerTheme = validated.ok ? validated.theme : {};

  const greeting =
    (lang === "ar" ? theme.greeting_ar : theme.greeting_en) ??
    (lang === "ar"
      ? "أهلًا بك! أنا EVO مدربك من Alkemos — اسألني أي حاجة عن اللياقة والتغذية."
      : "Welcome! I'm EVO, your Alkemos coach — ask me anything about fitness and nutrition.");

  return (
    <EmbedEvoChat
      apiKey={rawKey}
      lang={lang}
      theme={{
        accent: theme.accent,
        logo_url: theme.logo_url,
        partner_label: theme.partner_label ?? undefined,
      }}
      greeting={greeting}
    />
  );
}
