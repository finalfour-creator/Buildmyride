"use client";
import { useEffect, useState } from "react";
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

  const handlePartSelect = (category, url) => {
    setCurrentBuild(prev => ({ ...prev, [category]: url }));
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

          // 2. Fetch Compatible Parts
          const partsRes = await apiClient.get(`/parts?carId=${model._id}`);
          const parts = partsRes.data;

          // Group parts by category for the OptionsPanel
          const grouped = {};
          const dynamicCategories = [{ id: "body", name: "BODY PAINT", icon: "●" }];

          parts.forEach(part => {
            if (!grouped[part.category]) {
              grouped[part.category] = [];
              // Add to the sidebar menu if it's a new category
              dynamicCategories.push({
                id: part.category.toLowerCase(),
                name: part.category.toUpperCase(),
                icon: "▣"
              });
            }
            grouped[part.category].push(part);
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
        backgroundImage: "url('/images/garage2.jpg')",
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
            <Box>
              <Typography variant="h5" sx={{ color: "#fff", fontWeight: 600, fontSize: "1.5rem" }}>
                Design Studio
              </Typography>
              <Typography variant="body2" sx={{ color: "#ccc", fontSize: "0.75rem" }}>
                Configure your vehicle
              </Typography>
            </Box>

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

            {/* Part Selector - Extreme Right */}
            <Box sx={{ width: 250, flexShrink: 0, overflow: "auto" }}>
              <PartSelector
                parts={categories}
                selectedPart={selectedPart}
                onSelect={setSelectedPart}
              />
            </Box>
          </Box>



          {/* Options Panel - Fixed height at bottom */}
          <Box
            sx={{
              mt: 1.5,
              flexShrink: 0,
              maxHeight: "30%",
              overflow: "auto",
            }}
          >
            <OptionsPanel
              selectedPart={selectedPart}

              // COLORS FROM DB
              selectedColor={selectedColor}
              setSelectedColor={setSelectedColor}
              colorPalette={colors.map(c => c.value)}

              // WHEELS FROM DB — per-position replacement
              activeWheelPosition={activeWheelPosition}
              wheels={wheels}
              setWheels={setWheels}
              wheelOptions={wheelOptions}
              onApplyAllWheels={(url) => {
                setWheels({
                  "front-left": url,
                  "front-right": url,
                  "rear-left": url,
                  "rear-right": url,
                });
              }}

              // SPOILERS FROM DB
              selectedSpoiler={selectedSpoiler}
              setSelectedSpoiler={setSelectedSpoiler}
              spoilerOptions={spoilerOptions}
            />
          </Box>
        </Box>
      </Box>

      {/* AI Chatbox */}
      <AiChatbox isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
    </Box>
  );
}