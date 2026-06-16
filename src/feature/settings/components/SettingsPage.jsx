"use client";
import { useState } from "react";
import { Box, Typography, Alert, Button } from "@mui/material";
import { signOut } from "next-auth/react";
import PasswordSettings from "./PasswordSettings";
import DangerZone from "./DangerZone";

export default function SettingsPage() {
  const [updateMessage, setUpdateMessage] = useState("");

  const showMessage = (message) => {
    setUpdateMessage(message);
    setTimeout(() => setUpdateMessage(""), 3000);
  };

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/login" });
  };

  return (
    <Box
      sx={{
        maxWidth: 1100,
        margin: "0 auto",
        display: "flex",
        flexDirection: "column",
        minHeight: "100%",
        px: { xs: 2, md: 4 },
        pt: 0,
        pb: 4,
      }}
    >
      {/* Header */}
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 3 }}>
        <Box>
          <Typography
            variant="h4"
            sx={{ fontWeight: 700, color: "#2c5364", fontSize: { xs: 22, md: 26 }, letterSpacing: "-0.02em", mb: 0.4 }}
          >
            Settings
          </Typography>
          <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.3)", fontSize: 13 }}>
            Manage your account preferences and security
          </Typography>
        </Box>

        <Button
          onClick={handleLogout}
          variant="outlined"
          sx={{
            color: "#f87171",
            borderColor: "rgba(220,38,38,0.3)",
            borderRadius: "8px",
            textTransform: "none",
            fontSize: 13,
            fontWeight: 600,
            px: 2.5,
            py: 0.9,
            "&:hover": { borderColor: "#dc2626", background: "rgba(220,38,38,0.08)" },
          }}
        >
          Sign Out
        </Button>
      </Box>

      {/* Update Message */}
      {updateMessage && (
        <Alert
          severity="success"
          sx={{
            mb: 3,
            borderRadius: "10px",
            background: "rgba(34,197,94,0.1)",
            border: "1px solid rgba(34,197,94,0.2)",
            color: "#4ade80",
            "& .MuiAlert-icon": { color: "#4ade80" },
          }}
        >
          {updateMessage}
        </Alert>
      )}

      {/* Password — full width now that Profile is removed */}
      <Box sx={{ mb: 3 }}>
        <PasswordSettings showMessage={showMessage} />
      </Box>

      <DangerZone showMessage={showMessage} />
    </Box>
  );
}
