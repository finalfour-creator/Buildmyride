'use client';

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { AppBar, Toolbar, Typography, Button, Box } from "@mui/material";
import { LogIn, UserPlus } from "lucide-react";

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


export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <motion.div initial={{ y: -100 }} animate={{ y: 0 }}>
      <AppBar
        position="fixed"
        sx={{
          backgroundColor: scrolled ? "rgba(93, 90, 90, 0.8)" : "rgba(255,255,255,0.3)",
          boxShadow: scrolled ? 4 : 1,
          transition: "all 0.3s",
          width: "100%",
          left: 0,
          right: 0,
          px: { xs: 0, md: 6 },
        }}
      >
        <Toolbar
          sx={{
            minHeight: { xs: 64, md: 90 },
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            width: "100%",
            px: { xs: 1, md: 0 },
          }}
        >
          {/* Main container for nav sections */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              width: "100%",
              maxWidth: 1500,
              mx: "auto",
              gap: { xs: 1, md: 4 },
            }}
          >
            {/* Left: Logo */}
            <Typography
              variant="h4"
              sx={{
                fontWeight: "bold",
                background: "linear-gradient(to right, #484e5f, #3b82f6)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                letterSpacing: 2,
                px: 2,
              }}
            >
              BUILDMYRIDE
            </Typography>

            {/* Center: Nav links with glass effect */}
            <Box
              sx={{
                flex: 1,
                display: { xs: "none", md: "flex" },
                justifyContent: "center",
                alignItems: "center",
                gap: 4,
                py: 1.5,
                px: 4,
                borderRadius: 6,
                ...glassSx,
                boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
                border: "1.5px solid rgba(255,255,255,0.25)",
                minWidth: 350,
                maxWidth: 600,
                mx: 2,
              }}
            >
              {["Home", "About", "Contact", "Explore"].map((item) => (
                <Typography
                  key={item}
                  component="a"
                  href={`#${item.toLowerCase()}`}
                  sx={{
                    color: "common.black",
                    fontWeight: 500,
                    cursor: "pointer",
                    fontSize: 18,
                    px: 1.5,
                    py: 0.5,
                    borderRadius: 2,
                    transition: "all 0.2s",
                    "&:hover": {
                      transform: "scale(1.1) translateY(-2px)",
                      background: "rgba(106, 95, 95, 0.3)",
                      boxShadow: "0 2px 8px rgba(30,58,138,0.08)",
                    },
                  }}
                >
                  {item}
                </Typography>
              ))}
            </Box>

            {/* Right: Login/Sigssnup with glass effect */}
            <Box
              sx={{
                display: "flex",
                gap: 2,
                alignItems: "center",
                px: 2,
                py: 1.5,
                borderRadius: 6,
                ...glassSx,
                boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
                border: "1.5px solid rgba(255,255,255,0.25)",
                minWidth: 220,
                justifyContent: "flex-end",
              }}
            >
              <Button
                sx={{
                  background: "rgba(255,255,255,0.25)",
                  color: "#1e293b",
                  borderRadius: 50,
                  px: 3,
                  fontWeight: 600,
                  boxShadow: "none",
                  transition: "all 0.2s",
                  "&:hover": {
                    background: "rgba(255,255,255,0.4)",
                    boxShadow: "0 2px 8px rgba(30,58,138,0.08)",
                  },
                }}
                startIcon={<LogIn size={20} />}
              >
                Login
              </Button>
              <Button
                sx={{
                  ...navyGlassSx,
                  borderRadius: 50,
                  px: 3,
                  fontWeight: 600,
                  boxShadow: 4,
                  transition: "all 0.2s",
                  "&:hover": { boxShadow: 8 },
                }}
                startIcon={<UserPlus size={20} />}
              >
                Sign Up
              </Button>
            </Box>
          </Box>
        </Toolbar>
      </AppBar>
    </motion.div>
  );
}

