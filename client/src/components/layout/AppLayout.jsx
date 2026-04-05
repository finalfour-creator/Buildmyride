// "use client";
// import { Box } from "@mui/material";
// import Navbar from "./Navbar";
// import Sidebar from "./Sidebar";

// export default function AppLayout({ children }) {
//   return (
//     <Box sx={{ minHeight: "100vh", background: "#fefcf8" }}>
//       <Navbar />
//       <Box sx={{ display: "flex", paddingTop: "70px" }}>
//         <Sidebar />
//         <Box component="main" sx={{ flex: 1, marginLeft: "260px", padding: "32px 40px" }}>
//           {children}
//         </Box>
//       </Box>
//     </Box>
//   );
// }

"use client";
import { Box } from "@mui/material";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";

export default function AppLayout({ children, noPadding = false }) {
  return (
    <Box sx={{ minHeight: "100vh", background: "#fefcf8" }}>
      <Navbar />
      <Box sx={{ display: "flex", paddingTop: "70px" }}>
        <Sidebar />
        <Box 
          component="main" 
          sx={{ 
            flex: 1, 
            marginLeft: "260px", 
            padding: noPadding ? 0 : "32px 40px",
          }}
        >
          {children}
        </Box>
      </Box>
    </Box>
  );
}