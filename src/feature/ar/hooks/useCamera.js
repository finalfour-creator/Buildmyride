"use client";

import { useCallback, useEffect, useRef, useState } from "react";

function isMobileDevice() {
  if (typeof navigator === "undefined") return false;
  return /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
}

function isLocalHost() {
  if (typeof window === "undefined") return false;
  const host = window.location.hostname;
  return host === "localhost" || host === "127.0.0.1";
}

function getCameraErrorMessage(err) {
  const name = err?.name || "";
  const msg = err?.message || "";

  if (name === "NotAllowedError") {
    return "Camera permission denied. In Safari/Chrome: Settings → allow camera for this site, then reload.";
  }
  if (name === "NotFoundError" || name === "DevicesNotFoundError") {
    return "No camera found on this device.";
  }
  if (name === "NotReadableError" || name === "TrackStartError") {
    return "Camera is busy. Close other apps using the camera (Zoom, Instagram), then try again.";
  }
  if (name === "OverconstrainedError" || name === "ConstraintNotSatisfiedError") {
    return "Could not open the rear camera with these settings. We tried simpler options — tap Start camera again.";
  }
  if (name === "SecurityError" || name === "NotSupportedError") {
    return "Camera blocked. On phones you must use HTTPS (not http://192.168.x.x). Use a secure URL or test on desktop localhost.";
  }
  if (msg.includes("play()") || name === "AbortError") {
    return "Could not start video playback. Tap Start camera again.";
  }
  return msg || "Could not start camera.";
}

/** Try progressively simpler constraints (fixes most Android / iOS failures). */
function getMediaConstraintAttempts() {
  if (isMobileDevice()) {
    return [
      { video: { facingMode: { ideal: "environment" } }, audio: false },
      { video: { facingMode: "environment" }, audio: false },
      { video: { facingMode: { ideal: "user" } }, audio: false },
      { video: true, audio: false },
    ];
  }
  return [
    {
      video: {
        facingMode: { ideal: "environment" },
        width: { ideal: 1280 },
        height: { ideal: 720 },
      },
      audio: false,
    },
    {
      video: {
        facingMode: { ideal: "user" },
        width: { ideal: 1280 },
        height: { ideal: 720 },
      },
      audio: false,
    },
    { video: { facingMode: { ideal: "environment" } }, audio: false },
    { video: true, audio: false },
  ];
}

async function acquireCameraStream() {
  const attempts = getMediaConstraintAttempts();
  let lastError;

  for (const constraints of attempts) {
    try {
      return await navigator.mediaDevices.getUserMedia(constraints);
    } catch (err) {
      lastError = err;
      if (err.name === "NotAllowedError" || err.name === "SecurityError") {
        throw err;
      }
    }
  }

  throw lastError || new Error("Could not access camera");
}

async function waitForVideoElement(videoRef) {
  for (let i = 0; i < 10; i++) {
    if (videoRef.current) return videoRef.current;
    await new Promise((r) => requestAnimationFrame(r));
  }
  return null;
}

/**
 * Phase 2: live camera for AR Preview (mobile-safe).
 */
export default function useCamera() {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState(null);

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setStatus("idle");
  }, []);

  const startCamera = useCallback(async () => {
    setError(null);
    setStatus("starting");

    if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia) {
      setError("Camera is not supported in this browser.");
      setStatus("error");
      return;
    }

    if (!window.isSecureContext && !isLocalHost()) {
      setError(
        "On mobile, the camera requires HTTPS. Opening http://192.168.x.x will not work. Use https:// on your server, or test on a computer at localhost:3000."
      );
      setStatus("error");
      return;
    }

    try {
      stopCamera();

      const video = await waitForVideoElement(videoRef);
      if (!video) {
        setError("Video is not ready. Wait a moment and tap Start camera again.");
        setStatus("error");
        return;
      }

      const stream = await acquireCameraStream();
      streamRef.current = stream;

      video.srcObject = stream;
      video.muted = true;
      video.defaultMuted = true;
      video.setAttribute("playsinline", "true");
      video.setAttribute("webkit-playsinline", "true");
      video.playsInline = true;

      await video.play();

      if (video.videoWidth === 0) {
        await new Promise((resolve) => {
          video.onloadedmetadata = () => resolve();
          setTimeout(resolve, 500);
        });
      }

      setStatus("active");
    } catch (err) {
      console.error("[AR Camera]", err);
      setError(getCameraErrorMessage(err));
      setStatus("error");
      stopCamera();
    }
  }, [stopCamera]);

  useEffect(() => () => stopCamera(), [stopCamera]);

  return {
    videoRef,
    status,
    error,
    startCamera,
    stopCamera,
    isActive: status === "active",
    isStarting: status === "starting",
    isMobile: isMobileDevice(),
  };
}
