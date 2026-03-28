import { motion } from "framer-motion";
import { ArrowRight, Terminal, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import SectionBadge from "./SectionBadge";
import { Link } from "react-router-dom";

const FinalCTA = () => (
  <section className="py-16 md:py-24 bg-[#000000] relative overflow-hidden border-t border-white/10">
    {/* Tactical Background Grid */}
    <div 
      className="absolute inset-0 z-0 pointer-events-none opacity-[0.03]"
      style={{
        backgroundImage: `
          linear-gradient(rgba(255, 255, 255, 1) 1px, transparent 1px),
          linear-gradient(90deg, rgba(255, 255, 255, 1) 1px, transparent 1px)
        `,
        backgroundSize: '80px 80px',
      }}
    />

    <div className="mx-auto max-w-4xl px-4 md:px-8 relative z-10">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="relative border border-white/10 bg-[#050505] p-8 md:p-16 text-center overflow-hidden"
      >
        {/* Corner Markers */}
        <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-white/20" />
        <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-white/20" />
        <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-white/20" />
        <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-white/20" />
        
        {/* Scanline Animation */}
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent_0%,rgba(255,255,255,0.03)_50%,transparent_100%)] bg-[length:100%_10px] animate-scanline pointer-events-none" />

        <div className="relative z-10 flex flex-col items-center">
          <SectionBadge text="SYSTEM INITIALIZATION" />
          
          <h2 className="mt-8 text-4xl md:text-5xl lg:text-7xl font-black text-white leading-[0.9] tracking-tighter uppercase" style={{ fontFamily: "'Chakra Petch', sans-serif" }}>
            Initialize<br />
            <span className="text-gray-500">Security.</span>
          </h2>
          
          <p className="mt-8 text-xs md:text-sm text-gray-400 max-w-xl mx-auto leading-relaxed font-mono uppercase tracking-[0.2em]">
            Join the next generation of retailers using VisionIQ to transform their stores into intelligent, self-protecting environments.
          </p>

          <div className="mt-12 md:mt-20 flex flex-col sm:flex-row gap-6 items-center">
            <motion.div 
              whileHover={{ scale: 1.05 }} 
              whileTap={{ scale: 0.95 }}
            >
              <Link to="/dashboard">
                <Button size="lg" className="rounded-none bg-white text-black hover:bg-gray-200 font-black text-sm h-14 px-10 gap-3 transition-all duration-300 uppercase tracking-[0.2em]" style={{ fontFamily: "'Chakra Petch', sans-serif" }}>
                  <Terminal className="h-5 w-5" />
                  Enter Command Center
                </Button>
              </Link>
            </motion.div>
            
            <Link to="/approach" className="group flex items-center gap-3 text-white/40 hover:text-white transition-colors font-bold text-[10px] uppercase tracking-[0.4em] h-14 px-6 border border-white/10 hover:border-white/30">
              Intel Parameters
              <ArrowRight className="h-3 w-3 transform group-hover:translate-x-2 transition-transform" />
            </Link>
          </div>
          
          <div className="mt-12 pt-8 border-t border-white/5 w-full flex flex-wrap items-center justify-center gap-6 md:gap-12 opacity-30 grayscale hover:opacity-60 hover:grayscale-0 transition-all duration-700">
             <div className="flex items-center gap-2">
               <div className="w-1 h-1 bg-white rounded-full opacity-40" />
               <span className="text-[10px] uppercase tracking-[0.3em] font-bold">Secure Hardware Sync</span>
             </div>
             <div className="flex items-center gap-2">
               <div className="w-1 h-1 bg-white rounded-full opacity-40" />
               <span className="text-[10px] uppercase tracking-[0.3em] font-bold">Real-time Edge AI</span>
             </div>
             <div className="flex items-center gap-2">
               <div className="w-1 h-1 bg-white rounded-full opacity-40" />
               <span className="text-[10px] uppercase tracking-[0.3em] font-bold">Privacy Compliant</span>
             </div>
          </div>
        </div>
      </motion.div>
    </div>
  </section>
);

export default FinalCTA;
