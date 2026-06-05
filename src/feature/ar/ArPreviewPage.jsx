"use client";

import { useState, useCallback, useRef, useEffect } from "react";
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
import useViewAlignment from "./hooks/useViewAlignment";
import ArDetectionOverlay from "./components/ArDetectionOverlay";
import ArDetectionStatus from "./components/ArDetectionStatus";
import ArSegmentationOverlay from "./components/ArSegmentationOverlay";
import ArPartsOverlay from "./components/ArPartsOverlay";
import ArThreeOverlay from "./components/ArThreeOverlay";
import ArTemplateOverlay from "./components/ArTemplateOverlay";
import ArViewSelector from "./components/ArViewSelector";
import ArAnchoredModels from "./components/ArAnchoredModels";
import { ANCHOR_CONFIG } from "./lib/arTemplateConfig";

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

  const [mode,           setMode]           = useState("car"); // "car"|"parts"|"template"
  const [selectedPart,   setSelectedPart]   = useState(null);
  const [selectedColor,  setSelectedColor]  = useState(null);
  const [arBuild,        setArBuild]        = useState({});
  const [wheels,         setWheels]         = useState(INITIAL_WHEELS);
  const [activeWheelPosition]               = useState(null);
  // Template mode state
  const [selectedView,   setSelectedView]   = useState(null);       // "front"|"left"|"right"|"rear"
  const [enabledAnchors, setEnabledAnchors] = useState(new Set());  // anchor keys to render

  // Automatically enable all assets for the selected view by default
  useEffect(() => {
    if (selectedView) {
      const anchors = ANCHOR_CONFIG[selectedView] ?? {};
      setEnabledAnchors(new Set(Object.keys(anchors)));
    } else {
      setEnabledAnchors(new Set());
    }
  }, [selectedView]);

  const isTemplateMode = mode === "template";
  const isCarMode      = mode === "car";
  const isPartsMode    = mode === "parts";

  // Segmentation runs in both "car" and "template" modes
  const { carMask, segMode, segFps } =
    useYoloSegmentation(videoRef, isActive && (isCarMode || isTemplateMode));

  // Detection runs in "car" mode; also feeds alignment in "template" mode
  const {
    bbox,
    detectionMode,
    fps,
    statusMessage,
    isInferring,
  } = useYoloDetection(videoRef, isActive && (isCarMode || isTemplateMode));

  const { parts, partsMode, partsFps } =
    useYoloCarParts(videoRef, isActive && (isPartsMode || isTemplateMode || isCarMode));


  // Template alignment — uses seg mask + bbox to measure car-to-template fill
  const { alignScore, isLocked, overlayBox, unlock } = useViewAlignment(
    isTemplateMode ? carMask : null,
    isTemplateMode ? bbox    : null,
    videoRef,
    cameraContainerRef,
    selectedView,
  );

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
              parts={parts}
              paintColor={selectedColor}
              applyPaint
            />
          )}

          {/* Pixel-level segmentation mask — only in Whole Car mode */}
          {isActive && mode === "car" && (
            <ArSegmentationOverlay
              containerRef={cameraContainerRef}
              videoRef={videoRef}
              carMask={carMask}
              paintColor={selectedColor}
            />
          )}

          {/* Segmentation status badge — top-right, only when model is active */}
          {isActive && mode === "car" && segMode === "seg" && (
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

          {/* Car-parts detection overlay — only in Car Parts mode */}
          {isActive && mode === "parts" && partsMode === "parts" && (
            <ArPartsOverlay
              containerRef={cameraContainerRef}
              videoRef={videoRef}
              parts={parts}
              selectedPart={selectedPart}
            />
          )}

          {/* Parts status badge */}
          {isActive && mode === "parts" && partsMode === "parts" && (
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

          {/* Detection bbox fallback — only when no seg mask and not in template mode */}
          {isActive && isCarMode && !carMask && (
            <ArDetectionOverlay
              containerRef={cameraContainerRef}
              videoRef={videoRef}
              bbox={bbox}
              detectionMode={detectionMode}
            />
          )}

          {isActive && isCarMode && (
            <ArDetectionStatus
              detectionMode={detectionMode}
              fps={fps}
              statusMessage={statusMessage}
              isInferring={isInferring}
            />
          )}

          {isActive && isCarMode && (
            <ArSelectionSummary
              arBuild={arBuild}
              wheels={wheels}
              selectedColor={selectedColor}
            />
          )}

          {/* ── Template AR mode overlays ─────────────────────────────────── */}
          {isActive && isTemplateMode && (
            <ArViewSelector
              selectedView={selectedView}
              onSelectView={(view) => {
                if (view === selectedView) unlock();
                setSelectedView(view);
              }}
              isLocked={isLocked}
            />
          )}

          {/* Outlines completely removed. Snapping directly to detected car parts. */}

          {isActive && isTemplateMode && (
            <ArAnchoredModels
              containerRef={cameraContainerRef}
              videoRef={videoRef}
              selectedView={selectedView}
              isLocked={isLocked}
              enabledAnchors={enabledAnchors}
              paintColor={selectedColor}
              overlayBox={overlayBox}
              parts={parts}
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
          selectedView={selectedView}
          enabledAnchors={enabledAnchors}
          setEnabledAnchors={setEnabledAnchors}
          isLocked={isLocked}
        />
      </Box>
    </Box>
  );
}
