import Link from "next/link";
import { loadSiteContent } from "@/lib/content";
import { buildItemListJsonLd, buildSchemaGraph, buildWebPageJsonLd, createPageMetadata } from "@/lib/seo";
import Breadcrumbs from "@/components/Breadcrumbs";
import marketing from "@/styles/marketing.module.css";

export const metadata = createPageMetadata({
  title: "Software, AI & Cybersecurity Services",
  description:
    "Explore secure web, mobile, AI, data, cloud, cyber security, IoT, automation, and network engineering services from VIZIA Technologies.",
  path: "/services",
  imageLabel: "Technology services",
  keywords: [
    "software development services",
    "AI development services",
    "cyber security services",
    "IoT solutions",
    "network engineering services",
  ],
});

export const revalidate = 0;

export default async function ServicesPage() {
  const c = await loadSiteContent();
  const { heading, lead, items } = c.services_page;
  const itemListJsonLd = buildItemListJsonLd(
    "VIZIA Technologies Services",
    items.map((service) => ({
      name: service.name,
      description: service.summary,
      path: `/services/${service.slug}`,
    }))
  );
  const servicesJsonLd = buildSchemaGraph([
    buildWebPageJsonLd({
      name: "Software, AI & Cybersecurity Services",
      description:
        "Explore secure web, mobile, AI, data, cloud, cyber security, IoT, automation, and network engineering services from VIZIA Technologies.",
      path: "/services",
    }),
    itemListJsonLd,
  ]);

  return (
    <section className="section">
      <div className="container">
        <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Services" }]} />
        <h1>{heading}</h1>
        <p className={`muted ${marketing.lead}`}>{lead}</p>

        <div className={marketing.gridCards}>
          {items.map((s) => (
            <article key={s.slug} className="card">
              <div className={marketing.cardBody}>
                <h2 className={marketing.cardTitle}>{s.name}</h2>
                <p className={`muted ${marketing.cardDesc}`}>{s.summary}</p>
                <div className={marketing.mt2}>
                  <Link className="btn" href={`/services/${s.slug}`}>
                    Explore {s.name}
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(servicesJsonLd) }}
        />
      </div>
    </section>
  );
}
