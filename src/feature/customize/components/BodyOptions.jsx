"use client";
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
];

export default function BodyOptions({ selectedColor, setSelectedColor, colorPalette = [] }) {
  const displayPalette = colorPalette.length > 0
    ? colorPalette.map(c => (typeof c === "string" ? { value: c } : c))
    : DEFAULT_PALETTE;

  return (
    <Box sx={{
      display: "flex", alignItems: "center", height: "100%",
      px: 2, gap: 0, overflow: "hidden",
    }}>

      {/* Section label */}
      <Typography sx={{
        fontSize: "0.58rem", fontWeight: 700, letterSpacing: "0.12em",
        color: "rgba(138,154,168,0.8)", textTransform: "uppercase",
        whiteSpace: "nowrap", flexShrink: 0, pr: 2,
      }}>
        PRESET COLORS
      </Typography>

      {/* Colour swatches — horizontally scrollable */}
      <Box sx={{
        display: "flex", gap: 1, alignItems: "center",
        overflowX: "auto", flexShrink: 1, minWidth: 0,
        scrollbarWidth: "none", "&::-webkit-scrollbar": { display: "none" },
        py: 0.5,
      }}>
        {displayPalette.map((color, i) => (
          <Tooltip title={color.name || ""} key={i} placement="top">
            <Box
              onClick={() => setSelectedColor(color.value)}
              sx={{
                width: 34, height: 34, flexShrink: 0,
                background: color.value, borderRadius: "3px", cursor: "pointer",
                border: selectedColor === color.value
                  ? "2px solid #fff"
                  : "1px solid rgba(255,255,255,0.12)",
                boxShadow: selectedColor === color.value
                  ? "0 0 8px rgba(255,255,255,0.3)"
                  : "none",
                transition: "all 0.18s",
                "&:hover": { transform: "scale(1.12)", borderColor: "rgba(255,255,255,0.5)" },
              }}
            />
          </Tooltip>
        ))}
      </Box>

      {/* Divider */}
      <Box sx={{ width: "1px", height: 36, background: "rgba(0,255,204,0.12)", mx: 2, flexShrink: 0 }} />

      {/* Custom colour picker */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, flexShrink: 0 }}>
        <Typography sx={{
          fontSize: "0.58rem", fontWeight: 700, letterSpacing: "0.12em",
          color: "rgba(138,154,168,0.8)", textTransform: "uppercase", whiteSpace: "nowrap",
        }}>
          CUSTOM
        </Typography>
        <Box
          component="input"
          type="color"
          value={selectedColor || "#000000"}
          onChange={(e) => setSelectedColor(e.target.value)}
          sx={{
            width: 34, height: 34, border: "none", padding: 0,
            background: "none", cursor: "pointer", borderRadius: "3px",
            "&::-webkit-color-swatch-wrapper": { padding: 0 },
            "&::-webkit-color-swatch": { border: "1px solid #2c5364", borderRadius: "3px" },
          }}
        />
        <Typography sx={{
          color: "rgba(232,234,246,0.6)", fontSize: "0.72rem",
          fontFamily: "monospace", whiteSpace: "nowrap",
        }}>
          {selectedColor?.toUpperCase()}
        </Typography>
      </Box>

    </Box>
  );
}
