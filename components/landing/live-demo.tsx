"use client"

import { useState } from "react"
import { UploadZone } from "./upload-zone"
import { EnhancementStep } from "./enhancement-step"
import { ReliveStep } from "./relive-step"
import { Check } from "lucide-react"

type DemoStep = "upload" | "enhance" | "relive"

export function LiveDemo() {
  const [currentStep, setCurrentStep] = useState<DemoStep>("upload")
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)
  const [enhancedImage, setEnhancedImage] = useState<string | null>(null)

  const steps = [
    { id: "upload", label: "Upload" },
    { id: "enhance", label: "Enhance" },
    { id: "relive", label: "Relive" },
  ] as const

  const handleImageUpload = (imageUrl: string) => {
    setUploadedImage(imageUrl)
    setCurrentStep("enhance")
  }

  const handleEnhancementComplete = (enhancedUrl: string) => {
    setEnhancedImage(enhancedUrl)
    setCurrentStep("relive")
  }

  const handleReset = () => {
    setCurrentStep("upload")
    setUploadedImage(null)
    setEnhancedImage(null)
  }

  const getStepStatus = (stepId: DemoStep) => {
    const stepOrder: DemoStep[] = ["upload", "enhance", "relive"]
    const currentIndex = stepOrder.indexOf(currentStep)
    const stepIndex = stepOrder.indexOf(stepId)

    if (stepIndex < currentIndex) return "complete"
    if (stepIndex === currentIndex) return "current"
    return "upcoming"
  }

  return (
    <div>
      <div className="flex items-center justify-center mb-6">
        {steps.map((step, index) => {
          const status = getStepStatus(step.id)
          return (
            <div key={step.id} className="flex items-center">
              <div className="flex flex-col items-center">
                <div
                  className={`
                    w-8 h-8 rounded-full flex items-center justify-center font-medium text-xs transition-all
                    ${status === "complete" ? "bg-[#a67c52] text-[#f5f1e6]" : ""}
                    ${status === "current" ? "bg-[#3d3632] text-[#f5f1e6] ring-2 ring-[#a67c52]/30" : ""}
                    ${status === "upcoming" ? "bg-[#d4c9b8] text-[#8a7e72]" : ""}
                  `}
                >
                  {status === "complete" ? <Check className="h-4 w-4" /> : index + 1}
                </div>
                <span
                  className={`mt-1.5 text-xs font-medium ${status === "upcoming" ? "text-[#8a7e72]" : "text-[#3d3632]"}`}
                >
                  {step.label}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={`w-12 md:w-16 h-0.5 mx-1.5 mb-5 ${getStepStatus(steps[index + 1].id) === "upcoming" ? "bg-[#d4c9b8]" : "bg-[#a67c52]"}`}
                />
              )}
            </div>
          )
        })}
      </div>

      {/* Demo Content */}
      {currentStep === "upload" && <UploadZone onImageUpload={handleImageUpload} />}
      {currentStep === "enhance" && uploadedImage && (
        <EnhancementStep
          originalImage={uploadedImage}
          onEnhancementComplete={handleEnhancementComplete}
          onBack={() => setCurrentStep("upload")}
        />
      )}
      {currentStep === "relive" && enhancedImage && <ReliveStep enhancedImage={enhancedImage} onReset={handleReset} />}
    </div>
  )
}
