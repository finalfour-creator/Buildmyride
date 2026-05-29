"use client";

import { useEffect, useRef } from "react";
import { Box } from "@mui/material";

/**
 * Canvas overlay that draws labelled bounding boxes for each detected car part.
 * Uses the same object-fit:cover coordinate mapping as ArDetectionOverlay.
 * Parts array and video dimensions are read from refs so the RAF loop never
 * restarts when detections update.
 */
export default function ArPartsOverlay({ containerRef, videoRef, parts, selectedPart }) {
  const canvasRef       = useRef(null);
  const partsRef        = useRef(parts);
  const selectedPartRef = useRef(selectedPart);

  useEffect(() => { partsRef.current = parts; }, [parts]);
  useEffect(() => { selectedPartRef.current = selectedPart; }, [selectedPart]);

  useEffect(() => {
    const canvas    = canvasRef.current;
    const container = containerRef?.current;
    const video     = videoRef?.current;
    if (!canvas || !container || !video) return;

    const getGeometry = (vw, vh, cw, ch) => {
      const va = vw / vh, ca = cw / ch;
      let renderW, renderH, offX = 0, offY = 0;
      if (va > ca) {
        renderH = ch; renderW = ch * va; offX = (cw - renderW) / 2;
      } else {
        renderW = cw; renderH = cw / va; offY = (ch - renderH) / 2;
      }
      return { renderW, renderH, offX, offY };
    };

    const drawFrame = () => {
      const cw = container.clientWidth;
      const ch = container.clientHeight;
      if (!cw || !ch) return;

      if (canvas.width !== cw || canvas.height !== ch) {
        canvas.width  = cw;
        canvas.height = ch;
      }

      const ctx = canvas.getContext("2d");
      ctx.clearRect(0, 0, cw, ch);

      const partsList = partsRef.current;
      const vw = video.videoWidth;
      const vh = video.videoHeight;
      if (!partsList?.length || !vw || !vh) return;

      const { renderW, renderH, offX, offY } = getGeometry(vw, vh, cw, ch);
      const sx = renderW / vw;
      const sy = renderH / vh;

      const activeFilter = selectedPartRef.current; // null or part name string

      for (const part of partsList) {
        const x = offX + part.x1 * sx;
        const y = offY + part.y1 * sy;
        const w = (part.x2 - part.x1) * sx;
        const h = (part.y2 - part.y1) * sy;
        const col      = part.color;
        const isActive = !activeFilter || part.className === activeFilter;
        const alpha    = isActive ? 1 : 0.25; // dim unselected parts

        ctx.globalAlpha = alpha;

        // Fill — stronger when selected
        ctx.fillStyle = col + (isActive && activeFilter ? "50" : "20");
        ctx.fillRect(x, y, w, h);

        // Border
        ctx.strokeStyle = col;
        ctx.lineWidth   = isActive && activeFilter ? 3 : 1.5;
        ctx.strokeRect(x, y, w, h);

        // Corner accents
        const arm = Math.min(12, w * 0.2, h * 0.2);
        ctx.lineWidth = isActive && activeFilter ? 4 : 2.5;
        ctx.beginPath();
        ctx.moveTo(x, y + arm); ctx.lineTo(x, y); ctx.lineTo(x + arm, y);
        ctx.moveTo(x + w - arm, y); ctx.lineTo(x + w, y); ctx.lineTo(x + w, y + arm);
        ctx.moveTo(x + w, y + h - arm); ctx.lineTo(x + w, y + h); ctx.lineTo(x + w - arm, y + h);
        ctx.moveTo(x + arm, y + h); ctx.lineTo(x, y + h); ctx.lineTo(x, y + h - arm);
        ctx.stroke();

        // Label
        const label    = `${part.className}  ${Math.round(part.score * 100)}%`;
        const fontSize = 11;
        ctx.font = `bold ${fontSize}px system-ui, sans-serif`;
        const tw = ctx.measureText(label).width;
        const ph = fontSize + 6;
        const pw = tw + 10;
        const lx = Math.max(0, Math.min(x, cw - pw));
        const ly = y > ph + 2 ? y - ph - 2 : y + 2;

        ctx.fillStyle = col;
        ctx.fillRect(lx, ly, pw, ph);
        ctx.fillStyle = "#fff";
        ctx.fillText(label, lx + 5, ly + fontSize);

        ctx.globalAlpha = 1;
      }
    };

    let rafId;
    const loop = () => { drawFrame(); rafId = requestAnimationFrame(loop); };
    rafId = requestAnimationFrame(loop);

    const ro = new ResizeObserver(() => drawFrame());
    ro.observe(container);

    return () => {
      cancelAnimationFrame(rafId);
      ro.disconnect();
    };
  }, [containerRef, videoRef]);

  return (
    <Box
      component="canvas"
      ref={canvasRef}
      sx={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        zIndex: 4, // above seg overlay (1), detection overlay (2), Three.js (3)
      }}
    />
  );
}
