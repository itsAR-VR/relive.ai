import Link from "next/link"
import { LandingHeader } from "@/components/landing/header"
import { Footer } from "@/components/footer"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"

const FAQS = [
  {
    q: "How long does it take to get my film?",
    a: "Most films are delivered within 24 hours. If your story needs extra care, we’ll keep you updated throughout.",
  },
  {
    q: "What if I don’t like the first version?",
    a: "You get unlimited revisions. Tell us what feels off (music, pacing, order, titles) and we’ll refine it until it feels right.",
  },
  {
    q: "What kind of files can I upload?",
    a: "Photos and video clips are perfect. If you’re unsure, start the gift and we’ll guide you on what works best.",
  },
  {
    q: "Can I make films for more than one person?",
    a: "Yes — many gifters make one film for each parent or grandparent. You can start another gift anytime.",
  },
]

const PRIVACY_FAQS = [
  {
    q: "Is everything private and secure?",
    a: "Yes. Your film is delivered via a private link and shared only with the people you choose. We treat your memories with care throughout the process.",
  },
  {
    q: "Do you use AI to replace real people?",
    a: "No. We use AI to enhance (restoration, stabilisation, clarity). Humans direct the storytelling decisions so the film feels personal — not templated.",
  },
]

export default function FaqPage() {
  return (
    <main className="min-h-screen bg-background">
      <LandingHeader />

      <section className="bg-background">
        <div className="container mx-auto px-4 py-10 md:py-14 max-w-5xl">
          <div className="text-center">
            <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
              FAQ
            </p>
            <h1 className="mt-3 font-serif text-3xl md:text-4xl lg:text-5xl text-foreground">
              Quick answers
            </h1>
            <p className="mt-4 text-sm md:text-base text-muted-foreground max-w-2xl mx-auto">
              Everything you need to feel confident — and a real human if you need help.
            </p>
            <div className="mt-6">
              <Button asChild size="lg" className="px-8">
                <Link href="/?quiz=1">
                  Create Their Gift <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </div>
          </div>

          <div className="mt-10 bg-card border border-border rounded-2xl p-4 md:p-6 shadow-sm">
            <Accordion type="single" collapsible className="w-full">
              {FAQS.map((faq) => (
                <AccordionItem key={faq.q} value={faq.q}>
                  <AccordionTrigger className="font-serif text-base md:text-lg">
                    {faq.q}
                  </AccordionTrigger>
                  <AccordionContent className="text-sm text-muted-foreground leading-relaxed">
                    {faq.a}{" "}
                    <Link href="/?quiz=1" className="text-primary font-semibold hover:text-primary/80">
                      Ready to start? Create Their Gift
                    </Link>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>

          <div id="privacy" className="mt-12">
            <div className="text-center mb-6">
              <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                Privacy & AI
              </p>
              <h2 className="mt-2 font-serif text-2xl md:text-3xl text-foreground">
                AI that enhances, humans who understand your story
              </h2>
            </div>

            <div className="bg-card border border-border rounded-2xl p-4 md:p-6 shadow-sm">
              <Accordion type="single" collapsible className="w-full">
                {PRIVACY_FAQS.map((faq) => (
                  <AccordionItem key={faq.q} value={faq.q}>
                    <AccordionTrigger className="font-serif text-base md:text-lg">
                      {faq.q}
                    </AccordionTrigger>
                    <AccordionContent className="text-sm text-muted-foreground leading-relaxed">
                      {faq.a}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </div>

          <div className="mt-12 bg-muted/30 border border-border rounded-2xl p-6">
            <p className="font-serif text-xl text-foreground">Still have questions?</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Head to support — we usually respond within 24–48 hours.
            </p>
            <div className="mt-5 flex flex-col sm:flex-row gap-3">
              <Button asChild className="sm:w-auto">
                <Link href="/support">Go to support</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
