"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent } from "@/components/ui/tabs"
import {
  MapPin,
  Award,
  BarChart3,
  Users,
  Plus,
  Play,
  Square,
  Navigation,
  Camera,
  FileText,
  Map,
  Cloud,
  Shield,
  Store,
  Calculator,
  Activity,
} from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"
import WelcomeScreen from "@/components/auth/welcome-screen"
import TripTrackingScreen from "@/components/trip/trip-tracking-screen"
import CompanionManagement from "@/components/trip/companion-management"
import AnalyticsDashboard from "@/components/analytics/analytics-dashboard"
import RewardsScreen from "@/components/gamification/rewards-screen"
import DataEntryScreen from "@/components/data-collection/data-entry-screen"
import KeralaMapScreen from "@/components/kerala/kerala-map-screen"
import WeatherAIScreen from "@/components/kerala/weather-ai-screen"
import SOSEmergencyScreen from "@/components/kerala/sos-emergency-screen"
import LocalBusinessScreen from "@/components/kerala/local-business-screen"
import ExpenseCalculatorScreen from "@/components/kerala/expense-calculator-screen"
import GPSAnalyticsScreen from "@/components/gps/gps-analytics-screen"

export default function TravelCompanionApp() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [activeTrip, setActiveTrip] = useState(false)
  const [currentTab, setCurrentTab] = useState("home")
  const [currentScreen, setCurrentScreen] = useState<
    | "main"
    | "tracking"
    | "companions"
    | "analytics"
    | "rewards"
    | "data-entry"
    | "kerala-map"
    | "weather-ai"
    | "sos-emergency"
    | "local-business"
    | "expense-calculator"
    | "gps-analytics"
  >("main")

  if (!isAuthenticated) {
    return <WelcomeScreen onAuthComplete={() => setIsAuthenticated(true)} />
  }

  if (currentScreen === "tracking") {
    return <TripTrackingScreen onBack={() => setCurrentScreen("main")} />
  }

  if (currentScreen === "companions") {
    return <CompanionManagement onBack={() => setCurrentScreen("main")} />
  }

  if (currentScreen === "analytics") {
    return <AnalyticsDashboard onBack={() => setCurrentScreen("main")} />
  }

  if (currentScreen === "rewards") {
    return <RewardsScreen onBack={() => setCurrentScreen("main")} />
  }

  if (currentScreen === "data-entry") {
    return <DataEntryScreen onBack={() => setCurrentScreen("main")} />
  }

  if (currentScreen === "kerala-map") {
    return <KeralaMapScreen onBack={() => setCurrentScreen("main")} />
  }

  if (currentScreen === "weather-ai") {
    return <WeatherAIScreen onBack={() => setCurrentScreen("main")} />
  }

  if (currentScreen === "sos-emergency") {
    return <SOSEmergencyScreen onBack={() => setCurrentScreen("main")} />
  }

  if (currentScreen === "local-business") {
    return <LocalBusinessScreen onBack={() => setCurrentScreen("main")} />
  }

  if (currentScreen === "expense-calculator") {
    return <ExpenseCalculatorScreen onBack={() => setCurrentScreen("main")} />
  }

  if (currentScreen === "gps-analytics") {
    return <GPSAnalyticsScreen onBack={() => setCurrentScreen("main")} />
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile App Container */}
      <div className="max-w-md mx-auto bg-background min-h-screen">
        {/* Header */}
        <header className="bg-primary text-primary-foreground p-4 rounded-b-lg">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold">Kerala Travel Companion</h1>
              <p className="text-sm opacity-90">NATPAC Official • God's Own Country</p>
            </div>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCurrentScreen("sos-emergency")}
                className="text-primary-foreground hover:bg-primary-foreground/20 p-2"
              >
                <Shield className="w-4 h-4" />
              </Button>
              <Badge variant="secondary" className="bg-primary-foreground/20 text-primary-foreground">
                <Award className="w-3 h-3 mr-1" />
                Explorer
              </Badge>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="p-4 pb-20">
          <Tabs value={currentTab} onValueChange={setCurrentTab} className="w-full">
            <TabsContent value="home" className="space-y-4">
              {/* Trip Status Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-primary" />
                    Current Trip Status
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {activeTrip ? (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Active Trip</span>
                        <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
                          In Progress
                        </Badge>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm">Duration:</span>
                          <span className="text-sm font-medium">2h 15m</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Distance:</span>
                          <span className="text-sm font-medium">45.2 km</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Mode:</span>
                          <span className="text-sm font-medium">Car</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Current District:</span>
                          <span className="text-sm font-medium">Kochi</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button onClick={() => setCurrentScreen("tracking")} className="flex-1">
                          <Navigation className="w-4 h-4 mr-2" />
                          View Details
                        </Button>
                        <Button onClick={() => setActiveTrip(false)} variant="destructive" className="flex-1">
                          <Square className="w-4 h-4 mr-2" />
                          End Trip
                        </Button>
                      </div>
                      <Button onClick={() => setCurrentScreen("gps-analytics")} variant="outline" className="w-full">
                        <Activity className="w-4 h-4 mr-2" />
                        GPS Analytics
                      </Button>
                    </div>
                  ) : (
                    <div className="text-center space-y-3">
                      <p className="text-muted-foreground">No active trip</p>
                      <Button onClick={() => setCurrentScreen("tracking")} className="w-full">
                        <Play className="w-4 h-4 mr-2" />
                        Start New Trip
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Kerala Features Grid */}
              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <Button onClick={() => setCurrentScreen("kerala-map")} className="w-full h-auto p-4 flex-col gap-2">
                      <Map className="w-6 h-6" />
                      <span className="text-sm">Kerala Explorer</span>
                    </Button>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <Button onClick={() => setCurrentScreen("weather-ai")} className="w-full h-auto p-4 flex-col gap-2">
                      <Cloud className="w-6 h-6" />
                      <span className="text-sm">Weather & AI</span>
                    </Button>
                  </CardContent>
                </Card>
              </div>

              {/* Travel Tools */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calculator className="w-5 h-5 text-primary" />
                    Travel Tools
                  </CardTitle>
                  <CardDescription>Essential tools for your Kerala journey</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-3">
                    <Button
                      onClick={() => setCurrentScreen("expense-calculator")}
                      className="h-auto p-4 flex-col gap-2"
                    >
                      <Calculator className="w-6 h-6" />
                      <span className="text-sm">Expense Tracker</span>
                    </Button>
                    <Button onClick={() => setCurrentScreen("local-business")} className="h-auto p-4 flex-col gap-2">
                      <Store className="w-6 h-6" />
                      <span className="text-sm">Local Business</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Emergency & Safety */}
              <Card className="border-red-200 dark:border-red-800">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-red-600">
                    <Shield className="w-5 h-5" />
                    Emergency & Safety
                  </CardTitle>
                  <CardDescription>Quick access to emergency services and disaster alerts</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-3">
                    <Button
                      onClick={() => setCurrentScreen("sos-emergency")}
                      className="h-auto p-4 flex-col gap-2 bg-red-600 hover:bg-red-700"
                    >
                      <Shield className="w-6 h-6" />
                      <span className="text-sm">SOS Emergency</span>
                    </Button>
                    <div className="space-y-2">
                      <div className="text-xs text-muted-foreground">Active Alerts:</div>
                      <div className="text-xs bg-orange-100 dark:bg-orange-950/20 text-orange-800 dark:text-orange-200 p-2 rounded">
                        Heavy rainfall in Idukki
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-primary">1,247</div>
                    <div className="text-sm text-muted-foreground">Total KM</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-primary">23</div>
                    <div className="text-sm text-muted-foreground">Trips</div>
                  </CardContent>
                </Card>
              </div>

              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Recent Activity</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-3 p-2 rounded-lg bg-muted/50">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <MapPin className="w-4 h-4 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Kochi to Munnar</p>
                      <p className="text-xs text-muted-foreground">Yesterday • 130 km</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-2 rounded-lg bg-muted/50">
                    <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center">
                      <Award className="w-4 h-4 text-accent" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Earned "Hill Station Explorer" badge</p>
                      <p className="text-xs text-muted-foreground">2 days ago</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-3">
                    <Button
                      variant="outline"
                      className="h-auto p-4 flex-col gap-2 bg-transparent"
                      onClick={() => setCurrentScreen("companions")}
                    >
                      <Users className="w-5 h-5" />
                      <span className="text-sm">Companions</span>
                    </Button>
                    <Button
                      variant="outline"
                      className="h-auto p-4 flex-col gap-2 bg-transparent"
                      onClick={() => setCurrentScreen("data-entry")}
                    >
                      <Plus className="w-5 h-5" />
                      <span className="text-sm">Add Data</span>
                    </Button>
                    <Button
                      variant="outline"
                      className="h-auto p-4 flex-col gap-2 bg-transparent"
                      onClick={() => setCurrentScreen("gps-analytics")}
                    >
                      <Activity className="w-5 h-5" />
                      <span className="text-sm">GPS Analytics</span>
                    </Button>
                    <Button
                      variant="outline"
                      className="h-auto p-4 flex-col gap-2 bg-transparent"
                      onClick={() => setCurrentScreen("analytics")}
                    >
                      <BarChart3 className="w-5 h-5" />
                      <span className="text-sm">Analytics</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Data Collection Prompt */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Contribute to Kerala Tourism Research</CardTitle>
                  <CardDescription>Help improve Kerala's transportation with your data</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-auto p-3 flex-col gap-1 bg-transparent"
                      onClick={() => setCurrentScreen("data-entry")}
                    >
                      <MapPin className="w-4 h-4" />
                      <span className="text-xs">Location</span>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-auto p-3 flex-col gap-1 bg-transparent"
                      onClick={() => setCurrentScreen("data-entry")}
                    >
                      <Camera className="w-4 h-4" />
                      <span className="text-xs">Photo</span>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-auto p-3 flex-col gap-1 bg-transparent"
                      onClick={() => setCurrentScreen("data-entry")}
                    >
                      <FileText className="w-4 h-4" />
                      <span className="text-xs">Note</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="analytics" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Travel Analytics</CardTitle>
                  <CardDescription>Your travel patterns and insights</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-3 bg-primary/10 rounded-lg">
                        <div className="text-xl font-bold text-primary">1,247 km</div>
                        <div className="text-xs text-muted-foreground">This Month</div>
                      </div>
                      <div className="text-center p-3 bg-accent/10 rounded-lg">
                        <div className="text-xl font-bold text-accent">₹3,200</div>
                        <div className="text-xs text-muted-foreground">Total Spent</div>
                      </div>
                    </div>
                    <Button onClick={() => setCurrentScreen("analytics")} className="w-full">
                      <BarChart3 className="w-4 h-4 mr-2" />
                      View Detailed Analytics
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="rewards" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Badges & Rewards</CardTitle>
                  <CardDescription>Your travel achievements</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-4 rounded-lg bg-primary/10">
                        <Award className="w-8 h-8 mx-auto text-primary mb-2" />
                        <p className="text-sm font-medium">Explorer</p>
                        <p className="text-xs text-muted-foreground">5+ trips</p>
                      </div>
                      <div className="text-center p-4 rounded-lg bg-muted/50">
                        <Award className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                        <p className="text-sm font-medium">Eco Traveler</p>
                        <p className="text-xs text-muted-foreground">Use public transport</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gradient-to-r from-primary/10 to-accent/10 rounded-lg">
                      <div>
                        <p className="font-medium">Level 12</p>
                        <p className="text-sm text-muted-foreground">2,450 / 3,000 XP</p>
                      </div>
                      <Badge className="bg-primary/20 text-primary">Rank #47</Badge>
                    </div>
                    <Button onClick={() => setCurrentScreen("rewards")} className="w-full">
                      <Award className="w-4 h-4 mr-2" />
                      View All Rewards
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="profile" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Profile Settings</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                        <Users className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">John Doe</p>
                        <p className="text-sm text-muted-foreground">john.doe@example.com</p>
                      </div>
                    </div>
                    <div className="pt-4 border-t">
                      <p className="text-sm text-muted-foreground">Location: Delhi, India</p>
                      <p className="text-sm text-muted-foreground">Member since: Jan 2024</p>
                    </div>
                    <div className="pt-4 border-t">
                      <Button onClick={() => setIsAuthenticated(false)} variant="outline" className="w-full">
                        Sign Out
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </main>

        {/* Bottom Navigation */}
        <nav className="fixed bottom-0 left-1/2 transform -translate-x-1/2 w-full max-w-md bg-card border-t border-border">
          <div className="flex items-center justify-around p-2">
            <Button
              variant={currentTab === "home" ? "default" : "ghost"}
              size="sm"
              onClick={() => setCurrentTab("home")}
              className="flex-col gap-1 h-auto py-2"
            >
              <MapPin className="w-4 h-4" />
              <span className="text-xs">Home</span>
            </Button>
            <Button
              variant={currentTab === "analytics" ? "default" : "ghost"}
              size="sm"
              onClick={() => setCurrentTab("analytics")}
              className="flex-col gap-1 h-auto py-2"
            >
              <BarChart3 className="w-4 h-4" />
              <span className="text-xs">Analytics</span>
            </Button>
            <Button
              variant={currentTab === "rewards" ? "default" : "ghost"}
              size="sm"
              onClick={() => setCurrentTab("rewards")}
              className="flex-col gap-1 h-auto py-2"
            >
              <Award className="w-4 h-4" />
              <span className="text-xs">Rewards</span>
            </Button>
            <Button
              variant={currentTab === "profile" ? "default" : "ghost"}
              size="sm"
              onClick={() => setCurrentTab("profile")}
              className="flex-col gap-1 h-auto py-2"
            >
              <Users className="w-4 h-4" />
              <span className="text-xs">Profile</span>
            </Button>
          </div>
        </nav>
      </div>
    </div>
  )
}
