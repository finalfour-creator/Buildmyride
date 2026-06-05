"use client";
import { useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { useActiveCamKey } from "../hooks/useActiveCamKey";
import { CAM } from "../data/cameraKeyframes";
import { lerp } from "../hooks/useLerp";

export default function CameraRig() {
  const { camera } = useThree();
  const lookTarget = useRef(new THREE.Vector3(0, 0.3, 0));
  const curPos = useRef(new THREE.Vector3(...CAM.hero.pos));
  const curLook = useRef(new THREE.Vector3(...CAM.hero.look));
  const curFov = useRef(CAM.hero.fov);

  const activeKey = useActiveCamKey();

  useFrame((_, dt) => {
    const target = CAM[activeKey] || CAM.hero;
    const sp = Math.min(dt * 55 * 0.042, 0.1);

    curPos.current.x = lerp(curPos.current.x, target.pos[0], sp);
    curPos.current.y = lerp(curPos.current.y, target.pos[1], sp);
    curPos.current.z = lerp(curPos.current.z, target.pos[2], sp);

    curLook.current.x = lerp(curLook.current.x, target.look[0], sp);
    curLook.current.y = lerp(curLook.current.y, target.look[1], sp);
    curLook.current.z = lerp(curLook.current.z, target.look[2], sp);

    curFov.current = lerp(curFov.current, target.fov, sp);

    camera.position.copy(curPos.current);
    lookTarget.current.copy(curLook.current);
    camera.lookAt(lookTarget.current);
    camera.fov = curFov.current;
    camera.updateProjectionMatrix();
  });

  return null;
}
