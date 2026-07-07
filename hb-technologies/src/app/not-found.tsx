import Link from "next/link";
import { createPageMetadata, noIndexNoFollowRobots } from "@/lib/seo";
import marketing from "@/styles/marketing.module.css";

export const metadata = createPageMetadata({
  title: "Page Not Found",
  description: "This VIZIA Technologies page was not found. Return home or explore our secure software and technology services.",
  path: "/404",
  imageLabel: "Page not found",
  robots: noIndexNoFollowRobots,
});

export default function NotFound() {
  return (
    <section className="section">
      <div className="container">
        <h1>Page not found</h1>
        <p className="muted">
          The page you’re looking for doesn’t exist or was moved.
        </p>
        <div className={marketing.mt3}>
          <Link className="btn" href="/">
            Go home
          </Link>
        </div>
      </div>
    </section>
  );
}
