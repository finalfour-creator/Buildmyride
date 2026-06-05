"use client";
import { motion } from "framer-motion";
import { Circle } from "lucide-react";
import { Box, Container, Typography, Button, Chip } from "@mui/material";

function ElegantShape({
    className,
    delay = 0,
    width = 400,
    height = 100,
    rotate = 0,
    gradient = "from-white/[0.08]",
    style = {},
}) {
    return (
        <motion.div
            initial={{
                opacity: 0,
                y: -150,
                rotate: rotate - 15,
            }}
            animate={{
                opacity: 1,
                y: 0,
                rotate: rotate,
            }}
            transition={{
                duration: 2.4,
                delay,
                ease: [0.23, 0.86, 0.39, 0.96],
                opacity: { duration: 1.2 },
            }}
            style={{
                position: "absolute",
                ...style,
            }}
            className={className}
        >
            <motion.div
                animate={{
                    y: [0, 15, 0],
                }}
                transition={{
                    duration: 12,
                    repeat: Infinity,
                    ease: "easeInOut",
                }}
                style={{
                    width,
                    height,
                    position: "relative",
                }}
            >
                <Box
                    sx={{
                        position: "absolute",
                        inset: 0,
                        borderRadius: "50%",
                        background: `linear-gradient(to right, ${gradient}, transparent)`,
                        backdropFilter: "blur(2px)",
                        border: "2px solid rgba(255,255,255,0.15)",
                        boxShadow: "0 8px 32px 0 rgba(255,255,255,0.1)",
                        "&::after": {
                            content: '""',
                            position: "absolute",
                            inset: 0,
                            borderRadius: "50%",
                            background: "radial-gradient(circle at 50% 50%, rgba(255,255,255,0.2), transparent 70%)",
                        },
                    }}
                />
            </motion.div>
        </motion.div>
    );
}

export function HeroGeometric({
    badge = "BuildMyRide",
    title1 = "Build Your",
    title2 = "Dream Ride",
    description = "Pakistan's first car customization platform. Design, visualize, and save your perfect vehicle.",
}) {
    const fadeUpVariants = {
        hidden: { opacity: 0, y: 30 },
        visible: (i) => ({
            opacity: 1,
            y: 0,
            transition: {
                duration: 1,
                delay: 0.5 + i * 0.2,
                ease: [0.25, 0.4, 0.25, 1],
            },
        }),
    };

    return (
        <Box
            sx={{
                position: "relative",
                minHeight: "100vh",
                width: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                overflow: "hidden",
                background: "linear-gradient(135deg, #fefcf8 0%, #f5f0ea 100%)",
            }}
        >
            {/* Animated Shapes */}
            <Box sx={{ position: "absolute", inset: 0, overflow: "hidden" }}>
                <ElegantShape
                    delay={0.3}
                    width={600}
                    height={140}
                    rotate={12}
                    gradient="rgba(44,83,100,0.1)"
                    style={{ left: "-10%", top: "15%" }}
                />
                <ElegantShape
                    delay={0.5}
                    width={500}
                    height={120}
                    rotate={-15}
                    gradient="rgba(32,58,67,0.1)"
                    style={{ right: "-5%", top: "70%" }}
                />
                <ElegantShape
                    delay={0.4}
                    width={300}
                    height={80}
                    rotate={-8}
                    gradient="rgba(15,32,39,0.1)"
                    style={{ left: "5%", bottom: "5%" }}
                />
                <ElegantShape
                    delay={0.6}
                    width={200}
                    height={60}
                    rotate={20}
                    gradient="rgba(44,83,100,0.08)"
                    style={{ right: "15%", top: "10%" }}
                />
                <ElegantShape
                    delay={0.7}
                    width={150}
                    height={40}
                    rotate={-25}
                    gradient="rgba(32,58,67,0.08)"
                    style={{ left: "20%", top: "5%" }}
                />
            </Box>

            <Container maxWidth="lg" sx={{ position: "relative", zIndex: 10, textAlign: "center" }}>
                <Box sx={{ maxWidth: "900px", mx: "auto" }}>
                    <motion.div
                        custom={0}
                        initial="hidden"
                        animate="visible"
                        variants={fadeUpVariants}
                    >
                        <Chip
                            icon={<Circle size={12} style={{ fill: "#2c5364", color: "#2c5364" }} />}
                            label={badge}
                            sx={{
                                backgroundColor: "rgba(44,83,100,0.05)",
                                border: "1px solid rgba(44,83,100,0.1)",
                                color: "#2c5364",
                                mb: 4,
                                "& .MuiChip-icon": { color: "#2c5364" },
                            }}
                        />
                    </motion.div>

                    <motion.div
                        custom={1}
                        initial="hidden"
                        animate="visible"
                        variants={fadeUpVariants}
                    >
                        <Typography
                            variant="h1"
                            sx={{
                                fontSize: { xs: "2.5rem", sm: "3.5rem", md: "5rem", lg: "6rem" },
                                fontWeight: 700,
                                color: "#1a2a32",
                                mb: 2,
                                letterSpacing: "-0.02em",
                            }}
                        >
                            {title1}
                            <br />
                            <Typography
                                component="span"
                                sx={{
                                    background: "linear-gradient(135deg, #2c5364, #203a43, #0f2027)",
                                    backgroundClip: "text",
                                    WebkitBackgroundClip: "text",
                                    color: "transparent",
                                }}
                            >
                                {title2}
                            </Typography>
                        </Typography>
                    </motion.div>

                    <motion.div
                        custom={2}
                        initial="hidden"
                        animate="visible"
                        variants={fadeUpVariants}
                    >
                        <Typography
                            variant="body1"
                            sx={{
                                fontSize: { xs: "1rem", sm: "1.125rem", md: "1.25rem" },
                                color: "#6b7c88",
                                maxWidth: "600px",
                                mx: "auto",
                                mb: 4,
                                lineHeight: 1.6,
                            }}
                        >
                            {description}
                        </Typography>
                    </motion.div>

                    <motion.div
                        custom={3}
                        initial="hidden"
                        animate="visible"
                        variants={fadeUpVariants}
                        style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}
                    >
                        <Button
                            variant="contained"
                            size="large"
                            sx={{
                                background: "linear-gradient(135deg, #0f2027, #2c5364)",
                                px: 4,
                                py: 1.5,
                                fontSize: "1rem",
                                fontWeight: 600,
                                "&:hover": { opacity: 0.9 },
                            }}
                        >
                            Start Building
                        </Button>
                        <Button
                            variant="outlined"
                            size="large"
                            sx={{
                                borderColor: "#2c5364",
                                color: "#2c5364",
                                px: 4,
                                py: 1.5,
                                fontSize: "1rem",
                                fontWeight: 600,
                                "&:hover": { borderColor: "#2c5364", backgroundColor: "rgba(44,83,100,0.05)" },
                            }}
                        >
                            AR Preview
                        </Button>
                    </motion.div>
                </Box>
            </Container>

            <Box
                sx={{
                    position: "absolute",
                    inset: 0,
                    background: "linear-gradient(to top, #fefcf8, transparent, #fefcf8/80)",
                    pointerEvents: "none",
                }}
            />
        </Box>
    );
}