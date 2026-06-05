"use client";

export default function Ground() {
  return (
    <>
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -1.05, 0]}
        receiveShadow
      >
        <planeGeometry args={[30, 30]} />
        <meshStandardMaterial color="#090909" metalness={0.5} roughness={0.85} />
      </mesh>
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -1.04, 0]}
        receiveShadow
      >
        <planeGeometry args={[7.5, 3]} />
        <meshStandardMaterial color="#111111" metalness={0.88} roughness={0.18} />
      </mesh>
    </>
  );
}
