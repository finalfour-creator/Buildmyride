"use client";
import { useRef, useEffect } from "react";
import gsap from "gsap";

const features = [
  { title: "Real-Time 3D Preview", desc: "Watch changes instantly as you customize" },
  { title: "Save & Share Builds", desc: "Keep multiple configurations and share them" },
  { title: "AR Visualization", desc: "Place your car in the real world using AR" },
  { title: "Trending Designs", desc: "Explore what the community is building" },
];

export default function FeaturesSection({ isActive }) {
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
      el.querySelectorAll(".feature-card"),
      { scale: 0.55, y: 24, opacity: 0 },
      {
        scale: 1,
        y: 0,
        opacity: 1,
        duration: 0.65,
        stagger: 0.08,
        ease: "back.out(1.4)",
      },
      "-=0.3"
    );

    return () => tl.kill();
  }, [isActive]);

  return (
    <section ref={ref} className="v-section features-section">
      <div className="chapter-num">01</div>
      <div className="frame-mark tl" />
      <div className="frame-mark br" />

      <div className="features-content">
        <div className="section-tag">
          <span>Chapter 01 — The Platform</span>
        </div>
        <h2 className="section-title">
          <span className="line">
            <span>Born in</span>
          </span>
          <span className="line stroke">
            <span>the studio.</span>
          </span>
        </h2>
        <p className="section-body">
          Every panel, every bolt, every detail — composed by you. From blank
          canvas to finished machine in a seamless experience.
        </p>

        <div className="feature-grid">
          {features.map((f) => (
            <div key={f.title} className="feature-card">
              <div className="feature-card-title">{f.title}</div>
              <div className="feature-card-desc">{f.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
