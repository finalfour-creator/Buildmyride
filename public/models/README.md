# YOLOv8 model for AR Preview (Phase 4)

The AR page loads this file in the browser:

```
public/models/yolov8n.onnx
```

Without it, AR runs in **demo mode** (yellow dashed box). With it, **YOLOv8** tracks cars (green box).

---

## Step 1 — Install Ultralytics (Python, on your PC)

This is **not** installed by `npm install`. You run it once on your machine:

```bash
pip install ultralytics
```

---

## Step 2 — Export to ONNX

### Option A — Python script (recommended if `yolo` CLI fails)

1. Open a terminal in **this folder** (`Buildmyride/client/public/models/`).

2. Run:

   ```bash
   py -3.11 export.py
   ```

   Or:

   ```bash
   python export.py
   ```

3. First run downloads `yolov8n.pt`, then writes `yolov8n.onnx` here (same folder).

The script is `export.py` in this directory.

### Option B — CLI

```bash
yolo export model=yolov8n.pt format=onnx imgsz=640
```

Then copy `yolov8n.onnx` into `Buildmyride/client/public/models/`.

---

## Step 3 — Use in the app

1. Confirm the file exists: `client/public/models/yolov8n.onnx`
2. Restart Next.js: `npm run dev` in `client/`
3. Open [http://localhost:3000/ar-view](http://localhost:3000/ar-view) → **Start camera**
4. Status should show **YOLOv8** (not DEMO) when a car is detected

---

## Notes

- COCO class **2** = car (used by the detector).
- Inference runs in the browser via **ONNX Runtime Web** (no video uploaded to the server).
- File size is roughly 6–12 MB for `yolov8n.onnx`.
