'use client';

import React from "react";
import { Container, Box, Typography } from "@mui/material";

const navyGlassSx = {
  background: "linear-gradient(145deg, #0f172a, #1e3a8a)",
  backdropFilter: "blur(10px)",
  border: "1px solid rgba(255,255,255,0.2)",
  color: "white"
};

export default function Footer() {
  return (
    <Box sx={{ ...navyGlassSx, py: 6, textAlign: "center" }}>
      <Container maxWidth="lg">
        <Typography variant="h4" sx={{ fontWeight: "bold", mb: 2 }}>
          BUILDMYRIDE
        </Typography>
        <Box sx={{ display: "flex", justifyContent: "center", gap: 4, mb: 4, flexWrap: "wrap" }}>
          <Typography sx={{ cursor: "pointer", "&:hover": { color: "grey.300" } }}>
            Home
          </Typography>
          <Typography sx={{ cursor: "pointer", "&:hover": { color: "grey.300" } }}>
            About
          </Typography>
          <Typography sx={{ cursor: "pointer", "&:hover": { color: "grey.300" } }}>
            Explore
          </Typography>
          <Typography sx={{ cursor: "pointer", "&:hover": { color: "grey.300" } }}>
            Contact
          </Typography>
        </Box>
        <Typography variant="body2">
          © 2024 BuildMyRide. All rights reserved.
        </Typography>
      </Container>
    </Box>
  );
}

