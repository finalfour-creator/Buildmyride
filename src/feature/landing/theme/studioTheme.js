import { createTheme } from "@mui/material/styles";
import { TOKENS } from "./tokens";

export const studioTheme = createTheme({
  palette: {
    mode: "dark",
    primary: { main: TOKENS.colors.accent },
    secondary: { main: TOKENS.colors.accent2 },
    background: {
      default: TOKENS.colors.black,
      paper: TOKENS.colors.dim,
    },
    text: {
      primary: TOKENS.colors.white,
      secondary: TOKENS.colors.soft,
    },
  },
  typography: {
    fontFamily: TOKENS.fonts.body,
    h1: { fontFamily: TOKENS.fonts.display, fontWeight: 900, letterSpacing: "-0.03em" },
    h2: { fontFamily: TOKENS.fonts.display, fontWeight: 900, letterSpacing: "-0.03em" },
    h3: { fontFamily: TOKENS.fonts.display, fontWeight: 800, letterSpacing: "-0.02em" },
    h4: { fontFamily: TOKENS.fonts.display, fontWeight: 800 },
    h5: { fontFamily: TOKENS.fonts.display, fontWeight: 700 },
    h6: { fontFamily: TOKENS.fonts.display, fontWeight: 700 },
  },
  components: {
    MuiButton: { defaultProps: { disableElevation: true } },
  },
});
