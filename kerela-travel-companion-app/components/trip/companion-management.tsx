"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Users, Plus, QrCode, UserPlus, MapPin } from "lucide-react"

interface CompanionManagementProps {
  onBack: () => void
}

export default function CompanionManagement({ onBack }: CompanionManagementProps) {
  const [companions, setCompanions] = useState([
    {
      id: "1",
      name: "Sarah Johnson",
      email: "sarah@example.com",
      avatar: "",
      status: "active",
      joinedTrips: 5,
      totalDistance: 234,
    },
    {
      id: "2",
      name: "Mike Chen",
      email: "mike@example.com",
      avatar: "",
      status: "offline",
      joinedTrips: 3,
      totalDistance: 156,
    },
  ])
  const [showAddForm, setShowAddForm] = useState(false)
  const [newCompanionId, setNewCompanionId] = useState("")

  const addCompanion = () => {
    if (newCompanionId.trim()) {
      // Simulate adding companion
      const newCompanion = {
        id: Date.now().toString(),
        name: "New Companion",
        email: `${newCompanionId}@example.com`,
        avatar: "",
        status: "pending",
        joinedTrips: 0,
        totalDistance: 0,
      }
      setCompanions((prev) => [...prev, newCompanion])
      setNewCompanionId("")
      setShowAddForm(false)
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
              <h1 className="text-xl font-bold">Travel Companions</h1>
              <p className="text-sm opacity-90">Manage your travel group</p>
            </div>
          </div>
        </header>

        <main className="p-4 space-y-4">
          {/* Add Companion Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-primary" />
                Add Companions
              </CardTitle>
              <CardDescription>Invite friends to join your travel group</CardDescription>
            </CardHeader>
            <CardContent>
              {!showAddForm ? (
                <div className="space-y-3">
                  <Button onClick={() => setShowAddForm(true)} className="w-full">
                    <Plus className="w-4 h-4 mr-2" />
                    Add by User ID
                  </Button>
                  <Button variant="outline" className="w-full bg-transparent">
                    <QrCode className="w-4 h-4 mr-2" />
                    Scan QR Code
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="space-y-2">
                    <Label htmlFor="companionId">User ID or Email</Label>
                    <Input
                      id="companionId"
                      value={newCompanionId}
                      onChange={(e) => setNewCompanionId(e.target.value)}
                      placeholder="Enter user ID or email"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={addCompanion} className="flex-1">
                      Add Companion
                    </Button>
                    <Button onClick={() => setShowAddForm(false)} variant="outline" className="flex-1">
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Current Companions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5 text-primary" />
                Your Companions ({companions.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {companions.map((companion) => (
                <div key={companion.id} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                  <Avatar>
                    <AvatarImage src={companion.avatar || "/placeholder.svg"} />
                    <AvatarFallback>
                      {companion.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{companion.name}</p>
                      <Badge
                        variant={
                          companion.status === "active"
                            ? "default"
                            : companion.status === "pending"
                              ? "secondary"
                              : "outline"
                        }
                        className="text-xs"
                      >
                        {companion.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{companion.email}</p>
                    <div className="flex items-center gap-4 mt-1">
                      <span className="text-xs text-muted-foreground">{companion.joinedTrips} trips</span>
                      <span className="text-xs text-muted-foreground">{companion.totalDistance} km</span>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Group Trip Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Group Statistics</CardTitle>
              <CardDescription>Combined travel data</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-primary/10 rounded-lg">
                  <div className="text-2xl font-bold text-primary">8</div>
                  <div className="text-sm text-muted-foreground">Group Trips</div>
                </div>
                <div className="text-center p-3 bg-accent/10 rounded-lg">
                  <div className="text-2xl font-bold text-accent">1,247</div>
                  <div className="text-sm text-muted-foreground">Total KM</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Group Activities */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Recent Group Activities</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3 p-2 rounded-lg bg-muted/50">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <MapPin className="w-4 h-4 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Group trip to Goa</p>
                  <p className="text-xs text-muted-foreground">With Sarah, Mike • 3 days ago</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-2 rounded-lg bg-muted/50">
                <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center">
                  <Users className="w-4 h-4 text-accent" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Sarah joined your group</p>
                  <p className="text-xs text-muted-foreground">1 week ago</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* QR Code for Others to Join */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Your QR Code</CardTitle>
              <CardDescription>Let others scan to join your group</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="aspect-square bg-muted/50 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <QrCode className="w-16 h-16 mx-auto text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">QR Code</p>
                  <p className="text-xs text-muted-foreground">ID: USER123456</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  )
}
