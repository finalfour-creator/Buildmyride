import mongoose from "mongoose";

const PartSchema = new mongoose.Schema({
  name: String,
  modelUrl: String
});

const CarModelSchema = new mongoose.Schema({
  name: String,
  brand: String,
  modelUrl: String,
  colors: [
    {
      name: String,
      value: String
    }
  ],

   parts: {
    wheels: [PartSchema],
    // hood: [PartSchema],
    // bumper: [PartSchema]
  }
});

const CarModel = mongoose.models.CarModel || mongoose.model("CarModel", CarModelSchema);

export default CarModel;