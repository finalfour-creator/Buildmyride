/**
 * AR frame capture utilities.
 *
 * The AR view is a stack of a <video> element plus several <canvas> overlays
 * (segmentation paint, parts, Three.js 3D parts/decals), all positioned inset:0
 * over the camera container. To produce a single shareable image we composite
 * them, in DOM order, onto one 2D canvas.
 *
 * The Three.js renderers are created with preserveDrawingBuffer:true, so their
 * canvases can be read back via drawImage. The camera stream is same-origin
 * (getUserMedia), so the output canvas is not tainted and toBlob() works.
 */

/** Draw a media element (video) into ctx using object-fit: cover semantics. */
function drawCover(ctx, media, w, h) {
  const mw = media.videoWidth || media.width;
  const mh = media.videoHeight || media.height;
  if (!mw || !mh) return;
  const scale = Math.max(w / mw, h / mh);
  const dw = mw * scale;
  const dh = mh * scale;
  ctx.drawImage(media, (w - dw) / 2, (h - dh) / 2, dw, dh);
}

/**
 * Composite the camera feed + all overlay canvases inside `containerEl`
 * into a single PNG Blob.
 *
 * @param {HTMLElement} containerEl  the AR camera container
 * @returns {Promise<Blob>}
 */
export async function captureArFrame(containerEl) {
  if (!containerEl) throw new Error("captureArFrame: no container element");

  const rect = containerEl.getBoundingClientRect();
  const w = Math.round(rect.width);
  const h = Math.round(rect.height);
  if (!w || !h) throw new Error("captureArFrame: container has no size");

  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const out = document.createElement("canvas");
  out.width = Math.round(w * dpr);
  out.height = Math.round(h * dpr);
  const ctx = out.getContext("2d");
  ctx.scale(dpr, dpr);

  // 1. Base layer: the live camera frame (object-fit: cover).
  const video = containerEl.querySelector("video");
  if (video && video.videoWidth) {
    drawCover(ctx, video, w, h);
  } else {
    ctx.fillStyle = "#03060b";
    ctx.fillRect(0, 0, w, h);
  }

  // 2. Overlay layers: every canvas, in document order, stretched to the
  //    container box (overlay canvases are CSS-sized to inset:0).
  const canvases = containerEl.querySelectorAll("canvas");
  canvases.forEach((c) => {
    if (!c.width || !c.height) return;
    try {
      ctx.drawImage(c, 0, 0, w, h);
    } catch {
      /* skip any canvas that can't be read */
    }
  });

  return await new Promise((resolve, reject) => {
    out.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("toBlob returned null"))),
      "image/png",
    );
  });
}

/** Trigger a browser download for a Blob. */
export function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/**
 * Share a Blob via the Web Share API when available (mobile), otherwise fall
 * back to a download.
 *
 * @returns {Promise<"shared"|"downloaded">}
 */
export async function shareBlob(blob, { filename, title, text } = {}) {
  const name = filename || "buildmyride-ar.png";
  const file = new File([blob], name, { type: blob.type || "image/png" });

  if (
    typeof navigator !== "undefined" &&
    navigator.canShare &&
    navigator.canShare({ files: [file] })
  ) {
    try {
      await navigator.share({ files: [file], title, text });
      return "shared";
    } catch (err) {
      // User cancelled the share sheet — don't fall through to a download.
      if (err?.name === "AbortError") return "shared";
      throw err;
    }
  }

  downloadBlob(blob, name);
  return "downloaded";
}
