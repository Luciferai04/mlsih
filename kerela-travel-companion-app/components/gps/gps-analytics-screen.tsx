"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  ArrowLeft,
  MapPin,
  Activity,
  TrendingUp,
  Navigation,
  Gauge,
  Timer,
  Map,
  BarChart3,
  AlertCircle,
  Download,
  Play,
  Pause,
  RefreshCw,
  Zap,
  Mountain,
  Target,
  Layers
} from "lucide-react"
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ScatterChart,
  Scatter
} from "recharts"

interface GPSAnalyticsScreenProps {
  onBack: () => void
}

export default function GPSAnalyticsScreen({ onBack }: GPSAnalyticsScreenProps) {
  const [isTracking, setIsTracking] = useState(false)
  const [gpsData, setGpsData] = useState<any[]>([])
  const [currentStats, setCurrentStats] = useState({
    speed: 0,
    distance: 0,
    duration: 0,
    altitude: 0,
    accuracy: 10,
    satellites: 8,
    avgSpeed: 0,
    maxSpeed: 0,
    stops: 0,
    ecoScore: 85
  })
  
  const watchId = useRef<number | null>(null)
  const startTime = useRef<number | null>(null)

  // Speed distribution data
  const [speedZonesData, setSpeedZonesData] = useState([
    { name: 'Stopped', value: 10, color: '#ef4444' },
    { name: 'Slow', value: 25, color: '#f97316' },
    { name: 'Medium', value: 40, color: '#22c55e' },
    { name: 'Fast', value: 20, color: '#3b82f6' },
    { name: 'Very Fast', value: 5, color: '#a855f7' }
  ])

  // Efficiency radar data
  const [efficiencyData, setEfficiencyData] = useState([
    {
      metric: 'Route',
      value: 85,
      fullMark: 100
    },
    {
      metric: 'Speed',
      value: 75,
      fullMark: 100
    },
    {
      metric: 'Eco',
      value: 90,
      fullMark: 100
    },
    {
      metric: 'Time',
      value: 80,
      fullMark: 100
    },
    {
      metric: 'Safety',
      value: 95,
      fullMark: 100
    }
  ])

  // Sample chart data (will be updated with real GPS data)
  const [speedChartData, setSpeedChartData] = useState([
    { time: '0', speed: 0 },
    { time: '1', speed: 20 },
    { time: '2', speed: 35 },
    { time: '3', speed: 45 },
    { time: '4', speed: 40 },
    { time: '5', speed: 55 }
  ])

  const [distanceChartData, setDistanceChartData] = useState([
    { time: '0', distance: 0 },
    { time: '1', distance: 0.5 },
    { time: '2', distance: 1.2 },
    { time: '3', distance: 2.1 },
    { time: '4', distance: 3.0 },
    { time: '5', distance: 4.2 }
  ])

  const [elevationChartData, setElevationChartData] = useState([
    { distance: '0', elevation: 10 },
    { distance: '1', elevation: 15 },
    { distance: '2', elevation: 25 },
    { distance: '3', elevation: 45 },
    { distance: '4', elevation: 35 },
    { distance: '5', elevation: 20 }
  ])

  // Start GPS tracking
  const startTracking = () => {
    if ('geolocation' in navigator) {
      setIsTracking(true)
      startTime.current = Date.now()
      setGpsData([])
      
      watchId.current = navigator.geolocation.watchPosition(
        (position) => {
          const newPoint = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            speed: position.coords.speed || 0,
            altitude: position.coords.altitude || 0,
            accuracy: position.coords.accuracy,
            timestamp: Date.now()
          }
          
          setGpsData(prev => [...prev, newPoint])
          updateStats(newPoint)
          updateCharts(newPoint)
        },
        (error) => {
          console.error('GPS Error:', error)
          // Fallback to simulation for demo
          simulateGPSData()
        },
        {
          enableHighAccuracy: true,
          maximumAge: 0,
          timeout: 5000
        }
      )
    } else {
      // Simulation mode for browsers without GPS
      simulateGPSData()
    }
  }

  // Stop GPS tracking
  const stopTracking = () => {
    setIsTracking(false)
    if (watchId.current !== null) {
      navigator.geolocation.clearWatch(watchId.current)
      watchId.current = null
    }
  }

  // Simulate GPS data for demo
  const simulateGPSData = () => {
    setIsTracking(true)
    startTime.current = Date.now()
    let simulationIndex = 0
    
    const simulationInterval = setInterval(() => {
      if (!isTracking || simulationIndex >= 20) {
        clearInterval(simulationInterval)
        return
      }
      
      const newPoint = {
        lat: 9.9312 + (simulationIndex * 0.01),
        lng: 76.2673 + (simulationIndex * 0.01),
        speed: 10 + Math.random() * 15,
        altitude: 10 + Math.random() * 30,
        accuracy: 5 + Math.random() * 10,
        timestamp: Date.now()
      }
      
      setGpsData(prev => [...prev, newPoint])
      updateStats(newPoint)
      updateCharts(newPoint)
      simulationIndex++
    }, 1000)
  }

  // Update real-time stats
  const updateStats = (point: any) => {
    setCurrentStats(prev => ({
      ...prev,
      speed: Math.round(point.speed * 3.6), // Convert m/s to km/h
      altitude: Math.round(point.altitude),
      accuracy: Math.round(point.accuracy),
      duration: startTime.current ? Math.floor((Date.now() - startTime.current) / 60000) : 0
    }))
  }

  // Update charts with new data
  const updateCharts = (point: any) => {
    const timeLabel = gpsData.length.toString()
    
    setSpeedChartData(prev => [...prev.slice(-9), {
      time: timeLabel,
      speed: Math.round(point.speed * 3.6)
    }])
    
    if (gpsData.length > 0) {
      const distance = calculateDistance()
      setDistanceChartData(prev => [...prev.slice(-9), {
        time: timeLabel,
        distance: parseFloat(distance.toFixed(2))
      }])
      
      setCurrentStats(prev => ({
        ...prev,
        distance: parseFloat(distance.toFixed(2))
      }))
    }
    
    setElevationChartData(prev => [...prev.slice(-9), {
      distance: timeLabel,
      elevation: Math.round(point.altitude)
    }])
  }

  // Calculate distance between GPS points
  const calculateDistance = () => {
    if (gpsData.length < 2) return 0
    
    let totalDistance = 0
    for (let i = 1; i < gpsData.length; i++) {
      const lat1 = gpsData[i - 1].lat
      const lon1 = gpsData[i - 1].lng
      const lat2 = gpsData[i].lat
      const lon2 = gpsData[i].lng
      
      // Haversine formula
      const R = 6371 // Earth's radius in km
      const dLat = (lat2 - lat1) * Math.PI / 180
      const dLon = (lon2 - lon1) * Math.PI / 180
      const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
                Math.sin(dLon/2) * Math.sin(dLon/2)
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
      const distance = R * c
      
      totalDistance += distance
    }
    
    return totalDistance
  }

  // Generate analytics report
  const generateReport = () => {
    const report = {
      timestamp: new Date().toISOString(),
      totalDistance: currentStats.distance,
      avgSpeed: currentStats.avgSpeed,
      maxSpeed: currentStats.maxSpeed,
      duration: currentStats.duration,
      stops: currentStats.stops,
      ecoScore: currentStats.ecoScore,
      gpsPoints: gpsData.length
    }
    
    // In a real app, this would send to backend or save locally
    console.log('Analytics Report:', report)
    
    // Convert to JSON and create download
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `gps-analytics-${Date.now()}.json`
    a.click()
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4">
        <div className="flex items-center gap-3 mb-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={onBack}
            className="text-white hover:bg-white/20"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-xl font-bold">GPS Analytics</h1>
            <p className="text-sm opacity-90">Advanced travel tracking & insights</p>
          </div>
          <Badge variant="secondary" className="bg-white/20 text-white">
            <Activity className="w-3 h-3 mr-1" />
            {isTracking ? 'Live' : 'Idle'}
          </Badge>
        </div>
      </div>

      {/* Control Panel */}
      <div className="p-4 bg-muted/50">
        <div className="flex gap-2">
          {!isTracking ? (
            <Button onClick={startTracking} className="flex-1">
              <Play className="w-4 h-4 mr-2" />
              Start GPS Tracking
            </Button>
          ) : (
            <Button onClick={stopTracking} variant="destructive" className="flex-1">
              <Pause className="w-4 h-4 mr-2" />
              Stop Tracking
            </Button>
          )}
          <Button onClick={generateReport} variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Real-time Stats Grid */}
      <div className="p-4">
        <div className="grid grid-cols-2 gap-3 mb-4">
          <Card>
            <CardContent className="p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Current Speed</p>
                  <p className="text-2xl font-bold">{currentStats.speed}</p>
                  <p className="text-xs text-muted-foreground">km/h</p>
                </div>
                <Gauge className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Distance</p>
                  <p className="text-2xl font-bold">{currentStats.distance}</p>
                  <p className="text-xs text-muted-foreground">km</p>
                </div>
                <Navigation className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Duration</p>
                  <p className="text-2xl font-bold">{currentStats.duration}</p>
                  <p className="text-xs text-muted-foreground">minutes</p>
                </div>
                <Timer className="w-8 h-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Altitude</p>
                  <p className="text-2xl font-bold">{currentStats.altitude}</p>
                  <p className="text-xs text-muted-foreground">meters</p>
                </div>
                <Mountain className="w-8 h-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* GPS Signal Quality */}
        <Card className="mb-4">
          <CardContent className="p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">GPS Accuracy</span>
              <Badge variant={currentStats.accuracy < 10 ? "default" : "secondary"}>
                ±{currentStats.accuracy}m
              </Badge>
            </div>
            <Progress value={100 - (currentStats.accuracy * 2)} className="h-2" />
            <div className="flex justify-between mt-2">
              <span className="text-xs text-muted-foreground">Satellites: {currentStats.satellites}</span>
              <span className="text-xs text-muted-foreground">
                {currentStats.accuracy < 10 ? 'Excellent' : currentStats.accuracy < 20 ? 'Good' : 'Fair'}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Analytics Tabs */}
        <Tabs defaultValue="speed" className="space-y-4">
          <TabsList className="grid grid-cols-4 w-full">
            <TabsTrigger value="speed">Speed</TabsTrigger>
            <TabsTrigger value="distance">Distance</TabsTrigger>
            <TabsTrigger value="elevation">Elevation</TabsTrigger>
            <TabsTrigger value="efficiency">Efficiency</TabsTrigger>
          </TabsList>

          {/* Speed Analysis */}
          <TabsContent value="speed" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  Speed Profile
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={speedChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis />
                    <Tooltip />
                    <Line 
                      type="monotone" 
                      dataKey="speed" 
                      stroke="#3b82f6" 
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Speed Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={speedZonesData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {speedZonesData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="mt-4 grid grid-cols-2 gap-2">
                  {speedZonesData.map((zone) => (
                    <div key={zone.name} className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: zone.color }}
                      />
                      <span className="text-xs">{zone.name}: {zone.value}%</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Distance Analysis */}
          <TabsContent value="distance" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Map className="w-4 h-4" />
                  Distance Accumulation
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <AreaChart data={distanceChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis />
                    <Tooltip />
                    <Area 
                      type="monotone" 
                      dataKey="distance" 
                      stroke="#22c55e" 
                      fill="#22c55e"
                      fillOpacity={0.3}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Trip Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Total Distance</span>
                  <span className="text-sm font-medium">{currentStats.distance} km</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Average Speed</span>
                  <span className="text-sm font-medium">{currentStats.avgSpeed} km/h</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Max Speed</span>
                  <span className="text-sm font-medium">{currentStats.maxSpeed} km/h</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Stops Made</span>
                  <span className="text-sm font-medium">{currentStats.stops}</span>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Elevation Analysis */}
          <TabsContent value="elevation" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Mountain className="w-4 h-4" />
                  Elevation Profile
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <AreaChart data={elevationChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="distance" />
                    <YAxis />
                    <Tooltip />
                    <Area 
                      type="monotone" 
                      dataKey="elevation" 
                      stroke="#f97316" 
                      fill="#f97316"
                      fillOpacity={0.3}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Elevation Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Current Altitude</span>
                  <span className="text-sm font-medium">{currentStats.altitude} m</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Total Ascent</span>
                  <span className="text-sm font-medium">245 m</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Total Descent</span>
                  <span className="text-sm font-medium">180 m</span>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Efficiency Analysis */}
          <TabsContent value="efficiency" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Target className="w-4 h-4" />
                  Efficiency Metrics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <RadarChart data={efficiencyData}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="metric" />
                    <PolarRadiusAxis angle={90} domain={[0, 100]} />
                    <Radar 
                      name="Efficiency" 
                      dataKey="value" 
                      stroke="#8b5cf6" 
                      fill="#8b5cf6" 
                      fillOpacity={0.5}
                    />
                    <Tooltip />
                  </RadarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Zap className="w-4 h-4" />
                  Eco Score
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold">{currentStats.ecoScore}</span>
                    <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
                      Excellent
                    </Badge>
                  </div>
                  <Progress value={currentStats.ecoScore} className="h-3" />
                  <p className="text-sm text-muted-foreground">
                    Your driving pattern shows excellent fuel efficiency and eco-friendly behavior
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Insights */}
        <Card className="mt-4">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              Trip Insights
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg">
              <p className="text-sm font-medium">Route Efficiency</p>
              <p className="text-xs text-muted-foreground">
                Your route was 92% efficient compared to the shortest path
              </p>
            </div>
            <div className="p-3 bg-green-50 dark:bg-green-950/30 rounded-lg">
              <p className="text-sm font-medium">Speed Pattern</p>
              <p className="text-xs text-muted-foreground">
                Maintained consistent speed for 75% of the journey
              </p>
            </div>
            <div className="p-3 bg-purple-50 dark:bg-purple-950/30 rounded-lg">
              <p className="text-sm font-medium">Kerala Tourism Tip</p>
              <p className="text-xs text-muted-foreground">
                You're near Athirappilly Falls - perfect for a scenic break!
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}