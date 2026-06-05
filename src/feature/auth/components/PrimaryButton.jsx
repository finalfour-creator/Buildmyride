"use client";
import Button from "@mui/material/Button";

export default function PrimaryButton({ children, onClick, inverted = false }) {
  return (
    <Button
      onClick={onClick}
      fullWidth
      variant={inverted ? "outlined" : "contained"}
      sx={{
        mt: 1,
        py: 1.75,
        borderRadius: 2,
        fontSize: 12,
        fontWeight: 700,
        letterSpacing: "0.1em",
        color: "#fff",
        background: inverted ? "transparent" : "#22a7f0",
        borderColor: inverted ? "#fff" : "none",
        boxShadow: "none",
        "&:hover": {
          background: inverted ? "rgba(255,255,255,0.08)" : "#1a90d0",
          borderColor: inverted ? "#fff" : "none",
          boxShadow: "none",
        },
      }}
    >
      {children}
    </Button>
  );
}