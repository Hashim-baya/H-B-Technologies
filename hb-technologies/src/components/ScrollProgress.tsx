"use client";

import { useEffect, useRef } from "react";

export default function ScrollProgress() {
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let frameId = 0;

    const onScroll = () => {
      cancelAnimationFrame(frameId);
      frameId = window.requestAnimationFrame(() => {
        const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
        const total = scrollHeight - clientHeight;
        const pct = total > 0 ? Math.min((scrollTop / total) * 100, 100) : 0;
        if (barRef.current) {
          barRef.current.style.width = `${pct}%`;
        }
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return (
    <div
      ref={barRef}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        zIndex: 200,
        height: "3px",
        width: "0%",
        background: "linear-gradient(90deg, #C8102E, #FF6B6B)",
        transition: "width .1s linear",
        pointerEvents: "none",
        willChange: "width",
      }}
      aria-hidden="true"
    />
  );
}
