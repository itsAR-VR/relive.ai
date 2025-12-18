import Link from "next/link"
import { LandingHeader } from "@/components/landing/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { ArrowRight, Lock, ShieldCheck, Trash2 } from "lucide-react"

const POINTS = [
  {
    icon: Lock,
    title: "Private by default",
    body: "Your gift is delivered via a private link. You decide who gets access.",
  },
  {
    icon: ShieldCheck,
    title: "Handled with care",
    body: "We use AI to enhance quality, but humans guide the storytelling decisions.",
  },
  {
    icon: Trash2,
    title: "Deleted after delivery",
    body: "We use your files only to craft the film, then delete them after delivery.",
  },
]

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-background">
      <LandingHeader />

      <section className="bg-background">
        <div className="container mx-auto px-4 py-10 md:py-14 max-w-5xl">
          <div className="text-center">
            <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
              Privacy
            </p>
            <h1 className="mt-3 font-serif text-3xl md:text-4xl lg:text-5xl text-foreground">
              We protect your memories like they’re our own.
            </h1>
            <p className="mt-4 text-sm md:text-base text-muted-foreground max-w-2xl mx-auto">
              You’re trusting us with something irreplaceable. Here’s how we keep your memories private and handle them
              with care.
            </p>
            <div className="mt-6">
              <Button asChild size="lg" className="px-8">
                <Link href="/?quiz=1">
                  Create Their Gift <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </div>
          </div>

          <div className="mt-10 grid md:grid-cols-3 gap-4 md:gap-6">
            {POINTS.map((p) => {
              const Icon = p.icon
              return (
                <div key={p.title} className="bg-card border border-border rounded-2xl p-6 shadow-sm">
                  <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <p className="font-serif text-xl text-foreground">{p.title}</p>
                  <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{p.body}</p>
                </div>
              )
            })}
          </div>

          <div className="mt-12 bg-muted/30 border border-border rounded-2xl p-6 md:p-8">
            <p className="font-serif text-2xl text-foreground">Have a specific question?</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Reach out any time and we’ll help you feel confident before you upload anything.
            </p>
            <div className="mt-5 flex flex-col sm:flex-row gap-3">
              <Button asChild className="sm:w-auto">
                <Link href="/support">Go to support</Link>
              </Button>
              <Link
                href="/faq"
                className="inline-flex items-center justify-center rounded-md border border-border bg-background px-4 py-2 text-sm font-medium text-foreground hover:bg-muted transition-colors"
              >
                Read FAQs →
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}

