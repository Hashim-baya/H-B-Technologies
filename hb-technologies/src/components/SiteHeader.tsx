"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import styles from "./SiteHeader.module.css";
import type { NavSection } from "@/lib/content";

const DEFAULT_NAV: NavSection = {
  links: [
    { label: "Services", href: "/services" },
    { label: "Blog", href: "/blog" },
    { label: "About", href: "/about" },
    { label: "Contact", href: "/contact" },
  ],
  ctaLabel: "Book consultation",
  ctaHref: "/book-consultation",
};

export function SiteHeader({ nav = DEFAULT_NAV }: { nav?: NavSection }) {
  const navLinks = nav.links;
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const firstMobileLinkRef = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* close mobile menu on resize to desktop */
  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth >= 880) setMobileOpen(false);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    if (mobileOpen) {
      firstMobileLinkRef.current?.focus();
      return;
    }

    menuButtonRef.current?.focus();
  }, [mobileOpen]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMobileOpen(false);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <header
      ref={headerRef}
      className={`${styles.header} ${scrolled ? styles.scrolled : ""}`}
    >
      <div className={`container ${styles.inner}`}>
        {/* ── Brand ── */}
        <Link className={styles.brand} href="/">
          <Image
            src="/vizia-logo.png"
            alt="VIZIA Technologies"
            className={styles.logoImg}
            width={240}
            height={60}
            priority
            sizes="240px"
          />
          <span className={styles.brandLabel}>
            <span className={styles.brandName}><span className={styles.brandV}>V</span>IZIA</span>
            <span className={styles.brandSub}>Technologies</span>
          </span>
        </Link>

        {/* ── Desktop Nav ── */}
        <nav className={styles.desktopNav} aria-label="Primary">
          <ul className={styles.navList}>
            {navLinks.map((l) => (
              <li key={l.href}>
                <Link className={styles.navLink} href={l.href}>
                  {l.label}
                  <span className={styles.navUnderline} />
                </Link>
              </li>
            ))}
            <li>
              <Link className={`btn btnPrimary ${styles.ctaBtn}`} href={nav.ctaHref}>
                {nav.ctaLabel}
              </Link>
            </li>
          </ul>
        </nav>

        {/* ── Mobile Hamburger ── */}
        <button
          ref={menuButtonRef}
          type="button"
          className={`${styles.hamburger} ${mobileOpen ? styles.hamburgerOpen : ""}`}
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
          aria-expanded={mobileOpen}
          aria-controls="mobile-primary-navigation"
          onClick={() => setMobileOpen((v) => !v)}
        >
          <span />
          <span />
          <span />
        </button>
      </div>

      {/* ── Mobile Panel ── */}
      <div
        id="mobile-primary-navigation"
        className={`${styles.mobilePanel} ${mobileOpen ? styles.mobilePanelOpen : ""}`}
        hidden={!mobileOpen}
      >
        <nav aria-label="Mobile primary">
          <ul className={styles.mobileList}>
            {navLinks.map((l, i) => (
              <li
                key={l.href}
                className={styles.mobileItem}
                style={{ transitionDelay: `${i * 50}ms` }}
              >
                <Link
                  ref={i === 0 ? firstMobileLinkRef : undefined}
                  className={styles.mobileLink}
                  href={l.href}
                  onClick={() => setMobileOpen(false)}
                >
                  {l.label}
                </Link>
              </li>
            ))}
            <li
              className={styles.mobileItem}
              style={{ transitionDelay: `${navLinks.length * 50}ms` }}
            >
              <Link
                className={`btn btnPrimary ${styles.mobileCta}`}
                href={nav.ctaHref}
                onClick={() => setMobileOpen(false)}
              >
                {nav.ctaLabel}
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}
