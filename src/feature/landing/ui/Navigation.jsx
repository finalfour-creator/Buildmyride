"use client";
import { Box, Stack } from "@mui/material";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { resetBuild } from "@/store/slices/buildSlice";
import {
  setPhase,
  setVIdx,
  setHIdx,
  resetNav,
} from "@/store/slices/navigationSlice";
import { TOKENS } from "../theme/tokens";

const LINKS = [
  { label: "Chassis", phase: 0, vIdx: 3, hIdx: 0 },
  { label: "Parts", phase: 1, vIdx: 3, hIdx: 0 },
  { label: "AR Preview", phase: 1, vIdx: 3, hIdx: 4 },
  { label: "Summary", phase: 1, vIdx: 3, hIdx: 5 },
];

export default function Navigation() {
  const dispatch = useAppDispatch();
  const phase = useAppSelector((s) => s.navigation.phase);
  const vIdx = useAppSelector((s) => s.navigation.vIdx);
  const hIdx = useAppSelector((s) => s.navigation.hIdx);

  const reset = () => {
    dispatch(resetBuild());
    dispatch(resetNav());
  };

  const go = (target) => {
    dispatch(setPhase(target.phase));
    dispatch(setVIdx(target.vIdx));
    dispatch(setHIdx(target.hIdx));
  };

  const isActive = (l) => {
    if (phase === 0) return l.label === "Chassis" && vIdx === 3;
    if (l.label === "Parts") return phase === 1 && hIdx <= 3;
    if (l.label === "AR Preview") return hIdx === 4;
    if (l.label === "Summary") return hIdx === 5;
    if (l.label === "Chassis") return phase === 0 && vIdx === 3;
    return false;
  };

  return (
    <Box
      sx={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: TOKENS.z.chrome,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        px: 5,
        py: 2.5,
        pointerEvents: "none",
      }}
    >
      <Box
        onClick={reset}
        sx={{
          fontFamily: TOKENS.fonts.display,
          fontWeight: 900,
          fontSize: 18,
          letterSpacing: "0.04em",
          color: TOKENS.colors.white,
          cursor: "pointer",
          pointerEvents: "auto",
          textTransform: "uppercase",
        }}
      >
        Build<span style={{ color: TOKENS.colors.accent }}>·</span>Studio
      </Box>
      <Stack direction="row" spacing={3} sx={{ pointerEvents: "auto" }}>
        {LINKS.map((l) => (
          <Box
            key={l.label}
            onClick={() => go(l)}
            sx={{
              fontFamily: TOKENS.fonts.body,
              fontSize: 11,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              cursor: "pointer",
              color: isActive(l) ? TOKENS.colors.accent : TOKENS.colors.soft,
              transition: "color 0.3s",
              "&:hover": { color: TOKENS.colors.white },
            }}
          >
            {l.label}
          </Box>
        ))}
      </Stack>
    </Box>
  );
}
