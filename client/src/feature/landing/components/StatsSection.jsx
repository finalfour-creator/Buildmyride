"use client";
import { Box, Container, Grid, Typography } from "@mui/material";

const stats = [
  { value: "12+", label: "Car Models" },
  { value: "50+", label: "Custom Parts" },
  { value: "1000+", label: "Active Users" },
  { value: "24/7", label: "Access" },
];

export default function StatsSection() {
  return (
    <Box sx={{ py: 8, background: "#fefcf8", borderBottom: "1px solid #e8e0d6" }}>
      <Container maxWidth="lg">
        <Grid 
          container 
          spacing={4} 
          justifyContent="center" 
          alignItems="center"
        >
          {stats.map((stat, i) => (
            <Grid item xs={6} md={3} key={i} sx={{ textAlign: "center" }}>
              <Typography 
                variant="h2" 
                sx={{ 
                  fontSize: { xs: 36, md: 44 }, 
                  fontWeight: 700, 
                  color: "#2c5364",
                  mb: 1
                }}
              >
                {stat.value}
              </Typography>
              <Typography 
                variant="body2" 
                sx={{ 
                  fontSize: 14, 
                  color: "#6b7c88", 
                  letterSpacing: "0.5px", 
                  textTransform: "uppercase",
                  fontWeight: 500
                }}
              >
                {stat.label}
              </Typography>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
}