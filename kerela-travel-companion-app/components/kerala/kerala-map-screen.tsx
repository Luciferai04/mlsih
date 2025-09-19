"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { ArrowLeft, MapPin, Navigation, Star, Clock, Thermometer, AlertTriangle, Car, Bus, Train } from "lucide-react"

interface KeralaMapScreenProps {
  onBack: () => void
}

export default function KeralaMapScreen({ onBack }: KeralaMapScreenProps) {
  const [selectedDistrict, setSelectedDistrict] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedRoute, setSelectedRoute] = useState<string | null>(null)

  const keralaDistricts = [
    { name: "Thiruvananthapuram", popular: ["Kovalam", "Padmanabhaswamy Temple", "Neyyar Dam"], weather: "28°C" },
    { name: "Kollam", popular: ["Ashtamudi Lake", "Jatayu Earth's Center", "Thangassery Beach"], weather: "29°C" },
    {
      name: "Pathanamthitta",
      popular: ["Sabarimala", "Perunthenaruvi Falls", "Konni Elephant Reserve"],
      weather: "26°C",
    },
    { name: "Alappuzha", popular: ["Backwaters", "Kumarakom", "Marari Beach"], weather: "30°C" },
    { name: "Kottayam", popular: ["Vembanad Lake", "Ettumanoor Temple", "Illikkal Kallu"], weather: "27°C" },
    { name: "Idukki", popular: ["Munnar", "Thekkady", "Vagamon"], weather: "22°C" },
    { name: "Ernakulam", popular: ["Kochi", "Fort Kochi", "Marine Drive"], weather: "31°C" },
    { name: "Thrissur", popular: ["Guruvayur", "Athirapally Falls", "Vadakkunnathan Temple"], weather: "29°C" },
    { name: "Palakkad", popular: ["Silent Valley", "Malampuzha Dam", "Parambikulam"], weather: "28°C" },
    { name: "Malappuram", popular: ["Nilambur", "Kottakkunnu", "Thirunavaya"], weather: "30°C" },
    { name: "Kozhikode", popular: ["Kappad Beach", "Beypore", "Wayanad Wildlife Sanctuary"], weather: "29°C" },
    { name: "Wayanad", popular: ["Chembra Peak", "Soochipara Falls", "Edakkal Caves"], weather: "24°C" },
    { name: "Kannur", popular: ["St. Angelo Fort", "Payyambalam Beach", "Theyyam"], weather: "28°C" },
    { name: "Kasaragod", popular: ["Bekal Fort", "Kappil Beach", "Chandragiri Fort"], weather: "29°C" },
  ]

  const popularRoutes = [
    {
      id: "kochi-munnar",
      name: "Kochi to Munnar",
      distance: "130 km",
      duration: "3.5 hours",
      difficulty: "Moderate",
      highlights: ["Tea Gardens", "Hill Stations", "Scenic Views"],
      bestTime: "Oct-Mar",
      transportModes: ["car", "bus"],
    },
    {
      id: "trivandrum-kovalam",
      name: "Trivandrum to Kovalam",
      distance: "16 km",
      duration: "30 minutes",
      difficulty: "Easy",
      highlights: ["Beaches", "Lighthouse", "Ayurveda Centers"],
      bestTime: "Nov-Feb",
      transportModes: ["car", "bus", "auto"],
    },
    {
      id: "alleppey-kumarakom",
      name: "Alleppey to Kumarakom",
      distance: "32 km",
      duration: "1 hour",
      difficulty: "Easy",
      highlights: ["Backwaters", "Houseboats", "Bird Sanctuary"],
      bestTime: "Oct-Mar",
      transportModes: ["car", "boat"],
    },
  ]

  const getTransportIcon = (mode: string) => {
    switch (mode) {
      case "car":
        return <Car className="w-4 h-4" />
      case "bus":
        return <Bus className="w-4 h-4" />
      case "train":
        return <Train className="w-4 h-4" />
      case "boat":
        return <Navigation className="w-4 h-4" />
      case "auto":
        return <Car className="w-4 h-4" />
      default:
        return <Car className="w-4 h-4" />
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-md mx-auto bg-background min-h-screen">
        {/* Header */}
        <header className="bg-primary text-primary-foreground p-4 sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={onBack}
              className="text-primary-foreground hover:bg-primary-foreground/20"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div>
              <h1 className="text-lg font-bold">Kerala Explorer</h1>
              <p className="text-sm opacity-90">Discover God's Own Country</p>
            </div>
          </div>
        </header>

        <main className="p-4 space-y-4">
          {/* Search */}
          <Card>
            <CardContent className="p-4">
              <Input
                placeholder="Search destinations, routes, or attractions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full"
              />
            </CardContent>
          </Card>

          {/* Popular Routes */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Navigation className="w-5 h-5 text-primary" />
                Popular Routes
              </CardTitle>
              <CardDescription>Recommended travel routes with directions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {popularRoutes.map((route) => (
                <div
                  key={route.id}
                  className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                    selectedRoute === route.id ? "border-primary bg-primary/5" : "border-border hover:bg-muted/50"
                  }`}
                  onClick={() => setSelectedRoute(selectedRoute === route.id ? null : route.id)}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-medium">{route.name}</h3>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                        <span>{route.distance}</span>
                        <span>{route.duration}</span>
                        <Badge variant="outline" className="text-xs">
                          {route.difficulty}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      {route.transportModes.map((mode) => (
                        <div key={mode} className="p-1 rounded bg-muted/50">
                          {getTransportIcon(mode)}
                        </div>
                      ))}
                    </div>
                  </div>

                  {selectedRoute === route.id && (
                    <div className="mt-3 pt-3 border-t space-y-2">
                      <div>
                        <p className="text-sm font-medium mb-1">Highlights:</p>
                        <div className="flex flex-wrap gap-1">
                          {route.highlights.map((highlight) => (
                            <Badge key={highlight} variant="secondary" className="text-xs">
                              {highlight}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4 text-muted-foreground" />
                          <span>Best time: {route.bestTime}</span>
                        </div>
                      </div>
                      <div className="flex gap-2 mt-3">
                        <Button size="sm" className="flex-1">
                          <Navigation className="w-4 h-4 mr-2" />
                          Get Directions
                        </Button>
                        <Button size="sm" variant="outline" className="flex-1 bg-transparent">
                          <Star className="w-4 h-4 mr-2" />
                          Save Route
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Districts Grid */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-primary" />
                Kerala Districts
              </CardTitle>
              <CardDescription>Explore all 14 districts of Kerala</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                {keralaDistricts.map((district) => (
                  <div
                    key={district.name}
                    className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                      selectedDistrict === district.name
                        ? "border-primary bg-primary/5"
                        : "border-border hover:bg-muted/50"
                    }`}
                    onClick={() => setSelectedDistrict(selectedDistrict === district.name ? null : district.name)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium text-sm">{district.name}</h3>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Thermometer className="w-3 h-3" />
                        {district.weather}
                      </div>
                    </div>

                    {selectedDistrict === district.name && (
                      <div className="mt-2 pt-2 border-t">
                        <p className="text-xs font-medium mb-1">Popular attractions:</p>
                        <div className="space-y-1">
                          {district.popular.map((place) => (
                            <div key={place} className="text-xs text-muted-foreground flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {place}
                            </div>
                          ))}
                        </div>
                        <Button size="sm" className="w-full mt-2">
                          Explore {district.name}
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Travel Alerts */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-orange-500" />
                Travel Alerts
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="p-3 rounded-lg bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-orange-500 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-orange-800 dark:text-orange-200">Heavy Rain Alert</p>
                    <p className="text-xs text-orange-600 dark:text-orange-300">
                      Idukki district - Expected till tomorrow
                    </p>
                  </div>
                </div>
              </div>
              <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-blue-500 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-blue-800 dark:text-blue-200">Road Maintenance</p>
                    <p className="text-xs text-blue-600 dark:text-blue-300">
                      Kochi-Munnar highway - Minor delays expected
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* AI Recommendations */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="w-5 h-5 text-primary" />
                AI Recommendations
              </CardTitle>
              <CardDescription>Personalized suggestions based on your preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="p-3 rounded-lg bg-gradient-to-r from-primary/10 to-accent/10 border">
                <h3 className="font-medium text-sm mb-1">Perfect Weather for Hill Stations</h3>
                <p className="text-xs text-muted-foreground mb-2">
                  Current weather is ideal for visiting Munnar and Wayanad
                </p>
                <Button size="sm" variant="outline">
                  Plan Hill Station Trip
                </Button>
              </div>
              <div className="p-3 rounded-lg bg-gradient-to-r from-accent/10 to-primary/10 border">
                <h3 className="font-medium text-sm mb-1">Monsoon Special</h3>
                <p className="text-xs text-muted-foreground mb-2">
                  Experience Kerala's monsoon beauty in Athirapally Falls
                </p>
                <Button size="sm" variant="outline">
                  Explore Waterfalls
                </Button>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  )
}
