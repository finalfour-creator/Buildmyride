"use client";

import { Box, Typography, Button, Chip } from "@mui/material";
import { PART_CLASSES, PART_COLORS } from "../lib/yoloCarParts";
import { ANCHOR_CONFIG, VIEW_LABELS } from "../lib/arTemplateConfig";
import BodyOptions from "@/feature/customize/components/BodyOptions";
import { AR_PUBLIC_ASSETS } from "../lib/arPartsPubCatalog";

/**


 * Right-side panel — three modes:
 *
 *  "car"      — whole-car segmentation + colour picker
 *  "parts"    — per-part YOLOv8-seg detection, highlight selector
 *  "template" — template-aligned AR model placement per view
 */
const ModeBtn = ({
  id,
  icon,
  label,
  activeColor,
  mode,
  setMode,
}) => {
  const active = mode === id;
  return (
    <Button
      size="small"
      onClick={() => setMode(id)}
      sx={{
        flex: 1,
        textTransform: "none",
        fontWeight: 600,
        fontSize: "0.72rem",
        py: 0.7,
        ...(active
          ? {
              background: "linear-gradient(135deg,#0f2027,#2c5364)",
              color: activeColor,
              border: `1px solid ${activeColor}44`,
            }
          : {
              color: "#64748b",
              borderColor: "#2c5364",
              border: "1px solid #2c5364",
              bgcolor: "transparent",
              "&:hover": { borderColor: activeColor + "66", color: activeColor },
            }),
      }}
    >
      {icon} {label}
    </Button>
  );
};

export default function ArPartsPanel({
  mode, setMode,
  selectedColor, setSelectedColor,
  selectedPart,  setSelectedPart,
  // template-mode props
  selectedView,
  enabledAnchors, setEnabledAnchors,
  isLocked,
  partColors,    setPartColors,
}) {

  return (
    <Box
      sx={{
        width:      { xs: "100%", md: 320 },
        flexShrink:  0,
        height:      { xs: "42vh", md: "100%" },
        display:     "flex",
        flexDirection: "column",
        bgcolor:    "#0f2027",
        borderLeft: { md: "1px solid #2c5364" },
        borderTop:  { xs: "1px solid #2c5364", md: "none" },
      }}
    >
      {/* ── Header ── */}
      <Box sx={{ p: 2, borderBottom: "1px solid #2c5364", flexShrink: 0 }}>
        <Typography
          variant="caption"
          sx={{ color: "#8a9aa8", letterSpacing: 1, fontWeight: 700, display: "block", mb: 1.5 }}
        >
          MODE
        </Typography>

        <Box sx={{ display: "flex", gap: 0.75 }}>
          <ModeBtn
            id="car"
            icon="●"
            label="Whole Car"
            activeColor="#00d25a"
            mode={mode}
            setMode={setMode}
          />
          <ModeBtn
            id="parts"
            icon="▣"
            label="Parts"
            activeColor="#ff6b35"
            mode={mode}
            setMode={setMode}
          />
          <ModeBtn
            id="template"
            icon="⬡"
            label="AR Modify"
            activeColor="#60a5fa"
            mode={mode}
            setMode={setMode}
          />
        </Box>
      </Box>

      {/* ── Scrollable content ── */}
      <Box sx={{ flex: 1, overflowY: "auto", minHeight: 0 }}>

        {/* ── Whole Car mode ── */}
        {mode === "car" && (
          <BodyOptions selectedColor={selectedColor} setSelectedColor={setSelectedColor} />
        )}

        {/* ── Parts mode ── */}

        {mode === "parts" && (
          <Box sx={{ p: 2 }}>
            <Typography variant="caption"
              sx={{ color: "#8a9aa8", letterSpacing: 1, fontWeight: 700, display: "block", mb: 1 }}>
              SELECT A PART TO HIGHLIGHT
            </Typography>
            <Typography variant="caption" sx={{ color: "#64748b", display: "block", mb: 2 }}>
              Detected parts are masked. Tap to isolate one.
            </Typography>

            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
              {PART_CLASSES.map((name, i) => {
                const color  = PART_COLORS[i % PART_COLORS.length];
                const active = selectedPart === name;
                return (
                  <Button
                    key={name}
                    size="small"
                    onClick={() => setSelectedPart(active ? null : name)}
                    sx={{
                      textTransform: "none",
                      fontWeight:    active ? 700 : 400,
                      fontSize:      "0.75rem",
                      px: 1.5, py: 0.6,
                      borderRadius:  "6px",
                      border:  `1.5px solid ${active ? color : color + "55"}`,
                      bgcolor: active ? color + "28" : "transparent",
                      color:   active ? color : "#94a3b8",
                      transition: "all 0.15s",
                      "&:hover": { bgcolor: color + "20", borderColor: color, color },
                    }}
                  >
                    <Box component="span" sx={{
                      display: "inline-block", width: 7, height: 7,
                      borderRadius: "50%", bgcolor: color, mr: 0.75, flexShrink: 0,
                    }} />
                    {name}
                  </Button>
                );
              })}
            </Box>

            {selectedPart && (
              <Box sx={{ mt: 2, p: 1.25, borderRadius: 1,
                bgcolor: "rgba(255,107,53,0.08)", border: "1px solid rgba(255,107,53,0.25)" }}>
                <Typography variant="caption" sx={{ color: "#ff6b35", fontWeight: 600 }}>
                  Highlighting: {selectedPart}
                </Typography>
              </Box>
            )}
          </Box>
        )}

        {/* ── Template (AR Modify) mode ── */}
        {mode === "template" && (
          <TemplatePanel
            selectedView={selectedView}
            enabledAnchors={enabledAnchors}
            setEnabledAnchors={setEnabledAnchors}
            isLocked={isLocked}
            selectedColor={selectedColor}
            setSelectedColor={setSelectedColor}
            partColors={partColors}
            setPartColors={setPartColors}
          />
        )}
      </Box>
    </Box>
  );
}

