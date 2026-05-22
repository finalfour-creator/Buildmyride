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
