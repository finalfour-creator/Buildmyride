"use client";
import { Box, Typography } from "@mui/material";

/**
 * Save-status pill — dot + label reflecting save state.
 * saveStatus: "saving" | "error" | "saved" | "modified"
 */
export default function SaveStatusPill({ saveStatus, isModified }) {
  const isUnsaved = saveStatus === "modified" || isModified;
  const color =
    saveStatus === "saving" ? "#00f2fe" :
    saveStatus === "error"  ? "#ff4d6d" :
    isUnsaved               ? "#ffd60a" : "#39d353";
  const label =
    saveStatus === "saving" ? "Saving…" :
    saveStatus === "error"  ? "Save Error" :
    isUnsaved               ? "Unsaved Changes" : "All Saved";

  return (
    <Box sx={{
      display: "flex", alignItems: "center", gap: 1,
      px: 1.8, py: 0.65,
      borderRadius: "20px",
      background: "rgba(8,19,24,0.65)",
      border: `1px solid ${color}33`,
      backdropFilter: "blur(8px)",
      animation: "fadeUp 0.4s ease",
    }}>
      <Box sx={{
        width: 7, height: 7, borderRadius: "50%",
        background: color,
        boxShadow: `0 0 8px ${color}`,
        animation: saveStatus === "saving" ? "dotPulse 1s ease infinite" : "none",
      }} />
      <Typography sx={{ color: "#e2e8f0", fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.6px" }}>
        {label}
      </Typography>
    </Box>
  );
}
