"use client";
import { Box, Stack } from "@mui/material";
import { motion } from "framer-motion";
import { useAppSelector } from "@/store/hooks";
import KineticText from "../ui/KineticText";
import CommunityCard from "../ui/CommunityCard";
import { BUILDS } from "../data/builds";
import { TOKENS } from "../theme/tokens";

export default function CommunitySection() {
  const hIdx = useAppSelector((s) => s.navigation.hIdx);
  const active = hIdx === 6;

  return (
    <Box
      sx={{
        width: "100vw",
        height: "100vh",
        flexShrink: 0,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        px: "5vw",
        py: "10vh",
        pointerEvents: "none",
      }}
    >
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="flex-end"
        mb={4}
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
            The Collective
          </Box>
          <Box
            sx={{
              fontFamily: TOKENS.fonts.display,
              fontWeight: 900,
              fontSize: { xs: "8vw", md: "5vw" },
              lineHeight: 0.95,
              color: TOKENS.colors.white,
              textTransform: "uppercase",
              letterSpacing: "-0.03em",
            }}
          >
            {active ? <KineticText text="Built by" baseDelay={0.1} /> : "Built by"}
            <br />
            {active ? (
              <KineticText text="makers." baseDelay={0.5} stroked />
            ) : (
              <span
                style={{
                  WebkitTextStroke: "1px currentColor",
                  color: "transparent",
                }}
              >
                makers.
              </span>
            )}
          </Box>
        </Box>
        <motion.div
          initial={false}
          animate={{ opacity: active ? 1 : 0 }}
          transition={{ duration: 0.6, delay: active ? 0.8 : 0 }}
        >
          <Stack
            direction="row"
            spacing={3}
            sx={{
              maxWidth: 360,
              fontFamily: TOKENS.fonts.body,
              fontSize: 13,
              color: TOKENS.colors.soft,
              alignItems: "baseline",
            }}
          >
            <Box sx={{ textAlign: "right" }}>
              Every build below is real, configured in this studio,
              <br />
              shared by its maker.
            </Box>
          </Stack>
        </motion.div>
      </Stack>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 2,
        }}
      >
        {BUILDS.map((b, i) => (
          <motion.div
            key={b.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: active ? 1 : 0, y: active ? 0 : 16 }}
            transition={{ duration: 0.5, delay: active ? 0.4 + i * 0.06 : 0 }}
          >
            <CommunityCard build={b} />
          </motion.div>
        ))}
      </Box>
    </Box>
  );
}
