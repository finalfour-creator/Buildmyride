import { Box, Typography } from "@mui/material";
import Link from "next/link";

function CarSVG({ variant }) {
  if (variant === "civic") return (
    <svg viewBox="0 0 120 55" width="100" height="45">
      <path d="M8 35 C8 35 20 18 45 14 L75 13 C90 13 102 22 110 35" stroke="#e8ff00" strokeWidth="1.8" fill="none" />
      <path d="M8 35 L110 35 L110 42 Q100 47 90 47 L30 47 Q18 47 8 42 Z" fill="#1a2a1a" stroke="#e8ff00" strokeWidth="1.2" />
      <circle cx="28" cy="47" r="6" stroke="#e8ff00" strokeWidth="1.5" fill="none" />
      <circle cx="90" cy="47" r="6" stroke="#e8ff00" strokeWidth="1.5" fill="none" />
    </svg>
  );
  if (variant === "cultus") return (
    <svg viewBox="0 0 120 55" width="100" height="45">
      <path d="M10 36 C10 36 24 20 48 16 L72 15 C88 15 100 24 110 36" stroke="#ff4d00" strokeWidth="1.8" fill="none" />
      <path d="M10 36 L110 36 L110 43 Q100 48 88 48 L32 48 Q20 48 10 43 Z" fill="#2a1010" stroke="#ff4d00" strokeWidth="1.2" />
      <circle cx="30" cy="48" r="6" stroke="#ff4d00" strokeWidth="1.5" fill="none" />
      <circle cx="88" cy="48" r="6" stroke="#ff4d00" strokeWidth="1.5" fill="none" />
    </svg>
  );
  if (variant === "corolla") return (
    <svg viewBox="0 0 120 55" width="100" height="45">
      <path d="M8 35 C8 35 22 19 46 15 L74 14 C91 14 103 23 112 35" stroke="#00d4ff" strokeWidth="1.8" fill="none" />
      <path d="M8 35 L112 35 L112 42 Q102 47 90 47 L30 47 Q18 47 8 42 Z" fill="#0a1a1a" stroke="#00d4ff" strokeWidth="1.2" />
      <circle cx="29" cy="47" r="6" stroke="#00d4ff" strokeWidth="1.5" fill="none" />
      <circle cx="91" cy="47" r="6" stroke="#00d4ff" strokeWidth="1.5" fill="none" />
    </svg>
  );
  return null;
}

export default function DesignCard({ model, date, colorDot, thumbVariant, tag, id }) {
  return (
    <Box sx={{ background: "white", border: "1px solid #e8e0d6", overflow: "hidden" }}>
      <Box sx={{ position: "relative", height: 140, background: "#0f1a1f", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <CarSVG variant={thumbVariant} />
        {tag && (
          <Box sx={{ position: "absolute", top: 12, left: 12, padding: "2px 8px", fontSize: 9, fontWeight: 600, background: "#2c5364", color: "white" }}>
            {tag}
          </Box>
        )}
        <Box sx={{ position: "absolute", bottom: 12, right: 12, display: "flex", gap: 1 }}>
          <Link href={`/configurator/customization?id=${id}`}>
            <button style={{ padding: "4px 12px", background: "rgba(0,0,0,0.75)", border: "none", color: "white", fontSize: 11, cursor: "pointer" }}>Open</button>
          </Link>
          <Link href="/ar-view">
            <button style={{ padding: "4px 12px", background: "rgba(0,0,0,0.75)", border: "none", color: "white", fontSize: 11, cursor: "pointer" }}>AR</button>
          </Link>
        </Box>
      </Box>
      <Box sx={{ p: 2 }}>
        <Typography sx={{ fontWeight: 600, fontSize: 14, color: "#1a2a32", mb: 0.5 }}>{model}</Typography>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Typography sx={{ fontSize: 11, color: "#8a9aa8" }}>{date}</Typography>
          {colorDot && <Box sx={{ width: 12, height: 12, borderRadius: "50%", background: colorDot }} />}
        </Box>
      </Box>
    </Box>
  );
}