import { Box, Typography } from "@mui/material";

export default function StatsCard({ label, value, sub, delta }) {
  return (
    <Box sx={{ background: "white", border: "1px solid #e8e0d6", p: 3 }}>
      <Typography variant="caption" sx={{ fontSize: 11, letterSpacing: 1, textTransform: "uppercase", color: "#8a9aa8", mb: 1, display: "block" }}>
        {label}
      </Typography>
      <Typography variant="h4" sx={{ fontSize: 32, fontWeight: 600, color: "#1a2a32", mb: 0.5 }}>
        {value}
      </Typography>
      {sub && <Typography variant="body2" sx={{ fontSize: 11, color: "#8a9aa8" }}>{sub}</Typography>}
      {delta && <Typography variant="caption" sx={{ fontSize: 11, color: "#10b981", mt: 1, display: "block" }}>↑ {delta}</Typography>}
    </Box>
  );
}