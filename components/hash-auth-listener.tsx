"use client"

import { useEffect } from "react"
import { createClient } from "@/lib/supabase/client"

export function HashAuthListener() {
  useEffect(() => {
    const supabase = createClient()

    const run = async () => {
      if (typeof window === "undefined") return
      const url = new URL(window.location.href)
      
      // Skip if we are on the dedicated confirm page to avoid race conditions
      if (url.pathname.startsWith("/auth/confirm")) return

      const hash = url.hash
      
      // Handle Errors (e.g., otp_expired)
      if (hash && hash.includes("error=")) {
        const params = new URLSearchParams(hash.replace(/^#/, ""))
        const error = params.get("error")
        const error_description = params.get("error_description")
        
        if (error) {
          // Redirect to interview with error
          const nextUrl = new URL("/director-interview", window.location.origin)
          // Recover session ID if possible
          const storedSessionId = localStorage.getItem("giftingmoments_session_id")
          const urlSessionId = url.searchParams.get("session_id") || url.searchParams.get("checkout_session_id")
          
          if (urlSessionId) nextUrl.searchParams.set("session_id", urlSessionId)
          else if (storedSessionId) nextUrl.searchParams.set("session_id", storedSessionId)
          
          nextUrl.searchParams.set("auth_error", error_description || "Authentication failed")
          window.location.replace(nextUrl.toString())
          return
        }
      }

      // Handle Access Token
      if (!hash || !hash.includes("access_token")) return

      const params = new URLSearchParams(hash.replace(/^#/, ""))
      const access_token = params.get("access_token")
      const refresh_token = params.get("refresh_token")

      if (!access_token || !refresh_token) return

      try {
        await supabase.auth.setSession({ access_token, refresh_token })
      } catch (err) {
        console.error("HashAuthListener: failed to set session from hash", err)
        return
      }

      // Attempt to claim order
      // 1. Check URL params
      // 2. Check LocalStorage fallback
      let sessionId =
        url.searchParams.get("session_id") ||
        url.searchParams.get("checkout_session_id")

      if (!sessionId) {
        try {
          const stored = localStorage.getItem("giftingmoments_session_id")
          if (stored) sessionId = stored
        } catch {
          // ignore
        }
      }

      if (sessionId) {
        try {
          await fetch("/api/orders/claim", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ session_id: sessionId }),
          })
        } catch (err) {
          console.error("HashAuthListener: order claim failed", err)
        }
      }

      // Redirect to director interview (clean URL)
      const targetUrl = new URL("/director-interview", window.location.origin)
      if (sessionId) targetUrl.searchParams.set("session_id", sessionId)
      
      window.location.replace(targetUrl.toString())
    }

    run()
  }, [])

  return null
}
