"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { X, Heart, Users, User, Sparkles, ArrowRight, ArrowLeft, Loader2 } from "lucide-react"

interface TeaserQuizProps {
  isOpen: boolean
  onClose: () => void
}

type HonoreeType = "dad" | "mom" | "grandparent" | "partner" | "other" | null
type FeelingType = "nostalgic" | "joyful" | "peace" | "tears" | null

const HONOREE_OPTIONS = [
  { id: "dad" as const, label: "Dad", icon: User },
  { id: "mom" as const, label: "Mom", icon: User },
  { id: "grandparent" as const, label: "Grandparent", icon: Users },
  { id: "partner" as const, label: "Partner", icon: Heart },
  { id: "other" as const, label: "Someone Special", icon: Sparkles },
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
  const [memory, setMemory] = useState("")
  const [feeling, setFeeling] = useState<FeelingType>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      const timer = setTimeout(() => {
        setStep(1)
        setHonoree(null)
        setMemory("")
        setFeeling(null)
        setIsAnalyzing(false)
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
      setIsAnalyzing(true)
      
      // Store quiz data in sessionStorage for pricing page
      sessionStorage.setItem("giftingmoments_quiz", JSON.stringify({
        honoree,
        memory,
        feeling,
      }))
      
      // Simulate analysis and redirect
      setTimeout(() => {
        router.push("/pricing")
      }, 2500)
    }
  }

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1)
    }
  }

  const canProceed = () => {
    if (step === 1) return honoree !== null
    if (step === 2) return memory.trim().length > 10
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
        <div className="p-8">
          {/* Step 1: Who are we honoring? */}
          {step === 1 && (
            <div className="animate-fade-in-slow">
              <p className="text-sm font-medium text-primary mb-2">Step 1 of 3</p>
              <h2 className="font-serif text-2xl md:text-3xl text-foreground mb-2">
                Who are we honoring today?
              </h2>
              <p className="text-muted-foreground mb-8">
                Select the person who will receive this gift of memory.
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {HONOREE_OPTIONS.map((option) => {
                  const Icon = option.icon
                  return (
                    <button
                      key={option.id}
                      onClick={() => setHonoree(option.id)}
                      className={`p-4 rounded-xl border-2 transition-all hover:scale-[1.02] ${
                        honoree === option.id
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border bg-muted/30 text-foreground hover:border-primary/50"
                      }`}
                    >
                      <Icon className="w-6 h-6 mx-auto mb-2" />
                      <span className="block text-sm font-medium">{option.label}</span>
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* Step 2: What is the memory about? */}
          {step === 2 && (
            <div className="animate-fade-in-slow">
              <p className="text-sm font-medium text-primary mb-2">Step 2 of 3</p>
              <h2 className="font-serif text-2xl md:text-3xl text-foreground mb-2">
                What is the memory about?
              </h2>
              <p className="text-muted-foreground mb-8">
                Describe the moment you want to bring back to life. Be as specific as you can.
              </p>

              <textarea
                value={memory}
                onChange={(e) => setMemory(e.target.value)}
                placeholder="e.g., Dad's childhood home in Brooklyn, 1955. The red bike he always talks about. Playing in the backyard with his siblings..."
                className="w-full h-40 p-4 rounded-xl border-2 border-border bg-muted/30 text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all resize-none"
              />
              <p className="mt-2 text-sm text-muted-foreground">
                {memory.length < 10 ? `At least ${10 - memory.length} more characters` : "Perfect! The more detail, the better."}
              </p>
            </div>
          )}

          {/* Step 3: How do you want them to feel? */}
          {step === 3 && (
            <div className="animate-fade-in-slow">
              <p className="text-sm font-medium text-primary mb-2">Step 3 of 3</p>
              <h2 className="font-serif text-2xl md:text-3xl text-foreground mb-2">
                How do you want them to feel?
              </h2>
              <p className="text-muted-foreground mb-8">
                This helps us craft the perfect emotional tone for their memory.
              </p>

              <div className="space-y-3">
                {FEELING_OPTIONS.map((option) => (
                  <button
                    key={option.id}
                    onClick={() => setFeeling(option.id)}
                    className={`w-full p-4 rounded-xl border-2 text-left transition-all hover:scale-[1.01] ${
                      feeling === option.id
                        ? "border-primary bg-primary/10"
                        : "border-border bg-muted/30 hover:border-primary/50"
                    }`}
                  >
                    <span className={`block font-medium ${
                      feeling === option.id ? "text-primary" : "text-foreground"
                    }`}>
                      {option.label}
                    </span>
                    <span className="block text-sm text-muted-foreground mt-1">
                      {option.description}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 4: Analyzing */}
          {step === 4 && (
            <div className="animate-fade-in-slow text-center py-8">
              <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-primary/10 flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
              </div>
              <h2 className="font-serif text-2xl md:text-3xl text-foreground mb-3">
                Analyzing Your Story...
              </h2>
              <p className="text-muted-foreground max-w-sm mx-auto">
                This is a beautiful story. We&apos;re preparing personalized package recommendations for you.
              </p>
              
              <div className="mt-8 p-4 bg-muted/50 rounded-xl">
                <p className="text-sm text-muted-foreground italic font-serif">
                  &ldquo;{memory.slice(0, 100)}{memory.length > 100 ? "..." : ""}&rdquo;
                </p>
              </div>
            </div>
          )}

          {/* Navigation */}
          {step < 4 && (
            <div className="mt-8 flex items-center justify-between">
              {step > 1 ? (
                <Button
                  variant="ghost"
                  onClick={handleBack}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
              ) : (
                <div />
              )}

              <Button
                onClick={handleNext}
                disabled={!canProceed()}
                className="bg-primary hover:bg-primary/90 text-primary-foreground px-8"
              >
                {step === 3 ? "See Packages" : "Continue"}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
