import type { MetadataRoute } from "next";

import { blogPosts as staticBlogPosts } from "@/content/blog";
import { getBlogPosts } from "@/lib/api";
import { loadSiteContent } from "@/lib/content";
import { getSiteUrl } from "@/lib/site";
import { getCanonicalServiceSlug } from "@/lib/url-governance";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = getSiteUrl();
  const now = new Date();

  const staticRoutes = [
    "",
    "/about",
    "/services",
    "/blog",
    "/contact",
    "/book-consultation",
  ];

  const entries: MetadataRoute.Sitemap = staticRoutes.map((path) => ({
    url: new URL(path || "/", base).toString(),
    lastModified: now,
    changeFrequency: "weekly",
    priority: path === "" ? 1 : 0.7,
  }));

  // Dynamic routes: prefer API (Supabase-backed) but keep a safe static fallback.
  // Note: sitemap runs server-side; keep failures non-fatal.
  // We intentionally do not throw here.
  const [siteContent, blogRes] = await Promise.all([
    loadSiteContent(),
    getBlogPosts({ revalidate: 3600 }),
  ]);

  const serviceSlugs = Array.from(
    new Set(siteContent.services_page.items.map((s) => getCanonicalServiceSlug(s.slug)))
  );

  const blogPosts = blogRes.ok
    ? blogRes.data
    : staticBlogPosts.map((p) => ({ slug: p.slug, created_at: p.date }));

  for (const slug of serviceSlugs) {
    entries.push({
      url: new URL(`/services/${slug}`, base).toString(),
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.8,
    });
  }

  for (const p of blogPosts) {
    entries.push({
      url: new URL(`/blog/${p.slug}`, base).toString(),
      lastModified: p.created_at ? new Date(p.created_at) : now,
      changeFrequency: "monthly",
      priority: 0.6,
    });
  }

  return entries;
}
