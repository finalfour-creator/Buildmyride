import * as THREE from "three";

// Create a decal mesh (plane) with basic UV mapping and alpha clipping.
// This is an MVP approach; for best results we rely on mask-derived alpha.
export function createDecalPlane({ texture, width, height }) {
  const geom = new THREE.PlaneGeometry(width, height);

  const mat = new THREE.MeshBasicMaterial({
    map: texture,
    transparent: true,
    depthWrite: false,
    polygonOffset: true,
    polygonOffsetFactor: -2,
    polygonOffsetUnits: -2,
  });

  const mesh = new THREE.Mesh(geom, mat);
  mesh.renderOrder = 2;
  return mesh;
}

export function textureLoader() {
  // Lazy singleton to avoid recreating loaders.
  if (!textureLoader._tl) textureLoader._tl = new THREE.TextureLoader();
  return textureLoader._tl;
}

// Compute bbox+centroid from a parts detection in video pixel coords.
export function bboxCentroid(det) {
  const x1 = det.x1 ?? 0;
  const y1 = det.y1 ?? 0;
  const x2 = det.x2 ?? 0;
  const y2 = det.y2 ?? 0;
  return {
    cx: (x1 + x2) / 2,
    cy: (y1 + y2) / 2,
    w: Math.max(1, x2 - x1),
    h: Math.max(1, y2 - y1),
  };
}

// Convert a video pixel position (in the same space as mapVideoBBoxToDisplay inputs)
// into overlay space for our orthographic camera.
// Uses the bbox mapping function for scale/position consistency.
export function computeOverlayFromVideoPoint({ videoRef, containerEl, x, y, videoW, videoH, bboxMap }) {
  // bboxMap is mapVideoBBoxToDisplay result for a bbox.
  // We approximate by converting point using bboxMap mapping of bbox.
  const cw = containerEl.clientWidth;
  const ch = containerEl.clientHeight;

  // Fallback: normalize point to container.
  const rect = bboxMap;
  if (rect?.width && rect?.height) {
    const px = rect.left + ((x - (videoW - 0)) / videoW) * rect.width; // crude
    const py = rect.top + ((y - 0) / videoH) * rect.height;

    const aspect = cw / ch;
    const cxN = px / cw;
    const cyN = py / ch;

    return {
      x: (cxN - 0.5) * 2 * aspect,
      y: -(cyN - 0.5) * 2,
    };
  }

  const aspect = cw / ch;
  const xn = x / videoW;
  const yn = y / videoH;
  return {
    x: (xn - 0.5) * 2 * aspect,
    y: -(yn - 0.5) * 2,
  };
}

