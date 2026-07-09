const { z } = require("zod");

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .optional()
    .default("development"),
  PORT: z.coerce.number().int().positive().optional().default(4000),
  CORS_ORIGINS: z.string().optional().default(""),
  JWT_SECRET: z.string().min(32).or(z.string().min(8)),
  JWT_EXPIRES_IN: z.string().optional().default("15m"),
  SUPABASE_URL: z.string().url().optional().or(z.literal("")),
  SUPABASE_SERVICE_ROLE_KEY: z.string().optional().or(z.literal("")),
  EMAIL_HOST: z.string().optional().or(z.literal("")),
  EMAIL_PORT: z.string().optional().or(z.literal("")),
  EMAIL_USER: z.string().optional().or(z.literal("")),
  EMAIL_PASS: z.string().optional().or(z.literal("")),
  EMAIL_FROM: z.string().optional().or(z.literal("")).default("htechnob@gmail.com"),
  EMAIL_TEST_TOKEN: z.string().optional().or(z.literal("")),
  EMAIL_WEBHOOK_URL: z.string().url().optional().or(z.literal("")),
  EMAIL_WEBHOOK_SECRET: z.string().optional().or(z.literal("")),
  WHATSAPP_ACCESS_TOKEN: z.string().optional().or(z.literal("")),
  WHATSAPP_PHONE_NUMBER_ID: z.string().optional().or(z.literal("")),
  WHATSAPP_RECIPIENT_NUMBER: z.string().optional().or(z.literal("")),
  WHATSAPP_TEMPLATE_NAME: z.string().optional().or(z.literal("")),
  WHATSAPP_TEMPLATE_LANGUAGE: z.string().optional().or(z.literal("")),
  WHATSAPP_API_VERSION: z.string().optional().or(z.literal("")),
  RATE_LIMIT_WINDOW_MS: z.coerce.number().int().positive().optional().default(60000),
  RATE_LIMIT_MAX: z.coerce.number().int().positive().optional().default(120),
  CONSULTATION_RATE_LIMIT_MAX: z.coerce.number().int().positive().optional().default(5),
  CONSULTATION_RATE_LIMIT_WINDOW: z.coerce.number().int().positive().optional().default(900000),
});

function parseOrigins(value) {
  return String(value || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

const parsed = envSchema.parse({
  NODE_ENV: process.env.NODE_ENV,
  PORT: process.env.PORT,
  CORS_ORIGINS: process.env.CORS_ORIGINS,
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN,
  SUPABASE_URL: process.env.SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
  EMAIL_HOST: process.env.EMAIL_HOST,
  EMAIL_PORT: process.env.EMAIL_PORT,
  EMAIL_USER: process.env.EMAIL_USER,
  EMAIL_PASS: process.env.EMAIL_PASS,
  EMAIL_FROM: process.env.EMAIL_FROM || "htechnob@gmail.com",
  EMAIL_TEST_TOKEN: process.env.EMAIL_TEST_TOKEN,
  EMAIL_WEBHOOK_URL: process.env.EMAIL_WEBHOOK_URL,
  EMAIL_WEBHOOK_SECRET: process.env.EMAIL_WEBHOOK_SECRET,
  WHATSAPP_ACCESS_TOKEN: process.env.WHATSAPP_ACCESS_TOKEN,
  WHATSAPP_PHONE_NUMBER_ID: process.env.WHATSAPP_PHONE_NUMBER_ID,
  WHATSAPP_RECIPIENT_NUMBER: process.env.WHATSAPP_RECIPIENT_NUMBER,
  WHATSAPP_TEMPLATE_NAME: process.env.WHATSAPP_TEMPLATE_NAME,
  WHATSAPP_TEMPLATE_LANGUAGE: process.env.WHATSAPP_TEMPLATE_LANGUAGE,
  WHATSAPP_API_VERSION: process.env.WHATSAPP_API_VERSION,
  RATE_LIMIT_WINDOW_MS: process.env.RATE_LIMIT_WINDOW_MS,
  RATE_LIMIT_MAX: process.env.RATE_LIMIT_MAX,
  CONSULTATION_RATE_LIMIT_MAX: process.env.CONSULTATION_RATE_LIMIT_MAX,
  CONSULTATION_RATE_LIMIT_WINDOW: process.env.CONSULTATION_RATE_LIMIT_WINDOW,
});

const env = parsed;

if (env.NODE_ENV === "production") {
  const insecureJwtValues = new Set([
    "change-me-in-production",
    "changeme",
    "secret",
    "jwt-secret",
  ]);

  if (!env.JWT_SECRET || env.JWT_SECRET.length < 32 || insecureJwtValues.has(env.JWT_SECRET.toLowerCase())) {
    throw new Error(
      "JWT_SECRET must be a strong random value of at least 32 characters in production."
    );
  }

  if (parseOrigins(env.CORS_ORIGINS).length === 0) {
    throw new Error("CORS_ORIGINS must be configured with production frontend origins.");
  }
}

module.exports = {
  env: {
    ...env,
    corsOrigins: parseOrigins(env.CORS_ORIGINS),
    isProd: env.NODE_ENV === "production",
    rateLimitWindowMs: env.RATE_LIMIT_WINDOW_MS,
    rateLimitMax: env.RATE_LIMIT_MAX,
    consultationRateLimitMax: env.CONSULTATION_RATE_LIMIT_MAX,
    consultationRateLimitWindow: env.CONSULTATION_RATE_LIMIT_WINDOW,
    emailFrom: env.EMAIL_FROM,
    emailWebhookUrl: env.EMAIL_WEBHOOK_URL,
  },
};
