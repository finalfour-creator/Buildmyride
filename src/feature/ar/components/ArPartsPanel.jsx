"use client";

import { Box, Typography, Button } from "@mui/material";
import { PART_CLASSES, PART_COLORS } from "../lib/yoloCarParts";
import BodyOptions from "@/feature/customize/components/BodyOptions";

/**
 * Right-side panel with two detection modes:
 *
 *  "car"   — whole-car segmentation (YOLOv8-seg).
 *            Shows the colour picker; the selected colour is painted over
 *            the full car mask in real time.
 *
 *  "parts" — per-part detection (custom YOLOv8-pt).
 *            Shows a button for every detectable part; clicking one
 *            highlights that part's bounding box in the overlay.
 */
export default function ArPartsPanel({
  mode,
  setMode,
  selectedColor,
  setSelectedColor,
  selectedPart,
  setSelectedPart,
}) {
  return (
    <Box
      sx={{
        width: { xs: "100%", md: 320 },
        flexShrink: 0,
        height: { xs: "42vh", md: "100%" },
        display: "flex",
        flexDirection: "column",
        bgcolor: "#0f2027",
        borderLeft: { md: "1px solid #2c5364" },
        borderTop: { xs: "1px solid #2c5364", md: "none" },
      }}
    >
      {/* ── Header ── */}
      <Box sx={{ p: 2, borderBottom: "1px solid #2c5364", flexShrink: 0 }}>
        <Typography
          variant="caption"
          sx={{ color: "#8a9aa8", letterSpacing: 1, fontWeight: 700, display: "block", mb: 1.5 }}
        >
          DETECTION MODE
        </Typography>

        {/* Mode toggle */}
        <Box sx={{ display: "flex", gap: 1 }}>
          <Button
            size="small"
            fullWidth
            onClick={() => setMode("car")}
            variant={mode === "car" ? "contained" : "outlined"}
            sx={{
              textTransform: "none",
              fontWeight: 600,
              fontSize: "0.78rem",
              ...(mode === "car"
                ? {
                    background: "linear-gradient(135deg, #0f2027, #2c5364)",
                    color: "#00d25a",
                    border: "1px solid #00d25a44",
                  }
                : {
                    color: "#64748b",
                    borderColor: "#2c5364",
                    "&:hover": { borderColor: "#00d25a66", color: "#00d25a" },
                  }),
            }}
          >
            ● Whole Car
          </Button>

          <Button
            size="small"
            fullWidth
            onClick={() => setMode("parts")}
            variant={mode === "parts" ? "contained" : "outlined"}
            sx={{
              textTransform: "none",
              fontWeight: 600,
              fontSize: "0.78rem",
              ...(mode === "parts"
                ? {
                    background: "linear-gradient(135deg, #0f2027, #2c5364)",
                    color: "#ff6b35",
                    border: "1px solid #ff6b3544",
                  }
                : {
                    color: "#64748b",
                    borderColor: "#2c5364",
                    "&:hover": { borderColor: "#ff6b3566", color: "#ff6b35" },
                  }),
            }}
          >
            ▣ Car Parts
          </Button>
        </Box>
      </Box>

      {/* ── Scrollable content ── */}
      <Box sx={{ flex: 1, overflowY: "auto", minHeight: 0 }}>

        {/* Whole Car — colour picker */}
        {mode === "car" && (
          <BodyOptions
            selectedColor={selectedColor}
            setSelectedColor={setSelectedColor}
          />
        )}

        {/* Car Parts — part selector */}
        {mode === "parts" && (
          <Box sx={{ p: 2 }}>
            <Typography
              variant="caption"
              sx={{ color: "#8a9aa8", letterSpacing: 1, fontWeight: 700, display: "block", mb: 1 }}
            >
              SELECT A PART TO HIGHLIGHT
            </Typography>

            <Typography variant="caption" sx={{ color: "#64748b", display: "block", mb: 2 }}>
              Detected parts appear with coloured boxes.
              Tap one to highlight it.
            </Typography>

            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
              {PART_CLASSES.map((name, i) => {
                const color   = PART_COLORS[i % PART_COLORS.length];
                const active  = selectedPart === name;
                return (
                  <Button
                    key={name}
                    size="small"
                    onClick={() => setSelectedPart(active ? null : name)}
                    sx={{
                      textTransform: "none",
                      fontWeight: active ? 700 : 400,
                      fontSize: "0.78rem",
                      px: 1.5,
                      py: 0.6,
                      borderRadius: "6px",
                      border: `1.5px solid ${active ? color : color + "55"}`,
                      bgcolor: active ? color + "28" : "transparent",
                      color: active ? color : "#94a3b8",
                      transition: "all 0.15s",
                      "&:hover": {
                        bgcolor: color + "20",
                        borderColor: color,
                        color,
                      },
                    }}
                  >
                    <Box
                      component="span"
                      sx={{
                        display: "inline-block",
                        width: 8,
                        height: 8,
                        borderRadius: "50%",
                        bgcolor: color,
                        mr: 0.75,
                        flexShrink: 0,
                      }}
                    />
                    {name}
                  </Button>
                );
              })}
            </Box>

            {selectedPart && (
              <Box
                sx={{
                  mt: 2,
                  p: 1.25,
                  borderRadius: 1,
                  bgcolor: "rgba(255,107,53,0.08)",
                  border: "1px solid rgba(255,107,53,0.25)",
                }}
              >
                <Typography variant="caption" sx={{ color: "#ff6b35", fontWeight: 600 }}>
                  Highlighting: {selectedPart}
                </Typography>
                <Typography variant="caption" sx={{ color: "#64748b", display: "block", mt: 0.25 }}>
                  Point the camera at the car to detect it.
                </Typography>
              </Box>
            )}
          </Box>
        )}
      </Box>
    </Box>
  );
}
