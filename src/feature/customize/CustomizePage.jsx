"use client";
import { useEffect, useState, useRef } from "react";
import { Box, Typography, Button } from "@mui/material";
import ThreeViewer from "@/components/ui/ThreeViewer";
import PartSelector from "./components/PartSelector";
import AiChatbox from "./components/AiChatbox";
import apiClient from "@/lib/axios";
import { useSearchParams } from "next/navigation";

/* ── Design tokens ───────────────────────────────────────────── */
const T = {
  cp:  "#00ffcc",
  cs:  "#ff0077",
  ca:  "#ffcc00",
  bg:  "#0e2840",
  txt: "#e8eaf6",
  gb:  "rgba(10,14,30,.72)",
  gbr: "rgba(0,255,204,.14)",
};

const glass = {
  background: T.gb,
  backdropFilter: "blur(20px)",
  WebkitBackdropFilter: "blur(20px)",
  border: `1px solid ${T.gbr}`,
};

/* Static categories always present */
const STATIC_CATEGORIES = [
  { id: "body",     name: "BODY PAINT", icon: "◉" },
  { id: "interior", name: "INTERIOR",   icon: "◈" },
  { id: "lighting", name: "LIGHTING",   icon: "◑" },
  { id: "sound",    name: "SOUND",      icon: "◎" },
];

