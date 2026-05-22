"""
Export YOLOv8 nano to ONNX for AR Preview (browser).
Run from this folder so yolov8n.onnx is created here.

  pip install ultralytics
  py -3.11 export.py
"""

from ultralytics import YOLO

model = YOLO("yolov8n.pt")

model.export(format="onnx", imgsz=640)

print("Done. Ensure yolov8n.onnx is in this folder, then restart: npm run dev")
