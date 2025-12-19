"use client"

import Image from "next/image"
import { useEffect, useRef, useState } from "react"

interface BeforeAfterScrubberProps {
  beforeImageSrc: string
  afterVideoSrc: string
  beforeAlt: string
  className?: string
}

export function BeforeAfterScrubber({
  beforeImageSrc,
  afterVideoSrc,
  beforeAlt,
  className,
}: BeforeAfterScrubberProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [position, setPosition] = useState(55)

  useEffect(() => {
    videoRef.current?.play().catch(() => {})
  }, [])

  return (
    <div className={className}>
      <div className="relative overflow-hidden rounded-xl md:rounded-2xl border border-border/50 bg-card shadow-xl">
        <div className="relative aspect-[3/4] sm:aspect-[16/9] md:aspect-[4/3] bg-black">
          {/* After (base layer) */}
          <video
            ref={videoRef}
            src={afterVideoSrc}
            className="absolute inset-0 h-full w-full object-contain"
            loop
            muted
            playsInline
            autoPlay
          />

          {/* Before (overlay) */}
          <div
            className="absolute inset-y-0 left-0 overflow-hidden"
            style={{ width: `${position}%` }}
          >
            <Image
              src={beforeImageSrc}
              alt={beforeAlt}
              fill
              className="object-cover grayscale"
              sizes="(max-width: 1024px) 100vw, 520px"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-r from-transparent to-black/20" />
          </div>

          {/* Labels */}
          <span className="absolute bottom-2 left-2 md:bottom-3 md:left-3 text-[10px] md:text-xs font-semibold text-white/90 bg-black/50 px-2 py-1 rounded">
            Before
          </span>
          <span className="absolute bottom-2 right-2 md:bottom-3 md:right-3 text-[10px] md:text-xs font-semibold text-white/90 bg-primary/80 px-2 py-1 rounded flex items-center gap-1">
            <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
            Restored
          </span>

          {/* Slider handle */}
          <div
            className="absolute inset-y-0 z-20"
            style={{ left: `${position}%` }}
            aria-hidden="true"
          >
            <div className="h-full w-[2px] bg-white/80 shadow" />
            <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 h-9 w-9 rounded-full bg-white/90 border border-black/10 shadow-lg flex items-center justify-center">
              <div className="h-4 w-4 rounded-full bg-primary/80" />
            </div>
          </div>

          {/* Invisible range input */}
          <input
            type="range"
            min={0}
            max={100}
            step={1}
            value={position}
            onChange={(e) => setPosition(Number(e.target.value))}
            aria-label="Before and after slider"
            className="absolute inset-0 z-30 w-full h-full opacity-0 cursor-ew-resize"
          />
        </div>
      </div>
    </div>
  )
}
