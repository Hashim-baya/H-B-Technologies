/**
 * Analytics React Hooks
 *
 * Provides React hooks for easy event tracking throughout the application.
 * These hooks handle initialization, cleanup, and proper React lifecycle integration.
 *
 * Usage:
 * - useAnalytics() - Get analytics service instance
 * - usePageView() - Track page views
 * - useOutboundLink() - Track outbound link clicks
 * - useFormTracking() - Track form submissions
 * - useScrollTracking() - Track scroll depth
 */

"use client";

import { useEffect, useCallback, useRef } from "react";
import {
  getAnalyticsService,
  AnalyticsOptions,
  ConsentSettings,
} from "./analytics-service";
import { ANALYTICS_EVENTS } from "./analytics-config";

/**
 * useAnalytics Hook
 *
 * Get the analytics service instance for manual event tracking
 *
 * @example
 * const { trackEvent, trackFormSubmit } = useAnalytics();
 * trackEvent("custom_event", { param: "value" });
 */
export function useAnalytics() {
  const analyticsRef = useRef(getAnalyticsService());

  useEffect(() => {
    // Initialize analytics on first mount
    analyticsRef.current.initialize();
  }, []);

  return {
    trackEvent: (
      eventName: string,
      parameters?: Record<string, any>,
      options?: AnalyticsOptions
    ) => analyticsRef.current.trackEvent(eventName, parameters, options),

    trackPageView: () => analyticsRef.current.trackPageView(),

    trackOutboundLink: (url: string, linkText?: string) =>
      analyticsRef.current.trackOutboundLink(url, linkText),

    trackFileDownload: (fileName: string, fileType?: string, fileSize?: number) =>
      analyticsRef.current.trackFileDownload(fileName, fileType, fileSize),

    trackFormSubmit: (
      formName: string,
      formType?: string,
      fieldCount?: number
    ) => analyticsRef.current.trackFormSubmit(formName, formType, fieldCount),

    trackButtonClick: (buttonName: string, buttonText?: string) =>
      analyticsRef.current.trackButtonClick(buttonName, buttonText),

    trackScroll: (depth: number) => analyticsRef.current.trackScroll(depth),

    trackVideoEvent: (
      videoTitle: string,
      event: "start" | "complete" | "progress",
      duration?: number,
      currentTime?: number
    ) =>
      analyticsRef.current.trackVideoEvent(
        videoTitle,
        event,
        duration,
        currentTime
      ),

    trackServiceView: (serviceName: string, serviceCategory?: string) =>
      analyticsRef.current.trackServiceView(serviceName, serviceCategory),

    trackCustomEvent: (
      eventName: string,
      parameters?: Record<string, any>
    ) => analyticsRef.current.trackCustomEvent(eventName, parameters),

    trackConversion: (conversionName: string) =>
      analyticsRef.current.trackConversion(conversionName),

    setConsent: (consent: Partial<ConsentSettings>) =>
      analyticsRef.current.setConsent(consent),

    getConsent: () => analyticsRef.current.getConsent(),
  };
}

/**
 * usePageView Hook
 *
 * Automatically track page views when component mounts or URL changes
 *
 * @example
 * usePageView();
 */
export function usePageView() {
  const { trackPageView } = useAnalytics();

  useEffect(() => {
    trackPageView();
  }, [trackPageView]);
}

/**
 * useOutboundLink Hook
 *
 * Attach outbound link tracking to a ref or element
 *
 * @example
 * const { ref } = useOutboundLink();
 * return <a ref={ref} href="https://example.com">External Link</a>;
 */
export function useOutboundLink() {
  const { trackOutboundLink } = useAnalytics();
  const ref = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const handleClick = (e: MouseEvent) => {
      const href = element.getAttribute("href");
      const text = element.textContent;

      if (href && href.startsWith("http")) {
        trackOutboundLink(href, text || undefined);
      }
    };

    element.addEventListener("click", handleClick);
    return () => element.removeEventListener("click", handleClick);
  }, [trackOutboundLink]);

  return { ref };
}

/**
 * useFormTracking Hook
 *
 * Track form submission with automatic field counting
 *
 * @param formName - Name of the form for tracking
 * @param formType - Type of form (contact, consultation, etc.)
 *
 * @example
 * const { onSubmit } = useFormTracking("contact_form", "contact");
 * return <form onSubmit={onSubmit}>...</form>;
 */
export function useFormTracking(formName: string, formType?: string) {
  const { trackFormSubmit } = useAnalytics();

  const onSubmit = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      const form = e.currentTarget;
      const fieldCount = form.querySelectorAll("input, textarea, select").length;
      trackFormSubmit(formName, formType, fieldCount);
    },
    [formName, formType, trackFormSubmit]
  );

  return { onSubmit };
}

/**
 * useScrollTracking Hook
 *
 * Track scroll depth percentage on page
 * Reports at 25%, 50%, 75%, and 100% scroll depth
 *
 * @example
 * useScrollTracking();
 */
