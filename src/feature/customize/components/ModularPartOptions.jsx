import { Box, Typography, Grid, Paper } from "@mui/material";

export default function ModularPartOptions({ category, options, currentBuild, onSelect }) {
  const catLower = category.toLowerCase();
  const isBumper = catLower.includes("bumper");
  const isDoor = catLower.includes("door");

  // Helper to categorize parts by position
  const getPosition = (name) => {
    const n = name.toUpperCase();
    const isFront = n.includes("FRONT") || n.includes("DRIVER") || n.includes("PASSENGER") || n.includes("_LF") || n.includes("_RF");
    const isRear = n.includes("REAR") || n.includes("BACK") || n.includes("_LB") || n.includes("_RB") || n.includes("_LR") || n.includes("_RR");
    const isLeft = n.includes("LEFT") || n.includes("DRIVER") || n.includes("_LF") || n.includes("_LB") || n.includes("_LR");
    const isRight = n.includes("RIGHT") || n.includes("PASSENGER") || n.includes("_RF") || n.includes("_RB") || n.includes("_RR");

    if (isFront && isLeft) return "Front_Left";
    if (isFront && isRight) return "Front_Right";
    if (isRear && isLeft) return "Rear_Left";
    if (isRear && isRight) return "Rear_Right";
    
    // Fallbacks
    if (isFront) return "Front";
    if (isRear) return "Back";
    return null;
  };

  // Grouping logic
  let groups = { [category]: options };
  
  if (isBumper || isDoor) {
    const grouped = {};
    options.forEach(opt => {
      const pos = getPosition(opt.name);
      const label = pos ? pos.replace("_", " ") : "Other";
      if (!grouped[label]) grouped[label] = [];
      grouped[label].push(opt);
    });
    
    // Only use grouping if we actually found multiple positions
    if (Object.keys(grouped).length > 1) {
      groups = grouped;
    }
  }

  const renderGrid = (groupLabel, groupOptions, slotKey) => (
    <Box key={groupLabel} sx={{ mb: 3 }}>
      {Object.keys(groups).length > 1 && (
        <Typography variant="caption" sx={{ color: "#2c5364", fontWeight: 700, mb: 1, display: "block" }}>
          {groupLabel.toUpperCase()}
        </Typography>
      )}

      <Grid container spacing={1.5}>
        <Grid item xs={6}>
          <Paper
            onClick={() => onSelect(null, slotKey)}
            sx={{
              p: 1,
              textAlign: "center",
              cursor: "pointer",
              bgcolor: !currentBuild[slotKey] ? "#1e3a5f" : "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.1)",
              "&:hover": { bgcolor: "rgba(255,255,255,0.1)" },
            }}
          >
            <Typography variant="caption" sx={{ color: "#fff" }}>Original</Typography>
          </Paper>
        </Grid>

        {groupOptions.map((option) => (
          <Grid item xs={6} key={option._id}>
            <Paper
              onClick={() => onSelect(option.modelUrl, slotKey)}
              sx={{
                p: 1,
                textAlign: "center",
                cursor: "pointer",
                bgcolor: currentBuild[slotKey] === option.modelUrl ? "#1e3a5f" : "rgba(255,255,255,0.03)",
                border: currentBuild[slotKey] === option.modelUrl ? "1px solid #2c5364" : "1px solid rgba(255,255,255,0.1)",
                transition: "all 0.2s",
                "&:hover": { bgcolor: "rgba(255,255,255,0.08)" },
              }}
            >
              {option.thumbnail && (
                <Box component="img" src={option.thumbnail} sx={{ width: "100%", height: 50, objectFit: "contain", mb: 0.5 }} />
              )}
              <Typography variant="caption" sx={{ display: "block", color: "#fff", fontSize: "0.7rem", fontWeight: 500 }}>
                {option.name.replace(/front|back|rear/gi, "").trim() || option.name}
              </Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Box>
  );

  return (
    <Box sx={{ p: 2, color: "#fff" }}>
      <Typography variant="h6" sx={{ mb: 2, fontSize: "0.9rem", fontWeight: 700, textTransform: "uppercase", color: "#fff" }}>
        {category} Options
      </Typography>

      {Object.entries(groups).map(([label, opts]) => {
        // If we have multiple groups (like Front/Back), we use the label as the slot key
        const hasSubgroups = Object.keys(groups).length > 1;
        const slotKey = hasSubgroups ? label.replace(" ", "_") : category;
        return renderGrid(label, opts, slotKey);
      })}
    </Box>
  );
}
