"use client";
import { Box } from "@mui/material";
import { useAppSelector } from "@/store/hooks";
import { CHASSIS_DATA } from "../data/chassis";
import { PARTS_DATA } from "../data/parts";
import { TOKENS } from "../theme/tokens";

export default function PhoneMockup() {
  const chassisId = useAppSelector((s) => s.build.chassis);
  const engineId = useAppSelector((s) => s.build.parts.engine);

  const chassisName =
    CHASSIS_DATA.find((c) => c.id === chassisId)?.name || "Unconfigured";
  const engineName =
    PARTS_DATA.engine.find((p) => p.id === engineId)?.name || "Stock";
  const label = `${chassisName} · ${engineName}`;

  return (
    <Box
      sx={{
        position: "relative",
        width: 240,
        height: 480,
        mx: "auto",
        animation: "phoneFloat 6s ease-in-out infinite",
      }}
    >
      <Box
        sx={{
          position: "absolute",
          inset: -20,
          background:
            "radial-gradient(circle, rgba(200,169,110,0.35) 0%, transparent 60%)",
          filter: "blur(24px)",
          zIndex: -1,
        }}
      />
      <Box
        sx={{
          width: "100%",
          height: "100%",
          background: "#0a0a0a",
          border: `2px solid ${TOKENS.colors.accent}66`,
          borderRadius: "34px",
          boxShadow:
            "0 30px 80px rgba(0,0,0,0.6), inset 0 0 0 1px rgba(200,169,110,0.18)",
          position: "relative",
          overflow: "hidden",
          p: 1.2,
        }}
      >
        <Box
          sx={{
            position: "absolute",
            top: 8,
            left: "50%",
            transform: "translateX(-50%)",
            width: 80,
            height: 18,
            borderRadius: 999,
            background: "#000",
            zIndex: 5,
          }}
        />
        <Box
          sx={{
            position: "relative",
            width: "100%",
            height: "100%",
            borderRadius: "22px",
            overflow: "hidden",
            background:
              "linear-gradient(180deg, #050505 0%, #0e0e10 60%, #161618 100%)",
          }}
        >
          <Box
            sx={{
              position: "absolute",
              inset: 0,
              background:
                `repeating-linear-gradient(0deg, ${TOKENS.colors.accent}10 0 1px, transparent 1px 24px),` +
                `repeating-linear-gradient(90deg, ${TOKENS.colors.accent}10 0 1px, transparent 1px 24px)`,
              transform: "perspective(400px) rotateX(58deg) translateY(28%)",
              transformOrigin: "center 70%",
              maskImage:
                "linear-gradient(to top, rgba(0,0,0,1) 35%, transparent 95%)",
            }}
          />
          <svg
            viewBox="0 0 200 80"
            style={{
              position: "absolute",
              top: "44%",
              left: "12%",
              width: "75%",
              height: "auto",
              transform: "translateY(-50%)",
              animation: "carWire 3s ease-in-out infinite",
            }}
          >
            <path
              d="M10 55 L40 25 L150 22 L185 40 L185 55 Z"
              stroke={TOKENS.colors.accent}
              strokeWidth="1"
              fill="none"
            />
            <circle cx="55" cy="62" r="9" stroke={TOKENS.colors.accent} strokeWidth="1" fill="none" />
            <circle cx="155" cy="62" r="9" stroke={TOKENS.colors.accent} strokeWidth="1" fill="none" />
          </svg>
          <Box
            sx={{
              position: "absolute",
              top: "48%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: 60,
              height: 60,
            }}
          >
            {["tl", "tr", "bl", "br"].map((c, i) => (
              <Box
                key={c}
                sx={{
                  position: "absolute",
                  width: 14,
                  height: 14,
                  borderColor: TOKENS.colors.accent,
                  borderStyle: "solid",
                  borderWidth: 0,
                  ...(c === "tl" && { top: 0, left: 0, borderTopWidth: 1, borderLeftWidth: 1 }),
                  ...(c === "tr" && { top: 0, right: 0, borderTopWidth: 1, borderRightWidth: 1 }),
                  ...(c === "bl" && { bottom: 0, left: 0, borderBottomWidth: 1, borderLeftWidth: 1 }),
                  ...(c === "br" && { bottom: 0, right: 0, borderBottomWidth: 1, borderRightWidth: 1 }),
                  opacity: 0.85,
                  animationDelay: `${i * 0.1}s`,
                }}
              />
            ))}
            <Box
              sx={{
                position: "absolute",
                top: "50%",
                left: 0,
                right: 0,
                height: 1,
                background: TOKENS.colors.accent,
                opacity: 0.5,
              }}
            />
            <Box
              sx={{
                position: "absolute",
                left: "50%",
                top: 0,
                bottom: 0,
                width: 1,
                background: TOKENS.colors.accent,
                opacity: 0.5,
              }}
            />
          </Box>
          <Box
            sx={{
              position: "absolute",
              left: 0,
              right: 0,
              top: 0,
              height: 2,
              background: TOKENS.colors.accent,
              opacity: 0.85,
              animation: "ar-scan 3s linear infinite",
            }}
          />
          <Box
            sx={{
              position: "absolute",
              top: 28,
              left: 14,
              right: 14,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              fontFamily: TOKENS.fonts.body,
              fontSize: 8,
              color: TOKENS.colors.accent,
              letterSpacing: "0.18em",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.8 }}>
              <Box
                sx={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  background: TOKENS.colors.accent,
                  animation: "pulse 1.4s infinite",
                }}
              />
              AR · LIVE
            </Box>
            <Box sx={{ color: TOKENS.colors.soft, fontSize: 7 }}>TRACKING</Box>
          </Box>
          <Box
            sx={{
              position: "absolute",
              bottom: 16,
              left: 14,
              right: 14,
              p: 1,
              border: `1px solid ${TOKENS.colors.accent}40`,
              background: "rgba(0,0,0,0.65)",
              backdropFilter: "blur(4px)",
            }}
          >
            <Box
              sx={{
                fontFamily: TOKENS.fonts.body,
                fontSize: 7,
                letterSpacing: "0.28em",
                color: TOKENS.colors.soft,
                textTransform: "uppercase",
                mb: 0.4,
              }}
            >
              Projected Model
            </Box>
            <Box
              sx={{
                fontFamily: TOKENS.fonts.display,
                fontSize: 12,
                fontWeight: 800,
                color: TOKENS.colors.white,
                letterSpacing: "0.02em",
              }}
            >
              {label}
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
