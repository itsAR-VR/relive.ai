"use client"

import Link from "next/link"
import * as AccordionPrimitive from "@radix-ui/react-accordion"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { cn } from "@/lib/utils"

interface FaqPreviewProps {
  onStartGift: () => void
}

const FAQS = [
  {
    q: "How long does it take to get my film?",
    a: "Most films are delivered within 24 hours. If your story needs extra care, we’ll keep you updated throughout.",
  },
  {
    q: "What if I don’t like the first version?",
    a: "That’s what unlimited revisions are for. Tell us what feels off, and we’ll refine it until it feels right.",
  },
  {
    q: "What kind of files can I upload?",
    a: "Photos, video clips, and anything you have. We’ll guide you on what works best during the process.",
  },
  {
    q: "Is everything private and secure?",
    a: "Yes. Your film is delivered via a private link, and we treat your memories with care throughout the process.",
  },
]

function splitIntoTwoColumns<T>(items: T[]) {
  const mid = Math.ceil(items.length / 2)
  return [items.slice(0, mid), items.slice(mid)] as const
}

export function FaqPreview({ onStartGift }: FaqPreviewProps) {
  const [leftFaqs, rightFaqs] = splitIntoTwoColumns(FAQS)

  return (
    <section className="relative overflow-hidden bg-secondary/60 py-12 md:py-16 border-t border-border/60">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-32 -left-32 h-80 w-80 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -bottom-32 -right-32 h-80 w-80 rounded-full bg-accent/10 blur-3xl" />
      </div>

      <div className="container relative mx-auto px-4 max-w-6xl">
        <div className="text-center mb-8">
          <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
            Quick answers
          </p>
          <h2 className="mt-3 font-serif text-2xl md:text-3xl lg:text-4xl text-foreground">
            Everything you need to feel confident
          </h2>
          <p className="mt-4 text-sm md:text-base text-muted-foreground max-w-2xl mx-auto">
            Short, clear answers — and a real human if you need help.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-3 md:gap-4">
          {[leftFaqs, rightFaqs].map((col, idx) => (
            <AccordionPrimitive.Root key={idx} type="single" collapsible className="grid gap-3">
              {col.map((faq) => (
                <FaqItem key={faq.q} value={faq.q} question={faq.q} answer={faq.a} onStartGift={onStartGift} />
              ))}
            </AccordionPrimitive.Root>
          ))}
        </div>

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Button onClick={onStartGift}>Create Their Gift</Button>
          <Link
            href="/support"
            className="inline-flex items-center justify-center rounded-full border border-border bg-background px-6 py-3 text-sm font-semibold text-foreground hover:bg-muted transition-colors shadow-sm"
          >
            Go to support →
          </Link>
          <Link
            href="/faq"
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            View all FAQs
          </Link>
        </div>
      </div>
    </section>
  )
}

function FaqItem({
  value,
  question,
  answer,
  onStartGift,
}: {
  value: string
  question: string
  answer: string
  onStartGift: () => void
}) {
  return (
    <AccordionPrimitive.Item value={value} className="rounded-2xl border border-border bg-background/70 shadow-sm">
      <AccordionPrimitive.Header>
        <AccordionPrimitive.Trigger
          className={cn(
            "w-full flex items-center justify-between gap-4 px-5 py-4 text-left",
            "font-serif text-base md:text-lg text-foreground",
            "hover:bg-muted/40 transition-colors rounded-2xl",
            "[&[data-state=open]>svg]:rotate-45",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
          )}
        >
          <span>{question}</span>
          <Plus className="h-5 w-5 text-muted-foreground transition-transform" />
        </AccordionPrimitive.Trigger>
      </AccordionPrimitive.Header>
      <AccordionPrimitive.Content className="overflow-hidden data-[state=open]:animate-accordion-down data-[state=closed]:animate-accordion-up">
        <div className="px-5 pb-5 text-sm text-muted-foreground leading-relaxed">
          {answer}{" "}
          <button
            type="button"
            onClick={onStartGift}
            className="text-primary font-semibold hover:text-primary/80 transition-colors"
          >
            Ready to start? Create Their Gift
          </button>
        </div>
      </AccordionPrimitive.Content>
    </AccordionPrimitive.Item>
  )
}
