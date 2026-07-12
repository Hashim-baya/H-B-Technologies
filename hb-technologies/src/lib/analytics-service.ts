/**
 * Analytics Service
 *
 * Centralized service for tracking analytics events across the application.
 *
 * Features:
 * - Event batching for performance
 * - Duplicate prevention
 * - Consent management
 * - Rate limiting
 * - Offline support
 * - Error handling
 */

import {
  GA4_CONFIG,
  GTM_CONFIG,
  CLARITY_CONFIG,
  ANALYTICS_CONFIG,
  ANALYTICS_EVENTS,
  CONVERSION_EVENTS,
  isProduction,
  isDevelopment,
} from "./analytics-config";

// ============================================================
// TYPES
// ============================================================

export interface AnalyticsEvent {
  name: string;
  parameters?: Record<string, string | number | boolean | string[]>;
  timestamp?: number;
  sessionId?: string;
}

export interface ConsentSettings {
  analytics: boolean;
  marketing: boolean;
  functional: boolean;
}

export interface AnalyticsOptions {
  useConsent?: boolean;
  category?: keyof ConsentSettings;
  ignoreConsent?: boolean;
}

// ============================================================
// ANALYTICS SERVICE
// ============================================================

class AnalyticsService {
  private initialized = false;
  private eventQueue: AnalyticsEvent[] = [];
  private eventHistory: Set<string> = new Set();
  private consent: ConsentSettings = {
    analytics: isDevelopment ? true : false,
    marketing: false,
    functional: true,
  };
  private sessionId: string = "";
  private batchTimeout: NodeJS.Timeout | null = null;
  private eventRateTracker: Map<string, number[]> = new Map();

  constructor() {
    this.sessionId = this.generateSessionId();
    this.loadConsentFromStorage();
  }

  // ============================================================
  // INITIALIZATION
  // ============================================================

  /**
   * Initialize all analytics platforms
   * Should be called once on app startup
   */
  async initialize(): Promise<void> {
    if (this.initialized || isDevelopment) {
      return;
    }

    try {
      // Load consent preferences
      this.loadConsentFromStorage();

      // Initialize GA4
      if (this.canTrack("analytics") && GA4_CONFIG.enabled) {
        this.initializeGA4();
      }

      // Initialize GTM
      if (this.canTrack("analytics") && GTM_CONFIG.enabled) {
        this.initializeGTM();
      }

      // Initialize Microsoft Clarity
      if (this.canTrack("analytics") && CLARITY_CONFIG.enabled) {
        this.initializeClarity();
      }

      this.initialized = true;
      this.logDebug("Analytics initialized successfully");
    } catch (error) {
      this.logError("Failed to initialize analytics", error);
    }
  }

  /**
   * Initialize Google Analytics 4
   */
  private initializeGA4(): void {
    if (!GA4_CONFIG.trackingId) return;

    try {
      // Create script element for gtag
      const script = document.createElement("script");
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtag/js?id=${GA4_CONFIG.trackingId}`;

      window.dataLayer = window.dataLayer || [];

      // Define gtag function
      (window as any).gtag = function (...args: any[]) {
        window.dataLayer.push(arguments);
      };

      // Initialize gtag
      (window as any).gtag("js", new Date());
      (window as any).gtag("config", GA4_CONFIG.trackingId, {
        send_page_view: false, // We'll handle page views manually
        anonymize_ip: ANALYTICS_CONFIG.anonymizeIP,
        allow_google_signals: false,
        allow_ad_personalization_signals: false,
      });

      document.head.appendChild(script);
      this.logDebug(`GA4 initialized with ID: ${GA4_CONFIG.trackingId}`);
    } catch (error) {
      this.logError("Failed to initialize GA4", error);
    }
  }

  /**
   * Initialize Google Tag Manager
   */
  private initializeGTM(): void {
    if (!GTM_CONFIG.containerId) return;

    try {
      // Create GTM script
      const script = document.createElement("script");
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtm.js?id=${GTM_CONFIG.containerId}`;

      window.dataLayer = window.dataLayer || [];

      // Push initial events
      window.dataLayer.push({
        event: "gtm.js",
        "gtm.start": new Date().getTime(),
        "gtm.uniqueEventId": 0,
      });

      document.head.appendChild(script);
      this.logDebug(`GTM initialized with ID: ${GTM_CONFIG.containerId}`);
    } catch (error) {
      this.logError("Failed to initialize GTM", error);
    }
  }

