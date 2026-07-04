import type { Metadata } from "next";

import { getServiceBySlug } from "@/content/services";
import { getSiteUrl, siteConfig } from "@/lib/site";
import { getCanonicalServiceSlug, cleanPathname } from "@/lib/url-governance";

type SeoImage = string | URL;

type PageMetadataInput = {
  title: string;
  description: string;
  path: string;
  canonical?: string | URL;
  type?: "website" | "article";
  keywords?: readonly string[];
  images?: readonly SeoImage[];
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

export const indexableRobots = {
  index: true,
  follow: true,
} satisfies Metadata["robots"];

export const noIndexFollowRobots = {
  index: false,
  follow: true,
  googleBot: {
    index: false,
    follow: true,
  },
} satisfies Metadata["robots"];

export const noIndexNoFollowRobots = {
  index: false,
  follow: false,
  googleBot: {
    index: false,
    follow: false,
  },
} satisfies Metadata["robots"];

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

function normalizeImages(images?: readonly SeoImage[]) {
  const urls = images
    ?.map((image) => absoluteUrl(image))
    .filter(Boolean);

  return urls?.length ? urls : undefined;
}

export function createPageMetadata(input: PageMetadataInput): Metadata {
  const canonical = absoluteUrl(input.canonical ?? input.path);
  const images = normalizeImages(input.images);
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
      card: images?.length ? "summary_large_image" : "summary",
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
      title: siteConfig.name,
      description: siteConfig.description,
      path: "/",
      keywords: siteConfig.keywords,
      absoluteTitle: true,
    }),
    metadataBase: getSiteUrl(),
    title: {
      default: siteConfig.name,
      template: `%s | ${siteConfig.name}`,
    },
  };
}

export function createServiceMetadata(service: ServiceSeoInput): Metadata {
  const canonicalSlug = getCanonicalServiceSlug(service.slug);

  return createPageMetadata({
    title: service.title,
    description: service.description,
    path: `/services/${canonicalSlug}`,
    keywords: service.keywords,
  });
}

export function createStaticServiceMetadata(slug: string): Metadata {
  const service = getServiceBySlug(slug);

  if (!service) {
    return createPageMetadata({
      title: "Service",
      description: siteConfig.description,
      path: `/services/${getCanonicalServiceSlug(slug)}`,
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
  return {
    ...siteConfig.jsonLdOrganization,
    url: absoluteUrl("/"),
  };
}

export function buildServiceJsonLd(service: ServiceSeoInput) {
  const canonicalSlug = getCanonicalServiceSlug(service.slug);

  return {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    name: `${siteConfig.name} - ${service.title}`,
    url: absoluteUrl(`/services/${canonicalSlug}`),
    serviceType: service.title,
    description: service.description,
    areaServed: "Global",
    provider: {
      "@type": "Organization",
      name: siteConfig.name,
      url: absoluteUrl("/"),
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

export function buildBlogJsonLd(posts: readonly ItemListEntry[]) {
  return {
    "@context": "https://schema.org",
    "@type": "Blog",
    name: `${siteConfig.name} Blog`,
    url: absoluteUrl("/blog"),
    blogPost: posts.map((post) => ({
      "@type": "BlogPosting",
      headline: post.name,
      description: post.description,
      url: absoluteUrl(post.path),
    })),
  };
}
