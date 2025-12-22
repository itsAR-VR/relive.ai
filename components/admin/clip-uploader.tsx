"use client"

import { useMemo, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"
import { CheckCircle2, Loader2, Trash2, Upload, Video } from "lucide-react"

interface ClipUploaderProps {
  orderId: string
  expectedCount: number
  urls: string[]
  onChange: (urls: string[]) => void
}

const MAX_FILE_SIZE = 500 * 1024 * 1024 // 500MB
const ACCEPTED_TYPES = ["video/mp4", "video/quicktime", "video/webm", "video/x-msvideo"]

export function ClipUploader({ orderId, expectedCount, urls, onChange }: ClipUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [progressLabel, setProgressLabel] = useState<string | null>(null)

  const remaining = useMemo(() => Math.max(0, expectedCount - urls.length), [expectedCount, urls.length])
  const canPick = expectedCount >= 1 && expectedCount <= 20 && remaining > 0 && !isUploading

  const validateFile = (file: File): string | null => {
    if (!ACCEPTED_TYPES.includes(file.type)) {
      return "Invalid file type. Please upload MP4, MOV, WebM, or AVI."
    }
    if (file.size > MAX_FILE_SIZE) {
      return `File too large. Maximum size is ${MAX_FILE_SIZE / 1024 / 1024}MB.`
    }
    return null
  }

  const uploadFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return
    setError(null)

    const slots = expectedCount - urls.length
    if (slots <= 0) {
      setError(`Already uploaded ${expectedCount} clips.`)
      return
    }

    const selected = Array.from(files).slice(0, slots)
    for (const f of selected) {
      const validationError = validateFile(f)
      if (validationError) {
        setError(validationError)
        return
      }
    }

    setIsUploading(true)
    setProgressLabel(null)

    try {
      const supabase = createClient()
      const nextUrls: string[] = [...urls]

      for (let i = 0; i < selected.length; i++) {
        const file = selected[i]
        setProgressLabel(`Uploading ${i + 1} of ${selected.length}…`)

        const fileExtension = file.name.split(".").pop() || "mp4"
        const timestamp = Date.now()
        const storagePath = `${orderId}/clips/${timestamp}-${i}.${fileExtension}`

        const { error: uploadError } = await supabase.storage
          .from("gift-videos")
          .upload(storagePath, file, {
            contentType: file.type,
            upsert: true,
          })

        if (uploadError) {
          throw new Error(uploadError.message)
        }

        const { data: urlData } = supabase.storage.from("gift-videos").getPublicUrl(storagePath)
        if (!urlData?.publicUrl) {
          throw new Error("Failed to resolve uploaded clip URL")
        }

        nextUrls.push(urlData.publicUrl)
        onChange(nextUrls)
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Upload failed"
      setError(message)
    } finally {
      setIsUploading(false)
      setProgressLabel(null)
      if (fileInputRef.current) fileInputRef.current.value = ""
    }
  }

  const removeUrl = (url: string) => {
    setError(null)
    onChange(urls.filter((u) => u !== url))
  }

  return (
    <div className="space-y-3">
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="video/mp4,video/quicktime,video/webm,video/x-msvideo"
        onChange={(e) => uploadFiles(e.target.files)}
        className="hidden"
      />

      <div className="flex items-center justify-between text-xs text-slate-500">
        <span>Uploaded</span>
        <span className="font-medium text-slate-700">
          {urls.length} / {expectedCount}
        </span>
      </div>

      <Button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        disabled={!canPick}
        variant="outline"
        className="w-full border-slate-200"
      >
        {isUploading ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            {progressLabel || "Uploading…"}
          </>
        ) : (
          <>
            <Upload className="w-4 h-4 mr-2" />
            {remaining > 0 ? `Upload clips (${remaining} remaining)` : "Clip limit reached"}
          </>
        )}
      </Button>

      {error && <p className="text-sm text-red-600">{error}</p>}

      {urls.length > 0 && (
        <div className="space-y-2">
          {urls.map((url, idx) => (
            <div key={`${url}-${idx}`} className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
              <div className="flex items-center gap-2 min-w-0">
                <Video className="w-4 h-4 text-slate-500 flex-shrink-0" />
                <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-slate-700 truncate hover:underline"
                >
                  Clip {idx + 1}
                </a>
              </div>
              <button
                type="button"
                onClick={() => removeUrl(url)}
                className="p-1 rounded-md hover:bg-red-50 text-slate-500 hover:text-red-600"
                aria-label="Remove clip"
                disabled={isUploading}
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {urls.length === expectedCount && expectedCount > 0 ? (
        <div className="flex items-center gap-2 text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2">
          <CheckCircle2 className="w-4 h-4" />
          All clips uploaded
        </div>
      ) : null}
    </div>
  )
}

