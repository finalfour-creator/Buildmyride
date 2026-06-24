"use client";
import { Box, Container, Typography, Card, CardContent, Button } from "@mui/material";
import Link from "next/link";
import { useState } from "react";
import ThreeViewer from "@/components/ui/ThreeViewer";

export default function FeaturedModelsSection() {
  const [modelColor, setModelColor] = useState("#1e3a5f");

  const colorOptions = [
    { name: "Midnight Blue",  value: "#1e3a5f" },
    { name: "Matte Black",    value: "#2d2d2d" },
    { name: "Crimson Red",    value: "#b22222" },
    { name: "Pearl White",    value: "#f4f4f4" },
    { name: "Sunset Orange",  value: "#e67e22" },
    { name: "Forest Green",   value: "#2e5c3a" },
    { name: "Steel Gray",     value: "#6c7a89" },
    { name: "Royal Blue",     value: "#4169e1" },
  ];

  return (
    <Box sx={{ py: 10, background: "#f5f0ea", borderTop: "1px solid #e8e0d6", borderBottom: "1px solid #e8e0d6" }}>
      <Container maxWidth="lg">
        {/* Header */}
        <Box sx={{ textAlign: "center", mb: 5 }}>
          <Box sx={{ width: 50, height: 2, bgcolor: "#2c5364", mx: "auto", mb: 2 }} />
          <Typography variant="h2" sx={{ fontSize: 36, fontWeight: 500, color: "#1a2a32" }}>
            Customize Your Color
          </Typography>
          <Typography variant="body1" sx={{ fontSize: 16, color: "#6b7c88", mt: 2, maxWidth: 550, mx: "auto" }}>
            Choose any color to preview on the 3D model
          </Typography>
        </Box>

        {/* Card — two-column flex layout, no Grid needed */}
        <Card sx={{ overflow: "hidden", background: "#ffffff" }}>
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", md: "row" },
            }}
          >
            {/* Left — 3D viewer (60% on desktop) */}
            <Box sx={{ flex: { xs: "1 1 auto", md: "0 0 60%" }, height: { xs: 350, md: 500 } }}>
              <ThreeViewer
                modelPath="/models/Honda-Civic.glb"
                backgroundColor="#ffffff"
                modelColor={modelColor}
              />
            </Box>

            {/* Right — color picker (40% on desktop) */}
            <Box sx={{ flex: { xs: "1 1 auto", md: "0 0 40%" } }}>
              <CardContent
                sx={{
                  p: { xs: 3, md: 4 },
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                }}
              >
                <Typography
                  variant="h5"
                  sx={{ fontWeight: 600, color: "#1a2a32", mb: 1, fontSize: { xs: 20, md: 24 } }}
                >
                  Honda Civic 2024
                </Typography>
                <Typography variant="body2" sx={{ color: "#6b7c88", mb: 3 }}>
                  Select a color to preview on the 3D model
                </Typography>

                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2, color: "#1a2a32" }}>
                  Choose Color
                </Typography>

                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.5, mb: 4 }}>
                  {colorOptions.map((color) => (
                    <Box
                      key={color.value}
                      onClick={() => setModelColor(color.value)}
                      title={color.name}
                      sx={{
                        width: { xs: 40, md: 44 },
                        height: { xs: 40, md: 44 },
                        bgcolor: color.value,
                        border: modelColor === color.value ? "3px solid #2c5364" : "1px solid #e8e0d6",
                        cursor: "pointer",
                        transition: "transform 0.2s, border 0.2s",
                        "&:hover": { transform: "scale(1.05)" },
                      }}
                    />
                  ))}
                </Box>

                <Button
                  component={Link}
                  href="/customize"
                  variant="contained"
                  sx={{
                    background: "linear-gradient(135deg, #0f2027, #2c5364)",
                    py: 1.5,
                    "&:hover": { opacity: 0.9 },
                  }}
                >
                  Start Full Customization →
                </Button>
              </CardContent>
            </Box>
          </Box>
        </Card>
      </Container>
    </Box>
  );
}