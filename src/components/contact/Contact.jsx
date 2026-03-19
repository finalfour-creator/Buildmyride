'use client';

import React from "react";
import { Container, Grid, Box, Typography, TextField, Button } from "@mui/material";
import { Send } from "lucide-react";

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

export default function Contact() {
  return (
    <Container id="contact" maxWidth="md" sx={{ py: 20 }}>
      <Typography variant="h2" sx={{ textAlign: "center", fontWeight: "bold", mb: 12, background: "linear-gradient(to right, #1e3a8a, #111827)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
        Get In Touch
      </Typography>
      <Box sx={{ ...glassSx, p: 8, borderRadius: 4 }}>
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField fullWidth label="Name" variant="outlined" sx={{ '& .MuiOutlinedInput-root': glassSx }} />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField fullWidth label="Email" type="email" variant="outlined" sx={{ '& .MuiOutlinedInput-root': glassSx }} />
          </Grid>
          <Grid size={12}>
            <TextField fullWidth label="Message" multiline rows={5} variant="outlined" sx={{ '& .MuiOutlinedInput-root': glassSx }} />
          </Grid>
          <Grid size={12}>
            <Button 
              fullWidth 
              variant="contained" 
              sx={{ ...navyGlassSx, py: 2, borderRadius: 2, fontSize: "1.1rem" }}
            >
              Send Message
            </Button>
          </Grid>
        </Grid>
        <Box sx={{ mt: 8, pt: 4, borderTop: "1px solid rgba(255,255,255,0.3)", display: "flex", flexDirection: { xs: "column", md: "row" }, gap: 4, alignItems: "center" }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Send size={24} color="#1e3a8a" />
            <Typography>hello@buildmyride.com</Typography>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Typography sx={{ color: "#1e3a8a" }}>+1 (555) 123-4567</Typography>
          </Box>
        </Box>
      </Box>
    </Container>
  );
}

