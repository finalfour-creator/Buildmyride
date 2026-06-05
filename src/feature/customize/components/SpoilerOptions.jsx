"use client";
import { Box, Typography, Button } from "@mui/material";

export default function SpoilerOptions({
  selectedSpoiler,
  setSelectedSpoiler,
  spoilerOptions,
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
      <Box sx={{ flex: 1 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, color: "#e2e8f0", letterSpacing: "0.5px" }}>
            SPOILER PACKAGES
          </Typography>
        </Box>
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
           <Button
            onClick={() => setSelectedSpoiler(null)}
            sx={{
              py: 0.75,
              px: 1.5,
              background: selectedSpoiler === null ? "linear-gradient(135deg, #2c5364, #0f2027)" : "transparent",
              color: selectedSpoiler === null ? "#ffffff" : "#e2e8f0",
              border: "1px solid #2c5364",
              borderRadius: 0,
              textTransform: "none",
              fontSize: "0.75rem",
              whiteSpace: "nowrap",
              "&:hover": {
                background: selectedSpoiler === null ? "linear-gradient(135deg, #2c5364, #0f2027)" : "rgba(44,83,100,0.2)",
              },
            }}
          >
            Original
          </Button>
          {spoilerOptions.map((spoiler) => (
            <Button
              key={spoiler.name}
              onClick={() => setSelectedSpoiler(spoiler.modelUrl)}
              sx={{
                py: 0.75,
                px: 1.5,
                background: selectedSpoiler === spoiler.modelUrl ? "linear-gradient(135deg, #2c5364, #0f2027)" : "transparent",
                color: selectedSpoiler === spoiler.modelUrl ? "#ffffff" : "#e2e8f0",
                border: "1px solid #2c5364",
                borderRadius: 0,
                textTransform: "none",
                fontSize: "0.75rem",
                whiteSpace: "nowrap",
                "&:hover": {
                  background: selectedSpoiler === spoiler.modelUrl ? "linear-gradient(135deg, #2c5364, #0f2027)" : "rgba(44,83,100,0.2)",
                },
              }}
            >
              {spoiler.name}
            </Button>
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
