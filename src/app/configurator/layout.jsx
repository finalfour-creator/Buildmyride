"use client";
import { Box } from "@mui/material";
import Navbar from "@/components/layout/DashboardNav";
import Sidebar from "@/components/layout/Sidebar";

export default function AppLayout({ children }) {
  return (
    <Box sx={{ minHeight: "100vh", background: "#0f2027" }}>
      <Navbar />
      <Box sx={{ display: "flex", paddingTop: "70px" }}>
        <Sidebar />
        <Box component="main" sx={{ flex: 1, marginLeft: "260px" }}>
          {children}
        </Box>
      </Box>
    </Box>
  );
}