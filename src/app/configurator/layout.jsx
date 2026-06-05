"use client";
import { Box } from "@mui/material";
import Sidebar from "@/components/layout/Sidebar";
import { usePathname } from "next/navigation";

export default function AppLayout({ children }) {
  const pathname = usePathname();
  const isCustomization = pathname === "/configurator/customization";

  // Customization page is full-screen with no sidebar
  if (isCustomization) {
    return <>{children}</>;
  }

  return (
    <Box sx={{ minHeight: "100vh", background: "#0f2027" }}>
      <Box sx={{ display: "flex", minHeight: "100vh" }}>
        <Sidebar />
        <Box component="main" sx={{ flex: 1, marginLeft: "260px", minHeight: "100vh", overflowY: "auto" }}>
          {children}
        </Box>
      </Box>
    </Box>
  );
}
