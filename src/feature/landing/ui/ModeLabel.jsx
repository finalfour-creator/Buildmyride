"use client";
import { Box } from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";
import { useAppSelector } from "@/store/hooks";
import { TOKENS } from "../theme/tokens";
import { H_MODE_LABELS } from "../data/modeLabels";

export default function ModeLabel() {
  const phase = useAppSelector((s) => s.navigation.phase);
  const hIdx = useAppSelector((s) => s.navigation.hIdx);
  const label = phase === 0 ? "Build · Studio" : H_MODE_LABELS[hIdx] || "Studio";

  return (
    <Box
      sx={{
        position: "fixed",
        right: 18,
        top: "50%",
        transform: "translateY(-50%)",
        zIndex: TOKENS.z.chrome,
        pointerEvents: "none",
      }}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={label}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.4 }}
        >
          <Box
            sx={{
              writingMode: "vertical-rl",
              textOrientation: "mixed",
              fontFamily: TOKENS.fonts.body,
              fontSize: 10,
              letterSpacing: "0.4em",
              color: TOKENS.colors.soft,
              textTransform: "uppercase",
            }}
          >
            {label}
          </Box>
        </motion.div>
      </AnimatePresence>
    </Box>
  );
}
