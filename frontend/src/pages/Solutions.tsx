import { motion } from "framer-motion";
import { ArrowRight, ArrowLeft, ShirtIcon, ShoppingCart, Coffee, Warehouse, Cpu, Hotel, ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import SectionBadge from "@/components/landing/SectionBadge";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import { solutionIndex } from "@/data/solutionPageData";

const fade = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true as const },
};

const iconMap: Record<string, typeof ShirtIcon> = {
  ShirtIcon, ShoppingCart, Coffee, Warehouse, Cpu, Hotel,
};

const Solutions = () => (
  <div className="min-h-screen bg-black text-white relative overflow-hidden">
    {/* Background Pattern */}
    <div className="absolute inset-0 z-0 pointer-events-none opacity-10" 
         style={{ backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`, backgroundSize: '40px 40px' }} />
    
    <Navbar />

    <section className="relative z-10 pt-32 md:pt-40 pb-12 md:pb-20">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <motion.div {...fade}>
          <Link to="/" className="inline-flex items-center gap-2 text-[10px] font-mono font-bold text-gray-500 hover:text-white transition-colors tracking-[0.2em] mb-8 uppercase">
             <ArrowLeft className="h-3 w-3" /> [ RETURN_TO_ROOT ]
          </Link>
          <SectionBadge text="INDUSTRY MATRICES" />
          <h1 className="mt-6 text-4xl font-black text-white sm:text-5xl md:text-6xl lg:text-7xl uppercase tracking-tighter leading-[0.9]" style={{ fontFamily: "'Chakra Petch', sans-serif" }}>
            Tactical <br />
            <span className="text-gray-500">Sector Deployment.</span>
          </h1>
          <p className="mt-6 text-gray-400 max-w-2xl font-mono text-sm uppercase tracking-widest leading-relaxed border-l border-white/20 pl-6">
            VisionIQ adapts to high-density environments. Our industrial-grade AI modules provide mission-critical telemetry across diverse global sectors.
          </p>
        </motion.div>
      </div>
    </section>

    <section className="relative z-10 pb-24 md:pb-32">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <div className="grid gap-px bg-white/10 border border-white/10 sm:grid-cols-2 lg:grid-cols-3 overflow-hidden">
          {solutionIndex.map((sol, i) => {
            const Icon = iconMap[sol.icon] || Cpu;
            return (
              <motion.div key={sol.slug} {...fade} transition={{ delay: i * 0.08 }}>
                <Link
                  to={`/solutions/${sol.slug}`}
                  className="group block bg-[#050505] p-8 md:p-10 hover:bg-[#0A0A0A] transition-all relative h-full"
                >
                  <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <ArrowUpRight className="h-4 w-4 text-white" />
                  </div>
                  
                  <div className="mb-8 flex items-center justify-between">
                    <div className="p-4 border border-white/10 bg-white/5 group-hover:bg-white group-hover:text-black transition-all">
                      <Icon className="h-6 w-6" />
                    </div>
                    <span className="text-[10px] font-mono font-bold text-white/20 tracking-[0.3em]">0{i + 1}</span>
                  </div>

                  <h3 className="text-2xl font-black text-white uppercase tracking-widest mb-4 font-[Chakra Petch]">{sol.title}</h3>
                  <p className="text-xs font-mono text-gray-500 uppercase tracking-widest leading-relaxed mb-10 group-hover:text-gray-300 transition-colors">{sol.desc}</p>
                  
                  <div className="mt-auto pt-4 border-t border-white/5 group-hover:border-white/20 transition-colors">
                    <span className="text-[10px] font-bold text-white tracking-[0.2em] flex items-center gap-2 group-hover:translate-x-1 transition-transform uppercase">
                      [ ACCESS_LOGS ] <ArrowRight className="h-3 w-3" />
                    </span>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>

    <Footer />
  </div>
);

export default Solutions;
