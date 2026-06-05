
"use client";
import { useState } from "react";
import { Box, Typography, Grid, TextField, Button, Paper } from "@mui/material";
import { useSession } from "next-auth/react";

const passwordItems = [
  { label: "Current Password", name: "currentPassword", icon: "🔒", color: "#2c5364", type: "password" },
  { label: "New Password", name: "newPassword", icon: "✨", color: "#203a43", type: "password" },
  { label: "Confirm New Password", name: "confirmPassword", icon: "✓", color: "#2c5364", type: "password" },
];

// ✅ PASSWORD VALIDATION FUNCTION (same as register)
const validatePassword = (password) => {
  const errors = [];
  
  if (password.length < 8) {
    errors.push("at least 8 characters");
  }
  if (!/[A-Z]/.test(password)) {
    errors.push("1 uppercase letter (A-Z)");
  }
  if (!/[a-z]/.test(password)) {
    errors.push("1 lowercase letter (a-z)");
  }
  if (!/[0-9]/.test(password)) {
    errors.push("1 number (0-9)");
  }
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push("1 special character (!@#$%^&*)");
  }
  
  return errors;
};

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

    // Clear error when typing
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }

    // ✅ Validate new password strength in real-time
    if (name === "newPassword") {
      const strengthErrors = validatePassword(value);
      if (value.length > 0 && strengthErrors.length > 0) {
        setPasswordStrengthError(`Password must contain: ${strengthErrors.join(", ")}`);
      } else {
        setPasswordStrengthError("");
      }
    }

    // Clear confirm password error when new password or confirm changes
    if (name === "newPassword" || name === "confirmPassword") {
      if (errors.confirmPassword) {
        setErrors({ ...errors, confirmPassword: "" });
      }
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!passwordData.currentPassword) {
      newErrors.currentPassword = "Current password is required";
    }

    if (!passwordData.newPassword) {
      newErrors.newPassword = "New password is required";
    } else {
      // ✅ CHECK PASSWORD STRENGTH
      const strengthErrors = validatePassword(passwordData.newPassword);
      if (strengthErrors.length > 0) {
        newErrors.newPassword = `Password must contain: ${strengthErrors.join(", ")}`;
      }
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    return newErrors;
  };

  const handleSubmit = async () => {
    // Clear previous password strength error
    setPasswordStrengthError("");
    
    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("http://localhost:5000/api/users/update-password", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session?.accessToken}`,
        },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        }),
      });

      let data;
      try {
        data = await response.json();
      } catch {
        data = { message: "Server returned invalid response" };
      }

      if (!response.ok) {
        throw new Error(data.message || "Failed to update password");
      }

      // Reset form on success
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setPasswordStrengthError("");

      showMessage("Password updated successfully");

    } catch (error) {
      showMessage(error.message || "Update failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper sx={{ mb: 4, width: "100%" }}>
      <Box sx={{ background: "linear-gradient(135deg, #203a43, #2c5364)", p: 2, textAlign: "center" }}>
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
                    helperText={
                      errors[item.name] ||
                      (item.name === "newPassword" && passwordStrengthError)
                    }
                    variant="outlined"
                    size="small"
                    disabled={loading}
                    sx={{ "& .MuiOutlinedInput-root": { borderRadius: 1 } }}
                  />
                </Box>
              </Box>
            </Grid>
          ))}
        </Grid>

        {/* ✅ Password Requirements Hint */}
        <Box sx={{ mt: 2, mb: 2, p: 1.5, bgcolor: "#f0f4f8", borderRadius: 1 }}>
          <Typography variant="caption" sx={{ color: "#64748b" }}>
            <strong>Password requirements:</strong> Minimum 8 characters, at least 1 uppercase letter, 
            1 lowercase letter, 1 number, and 1 special character (!@#$%^&*)
          </Typography>
        </Box>

        <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 1 }}>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={loading}
            sx={{
              background: "linear-gradient(135deg, #0f2027, #2c5364)",
              borderRadius: 2,
              textTransform: "none",
              px: 4,
            }}
          >
            {loading ? "Updating..." : "Update Password"}
          </Button>
        </Box>
      </Box>
    </Paper>
  );
}