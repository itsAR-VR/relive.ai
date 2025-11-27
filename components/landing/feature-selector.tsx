"use client"

import { useEffect, useState } from "react"
import { LiveDemo } from "./live-demo"
import { ChristmasMode } from "./christmas-mode"
import { YoungerSelf } from "./younger-self"
import { FamilyScene } from "./family-scene"
import { Play, Snowflake, Clock, Users } from "lucide-react"

type FeatureType = "relive" | "christmas" | "younger" | "family"

const features = [
  {
    id: "relive" as const,
    label: "Relive Memories",
    description: "Animate old photos into living moments",
    icon: Play,
  },
  {
    id: "christmas" as const,
    label: "Christmas Mode",
    description: "Add festive magic to your photos",
    icon: Snowflake,
  },
  {
    id: "younger" as const,
    label: "Younger Self",
    description: "See yourself or loved ones younger",
    icon: Clock,
  },
  {
    id: "family" as const,
    label: "Family Scene",
    description: "Unite family members in one scene",
    icon: Users,
  },
]

export function FeatureSelector() {
  const [activeFeature, setActiveFeature] = useState<FeatureType>("relive")
  const [lastNonChristmasFeature, setLastNonChristmasFeature] = useState<FeatureType>("relive")

  useEffect(() => {
    const root = document.documentElement
    if (activeFeature === "christmas") {
      root.classList.add("christmas-theme")
    } else {
      root.classList.remove("christmas-theme")
    }

    return () => {
      root.classList.remove("christmas-theme")
    }
  }, [activeFeature])

  const handleFeatureClick = (featureId: FeatureType) => {
    if (featureId === "christmas" && activeFeature === "christmas") {
      setActiveFeature(lastNonChristmasFeature)
      return
    }

    if (featureId !== "christmas") {
      setLastNonChristmasFeature(featureId)
    }

    setActiveFeature(featureId)
  }

  return (
    <section id="live-demo" className="bg-[#f5f1e6] px-4 py-12 md:py-16">
      <div className="container mx-auto max-w-5xl">
        <div className="text-center mb-8">
          <h2 className="font-serif text-2xl md:text-3xl text-[#3d3632]">Experience the Magic</h2>
          <p className="mt-2 text-[#6b5e54] max-w-xl mx-auto text-sm md:text-base">
            Choose a feature below to start transforming your memories.
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-2 mb-6">
          {features.map((feature) => {
            const Icon = feature.icon
            const isActive = activeFeature === feature.id
            const isChristmasFeature = feature.id === "christmas"
            const activeClasses = isChristmasFeature
              ? "bg-[rgb(var(--relive-button-beige))] text-[#8a6642] border border-[#d4c9b8] shadow-lg"
              : "bg-[#3d3632] text-[#f5f1e6] shadow-lg"
            const inactiveClasses = isChristmasFeature
              ? "bg-white text-[#6b5e54] border border-[#d4c9b8] hover:bg-[rgb(var(--relive-button-beige)_/_0.65)] hover:text-[#8a6642]"
              : "bg-white text-[#6b5e54] border border-[#d4c9b8] hover:border-[#a67c52] hover:text-[#3d3632]"
            return (
              <button
                key={feature.id}
                onClick={() => handleFeatureClick(feature.id)}
                aria-pressed={isActive}
                className={`
                  flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm transition-all
                  ${isActive ? activeClasses : inactiveClasses}
                `}
              >
                <Icon
                  className={`h-4 w-4 ${isActive ? (isChristmasFeature ? "text-[#8a6642]" : "text-[#d4b896]") : "text-[#a67c52]"}`}
                />
                <span className="hidden sm:inline">{feature.label}</span>
                <span className="sm:hidden">{feature.label.split(" ")[0]}</span>
              </button>
            )
          })}
        </div>

        <p className="text-center text-[#6b5e54] mb-4 text-sm">
          {features.find((f) => f.id === activeFeature)?.description}
        </p>

        {/* Feature Content - reduced padding */}
        <div className="bg-white rounded-xl shadow-xl border border-[#d4c9b8] overflow-hidden">
          <div className="p-4 md:p-6">
            {activeFeature === "relive" && <LiveDemo />}
            {activeFeature === "christmas" && <ChristmasMode />}
            {activeFeature === "younger" && <YoungerSelf />}
            {activeFeature === "family" && <FamilyScene />}
          </div>
        </div>
      </div>
    </section>
  )
}
