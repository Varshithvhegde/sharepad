"use client";

/**
 * Last resort: this replaces the root layout, so it cannot rely on the app's
 * fonts or stylesheet and has to carry its own styling.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "1.5rem",
          background: "#faf9f6",
          color: "#1c1c1c",
          fontFamily: "Georgia, 'Times New Roman', serif",
        }}
      >
        <div
          style={{
            maxWidth: "26rem",
            background: "#fff",
            border: "1.8px solid #1c1c1c",
            boxShadow: "3px 4px 0 rgba(28,28,28,0.12)",
            padding: "2rem",
          }}
        >
          <p style={{ margin: 0, fontSize: "2.6rem", lineHeight: 1, color: "#c8443c" }}>!</p>
          <h1 style={{ fontSize: "1.5rem", margin: "0.75rem 0 0.5rem" }}>
            The whole notebook shut
          </h1>
          <p style={{ margin: "0 0 1.5rem", color: "#5a5850", lineHeight: 1.6 }}>
            Something failed before the page could load. Reloading usually sorts it.
          </p>
          {error.digest && (
            <p style={{ fontSize: "0.75rem", color: "#aaa89e", marginBottom: "1.5rem" }}>
              Reference: {error.digest}
            </p>
          )}
          <button
            onClick={reset}
            style={{
              padding: "0.7rem 1.4rem",
              background: "#1c1c1c",
              color: "#faf9f6",
              border: "1.8px solid #1c1c1c",
              boxShadow: "3px 3px 0 rgba(28,28,28,0.2)",
              cursor: "pointer",
              font: "inherit",
            }}
          >
            Reload
          </button>
        </div>
      </body>
    </html>
  );
}
