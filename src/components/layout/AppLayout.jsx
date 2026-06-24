"use client";
import { Box } from "@mui/material";
import Navbar from "./DashboardNav";
import Sidebar from "./Sidebar";

export default function AppLayout({ children }) {
  return (
    <Box sx={{ minHeight: "100vh", background: "#fefcf8" }}>
      <Navbar />
      <Box sx={{ display: "flex", paddingTop: "70px" }}>
        <Sidebar />
        <Box component="main" sx={{ flex: 1, marginLeft: "260px", padding: "32px 40px" }}>
          {children}
        </Box>
      </Box>
    </Box>
  );
}