"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Sparkles, ArrowLeft, ArrowRight, Loader2 } from "lucide-react"

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

  const handleEnhance = async () => {
    setIsProcessing(true)

    // Simulate processing time
    await new Promise((resolve) => setTimeout(resolve, 2500))

    // For demo, we use a placeholder enhanced image
    const enhanced = "/restored-colorized-vintage-wedding-photograph-high.jpg"
    setEnhancedImage(enhanced)
    setIsProcessing(false)
  }

  const handleProceed = () => {
    if (enhancedImage) {
      onEnhancementComplete(enhancedImage)
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
            <img
              src={originalImage || "/placeholder.svg"}
              alt="Original uploaded photo"
              className="w-full h-full object-cover"
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
              <img
                src={enhancedImage || "/placeholder.svg"}
                alt="Enhanced photo"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-[#8a7e72]">
                <Sparkles className="h-10 w-10 mb-3 opacity-30" />
                <p className="text-sm">Configure options and enhance</p>
              </div>
            )}
          </div>
        </div>
      </div>

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
