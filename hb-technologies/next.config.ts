import type { NextConfig } from "next";
import { SERVICE_REDIRECTS, TEMPORARY_REDIRECTS } from "./src/lib/url-governance";

const securityHeaders = [
  { key: "X-DNS-Prefetch-Control", value: "on" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  trailingSlash: false,
  skipProxyUrlNormalize: true,
  skipTrailingSlashRedirect: true,
  outputFileTracingRoot: process.cwd(),
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
      {
        source: "/api/:path*",
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow, noarchive" }],
      },
      {
        source: "/admin/:path*",
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow, noarchive" }],
      },
    ];
  },
  async redirects() {
    const serviceRedirects = Object.entries(SERVICE_REDIRECTS).map(
      ([source, destination]) => ({
        source: `/services/${source}`,
        destination: `/services/${destination}`,
        statusCode: 301,
      })
    );

    return [...serviceRedirects, ...TEMPORARY_REDIRECTS];
  },
};

export default nextConfig;
