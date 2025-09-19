"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MapPin, Navigation, Car, Train, Bus, Bike, Footprints, Plane, Play, Square, Pause } from "lucide-react"

interface TripTrackingScreenProps {
  onBack: () => void
}

export default function TripTrackingScreen({ onBack }: TripTrackingScreenProps) {
  const [tripStatus, setTripStatus] = useState<"idle" | "active" | "paused">("idle")
  const [tripData, setTripData] = useState({
    startTime: null as Date | null,
    endTime: null as Date | null,
    duration: 0,
    distance: 0,
    mode: "auto" as string,
    route: [] as { lat: number; lng: number; timestamp: Date }[],
    currentLocation: { lat: 28.6139, lng: 77.209 }, // Delhi coordinates
  })
  const [detectedMode, setDetectedMode] = useState<string>("walking")

  // Simulate GPS tracking
  useEffect(() => {
    let interval: NodeJS.Timeout

    if (tripStatus === "active") {
      interval = setInterval(() => {
        setTripData((prev) => ({
          ...prev,
          duration: prev.duration + 1,
          distance: prev.distance + Math.random() * 0.1, // Simulate distance increment
          route: [
            ...prev.route,
            {
              lat: prev.currentLocation.lat + (Math.random() - 0.5) * 0.001,
              lng: prev.currentLocation.lng + (Math.random() - 0.5) * 0.001,
              timestamp: new Date(),
            },
          ],
        }))

        // Simulate transport mode detection
        const modes = ["walking", "car", "bus", "train", "bike"]
        if (Math.random() < 0.1) {
          // 10% chance to change mode
          setDetectedMode(modes[Math.floor(Math.random() * modes.length)])
        }
      }, 1000)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [tripStatus])

  const startTrip = () => {
    setTripData((prev) => ({
      ...prev,
      startTime: new Date(),
      duration: 0,
      distance: 0,
      route: [],
    }))
    setTripStatus("active")
  }

  const pauseTrip = () => {
    setTripStatus("paused")
  }

  const resumeTrip = () => {
    setTripStatus("active")
  }

  const endTrip = () => {
    setTripData((prev) => ({
      ...prev,
      endTime: new Date(),
    }))
    setTripStatus("idle")
    // Here you would save the trip data to backend
  }

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60

    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`
    } else {
      return `${secs}s`
    }
  }

  const getModeIcon = (mode: string) => {
    switch (mode) {
      case "car":
        return <Car className="w-4 h-4" />
      case "bus":
        return <Bus className="w-4 h-4" />
      case "train":
        return <Train className="w-4 h-4" />
      case "bike":
        return <Bike className="w-4 h-4" />
      case "walking":
        return <Footprints className="w-4 h-4" />
      case "plane":
        return <Plane className="w-4 h-4" />
      default:
        return <Navigation className="w-4 h-4" />
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-md mx-auto bg-background min-h-screen">
        {/* Header */}
        <header className="bg-primary text-primary-foreground p-4 rounded-b-lg">
          <div className="flex items-center gap-3">
            <Button
              onClick={onBack}
              variant="ghost"
              size="sm"
              className="text-primary-foreground hover:bg-primary-foreground/20"
            >
              ←
            </Button>
            <div>
              <h1 className="text-xl font-bold">Trip Tracking</h1>
              <p className="text-sm opacity-90">Real-time journey monitoring</p>
            </div>
          </div>
        </header>

        <main className="p-4 space-y-4">
          {/* Trip Status Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-primary" />
                  Trip Status
                </span>
                <Badge
                  variant={tripStatus === "active" ? "default" : tripStatus === "paused" ? "secondary" : "outline"}
                >
                  {tripStatus === "active" ? "Active" : tripStatus === "paused" ? "Paused" : "Ready"}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {tripStatus === "idle" ? (
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
                    <Play className="w-8 h-8 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">Ready to start tracking</p>
                    <p className="text-sm text-muted-foreground">Tap to begin your journey</p>
                  </div>
                  <Button onClick={startTrip} className="w-full" size="lg">
                    <Play className="w-4 h-4 mr-2" />
                    Start Trip
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Live Stats */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-muted/50 rounded-lg">
                      <div className="text-2xl font-bold text-primary">{formatDuration(tripData.duration)}</div>
                      <div className="text-xs text-muted-foreground">Duration</div>
                    </div>
                    <div className="text-center p-3 bg-muted/50 rounded-lg">
                      <div className="text-2xl font-bold text-primary">{tripData.distance.toFixed(1)} km</div>
                      <div className="text-xs text-muted-foreground">Distance</div>
                    </div>
                  </div>

                  {/* Transport Mode Detection */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Detected Mode:</span>
                      <div className="flex items-center gap-2">
                        {getModeIcon(detectedMode)}
                        <span className="text-sm capitalize">{detectedMode}</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Override Mode:</label>
                      <Select
                        value={tripData.mode}
                        onValueChange={(value) => setTripData((prev) => ({ ...prev, mode: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select transport mode" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="auto">Auto-detect</SelectItem>
                          <SelectItem value="walking">Walking</SelectItem>
                          <SelectItem value="bike">Bicycle</SelectItem>
                          <SelectItem value="car">Car</SelectItem>
                          <SelectItem value="bus">Bus</SelectItem>
                          <SelectItem value="train">Train</SelectItem>
                          <SelectItem value="plane">Plane</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Control Buttons */}
                  <div className="flex gap-2">
                    {tripStatus === "active" ? (
                      <>
                        <Button onClick={pauseTrip} variant="outline" className="flex-1 bg-transparent">
                          <Pause className="w-4 h-4 mr-2" />
                          Pause
                        </Button>
                        <Button onClick={endTrip} variant="destructive" className="flex-1">
                          <Square className="w-4 h-4 mr-2" />
                          End Trip
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button onClick={resumeTrip} className="flex-1">
                          <Play className="w-4 h-4 mr-2" />
                          Resume
                        </Button>
                        <Button onClick={endTrip} variant="destructive" className="flex-1">
                          <Square className="w-4 h-4 mr-2" />
                          End Trip
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* GPS Status */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Navigation className="w-5 h-5 text-primary" />
                GPS Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">GPS Signal:</span>
                  <Badge className="bg-green-100 text-green-800">Strong</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Accuracy:</span>
                  <span className="text-sm font-medium">±3 meters</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Last Update:</span>
                  <span className="text-sm font-medium">Just now</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Route Preview */}
          {tripData.route.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Route Preview</CardTitle>
                <CardDescription>Your journey path</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="aspect-video bg-muted/50 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <MapPin className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">Map visualization</p>
                    <p className="text-xs text-muted-foreground">{tripData.route.length} GPS points recorded</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Trip History Preview */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Recent Trips</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3 p-2 rounded-lg bg-muted/50">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <Car className="w-4 h-4 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Delhi to Gurgaon</p>
                  <p className="text-xs text-muted-foreground">Yesterday • 45 km • 1h 20m</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-2 rounded-lg bg-muted/50">
                <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center">
                  <Train className="w-4 h-4 text-accent" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Home to Office</p>
                  <p className="text-xs text-muted-foreground">2 days ago • 12 km • 35m</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  )
}
