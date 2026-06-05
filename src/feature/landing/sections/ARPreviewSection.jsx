"use client";
import { Box, Stack } from "@mui/material";
import { motion } from "framer-motion";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setHIdx } from "@/store/slices/navigationSlice";
import KineticText from "../ui/KineticText";
import PhoneMockup from "../ui/PhoneMockup";
import { TOKENS } from "../theme/tokens";

const FEATURES = [
  { n: "01", t: "Real-time surface detection" },
  { n: "02", t: "360° walkaround on any flat surface" },
  { n: "03", t: "Live paint + lighting preview" },
  { n: "04", t: "Share a spatial link with collaborators" },
];

export default function ARPreviewSection() {
  const dispatch = useAppDispatch();
  const hIdx = useAppSelector((s) => s.navigation.hIdx);
  const active = hIdx === 4;

  return (
    <Box
      sx={{
        width: "100vw",
        height: "100vh",
        flexShrink: 0,
        display: "grid",
        gridTemplateColumns: "1fr 320px",
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
          Step 05 / Live Preview
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
          {active ? <KineticText text="AR" baseDelay={0.1} /> : "AR"}
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
          {active ? (
            <KineticText text="Preview." baseDelay={0.4} stroked />
          ) : (
            <span
              style={{
                WebkitTextStroke: "1px currentColor",
                color: "transparent",
              }}
            >
              Preview.
            </span>
          )}
        </Box>
        <motion.div
          initial={false}
          animate={{ opacity: active ? 1 : 0 }}
          transition={{ duration: 0.6, delay: active ? 0.9 : 0 }}
          style={{ maxWidth: 460, marginTop: 22 }}
        >
          <Box
            sx={{
              fontFamily: TOKENS.fonts.body,
              fontSize: 13,
              lineHeight: 1.6,
              color: TOKENS.colors.soft,
              mb: 3,
            }}
          >
            Project your full build into the room. Walk around it. Light it
            differently. Confirm proportions before commit.
          </Box>
          <Stack spacing={1.2}>
            {FEATURES.map((f) => (
              <Stack
                key={f.n}
                direction="row"
                spacing={2}
                alignItems="baseline"
              >
                <Box
                  sx={{
                    fontFamily: TOKENS.fonts.display,
                    fontWeight: 900,
                    fontSize: 14,
                    color: TOKENS.colors.accent,
                    width: 26,
                  }}
                >
                  {f.n}
                </Box>
                <Box
                  sx={{
                    fontFamily: TOKENS.fonts.body,
                    fontSize: 13,
                    color: TOKENS.colors.white,
                  }}
                >
                  {f.t}
                </Box>
              </Stack>
            ))}
          </Stack>
          <Box
            onClick={() => dispatch(setHIdx(5))}
            sx={{
              mt: 3.5,
              display: "inline-block",
              border: `1px solid ${TOKENS.colors.accent}`,
              px: 3,
              py: 1.2,
              fontFamily: TOKENS.fonts.body,
              fontSize: 11,
              letterSpacing: "0.22em",
              color: TOKENS.colors.accent,
              textTransform: "uppercase",
              cursor: "pointer",
              pointerEvents: "auto",
              transition: "all 0.3s",
              "&:hover": {
                background: TOKENS.colors.accent,
                color: TOKENS.colors.black,
              },
            }}
          >
            Launch AR Preview →
          </Box>
        </motion.div>
      </Box>

      <Box>
        <PhoneMockup />
      </Box>
    </Box>
  );
}
