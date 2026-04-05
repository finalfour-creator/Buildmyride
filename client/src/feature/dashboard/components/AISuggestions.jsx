import { Box, Typography } from "@mui/material";

export default function AISuggestions({ suggestions }) {
  return (
    <Box>
      {suggestions.map((s) => (
        <Box key={s.title} sx={{ display: "flex", alignItems: "flex-start", gap: 1.5, py: 1.5, borderBottom: "1px solid #f0ece4" }}>
          <Typography sx={{ fontSize: 18, width: 28 }}>{s.icon}</Typography>
          <Box sx={{ flex: 1 }}>
            <Typography sx={{ fontWeight: 600, fontSize: 12, color: "#1a2a32", mb: 0.5 }}>{s.title}</Typography>
            <Typography sx={{ fontSize: 11, color: "#8a9aa8" }}>{s.desc}</Typography>
          </Box>
          <Typography sx={{ fontWeight: 600, fontSize: 12, color: "#2c5364" }}>{s.score}</Typography>
        </Box>
      ))}
    </Box>
  );
}