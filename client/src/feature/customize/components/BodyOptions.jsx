"use client";
import { Box, Typography, Button } from "@mui/material";

export default function BodyOptions({
  selectedColor,
  setSelectedColor,
  colorPalette,
}) {
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
      <Box>
        <Typography variant="subtitle2" sx={{ fontWeight: 600, color: "#e2e8f0", mb: 1, letterSpacing: "0.5px" }}>
          PAINT COLORS
        </Typography>
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
          {colorPalette.map((color, i) => (
            <Box
              key={i}
              onClick={() => setSelectedColor(color)}
              sx={{
                width: 32,
                height: 32,
                background: color,
                border: selectedColor === color ? "2px solid #2c5364" : "1px solid #2c5364",
                cursor: "pointer",
                transition: "transform 0.2s",
                "&:hover": { transform: "scale(1.05)" },
              }}
            />
          ))}
        </Box>
      </Box>

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
  );
}
