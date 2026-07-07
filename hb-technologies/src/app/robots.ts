import type { MetadataRoute } from "next";

import { getSiteUrl } from "@/lib/site";

/**
 * SEO Configuration: robots.txt
 *
 * This file controls search engine crawling and indexing behavior.
 *
 * Rules:
 * - Allow all public pages (/)
 * - Disallow /api/* (API routes, not indexable)
 * - Disallow /admin/* (administrative interface)
 *
 * Sitemap:
 * - Points to /sitemap.xml (auto-generated)
 * - Includes all public indexable pages, images, and videos
 * - Production domain (https://www.vizia.co.ke)
 *
 * Host:
 * - Specifies preferred domain (with-www version)
 * - Helps consolidate authority and avoid duplicate content
 *
 * Best practices:
 * - Keep crawl budget focused on quality content
 * - External blog pages (/blog/external/*) use noindex but allow follow
 * - Services and blog posts are fully indexable
 */

export default function robots(): MetadataRoute.Robots {
  const base = getSiteUrl();

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/admin/"],
    },
    sitemap: new URL("/sitemap.xml", base).toString(),
    host: base.origin,
  };
}
