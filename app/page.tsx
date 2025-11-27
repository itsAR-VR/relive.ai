import { FeatureCards } from "@/components/landing/feature-cards"
import { FeatureSelector } from "@/components/landing/feature-selector"
import { HeroSection } from "@/components/landing/hero-section"
import { LandingHeader } from "@/components/landing/header"
import { MissionSection } from "@/components/landing/mission-section"

export default function Home() {
  return (
    <main className="min-h-screen bg-[#f5f1e6]">
      <LandingHeader />
      <HeroSection />
      <FeatureSelector />
      <MissionSection />
      <FeatureCards />

      <footer className="border-t border-[#d4c9b8] bg-[#f5f1e6] py-8">
        <div className="container mx-auto px-4 text-center">
          <p className="font-serif text-base text-[#3d3632]">Relive</p>
          <p className="mt-1 text-sm text-[#6b5e54]">Bringing cherished moments back to life, one memory at a time.</p>
        </div>
      </footer>
    </main>
  )
}
