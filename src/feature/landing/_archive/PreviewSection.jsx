"use client";
import { Box, Container, Typography, Grid } from "@mui/material";

const previewItems = [
  { label: "Color Selection", description: "Choose from premium finishes" },
  { label: "Part Swapping", description: "Mix and match components" },
  { label: "Live Preview", description: "See changes instantly" },
];

export default function PreviewSection() {
  return (
    <Box sx={{ py: 10, background: "#fefcf8" }}>
      <Container maxWidth="lg">
        <Box sx={{ textAlign: "center", mb: 5 }}>
          <Box sx={{ width: 50, height: 2, bgcolor: "#2c5364", mx: "auto", mb: 2 }} />
          <Typography variant="h2" sx={{ fontSize: 36, fontWeight: 500, color: "#1a2a32" }}>
            Experience in Real-Time
          </Typography>
          <Typography variant="body1" sx={{ fontSize: 16, color: "#6b7c88", mt: 2, maxWidth: 550, mx: "auto" }}>
            Interactive 3D visualization with real-time feedback
          </Typography>
        </Box>

        <Grid container spacing={0} justifyContent="center">
          {previewItems.map((item, i) => (
            <Grid item xs={12} md={4} key={i}>
              <Box 
                sx={{ 
                  background: "#fefcf8", 
                  p: 5, 
                  textAlign: "center",
                  border: "1px solid #e8e0d6",
                  height: 220,
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                }}
              >
                <Box sx={{ width: 40, height: 2, bgcolor: "#2c5364", mx: "auto", mb: 2 }} />
                <Typography variant="h6" sx={{ fontSize: 18, fontWeight: 600, color: "#1a2a32", mb: 1 }}>
                  {item.label}
                </Typography>
                <Typography variant="body2" sx={{ fontSize: 13, color: "#8a9aa8", maxWidth: 200, mx: "auto" }}>
                  {item.description}
                </Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
}