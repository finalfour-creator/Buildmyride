/**
 * YOLOv8n-seg car segmentation — ONNX Runtime Web.
 *
 * Model setup (run once in Python / Google Colab):
 *   from ultralytics import YOLO
 *   YOLO('yolov8n-seg.pt').export(format='onnx', imgsz=640, opset=12)
 *   → copy yolov8n-seg.onnx to public/models/
 *
 * ONNX output layout:
 *   output0: [1, 116, 8400]    — 4 box + 80 COCO class scores + 32 mask coefficients
 *   output1: [1, 32, 160, 160] — prototype masks
 */

import { getOrt, tryAcquireOnnxLock, releaseOnnxLock, INFERENCE_SKIPPED } from "./onnxSetup";

export const SEG_MODEL_URL = "/models/yolov8n-seg.onnx";

const INPUT_SIZE = 640;
const MASK_DIM   = 160;
const NUM_MASK_COEFS = 32;

// 0.50 catches side/rear/angled views; bounding-box crop + min-area filter
// already prevent the false positives that a higher threshold was guarding against.
const SCORE_THRESHOLD = 0.50;
const IOU_THRESHOLD   = 0.45;

// Only COCO class 2 = car (this is a car customisation app)
const VEHICLE_CLASS_IDS = new Set([2]);

// Reject boxes smaller than 4% of the frame (tiny background objects)
const MIN_BOX_AREA_FRACTION = 0.04;

// Module-level session cache
let segSessionPromise = null;
let segModelAvailable = null;

// Canvas pool — reused across inference calls (eliminates per-call GC pressure)
let _prepCanvas = null, _prepCtx = null;          // 640×640 letterbox
let _mc = null, _mcCtx = null;                    // 160×160 soft mask
let _sc = null, _scCtx = null;                    // 640×640 bilinear upscale
let _fc = null, _fcCtx = null, _fcW = 0, _fcH = 0; // video-res crop

// TypedArray buffers — allocated once, reused every inference frame
let _prepFloat32 = null;  // Float32Array(3 × 640 × 640) for preprocessing
let _maskRaw     = null;  // Float32Array(160 × 160) for prototype mask
let _opacity     = null;  // Uint8ClampedArray(vw × vh) returned by upscaleMask
let _composite   = null;  // Uint8ClampedArray(vw × vh) working buffer (zeroed each frame)
let _display     = null;  // Uint8ClampedArray(vw × vh) stable buffer read by overlay
let _bufVw = 0, _bufVh = 0; // track video dims for buffer resize

export async function checkSegModelAvailable() {
  if (segModelAvailable !== null) return segModelAvailable;
  try {
    const res = await fetch(SEG_MODEL_URL, { method: "HEAD" });
    segModelAvailable = res.ok;
  } catch {
    segModelAvailable = false;
  }
  return segModelAvailable;
}

async function getSegSession() {
  if (!segSessionPromise) {
    segSessionPromise = (async () => {
      const ort = await getOrt(); // shared init — no duplicate initWasm()
      return ort.InferenceSession.create(SEG_MODEL_URL, {
        executionProviders: ["webgl", "wasm"],
        graphOptimizationLevel: "all",
        enableMemPattern: true,
      });
    })();
  }
  return segSessionPromise;
}

// ── Preprocessing: letterbox resize (preserves aspect ratio with gray padding) ─

function preprocessWithLetterbox(video) {
  const vw = video.videoWidth;
  const vh = video.videoHeight;

  const scale = Math.min(INPUT_SIZE / vw, INPUT_SIZE / vh);
  const newW  = Math.round(vw * scale);
  const newH  = Math.round(vh * scale);
  const padX  = Math.round((INPUT_SIZE - newW) / 2);
  const padY  = Math.round((INPUT_SIZE - newH) / 2);

  // Reuse the 640×640 preprocessing canvas across calls
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
  if (!_prepFloat32) _prepFloat32 = new Float32Array(3 * N);

  for (let i = 0; i < N; i++) {
    _prepFloat32[i]         = data[i * 4]     / 255;
    _prepFloat32[N + i]     = data[i * 4 + 1] / 255;
    _prepFloat32[N * 2 + i] = data[i * 4 + 2] / 255;
  }

  return { float32: _prepFloat32, scale, padX, padY, vw, vh };
}

// ── NMS ───────────────────────────────────────────────────────────────────────

function calcIou(a, b) {
  const x1 = Math.max(a.x1, b.x1), y1 = Math.max(a.y1, b.y1);
  const x2 = Math.min(a.x2, b.x2), y2 = Math.min(a.y2, b.y2);
  const inter = Math.max(0, x2 - x1) * Math.max(0, y2 - y1);
  const aA = (a.x2 - a.x1) * (a.y2 - a.y1);
  const aB = (b.x2 - b.x1) * (b.y2 - b.y1);
  return inter / (aA + aB - inter + 1e-6);
}

