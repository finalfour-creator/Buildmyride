"use client";
import { Box, Stack } from "@mui/material";
import { motion } from "framer-motion";
import { TOKENS } from "../theme/tokens";

export default function CommunityCard({ build }) {
  return (
    <motion.div
      whileHover={{ y: -6, rotateX: 4 }}
      transition={{ type: "spring", stiffness: 200, damping: 22 }}
      style={{ perspective: 600, pointerEvents: "auto" }}
    >
      <Box
        sx={{
          background: "rgba(11,11,11,0.9)",
          border: "1px solid rgba(240,237,232,0.06)",
          backdropFilter: "blur(8px)",
          overflow: "hidden",
          transition: "all 0.3s",
          "&:hover": {
            borderColor: TOKENS.colors.accent,
            boxShadow: `0 18px 36px rgba(200,169,110,0.15)`,
          },
        }}
      >
        <Box
          sx={{
            position: "relative",
            height: 96,
            background:
              "linear-gradient(180deg, #050505 0%, #0e0e10 60%, #161618 100%)",
            overflow: "hidden",
          }}
        >
          <Box
            sx={{
              position: "absolute",
              inset: 0,
              background:
                `repeating-linear-gradient(0deg, ${TOKENS.colors.accent}10 0 1px, transparent 1px 18px),` +
                `repeating-linear-gradient(90deg, ${TOKENS.colors.accent}10 0 1px, transparent 1px 18px)`,
              transform: "perspective(220px) rotateX(58deg) translateY(34%)",
              maskImage:
                "linear-gradient(to top, rgba(0,0,0,1) 35%, transparent 95%)",
            }}
          />
          <svg
            viewBox="0 0 200 60"
            style={{
              position: "absolute",
              left: "12%",
              top: "30%",
              width: "75%",
            }}
          >
            <path
              d="M10 45 L40 18 L150 15 L185 32 L185 45 Z"
              stroke={TOKENS.colors.accent}
              strokeWidth="1"
              fill="none"
              opacity="0.85"
            />
            <circle cx="55" cy="50" r="6" stroke={TOKENS.colors.accent} strokeWidth="1" fill="none" />
            <circle cx="155" cy="50" r="6" stroke={TOKENS.colors.accent} strokeWidth="1" fill="none" />
          </svg>
        </Box>
        <Box sx={{ p: 1.8 }}>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="baseline"
          >
            <Box
              sx={{
                fontFamily: TOKENS.fonts.display,
                fontWeight: 800,
                fontSize: 15,
                color: TOKENS.colors.white,
              }}
            >
              {build.name}
            </Box>
            <Box
              sx={{
                border: `1px solid ${TOKENS.colors.accent}55`,
                px: 0.8,
                py: 0.2,
                fontFamily: TOKENS.fonts.body,
                fontSize: 8,
                color: TOKENS.colors.accent,
                letterSpacing: "0.16em",
                textTransform: "uppercase",
              }}
            >
              {build.tag}
            </Box>
          </Stack>
          <Box
            sx={{
              fontFamily: TOKENS.fonts.body,
              fontSize: 10,
              color: TOKENS.colors.soft,
              mt: 0.6,
            }}
          >
            {build.author}
          </Box>
          <Stack direction="row" spacing={2} mt={1.2}>
            <Stack direction="row" spacing={0.6} alignItems="center">
              <Box
                component="svg"
                viewBox="0 0 24 24"
                sx={{ width: 11, height: 11, color: TOKENS.colors.accent }}
              >
                <path
                  d="M12 21s-7-4.5-9.5-9A5.5 5.5 0 0 1 12 6a5.5 5.5 0 0 1 9.5 6c-2.5 4.5-9.5 9-9.5 9z"
                  fill="currentColor"
                />
              </Box>
              <Box
                sx={{
                  fontFamily: TOKENS.fonts.body,
                  fontSize: 10,
                  color: TOKENS.colors.soft,
                }}
              >
                {build.likes.toLocaleString()}
              </Box>
            </Stack>
            <Stack direction="row" spacing={0.6} alignItems="center">
              <Box
                component="svg"
                viewBox="0 0 24 24"
                sx={{
                  width: 11,
                  height: 11,
                  color: TOKENS.colors.soft,
                  fill: "none",
                  stroke: "currentColor",
                  strokeWidth: 1.6,
                }}
              >
                <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z" />
                <circle cx="12" cy="12" r="3" />
              </Box>
              <Box
                sx={{
                  fontFamily: TOKENS.fonts.body,
                  fontSize: 10,
                  color: TOKENS.colors.soft,
                }}
              >
                {build.views.toLocaleString()}
              </Box>
            </Stack>
          </Stack>
        </Box>
      </Box>
    </motion.div>
  );
}
