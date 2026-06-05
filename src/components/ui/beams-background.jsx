"use client";
import { useEffect, useRef } from "react";
import { motion } from "motion/react";
import { Box } from "@mui/material";

function createBeam(width, height) {
    const angle = -35 + Math.random() * 10;
    return {
        x: Math.random() * width * 1.5 - width * 0.25,
        y: Math.random() * height * 1.5 - height * 0.25,
        width: 30 + Math.random() * 60,
        length: height * 2.5,
        angle: angle,
        speed: 0.6 + Math.random() * 1.2,
        opacity: 0.12 + Math.random() * 0.16,
        hue: 190 + Math.random() * 70,
        pulse: Math.random() * Math.PI * 2,
        pulseSpeed: 0.02 + Math.random() * 0.03,
    };
}

export function BeamsBackground({
    className,
    intensity = "strong",
    sx = {},
}) {
    const canvasRef = useRef(null);
    const beamsRef = useRef([]);
    const animationFrameRef = useRef(0);
    const MINIMUM_BEAMS = 20;

    const opacityMap = {
        subtle: 0.7,
        medium: 0.85,
        strong: 1,
    };

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const updateCanvasSize = () => {
            const dpr = window.devicePixelRatio || 1;
            canvas.width = window.innerWidth * dpr;
            canvas.height = window.innerHeight * dpr;
            canvas.style.width = `${window.innerWidth}px`;
            canvas.style.height = `${window.innerHeight}px`;
            ctx.scale(dpr, dpr);

            const totalBeams = MINIMUM_BEAMS * 1.5;
            beamsRef.current = Array.from({ length: totalBeams }, () =>
                createBeam(canvas.width, canvas.height)
            );
        };

        updateCanvasSize();
        window.addEventListener("resize", updateCanvasSize);

        function resetBeam(beam, index, totalBeams) {
            if (!canvas) return beam;

            const column = index % 3;
            const spacing = canvas.width / 3;

            beam.y = canvas.height + 100;
            beam.x =
                column * spacing +
                spacing / 2 +
                (Math.random() - 0.5) * spacing * 0.5;
            beam.width = 100 + Math.random() * 100;
            beam.speed = 0.5 + Math.random() * 0.4;
            // Use your brand colors for hues
            beam.hue = 190 + (index * 70) / totalBeams;
            beam.opacity = 0.2 + Math.random() * 0.1;
            return beam;
        }

        function drawBeam(ctx, beam) {
            ctx.save();
            ctx.translate(beam.x, beam.y);
            ctx.rotate((beam.angle * Math.PI) / 180);

            // Calculate pulsing opacity
            const pulsingOpacity =
                beam.opacity *
                (0.8 + Math.sin(beam.pulse) * 0.2) *
                opacityMap[intensity];

            const gradient = ctx.createLinearGradient(0, 0, 0, beam.length);

            // Use your brand colors (#0f2027, #203a43, #2c5364)
            // Convert hex to HSL values
            // #0f2027 -> hue: 195, saturation: 45%, lightness: 11%
            // #203a43 -> hue: 195, saturation: 36%, lightness: 19%
            // #2c5364 -> hue: 195, saturation: 40%, lightness: 28%
            
            gradient.addColorStop(0, `hsla(195, 45%, 11%, 0)`);
            gradient.addColorStop(
                0.1,
                `hsla(195, 45%, 11%, ${pulsingOpacity * 0.5})`
            );
            gradient.addColorStop(
                0.4,
                `hsla(195, 40%, 20%, ${pulsingOpacity})`
            );
            gradient.addColorStop(
                0.6,
                `hsla(195, 38%, 25%, ${pulsingOpacity})`
            );
            gradient.addColorStop(
                0.9,
                `hsla(195, 40%, 20%, ${pulsingOpacity * 0.5})`
            );
            gradient.addColorStop(1, `hsla(195, 45%, 11%, 0)`);

            ctx.fillStyle = gradient;
            ctx.fillRect(-beam.width / 2, 0, beam.width, beam.length);
            ctx.restore();
        }

        function animate() {
            if (!canvas || !ctx) return;

            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.filter = "blur(35px)";

            const totalBeams = beamsRef.current.length;
            beamsRef.current.forEach((beam, index) => {
                beam.y -= beam.speed;
                beam.pulse += beam.pulseSpeed;

                // Reset beam when it goes off screen
                if (beam.y + beam.length < -100) {
                    resetBeam(beam, index, totalBeams);
                }

                drawBeam(ctx, beam);
            });

            animationFrameRef.current = requestAnimationFrame(animate);
        }

        animate();

        return () => {
            window.removeEventListener("resize", updateCanvasSize);
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
        };
    }, [intensity]);

    return (
        <Box
            sx={{
                position: "relative",
                minHeight: "100vh",
                width: "100%",
                overflow: "hidden",
                background: "linear-gradient(135deg, #0f2027 0%, #203a43 50%, #2c5364 100%)",
                ...sx,
            }}
        >
            <canvas
                ref={canvasRef}
                style={{
                    position: "absolute",
                    inset: 0,
                    width: "100%",
                    height: "100%",
                    filter: "blur(15px)",
                }}
            />

            <motion.div
                style={{
                    position: "absolute",
                    inset: 0,
                    backdropFilter: "blur(50px)",
                }}
                animate={{
                    opacity: [0.05, 0.15, 0.05],
                }}
                transition={{
                    duration: 10,
                    ease: "easeInOut",
                    repeat: Infinity,
                }}
            />

            {/* Children content will be passed here */}
            <Box sx={{ position: "relative", zIndex: 10 }}>
                {/* Content goes here */}
            </Box>
        </Box>
    );
}