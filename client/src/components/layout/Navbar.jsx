"use client";
import { AppBar, Toolbar, Typography, Button, Box } from "@mui/material";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const pathname = usePathname();
  const isLanding = pathname === "/" || pathname === "/landing";

  return (
    <AppBar
      position="fixed"
      elevation={0}
      sx={{
        background: isLanding ? "rgba(254,252,248,0.96)" : "#ffffff",
        backdropFilter: isLanding ? "blur(12px)" : "none",
        borderBottom: "1px solid #e8e0d6",
        boxShadow: "none",
      }}
    >
      <Toolbar sx={{ justifyContent: "space-between", px: { xs: 2, md: 4 } }}>
        <Typography
          variant="h6"
          component={Link}
          href="/"
          sx={{
            fontWeight: 700,
            letterSpacing: "-0.5px",
            textDecoration: "none",
            background: "linear-gradient(135deg, #0f2027, #2c5364)",
            backgroundClip: "text",
            WebkitBackgroundClip: "text",
            color: "transparent",
          }}
        >
          BUILDMYRIDE
        </Typography>

        <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
          {!isLanding && (
            <>
              <Button component={Link} href="/dashboard" color="inherit" sx={{ fontWeight: 500 }}>
                Dashboard
              </Button>
              <Button component={Link} href="/customize" color="inherit" sx={{ fontWeight: 500 }}>
                Customize
              </Button>
              <Button component={Link} href="/ar-view" color="inherit" sx={{ fontWeight: 500 }}>
                AR Preview
              </Button>
            </>
          )}
          <Button
            component={Link}
            href="/auth"
            variant="contained"
            sx={{
              background: "linear-gradient(135deg, #0f2027, #2c5364)",
              px: 3,
              fontWeight: 500,
              "&:hover": { opacity: 0.9 },
            }}
          >
            Get Started
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
}