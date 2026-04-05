

"use client";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { Box, Typography, CircularProgress } from "@mui/material";

export default function ThreeViewer({
  modelPath = "/models/Honda-Civic.glb",
  backgroundColor = "#ffffff",
  modelColor = null,
  sx = {},
}) {
  const mountRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const modelRef = useRef(null);
  const controlsRef = useRef(null);
  const animFrameRef = useRef(null);

  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  // ── Scene setup ───────────────────────────────────────────────────────────
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 600;
    const height = container.clientHeight || 450;

    const scene = new THREE.Scene();
    // "transparent" background means we let the page background show through
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

    // Load model here, inside scene setup, so scene is guaranteed to exist
    setLoading(true);
    setError(null);

    let isMounted = true;
    const loader = new GLTFLoader();

    loader.load(
      modelPath,
      (gltf) => {
        if (!isMounted || !sceneRef.current) return;

        if (modelRef.current) {
          sceneRef.current.remove(modelRef.current);
          modelRef.current = null;
        }

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
      undefined,
      (err) => {
        if (!isMounted) return;
        console.error("Error loading model:", err);
        setError(`Failed to load model: ${err.message}`);
        setLoading(false);
      }
    );

    return () => {
      isMounted = false;
      cancelAnimationFrame(animFrameRef.current);
      window.removeEventListener("resize", handleResize);
      // Null refs before DOM removal so any stale callbacks bail safely
      sceneRef.current = null;
      cameraRef.current = null;
      controlsRef.current = null;
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
      rendererRef.current = null;
    };
  // Re-run only when these props change (model path triggers re-mount of whole scene)
  }, [backgroundColor, modelPath]);

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
      {/*
        Canvas container — ALWAYS rendered so mountRef is always attached.
        The scene useEffect can safely read mountRef.current on every run.
      */}
      <Box ref={mountRef} sx={{ width: "100%", height: "100%", minHeight: 450 }} />

      {/* Loading overlay — sits on top, disappears when done */}
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
