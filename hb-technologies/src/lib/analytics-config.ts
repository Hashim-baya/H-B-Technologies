/**
 * Analytics Configuration
 *
 * Centralized configuration for all analytics platforms:
 * - Google Analytics 4 (GA4)
 * - Google Tag Manager (GTM)
 * - Microsoft Clarity
 *
 * All tracking IDs and configuration values are stored here
 * for easy management and deployment across environments.
 */

// ============================================================
// ENVIRONMENT DETECTION
// ============================================================

export const isProduction =
  typeof window !== "undefined" &&
  (window.location.hostname === "www.vizia.co.ke" ||
    window.location.hostname === "vizia.co.ke");

export const isDevelopment =
  typeof window !== "undefined" &&
  (window.location.hostname === "localhost" ||
    window.location.hostname.includes("127.0.0.1"));

// ============================================================
// TRACKING IDS
// ============================================================

/**
 * Google Analytics 4
 * Tracking ID format: G-XXXXXXXXXX
 *
 * Setup:
 * 1. Create GA4 property in Google Analytics
 * 2. Get the Measurement ID (G-XXXXXXXXXX)
 * 3. Add to environment variables
 *
 * Environment Variables:
 * - NEXT_PUBLIC_GA_ID (client-side, publicly visible)
 */
export const GA4_CONFIG = {
  trackingId: process.env.NEXT_PUBLIC_GA_ID || "",
  enabled: !!process.env.NEXT_PUBLIC_GA_ID,
  debug: isDevelopment,
};

/**
 * Google Tag Manager
 * Container ID format: GTM-XXXXXX
 *
 * Setup:
 * 1. Create GTM account and container
 * 2. Get the Container ID (GTM-XXXXXX)
 * 3. Add to environment variables
 *
 * Environment Variables:
 * - NEXT_PUBLIC_GTM_ID (client-side, publicly visible)
 *
 * GTM Advantages:
 * - No code changes needed to add/modify tracking
 * - A/B testing capabilities
 * - Built-in tag library (Google Ads, Facebook Pixel, etc.)
 * - Custom HTML and JavaScript tags
 */
export const GTM_CONFIG = {
  containerId: process.env.NEXT_PUBLIC_GTM_ID || "",
  enabled: !!process.env.NEXT_PUBLIC_GTM_ID,
  debug: isDevelopment,
};

/**
 * Microsoft Clarity
 * Project ID format: String of numbers
 *
 * Setup:
 * 1. Sign up at clarity.microsoft.com
 * 2. Create a new project
 * 3. Get the Project ID
 * 4. Add to environment variables
 *
 * Environment Variables:
 * - NEXT_PUBLIC_CLARITY_ID (client-side, publicly visible)
 *
 * Clarity Benefits:
 * - Session recordings (heatmaps, session replays)
 * - No PII by default
 * - GDPR compliant
 * - Free tier available
 */
export const CLARITY_CONFIG = {
  projectId: process.env.NEXT_PUBLIC_CLARITY_ID || "",
  enabled: !!process.env.NEXT_PUBLIC_CLARITY_ID,
  debug: isDevelopment,
};

// ============================================================
// GLOBAL CONFIGURATION
// ============================================================

export const ANALYTICS_CONFIG = {
  // Enable/disable analytics globally
  enabled: !isDevelopment || true, // Set to false to disable in dev
  
  // Batch events for better performance
  batchSize: 10,
  batchTimeout: 5000, // 5 seconds

  // Consent delay: delay tracking until consent is given
  respectConsent: true,
  consentCategories: {
    analytics: "analytics",
    marketing: "marketing",
    functional: "functional",
  },

  // Rate limiting
  maxEventsPerSecond: 100,

  // Privacy
  respectDoNotTrack: true,
  anonymizeIP: true,

  // Development mode
  debug: isDevelopment,
  verbose: false, // Extra logging
};

// ============================================================
// EVENT CONFIGURATION
// ============================================================

/**
 * Predefined event names following Google Analytics naming conventions
 * Events are lowercase, underscore-separated for consistency
 */
