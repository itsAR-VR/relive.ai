"use client"

import { useEffect, useMemo, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

export default function AuthConfirmPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const supabase = useMemo(() => createClient(), [])
  const [message, setMessage] = useState("Finalizing login...")
  const [error, setError] = useState<string>("")

  useEffect(() => {
    const finalize = async () => {
      try {
        // 1. Check if session already exists (handled by listener or persistence)
        const { data: { session } } = await supabase.auth.getSession()
        
        if (session) {
          setMessage("Session found. Redirecting...")
          const next = searchParams.get("next") || "/director-interview"
          router.replace(next)
          return
        }

        // 2. Fallback: Parse hash if no session yet
        const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ""))
        const access_token = hashParams.get("access_token")
        const refresh_token = hashParams.get("refresh_token")
        const next = searchParams.get("next") || "/director-interview"
        const sessionId = searchParams.get("session_id") || searchParams.get("checkout_session_id") || ""

        if (!access_token || !refresh_token) {
          setError("Missing access token. Please request a new magic link.")
          return
        }

        const { error: sessionError } = await supabase.auth.setSession({
          access_token,
          refresh_token,
        })

        if (sessionError) {
          setError(sessionError.message || "Failed to set session. Please request a new link.")
          return
        }

        if (sessionId) {
          try {
            await fetch("/api/orders/claim", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ session_id: sessionId }),
            })
          } catch {
            // non-fatal
          }
        }

        setMessage("Success! Redirecting...")
        router.replace(next)
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Failed to complete login"
        setError(msg)
      }
    }

    finalize()
  }, [router, searchParams, supabase])

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="bg-card rounded-xl border border-border shadow-lg px-6 py-8 max-w-md w-full text-center space-y-3">
        {error ? (
          <>
            <p className="text-lg font-semibold text-red-600">Login failed</p>
            <p className="text-sm text-muted-foreground">{error}</p>
          </>
        ) : (
          <>
            <Loader2 className="w-6 h-6 animate-spin text-primary mx-auto" />
            <p className="text-sm text-muted-foreground">{message}</p>
          </>
        )}
      </div>
    </div>
  )
}
