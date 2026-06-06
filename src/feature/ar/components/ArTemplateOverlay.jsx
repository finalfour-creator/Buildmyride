"use client";

import { useEffect, useRef } from "react";
import { Box } from "@mui/material";
import { getTemplateBox } from "../lib/arTemplateConfig";

const COLORS = {
  idle:    "rgba(255,255,255,0.35)",
  partial: "rgba(255,184,0,0.70)",
  locked:  "rgba(0,210,90,0.90)",
};

/**
 * Draws a car-silhouette alignment template over the camera feed.
 *
 * Visual states:
 *   alignScore < 0.30  → white dashed outline + "Align your car" guide
 *   alignScore 0.30-threshold → amber outline, fill animates in
 *   isLocked           → green outline + "✓ Locked" + corners flash
 */
export default function ArTemplateOverlay({
  containerRef,
  selectedView,
  alignScore = 0,
  isLocked   = false,
  overlayBox = null,
}) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas    = canvasRef.current;
    const container = containerRef?.current;
    if (!canvas || !container || !selectedView) return;

    let rafId;

    const draw = () => {
      const cw = container.clientWidth;
      const ch = container.clientHeight;
      if (!cw || !ch) { rafId = requestAnimationFrame(draw); return; }

      if (canvas.width !== cw || canvas.height !== ch) {
        canvas.width  = cw;
        canvas.height = ch;
      }

      const ctx = canvas.getContext("2d");
      ctx.clearRect(0, 0, cw, ch);

      const tb = overlayBox || getTemplateBox(selectedView, cw, ch);
      const { x, y, w, h } = tb;

      const col = isLocked
        ? COLORS.locked
        : alignScore > 0.28
        ? COLORS.partial
        : COLORS.idle;

      // ── Dim everything outside the template ─────────────────────────────
      ctx.fillStyle = "rgba(0,0,0,0.42)";
      ctx.fillRect(0, 0, cw, ch);
      // Cut out template interior
      ctx.save();
      ctx.globalCompositeOperation = "destination-out";
      drawSilhouettePath(ctx, selectedView, x, y, w, h);
      ctx.fill();
      ctx.restore();

      // ── Subtle fill inside template based on alignment ───────────────────
      ctx.save();
      ctx.globalCompositeOperation = "source-over";
      drawSilhouettePath(ctx, selectedView, x, y, w, h);
      ctx.clip();
      const fillAlpha = Math.min(0.18, alignScore * 0.28);
      ctx.fillStyle = isLocked
        ? `rgba(0,210,90,${fillAlpha + 0.06})`
        : `rgba(255,255,255,${fillAlpha})`;
      ctx.fillRect(x, y, w, h);
      ctx.restore();

      // ── Silhouette border ────────────────────────────────────────────────
      ctx.save();
      drawSilhouettePath(ctx, selectedView, x, y, w, h);
      ctx.lineWidth   = isLocked ? 3 : 2;
      ctx.strokeStyle = col;
      if (!isLocked) {
        ctx.setLineDash([12, 8]);
        ctx.lineDashOffset = -performance.now() / 60;
      } else {
        ctx.setLineDash([]);
      }
      ctx.stroke();
      ctx.restore();

      // ── Blueprint details (subtle interior wireframe) ────────────────────
      ctx.save();
      ctx.lineWidth = 1;
      ctx.strokeStyle = isLocked ? "rgba(0, 210, 90, 0.4)" : "rgba(255, 255, 255, 0.28)";
      if (!isLocked) {
        ctx.setLineDash([4, 6]);
      } else {
        ctx.setLineDash([]);
      }
      drawBlueprintDetails(ctx, selectedView, x, y, w, h);
      ctx.restore();

      // ── Corner L-shape accents ───────────────────────────────────────────
      drawCorners(ctx, x, y, w, h, col, Math.min(22, w * 0.08));

      // ── Status text ──────────────────────────────────────────────────────
      ctx.textAlign    = "center";
      ctx.textBaseline = "middle";

      if (isLocked) {
        ctx.font      = `bold 15px system-ui, sans-serif`;
        ctx.fillStyle = COLORS.locked;
        ctx.shadowColor = "rgba(0,0,0,0.6)";
        ctx.shadowBlur  = 6;
        ctx.fillText("✓  LOCKED — Modifications Active", cw / 2, y + h + 20);
        ctx.shadowBlur  = 0;
      } else {
        const pct = Math.round(alignScore * 100);
        ctx.font      = "bold 13px system-ui, sans-serif";
        ctx.fillStyle = alignScore > 0.28 ? COLORS.partial : "rgba(255,255,255,0.75)";
        ctx.shadowColor = "rgba(0,0,0,0.7)";
        ctx.shadowBlur  = 5;
        ctx.fillText(
          alignScore > 0.28
            ? `Aligning… ${pct}%  —  Hold steady`
            : "Position your car inside the outline",
          cw / 2, y + h + 20,
        );

        // View label
        ctx.font      = "600 11px system-ui, sans-serif";
        ctx.fillStyle = "rgba(255,255,255,0.55)";
        ctx.fillText(
          `${viewLabel(selectedView).toUpperCase()} VIEW`,
          cw / 2, y - 16,
        );
        ctx.shadowBlur = 0;
      }

      rafId = requestAnimationFrame(draw);
    };

    rafId = requestAnimationFrame(draw);
    const ro = new ResizeObserver(() => {});
    ro.observe(container);
    return () => { cancelAnimationFrame(rafId); ro.disconnect(); };
  }, [containerRef, selectedView, alignScore, isLocked]);

  return (
    <Box
      component="canvas"
      ref={canvasRef}
      sx={{
        position:      "absolute",
        inset:          0,
        width:          "100%",
        height:         "100%",
        pointerEvents:  "none",
        zIndex:         5,
      }}
    />
  );
}

