import { useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowRight, ArrowLeft, Cpu, Shield, Eye, Zap,
  CheckCircle2, ChevronRight
} from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import SectionBadge from "@/components/landing/SectionBadge";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import SocialProofTicker from "@/components/landing/SocialProofTicker";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const fade = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true as const },
};

const coverageCards = [
  { num: "01", title: "Storefront & Entrance", desc: "Footfall counting, people re-ID, crowd density at every entry point.", icon: Eye },
  { num: "02", title: "Sales Floor", desc: "Heat maps, dwell tracking, product interest detection, staff zone compliance.", icon: Eye },
  { num: "03", title: "Checkout & POS", desc: "Self-checkout fraud, scan-skip detection, cashier behavior monitoring.", icon: Eye },
  { num: "04", title: "Staff & Back Office", desc: "Task verification, zone assignment, idle time, shift compliance scoring.", icon: Eye },
  { num: "05", title: "Fire & Safety Zones", desc: "Real fire vs false alarm AI, thermal anomaly detection, evacuation protocol integration.", icon: Eye },
  { num: "06", title: "Restricted Areas", desc: "Unauthorized zone access alerts, perimeter breach detection, audit log of all entries.", icon: Eye },
];

const complianceBullets = [
  "No facial recognition or biometric storage",
  "All video processed on-device — never transmitted raw",
  "Person embeddings anonymized and auto-deleted after 30 days",
  "Full audit log available for regulatory inspection",
];

const frameworks = ["GDPR", "IT Act 2000", "DPDPA 2023", "ISO 27001", "SOC 2 (Coming Soon)", "Edge AI Certified", "NASSCOM Compliant", "AWS Partner"];

const processSteps = [
  { title: "Store Assessment & Threat Modeling", desc: "Map your store's blind spots, high-risk zones, and camera placement gaps. Delivered as a risk heat map + camera placement recommendation document within 48 hours of site visit. No commitment required.", link: "Get a Free Store Assessment →" },
  { title: "Reconnaissance & Module Selection", desc: "Based on the risk map, we recommend which of the 5 AI modules to activate. Most stores start with Loss Prevention + Customer Analytics, adding modules over time as ROI is demonstrated." },
  { title: "Hardware Installation & Edge Configuration", desc: "Our engineers install edge AI cameras and configure NVIDIA Jetson / Hailo processors on-site. Average installation: 6 hours per store location. Zero store downtime required." },
  { title: "Calibration & Shadow Mode", desc: "System runs in shadow mode for 14 days — detecting but not alerting — while learning your store's normal patterns. False positive rate drops to under 2% before live mode activates." },
  { title: "Go Live & Ongoing Partnership", desc: "System goes live. Real-time alerts activate. Monthly AI model updates pushed silently. We conduct a 30-day review call to verify outcomes and optimize thresholds." },
];

const benefits = [
  {
    icon: Cpu,
    title: "Technical Depth",
    bullets: ["Edge-processed, <3 second alert latency", "YOLOv8 + Vision Transformers at edge", "On-device NVIDIA Jetson / Hailo AI chips"],
  },
  {
    icon: Shield,
    title: "Compliance Ready",
    bullets: ["GDPR + IT Act 2000 + DPDPA 2023", "No biometric database required", "Full audit log for regulatory review"],
  },
  {
    icon: Eye,
    title: "Real-Time Visibility",
    bullets: ["Live dashboard across all store locations", "WhatsApp / SMS / push alert pipeline", "Monthly intelligence reports included"],
  },
];

const testimonials = [
  { name: "Priya Sharma", role: "VP Operations", company: "Fashion House", quote: "The 48-hour deployment promise seemed too good to be true. They were live in 31 hours." },
  { name: "Amit Patel", role: "Safety Head", company: "Warehouse Corp", quote: "Shadow mode was the key — by the time it went live, false alarms were basically zero." },
  { name: "Rajesh Kumar", role: "Store Director", company: "Mega Mart", quote: "We didn't just get cameras. We got a monthly report that told us exactly where our losses were coming from." },
];

const faqs = [
  { q: "What makes VisionIQ different from regular CCTV?", a: "Traditional CCTV records video for review after incidents. VisionIQ processes video in real time using AI, detecting threats and generating alerts within seconds — before incidents escalate." },
  { q: "Do you use facial recognition anywhere?", a: "No. VisionIQ is built on behavioral AI and silhouette analysis. We never capture, store, or process facial features or biometric data." },
  { q: "How long does a store deployment take?", a: "Average deployment is 48 hours from hardware installation to live dashboard access. The 14-day calibration period runs in parallel." },
  { q: "What methodology do you follow for AI model updates?", a: "Monthly model updates are pushed silently to edge devices. Each update is tested against your store's historical data before deployment to ensure accuracy improvements." },
  { q: "Do you provide ongoing support after deployment?", a: "Yes. Every deployment includes a dedicated customer success manager, monthly review calls, and quarterly model optimization sessions." },
];

