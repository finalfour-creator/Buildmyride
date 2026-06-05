"use client";
import { Box, Stack } from "@mui/material";
import { motion } from "framer-motion";
import KineticText from "../ui/KineticText";
import { TOKENS } from "../theme/tokens";

export default function HeroSection() {
  return (
    <Box
      sx={{
        height: "100vh",
        width: "100%",
        position: "relative",
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-end",
        alignItems: "flex-start",
        p: "0 44px 80px",
        pointerEvents: "none",
      }}
    >
      <Box
        sx={{
          position: "absolute",
          left: 36,
          top: "50%",
          transform: "translateY(-50%) rotate(180deg)",
          writingMode: "vertical-rl",
          fontFamily: TOKENS.fonts.body,
          fontSize: 10,
          color: TOKENS.colors.soft,
          letterSpacing: "0.4em",
          textTransform: "uppercase",
        }}
      >
        Session · 2025.07.14 · Studio
      </Box>

      <Box>
        <Box
          sx={{
            fontFamily: TOKENS.fonts.display,
            fontWeight: 900,
            fontSize: { xs: "14vw", md: "11vw" },
            lineHeight: 0.9,
            letterSpacing: "-0.04em",
            color: TOKENS.colors.white,
            textTransform: "uppercase",
          }}
        >
          <KineticText text="Build Your" baseDelay={0.1} />
        </Box>
        <Box
          sx={{
            fontFamily: TOKENS.fonts.display,
            fontWeight: 900,
            fontSize: { xs: "14vw", md: "11vw" },
            lineHeight: 0.9,
            letterSpacing: "-0.04em",
            color: TOKENS.colors.white,
            textTransform: "uppercase",
            mt: 1,
          }}
        >
          <KineticText text="Dream Car." baseDelay={0.55} stroked />
        </Box>
      </Box>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.6, duration: 0.8 }}
        style={{
          position: "absolute",
          right: 44,
          bottom: 80,
          maxWidth: 240,
          textAlign: "right",
        }}
      >
        <Stack spacing={0.6}>
          <Box
            sx={{
              fontFamily: TOKENS.fonts.body,
              fontSize: 10,
              letterSpacing: "0.32em",
              color: TOKENS.colors.accent,
              textTransform: "uppercase",
            }}
          >
            Phase 01
          </Box>
          <Box
            sx={{
              fontFamily: TOKENS.fonts.body,
              fontSize: 13,
              color: TOKENS.colors.soft,
              lineHeight: 1.55,
            }}
          >
            A cinematic configuration suite. Pick your platform, sculpt the
            details, preview in real space.
          </Box>
        </Stack>
      </motion.div>
    </Box>
  );
}
