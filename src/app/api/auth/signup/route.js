import { NextResponse } from "next/server";

export async function POST(req) {
  return NextResponse.json(
    { error: "Signup is handled directly by the Express backend at /api/auth/register" },
    { status: 501 }
  );
}