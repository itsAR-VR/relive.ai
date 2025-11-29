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
          let storedSessionId: string | null = null
          try {
            storedSessionId = localStorage.getItem("giftingmoments_session_id")
          } catch {
            // ignore
          }
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

      // Set session and VERIFY it was stored before redirecting
      try {
        const { error: setError } = await supabase.auth.setSession({ access_token, refresh_token })
        if (setError) {
          console.error("HashAuthListener: setSession error", setError)
          return
        }

        // CRITICAL: Wait for session to be persisted and verify it worked
        // This prevents the race condition where redirect happens before storage write
        let verified = false
        for (let i = 0; i < 5; i++) {
          const { data: { session } } = await supabase.auth.getSession()
          if (session?.access_token) {
            verified = true
            break
          }
          // Small delay before retry
          await new Promise(resolve => setTimeout(resolve, 100))
        }

        if (!verified) {
          console.error("HashAuthListener: session verification failed after retries")
          return
        }
      } catch (err) {
        console.error("HashAuthListener: failed to set session from hash", err)
        return
      }

      // Recover session ID - try multiple sources in priority order
      let sessionId =
        url.searchParams.get("session_id") ||
        url.searchParams.get("checkout_session_id")

      // Try localStorage as fallback
      if (!sessionId) {
        try {
          const stored = localStorage.getItem("giftingmoments_session_id")
          if (stored) sessionId = stored
        } catch {
          // ignore
        }
      }

      // CRITICAL: If still no session_id, lookup by email from pending_checkouts
      // This enables cross-device auth where user verifies on a different device
      if (!sessionId) {
        try {
          const { data: { user } } = await supabase.auth.getUser()
          if (user?.email) {
            const lookupRes = await fetch(`/api/checkout/pending?email=${encodeURIComponent(user.email)}`)
            if (lookupRes.ok) {
              const lookupData = await lookupRes.json()
              if (lookupData.session_id) {
                sessionId = lookupData.session_id
                console.log("HashAuthListener: recovered session_id from pending_checkouts", sessionId)
              }
            }
          }
        } catch (err) {
          console.error("HashAuthListener: email lookup failed", err)
        }
      }

      // Claim order (don't block redirect on this)
      if (sessionId) {
        fetch("/api/orders/claim", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ session_id: sessionId }),
        }).catch(err => console.error("HashAuthListener: order claim failed", err))
      }

      // Redirect to director interview with auth_complete flag
      const targetUrl = new URL("/director-interview", window.location.origin)
      if (sessionId) targetUrl.searchParams.set("session_id", sessionId)
      targetUrl.searchParams.set("auth_complete", "true")
      
      window.location.replace(targetUrl.toString())
    }

    run()
  }, [])

  return null
}
