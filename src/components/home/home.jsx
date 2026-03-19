'use client';

import React from "react";
import { motion } from "framer-motion";
import { Box, Typography, Button, Container } from "@mui/material";

import Scene from "../scene/Scene";

const glassSx = {
  backgroundColor: "rgba(255,255,255,0.1)",
  backdropFilter: "blur(20px)",
  border: "1px solid rgba(255,255,255,0.2)",
  boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
  borderRadius: 3
};

const navyGlassSx = {
  background: "linear-gradient(145deg, #0f172a, #1e3a8a)",
  backdropFilter: "blur(10px)",
  border: "1px solid rgba(255,255,255,0.2)",
  color: "white"
};

export default function Home() {
  return (
    <Container maxWidth="lg" sx={{ pt: 12, minHeight: "100vh", display: "flex", alignItems: "center", gap: 4 }}>
      <motion.div initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} sx={{ flex: 1 }}>
        <Typography variant="h1" sx={{ fontSize: { xs: "3rem", md: "5rem" }, fontWeight: "bold", background: "linear-gradient(to right, #1e3a8a, #0f172a)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", mb: 3 }}>
          Build Your Dream Ride
        </Typography>
        <Typography variant="h5" sx={{ color: "grey.600", mb: 4, lineHeight: 1.6 }}>
          Customize and build your perfect car with premium parts and stunning designs. Your ride, your way.
        </Typography>
        <Button variant="contained" size="large" sx={{ ...navyGlassSx, px: 4, py: 1.5, fontSize: "1.1rem", borderRadius: 50 }}>
          Explore Cars
        </Button>
      </motion.div>
      <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} sx={{ flex: 1 }}>
        <Box sx={{ position: "relative", width: 500, height: 350, mx: "auto" }}>
          <Scene />
        </Box>
      </motion.div>
    </Container>
  );
}

