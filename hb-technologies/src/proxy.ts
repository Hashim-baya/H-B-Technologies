import { NextRequest, NextResponse } from "next/server";

import {
  getApexRedirectHost,
  HSTS_HEADER_VALUE,
  isSecureRequest,
  MAX_REDIRECT_CHAIN,
  RATE_LIMIT_MAX_REQUESTS,
  RATE_LIMIT_WINDOW_MS,
  SECURITY_HEADER_ENTRIES,
  shouldEnforceTransportSecurity,
} from "@/lib/security";
import {
  getCleanPathname,
  isLegacyEncodedExternalBlogPath,
  shouldCleanPathname,
} from "@/lib/url-governance";

const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0]?.trim() || "unknown";
  }
  return request.headers.get("x-real-ip") || "unknown";
}

function checkRateLimit(ip: string, maxRequests: number): boolean {
  const now = Date.now();
  const entry = rateLimitStore.get(ip);

  if (!entry || now > entry.resetTime) {
    rateLimitStore.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW_MS });
    return true;
  }

  if (entry.count >= maxRequests) {
    return false;
  }

  entry.count += 1;
  return true;
}

function cleanupRateLimitStore(): void {
  const now = Date.now();
  for (const [ip, entry] of rateLimitStore.entries()) {
    if (now > entry.resetTime) {
      rateLimitStore.delete(ip);
    }
  }
}

function getRedirectCount(request: NextRequest): number {
  return parseInt(request.headers.get("x-redirect-count") || "0", 10);
}

function isRedirectLoop(request: NextRequest): boolean {
  return getRedirectCount(request) >= MAX_REDIRECT_CHAIN;
}

function applySecurityHeaders(
  response: NextResponse,
  options: { includeHsts: boolean }
): NextResponse {
  for (const header of SECURITY_HEADER_ENTRIES) {
    response.headers.set(header.key, header.value);
  }

  if (options.includeHsts) {
    response.headers.set("Strict-Transport-Security", HSTS_HEADER_VALUE);
  }

  return response;
}

function createRedirect(
  request: NextRequest,
  url: URL,
  status: 301 | 302 | 308,
  includeHsts: boolean
): NextResponse {
  const redirectCount = getRedirectCount(request) + 1;
  const response = NextResponse.redirect(url, status);
  response.headers.set("X-Redirect-Count", redirectCount.toString());
  response.headers.set("Cache-Control", "no-cache, no-store, must-revalidate");
  return applySecurityHeaders(response, { includeHsts });
}

function legacyGoneResponse(): NextResponse {
  const response = new NextResponse(
    "<!doctype html><html lang=\"en\"><head><meta charset=\"utf-8\"><meta name=\"robots\" content=\"noindex, nofollow\"><title>410 Gone</title></head><body><main><h1>410 Gone</h1><p>This duplicate external article URL has been removed.</p><p><a href=\"/\">Return home</a></p></main></body></html>",
    {
      status: 410,
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "X-Robots-Tag": "noindex, nofollow, noarchive",
        "Cache-Control": "no-cache, no-store, must-revalidate",
      },
    }
  );

  return applySecurityHeaders(response, { includeHsts: true });
}

function rateLimitedResponse(): NextResponse {
  const response = new NextResponse("Too Many Requests", {
    status: 429,
    headers: {
      "Retry-After": "60",
      "Cache-Control": "no-cache, no-store, must-revalidate",
    },
  });

  return applySecurityHeaders(response, { includeHsts: true });
}

function redirectLoopResponse(): NextResponse {
  const response = new NextResponse("Redirect Loop Detected", {
    status: 508,
    headers: {
      "Cache-Control": "no-cache, no-store, must-revalidate",
    },
  });

  return applySecurityHeaders(response, { includeHsts: true });
}

export function proxy(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const { pathname } = requestUrl;
  const host = request.headers.get("host") || requestUrl.host;
  const forwardedProto = request.headers.get("x-forwarded-proto");
  const includeHsts = shouldEnforceTransportSecurity(host);

  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/.well-known") ||
    /\.[a-z0-9]+$/i.test(pathname)
  ) {
    return NextResponse.next();
  }

  if (Math.random() < 0.01) {
    cleanupRateLimitStore();
  }

  if (isRedirectLoop(request)) {
    return redirectLoopResponse();
  }

  if (isLegacyEncodedExternalBlogPath(pathname)) {
    return legacyGoneResponse();
  }

  if (
    includeHsts &&
    !isSecureRequest(requestUrl.protocol, forwardedProto)
  ) {
    const httpsUrl = new URL(request.url);
    httpsUrl.protocol = "https:";
    return createRedirect(request, httpsUrl, 301, includeHsts);
  }

  const apexRedirectHost = getApexRedirectHost(host);

  if (apexRedirectHost && host.split(":")[0].toLowerCase() !== apexRedirectHost) {
    const canonicalUrl = new URL(request.url);
    canonicalUrl.protocol = "https:";
    canonicalUrl.host = apexRedirectHost;
    return createRedirect(request, canonicalUrl, 301, includeHsts);
  }

  if (shouldCleanPathname(pathname)) {
    const cleanUrl = new URL(request.url);
    cleanUrl.pathname = getCleanPathname(pathname);
    if (cleanUrl.pathname !== pathname || cleanUrl.href !== request.url) {
      return createRedirect(request, cleanUrl, 301, includeHsts);
    }
  }

  const clientIp = getClientIp(request);
  const rateLimitMax = pathname.startsWith("/api/") ? 40 : RATE_LIMIT_MAX_REQUESTS;

  if (!checkRateLimit(clientIp, rateLimitMax)) {
    return rateLimitedResponse();
  }

  const response = NextResponse.next();
  const remaining = Math.max(
    0,
    rateLimitMax - (rateLimitStore.get(clientIp)?.count || 0)
  );

  response.headers.set("X-RateLimit-Limit", rateLimitMax.toString());
  response.headers.set("X-RateLimit-Remaining", remaining.toString());

  return applySecurityHeaders(response, { includeHsts });
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)",
  ],
};
