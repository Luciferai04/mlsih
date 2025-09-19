"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  ArrowLeft,
  Cloud,
  Sun,
  CloudRain,
  Wind,
  Droplets,
  Eye,
  Thermometer,
  Star,
  Clock,
  AlertTriangle,
  Zap,
} from "lucide-react"

interface WeatherAIScreenProps {
  onBack: () => void
}

export default function WeatherAIScreen({ onBack }: WeatherAIScreenProps) {
  const [selectedLocation, setSelectedLocation] = useState("Kochi")
  const [forecastDays, setForecastDays] = useState(7)

  const currentWeather = {
    location: "Kochi, Kerala",
    temperature: 31,
    condition: "Partly Cloudy",
    humidity: 78,
    windSpeed: 12,
    visibility: 8,
    uvIndex: 7,
    rainfall: 0,
    icon: "partly-cloudy",
  }

  const forecast = [
    { day: "Today", high: 31, low: 24, condition: "Partly Cloudy", rain: 20, icon: "partly-cloudy" },
    { day: "Tomorrow", high: 29, low: 23, condition: "Light Rain", rain: 80, icon: "rain" },
    { day: "Wed", high: 28, low: 22, condition: "Heavy Rain", rain: 95, icon: "heavy-rain" },
    { day: "Thu", high: 30, low: 24, condition: "Cloudy", rain: 40, icon: "cloudy" },
    { day: "Fri", high: 32, low: 25, condition: "Sunny", rain: 10, icon: "sunny" },
    { day: "Sat", high: 33, low: 26, condition: "Sunny", rain: 5, icon: "sunny" },
    { day: "Sun", high: 31, low: 25, condition: "Partly Cloudy", rain: 30, icon: "partly-cloudy" },
  ]

  const aiRecommendations = [
    {
      id: 1,
      type: "travel",
      priority: "high",
      title: "Perfect Beach Weather This Weekend",
      description: "Sunny conditions with low humidity make it ideal for visiting Kovalam and Varkala beaches.",
      action: "Plan Beach Trip",
      validUntil: "This Weekend",
      confidence: 92,
    },
    {
      id: 2,
      type: "activity",
      priority: "medium",
      title: "Monsoon Photography Opportunity",
      description: "Heavy rains expected in Idukki - perfect for capturing dramatic waterfall shots at Athirapally.",
      action: "Photography Tour",
      validUntil: "Next 3 Days",
      confidence: 88,
    },
    {
      id: 3,
      type: "transport",
      priority: "high",
      title: "Avoid Hill Stations Tomorrow",
      description: "Heavy rainfall predicted in Munnar and Wayanad. Consider postponing hill station visits.",
      action: "Reschedule Trip",
      validUntil: "Tomorrow",
      confidence: 95,
    },
    {
      id: 4,
      type: "cultural",
      priority: "low",
      title: "Temple Festival Weather",
      description: "Clear skies forecasted for Thrissur - great time to experience local temple festivals.",
      action: "Explore Festivals",
      validUntil: "This Week",
      confidence: 85,
    },
  ]

  const getWeatherIcon = (condition: string) => {
    switch (condition) {
      case "sunny":
        return <Sun className="w-6 h-6 text-yellow-500" />
      case "partly-cloudy":
        return <Cloud className="w-6 h-6 text-gray-500" />
      case "cloudy":
        return <Cloud className="w-6 h-6 text-gray-600" />
      case "rain":
      case "light-rain":
        return <CloudRain className="w-6 h-6 text-blue-500" />
      case "heavy-rain":
        return <CloudRain className="w-6 h-6 text-blue-700" />
      default:
        return <Sun className="w-6 h-6 text-yellow-500" />
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100"
      case "medium":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100"
      case "low":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"
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
              variant="ghost"
              size="sm"
              onClick={onBack}
              className="text-primary-foreground hover:bg-primary-foreground/20"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div>
              <h1 className="text-lg font-bold">Weather & AI Insights</h1>
              <p className="text-sm opacity-90">Smart travel recommendations for Kerala</p>
            </div>
          </div>
        </header>

        <main className="p-4 space-y-4">
          {/* Current Weather */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Thermometer className="w-5 h-5 text-primary" />
                Current Weather
              </CardTitle>
              <CardDescription>{currentWeather.location}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  {getWeatherIcon(currentWeather.icon)}
                  <div>
                    <div className="text-3xl font-bold">{currentWeather.temperature}°C</div>
                    <div className="text-sm text-muted-foreground">{currentWeather.condition}</div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Droplets className="w-4 h-4 text-blue-500" />
                  <span>Humidity: {currentWeather.humidity}%</span>
                </div>
                <div className="flex items-center gap-2">
                  <Wind className="w-4 h-4 text-gray-500" />
                  <span>Wind: {currentWeather.windSpeed} km/h</span>
                </div>
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4 text-purple-500" />
                  <span>Visibility: {currentWeather.visibility} km</span>
                </div>
                <div className="flex items-center gap-2">
                  <Sun className="w-4 h-4 text-orange-500" />
                  <span>UV Index: {currentWeather.uvIndex}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 7-Day Forecast */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Cloud className="w-5 h-5 text-primary" />
                7-Day Forecast
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {forecast.map((day, index) => (
                <div key={index} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-3">
                    {getWeatherIcon(day.icon)}
                    <div>
                      <div className="font-medium text-sm">{day.day}</div>
                      <div className="text-xs text-muted-foreground">{day.condition}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">
                      {day.high}°/{day.low}°
                    </div>
                    <div className="text-xs text-blue-600 dark:text-blue-400">{day.rain}% rain</div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* AI Recommendations */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-primary" />
                AI Travel Recommendations
              </CardTitle>
              <CardDescription>Personalized suggestions based on weather and your preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {aiRecommendations.map((rec) => (
                <div key={rec.id} className="p-3 rounded-lg border bg-card">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium text-sm">{rec.title}</h3>
                        <Badge className={`text-xs ${getPriorityColor(rec.priority)}`}>{rec.priority}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mb-2">{rec.description}</p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {rec.validUntil}
                        </div>
                        <div className="flex items-center gap-1">
                          <Star className="w-3 h-3" />
                          {rec.confidence}% confidence
                        </div>
                      </div>
                    </div>
                  </div>
                  <Button size="sm" variant="outline" className="w-full bg-transparent">
                    {rec.action}
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Weather Alerts */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-orange-500" />
                Weather Alerts
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="p-3 rounded-lg bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-orange-500 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-orange-800 dark:text-orange-200">Heavy Rainfall Warning</p>
                    <p className="text-xs text-orange-600 dark:text-orange-300 mb-2">
                      Idukki and Wayanad districts - Expected 100-150mm rainfall tomorrow
                    </p>
                    <Badge className="bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-100 text-xs">
                      Valid until: Tomorrow 6 PM
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800">
                <div className="flex items-start gap-2">
                  <Sun className="w-4 h-4 text-yellow-500 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">High UV Index</p>
                    <p className="text-xs text-yellow-600 dark:text-yellow-300 mb-2">
                      UV levels reaching 9+ in coastal areas - Use sun protection
                    </p>
                    <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100 text-xs">
                      Valid: 11 AM - 4 PM daily
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Best Time to Visit */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-primary" />
                Best Time to Visit
              </CardTitle>
              <CardDescription>AI-powered timing recommendations for Kerala attractions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="p-3 rounded-lg bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium text-sm text-green-800 dark:text-green-200">Munnar Tea Gardens</h3>
                  <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100 text-xs">
                    Excellent
                  </Badge>
                </div>
                <p className="text-xs text-green-600 dark:text-green-300 mb-2">
                  Perfect weather conditions with clear skies and cool temperatures (22-25°C)
                </p>
                <div className="flex items-center gap-2 text-xs text-green-600 dark:text-green-300">
                  <Clock className="w-3 h-3" />
                  Best time: Early morning (6-9 AM) or evening (4-6 PM)
                </div>
              </div>

              <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium text-sm text-blue-800 dark:text-blue-200">Backwater Cruises</h3>
                  <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100 text-xs">Good</Badge>
                </div>
                <p className="text-xs text-blue-600 dark:text-blue-300 mb-2">
                  Partly cloudy conditions provide comfortable temperatures for boat rides
                </p>
                <div className="flex items-center gap-2 text-xs text-blue-600 dark:text-blue-300">
                  <Clock className="w-3 h-3" />
                  Best time: Morning (8-11 AM) or late afternoon (3-5 PM)
                </div>
              </div>

              <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium text-sm text-red-800 dark:text-red-200">Beach Activities</h3>
                  <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100 text-xs">
                    Avoid Tomorrow
                  </Badge>
                </div>
                <p className="text-xs text-red-600 dark:text-red-300 mb-2">
                  High UV index and strong winds expected - postpone beach visits
                </p>
                <div className="flex items-center gap-2 text-xs text-red-600 dark:text-red-300">
                  <Clock className="w-3 h-3" />
                  Better time: Day after tomorrow (morning hours)
                </div>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  )
}
