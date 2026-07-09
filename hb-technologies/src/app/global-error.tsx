"use client";

import { useEffect } from "react";

interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  useEffect(() => {
    console.error("Global application error:", error);
  }, [error]);

  return (
    <html lang="en">
      <body>
        <main
          style={{
            minHeight: "100vh",
            display: "grid",
            placeItems: "center",
            padding: "2rem",
            fontFamily: "system-ui, sans-serif",
            background: "#080102",
            color: "#fff",
          }}
        >
          <div style={{ maxWidth: "32rem", textAlign: "center" }}>
            <h1>Server Error</h1>
            <p style={{ opacity: 0.75 }}>
              A critical error occurred while loading this page. Please try again.
            </p>
            {error.digest && (
              <p style={{ opacity: 0.6, fontSize: "0.875rem" }}>
                Error Reference: {error.digest}
              </p>
            )}
            <button
              type="button"
              onClick={() => reset()}
              style={{
                marginTop: "1.5rem",
                padding: "0.75rem 1.25rem",
                border: "1px solid #fff",
                background: "transparent",
                color: "#fff",
                cursor: "pointer",
              }}
            >
              Try Again
            </button>
          </div>
        </main>
      </body>
    </html>
  );
}
