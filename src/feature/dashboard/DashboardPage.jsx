"use client";

import Link from "next/link";
import { Box, CircularProgress, Typography, Button } from "@mui/material";
import DesignCard from "@/feature/dashboard/components/DesignCard";
import { useSession } from "next-auth/react";
import { useEffect, useState, useCallback } from "react";
import apiClient from "@/lib/axios";
import { useSearchParams } from "next/navigation";

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");
  const [activeTab, setActiveTab] = useState(tabParam || "designs");
  const [designs, setDesigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);

  // Sync tab with URL param
  useEffect(() => {
    if (tabParam) setActiveTab(tabParam);
  }, [tabParam]);

  const fetchDesigns = useCallback(async () => {
    setLoading(true);
    setFetchError(null);
    try {
      const res = await apiClient.get("/designs");
      const data = Array.isArray(res.data)
        ? res.data
        : res.data?.designs ?? res.data?.data ?? [];
      setDesigns(data);
    } catch (error) {
      console.error("Failed to fetch designs:", error);
      setFetchError("Could not load your designs. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (status === "authenticated") {
      fetchDesigns();
    } else if (status === "unauthenticated") {
      setLoading(false);
    }
  }, [status, fetchDesigns]);

  const userName = session?.user?.name || "User";

  if (status === "loading" || (status === "authenticated" && loading)) {
    return (
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, p: 4 }}>
        <CircularProgress size={28} sx={{ color: "#2c5364" }} />
        <Typography>Loading your designs…</Typography>
      </Box>
    );
  }

  const recentActivity = [
    { id: 1, action: "Modified wheels on", car: "Honda Civic", time: "2 hours ago" },
    { id: 2, action: "Saved new design", car: "Toyota Corolla", time: "Yesterday" },
    { id: 3, action: "Used AR preview on", car: "Suzuki Swift", time: "3 days ago" },
    { id: 4, action: "AI suggested new color combo", car: "Honda Civic", time: "5 days ago" },
  ];

  const stats = [
    { label: "Total Designs", value: designs.length.toString() },
    { label: "Hours Spent", value: "24.5" },
    { label: "AI Suggestions", value: "28" },
    { label: "AR Previews", value: "15" },
    { label: "Exports", value: "8" },
  ];

  return (
    <Box sx={{ maxWidth: 1400, margin: "0 auto", px: { xs: 2, md: 4 }, py: 4 }}>
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
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "repeat(1, 1fr)", md: "repeat(3, 1fr)" }, gap: 3 }}>
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
        <Box>
          {fetchError ? (
            <Box sx={{ textAlign: "center", py: 10, background: "white", border: "1px solid #fca5a5" }}>
              <Typography color="error" mb={2}>{fetchError}</Typography>
              <Button onClick={fetchDesigns} variant="contained" sx={{ background: "linear-gradient(135deg, #0f2027, #2c5364)", color: "white" }}>
                Retry
              </Button>
            </Box>
          ) : designs.length > 0 ? (
            <Box sx={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 3 }}>
              {designs.map((design) => (
                <DesignCard key={design._id} {...design} />
              ))}
            </Box>
          ) : (
            <Box sx={{ textAlign: "center", py: 10, background: "white", border: "1px solid #e2e8f0" }}>
              <h3 style={{ fontSize: 20, fontWeight: 600, marginBottom: 8 }}>No designs yet</h3>
              <p style={{ color: "#64748b", marginBottom: 24 }}>Start customizing your first vehicle design</p>
              <Link href="/configurator/customization" style={{ padding: "12px 32px", background: "linear-gradient(135deg, #0f2027, #2c5364)", color: "white", textDecoration: "none", fontWeight: 600 }}>
                Create New Design
              </Link>
            </Box>
          )}
        </Box>
      )}

      {activeTab === "activity" && (
        <Box sx={{ background: "white", border: "1px solid #e2e8f0", p: 4, textAlign: "center" }}>
          <p style={{ color: "#64748b" }}>Recent activity will appear here as you work on your designs.</p>
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