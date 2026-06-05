"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { Box } from "@mui/material";
import { ANCHOR_CONFIG, getTemplateBox, anchorToWorld } from "../lib/arTemplateConfig";
import { loadGltf, enableShadows, fitToMaxDimension, applyPaintColor } from "../lib/loadArGltf";
import { mapVideoBBoxToDisplay } from "../lib/arCoordinates";

const textureLoader = new THREE.TextureLoader();

function loadTexture(url) {
  return new Promise((resolve, reject) => {
    textureLoader.load(url, resolve, undefined, reject);
  });
}

/**
 * Shape-Aware Snap & Fallback Overlay.
 *
 * Automatically locks modifications onto specific detected car parts (glass, hood, doors, wheels).
 * If a specific part is not detected, it falls back to the overall car box coordinates.
 * This guarantees that selected assets are always visible and attached to the car.
 */
export default function ArAnchoredModels({
  containerRef,
  videoRef,
  selectedView,
  isLocked,
  enabledAnchors,
  paintColor,
  overlayBox, // Always null now, fallback container computed from default template
  parts,      // Real-time detected parts list
}) {
  const mountRef      = useRef(null);
  const stateRef      = useRef({
    scene: null, camera: null, renderer: null,
    loadedModels: new Map(),   // anchorKey → THREE.Group
    rafId: null,
  });

  // Box cache to prevent flickering on detection frame skips
  const lastKnownPartBoxesRef = useRef(new Map()); // anchorKey -> displayBox

  // Clear tracking cache when view angle changes
  useEffect(() => {
    lastKnownPartBoxesRef.current.clear();
  }, [selectedView]);

  // ── Scene / renderer bootstrap (once) ───────────────────────────────────
  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;
    const s = stateRef.current;

    s.scene    = new THREE.Scene();
    s.renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, preserveDrawingBuffer: true });
    s.renderer.setClearColor(0x000000, 0);
    s.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    s.renderer.shadowMap.enabled = true;
    mount.appendChild(s.renderer.domElement);

    // Lighting — clean, bright directionals
    const ambient = new THREE.AmbientLight(0xffffff, 0.85);
    const key     = new THREE.DirectionalLight(0xfff4e0, 1.20);
    key.position.set(3, 5, 4);
    const fill    = new THREE.DirectionalLight(0xd0e8ff, 0.50);
    fill.position.set(-3, 2, -2);
    s.scene.add(ambient, key, fill);

    const syncCamera = () => {
      const w = mount.clientWidth, h = mount.clientHeight;
      if (!w || !h) return;
      const aspect = w / h;
      s.camera = new THREE.OrthographicCamera(-aspect, aspect, 1, -1, 0.01, 50);
      s.camera.position.z = 10;
      s.renderer.setSize(w, h);
    };
    syncCamera();
    const ro = new ResizeObserver(syncCamera);
    ro.observe(mount);

    const animate = () => {
      s.rafId = requestAnimationFrame(animate);
      if (s.scene && s.camera) s.renderer.render(s.scene, s.camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(s.rafId);
      ro.disconnect();
      disposeAll(s);
      if (mount.contains(s.renderer.domElement)) mount.removeChild(s.renderer.domElement);
      s.scene = null; s.camera = null; s.renderer = null;
    };
  }, []);

  // ── Sync models and decals when view / selected parts / detection frames change ──
  useEffect(() => {
    const s         = stateRef.current;
    const container = containerRef?.current;
    if (!s.scene || !container) return;

    const cw = container.clientWidth, ch = container.clientHeight;
    if (!cw || !ch) return;

    if (!selectedView) {
      hideAll(s);
      return;
    }

    const anchors   = ANCHOR_CONFIG[selectedView] ?? {};
    const tb        = overlayBox || getTemplateBox(selectedView, cw, ch);
    const wanted    = new Set(enabledAnchors ?? Object.keys(anchors));
    let cancelled   = false;

    const video     = videoRef?.current;
    const vw        = video?.videoWidth || 0;
    const vh        = video?.videoHeight || 0;
    const cameraAspect = cw / ch;

    async function syncModels() {
      // Remove anchors no longer wanted
      for (const [key, group] of s.loadedModels) {
        if (!wanted.has(key) || !anchors[key]) {
          s.scene.remove(group);
          disposeGroup(group);
          s.loadedModels.delete(key);
        }
      }

      // Load / position wanted anchors
      for (const key of wanted) {
        const cfg = anchors[key];
        if (!cfg) continue;
        if (!cfg.model && !cfg.texture) continue;

        // Query real-time detected part bounds
        const partBox = (vw && vh) ? findDetectedPartBox(key, parts, selectedView, vw, vh, cw, ch) : null;
        if (partBox) {
          lastKnownPartBoxesRef.current.set(key, partBox);
        }

        const activePartBox = partBox || lastKnownPartBoxesRef.current.get(key);
        let wx, wy, wz;
        let scaleRefBox = tb;

        let nx = cfg.nx;
        let ny = cfg.ny;

        if (activePartBox) {
          const refBox = {
            x: activePartBox.left,
            y: activePartBox.top,
            w: activePartBox.width,
            h: activePartBox.height,
            cx: activePartBox.left + activePartBox.width / 2,
            cy: activePartBox.top + activePartBox.height / 2,
          };

          // IMPORTANT: keep depth anchored to the template (avoid drifting below car).
          // We do NOT apply any per-anchor z-bias here.

          nx = 0.5;
          ny = 0.5;

          if (key === "racing_stripe") {
            ny = 0.92; // Racing stripe at extreme bottom of the doors
          } else if (key === "spoiler") {
            ny = 0.10; // Spoiler sits exactly on the upper edge of the trunk
          } else if (key === "side_graphic") {
            nx = selectedView === "left" ? 0.44 : 0.56;
            ny = 0.58;
          }

          [wx, wy, wz] = anchorToWorld(nx, ny, cfg.wz, refBox, cw, ch);
          scaleRefBox = refBox;
        } else {
          // Fallback to coordinates relative to general car box
          [wx, wy, wz] = anchorToWorld(cfg.nx, cfg.ny, cfg.wz, tb, cw, ch);
        }

        const existing = s.loadedModels.get(key);

        if (existing) {
          existing.position.set(wx, wy, wz);
          
          if (key === "racing_stripe") {
            // Use consistent proportional sizing from the detected door bbox.
            // This prevents the stripe from drifting outside the door area.
            const widthWorld = (scaleRefBox.w / cw) * 2 * cameraAspect;
            const heightWorldRaw = (scaleRefBox.h / ch) * 2;

            // Clamp thickness to a small fraction of door bbox height.
            const heightWorld = Math.min(heightWorldRaw * 0.22, heightWorldRaw * 0.26);

            // Clamp stripe width to door bbox width (allow tiny overdraw).
            const clampedWidthWorld = Math.min(widthWorld * 1.05, widthWorld);

            existing.scale.set(
              clampedWidthWorld / (cfg.aspect || 1.0),
              heightWorld,
              1.0
            );
          } else if (key === "side_graphic") {
            const heightWorld = (scaleRefBox.h / ch) * 2 * 0.58; // large decal
            existing.scale.set(heightWorld, heightWorld, 1.0);
          } else {
            // Scale wheel/model to match detected part bbox size closely.
            // Use detected bbox (w/h) so wheel size matches the segmentation mask extent.
            // “Scale grows then shrinks” happens because we recompute anchor boxes; clamp to a sensible range
            // and slightly bias toward box height so the wheel fully covers the detected wheel region.
            // Match the wheel size to the detected wheel bbox extent.
            // Avoid max+clamp artifacts; derive a scale from both bbox W/H.
            const wheelScaleW = (scaleRefBox.w / cw) * 2; // world units relative to template
            const wheelScaleH = (scaleRefBox.h / ch) * 2;
            const wheelScale = Math.min(wheelScaleW, wheelScaleH) * 2.2;
            const clamped = Math.max(0.25, Math.min(6.0, wheelScale));
            existing.scale.setScalar(clamped * cfg.scale);




          }
          existing.visible = true;
          continue;
        }

        try {
          const group = new THREE.Group();
          let loadedObject = null;

          if (cfg.model) {
            // Load 3D GLTF Model
            const gltf = await loadGltf(cfg.model);
            if (cancelled || !s.scene) return;

            enableShadows(gltf);
            fitToMaxDimension(gltf, 1.0); // Normalize boundary scale to 1.0

            if (cfg.rotation) gltf.rotation.set(...cfg.rotation);
            if (paintColor)   applyPaintColor(gltf, paintColor);

            group.userData = { anchorKey: key, type: "model" };
            loadedObject = gltf;
          } else if (cfg.texture) {
            // Load Decal PNG Texture
            const texture = await loadTexture(cfg.texture);
            if (cancelled || !s.scene) return;

            const aspect = cfg.aspect || 1.0;
            const geometry = new THREE.PlaneGeometry(aspect, 1.0);
            
            const material = new THREE.MeshStandardMaterial({
              map: texture,
              transparent: true,
              side: THREE.DoubleSide,
              roughness: 0.3,
              metalness: 0.1,
              depthWrite: false, // Prevent depth buffer flicker
              polygonOffset: true, // Prevent z-fighting
              polygonOffsetFactor: -1,
              polygonOffsetUnits: -1,
            });

            const mesh = new THREE.Mesh(geometry, material);
            if (cfg.rotation) mesh.rotation.set(...cfg.rotation);

            group.userData = { anchorKey: key, type: "decal" };
            loadedObject = mesh;
          }

          if (loadedObject) {
            group.add(loadedObject);
            group.position.set(wx, wy, wz);
            
            if (key === "racing_stripe") {
              const widthWorld = (scaleRefBox.w / cw) * 2 * cameraAspect;
              const heightWorld = (scaleRefBox.h / ch) * 2 * 0.15;
              group.scale.set(widthWorld / (cfg.aspect || 1.0), heightWorld, 1.0);
            } else if (key === "side_graphic") {
              const heightWorld = (scaleRefBox.h / ch) * 2 * 0.58;
              group.scale.set(heightWorld, heightWorld, 1.0);
            } else {
              const templateHeightWorld = (scaleRefBox.h / ch) * 2;
              group.scale.setScalar(templateHeightWorld * cfg.scale);
            }
            group.visible = true;

            s.scene.add(group);
            s.loadedModels.set(key, group);
          }
        } catch (err) {
          console.warn(`[ArAnchoredModels] Failed to load asset for ${key}:`, err.message);
        }
      }

      // Reposition and scale existing items based on latest frame detections
      for (const [key, group] of s.loadedModels) {
        const cfg = anchors[key];
        if (!cfg) continue;

        const partBox = (vw && vh) ? findDetectedPartBox(key, parts, selectedView, vw, vh, cw, ch) : null;
        if (partBox) {
          lastKnownPartBoxesRef.current.set(key, partBox);
        }

        const activePartBox = partBox || lastKnownPartBoxesRef.current.get(key);
        let wx, wy, wz;
        let scaleRefBox = tb;

        if (activePartBox) {
          const refBox = {
            x: activePartBox.left,
            y: activePartBox.top,
            w: activePartBox.width,
            h: activePartBox.height,
            cx: activePartBox.left + activePartBox.width / 2,
            cy: activePartBox.top + activePartBox.height / 2,
          };
          
          let nx = 0.5, ny = 0.5;
          if (key === "racing_stripe") {
            ny = 0.92;
          } else if (key === "spoiler") {
            ny = 0.10;
          } else if (key === "side_graphic") {
            nx = selectedView === "left" ? 0.44 : 0.56;
            ny = 0.58;
          }

          // Wheel sizing anchor: keep wheels strictly aligned to their own
          // segmentation bbox; stripe/graphics remain door-relative.


          [wx, wy, wz] = anchorToWorld(nx, ny, cfg.wz, refBox, cw, ch);
          scaleRefBox = refBox;
        } else {
          [wx, wy, wz] = anchorToWorld(cfg.nx, cfg.ny, cfg.wz, tb, cw, ch);
        }

        group.position.set(wx, wy, wz);

          if (key === "racing_stripe") {
            // Keep stripe always inside door bounds.
            const widthWorld = (scaleRefBox.w / cw) * 2 * cameraAspect;
            const heightWorldRaw = (scaleRefBox.h / ch) * 2;
            const heightWorld = Math.min(heightWorldRaw * 0.22, heightWorldRaw * 0.26);
            const clampedWidthWorld = Math.min(widthWorld * 1.05, widthWorld);
            group.scale.set(
              clampedWidthWorld / (cfg.aspect || 1.0),
              heightWorld,
              1.0
            );
          } else if (key === "side_graphic") {
            const heightWorld = (scaleRefBox.h / ch) * 2 * 0.58;
            group.scale.set(heightWorld, heightWorld, 1.0);
          } else {
            const templateHeightWorld = (scaleRefBox.h / ch) * 2;
            group.scale.setScalar(templateHeightWorld * cfg.scale);
          }
        group.visible = true;
      }
    }

    syncModels();
    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedView, isLocked, enabledAnchors, containerRef, overlayBox, parts, videoRef]);

  // ── Re-tint models when paint color changes (skips decals) ───────────────
  useEffect(() => {
    // Re-tint models when paint color changes (including when switching enabled anchors)
    if (!paintColor) return;
    const s = stateRef.current;
    for (const [key, group] of s.loadedModels.entries()) {
      if (group.userData?.type === "decal") continue;
      applyPaintColor(group, paintColor);
    }
  }, [paintColor]);

  return (
    <Box
      ref={mountRef}
      sx={{
        position:     "absolute",
        inset:         0,
        width:         "100%",
        height:        "100%",
        pointerEvents: "none",
        zIndex:        4,
        opacity:       1.0, // Always fully visible
      }}
    />
  );
}

