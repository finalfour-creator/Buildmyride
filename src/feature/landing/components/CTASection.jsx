"use client";
import { useRef, useEffect } from "react";
import Link from "next/link";
import gsap from "gsap";

const stats = [
  { target: 24817, label: "Builders" },
  { target: 198, label: "K Builds" },
  { target: 4, label: "Models" },
  { target: 60, label: "FPS · AR" },
];

export default function CTASection({ isActive }) {
  const ref = useRef(null);

  useEffect(() => {
    if (!isActive || !ref.current) return;
    const el = ref.current;
    const tl = gsap.timeline();

    tl.fromTo(
      el.querySelector(".cta-tag"),
      { y: 20, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.6, ease: "power4.out" }
    );

    tl.fromTo(
      el.querySelectorAll(".cta-title .line > span"),
      { y: -70, skewY: -4, opacity: 0, filter: "blur(5px)" },
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
      el.querySelector(".cta-sub"),
      { y: 28, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.65, ease: "power4.out" },
      "-=0.4"
    );

    tl.fromTo(
      el.querySelectorAll(".cta-buttons a"),
      { y: 20, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.5, stagger: 0.1, ease: "power4.out" },
      "-=0.2"
    );

    tl.fromTo(
      el.querySelector(".cta-stats"),
      { y: 20, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.5, ease: "power4.out" },
      "-=0.2"
    );

    // Count-up animation
    const counters = el.querySelectorAll(".cs-block-num");
    const tweens = [];
    counters.forEach((counter) => {
      const target = parseInt(counter.dataset.target, 10) || 0;
      counter.textContent = "0";
      const obj = { val: 0 };
      tweens.push(
        gsap.to(obj, {
          val: target,
          duration: 1.5,
          delay: 0.8,
          ease: "power2.out",
          onUpdate: () => {
            counter.textContent = Math.floor(obj.val).toLocaleString();
          },
        })
      );
    });

    return () => {
      tl.kill();
      tweens.forEach((tw) => tw.kill());
    };
  }, [isActive]);

  return (
    <section ref={ref} className="v-section cta-section">
      <div className="cta-layout">
        <div className="cta-tag">Build · Preview · Drive</div>
        <h2 className="cta-title">
          <span className="line">
            <span>Your machine</span>
          </span>
          <span className="line stroke">
            <span>starts here.</span>
          </span>
        </h2>
        <p className="cta-sub">
          The studio is open. Customize your geometry, preview it in AR, and
          make it yours. The future of car customization is here.
        </p>
        <div className="cta-buttons">
          <Link href="/login" className="btn-primary">
            Enter The Studio
          </Link>
          <Link href="/login" className="btn-secondary">
            Learn More
          </Link>
        </div>
        <div className="cta-stats">
          {stats.map((s) => (
            <div key={s.label} className="cs-block">
              <span className="cs-block-num" data-target={s.target}>
                0
              </span>
              <span className="cs-block-lbl">{s.label}</span>
            </div>
          ))}
        </div>
        <div className="cta-footer">
          <span>BuildMyRide © 2025</span>
          <span>All Systems Nominal</span>
        </div>
      </div>
    </section>
  );
}
