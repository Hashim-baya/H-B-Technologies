/**
 * Environment Variable Validation
 *
 * This module validates that all required environment variables are properly set
 * in production and prevents the application from starting with missing configuration.
 *
 * Production security best practice:
 * - Never log actual values (only log presence)
 * - Fail fast on missing critical variables
 * - Distinguish between required and optional variables
 * - Validate format/structure where applicable
 */

type EnvironmentVariables = {
  // Site URL (canonical production origin)
  NEXT_PUBLIC_SITE_URL?: string;

  // Supabase Configuration
  NEXT_PUBLIC_SUPABASE_URL?: string;
  NEXT_PUBLIC_SUPABASE_ANON_KEY?: string;

  // Domain Configuration
  VIZIA_DOMAIN_NAME?: string;

  // API Configuration
  API_URL?: string;
  NEXT_PUBLIC_API_URL?: string;
  NEXT_PUBLIC_API_TIMEOUT?: string;

  // Analytics Configuration
  NEXT_PUBLIC_GA_ID?: string;

  // Feature Flags
  NEXT_PUBLIC_ENABLE_COMMENTS?: string;
  NEXT_PUBLIC_ENABLE_ANALYTICS?: string;

  // Runtime Environment
  NODE_ENV?: "development" | "production" | "test";
  VERCEL_ENV?: "development" | "preview" | "production";
  VERCEL_URL?: string;
};

type ValidationResult = {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  missingOptional: string[];
};

/**
 * Validate URL format
 */
function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Validate UUID format
 */
function isValidUuid(uuid: string): boolean {
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

/**
 * Validate domain name format
 */
function isValidDomain(domain: string): boolean {
  const domainRegex =
    /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)*[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/i;
  return domainRegex.test(domain);
}

function isLocalhostUrl(url: string): boolean {
  try {
    const hostname = new URL(url).hostname;
    return hostname === "localhost" || hostname === "127.0.0.1";
  } catch {
    return false;
  }
}

/**
 * Main validation function
 */
export function validateEnvironment(
  env: EnvironmentVariables = process.env as unknown as EnvironmentVariables
): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const missingOptional: string[] = [];

  // Production-specific checks
  const isProduction =
    env.NODE_ENV === "production" || env.VERCEL_ENV === "production";

  // ============================================================
  // CRITICAL VARIABLES (Required in production)
  // ============================================================

  if (isProduction) {
    if (!env.NEXT_PUBLIC_SITE_URL) {
      errors.push("NEXT_PUBLIC_SITE_URL is required in production");
    } else if (!isValidUrl(env.NEXT_PUBLIC_SITE_URL)) {
      errors.push(
        "NEXT_PUBLIC_SITE_URL is not a valid URL: " + env.NEXT_PUBLIC_SITE_URL
      );
    } else if (isLocalhostUrl(env.NEXT_PUBLIC_SITE_URL)) {
      errors.push(
        "NEXT_PUBLIC_SITE_URL must not point to localhost in production"
      );
    } else if (!env.NEXT_PUBLIC_SITE_URL.startsWith("https://")) {
      errors.push("NEXT_PUBLIC_SITE_URL must use https:// in production");
    }

    // Supabase Configuration
    if (!env.NEXT_PUBLIC_SUPABASE_URL) {
      errors.push("NEXT_PUBLIC_SUPABASE_URL is required in production");
    } else if (!isValidUrl(env.NEXT_PUBLIC_SUPABASE_URL)) {
      errors.push(
        "NEXT_PUBLIC_SUPABASE_URL is not a valid URL: " +
          env.NEXT_PUBLIC_SUPABASE_URL
      );
    }

    if (!env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      errors.push("NEXT_PUBLIC_SUPABASE_ANON_KEY is required in production");
    } else if (!isValidUuid(env.NEXT_PUBLIC_SUPABASE_ANON_KEY.split(".")[0])) {
      warnings.push(
        "NEXT_PUBLIC_SUPABASE_ANON_KEY format looks unusual (may still be valid)"
      );
    }

    // Domain Configuration
    if (!env.VIZIA_DOMAIN_NAME) {
      warnings.push(
        "VIZIA_DOMAIN_NAME not explicitly set (will fallback to VERCEL_URL or default)"
      );
      missingOptional.push("VIZIA_DOMAIN_NAME");
    } else if (!isValidDomain(env.VIZIA_DOMAIN_NAME)) {
      errors.push(
        "VIZIA_DOMAIN_NAME is not a valid domain name: " + env.VIZIA_DOMAIN_NAME
      );
    }
  }

  // ============================================================
  // OPTIONAL VARIABLES (Warnings if missing)
  // ============================================================

  if (!env.API_URL && !env.NEXT_PUBLIC_API_URL) {
    missingOptional.push("API_URL");
  } else {
    const apiUrl = env.API_URL || env.NEXT_PUBLIC_API_URL;
    if (apiUrl && !isValidUrl(apiUrl)) {
      warnings.push("API_URL is not a valid URL: " + apiUrl);
    }
    if (isProduction && apiUrl && !apiUrl.startsWith("https://")) {
      warnings.push("API_URL should use https:// in production");
    }
  }

  if (!env.NEXT_PUBLIC_API_URL) {
    missingOptional.push("NEXT_PUBLIC_API_URL");
  } else if (!isValidUrl(env.NEXT_PUBLIC_API_URL)) {
    warnings.push(
      "NEXT_PUBLIC_API_URL is not a valid URL: " + env.NEXT_PUBLIC_API_URL
    );
  }

  if (!env.NEXT_PUBLIC_GA_ID) {
    missingOptional.push("NEXT_PUBLIC_GA_ID");
    if (isProduction) {
      warnings.push(
        "NEXT_PUBLIC_GA_ID not set - analytics will not be tracked"
      );
    }
  }

  // ============================================================
  // SECURITY CHECKS
  // ============================================================

  // Check for sensitive variables in logs
  if (isProduction && env.NODE_ENV !== "production") {
    warnings.push("NODE_ENV mismatch with VERCEL_ENV");
  }

  // Check for secrets accidentally exposed via NEXT_PUBLIC_ prefix
  const suspiciousPublicKeys = Object.keys(process.env).filter(
    (key) =>
      key.startsWith("NEXT_PUBLIC_") &&
      /(SECRET|PASSWORD|SERVICE_ROLE|PRIVATE_KEY)/i.test(key)
  );

  if (suspiciousPublicKeys.length > 0) {
    errors.push(
      `Sensitive values must not use NEXT_PUBLIC_ prefix: ${suspiciousPublicKeys.join(", ")}`
    );
  }

  // Validate API timeout
  if (env.NEXT_PUBLIC_API_TIMEOUT) {
    const timeout = parseInt(env.NEXT_PUBLIC_API_TIMEOUT, 10);
    if (isNaN(timeout) || timeout < 1000 || timeout > 60000) {
      warnings.push(
        "NEXT_PUBLIC_API_TIMEOUT should be between 1000ms and 60000ms"
      );
    }
  }

  // ============================================================
  // RETURN VALIDATION RESULT
  // ============================================================

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    missingOptional,
  };
}

