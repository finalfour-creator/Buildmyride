"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Box, Typography, Grid, TextField, Button, Paper } from "@mui/material";

const field = {
  "& .MuiOutlinedInput-root": {
    background: "rgba(255,255,255,0.04)",
    borderRadius: "8px",
    "& fieldset": { borderColor: "rgba(255,255,255,0.08)" },
    "&:hover fieldset": { borderColor: "rgba(44,83,100,0.6)" },
    "&.Mui-focused fieldset": { borderColor: "#2c5364", borderWidth: "1.5px" },
  },
  "& .MuiInputLabel-root": { color: "rgba(255,255,255,0.3)", fontSize: 13 },
  "& .MuiInputLabel-root.Mui-focused": { color: "#4a9cb8" },
  "& .MuiOutlinedInput-input": { color: "#e8eaf6", fontSize: 13 },
  "& .MuiOutlinedInput-input.Mui-disabled": { WebkitTextFillColor: "rgba(255,255,255,0.2)" },
};

export default function ProfileSettings({ showMessage }) {
  const { data: session, update } = useSession();
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState({
    fullName: session?.user?.name || "",
    email: session?.user?.email || "",
  });

  useEffect(() => {
    if (session?.user) {
      setProfile({
        fullName: session.user.name || "",
        email: session.user.email || "",
      });
    }
  }, [session]);

  const handleChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      if (profile.fullName !== session?.user?.name) {
        const nameRes = await fetch("http://localhost:5000/api/users/update-name", {
          method: "PUT",
          headers: { "Content-Type": "application/json", "Authorization": `Bearer ${session?.accessToken}` },
          body: JSON.stringify({ name: profile.fullName }),
        });
        if (!nameRes.ok) {
          const error = await nameRes.json();
          throw new Error(error.message || "Failed to update name");
        }
      }
      if (profile.email !== session?.user?.email) {
        const emailRes = await fetch("http://localhost:5000/api/users/update-email", {
          method: "PUT",
          headers: { "Content-Type": "application/json", "Authorization": `Bearer ${session?.accessToken}` },
          body: JSON.stringify({ email: profile.email }),
        });
        if (!emailRes.ok) {
          const error = await emailRes.json();
          throw new Error(error.message || "Failed to update email");
        }
      }
      await update({ name: profile.fullName, email: profile.email });
      showMessage("Profile updated successfully");
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
          Profile Information
        </Typography>
        <Typography sx={{ fontSize: 12, color: "rgba(255,255,255,0.3)", mt: 0.3 }}>
          Update your display name and email address
        </Typography>
      </Box>

      {/* Fields */}
      <Box sx={{ p: 3 }}>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
  <TextField fullWidth label="Full Name" name="fullName" value={profile.fullName} onChange={handleChange} variant="outlined" size="small" disabled={loading} sx={field} />
  <TextField fullWidth label="Email Address" name="email" value={profile.email} onChange={handleChange} variant="outlined" size="small" disabled={loading} sx={field} />
</Box>
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
            {loading ? "Saving…" : "Save Changes"}
          </Button>
        </Box>
      </Box>
    </Paper>
  );
}
