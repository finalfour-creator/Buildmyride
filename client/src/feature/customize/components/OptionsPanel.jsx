
"use client";
import { Box, Typography, Button } from "@mui/material";

export default function OptionsPanel({
  selectedPart,
  selectedColor,
  setSelectedColor,
  selectedRim,
  setSelectedRim,
  selectedWheel,
  setSelectedWheel,
  selectedRoof,
  setSelectedRoof,
  colorPalette,
  rimOptions,
  wheelOptions,
  roofOptions,
}) {
  if (selectedPart === "body") {
    return (
      <Box sx={{ 
        background: "#0f2027", 
        border: "1px solid #2c5364", 
        p: 2,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: 2,
      }}>
        <Box>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, color: "#e2e8f0", mb: 1, letterSpacing: "0.5px" }}>
            PAINT COLORS
          </Typography>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
            {colorPalette.map((color, i) => (
              <Box
                key={i}
                onClick={() => setSelectedColor(color)}
                sx={{
                  width: 32,
                  height: 32,
                  background: color,
                  border: selectedColor === color ? "2px solid #2c5364" : "1px solid #2c5364",
                  cursor: "pointer",
                  transition: "transform 0.2s",
                  "&:hover": { transform: "scale(1.05)" },
                }}
              />
            ))}
          </Box>
        </Box>

        {/* Save Button on the Right */}
        <Button
          variant="contained"
          sx={{
            background: "linear-gradient(135deg, #0f2027, #2c5364)",
            px: 3,
            py: 1,
            borderRadius: 0,
            textTransform: "none",
            fontWeight: 600,
            fontSize: "0.8rem",
            "&:hover": { opacity: 0.9 },
            whiteSpace: "nowrap",
          }}
        >
          SAVE CONFIGURATION
        </Button>
      </Box>
    );
  }

  if (selectedPart === "rims") {
    return (
      <Box sx={{ 
        background: "#0f2027", 
        border: "1px solid #2c5364", 
        p: 2,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: 2,
      }}>
        <Box sx={{ flex: 1 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, color: "#e2e8f0", mb: 1, letterSpacing: "0.5px" }}>
            RIM STYLES
          </Typography>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
            {rimOptions.map((rim) => (
              <Button
                key={rim.id}
                onClick={() => setSelectedRim(rim.id)}
                sx={{
                  py: 0.75,
                  px: 1.5,
                  background: selectedRim === rim.id ? "linear-gradient(135deg, #2c5364, #0f2027)" : "transparent",
                  color: selectedRim === rim.id ? "#ffffff" : "#e2e8f0",
                  border: "1px solid #2c5364",
                  borderRadius: 0,
                  textTransform: "none",
                  fontSize: "0.75rem",
                  whiteSpace: "nowrap",
                  "&:hover": {
                    background: selectedRim === rim.id ? "linear-gradient(135deg, #2c5364, #0f2027)" : "rgba(44,83,100,0.2)",
                  },
                }}
              >
                {rim.name}
              </Button>
            ))}
          </Box>
        </Box>

        <Button
          variant="contained"
          sx={{
            background: "linear-gradient(135deg, #0f2027, #2c5364)",
            px: 3,
            py: 1,
            borderRadius: 0,
            textTransform: "none",
            fontWeight: 600,
            fontSize: "0.8rem",
            "&:hover": { opacity: 0.9 },
            whiteSpace: "nowrap",
          }}
        >
          SAVE CONFIGURATION
        </Button>
      </Box>
    );
  }

  if (selectedPart === "wheels") {
    return (
      <Box sx={{ 
        background: "#0f2027", 
        border: "1px solid #2c5364", 
        p: 2,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: 2,
      }}>
        <Box sx={{ flex: 1 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, color: "#e2e8f0", mb: 1, letterSpacing: "0.5px" }}>
            WHEEL PACKAGES
          </Typography>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
            {wheelOptions.map((wheel) => (
              <Button
                key={wheel.id}
                onClick={() => setSelectedWheel(wheel.id)}
                sx={{
                  py: 0.75,
                  px: 1.5,
                  background: selectedWheel === wheel.id ? "linear-gradient(135deg, #2c5364, #0f2027)" : "transparent",
                  color: selectedWheel === wheel.id ? "#ffffff" : "#e2e8f0",
                  border: "1px solid #2c5364",
                  borderRadius: 0,
                  textTransform: "none",
                  fontSize: "0.75rem",
                  whiteSpace: "nowrap",
                  "&:hover": {
                    background: selectedWheel === wheel.id ? "linear-gradient(135deg, #2c5364, #0f2027)" : "rgba(44,83,100,0.2)",
                  },
                }}
              >
                {wheel.name}
              </Button>
            ))}
          </Box>
        </Box>

        <Button
          variant="contained"
          sx={{
            background: "linear-gradient(135deg, #0f2027, #2c5364)",
            px: 3,
            py: 1,
            borderRadius: 0,
            textTransform: "none",
            fontWeight: 600,
            fontSize: "0.8rem",
            "&:hover": { opacity: 0.9 },
            whiteSpace: "nowrap",
          }}
        >
          SAVE CONFIGURATION
        </Button>
      </Box>
    );
  }

  if (selectedPart === "roof") {
    return (
      <Box sx={{ 
        background: "#0f2027", 
        border: "1px solid #2c5364", 
        p: 2,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: 2,
      }}>
        <Box sx={{ flex: 1 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, color: "#e2e8f0", mb: 1, letterSpacing: "0.5px" }}>
            ROOF CONFIGURATIONS
          </Typography>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
            {roofOptions.map((roof) => (
              <Button
                key={roof.id}
                onClick={() => setSelectedRoof(roof.id)}
                sx={{
                  py: 0.75,
                  px: 1.5,
                  background: selectedRoof === roof.id ? "linear-gradient(135deg, #2c5364, #0f2027)" : "transparent",
                  color: selectedRoof === roof.id ? "#ffffff" : "#e2e8f0",
                  border: "1px solid #2c5364",
                  borderRadius: 0,
                  textTransform: "none",
                  fontSize: "0.75rem",
                  whiteSpace: "nowrap",
                  "&:hover": {
                    background: selectedRoof === roof.id ? "linear-gradient(135deg, #2c5364, #0f2027)" : "rgba(44,83,100,0.2)",
                  },
                }}
              >
                {roof.name}
              </Button>
            ))}
          </Box>
        </Box>

        <Button
          variant="contained"
          sx={{
            background: "linear-gradient(135deg, #0f2027, #2c5364)",
            px: 3,
            py: 1,
            borderRadius: 0,
            textTransform: "none",
            fontWeight: 600,
            fontSize: "0.8rem",
            "&:hover": { opacity: 0.9 },
            whiteSpace: "nowrap",
          }}
        >
          SAVE CONFIGURATION
        </Button>
      </Box>
    );
  }

  // Placeholder for interior and lights
  if (selectedPart === "interior" || selectedPart === "lights") {
    return (
      <Box sx={{ 
        background: "#0f2027", 
        border: "1px solid #2c5364", 
        p: 3, 
        textAlign: "center",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
        gap: 2,
      }}>
        <Box>
          <Typography variant="h6" sx={{ color: "#e2e8f0", mb: 0.5, fontWeight: 500, fontSize: "1rem" }}>
            Coming Soon
          </Typography>
          <Typography variant="body2" sx={{ color: "#8a9aa8", fontSize: "0.75rem" }}>
            {selectedPart === "interior" ? "Interior" : "Lighting"} customization options are being developed
          </Typography>
        </Box>
        <Button
          variant="contained"
          sx={{
            background: "linear-gradient(135deg, #0f2027, #2c5364)",
            px: 3,
            py: 1,
            borderRadius: 0,
            textTransform: "none",
            fontWeight: 600,
            fontSize: "0.8rem",
            "&:hover": { opacity: 0.9 },
          }}
        >
          SAVE CONFIGURATION
        </Button>
      </Box>
    );
  }

  return null;
}