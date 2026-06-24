/**
 * Map bounding box from video pixel space to container pixels (object-fit: cover).
 */
export function mapVideoBBoxToDisplay(bbox, videoWidth, videoHeight, containerWidth, containerHeight) {
  if (!bbox || !videoWidth || !videoHeight || !containerWidth || !containerHeight) {
    return null;
  }

  const videoAspect = videoWidth / videoHeight;
  const containerAspect = containerWidth / containerHeight;

  let renderWidth;
  let renderHeight;
  let offsetX = 0;
  let offsetY = 0;

  if (videoAspect > containerAspect) {
    renderHeight = containerHeight;
    renderWidth = containerHeight * videoAspect;
    offsetX = (containerWidth - renderWidth) / 2;
  } else {
    renderWidth = containerWidth;
    renderHeight = containerWidth / videoAspect;
    offsetY = (containerHeight - renderHeight) / 2;
  }

  const scaleX = renderWidth / videoWidth;
  const scaleY = renderHeight / videoHeight;

  return {
    left: bbox.x * scaleX + offsetX,
    top: bbox.y * scaleY + offsetY,
    width: bbox.width * scaleX,
    height: bbox.height * scaleY,
  };
}

export function lerpBBox(prev, next, factor = 0.25) {
  if (!next) return prev;
  if (!prev) return next;
  return {
    x: prev.x + (next.x - prev.x) * factor,
    y: prev.y + (next.y - prev.y) * factor,
    width: prev.width + (next.width - prev.width) * factor,
    height: prev.height + (next.height - prev.height) * factor,
    confidence: next.confidence ?? prev.confidence,
    source: next.source ?? prev.source,
  };
}

/** Centered demo bbox when YOLO model file is not present */
export function getDemoBBox(videoWidth, videoHeight) {
  const w = videoWidth * 0.72;
  const h = videoHeight * 0.42;
  return {
    x: (videoWidth - w) / 2,
    y: videoHeight * 0.32,
    width: w,
    height: h,
    confidence: 0.5,
    source: "demo",
  };
}

/**
 * Extract bounding box from pixel-level segmentation mask.
 * Samples pixels for efficiency.
 */
export function getMaskBBox(mask, vw, vh) {
  if (!mask || mask.length === 0) return null;
  let minX = vw;
  let maxX = 0;
  let minY = vh;
  let maxY = 0;
  let count = 0;

  // Sample every 4th pixel for speed
  for (let y = 0; y < vh; y += 4) {
    for (let x = 0; x < vw; x += 4) {
      const idx = y * vw + x;
      if (mask[idx] > 30) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
        count++;
      }
    }
  }

  if (count < 10) return null;
  return {
    x: minX,
    y: minY,
    width: maxX - minX,
    height: maxY - minY,
  };
}

/**
 * Unified getter for the car bounding box mapped to display container coordinates.
 * Prefers segmentation mask boundary if available, falls back to detection bounding box.
 */
export function getCarDisplayBox(carMask, bbox, vw, vh, cw, ch) {
  let videoBox = null;
  if (carMask) {
    videoBox = getMaskBBox(carMask, vw, vh);
  }
  if (!videoBox && bbox) {
    videoBox = bbox;
  }
  if (!videoBox) return null;

  return mapVideoBBoxToDisplay(videoBox, vw, vh, cw, ch);
}

/**
 * Centered mapping of a target aspect ratio inside a bounding box.
 */
export function fitAspectToBox(rect, aspect) {
  if (!rect) return null;
  const rectAspect = rect.width / rect.height;
  let w, h;
  if (rectAspect > aspect) {
    h = rect.height;
    w = rect.height * aspect;
  } else {
    w = rect.width;
    h = rect.width / aspect;
  }

  const cx = rect.left + rect.width / 2;
  const cy = rect.top + rect.height / 2;

  return {
    x: cx - w / 2,
    y: cy - h / 2,
    w,
    h,
    cx,
    cy,
  };
}
