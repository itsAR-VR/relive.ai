"use client"

import { Suspense, useEffect, useMemo, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { useSearchParams } from "next/navigation"
import { ArrowLeft, Loader2 } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { ReviveUploadForm } from "@/components/revive-upload-form"

export const dynamic = "force-dynamic"

export default function ReviveUploadPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      }
    >
      <ReviveUploadContent />
    </Suspense>
  )
}

function ReviveUploadContent() {
  const [userEmail, setUserEmail] = useState<string>("")
  const [userReady, setUserReady] = useState<boolean>(false)
  const [sendingLink, setSendingLink] = useState<boolean>(false)
  const [linkSent, setLinkSent] = useState<boolean>(false)
  const [authMessage, setAuthMessage] = useState<string>("")
  const [authError, setAuthError] = useState<string>("")
  const [claiming, setClaiming] = useState<boolean>(false)
  const [claimError, setClaimError] = useState<string>("")
  const [checkingSession, setCheckingSession] = useState<boolean>(false)
  const [orderId, setOrderId] = useState<string>("")
  const [expectedPhotoCount, setExpectedPhotoCount] = useState<number | null>(null)

  const searchParams = useSearchParams()
  const supabase = useMemo(() => createClient(), [])

  const sessionId = searchParams.get("session_id") || searchParams.get("checkout_session_id") || ""
  const orderIdParam = searchParams.get("order_id") || searchParams.get("id") || ""

  useEffect(() => {
    const preloadEmail = async () => {
      if (!sessionId) return
      try {
        const res = await fetch(`/api/stripe/session?session_id=${encodeURIComponent(sessionId)}`)
        const data = await res.json()
        if (data?.email) {
          setUserEmail(data.email)
          await autoSendMagicLink(data.email)
        }
      } catch {
        // ignore
      }
    }

    preloadEmail()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId])

  const autoSendMagicLink = async (email: string) => {
    if (!email) return
    setSendingLink(true)
    setAuthError("")
    setAuthMessage("")

    try {
      if (sessionId) {
        localStorage.setItem("giftingmoments_session_id", sessionId)
      }
    } catch {
      // ignore
    }

    if (sessionId) {
      try {
        await fetch("/api/checkout/pending", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, session_id: sessionId }),
        })
      } catch {
        // non-fatal
      }
    }

    try {
      const next = sessionId
        ? `/revive-upload?session_id=${encodeURIComponent(sessionId)}`
        : `/revive-upload?order_id=${encodeURIComponent(orderIdParam)}`
      const redirectTo = `${window.location.origin}/auth/confirm?next=${encodeURIComponent(next)}`

      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: redirectTo,
          shouldCreateUser: true,
        },
      })
      if (error) throw error
      setLinkSent(true)
      setAuthMessage("We’ve sent a magic link to your email. Click it to continue.")
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to send magic link"
      setAuthError(message)
    } finally {
      setSendingLink(false)
    }
  }

  const claimOrder = async (emailOverride?: string) => {
    setClaiming(true)
    setClaimError("")

    const emailToUse = emailOverride || userEmail
    let effectiveSessionId = sessionId

    try {
      if (!effectiveSessionId && emailToUse) {
        try {
          const lookupRes = await fetch(`/api/checkout/pending?email=${encodeURIComponent(emailToUse)}`)
          if (lookupRes.ok) {
            const lookupData = await lookupRes.json()
            if (lookupData.session_id) {
              effectiveSessionId = lookupData.session_id
            }
          }
        } catch {
          // non-fatal
        }
      }

      const payload: Record<string, string> = {}
      if (orderIdParam) payload.order_id = orderIdParam
      else if (effectiveSessionId) payload.session_id = effectiveSessionId

      if (!payload.order_id && !payload.session_id) {
        setClaimError("Missing order reference. Please return from checkout or contact support.")
        setClaiming(false)
        return
      }

      const claimRes = await fetch("/api/orders/claim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (!claimRes.ok) {
        const data = await claimRes.json().catch(() => ({}))
        throw new Error(data?.error || "Could not find your order. Please try again.")
      }

      const claimData = await claimRes.json()
      const claimedOrder = claimData?.order
      if (!claimedOrder?.id) {
        throw new Error("Could not load your order. Please try again.")
      }

      const expected = claimedOrder?.quiz_data?.expected_photo_count
      const expectedNum = typeof expected === "number" ? expected : Number(expected)

      if (!Number.isFinite(expectedNum) || expectedNum < 1 || expectedNum > 20) {
        throw new Error("Missing expected photo count for this order. Please contact support.")
      }

      setOrderId(claimedOrder.id)
      setExpectedPhotoCount(expectedNum)

      if (emailToUse) {
        fetch(`/api/checkout/pending?email=${encodeURIComponent(emailToUse)}`, { method: "DELETE" }).catch(() => {})
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to load your order."
      setClaimError(message)
    } finally {
      setClaiming(false)
    }
  }

  const handleAuthChange = async (retryCount = 0): Promise<void> => {
    setAuthError("")
    setAuthMessage("")

    const { data: { session } } = await supabase.auth.getSession()

    if (session?.user) {
      const email = session.user.email || userEmail
      setUserEmail(email)
      setUserReady(true)
      await claimOrder(email)
      return
    }

    if (retryCount < 5) {
      await new Promise((resolve) => setTimeout(resolve, 200))
      return handleAuthChange(retryCount + 1)
    }

    try {
      const { data } = await supabase.auth.getUser()
      if (data.user) {
        const email = data.user.email || userEmail
        setUserEmail(email)
        setUserReady(true)
        await claimOrder(email)
        return
      }
    } catch {
      // ignore
    }

    setUserReady(false)
  }

  useEffect(() => {
    handleAuthChange()
    const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        handleAuthChange()
      }
    })

    return () => {
      subscription?.subscription?.unsubscribe()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId, orderIdParam, supabase])

  const checkVerification = async () => {
    setCheckingSession(true)
    setAuthError("")
    setAuthMessage("")

    for (let i = 0; i < 3; i++) {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (session?.user) {
          const email = session.user.email || userEmail
          setUserEmail(email)
          setUserReady(true)
          await claimOrder(email)
          setCheckingSession(false)
          return
        }

        const { data, error } = await supabase.auth.getUser()
        if (error) throw error
        if (data?.user) {
          const email = data.user.email || userEmail
          setUserEmail(email)
          setUserReady(true)
          await claimOrder(email)
          setCheckingSession(false)
          return
        }
      } catch {
        // ignore and retry
      }

      if (i < 2) {
        await new Promise((resolve) => setTimeout(resolve, 500))
      }
    }

    setAuthMessage(
      "No active session found. If you clicked the email link on another device (like your phone), please continue there. Otherwise, click 'Send magic link' to try again."
    )
    setCheckingSession(false)
  }

  const sendMagicLink = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!userEmail) {
      setAuthError("Email is required")
      return
    }
    await autoSendMagicLink(userEmail)
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card/80 backdrop-blur-sm border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center">
            <Image
              src="/gifting-moments-logo.svg"
              alt="Gifting Moments"
              width={220}
              height={75}
              className="h-16 md:h-20 w-auto"
            />
          </Link>
          <Link
            href="/pricing"
            className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-10">
        <div className="text-center mb-8">
          <span className="inline-flex items-center gap-1.5 mb-3 px-3 py-1.5 rounded-full bg-accent/20 text-accent-foreground text-xs font-medium border border-accent/30">
            Revive Clips
          </span>
          <h1 className="font-serif text-3xl md:text-4xl text-foreground mb-3">
            Upload your photos
          </h1>
          <p className="text-sm md:text-base text-muted-foreground max-w-xl mx-auto">
            After upload, production starts immediately. Delivery within 24 hours.
          </p>
        </div>

        {!userReady ? (
          <div className="bg-card rounded-2xl border border-border shadow-lg p-6 md:p-8 space-y-6">
            <div>
              <h2 className="text-xl font-serif text-foreground mb-2">
                {linkSent ? "We’ve sent you a magic link" : "Secure your order"}
              </h2>
              <p className="text-sm text-muted-foreground">
                Check your email to secure your order and upload your photos.
              </p>
              <p className="text-xs text-muted-foreground mt-2 italic">
                Tip: Click the email link on this same device, or continue on whatever device you clicked it.
              </p>
            </div>

            <form onSubmit={sendMagicLink} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm text-muted-foreground">Email</label>
                <input
                  type="email"
                  value={userEmail}
                  onChange={(e) => setUserEmail(e.target.value)}
                  required
                  className="w-full rounded-lg border border-border bg-muted px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>

              {authError && <p className="text-sm text-red-600">{authError}</p>}
              {authMessage && (
                <p className={`text-sm ${authMessage.includes("No active session") ? "text-amber-600" : "text-green-600"}`}>
                  {authMessage}
                </p>
              )}

              <button
                type="submit"
                disabled={sendingLink || (!sessionId && !orderIdParam)}
                className="w-full h-11 rounded-lg bg-primary text-primary-foreground font-medium flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {sendingLink && <Loader2 className="w-4 h-4 animate-spin" />}
                Send magic link
              </button>

              <button
                type="button"
                onClick={checkVerification}
                disabled={checkingSession}
                className="w-full h-11 rounded-lg border border-border text-foreground font-medium flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {checkingSession && <Loader2 className="w-4 h-4 animate-spin" />}
                I&apos;ve verified, continue
              </button>
            </form>

            {!sessionId && !orderIdParam && (
              <p className="text-sm text-red-600">Missing checkout session. Please return from Stripe.</p>
            )}
          </div>
        ) : claiming ? (
          <div className="flex items-center justify-center py-10">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
            <span className="ml-3 text-sm text-muted-foreground">Preparing your upload…</span>
          </div>
        ) : claimError ? (
          <div className="bg-card rounded-2xl border border-border shadow-lg p-6 md:p-8 space-y-3">
            <p className="text-sm text-red-600">{claimError}</p>
            <p className="text-sm text-muted-foreground">
              Please use the email you used at checkout so we can attach your order.
            </p>
          </div>
        ) : orderId && expectedPhotoCount ? (
          <ReviveUploadForm orderId={orderId} expectedPhotoCount={expectedPhotoCount} />
        ) : (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
            <span className="ml-3 text-sm text-muted-foreground">Loading your order…</span>
          </div>
        )}
      </main>
    </div>
  )
}

