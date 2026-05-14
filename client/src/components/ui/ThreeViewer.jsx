"use client";
import { useEffect, useRef, useState, useCallback, useImperativeHandle, forwardRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { Box, Typography, CircularProgress } from "@mui/material";

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
    "light", "lamp", "headlight", "taillight", "fog", "indicator", "signal",
    "interior", "seat", "dashboard", "dash", "steering", "console",
    "tyre", "tire", "wheel", "rim", "brake", "disc",
    "chrome", "emblem", "logo", "badge", "plate", "number",
    "mirror", "wiper", "antenna", "grille", "grill",
    "rubber", "seal", "trim",
    "exhaust", "pipe", "muffler",
    "underbody", "undercarriage", "chassis",
  ];

  for (const pattern of excludePatterns) {
    if (n.includes(pattern)) return false;
  }

  // Include patterns: things that SHOULD be painted (body panels)
  const includePatterns = [
    "body", "door", "hood", "bonnet", "fender", "bumper",
    "roof", "trunk", "boot", "panel", "quarter", "pillar",
    "skirt", "spoiler", "wing", "paint",
  ];

  for (const pattern of includePatterns) {
    if (n.includes(pattern)) return true;
  }

  // If no pattern matched, include it by default (many GLTF models
  // use generic names like "Mesh_001" for body panels)
  // But ONLY if the name doesn't look like an excluded component
  return true;
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
 * Detect spoiler meshes by traversing the GLTF scene.
 * Returns the first spoiler mesh found.
 */
