import { Heart, Clock, Users } from "lucide-react"

export function MissionSection() {
  return (
    <section className="bg-[#3d3632] px-4 py-12 md:py-16">
      <div className="container mx-auto max-w-4xl">
        <div className="text-center mb-10">
          <h2 className="font-serif text-2xl md:text-3xl text-[#f5f1e6] mb-4">Why We Built Moments</h2>
          <p className="text-[#c4b8a8] text-base leading-relaxed max-w-2xl mx-auto">
            It started with a simple wish: to let my grandmother see her parents dance at their wedding one more time.
            She had only a faded photograph, but the memory of their joy lived vividly in her heart.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          <div className="text-center p-4">
            <div className="w-12 h-12 rounded-full bg-[#a67c52]/20 flex items-center justify-center mx-auto mb-3">
              <Heart className="h-5 w-5 text-[#d4b896]" />
            </div>
            <h3 className="font-serif text-lg text-[#f5f1e6] mb-2">For the Ones You Love</h3>
            <p className="text-[#c4b8a8] text-sm leading-relaxed">
              Give your grandmother the gift of seeing her parents move and smile again. Show your children their
              great-grandparents as living, breathing people.
            </p>
          </div>

          <div className="text-center p-4">
            <div className="w-12 h-12 rounded-full bg-[#a67c52]/20 flex items-center justify-center mx-auto mb-3">
              <Clock className="h-5 w-5 text-[#d4b896]" />
            </div>
            <h3 className="font-serif text-lg text-[#f5f1e6] mb-2">Before Time Runs Out</h3>
            <p className="text-[#c4b8a8] text-sm leading-relaxed">
              Our elders carry stories that photographs alone cannot tell. Bring these images to life while they're
              still with us to share the joy.
            </p>
          </div>

          <div className="text-center p-4">
            <div className="w-12 h-12 rounded-full bg-[#a67c52]/20 flex items-center justify-center mx-auto mb-3">
              <Users className="h-5 w-5 text-[#d4b896]" />
            </div>
            <h3 className="font-serif text-lg text-[#f5f1e6] mb-2">Bridging Generations</h3>
            <p className="text-[#c4b8a8] text-sm leading-relaxed">
              When children see their ancestors come alive, history becomes personal. Family becomes tangible. The past
              reaches forward to touch the present.
            </p>
          </div>
        </div>

        <div className="mt-10 p-6 rounded-xl bg-[#4a433e] text-center">
          <p className="font-serif text-lg text-[#f5f1e6] italic">
            "Every photograph holds a moment that once lived and breathed. Our mission is to let you experience that
            moment once more."
          </p>
          <p className="mt-3 text-[#a67c52] text-sm font-medium">— The Moments Team</p>
        </div>
      </div>
    </section>
  )
}
