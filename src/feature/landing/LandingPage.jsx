"use client";
import { useEffect } from "react";
import StudioThemeProvider from "./theme/StudioThemeProvider";
import StudioRoot from "./StudioRoot";

export default function LandingPage() {
  useEffect(() => {
    document.body.classList.add("studio-active");
    return () => document.body.classList.remove("studio-active");
  }, []);

  return (
    <StudioThemeProvider>
      <StudioRoot />
    </StudioThemeProvider>
  );
}
