import type { Metadata } from "next";
import "./globals.css";
import { FloatingWhatsAppButton } from "@/components/FloatingWhatsAppButton";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import ScrollProgress from "@/components/ScrollProgress";
import { siteConfig } from "@/lib/site";
import { loadSiteContent } from "@/lib/content";
import { buildOrganizationJsonLd, createRootMetadata } from "@/lib/seo";

export const metadata: Metadata = createRootMetadata();

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const siteContent = await loadSiteContent();
  return (
    <html lang={siteConfig.language}>
      <body>
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

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(buildOrganizationJsonLd()),
          }}
        />
      </body>
    </html>
  );
}
