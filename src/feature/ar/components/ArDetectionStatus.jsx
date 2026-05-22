"use client";

import { Box, Typography } from "@mui/material";

export default function ArDetectionStatus({
  detectionMode,
  fps,
  statusMessage,
  isInferring,
}) {
  if (detectionMode === "loading") return null;

  const modeLabel =
    detectionMode === "yolo"
      ? "YOLOv8"
      : detectionMode === "demo"
        ? "DEMO"
        : "…";

  const modeColor =
    detectionMode === "yolo" ? "#4caf50" : "#ffca28";

  return (
    <Box
      sx={{
        position: "absolute",
        bottom: 16,
        right: 16,
        zIndex: 3,
        maxWidth: 280,
        bgcolor: "rgba(15, 32, 39, 0.92)",
        border: "1px solid #2c5364",
        borderRadius: 1,
        px: 1.5,
        py: 1,
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
        <Box
          sx={{
            width: 8,
            height: 8,
            borderRadius: "50%",
            bgcolor: modeColor,
            animation: isInferring ? "pulse 1s infinite" : "none",
            "@keyframes pulse": {
              "0%, 100%": { opacity: 1 },
              "50%": { opacity: 0.4 },
            },
          }}
        />
        <Typography variant="caption" sx={{ color: modeColor, fontWeight: 700 }}>
          {modeLabel}
        </Typography>
        <Typography variant="caption" sx={{ color: "#64748b", ml: "auto" }}>
          {fps} FPS
        </Typography>
      </Box>
      <Typography variant="caption" sx={{ color: "#e2e8f0", lineHeight: 1.4 }}>
        {statusMessage}
      </Typography>
    </Box>
  );
}
