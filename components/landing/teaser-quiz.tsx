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
        {step <= 2 && (
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
          {/* Combined Step: Honoree + Memory */}
          {step === 1 && (
            <div className="animate-fade-in-slow space-y-5">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-primary">Step {progressStep} of {totalSteps}</p>
                <span className="text-[11px] text-muted-foreground">
                  Completing this unlocks your best package
                </span>
              </div>

              <div className="bg-muted/40 border border-border rounded-xl p-3 text-xs text-foreground font-medium text-center">
                Don&apos;t worry about details yet—add specific instructions after booking.
              </div>

              <div>
                <h2 className="font-serif text-xl md:text-2xl text-foreground mb-3">
                  Who are we honoring today?
                </h2>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
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

              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-serif text-lg text-foreground">What kind of memory?</h3>
                  <span className="text-[11px] text-muted-foreground">Quick pick (2 sec)</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {MEMORY_TYPE_OPTIONS.map((option) => {
                    const Icon = option.icon
                    const selected = memoryType === option.id
                    return (
                      <button
                        key={option.id}
                        onClick={() => selectMemory(option.id)}
                        className={`p-3 rounded-lg border-2 flex items-center gap-2 text-left transition-all ${
                          selected
                            ? "border-primary bg-primary/10 text-primary shadow-sm"
                            : "border-border bg-muted/30 hover:border-primary/40"
                        }`}
                      >
                        <Icon className={`w-4 h-4 ${selected ? "text-primary" : "text-muted-foreground"}`} />
                        <span className="text-xs font-semibold">{option.label}</span>
                      </button>
                    )
                  })}
                </div>

                <div className="mt-3">
                  {!showCustomMemory ? (
                    <button
                      onClick={() => setShowCustomMemory(true)}
                      className="w-full py-2 px-3 rounded-lg border-2 border-dashed border-primary/60 bg-primary/5 text-primary font-semibold text-sm hover:bg-primary/10 transition-colors"
                    >
                      Something else? Tap to tell us.
                    </button>
                  ) : (
                    <div className="mt-2 space-y-2">
                      <p className="text-xs font-semibold text-foreground">
                        Tell us the memory in your words
                      </p>
                      <input
                        type="text"
                        value={memoryType ?? ""}
                        onChange={(e) => setMemoryType(e.target.value)}
                        placeholder="e.g., Military homecoming, first day of school..."
                        className="w-full rounded-lg border border-primary/40 bg-muted/30 px-3 py-2 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Analyzing */}
          {step === 2 && (
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
          {step === 1 && (
            <div className="mt-6 flex items-center justify-end">
              <Button
                onClick={handleNext}
                disabled={!canProceed()}
                className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 h-10"
              >
                See options
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
