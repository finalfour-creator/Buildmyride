/**
 * Shared ONNX Runtime initialization.
 *
 * ORT's WASM backend calls initWasm() exactly once globally.
 * If yoloCarDetection and yoloCarSegmentation each import onnxruntime-web and
 * set env.wasm.wasmPaths independently, they race and the second call throws
 * "multiple calls to initWasm() detected".
 *
 * Solution: every file that needs ORT calls getOrt() from here.
 * The promise is created once; all callers share the same resolved value.
 */

let _ortPromise = null;

export function getOrt() {
  if (!_ortPromise) {
    _ortPromise = import("onnxruntime-web").then((ort) => {
      // Use CDN for WASM files. webgpu is excluded because its JSEP module
      // (ort-wasm-simd-threaded.jsep.mjs) causes a CDN fetch failure that
      // permanently breaks initWasm() for all subsequent calls.
      ort.env.wasm.wasmPaths =
        "https://cdn.jsdelivr.net/npm/onnxruntime-web@1.26.0/dist/";
      ort.env.wasm.numThreads = 1; // single-threaded WASM avoids .jsep.mjs CDN fetch failure
      return ort;
    }).catch((err) => {
      _ortPromise = null; // don't cache failures — allow retry on next call
      throw err;
    });
  }
  return _ortPromise;
}

// Global mutex — WASM is single-threaded; only one session.run() at a time.
// All three models (detection, segmentation, parts) share this lock.
// If the runtime is busy, the calling hook skips that frame and tries next cycle.
let _onnxBusy = false;

export function tryAcquireOnnxLock() {
  if (_onnxBusy) return false;
  _onnxBusy = true;
  return true;
}

export function releaseOnnxLock() {
  _onnxBusy = false;
}

// Sentinel returned when WASM is busy. Hooks check for this to avoid counting
// lock-contention as a real "no detection" miss, which would clear the mask.
export const INFERENCE_SKIPPED = Symbol("inference_skipped");
