import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowRight, ArrowLeft, CheckCircle2 } from "lucide-react";
import { Link, useParams, useLocation } from "react-router-dom";
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
import { solutionPages } from "@/data/solutionPageData";

const fade = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true as const },
};

const SolutionPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const location = useLocation();
  const data = slug ? solutionPages[slug] : null;
  const [openStep, setOpenStep] = useState(0);

  useEffect(() => {
    if (location.hash && data) {
      const id = location.hash.replace("#", "");
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "center" });
        // Find which step index this matches
        const stepIdx = data.steps.findIndex(s => s.title.toLowerCase().replace(/\s+/g, '-') === id);
        if (stepIdx !== -1) {
          setOpenStep(stepIdx);
        }
      }
    }
  }, [location.hash, data]);

  if (!data) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <SectionBadge text="ERROR_404" />
          <h1 className="text-3xl font-black text-white mt-4 uppercase font-[Chakra Petch]">Sector Log Not Found</h1>
          <Link to="/solutions" className="mt-8 inline-block text-[10px] font-mono font-bold text-white tracking-[0.2em] border border-white/20 px-6 py-3 uppercase">
            [ BACK_TO_MATRICES ]
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-[0.05]" 
           style={{ backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`, backgroundSize: '40px 40px' }} />
      
      <Navbar />

      {/* Hero */}
      <section className="relative z-10 pt-32 md:pt-40 pb-16 md:pb-24 border-b border-white/10">
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            <motion.div {...fade}>
              <Link to="/solutions" className="inline-flex items-center gap-2 text-[10px] font-mono font-bold text-gray-500 hover:text-white transition-colors tracking-[0.2em] mb-10 uppercase">
                 <ArrowLeft className="h-3 w-3" /> [ SECTOR_INDEX ]
              </Link>
              <div className="flex items-center gap-4 mb-10">
                <SectionBadge text={data.badge} />
                <div className="h-px w-8 bg-white/20" />
                <span className="text-[10px] font-mono text-white/40 tracking-[0.3em] font-bold">{data.sectorCode}</span>
              </div>
              <h1 className="text-4xl font-black text-white sm:text-5xl md:text-6xl lg:text-7xl uppercase tracking-tighter leading-[0.95]" style={{ fontFamily: "'Chakra Petch', sans-serif" }}>
                {data.heroTitle}
              </h1>
              <p className="mt-8 text-gray-400 text-lg md:text-xl font-mono uppercase tracking-widest leading-relaxed border-l-2 border-white/20 pl-8 mb-10">
                {data.heroSub}
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 mb-12">
                <Button size="lg" className="rounded-none font-black text-sm h-14 px-10 bg-white text-black hover:bg-gray-200 uppercase tracking-[0.2em]">
                  {data.ctaBtn}
                </Button>
              </div>

              <div className="grid grid-cols-3 gap-6 pt-10 border-t border-white/10">
                {data.stats.map((s, i) => (
                  <div key={i}>
                    <p className="text-2xl md:text-4xl font-black text-white font-[Chakra Petch]">{s.value}</p>
                    <p className="text-[10px] font-mono font-bold text-gray-500 mt-2 uppercase tracking-widest">{s.label}</p>
                  </div>
                ))}
              </div>
            </motion.div>
            
            <div className="relative h-[300px] md:h-[450px] lg:h-[600px] hidden lg:block border border-white/10 bg-[#050505] p-2">
              <div className="absolute top-0 right-0 p-4 font-mono text-[10px] text-white/20 uppercase tracking-[0.3em]">
                Live_feed_S{Math.floor(Math.random() * 999)}
              </div>
              <HeroCanvas />
              <div className="absolute bottom-4 left-4 flex gap-2">
                <div className="w-1.5 h-1.5 bg-red-500 animate-pulse rounded-full" />
                <span className="text-[10px] font-mono font-bold text-red-500 uppercase tracking-widest">Rec_Alpha</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <SocialProofTicker />

      {/* Deep Dive - 2 col */}
      <section className="relative z-10 py-24 md:py-32 bg-[#050505] border-y border-white/10">
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-24">
            {/* Left sticky */}
            <div className="lg:sticky lg:top-32 lg:self-start">
              <motion.div {...fade}>
                <SectionBadge text={data.deepDiveBadge} />
                <h2 className="mt-6 text-3xl font-black text-white md:text-5xl uppercase tracking-tighter font-[Chakra Petch]">
                  {data.deepDiveTitle}
                </h2>
                <div className="mt-8 space-y-6">
                  {data.deepDiveBody.map((p, i) => (
                    <p key={i} className="text-base text-gray-400 font-medium leading-relaxed">{p}</p>
                  ))}
                </div>
                
                <div className="mt-12 p-8 border border-white/10 bg-[#080808] relative">
                  <div className="absolute top-0 left-0 w-2 h-2 bg-white" />
                  <p className="text-[10px] font-mono font-bold text-gray-500 mb-6 uppercase tracking-[0.3em]">// LOG_ANALYSIS</p>
                  <ul className="space-y-4">
                    {data.deepDiveList.map((item, i) => (
                      <li key={i} className="flex items-start gap-3 text-sm font-bold text-gray-300 uppercase tracking-wide">
                        <span className="h-1.5 w-1.5 bg-white mt-1.5 shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            </div>

            {/* Right - steps accordion (Industrial Style) */}
            <div className="space-y-4">
              <p className="text-[10px] font-mono font-bold text-gray-500 mb-8 uppercase tracking-[0.3em]">// PHASE_PROTOCOLS</p>
              {data.steps.map((step, i) => (
                <div 
                  key={i} 
                  id={step.title.toLowerCase().replace(/\s+/g, '-')}
                  className={`border border-white/10 p-8 transition-all ${openStep === i ? "bg-white text-black border-white" : "bg-[#0A0A0A] hover:border-white/30"}`}
                  onClick={() => setOpenStep(i)}
                >
                  <div className="flex items-center gap-6 cursor-pointer">
                    <span className={`text-4xl font-black italic ${openStep === i ? "text-black/20" : "text-white/10"}`}>
                      0{i + 1}
                    </span>
                    <h3 className="text-xl font-black uppercase tracking-widest font-[Chakra Petch]">{step.title}</h3>
                  </div>
                  
                  {openStep === i && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-8 pl-14 border-l border-current/20 ml-6"
                    >
                      <p className="text-sm font-bold uppercase tracking-widest leading-relaxed">{step.desc}</p>
                      {step.link && (
                        <button className="mt-8 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] border-b-2 border-current pb-1">
                          {step.link.text} <ArrowRight className="h-3 w-3" />
                        </button>
                      )}
                    </motion.div>
                  )}
                </div>
              ))}
              <div className="pt-10">
                <Button size="lg" className="w-full rounded-none font-black text-sm h-16 bg-white text-black hover:bg-gray-200 uppercase tracking-[0.2em]">
                  {data.ctaBtn}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose */}
      <section className="py-24 md:py-32 bg-black border-b border-white/10">
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          <motion.div {...fade} className="text-center mb-16 md:mb-24">
            <SectionBadge text={data.whyBadge} />
            <h2 className="mt-6 text-3xl font-black text-white md:text-5xl uppercase tracking-tighter font-[Chakra Petch]">{data.whyTitle}</h2>
            <p className="mt-6 text-gray-500 font-mono text-sm uppercase tracking-widest max-w-2xl mx-auto">{data.whySub}</p>
          </motion.div>
          <div className="grid gap-px bg-white/10 border border-white/10 sm:grid-cols-2 lg:grid-cols-3">
            {data.whyCards.map((card, i) => {
              const Icon = card.icon;
              return (
                <motion.div key={i} {...fade} transition={{ delay: i * 0.08 }} className="bg-[#050505] p-10 hover:bg-[#0A0A0A] transition-all relative group">
                  <div className="p-4 border border-white/10 bg-white/5 group-hover:bg-white group-hover:text-black transition-all mb-8 inline-block">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-black text-white uppercase tracking-widest mb-4 font-[Chakra Petch]">{card.title}</h3>
                  <p className="text-xs font-mono text-gray-500 uppercase tracking-widest leading-relaxed group-hover:text-gray-300 transition-colors">{card.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* What Can Be Monitored */}
      <section className="py-24 md:py-32 bg-[#050505]">
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          <motion.div {...fade} className="text-center mb-16 md:mb-24">
            <SectionBadge text={data.monitorBadge} />
            <h2 className="mt-6 text-3xl font-black text-white md:text-5xl uppercase tracking-tighter font-[Chakra Petch]">{data.monitorTitle}</h2>
          </motion.div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {data.monitorCategories.map((cat, i) => (
              <motion.div key={i} {...fade} transition={{ delay: i * 0.08 }} className="border border-white/10 bg-black p-8 relative">
                <div className="absolute top-0 left-0 w-2 h-0.5 bg-white" />
                <h3 className="text-xs font-black text-white uppercase tracking-[0.2em] mb-8 font-mono border-b border-white/10 pb-4">{cat.title}</h3>
                <ul className="space-y-4">
                  {cat.items.map((item, j) => (
                    <li key={j} className="flex items-start gap-3 text-[11px] font-bold text-gray-400 uppercase tracking-wide">
                      <span className="h-1 w-1 bg-white/40 mt-1.5 shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Ideal Use Cases */}
      <section className="py-24 md:py-32 bg-black border-y border-white/10">
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          <motion.div {...fade} className="text-center mb-16 md:mb-24">
            <SectionBadge text={data.useCasesBadge} />
            <h2 className="mt-6 text-3xl font-black text-white md:text-5xl uppercase tracking-tighter font-[Chakra Petch]">{data.useCasesTitle}</h2>
          </motion.div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {data.useCases.map((uc, i) => (
              <motion.div key={i} {...fade} transition={{ delay: i * 0.06 }} className="border border-white/10 bg-[#050505] p-8 text-center hover:border-white/40 transition-colors">
                <p className="text-sm font-black text-white uppercase tracking-widest font-[Chakra Petch]">{uc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* VisionIQ Advantage */}
      <section className="py-24 md:py-32 bg-[#050505]">
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-24">
            <motion.div {...fade}>
              <SectionBadge text={data.advantageBadge} />
              <h2 className="mt-6 text-3xl font-black text-white md:text-5xl uppercase tracking-tighter font-[Chakra Petch]">{data.advantageTitle}</h2>
              <p className="mt-8 text-lg text-gray-400 font-medium leading-relaxed">{data.advantageBody}</p>
              <ul className="mt-10 space-y-4">
                {data.advantageBullets.map((b, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm font-bold text-gray-300 uppercase tracking-wide">
                    <span className="h-1.5 w-1.5 bg-white mt-1.5 shrink-0" />
                    {b}
                  </li>
                ))}
              </ul>
            </motion.div>
            <motion.div {...fade} className="border border-white/10 bg-black p-10 relative">
              <div className="absolute top-0 left-0 w-2 h-2 bg-white" />
              <p className="text-[10px] font-mono font-bold uppercase tracking-[0.3em] text-white/40 mb-8">// DELIVERABLES</p>
              <ul className="space-y-4">
                {data.deliverables.map((d, i) => (
                  <li key={i} className="flex items-start gap-4 text-sm font-black text-white uppercase tracking-widest border-b border-white/5 pb-4">
                    <CheckCircle2 className="h-5 w-5 text-white shrink-0" />
                    {d}
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="py-24 md:py-40 bg-black relative overflow-hidden">
        <div className="absolute inset-0 z-0 pointer-events-none opacity-20" 
             style={{ backgroundImage: `radial-gradient(circle at center, rgba(255,255,255,0.1) 0%, transparent 70%)` }} />
        <div className="mx-auto max-w-3xl px-4 md:px-8 text-center relative z-10">
          <motion.div {...fade}>
            <SectionBadge text="SYSTEM INITIALIZATION" />
            <h2 className="text-4xl font-black text-white md:text-6xl mt-8 uppercase tracking-tighter font-[Chakra Petch]">{data.bottomCTA.title}</h2>
            <p className="mt-8 text-gray-400 text-lg md:text-xl font-mono uppercase tracking-widest leading-relaxed mb-12">{data.bottomCTA.sub}</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="rounded-none font-black text-sm h-16 px-12 bg-white text-black hover:bg-gray-200 uppercase tracking-[0.2em]">
                {data.bottomCTA.btn1}
              </Button>
              <Button size="lg" variant="outline" className="rounded-none font-black text-sm h-16 px-12 border-white/20 text-white bg-transparent hover:bg-white/5 uppercase tracking-[0.2em]" asChild>
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

export default SolutionPage;
