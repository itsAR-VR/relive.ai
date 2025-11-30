"use client"

import { useState } from "react"

import { LandingHeader } from "@/components/landing/header"
import { SplitHero } from "@/components/landing/split-hero"
import { TeaserQuiz } from "@/components/landing/teaser-quiz"
import { SocialProof } from "@/components/landing/social-proof"
import { HowItWorks } from "@/components/landing/how-it-works"
import { Footer } from "@/components/footer"

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

      <Footer />

      {/* Teaser Quiz Modal */}
      <TeaserQuiz isOpen={isQuizOpen} onClose={() => setIsQuizOpen(false)} />
    </main>
  )
}
