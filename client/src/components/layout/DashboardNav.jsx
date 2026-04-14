"use client";
import { AppBar, Toolbar, Typography, IconButton, Avatar, Menu, MenuItem, Button, Box } from "@mui/material";
import Link from "next/link";
import { useState } from "react";

export default function Navbar() {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    // Add logout logic here
    console.log("Logout clicked");
    handleClose();
  };

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
          {/* New Design Button */}
          <Button
            component={Link}
            href="/customize"
            sx={{
              color: "#e2e8f0",
              fontWeight: 500,
              "&:hover": { color: "#ffffff" },
            }}
          >
            New Design
          </Button>

          <Button
                onClick={() => {
                  console.log("Logout clicked");
                  // 👉 later you can add real logout logic here
                }}
                sx={{
                  color: "#dc2626",
                  fontWeight: 500,
                  "&:hover": {
                    backgroundColor: "rgba(220,38,38,0.08)",
                  },
                }}
              >
                Logout
              </Button>

          {/* Profile Avatar with Dropdown */}
          <IconButton onClick={handleClick} sx={{ p: 0 }}>
            <Avatar sx={{ bgcolor: "#2c5364", width: 36, height: 36 }}>X</Avatar>
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            open={open}
            onClose={handleClose}
            transformOrigin={{ horizontal: "right", vertical: "top" }}
            anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
          >
            <MenuItem onClick={handleClose} component={Link} href="/profile">Profile</MenuItem>
            <MenuItem onClick={handleLogout}>Logout</MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
}