// ── Template mode panel ───────────────────────────────────────────────────────

function PartColorRow({ label, colorKey, options, partColors, setPartColors }) {
  const current = partColors?.[colorKey] ?? null;
  return (
    <Box sx={{ mb: 1.5 }}>
      <Typography sx={{ fontSize: "0.73rem", color: "#94a3b8", mb: 0.75, fontWeight: 600 }}>
        {label}
      </Typography>
      <Box sx={{ display: "flex", gap: 0.75, flexWrap: "wrap" }}>
        {options.map((opt) => {
          const isActive = current === opt.value;
          return (
            <Button
              key={opt.label}
              size="small"
              onClick={() =>
                setPartColors?.((prev) => ({ ...prev, [colorKey]: opt.value }))
              }
              sx={{
                textTransform: "none",
                fontSize:      "0.70rem",
                py: 0.4, px: 1.2,
                minWidth: 0,
                borderRadius: "6px",
                border: `1.5px solid ${isActive ? "#60a5fa" : "#334155"}`,
                bgcolor: isActive ? "rgba(96,165,250,0.12)" : "transparent",
                color:   isActive ? "#60a5fa" : "#64748b",
                display: "flex",
                alignItems: "center",
                gap: 0.5,
              }}
            >
              {opt.value && (
                <Box
                  sx={{
                    width: 10, height: 10,
                    borderRadius: "2px",
                    bgcolor: opt.value,
                    border: "1px solid rgba(255,255,255,0.15)",
                    flexShrink: 0,
                  }}
                />
              )}
              {opt.label}
            </Button>
          );
        })}
      </Box>
    </Box>
  );
}

const WHEEL_KEYS = ["wheel_front", "wheel_rear", "wheel_front_v2", "wheel_rear_v2"];

