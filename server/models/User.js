import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: String,
  name: String,
  role: { type: String, enum: ["user", "admin"], default: "user" },
}, { timestamps: true });

export default mongoose.model("User", userSchema);