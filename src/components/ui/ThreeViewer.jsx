"use client";
import { useEffect, useRef, useState, useCallback, useImperativeHandle, forwardRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { Box, Typography, CircularProgress } from "@mui/material";
import gsap from "gsap";

// ── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Determine if a mesh should receive body paint color.
 * Returns true for exterior body panels; false for windows, lights, interior, tyres, etc.
 */
function isBodyPaintMesh(meshName) {
  const n = (meshName || "").toLowerCase();

  // Exclude patterns: things that should NOT be painted
  const excludePatterns = [
    "glass", "window", "windshield", "windscreen",
    "light", "lamp", "headlight", "taillight", "fog", "indicator", "signal", "lens",
    "interior", "seat", "dashboard", "dash", "steering", "console", "pedal", "knob",
    "tyre", "tire", "wheel", "rim", "brake", "disc", "caliper",
    "chrome", "emblem", "logo", "badge", "plate", "number", "text",
    "mirror_glass", "wiper", "antenna", "grille", "grill", "mesh",
    "rubber", "seal", "trim", "molding", "plastic", "carbon",
    "exhaust", "pipe", "muffler", "tip",
    "underbody", "undercarriage", "chassis", "frame", "suspension", "engine", "radiator", "motor",
  ];

  for (const pattern of excludePatterns) {
    if (n.includes(pattern)) return false;
  }

  // Include patterns: things that SHOULD be painted (body panels)
  const includePatterns = [
    "body", "door", "hood", "bonnet", "fender", "bumper",
    "roof", "trunk", "boot", "panel", "quarter", "pillar",
    "skirt", "spoiler", "wing", "paint", "exterior", "shell",
  ];

  for (const pattern of includePatterns) {
    if (n.includes(pattern)) return true;
  }

  // If no pattern matched, we perform a "generic" check.
  // Many models use names like "Mesh_001". We allow these if they are large enough,
  // but for simplicity in this helper, we'll allow generic names if they weren't excluded.
  return true;
}

/**
 * Apply color to all paintable meshes within a THREE.Object3D.
 */
function applyColorToPaintableMeshes(object, color) {
  if (!object || !color) return;
  object.traverse((node) => {
    if (node.isMesh && node.material && isBodyPaintMesh(node.name)) {
      const mats = Array.isArray(node.material) ? node.material : [node.material];
      mats.forEach((m) => {
        if (m.color) {
          // If the material has a color property, set it.
          // Note: Some models use textures for color. Setting color might tint them.
          m.color.set(color);
        }
      });
    }
  });
}

/**
 * Classify a wheel mesh into a position id.
 * First tries to extract from the mesh name (FL, FR, BL, BR codes).
 * Falls back to world-space coordinate classification.
 */
function classifyWheelPosition(mesh) {
  const name = (mesh.name || "").toUpperCase();

  // Check for common position codes in the mesh name
  if (name.includes("_FL_") || name.includes("_FL") || name.startsWith("FL_")) return "front-left";
  if (name.includes("_FR_") || name.includes("_FR") || name.startsWith("FR_")) return "front-right";
  if (name.includes("_BL_") || name.includes("_BL") || name.startsWith("BL_")) return "rear-left";
  if (name.includes("_BR_") || name.includes("_BR") || name.startsWith("BR_")) return "rear-right";
  if (name.includes("_RL_") || name.includes("_RL") || name.startsWith("RL_")) return "rear-left";
  if (name.includes("_RR_") || name.includes("_RR") || name.startsWith("RR_")) return "rear-right";

  // Fallback: use world-space coordinates
  const wp = new THREE.Vector3();
  mesh.getWorldPosition(wp);
  const side = wp.x >= 0 ? "right" : "left";
  const end = wp.z >= 0 ? "front" : "rear";
  return `${end}-${side}`;
}

/**
 * Detect wheel meshes by traversing the GLTF scene.
 * Returns a Map<positionId, meshNode>.
 * Matches: wheel, tire, tyre, rim (case-insensitive).
 */
function discoverWheelMeshes(model) {
  const candidates = [];

  // Log ALL mesh names to help debug if pattern matching fails
  console.log("── All mesh names in model ──");
  model.traverse((node) => {
    if (node.isMesh) {
      console.log(`  mesh: "${node.name}"`);
    }
  });

  // Collect candidates — include "tyre" (British spelling) and anchor points
  model.traverse((node) => {
    if (node.isMesh || node.isGroup) {
      const n = (node.name || "").toLowerCase();
      const isWheelPart = n.includes("wheel") || n.includes("tire") || n.includes("tyre") || n.includes("rim");
      const isAnchor = (n.includes("pos_") || n.includes("anchor_")) &&
        (n.includes("fl") || n.includes("fr") || n.includes("bl") || n.includes("br") || n.includes("rl") || n.includes("rr"));

      if (isWheelPart || isAnchor) {
        candidates.push(node);
      }
    }
  });

  if (candidates.length === 0) {
    console.warn("No wheel markers found. Generating virtual anchors based on car size...");

    // Fallback: Generate 4 virtual anchors at the corners of the car
    const box = new THREE.Box3().setFromObject(model);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());

    // Approximate wheel positions (Relative to CENTER)
    const xOffset = size.x * 0.48; // Push wheels OUT towards the sides
    const zOffset = size.z * 0.32; // Move wheels OUT towards the front/back ends
    const yPos = box.min.y + (size.y * 0.15); // Slightly above bottom

    const virtualAnchors = new Map();
    const positions = [
      { id: "front-left", pos: [center.x - xOffset, yPos, center.z + zOffset] },
      { id: "front-right", pos: [center.x + xOffset, yPos, center.z + zOffset] },
      { id: "rear-left", pos: [center.x - xOffset, yPos, center.z - zOffset] },
      { id: "rear-right", pos: [center.x + xOffset, yPos, center.z - zOffset] }
    ];

    positions.forEach(p => {
      const anchor = new THREE.Group();
      anchor.name = `virtual_anchor_${p.id}`;
      // Set the world position
      anchor.position.set(...p.pos);
      // We don't add it to the model to avoid distorting the model's bounding box
      virtualAnchors.set(p.id, anchor);
    });

    return virtualAnchors;
  }

  // Deduplicate: if a parent and its child both match, prefer the parent
  const roots = candidates.filter((c) => {
    return !candidates.some((other) => other !== c && isDescendant(c, other));
  });

  console.log(`Discovered ${roots.length} wheel root nodes:`, roots.map((r) => r.name));

  // Classify each root by name-based position codes (FL, FR, BL, BR)
  const posMap = new Map();
  const posCount = {};
  for (const node of roots) {
    let posId = classifyWheelPosition(node);
    if (posMap.has(posId)) {
      const suffix = (posCount[posId] = (posCount[posId] || 1) + 1);
      posId = `${posId}-${suffix}`;
    }
    posMap.set(posId, node);
  }

  console.log("Wheel position mapping:", Object.fromEntries(posMap));
  return posMap;
}