// ── Drawing helpers ───────────────────────────────────────────────────────────

function viewLabel(view) {
  return { front: "Front", left: "Left Side", right: "Right Side", rear: "Rear" }[view] ?? view;
}

function drawCorners(ctx, x, y, w, h, col, arm) {
  ctx.strokeStyle = col;
  ctx.lineWidth   = 3;
  ctx.setLineDash([]);
  ctx.beginPath();
  // Top-left
  ctx.moveTo(x, y + arm); ctx.lineTo(x, y); ctx.lineTo(x + arm, y);
  // Top-right
  ctx.moveTo(x + w - arm, y); ctx.lineTo(x + w, y); ctx.lineTo(x + w, y + arm);
  // Bottom-right
  ctx.moveTo(x + w, y + h - arm); ctx.lineTo(x + w, y + h); ctx.lineTo(x + w - arm, y + h);
  // Bottom-left
  ctx.moveTo(x + arm, y + h); ctx.lineTo(x, y + h); ctx.lineTo(x, y + h - arm);
  ctx.stroke();
}

/**
 * Draws a view-appropriate car silhouette path.
 * All coordinates are in normalised [0,1] then scaled to (x, y, w, h).
 */
function drawSilhouettePath(ctx, view, x, y, w, h) {
  const isRight = view === "right";
  const mapX = (nx) => isRight ? 1 - nx : nx;
  const p = (nx, ny) => [x + mapX(nx) * w, y + ny * h];

  const m  = (nx, ny) => ctx.moveTo(...p(nx, ny));
  const l  = (nx, ny) => ctx.lineTo(...p(nx, ny));
  const bz = (c1x, c1y, c2x, c2y, ex, ey) =>
    ctx.bezierCurveTo(...p(c1x, c1y), ...p(c2x, c2y), ...p(ex, ey));

  ctx.beginPath();

  if (view === "front" || view === "rear") {
    // Shared front/rear silhouette — symmetric trapezoidal car face
    m(0.30, 0.13);
    bz(0.30, 0.06, 0.70, 0.06, 0.70, 0.13);  // roof arc
    l(0.86, 0.38);                               // A-pillar right
    bz(0.92, 0.48, 0.95, 0.58, 0.95, 0.65);   // shoulder
    l(0.95, 0.80);                               // body right
    bz(0.95, 0.90, 0.88, 0.94, 0.78, 0.94);   // bumper corner right
    l(0.22, 0.94);                               // bumper bottom
    bz(0.12, 0.94, 0.05, 0.90, 0.05, 0.80);   // bumper corner left
    l(0.05, 0.65);                               // body left
    bz(0.05, 0.58, 0.08, 0.48, 0.14, 0.38);   // shoulder left
    ctx.closePath();

  } else {
    // Left / right side profile
    m(0.28, 0.20);
    bz(0.32, 0.14, 0.44, 0.12, 0.54, 0.12);  // roof front section
    bz(0.64, 0.12, 0.73, 0.15, 0.76, 0.21);  // roof rear section
    l(0.84, 0.36);                              // C-pillar
    bz(0.89, 0.44, 0.92, 0.52, 0.92, 0.57);  // rear deck
    l(0.93, 0.64);                              // rear body
    // Rear wheel arch
    bz(0.93, 0.70, 0.90, 0.73, 0.86, 0.73);
    bz(0.83, 0.73, 0.72, 0.68, 0.72, 0.63);
    bz(0.72, 0.58, 0.80, 0.54, 0.83, 0.57);  // arch inner top
    // Floor between arches
    l(0.26, 0.57);
    // Front wheel arch
    bz(0.29, 0.54, 0.37, 0.58, 0.37, 0.63);
    bz(0.37, 0.68, 0.26, 0.73, 0.23, 0.73);
    bz(0.19, 0.73, 0.16, 0.70, 0.16, 0.64);
    l(0.16, 0.56);                              // front body
    bz(0.16, 0.44, 0.20, 0.30, 0.28, 0.20);  // bonnet/hood slope
    ctx.closePath();
  }
}

