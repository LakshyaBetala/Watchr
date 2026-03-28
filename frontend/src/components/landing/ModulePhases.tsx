import { motion, useScroll, useTransform, Variants } from "framer-motion";
import { useRef } from "react";
import {
  Users, BarChart3, ShieldAlert, UserSearch, Lock,
  ClipboardCheck, Flame, Thermometer, ArrowRight
} from "lucide-react";
import { Link } from "react-router-dom";
import SectionBadge from "./SectionBadge";

const phases = [
  {
    label: "PHASE 1",
    title: "Customer Intelligence",
    modules: [
      { icon: BarChart3, name: "Behavior Analytics", desc: "Real-time heat maps, dwell tracking, and high-fidelity footfall counting.", slug: "customer-analytics" },
      { icon: Users, name: "Footfall Tracking", desc: "Bi-directional people counting utilizing edge AI with 98% validated accuracy.", slug: "footfall-analytics" },
    ],
  },
  {
    label: "PHASE 2",
    title: "Perimeter Security",
    modules: [
      { icon: ShieldAlert, name: "Loss Prevention", desc: "Concealment gesture AI, POS fraud matching, and live threat-vector alerts.", slug: "theft-prevention" },
      { icon: UserSearch, name: "People Re-ID", desc: "Global blacklist re-identification across all physical camera zones.", slug: "people-reid" },
      { icon: Lock, name: "Access Violation", desc: "Zero-latency staff-only area and restricted perimeter breach alerts.", slug: "unauthorized-access" },
    ],
  },
  {
    label: "PHASE 3",
    title: "Operations Command",
    modules: [
      { icon: ClipboardCheck, name: "Staff Productivity", desc: "Zone compliance enforcement, task verification, and idle time telemetry.", slug: "staff-monitor" },
      { icon: Flame, name: "Fire AI Diagnostics", desc: "97%+ accuracy distinguishing true structural fire conditions from steam/smoke.", slug: "fire-detection" },
      { icon: Thermometer, name: "Thermal Anomaly", desc: "Advanced electrical fire and heavy machinery overheating detection algorithms.", slug: "thermal-detection" },
    ],
  },
];

const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15, delayChildren: 0.2 },
  },
};

const itemAnim: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } },
};

