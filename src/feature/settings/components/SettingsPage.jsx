"use client";
import { useState } from "react";
import { Box, Typography, Alert } from "@mui/material";
import ProfileSettings from "./ProfileSettings";
import PasswordSettings from "./PasswordSettings";
import DangerZone from "./DangerZone";

export default function SettingsPage() {
  // { text, severity } so failures no longer render as a green "success" banner.
  const [message, setMessage] = useState(null);

  const showMessage = (text, severity = "success") => {
    setMessage({ text, severity });
    setTimeout(() => setMessage(null), 4000);
  };

  return (
    <Box
      sx={{
        maxWidth: 720,
        mx: "auto",
        width: "100%",
        px: { xs: 2, sm: 0 },
        py: { xs: 2, sm: 1 },
      }}
    >
      {/* Header — left aligned for scannability */}
      <Box sx={{ mb: 4 }}>
        <Typography
          variant="h4"
          sx={{
            fontWeight: 700,
            background: "linear-gradient(135deg, #0f2027, #2c5364)",
            backgroundClip: "text",
            WebkitBackgroundClip: "text",
            color: "transparent",
            mb: 0.5,
          }}
        >
          Settings
        </Typography>
        <Typography variant="body2" sx={{ color: "#6b7c88" }}>
          Manage your account, security, and personal information
        </Typography>
      </Box>

      {/* Status message — severity-aware */}
      {message && (
        <Alert
          severity={message.severity}
          onClose={() => setMessage(null)}
          sx={{ mb: 3, borderRadius: 2 }}
        >
          {message.text}
        </Alert>
      )}

      {/* Sections ordered by frequency, with destructive actions last */}
      <ProfileSettings showMessage={showMessage} />
      <PasswordSettings showMessage={showMessage} />
      <DangerZone showMessage={showMessage} />
    </Box>
  );
}
