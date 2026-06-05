"use client";
import { useRef, useEffect } from "react";
import { useFrame } from "@react-three/fiber";

export default function FlyInWrapper({ children, triggerKey }) {
  const group = useRef();
  const yOffset = useRef(4);
  const opacity = useRef(0);
  const startedAt = useRef(0);

  useEffect(() => {
    yOffset.current = 4;
    opacity.current = 0;
    startedAt.current = performance.now();
  }, [triggerKey]);

  useFrame(() => {
    if (!group.current) return;
    const elapsed = (performance.now() - startedAt.current) / 750;
    const t = Math.min(1, Math.max(0, elapsed));
    // Cubic-out easing
    const e = 1 - Math.pow(1 - t, 3);
    yOffset.current = 4 * (1 - e);
    opacity.current = e;
    group.current.position.y = yOffset.current;
    group.current.traverse((o) => {
      if (o.isMesh && o.material) {
        o.material.transparent = true;
        o.material.opacity = opacity.current;
      }
    });
  });

  return <group ref={group}>{children}</group>;
}
