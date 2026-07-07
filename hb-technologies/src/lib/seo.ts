import type { Metadata } from "next";

import { getServiceBySlug } from "@/content/services";
import { getSiteUrl, siteConfig } from "@/lib/site";
import { getCanonicalServiceSlug, cleanPathname } from "@/lib/url-governance";

type SeoImage =
  | string
  | URL
  | {
      url: string | URL;
      alt?: string;
      width?: number;
      height?: number;
      type?: string;
    };

type PageMetadataInput = {
  title: string;
  description: string;
  path: string;
  canonical?: string | URL;
  type?: "website" | "article";
  keywords?: readonly string[];
  images?: readonly SeoImage[];
  imageLabel?: string;
  robots?: Metadata["robots"];
  absoluteTitle?: boolean;
};

type ServiceSeoInput = {
  slug: string;
  title: string;
  description: string;
  keywords?: readonly string[];
};

type BreadcrumbItem = {
  name: string;
  path: string;
};

type ItemListEntry = {
  name: string;
  path: string;
  description?: string;
};

type SchemaNode = Record<string, unknown>;

const SOCIAL_IMAGE_SIZE = {
  width: 1200,
  height: 630,
} as const;

export const indexableRobots: Metadata["robots"] = "index, follow";

export const noIndexFollowRobots: Metadata["robots"] = "noindex, follow";

export const noIndexNoFollowRobots: Metadata["robots"] = "noindex, nofollow";

function isAbsoluteUrl(value: string) {
  return /^https?:\/\//i.test(value);
}

export function absoluteUrl(pathOrUrl: string | URL) {
  const value = String(pathOrUrl);

  if (isAbsoluteUrl(value)) {
    const url = new URL(value);
    url.hash = "";
    return url.toString();
  }

  return new URL(cleanPathname(value), getSiteUrl()).toString();
}

function truncate(value: string, maxLength: number) {
  const normalized = value.replace(/\s+/g, " ").trim();
  if (normalized.length <= maxLength) return normalized;
  return `${normalized.slice(0, maxLength - 1).trim()}...`;
}

function sentenceCaseServiceName(name: string) {
  return name.replace(/\s*\((AI|ML|NLP)\)\s*/g, "").trim();
}

function buildServiceTitle(serviceName: string) {
  if (/services$/i.test(serviceName)) return serviceName;
  if (/solutions$/i.test(serviceName)) return serviceName;
  return `${serviceName} Services`;
}

function buildServiceDescription(service: ServiceSeoInput) {
  const serviceName = sentenceCaseServiceName(service.title).toLowerCase();
  return truncate(
    `${service.description} Plan secure ${serviceName} with VIZIA Technologies for reliable delivery, clear scope, and production support.`,
    158
  );
}

function buildServiceKeywords(service: ServiceSeoInput) {
  const serviceName = sentenceCaseServiceName(service.title);
  return Array.from(
    new Set([
      ...(service.keywords ?? []),
      serviceName,
      `${serviceName} services`,
      `${serviceName} company`,
      `${serviceName} consultation`,
      "VIZIA Technologies",
    ])
  );
}

function buildGeneratedSocialImage(input: PageMetadataInput) {
  const url = new URL("/og", getSiteUrl());
  url.searchParams.set("title", truncate(input.title, 82));
  url.searchParams.set("description", truncate(input.description, 150));
  url.searchParams.set("path", cleanPathname(input.path));
  url.searchParams.set("label", input.imageLabel ?? siteConfig.name);

  return {
    url: url.toString(),
    width: SOCIAL_IMAGE_SIZE.width,
    height: SOCIAL_IMAGE_SIZE.height,
    alt: `${input.title} social preview image`,
    type: "image/png",
  };
}

