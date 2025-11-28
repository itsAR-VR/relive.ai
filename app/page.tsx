"use client"

import { useState } from "react"
import { Gift } from "lucide-react"

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
      
      <SocialProof />
      
      <HowItWorks onStartGift={handleStartGift} />

      {/* Footer - Compact */}
      <footer className="border-t border-border bg-muted/30 py-6 md:py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Brand */}
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
                <Gift className="w-4 h-4" />
              </div>
              <div>
                <p className="font-serif text-base text-foreground">GiftingMoments</p>
              </div>
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
              © {new Date().getFullYear()} GiftingMoments
            </p>
          </div>
        </div>
      </footer>

      {/* Teaser Quiz Modal */}
      <TeaserQuiz isOpen={isQuizOpen} onClose={() => setIsQuizOpen(false)} />
    </main>
  )
}
