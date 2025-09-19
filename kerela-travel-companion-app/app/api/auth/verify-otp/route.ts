import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, otp } = body

    if (!userId || !otp) {
      return NextResponse.json({ error: "User ID and OTP are required" }, { status: 400 })
    }

    // Simulate OTP verification
    if (otp === "123456") {
      return NextResponse.json({
        success: true,
        message: "Phone number verified successfully",
      })
    } else {
      return NextResponse.json({ error: "Invalid OTP" }, { status: 400 })
    }
  } catch (error) {
    return NextResponse.json({ error: "OTP verification failed" }, { status: 500 })
  }
}
