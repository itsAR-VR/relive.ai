"use client"

import Image from "next/image"
import { useState, useEffect, useRef, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Sparkles, RotateCcw, Play, Loader2, Download, Monitor, Clock, ShieldCheck } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"

type PromptSuggestion = {
  label: string
  tone: string
  text: string
}

const promptSuggestions: PromptSuggestion[] = [
  {
    label: "Slow dance",
    tone: "Tender & steady",
    text: "They sway slowly together, hands clasped and eyes locked, breathing softly as the camera gently pushes in around them.",
  },
  {
    label: "Cinematic pan",
    tone: "Lifelike & airy",
    text: "Camera glides in a soft arc as they look toward each other, hair and clothing moving slightly in a light breeze, natural smiles forming.",
  },
  {
    label: "Playful laugh",
    tone: "Warm & candid",
    text: "They laugh and lean closer, shoulders brushing as they turn toward the camera, a small step forward bringing the moment to life.",
  },
]

const VIDEO_MODEL_ID = "wan/2-5-image-to-video"
const DEFAULT_NEGATIVE_PROMPT =
  "low quality, blurry, distorted, watermark, text, logo, extra limbs, malformed hands, oversaturated"
const EXPANDED_PROMPT =
  "Cinematic close-up as they slowly turn toward the camera with gentle breathing and lifelike eye movement, a soft breeze catching subtle details."
type StatusPayload = Record<string, any>

const extractResultUrl = (payload: StatusPayload) => {
  if (typeof payload?.result_url === "string") return payload.result_url
  if (typeof payload?.resultUrl === "string") return payload.resultUrl
  if (Array.isArray(payload?.resultUrls) && typeof payload.resultUrls[0] === "string") return payload.resultUrls[0]

  const rawResultJson = payload?.resultJson ?? payload?.result_json ?? payload?.result
  if (typeof rawResultJson === "string") {
    try {
      const parsed = JSON.parse(rawResultJson)
      if (Array.isArray(parsed?.resultUrls) && typeof parsed.resultUrls[0] === "string") {
        return parsed.resultUrls[0]
      }
    } catch {
      // ignore
    }
  } else if (rawResultJson && typeof rawResultJson === "object") {
    const urls = (rawResultJson as { resultUrls?: unknown }).resultUrls
    if (Array.isArray(urls) && typeof urls[0] === "string") {
      return urls[0]
    }
  }

  return null
}

const normalizeStatus = (payload: StatusPayload) => {
  const statusRaw =
    typeof payload?.status === "string"
      ? payload.status.toLowerCase()
      : typeof payload?.state === "string"
        ? payload.state.toLowerCase()
        : ""

  return {
    statusRaw,
    isCompleted: statusRaw === "completed" || statusRaw === "success",
    isFailed: statusRaw === "failed" || statusRaw === "fail",
    resultUrl: extractResultUrl(payload),
    errorMessage:
      (typeof payload?.error_message === "string" && payload.error_message) ||
      (typeof payload?.error === "string" && payload.error) ||
      (typeof payload?.failMsg === "string" && payload.failMsg) ||
      null,
  }
}

interface ReliveStepProps {
  enhancedImage: string
  onReset: () => void
}