function nms(candidates) {
  const sorted = [...candidates].sort((a, b) => b.score - a.score);
  const kept = [];
  for (const c of sorted) {
    if (kept.every((k) => calcIou(k, c) < IOU_THRESHOLD)) kept.push(c);
  }
  return kept;
}

function sigmoid(x) {
  return 1 / (1 + Math.exp(-x));
}

// ── Upscale 160×160 mask → Uint8ClampedArray at video resolution ─────────────
//
// Key insight: writing soft sigmoid probabilities (not hard 0/255) at 160×160
// lets bilinear upscaling place edge gradients exactly where the model detected
// the boundary, rather than interpolating between staircase steps.
// A smoothstep S-curve then sharpens those gradients into crisp 1-2px edges.

function upscaleMask(maskRaw, scale, padX, padY, vw, vh) {
  // Step 1: reuse 160×160 canvas — soft sigmoid values, not binary
  if (!_mc) {
    _mc = document.createElement("canvas");
    _mc.width  = MASK_DIM;
    _mc.height = MASK_DIM;
    _mcCtx = _mc.getContext("2d");
  }
  // Power pre-sharpen: push confident pixels toward 1 and uncertain toward 0,
  // so bilinear upscaling places a steeper gradient exactly at the car boundary.
  const md = _mcCtx.createImageData(MASK_DIM, MASK_DIM);
  for (let i = 0; i < MASK_DIM * MASK_DIM; i++) {
    const v = Math.round(Math.pow(maskRaw[i], 1.5) * 255);
    md.data[i * 4] = md.data[i * 4 + 1] = md.data[i * 4 + 2] = md.data[i * 4 + 3] = v;
  }
  _mcCtx.putImageData(md, 0, 0);

  // Step 2: reuse 640×640 canvas — MUST clear first or old masks accumulate
  // via source-over compositing and the whole screen turns green over time.
  if (!_sc) {
    _sc = document.createElement("canvas");
    _sc.width  = INPUT_SIZE;
    _sc.height = INPUT_SIZE;
    _scCtx = _sc.getContext("2d");
    _scCtx.imageSmoothingEnabled = true;
    _scCtx.imageSmoothingQuality = "high";
  }
  _scCtx.clearRect(0, 0, INPUT_SIZE, INPUT_SIZE);
  _scCtx.drawImage(_mc, 0, 0, INPUT_SIZE, INPUT_SIZE);

  // Step 3: reuse video-size canvas — MUST clear first (same accumulation reason)
  if (!_fc || _fcW !== vw || _fcH !== vh) {
    _fc = document.createElement("canvas");
    _fc.width  = vw;
    _fc.height = vh;
    _fcCtx = _fc.getContext("2d", { willReadFrequently: true });
    _fcCtx.imageSmoothingEnabled = true;
    _fcCtx.imageSmoothingQuality = "high";
    _fcW = vw;
    _fcH = vh;
  }
  _fcCtx.clearRect(0, 0, vw, vh);
  _fcCtx.drawImage(_sc, padX, padY, vw * scale, vh * scale, 0, 0, vw, vh);

  // Step 4: smoothstep S-curve — compresses bilinear gradient into crisp 1-2px edge
  const EDGE_LO = 0.42, EDGE_HI = 0.58; // tighter band → crisper car outline
  const rawPx = _fcCtx.getImageData(0, 0, vw, vh).data;
  const pixels = vw * vh;
  if (!_opacity || _bufVw !== vw || _bufVh !== vh) {
    _opacity = new Uint8ClampedArray(pixels);
    _bufVw = vw;
    _bufVh = vh;
  }
  for (let i = 0; i < pixels; i++) {
    const a = rawPx[i * 4 + 3] / 255;
    const t = Math.max(0, Math.min(1, (a - EDGE_LO) / (EDGE_HI - EDGE_LO)));
    _opacity[i] = Math.round(t * t * (3 - 2 * t) * 255);
  }
  return _opacity;
}

// ── Main export ───────────────────────────────────────────────────────────────

/**
 * Run YOLOv8-seg on one video frame.
 * Returns a per-pixel opacity map (Uint8ClampedArray) rather than a coloured
 * ImageData. The overlay component reads live video pixels and applies the
 * selected paint colour at runtime — so colour changes are instant and the
 * car's shadows / highlights are preserved realistically.
 *
 * @param {HTMLVideoElement} video
 * @returns {Promise<{ carMask: Uint8ClampedArray, detectionCount: number } | null>}
 */
