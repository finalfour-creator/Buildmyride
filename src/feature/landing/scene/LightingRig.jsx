"use client";
import { useRef, useMemo } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { useActiveCamKey } from "../hooks/useActiveCamKey";
import { LIGHTS } from "../data/cameraKeyframes";
import { lerp, lerpColor } from "../hooks/useLerp";

export default function LightingRig() {
  const { camera } = useThree();
  const keyRef = useRef();
  const fillRef = useRef();
  const rimRef = useRef();

  const targets = useMemo(
    () => ({
      key: new THREE.Color(LIGHTS.hero.key),
      fill: new THREE.Color(LIGHTS.hero.fill),
      rim: new THREE.Color(LIGHTS.hero.rim),
      keyI: LIGHTS.hero.keyI,
      fillI: LIGHTS.hero.fillI,
      rimI: LIGHTS.hero.rimI,
    }),
    []
  );

  const activeKey = useActiveCamKey();

  useFrame((_, dt) => {
    const target = LIGHTS[activeKey] || LIGHTS.hero;
    const sp = Math.min(dt * 55 * 0.042, 0.1);

    targets.key.lerp(new THREE.Color(target.key), sp);
    targets.fill.lerp(new THREE.Color(target.fill), sp);
    targets.rim.lerp(new THREE.Color(target.rim), sp);
    targets.keyI = lerp(targets.keyI, target.keyI, sp);
    targets.fillI = lerp(targets.fillI, target.fillI, sp);
    targets.rimI = lerp(targets.rimI, target.rimI, sp);

    if (keyRef.current) {
      keyRef.current.color.copy(targets.key);
      keyRef.current.intensity = targets.keyI;
      keyRef.current.position.set(
        camera.position.x * 0.4 + 5,
        10,
        camera.position.z * 0.3 + 4
      );
    }
    if (fillRef.current) {
      fillRef.current.color.copy(targets.fill);
      fillRef.current.intensity = targets.fillI;
    }
    if (rimRef.current) {
      rimRef.current.color.copy(targets.rim);
      rimRef.current.intensity = targets.rimI;
    }
    // suppress unused-var lint for lerpColor when not used elsewhere
    void lerpColor;
  });

  return (
    <>
      <directionalLight
        ref={keyRef}
        color="#ffd5a0"
        intensity={4}
        position={[6, 10, 6]}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-camera-left={-8}
        shadow-camera-right={8}
        shadow-camera-top={6}
        shadow-camera-bottom={-6}
        shadow-camera-near={0.5}
        shadow-camera-far={40}
        shadow-bias={-0.001}
      />
      <directionalLight
        ref={fillRef}
        color="#8090ff"
        intensity={1.2}
        position={[-6, 3, -4]}
      />
      <directionalLight
        ref={rimRef}
        color="#ff6030"
        intensity={0.8}
        position={[-3, 2, -8]}
      />
    </>
  );
}
