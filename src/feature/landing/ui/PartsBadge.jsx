"use client";
import { Box, Stack } from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";
import { useAppSelector } from "@/store/hooks";
import { TOKENS } from "../theme/tokens";
import { PART_KEYS, PART_LABELS, PARTS_DATA } from "../data/parts";

export default function PartsBadge() {
  const parts = useAppSelector((s) => s.build.parts);
  const phase = useAppSelector((s) => s.navigation.phase);
  const hIdx = useAppSelector((s) => s.navigation.hIdx);
  const show = phase === 1 && hIdx >= 0 && hIdx <= 5;

  const items = PART_KEYS.filter((k) => parts[k]).map((k) => {
    const p = PARTS_DATA[k].find((p) => p.id === parts[k]);
    return { key: k, label: PART_LABELS[k], name: p ? p.name : "" };
  });

  return (
    <AnimatePresence>
      {show && items.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.4 }}
          style={{
            position: "fixed",
            top: 68,
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: TOKENS.z.chrome,
            pointerEvents: "none",
          }}
        >
          <Stack direction="row" spacing={1}>
            <AnimatePresence>
              {items.map((it, idx) => (
                <motion.div
                  key={it.key}
                  initial={{ opacity: 0, y: -6, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.85 }}
                  transition={{ duration: 0.35, delay: idx * 0.05 }}
                >
                  <Box
                    sx={{
                      border: `1px solid ${TOKENS.colors.accent}`,
                      borderRadius: 999,
                      px: 1.6,
                      py: 0.4,
                      fontFamily: TOKENS.fonts.body,
                      fontSize: 9,
                      letterSpacing: "0.18em",
                      color: TOKENS.colors.accent,
                      textTransform: "uppercase",
                      background: "rgba(200,169,110,0.06)",
                      backdropFilter: "blur(4px)",
                    }}
                  >
                    {it.label} · {it.name}
                  </Box>
                </motion.div>
              ))}
            </AnimatePresence>
          </Stack>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
