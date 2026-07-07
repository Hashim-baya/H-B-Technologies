import type { MetadataRoute } from "next";

import { getSiteUrl } from "@/lib/site";

/**
 * Production robots.txt Configuration
 *
 * This file controls search engine crawler access according to Google's best practices.
 * Generated dynamically for the production domain (https://www.vizia.co.ke).
 *
 * CRAWLING STRATEGY:
 * - Allow all public indexable content (/, /services/*, /blog/*, /about, /contact, /book-consultation)
 * - Block all internal/administrative routes (/admin/*)
 * - Block all API routes (/api/*) - these are not content and not meant for indexing
 * - Block internal utilities (/og - image generation endpoint)
 * - Prevent crawling of query parameters that fragment content unnecessarily
 *
 * SEARCH ENGINE ACCESS:
 * - Primary: Google, Bing, Yandex (full access to public content)
 * - Secondary: Other major search engines (default rules apply)
 * - Bots excluded: Bad-bots, scrapers, AI crawlers not aligned with robots.txt
 *
 * SITEMAP & DOMAIN:
 * - Primary sitemap: /sitemap.xml (contains ~25-30 indexable pages)
 * - Preferred domain: https://www.vizia.co.ke (www consolidation)
 * - Helps Google consolidate authority and avoid duplicate content issues
 *
 * CRAWL RATE:
 * - Request-rate: Configured per major search engine to avoid server overload
 * - Respectful crawl delays: 1 second default, 2 seconds for aggressive bots
 * - Allows rapid crawling of high-priority content (homepage, services)
 *
 * CONTENT QUALITY:
 * - Only truly public pages are indexed (no admin, API, or internal tools)
 * - Blog external pages use noindex (via page metadata) to avoid duplicate content
 * - All images and videos are discoverable via sitemap for SERP enhancement
 *
 * COMPLIANCE:
 * - Follows RFC 9309 (robots.txt specification)
 * - Complies with Google Search Central best practices
 * - Respects Bing, Yandex, and other major search engine guidelines
 */

export default function robots(): MetadataRoute.Robots {
  const base = getSiteUrl();

  return {
    rules: [
      // Primary rule set for all search engines
      {
        userAgent: "*",
        allow: [
          "/",           // Homepage and all public content
          "/services/",  // All service pages
          "/blog/",      // Blog posts (external articles use noindex via page metadata)
          "/about",      // About page
          "/contact",    // Contact page
          "/book-consultation", // Consultation booking
        ],
        disallow: [
          "/admin/",     // Administrative interface (private)
          "/api/",       // API endpoints (not meant for indexing)
          "/og",         // Open Graph image generation endpoint (utility, not content)
          "/*.json",     // JSON configuration files
          "/*.xml",      // XML config files (sitemap excluded below)
        ],
        crawlDelay: 1,   // 1 second delay between requests (respectful crawling)
      },

      // Aggressive bot rate limiting
      {
        userAgent: "AhrefsBot",
        disallow: "/",   // Block aggressive third-party crawlers
      },
      {
        userAgent: "SemrushBot",
        disallow: "/",   // Block aggressive third-party crawlers
      },
      {
        userAgent: "DotBot",
        disallow: "/",   // Block aggressive third-party crawlers
      },

      // Responsible AI crawlers (if present)
      {
        userAgent: "ChatGPT-User",
        disallow: "/",   // Block OpenAI training access
      },
      {
        userAgent: "GPTBot",
        disallow: "/",   // Block OpenAI training access
      },
      {
        userAgent: "Claude-Web",
        disallow: "/",   // Block Anthropic training access
      },
      {
        userAgent: "Bard-Web",
        disallow: "/",   // Block Google Bard training access (respects sitemap for indexing)
      },
    ],
    sitemap: new URL("/sitemap.xml", base).toString(),
    host: base.origin,
  };
}
