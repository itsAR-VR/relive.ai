"use client"

import Image from "next/image"
import type React from "react"
import { useCallback, useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Upload, Snowflake, Sparkles, Trees as Tree, Gift, Star, Loader2, Download, Play } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

type ChristmasFilter = "snow" | "lights" | "santa-hat" | "wreath" | "ornaments"

const christmasFilters: { id: ChristmasFilter; label: string; icon: React.ElementType }[] = [
  { id: "snow", label: "Falling Snow", icon: Snowflake },
  { id: "lights", label: "Fairy Lights", icon: Sparkles },
  { id: "santa-hat", label: "Santa Hats", icon: Gift },
  { id: "wreath", label: "Holiday Wreath", icon: Tree },
  { id: "ornaments", label: "Ornaments", icon: Star },
]

const filterPromptMap: Record<ChristmasFilter, string> = {
  snow: "soft falling snow and frosted edges",
  lights: "warm golden fairy lights glowing in the background",
  "santa-hat": "tasteful santa hats and cozy scarves",
  wreath: "evergreen wreaths and pine garlands",
  ornaments: "sparkling ornaments and gentle bokeh highlights",
}

const VIDEO_MODEL_ID = "wan/2-5-image-to-video"
const DEFAULT_NEGATIVE_PROMPT =
  "low quality, blurry, distorted, watermark, text, logo, extra limbs, malformed hands, oversaturated"
const CHRISTMAS_VIDEO_DURATION: "5" = "5"
const CHRISTMAS_VIDEO_RESOLUTION: "720p" = "720p"
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
      // ignore parse errors
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

