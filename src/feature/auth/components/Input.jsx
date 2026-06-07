"use client";

import TextField from "@mui/material/TextField";

export default function Input({ label, type = "text", value, onChange, error = false, helperText = "", registration }) {
  return (
    <TextField
      label={label}
      type={type}
      value={value}
      onChange={onChange}
      error={error}
      helperText={helperText}
      fullWidth
      variant="outlined"
      {...registration}
      sx={{
        mb: 2,
        "& .MuiOutlinedInput-root": {
          color: "#fff",
          fontSize: 14,
          borderRadius: 2,
          background: "rgba(255,255,255,0.05)",
          "& fieldset": { borderColor: "rgba(255,255,255,0.1)" },
          "&:hover fieldset": { borderColor: "rgba(255,255,255,0.3)" },
          "&.Mui-focused fieldset": { borderColor: "#22a7f0" },
        },
        "& .MuiInputLabel-root": { color: "#aaa", fontSize: 13 },
        "& .MuiInputLabel-root.Mui-focused": { color: "#22a7f0" },
        "& .MuiOutlinedInput-root.Mui-error fieldset": { borderColor: "#f44336" },
        "& .MuiFormHelperText-root": {
          color: "#f44336",
          fontSize: 11,
          ml: 0,
        },
      }}
    />
  );
}
