import Link from "next/link";

import { ConsultationForm } from "@/components/ConsultationForm";
import { WhatsAppLink } from "@/components/WhatsAppLink";
import { WHATSAPP_DEFAULT_MESSAGE } from "@/lib/whatsapp";
import { loadSiteContent } from "@/lib/content";
import { createPageMetadata } from "@/lib/seo";
import marketing from "@/styles/marketing.module.css";

export const revalidate = 0;

export const metadata = createPageMetadata({
  title: "Contact VIZIA Technologies | Consultation & Support",
  description:
    "Get in touch with VIZIA Technologies for AI, cybersecurity, web development, and enterprise IT solutions. Email us or book a consultation.",
  path: "/contact",
});

export default async function ContactPage() {
  const c = await loadSiteContent();
  const CONTACT_EMAIL = c.contact.email;
  const CONTACT_PHONES = c.contact.phones;

  return (
    <>
      <section className="section">
        <div className="container">
          <h1>Contact VIZIA Technologies</h1>
          <p className={`muted ${marketing.lead}`}>
            Reach out to discuss your project requirements. We respond within
            1–2 business days.
          </p>
        </div>
      </section>

      <section className="section" style={{ backgroundColor: "rgba(255, 255, 255, 0.02)" }}>
        <div className="container">
          <div className={marketing.twoCol}>
            <div className={`card ${marketing.pad3}`}>
              <h2 className={marketing.sectionTitle}>Send a message</h2>
              <ConsultationForm source="contact" />
            </div>

            <div className={`card ${marketing.pad3}`}>
              <h2 className={marketing.sectionTitle}>What happens next</h2>
              <ol>
                <li>We confirm goals, constraints, and timelines</li>
                <li>We identify security and performance requirements</li>
                <li>We deliver a scoped plan and delivery roadmap</li>
              </ol>
              <p className={`muted ${marketing.mt2}`}>
                Prefer a scheduled call? Use the consultation page.
              </p>
              <Link className="btn" href="/book-consultation">
                Book consultation
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Details Section */}
      <section className="section">
        <div className="container">
          <div className={marketing.contactGrid}>
            <div className={`card ${marketing.pad3}`}>
              <h2 className={marketing.sectionTitle}>Email & Phone</h2>
              <div className={marketing.contactDetails}>
                <div className={marketing.contactItem}>
                  <p className={marketing.contactLabel}>Email</p>
                  <a
                    href={`mailto:${CONTACT_EMAIL}`}
                    className={marketing.contactValue}
                  >
                    {CONTACT_EMAIL}
                  </a>
                </div>

                <div className={marketing.contactItem}>
                  <p className={marketing.contactLabel}>Phone</p>
                  <ul className={marketing.phoneList}>
                    {CONTACT_PHONES.map((phone) => (
                      <li key={phone}>
                        <a href={`tel:${phone.replace(/\s+/g, "")}`} className={marketing.contactValue}>
                          {phone}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className={marketing.contactItem}>
                  <p className={marketing.contactLabel}>WhatsApp</p>
                  <WhatsAppLink
                    label="Chat with Us on WhatsApp"
                    message={WHATSAPP_DEFAULT_MESSAGE}
                    ariaLabel="Chat with VIZIA Technologies on WhatsApp"
                    className={marketing.mt1}
                  />
                </div>
              </div>
            </div>

            <div className={`card ${marketing.pad3}`}>
              <h2 className={marketing.sectionTitle}>Response Time</h2>
              <ul className={marketing.responseList}>
                <li>
                  <strong>Email inquiries:</strong> 24–48 hours
                </li>
                <li>
                  <strong>Consultation requests:</strong> Same business day
                </li>
                <li>
                  <strong>Phone support:</strong> During business hours (Mon–Fri,
                  9 AM–6 PM EAT)
                </li>
              </ul>
              <p className={`muted ${marketing.mt3}`}>
                For urgent matters, please call us directly or use WhatsApp.
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
