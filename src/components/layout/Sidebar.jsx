"use client";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import apiClient from '@/lib/axios';
import { useSession, signOut } from 'next-auth/react';
import { Box, Menu, MenuItem, Avatar, Typography } from '@mui/material';

const mainNav = [
  { href: '/dashboard', label: 'Dashboard', icon: '⊞' },
  { href: '/configurator/designs', label: 'My Designs', badge: '7', icon: '🗂' },
  { href: '/configurator/customization', label: '3D Studio', icon: '🚗' },
  { href: '/ar-view', label: 'AR Preview', icon: '📷' },
];

const supportNav = [
  { href: '/settings', label: 'Support', icon: '💬' }
];

function NavItem({ href, icon, label, badge, isActive }) {
  return (
    <Link href={href} style={{
      display: "flex",
      alignItems: "center",
      gap: "14px",
      padding: "12px 18px",
      textDecoration: "none",
      fontSize: 13,
      fontWeight: 600,
      color: isActive ? "#00f2fe" : "#a1b5c2",
      background: isActive ? "linear-gradient(90deg, rgba(0, 242, 254, 0.08) 0%, rgba(0, 0, 0, 0) 100%)" : "transparent",
      borderRadius: "6px",
      borderLeft: isActive ? "3px solid #00f2fe" : "3px solid transparent",
      boxShadow: isActive ? "inset 5px 0 10px rgba(0, 242, 254, 0.03)" : "none",
      transition: "all 0.3s ease",
      textShadow: isActive ? "0 0 10px rgba(0, 242, 254, 0.3)" : "none",
    }}>
      <span style={{ 
        fontSize: 18, 
        color: isActive ? "#00f2fe" : "#5d7585",
        filter: isActive ? "drop-shadow(0 0 5px rgba(0,242,254,0.5))" : "none",
        transition: "all 0.3s ease"
      }}>
        {icon}
      </span>
      <span>{label}</span>
      {badge && (
        <span style={{ 
          marginLeft: "auto", 
          background: "#2c5364", 
          padding: "2px 8px", 
          fontSize: 10, 
          borderRadius: 12, 
          color: "white",
          fontWeight: 700
        }}>
          {badge}
        </span>
      )}
    </Link>
  );
}

