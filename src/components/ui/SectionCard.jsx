"use client";
import { Box, Paper, Typography } from "@mui/material";

/**
 * Cohesive section card used across Settings and Profile.
 * Left-aligned header with an icon chip, title, optional subtitle and action.
 * `danger` switches to a quiet red treatment for destructive sections.
 */
export default function SectionCard({
  icon,
  title,
  subtitle,
  action,
  children,
  accent = "#2c5364",
  danger = false,
  sx = {},
}) {
  return (
    <Paper
      elevation={0}
      sx={{
        border: "1px solid",
        borderColor: danger ? "#f1c9c9" : "#e6e9ec",
        borderRadius: 2,
        overflow: "hidden",
        mb: 3,
        width: "100%",
        ...sx,
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1.5,
          px: { xs: 2, sm: 3 },
          py: 2,
          borderBottom: "1px solid",
          borderColor: danger ? "#f3d4d4" : "#eef1f3",
          bgcolor: danger ? "#fdf5f5" : "#fafbfc",
        }}
      >
        {icon && (
          <Box
            sx={{
              width: 36,
              height: 36,
              borderRadius: 1.5,
              display: "grid",
              placeItems: "center",
              flexShrink: 0,
              color: danger ? "#dc2626" : accent,
              bgcolor: danger ? "rgba(220,38,38,0.10)" : "rgba(44,83,100,0.10)",
            }}
          >
            {icon}
          </Box>
        )}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography
            sx={{
              fontWeight: 600,
              fontSize: "1rem",
              lineHeight: 1.3,
              color: danger ? "#b91c1c" : "#1a2a32",
            }}
          >
            {title}
          </Typography>
          {subtitle && (
            <Typography variant="caption" sx={{ color: "#8a9aa8" }}>
              {subtitle}
            </Typography>
          )}
        </Box>
        {action}
      </Box>

      {children}
    </Paper>
  );
}
