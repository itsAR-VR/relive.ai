"use client"

import Image from "next/image"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Sparkles, ArrowLeft, ArrowRight, Loader2, Download } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

interface EnhancementStepProps {
  originalImage: string
  onEnhancementComplete: (enhancedUrl: string) => void
  onBack: () => void
}

export function EnhancementStep({ originalImage, onEnhancementComplete, onBack }: EnhancementStepProps) {
  const [faceRestoration, setFaceRestoration] = useState(true)
  const [colorCorrection, setColorCorrection] = useState(true)
  const [isProcessing, setIsProcessing] = useState(false)
  const [enhancedImage, setEnhancedImage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null)
  const [generationId, setGenerationId] = useState<string | null>(null)

  const supabase = createClient()

  useEffect(() => {
    // Check if user is logged in
    supabase.auth.getUser().then(({ data: { user } }) => {
      setIsLoggedIn(!!user)
    })
  }, [supabase.auth])

  const handleEnhance = async () => {
    setIsProcessing(true)
    setError(null)

    // Check if logged in
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      // Demo mode - simulate processing
      await new Promise((resolve) => setTimeout(resolve, 2500))
      const enhanced = "/restored-colorized-vintage-wedding-photograph-high.jpg"
      setEnhancedImage(enhanced)
      setIsProcessing(false)
      return
    }

    // Real API mode
    try {
      const response = await fetch("/api/enhance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageUrl: originalImage,
          faceRestoration,
          colorCorrection,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        if (response.status === 402) {
          setError("Insufficient credits. Please purchase more credits to continue.")
        } else {
          setError(data.error || "Enhancement failed")
        }
        setIsProcessing(false)
        return
      }

      setGenerationId(data.generationId)

      // Poll for completion
      const pollInterval = setInterval(async () => {
        const statusRes = await fetch(`/api/enhance?id=${data.generationId}`)
        const statusData = await statusRes.json()

        if (statusData.status === "completed" && statusData.result_url) {
          clearInterval(pollInterval)
          setEnhancedImage(statusData.result_url)
          setIsProcessing(false)
        } else if (statusData.status === "failed") {
          clearInterval(pollInterval)
          setError(statusData.error_message || "Enhancement failed")
          setIsProcessing(false)
        }
      }, 2000)

      // Timeout after 2 minutes
      setTimeout(() => {
        clearInterval(pollInterval)
        if (isProcessing) {
          setError("Processing is taking longer than expected. Please check your dashboard.")
          setIsProcessing(false)
        }
      }, 120000)
    } catch (err) {
      console.error("Enhancement error:", err)
      setError("Failed to start enhancement. Please try again.")
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
        </div>

        {/* Login prompt for non-logged in users */}
        {isLoggedIn === false && (
          <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-sm">
            <strong>Demo Mode:</strong> Sign in to save your enhancements and use real AI processing.{" "}
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