export default function CustomizePage() {
  const searchParams = useSearchParams();
  const carId = searchParams.get("carId");

  const viewerRef = useRef(null);
  const [selectedPart, setSelectedPart]   = useState("body");
  const [selectedColor, setSelectedColor] = useState("#1e3a5f");

  const [categories, setCategories]       = useState(STATIC_CATEGORIES);
  const [availableParts, setAvailableParts] = useState({});

  const [wheels, setWheels] = useState({
    "front-left": null, "front-right": null, "rear-left": null, "rear-right": null,
  });
  const [activeWheelPosition, setActiveWheelPosition] = useState(null);
  const [selectedSpoiler, setSelectedSpoiler]         = useState(null);
  const [currentBuild, setCurrentBuild]               = useState({});

  const [designId, setDesignId]   = useState(searchParams.get("designId") || null);
  const [saveStatus, setSaveStatus] = useState("saved");

  const [isChatOpen, setIsChatOpen]   = useState(false);
  const [modelData, setModelData]     = useState(null);
  const [modelUrl, setModelUrl]       = useState();
  const [loadingModel, setLoadingModel] = useState(true);

  const colors = modelData?.colors || [];

  const handlePartSelect = (category, url, slot) => {
    const key = slot || category;
    setCurrentBuild(prev => ({ ...prev, [key]: url }));
    if (category.toLowerCase() === "spoiler") setSelectedSpoiler(url);
  };

  const captureDesignState = () => ({
    carId: modelData?._id || carId,
    paint: { color: selectedColor, finish: "glossy" },
    modularParts: currentBuild,
    wheels,
  });

  const saveDraft = async () => {
    try {
      setSaveStatus("saving");
      const currentState = captureDesignState();
      const thumbnail    = viewerRef.current?.takeScreenshot();
      let response;
      if (designId) {
        response = await apiClient.put(`/designs/${designId}`, { state: currentState, thumbnail });
      } else {
        response = await apiClient.post("/designs", {
          name: `My ${modelData?.name || "Car"}`, state: currentState, thumbnail,
        });
        setDesignId(response.data._id);
      }
      setSaveStatus("saved");
      console.log("[Auto-Save] Draft saved:", response.data._id);
    } catch (error) {
      setSaveStatus("error");
      console.error("[Auto-Save] Failed:", error);
    }
  };

  useEffect(() => {
    if (!modelData) return;
    const timer = setTimeout(() => saveDraft(), 2000);
    return () => clearTimeout(timer);
  }, [selectedColor, currentBuild, wheels, modelData]);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoadingModel(true);
        const modelEndpoint = carId ? `/models/${carId}` : "/models";
        const modelRes = await apiClient.get(modelEndpoint);
        const model    = Array.isArray(modelRes.data) ? modelRes.data[0] : modelRes.data;

        if (model) {
          setModelData(model);
          setModelUrl(model.chassisUrl || model.modelUrl);

          if (designId) {
            try {
              const designRes  = await apiClient.get(`/designs/${designId}`);
              const savedDesign = designRes.data;
              if (savedDesign?.state) {
                const { paint, wheels: sw, modularParts } = savedDesign.state;
                if (paint?.color)  setSelectedColor(paint.color);
                if (sw)            setWheels(sw);
                if (modularParts)  setCurrentBuild(modularParts);
              }
            } catch { /* silent */ }
          }

          const partsRes = await apiClient.get(`/parts?carId=${model._id}`);
          const parts    = partsRes.data;
          const grouped  = {};
          const dbCategories = [];

          parts.forEach(part => {
            const catId = part.category.toLowerCase();
            const displayName = part.category.charAt(0).toUpperCase() + part.category.slice(1).toLowerCase();
            if (!grouped[catId]) {
              grouped[catId] = [];
              dbCategories.push({ id: catId, name: displayName.toUpperCase(), icon: "▣" });
            }
            grouped[catId].push(part);
          });

          setAvailableParts(grouped);
          setCategories([
            STATIC_CATEGORIES[0],
            ...dbCategories,
            ...STATIC_CATEGORIES.slice(1),
          ]);
        }
      } catch (error) {
        console.error("Data fetch error:", error);
      } finally {
        setLoadingModel(false);
      }
    }
    fetchData();
  }, [carId]);

  const saveStatusColor = saveStatus === "saving" ? T.ca : saveStatus === "error" ? T.cs : T.cp;
  const saveStatusLabel = saveStatus === "saving" ? "SAVING…" : saveStatus === "error" ? "ERROR" : "SAVED";

  /* Active category object (used to filter PartSelector to one item) */
  const activeCategory = categories.find(c => c.id === selectedPart) || categories[0];

  return (
    <Box sx={{ position: "fixed", inset: 0, overflow: "hidden", background: "#050811" }}>

      {/* Subtle grid overlay */}
      <Box sx={{
        position: "absolute", inset: 0, pointerEvents: "none", zIndex: 0,
        backgroundImage: `
          linear-gradient(rgba(0,255,204,.02) 1px, transparent 1px),
          linear-gradient(90deg, rgba(0,255,204,.02) 1px, transparent 1px)
        `,
        backgroundSize: "60px 60px",
      }} />

      {/* ── 3D Viewer — fills the entire viewport ─────────── */}
      <Box sx={{ position: "absolute", inset: 0, zIndex: 1 }}>
        <ThreeViewer
          ref={viewerRef}
          modelPath={modelUrl}
          backgroundColor="transparent"
          modelColor={selectedPart === "body" ? selectedColor : null}
          wheelReplacements={wheels}
          spoilerReplacement={selectedSpoiler}
          currentBuild={currentBuild}
          onWheelClick={(posId) => { setActiveWheelPosition(posId); setSelectedPart("wheels"); }}
          sx={{ height: "100%", width: "100%" }}
        />
      </Box>

      {/* ── Fixed bottom control bar ───────────────────────── */}
      <Box sx={{
        position: "fixed",
        bottom: 0, left: 0, right: 0,
        zIndex: 10,
        background: "rgba(5,8,17,0.90)",
        backdropFilter: "blur(24px)",
        WebkitBackdropFilter: "blur(24px)",
        borderTop: `1px solid ${T.gbr}`,
      }}>

        {/* Row 1 — model info + save status + action buttons */}
        <Box sx={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          px: 3, py: 1,
          borderBottom: `1px solid rgba(0,255,204,0.08)`,
        }}>

          {/* Left: studio label + save indicator */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Box>
              <Typography sx={{
                fontFamily: "var(--font-display)",
                fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.15em",
                color: T.cp, textTransform: "uppercase",
              }}>
                // DESIGN STUDIO
              </Typography>
              <Typography sx={{ fontFamily: "var(--font-body)", fontSize: "0.72rem",
                color: "rgba(232,234,246,.45)", mt: 0.2 }}>
                {modelData?.name || "Honda City"} &middot; Configure your vehicle
              </Typography>
            </Box>

            <Box sx={{ display: "flex", alignItems: "center", gap: 1,
              px: 1.5, py: 0.5, background: "rgba(0,0,0,.3)", border: `1px solid ${T.gbr}` }}>
              <Box sx={{ width: 7, height: 7, borderRadius: "50%",
                background: saveStatusColor, boxShadow: `0 0 6px ${saveStatusColor}` }} />
              <Typography sx={{ fontFamily: "var(--font-display)", fontSize: "0.56rem",
                fontWeight: 700, letterSpacing: "0.12em", color: saveStatusColor }}>
                {saveStatusLabel}
              </Typography>
            </Box>
          </Box>

          {/* Right: action buttons */}
          <Box sx={{ display: "flex", gap: 1.5 }}>
            <Box
              onClick={saveDraft}
              sx={{
                fontFamily: "var(--font-display)", fontSize: "0.6rem", fontWeight: 700,
                letterSpacing: "0.12em", color: T.cp, background: "transparent",
                border: `1px solid ${T.gbr}`, px: 2, py: 0.8,
                textTransform: "uppercase", cursor: "pointer", transition: "all .3s",
                "&:hover": { background: "rgba(0,255,204,.1)", borderColor: T.cp },
              }}
            >
              {saveStatus === "saving" ? "Saving…" : "Save Config"}
            </Box>

            <Box
              onClick={() => setIsChatOpen(true)}
              sx={{
                fontFamily: "var(--font-display)", fontSize: "0.6rem", fontWeight: 700,
                letterSpacing: "0.12em", color: T.bg,
                background: `linear-gradient(135deg, ${T.cp}, #0088ff)`,
                px: 2, py: 0.8, textTransform: "uppercase", cursor: "pointer",
                clipPath: "polygon(8px 0%,100% 0%,calc(100% - 8px) 100%,0% 100%)",
                "&:hover": { opacity: 0.88 },
              }}
            >
              AI ASSISTANT
            </Box>
          </Box>
        </Box>

        {/* Row 2 — horizontal category tabs */}
        <Box sx={{
          display: "flex",
          overflowX: "auto",
          borderBottom: `1px solid rgba(0,255,204,0.08)`,
          scrollbarWidth: "none",
          "&::-webkit-scrollbar": { display: "none" },
        }}>
          {categories.map((cat) => {
            const active = selectedPart === cat.id;
            return (
              <Box
                key={cat.id}
                onClick={() => setSelectedPart(cat.id)}
                sx={{
                  display: "flex", alignItems: "center", gap: 1,
                  px: 2.5, py: 1.1, flexShrink: 0, cursor: "pointer",
                  borderRight: `1px solid rgba(0,255,204,0.07)`,
                  borderBottom: active ? `2px solid ${T.cp}` : "2px solid transparent",
                  background: active ? "rgba(0,255,204,0.07)" : "transparent",
                  transition: "background .2s, border-color .2s",
                  "&:hover": { background: "rgba(0,255,204,0.05)" },
                }}
              >
                <Typography sx={{ fontSize: "0.85rem",
                  color: active ? T.cp : "rgba(232,234,246,.45)" }}>
                  {cat.icon}
                </Typography>
                <Typography sx={{
                  fontFamily: "var(--font-display)", fontSize: "0.6rem", fontWeight: 700,
                  letterSpacing: "0.12em", whiteSpace: "nowrap", textTransform: "uppercase",
                  color: active ? T.cp : "rgba(232,234,246,.5)",
                }}>
                  {cat.name}
                </Typography>
              </Box>
            );
          })}
        </Box>

        {/* Row 3 — active category content panel */}
        <Box sx={{
          height: 120,
          overflow: "hidden",
          /* Neutralise PartSelector's own container chrome */
          "& > div > div:first-of-type": { display: "none" },
          "& .MuiAccordionSummary-root": { display: "none" },
          "& .MuiAccordionDetails-root": { p: 0, height: "100%" },
          "& .MuiAccordion-root": { background: "transparent !important", boxShadow: "none", height: "100%" },
          "& > div": { height: "100%" },
        }}>
          <PartSelector
            parts={activeCategory ? [activeCategory] : []}
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

      <AiChatbox isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
    </Box>
  );
}
