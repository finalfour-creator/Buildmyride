"use client";
import { useState } from "react";
import { Box } from "@mui/material";

/**
 * Animated glow button — the shared CTA style for HUD surfaces.
 * Ripple on click, cyan glow on hover. `variant="contained"` for primary actions.
 */
export default function GlowButton({
  children,
  onClick,
  disabled,
  color = "#00f2fe",
  danger = false,
  variant = "outlined",
  icon,
  sx = {},
}) {
  const [ripples, setRipples] = useState([]);
  const base = danger ? "#ff4d6d" : color;

  const handleClick = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const id = Date.now();
    setRipples((r) => [...r, { id, x, y }]);
    setTimeout(() => setRipples((r) => r.filter((rr) => rr.id !== id)), 600);
    onClick?.(e);
  };

  const isContained = variant === "contained";

  return (
    <Box
      component="button"
      onClick={handleClick}
      disabled={disabled}
      sx={{
        position: "relative",
        overflow: "hidden",
        display: "inline-flex",
        alignItems: "center",
        gap: 0.8,
        px: 2.4,
        py: 0.85,
        borderRadius: "8px",
        fontFamily: "inherit",
        fontSize: "0.78rem",
        fontWeight: 700,
        letterSpacing: "0.5px",
        cursor: disabled ? "not-allowed" : "pointer",
        border: `1.5px solid ${isContained ? "transparent" : `${base}55`}`,
        background: isContained
          ? `linear-gradient(135deg, ${base}22, ${base}44)`
          : "rgba(8,19,24,0.5)",
        color: isContained ? "#05161e" : base,
        backdropFilter: "blur(8px)",
        transition: "all 0.25s cubic-bezier(0.4,0,0.2,1)",
        opacity: disabled ? 0.5 : 1,
        "&:hover": disabled
          ? {}
          : {
              borderColor: base,
              background: isContained
                ? `linear-gradient(135deg, ${base}55, ${base}88)`
                : `${base}11`,
              boxShadow: `0 0 18px ${base}44, 0 0 40px ${base}22`,
              transform: "translateY(-1px) scale(1.02)",
            },
        "&:active": { transform: "scale(0.97) translateY(0)" },
        ...sx,
      }}
    >
      {ripples.map((r) => (
        <Box
          key={r.id}
          sx={{
            position: "absolute",
            left: r.x,
            top: r.y,
            width: 8,
            height: 8,
            marginLeft: -1,
            marginTop: -1,
            borderRadius: "50%",
            background: `${base}66`,
            animation: "ripple 0.6s ease-out forwards",
            pointerEvents: "none",
          }}
        />
      ))}
      {icon && (
        <Box component="span" sx={{ fontSize: "0.9rem", lineHeight: 1 }}>
          {icon}
        </Box>
      )}
      {children}
    </Box>
  );
}
