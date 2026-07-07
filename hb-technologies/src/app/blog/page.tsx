import Link from "next/link";
import Image from "next/image";

import { blogPosts as staticBlogPosts } from "@/content/blog";
import { getBlogPosts } from "@/lib/api";
import { fetchDevToByTag } from '@/lib/external';
import { services } from '@/content/services';
import Breadcrumbs from "@/components/Breadcrumbs";
import { buildItemListJsonLd, buildSchemaGraph, buildWebPageJsonLd, createPageMetadata } from "@/lib/seo";
import marketing from "@/styles/marketing.module.css";

export const metadata = createPageMetadata({
  title: "Engineering Blog",
  description:
    "Read practical engineering insights on security, performance, AI delivery, Supabase RLS, APIs, DevOps, and scalable software systems.",
  path: "/blog",
  imageLabel: "Engineering insights",
  keywords: [
    "software engineering blog",
    "cyber security blog",
    "Next.js performance",
    "AI engineering",
    "DevOps guides",
  ],
});

export const revalidate = 60;

type BlogListItem = {
  slug: string;
  title: string;
  excerpt: string;
  featured_image?: string;
  author?: string;
  created_at?: string | null;
};

type ExternalBlogItem = BlogListItem & { external_url: string };
type BlogCard = BlogListItem | ExternalBlogItem;

function toDisplayDate(value?: string | null) {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function mergeBlogPosts(apiPosts: BlogListItem[] | null): BlogListItem[] {
  const fallbackPosts: BlogListItem[] = staticBlogPosts.map((p) => ({
    slug: p.slug,
    title: p.title,
    excerpt: p.description,
    featured_image: "",
    author: "VIZIA Technologies",
    created_at: p.date,
  }));

  const merged = new Map<string, BlogListItem>();

  for (const post of fallbackPosts) merged.set(post.slug, post);
  for (const post of apiPosts || []) {
    merged.set(post.slug, {
      ...(merged.get(post.slug) || {}),
      ...post,
      excerpt: post.excerpt || merged.get(post.slug)?.excerpt || "",
      title: post.title || merged.get(post.slug)?.title || post.slug,
    });
  }

  return Array.from(merged.values()).sort((a, b) => {
    const left = a.created_at ? new Date(a.created_at).getTime() : 0;
    const right = b.created_at ? new Date(b.created_at).getTime() : 0;
    return right - left;
  });
}

function isExternalBlogItem(post: BlogCard): post is ExternalBlogItem {
  return "external_url" in post;
}

export default async function BlogIndexPage() {
  const res = await getBlogPosts({ revalidate });
  const posts = mergeBlogPosts(res.ok ? res.data : null);

  // fetch external posts related to our service keywords (Dev.to)
  const keywordSet = new Set<string>();
  for (const s of services) {
    for (const k of s.keywords || []) keywordSet.add(k.split(' ')[0].toLowerCase());
  }
  const tags = Array.from(keywordSet).slice(0, 4);

  const externalPromises = tags.map((t) => fetchDevToByTag(t, 4));
  const externalResults = await Promise.all(externalPromises);
  const externalFlat = externalResults.flat();

  const seen = new Set<string>();
  const externalDisplay: ExternalBlogItem[] = externalFlat.filter((e) => {
    if (!e.url) return false;
    if (seen.has(e.url)) return false;
    seen.add(e.url);
    return true;
  }).filter((e) => /^\d+$/.test(String(e.id))).slice(0, 8).map((e) => ({
    slug: String(e.id),
    title: e.title,
    excerpt: e.description || '',
    featured_image: e.cover_image || undefined,
    author: e.user?.name || undefined,
    created_at: e.published_at || undefined,
    external_url: e.url,
  }));

  // Merge internal posts with external ones (external at the end)
  const allPosts: BlogCard[] = [...posts, ...externalDisplay];
  const internalPostEntries = posts.map((post) => ({
    name: post.title,
    description: post.excerpt,
    path: `/blog/${post.slug}`,
  }));
  const itemListJsonLd = buildItemListJsonLd(
    "VIZIA Technologies Blog Articles",
    internalPostEntries
  );
  const blogJsonLd = buildSchemaGraph([
    buildWebPageJsonLd({
      name: "Engineering Blog",
      description:
        "Read practical engineering insights on security, performance, AI delivery, Supabase RLS, APIs, DevOps, and scalable software systems.",
      path: "/blog",
    }),
    itemListJsonLd,
  ]);

  return (
    <section className="section">
      <div className="container">
        <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Blog" }]} />
        <h1>Blog</h1>
        <p className={`muted ${marketing.lead}`}>
          Security, performance, and delivery practices — written for teams that
          ship.
        </p>

        <div className={marketing.gridCards}>
          {allPosts.map((p) => (
            <article key={p.slug} className="card">
              {p.featured_image ? (
                <div className={marketing.cardMedia}>
                  <Image
                    className={marketing.cardImage}
                    src={p.featured_image}
                    alt={`Featured image for ${p.title}`}
                    width={1200}
                    height={630}
                    unoptimized
                  />
                </div>
              ) : null}
              <div className={marketing.cardBody}>
                <h2 className={marketing.cardTitle}>
                  {/** external posts link out to original source */}
                  {isExternalBlogItem(p) ? (
                    <Link href={`/blog/external/${p.slug}`}>
                      {p.title}
                    </Link>
                  ) : (
                    <Link href={`/blog/${p.slug}`}>{p.title}</Link>
                  )}
                </h2>
                <p className={`muted ${marketing.cardDesc}`}>{p.excerpt}</p>
                <p className={`muted ${marketing.cardDesc}`}>
                  {toDisplayDate(p.created_at)}
                  {p.author ? ` • ${p.author}` : ""}
                </p>
              </div>
            </article>
          ))}
        </div>

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(blogJsonLd) }}
        />

        <p className={`muted ${marketing.mt3}`}>
          Need implementation support? <Link href="/services/web-development">Explore web development services</Link> or <Link href="/contact">contact our engineering team</Link>.
        </p>
      </div>
    </section>
  );
}
