"use client"

import { useEffect, useRef } from "react"

interface ViewTrackerProps {
  orderId: string
  token: string
}

export function ViewTracker({ orderId, token }: ViewTrackerProps) {
  const hasTracked = useRef(false)

  useEffect(() => {
    // Only track once per page load
    if (hasTracked.current) return
    hasTracked.current = true

    async function recordView() {
      try {
        const response = await fetch(`/api/view/${orderId}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        })

        if (response.ok) {
          const data = await response.json()
          if (data.recorded) {
            console.log("First view recorded:", data.first_viewed_at)
          }
        }
      } catch (error) {
        // Silently fail - view tracking is non-critical
        console.error("Failed to record view:", error)
      }
    }

    recordView()
  }, [orderId, token])

  // This component doesn't render anything visible
  return null
}
