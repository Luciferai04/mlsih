import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { type, location, data, photos, notes } = body

    const entry = {
      id: Math.random().toString(36).substr(2, 9),
      type,
      location,
      data,
      photos: photos || [],
      notes,
      timestamp: new Date().toISOString(),
      userId: "current-user-id",
    }

    // In production, this would save to database
    console.log("Data entry saved:", entry)

    return NextResponse.json({
      success: true,
      entry,
      message: "Data collected successfully",
    })
  } catch (error) {
    return NextResponse.json({ error: "Failed to save data" }, { status: 500 })
  }
}

export async function GET() {
  try {
    const entries = [
      {
        id: "1",
        type: "location",
        location: { lat: 37.7749, lng: -122.4194, name: "San Francisco, CA" },
        data: { category: "tourist_spot", rating: 4.5 },
        notes: "Beautiful view from Golden Gate Bridge",
        timestamp: "2024-01-15T14:30:00Z",
      },
      {
        id: "2",
        type: "expense",
        location: { lat: 34.0522, lng: -118.2437, name: "Los Angeles, CA" },
        data: { amount: 25.5, category: "food", currency: "USD" },
        notes: "Lunch at local restaurant",
        timestamp: "2024-01-16T12:15:00Z",
      },
    ]

    return NextResponse.json({ entries })
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch data entries" }, { status: 500 })
  }
}
