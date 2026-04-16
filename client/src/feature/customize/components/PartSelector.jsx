"use client";
import { Box, Typography, Button } from "@mui/material";

export default function PartSelector({ parts, selectedPart, onSelect }) {
  return (
    <Box sx={{ 
      background: "#0f2027", 
      border: "1px solid #2c5364", 
      p: 2,
    }}>
      <Typography variant="caption" sx={{ color: "#8a9aa8", letterSpacing: 1, mb: 1.5, display: "block" }}>
        CUSTOMIZATION
      </Typography>
      <Box sx={{ display: "flex", flexDirection: "column", gap: 0.75 }}>
        {parts.map((part) => (
          <Button
            key={part.id}
            onClick={() => onSelect(part.id)}
            sx={{
              justifyContent: "flex-start",
              py: 1,
              px: 1.5,
              background: selectedPart === part.id ? "linear-gradient(135deg, #2c5364, #0f2027)" : "transparent",
              color: selectedPart === part.id ? "#ffffff" : "#e2e8f0",
              border: selectedPart === part.id ? "none" : "1px solid #2c5364",
              borderRadius: 0,
              textTransform: "none",
              fontWeight: selectedPart === part.id ? 600 : 500,
              fontSize: "0.8rem",
              "&:hover": {
                background: selectedPart === part.id ? "linear-gradient(135deg, #2c5364, #0f2027)" : "rgba(44,83,100,0.2)",
              },
            }}
          >
            <span style={{ fontSize: 14, marginRight: 10, color: "#2c5364" }}>{part.icon}</span>
            {part.name}
          </Button>
        ))}
      </Box>
    </Box>
  );
}