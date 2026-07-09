"use client";

import { useEffect } from "react";
import Link from "next/link";
import marketing from "@/styles/marketing.module.css";

interface ErrorPageProps {
  error?: Error & { digest?: string };
  reset?: () => void;
}

export default function Error({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    console.error("Server Error:", error);

    const gtag = (window as Window & { gtag?: (...args: unknown[]) => void }).gtag;
    if (typeof window !== "undefined" && gtag) {
      gtag("event", "exception", {
        description: `500 - Server Error: ${error?.message || "Unknown error"}`,
        fatal: true,
      });
    }
  }, [error]);

  return (
    <section className="section">
      <div className="container">
        <h1>Server Error</h1>
        <p className="muted">
          Something went wrong on our end. Our team has been notified and is working to fix it.
        </p>
        {error?.digest && (
          <p className="muted">
            <small>Error Reference: {error.digest}</small>
          </p>
        )}
        <div className={marketing.mt3}>
          <button
            className="btn"
            onClick={() => reset?.()}
            style={{ marginRight: "1rem", cursor: "pointer" }}
          >
            Try Again
          </button>
          <Link className="btn" href="/" style={{ background: "transparent", border: "1px solid" }}>
            Go Home
          </Link>
        </div>
        <div className={marketing.mt3}>
          <p className="muted">
            <strong>Need help?</strong>{" "}
            <Link href="/contact">Contact our support team</Link>
          </p>
        </div>
      </div>
    </section>
  );
}
