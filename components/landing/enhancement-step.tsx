"use client"

import Image from "next/image"
import { useState, useEffect, useRef, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Sparkles, ArrowLeft, ArrowRight, Loader2, Download } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"

type AspectRatioOption = "original" | "1:1" | "2:3" | "3:2" | "3:4" | "4:3" | "4:5" | "5:4" | "9:16" | "16:9" | "21:9"
type ResolutionOption = "1K" | "2K" | "4K"
type OutputFormatOption = "jpg" | "png"
type StatusPayload = Record<string, any>

const aspectRatioOptions: { value: AspectRatioOption; label: string }[] = [
  { value: "original", label: "Original" },
  { value: "1:1", label: "1:1" },
  { value: "2:3", label: "2:3" },
  { value: "3:2", label: "3:2" },
  { value: "3:4", label: "3:4" },
  { value: "4:3", label: "4:3" },
  { value: "4:5", label: "4:5" },
  { value: "5:4", label: "5:4" },
  { value: "9:16", label: "9:16" },
  { value: "16:9", label: "16:9" },
  { value: "21:9", label: "21:9" },
]

const resolutionOptions: ResolutionOption[] = ["1K", "2K", "4K"]
const outputFormatOptions: OutputFormatOption[] = ["jpg", "png"]

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
      // Ignore JSON parse errors; will fall back to null.
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

interface EnhancementStepProps {
  originalImage: string
  onEnhancementComplete: (enhancedUrl: string) => void
  onBack: () => void
}

