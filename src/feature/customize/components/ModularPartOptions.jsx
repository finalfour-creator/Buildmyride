"use client";
import { useState } from "react";
import { Box, Typography, Grid, CircularProgress } from "@mui/material";
import { useModelThumbnail } from "./useModelThumbnail";

/* ─── Position parser (bumpers / doors) ─── */
const getPosition = (name) => {
  const n = name.toUpperCase();
  const isFront = n.includes("FRONT") || n.includes("DRIVER") || n.includes("PASSENGER") || n.includes("_LF") || n.includes("_RF");
  const isRear  = n.includes("REAR")  || n.includes("BACK")   || n.includes("_LB")        || n.includes("_RB") || n.includes("_LR") || n.includes("_RR");
  const isLeft  = n.includes("LEFT")  || n.includes("DRIVER") || n.includes("_LF")         || n.includes("_LB") || n.includes("_LR");
  const isRight = n.includes("RIGHT") || n.includes("PASSENGER") || n.includes("_RF")      || n.includes("_RB") || n.includes("_RR");
  if (isFront && isLeft)  return "Front_Left";
  if (isFront && isRight) return "Front_Right";
  if (isRear  && isLeft)  return "Rear_Left";
  if (isRear  && isRight) return "Rear_Right";
  if (isFront) return "Front";
  if (isRear)  return "Back";
  return null;
};

/* ─────────────────────────────────────────────────────────────────────────────
   NFS-STYLE PART CARD
   Shows a live 3D preview when the DB has no static thumbnail image.
───────────────────────────────────────────────────────────────────────────── */
function PartCard({ label, isSelected, onClick, thumbnail, modelUrl, isOriginal = false, cardWidth }) {
  const [pressed, setPressed] = useState(false);

  // Generate a thumbnail from the GLTF when the DB has no static image
  const needsGenerated = !thumbnail && !isOriginal && !!modelUrl;
  const { thumbnail: generated, loading } = useModelThumbnail(needsGenerated ? modelUrl : null);
  const displayThumb = thumbnail || (needsGenerated ? generated : null);

  return (
    <Box
      onClick={onClick}
      onMouseDown={() => setPressed(true)}
      onMouseUp={() => setPressed(false)}
      onMouseLeave={() => setPressed(false)}
      sx={{
        position: "relative",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        cursor: "pointer",
        borderRadius: "10px",
        ...(cardWidth ? { width: cardWidth, flexShrink: 0 } : {}),
        border: isSelected
          ? "2px solid rgba(0,242,254,0.85)"
          : "1.5px solid rgba(255,255,255,0.07)",
        background: isSelected
          ? "rgba(0,242,254,0.07)"
          : "rgba(4,10,14,0.75)",
        backdropFilter: "blur(8px)",
        boxShadow: isSelected
          ? "0 0 22px rgba(0,242,254,0.25), inset 0 0 14px rgba(0,242,254,0.05)"
          : "0 4px 16px rgba(0,0,0,0.45)",
        transition: "all 0.22s cubic-bezier(0.4,0,0.2,1)",
        transform: pressed ? "scale(0.96)" : isSelected ? "translateY(-2px)" : "translateY(0)",
        overflow: "hidden",
        "&:hover": {
          borderColor: isSelected ? "rgba(0,242,254,1)" : "rgba(255,255,255,0.18)",
          background: isSelected ? "rgba(0,242,254,0.09)" : "rgba(10,25,34,0.85)",
          transform: pressed ? "scale(0.96)" : "translateY(-4px)",
          boxShadow: isSelected
            ? "0 8px 28px rgba(0,242,254,0.3)"
            : "0 10px 28px rgba(0,0,0,0.65)",
        },
      }}
    >
      {/* Cyan shimmer sweep when selected */}
      {isSelected && (
        <Box sx={{
          position: "absolute", inset: 0, pointerEvents: "none",
          background: "linear-gradient(90deg, transparent, rgba(0,242,254,0.09), transparent)",
          backgroundSize: "200% 100%",
          animation: "shimmer 2.5s linear infinite",
          "@keyframes shimmer": {
            "0%": { backgroundPosition: "-200% center" },
            "100%": { backgroundPosition: "200% center" },
          },
        }} />
      )}

      {/* Selected dot */}
      {isSelected && (
        <Box sx={{
          position: "absolute", top: 7, right: 7,
          width: 8, height: 8, borderRadius: "50%",
          background: "#00f2fe",
          boxShadow: "0 0 10px #00f2fe, 0 0 20px rgba(0,242,254,0.5)",
        }} />
      )}

      {/* ── Preview image area (NFS-style tall thumbnail) ── */}
      <Box sx={{
        width: "100%", height: 90,
        display: "flex", alignItems: "center", justifyContent: "center",
        position: "relative", overflow: "hidden",
        background: "rgba(0,0,0,0.2)",
        borderBottom: isSelected
          ? "1px solid rgba(0,242,254,0.2)"
          : "1px solid rgba(255,255,255,0.04)",
      }}>
        {loading ? (
          /* Generating thumbnail — spinner */
          <CircularProgress size={20} thickness={3} sx={{ color: "rgba(0,242,254,0.4)" }} />
        ) : displayThumb ? (
          /* Static DB image OR live 3D snapshot */
          <Box
            component="img"
            src={displayThumb}
            alt={label}
            sx={{
              maxWidth: "92%", maxHeight: 78,
              objectFit: "contain",
              filter: isSelected
                ? "brightness(1.25) drop-shadow(0 0 8px rgba(0,242,254,0.55))"
                : "brightness(0.85)",
              transition: "filter 0.22s ease",
            }}
          />
        ) : isOriginal ? (
          /* Original / no-part slot */
          <Typography sx={{ fontSize: "1.6rem", opacity: 0.2, lineHeight: 1 }}>◯</Typography>
        ) : (
          /* Generic fallback */
          <Typography sx={{ fontSize: "1.4rem", opacity: 0.12, lineHeight: 1 }}>▣</Typography>
        )}
      </Box>

      {/* ── Label ── */}
      <Box sx={{ width: "100%", px: 0.8, py: 0.8 }}>
        <Typography sx={{
          fontSize: "0.62rem",
          fontWeight: 700,
          color: isSelected ? "#00f2fe" : "#6a8a9a",
          letterSpacing: "0.3px",
          lineHeight: 1.3,
          textAlign: "center",
          display: "-webkit-box",
          WebkitLineClamp: 2,
          WebkitBoxOrient: "vertical",
          overflow: "hidden",
          textShadow: isSelected ? "0 0 8px rgba(0,242,254,0.4)" : "none",
          transition: "color 0.2s ease",
        }}>
          {label}
        </Typography>
      </Box>
    </Box>
  );
}

