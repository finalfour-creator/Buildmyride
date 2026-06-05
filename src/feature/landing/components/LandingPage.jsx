"use client";
import { useEffect } from "react";
import initLandingScene from "../lib/landingScene";
import LoadingOverlay from "./LoadingOverlay";
import MainHeader from "./MainHeader";
import HudHints from "./HudHints";
import SwipeIndicators from "./SwipeIndicators";
import ScrollSections from "./ScrollSections";
import HudPanels from "./HudPanels";
import "../landing.css";

export default function LandingPage() {
  // Boot the imperative Three.js + audio experience once the markup is mounted.
  useEffect(() => {
    const cleanup = initLandingScene();
    return cleanup;
  }, []);

  return (
    <div className="landing-root">
      {/* Fonts used by the experience */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link
        href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Outfit:wght@300;400;600;700&display=swap"
        rel="stylesheet"
      />

      <LoadingOverlay />

      <div className="lb" id="lb-top" />
      <div className="lb" id="lb-bot" />
      <div id="scroll-prog" />
      <div id="blur-ov" />
      <div id="flash" />

      <MainHeader />

      <div id="canvas-container" />

      <div id="fallback-container">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/fallback_car.png"
          alt="BuildMyRide Car"
          onError={(e) => { e.currentTarget.style.display = "none"; }}
        />
      </div>

      <HudHints />
      <SwipeIndicators />

      <button id="btn-back" type="button">{"← EXTERIOR VIEW"}</button>

      <ScrollSections />
      <HudPanels />

      <div id="toast" />
    </div>
  );
}
