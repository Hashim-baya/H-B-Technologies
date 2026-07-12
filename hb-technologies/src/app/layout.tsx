import type { Metadata } from "next";
import { Inter, Rajdhani } from "next/font/google";
import "./globals.css";
import { FloatingWhatsAppButton } from "@/components/FloatingWhatsAppButton";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import ScrollProgress from "@/components/ScrollProgress";
import { AnalyticsProvider } from "@/components/AnalyticsProvider";
import { CookieConsent } from "@/components/CookieConsent";
import { siteConfig } from "@/lib/site";
import { loadSiteContent } from "@/lib/content";
import { buildOrganizationJsonLd, buildSchemaGraph, buildWebsiteJsonLd, createRootMetadata } from "@/lib/seo";

export const metadata: Metadata = createRootMetadata();

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

const rajdhani = Rajdhani({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  display: "swap",
  variable: "--font-rajdhani",
});

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const siteContent = await loadSiteContent();
  return (
    <html lang={siteConfig.language} className={`${inter.variable} ${rajdhani.variable}`}>
      <body>
        <AnalyticsProvider>
          <a className="skipLink" href="#main-content">
            Skip to content
          </a>
          <ScrollProgress />
          <SiteHeader nav={siteContent.nav} />
          <main id="main-content" className="main">
            {children}
          </main>
          <SiteFooter />
          <FloatingWhatsAppButton />
          <CookieConsent />

          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify(buildSchemaGraph([buildOrganizationJsonLd(), buildWebsiteJsonLd()])),
            }}
          />
        </AnalyticsProvider>
      </body>
    </html>
  );
}
