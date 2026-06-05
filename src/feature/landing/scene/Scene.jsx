"use client";
import { Suspense } from "react";
import CarModel from "./CarModel";
import CameraRig from "./CameraRig";
import LightingRig from "./LightingRig";
import Ground from "./Ground";

export default function Scene() {
  return (
    <>
      <color attach="background" args={["#080808"]} />
      <fog attach="fog" args={["#080808", 18, 40]} />
      <ambientLight color="#101018" intensity={0.6} />
      <LightingRig />
      <Ground />
      <Suspense fallback={null}>
        <CarModel />
      </Suspense>
      <CameraRig />
    </>
  );
}
