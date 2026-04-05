import { Box, Container, Typography, Grid } from "@mui/material";

export default function Footer() {
  return (
    <Box
      component="footer"
      sx={{
        bgcolor: "#111",
        color: "#8a9aa8",
        py: 6,
        borderTop: "1px solid #222",
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4} justifyContent="space-between">
          <Grid item xs={12} sm={4}>
            <Typography variant="h6" sx={{ color: "#fff", mb: 2, fontWeight: 500 }}>
              BUILDMYRIDE
            </Typography>
            <Typography variant="body2" sx={{ maxWidth: 260 }}>
              Pakistan's first car customization platform
            </Typography>
          </Grid>
          <Grid item xs={6} sm={2}>
            <Typography variant="subtitle2" sx={{ color: "#fff", mb: 2, fontWeight: 500 }}>
              Product
            </Typography>
            <Typography variant="body2" sx={{ mb: 1 }}>3D Customization</Typography>
            <Typography variant="body2" sx={{ mb: 1 }}>AR Preview</Typography>
            <Typography variant="body2">AI Assistant</Typography>
          </Grid>
          <Grid item xs={6} sm={2}>
            <Typography variant="subtitle2" sx={{ color: "#fff", mb: 2, fontWeight: 500 }}>
              Company
            </Typography>
            <Typography variant="body2" sx={{ mb: 1 }}>About</Typography>
            <Typography variant="body2" sx={{ mb: 1 }}>Contact</Typography>
            <Typography variant="body2">FAQs</Typography>
          </Grid>
          <Grid item xs={6} sm={2}>
            <Typography variant="subtitle2" sx={{ color: "#fff", mb: 2, fontWeight: 500 }}>
              Legal
            </Typography>
            <Typography variant="body2" sx={{ mb: 1 }}>Privacy</Typography>
            <Typography variant="body2">Terms</Typography>
          </Grid>
        </Grid>
        <Typography variant="caption" sx={{ display: "block", textAlign: "center", mt: 6, pt: 3, borderTop: "1px solid #222" }}>
          © 2024 BUILDMYRIDE. All rights reserved.
        </Typography>
      </Container>
    </Box>
  );
}