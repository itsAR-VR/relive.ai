"use client"

import Image from "next/image"

const PAIN_STATS = [
  {
    iconSrc: "/icons/gift-box.png",
    value: "68%",
    label: "of gifts are returned or unused within 6 months",
    labelShort: "Returned / unused in 6 months",
  },
  {
    iconSrc: "/icons/photos.png",
    value: "84%",
    label: "say their favourite photos are scattered across devices",
    labelShort: "Photos scattered across devices",
  },
  {
    iconSrc: "/icons/magic-wand.png",
    value: "74%",
    label: "say most “AI” tools feel cold or templated",
    labelShort: "Most “AI” feels cold",
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

        <div className="mt-6 max-w-5xl mx-auto">
          <div className="grid gap-5 sm:gap-10 sm:grid-cols-3 justify-items-center">
            {PAIN_STATS.map((stat) => (
              <div key={stat.label} className="w-full max-w-[340px] text-center">
                <div className="flex items-center justify-center gap-4">
                  <Image
                    src={stat.iconSrc}
                    alt=""
                    width={80}
                    height={80}
                    className="h-20 w-20"
                  />
                  <p className="font-serif text-6xl md:text-6xl lg:text-6xl tracking-tight leading-none">
                    {stat.value}
                  </p>
                </div>

                <p className="mt-2 mx-auto text-base font-semibold text-background/90 leading-snug max-w-[320px] sm:hidden">
                  {stat.labelShort}
                </p>
                <p className="mt-3 mx-auto hidden sm:block text-xs md:text-sm text-background/80 leading-relaxed max-w-[320px]">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
