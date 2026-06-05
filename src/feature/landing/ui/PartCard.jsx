"use client";
import { Box, Stack } from "@mui/material";
import { motion } from "framer-motion";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setPart } from "@/store/slices/buildSlice";
import { triggerFlash } from "@/store/slices/uiSlice";
import { PART_ICONS } from "../data/parts";
import { TOKENS } from "../theme/tokens";

export default function PartCard({ part, category }) {
  const dispatch = useAppDispatch();
  const selectedId = useAppSelector((s) => s.build.parts[category]);
  const isSelected = selectedId === part.id;

  const onClick = () => {
    dispatch(setPart({ category, id: part.id }));
    dispatch(triggerFlash(part.name.toUpperCase()));
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
          background: isSelected
            ? "rgba(200,169,110,0.08)"
            : "rgba(11,11,11,0.9)",
          border: `1px solid ${
            isSelected ? TOKENS.colors.accent : "rgba(240,237,232,0.06)"
          }`,
          backdropFilter: "blur(8px)",
          px: 2,
          py: 1.75,
          display: "flex",
          alignItems: "center",
          gap: 1.5,
          transition: "all 0.3s",
          "&:hover": {
            borderColor: TOKENS.colors.accent,
          },
        }}
      >
        <Box
          sx={{
            width: 34,
            height: 34,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: TOKENS.colors.accent,
            flexShrink: 0,
            "& svg": { width: 22, height: 22 },
          }}
          dangerouslySetInnerHTML={{ __html: PART_ICONS[category] || "" }}
        />
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Box
            sx={{
              fontFamily: TOKENS.fonts.display,
              fontSize: 14,
              fontWeight: 800,
              color: TOKENS.colors.white,
              lineHeight: 1.2,
            }}
          >
            {part.name}
          </Box>
          <Stack direction="row" spacing={1} mt={0.4} alignItems="baseline">
            <Box
              sx={{
                fontFamily: TOKENS.fonts.body,
                fontSize: 10,
                color: TOKENS.colors.soft,
                letterSpacing: "0.04em",
              }}
            >
              {part.sub}
            </Box>
            <Box
              sx={{
                fontFamily: TOKENS.fonts.body,
                fontSize: 9,
                color: TOKENS.colors.accent,
                letterSpacing: "0.16em",
                textTransform: "uppercase",
              }}
            >
              {part.stat}
            </Box>
          </Stack>
        </Box>
        <Box
          sx={{
            width: 14,
            height: 14,
            borderRadius: "50%",
            border: `1px solid ${
              isSelected ? TOKENS.colors.accent : TOKENS.colors.dim
            }`,
            background: isSelected ? TOKENS.colors.accent : "transparent",
            flexShrink: 0,
            transition: "all 0.3s",
          }}
        />
      </Box>
    </motion.div>
  );
}
