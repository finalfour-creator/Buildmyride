import { Box, Container, Typography, Button } from "@mui/material";
import Link from "next/link";

export default function CTASection() {
  return (
    <Box sx={{ py: 12, background: "#f5f0ea", textAlign: "center" }}>
      <Container maxWidth="md">
        <Box sx={{ width: 50, height: 2, bgcolor: "#2c5364", mx: "auto", mb: 3 }} />
        <Typography variant="h2" sx={{ fontSize: 36, fontWeight: 500, color: "#1a2a32", mb: 2 }}>
          Start Your Build Today
        </Typography>
        <Typography variant="body1" sx={{ fontSize: 16, color: "#6b7c88", mb: 4, maxWidth: 500, mx: "auto" }}>
          Join the community and create your custom vehicle design
        </Typography>
        <Button
          component={Link}
          href="/login"
          variant="contained"
          size="large"
          sx={{
            background: "linear-gradient(135deg, #0f2027, #2c5364)",
            px: 6,
            py: 1.5,
            fontSize: 14,
            fontWeight: 500,
            "&:hover": { opacity: 0.9 },
          }}
        >
          Get Started
        </Button>
      </Container>
    </Box>
  );
}