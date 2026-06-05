"use client";
import { Box, Stack } from "@mui/material";
import { motion } from "framer-motion";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setHIdx } from "@/store/slices/navigationSlice";
import { PARTS_DATA, PART_LABELS } from "../data/parts";
import PartCard from "../ui/PartCard";
import KineticText from "../ui/KineticText";
import { TOKENS } from "../theme/tokens";

const META = {
  engine:  { step: "02", title1: "Engine",   subtitle: "Powertrain.",   body: "The heart. Choose torque delivery, response, and the soundtrack of every press." },
  body:    { step: "03", title1: "Body",     subtitle: "Aero.",         body: "Sculpt the silhouette. Each panel earns its place in the airstream." },
  wheels:  { step: "04", title1: "Wheels",   subtitle: "Stance.",       body: "Unsprung mass shapes the conversation between road and chassis." },
  exhaust: { step: "05", title1: "Exhaust",  subtitle: "Acoustics.",    body: "Tune the resonance. Refined whisper or rolling thunder, your call." },
};

const ORDER = ["engine", "body", "wheels", "exhaust"];

export default function PartSection({ category }) {
  const meta = META[category];
  const dispatch = useAppDispatch();
  const hIdx = useAppSelector((s) => s.navigation.hIdx);
  const active = hIdx === ORDER.indexOf(category);
  const isLast = category === "exhaust";

  const next = () => dispatch(setHIdx(ORDER.indexOf(category) + 1));
  const back = () =>
    dispatch(setHIdx(Math.max(0, ORDER.indexOf(category) - 1)));

  return (
    <Box
      sx={{
        width: "100vw",
        height: "100vh",
        flexShrink: 0,
        display: "grid",
        gridTemplateColumns: "1fr 380px",
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
          Step {meta.step} / {PART_LABELS[category]}
        </Box>
        <Box
          sx={{
            fontFamily: TOKENS.fonts.display,
            fontWeight: 900,
            fontSize: { xs: "8vw", md: "5.2vw" },
            lineHeight: 0.95,
            color: TOKENS.colors.white,
            textTransform: "uppercase",
            letterSpacing: "-0.03em",
          }}
        >
          {active ? <KineticText text={meta.title1} baseDelay={0.1} /> : meta.title1}
        </Box>
        <Box
          sx={{
            fontFamily: TOKENS.fonts.display,
            fontWeight: 900,
            fontSize: { xs: "8vw", md: "5.2vw" },
            lineHeight: 0.95,
            color: TOKENS.colors.white,
            textTransform: "uppercase",
            letterSpacing: "-0.03em",
          }}
        >
          {active ? (
            <KineticText text={meta.subtitle} baseDelay={0.5} stroked />
          ) : (
            <span
              style={{
                WebkitTextStroke: "1px currentColor",
                color: "transparent",
              }}
            >
              {meta.subtitle}
            </span>
          )}
        </Box>
        <motion.div
          initial={false}
          animate={{ opacity: active ? 1 : 0, y: active ? 0 : 10 }}
          transition={{ duration: 0.6, delay: active ? 0.9 : 0 }}
          style={{ maxWidth: 420, marginTop: 22 }}
        >
          <Box
            sx={{
              fontFamily: TOKENS.fonts.body,
              fontSize: 13,
              lineHeight: 1.6,
              color: TOKENS.colors.soft,
            }}
          >
            {meta.body}
          </Box>
        </motion.div>
      </Box>

      <Box>
        <Stack spacing={1.2}>
          {PARTS_DATA[category].map((p) => (
            <PartCard key={p.id} part={p} category={category} />
          ))}
        </Stack>
        <Stack
          direction="row"
          spacing={1.5}
          mt={2.5}
          sx={{ pointerEvents: "auto" }}
        >
          <Box
            onClick={back}
            sx={{
              flex: 1,
              border: `1px solid ${TOKENS.colors.dim}`,
              py: 1.2,
              textAlign: "center",
              fontFamily: TOKENS.fonts.body,
              fontSize: 10,
              letterSpacing: "0.22em",
              color: TOKENS.colors.soft,
              textTransform: "uppercase",
              cursor: "pointer",
              transition: "all 0.3s",
              "&:hover": {
                borderColor: TOKENS.colors.accent,
                color: TOKENS.colors.white,
              },
            }}
          >
            ← Back
          </Box>
          <Box
            onClick={next}
            sx={{
              flex: 1.4,
              background: TOKENS.colors.accent,
              py: 1.2,
              textAlign: "center",
              fontFamily: TOKENS.fonts.body,
              fontSize: 10,
              letterSpacing: "0.22em",
              fontWeight: 600,
              color: TOKENS.colors.black,
              textTransform: "uppercase",
              cursor: "pointer",
              transition: "background 0.3s",
              "&:hover": { background: TOKENS.colors.white },
            }}
          >
            {isLast ? "Preview in AR →" : "Next →"}
          </Box>
        </Stack>
      </Box>
    </Box>
  );
}
