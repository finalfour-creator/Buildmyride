"use client";
import { Box, Typography, Button } from "@mui/material";

export default function WheelOptions({
  activeWheelPosition,
  wheels,
  setWheels,
  wheelOptions,
  onApplyAllWheels,
}) {
  const currentWheelUrl = activeWheelPosition ? wheels?.[activeWheelPosition] : null;

  const handleSelectWheel = (url) => {
    if (activeWheelPosition) {
      setWheels((prev) => ({ ...prev, [activeWheelPosition]: url }));
    } else {
      onApplyAllWheels?.(url);
    }
  };

  return (
    <Box sx={{
      background: "#0f2027",
      border: "1px solid #2c5364",
      p: 2,
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      flexWrap: "wrap",
      gap: 2,
    }}>
      <Box sx={{ flex: 1 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, color: "#e2e8f0", letterSpacing: "0.5px" }}>
            WHEEL PACKAGES
          </Typography>
          {activeWheelPosition && (
            <Typography
              variant="caption"
              sx={{
                color: "#64ffda",
                fontWeight: 500,
                textTransform: "uppercase",
                background: "rgba(100,255,218,0.1)",
                px: 1,
                py: 0.25,
                borderRadius: "2px",
                fontSize: "0.65rem",
              }}
            >
              {activeWheelPosition.replace("-", " ")}
            </Typography>
          )}
          {!activeWheelPosition && (
            <Typography variant="caption" sx={{ color: "#8a9aa8", fontSize: "0.65rem" }}>
              Click a wheel on the car to target a specific position
            </Typography>
          )}
        </Box>
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
          {wheelOptions.map((wheel) => (
            <Button
              key={wheel.name}
              onClick={() => handleSelectWheel(wheel.modelUrl)}
              sx={{
                py: 0.75,
                px: 1.5,
                background: currentWheelUrl === wheel.modelUrl ? "linear-gradient(135deg, #2c5364, #0f2027)" : "transparent",
                color: currentWheelUrl === wheel.modelUrl ? "#ffffff" : "#e2e8f0",
                border: "1px solid #2c5364",
                borderRadius: 0,
                textTransform: "none",
                fontSize: "0.75rem",
                whiteSpace: "nowrap",
                "&:hover": {
                  background: currentWheelUrl === wheel.modelUrl ? "linear-gradient(135deg, #2c5364, #0f2027)" : "rgba(44,83,100,0.2)",
                },
              }}
            >
              {wheel.name}
            </Button>
          ))}
        </Box>
      </Box>

      <Box sx={{ display: "flex", gap: 1, flexShrink: 0 }}>
        <Button
          variant="outlined"
          onClick={() => {
            if (wheelOptions.length > 0) {
              onApplyAllWheels?.(wheelOptions[0].modelUrl);
            }
          }}
          sx={{
            borderColor: "#2c5364",
            color: "#e2e8f0",
            px: 2,
            py: 1,
            borderRadius: 0,
            textTransform: "none",
            fontWeight: 600,
            fontSize: "0.7rem",
            "&:hover": { background: "rgba(44,83,100,0.3)", borderColor: "#64ffda" },
          }}
        >
          APPLY TO ALL
        </Button>
        <Button
          variant="contained"
          sx={{
            background: "linear-gradient(135deg, #0f2027, #2c5364)",
            px: 3,
            py: 1,
            borderRadius: 0,
            textTransform: "none",
            fontWeight: 600,
            fontSize: "0.8rem",
            "&:hover": { opacity: 0.9 },
            whiteSpace: "nowrap",
          }}
        >
          SAVE CONFIGURATION
        </Button>
      </Box>
    </Box>
  );
}
