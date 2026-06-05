"use client";
import { Box } from "@mui/material";
import { useAppSelector } from "@/store/hooks";
import { useStudioScroll } from "./hooks/useStudioScroll";
import StudioCanvas from "./scene/StudioCanvas";
import HeroSection from "./sections/HeroSection";
import ManifestoSection from "./sections/ManifestoSection";
import ChassisSection from "./sections/ChassisSection";
import PartSection from "./sections/PartSection";
import ARPreviewSection from "./sections/ARPreviewSection";
import SummarySection from "./sections/SummarySection";
import CommunitySection from "./sections/CommunitySection";
import FinalCTASection from "./sections/FinalCTASection";
import Navigation from "./ui/Navigation";
import PhaseIndicator from "./ui/PhaseIndicator";
import StepCounter from "./ui/StepCounter";
import ProgressBar from "./ui/ProgressBar";
import ScrollHint from "./ui/ScrollHint";
import HScrollHint from "./ui/HScrollHint";
import ModeLabel from "./ui/ModeLabel";
import PartsBadge from "./ui/PartsBadge";
import AttachFlash from "./ui/AttachFlash";
import { TOKENS } from "./theme/tokens";

export default function StudioRoot() {
  useStudioScroll();
  const phase = useAppSelector((s) => s.navigation.phase);
  const vIdx = useAppSelector((s) => s.navigation.vIdx);
  const hIdx = useAppSelector((s) => s.navigation.hIdx);

  const canvasOpacity = phase === 2 ? 0.35 : 1;

  return (
    <Box
      sx={{
        position: "fixed",
        inset: 0,
        background: TOKENS.colors.black,
        color: TOKENS.colors.white,
        overflow: "hidden",
      }}
    >
      {/* Canvas layer */}
      <Box
        sx={{
          position: "fixed",
          inset: 0,
          zIndex: TOKENS.z.canvas,
          opacity: canvasOpacity,
          transition: "opacity 0.9s ease",
          pointerEvents: "none",
        }}
      >
        <StudioCanvas />
      </Box>

      {/* Vignette */}
      <Box
        sx={{
          position: "fixed",
          inset: 0,
          zIndex: TOKENS.z.vignette,
          pointerEvents: "none",
          background:
            "radial-gradient(ellipse 80% 70% at 50% 55%, transparent 35%, rgba(8,8,8,0.3) 62%, rgba(8,8,8,0.7) 82%, #080808 100%)",
        }}
      />

      {/* Grain */}
      <Box className="studio-grain" />

      {/* Phase 0 vertical stack */}
      <Box
        sx={{
          position: "fixed",
          inset: 0,
          zIndex: TOKENS.z.sections,
          opacity: phase === 0 ? 1 : 0,
          pointerEvents: phase === 0 ? "auto" : "none",
          transition: "opacity 0.6s ease",
        }}
      >
        <Box
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            transform: `translateY(${-vIdx * 100}vh)`,
            transition: "transform 0.85s cubic-bezier(.7,0,.2,1)",
          }}
        >
          <HeroSection />
          <ManifestoSection chapter={1} />
          <ManifestoSection chapter={2} />
          <ChassisSection />
        </Box>
      </Box>

      {/* Phase 1+2 horizontal stack */}
      <Box
        sx={{
          position: "fixed",
          inset: 0,
          zIndex: TOKENS.z.sections,
          opacity: phase >= 1 ? 1 : 0,
          pointerEvents: phase >= 1 ? "auto" : "none",
          transition: "opacity 0.6s ease",
          overflow: "hidden",
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: "row",
            width: "800vw",
            height: "100vh",
            transform: `translateX(${-hIdx * 100}vw)`,
            transition: "transform 0.85s cubic-bezier(.7,0,.2,1)",
          }}
        >
          <PartSection category="engine" />
          <PartSection category="body" />
          <PartSection category="wheels" />
          <PartSection category="exhaust" />
          <ARPreviewSection />
          <SummarySection />
          <CommunitySection />
          <FinalCTASection />
        </Box>
      </Box>

      {/* UI Chrome */}
      <Navigation />
      <ProgressBar />
      <StepCounter />
      <PartsBadge />
      <PhaseIndicator />
      <ScrollHint />
      <HScrollHint />
      <ModeLabel />
      <AttachFlash />
    </Box>
  );
}
