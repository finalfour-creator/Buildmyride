"use client";
import { useState } from "react";
import { useSession } from "next-auth/react";
import { Box, Typography, Grid, TextField, Button, Paper } from "@mui/material";
import { useEffect } from "react";

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
      
      // await update();
      await update({
  name: profile.fullName,
  email: profile.email,
});
      showMessage("Profile updated successfully");
      
    } catch (error) {
      showMessage(error.message || "Update failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper sx={{ mb: 4, width: "100%" }}>
      <Box sx={{ background: "linear-gradient(135deg, #0f2027, #2c5364)", p: 2, textAlign: "center" }}>
        <Typography variant="h6" sx={{ fontWeight: 600, color: "#ffffff" }}>
          Profile Information
        </Typography>
      </Box>

      <Box sx={{ p: 3 }}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Full Name"
              name="fullName"
              value={profile.fullName}
              onChange={handleChange}
              variant="outlined"
              size="small"
              disabled={loading}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Email Address"
              name="email"
              value={profile.email}
              onChange={handleChange}
              variant="outlined"
              size="small"
              disabled={loading}
            />
          </Grid>
        </Grid>

        <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 3 }}>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={loading}
            sx={{ background: "linear-gradient(135deg, #0f2027, #2c5364)", borderRadius: 2, textTransform: "none", px: 4 }}
          >
            {loading ? "Saving..." : "Save Profile"}
          </Button>
        </Box>
      </Box>
    </Paper>
  );
}

