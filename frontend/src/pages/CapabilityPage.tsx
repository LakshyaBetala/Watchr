import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, ArrowLeft, ChevronDown } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import SectionBadge from "@/components/landing/SectionBadge";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import SocialProofTicker from "@/components/landing/SocialProofTicker";
import HeroCanvas from "@/components/landing/HeroCanvas";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { capabilityPages } from "@/data/capabilityPageData";

const fade = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true as const },
};

const CapabilityPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const data = slug ? capabilityPages[slug] : null;
  const [openStep, setOpenStep] = useState(0);

  if (!data) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Capability not found</h1>
          <Link to="/" className="text-primary hover:underline">← Back to Home</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="relative pt-20 md:pt-24 pb-12 md:pb-20 overflow-hidden">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <motion.div {...fade}>
              <Link to="/" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors min-h-[44px] mb-4">
                <ArrowLeft className="h-4 w-4" /> Back to Home
              </Link>
              <SectionBadge text={data.badge} />
              <h1 className="mt-4 text-[28px] font-extrabold text-foreground sm:text-4xl md:text-5xl lg:text-[56px] leading-[1.1]">
                {data.heroTitle}
              </h1>
              <p className="mt-4 md:mt-6 text-sm md:text-lg text-muted-foreground max-w-xl leading-relaxed">
                {data.heroSub}
              </p>
              <Button size="lg" className="mt-6 md:mt-8 w-full sm:w-auto rounded-md font-semibold text-base px-8 h-12">
                Request a Demo <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
              <div className="mt-8 flex flex-wrap gap-6 md:gap-10">
                {data.stats.map((s, i) => (
                  <div key={i}>
                    <p className="text-2xl md:text-3xl font-extrabold text-primary">{s.value}</p>
                    <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
                  </div>
                ))}
              </div>
            </motion.div>
            <div className="relative h-[300px] md:h-[400px] lg:h-[500px] hidden md:block">
              <HeroCanvas />
            </div>
          </div>
        </div>
      </section>

      <SocialProofTicker />

      {/* Client-Centered Approach */}
      <section className="py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="grid lg:grid-cols-2 gap-10 lg:gap-16">
            {/* Left - sticky */}
            <div className="lg:sticky lg:top-28 lg:self-start">
              <motion.div {...fade}>
                <SectionBadge text="OUR METHODOLOGY" />
                <h2 className="mt-4 text-2xl font-bold text-foreground md:text-4xl">
                  {data.methodologyTitle}
                </h2>
                <p className="mt-4 text-sm md:text-base text-muted-foreground leading-relaxed">
                  {data.methodologyBody}
                </p>
                <div className="mt-8">
                  <p className="text-sm font-bold text-foreground mb-2">Client Engagement</p>
                  <p className="text-sm text-muted-foreground leading-relaxed">{data.clientEngagement}</p>
                </div>
                <div className="mt-6">
                  <p className="text-sm font-bold text-foreground mb-3">Team Structure</p>
                  <ul className="space-y-2">
                    {data.team.map((t, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span className="h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                        {t}
                      </li>
                    ))}
                  </ul>
                </div>
                <p className="mt-4 text-xs text-muted-foreground italic">{data.teamNote}</p>
              </motion.div>
            </div>

            {/* Right - numbered steps */}
            <div>
              <Accordion type="single" value={`step-${openStep}`} onValueChange={(v) => setOpenStep(parseInt(v.replace("step-", "")) || 0)}>
                {data.steps.map((step, i) => (
                  <AccordionItem key={i} value={`step-${i}`} className="border-border">
                    <AccordionTrigger className="text-left hover:no-underline py-4 md:py-5 min-h-[44px]">
                      <div className="flex items-center gap-3">
                        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold shrink-0">
                          {i + 1}
                        </span>
                        <span className="text-sm md:text-base font-semibold text-foreground">{step.title}</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="pl-11">
                      <p className="text-sm text-muted-foreground leading-relaxed">{step.desc}</p>
                      {step.link && (
                        <button className="mt-3 text-sm font-semibold text-primary hover:underline min-h-[44px] flex items-center">
                          {step.link.text}
                        </button>
                      )}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
              <Button size="lg" className="mt-8 w-full sm:w-auto rounded-md font-semibold text-base px-8 h-12">
                {data.ctaButtonText}
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* What's Included */}
      <section className="py-16 md:py-24 bg-surface-dark">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <motion.div {...fade} className="text-center mb-10 md:mb-14">
            <SectionBadge text="OUR APPROACH" />
            <h2 className="mt-4 text-2xl font-bold text-foreground md:text-4xl">{data.includedTitle}</h2>
            <p className="mt-3 text-sm md:text-base text-muted-foreground max-w-2xl mx-auto">{data.includedSub}</p>
          </motion.div>
          <div className="grid gap-4 md:gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {data.included.map((item, i) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={i}
                  {...fade}
                  transition={{ delay: i * 0.08 }}
                  className="rounded-xl border border-border bg-card p-5 md:p-6 hover:border-primary/40 transition-colors group"
                >
                  <Icon className="h-6 w-6 text-primary mb-4" />
                  <h3 className="text-sm md:text-base font-bold text-foreground mb-2">{item.title}</h3>
                  <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Supported Environments */}
      <section className="py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="grid md:grid-cols-2 gap-10 md:gap-16">
            <motion.div {...fade}>
              <h3 className="text-lg font-bold text-foreground mb-4">Supported Store Types</h3>
              <div className="flex flex-wrap gap-2">
                {data.storeTypes.map((t, i) => (
                  <span key={i} className="rounded-full border border-primary/40 px-4 py-2 text-sm text-primary">
                    {t}
                  </span>
                ))}
              </div>
            </motion.div>
            <motion.div {...fade}>
              <h3 className="text-lg font-bold text-foreground mb-4">Supported Hardware</h3>
              <div className="flex flex-wrap gap-2">
                {data.hardware.map((h, i) => (
                  <span key={i} className="rounded-full border border-border px-4 py-2 text-sm text-foreground">
                    {h}
                  </span>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 md:py-24 bg-surface-dark">
        <div className="mx-auto max-w-3xl px-4 md:px-6">
          <motion.div {...fade} className="text-center mb-8 md:mb-12">
            <SectionBadge text="FAQ" />
            <h2 className="text-2xl font-bold text-foreground md:text-4xl mt-2">{data.faqTitle}</h2>
          </motion.div>
          <Accordion type="single" collapsible className="w-full">
            {data.faqs.map((faq, i) => (
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
            <SectionBadge text="GET STARTED" />
            <h2 className="text-2xl font-bold text-foreground md:text-4xl mt-4">{data.bottomCTA.title}</h2>
            <p className="mt-3 md:mt-4 text-sm md:text-base text-muted-foreground max-w-xl mx-auto">
              {data.bottomCTA.sub}
            </p>
            <div className="mt-6 md:mt-8 flex flex-col sm:flex-row gap-3 justify-center">
              <Button size="lg" className="rounded-md font-semibold text-base px-8 h-12">
                {data.bottomCTA.btn1}
              </Button>
              <Button size="lg" variant="outline" className="rounded-md font-semibold text-base px-8 h-12" asChild>
                <Link to="/case-studies">{data.bottomCTA.btn2}</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default CapabilityPage;
