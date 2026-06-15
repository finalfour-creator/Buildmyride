"use client";
import { useEffect, useState } from "react";
import initLandingScene from "../lib/landingScene";
import useScrollNavigation from "../hooks/useScrollNavigation";
import LoadingOverlay from "./LoadingOverlay";
import Navbar from "./Navbar";
import ProgressBar from "./ProgressBar";
import HeroSection from "./HeroSection";
import FeaturesSection from "./FeaturesSection";
import ARPreviewSection from "./ARPreviewSection";
import CTASection from "./CTASection";
import "../landing.css";

const TOTAL_SECTIONS = 4;

export default function LandingPage() {
  const [booted, setBooted] = useState(false);
  const { activeIndex } = useScrollNavigation(TOTAL_SECTIONS, booted);

  useEffect(() => {
    const cleanup = initLandingScene();
    const onBooted = () => setBooted(true);
    window.addEventListener("landing:booted", onBooted);
    return () => {
      cleanup();
      window.removeEventListener("landing:booted", onBooted);
    };
  }, []);

  return (
    <div className="landing-root">
      <LoadingOverlay />

      <div className="lb" id="lb-top" />
      <div className="lb" id="lb-bot" />
      <div id="blur-ov" />
      <div id="flash" />

      <div id="canvas-container" />

      <div id="fallback-container">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/fallback_car.png"
          alt="BuildMyRide Car"
          onError={(e) => {
            e.currentTarget.style.display = "none";
          }}
        />
      </div>

      <Navbar />
      <ProgressBar activeIndex={activeIndex} total={TOTAL_SECTIONS} />

      <div className="v-scroll">
        <div
          className="v-track"
          style={{ transform: `translateY(-${activeIndex * 100}vh)` }}
        >
          <HeroSection isActive={activeIndex === 0} />
          <FeaturesSection isActive={activeIndex === 1} />
          <ARPreviewSection isActive={activeIndex === 2} />
          <CTASection isActive={activeIndex === 3} />
        </div>
      </div>

      <button id="btn-back" type="button">
        {"← EXTERIOR VIEW"}
      </button>
      <div id="toast" />
    </div>
  );
}
