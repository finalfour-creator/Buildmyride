"use client";
import { useState } from "react";
import { Box, Typography, Grid, TextField, Button, Paper } from "@mui/material";

const passwordItems = [
  { label: "Current Password", name: "currentPassword", icon: "🔒", color: "#2c5364", type: "password" },
  { label: "New Password", name: "newPassword", icon: "✨", color: "#203a43", type: "password" },
  { label: "Confirm New Password", name: "confirmPassword", icon: "✓", color: "#2c5364", type: "password" },
];

export default function PasswordSettings({ showMessage }) {
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: "" });
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!passwordData.currentPassword) newErrors.currentPassword = "Current password is required";
    if (!passwordData.newPassword) {
      newErrors.newPassword = "New password is required";
    } else if (passwordData.newPassword.length < 6) {
      newErrors.newPassword = "Password must be at least 6 characters";
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }
    return newErrors;
  };

  const handleSubmit = () => {
    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    console.log("Password updated:", passwordData);
    setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
    showMessage("Password updated successfully");
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
          background: "linear-gradient(135deg, #203a43, #2c5364)",
          p: 2,
          textAlign: "center",
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 600, color: "#ffffff" }}>
          Change Password
        </Typography>
      </Box>

      <Box sx={{ p: 3 }}>
        <Grid container spacing={2}>
          {passwordItems.map((item, index) => (
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
                  <TextField
                    fullWidth
                    label={item.label}
                    name={item.name}
                    type={item.type}
                    value={passwordData[item.name]}
                    onChange={handleChange}
                    error={!!errors[item.name]}
                    helperText={errors[item.name] || (item.name === "newPassword" && "Minimum 6 characters")}
                    variant="outlined"
                    size="small"
                    sx={{ "& .MuiOutlinedInput-root": { borderRadius: 1 } }}
                  />
                </Box>
              </Box>
            </Grid>
          ))}
        </Grid>

        <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 3 }}>
          <Button
            variant="contained"
            onClick={handleSubmit}
            sx={{
              background: "linear-gradient(135deg, #0f2027, #2c5364)",
              borderRadius: 2,
              textTransform: "none",
              px: 4,
              "&:hover": { opacity: 0.9 },
            }}
          >
            Update Password
          </Button>
        </Box>
      </Box>
    </Paper>
  );
}