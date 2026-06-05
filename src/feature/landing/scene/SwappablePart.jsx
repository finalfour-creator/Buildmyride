"use client";
import { useGLTF } from "@react-three/drei";
import { useMemo } from "react";
import FlyInWrapper from "./FlyInWrapper";

function PartMesh({ modelPath }) {
  const { scene } = useGLTF(modelPath);
  const cloned = useMemo(() => scene.clone(true), [scene]);
  return <primitive object={cloned} />;
}

export default function SwappablePart({ modelPath, triggerKey }) {
  if (!modelPath) return null;
  return (
    <FlyInWrapper triggerKey={triggerKey}>
      <PartMesh modelPath={modelPath} />
    </FlyInWrapper>
  );
}
