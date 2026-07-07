import Link from "next/link";
import Image from "next/image";
import styles from "./SiteFooter.module.css";
import { WhatsAppLink } from "./WhatsAppLink";

const CONTACT_PHONES = [
  "+254 113 747 654",
  "+254 724 121 679",
  "+254 797 749 346",
  "+254 785 773 554",
];

const CONTACT_EMAIL = "htechnob@gmail.com";

const footerLinks = [
  { href: "/services", label: "Services" },
  { href: "/blog", label: "Blog" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
  { href: "/book-consultation", label: "Book Consultation" },
];

const serviceLinks = [
  { href: "/services/web-development", label: "Web Development" },
  { href: "/services/cyber-security", label: "Cyber Security" },
  { href: "/services/artificial-intelligence", label: "AI & ML" },
  { href: "/services/iot-solutions", label: "IoT Solutions" },
  { href: "/services/smart-cctv", label: "Smart CCTV" },
  { href: "/services/network-engineering", label: "Network Engineering" },
];

export function SiteFooter() {
  return (
    <footer className={styles.footer}>
      {/* Red accent line */}
      <div className={styles.accentLine} />

      <div className={`container ${styles.grid}`}>
        {/* ── Brand column ── */}
        <div className={styles.brandCol}>
          <Link href="/" className={styles.brand}>
            <Image
              src="/vizia-logo.png"
              alt="VIZIA Technologies"
              className={styles.logoImg}
              width={320}
              height={80}
              sizes="(max-width: 879px) 240px, 320px"
            />
            <span className={styles.brandLabel}>
              <span className={styles.brandName}><span className={styles.brandV}>V</span>IZIA</span>
              <span className={styles.brandTag}>Technologies</span>
            </span>
          </Link>

          <p className={styles.tagline}>
            Secure-by-design engineering, AI-driven automation, and
            enterprise-grade infrastructure — built for teams that cannot afford downtime.
          </p>

          <div className={styles.contact}>
            <p className={styles.contactLabel}>Get in touch</p>
            <div className={styles.contactLinks}>
              <a href={`mailto:${CONTACT_EMAIL}`} className={styles.contactLink}>
                {CONTACT_EMAIL}
              </a>
              {CONTACT_PHONES.map((phone) => (
                <a
                  key={phone}
                  href={`tel:${phone.replace(/\s+/g, "")}`}
                  className={styles.contactLink}
                >
                  {phone}
                </a>
              ))}
              <WhatsAppLink
                label="Chat on WhatsApp"
                ariaLabel="Chat with VIZIA Technologies on WhatsApp"
                className={styles.contactLink}
                variant="inline"
              />
            </div>
          </div>

          <p className={styles.meta}>
            © {new Date().getFullYear()} VIZIA Technologies. All rights reserved.
          </p>
        </div>

        {/* ── Company links ── */}
        <div>
          <h4 className={styles.colHeading}>Company</h4>
          <nav aria-label="Footer company" className={styles.linkList}>
            {footerLinks.map((l) => (
              <Link key={l.href} href={l.href} className={styles.link}>
                {l.label}
              </Link>
            ))}
          </nav>
        </div>

        {/* ── Services links ── */}
        <div>
          <h4 className={styles.colHeading}>Services</h4>
          <nav aria-label="Footer services" className={styles.linkList}>
            {serviceLinks.map((l) => (
              <Link key={l.href} href={l.href} className={styles.link}>
                {l.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </footer>
  );
}
