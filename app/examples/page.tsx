import Link from "next/link"
import { LandingHeader } from "@/components/landing/header"
import { Button } from "@/components/ui/button"
import { ArrowRight, Film } from "lucide-react"
import { Footer } from "@/components/footer"

const EXAMPLES = [
  {
    title: "Memory Restoration",
    description: "A short example showing restoration, pacing, and a cinematic feel.",
    src: "/videos/Memory%20Restoration.mp4",
  },
  {
    title: "Reaction‑style preview",
    description: "An example format similar to what people share on social.",
    src: "/videos/Instagram%20Video.mp4",
  },
]

export default function ExamplesPage() {
  return (
    <main className="min-h-screen bg-background">
      <LandingHeader />

      <section className="bg-background">
        <div className="container mx-auto px-4 py-10 md:py-14 max-w-6xl">
          <div className="text-center">
            <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
              Examples
            </p>
            <h1 className="mt-3 font-serif text-3xl md:text-4xl lg:text-5xl text-foreground">
              Watch a 30‑second sample film
            </h1>
            <p className="mt-4 text-sm md:text-base text-muted-foreground max-w-2xl mx-auto">
              Every film is custom — these are quick examples so you can feel the vibe before you start.
            </p>
            <div className="mt-6">
              <Button asChild size="lg" className="px-8">
                <Link href="/?quiz=1">
                  Create Their Gift <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
              <p className="mt-3 text-xs text-muted-foreground">
                24-hour delivery · Unlimited revisions · Private sharing link
              </p>
            </div>
          </div>

          <div className="mt-10 grid lg:grid-cols-2 gap-4 md:gap-6">
            {EXAMPLES.map((ex) => (
              <div key={ex.title} className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
                <div className="p-5 border-b border-border">
                  <div className="flex items-center gap-2">
                    <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Film className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-serif text-xl text-foreground">{ex.title}</p>
                      <p className="text-sm text-muted-foreground">{ex.description}</p>
                    </div>
                  </div>
                </div>
                <div className="bg-black">
                  <video
                    controls
                    playsInline
                    preload="metadata"
                    className="w-full h-auto"
                    src={ex.src}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-10 bg-muted/30 border border-border rounded-2xl p-6">
            <p className="font-serif text-xl text-foreground">What to look for</p>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li>• Cinematic pacing and music that fits the person.</li>
              <li>• Restoration that feels authentic, not plastic.</li>
              <li>• A story arc that builds emotion — not a slideshow template.</li>
            </ul>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}

