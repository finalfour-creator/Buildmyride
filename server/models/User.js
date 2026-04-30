import mongoose from "mongoose";

const userSchema = new mongoose.Schema({name: { type: String, required: true, trim: true },email: { type: String, required: true, unique: true },password: String}, { timestamps: true });

export default mongoose.model("User", userSchema);