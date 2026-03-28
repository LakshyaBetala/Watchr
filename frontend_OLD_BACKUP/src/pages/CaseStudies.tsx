import { Link } from "react-router-dom";
import { ArrowLeft, BookOpen, Terminal } from "lucide-react";
import { motion } from "framer-motion";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import SectionBadge from "@/components/landing/SectionBadge";

const CaseStudies = () => (
  <div className="min-h-screen bg-black text-white relative overflow-hidden">
    {/* Background Pattern */}
    <div className="absolute inset-0 z-0 pointer-events-none opacity-[0.05]" 
         style={{ backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`, backgroundSize: '40px 40px' }} />
    
    <Navbar />
    
    <div className="relative z-10 pt-32 md:pt-40 pb-32 px-4 md:px-8">
      <div className="mx-auto max-w-5xl">
        <Link to="/" className="inline-flex items-center gap-2 text-[10px] font-mono font-bold text-gray-400 hover:text-white transition-colors tracking-[0.2em] mb-12 uppercase">
          <ArrowLeft className="h-3 w-3" /> [ RETURN_TO_ROOT ]
        </Link>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.5 }} 
          className="text-left mb-16 border-l-2 border-white/20 pl-8"
        >
          <SectionBadge text="DEPLOYMENT ARCHIVE" />
          <h1 className="text-4xl md:text-6xl font-black text-white mt-6 uppercase tracking-tighter leading-[0.9]" style={{ fontFamily: "'Chakra Petch', sans-serif" }}>
            Field <br />
            <span className="text-gray-500">Intelligence.</span>
          </h1>
          <p className="mt-8 text-gray-400 text-lg md:text-xl font-mono uppercase tracking-widest leading-relaxed max-w-2xl">
            Real-world results from mission-critical AI deployments across India's premier retail environments.
          </p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }} 
          animate={{ opacity: 1, scale: 1 }} 
          transition={{ duration: 0.5, delay: 0.2 }} 
          className="relative border border-white/10 bg-[#050505] p-12 md:p-24 text-center overflow-hidden group"
        >
          {/* Corner Markers */}
          <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-white/20 group-hover:border-white transition-all" />
          <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-white/20 group-hover:border-white transition-all" />
          <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-white/20 group-hover:border-white transition-all" />
          <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-white/20 group-hover:border-white transition-all" />

          <div className="relative z-10 flex flex-col items-center">
            <div className="p-6 border border-white/10 bg-white/5 text-white mb-8 group-hover:bg-white group-hover:text-black transition-all">
              <Terminal className="h-10 w-10" />
            </div>
            <h2 className="text-3xl md:text-4xl font-black text-white uppercase tracking-widest font-[Chakra Petch] mb-6">Archive Locked</h2>
            <p className="text-gray-500 font-mono text-sm uppercase tracking-[0.2em] max-w-sm leading-relaxed mb-10">
              Operational logs are undergoing indexing for the Q1 2026 deployment cycle. Check back shortly.
            </p>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-yellow-500 animate-pulse rounded-full" />
              <span className="text-[10px] font-mono font-bold text-yellow-500/80 uppercase tracking-[0.3em]">Status: Syncing_Logs...</span>
            </div>
          </div>
        </motion.div>

        {/* Tactical Footnote */}
        <div className="mt-20 pt-10 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6 opacity-20">
          <div className="text-[10px] font-mono tracking-[0.3em] uppercase">Archive_Ref: CASE_LOG_77A</div>
          <div className="text-[10px] font-mono tracking-[0.3em] uppercase text-right">Last_Update: 27_MAR_2026</div>
        </div>
      </div>
    </div>
    
    <Footer />
  </div>
);

export default CaseStudies;
