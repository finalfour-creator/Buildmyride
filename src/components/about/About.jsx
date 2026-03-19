'use client';

import React from "react";
import { motion } from "framer-motion";
import { Container, Grid, Card, CardContent, CardMedia, Typography } from "@mui/material";
import Image from "next/image";


const glassCardSx = {
  background: "#36393b",
  color: "#fff",
  boxShadow: "0 8px 32px rgba(0,0,0,0.18)",
  borderRadius: 0, // sharp edges
  border: "none",
  transition: "transform 0.2s, box-shadow 0.2s",
  overflow: "hidden",
  minHeight: 320,
};

const cardData = [
  { title: "Easy Customization", desc: "Personalize every detail from colors to engines with ease.", img: "/images/road.jpg" },
  { title: "Premium Quality", desc: "High-end parts sourced from trusted manufacturers worldwide.", img: "/images/HondaCivic.png" },
  { title: "Fast Delivery", desc: "Get your custom ride delivered in record time anywhere.", img: "/images/road-view.jpg" },
  { title: "Smooth Seat System", desc: "Mit den eleganten Cover-Elementen aus Aluminium lassen sich ganz neue, einzigartige Farb- und Materialkombinationen über alle Zargenhöhen erzielen.", img: "/images/inside-view.jpg" },
  { title: "Wheels Perfection", desc: "Experience unmatched grip and style with our premium wheel options for every terrain.", img: "/images/wheels.jpg" }
];

export default function About() {
  return (
    <Container id="about" maxWidth={false} sx={{ py: 12, width: "100%", display: "flex", flexDirection: "column", alignItems: "center" }}>
      <Typography variant="h2" sx={{ textAlign: "center", fontWeight: "bold", mb: 10, color: "#fff", letterSpacing: 1, background: "none" }}>
        Why Choose BuildMyRide?
      </Typography>
      <Grid container direction="column" alignItems="center" spacing={6} sx={{ width: { xs: "100%", sm: "90%", md: "80%", lg: "80%" } }}>
        {cardData.map((card, index) => (
          <Grid item xs={12} key={card.title} sx={{ width: "100%" }}>
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.18 }}
              whileHover={{ scale: 1.02, y: -4 }}
            >
              <Card sx={{
                ...glassCardSx,
                my: 2,
                display: "flex",
                flexDirection: { xs: "column", sm: "row" },
                alignItems: "stretch",
                justifyContent: "flex-start",
                p: 0,
                minHeight: { xs: 220, sm: 260, md: 280, lg: 320 },
                width: "100%",
                maxWidth: "100%",
                boxShadow: "0 8px 32px rgba(0,0,0,0.18)",
                borderRadius: 0,
                "&:hover": { boxShadow: "0 12px 36px rgba(30,58,138,0.18)", transform: "translateY(-4px) scale(1.02)" }
              }}>
                <CardMedia
                  component="img"
                  image={card.img}
                  alt={card.title}
                  sx={{
                    width: { xs: "100%", sm: 320, md: 340, lg: 380 },
                    height: { xs: 180, sm: "100%" },
                    objectFit: "cover",
                    filter: "brightness(0.98) saturate(1.1)",
                    borderRadius: 0,
                    flexShrink: 0,
                  }}
                />
                <CardContent sx={{ flex: 1, p: { xs: 3, sm: 4 }, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "flex-start", background: "#232425" }}>
                  <Typography variant="h4" sx={{ fontWeight: "bold", mb: 2, color: "#fff", lineHeight: 1.1, letterSpacing: 0.5 }}>
                    {card.title}
                  </Typography>
                  <Typography variant="body1" sx={{ color: "#e0e0e0", fontSize: { xs: 15, sm: 16 }, fontWeight: 400, mt: 1 }}>
                    {card.desc}
                  </Typography>
                  {card.title === "Smooth Seat System" && (
                    <Typography variant="body2" sx={{ color: "#ffb300", mt: 2, fontWeight: 500, cursor: "pointer" }}>
                      More detail +
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
}