export async function segmentCarInVideoFrame(video) {
  if (!video?.videoWidth) return null;
  if (!tryAcquireOnnxLock()) return INFERENCE_SKIPPED;

  try {
  const [session, ort] = await Promise.all([getSegSession(), getOrt()]);

  const { float32, scale, padX, padY, vw, vh } = preprocessWithLetterbox(video);

  const inputTensor = new ort.Tensor("float32", float32, [1, 3, INPUT_SIZE, INPUT_SIZE]);
  const outputs     = await session.run({ [session.inputNames[0]]: inputTensor });

  const detData   = outputs[session.outputNames[0]].data;
  const protoData = outputs[session.outputNames[1]].data;

  const numDet = outputs[session.outputNames[0]].dims[2];
  const numCh  = outputs[session.outputNames[0]].dims[1];
  const numCls = numCh - 4 - NUM_MASK_COEFS;

  // ── Parse + filter detections ─────────────────────────────────────────────
  const candidates = [];

  for (let d = 0; d < numDet; d++) {
    const cx = detData[0 * numDet + d];
    const cy = detData[1 * numDet + d];
    const bw = detData[2 * numDet + d];
    const bh = detData[3 * numDet + d];

    let bestCls = -1, bestScore = 0;
    for (let c = 0; c < numCls; c++) {
      const s = detData[(4 + c) * numDet + d];
      if (s > bestScore) { bestScore = s; bestCls = c; }
    }

    if (!VEHICLE_CLASS_IDS.has(bestCls) || bestScore < SCORE_THRESHOLD) continue;

    const x1 = Math.max(0,  (cx - bw / 2 - padX) / scale);
    const y1 = Math.max(0,  (cy - bh / 2 - padY) / scale);
    const x2 = Math.min(vw, (cx + bw / 2 - padX) / scale);
    const y2 = Math.min(vh, (cy + bh / 2 - padY) / scale);

    const boxArea = (x2 - x1) * (y2 - y1);
    if (boxArea < vw * vh * MIN_BOX_AREA_FRACTION) continue;

    const coefs = Array.from({ length: NUM_MASK_COEFS }, (_, m) =>
      detData[(4 + numCls + m) * numDet + d]
    );

    candidates.push({ x1, y1, x2, y2, score: bestScore, coefs });
  }

  const kept = nms(candidates);
  if (kept.length === 0) return null;

  // ── Compute masks, composite into a single opacity map ────────────────────
  const pixels = vw * vh;
  if (!_composite || _bufVw !== vw || _bufVh !== vh) {
    _composite = new Uint8ClampedArray(pixels);
  } else {
    _composite.fill(0);
  }
  if (!_maskRaw) _maskRaw = new Float32Array(MASK_DIM * MASK_DIM);

  for (const det of kept) {
    _maskRaw.fill(0);
    for (let p = 0; p < MASK_DIM * MASK_DIM; p++) {
      let v = 0;
      for (let m = 0; m < NUM_MASK_COEFS; m++) {
        v += det.coefs[m] * protoData[m * MASK_DIM * MASK_DIM + p];
      }
      _maskRaw[p] = sigmoid(v);
    }

    // CRITICAL: zero out everything outside the detection bounding box.
    // Prototype masks activate across the full image — without this crop the
    // mask bleeds into background objects and highlights random things.
    const mx1 = Math.max(0,        Math.floor((det.x1 * scale + padX) * MASK_DIM / INPUT_SIZE));
    const my1 = Math.max(0,        Math.floor((det.y1 * scale + padY) * MASK_DIM / INPUT_SIZE));
    const mx2 = Math.min(MASK_DIM, Math.ceil( (det.x2 * scale + padX) * MASK_DIM / INPUT_SIZE));
    const my2 = Math.min(MASK_DIM, Math.ceil( (det.y2 * scale + padY) * MASK_DIM / INPUT_SIZE));

    for (let py = 0; py < MASK_DIM; py++) {
      for (let px = 0; px < MASK_DIM; px++) {
        if (py < my1 || py > my2 || px < mx1 || px > mx2) {
          _maskRaw[py * MASK_DIM + px] = 0;
        }
      }
    }

    const opacity = upscaleMask(_maskRaw, scale, padX, padY, vw, vh);

    // Union of multiple detected cars: keep the highest opacity per pixel
    for (let i = 0; i < pixels; i++) {
      if (opacity[i] > _composite[i]) _composite[i] = opacity[i];
    }
  }

  // Copy working buffer → stable display buffer (overlay reads _display, never _composite).
  // This prevents the overlay from seeing the zeroed working buffer mid-inference.
  if (!_display || _display.length !== pixels) _display = new Uint8ClampedArray(pixels);
  _display.set(_composite);

  return { carMask: _display, detectionCount: kept.length };
  } finally {
    releaseOnnxLock();
  }
}

export function resetSegSession() {
  segSessionPromise = null;
  segModelAvailable = null;
  _prepCanvas = null; _prepCtx = null;
  _mc = null; _mcCtx = null;
  _sc = null; _scCtx = null;
  _fc = null; _fcCtx = null; _fcW = 0; _fcH = 0;
  _prepFloat32 = null; _maskRaw = null; _opacity = null;
  _composite = null; _display = null; _bufVw = 0; _bufVh = 0;
}
