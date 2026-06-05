/**
 * AR Template Configuration
 *
 * Defines per-view templates, anchor points, and model assignments.
 *
 * Coordinate conventions:
 *   nx, ny  — normalised [0,1] within the template box (0,0 = top-left)
 *   wz      — world-space depth offset toward camera (positive = closer)
 *   model   — public path to .glb, or null if not available
 */

// ── View identifiers ─────────────────────────────────────────────────────────
export const VIEWS = ["front", "left", "right", "rear"];

export const VIEW_LABELS = {
  front: "Front",
  left:  "Left Side",
  right: "Right Side",
  rear:  "Rear",
};

export const VIEW_ICONS = {
  front: "▲",
  left:  "◀",
  right: "▶",
  rear:  "▼",
};

// Template width/height ratio per view
export const TEMPLATE_ASPECT = {
  front: 1.30,
  rear:  1.30,
  left:  2.45,
  right: 2.45,
};

// Template occupies this fraction of the container's shorter dimension
export const TEMPLATE_SIZE_FRACTION = 0.70;

// IoU thresholds for alignment state machine
export const ALIGN_LOCK_THRESHOLD   = 0.45; // car must fill this fraction of template to lock
export const ALIGN_UNLOCK_THRESHOLD = 0.28; // drops below this to unlock

/**
 * Anchor points per view.
 * Each anchor has:
 *   nx, ny  — normalised position within template [0,1]
 *   wz      — world-space Z offset (depth toward camera)
 *   model   — .glb path or null
 *   scale   — scale relative to template height (1.0 = fills template height)
 *   rotation — [x,y,z] Euler angles in radians
 *   label   — human-readable name
 */
export const ANCHOR_CONFIG = {

  // ── FRONT VIEW ─────────────────────────────────────────────────────────────
  front: {
    hood: {
      nx: 0.500, ny: 0.22, wz: 0.18,
      model: "/models/Hood/Honda_City_Hood.glb",
      scale: 1.05, rotation: [0, 0, 0],
      label: "Hood",
    },
    front_bumper: {
      nx: 0.500, ny: 0.87, wz: 0.12,
      model: "/models/Bumper/Honda_City_Frontbumper.glb",
      scale: 1.05, rotation: [0, 0, 0],
      label: "Front Bumper",
    },
    headlight_left: {
      nx: 0.195, ny: 0.34, wz: 0.14,
      model: "/models/Lights/Honda_City_F_Headlight.glb",
      scale: 0.42, rotation: [0, 0, 0],
      label: "Left Headlight",
    },
    headlight_right: {
      nx: 0.805, ny: 0.34, wz: 0.14,
      model: "/models/Lights/Honda_City_F_Headlight.glb",
      scale: 0.42, rotation: [0, Math.PI, 0],
      label: "Right Headlight",
    },
    name_plate: {
      nx: 0.500, ny: 0.60, wz: 0.10,
      model: "/models/Name_Plates/Honda_City_F_Name_Plate.glb",
      scale: 0.35, rotation: [0, 0, 0],
      label: "Front Name Plate",
    },
    hood_decal: {
      nx: 0.500, ny: 0.26, wz: 0.19,
      texture: "/images/decals/hood-1.png",
      scale: 0.32, aspect: 1.0,
      label: "Hood Decal",
    },
  },

  // ── REAR VIEW ──────────────────────────────────────────────────────────────
  rear: {
    spoiler: {
      nx: 0.500, ny: 0.06, wz: 0.22,
      model: "/models/Spoilers/city_spoiler_1.glb",
      scale: 0.85, rotation: [0, 0, 0],
      label: "Spoiler",
    },
    trunk: {
      nx: 0.500, ny: 0.35, wz: 0.14,
      model: "/models/Trunk/Honda_City_Trunk.glb",
      scale: 0.95, rotation: [0, Math.PI, 0],
      label: "Trunk",
    },
    rear_bumper: {
      nx: 0.500, ny: 0.87, wz: 0.12,
      model: "/models/Bumper/Honda_City_Rear_Bumper.glb",
      scale: 1.05, rotation: [0, Math.PI, 0],
      label: "Rear Bumper",
    },
    taillight_left: {
      nx: 0.195, ny: 0.44, wz: 0.12,
      model: "/models/Lights/Honda_City_Rear_Headlight.glb",
      scale: 0.42, rotation: [0, 0, 0],
      label: "Left Taillight",
    },
    taillight_right: {
      nx: 0.805, ny: 0.44, wz: 0.12,
      model: "/models/Lights/Honda_City_Rear_Headlight.glb",
      scale: 0.42, rotation: [0, Math.PI, 0],
      label: "Right Taillight",
    },
    name_plate: {
      nx: 0.500, ny: 0.70, wz: 0.10,
      model: "/models/Name_Plates/Honda_City_R_Name_Plate.glb",
      scale: 0.35, rotation: [0, Math.PI, 0],
      label: "Rear Name Plate",
    },
    window_sticker_1: {
      nx: 0.500, ny: 0.28, wz: 0.15,
      texture: "/images/decals/rear-window-sticker-1.png",
      scale: 0.40, aspect: 1.2,
      label: "Window Sticker (Logo)",
    },
    window_sticker_2: {
      nx: 0.500, ny: 0.28, wz: 0.15,
      texture: "/images/decals/rear-window-sticker-2.png",
      scale: 0.40, aspect: 1.8,
      label: "Window Sticker (Text)",
    },
  },

  // ── LEFT SIDE VIEW ─────────────────────────────────────────────────────────
  left: {
    wheel_front: {
      nx: 0.210, ny: 0.80, wz: 0.18,
      model: "/models/Wheels/Honda_City_Wheel1.glb",

      scale: 0.58, rotation: [0, Math.PI / 2, 0],
      label: "Front Wheel",
    },
    wheel_rear: {
      nx: 0.790, ny: 0.80, wz: 0.18,
      model: "/models/Wheels/Honda_City_Wheel1.glb",

      scale: 0.58, rotation: [0, Math.PI / 2, 0],
      label: "Rear Wheel",
    },
    door_front: {
      nx: 0.360, ny: 0.53, wz: 0.08,
      model: "/models/Door/Honda_City_LF_Door.glb",
      scale: 0.90, rotation: [0, Math.PI / 2, 0],
      label: "Front Door",
    },
    door_rear: {
      nx: 0.620, ny: 0.53, wz: 0.08,
      model: "/models/Door/Honda_City_LB_Door.glb",
      scale: 0.90, rotation: [0, Math.PI / 2, 0],
      label: "Rear Door",
    },
    racing_stripe: {
      nx: 0.500, ny: 0.58, wz: 0.10,
      texture: "/images/decals/racing-stripL-1.png",
      scale: 0.20, aspect: 5.5,
      label: "Racing Stripe",
    },
    side_graphic: {
      nx: 0.440, ny: 0.58, wz: 0.11,
      texture: "/images/decals/side-graphic-1.png",
      scale: 0.30, aspect: 1.5,
      label: "Side Graphic",
    },
  },

  // ── RIGHT SIDE VIEW ────────────────────────────────────────────────────────
  right: {
    wheel_front: {
      nx: 0.790, ny: 0.80, wz: 0.18,
      model: "/models/Wheels/Honda_City_Wheel1.glb",

      scale: 0.58, rotation: [0, -Math.PI / 2, 0],
      label: "Front Wheel",
    },
    wheel_rear: {
      nx: 0.210, ny: 0.80, wz: 0.18,
      model: "/models/Wheels/Honda_City_BR_Tyre.glb",
      scale: 0.58, rotation: [0, -Math.PI / 2, 0],
      label: "Rear Wheel",
    },
    door_front: {
      nx: 0.640, ny: 0.53, wz: 0.08,
      model: "/models/Door/Honda_City_RF_Door.glb",
      scale: 0.90, rotation: [0, -Math.PI / 2, 0],
      label: "Front Door",
    },
    door_rear: {
      nx: 0.380, ny: 0.53, wz: 0.08,
      model: "/models/Door/Honda_City_RB_Door.glb",
      scale: 0.90, rotation: [0, -Math.PI / 2, 0],
      label: "Rear Door",
    },
    racing_stripe: {
      nx: 0.500, ny: 0.58, wz: 0.10,
      texture: "/images/decals/racing-stripeR-1.png",
      scale: 0.20, aspect: 5.5,
      label: "Racing Stripe",
    },
    side_graphic: {
      nx: 0.560, ny: 0.58, wz: 0.11,
      texture: "/images/decals/side-graphic-1.png",
      scale: 0.30, aspect: 1.5,
      label: "Side Graphic",
    },
  },
};