/** Check whether `child` is a descendant of `parent` */
function isDescendant(child, parent) {
  let cur = child.parent;
  while (cur) {
    if (cur === parent) return true;
    cur = cur.parent;
  }
  return false;
}

/**
 * Find all meshes in the chassis model that should be hidden when a modular part is equipped in the given slot.
 */
function getOriginalChassisMeshes(model, slotKey) {
  const meshes = [];
  if (!model) return meshes;

  const key = slotKey.toLowerCase();

  model.traverse((node) => {
    if (!node.isMesh) return;

    const name = (node.name || "").toLowerCase();

    // Check matching rules per slot key
    if (key === "hood") {
      if (name.includes("hood") || name.includes("bonnet")) {
        meshes.push(node);
      }
    } else if (key === "front") {
      // front bumper
      // Support multiple naming conventions found in different GLB exports.
      const frontMatches =
        name.includes("front") ||
        name.includes("f_") ||
        name.includes("driver") ||
        name.includes("passenger");

      const bumperMatches =
        name.includes("bumper") ||
        name.includes("bumber") || // common typo
        name.includes("fascia") ||
        name.includes("front_fascia") ||
        name.includes("front fascia");

      if (frontMatches && bumperMatches) {
        meshes.push(node);
      }
    } else if (key === "back") {
      // rear bumper
      const rearMatches =
        name.includes("rear") ||
        name.includes("back") ||
        name.includes("r_") ||
        name.includes("b_") ||
        name.includes("tail");

      const bumperMatches =
        name.includes("bumper") ||
        name.includes("bumber") || // common typo
        name.includes("fascia") ||
        name.includes("rear_fascia") ||
        name.includes("rear fascia");

      if (rearMatches && bumperMatches) {
        meshes.push(node);
      }
    } else if (key.includes("door")) {

      const isDoor = name.includes("door");
      if (isDoor) {
        const isLeft = key.includes("left");
        const isRight = key.includes("right");
        const isFront = key.includes("front");
        const isRear = key.includes("rear") || key.includes("back");

        const nameLeft = name.includes("left") || name.includes("_lf") || name.includes("_lb") || name.includes("_lr");
        const nameRight = name.includes("right") || name.includes("_rf") || name.includes("_rb") || name.includes("_rr");
        const nameFront = name.includes("front") || name.includes("_lf") || name.includes("_rf") || name.includes("f_door");
        const nameRear = name.includes("rear") || name.includes("back") || name.includes("_lb") || name.includes("_rb") || name.includes("_lr") || name.includes("_rr") || name.includes("b_door");

        if (isFront && isLeft && nameFront && nameLeft) meshes.push(node);
        else if (isFront && isRight && nameFront && nameRight) meshes.push(node);
        else if (isRear && isLeft && nameRear && nameLeft) meshes.push(node);
        else if (isRear && isRight && nameRear && nameRight) meshes.push(node);
      }
    } else {
      // General fallback
      if (name.includes(key)) {
        meshes.push(node);
      }
    }
  });

  return meshes;
}

/**
 * Detect spoiler meshes by traversing the GLTF scene.
 * Returns the first spoiler mesh found.
 */
