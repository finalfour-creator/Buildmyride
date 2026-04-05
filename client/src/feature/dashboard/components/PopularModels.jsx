import { Box, Typography } from "@mui/material";

export default function PopularModels({ models }) {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
      {models.map((model) => (
        <Box key={model.name} sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Typography sx={{ width: 110, fontSize: 12, color: "#1a2a32", fontWeight: 500 }}>{model.name}</Typography>
          <Box sx={{ flex: 1, display: "flex", alignItems: "center", gap: 1 }}>
            <Box sx={{ flex: 1, height: 4, background: "#e8e0d6" }}>
              <Box sx={{ width: `${model.pct}%`, height: "100%", background: model.color }} />
            </Box>
            <Typography sx={{ fontSize: 11, fontWeight: 500, width: 35 }}>{model.pct}%</Typography>
          </Box>
        </Box>
      ))}
    </Box>
  );
}