export function useScrollTracking() {
  const { trackScroll } = useAnalytics();
  const reportedDepthRef = useRef<Set<number>>(new Set());

  useEffect(() => {
    const reportScrollDepth = () => {
      if (typeof window === "undefined") return;

      const scrollTop = window.scrollY;
      const docHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      const scrollPercent = Math.round((scrollTop / docHeight) * 100);

      // Report at 25% increments
      const roundedDepth = Math.floor(scrollPercent / 25) * 25;

      if (
        roundedDepth > 0 &&
        !reportedDepthRef.current.has(roundedDepth)
      ) {
        reportedDepthRef.current.add(roundedDepth);
        trackScroll(roundedDepth);
      }
    };

    window.addEventListener("scroll", reportScrollDepth, { passive: true });
    return () => window.removeEventListener("scroll", reportScrollDepth);
  }, [trackScroll]);
}

/**
 * useOutboundLinkTracking Hook
 *
 * Automatically track all outbound links on a page or within a component
 * Attach to a container element to track all links within it
 *
 * @example
 * const { ref } = useOutboundLinkTracking();
 * return <div ref={ref}>...</div>;
 */
export function useOutboundLinkTracking() {
  const { trackOutboundLink } = useAnalytics();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = ref.current;
    if (!container) return;

    const handleLinkClick = (e: MouseEvent) => {
      const link = (e.target as HTMLElement).closest("a[href]");
      if (!link) return;

      const href = link.getAttribute("href");
      const text = link.textContent;

      if (href && href.startsWith("http") && href.includes("://")) {
        trackOutboundLink(href, text || undefined);
      }
    };

    container.addEventListener("click", handleLinkClick);
    return () => container.removeEventListener("click", handleLinkClick);
  }, [trackOutboundLink]);

  return { ref };
}

/**
 * useVideoTracking Hook
 *
 * Track video engagement events (play, complete, progress)
 *
 * @param videoTitle - Title of the video
 * @param videoDuration - Duration of video in seconds
 *
 * @example
 * useVideoTracking("Product Demo", 120);
 */
export function useVideoTracking(
  videoTitle: string,
  videoDuration?: number
) {
  const { trackVideoEvent } = useAnalytics();
  const playTrackedRef = useRef(false);
  const completeTrackedRef = useRef(false);

  const onPlay = useCallback(() => {
    if (!playTrackedRef.current) {
      trackVideoEvent(videoTitle, "start", videoDuration);
      playTrackedRef.current = true;
    }
  }, [videoTitle, videoDuration, trackVideoEvent]);

  const onComplete = useCallback(() => {
    if (!completeTrackedRef.current) {
      trackVideoEvent(videoTitle, "complete", videoDuration);
      completeTrackedRef.current = true;
    }
  }, [videoTitle, videoDuration, trackVideoEvent]);

  const onProgress = useCallback(
    (currentTime: number) => {
      // Track at 50% progress
      if (
        videoDuration &&
        currentTime > videoDuration * 0.5 &&
        !completeTrackedRef.current
      ) {
        trackVideoEvent(videoTitle, "progress", videoDuration, currentTime);
      }
    },
    [videoTitle, videoDuration, trackVideoEvent]
  );

  return {
    onPlay,
    onComplete,
    onProgress,
  };
}

/**
 * useButtonTracking Hook
 *
 * Track button clicks easily
 *
 * @param buttonName - Name/ID of button
 *
 * @example
 * const { onClick } = useButtonTracking("cta_button");
 * return <button onClick={onClick}>Click Me</button>;
 */
export function useButtonTracking(buttonName: string) {
  const { trackButtonClick } = useAnalytics();

  const onClick = useCallback(
    (e?: React.MouseEvent<HTMLButtonElement>) => {
      const buttonText = (e?.currentTarget?.textContent || buttonName).trim();
      trackButtonClick(buttonName, buttonText);
    },
    [buttonName, trackButtonClick]
  );

  return { onClick };
}

/**
 * useTimeOnPage Hook
 *
 * Track how long user spends on a page
 * Reports after specified duration
 *
 * @param reportInterval - Milliseconds before reporting (default 60000 = 1 minute)
 *
 * @example
 * useTimeOnPage(60000);
 */
export function useTimeOnPage(reportInterval: number = 60000) {
  const { trackEvent } = useAnalytics();
  const startTimeRef = useRef(Date.now());
  const reportedRef = useRef(false);

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (!reportedRef.current) {
        const timeOnPage = Date.now() - startTimeRef.current;
        trackEvent(ANALYTICS_EVENTS.TIME_ON_PAGE, {
          time_on_page_ms: timeOnPage,
          time_on_page_sec: Math.round(timeOnPage / 1000),
        });
        reportedRef.current = true;
      }
    }, reportInterval);

    return () => clearTimeout(timeout);
  }, [reportInterval, trackEvent]);
}

/**
 * useConsentManager Hook
 *
 * Manage user consent preferences
 *
 * @example
 * const { consent, setConsent, acceptAll, rejectAll } = useConsentManager();
 */
export function useConsentManager() {
  const { getConsent, setConsent } = useAnalytics();

  const consent = getConsent();

  const acceptAll = useCallback(() => {
    setConsent({
      analytics: true,
      marketing: true,
      functional: true,
    });
  }, [setConsent]);

  const rejectAll = useCallback(() => {
    setConsent({
      analytics: false,
      marketing: false,
      functional: true, // Functional always accepted
    });
  }, [setConsent]);

  const updateConsent = useCallback(
    (updates: Partial<ConsentSettings>) => {
      setConsent(updates);
    },
    [setConsent]
  );

  return {
    consent,
    setConsent: updateConsent,
    acceptAll,
    rejectAll,
  };
}

export default useAnalytics;
