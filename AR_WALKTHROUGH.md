# AR Feature Walkthrough — BuildMyRide

> Complete reference for how the AR car customization feature works, file-by-file breakdown, and what still needs to be built or improved.

---

## Table of Contents

1. [What the AR Feature Does](#1-what-the-ar-feature-does)
2. [How It Works — High Level Flow](#2-how-it-works--high-level-flow)
3. [Three AR Modes Explained](#3-three-ar-modes-explained)
4. [File-by-File Breakdown](#4-file-by-file-breakdown)
   - [Entry Point](#entry-point)
   - [Main Page](#main-page)
   - [Components](#components)
   - [Hooks](#hooks)
   - [Libraries / Utilities](#libraries--utilities)
5. [Machine Learning Pipeline](#5-machine-learning-pipeline)
6. [3D Rendering Architecture](#6-3d-rendering-architecture)
7. [Coordinate Systems](#7-coordinate-systems)
8. [Public Assets](#8-public-assets)
9. [State Management](#9-state-management)
10. [What Needs to Be Changed or Added](#10-what-needs-to-be-changed-or-added)

---

## 1. What the AR Feature Does

BuildMyRide's AR feature lets a user point their phone or webcam at a real car and:

- **Detect** the car automatically using an on-device ML model (YOLOv8, runs in browser via WebAssembly)
- **Segment** the car at pixel level to show a colored paint overlay
- **Detect individual parts** — hood, doors, bumpers, lights, mirrors, wheels, etc.
- **Overlay 3D models** of replacement parts (wheels, bumpers, spoilers, name plates) onto the real car
- **Place decals/stickers** (racing stripes, window stickers, side graphics) aligned to the car
- **Customize colors** per part with a live preview on the real car

There is no backend for the AR itself. Everything runs client-side in the browser using ONNX Runtime Web (WebAssembly) and Three.js.

---

## 2. How It Works — High Level Flow

```
User opens /ar-view
        │
        ▼
Camera feed starts (useCamera.js)
        │
        ▼
ONNX models load (onnxSetup.js)
        │
  ┌─────┴─────────────────────┐
  │   Three YOLO models        │
  │  1. yolov8n.onnx           │  ← whole-car bounding box
  │  2. yolov8n-seg.onnx       │  ← pixel-accurate car mask
  │  3. yolov8-seg(parts).onnx │  ← 18-class part masks
  └─────┬─────────────────────┘
        │ (run in animation loop, frame-skipped)
        ▼
Detection results feed into the active mode:
  • "car" mode    → ArSegmentationOverlay (paint overlay)
  • "parts" mode  → ArPartsOverlay (colored per-part masks)
  • "template"    → ArAnchoredModels (3D models snap to parts)
        │
        ▼
Three.js renders 3D parts/decals on top of camera feed
        │
        ▼
User picks colors, parts, decals via ArPartsPanel
```

---

## 3. Three AR Modes Explained

The entire AR experience is controlled by a single `mode` state in `ArPreviewPage.jsx`.

---

### Mode 1: "car" — Whole Car Paint

**What the user sees:**
A colored translucent overlay on the entire car body. They can change the paint color and see it live.

**How it works:**
1. `useYoloDetection` → runs YOLOv8n (12.8 MB ONNX) to get a bounding box around the car
2. `useYoloSegmentation` → runs YOLOv8n-seg (13.9 MB ONNX) to get a pixel mask of the car
3. `ArSegmentationOverlay` → takes that mask + the user's chosen color, draws a colored alpha-blended overlay on a `<canvas>` laid over the video
4. `ArThreeOverlay` → renders any 3D parts (wheels from `arBuild`) that were previously selected by the user

**Key files:** `useYoloSegmentation.js`, `ArSegmentationOverlay.jsx`, `ArThreeOverlay.jsx`

---

### Mode 2: "parts" — Per-Part Highlighting

**What the user sees:**
Each detected part of the car (hood, doors, bumpers, etc.) is colored differently. User can tap a part class to select it.

**How it works:**
1. `useYoloCarParts` → runs `yolov8-seg(parts).onnx` (13.3 MB) to detect 18 part classes with pixel masks
2. `ArPartsOverlay` → draws each detected part in its class color on a `<canvas>`
3. `ArPartsPanel` in "parts" mode shows a list of detected part names

**Key files:** `useYoloCarParts.js`, `ArPartsOverlay.jsx`, `yoloCarParts.js`

**The 18 detected classes:**
Hood, Front Bumper, Rear Bumper, Front-Left Door, Front-Right Door, Rear-Left Door, Rear-Right Door, Trunk, Front Headlight (L/R), Rear Headlight (L/R), Front-Left Wheel, Front-Right Wheel, Rear-Left Wheel, Rear-Right Wheel, Windshield, Rear Window, Side Mirror (L/R)

---

### Mode 3: "template" — AR Modify (3D Part Placement)

**What the user sees:**
A view selector (Front / Left / Right / Rear). Once they pick a view, 3D replacement parts and decals snap onto the real car. They can toggle parts on/off, change their colors individually, and switch wheel styles.

**How it works:**
1. `useViewAlignment` → marks the view as "locked" (currently always true — no active alignment detection)
2. `arTemplateConfig.js` → stores a static config of ~40+ "anchors" per view. Each anchor defines:
   - Which part (wheel, bumper, hood decal, racing stripe, etc.)
   - Its normalized position on the car template (nx, ny)
   - Its 3D model URL or decal texture URL
   - Scale, rotation, label
3. `ArAnchoredModels` → reads `enabledAnchors` (Set of anchor keys the user toggled on), loads the GLTF models, and positions them in Three.js world space using the detected car bbox as reference
4. The "shape-aware snapping" logic: racing stripes snap to door part detections, wheels snap to wheel detections — using `useYoloCarParts` bounding boxes
5. `ArPartsPanel` in "template" mode shows a panel with:
   - View tabs (Front/Left/Right/Rear)
   - Part toggles (wheels, bumpers, spoilers, decals, name plates, etc.)
   - Color pickers per part
   - Wheel style picker (Style 1 vs Style 2)

**Key files:** `ArAnchoredModels.jsx`, `arTemplateConfig.js`, `ArPartsPanel.jsx`, `ArViewSelector.jsx`

---

## 4. File-by-File Breakdown

### Entry Point

#### `src/app/ar-view/page.jsx`
```
Route: /ar-view
```
- Uses Next.js `dynamic()` with `ssr: false` to lazy-load `ArPreviewPage`
- This is required because `ArPreviewPage` uses browser APIs (camera, WebAssembly, canvas) that crash on the server

**Nothing to change here** — this pattern is correct for client-only rendering.

---

### Main Page

#### `src/feature/ar/ArPreviewPage.jsx` (~555 lines)

This is the **brain** of the AR feature. It:

1. Calls all hooks: `useCamera`, `useYoloDetection`, `useYoloSegmentation`, `useYoloCarParts`
2. Manages all top-level state (see [State Management](#9-state-management))
3. Renders the camera `<video>` element
4. Conditionally renders the right overlay components based on `mode`
5. Renders `ArPartsPanel` on the right side

**Layout structure:**
```
<div> (full screen container, relative)
  <video>            ← live camera feed
  <ArSegmentationOverlay />   (mode=car)
  <ArPartsOverlay />          (mode=parts)
  <ArAnchoredModels />        (mode=template)
  <ArThreeOverlay />          (mode=car, for 3D parts)
  <ArDetectionOverlay />      (debug bbox canvas)
  <ArDetectionStatus />       (FPS badge, top-left)
  <ArPartsPanel />            (right side panel)
</div>
```

---

### Components

#### `src/feature/ar/components/ArThreeOverlay.jsx` (~419 lines)

**Purpose:** Renders 3D GLTF car part models on top of the camera feed using Three.js. Used in "car" mode for when the user has added parts (wheels, body kits).

**How it works:**
- Creates a Three.js `WebGLRenderer` targeting a `<canvas>` overlay (same size as video)
- `OrthographicCamera` — projection matches the 2D overlay (no perspective distortion)
- For each part in `arBuild` state, loads a GLB model using `loadArGltf.js`
- Positions the model using the car's detected bounding box (`bbox` from `useYoloDetection`)
- Wheel models are placed at 4 hardcoded offsets relative to the car center
- Applies `selectedColor` as paint using `applyPaintColor()`

**Important:** Wheel positions are currently hardcoded offsets. They don't snap to detected wheel locations.

---

#### `src/feature/ar/components/ArAnchoredModels.jsx` (~626 lines)

**Purpose:** The most complex component. Renders template-mode 3D parts with shape-aware snapping to detected car parts.

**How it works:**
1. Reads `enabledAnchors` (Set<string>) — which anchors the user has toggled on
2. For each enabled anchor, looks up its config in `arTemplateConfig`
3. Computes where to place it in Three.js world space:
   - Base position: from the template config `(nx, ny, wz)`
   - Shape-aware override: if a matching part was detected by `useYoloCarParts`, use that bbox's center instead
4. Loads the GLB (3D model) or creates a decal plane (for PNG stickers)
5. Applies per-part colors from `partColors` state

**Shape-aware snapping mapping:**
```
racing-stripe-left  → detected "front-left door" bbox
racing-stripe-right → detected "front-right door" bbox
wheel-fl            → detected "front-left wheel" bbox
wheel-fr            → detected "front-right wheel" bbox
wheel-rl            → detected "rear-left wheel" bbox
wheel-rr            → detected "rear-right wheel" bbox
```

---

#### `src/feature/ar/components/ArPartsPanel.jsx` (~487 lines)

**Purpose:** The right-side UI panel. Its content changes completely based on `mode`.

**In "car" mode:**
- Color palette for global paint
- Button to switch to "parts" or "template" mode

**In "parts" mode:**
- List of detected car parts (from `useYoloCarParts`)
- Click a part to highlight it

**In "template" mode:**
- View selector tabs (Front/Left/Right/Rear)
- Toggle buttons for each part (wheel style 1, wheel style 2, bumper, hood decal, etc.)
- Per-part color pickers
- "Add to Build" button

---

#### `src/feature/ar/components/ArSegmentationOverlay.jsx` (~218 lines)

**Purpose:** Draws the paint color overlay in "car" mode.

**How it works:**
- Gets the `carMask` (Uint8ClampedArray) from `useYoloSegmentation`
- Draws the video frame to a hidden canvas
- For each pixel where `carMask[i] > 0`, applies a luminance-ratio color blend:
  - Keeps the original pixel brightness (shadows and highlights preserved)
  - Replaces the hue/saturation with the selected paint color
  - Caps alpha at 92% so the car texture is still visible
- Uses `requestAnimationFrame` loop (dirty-flag compositing — only redraws when mask or color changes)

---

#### `src/feature/ar/components/ArPartsOverlay.jsx` (~166 lines)

**Purpose:** Draws colored overlays for each detected car part in "parts" mode.

**How it works:**
- Gets `carParts` array from `useYoloCarParts`
- For each part, draws its pixel mask in the part's class color (from a fixed color map)
- Selected part gets a stronger alpha (0.7 vs 0.35 for others)
- Runs in a `requestAnimationFrame` loop

---

#### `src/feature/ar/components/ArDetectionOverlay.jsx` (~83 lines)

**Purpose:** Debug overlay. Draws the raw bounding box of the detected car.
- Only visible in development or when debug mode is on
- Draws a green rectangle from `bbox`

---

#### `src/feature/ar/components/ArDetectionStatus.jsx` (~65 lines)

**Purpose:** Small badge in the top-left corner.
- Shows FPS of the detection loop
- Shows a status message (e.g., "Detecting...", "Car Found", "No car in frame")
- Color-coded: green=detected, yellow=searching, red=error

---

#### `src/feature/ar/components/ArViewSelector.jsx` (~79 lines)

**Purpose:** Four-button selector for Front/Left/Right/Rear views in template mode.
- Updates `selectedView` in parent state
- Triggers re-loading of anchors for that view from `arTemplateConfig`

---

#### `src/feature/ar/components/ArSelectionSummary.jsx`

**Purpose:** Shows a summary of what the user has selected/built.
- Listed parts, colors, estimated changes

---

#### `src/feature/ar/components/ArTemplateOverlay.jsx`

**Purpose:** An overlay for the template view (possibly a silhouette guide).

---

### Hooks

#### `src/feature/ar/hooks/useCamera.js` (~220 lines)

**Purpose:** Manages camera access.

**How it works:**
1. Calls `navigator.mediaDevices.getUserMedia()` with progressive constraint fallback:
   - Try: `{ video: { facingMode: 'environment', width: 1280, height: 720 } }`
   - Fallback: `{ video: { facingMode: 'environment' } }`
   - Last resort: `{ video: true }`
2. Sets the stream to a `<video>` element ref
3. Handles HTTPS requirement (camera doesn't work on plain HTTP on mobile)
4. On cleanup, releases the stream with an 800ms delay on Windows to avoid driver crashes

**Returns:** `{ videoRef, isReady, error }`

---

#### `src/feature/ar/hooks/useYoloDetection.js` (~183 lines)

**Purpose:** Continuously runs YOLOv8n car detection on camera frames.

**How it works:**
1. Loads `yolov8n.onnx` via `onnxSetup.js` (cached — only loaded once)
2. Runs in a `requestAnimationFrame` loop
3. Skips frames: runs inference every 3 frames (desktop) or 8 frames (mobile)
4. On each inference: calls `runYoloCarDetection(videoElement)` from `yoloCarDetection.js`
5. Returns the largest car's bounding box `[x1, y1, x2, y2]` in video pixel coords
6. If model unavailable: generates a demo bbox (centered rectangle)

**Returns:** `{ bbox, detectionMode, fps, statusMessage, isInferring }`

---

#### `src/feature/ar/hooks/useYoloSegmentation.js` (~122 lines)

**Purpose:** Runs YOLOv8n-seg to get a pixel mask of the car.

**How it works:**
1. Loads `yolov8n-seg.onnx` via `onnxSetup.js`
2. Runs in a `requestAnimationFrame` loop, frame-skipping (every 1-3 frames)
3. Calls `runYoloCarSegmentation(videoElement)` from `yoloCarSegmentation.js`
4. Returns an `ImageData` mask (same resolution as video)

**Returns:** `{ carMask, segMode, segFps }`

---

#### `src/feature/ar/hooks/useYoloCarParts.js` (~110 lines)

**Purpose:** Runs the 18-class car-parts detection model.

**How it works:**
1. Loads `yolov8-seg(parts).onnx`
2. Frame skip: every 5 frames (desktop) or 9 (mobile)
3. Returns array of detected parts with pixel masks and bounding boxes

**Returns:** `{ carParts }` — array of `{ classId, className, color, x1, y1, x2, y2, score, mask }`

---

#### `src/feature/ar/hooks/useViewAlignment.js` (~21 lines)

**Purpose:** Was meant to detect whether the car in frame matches the selected view (front/left/right/rear) and lock onto it.

**Current state:** Stub — always returns `{ isLocked: true }`.

---

### Libraries / Utilities

#### `src/feature/ar/lib/yoloCarDetection.js` (~185 lines)

**Purpose:** Low-level ONNX inference for car detection.

**How it works:**
1. Reads a video frame into a 640×640 canvas (letterbox padding)
2. Extracts RGB pixel data → Float32 tensor in CHW format (channel-first)
3. Runs the ONNX session: input tensor → output tensor
4. Parses the output: YOLOv8 outputs `[1, 84, 8400]` (84 = 4 box + 80 COCO classes)
5. Filters to class 2 (car) with confidence > 35%
6. Applies NMS (non-max suppression)
7. Returns the largest detected car's bbox in video coordinates

---

#### `src/feature/ar/lib/yoloCarSegmentation.js` (~335 lines)

**Purpose:** Low-level ONNX inference for pixel-accurate car segmentation.

**How it works:**
1. Letterbox video frame to 640×640
2. Run YOLOv8-seg: outputs `[1, 116, 8400]` (116 = 4 box + 80 class + 32 mask coefs) + `[1, 32, 160, 160]` prototype masks
3. Filter to car class (2), apply NMS
4. For the best detection: multiply mask coefficients × prototype tensor → `32×160×160` → sum → sigmoid → 160×160 mask
5. Crop to bbox, bilinear upsample 160→640
6. Apply power pre-sharpening (boost gradient) + smoothstep S-curve (crisp edges)
7. Scale 640→video resolution
8. Return as `ImageData`

---

#### `src/feature/ar/lib/yoloCarParts.js` (~302 lines)

**Purpose:** Low-level ONNX inference for 18-class car-parts segmentation.

**How it works:** Same pipeline as `yoloCarSegmentation.js`, but:
- Uses the parts ONNX model
- Runs per-class NMS (each of 18 classes is processed independently)
- Returns an array of detections, each with its own 160×160 mask

---

#### `src/feature/ar/lib/onnxSetup.js` (~51 lines)

**Purpose:** Manages ONNX Runtime Web initialization.

**Key features:**
- Global session cache: `{ modelPath → InferenceSession }` — so the same model is never loaded twice
- Global mutex lock: WASM is single-threaded, so only one inference runs at a time
- Sets WASM files from jsDelivr CDN: `cdn.jsdelivr.net/npm/onnxruntime-web@1.21.0/dist/`

---

#### `src/feature/ar/lib/loadArGltf.js` (~52 lines)

**Purpose:** Loads GLB/GLTF models into Three.js.

**Exports:**
- `loadGltf(url)` → Promise<THREE.Group>
- `applyPaintColor(group, hexColor)` → traverses meshes, applies color (skips glass/lights/tires/chrome by material name)
- `enableShadows(group)` → enables `castShadow` + `receiveShadow` on all meshes
- `fitToMaxDimension(group, maxSize)` → scales the model so its longest axis = `maxSize`

---

#### `src/feature/ar/lib/arTemplateConfig.js` (~309 lines)

**Purpose:** The static configuration for what 3D parts/decals exist and where they go on the car template, for each view.

**Structure:**
```js
{
  front: {
    aspectRatio: 1.6,
    anchors: [
      {
        key: "wheel-fl",
        label: "Front Left Wheel",
        nx: 0.18,   // normalized x position (0=left, 1=right)
        ny: 0.72,   // normalized y position (0=top, 1=bottom)
        wz: 0.1,    // Three.js Z depth
        type: "gltf",
        modelUrl: "/models/Wheels/Honda_City_Wheel1.glb",
        scale: 0.25,
        rotation: [0, 0, 0],
        category: "wheels"
      },
      // ... 40+ more anchors across 4 views
    ]
  },
  left: { anchors: [...] },
  right: { anchors: [...] },
  rear: { anchors: [...] }
}
```

---

#### `src/feature/ar/lib/arCoordinates.js` (~144 lines)

**Purpose:** Handles coordinate transformations between three spaces.

**Key functions:**
- `mapVideoBBoxToDisplay(bbox, videoW, videoH, containerW, containerH)` — converts video-pixel bbox to display-pixel bbox (accounts for `object-fit: cover` cropping)
- `lerpBBox(from, to, t)` — smoothly interpolates between two bboxes (used for smooth tracking)
- `getDemoBbox(containerW, containerH)` — returns a centered demo bbox when no car is detected
- `getMaskBbox(mask, w, h)` — finds the bounding box of a pixel mask (used for shape-aware snapping)

---

#### `src/feature/ar/lib/arDecalUtils.js` (~76 lines)

**Purpose:** Creates 2D decal (sticker) planes in Three.js.

**How it works:**
- Creates a `THREE.PlaneGeometry` with the correct aspect ratio
- Loads the PNG texture using a singleton `THREE.TextureLoader` (avoids duplicate GPU uploads)
- Returns a `THREE.Mesh` with `MeshBasicMaterial` (unlit — no shadows on stickers)

---

#### `src/feature/ar/lib/arPartsPubCatalog.js` (~77 lines)

**Purpose:** Static registry mapping part keys to public asset URLs.

**Example entries:**
```js
{
  "wheel-style-1":   "/models/Wheels/Honda_City_Wheel1.glb",
  "wheel-style-2":   "/models/Wheels/Honda_City_Wheel2.glb",
  "front-bumper":    "/models/Bumper/Honda_City_Frontbumper.glb",
  "rear-bumper":     "/models/Bumper/Honda_City_Rear_Bumper.glb",
  "decal-stripe-l":  "/images/decals/racing-stripeL-1.png",
  "decal-stripe-r":  "/images/decals/racing-stripeR-1.png",
  // ...
}
```

---

## 5. Machine Learning Pipeline

```
Camera Frame (video element)
        │
        ▼
┌──────────────────────────────────────────────────┐
│  Preprocessing (same for all 3 models)           │
│  1. Draw video to offscreen canvas (640×640)     │
│  2. Letterbox pad to maintain aspect ratio       │
│  3. Read pixel data (getImageData)               │
│  4. Normalize: pixel/255 → Float32 [0.0–1.0]    │
│  5. Reorder: HWC → CHW (R-channel first)         │
│  6. Wrap in ort.Tensor("float32", data, [1,3,640,640]) │
└──────────────────────────────────────────────────┘
        │
        ▼
┌──────────────────────────────────────────────────┐
│  ONNX Inference (ort.InferenceSession.run)       │
│  • Runs in WebAssembly (WASM)                    │
│  • Global mutex: only 1 model runs at a time     │
│  • Session cached (no reload on second call)     │
└──────────────────────────────────────────────────┘
        │
        ▼
┌──────────────────────────────────────────────────┐
│  Postprocessing (model-specific)                 │
│                                                  │
│  Detection model output: [1, 84, 8400]           │
│  • 84 = 4 (bbox xywh) + 80 (COCO class scores)  │
│  • 8400 = number of grid anchors                 │
│  • Filter class=2 (car), score>0.35              │
│  • NMS → largest detection                       │
│                                                  │
│  Segmentation model output:                      │
│  • output0: [1, 116, 8400] (116=4+80+32)         │
│  • output1: [1, 32, 160, 160] (prototype masks)  │
│  • mask_coefs × protos → sigmoid → 160×160 mask  │
│  • Bilinear upsample to video resolution         │
│  • Smoothstep edge sharpening                    │
└──────────────────────────────────────────────────┘
```

---

## 6. 3D Rendering Architecture

**Two separate Three.js scenes:**

### Scene 1: ArThreeOverlay (bbox-anchored)
Used in "car" mode when user has added parts to `arBuild`.

```
OrthographicCamera
  frustum: [-aspect, aspect] × [-1, 1] × [0, 100]
  
Scene
  ├── AmbientLight (intensity 1.2)
  ├── DirectionalLight (from top-left)
  └── carAnchorGroup
        ├── position: center of detected bbox (mapped to Three.js world)
        ├── scale: proportional to bbox size
        └── [GLTF models for each enabled part]
              ├── front-left wheel (offset -0.38, -0.22, 0.18)
              ├── front-right wheel (offset +0.38, -0.22, 0.18)
              ├── rear-left wheel (offset -0.38, +0.22, 0.05)
              └── rear-right wheel (offset +0.38, +0.22, 0.05)
```

### Scene 2: ArAnchoredModels (template-anchored)
Used in "template" mode.

```
OrthographicCamera (same setup)
  
Scene
  ├── Lights
  └── [One group per enabled anchor]
        ├── position: computed from (nx, ny, wz) + shape-aware override
        ├── GLTF model OR PlaneGeometry (decal)
        └── Material with partColors[anchorKey] applied
```

**Render loop:** Both scenes use `requestAnimationFrame` + `renderer.render(scene, camera)` on every frame. The canvas is positioned `absolute` on top of the `<video>` element with `pointer-events: none`.

---

## 7. Coordinate Systems

Three coordinate spaces are used. Understanding them is critical for adding new features.

```
┌─────────────────────────────────────────────────────────┐
│ Space 1: Video Pixel Space                              │
│ Origin: top-left of video element                       │
│ Range: [0, videoWidth] × [0, videoHeight]               │
│ Used by: YOLO model outputs, mask pixel indices         │
└─────────────────────┬───────────────────────────────────┘
                      │ mapVideoBBoxToDisplay()
                      ▼
┌─────────────────────────────────────────────────────────┐
│ Space 2: Container (Display) Pixel Space                │
│ Origin: top-left of the AR container div                │
│ Range: [0, containerWidth] × [0, containerHeight]       │
│ Used by: HTML canvas overlays, CSS positioning          │
│ Accounts for: object-fit:cover (video may be cropped)   │
└─────────────────────┬───────────────────────────────────┘
                      │ anchorToWorld() or custom mapping
                      ▼
┌─────────────────────────────────────────────────────────┐
│ Space 3: Three.js World Space                           │
│ Origin: center of screen                                │
│ Range: [-aspect, aspect] × [-1, 1] × [0, 100]          │
│ X: negative=left, positive=right                        │
│ Y: negative=bottom, positive=top                        │
│ Z: toward camera = positive                             │
│ Used by: Three.js object positions                      │
└─────────────────────────────────────────────────────────┘
```

**Key function:** `anchorToWorld(nx, ny, wz, templateBox, containerW, containerH)` in `arCoordinates.js` converts a normalized template position to Three.js world coordinates.

---

## 8. Public Assets

### 3D Models (`/public/models/`)

| Path | Model | Notes |
|------|-------|-------|
| `Wheels/Honda_City_Wheel1.glb` | Wheel style 1 | ~500KB |
| `Wheels/Honda_City_Wheel2.glb` | Wheel style 2 | ~500KB |
| `Hood/Honda_City_Hood.glb` | Hood replacement | |
| `Bumper/Honda_City_Frontbumper.glb` | Front bumper | |
| `Bumper/Honda_City_Rear_Bumper.glb` | Rear bumper | |
| `Door/Honda_City_LF_Door.glb` | Left front door | |
| `Door/Honda_City_LB_Door.glb` | Left rear door | |
| `Door/Honda_City_RF_Door.glb` | Right front door | |
| `Door/Honda_City_RB_Door.glb` | Right rear door | |
| `Trunk/Honda_City_Trunk.glb` | Trunk lid | |
| `Lights/Honda_City_F_Headlight.glb` | Front headlight | |
| `Lights/Honda_City_Rear_Headlight.glb` | Rear light | |
| `Spoilers/city_spoiler_1.glb` | Rear spoiler | |
| `Name_Plates/Honda_City_F_Name_Plate.glb` | Front badge | |
| `Name_Plates/Honda_City_R_Name_Plate.glb` | Rear badge | |
| `Honda_City_2022.glb` | Full car (landing page) | 1.5 MB |
| `Honda-Civic.glb` | Full car (landing page) | 16 MB |

### Decals (`/public/images/decals/`)

| File | Description |
|------|-------------|
| `racing-stripeL-1.png` | Left side racing stripe |
| `racing-stripeR-1.png` | Right side racing stripe |
| `rear-window-sticker-1.png` | Rear window decal (design 1) |
| `rear-window-sticker-2.png` | Rear window decal (design 2) |
| `side-graphic-1.png` | Side body graphic |
| `hood-1.png` | Hood decal |

**Important:** All models are Honda City variants. To support other car models, new GLB files would need to be added and mapped in `arPartsPubCatalog.js` and `arTemplateConfig.js`.

---

## 9. State Management

All state lives in `ArPreviewPage.jsx` and is passed down as props.

```js
// Mode control
const [mode, setMode] = useState("car");
// "car" | "parts" | "template"

// View (template mode only)
const [selectedView, setSelectedView] = useState("front");
// "front" | "left" | "right" | "rear"

// Paint
const [selectedColor, setSelectedColor] = useState("#1a1a2e");
// Hex string — global paint color

// Per-part color overrides (template mode)
const [partColors, setPartColors] = useState({});
// { [anchorKey: string]: hexString }

// Template mode — which parts are toggled on
const [enabledAnchors, setEnabledAnchors] = useState(new Set());
// Set of anchor keys from arTemplateConfig

// Car mode — which 3D parts are added
const [arBuild, setArBuild] = useState({});
// { [slotName: string]: { partId, modelUrl, name, category } }

// Wheel selection (car mode)
const [wheels, setWheels] = useState({
  "front-left": null,
  "front-right": null,
  "rear-left": null,
  "rear-right": null,
});

// Selected part for highlighting (parts mode)
const [selectedPart, setSelectedPart] = useState(null);
// Part class name string
```

**There is no global state library (Redux, Zustand, etc.).** Everything is local `useState` in `ArPreviewPage`. This is fine for now but will become painful if you need to share AR state with other pages (e.g., a "Save Build" feature).

---

## 10. What Needs to Be Changed or Added

These are real gaps, limitations, and missing features identified from reading the code.

---

### CRITICAL — Things That Are Broken or Incomplete

#### 1. `useViewAlignment.js` is a stub
**File:** `src/feature/ar/hooks/useViewAlignment.js`
**Problem:** Always returns `{ isLocked: true }`. The intention was to detect whether the user is holding the camera at the right angle for the selected view (front/left/right/rear). This detection was never implemented.
**Impact:** Template mode anchor positions may be wrong if the user selects "Left view" but is actually pointing the camera at the front of the car.
**Fix needed:** Implement actual view classification. Options:
- Use a simple orientation-based heuristic (compare aspect ratio of detected car bbox)
- Train/use a classifier on the car detection output to determine which view it is
- Use device orientation sensors (compass heading) as a proxy

#### 2. Wheel positions are hardcoded in ArThreeOverlay
**File:** `src/feature/ar/components/ArThreeOverlay.jsx`
**Problem:** The four wheel positions (`-0.38, -0.22, 0.18` etc.) are hardcoded relative to the car center. They don't use the detected wheel locations from `useYoloCarParts`.
**Impact:** On non-Honda-City cars, the wheels will appear in the wrong position.
**Fix needed:** Use the `carParts` wheel bboxes from `useYoloCarParts` to position wheels dynamically (the same way `ArAnchoredModels` does it in template mode).

#### 3. ArSelectionSummary and ArTemplateOverlay not fully analyzed
**Files:** `ArSelectionSummary.jsx`, `ArTemplateOverlay.jsx`
**Problem:** These files were not fully read during analysis. Their integration into `ArPreviewPage` may be partial.
**Fix needed:** Read these files, verify they are wired up correctly in `ArPreviewPage`.

#### 4. No error boundary around AR components
**Problem:** If `onnxSetup.js` fails (CDN down, WASM blocked by browser), or if camera access fails, the app currently shows a blank screen or a raw JS error.
**Fix needed:** Add a React `ErrorBoundary` around the AR feature. Show a user-friendly message with instructions (e.g., "Enable camera access in browser settings").

#### 5. ONNX WASM files loaded from CDN
**File:** `src/feature/ar/lib/onnxSetup.js`
**Problem:** `ort.env.wasm.wasmPaths` points to `cdn.jsdelivr.net`. This means the app breaks without internet (even for demo/offline use) and adds latency on first load.
**Fix needed:** Copy the WASM files to `/public/onnx-wasm/` and point to them locally. Add to `next.config.mjs` headers config if needed.

---

### HIGH PRIORITY — Missing Features

#### 6. No "Save Build" functionality
**Problem:** The user can customize the car in AR but cannot save or share their configuration. There's an `arBuild` state and `enabledAnchors` state but no persistence.
**Fix needed:**
- Add a "Save Build" button in `ArPartsPanel`
- Serialize `{ arBuild, enabledAnchors, partColors, selectedColor, selectedView }` to JSON
- POST to a backend endpoint (create `/api/builds/save`) or save to `localStorage`
- Add a "My Builds" page that loads saved configurations

#### 7. Only Honda City models are available
**File:** `src/feature/ar/lib/arPartsPubCatalog.js`, `arTemplateConfig.js`
**Problem:** All 3D models are named `Honda_City_*.glb`. If the user points the camera at a different car model, parts won't fit.
**Fix needed:**
- Either: create a car detection step that identifies the make/model (using a classifier or VIN scan)
- Or: let the user manually select their car model from a dropdown before entering AR mode
- Then: load the correct model set from the catalog

#### 8. No "Car Mode" 3D part panel
**Problem:** In "car" mode, the `arBuild` state can hold 3D parts but the UI panel doesn't expose a way to browse and add them. The user can only change paint color.
**Fix needed:** Add a part browsing section to the "car" mode panel that lets users add items to `arBuild`.

#### 9. Mobile performance issues
**Problem:** On mobile, frame skipping is increased (8 frames for detection, 9 for parts) but the models are still 12–14 MB each. Initial load is slow on mobile networks.
**Fix needed:**
- Consider model quantization (INT8 instead of FP32) — can reduce model sizes by 4×
- Consider a tiered approach: load only detection first, then lazy-load segmentation and parts models on demand
- Add a loading progress bar

#### 10. No lighting environment for 3D models
**File:** `src/feature/ar/components/ArThreeOverlay.jsx`, `ArAnchoredModels.jsx`
**Problem:** Only `AmbientLight` + one `DirectionalLight` are used. The 3D models look flat and don't match the real-world lighting in the camera feed.
**Fix needed:** Add an `RGBELoader` environment map (HDR) that matches a typical outdoor parking scene. Three.js has built-in support for this. This dramatically improves visual realism.

---

### MEDIUM PRIORITY — Code Quality & Refactoring

#### 11. State in ArPreviewPage is getting large
**Problem:** `ArPreviewPage.jsx` has 8+ state variables and directly renders 10+ children. As features grow, this will become hard to maintain.
**Fix needed:** Extract state into a custom hook `useArState()` or use a lightweight state container (Zustand) so AR state can be shared without prop drilling.

#### 12. arTemplateConfig.js has duplicate data for L/R views
**Problem:** The `left` and `right` views in `arTemplateConfig.js` likely mirror each other with just the X coordinates flipped. This is ~150 lines of near-duplicate config.
**Fix needed:** Define anchors for one side and auto-generate the mirror. This reduces the chance of bugs where left and right get out of sync.

#### 13. No loading states for GLTF models
**Problem:** When a user enables an anchor in template mode, the 3D model starts loading (network fetch of a GLB file) but there's no loading indicator. The model just "pops in" when ready.
**Fix needed:** Add a loading skeleton or spinner per anchor slot while the GLB loads.

#### 14. Paint color doesn't work on all materials
**File:** `src/feature/ar/lib/loadArGltf.js` — `applyPaintColor()`
**Problem:** The function skips materials whose names contain "glass", "light", "tire", "chrome". This list may miss material names used in some GLB files.
**Fix needed:** Use a whitelist approach instead — only apply paint to materials explicitly tagged as "body" or "paint", not a blacklist of exceptions.

---

### LOW PRIORITY — Nice to Have

#### 15. Share / Export feature
- Let user take a screenshot of the AR view with overlays baked in
- Share as image to social media or download
- Implementation: `canvas.toBlob()` + `URL.createObjectURL()`

#### 16. Comparison mode
- Split screen: before (original car) vs after (with customizations)
- Useful for the landing page demo

#### 17. AR tour / onboarding
- First-time users don't know to point the camera at a car or how to switch modes
- Add a brief animated onboarding overlay

#### 18. `ArDetectionOverlay` should be hidden in production
**File:** `src/feature/ar/components/ArDetectionOverlay.jsx`
**Problem:** The debug bbox visualization may be visible to end users if not gated.
**Fix needed:** Gate behind `process.env.NODE_ENV === 'development'` or a debug query param.

#### 19. Decouple Three.js scene creation from component render
**Problem:** Each re-render of `ArThreeOverlay` or `ArAnchoredModels` could inadvertently recreate the Three.js scene. This is avoided by refs but it's fragile.
**Fix needed:** Move scene + renderer creation into a stable ref initialized once in `useEffect(()=>{...}, [])`.

---

## Quick Reference: Adding a New AR Part

To add a new 3D part (e.g., a new spoiler model):

1. **Add the GLB file** to `/public/models/Spoilers/new_spoiler.glb`
2. **Register it** in `arPartsPubCatalog.js`:
   ```js
   "spoiler-style-2": "/models/Spoilers/new_spoiler.glb"
   ```
3. **Add anchor config** in `arTemplateConfig.js` for each relevant view:
   ```js
   {
     key: "spoiler-style-2",
     label: "Spoiler Style 2",
     nx: 0.5, ny: 0.2, wz: 0.1,
     type: "gltf",
     modelUrl: "/models/Spoilers/new_spoiler.glb",
     scale: 0.3,
     rotation: [0, 0, 0],
     category: "spoilers"
   }
   ```
4. **Add a toggle button** in `ArPartsPanel.jsx` in the "template" mode section
5. **Test**: Open `/ar-view`, switch to "template" mode, select the relevant view, toggle the new part

---

## Quick Reference: Adding a New Decal

1. **Add the PNG** to `/public/images/decals/new-decal.png` (use transparent background)
2. **Register it** in `arPartsPubCatalog.js`:
   ```js
   "decal-new": "/images/decals/new-decal.png"
   ```
3. **Add anchor config** in `arTemplateConfig.js`:
   ```js
   {
     key: "decal-new",
     label: "New Decal",
     nx: 0.5, ny: 0.5, wz: 0.05,
     type: "decal",
     decalUrl: "/images/decals/new-decal.png",
     scale: 0.4,
     category: "decals"
   }
   ```
4. **Add toggle in panel** — same as above

---

*Generated: 2026-06-14 | BuildMyRide AR Feature Walkthrough*
