/**
 * YOLOv8-seg car-parts detector — ONNX Runtime Web.
 * Model: public/models/yolov8-seg(parts).onnx  (18-class segmentation model)
 *
 * Returns per-part pixel-accurate masks using the same prototype-mask pipeline
 * as yoloCarSegmentation.js, but applied independently per detected part.
 */
import { getOrt, tryAcquireOnnxLock, releaseOnnxLock, INFERENCE_SKIPPED } from "./onnxSetup";

export const PARTS_MODEL_URL = "/models/yolov8-seg(parts).onnx";
const INPUT_SIZE      = 640;
const MASK_DIM        = 160;
const NUM_MASK_COEFS  = 32;
const SCORE_THRESHOLD = 0.25;
const IOU_THRESHOLD   = 0.45;

// Matches data.yaml (nc: 18) exactly — index = training class id.
export const PART_CLASSES = [
  "Back Bumper",       // 0
  "Back Glass",        // 1
  "Back Left Door",    // 2
  "Back Left Light",   // 3
  "Back Right Door",   // 4
  "Back Right Light",  // 5
  "Front Bumper",      // 6
  "Front Glass",       // 7
  "Front Left Door",   // 8
  "Front Left Light",  // 9
  "Front Right Door",  // 10
  "Front Right Light", // 11
  "Hood",              // 12
  "Left Mirror",       // 13
  "Right Mirror",      // 14
  "Tailgate",          // 15
  "Trunk",             // 16
  "Wheel",             // 17
];

export const PART_COLORS = [
  "#ff6b35", // Back Bumper
  "#94a3b8", // Back Glass
  "#00d25a", // Back Left Door
  "#f43f5e", // Back Left Light
  "#06b6d4", // Back Right Door
  "#f97316", // Back Right Light
  "#a855f7", // Front Bumper
  "#64748b", // Front Glass
  "#10b981", // Front Left Door
  "#ff69b4", // Front Left Light
  "#3b82f6", // Front Right Door
  "#ffd700", // Front Right Light
  "#ef4444", // Hood
  "#0ea5e9", // Left Mirror
  "#8b5cf6", // Right Mirror
  "#14b8a6", // Tailgate
  "#eab308", // Trunk
  "#22d3ee", // Wheel
];

// ── Session cache ─────────────────────────────────────────────────────────────
let _partsSessionPromise = null;
let _partsModelAvailable = null;

// ── Preprocessing canvas + buffer ─────────────────────────────────────────────
let _prepCanvas = null, _prepCtx = null;
let _float32Buf = null;

// ── Mask upscaling canvases (shared, reused per part within each inference) ───
let _mc = null, _mcCtx = null;
let _sc = null, _scCtx = null;
let _fc = null, _fcCtx = null, _fcW = 0, _fcH = 0;
let _maskRaw = null;

// ─────────────────────────────────────────────────────────────────────────────

function sigmoid(x) { return 1 / (1 + Math.exp(-x)); }

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
        executionProviders: ["webgl", "wasm"],
        graphOptimizationLevel: "all",
        enableMemPattern: true,
      });
    })();
  }
  return _partsSessionPromise;
}

