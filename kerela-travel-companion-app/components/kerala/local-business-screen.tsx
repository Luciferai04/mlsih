"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  ArrowLeft,
  Store,
  MapPin,
  Phone,
  Clock,
  Star,
  Search,
  Utensils,
  Bed,
  ShoppingBag,
  Car,
  Camera,
  Heart,
  Navigation,
  Users,
} from "lucide-react"

interface LocalBusinessScreenProps {
  onBack: () => void
}

interface Business {
  id: string
  name: string
  category: string
  rating: number
  reviews: number
  distance: string
  address: string
  phone: string
  hours: string
  description: string
  specialties: string[]
  priceRange: string
  verified: boolean
  image: string
}

export default function LocalBusinessScreen({ onBack }: LocalBusinessScreenProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [currentLocation] = useState("Kochi")

  const categories = [
    { id: "all", name: "All", icon: Store, count: 45 },
    { id: "restaurants", name: "Restaurants", icon: Utensils, count: 12 },
    { id: "hotels", name: "Hotels", icon: Bed, count: 8 },
    { id: "shops", name: "Shops", icon: ShoppingBag, count: 15 },
    { id: "transport", name: "Transport", icon: Car, count: 6 },
    { id: "activities", name: "Activities", icon: Camera, count: 4 },
  ]

  const businesses: Business[] = [
    {
      id: "1",
      name: "Kashi Art Cafe",
      category: "restaurants",
      rating: 4.6,
      reviews: 324,
      distance: "0.8 km",
      address: "Burgher Street, Fort Kochi",
      phone: "+91 484 221 5769",
      hours: "8:00 AM - 11:00 PM",
      description: "Charming cafe in a heritage building serving continental and Kerala cuisine",
      specialties: ["Continental Food", "Art Gallery", "Heritage Building"],
      priceRange: "₹₹",
      verified: true,
      image: "/heritage-cafe-kerala.jpg",
    },
    {
      id: "2",
      name: "Spice Route Heritage Hotel",
      category: "hotels",
      rating: 4.8,
      reviews: 156,
      distance: "1.2 km",
      address: "Princess Street, Fort Kochi",
      phone: "+91 484 221 8129",
      hours: "24 hours",
      description: "Boutique heritage hotel with traditional Kerala architecture",
      specialties: ["Heritage Property", "Traditional Architecture", "Ayurvedic Spa"],
      priceRange: "₹₹₹",
      verified: true,
      image: "/kerala-heritage-hotel.jpg",
    },
    {
      id: "3",
      name: "Kerala Handicrafts Emporium",
      category: "shops",
      rating: 4.3,
      reviews: 89,
      distance: "0.5 km",
      address: "MG Road, Ernakulam",
      phone: "+91 484 235 7890",
      hours: "10:00 AM - 8:00 PM",
      description: "Authentic Kerala handicrafts, spices, and souvenirs",
      specialties: ["Handicrafts", "Spices", "Souvenirs", "Coir Products"],
      priceRange: "₹",
      verified: true,
      image: "/kerala-handicrafts-shop.jpg",
    },
    {
      id: "4",
      name: "Backwater Boat Services",
      category: "transport",
      rating: 4.7,
      reviews: 203,
      distance: "2.1 km",
      address: "Kumrakom Jetty",
      phone: "+91 481 252 4567",
      hours: "6:00 AM - 6:00 PM",
      description: "Traditional houseboat and canoe rentals for backwater exploration",
      specialties: ["Houseboat Rental", "Canoe Tours", "Sunset Cruises"],
      priceRange: "₹₹",
      verified: true,
      image: "/kerala-backwater-boat.jpg",
    },
    {
      id: "5",
      name: "Thekkady Spice Garden Tours",
      category: "activities",
      rating: 4.5,
      reviews: 127,
      distance: "3.2 km",
      address: "Thekkady, Idukki",
      phone: "+91 486 922 3456",
      hours: "9:00 AM - 5:00 PM",
      description: "Guided tours through organic spice plantations with tasting sessions",
      specialties: ["Spice Tours", "Organic Farming", "Cooking Classes"],
      priceRange: "₹₹",
      verified: true,
      image: "/kerala-spice-garden.jpg",
    },
    {
      id: "6",
      name: "Malabar Junction Restaurant",
      category: "restaurants",
      rating: 4.4,
      reviews: 298,
      distance: "1.5 km",
      address: "MG Road, Kochi",
      phone: "+91 484 266 8888",
      hours: "12:00 PM - 11:00 PM",
      description: "Fine dining restaurant specializing in traditional Kerala cuisine",
      specialties: ["Kerala Cuisine", "Seafood", "Traditional Recipes"],
      priceRange: "₹₹₹",
      verified: true,
      image: "/kerala-traditional-restaurant.jpg",
    },
  ]

  const filteredBusinesses = businesses.filter((business) => {
    const matchesSearch =
      business.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      business.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      business.specialties.some((specialty) => specialty.toLowerCase().includes(searchQuery.toLowerCase()))

    const matchesCategory = selectedCategory === "all" || business.category === selectedCategory

    return matchesSearch && matchesCategory
  })

  const featuredBusinesses = businesses.filter((b) => b.rating >= 4.5).slice(0, 3)

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-3 h-3 ${i < Math.floor(rating) ? "text-yellow-400 fill-current" : "text-gray-300"}`}
      />
    ))
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
              <h1 className="text-lg font-bold">Local Business Connect</h1>
              <p className="text-sm opacity-90">Discover authentic Kerala businesses</p>
            </div>
          </div>
        </header>

        <main className="p-4 space-y-4">
          <Tabs defaultValue="discover" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="discover">Discover</TabsTrigger>
              <TabsTrigger value="featured">Featured</TabsTrigger>
              <TabsTrigger value="nearby">Nearby</TabsTrigger>
            </TabsList>

            <TabsContent value="discover" className="space-y-4">
              {/* Search and Filter */}
              <Card>
                <CardContent className="p-4 space-y-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input
                      placeholder="Search businesses, food, activities..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>

                  <div className="flex gap-2 overflow-x-auto pb-2">
                    {categories.map((category) => (
                      <Button
                        key={category.id}
                        variant={selectedCategory === category.id ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSelectedCategory(category.id)}
                        className="flex items-center gap-2 whitespace-nowrap"
                      >
                        <category.icon className="w-4 h-4" />
                        {category.name}
                        <Badge variant="secondary" className="ml-1 text-xs">
                          {category.count}
                        </Badge>
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Business Listings */}
              <div className="space-y-3">
                {filteredBusinesses.map((business) => (
                  <Card key={business.id} className="overflow-hidden">
                    <div className="flex">
                      <div className="w-24 h-24 bg-muted flex-shrink-0">
                        <img
                          src={business.image || "/placeholder.svg"}
                          alt={business.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 p-3">
                        <div className="flex items-start justify-between mb-1">
                          <div>
                            <h3 className="font-medium text-sm flex items-center gap-2">
                              {business.name}
                              {business.verified && (
                                <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100 text-xs">
                                  Verified
                                </Badge>
                              )}
                            </h3>
                            <div className="flex items-center gap-1 mb-1">
                              {renderStars(business.rating)}
                              <span className="text-xs text-muted-foreground ml-1">
                                {business.rating} ({business.reviews})
                              </span>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-muted-foreground">{business.distance}</p>
                            <p className="text-xs font-medium">{business.priceRange}</p>
                          </div>
                        </div>

                        <p className="text-xs text-muted-foreground mb-2 line-clamp-2">{business.description}</p>

                        <div className="flex flex-wrap gap-1 mb-2">
                          {business.specialties.slice(0, 2).map((specialty) => (
                            <Badge key={specialty} variant="outline" className="text-xs">
                              {specialty}
                            </Badge>
                          ))}
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3 text-xs text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              <span className="truncate max-w-20">{business.address.split(",")[0]}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              <span>Open</span>
                            </div>
                          </div>
                          <div className="flex gap-1">
                            <Button size="sm" variant="outline" className="h-6 px-2 text-xs bg-transparent">
                              <Phone className="w-3 h-3" />
                            </Button>
                            <Button size="sm" variant="outline" className="h-6 px-2 text-xs bg-transparent">
                              <Navigation className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="featured" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Star className="w-5 h-5 text-yellow-500" />
                    Featured Local Businesses
                  </CardTitle>
                  <CardDescription>Highly rated and recommended by travelers</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {featuredBusinesses.map((business) => (
                    <div
                      key={business.id}
                      className="p-4 rounded-lg border bg-gradient-to-r from-primary/5 to-accent/5"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="font-medium text-sm flex items-center gap-2">
                            {business.name}
                            <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100 text-xs">
                              Featured
                            </Badge>
                          </h3>
                          <div className="flex items-center gap-1 mb-1">
                            {renderStars(business.rating)}
                            <span className="text-xs text-muted-foreground ml-1">
                              {business.rating} ({business.reviews} reviews)
                            </span>
                          </div>
                        </div>
                        <Button size="sm" variant="outline">
                          <Heart className="w-3 h-3 mr-1" />
                          Save
                        </Button>
                      </div>

                      <p className="text-xs text-muted-foreground mb-2">{business.description}</p>

                      <div className="flex flex-wrap gap-1 mb-3">
                        {business.specialties.map((specialty) => (
                          <Badge key={specialty} variant="outline" className="text-xs">
                            {specialty}
                          </Badge>
                        ))}
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            <span>{business.distance}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            <span>{business.hours.split(" - ")[0]}</span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" className="h-7 px-3 text-xs">
                            <Phone className="w-3 h-3 mr-1" />
                            Call
                          </Button>
                          <Button size="sm" variant="outline" className="h-7 px-3 text-xs bg-transparent">
                            <Navigation className="w-3 h-3 mr-1" />
                            Directions
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Support Local Initiative */}
              <Card className="border-green-200 dark:border-green-800">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-green-600">
                    <Users className="w-5 h-5" />
                    Support Local Kerala
                  </CardTitle>
                  <CardDescription>Help local communities thrive through responsible tourism</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="p-3 rounded-lg bg-green-50 dark:bg-green-950/20">
                    <h3 className="font-medium text-sm text-green-800 dark:text-green-200 mb-1">
                      Why Choose Local Businesses?
                    </h3>
                    <ul className="text-xs text-green-600 dark:text-green-300 space-y-0.5">
                      <li>• Support local families and communities</li>
                      <li>• Experience authentic Kerala culture</li>
                      <li>• Get personalized recommendations</li>
                      <li>• Contribute to sustainable tourism</li>
                    </ul>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="text-center p-3 bg-primary/10 rounded-lg">
                      <div className="text-lg font-bold text-primary">150+</div>
                      <div className="text-xs text-muted-foreground">Local Partners</div>
                    </div>
                    <div className="text-center p-3 bg-accent/10 rounded-lg">
                      <div className="text-lg font-bold text-accent">₹2.5L</div>
                      <div className="text-xs text-muted-foreground">Community Impact</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="nearby" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-primary" />
                    Nearby in {currentLocation}
                  </CardTitle>
                  <CardDescription>Businesses within 2km of your current location</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {businesses
                      .filter((b) => Number.parseFloat(b.distance) <= 2)
                      .sort((a, b) => Number.parseFloat(a.distance) - Number.parseFloat(b.distance))
                      .map((business) => (
                        <div key={business.id} className="flex items-center justify-between p-3 rounded-lg border">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center">
                              {categories.find((c) => c.id === business.category)?.icon && (
                                <div className="w-5 h-5 text-primary">
                                  {categories.find((c) => c.id === business.category)!.icon}
                                </div>
                              )}
                            </div>
                            <div>
                              <p className="font-medium text-sm">{business.name}</p>
                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <span>{business.distance}</span>
                                <span>•</span>
                                <div className="flex items-center gap-1">
                                  <Star className="w-3 h-3 text-yellow-400 fill-current" />
                                  <span>{business.rating}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-1">
                            <Button size="sm" variant="outline" className="h-8 px-2 bg-transparent">
                              <Navigation className="w-3 h-3" />
                            </Button>
                            <Button size="sm" variant="outline" className="h-8 px-2 bg-transparent">
                              <Phone className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>

              {/* Quick Categories */}
              <Card>
                <CardHeader>
                  <CardTitle>Quick Find</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-3">
                    <Button
                      variant="outline"
                      className="h-auto p-3 flex-col gap-1 bg-transparent"
                      onClick={() => setSelectedCategory("restaurants")}
                    >
                      <Utensils className="w-5 h-5 text-green-600" />
                      <span className="text-xs">Restaurants</span>
                    </Button>
                    <Button
                      variant="outline"
                      className="h-auto p-3 flex-col gap-1 bg-transparent"
                      onClick={() => setSelectedCategory("shops")}
                    >
                      <ShoppingBag className="w-5 h-5 text-purple-600" />
                      <span className="text-xs">Shopping</span>
                    </Button>
                    <Button
                      variant="outline"
                      className="h-auto p-3 flex-col gap-1 bg-transparent"
                      onClick={() => setSelectedCategory("activities")}
                    >
                      <Camera className="w-5 h-5 text-orange-600" />
                      <span className="text-xs">Activities</span>
                    </Button>
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
