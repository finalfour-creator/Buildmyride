"""
Export YOLOv8 models to ONNX for AR Preview (browser).
Run from this folder:

  pip install ultralytics
  py -3.11 export.py
"""

from ultralytics import YOLO

# --- Detection model (bounding box) ---
print("Exporting yolov8n detection model...")
YOLO("yolov8n.pt").export(format="onnx", imgsz=640, opset=12)
print("  → yolov8n.onnx done")

# --- Segmentation model (pixel mask) ---
# Downloads yolov8n-seg.pt automatically on first run (~6 MB)
print("Exporting yolov8n-seg segmentation model...")
YOLO("yolov8n-seg.pt").export(format="onnx", imgsz=640, opset=12)
print("  → yolov8n-seg.onnx done")

print("\nDone! Restart the dev server: npm run dev")