/* ─── Group Sub-header ─── */
function GroupHeader({ label }) {
  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.5 }}>
      <Box sx={{ flex: 1, height: "1px", background: "rgba(0,242,254,0.1)" }} />
      <Typography sx={{
        fontSize: "0.6rem", fontWeight: 800, color: "#3a5565",
        letterSpacing: "2px", whiteSpace: "nowrap",
      }}>
        {label.toUpperCase()}
      </Typography>
      <Box sx={{ flex: 1, height: "1px", background: "rgba(0,242,254,0.1)" }} />
    </Box>
  );
}

/* ══════════════════════════════════════════ MAIN EXPORT */
export default function ModularPartOptions({ category, options, currentBuild, onSelect, horizontal = false }) {
  const catLower = category.toLowerCase();
  const isBumper = catLower.includes("bumper");
  const isDoor   = catLower.includes("door");

  /* Build groups */
  let groups = { [category]: options };

  if (isBumper || isDoor) {
    const grouped = {};
    options.forEach((opt) => {
      const pos   = getPosition(opt.name);
      const label = pos ? pos.replace("_", " ") : "Other";
      if (!grouped[label]) grouped[label] = [];
      grouped[label].push(opt);
    });
    if (Object.keys(grouped).length > 1) groups = grouped;
  }

  const hasSubgroups = Object.keys(groups).length > 1;

  const getSlotKey = (groupLabel) =>
    hasSubgroups
      ? (groupLabel === "Other" ? category.toLowerCase() : groupLabel.replace(" ", "_"))
      : category.toLowerCase();

  /* ── Horizontal group (NFS-style row) ── */
  const renderGroupHorizontal = (groupLabel, groupOptions) => {
    const slotKey = getSlotKey(groupLabel);
    return (
      <Box key={groupLabel} sx={{ display: "flex", alignItems: "stretch", gap: 0, flexShrink: 0 }}>
        {/* Group label as vertical side-tag (only when multiple groups exist) */}
        {hasSubgroups && (
          <Box sx={{
            display: "flex", alignItems: "center", justifyContent: "center",
            px: 0.8, mr: 0.5, flexShrink: 0,
            borderRight: "1px solid rgba(0,242,254,0.08)",
          }}>
            <Typography sx={{
              fontSize: "0.44rem", fontWeight: 800, color: "#2a4a58",
              letterSpacing: "2px", textTransform: "uppercase",
              writingMode: "vertical-rl", transform: "rotate(180deg)",
            }}>
              {groupLabel}
            </Typography>
          </Box>
        )}

        {/* Cards in a row */}
        <Box sx={{ display: "flex", gap: 1, px: 1, py: 1, alignItems: "stretch" }}>
          <PartCard
            label="Original"
            isSelected={!currentBuild[slotKey]}
            isOriginal
            onClick={() => onSelect(null, slotKey)}
            cardWidth={100}
          />
          {groupOptions.map((option) => {
            const isSelected = currentBuild[slotKey] === option.modelUrl;
            const shortName  = option.name.replace(/front|back|rear/gi, "").trim() || option.name;
            return (
              <PartCard
                key={option._id}
                label={shortName}
                isSelected={isSelected}
                thumbnail={option.thumbnail}
                modelUrl={option.modelUrl}
                onClick={() => onSelect(option.modelUrl, slotKey)}
                cardWidth={100}
              />
            );
          })}
        </Box>

        {/* Separator between groups */}
        {hasSubgroups && (
          <Box sx={{ width: "1px", background: "rgba(0,242,254,0.06)", flexShrink: 0, my: 1 }} />
        )}
      </Box>
    );
  };

  /* ── Vertical group (original grid layout) ── */
  const renderGroupVertical = (groupLabel, groupOptions) => {
    const slotKey = getSlotKey(groupLabel);
    return (
      <Box key={groupLabel} sx={{ mb: 2.5 }}>
        {hasSubgroups && <GroupHeader label={groupLabel} />}
        <Grid container spacing={1.4}>
          <Grid item xs={6}>
            <PartCard
              label="Original"
              isSelected={!currentBuild[slotKey]}
              isOriginal
              onClick={() => onSelect(null, slotKey)}
            />
          </Grid>
          {groupOptions.map((option) => {
            const isSelected = currentBuild[slotKey] === option.modelUrl;
            const shortName  = option.name.replace(/front|back|rear/gi, "").trim() || option.name;
            return (
              <Grid item xs={6} key={option._id}>
                <PartCard
                  label={shortName}
                  isSelected={isSelected}
                  thumbnail={option.thumbnail}
                  modelUrl={option.modelUrl}
                  onClick={() => onSelect(option.modelUrl, slotKey)}
                />
              </Grid>
            );
          })}
        </Grid>
      </Box>
    );
  };

  /* ── Horizontal layout (NFS bottom bar) ── */
  if (horizontal) {
    const equipped = Object.values(currentBuild).filter(Boolean).length;
    return (
      <Box sx={{ display: "flex", alignItems: "stretch", height: "100%", flexShrink: 0 }}>
        {/* Left: category label + equipped badge */}
        <Box sx={{
          display: "flex", flexDirection: "column", justifyContent: "center",
          alignItems: "center", gap: 0.8, px: 1.5, flexShrink: 0,
          borderRight: "1px solid rgba(0,242,254,0.07)",
          minWidth: 52,
        }}>
          <Typography sx={{
            fontSize: "0.44rem", fontWeight: 900, color: "#00f2fe",
            letterSpacing: "2px", textTransform: "uppercase",
            writingMode: "vertical-rl", transform: "rotate(180deg)",
            textShadow: "0 0 8px rgba(0,242,254,0.3)",
          }}>
            {category}
          </Typography>
          {equipped > 0 && (
            <Box sx={{
              px: 0.6, py: 0.15, borderRadius: "6px",
              background: "rgba(0,242,254,0.12)",
              border: "1px solid rgba(0,242,254,0.2)",
            }}>
              <Typography sx={{ color: "#00f2fe", fontSize: "0.5rem", fontWeight: 800 }}>
                {equipped}
              </Typography>
            </Box>
          )}
        </Box>

        {/* Right: groups in a horizontal row */}
        <Box sx={{ display: "flex", alignItems: "stretch" }}>
          {Object.entries(groups).map(([label, opts]) => renderGroupHorizontal(label, opts))}
        </Box>
      </Box>
    );
  }

  /* ── Vertical layout (original) ── */
  return (
    <Box sx={{ p: 2, color: "#fff" }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2 }}>
        <Typography sx={{
          fontSize: "0.8rem", fontWeight: 800,
          textTransform: "uppercase", color: "#fff", letterSpacing: "0.8px",
        }}>
          {category} Options
        </Typography>
        {Object.values(currentBuild).filter(Boolean).length > 0 && (
          <Box sx={{
            px: 1, py: 0.2, borderRadius: "10px",
            background: "rgba(0,242,254,0.12)",
            border: "1px solid rgba(0,242,254,0.2)",
          }}>
            <Typography sx={{ color: "#00f2fe", fontSize: "0.62rem", fontWeight: 800 }}>
              {Object.values(currentBuild).filter(Boolean).length} equipped
            </Typography>
          </Box>
        )}
      </Box>
      {Object.entries(groups).map(([label, opts]) => renderGroupVertical(label, opts))}
    </Box>
  );
}
