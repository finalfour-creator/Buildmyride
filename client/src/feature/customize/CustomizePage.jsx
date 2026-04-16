"use client";
import { useEffect, useState } from "react";
import { Box, Typography, Button } from "@mui/material";
import ThreeViewer from "@/components/ui/ThreeViewer";
import PartSelector from "./components/PartSelector";
import OptionsPanel from "./components/OptionsPanel";
import AiChatbox from "./components/AiChatbox";
import apiClient from "@/lib/axios";

const parts = [
  { id: "body", name: "BODY PAINT", icon: "●" },
  { id: "rims", name: "RIMS", icon: "◉" },
  { id: "wheels", name: "WHEELS", icon: "○" },
  { id: "roof", name: "ROOF", icon: "□" },
  { id: "interior", name: "INTERIOR", icon: "△" },
  { id: "lights", name: "LIGHTS", icon: "◇" },
];

const rimOptions = [
  { id: "sport", name: "Sport", price: "+$0" },
  { id: "premium", name: "Premium", price: "+$300" },
  { id: "classic", name: "Classic", price: "+$200" },
  { id: "black", name: "Black Edition", price: "+$500" },
];

const roofOptions = [
  { id: "gloss", name: "Gloss Black", price: "+$0" },
  { id: "carbon", name: "Carbon Fiber", price: "+$800" },
  { id: "glass", name: "Panoramic Glass", price: "+$1200" },
  { id: "matte", name: "Matte Wrap", price: "+$600" },
];

export default function CustomizePage() {
  const [selectedPart, setSelectedPart] = useState("body");
  const [selectedColor, setSelectedColor] = useState("#1e3a5f");
  const [selectedRim, setSelectedRim] = useState("sport");
  // Per-position wheel state: each position tracks the URL of the active custom wheel (or null for original)
  const [wheels, setWheels] = useState({
    "front-left": null,
    "front-right": null,
    "rear-left": null,
    "rear-right": null,
  });
  const [activeWheelPosition, setActiveWheelPosition] = useState(null);
  const [selectedRoof, setSelectedRoof] = useState("gloss");
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [modelData, setModelData] = useState(null);
  const [modelUrl, setModelUrl] = useState();
  const [loadingModel, setLoadingModel] = useState(true);

  const wheelOptions = modelData?.parts?.wheels || [];
  const colors = modelData?.colors || [];

  useEffect(() => {
    async function fetchModel() {
      try {
        console.log("Fetching models from /api/models...");
        const res = await apiClient.get("/models");
        const models = res.data;
        console.log("API Response:", res);
        console.log("Models array:", models);

        if (models && models.length > 0) {
          const firstModel = models[0];
          console.log("First model object:", firstModel);
          console.log("Model URL from DB:", firstModel.modelUrl);

          setModelData(firstModel);
          setModelUrl(firstModel.modelUrl);
        } else {
          console.warn("No models found in database. Check MongoDB connection and data.");
        }
      } catch (error) {
        console.error("Model fetch error:", error);
        console.error("Error details:", error.response?.data || error.message);
      } finally {
        setLoadingModel(false);
      }
    }

    fetchModel();
  }, []);

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
                onWheelClick={(posId) => {
                  setActiveWheelPosition(posId);
                  setSelectedPart("wheels");
                  console.log("Wheel clicked in scene:", posId);
                }}
                sx={{ height: "100%", width: "100%" }}
              />
            </Box>

            {/* Part Selector - Extreme Right */}
            <Box sx={{ width: 250, flexShrink: 0, overflow: "auto" }}>
              <PartSelector
                parts={parts}
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

              // selectedColor={selectedColor}
              // setSelectedColor={setSelectedColor}
              selectedRim={selectedRim}
              setSelectedRim={setSelectedRim}
              // selectedWheel={selectedWheel}
              // setSelectedWheel={setSelectedWheel}
              selectedRoof={selectedRoof}
              setSelectedRoof={setSelectedRoof}
              // colorPalette={colorPalette}
              rimOptions={rimOptions}
              // wheelOptions={wheelOptions}
              roofOptions={roofOptions}
            />
          </Box>
        </Box>
      </Box>

      {/* AI Chatbox */}
      <AiChatbox isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
    </Box>
  );
}