function discoverSpoilerMesh(model) {
  let anchor = null;
  let isExistingSpoiler = false;

  const fullBox   = new THREE.Box3().setFromObject(model);
  const size      = fullBox.getSize(new THREE.Vector3());
  const carCenter = fullBox.getCenter(new THREE.Vector3());

  // ── Detect rear headlight to find which Z end is the trunk ───────────────
  // The rear/back headlight IS at the trunk area, so the spoiler goes to the
  // SAME Z end as this light — no "opposite" logic needed.
  let rearZ = null;
  model.traverse((node) => {
    if (rearZ !== null) return;
    if (!(node.isMesh || node.isGroup)) return;
    const n = (node.name || "").toLowerCase();
    const isRearLight =
      (n.includes("rear") || n.includes("tail") || n.includes("back")) &&
      (n.includes("headlight") || n.includes("light") || n.includes("lamp"));
    if (isRearLight) {
      node.updateMatrixWorld(true);
      rearZ = new THREE.Box3().setFromObject(node).getCenter(new THREE.Vector3()).z;
      console.log(`[Spoiler] Rear light: "${node.name}" Z=${rearZ.toFixed(3)} → spoiler placed at this Z end`);
    }
  });

  // ── Step 1: Named rear spoiler/wing mesh ──────────────────────────────────
  model.traverse((node) => {
    if ((node.isMesh || node.isGroup) && !anchor) {
      const n = (node.name || "").toLowerCase();
      if ((n.includes("spoiler") || n.includes("wing")) &&
          !n.includes("mirror") && !n.includes("antenna") && !n.includes("wiper") &&
          !n.includes("front") && !n.includes("hood") && !n.includes("bonnet") &&
          // Exclude mounting pedestals — they are brackets, not spoiler surfaces.
          // A "pedestal_spoiler" is the whole assembly but its mesh is a narrow bracket;
          // let the geometric search find the trunk lid instead.
          !n.includes("pedestal")) {
        const nb = new THREE.Box3().setFromObject(node);
        const ns = nb.getSize(new THREE.Vector3());
        // Skip meshes with degenerate (empty / NaN) bounding boxes
        if (!isFinite(ns.x) || !isFinite(ns.y) || ns.x <= 0) return;
        anchor = node;
        isExistingSpoiler = ns.x < size.x * 0.7 && ns.y < size.y * 0.4;
      }
    }
  });

  // ── Step 2: Named trunk / boot / deck mesh (trust the name directly) ──────
  if (!anchor) {
    model.traverse((node) => {
      if ((node.isMesh || node.isGroup) && !anchor) {
        const n = (node.name || "").toLowerCase();
        if ((n.includes("trunk") || n.includes("boot") || n.includes("rear_deck") ||
             n.includes("decklid") || n.includes("deck_lid") || n.includes("bootlid") || n.includes("boot_lid")) &&
            !n.includes("light") && !n.includes("lamp") && !n.includes("bumper")) {
          const nb = new THREE.Box3().setFromObject(node);
          const ns = nb.getSize(new THREE.Vector3());
          if (ns.x < size.x * 0.95) {
            anchor = node;
            isExistingSpoiler = false;
          }
        }
      }
    });
  }

  // ── Step 3: Geometric — search outer 30% of each Z end ───────────────────
  if (!anchor) {
    const zPlusLimit  = fullBox.max.z - (size.z * 0.3);
    const zMinusLimit = fullBox.min.z  + (size.z * 0.3);

    // Trunk lid must be in the upper portion of the car (top 60% of height).
    // This excludes low body panels, side skirts, and underbody parts.
    const minTrunkTopY = fullBox.min.y + size.y * 0.4;

    let plusZCandidate  = null, plusZMaxY  = -Infinity;
    let minusZCandidate = null, minusZMaxY = -Infinity;

    model.traverse((node) => {
      if (!node.isMesh) return;
      const box    = new THREE.Box3().setFromObject(node);
      const center = box.getCenter(new THREE.Vector3());
      const ns     = box.getSize(new THREE.Vector3());
      if (ns.x > size.x * 0.85 || Math.abs(center.x) > size.x * 0.35) return;
      // Reject meshes whose top surface is too low — those are lower body panels, not trunk lids
      if (box.max.y < minTrunkTopY) return;
      if (center.z > zPlusLimit  && box.max.y > plusZMaxY)  { plusZMaxY  = box.max.y; plusZCandidate  = node; }
      if (center.z < zMinusLimit && box.max.y > minusZMaxY) { minusZMaxY = box.max.y; minusZCandidate = node; }
    });

    if (plusZCandidate && minusZCandidate) {
      if (rearZ !== null) {
        const rearIsPlus = rearZ > carCenter.z;
        anchor = rearIsPlus ? plusZCandidate : minusZCandidate;
        console.log(`[Spoiler] Geo: rear light at ${rearIsPlus ? "+Z" : "-Z"} → trunk at ${rearIsPlus ? "+Z" : "-Z"}`);
      } else {
        anchor = plusZMaxY <= minusZMaxY ? plusZCandidate : minusZCandidate;
      }
    } else if (rearZ !== null && (plusZCandidate || minusZCandidate)) {
      // Only one end found — verify it matches the rear light direction
      const rearIsPlus = rearZ > carCenter.z;
      const candidate  = plusZCandidate || minusZCandidate;
      const candIsPlus = plusZCandidate !== null;
      if (candIsPlus === rearIsPlus) anchor = candidate; // correct end ✓
      // else: wrong end → let final fallback handle it
    }
    // Note: single-candidate with no rearZ → skip, let final fallback decide
    if (anchor) isExistingSpoiler = false;
  }

  // ── Final fallback: highest mesh in the rear HALF of car ─────────────────
  // Handles single-mesh bodies where the outer-30% search finds nothing.
  if (!anchor) {
    const rearIsPlus = rearZ !== null && rearZ > carCenter.z;
    const rearMinZ   = rearIsPlus ? carCenter.z   : fullBox.min.z;
    const rearMaxZ   = rearIsPlus ? fullBox.max.z  : carCenter.z;
    let bestY = -Infinity;
    model.traverse((node) => {
      if (!node.isMesh) return;
      const box    = new THREE.Box3().setFromObject(node);
      const center = box.getCenter(new THREE.Vector3());
      if (center.z >= rearMinZ && center.z <= rearMaxZ && box.max.y > bestY) {
        bestY  = box.max.y;
        anchor = node;
      }
    });
    if (anchor) {
      isExistingSpoiler = false;
      console.log(`[Spoiler] Fallback anchor "${anchor.name}" in rear half`);
    }
  }

  if (anchor) {
    console.log(`[Spoiler] Anchor: "${anchor.name}" | isExistingSpoiler=${isExistingSpoiler}`);
  } else {
    console.warn("[Spoiler] No anchor found.");
  }

  return { mesh: anchor, isExistingSpoiler };
}

// ── Component ────────────────────────────────────────────────────────────────

