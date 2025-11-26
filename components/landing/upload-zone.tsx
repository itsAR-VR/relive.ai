"use client"

import type React from "react"

import { useState, useCallback } from "react"
import { Upload, ImageIcon } from "lucide-react"

interface UploadZoneProps {
  onImageUpload: (imageUrl: string) => void
}

export function UploadZone({ onImageUpload }: UploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false)

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragging(false)

      const file = e.dataTransfer.files[0]
      if (file && file.type.startsWith("image/")) {
        const reader = new FileReader()
        reader.onload = (event) => {
          if (event.target?.result) {
            onImageUpload(event.target.result as string)
          }
        }
        reader.readAsDataURL(file)
      }
    },
    [onImageUpload],
  )

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (file) {
        const reader = new FileReader()
        reader.onload = (event) => {
          if (event.target?.result) {
            onImageUpload(event.target.result as string)
          }
        }
        reader.readAsDataURL(file)
      }
    },
    [onImageUpload],
  )

  const handleDemoImage = () => {
    // Use a placeholder vintage photo for demo
    onImageUpload("/vintage-sepia-old-wedding-photograph-1950s-couple.jpg")
  }

  return (
    <div className="text-center">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          relative border-2 border-dashed rounded-xl p-12 md:p-16 transition-all cursor-pointer
          ${
            isDragging
              ? "border-[#a67c52] bg-[#a67c52]/5"
              : "border-[#d4c9b8] hover:border-[#a67c52]/50 hover:bg-[#f5f1e6]/50"
          }
        `}
      >
        <input
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />

        <div className="flex flex-col items-center">
          <div className="w-16 h-16 rounded-full bg-[#f5f1e6] flex items-center justify-center mb-6">
            <Upload className="h-8 w-8 text-[#a67c52]" />
          </div>

          <h3 className="font-serif text-xl text-[#3d3632] mb-2">Upload Your Cherished Photo</h3>
          <p className="text-[#6b5e54] mb-6 max-w-sm">
            Drag and drop an old photograph here, or click to browse. We handle faded, damaged, or low-quality images
            beautifully.
          </p>

          <div className="flex items-center gap-2 text-sm text-[#8a7e72]">
            <ImageIcon className="h-4 w-4" />
            <span>JPG, PNG, WEBP up to 10MB</span>
          </div>
        </div>
      </div>

      <div className="mt-6">
        <span className="text-sm text-[#8a7e72]">Don't have a photo handy?</span>
        <button
          onClick={handleDemoImage}
          className="ml-2 text-sm text-[#a67c52] hover:text-[#8a6642] underline underline-offset-2 font-medium"
        >
          Try with a sample image
        </button>
      </div>
    </div>
  )
}
