"use client"

import { useState, useRef, useCallback } from "react"
import { Upload, X, Video, CheckCircle2, Loader2, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"

interface VideoUploaderProps {
  orderId: string
  currentVideoUrl?: string | null
  onUploadComplete: (url: string) => void
  onUploadError?: (error: string) => void
}

type UploadState = "idle" | "dragging" | "uploading" | "success" | "error"

const MAX_FILE_SIZE = 500 * 1024 * 1024 // 500MB
const ACCEPTED_TYPES = ["video/mp4", "video/quicktime", "video/webm", "video/x-msvideo"]

export function VideoUploader({ 
  orderId, 
  currentVideoUrl, 
  onUploadComplete,
  onUploadError 
}: VideoUploaderProps) {
  const [uploadState, setUploadState] = useState<UploadState>("idle")
  const [progress, setProgress] = useState(0)
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentVideoUrl || null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [fileName, setFileName] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const validateFile = (file: File): string | null => {
    if (!ACCEPTED_TYPES.includes(file.type)) {
      return "Invalid file type. Please upload MP4, MOV, WebM, or AVI."
    }
    if (file.size > MAX_FILE_SIZE) {
      return `File too large. Maximum size is ${MAX_FILE_SIZE / 1024 / 1024}MB.`
    }
    return null
  }

  const uploadFile = async (file: File) => {
    const validationError = validateFile(file)
    if (validationError) {
      setErrorMessage(validationError)
      setUploadState("error")
      onUploadError?.(validationError)
      return
    }

    setUploadState("uploading")
    setProgress(0)
    setErrorMessage(null)
    setFileName(file.name)

    try {
      const supabase = createClient()
      
      // Generate unique filename
      const fileExtension = file.name.split(".").pop() || "mp4"
      const timestamp = Date.now()
      const storagePath = `${orderId}/${timestamp}.${fileExtension}`

      // Simulate progress for better UX (Supabase SDK doesn't have native progress)
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return 90
          }
          return prev + 10
        })
      }, 500)

      // Upload directly to Supabase Storage
      const { data, error } = await supabase.storage
        .from("gift-videos")
        .upload(storagePath, file, {
          contentType: file.type,
          upsert: true,
        })

      clearInterval(progressInterval)

      if (error) {
        throw new Error(error.message)
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from("gift-videos")
        .getPublicUrl(storagePath)

      const publicUrl = urlData.publicUrl

      setProgress(100)
      setPreviewUrl(publicUrl)
      setUploadState("success")
      onUploadComplete(publicUrl)
    } catch (error) {
      const message = error instanceof Error ? error.message : "Upload failed"
      setErrorMessage(message)
      setUploadState("error")
      onUploadError?.(message)
    }
  }

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setUploadState("idle")
    
    const file = e.dataTransfer.files[0]
    if (file) {
      uploadFile(file)
    }
  }, [orderId])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setUploadState("dragging")
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setUploadState("idle")
  }, [])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      uploadFile(file)
    }
  }

  const handleClick = () => {
    fileInputRef.current?.click()
  }

  const handleRemove = () => {
    setPreviewUrl(null)
    setUploadState("idle")
    setProgress(0)
    setFileName(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(1)} KB`
    }
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  return (
    <div className="space-y-3">
      <input
        ref={fileInputRef}
        type="file"
        accept="video/mp4,video/quicktime,video/webm,video/x-msvideo"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Upload Zone */}
      {uploadState !== "success" && !previewUrl && (
        <div
          onClick={handleClick}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={`
            relative cursor-pointer rounded-xl border-2 border-dashed p-6 text-center transition-all
            ${uploadState === "dragging" 
              ? "border-green-500 bg-green-50" 
              : uploadState === "error"
                ? "border-red-300 bg-red-50"
                : "border-slate-300 bg-slate-50 hover:border-slate-400 hover:bg-slate-100"
            }
          `}
        >
          {uploadState === "uploading" ? (
            <div className="space-y-3">
              <Loader2 className="w-10 h-10 mx-auto text-green-600 animate-spin" />
              <div className="text-sm font-medium text-slate-700">
                Uploading {fileName}...
              </div>
              <div className="w-full bg-slate-200 rounded-full h-2">
                <div 
                  className="bg-green-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div className="text-xs text-slate-500">{progress}%</div>
            </div>
          ) : uploadState === "error" ? (
            <div className="space-y-2">
              <AlertCircle className="w-10 h-10 mx-auto text-red-500" />
              <div className="text-sm font-medium text-red-700">{errorMessage}</div>
              <div className="text-xs text-slate-500">Click to try again</div>
            </div>
          ) : (
            <div className="space-y-2">
              <Upload className={`w-10 h-10 mx-auto ${uploadState === "dragging" ? "text-green-600" : "text-slate-400"}`} />
              <div className="text-sm font-medium text-slate-700">
                {uploadState === "dragging" ? "Drop video here" : "Drag & drop video or click to browse"}
              </div>
              <div className="text-xs text-slate-500">
                MP4, MOV, WebM, AVI • Max 500MB
              </div>
            </div>
          )}
        </div>
      )}

      {/* Success State / Preview */}
      {(uploadState === "success" || previewUrl) && (
        <div className="rounded-xl border border-green-200 bg-green-50 p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                <Video className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                  <span className="text-sm font-medium text-green-800">Video uploaded</span>
                </div>
                {fileName && (
                  <div className="text-xs text-green-600 truncate max-w-[200px]">{fileName}</div>
                )}
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRemove}
              className="text-slate-500 hover:text-red-600 hover:bg-red-50"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
          
          {/* Video Preview */}
          {previewUrl && (
            <div className="mt-3 rounded-lg overflow-hidden bg-black aspect-video">
              <video
                src={previewUrl}
                controls
                className="w-full h-full object-contain"
              />
            </div>
          )}
        </div>
      )}
    </div>
  )
}
