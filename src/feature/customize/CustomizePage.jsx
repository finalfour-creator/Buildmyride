"use client";
import { useEffect, useState, useRef, useCallback } from "react";
import { Box, Typography, Button, Tooltip, Snackbar, Alert, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions } from "@mui/material";
import ThreeViewer from "@/components/ui/ThreeViewer";
import PartSelector from "./components/PartSelector";
import apiClient from "@/lib/axios";
import { useSearchParams, useRouter } from "next/navigation";

/* ─── keyframe CSS injected once ─── */
const GLOBAL_STYLES = `
  @keyframes pulseGlow {
    0%, 100% { opacity: 0.6; transform: scale(1); }
    50% { opacity: 1; transform: scale(1.04); }
  }
  @keyframes ripple {
    0% { transform: scale(0); opacity: 0.6; }
    100% { transform: scale(3); opacity: 0; }
  }
  @keyframes scanLine {
    0% { transform: translateY(-100%); }
    100% { transform: translateY(400%); }
  }
  @keyframes attachFlash {
    0%   { opacity: 0; transform: scale(0.85); }
    30%  { opacity: 1; transform: scale(1.06); }
    60%  { opacity: 0.7; transform: scale(0.98); }
    100% { opacity: 0; transform: scale(1); }
  }
  @keyframes dotPulse {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.5); }
  }
  @keyframes borderSpin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
  @keyframes slideInRight {
    from { opacity: 0; transform: translateX(20px); }
    to { opacity: 1; transform: translateX(0); }
  }
  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(8px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes shimmer {
    0% { background-position: -200% center; }
    100% { background-position: 200% center; }
  }
`;

function StyleInjector() {
  useEffect(() => {
    if (document.getElementById("customize-global-styles")) return;
    const tag = document.createElement("style");
    tag.id = "customize-global-styles";
    tag.textContent = GLOBAL_STYLES;
    document.head.appendChild(tag);
  }, []);
  return null;
}

/* ─── Save Status Pill ─── */
function SaveStatusPill({ saveStatus, isModified }) {
  const isUnsaved = saveStatus === "modified" || isModified;
  const color =
    saveStatus === "saving"  ? "#00f2fe" :
    saveStatus === "error"   ? "#ff4d6d" :
    isUnsaved                ? "#ffd60a" : "#39d353";
  const label =
    saveStatus === "saving"  ? "Saving…" :
    saveStatus === "error"   ? "Save Error" :
    isUnsaved                ? "Unsaved Changes" : "All Saved";

  return (
    <Box sx={{
      display: "flex", alignItems: "center", gap: 1,
      px: 1.8, py: 0.65,
      borderRadius: "20px",
      background: "rgba(8,19,24,0.65)",
      border: `1px solid ${color}33`,
      backdropFilter: "blur(8px)",
      animation: "fadeUp 0.4s ease",
    }}>
      <Box sx={{
        width: 7, height: 7, borderRadius: "50%",
        background: color,
        boxShadow: `0 0 8px ${color}`,
        animation: saveStatus === "saving" ? "dotPulse 1s ease infinite" : "none",
      }} />
      <Typography sx={{ color: "#e2e8f0", fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.6px" }}>
        {label}
      </Typography>
    </Box>
  );
}

/* ─── Animated Glow Button ─── */
function GlowButton({ children, onClick, disabled, color = "#00f2fe", danger = false, variant = "outlined", icon, sx = {} }) {
  const [ripples, setRipples] = useState([]);
  const base = danger ? "#ff4d6d" : color;

  const handleClick = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const id = Date.now();
    setRipples(r => [...r, { id, x, y }]);
    setTimeout(() => setRipples(r => r.filter(rr => rr.id !== id)), 600);
    onClick?.(e);
  };

  const isContained = variant === "contained";

  return (
    <Box
      component="button"
      onClick={handleClick}
      disabled={disabled}
      sx={{
        position: "relative", overflow: "hidden",
        display: "inline-flex", alignItems: "center", gap: 0.8,
        px: 2.4, py: 0.85,
        borderRadius: "8px",
        fontFamily: "inherit",
        fontSize: "0.78rem",
        fontWeight: 700,
        letterSpacing: "0.5px",
        cursor: disabled ? "not-allowed" : "pointer",
        border: `1.5px solid ${isContained ? "transparent" : `${base}55`}`,
        background: isContained
          ? `linear-gradient(135deg, ${base}22, ${base}44)`
          : "rgba(8,19,24,0.5)",
        color: isContained ? "#05161e" : base,
        backdropFilter: "blur(8px)",
        transition: "all 0.25s cubic-bezier(0.4,0,0.2,1)",
        opacity: disabled ? 0.5 : 1,
        "&:hover": disabled ? {} : {
          borderColor: base,
          background: isContained
            ? `linear-gradient(135deg, ${base}55, ${base}88)`
            : `${base}11`,
          boxShadow: `0 0 18px ${base}44, 0 0 40px ${base}22`,
          transform: "translateY(-1px) scale(1.02)",
        },
        "&:active": { transform: "scale(0.97) translateY(0)" },
        ...sx,
      }}
    >
      {/* Ripple effects */}
      {ripples.map(r => (
        <Box key={r.id} sx={{
          position: "absolute",
          left: r.x, top: r.y,
          width: 8, height: 8,
          marginLeft: -1, marginTop: -1,
          borderRadius: "50%",
          background: `${base}66`,
          animation: "ripple 0.6s ease-out forwards",
          pointerEvents: "none",
        }} />
      ))}
      {icon && <Box component="span" sx={{ fontSize: "0.9rem", lineHeight: 1 }}>{icon}</Box>}
      {children}
    </Box>
  );
}

/* ─── Part Attach Flash Overlay ─── */
function AttachFlash({ trigger }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!trigger) return;
    setVisible(true);
    const t = setTimeout(() => setVisible(false), 700);
    return () => clearTimeout(t);
  }, [trigger]);

  if (!visible) return null;
  return (
    <Box sx={{
      position: "absolute", inset: 0, zIndex: 10,
      pointerEvents: "none",
      borderRadius: "16px",
      background: "radial-gradient(ellipse at center, rgba(0,242,254,0.18) 0%, transparent 70%)",
      border: "2px solid rgba(0,242,254,0.5)",
      animation: "attachFlash 0.7s ease forwards",
    }}>
      <Typography sx={{
        position: "absolute", top: "50%", left: "50%",
        transform: "translate(-50%,-50%)",
        color: "#00f2fe", fontWeight: 800, fontSize: "0.85rem",
        letterSpacing: "2px", textShadow: "0 0 12px #00f2fe",
        animation: "attachFlash 0.7s ease forwards",
      }}>
        PART ATTACHED
      </Typography>
    </Box>
  );
}

