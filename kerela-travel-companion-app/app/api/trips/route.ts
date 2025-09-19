import { type NextRequest, NextResponse } from "next/server"

export async function GET() {
  try {
    // Mock trip data
    const trips = [
      {
        id: "1",
        startLocation: "San Francisco, CA",
        endLocation: "Los Angeles, CA",
        startTime: "2024-01-15T08:00:00Z",
        endTime: "2024-01-15T14:30:00Z",
        distance: 382.5,
        duration: 390,
        transportMode: "car",
        cost: 45.2,
        companions: 2,
        status: "completed",
      },
      {
        id: "2",
        startLocation: "Los Angeles, CA",
        endLocation: "San Diego, CA",
        startTime: "2024-01-16T09:15:00Z",
        endTime: "2024-01-16T12:45:00Z",
        distance: 120.8,
        duration: 210,
        transportMode: "train",
        cost: 28.5,
        companions: 1,
        status: "completed",
      },
    ]

    return NextResponse.json({ trips })
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch trips" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { startLocation, endLocation, transportMode, companions } = body

    const newTrip = {
      id: Math.random().toString(36).substr(2, 9),
      startLocation,
      endLocation,
      startTime: new Date().toISOString(),
      transportMode,
      companions: companions || 0,
      status: "active",
    }

    return NextResponse.json({
      success: true,
      trip: newTrip,
    })
  } catch (error) {
    return NextResponse.json({ error: "Failed to start trip" }, { status: 500 })
  }
}
