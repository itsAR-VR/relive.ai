"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Check, Image as ImageIcon, Loader2, Trash2 } from "lucide-react"

type PhotoUpload = {
  id: string
  file: File
  previewUrl: string
}

interface ReviveUploadFormProps {
  orderId: string
  expectedPhotoCount: number
}

export function ReviveUploadForm({ orderId, expectedPhotoCount }: ReviveUploadFormProps) {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [photos, setPhotos] = useState<PhotoUpload[]>([])
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isComplete, setIsComplete] = useState(false)

  const remainingSlots = useMemo(() => Math.max(0, expectedPhotoCount - photos.length), [expectedPhotoCount, photos.length])
  const canSubmit = photos.length === expectedPhotoCount && expectedPhotoCount >= 1 && expectedPhotoCount <= 20

  useEffect(() => {
    return () => {
      // cleanup previews
      for (const photo of photos) {
        URL.revokeObjectURL(photo.previewUrl)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const onPickPhotos = (files: FileList | null) => {
    if (!files || files.length === 0) return
    setError(null)

    const available = expectedPhotoCount - photos.length
    if (available <= 0) {
      setError(`You’ve already added ${expectedPhotoCount} photos.`)
      return
    }

    const nextFiles = Array.from(files).slice(0, available)
    const nextUploads: PhotoUpload[] = nextFiles.map((file) => ({
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      file,
      previewUrl: URL.createObjectURL(file),
    }))

    setPhotos((prev) => [...prev, ...nextUploads])

    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const removePhoto = (id: string) => {
    setError(null)
    setPhotos((prev) => {
      const photo = prev.find((p) => p.id === id)
      if (photo) URL.revokeObjectURL(photo.previewUrl)
      return prev.filter((p) => p.id !== id)
    })
  }

  const submit = async () => {
    setError(null)
    if (!canSubmit) {
      setError(`Please upload exactly ${expectedPhotoCount} photos.`)
      return
    }

    setIsSubmitting(true)
    try {
      const payload = new FormData()
      payload.append("order_id", orderId)
      payload.append("quiz_data", JSON.stringify({}))
      payload.append("interview_data", JSON.stringify({}))

      photos.forEach((p, index) => {
        payload.append(`reference_photo_${index}`, p.file)
      })

      const res = await fetch("/api/intake", { method: "POST", body: payload })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data?.error || "Failed to upload photos")
      }

      setIsComplete(true)
      setTimeout(() => {
        router.push("/dashboard")
        router.refresh()
      }, 900)
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to upload photos"
      setError(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isComplete) {
    return (
      <div className="text-center py-12 animate-fade-in-slow">
        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-100 flex items-center justify-center">
          <Check className="w-10 h-10 text-green-600" />
        </div>
        <h2 className="font-serif text-3xl text-foreground mb-4">In production</h2>
        <p className="text-muted-foreground max-w-md mx-auto mb-8">
          We&apos;re reviving your {expectedPhotoCount} photos into {expectedPhotoCount} separate 5‑second clips.
          You can track progress in your dashboard.
        </p>
        <Button onClick={() => router.push("/dashboard")} className="font-sans bg-primary hover:bg-primary/90 text-primary-foreground">
          Go to dashboard
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-border bg-card p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-primary">Upload</p>
            <h2 className="font-serif text-2xl text-foreground mt-2">Upload your photos</h2>
            <p className="text-sm text-muted-foreground mt-2">
              Upload exactly <span className="font-semibold text-foreground">{expectedPhotoCount}</span> photos.
              We&apos;ll turn each photo into a separate 5‑second clip (silent).
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center flex-shrink-0">
            <ImageIcon className="w-6 h-6 text-primary" />
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between text-xs">
          <span className="text-muted-foreground">Selected</span>
          <span className="font-medium text-foreground">
            {photos.length} / {expectedPhotoCount}
          </span>
        </div>

        <div className="mt-4">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={(e) => onPickPhotos(e.target.files)}
            className="hidden"
          />

          <Button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={remainingSlots === 0}
            variant="outline"
            className="w-full font-sans border-border"
          >
            {remainingSlots === 0 ? "Photo limit reached" : `Add photos (${remainingSlots} remaining)`}
          </Button>
        </div>

        {photos.length > 0 && (
          <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {photos.map((p) => (
              <div key={p.id} className="relative group rounded-xl overflow-hidden border border-border bg-muted">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={p.previewUrl} alt="Upload preview" className="h-28 w-full object-cover" />
                <button
                  type="button"
                  onClick={() => removePhoto(p.id)}
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-background/90 border border-border rounded-lg p-1"
                  aria-label="Remove photo"
                >
                  <Trash2 className="w-4 h-4 text-foreground" />
                </button>
              </div>
            ))}
          </div>
        )}

        {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

        <div className="mt-5">
          <Button
            type="button"
            onClick={submit}
            disabled={!canSubmit || isSubmitting}
            className="w-full h-11 font-sans bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Uploading…
              </>
            ) : (
              "Start production"
            )}
          </Button>
          <p className="mt-2 text-xs text-muted-foreground text-center">
            You&apos;ll be taken to your dashboard after upload.
          </p>
        </div>
      </div>
    </div>
  )
}