function normalizeImage(image: SeoImage) {
  if (typeof image === "string" || image instanceof URL) {
    return {
      url: absoluteUrl(image),
      width: SOCIAL_IMAGE_SIZE.width,
      height: SOCIAL_IMAGE_SIZE.height,
      alt: `${siteConfig.name} social preview image`,
    };
  }

  return {
    ...image,
    url: absoluteUrl(image.url),
    width: image.width ?? SOCIAL_IMAGE_SIZE.width,
    height: image.height ?? SOCIAL_IMAGE_SIZE.height,
    alt: image.alt ?? `${siteConfig.name} social preview image`,
  };
}

function normalizeImages(input: PageMetadataInput) {
  const images = input.images?.length
    ? input.images.map(normalizeImage)
    : [buildGeneratedSocialImage(input)];

  return images.length ? images : undefined;
}

export function createPageMetadata(input: PageMetadataInput): Metadata {
  const canonical = absoluteUrl(input.canonical ?? input.path);
  const images = normalizeImages(input);
  const openGraph =
    input.type === "article"
      ? ({
          type: "article",
          siteName: siteConfig.name,
          title: input.title,
          description: input.description,
          url: canonical,
          images,
        } satisfies Metadata["openGraph"])
      : ({
          type: "website",
          siteName: siteConfig.name,
          title: input.title,
          description: input.description,
          url: canonical,
          images,
          locale: siteConfig.locale,
        } satisfies Metadata["openGraph"]);

  return {
    title: input.absoluteTitle ? { absolute: input.title } : input.title,
    description: input.description,
    alternates: {
      canonical,
    },
    keywords: input.keywords ? [...input.keywords] : undefined,
    openGraph,
    twitter: {
      card: "summary_large_image",
      title: input.title,
      description: input.description,
      images,
    },
    robots: input.robots ?? indexableRobots,
  };
}

export function createRootMetadata(): Metadata {
  return {
    ...createPageMetadata({
      title: "VIZIA Technologies | Secure Software, AI & Cybersecurity",
      description:
        "Build secure software, AI automation, cyber security, cloud infrastructure, and IoT systems with VIZIA Technologies.",
      path: "/",
      keywords: siteConfig.keywords,
      absoluteTitle: true,
      imageLabel: "Secure engineering partner",
    }),
    metadataBase: getSiteUrl(),
    title: {
      default: "VIZIA Technologies | Secure Software, AI & Cybersecurity",
      template: `%s | ${siteConfig.name}`,
    },
  };
}

export function createServiceMetadata(service: ServiceSeoInput): Metadata {
  const canonicalSlug = getCanonicalServiceSlug(service.slug);
  const serviceName = sentenceCaseServiceName(service.title);

  return createPageMetadata({
    title: buildServiceTitle(serviceName),
    description: buildServiceDescription(service),
    path: `/services/${canonicalSlug}`,
    keywords: buildServiceKeywords(service),
    imageLabel: "Technology service",
  });
}

export function createStaticServiceMetadata(slug: string): Metadata {
  const service = getServiceBySlug(slug);

  if (!service) {
    return createPageMetadata({
      title: "Technology Service",
      description:
        "Explore secure software, AI, cybersecurity, infrastructure, and automation services from VIZIA Technologies.",
      path: `/services/${getCanonicalServiceSlug(slug)}`,
      imageLabel: "Technology service",
      keywords: siteConfig.keywords,
    });
  }

  return createServiceMetadata({
    slug,
    title: service.name,
    description: service.summary,
    keywords: service.keywords,
  });
}

export function buildOrganizationJsonLd() {
  const { "@context": _context, "@type": _type, ...organization } = siteConfig.jsonLdOrganization;

  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${absoluteUrl("/")}#organization`,
    ...organization,
    url: absoluteUrl("/"),
  };
}

export function buildWebsiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${absoluteUrl("/")}#website`,
    name: siteConfig.name,
    url: absoluteUrl("/"),
    inLanguage: siteConfig.language,
    publisher: {
      "@id": `${absoluteUrl("/")}#organization`,
    },
  };
}

