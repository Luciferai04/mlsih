"use client"

import GPSAnalyticsScreen from "@/components/gps/gps-analytics-screen"
import { useRouter } from "next/navigation"

export default function GPSAnalyticsPage() {
  const router = useRouter()
  
  return (
    <GPSAnalyticsScreen onBack={() => router.back()} />
  )
}