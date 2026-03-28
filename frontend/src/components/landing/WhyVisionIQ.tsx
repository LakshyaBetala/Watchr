import { motion, Variants } from "framer-motion";
import {
  Cpu,
  Video,
  Lock,
  WifiOff,
  UserCheck,
  Globe,
} from "lucide-react";
import SectionBadge from "./SectionBadge";

const infrastructureFeatures = [
  {
    title: "Plug & Play Edge Compute",
    icon: Cpu,
    description:
      "No cloud latency. All AI processing happens locally on-site at 30FPS. Real-time alerts, zero bandwidth drain.",
  },
  {
    title: "Universal CCTV Sync",
    icon: Video,
    description:
      "Compatible with 99% of existing IP/Analog cameras via RTSP. No need to replace your current hardware setup.",
  },
  {
    title: "Bank-Grade Encryption",
    icon: Lock,
    description:
      "AES-256 end-to-end encryption for all video streams and metadata. SOC2 compliant and enterprise-ready.",
  },
  {
    title: "Offline Resilience",
    icon: WifiOff,
    description:
      "Our AI nodes continue to monitor and log incidents even during total internet outages. Syncs to cloud when back.",
  },
  {
    title: "Privacy by Design",
    icon: UserCheck,
    description:
      "Silhouette-based behavioral tracking only. No facial data is ever stored, ensuring GDPR and IT Act compliance.",
  },
  {
    title: "Global Scalability",
    icon: Globe,
    description:
      "Deploy across 1,000+ stores with a single unified interface. Centralized management for distributed retail.",
  },
];

const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 },
  },
};

const itemAnim: Variants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1, transition: { type: "spring", stiffness: 300, damping: 24 } },
};

const WhyVisionIQ = () => (
  <section className="py-24 md:py-32 bg-[#050505] relative overflow-hidden border-b border-white/10">
    {/* Tactical Grid Background */}
    <div 
      className="absolute inset-0 z-0 pointer-events-none opacity-[0.03]"
      style={{
        backgroundImage: `
          linear-gradient(rgba(255, 255, 255, 1) 1px, transparent 1px),
          linear-gradient(90deg, rgba(255, 255, 255, 1) 1px, transparent 1px)
        `,
        backgroundSize: '40px 40px',
      }}
    />

    <div className="mx-auto max-w-7xl px-4 md:px-8 relative z-10">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-16 md:mb-24 gap-6">
        <motion.div 
          initial={{ opacity: 0, x: -30 }} 
          whileInView={{ opacity: 1, x: 0 }} 
          viewport={{ once: true }} 
          transition={{ duration: 0.5 }}
          className="max-w-3xl"
        >
          <SectionBadge text="ENTERPRISE INFRASTRUCTURE" />
          <h2 className="mt-6 text-4xl md:text-5xl lg:text-7xl font-black text-white uppercase tracking-tighter" style={{ fontFamily: "'Chakra Petch', sans-serif" }}>
            Built for <br />
            Deep Integration.
          </h2>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, x: 30 }} 
          whileInView={{ opacity: 1, x: 0 }} 
          viewport={{ once: true }} 
          transition={{ duration: 0.5, delay: 0.2 }}
          className="md:max-w-xs border-l border-white/20 pl-4"
        >
          <p className="text-gray-400 text-sm md:text-base font-mono leading-relaxed uppercase tracking-widest">
            Proprietary hardware-agnostic architecture designed for the toughest, high-density retail environments on the planet.
          </p>
        </motion.div>
      </div>

      <motion.div 
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        {infrastructureFeatures.map((feature, i) => (
          <motion.div 
            key={i}
            variants={itemAnim}
            className="group relative bg-[#0A0A0A] border border-white/10 p-8 transition-all duration-300 hover:border-white/40 hover:bg-[#0c0c0c]"
          >
            {/* Corner Tactical Markers */}
            <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-white/30" />
            <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-white/30" />
            <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-white/30" />
            <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-white/30" />

            {/* Inner Content */}
            <div className="relative z-10 flex flex-col h-full">
              <div className="flex justify-between items-start mb-8">
                <div className="p-3 bg-white text-black border border-white">
                  <feature.icon className="h-6 w-6" />
                </div>
                <div className="text-[10px] font-mono font-bold text-gray-600 tracking-widest uppercase">
                  NODE_{i + 1}
                </div>
              </div>
              
              <h3 className="text-xl font-black text-white mb-3 tracking-widest uppercase font-[Chakra Petch]">
                {feature.title}
              </h3>
              
              <p className="text-sm font-medium text-gray-500 leading-relaxed group-hover:text-gray-300 transition-colors mt-auto">
                {feature.description}
              </p>
            </div>

            {/* Hover overlay scanline */}
            <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent_0%,rgba(255,255,255,0.05)_50%,transparent_100%)] bg-[length:100%_4px] opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none mix-blend-overlay" />
          </motion.div>
        ))}
      </motion.div>

      {/* Footer Line */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.8 }}
        className="mt-16 pt-8 border-t border-white/10 flex items-center justify-between"
      >
        <div className="flex items-center gap-2 text-white/30">
          <span className="text-[10px] font-mono tracking-[0.2em] uppercase">System Architecture Verified</span>
        </div>
        <div className="text-[10px] font-mono tracking-[0.2em] uppercase text-white/30">
          STATUS: OPERATIONAL
        </div>
      </motion.div>
    </div>
  </section>
);

export default WhyVisionIQ;
