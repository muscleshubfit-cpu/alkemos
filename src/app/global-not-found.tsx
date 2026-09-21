/**
 * GLOBAL NOT-FOUND (VERCEL-USAGE-3, 2026-09-21).
 *
 * With the single dynamic root layout replaced by per-locale route-group
 * root layouts ((en) / (app) / (ar)), Next.js needs this root-level
 * global-not-found file to render 404s for URLs that match NO group
 * (it renders its own <html> document — the group not-found.tsx files
 * still handle notFound() calls INSIDE each locale subtree).
 *
 * Deliberately dependency-free and bilingual: an unmatched URL has no
 * known locale, so both languages get a plain, fully self-contained
 * document with links to both homepages.
 */
export default function GlobalNotFound() {
  return (
    <html lang="en">
      <body
        style={{
          fontFamily:
            'system-ui, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          margin: 0,
          padding: "24px",
          backgroundColor: "#fafafa",
          color: "#1c1917",
        }}
      >
        <p style={{ fontSize: "64px", fontWeight: 700, margin: "0 0 8px" }}>404</p>
        <h1 style={{ fontSize: "22px", margin: "0 0 8px" }}>
          Page not found — الصفحة غير موجودة
        </h1>
        <p style={{ fontSize: "14px", color: "#78716c", margin: "0 0 24px" }}>
          The page you requested does not exist. — الصفحة التي طلبتها غير موجودة.
        </p>
        <p style={{ display: "flex", gap: "12px", flexWrap: "wrap", justifyContent: "center" }}>
          <a
            href="/"
            style={{
              display: "inline-block",
              padding: "10px 20px",
              borderRadius: "8px",
              backgroundColor: "#1c1917",
              color: "#fff",
              textDecoration: "none",
              fontSize: "14px",
            }}
          >
            Alkemos Home
          </a>
          <a
            href="/ar"
            style={{
              display: "inline-block",
              padding: "10px 20px",
              borderRadius: "8px",
              border: "1px solid #d6d3d1",
              color: "#1c1917",
              textDecoration: "none",
              fontSize: "14px",
            }}
          >
            الصفحة الرئيسية
          </a>
        </p>
      </body>
    </html>
  );
}