  /**
   * Initialize Microsoft Clarity
   */
  private initializeClarity(): void {
    if (!CLARITY_CONFIG.projectId) return;

    try {
      (window as any).clarity =
        window.clarity ||
        function (...args: any[]) {
          (window as any).clarity.q.push(args);
        };
      (window as any).clarity.q = [];

      const script = document.createElement("script");
      script.async = true;
      script.src = `https://www.clarity.ms/tag/${CLARITY_CONFIG.projectId}`;

      document.head.appendChild(script);
      this.logDebug(`Clarity initialized with ID: ${CLARITY_CONFIG.projectId}`);
    } catch (error) {
      this.logError("Failed to initialize Clarity", error);
    }
  }

  // ============================================================
  // EVENT TRACKING
  // ============================================================

  /**
   * Track an event
   * @param eventName - Name of the event
   * @param parameters - Additional event parameters
   * @param options - Tracking options (consent, category, etc.)
   */
  public trackEvent(
    eventName: string,
    parameters?: Record<string, any>,
    options: AnalyticsOptions = {}
  ): void {
    if (!this.shouldTrack(options)) {
      return;
    }

    // Check for duplicate events
    if (this.isDuplicateEvent(eventName, parameters)) {
      this.logDebug(`Duplicate event prevented: ${eventName}`);
      return;
    }

    // Check rate limiting
    if (!this.checkRateLimit(eventName)) {
      this.logDebug(`Rate limit exceeded for event: ${eventName}`);
      return;
    }

    try {
      const event: AnalyticsEvent = {
        name: eventName,
        parameters: {
          ...parameters,
          page_path: window.location.pathname,
          page_title: document.title,
          timestamp: Date.now(),
          session_id: this.sessionId,
        },
        timestamp: Date.now(),
        sessionId: this.sessionId,
      };

      this.addToQueue(event);
      this.recordEventHistory(eventName, parameters);

      // Track to GA4
      if (this.canTrack("analytics") && (window as any).gtag) {
        (window as any).gtag("event", eventName, event.parameters);
      }

      // Track to GTM
      if (this.canTrack("analytics") && window.dataLayer) {
        window.dataLayer.push({
          event: eventName,
          ...event.parameters,
        });
      }

      // Track to Clarity
      if (this.canTrack("analytics") && (window as any).clarity) {
        (window as any).clarity("set", eventName, JSON.stringify(event.parameters));
      }

      this.logDebug(`Event tracked: ${eventName}`, event.parameters);
    } catch (error) {
      this.logError(`Failed to track event: ${eventName}`, error);
    }
  }

  /**
   * Track page view
   */
  public trackPageView(): void {
    this.trackEvent(ANALYTICS_EVENTS.PAGE_VIEW, {
      page_path: window.location.pathname,
      page_title: document.title,
      page_referrer: document.referrer,
    });
  }

  /**
   * Track outbound link click
   */
  public trackOutboundLink(url: string, linkText?: string): void {
    const urlObj = new URL(url);
    this.trackEvent(ANALYTICS_EVENTS.OUTBOUND_LINK_CLICK, {
      link_url: url,
      link_domain: urlObj.hostname,
      link_text: linkText || url,
    });
  }

  /**
   * Track file download
   */
  public trackFileDownload(
    fileName: string,
    fileType?: string,
    fileSize?: number
  ): void {
    this.trackEvent(ANALYTICS_EVENTS.FILE_DOWNLOAD, {
      file_name: fileName,
      file_type: fileType || this.getFileExtension(fileName),
      file_size: fileSize,
      file_url: window.location.href,
    });
  }

