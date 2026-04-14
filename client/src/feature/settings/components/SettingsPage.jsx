"use client";
import { useState } from "react";
import { Box, Typography, Alert } from "@mui/material";
import ProfileSettings from "./ProfileSettings";
import PasswordSettings from "./PasswordSettings";
import PreferencesSettings from "./PreferencesSettings";
import DangerZone from "./DangerZone";

export default function SettingsPage() {
  const [updateMessage, setUpdateMessage] = useState("");

  const showMessage = (message) => {
    setUpdateMessage(message);
    setTimeout(() => setUpdateMessage(""), 3000);
  };

  return (
    <Box
      sx={{
        maxWidth: 700,
        margin: "0 auto",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        minHeight: "100%",
      }}
    >
      {/* Header */}
      <Box sx={{ textAlign: "center", mb: 4 }}>
        <Typography
          variant="h4"
          sx={{
            fontWeight: 700,
            background: "linear-gradient(135deg, #0f2027, #2c5364)",
            backgroundClip: "text",
            WebkitBackgroundClip: "text",
            color: "transparent",
            mb: 1,
          }}
        >
          Settings
        </Typography>
        <Typography variant="body2" sx={{ color: "#6b7c88" }}>
          Manage your account preferences
        </Typography>
      </Box>

      {/* Update Message */}
      {updateMessage && (
        <Alert severity="success" sx={{ mb: 3, borderRadius: 2, width: "100%" }}>
          {updateMessage}
        </Alert>
      )}

      {/* Settings Sections */}
      <ProfileSettings showMessage={showMessage} />
      <PasswordSettings showMessage={showMessage} />
      <PreferencesSettings showMessage={showMessage} />
      <DangerZone showMessage={showMessage} />
    </Box>
  );
}