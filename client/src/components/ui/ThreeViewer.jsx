"use client";
import { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
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

    // Handle resize
    const handleResize = () => {
      if (!mountRef.current) return;
      const width = mountRef.current.clientWidth;
      const height = mountRef.current.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      if (mountRef.current) {
        mountRef.current.innerHTML = "";
      }
    };
  }, [modelPath, backgroundColor]);

  return (
    <Box
      ref={mountRef}
      sx={{
        width: "100%",
        height: "100%",
        minHeight: "450px",
        background: backgroundColor,
      }}
    />
  );
}
