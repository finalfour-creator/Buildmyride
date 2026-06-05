"use client";
import { useState } from "react";
import { Box, Typography, Tooltip } from "@mui/material";

const DEFAULT_PALETTE = [
  { name: "Obsidian Black",  value: "#0a0a0a" },
  { name: "Pearl White",     value: "#f8f9fa" },
  { name: "Nardo Grey",      value: "#54585a" },
  { name: "Soul Red",        value: "#9b111e" },
  { name: "Racing Blue",     value: "#003366" },
  { name: "Forest Green",    value: "#013220" },
  { name: "Sunburst Orange", value: "#cc5500" },
  { name: "Silver Frost",    value: "#c0c0c0" },
  { name: "Midnight Purple", value: "#2d1b69" },
  { name: "Champagne Gold",  value: "#c5a028" },
];

export default function BodyOptions({ selectedColor, setSelectedColor, colorPalette = [], horizontal = false }) {
  const [hovered, setHovered] = useState(null);

  const displayPalette =
    colorPalette.length > 0
      ? colorPalette.map((c) => (typeof c === "string" ? { value: c } : c))
      : DEFAULT_PALETTE;

  /* ── Horizontal layout (NFS bottom bar) ── */
  if (horizontal) {
    return (
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, px: 2.5, height: "100%", flexShrink: 0 }}>
        {/* Left label */}
        <Box sx={{
          display: "flex", flexDirection: "column", justifyContent: "center",
          alignItems: "center", pr: 2, flexShrink: 0,
          borderRight: "1px solid rgba(0,242,254,0.07)",
          minWidth: 52, height: "100%",
        }}>
          <Typography sx={{
            fontSize: "0.44rem", fontWeight: 900, color: "#00f2fe",
            letterSpacing: "2px", textTransform: "uppercase",
            writingMode: "vertical-rl", transform: "rotate(180deg)",
            textShadow: "0 0 8px rgba(0,242,254,0.3)",
          }}>
            Paint
          </Typography>
        </Box>

        {/* Color swatches in a row */}
        <Box sx={{ display: "flex", gap: 1.2, alignItems: "center", flexShrink: 0 }}>
          {displayPalette.map((color, i) => {
            const isSelected = selectedColor === color.value;
            return (
              <Tooltip title={color.name || ""} key={i} placement="top" arrow>
                <Box
                  onClick={() => setSelectedColor(color.value)}
                  onMouseEnter={() => setHovered(i)}
                  onMouseLeave={() => setHovered(null)}
                  sx={{
                    position: "relative",
                    width: 30, height: 30, borderRadius: "50%",
                    cursor: "pointer", flexShrink: 0,
                    transition: "all 0.25s cubic-bezier(0.4,0,0.2,1)",
                    transform: isSelected ? "scale(1.2) translateY(-2px)" : hovered === i ? "scale(1.1)" : "scale(1)",
                    "&::before": {
                      content: '""', position: "absolute", inset: -3, borderRadius: "50%",
                      border: isSelected ? "2px solid #00f2fe" : "2px solid transparent",
                      boxShadow: isSelected ? "0 0 12px rgba(0,242,254,0.6)" : "none",
                      transition: "all 0.25s ease",
                    },
                    background: `
                      radial-gradient(circle at 38% 32%, rgba(255,255,255,0.45) 0%, rgba(0,0,0,0) 55%),
                      radial-gradient(circle at 75% 75%, rgba(0,0,0,0.5) 0%, transparent 60%),
                      ${color.value}
                    `,
                    boxShadow: isSelected
                      ? `0 6px 20px ${color.value}88, 0 0 0 1px ${color.value}44`
                      : `0 3px 10px rgba(0,0,0,0.4)`,
                  }}
                />
              </Tooltip>
            );
          })}
        </Box>

        {/* Vertical divider */}
        <Box sx={{ width: "1px", height: "50%", background: "rgba(0,242,254,0.08)", flexShrink: 0 }} />

        {/* Custom color picker — compact */}
        <Box sx={{
          position: "relative",
          height: 52, width: 170, flexShrink: 0,
          borderRadius: "12px",
          border: "1px solid rgba(0,242,254,0.15)",
          background: `linear-gradient(135deg, ${selectedColor || "#1e3a5f"}55 0%, rgba(6,14,19,0.95) 70%)`,
          overflow: "hidden",
          display: "flex", alignItems: "center", px: 1.5, gap: 1.5,
          cursor: "pointer",
          transition: "all 0.35s ease",
          "&:hover": { borderColor: "rgba(0,242,254,0.4)" },
        }}>
          <Box sx={{
            width: 28, height: 28, borderRadius: "7px", flexShrink: 0,
            background: `radial-gradient(circle at 35% 35%, rgba(255,255,255,0.4), transparent 55%), ${selectedColor || "#000"}`,
            border: "1px solid rgba(255,255,255,0.15)",
            boxShadow: `0 0 10px ${selectedColor || "#000"}88`,
          }} />
          <Typography sx={{
            color: "#e2e8f0", fontSize: "0.75rem", fontFamily: "monospace",
            fontWeight: 700, letterSpacing: "2px",
            textShadow: `0 0 8px ${selectedColor}`,
          }}>
            {(selectedColor || "#000000").toUpperCase()}
          </Typography>
          <Box
            component="input" type="color"
            value={selectedColor || "#000000"}
            onChange={(e) => setSelectedColor(e.target.value)}
            sx={{ position: "absolute", inset: 0, opacity: 0, cursor: "pointer", zIndex: 2, width: "100%", height: "100%" }}
          />
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 2.5, display: "flex", flexDirection: "column", gap: 3 }}>

      {/* ── Preset Colors ── */}
      <Box>
        <Typography sx={{
          fontSize: "0.62rem", fontWeight: 800, color: "#3a5565",
          letterSpacing: "2px", mb: 1.8, display: "block",
        }}>
          PRESET COLORS
        </Typography>

        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.4 }}>
          {displayPalette.map((color, i) => {
            const isSelected = selectedColor === color.value;
            return (
              <Tooltip title={color.name || ""} key={i} placement="top" arrow>
                <Box
                  onClick={() => setSelectedColor(color.value)}
                  onMouseEnter={() => setHovered(i)}
                  onMouseLeave={() => setHovered(null)}
                  sx={{
                    position: "relative",
                    width: 34, height: 34,
                    borderRadius: "50%",
                    cursor: "pointer",
                    transition: "all 0.25s cubic-bezier(0.4,0,0.2,1)",
                    transform: isSelected ? "scale(1.18) translateY(-2px)" : hovered === i ? "scale(1.1) translateY(-2px)" : "scale(1)",
                    // Outer glow ring when selected
                    "&::before": {
                      content: '""',
                      position: "absolute",
                      inset: -3,
                      borderRadius: "50%",
                      border: isSelected ? "2px solid #00f2fe" : "2px solid transparent",
                      boxShadow: isSelected ? "0 0 14px rgba(0,242,254,0.6)" : "none",
                      transition: "all 0.25s ease",
                    },
                    // Color swatch with 3D shine
                    background: `
                      radial-gradient(circle at 38% 32%, rgba(255,255,255,0.45) 0%, rgba(0,0,0,0) 55%),
                      radial-gradient(circle at 75% 75%, rgba(0,0,0,0.5) 0%, transparent 60%),
                      ${color.value}
                    `,
                    boxShadow: isSelected
                      ? `0 6px 20px ${color.value}88, 0 0 0 1px ${color.value}44`
                      : `0 3px 10px rgba(0,0,0,0.4)`,
                  }}
                />
              </Tooltip>
            );
          })}
        </Box>
      </Box>

      {/* ── Color Preview Strip ── */}
      <Box sx={{
        height: 6,
        borderRadius: "4px",
        background: `linear-gradient(90deg, ${selectedColor || "#1e3a5f"}, transparent)`,
        opacity: 0.6,
        transition: "background 0.4s ease",
      }} />

      {/* ── Custom Color Picker ── */}
      <Box>
        <Typography sx={{
          fontSize: "0.62rem", fontWeight: 800, color: "#3a5565",
          letterSpacing: "2px", mb: 1.8, display: "block",
        }}>
          CUSTOM COLOR
        </Typography>

        <Box sx={{
          position: "relative",
          width: "100%", height: 62,
          borderRadius: "12px",
          border: "1px solid rgba(0,242,254,0.15)",
          background: `linear-gradient(135deg, ${selectedColor || "#1e3a5f"}55 0%, rgba(6,14,19,0.95) 70%)`,
          overflow: "hidden",
          display: "flex", alignItems: "center",
          px: 2, gap: 2,
          cursor: "pointer",
          transition: "all 0.35s ease",
          "&:hover": {
            borderColor: "rgba(0,242,254,0.4)",
            boxShadow: `0 0 20px ${(selectedColor || "#1e3a5f")}33`,
          },
        }}>
          {/* Animated shimmer */}
          <Box sx={{
            position: "absolute", inset: 0, pointerEvents: "none", opacity: 0.12,
            background: "linear-gradient(90deg, transparent, rgba(0,242,254,0.8), transparent)",
            backgroundSize: "200% 100%",
            animation: "shimmer 3s linear infinite",
            "@keyframes shimmer": {
              "0%": { backgroundPosition: "-200% center" },
              "100%": { backgroundPosition: "200% center" },
            },
          }} />

          {/* Color swatch preview */}
          <Box sx={{
            width: 36, height: 36, borderRadius: "8px", flexShrink: 0,
            background: `radial-gradient(circle at 35% 35%, rgba(255,255,255,0.4), transparent 55%), ${selectedColor || "#000"}`,
            border: "1px solid rgba(255,255,255,0.15)",
            boxShadow: `0 0 12px ${selectedColor || "#000"}88`,
            transition: "background 0.3s ease, box-shadow 0.3s ease",
          }} />

          {/* Hex label */}
          <Typography sx={{
            color: "#e2e8f0",
            fontSize: "0.9rem",
            fontFamily: "monospace",
            fontWeight: 700,
            letterSpacing: "2px",
            textShadow: `0 0 10px ${selectedColor}`,
            flex: 1,
          }}>
            {(selectedColor || "#000000").toUpperCase()}
          </Typography>

          <Typography sx={{ color: "#3a5565", fontSize: "0.65rem", fontWeight: 600, letterSpacing: "1px" }}>
            TAP TO PICK
          </Typography>

          {/* Invisible native color input */}
          <Box
            component="input"
            type="color"
            value={selectedColor || "#000000"}
            onChange={(e) => setSelectedColor(e.target.value)}
            sx={{
              position: "absolute", inset: 0,
              opacity: 0, cursor: "pointer", zIndex: 2,
              width: "100%", height: "100%",
            }}
          />
        </Box>
      </Box>

      {/* ── Currently Selected ── */}
      <Box sx={{
        display: "flex", alignItems: "center", gap: 1.5,
        px: 2, py: 1.2,
        borderRadius: "10px",
        background: "rgba(0,242,254,0.04)",
        border: "1px solid rgba(0,242,254,0.1)",
      }}>
        <Box sx={{
          width: 12, height: 12, borderRadius: "50%",
          background: selectedColor || "#000",
          boxShadow: `0 0 8px ${selectedColor}`,
          flexShrink: 0,
          transition: "all 0.3s ease",
        }} />
        <Typography sx={{ color: "#8a9aa8", fontSize: "0.72rem", fontWeight: 600 }}>
          Active color
        </Typography>
        <Typography sx={{
          ml: "auto", color: "#00f2fe", fontSize: "0.72rem",
          fontFamily: "monospace", fontWeight: 700,
        }}>
          {(selectedColor || "#000000").toUpperCase()}
        </Typography>
      </Box>
    </Box>
  );
}
