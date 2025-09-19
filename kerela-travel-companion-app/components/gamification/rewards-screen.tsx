"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Award, Trophy, Star, Target, Zap, MapPin, Leaf, Clock, Users, TrendingUp, Gift, Crown } from "lucide-react"

interface RewardsScreenProps {
  onBack: () => void
}

export default function RewardsScreen({ onBack }: RewardsScreenProps) {
  const [activeTab, setActiveTab] = useState("badges")

  const userStats = {
    level: 12,
    xp: 2450,
    xpToNext: 550,
    totalPoints: 15680,
    rank: 47,
    totalUsers: 1250,
  }

  const badges = [
    {
      id: 1,
      name: "Explorer",
      description: "Complete 5 trips",
      icon: MapPin,
      earned: true,
      earnedDate: "2024-01-15",
      rarity: "common",
      points: 100,
    },
    {
      id: 2,
      name: "Distance Master",
      description: "Travel 1000+ km",
      icon: Target,
      earned: true,
      earnedDate: "2024-01-20",
      rarity: "rare",
      points: 250,
    },
    {
      id: 3,
      name: "Eco Warrior",
      description: "Use public transport 50 times",
      icon: Leaf,
      earned: false,
      progress: 32,
      target: 50,
      rarity: "epic",
      points: 500,
    },
    {
      id: 4,
      name: "Speed Demon",
      description: "Complete trip in under 30 minutes",
      icon: Zap,
      earned: true,
      earnedDate: "2024-01-18",
      rarity: "uncommon",
      points: 150,
    },
    {
      id: 5,
      name: "Social Traveler",
      description: "Travel with 10 different companions",
      icon: Users,
      earned: false,
      progress: 6,
      target: 10,
      rarity: "rare",
      points: 300,
    },
    {
      id: 6,
      name: "Early Bird",
      description: "Start 20 trips before 7 AM",
      icon: Clock,
      earned: false,
      progress: 12,
      target: 20,
      rarity: "uncommon",
      points: 200,
    },
    {
      id: 7,
      name: "Legendary Traveler",
      description: "Travel 10,000+ km total",
      icon: Crown,
      earned: false,
      progress: 1247,
      target: 10000,
      rarity: "legendary",
      points: 1000,
    },
  ]

  const leaderboard = [
    { rank: 1, name: "Sarah Johnson", points: 25680, avatar: "", level: 18 },
    { rank: 2, name: "Mike Chen", points: 23450, avatar: "", level: 17 },
    { rank: 3, name: "Alex Kumar", points: 21200, avatar: "", level: 16 },
    { rank: 4, name: "Emma Wilson", points: 19800, avatar: "", level: 15 },
    { rank: 5, name: "David Lee", points: 18900, avatar: "", level: 15 },
    { rank: 47, name: "You", points: 15680, avatar: "", level: 12, isUser: true },
  ]

  const achievements = [
    {
      title: "Weekly Streak",
      description: "Travel every day this week",
      progress: 5,
      target: 7,
      reward: "50 XP",
      timeLeft: "2 days",
    },
    {
      title: "Distance Challenge",
      description: "Travel 200 km this month",
      progress: 147,
      target: 200,
      reward: "Distance Master Badge",
      timeLeft: "12 days",
    },
    {
      title: "Eco Challenge",
      description: "Use public transport 10 times",
      progress: 7,
      target: 10,
      reward: "100 Points",
      timeLeft: "5 days",
    },
  ]

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case "common":
        return "bg-gray-100 text-gray-800 border-gray-300"
      case "uncommon":
        return "bg-green-100 text-green-800 border-green-300"
      case "rare":
        return "bg-blue-100 text-blue-800 border-blue-300"
      case "epic":
        return "bg-purple-100 text-purple-800 border-purple-300"
      case "legendary":
        return "bg-yellow-100 text-yellow-800 border-yellow-300"
      default:
        return "bg-gray-100 text-gray-800 border-gray-300"
    }
  }

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="w-5 h-5 text-yellow-500" />
    if (rank === 2) return <Trophy className="w-5 h-5 text-gray-400" />
    if (rank === 3) return <Award className="w-5 h-5 text-orange-500" />
    return <span className="text-sm font-bold">#{rank}</span>
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-md mx-auto bg-background min-h-screen">
        {/* Header */}
        <header className="bg-gradient-to-r from-primary to-accent text-primary-foreground p-4 rounded-b-lg">
          <div className="flex items-center gap-3">
            <Button
              onClick={onBack}
              variant="ghost"
              size="sm"
              className="text-primary-foreground hover:bg-primary-foreground/20"
            >
              ←
            </Button>
            <div className="flex-1">
              <h1 className="text-xl font-bold">Rewards & Achievements</h1>
              <p className="text-sm opacity-90">
                Level {userStats.level} • {userStats.totalPoints} points
              </p>
            </div>
            <div className="text-right">
              <div className="text-sm opacity-90">Rank</div>
              <div className="text-lg font-bold">#{userStats.rank}</div>
            </div>
          </div>

          {/* XP Progress */}
          <div className="mt-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span>Level {userStats.level}</span>
              <span>
                {userStats.xp} / {userStats.xp + userStats.xpToNext} XP
              </span>
            </div>
            <Progress value={(userStats.xp / (userStats.xp + userStats.xpToNext)) * 100} className="h-2" />
            <div className="text-xs opacity-75">{userStats.xpToNext} XP to next level</div>
          </div>
        </header>

        <main className="p-4 space-y-4">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="badges">Badges</TabsTrigger>
              <TabsTrigger value="challenges">Challenges</TabsTrigger>
              <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
            </TabsList>

            <TabsContent value="badges" className="space-y-4">
              {/* Badge Collection */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="w-5 h-5 text-primary" />
                    Badge Collection ({badges.filter((b) => b.earned).length}/{badges.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-3">
                    {badges.map((badge) => {
                      const IconComponent = badge.icon
                      return (
                        <div
                          key={badge.id}
                          className={`p-4 rounded-lg border-2 transition-all ${
                            badge.earned ? "bg-primary/5 border-primary/20" : "bg-muted/50 border-muted opacity-60"
                          }`}
                        >
                          <div className="text-center space-y-2">
                            <div
                              className={`w-12 h-12 mx-auto rounded-full flex items-center justify-center ${
                                badge.earned ? "bg-primary/10" : "bg-muted"
                              }`}
                            >
                              <IconComponent
                                className={`w-6 h-6 ${badge.earned ? "text-primary" : "text-muted-foreground"}`}
                              />
                            </div>
                            <div>
                              <p className="font-medium text-sm">{badge.name}</p>
                              <p className="text-xs text-muted-foreground">{badge.description}</p>
                            </div>
                            <Badge className={`text-xs ${getRarityColor(badge.rarity)}`} variant="outline">
                              {badge.rarity}
                            </Badge>
                            {badge.earned ? (
                              <div className="text-xs text-green-600">
                                Earned {new Date(badge.earnedDate!).toLocaleDateString()}
                              </div>
                            ) : badge.progress !== undefined ? (
                              <div className="space-y-1">
                                <Progress value={(badge.progress / badge.target!) * 100} className="h-1" />
                                <div className="text-xs text-muted-foreground">
                                  {badge.progress}/{badge.target}
                                </div>
                              </div>
                            ) : (
                              <div className="text-xs text-muted-foreground">Not earned</div>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Recent Achievements */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Recent Achievements</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                      <Target className="w-5 h-5 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-green-900">Distance Master Unlocked!</p>
                      <p className="text-sm text-green-700">You've traveled over 1000 km</p>
                    </div>
                    <Badge className="bg-green-100 text-green-800">+250 XP</Badge>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                      <Zap className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-blue-900">Speed Demon Earned!</p>
                      <p className="text-sm text-blue-700">Completed trip in record time</p>
                    </div>
                    <Badge className="bg-blue-100 text-blue-800">+150 XP</Badge>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="challenges" className="space-y-4">
              {/* Active Challenges */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="w-5 h-5 text-primary" />
                    Active Challenges
                  </CardTitle>
                  <CardDescription>Complete these to earn rewards</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {achievements.map((achievement, index) => (
                    <div key={index} className="space-y-3 p-4 bg-muted/50 rounded-lg">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <p className="font-medium">{achievement.title}</p>
                          <p className="text-sm text-muted-foreground">{achievement.description}</p>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {achievement.timeLeft}
                        </Badge>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Progress</span>
                          <span>
                            {achievement.progress}/{achievement.target}
                          </span>
                        </div>
                        <Progress value={(achievement.progress / achievement.target) * 100} className="h-2" />
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Gift className="w-4 h-4 text-primary" />
                          <span className="text-sm font-medium">{achievement.reward}</span>
                        </div>
                        <Badge className="bg-primary/10 text-primary">
                          {Math.round((achievement.progress / achievement.target) * 100)}%
                        </Badge>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Daily Bonus */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Daily Bonus</CardTitle>
                  <CardDescription>Log in daily to earn bonus XP</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between p-4 bg-gradient-to-r from-primary/10 to-accent/10 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                        <Star className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">Daily Check-in</p>
                        <p className="text-sm text-muted-foreground">Streak: 5 days</p>
                      </div>
                    </div>
                    <Button size="sm">Claim +50 XP</Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="leaderboard" className="space-y-4">
              {/* Leaderboard */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-primary" />
                    Global Leaderboard
                  </CardTitle>
                  <CardDescription>Top travelers this month</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {leaderboard.map((user, index) => (
                    <div
                      key={index}
                      className={`flex items-center gap-3 p-3 rounded-lg ${
                        user.isUser ? "bg-primary/10 border border-primary/20" : "bg-muted/50"
                      }`}
                    >
                      <div className="flex items-center justify-center w-8">{getRankIcon(user.rank)}</div>
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={user.avatar || "/placeholder.svg"} />
                        <AvatarFallback>
                          {user.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className={`font-medium ${user.isUser ? "text-primary" : ""}`}>{user.name}</p>
                        <p className="text-sm text-muted-foreground">Level {user.level}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{user.points.toLocaleString()}</p>
                        <p className="text-xs text-muted-foreground">points</p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Your Stats */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Your Performance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-primary/10 rounded-lg">
                      <div className="text-xl font-bold text-primary">#{userStats.rank}</div>
                      <div className="text-sm text-muted-foreground">Global Rank</div>
                    </div>
                    <div className="text-center p-3 bg-accent/10 rounded-lg">
                      <div className="text-xl font-bold text-accent">Top 4%</div>
                      <div className="text-sm text-muted-foreground">Percentile</div>
                    </div>
                  </div>
                  <div className="mt-4 p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="w-4 h-4 text-green-600" />
                      <span className="text-sm font-medium text-green-600">Rising Fast!</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      You've climbed 12 positions this week. Keep traveling to reach the top 3%!
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  )
}
