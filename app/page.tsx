"use client"

import { Suspense, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"

import { LandingHeader } from "@/components/landing/header"
import { SplitHero } from "@/components/landing/split-hero"
import { DemoVideo } from "@/components/landing/demo-video"
import { TrustedStrip } from "@/components/landing/trusted-strip"
import { ProblemSolution } from "@/components/landing/problem-solution"
import { Comparison } from "@/components/landing/comparison"
import { TeaserQuiz } from "@/components/landing/teaser-quiz"
import { SocialProof } from "@/components/landing/social-proof"
import { HowItWorks } from "@/components/landing/how-it-works"
import { GiftOfTears } from "@/components/landing/gift-of-tears"
import { AiHuman } from "@/components/landing/ai-human"
import { FaqPreview } from "@/components/landing/faq-preview"
import { Footer } from "@/components/footer"

function HomeContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isQuizOpen, setIsQuizOpen] = useState(false)
  const quizFromUrl = searchParams.get("quiz") === "1"
  const isQuizModalOpen = isQuizOpen || quizFromUrl

  const handleStartGift = () => {
    setIsQuizOpen(true)
  }

  const handleCloseQuiz = () => {
    setIsQuizOpen(false)
    if (quizFromUrl) {
      router.replace("/", { scroll: false })
    }
  }

  return (
    <main className="min-h-screen bg-background">
	      <LandingHeader />
	      
	      <SplitHero onStartGift={handleStartGift} />

	      <DemoVideo />

	      <TrustedStrip onStartGift={handleStartGift} />

      <ProblemSolution />

      <Comparison />
      
      <HowItWorks onStartGift={handleStartGift} />

	      <GiftOfTears onStartGift={handleStartGift} />

	      <SocialProof onStartGift={handleStartGift} />

      <AiHuman onStartGift={handleStartGift} />

      <FaqPreview onStartGift={handleStartGift} />

      <Footer />

      {/* Teaser Quiz Modal */}
      <TeaserQuiz isOpen={isQuizModalOpen} onClose={handleCloseQuiz} />
    </main>
  )
}

export default function Home() {
  return (
    <Suspense fallback={<main className="min-h-screen bg-background" />}>
      <HomeContent />
    </Suspense>
  )
}