const Approach = () => (
  <div className="min-h-screen bg-background">
    <Navbar />

    {/* Hero */}
    <section className="pt-20 md:pt-28 pb-12 md:pb-20">
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <motion.div {...fade}>
          <Link to="/" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors min-h-[44px] mb-4">
            <ArrowLeft className="h-4 w-4" /> Back to Home
          </Link>
          <SectionBadge text="OUR APPROACH" />
          <h1 className="mt-4 text-[28px] font-extrabold text-foreground sm:text-4xl md:text-5xl lg:text-[56px] leading-[1.1] max-w-3xl">
            How VisionIQ Deploys in 48 Hours
          </h1>
          <p className="mt-4 md:mt-6 text-sm md:text-lg text-muted-foreground max-w-2xl leading-relaxed">
            We use a rigorous, store-specific methodology to deliver measurable outcomes — not just installed cameras.
          </p>
          <div className="mt-6 md:mt-8 flex flex-col sm:flex-row gap-3">
            <Button size="lg" className="rounded-md font-semibold text-base px-8 h-12">
              Start Your Assessment <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
            <Button size="lg" variant="outline" className="rounded-md font-semibold text-base px-8 h-12" asChild>
              <Link to="/case-studies">View Case Studies</Link>
            </Button>
          </div>
          <div className="mt-8 flex flex-wrap gap-6 md:gap-10">
            {[
              { value: "48hr", label: "Average Deployment" },
              { value: "14 Days", label: "Model Calibration" },
              { value: "30 Day", label: "ROI Guarantee" },
            ].map((s, i) => (
              <div key={i}>
                <p className="text-2xl md:text-3xl font-extrabold text-primary">{s.value}</p>
                <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>

    <SocialProofTicker />

    {/* Coverage */}
    <section className="py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <motion.div {...fade} className="text-center mb-10 md:mb-14">
          <SectionBadge text="COMPLETE COVERAGE" />
          <h2 className="mt-4 text-2xl font-bold text-foreground md:text-4xl">
            Complete Coverage Across Your Entire Operation
          </h2>
          <p className="mt-3 text-sm md:text-base text-muted-foreground max-w-2xl mx-auto">
            Our platform is purpose-built for retail, F&B, logistics, and hospitality — delivering intelligence across all systems and staff.
          </p>
        </motion.div>
        <div className="grid gap-4 md:gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {coverageCards.map((card, i) => (
            <motion.div key={i} {...fade} transition={{ delay: i * 0.08 }} className="rounded-xl border border-border bg-card p-5 md:p-6 hover:border-primary/40 transition-colors">
              <span className="text-3xl font-extrabold text-primary/20 mb-3 block">{card.num}</span>
              <h3 className="text-sm md:text-base font-bold text-foreground mb-2">{card.title}</h3>
              <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">{card.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>

    {/* Compliance */}
    <section className="py-16 md:py-24 bg-surface-dark">
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16">
          <motion.div {...fade}>
            <SectionBadge text="COMPLIANCE FIRST" />
            <h2 className="mt-4 text-2xl font-bold text-foreground md:text-4xl">Security Meets Compliance</h2>
            <p className="mt-4 text-sm md:text-base text-muted-foreground leading-relaxed">
              VisionIQ is architected for GDPR, India's IT Act 2000, and DPDPA 2023 compliance from day one. No biometric database, no raw video transmission, no third-party data sharing.
            </p>
            <ul className="mt-6 space-y-3">
              {complianceBullets.map((b, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-muted-foreground">
                  <span className="h-2 w-2 rounded-full bg-primary mt-1.5 shrink-0" />
                  {b}
                </li>
              ))}
            </ul>
          </motion.div>
          <motion.div {...fade} className="rounded-xl border border-border bg-card p-6 md:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground mb-4">Supported Frameworks</p>
            <div className="flex flex-wrap gap-2">
              {frameworks.map((f, i) => (
                <span key={i} className="rounded-full border border-border bg-background px-4 py-2 text-sm text-foreground">
                  {f}
                </span>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>

    {/* Process Steps */}
    <section className="py-16 md:py-24">
      <div className="mx-auto max-w-4xl px-4 md:px-6">
        <motion.div {...fade} className="text-center mb-10 md:mb-14">
          <SectionBadge text="IN DETAIL" />
          <h2 className="mt-4 text-2xl font-bold text-foreground md:text-4xl">
            The VisionIQ Deployment Process
          </h2>
          <p className="mt-3 text-sm md:text-base text-muted-foreground max-w-2xl mx-auto">
            We use a structured methodology to deliver fast deployments without sacrificing accuracy or compliance.
          </p>
        </motion.div>
        <div className="relative">
          {/* Connecting line */}
          <div className="absolute left-[23px] top-0 bottom-0 w-px bg-primary/20 hidden md:block" />
          <div className="space-y-8 md:space-y-12">
            {processSteps.map((step, i) => (
              <motion.div key={i} {...fade} transition={{ delay: i * 0.1 }} className="flex gap-4 md:gap-6">
                <div className="flex flex-col items-center shrink-0">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold text-lg z-10">
                    {i + 1}
                  </div>
                </div>
                <div className="pb-4">
                  <h3 className="text-base md:text-lg font-bold text-foreground mb-2">Step {i + 1} — {step.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{step.desc}</p>
                  {step.link && (
                    <button className="mt-3 text-sm font-semibold text-primary hover:underline min-h-[44px] flex items-center">
                      {step.link}
                    </button>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
          <div className="mt-8 text-center">
            <Button size="lg" className="rounded-md font-semibold text-base px-8 h-12">
              Request a Security Audit <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </section>

    {/* Benefits */}
    <section className="py-16 md:py-24 bg-surface-dark">
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <motion.div {...fade} className="text-center mb-10 md:mb-14">
          <SectionBadge text="IN DETAIL" />
          <h2 className="mt-4 text-2xl font-bold text-foreground md:text-4xl">Benefits of VisionIQ Deployment</h2>
        </motion.div>
        <div className="grid gap-6 md:grid-cols-3">
          {benefits.map((b, i) => {
            const Icon = b.icon;
            return (
              <motion.div key={i} {...fade} transition={{ delay: i * 0.1 }} className="rounded-xl border border-border bg-card p-6">
                <Icon className="h-6 w-6 text-primary mb-4" />
                <h3 className="text-base font-bold text-foreground mb-4">{b.title}</h3>
                <ul className="space-y-2">
                  {b.bullets.map((bullet, j) => (
                    <li key={j} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <span className="h-1.5 w-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                      {bullet}
                    </li>
                  ))}
                </ul>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>

    {/* Testimonials */}
    <section className="py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <motion.div {...fade} className="mb-10 md:mb-14">
          <SectionBadge text="TESTIMONIALS" />
          <h2 className="mt-4 text-2xl font-bold text-foreground md:text-4xl">Trusted by Store Operators</h2>
        </motion.div>
        <div className="grid gap-6 md:grid-cols-3">
          {testimonials.map((t, i) => (
            <motion.div key={i} {...fade} transition={{ delay: i * 0.1 }} className="rounded-xl border border-border bg-card p-5 md:p-6">
              <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-muted-foreground mb-3">{t.company}</p>
              <p className="text-sm md:text-[15px] text-foreground leading-relaxed">"{t.quote}"</p>
              <div className="mt-4 pt-3 border-t border-border">
                <p className="text-sm font-semibold text-foreground">{t.name}</p>
                <p className="text-xs text-muted-foreground">{t.role}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>

    {/* FAQ */}
    <section className="py-16 md:py-24 bg-surface-dark">
      <div className="mx-auto max-w-3xl px-4 md:px-6">
        <motion.div {...fade} className="text-center mb-8 md:mb-12">
          <SectionBadge text="FAQ" />
          <h2 className="text-2xl font-bold text-foreground md:text-4xl mt-2">Frequently Asked Questions</h2>
        </motion.div>
        <Accordion type="single" collapsible className="w-full">
          {faqs.map((faq, i) => (
            <AccordionItem key={i} value={`faq-${i}`} className="border-border">
              <AccordionTrigger className="text-left text-foreground hover:no-underline py-4 md:py-5 text-sm md:text-base min-h-[44px]">
                {faq.q}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground leading-relaxed text-sm">
                {faq.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>

    {/* Bottom CTA */}
    <section className="py-16 md:py-24 dot-matrix-bg">
      <div className="mx-auto max-w-3xl px-4 md:px-6 text-center">
        <motion.div {...fade}>
          <h2 className="text-2xl font-bold text-foreground md:text-5xl">
            Deploy Faster. See Smarter. Lose Less.
          </h2>
          <p className="mt-4 md:mt-6 text-sm md:text-lg text-muted-foreground max-w-xl mx-auto">
            VisionIQ is in your store in 48 hours. Our team handles everything end to end. Every time.
          </p>
          <Button size="lg" className="mt-6 md:mt-8 rounded-md font-semibold text-base px-8 h-12">
            Start Your Assessment <ArrowRight className="ml-1 h-4 w-4" />
          </Button>
        </motion.div>
      </div>
    </section>

    <Footer />
  </div>
);

export default Approach;
