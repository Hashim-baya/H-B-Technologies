"use client";

import { useState, useEffect } from "react";
import { useConsentManager } from "@/hooks/useAnalytics";
import styles from "./CookieConsent.module.css";

/**
 * CookieConsent Component
 *
 * Displays a cookie/privacy consent banner to users.
 * Allows granular control over different types of tracking.
 *
 * Features:
 * - GDPR/Privacy compliant consent management
 * - Granular category selection (analytics, marketing, functional)
 * - Persistent consent preferences (localStorage)
 * - Easy accept/reject options
 * - Professional styling
 *
 * Usage:
 * <CookieConsent />
 *
 * The component will only show if user hasn't previously made a choice.
 * If user has already consented, component remains hidden.
 */

export function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const { consent, acceptAll, rejectAll, setConsent } = useConsentManager();

  useEffect(() => {
    // Check if user has already made a consent choice
    const hasConsentChoice = localStorage.getItem("analytics_consent");
    if (!hasConsentChoice) {
      setIsVisible(true);
    }
  }, []);

  if (!isVisible) {
    return null;
  }

  const handleAcceptAll = () => {
    acceptAll();
    setIsVisible(false);
  };

  const handleRejectAll = () => {
    rejectAll();
    setIsVisible(false);
  };

  const handleSavePreferences = () => {
    setIsVisible(false);
  };

  const toggleAnalytics = () => {
    setConsent({ ...consent, analytics: !consent.analytics });
  };

  const toggleMarketing = () => {
    setConsent({ ...consent, marketing: !consent.marketing });
  };

  return (
    <div className={styles.cookieConsentOverlay}>
      <div className={styles.cookieConsentBanner}>
        {/* Header */}
        <div className={styles.header}>
          <h2>Privacy & Cookie Preferences</h2>
          <button
            className={styles.closeButton}
            onClick={() => setIsVisible(false)}
            aria-label="Close cookie consent banner"
          >
            ×
          </button>
        </div>

        {/* Main Content */}
        {!showDetails ? (
          <div className={styles.mainContent}>
            <p className={styles.description}>
              We use cookies and similar tracking technologies to enhance your
              experience, personalize content, and analyze our traffic. Please
              select your preferences below.
            </p>

            {/* Action Buttons */}
            <div className={styles.actions}>
              <button
                className={styles.buttonAccept}
                onClick={handleAcceptAll}
              >
                Accept All
              </button>
              <button
                className={styles.buttonReject}
                onClick={handleRejectAll}
              >
                Reject All
              </button>
              <button
                className={styles.buttonDetails}
                onClick={() => setShowDetails(true)}
              >
                Customize
              </button>
            </div>

            {/* Privacy Policy Link */}
            <p className={styles.footer}>
              <a href="/privacy-policy" target="_blank" rel="noopener noreferrer">
                View our Privacy Policy
              </a>
            </p>
          </div>
        ) : (
          <div className={styles.detailsContent}>
            <p className={styles.description}>
              Select which types of cookies you'd like to accept.
            </p>

            {/* Consent Categories */}
            <div className={styles.consentCategories}>
              {/* Functional Cookies */}
              <div className={styles.consentCategory}>
                <div className={styles.categoryHeader}>
                  <input
                    type="checkbox"
                    id="functional"
                    checked={true}
                    disabled
                  />
                  <label htmlFor="functional">
                    <strong>Functional Cookies (Required)</strong>
                  </label>
                </div>
                <p className={styles.categoryDescription}>
                  Essential for website functionality. Always enabled.
                </p>
              </div>

              {/* Analytics Cookies */}
              <div className={styles.consentCategory}>
                <div className={styles.categoryHeader}>
                  <input
                    type="checkbox"
                    id="analytics"
                    checked={consent.analytics}
                    onChange={toggleAnalytics}
                  />
                  <label htmlFor="analytics">
                    <strong>Analytics Cookies</strong>
                  </label>
                </div>
                <p className={styles.categoryDescription}>
                  Help us understand how you use our website. Includes Google
                  Analytics and Microsoft Clarity.
                </p>
              </div>

              {/* Marketing Cookies */}
              <div className={styles.consentCategory}>
                <div className={styles.categoryHeader}>
                  <input
                    type="checkbox"
                    id="marketing"
                    checked={consent.marketing}
                    onChange={toggleMarketing}
                  />
                  <label htmlFor="marketing">
                    <strong>Marketing Cookies</strong>
                  </label>
                </div>
                <p className={styles.categoryDescription}>
                  Used for retargeting and personalized advertising across
                  platforms.
                </p>
              </div>
            </div>

            {/* Save Preferences */}
            <div className={styles.actions}>
              <button
                className={styles.buttonAccept}
                onClick={handleSavePreferences}
              >
                Save Preferences
              </button>
              <button
                className={styles.buttonDetails}
                onClick={() => setShowDetails(false)}
              >
                Back
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default CookieConsent;
