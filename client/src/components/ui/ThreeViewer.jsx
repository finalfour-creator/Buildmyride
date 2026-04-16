"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { Box, Typography, CircularProgress } from "@mui/material";

// ── Helpers ──────────────────────────────────────────────────────────────────

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

  // Collect candidates — include "tyre" (British spelling)
  model.traverse((node) => {
    if (node.isMesh || node.isGroup) {
      const n = (node.name || "").toLowerCase();
      if (n.includes("wheel") || n.includes("tire") || n.includes("tyre") || n.includes("rim")) {
        candidates.push(node);
      }
    }
  });

  if (candidates.length === 0) {
    console.warn("No wheel meshes found by name.");
    return new Map();
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

// ── Component ────────────────────────────────────────────────────────────────

export default function ThreeViewer({
  modelPath,
  backgroundColor = "#ffffff",
  modelColor = null,
  wheelReplacements = {},   // { "front-left": "/url.glb" | null, ... }
  onWheelClick = null,      // (positionId: string) => void
  sx = {},
}) {
  const mountRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const modelRef = useRef(null);
  const controlsRef = useRef(null);
  const animFrameRef = useRef(null);

  // Wheel-related refs
  const wheelMeshMapRef = useRef(new Map());       // positionId → original mesh
  const originalWheelDataRef = useRef(new Map());  // positionId → { position, quaternion, scale, parent }
  const customWheelsRef = useRef(new Map());       // positionId → loaded custom mesh
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

        // ── Discover wheel meshes ──────────────────────────────────────
        // Wait one frame so world matrices are updated after scaling/positioning
        requestAnimationFrame(() => {
          model.updateMatrixWorld(true);
          const posMap = discoverWheelMeshes(model);
          wheelMeshMapRef.current = posMap;

          // Store original transforms for each wheel
          for (const [posId, node] of posMap) {
            originalWheelDataRef.current.set(posId, {
              position: node.position.clone(),
              quaternion: node.quaternion.clone(),
              scale: node.scale.clone(),
              parent: node.parent,
              visible: node.visible,
            });
          }
          console.log("Wheel mesh map ready:", Object.fromEntries(posMap));
        });

        // Apply initial color
        if (modelColor) {
          model.traverse((node) => {
            if (node.isMesh && node.material) {
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

  // ── Color updates ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (!modelColor || !modelRef.current) return;
    modelRef.current.traverse((node) => {
      if (node.isMesh && node.material) {
        const mats = Array.isArray(node.material) ? node.material : [node.material];
        mats.forEach((m) => m.color && m.color.set(modelColor));
      }
    });
  }, [modelColor]);

  // ── Wheel replacement effect ──────────────────────────────────────────────
  useEffect(() => {
    if (!sceneRef.current) return;
    if (wheelMeshMapRef.current.size === 0) return;

    const loader = new GLTFLoader();

    for (const [posId, wheelUrl] of Object.entries(wheelReplacements)) {
      const originalData = originalWheelDataRef.current.get(posId);
      const originalMesh = wheelMeshMapRef.current.get(posId);
      if (!originalMesh || !originalData) {
        console.warn(`No original wheel data for position "${posId}"`);
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

      // ── Compute original bounding box BEFORE hiding ──
      // Temporarily ensure original is visible for correct bbox
      originalMesh.visible = true;
      originalMesh.traverse((child) => { child.visible = true; });
      originalMesh.updateMatrixWorld(true);

      const origBox = new THREE.Box3().setFromObject(originalMesh);
      const origSize = origBox.getSize(new THREE.Vector3());
      const origCenter = origBox.getCenter(new THREE.Vector3());

      console.log(`[${posId}] Original wheel bbox size:`, origSize, "center:", origCenter);

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

          // Measure the custom wheel's natural size (in its own local space)
          const customBox = new THREE.Box3().setFromObject(customWheel);
          const customSize = customBox.getSize(new THREE.Vector3());
          console.log(`[${posId}] Custom wheel natural size:`, customSize);

          // origSize is in WORLD space (includes parent's scale).
          // customSize is in LOCAL space (no parent yet).
          // When we add customWheel to the parent, parentScale is applied again.
          // So we must divide fitScale by parentScale to avoid double-scaling.
          const parentWorldScale = new THREE.Vector3(1, 1, 1);
          if (originalData.parent) {
            originalData.parent.getWorldScale(parentWorldScale);
          }
          console.log(`[${posId}] Parent world scale:`, parentWorldScale);

          if (customSize.x > 0 && customSize.y > 0 && customSize.z > 0) {
            const fitScale = Math.min(
              origSize.x / customSize.x,
              origSize.y / customSize.y,
              origSize.z / customSize.z
            );
            // Divide by parent's world scale to compensate for it being applied again
            const correctedScale = fitScale / parentWorldScale.x;
            customWheel.scale.setScalar(correctedScale);
            console.log(`[${posId}] Fit scale: ${fitScale}, corrected: ${correctedScale}`);
          }

          // Copy the original's rotation
          customWheel.quaternion.copy(originalData.quaternion);

          // Add as sibling of the original (same parent → inherits car transforms)
          if (originalData.parent) {
            originalData.parent.add(customWheel);
          } else {
            sceneRef.current.add(customWheel);
          }

          // ── Align centers: position custom wheel so its bbox center
          //    matches the original wheel's bbox center in world space ──
          customWheel.position.set(0, 0, 0); // reset first
          customWheel.updateMatrixWorld(true);

          // Where the custom wheel's center is NOW in world space
          const currentCustomBox = new THREE.Box3().setFromObject(customWheel);
          const currentCustomCenter = currentCustomBox.getCenter(new THREE.Vector3());

          // World-space offset needed to align centers
          const worldOffset = new THREE.Vector3().subVectors(origCenter, currentCustomCenter);

          // Convert world offset to parent-local space (divide by parent's scale)
          customWheel.position.set(
            worldOffset.x / parentWorldScale.x,
            worldOffset.y / parentWorldScale.y,
            worldOffset.z / parentWorldScale.z
          );
          console.log(`[${posId}] Aligned center. World offset:`, worldOffset, `Local pos:`, customWheel.position);

          customWheelsRef.current.set(posId, customWheel);
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
}
