import { Box, Checkbox, Typography } from "@mui/material";
import Link from "next/link";

function CarSVG() {
  return (
    <svg viewBox="0 0 120 55" width="100" height="45">
      <path d="M8 35 C8 35 20 18 45 14 L75 13 C90 13 102 22 110 35" stroke="#e8ff00" strokeWidth="1.8" fill="none" />
      <path d="M8 35 L110 35 L110 42 Q100 47 90 47 L30 47 Q18 47 8 42 Z" fill="#1a2a1a" stroke="#e8ff00" strokeWidth="1.2" />
      <circle cx="28" cy="47" r="6" stroke="#e8ff00" strokeWidth="1.5" fill="none" />
      <circle cx="90" cy="47" r="6" stroke="#e8ff00" strokeWidth="1.5" fill="none" />
    </svg>
  );
}

export default function DesignCard({ name, updatedAt, thumbnail, _id, state, selected, onSelect, onDelete, selectMode }) {
  const dateStr = new Date(updatedAt).toLocaleDateString();
  const carName = state?.carId?.split("_").join(" ") || "Custom Vehicle";

  return (
    <Box
      onClick={selectMode ? () => onSelect?.(_id) : undefined}
      sx={{
        background: "white",
        border: selected ? "2px solid #e74c3c" : "1px solid #e8e0d6",
        overflow: "hidden",
        borderRadius: 1,
        cursor: selectMode ? "pointer" : "default",
        transition: "border 0.15s, box-shadow 0.15s",
        boxShadow: selected ? "0 0 0 3px rgba(231,76,60,0.15)" : "none",
        position: "relative",
      }}
    >
      {/* Thumbnail / preview */}
      <Box sx={{ position: "relative", height: 140, background: "#0f1a1f", display: "flex", alignItems: "center", justifyContent: "center" }}>
        {thumbnail ? (
          <img src={thumbnail} alt={name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        ) : (
          <CarSVG />
        )}

        {/* 3D badge */}
        <Box sx={{ position: "absolute", top: 10, left: 10, px: "6px", py: "2px", fontSize: 9, fontWeight: 600, background: "#2c5364", color: "white" }}>
          3D
        </Box>

        {/* Selection checkbox — top-right */}
        {selectMode && (
          <Box
            onClick={(e) => { e.stopPropagation(); onSelect?.(_id); }}
            sx={{ position: "absolute", top: 6, right: 6, background: "rgba(0,0,0,0.55)", borderRadius: "4px" }}
          >
            <Checkbox
              checked={!!selected}
              size="small"
              sx={{ p: 0.4, color: "white", "&.Mui-checked": { color: "#e74c3c" } }}
            />
          </Box>
        )}

        {/* Action buttons — bottom-right */}
        <Box sx={{ position: "absolute", bottom: 10, right: 10, display: "flex", gap: 0.8 }}>
          {!selectMode && (
            <>
              <Link href={`/configurator/customization?designId=${_id}`} onClick={(e) => e.stopPropagation()}>
                <button style={{ padding: "4px 12px", background: "rgba(0,0,0,0.75)", border: "none", color: "white", fontSize: 11, cursor: "pointer", borderRadius: 3 }}>
                  Open
                </button>
              </Link>
              <Link href="/ar-view" onClick={(e) => e.stopPropagation()}>
                <button style={{ padding: "4px 12px", background: "rgba(0,0,0,0.75)", border: "none", color: "white", fontSize: 11, cursor: "pointer", borderRadius: 3 }}>
                  AR
                </button>
              </Link>
            </>
          )}
          {/* Single delete button — always visible */}
          <button
            onClick={(e) => { e.stopPropagation(); onDelete?.(_id, name); }}
            title="Delete design"
            style={{
              padding: "4px 8px",
              background: "rgba(180,30,30,0.82)",
              border: "none",
              color: "white",
              fontSize: 13,
              cursor: "pointer",
              borderRadius: 3,
              lineHeight: 1,
            }}
          >
            🗑
          </button>
        </Box>
      </Box>

      {/* Card info */}
      <Box sx={{ p: 2 }}>
        <Typography sx={{ fontWeight: 600, fontSize: 14, color: "#1a2a32", mb: 0.5 }}>{name}</Typography>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Typography sx={{ fontSize: 11, color: "#8a9aa8" }}>{carName}</Typography>
          <Typography sx={{ fontSize: 11, color: "#8a9aa8", ml: "auto" }}>{dateStr}</Typography>
        </Box>
      </Box>

      {/* Selected overlay tint */}
      {selected && (
        <Box sx={{
          position: "absolute", inset: 0, pointerEvents: "none",
          background: "rgba(231,76,60,0.06)",
        }} />
      )}
    </Box>
  );
}