/**
 * Assert environment is valid (throws on error)
 */
export function assertEnvironmentValid(
  env: EnvironmentVariables = process.env as unknown as EnvironmentVariables
): void {
  const result = validateEnvironment(env);

  if (!result.isValid) {
    const errorMessage = [
      "❌ Environment Validation Failed:",
      ...result.errors.map((e) => `  - ${e}`),
    ].join("\n");

    throw new Error(errorMessage);
  }

  // Log warnings (don't fail, just warn)
  if (result.warnings.length > 0) {
    const warningMessage = [
      "⚠️  Environment Warnings:",
      ...result.warnings.map((w) => `  - ${w}`),
    ].join("\n");

    console.warn(warningMessage);
  }

  // Log missing optional variables
  if (result.missingOptional.length > 0) {
    const info = [
      "ℹ️  Optional variables not set:",
      ...result.missingOptional.map((v) => `  - ${v}`),
    ].join("\n");

    console.info(info);
  }

  console.log("✅ Environment validation passed");
}

/**
 * Get masked environment summary (for logging without exposing values)
 */
export function getMaskedEnvironmentSummary(
  env: EnvironmentVariables = process.env as unknown as EnvironmentVariables
): Record<string, string> {
  return {
    NODE_ENV: env.NODE_ENV || "not set",
    VERCEL_ENV: env.VERCEL_ENV || "not set",
    VERCEL_URL: env.VERCEL_URL || "not set",
    NEXT_PUBLIC_SITE_URL: env.NEXT_PUBLIC_SITE_URL ? "SET" : "NOT SET",
    NEXT_PUBLIC_SUPABASE_URL: env.NEXT_PUBLIC_SUPABASE_URL ? "SET" : "NOT SET",
    NEXT_PUBLIC_SUPABASE_ANON_KEY: env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      ? "SET"
      : "NOT SET",
    VIZIA_DOMAIN_NAME: env.VIZIA_DOMAIN_NAME || "not set",
    API_URL: env.API_URL ? "SET" : "NOT SET",
    NEXT_PUBLIC_API_URL: env.NEXT_PUBLIC_API_URL ? "SET" : "NOT SET",
    NEXT_PUBLIC_GA_ID: env.NEXT_PUBLIC_GA_ID ? "SET" : "NOT SET",
  };
}

// Auto-validate on module load in production server contexts only.
if (
  typeof process !== "undefined" &&
  process.env.NEXT_RUNTIME === "nodejs" &&
  (process.env.NODE_ENV === "production" || process.env.VERCEL_ENV === "production")
) {
  try {
    assertEnvironmentValid();
  } catch (error) {
    console.error(error);
    throw error;
  }
}

export default {
  validateEnvironment,
  assertEnvironmentValid,
  getMaskedEnvironmentSummary,
};
