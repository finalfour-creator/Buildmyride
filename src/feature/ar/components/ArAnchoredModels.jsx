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

// Store original material colours before first paint so we can restore them.
function storeOriginalColors(object) {
  object.traverse((node) => {
    if (!node.isMesh || !node.material) return;
    const mats = Array.isArray(node.material) ? node.material : [node.material];
    mats.forEach((m) => {
      if (m.color && !m.userData?._origColor) {
        if (!m.userData) m.userData = {};
        m.userData._origColor = "#" + m.color.getHexString();
      }
    });
  });
}

function restoreOriginalColors(object) {
  object.traverse((node) => {
    if (!node.isMesh || !node.material) return;
    const mats = Array.isArray(node.material) ? node.material : [node.material];
    mats.forEach((m) => {
      const orig = m.userData?._origColor;
      if (orig && m.color) m.color.set(orig);
    });
  });
}

/**
 * Shape-Aware Snap & Fallback Overlay.
 *
 * Automatically locks modifications onto specific detected car parts.
 * Falls back to the overall car box when a part is not detected.
 */
export default function ArAnchoredModels({
  containerRef,
  videoRef,
  selectedView,
  isLocked,
  enabledAnchors,
  paintColor,
  overlayBox,
  parts,
  partColors = {}, // { hood: "#hex"|null, front_bumper: "#hex"|null, rear_bumper: "#hex"|null }
}) {
  const mountRef = useRef(null);
  const stateRef = useRef({
    scene: null, camera: null, renderer: null,
    loadedModels: new Map(),
    loadingModels: new Set(),
    rafId: null,
  });

  const lastKnownPartBoxesRef = useRef(new Map());

  // Always-current refs so async model-loading closures never read stale values
  const partColorsRef = useRef(partColors);
  const paintColorRef  = useRef(paintColor);
  useEffect(() => { partColorsRef.current = partColors; }, [partColors]);
  useEffect(() => { paintColorRef.current  = paintColor;  }, [paintColor]);

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

  // ── Sync models / decals when view / anchors / detections change ──────────
  useEffect(() => {
    const s         = stateRef.current;
    const container = containerRef?.current;
    if (!s.scene || !container) return;

    const cw = container.clientWidth, ch = container.clientHeight;
    if (!cw || !ch) return;

    if (!selectedView) { hideAll(s); return; }

    const anchors      = ANCHOR_CONFIG[selectedView] ?? {};
    const tb           = overlayBox || getTemplateBox(selectedView, cw, ch);
    const wanted       = new Set(enabledAnchors ?? Object.keys(anchors));
    const cameraAspect = cw / ch;
    let   cancelled    = false;

    const video = videoRef?.current;
    const vw    = video?.videoWidth  || 0;
    const vh    = video?.videoHeight || 0;

    // Helper: re-apply part / body colour to an already-loaded model group.
    // Called on every detection frame so colours are always current.
    function applyCurrentColor(key, group) {
      if (group.userData?.type !== "model") return;
      const child = group.children[0];
      if (!child) return;
      const partColor = partColorsRef.current?.[key];
      const bodyColor = paintColorRef.current;
      if (partColor)      applyPaintColor(child, partColor);
      else if (bodyColor) applyPaintColor(child, bodyColor);
    }

    // Helper: compute scale for a given key + ref box
    function computeScale(key, cfg, refBox, group) {
      if (key === "racing_stripe") {
        // Clamp stripe so it stays inside the detected door region(s).
        // - refBox is either the combined doors bbox or the single detected door bbox.
        // - We derive stripe width/height strictly from refBox size.
        const refWWorld = (refBox.w / cw) * 2 * cameraAspect;
        const refHWorld = (refBox.h / ch) * 2;

        // Make thinner band.
        const stripeHeightWorld = refHWorld * 0.14;

        // Keep stripe width within refBox bounds (account for cfg.aspect plane geometry).
        group.scale.set(
          refWWorld / (cfg.aspect || 1.0),
          stripeHeightWorld,
          1.0
        );
      } else if (key === "side_graphic") {
        // Place/size on bottom half of rear door.
        const doorHeightWorld = (refBox.h / ch) * 2;
        const graphicHeightWorld = doorHeightWorld * 0.45; // bottom half-ish
        group.scale.set(graphicHeightWorld, graphicHeightWorld, 1.0);
      } else if (key.includes("wheel")) {

        // Wheel: match detected segmentation mask diameter exactly.
        // fitToMaxDimension normalises max dimension to 1 — so setScalar(diameter) fills the mask.
        const bboxDiam = Math.min(
          (refBox.w / cw) * 2 * cameraAspect,
          (refBox.h / ch) * 2
        );
        group.scale.setScalar(Math.max(0.10, Math.min(4.0, bboxDiam)));
      } else if (key === "spoiler") {
        // Spoiler spans the full trunk width — use width-based scale.
        const widthWorld = (refBox.w / cw) * 2 * cameraAspect;
        group.scale.setScalar(Math.max(0.15, Math.min(4.0, widthWorld * cfg.scale)));
      } else if (key.startsWith("window_sticker")) {
        // Window stickers: fill the detected glass width.
        const bboxWWorld = (refBox.w / cw) * 2 * cameraAspect;
        group.scale.setScalar(Math.max(0.05, (bboxWWorld / (cfg.aspect || 1.0)) * cfg.scale));
      } else {
        // Generic: scale by detected bbox height × config scale factor.
        const heightWorld = (refBox.h / ch) * 2;
        group.scale.setScalar(heightWorld * cfg.scale);
      }
    }

    function syncModels() {
      // Remove unwanted anchors
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
        if (!cfg || (!cfg.model && !cfg.texture)) continue;

        const partBox = (vw && vh)
          ? findDetectedPartBox(key, parts, selectedView, vw, vh, cw, ch)
          : null;
        if (partBox) lastKnownPartBoxesRef.current.set(key, partBox);

        const activePartBox = partBox || lastKnownPartBoxesRef.current.get(key);

        let nx = cfg.nx, ny = cfg.ny;
        let scaleRefBox = tb;

        if (activePartBox) {
          const refBox = {
            x:  activePartBox.left,
            y:  activePartBox.top,
            w:  activePartBox.width,
            h:  activePartBox.height,
            cx: activePartBox.left + activePartBox.width  / 2,
            cy: activePartBox.top  + activePartBox.height / 2,
          };
          nx = 0.5; ny = 0.5;
          if (key === "racing_stripe") {
            // bottom edge of the COMBINED door bbox
            ny = 0.98;
          } else if (key === "side_graphic") {
            // bottom half: keep anchor slightly above the absolute bottom edge
            ny = 0.78;
          } else if (key === "spoiler") {
            // sit higher/lower based on template — reduce drift
            ny = 0.07;
          }
          scaleRefBox = refBox;
        }

        // anchor position
        let wx, wy, wz;
        const anchorBox = scaleRefBox === tb ? tb : scaleRefBox;

        // For racing stripe, keep X snapped to template center, but clamp Y using refBox.
        if (key === "racing_stripe" && activePartBox) {
          const pxCenter = anchorBox.cx;
          wx = ((pxCenter / cw) * 2 - 1) * cameraAspect;

          const py = anchorBox.cy + (ny - 0.5) * anchorBox.h;
          wy = -(py / ch * 2 - 1);
          wz = cfg.wz;
        } else {
          [wx, wy, wz] = anchorToWorld(nx, ny, cfg.wz, anchorBox, cw, ch);
        }

        const existing = s.loadedModels.get(key);
        if (existing) {
          existing.position.set(wx, wy, wz);
          computeScale(key, cfg, scaleRefBox, existing);
          applyCurrentColor(key, existing); // always keep colours in sync
          existing.visible = true;
          continue;
        }

        // ── Load new asset ──────────────────────────────────────────────────
        if (s.loadingModels.has(key)) continue;
        s.loadingModels.add(key);

        (async () => {
          try {
            const group = new THREE.Group();
            let loadedObject = null;

            if (cfg.model) {
              const gltf = await loadGltf(cfg.model);
              if (!s.scene) return;

              enableShadows(gltf);
              fitToMaxDimension(gltf, 1.0);
              storeOriginalColors(gltf); // must come before any colour application
              if (cfg.rotation) gltf.rotation.set(...cfg.rotation);

              // Use refs so we always get the live colour even if this closure is stale
              const partColor  = partColorsRef.current?.[key];
              const bodyColor  = paintColorRef.current;
              if (partColor)      applyPaintColor(gltf, partColor);
              else if (bodyColor) applyPaintColor(gltf, bodyColor);

              group.userData = { anchorKey: key, type: "model" };
              loadedObject = gltf;
            } else if (cfg.texture) {
              const texture = await loadTexture(cfg.texture);
              if (!s.scene) return;

              const aspect   = cfg.aspect || 1.0;
              const geometry = new THREE.PlaneGeometry(aspect, 1.0);
              const material = new THREE.MeshStandardMaterial({
                map:     texture,
                transparent: true,
                side:    THREE.DoubleSide,
                roughness:   0.3,
                metalness:   0.1,
                depthWrite:  false,
                polygonOffset: true,
                polygonOffsetFactor: -1,
                polygonOffsetUnits:  -1,
              });
              const mesh = new THREE.Mesh(geometry, material);
              if (cfg.rotation) mesh.rotation.set(...cfg.rotation);

              group.userData = { anchorKey: key, type: "decal" };
              loadedObject = mesh;
            }

            if (loadedObject) {
              group.add(loadedObject);
              group.position.set(wx, wy, wz);
              computeScale(key, cfg, scaleRefBox, group);
              group.visible = true;
              s.scene.add(group);
              s.loadedModels.set(key, group);
            }
          } catch (err) {
            console.warn(`[ArAnchoredModels] Failed to load ${key}:`, err.message);
          } finally {
            s.loadingModels.delete(key);
          }
        })();
      }

      // ── Reposition every loaded model with the latest detection frame ──────
      for (const [key, group] of s.loadedModels) {
        const cfg = anchors[key];
        if (!cfg) continue;

        const partBox = (vw && vh)
          ? findDetectedPartBox(key, parts, selectedView, vw, vh, cw, ch)
          : null;
        if (partBox) lastKnownPartBoxesRef.current.set(key, partBox);

        const activePartBox = partBox || lastKnownPartBoxesRef.current.get(key);
        let nx = cfg.nx, ny = cfg.ny;
        let scaleRefBox = tb;

        if (activePartBox) {
          const refBox = {
            x:  activePartBox.left,
            y:  activePartBox.top,
            w:  activePartBox.width,
            h:  activePartBox.height,
            cx: activePartBox.left + activePartBox.width  / 2,
            cy: activePartBox.top  + activePartBox.height / 2,
          };
          nx = 0.5; ny = 0.5;
          if (key === "racing_stripe") {
            ny = 0.98;
          } else if (key === "side_graphic") {
            ny = 0.78;
          } else if (key === "spoiler") {
            ny = 0.07;
          }
          scaleRefBox = refBox;
        }


        const anchorBox2 = scaleRefBox === tb ? tb : scaleRefBox;
        let wx2, wy2, wz2;

        if (key === "racing_stripe" && activePartBox) {
          const pxCenter2 = anchorBox2.cx;
          wx2 = ((pxCenter2 / cw) * 2 - 1) * cameraAspect;
          const py2 = anchorBox2.cy + (ny - 0.5) * anchorBox2.h;
          wy2 = -(py2 / ch * 2 - 1);
          wz2 = cfg.wz;
        } else {
          [wx2, wy2, wz2] = anchorToWorld(nx, ny, cfg.wz, anchorBox2, cw, ch);
        }
        group.position.set(wx2, wy2, wz2);
        computeScale(key, cfg, scaleRefBox, group);
        applyCurrentColor(key, group); // keep colours in sync every frame
        group.visible = true;
      }
    }

    syncModels();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedView, isLocked, enabledAnchors, containerRef, overlayBox, parts, videoRef]);

  // ── Re-tint all models when global paint colour changes ───────────────────
  useEffect(() => {
    if (!paintColor) return;
    const s = stateRef.current;
    for (const [key, group] of s.loadedModels.entries()) {
      if (group.userData?.type === "decal") continue;
      if (partColors?.[key]) continue; // keep individual colour override
      applyPaintColor(group, paintColor);
    }
  }, [paintColor, partColors]);

  // ── Apply / restore individual part colours ───────────────────────────────
  useEffect(() => {
    const s = stateRef.current;
    if (!s.loadedModels) return;
    for (const [key, group] of s.loadedModels.entries()) {
      if (group.userData?.type !== "model") continue;
      const model = group.children[0];
      if (!model) continue;
      const partColor = partColors?.[key];
      if (partColor) {
        applyPaintColor(model, partColor);
      } else {
        restoreOriginalColors(model);
        if (paintColor) applyPaintColor(model, paintColor);
      }
    }
  }, [partColors, paintColor]);

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
        opacity:       1.0,
      }}
    />
  );
}

