"use client";
<<<<<<< HEAD
import { AppBar, Toolbar, Typography, Button, Box } from "@mui/material";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const pathname = usePathname();
  const isLanding = pathname === "/" || pathname === "/landing";
=======
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
>>>>>>> 73f698a (dashboard-new)

  return (
    <AppBar
      position="fixed"
      elevation={0}
      sx={{
<<<<<<< HEAD
        background: isLanding ? "rgba(254,252,248,0.96)" : "#ffffff",
        backdropFilter: isLanding ? "blur(12px)" : "none",
        borderBottom: "1px solid #e8e0d6",
        boxShadow: "none",
      }}
    >
      <Toolbar sx={{ justifyContent: "space-between", px: { xs: 2, md: 4 } }}>
=======
        background: "#0f2027",
        borderBottom: "1px solid #2c5364",
        boxShadow: "none",
        height: "70px",
      }}
    >
      <Toolbar sx={{ justifyContent: "space-between", px: { xs: 2, md: 4 }, height: "100%" }}>
>>>>>>> 73f698a (dashboard-new)
        <Typography
          variant="h6"
          component={Link}
          href="/"
          sx={{
            fontWeight: 700,
            letterSpacing: "-0.5px",
            textDecoration: "none",
<<<<<<< HEAD
            background: "linear-gradient(135deg, #0f2027, #2c5364)",
            backgroundClip: "text",
            WebkitBackgroundClip: "text",
            color: "transparent",
=======
            color: "#ffffff",
>>>>>>> 73f698a (dashboard-new)
          }}
        >
          BUILDMYRIDE
        </Typography>

        <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
<<<<<<< HEAD
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
=======
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
            <Avatar sx={{ bgcolor: "#2c5364", width: 36, height: 36 }}>M</Avatar>
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
>>>>>>> 73f698a (dashboard-new)
        </Box>
      </Toolbar>
    </AppBar>
  );
<<<<<<< HEAD
}
=======
}

>>>>>>> 73f698a (dashboard-new)
