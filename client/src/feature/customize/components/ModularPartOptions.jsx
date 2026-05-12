"use client";
import { Box, Typography, Button, Grid, Paper } from "@mui/material";

export default function ModularPartOptions({ category, options, selectedPartUrl, onSelect }) {
  return (
    <Box sx={{ p: 2, color: "#fff" }}>
      <Typography variant="h6" sx={{ mb: 2, fontSize: "0.9rem", fontWeight: 700, textTransform: "uppercase" }}>
        {category} Selection
      </Typography>

      <Grid container spacing={2}>
        {/* "None" or "Original" option */}
        <Grid item xs={6}>
          <Paper
            onClick={() => onSelect(null)}
            sx={{
              p: 1,
              textAlign: "center",
              cursor: "pointer",
              bgcolor: selectedPartUrl === null ? "primary.main" : "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.1)",
              "&:hover": { bgcolor: "rgba(255,255,255,0.1)" },
            }}
          >
            <Typography variant="caption" sx={{ color: "#fff" }}>Original</Typography>
          </Paper>
        </Grid>

        {options.map((option) => (
          <Grid item xs={6} key={option._id}>
            <Paper
              onClick={() => onSelect(option.modelUrl)}
              sx={{
                p: 1,
                textAlign: "center",
                cursor: "pointer",
                bgcolor: selectedPartUrl === option.modelUrl ? "primary.main" : "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.1)",
                transition: "all 0.2s",
                "&:hover": { bgcolor: "rgba(255,255,255,0.1)", transform: "scale(1.02)" },
              }}
            >
              {option.thumbnail ? (
                <Box component="img" src={option.thumbnail} sx={{ width: "100%", height: 60, objectFit: "contain", mb: 1 }} />
              ) : (
                <Box sx={{ width: "100%", height: 60, display: "flex", alignItems: "center", justifyContent: "center", bgcolor: "rgba(0,0,0,0.2)", mb: 1 }}>
                  <Typography variant="caption" sx={{ color: "#666" }}>No Preview</Typography>
                </Box>
              )}
              <Typography variant="caption" sx={{ display: "block", color: "#fff", fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {option.name}
              </Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
