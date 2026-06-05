"use client";
import { Box } from "@mui/material";
import { motion } from "framer-motion";
import { useAppSelector } from "@/store/hooks";
import { TOKENS } from "../theme/tokens";

export default function PhaseIndicator() {
  const phase = useAppSelector((s) => s.navigation.phase);

  return (
    <Box
      sx={{
        position: "fixed",
        bottom: 28,
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: TOKENS.z.chrome,
        display: "flex",
        alignItems: "center",
        gap: 1.5,
        pointerEvents: "none",
      }}
    >
      {[0, 1, 2].map((i) => {
        const active = phase === i;
        return (
          <motion.div
            key={i}
            layout
            animate={{
              width: active ? 22 : 6,
              backgroundColor: active
                ? TOKENS.colors.accent
                : "rgba(240,237,232,0.2)",
            }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            style={{
              height: 6,
              borderRadius: 3,
            }}
          />
        );
      })}
    </Box>
  );
}