function TemplatePanel({ selectedView, enabledAnchors, setEnabledAnchors, isLocked, selectedColor, setSelectedColor, partColors, setPartColors }) {
  const anchors = selectedView ? ANCHOR_CONFIG[selectedView] ?? {} : {};

  // Detect which wheel style is currently active
  const wheelStyle =
    enabledAnchors?.has("wheel_front_v2") ? "wheel2" :
    enabledAnchors?.has("wheel_front")    ? "wheel1" :
    "none";

  const selectWheels = (style) => {
    setEnabledAnchors((prev) => {
      const next = new Set(prev);
      WHEEL_KEYS.forEach((k) => next.delete(k));
      if (style === "wheel1") { next.add("wheel_front"); next.add("wheel_rear"); }
      if (style === "wheel2") { next.add("wheel_front_v2"); next.add("wheel_rear_v2"); }
      return next;
    });
  };

  const toggle = (key) => {
    if (WHEEL_KEYS.includes(key)) return; // wheels handled by the style picker
    setEnabledAnchors((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        if (key === "window_sticker_1" && next.has("window_sticker_2")) next.delete("window_sticker_2");
        if (key === "window_sticker_2" && next.has("window_sticker_1")) next.delete("window_sticker_1");
        next.add(key);
      }
      return next;
    });
  };

  if (!selectedView) {
    return (
      <Box sx={{ p: 2.5, textAlign: "center" }}>
        <Typography variant="caption" sx={{ color: "#64748b" }}>
          Switch to the camera view and select a view angle (Front / Left / Right / Rear) to begin.
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 2 }}>
      {/* Alignment status */}
      <Box sx={{
        mb: 2, p: 1.25, borderRadius: 1,
        bgcolor: isLocked ? "rgba(0,210,90,0.08)" : "rgba(255,255,255,0.04)",
        border:  `1px solid ${isLocked ? "rgba(0,210,90,0.30)" : "#2c5364"}`,
      }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Box sx={{
            width: 8, height: 8, borderRadius: "50%",
            bgcolor: isLocked ? "#00d25a" : "#64748b",
            flexShrink: 0,
          }} />
          <Typography variant="caption" sx={{ color: isLocked ? "#00d25a" : "#64748b", fontWeight: 700 }}>
            {isLocked ? "Car locked — modifications active" : "Align car to template to activate"}
          </Typography>
        </Box>
      </Box>

      {/* View label */}
      <Typography variant="caption"
        sx={{ color: "#8a9aa8", letterSpacing: 1, fontWeight: 700, display: "block", mb: 1 }}>
        {VIEW_LABELS[selectedView]?.toUpperCase()} — AVAILABLE PARTS
      </Typography>

      {/* ── Wheel Style (side views only) ─────────────────────────── */}
      {(selectedView === "left" || selectedView === "right") && (
        <Box sx={{ mb: 2 }}>
          <Typography variant="caption"
            sx={{ color: "#8a9aa8", letterSpacing: 1, fontWeight: 700, display: "block", mb: 1 }}>
            WHEEL STYLE
          </Typography>
          <Box sx={{ display: "flex", gap: 0.75 }}>
            {[
              { id: "none",   label: "Off"     },
              { id: "wheel1", label: "Wheel 1" },
              { id: "wheel2", label: "Wheel 2" },
            ].map(({ id, label }) => {
              const active = wheelStyle === id;
              return (
                <Button
                  key={id}
                  size="small"
                  onClick={() => selectWheels(id)}
                  sx={{
                    flex: 1,
                    textTransform: "none",
                    fontWeight:    active ? 700 : 400,
                    fontSize:      "0.75rem",
                    py: 0.6, px: 0,
                    borderRadius:  "8px",
                    border:   `1.5px solid ${active ? "#60a5fa" : "#334155"}`,
                    bgcolor:  active ? "rgba(96,165,250,0.14)" : "transparent",
                    color:    active ? "#60a5fa" : "#64748b",
                    transition: "all 0.15s",
                    "&:hover": { borderColor: "#60a5fa88", color: "#60a5fa" },
                  }}
                >
                  {label}
                </Button>
              );
            })}
          </Box>
        </Box>
      )}

      {/* Anchor toggles — wheel keys are handled above, excluded here */}
      <Box sx={{ display: "flex", flexDirection: "column", gap: 0.75, mb: 2 }}>
        {Object.entries(anchors)
          .filter(([key]) => !WHEEL_KEYS.includes(key))
          .map(([key, cfg]) => {
          const enabled = enabledAnchors?.has(key) ?? false;
          const hasAsset = Boolean(cfg.model || cfg.texture);
          return (
            <Box
              key={key}
              onClick={() => hasAsset && toggle(key)}
              sx={{
                display:      "flex",
                alignItems:   "center",
                gap:           1,
                p:             "8px 12px",
                borderRadius:  "8px",
                border:        `1px solid ${enabled ? "#60a5fa55" : "#2c5364"}`,
                bgcolor:       enabled ? "rgba(96,165,250,0.08)" : "transparent",
                cursor:        hasAsset ? "pointer" : "not-allowed",
                opacity:       hasAsset ? 1 : 0.45,
                transition:   "all 0.15s",
                "&:hover":     hasAsset ? { border: "1px solid #60a5fa88", bgcolor: "rgba(96,165,250,0.12)" } : {},
              }}
            >
              {/* On/off dot */}
              <Box sx={{
                width: 10, height: 10, borderRadius: "50%", flexShrink: 0,
                bgcolor: enabled ? "#60a5fa" : "#334155",
                border:  `2px solid ${enabled ? "#60a5fa" : "#475569"}`,
                transition: "all 0.15s",
              }} />

              <Box sx={{ flex: 1 }}>
                <Typography sx={{ fontSize: "0.78rem", fontWeight: 600,
                  color: enabled ? "#e2e8f0" : "#64748b" }}>
                  {cfg.label}
                </Typography>
                {cfg.texture && (
                  <Typography sx={{ fontSize: "0.65rem", color: enabled ? "#60a5fa" : "#475569", fontWeight: 500 }}>
                    Sticker Decal
                  </Typography>
                )}
                {cfg.model && (
                  <Typography sx={{ fontSize: "0.65rem", color: enabled ? "#34d399" : "#475569", fontWeight: 500 }}>
                    3D Modifier
                  </Typography>
                )}
                {!hasAsset && (
                  <Typography sx={{ fontSize: "0.65rem", color: "#f87171" }}>
                    Asset not available
                  </Typography>
                )}
              </Box>

              {hasAsset && (
                <Chip
                  label={enabled ? "ON" : "OFF"}
                  size="small"
                  sx={{
                    height: 18, fontSize: "0.60rem", fontWeight: 700,
                    bgcolor: enabled ? "rgba(96,165,250,0.18)" : "transparent",
                    color:   enabled ? "#60a5fa" : "#475569",
                    border:  `1px solid ${enabled ? "#60a5fa55" : "#334155"}`,
                  }}
                />
              )}
            </Box>
          );
        })}
      </Box>

      {/* Paint color for template mode */}
      <Typography variant="caption"
        sx={{ color: "#8a9aa8", letterSpacing: 1, fontWeight: 700, display: "block", mb: 1 }}>
        PAINT COLOUR
      </Typography>
      <BodyOptions selectedColor={selectedColor} setSelectedColor={setSelectedColor} />

      {/* ── Individual part colours ── */}
      <Typography variant="caption"
        sx={{ color: "#8a9aa8", letterSpacing: 1, fontWeight: 700, display: "block", mt: 2.5, mb: 1.25 }}>
        PART COLOURS
      </Typography>

      <PartColorRow
        label="Hood"
        colorKey="hood"
        options={[
          { label: "Original", value: null },
          { label: "Black",    value: "#111111" },
          { label: "Red",      value: "#dc2626" },
          { label: "Blue",     value: "#2563eb" },
        ]}
        partColors={partColors}
        setPartColors={setPartColors}
      />

      <PartColorRow
        label="Front Bumper"
        colorKey="front_bumper"
        options={[
          { label: "Original", value: null },
          { label: "Black",    value: "#111111" },
        ]}
        partColors={partColors}
        setPartColors={setPartColors}
      />

      <PartColorRow
        label="Rear Bumper"
        colorKey="rear_bumper"
        options={[
          { label: "Original", value: null },
          { label: "Black",    value: "#111111" },
        ]}
        partColors={partColors}
        setPartColors={setPartColors}
      />
    </Box>
  );
}
