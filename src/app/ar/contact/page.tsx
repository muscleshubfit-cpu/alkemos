import type { Metadata } from "next";
import { ContactView } from "@/components/views/ContactView";

const SITE_URL = "https://alkemos.com";

/**
 * Access-point fix (2026-09-14): /ar/contact — Arabic mirror of /contact.
 *
 * ContactView is a bilingual client page (URL-first Arabic under /ar/*),
 * so the Arabic contact form + support info render automatically. This
 * page adds the indexable URL + Arabic-first metadata + reciprocal
 * hreflang with the EN page. The «تواصل معنا» CTA on /ar/faq and the
 * shared footer's Contact link now resolve here instead of the EN URL.
 */
export const metadata: Metadata = {
  title: "تواصل معنا | الدعم والملاحظات والشراكات",
  description:
    "تواصل مع فريق Alkemos: الدعم الفني، أسئلة الحساب والدفع، الملاحظات، أو طلبات الشراكة. أرسل رسالتك وسنرد عليك عادة خلال 24 ساعة.",
  alternates: {
    canonical: `${SITE_URL}/ar/contact`,
    languages: {
      en: `${SITE_URL}/contact`,
      ar: `${SITE_URL}/ar/contact`,
      "x-default": `${SITE_URL}/contact`,
    },
  },
  openGraph: {
    title: "تواصل معنا — Alkemos",
    description:
      "الدعم الفني، أسئلة الحساب والدفع، الملاحظات، أو طلبات الشراكة — أرسل رسالتك وسنرد عليك.",
    url: `${SITE_URL}/ar/contact`,
    type: "website",
    locale: "ar_EG",
  },
};

export default function Page() {
  return <ContactView />;
}
