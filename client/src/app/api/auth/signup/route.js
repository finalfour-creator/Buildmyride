// "use server" not needed for client requests
import connectDB from "@/lib/mongodb"; // your Mongo connection
import User from "@/models/User"; // your user model
import { NextResponse } from "next/server";

export async function POST(req) {
  await connectDB(); // make sure DB is connected

  try {
    const body = await req.json();
    const { name, email, password } = body;

    // basic validation
    if (!name || !email || !password) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    }

    // check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json({ error: "User already exists" }, { status: 400 });
    }

    // create new user
    const newUser = await User.create({ name, email, password }); // hash password in real apps
    return NextResponse.json({ message: "User created successfully", user: newUser }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}