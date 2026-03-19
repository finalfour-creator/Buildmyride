// "use client";
// import React, { useRef } from "react";
// import { useFrame } from "@react-three/fiber";

// export default function Road() {
//   const meshRef = useRef();
//   const stripsRef = useRef(); // Sirf strips ko move karne ke liye ref

//   useFrame((state, delta) => {
//     if (stripsRef.current) {
//       // Strips ko piche ki taraf move karna
//       stripsRef.current.position.z += 2 * delta;

//       // Infinite Loop: Jab strips 3 units (aapka set kiya hua gap) move kar lein, reset kar do
//       if (stripsRef.current.position.z > 3) {
//         stripsRef.current.position.z = 1;
//       }
//     }
//   });

//   return (
//     <>
//       {/* Main Road (Static - Jaisa aapne banaya tha)
//       <mesh 
//         rotation={[-Math.PI / 2, 0, 0]}
//         position={[0, -0.01, 0]}
//         ref={meshRef}
//      >
//         <planeGeometry args={[0.5, 1]} /> 
//         <meshStandardMaterial 
//           color="#222222"
//           roughness={0.8}
//           metalness={0.1}
//         />
//       </mesh> */}

//       {/* Moving Yellow Road Strips */}
//       <group ref={stripsRef}>
//         {Array.from({ length: 10 }).map((_, i) => (
//           <mesh
//             key={i}
//             rotation={[-Math.PI / 2, 0, 0]}
//             position={[0, 0, -i * 2]} // 3 units gap (Aapki logic)
//           >
//             <planeGeometry args={[0.01, 0.3]} /> {/* Width thodi wazay ki hai */}
//             <meshStandardMaterial 
//               color="#FFD700" 
//               emissive="#FFD700"
//               emissiveIntensity={0.2}
//             />
//           </mesh>
//         ))}
//       </group>
//     </>
//   );
// }