const ThreeViewer = forwardRef(({
  modelPath,
  backgroundColor = "#ffffff",
  modelColor = null,
  wheelReplacements = {},
  spoilerReplacement = null,
  currentBuild = {},
  onWheelClick = null,
  sx = {},
}, ref) => {
  const mountRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const modelRef = useRef(null);
  const controlsRef = useRef(null);
  const animFrameRef = useRef(null);

  // Expose functions to parent
  useImperativeHandle(ref, () => ({
    takeScreenshot: () => {
      if (rendererRef.current && sceneRef.current && cameraRef.current) {
        rendererRef.current.render(sceneRef.current, cameraRef.current);
        const src = rendererRef.current.domElement;
        const thumb = document.createElement("canvas");
        thumb.width = 400;
        thumb.height = 300;
        thumb.getContext("2d").drawImage(src, 0, 0, 400, 300);
        return thumb.toDataURL("image/jpeg", 0.75);
      }
      return null;
    }
  }));

  // Wheel-related refs
  const wheelMeshMapRef = useRef(new Map());       // positionId → original mesh
  const originalWheelDataRef = useRef(new Map());  // positionId → { position, quaternion, scale, parent }
  const customWheelsRef = useRef(new Map());       // positionId → loaded custom mesh

  // Spoiler-related refs
  const originalSpoilerRef = useRef(null);
  const originalSpoilerDataRef = useRef(null);
  const customSpoilerRef = useRef(null);

  // Modular parts tracking (Bumper, Hood, etc.)
  const modularPartsRef = useRef(new Map()); // slotKey -> THREE.Group

  const raycasterRef = useRef(new THREE.Raycaster());
  const mouseRef = useRef(new THREE.Vector2());

  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  // Stable reference to the latest onWheelClick so the click handler always sees it
  const onWheelClickRef = useRef(onWheelClick);
  useEffect(() => { onWheelClickRef.current = onWheelClick; }, [onWheelClick]);

  // ── Scene setup ───────────────────────────────────────────────────────────
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 600;
    const height = container.clientHeight || 450;

    const scene = new THREE.Scene();
    if (backgroundColor !== "transparent") {
      scene.background = new THREE.Color(backgroundColor);
    }
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(3, 1.5, 4);
    camera.lookAt(0, 0.2, 0);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: backgroundColor === "transparent",
      preserveDrawingBuffer: true, // Allow screenshots
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.enableZoom = true;
    controls.enablePan = true;
    controls.zoomSpeed = 1;
    controls.rotateSpeed = 1;
    controls.target.set(0, 0.2, 0);
    controlsRef.current = controls;

    // ── Showroom Lighting ─────────────────────────────────────────────────
    // Soft ambient so the car body isn't completely black in shadows
    scene.add(new THREE.AmbientLight(0x8ab4c8, 0.35));
    // Primary front key light (angled from upper-front)
    const keyLight = new THREE.DirectionalLight(0xffffff, 1.8);
    keyLight.position.set(2, 6, 5);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.set(2048, 2048);
    keyLight.shadow.camera.near = 0.5;
    keyLight.shadow.camera.far = 20;
    keyLight.shadow.camera.top = 4;
    keyLight.shadow.camera.bottom = -4;
    keyLight.shadow.camera.left = -4;
    keyLight.shadow.camera.right = 4;
    scene.add(keyLight);
    // Fill light from the left side
    const fillLight = new THREE.DirectionalLight(0xb0d8ff, 0.6);
    fillLight.position.set(-4, 3, 1);
    scene.add(fillLight);
    // Rim/back light for silhouette definition
    const rimLight = new THREE.DirectionalLight(0x40d0ff, 0.55);
    rimLight.position.set(-1, 2, -4);
    scene.add(rimLight);
    // Warm top overhead light
    const topLight = new THREE.PointLight(0xffffff, 0.8, 10);
    topLight.position.set(0, 5, 0);
    scene.add(topLight);

    // ── Showroom Floor ────────────────────────────────────────────────────
    const floorGeo = new THREE.PlaneGeometry(30, 30);
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0x050a10,
      roughness: 0.55,
      metalness: 0.35,
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -0.55;
    floor.receiveShadow = true;
    scene.add(floor);

    // ── Spotlight glow disc on the floor ─────────────────────────────────
    const spotCanvas = document.createElement("canvas");
    spotCanvas.width = 512;
    spotCanvas.height = 512;
    const spotCtx = spotCanvas.getContext("2d");
    const spotGrad = spotCtx.createRadialGradient(256, 256, 0, 256, 256, 256);
    spotGrad.addColorStop(0,    "rgba(255,255,255,0.85)");
    spotGrad.addColorStop(0.15, "rgba(200,240,255,0.50)");
    spotGrad.addColorStop(0.40, "rgba(0,180,210,0.15)");
    spotGrad.addColorStop(0.70, "rgba(0,80,100,0.04)");
    spotGrad.addColorStop(1,    "rgba(0,0,0,0)");
    spotCtx.fillStyle = spotGrad;
    spotCtx.fillRect(0, 0, 512, 512);
    const spotTex = new THREE.CanvasTexture(spotCanvas);

    const spotGeo = new THREE.CircleGeometry(1.8, 128);
    const spotMat = new THREE.MeshBasicMaterial({
      map: spotTex,
      transparent: true,
      opacity: 0.55,
      depthWrite: false,
    });
    const spotDisc = new THREE.Mesh(spotGeo, spotMat);
    spotDisc.rotation.x = -Math.PI / 2;
    spotDisc.position.y = -0.548;
    scene.add(spotDisc);

    // Very subtle outer halo
    const haloGeo = new THREE.RingGeometry(1.7, 2.2, 128);
    const haloMat = new THREE.MeshBasicMaterial({
      color: 0x00c8e8,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.04,
    });
    const halo = new THREE.Mesh(haloGeo, haloMat);
    halo.rotation.x = -Math.PI / 2;
    halo.position.y = -0.547;
    scene.add(halo);

    // Very soft under-car fill (near-invisible, just lifts the car base)
    const floorLight = new THREE.PointLight(0x88ccff, 0.25, 2.5);
    floorLight.position.set(0, -0.2, 0);
    scene.add(floorLight);

    // ── Click handler for wheel raycasting ───────────────────────────────
    const handleClick = (event) => {
      if (!onWheelClickRef.current) return;
      if (wheelMeshMapRef.current.size === 0) return;

      const rect = renderer.domElement.getBoundingClientRect();
      mouseRef.current.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouseRef.current.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycasterRef.current.setFromCamera(mouseRef.current, camera);

      // Collect all descendant meshes of each wheel root node
      const allWheelMeshes = [];
      const meshToPosition = new Map();
      for (const [posId, rootNode] of wheelMeshMapRef.current) {
        rootNode.traverse((child) => {
          if (child.isMesh) {
            allWheelMeshes.push(child);
            meshToPosition.set(child, posId);
          }
        });
      }

      // Also check custom replacement meshes
      for (const [posId, customRoot] of customWheelsRef.current) {
        if (customRoot) {
          customRoot.traverse((child) => {
            if (child.isMesh) {
              allWheelMeshes.push(child);
              meshToPosition.set(child, posId);
            }
          });
        }
      }

      const intersects = raycasterRef.current.intersectObjects(allWheelMeshes, false);
      if (intersects.length > 0) {
        const hitMesh = intersects[0].object;
        const posId = meshToPosition.get(hitMesh);
        if (posId) {
          console.log("Wheel clicked:", posId);
          onWheelClickRef.current(posId);
        }
      }
    };

    renderer.domElement.addEventListener("click", handleClick);

    // Animate
    const animate = () => {
      animFrameRef.current = requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    // Resize
    const handleResize = () => {
      const c = mountRef.current;
      if (!c) return;
      const w = c.clientWidth;
      const h = c.clientHeight;
      if (!w || !h) return;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener("resize", handleResize);
    setTimeout(handleResize, 100);

    return () => {
      cancelAnimationFrame(animFrameRef.current);
      window.removeEventListener("resize", handleResize);
      renderer.domElement.removeEventListener("click", handleClick);
      sceneRef.current = null;
      cameraRef.current = null;
      controlsRef.current = null;
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
      rendererRef.current = null;
    };
  }, [backgroundColor]);

  // ── Model loading ──────────────────────────────────────────────────────
  useEffect(() => {
    if (!modelPath || !sceneRef.current) {
      console.log("Model loading: No modelPath or scene ready");
      return;
    }

    console.log("Model loading: Starting GLTFLoader for:", modelPath);
    setLoading(true);
    setError(null);

    let isMounted = true;
    const loader = new GLTFLoader();

    loader.load(
      modelPath,
      (gltf) => {
        if (!isMounted || !sceneRef.current) return;

        console.log("Model loading: GLTF loaded successfully");

        // Clean up previous model
        if (modelRef.current) {
          sceneRef.current.remove(modelRef.current);
          modelRef.current = null;
        }
        // Clear wheel refs
        wheelMeshMapRef.current = new Map();
        originalWheelDataRef.current = new Map();
        customWheelsRef.current = new Map();
        
        // Clear modular parts refs
        modularPartsRef.current.forEach((part) => { if (part?.parent) part.parent.remove(part); });
        modularPartsRef.current = new Map();

        const model = gltf.scene;
        model.traverse((node) => {
          if (node.isMesh) {
            node.castShadow = true;
            node.receiveShadow = true;
          }
        });

        const box = new THREE.Box3().setFromObject(model);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());
        const scale = 1.8 / Math.max(size.x, size.y, size.z);
        model.scale.setScalar(scale);
        model.position.set(
          -center.x * scale,
          -box.min.y * scale - 0.45,
          -center.z * scale
        );

        sceneRef.current.add(model);
        modelRef.current = model;

        // ── Discover part meshes ──────────────────────────────────────
        // Wait one frame so world matrices are updated after scaling/positioning
        requestAnimationFrame(() => {
          model.updateMatrixWorld(true);

          // WHEELS
          const posMap = discoverWheelMeshes(model);
          wheelMeshMapRef.current = posMap;
          for (const [posId, node] of posMap) {
            originalWheelDataRef.current.set(posId, {
              position: node.position.clone(),
              quaternion: node.quaternion.clone(),
              scale: node.scale.clone(),
              parent: node.parent,
              visible: node.visible,
            });
          }

          // SPOILER
          const spoilerResult = discoverSpoilerMesh(model);
          if (spoilerResult.mesh) {
            const { mesh: spoilerNode, isExistingSpoiler, rearZDirection } = spoilerResult;
            originalSpoilerRef.current = spoilerNode;
            originalSpoilerDataRef.current = {
              position: spoilerNode.position.clone(),
              quaternion: spoilerNode.quaternion.clone(),
              scale: spoilerNode.scale.clone(),
              parent: spoilerNode.parent,
              visible: spoilerNode.visible,
              isExistingSpoiler,
              rearZDirection,
            };
            console.log("Spoiler anchor stored:", spoilerNode.name);
          }
        });

        // Apply initial color (body meshes only)
        if (modelColor) {
          applyColorToPaintableMeshes(model, modelColor);
        }

        // ── Auto-fit camera: car always fills ~60 % of viewport height ───
        if (cameraRef.current && controlsRef.current) {
          const cam = cameraRef.current;
          const halfVFov = Math.tan((cam.fov * Math.PI / 180) / 2);
          // Model max dim is always 1.8 world units after scaling
          const fitDist  = (1.8 / 2) / (halfVFov * 0.60);
          // 3/4 view: 28° elevation, 40° azimuth
          const elev = Math.PI / 6.4;
          const azim = Math.PI / 4.5;
          cam.position.set(
            fitDist * Math.sin(azim) * Math.cos(elev),
            fitDist * Math.sin(elev),
            fitDist * Math.cos(azim) * Math.cos(elev)
          );
          cam.lookAt(0, 0.15, 0);
          controlsRef.current.target.set(0, 0.15, 0);
          controlsRef.current.update();
        }

        setLoading(false);
      },
      (progress) => {
        console.log("Model loading: Progress:", progress);
      },
      (err) => {
        console.error("Model loading: Error loading model:", err);
        if (!isMounted) return;
        setError(`Failed to load model: ${err.message}`);
        setLoading(false);
      }
    );

    return () => {
      isMounted = false;
    };
  }, [modelPath]);

  useEffect(() => {
    if (!modelColor) return;

    // 1. Apply to main chassis
    if (modelRef.current) {
      applyColorToPaintableMeshes(modelRef.current, modelColor);
    }

    // 2. Apply to modular parts (Bumpers, Hoods, etc.)
    modularPartsRef.current.forEach((part) => {
      applyColorToPaintableMeshes(part, modelColor);
    });

    // 3. Apply to custom spoiler
    if (customSpoilerRef.current) {
      applyColorToPaintableMeshes(customSpoilerRef.current, modelColor);
    }
  }, [modelColor]);

  // ── Wheel replacement effect ──────────────────────────────────────────────
  useEffect(() => {
    if (!sceneRef.current) return;
    console.log("[Wheels] Replacement requested for:", wheelReplacements);
    if (wheelMeshMapRef.current.size === 0) {
      console.error("[Wheels] Cannot apply wheels: No wheel meshes or anchors were discovered in the car model!");
      return;
    }

    const loader = new GLTFLoader();

    for (const [posId, wheelUrl] of Object.entries(wheelReplacements)) {
      console.log(`[Wheels] Processing position: ${posId} | URL: ${wheelUrl}`);
      const originalData = originalWheelDataRef.current.get(posId);
      const originalMesh = wheelMeshMapRef.current.get(posId);

      if (!originalMesh || !originalData) {
        console.warn(`[Wheels] Skipping ${posId}: No anchor/mesh found in model.`);
        continue;
      }

      // Remove existing custom wheel for this position (if any)
      const existingCustom = customWheelsRef.current.get(posId);
      if (existingCustom) {
        if (existingCustom.parent) existingCustom.parent.remove(existingCustom);
        customWheelsRef.current.delete(posId);
      }

      if (!wheelUrl) {
        // Reset: show original wheel
        originalMesh.visible = true;
        originalMesh.traverse((child) => { child.visible = true; });
        continue;
      }

      originalMesh.traverse((child) => { child.visible = true; });
      originalMesh.updateMatrixWorld(true);

      // Measure the original space (anchor or existing wheel)
      const origBox = new THREE.Box3().setFromObject(originalMesh);
      const origSize = new THREE.Vector3();
      origBox.getSize(origSize);

      // If it's a virtual anchor (no size), use its world position directly
      let origCenter = new THREE.Vector3();
      if (origSize.length() < 0.01) {
        originalMesh.getWorldPosition(origCenter);
      } else {
        origBox.getCenter(origCenter);
      }

      // NOW hide original wheel
      originalMesh.visible = false;
      originalMesh.traverse((child) => { child.visible = false; });

      // Load the replacement wheel
      console.log(`[${posId}] Loading custom wheel from:`, wheelUrl);
      loader.load(
        wheelUrl,
        (gltf) => {
          if (!sceneRef.current) return;

          const customWheel = gltf.scene;
          console.log(`[${posId}] Custom wheel GLTF loaded successfully`);

          // Enable shadows
          customWheel.traverse((child) => {
            if (child.isMesh) {
              child.castShadow = true;
              child.receiveShadow = true;
            }
          });

          // Measure sizes
          const customBox = new THREE.Box3().setFromObject(customWheel);
          const customSize = customBox.getSize(new THREE.Vector3());
          const customCenter = customBox.getCenter(new THREE.Vector3());

          // Calculate fit scale based on height (Y-axis) to match original wheel diameter
          let finalScale = 1;
          const targetSizeY = origSize.y > 0 ? origSize.y : 0.26; // Smaller diameter (0.26 instead of 0.38)

          if (customSize.y > 0) {
            finalScale = targetSizeY / customSize.y;
          }

          const parentWorldScale = new THREE.Vector3(1, 1, 1);
          if (originalData.parent) {
            originalData.parent.getWorldScale(parentWorldScale);
          }

          // Set scale, compensating for parent's world scale, and animate it with GSAP!
          const targetScaleScalar = finalScale / parentWorldScale.y;
          customWheel.scale.setScalar(0.01);
          gsap.to(customWheel.scale, {
            x: targetScaleScalar,
            y: targetScaleScalar,
            z: targetScaleScalar,
            duration: 0.65,
            ease: "back.out(1.5)"
          });

          // Copy rotation
          customWheel.quaternion.copy(originalData.quaternion);

          // Mirror rotation so rims face OUTWARD
          // If the wheel faces inward, we flip the side logic here
          if (posId.includes("left")) {
            customWheel.rotateY(Math.PI);
          }

          // Add to parent (or scene if it's a virtual anchor)
          const attachmentParent = originalMesh.parent || sceneRef.current;
          if (attachmentParent) {
            attachmentParent.add(customWheel);
          }

          // Positioning: Align centers in world space
          customWheel.updateMatrixWorld(true);
          const newCustomBox = new THREE.Box3().setFromObject(customWheel);
          const newCustomCenter = newCustomBox.getCenter(new THREE.Vector3());
          const worldOffset = new THREE.Vector3().subVectors(origCenter, newCustomCenter);

          customWheel.position.add(new THREE.Vector3(
            worldOffset.x / parentWorldScale.x,
            worldOffset.y / parentWorldScale.y,
            worldOffset.z / parentWorldScale.z
          ));

          customWheelsRef.current.set(posId, customWheel);
          console.log(`[${posId}] Replaced with scale ${finalScale}`);
          console.log(`[${posId}] Replacement wheel added to scene`);
        },
        undefined,
        (err) => {
          console.error(`[${posId}] Failed to load custom wheel:`, err);
          // Restore original on failure
          originalMesh.visible = true;
          originalMesh.traverse((child) => { child.visible = true; });
        }
      );
    }
  }, [wheelReplacements, loading]);

  // ── Modular Part Attachment Effect ─────────────────────────────────────────
  useEffect(() => {
    if (!sceneRef.current || !modelRef.current) return;

    const loader = new GLTFLoader();

    // 1. Determine what needs to be added or removed
    const currentSlots = Object.keys(currentBuild);
    const loadedSlots = Array.from(modularPartsRef.current.keys());

    // Cleanup: Remove slots that are no longer in the build or have changed to null
    loadedSlots.forEach(slotKey => {
      if (!currentBuild[slotKey]) {
        const oldPart = modularPartsRef.current.get(slotKey);
        if (oldPart?.parent) oldPart.parent.remove(oldPart);
        modularPartsRef.current.delete(slotKey);

        // Restore original chassis meshes visibility
        const originalMeshes = getOriginalChassisMeshes(modelRef.current, slotKey);
        originalMeshes.forEach(mesh => {
          mesh.visible = true;
        });
      }
    });

    // Load/Update: Iterate through current build
    currentSlots.forEach(slotKey => {
      const partUrl = currentBuild[slotKey];
      if (!partUrl) return;

      // Spoilers are handled by the dedicated spoilerReplacement system — skip here
      if (slotKey.toLowerCase().includes("spoiler")) return;

      // Skip if this specific URL is already loaded in this slot
      if (modularPartsRef.current.get(slotKey)?.userData?.url === partUrl) return;

      console.log(`[Modular] Attaching part to slot: "${slotKey}" | URL: ${partUrl}`);

      loader.load(partUrl, (gltf) => {
        if (!modelRef.current) return;

        // Clean up the old part in this slot immediately (if any)
        const oldPart = modularPartsRef.current.get(slotKey);
        if (oldPart && oldPart.parent) {
          oldPart.parent.remove(oldPart);
        }
        modularPartsRef.current.delete(slotKey);

        const newPart = gltf.scene;
        newPart.userData.url = partUrl;

        // Hide original chassis meshes for this slot key to avoid overlapping/z-fighting
        const originalMeshes = getOriginalChassisMeshes(modelRef.current, slotKey);

        // DEBUG logs
        console.log("[Modular][Debug] Slot Key:", slotKey);
        console.log("[Modular][Debug] Original Meshes:", originalMeshes);
        console.log("[Modular][Debug] Original Mesh Count:", originalMeshes.length);

        // Measure original chassis meshes in world space before hiding them
        let hasAnchor = false;
        const anchorBox = new THREE.Box3();
        originalMeshes.forEach(mesh => {
          mesh.updateMatrixWorld(true);
          anchorBox.expandByObject(mesh);
          hasAnchor = true;
        });

        console.log("[Modular][Debug] Has Anchor:", hasAnchor);

        originalMeshes.forEach(mesh => {
          mesh.visible = false;
        });

        // Enable shadows
        newPart.traverse(child => {
          if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
          }
        });

        if (hasAnchor) {
          const anchorCenter = anchorBox.getCenter(new THREE.Vector3());
          const anchorSize = anchorBox.getSize(new THREE.Vector3());

          // Add to scene first to measure in world coordinates
          sceneRef.current.add(newPart);
          newPart.position.set(0, 0, 0);
          newPart.quaternion.set(0, 0, 0, 1);
          newPart.scale.set(1, 1, 1);
          newPart.updateMatrixWorld(true);

          const newBox = new THREE.Box3().setFromObject(newPart);
          const newSize = newBox.getSize(new THREE.Vector3());
          const newCenter = newBox.getCenter(new THREE.Vector3());

          // Match orientation: rotate 90 degrees if aspect ratios are mismatched (e.g. part is sideways)
          const anchorAspect = anchorSize.x / (anchorSize.z || 1);
          const partAspect = newSize.x / (newSize.z || 1);
          if ((anchorAspect > 1 && partAspect < 0.9) || (anchorAspect < 1 && partAspect > 1.1)) {
            newPart.rotateY(Math.PI / 2);
            newPart.updateMatrixWorld(true);
            const rotatedBox = new THREE.Box3().setFromObject(newPart);
            rotatedBox.getSize(newSize);
            rotatedBox.getCenter(newCenter);
          }

          // Calculate scale factor to match critical dimension
          let scaleFactor = 1;
          if (anchorSize.x > anchorSize.z) {
            scaleFactor = newSize.x > 0 ? anchorSize.x / newSize.x : 1;
          } else {
            scaleFactor = newSize.z > 0 ? anchorSize.z / newSize.z : 1;
          }

          newPart.scale.setScalar(scaleFactor);
          newPart.updateMatrixWorld(true);

          // Re-measure after scaling to get exact center offset
          const scaledBox = new THREE.Box3().setFromObject(newPart);
          const scaledCenter = scaledBox.getCenter(new THREE.Vector3());

          // Align center position
          newPart.position.x += anchorCenter.x - scaledCenter.x;
          newPart.position.z += anchorCenter.z - scaledCenter.z;
          newPart.position.y += anchorCenter.y - scaledCenter.y;

          // Attach to modelRef.current so it moves with the car
          modelRef.current.attach(newPart);

          // Get the correct local scale calculated by Three.js
          const targetScaleX = newPart.scale.x;
          const targetScaleY = newPart.scale.y;
          const targetScaleZ = newPart.scale.z;

          // Animate scaling in from tiny
          newPart.scale.set(targetScaleX * 0.01, targetScaleY * 0.01, targetScaleZ * 0.01);
          gsap.to(newPart.scale, {
            x: targetScaleX,
            y: targetScaleY,
            z: targetScaleZ,
            duration: 0.6,
            ease: "back.out(1.5)"
          });
        } else {
          // Fallback: Add directly to modelRef.current at (0,0,0) and scale 1
          modelRef.current.add(newPart);
          newPart.position.set(0, 0, 0);
          newPart.rotation.set(0, 0, 0);
          newPart.scale.set(0.01, 0.01, 0.01);
          
          gsap.to(newPart.scale, {
            x: 1,
            y: 1,
            z: 1,
            duration: 0.6,
            ease: "back.out(1.5)"
          });
        }

        modularPartsRef.current.set(slotKey, newPart);

        // Apply current body paint to the new modular part
        if (modelColor) {
          applyColorToPaintableMeshes(newPart, modelColor);
        }
      },
      undefined,
      (err) => {
        console.error(
          `[Modular] ❌ Failed to load part for slot "${slotKey}".\n` +
          `  URL: ${partUrl}\n`,
          err?.message ?? err
        );
      });
    });

  }, [currentBuild, loading]);
  useEffect(() => {
    if (!sceneRef.current) return;
    if (!originalSpoilerRef.current || !originalSpoilerDataRef.current) return;

    const anchor     = originalSpoilerRef.current;
    const anchorData = originalSpoilerDataRef.current;

    // Clean up previous custom spoiler
    if (customSpoilerRef.current) {
      if (customSpoilerRef.current.parent) {
        customSpoilerRef.current.parent.remove(customSpoilerRef.current);
      }
      customSpoilerRef.current = null;
    }

    if (!spoilerReplacement) {
      anchor.visible = anchorData.visible;
      anchor.traverse((c) => { c.visible = true; });
      return;
    }

    // Keep trunk visible (we place spoiler on top, not instead of it)
    anchor.visible = true;
    anchor.traverse((c) => { c.visible = true; });

    const loader = new GLTFLoader();
    loader.load(
      spoilerReplacement,
      (gltf) => {
        if (!sceneRef.current) return;

        const spoiler = gltf.scene;

        spoiler.traverse((child) => {
          if (child.isMesh) { child.castShadow = true; child.receiveShadow = true; }
        });

        // ── Step 1: Measure anchor (trunk) in world space ──────────────────
        anchor.updateMatrixWorld(true);
        const anchorBox = new THREE.Box3().setFromObject(anchor);
        let anchorCenter = anchorBox.getCenter(new THREE.Vector3());
        let anchorTop    = anchorBox.max.y;
        let anchorWidth  = anchorBox.max.x - anchorBox.min.x;

        // If the anchor is a low body panel OR a narrow mounting bracket (pedestal),
        // compute virtual trunk dimensions from the car's overall bounding box.
        if (modelRef.current) {
          const modelBox   = new THREE.Box3().setFromObject(modelRef.current);
          const carTopY    = modelBox.max.y;
          const carWidth   = modelBox.max.x - modelBox.min.x;
          const carCenter  = modelBox.getCenter(new THREE.Vector3());

          // Trigger virtual trunk when:
          //  • anchor is in the bottom 20 % of car height  (low body panel)
          //  • anchor is narrower than 15 % of car width   (mounting pedestal / bracket)
          //  • anchor bounding box is degenerate (NaN / Infinity)
          const anchorTooLow    = anchorTop < carTopY * 0.2;
          const anchorTooNarrow = anchorWidth < carWidth * 0.15;
          const anchorBad       = !isFinite(anchorWidth) || !isFinite(anchorTop);

          if (anchorTooLow || anchorTooNarrow || anchorBad) {
            // Anchor Z tells us which end is the rear (it was found in the rear half).
            // Push the trunk Z 65% of the way from car center toward that rear end.
            const rearEndZ = anchorCenter.z <= carCenter.z
              ? modelBox.min.z   // rear is at -Z
              : modelBox.max.z;  // rear is at +Z
            const trunkZ = carCenter.z + (rearEndZ - carCenter.z) * -0.93;

            // Trunk deck on a sedan sits at ~85% of the car's total height from ground.
            // Using the full roof (carTopY) overshoots — trunk lid is lower than the roof.
            const carBottom   = modelBox.min.y;
            const trunkDeckY  = carBottom + (carTopY - carBottom) * 0.67;

            anchorTop    = trunkDeckY;
            anchorCenter = new THREE.Vector3(carCenter.x, trunkDeckY, trunkZ);
            anchorWidth  = carWidth * 0.80;
            console.log(`[Spoiler] Virtual trunk: deckY=${trunkDeckY.toFixed(3)} Z=${trunkZ.toFixed(3)} (rear at ${rearEndZ.toFixed(3)})`);
          }
        }

        console.log(`[Spoiler] Effective anchor center=${JSON.stringify(anchorCenter)} | top=${anchorTop.toFixed(3)} | width=${anchorWidth.toFixed(3)}`);

        // ── Step 2: Add spoiler to scene (world space — no parent transform issues) ──
        sceneRef.current.add(spoiler);
        spoiler.position.set(0, 0, 0);
        spoiler.quaternion.set(0, 0, 0, 1);
        spoiler.scale.set(1, 1, 1);
        spoiler.updateMatrixWorld(true);

        // ── Step 3: Measure spoiler at scale=1 ─────────────────────────────
        let rawBox  = new THREE.Box3().setFromObject(spoiler);
        let rawSize = rawBox.getSize(new THREE.Vector3());

        if (rawSize.z > rawSize.x * 1.25) {
          spoiler.rotateY(Math.PI / 2);
          spoiler.updateMatrixWorld(true);
          rawBox = new THREE.Box3().setFromObject(spoiler);
          rawSize = rawBox.getSize(new THREE.Vector3());
        }

        // Use the longer horizontal dimension to handle sideways models
        const fitDim   = Math.max(rawSize.x, rawSize.z);
        const finalScale = fitDim > 0 ? Math.min((anchorWidth * 0.85) / fitDim, 200) : 1;

        // ── Step 4: Apply final scale and re-measure ───────────────────────
        spoiler.scale.setScalar(finalScale);
        spoiler.updateMatrixWorld(true);

        const scaledBox    = new THREE.Box3().setFromObject(spoiler);
        const scaledCenter = scaledBox.getCenter(new THREE.Vector3());
        const scaledBottom = scaledBox.min.y;

        // ── Step 5: Position spoiler ───────────────────────────────────────
        // X/Z: center it over the trunk
        // Y:   sit the spoiler bottom on the trunk top surface + 2 cm gap
        spoiler.position.x += anchorCenter.x - scaledCenter.x;
        spoiler.position.z += anchorCenter.z - scaledCenter.z;
        spoiler.position.y += (anchorTop - scaledBottom) + 0.02;

        console.log(`[Spoiler] finalScale=${finalScale.toFixed(4)} | position=${JSON.stringify(spoiler.position)}`);

        // ── Step 6: Animate scale in from tiny ────────────────────────────
        const fs = finalScale;
        spoiler.scale.setScalar(0.01);
        gsap.to(spoiler.scale, { x: fs, y: fs, z: fs, duration: 0.65, ease: "back.out(1.5)" });

        customSpoilerRef.current = spoiler;

        if (modelColor) applyColorToPaintableMeshes(spoiler, modelColor);
      },
      undefined,
      (err) => {
        console.error("[Spoiler] Failed to load:", err);
        anchor.visible = true;
        anchor.traverse((c) => { c.visible = true; });
      }
    );
  }, [spoilerReplacement, loading]);

  const overlayBg = backgroundColor === "transparent" ? "rgba(0,0,0,0.4)" : backgroundColor;

  return (
    <Box
      sx={{
        width: "100%",
        height: "100%",
        minHeight: 450,
        position: "relative",
        ...sx,
      }}
    >
      <Box ref={mountRef} sx={{ width: "100%", height: "100%", minHeight: 450 }} />

      {/* Loading overlay */}
      {loading && !error && (
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 2,
            background: overlayBg,
            zIndex: 2,
          }}
        >
          <CircularProgress size={32} sx={{ color: "#2c5364" }} />
          <Typography sx={{ color: backgroundColor === "transparent" ? "#fff" : "#6b7c88", fontSize: 14 }}>
            Loading 3D Model…
          </Typography>
        </Box>
      )}

      {error && (
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: overlayBg,
            zIndex: 2,
          }}
        >
          <Typography color="error" sx={{ px: 3, textAlign: "center" }}>
            {error}
          </Typography>
        </Box>
      )}
    </Box>
  );
});

export default ThreeViewer;
