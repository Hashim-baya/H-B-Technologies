import { ConsultationForm } from "@/components/ConsultationForm";
import Breadcrumbs from "@/components/Breadcrumbs";
import { buildSchemaGraph, buildWebPageJsonLd, createPageMetadata } from "@/lib/seo";
import marketing from "@/styles/marketing.module.css";

export const metadata = createPageMetadata({
  title: "Book a Technology Consultation",
  description:
    "Book a consultation with VIZIA Technologies to scope secure software, AI automation, cyber security, cloud, or IoT delivery.",
  path: "/book-consultation",
  imageLabel: "Book consultation",
  keywords: [
    "book technology consultation",
    "software project consultation",
    "AI consultation",
    "cyber security consultation",
  ],
});

const bookConsultationSchema = buildSchemaGraph([
  buildWebPageJsonLd({
    name: "Book a Technology Consultation",
    description:
      "Book a consultation with VIZIA Technologies to scope secure software, AI automation, cyber security, cloud, or IoT delivery.",
    path: "/book-consultation",
  }),
]);

export default function BookConsultationPage() {
  return (
    <section className="section">
      <div className="container">
        <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Book consultation" }]} />
        <h1>Book a consultation</h1>
        <p className={`muted ${marketing.lead}`}>
          We’ll scope requirements, identify risks, and propose an architecture
          and delivery plan.
        </p>

        <div className={marketing.twoCol}>
          <div className={`card ${marketing.pad3}`}>
            <h2 className={marketing.sectionTitle}>Request a slot</h2>
            <ConsultationForm source="book-consultation" />
          </div>

          <div className={`card ${marketing.pad3}`}>
            <h2 className={marketing.sectionTitle}>What to prepare</h2>
            <ul>
              <li>What you’re building and who it serves</li>
              <li>Key deadlines, integrations, and data sensitivity</li>
              <li>Security requirements and compliance constraints</li>
              <li>Success metrics and measurable outcomes</li>
            </ul>
            <p className="muted">
              You’ll receive a follow-up with next steps and recommended options.
            </p>
          </div>
        </div>

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(bookConsultationSchema) }}
        />
      </div>
    </section>
  );
}
