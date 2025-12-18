"use client"

import Image from "next/image"
import { Star, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"

interface SocialProofProps {
  onStartGift: () => void
}

const TESTIMONIALS = [
  {
    image: "/family-portrait-multiple-generations-together-livi.jpg",
    title: "Tears of joy",
    quote:
      "My dad watched it twice in a row. He said **“I didn’t know you remembered this.”** It was the most meaningful gift I’ve ever given.",
    author: "Sarah M.",
    city: "Austin",
    role: "Daughter",
    verified: "Verified gifter · 6 months",
    rating: 5,
  },
  {
    image: "/family-photo-with-christmas-decorations-snow-falli.jpg",
    title: "Heartfelt",
    quote:
      "I was sceptical about AI, but this felt **human and beautiful**. The pacing and music were perfect — like a real film made for him.",
    author: "Michael R.",
    city: "Manchester",
    role: "Son",
    verified: "Verified gifter · 4 months",
    rating: 5,
  },
  {
    image: "/animated-vintage-wedding-couple-dancing-motion-blu.jpg",
    title: "Worth everything",
    quote:
      "Mum cried, laughed, then made us all watch it again at dinner. **It started stories we hadn’t heard in years.**",
    author: "Jennifer L.",
    city: "Toronto",
    role: "Daughter",
    verified: "Verified gifter · 5 months",
    rating: 5,
  },
  {
    image: "/placeholder-user.jpg",
    title: "Unreal reaction",
    quote:
      "The gift-wrap page made it feel special before it even started. When it played, everyone went quiet… then **the tears hit.**",
    author: "Amir K.",
    city: "Dubai",
    role: "Grandson",
    verified: "Verified gifter · 3 months",
    rating: 5,
  },
]

export function SocialProof({ onStartGift }: SocialProofProps) {
  return (
    <section className="py-12 md:py-16 bg-background relative">
      <div className="container relative mx-auto px-4">
        <div className="text-center mb-8 md:mb-10">
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-muted/30 px-4 py-2 text-xs font-semibold text-muted-foreground">
            <span className="text-foreground">Rated “Excellent”</span>
            <span className="text-accent">★★★★★</span>
            <span>Reviews from gifters (examples)</span>
          </div>
          <h2 className="mt-4 font-serif text-2xl md:text-3xl lg:text-4xl text-foreground">
            The proof is in the tissues
          </h2>
          <p className="mt-3 text-sm md:text-base text-muted-foreground max-w-2xl mx-auto">
            People don’t just watch these films — they relive them. And then they tell you stories you’ve never heard.
          </p>
        </div>

        <div className="-mx-4 md:mx-0">
          <div className="flex gap-4 overflow-x-auto snap-x snap-mandatory px-4 md:px-0 pb-2">
            {TESTIMONIALS.map((t) => (
              <TestimonialCard key={`${t.author}-${t.title}`} testimonial={t} />
            ))}
          </div>
        </div>

        <div className="mt-8 text-center">
          <Button
            onClick={onStartGift}
            size="lg"
            className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium px-6 py-5 md:px-8 md:py-6 text-base md:text-lg rounded-lg shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-[1.02] group"
          >
            <Sparkles className="w-4 h-4 md:w-5 md:h-5 mr-2 group-hover:rotate-12 transition-transform" />
            Create Their Gift
          </Button>
          <p className="mt-3 text-xs text-muted-foreground">
            24-hour delivery · Unlimited revisions · Private sharing link
          </p>
        </div>
      </div>
    </section>
  )
}

function renderEmphasis(text: string) {
  const parts = text.split("**")
  return parts.map((part, idx) => {
    const isBold = idx % 2 === 1
    if (!isBold) return part
    return (
      <strong key={idx} className="font-semibold text-foreground">
        {part}
      </strong>
    )
  })
}

function TestimonialCard({ testimonial }: { testimonial: typeof TESTIMONIALS[0] }) {
  return (
    <article className="snap-center flex-shrink-0 w-[85%] sm:w-[420px] bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
      <div className="relative h-44 w-full">
        <Image
          src={testimonial.image}
          alt=""
          fill
          className="object-cover"
          sizes="(max-width: 640px) 85vw, 420px"
        />
      </div>

      <div className="p-5">
        <div className="flex items-center justify-between gap-3">
          <div className="flex gap-0.5">
            {[...Array(testimonial.rating)].map((_, i) => (
              <Star key={i} className="w-4 h-4 fill-accent text-accent" />
            ))}
          </div>
          <span className="text-xs font-semibold text-primary">{testimonial.title}</span>
        </div>

        <p className="mt-3 text-sm text-foreground leading-relaxed">
          {renderEmphasis(testimonial.quote)}
        </p>

        <div className="mt-4 flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-foreground">
              {testimonial.author} <span className="text-muted-foreground font-medium">· {testimonial.city}</span>
            </p>
            <p className="text-xs text-muted-foreground">
              {testimonial.role} · {testimonial.verified}
            </p>
          </div>
        </div>
      </div>
    </article>
  )
}
