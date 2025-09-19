import { type NextRequest, NextResponse } from "next/server"

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json()
    const { endLocation, endTime, distance, duration, cost } = body

    const updatedTrip = {
      id: params.id,
      endLocation,
      endTime,
      distance,
      duration,
      cost,
      status: "completed",
    }

    return NextResponse.json({
      success: true,
      trip: updatedTrip,
    })
  } catch (error) {
    return NextResponse.json({ error: "Failed to update trip" }, { status: 500 })
  }
}
