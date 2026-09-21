import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
  title: "404 — الصفحة غير موجودة | Alkemos",
  alternates: {
    canonical: "",
  },
};

/**
 * STATIC 404 (VERCEL-USAGE-3, 2026-09-21): the locale check that used to
 * read headers() here is GONE — this file lives inside the (ar) route
 * group whose subtree is Arabic-only, so the language is a compile-time
 * constant. The old headers() read made not-found part of EVERY route's
 * dynamic tree and forced ~110 pages back into per-request SSR, defeating
 * the entire static-shell migration. Keep this file free of dynamic APIs.
 */

export default function NotFound() {
  return (
    <div
      style={{
        fontFamily:
          'system-ui, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji"',
        height: "100vh",
        textAlign: "center",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div>
        <style
          dangerouslySetInnerHTML={{
            __html: `body{color:#000;background:#fff;margin:0}.next-error-h1{border-inline-end:1px solid rgba(0,0,0,.3);padding-inline-end:23px;margin-inline-end:20px}@media (prefers-color-scheme:dark){body{color:#fff;background:#000}.next-error-h1{border-inline-end:1px solid rgba(255,255,255,.3)}}`,
          }}
        />
        <h1
          className="next-error-h1"
          style={{
            display: "inline-block",
            padding: "0 23px 0 0",
            fontSize: "24px",
            fontWeight: 500,
            verticalAlign: "top",
            lineHeight: "49px",
          }}
        >
          404
        </h1>
        <div style={{ display: "inline-block" }}>
          <h2 style={{ fontSize: "14px", fontWeight: 400, lineHeight: "49px", margin: 0 }}>
            "هذه الصفحة غير موجودة."
          </h2>
          <p style={{ marginTop: "16px" }}>
            <Link
              href="/ar"
              style={{
                color: "#0071e3",
                textDecoration: "none",
                fontSize: "14px",
              }}
            >
              "العودة للرئيسية ←"
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
