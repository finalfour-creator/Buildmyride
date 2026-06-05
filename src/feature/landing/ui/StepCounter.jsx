"use client";
import { Box } from "@mui/material";
import { AnimatePresence, motion } from "framer-motion";
import { useAppSelector } from "@/store/hooks";
import { TOKENS } from "../theme/tokens";

export default function StepCounter() {
  const phase = useAppSelector((s) => s.navigation.phase);
  const hIdx = useAppSelector((s) => s.navigation.hIdx);

  const show = phase === 1 && hIdx <= 4;
  const step = Math.min(hIdx + 1, 5);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.4 }}
          style={{
            position: "fixed",
            top: 26,
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: TOKENS.z.chrome,
            pointerEvents: "none",
          }}
        >
          <Box
            sx={{
              border: `1px solid ${TOKENS.colors.accent}`,
              borderRadius: 999,
              px: 2.5,
              py: 0.5,
              fontFamily: TOKENS.fonts.body,
              fontSize: 10,
              letterSpacing: "0.22em",
              color: TOKENS.colors.accent,
              textTransform: "uppercase",
              backdropFilter: "blur(6px)",
            }}
          >
            Step {step} of 5
          </Box>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
