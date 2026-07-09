/**
 * Security Headers Middleware
 * Applies recommended security headers for API responses.
 */

const { env } = require("../config/env");

function securityHeadersMiddleware(req, res, next) {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("X-XSS-Protection", "1; mode=block");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=(), payment=(), usb=(), magnetometer=(), gyroscope=(), accelerometer=()"
  );
  res.setHeader("Cross-Origin-Opener-Policy", "same-origin-allow-popups");
  res.setHeader("Cross-Origin-Resource-Policy", "same-site");
  res.setHeader("Cache-Control", "no-store");

  if (env.isProd) {
    res.setHeader(
      "Strict-Transport-Security",
      "max-age=31536000; includeSubDomains; preload"
    );
  }

  const csp =
    "default-src 'none'; " +
    "frame-ancestors 'none'; " +
    "base-uri 'none'; " +
    "form-action 'none'";
  res.setHeader("Content-Security-Policy", csp);

  next();
}

module.exports = { securityHeadersMiddleware };
