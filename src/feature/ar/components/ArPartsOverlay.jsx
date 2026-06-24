"use client";

import { useEffect, useRef } from "react";
import { Box } from "@mui/material";

/**
 * Renders per-part pixel-accurate masks from the YOLOv8-seg parts model.
 *
 * Performance design:
 *   - partsRef + selectedPartRef updated via separate tiny useEffects.
 *   - Main RAF loop never restarts on new detections.
 *   - Dirty-flag: the pixel compositing (expensive) only runs when parts data
 *     or selected part actually changes — not on every 60fps frame.
 *   - RAF loop otherwise just redraws the cached composited canvas image.
 */
export default function ArPartsOverlay({ containerRef, videoRef, parts, selectedPart }) {
  const canvasRef       = useRef(null);
  const partsRef        = useRef(parts);
  const selectedPartRef = useRef(selectedPart);

  useEffect(() => { partsRef.current = parts; },             [parts]);
  useEffect(() => { selectedPartRef.current = selectedPart; }, [selectedPart]);

  useEffect(() => {
    const canvas    = canvasRef.current;
    const container = containerRef?.current;
    const video     = videoRef?.current;
    if (!canvas || !container || !video) return;

    // object-fit:cover coordinate mapping
    const getGeometry = (vw, vh, cw, ch) => {
      const va = vw / vh, ca = cw / ch;
      let renderW, renderH, offX = 0, offY = 0;
      if (va > ca) { renderH = ch; renderW = ch * va; offX = (cw - renderW) / 2; }
      else         { renderW = cw; renderH = cw / va; offY = (ch - renderH) / 2; }
      return { renderW, renderH, offX, offY };
    };

    const hexToRgb = (hex) => {
      const h = hex.replace("#", "");
      return [parseInt(h.slice(0,2),16), parseInt(h.slice(2,4),16), parseInt(h.slice(4,6),16)];
    };

    const SELECTED_RGB = [37, 99, 235]; // #2563eb — blue for selected part

    // Video-resolution compositing buffers (lazy-init, reused every frame)
    let overlayCanvas = null, overlayCtx = null;
    let pixelBuf = null, imgData = null;
    let bufVw = 0, bufVh = 0;

    // Dirty-flag: only recompose when parts or selectedPart actually changes
    let lastParts = null, lastSelected = null;

    const drawFrame = () => {
      const cw = container.clientWidth;
      const ch = container.clientHeight;
      if (!cw || !ch) return;

      if (canvas.width !== cw || canvas.height !== ch) {
        canvas.width = cw; canvas.height = ch;
      }
      const ctx = canvas.getContext("2d");

      const partsList = partsRef.current;
      const selected  = selectedPartRef.current;
      const vw = video.videoWidth, vh = video.videoHeight;

      if (!partsList?.length || !vw || !vh) {
        ctx.clearRect(0, 0, cw, ch);
        return;
      }

      // Re-allocate video-res buffers when dimensions change
      if (vw !== bufVw || vh !== bufVh) {
        overlayCanvas = document.createElement("canvas");
        overlayCanvas.width = vw; overlayCanvas.height = vh;
        overlayCtx = overlayCanvas.getContext("2d");
        pixelBuf   = new Uint8ClampedArray(vw * vh * 4);
        imgData    = new ImageData(pixelBuf, vw, vh);
        bufVw = vw; bufVh = vh;
        lastParts = null; // force recompose after resize
      }

      // Only recompose when data changes — not every 60fps frame
      if (partsList !== lastParts || selected !== lastSelected) {
        lastParts   = partsList;
        lastSelected = selected;
        pixelBuf.fill(0);

        const total  = vw * vh;
        const filter = selected; // null = show all

        for (const part of partsList) {
          if (filter && part.className !== filter) continue;
          if (!part.mask) continue;

          const isSelected = Boolean(filter);
          const col  = isSelected ? SELECTED_RGB : hexToRgb(part.color);
          const maxA = isSelected ? 0.85 : 0.55; // selected parts more opaque

          for (let i = 0; i < total; i++) {
            const mOp = part.mask[i];
            if (mOp === 0) continue;
            const a = Math.round((mOp / 255) * maxA * 255);
            if (a > pixelBuf[i * 4 + 3]) {
              pixelBuf[i * 4]     = col[0];
              pixelBuf[i * 4 + 1] = col[1];
              pixelBuf[i * 4 + 2] = col[2];
              pixelBuf[i * 4 + 3] = a;
            }
          }
        }

        overlayCtx.putImageData(imgData, 0, 0);
      }

      // Draw composited mask with object-fit:cover transform
      ctx.clearRect(0, 0, cw, ch);
      const { renderW, renderH, offX, offY } = getGeometry(vw, vh, cw, ch);
      ctx.drawImage(overlayCanvas, offX, offY, renderW, renderH);

      // Label pills positioned at bbox corners (still useful for identification)
      const sx = renderW / vw, sy = renderH / vh;
      ctx.font = "bold 11px system-ui, sans-serif";
      for (const part of partsList) {
        if (selected && part.className !== selected) continue;
        const isSelected = Boolean(selected);
        const col = isSelected ? "#2563eb" : part.color;
        const x   = offX + part.x1 * sx;
        const y   = offY + part.y1 * sy;
        const label = `${part.className}  ${Math.round(part.score * 100)}%`;
        const tw = ctx.measureText(label).width;
        const ph = 17, pw = tw + 10;
        const lx = Math.max(0, Math.min(x, cw - pw));
        const ly = y > ph + 2 ? y - ph - 2 : y + 2;
        ctx.fillStyle = col;
        ctx.fillRect(lx, ly, pw, ph);
        ctx.fillStyle = "#fff";
        ctx.fillText(label, lx + 5, ly + 12);
      }
    };

    let rafId;
    const loop = () => { drawFrame(); rafId = requestAnimationFrame(loop); };
    rafId = requestAnimationFrame(loop);
    const ro = new ResizeObserver(() => drawFrame());
    ro.observe(container);
    return () => { cancelAnimationFrame(rafId); ro.disconnect(); };
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
        zIndex: 4,
      }}
    />
  );
}
