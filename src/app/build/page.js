 "use client";
 
 import Link from "next/link";
 import { useState } from "react";
 import Box from "@mui/material/Box";
 import Container from "@mui/material/Container";
 import Stack from "@mui/material/Stack";
 import Grid from "@mui/material/Grid";
 import Button from "@mui/material/Button";
 import Typography from "@mui/material/Typography";
 import Chip from "@mui/material/Chip";
 import Divider from "@mui/material/Divider";
 import ArrowBackIcon from "@mui/icons-material/ArrowBack";
 
 const tabs = [
   { id: "color", label: "Color" },
   { id: "exterior", label: "Exterior" },
   { id: "interior", label: "Interior" },
 ];
 
 const colors = [
   { name: "Black", value: "#000000" },
   { name: "White", value: "#ffffff" },
   { name: "Red", value: "#b71c1c" },
   { name: "Blue", value: "#1e88e5" },
   { name: "Silver", value: "#C0C0C0" },
   { name: "Midnight Purple", value: "#2d074f" },
   { name: "Racing Green", value: "#0b3d2e" },
   { name: "Sunburst Orange", value: "#ff6f1a" },
   { name: "Matte Gray", value: "#4a4a4a" },
   { name: "Pearl White", value: "#f5f5f5" },
 ];
 
 const exteriorParts = [
   { id: "spoiler", label: "Spoiler", icon: "🏁" },
   { id: "diffuser", label: "Diffuser", icon: "🌀" },
   { id: "headlights", label: "Headlights", icon: "💡" },
   { id: "grille", label: "Grille", icon: "⬛" },
   { id: "roofrack", label: "Roof Rack", icon: "🧰" },
   { id: "sideSkirts", label: "Side Skirts", icon: "📐" },
 ];
 
 const interiorParts = [
   { id: "seats", label: "Seats", icon: "🪑" },
   { id: "trim", label: "Trim", icon: "🧩" },
   { id: "wheel", label: "Steering", icon: "🛞" },
   { id: "console", label: "Console", icon: "🎛️" },
   { id: "ambient", label: "Ambient Lights", icon: "✨" },
   { id: "alcantara", label: "Alcantara Trim", icon: "🧵" },
 ];
 
 export default function BuildPage() {
  const [activeTab, setActiveTab] = useState("color");
  const [selectedColor, setSelectedColor] = useState("#000000");
  const [selectedExterior, setSelectedExterior] = useState(new Set());
  const [selectedInterior, setSelectedInterior] = useState(new Set());
 
  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#080808", color: "#fff" }}>
      <Box sx={{ height: { xs: 72, md: 84 } }} />
      <Container maxWidth="md" sx={{ py: 2 }}>
         <Stack direction="row" alignItems="center" justifyContent="space-between">
           <Stack direction="row" alignItems="center" spacing={2}>
             <Link href="/dashboard" style={{ textDecoration: "none" }}>
               <Button
                 startIcon={<ArrowBackIcon fontSize="small" />}
                 sx={{ textTransform: "none", color: "rgba(255,255,255,0.8)" }}
               >
                 Back
               </Button>
             </Link>
             <Typography
               sx={{
                 fontSize: 18,
                 fontWeight: 800,
                 fontFamily: "'Barlow Condensed',sans-serif",
               }}
             >
               Car Customization
             </Typography>
           </Stack>
           <Button
             sx={{
               textTransform: "none",
               bgcolor: "#fff",
               color: "#000",
               borderRadius: 1.5,
               px: 2.5,
               "&:hover": { bgcolor: "#e8e8e8" },
             }}
           >
             Save Build
           </Button>
         </Stack>
       </Container>
 
       <Divider sx={{ borderColor: "rgba(255,255,255,0.08)" }} />
 
      <Container maxWidth="md" sx={{ py: 3 }}>
         <Grid container spacing={3}>
          <Grid item xs={12} md={3}>
             <Stack spacing={1}>
               <Typography
                 sx={{
                   fontSize: 10,
                   fontWeight: 800,
                   letterSpacing: "0.16em",
                   textTransform: "uppercase",
                   color: "rgba(255,255,255,0.55)",
                 }}
               >
                 Customize
               </Typography>
               {tabs.map((t) => {
                 const active = activeTab === t.id;
                 return (
                   <Button
                     key={t.id}
                     onClick={() => {
                       setActiveTab(t.id);
                       setSelectedPart(null);
                     }}
                     fullWidth
                     variant={active ? "contained" : "outlined"}
                     sx={{
                       justifyContent: "flex-start",
                       textTransform: "none",
                       fontWeight: 700,
                       letterSpacing: "0.04em",
                       bgcolor: active ? "#fff" : "transparent",
                       color: active ? "#000" : "rgba(255,255,255,0.7)",
                       borderColor: "rgba(255,255,255,0.18)",
                       "&:hover": {
                         borderColor: "rgba(255,255,255,0.35)",
                         bgcolor: active ? "#f2f2f2" : "rgba(255,255,255,0.06)",
                       },
                     }}
                   >
                     {t.label}
                   </Button>
                 );
               })}
             </Stack>
           </Grid>
 
          <Grid item xs={12} md={9}>
             <Stack spacing={3}>
               <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", py: 4 }}>
                 <Box sx={{ position: "relative" }}>
                   <svg width="520" height="260" viewBox="0 0 520 260">
                     <path
                       d="M80 180 Q80 140 120 120 L180 80 Q200 60 240 55 L320 55 Q360 58 380 80 L420 120 Q460 140 460 180 Z"
                       fill={selectedColor}
                       stroke="#fff"
                       strokeWidth="2"
                     />
                     <path
                       d="M180 80 Q195 45 240 40 L310 40 Q355 43 375 80"
                       fill={selectedColor}
                       stroke="#fff"
                       strokeWidth="2"
                       opacity="0.9"
                     />
                     <path d="M190 78 Q200 52 240 48 L270 48 L270 78 Z" fill="#888" stroke="#fff" strokeWidth="1.5" opacity="0.6" />
                     <path d="M280 48 L310 48 Q345 50 365 78 L280 78 Z" fill="#888" stroke="#fff" strokeWidth="1.5" opacity="0.6" />
                     <ellipse cx="440" cy="150" rx="14" ry="10" fill={selectedExterior.has("headlights") ? "#ffd84d" : "#888"} stroke="#fff" strokeWidth="1.5" />
                     <ellipse cx="95" cy="155" rx="10" ry="8" fill="#d22" opacity="0.7" stroke="#fff" strokeWidth="1.5" />
                     <circle cx="370" cy="190" r="32" fill="#fff" />
                     <circle cx="370" cy="190" r="20" fill="#888" />
                     <circle cx="370" cy="190" r="8" fill="#fff" />
                     <circle cx="160" cy="190" r="32" fill="#fff" />
                     <circle cx="160" cy="190" r="20" fill="#888" />
                     <circle cx="160" cy="190" r="8" fill="#fff" />
                     <ellipse cx="265" cy="228" rx="180" ry="8" fill="rgba(255,255,255,0.08)" />
                     <line x1="270" y1="78" x2="270" y2="175" stroke="#fff" strokeWidth="1" opacity="0.3" />
                     <rect x="285" y="120" width="20" height="4" rx="2" fill="#fff" opacity="0.4" />
 
                     {/* Spoiler */}
                     {selectedExterior.has("spoiler") && (
                       <path
                         d="M370 70 L420 76 L415 82 L365 78 Z"
                         fill="#fff"
                         opacity="0.8"
                       />
                     )}
 
                     {/* Diffuser */}
                     {selectedExterior.has("diffuser") && (
                       <rect x="330" y="185" width="90" height="8" rx="3" fill="#111" stroke="#fff" strokeWidth="1" opacity="0.9" />
                     )}
 
                     {/* Grille */}
                     {selectedExterior.has("grille") && (
                       <>
                         <rect x="305" y="105" width="42" height="8" rx="2" fill="#222" stroke="#fff" strokeWidth="0.8" />
                         <line x1="308" y1="107" x2="344" y2="107" stroke="#fff" strokeWidth="0.6" opacity="0.6" />
                         <line x1="308" y1="110" x2="344" y2="110" stroke="#fff" strokeWidth="0.6" opacity="0.6" />
                       </>
                     )}
 
                     {/* Roof rack */}
                     {selectedExterior.has("roofrack") && (
                       <>
                         <rect x="220" y="48" width="48" height="4" rx="2" fill="#fff" />
                         <rect x="290" y="48" width="48" height="4" rx="2" fill="#fff" />
                       </>
                     )}
 
                     {/* Side skirts */}
                     {selectedExterior.has("sideSkirts") && (
                       <>
                         <rect x="120" y="182" width="90" height="4" rx="2" fill="#fff" opacity="0.8" />
                         <rect x="330" y="182" width="90" height="4" rx="2" fill="#fff" opacity="0.8" />
                       </>
                     )}
                   </svg>
                   <Stack
                     direction="row"
                     spacing={1}
                     sx={{
                       position: "absolute",
                       bottom: -16,
                       left: "50%",
                       transform: "translateX(-50%)",
                       bgcolor: "rgba(0,0,0,0.5)",
                       border: "1px solid rgba(255,255,255,0.18)",
                       borderRadius: 9999,
                       px: 1.5,
                       py: 0.5,
                     }}
                   >
                     <Box
                       sx={{
                         width: 10,
                         height: 10,
                         borderRadius: "50%",
                         border: "1px solid rgba(255,255,255,0.3)",
                         bgcolor: selectedColor,
                       }}
                     />
                     <Typography sx={{ fontSize: 11, color: "rgba(255,255,255,0.8)" }}>
                       {colors.find((c) => c.value === selectedColor)?.name || "Custom"}
                     </Typography>
                   </Stack>
                 </Box>
               </Box>
 
               <Divider sx={{ borderColor: "rgba(255,255,255,0.08)" }} />
 
               {activeTab === "color" && (
                 <Box>
                   <Typography
                     sx={{
                       fontSize: 12,
                       fontWeight: 800,
                       letterSpacing: "0.14em",
                       textTransform: "uppercase",
                       color: "rgba(255,255,255,0.6)",
                       mb: 2,
                     }}
                   >
                     Choose Color
                   </Typography>
                   <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap", justifyContent: "center" }}>
                     {colors.map((c) => (
                       <Button
                         key={c.value}
                         onClick={() => setSelectedColor(c.value)}
                         sx={{
                           minWidth: 48,
                           width: 48,
                           height: 48,
                           p: 0,
                           borderRadius: 2,
                           border: selectedColor === c.value ? "2px solid #fff" : "2px solid rgba(255,255,255,0.25)",
                           bgcolor: c.value,
                           "&:hover": {
                             transform: "scale(1.06)",
                             boxShadow: "0 10px 24px rgba(0,0,0,0.4)",
                           },
                           transition: "all 200ms ease",
                         }}
                         title={c.name}
                       />
                     ))}
                   </Box>
                 </Box>
               )}
 
               {activeTab === "exterior" && (
                 <Box>
                   <Typography
                     sx={{
                       fontSize: 12,
                       fontWeight: 800,
                       letterSpacing: "0.14em",
                       textTransform: "uppercase",
                       color: "rgba(255,255,255,0.6)",
                       mb: 2,
                     }}
                   >
                     Exterior Body Parts
                   </Typography>
                   <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", justifyContent: "center" }}>
                     {exteriorParts.map((p) => {
                       const active = selectedExterior.has(p.id);
                       return (
                         <Chip
                           key={p.id}
                           label={
                             <Stack direction="row" alignItems="center" spacing={1}>
                               <Box component="span" sx={{ fontSize: 16 }}>{p.icon}</Box>
                               <Box component="span">{p.label}</Box>
                             </Stack>
                           }
                           onClick={() => {
                             const next = new Set(selectedExterior);
                             if (next.has(p.id)) next.delete(p.id);
                             else next.add(p.id);
                             setSelectedExterior(next);
                           }}
                           variant={active ? "filled" : "outlined"}
                           sx={{
                             px: 1,
                             py: 1,
                             borderRadius: 2,
                             bgcolor: active ? "#fff" : "transparent",
                             color: active ? "#000" : "rgba(255,255,255,0.85)",
                             borderColor: "rgba(255,255,255,0.18)",
                             "&:hover": {
                               borderColor: "rgba(255,255,255,0.35)",
                               bgcolor: active ? "#f2f2f2" : "rgba(255,255,255,0.06)",
                             },
                           }}
                         />
                       );
                     })}
                   </Box>
                 </Box>
               )}
 
               {activeTab === "interior" && (
                 <Box>
                   <Typography
                     sx={{
                       fontSize: 12,
                       fontWeight: 800,
                       letterSpacing: "0.14em",
                       textTransform: "uppercase",
                       color: "rgba(255,255,255,0.6)",
                       mb: 2,
                     }}
                   >
                     Interior Body Parts
                   </Typography>
                   <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", justifyContent: "center" }}>
                     {interiorParts.map((p) => {
                       const active = selectedInterior.has(p.id);
                       return (
                         <Chip
                           key={p.id}
                           label={
                             <Stack direction="row" alignItems="center" spacing={1}>
                               <Box component="span" sx={{ fontSize: 16 }}>{p.icon}</Box>
                               <Box component="span">{p.label}</Box>
                             </Stack>
                           }
                           onClick={() => {
                             const next = new Set(selectedInterior);
                             if (next.has(p.id)) next.delete(p.id);
                             else next.add(p.id);
                             setSelectedInterior(next);
                           }}
                           variant={active ? "filled" : "outlined"}
                           sx={{
                             px: 1,
                             py: 1,
                             borderRadius: 2,
                             bgcolor: active ? "#fff" : "transparent",
                             color: active ? "#000" : "rgba(255,255,255,0.85)",
                             borderColor: "rgba(255,255,255,0.18)",
                             "&:hover": {
                               borderColor: "rgba(255,255,255,0.35)",
                               bgcolor: active ? "#f2f2f2" : "rgba(255,255,255,0.06)",
                             },
                           }}
                         />
                       );
                     })}
                   </Box>
                 </Box>
               )}
             </Stack>
           </Grid>
         </Grid>
       </Container>
     </Box>
   );
 }
