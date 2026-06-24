"use client";

import { useEffect, useRef, forwardRef, useImperativeHandle } from "react";
import * as THREE from "three";
import { Box } from "@mui/material";
import { mapVideoBBoxToDisplay } from "../lib/arCoordinates";
import { createDecalPlane, textureLoader, bboxCentroid } from "../lib/arDecalUtils";
import {
  loadGltf,
  applyPaintColor,
  enableShadows,
  fitToMaxDimension,
} from "../lib/loadArGltf";

const WHEEL_SLOTS = {

  "front-left": { x: -0.38, y: -0.22, z: 0.18 },
  "front-right": { x: 0.38, y: -0.22, z: 0.18 },
  "rear-left": { x: -0.38, y: -0.22, z: -0.18 },
  "rear-right": { x: 0.38, y: -0.22, z: -0.18 },
};

function slotKind(slotKey) {
  const k = (slotKey || "").toLowerCase();
  if (k.includes("spoiler") || k.includes("wing")) return "spoiler";
  if (k.includes("front") && k.includes("bumper")) return "front";
  if (k.includes("rear") || k.includes("back")) return "rear";
  if (k.includes("hood") || k.includes("bonnet")) return "hood";
  return "center";
}

function attachmentOffset(kind) {
  switch (kind) {
    case "spoiler":
      return new THREE.Vector3(0, 0.42, -0.22);
    case "front":
      return new THREE.Vector3(0, 0.05, 0.35);
    case "rear":
      return new THREE.Vector3(0, 0.08, -0.35);
    case "hood":
      return new THREE.Vector3(0, 0.28, 0.12);
    default:
      return new THREE.Vector3(0, 0.1, 0);
  }
}

/**
 * Phase 5: transparent Three.js layer — GLTF parts anchored to YOLO bbox.
 */
