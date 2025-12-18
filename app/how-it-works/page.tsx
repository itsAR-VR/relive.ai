import Link from "next/link"
import { LandingHeader } from "@/components/landing/header"
import { Button } from "@/components/ui/button"
import { ArrowRight, Clapperboard, Heart, MessageSquare } from "lucide-react"
import { Footer } from "@/components/footer"

const STEPS = [
  {
    number: "01",
    icon: MessageSquare,
    title: "You Tell the Story",
    description:
      "Answer a few questions about who you’re honouring and upload your favourite photos and clips. We’ll help you choose what matters most.",
  },
  {
    number: "02",
    icon: Clapperboard,
    title: "We Direct the Scene",
    description:
      "Our editors and AI tools restore, enhance and weave everything into a cinematic film — with music, pacing and titles tailored to your story.",
  },
  {
    number: "03",
    icon: Heart,
    title: "They Relive the Moment",
    description:
      "You send a private link or download the file. They press play… and you watch the tears, smiles and stories flow.",
  },
]

export default function HowItWorksPage() {
  return (
    <main className="min-h-screen bg-background">
      <LandingHeader />

      <section className="bg-background">
        <div className="container mx-auto px-4 py-10 md:py-14 max-w-5xl">
          <div className="text-center">
            <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
              How it works
            </p>
            <h1 className="mt-3 font-serif text-3xl md:text-4xl lg:text-5xl text-foreground">
              It’s easier than finding last year’s photos.
            </h1>
            <p className="mt-4 text-sm md:text-base text-muted-foreground max-w-2xl mx-auto">
              Tell us who it’s for and what matters most. Our editors do the heavy lifting and deliver a gift‑wrapped
              film in 24 hours — with unlimited revisions until it feels just right.
            </p>
            <div className="mt-6">
              <Button asChild size="lg" className="px-8">
                <Link href="/?quiz=1">
                  Create Their Gift <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
              <p className="mt-3 text-xs text-muted-foreground">
                Takes 2 minutes to start · No editing skills needed
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-background py-10 md:py-14">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="grid md:grid-cols-3 gap-4 md:gap-6">
            {STEPS.map((step) => {
              const Icon = step.icon
              return (
                <div key={step.number} className="relative bg-card rounded-2xl border border-border p-6 shadow-sm">
                  <span className="absolute top-5 left-5 w-10 h-10 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center shadow-lg">
                    {step.number}
                  </span>
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 mt-12">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-serif text-xl text-foreground mb-2">{step.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>
                </div>
              )
            })}
          </div>

          <div className="mt-10 text-center">
            <Button asChild size="lg" className="px-8">
              <Link href="/?quiz=1">
                Start Their Gift <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
            <p className="mt-3 text-xs text-muted-foreground">
              24-hour delivery · Unlimited revisions · Private gift‑wrapped link
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
