"use client";

import { useEffect, useRef, forwardRef, useImperativeHandle } from "react";
import * as THREE from "three";
import { Box } from "@mui/material";
import { mapVideoBBoxToDisplay } from "../lib/arCoordinates";
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
  const paintShellRef = useRef(null);
  const loadedPartsRef = useRef(new Map());
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
      if (paintShellRef.current) {
        paintShellRef.current.geometry?.dispose();
        paintShellRef.current.material?.dispose();
        paintShellRef.current = null;
      }
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

  /** Body paint: semi-transparent 3D shell over the detected car (not the live video pixels). */
  useEffect(() => {
    const carAnchor = carAnchorRef.current;
    if (!carAnchor || !bbox) {
      if (paintShellRef.current) paintShellRef.current.visible = false;
      return;
    }

    if (!paintShellRef.current) {
      const geometry = new THREE.PlaneGeometry(1.05, 0.58);
      const material = new THREE.MeshBasicMaterial({
        color: paintColor || "#ffffff",
        transparent: true,
        opacity: 0.38,
        depthWrite: false,
        side: THREE.DoubleSide,
      });
      const shell = new THREE.Mesh(geometry, material);
      shell.renderOrder = 0;
      paintShellRef.current = shell;
      carAnchor.add(shell);
    } else {
      paintShellRef.current.material.color.set(paintColor || "#ffffff");
      paintShellRef.current.visible = true;
    }
  }, [bbox, paintColor]);

  useEffect(() => {
    const carAnchor = carAnchorRef.current;
    if (!carAnchor || !bbox) return;

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

          if (paintColor) {
            applyPaintColor(model, paintColor);
          }

          anchor.add(model);
          anchor.userData = { modelUrl: spec.url };
          anchor.renderOrder = 1;
          carAnchor.add(anchor);
          loadedPartsRef.current.set(key, anchor);
          console.log("[AR] 3D part attached:", spec.type, spec.slot, spec.url);
        } catch (err) {
          console.error("[AR] GLTF load failed — check URL/CORS:", spec.url, err);
        }
      }
    }

    syncParts();
    return () => {
      cancelled = true;
    };
  }, [arBuild, wheels, bbox, paintColor, applyPaint]);

  /** Re-tint loaded GLTF parts when color changes */
  useEffect(() => {
    if (!paintColor) return;
    loadedPartsRef.current.forEach((anchor) => {
      applyPaintColor(anchor, paintColor);
    });
  }, [paintColor, arBuild, wheels]);

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
