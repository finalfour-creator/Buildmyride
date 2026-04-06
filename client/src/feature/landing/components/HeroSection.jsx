"use client";
import React from "react";
import { motion } from "framer-motion";
import { ArrowRight, Zap } from "lucide-react";
import { Box, Container, Typography, Button, Chip } from "@mui/material";
import Link from "next/link";

const AetherFlowHero = () => {
    const canvasRef = React.useRef(null);

    React.useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        
        const ctx = canvas.getContext("2d");
        let animationFrameId;
        let particles = [];
        const mouse = { x: null, y: null, radius: 200 };

        class Particle {
            constructor(x, y, directionX, directionY, size, color) {
                this.x = x;
                this.y = y;
                this.directionX = directionX;
                this.directionY = directionY;
                this.size = size;
                this.color = color;
            }

            draw() {
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2, false);
                ctx.fillStyle = this.color;
                ctx.fill();
            }

            update() {
                if (this.x > canvas.width || this.x < 0) {
                    this.directionX = -this.directionX;
                }
                if (this.y > canvas.height || this.y < 0) {
                    this.directionY = -this.directionY;
                }

                if (mouse.x !== null && mouse.y !== null) {
                    let dx = mouse.x - this.x;
                    let dy = mouse.y - this.y;
                    let distance = Math.sqrt(dx * dx + dy * dy);
                    if (distance < mouse.radius + this.size) {
                        const forceDirectionX = dx / distance;
                        const forceDirectionY = dy / distance;
                        const force = (mouse.radius - distance) / mouse.radius;
                        this.x -= forceDirectionX * force * 5;
                        this.y -= forceDirectionY * force * 5;
                    }
                }

                this.x += this.directionX;
                this.y += this.directionY;
                this.draw();
            }
        }

        function init() {
            particles = [];
            let numberOfParticles = Math.min(800, Math.floor((canvas.height * canvas.width) / 9000));
            for (let i = 0; i < numberOfParticles; i++) {
                let size = Math.random() * 2 + 1;
                let x = Math.random() * canvas.width;
                let y = Math.random() * canvas.height;
                let directionX = (Math.random() - 0.5) * 0.4;
                let directionY = (Math.random() - 0.5) * 0.4;
                // Brand colors for particles
                let colors = [
                    "rgba(44,83,100,0.9)",
                    "rgba(32,58,67,0.8)",
                    "rgba(15,32,39,0.7)",
                    "rgba(74,124,156,0.9)"
                ];
                let color = colors[Math.floor(Math.random() * colors.length)];
                particles.push(new Particle(x, y, directionX, directionY, size, color));
            }
        }

        const resizeCanvas = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            init();
        };
        
        window.addEventListener("resize", resizeCanvas);
        resizeCanvas();

        const connect = () => {
            for (let a = 0; a < particles.length; a++) {
                for (let b = a; b < particles.length; b++) {
                    let dx = particles[a].x - particles[b].x;
                    let dy = particles[a].y - particles[b].y;
                    let distance = dx * dx + dy * dy;
                    let maxDistance = (canvas.width / 8) * (canvas.height / 8);
                    
                    if (distance < maxDistance) {
                        let opacityValue = 1 - distance / maxDistance;
                        
                        let dx_mouse_a = particles[a].x - mouse.x;
                        let dy_mouse_a = particles[a].y - mouse.y;
                        let distance_mouse_a = Math.sqrt(dx_mouse_a * dx_mouse_a + dy_mouse_a * dy_mouse_a);

                        if (mouse.x !== null && distance_mouse_a < mouse.radius) {
                            ctx.strokeStyle = `rgba(44,83,100, ${opacityValue * 0.8})`;
                        } else {
                            ctx.strokeStyle = `rgba(44,83,100, ${opacityValue * 0.5})`;
                        }
                        
                        ctx.lineWidth = 0.8;
                        ctx.beginPath();
                        ctx.moveTo(particles[a].x, particles[a].y);
                        ctx.lineTo(particles[b].x, particles[b].y);
                        ctx.stroke();
                    }
                }
            }
        };

        const animate = () => {
            animationFrameId = requestAnimationFrame(animate);
            
            // Gradient background with brand colors
            const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
            gradient.addColorStop(0, "#0f2027");
            gradient.addColorStop(0.5, "#203a43");
            gradient.addColorStop(1, "#2c5364");
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            for (let i = 0; i < particles.length; i++) {
                particles[i].update();
            }
            connect();
        };
        
        const handleMouseMove = (event) => {
            const rect = canvas.getBoundingClientRect();
            mouse.x = event.clientX - rect.left;
            mouse.y = event.clientY - rect.top;
        };
        
        const handleMouseOut = () => {
            mouse.x = null;
            mouse.y = null;
        };

        window.addEventListener("mousemove", handleMouseMove);
        window.addEventListener("mouseout", handleMouseOut);

        init();
        animate();

        return () => {
            window.removeEventListener("resize", resizeCanvas);
            window.removeEventListener("mousemove", handleMouseMove);
            window.removeEventListener("mouseout", handleMouseOut);
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

    const fadeUpVariants = {
        hidden: { opacity: 0, y: 30 },
        visible: (i) => ({
            opacity: 1,
            y: 0,
            transition: {
                delay: 0.3 + i * 0.15,
                duration: 0.8,
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
                backgroundColor: "#0f2027",
            }}
        >
            {/* Particle Canvas Background */}
            <canvas
                ref={canvasRef}
                style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "100%",
                    display: "block",
                }}
            />

            {/* Overlay Gradient */}
            <Box
                sx={{
                    position: "absolute",
                    inset: 0,
                    background: "radial-gradient(circle at center, transparent 0%, rgba(15,32,39,0.4) 100%)",
                    pointerEvents: "none",
                }}
            />

            {/* Main Content */}
            <Container maxWidth="lg" sx={{ position: "relative", zIndex: 10, textAlign: "center", px: { xs: 2, md: 4 } }}>
                <Box sx={{ maxWidth: "1000px", mx: "auto" }}>
                    {/* Badge */}
                    <motion.div
                        custom={0}
                        initial="hidden"
                        animate="visible"
                        variants={fadeUpVariants}
                    >
                        <Chip
                            icon={<Zap size={14} style={{ color: "#2c5364" }} />}
                            label="BUILDMYRIDE"
                            sx={{
                                backgroundColor: "rgba(44,83,100,0.2)",
                                border: "1px solid rgba(44,83,100,0.3)",
                                color: "#e2e8f0",
                                mb: 4,
                                py: 1,
                                px: 1,
                                fontSize: "0.85rem",
                                fontWeight: 500,
                                letterSpacing: "0.5px",
                                "& .MuiChip-icon": { color: "#2c5364", marginLeft: 1 },
                            }}
                        />
                    </motion.div>

                    {/* Main Heading */}
                    <motion.div
                        custom={1}
                        initial="hidden"
                        animate="visible"
                        variants={fadeUpVariants}
                    >
                        <Typography
                            variant="h1"
                            sx={{
                                // fontSize: { xs: "2.5rem", sm: "3.5rem", md: "5rem", lg: "5.5rem" },
                                fontSize: { xs: "2.2rem", sm: "3.2rem", md: "4.5rem", lg: "5rem" },
                                fontWeight: 700,
                                color: "#ffffff",
                                mb: 2,
                                letterSpacing: "-0.02em",
                                lineHeight: 1.1,
                                textShadow: "0 0 30px rgba(0,0,0,0.3)",
                            }}
                        >
                            Build Your dream Ride
                            <br />
                            <Typography
                                component="span"
                                sx={{
                                    background: "linear-gradient(135deg, #ffffff, #2c5364, #4a7c9c)",
                                    backgroundClip: "text",
                                    WebkitBackgroundClip: "text",
                                    color: "transparent",
                                    display: "inline-block",
                                }}
                            >
                                {/* Dream Ride */}
                            </Typography>
                        </Typography>
                    </motion.div>

                    {/* Description */}
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
                                color: "#cbd5e1",
                                maxWidth: "650px",
                                mx: "auto",
                                mb: 4,
                                lineHeight: 1.6,
                                px: { xs: 2, sm: 0 },
                            }}
                        >
                            Pakistan's first car customization platform. Design, visualize, and save your perfect vehicle in stunning 3D.
                        </Typography>
                    </motion.div>

                    {/* CTA Buttons */}
                    <motion.div
                        custom={3}
                        initial="hidden"
                        animate="visible"
                        variants={fadeUpVariants}
                        style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}
                    >
                        <Button
                            component={Link}
                            href="/login"
                            variant="contained"
                            size="large"
                            endIcon={<ArrowRight size={18} />}
                            sx={{
                                background: "linear-gradient(135deg, #0f2027, #2c5364)",
                                px: { xs: 3, sm: 5 },
                                py: { xs: 1.2, sm: 1.5 },
                                fontSize: { xs: "0.9rem", sm: "1rem" },
                                fontWeight: 600,
                                borderRadius: "40px",
                                textTransform: "none",
                                "&:hover": {
                                    background: "linear-gradient(135deg, #2c5364, #0f2027)",
                                    transform: "scale(1.02)",
                                },
                                transition: "all 0.3s ease",
                            }}
                        >
                            Start Building
                        </Button>
                        {/* <Button
                            component={Link}
                            href="/ar-view"
                            variant="outlined"
                            size="large"
                            sx={{
                                borderColor: "#ffffff",
                                color: "#ffffff",
                                px: { xs: 3, sm: 5 },
                                py: { xs: 1.2, sm: 1.5 },
                                fontSize: { xs: "0.9rem", sm: "1rem" },
                                fontWeight: 600,
                                borderRadius: "40px",
                                textTransform: "none",
                                "&:hover": {
                                    borderColor: "#2c5364",
                                    backgroundColor: "rgba(44,83,100,0.2)",
                                    transform: "scale(1.02)",
                                },
                                transition: "all 0.3s ease",
                            }}
                        >
                            AR Preview
                        </Button> */}
                    </motion.div>

                    {/* Scroll Indicator */}
                    <motion.div
                        custom={4}
                        initial="hidden"
                        animate="visible"
                        variants={fadeUpVariants}
                        style={{ marginTop: "4rem" }}
                    >
                        <Box
                            sx={{
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                gap: 1,
                                opacity: 0.6,
                            }}
                        >
                            <Typography
                                variant="caption"
                                sx={{
                                    fontSize: "0.7rem",
                                    letterSpacing: "2px",
                                    color: "#94a3b8",
                                    textTransform: "uppercase",
                                }}
                            >
                                Scroll to explore
                            </Typography>
                            <Box
                                sx={{
                                    width: "1px",
                                    height: "40px",
                                    background: "linear-gradient(to bottom, #2c5364, transparent)",
                                }}
                            />
                        </Box>
                    </motion.div>
                </Box>
            </Container>
        </Box>
    );
};

export default AetherFlowHero;