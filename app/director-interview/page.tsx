"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Gift, ArrowLeft } from "lucide-react"
import { DirectorInterviewForm } from "@/components/director-interview-form"

export default function DirectorInterviewPage() {
  const [packageName, setPackageName] = useState<string>("Memory Package")
  const [quizData, setQuizData] = useState<{ honoree?: string } | null>(null)

  useEffect(() => {
    // Get package info from session storage
    const pkg = sessionStorage.getItem("giftingmoments_package")
    if (pkg) {
      const names: Record<string, string> = {
        keepsake: "Digital Keepsake",
        directors: "Director's Cut",
        biography: "Biography",
      }
      setPackageName(names[pkg] || "Memory Package")
    }

    // Get quiz data
    const quiz = sessionStorage.getItem("giftingmoments_quiz")
    if (quiz) {
      try {
        setQuizData(JSON.parse(quiz))
      } catch {
        // Ignore parsing errors
      }
    }
  }, [])

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card/80 backdrop-blur-sm border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center group-hover:shadow-lg transition-shadow">
              <Gift className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <span className="text-lg font-serif text-foreground">GiftingMoments</span>
              <p className="text-xs text-muted-foreground">Memory Restoration Studio</p>
            </div>
          </Link>
          <Link
            href="/pricing"
            className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Packages
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-12 md:py-16">
        {/* Header Section */}
        <div className="text-center mb-12">
          <span className="inline-block mb-4 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium">
            {packageName}
          </span>
          <h1 className="font-serif text-3xl md:text-4xl lg:text-5xl text-foreground mb-4">
            The Director&apos;s Chair
          </h1>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            {quizData?.honoree 
              ? `Let's bring ${quizData.honoree}'s memory to life. The more details you share, the more real it will feel.`
              : "The more details you give us, the more real it will feel. Take your time."}
          </p>
        </div>

        {/* Form */}
        <div className="bg-card rounded-2xl border border-border shadow-lg p-6 md:p-10">
          <DirectorInterviewForm />
        </div>

        {/* Trust Footer */}
        <div className="mt-12 text-center">
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            Your information is secure. We use it only to craft your memory and delete all files after delivery.
          </p>
        </div>
      </main>
    </div>
  )
}
