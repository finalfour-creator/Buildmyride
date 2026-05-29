"use client";

import { useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  Button,
  Typography,
  IconButton,
  CircularProgress,
} from "@mui/material";
import useCamera from "./hooks/useCamera";
import ArPartsPanel from "./components/ArPartsPanel";
import ArSelectionSummary from "./components/ArSelectionSummary";
import useYoloDetection from "./hooks/useYoloDetection";
import useYoloSegmentation from "./hooks/useYoloSegmentation";
import useYoloCarParts from "./hooks/useYoloCarParts";
import ArDetectionOverlay from "./components/ArDetectionOverlay";
import ArDetectionStatus from "./components/ArDetectionStatus";
import ArSegmentationOverlay from "./components/ArSegmentationOverlay";
import ArPartsOverlay from "./components/ArPartsOverlay";
import ArThreeOverlay from "./components/ArThreeOverlay";

const INITIAL_WHEELS = {
  "front-left": null,
  "front-right": null,
  "rear-left": null,
  "rear-right": null,
};

export default function ArPreviewPage() {
  const router = useRouter();
  const {
    videoRef,
    error,
    startCamera,
    stopCamera,
    isActive,
    isStarting,
    isMobile,
  } = useCamera();

  const cameraContainerRef = useRef(null);
  const arOverlayRef = useRef(null);

  const {
    bbox,
    detectionMode,
    fps,
    statusMessage,
    isInferring,
  } = useYoloDetection(videoRef, isActive);

  const { carMask, segMode, segFps } =
    useYoloSegmentation(videoRef, isActive);

  const { parts, partsMode, partsFps } =
    useYoloCarParts(videoRef, isActive);

  const [mode, setMode] = useState("car"); // "car" | "parts"
  const [selectedPart, setSelectedPart] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null); // null = green detection mode
  const [arBuild, setArBuild] = useState({});
  const [wheels, setWheels] = useState(INITIAL_WHEELS);
  const [activeWheelPosition] = useState(null);

  const handlePartSelect = useCallback((categoryId, url, slot, meta) => {
    const key = slot || categoryId;

    if (!url) {
      setArBuild((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
      console.log("[AR Phase 3] Cleared part:", key);
      return;
    }

    setArBuild((prev) => ({
      ...prev,
      [key]: {
        partId: meta?._id,
        modelUrl: url,
        name: meta?.name || key,
        category: categoryId,
      },
    }));
    console.log("[AR Phase 5] Part applied on car anchor:", key, meta?.name);
  }, []);

  const handleClose = () => {
    stopCamera();
    router.push("/configurator/dashboard");
  };

  return (
    <Box
      sx={{
        position: "fixed",
        inset: 0,
        display: "flex",
        flexDirection: "column",
        bgcolor: "#0a0f12",
        zIndex: 1200,
      }}
    >
      {/* Top bar */}
      <Box
        sx={{
          height: 56,
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          px: 2,
          borderBottom: "1px solid #2c5364",
          bgcolor: "#0f2027",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <IconButton
            onClick={handleClose}
            sx={{ color: "#fff" }}
            aria-label="Close AR Preview"
          >
            ✕
          </IconButton>
          <Typography variant="h6" sx={{ color: "#fff", fontWeight: 600, fontSize: "1.1rem" }}>
            AR Preview
          </Typography>
        </Box>

        <Button
          variant="outlined"
          size="small"
          disabled
          sx={{
            color: "rgba(255,255,255,0.4)",
            borderColor: "rgba(255,255,255,0.2)",
            textTransform: "none",
          }}
        >
          Save AR Preview (Phase 6)
        </Button>
      </Box>

      {/* Main: camera + parts (column on phone) */}
      <Box
        sx={{
          flex: 1,
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          minHeight: 0,
        }}
      >
        {/* Camera area */}
        <Box
          ref={cameraContainerRef}
          sx={{
            flex: 1,
            minHeight: { xs: "50vh", md: 0 },
            position: "relative",
            bgcolor: "#000",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            overflow: "hidden",
          }}
        >
          <Box
            component="video"
            ref={videoRef}
            autoPlay
            playsInline
            muted
            sx={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
              opacity: isActive ? 1 : 0,
              pointerEvents: "none",
              zIndex: 0,
            }}
          />

          {!isActive && (
            <Box
              sx={{
                textAlign: "center",
                px: 3,
                maxWidth: 420,
              }}
            >
              <Typography variant="h5" sx={{ color: "#fff", fontWeight: 600, mb: 1 }}>
                Live camera
              </Typography>
              <Typography variant="body2" sx={{ color: "#94a3b8", mb: 2 }}>
                Start the camera, then pick parts below (on phone) or on the right — they
                appear on the detected car.
              </Typography>

              {isMobile && (
                <Typography
                  variant="caption"
                  sx={{
                    color: "#ffca28",
                    display: "block",
                    mb: 2,
                    px: 1.5,
                    py: 1,
                    bgcolor: "rgba(255,202,40,0.1)",
                    borderRadius: 1,
                  }}
                >
                  Phone tip: use HTTPS to open this app (not http://192.168…). Allow camera
                  when prompted.
                </Typography>
              )}

              {error && (
                <Typography
                  variant="body2"
                  sx={{ color: "#f44336", mb: 2, bgcolor: "rgba(244,67,54,0.1)", p: 1.5, borderRadius: 1 }}
                >
                  {error}
                </Typography>
              )}

              <Button
                variant="contained"
                onClick={startCamera}
                disabled={isStarting}
                sx={{
                  background: "linear-gradient(135deg, #0f2027, #2c5364)",
                  textTransform: "none",
                  px: 4,
                  py: 1.25,
                }}
              >
                {isStarting ? (
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <CircularProgress size={18} sx={{ color: "#fff" }} />
                    Starting camera…
                  </Box>
                ) : (
                  "Start camera"
                )}
              </Button>
            </Box>
          )}

          {isActive && (
            <Box
              sx={{
                position: "absolute",
                bottom: 16,
                left: 16,
                display: "flex",
                gap: 1,
              }}
            >
              <Button
                size="small"
                variant="contained"
                onClick={stopCamera}
                sx={{
                  bgcolor: "rgba(0,0,0,0.65)",
                  textTransform: "none",
                  "&:hover": { bgcolor: "rgba(0,0,0,0.85)" },
                }}
              >
                Stop camera
              </Button>
            </Box>
          )}

          {isActive && error && (
            <Box
              sx={{
                position: "absolute",
                top: 48,
                left: 12,
                right: 12,
                zIndex: 5,
                p: 1.5,
                borderRadius: 1,
                bgcolor: "rgba(244,67,54,0.9)",
              }}
            >
              <Typography variant="caption" sx={{ color: "#fff" }}>
                {error}
              </Typography>
            </Box>
          )}

          {isActive && !error && (
            <Box
              sx={{
                position: "absolute",
                top: 12,
                left: 12,
                px: 1.5,
                py: 0.5,
                borderRadius: 1,
                bgcolor: "rgba(76, 175, 80, 0.85)",
                zIndex: 3,
              }}
            >
              <Typography variant="caption" sx={{ color: "#fff", fontWeight: 600 }}>
                Camera active
              </Typography>
            </Box>
          )}

          {isActive && bbox && (
            <ArThreeOverlay
              ref={arOverlayRef}
              containerRef={cameraContainerRef}
              videoRef={videoRef}
              bbox={bbox}
              arBuild={arBuild}
              wheels={wheels}
              paintColor={selectedColor}
              applyPaint
            />
          )}

          {/* Pixel-level segmentation mask — rendered below the bbox overlay */}
          {isActive && (
            <ArSegmentationOverlay
              containerRef={cameraContainerRef}
              videoRef={videoRef}
              carMask={carMask}
              paintColor={selectedColor}
            />
          )}

          {/* Segmentation status badge — top-right, only when model is active */}
          {isActive && segMode === "seg" && (
            <Box
              sx={{
                position: "absolute",
                top: 12,
                right: 12,
                zIndex: 4,
                px: 1.5,
                py: 0.5,
                borderRadius: 1,
                bgcolor: carMask
                  ? "rgba(0, 210, 90, 0.18)"
                  : "rgba(15, 32, 39, 0.75)",
                border: "1px solid",
                borderColor: carMask
                  ? "rgba(0, 210, 90, 0.5)"
                  : "#2c5364",
                display: "flex",
                alignItems: "center",
                gap: 0.75,
              }}
            >
              <Box
                sx={{
                  width: 7,
                  height: 7,
                  borderRadius: "50%",
                  bgcolor: carMask ? "#00d25a" : "#64748b",
                  animation: carMask ? "pulse 1s infinite" : "none",
                  "@keyframes pulse": {
                    "0%, 100%": { opacity: 1 },
                    "50%": { opacity: 0.3 },
                  },
                }}
              />
              <Typography
                variant="caption"
                sx={{
                  color: carMask ? "#00d25a" : "#64748b",
                  fontWeight: 700,
                  lineHeight: 1,
                }}
              >
                SEG {segFps}/s
              </Typography>
            </Box>
          )}

          {/* Car-parts detection overlay — coloured boxes per detected part */}
          {isActive && partsMode === "parts" && (
            <ArPartsOverlay
              containerRef={cameraContainerRef}
              videoRef={videoRef}
              parts={parts}
              selectedPart={selectedPart}
            />
          )}

          {/* Parts status badge */}
          {isActive && partsMode === "parts" && (
            <Box
              sx={{
                position: "absolute",
                top: 44,
                right: 12,
                zIndex: 4,
                px: 1.5,
                py: 0.5,
                borderRadius: 1,
                bgcolor: parts
                  ? "rgba(255, 107, 53, 0.18)"
                  : "rgba(15, 32, 39, 0.75)",
                border: "1px solid",
                borderColor: parts ? "rgba(255,107,53,0.5)" : "#2c5364",
                display: "flex",
                alignItems: "center",
                gap: 0.75,
              }}
            >
              <Box
                sx={{
                  width: 7,
                  height: 7,
                  borderRadius: "50%",
                  bgcolor: parts ? "#ff6b35" : "#64748b",
                  animation: parts ? "pulse 1s infinite" : "none",
                  "@keyframes pulse": {
                    "0%, 100%": { opacity: 1 },
                    "50%": { opacity: 0.3 },
                  },
                }}
              />
              <Typography
                variant="caption"
                sx={{ color: parts ? "#ff6b35" : "#64748b", fontWeight: 700, lineHeight: 1 }}
              >
                PARTS {partsFps}/s
              </Typography>
            </Box>
          )}

          {/* Show bounding box only when there is no seg mask (box = fallback) */}
          {isActive && !carMask && (
            <ArDetectionOverlay
              containerRef={cameraContainerRef}
              videoRef={videoRef}
              bbox={bbox}
              detectionMode={detectionMode}
            />
          )}

          {isActive && (
            <ArDetectionStatus
              detectionMode={detectionMode}
              fps={fps}
              statusMessage={statusMessage}
              isInferring={isInferring}
            />
          )}

          {isActive && (
            <ArSelectionSummary
              arBuild={arBuild}
              wheels={wheels}
              selectedColor={selectedColor}
            />
          )}
        </Box>

        <ArPartsPanel
          mode={mode}
          setMode={setMode}
          selectedColor={selectedColor}
          setSelectedColor={setSelectedColor}
          selectedPart={selectedPart}
          setSelectedPart={setSelectedPart}
        />
      </Box>
    </Box>
  );
}