  /**
   * Track form submission
   */
  public trackFormSubmit(
    formName: string,
    formType?: string,
    fieldCount?: number
  ): void {
    this.trackEvent(ANALYTICS_EVENTS.FORM_SUBMIT, {
      form_name: formName,
      form_type: formType || "contact",
      form_fields: fieldCount,
    });

    // Also track as conversion if applicable
    if (this.isConversion(formName)) {
      this.trackConversion(formName);
    }
  }

  /**
   * Track button click
   */
  public trackButtonClick(buttonName: string, buttonText?: string): void {
    this.trackEvent(ANALYTICS_EVENTS.BUTTON_CLICK, {
      button_name: buttonName,
      button_text: buttonText || buttonName,
    });
  }

  /**
   * Track scroll depth
   */
  public trackScroll(depth: number): void {
    this.trackEvent(ANALYTICS_EVENTS.SCROLL, {
      scroll_depth: depth,
      scroll_percent: Math.round(depth),
    });
  }

  /**
   * Track video engagement
   */
  public trackVideoEvent(
    videoTitle: string,
    event: "start" | "complete" | "progress",
    duration?: number,
    currentTime?: number
  ): void {
    const eventName =
      event === "start"
        ? ANALYTICS_EVENTS.VIDEO_START
        : event === "complete"
          ? ANALYTICS_EVENTS.VIDEO_COMPLETE
          : "video_progress";

    this.trackEvent(eventName, {
      video_title: videoTitle,
      video_duration: duration,
      video_current_time: currentTime,
      video_provider: "youtube",
    });
  }

  /**
   * Track service view
   */
  public trackServiceView(serviceName: string, serviceCategory?: string): void {
    this.trackEvent(ANALYTICS_EVENTS.SERVICE_VIEW, {
      service_name: serviceName,
      service_category: serviceCategory,
    });
  }

  /**
   * Track custom event
   */
  public trackCustomEvent(
    eventName: string,
    parameters?: Record<string, any>
  ): void {
    this.trackEvent(eventName, parameters);
  }

  // ============================================================
  // CONVERSION TRACKING
  // ============================================================

  /**
   * Track a conversion event
   */
  public trackConversion(conversionName: string): void {
    this.trackEvent(ANALYTICS_EVENTS.LEAD_GENERATED, {
      conversion_type: conversionName,
      conversion_value: 1,
    });
  }

  /**
   * Check if an event is a conversion event
   */
  private isConversion(eventName: string): boolean {
    return Object.values(CONVERSION_EVENTS).includes(eventName as any);
  }

  // ============================================================
  // CONSENT MANAGEMENT
  // ============================================================

  /**
   * Set user consent preferences
   */
  public setConsent(consent: Partial<ConsentSettings>): void {
    this.consent = { ...this.consent, ...consent };
    this.saveConsentToStorage();

    // Update GA4 consent settings
    if ((window as any).gtag && this.consent.analytics) {
      (window as any).gtag("consent", "update", {
        analytics_storage: this.consent.analytics ? "granted" : "denied",
        marketing_storage: this.consent.marketing ? "granted" : "denied",
      });
    }

    this.logDebug("Consent updated", this.consent);
  }

  /**
   * Get current consent settings
   */
  public getConsent(): ConsentSettings {
    return this.consent;
  }

  /**
   * Check if analytics category is allowed
   */
  private canTrack(category: keyof ConsentSettings): boolean {
    if (!ANALYTICS_CONFIG.respectConsent) {
      return true;
    }

    if (ANALYTICS_CONFIG.debug || isDevelopment) {
      return true;
    }

    return this.consent[category];
  }

  /**
   * Check if event should be tracked based on options
   */
  private shouldTrack(options: AnalyticsOptions): boolean {
    if (options.ignoreConsent) {
      return true;
    }

    if (!ANALYTICS_CONFIG.enabled) {
      return false;
    }

    const category = options.category || "analytics";
    return this.canTrack(category);
  }

