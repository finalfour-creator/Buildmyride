"use client";
import { useState } from "react";
import { Box, Typography, Grid, Switch, FormControlLabel, Select, MenuItem, FormControl, InputLabel, Paper } from "@mui/material";

const preferenceItems = [
  { label: "Email Notifications", name: "emailNotifications", icon: "📧", color: "#2c5364" },
  { label: "Push Notifications", name: "pushNotifications", icon: "🔔", color: "#203a43" },
];

export default function PreferencesSettings({ showMessage }) {
  const [preferences, setPreferences] = useState({
    emailNotifications: true,
    pushNotifications: false,
    language: "english",
    dateFormat: "MM/DD/YYYY",
  });

  const handleToggle = (name) => (event) => {
    setPreferences({ ...preferences, [name]: event.target.checked });
    if (showMessage) showMessage(`${name} updated`);
  };

  const handleSelect = (name) => (event) => {
    setPreferences({ ...preferences, [name]: event.target.value });
    if (showMessage) showMessage(`${name} updated`);
  };

  return (
    <Paper
      sx={{
        mb: 4,
        background: "linear-gradient(135deg, #ffffff, #fafcff)",
        border: "1px solid #e8e0d6",
        boxShadow: "0 8px 20px rgba(0,0,0,0.05)",
        overflow: "hidden",
        width: "100%",
      }}
    >
      <Box
        sx={{
          background: "linear-gradient(135deg, #1e3a5f, #2c5364)",
          p: 2,
          textAlign: "center",
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 600, color: "#ffffff" }}>
          Preferences
        </Typography>
      </Box>

      <Box sx={{ p: 3 }}>
        <Grid container spacing={2}>
          {preferenceItems.map((item, index) => (
            <Grid item xs={12} key={index}>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 2,
                  p: 1.5,
                  bgcolor: index % 2 === 0 ? "#f8fafc" : "#ffffff",
                  borderRadius: 1,
                  border: "1px solid #e8e0d6",
                }}
              >
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: "50%",
                    background: `linear-gradient(135deg, ${item.color}, ${item.color}cc)`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 20,
                  }}
                >
                  {item.icon}
                </Box>
                <Box sx={{ flex: 1 }}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={preferences[item.name]}
                        onChange={handleToggle(item.name)}
                        sx={{
                          "& .MuiSwitch-switchBase.Mui-checked": { color: "#2c5364" },
                          "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": { backgroundColor: "#2c5364" },
                        }}
                      />
                    }
                    label={item.label}
                    sx={{ width: "100%", m: 0 }}
                  />
                </Box>
              </Box>
            </Grid>
          ))}

          {/* Language Selection */}
          <Grid item xs={12}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 2,
                p: 1.5,
                bgcolor: "#f8fafc",
                borderRadius: 1,
                border: "1px solid #e8e0d6",
              }}
            >
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, #2c5364, #2c5364cc)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 20,
                }}
              >
                🌐
              </Box>
              <Box sx={{ flex: 1 }}>
                <FormControl fullWidth size="small" sx={{ "& .MuiOutlinedInput-root": { borderRadius: 1 } }}>
                  <InputLabel>Language</InputLabel>
                  <Select
                    value={preferences.language}
                    onChange={handleSelect("language")}
                    label="Language"
                  >
                    <MenuItem value="english">English</MenuItem>
                    <MenuItem value="urdu">Urdu</MenuItem>
                    <MenuItem value="arabic">Arabic</MenuItem>
                  </Select>
                </FormControl>
              </Box>
            </Box>
          </Grid>

          {/* Date Format Selection */}
          <Grid item xs={12}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 2,
                p: 1.5,
                bgcolor: "#ffffff",
                borderRadius: 1,
                border: "1px solid #e8e0d6",
              }}
            >
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, #203a43, #203a43cc)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 20,
                }}
              >
                📅
              </Box>
              <Box sx={{ flex: 1 }}>
                <FormControl fullWidth size="small" sx={{ "& .MuiOutlinedInput-root": { borderRadius: 1 } }}>
                  <InputLabel>Date Format</InputLabel>
                  <Select
                    value={preferences.dateFormat}
                    onChange={handleSelect("dateFormat")}
                    label="Date Format"
                  >
                    <MenuItem value="MM/DD/YYYY">MM/DD/YYYY</MenuItem>
                    <MenuItem value="DD/MM/YYYY">DD/MM/YYYY</MenuItem>
                    <MenuItem value="YYYY-MM-DD">YYYY-MM-DD</MenuItem>
                  </Select>
                </FormControl>
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Box>
    </Paper>
  );
}