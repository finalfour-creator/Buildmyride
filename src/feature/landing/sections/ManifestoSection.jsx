"use client";
import { Box } from "@mui/material";
import { motion } from "framer-motion";
import KineticText from "../ui/KineticText";
import { useAppSelector } from "@/store/hooks";
import { TOKENS } from "../theme/tokens";

export default function ManifestoSection({ chapter }) {
  const vIdx = useAppSelector((s) => s.navigation.vIdx);
  const phase = useAppSelector((s) => s.navigation.phase);
  const active = phase === 0 && vIdx === (chapter === 1 ? 1 : 2);

  const config =
    chapter === 1
      ? {
          number: "01",
          title1: "Born in",
          title2: "the studio.",
          body: "Every car begins as a question. Configured precisely, never assumed.",
          align: "flex-start",
          numberSide: "right",
        }
      : {
          number: "02",
          title1: "Modify in",
          title2: "reality.",
          body: "Walk around your build. Test color under daylight. Commit only when it's exactly right.",
          align: "flex-end",
          numberSide: "left",
        };

  return (
    <Box
      sx={{
        height: "100vh",
        width: "100%",
        position: "relative",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: config.align,
        px: "8vw",
        pointerEvents: "none",
        overflow: "hidden",
      }}
    >
      <Box
        sx={{
          position: "absolute",
          [config.numberSide]: "-2vw",
          top: "50%",
          transform: "translateY(-50%)",
          fontFamily: TOKENS.fonts.display,
          fontSize: "32vh",
          lineHeight: 1,
          fontWeight: 900,
          color: "transparent",
          WebkitTextStroke: `1px ${TOKENS.colors.dim}`,
          opacity: active ? 0.6 : 0,
          transition: "opacity 0.8s ease",
          pointerEvents: "none",
        }}
      >
        {config.number}
      </Box>

      <Box
        sx={{
          textAlign: chapter === 1 ? "left" : "right",
          position: "relative",
          zIndex: 1,
        }}
      >
        <Box
          sx={{
            fontFamily: TOKENS.fonts.display,
            fontSize: { xs: "10vw", md: "8vw" },
            lineHeight: 0.95,
            fontWeight: 900,
            letterSpacing: "-0.03em",
            color: TOKENS.colors.white,
            textTransform: "uppercase",
          }}
        >
          {active && <KineticText text={config.title1} baseDelay={0.1} />}
          {!active && config.title1}
        </Box>
        <Box
          sx={{
            fontFamily: TOKENS.fonts.display,
            fontSize: { xs: "10vw", md: "8vw" },
            lineHeight: 0.95,
            fontWeight: 900,
            letterSpacing: "-0.03em",
            textTransform: "uppercase",
            color: TOKENS.colors.white,
          }}
        >
          {active && (
            <KineticText text={config.title2} baseDelay={0.55} stroked />
          )}
          {!active && (
            <span
              style={{
                WebkitTextStroke: "1px currentColor",
                color: "transparent",
              }}
            >
              {config.title2}
            </span>
          )}
        </Box>

        <motion.div
          initial={false}
          animate={{ opacity: active ? 1 : 0, y: active ? 0 : 10 }}
          transition={{ duration: 0.7, delay: active ? 1.0 : 0 }}
          style={{
            maxWidth: 480,
            marginTop: 28,
            marginLeft: chapter === 1 ? 0 : "auto",
          }}
        >
          <Box
            sx={{
              fontFamily: TOKENS.fonts.body,
              fontSize: 14,
              lineHeight: 1.6,
              color: TOKENS.colors.soft,
            }}
          >
            {config.body}
          </Box>
        </motion.div>
      </Box>
    </Box>
  );
}
