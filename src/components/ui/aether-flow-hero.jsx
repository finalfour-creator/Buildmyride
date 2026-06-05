"use client";
import React from "react";
import { motion } from "framer-motion";
import { ArrowRight, Zap } from "lucide-react";
import { Box, Container, Typography, Button, Chip } from "@mui/material";

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
            let numberOfParticles = (canvas.height * canvas.width) / 9000;
            for (let i = 0; i < numberOfParticles; i++) {
                let size = Math.random() * 2 + 1;
                let x = Math.random() * (innerWidth - size * 2) + size * 2;
                let y = Math.random() * (innerHeight - size * 2) + size * 2;
                let directionX = Math.random() * 0.4 - 0.2;
                let directionY = Math.random() * 0.4 - 0.2;
                // Use your brand colors for particles
                let colors = ["rgba(44,83,100,0.8)", "rgba(32,58,67,0.7)", "rgba(15,32,39,0.6)"];
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
            let opacityValue = 1;
            for (let a = 0; a < particles.length; a++) {
                for (let b = a; b < particles.length; b++) {
                    let distance = (particles[a].x - particles[b].x) * (particles[a].x - particles[b].x)
                        + (particles[a].y - particles[b].y) * (particles[a].y - particles[b].y);
                    
                    if (distance < (canvas.width / 7) * (canvas.height / 7)) {
                        opacityValue = 1 - distance / 20000;
                        
                        let dx_mouse_a = particles[a].x - mouse.x;
                        let dy_mouse_a = particles[a].y - mouse.y;
                        let distance_mouse_a = Math.sqrt(dx_mouse_a * dx_mouse_a + dy_mouse_a * dy_mouse_a);

                        if (mouse.x && distance_mouse_a < mouse.radius) {
                            ctx.strokeStyle = `rgba(44,83,100, ${opacityValue})`;
                        } else {
                            ctx.strokeStyle = `rgba(44,83,100, ${opacityValue * 0.6})`;
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
            // Use your brand gradient for background
            ctx.fillStyle = "#0f2027";
            ctx.fillRect(0, 0, innerWidth, innerHeight);
            
            // Add subtle gradient overlay
            const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
            gradient.addColorStop(0, "rgba(15,32,39,0.8)");
            gradient.addColorStop(1, "rgba(44,83,100,0.6)");
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, innerWidth, innerHeight);

            for (let i = 0; i < particles.length; i++) {
                particles[i].update();
            }
            connect();
        };
        
        const handleMouseMove = (event) => {
            mouse.x = event.clientX;
            mouse.y = event.clientY;
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
        hidden: { opacity: 0, y: 20 },
        visible: (i) => ({
            opacity: 1,
            y: 0,
            transition: {
                delay: i * 0.2 + 0.5,
                duration: 0.8,
                ease: "easeInOut",
            },
        }),
    };

    return (
        <Box
            sx={{
                position: "relative",
                height: "100vh",
                width: "100%",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                overflow: "hidden",
                backgroundColor: "#0f2027",
            }}
        >
            <canvas
                ref={canvasRef}
                style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "100%",
                }}
            />

            <Box
                sx={{
                    position: "relative",
                    zIndex: 10,
                    textAlign: "center",
                    px: { xs: 3, md: 6 },
                    maxWidth: "1200px",
                    mx: "auto",
                }}
            >
                <motion.div
                    custom={0}
                    variants={fadeUpVariants}
                    initial="hidden"
                    animate="visible"
                >
                    <Chip
                        icon={<Zap size={14} />}
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

                <motion.div
                    custom={1}
                    variants={fadeUpVariants}
                    initial="hidden"
                    animate="visible"
                >
                    <Typography
                        variant="h1"
                        sx={{
                            fontSize: { xs: "2.5rem", sm: "3.5rem", md: "5rem", lg: "5.5rem" },
                            fontWeight: 700,
                            background: "linear-gradient(135deg, #ffffff, #2c5364, #4a7c9c)",
                            backgroundClip: "text",
                            WebkitBackgroundClip: "text",
                            color: "transparent",
                            mb: 3,
                            letterSpacing: "-0.02em",
                            lineHeight: 1.1,
                        }}
                    >
                        Build Your
                        <br />
                        Dream Ride
                    </Typography>
                </motion.div>

                <motion.div
                    custom={2}
                    variants={fadeUpVariants}
                    initial="hidden"
                    animate="visible"
                >
                    <Typography
                        variant="body1"
                        sx={{
                            fontSize: { xs: "1rem", sm: "1.125rem", md: "1.25rem" },
                            color: "#cbd5e1",
                            maxWidth: "650px",
                            mx: "auto",
                            mb: 5,
                            lineHeight: 1.6,
                        }}
                    >
                        Pakistan's first car customization platform. Design, visualize, and save your perfect vehicle in stunning 3D.
                    </Typography>
                </motion.div>

                <motion.div
                    custom={3}
                    variants={fadeUpVariants}
                    initial="hidden"
                    animate="visible"
                >
                    <Box sx={{ display: "flex", gap: 2, justifyContent: "center", flexWrap: "wrap" }}>
                        <Button
                            href="/customize"
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
                        <Button
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
                        </Button>
                    </Box>
                </motion.div>

                <motion.div
                    custom={4}
                    variants={fadeUpVariants}
                    initial="hidden"
                    animate="visible"
                    style={{ marginTop: "3rem" }}
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
        </Box>
    );
};

export default AetherFlowHero;