"use client"

import { Suspense, useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { Gift, ArrowLeft, Loader2 } from "lucide-react"
import { DirectorInterviewForm } from "@/components/director-interview-form"
import { useSearchParams } from "next/navigation"
import { createClient } from "@/lib/supabase/client"

export default function DirectorInterviewPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      }
    >
      <DirectorInterviewContent />
    </Suspense>
  )
}

function DirectorInterviewContent() {
  const [packageName, setPackageName] = useState<string>("Memory Package")
  const [quizData, setQuizData] = useState<{ honoree?: string } | null>(null)
  const [userEmail, setUserEmail] = useState<string>("")
  const [userReady, setUserReady] = useState<boolean>(false)
  const [sendingLink, setSendingLink] = useState<boolean>(false)
  const [authMessage, setAuthMessage] = useState<string>("")
  const [authError, setAuthError] = useState<string>("")
  const [claiming, setClaiming] = useState<boolean>(false)
  const [claimError, setClaimError] = useState<string>("")
  const [checkingSession, setCheckingSession] = useState<boolean>(false)
  const [authErrorFlag, setAuthErrorFlag] = useState<boolean>(false)
  const [orderId, setOrderId] = useState<string>("")
  const [interviewData, setInterviewData] = useState<Record<string, unknown> | null>(null)
  const searchParams = useSearchParams()
  const supabase = useMemo(() => createClient(), [])

  const sessionId = searchParams.get("session_id") || searchParams.get("checkout_session_id") || ""
  const hasAuthError = searchParams.get("auth_error")
  const authComplete = searchParams.get("auth_complete") === "true"
  const [initialCheckDone, setInitialCheckDone] = useState(false)

  useEffect(() => {
    // Get package info from session storage
    const pkg = sessionStorage.getItem("giftingmoments_package")
    if (pkg) {
      const names: Record<string, string> = {
        keepsake: "Digital Keepsake",
        directors: "Director's Cut",
        biography: "Biography",
      }
      setPackageName(names[pkg] || "Memory Package")
    }

    // Get quiz data
    const quiz = sessionStorage.getItem("giftingmoments_quiz")
    if (quiz) {
      try {
        setQuizData(JSON.parse(quiz))
      } catch {
        // Ignore parsing errors
      }
    }

    // Prefill email from Stripe session
    const preloadSession = async () => {
      if (!sessionId) return
      try {
        const res = await fetch(`/api/stripe/session?session_id=${encodeURIComponent(sessionId)}`)
        const data = await res.json()
        if (data?.email) {
          setUserEmail(data.email)
        }
      } catch {
        // ignore
      }
    }

    preloadSession()
  }, [sessionId])

  useEffect(() => {
    if (hasAuthError) setAuthErrorFlag(true)
  }, [hasAuthError])

  const claimOrder = async (emailOverride?: string) => {
    setClaiming(true)
    setClaimError("")
    
    let effectiveSessionId = sessionId
    const emailToUse = emailOverride || userEmail
    
    try {
      // If we don't have session_id from URL, try to look it up by email
      // This enables cross-device flows where user verifies on a different device
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
          // Non-fatal - continue without session_id
        }
      }

      // Try to claim by session_id if we have it
      if (effectiveSessionId) {
        const claimRes = await fetch("/api/orders/claim", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ session_id: effectiveSessionId }),
        })
        if (claimRes.ok) {
          const claimData = await claimRes.json()
          if (claimData.order?.id) {
            setOrderId(claimData.order.id)
            // Load quiz data from the claimed order
            if (claimData.order.quiz_data) {
              setQuizData(claimData.order.quiz_data)
            }
            // Load interview data from the claimed order
            if (claimData.order.interview_data) {
              setInterviewData(claimData.order.interview_data)
            }
            // Clean up the pending checkout mapping
            if (emailToUse) {
              fetch(`/api/checkout/pending?email=${encodeURIComponent(emailToUse)}`, {
                method: "DELETE",
              }).catch(() => {})
            }
            setClaiming(false)
            return
          }
        }
      }

      // Fallback: Fetch the user's pending order from database
      const pendingRes = await fetch("/api/orders/pending")
      if (pendingRes.ok) {
        const pendingData = await pendingRes.json()
        if (pendingData.order?.id) {
          setOrderId(pendingData.order.id)
          // Load quiz data from the order if available
          if (pendingData.order.quiz_data) {
            setQuizData(pendingData.order.quiz_data)
          }
          // Load saved interview progress if available
          if (pendingData.order.interview_data) {
            setInterviewData(pendingData.order.interview_data)
          }
          setClaiming(false)
          return
        }
      }

      // If we still don't have an order, show error
      if (!effectiveSessionId) {
        setClaimError("No pending order found. Please complete checkout first.")
      } else {
        setClaimError("Could not find your order. Please try again or contact support.")
      }
    } catch {
      setClaimError("Failed to load your order.")
    }
    setClaiming(false)
  }

  const handleAuthChange = async (retryCount = 0): Promise<void> => {
    setAuthError("")
    setAuthMessage("")
    
    // Use getSession first (reads from storage, no network call)
    const { data: { session } } = await supabase.auth.getSession()
    
    if (session?.user) {
      const email = session.user.email || userEmail
      setUserEmail(email)
      setUserReady(true)
      await claimOrder(email) // Pass email directly to avoid async state issues
      return
    }

    // If auth_complete flag is set, retry a few times (session might still be writing)
    if (authComplete && retryCount < 5) {
      await new Promise(resolve => setTimeout(resolve, 200))
      return handleAuthChange(retryCount + 1)
    }

    // Fallback: try getUser (network call) as last resort
    try {
      const { data } = await supabase.auth.getUser()
      if (data.user) {
        const email = data.user.email || userEmail
        setUserEmail(email)
        setUserReady(true)
        await claimOrder(email) // Pass email directly to avoid async state issues
        return
      }
    } catch {
      // ignore errors
    }

    setUserReady(false)
    setInitialCheckDone(true)
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
  }, [sessionId, supabase, authComplete])

  const checkVerification = async () => {
    setCheckingSession(true)
    setAuthError("")
    setAuthMessage("")
    
    // Retry a few times with small delays
    for (let i = 0; i < 3; i++) {
      try {
        // Try getSession first (local storage)
        const { data: { session } } = await supabase.auth.getSession()
        if (session?.user) {
          const email = session.user.email || userEmail
          setUserEmail(email)
          setUserReady(true)
          await claimOrder(email)
          setCheckingSession(false)
          return
        }
        
        // Fallback to getUser (network call)
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
        await new Promise(resolve => setTimeout(resolve, 500))
      }
    }
    
    setAuthMessage("Still waiting for login. Open the email link to continue.")
    setCheckingSession(false)
  }

  const sendMagicLink = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!userEmail) {
      setAuthError("Email is required")
      return
    }
    setSendingLink(true)
    setAuthError("")
    setAuthMessage("")
    
    // Save session ID to recover context if redirect strips params
    if (sessionId) {
      try {
        localStorage.setItem("giftingmoments_session_id", sessionId)
      } catch {
        // ignore
      }
      
      // CRITICAL: Store email → session_id mapping for cross-device support
      // This allows the user to verify on a different device and still find their order
      try {
        await fetch("/api/checkout/pending", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: userEmail, session_id: sessionId }),
        })
      } catch {
        // Non-fatal - continue with magic link
      }
    }

    try {
      const redirectTo = `${window.location.origin}/auth/confirm?next=${encodeURIComponent(`/director-interview?session_id=${encodeURIComponent(sessionId)}`)}`
      const { error } = await supabase.auth.signInWithOtp({
        email: userEmail,
        options: {
          emailRedirectTo: redirectTo,
          shouldCreateUser: true,
        },
      })
      if (error) throw error
      setAuthMessage("Magic link sent. Check your email to continue.")
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to send magic link"
      setAuthError(message)
    } finally {
      setSendingLink(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card/80 backdrop-blur-sm border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center group-hover:shadow-lg transition-shadow">
              <Gift className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <span className="text-lg font-serif text-foreground">Moments</span>
              <p className="text-xs text-muted-foreground">Memory Restoration Studio</p>
            </div>
          </Link>
          <Link
            href="/pricing"
            className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Packages
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-12 md:py-16">
        {/* Header Section */}
        <div className="text-center mb-12">
          <span className="inline-block mb-4 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium">
            {packageName}
          </span>
          <h1 className="font-serif text-3xl md:text-4xl lg:text-5xl text-foreground mb-4">
            The Director&apos;s Chair
          </h1>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            {quizData?.honoree 
              ? `Let's bring ${quizData.honoree}'s memory to life. The more details you share, the more real it will feel.`
              : "The more details you give us, the more real it will feel. Take your time."}
          </p>
        </div>

        {/* Form */}
        <div className="bg-card rounded-2xl border border-border shadow-lg p-6 md:p-10">
          {!userReady ? (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-serif text-foreground mb-2">Confirm your email to continue</h2>
                <p className="text-sm text-muted-foreground">
                  We&apos;ll send you a magic link to secure your order and save your interview progress.
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
                {authError && (
                  <p className="text-sm text-red-600">{authError}</p>
                )}
                {authMessage && (
                  <p className="text-sm text-green-600">{authMessage}</p>
                )}
                <button
                  type="submit"
                  disabled={sendingLink || !sessionId}
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
                  I've verified, continue
                </button>
              </form>
              {sessionId === "" && (
                <p className="text-sm text-red-600">Missing checkout session. Please return from Stripe.</p>
              )}
            </div>
          ) : claiming ? (
            <div className="flex items-center justify-center py-10">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
              <span className="ml-3 text-sm text-muted-foreground">Preparing your interview...</span>
            </div>
          ) : claimError ? (
            <div className="space-y-3">
              <p className="text-sm text-red-600">{claimError}</p>
              <p className="text-sm text-muted-foreground">
                Please use the email you used at checkout so we can attach your order.
              </p>
            </div>
          ) : orderId ? (
            <Suspense fallback={
              <div className="flex items-center justify-center py-16">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
              </div>
            }>
              <DirectorInterviewForm 
                orderId={orderId} 
                initialQuizData={quizData} 
                savedInterviewData={interviewData}
              />
            </Suspense>
          ) : (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
              <span className="ml-3 text-sm text-muted-foreground">Loading your order...</span>
            </div>
          )}
        </div>

        {/* Trust Footer */}
        <div className="mt-12 text-center">
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            Your information is secure. We use it only to craft your memory and delete all files after delivery.
          </p>
        </div>
      </main>
    </div>
  )
}
