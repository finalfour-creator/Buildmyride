"use client";
import { Box, Stack } from "@mui/material";
import { motion } from "framer-motion";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setPhase, setHIdx } from "@/store/slices/navigationSlice";
import { CHASSIS_DATA } from "../data/chassis";
import ChassisCard from "../ui/ChassisCard";
import KineticText from "../ui/KineticText";
import { TOKENS } from "../theme/tokens";

export default function ChassisSection() {
  const dispatch = useAppDispatch();
  const phase = useAppSelector((s) => s.navigation.phase);
  const vIdx = useAppSelector((s) => s.navigation.vIdx);
  const chassis = useAppSelector((s) => s.build.chassis);
  const active = phase === 0 && vIdx === 3;

  const onConfigure = () => {
    dispatch(setPhase(1));
    dispatch(setHIdx(0));
  };

  return (
    <Box
      sx={{
        height: "100vh",
        width: "100%",
        position: "relative",
        display: "grid",
        gridTemplateColumns: "1fr 420px",
        gap: 6,
        alignItems: "center",
        px: "5vw",
        pointerEvents: "none",
      }}
    >
      <Box>
        <Box
          sx={{
            fontFamily: TOKENS.fonts.body,
            fontSize: 10,
            letterSpacing: "0.32em",
            color: TOKENS.colors.accent,
            textTransform: "uppercase",
            mb: 1.5,
          }}
        >
          Step 01 / Foundation
        </Box>
        <Box
          sx={{
            fontFamily: TOKENS.fonts.display,
            fontWeight: 900,
            fontSize: { xs: "8vw", md: "5.4vw" },
            lineHeight: 0.95,
            color: TOKENS.colors.white,
            textTransform: "uppercase",
            letterSpacing: "-0.03em",
          }}
        >
          {active ? <KineticText text="Select" baseDelay={0.1} /> : "Select"}
        </Box>
        <Box
          sx={{
            fontFamily: TOKENS.fonts.display,
            fontWeight: 900,
            fontSize: { xs: "8vw", md: "5.4vw" },
            lineHeight: 0.95,
            color: TOKENS.colors.white,
            textTransform: "uppercase",
            letterSpacing: "-0.03em",
          }}
        >
          {active ? <KineticText text="Chassis." baseDelay={0.4} stroked /> : "Chassis."}
        </Box>
        <motion.div
          initial={false}
          animate={{ opacity: active ? 1 : 0, y: active ? 0 : 10 }}
          transition={{ duration: 0.7, delay: active ? 0.9 : 0 }}
          style={{ maxWidth: 380, marginTop: 24 }}
        >
          <Box
            sx={{
              fontFamily: TOKENS.fonts.body,
              fontSize: 13,
              lineHeight: 1.6,
              color: TOKENS.colors.soft,
            }}
          >
            Pick the foundation. Every later decision compounds on this single
            choice — geometry, weight, posture.
          </Box>
        </motion.div>
      </Box>

      <Stack spacing={1.5}>
        {CHASSIS_DATA.map((c) => (
          <ChassisCard key={c.id} chassis={c} />
        ))}
        {chassis && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <Box
              onClick={onConfigure}
              sx={{
                mt: 1,
                px: 3,
                py: 1.5,
                background: TOKENS.colors.accent,
                color: TOKENS.colors.black,
                fontFamily: TOKENS.fonts.body,
                fontSize: 11,
                letterSpacing: "0.22em",
                fontWeight: 600,
                textAlign: "center",
                cursor: "pointer",
                pointerEvents: "auto",
                textTransform: "uppercase",
                transition: "background 0.3s",
                "&:hover": { background: TOKENS.colors.white },
              }}
            >
              Configure Parts →
            </Box>
          </motion.div>
        )}
      </Stack>
    </Box>
  );
}
