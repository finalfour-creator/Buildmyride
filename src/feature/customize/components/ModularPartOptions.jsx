"use client";
import { Box, Typography } from "@mui/material";

const getPosition = (name) => {
  const n = name.toUpperCase();
  const isFront = n.includes("FRONT") || n.includes("DRIVER")    || n.includes("PASSENGER") || n.includes("_LF") || n.includes("_RF");
  const isRear  = n.includes("REAR")  || n.includes("BACK")      || n.includes("_LB") || n.includes("_RB") || n.includes("_LR") || n.includes("_RR");
  const isLeft  = n.includes("LEFT")  || n.includes("DRIVER")    || n.includes("_LF") || n.includes("_LB") || n.includes("_LR");
  const isRight = n.includes("RIGHT") || n.includes("PASSENGER") || n.includes("_RF") || n.includes("_RB") || n.includes("_RR");
  if (isFront && isLeft)  return "Front Left";
  if (isFront && isRight) return "Front Right";
  if (isRear  && isLeft)  return "Rear Left";
  if (isRear  && isRight) return "Rear Right";
  if (isFront) return "Front";
  if (isRear)  return "Back";
  return null;
};

const Chip = ({ active, onClick, children }) => (
  <Box
    onClick={onClick}
    sx={{
      flexShrink: 0, px: 1.2, py: 0.3, cursor: "pointer",
      fontSize: "0.62rem", fontWeight: 500, whiteSpace: "nowrap",
      color: active ? "#fff" : "rgba(232,234,246,0.65)",
      background: active ? "linear-gradient(135deg,#2c5364,#0f2027)" : "rgba(255,255,255,0.04)",
      border: `1px solid ${active ? "#2c5364" : "rgba(44,83,100,0.28)"}`,
      transition: "all 0.16s",
      "&:hover": { background: "rgba(44,83,100,0.28)", borderColor: "#2c5364" },
    }}
  >
    {children}
  </Box>
);

export default function ModularPartOptions({ category, options, currentBuild, onSelect }) {
  const catLower = category.toLowerCase();
  const isBumper = catLower.includes("bumper");
  const isDoor   = catLower.includes("door");

  let groups = { [category]: options };
  if (isBumper || isDoor) {
    const grouped = {};
    options.forEach(opt => {
      const pos   = getPosition(opt.name);
      const label = pos ?? "Other";
      if (!grouped[label]) grouped[label] = [];
      grouped[label].push(opt);
    });
    if (Object.keys(grouped).length > 1) groups = grouped;
  }

  const hasSubgroups = Object.keys(groups).length > 1;

  /* ── Single group: one centred horizontal row ───────────────────────── */
  if (!hasSubgroups) {
    const slotKey = category;
    return (
      <Box sx={{ display: "flex", alignItems: "center", height: "100%", px: 2, gap: 0, overflow: "hidden" }}>
        <Typography sx={{
          fontSize: "0.58rem", fontWeight: 700, letterSpacing: "0.12em",
          color: "rgba(138,154,168,0.8)", textTransform: "uppercase",
          whiteSpace: "nowrap", flexShrink: 0, pr: 2,
        }}>
          {category}
        </Typography>
        <Box sx={{ width: "1px", height: 36, background: "rgba(0,255,204,0.12)", mr: 2, flexShrink: 0 }} />
        <Box sx={{
          display: "flex", gap: 1, alignItems: "center",
          overflowX: "auto", flexShrink: 1, minWidth: 0,
          scrollbarWidth: "none", "&::-webkit-scrollbar": { display: "none" },
        }}>
          <Chip active={!currentBuild[slotKey]} onClick={() => onSelect(null, slotKey)}>ORIGINAL</Chip>
          {options.map(opt => (
            <Chip
              key={opt._id}
              active={currentBuild[slotKey] === opt.modelUrl}
              onClick={() => onSelect(opt.modelUrl, slotKey)}
            >
              {opt.name}
            </Chip>
          ))}
        </Box>
      </Box>
    );
  }

  /* ── Multi-group: stacked rows, one per position ────────────────────── */
  return (
    <Box sx={{ display: "flex", alignItems: "center", height: "100%", px: 2, gap: 0, overflow: "hidden" }}>

      {/* Left: category label */}
      <Typography sx={{
        fontSize: "0.58rem", fontWeight: 700, letterSpacing: "0.12em",
        color: "rgba(138,154,168,0.8)", textTransform: "uppercase",
        whiteSpace: "nowrap", flexShrink: 0, pr: 1.5,
      }}>
        {category}
      </Typography>

      {/* Vertical divider */}
      <Box sx={{ width: "1px", alignSelf: "stretch", my: 1, background: "rgba(0,255,204,0.12)", mr: 2, flexShrink: 0 }} />

      {/* Rows — one per position */}
      <Box sx={{
        display: "flex", flexDirection: "column",
        justifyContent: "center", gap: 0.6,
        flex: 1, minWidth: 0, overflow: "hidden",
        py: 0.5,
      }}>
        {Object.entries(groups).map(([label, opts]) => {
          const slotKey = label.replace(" ", "_");
          return (
            <Box key={label} sx={{ display: "flex", alignItems: "center", gap: 1, minWidth: 0 }}>

              {/* Position label */}
              <Typography sx={{
                fontSize: "0.52rem", fontWeight: 700, letterSpacing: "0.08em",
                color: "#00ffcc", textTransform: "uppercase",
                whiteSpace: "nowrap", flexShrink: 0, width: 62,
              }}>
                {label}
              </Typography>

              {/* Options — scrollable */}
              <Box sx={{
                display: "flex", gap: 0.75, alignItems: "center",
                overflowX: "auto", minWidth: 0,
                scrollbarWidth: "none", "&::-webkit-scrollbar": { display: "none" },
              }}>
                <Chip active={!currentBuild[slotKey]} onClick={() => onSelect(null, slotKey)}>ORIGINAL</Chip>
                {opts.map(opt => (
                  <Chip
                    key={opt._id}
                    active={currentBuild[slotKey] === opt.modelUrl}
                    onClick={() => onSelect(opt.modelUrl, slotKey)}
                  >
                    {opt.name.replace(/front|back|rear|left|right/gi, "").trim() || opt.name}
                  </Chip>
                ))}
              </Box>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}
