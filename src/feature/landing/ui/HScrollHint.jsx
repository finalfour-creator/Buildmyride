"use client";
import { Box } from "@mui/material";
import { AnimatePresence, motion } from "framer-motion";
import { useAppSelector } from "@/store/hooks";
import { TOKENS } from "../theme/tokens";

export default function HScrollHint() {
  const phase = useAppSelector((s) => s.navigation.phase);
  const hIdx = useAppSelector((s) => s.navigation.hIdx);
  const show = phase >= 1 && hIdx < 7;

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          style={{
            position: "fixed",
            right: 36,
            bottom: 48,
            zIndex: TOKENS.z.chrome,
            display: "flex",
            alignItems: "center",
            gap: 14,
            pointerEvents: "none",
          }}
        >
          <Box
            sx={{
              fontFamily: TOKENS.fonts.body,
              fontSize: 9,
              letterSpacing: "0.32em",
              color: TOKENS.colors.soft,
              textTransform: "uppercase",
            }}
          >
            Continue
          </Box>
          <Box sx={{ display: "flex", flexDirection: "row", gap: 0.5 }}>
            {[0, 1, 2].map((i) => (
              <Box
                key={i}
                sx={{
                  width: 1.5,
                  height: 14,
                  background: TOKENS.colors.accent,
                  animation: `hArrPulse 1.4s ${i * 0.15}s infinite`,
                }}
              />
            ))}
          </Box>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
