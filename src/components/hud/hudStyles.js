"use client";
import { useEffect } from "react";

/**
 * Shared HUD design language for BuildMyRide's "showroom" surfaces
 * (the 3D configurator and the AR preview).
 *
 * Palette: cyan accent #00f2fe on near-black #03060b, with danger #ff4d6d
 * and success #39d353. Keep these in sync across configurator + AR so the
 * two experiences read as one product.
 */
export const HUD = {
  bg: "#03060b",
  panel: "rgba(4,8,14,0.96)",
  glass: "rgba(8,19,24,0.65)",
  accent: "#00f2fe",
  danger: "#ff4d6d",
  success: "#39d353",
  warn: "#ffd60a",
  textPrimary: "#e2e8f0",
  textMuted: "#8a9aa8",
};

/* Keyframes shared by every HUD surface. Injected once per document. */
export const GLOBAL_STYLES = `
  @keyframes pulseGlow {
    0%, 100% { opacity: 0.6; transform: scale(1); }
    50% { opacity: 1; transform: scale(1.04); }
  }
  @keyframes ripple {
    0% { transform: scale(0); opacity: 0.6; }
    100% { transform: scale(3); opacity: 0; }
  }
  @keyframes scanLine {
    0% { transform: translateY(-100%); }
    100% { transform: translateY(400%); }
  }
  @keyframes attachFlash {
    0%   { opacity: 0; transform: scale(0.85); }
    30%  { opacity: 1; transform: scale(1.06); }
    60%  { opacity: 0.7; transform: scale(0.98); }
    100% { opacity: 0; transform: scale(1); }
  }
  @keyframes dotPulse {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.5); }
  }
  @keyframes borderSpin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
  @keyframes slideInRight {
    from { opacity: 0; transform: translateX(20px); }
    to { opacity: 1; transform: translateX(0); }
  }
  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(8px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes shimmer {
    0% { background-position: -200% center; }
    100% { background-position: 200% center; }
  }
`;

/** Injects the HUD keyframes into <head> exactly once. */
export function HudStyleInjector() {
  useEffect(() => {
    if (document.getElementById("hud-global-styles")) return;
    const tag = document.createElement("style");
    tag.id = "hud-global-styles";
    tag.textContent = GLOBAL_STYLES;
    document.head.appendChild(tag);
  }, []);
  return null;
}
