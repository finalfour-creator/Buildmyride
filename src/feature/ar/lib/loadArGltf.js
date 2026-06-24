import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

const loader = new GLTFLoader();

export function loadGltf(url) {
  return new Promise((resolve, reject) => {
    loader.load(url, (gltf) => resolve(gltf.scene), undefined, reject);
  });
}

export function applyPaintColor(object, hexColor) {
  if (!object || !hexColor) return;
  object.traverse((node) => {
    if (!node.isMesh || !node.material) return;
    const name = (node.name || "").toLowerCase();
    const skip =
      name.includes("glass") ||
      name.includes("light") ||
      name.includes("tire") ||
      name.includes("tyre") ||
      name.includes("wheel") ||
      name.includes("chrome");
    if (skip) return;
    const mats = Array.isArray(node.material) ? node.material : [node.material];
    mats.forEach((m) => {
      if (m.color) m.color.set(hexColor);
    });
  });
}

export function enableShadows(object) {
  object.traverse((child) => {
    if (child.isMesh) {
      child.castShadow = true;
      child.receiveShadow = true;
    }
  });
}

export function fitToMaxDimension(object, targetMax) {
  const box = new THREE.Box3().setFromObject(object);
  const size = box.getSize(new THREE.Vector3());
  const center = box.getCenter(new THREE.Vector3());
  object.position.x -= center.x;
  object.position.y -= center.y;
  object.position.z -= center.z;
  const maxDim = Math.max(size.x, size.y, size.z, 0.001);
  object.scale.setScalar(targetMax / maxDim);
  return object;
}
