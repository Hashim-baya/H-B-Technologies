import Link from "next/link";
import HeroSection from "@/components/HeroSection";
import AnimateIn from "@/components/AnimateIn";
import TeamCard from "@/components/TeamCard";
import styles from "./page.module.css";
import type { SiteContent } from "@/lib/content";
import { loadSiteContent } from "@/lib/content";
import { buildSchemaGraph, buildWebPageJsonLd, createPageMetadata } from "@/lib/seo";

export const revalidate = 0;

export const metadata = createPageMetadata({
  title: "VIZIA Technologies | Secure Software, AI & Cybersecurity",
  description:
    "Build secure web platforms, AI automation, cyber security, IoT, and enterprise systems with a production-focused engineering team.",
  path: "/",
  absoluteTitle: true,
  imageLabel: "Secure engineering partner",
  keywords: [
    "software engineering company",
    "AI development firm",
    "cyber security specialists",
    "IoT solution provider",
    "enterprise software development",
  ],
});

const homeSchema = buildSchemaGraph([
  buildWebPageJsonLd({
    name: "VIZIA Technologies | Secure Software, AI & Cybersecurity",
    description:
      "Build secure web platforms, AI automation, cyber security, IoT, and enterprise systems with a production-focused engineering team.",
    path: "/",
  }),
]);

