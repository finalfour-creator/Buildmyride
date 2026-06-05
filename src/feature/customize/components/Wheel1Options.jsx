"use client";
import { Box, Typography, Button } from "@mui/material";

export default function WheelOptions({
  activeWheelPosition,
  wheels,
  setWheels,
  wheelOptions = [],
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
      display: "flex", alignItems: "center", height: "100%",
      px: 2, gap: 0, overflow: "hidden",
    }}>

      {/* Section label + active position badge */}
      <Box sx={{ display: "flex", flexDirection: "column", flexShrink: 0, pr: 2, gap: 0.4 }}>
        <Typography sx={{
          fontSize: "0.58rem", fontWeight: 700, letterSpacing: "0.12em",
          color: "rgba(138,154,168,0.8)", textTransform: "uppercase",
        }}>
          WHEEL PACKAGES
        </Typography>
        {activeWheelPosition ? (
          <Typography sx={{
            fontSize: "0.58rem", fontWeight: 600, letterSpacing: "0.08em",
            color: "#00ffcc", background: "rgba(0,255,204,0.1)",
            px: 0.8, py: 0.15, textTransform: "uppercase",
          }}>
            {activeWheelPosition.replace("-", " ")}
          </Typography>
        ) : (
          <Typography sx={{ fontSize: "0.56rem", color: "rgba(138,154,168,0.6)", maxWidth: 90 }}>
            Click wheel to target
          </Typography>
        )}
      </Box>

      {/* Divider */}
      <Box sx={{ width: "1px", height: 36, background: "rgba(0,255,204,0.12)", mr: 2, flexShrink: 0 }} />

      {/* Wheel option buttons — horizontally scrollable */}
      <Box sx={{
        display: "flex", gap: 1, alignItems: "center",
        overflowX: "auto", flexShrink: 1, minWidth: 0,
        scrollbarWidth: "none", "&::-webkit-scrollbar": { display: "none" },
      }}>
        {wheelOptions.length === 0 && (
          <Typography sx={{ fontSize: "0.68rem", color: "rgba(138,154,168,0.5)", whiteSpace: "nowrap" }}>
            No wheel options available
          </Typography>
        )}
        {wheelOptions.map((wheel) => {
          const active = currentWheelUrl === wheel.modelUrl;
          return (
            <Box
              key={wheel.name}
              onClick={() => handleSelectWheel(wheel.modelUrl)}
              sx={{
                flexShrink: 0, px: 1.5, py: 0.6, cursor: "pointer",
                fontSize: "0.68rem", fontWeight: 500, whiteSpace: "nowrap",
                color: active ? "#fff" : "rgba(232,234,246,0.7)",
                background: active ? "linear-gradient(135deg,#2c5364,#0f2027)" : "rgba(255,255,255,0.04)",
                border: `1px solid ${active ? "#2c5364" : "rgba(44,83,100,0.3)"}`,
                transition: "all 0.18s",
                "&:hover": { background: "rgba(44,83,100,0.25)", borderColor: "#2c5364" },
              }}
            >
              {wheel.name}
            </Box>
          );
        })}
      </Box>

      {/* Divider */}
      <Box sx={{ width: "1px", height: 36, background: "rgba(0,255,204,0.12)", mx: 2, flexShrink: 0 }} />

      {/* Action buttons */}
      <Box sx={{ display: "flex", gap: 1, flexShrink: 0 }}>
        <Button
          variant="outlined"
          onClick={() => {
            if (wheelOptions.length > 0) onApplyAllWheels?.(wheelOptions[0].modelUrl);
          }}
          sx={{
            borderColor: "rgba(44,83,100,0.5)", color: "rgba(232,234,246,0.8)",
            px: 1.5, py: 0.5, borderRadius: 0, textTransform: "none",
            fontWeight: 600, fontSize: "0.65rem", whiteSpace: "nowrap",
            "&:hover": { background: "rgba(44,83,100,0.3)", borderColor: "#00ffcc" },
          }}
        >
          ALL WHEELS
        </Button>
        <Button
          variant="contained"
          sx={{
            background: "linear-gradient(135deg,#0f2027,#2c5364)",
            px: 1.5, py: 0.5, borderRadius: 0, textTransform: "none",
            fontWeight: 600, fontSize: "0.65rem", whiteSpace: "nowrap",
            "&:hover": { opacity: 0.9 },
          }}
        >
          SAVE CONFIG
        </Button>
      </Box>

    </Box>
  );
}
