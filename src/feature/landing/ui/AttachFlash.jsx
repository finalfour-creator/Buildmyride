"use client";
import { Box } from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect } from "react";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { clearFlash } from "@/store/slices/uiSlice";
import { TOKENS } from "../theme/tokens";

export default function AttachFlash() {
  const flashText = useAppSelector((s) => s.ui.flashText);
  const flashTimestamp = useAppSelector((s) => s.ui.flashTimestamp);
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (!flashText) return;
    const t = setTimeout(() => dispatch(clearFlash()), 700);
    return () => clearTimeout(t);
  }, [flashTimestamp, flashText, dispatch]);

  return (
    <Box
      sx={{
        position: "fixed",
        inset: 0,
        zIndex: TOKENS.z.flash,
        pointerEvents: "none",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <AnimatePresence>
        {flashText && (
          <motion.div
            key={flashTimestamp}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: [0.8, 1.06, 1.18], opacity: [0, 1, 0] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.55, times: [0, 0.5, 1], ease: "easeOut" }}
          >
            <Box
              sx={{
                fontFamily: TOKENS.fonts.display,
                fontWeight: 900,
                fontSize: { xs: 60, md: 90 },
                letterSpacing: "0.08em",
                color: TOKENS.colors.accent,
                textTransform: "uppercase",
                textShadow: `0 0 40px ${TOKENS.colors.accent}55`,
              }}
            >
              {flashText}
            </Box>
          </motion.div>
        )}
      </AnimatePresence>
    </Box>
  );
}