const ArThreeOverlay = forwardRef(function ArThreeOverlay(
  {
    containerRef,
    videoRef,
    bbox,
    arBuild = {},
    wheels = {},
    parts = null,
    paintColor,
    applyPaint = false,
  },
  ref
) {
  const mountRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const carAnchorRef = useRef(null);
  const loadedPartsRef = useRef(new Map());
  const decalCacheRef = useRef(new Map());

  // Dev decal mapping: attach to detected parts (from car-parts seg model).
  // Window stickers & racing stripes are placed in TEMPLATE mode (enabledAnchors), but we still use
  // car-part masks to align them to the real vehicle.
const DECAL_DEFS = [
    {
      key: "rear-window-sticker",
      className: "Back Glass",
      textureKey: "rear-window-sticker-1",
      width: 0.55,
      height: 0.25,
      zOffset: 0.02,
    },
    {
      key: "racing-strip-left",
      className: "Back Left Door",
      textureKey: "racing-stripL-1",
      width: 0.45,
      height: 0.08,
      zOffset: 0.01,
    },
    {
      key: "racing-strip-right",
      className: "Back Right Door",
      textureKey: "racing-stripeR-1",
      width: 0.45,
      height: 0.08,
      zOffset: 0.01,
    },
  ];

  const getTextureUrlByKey = (textureKey) => {
    // textures live in public/images/decals/
    return `/images/decals/${textureKey}.png`;
  };



  const rafRef = useRef(null);

  useImperativeHandle(ref, () => ({
    takeSnapshot: () => {
      if (!rendererRef.current) return null;
      rendererRef.current.render(sceneRef.current, cameraRef.current);
      return rendererRef.current.domElement.toDataURL("image/png");
    },
    getCanvas: () => rendererRef.current?.domElement ?? null,
  }));

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const carAnchor = new THREE.Group();
    carAnchorRef.current = carAnchor;
    scene.add(carAnchor);

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      preserveDrawingBuffer: true,
    });
    renderer.setClearColor(0x000000, 0);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const resize = () => {
      const w = container.clientWidth;
      const h = container.clientHeight;
      if (!w || !h) return;
      const aspect = w / h;
      const camera = new THREE.OrthographicCamera(-aspect, aspect, 1, -1, 0.1, 100);
      camera.position.z = 5;
      cameraRef.current = camera;
      renderer.setSize(w, h);
    };

    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(container);

    const ambient = new THREE.AmbientLight(0xffffff, 0.85);
    scene.add(ambient);
    const dir = new THREE.DirectionalLight(0xffffff, 0.9);
    dir.position.set(2, 4, 3);
    scene.add(dir);

    const animate = () => {
      rafRef.current = requestAnimationFrame(animate);
      if (sceneRef.current && cameraRef.current) {
        renderer.render(sceneRef.current, cameraRef.current);
      }
    };
    animate();

    return () => {
      cancelAnimationFrame(rafRef.current);
      ro.disconnect();
      loadedPartsRef.current.forEach((obj) => {
        carAnchor.remove(obj);
        obj.traverse((c) => {
          if (c.geometry) c.geometry.dispose();
          if (c.material) {
            const mats = Array.isArray(c.material) ? c.material : [c.material];
            mats.forEach((m) => m.dispose?.());
          }
        });
      });
      loadedPartsRef.current.clear();
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      sceneRef.current = null;
      cameraRef.current = null;
      rendererRef.current = null;
    };
  }, []);

  useEffect(() => {
    const carAnchor = carAnchorRef.current;
    const container = mountRef.current;
    const video = videoRef?.current;
    const camera = cameraRef.current;

    if (!carAnchor || !container || !bbox || !video?.videoWidth || !camera) {
      if (carAnchor) carAnchor.visible = false;
      return;
    }

    const cw = container.clientWidth;
    const ch = container.clientHeight;
    const rect = mapVideoBBoxToDisplay(
      bbox,
      video.videoWidth,
      video.videoHeight,
      cw,
      ch
    );

    if (!rect) {
      carAnchor.visible = false;
      return;
    }

    carAnchor.visible = true;

    const aspect = cw / ch;
    const cx = (rect.left + rect.width / 2) / cw;
    const cy = (rect.top + rect.height / 2) / ch;

    carAnchor.position.x = (cx - 0.5) * 2 * aspect;
    carAnchor.position.y = -(cy - 0.5) * 2;

    const scaleFactor = (rect.width / cw) * 1.1;
    carAnchor.scale.setScalar(Math.max(scaleFactor, 0.15));
  }, [bbox, containerRef, videoRef]);

  useEffect(() => {
    const carAnchor = carAnchorRef.current;
    if (!carAnchor || !bbox) return;

    // --- 1) Stickers/decals from per-part segmentation masks ---
    if (parts && parts.length) {
      // Create once: decal anchors are groups under carAnchor
      // keyed by decal key (rear-window-sticker, racing-strip-left, ...)
      for (const def of DECAL_DEFS) {
        const det = parts
          .filter((p) => p?.className === def.className)
          .sort((a, b) => (b?.score ?? 0) - (a?.score ?? 0))[0];

        if (!det) continue;

        const slotKey = def.key;
        let decalAnchor = loadedPartsRef.current.get(`decal:${slotKey}`);
        if (!decalAnchor) {
          decalAnchor = new THREE.Group();
          decalAnchor.userData = { kind: "decal", textureKey: def.textureKey };
          loadedPartsRef.current.set(`decal:${slotKey}`, decalAnchor);
          carAnchor.add(decalAnchor);
        }

        // Map detection bbox to display coordinates
        const videoW = videoRef?.current?.videoWidth;
        const videoH = videoRef?.current?.videoHeight;
        const containerEl = mountRef.current;
        if (videoW && videoH && containerEl) {
          const cw = containerEl.clientWidth;
          const ch = containerEl.clientHeight;
          const rect = mapVideoBBoxToDisplay(
            { x: det.x1, y: det.y1, width: det.x2 - det.x1, height: det.y2 - det.y1 },
            videoW,
            videoH,
            cw,
            ch
          );

          if (rect) {
            const aspect = cw / ch;
            const cx = (rect.left + rect.width / 2) / cw;
            const cy = (rect.top + rect.height / 2) / ch;

            decalAnchor.position.x = (cx - 0.5) * 2 * aspect;
            decalAnchor.position.y = -(cy - 0.5) * 2;
            decalAnchor.position.z = def.zOffset;

            const s = (rect.width / cw) * 1.15;
            decalAnchor.scale.set(s, s, s);
          }
        }

        // Update plane texture and approximate mask-based alpha (Option B MVP).
        // For now we create a per-dec'l alpha map by drawing the detection mask bbox onto a canvas.
        const existingPlane = decalAnchor.getObjectByName("plane");

        if (!existingPlane) {
              const plane = createDecalPlane({
            texture: textureLoader().load(getTextureUrlByKey(def.textureKey)),
            width: def.width,
            height: def.height,
          });

          // MVP: make decal clickable-ish look by enabling alpha, but clipping via mask is pending.
          // (Mask-based alpha blending will be implemented next.)

          plane.name = "plane";
          decalAnchor.add(plane);
        }
      }

      // Remove decals that no longer exist
      for (const [k, obj] of loadedPartsRef.current.entries()) {
        if (!k.startsWith("decal:")) continue;
        const decalKey = k.replace("decal:", "");
        const def = DECAL_DEFS.find((d) => d.key === decalKey);
        const stillVisible = def
          ? parts.some((p) => p?.className === def.className)
          : false;
        if (!stillVisible) {
          carAnchor.remove(obj);
          loadedPartsRef.current.delete(k);
        }
      }
    }

    // --- 2) 3D models from arBuild/wheels (still bbox-based for now) ---

    let cancelled = false;

    async function syncParts() {
      const wanted = new Map();


      for (const [slot, data] of Object.entries(arBuild)) {
        const url = typeof data === "string" ? data : data?.modelUrl;
        if (url) wanted.set(`part:${slot}`, { url, slot, type: "modular" });
      }

      for (const [pos, url] of Object.entries(wheels)) {
        if (url) wanted.set(`wheel:${pos}`, { url, slot: pos, type: "wheel" });
      }

      for (const [key, obj] of loadedPartsRef.current) {
        if (!wanted.has(key)) {
          carAnchor.remove(obj);
          loadedPartsRef.current.delete(key);
        }
      }

      for (const [key, spec] of wanted) {
        const existing = loadedPartsRef.current.get(key);
        if (existing?.userData?.modelUrl === spec.url) continue;

        if (existing) {
          carAnchor.remove(existing);
          loadedPartsRef.current.delete(key);
        }

        try {
          const model = await loadGltf(spec.url);
          if (cancelled) return;

          enableShadows(model);

          const anchor = new THREE.Group();
          if (spec.type === "wheel") {
            const off = WHEEL_SLOTS[spec.slot] || { x: 0, y: -0.2, z: 0 };
            anchor.position.set(off.x, off.y, off.z);
            fitToMaxDimension(model, 0.22);
            if (spec.slot.includes("left")) {
              model.rotation.y = Math.PI;
            }
          } else {
            const kind = slotKind(spec.slot);
            anchor.position.copy(attachmentOffset(kind));
            fitToMaxDimension(model, kind === "spoiler" ? 0.35 : 0.45);
          }

          if (applyPaint && paintColor) {
            applyPaintColor(model, paintColor);
          }

          anchor.add(model);
          anchor.userData = { modelUrl: spec.url };
          carAnchor.add(anchor);
          loadedPartsRef.current.set(key, anchor);
        } catch (err) {
          console.error("[AR Phase 5] GLTF load failed:", spec.url, err);
        }
      }
    }

    syncParts();
    return () => {
      cancelled = true;
    };
  }, [arBuild, wheels, bbox, paintColor, applyPaint, parts]);


  /** Re-tint all loaded meshes when body color changes */
  useEffect(() => {
    if (!applyPaint || !paintColor) return;
    loadedPartsRef.current.forEach((anchor) => {
      applyPaintColor(anchor, paintColor);
    });
  }, [paintColor, applyPaint, arBuild, wheels]);

  if (!bbox) return null;

  return (
    <Box
      ref={mountRef}
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
});

export default ArThreeOverlay;
