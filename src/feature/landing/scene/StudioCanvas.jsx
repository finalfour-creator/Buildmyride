"use client";
import dynamic from "next/dynamic";
import { Canvas } from "@react-three/fiber";
import { ACESFilmicToneMapping, SRGBColorSpace } from "three";

const Scene = dynamic(() => import("./Scene"), { ssr: false });

export default function StudioCanvas() {
  return (
    <Canvas
      gl={{ antialias: true, alpha: true, outputColorSpace: SRGBColorSpace }}
      dpr={[1, 2]}
      shadows
      camera={{ position: [6, 2.5, 7], fov: 40, near: 0.01, far: 200 }}
      onCreated={({ gl }) => {
        gl.toneMapping = ACESFilmicToneMapping;
        gl.toneMappingExposure = 1.6;
      }}
    >
      <Scene />
    </Canvas>
  );
}
