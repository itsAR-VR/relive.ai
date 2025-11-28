"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { X, Heart, Users, User, Sparkles, ArrowRight, ArrowLeft, Loader2, Home, Camera, Plane, PartyPopper, Music, Utensils } from "lucide-react"

interface TeaserQuizProps {
  isOpen: boolean
  onClose: () => void
}

type HonoreeType = "dad" | "mom" | "grandparent" | "partner" | "other" | null
type MemoryType = "childhood" | "wedding" | "holiday" | "vacation" | "celebration" | "everyday" | null
type FeelingType = "nostalgic" | "joyful" | "peace" | "tears" | null

const HONOREE_OPTIONS = [
  { id: "dad" as const, label: "Dad", icon: User },
  { id: "mom" as const, label: "Mom", icon: User },
  { id: "grandparent" as const, label: "Grandparent", icon: Users },
  { id: "partner" as const, label: "Partner", icon: Heart },
  { id: "other" as const, label: "Someone Special", icon: Sparkles },
]

const MEMORY_TYPE_OPTIONS = [
  { id: "childhood" as const, label: "Childhood Home", icon: Home, description: "The house they grew up in" },
  { id: "wedding" as const, label: "Wedding Day", icon: Heart, description: "Their special day" },
  { id: "holiday" as const, label: "Holiday Memory", icon: PartyPopper, description: "Christmas, birthdays, etc." },
  { id: "vacation" as const, label: "Vacation", icon: Plane, description: "A trip they loved" },
  { id: "celebration" as const, label: "Celebration", icon: Music, description: "Parties & milestones" },
  { id: "everyday" as const, label: "Everyday Moment", icon: Utensils, description: "Kitchen, garden, etc." },
]

const FEELING_OPTIONS = [
  { id: "nostalgic" as const, label: "Nostalgic", description: "A warm return to simpler times" },
  { id: "joyful" as const, label: "Joyful", description: "Pure happiness and celebration" },
  { id: "peace" as const, label: "At Peace", description: "Comfort and serenity" },
  { id: "tears" as const, label: "Tears of Joy", description: "The kind that come from love" },
]

export function TeaserQuiz({ isOpen, onClose }: TeaserQuizProps) {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [honoree, setHonoree] = useState<HonoreeType>(null)
  const [memoryType, setMemoryType] = useState<MemoryType>(null)
  const [feeling, setFeeling] = useState<FeelingType>(null)

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      const timer = setTimeout(() => {
        setStep(1)
        setHonoree(null)
        setMemoryType(null)
        setFeeling(null)
      }, 300)
      return () => clearTimeout(timer)
    }
  }, [isOpen])

  const handleNext = () => {
    if (step < 3) {
      setStep(step + 1)
    } else if (step === 3) {
      // Start analysis animation
      setStep(4)
      
      // Store quiz data in sessionStorage for pricing page
      const memoryLabel = MEMORY_TYPE_OPTIONS.find(m => m.id === memoryType)?.label || memoryType
      sessionStorage.setItem("giftingmoments_quiz", JSON.stringify({
        honoree,
        memory: memoryLabel,
        feeling,
      }))
      
      // Simulate analysis and redirect
      setTimeout(() => {
        router.push("/pricing")
      }, 2000)
    }
  }

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1)
    }
  }

  const canProceed = () => {
    if (step === 1) return honoree !== null
    if (step === 2) return memoryType !== null
    if (step === 3) return feeling !== null
    return false
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-foreground/60 backdrop-blur-sm animate-fade-in-slow"
        onClick={onClose}
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
        {step < 4 && (
          <div className="h-1 bg-muted">
            <div 
              className="h-full bg-primary transition-all duration-500 ease-out"
              style={{ width: `${(step / 3) * 100}%` }}
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
                      className={`p-3 rounded-xl border-2 transition-all hover:scale-[1.02] ${
                        honoree === option.id
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border bg-muted/30 text-foreground hover:border-primary/50"
                      }`}
                    >
                      <Icon className="w-5 h-5 mx-auto mb-1" />
                      <span className="block text-xs font-medium">{option.label}</span>
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
                      onClick={() => setMemoryType(option.id)}
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
                {step === 3 ? "See Packages" : "Continue"}
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
