import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password, firstName, lastName, phone, state, city, nationality, gdprConsent } = body

    // Validate required fields
    if (!email || !password || !firstName || !lastName || !phone || !state || !city || !nationality || !gdprConsent) {
      return NextResponse.json({ error: "All fields are required including GDPR consent" }, { status: 400 })
    }

    // Simulate user registration
    const user = {
      id: Math.random().toString(36).substr(2, 9),
      email,
      firstName,
      lastName,
      phone,
      state,
      city,
      nationality,
      createdAt: new Date().toISOString(),
      verified: false,
    }

    // In production, this would save to database and send OTP
    console.log("User registered:", user)

    return NextResponse.json({
      success: true,
      message: "Registration successful. OTP sent to your phone.",
      userId: user.id,
    })
  } catch (error) {
    return NextResponse.json({ error: "Registration failed" }, { status: 500 })
  }
}
