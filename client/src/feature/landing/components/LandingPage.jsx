"use client";
import { useState } from "react";
import { Box } from "@mui/material";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import IntroAnimation from "./IntroAnimation";
import HeroSection from "./HeroSection";
import StatsSection from "./StatsSection";
import FeaturesSection from "./FeaturesSection";
import FeaturedModelsSection from "./FeaturedModelsSection";
import PreviewSection from "./PreviewSection";
import CTASection from "./CTASection";

export default function LandingPage() {
  const [showIntro, setShowIntro] = useState(true);

  if (showIntro) {
    return <IntroAnimation onComplete={() => setShowIntro(false)} />;
  }

  return (
    <Box>
      <Navbar />
      <HeroSection />
      <StatsSection />
      <FeaturesSection />
      <FeaturedModelsSection />
      <PreviewSection />
      <CTASection />
      <Footer />
    </Box>
  );
}