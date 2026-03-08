 "use client";
 
 import Link from "next/link";
 import Box from "@mui/material/Box";
 import Container from "@mui/material/Container";
 import Grid from "@mui/material/Grid";
 import Card from "@mui/material/Card";
 import CardActionArea from "@mui/material/CardActionArea";
 import CardContent from "@mui/material/CardContent";
 import Typography from "@mui/material/Typography";
 import Stack from "@mui/material/Stack";
 import Chip from "@mui/material/Chip";
 import Button from "@mui/material/Button";
 import ChevronRightIcon from "@mui/icons-material/ChevronRight";
 import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";
 import ColorLensIcon from "@mui/icons-material/ColorLens";
 import SmartphoneIcon from "@mui/icons-material/Smartphone";
 import VisibilityIcon from "@mui/icons-material/Visibility";
 import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
 import AutorenewIcon from "@mui/icons-material/Autorenew";
 import LogoutIcon from "@mui/icons-material/Logout";
 
 const features = [
   {
     id: "customize",
     title: "Car Customization",
     desc: "Design your dream car with advanced color, wheel, and package options.",
     stats: "50+ Options",
     href: "/build",
     Icon: ColorLensIcon,
   },
   {
     id: "ar",
     title: "AR Preview",
     desc: "See your customized car in augmented reality, right in your space.",
     stats: "Real-time 3D",
     href: "/ar",
     Icon: SmartphoneIcon,
   },
 ];
 
 const quickActions = [
   { label: "View Models", Icon: DirectionsCarIcon, href: "/explore" },
   { label: "Compare", Icon: VisibilityIcon, href: "/explore" },
   { label: "Reset", Icon: AutorenewIcon, href: "/dashboard" },
   { label: "Inspire Me", Icon: AutoAwesomeIcon, href: "/explore" },
 ];
 
 export default function DashboardPage() {
   return (
     <Box sx={{ minHeight: "100vh", bgcolor: "#080808" }}>
      <Box sx={{ borderBottom: "1px solid rgba(255,255,255,0.08)", bgcolor: "#0a0a0a" }}>
        <Container maxWidth="lg" sx={{ py: { xs: 6, md: 8 } }}>
 
           <Box sx={{ mt: 3 }}>
            <Typography sx={{ fontSize: 12, color: "rgba(255,255,255,0.55)", fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase" }}>Dashboard</Typography>
             <Typography
               sx={{
                 mt: 1,
                 fontSize: { xs: 32, md: 44 },
                 fontWeight: 900,
                 color: "#fff",
                 fontFamily: "'Barlow Condensed',sans-serif",
               }}
             >
               Build Your Vision
             </Typography>
             <Typography sx={{ mt: 1, color: "rgba(255,255,255,0.6)" }}>
               Customize every detail and preview it in augmented reality before it&apos;s real.
             </Typography>
           </Box>
         </Container>
       </Box>
 
       <Container maxWidth="lg" sx={{ py: { xs: 4, md: 6 } }}>
         <Grid container spacing={3}>
           {features.map(({ id, title, desc, stats, href, Icon }) => (
             <Grid item xs={12} sm={6} key={id}>
               <Card
                 sx={{
                   bgcolor: "#101010",
                   border: "1px solid rgba(255,255,255,0.08)",
                   borderRadius: 2,
                 }}
               >
                 <Link href={href} style={{ textDecoration: "none" }}>
                   <CardActionArea
                     sx={{
                       p: 2.5,
                       "&:hover": {
                         transform: "translateY(-2px)",
                       },
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
                           }}
                         >
                           <Icon sx={{ color: "#000" }} />
                         </Box>
                         <Typography
                           sx={{
                             fontSize: 22,
                             fontWeight: 800,
                             color: "#fff",
                             fontFamily: "'Barlow Condensed',sans-serif",
                           }}
                         >
                           {title}
                         </Typography>
                       </Box>
 
                       <Chip
                         label={stats}
                         size="small"
                         sx={{
                           alignSelf: "flex-start",
                           fontSize: 11,
                           fontWeight: 700,
                           letterSpacing: "0.1em",
                           textTransform: "uppercase",
                           color: "rgba(255,255,255,0.7)",
                           bgcolor: "rgba(255,255,255,0.08)",
                           border: "1px solid rgba(255,255,255,0.14)",
                         }}
                       />
 
                       <Typography sx={{ color: "rgba(255,255,255,0.7)" }}>{desc}</Typography>
 
                       <Stack direction="row" alignItems="center" spacing={0.5} sx={{ color: "#fff" }}>
                         <Typography sx={{ fontWeight: 700, fontSize: 14 }}>Get Started</Typography>
                         <ChevronRightIcon fontSize="small" />
                       </Stack>
                     </Stack>
                   </CardActionArea>
                 </Link>
               </Card>
             </Grid>
           ))}
         </Grid>
 
         <Box sx={{ mt: 6 }}>
           <Typography
             sx={{
               fontSize: 12,
               fontWeight: 700,
               letterSpacing: "0.18em",
               textTransform: "uppercase",
               color: "rgba(255,255,255,0.55)",
             }}
           >
             Quick Actions
           </Typography>
           <Grid container spacing={2} sx={{ mt: 2 }}>
             {quickActions.map(({ label, Icon, href }) => (
               <Grid item xs={6} sm={3} key={label}>
                 <Link href={href} style={{ textDecoration: "none" }}>
                   <Button
                     fullWidth
                     variant="outlined"
                     startIcon={<Icon fontSize="small" />}
                     sx={{
                       textTransform: "none",
                       color: "rgba(255,255,255,0.85)",
                       borderColor: "rgba(255,255,255,0.18)",
                       bgcolor: "rgba(255,255,255,0.06)",
                       backdropFilter: "blur(6px)",
                       "&:hover": {
                         borderColor: "rgba(255,255,255,0.35)",
                         bgcolor: "rgba(255,255,255,0.1)",
                       },
                     }}
                   >
                     {label}
                   </Button>
                 </Link>
               </Grid>
             ))}
           </Grid>
         </Box>
       </Container>
     </Box>
   );
 }
