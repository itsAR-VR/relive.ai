"use client"

import { useState, useEffect } from "react"
import { Gift, Sparkles } from "lucide-react"

interface GiftWrapOverlayProps {
  recipientName?: string | null
  onUnwrap: () => void
}

export function GiftWrapOverlay({ recipientName, onUnwrap }: GiftWrapOverlayProps) {
  const [isUnwrapping, setIsUnwrapping] = useState(false)
  const [showSparkles, setShowSparkles] = useState(false)

  const handleUnwrap = () => {
    setIsUnwrapping(true)
    setShowSparkles(true)
    
    // Trigger unwrap callback after animation
    setTimeout(() => {
      onUnwrap()
    }, 1200)
  }

  // Sparkle positions for effect
  const sparklePositions = [
    { top: "20%", left: "15%", delay: "0s" },
    { top: "30%", left: "80%", delay: "0.1s" },
    { top: "50%", left: "10%", delay: "0.2s" },
    { top: "70%", left: "85%", delay: "0.15s" },
    { top: "80%", left: "20%", delay: "0.25s" },
    { top: "40%", left: "90%", delay: "0.05s" },
    { top: "60%", left: "5%", delay: "0.3s" },
    { top: "25%", left: "50%", delay: "0.12s" },
  ]

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-rose-900 via-red-800 to-rose-900" />
      
      {/* Subtle pattern overlay */}
      <div 
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />

      {/* Sparkles */}
      {showSparkles && sparklePositions.map((pos, i) => (
        <div
          key={i}
          className="absolute animate-sparkle"
          style={{
            top: pos.top,
            left: pos.left,
            animationDelay: pos.delay,
          }}
        >
          <Sparkles className="w-6 h-6 text-yellow-300" />
        </div>
      ))}

      {/* Gift wrap paper - left piece */}
      <div
        className={`absolute inset-y-0 left-0 w-1/2 bg-gradient-to-r from-red-700 to-red-600 transform origin-left transition-transform duration-1000 ease-in-out ${
          isUnwrapping ? "-translate-x-full rotate-12 opacity-0" : ""
        }`}
        style={{
          boxShadow: "inset -20px 0 40px rgba(0,0,0,0.2)",
        }}
      >
        {/* Paper texture pattern */}
        <div 
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `repeating-linear-gradient(
              45deg,
              transparent,
              transparent 10px,
              rgba(255,255,255,0.1) 10px,
              rgba(255,255,255,0.1) 20px
            )`,
          }}
        />
      </div>

      {/* Gift wrap paper - right piece */}
      <div
        className={`absolute inset-y-0 right-0 w-1/2 bg-gradient-to-l from-red-700 to-red-600 transform origin-right transition-transform duration-1000 ease-in-out ${
          isUnwrapping ? "translate-x-full -rotate-12 opacity-0" : ""
        }`}
        style={{
          boxShadow: "inset 20px 0 40px rgba(0,0,0,0.2)",
        }}
      >
        {/* Paper texture pattern */}
        <div 
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `repeating-linear-gradient(
              -45deg,
              transparent,
              transparent 10px,
              rgba(255,255,255,0.1) 10px,
              rgba(255,255,255,0.1) 20px
            )`,
          }}
        />
      </div>

      {/* Vertical ribbon */}
      <div
        className={`absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-16 bg-gradient-to-b from-amber-400 via-yellow-500 to-amber-400 transition-all duration-700 ${
          isUnwrapping ? "scale-0 opacity-0" : ""
        }`}
        style={{
          boxShadow: "0 0 20px rgba(251, 191, 36, 0.5)",
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
      </div>

      {/* Horizontal ribbon */}
      <div
        className={`absolute left-0 right-0 top-1/2 -translate-y-1/2 h-16 bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-400 transition-all duration-700 ${
          isUnwrapping ? "scale-0 opacity-0" : ""
        }`}
        style={{
          boxShadow: "0 0 20px rgba(251, 191, 36, 0.5)",
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/20 to-transparent" />
      </div>

      {/* Center bow/button */}
      <div
        className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 transition-all duration-500 ${
          isUnwrapping ? "scale-150 opacity-0" : ""
        }`}
      >
        <button
          onClick={handleUnwrap}
          disabled={isUnwrapping}
          className="group relative"
        >
          {/* Bow background */}
          <div className="w-32 h-32 md:w-40 md:h-40 rounded-full bg-gradient-to-br from-amber-300 via-yellow-400 to-amber-500 flex items-center justify-center shadow-2xl transform transition-transform group-hover:scale-110 group-active:scale-95">
            {/* Inner glow */}
            <div className="absolute inset-2 rounded-full bg-gradient-to-br from-yellow-200/50 to-transparent" />
            
            {/* Gift icon */}
            <Gift className="w-12 h-12 md:w-16 md:h-16 text-red-700 relative z-10" />
          </div>

          {/* Pulse animation ring */}
          <div className="absolute inset-0 rounded-full bg-amber-400/30 animate-ping" />
        </button>

        {/* Text prompt */}
        <div className="mt-6 text-center">
          <p className="text-white/90 text-lg md:text-xl font-medium animate-pulse">
            Tap to unwrap
          </p>
          {recipientName && (
            <p className="text-amber-200 text-sm mt-1">
              A special gift for {recipientName}
            </p>
          )}
        </div>
      </div>

      {/* Corner decorations */}
      <div className="absolute top-4 left-4 w-20 h-20 border-l-4 border-t-4 border-amber-400/30 rounded-tl-3xl" />
      <div className="absolute top-4 right-4 w-20 h-20 border-r-4 border-t-4 border-amber-400/30 rounded-tr-3xl" />
      <div className="absolute bottom-4 left-4 w-20 h-20 border-l-4 border-b-4 border-amber-400/30 rounded-bl-3xl" />
      <div className="absolute bottom-4 right-4 w-20 h-20 border-r-4 border-b-4 border-amber-400/30 rounded-br-3xl" />

      {/* Styles for sparkle animation */}
      <style jsx>{`
        @keyframes sparkle {
          0% {
            opacity: 0;
            transform: scale(0) rotate(0deg);
          }
          50% {
            opacity: 1;
            transform: scale(1.2) rotate(180deg);
          }
          100% {
            opacity: 0;
            transform: scale(0) rotate(360deg);
          }
        }
        .animate-sparkle {
          animation: sparkle 0.8s ease-out forwards;
        }
      `}</style>
    </div>
  )
}
