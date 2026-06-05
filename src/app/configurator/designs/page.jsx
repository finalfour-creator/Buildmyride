"use client";

import { useEffect, useState } from "react";
import { Box, Typography, Container, Breadcrumbs } from "@mui/material";
import Link from "next/link";
import DesignCard from "@/feature/dashboard/components/DesignCard";
import apiClient from "@/lib/axios";
import { useSession } from "next-auth/react";

export default function MyDesignsPage() {
  
  const { data: session, status } = useSession();
  const [designs, setDesigns] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "authenticated") {
      const fetchDesigns = async () => {
        try {
          const res = await apiClient.get("/designs");
          setDesigns(res.data);
        } catch (error) {
          console.error("Failed to fetch designs:", error);
        } finally {
          setLoading(false);
        }
      };
      fetchDesigns();
    }
  }, [status]);

  if (status === "loading" || (status === "authenticated" && loading)) {
    return (
      <Container sx={{ py: 10 }}>
        <Typography variant="h5">Loading your saved designs...</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Breadcrumbs / Header */}
      <Box sx={{ mb: 4 }}>
        <Breadcrumbs sx={{ mb: 1, fontSize: 13 }}>
          <Link href="/configurator/dashboard" style={{ textDecoration: "none", color: "#64748b" }}>Dashboard</Link>
          <Typography sx={{ fontSize: 13, color: "#1a2a32", fontWeight: 600 }}>My Designs</Typography>
        </Breadcrumbs>
        <Typography variant="h4" fontWeight={700} color="#1a2a32">
          My Design Gallery
        </Typography>
        <Typography variant="body1" color="#64748b">
          Browse and manage all your automotive customizations
        </Typography>
      </Box>

      {/* Designs Grid */}
      {designs.length > 0 ? (
        <Box sx={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 3 }}>
          {designs.map((design) => (
            <DesignCard key={design._id} {...design} />
          ))}
        </Box>
      ) : (
        <Box sx={{ 
          textAlign: "center", 
          py: 12, 
          background: "white", 
          border: "1px dashed #cbd5e1",
          borderRadius: 2
        }}>
          <Typography variant="h6" fontWeight={600} mb={1}>No designs found</Typography>
          <Typography variant="body2" color="#64748b" mb={4}>
            You haven't saved any car configurations yet.
          </Typography>
          <Link href="/configurator/customization" style={{ 
            padding: "12px 32px", 
            background: "linear-gradient(135deg, #0f2027, #2c5364)", 
            color: "white", 
            textDecoration: "none", 
            fontWeight: 600,
            borderRadius: 1
          }}>
            Create Your First Design
          </Link>
        </Box>
      )}
    </Container>
  );
}