/* ─── Scan Line decoration ─── */
function ScanLine() {
  return (
    <Box sx={{
      position: "absolute", top: 0, left: 0, right: 0,
      height: "2px",
      background: "linear-gradient(90deg, transparent, rgba(0,242,254,0.6), transparent)",
      animation: "scanLine 3s linear infinite",
      pointerEvents: "none",
      zIndex: 5,
    }} />
  );
}

/* ─── Corner brackets ─── */
function CornerBrackets() {
  const style = (pos) => ({
    position: "absolute", width: 16, height: 16,
    pointerEvents: "none", zIndex: 4,
    ...pos,
  });
  const borderBase = "2px solid rgba(0,242,254,0.5)";
  return (
    <>
      <Box sx={{ ...style({ top: 16, left: 16 }), borderTop: borderBase, borderLeft: borderBase }} />
      <Box sx={{ ...style({ top: 16, right: 16 }), borderTop: borderBase, borderRight: borderBase }} />
      <Box sx={{ ...style({ bottom: 16, left: 16 }), borderBottom: borderBase, borderLeft: borderBase }} />
      <Box sx={{ ...style({ bottom: 16, right: 16 }), borderBottom: borderBase, borderRight: borderBase }} />
    </>
  );
}

/* ══════════════════════════════════════════════════════ MAIN PAGE */
export default function CustomizePage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const carId = searchParams.get("carId");

  const viewerRef = useRef(null);
  const [selectedPart, setSelectedPart] = useState("body");
  const [selectedColor, setSelectedColor] = useState("#1e3a5f");

  const [categories, setCategories] = useState([
    { id: "body", name: "BODY PAINT", icon: "●" }
  ]);
  const [availableParts, setAvailableParts] = useState({});

  const [wheels, setWheels] = useState({
    "front-left": null, "front-right": null, "rear-left": null, "rear-right": null,
  });
  const [activeWheelPosition, setActiveWheelPosition] = useState(null);
  const [selectedSpoiler, setSelectedSpoiler] = useState(null);
  const [currentBuild, setCurrentBuild] = useState({});

  // Attach animation trigger
  const [attachTrigger, setAttachTrigger] = useState(0);

  const [designId, setDesignId] = useState(searchParams.get("designId") || null);
  const [saveStatus, setSaveStatus] = useState("saved");
  const [isModified, setIsModified] = useState(false);

  // Delete confirmation dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // Snackbar feedback
  const [snack, setSnack] = useState({ open: false, msg: "", severity: "success" });

  const [modelData, setModelData] = useState(null);
  const [modelUrl, setModelUrl] = useState();
  const [loadingModel, setLoadingModel] = useState(true);

  const colors = modelData?.colors || [];

  const handlePartSelect = useCallback((category, url, slot) => {
    // Spoilers go through the dedicated spoiler system (discoverSpoilerMesh),
    // not the modular anchor system — which requires named nodes in the GLTF.
    if (category.toLowerCase().includes("spoiler")) {
      setSelectedSpoiler(url);
    } else {
      const key = slot || category;
      setCurrentBuild(prev => ({ ...prev, [key]: url }));
    }
    setAttachTrigger(t => t + 1);
  }, []);

  const captureDesignState = () => ({
    carId: modelData?._id || carId,
    paint: { color: selectedColor, finish: "glossy" },
    modularParts: currentBuild,
    wheels,
    spoiler: selectedSpoiler,
  });

  const saveDraft = async () => {
    try {
      setSaveStatus("saving");
      const currentState = captureDesignState();
      const thumbnail = viewerRef.current?.takeScreenshot();
      let response;
      if (designId) {
        response = await apiClient.put(`/designs/${designId}`, { state: currentState, thumbnail });
      } else {
        response = await apiClient.post("/designs", {
          name: `My ${modelData?.name || "Car"}`,
          state: currentState,
          thumbnail,
        });
        // Server may return the design directly ({ _id, ... }) or wrapped ({ design: { _id, ... } })
        const newId = response.data?._id || response.data?.design?._id || response.data?.id;
        if (newId) {
          setDesignId(newId);
          window.history.replaceState(null, "", `/configurator/customization?designId=${newId}`);
        }
      }
      setSaveStatus("saved");
      setIsModified(false);
      setSnack({ open: true, msg: "Design saved successfully!", severity: "success" });
    } catch (error) {
      setSaveStatus("error");
      setSnack({ open: true, msg: "Failed to save design. Please try again.", severity: "error" });
      console.error("[Save] Failed:", error);
    }
  };

  const handleDeleteDesign = async () => {
    if (!designId) return;
    try {
      setSaveStatus("saving");
      await apiClient.delete(`/designs/${designId}`);
      setSnack({ open: true, msg: "Design deleted.", severity: "info" });
      router.push("/configurator/designs");
    } catch (err) {
      setSaveStatus("error");
      setSnack({ open: true, msg: "Failed to delete design.", severity: "error" });
      console.error("[Delete] Failed:", err);
    } finally {
      setDeleteDialogOpen(false);
    }
  };

  // Track modifications after initial hydration
  useEffect(() => {
    if (!loadingModel && modelData) {
      setIsModified(true);
      setSaveStatus("modified");
    }
  }, [selectedColor, currentBuild, wheels, selectedSpoiler]);

  // Camera close-up when switching part categories
  useEffect(() => {
    viewerRef.current?.focusOnPart?.(selectedPart);
  }, [selectedPart]);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoadingModel(true);
        const modelEndpoint = carId ? `/models/${carId}` : "/models";
        const modelRes = await apiClient.get(modelEndpoint);
        const model = Array.isArray(modelRes.data) ? modelRes.data[0] : modelRes.data;

        if (model) {
          setModelData(model);
          setModelUrl(model.chassisUrl || model.modelUrl);

          if (designId) {
            try {
              const designRes = await apiClient.get(`/designs/${designId}`);
              const savedDesign = designRes.data;
              if (savedDesign?.state) {
                const { paint, wheels: savedWheels, modularParts } = savedDesign.state;
                if (paint?.color) setSelectedColor(paint.color);
                if (savedWheels) setWheels(savedWheels);
                if (modularParts) {
                  // Strip any SPOILERS key saved by old code — now handled by dedicated system
                  const spoilerKeys = Object.keys(modularParts).filter(k => k.toLowerCase().includes("spoiler"));
                  const cleanedParts = { ...modularParts };
                  spoilerKeys.forEach(k => delete cleanedParts[k]);
                  setCurrentBuild(cleanedParts);
                  // Migrate legacy spoiler URL to dedicated spoiler state
                  if (!savedDesign.state.spoiler && spoilerKeys.length > 0) {
                    setSelectedSpoiler(modularParts[spoilerKeys[0]]);
                  }
                }
                if (savedDesign.state.spoiler) setSelectedSpoiler(savedDesign.state.spoiler);
              }
            } catch (err) {
              console.error("[Resume] Failed:", err);
            }
          }

          const partsRes = await apiClient.get(`/parts?carId=${model._id}`);
          const parts = partsRes.data;
          const grouped = {};
          const dynamicCategories = [{ id: "body", name: "BODY PAINT", icon: "●" }];

          parts.forEach(part => {
            const catId = part.category.toLowerCase();
            const displayName = part.category.charAt(0).toUpperCase() + part.category.slice(1).toLowerCase();
            if (!grouped[catId]) {
              grouped[catId] = [];
              dynamicCategories.push({ id: catId, name: displayName.toUpperCase(), icon: "▣" });
            }
            grouped[catId].push(part);
          });

          setAvailableParts(grouped);
          setCategories(dynamicCategories);
        }
      } catch (error) {
        console.error("Data fetch error:", error);
      } finally {
        setLoadingModel(false);
      }
    }
    fetchData();
  }, [carId]);

  return (
    <>
      <StyleInjector />

      {/* ══ PAGE ROOT — full-screen showroom ══ */}
      <Box sx={{
        position: "fixed", inset: 0,
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        background: "#03060b",
        fontFamily: "'Inter', 'Roboto', sans-serif",
      }}>

        <Box sx={{ position: "relative", flex: "1 1 auto", minHeight: 0, overflow: "hidden" }}>
          {/* ── 3D Viewer occupies the top area ── */}
          <ThreeViewer
            ref={viewerRef}
            modelPath={modelUrl}
            backgroundColor="#03060b"
            modelColor={selectedPart === "body" ? selectedColor : null}
            wheelReplacements={wheels}
            spoilerReplacement={selectedSpoiler}
            currentBuild={currentBuild}
            onWheelClick={(posId) => {
              setActiveWheelPosition(posId);
              setSelectedPart("wheels");
            }}
            sx={{ position: "absolute", inset: 0 }}
          />

          {/* Attach flash overlay */}
          <AttachFlash trigger={attachTrigger} />

          {/* ── LEFT SPECS PANEL ── */}
          {modelData && (
            <Box sx={{
              position: "absolute",
              left: { xs: 12, md: 28 },
              top: "50%",
              transform: "translateY(-50%)",
              zIndex: 20,
              pointerEvents: "none",
              display: { xs: "none", sm: "flex" },
              flexDirection: "column",
              animation: "fadeUp 0.9s ease 0.5s both",
            }}>
              <Typography sx={{
                color: "rgba(255,255,255,0.28)",
                fontSize: "0.56rem",
                letterSpacing: "0.35em",
                textTransform: "uppercase",
                fontWeight: 700,
                mb: 0.5,
              }}>
                {modelData.brand || "VEHICLE"}
              </Typography>
              <Typography sx={{
                color: "#ffffff",
                fontSize: "clamp(1rem, 2vw, 1.5rem)",
                fontWeight: 900,
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                lineHeight: 1.1,
                mb: 2,
                textShadow: "0 2px 24px rgba(0,0,0,0.9)",
              }}>
                {modelData.name}
              </Typography>
              <Box sx={{ width: 26, height: 1.5, background: "rgba(0,242,254,0.45)", mb: 2.5 }} />
              {[
                { label: "Top Speed", value: modelData.specs?.topSpeed, unit: "mph" },
                { label: "Horsepower", value: modelData.specs?.horsepower, unit: "hp" },
                { label: "0 – 62", value: modelData.specs?.acceleration, unit: "sec" },
              ].map(({ label, value, unit }) => (
                <Box key={label} sx={{ mb: 1.8 }}>
                  <Typography sx={{
                    color: "rgba(255,255,255,0.28)",
                    fontSize: "0.5rem",
                    letterSpacing: "0.22em",
                    textTransform: "uppercase",
                    mb: 0.25,
                  }}>
                    {label}
                  </Typography>
                  <Box sx={{ display: "flex", alignItems: "baseline", gap: 0.5 }}>
                    <Typography sx={{
                      color: value ? "#00f2fe" : "rgba(255,255,255,0.18)",
                      fontSize: value ? "1rem" : "0.8rem",
                      fontWeight: 700,
                      lineHeight: 1.2,
                    }}>
                      {value || "—"}
                    </Typography>
                    {value && (
                      <Typography component="span" sx={{ color: "rgba(0,242,254,0.45)", fontSize: "0.58rem", fontWeight: 400 }}>
                        {unit}
                      </Typography>
                    )}
                  </Box>
                </Box>
              ))}
            </Box>
          )}

          {/* ── GHOSTED CAR NAME ── */}
          {modelData?.name && (
            <Box sx={{
              position: "absolute",
              bottom: 10,
              left: "50%",
              transform: "translateX(-50%)",
              zIndex: 6,
              pointerEvents: "none",
              userSelect: "none",
              whiteSpace: "nowrap",
            }}>
              <Typography sx={{
                fontSize: "clamp(2.5rem, 8vw, 5.5rem)",
                fontWeight: 900,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: "transparent",
                WebkitTextStroke: "0.5px rgba(255,255,255,0.055)",
                lineHeight: 1,
              }}>
                {modelData.name}
              </Typography>
            </Box>
          )}

          {/* ── RIGHT COLOR SWATCHES ── */}
          {selectedPart === "body" && colors.length > 0 && (
            <Box sx={{
              position: "absolute",
              right: { xs: 12, md: 24 },
              top: "50%",
              transform: "translateY(-50%)",
              zIndex: 20,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 1.2,
              animation: "slideInRight 0.4s ease",
            }}>
              <Typography sx={{
                color: "rgba(255,255,255,0.22)",
                fontSize: "0.48rem",
                letterSpacing: "0.3em",
                textTransform: "uppercase",
                writingMode: "vertical-rl",
                transform: "rotate(180deg)",
                mb: 0.5,
              }}>
                PAINT
              </Typography>
              {colors.slice(0, 12).map((c) => {
                const hex = c.value || c;
                return (
                  <Box
                    key={hex}
                    onClick={() => setSelectedColor(hex)}
                    sx={{
                      width: 22, height: 22,
                      borderRadius: "50%",
                      background: hex,
                      border: selectedColor === hex
                        ? "2px solid #00f2fe"
                        : "1.5px solid rgba(255,255,255,0.15)",
                      cursor: "pointer",
                      transition: "all 0.2s",
                      pointerEvents: "all",
                      boxShadow: selectedColor === hex ? `0 0 8px ${hex}99, 0 0 16px ${hex}44` : "none",
                      "&:hover": {
                        transform: "scale(1.3)",
                        border: "1.5px solid rgba(255,255,255,0.45)",
                      },
                    }}
                  />
                );
              })}
            </Box>
          )}

          {/* ── TOP HUD BAR ── */}
          <Box sx={{
            position: "absolute", top: 0, left: 0, right: 0,
            zIndex: 100,
            display: "flex", alignItems: "center", justifyContent: "space-between",
            px: 3, py: 1.5,
            background: "linear-gradient(180deg, rgba(3,6,11,0.92) 0%, rgba(3,6,11,0) 100%)",
            animation: "fadeUp 0.5s ease",
          }}>
          {/* Left: branding */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 2.5 }}>
            <Typography sx={{
              color: "#00f2fe", fontWeight: 900, fontSize: "1rem",
              letterSpacing: "3px", textTransform: "uppercase",
              textShadow: "0 0 20px rgba(0,242,254,0.6)",
            }}>
              BUILDMYRIDE
            </Typography>
            <Box sx={{ width: 1, height: 18, background: "rgba(0,242,254,0.2)" }} />
            <Box>
              <Typography sx={{
                color: "rgba(255,255,255,0.65)", fontSize: "0.72rem",
                fontWeight: 700, letterSpacing: "1.5px", textTransform: "uppercase",
              }}>
                {modelData ? `${modelData.brand || ""} ${modelData.name || ""}`.trim() : "Vehicle Configurator"}
              </Typography>
            </Box>
            <SaveStatusPill saveStatus={saveStatus} isModified={isModified} />
          </Box>

          {/* Right: action buttons */}
          <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
            <GlowButton
              onClick={() => router.push("/configurator/dashboard")}
              color="#00f2fe"
              icon="←"
            >
              Back
            </GlowButton>
            {designId && (
              <GlowButton danger onClick={() => setDeleteDialogOpen(true)} color="#ff4d6d">
                Delete
              </GlowButton>
            )}
            <GlowButton
              onClick={saveDraft}
              disabled={saveStatus === "saving"}
              color="#00f2fe"
              icon={saveStatus === "saving" ? "⏳" : "💾"}
            >
              {saveStatus === "saving" ? "Saving…" : "Save Design"}
            </GlowButton>
          </Box>
        </Box>
        </Box>

        {/* ── BOTTOM PARTS PANEL ── */}
        <Box sx={{
          zIndex: 100,
          height: 260,
          display: "flex", flexDirection: "column",
          background: "rgba(4,8,14,0.96)",
          backdropFilter: "blur(24px)",
          borderTop: "1px solid rgba(0,242,254,0.12)",
          boxShadow: "0 -4px 40px rgba(0,0,0,0.8)",
        }}>
          <Box sx={{
            height: "1.5px", flexShrink: 0,
            background: "linear-gradient(90deg, transparent, rgba(0,242,254,0.5), transparent)",
          }} />

          <Box sx={{ flex: 1, minHeight: 0, overflow: "hidden" }}>
            <PartSelector
              parts={categories}
              selectedPart={selectedPart}
              onSelect={setSelectedPart}
              availableParts={availableParts}
              currentBuild={currentBuild}
              onPartSelect={handlePartSelect}
              selectedColor={selectedColor}
              setSelectedColor={setSelectedColor}
              colorPalette={colors.map(c => c.value)}
              activeWheelPosition={activeWheelPosition}
              wheels={wheels}
              setWheels={setWheels}
              onApplyAllWheels={(url) => setWheels({
                "front-left": url, "front-right": url, "rear-left": url, "rear-right": url,
              })}
            />
          </Box>
        </Box>

        {/* ── CORNER BRACKETS (HUD decoration) ── */}
        <CornerBrackets />
        <ScanLine />

        {/* ══ DELETE CONFIRMATION DIALOG ══ */}
        <Dialog
          open={deleteDialogOpen}
          onClose={() => setDeleteDialogOpen(false)}
          PaperProps={{
            sx: {
              background: "rgba(8,19,24,0.95)",
              border: "1px solid rgba(255,77,109,0.3)",
              borderRadius: "16px",
              backdropFilter: "blur(20px)",
              boxShadow: "0 20px 60px rgba(255,77,109,0.15)",
              color: "#fff",
            }
          }}
        >
          <DialogTitle sx={{ color: "#ff4d6d", fontWeight: 800, fontSize: "1.1rem", pb: 0.5 }}>
            🗑 Delete Design?
          </DialogTitle>
          <DialogContent>
            <DialogContentText sx={{ color: "#8a9aa8", fontSize: "0.88rem" }}>
              This action is permanent. Your saved design will be deleted and cannot be recovered.
            </DialogContentText>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
            <GlowButton onClick={() => setDeleteDialogOpen(false)} color="#8a9aa8">
              Cancel
            </GlowButton>
            <GlowButton danger onClick={handleDeleteDesign} color="#ff4d6d" icon="🗑">
              Delete Permanently
            </GlowButton>
          </DialogActions>
        </Dialog>

        {/* ══ SNACKBAR ══ */}
        <Snackbar
          open={snack.open}
          autoHideDuration={3500}
          onClose={() => setSnack(s => ({ ...s, open: false }))}
          anchorOrigin={{ vertical: "top", horizontal: "center" }}
          sx={{ top: "70px !important" }}
        >
          <Alert
            severity={snack.severity}
            onClose={() => setSnack(s => ({ ...s, open: false }))}
            sx={{
              background: "rgba(8,19,24,0.95)",
              border: `1px solid ${snack.severity === "success" ? "rgba(57,211,83,0.3)" : snack.severity === "error" ? "rgba(255,77,109,0.3)" : "rgba(0,242,254,0.3)"}`,
              borderRadius: "12px",
              backdropFilter: "blur(12px)",
              color: "#e2e8f0",
              "& .MuiAlert-icon": { color: snack.severity === "success" ? "#39d353" : snack.severity === "error" ? "#ff4d6d" : "#00f2fe" },
            }}
          >
            {snack.msg}
          </Alert>
        </Snackbar>

      </Box>
    </>
  );
}