export default function Sidebar() {
  const pathname = usePathname();
  const [designCount, setDesignCount] = useState(0);
  const { data: session, status } = useSession();
  const [anchorEl, setAnchorEl] = useState(null);
  const openMenu = Boolean(anchorEl);

  useEffect(() => {
    if (status !== "authenticated") return;
    const refresh = () => {
      apiClient.get("/designs").then(res => {
        const data = Array.isArray(res.data)
          ? res.data
          : res.data?.designs ?? res.data?.data ?? [];
        setDesignCount(data.length);
      }).catch(err => console.error("Sidebar count fetch failed", err));
    };
    refresh();
    // Re-fetch count whenever the user returns to the tab, so saves in the studio are reflected
    window.addEventListener("focus", refresh);
    return () => window.removeEventListener("focus", refresh);
  }, [status]);

  const handleProfileClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    handleClose();
    await signOut({ callbackUrl: '/login' });
  };

  return (
    <aside style={{
      width: "260px",
      position: "fixed",
      left: 0,
      top: 0,
      bottom: 0,
      display: "flex",
      flexDirection: "column",
      background: "#081318",
      borderRight: "1px solid rgba(44, 83, 100, 0.35)",
      zIndex: 100,
      padding: "24px 16px",
    }}>
      {/* Brand Header */}
      <div style={{ padding: "10px 14px 30px 14px", display: "flex", alignItems: "center" }}>
        <Typography sx={{ 
          fontSize: "1.1rem", 
          fontWeight: 800, 
          letterSpacing: "1.5px", 
          color: "#fff",
          background: "linear-gradient(90deg, #fff 0%, #00f2fe 100%)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
        }}>
          BUILDMYRIDE
        </Typography>
      </div>

      {/* Top Profile (Mockup Style) */}
      <Box 
        onClick={handleProfileClick}
        sx={{ 
          display: "flex", 
          alignItems: "center", 
          gap: "14px", 
          px: 1.5,
          py: 1,
          mb: 4, 
          borderRadius: "6px",
          cursor: "pointer",
          transition: "all 0.2s",
          "&:hover": { background: "rgba(255, 255, 255, 0.05)" }
        }}
      >
        <Avatar sx={{ bgcolor: "#2c5364", width: 28, height: 28, fontSize: 13, fontWeight: 700 }}>
          {session?.user?.name?.[0] || "A"}
        </Avatar>
        <Typography sx={{ color: "#a1b5c2", fontSize: 13, fontWeight: 600 }}>
          Profile
        </Typography>
      </Box>

      {/* Main Navigation */}
      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
        {mainNav.map((item) => {
          const isActive = pathname === item.href;
          return (
            <NavItem
              key={item.href}
              {...item}
              isActive={isActive}
              badge={item.label === 'My Designs' ? designCount.toString() : null}
            />
          );
        })}
      </div>

      <div style={{ flex: 1 }} />

      {/* Bottom Section */}
      <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "20px" }}>
        {/* Support Link */}
        {supportNav.map((item) => (
          <NavItem
            key={item.href}
            {...item}
            isActive={pathname === item.href}
          />
        ))}

        {/* Profile (Bottom) & Diagnostic Summary */}
        <Box 
          onClick={handleProfileClick}
          sx={{ 
            display: "flex", 
            alignItems: "center", 
            gap: "14px", 
            px: 1.5, 
            py: 1, 
            borderRadius: "6px",
            cursor: "pointer",
            transition: "all 0.2s",
            "&:hover": { background: "rgba(255,255,255,0.05)" }
          }}
        >
          <Avatar sx={{ bgcolor: "rgba(91, 74, 253, 0.35)", color: "#b388ff", width: 28, height: 28, fontSize: 13 }}>
            👤
          </Avatar>
          <Typography sx={{ color: "#a1b5c2", fontSize: 13, fontWeight: 600 }}>
            {session?.user?.name || "User Profile"}
          </Typography>
        </Box>

        {/* Diagnostic Summary pill */}
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: "14px",
          padding: "10px 14px",
          background: "rgba(255, 126, 0, 0.1)",
          borderRadius: "30px",
          border: "1px solid rgba(255, 126, 0, 0.2)",
          cursor: "pointer",
          transition: "all 0.2s"
        }}>
          <span style={{ fontSize: 14, color: "#ff7e00" }}>⚠️</span>
          <span style={{ fontSize: 12, fontWeight: 600, color: "#e2e8f0" }}>Diagnostics</span>
          <span style={{ 
            marginLeft: "auto", 
            background: "#ff7e00", 
            padding: "2px 8px", 
            fontSize: 10, 
            borderRadius: 12, 
            color: "black",
            fontWeight: 800
          }}>
            2
          </span>
        </div>
      </div>

      {/* Profile Dropdown Menu */}
      <Menu
        anchorEl={anchorEl}
        open={openMenu}
        onClose={handleClose}
        transformOrigin={{ horizontal: "left", vertical: "bottom" }}
        anchorOrigin={{ horizontal: "left", vertical: "top" }}
        PaperProps={{
          sx: {
            background: "#081318",
            border: "1px solid rgba(44, 83, 100, 0.5)",
            color: "#fff",
            mt: -1,
            "& .MuiMenuItem-root": {
              fontSize: 13,
              py: 1,
              px: 2,
              "&:hover": { background: "rgba(255,255,255,0.05)" }
            }
          }
        }}
      >
        <MenuItem onClick={handleClose} component={Link} href="/profile">Profile</MenuItem>
        <MenuItem onClick={handleClose} component={Link} href="/settings">Settings</MenuItem>
        <MenuItem onClick={handleLogout}>Logout</MenuItem>
      </Menu>
    </aside>
  );
}