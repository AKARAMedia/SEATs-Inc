"use client"; // Error boundaries must be Client Components

// Last resort when the root layout itself fails. Replaces the whole document, so it has its own <html>/<body>
// and plain inline styles (the site stylesheet isn't loaded here).
export default function GlobalError({ retry }: { error: unknown; retry: () => void }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: "system-ui, sans-serif", textAlign: "center" }}>
        <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 24 }}>
          <h1 style={{ fontSize: 24 }}>Temporarily unavailable / ただいまご利用いただけません</h1>
          <p style={{ maxWidth: 560 }}>
            We couldn&apos;t load this page right now. Please try again in a few minutes.
            <br />
            しばらくしてからもう一度お試しください。
          </p>
          <button type="button" onClick={() => retry()} style={{ marginTop: 16, padding: "10px 24px", fontSize: 16, cursor: "pointer" }}>
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
