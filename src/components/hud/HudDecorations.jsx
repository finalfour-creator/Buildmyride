"use client";
import { useEffect, useState } from "react";
import { Box, Typography } from "@mui/material";

/** Animated cyan scan line sweeping down a HUD surface. */
export function ScanLine() {
  return (
    <Box sx={{
      position: "absolute", top: 0, left: 0, right: 0,
      height: "2px",
      background: "linear-gradient(90deg, transparent, rgba(0,242,254,0.6), transparent)",
      animation: "scanLine 3s linear infinite",
      pointerEvents: "none",
      zIndex: 5,
    }} />
  );
}

/** Four cyan corner brackets framing a HUD viewport. */
export function CornerBrackets() {
  const style = (pos) => ({
    position: "absolute", width: 16, height: 16,
    pointerEvents: "none", zIndex: 4,
    ...pos,
  });
  const borderBase = "2px solid rgba(0,242,254,0.5)";
  return (
    <>
      <Box sx={{ ...style({ top: 16, left: 16 }), borderTop: borderBase, borderLeft: borderBase }} />
      <Box sx={{ ...style({ top: 16, right: 16 }), borderTop: borderBase, borderRight: borderBase }} />
      <Box sx={{ ...style({ bottom: 16, left: 16 }), borderBottom: borderBase, borderLeft: borderBase }} />
      <Box sx={{ ...style({ bottom: 16, right: 16 }), borderBottom: borderBase, borderRight: borderBase }} />
    </>
  );
}

/**
 * Flash overlay shown when a part is attached. Bump `trigger` (any changing
 * value) to replay the animation.
 */
export function AttachFlash({ trigger, label = "PART ATTACHED" }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!trigger) return;
    setVisible(true);
    const t = setTimeout(() => setVisible(false), 700);
    return () => clearTimeout(t);
  }, [trigger]);

  if (!visible) return null;
  return (
    <Box sx={{
      position: "absolute", inset: 0, zIndex: 10,
      pointerEvents: "none",
      borderRadius: "16px",
      background: "radial-gradient(ellipse at center, rgba(0,242,254,0.18) 0%, transparent 70%)",
      border: "2px solid rgba(0,242,254,0.5)",
      animation: "attachFlash 0.7s ease forwards",
    }}>
      <Typography sx={{
        position: "absolute", top: "50%", left: "50%",
        transform: "translate(-50%,-50%)",
        color: "#00f2fe", fontWeight: 800, fontSize: "0.85rem",
        letterSpacing: "2px", textShadow: "0 0 12px #00f2fe",
        animation: "attachFlash 0.7s ease forwards",
      }}>
        {label}
      </Typography>
    </Box>
  );
}
