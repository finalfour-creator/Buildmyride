"use client";
import { Box, Typography, Paper } from "@mui/material";

export default function StatsCard({ label, value, icon }) {
  return (
    <Paper
      sx={{
        p: 3,
        textAlign: "center",
        background: "#ffffff",
        border: "1px solid #e8e0d6",
        boxShadow: "none",
        transition: "transform 0.2s",
        "&:hover": { transform: "translateY(-2px)" },
      }}
    >
      <Typography variant="h3" sx={{ fontSize: 36, mb: 1 }}>
        {icon}
      </Typography>
      <Typography variant="h5" sx={{ fontSize: 28, fontWeight: 700, color: "#2c5364", mb: 0.5 }}>
        {value}
      </Typography>
      <Typography variant="caption" sx={{ color: "#8a9aa8", letterSpacing: "0.5px", textTransform: "uppercase" }}>
        {label}
      </Typography>
    </Paper>
  );
}