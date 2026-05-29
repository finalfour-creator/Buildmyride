/**
 * YOLOv8 car detection in the browser via ONNX Runtime Web.
 * Model: place yolov8n.onnx in public/models/ (see public/models/README.md)
 */
import { getOrt } from "./onnxSetup";

export const YOLO_MODEL_URL = "/models/yolov8n.onnx";
export const YOLO_INPUT_SIZE = 640;
/** COCO class index for "car" */
export const COCO_CAR_CLASS_ID = 2;
const SCORE_THRESHOLD = 0.35;
const IOU_THRESHOLD = 0.45;

let sessionPromise = null;
let modelAvailable = null;

// Reused across inference calls — avoids per-call allocation and GC pressure
let _prepCanvas = null, _prepCtx = null;
let _float32Buf = null; // Float32Array(3 × 640 × 640)

export async function checkYoloModelAvailable() {
  if (modelAvailable !== null) return modelAvailable;
  try {
    const res = await fetch(YOLO_MODEL_URL, { method: "HEAD" });
    modelAvailable = res.ok;
  } catch {
    modelAvailable = false;
  }
  return modelAvailable;
}

async function getSession() {
  if (!sessionPromise) {
    sessionPromise = (async () => {
      const ort = await getOrt(); // shared init — no duplicate initWasm()
      return ort.InferenceSession.create(YOLO_MODEL_URL, {
        executionProviders: ["webgpu", "webgl", "wasm"],
        graphOptimizationLevel: "all",
        enableMemPattern: true,
      });
    })();
  }
  return sessionPromise;
}

function preprocessVideoFrame(video, size = YOLO_INPUT_SIZE) {
  if (!_prepCanvas) {
    _prepCanvas = document.createElement("canvas");
    _prepCanvas.width  = size;
    _prepCanvas.height = size;
    _prepCtx = _prepCanvas.getContext("2d", { willReadFrequently: true });
  }
  if (!_float32Buf) _float32Buf = new Float32Array(3 * size * size);

  _prepCtx.drawImage(video, 0, 0, size, size);
  const { data } = _prepCtx.getImageData(0, 0, size, size);
  const N = size * size;

  for (let i = 0; i < N; i++) {
    _float32Buf[i]         = data[i * 4]     / 255;
    _float32Buf[N + i]     = data[i * 4 + 1] / 255;
    _float32Buf[N * 2 + i] = data[i * 4 + 2] / 255;
  }

  return _float32Buf;
}

function iou(boxA, boxB) {
  const x1 = Math.max(boxA.x, boxB.x);
  const y1 = Math.max(boxA.y, boxB.y);
  const x2 = Math.min(boxA.x + boxA.width, boxB.x + boxB.width);
  const y2 = Math.min(boxA.y + boxA.height, boxB.y + boxB.height);
  const inter = Math.max(0, x2 - x1) * Math.max(0, y2 - y1);
  const union = boxA.width * boxA.height + boxB.width * boxB.height - inter;
  return union <= 0 ? 0 : inter / union;
}

function nms(boxes) {
  const sorted = [...boxes].sort((a, b) => b.confidence - a.confidence);
  const kept = [];

  for (const box of sorted) {
    if (kept.every((k) => iou(k, box) < IOU_THRESHOLD)) {
      kept.push(box);
    }
  }
  return kept;
}

/**
 * Parse YOLOv8 ONNX output [1, 84, 8400] (4 + 80 COCO classes)
 */
function parseYoloOutput(tensor, videoWidth, videoHeight) {
  const data = tensor.data;
  const dims = tensor.dims;

  let channels = 84;
  let anchors = 8400;

  if (dims.length === 3) {
    if (dims[1] === 84) {
      channels = dims[1];
      anchors = dims[2];
    } else if (dims[2] === 84) {
      anchors = dims[1];
      channels = dims[2];
    }
  }

  const stride = anchors;
  const candidates = [];

  for (let i = 0; i < anchors; i++) {
    const cx = data[0 * stride + i];
    const cy = data[1 * stride + i];
    const w = data[2 * stride + i];
    const h = data[3 * stride + i];

    let bestScore = 0;
    let bestClass = -1;
    for (let c = 4; c < channels; c++) {
      const score = data[c * stride + i];
      if (score > bestScore) {
        bestScore = score;
        bestClass = c - 4;
      }
    }

    if (bestClass !== COCO_CAR_CLASS_ID || bestScore < SCORE_THRESHOLD) continue;

    const scaleX = videoWidth / YOLO_INPUT_SIZE;
    const scaleY = videoHeight / YOLO_INPUT_SIZE;

    const boxW = w * scaleX;
    const boxH = h * scaleY;
    const x = (cx - w / 2) * scaleX;
    const y = (cy - h / 2) * scaleY;

    candidates.push({
      x: Math.max(0, x),
      y: Math.max(0, y),
      width: Math.min(boxW, videoWidth - x),
      height: Math.min(boxH, videoHeight - y),
      confidence: bestScore,
      source: "yolo",
    });
  }

  const afterNms = nms(candidates);
  if (afterNms.length === 0) return null;

  return afterNms.reduce((best, b) =>
    b.width * b.height > best.width * best.height ? b : best
  );
}

export async function detectCarInVideoFrame(video) {
  if (!video?.videoWidth) return null;

  const hasModel = await checkYoloModelAvailable();
  if (!hasModel) return null;

  const [session, ort] = await Promise.all([getSession(), getOrt()]);
  const inputData = preprocessVideoFrame(video);
  const inputTensor = new ort.Tensor("float32", inputData, [1, 3, YOLO_INPUT_SIZE, YOLO_INPUT_SIZE]);

  const inputName = session.inputNames[0];
  const outputs = await session.run({ [inputName]: inputTensor });
  const outputTensor = outputs[session.outputNames[0]];

  return parseYoloOutput(outputTensor, video.videoWidth, video.videoHeight);
}

export function resetYoloSession() {
  sessionPromise = null;
  modelAvailable = null;
  _prepCanvas = null; _prepCtx = null;
  _float32Buf = null;
}
