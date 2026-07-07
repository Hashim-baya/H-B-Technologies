import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { services as staticServices } from "@/content/services";
import { loadSiteContent } from "@/lib/content";
import Breadcrumbs from "@/components/Breadcrumbs";
import marketing from "@/styles/marketing.module.css";
import {
  absoluteUrl,
  buildBreadcrumbJsonLd,
  createServiceMetadata,
} from "@/lib/seo";

export const revalidate = 0;

type ServiceView = {
  slug: string;
  title: string;
  short_description: string;
  full_description: string;
  technologies: string[];
  benefits: string[];
  case_examples: string[];
  keywords: string[];
};

async function resolveService(slug: string): Promise<ServiceView | null> {
  const c = await loadSiteContent();
  const jsonItem = c.services_page.items.find(s => s.slug === slug);

  if (jsonItem) {
    return {
      slug: jsonItem.slug,
      title: jsonItem.name,
      short_description: jsonItem.summary,
      full_description: jsonItem.full_description,
      technologies: jsonItem.technologies,
      benefits: jsonItem.benefits,
      case_examples: jsonItem.case_examples,
      keywords: [],
    };
  }

  const staticItem = staticServices.find(s => s.slug === slug);
  if (!staticItem) return null;
  return {
    slug: staticItem.slug,
    title: staticItem.name,
    short_description: staticItem.summary,
    full_description: staticItem.summary,
    technologies: staticItem.technologies,
    benefits: staticItem.benefits,
    case_examples: ["Discovery and architecture workshop", "Implementation and security review", "Deployment and handover"],
    keywords: staticItem.keywords,
  };
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const service = await resolveService(slug);
  if (!service) return {};

  return createServiceMetadata({
    slug: service.slug,
    title: service.title,
    description: service.short_description,
    keywords: service.keywords,
  });
}

export default async function ServiceDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const service = await resolveService(slug);
  if (!service) notFound();

  const siteContent = await loadSiteContent();
  const related = siteContent.services_page.items
    .filter((s) => s.slug !== service.slug)
    .slice(0, 3)
    .map((s) => ({ slug: s.slug, title: s.name }));

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    name: `VIZIA Technologies — ${service.title}`,
    url: absoluteUrl(`/services/${service.slug}`),
    serviceType: service.title,
    description: service.short_description,
    areaServed: "Global",
    provider: {
      "@type": "Organization",
      name: "VIZIA Technologies",
    },
  };
  const breadcrumbJsonLd = buildBreadcrumbJsonLd([
    { name: "Home", path: "/" },
    { name: "Services", path: "/services" },
    { name: service.title, path: `/services/${service.slug}` },
  ]);

  return (
    <section className="section">
      <div className="container">
        <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Services", href: "/services" }, { label: service.title }]} />
        <h1>{service.title}</h1>
        <p className={`muted ${marketing.lead}`}>{service.short_description}</p>

        <div className={marketing.twoCol}>
          <article className={`card ${marketing.pad3}`}>
            <h2 className={marketing.sectionTitle}>Overview</h2>
            <p className="muted">{service.full_description}</p>
          </article>

          <article className={`card ${marketing.pad3}`}>
            <h2 className={marketing.sectionTitle}>Technologies used</h2>
            {service.technologies.length ? (
              <ul>
                {service.technologies.map((t) => (
                  <li key={t}>{t}</li>
                ))}
              </ul>
            ) : (
              <p className="muted">Selected based on your requirements.</p>
            )}
          </article>

          <article className={`card ${marketing.pad3}`}>
            <h2 className={marketing.sectionTitle}>Benefits</h2>
            {service.benefits.length ? (
              <ul>
                {service.benefits.map((b) => (
                  <li key={b}>{b}</li>
                ))}
              </ul>
            ) : (
              <p className="muted">
                Security-first delivery, improved reliability, and clearer operations.
              </p>
            )}
          </article>

          <article className={`card ${marketing.pad3}`}>
            <h2 className={marketing.sectionTitle}>Case examples</h2>
            {service.case_examples.length ? (
              <ul>
                {service.case_examples.map((c) => (
                  <li key={c}>{c}</li>
                ))}
              </ul>
            ) : (
              <ul>
                <li>Secure implementation with validated inputs and access control</li>
                <li>Performance and SEO improvements for production traffic</li>
                <li>Deployment hardening and monitoring for reliable operations</li>
              </ul>
            )}
          </article>
        </div>

        {related.length ? (
          <div className={`card ${marketing.pad4} ${marketing.mt4}`}>
            <h2>Related services</h2>
            <p className="muted">
              Explore additional capabilities that complement this engagement.
            </p>
            <div className={marketing.mt2}>
              {related.map((s) => (
                <Link key={s.slug} className="btn" href={`/services/${s.slug}`}>
                  {s.title}
                </Link>
              ))}
            </div>
          </div>
        ) : null}

        <div className={`card ${marketing.pad4} ${marketing.mt4}`}>
          <h2>Talk to an engineer</h2>
          <p className="muted">
            Get a scoped plan, timeline, and security considerations for this service.
          </p>
          <div className={marketing.mt2}>
            <Link className="btn btnPrimary" href="/book-consultation">
              Book a consultation
            </Link>
          </div>
        </div>

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
        />
      </div>
    </section>
  );
}
