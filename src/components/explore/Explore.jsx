'use client';

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Container, Grid, Box, Typography, IconButton } from "@mui/material";

import Scene from "../scene/Scene";

const glassSx = {
  backgroundColor: "rgba(255,255,255,0.1)",
  backdropFilter: "blur(20px)",
  border: "1px solid rgba(255,255,255,0.2)",
  boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
  borderRadius: 3
};


export default function Explore() {
  const [selectedColor, setSelectedColor] = useState("default");

  // Map color id to hex color for the car
  const colorMap = {
    red: "#d32f2f",
    blue: "#2563eb",
    black: "#222831",
    default: "#e5e7eb" // light gray as default
  };

  const colors = [
    { id: "red", filter: "brightness(1.1) saturate(1.5) hue-rotate(0deg)", label: "Red" },
    { id: "blue", filter: "brightness(1.05) saturate(1.5) hue-rotate(200deg)", label: "Blue" },
    { id: "black", filter: "brightness(0.5)", label: "Black" },
    { id: "default", filter: "", label: "Default" }
  ];

  return (
    <Box id="explore" sx={{ py: 20, background: "linear-gradient(to bottom, #0f172a, #808184)", color: "white", position: "relative", overflow: "hidden" }}>
      <Container maxWidth="lg">
        <Typography variant="h2" sx={{ textAlign: "center", mb: 12 }}>
          Explore & Customize
        </Typography>
        <Grid container spacing={8} alignItems="center">
          <Grid size={{ xs: 12, lg: 6 }}>
            <Box sx={{ ...glassSx, p: 6, borderRadius: 4 }}>
              <Typography variant="h4" sx={{ textAlign: "center", mb: 6 }}>
                Change Car Color
              </Typography>
              <Grid container spacing={2} justifyContent="center">
                {colors.map((color) => (
                  <Grid size={4} key={color.id}>
                    <IconButton 
                      onClick={() => setSelectedColor(color.id)}
                      sx={{ 
                        width: 80, height: 80, borderRadius: "50%", 
                        border: selectedColor === color.id ? "4px solid white" : "4px solid rgba(255,255,255,0.3)",
                        boxShadow: selectedColor === color.id ? 8 : 4,
                        backgroundColor: color.id === "default" ? "grey.200" : "transparent",
                        filter: selectedColor === color.id ? color.filter : "none",
                        "&:hover": { transform: "scale(1.2)", boxShadow: 12 },
                        color: "white"
                      }}
                    >
                      <Typography variant="body2">{color.label}</Typography>
                    </IconButton>
                  </Grid>
                ))}
              </Grid>
            </Box>
          </Grid>
          <Grid size={{ xs: 12, lg: 6 }}>
            <motion.div 
              initial={{ scale: 0.8 }} 
              whileInView={{ scale: 1 }} 
              animate={{ rotate: selectedColor !== "default" ? 360 : 0 }}
              transition={{ duration: 1 }}
            >
              <Box sx={{ ...glassSx, mx: "auto", width: 500, height: 350, p: 4, borderRadius: 4, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Scene carColor={colorMap[selectedColor]} />
              </Box>
            </motion.div>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}

