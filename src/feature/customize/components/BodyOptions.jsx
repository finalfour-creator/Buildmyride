"use client";
import { Box, Typography, Button, Tooltip } from "@mui/material";

const DEFAULT_PALETTE = [
  { name: "Obsidian Black", value: "#0a0a0a" },
  { name: "Pearl White", value: "#f8f9fa" },
  { name: "Nardo Grey", value: "#54585a" },
  { name: "Soul Red", value: "#9b111e" },
  { name: "Racing Blue", value: "#003366" },
  { name: "Forest Green", value: "#013220" },
  { name: "Sunburst Orange", value: "#cc5500" },
  { name: "Silver Frost", value: "#c0c0c0" },
];

export default function BodyOptions({
  selectedColor,
  setSelectedColor,
  colorPalette = [],
}) {
  // Use passed palette if available, otherwise use defaults
  const displayPalette = colorPalette.length > 0 
    ? colorPalette.map(c => typeof c === 'string' ? { value: c } : c)
    : DEFAULT_PALETTE;

  return (
    <Box sx={{
      p: 2.5,
      display: "flex",
      flexDirection: "column",
      gap: 3,
    }}>
      <Box>
        <Typography variant="caption" sx={{ fontWeight: 700, color: "#8a9aa8", mb: 1.5, display: "block", letterSpacing: "1px" }}>
          PRESET COLORS
        </Typography>
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.5 }}>
          {/* No-paint swatch — clears color and returns to green detection mode */}
          <Tooltip title="No paint (show detection)">
            <Box
              onClick={() => setSelectedColor(null)}
              sx={{
                width: 38,
                height: 38,
                border: selectedColor == null ? "3px solid #fff" : "1px solid rgba(255,255,255,0.15)",
                borderRadius: "4px",
                cursor: "pointer",
                position: "relative",
                overflow: "hidden",
                background: "#111",
                transition: "all 0.2s",
                boxShadow: selectedColor == null ? "0 0 10px rgba(255,255,255,0.3)" : "none",
                "&:hover": { borderColor: "rgba(255,255,255,0.5)" },
                // Red diagonal strikethrough
                "&::after": {
                  content: '""',
                  position: "absolute",
                  inset: 0,
                  background:
                    "linear-gradient(to bottom right, transparent calc(50% - 1px), #f44336 calc(50% - 1px), #f44336 calc(50% + 1px), transparent calc(50% + 1px))",
                },
              }}
            />
          </Tooltip>

          {displayPalette.map((color, i) => (
            <Tooltip title={color.name || ""} key={i}>
              <Box
                onClick={() =>
                  setSelectedColor(selectedColor === color.value ? null : color.value)
                }
                sx={{
                  width: 38,
                  height: 38,
                  background: color.value,
                  border: selectedColor === color.value ? "3px solid #fff" : "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "4px",
                  cursor: "pointer",
                  transition: "all 0.2s",
                  boxShadow: selectedColor === color.value ? "0 0 10px rgba(255,255,255,0.3)" : "none",
                  "&:hover": { transform: "translateY(-2px)", borderColor: "rgba(255,255,255,0.5)" },
                }}
              />
            </Tooltip>
          ))}
        </Box>
      </Box>

      <Box>
        <Typography variant="caption" sx={{ fontWeight: 700, color: "#8a9aa8", mb: 1.5, display: "block", letterSpacing: "1px" }}>
          CUSTOM COLOR
        </Typography>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Box
            component="input"
            type="color"
            value={selectedColor || "#000000"}
            onChange={(e) => setSelectedColor(e.target.value)}
            sx={{
              width: 50,
              height: 40,
              border: "none",
              padding: 0,
              background: "none",
              cursor: "pointer",
              "&::-webkit-color-swatch-wrapper": { padding: 0 },
              "&::-webkit-color-swatch": { border: "1px solid #2c5364", borderRadius: "4px" },
            }}
          />
          <Typography sx={{ color: "#fff", fontSize: "0.8rem", fontFamily: "monospace", opacity: 0.7 }}>
            {selectedColor ? selectedColor.toUpperCase() : "No paint"}
          </Typography>
        </Box>
      </Box>

      <Button
        variant="contained"
        fullWidth
        sx={{
          mt: 1,
          background: "linear-gradient(135deg, #2c5364, #203a43)",
          color: "#fff",
          py: 1.2,
          borderRadius: "4px",
          textTransform: "none",
          fontWeight: 600,
          fontSize: "0.85rem",
          letterSpacing: 0.5,
          border: "1px solid rgba(255,255,255,0.1)",
          "&:hover": { 
            background: "linear-gradient(135deg, #366174, #2a4c58)",
            borderColor: "rgba(255,255,255,0.2)" 
          },
        }}
      >
        LOCK PAINT COLOR
      </Button>
    </Box>
  );
}
