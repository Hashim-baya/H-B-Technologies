import Link from "next/link";
import { loadSiteContent } from "@/lib/content";
import { buildItemListJsonLd, createPageMetadata } from "@/lib/seo";
import marketing from "@/styles/marketing.module.css";

export const metadata = createPageMetadata({
  title: "Services",
  description:
    "Explore VIZIA Technologies services: web and mobile development, cyber security, data & AI, network engineering, automation, IoT, and Smart CCTV.",
  path: "/services",
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

  return (
    <section className="section">
      <div className="container">
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
                    View details
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }}
        />
      </div>
    </section>
  );
}
