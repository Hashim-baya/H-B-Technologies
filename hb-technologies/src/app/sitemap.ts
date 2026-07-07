import type { MetadataRoute } from "next";

import { blogPosts as staticBlogPosts } from "@/content/blog";
import { getBlogPosts } from "@/lib/api";
import { loadSiteContent } from "@/lib/content";
import { getSiteUrl } from "@/lib/site";
import { getCanonicalServiceSlug } from "@/lib/url-governance";

/**
 * Production XML Sitemap for VIZIA Technologies
 *
 * Includes:
 * - All public indexable pages (9 static routes + dynamic services + blog posts)
 * - Image metadata for Open Graph social preview images
 * - Video metadata for hero video
 *
 * Excludes (by design):
 * - /admin (marked noindex)
 * - /api/* (API routes)
 * - /blog/external/* (marked noindex, follow - external content)
 * - /og (image generation route, not a page)
 * - /not-found (error page)
 *
 * Priorities:
 * - Homepage: 1.0 (highest)
 * - Services index: 0.8
 * - Service details: 0.8
 * - Blog index: 0.7
 * - Blog posts: 0.6
 * - About, Contact, Book: 0.7
 *
 * Change frequency:
 * - Services: monthly (change when service offerings update)
 * - Blog: monthly (change when new posts added)
 * - Static pages: weekly (change when content updated)
 * - Homepage: weekly (stats, testimonials, hero rotate)
 */

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = getSiteUrl();
  const now = new Date();

  // Static routes with priority and change frequency
  const staticRoutes: Array<{
    path: string;
    priority: number;
    changeFrequency: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
  }> = [
    { path: "", priority: 1.0, changeFrequency: "weekly" }, // Homepage with hero video
    { path: "/services", priority: 0.8, changeFrequency: "monthly" }, // Services index
    { path: "/blog", priority: 0.7, changeFrequency: "weekly" }, // Blog index with featured images
    { path: "/about", priority: 0.7, changeFrequency: "monthly" },
    { path: "/contact", priority: 0.7, changeFrequency: "yearly" },
    { path: "/book-consultation", priority: 0.7, changeFrequency: "yearly" },
  ];

  const entries: MetadataRoute.Sitemap = staticRoutes.map((route) => {
    const entry: MetadataRoute.Sitemap[number] = {
      url: new URL(route.path || "/", base).toString(),
      lastModified: now,
      changeFrequency: route.changeFrequency,
      priority: route.priority,
    };

    // Add image metadata for social preview images
    if (route.path === "" || route.path === "/blog") {
      (entry as any).images = [
        new URL("/og?type=default", base).toString(),
      ];
    }

    // Add video metadata for homepage hero
    if (route.path === "") {
      (entry as any).videos = [
        {
          content_url: new URL("/videos/hero-video.mp4", base).toString(),
          player_url: new URL("/", base).toString(),
          title: "VIZIA Technologies - Secure by Design",
          description:
            "Secure-by-design engineering, AI-driven automation, and enterprise-grade infrastructure — built for teams that cannot afford downtime.",
          thumbnail_url: new URL("/og?type=default", base).toString(),
          duration: 15,
          upload_date: new Date("2025-01-01").toISOString(),
        },
      ];
    }

    return entry;
  });

  // Dynamic routes: prefer API (Supabase-backed) but keep a safe static fallback.
  // Note: sitemap runs server-side; keep failures non-fatal.
  const [siteContent, blogRes] = await Promise.all([
    loadSiteContent(),
    getBlogPosts({ revalidate: 3600 }),
  ]);

  // Service detail pages
  const serviceSlugs = Array.from(
    new Set(siteContent.services_page.items.map((s) => getCanonicalServiceSlug(s.slug)))
  );

  for (const slug of serviceSlugs) {
    entries.push({
      url: new URL(`/services/${slug}`, base).toString(),
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.8,
      images: [new URL(`/og?type=service&slug=${slug}`, base).toString()],
    });
  }

  // Blog post pages (internal only; external blogs are noindex)
  const blogPosts = blogRes.ok
    ? blogRes.data
    : staticBlogPosts.map((p) => ({ slug: p.slug, created_at: p.date }));

  for (const p of blogPosts) {
    entries.push({
      url: new URL(`/blog/${p.slug}`, base).toString(),
      lastModified: p.created_at ? new Date(p.created_at) : now,
      changeFrequency: "monthly",
      priority: 0.6,
      images: [new URL(`/og?type=article&slug=${p.slug}`, base).toString()],
    });
  }

  return entries;
}
