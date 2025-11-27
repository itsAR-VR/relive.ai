"use client"

import Image from "next/image"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"
import { Sparkles, RotateCcw, Play, Loader2, ChevronDown, Zap, Gem, Download } from "lucide-react"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { createClient } from "@/lib/supabase/client"

interface ReliveStepProps {
  enhancedImage: string
  onReset: () => void
}

export function ReliveStep({ enhancedImage, onReset }: ReliveStepProps) {
  const [prompt, setPrompt] = useState("")
  const [motionStrength, setMotionStrength] = useState([50])
  const [creativity, setCreativity] = useState([30])
  const [selectedModel, setSelectedModel] = useState<"standard" | "ultra">("standard")
  const [isGenerating, setIsGenerating] = useState(false)
  const [isExpandingPrompt, setIsExpandingPrompt] = useState(false)
  const [videoGenerated, setVideoGenerated] = useState(false)
  const [videoUrl, setVideoUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null)

  const supabase = createClient()

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setIsLoggedIn(!!user)
    })
  }, [supabase.auth])

  const handleExpandPrompt = async () => {
    setIsExpandingPrompt(true)
    await new Promise((resolve) => setTimeout(resolve, 1500))
    setPrompt(
      "The couple gently sways together in a slow dance, their eyes meeting with tender affection. A soft breeze catches her veil as he lovingly places his hand on her waist. Their expressions soften into warm smiles as the moment unfolds.",
    )
    setIsExpandingPrompt(false)
  }

  const handleGenerate = async () => {
    setIsGenerating(true)
    setError(null)

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      // Demo mode - simulate processing
      await new Promise((resolve) => setTimeout(resolve, 4000))
      setVideoGenerated(true)
      setVideoUrl("/animated-vintage-wedding-couple-dancing-motion-blu.jpg") // Demo placeholder
      setIsGenerating(false)
      return
    }

    // Real API mode
    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageUrl: enhancedImage,
          prompt,
          motionStrength: motionStrength[0],
          duration: selectedModel === "ultra" ? 6 : 4,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        if (response.status === 402) {
          setError("Insufficient credits. Video generation requires 5 credits.")
        } else {
          setError(data.error || "Generation failed")
        }
        setIsGenerating(false)
        return
      }

      // Poll for completion
      const pollInterval = setInterval(async () => {
        const statusRes = await fetch(`/api/generate?id=${data.generationId}`)
        const statusData = await statusRes.json()

        if (statusData.status === "completed" && statusData.result_url) {
          clearInterval(pollInterval)
          setVideoUrl(statusData.result_url)
          setVideoGenerated(true)
          setIsGenerating(false)
        } else if (statusData.status === "failed") {
          clearInterval(pollInterval)
          setError(statusData.error_message || "Video generation failed")
          setIsGenerating(false)
        }
      }, 3000)

      // Timeout after 3 minutes (video takes longer)
      setTimeout(() => {
        clearInterval(pollInterval)
        if (isGenerating) {
          setError("Processing is taking longer than expected. Check your dashboard for the result.")
          setIsGenerating(false)
        }
      }, 180000)
    } catch (err) {
      console.error("Generate error:", err)
      setError("Failed to start generation. Please try again.")
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
        <h3 className="font-serif text-xl text-[#3d3632]">Bring This Moment to Life</h3>
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

        {/* Login prompt for non-logged in users */}
        {isLoggedIn === false && (
          <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-sm">
            <strong>Demo Mode:</strong> Sign in to generate real videos and save your creations.{" "}
            <a href="/login" className="underline font-medium">Sign in</a>
          </div>
        )}
      </div>

      {/* Fine-tuning Options */}
      <Accordion type="single" collapsible className="mt-6">
        <AccordionItem value="fine-tuning" className="border-[#d4c9b8]">
          <AccordionTrigger className="text-[#3d3632] hover:text-[#3d3632] hover:no-underline">
            <span className="flex items-center gap-2">
              <ChevronDown className="h-4 w-4" />
              Fine-tune your result
            </span>
          </AccordionTrigger>
          <AccordionContent className="pt-4">
            <div className="space-y-6">
              {/* Motion Strength */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <Label className="text-[#3d3632]">Motion Strength</Label>
                  <span className="text-sm text-[#6b5e54]">
                    {motionStrength[0] < 33 ? "Subtle" : motionStrength[0] < 66 ? "Natural" : "Dynamic"}
                  </span>
                </div>
                <Slider
                  value={motionStrength}
                  onValueChange={setMotionStrength}
                  max={100}
                  step={1}
                  disabled={isGenerating || videoGenerated}
                  className="[&_[role=slider]]:bg-[#a67c52]"
                />
                <div className="flex justify-between mt-1 text-xs text-[#8a7e72]">
                  <span>Low</span>
                  <span>High</span>
                </div>
              </div>

              {/* Creativity */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <Label className="text-[#3d3632]">Creativity</Label>
                  <span className="text-sm text-[#6b5e54]">
                    {creativity[0] < 33 ? "Faithful" : creativity[0] < 66 ? "Balanced" : "Imaginative"}
                  </span>
                </div>
                <Slider
                  value={creativity}
                  onValueChange={setCreativity}
                  max={100}
                  step={1}
                  disabled={isGenerating || videoGenerated}
                  className="[&_[role=slider]]:bg-[#a67c52]"
                />
                <div className="flex justify-between mt-1 text-xs text-[#8a7e72]">
                  <span>Strict</span>
                  <span>Wild</span>
                </div>
              </div>

              {/* Model Selection */}
              <div>
                <Label className="text-[#3d3632] mb-3 block">Generation Model</Label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => setSelectedModel("standard")}
                    disabled={isGenerating || videoGenerated}
                    className={`p-4 rounded-lg border-2 text-left transition-all ${
                      selectedModel === "standard"
                        ? "border-[#a67c52] bg-[#a67c52]/5"
                        : "border-[#d4c9b8] hover:border-[#a67c52]/50"
                    } disabled:opacity-50`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <Zap className="h-4 w-4 text-[#a67c52]" />
                      <span className="font-medium text-[#3d3632]">Standard</span>
                    </div>
                    <p className="text-xs text-[#6b5e54]">Fast generation, great for most photos</p>
                  </button>
                  <button
                    onClick={() => setSelectedModel("ultra")}
                    disabled={isGenerating || videoGenerated}
                    className={`p-4 rounded-lg border-2 text-left transition-all ${
                      selectedModel === "ultra"
                        ? "border-[#a67c52] bg-[#a67c52]/5"
                        : "border-[#d4c9b8] hover:border-[#a67c52]/50"
                    } disabled:opacity-50`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <Gem className="h-4 w-4 text-[#a67c52]" />
                      <span className="font-medium text-[#3d3632]">Ultra-Real</span>
                    </div>
                    <p className="text-xs text-[#6b5e54]">Maximum quality, lifelike motion</p>
                  </button>
                </div>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

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
