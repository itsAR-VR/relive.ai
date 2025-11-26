"use client"

import type React from "react"
import { useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"
import { Upload, Clock, Sparkles, Loader2, Download, ArrowRight } from "lucide-react"

export function YoungerSelf() {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)
  const [targetAge, setTargetAge] = useState([25])
  const [sceneDescription, setSceneDescription] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [resultImage, setResultImage] = useState<string | null>(null)
  const [isExpandingPrompt, setIsExpandingPrompt] = useState(false)

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        if (event.target?.result) {
          setUploadedImage(event.target.result as string)
          setResultImage(null)
        }
      }
      reader.readAsDataURL(file)
    }
  }, [])

  const handleExpandPrompt = async () => {
    setIsExpandingPrompt(true)
    await new Promise((resolve) => setTimeout(resolve, 1500))
    setSceneDescription(
      "Standing in front of the old family home on a sunny afternoon, wearing their favorite vintage outfit from the era, with a warm smile that captures their youthful spirit and optimism.",
    )
    setIsExpandingPrompt(false)
  }

  const handleGenerate = async () => {
    setIsProcessing(true)
    await new Promise((resolve) => setTimeout(resolve, 3500))
    setResultImage("/younger-version-of-elderly-person-portrait-vintage.jpg")
    setIsProcessing(false)
  }

  const handleReset = () => {
    setUploadedImage(null)
    setResultImage(null)
    setSceneDescription("")
    setTargetAge([25])
  }

  const getAgeLabel = (age: number) => {
    if (age <= 15) return "Childhood"
    if (age <= 25) return "Young Adult"
    if (age <= 40) return "Prime Years"
    return "Middle Age"
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-50 rounded-full border border-amber-100">
          <Clock className="h-4 w-4 text-amber-600" />
          <span className="text-sm font-medium text-amber-700">Younger Self</span>
        </div>
        {uploadedImage && (
          <button onClick={handleReset} className="text-sm text-[#6b5e54] hover:text-[#3d3632]">
            Start Over
          </button>
        )}
      </div>

      {!uploadedImage ? (
        <div className="text-center">
          <div className="relative border-2 border-dashed border-amber-200 rounded-xl p-12 md:p-16 transition-all cursor-pointer hover:border-amber-300 hover:bg-amber-50/30">
            <input
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 rounded-full bg-amber-50 flex items-center justify-center mb-6">
                <Upload className="h-8 w-8 text-amber-600" />
              </div>
              <h3 className="font-serif text-xl text-[#3d3632] mb-2">Upload a Current Photo</h3>
              <p className="text-[#6b5e54] mb-4 max-w-sm">
                Upload a photo of yourself, a parent, or grandparent. We'll show you what they looked like in their
                younger years.
              </p>
              <p className="text-sm text-amber-600 font-medium">Perfect for reconnecting generations</p>
            </div>
          </div>
        </div>
      ) : (
        <div>
          <div className="grid md:grid-cols-2 gap-8">
            {/* Current Photo */}
            <div>
              <p className="text-sm font-medium text-[#6b5e54] mb-3">Current Photo</p>
              <div className="relative aspect-[4/5] rounded-lg overflow-hidden bg-[#f5f1e6] border border-[#d4c9b8]">
                <img src={uploadedImage || "/placeholder.svg"} alt="Current" className="w-full h-full object-cover" />
              </div>
            </div>

            {/* Younger Version */}
            <div>
              <p className="text-sm font-medium text-[#6b5e54] mb-3">Younger Version</p>
              <div className="relative aspect-[4/5] rounded-lg overflow-hidden bg-[#f5f1e6] border border-[#d4c9b8]">
                {isProcessing ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-amber-900/90">
                    <Loader2 className="h-10 w-10 text-white animate-spin mb-4" />
                    <p className="text-white font-medium">Turning back time...</p>
                    <p className="text-amber-200 text-sm mt-1">Preserving their essence</p>
                  </div>
                ) : resultImage ? (
                  <img
                    src={resultImage || "/placeholder.svg"}
                    alt="Younger version"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-[#8a7e72]">
                    <Clock className="h-10 w-10 mb-3 opacity-30" />
                    <p className="text-sm">Configure and generate</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Age Selector */}
          <div className="mt-8 p-6 bg-amber-50/50 rounded-xl border border-amber-100">
            <h4 className="font-medium text-[#3d3632] mb-6">Configure the Transformation</h4>

            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <Label className="text-[#3d3632]">Target Age</Label>
                <span className="text-sm font-medium text-amber-700">
                  ~{targetAge[0]} years old ({getAgeLabel(targetAge[0])})
                </span>
              </div>
              <Slider
                value={targetAge}
                onValueChange={setTargetAge}
                min={10}
                max={50}
                step={5}
                disabled={isProcessing || !!resultImage}
                className="[&_[role=slider]]:bg-amber-600"
              />
              <div className="flex justify-between mt-1 text-xs text-[#8a7e72]">
                <span>Childhood (10)</span>
                <span>Middle Age (50)</span>
              </div>
            </div>

            {/* Scene Description */}
            <div>
              <Label htmlFor="scene-desc" className="text-[#3d3632] font-medium">
                Scene Description (Optional)
              </Label>
              <p className="text-sm text-[#6b5e54] mt-1 mb-3">
                Describe the setting or context for the younger version
              </p>
              <div className="relative">
                <textarea
                  id="scene-desc"
                  value={sceneDescription}
                  onChange={(e) => setSceneDescription(e.target.value)}
                  placeholder="e.g., At their childhood home, during their college graduation, on their wedding day..."
                  className="w-full h-24 px-4 py-3 rounded-lg border border-amber-200 bg-white text-[#3d3632] placeholder:text-[#8a7e72] focus:outline-none focus:ring-2 focus:ring-amber-400/50 resize-none"
                  disabled={isProcessing || !!resultImage}
                />
                <button
                  onClick={handleExpandPrompt}
                  disabled={isExpandingPrompt || isProcessing || !!resultImage}
                  className="absolute bottom-3 right-3 flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-amber-100 text-amber-700 text-sm font-medium hover:bg-amber-200 transition-colors disabled:opacity-50"
                >
                  {isExpandingPrompt ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Sparkles className="h-3.5 w-3.5" />
                  )}
                  AI Suggest
                </button>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-end">
            {resultImage ? (
              <>
                <Button
                  variant="outline"
                  onClick={() => setResultImage(null)}
                  className="border-[#d4c9b8] text-[#3d3632] bg-transparent"
                >
                  Try Different Settings
                </Button>
                <Button className="bg-amber-600 hover:bg-amber-700 text-white">
                  <Download className="mr-2 h-4 w-4" />
                  Download Image
                </Button>
              </>
            ) : (
              <Button
                onClick={handleGenerate}
                disabled={isProcessing}
                className="bg-amber-600 hover:bg-amber-700 text-white px-8"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <ArrowRight className="mr-2 h-4 w-4" />
                    Generate Younger Self
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
