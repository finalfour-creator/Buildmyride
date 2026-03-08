 "use client";
 
 import Link from "next/link";
 import Card from "@mui/material/Card";
 import CardActionArea from "@mui/material/CardActionArea";
 import Stack from "@mui/material/Stack";
 import Typography from "@mui/material/Typography";
 import Chip from "@mui/material/Chip";
 import Box from "@mui/material/Box";
 import ChevronRightIcon from "@mui/icons-material/ChevronRight";
 
 export default function OptionCard({ title, desc, href, icon, stats, disabled = false }) {
   return (
     <Card
       sx={{
         bgcolor: "#101010",
         border: "1px solid rgba(255,255,255,0.08)",
         borderRadius: 2,
         opacity: disabled ? 0.6 : 1,
       }}
     >
       <Link href={disabled ? "#" : href} style={{ textDecoration: "none", pointerEvents: disabled ? "none" : "auto" }}>
         <CardActionArea
           sx={{
             p: 2.5,
             "&:hover": { transform: "translateY(-2px)" },
             transition: "transform 200ms ease",
           }}
         >
           <Stack spacing={2}>
             <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
               <Box
                 sx={{
                   width: 44,
                   height: 44,
                   borderRadius: 1.5,
                   bgcolor: "#fff",
                   display: "flex",
                   alignItems: "center",
                   justifyContent: "center",
                   flexShrink: 0,
                 }}
               >
                 <span style={{ color: "#000", fontSize: 20 }}>{icon}</span>
               </Box>
               <Typography sx={{ fontSize: 20, fontWeight: 800, color: "#fff", fontFamily: "'Barlow Condensed',sans-serif" }}>
                 {title}
               </Typography>
               {stats && (
                 <Chip
                   label={stats}
                   size="small"
                   sx={{
                     ml: "auto",
                     fontSize: 11,
                     fontWeight: 700,
                     letterSpacing: "0.08em",
                     textTransform: "uppercase",
                     color: "rgba(255,255,255,0.7)",
                     bgcolor: "rgba(255,255,255,0.08)",
                     border: "1px solid rgba(255,255,255,0.14)",
                   }}
                 />
               )}
             </Box>
 
             <Typography sx={{ color: "rgba(255,255,255,0.7)" }}>{desc}</Typography>
 
             <Stack direction="row" alignItems="center" spacing={0.5} sx={{ color: "#fff" }}>
               <Typography sx={{ fontWeight: 700, fontSize: 14 }}>Get Started</Typography>
               <ChevronRightIcon fontSize="small" />
             </Stack>
           </Stack>
         </CardActionArea>
       </Link>
     </Card>
   );
 }
