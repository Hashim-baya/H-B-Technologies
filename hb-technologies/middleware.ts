import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Production Middleware
 *
 * Handles:
 * - HTTPS enforcement (HTTP → HTTPS redirects)
 * - Rate limiting (basic IP-based)
 * - Security header validation
 * - Request logging
 * - Redirect loop detection
 */

// Simple in-memory rate limiter (IP-based)
// In production, use Redis or similar for distributed deployments
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 100; // 100 requests per minute per IP

/**
 * Get client IP address from request
 * Handles X-Forwarded-For header for proxied requests (important for CDN compatibility)
 */
function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    // Take the first IP if multiple are present
    return forwarded.split(",")[0].trim();
  }
  
  // Fallback to X-Real-IP if X-Forwarded-For is not present
  const realIp = request.headers.get("x-real-ip");
  if (realIp) {
    return realIp;
  }
  
  // Extract IP from connection if available
  // Note: In edge runtime, this may not be available
  return "unknown";
}

/**
 * Check rate limit for client IP
 * Returns true if within limits, false if rate limited
 */
function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitStore.get(ip);

  if (!entry || now > entry.resetTime) {
    // Create new rate limit entry
    rateLimitStore.set(ip, {
      count: 1,
      resetTime: now + RATE_LIMIT_WINDOW_MS,
    });
    return true;
  }

  if (entry.count >= RATE_LIMIT_MAX_REQUESTS) {
    return false;
  }

  entry.count++;
  return true;
}

/**
 * Clean up old rate limit entries (run periodically)
 */
function cleanupRateLimitStore(): void {
  const now = Date.now();
  for (const [ip, entry] of rateLimitStore.entries()) {
    if (now > entry.resetTime) {
      rateLimitStore.delete(ip);
    }
  }
}

/**
 * Detect potential redirect loops
 * Checks for X-Redirect-Count header
 */
function isRedirectLoop(request: NextRequest): boolean {
  const redirectCount = parseInt(
    request.headers.get("x-redirect-count") || "0",
    10
  );
  // Allow maximum 5 redirects before considering it a loop
  return redirectCount > 5;
}

export function middleware(request: NextRequest) {
  const { pathname, protocol, host } = request.nextUrl;

  // Skip middleware for static assets and .well-known
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/public") ||
    pathname.startsWith("/.well-known") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // Periodic cleanup (every 100 requests)
  if (Math.random() < 0.01) {
    cleanupRateLimitStore();
  }

  // 1. HTTPS Enforcement
  // Force HTTPS in production (not localhost)
  if (
    protocol === "http" &&
    host !== "localhost" &&
    host !== "localhost:3000" &&
    !host.includes("127.0.0.1")
  ) {
    const httpsUrl = new URL(request.url);
    httpsUrl.protocol = "https";
    return NextResponse.redirect(httpsUrl, 301);
  }

  // 2. Rate Limiting
  const clientIp = getClientIp(request);
  if (!checkRateLimit(clientIp)) {
    return new NextResponse("Too Many Requests", {
      status: 429,
      headers: {
        "Retry-After": "60",
        "Cache-Control": "no-cache, no-store, must-revalidate",
      },
    });
  }

  // 3. Redirect Loop Detection
  if (isRedirectLoop(request)) {
    return new NextResponse("Redirect Loop Detected", {
      status: 508,
      headers: {
        "Cache-Control": "no-cache, no-store, must-revalidate",
      },
    });
  }

  // 4. Add security headers to response
  const response = NextResponse.next();

  // HSTS (HTTP Strict-Transport-Security)
  // Tells browsers to always use HTTPS for 1 year
  response.headers.set(
    "Strict-Transport-Security",
    "max-age=31536000; includeSubDomains; preload"
  );

  // CSP (Content Security Policy)
  // Restricts content sources to prevent XSS and injection attacks
  response.headers.set(
    "Content-Security-Policy",
    [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' *.google-analytics.com *.googletagmanager.com *.youtube.com *.ytimg.com",
      "style-src 'self' 'unsafe-inline' fonts.googleapis.com",
      "img-src 'self' data: https: *.google-analytics.com *.googletagmanager.com *.ytimg.com *.youtube.com",
      "font-src 'self' fonts.gstatic.com",
      "connect-src 'self' *.supabase.co *.google-analytics.com *.googletagmanager.com api.dev.to",
      "media-src 'self' *.youtube.com https:",
      "frame-src 'self' *.youtube.com",
      "child-src 'self' *.youtube.com",
      "form-action 'self'",
      "base-uri 'self'",
      "upgrade-insecure-requests",
    ].join("; ")
  );

  // Additional security headers
  response.headers.set("X-XSS-Protection", "1; mode=block");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=(), payment=()"
  );

  // 5. Add rate limit headers
  response.headers.set("X-RateLimit-Limit", RATE_LIMIT_MAX_REQUESTS.toString());
  response.headers.set(
    "X-RateLimit-Remaining",
    (
      RATE_LIMIT_MAX_REQUESTS -
      (rateLimitStore.get(clientIp)?.count || 0)
    ).toString()
  );

  // 6. Add redirect tracking header for loop detection
  const redirectCount = parseInt(
    request.headers.get("x-redirect-count") || "0",
    10
  );
  response.headers.set("X-Redirect-Count", (redirectCount + 1).toString());

  return response;
}

// Configure which routes middleware runs on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
