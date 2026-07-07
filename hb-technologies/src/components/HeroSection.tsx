"use client";

import Link from "next/link";
import { useEffect, useRef, useState, useCallback } from "react";
import styles from "./HeroSection.module.css";

export interface HeroSlide {
  id: string;
  type: "image" | "video" | "youtube";
  mediaUrl: string;
  poster?: string;
  overlayOpacity?: number;
  badge?: string;
  heading: string;
  subheading: string;
  ctaPrimary: { label: string; href: string };
  ctaSecondary: { label: string; href: string };
}

export interface HeroConfig {
  slides: HeroSlide[];
  autoPlay?: boolean;
  interval?: number;
}

interface Props {
  config: HeroConfig;
}

export default function HeroSection({ config }: Props) {
  const { slides, autoPlay = true, interval = 6000 } = config;
  const [active, setActive] = useState(0);
  const [animating, setAnimating] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const goTo = useCallback(
    (idx: number) => {
      if (idx === active || animating) return;
      setAnimating(true);
      setTimeout(() => {
        setActive(idx);
        setAnimating(false);
      }, 400);
    },
    [active, animating]
  );

  const next = useCallback(() => goTo((active + 1) % slides.length), [active, slides.length, goTo]);

  useEffect(() => {
    if (!autoPlay || slides.length <= 1) return;
    timerRef.current = setInterval(next, interval);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [autoPlay, interval, next, slides.length]);

  /* reset video when slide changes */
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.load();
      videoRef.current.play().catch(() => {});
    }
  }, [active]);

  const slide = slides[active];
  if (!slide) return null;
  const heroPoster =
    slide.poster ??
    (slide.type === "video"
      ? `/og?${new URLSearchParams({
          title: slide.heading,
          description: slide.subheading,
          path: "/",
          label: "VIZIA Technologies",
        }).toString()}`
      : undefined);

  const overlayStyle = {
    "--overlay-opacity": String(slide.overlayOpacity ?? 0.80),
  } as React.CSSProperties;

  return (
    <section className={styles.hero} aria-label="Hero">
      {/* ── Media background ── */}
      <div className={`${styles.media} ${animating ? styles.mediaOut : styles.mediaIn}`}>
        {slide.type === "youtube" ? (
          <div className={styles.ytWrap}>
            <iframe
              key={slide.id}
              className={styles.ytFrame}
              src={`https://www.youtube-nocookie.com/embed/${slide.mediaUrl}?autoplay=1&mute=1&loop=1&playlist=${slide.mediaUrl}&controls=0&showinfo=0&rel=0&modestbranding=1&playsinline=1&iv_load_policy=3`}
              allow="autoplay; encrypted-media"
              allowFullScreen
              title="Hero background video"
            />
          </div>
        ) : slide.type === "video" ? (
          <video
            ref={videoRef}
            className={styles.video}
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            poster={heroPoster}
            key={slide.id}
          >
            <source src={slide.mediaUrl} />
          </video>
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={slide.id}
            src={slide.mediaUrl}
            alt=""
            className={styles.img}
            loading="eager"
            fetchPriority="high"
          />
        )}
        <div className={styles.overlay} style={overlayStyle} />
      </div>

      {/* ── Background blobs ── */}
      <div className={styles.blob1} aria-hidden="true" />
      <div className={styles.blob2} aria-hidden="true" />

      {/* ── Content ── */}
      <div className={`container ${styles.content}`}>
        <div className={`${styles.textWrap} ${animating ? styles.contentOut : styles.contentIn}`}>
          {slide.badge && (
            <div className={styles.badge} key={`badge-${slide.id}`}>
              <span className={styles.badgeDot} />
              {slide.badge}
            </div>
          )}

          <h1 className={styles.heading} key={`h1-${slide.id}`}>
            {slide.heading}
          </h1>

          <p className={styles.sub} key={`sub-${slide.id}`}>
            {slide.subheading}
          </p>

          <div className={styles.ctas} key={`ctas-${slide.id}`}>
            <Link href={slide.ctaPrimary.href} className={`btn btnPrimary ${styles.ctaPrimary}`}>
              {slide.ctaPrimary.label}
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </Link>
            <Link href={slide.ctaSecondary.href} className={`btn ${styles.ctaSecondary}`}>
              {slide.ctaSecondary.label}
            </Link>
          </div>
        </div>

        {/* ── Scroll indicator ── */}
        <div className={styles.scrollHint} aria-hidden="true">
          <span className={styles.scrollLine} />
          <span className={styles.scrollLabel}>Scroll</span>
        </div>
      </div>

      {/* ── Slide dots ── */}
      {slides.length > 1 && (
        <div className={styles.dots} role="tablist" aria-label="Hero slides">
          {slides.map((s, i) => (
            <button
              key={s.id}
              type="button"
              role="tab"
              aria-selected={i === active}
              aria-label={`Slide ${i + 1}`}
              className={`${styles.dot} ${i === active ? styles.dotActive : ""}`}
              onClick={() => {
                if (timerRef.current) clearInterval(timerRef.current);
                goTo(i);
              }}
            />
          ))}
        </div>
      )}

      {/* ── Arrow controls ── */}
      {slides.length > 1 && (
        <>
          <button
            type="button"
            className={`${styles.arrow} ${styles.arrowPrev}`}
            onClick={() => goTo((active - 1 + slides.length) % slides.length)}
            aria-label="Previous slide"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M13 4l-6 6 6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <button
            type="button"
            className={`${styles.arrow} ${styles.arrowNext}`}
            onClick={() => goTo((active + 1) % slides.length)}
            aria-label="Next slide"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M7 4l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </>
      )}
    </section>
  );
}
