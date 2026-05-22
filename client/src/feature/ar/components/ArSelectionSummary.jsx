"use client";

import { Box, Typography } from "@mui/material";

/**
 * Phase 3: shows what is selected locally (no 3D overlay yet).
 */
export default function ArSelectionSummary({ arBuild, wheels, selectedColor }) {
  const partEntries = Object.entries(arBuild);
  const wheelEntries = Object.entries(wheels).filter(([, url]) => url);

  const hasAny =
    partEntries.length > 0 || wheelEntries.length > 0 || selectedColor;

  if (!hasAny) return null;

  return (
    <Box
      sx={{
        position: "absolute",
        top: 12,
        right: 12,
        maxWidth: 280,
        maxHeight: 160,
        overflowY: "auto",
        bgcolor: "rgba(15, 32, 39, 0.92)",
        border: "1px solid #2c5364",
        borderRadius: 1,
        p: 1.5,
        zIndex: 2,
      }}
    >
      <Typography
        variant="caption"
        sx={{ color: "#8a9aa8", fontWeight: 700, letterSpacing: 0.5, display: "block", mb: 0.75 }}
      >
        SELECTED ON CAR
      </Typography>

      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
        <Box
          sx={{
            width: 14,
            height: 14,
            borderRadius: 0.5,
            bgcolor: selectedColor,
            border: "1px solid rgba(255,255,255,0.3)",
          }}
        />
        <Typography variant="caption" sx={{ color: "#e2e8f0" }}>
          Paint {selectedColor}
        </Typography>
      </Box>

      {partEntries.map(([slot, val]) => (
        <Typography key={slot} variant="caption" sx={{ color: "#cbd5e1", display: "block" }}>
          {slot}: {val?.name || "Part selected"}
        </Typography>
      ))}

      {wheelEntries.map(([pos, url]) => (
        <Typography key={pos} variant="caption" sx={{ color: "#cbd5e1", display: "block" }}>
          Wheel {pos}: selected
        </Typography>
      ))}
    </Box>
  );
}
