"use client";

import { useState } from "react";

const theme = {
  accentColor: "#22a7f0",
  font: "'Segoe UI', Roboto, sans-serif",
};

export default function Input({ label, type = "text", value, onChange }) {
  const [focused, setFocused] = useState(false);
  const raised = focused || (value && value.length > 0);

  return (
    <div style={{ position: "relative", marginBottom: 16 }}>
      <label
        style={{
          position: "absolute",
          left: 14,
          top: raised ? -10 : 12,
          fontSize: raised ? 10 : 13,
          color: focused ? theme.accentColor : "#aaa",
          background: "#1a1a1d",
          padding: "0 6px",
          borderRadius: 4,
          transition: "all 0.2s ease",
          pointerEvents: "none",
          fontFamily: theme.font,
        }}
      >
        {label}
      </label>

      <input
        type={type}
        value={value}
        onChange={onChange}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          width: "100%",
          padding: "12px 14px",
          fontSize: 14,
          color: "#fff",
          borderRadius: 8,
          outline: "none",
          border: focused
            ? `2px solid ${theme.accentColor}`
            : "1px solid rgba(255,255,255,0.1)",
          background: "rgba(255,255,255,0.05)",
          fontFamily: theme.font,
        }}
      />
    </div>
  );
}