"use client"

import { Quote, Star } from "lucide-react"

const TESTIMONIALS = [
  {
    quote: "My dad hasn't seen his mother in 40 years. He watched this loop for an hour. Best $150 I ever spent.",
    author: "Sarah M.",
    role: "Daughter",
    rating: 5,
  },
  {
    quote: "I didn't know how to use AI, so I just told them the story. They handled the rest perfectly. The red bike detail made him cry immediately.",
    author: "Michael R.",
    role: "Son",
    rating: 5,
  },
  {
    quote: "Mom hasn't spoken much in years. She watched this video 50 times in a row. That smile was worth everything.",
    author: "Jennifer L.",
    role: "Daughter",
    rating: 5,
  },
]

const STATS = [
  { value: "500+", label: "Memories Restored" },
  { value: "98%", label: "Made Them Cry" },
  { value: "24hrs", label: "Average Delivery" },
]

export function SocialProof() {
  return (
    <section className="py-20 md:py-28 bg-muted/30 relative overflow-hidden">
      {/* Subtle decorative elements */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-80 h-80 bg-accent/5 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />

      <div className="container relative mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <span className="inline-block mb-4 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium">
            Why Families Choose Us
          </span>
          <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl text-foreground mb-4">
            The Gift of Tears
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            We don&apos;t measure success in pixels or resolution. We measure it in the moments that take their breath away.
          </p>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-4 md:gap-8 max-w-2xl mx-auto mb-16">
          {STATS.map((stat, index) => (
            <div 
              key={index}
              className="text-center p-4 md:p-6 rounded-xl bg-card border border-border"
            >
              <p className="text-2xl md:text-4xl font-serif text-primary mb-1">
                {stat.value}
              </p>
              <p className="text-xs md:text-sm text-muted-foreground">
                {stat.label}
              </p>
            </div>
          ))}
        </div>

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
          {TESTIMONIALS.map((testimonial, index) => (
            <div
              key={index}
              className="relative bg-card rounded-2xl p-6 md:p-8 border border-border shadow-sm hover:shadow-lg transition-shadow"
            >
              {/* Quote icon */}
              <div className="absolute -top-3 left-6 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Quote className="w-5 h-5 text-primary" />
              </div>

              {/* Rating */}
              <div className="flex gap-1 mb-4 mt-2">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-accent text-accent" />
                ))}
              </div>

              {/* Quote */}
              <blockquote className="text-foreground text-base md:text-lg leading-relaxed mb-6 font-serif italic">
                &ldquo;{testimonial.quote}&rdquo;
              </blockquote>

              {/* Author */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                  <span className="text-sm font-medium text-muted-foreground">
                    {testimonial.author.split(" ").map(n => n[0]).join("")}
                  </span>
                </div>
                <div>
                  <p className="font-medium text-foreground">{testimonial.author}</p>
                  <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Trust Badge */}
        <div className="mt-12 text-center">
          <p className="text-sm text-muted-foreground">
            Join hundreds of families who have given the gift of memory
          </p>
        </div>
      </div>
    </section>
  )
}