export function ChristmasMode() {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)
  const [selectedFilters, setSelectedFilters] = useState<ChristmasFilter[]>(["snow", "lights"])
  const [isProcessing, setIsProcessing] = useState(false)
  const [resultUrl, setResultUrl] = useState<string | null>(null)
  const [resultType, setResultType] = useState<"image" | "video">("image")
  const [animateResult, setAnimateResult] = useState(true)
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null)
  const [generationId, setGenerationId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const supabase = createClient()
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

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
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
  }, [])

  useEffect(() => {
    return () => clearPolling()
  }, [clearPolling])

  const buildFestivePrompt = () => {
    const decorations = selectedFilters.map((filter) => filterPromptMap[filter]).join(", ")
    const basePrompt = "tasteful christmas decorations, cozy holiday lighting, cinematic depth of field"
    const prompt = decorations ? `${basePrompt}, ${decorations}` : basePrompt
    return animateResult ? `${prompt}, softly animated snowfall and twinkling lights` : prompt
  }

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (file) {
        const reader = new FileReader()
        reader.onload = (event) => {
          if (event.target?.result) {
            clearPolling()
            setUploadedImage(event.target.result as string)
            setResultUrl(null)
            setError(null)
            setGenerationId(null)
            setResultType(animateResult ? "video" : "image")
          }
        }
        reader.readAsDataURL(file)
      }
    },
    [animateResult, clearPolling],
  )

  const toggleFilter = (filterId: ChristmasFilter) => {
    setSelectedFilters((prev) => (prev.includes(filterId) ? prev.filter((f) => f !== filterId) : [...prev, filterId]))
    setResultUrl(null)
    setError(null)
  }

  const startPolling = (endpoint: "/api/enhance" | "/api/generate", id: string) => {
    const pollUrl = `${endpoint}?id=${id}`
    const intervalMs = endpoint === "/api/generate" ? 3000 : 2000
    const timeoutMs = endpoint === "/api/generate" ? 180000 : 120000

    pollIntervalRef.current = setInterval(async () => {
      try {
        const statusRes = await fetch(pollUrl)
        const statusData = await statusRes.json().catch(() => ({}))

        if (!statusRes.ok) {
          throw new Error(statusData.error || "Unable to check status")
        }

        const normalized = normalizeStatus(statusData)

        if (normalized.isCompleted && normalized.resultUrl) {
          clearPolling()
          setResultUrl(normalized.resultUrl)
          setIsProcessing(false)
        } else if (normalized.isCompleted) {
          clearPolling()
          setError("Processing completed but no result was returned.")
          setIsProcessing(false)
        } else if (normalized.isFailed) {
          clearPolling()
          setError(normalized.errorMessage || "Processing failed")
          setIsProcessing(false)
        }
      } catch (err) {
        console.error("Christmas polling error:", err)
        clearPolling()
        setError("Unable to check status. Please check your dashboard for updates.")
        setIsProcessing(false)
      }
    }, intervalMs)

    timeoutRef.current = setTimeout(() => {
      clearPolling()
      setError("Processing is taking longer than expected. Check your dashboard for updates.")
      setIsProcessing(false)
    }, timeoutMs)
  }

  const handleApplyFilters = async () => {
    if (!uploadedImage) return

    clearPolling()
    setIsProcessing(true)
    setError(null)
    setResultUrl(null)

    const {
      data: { user },
    } = await supabase.auth.getUser()

    const festivePrompt = buildFestivePrompt()

    if (!user) {
      await new Promise((resolve) => setTimeout(resolve, animateResult ? 3500 : 2200))
      setResultType(animateResult ? "video" : "image")
      setResultUrl(
        animateResult
          ? "/animated-vintage-wedding-couple-dancing-motion-blu.jpg"
          : "/family-photo-with-christmas-decorations-snow-falli.jpg",
      )
      setIsProcessing(false)
      return
    }

    const endpoint: "/api/enhance" | "/api/generate" = animateResult ? "/api/generate" : "/api/enhance"
    const body = animateResult
      ? {
          imageUrl: uploadedImage,
          prompt: festivePrompt,
          duration: CHRISTMAS_VIDEO_DURATION,
          resolution: CHRISTMAS_VIDEO_RESOLUTION,
          model: VIDEO_MODEL_ID,
          negativePrompt: DEFAULT_NEGATIVE_PROMPT,
          enablePromptExpansion: true,
          mode: "christmas",
          filters: selectedFilters,
        }
      : {
          imageUrl: uploadedImage,
          faceRestoration: true,
          colorCorrection: true,
          resolution: "1K",
          outputFormat: "jpg",
          mode: "christmas",
          filters: selectedFilters,
        }

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })

      const data = await response.json()

      if (!response.ok) {
        if (response.status === 402) {
          setError(
            animateResult
              ? "Insufficient credits. Christmas videos use 5 credits."
              : "Insufficient credits. Christmas edits use 1 credit.",
          )
        } else {
          setError(data.error || "Christmas magic failed")
        }
        setIsProcessing(false)
        return
      }

      if (!data?.generationId) {
        setError("Missing job ID from server.")
        setIsProcessing(false)
        return
      }

      setGenerationId(data.generationId)
      setResultType(animateResult ? "video" : "image")
      startPolling(endpoint, data.generationId)
    } catch (err) {
      console.error("Christmas apply error:", err)
      setError("Failed to start processing. Please try again.")
      setIsProcessing(false)
    }
  }

  const handleReset = () => {
    clearPolling()
    setUploadedImage(null)
    setResultUrl(null)
    setSelectedFilters(["snow", "lights"])
    setAnimateResult(true)
    setGenerationId(null)
    setError(null)
    setIsProcessing(false)
    setResultType("image")
  }

  const handleDownload = async () => {
    if (!resultUrl) return

    try {
      const response = await fetch(resultUrl)
      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = resultType === "video" ? "relive-christmas.mp4" : "relive-christmas.jpg"
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (err) {
      console.error("Download failed:", err)
    }
  }

  const isVideoPreview = resultType === "video" && !!resultUrl
  const isVideoFile = !!(resultUrl && (resultUrl.toLowerCase().endsWith(".mp4") || resultUrl.includes("video")))

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2 px-3 py-1.5 bg-red-50 rounded-full border border-red-100">
          <Snowflake className="h-4 w-4 text-red-500" />
          <span className="text-sm font-medium text-red-700">Christmas Mode</span>
        </div>
        {uploadedImage && (
          <button onClick={handleReset} className="text-sm text-[#6b5e54] hover:text-[#3d3632]">
            Start Over
          </button>
        )}
      </div>

      {!uploadedImage ? (
        <div className="text-center">
          <div className="relative border-2 border-dashed border-red-200 rounded-xl p-12 md:p-16 transition-all cursor-pointer hover:border-red-300 hover:bg-red-50/30">
            <input
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mb-6">
                <Upload className="h-8 w-8 text-red-500" />
              </div>
              <h3 className="font-serif text-xl text-[#3d3632] mb-2">Upload a Photo to Make Festive</h3>
              <p className="text-[#6b5e54] mb-4 max-w-sm">
                Any photo works great! Family portraits, selfies, pet photos — we'll add the holiday magic.
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                {["snow", "lights", "hats", "wreaths"].map((item) => (
                  <span key={item} className="px-3 py-1 bg-red-50 text-red-600 text-xs rounded-full">
                    + {item}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div>
          <div className="grid md:grid-cols-2 gap-8">
            {/* Original Image */}
            <div>
              <p className="text-sm font-medium text-[#6b5e54] mb-3">Original Photo</p>
              <div className="relative aspect-[4/5] rounded-lg overflow-hidden bg-[#f5f1e6] border border-[#d4c9b8]">
                <Image
                  src={uploadedImage || "/placeholder.svg"}
                  alt="Original upload"
                  fill
                  sizes="100vw"
                  className="object-cover"
                />
              </div>
            </div>

            {/* Result */}
            <div>
              <p className="text-sm font-medium text-[#6b5e54] mb-3">Festive Result</p>
              <div className="relative aspect-[4/5] rounded-lg overflow-hidden bg-[#f5f1e6] border border-[#d4c9b8]">
                {isProcessing ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-red-900/90">
                    <Loader2 className="h-10 w-10 text-white animate-spin mb-4" />
                    <p className="text-white font-medium">
                      {animateResult ? "Animating your holiday scene..." : "Adding holiday magic..."}
                    </p>
                    <p className="text-red-200 text-sm mt-1">
                      {animateResult ? "Twinkling lights & falling snow" : "Applying selected decorations"}
                    </p>
                  </div>
                ) : resultUrl ? (
                  resultType === "video" ? (
                    isVideoFile ? (
                      <video
                        src={resultUrl}
                        className="w-full h-full object-cover"
                        autoPlay
                        loop
                        muted
                        controls
                      />
                    ) : (
                      <>
                        <Image
                          src={resultUrl || "/placeholder.svg"}
                          alt="Festive video preview"
                          fill
                          sizes="100vw"
                          className="object-cover"
                        />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                          <div className="w-14 h-14 rounded-full bg-red-600 flex items-center justify-center shadow-lg">
                            <Play className="h-7 w-7 text-white ml-1" />
                          </div>
                        </div>
                      </>
                    )
                  ) : (
                    <Image
                      src={resultUrl || "/placeholder.svg"}
                      alt="Festive result"
                      fill
                      sizes="100vw"
                      className="object-cover"
                    />
                  )
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-[#8a7e72]">
                    <Snowflake className="h-10 w-10 mb-3 opacity-30" />
                    <p className="text-sm">Select filters and apply</p>
                  </div>
                )}
              </div>
              {generationId && isProcessing && (
                <p className="mt-2 text-xs text-[#8a7e72]">Job ID: {generationId}</p>
              )}
            </div>
          </div>

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

          {/* Filter Selection */}
          <div className="mt-8 p-6 bg-gradient-to-br from-red-50 to-green-50 rounded-xl border border-red-100">
            <h4 className="font-medium text-[#3d3632] mb-4">Choose Your Holiday Decorations</h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
              {christmasFilters.map((filter) => {
                const Icon = filter.icon
                const isSelected = selectedFilters.includes(filter.id)
                return (
                  <button
                    key={filter.id}
                    onClick={() => toggleFilter(filter.id)}
                    disabled={isProcessing}
                    className={`
                      p-3 rounded-lg border-2 transition-all text-center
                      ${isSelected ? "border-red-400 bg-red-50" : "border-[#d4c9b8] bg-white hover:border-red-200"}
                      disabled:opacity-50
                    `}
                  >
                    <Icon className={`h-5 w-5 mx-auto mb-1 ${isSelected ? "text-red-500" : "text-[#8a7e72]"}`} />
                    <span className={`text-xs font-medium ${isSelected ? "text-red-700" : "text-[#6b5e54]"}`}>
                      {filter.label}
                    </span>
                  </button>
                )
              })}
            </div>

            <div className="mt-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Switch
                  id="animate"
                  checked={animateResult}
                  onCheckedChange={(checked) => {
                    setAnimateResult(checked)
                    setResultType(checked ? "video" : "image")
                    setResultUrl(null)
                    setError(null)
                  }}
                  disabled={isProcessing}
                />
                <Label htmlFor="animate" className="text-sm text-[#6b5e54]">
                  Animate decorations (video output)
                </Label>
              </div>
            </div>
          </div>

          {isLoggedIn === false && (
            <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-sm">
              Preview mode only. Sign in to run Christmas filters with real AI processing.{" "}
              <a href="/login" className="underline font-medium">
                Sign in
              </a>
            </div>
          )}

          {/* Action Buttons */}
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-end">
            {resultUrl ? (
              <>
                <Button
                  variant="outline"
                  onClick={() => {
                    setResultUrl(null)
                    setError(null)
                    setGenerationId(null)
                  }}
                  className="border-[#d4c9b8] text-[#3d3632] bg-transparent"
                >
                  Try Different Filters
                </Button>
                <Button onClick={handleDownload} className="bg-red-600 hover:bg-red-700 text-white">
                  <Download className="mr-2 h-4 w-4" />
                  {isVideoPreview ? "Download Video" : "Download Festive Photo"}
                </Button>
              </>
            ) : (
              <Button
                onClick={handleApplyFilters}
                disabled={isProcessing || selectedFilters.length === 0}
                className="bg-red-600 hover:bg-red-700 text-white px-8"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Applying...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Apply Christmas Magic
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
