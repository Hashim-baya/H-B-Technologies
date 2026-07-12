import type { NextConfig } from "next";
import {
  CACHE_HEADERS,
  HSTS_HEADER_VALUE,
  SECURITY_HEADER_ENTRIES,
} from "./src/lib/security";
import {
  SERVICE_REDIRECTS,
  TEMPORARY_REDIRECTS,
} from "./src/lib/url-governance";

const globalSecurityHeaders = [
  ...SECURITY_HEADER_ENTRIES,
  { key: "Strict-Transport-Security", value: HSTS_HEADER_VALUE },
];

const noCacheHeaders = [
  { key: "Cache-Control", value: CACHE_HEADERS.noStore },
  { key: "Pragma", value: "no-cache" },
  { key: "Expires", value: "0" },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  trailingSlash: false,
  skipTrailingSlashRedirect: true,
  compress: true,

  async headers() {
    return [
      // Global security headers
      {
        source: "/(.*)",
        headers: globalSecurityHeaders,
      },

      // Static assets (excluding Next.js internal assets)
      {
        source: "/videos/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: CACHE_HEADERS.static,
          },
        ],
      },
      {
        source: "/favicon.ico",
        headers: [
          {
            key: "Cache-Control",
            value: CACHE_HEADERS.static,
          },
        ],
      },

      // API endpoints
      {
        source: "/api/:path*",
        headers: [
          ...noCacheHeaders,
          {
            key: "X-Robots-Tag",
            value: "noindex, nofollow, noarchive",
          },
        ],
      },

      // Admin area
      {
        source: "/admin/:path*",
        headers: [
          ...noCacheHeaders,
          {
            key: "X-Robots-Tag",
            value: "noindex, nofollow, noarchive",
          },
        ],
      },

      // Open Graph image generator
      {
        source: "/og",
        headers: [
          {
            key: "Cache-Control",
            value: CACHE_HEADERS.og,
          },
          {
            key: "X-Robots-Tag",
            value: "noindex, nofollow",
          },
        ],
      },

      // SEO files
      {
        source: "/robots.txt",
        headers: [
          {
            key: "Cache-Control",
            value: CACHE_HEADERS.seo,
          },
        ],
      },
      {
        source: "/sitemap.xml",
        headers: [
          {
            key: "Cache-Control",
            value: CACHE_HEADERS.seo,
          },
        ],
      },

      // Public pages
      {
        source: "/((?!api|admin|_next|og).*)",
        headers: [
          {
            key: "Cache-Control",
            value: CACHE_HEADERS.page,
          },
        ],
      },

      // Well-known endpoints
      {
        source: "/.well-known/:path*",
        headers: [
          {
            key: "Access-Control-Allow-Origin",
            value: "*",
          },
          {
            key: "Cache-Control",
            value: CACHE_HEADERS.seo,
          },
        ],
      },
    ];
  },

  async redirects() {
    const serviceRedirects = Object.entries(SERVICE_REDIRECTS).map(
      ([source, destination]) => ({
        source: `/services/${source}`,
        destination: `/services/${destination}`,
        permanent: true,
      })
    );

    return [...serviceRedirects, ...TEMPORARY_REDIRECTS];
  },
};

export default nextConfig;