export function EnhancementStep({ originalImage, onEnhancementComplete, onBack }: EnhancementStepProps) {
  const [faceRestoration, setFaceRestoration] = useState(true)
  const [colorCorrection, setColorCorrection] = useState(true)
  const [aspectRatio, setAspectRatio] = useState<AspectRatioOption>("original")
  const [resolution, setResolution] = useState<ResolutionOption>("1K")
  const [outputFormat, setOutputFormat] = useState<OutputFormatOption>("jpg")
  const [isProcessing, setIsProcessing] = useState(false)
  const [enhancedImage, setEnhancedImage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null)
  const generationIdRef = useRef<string | null>(null)
  const pollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const pollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const supabase = createClient()

  useEffect(() => {
    // Check if user is logged in
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

  const handleEnhance = async () => {
    clearPolling()
    setIsProcessing(true)
    setError(null)
    setEnhancedImage(null)
    generationIdRef.current = null

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        const message = "Please sign in to enhance your photo."
        setError(message)
        toast.error(message)
        setIsProcessing(false)
        return
      }

      const response = await fetch("/api/enhance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageUrl: originalImage,
          faceRestoration,
          colorCorrection,
          resolution,
          outputFormat,
          ...(aspectRatio !== "original" ? { aspectRatio } : {}),
        }),
      })

      const data = await response.json().catch(() => ({}))

      if (!response.ok) {
        const message =
          response.status === 402
            ? "Insufficient credits. Please purchase more credits to continue."
            : data.error || "Enhancement failed"
        setError(message)
        toast.error(message)
        setIsProcessing(false)
        return
      }

      if (!data?.generationId) {
        const message = "Missing generation ID from server."
        setError(message)
        toast.error(message)
        setIsProcessing(false)
        return
      }

      generationIdRef.current = data.generationId as string

      const pollStatus = async () => {
        const jobId = generationIdRef.current
        if (!jobId) return

        try {
          const statusRes = await fetch(`/api/enhance?id=${jobId}`)
          const statusData = await statusRes.json().catch(() => ({}))

          if (!statusRes.ok) {
            const message =
              statusRes.status === 401
                ? "Session expired. Please sign in again."
                : statusData.error || "Unable to check enhancement status."
            throw new Error(message)
          }

          const normalized = normalizeStatus(statusData)

          if (normalized.isCompleted && normalized.resultUrl) {
            clearPolling()
            setEnhancedImage(normalized.resultUrl)
            setIsProcessing(false)
            toast.success("Photo enhanced")
          } else if (normalized.isCompleted) {
            clearPolling()
            const message = "Enhancement completed but no result received."
            setError(message)
            setIsProcessing(false)
            toast.error(message)
          } else if (normalized.isFailed) {
            clearPolling()
            const message = normalized.errorMessage || "Enhancement failed"
            setError(message)
            setIsProcessing(false)
            toast.error(message)
          }
        } catch (statusError) {
          console.error("Enhancement status check failed:", statusError)
          clearPolling()
          const message =
            statusError instanceof Error ? statusError.message : "Failed to check enhancement status."
          setError(message)
          setIsProcessing(false)
          toast.error(message)
        }
      }

      pollStatus()
      pollIntervalRef.current = setInterval(pollStatus, 2000)

      // Timeout after 2 minutes
      pollTimeoutRef.current = setTimeout(() => {
        clearPolling()
        setError("Processing is taking longer than expected. Please check your dashboard.")
        setIsProcessing(false)
        toast.error("Processing is taking longer than expected. Please check your dashboard.")
      }, 120000)
    } catch (err) {
      console.error("Enhancement error:", err)
      clearPolling()
      setError("Failed to start enhancement. Please try again.")
      toast.error("Failed to start enhancement. Please try again.")
      setIsProcessing(false)
    }
  }

  const handleProceed = () => {
    if (enhancedImage) {
      onEnhancementComplete(enhancedImage)
    }
  }

  const handleDownload = async () => {
    if (!enhancedImage) return
    
    try {
      const response = await fetch(enhancedImage)
      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = "enhanced-photo.jpg"
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
          onClick={onBack}
          className="flex items-center gap-2 text-[#6b5e54] hover:text-[#3d3632] transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="text-sm">Back</span>
        </button>
        <div className="flex items-center gap-2 px-3 py-1 bg-[#a67c52]/10 rounded-full">
          <Sparkles className="h-4 w-4 text-[#a67c52]" />
          <span className="text-sm font-medium text-[#a67c52]">Nano Banana Pro</span>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Original Image */}
        <div>
          <p className="text-sm font-medium text-[#6b5e54] mb-3">Original Photo</p>
          <div className="relative aspect-[5/6] rounded-lg overflow-hidden bg-[#f5f1e6] border border-[#d4c9b8]">
            <Image
              src={originalImage || "/placeholder.svg"}
              alt="Original uploaded photo"
              fill
              sizes="100vw"
              className="object-cover"
            />
          </div>
        </div>

        {/* Enhanced Image / Processing */}
        <div>
          <p className="text-sm font-medium text-[#6b5e54] mb-3">Enhanced Photo</p>
          <div className="relative aspect-[5/6] rounded-lg overflow-hidden bg-[#f5f1e6] border border-[#d4c9b8]">
            {isProcessing ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#3d3632]/90">
                <Loader2 className="h-10 w-10 text-[#a67c52] animate-spin mb-4" />
                <p className="text-[#f5f1e6] font-medium">Enhancing your photo...</p>
                <p className="text-[#c4b8a8] text-sm mt-1">Restoring faces & colors</p>
              </div>
            ) : enhancedImage ? (
              <>
                <Image
                  src={enhancedImage || "/placeholder.svg"}
                  alt="Enhanced photo"
                  fill
                  sizes="100vw"
                  className="object-cover"
                />
                <button
                  onClick={handleDownload}
                  className="absolute bottom-3 right-3 p-2 bg-black/50 hover:bg-black/70 rounded-full text-white transition-colors"
                  title="Download"
                >
                  <Download className="h-4 w-4" />
                </button>
              </>
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-[#8a7e72]">
                <Sparkles className="h-10 w-10 mb-3 opacity-30" />
                <p className="text-sm">Configure options and enhance</p>
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

      {/* Enhancement Options */}
      <div className="mt-8 p-6 bg-[#f5f1e6] rounded-xl">
        <h4 className="font-medium text-[#3d3632] mb-4">Enhancement Options</h4>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="face-restoration" className="text-[#3d3632] font-medium">
                Face Restoration
              </Label>
              <p className="text-sm text-[#6b5e54]">Recover facial details and expressions</p>
            </div>
            <Switch
              id="face-restoration"
              checked={faceRestoration}
              onCheckedChange={setFaceRestoration}
              disabled={isProcessing || !!enhancedImage}
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="color-correction" className="text-[#3d3632] font-medium">
                Color Restoration
              </Label>
              <p className="text-sm text-[#6b5e54]">Add natural colors to black & white photos</p>
            </div>
            <Switch
              id="color-correction"
              checked={colorCorrection}
              onCheckedChange={setColorCorrection}
              disabled={isProcessing || !!enhancedImage}
            />
          </div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label className="text-[#3d3632] font-medium">Aspect Ratio (optional)</Label>
              <span className="text-xs text-[#6b5e54]">Defaults to your upload</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
              {aspectRatioOptions.map((option) => {
                const isActive = aspectRatio === option.value
                return (
                  <button
                    key={option.value}
                    onClick={() => setAspectRatio(option.value)}
                    disabled={isProcessing || !!enhancedImage}
                    className={`
                      px-3 py-2 rounded-lg border text-sm transition-all
                      ${isActive ? "border-[#a67c52] bg-[#a67c52]/10 text-[#3d3632]" : "border-[#d4c9b8] text-[#6b5e54] hover:border-[#a67c52]/60"}
                      disabled:opacity-50
                    `}
                  >
                    {option.label}
                  </button>
                )
              })}
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label className="text-[#3d3632] font-medium">Resolution</Label>
                <span className="text-xs text-[#6b5e54]">Higher uses more time</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {resolutionOptions.map((option) => {
                  const isActive = resolution === option
                  return (
                    <button
                      key={option}
                      onClick={() => setResolution(option)}
                      disabled={isProcessing || !!enhancedImage}
                      className={`
                        px-3 py-2 rounded-lg border text-sm transition-all
                        ${isActive ? "border-[#a67c52] bg-[#a67c52]/10 text-[#3d3632]" : "border-[#d4c9b8] text-[#6b5e54] hover:border-[#a67c52]/60"}
                        disabled:opacity-50
                      `}
                    >
                      {option}
                    </button>
                  )
                })}
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label className="text-[#3d3632] font-medium">Output Format</Label>
                <span className="text-xs text-[#6b5e54]">Great for downloads</span>
              </div>
              <div className="flex gap-2">
                {outputFormatOptions.map((format) => {
                  const isActive = outputFormat === format
                  return (
                    <button
                      key={format}
                      onClick={() => setOutputFormat(format)}
                      disabled={isProcessing || !!enhancedImage}
                      className={`
                        px-3 py-2 rounded-lg border text-sm transition-all capitalize
                        ${isActive ? "border-[#a67c52] bg-[#a67c52]/10 text-[#3d3632]" : "border-[#d4c9b8] text-[#6b5e54] hover:border-[#a67c52]/60"}
                        disabled:opacity-50
                      `}
                    >
                      {format}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Login prompt for non-logged in users */}
        {isLoggedIn === false && (
          <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-sm">
            <strong>Sign in:</strong> Use real AI processing and save your enhancements.{" "}
            <a href="/login" className="underline font-medium">Sign in</a>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-end">
        {!enhancedImage ? (
          <Button
            onClick={handleEnhance}
            disabled={isProcessing}
            className="bg-[#a67c52] hover:bg-[#8a6642] text-[#f5f1e6] px-8"
          >
            {isProcessing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Enhancing...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Enhance Photo
              </>
            )}
          </Button>
        ) : (
          <Button onClick={handleProceed} className="bg-[#3d3632] hover:bg-[#2d2622] text-[#f5f1e6] px-8">
            Continue to Relive
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  )
}
