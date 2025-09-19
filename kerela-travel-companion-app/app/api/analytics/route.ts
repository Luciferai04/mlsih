import { NextResponse } from "next/server"

export async function GET() {
  try {
    const analytics = {
      totalTrips: 24,
      totalDistance: 1250.5,
      totalCost: 340.75,
      avgTripDuration: 185,
      favoriteTransport: "car",
      monthlyData: [
        { month: "Jan", trips: 8, distance: 420, cost: 125 },
        { month: "Feb", trips: 6, distance: 380, cost: 95 },
        { month: "Mar", trips: 10, distance: 450.5, cost: 120.75 },
      ],
      transportDistribution: [
        { mode: "Car", percentage: 45, trips: 11 },
        { mode: "Train", percentage: 25, trips: 6 },
        { mode: "Bus", percentage: 20, trips: 5 },
        { mode: "Walk", percentage: 10, trips: 2 },
      ],
      achievements: {
        totalXP: 2450,
        level: 8,
        badges: 12,
        streakDays: 15,
      },
    }

    return NextResponse.json(analytics)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch analytics" }, { status: 500 })
  }
}
