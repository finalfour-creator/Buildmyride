"use client";
import { useEffect, useState, useRef } from "react";
import { Box, Typography, Button } from "@mui/material";
import ThreeViewer from "@/components/ui/ThreeViewer";
import PartSelector from "./components/PartSelector";
import OptionsPanel from "./components/OptionsPanel";
import AiChatbox from "./components/AiChatbox";
import apiClient from "@/lib/axios";
import { useSearchParams } from "next/navigation";

export default function CustomizePage() {
  const searchParams = useSearchParams();
  const carId = searchParams.get("carId");

  const viewerRef = useRef(null); // Ref to access ThreeViewer functions
  const [selectedPart, setSelectedPart] = useState("body");
  const [selectedColor, setSelectedColor] = useState("#1e3a5f");
  
  // Dynamic Categories from DB
  const [categories, setCategories] = useState([
    { id: "body", name: "BODY PAINT", icon: "●" } // Always show body paint
  ]);
  const [availableParts, setAvailableParts] = useState({});

  const [wheels, setWheels] = useState({
    "front-left": null, "front-right": null, "rear-left": null, "rear-right": null,
  });
  const [activeWheelPosition, setActiveWheelPosition] = useState(null);
  const [selectedSpoiler, setSelectedSpoiler] = useState(null);

  // The "Current Build" state tracks all equipped modular parts
  const [currentBuild, setCurrentBuild] = useState({});

  // Draft management state
  const [designId, setDesignId] = useState(searchParams.get("designId") || null);
  const [saveStatus, setSaveStatus] = useState("saved"); // 'saved', 'saving', 'error'

  const handlePartSelect = (category, url, slot) => {
    // If a specific slot is provided (e.g. "Front_Bumper"), use it.
    // Otherwise, use the category name.
    const key = slot || category;
    setCurrentBuild(prev => ({ ...prev, [key]: url }));
    
    // Legacy support for spoiler
    if (category.toLowerCase() === "spoiler") {
      setSelectedSpoiler(url);
    }
  };

  const [isChatOpen, setIsChatOpen] = useState(false);
  const [modelData, setModelData] = useState(null);
  const [modelUrl, setModelUrl] = useState();
  const [loadingModel, setLoadingModel] = useState(true);

  const wheelOptions = modelData?.parts?.wheels || [];
  const spoilerOptions = modelData?.parts?.spoilers || [];
  const colors = modelData?.colors || [];

  // Helper to package the entire customization into a single object
  const captureDesignState = () => {
    return {
      carId: modelData?._id || carId,
      paint: {
        color: selectedColor,
        finish: "glossy" // Default for now
      },
      modularParts: currentBuild,
      wheels: wheels
    };
  };

  // Function to send the current state to the backend
  const saveDraft = async () => {
    try {
      setSaveStatus("saving");
      const currentState = captureDesignState();
      
      // Capture thumbnail from 3D viewer
      const thumbnail = viewerRef.current?.takeScreenshot();
      
      let response;
      if (designId) {
        // Update existing draft
        response = await apiClient.put(`/designs/${designId}`, { 
          state: currentState,
          thumbnail: thumbnail 
        });
      } else {
        // Create new draft
        response = await apiClient.post("/designs", { 
          name: `My ${modelData?.name || "Car"}`, 
          state: currentState,
          thumbnail: thumbnail
        });
        setDesignId(response.data._id); 
      }
      
      setSaveStatus("saved");
      console.log("[Auto-Save] Draft saved successfully:", response.data._id);
    } catch (error) {
      setSaveStatus("error");
      console.error("[Auto-Save] Failed to save draft:", error);
      // If it's a 401, user is likely logged out - we could redirect or just stop saving
    }
  };

  // ── Auto-Save Engine ──────────────────────────────────────────────────────
  useEffect(() => {
    // Only auto-save if we have model data (initial load complete)
    if (!modelData) return;

    // Debounce: Wait 2 seconds of inactivity before saving
    const timer = setTimeout(() => {
      saveDraft();
    }, 2000);

    return () => clearTimeout(timer); // Reset timer if state changes again
  }, [selectedColor, currentBuild, wheels, modelData]);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoadingModel(true);
        
        // 1. Fetch Chassis
        const modelEndpoint = carId ? `/models/${carId}` : "/models";
        const modelRes = await apiClient.get(modelEndpoint);
        const model = Array.isArray(modelRes.data) ? modelRes.data[0] : modelRes.data;

        if (model) {
          setModelData(model);
          setModelUrl(model.chassisUrl || model.modelUrl);

          // ── Resume/Hydration Logic ──
          if (designId) {
            console.log("[Resume] Loading saved design:", designId);
            try {
              const designRes = await apiClient.get(`/designs/${designId}`);
              const savedDesign = designRes.data;
              
              if (savedDesign && savedDesign.state) {
                const { paint, wheels: savedWheels, modularParts } = savedDesign.state;
                
                // Apply saved state to editor
                if (paint?.color) setSelectedColor(paint.color);
                if (savedWheels) setWheels(savedWheels);
                if (modularParts) setCurrentBuild(modularParts);
                
                console.log("[Resume] State hydrated successfully");
              }
            } catch (err) {
              console.error("[Resume] Failed to load design:", err);
            }
          }

          // 2. Fetch Compatible Parts
          const partsRes = await apiClient.get(`/parts?carId=${model._id}`);
          const parts = partsRes.data;

          // Group parts by category for the OptionsPanel
          const grouped = {};
          const dynamicCategories = [{ id: "body", name: "BODY PAINT", icon: "●" }];

          parts.forEach(part => {
            const catId = part.category.toLowerCase(); 
            const displayName = part.category.charAt(0).toUpperCase() + part.category.slice(1).toLowerCase();

            if (!grouped[catId]) {
              grouped[catId] = [];
              dynamicCategories.push({
                id: catId,
                name: displayName.toUpperCase(),
                icon: "▣"
              });
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
    <Box
      sx={{
        position: "relative",
        height: "100vh",
        width: "100%",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        backgroundImage: "url('/images/garage3.jpeg')",
        backgroundSize: "cover",
        backgroundPosition: "center 20%",
        backgroundRepeat: "no-repeat",
      }}
    >
      {/* Overlay */}
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          background: "rgba(0,0,0,0.65)",
          zIndex: 0,
        }}
      />

      {/* Content */}
      <Box
        sx={{
          position: "relative",
          zIndex: 1,
          flex: 1,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          height: "100%",
        }}
      >
        {/* Main Container - Full height flex column */}
        <Box
          sx={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            px: 3,
            py: 1,
          }}
        >
          {/* Header - Fixed at top */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 1.5,
              flexShrink: 0,
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Box>
                <Typography variant="h5" sx={{ color: "#fff", fontWeight: 600, fontSize: "1.5rem" }}>
                  Design Studio
                </Typography>
                <Typography variant="body2" sx={{ color: "#ccc", fontSize: "0.75rem" }}>
                  Configure your vehicle
                </Typography>
              </Box>
              
              {/* Save Status Indicator */}
              <Box sx={{ 
                ml: 2, 
                px: 1.5, 
                py: 0.5, 
                borderRadius: "20px", 
                backgroundColor: "rgba(0,0,0,0.3)",
                display: "flex",
                alignItems: "center",
                gap: 1
              }}>
                <Box sx={{ 
                  width: 8, 
                  height: 8, 
                  borderRadius: "50%", 
                  backgroundColor: saveStatus === "saving" ? "#ffca28" : saveStatus === "error" ? "#f44336" : "#4caf50" 
                }} />
                <Typography variant="caption" sx={{ color: "#fff", fontSize: "0.65rem", fontWeight: 500 }}>
                  {saveStatus === "saving" ? "Saving..." : saveStatus === "error" ? "Save Error" : "Draft Saved"}
                </Typography>
              </Box>
            </Box>

            <Box sx={{ display: "flex", gap: 1 }}>
              <Button
                onClick={() => saveDraft()}
                variant="outlined"
                size="small"
                disabled={saveStatus === "saving"}
                sx={{
                  borderColor: "rgba(255,255,255,0.3)",
                  color: "#fff",
                  textTransform: "none",
                  "&:hover": { borderColor: "#fff", background: "rgba(255,255,255,0.1)" },
                  py: 0.5,
                  px: 2,
                }}
              >
                {saveStatus === "saving" ? "Saving..." : "Save Configuration"}
              </Button>

              <Button
                onClick={() => setIsChatOpen(true)}
                variant="contained"
                size="small"
                sx={{
                  background: "linear-gradient(135deg, #0f2027, #2c5364)",
                  textTransform: "none",
                  "&:hover": { opacity: 0.9 },
                  py: 0.5,
                  px: 2,
                }}
              >
                AI Assistant
              </Button>
            </Box>
          </Box>

          {/* Main Row - Takes remaining space */}
          <Box
            sx={{
              display: "flex",
              flex: 1,
              gap: 2,
              overflow: "hidden",
              minHeight: 0,
            }}
          >
            {/* 3D Viewer */}
            <Box sx={{ flex: 1, minWidth: 0, height: "100%", overflow: "hidden" }}>
              <ThreeViewer
                ref={viewerRef}
                modelPath={modelUrl}
                backgroundColor="transparent"
                modelColor={selectedPart === "body" ? selectedColor : null}
                wheelReplacements={wheels}
                spoilerReplacement={selectedSpoiler}
                currentBuild={currentBuild} // PASS THE FULL BUILD
                onWheelClick={(posId) => {
                  setActiveWheelPosition(posId);
                  setSelectedPart("wheels");
                }}
                sx={{ height: "100%", width: "100%" }}
              />
            </Box>

            {/* Unified Accordion Selector - Extreme Right */}
            <Box sx={{ width: 320, flexShrink: 0, overflow: "auto" }}>
              <PartSelector
                parts={categories}
                selectedPart={selectedPart}
                onSelect={setSelectedPart}
                availableParts={availableParts}
                currentBuild={currentBuild}
                onPartSelect={handlePartSelect}
                
                // Body/Color Props
                selectedColor={selectedColor}
                setSelectedColor={setSelectedColor}
                colorPalette={colors.map(c => c.value)}

                // Wheel Props
                activeWheelPosition={activeWheelPosition}
                wheels={wheels}
                setWheels={setWheels}
                onApplyAllWheels={(url) => {
                  setWheels({
                    "front-left": url, "front-right": url, "rear-left": url, "rear-right": url,
                  });
                }}
              />
            </Box>
          </Box>
        </Box>
      </Box>

      {/* AI Chatbox */}
      <AiChatbox isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
    </Box>
  );
}