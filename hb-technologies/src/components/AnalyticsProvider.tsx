"use client";

import { useEffect, ReactNode } from "react";
import { getAnalyticsService } from "@/lib/analytics-service";
import { usePageView } from "@/hooks/useAnalytics";

/**
 * AnalyticsProvider Component
 *
 * Wraps the application and initializes analytics on startup.
 * Should be placed high in the component tree (near root layout).
 *
 * Features:
 * - Initializes all analytics platforms
 * - Tracks page views automatically
 * - Handles consent management
 * - Respects user privacy preferences
 *
 * Usage:
 * <AnalyticsProvider>
 *   <YourApp />
 * </AnalyticsProvider>
 */

interface AnalyticsProviderProps {
  children: ReactNode;
}

export function AnalyticsProvider({ children }: AnalyticsProviderProps) {
  // Track page views
  usePageView();

  // Initialize analytics on mount
  useEffect(() => {
    const analytics = getAnalyticsService();

    // Initialize analytics platforms
    analytics.initialize().catch((error) => {
      console.error("[Analytics] Initialization failed:", error);
    });

    // Cleanup on unmount
    return () => {
      // Analytics service runs in background, no cleanup needed
    };
  }, []);

  return <>{children}</>;
}

export default AnalyticsProvider;