// ── Shape-Aware Detections Mapper ──────────────────────────────────────────

function findDetectedPartBox(key, parts, selectedView, vw, vh, cw, ch) {
  if (!parts || parts.length === 0) return null;

  // 1. Wheel detection — pick front/rear by screen-X position.
  if (key.includes("wheel")) {
    const wheelDetections = parts.filter((p) => p.className === "Wheel");
    if (wheelDetections.length === 0) return null;

    const mappedWheels = wheelDetections
      .map((det) => {
        const box = mapVideoBBoxToDisplay(
          { x: det.x1, y: det.y1, width: det.x2 - det.x1, height: det.y2 - det.y1 },
          vw, vh, cw, ch
        );
        return { ...box, cx: box.left + box.width / 2, cy: box.top + box.height / 2, score: det.score || 0 };
      })
      .filter((b) => Number.isFinite(b.left) && Number.isFinite(b.top));

    if (mappedWheels.length === 0) return null;

    // Sort left to right in screen space
    mappedWheels.sort((a, b) => a.left - b.left);

    const wantsFront = key.includes("front");

    // Single detection: mirror to produce the other wheel's position
    if (mappedWheels.length === 1) {
      const only        = mappedWheels[0];
      const dx          = only.width * 1.1;
      const frontIsLeft = selectedView === "left";
      const mirrorSign  = wantsFront
        ? (frontIsLeft ? -1 :  1)
        : (frontIsLeft ?  1 : -1);
      const newLeft     = only.left + dx * mirrorSign;
      const clampedLeft = Math.max(0, Math.min(cw - only.width, newLeft));
      return {
        ...only,
        left: clampedLeft,
        width: only.width,
        cx:   clampedLeft + only.width / 2,
      };
    }

    // Multiple detections: pick by view-correct position
    if (selectedView === "left") {
      return wantsFront ? mappedWheels[0] : mappedWheels[mappedWheels.length - 1];
    }
    if (selectedView === "right") {
      return wantsFront ? mappedWheels[mappedWheels.length - 1] : mappedWheels[0];
    }

    // Fallback: best score from the two extremes
    const candidates = [mappedWheels[0], mappedWheels[mappedWheels.length - 1]];
    candidates.sort((a, b) => (b.score || 0) - (a.score || 0));
    return candidates[0];
  }

  // 2. Racing stripe — spans the combined front + rear door bbox (full-length stripe)
  if (key === "racing_stripe") {
    const doorClasses = selectedView === "left"
      ? ["Front Left Door", "Back Left Door"]
      : ["Front Right Door", "Back Right Door"];
    const doorDetections = parts.filter((p) => doorClasses.includes(p.className));
    if (doorDetections.length === 0) return null;
    const mappedDoors = doorDetections.map((det) =>
      mapVideoBBoxToDisplay(
        { x: det.x1, y: det.y1, width: det.x2 - det.x1, height: det.y2 - det.y1 },
        vw, vh, cw, ch
      )
    );
    return combineBBoxes(mappedDoors);
  }

  // 2b. Side graphic — anchored to the rear door only
  if (key === "side_graphic") {
    const rearClass = selectedView === "left" ? "Back Left Door" : "Back Right Door";
    const rearDoor  = parts.filter((p) => p.className === rearClass)
                           .sort((a, b) => (b.score || 0) - (a.score || 0))[0];
    if (!rearDoor) return null;
    return mapVideoBBoxToDisplay(
      { x: rearDoor.x1, y: rearDoor.y1, width: rearDoor.x2 - rearDoor.x1, height: rearDoor.y2 - rearDoor.y1 },
      vw, vh, cw, ch
    );
  }

  // 2c. Mirrors (segmentation mask based)
  if (key === "left_mirror") {
    const det = parts.filter((p) => p.className === "Left Mirror")
      .sort((a, b) => (b.score || 0) - (a.score || 0))[0];
    if (!det) return null;
    return mapVideoBBoxToDisplay(
      { x: det.x1, y: det.y1, width: det.x2 - det.x1, height: det.y2 - det.y1 },
      vw, vh, cw, ch
    );
  }

  if (key === "right_mirror") {
    const det = parts.filter((p) => p.className === "Right Mirror")
      .sort((a, b) => (b.score || 0) - (a.score || 0))[0];
    if (!det) return null;
    return mapVideoBBoxToDisplay(
      { x: det.x1, y: det.y1, width: det.x2 - det.x1, height: det.y2 - det.y1 },
      vw, vh, cw, ch
    );
  }

  // 3. Static part classes
  const PART_CLASSES_MAPPED = {
    hood:            ["Hood"],
    hood_decal:      ["Hood"],
    front_bumper:    ["Front Bumper"],
    headlight_left:  ["Front Left Light"],
    headlight_right: ["Front Right Light"],
    name_plate:      ["Front Bumper"],

    spoiler:         ["Trunk", "Tailgate"],
    trunk:           ["Trunk", "Tailgate"],
    rear_bumper:     ["Back Bumper"],
    taillight_left:  ["Back Left Light"],
    taillight_right: ["Back Right Light"],
    window_sticker_1: ["Back Glass"],
    window_sticker_2: ["Back Glass"],

    door_front: selectedView === "left" ? ["Front Left Door"] : ["Front Right Door"],
    door_rear:  selectedView === "left" ? ["Back Left Door"]  : ["Back Right Door"],
  };

  const targetClasses = PART_CLASSES_MAPPED[key];
  if (!targetClasses) return null;

  const matches = parts.filter((p) => targetClasses.includes(p.className));
  if (matches.length === 0) return null;

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
    if (b.left < left)              left   = b.left;
    if (b.top  < top)               top    = b.top;
    if (b.left + b.width  > right)  right  = b.left + b.width;
    if (b.top  + b.height > bottom) bottom = b.top  + b.height;
  }
  return {
    left, top,
    width:  right  - left,
    height: bottom - top,
    cx: left + (right  - left) / 2,
    cy: top  + (bottom - top)  / 2,
    w:  right  - left,
    h:  bottom - top,
  };
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