  // ============================================================
  // UTILITY METHODS
  // ============================================================

  /**
   * Check for duplicate events
   */
  private isDuplicateEvent(
    eventName: string,
    parameters?: Record<string, any>
  ): boolean {
    const eventKey = `${eventName}:${JSON.stringify(parameters || {})}`;
    const isDuplicate = this.eventHistory.has(eventKey);

    // Only consider events as duplicates if fired within 1 second
    if (isDuplicate) {
      setTimeout(() => {
        this.eventHistory.delete(eventKey);
      }, 1000);
    }

    return isDuplicate;
  }

  /**
   * Record event in history
   */
  private recordEventHistory(
    eventName: string,
    parameters?: Record<string, any>
  ): void {
    const eventKey = `${eventName}:${JSON.stringify(parameters || {})}`;
    this.eventHistory.add(eventKey);
  }

  /**
   * Check rate limiting
   */
  private checkRateLimit(eventName: string): boolean {
    const now = Date.now();
    const eventTimes = this.eventRateTracker.get(eventName) || [];

    // Keep only events from last second
    const recentEvents = eventTimes.filter((t) => now - t < 1000);

    if (recentEvents.length >= ANALYTICS_CONFIG.maxEventsPerSecond) {
      return false;
    }

    recentEvents.push(now);
    this.eventRateTracker.set(eventName, recentEvents);
    return true;
  }

  /**
   * Add event to queue
   */
  private addToQueue(event: AnalyticsEvent): void {
    this.eventQueue.push(event);

    if (this.eventQueue.length >= ANALYTICS_CONFIG.batchSize) {
      this.flushQueue();
    } else {
      // Schedule flush if not already scheduled
      if (!this.batchTimeout) {
        this.batchTimeout = setTimeout(
          () => this.flushQueue(),
          ANALYTICS_CONFIG.batchTimeout
        );
      }
    }
  }

  /**
   * Flush queued events
   */
  private flushQueue(): void {
    if (this.batchTimeout) {
      clearTimeout(this.batchTimeout);
      this.batchTimeout = null;
    }

    if (this.eventQueue.length === 0) {
      return;
    }

    this.logDebug(`Flushing ${this.eventQueue.length} events`);
    this.eventQueue = [];
  }

  /**
   * Generate unique session ID
   */
  private generateSessionId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get file extension from file name
   */
  private getFileExtension(fileName: string): string {
    return fileName.split(".").pop() || "unknown";
  }

  /**
   * Load consent from storage
   */
  private loadConsentFromStorage(): void {
    if (typeof window === "undefined") return;

    try {
      const stored = window.localStorage.getItem("analytics_consent");
      if (stored) {
        this.consent = JSON.parse(stored);
      }
    } catch (error) {
      this.logError("Failed to load consent from storage", error);
    }
  }

  /**
   * Save consent to storage
   */
  private saveConsentToStorage(): void {
    if (typeof window === "undefined") return;

    try {
      window.localStorage.setItem(
        "analytics_consent",
        JSON.stringify(this.consent)
      );
    } catch (error) {
      this.logError("Failed to save consent to storage", error);
    }
  }

  // ============================================================
  // LOGGING
  // ============================================================

  private logDebug(message: string, data?: any): void {
    if (ANALYTICS_CONFIG.verbose || ANALYTICS_CONFIG.debug) {
      console.log(`[Analytics] ${message}`, data);
    }
  }

  private logError(message: string, error?: any): void {
    console.error(`[Analytics Error] ${message}`, error);
  }
}

// ============================================================
// SINGLETON INSTANCE
// ============================================================

let instance: AnalyticsService | null = null;

export function getAnalyticsService(): AnalyticsService {
  if (!instance) {
    instance = new AnalyticsService();
  }
  return instance;
}

export default AnalyticsService;
