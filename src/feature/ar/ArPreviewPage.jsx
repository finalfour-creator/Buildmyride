"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Box, Typography, CircularProgress, Snackbar, Alert } from "@mui/material";
import {
  HudStyleInjector,
  GlowButton,
  SaveStatusPill,
  ScanLine,
  CornerBrackets,
} from "@/components/hud";
import { captureArFrame, downloadBlob, shareBlob } from "./lib/arCapture";
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
  const [partColors,     setPartColors]     = useState({});         // { hood, front_bumper, rear_bumper }

  // Capture / compare controls
  const [showOverlays, setShowOverlays] = useState(true);  // false = "before" (raw camera)
  const [isCapturing,  setIsCapturing]  = useState(false);
  const [snack, setSnack] = useState({ open: false, msg: "", severity: "success" });

  // Automatically enable all assets for the selected view by default.
  // v2 wheel variants are excluded — they are activated by the Wheel Style picker.
  useEffect(() => {
    if (selectedView) {
      const anchors = ANCHOR_CONFIG[selectedView] ?? {};
      setEnabledAnchors(
        new Set(Object.keys(anchors).filter((k) => !k.endsWith("_v2")))
      );
    } else {
      setEnabledAnchors(new Set());
    }
  }, [selectedView]);

  const isTemplateMode = mode === "template";
  const isCarMode      = mode === "car";
  const isPartsMode    = mode === "parts";

  // Segmentation only drives the paint overlay, which is gated to "car" mode.
  // Template mode does NOT consume carMask (useViewAlignment ignores it), so we
  // skip this 14 MB model there to keep template inference fast.
  const { carMask, segMode, segFps } =
    useYoloSegmentation(videoRef, isActive && isCarMode);

  // Detection runs in "car" mode; also anchors 3D models in "template" mode
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

  // Composite the camera + overlays into a PNG. Screenshots always include the
  // customization (overlays are forced on for the capture frame).
  const grabFrame = useCallback(async () => {
    const wasHidden = !showOverlays;
    if (wasHidden) setShowOverlays(true);
    // Let React paint the overlays + Three.js render one frame before reading.
    await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
    const blob = await captureArFrame(cameraContainerRef.current);
    return blob;
  }, [showOverlays]);

  const handleScreenshot = useCallback(async () => {
    if (isCapturing) return;
    setIsCapturing(true);
    try {
      const blob = await grabFrame();
      downloadBlob(blob, `buildmyride-ar-${Date.now()}.png`);
      setSnack({ open: true, msg: "Screenshot saved", severity: "success" });
    } catch (err) {
      console.error("[AR Screenshot]", err);
      setSnack({ open: true, msg: "Couldn't capture screenshot", severity: "error" });
    } finally {
      setIsCapturing(false);
    }
  }, [grabFrame, isCapturing]);

  const handleShare = useCallback(async () => {
    if (isCapturing) return;
    setIsCapturing(true);
    try {
      const blob = await grabFrame();
      const result = await shareBlob(blob, {
        filename: `buildmyride-ar-${Date.now()}.png`,
        title: "My BuildMyRide AR build",
        text: "Customized in AR with BuildMyRide",
      });
      setSnack({
        open: true,
        msg: result === "shared" ? "Shared!" : "Share not supported — image downloaded",
        severity: "success",
      });
    } catch (err) {
      console.error("[AR Share]", err);
      setSnack({ open: true, msg: "Couldn't share image", severity: "error" });
    } finally {
      setIsCapturing(false);
    }
  }, [grabFrame, isCapturing]);

  return (
    <Box
      sx={{
        position: "fixed",
        inset: 0,
        display: "flex",
        flexDirection: "column",
        bgcolor: "#03060b",
        fontFamily: "'Inter', 'Roboto', sans-serif",
        zIndex: 1200,
      }}
    >
      <HudStyleInjector />

      {/* Top HUD bar */}
      <Box
        sx={{
          height: 56,
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          px: 3,
          borderBottom: "1px solid rgba(0,242,254,0.12)",
          background: "linear-gradient(180deg, rgba(3,6,11,0.92) 0%, rgba(3,6,11,0.6) 100%)",
          animation: "fadeUp 0.5s ease",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 2.5 }}>
          <Typography
            sx={{
              color: "#00f2fe",
              fontWeight: 900,
              fontSize: "1rem",
              letterSpacing: "3px",
              textTransform: "uppercase",
              textShadow: "0 0 20px rgba(0,242,254,0.6)",
            }}
          >
            BUILDMYRIDE
          </Typography>
          <Box sx={{ width: 1, height: 18, background: "rgba(0,242,254,0.2)" }} />
          <Typography
            sx={{
              color: "rgba(255,255,255,0.65)",
              fontSize: "0.72rem",
              fontWeight: 700,
              letterSpacing: "1.5px",
              textTransform: "uppercase",
            }}
          >
            AR Preview
          </Typography>
          <SaveStatusPill saveStatus="saved" />
        </Box>

        <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
          <GlowButton onClick={handleClose} color="#00f2fe" icon="←">
            Back
          </GlowButton>
          <GlowButton disabled color="#00f2fe" icon="💾">
            Save AR Build
          </GlowButton>
        </Box>
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

              <GlowButton
                variant="contained"
                onClick={startCamera}
                disabled={isStarting}
                color="#00f2fe"
                icon={isStarting ? null : "📷"}
                sx={{ px: 4, py: 1.25, fontSize: "0.85rem" }}
              >
                {isStarting ? (
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <CircularProgress size={16} sx={{ color: "#05161e" }} />
                    Starting camera…
                  </Box>
                ) : (
                  "Start camera"
                )}
              </GlowButton>
            </Box>
          )}

          {isActive && (
            <Box
              sx={{
                position: "absolute",
                bottom: 16,
                left: 16,
                right: 16,
                zIndex: 6,
                display: "flex",
                flexWrap: "wrap",
                gap: 1,
                alignItems: "center",
              }}
            >
              <GlowButton onClick={stopCamera} danger color="#ff4d6d" icon="⏹">
                Stop
              </GlowButton>

              <Box sx={{ flex: 1 }} />

              <GlowButton
                onClick={() => setShowOverlays((v) => !v)}
                color="#00f2fe"
                icon={showOverlays ? "👁" : "🚗"}
                sx={{ opacity: showOverlays ? 1 : 0.85 }}
              >
                {showOverlays ? "View Original" : "View Custom"}
              </GlowButton>
              <GlowButton
                onClick={handleScreenshot}
                disabled={isCapturing}
                color="#00f2fe"
                icon="📸"
              >
                {isCapturing ? "…" : "Photo"}
              </GlowButton>
              <GlowButton
                onClick={handleShare}
                disabled={isCapturing}
                variant="contained"
                color="#00f2fe"
                icon="↗"
              >
                Share
              </GlowButton>
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
                borderRadius: "20px",
                bgcolor: "rgba(57,211,83,0.15)",
                border: "1px solid rgba(57,211,83,0.4)",
                backdropFilter: "blur(8px)",
                display: "flex",
                alignItems: "center",
                gap: 0.75,
                zIndex: 3,
              }}
            >
              <Box
                sx={{
                  width: 7,
                  height: 7,
                  borderRadius: "50%",
                  bgcolor: "#39d353",
                  boxShadow: "0 0 8px #39d353",
                  animation: "dotPulse 1.4s ease infinite",
                }}
              />
              <Typography variant="caption" sx={{ color: "#39d353", fontWeight: 700, letterSpacing: "0.6px" }}>
                Camera active
              </Typography>
            </Box>
          )}

          {isActive && bbox && showOverlays && (
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
          {isActive && mode === "car" && showOverlays && (
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
          {isActive && mode === "parts" && partsMode === "parts" && showOverlays && (
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

          {isActive && isTemplateMode && showOverlays && (
            <ArAnchoredModels
              containerRef={cameraContainerRef}
              videoRef={videoRef}
              selectedView={selectedView}
              isLocked={isLocked}
              enabledAnchors={enabledAnchors}
              paintColor={selectedColor}
              overlayBox={overlayBox}
              parts={parts}
              partColors={partColors}
            />
          )}

          {/* HUD framing — matches the configurator viewport */}
          {isActive && (
            <>
              <CornerBrackets />
              <ScanLine />
            </>
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
          partColors={partColors}
          setPartColors={setPartColors}
        />
      </Box>

      <Snackbar
        open={snack.open}
        autoHideDuration={3000}
        onClose={() => setSnack((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          severity={snack.severity}
          onClose={() => setSnack((s) => ({ ...s, open: false }))}
          sx={{
            background: "rgba(8,19,24,0.95)",
            border: `1px solid ${snack.severity === "success" ? "rgba(57,211,83,0.3)" : "rgba(255,77,109,0.3)"}`,
            borderRadius: "12px",
            backdropFilter: "blur(12px)",
            color: "#e2e8f0",
            "& .MuiAlert-icon": {
              color: snack.severity === "success" ? "#39d353" : "#ff4d6d",
            },
          }}
        >
          {snack.msg}
        </Alert>
      </Snackbar>
    </Box>
  );
}
