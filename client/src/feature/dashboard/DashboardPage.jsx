"use client";

import Link from "next/link";
import { useState } from "react";
import { Box } from "@mui/material";
import DesignCard from "@/feature/dashboard/components/DesignCard";
import { useSession } from "next-auth/react";

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const [activeTab, setActiveTab] = useState("designs");

  // ✅ SIMPLE AND CORRECT
  const userName = session?.user?.name || "User";

  if (status === "loading") {
    return <h1 style={{ padding: 20 }}>Loading...</h1>;
  }

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
        <h1 style={{ fontSize: 24, fontWeight: 500, color: "#1a2a32", marginBottom: 6 }}>
          WELCOME BACK,{" "}
          <span style={{ color: "#2c5364", fontWeight: 600 }}>
            {userName}
          </span>
        </h1>
        <p style={{ fontSize: 16, color: "#64748b" }}>
          Continue your automotive design work or start a new project
        </p>
      </Box>

      {/* Quick Actions */}
      <Box sx={{ mb: 6 }}>
        <h2 style={{ fontSize: 20, fontWeight: 600, color: "#0f2027", marginBottom: 20 }}>
          Quick Actions
        </h2>
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "repeat(2, 1fr)", md: "repeat(4, 1fr)" }, gap: 3 }}>
          <Link href="/configurator/customization" style={{ textDecoration: "none" }}>
            <Box sx={{ background: "linear-gradient(135deg, #0f2027, #203a43)", p: 3, color: "white" }}>
              <h3>New Design</h3>
              <p>Create a custom vehicle configuration</p>
            </Box>
          </Link>
          <Link href="/ar-view" style={{ textDecoration: "none" }}>
            <Box sx={{ background: "linear-gradient(135deg, #203a43, #2c5364)", p: 3, color: "white" }}>
              <h3>AR Preview</h3>
              <p>Visualize modifications on your vehicle</p>
            </Box>
          </Link>
          <Link href="/ai-assistant" style={{ textDecoration: "none" }}>
            <Box sx={{ background: "linear-gradient(135deg, #2c5364, #1e3a5f)", p: 3, color: "white" }}>
              <h3>AI Assistant</h3>
              <p>Get intelligent design recommendations</p>
            </Box>
          </Link>
          <Link href="/gallery" style={{ textDecoration: "none" }}>
            <Box sx={{ background: "linear-gradient(135deg, #1e3a5f, #0f2027)", p: 3, color: "white" }}>
              <h3>Community</h3>
              <p>Explore designs from others</p>
            </Box>
          </Link>
        </Box>
      </Box>

      {/* Tabs */}
      <Box sx={{ display: "flex", gap: 1, borderBottom: "1px solid #e2e8f0", mb: 4 }}>
        <button onClick={() => setActiveTab("designs")} style={{ padding: "10px 20px", cursor: "pointer" }}>
          My Designs
        </button>
        <button onClick={() => setActiveTab("activity")} style={{ padding: "10px 20px", cursor: "pointer" }}>
          Recent Activity
        </button>
      </Box>

      {/* Content */}
      {activeTab === "designs" && (
        <Box sx={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 3 }}>
          {savedDesigns.map((design) => (
            <DesignCard key={design.id} {...design} />
          ))}
        </Box>
      )}

      {activeTab === "activity" && (
        <Box>
          {recentActivity.map((item) => (
            <p key={item.id}>
              {item.action} {item.car} - {item.time}
            </p>
          ))}
        </Box>
      )}

      {/* Stats */}
      <Box sx={{ mt: 6, p: 3, background: "white", border: "1px solid #e2e8f0" }}>
        <h3 style={{ marginBottom: 20 }}>Design Statistics</h3>
        <Box sx={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 2 }}>
          {stats.map((stat, i) => (
            <Box key={i} sx={{ textAlign: "center" }}>
              <div style={{ fontSize: 24, fontWeight: 700, color: "#2c5364" }}>{stat.value}</div>
              <div style={{ fontSize: 12, color: "#64748b" }}>{stat.label}</div>
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  );
}