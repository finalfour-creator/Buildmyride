"use client";
import { useState } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  InputAdornment,
  IconButton,
} from "@mui/material";
import { useSession } from "next-auth/react";
import { Lock, KeyRound, ShieldCheck, Eye, EyeOff, Check } from "lucide-react";
import SectionCard from "@/components/ui/SectionCard";

const passwordItems = [
  { label: "Current Password", name: "currentPassword", Icon: Lock },
  { label: "New Password", name: "newPassword", Icon: KeyRound },
  { label: "Confirm New Password", name: "confirmPassword", Icon: ShieldCheck },
];

// Live checklist rules (mirror validatePassword) so users see progress as they type.
const passwordRules = [
  { label: "At least 8 characters", test: (p) => p.length >= 8 },
  { label: "One uppercase letter (A-Z)", test: (p) => /[A-Z]/.test(p) },
  { label: "One lowercase letter (a-z)", test: (p) => /[a-z]/.test(p) },
  { label: "One number (0-9)", test: (p) => /[0-9]/.test(p) },
  { label: "One special character (!@#$%^&*)", test: (p) => /[!@#$%^&*(),.?":{}|<>]/.test(p) },
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
  const [show, setShow] = useState({
    currentPassword: false,
    newPassword: false,
    confirmPassword: false,
  });

  const toggleShow = (name) =>
    setShow((prev) => ({ ...prev, [name]: !prev[name] }));

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPasswordData({ ...passwordData, [name]: value });

    // Clear error when typing
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
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

  const handleSubmit = async (e) => {
    e?.preventDefault?.();

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

      showMessage("Password updated successfully");

    } catch (error) {
      showMessage(error.message || "Update failed", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit}>
      <SectionCard
        icon={<Lock size={18} />}
        title="Change Password"
        subtitle="Use a strong password you don't reuse elsewhere"
      >
        <Box sx={{ p: { xs: 2, sm: 3 } }}>
          {passwordItems.map(({ label, name, Icon }) => (
            <TextField
              key={name}
              fullWidth
              label={label}
              name={name}
              type={show[name] ? "text" : "password"}
              value={passwordData[name]}
              onChange={handleChange}
              error={!!errors[name]}
              helperText={errors[name] || ""}
              disabled={loading}
              autoComplete={name === "currentPassword" ? "current-password" : "new-password"}
              sx={{ mb: 2 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Icon size={18} color="#8a9aa8" />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => toggleShow(name)}
                      edge="end"
                      size="small"
                      aria-label={show[name] ? `Hide ${label}` : `Show ${label}`}
                      tabIndex={-1}
                    >
                      {show[name] ? <EyeOff size={18} /> : <Eye size={18} />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          ))}

          {/* Live requirement checklist — replaces the static paragraph */}
          {passwordData.newPassword.length > 0 && (
            <Box
              sx={{
                mt: 0.5,
                mb: 2,
                p: 1.5,
                bgcolor: "#f6f8fa",
                borderRadius: 1.5,
                border: "1px solid #eef1f3",
              }}
            >
              {passwordRules.map((rule) => {
                const passed = rule.test(passwordData.newPassword);
                return (
                  <Box
                    key={rule.label}
                    sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}
                  >
                    <Check
                      size={15}
                      color={passed ? "#16a34a" : "#cbd5e1"}
                      strokeWidth={3}
                    />
                    <Typography
                      variant="caption"
                      sx={{ color: passed ? "#16a34a" : "#8a9aa8" }}
                    >
                      {rule.label}
                    </Typography>
                  </Box>
                );
              })}
            </Box>
          )}

          <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 1 }}>
            <Button
              type="submit"
              variant="contained"
              disabled={loading}
              sx={{
                background: "linear-gradient(135deg, #0f2027, #2c5364)",
                borderRadius: 2,
                textTransform: "none",
                px: 4,
                "&.Mui-disabled": { background: "#cbd5e1", color: "#ffffff" },
              }}
            >
              {loading ? "Updating..." : "Update Password"}
            </Button>
          </Box>
        </Box>
      </SectionCard>
    </Box>
  );
}
