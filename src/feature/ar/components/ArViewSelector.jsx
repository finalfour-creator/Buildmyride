"use client";

import { Box, Button, Typography } from "@mui/material";
import { VIEWS, VIEW_LABELS, VIEW_ICONS } from "../lib/arTemplateConfig";

/**
 * Compact view-selector row shown above the template overlay.
 * User picks Front / Left / Right / Rear to load the correct silhouette.
 */
export default function ArViewSelector({ selectedView, onSelectView, isLocked }) {
  return (
    <Box
      sx={{
        position: "absolute",
        top:       12,
        left:      "50%",
        transform: "translateX(-50%)",
        zIndex:    6,
        display:   "flex",
        gap:        0.75,
        bgcolor:    "rgba(10,15,18,0.78)",
        border:     "1px solid rgba(255,255,255,0.10)",
        borderRadius: "10px",
        p:           "6px 10px",
        backdropFilter: "blur(8px)",
        alignItems: "center",
      }}
    >
      <Typography
        variant="caption"
        sx={{ color: "rgba(255,255,255,0.45)", mr: 0.5, fontSize: "0.7rem", fontWeight: 700, letterSpacing: 1 }}
      >
        VIEW
      </Typography>

      {VIEWS.map((view) => {
        const active = selectedView === view;
        return (
          <Button
            key={view}
            size="small"
            onClick={() => onSelectView(view)}
            sx={{
              minWidth:      0,
              px:            1.5,
              py:            0.5,
              fontSize:      "0.72rem",
              fontWeight:    active ? 700 : 500,
              textTransform: "none",
              borderRadius:  "7px",
              transition:    "all 0.18s",
              ...(active
                ? {
                    bgcolor:     isLocked ? "rgba(0,210,90,0.18)" : "rgba(255,255,255,0.12)",
                    color:       isLocked ? "#00d25a" : "#fff",
                    border:      `1px solid ${isLocked ? "rgba(0,210,90,0.55)" : "rgba(255,255,255,0.28)"}`,
                  }
                : {
                    bgcolor:     "transparent",
                    color:       "rgba(255,255,255,0.45)",
                    border:      "1px solid transparent",
                    "&:hover": {
                      bgcolor:   "rgba(255,255,255,0.07)",
                      color:     "rgba(255,255,255,0.85)",
                    },
                  }),
            }}
          >
            <Box component="span" sx={{ mr: 0.4, fontSize: "0.65rem" }}>
              {VIEW_ICONS[view]}
            </Box>
            {VIEW_LABELS[view]}
          </Button>
        );
      })}
    </Box>
  );
}
