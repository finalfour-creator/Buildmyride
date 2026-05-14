import mongoose from "mongoose";

const CarModelSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  brand: {
    type: String,
    required: true
  },
  chassisUrl: {
    type: String,
    required: true
  },
  modelUrl: String, // Keeping as fallback for legacy support
}, { timestamps: true });

const CarModel = mongoose.models.CarModel || mongoose.model("CarModel", CarModelSchema);

export default CarModel;