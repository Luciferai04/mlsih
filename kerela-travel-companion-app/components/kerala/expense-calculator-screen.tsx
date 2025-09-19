"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  ArrowLeft,
  Calculator,
  PlusCircle,
  Trash2,
  IndianRupee,
  Car,
  Utensils,
  Bed,
  MapPin,
  Camera,
  ShoppingBag,
  Fuel,
  Bus,
} from "lucide-react"

interface ExpenseCalculatorScreenProps {
  onBack: () => void
}

interface Expense {
  id: string
  category: string
  description: string
  amount: number
  date: string
  location: string
}

export default function ExpenseCalculatorScreen({ onBack }: ExpenseCalculatorScreenProps) {
  const [expenses, setExpenses] = useState<Expense[]>([
    {
      id: "1",
      category: "transport",
      description: "Kochi to Munnar Bus",
      amount: 150,
      date: "2024-01-15",
      location: "Kochi",
    },
    {
      id: "2",
      category: "accommodation",
      description: "Hotel Stay - Munnar",
      amount: 2500,
      date: "2024-01-15",
      location: "Munnar",
    },
    {
      id: "3",
      category: "food",
      description: "Traditional Kerala Meal",
      amount: 300,
      date: "2024-01-15",
      location: "Munnar",
    },
    {
      id: "4",
      category: "activities",
      description: "Tea Garden Tour",
      amount: 500,
      date: "2024-01-16",
      location: "Munnar",
    },
  ])

  const [newExpense, setNewExpense] = useState({
    category: "",
    description: "",
    amount: "",
    location: "",
  })

  const [budget, setBudget] = useState({
    total: 10000,
    transport: 2000,
    accommodation: 4000,
    food: 2000,
    activities: 1500,
    shopping: 500,
  })

  const categories = [
    { id: "transport", name: "Transport", icon: Car, color: "text-blue-600" },
    { id: "accommodation", name: "Stay", icon: Bed, color: "text-purple-600" },
    { id: "food", name: "Food", icon: Utensils, color: "text-green-600" },
    { id: "activities", name: "Activities", icon: Camera, color: "text-orange-600" },
    { id: "shopping", name: "Shopping", icon: ShoppingBag, color: "text-pink-600" },
    { id: "fuel", name: "Fuel", icon: Fuel, color: "text-red-600" },
  ]

  const keralaExpenseGuide = {
    transport: {
      bus: { local: "₹10-30", intercity: "₹50-200" },
      taxi: { local: "₹15-25/km", airport: "₹300-800" },
      autorickshaw: { rate: "₹12-20/km", minimum: "₹25" },
      ferry: { backwater: "₹20-50", tourist: "₹500-2000" },
    },
    accommodation: {
      budget: "₹800-1500/night",
      midrange: "₹2000-5000/night",
      luxury: "₹8000-25000/night",
      homestay: "₹1200-3000/night",
    },
    food: {
      streetfood: "₹30-100/meal",
      restaurant: "₹200-500/meal",
      traditional: "₹150-300/meal",
      luxury: "₹800-2000/meal",
    },
  }

  const calculateCategoryTotal = (category: string) => {
    return expenses
      .filter((expense) => expense.category === category)
      .reduce((total, expense) => total + expense.amount, 0)
  }

  const totalExpenses = expenses.reduce((total, expense) => total + expense.amount, 0)

  const addExpense = () => {
    if (newExpense.category && newExpense.description && newExpense.amount) {
      const expense: Expense = {
        id: Date.now().toString(),
        category: newExpense.category,
        description: newExpense.description,
        amount: Number.parseFloat(newExpense.amount),
        date: new Date().toISOString().split("T")[0],
        location: newExpense.location || "Kerala",
      }
      setExpenses([...expenses, expense])
      setNewExpense({ category: "", description: "", amount: "", location: "" })
    }
  }

  const deleteExpense = (id: string) => {
    setExpenses(expenses.filter((expense) => expense.id !== id))
  }

  const getCategoryIcon = (category: string) => {
    const cat = categories.find((c) => c.id === category)
    return cat ? <cat.icon className={`w-4 h-4 ${cat.color}`} /> : <IndianRupee className="w-4 h-4" />
  }

  const getBudgetProgress = (category: string) => {
    const spent = calculateCategoryTotal(category)
    const budgetAmount = budget[category as keyof typeof budget] || 0
    return budgetAmount > 0 ? (spent / budgetAmount) * 100 : 0
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
              <h1 className="text-lg font-bold">Expense Calculator</h1>
              <p className="text-sm opacity-90">Track your Kerala travel expenses</p>
            </div>
          </div>
        </header>

        <main className="p-4 space-y-4">
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="add">Add Expense</TabsTrigger>
              <TabsTrigger value="guide">Price Guide</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              {/* Budget Summary */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calculator className="w-5 h-5 text-primary" />
                    Budget Summary
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 rounded-lg bg-primary/10">
                      <div>
                        <p className="text-sm text-muted-foreground">Total Budget</p>
                        <p className="text-2xl font-bold text-primary">₹{budget.total.toLocaleString()}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">Spent</p>
                        <p className="text-xl font-bold">₹{totalExpenses.toLocaleString()}</p>
                        <p className="text-xs text-muted-foreground">
                          Remaining: ₹{(budget.total - totalExpenses).toLocaleString()}
                        </p>
                      </div>
                    </div>

                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full transition-all duration-300"
                        style={{ width: `${Math.min((totalExpenses / budget.total) * 100, 100)}%` }}
                      ></div>
                    </div>

                    <div className="text-center">
                      <Badge
                        className={
                          totalExpenses > budget.total
                            ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100"
                            : "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"
                        }
                      >
                        {((totalExpenses / budget.total) * 100).toFixed(1)}% of budget used
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Category Breakdown */}
              <Card>
                <CardHeader>
                  <CardTitle>Category Breakdown</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {categories.map((category) => {
                    const spent = calculateCategoryTotal(category.id)
                    const budgetAmount = budget[category.id as keyof typeof budget] || 0
                    const progress = getBudgetProgress(category.id)

                    return (
                      <div key={category.id} className="p-3 rounded-lg border">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <category.icon className={`w-4 h-4 ${category.color}`} />
                            <span className="font-medium text-sm">{category.name}</span>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium">₹{spent.toLocaleString()}</p>
                            <p className="text-xs text-muted-foreground">of ₹{budgetAmount.toLocaleString()}</p>
                          </div>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                          <div
                            className={`h-1.5 rounded-full transition-all duration-300 ${
                              progress > 100 ? "bg-red-500" : progress > 80 ? "bg-yellow-500" : "bg-green-500"
                            }`}
                            style={{ width: `${Math.min(progress, 100)}%` }}
                          ></div>
                        </div>
                      </div>
                    )
                  })}
                </CardContent>
              </Card>

              {/* Recent Expenses */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Expenses</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {expenses
                    .slice(-5)
                    .reverse()
                    .map((expense) => (
                      <div key={expense.id} className="flex items-center justify-between p-3 rounded-lg border">
                        <div className="flex items-center gap-3">
                          {getCategoryIcon(expense.category)}
                          <div>
                            <p className="font-medium text-sm">{expense.description}</p>
                            <p className="text-xs text-muted-foreground">
                              <MapPin className="w-3 h-3 inline mr-1" />
                              {expense.location} • {expense.date}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm">₹{expense.amount.toLocaleString()}</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteExpense(expense.id)}
                            className="text-red-500 hover:text-red-700 p-1"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="add" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PlusCircle className="w-5 h-5 text-primary" />
                    Add New Expense
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Select
                      value={newExpense.category}
                      onValueChange={(value) => setNewExpense({ ...newExpense, category: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            <div className="flex items-center gap-2">
                              <category.icon className={`w-4 h-4 ${category.color}`} />
                              {category.name}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Input
                      id="description"
                      placeholder="e.g., Bus ticket to Munnar"
                      value={newExpense.description}
                      onChange={(e) => setNewExpense({ ...newExpense, description: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="amount">Amount (₹)</Label>
                    <Input
                      id="amount"
                      type="number"
                      placeholder="0"
                      value={newExpense.amount}
                      onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      placeholder="e.g., Kochi, Munnar"
                      value={newExpense.location}
                      onChange={(e) => setNewExpense({ ...newExpense, location: e.target.value })}
                    />
                  </div>

                  <Button onClick={addExpense} className="w-full">
                    <PlusCircle className="w-4 h-4 mr-2" />
                    Add Expense
                  </Button>
                </CardContent>
              </Card>

              {/* Quick Add Buttons */}
              <Card>
                <CardHeader>
                  <CardTitle>Quick Add Common Expenses</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-3">
                    <Button
                      variant="outline"
                      className="h-auto p-3 flex-col gap-1 bg-transparent"
                      onClick={() =>
                        setNewExpense({ ...newExpense, category: "transport", description: "Local Bus", amount: "25" })
                      }
                    >
                      <Bus className="w-4 h-4 text-blue-600" />
                      <span className="text-xs">Local Bus ₹25</span>
                    </Button>
                    <Button
                      variant="outline"
                      className="h-auto p-3 flex-col gap-1 bg-transparent"
                      onClick={() =>
                        setNewExpense({ ...newExpense, category: "food", description: "Kerala Meal", amount: "200" })
                      }
                    >
                      <Utensils className="w-4 h-4 text-green-600" />
                      <span className="text-xs">Meal ₹200</span>
                    </Button>
                    <Button
                      variant="outline"
                      className="h-auto p-3 flex-col gap-1 bg-transparent"
                      onClick={() =>
                        setNewExpense({
                          ...newExpense,
                          category: "transport",
                          description: "Auto Rickshaw",
                          amount: "50",
                        })
                      }
                    >
                      <Car className="w-4 h-4 text-blue-600" />
                      <span className="text-xs">Auto ₹50</span>
                    </Button>
                    <Button
                      variant="outline"
                      className="h-auto p-3 flex-col gap-1 bg-transparent"
                      onClick={() =>
                        setNewExpense({
                          ...newExpense,
                          category: "activities",
                          description: "Entry Ticket",
                          amount: "100",
                        })
                      }
                    >
                      <Camera className="w-4 h-4 text-orange-600" />
                      <span className="text-xs">Ticket ₹100</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="guide" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Kerala Price Guide</CardTitle>
                  <CardDescription>Typical costs for travel in Kerala</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Transport */}
                  <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800">
                    <h3 className="font-medium text-sm text-blue-800 dark:text-blue-200 mb-2 flex items-center gap-2">
                      <Car className="w-4 h-4" />
                      Transport
                    </h3>
                    <div className="space-y-1 text-xs text-blue-600 dark:text-blue-300">
                      <div className="flex justify-between">
                        <span>Local Bus:</span>
                        <span>{keralaExpenseGuide.transport.bus.local}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Intercity Bus:</span>
                        <span>{keralaExpenseGuide.transport.bus.intercity}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Taxi (per km):</span>
                        <span>{keralaExpenseGuide.transport.taxi.local}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Auto Rickshaw:</span>
                        <span>{keralaExpenseGuide.transport.autorickshaw.rate}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Backwater Ferry:</span>
                        <span>{keralaExpenseGuide.transport.ferry.backwater}</span>
                      </div>
                    </div>
                  </div>

                  {/* Accommodation */}
                  <div className="p-3 rounded-lg bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800">
                    <h3 className="font-medium text-sm text-purple-800 dark:text-purple-200 mb-2 flex items-center gap-2">
                      <Bed className="w-4 h-4" />
                      Accommodation (per night)
                    </h3>
                    <div className="space-y-1 text-xs text-purple-600 dark:text-purple-300">
                      <div className="flex justify-between">
                        <span>Budget Hotels:</span>
                        <span>{keralaExpenseGuide.accommodation.budget}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Mid-range Hotels:</span>
                        <span>{keralaExpenseGuide.accommodation.midrange}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Luxury Resorts:</span>
                        <span>{keralaExpenseGuide.accommodation.luxury}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Homestays:</span>
                        <span>{keralaExpenseGuide.accommodation.homestay}</span>
                      </div>
                    </div>
                  </div>

                  {/* Food */}
                  <div className="p-3 rounded-lg bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800">
                    <h3 className="font-medium text-sm text-green-800 dark:text-green-200 mb-2 flex items-center gap-2">
                      <Utensils className="w-4 h-4" />
                      Food (per meal)
                    </h3>
                    <div className="space-y-1 text-xs text-green-600 dark:text-green-300">
                      <div className="flex justify-between">
                        <span>Street Food:</span>
                        <span>{keralaExpenseGuide.food.streetfood}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Local Restaurant:</span>
                        <span>{keralaExpenseGuide.food.restaurant}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Traditional Meal:</span>
                        <span>{keralaExpenseGuide.food.traditional}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Fine Dining:</span>
                        <span>{keralaExpenseGuide.food.luxury}</span>
                      </div>
                    </div>
                  </div>

                  {/* Budget Tips */}
                  <div className="p-3 rounded-lg bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800">
                    <h3 className="font-medium text-sm text-yellow-800 dark:text-yellow-200 mb-2">Money-Saving Tips</h3>
                    <ul className="text-xs text-yellow-600 dark:text-yellow-300 space-y-1">
                      <li>• Use public buses for intercity travel</li>
                      <li>• Try local eateries for authentic food</li>
                      <li>• Book homestays for cultural experience</li>
                      <li>• Visit during off-season for better rates</li>
                      <li>• Negotiate prices for auto rickshaws</li>
                      <li>• Use KSRTC buses for reliable transport</li>
                    </ul>
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
