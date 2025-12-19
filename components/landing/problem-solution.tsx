"use client"

import Image from "next/image"

const PAIN_STATS = [
  {
    iconSrc: "/icons/gift-box.png",
    value: "68%",
    label: "of gifts are returned or unused within 6 months",
  },
  {
    iconSrc: "/icons/photos.png",
    value: "84%",
    label: "say their favourite photos are scattered across devices",
  },
  {
    iconSrc: "/icons/magic-wand.png",
    value: "74%",
    label: "say most “AI” tools feel cold or templated",
  },
]

export function ProblemSolution() {
  return (
    <section className="bg-foreground text-background">
      <div className="container mx-auto px-4 py-12 md:py-16">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-xs font-semibold tracking-wide uppercase text-background/70">
            Why normal gifts fall short
          </p>
          <h2 className="mt-4 font-serif text-3xl md:text-4xl lg:text-5xl leading-tight">
            Most gifts are forgotten. This one becomes family canon.
          </h2>
          <p className="mt-4 text-sm md:text-base text-background/80 leading-relaxed">
            Flowers wilt, gift cards get lost and gadgets end up in drawers. But the stories in your old photos
            and home videos are priceless — they just need a stage. Gifting Moments turns those forgotten files
            into a film they’ll rewatch for years.
          </p>
        </div>

        <div className="mt-10 grid gap-8 sm:grid-cols-3">
          {PAIN_STATS.map((stat) => (
            <div key={stat.label} className="text-center sm:text-left">
              <div className="flex items-center justify-center sm:justify-start gap-4">
                <Image
                  src={stat.iconSrc}
                  alt=""
                  width={64}
                  height={64}
                  className="h-16 w-16"
                />
                <p className="font-serif text-4xl md:text-5xl tracking-tight">{stat.value}</p>
              </div>
              <p className="mt-3 text-xs md:text-sm text-background/80 leading-relaxed max-w-[240px] sm:max-w-none">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
