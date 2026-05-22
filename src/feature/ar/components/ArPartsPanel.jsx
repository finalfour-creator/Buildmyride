"use client";

import {
  Box,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  CircularProgress,
} from "@mui/material";
import BodyOptions from "@/feature/customize/components/BodyOptions";
import Wheel1Options from "@/feature/customize/components/Wheel1Options";
import ModularPartOptions from "@/feature/customize/components/ModularPartOptions";

const WHEEL_CATEGORY_IDS = ["wheels", "wheel", "rims"];

export default function ArPartsPanel({
  categories,
  grouped,
  totalCount,
  loading,
  error,
  selectedCategory,
  onSelectCategory,
  arBuild,
  onPartSelect,
  selectedColor,
  setSelectedColor,
  wheels,
  setWheels,
  activeWheelPosition,
}) {
  const buildUrlsForHighlight = Object.fromEntries(
    Object.entries(arBuild).map(([key, val]) => [
      key,
      typeof val === "string" ? val : val?.modelUrl,
    ])
  );

  const renderCategoryContent = (part) => {
    if (part.id === "body") {
      return (
        <BodyOptions
          selectedColor={selectedColor}
          setSelectedColor={setSelectedColor}
        />
      );
    }

    if (WHEEL_CATEGORY_IDS.includes(part.id)) {
      const wheelOptions =
        grouped.wheels || grouped.wheel || grouped.rims || [];
      return (
        <Wheel1Options
          activeWheelPosition={activeWheelPosition}
          wheels={wheels}
          wheelOptions={wheelOptions}
          setWheels={setWheels}
          onApplyAllWheels={(url) => {
            setWheels({
              "front-left": url,
              "front-right": url,
              "rear-left": url,
              "rear-right": url,
            });
          }}
        />
      );
    }

    const categoryData =
      grouped[part.id] ||
      Object.values(grouped).find(
        (list) => list[0]?.category?.toLowerCase() === part.id
      );

    if (categoryData?.length) {
      return (
        <ModularPartOptions
          category={part.name}
          options={categoryData}
          currentBuild={buildUrlsForHighlight}
          onSelect={(url, slot) => {
            const meta = url
              ? categoryData.find((p) => p.modelUrl === url)
              : null;
            onPartSelect(part.id, url, slot, meta);
          }}
        />
      );
    }

    return (
      <Typography sx={{ p: 2, color: "#888", fontSize: 13 }}>
        No parts in this category.
      </Typography>
    );
  };

  return (
    <Box
      sx={{
        width: { xs: "100%", md: 320 },
        flexShrink: 0,
        height: { xs: "38vh", md: "100%" },
        maxHeight: { xs: "42vh", md: "none" },
        display: "flex",
        flexDirection: "column",
        bgcolor: "#0f2027",
        borderLeft: { md: "1px solid #2c5364" },
        borderTop: { xs: "1px solid #2c5364", md: "none" },
      }}
    >
      <Box sx={{ p: 2, borderBottom: "1px solid #2c5364" }}>
        <Typography
          variant="caption"
          sx={{ color: "#8a9aa8", letterSpacing: 1, fontWeight: 700, display: "block" }}
        >
          AR PARTS — FULL CATALOG
        </Typography>
        {!loading && !error && (
          <Typography variant="caption" sx={{ color: "#64748b" }}>
            {totalCount} parts · tap to apply on detected car
          </Typography>
        )}
      </Box>

      <Box sx={{ flex: 1, overflowY: "auto", minHeight: 0 }}>
        {loading && (
          <Box sx={{ p: 4, display: "flex", justifyContent: "center" }}>
            <CircularProgress size={28} sx={{ color: "#2c5364" }} />
          </Box>
        )}

        {error && (
          <Typography sx={{ p: 2, color: "#f44336", fontSize: 13 }}>{error}</Typography>
        )}

        {!loading &&
          !error &&
          categories.map((cat) => (
            <Accordion
              key={cat.id}
              expanded={selectedCategory === cat.id}
              onChange={() => onSelectCategory(cat.id)}
              sx={{
                background: "transparent",
                color: "#fff",
                borderBottom: "1px solid rgba(44, 83, 100, 0.3)",
                boxShadow: "none",
                "&:before": { display: "none" },
                "&.Mui-expanded": { margin: 0 },
              }}
            >
              <AccordionSummary
                expandIcon={
                  <Typography sx={{ color: "#2c5364", fontSize: 12 }}>▼</Typography>
                }
                sx={{
                  py: 0.5,
                  minHeight: 48,
                  background:
                    selectedCategory === cat.id
                      ? "rgba(44, 83, 100, 0.12)"
                      : "transparent",
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                  <Typography sx={{ color: "#2c5364" }}>{cat.icon}</Typography>
                  <Typography sx={{ fontSize: "0.82rem", fontWeight: 600 }}>
                    {cat.name}
                  </Typography>
                  {grouped[cat.id]?.length > 0 && (
                    <Typography
                      variant="caption"
                      sx={{ color: "#64748b", ml: "auto", mr: 1 }}
                    >
                      {grouped[cat.id].length}
                    </Typography>
                  )}
                </Box>
              </AccordionSummary>
              <AccordionDetails sx={{ p: 0, bgcolor: "rgba(0,0,0,0.15)" }}>
                {renderCategoryContent(cat)}
              </AccordionDetails>
            </Accordion>
          ))}
      </Box>
    </Box>
  );
}
