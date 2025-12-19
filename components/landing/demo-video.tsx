"use client"

import { useEffect, useRef } from "react"

export function DemoVideo() {
  const desktopRef = useRef<HTMLVideoElement>(null)
  const mobileRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const videos = [desktopRef.current, mobileRef.current].filter(Boolean) as HTMLVideoElement[]
    if (videos.length === 0) return

    const tryPlay = (video: HTMLVideoElement) => {
      const promise = video.play()
      if (promise && typeof promise.catch === "function") {
        promise.catch(() => {
          // Autoplay can be blocked; user can still click play if controls are shown in the browser UI.
        })
      }
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const video = entry.target as HTMLVideoElement
          if (entry.isIntersecting) {
            tryPlay(video)
          } else {
            video.pause()
          }
        }
      },
      { threshold: 0.25 },
    )

    for (const video of videos) observer.observe(video)

    return () => observer.disconnect()
  }, [])

  return (
    <section className="bg-background">
      <div className="container mx-auto px-4 py-6 md:py-8">
        <div className="mx-auto max-w-5xl">
          <div className="relative overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
            <video
              ref={desktopRef}
              src="/demo-desktop.mp4"
              className="hidden md:block w-full h-auto"
              loop
              muted
              playsInline
              autoPlay
              preload="metadata"
            />
            <video
              ref={mobileRef}
              src="/demo-mobile.mp4"
              className="block md:hidden w-full h-auto"
              loop
              muted
              playsInline
              autoPlay
              preload="metadata"
            />
          </div>
        </div>
      </div>
    </section>
  )
}

