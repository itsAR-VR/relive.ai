"use client"

import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { ArrowRight, Film, Sparkles, Wand2 } from "lucide-react"

interface AiHumanProps {
  onStartGift: () => void
}

export function AiHuman({ onStartGift }: AiHumanProps) {
  return (
    <section className="bg-background py-12 md:py-16">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-10 items-center max-w-6xl mx-auto">
          <div>
            <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
              A note on AI
            </p>
            <h2 className="mt-3 font-serif text-2xl md:text-3xl lg:text-4xl text-foreground">
              AI that enhances — humans who understand your story.
            </h2>
            <p className="mt-4 text-sm md:text-base text-muted-foreground leading-relaxed">
              We use AI for the invisible magic: restoring colours, sharpening details, and stabilising old footage.
              But every creative decision (pacing, music, order, storytelling) is guided by real editors who treat
              your memories with care. You’re always in control with unlimited revisions.
            </p>

            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              <Button onClick={onStartGift} className="sm:w-auto">
                Create Their Gift
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
              <Link
                href="/privacy"
                className="inline-flex items-center justify-center rounded-md border border-border bg-background px-4 py-2 text-sm font-medium text-foreground hover:bg-muted transition-colors"
              >
                Learn how we protect your memories →
              </Link>
            </div>
          </div>

          <div className="bg-muted/30 border border-border rounded-2xl p-6 md:p-8">
            <div className="grid grid-cols-2 gap-3 mb-6">
              <div className="relative overflow-hidden rounded-xl border border-border bg-card aspect-[4/3]">
                <Image
                  src="/vintage-sepia-old-wedding-photograph-1950s-couple.jpg"
                  alt="Before restoration"
                  fill
                  className="object-cover grayscale"
                  sizes="(max-width: 1024px) 50vw, 260px"
                />
                <span className="absolute bottom-2 left-2 text-[10px] font-semibold text-white/90 bg-black/50 px-2 py-1 rounded">
                  Before
                </span>
              </div>
              <div className="relative overflow-hidden rounded-xl border border-border bg-card aspect-[4/3]">
                <Image
                  src="/restored-colorized-vintage-wedding-photograph-high.jpg"
                  alt="After restoration"
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 50vw, 260px"
                />
                <span className="absolute bottom-2 right-2 text-[10px] font-semibold text-white/90 bg-primary/80 px-2 py-1 rounded">
                  Restored
                </span>
              </div>
            </div>

            <div className="grid gap-4">
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Wand2 className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">Restoration</p>
                  <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                    Colour, clarity, and stability improvements that keep the moment authentic.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Film className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">Direction</p>
                  <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                    Humans shape the story arc so it feels like a real film — not a template.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Sparkles className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">Unlimited revisions</p>
                  <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                    Keep iterating until it feels unmistakably like them.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
