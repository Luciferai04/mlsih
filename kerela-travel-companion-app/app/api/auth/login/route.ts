import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = body

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 })
    }

    // Simulate authentication
    const user = {
      id: "12345",
      email,
      firstName: "John",
      lastName: "Doe",
      phone: "+1234567890",
      state: "California",
      city: "San Francisco",
      nationality: "American",
      verified: true,
    }

    return NextResponse.json({
      success: true,
      user,
      token: "mock-jwt-token",
    })
  } catch (error) {
    return NextResponse.json({ error: "Login failed" }, { status: 500 })
  }
}
