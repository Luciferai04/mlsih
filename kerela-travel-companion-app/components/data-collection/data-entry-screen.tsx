"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Camera, MapPin, FileText, Plus, Save, ImageIcon, Mic, Navigation } from "lucide-react"

interface DataEntryScreenProps {
  onBack: () => void
}

export default function DataEntryScreen({ onBack }: DataEntryScreenProps) {
  const [activeTab, setActiveTab] = useState("location")
  const [formData, setFormData] = useState({
    location: {
      name: "",
      coordinates: "",
      category: "",
      description: "",
      accessibility: "",
      crowdLevel: "",
    },
    photo: {
      caption: "",
      category: "",
      tags: "",
      location: "",
    },
    note: {
      title: "",
      content: "",
      category: "",
      tags: "",
      mood: "",
    },
    expense: {
      amount: "",
      category: "",
      description: "",
      paymentMethod: "",
    },
  })

  const [recentEntries, setRecentEntries] = useState([
    {
      id: 1,
      type: "location",
      title: "India Gate",
      timestamp: "2 hours ago",
      status: "synced",
    },
    {
      id: 2,
      type: "photo",
      title: "Street food vendor",
      timestamp: "3 hours ago",
      status: "pending",
    },
    {
      id: 3,
      type: "note",
      title: "Traffic observations",
      timestamp: "5 hours ago",
      status: "synced",
    },
  ])

  const handleInputChange = (tab: string, field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [tab]: {
        ...prev[tab as keyof typeof prev],
        [field]: value,
      },
    }))
  }

  const handleSave = (type: string) => {
    // Simulate saving data
    const newEntry = {
      id: Date.now(),
      type,
      title:
        formData[type as keyof typeof formData].title || formData[type as keyof typeof formData].name || "New Entry",
      timestamp: "Just now",
      status: "pending",
    }
    setRecentEntries((prev) => [newEntry, ...prev])

    // Reset form
    setFormData((prev) => ({
      ...prev,
      [type]: Object.keys(prev[type as keyof typeof prev]).reduce((acc, key) => {
        acc[key] = ""
        return acc
      }, {} as any),
    }))
  }

  const getCurrentLocation = () => {
    // Simulate getting current location
    setFormData((prev) => ({
      ...prev,
      location: {
        ...prev.location,
        coordinates: "28.6139° N, 77.2090° E",
        name: "Current Location",
      },
    }))
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "location":
        return <MapPin className="w-4 h-4" />
      case "photo":
        return <Camera className="w-4 h-4" />
      case "note":
        return <FileText className="w-4 h-4" />
      case "expense":
        return <Plus className="w-4 h-4" />
      default:
        return <Plus className="w-4 h-4" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "synced":
        return "bg-green-100 text-green-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "error":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
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
            <div className="flex-1">
              <h1 className="text-xl font-bold">Data Collection</h1>
              <p className="text-sm opacity-90">Contribute to NATPAC research</p>
            </div>
            <Badge variant="secondary" className="bg-primary-foreground/20 text-primary-foreground">
              {recentEntries.filter((e) => e.status === "pending").length} pending
            </Badge>
          </div>
        </header>

        <main className="p-4 space-y-4">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="location" className="text-xs">
                Location
              </TabsTrigger>
              <TabsTrigger value="photo" className="text-xs">
                Photo
              </TabsTrigger>
              <TabsTrigger value="note" className="text-xs">
                Note
              </TabsTrigger>
              <TabsTrigger value="expense" className="text-xs">
                Expense
              </TabsTrigger>
            </TabsList>

            <TabsContent value="location" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-primary" />
                    Location Data
                  </CardTitle>
                  <CardDescription>Record interesting places and landmarks</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="locationName">Location Name</Label>
                    <Input
                      id="locationName"
                      value={formData.location.name}
                      onChange={(e) => handleInputChange("location", "name", e.target.value)}
                      placeholder="Enter location name"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="coordinates">Coordinates</Label>
                    <div className="flex gap-2">
                      <Input
                        id="coordinates"
                        value={formData.location.coordinates}
                        onChange={(e) => handleInputChange("location", "coordinates", e.target.value)}
                        placeholder="Lat, Long"
                        className="flex-1"
                      />
                      <Button onClick={getCurrentLocation} variant="outline" size="sm">
                        <Navigation className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="locationCategory">Category</Label>
                    <Select onValueChange={(value) => handleInputChange("location", "category", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="transport">Transport Hub</SelectItem>
                        <SelectItem value="landmark">Landmark</SelectItem>
                        <SelectItem value="commercial">Commercial Area</SelectItem>
                        <SelectItem value="residential">Residential</SelectItem>
                        <SelectItem value="recreational">Recreational</SelectItem>
                        <SelectItem value="government">Government</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="crowdLevel">Crowd Level</Label>
                    <Select onValueChange={(value) => handleInputChange("location", "crowdLevel", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select crowd level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="empty">Empty</SelectItem>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="moderate">Moderate</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="very-high">Very High</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="accessibility">Accessibility</Label>
                    <Select onValueChange={(value) => handleInputChange("location", "accessibility", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Accessibility level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="excellent">Excellent</SelectItem>
                        <SelectItem value="good">Good</SelectItem>
                        <SelectItem value="fair">Fair</SelectItem>
                        <SelectItem value="poor">Poor</SelectItem>
                        <SelectItem value="inaccessible">Inaccessible</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="locationDescription">Description</Label>
                    <Textarea
                      id="locationDescription"
                      value={formData.location.description}
                      onChange={(e) => handleInputChange("location", "description", e.target.value)}
                      placeholder="Describe the location, facilities, observations..."
                      rows={3}
                    />
                  </div>

                  <Button onClick={() => handleSave("location")} className="w-full">
                    <Save className="w-4 h-4 mr-2" />
                    Save Location Data
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="photo" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Camera className="w-5 h-5 text-primary" />
                    Photo Collection
                  </CardTitle>
                  <CardDescription>Capture visual data for research</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="aspect-video bg-muted/50 rounded-lg flex items-center justify-center border-2 border-dashed border-muted-foreground/25">
                    <div className="text-center">
                      <ImageIcon className="w-12 h-12 mx-auto text-muted-foreground mb-2" />
                      <p className="text-sm text-muted-foreground mb-2">Take a photo</p>
                      <Button variant="outline" size="sm">
                        <Camera className="w-4 h-4 mr-2" />
                        Open Camera
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="photoCaption">Caption</Label>
                    <Input
                      id="photoCaption"
                      value={formData.photo.caption}
                      onChange={(e) => handleInputChange("photo", "caption", e.target.value)}
                      placeholder="Describe what's in the photo"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="photoCategory">Category</Label>
                    <Select onValueChange={(value) => handleInputChange("photo", "category", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="traffic">Traffic Conditions</SelectItem>
                        <SelectItem value="infrastructure">Infrastructure</SelectItem>
                        <SelectItem value="transport">Transportation</SelectItem>
                        <SelectItem value="signage">Signs & Signage</SelectItem>
                        <SelectItem value="crowd">Crowd Density</SelectItem>
                        <SelectItem value="safety">Safety Issues</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="photoLocation">Location</Label>
                    <Input
                      id="photoLocation"
                      value={formData.photo.location}
                      onChange={(e) => handleInputChange("photo", "location", e.target.value)}
                      placeholder="Where was this taken?"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="photoTags">Tags</Label>
                    <Input
                      id="photoTags"
                      value={formData.photo.tags}
                      onChange={(e) => handleInputChange("photo", "tags", e.target.value)}
                      placeholder="Add tags separated by commas"
                    />
                  </div>

                  <Button onClick={() => handleSave("photo")} className="w-full">
                    <Save className="w-4 h-4 mr-2" />
                    Save Photo Data
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="note" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-primary" />
                    Field Notes
                  </CardTitle>
                  <CardDescription>Record observations and insights</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="noteTitle">Title</Label>
                    <Input
                      id="noteTitle"
                      value={formData.note.title}
                      onChange={(e) => handleInputChange("note", "title", e.target.value)}
                      placeholder="Note title"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="noteCategory">Category</Label>
                    <Select onValueChange={(value) => handleInputChange("note", "category", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="traffic">Traffic Patterns</SelectItem>
                        <SelectItem value="behavior">User Behavior</SelectItem>
                        <SelectItem value="infrastructure">Infrastructure</SelectItem>
                        <SelectItem value="safety">Safety Concerns</SelectItem>
                        <SelectItem value="accessibility">Accessibility</SelectItem>
                        <SelectItem value="environment">Environment</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="mood">Mood/Sentiment</Label>
                    <Select onValueChange={(value) => handleInputChange("note", "mood", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="How did this make you feel?" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="positive">Positive</SelectItem>
                        <SelectItem value="neutral">Neutral</SelectItem>
                        <SelectItem value="negative">Negative</SelectItem>
                        <SelectItem value="frustrated">Frustrated</SelectItem>
                        <SelectItem value="satisfied">Satisfied</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="noteContent">Content</Label>
                    <Textarea
                      id="noteContent"
                      value={formData.note.content}
                      onChange={(e) => handleInputChange("note", "content", e.target.value)}
                      placeholder="Write your observations, thoughts, or insights..."
                      rows={4}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="noteTags">Tags</Label>
                    <Input
                      id="noteTags"
                      value={formData.note.tags}
                      onChange={(e) => handleInputChange("note", "tags", e.target.value)}
                      placeholder="Add tags separated by commas"
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button onClick={() => handleSave("note")} className="flex-1">
                      <Save className="w-4 h-4 mr-2" />
                      Save Note
                    </Button>
                    <Button variant="outline" size="sm">
                      <Mic className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="expense" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Plus className="w-5 h-5 text-primary" />
                    Expense Tracking
                  </CardTitle>
                  <CardDescription>Track travel-related expenses</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="expenseAmount">Amount (₹)</Label>
                    <Input
                      id="expenseAmount"
                      type="number"
                      value={formData.expense.amount}
                      onChange={(e) => handleInputChange("expense", "amount", e.target.value)}
                      placeholder="0.00"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="expenseCategory">Category</Label>
                    <Select onValueChange={(value) => handleInputChange("expense", "category", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="fuel">Fuel</SelectItem>
                        <SelectItem value="public-transport">Public Transport</SelectItem>
                        <SelectItem value="parking">Parking</SelectItem>
                        <SelectItem value="tolls">Tolls</SelectItem>
                        <SelectItem value="food">Food & Drinks</SelectItem>
                        <SelectItem value="accommodation">Accommodation</SelectItem>
                        <SelectItem value="maintenance">Vehicle Maintenance</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="paymentMethod">Payment Method</Label>
                    <Select onValueChange={(value) => handleInputChange("expense", "paymentMethod", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="How did you pay?" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cash">Cash</SelectItem>
                        <SelectItem value="card">Debit/Credit Card</SelectItem>
                        <SelectItem value="upi">UPI</SelectItem>
                        <SelectItem value="wallet">Digital Wallet</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="expenseDescription">Description</Label>
                    <Textarea
                      id="expenseDescription"
                      value={formData.expense.description}
                      onChange={(e) => handleInputChange("expense", "description", e.target.value)}
                      placeholder="Additional details about this expense..."
                      rows={2}
                    />
                  </div>

                  <Button onClick={() => handleSave("expense")} className="w-full">
                    <Save className="w-4 h-4 mr-2" />
                    Save Expense
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Recent Entries */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Recent Entries</CardTitle>
              <CardDescription>Your latest data contributions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {recentEntries.map((entry) => (
                <div key={entry.id} className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    {getTypeIcon(entry.type)}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-sm">{entry.title}</p>
                    <p className="text-xs text-muted-foreground">{entry.timestamp}</p>
                  </div>
                  <Badge className={`text-xs ${getStatusColor(entry.status)}`} variant="outline">
                    {entry.status}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Data Privacy Notice */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Data Privacy</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>• All data is anonymized before sharing with NATPAC</p>
                <p>• Personal identifiers are automatically removed</p>
                <p>• You can review and delete your data anytime</p>
                <p>• Data is used solely for transportation research</p>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  )
}
