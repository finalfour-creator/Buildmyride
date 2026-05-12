import mongoose from "mongoose";

const PartSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
    enum: ["Hood", "Spoilers", "Wheels", "Bumper", "Door", "Lights", "Name_Plates", "Trunk"], 
  },
  modelUrl: {
    type: String,
    required: true,
  },
  thumbnail: {
    type: String,
  },
  // This links the part to specific car chassis
  compatibleCars: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "CarModel",
  }],
  price: {
    type: Number,
    default: 0,
  }
}, { timestamps: true });

const Part = mongoose.models.Part || mongoose.model("Part", PartSchema);
export default Part;