export default async function Home() {
  const c: SiteContent = await loadSiteContent();

  return (
    <div className={styles.page}>
      {/* ── Hero ── */}
      <HeroSection config={c.hero} />

      {/* ── Stats ticker ── */}
      <section className={styles.statsBar} aria-label="Key statistics">
        <div className={styles.statsTicker}>
          {/* Single track — items doubled so -50% = one full cycle */}
          <div className={styles.statsTrack}>
            {[...c.stats, ...c.stats].map((s, i) => (
              <div key={i} className={styles.statItem} aria-hidden={i >= c.stats.length}>
                <div className={styles.statValue}>{s.value}{s.suffix}</div>
                <div className={styles.statLabel}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Deliver — white panel ── */}
      <section className={`section ${styles.photoBg} ${styles.deliverSection} ${styles.sectionDiagBottom}`} aria-labelledby="deliver-heading">
        <div className="container">
          <AnimateIn variant="up">
            <span className="pill">{c.deliver.badge}</span>
            <h2 id="deliver-heading" className={styles.sectionHeading}>{c.deliver.heading}</h2>
            <p className={`muted ${styles.sectionIntro}`}>{c.deliver.intro}</p>
          </AnimateIn>
          <div className={styles.grid3}>
            {c.deliver.cards.map((card, i) => (
              <AnimateIn key={card.title} delay={i * 120} variant="up">
                <Link href={card.href} className={`card ${styles.deliverCard} ${styles.photoBgCard}`}>
                  <div className={styles.deliverIcon}>{card.icon}</div>
                  <h3 className={styles.cardTitle}>{card.title}</h3>
                  <p className={`muted ${styles.cardDesc}`}>{card.desc}</p>
                  <span className={styles.cardArrow}>Learn more →</span>
                </Link>
              </AnimateIn>
            ))}
          </div>
        </div>
      </section>

      {/* ── Why VIZIA — dark circuit grid ── */}
      <section className={`section sectionTech`} aria-labelledby="why-heading">
        <div className="container">
          <AnimateIn variant="up">
            <span className="pill">{c.why.badge}</span>
            <h2 id="why-heading" className={styles.sectionHeading}>{c.why.heading}</h2>
            <p className={`muted ${styles.sectionIntro}`}>{c.why.intro}</p>
          </AnimateIn>
          <div className={styles.grid5}>
            {c.why.items.map((d, i) => (
              <AnimateIn key={d.title} delay={i * 100} variant="up">
                <article className={`card ${styles.diffCard} ${styles.techCard}`}>
                  <div className={styles.diffIcon}>{d.icon}</div>
                  <h3 className={styles.cardTitle}>{d.title}</h3>
                  <p className={`muted ${styles.cardDesc}`}>{d.copy}</p>
                </article>
              </AnimateIn>
            ))}
          </div>
        </div>
      </section>

      {/* ── Industries — deep red-dark ── */}
      <section className={`section sectionRedDark`} aria-labelledby="industries-heading">
        <div className="container">
          <AnimateIn variant="up">
            <span className="pill">{c.industries.badge}</span>
            <h2 id="industries-heading" className={`${styles.sectionHeading} ${styles.lightHeading}`}>{c.industries.heading}</h2>
            <p className={`muted ${styles.sectionIntro}`}>{c.industries.intro}</p>
          </AnimateIn>
          <div className={styles.grid3}>
            {c.industries.items.map((ind, i) => (
              <AnimateIn key={ind.name} delay={i * 80} variant="up">
                <article className={`card ${styles.industryCard} ${styles.redDarkCard}`}>
                  <div className={styles.industryIcon}>{ind.icon}</div>
                  <h3 className={styles.cardTitle}>{ind.name}</h3>
                  <p className={`muted ${styles.cardDesc}`}>{ind.desc}</p>
                </article>
              </AnimateIn>
            ))}
          </div>
        </div>
      </section>

      {/* ── Stack — developer photo ── */}
      <section className={`section ${styles.photoBg} ${styles.stackSection}`} aria-labelledby="stack-heading">
        <div className="container">
          <AnimateIn variant="up">
            <span className="pill">{c.stack.badge}</span>
            <h2 id="stack-heading" className={styles.sectionHeading}>{c.stack.heading}</h2>
            <p className={`muted ${styles.sectionIntro}`}>{c.stack.intro}</p>
          </AnimateIn>
          <div className={styles.stackGrid}>
            {c.stack.items.map((cat, i) => (
              <AnimateIn key={cat.title} delay={i * 90} variant="scale">
                <article className={`card ${styles.stackCard} ${styles.photoBgCard}`}>
                  <h3 className={styles.stackTitle}>{cat.title}</h3>
                  <ul className={styles.stackList}>
                    {cat.items.map((it) => (
                      <li key={it} className={styles.stackItem}>
                        <span className={styles.stackDot} />{it}
                      </li>
                    ))}
                  </ul>
                </article>
              </AnimateIn>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonials — dark with pattern ── */}
      <section className={`section sectionTech`} aria-labelledby="testimonials-heading">
        <div className="container">
          <AnimateIn variant="up">
            <span className="pill">{c.testimonials.badge}</span>
            <h2 id="testimonials-heading" className={styles.sectionHeading}>{c.testimonials.heading}</h2>
            <p className={`muted ${styles.sectionIntro}`}>{c.testimonials.intro}</p>
          </AnimateIn>
          <div className={styles.grid3}>
            {c.testimonials.items.map((t, i) => (
              <AnimateIn key={t.name} delay={i * 120} variant="up">
                <figure className={`card ${styles.testimonialCard} ${styles.techCard}`}>
                  <div className={styles.quoteIcon}>&quot;</div>
                  <blockquote>
                    <p className={`muted ${styles.quoteText}`}>{t.quote}</p>
                  </blockquote>
                  <figcaption className={styles.testimonialMeta}>
                    <div className={styles.avatar}>{t.initials}</div>
                    <div>
                      <strong className={styles.testimonialName}>{t.name}</strong>
                      <span className={`muted ${styles.testimonialOrg}`}>{t.org}</span>
                    </div>
                  </figcaption>
                </figure>
              </AnimateIn>
            ))}
          </div>
        </div>
      </section>

      {/* ── Team — office photo ── */}
      {c.team?.enabled && (
        <section className={`section ${styles.photoBg} ${styles.teamSection}`} aria-labelledby="team-heading">
          <div className="container">
            <AnimateIn variant="up">
              <span className="pill">{c.team.badge}</span>
              <h2 id="team-heading" className={styles.sectionHeading}>{c.team.heading}</h2>
              <p className={`muted ${styles.sectionIntro}`}>{c.team.intro}</p>
            </AnimateIn>
            <div className={styles.teamGrid}>
              {c.team.members.map((m, i) => (
                <AnimateIn key={m.name} delay={i * 100} variant="up">
                  <TeamCard member={m} />
                </AnimateIn>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── CTA — bold red ── */}
      <section className={`section sectionCta`}>
        <div className="container">
          <AnimateIn variant="scale">
            <div className={styles.ctaInner}>
              <span className="pill">{c.cta.badge}</span>
              <h2 className={styles.ctaHeadingWhite}>{c.cta.heading}</h2>
              <p className={styles.ctaCopyWhite}>{c.cta.copy}</p>
              <div className={styles.ctaActions}>
                <Link className={`btn ${styles.ctaBtnLight}`} href="/book-consultation">Book Consultation</Link>
                <Link className={`btn ${styles.ctaBtnOutline}`} href="/services">View All Services</Link>
              </div>
            </div>
          </AnimateIn>
        </div>
      </section>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(homeSchema) }}
      />
    </div>
  );
}
