"use client";

import { useEffect, useRef } from "react";
import { Box } from "@mui/material";
import { mapVideoBBoxToDisplay } from "../lib/arCoordinates";

/**
 * Phase 4: debug canvas — draws car bounding box over the video (object-fit: cover).
 */
export default function ArDetectionOverlay({ containerRef, videoRef, bbox, detectionMode }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef?.current;
    const video = videoRef?.current;

    if (!canvas || !container || !bbox || !video?.videoWidth) return;

    const draw = () => {
      const cw = container.clientWidth;
      const ch = container.clientHeight;
      if (!cw || !ch) return;

      canvas.width = cw;
      canvas.height = ch;
      const ctx = canvas.getContext("2d");
      ctx.clearRect(0, 0, cw, ch);

      const rect = mapVideoBBoxToDisplay(
        bbox,
        video.videoWidth,
        video.videoHeight,
        cw,
        ch
      );
      if (!rect) return;

      const isDemo = detectionMode === "demo" || bbox.source === "demo";
      ctx.strokeStyle = isDemo ? "#ffca28" : "#4caf50";
      ctx.lineWidth = 3;
      ctx.setLineDash(isDemo ? [8, 6] : []);
      ctx.strokeRect(rect.left, rect.top, rect.width, rect.height);

      ctx.fillStyle = isDemo ? "rgba(255, 202, 40, 0.15)" : "rgba(76, 175, 80, 0.12)";
      ctx.fillRect(rect.left, rect.top, rect.width, rect.height);

      const label = isDemo
        ? "DEMO"
        : `CAR ${Math.round((bbox.confidence || 0) * 100)}%`;
      ctx.font = "600 12px system-ui, sans-serif";
      const tw = ctx.measureText(label).width;
      ctx.fillStyle = isDemo ? "#ffca28" : "#4caf50";
      ctx.fillRect(rect.left, rect.top - 22, tw + 12, 20);
      ctx.fillStyle = "#0f2027";
      ctx.fillText(label, rect.left + 6, rect.top - 8);
    };

    draw();

    const ro = new ResizeObserver(draw);
    ro.observe(container);
    return () => ro.disconnect();
  }, [bbox, containerRef, videoRef, detectionMode]);

  if (!bbox) return null;

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
        zIndex: 2,
      }}
    />
  );
}