function discoverSpoilerMesh(model) {
  let anchor = null;
  let isExistingSpoiler = false;

  const fullBox = new THREE.Box3().setFromObject(model);
  const size = fullBox.getSize(new THREE.Vector3());

  // 1. Look for explicit spoiler names
  model.traverse((node) => {
    if ((node.isMesh || node.isGroup) && !anchor) {
      const n = (node.name || "").toLowerCase();

      // Strict spoiler check (exclude mirrors, antennas, etc.)
      const isSpoiler = (n.includes("spoiler") || n.includes("wing")) &&
        !n.includes("mirror") &&
        !n.includes("antenna") &&
        !n.includes("wiper");

      if (isSpoiler) {
        // SIZE CHECK: If the "spoiler" is too large, it's probably a body panel.
        // Don't hide it in that case.
        const nodeBox = new THREE.Box3().setFromObject(node);
        const nodeSize = nodeBox.getSize(new THREE.Vector3());

        if (nodeSize.x < size.x * 0.7 && nodeSize.y < size.y * 0.4) {
          anchor = node;
          isExistingSpoiler = true;
        } else {
          // It's too big to be just a spoiler, treat it as a trunk anchor
          anchor = node;
          isExistingSpoiler = false;
        }
      }
    }
  });

  // 2. Look for trunk names
  if (!anchor) {
    model.traverse((node) => {
      if ((node.isMesh || node.isGroup) && !anchor) {
        const n = (node.name || "").toLowerCase();
        // Look for trunk-specific names
        if (n.includes("trunk") || n.includes("boot") || n.includes("rear_deck")) {
          const nodeBox = new THREE.Box3().setFromObject(node);
          const nodeSize = nodeBox.getSize(new THREE.Vector3());
          if (nodeSize.x < size.x * 0.95) {
            anchor = node;
            isExistingSpoiler = false;
          }
        }
      }
    });
  }

  // 3. Fallback: Find the highest mesh in the rear-most part of the car
  if (!anchor) {
    // We try both +Z and -Z as "rear" and pick the one that looks more like a trunk
    // (Usually +Z is back in standard GLTF car models)
    const rearLimitZ = fullBox.max.z - (size.z * 0.2); // Last 20%
    let highestY = -Infinity;

    model.traverse((node) => {
      if (node.isMesh) {
        const box = new THREE.Box3().setFromObject(node);
        const center = box.getCenter(new THREE.Vector3());
        const nodeSize = box.getSize(new THREE.Vector3());

        // Must be in the rear 20%, not the whole car, and centered horizontally
        if (center.z > rearLimitZ &&
          nodeSize.x < size.x * 0.8 &&
          Math.abs(center.x) < size.x * 0.3) {

          if (box.max.y > highestY) {
            highestY = box.max.y;
            anchor = node;
            isExistingSpoiler = false;
          }
        }
      }
    });
  }

  if (anchor) {
    console.log(`[Spoiler] Identified anchor: "${anchor.name}" | Existing Spoiler: ${isExistingSpoiler}`);
  } else {
    console.warn("[Spoiler] No suitable anchor found for spoiler placement.");
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
        // Render one frame immediately to ensure buffer is fresh
        rendererRef.current.render(sceneRef.current, cameraRef.current);
        return rendererRef.current.domElement.toDataURL("image/png");
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

    // Lighting
    scene.add(new THREE.AmbientLight(0xffffff, 0.6));
    const mainLight = new THREE.DirectionalLight(0xffffff, 1);
    mainLight.position.set(3, 5, 2);
    mainLight.castShadow = true;
    scene.add(mainLight);
    const fillLight = new THREE.DirectionalLight(0xffffff, 0.5);
    fillLight.position.set(-2, 2, 2);
    scene.add(fillLight);
    const backLight = new THREE.PointLight(0xffffff, 0.4);
    backLight.position.set(0, 1, -3);
    scene.add(backLight);
    const rimLight = new THREE.PointLight(0xffaa66, 0.4);
    rimLight.position.set(1.5, 1.2, -2.5);
    scene.add(rimLight);

    // Ground
    const shadowPlane = new THREE.Mesh(
      new THREE.PlaneGeometry(5, 5),
      new THREE.ShadowMaterial({ opacity: 0.2, transparent: true })
    );
    shadowPlane.rotation.x = -Math.PI / 2;
    shadowPlane.position.y = -0.55;
    shadowPlane.receiveShadow = true;
    scene.add(shadowPlane);

    const grid = new THREE.GridHelper(5, 20, 0xcccccc, 0xaaaaaa);
    grid.position.y = -0.55;
    grid.material.transparent = true;
    grid.material.opacity = 0.3;
    scene.add(grid);

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
        customWheelsRef.current.forEach((cw) => { if (cw?.parent) cw.parent.remove(cw); });
        customWheelsRef.current = new Map();

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
            const { mesh: spoilerNode, isExistingSpoiler } = spoilerResult;
            originalSpoilerRef.current = spoilerNode;
            originalSpoilerDataRef.current = {
              position: spoilerNode.position.clone(),
              quaternion: spoilerNode.quaternion.clone(),
              scale: spoilerNode.scale.clone(),
              parent: spoilerNode.parent,
              visible: spoilerNode.visible,
              isExistingSpoiler,
            };
            console.log("Spoiler anchor stored:", spoilerNode.name);
          }
        });

        // Apply initial color (body meshes only)
        if (modelColor) {
          model.traverse((node) => {
            if (node.isMesh && node.material && isBodyPaintMesh(node.name)) {
              const mats = Array.isArray(node.material) ? node.material : [node.material];
              mats.forEach((m) => m.color && m.color.set(modelColor));
            }
          });
        }

        if (controlsRef.current) {
          controlsRef.current.target.set(0, 0.3, 0);
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

  // ── Color updates (body meshes only) ───────────────────────────────────────
  useEffect(() => {
    if (!modelColor || !modelRef.current) return;
    modelRef.current.traverse((node) => {
      if (node.isMesh && node.material && isBodyPaintMesh(node.name)) {
        const mats = Array.isArray(node.material) ? node.material : [node.material];
        mats.forEach((m) => m.color && m.color.set(modelColor));
      }
    });
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

          // Set scale, compensating for parent's world scale
          customWheel.scale.setScalar(finalScale / parentWorldScale.y);

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
  }, [wheelReplacements]);

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
      }
    });

    // Load/Update: Iterate through current build
    currentSlots.forEach(slotKey => {
      const partUrl = currentBuild[slotKey];
      if (!partUrl) return;

      // Skip if this specific URL is already loaded in this slot
      if (modularPartsRef.current.get(slotKey)?.userData?.url === partUrl) return;

      console.log(`[Modular] Attaching part to slot: ${slotKey} | URL: ${partUrl}`);

      loader.load(partUrl, (gltf) => {
        if (!modelRef.current) return;

        const newPart = gltf.scene;
        newPart.userData.url = partUrl;

        // Find Anchor Point in the Chassis
        let anchor = null;

        // Try various naming patterns for the anchor
        const possibleNames = [
          `pos_${slotKey}`,
          `anchor_${slotKey}`,
          `POS_${slotKey}`,
          `ANCHOR_${slotKey}`,
          slotKey
        ];

        modelRef.current.traverse(node => {
          if (!anchor && possibleNames.includes(node.name)) {
            anchor = node;
          }
        });

        // If no specific anchor found, try a fuzzy search
        if (!anchor) {
          modelRef.current.traverse(node => {
            if (!anchor && node.name.toLowerCase().includes(slotKey.toLowerCase())) {
              anchor = node;
            }
          });
        }

        if (anchor) {
          console.log(`[Modular] Found anchor for ${slotKey}: ${anchor.name}`);

          // Remove old part before adding new one
          const oldPart = modularPartsRef.current.get(slotKey);
          if (oldPart?.parent) oldPart.parent.remove(oldPart);

          // Enable shadows
          newPart.traverse(child => {
            if (child.isMesh) {
              child.castShadow = true;
              child.receiveShadow = true;
            }
          });

          // Match Anchor Transform
          anchor.add(newPart);
          newPart.position.set(0, 0, 0);
          newPart.quaternion.set(0, 0, 0, 1);
          newPart.scale.set(1, 1, 1);

          modularPartsRef.current.set(slotKey, newPart);
        } else {
          console.warn(`[Modular] No anchor point found for slot: ${slotKey}. Part may not appear correctly.`);
          // As a fallback, just add to the model center
          modelRef.current.add(newPart);
          modularPartsRef.current.set(slotKey, newPart);
        }
      });
    });

  }, [currentBuild]);
  useEffect(() => {
    if (!sceneRef.current) return;
    if (!originalSpoilerRef.current || !originalSpoilerDataRef.current) return;

    const loader = new GLTFLoader();
    const originalMesh = originalSpoilerRef.current;
    const originalData = originalSpoilerDataRef.current;

    // Remove existing custom spoiler
    if (customSpoilerRef.current) {
      if (customSpoilerRef.current.parent) {
        customSpoilerRef.current.parent.remove(customSpoilerRef.current);
      }
      customSpoilerRef.current = null;
    }

    if (!spoilerReplacement) {
      // Reset: show original spoiler if it was a spoiler, or just ensure anchor is visible
      originalMesh.visible = originalData.visible;
      originalMesh.traverse((child) => { child.visible = true; });
      return;
    }

    // Hide original ONLY if it was actually a spoiler
    if (originalData.isExistingSpoiler) {
      originalMesh.visible = false;
      originalMesh.traverse((child) => { child.visible = false; });
    } else {
      // If it's a trunk, ensure it stays visible
      originalMesh.visible = true;
      originalMesh.traverse((child) => { child.visible = true; });
    }

    // Load replacement
    console.log("Loading custom spoiler from:", spoilerReplacement);
    loader.load(
      spoilerReplacement,
      (gltf) => {
        if (!sceneRef.current) return;

        const customSpoiler = gltf.scene;
        console.log("Custom spoiler GLTF loaded successfully");

        // Enable shadows
        customSpoiler.traverse((child) => {
          if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
          }
        });

        // ── Align centers ──
        // Ensure original is temporarily visible/updated for correct bbox
        const wasVisible = originalMesh.visible;
        originalMesh.visible = true;
        originalMesh.updateMatrixWorld(true);

        const origBox = new THREE.Box3().setFromObject(originalMesh);
        const origCenter = origBox.getCenter(new THREE.Vector3());
        const origSize = origBox.getSize(new THREE.Vector3());

        originalMesh.visible = wasVisible;

        // Add to same parent or scene
        if (originalData.parent) {
          originalData.parent.add(customSpoiler);
        } else {
          sceneRef.current.add(customSpoiler);
        }

        // Reset transforms to identity before computing offset
        customSpoiler.position.set(0, 0, 0);
        customSpoiler.quaternion.set(0, 0, 0, 1);
        customSpoiler.scale.set(1, 1, 1);
        customSpoiler.updateMatrixWorld(true);

        // 1. Orientation & Scale Adjustment
        // We find the dimensions of the spoiler and ensure its "longest horizontal side" 
        // aligns with the car's width (X-axis).
        const tempBox = new THREE.Box3().setFromObject(customSpoiler);
        const tempSize = tempBox.getSize(new THREE.Vector3());

        // If it's deeper than it is wide, it's probably sideways. Rotate 90 deg.
        if (tempSize.z > tempSize.x) {
          console.log("[Spoiler] Model appears sideways. Rotating 90 degrees.");
          customSpoiler.rotateY(Math.PI / 2);
          customSpoiler.updateMatrixWorld(true);
        }

        const customBox = new THREE.Box3().setFromObject(customSpoiler);
        const customSize = customBox.getSize(new THREE.Vector3());
        const targetWidth = origSize.x * 0.85; // Target ~85% of trunk width

        // Use X (width) for scaling after ensuring correct rotation
        const scaleFactor = targetWidth / (customSize.x || 1);
        const finalScale = Math.min(scaleFactor, 100.0);

        customSpoiler.scale.setScalar(finalScale);
        console.log(`[Spoiler] Scaling: ${finalScale.toFixed(4)} (Target width: ${targetWidth.toFixed(4)})`);

        // 2. Position Alignment (World Space)
        customSpoiler.updateMatrixWorld(true);
        const currentCustomBox = new THREE.Box3().setFromObject(customSpoiler);
        const currentCustomCenter = currentCustomBox.getCenter(new THREE.Vector3());

        // Move to anchor center (World space)
        const worldOffset = new THREE.Vector3().subVectors(origCenter, currentCustomCenter);

        // Convert world offset to parent local space
        const parentWorldScale = new THREE.Vector3(1, 1, 1);
        const parentWorldQuaternion = new THREE.Quaternion();
        if (customSpoiler.parent) {
          customSpoiler.parent.getWorldScale(parentWorldScale);
          customSpoiler.parent.getWorldQuaternion(parentWorldQuaternion);
        }

        // Apply translation (World-to-Local)
        const invQuaternion = parentWorldQuaternion.clone().invert();
        const localOffset = worldOffset.clone().applyQuaternion(invQuaternion);

        customSpoiler.position.add(new THREE.Vector3(
          localOffset.x / parentWorldScale.x,
          localOffset.y / parentWorldScale.y,
          localOffset.z / parentWorldScale.z
        ));

        // 3. Lock to Top Surface
        customSpoiler.updateMatrixWorld(true);
        const updatedCustomBox = new THREE.Box3().setFromObject(customSpoiler);

        const targetTopY = origBox.max.y;
        const spoilerBottomY = updatedCustomBox.min.y;
        console.log(`[Spoiler] Aligning: Trunk Top Y = ${targetTopY.toFixed(4)}, Spoiler Bottom Y = ${spoilerBottomY.toFixed(4)}`);

        // Add a 0.08 world-unit gap to sit clearly above the surface
        const yCorrectionWorld = (targetTopY - spoilerBottomY) + 0.08;

        // Apply Y correction in local space (World-to-Local)
        const invQuaternionY = parentWorldQuaternion.clone().invert();
        const localYCorrection = new THREE.Vector3(0, yCorrectionWorld, 0).applyQuaternion(invQuaternionY);
        customSpoiler.position.y += (localYCorrection.y / parentWorldScale.y);

        // 4. Positional Adjustment (Move to rear edge)
        // Adjust this factor if it sits too far forward or back
        const zShift = (origSize.z * 0.0) / parentWorldScale.z;
        customSpoiler.position.z += zShift;

        customSpoilerRef.current = customSpoiler;
        console.log(`Spoiler placed on ${originalMesh.name} at Y: ${customSpoiler.position.y}`);
      },
      undefined,
      (err) => {
        console.error("Failed to load custom spoiler:", err);
        originalMesh.visible = true;
        originalMesh.traverse((child) => { child.visible = true; });
      }
    );
  }, [spoilerReplacement]);

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
