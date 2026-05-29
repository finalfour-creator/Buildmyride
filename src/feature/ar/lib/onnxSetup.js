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
      ort.env.wasm.wasmPaths =
        "https://cdn.jsdelivr.net/npm/onnxruntime-web@1.26.0/dist/";
      ort.env.wasm.simd = true;
      return ort;
    });
  }
  return _ortPromise;
}
