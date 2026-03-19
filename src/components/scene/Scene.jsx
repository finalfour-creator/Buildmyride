"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { Stage, useGLTF } from "@react-three/drei";
import { Suspense, useRef, useEffect } from "react";
// import Road from "@/components/road/Road";

function Model({ modelPosition = [0, 0, 0], carColor }) {
  const { scene } = useGLTF("/models/Honda-Civic.glb");

  const modelRef = useRef();
  const wheelsRef = useRef([]);

  // Change car color
  useEffect(() => {
    if (!scene) return;

    scene.traverse((child) => {
      if (child.isMesh && child.material) {
        if (child.material.color && carColor) {
          child.material.color.set(carColor);
        }

        // Detect wheels (depends on model naming)
        if (
          child.name.toLowerCase().includes("wheel") ||
          child.name.toLowerCase().includes("tire")
        ) {
          wheelsRef.current.push(child);
        }
      }
    });
  }, [scene, carColor]);

  // Animate wheels
  useFrame((state, delta) => {
    wheelsRef.current.forEach((wheel) => {
      wheel.rotation.x -= 5 * delta;
    });
  });

  return (
    <group position={modelPosition}>
      <primitive ref={modelRef} object={scene} />
    </group>
  );
}

export default function Scene({
  cameraPosition = [5, 0.5, 0],
  cameraFov = 2.5,
  modelPosition = [0, 0, 0],
  showRoad = true,
  carColor,
}) {
  return (
    <Canvas
      style={{ height: "600px" }}
      camera={{ position: cameraPosition, fov: cameraFov }}
    >
      <Suspense fallback={null}>
        <Stage environment="city" intensity={0}>
          <Model carColor={carColor} modelPosition={modelPosition} />
        </Stage>

        {/* {showRoad && <Road />} */}
      </Suspense>
    </Canvas>
  );
}