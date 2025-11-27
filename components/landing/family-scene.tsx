"use client"

import Image from "next/image"
import type React from "react"
import { useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Users, Sparkles, Loader2, Download, X, UserPlus } from "lucide-react"

interface FamilyMember {
  id: string
  image: string
  name: string
}

export function FamilyScene() {
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([])
  const [sceneDescription, setSceneDescription] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [resultImage, setResultImage] = useState<string | null>(null)
  const [isExpandingPrompt, setIsExpandingPrompt] = useState(false)
  const isFeatureReady = false
  const comingSoonMessage =
    "Coming soon: we'll enable multi-person scene composition once Kie.ai ships the family scene endpoint—no placeholder results meanwhile."

  const handleAddMember = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (file) {
        const reader = new FileReader()
        reader.onload = (event) => {
          if (event.target?.result) {
            const newMember: FamilyMember = {
              id: Date.now().toString(),
              image: event.target.result as string,
              name: `Person ${familyMembers.length + 1}`,
            }
            setFamilyMembers((prev) => [...prev, newMember])
            setResultImage(null)
          }
        }
        reader.readAsDataURL(file)
      }
      // Reset input
      e.target.value = ""
    },
    [familyMembers.length],
  )

  const handleRemoveMember = (id: string) => {
    setFamilyMembers((prev) => prev.filter((m) => m.id !== id))
    setResultImage(null)
  }

  const handleUpdateName = (id: string, name: string) => {
    setFamilyMembers((prev) => prev.map((m) => (m.id === id ? { ...m, name } : m)))
  }

  const handleExpandPrompt = async () => {
    setIsExpandingPrompt(true)
    await new Promise((resolve) => setTimeout(resolve, 1500))
    setSceneDescription(
      "A warm family gathering in the living room during the holidays. Everyone is seated together on and around a comfortable couch, with soft natural light coming through the window. The atmosphere is loving and relaxed, capturing a genuine moment of togetherness.",
    )
    setIsExpandingPrompt(false)
  }

  const handleGenerate = async () => {
    // Disabled until Kie.ai supports multi-person compositing for this flow
    setIsProcessing(false)
    setResultImage(null)
  }

  const handleReset = () => {
    setFamilyMembers([])
    setResultImage(null)
    setSceneDescription("")
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 rounded-full border border-blue-100">
          <Users className="h-4 w-4 text-blue-600" />
          <span className="text-sm font-medium text-blue-700">Family Scene Composer</span>
        </div>
        {familyMembers.length > 0 && (
          <button onClick={handleReset} className="text-sm text-[#6b5e54] hover:text-[#3d3632]">
            Start Over
          </button>
        )}
      </div>

      <div className="mb-4 p-3 bg-blue-50 border border-blue-100 rounded-lg text-blue-800 text-sm">
        {comingSoonMessage}
      </div>

      <p className="text-[#6b5e54] mb-6">
        Upload individual photos of family members — they don't need to be in the same photo. We'll bring them together
        in one beautiful scene.
      </p>

      {/* Family Members Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-8">
        {familyMembers.map((member) => (
          <div key={member.id} className="relative group">
            <div className="aspect-square rounded-lg overflow-hidden bg-[#f5f1e6] border border-[#d4c9b8]">
              <Image
                src={member.image || "/placeholder.svg"}
                alt={member.name}
                fill
                sizes="100vw"
                className="object-cover"
              />
            </div>
            <button
              onClick={() => handleRemoveMember(member.id)}
              className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
            >
              <X className="h-3 w-3" />
            </button>
            <input
              type="text"
              value={member.name}
              onChange={(e) => handleUpdateName(member.id, e.target.value)}
              className="mt-2 w-full px-2 py-1 text-sm text-center rounded border border-[#d4c9b8] bg-white focus:outline-none focus:ring-1 focus:ring-blue-400"
              placeholder="Name"
            />
          </div>
        ))}

        {/* Add Member Button */}
        <div className="relative">
          <div className="aspect-square rounded-lg border-2 border-dashed border-blue-200 flex flex-col items-center justify-center cursor-pointer hover:border-blue-400 hover:bg-blue-50/30 transition-all">
            <input
              type="file"
              accept="image/*"
              onChange={handleAddMember}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <UserPlus className="h-8 w-8 text-blue-400 mb-2" />
            <span className="text-sm text-blue-600 font-medium">Add Person</span>
          </div>
        </div>
      </div>

      {familyMembers.length >= 2 && (
        <>
          {/* Scene Description */}
          <div className="p-6 bg-blue-50/50 rounded-xl border border-blue-100 mb-8">
            <Label htmlFor="family-scene" className="text-[#3d3632] font-medium">
              Describe Your Ideal Scene
            </Label>
            <p className="text-sm text-[#6b5e54] mt-1 mb-3">
              Tell us where and how you'd like to see your family together
            </p>
            <div className="relative">
              <textarea
                id="family-scene"
                value={sceneDescription}
                onChange={(e) => setSceneDescription(e.target.value)}
                placeholder="e.g., A family picnic in a sunny park, everyone sitting on a blanket together, laughing and enjoying the moment..."
                className="w-full h-28 px-4 py-3 rounded-lg border border-blue-200 bg-white text-[#3d3632] placeholder:text-[#8a7e72] focus:outline-none focus:ring-2 focus:ring-blue-400/50 resize-none"
                disabled={isProcessing || !!resultImage}
              />
              <button
                onClick={handleExpandPrompt}
                disabled={isExpandingPrompt || isProcessing || !!resultImage}
                className="absolute bottom-3 right-3 flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-blue-100 text-blue-700 text-sm font-medium hover:bg-blue-200 transition-colors disabled:opacity-50"
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

          {/* Result Preview */}
          {(isProcessing || resultImage) && (
            <div className="mb-8">
              <p className="text-sm font-medium text-[#6b5e54] mb-3">Generated Family Scene</p>
              <div className="relative aspect-[4/3] rounded-lg overflow-hidden bg-[#f5f1e6] border border-[#d4c9b8]">
                {isProcessing ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-blue-900/90">
                    <Loader2 className="h-10 w-10 text-white animate-spin mb-4" />
                    <p className="text-white font-medium">Bringing your family together...</p>
                    <p className="text-blue-200 text-sm mt-1">
                      Compositing {familyMembers.length} people into one scene
                    </p>
                  </div>
                ) : resultImage ? (
                  <Image
                    src={resultImage || "/placeholder.svg"}
                    alt="Family scene"
                    fill
                    sizes="100vw"
                    className="object-cover"
                  />
                ) : null}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-end">
            {resultImage ? (
              <>
                <Button
                  variant="outline"
                  onClick={() => setResultImage(null)}
                  className="border-[#d4c9b8] text-[#3d3632] bg-transparent"
                >
                  Try Different Scene
                </Button>
                <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                  <Download className="mr-2 h-4 w-4" />
                  Download Family Scene
                </Button>
              </>
            ) : (
              <Button
                onClick={handleGenerate}
                disabled={isProcessing || !sceneDescription.trim() || !isFeatureReady}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating Scene...
                  </>
                ) : (
                  <>
                    <Users className="mr-2 h-4 w-4" />
                    {isFeatureReady ? "Create Family Scene" : "Coming Soon"}
                  </>
                )}
              </Button>
            )}
          </div>

          {!isFeatureReady && (
            <p className="mt-2 text-sm text-blue-700">
              Waiting on Kie.ai compositing support. We’ll enable real generations here as soon as it lands.
            </p>
          )}
        </>
      )}

      {familyMembers.length < 2 && familyMembers.length > 0 && (
        <div className="text-center p-6 bg-blue-50/50 rounded-xl border border-blue-100">
          <p className="text-[#6b5e54]">
            Add at least <span className="font-medium text-blue-600">{2 - familyMembers.length} more</span> family
            member{2 - familyMembers.length > 1 ? "s" : ""} to create a scene together.
          </p>
        </div>
      )}

      {familyMembers.length === 0 && (
        <div className="text-center p-8 bg-blue-50/30 rounded-xl border border-dashed border-blue-200">
          <Users className="h-12 w-12 text-blue-300 mx-auto mb-4" />
          <h3 className="font-serif text-lg text-[#3d3632] mb-2">Unite Your Family in One Photo</h3>
          <p className="text-[#6b5e54] text-sm max-w-md mx-auto">
            Upload individual photos of family members who were never photographed together — grandparents who passed,
            relatives from different eras, or family spread across the world.
          </p>
        </div>
      )}
    </div>
  )
}