function preprocessWithLetterbox(video) {
  const vw = video.videoWidth, vh = video.videoHeight;
  const scale = Math.min(INPUT_SIZE / vw, INPUT_SIZE / vh);
  const newW  = Math.round(vw * scale), newH = Math.round(vh * scale);
  const padX  = Math.round((INPUT_SIZE - newW) / 2);
  const padY  = Math.round((INPUT_SIZE - newH) / 2);

  if (!_prepCanvas) {
    _prepCanvas = document.createElement("canvas");
    _prepCanvas.width = INPUT_SIZE; _prepCanvas.height = INPUT_SIZE;
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

// Compute + upscale one part's pixel mask (same pipeline as yoloCarSegmentation).
// Returns a NEW Uint8ClampedArray(vw*vh) — allocated once per kept detection.
function computePartMask(coefs, protoData, scale, padX, padY, vw, vh, x1, y1, x2, y2) {
  const maskPixels = MASK_DIM * MASK_DIM;
  if (!_maskRaw) _maskRaw = new Float32Array(maskPixels);

  // sigmoid(coefs @ protos)
  for (let p = 0; p < maskPixels; p++) {
    let v = 0;
    for (let m = 0; m < NUM_MASK_COEFS; m++) v += coefs[m] * protoData[m * maskPixels + p];
    _maskRaw[p] = sigmoid(v);
  }

  // Bbox crop at 160×160 (prevents prototype bleeding beyond the part)
  const mx1 = Math.max(0,        Math.floor((x1 * scale + padX) * MASK_DIM / INPUT_SIZE));
  const my1 = Math.max(0,        Math.floor((y1 * scale + padY) * MASK_DIM / INPUT_SIZE));
  const mx2 = Math.min(MASK_DIM, Math.ceil( (x2 * scale + padX) * MASK_DIM / INPUT_SIZE));
  const my2 = Math.min(MASK_DIM, Math.ceil( (y2 * scale + padY) * MASK_DIM / INPUT_SIZE));
  for (let py = 0; py < MASK_DIM; py++) {
    for (let px = 0; px < MASK_DIM; px++) {
      if (py < my1 || py > my2 || px < mx1 || px > mx2) _maskRaw[py * MASK_DIM + px] = 0;
    }
  }

  // Write power-pre-sharpened sigmoid values to 160×160 canvas
  if (!_mc) {
    _mc = document.createElement("canvas");
    _mc.width = MASK_DIM; _mc.height = MASK_DIM;
    _mcCtx = _mc.getContext("2d");
  }
  const md = _mcCtx.createImageData(MASK_DIM, MASK_DIM);
  for (let i = 0; i < maskPixels; i++) {
    const v = Math.round(Math.pow(_maskRaw[i], 1.5) * 255);
    md.data[i * 4] = md.data[i * 4 + 1] = md.data[i * 4 + 2] = md.data[i * 4 + 3] = v;
  }
  _mcCtx.putImageData(md, 0, 0);

  // Bilinear upscale 160 → 640
  if (!_sc) {
    _sc = document.createElement("canvas");
    _sc.width = INPUT_SIZE; _sc.height = INPUT_SIZE;
    _scCtx = _sc.getContext("2d");
    _scCtx.imageSmoothingEnabled = true; _scCtx.imageSmoothingQuality = "high";
  }
  _scCtx.clearRect(0, 0, INPUT_SIZE, INPUT_SIZE);
  _scCtx.drawImage(_mc, 0, 0, INPUT_SIZE, INPUT_SIZE);

  // Crop letterbox padding + scale to video resolution
  if (!_fc || _fcW !== vw || _fcH !== vh) {
    _fc = document.createElement("canvas");
    _fc.width = vw; _fc.height = vh;
    _fcCtx = _fc.getContext("2d", { willReadFrequently: true });
    _fcCtx.imageSmoothingEnabled = true; _fcCtx.imageSmoothingQuality = "high";
    _fcW = vw; _fcH = vh;
  }
  _fcCtx.clearRect(0, 0, vw, vh);
  _fcCtx.drawImage(_sc, padX, padY, vw * scale, vh * scale, 0, 0, vw, vh);

  // Smoothstep → final opacity array
  const EDGE_LO = 0.42, EDGE_HI = 0.58;
  const raw = _fcCtx.getImageData(0, 0, vw, vh).data;
  const mask = new Uint8ClampedArray(vw * vh);
  for (let i = 0; i < vw * vh; i++) {
    const a = raw[i * 4 + 3] / 255;
    const t = Math.max(0, Math.min(1, (a - EDGE_LO) / (EDGE_HI - EDGE_LO)));
    mask[i] = Math.round(t * t * (3 - 2 * t) * 255);
  }
  return mask;
}

function calcIou(a, b) {
  const x1 = Math.max(a.x1, b.x1), y1 = Math.max(a.y1, b.y1);
  const x2 = Math.min(a.x2, b.x2), y2 = Math.min(a.y2, b.y2);
  const inter = Math.max(0, x2 - x1) * Math.max(0, y2 - y1);
  return inter / ((a.x2-a.x1)*(a.y2-a.y1) + (b.x2-b.x1)*(b.y2-b.y1) - inter + 1e-6);
}

function nmsPerClass(candidates) {
  const byClass = {};
  for (const c of candidates) (byClass[c.classId] ??= []).push(c);
  const kept = [];
  for (const list of Object.values(byClass)) {
    const sorted = [...list].sort((a, b) => b.score - a.score);
    const k = [];
    for (const det of sorted) {
      if (k.every(d => calcIou(d, det) < IOU_THRESHOLD)) k.push(det);
    }
    kept.push(...k);
  }
  return kept;
}

/**
 * Run the car-parts seg model on one video frame.
 * Returns an array of { classId, className, color, x1, y1, x2, y2, score, mask }
 * where mask is a Uint8ClampedArray(vw*vh) with per-pixel opacity 0-255.
 * Returns null when nothing is detected, INFERENCE_SKIPPED when WASM is busy.
 */
export async function detectPartsInVideoFrame(video) {
  if (!video?.videoWidth) return null;
  if (!tryAcquireOnnxLock()) return INFERENCE_SKIPPED;

  try {
    const [session, ort] = await Promise.all([getPartsSession(), getOrt()]);
    const { float32, scale, padX, padY, vw, vh } = preprocessWithLetterbox(video);

    const tensor  = new ort.Tensor("float32", float32, [1, 3, INPUT_SIZE, INPUT_SIZE]);
    const outputs = await session.run({ [session.inputNames[0]]: tensor });

    // output0: [1, 4+numCls+32, 8400] — detections
    // output1: [1, 32, 160, 160]     — prototype masks
    const det0       = outputs[session.outputNames[0]];
    const proto      = outputs[session.outputNames[1]];
    const numAnchors = det0.dims[2];
    const numCh      = det0.dims[1];
    const numCls     = numCh - 4 - NUM_MASK_COEFS;
    const data       = det0.data;
    const protoData  = proto.data;

    if (!_partsSessionPromise._logged) {
      _partsSessionPromise._logged = true;
      console.log(`[Parts] output0: [1,${numCh},${numAnchors}] → ${numCls} classes`);
    }

    const candidates = [];
    for (let d = 0; d < numAnchors; d++) {
      const cx = data[0 * numAnchors + d], cy = data[1 * numAnchors + d];
      const bw = data[2 * numAnchors + d], bh = data[3 * numAnchors + d];

      let bestCls = -1, bestScore = 0;
      for (let c = 0; c < numCls; c++) {
        const s = data[(4 + c) * numAnchors + d];
        if (s > bestScore) { bestScore = s; bestCls = c; }
      }
      if (bestCls < 0 || bestScore < SCORE_THRESHOLD) continue;

      const x1 = Math.max(0,  (cx - bw / 2 - padX) / scale);
      const y1 = Math.max(0,  (cy - bh / 2 - padY) / scale);
      const x2 = Math.min(vw, (cx + bw / 2 - padX) / scale);
      const y2 = Math.min(vh, (cy + bh / 2 - padY) / scale);

      // Extract 32 mask coefficients for this anchor
      const coefs = new Float32Array(NUM_MASK_COEFS);
      for (let m = 0; m < NUM_MASK_COEFS; m++) coefs[m] = data[(4 + numCls + m) * numAnchors + d];

      candidates.push({ classId: bestCls, className: PART_CLASSES[bestCls] ?? `class-${bestCls}`,
        color: PART_COLORS[bestCls % PART_COLORS.length], x1, y1, x2, y2, score: bestScore, coefs });
    }

    const kept = nmsPerClass(candidates);
    if (kept.length === 0) return null;

    // Compute pixel-accurate mask for each surviving detection
    return kept.map(det => ({
      classId:   det.classId,
      className: det.className,
      color:     det.color,
      x1: det.x1, y1: det.y1, x2: det.x2, y2: det.y2,
      score:     det.score,
      mask: computePartMask(det.coefs, protoData, scale, padX, padY, vw, vh, det.x1, det.y1, det.x2, det.y2),
    }));
  } finally {
    releaseOnnxLock();
  }
}

export function resetPartsSession() {
  _partsSessionPromise = null; _partsModelAvailable = null;
  _prepCanvas = null; _prepCtx = null; _float32Buf = null;
  _mc = null; _mcCtx = null; _sc = null; _scCtx = null;
  _fc = null; _fcCtx = null; _fcW = 0; _fcH = 0; _maskRaw = null;
}
