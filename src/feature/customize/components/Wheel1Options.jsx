"use client";
import { useState } from "react";
import { Box, Typography, Grid, Tooltip } from "@mui/material";

/* ─── Wheel Position Diagram ─── */
const POSITIONS = [
  { id: "front-left",  label: "FL", x: "18%",  y: "28%" },
  { id: "front-right", label: "FR", x: "72%",  y: "28%" },
  { id: "rear-left",   label: "RL", x: "18%",  y: "68%" },
  { id: "rear-right",  label: "RR", x: "72%",  y: "68%" },
];

function WheelPositionDiagram({ wheels, activeWheelPosition, onSelectPosition }) {
  return (
    <Box sx={{ mb: 2 }}>
      <Typography sx={{
        fontSize: "0.62rem", fontWeight: 800, color: "#3a5565",
        letterSpacing: "2px", mb: 1.5, display: "block",
      }}>
        TARGET POSITION
      </Typography>

      <Box sx={{
        position: "relative",
        width: "100%", height: 120,
        borderRadius: "12px",
        background: "rgba(6,14,19,0.6)",
        border: "1px solid rgba(0,242,254,0.08)",
        overflow: "hidden",
      }}>
        {/* Grid lines */}
        <Box sx={{
          position: "absolute", inset: 0,
          backgroundImage: "linear-gradient(rgba(0,242,254,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(0,242,254,0.04) 1px, transparent 1px)",
          backgroundSize: "20px 20px",
          pointerEvents: "none",
        }} />

        {/* Car silhouette */}
        <Box sx={{
          position: "absolute", top: "50%", left: "50%",
          transform: "translate(-50%, -50%)",
          width: "45%", height: "55%",
          borderRadius: "8px 8px 6px 6px",
          border: "1px solid rgba(0,242,254,0.15)",
          background: "rgba(0,242,254,0.03)",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <Typography sx={{ fontSize: "1.4rem", opacity: 0.25 }}>🚗</Typography>
        </Box>

        {/* Position dots */}
        {POSITIONS.map((pos) => {
          const isActive   = activeWheelPosition === pos.id;
          const isEquipped = !!wheels?.[pos.id];
          return (
            <Tooltip key={pos.id} title={pos.id.replace("-", " ").toUpperCase()} placement="top" arrow>
              <Box
                onClick={() => onSelectPosition(pos.id)}
                sx={{
                  position: "absolute",
                  left: pos.x, top: pos.y,
                  transform: "translate(-50%, -50%)",
                  width: 28, height: 28,
                  borderRadius: "50%",
                  cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  background: isActive
                    ? "rgba(0,242,254,0.25)"
                    : isEquipped
                    ? "rgba(57,211,83,0.15)"
                    : "rgba(255,255,255,0.05)",
                  border: isActive
                    ? "2px solid #00f2fe"
                    : isEquipped
                    ? "1.5px solid rgba(57,211,83,0.5)"
                    : "1.5px solid rgba(44,83,100,0.4)",
                  boxShadow: isActive
                    ? "0 0 14px rgba(0,242,254,0.5)"
                    : isEquipped
                    ? "0 0 10px rgba(57,211,83,0.3)"
                    : "none",
                  transition: "all 0.25s ease",
                  "&:hover": {
                    background: "rgba(0,242,254,0.15)",
                    borderColor: "#00f2fe",
                    boxShadow: "0 0 12px rgba(0,242,254,0.4)",
                    transform: "translate(-50%,-50%) scale(1.15)",
                  },
                }}
              >
                <Typography sx={{
                  fontSize: "0.55rem", fontWeight: 800,
                  color: isActive ? "#00f2fe" : isEquipped ? "#39d353" : "#5d7585",
                }}>
                  {pos.label}
                </Typography>
              </Box>
            </Tooltip>
          );
        })}

        {/* Active label */}
        <Box sx={{
          position: "absolute", bottom: 8, left: "50%",
          transform: "translateX(-50%)",
          px: 1.5, py: 0.3,
          borderRadius: "10px",
          background: "rgba(0,0,0,0.5)",
          border: "1px solid rgba(0,242,254,0.1)",
        }}>
          <Typography sx={{ fontSize: "0.58rem", fontWeight: 700, color: "#3a5565", letterSpacing: "1px" }}>
            {activeWheelPosition
              ? `← Targeting: ${activeWheelPosition.replace("-", " ").toUpperCase()}`
              : "Click a wheel dot or click car wheel in 3D"}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}

/* ─── Single Wheel Card ─── */
function WheelCard({ wheel, isSelected, onClick }) {
  const [pressed, setPressed] = useState(false);

  return (
    <Box
      onClick={onClick}
      onMouseDown={() => setPressed(true)}
      onMouseUp={() => setPressed(false)}
      onMouseLeave={() => setPressed(false)}
      sx={{
        position: "relative",
        p: 1.5,
        borderRadius: "12px",
        cursor: "pointer",
        display: "flex", flexDirection: "column",
        alignItems: "center", textAlign: "center",
        border: isSelected
          ? "1.5px solid rgba(0,242,254,0.7)"
          : "1.5px solid rgba(44,83,100,0.2)",
        background: isSelected
          ? "rgba(0,242,254,0.06)"
          : "rgba(6,14,19,0.5)",
        backdropFilter: "blur(6px)",
        boxShadow: isSelected
          ? "0 0 18px rgba(0,242,254,0.18)"
          : "0 2px 10px rgba(0,0,0,0.3)",
        transition: "all 0.25s cubic-bezier(0.4,0,0.2,1)",
        transform: pressed ? "scale(0.95)" : isSelected ? "translateY(-2px)" : "translateY(0)",
        overflow: "hidden",
        "&:hover": {
          borderColor: isSelected ? "rgba(0,242,254,0.9)" : "rgba(44,83,100,0.5)",
          background: isSelected ? "rgba(0,242,254,0.08)" : "rgba(44,83,100,0.1)",
          transform: pressed ? "scale(0.95)" : "translateY(-3px)",
          boxShadow: isSelected ? "0 0 24px rgba(0,242,254,0.25)" : "0 8px 20px rgba(0,0,0,0.4)",
        },
      }}
    >
      {/* Shimmer on selected */}
      {isSelected && (
        <Box sx={{
          position: "absolute", inset: 0, pointerEvents: "none",
          background: "linear-gradient(90deg, transparent, rgba(0,242,254,0.08), transparent)",
          backgroundSize: "200% 100%",
          animation: "shimmer 2.5s linear infinite",
          "@keyframes shimmer": {
            "0%": { backgroundPosition: "-200% center" },
            "100%": { backgroundPosition: "200% center" },
          },
        }} />
      )}

      {isSelected && (
        <Box sx={{
          position: "absolute", top: 6, right: 6,
          width: 7, height: 7, borderRadius: "50%",
          background: "#00f2fe", boxShadow: "0 0 8px #00f2fe",
        }} />
      )}

      {/* Wheel thumbnail or icon */}
      {wheel.thumbnail ? (
        <Box
          component="img"
          src={wheel.thumbnail}
          alt={wheel.name}
          sx={{
            width: "100%", height: 50, objectFit: "contain", mb: 1,
            filter: isSelected
              ? "drop-shadow(0 0 8px rgba(0,242,254,0.5))"
              : "drop-shadow(0 3px 6px rgba(0,0,0,0.5))",
            transition: "filter 0.25s ease",
          }}
        />
      ) : (
        <Typography sx={{ fontSize: "1.6rem", mb: 0.8, opacity: isSelected ? 0.9 : 0.45, transition: "opacity 0.25s" }}>
          ⚙️
        </Typography>
      )}

      <Typography sx={{
        fontSize: "0.66rem", fontWeight: 700,
        color: isSelected ? "#00f2fe" : "#7a96a5",
        letterSpacing: "0.3px", lineHeight: 1.3,
        display: "-webkit-box",
        WebkitLineClamp: 2, WebkitBoxOrient: "vertical",
        overflow: "hidden",
        transition: "color 0.2s ease",
      }}>
        {wheel.name}
      </Typography>
    </Box>
  );
}

/* ══════════════════════════════════════════ MAIN EXPORT */
export default function WheelOptions({
  activeWheelPosition,
  wheels,
  setWheels,
  wheelOptions = [],
  onApplyAllWheels,
  horizontal = false,
}) {
  const [localActive, setLocalActive] = useState(null);
  const effectivePosition = activeWheelPosition || localActive;

  const currentWheelUrl = effectivePosition ? wheels?.[effectivePosition] : null;

  const handleSelectWheel = (url) => {
    if (effectivePosition) {
      setWheels((prev) => ({ ...prev, [effectivePosition]: url }));
    } else {
      onApplyAllWheels?.(url);
    }
  };

  const handlePositionClick = (posId) => {
    setLocalActive((prev) => (prev === posId ? null : posId));
  };

  /* ── Horizontal layout (NFS bottom bar) ── */
  if (horizontal) {
    return (
      <Box sx={{ display: "flex", alignItems: "stretch", height: "100%", flexShrink: 0 }}>
        {/* Left: compact position diagram */}
        <Box sx={{
          display: "flex", flexDirection: "column", justifyContent: "center",
          px: 1.5, flexShrink: 0, borderRight: "1px solid rgba(0,242,254,0.07)",
          minWidth: 170,
        }}>
          <Typography sx={{
            fontSize: "0.44rem", fontWeight: 800, color: "#3a5565",
            letterSpacing: "2px", mb: 0.8, textTransform: "uppercase",
          }}>
            Target Position
          </Typography>
          <Box sx={{
            position: "relative", width: "100%", height: 90,
            borderRadius: "10px",
            background: "rgba(6,14,19,0.6)",
            border: "1px solid rgba(0,242,254,0.08)",
            overflow: "hidden",
          }}>
            <Box sx={{
              position: "absolute", inset: 0,
              backgroundImage: "linear-gradient(rgba(0,242,254,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(0,242,254,0.04) 1px, transparent 1px)",
              backgroundSize: "16px 16px", pointerEvents: "none",
            }} />
            <Box sx={{
              position: "absolute", top: "50%", left: "50%",
              transform: "translate(-50%, -50%)",
              width: "40%", height: "50%", borderRadius: "6px 6px 4px 4px",
              border: "1px solid rgba(0,242,254,0.15)",
              background: "rgba(0,242,254,0.03)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <Typography sx={{ fontSize: "1rem", opacity: 0.2 }}>🚗</Typography>
            </Box>
            {POSITIONS.map((pos) => {
              const isActive   = effectivePosition === pos.id;
              const isEquipped = !!wheels?.[pos.id];
              return (
                <Tooltip key={pos.id} title={pos.id.replace("-", " ").toUpperCase()} placement="top" arrow>
                  <Box
                    onClick={() => handlePositionClick(pos.id)}
                    sx={{
                      position: "absolute", left: pos.x, top: pos.y,
                      transform: "translate(-50%, -50%)",
                      width: 22, height: 22, borderRadius: "50%",
                      cursor: "pointer",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      background: isActive ? "rgba(0,242,254,0.25)" : isEquipped ? "rgba(57,211,83,0.15)" : "rgba(255,255,255,0.05)",
                      border: isActive ? "2px solid #00f2fe" : isEquipped ? "1.5px solid rgba(57,211,83,0.5)" : "1.5px solid rgba(44,83,100,0.4)",
                      boxShadow: isActive ? "0 0 10px rgba(0,242,254,0.5)" : isEquipped ? "0 0 8px rgba(57,211,83,0.3)" : "none",
                      transition: "all 0.2s ease",
                      "&:hover": { background: "rgba(0,242,254,0.15)", borderColor: "#00f2fe", transform: "translate(-50%,-50%) scale(1.15)" },
                    }}
                  >
                    <Typography sx={{ fontSize: "0.42rem", fontWeight: 800, color: isActive ? "#00f2fe" : isEquipped ? "#39d353" : "#5d7585" }}>
                      {pos.label}
                    </Typography>
                  </Box>
                </Tooltip>
              );
            })}
            <Box sx={{
              position: "absolute", bottom: 5, left: "50%", transform: "translateX(-50%)",
              px: 1, py: 0.2, borderRadius: "8px",
              background: "rgba(0,0,0,0.5)", border: "1px solid rgba(0,242,254,0.08)",
            }}>
              <Typography sx={{ fontSize: "0.46rem", fontWeight: 700, color: "#3a5565", letterSpacing: "0.5px", whiteSpace: "nowrap" }}>
                {effectivePosition ? `→ ${effectivePosition.replace("-", " ").toUpperCase()}` : "ALL WHEELS"}
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Right: wheel cards in a horizontal row */}
        <Box sx={{ display: "flex", gap: 1, px: 1.5, py: 1, alignItems: "stretch", flexShrink: 0 }}>
          {/* Stock / remove slot */}
          <Box
            onClick={() => handleSelectWheel(null)}
            sx={{
              width: 90, flexShrink: 0,
              p: 1, borderRadius: "10px", cursor: "pointer",
              display: "flex", flexDirection: "column",
              alignItems: "center", justifyContent: "center", textAlign: "center",
              border: !currentWheelUrl ? "1.5px solid rgba(0,242,254,0.7)" : "1.5px solid rgba(44,83,100,0.2)",
              background: !currentWheelUrl ? "rgba(0,242,254,0.06)" : "rgba(6,14,19,0.5)",
              transition: "all 0.25s ease",
              "&:hover": { borderColor: "rgba(0,242,254,0.4)", background: "rgba(0,242,254,0.04)", transform: "translateY(-2px)" },
            }}
          >
            <Typography sx={{ fontSize: "1.2rem", mb: 0.4, opacity: 0.4 }}>◯</Typography>
            <Typography sx={{ fontSize: "0.58rem", fontWeight: 700, color: !currentWheelUrl ? "#00f2fe" : "#7a96a5" }}>
              Stock
            </Typography>
          </Box>

          {wheelOptions.map((wheel) => (
            <Box
              key={wheel._id || wheel.name}
              onClick={() => handleSelectWheel(wheel.modelUrl)}
              sx={{
                width: 90, flexShrink: 0,
                p: 1, borderRadius: "10px", cursor: "pointer",
                display: "flex", flexDirection: "column",
                alignItems: "center", justifyContent: "center", textAlign: "center",
                border: currentWheelUrl === wheel.modelUrl ? "1.5px solid rgba(0,242,254,0.7)" : "1.5px solid rgba(44,83,100,0.2)",
                background: currentWheelUrl === wheel.modelUrl ? "rgba(0,242,254,0.06)" : "rgba(6,14,19,0.5)",
                transition: "all 0.25s ease",
                "&:hover": { borderColor: "rgba(0,242,254,0.4)", transform: "translateY(-2px)" },
              }}
            >
              {wheel.thumbnail ? (
                <Box component="img" src={wheel.thumbnail} alt={wheel.name}
                  sx={{ width: "100%", height: 42, objectFit: "contain", mb: 0.5,
                    filter: currentWheelUrl === wheel.modelUrl ? "drop-shadow(0 0 6px rgba(0,242,254,0.5))" : "none" }}
                />
              ) : (
                <Typography sx={{ fontSize: "1.4rem", mb: 0.4, opacity: 0.4 }}>⚙️</Typography>
              )}
              <Typography sx={{
                fontSize: "0.52rem", fontWeight: 700, lineHeight: 1.2,
                color: currentWheelUrl === wheel.modelUrl ? "#00f2fe" : "#7a96a5",
                display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden",
              }}>
                {wheel.name}
              </Typography>
            </Box>
          ))}
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 2, color: "#fff" }}>

      {/* Position Diagram */}
      <WheelPositionDiagram
        wheels={wheels}
        activeWheelPosition={effectivePosition}
        onSelectPosition={handlePositionClick}
      />

      {/* Apply All button */}
      {wheelOptions.length > 0 && (
        <Box sx={{ mb: 2 }}>
          <Box
            onClick={() => wheelOptions[0] && onApplyAllWheels?.(wheelOptions[0].modelUrl)}
            sx={{
              display: "flex", alignItems: "center", justifyContent: "center", gap: 1,
              py: 0.9, px: 2,
              borderRadius: "10px",
              border: "1px solid rgba(0,242,254,0.15)",
              background: "rgba(0,242,254,0.03)",
              cursor: "pointer",
              transition: "all 0.25s ease",
              "&:hover": {
                background: "rgba(0,242,254,0.08)",
                borderColor: "rgba(0,242,254,0.35)",
                boxShadow: "0 0 14px rgba(0,242,254,0.12)",
              },
            }}
          >
            <Typography sx={{ fontSize: "0.65rem", color: "#00f2fe", fontWeight: 700, letterSpacing: "1.5px" }}>
              ⚙ APPLY FIRST PACKAGE TO ALL WHEELS
            </Typography>
          </Box>
        </Box>
      )}

      {/* Wheel Grid */}
      <Box>
        <Typography sx={{
          fontSize: "0.62rem", fontWeight: 800, color: "#3a5565",
          letterSpacing: "2px", mb: 1.5, display: "block",
        }}>
          WHEEL PACKAGES
        </Typography>

        {wheelOptions.length === 0 ? (
          <Box sx={{ textAlign: "center", py: 3 }}>
            <Typography sx={{ fontSize: "1.8rem", mb: 1, opacity: 0.3 }}>⚙️</Typography>
            <Typography sx={{ color: "#3a5565", fontSize: "0.75rem" }}>
              No wheel packages available
            </Typography>
          </Box>
        ) : (
          <Grid container spacing={1.4}>
            {/* Remove / Original slot */}
            <Grid item xs={6}>
              <Box
                onClick={() => handleSelectWheel(null)}
                sx={{
                  p: 1.5, borderRadius: "12px", cursor: "pointer",
                  display: "flex", flexDirection: "column",
                  alignItems: "center", textAlign: "center",
                  border: !currentWheelUrl
                    ? "1.5px solid rgba(0,242,254,0.7)"
                    : "1.5px solid rgba(44,83,100,0.2)",
                  background: !currentWheelUrl ? "rgba(0,242,254,0.06)" : "rgba(6,14,19,0.5)",
                  transition: "all 0.25s ease",
                  "&:hover": {
                    borderColor: "rgba(0,242,254,0.4)",
                    background: "rgba(0,242,254,0.04)",
                    transform: "translateY(-2px)",
                  },
                }}
              >
                <Typography sx={{ fontSize: "1.4rem", mb: 0.6, opacity: 0.5 }}>◯</Typography>
                <Typography sx={{
                  fontSize: "0.66rem", fontWeight: 700,
                  color: !currentWheelUrl ? "#00f2fe" : "#7a96a5",
                }}>
                  Stock Wheels
                </Typography>
              </Box>
            </Grid>

            {wheelOptions.map((wheel) => (
              <Grid item xs={6} key={wheel._id || wheel.name}>
                <WheelCard
                  wheel={wheel}
                  isSelected={currentWheelUrl === wheel.modelUrl}
                  onClick={() => handleSelectWheel(wheel.modelUrl)}
                />
              </Grid>
            ))}
          </Grid>
        )}
      </Box>

      {/* Mode hint */}
      <Box sx={{
        mt: 2, px: 2, py: 1,
        borderRadius: "10px",
        background: "rgba(0,0,0,0.2)",
        border: "1px solid rgba(0,242,254,0.06)",
        display: "flex", alignItems: "center", gap: 1,
      }}>
        <Box sx={{
          width: 6, height: 6, borderRadius: "50%",
          background: effectivePosition ? "#00f2fe" : "#ffd60a",
          boxShadow: effectivePosition ? "0 0 6px #00f2fe" : "0 0 6px #ffd60a",
          flexShrink: 0,
        }} />
        <Typography sx={{ fontSize: "0.62rem", color: "#4a7a8a", fontWeight: 600 }}>
          {effectivePosition
            ? `Targeting: ${effectivePosition.replace("-", " ").toUpperCase()} only`
            : "No position selected — changes apply to all wheels"}
        </Typography>
      </Box>
    </Box>
  );
}