export function buildWebPageJsonLd(input: {
  name: string;
  description: string;
  path: string;
  pageType?: "WebPage" | "AboutPage" | "ContactPage";
  mainEntityId?: string;
}) {
  const pageUrl = absoluteUrl(input.path);

  return {
    "@context": "https://schema.org",
    "@type": input.pageType ?? "WebPage",
    "@id": `${pageUrl}#webpage`,
    name: input.name,
    description: input.description,
    url: pageUrl,
    isPartOf: {
      "@id": `${absoluteUrl("/")}#website`,
    },
    about: {
      "@id": `${absoluteUrl("/")}#organization`,
    },
    ...(input.mainEntityId
      ? {
          mainEntity: {
            "@id": input.mainEntityId,
          },
        }
      : {}),
  } satisfies SchemaNode;
}

export function buildAboutPageJsonLd(input: {
  name: string;
  description: string;
  path: string;
}) {
  return buildWebPageJsonLd({
    ...input,
    pageType: "AboutPage",
  });
}

export function buildContactPageJsonLd(input: {
  name: string;
  description: string;
  path: string;
}) {
  return buildWebPageJsonLd({
    ...input,
    pageType: "ContactPage",
  });
}

export function buildServiceJsonLd(service: ServiceSeoInput) {
  const canonicalSlug = getCanonicalServiceSlug(service.slug);
  const serviceUrl = absoluteUrl(`/services/${canonicalSlug}`);

  return {
    "@context": "https://schema.org",
    "@type": "Service",
    "@id": `${serviceUrl}#service`,
    name: `${siteConfig.name} - ${service.title}`,
    url: serviceUrl,
    serviceType: service.title,
    description: service.description,
    areaServed: "Global",
    provider: {
      "@type": "Organization",
      "@id": `${absoluteUrl("/")}#organization`,
    },
  };
}

export function buildBreadcrumbJsonLd(items: readonly BreadcrumbItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

export function buildItemListJsonLd(name: string, items: readonly ItemListEntry[]) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name,
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      description: item.description,
      url: absoluteUrl(item.path),
    })),
  };
}

export function buildArticleJsonLd(input: {
  name: string;
  description: string;
  path: string;
  image?: string | URL | { url: string | URL; width?: number; height?: number; alt?: string };
  author?: string;
  datePublished?: string | null;
  dateModified?: string | null;
  keywords?: readonly string[];
}) {
  const articleUrl = absoluteUrl(input.path);
  const image = input.image
    ? typeof input.image === "string" || input.image instanceof URL
      ? { url: absoluteUrl(input.image) }
      : {
          ...input.image,
          url: absoluteUrl(input.image.url),
        }
    : undefined;

  return {
    "@context": "https://schema.org",
    "@type": "Article",
    "@id": `${articleUrl}#article`,
    headline: input.name,
    description: input.description,
    url: articleUrl,
    isPartOf: {
      "@id": `${articleUrl}#webpage`,
    },
    mainEntityOfPage: {
      "@id": `${articleUrl}#webpage`,
    },
    author: {
      "@type": "Organization",
      "@id": `${absoluteUrl("/")}#organization`,
      name: input.author ?? siteConfig.name,
    },
    publisher: {
      "@type": "Organization",
      "@id": `${absoluteUrl("/")}#organization`,
      name: siteConfig.name,
    },
    datePublished: input.datePublished ?? undefined,
    dateModified: input.dateModified ?? input.datePublished ?? undefined,
    image: image
      ? {
          "@type": "ImageObject",
          url: image.url,
          width: image.width ?? SOCIAL_IMAGE_SIZE.width,
          height: image.height ?? SOCIAL_IMAGE_SIZE.height,
          caption: image.alt,
        }
      : undefined,
    keywords: input.keywords?.length ? input.keywords.join(", ") : undefined,
  } satisfies SchemaNode;
}

export function buildSchemaGraph(nodes: readonly SchemaNode[]) {
  return {
    "@context": "https://schema.org",
    "@graph": nodes,
  };
}
