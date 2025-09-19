import { NextResponse } from "next/server"

export async function GET() {
  try {
    const leaderboard = [
      { rank: 1, name: "Alex Chen", xp: 3250, level: 12, avatar: "👨‍💼" },
      { rank: 2, name: "Sarah Johnson", xp: 2890, level: 10, avatar: "👩‍🎓" },
      { rank: 3, name: "You", xp: 2450, level: 8, avatar: "👤", isCurrentUser: true },
      { rank: 4, name: "Mike Wilson", xp: 2100, level: 7, avatar: "👨‍🔧" },
      { rank: 5, name: "Emma Davis", xp: 1950, level: 6, avatar: "👩‍💻" },
    ]

    return NextResponse.json({ leaderboard })
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch leaderboard" }, { status: 500 })
  }
}
