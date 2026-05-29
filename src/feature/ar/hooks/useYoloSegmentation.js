"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  checkSegModelAvailable,
  segmentCarInVideoFrame,
} from "../lib/yoloCarSegmentation";

function isMobileDevice() {
  if (typeof navigator === "undefined") return false;
  return /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
}

// Frames to skip between inference calls (GPU execution makes this affordable)
const FRAME_SKIP_DESKTOP = 2;
const FRAME_SKIP_MOBILE  = 6;

// Consecutive missed detections before clearing the mask.
// 8 misses at skip=2 ≈ 0.5s at 30fps — survives angle changes without flicker.
const CLEAR_AFTER_MISSES = 8;

/**
 * YOLOv8-seg segmentation hook — runs alongside useYoloDetection.
 * Returns an ImageData overlay at video resolution that can be drawn onto a canvas.
 *
 * @param {React.RefObject<HTMLVideoElement>} videoRef
 * @param {boolean} isCameraActive
 */
export default function useYoloSegmentation(videoRef, isCameraActive) {
  const [carMask, setCarMask] = useState(null);
  // "loading" → "seg" (model found) | "unavailable" (model not found)
  const [segMode, setSegMode] = useState("loading");
  const [segFps, setSegFps]   = useState(0);

  const rafRef         = useRef(null);
  const frameSkipRef   = useRef(0);
  const frameCountRef  = useRef(0);
  const lastFpsTickRef = useRef(0);
  const inferringRef   = useRef(false);
  const missedRef      = useRef(0);

  // Check once whether the model file exists in /public/models/
  useEffect(() => {
    let cancelled = false;
    checkSegModelAvailable().then((ok) => {
      if (cancelled) return;
      setSegMode(ok ? "seg" : "unavailable");
    });
    return () => { cancelled = true; };
  }, []);

  const runSegmentation = useCallback(async () => {
    const video = videoRef.current;
    if (!video?.videoWidth || inferringRef.current) return;

    inferringRef.current = true;

    try {
      const result = await segmentCarInVideoFrame(video);

      if (result) {
        missedRef.current = 0;
        setCarMask(result.carMask);
      } else {
        missedRef.current += 1;
        if (missedRef.current >= CLEAR_AFTER_MISSES) {
          setCarMask(null);
        }
      }
    } catch (err) {
      console.error("[AR Seg]", err);
      setCarMask(null);
    } finally {
      inferringRef.current = false;
    }
  }, [videoRef]);

  useEffect(() => {
    if (!isCameraActive || segMode !== "seg") {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      setCarMask(null);
      missedRef.current = 0;
      frameSkipRef.current = 0;
      return;
    }

    let running = true;
    const skip = isMobileDevice() ? FRAME_SKIP_MOBILE : FRAME_SKIP_DESKTOP;

    const loop = () => {
      if (!running) return;
      rafRef.current = requestAnimationFrame(loop);

      frameSkipRef.current += 1;
      if (frameSkipRef.current % skip !== 0) return;

      runSegmentation();

      // FPS counter (counts dispatched inference calls per second)
      frameCountRef.current += 1;
      const now = performance.now();
      if (now - lastFpsTickRef.current >= 1000) {
        setSegFps(frameCountRef.current);
        frameCountRef.current = 0;
        lastFpsTickRef.current = now;
      }
    };

    rafRef.current = requestAnimationFrame(loop);

    return () => {
      running = false;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [isCameraActive, segMode, runSegmentation]);

  return { carMask, segMode, segFps };
}
