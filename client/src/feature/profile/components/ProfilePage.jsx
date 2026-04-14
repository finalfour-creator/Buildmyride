"use client";
import { useState } from "react";
import { Box, Typography, Grid, Paper, Avatar, Button, Divider } from "@mui/material";
import EditProfileDialog from "./EditProfileDialog";

export default function ProfilePage() {
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  
  const [profile, setProfile] = useState({
    fullName: "Xyz Xyz",
    username: "xyz_designs",
    email: "xyz@test.com",
    phone: "+92 300 1234567",
    bio: "Automotive design enthusiast specializing in custom vehicle modifications and visual aesthetics.",
    location: "Lahore, Pakistan",
    dateJoined: "January 15, 2025",
    avatar: "X",
  });

  const infoItems = [
    { label: "Full Name", value: profile.fullName, icon: "👤", color: "#2c5364" },
    { label: "Username", value: `@${profile.username}`, icon: "🔖", color: "#203a43" },
    { label: "Email Address", value: profile.email, icon: "📧", color: "#2c5364" },
    { label: "Phone Number", value: profile.phone, icon: "📱", color: "#203a43" },
    { label: "Location", value: profile.location, icon: "📍", color: "#2c5364" },
    { label: "Member Since", value: profile.dateJoined, icon: "🎂", color: "#203a43" },
  ];

  const stats = [
    { label: "Total Designs", value: "12",  bgColor: "#0f2027", textColor: "#ffffff" },
    { label: "Designs Shared", value: "8", bgColor: "#2c5364", textColor: "#ffffff" },
    { label: "AR Sessions", value: "24", bgColor: "#203a43", textColor: "#ffffff" },
    { label: "AI Suggestions", value: "47", bgColor: "#1e3a5f", textColor: "#ffffff" },
  ];

  const handleSaveProfile = (updatedProfile) => {
    setProfile(updatedProfile);
  };

  return (
    <Box
      sx={{
        maxWidth: 700,
        margin: "0 auto",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
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
          My Profile
        </Typography>
        <Typography variant="body2" sx={{ color: "#6b7c88" }}>
          View and manage your personal information
        </Typography>
      </Box>

      {/* Profile Card */}
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
        {/* Avatar Section with Gradient Background */}
        <Box
          sx={{
            background: "linear-gradient(135deg, #0f2027, #2c5364)",
            p: 4,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            borderBottom: "1px solid rgba(255,255,255,0.1)",
          }}
        >
          <Avatar
            sx={{
              width: 120,
              height: 120,
              background: "linear-gradient(135deg, #fff, #e2e8f0)",
              color: "#2c5364",
              fontSize: 52,
              fontWeight: 700,
              mb: 2,
              boxShadow: "0 8px 20px rgba(0,0,0,0.2)",
            }}
          >
            {profile.avatar}
          </Avatar>
          <Typography variant="h5" sx={{ fontWeight: 700, color: "#ffffff", mb: 0.5 }}>
            {profile.fullName}
          </Typography>
          <Typography variant="body2" sx={{ color: "#e2e8f0", mb: 2 }}>
            @{profile.username}
          </Typography>
          <Button
            variant="outlined"
            size="small"
            onClick={() => setEditDialogOpen(true)}
            sx={{
              borderColor: "rgba(255,255,255,0.5)",
              color: "#ffffff",
              borderRadius: 2,
              textTransform: "none",
              px: 3,
              "&:hover": {
                borderColor: "#ffffff",
                backgroundColor: "rgba(255,255,255,0.1)",
              },
            }}
          >
            Edit Profile
          </Button>
        </Box>

        {/* Bio Section */}
        {profile.bio && (
          <Box sx={{ p: 3, borderBottom: "1px solid #e8e0d6", bgcolor: "#f8fafc" }}>
            <Typography
              variant="body2"
              sx={{ color: "#1a2a32", lineHeight: 1.6, textAlign: "center", fontStyle: "italic" }}
            >
              "{profile.bio}"
            </Typography>
          </Box>
        )}

        {/* Information Grid */}
        <Box sx={{ p: 3 }}>
          <Typography
            variant="subtitle2"
            sx={{
              fontWeight: 600,
              color: "#2c5364",
              mb: 2,
              letterSpacing: "1px",
              textTransform: "uppercase",
              textAlign: "center",
            }}
          >
            Personal Information
          </Typography>
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
                    transition: "transform 0.2s",
                    "&:hover": { transform: "translateX(5px)" },
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
                    <Typography variant="caption" sx={{ color: "#8a9aa8", display: "block", mb: 0.25 }}>
                      {item.label}
                    </Typography>
                    <Typography variant="body2" sx={{ color: "#1a2a32", fontWeight: 500 }}>
                      {item.value}
                    </Typography>
                  </Box>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Box>
      </Paper>

      {/* Stats Grid */}
      <Grid container spacing={2} sx={{ mb: 4 }}>
        {stats.map((stat, i) => (
          <Grid item xs={6} sm={3} key={i}>
            <Paper
              sx={{
                p: 2.5,
                textAlign: "center",
                background: `linear-gradient(135deg, ${stat.bgColor}, ${stat.bgColor}dd)`,
                border: "none",
                boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                transition: "transform 0.2s",
                "&:hover": { transform: "translateY(-4px)" },
              }}
            >
              <Typography variant="h3" sx={{ fontSize: 32, mb: 0.5 }}>
                {stat.icon}
              </Typography>
              <Typography variant="h5" sx={{ fontSize: 24, fontWeight: 700, color: stat.textColor, mb: 0.5 }}>
                {stat.value}
              </Typography>
              <Typography
                variant="caption"
                sx={{ color: `${stat.textColor}cc`, letterSpacing: "0.5px", textTransform: "uppercase" }}
              >
                {stat.label}
              </Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* Edit Profile Dialog */}
      <EditProfileDialog
        open={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        profile={profile}
        onSave={handleSaveProfile}
      />
    </Box>
  );
}