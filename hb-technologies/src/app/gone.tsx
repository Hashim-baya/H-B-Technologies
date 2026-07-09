import Link from "next/link";
import { createPageMetadata, noIndexNoFollowRobots } from "@/lib/seo";
import marketing from "@/styles/marketing.module.css";

/**
 * 410 Gone Error Page
 *
 * RFC 7231: The 410 (Gone) status code indicates that access to the target
 * resource is no longer available at the origin server and this condition is
 * likely to be permanent.
 *
 * Use cases:
 * - Content that has been permanently deleted
 * - Services that have been discontinued
 * - Old product versions no longer supported
 * - Deprecated API endpoints
 *
 * Difference from 404:
 * - 404: Server doesn't know if resource existed
 * - 410: Server knows resource existed but is permanently gone
 *
 * Production Implementation:
 * - Clear indication content is gone forever
 * - Alternative resources suggestion
 * - Archive/historical note if applicable
 */

export const metadata = createPageMetadata({
  title: "Resource Gone",
  description: "This resource is no longer available and has been permanently removed.",
  path: "/410",
  imageLabel: "Resource gone",
  robots: noIndexNoFollowRobots,
});

export default function Gone() {
  return (
    <section className="section">
      <div className="container">
        <h1>Resource Gone</h1>
        <p className="muted">
          This resource is no longer available and has been permanently removed.
          It will not be restored.
        </p>
        <div className={marketing.mt3}>
          <Link className="btn" href="/">
            Go Home
          </Link>
        </div>
        <div className={marketing.mt3}>
          <h2>Looking for something?</h2>
          <ul>
            <li>
              <Link href="/services">View our current services</Link>
            </li>
            <li>
              <Link href="/blog">Read our latest articles</Link>
            </li>
            <li>
              <Link href="/about">Learn about VIZIA Technologies</Link>
            </li>
            <li>
              <Link href="/contact">Get in touch with us</Link>
            </li>
          </ul>
        </div>
      </div>
    </section>
  );
}
