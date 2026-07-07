import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";

import { getPostBySlug } from "@/content/blog";
import Breadcrumbs from "@/components/Breadcrumbs";
import { absoluteUrl, buildArticleJsonLd, buildBreadcrumbJsonLd, buildSchemaGraph, buildWebPageJsonLd, createPageMetadata } from "@/lib/seo";
import { getBlogPost } from "@/lib/api";
import marketing from "@/styles/marketing.module.css";

export const revalidate = 60;

type BlogPostView = {
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  featured_image?: string;
  author?: string;
  created_at?: string | null;
  tags: string[];
  readingTime?: string;
};

function toViewFromStatic(slug: string): BlogPostView | null {
  const post = getPostBySlug(slug);
  if (!post) return null;

  return {
    slug: post.slug,
    title: post.title,
    excerpt: post.description,
    content: post.body.join("\n\n"),
    featured_image: undefined,
    author: "VIZIA Technologies",
    created_at: post.date,
    tags: post.tags,
    readingTime: post.readingTime,
  };
}

function mergeBlogView(fallback: BlogPostView, apiData?: Partial<BlogPostView>): BlogPostView {
  if (!apiData) return fallback;

  return {
    ...fallback,
    ...apiData,
    title: apiData.title || fallback.title,
    excerpt: apiData.excerpt || fallback.excerpt,
    content: apiData.content || fallback.content,
    featured_image: apiData.featured_image || fallback.featured_image,
    author: apiData.author || fallback.author,
    created_at: apiData.created_at || fallback.created_at,
    tags: apiData.tags?.length ? apiData.tags : fallback.tags,
    readingTime: apiData.readingTime || fallback.readingTime,
  };
}

async function resolvePost(slug: string) {
  const fallback = toViewFromStatic(slug);
  if (!fallback) return null;

  const apiRes = await getBlogPost(slug, { revalidate });
  if (!apiRes.ok) return fallback;

  return mergeBlogView(fallback, {
    slug: apiRes.data.slug,
    title: apiRes.data.title,
    excerpt: apiRes.data.excerpt,
    content: apiRes.data.content,
    featured_image: apiRes.data.featured_image,
    author: apiRes.data.author,
    created_at: apiRes.data.created_at,
    tags: [],
    readingTime: undefined,
  });
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await resolvePost(slug);
  if (!post) return {};

  return createPageMetadata({
    title: post.title,
    description: post.excerpt,
    path: `/blog/${post.slug}`,
    type: "article",
    keywords: [
      ...post.tags,
      "VIZIA Technologies",
      "secure software engineering",
      "technology delivery",
    ],
    imageLabel: "Engineering article",
    images: post.featured_image
      ? [
          {
            url: post.featured_image,
            alt: `${post.title} social preview image`,
          },
        ]
      : undefined,
  });
}

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

function splitParagraphs(content: string) {
  return String(content || "")
    .split(/\n\s*\n/g)
    .map((p) => p.trim())
    .filter(Boolean);
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await resolvePost(slug);
  if (!post) notFound();

  const paragraphs = splitParagraphs(post.content);

  const url = absoluteUrl(`/blog/${post.slug}`);
  const breadcrumbJsonLd = buildBreadcrumbJsonLd([
    { name: "Home", path: "/" },
    { name: "Blog", path: "/blog" },
    { name: post.title, path: `/blog/${post.slug}` },
  ]);
  const jsonLd = buildSchemaGraph([
    buildWebPageJsonLd({
      name: post.title,
      description: post.excerpt,
      path: `/blog/${post.slug}`,
      mainEntityId: `${url}#article`,
    }),
    buildArticleJsonLd({
      name: post.title,
      description: post.excerpt,
      path: `/blog/${post.slug}`,
      author: post.author || "VIZIA Technologies",
      datePublished: post.created_at,
      keywords: post.tags,
      image: post.featured_image
        ? {
            url: post.featured_image,
            alt: `${post.title} social preview image`,
          }
        : undefined,
    }),
    breadcrumbJsonLd,
  ]);

  return (
    <article className="section">
      <div className="container">
        <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Blog", href: "/blog" }, { label: post.title }]} />
        <h1>{post.title}</h1>
        <p className="muted">
          {toDisplayDate(post.created_at)}
          {post.author ? ` • ${post.author}` : ""}
          {post.readingTime ? ` • ${post.readingTime}` : ""}
        </p>

        {post.featured_image ? (
          <div className={marketing.postMedia}>
            <Image
              className={marketing.postImage}
              src={post.featured_image}
              alt={`Featured image for ${post.title}`}
              width={1200}
              height={630}
              priority={false}
              unoptimized
            />
          </div>
        ) : null}

        <p className={`muted ${marketing.mt2}`}>{post.excerpt}</p>

        {post.tags.length ? (
          <p className="muted">Topics: {post.tags.join(", ")}</p>
        ) : null}

        <div className={marketing.prose}>
          {paragraphs.length > 0
            ? paragraphs.map((p) => <p key={p}>{p}</p>)
            : null}
        </div>

        <div className={`card ${marketing.pad3} ${marketing.mt4}`}>
          <h2 className={marketing.sectionTitle}>Why this matters for your business</h2>
          <p className="muted">
            This article is written to support secure delivery, search visibility, and
            practical implementation decisions for teams shipping real products.
          </p>
        </div>

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </div>
    </article>
  );
}
