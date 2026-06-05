"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Box, TextField, Button, InputAdornment } from "@mui/material";
import { User, Mail } from "lucide-react";
import SectionCard from "@/components/ui/SectionCard";

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

  // Only enable Save when something actually changed (no no-op API calls).
  const isDirty =
    profile.fullName !== (session?.user?.name || "") ||
    profile.email !== (session?.user?.email || "");

  const handleChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e?.preventDefault?.();
    if (!isDirty) return;
    setLoading(true);

    try {
      // Update name if changed
      if (profile.fullName !== session?.user?.name) {
        const nameRes = await fetch("http://localhost:5000/api/users/update-name", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${session?.accessToken}`
          },
          body: JSON.stringify({ name: profile.fullName }),
        });

        if (!nameRes.ok) {
          const error = await nameRes.json();
          throw new Error(error.message || "Failed to update name");
        }
      }

      // Update email if changed
      if (profile.email !== session?.user?.email) {
        const emailRes = await fetch("http://localhost:5000/api/users/update-email", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${session?.accessToken}`
          },
          body: JSON.stringify({ email: profile.email }),
        });

        if (!emailRes.ok) {
          const error = await emailRes.json();
          throw new Error(error.message || "Failed to update email");
        }
      }

      await update({
        name: profile.fullName,
        email: profile.email,
      });
      showMessage("Profile updated successfully");

    } catch (error) {
      showMessage(error.message || "Update failed", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit}>
      <SectionCard
        icon={<User size={18} />}
        title="Profile Information"
        subtitle="Update your name and email address"
      >
        <Box sx={{ p: { xs: 2, sm: 3 } }}>
          <TextField
            fullWidth
            label="Full Name"
            name="fullName"
            value={profile.fullName}
            onChange={handleChange}
            disabled={loading}
            sx={{ mb: 2.5 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <User size={18} color="#8a9aa8" />
                </InputAdornment>
              ),
            }}
          />
          <TextField
            fullWidth
            label="Email Address"
            name="email"
            type="email"
            value={profile.email}
            onChange={handleChange}
            disabled={loading}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Mail size={18} color="#8a9aa8" />
                </InputAdornment>
              ),
            }}
          />

          <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 3 }}>
            <Button
              type="submit"
              variant="contained"
              disabled={loading || !isDirty}
              sx={{
                background: "linear-gradient(135deg, #0f2027, #2c5364)",
                borderRadius: 2,
                textTransform: "none",
                px: 4,
                "&.Mui-disabled": { background: "#cbd5e1", color: "#ffffff" },
              }}
            >
              {loading ? "Saving..." : isDirty ? "Save Changes" : "Saved"}
            </Button>
          </Box>
        </Box>
      </SectionCard>
    </Box>
  );
}
