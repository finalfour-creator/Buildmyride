"use client";
import { Box, Stack } from "@mui/material";
import { motion } from "framer-motion";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setChassis } from "@/store/slices/buildSlice";
import { triggerFlash } from "@/store/slices/uiSlice";
import { TOKENS } from "../theme/tokens";

export default function ChassisCard({ chassis }) {
  const dispatch = useAppDispatch();
  const selectedId = useAppSelector((s) => s.build.chassis);
  const selected = selectedId === chassis.id;

  const onClick = () => {
    dispatch(setChassis(chassis.id));
    dispatch(triggerFlash(chassis.name.toUpperCase()));
  };

  return (
    <motion.div
      whileHover={{ x: -3 }}
      transition={{ type: "spring", stiffness: 300, damping: 28 }}
      onClick={onClick}
      style={{ cursor: "pointer", pointerEvents: "auto" }}
    >
      <Box
        sx={{
          background: selected
            ? "rgba(200,169,110,0.08)"
            : "rgba(14,14,14,0.88)",
          border: `1px solid ${
            selected ? TOKENS.colors.accent : "rgba(240,237,232,0.07)"
          }`,
          backdropFilter: "blur(8px)",
          px: 2.5,
          py: 2.25,
          transition: "background 0.3s, border-color 0.3s",
        }}
      >
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="baseline"
        >
          <Box
            sx={{
              fontFamily: TOKENS.fonts.display,
              fontSize: 17,
              fontWeight: 800,
              color: TOKENS.colors.white,
              letterSpacing: "0.02em",
            }}
          >
            {chassis.name}
          </Box>
          <Box
            sx={{
              fontFamily: TOKENS.fonts.body,
              fontSize: 9,
              letterSpacing: "0.28em",
              color: TOKENS.colors.accent,
              textTransform: "uppercase",
            }}
          >
            {chassis.tag}
          </Box>
        </Stack>
        <Box
          sx={{
            fontFamily: TOKENS.fonts.body,
            fontSize: 11,
            color: TOKENS.colors.gray,
            mt: 1,
            lineHeight: 1.5,
          }}
        >
          {chassis.description}
        </Box>
        <Stack direction="row" spacing={2} alignItems="baseline" mt={1.5}>
          <Box
            sx={{
              fontFamily: TOKENS.fonts.display,
              fontSize: 18,
              fontWeight: 700,
              color: TOKENS.colors.white,
            }}
          >
            {chassis.weight}
            <Box
              component="span"
              sx={{
                fontFamily: TOKENS.fonts.body,
                fontSize: 9,
                color: TOKENS.colors.soft,
                ml: 0.5,
                letterSpacing: "0.2em",
              }}
            >
              KG
            </Box>
          </Box>
          <Box
            sx={{
              fontFamily: TOKENS.fonts.body,
              fontSize: 8,
              color: TOKENS.colors.soft,
              letterSpacing: "0.28em",
              textTransform: "uppercase",
            }}
          >
            Curb Weight
          </Box>
        </Stack>
      </Box>
    </motion.div>
  );
}
