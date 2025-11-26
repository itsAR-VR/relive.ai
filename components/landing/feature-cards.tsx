import { Sparkles, Shield, Download, Snowflake, Clock, Users } from "lucide-react"

const features = [
  {
    icon: Sparkles,
    title: "Relive Memories",
    description: "Transform still photographs into living moments with natural, subtle motion.",
  },
  {
    icon: Snowflake,
    title: "Seasonal Magic",
    description: "Add festive decorations—falling snow, fairy lights, and holiday touches.",
  },
  {
    icon: Clock,
    title: "Younger Self",
    description: "See what loved ones looked like in their youth. Connect across generations.",
  },
  {
    icon: Users,
    title: "Unite Families",
    description: "Bring together family members who were never photographed together.",
  },
  {
    icon: Shield,
    title: "Privacy First",
    description: "We never store your photos. Everything is deleted after you download.",
  },
  {
    icon: Download,
    title: "Yours Forever",
    description: "Download in high quality. Share as gifts treasured for generations.",
  },
]

export function FeatureCards() {
  return (
    <section className="bg-[#f5f1e6] px-4 py-12 md:py-16">
      <div className="container mx-auto max-w-5xl">
        <div className="text-center mb-8">
          <h2 className="font-serif text-2xl md:text-3xl text-[#3d3632]">Everything You Can Do</h2>
          <p className="mt-2 text-[#6b5e54] max-w-xl mx-auto text-sm">
            Simple tools designed with love, privacy, and your precious memories in mind.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((feature, index) => (
            <div
              key={index}
              className="p-4 rounded-lg bg-white border border-[#d4c9b8] hover:shadow-md transition-shadow"
            >
              <div className="w-10 h-10 rounded-lg bg-[#f5f1e6] flex items-center justify-center mb-3">
                <feature.icon className="h-5 w-5 text-[#a67c52]" />
              </div>
              <h3 className="font-serif text-base text-[#3d3632] mb-1.5">{feature.title}</h3>
              <p className="text-[#6b5e54] text-sm leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
