"use client"

import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { 
  ArrowRight, 
  ArrowLeft, 
  Mic, 
  MicOff,
  Sun, 
  Cloud, 
  Snowflake,
  Image as ImageIcon,
  Check,
  Loader2
} from "lucide-react"

interface DirectorInterviewFormProps {
  orderId: string
  initialQuizData?: { honoree?: string; who?: string; memory?: string; vibe?: string } | null
}

type FormData = {
  honoree: string
  scene: string
  weather: string
  smell: string
  sounds: string
  anchorObject: string
  photoFile: File | null
  photoPreview: string | null
  audioFile: File | null
  style: "super8" | "painting" | "dreamhaze" | null
}

const WEATHER_OPTIONS = [
  { id: "golden", label: "Golden Hour", description: "Warm, late afternoon light", icon: Sun },
  { id: "overcast", label: "Overcast", description: "Soft, diffused daylight", icon: Cloud },
  { id: "rainy", label: "Rainy Day", description: "Moody, atmospheric", icon: Cloud },
  { id: "snowy", label: "Snowy", description: "Bright, winter wonderland", icon: Snowflake },
]

const STYLE_OPTIONS = [
  { 
    id: "super8" as const, 
    name: "Super 8 Film", 
    description: "Grainy, warm, vintage home movie feel. The most nostalgic option.",
    thumbnail: "/vintage-sepia-old-wedding-photograph-1950s-couple.jpg"
  },
  { 
    id: "painting" as const, 
    name: "Moving Painting", 
    description: "Soft, watercolor style. Dreamy and artistic.",
    thumbnail: "/family-portrait-multiple-generations-together-livi.jpg"
  },
  { 
    id: "dreamhaze" as const, 
    name: "Dream Haze", 
    description: "Soft focus, ethereal light. Like how memories actually feel.",
    thumbnail: "/restored-colorized-vintage-wedding-photograph-high.jpg"
  },
]

