"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  X,
  ArrowRight,
  Loader2,
  ArrowLeft,
  Sparkles,
  Heart,
  Users,
  User,
  Baby,
  Flag,
  Image as ImageIcon,
} from "lucide-react"

interface TeaserQuizProps {
  isOpen: boolean
  onClose: () => void
}

type HonoreeType = "grandma" | "grandpa" | "grandparents" | "mom" | "dad" | "someone_else" | null
type MomentType = "lifetime" | "event" | "childhood" | "tribute" | null
type PhotoCountType = "20-40" | "50-80" | "100+" | null

const HONOREE_OPTIONS: Array<{ id: Exclude<HonoreeType, null>; label: string; icon: typeof User }> = [
  { id: "grandma", label: "Grandma", icon: User },
  { id: "grandpa", label: "Grandpa", icon: User },
  { id: "grandparents", label: "Both", icon: Users },
  { id: "mom", label: "Mum", icon: Heart },
  { id: "dad", label: "Dad", icon: Heart },
  { id: "someone_else", label: "Someone else", icon: Users },
]

const MOMENT_OPTIONS: Array<{ id: Exclude<MomentType, null>; label: string; icon: typeof Baby }> = [
  { id: "lifetime", label: "A lifetime of memories", icon: ImageIcon },
  { id: "event", label: "A specific event", icon: Sparkles },
  { id: "childhood", label: "Childhood memories", icon: Baby },
  { id: "tribute", label: "A tribute / memorial", icon: Flag },
]

const PHOTO_COUNT_OPTIONS: Array<{ id: Exclude<PhotoCountType, null>; label: string; hint: string }> = [
  { id: "20-40", label: "Around 20–40", hint: "Perfect for a strong, focused story." },
  { id: "50-80", label: "Around 50–80", hint: "Plenty for an emotional arc with details." },
  { id: "100+", label: "100+ (go big)", hint: "Best for a multi‑scene legacy film." },
]

type RecommendedTier = "premium" | "biography"

function labelForHonoree(h: HonoreeType) {
  if (!h) return "Someone special"
  switch (h) {
    case "grandma":
      return "Grandma"
    case "grandpa":
      return "Grandpa"
    case "grandparents":
      return "Both grandparents"
    case "mom":
      return "Mum"
    case "dad":
      return "Dad"
    case "someone_else":
      return "Someone special"
    default:
      return "Someone special"
  }
}

function labelForMoment(m: MomentType) {
  if (!m) return "a beautiful story"
  return MOMENT_OPTIONS.find((o) => o.id === m)?.label || "a beautiful story"
}

function recommendTier(moment: MomentType, photoCount: PhotoCountType): RecommendedTier {
  if (photoCount === "100+") return "biography"
  if (moment === "lifetime" || moment === "tribute") return "biography"
  return "premium"
}

const TIER_DETAILS: Record<
  RecommendedTier,
  {
    tierId: RecommendedTier
    name: string
    subtitle: string
    price: number
    originalPrice: number
    duration: string
    bullets: string[]
  }
> = {
  premium: {
    tierId: "premium",
    name: "Director’s Cut",
    subtitle: "A fully crafted emotional film",
    price: 89,
    originalPrice: 239,
    duration: "60 sec film",
    bullets: [
      "Sound design + music that fits the mood",
      "Unlimited revisions included",
      "Delivered via a private gift‑wrapped page",
    ],
  },
  biography: {
    tierId: "biography",
    name: "The Biography",
    subtitle: "A multi‑scene legacy documentary",
    price: 139,
    originalPrice: 419,
    duration: "3 min film",
    bullets: [
      "3 connected memory scenes",
      "30‑min story consultation call",
      "Priority support + unlimited revisions",
    ],
  },
}

function percentOff(price: number, original: number) {
  const pct = Math.round(((original - price) / original) * 100)
  return Number.isFinite(pct) && pct > 0 ? pct : null
}

