import { ConsultationForm } from "@/components/ConsultationForm";
import { createPageMetadata } from "@/lib/seo";
import marketing from "@/styles/marketing.module.css";

export const metadata = createPageMetadata({
  title: "Book Consultation",
  description:
    "Book a consultation with VIZIA Technologies for secure-by-design engineering and delivery planning.",
  path: "/book-consultation",
});

export default function BookConsultationPage() {
  return (
    <section className="section">
      <div className="container">
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
      </div>
    </section>
  );
}
