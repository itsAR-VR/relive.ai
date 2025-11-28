"use client"

import { useEffect } from "react"
import { createClient } from "@/lib/supabase/client"

export function HashAuthListener() {
  useEffect(() => {
    const supabase = createClient()

    const run = async () => {
      if (typeof window === "undefined") return
      const hash = window.location.hash
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

      // Attempt to claim order if session_id present in URL
      const currentUrl = new URL(window.location.href)
      const sessionId =
        currentUrl.searchParams.get("session_id") ||
        currentUrl.searchParams.get("checkout_session_id") ||
        ""

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

      // Clean hash to avoid reprocessing
      currentUrl.hash = ""
      window.location.replace(currentUrl.toString())
    }

    run()
  }, [])

  return null
}
