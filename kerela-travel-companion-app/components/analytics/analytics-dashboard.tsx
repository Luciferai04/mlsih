"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Area,
  AreaChart,
} from "recharts"
import {
  Calendar,
  TrendingUp,
  MapPin,
  Clock,
  Bus,
  DollarSign,
  Target,
  ArrowLeft,
  Search,
  Star,
  Navigation,
  Camera,
} from "lucide-react"
import { Input } from "@/components/ui/input"

interface AnalyticsDashboardProps {
  onBack: () => void
}

interface Trip {
  id: string
  title: string
  date: string
  duration: string
  distance: string
  cost: number
  mode: string
  route: string
  rating: number
  photos: number
  companions: number
  highlights: string[]
  weather: string
  status: "completed" | "ongoing" | "planned"
}

export default function AnalyticsDashboard({ onBack }: AnalyticsDashboardProps) {
  const [timeRange, setTimeRange] = useState("month")
  const [activeTab, setActiveTab] = useState("overview")
  const [searchQuery, setSearchQuery] = useState("")
  const [filterMode, setFilterMode] = useState("all")

  // Mock trip history data
  const tripHistory: Trip[] = [
    {
      id: "1",
      title: "Kochi to Munnar Hill Station",
      date: "2024-01-15",
      duration: "3h 45m",
      distance: "130 km",
      cost: 2500,
      mode: "Car",
      route: "Kochi → Aluva → Munnar",
      rating: 5,
      photos: 24,
      companions: 3,
      highlights: ["Tea Gardens", "Mattupetty Dam", "Echo Point"],
      weather: "Pleasant",
      status: "completed",
    },
    {
      id: "2",
      title: "Backwater Cruise Experience",
      date: "2024-01-12",
      duration: "6h 30m",
      distance: "45 km",
      cost: 3200,
      mode: "Boat",
      route: "Alleppey → Kumrakom → Alleppey",
      rating: 4,
      photos: 18,
      companions: 2,
      highlights: ["Houseboat Stay", "Village Tour", "Sunset Views"],
      weather: "Sunny",
      status: "completed",
    },
    {
      id: "3",
      title: "Wayanad Wildlife Adventure",
      date: "2024-01-08",
      duration: "2 days",
      distance: "280 km",
      cost: 4500,
      mode: "Car",
      route: "Kochi → Wayanad → Bandipur",
      rating: 5,
      photos: 42,
      companions: 4,
      highlights: ["Wildlife Safari", "Edakkal Caves", "Soochipara Falls"],
      weather: "Cloudy",
      status: "completed",
    },
    {
      id: "4",
      title: "Fort Kochi Heritage Walk",
      date: "2024-01-05",
      duration: "4h 15m",
      distance: "8 km",
      cost: 800,
      mode: "Walking",
      route: "Fort Kochi → Mattancherry → Chinese Nets",
      rating: 4,
      photos: 15,
      companions: 1,
      highlights: ["Chinese Fishing Nets", "Spice Market", "Dutch Palace"],
      weather: "Warm",
      status: "completed",
    },
    {
      id: "5",
      title: "Thekkady Spice Plantation",
      date: "2024-01-02",
      duration: "5h 20m",
      distance: "95 km",
      cost: 1800,
      mode: "Bus",
      route: "Kochi → Kumily → Thekkady",
      rating: 4,
      photos: 28,
      companions: 2,
      highlights: ["Spice Gardens", "Periyar Lake", "Elephant Ride"],
      weather: "Misty",
      status: "completed",
    },
    {
      id: "6",
      title: "Kovalam Beach Getaway",
      date: "2024-01-20",
      duration: "2h 30m",
      distance: "65 km",
      cost: 1200,
      mode: "Car",
      route: "Kochi → Trivandrum → Kovalam",
      rating: 0,
      photos: 0,
      companions: 2,
      highlights: ["Beach Resort", "Lighthouse", "Ayurvedic Spa"],
      weather: "Sunny",
      status: "planned",
    },
  ]

  const weeklyData = [
    { name: "Mon", distance: 12, trips: 2, cost: 150 },
    { name: "Tue", distance: 8, trips: 1, cost: 80 },
    { name: "Wed", distance: 25, trips: 3, cost: 300 },
    { name: "Thu", distance: 15, trips: 2, cost: 200 },
    { name: "Fri", distance: 30, trips: 4, cost: 450 },
    { name: "Sat", distance: 45, trips: 2, cost: 600 },
    { name: "Sun", distance: 20, trips: 1, cost: 250 },
  ]

  const monthlyData = [
    { name: "Jan", distance: 234, trips: 15, cost: 2800 },
    { name: "Feb", distance: 189, trips: 12, cost: 2200 },
    { name: "Mar", distance: 298, trips: 18, cost: 3500 },
    { name: "Apr", distance: 267, trips: 16, cost: 3100 },
    { name: "May", distance: 345, trips: 22, cost: 4200 },
    { name: "Jun", distance: 312, trips: 19, cost: 3800 },
  ]

  const transportModeData = [
    { name: "Car", value: 45, color: "#059669" },
    { name: "Bus", value: 25, color: "#10b981" },
    { name: "Train", value: 20, color: "#34d399" },
    { name: "Walking", value: 8, color: "#6ee7b7" },
    { name: "Bike", value: 2, color: "#a7f3d0" },
  ]

  const costBreakdown = [
    { category: "Fuel", amount: 1200, percentage: 40 },
    { category: "Public Transport", amount: 800, percentage: 27 },
    { category: "Parking", amount: 450, percentage: 15 },
    { category: "Tolls", amount: 350, percentage: 12 },
    { category: "Maintenance", amount: 200, percentage: 6 },
  ]

  const achievements = [
    { title: "Distance Master", description: "1000+ km traveled", progress: 85, target: 1000, current: 850 },
    { title: "Eco Warrior", description: "Use public transport 50 times", progress: 60, target: 50, current: 30 },
    { title: "Explorer", description: "Visit 10 new cities", progress: 70, target: 10, current: 7 },
    { title: "Consistent Traveler", description: "Travel 30 days in a row", progress: 40, target: 30, current: 12 },
  ]

  const getChartData = () => {
    return timeRange === "week" ? weeklyData : monthlyData
  }

  const filteredTrips = tripHistory.filter((trip) => {
    const matchesSearch =
      trip.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      trip.route.toLowerCase().includes(searchQuery.toLowerCase()) ||
      trip.highlights.some((highlight) => highlight.toLowerCase().includes(searchQuery.toLowerCase()))

    const matchesFilter = filterMode === "all" || trip.mode.toLowerCase() === filterMode.toLowerCase()

    return matchesSearch && matchesFilter
  })

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star key={i} className={`w-3 h-3 ${i < rating ? "text-yellow-400 fill-current" : "text-gray-300"}`} />
    ))
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"
      case "ongoing":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100"
      case "planned":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-100"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-100"
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-md mx-auto bg-background min-h-screen">
        {/* Header */}
        <header className="bg-primary text-primary-foreground p-4 sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <Button
              onClick={onBack}
              variant="ghost"
              size="sm"
              className="text-primary-foreground hover:bg-primary-foreground/20"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div className="flex-1">
              <h1 className="text-xl font-bold">Travel Analytics</h1>
              <p className="text-sm opacity-90">Your journey insights</p>
            </div>
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-24 bg-primary-foreground/20 border-primary-foreground/30 text-primary-foreground">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="week">Week</SelectItem>
                <SelectItem value="month">Month</SelectItem>
                <SelectItem value="year">Year</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </header>

        <main className="p-4 space-y-4">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="history">History</TabsTrigger>
              <TabsTrigger value="patterns">Patterns</TabsTrigger>
              <TabsTrigger value="goals">Goals</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              {/* Key Metrics */}
              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-primary">1,247</div>
                    <div className="text-sm text-muted-foreground flex items-center justify-center gap-1">
                      <MapPin className="w-3 h-3" />
                      Total KM
                    </div>
                    <div className="text-xs text-green-600 mt-1">+12% vs last month</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-primary">23</div>
                    <div className="text-sm text-muted-foreground flex items-center justify-center gap-1">
                      <Calendar className="w-3 h-3" />
                      Trips
                    </div>
                    <div className="text-xs text-green-600 mt-1">+5% vs last month</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-primary">₹3,200</div>
                    <div className="text-sm text-muted-foreground flex items-center justify-center gap-1">
                      <DollarSign className="w-3 h-3" />
                      Spent
                    </div>
                    <div className="text-xs text-red-600 mt-1">+8% vs last month</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-primary">2.5h</div>
                    <div className="text-sm text-muted-foreground flex items-center justify-center gap-1">
                      <Clock className="w-3 h-3" />
                      Avg Trip
                    </div>
                    <div className="text-xs text-green-600 mt-1">-5% vs last month</div>
                  </CardContent>
                </Card>
              </div>

              {/* Distance Trend Chart */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-primary" />
                    Distance Trend
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={getChartData()}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Area type="monotone" dataKey="distance" stroke="#059669" fill="#059669" fillOpacity={0.3} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Transport Mode Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Transport Modes</CardTitle>
                  <CardDescription>How you travel</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={transportModeData}
                          cx="50%"
                          cy="50%"
                          innerRadius={40}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {transportModeData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="grid grid-cols-2 gap-2 mt-4">
                    {transportModeData.map((mode, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: mode.color }}></div>
                        <span className="text-sm">
                          {mode.name} ({mode.value}%)
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Trip History Tab */}
            <TabsContent value="history" className="space-y-4">
              {/* Search and Filter */}
              <Card>
                <CardContent className="p-4 space-y-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input
                      placeholder="Search trips, routes, destinations..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>

                  <div className="flex gap-2 overflow-x-auto pb-2">
                    <Button
                      variant={filterMode === "all" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setFilterMode("all")}
                      className="whitespace-nowrap"
                    >
                      All Trips
                    </Button>
                    <Button
                      variant={filterMode === "car" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setFilterMode("car")}
                      className="whitespace-nowrap"
                    >
                      Car
                    </Button>
                    <Button
                      variant={filterMode === "bus" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setFilterMode("bus")}
                      className="whitespace-nowrap"
                    >
                      Bus
                    </Button>
                    <Button
                      variant={filterMode === "boat" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setFilterMode("boat")}
                      className="whitespace-nowrap"
                    >
                      Boat
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Trip History List */}
              <div className="space-y-3">
                {filteredTrips.map((trip) => (
                  <Card key={trip.id} className="overflow-hidden">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h3 className="font-medium text-sm mb-1">{trip.title}</h3>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                            <Calendar className="w-3 h-3" />
                            <span>{new Date(trip.date).toLocaleDateString()}</span>
                            <span>•</span>
                            <Clock className="w-3 h-3" />
                            <span>{trip.duration}</span>
                            <span>•</span>
                            <MapPin className="w-3 h-3" />
                            <span>{trip.distance}</span>
                          </div>
                          <p className="text-xs text-muted-foreground mb-2">{trip.route}</p>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <Badge className={getStatusColor(trip.status)}>{trip.status}</Badge>
                          <span className="text-sm font-medium">₹{trip.cost.toLocaleString()}</span>
                        </div>
                      </div>

                      {trip.status === "completed" && (
                        <div className="space-y-2">
                          <div className="flex items-center gap-1 mb-2">
                            {renderStars(trip.rating)}
                            <span className="text-xs text-muted-foreground ml-1">({trip.rating}/5)</span>
                          </div>

                          <div className="flex flex-wrap gap-1 mb-2">
                            {trip.highlights.slice(0, 3).map((highlight) => (
                              <Badge key={highlight} variant="outline" className="text-xs">
                                {highlight}
                              </Badge>
                            ))}
                          </div>

                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <div className="flex items-center gap-3">
                              <div className="flex items-center gap-1">
                                <Camera className="w-3 h-3" />
                                <span>{trip.photos} photos</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <span>{trip.companions} companions</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <span>{trip.weather}</span>
                              </div>
                            </div>
                            <Button size="sm" variant="outline" className="h-6 px-2 bg-transparent">
                              <Navigation className="w-3 h-3 mr-1" />
                              View
                            </Button>
                          </div>
                        </div>
                      )}

                      {trip.status === "planned" && (
                        <div className="space-y-2">
                          <div className="flex flex-wrap gap-1 mb-2">
                            {trip.highlights.map((highlight) => (
                              <Badge key={highlight} variant="outline" className="text-xs">
                                {highlight}
                              </Badge>
                            ))}
                          </div>
                          <div className="flex gap-2">
                            <Button size="sm" className="flex-1">
                              Start Trip
                            </Button>
                            <Button size="sm" variant="outline" className="flex-1 bg-transparent">
                              Edit Plan
                            </Button>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Trip Statistics */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Trip Statistics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-primary/10 rounded-lg">
                      <div className="text-lg font-bold text-primary">
                        {tripHistory.filter((t) => t.status === "completed").length}
                      </div>
                      <div className="text-xs text-muted-foreground">Completed</div>
                    </div>
                    <div className="text-center p-3 bg-orange/10 rounded-lg">
                      <div className="text-lg font-bold text-orange-600">
                        {tripHistory.filter((t) => t.status === "planned").length}
                      </div>
                      <div className="text-xs text-muted-foreground">Planned</div>
                    </div>
                    <div className="text-center p-3 bg-green/10 rounded-lg">
                      <div className="text-lg font-bold text-green-600">
                        {(
                          tripHistory.filter((t) => t.status === "completed").reduce((sum, t) => sum + t.rating, 0) /
                          tripHistory.filter((t) => t.status === "completed").length
                        ).toFixed(1)}
                      </div>
                      <div className="text-xs text-muted-foreground">Avg Rating</div>
                    </div>
                    <div className="text-center p-3 bg-blue/10 rounded-lg">
                      <div className="text-lg font-bold text-blue-600">
                        {tripHistory.filter((t) => t.status === "completed").reduce((sum, t) => sum + t.photos, 0)}
                      </div>
                      <div className="text-xs text-muted-foreground">Total Photos</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="patterns" className="space-y-4">
              {/* Trip Frequency */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Trip Frequency</CardTitle>
                  <CardDescription>When you travel most</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={getChartData()}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="trips" fill="#059669" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Cost Analysis */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Cost Breakdown</CardTitle>
                  <CardDescription>Where your money goes</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {costBreakdown.map((item, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">{item.category}</span>
                        <span className="text-sm">₹{item.amount}</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div className="bg-primary h-2 rounded-full" style={{ width: `${item.percentage}%` }}></div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Peak Hours */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Peak Travel Hours</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div className="p-3 bg-primary/10 rounded-lg">
                      <div className="text-lg font-bold text-primary">8-10 AM</div>
                      <div className="text-xs text-muted-foreground">Morning Rush</div>
                    </div>
                    <div className="p-3 bg-accent/10 rounded-lg">
                      <div className="text-lg font-bold text-accent">1-3 PM</div>
                      <div className="text-xs text-muted-foreground">Afternoon</div>
                    </div>
                    <div className="p-3 bg-primary/10 rounded-lg">
                      <div className="text-lg font-bold text-primary">6-8 PM</div>
                      <div className="text-xs text-muted-foreground">Evening Rush</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="goals" className="space-y-4">
              {/* Achievement Progress */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Target className="w-5 h-5 text-primary" />
                    Achievement Progress
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {achievements.map((achievement, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-medium">{achievement.title}</p>
                          <p className="text-sm text-muted-foreground">{achievement.description}</p>
                        </div>
                        <Badge variant={achievement.progress >= 100 ? "default" : "secondary"}>
                          {achievement.progress}%
                        </Badge>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div
                          className="bg-primary h-2 rounded-full transition-all duration-300"
                          style={{ width: `${Math.min(achievement.progress, 100)}%` }}
                        ></div>
                      </div>
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>
                          {achievement.current} / {achievement.target}
                        </span>
                        <span>{achievement.target - achievement.current} to go</span>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Monthly Goals */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Monthly Goals</CardTitle>
                  <CardDescription>Your targets for this month</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <MapPin className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">Travel 500 km</p>
                        <p className="text-sm text-muted-foreground">347 km completed</p>
                      </div>
                    </div>
                    <Badge>69%</Badge>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center">
                        <Bus className="w-5 h-5 text-accent" />
                      </div>
                      <div>
                        <p className="font-medium">Use public transport 15 times</p>
                        <p className="text-sm text-muted-foreground">8 trips completed</p>
                      </div>
                    </div>
                    <Badge variant="secondary">53%</Badge>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <DollarSign className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">Stay under ₹4,000</p>
                        <p className="text-sm text-muted-foreground">₹3,200 spent</p>
                      </div>
                    </div>
                    <Badge>80%</Badge>
                  </div>
                </CardContent>
              </Card>

              {/* Recommendations */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Smart Recommendations</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="p-3 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                    <p className="text-sm font-medium text-blue-900 dark:text-blue-100">💡 Cost Saving Tip</p>
                    <p className="text-sm text-blue-700 dark:text-blue-300">
                      Use public transport on Tuesdays to save ₹200/month
                    </p>
                  </div>
                  <div className="p-3 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg">
                    <p className="text-sm font-medium text-green-900 dark:text-green-100">🌱 Eco Tip</p>
                    <p className="text-sm text-green-700 dark:text-green-300">
                      Walk for trips under 2km to reduce carbon footprint
                    </p>
                  </div>
                  <div className="p-3 bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800 rounded-lg">
                    <p className="text-sm font-medium text-orange-900 dark:text-orange-100">⏰ Time Tip</p>
                    <p className="text-sm text-orange-700 dark:text-orange-300">
                      Avoid 8-9 AM travel to save 15 minutes per trip
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
