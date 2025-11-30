"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  X,
  Heart,
  Users,
  User,
  ArrowRight,
  Loader2,
  Home,
  Plane,
  Gift,
  Coffee,
  Cake,
  Gem,
} from "lucide-react"

interface TeaserQuizProps {
  isOpen: boolean
  onClose: () => void
}

type HonoreeType = "dad" | "mom" | "grandparent" | "partner" | "other" | null
type MemoryType = string | null

const HONOREE_OPTIONS = [
  { id: "dad" as const, label: "Dad", icon: User },
  { id: "mom" as const, label: "Mom", icon: User },
  { id: "grandparent" as const, label: "Grandparent", icon: Users },
  { id: "partner" as const, label: "Partner", icon: Heart },
  { id: "other" as const, label: "Someone Special", icon: Users },
]

const MEMORY_TYPE_OPTIONS = [
  { id: "holiday", label: "Holiday moments", icon: Gift },
  { id: "wedding", label: "Wedding day", icon: Gem },
  { id: "vacation", label: "Vacation", icon: Plane },
  { id: "everyday", label: "Everyday life", icon: Coffee },
  { id: "childhood", label: "Childhood home", icon: Home },
  { id: "birthday", label: "Birthday", icon: Cake },
]

export function TeaserQuiz({ isOpen, onClose }: TeaserQuizProps) {
  const router = useRouter()
  const [step, setStep] = useState(1) // 1 = selection, 2 = analyzing
  const [honoree, setHonoree] = useState<HonoreeType>(null)
  const [memoryType, setMemoryType] = useState<MemoryType>(null)
  const [showCustomMemory, setShowCustomMemory] = useState(false)

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      const timer = setTimeout(() => {
        setStep(1)
        setHonoree(null)
        setMemoryType(null)
        setShowCustomMemory(false)
      }, 300)
      return () => clearTimeout(timer)
    }
  }, [isOpen])

  const handleNext = () => {
    if (!canProceed()) return

    setStep(2)

    const memoryLabel = MEMORY_TYPE_OPTIONS.find((m) => m.id === memoryType)?.label || memoryType
    const draft = {
      who: honoree,
      memory: memoryLabel,
      vibe: null,
    }

    // Persist quiz data for checkout/director handoff
    try {
      localStorage.setItem("gifter_draft", JSON.stringify(draft))
    } catch {
      // ignore
    }

    // Keep sessionStorage for existing summary UI
    try {
      sessionStorage.setItem("giftingmoments_quiz", JSON.stringify(draft))
    } catch {
      // ignore
    }
    
    // Simulate analysis and redirect to pricing with middle tier pre-selected
    setTimeout(() => {
      router.push("/pricing?recommended=premium")
    }, 2000)
  }

  const canProceed = () => {
    if (step === 1) return honoree !== null && typeof memoryType === "string" && memoryType.trim().length > 0
    return true
  }

  const selectMemory = (id: string) => setMemoryType(id)

  if (!isOpen) return null

  const totalSteps = 2
  const progressStep = step === 2 ? 2 : honoree ? 2 : 1
  const progressPercent = (progressStep / totalSteps) * 100

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop - no onClick to prevent accidental closes */}
      <div 
        className="absolute inset-0 bg-foreground/60 backdrop-blur-sm animate-fade-in-slow"
      />

      {/* Modal */}
      <div className="relative w-full max-w-lg bg-card rounded-2xl shadow-2xl border border-border overflow-hidden animate-fade-in-up">
        {/* Close button */}
        {step < 4 && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-muted-foreground hover:text-foreground transition-colors rounded-full hover:bg-muted z-10"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        {/* Progress bar */}
        {step <= 2 && (
          <div className="h-1 bg-muted">
            <div 
              className="h-full bg-primary transition-all duration-500 ease-out"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        )}

        {/* Content */}
        <div className="p-6 md:p-8">
          {/* Step 1: Who are we honoring? */}
          {step === 1 && (
            <div className="animate-fade-in-slow">
              <p className="text-xs font-medium text-primary mb-1">Step 1 of 3</p>
              <h2 className="font-serif text-xl md:text-2xl text-foreground mb-1">
                Who are we honoring?
              </h2>
              <p className="text-sm text-muted-foreground mb-6">
                Select the person who will receive this gift.
              </p>

              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                {HONOREE_OPTIONS.map((option) => {
                  const Icon = option.icon
                  return (
                    <button
                      key={option.id}
                      onClick={() => setHonoree(option.id)}
                      className={`w-full h-full min-h-[96px] p-3 rounded-xl border-2 transition-all hover:scale-[1.02] flex flex-col items-center justify-center gap-1 text-center ${
                        honoree === option.id
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border bg-muted/30 text-foreground hover:border-primary/50"
                      }`}
                    >
                      <Icon className="w-5 h-5 mx-auto mb-1" />
                      <span className="block text-xs font-medium leading-tight">{option.label}</span>
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* Step 2: What type of memory? (Selector Grid) */}
          {step === 2 && (
            <div className="animate-fade-in-slow">
              <p className="text-xs font-medium text-primary mb-1">Step 2 of 3</p>
              <h2 className="font-serif text-xl md:text-2xl text-foreground mb-1">
                What type of memory?
              </h2>
              <p className="text-sm text-muted-foreground mb-6">
                Select a category. You&apos;ll add details after booking.
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {MEMORY_TYPE_OPTIONS.map((option) => {
                  const Icon = option.icon
                  return (
                    <button
                      key={option.id}
                      onClick={() => selectMemory(option.id)}
                      className={`p-4 rounded-xl border-2 text-left transition-all hover:scale-[1.01] ${
                        memoryType === option.id
                          ? "border-primary bg-primary/10"
                          : "border-border bg-muted/30 hover:border-primary/50"
                      }`}
                    >
                      <Icon className={`w-5 h-5 mb-2 ${memoryType === option.id ? "text-primary" : "text-muted-foreground"}`} />
                      <span className={`block text-sm font-medium ${memoryType === option.id ? "text-primary" : "text-foreground"}`}>
                        {option.label}
                      </span>
                      <span className="block text-xs text-muted-foreground mt-0.5">
                        {option.description}
                      </span>
                    </button>
                  )
                })}
              </div>

              <div className="mt-4 text-center">
                {!showCustomMemory ? (
                  <button
                    onClick={() => setShowCustomMemory(true)}
                    className="text-sm text-primary underline-offset-4 hover:underline"
                  >
                    Something else?
                  </button>
                ) : (
                  <div className="mt-3 space-y-2">
                    <p className="text-xs text-muted-foreground">
                      Tell us what kind of memory you have in mind.
                    </p>
                    <input
                      type="text"
                      value={memoryType ?? ""}
                      onChange={(e) => setMemoryType(e.target.value)}
                      placeholder="e.g., Military homecoming, first day of school..."
                      className="w-full rounded-lg border border-border bg-muted/50 px-3 py-2 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                )}
              </div>

              {/* Disclaimer */}
              <p className="mt-4 text-xs text-muted-foreground text-center bg-muted/50 p-3 rounded-lg">
                Don&apos;t worry about details yet. You can add specific instructions after booking.
              </p>
            </div>
          )}

          {/* Step 3: How do you want them to feel? */}
          {step === 3 && (
            <div className="animate-fade-in-slow">
              <p className="text-xs font-medium text-primary mb-1">Step 3 of 3</p>
              <h2 className="font-serif text-xl md:text-2xl text-foreground mb-1">
                How should they feel?
              </h2>
              <p className="text-sm text-muted-foreground mb-6">
                This helps us craft the perfect emotional tone.
              </p>

              <div className="grid grid-cols-2 gap-3">
                {FEELING_OPTIONS.map((option) => (
                  <button
                    key={option.id}
                    onClick={() => setFeeling(option.id)}
                    className={`p-4 rounded-xl border-2 text-left transition-all hover:scale-[1.01] ${
                      feeling === option.id
                        ? "border-primary bg-primary/10"
                        : "border-border bg-muted/30 hover:border-primary/50"
                    }`}
                  >
                    <span className={`block text-sm font-medium ${
                      feeling === option.id ? "text-primary" : "text-foreground"
                    }`}>
                      {option.label}
                    </span>
                    <span className="block text-xs text-muted-foreground mt-0.5">
                      {option.description}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 4: Analyzing */}
          {step === 4 && (
            <div className="animate-fade-in-slow text-center py-6">
              <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                <Loader2 className="w-7 h-7 text-primary animate-spin" />
              </div>
              <h2 className="font-serif text-xl md:text-2xl text-foreground mb-2">
                Finding Your Package...
              </h2>
              <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                This is a beautiful story. We&apos;re preparing recommendations for you.
              </p>
            </div>
          )}

          {/* Navigation */}
          {step < 4 && (
            <div className="mt-6 flex items-center justify-between">
              {step > 1 ? (
                <Button
                  variant="ghost"
                  onClick={handleBack}
                  className="text-muted-foreground hover:text-foreground h-10"
                >
                  <ArrowLeft className="w-4 h-4 mr-1" />
                  Back
                </Button>
              ) : (
                <div />
              )}

              <Button
                onClick={handleNext}
                disabled={!canProceed()}
                className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 h-10"
              >
                {step === 3 ? "See Options" : "Continue"}
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
