"use client";
import { useState } from "react";
import { Box, Typography, Grid, TextField, Button, Paper } from "@mui/material";
import { useSession } from "next-auth/react";

const passwordItems = [
  { label: "Current Password", name: "currentPassword", type: "password" },
  { label: "New Password",     name: "newPassword",     type: "password" },
  { label: "Confirm Password", name: "confirmPassword", type: "password" },
];

const validatePassword = (password) => {
  const errors = [];
  if (password.length < 8)                          errors.push("at least 8 characters");
  if (!/[A-Z]/.test(password))                      errors.push("1 uppercase letter (A-Z)");
  if (!/[a-z]/.test(password))                      errors.push("1 lowercase letter (a-z)");
  if (!/[0-9]/.test(password))                      errors.push("1 number (0-9)");
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password))    errors.push("1 special character (!@#$%^&*)");
  return errors;
};

const field = (hasError) => ({
  "& .MuiOutlinedInput-root": {
    background: "rgba(255,255,255,0.04)",
    borderRadius: "8px",
    "& fieldset": { borderColor: hasError ? "rgba(220,38,38,0.5)" : "rgba(255,255,255,0.08)" },
    "&:hover fieldset": { borderColor: hasError ? "rgba(220,38,38,0.7)" : "rgba(44,83,100,0.6)" },
    "&.Mui-focused fieldset": { borderColor: hasError ? "#dc2626" : "#2c5364", borderWidth: "1.5px" },
  },
  "& .MuiInputLabel-root": { color: "rgba(255,255,255,0.3)", fontSize: 13 },
  "& .MuiInputLabel-root.Mui-focused": { color: hasError ? "#f87171" : "#4a9cb8" },
  "& .MuiOutlinedInput-input": { color: "#e8eaf6", fontSize: 13 },
  "& .MuiFormHelperText-root": { color: "#f87171", fontSize: 11, ml: 0, mt: 0.5 },
  "& .MuiOutlinedInput-input.Mui-disabled": { WebkitTextFillColor: "rgba(255,255,255,0.2)" },
});

export default function PasswordSettings({ showMessage }) {
  const { data: session } = useSession();

  const [loading, setLoading] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});
  const [passwordStrengthError, setPasswordStrengthError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPasswordData({ ...passwordData, [name]: value });

    if (errors[name]) setErrors({ ...errors, [name]: "" });

    if (name === "newPassword") {
      const strengthErrors = validatePassword(value);
      setPasswordStrengthError(value.length > 0 && strengthErrors.length > 0 ? `Must contain: ${strengthErrors.join(", ")}` : "");
    }
    if ((name === "newPassword" || name === "confirmPassword") && errors.confirmPassword) {
      setErrors({ ...errors, confirmPassword: "" });
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!passwordData.currentPassword) newErrors.currentPassword = "Current password is required";
    if (!passwordData.newPassword) {
      newErrors.newPassword = "New password is required";
    } else {
      const strengthErrors = validatePassword(passwordData.newPassword);
      if (strengthErrors.length > 0) newErrors.newPassword = `Must contain: ${strengthErrors.join(", ")}`;
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) newErrors.confirmPassword = "Passwords do not match";
    return newErrors;
  };

  const handleSubmit = async () => {
    setPasswordStrengthError("");
    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return; }

    setLoading(true);
    try {
      const response = await fetch("http://localhost:5000/api/users/update-password", {
        method: "PUT",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${session?.accessToken}` },
        body: JSON.stringify({ currentPassword: passwordData.currentPassword, newPassword: passwordData.newPassword }),
      });

      let data;
      try { data = await response.json(); } catch { data = { message: "Server returned invalid response" }; }
      if (!response.ok) throw new Error(data.message || "Failed to update password");

      setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setPasswordStrengthError("");
      showMessage("Password updated successfully");
    } catch (error) {
      showMessage(error.message || "Update failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper sx={{ width: "100%", height: "100%", background: "#0d1b2a", border: "1px solid rgba(44,83,100,0.25)", borderRadius: "12px", overflow: "hidden", boxShadow: "0 4px 24px rgba(0,0,0,0.4)" }}>
      {/* Header */}
      <Box sx={{ px: 3, pt: 2.5, pb: 2, borderBottom: "1px solid rgba(44,83,100,0.15)" }}>
        <Typography sx={{ fontSize: 14, fontWeight: 700, color: "#4a9cb8", letterSpacing: "0.02em" }}>
          Change Password
        </Typography>
        <Typography sx={{ fontSize: 12, color: "rgba(255,255,255,0.3)", mt: 0.3 }}>
          Choose a strong password to keep your account secure
        </Typography>
      </Box>

      {/* Fields — current+new on top row, confirm below */}
      <Box sx={{ p: 3 }}>
        <Grid container spacing={2}>
          {/* Row 1: current password + new password */}
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth label={passwordItems[0].label} name={passwordItems[0].name}
              type={passwordItems[0].type} value={passwordData[passwordItems[0].name]}
              onChange={handleChange} error={!!errors[passwordItems[0].name]}
              helperText={errors[passwordItems[0].name]}
              variant="outlined" size="small" disabled={loading}
              sx={field(!!errors[passwordItems[0].name])}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth label={passwordItems[1].label} name={passwordItems[1].name}
              type={passwordItems[1].type} value={passwordData[passwordItems[1].name]}
              onChange={handleChange} error={!!errors[passwordItems[1].name]}
              helperText={errors[passwordItems[1].name] || passwordStrengthError}
              variant="outlined" size="small" disabled={loading}
              sx={field(!!errors[passwordItems[1].name])}
            />
          </Grid>

          {/* Row 2: confirm password */}
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth label={passwordItems[2].label} name={passwordItems[2].name}
              type={passwordItems[2].type} value={passwordData[passwordItems[2].name]}
              onChange={handleChange} error={!!errors[passwordItems[2].name]}
              helperText={errors[passwordItems[2].name]}
              variant="outlined" size="small" disabled={loading}
              sx={field(!!errors[passwordItems[2].name])}
            />
          </Grid>
        </Grid>

        {/* Requirements */}
        <Typography sx={{ fontSize: 11, color: "rgba(255,255,255,0.25)", mt: 2, letterSpacing: "0.01em" }}>
          Requirements: Minimum 8 characters · 1 uppercase · 1 lowercase · 1 number · 1 special character
        </Typography>

        <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2.5 }}>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={loading}
            sx={{
              background: "linear-gradient(135deg, #0f2027, #2c5364)",
              borderRadius: "8px", textTransform: "none", px: 3, py: 0.9,
              fontSize: 13, fontWeight: 600, boxShadow: "none",
              "&:hover": { boxShadow: "0 4px 16px rgba(44,83,100,0.5)", opacity: 0.9 },
              "&.Mui-disabled": { background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.2)" },
            }}
          >
            {loading ? "Updating…" : "Update Password"}
          </Button>
        </Box>
      </Box>
    </Paper>
  );
}