export function ReliveStep({ enhancedImage, onReset }: ReliveStepProps) {
  const [prompt, setPrompt] = useState(promptSuggestions[0].text)
  const [duration, setDuration] = useState<"5" | "10">("5")
  const [resolution, setResolution] = useState<"720p" | "1080p">("720p")
  const [useNegativePrompt, setUseNegativePrompt] = useState(true)
  const [enablePromptExpansion, setEnablePromptExpansion] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [isExpandingPrompt, setIsExpandingPrompt] = useState(false)
  const [videoGenerated, setVideoGenerated] = useState(false)
  const [videoUrl, setVideoUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null)
  const generationIdRef = useRef<string | null>(null)
  const pollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const pollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const supabase = createClient()

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setIsLoggedIn(!!user)
    })
  }, [supabase.auth])

  const clearPolling = useCallback(() => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current)
      pollIntervalRef.current = null
    }
    if (pollTimeoutRef.current) {
      clearTimeout(pollTimeoutRef.current)
      pollTimeoutRef.current = null
    }
    generationIdRef.current = null
  }, [])

  useEffect(() => () => clearPolling(), [clearPolling])

  const handleExpandPrompt = async () => {
    setIsExpandingPrompt(true)
    await new Promise((resolve) => setTimeout(resolve, 1200))
    setPrompt(EXPANDED_PROMPT)
    setIsExpandingPrompt(false)
  }

  const handleGenerate = async () => {
    clearPolling()
    setIsGenerating(true)
    setError(null)
    setVideoGenerated(false)
    setVideoUrl(null)
    generationIdRef.current = null

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        const message = "Please sign in to generate your video."
        setError(message)
        toast.error(message)
        setIsGenerating(false)
        return
      }

      const trimmedPrompt = prompt.trim()
      const finalPrompt = trimmedPrompt || promptSuggestions[0].text
      const payload: Record<string, unknown> = {
        imageUrl: enhancedImage,
        prompt: finalPrompt,
        duration,
        resolution,
        model: VIDEO_MODEL_ID,
        enablePromptExpansion,
      }

      if (useNegativePrompt) {
        payload.negativePrompt = DEFAULT_NEGATIVE_PROMPT
      }

      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      const data = await response.json().catch(() => ({}))

      if (!response.ok) {
        const message =
          response.status === 402
            ? "Insufficient credits. Video generation requires 5 credits."
            : data.error || "Generation failed"
        setError(message)
        toast.error(message)
        setIsGenerating(false)
        return
      }

      if (!data?.generationId) {
        const message = "Missing generation ID from server."
        setError(message)
        toast.error(message)
        setIsGenerating(false)
        return
      }

      generationIdRef.current = data.generationId as string
      toast.success("Video generation started")

      const pollStatus = async () => {
        const jobId = generationIdRef.current
        if (!jobId) return

        try {
          const statusRes = await fetch(`/api/generate?id=${jobId}`)
          const statusData = await statusRes.json().catch(() => ({}))

          if (!statusRes.ok) {
            const message =
              statusRes.status === 401
                ? "Session expired. Please sign in again."
                : statusData.error || "Unable to check video status."
            throw new Error(message)
          }

          const normalized = normalizeStatus(statusData)

          if (normalized.isCompleted && normalized.resultUrl) {
            clearPolling()
            setVideoUrl(normalized.resultUrl)
            setVideoGenerated(true)
            setIsGenerating(false)
            toast.success("Video generated")
          } else if (normalized.isCompleted) {
            clearPolling()
            const message = "Video completed but no result received."
            setError(message)
            setIsGenerating(false)
            toast.error(message)
          } else if (normalized.isFailed) {
            clearPolling()
            const message = normalized.errorMessage || "Video generation failed"
            setError(message)
            setIsGenerating(false)
            toast.error(message)
          }
        } catch (statusError) {
          console.error("Video status check failed:", statusError)
          clearPolling()
          const message = statusError instanceof Error ? statusError.message : "Failed to check generation status."
          setError(message)
          setIsGenerating(false)
          toast.error(message)
        }
      }

      pollStatus()
      pollIntervalRef.current = setInterval(pollStatus, 3000)

      // Timeout after 3 minutes (video takes longer)
      pollTimeoutRef.current = setTimeout(() => {
        clearPolling()
        setError("Processing is taking longer than expected. Check your dashboard for the result.")
        setIsGenerating(false)
        toast.error("Processing is taking longer than expected. Check your dashboard for the result.")
      }, 180000)
    } catch (err) {
      console.error("Generate error:", err)
      clearPolling()
      setError("Failed to start generation. Please try again.")
      toast.error("Failed to start generation. Please try again.")
      setIsGenerating(false)
    }
  }

  const handleDownload = async () => {
    if (!videoUrl) return
    
    try {
      const response = await fetch(videoUrl)
      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = "relive-memory.mp4"
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (err) {
      console.error("Download failed:", err)
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={onReset}
          className="flex items-center gap-2 text-[#6b5e54] hover:text-[#3d3632] transition-colors"
        >
          <RotateCcw className="h-4 w-4" />
          <span className="text-sm">Start Over</span>
        </button>
        <div className="flex items-center gap-2">
          <h3 className="font-serif text-xl text-[#3d3632]">Bring This Moment to Life</h3>
          <span className="px-3 py-1 text-xs font-medium rounded-full bg-[#a67c52]/10 text-[#8a6642] border border-[#d4c9b8]">
            WAN 2.5 Video
          </span>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Enhanced Image Preview */}
        <div>
          <p className="text-sm font-medium text-[#6b5e54] mb-3">Your Enhanced Photo</p>
          <div className="relative aspect-[5/6] rounded-lg overflow-hidden bg-[#f5f1e6] border border-[#d4c9b8]">
            <Image
              src={enhancedImage || "/placeholder.svg"}
              alt="Enhanced photo ready for animation"
              fill
              sizes="100vw"
              className="object-cover"
            />
          </div>
        </div>

        {/* Video Result */}
        <div>
          <p className="text-sm font-medium text-[#6b5e54] mb-3">Living Memory</p>
          <div className="relative aspect-[5/6] rounded-lg overflow-hidden bg-[#3d3632] border border-[#d4c9b8]">
            {isGenerating ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div className="relative">
                  <div className="absolute inset-0 rounded-full bg-[#a67c52]/20 animate-ping" />
                  <Loader2 className="h-12 w-12 text-[#a67c52] animate-spin" />
                </div>
                <p className="text-[#f5f1e6] font-medium mt-6">Creating your living memory...</p>
                <p className="text-[#c4b8a8] text-sm mt-1">This usually takes 30-60 seconds</p>
              </div>
            ) : videoGenerated && videoUrl ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#2d2622]">
                {videoUrl.endsWith(".mp4") || videoUrl.includes("video") ? (
                  <video
                    src={videoUrl}
                    className="w-full h-full object-cover"
                    controls
                    autoPlay
                    loop
                    muted
                  />
                ) : (
                  <>
                    <Image
                      src={videoUrl}
                      alt="Generated video preview"
                      fill
                      sizes="100vw"
                      className="object-cover opacity-80"
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <button className="w-16 h-16 rounded-full bg-[#a67c52] flex items-center justify-center hover:bg-[#8a6642] transition-colors shadow-lg">
                        <Play className="h-8 w-8 text-[#f5f1e6] ml-1" />
                      </button>
                    </div>
                  </>
                )}
                <div className="absolute bottom-4 left-4 right-4 bg-[#3d3632]/90 rounded-lg p-3 flex items-center justify-between">
                  <div>
                    <p className="text-[#f5f1e6] text-sm font-medium">Your memory is alive!</p>
                    <p className="text-[#c4b8a8] text-xs mt-1">Click to play or download below</p>
                  </div>
                  <button
                    onClick={handleDownload}
                    className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
                  >
                    <Download className="h-4 w-4 text-white" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-[#8a7e72]">
                <Play className="h-12 w-12 mb-3 opacity-30" />
                <p className="text-sm text-[#c4b8a8]">Your video will appear here</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
          {error.includes("credits") && (
            <a href="/pricing" className="ml-2 underline font-medium">
              Buy Credits
            </a>
          )}
        </div>
      )}

      {/* Motion Prompt */}
      <div className="mt-8">
        <Label htmlFor="motion-prompt" className="text-[#3d3632] font-medium">
          Describe the Motion
        </Label>
        <p className="text-sm text-[#6b5e54] mt-1 mb-3">
          Tell us how you'd like this moment to come alive. What movement do you imagine?
        </p>
        <div className="relative">
          <textarea
            id="motion-prompt"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g., They slowly turn to face each other, smiling warmly as memories of their wedding day flood back..."
            className="w-full h-28 px-4 py-3 rounded-lg border border-[#d4c9b8] bg-white text-[#3d3632] placeholder:text-[#8a7e72] focus:outline-none focus:ring-2 focus:ring-[#a67c52]/50 resize-none"
            disabled={isGenerating || videoGenerated}
          />
          <button
            onClick={handleExpandPrompt}
            disabled={isExpandingPrompt || isGenerating || videoGenerated}
            className="absolute bottom-3 right-3 flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#f5f1e6] text-[#a67c52] text-sm font-medium hover:bg-[#a67c52]/10 transition-colors disabled:opacity-50"
          >
            {isExpandingPrompt ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Sparkles className="h-3.5 w-3.5" />
            )}
            AI Expand
          </button>
        </div>

        <div className="mt-3 flex flex-col gap-3 md:flex-row md:items-start">
          <div className="flex-1">
            <p className="text-xs font-semibold text-[#3d3632] uppercase tracking-wide">Prompt helper</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {promptSuggestions.map((suggestion) => (
                <button
                  key={suggestion.label}
                  onClick={() => setPrompt(suggestion.text)}
                  disabled={isGenerating || videoGenerated}
                  className={`
                    px-3 py-2 rounded-lg border text-left transition-all text-sm
                    ${prompt === suggestion.text ? "border-[#a67c52] bg-[#a67c52]/10" : "border-[#d4c9b8] hover:border-[#a67c52]/60"}
                    disabled:opacity-50
                  `}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-medium text-[#3d3632]">{suggestion.label}</span>
                    <span className="text-[11px] text-[#8a7e72]">{suggestion.tone}</span>
                  </div>
                  <p className="mt-1 text-xs text-[#6b5e54] leading-snug">{suggestion.text}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="md:w-64 bg-[#f5f1e6] border border-[#d4c9b8] rounded-lg p-3">
            <p className="text-xs font-semibold text-[#3d3632] uppercase tracking-wide mb-1">What we send</p>
            <p className="text-xs text-[#6b5e54] leading-relaxed">
              Prompt, duration ({duration}s), resolution ({resolution}), and model WAN 2.5 image-to-video.{" "}
              {useNegativePrompt ? "Quality guardrails are on via a negative prompt." : "No negative prompt applied."}{" "}
              {enablePromptExpansion ? "Prompt expansion is enabled." : "Prompt stays as written."}
            </p>
          </div>
        </div>

        {/* Login prompt for non-logged in users */}
        {isLoggedIn === false && (
          <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-sm">
            <strong>Sign in:</strong> Generate real videos and save your creations.{" "}
            <a href="/login" className="underline font-medium">Sign in</a>
          </div>
        )}
      </div>

      {/* Video Settings */}
      <div className="mt-6 grid md:grid-cols-3 gap-4">
        <div className="p-4 rounded-lg border border-[#d4c9b8] bg-[#f5f1e6]">
          <div className="flex items-center justify-between mb-3">
            <span className="flex items-center gap-2 text-[#3d3632] font-medium">
              <Clock className="h-4 w-4 text-[#a67c52]" />
              Duration
            </span>
            <span className="text-xs text-[#6b5e54]">5s or 10s</span>
          </div>
          <div className="flex gap-2">
            {(["5", "10"] as const).map((value) => {
              const isActive = duration === value
              return (
                <button
                  key={value}
                  onClick={() => setDuration(value)}
                  disabled={isGenerating || videoGenerated}
                  className={`
                    flex-1 px-3 py-2 rounded-lg border text-sm transition-all
                    ${isActive ? "border-[#a67c52] bg-[#a67c52]/10 text-[#3d3632]" : "border-[#d4c9b8] text-[#6b5e54] hover:border-[#a67c52]/60"}
                    disabled:opacity-50
                  `}
                >
                  {value}s
                </button>
              )
            })}
          </div>
        </div>

        <div className="p-4 rounded-lg border border-[#d4c9b8] bg-[#f5f1e6]">
          <div className="flex items-center justify-between mb-3">
            <span className="flex items-center gap-2 text-[#3d3632] font-medium">
              <Monitor className="h-4 w-4 text-[#a67c52]" />
              Resolution
            </span>
            <span className="text-xs text-[#6b5e54]">HD or Full HD</span>
          </div>
          <div className="flex gap-2">
            {(["720p", "1080p"] as const).map((value) => {
              const isActive = resolution === value
              return (
                <button
                  key={value}
                  onClick={() => setResolution(value)}
                  disabled={isGenerating || videoGenerated}
                  className={`
                    flex-1 px-3 py-2 rounded-lg border text-sm transition-all
                    ${isActive ? "border-[#a67c52] bg-[#a67c52]/10 text-[#3d3632]" : "border-[#d4c9b8] text-[#6b5e54] hover:border-[#a67c52]/60"}
                    disabled:opacity-50
                  `}
                >
                  {value}
                </button>
              )
            })}
          </div>
        </div>

        <div className="p-4 rounded-lg border border-[#d4c9b8] bg-[#f5f1e6] space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[#3d3632] font-medium">Negative prompt</p>
              <p className="text-xs text-[#6b5e54]">Filter artifacts & text</p>
            </div>
            <Switch
              checked={useNegativePrompt}
              onCheckedChange={setUseNegativePrompt}
              disabled={isGenerating || videoGenerated}
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[#3d3632] font-medium">AI prompt expansion</p>
              <p className="text-xs text-[#6b5e54]">Let WAN enhance wording</p>
            </div>
            <Switch
              checked={enablePromptExpansion}
              onCheckedChange={setEnablePromptExpansion}
              disabled={isGenerating || videoGenerated}
            />
          </div>
          <div className="flex items-center gap-2 text-xs text-[#6b5e54] bg-white/60 border border-[#d4c9b8] rounded-lg p-2">
            <ShieldCheck className="h-4 w-4 text-[#a67c52]" />
            <span>Model fixed to WAN 2.5 image-to-video for best motion quality.</span>
          </div>
        </div>
      </div>

      {/* Generate Button */}
      <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-end">
        {videoGenerated ? (
          <>
            <Button variant="outline" onClick={onReset} className="border-[#d4c9b8] text-[#3d3632] bg-transparent">
              Create Another
            </Button>
            <Button onClick={handleDownload} className="bg-[#a67c52] hover:bg-[#8a6642] text-[#f5f1e6]">
              <Download className="mr-2 h-4 w-4" />
              Download Video
            </Button>
          </>
        ) : (
          <Button
            onClick={handleGenerate}
            disabled={isGenerating || !prompt.trim()}
            className="bg-[#3d3632] hover:bg-[#2d2622] text-[#f5f1e6] px-8"
          >
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Bringing to Life...
              </>
            ) : (
              <>
                <Play className="mr-2 h-4 w-4" />
                Relive This Moment
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  )
}