/**
 * Draws blueprint grid details inside the template.
 */
function drawBlueprintDetails(ctx, view, x, y, w, h) {
  const isRight = view === "right";
  const mapX = (nx) => isRight ? 1 - nx : nx;
  const p = (nx, ny) => [x + mapX(nx) * w, y + ny * h];

  const m  = (nx, ny) => ctx.moveTo(...p(nx, ny));
  const l  = (nx, ny) => ctx.lineTo(...p(nx, ny));

  ctx.beginPath();

  if (view === "front" || view === "rear") {
    // Windshield outline
    m(0.32, 0.38); l(0.68, 0.38); l(0.63, 0.16); l(0.37, 0.16); ctx.closePath();

    // Hood / Trunk shutline
    m(0.14, 0.44); l(0.86, 0.44);

    // Grille / bumper outline
    m(0.20, 0.65); l(0.80, 0.65);
    m(0.20, 0.78); l(0.80, 0.78);

    // Headlight / Taillight guides
    m(0.12, 0.48); l(0.24, 0.48); l(0.22, 0.58); l(0.14, 0.58); ctx.closePath();
    m(0.88, 0.48); l(0.76, 0.48); l(0.78, 0.58); l(0.86, 0.58); ctx.closePath();
  } else {
    // Side profile details
    // Cabin window outline
    m(0.29, 0.44); l(0.50, 0.44); l(0.50, 0.16); l(0.34, 0.18); ctx.closePath();
    m(0.52, 0.44); l(0.74, 0.44); l(0.72, 0.20); l(0.52, 0.16); ctx.closePath();

    // Side character line (middle of the doors)
    m(0.18, 0.50); l(0.88, 0.50);

    // Door shutline (vertical division)
    m(0.50, 0.16); l(0.50, 0.73);

    // Front door shutline
    m(0.29, 0.44); l(0.29, 0.73);
    
    // Rear door shutline
    m(0.74, 0.44); l(0.74, 0.65);
  }

  ctx.stroke();
}
