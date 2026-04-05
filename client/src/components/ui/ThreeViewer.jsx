

// "use client";
// import { useEffect, useRef, useState } from "react";
// import * as THREE from "three";
// import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
// import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
// import { Box, Typography } from "@mui/material";

// export default function ThreeViewer({ 
//   modelPath = "/models/Honda-Civic.glb",
//   backgroundColor = "#ffffff",
//   modelColor = null 
// }) {
//   const mountRef = useRef(null);
//   const sceneRef = useRef(null);
//   const cameraRef = useRef(null);
//   const rendererRef = useRef(null);
//   const modelRef = useRef(null);
//   const controlsRef = useRef(null);
//   const [error, setError] = useState(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     if (!mountRef.current) return;

//     const container = mountRef.current;
//     const width = container.clientWidth;
//     const height = container.clientHeight;

//     // Scene
//     const scene = new THREE.Scene();
//     scene.background = new THREE.Color(backgroundColor);
//     sceneRef.current = scene;

//     // Camera
//     const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
//     camera.position.set(3, 1.5, 4);
//     camera.lookAt(0, 0.2, 0);
//     cameraRef.current = camera;

//     // Renderer
//     const renderer = new THREE.WebGLRenderer({ antialias: true });
//     renderer.setSize(width, height);
//     renderer.setPixelRatio(window.devicePixelRatio);
//     renderer.shadowMap.enabled = true;
//     container.appendChild(renderer.domElement);
//     rendererRef.current = renderer;

//     // Controls
//     const controls = new OrbitControls(camera, renderer.domElement);
//     controls.enableDamping = true;
//     controls.dampingFactor = 0.05;
//     controls.autoRotate = false;
//     controls.enableZoom = true;
//     controls.enablePan = true;
//     controls.zoomSpeed = 1;
//     controls.rotateSpeed = 1;
//     controls.target.set(0, 0.2, 0);
//     controlsRef.current = controls;

//     // Lighting
//     const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
//     scene.add(ambientLight);

//     const mainLight = new THREE.DirectionalLight(0xffffff, 1);
//     mainLight.position.set(3, 5, 2);
//     mainLight.castShadow = true;
//     scene.add(mainLight);

//     const fillLight = new THREE.DirectionalLight(0xffffff, 0.5);
//     fillLight.position.set(-2, 2, 2);
//     scene.add(fillLight);

//     const backLight = new THREE.PointLight(0xffffff, 0.4);
//     backLight.position.set(0, 1, -3);
//     scene.add(backLight);

//     const rimLight = new THREE.PointLight(0xffaa66, 0.4);
//     rimLight.position.set(1.5, 1.2, -2.5);
//     scene.add(rimLight);

//     // Ground shadow helper
//     const shadowPlane = new THREE.Mesh(
//       new THREE.PlaneGeometry(5, 5),
//       new THREE.ShadowMaterial({ opacity: 0.2, color: 0x000000, transparent: true })
//     );
//     shadowPlane.rotation.x = -Math.PI / 2;
//     shadowPlane.position.y = -0.55;
//     shadowPlane.receiveShadow = true;
//     scene.add(shadowPlane);

//     // Grid helper (optional, for reference)
//     const gridHelper = new THREE.GridHelper(5, 20, 0xcccccc, 0xaaaaaa);
//     gridHelper.position.y = -0.55;
//     gridHelper.material.transparent = true;
//     gridHelper.material.opacity = 0.3;
//     scene.add(gridHelper);

//     // Animation loop
//     const animate = () => {
//       requestAnimationFrame(animate);
//       controls.update();
//       renderer.render(scene, camera);
//     };
//     animate();

//     // Handle resize
//     const handleResize = () => {
//       if (!mountRef.current) return;
//       const newWidth = mountRef.current.clientWidth;
//       const newHeight = mountRef.current.clientHeight;
//       if (newWidth === 0 || newHeight === 0) return;
      
//       camera.aspect = newWidth / newHeight;
//       camera.updateProjectionMatrix();
//       renderer.setSize(newWidth, newHeight);
//     };
    
//     window.addEventListener("resize", handleResize);
//     // Initial resize call
//     setTimeout(handleResize, 100);

//     // Cleanup
//     return () => {
//       window.removeEventListener("resize", handleResize);
//       if (mountRef.current && renderer.domElement) {
//         mountRef.current.removeChild(renderer.domElement);
//       }
//       renderer.dispose();
//     };
//   }, [backgroundColor]);

//   // Load model
//   useEffect(() => {
//     if (!modelPath) return;

//     setLoading(true);
//     const loader = new GLTFLoader();
//     console.log("Loading model from:", modelPath);
    
//     loader.load(
//       modelPath,
//       (gltf) => {
//         console.log("Model loaded successfully!");
//         if (modelRef.current && sceneRef.current) {
//           sceneRef.current.remove(modelRef.current);
//         }

//         const model = gltf.scene;
        
//         // Enable shadows
//         model.traverse((node) => {
//           if (node.isMesh) {
//             node.castShadow = true;
//             node.receiveShadow = true;
//           }
//         });
        
//         // Center and scale the model
//         const box = new THREE.Box3().setFromObject(model);
//         const center = box.getCenter(new THREE.Vector3());
//         const size = box.getSize(new THREE.Vector3());
//         const maxDim = Math.max(size.x, size.y, size.z);
//         const targetSize = 1.8;
//         const scale = targetSize / maxDim;
        
//         model.scale.set(scale, scale, scale);
        
//         const minY = box.min.y;
//         model.position.set(
//           -center.x * scale,
//           -minY * scale - 0.45,
//           -center.z * scale
//         );

//         sceneRef.current.add(model);
//         modelRef.current = model;
//         setError(null);
//         setLoading(false);
        
//         // Update controls target
//         setTimeout(() => {
//           if (controlsRef.current) {
//             controlsRef.current.target.set(0, 0.3, 0);
//             controlsRef.current.update();
//           }
//         }, 50);
//       },
//       (progress) => {
//         console.log("Loading progress:", Math.round(progress.loaded / progress.total * 100) + "%");
//       },
//       (error) => {
//         console.error("Error loading model:", error);
//         setError(`Failed to load model: ${error.message}`);
//         setLoading(false);
//       }
//     );
//   }, [modelPath]);

//   // Apply color when modelColor changes
//   useEffect(() => {
//     if (modelColor && modelRef.current) {
//       modelRef.current.traverse((node) => {
//         if (node.isMesh && node.material) {
//           if (Array.isArray(node.material)) {
//             node.material.forEach(mat => mat.color.set(modelColor));
//           } else {
//             node.material.color.set(modelColor);
//           }
//         }
//       });
//     }
//   }, [modelColor]);

//   if (error) {
//     return (
//       <Box sx={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: backgroundColor }}>
//         <Typography color="error">{error}</Typography>
//       </Box>
//     );
//   }

//   if (loading) {
//     return (
//       <Box sx={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: backgroundColor }}>
//         <Typography sx={{ color: "#6b7c88" }}>Loading 3D Model...</Typography>
//       </Box>
//     );
//   }

//   return (
//     <Box
//       ref={mountRef}
//       sx={{
//         width: "100%",
//         height: "100%",
//         minHeight: "450px",
//         background: backgroundColor,
//         position: "relative",
//       }}
//     />
//   );
// }

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
    scene.background = new THREE.Color(backgroundColor);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(3, 1.5, 4);
    camera.lookAt(0, 0.2, 0);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true });
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