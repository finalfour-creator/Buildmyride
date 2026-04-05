

"use client";
import Link from "next/link";
import { useState } from "react";
import { Box } from "@mui/material";
import DesignCard from "@/feature/dashboard/components/DesignCard";

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState("designs");

  const savedDesigns = [
    {
      id: 1,
      name: "Midnight Sports Edition",
      car: "Honda Civic 2024",
      lastEdited: "2 days ago",
      color: "#1e3a5f",
      thumbVariant: "civic",
      tag: "3D",
    },
    {
      id: 2,
      name: "Urban Matte Black",
      car: "Toyota Corolla Altis",
      lastEdited: "5 days ago",
      color: "#2d2d2d",
      thumbVariant: "corolla",
      tag: "AR",
    },
    {
      id: 3,
      name: "Desert Storm Rally",
      car: "Suzuki Swift",
      lastEdited: "1 week ago",
      color: "#b87c4f",
      thumbVariant: "cultus",
      tag: "AI",
    },
  ];

  const recentActivity = [
    { id: 1, action: "Modified wheels on", car: "Honda Civic", time: "2 hours ago" },
    { id: 2, action: "Saved new design", car: "Toyota Corolla", time: "Yesterday" },
    { id: 3, action: "Used AR preview on", car: "Suzuki Swift", time: "3 days ago" },
    { id: 4, action: "AI suggested new color combo", car: "Honda Civic", time: "5 days ago" },
  ];

  const stats = [
    { label: "Total Designs", value: "12" },
    { label: "Hours Spent", value: "24.5" },
    { label: "AI Suggestions", value: "28" },
    { label: "AR Previews", value: "15" },
    { label: "Exports", value: "8" },
  ];

  return (
    <Box sx={{ maxWidth: 1400, margin: "0 auto", px: { xs: 2, md: 4 } }}>
      {/* Welcome Section */}
      <Box sx={{ background: "white", border: "1px solid #e2e8f0", p: { xs: 3, md: 4 }, mb: 5 }}>
        <h1 style={{ fontSize: 32, fontWeight: 700, color: "#0f2027", marginBottom: 8, letterSpacing: "-0.3px" }}>
          Welcome back, Minahil
        </h1>
        <p style={{ fontSize: 16, color: "#64748b" }}>
          Continue your automotive design work or start a new project
        </p>
      </Box>

      {/* Quick Actions - 4 Boxes */}
      <Box sx={{ mb: 6 }}>
        <h2 style={{ fontSize: 20, fontWeight: 600, color: "#0f2027", marginBottom: 20, letterSpacing: "-0.2px" }}>
          Quick Actions
        </h2>
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "repeat(2, 1fr)", md: "repeat(4, 1fr)" }, gap: 3 }}>
          <Link href="/customize" style={{ textDecoration: "none" }}>
            <Box sx={{ 
              background: "linear-gradient(135deg, #0f2027, #203a43)", 
              p: { xs: 2, md: 3 },
              color: "white",
              cursor: "pointer",
              transition: "transform 0.2s",
              "&:hover": { transform: "translateY(-4px)" },
              display: "flex",
              flexDirection: "column"
            }}>
              <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>New Design</h3>
              <p style={{ opacity: 0.8, fontSize: 14 }}>Create a custom vehicle configuration</p>
            </Box>
          </Link>
          
          <Link href="/ar-view" style={{ textDecoration: "none" }}>
            <Box sx={{ 
              background: "linear-gradient(135deg, #203a43, #2c5364)", 
              p: { xs: 2, md: 3 },
              color: "white",
              cursor: "pointer",
              transition: "transform 0.2s",
              "&:hover": { transform: "translateY(-4px)" },
              display: "flex",
              flexDirection: "column"
            }}>
              <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>AR Preview</h3>
              <p style={{ opacity: 0.8, fontSize: 14 }}>Visualize modifications on your vehicle</p>
            </Box>
          </Link>
          
          <Link href="/ai-assistant" style={{ textDecoration: "none" }}>
            <Box sx={{ 
              background: "linear-gradient(135deg, #2c5364, #1e3a5f)", 
              p: { xs: 2, md: 3 },
              color: "white",
              cursor: "pointer",
              transition: "transform 0.2s",
              "&:hover": { transform: "translateY(-4px)" },
              display: "flex",
              flexDirection: "column"
            }}>
              <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>AI Assistant</h3>
              <p style={{ opacity: 0.8, fontSize: 14 }}>Get intelligent design recommendations</p>
            </Box>
          </Link>

          <Link href="/gallery" style={{ textDecoration: "none" }}>
            <Box sx={{ 
              background: "linear-gradient(135deg, #1e3a5f, #0f2027)", 
              p: { xs: 2, md: 3 },
              color: "white",
              cursor: "pointer",
              transition: "transform 0.2s",
              "&:hover": { transform: "translateY(-4px)" },
              display: "flex",
              flexDirection: "column"
            }}>
              <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>Community Gallery</h3>
              <p style={{ opacity: 0.8, fontSize: 14 }}>Explore designs from other creators</p>
            </Box>
          </Link>
        </Box>
      </Box>

      {/* Tabs */}
      <Box sx={{ display: "flex", gap: 1, borderBottom: "1px solid #e2e8f0", mb: 4 }}>
        <button 
          onClick={() => setActiveTab("designs")}
          style={{ 
            padding: "12px 28px", 
            background: "none", 
            border: "none", 
            fontSize: 15, 
            fontWeight: activeTab === "designs" ? 600 : 500, 
            color: activeTab === "designs" ? "#2c5364" : "#64748b", 
            borderBottom: activeTab === "designs" ? "2px solid #2c5364" : "none", 
            cursor: "pointer", 
            marginBottom: "-1px" 
          }}
        >
          My Designs
        </button>
        <button 
          onClick={() => setActiveTab("activity")}
          style={{ 
            padding: "12px 28px", 
            background: "none", 
            border: "none", 
            fontSize: 15, 
            fontWeight: activeTab === "activity" ? 600 : 500, 
            color: activeTab === "activity" ? "#2c5364" : "#64748b", 
            borderBottom: activeTab === "activity" ? "2px solid #2c5364" : "none", 
            cursor: "pointer", 
            marginBottom: "-1px" 
          }}
        >
          Recent Activity
        </button>
      </Box>

      {/* My Designs Grid */}
      {activeTab === "designs" && (
        <Box>
          {savedDesigns.length > 0 ? (
            <Box sx={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 3 }}>
              {savedDesigns.map((design) => (
                <DesignCard
                  key={design.id}
                  model={design.name}
                  date={design.lastEdited}
                  colorDot={design.color}
                  thumbVariant={design.thumbVariant}
                  tag={design.tag}
                  id={design.id}
                />
              ))}
            </Box>
          ) : (
            <Box sx={{ textAlign: "center", py: 10, background: "white", border: "1px solid #e2e8f0" }}>
              <h3 style={{ fontSize: 20, fontWeight: 600, marginBottom: 8 }}>No designs yet</h3>
              <p style={{ color: "#64748b", marginBottom: 24 }}>Start customizing your first vehicle design</p>
              <Link href="/customize" style={{ padding: "12px 32px", background: "linear-gradient(135deg, #0f2027, #2c5364)", color: "white", textDecoration: "none", fontWeight: 600 }}>
                Create New Design
              </Link>
            </Box>
          )}
        </Box>
      )}

      {/* Recent Activity */}
      {activeTab === "activity" && (
        <Box sx={{ background: "white", border: "1px solid #e2e8f0", overflow: "hidden" }}>
          {recentActivity.map((activity, i) => (
            <Box key={activity.id} sx={{ 
              p: { xs: 2, md: 3 }, 
              borderBottom: i === recentActivity.length - 1 ? "none" : "1px solid #eef2f6", 
              display: "flex", 
              justifyContent: "space-between", 
              alignItems: "center",
              flexWrap: "wrap",
              gap: 2
            }}>
              <Box>
                <p style={{ fontWeight: 500, color: "#0f2027", marginBottom: 4, fontSize: 15 }}>
                  {activity.action} <span style={{ fontWeight: 600, color: "#2c5364" }}>{activity.car}</span>
                </p>
                <p style={{ fontSize: 13, color: "#94a3b8" }}>{activity.time}</p>
              </Box>
              <button style={{ 
                padding: "6px 20px", 
                background: "#f1f5f9", 
                border: "1px solid #e2e8f0", 
                fontSize: 13, 
                cursor: "pointer", 
                color: "#2c5364", 
                fontWeight: 500 
              }}>
                View Details
              </button>
            </Box>
          ))}
        </Box>
      )}

      {/* Stats Section - Bottom */}
      <Box sx={{ 
        mt: 6, 
        p: { xs: 3, md: 4 }, 
        background: "white", 
        border: "1px solid #e2e8f0"
      }}>
        <h3 style={{ fontSize: 18, fontWeight: 600, color: "#0f2027", marginBottom: 24 }}>
          Design Statistics
        </h3>
        <Box sx={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 4 }}>
          {stats.map((stat, i) => (
            <Box key={i} sx={{ textAlign: "center" }}>
              <div style={{ fontSize: 32, fontWeight: 800, color: "#2c5364", marginBottom: 8 }}>{stat.value}</div>
              <div style={{ fontSize: 13, color: "#64748b", fontWeight: 500 }}>{stat.label}</div>
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  );
}