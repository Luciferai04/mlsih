"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { MapPin, Shield, Award, BarChart3 } from "lucide-react"

interface WelcomeScreenProps {
  onAuthComplete: () => void
}

export default function WelcomeScreen({ onAuthComplete }: WelcomeScreenProps) {
  const [step, setStep] = useState<"welcome" | "signup" | "login" | "verify">("welcome")
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    fullName: "",
    phone: "",
    state: "",
    city: "",
    nationality: "",
    gdprConsent: false,
    dataSharing: false,
  })
  const [otp, setOtp] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSignup = async () => {
    setIsLoading(true)
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false)
      setStep("verify")
    }, 1500)
  }

  const handleLogin = async () => {
    setIsLoading(true)
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false)
      setStep("verify")
    }, 1500)
  }

  const handleVerifyOTP = async () => {
    setIsLoading(true)
    // Simulate OTP verification
    setTimeout(() => {
      setIsLoading(false)
      onAuthComplete()
    }, 1500)
  }

  if (step === "welcome") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center p-4">
        <div className="max-w-md w-full space-y-6">
          {/* Logo and Title */}
          <div className="text-center space-y-4">
            <div className="w-20 h-20 mx-auto bg-primary rounded-full flex items-center justify-center">
              <MapPin className="w-10 h-10 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Travel Companion</h1>
              <p className="text-muted-foreground">NATPAC Official App</p>
            </div>
          </div>

          {/* Features */}
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-card">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <MapPin className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="font-medium">Smart Trip Tracking</p>
                <p className="text-sm text-muted-foreground">Auto-detect your journeys</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-card">
              <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-accent" />
              </div>
              <div>
                <p className="font-medium">Personal Analytics</p>
                <p className="text-sm text-muted-foreground">Insights into your travel patterns</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-card">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Award className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="font-medium">Rewards & Badges</p>
                <p className="text-sm text-muted-foreground">Earn achievements for traveling</p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <Button onClick={() => setStep("signup")} className="w-full" size="lg">
              Get Started
            </Button>
            <Button onClick={() => setStep("login")} variant="outline" className="w-full" size="lg">
              I already have an account
            </Button>
          </div>

          {/* Government Notice */}
          <div className="text-center p-4 bg-muted/50 rounded-lg">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Shield className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium">Government Initiative</span>
            </div>
            <p className="text-xs text-muted-foreground">
              This app is part of NATPAC's official data collection initiative to improve transportation infrastructure.
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (step === "signup") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Create Account</CardTitle>
            <CardDescription>Join the Travel Companion community</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name *</Label>
              <Input
                id="fullName"
                value={formData.fullName}
                onChange={(e) => handleInputChange("fullName", e.target.value)}
                placeholder="Enter your full name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                placeholder="Enter your email"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number *</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => handleInputChange("phone", e.target.value)}
                placeholder="Enter your phone number"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="state">State *</Label>
                <Select onValueChange={(value) => handleInputChange("state", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select state" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="delhi">Delhi</SelectItem>
                    <SelectItem value="mumbai">Mumbai</SelectItem>
                    <SelectItem value="bangalore">Bangalore</SelectItem>
                    <SelectItem value="chennai">Chennai</SelectItem>
                    <SelectItem value="kolkata">Kolkata</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="city">City *</Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => handleInputChange("city", e.target.value)}
                  placeholder="Enter city"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="nationality">Nationality *</Label>
              <Select onValueChange={(value) => handleInputChange("nationality", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select nationality" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="indian">Indian</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password *</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => handleInputChange("password", e.target.value)}
                placeholder="Create a password"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password *</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                placeholder="Confirm your password"
              />
            </div>

            {/* GDPR Consent */}
            <div className="space-y-3 pt-4 border-t">
              <div className="flex items-start space-x-2">
                <Checkbox
                  id="gdprConsent"
                  checked={formData.gdprConsent}
                  onCheckedChange={(checked) => handleInputChange("gdprConsent", checked as boolean)}
                />
                <div className="grid gap-1.5 leading-none">
                  <Label htmlFor="gdprConsent" className="text-sm">
                    I agree to the Terms of Service and Privacy Policy *
                  </Label>
                  <p className="text-xs text-muted-foreground">Required for account creation and app functionality.</p>
                </div>
              </div>

              <div className="flex items-start space-x-2">
                <Checkbox
                  id="dataSharing"
                  checked={formData.dataSharing}
                  onCheckedChange={(checked) => handleInputChange("dataSharing", checked as boolean)}
                />
                <div className="grid gap-1.5 leading-none">
                  <Label htmlFor="dataSharing" className="text-sm">
                    Share anonymized data with NATPAC for research
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Help improve transportation infrastructure (optional).
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-3 pt-4">
              <Button onClick={handleSignup} className="w-full" disabled={!formData.gdprConsent || isLoading}>
                {isLoading ? "Creating Account..." : "Create Account"}
              </Button>
              <Button onClick={() => setStep("welcome")} variant="outline" className="w-full">
                Back
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (step === "login") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Welcome Back</CardTitle>
            <CardDescription>Sign in to your account</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="loginEmail">Email</Label>
              <Input
                id="loginEmail"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                placeholder="Enter your email"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="loginPassword">Password</Label>
              <Input
                id="loginPassword"
                type="password"
                value={formData.password}
                onChange={(e) => handleInputChange("password", e.target.value)}
                placeholder="Enter your password"
              />
            </div>

            <div className="space-y-3 pt-4">
              <Button onClick={handleLogin} className="w-full" disabled={isLoading}>
                {isLoading ? "Signing In..." : "Sign In"}
              </Button>
              <Button onClick={() => setStep("welcome")} variant="outline" className="w-full">
                Back
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (step === "verify") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Verify Your Phone</CardTitle>
            <CardDescription>We've sent a verification code to {formData.phone}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="otp">Verification Code</Label>
              <Input
                id="otp"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="Enter 6-digit code"
                maxLength={6}
                className="text-center text-lg tracking-widest"
              />
            </div>

            <div className="space-y-3 pt-4">
              <Button onClick={handleVerifyOTP} className="w-full" disabled={otp.length !== 6 || isLoading}>
                {isLoading ? "Verifying..." : "Verify & Continue"}
              </Button>
              <Button variant="outline" className="w-full bg-transparent">
                Resend Code
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return null
}
