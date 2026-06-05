import { Box, Typography } from "@mui/material";

export default function ActivityList({ activities }) {
  return (
    <Box>
      {activities.map((activity, i) => (
        <Box key={i} sx={{ display: "flex", alignItems: "flex-start", gap: 1.5, py: 1.5, borderBottom: "1px solid #f0ece4" }}>
          <Box sx={{ width: 8, height: 8, mt: 0.5, background: activity.color, flexShrink: 0 }} />
          <Box sx={{ flex: 1 }}>
            <Typography sx={{ fontSize: 12, color: "#1a2a32" }}>{activity.text}</Typography>
            <Typography sx={{ fontSize: 10, color: "#8a9aa8", mt: 0.5 }}>{activity.time}</Typography>
          </Box>
        </Box>
      ))}
    </Box>
  );
}