"use client";
import { Box, Typography } from "@mui/material";
import BodyOptions from "./BodyOptions";
import Wheel1Options from "./Wheel1Options";
import ModularPartOptions from "./ModularPartOptions";

/* ── Thumbnail inside a category tab ── */
function CategoryThumb({ partId, thumbnail, isSelected, selectedColor, colorPalette }) {
  const base = {
    width: 42, height: 28, borderRadius: 5, overflow: "hidden",
    display: "flex", alignItems: "center", justifyContent: "center",
    flexShrink: 0,
    border: isSelected ? "1.5px solid rgba(0,242,254,0.6)" : "1.5px solid rgba(255,255,255,0.06)",
    background: "rgba(6,14,19,0.8)",
    transition: "all 0.2s ease",
    boxShadow: isSelected ? "0 0 8px rgba(0,242,254,0.25)" : "none",
  };

  if (partId === "body") {
    const swatches = (colorPalette?.length ? colorPalette : [selectedColor || "#1e3a5f"]).slice(0, 5);
    return (
      <Box sx={base}>
        {swatches.map((c, i) => (
          <Box key={i} sx={{ flex: 1, height: "100%", background: c }} />
        ))}
      </Box>
    );
  }

  if (partId === "wheels" && !thumbnail) {
    return <Box sx={{ ...base, fontSize: "1rem" }}>⚙️</Box>;
  }

  if (thumbnail) {
    return (
      <Box sx={base}>
        <Box
          component="img" src={thumbnail} alt=""
          sx={{
            width: "100%", height: "100%", objectFit: "contain",
            filter: isSelected
              ? "brightness(1.1) drop-shadow(0 0 3px rgba(0,242,254,0.5))"
              : "brightness(0.8)",
          }}
        />
      </Box>
    );
  }

  const ICONS = { spoiler: "🏎", bumper: "🔧", hood: "🔩", door: "🚪", lights: "💡", trunk: "📦" };
  return (
    <Box sx={{ ...base, fontSize: "1rem", opacity: isSelected ? 1 : 0.45 }}>
      {ICONS[partId] || "▣"}
    </Box>
  );
}

/* ── Single horizontal category tab ── */
function CategoryTab({ part, isSelected, thumbnail, equippedCount, selectedColor, colorPalette, onClick }) {
  return (
    <Box
      onClick={onClick}
      sx={{
        display: "flex", flexDirection: "column", alignItems: "center", gap: 0.5,
        px: 1.2, py: 0.8,
        borderRadius: "10px",
        cursor: "pointer",
        flexShrink: 0,
        minWidth: 66,
        position: "relative",
        border: isSelected ? "1px solid rgba(0,242,254,0.4)" : "1px solid transparent",
        background: isSelected ? "rgba(0,242,254,0.08)" : "transparent",
        transition: "all 0.2s ease",
        "&:hover": {
          background: isSelected ? "rgba(0,242,254,0.1)" : "rgba(255,255,255,0.03)",
          borderColor: isSelected ? "rgba(0,242,254,0.5)" : "rgba(255,255,255,0.06)",
        },
      }}
    >
      <CategoryThumb
        partId={part.id} thumbnail={thumbnail} isSelected={isSelected}
        selectedColor={selectedColor} colorPalette={colorPalette}
      />

      <Typography sx={{
        fontSize: "0.48rem", fontWeight: 800, letterSpacing: "0.6px",
        color: isSelected ? "#00f2fe" : "#4a6a7a",
        textAlign: "center", textTransform: "uppercase",
        maxWidth: 62, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
        textShadow: isSelected ? "0 0 8px rgba(0,242,254,0.4)" : "none",
        transition: "color 0.2s ease",
      }}>
        {part.name}
      </Typography>

      {equippedCount > 0 && (
        <Box sx={{
          position: "absolute", top: 4, right: 4,
          minWidth: 14, height: 14, borderRadius: "8px",
          background: "linear-gradient(135deg, #00f2fe, #4facfe)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: "0.45rem", fontWeight: 900, color: "#05161e", px: 0.3,
        }}>
          {equippedCount}
        </Box>
      )}

      {isSelected && (
        <Box sx={{
          position: "absolute", bottom: 0, left: "20%", right: "20%",
          height: 2, borderRadius: "2px 2px 0 0",
          background: "linear-gradient(90deg, #00f2fe, #4facfe)",
          boxShadow: "0 0 6px rgba(0,242,254,0.5)",
        }} />
      )}
    </Box>
  );
}

