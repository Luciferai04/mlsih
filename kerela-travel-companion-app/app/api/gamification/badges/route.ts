import { NextResponse } from "next/server"

export async function GET() {
  try {
    const badges = [
      {
        id: "1",
        name: "First Journey",
        description: "Complete your first trip",
        icon: "🚀",
        rarity: "common",
        earned: true,
        earnedDate: "2024-01-15T10:00:00Z",
      },
      {
        id: "2",
        name: "Eco Warrior",
        description: "Use public transport 10 times",
        icon: "🌱",
        rarity: "rare",
        earned: true,
        earnedDate: "2024-01-20T15:30:00Z",
      },
      {
        id: "3",
        name: "Distance Master",
        description: "Travel 1000km in total",
        icon: "🏆",
        rarity: "epic",
        earned: false,
        progress: 75,
      },
    ]

    return NextResponse.json({ badges })
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch badges" }, { status: 500 })
  }
}
