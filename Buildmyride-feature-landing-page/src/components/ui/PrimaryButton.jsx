"use client";

const theme = {
  accentColor: "#22a7f0",
  font: "'Segoe UI', Roboto, sans-serif",
};

export default function PrimaryButton({ children, onClick, inverted = false }) {
  return (
    <button
      onClick={onClick}
      style={{
        width: "100%",
        padding: "14px",
        borderRadius: 8,
        cursor: "pointer",
        fontSize: 12,
        fontWeight: 700,
        letterSpacing: "0.1em",
        textTransform: "uppercase",
        transition: "all 0.3s ease",
        color: "#fff",
        background: inverted ? "transparent" : theme.accentColor,
        border: inverted ? "1px solid #ffffff" : "none",
        fontFamily: theme.font,
        marginTop: 10,
      }}
    >
      {children}
    </button>
  );
}