/* ══════════════════════════════════════════════════════════════════
   MAIN COMPONENT — NFS-style: options on top, category tabs below
══════════════════════════════════════════════════════════════════ */
export default function PartSelector({
  parts,
  selectedPart,
  onSelect,
  availableParts = {},
  currentBuild = {},
  onPartSelect,
  selectedColor,
  setSelectedColor,
  colorPalette,
  activeWheelPosition,
  wheels,
  setWheels,
  onApplyAllWheels,
}) {
  const getCategoryThumbnail = (partId) => {
    if (partId === "body" || partId === "wheels") return null;
    const opts =
      availableParts[partId] ||
      Object.values(availableParts).find((v) => v[0]?.category?.toLowerCase() === partId) ||
      [];
    return opts[0]?.thumbnail ?? null;
  };

  const equippedCount = (partId) => {
    if (partId === "body") return selectedColor ? 1 : 0;
    if (partId === "wheels") return Object.values(wheels || {}).filter(Boolean).length;
    return Object.entries(currentBuild).filter(([k, v]) => v && k.toLowerCase().includes(partId)).length;
  };

  const renderOptions = () => {
    const part = parts.find((p) => p.id === selectedPart);
    if (!part) return null;

    if (part.id === "body") {
      return (
        <BodyOptions
          horizontal
          selectedColor={selectedColor}
          setSelectedColor={setSelectedColor}
          colorPalette={colorPalette}
        />
      );
    }

    if (part.id === "wheels") {
      const wheelOptions =
        availableParts["wheels"] ||
        availableParts["wheel"] ||
        availableParts["rims"] ||
        [];
      return (
        <Wheel1Options
          horizontal
          activeWheelPosition={activeWheelPosition}
          wheels={wheels}
          wheelOptions={wheelOptions}
          setWheels={setWheels}
          onApplyAllWheels={onApplyAllWheels}
        />
      );
    }

    const categoryData =
      availableParts[part.id] ||
      Object.values(availableParts).find((v) => v[0]?.category?.toLowerCase() === part.id);

    if (categoryData) {
      return (
        <ModularPartOptions
          horizontal
          category={part.name}
          options={categoryData}
          currentBuild={currentBuild}
          onSelect={(url, slot) => onPartSelect(part.id, url, slot)}
        />
      );
    }

    return (
      <Box sx={{ display: "flex", alignItems: "center", px: 4 }}>
        <Typography sx={{ color: "#2e4a58", fontSize: "0.75rem" }}>No options available</Typography>
      </Box>
    );
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" }}>

      {/* ── TOP: options for selected category — horizontal scroll ── */}
      <Box sx={{
        flex: 1,
        minHeight: 0,
        overflowX: "auto",
        overflowY: "hidden",
        display: "flex",
        alignItems: "stretch",
        "&::-webkit-scrollbar": { height: "3px" },
        "&::-webkit-scrollbar-track": { background: "transparent" },
        "&::-webkit-scrollbar-thumb": { background: "rgba(0,242,254,0.2)", borderRadius: "2px" },
      }}>
        {selectedPart ? (
          renderOptions()
        ) : (
          <Box sx={{ display: "flex", alignItems: "center", px: 4, gap: 1.5 }}>
            <Typography sx={{ fontSize: "0.85rem", opacity: 0.08 }}>↓</Typography>
            <Typography sx={{ color: "#1e3a4a", fontSize: "0.7rem" }}>
              Select a category below
            </Typography>
          </Box>
        )}
      </Box>

      {/* ── Divider ── */}
      <Box sx={{ height: "1px", background: "rgba(0,242,254,0.07)", flexShrink: 0 }} />

      {/* ── BOTTOM: category tabs — horizontal scroll ── */}
      <Box sx={{
        display: "flex",
        overflowX: "auto",
        flexShrink: 0,
        height: 70,
        px: 1.5,
        gap: 0.5,
        alignItems: "center",
        background: "rgba(0,0,0,0.18)",
        "&::-webkit-scrollbar": { height: "2px" },
        "&::-webkit-scrollbar-thumb": { background: "rgba(0,242,254,0.15)", borderRadius: "2px" },
      }}>
        {parts.map((part) => (
          <CategoryTab
            key={part.id}
            part={part}
            isSelected={selectedPart === part.id}
            thumbnail={getCategoryThumbnail(part.id)}
            equippedCount={equippedCount(part.id)}
            selectedColor={selectedColor}
            colorPalette={colorPalette}
            onClick={() => onSelect(part.id)}
          />
        ))}
      </Box>
    </Box>
  );
}
