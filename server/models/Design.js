import mongoose from "mongoose";

const designSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: {
      type: String,
      default: "Untitled Design",
    },
    thumbnail: {
      type: String,
      default: "",
    },
    state: {
      carId: { type: String, required: true },
      paint: {
        color: { type: String, default: "#ffffff" },
        finish: { type: String, default: "glossy" },
      },
      modularParts: {
        type: Map,
        of: String, // Stores partId or modelUrl keyed by slot (e.g. Front_Bumper)
        default: {},
      },
      wheels: {
        type: Map,
        of: String, // Stores wheelUrl keyed by position (e.g. front-left)
        default: {},
      },
    },
  },
  { timestamps: true }
);

const Design = mongoose.model("Design", designSchema);
export default Design;