/**
 * Returns the template box in container (display) pixel coordinates.
 * The box is centered in the container.
 */
export function getTemplateBox(view, containerW, containerH) {
  const aspect  = TEMPLATE_ASPECT[view] ?? 1.30;
  const shorter  = Math.min(containerW, containerH);
  let h = shorter * TEMPLATE_SIZE_FRACTION;
  let w = h * aspect;
  // Prevent overflow on narrow screens
  if (w > containerW * 0.92) { w = containerW * 0.92; h = w / aspect; }
  return {
    cx: containerW / 2,
    cy: containerH / 2,
    w, h,
    x: containerW / 2 - w / 2,
    y: containerH / 2 - h / 2,
  };
}

/**
 * Convert a normalised anchor position to Three.js world coordinates.
 * The orthographic camera covers [-aspect, aspect] × [-1, 1].
 */
export function anchorToWorld(nx, ny, wz, templateBox, containerW, containerH) {
  const cameraAspect = containerW / containerH;
  // Map template pixel coords to world coords
  const px = templateBox.cx + (nx - 0.5) * templateBox.w;
  const py = templateBox.cy + (ny - 0.5) * templateBox.h;
  const wx = (px / containerW * 2 - 1) * cameraAspect;
  const wy = -(py / containerH * 2 - 1);
  return [wx, wy, wz];
}

/**
 * Compute the template box mapped back into video pixel coordinates.
 * Used for alignment detection against the car mask.
 */
export function getTemplateBoxInVideoCoords(view, containerW, containerH, videoW, videoH) {
  const tb = getTemplateBox(view, containerW, containerH);
  // object-fit:cover geometry
  const va = videoW / videoH, ca = containerW / containerH;
  let renderW, renderH, offX = 0, offY = 0;
  if (va > ca) { renderH = containerH; renderW = containerH * va; offX = (containerW - renderW) / 2; }
  else         { renderW = containerW; renderH = containerW / va; offY = (containerH - renderH) / 2; }
  const scaleX = videoW / renderW, scaleY = videoH / renderH;
  return {
    x:  (tb.x - offX) * scaleX,
    y:  (tb.y - offY) * scaleY,
    w:  tb.w * scaleX,
    h:  tb.h * scaleY,
  };
}
