"use client"

import { useState } from "react"
import Image from "next/image"

import { LandingHeader } from "@/components/landing/header"
import { SplitHero } from "@/components/landing/split-hero"
import { TeaserQuiz } from "@/components/landing/teaser-quiz"
import { SocialProof } from "@/components/landing/social-proof"
import { HowItWorks } from "@/components/landing/how-it-works"

export default function Home() {
  const [isQuizOpen, setIsQuizOpen] = useState(false)

  const handleStartGift = () => {
    setIsQuizOpen(true)
  }

  return (
    <main className="min-h-screen bg-background">
      <LandingHeader />
      
      <SplitHero onStartGift={handleStartGift} />
      
      <SocialProof onStartGift={handleStartGift} />
      
      <HowItWorks onStartGift={handleStartGift} />

      {/* Footer - Compact */}
      <footer className="border-t border-border bg-muted/30 py-6 md:py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Brand */}
            <div className="flex items-center">
              <Image
                src="/gifting-moments-logo.svg"
                alt="Gifting Moments"
                width={220}
                height={75}
                className="h-16 md:h-20 w-auto"
              />
            </div>

            {/* Links */}
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <a href="/pricing" className="hover:text-foreground transition-colors">
                Packages
              </a>
              <a href="/login" className="hover:text-foreground transition-colors">
                Sign In
              </a>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-border text-center">
            <p className="text-xs text-muted-foreground">
              © {new Date().getFullYear()} Gifting Moments
            </p>
          </div>
        </div>
      </footer>

      {/* Teaser Quiz Modal */}
      <TeaserQuiz isOpen={isQuizOpen} onClose={() => setIsQuizOpen(false)} />
    </main>
  )
}
