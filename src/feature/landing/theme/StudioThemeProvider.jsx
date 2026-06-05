"use client";
import { ThemeProvider } from "@mui/material/styles";
import { studioTheme } from "./studioTheme";

export default function StudioThemeProvider({ children }) {
  return <ThemeProvider theme={studioTheme}>{children}</ThemeProvider>;
}
