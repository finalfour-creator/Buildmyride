"use client";
import { Box, Typography, Grid, Button } from "@mui/material";
import Link from "next/link";

export default function RecentDesigns({ designs, type }) {
  if (designs.length === 0) {
    return (
      <Box sx={{ textAlign: "center", py: 8 }}>
        <Typography variant="h6" sx={{ color: "#1a2a32", mb: 1 }}>
          No designs yet
        </Typography>
        <Typography variant="body2" sx={{ color: "#8a9aa8", mb: 3 }}>
          {type === "recent" ? "Start customizing your first vehicle" : "Save designs to see them here"}
        </Typography>
        <Link href="/customize">
          <Button
            variant="contained"
            sx={{
              background: "linear-gradient(135deg, #0f2027, #2c5364)",
              borderRadius: 0,
              textTransform: "none",
              "&:hover": { opacity: 0.9 },
            }}
          >
            Create New Design
          </Button>
        </Link>
      </Box>
    );
  }

  return (
    <Grid container spacing={3}>
      {designs.map((design) => (
        <Grid item xs={12} sm={6} md={4} key={design.id}>
          <Box sx={{ background: "#ffffff", border: "1px solid #e8e0d6", overflow: "hidden" }}>
            <Box
              sx={{
                height: 160,
                background: `linear-gradient(135deg, ${design.color}, ${design.color}aa)`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                position: "relative",
              }}
            >
              <Typography variant="h1" sx={{ fontSize: 64 }}>
                {design.thumbnail}
              </Typography>
              <Box
                sx={{
                  position: "absolute",
                  top: 12,
                  right: 12,
                  background: "rgba(0,0,0,0.6)",
                  px: 1.5,
                  py: 0.5,
                  fontSize: 11,
                  color: "white",
                  fontWeight: 500,
                }}
              >
                {design.date}
              </Box>
            </Box>
            <Box sx={{ p: 2 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, color: "#1a2a32", mb: 0.5 }}>
                {design.name}
              </Typography>
              <Typography variant="caption" sx={{ color: "#8a9aa8", display: "block", mb: 2 }}>
                {design.car}
              </Typography>
              <Link href={`/customize?id=${design.id}`}>
                <Button
                  fullWidth
                  variant="outlined"
                  size="small"
                  sx={{
                    borderColor: "#e8e0d6",
                    color: "#2c5364",
                    borderRadius: 0,
                    textTransform: "none",
                    "&:hover": { borderColor: "#2c5364", backgroundColor: "rgba(44,83,100,0.05)" },
                  }}
                >
                  Edit Design
                </Button>
              </Link>
            </Box>
          </Box>
        </Grid>
      ))}
    </Grid>
  );
}