export const ANALYTICS_EVENTS = {
  // Page Events
  PAGE_VIEW: "page_view",
  SCROLL: "scroll",
  TIME_ON_PAGE: "time_on_page",
  PAGE_EXIT: "page_exit",

  // Navigation Events
  OUTBOUND_LINK_CLICK: "outbound_link_click",
  INTERNAL_LINK_CLICK: "internal_link_click",
  NAVIGATION_MENU_CLICK: "navigation_menu_click",
  BREADCRUMB_CLICK: "breadcrumb_click",

  // Download Events
  FILE_DOWNLOAD: "file_download",
  DOCUMENT_DOWNLOAD: "document_download",
  PDF_DOWNLOAD: "pdf_download",

  // Form Events
  FORM_START: "form_start",
  FORM_SUBMIT: "form_submit",
  FORM_ERROR: "form_error",
  FORM_ABANDON: "form_abandon",

  // Button Events
  BUTTON_CLICK: "button_click",
  CTA_CLICK: "cta_click",
  CALL_BUTTON_CLICK: "call_button_click",
  EMAIL_CLICK: "email_click",

  // Content Events
  VIDEO_START: "video_start",
  VIDEO_COMPLETE: "video_complete",
  CONTENT_VIEW: "content_view",
  BLOG_POST_VIEW: "blog_post_view",
  SERVICE_VIEW: "service_view",

  // Conversion Events
  CONTACT_FORM_SUBMIT: "contact_form_submit",
  CONSULTATION_BOOK: "consultation_book",
  LEAD_GENERATED: "lead_generated",
  PURCHASE: "purchase",

  // Custom Events
  SERVICE_FILTER: "service_filter",
  SEARCH_QUERY: "search_query",
  ERROR_OCCURRED: "error_occurred",
  PERFORMANCE_METRIC: "performance_metric",

  // Session Events
  SESSION_START: "session_start",
  SESSION_END: "session_end",
} as const;

// ============================================================
// EVENT PARAMETERS
// ============================================================

/**
 * Standard parameters included with most events
 */
export const STANDARD_PARAMETERS = {
  page_path: true,
  page_title: true,
  page_referrer: true,
  user_properties: true,
  timestamp: true,
  session_id: true,
};

/**
 * Parameters for specific event types
 */
export const EVENT_PARAMETERS = {
  [ANALYTICS_EVENTS.OUTBOUND_LINK_CLICK]: {
    link_url: "URL of the external link",
    link_domain: "Domain of the external link",
    link_text: "Text content of the link",
  },
  [ANALYTICS_EVENTS.FILE_DOWNLOAD]: {
    file_name: "Name of the downloaded file",
    file_type: "File extension (pdf, doc, xls, etc.)",
    file_size: "Size in bytes",
    file_url: "URL of the file",
  },
  [ANALYTICS_EVENTS.FORM_SUBMIT]: {
    form_name: "Name or ID of the form",
    form_type: "Type of form (contact, consultation, newsletter)",
    form_fields: "Number of fields in form",
  },
  [ANALYTICS_EVENTS.VIDEO_START]: {
    video_title: "Title of the video",
    video_duration: "Duration in seconds",
    video_provider: "Provider (YouTube, Vimeo, etc.)",
  },
  [ANALYTICS_EVENTS.SERVICE_VIEW]: {
    service_name: "Name of the service",
    service_category: "Category of service",
  },
};

// ============================================================
// CONVERSION CONFIGURATION
// ============================================================

/**
 * Conversion events that represent key business actions
 * These should be tracked as conversions in GA4
 */
export const CONVERSION_EVENTS = {
  CONTACT_FORM_SUBMIT: ANALYTICS_EVENTS.CONTACT_FORM_SUBMIT,
  CONSULTATION_BOOK: ANALYTICS_EVENTS.CONSULTATION_BOOK,
  LEAD_GENERATED: ANALYTICS_EVENTS.LEAD_GENERATED,
};

// ============================================================
// EXPORT FOR USE
// ============================================================

export default {
  GA4_CONFIG,
  GTM_CONFIG,
  CLARITY_CONFIG,
  ANALYTICS_CONFIG,
  ANALYTICS_EVENTS,
  STANDARD_PARAMETERS,
  EVENT_PARAMETERS,
  CONVERSION_EVENTS,
  isProduction,
  isDevelopment,
};
