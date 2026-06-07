"use client";
import { useRef, useEffect } from "react";
import Link from "next/link";
import gsap from "gsap";

export default function HeroSection({ isActive }) {
  const ref = useRef(null);

  useEffect(() => {
    if (!isActive || !ref.current) return;
    const el = ref.current;
    const tl = gsap.timeline();

    tl.fromTo(
      el.querySelectorAll(".hero-hl .line > span"),
      { y: -70, skewY: -4, opacity: 0, filter: "blur(5px)" },
      {
        y: 0,
        skewY: 0,
        opacity: 1,
        filter: "blur(0px)",
        duration: 0.95,
        stagger: 0.2,
        ease: "power4.out",
        delay: 0.3,
      }
    );

    tl.fromTo(
      el.querySelector(".hero-meta"),
      { y: 28, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.7, ease: "power4.out" },
      "-=0.5"
    );

    tl.fromTo(
      el.querySelectorAll(".hero-sub p"),
      { y: 28, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.7, stagger: 0.1, ease: "power4.out" },
      "-=0.5"
    );

    tl.fromTo(
      el.querySelectorAll(".hero-cta a"),
      { y: 20, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.6, stagger: 0.1, ease: "power4.out" },
      "-=0.3"
    );

    tl.fromTo(
      el.querySelector(".scroll-hint"),
      { y: 20, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.6, ease: "power4.out" },
      "-=0.2"
    );

    return () => tl.kill();
  }, [isActive]);

  return (
    <section ref={ref} className="v-section hero-section">
      <div className="hero-content">
        <h1 className="hero-hl">
          <span className="line">
            <span>Build Your</span>
          </span>
          <span className="line stroke">
            <span>Dream Ride</span>
          </span>
        </h1>
        <div className="hero-cta">
          <Link href="/login" className="btn-primary">
            START BUILDING
          </Link>
          <Link href="/login" className="btn-secondary">
            VIEW IN AR
          </Link>
        </div>
      </div>

      <div className="hero-meta">
        <span>SESSION · 2025</span>
        <span>STUDIO · BUILDMYRIDE</span>
        <span>SIGNAL · STABLE</span>
      </div>

      <div className="hero-sub">
        <p className="hero-yr">BuildMyRide — Studio Edition</p>
        <p>Customize in 3D. Visualize in AR.</p>
        <p>Drive your imagination.</p>
      </div>

      <div className="scroll-hint">
        <span>Scroll</span>
        <div className="hint-arrow">
          <i />
          <i />
          <i />
        </div>
      </div>
    </section>
  );
}
