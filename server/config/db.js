import mongoose from "mongoose";

const connectDB = async () => {
  try {
    const conn = await mongoose.connect("mongodb+srv://Furqan:Furqan@cluster0.lnt86oh.mongodb.net/BuildMyRide");

    console.log(`✅ MongoDB Connected: ${conn.connection.host} and DB: ${conn.connection.name}`);
  } catch (error) {
    console.error("❌ DB Connection Failed:", error.message);
    process.exit(1);
  }
};

export default connectDB;