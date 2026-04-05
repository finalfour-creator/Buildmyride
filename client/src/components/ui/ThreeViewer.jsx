"use client";
import { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { Box } from "@mui/material";

export default function ThreeViewer({ modelPath, backgroundColor = "#ffffff", modelColor = null }) {
  const mountRef = useRef(null);

  useEffect(() => {
    if (!mountRef.current) return;

    // === EXACT CODE FROM WORKING TEST PAGE ===
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(backgroundColor);

    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 1000);
    camera.position.set(3, 2, 4);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    mountRef.current.innerHTML = "";
    mountRef.current.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.target.set(0, 0.5, 0);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);
    
    const dirLight = new THREE.DirectionalLight(0xffffff, 1);
    dirLight.position.set(2, 3, 2);
    scene.add(dirLight);

    const backLight = new THREE.PointLight(0xffffff, 0.4);
    backLight.position.set(0, 1, -2);
    scene.add(backLight);

    // Grid helper to see ground
    const gridHelper = new THREE.GridHelper(5, 20, 0x888888, 0x444444);
    gridHelper.position.y = -0.5;
    scene.add(gridHelper);

    // Load model with AUTO SCALING
    const loader = new GLTFLoader();
    loader.load(
      modelPath,
      (gltf) => {
        console.log("✅ Model loaded!");
        const model = gltf.scene;
        
        // Calculate bounding box to get actual size
        const box = new THREE.Box3().setFromObject(model);
        const size = box.getSize(new THREE.Vector3());
        const center = box.getCenter(new THREE.Vector3());
        
        console.log("Original size:", size);
        console.log("Original center:", center);
        
        // Calculate scale to make height = 1.2 units
        const targetHeight = 1.2;
        const scale = targetHeight / size.y;
        
        model.scale.set(scale, scale, scale);
        
        // Position so bottom sits on ground (y = -0.5)
        const minY = box.min.y;
        model.position.set(
          -center.x * scale,
          -minY * scale - 0.5,
          -center.z * scale
        );
        
        // Apply color if provided
        if (modelColor) {
          model.traverse((node) => {
            if (node.isMesh && node.material) {
              if (Array.isArray(node.material)) {
                node.material.forEach(mat => mat.color.set(modelColor));
              } else {
                node.material.color.set(modelColor);
              }
            }
          });
        }
        
        scene.add(model);
        
        // Log final size for debugging
        const newBox = new THREE.Box3().setFromObject(model);
        console.log("Final size:", newBox.getSize(new THREE.Vector3()));
        
        // Adjust controls target to center of model
        controls.target.set(0, 0.6, 0);
        controls.update();
      },
      (xhr) => {
        console.log(Math.round(xhr.loaded / xhr.total * 100) + "% loaded");
      },
      (error) => {
        console.error("❌ Error:", error);
      }
    );

    const animate = () => {
      requestAnimationFrame(animate);
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

  // ── Model loading ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (!modelPath) return;

    let isMounted = true;
    setLoading(true);
    setError(null);

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

        // Apply any pending color
        if (modelColor) {
          model.traverse((node) => {
            if (node.isMesh && node.material) {
              const mats = Array.isArray(node.material) ? node.material : [node.material];
              mats.forEach((m) => m.color.set(modelColor));
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
      if (modelRef.current && sceneRef.current) {
        sceneRef.current.remove(modelRef.current);
        modelRef.current = null;
      }
    };
  }, [modelPath]);

  // ── Color updates ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (!modelColor || !modelRef.current) return;
    modelRef.current.traverse((node) => {
      if (node.isMesh && node.material) {
        const mats = Array.isArray(node.material) ? node.material : [node.material];
        mats.forEach((m) => m.color.set(modelColor));
      }
    });
  }, [modelColor]);

  return (
    <Box
      sx={{
        width: "100%",
        height: "100%",
        minHeight: 450,
        position: "relative",
        background: backgroundColor,
      }}
    >
      {/* Canvas — always mounted so WebGL context is never destroyed */}
      <Box
        ref={mountRef}
        sx={{ width: "100%", height: "100%", minHeight: 450 }}
      />

      {/* Loading overlay on top of the canvas — fades away when done */}
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
            background: backgroundColor,
            zIndex: 2,
          }}
        >
          <CircularProgress size={32} sx={{ color: "#2c5364" }} />
          <Typography sx={{ color: "#6b7c88", fontSize: 14 }}>
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
            background: backgroundColor,
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