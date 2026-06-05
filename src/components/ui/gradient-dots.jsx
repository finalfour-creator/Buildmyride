"use client";
import React from "react";
import { motion } from "framer-motion";
import { Box } from "@mui/material";

export function GradientDots({
    dotSize = 8,
    spacing = 10,
    duration = 30,
    colorCycleDuration = 6,
    backgroundColor = "#fefcf8",
    sx = {},
    ...props
}) {
    const hexSpacing = spacing * 1.732; // Hexagonal spacing calculation

    return (
        <Box
            component={motion.div}
            sx={{
                position: "absolute",
                inset: 0,
                backgroundColor: backgroundColor,
                backgroundImage: `
                    radial-gradient(circle at 50% 50%, transparent 1.5px, ${backgroundColor} 0 ${dotSize}px, transparent ${dotSize}px),
                    radial-gradient(circle at 50% 50%, transparent 1.5px, ${backgroundColor} 0 ${dotSize}px, transparent ${dotSize}px),
                    radial-gradient(circle at 50% 50%, #2c5364, transparent 60%),
                    radial-gradient(circle at 50% 50%, #203a43, transparent 60%),
                    radial-gradient(circle at 50% 50%, #0f2027, transparent 60%),
                    radial-gradient(ellipse at 50% 50%, #2c5364, transparent 60%)
                `,
                backgroundSize: `
                    ${spacing}px ${hexSpacing}px,
                    ${spacing}px ${hexSpacing}px,
                    200% 200%,
                    200% 200%,
                    200% 200%,
                    200% ${hexSpacing}px
                `,
                backgroundPosition: `
                    0px 0px, ${spacing / 2}px ${hexSpacing / 2}px,
                    0% 0%,
                    0% 0%,
                    0% 0%,
                    0% 0px
                `,
                ...sx,
            }}
            animate={{
                backgroundPosition: [
                    `0px 0px, ${spacing / 2}px ${hexSpacing / 2}px, 800% 400%, 1000% -400%, -1200% -600%, 400% ${hexSpacing}px`,
                    `0px 0px, ${spacing / 2}px ${hexSpacing / 2}px, 0% 0%, 0% 0%, 0% 0%, 0% 0%`,
                ],
                filter: ["hue-rotate(0deg)", "hue-rotate(360deg)"],
            }}
            transition={{
                backgroundPosition: {
                    duration: duration,
                    ease: "linear",
                    repeat: Infinity,
                },
                filter: {
                    duration: colorCycleDuration,
                    ease: "linear",
                    repeat: Infinity,
                },
            }}
            {...props}
        />
    );
}