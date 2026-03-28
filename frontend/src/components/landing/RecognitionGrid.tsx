import {
  Award, Rocket, Cloud, Flag,
  ShieldCheck, FileText, Lock, Cpu
} from "lucide-react";
import { motion } from "framer-motion";
import SectionBadge from "./SectionBadge";

const items = [
  { icon: Award,       name: "NASSCOM",          desc: "Recognized as a promising AI startup by India's premier tech body." },
  { icon: Rocket,      name: "Startup India",     desc: "Official Startup India registered entity with DPIIT recognition." },
  { icon: Cloud,       name: "AWS Partner",       desc: "Certified AWS ISV partner for cloud-edge AI deployments." },
  { icon: Flag,        name: "Make in India",     desc: "Proudly built, trained, and deployed from Indian infrastructure." },
  { icon: ShieldCheck, name: "GDPR Compliant",    desc: "No biometric data stored. Full compliance with EU privacy laws." },
  { icon: FileText,    name: "IT Act 2000",       desc: "Fully compliant with India's Information Technology Act 2000." },
  { icon: Lock,        name: "ISO 27001",         desc: "Enterprise information security management — certified." },
  { icon: Cpu,         name: "Edge AI Certified", desc: "Processes video on-device. Raw footage never leaves premises." },
];

const RecognitionGrid = () => (
  <section className="py-24 md:py-32 bg-[#050505] relative overflow-hidden border-b border-white/10">
    {/* Background Pattern */}
    <div className="absolute inset-0 z-0 pointer-events-none opacity-5 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:20px_20px]" />
    
    <div className="mx-auto max-w-7xl px-4 md:px-8 relative z-10">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-16 md:mb-24 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="max-w-3xl"
        >
          <SectionBadge text="COMPLIANCE & RECOGNITION" />
          <h2 className="mt-6 text-4xl md:text-5xl lg:text-7xl font-black text-white uppercase tracking-tighter" style={{ fontFamily: "'Chakra Petch', sans-serif" }}>
            Enterprise <br />
            <span className="text-gray-500">Validation.</span>
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
            VisionIQ operates under global security standards, ensuring mission-critical reliability for enterprise procurement.
          </p>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 border-l border-t border-white/10"
      >
        {items.map((item, i) => (
          <div 
            key={i} 
            className="group relative border-r border-b border-white/10 p-8 md:p-10 transition-all duration-300 hover:bg-white/[0.02]"
          >
            {/* Corner Markers */}
            <div className="absolute top-0 right-0 w-2 h-2 border-r border-t border-white/0 group-hover:border-white/40 transition-all" />
            <div className="absolute bottom-0 left-0 w-2 h-2 border-l border-b border-white/0 group-hover:border-white/40 transition-all" />

            <div className="relative z-10 space-y-6">
              <div className="flex items-center justify-between">
                <div className="p-3 bg-white/5 border border-white/10 group-hover:bg-white group-hover:text-black transition-all">
                  <item.icon className="h-5 w-5" />
                </div>
                <div className="text-[10px] font-mono font-bold text-gray-600 tracking-widest uppercase">
                  AUTH_{i + 1}
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-black text-white mb-2 tracking-widest uppercase font-[Chakra Petch]">
                  {item.name}
                </h3>
                <p className="text-xs font-medium text-gray-500 leading-relaxed uppercase tracking-wide group-hover:text-gray-300 transition-colors">
                  {item.desc}
                </p>
              </div>
            </div>

            {/* Scanning line animation on hover */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/5 to-transparent h-[20%] w-full top-[-20%] group-hover:top-[100%] transition-all duration-1000 ease-in-out pointer-events-none" />
          </div>
        ))}
      </motion.div>

      {/* Footer Note */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.5 }}
        className="mt-16 flex items-center gap-4 text-white/10"
      >
        <span className="text-[10px] font-mono tracking-[0.4em] uppercase">Security Protocol Initialized // Registry Verified</span>
      </motion.div>
    </div>
  </section>
);

export default RecognitionGrid;
