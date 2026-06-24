"use client";
import { AppBar, Toolbar, Typography, Button, Box } from "@mui/material";
import Link from "next/link";

export default function Navbar() {

  return (
    <AppBar
      position="fixed"
      elevation={0}
      sx={{
        background: "#0f2027",
        borderBottom: "1px solid #2c5364",
        boxShadow: "none",
        height: "70px",
      }}
    >
      <Toolbar sx={{ justifyContent: "space-between", px: { xs: 2, md: 4 }, height: "100%" }}>
        <Typography
          variant="h6"
          component={Link}
          href="/"
          sx={{
            fontWeight: 700,
            letterSpacing: "-0.5px",
            textDecoration: "none",
            color: "#ffffff",
          }}
        >
          BUILDMYRIDE
        </Typography>

        <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
          {/* Login Button */}
          <Button
            component={Link}
            href="/login"
            variant="outlined"
            sx={{
              color: "#e2e8f0",
              borderColor: "#2c5364",
              fontWeight: 500,
              "&:hover": { color: "#ffffff", borderColor: "#4a7c9c" },
            }}
          >
            Login
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
}

