"use client"

import Link from "next/link"
import { Sparkles, Shield, Download, Snowflake, Clock, Users } from "lucide-react"

import { Button } from "@/components/ui/button"

import { useAuthUser } from "./use-auth-user"

const features = [
  {
    icon: Sparkles,
    title: "Relive Memories",
    description: "Transform still photographs into living moments with natural, subtle motion.",
  },
  {
    icon: Snowflake,
    title: "Seasonal Magic",
    description: "Add festive decorations—falling snow, fairy lights, and holiday touches.",
  },
  {
    icon: Clock,
    title: "Younger Self",
    description: "See what loved ones looked like in their youth. Connect across generations.",
  },
  {
    icon: Users,
    title: "Unite Families",
    description: "Bring together family members who were never photographed together.",
  },
  {
    icon: Shield,
    title: "Privacy First",
    description: "We never store your photos. Everything is deleted after you download.",
  },
  {
    icon: Download,
    title: "Yours Forever",
    description: "Download in high quality. Share as gifts treasured for generations.",
  },
]

export function FeatureCards() {
  const { user, isLoading } = useAuthUser()

  const ctaHref = user ? "/dashboard" : "/login"
  const ctaLabel = user ? "Go to Dashboard" : "Start creating"

  return (
    <section className="bg-[#f5f1e6] px-4 py-12 md:py-16">
      <div className="container mx-auto max-w-5xl">
        <div className="text-center mb-8">
          <h2 className="font-serif text-2xl md:text-3xl text-[#3d3632]">Everything You Can Do</h2>
          <p className="mt-2 text-[#6b5e54] max-w-xl mx-auto text-sm">
            Simple tools designed with love, privacy, and your precious memories in mind.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((feature, index) => (
            <div
              key={index}
              className="p-4 rounded-lg bg-white border border-[#d4c9b8] hover:shadow-md transition-shadow"
            >
              <div className="w-10 h-10 rounded-lg bg-[#f5f1e6] flex items-center justify-center mb-3">
                <feature.icon className="h-5 w-5 text-[#a67c52]" />
              </div>
              <h3 className="font-serif text-base text-[#3d3632] mb-1.5">{feature.title}</h3>
              <p className="text-[#6b5e54] text-sm leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>

        <div className="mt-8 flex flex-col gap-3 rounded-lg border border-[#d4c9b8] bg-white/70 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-center text-sm text-[#6b5e54] sm:text-left">
            Ready to craft a living memory from your own photos? Log in to keep going.
          </p>
          <Button
            asChild
            className="w-full rounded-md bg-[#a67c52] px-5 py-2 text-[#f5f1e6] transition-colors hover:bg-[#8a6642] sm:w-auto"
            disabled={isLoading}
          >
            <Link href={ctaHref}>{isLoading ? "Loading..." : ctaLabel}</Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
