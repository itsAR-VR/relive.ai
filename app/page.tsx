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

      {/* Footer */}
      <footer className="border-t border-border bg-muted/30 py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            {/* Brand */}
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground">
                <Gift className="w-5 h-5" />
              </div>
              <div>
                <p className="font-serif text-lg text-foreground">GiftingMoments</p>
                <p className="text-xs text-muted-foreground">Memory Restoration Studio</p>
              </div>
            </div>

            {/* Tagline */}
            <p className="text-sm text-muted-foreground text-center">
              Give the gift of a relived memory. Tell us the story, we&apos;ll bring it to life.
            </p>

            {/* Links */}
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <a href="/pricing" className="hover:text-foreground transition-colors">
                Packages
              </a>
              <a href="/login" className="hover:text-foreground transition-colors">
                Sign In
              </a>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-border text-center">
            <p className="text-xs text-muted-foreground">
              © {new Date().getFullYear()} GiftingMoments. All memories deserve to be relived.
            </p>
          </div>
        </div>
      </footer>

      {/* Teaser Quiz Modal */}
      <TeaserQuiz isOpen={isQuizOpen} onClose={() => setIsQuizOpen(false)} />
    </main>
  )
}
