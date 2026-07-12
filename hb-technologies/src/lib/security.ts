/**
 * Shared production security configuration for Next.js headers and proxy.
 */

export const PRODUCTION_CANONICAL_HOST = "www.vizia.co.ke";

export const APEX_HOST_REDIRECTS: Record<string, string> = {
  "vizia.co.ke": PRODUCTION_CANONICAL_HOST,
};

export const RATE_LIMIT_WINDOW_MS = 60_000;
export const RATE_LIMIT_MAX_REQUESTS = 100;
export const API_RATE_LIMIT_MAX_REQUESTS = 40;
export const MAX_REDIRECT_CHAIN = 5;

export const CONTENT_SECURITY_POLICY = [
  // Default policy
  "default-src 'self'",

  // JavaScript
  [
    "script-src",
    "'self'",
    "'unsafe-inline'",
    "'unsafe-eval'",
    "https://www.googletagmanager.com",
    "https://www.google-analytics.com",
    "https://*.clarity.ms",
    "https://bat.bing.com",
    "https://www.youtube.com",
    "https://www.youtube-nocookie.com",
    "https://www.ytimg.com",
  ].join(" "),

  // Stylesheets
  [
    "style-src",
    "'self'",
    "'unsafe-inline'",
    "https://fonts.googleapis.com",
  ].join(" "),

  // Images
  [
    "img-src",
    "'self'",
    "data:",
    "blob:",
    "https:",
    "https://images.unsplash.com",
    "https://www.google-analytics.com",
    "https://www.googletagmanager.com",
    "https://*.clarity.ms",
    "https://bat.bing.com",
    "https://www.youtube.com",
    "https://www.youtube-nocookie.com",
    "https://www.ytimg.com",
  ].join(" "),

  // Fonts
  [
    "font-src",
    "'self'",
    "https://fonts.gstatic.com",
  ].join(" "),

  // AJAX / Fetch / WebSocket connections
  [
    "connect-src",
    "'self'",
    "https://*.supabase.co",
    "wss://*.supabase.co",
    "https://www.google-analytics.com",
    "https://www.googletagmanager.com",
    "https://*.clarity.ms",
    "https://bat.bing.com",
    "https://api.dev.to",
  ].join(" "),

  // Video / Audio
  [
    "media-src",
    "'self'",
    "blob:",
    "https:",
    "https://www.youtube.com",
    "https://www.youtube-nocookie.com",
  ].join(" "),

  // Embedded frames
  [
    "frame-src",
    "'self'",
    "https://www.youtube.com",
    "https://www.youtube-nocookie.com",
  ].join(" "),

  // Child frames
  [
    "child-src",
    "'self'",
    "https://www.youtube.com",
    "https://www.youtube-nocookie.com",
  ].join(" "),

  // Web Workers
  [
    "worker-src",
    "'self'",
    "blob:",
  ].join(" "),

  // Manifest
  [
    "manifest-src",
    "'self'",
  ].join(" "),

  "form-action 'self'",
  "base-uri 'self'",
  "frame-ancestors 'none'",
  "object-src 'none'",
  "upgrade-insecure-requests",
].join("; ");

export const HSTS_HEADER_VALUE = "max-age=31536000; includeSubDomains; preload";

export const PERMISSIONS_POLICY =
  "camera=(), microphone=(), geolocation=(), payment=(), usb=(), magnetometer=(), gyroscope=(), accelerometer=()";

export const SECURITY_HEADER_ENTRIES: Array<{ key: string; value: string }> = [
  { key: "X-DNS-Prefetch-Control", value: "on" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: PERMISSIONS_POLICY },
  { key: "X-XSS-Protection", value: "1; mode=block" },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin-allow-popups" },
  { key: "Cross-Origin-Resource-Policy", value: "same-site" },
  { key: "Content-Security-Policy", value: CONTENT_SECURITY_POLICY },
];

export const CACHE_HEADERS = {
  static: "public, max-age=31536000, immutable",
  page: "public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800",
  seo: "public, max-age=86400, s-maxage=604800",
  og: "public, max-age=86400, s-maxage=604800",
  noStore: "no-cache, no-store, must-revalidate",
} as const;

export function shouldEnforceTransportSecurity(host: string): boolean {
  const normalized = host.toLowerCase();
  return (
    normalized !== "localhost" &&
    !normalized.startsWith("localhost:") &&
    !normalized.startsWith("127.0.0.1")
  );
}

export function isSecureRequest(protocol: string, forwardedProto: string | null): boolean {
  if (protocol === "https:") return true;
  return forwardedProto === "https";
}

export function getCanonicalHost(): string {
  const configured =
    process.env.VIZIA_DOMAIN_NAME ||
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/^https?:\/\//, "").replace(/\/$/, "");

  if (configured) {
    return configured.replace(/^https?:\/\//, "").replace(/\/$/, "");
  }

  return PRODUCTION_CANONICAL_HOST;
}

export function getApexRedirectHost(host: string): string | null {
  const hostname = host.split(":")[0].toLowerCase();
  return APEX_HOST_REDIRECTS[hostname] ?? null;
}
