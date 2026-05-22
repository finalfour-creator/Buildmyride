import mongoose from "mongoose";

/**
 * Saved AR Preview session (separate from Design / 3D customization).
 * thumbnail = snapshot PNG (base64 or URL) at save time
 * state = selected parts to reload in AR later
 */
const arPreviewSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: {
      type: String,
      default: "AR Preview",
    },
    thumbnail: {
      type: String,
      default: "",
    },
    state: {
      paint: {
        color: { type: String, default: "#ffffff" },
        finish: { type: String, default: "glossy" },
      },
      appliedParts: {
        type: mongoose.Schema.Types.Mixed,
        default: {},
      },
      wheels: {
        type: Map,
        of: String,
        default: {},
      },
    },
  },
  { timestamps: true }
);

const ArPreview =
  mongoose.models.ArPreview || mongoose.model("ArPreview", arPreviewSchema);

export default ArPreview;
