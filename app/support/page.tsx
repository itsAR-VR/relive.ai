"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Send, CheckCircle2, MessageSquare, Loader2 } from "lucide-react"

const SUBJECT_OPTIONS = [
  { value: "General Inquiry", label: "General Inquiry" },
  { value: "Order Issue", label: "Order Issue" },
  { value: "Technical Problem", label: "Technical Problem" },
  { value: "Billing", label: "Billing" },
  { value: "Other", label: "Other" },
]

export default function SupportPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
    orderId: "",
  })
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [ticketId, setTicketId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    setError(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          subject: formData.subject,
          message: formData.message,
          orderId: formData.orderId || undefined,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to submit support request")
      }

      setTicketId(data.ticket.id)
      setSubmitted(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card/80 backdrop-blur-sm border-b border-border">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center">
            <Image
              src="/gifting-moments-logo.svg"
              alt="Gifting Moments"
              width={220}
              height={75}
              className="h-16 md:h-20 w-auto"
            />
          </Link>
          <Link
            href="/"
            className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-2xl mx-auto px-4 py-10 md:py-16">
        {submitted ? (
          /* Success State */
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-8 h-8 text-green-600" />
            </div>
            <h1 className="font-serif text-2xl md:text-3xl text-foreground mb-3">
              Message Received!
            </h1>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Thank you for reaching out. We've sent a confirmation to your email and will get back to you within 24-48 hours.
            </p>
            {ticketId && (
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-muted rounded-lg mb-8">
                <span className="text-sm text-muted-foreground">Ticket ID:</span>
                <span className="font-mono text-sm font-medium text-foreground">
                  #{ticketId.slice(0, 8)}
                </span>
              </div>
            )}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/">
                <Button variant="outline" className="w-full sm:w-auto">
                  Return Home
                </Button>
              </Link>
              <Button
                onClick={() => {
                  setSubmitted(false)
                  setFormData({ name: "", email: "", subject: "", message: "", orderId: "" })
                  setTicketId(null)
                }}
                className="w-full sm:w-auto"
              >
                Submit Another Request
              </Button>
            </div>
          </div>
        ) : (
          /* Form State */
          <>
            <div className="text-center mb-8">
              <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="w-7 h-7 text-primary" />
              </div>
              <h1 className="font-serif text-2xl md:text-3xl text-foreground mb-2">
                How Can We Help?
              </h1>
              <p className="text-muted-foreground max-w-md mx-auto">
                Have a question or need assistance? We're here to help make your gifting experience perfect.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Name */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-foreground mb-1.5">
                  Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 rounded-lg border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                  placeholder="Your name"
                />
              </div>

              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-foreground mb-1.5">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 rounded-lg border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                  placeholder="you@example.com"
                />
              </div>

              {/* Subject */}
              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-foreground mb-1.5">
                  Subject <span className="text-red-500">*</span>
                </label>
                <select
                  id="subject"
                  name="subject"
                  required
                  value={formData.subject}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 rounded-lg border border-border bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                >
                  <option value="" disabled>
                    Select a topic
                  </option>
                  {SUBJECT_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Order ID (Optional) */}
              <div>
                <label htmlFor="orderId" className="block text-sm font-medium text-foreground mb-1.5">
                  Order ID <span className="text-muted-foreground font-normal">(optional)</span>
                </label>
                <input
                  type="text"
                  id="orderId"
                  name="orderId"
                  value={formData.orderId}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 rounded-lg border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors font-mono text-sm"
                  placeholder="e.g., a1b2c3d4-..."
                />
                <p className="mt-1 text-xs text-muted-foreground">
                  If your request is about a specific order, include the order ID from your dashboard.
                </p>
              </div>

              {/* Message */}
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-foreground mb-1.5">
                  Message <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="message"
                  name="message"
                  required
                  rows={5}
                  minLength={10}
                  maxLength={5000}
                  value={formData.message}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 rounded-lg border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors resize-none"
                  placeholder="Tell us how we can help..."
                />
                <p className="mt-1 text-xs text-muted-foreground text-right">
                  {formData.message.length}/5000
                </p>
              </div>

              {/* Error Message */}
              {error && (
                <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
                  {error}
                </div>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={loading}
                className="w-full h-11 text-base font-medium"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Send Message
                  </>
                )}
              </Button>

              <p className="text-center text-xs text-muted-foreground">
                We typically respond within 24-48 hours.
              </p>
            </form>
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-muted/30 py-6">
        <div className="container mx-auto px-4 text-center">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} Gifting Moments
          </p>
        </div>
      </footer>
    </div>
  )
}
