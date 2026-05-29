/**
 * Custom YOLOv8 car-parts detector — ONNX Runtime Web.
 * Model: public/models/yolov8-pt.onnx
 *
 * Class order matches the alphabetical folder names used during training.
 * If your training data.yaml lists them in a different order, update PART_CLASSES.
 */
import { getOrt } from "./onnxSetup";

export const PARTS_MODEL_URL = "/models/yolov8-pt.onnx";
const INPUT_SIZE      = 640;
const SCORE_THRESHOLD = 0.40;
const IOU_THRESHOLD   = 0.45;

// Update these to match your model's data.yaml class order exactly.
export const PART_CLASSES = [
  "Bumper",
  "Chassis",
  "Door",
  "Hood",
  "Lights",
  "Name_Plates",
  "Spoilers",
  "Trunk",
  "Wheels",
];

// Distinct colour per class — one per entry above
export const PART_COLORS = [
  "#ff6b35", // Bumper    — orange
  "#00d4ff", // Chassis   — cyan
  "#00d25a", // Door      — green
  "#ffd700", // Hood      — yellow
  "#ff69b4", // Lights    — pink
  "#a855f7", // Name_Plates — purple
  "#ef4444", // Spoilers  — red
  "#3b82f6", // Trunk     — blue
  "#14b8a6", // Wheels    — teal
];

// Module-level caches
let _partsSessionPromise = null;
let _partsModelAvailable = null;
let _prepCanvas = null, _prepCtx = null;
let _float32Buf = null; // Float32Array(3 × 640 × 640) — reused every frame

export async function checkPartsModelAvailable() {
  if (_partsModelAvailable !== null) return _partsModelAvailable;
  try {
    const res = await fetch(PARTS_MODEL_URL, { method: "HEAD" });
    _partsModelAvailable = res.ok;
  } catch {
    _partsModelAvailable = false;
  }
  return _partsModelAvailable;
}

async function getPartsSession() {
  if (!_partsSessionPromise) {
    _partsSessionPromise = (async () => {
      const ort = await getOrt();
      return ort.InferenceSession.create(PARTS_MODEL_URL, {
        executionProviders: ["webgpu", "webgl", "wasm"],
        graphOptimizationLevel: "all",
        enableMemPattern: true,
      });
    })();
  }
  return _partsSessionPromise;
}

// Letterbox resize — same approach as yoloCarSegmentation for accuracy
function preprocessWithLetterbox(video) {
  const vw = video.videoWidth;
  const vh = video.videoHeight;
  const scale = Math.min(INPUT_SIZE / vw, INPUT_SIZE / vh);
  const newW  = Math.round(vw * scale);
  const newH  = Math.round(vh * scale);
  const padX  = Math.round((INPUT_SIZE - newW) / 2);
  const padY  = Math.round((INPUT_SIZE - newH) / 2);

  if (!_prepCanvas) {
    _prepCanvas = document.createElement("canvas");
    _prepCanvas.width  = INPUT_SIZE;
    _prepCanvas.height = INPUT_SIZE;
    _prepCtx = _prepCanvas.getContext("2d", { willReadFrequently: true });
  }

  _prepCtx.fillStyle = "rgb(114,114,114)";
  _prepCtx.fillRect(0, 0, INPUT_SIZE, INPUT_SIZE);
  _prepCtx.drawImage(video, padX, padY, newW, newH);

  const { data } = _prepCtx.getImageData(0, 0, INPUT_SIZE, INPUT_SIZE);
  const N = INPUT_SIZE * INPUT_SIZE;
  if (!_float32Buf) _float32Buf = new Float32Array(3 * N);
  for (let i = 0; i < N; i++) {
    _float32Buf[i]         = data[i * 4]     / 255;
    _float32Buf[N + i]     = data[i * 4 + 1] / 255;
    _float32Buf[N * 2 + i] = data[i * 4 + 2] / 255;
  }

  return { float32: _float32Buf, scale, padX, padY, vw, vh };
}

function calcIou(a, b) {
  const x1 = Math.max(a.x1, b.x1), y1 = Math.max(a.y1, b.y1);
  const x2 = Math.min(a.x2, b.x2), y2 = Math.min(a.y2, b.y2);
  const inter = Math.max(0, x2 - x1) * Math.max(0, y2 - y1);
  const aA = (a.x2 - a.x1) * (a.y2 - a.y1);
  const aB = (b.x2 - b.x1) * (b.y2 - b.y1);
  return inter / (aA + aB - inter + 1e-6);
}

// Per-class NMS — keeps the best box per class rather than global NMS,
// so we can have e.g. one Door box AND one Hood box simultaneously.
function nmsPerClass(candidates) {
  const byClass = {};
  for (const c of candidates) {
    (byClass[c.classId] ??= []).push(c);
  }
  const kept = [];
  for (const list of Object.values(byClass)) {
    const sorted = [...list].sort((a, b) => b.score - a.score);
    const klassKept = [];
    for (const det of sorted) {
      if (klassKept.every((k) => calcIou(k, det) < IOU_THRESHOLD)) {
        klassKept.push(det);
      }
    }
    kept.push(...klassKept);
  }
  return kept;
}

/**
 * Run the custom parts model on one video frame.
 *
 * Returns an array of detections:
 *   { classId, className, color, x1, y1, x2, y2, score }
 * Coordinates are in video-pixel space (not scaled to display).
 * Returns null when nothing is detected above the threshold.
 */
export async function detectPartsInVideoFrame(video) {
  if (!video?.videoWidth) return null;

  const [session, ort] = await Promise.all([getPartsSession(), getOrt()]);
  const { float32, scale, padX, padY, vw, vh } = preprocessWithLetterbox(video);

  const tensor  = new ort.Tensor("float32", float32, [1, 3, INPUT_SIZE, INPUT_SIZE]);
  const outputs = await session.run({ [session.inputNames[0]]: tensor });
  const det     = outputs[session.outputNames[0]];

  // output0: [1, 4+numCls, numAnchors]
  const numAnchors = det.dims[2];
  const numCh      = det.dims[1];
  const numCls     = numCh - 4;
  const data       = det.data;

  const candidates = [];

  for (let d = 0; d < numAnchors; d++) {
    const cx = data[0 * numAnchors + d];
    const cy = data[1 * numAnchors + d];
    const bw = data[2 * numAnchors + d];
    const bh = data[3 * numAnchors + d];

    let bestCls = -1, bestScore = 0;
    for (let c = 0; c < numCls; c++) {
      const s = data[(4 + c) * numAnchors + d];
      if (s > bestScore) { bestScore = s; bestCls = c; }
    }

    if (bestCls < 0 || bestScore < SCORE_THRESHOLD) continue;

    // Un-letterbox: remove padding offset, undo scale
    const x1 = Math.max(0,  (cx - bw / 2 - padX) / scale);
    const y1 = Math.max(0,  (cy - bh / 2 - padY) / scale);
    const x2 = Math.min(vw, (cx + bw / 2 - padX) / scale);
    const y2 = Math.min(vh, (cy + bh / 2 - padY) / scale);

    candidates.push({
      classId:   bestCls,
      className: PART_CLASSES[bestCls] ?? `Class ${bestCls}`,
      color:     PART_COLORS[bestCls % PART_COLORS.length],
      x1, y1, x2, y2,
      score: bestScore,
    });
  }

  const kept = nmsPerClass(candidates);
  return kept.length > 0 ? kept : null;
}

export function resetPartsSession() {
  _partsSessionPromise = null;
  _partsModelAvailable = null;
  _prepCanvas = null;
  _prepCtx    = null;
  _float32Buf = null;
}
