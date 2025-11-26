"use client"

import type React from "react"
import { useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Upload, Snowflake, Sparkles, Trees as Tree, Gift, Star, Loader2, Download } from "lucide-react"

type ChristmasFilter = "snow" | "lights" | "santa-hat" | "wreath" | "ornaments"

const christmasFilters: { id: ChristmasFilter; label: string; icon: React.ElementType }[] = [
  { id: "snow", label: "Falling Snow", icon: Snowflake },
  { id: "lights", label: "Fairy Lights", icon: Sparkles },
  { id: "santa-hat", label: "Santa Hats", icon: Gift },
  { id: "wreath", label: "Holiday Wreath", icon: Tree },
  { id: "ornaments", label: "Ornaments", icon: Star },
]

export function ChristmasMode() {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)
  const [selectedFilters, setSelectedFilters] = useState<ChristmasFilter[]>(["snow", "lights"])
  const [isProcessing, setIsProcessing] = useState(false)
  const [resultImage, setResultImage] = useState<string | null>(null)
  const [animateResult, setAnimateResult] = useState(true)

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

  const toggleFilter = (filterId: ChristmasFilter) => {
    setSelectedFilters((prev) => (prev.includes(filterId) ? prev.filter((f) => f !== filterId) : [...prev, filterId]))
    setResultImage(null)
  }

  const handleApplyFilters = async () => {
    setIsProcessing(true)
    await new Promise((resolve) => setTimeout(resolve, 2500))
    setResultImage("/family-photo-with-christmas-decorations-snow-falli.jpg")
    setIsProcessing(false)
  }

  const handleReset = () => {
    setUploadedImage(null)
    setResultImage(null)
    setSelectedFilters(["snow", "lights"])
  }

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
                <img src={uploadedImage || "/placeholder.svg"} alt="Original" className="w-full h-full object-cover" />
              </div>
            </div>

            {/* Result Image */}
            <div>
              <p className="text-sm font-medium text-[#6b5e54] mb-3">Festive Result</p>
              <div className="relative aspect-[4/5] rounded-lg overflow-hidden bg-[#f5f1e6] border border-[#d4c9b8]">
                {isProcessing ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-red-900/90">
                    <Loader2 className="h-10 w-10 text-white animate-spin mb-4" />
                    <p className="text-white font-medium">Adding holiday magic...</p>
                    <p className="text-red-200 text-sm mt-1">Sprinkling snow & lights</p>
                  </div>
                ) : resultImage ? (
                  <img
                    src={resultImage || "/placeholder.svg"}
                    alt="Festive result"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-[#8a7e72]">
                    <Snowflake className="h-10 w-10 mb-3 opacity-30" />
                    <p className="text-sm">Select filters and apply</p>
                  </div>
                )}
              </div>
            </div>
          </div>

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
                  onCheckedChange={setAnimateResult}
                  disabled={isProcessing}
                />
                <Label htmlFor="animate" className="text-sm text-[#6b5e54]">
                  Animate decorations (video output)
                </Label>
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
                  Try Different Filters
                </Button>
                <Button className="bg-red-600 hover:bg-red-700 text-white">
                  <Download className="mr-2 h-4 w-4" />
                  Download Festive Photo
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
