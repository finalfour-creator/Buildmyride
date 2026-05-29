"use client";

import { useEffect, useRef } from "react";
import { Box } from "@mui/material";

/**
 * Renders the YOLOv8-seg car mask as either:
 *   • a pixel-accurate green detection fill  (paintColor == null)
 *   • a luminance-preserving paint overlay   (paintColor is a hex string)
 *
 * Performance design:
 *   - carMask and paintColor are read from refs inside the RAF loop, so the
 *     loop never restarts when a new mask arrives — eliminating the 1-2 frame
 *     blank gap that caused the "detected → vanished" flicker.
 *   - Video pixels are only read (getImageData) in paint mode; green mode skips
 *     the expensive GPU→CPU transfer entirely.
 *   - Per-frame buffers (frameCanvas, resultCanvas, pixelBuf, ImageData) are
 *     lazy-initialised and reused — no allocation or GC during steady-state.
 *   - Paint colour hex is parsed only when the value actually changes.
 */
export default function ArSegmentationOverlay({
  containerRef,
  videoRef,
  carMask,
  paintColor,
}) {
  const canvasRef      = useRef(null);
  const rafRef         = useRef(null);
  const carMaskRef     = useRef(carMask);
  const paintColorRef  = useRef(paintColor);

  // Keep refs in sync without restarting the RAF loop
  useEffect(() => { carMaskRef.current = carMask; },    [carMask]);
  useEffect(() => { paintColorRef.current = paintColor; }, [paintColor]);

  // ── Main RAF loop — deps are stable refs so this runs exactly once ──────
  useEffect(() => {
    const canvas    = canvasRef.current;
    const container = containerRef?.current;
    const video     = videoRef?.current;
    if (!canvas || !container || !video) return;

    // Lazy-initialised per-frame buffers (created on first frame with a valid mask)
    let frameCanvas = null, frameCtx = null;
    let resultCanvas = null, resultCtx = null;
    let pixelBuf = null, imgData = null;
    let bufVw = 0, bufVh = 0;

    // Cached paint-colour parse so we don't parseInt every frame
    let lastPaintColor = undefined;
    let pr = 0, pg = 0, pb = 0;

    // object-fit:cover geometry (mirrors ArDetectionOverlay logic)
    const getGeometry = (vw, vh, cw, ch) => {
      const videoAspect     = vw / vh;
      const containerAspect = cw / ch;
      let renderWidth, renderHeight, offsetX = 0, offsetY = 0;
      if (videoAspect > containerAspect) {
        renderHeight = ch;
        renderWidth  = ch * videoAspect;
        offsetX      = (cw - renderWidth) / 2;
      } else {
        renderWidth  = cw;
        renderHeight = cw / videoAspect;
        offsetY      = (ch - renderHeight) / 2;
      }
      return { renderWidth, renderHeight, offsetX, offsetY };
    };

    const drawFrame = () => {
      const cw = container.clientWidth;
      const ch = container.clientHeight;
      if (!cw || !ch) return;

      const vw = video.videoWidth;
      const vh = video.videoHeight;

      // Resize display canvas to container
      if (canvas.width !== cw || canvas.height !== ch) {
        canvas.width  = cw;
        canvas.height = ch;
      }
      const ctx = canvas.getContext("2d");

      // Read latest values from refs (no effect restart needed)
      const carMask   = carMaskRef.current;
      const paintColor = paintColorRef.current;

      if (!carMask || !vw || !vh) {
        ctx.clearRect(0, 0, cw, ch);
        return;
      }

      // Re-allocate shared buffers only when video dimensions change
      if (vw !== bufVw || vh !== bufVh) {
        frameCanvas = document.createElement("canvas");
        frameCanvas.width  = vw;
        frameCanvas.height = vh;
        frameCtx = frameCanvas.getContext("2d", { willReadFrequently: true });

        resultCanvas = document.createElement("canvas");
        resultCanvas.width  = vw;
        resultCanvas.height = vh;
        resultCtx = resultCanvas.getContext("2d");

        pixelBuf = new Uint8ClampedArray(vw * vh * 4);
        imgData  = new ImageData(pixelBuf, vw, vh); // shares buffer — no copy
        bufVw = vw;
        bufVh = vh;
      }

      // Parse paint colour only when it actually changes
      const hasPaint = Boolean(paintColor);
      if (paintColor !== lastPaintColor) {
        lastPaintColor = paintColor;
        if (paintColor) {
          const hex = paintColor.replace("#", "").padEnd(6, "0");
          pr = parseInt(hex.slice(0, 2), 16);
          pg = parseInt(hex.slice(2, 4), 16);
          pb = parseInt(hex.slice(4, 6), 16);
        }
      }

      // Read live video pixels only in paint mode (saves 8 MB GPU→CPU per frame)
      let framePixels = null;
      if (hasPaint) {
        frameCtx.drawImage(video, 0, 0, vw, vh);
        framePixels = frameCtx.getImageData(0, 0, vw, vh).data;
      }

      // ── Per-pixel compositing ──────────────────────────────────────────────
      const total = vw * vh;
      for (let i = 0; i < total; i++) {
        const maskOpacity = carMask[i]; // 0–255

        if (maskOpacity === 0) {
          pixelBuf[i * 4 + 3] = 0;
          continue;
        }

        const pi = i * 4;

        if (!hasPaint) {
          // Green detection mode — flat semi-transparent fill, no video read
          pixelBuf[pi]     = 0;
          pixelBuf[pi + 1] = 210;
          pixelBuf[pi + 2] = 90;
          pixelBuf[pi + 3] = Math.round(maskOpacity * 0.55);
          continue;
        }

        // Paint mode — luminance-preserving colour overlay (ITU-R BT.601)
        const r0 = framePixels[pi];
        const g0 = framePixels[pi + 1];
        const b0 = framePixels[pi + 2];

        const lum    = (0.299 * r0 + 0.587 * g0 + 0.114 * b0) / 255;
        const lScale = Math.min(2.0, lum * 1.8 + 0.05);
        const rP = Math.min(255, Math.round(pr * lScale));
        const gP = Math.min(255, Math.round(pg * lScale));
        const bP = Math.min(255, Math.round(pb * lScale));

        const t = maskOpacity / 255;
        pixelBuf[pi]     = Math.round(rP * t + r0 * (1 - t));
        pixelBuf[pi + 1] = Math.round(gP * t + g0 * (1 - t));
        pixelBuf[pi + 2] = Math.round(bP * t + b0 * (1 - t));
        pixelBuf[pi + 3] = maskOpacity;
      }

      // imgData.data IS pixelBuf (shared buffer) — putImageData writes it directly
      resultCtx.putImageData(imgData, 0, 0);

      ctx.clearRect(0, 0, cw, ch);
      const { renderWidth, renderHeight, offsetX, offsetY } = getGeometry(vw, vh, cw, ch);
      ctx.drawImage(resultCanvas, offsetX, offsetY, renderWidth, renderHeight);
    };

    const loop = () => {
      drawFrame();
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);

    const ro = new ResizeObserver(() => drawFrame());
    ro.observe(container);

    return () => {
      cancelAnimationFrame(rafRef.current);
      ro.disconnect();
    };
  }, [containerRef, videoRef]); // stable refs — loop starts once, never restarts

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
        zIndex: 1,
      }}
    />
  );
}