export function DirectorInterviewForm({ orderId, initialQuizData }: DirectorInterviewFormProps) {
  const [step, setStep] = useState(1)
  const [isRecording, setIsRecording] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isComplete, setIsComplete] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [draftLoaded, setDraftLoaded] = useState(false)
  const [draftData, setDraftData] = useState<{ who?: string; memory?: string; vibe?: string } | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])

  const [formData, setFormData] = useState<FormData>({
    honoree: "",
    scene: "",
    weather: "",
    smell: "",
    sounds: "",
    anchorObject: "",
    photoFile: null,
    photoPreview: null,
    audioFile: null,
    style: null,
  })

  const updateField = <K extends keyof FormData>(field: K, value: FormData[K]) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  // Prefill from props (initialQuizData from database) or localStorage draft
  useEffect(() => {
    const vibeStyleMap: Record<string, FormData["style"]> = {
      nostalgic: "super8",
      joyful: "painting",
      peace: "dreamhaze",
      tears: "super8",
    }

    // Priority 1: Use initialQuizData from props (from database)
    if (initialQuizData) {
      const parsed = initialQuizData
      setDraftData(parsed)
      setFormData((prev) => ({
        ...prev,
        honoree: parsed.honoree || parsed.who || prev.honoree,
        scene:
          prev.scene ||
          (parsed.memory
            ? `I want to relive a ${parsed.memory} memory. Specifically...`
            : prev.scene),
        style: prev.style || (parsed.vibe ? vibeStyleMap[parsed.vibe] || prev.style : prev.style),
      }))
      setDraftLoaded(Boolean(parsed.honoree || parsed.who || parsed.memory || parsed.vibe))
      return
    }

    // Priority 2: Fallback to localStorage draft
    try {
      const stored = localStorage.getItem("gifter_draft")
      if (stored) {
        const parsed = JSON.parse(stored) as { who?: string; memory?: string; vibe?: string }

        setDraftData(parsed)
        setFormData((prev) => ({
          ...prev,
          honoree: parsed.who || prev.honoree,
          scene:
            prev.scene ||
            (parsed.memory
              ? `I want to relive a ${parsed.memory} memory. Specifically...`
              : prev.scene),
          style: prev.style || (parsed.vibe ? vibeStyleMap[parsed.vibe] || prev.style : prev.style),
        }))

        setDraftLoaded(Boolean(parsed.who || parsed.memory || parsed.vibe))
      }
    } catch {
      // ignore parse errors
    }
  }, [initialQuizData])

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      updateField("photoFile", file)
      const reader = new FileReader()
      reader.onloadend = () => {
        updateField("photoPreview", reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      audioChunksRef.current = []

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data)
      }

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" })
        const audioFile = new File([audioBlob], "voice-note.webm", { type: "audio/webm" })
        updateField("audioFile", audioFile)
        stream.getTracks().forEach((track) => track.stop())
      }

      mediaRecorder.start()
      setIsRecording(true)
    } catch (error) {
      console.error("Error accessing microphone:", error)
      alert("Could not access microphone. Please check your permissions.")
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
    }
  }

  const handleSubmit = async () => {
    setError(null)

    if (!orderId) {
      setError("Missing order ID. Please return from Stripe and try again.")
      return
    }

    setIsSubmitting(true)

    try {
      const payload = new FormData()
      payload.append("order_id", orderId)

      const quizData = {
        honoree: formData.honoree || draftData?.who || "",
        memory: draftData?.memory || "",
        vibe: draftData?.vibe || "",
      }
      payload.append("quiz_data", JSON.stringify(quizData))

      const interviewData = {
        scene: formData.scene,
        weather: formData.weather,
        smell: formData.smell,
        sounds: formData.sounds,
        anchor_object: formData.anchorObject,
        style: formData.style,
        honoree: formData.honoree,
      }
      payload.append("interview_data", JSON.stringify(interviewData))

      if (formData.photoFile) {
        payload.append("reference_photo", formData.photoFile)
      }
      if (formData.audioFile) {
        payload.append("audio_note", formData.audioFile)
      }

      const response = await fetch("/api/intake", {
        method: "POST",
        body: payload,
      })

      if (!response.ok) {
        const data = await response.json().catch(() => ({}))
        throw new Error(data.error || "Failed to submit interview")
      }

      try {
        localStorage.removeItem("gifter_draft")
      } catch {
        // ignore
      }

      setIsComplete(true)
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to submit interview"
      setError(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const canProceed = () => {
    switch (step) {
      case 1:
        return formData.scene.trim().length > 20 && formData.honoree.trim().length > 0
      case 2:
        return formData.weather && formData.anchorObject.trim().length > 3
      case 3:
        return formData.photoFile !== null
      case 4:
        return formData.style !== null
      default:
        return false
    }
  }

  if (isComplete) {
    return (
      <div className="text-center py-16 animate-fade-in-slow">
        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-100 flex items-center justify-center">
          <Check className="w-10 h-10 text-green-600" />
        </div>
        <h2 className="font-serif text-3xl text-foreground mb-4">
          Production Has Begun
        </h2>
        <p className="text-muted-foreground max-w-md mx-auto mb-8">
          Our directors are now crafting your memory. You&apos;ll receive your &ldquo;Digital Ticket&rdquo; 
          within 24 hours, along with a link to the private viewing page.
        </p>
        <div className="p-6 bg-muted/50 rounded-2xl max-w-sm mx-auto">
          <p className="text-sm text-muted-foreground mb-2">What happens next:</p>
          <ul className="text-left text-sm space-y-2">
            <li className="flex items-start gap-2">
              <span className="text-primary">1.</span>
              <span>We generate 20+ versions of your memory</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">2.</span>
              <span>Our directors select the most emotionally impactful one</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">3.</span>
              <span>We add sound design and your personal touches</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">4.</span>
              <span>You receive a private viewing page to share</span>
            </li>
          </ul>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      {draftLoaded && (
        <div className="mb-6 rounded-xl border border-primary/30 bg-primary/10 text-primary px-4 py-3 text-sm">
          We&apos;ve loaded your story draft. Please add the details below.
        </div>
      )}

      {/* Progress */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-muted-foreground">Step {step} of 4</span>
          <span className="text-sm text-muted-foreground">{Math.round((step / 4) * 100)}% Complete</span>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div 
            className="h-full bg-primary transition-all duration-500"
            style={{ width: `${(step / 4) * 100}%` }}
          />
        </div>
      </div>

      {/* Step 1: The Scene */}
      {step === 1 && (
        <div className="animate-fade-in-slow">
        <h2 className="font-serif text-2xl md:text-3xl text-foreground mb-2">
          Describe the Moment
        </h2>
        <p className="text-muted-foreground mb-8">
          The more details you give us, the more real it will feel. Take your time.
        </p>

        <label className="block mb-6">
          <span className="text-sm font-medium text-foreground mb-2 block">
            Who is this gift for?
          </span>
          <input
            type="text"
            value={formData.honoree}
            onChange={(e) => updateField("honoree", e.target.value)}
            placeholder="e.g., Mom, Grandpa Joe, Aunt Lisa"
            className="w-full p-3 rounded-xl border-2 border-border bg-card text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
          />
        </label>

        <label className="block mb-6">
          <span className="text-sm font-medium text-foreground mb-2 block">
            What was happening in this memory?
          </span>
          <textarea
              value={formData.scene}
              onChange={(e) => updateField("scene", e.target.value)}
              placeholder="Describe the scene in detail. Who was there? What were they doing? What year was it? Be as specific as possible..."
              className="w-full h-48 p-4 rounded-xl border-2 border-border bg-card text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all resize-none"
            />
            <span className="text-xs text-muted-foreground mt-1 block">
              {formData.scene.length < 20 
                ? `At least ${20 - formData.scene.length} more characters needed` 
                : "Great level of detail!"}
            </span>
          </label>
        </div>
      )}

      {/* Step 2: The Senses */}
      {step === 2 && (
        <div className="animate-fade-in-slow">
          <h2 className="font-serif text-2xl md:text-3xl text-foreground mb-2">
            The Sensory Details
          </h2>
          <p className="text-muted-foreground mb-8">
            These details help us craft the atmosphere. They&apos;re the difference between a video and a memory.
          </p>

          {/* Weather/Lighting */}
          <div className="mb-6">
            <span className="text-sm font-medium text-foreground mb-3 block">
              What was the lighting like?
            </span>
            <div className="grid grid-cols-2 gap-3">
              {WEATHER_OPTIONS.map((option) => {
                const Icon = option.icon
                return (
                  <button
                    key={option.id}
                    onClick={() => updateField("weather", option.id)}
                    className={`p-4 rounded-xl border-2 text-left transition-all ${
                      formData.weather === option.id
                        ? "border-primary bg-primary/10"
                        : "border-border bg-card hover:border-primary/50"
                    }`}
                  >
                    <Icon className={`w-5 h-5 mb-2 ${formData.weather === option.id ? "text-primary" : "text-muted-foreground"}`} />
                    <span className="block font-medium text-foreground">{option.label}</span>
                    <span className="block text-xs text-muted-foreground">{option.description}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Smells */}
          <label className="block mb-6">
            <span className="text-sm font-medium text-foreground mb-2 block">
              What did it smell like? (Optional)
            </span>
            <input
              type="text"
              value={formData.smell}
              onChange={(e) => updateField("smell", e.target.value)}
              placeholder="e.g., Fresh bread, wet pavement, pine trees, grandmother's perfume..."
              className="w-full p-4 rounded-xl border-2 border-border bg-card text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
            />
          </label>

          {/* Sounds */}
          <label className="block mb-6">
            <span className="text-sm font-medium text-foreground mb-2 block">
              What sounds were present? (Optional)
            </span>
            <input
              type="text"
              value={formData.sounds}
              onChange={(e) => updateField("sounds", e.target.value)}
              placeholder="e.g., Traffic, birds chirping, children laughing, ocean waves..."
              className="w-full p-4 rounded-xl border-2 border-border bg-card text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
            />
          </label>

          {/* Anchor Object */}
          <label className="block">
            <span className="text-sm font-medium text-foreground mb-2 block">
              The &ldquo;Anchor&rdquo; Object <span className="text-primary">*</span>
            </span>
            <p className="text-xs text-muted-foreground mb-2">
              One specific detail we MUST include. This is what will make them say &ldquo;How did you know?&rdquo;
            </p>
            <input
              type="text"
              value={formData.anchorObject}
              onChange={(e) => updateField("anchorObject", e.target.value)}
              placeholder="e.g., The red tricycle, the blue dress, the wooden porch swing..."
              className="w-full p-4 rounded-xl border-2 border-border bg-card text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
            />
          </label>
        </div>
      )}

      {/* Step 3: Uploads */}
      {step === 3 && (
        <div className="animate-fade-in-slow">
          <h2 className="font-serif text-2xl md:text-3xl text-foreground mb-2">
            Reference Materials
          </h2>
          <p className="text-muted-foreground mb-8">
            Upload a photo for reference and optionally record a personal message.
          </p>

          {/* Photo Upload */}
          <div className="mb-8">
            <span className="text-sm font-medium text-foreground mb-3 block">
              Reference Photo <span className="text-primary">*</span>
            </span>
            <p className="text-xs text-muted-foreground mb-3">
              Upload a photo of the person or location we&apos;re recreating.
            </p>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handlePhotoUpload}
              className="hidden"
            />

            {formData.photoPreview ? (
              <div className="relative rounded-xl overflow-hidden border-2 border-primary">
                <img 
                  src={formData.photoPreview} 
                  alt="Reference" 
                  className="w-full h-64 object-cover"
                />
                <button
                  onClick={() => {
                    updateField("photoFile", null)
                    updateField("photoPreview", null)
                  }}
                  className="absolute top-3 right-3 px-3 py-1 bg-foreground/80 text-background text-sm rounded-lg hover:bg-foreground transition-colors"
                >
                  Remove
                </button>
              </div>
            ) : (
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full h-48 rounded-xl border-2 border-dashed border-border hover:border-primary/50 bg-muted/30 flex flex-col items-center justify-center transition-all group"
              >
                <ImageIcon className="w-10 h-10 text-muted-foreground mb-3 group-hover:text-primary transition-colors" />
                <span className="text-muted-foreground group-hover:text-foreground transition-colors">
                  Click to upload a photo
                </span>
                <span className="text-xs text-muted-foreground mt-1">
                  JPG, PNG up to 10MB
                </span>
              </button>
            )}
          </div>

          {/* Voice Note */}
          <div>
            <span className="text-sm font-medium text-foreground mb-3 block">
              Voice Note (Optional)
            </span>
            <p className="text-xs text-muted-foreground mb-3">
              Record a personal message that will play before the memory. e.g., &ldquo;Happy 90th, Grandpa...&rdquo;
            </p>

            <div className="p-6 rounded-xl border-2 border-border bg-card">
              {formData.audioFile ? (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                      <Check className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <span className="block font-medium text-foreground">Voice note recorded</span>
                      <span className="text-xs text-muted-foreground">Ready to include</span>
                    </div>
                  </div>
                  <button
                    onClick={() => updateField("audioFile", null)}
                    className="text-sm text-muted-foreground hover:text-foreground"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <div className="text-center">
                  <button
                    onClick={isRecording ? stopRecording : startRecording}
                    className={`w-16 h-16 rounded-full flex items-center justify-center transition-all mx-auto mb-3 ${
                      isRecording 
                        ? "bg-red-500 hover:bg-red-600 animate-pulse" 
                        : "bg-primary hover:bg-primary/90"
                    }`}
                  >
                    {isRecording ? (
                      <MicOff className="w-7 h-7 text-white" />
                    ) : (
                      <Mic className="w-7 h-7 text-primary-foreground" />
                    )}
                  </button>
                  <span className="text-sm text-muted-foreground">
                    {isRecording ? "Tap to stop recording" : "Tap to start recording"}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Step 4: Style Selection */}
      {step === 4 && (
        <div className="animate-fade-in-slow">
          <h2 className="font-serif text-2xl md:text-3xl text-foreground mb-2">
            Choose Your Style
          </h2>
          <p className="text-muted-foreground mb-8">
            Each style creates a different emotional atmosphere. All hide AI imperfections beautifully.
          </p>

          <div className="space-y-4">
            {STYLE_OPTIONS.map((style) => (
              <button
                key={style.id}
                onClick={() => updateField("style", style.id)}
                className={`w-full p-4 rounded-xl border-2 text-left transition-all flex gap-4 items-center ${
                  formData.style === style.id
                    ? "border-primary bg-primary/10"
                    : "border-border bg-card hover:border-primary/50"
                }`}
              >
                <img 
                  src={style.thumbnail} 
                  alt={style.name}
                  className="w-20 h-20 rounded-lg object-cover flex-shrink-0"
                />
                <div>
                  <span className={`block font-serif text-lg ${formData.style === style.id ? "text-primary" : "text-foreground"}`}>
                    {style.name}
                  </span>
                  <span className="block text-sm text-muted-foreground mt-1">
                    {style.description}
                  </span>
                </div>
                {formData.style === style.id && (
                  <Check className="w-6 h-6 text-primary flex-shrink-0 ml-auto" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {error && (
        <div className="mt-4 rounded-lg border border-destructive/40 bg-destructive/10 text-destructive px-4 py-3 text-sm">
          {error}
        </div>
      )}

      {/* Navigation */}
      <div className="mt-10 flex items-center justify-between">
        {step > 1 ? (
          <Button
            variant="ghost"
            onClick={() => setStep(step - 1)}
            className="text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        ) : (
          <div />
        )}

        {step < 4 ? (
          <Button
            onClick={() => setStep(step + 1)}
            disabled={!canProceed()}
            className="bg-primary hover:bg-primary/90 text-primary-foreground px-8"
          >
            Continue
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        ) : (
          <Button
            onClick={handleSubmit}
            disabled={!canProceed() || isSubmitting}
            className="bg-primary hover:bg-primary/90 text-primary-foreground px-8"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                Begin Production
                <ArrowRight className="w-4 h-4 ml-2" />
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  )
}
