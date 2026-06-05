// AR dev-mode catalog: assets served directly from /public (no DB/back-end required for placement).
// Update/extend this mapping as new GLB decals/models are added under client/public.

export const AR_PUBLIC_ASSETS = {
  // 2D decals (PNG)
  decals: {
    "racing-stripeR-1": { url: "/images/decals/racing-stripeR-1.png", type: "decal" },
    "racing-stripL-1": { url: "/images/decals/racing-stripL-1.png", type: "decal" },
    "rear-window-sticker-1": { url: "/images/decals/rear-window-sticker-1.png", type: "decal" },
    "rear-window-sticker-2": { url: "/images/decals/rear-window-sticker-2.png", type: "decal" },
    "side-graphic-1": { url: "/images/decals/side-graphic-1.png", type: "decal" },
    // Add more decals here...
  },

  // 3D models (GLB)
  models: {
    // Wheels/tyres
    "Honda_City_FR_Tyre.glb": {
      url: "/models/Wheels/Honda_City_FR_Tyre.glb",
      type: "model",
      fit: { maxDimension: 0.22 },
    },
    "Honda_City_FL_Tyre.glb": {
      url: "/models/Wheels/Honda_City_FL_Tyre.glb",
      type: "model",
      fit: { maxDimension: 0.22 },
    },
    "Honda_City_BR_Tyre.glb": {
      url: "/models/Wheels/Honda_City_BR_Tyre.glb",
      type: "model",
      fit: { maxDimension: 0.22 },
    },
    "Honda_City_BL_Tyre.glb": {
      url: "/models/Wheels/Honda_City_BL_Tyre.glb",
      type: "model",
      fit: { maxDimension: 0.22 },
    },

    // Example body parts (if you want them in AR too)
    "Honda_City_Frontbumper.glb": {
      url: "/models/Bumper/Honda_City_Frontbumper.glb",
      type: "model",
      fit: { maxDimension: 0.45 },
    },
    "Honda_City_Rear_Bumper.glb": {
      url: "/models/Bumper/Honda_City_Rear_Bumper.glb",
      type: "model",
      fit: { maxDimension: 0.45 },
    },
    "Honda_City_Hood.glb": {
      url: "/models/Hood/Honda_City_Hood.glb",
      type: "model",
      fit: { maxDimension: 0.45 },
    },

    "Honda_City_trunk.glb": {
      url: "/models/Trunk/Honda_City_Trunk.glb",
      type: "model",
      fit: { maxDimension: 0.35 },
    },

    "city_spoiler_1.glb": {
      url: "/models/Spoilers/city_spoiler_1.glb",
      type: "model",
      fit: { maxDimension: 0.35 },
    },
  },
};

// Helper to resolve public asset by an arbitrary key.
export function resolvePublicAsset(assetKey) {
  if (AR_PUBLIC_ASSETS.decals[assetKey]) return AR_PUBLIC_ASSETS.decals[assetKey];
  if (AR_PUBLIC_ASSETS.models[assetKey]) return AR_PUBLIC_ASSETS.models[assetKey];
  return null;
}