const ModulePhases = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  const lineHeight = useTransform(scrollYProgress, [0, 0.8], ["0%", "100%"]);

  return (
    <section className="py-16 md:py-24 bg-[#000000] relative overflow-hidden border-b border-white/10" ref={containerRef}>
      
      {/* Background Tech Details */}
      <div className="absolute top-10 right-10 text-[10px] sm:text-xs text-white/20 font-mono text-right select-none">
        <p>VSN-IQ :: PLATFORM_SYS / v4.2.0</p>
        <p>ENCRYPTION: AES-256-GCM</p>
        <p>TELEMETRY LINK: ESTABLISHED</p>
      </div>

      <div className="mx-auto max-w-7xl px-4 md:px-8 relative z-10">
        
        {/* Header Section */}
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-100px" }} transition={{ duration: 0.6 }} className="mb-20">
          <SectionBadge text="TACTICAL PLATFORM DIRECTORY" />
          <h2 className="text-4xl md:text-5xl lg:text-7xl font-black text-white mt-6 tracking-tighter uppercase" style={{ fontFamily: "'Chakra Petch', sans-serif" }}>
            Complete Spectrum<br />
            Intelligence.
          </h2>
          <p className="mt-6 text-base md:text-xl text-gray-400 max-w-2xl leading-relaxed font-medium pb-8 border-b border-white/10 border-dashed">
            Comprehensive surveillance operations scaling from localized storefronts to vast enterprise back-office arrays. Deploy specialized tactical AI frameworks seamlessly.
          </p>
        </motion.div>

        {/* Vertical Timeline Layout */}
        <div className="relative space-y-24 mt-16">
          
          {/* Animated Tactical Line */}
          <div className="absolute left-[39px] top-0 bottom-0 w-px bg-white/5 hidden md:block">
            <motion.div 
              className="w-full bg-white shadow-[0_0_10px_#fff]" 
              style={{ height: lineHeight }}
            />
          </div>

          <div className="absolute left-6 top-0 bottom-0 w-px bg-white/5 md:hidden">
            <motion.div 
              className="w-full bg-white shadow-[0_0_10px_#fff]" 
              style={{ height: lineHeight }}
            />
          </div>

          {phases.map((phase, pi) => (
            <motion.div key={pi} variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} className="relative z-10">
              
              {/* Phase Header Node & Title */}
              <div className="flex items-start md:items-center mb-10 relative">
                
                {/* Node (Desktop) */}
                <div className="hidden md:flex absolute left-[39px] -translate-x-1/2 items-center justify-center w-14 h-14 bg-black border-2 border-white/20 z-20 shrink-0">
                  <div className="w-4 h-4 bg-white animate-pulse" />
                </div>
                
                {/* Node (Mobile) */}
                <div className="flex md:hidden absolute left-6 -translate-x-1/2 mt-1 items-center justify-center w-8 h-8 bg-black border border-white/20 z-20 shrink-0">
                  <div className="w-2 h-2 bg-white animate-pulse" />
                </div>

                <div className="pl-16 md:pl-32 w-full flex flex-col md:flex-row md:items-end justify-between border-b mx-4 md:mx-0 border-white/10 pb-4">
                  <div>
                    <span className="inline-block px-3 py-1 bg-white/5 border text-[10px] md:text-xs font-bold uppercase tracking-[0.2em] text-white/60 mb-3 border-white/20">
                      {phase.label}
                    </span>
                    <h3 className="text-2xl md:text-4xl font-black uppercase text-white tracking-widest" style={{ fontFamily: "'Chakra Petch', sans-serif" }}>{phase.title}</h3>
                  </div>
                  <div className="hidden md:block text-xs font-mono text-white/30 uppercase">System Status: Active</div>
                </div>
              </div>

              {/* Tactical Cards Grid */}
              <div className="pl-16 md:pl-32 w-full">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {phase.modules.map((mod, mi) => (
                    <motion.div
                      key={mi}
                      variants={itemAnim}
                      whileHover={{ y: -5 }}
                      className="group relative flex flex-col justify-between overflow-hidden border border-white/10 bg-[#0A0A0A] p-6 transition-all duration-300 hover:border-white/40"
                    >
                      {/* Corner Accents */}
                      <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-white/30" />
                      <div className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 border-white/30" />
                      <div className="absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2 border-white/30" />
                      <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-white/30" />

                      {/* Hover Overlay */}
                      <div className="absolute inset-0 bg-white/5 opacity-0 transition-opacity duration-300 group-hover:opacity-100 -z-10" />
                      
                      <div>
                        <div className="p-3 inline-flex bg-black border border-white/10 group-hover:border-white transition-all duration-300 mb-6 relative">
                          <mod.icon className="h-6 w-6 text-white/60 group-hover:text-white transition-colors duration-300" />
                        </div>
                        <h4 className="text-xl font-bold text-white mb-2 uppercase tracking-wide font-[Chakra Petch]">{mod.name}</h4>
                        <p className="text-sm text-gray-400 group-hover:text-gray-300 transition-colors leading-relaxed mb-8 font-medium">
                          {mod.desc}
                        </p>
                      </div>

                      <Link
                        to={`/capabilities/${mod.slug}`}
                        className="mt-auto inline-flex items-center text-xs font-bold uppercase tracking-widest text-white/50 group-hover:text-white transition-colors w-max"
                      >
                        [ Engage Module ] <ArrowRight className="ml-2 h-4 w-4 transform group-hover:translate-x-1 transition-transform" />
                      </Link>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ModulePhases;
