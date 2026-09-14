import type { Metadata } from "next";
import { ContactView } from "@/components/views/ContactView";

/**
 * FULL-SITE AUDIT FIX (2026-08-30): this page previously had no metadata
 * and INHERITED the root canonical (= homepage), telling Google it was a
 * duplicate of "/". Now it owns its identity (title/description/canonical).
 * Access-point fix (2026-09-14): /ar/contact now exists — reciprocal
 * hreflang pair added.
 */
export const metadata: Metadata = {
  title: "Contact Us | Alkemos — Support, Feedback & Partnerships",
  description:
    "Reach the Alkemos team: technical support, account and payment questions, feedback, or partnership requests. Send us a message and we usually reply within 24 hours.",
  alternates: {
    canonical: "/contact",
    languages: {
      en: "https://alkemos.com/contact",
      ar: "https://alkemos.com/ar/contact",
      "x-default": "https://alkemos.com/contact",
    },
  },
};

export default function Page() {
 return <ContactView />;
}
