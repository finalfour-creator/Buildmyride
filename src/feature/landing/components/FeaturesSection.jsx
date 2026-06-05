"use client";
import { Box, Container, Typography, Card, CardContent } from "@mui/material";
import { motion } from "framer-motion";

const features = [
  {
    title: "3D Vehicle Customization",
    description: "Modify body parts, paint colors, wheels, and accessories in real-time 3D environment.",
    image: "/images/1.jpg",
    specs: ["Real-time Rendering", "360° View", "Part Swapping"],
  },
  {
    title: "AR Preview",
    description: "Visualize modifications on your actual vehicle using your device camera.",
    image: "/images/2.jpg",
    specs: ["Live Camera View", "Overlay Technology", "Real-time Preview"],
  },
  {
    title: "AI Design Assistant",
    description: "Get intelligent suggestions for color combinations and part compatibility.",
    image: "/images/4.jpg",
    specs: ["Smart Recommendations", "Compatibility Check", "Style Guidance"],
  },
  {
    title: "Save & Share Designs",
    description: "Store your custom configurations and share them with the community.",
    image: "/images/3.avif",
    specs: ["Cloud Storage", "Easy Sharing", "Version History"],
  },
];

export default function FeaturesSection() {
  return (
    <Box sx={{ py: { xs: 6, md: 10 }, background: "#fefcf8" }}>
      <Container maxWidth={false} sx={{ px: { xs: 2, sm: 4, md: 6, lg: 8 } }}>
        <Box sx={{ textAlign: "center", mb: { xs: 4, md: 6 } }}>
          <Box sx={{ width: 50, height: 2, bgcolor: "#2c5364", mx: "auto", mb: 2 }} />
          <Typography 
            variant="h2" 
            sx={{ 
              fontSize: { xs: 28, sm: 36, md: 40 }, 
              fontWeight: 500, 
              color: "#1a2a32" 
            }}
          >
            Designed for Excellence
          </Typography>
          <Typography 
            variant="body1" 
            sx={{ 
              fontSize: { xs: 14, md: 16 }, 
              color: "#6b7c88", 
              mt: 2, 
              maxWidth: 500, 
              mx: "auto" 
            }}
          >
            Powerful tools for automotive enthusiasts
          </Typography>
        </Box>

        {/* Single column layout - all cards stacked vertically */}
        <Box sx={{ display: "flex", flexDirection: "column", gap: { xs: 3, md: 4 } }}>
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.6 }}
              viewport={{ once: true }}
              style={{ width: "100%" }}
            >
              <Card
                sx={{
                  display: "flex",
                  flexDirection: { xs: "column", md: index % 2 === 0 ? "row" : "row-reverse" },
                  overflow: "hidden",
                  transition: "transform 0.2s, box-shadow 0.2s",
                  width: "100%",
                  height: { xs: "auto", md: 280 },
                  "&:hover": { 
                    transform: "scale(1.01)", 
                    boxShadow: "0 20px 40px rgba(44,83,100,0.08)" 
                  },
                }}
              >
                <Box
                  component="img"
                  src={feature.image}
                  alt={feature.title}
                  sx={{
                    width: { xs: "100%", md: "45%" },
                    height: { xs: 200, md: 280 },
                    objectFit: "cover",
                  }}
                />
                <CardContent
                  sx={{
                    width: { xs: "100%", md: "55%" },
                    p: { xs: 3, md: 4 },
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                  }}
                >
                  <Box sx={{ width: 40, height: 2, bgcolor: "#2c5364", mb: 2 }} />
                  <Typography 
                    variant="h4" 
                    sx={{ 
                      fontSize: { xs: 20, md: 24 }, 
                      fontWeight: 500, 
                      color: "#1a2a32", 
                      mb: 1.5 
                    }}
                  >
                    {feature.title}
                  </Typography>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      fontSize: { xs: 13, md: 14 }, 
                      color: "#6b7c88", 
                      mb: 2, 
                      lineHeight: 1.5 
                    }}
                  >
                    {feature.description}
                  </Typography>
                  <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap" }}>
                    {feature.specs.map((spec, i) => (
                      <Box
                        key={i}
                        sx={{
                          px: { xs: 1.5, md: 2 },
                          py: 0.5,
                          bgcolor: "#f5f0ea",
                          fontSize: { xs: 10, md: 11 },
                          color: "#2c5364",
                          fontWeight: 500,
                        }}
                      >
                        {spec}
                      </Box>
                    ))}
                  </Box>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </Box>
      </Container>
    </Box>
  );
}