// ── Shape-Aware Detections Mapper ──────────────────────────────────────────

function findDetectedPartBox(key, parts, selectedView, vw, vh, cw, ch) {
  if (!parts || parts.length === 0) return null;

  // 1. Wheel alignment (return one box per requested wheel anchor)
  // - key contains "wheel_front" or "wheel_rear"
  // - we still use part segmentation detections, but now we pick the best match
  //   for the requested front/rear by sorting wheels by X.
  if (key.includes("wheel")) {
    const wheelDetections = (parts || []).filter((p) => p.className === "Wheel");
    if (wheelDetections.length === 0) return null;

    const mappedWheels = wheelDetections
      .map((det) => {
        const box = mapVideoBBoxToDisplay(
          { x: det.x1, y: det.y1, width: det.x2 - det.x1, height: det.y2 - det.y1 },
          vw,
          vh,
          cw,
          ch
        );
        return { ...box, cx: box.left + box.width / 2, cy: box.top + box.height / 2, score: det.score || 0 };
      })
      .filter((b) => Number.isFinite(b.left) && Number.isFinite(b.top));

    if (mappedWheels.length === 1) return mappedWheels[0];

    // Sort left to right in screen space.
    // For side views, front wheel and rear wheel should appear as two clusters.
    mappedWheels.sort((a, b) => a.left - b.left);

    const wantsFront = key.includes("front");

    // If we only detected ONE wheel, still return a distinct box for the requested
    // front/rear by mirroring across the wheel cluster center.
    // This fixes the “second wheel missing” issue when YOLO sees only one side.
    if (mappedWheels.length === 1) {
      const only = mappedWheels[0];
      const dx = only.width * 1.05; // slightly larger to separate the mirrored wheel
      // For side views:
      // - left view: front wheel is more-left on screen
      // - right view: front wheel is more-right on screen
      const frontIsLeft = selectedView === "left";
      // wantsFront=true => choose side of front for that view, otherwise the opposite.
      const mirrorSign = wantsFront
        ? (frontIsLeft ? -1 : 1)
        : (frontIsLeft ? 1 : -1);

      // Ensure the mirrored wheel bbox stays inside the visible container bounds.
      const newLeft = only.left + dx * mirrorSign;
      const clampedLeft = Math.max(0, Math.min(cw - only.width, newLeft));
      const newCx = clampedLeft + only.width / 2;

      return {
        ...only,
        left: clampedLeft,
        width: only.width,
        cx: newCx,
      };

    }

    // Sort left to right in screen space.
    // For side views, front and rear should become two extremes.
    // left view: front tends to be more left on screen
    // right view: front tends to be more right on screen
    if (selectedView === "left") {
      return wantsFront ? mappedWheels[0] : mappedWheels[mappedWheels.length - 1];
    }
    if (selectedView === "right") {
      return wantsFront ? mappedWheels[mappedWheels.length - 1] : mappedWheels[0];
    }

    // Default: pick best by score among the two extremes.
    const extreme = wantsFront
      ? [mappedWheels[0], mappedWheels[mappedWheels.length - 1]]
      : [mappedWheels[0], mappedWheels[mappedWheels.length - 1]];
    extreme.sort((a, b) => (b.score || 0) - (a.score || 0));
    return extreme[0];

  }


  // 2. Door decals / stripes (spanning multiple doors)
  if (key === "racing_stripe" || key === "side_graphic") {
    const doorClasses = selectedView === "left"
      ? ["Front Left Door", "Back Left Door"]
      : ["Front Right Door", "Back Right Door"];
    
    const doorDetections = parts.filter(p => doorClasses.includes(p.className));
    if (doorDetections.length === 0) return null;

    const mappedDoors = doorDetections.map(det =>
      mapVideoBBoxToDisplay(
        { x: det.x1, y: det.y1, width: det.x2 - det.x1, height: det.y2 - det.y1 },
        vw, vh, cw, ch
      )
    );

    return combineBBoxes(mappedDoors);
  }

  // 3. Static anchors matching specific detected parts
  const PART_CLASSES_MAPPED = {
    hood: ["Hood"],
    hood_decal: ["Hood"],
    front_bumper: ["Front Bumper"],
    headlight_left: ["Front Left Light"],
    headlight_right: ["Front Right Light"],
    name_plate: ["Front Bumper"],

    spoiler: ["Trunk", "Tailgate"],
    trunk: ["Trunk", "Tailgate"],
    rear_bumper: ["Back Bumper"],
    taillight_left: ["Back Left Light"],
    taillight_right: ["Back Right Light"],
    window_sticker_1: ["Back Glass"],
    window_sticker_2: ["Back Glass"],

    door_front: selectedView === "left" ? ["Front Left Door"] : ["Front Right Door"],
    door_rear: selectedView === "left" ? ["Back Left Door"] : ["Back Right Door"],
  };

  const targetClasses = PART_CLASSES_MAPPED[key];
  if (!targetClasses) return null;

  const matches = parts.filter(p => targetClasses.includes(p.className));
  if (matches.length === 0) return null;

  // Take the highest scoring match
  const best = matches.sort((a, b) => b.score - a.score)[0];
  return mapVideoBBoxToDisplay(
    { x: best.x1, y: best.y1, width: best.x2 - best.x1, height: best.y2 - best.y1 },
    vw, vh, cw, ch
  );
}

function combineBBoxes(boxes) {
  if (!boxes || boxes.length === 0) return null;
  let left = Infinity, top = Infinity, right = -Infinity, bottom = -Infinity;
  for (const b of boxes) {
    if (b.left < left) left = b.left;
    if (b.top < top) top = b.top;
    if (b.left + b.width > right) right = b.left + b.width;
    if (b.top + b.height > bottom) bottom = b.top + b.height;
  }
  return { left, top, width: right - left, height: bottom - top };
}

// ── Utilities ────────────────────────────────────────────────────────────────

function hideAll(s) {
  for (const group of s.loadedModels.values()) group.visible = false;
}

function disposeGroup(group) {
  group.traverse((c) => {
    c.geometry?.dispose();
    const mats = Array.isArray(c.material) ? c.material : [c.material];
    mats.forEach((m) => m?.dispose?.());
  });
}

function disposeAll(s) {
  for (const group of s.loadedModels.values()) {
    s.scene?.remove(group);
    disposeGroup(group);
  }
  s.loadedModels.clear();
  s.renderer?.dispose();
}
