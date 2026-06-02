"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { getDemoBBox, lerpBBox } from "../lib/arCoordinates";
import {
  checkYoloModelAvailable,
  detectCarInVideoFrame,
} from "../lib/yoloCarDetection";

/** Consecutive frames without a car before clearing the box (YOLO mode) */
const NO_CAR_CLEAR_FRAMES = 2;

function isMobileDevice() {
  if (typeof navigator === "undefined") return false;
  return /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
}

/**
 * Phase 4: YOLOv8 car detection (ONNX) with demo bbox fallback.
 */
export default function useYoloDetection(videoRef, isCameraActive) {
  const [bbox, setBbox] = useState(null);
  const [detectionMode, setDetectionMode] = useState("loading");
  const [fps, setFps] = useState(0);
  const [statusMessage, setStatusMessage] = useState("Initializing detection…");
  const [isInferring, setIsInferring] = useState(false);

  const smoothedRef = useRef(null);
  const rafRef = useRef(null);
  const frameCountRef = useRef(0);
  const lastFpsTickRef = useRef(0);
  const noCarFramesRef = useRef(0);
  const inferringRef = useRef(false);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      if (isMobileDevice()) {
        const ok = await checkYoloModelAvailable();
        if (cancelled) return;
        if (ok) {
          setDetectionMode("yolo");
          setStatusMessage("YOLOv8 on mobile — point at a car (may be slower)");
        } else {
          setDetectionMode("demo");
          setStatusMessage("Demo detection — model file not found");
        }
        return;
      }

      const ok = await checkYoloModelAvailable();
      if (cancelled) return;
      if (ok) {
        setDetectionMode("yolo");
        setStatusMessage("YOLOv8 ready — point camera at a car");
      } else {
        setDetectionMode("demo");
        setStatusMessage(
          "Demo mode: add public/models/yolov8n.onnx for real YOLOv8 detection"
        );
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const runDetection = useCallback(async () => {
    const video = videoRef.current;
    if (!video?.videoWidth || inferringRef.current) return;

    inferringRef.current = true;
    setIsInferring(true);

    try {
      let raw = null;

      if (detectionMode === "yolo") {
      try {
        raw = await detectCarInVideoFrame(video);
      } catch (e) {
        console.error('[YOLO] detectCarInVideoFrame error:', e);
        raw = null;
      }
        if (!raw || raw.confidence < 0.35) {
          noCarFramesRef.current += 1;
        } else {
          noCarFramesRef.current = 0;
        }
      }

      if (detectionMode === "demo") {
        raw = getDemoBBox(video.videoWidth, video.videoHeight);
        setStatusMessage("Demo bbox — add yolov8n.onnx to enable YOLOv8");
      } else if (!raw) {
        setStatusMessage(
          noCarFramesRef.current >= NO_CAR_CLEAR_FRAMES
            ? "No car in view — point camera at a vehicle"
            : "Scanning for vehicle…"
        );
      } else if (raw.confidence < 0.4) {
        setStatusMessage("Low confidence — move to brighter light");
      } else {
        setStatusMessage(`Car detected (${Math.round(raw.confidence * 100)}%)`);
      }

      const hasValidDetection =
        raw && (detectionMode === "demo" || raw.confidence >= 0.35);

      if (hasValidDetection) {
        smoothedRef.current = lerpBBox(smoothedRef.current, raw, 0.3);
        setBbox({ ...smoothedRef.current });
      } else if (
        detectionMode === "yolo" &&
        noCarFramesRef.current >= NO_CAR_CLEAR_FRAMES
      ) {
        smoothedRef.current = null;
        setBbox(null);
      }
    } catch (err) {
      console.error("[AR YOLO]", err);
      setStatusMessage("Detection error — using demo fallback");
      setDetectionMode("demo");
      const video = videoRef.current;
      if (video?.videoWidth) {
        const demo = getDemoBBox(video.videoWidth, video.videoHeight);
        smoothedRef.current = lerpBBox(smoothedRef.current, demo, 0.3);
        setBbox({ ...smoothedRef.current });
      }
    } finally {
      inferringRef.current = false;
      setIsInferring(false);
    }
  }, [videoRef, detectionMode]);

  useEffect(() => {
    if (!isCameraActive || detectionMode === "loading") {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      setBbox(null);
      smoothedRef.current = null;
      noCarFramesRef.current = 0;
      return;
    }

    let running = true;
    let frameSkip = 0;

    const loop = () => {
      if (!running) return;
      rafRef.current = requestAnimationFrame(loop);

      frameSkip += 1;
      const mobile = isMobileDevice();
      const skip = detectionMode === "yolo" ? (mobile ? 12 : 4) : 2;
      if (frameSkip % skip !== 0) return;

      runDetection();

      frameCountRef.current += 1;
      const now = performance.now();
      if (now - lastFpsTickRef.current >= 1000) {
        setFps(frameCountRef.current);
        frameCountRef.current = 0;
        lastFpsTickRef.current = now;
      }
    };

    rafRef.current = requestAnimationFrame(loop);

    return () => {
      running = false;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [isCameraActive, detectionMode, runDetection]);

  return {
    bbox,
    detectionMode,
    fps,
    statusMessage,
    isInferring,
    isDetecting: isCameraActive && !!bbox,
  };
}
