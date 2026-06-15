"use client";
import { useRef, useEffect } from "react";
import Link from "next/link";
import gsap from "gsap";

const arFeatures = [
  { num: "01", text: "Real-time surface detection & depth tracking" },
  { num: "02", text: "Full 360\u00B0 walkaround at true 1:1 scale" },
  { num: "03", text: "Live paint & material preview in AR" },
  { num: "04", text: "Share as a spatial link \u2014 works on any device" },
];

export default function ARPreviewSection({ isActive }) {
  const ref = useRef(null);

  useEffect(() => {
    if (!isActive || !ref.current) return;
    const el = ref.current;
    const tl = gsap.timeline();

    tl.fromTo(
      el.querySelector(".section-tag"),
      { x: -24, opacity: 0 },
      { x: 0, opacity: 1, duration: 0.65, ease: "power4.out" }
    );

    tl.fromTo(
      el.querySelectorAll(".section-title .line > span"),
      { y: -70, skewY: -4, opacity: 0, filter: "blur(4px)" },
      {
        y: 0,
        skewY: 0,
        opacity: 1,
        filter: "blur(0px)",
        duration: 0.95,
        stagger: 0.15,
        ease: "power4.out",
      },
      "-=0.3"
    );

    tl.fromTo(
      el.querySelector(".section-body"),
      { y: 28, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.65, ease: "power4.out" },
      "-=0.4"
    );

    tl.fromTo(
      el.querySelectorAll(".ar-feat"),
      { y: 20, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.5, stagger: 0.1, ease: "power4.out" },
      "-=0.2"
    );

    tl.fromTo(
      el.querySelector(".ar-launch-btn"),
      { y: 20, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.5, ease: "power4.out" },
      "-=0.2"
    );

    tl.fromTo(
      el.querySelector(".phone-frame"),
      { opacity: 0 },
      { opacity: 1, duration: 0.8, ease: "power4.out" },
      "-=0.6"
    );

    return () => tl.kill();
  }, [isActive]);

  return (
    <section ref={ref} className="v-section ar-section">
      <div className="ar-layout">
        <div className="ar-left">
          <div className="section-tag">
            <span>Chapter 02 — AR Preview</span>
          </div>
          <h2 className="section-title">
            <span className="line">
              <span>Modify in</span>
            </span>
            <span className="line stroke">
              <span>reality.</span>
            </span>
          </h2>
          <p className="section-body">
            Point your phone at any surface. Watch your modifications
            materialise — paint, wheels, kits — projected at full scale, lit by
            the world around you.
          </p>
          <div className="ar-features">
            {arFeatures.map((f) => (
              <div key={f.num} className="ar-feat">
                <span className="arf-num">{f.num}</span>
                <span className="arf-text">{f.text}</span>
              </div>
            ))}
          </div>
          <Link href="/login" className="ar-launch-btn">
            Launch AR Preview <span>→</span>
          </Link>
        </div>
        <div className="ar-right">
          <div className="phone-glow" />
          <div className="phone-frame">
            <div className="phone-notch" />
            <div className="phone-screen">
              <div className="ar-grid" />
              <svg
                className="ar-car-svg"
                viewBox="0 0 160 80"
                fill="none"
                stroke="var(--cp)"
                strokeWidth="0.7"
                strokeLinecap="round"
              >
                <path
                  d="M10 60 L25 38 L50 28 L100 26 L130 36 L150 52 L150 60 L10 60 Z"
                  opacity=".9"
                />
                <path d="M40 32 L55 22 L95 22 L110 30" opacity=".7" />
                <circle cx="38" cy="60" r="9" opacity=".85" />
                <circle cx="38" cy="60" r="4" opacity=".6" />
                <circle cx="120" cy="60" r="9" opacity=".85" />
                <circle cx="120" cy="60" r="4" opacity=".6" />
                <path d="M10 60 L150 60" opacity=".5" />
                <path
                  d="M30 48 L130 48"
                  opacity=".3"
                  strokeDasharray="2 3"
                />
              </svg>
              <div className="ar-reticle">
                <div className="corner tl" />
                <div className="corner tr" />
                <div className="corner bl" />
                <div className="corner br" />
              </div>
              <div className="ar-scanline" />
              <div className="ar-hud-top">
                <span className="live">AR · LIVE</span>
                <span>TRACKING</span>
              </div>
              <div className="ar-hud-bottom">
                <div className="hub-label">PROJECTED MODEL</div>
                <div className="hub-value">BUILDMYRIDE / SPORT</div>
              </div>
            </div>
            <div className="phone-home" />
          </div>
        </div>
      </div>
    </section>
  );
}
