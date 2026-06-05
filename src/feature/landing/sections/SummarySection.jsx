"use client";
import { Box, Stack } from "@mui/material";
import { motion } from "framer-motion";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setHIdx, resetNav } from "@/store/slices/navigationSlice";
import { resetBuild } from "@/store/slices/buildSlice";
import { triggerFlash } from "@/store/slices/uiSlice";
import KineticText from "../ui/KineticText";
import MagneticButton from "../ui/MagneticButton";
import { CHASSIS_DATA } from "../data/chassis";
import { PARTS_DATA, PART_LABELS, PART_PRICES } from "../data/parts";
import { TOKENS } from "../theme/tokens";

export default function SummarySection() {
  const dispatch = useAppDispatch();
  const chassisId = useAppSelector((s) => s.build.chassis);
  const parts = useAppSelector((s) => s.build.parts);
  const hIdx = useAppSelector((s) => s.navigation.hIdx);
  const active = hIdx === 5;

  const chassis = CHASSIS_DATA.find((c) => c.id === chassisId);
  const getPartName = (cat, id) =>
    PARTS_DATA[cat].find((p) => p.id === id)?.name || "—";

  const total =
    (chassis?.basePrice || 0) +
    Object.entries(parts).reduce(
      (acc, [cat, id]) => acc + (id ? PART_PRICES[cat]?.[id] || 0 : 0),
      0
    );

  const placeOrder = () => {
    dispatch(triggerFlash("ORDER PLACED"));
    setTimeout(() => dispatch(setHIdx(6)), 600);
  };
  const seeCommunity = () => dispatch(setHIdx(6));
  const restart = () => {
    dispatch(resetBuild());
    dispatch(resetNav());
  };

  return (
    <Box
      sx={{
        width: "100vw",
        height: "100vh",
        flexShrink: 0,
        display: "grid",
        gridTemplateColumns: "1fr 420px",
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
          Build Complete
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
            <KineticText text={chassis ? chassis.name : "Custom"} baseDelay={0.1} />
          ) : (
            chassis ? chassis.name : "Custom"
          )}
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
          {active ? <KineticText text="Build." baseDelay={0.45} stroked /> : (
            <span
              style={{
                WebkitTextStroke: "1px currentColor",
                color: "transparent",
              }}
            >
              Build.
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
            }}
          >
            Your specification is ready for commit. Production slot reserves
            within 48 hours of order placement.
          </Box>
        </motion.div>
      </Box>

      <Box sx={{ pointerEvents: "auto" }}>
        <Stack
          spacing={1.2}
          sx={{
            border: `1px solid rgba(240,237,232,0.07)`,
            background: "rgba(11,11,11,0.85)",
            backdropFilter: "blur(8px)",
            p: 2.5,
          }}
        >
          {[
            ["Chassis", chassis?.name || "—"],
            ["Engine", getPartName("engine", parts.engine)],
            ["Body Kit", getPartName("body", parts.body)],
            ["Wheels", getPartName("wheels", parts.wheels)],
            ["Exhaust", getPartName("exhaust", parts.exhaust)],
          ].map(([k, v]) => (
            <Stack
              key={k}
              direction="row"
              justifyContent="space-between"
              alignItems="baseline"
              sx={{
                py: 0.6,
                borderBottom: `1px dashed rgba(240,237,232,0.05)`,
                "&:last-of-type": { borderBottom: "none" },
              }}
            >
              <Box
                sx={{
                  fontFamily: TOKENS.fonts.body,
                  fontSize: 10,
                  letterSpacing: "0.2em",
                  color: TOKENS.colors.soft,
                  textTransform: "uppercase",
                }}
              >
                {k}
              </Box>
              <Box
                sx={{
                  fontFamily: TOKENS.fonts.display,
                  fontSize: 13,
                  fontWeight: 700,
                  color: TOKENS.colors.white,
                }}
              >
                {v}
              </Box>
            </Stack>
          ))}
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="baseline"
            sx={{
              pt: 1.4,
              mt: 1,
              borderTop: `1px solid ${TOKENS.colors.accent}66`,
            }}
          >
            <Box
              sx={{
                fontFamily: TOKENS.fonts.body,
                fontSize: 10,
                letterSpacing: "0.24em",
                color: TOKENS.colors.accent,
                textTransform: "uppercase",
              }}
            >
              Est. Price
            </Box>
            <Box
              sx={{
                fontFamily: TOKENS.fonts.display,
                fontSize: 22,
                fontWeight: 800,
                color: TOKENS.colors.accent,
              }}
            >
              ${total.toLocaleString()}
            </Box>
          </Stack>
        </Stack>
        <Stack direction="row" spacing={1.5} mt={2}>
          <MagneticButton
            onClick={placeOrder}
            sx={{
              flex: 1,
              background: TOKENS.colors.accent,
              color: TOKENS.colors.black,
              fontFamily: "var(--font-inter), Inter, sans-serif",
              fontSize: 11,
              letterSpacing: "0.22em",
              fontWeight: 600,
              padding: "12px 20px",
              textAlign: "center",
              textTransform: "uppercase",
              width: "100%",
            }}
            style={{ flex: 1 }}
          >
            Place Order
          </MagneticButton>
          <Box
            onClick={seeCommunity}
            sx={{
              border: `1px solid ${TOKENS.colors.dim}`,
              px: 2.2,
              py: 1.4,
              fontFamily: TOKENS.fonts.body,
              fontSize: 10,
              letterSpacing: "0.22em",
              color: TOKENS.colors.soft,
              textTransform: "uppercase",
              cursor: "pointer",
              "&:hover": {
                borderColor: TOKENS.colors.accent,
                color: TOKENS.colors.white,
              },
            }}
          >
            Community →
          </Box>
        </Stack>
        <Box
          onClick={restart}
          sx={{
            mt: 1.4,
            fontFamily: TOKENS.fonts.body,
            fontSize: 9,
            letterSpacing: "0.22em",
            color: TOKENS.colors.gray,
            textTransform: "uppercase",
            cursor: "pointer",
            textAlign: "center",
            "&:hover": { color: TOKENS.colors.accent },
          }}
        >
          Restart Build
        </Box>
      </Box>
    </Box>
  );
}
