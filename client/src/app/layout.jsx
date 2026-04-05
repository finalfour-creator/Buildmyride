"use client";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";

const theme = createTheme({
  palette: {
    primary: {
      main: "#2c5364",
      dark: "#0f2027",
      light: "#203a43",
    },
    background: {
      default: "#fefcf8",
      paper: "#ffffff",
    },
    text: {
      primary: "#1a2a32",
      secondary: "#6b7c88",
    },
  },
  typography: {
    fontFamily: "'Inter', 'SF Pro Display', system-ui, sans-serif",
    h1: {
      fontWeight: 600,
      letterSpacing: "-1px",
    },
    h2: {
      fontWeight: 500,
      letterSpacing: "-0.5px",
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
          borderRadius: 0,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 0,
          boxShadow: "none",
          border: "1px solid #e8e0d6",
        },
      },
    },
  },
});

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}