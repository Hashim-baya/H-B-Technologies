import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { fetchDevToArticleById } from "@/lib/external";
import { absoluteUrl, buildArticleJsonLd, buildBreadcrumbJsonLd, buildSchemaGraph, buildWebPageJsonLd, createPageMetadata, noIndexFollowRobots, noIndexNoFollowRobots } from "@/lib/seo";
import marketing from "@/styles/marketing.module.css";

type PageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const article = await fetchDevToArticleById(id);
  const localPath = `/blog/external/${id}`;

  if (!article) {
    return createPageMetadata({
      title: "External Article Unavailable",
      description: "This external article is no longer available.",
      path: localPath,
      imageLabel: "External article",
      robots: noIndexNoFollowRobots,
    });
  }

  return createPageMetadata({
    title: article.title,
    description: article.description || "External article related to VIZIA Technologies service areas.",
    path: localPath,
    canonical: localPath,
    type: "article",
    keywords: [
      ...(article.tag_list ?? []),
      "external engineering article",
      "VIZIA Technologies",
    ],
    imageLabel: "External article",
    images: article.cover_image
      ? [
          {
            url: article.cover_image,
            alt: `${article.title} social preview image`,
          },
        ]
      : undefined,
    robots: noIndexFollowRobots,
  });
}

export default async function ExternalBlogDetailPage({ params }: PageProps) {
  const { id } = await params;
  const article = await fetchDevToArticleById(id);
  const localPath = `/blog/external/${id}`;

  if (!article) notFound();

  const articleUrl = article.url || localPath;
  const breadcrumbJsonLd = buildBreadcrumbJsonLd([
    { name: "Home", path: "/" },
    { name: "Blog", path: "/blog" },
    { name: article.title, path: localPath },
  ]);
  const jsonLd = buildSchemaGraph([
    buildWebPageJsonLd({
      name: article.title,
      description: article.description || "External article related to VIZIA Technologies service areas.",
      path: localPath,
      mainEntityId: `${absoluteUrl(localPath)}#article`,
    }),
    buildArticleJsonLd({
      name: article.title,
      description: article.description || "External article related to VIZIA Technologies service areas.",
      path: localPath,
      author: article.user?.name || "VIZIA Technologies",
      datePublished: article.published_at,
      keywords: article.tag_list,
      image: article.cover_image
        ? {
            url: article.cover_image,
            alt: `${article.title} social preview image`,
          }
        : undefined,
    }),
    breadcrumbJsonLd,
  ]);

  return (
    <section className="section">
      <div className="container">
        <div className={marketing.stack}>
          <p className="eyebrow">External article</p>
          <h1>{article.title}</h1>
          <p className={`muted ${marketing.lead}`}>{article.description}</p>
          <p className="muted">
            {article.readable_publish_date || article.published_at || ""}
            {article.user?.name ? ` • ${article.user.name}` : ""}
          </p>
        </div>

        {article.cover_image ? (
          <div className={marketing.cardMedia}>
            <Image
              className={marketing.cardImage}
              src={article.cover_image}
              alt={article.title}
              width={1200}
              height={630}
              unoptimized
            />
          </div>
        ) : null}

        <div className={marketing.cardBody}>
          <p className={marketing.cardDesc}>
            This article is pulled from Dev.to and shown here because it matches one of our
            service areas.
          </p>
          {article.tag_list?.length ? (
            <p className="muted">Tags: {article.tag_list.join(", ")}</p>
          ) : null}
          <div className={marketing.mt4}>
            <Link className="btn btnPrimary" href={articleUrl} target="_blank" rel="noopener noreferrer">
              Read original article
            </Link>
          </div>
        </div>

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </div>
    </section>
  );
}