export function TeaserQuiz({ isOpen, onClose }: TeaserQuizProps) {
  const [step, setStep] = useState(1) // 1..4 form, 5 = results, 6 = redirecting
  const [honoree, setHonoree] = useState<HonoreeType>(null)
  const [moment, setMoment] = useState<MomentType>(null)
  const [photoCount, setPhotoCount] = useState<PhotoCountType>(null)
  const [mustRemember, setMustRemember] = useState("")
  const [checkoutError, setCheckoutError] = useState<string | null>(null)
  const [isCheckingOut, setIsCheckingOut] = useState(false)

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      const timer = setTimeout(() => {
        setStep(1)
        setHonoree(null)
        setMoment(null)
        setPhotoCount(null)
        setMustRemember("")
        setCheckoutError(null)
        setIsCheckingOut(false)
      }, 300)
      return () => clearTimeout(timer)
    }
  }, [isOpen])

  const totalSteps = 5

  const recommendedTier = useMemo(() => recommendTier(moment, photoCount), [moment, photoCount])
  const tier = TIER_DETAILS[recommendedTier]

  const progressPct = useMemo(() => {
    const clamped = Math.min(Math.max(step, 1), totalSteps)
    return Math.round((clamped / totalSteps) * 100)
  }, [step])

  if (!isOpen) return null

  const canContinue = () => {
    if (step === 1) return honoree !== null
    if (step === 2) return moment !== null
    if (step === 3) return photoCount !== null
    return true
  }

  const persistDraft = () => {
    const draft = {
      who: honoree,
      memory: labelForMoment(moment),
      moment,
      photoCount,
      mustRemember: mustRemember.trim().length > 0 ? mustRemember.trim() : null,
    }

    try {
      localStorage.setItem("gifter_draft", JSON.stringify(draft))
    } catch {
      // ignore
    }
    try {
      sessionStorage.setItem("giftingmoments_quiz", JSON.stringify(draft))
    } catch {
      // ignore
    }

    return draft
  }

  const goNext = () => {
    if (!canContinue()) return
    setCheckoutError(null)
    const next = Math.min(step + 1, totalSteps)
    if (next === 5) {
      persistDraft()
    }
    setStep(next)
  }

  const goBack = () => {
    setCheckoutError(null)
    setStep((s) => Math.max(1, s - 1))
  }

  const startCheckout = async () => {
    setCheckoutError(null)
    setIsCheckingOut(true)
    setStep(6)

    const quizData = persistDraft()

    try {
      const response = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tierId: tier.tierId, quizData }),
      })

      const data = await response.json()

      if (!response.ok || !data?.url) {
        throw new Error(data?.error || "Failed to start checkout. Please try again.")
      }

      window.location.href = data.url
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to start checkout. Please try again."
      setCheckoutError(message)
      setIsCheckingOut(false)
      setStep(5)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop - no onClick to prevent accidental closes */}
      <div 
        className="absolute inset-0 bg-foreground/60 backdrop-blur-sm animate-fade-in-slow"
      />

      {/* Modal */}
      <div className="relative w-full max-w-lg bg-card rounded-2xl shadow-2xl border border-border overflow-hidden animate-fade-in-up">
        {/* Close button */}
        {step <= 6 && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-muted-foreground hover:text-foreground transition-colors rounded-full hover:bg-muted z-10"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        {/* Progress bar */}
        {step <= 5 && (
          <div className="h-1 bg-muted">
            <div 
              className="h-full bg-primary transition-all duration-500 ease-out"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        )}

        {/* Content */}
        <div className="p-6 md:p-8">
          {/* Step 1: Honoree */}
          {step === 1 && (
            <div className="animate-fade-in-slow space-y-5">
              <div>
                <h2 className="font-serif text-xl md:text-2xl text-foreground mb-3">
                  Who are we making this film for?
                </h2>
                <p className="text-sm text-muted-foreground mb-4">
                  Choose who you’re honouring — we’ll tailor the tone.
                </p>
                <div className="grid grid-cols-3 gap-2">
                  {HONOREE_OPTIONS.map((option) => {
                    const Icon = option.icon
                    return (
                      <button
                        key={option.id}
                        onClick={() => setHonoree(option.id)}
                        className={`w-full h-full min-h-[92px] p-3 rounded-xl border-2 transition-all hover:scale-[1.02] flex flex-col items-center justify-center gap-1 text-center ${
                          honoree === option.id
                            ? "border-primary bg-primary/10 text-primary shadow-sm"
                            : "border-border bg-muted/30 text-foreground hover:border-primary/50"
                        }`}
                      >
                        <Icon className="w-5 h-5 mx-auto mb-1" />
                        <span className="block text-xs font-semibold leading-tight">{option.label}</span>
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Moment */}
          {step === 2 && (
            <div className="animate-fade-in-slow space-y-5">
              <div>
                <h2 className="font-serif text-xl md:text-2xl text-foreground mb-3">
                  What moment are we honouring?
                </h2>
                <p className="text-sm text-muted-foreground mb-4">
                  This helps us shape the story arc and music.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {MOMENT_OPTIONS.map((option) => {
                    const Icon = option.icon
                    const selected = moment === option.id
                    return (
                      <button
                        key={option.id}
                        onClick={() => setMoment(option.id)}
                        className={`p-4 rounded-xl border-2 flex items-start gap-3 text-left transition-all ${
                          selected
                            ? "border-primary bg-primary/10 text-primary shadow-sm"
                            : "border-border bg-muted/30 hover:border-primary/40"
                        }`}
                      >
                        <div className="h-9 w-9 rounded-lg bg-background/60 flex items-center justify-center flex-shrink-0">
                          <Icon className={`w-4 h-4 ${selected ? "text-primary" : "text-muted-foreground"}`} />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-foreground">{option.label}</p>
                          <p className="mt-1 text-xs text-muted-foreground">
                            {option.id === "lifetime"
                              ? "Best for legacy-style storytelling."
                              : option.id === "tribute"
                                ? "A gentle, respectful tone — guided by you."
                                : option.id === "event"
                                  ? "One big day, beautifully directed."
                                  : "Those little details that define home."}
                          </p>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Photo count */}
          {step === 3 && (
            <div className="animate-fade-in-slow space-y-5">
              <div>
                <h2 className="font-serif text-xl md:text-2xl text-foreground mb-3">
                  Roughly how many photos & clips?
                </h2>
                <p className="text-sm text-muted-foreground mb-4">
                  A quick estimate helps us recommend the right package.
                </p>

                <div className="space-y-2">
                  {PHOTO_COUNT_OPTIONS.map((option) => {
                    const selected = photoCount === option.id
                    return (
                      <button
                        key={option.id}
                        onClick={() => setPhotoCount(option.id)}
                        className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                          selected
                            ? "border-primary bg-primary/10 text-primary shadow-sm"
                            : "border-border bg-muted/30 hover:border-primary/40"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-sm font-semibold text-foreground">{option.label}</p>
                            <p className="mt-1 text-xs text-muted-foreground">{option.hint}</p>
                          </div>
                          <span
                            className={`text-xs font-semibold px-2 py-1 rounded-full border ${
                              selected
                                ? "bg-primary text-primary-foreground border-primary"
                                : "bg-background text-muted-foreground border-border"
                            }`}
                          >
                            {option.id === "100+" ? "Go big" : "Recommended"}
                          </span>
                        </div>
                      </button>
                    )
                  })}
                </div>

                <div className="bg-muted/40 border border-border rounded-xl p-3 text-xs text-foreground font-medium text-center mt-4">
                  Don&apos;t worry about perfection — you can add more details after booking.
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Optional emotive question */}
          {step === 4 && (
            <div className="animate-fade-in-slow space-y-5">
              <div>
                <h2 className="font-serif text-xl md:text-2xl text-foreground mb-3">
                  What&apos;s one thing you never want them to forget?
                </h2>
                <p className="text-sm text-muted-foreground mb-4">
                  Optional — we’ll use this to guide the tone of the film.
                </p>

                <textarea
                  value={mustRemember}
                  onChange={(e) => setMustRemember(e.target.value)}
                  rows={4}
                  placeholder="e.g., The way our kitchen smelled on Sundays…"
                  className="w-full rounded-xl border border-border bg-muted/20 px-4 py-3 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
                <p className="text-xs text-muted-foreground">
                  You can share more later — this just helps us start in the right direction.
                </p>
              </div>
            </div>
          )}

          {/* Step 5: Recommendation */}
          {step === 5 && (
            <div className="animate-fade-in-slow space-y-5">
              <div className="text-center">
                <p className="text-xs font-semibold tracking-wide text-primary uppercase">
                  Your recommendation
                </p>
                <h2 className="mt-2 font-serif text-xl md:text-2xl text-foreground">
                  We recommend {tier.name}
                </h2>
                <p className="mt-2 text-sm text-muted-foreground max-w-sm mx-auto">
                  For {labelForHonoree(honoree)} · {labelForMoment(moment)}
                </p>
              </div>

              <div className="rounded-2xl border border-border bg-muted/20 p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-foreground">{tier.subtitle}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{tier.duration} · Delivered in 24 hours</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-foreground">
                      ${tier.price}{" "}
                      <span className="text-muted-foreground line-through font-medium">
                        ${tier.originalPrice}
                      </span>
                    </p>
                    {percentOff(tier.price, tier.originalPrice) ? (
                      <p className="mt-1 text-xs font-semibold text-primary">
                        Save {percentOff(tier.price, tier.originalPrice)}% today
                      </p>
                    ) : null}
                  </div>
                </div>

                <div className="mt-4 grid gap-2">
                  {tier.bullets.map((b) => (
                    <div key={b} className="flex items-start gap-2">
                      <Sparkles className="h-4 w-4 text-primary mt-0.5" />
                      <p className="text-sm text-foreground">{b}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-5 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
                  <Button
                    onClick={startCheckout}
                    disabled={isCheckingOut}
                    className="flex-1 h-11"
                  >
                    {isCheckingOut ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Sending you to checkout…
                      </>
                    ) : (
                      <>
                        Continue to secure checkout
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </>
                    )}
                  </Button>
                  <Link
                    href={`/pricing?recommended=${encodeURIComponent(tier.tierId)}`}
                    className="inline-flex items-center justify-center rounded-md border border-border bg-background px-4 h-11 text-sm font-medium text-foreground hover:bg-muted transition-colors"
                  >
                    See other packages
                  </Link>
                </div>

                <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                  <div className="rounded-xl border border-border bg-background px-3 py-2">
                    <p className="text-xs font-semibold text-foreground">★★★★★</p>
                    <p className="text-[11px] text-muted-foreground">Loved by families</p>
                  </div>
                  <div className="rounded-xl border border-border bg-background px-3 py-2">
                    <p className="text-xs font-semibold text-foreground">24h</p>
                    <p className="text-[11px] text-muted-foreground">Delivery</p>
                  </div>
                  <div className="rounded-xl border border-border bg-background px-3 py-2">
                    <p className="text-xs font-semibold text-foreground">∞</p>
                    <p className="text-[11px] text-muted-foreground">Revisions</p>
                  </div>
                </div>

                {checkoutError ? (
                  <p className="mt-4 text-sm text-red-600">
                    {checkoutError}
                  </p>
                ) : null}
              </div>
            </div>
          )}

          {/* Step 6: Redirecting */}
          {step === 6 && (
            <div className="animate-fade-in-slow text-center py-10">
              <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                <Loader2 className="w-7 h-7 text-primary animate-spin" />
              </div>
              <h2 className="font-serif text-xl md:text-2xl text-foreground mb-2">
                Taking you to checkout…
              </h2>
              <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                Your story is saved. You’ll be back here after checkout to continue.
              </p>
            </div>
          )}

          {/* Navigation */}
          {step >= 1 && step <= 4 && (
            <div className="mt-6 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={step === 1 ? onClose : goBack}
                className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                {step === 1 ? "Close" : "Back"}
              </button>

              <Button
                onClick={goNext}
                disabled={!canContinue()}
                className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 h-10"
              >
                {step === 4 ? "See recommendation" : "Continue"}
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
