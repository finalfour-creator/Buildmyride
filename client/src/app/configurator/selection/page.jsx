"use client";
import { useEffect, useState } from "react";
import { Box, Typography, Grid, Card, CardContent, Button, CircularProgress } from "@mui/material";
import { useRouter } from "next/navigation";
import apiClient from "@/lib/axios";

export default function CarSelectionPage() {
  const [models, setModels] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchModels = async () => {
      try {
        const res = await apiClient.get("/models");
        setModels(res.data);
      } catch (err) {
        console.error("Failed to fetch models", err);
      } finally {
        setLoading(false);
      }
    };
    fetchModels();
  }, []);

  const handleSelect = (carId) => {
    router.push(`/configurator/customization?carId=${carId}`);
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "80vh" }}>
        <CircularProgress sx={{ color: "#fff" }} />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 4, color: "#fff", maxWidth: 1200, mx: "auto" }}>
      <Typography variant="h4" sx={{ mb: 1, fontWeight: 700 }}>Choose Your Chassis</Typography>
      <Typography variant="body1" sx={{ mb: 4, color: "#ccc" }}>Select a base model to start your custom build.</Typography>

      <Grid container spacing={4}>
        {models.map((car) => (
          <Grid item xs={12} sm={6} md={4} key={car._id}>
            <Card 
              sx={{ 
                bgcolor: "rgba(255,255,255,0.05)", 
                color: "#fff", 
                border: "1px solid rgba(255,255,255,0.1)",
                transition: "transform 0.2s",
                "&:hover": { transform: "scale(1.03)", border: "1px solid #1e3a5f" }
              }}
            >
              <Box sx={{ height: 180, bgcolor: "rgba(0,0,0,0.3)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Typography variant="h6" sx={{ color: "rgba(255,255,255,0.2)" }}>{car.brand}</Typography>
              </Box>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>{car.brand} {car.name}</Typography>
                <Button 
                  fullWidth 
                  variant="contained" 
                  onClick={() => handleSelect(car._id)}
                  sx={{ mt: 2, bgcolor: "#1e3a5f", "&:hover": { bgcolor: "#2c5364" } }}
                >
                  Configure
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
