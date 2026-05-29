"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  checkPartsModelAvailable,
  detectPartsInVideoFrame,
} from "../lib/yoloCarParts";

function isMobileDevice() {
  if (typeof navigator === "undefined") return false;
  return /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
}

const FRAME_SKIP_DESKTOP = 3;
const FRAME_SKIP_MOBILE  = 8;
const CLEAR_AFTER_MISSES = 5;

/**
 * Runs the custom YOLOv8 car-parts detector in a RAF loop.
 * Returns { parts, partsMode, partsFps }.
 *
 * parts     — array of detections or null
 * partsMode — "loading" | "parts" | "unavailable"
 * partsFps  — inference calls per second
 */
export default function useYoloCarParts(videoRef, isCameraActive) {
  const [parts,     setParts]     = useState(null);
  const [partsMode, setPartsMode] = useState("loading");
  const [partsFps,  setPartsFps]  = useState(0);

  const rafRef         = useRef(null);
  const frameSkipRef   = useRef(0);
  const frameCountRef  = useRef(0);
  const lastFpsTickRef = useRef(0);
  const inferringRef   = useRef(false);
  const missedRef      = useRef(0);

  useEffect(() => {
    let cancelled = false;
    checkPartsModelAvailable().then((ok) => {
      if (cancelled) return;
      setPartsMode(ok ? "parts" : "unavailable");
    });
    return () => { cancelled = true; };
  }, []);

  const runDetection = useCallback(async () => {
    const video = videoRef.current;
    if (!video?.videoWidth || inferringRef.current) return;
    inferringRef.current = true;

    try {
      const result = await detectPartsInVideoFrame(video);
      if (result) {
        missedRef.current = 0;
        setParts(result);
      } else {
        missedRef.current += 1;
        if (missedRef.current >= CLEAR_AFTER_MISSES) setParts(null);
      }
    } catch (err) {
      console.error("[AR Parts]", err);
      setParts(null);
    } finally {
      inferringRef.current = false;
    }
  }, [videoRef]);

  useEffect(() => {
    if (!isCameraActive || partsMode !== "parts") {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      setParts(null);
      missedRef.current   = 0;
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

      runDetection();

      frameCountRef.current += 1;
      const now = performance.now();
      if (now - lastFpsTickRef.current >= 1000) {
        setPartsFps(frameCountRef.current);
        frameCountRef.current  = 0;
        lastFpsTickRef.current = now;
      }
    };

    rafRef.current = requestAnimationFrame(loop);
    return () => {
      running = false;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [isCameraActive, partsMode, runDetection]);

  return { parts, partsMode, partsFps };
}
