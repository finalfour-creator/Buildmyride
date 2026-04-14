"use client";
import { useState } from "react";
import { Box, Typography, Grid, TextField, Button, Paper } from "@mui/material";

const infoItems = [
  { label: "Full Name", name: "fullName", icon: "👤", color: "#2c5364" },
  { label: "Username", name: "username", icon: "🔖", color: "#203a43" },
  { label: "Email Address", name: "email", icon: "📧", color: "#2c5364" },
  { label: "Phone Number", name: "phone", icon: "📱", color: "#203a43" },
];

export default function ProfileSettings({ showMessage }) {
  const [profile, setProfile] = useState({
    fullName: "Xyz",
    username: "xyz_designs",
    email: "xyz@test.com",
    phone: "+92 300 1234567",
  });

  const handleChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleSubmit = () => {
    console.log("Profile updated:", profile);
    showMessage("Profile updated successfully");
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
          background: "linear-gradient(135deg, #0f2027, #2c5364)",
          p: 2,
          textAlign: "center",
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 600, color: "#ffffff" }}>
          Profile Information
        </Typography>
      </Box>

      <Box sx={{ p: 3 }}>
        <Grid container spacing={2}>
          {infoItems.map((item, index) => (
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
                  "&:hover": { transform: "translateX(5px)", transition: "transform 0.2s" },
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
                    value={profile[item.name]}
                    onChange={handleChange}
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
            Save Profile
          </Button>
        </Box>
      </Box>
    </Paper>
  );
}