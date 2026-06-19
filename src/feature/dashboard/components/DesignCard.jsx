"use client";
import { Box, Checkbox, Typography } from "@mui/material";
import Link from "next/link";

function CarSVG() {
  return (
    <svg viewBox="0 0 120 55" width="100" height="45">
      <path d="M8 35 C8 35 20 18 45 14 L75 13 C90 13 102 22 110 35" stroke="#2c5364" strokeWidth="1.8" fill="none" />
      <path d="M8 35 L110 35 L110 42 Q100 47 90 47 L30 47 Q18 47 8 42 Z" fill="rgba(44, 83, 100, 0.08)" stroke="#2c5364" strokeWidth="1.2" />
      <circle cx="28" cy="47" r="6" stroke="#2c5364" strokeWidth="1.5" fill="none" />
      <circle cx="90" cy="47" r="6" stroke="#2c5364" strokeWidth="1.5" fill="none" />
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
        background: "#ffffff",
        border: selected
          ? "2px solid #dc2626"
          : "1px solid rgba(0, 0, 0, 0.06)",
        overflow: "hidden",
        borderRadius: 3,
        cursor: selectMode ? "pointer" : "default",
        transition: "all 0.3s ease",
        boxShadow: selected
          ? "0 0 0 3px rgba(220, 38, 38, 0.12), 0 4px 16px rgba(220, 38, 38, 0.1)"
          : "0 2px 12px rgba(0, 0, 0, 0.06)",
        position: "relative",
        "&:hover": {
          transform: "translateY(-3px)",
          boxShadow: selected
            ? "0 0 0 3px rgba(220, 38, 38, 0.15), 0 8px 28px rgba(220, 38, 38, 0.12)"
            : "0 8px 32px rgba(44, 83, 100, 0.14)",
          borderColor: selected ? "#dc2626" : "rgba(44, 83, 100, 0.15)",
        },
      }}
    >
      {/* Thumbnail / preview */}
      <Box sx={{
        position: "relative",
        height: 140,
        background: "linear-gradient(135deg, #f0f4f8, #e2e8f0)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}>
        {thumbnail ? (
          <img src={thumbnail} alt={name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        ) : (
          <CarSVG />
        )}

        {/* 3D badge */}
        <Box sx={{
          position: "absolute", top: 10, left: 10,
          px: "8px", py: "3px", fontSize: 9, fontWeight: 700,
          fontFamily: "'Orbitron', sans-serif",
          letterSpacing: "0.1em",
          background: "rgba(44, 83, 100, 0.9)",
          color: "#ffffff",
          borderRadius: "6px",
        }}>
          3D
        </Box>

        {/* Selection checkbox */}
        {selectMode && (
          <Box
            onClick={(e) => { e.stopPropagation(); onSelect?.(_id); }}
            sx={{
              position: "absolute", top: 6, right: 6,
              background: "rgba(255, 255, 255, 0.9)",
              backdropFilter: "blur(8px)",
              borderRadius: "6px",
              border: "1px solid rgba(0, 0, 0, 0.1)",
            }}
          >
            <Checkbox
              checked={!!selected}
              size="small"
              sx={{ p: 0.4, color: "#94a3b8", "&.Mui-checked": { color: "#dc2626" } }}
            />
          </Box>
        )}

        {/* Action buttons */}
        <Box sx={{ position: "absolute", bottom: 10, right: 10, display: "flex", gap: 0.8 }}>
          {!selectMode && (
            <>
              <Link href={`/configurator/customization?designId=${_id}`} onClick={(e) => e.stopPropagation()}>
                <button style={{
                  padding: "5px 14px",
                  background: "rgba(44, 83, 100, 0.9)",
                  border: "none",
                  color: "#ffffff", fontSize: 10, fontWeight: 700,
                  fontFamily: "'Orbitron', sans-serif",
                  letterSpacing: "0.08em", cursor: "pointer",
                  borderRadius: 6, textTransform: "uppercase",
                  transition: "all 0.2s ease",
                }}>
                  Open
                </button>
              </Link>
              <Link href="/ar-view" onClick={(e) => e.stopPropagation()}>
                <button style={{
                  padding: "5px 14px",
                  background: "rgba(44, 83, 100, 0.9)",
                  border: "none",
                  color: "#ffffff", fontSize: 10, fontWeight: 700,
                  fontFamily: "'Orbitron', sans-serif",
                  letterSpacing: "0.08em", cursor: "pointer",
                  borderRadius: 6, textTransform: "uppercase",
                  transition: "all 0.2s ease",
                }}>
                  AR
                </button>
              </Link>
            </>
          )}
          <button
            onClick={(e) => { e.stopPropagation(); onDelete?.(_id, name); }}
            title="Delete design"
            style={{
              padding: "4px 8px",
              background: "rgba(220, 38, 38, 0.9)",
              border: "none",
              color: "#ffffff", fontSize: 13, cursor: "pointer",
              borderRadius: 6, lineHeight: 1, transition: "all 0.2s ease",
            }}
          >
            🗑
          </button>
        </Box>
      </Box>

      {/* Card info */}
      <Box sx={{ p: 2 }}>
        <Typography sx={{ fontWeight: 700, fontSize: 14, fontFamily: "'Outfit', sans-serif", color: "#1a2a32", mb: 0.5 }}>
          {name}
        </Typography>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Typography sx={{ fontSize: 11, color: "#64748b", fontFamily: "'Outfit', sans-serif" }}>
            {carName}
          </Typography>
          <Typography sx={{ fontSize: 11, color: "#94a3b8", fontFamily: "'Outfit', sans-serif", ml: "auto" }}>
            {dateStr}
          </Typography>
        </Box>
      </Box>

      {/* Selected overlay tint */}
      {selected && (
        <Box sx={{
          position: "absolute", inset: 0, pointerEvents: "none",
          background: "rgba(220, 38, 38, 0.04)",
          borderRadius: 3,
        }} />
      )}
    </Box>
  );
}
