"use client";
import { 
  Box, 
  Typography, 
  Accordion, 
  AccordionSummary, 
  AccordionDetails 
} from "@mui/material";
// No icon imports needed
import BodyOptions from "./BodyOptions";
import Wheel1Options from "./Wheel1Options";
import ModularPartOptions from "./ModularPartOptions";

export default function PartSelector({ 
  parts, 
  selectedPart, 
  onSelect,
  availableParts = {},
  currentBuild = {},
  onPartSelect,
  // Body Props
  selectedColor,
  setSelectedColor,
  colorPalette,
  // Wheel Props
  activeWheelPosition,
  wheels,
  setWheels,
  onApplyAllWheels
}) {

  const renderCategoryContent = (part) => {
    // 1. Body Paint Case
    if (part.id === "body") {
      return (
        <BodyOptions
          selectedColor={selectedColor}
          setSelectedColor={setSelectedColor}
          colorPalette={colorPalette}
        />
      );
    }

    // 2. Wheels Case
    if (part.id === "wheels") {
      // Find wheels by any similar name (wheels, wheel, rims)
      const wheelOptions = availableParts["wheels"] || 
                           availableParts["wheel"] || 
                           availableParts["rims"] || 
                           [];
      
      return (
        <Wheel1Options
          activeWheelPosition={activeWheelPosition}
          wheels={wheels}
          wheelOptions={wheelOptions}
          setWheels={setWheels}
          onApplyAllWheels={onApplyAllWheels}
        />
      );
    }

    // 3. Dynamic Modular Parts (Bumper, Spoiler, Hood, etc.)
    const categoryData = availableParts[part.id] || Object.values(availableParts).find(v => v[0]?.category.toLowerCase() === part.id);
    
    if (categoryData) {
      return (
        <ModularPartOptions
          category={part.name}
          options={categoryData}
          currentBuild={currentBuild}
          onSelect={(url, slot) => onPartSelect(part.id, url, slot)}
        />
      );
    }

    return <Typography sx={{ p: 2, color: "#666" }}>No options available.</Typography>;
  };

  return (
    <Box sx={{ 
      background: "#0f2027", 
      borderLeft: "1px solid #2c5364", 
      height: "100%",
      display: "flex",
      flexDirection: "column"
    }}>
      <Box sx={{ p: 2, borderBottom: "1px solid #2c5364" }}>
        <Typography variant="caption" sx={{ color: "#8a9aa8", letterSpacing: 1, fontWeight: 700 }}>
          VEHICLE CUSTOMIZER
        </Typography>
      </Box>

      <Box sx={{ flex: 1, overflowY: "auto" }}>
        {parts.map((part) => (
          <Accordion 
            key={part.id}
            expanded={selectedPart === part.id}
            onChange={() => onSelect(part.id)}
            sx={{
              background: "transparent",
              color: "#fff",
              borderBottom: "1px solid rgba(44, 83, 100, 0.3)",
              boxShadow: "none",
              "&:before": { display: "none" },
              "&.Mui-expanded": { margin: 0 }
            }}
          >
            <AccordionSummary
              expandIcon={<Typography sx={{ color: "#2c5364", fontSize: 12 }}>▼</Typography>}
              sx={{
                py: 1,
                background: selectedPart === part.id ? "rgba(44, 83, 100, 0.1)" : "transparent",
                "&:hover": { background: "rgba(44, 83, 100, 0.05)" }
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <Typography sx={{ fontSize: 16, color: "#2c5364" }}>{part.icon}</Typography>
                <Typography sx={{ 
                  fontSize: "0.85rem", 
                  fontWeight: 600, 
                  letterSpacing: 0.5,
                  color: selectedPart === part.id ? "#ffffff" : "#e2e8f0"
                }}>
                  {part.name}
                </Typography>
              </Box>
            </AccordionSummary>
            <AccordionDetails sx={{ p: 0, background: "rgba(0,0,0,0.2)" }}>
              {renderCategoryContent(part)}
            </AccordionDetails>
          </Accordion>
        ))}
      </Box>
    </Box>
  );
}