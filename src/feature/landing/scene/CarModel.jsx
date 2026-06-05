"use client";
import { useRef, useMemo, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { useAppSelector } from "@/store/hooks";
import { useActiveCamKey } from "../hooks/useActiveCamKey";
import { CAR_YAWS } from "../data/cameraKeyframes";
import { CHASSIS_DATA } from "../data/chassis";
import { lerp } from "../hooks/useLerp";

const MODEL_PATH = "/models/Honda-Civic.glb";
useGLTF.preload(MODEL_PATH);

const looksLikeBody = (name) => {
  if (!name) return false;
  const n = name.toLowerCase();
  return /body|paint|chassis|exterior|shell|panel|roof|hood|door|fender|trunk|bumper|cabin/.test(
    n
  );
};

const looksLikeWheel = (name) => {
  if (!name) return false;
  return /wheel/i.test(name) && !/well|arch/i.test(name);
};

export default function CarModel() {
  const { scene } = useGLTF(MODEL_PATH);
  const group = useRef();
  const yawRef = useRef(0);
  const wheelRotRef = useRef(0);

  const chassisId = useAppSelector((s) => s.build.chassis);
  const activeKey = useActiveCamKey();

  const cloned = useMemo(() => {
    const c = scene.clone(true);
    c.traverse((o) => {
      if (o.isMesh) {
        o.castShadow = true;
        o.receiveShadow = true;
        if (o.material) {
          // Clone material so we don't mutate the cached scene's shared material
          o.material = o.material.clone();
        }
      }
    });
    return c;
  }, [scene]);

  // Apply chassis tint on chassis selection
  useEffect(() => {
    if (!cloned) return;
    const chassis = CHASSIS_DATA.find((c) => c.id === chassisId);
    if (!chassis) return;
    const color = new THREE.Color(chassis.color);
    cloned.traverse((o) => {
      if (o.isMesh && o.material && looksLikeBody(o.name) && !looksLikeWheel(o.name)) {
        if (o.material.color) {
          o.material.color.copy(color);
          o.material.needsUpdate = true;
        }
      }
    });
  }, [chassisId, cloned]);

  useFrame((state, dt) => {
    if (!group.current) return;
    const t = state.clock.elapsedTime;
    // Slow vertical float
    group.current.position.y = Math.sin(t * 0.5) * 0.032;

    // Yaw lerp toward target
    const targetYaw = CAR_YAWS[activeKey] ?? 0;
    yawRef.current = lerp(yawRef.current, targetYaw, Math.min(dt * 2.5, 0.08));
    group.current.rotation.y = yawRef.current;

    // Wheel spin
    wheelRotRef.current += 0.009 * 60 * dt;
    cloned.traverse((o) => {
      if (looksLikeWheel(o.name)) {
        o.rotation.x = wheelRotRef.current;
      }
    });
  });

  return (
    <group ref={group} position={[0, 0, 0]} scale={1.1}>
      <primitive object={cloned} />
    </group>
  );
}
