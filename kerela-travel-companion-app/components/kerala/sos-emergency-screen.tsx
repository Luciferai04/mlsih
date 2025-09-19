"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, AlertTriangle, Phone, MapPin, Users, Shield, Siren, Clock, Navigation, Heart } from "lucide-react"

interface SOSEmergencyScreenProps {
  onBack: () => void
}

export default function SOSEmergencyScreen({ onBack }: SOSEmergencyScreenProps) {
  const [sosActive, setSosActive] = useState(false)
  const [emergencyType, setEmergencyType] = useState<string | null>(null)
  const [sosCountdown, setSosCountdown] = useState(0)

  const emergencyContacts = [
    { name: "Police", number: "100", icon: Shield, color: "text-blue-600" },
    { name: "Fire Service", number: "101", icon: Siren, color: "text-red-600" },
    { name: "Ambulance", number: "108", icon: Heart, color: "text-green-600" },
    { name: "Tourist Helpline", number: "1363", icon: Phone, color: "text-purple-600" },
    { name: "Disaster Management", number: "1077", icon: AlertTriangle, color: "text-orange-600" },
  ]

  const activeDisasters = [
    {
      id: 1,
      type: "Heavy Rainfall",
      severity: "high",
      location: "Idukki District",
      description: "Heavy rainfall warning with potential for landslides in hilly areas",
      timeIssued: "2 hours ago",
      validUntil: "Tomorrow 6 PM",
      affectedAreas: ["Munnar", "Thekkady", "Kumily"],
      instructions: ["Avoid travel to hill stations", "Stay indoors if possible", "Keep emergency kit ready"],
    },
    {
      id: 2,
      type: "Coastal Flooding",
      severity: "medium",
      location: "Alappuzha District",
      description: "High tide and strong winds causing coastal flooding in low-lying areas",
      timeIssued: "4 hours ago",
      validUntil: "Tonight 11 PM",
      affectedAreas: ["Marari Beach", "Kumrakom", "Backwater areas"],
      instructions: ["Avoid coastal roads", "Move to higher ground if in affected areas", "Monitor weather updates"],
    },
    {
      id: 3,
      type: "Road Closure",
      severity: "low",
      location: "Wayanad District",
      description: "Tree fall blocking main highway due to strong winds",
      timeIssued: "1 hour ago",
      validUntil: "Expected clearance in 3 hours",
      affectedAreas: ["Wayanad-Kozhikode Highway"],
      instructions: ["Use alternate routes", "Expect delays", "Drive carefully"],
    },
  ]

  const companionStatus = [
    { name: "Sarah Johnson", status: "safe", lastSeen: "2 minutes ago", location: "Kochi" },
    { name: "Mike Chen", status: "safe", lastSeen: "5 minutes ago", location: "Munnar" },
    { name: "Priya Sharma", status: "warning", lastSeen: "15 minutes ago", location: "Idukki" },
  ]

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "high":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100"
      case "medium":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100"
      case "low":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-100"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "safe":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"
      case "warning":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100"
      case "danger":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-100"
    }
  }

  const handleSOSActivation = () => {
    setSosActive(true)
    setSosCountdown(10)
    // In a real app, this would start the countdown and emergency protocols
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-md mx-auto bg-background min-h-screen">
        {/* Header */}
        <header className="bg-red-600 text-white p-4 sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={onBack} className="text-white hover:bg-white/20">
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div>
              <h1 className="text-lg font-bold">Emergency & SOS</h1>
              <p className="text-sm opacity-90">Safety features for Kerala travel</p>
            </div>
          </div>
        </header>

        <main className="p-4 space-y-4">
          {/* SOS Button */}
          <Card className="border-red-200 dark:border-red-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-600">
                <Siren className="w-5 h-5" />
                Emergency SOS
              </CardTitle>
              <CardDescription>Press and hold for 3 seconds to activate emergency alert</CardDescription>
            </CardHeader>
            <CardContent>
              {sosActive ? (
                <div className="text-center space-y-4">
                  <div className="w-24 h-24 mx-auto bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center">
                    <Siren className="w-12 h-12 text-red-600 animate-pulse" />
                  </div>
                  <div>
                    <p className="text-lg font-bold text-red-600">SOS ACTIVATED</p>
                    <p className="text-sm text-muted-foreground">Emergency services notified</p>
                    <p className="text-sm text-muted-foreground">Companions alerted</p>
                  </div>
                  <Button onClick={() => setSosActive(false)} variant="outline" className="w-full">
                    Cancel SOS
                  </Button>
                </div>
              ) : (
                <div className="text-center space-y-4">
                  <Button
                    onMouseDown={handleSOSActivation}
                    className="w-24 h-24 rounded-full bg-red-600 hover:bg-red-700 text-white text-lg font-bold"
                  >
                    SOS
                  </Button>
                  <p className="text-sm text-muted-foreground">Press and hold to activate emergency alert</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Emergency Contacts */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Phone className="w-5 h-5 text-primary" />
                Emergency Contacts
              </CardTitle>
              <CardDescription>Quick access to emergency services in Kerala</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {emergencyContacts.map((contact, index) => (
                <div key={index} className="flex items-center justify-between p-3 rounded-lg border">
                  <div className="flex items-center gap-3">
                    <contact.icon className={`w-5 h-5 ${contact.color}`} />
                    <div>
                      <p className="font-medium text-sm">{contact.name}</p>
                      <p className="text-xs text-muted-foreground">24/7 Available</p>
                    </div>
                  </div>
                  <Button size="sm" className="bg-green-600 hover:bg-green-700">
                    <Phone className="w-4 h-4 mr-2" />
                    {contact.number}
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Active Disasters & Alerts */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-orange-500" />
                Active Disaster Alerts
              </CardTitle>
              <CardDescription>Real-time disaster and safety alerts for Kerala</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {activeDisasters.map((disaster) => (
                <div key={disaster.id} className="p-3 rounded-lg border bg-card">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium text-sm">{disaster.type}</h3>
                        <Badge className={`text-xs ${getSeverityColor(disaster.severity)}`}>{disaster.severity}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mb-1">
                        <MapPin className="w-3 h-3 inline mr-1" />
                        {disaster.location}
                      </p>
                      <p className="text-xs text-muted-foreground mb-2">{disaster.description}</p>

                      <div className="space-y-1 mb-2">
                        <p className="text-xs font-medium">Affected Areas:</p>
                        <div className="flex flex-wrap gap-1">
                          {disaster.affectedAreas.map((area) => (
                            <Badge key={area} variant="outline" className="text-xs">
                              {area}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-1 mb-2">
                        <p className="text-xs font-medium">Safety Instructions:</p>
                        <ul className="text-xs text-muted-foreground space-y-0.5">
                          {disaster.instructions.map((instruction, idx) => (
                            <li key={idx} className="flex items-start gap-1">
                              <span className="text-primary">•</span>
                              {instruction}
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          Issued: {disaster.timeIssued}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          Valid until: {disaster.validUntil}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-3">
                    <Button size="sm" variant="outline" className="flex-1 bg-transparent">
                      <Navigation className="w-4 h-4 mr-2" />
                      Alternate Routes
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1 bg-transparent">
                      <AlertTriangle className="w-4 h-4 mr-2" />
                      More Info
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Companion Safety Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5 text-primary" />
                Companion Safety Status
              </CardTitle>
              <CardDescription>Real-time safety status of your travel companions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {companionStatus.map((companion, index) => (
                <div key={index} className="flex items-center justify-between p-3 rounded-lg border">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <Users className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{companion.name}</p>
                      <p className="text-xs text-muted-foreground">
                        <MapPin className="w-3 h-3 inline mr-1" />
                        {companion.location} • {companion.lastSeen}
                      </p>
                    </div>
                  </div>
                  <Badge className={`text-xs ${getStatusColor(companion.status)}`}>{companion.status}</Badge>
                </div>
              ))}
              <Button variant="outline" className="w-full bg-transparent">
                <Users className="w-4 h-4 mr-2" />
                Send Safety Check
              </Button>
            </CardContent>
          </Card>

          {/* Emergency Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-primary" />
                Emergency Preparedness
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800">
                <h3 className="font-medium text-sm text-blue-800 dark:text-blue-200 mb-1">Emergency Kit Checklist</h3>
                <ul className="text-xs text-blue-600 dark:text-blue-300 space-y-0.5">
                  <li>• First aid supplies</li>
                  <li>• Emergency contact numbers</li>
                  <li>• Flashlight and batteries</li>
                  <li>• Water and non-perishable food</li>
                  <li>• Important documents (copies)</li>
                </ul>
              </div>

              <div className="p-3 rounded-lg bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800">
                <h3 className="font-medium text-sm text-green-800 dark:text-green-200 mb-1">
                  Kerala Travel Safety Tips
                </h3>
                <ul className="text-xs text-green-600 dark:text-green-300 space-y-0.5">
                  <li>• Monitor weather conditions regularly</li>
                  <li>• Inform someone about your travel plans</li>
                  <li>• Keep emergency contacts handy</li>
                  <li>• Stay updated on local alerts</li>
                  <li>• Carry identification at all times</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  )
}
