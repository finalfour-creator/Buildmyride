"use client";
import { Box, Stack } from "@mui/material";
import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { resetBuild } from "@/store/slices/buildSlice";
import { resetNav } from "@/store/slices/navigationSlice";
import KineticText from "../ui/KineticText";
import MagneticButton from "../ui/MagneticButton";
import { TOKENS } from "../theme/tokens";

const STATS = [
  { value: 24817, label: "Builds Configured" },
  { value: 198,   label: "Chassis Variants" },
  { value: 4,     label: "Render Pipelines" },
  { value: 60,    label: "FPS Target" },
];

function useCountUp(target, active, duration = 1200) {
  const [val, setVal] = useState(0);
  const started = useRef(false);
  useEffect(() => {
    if (!active || started.current) return;
    started.current = true;
    const start = performance.now();
    let raf;
    const tick = (t) => {
      const e = Math.min(1, (t - start) / duration);
      const eased = 1 - Math.pow(1 - e, 3);
      setVal(Math.round(target * eased));
      if (e < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => raf && cancelAnimationFrame(raf);
  }, [active, target, duration]);
  return val;
}

function Stat({ value, label, active }) {
  const v = useCountUp(value, active);
  return (
    <Box sx={{ textAlign: "center" }}>
      <Box
        sx={{
          fontFamily: TOKENS.fonts.display,
          fontWeight: 900,
          fontSize: { xs: 28, md: 38 },
          color: TOKENS.colors.accent,
          lineHeight: 1,
        }}
      >
        {v.toLocaleString()}
      </Box>
      <Box
        sx={{
          fontFamily: TOKENS.fonts.body,
          fontSize: 9,
          letterSpacing: "0.28em",
          color: TOKENS.colors.soft,
          textTransform: "uppercase",
          mt: 0.8,
        }}
      >
        {label}
      </Box>
    </Box>
  );
}

export default function FinalCTASection() {
  const dispatch = useAppDispatch();
  const hIdx = useAppSelector((s) => s.navigation.hIdx);
  const active = hIdx === 7;

  return (
    <Box
      sx={{
        width: "100vw",
        height: "100vh",
        flexShrink: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        px: "5vw",
        pointerEvents: "none",
        position: "relative",
      }}
    >
      <motion.div
        initial={false}
        animate={{ opacity: active ? 1 : 0 }}
        transition={{ duration: 0.6 }}
        style={{
          maxWidth: 980,
          width: "100%",
          textAlign: "center",
        }}
      >
        <Stack
          direction="row"
          spacing={2}
          alignItems="center"
          justifyContent="center"
          mb={4}
        >
          <Box
            sx={{ flex: 1, height: 1, background: `${TOKENS.colors.dim}` }}
          />
          <Box
            sx={{
              fontFamily: TOKENS.fonts.body,
              fontSize: 10,
              letterSpacing: "0.32em",
              color: TOKENS.colors.accent,
              textTransform: "uppercase",
            }}
          >
            Build · Preview · Commit
          </Box>
          <Box
            sx={{ flex: 1, height: 1, background: `${TOKENS.colors.dim}` }}
          />
        </Stack>
        <Box
          sx={{
            fontFamily: TOKENS.fonts.display,
            fontWeight: 900,
            fontSize: { xs: "12vw", md: "8vw" },
            lineHeight: 0.95,
            color: TOKENS.colors.white,
            textTransform: "uppercase",
            letterSpacing: "-0.03em",
          }}
        >
          {active ? <KineticText text="Your machine" baseDelay={0.1} /> : "Your machine"}
        </Box>
        <Box
          sx={{
            fontFamily: TOKENS.fonts.display,
            fontWeight: 900,
            fontSize: { xs: "12vw", md: "8vw" },
            lineHeight: 0.95,
            color: TOKENS.colors.white,
            textTransform: "uppercase",
            letterSpacing: "-0.03em",
          }}
        >
          {active ? (
            <KineticText text="starts here." baseDelay={0.5} stroked />
          ) : (
            <span
              style={{
                WebkitTextStroke: "1px currentColor",
                color: "transparent",
              }}
            >
              starts here.
            </span>
          )}
        </Box>
        <Box
          sx={{
            fontFamily: TOKENS.fonts.body,
            fontSize: 14,
            color: TOKENS.colors.soft,
            maxWidth: 540,
            mx: "auto",
            mt: 3,
            lineHeight: 1.6,
          }}
        >
          Configure once. Share, refine, commit. A studio built for the moment
          you stop imagining and start specifying.
        </Box>
        <Stack
          direction="row"
          spacing={2}
          justifyContent="center"
          mt={4}
          sx={{ pointerEvents: "auto" }}
        >
          <Link href="/login" style={{ textDecoration: "none" }}>
            <MagneticButton
              sx={{
                background: TOKENS.colors.accent,
                color: TOKENS.colors.black,
                fontFamily: "var(--font-inter), Inter, sans-serif",
                fontSize: 12,
                letterSpacing: "0.24em",
                fontWeight: 600,
                padding: "14px 32px",
                textTransform: "uppercase",
              }}
            >
              Enter The Studio
            </MagneticButton>
          </Link>
          <Box
            onClick={() =>
              setTimeout(() => {
                dispatch(resetBuild());
                dispatch(resetNav());
              }, 100)
            }
            sx={{
              border: `1px solid ${TOKENS.colors.soft}`,
              color: TOKENS.colors.white,
              fontFamily: TOKENS.fonts.body,
              fontSize: 12,
              letterSpacing: "0.24em",
              fontWeight: 600,
              padding: "14px 32px",
              textTransform: "uppercase",
              cursor: "pointer",
              transition: "all 0.3s",
              "&:hover": {
                borderColor: TOKENS.colors.accent,
                color: TOKENS.colors.accent,
              },
            }}
          >
            Watch Film
          </Box>
        </Stack>
        <Stack
          direction="row"
          spacing={4}
          justifyContent="center"
          mt={6}
          divider={
            <Box sx={{ width: 1, background: TOKENS.colors.dim, my: 0.5 }} />
          }
        >
          {STATS.map((s) => (
            <Stat key={s.label} value={s.value} label={s.label} active={active} />
          ))}
        </Stack>
      </motion.div>
      <Box
        sx={{
          position: "absolute",
          bottom: 24,
          left: 0,
          right: 0,
          display: "flex",
          justifyContent: "space-between",
          px: "5vw",
          fontFamily: TOKENS.fonts.body,
          fontSize: 9,
          letterSpacing: "0.28em",
          color: TOKENS.colors.gray,
          textTransform: "uppercase",
        }}
      >
        <Box>Build · Studio © 2025</Box>
        <Box>All Systems Nominal</Box>
      </Box>
    </Box>
  );
}
