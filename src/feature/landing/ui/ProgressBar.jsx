"use client";
import { Box } from "@mui/material";
import { useAppSelector } from "@/store/hooks";
import { TOKENS } from "../theme/tokens";

export default function ProgressBar() {
  const phase = useAppSelector((s) => s.navigation.phase);
  const vIdx = useAppSelector((s) => s.navigation.vIdx);
  const hIdx = useAppSelector((s) => s.navigation.hIdx);

  let width = 0;
  if (phase === 0) {
    width = (vIdx / 3) * 22;
  } else if (hIdx <= 5) {
    width = 22 + (hIdx / 7) * 65;
  } else {
    width = 22 + 65 + ((hIdx - 5) / 2) * 13;
  }
  width = Math.min(100, width);

  return (
    <Box
      sx={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        height: 2,
        zIndex: TOKENS.z.chrome + 1,
        background: "rgba(240,237,232,0.05)",
        pointerEvents: "none",
      }}
    >
      <Box
        sx={{
          height: "100%",
          width: `${width}%`,
          background: TOKENS.colors.accent,
          transition: "width 0.7s cubic-bezier(.4,.0,.2,1)",
        }}
      />
    </Box>
  );
}
