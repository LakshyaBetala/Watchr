import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import { useRef } from "react";
import {
  ClipboardList,
  Plug,
  Brain,
  Gauge,
  HeartHandshake,
  Terminal,
  Activity,
  Zap,
  ShieldCheck
} from "lucide-react";
import SectionBadge from "./SectionBadge";

const deploymentSteps = [
  {
    id: "RECON_ALPHA_01",
    title: "Phase 01 / Reconnaissance",
    subtitle: "Infrastructure Analysis",
    description: "Multi-point audit of existing vision hardware and network stability.",
    icon: <ClipboardList className="w-5 h-5" />,
    stats: "LATENCY: 12ms",
    status: "COMPLETE",
    side: "left" as const
  },
  {
    id: "SYNC_DELTA_02",
    title: "Phase 02 / Synchronization",
    subtitle: "Node Deployment",
    description: "Non-invasive installation of edge AI processing units. zero-downtime integration.",
    icon: <Plug className="w-5 h-5" />,
    stats: "NODES: ACTIVE",
    status: "READY",
    side: "right" as const
  },
  {
    id: "CALIB_SIGMA_03",
    title: "Phase 03 / Calibration",
    subtitle: "Neural Training",
    description: "Site-specific layout mapping and behavior baseline established over 48 hours.",
    icon: <Brain className="w-5 h-5" />,
    stats: "BIAS: optimized",
    status: "CALIBRATING",
    side: "left" as const
  },
  {
    id: "ACTIVATE_OMEGA_04",
    title: "Phase 04 / Core Activation",
    subtitle: "Telemetry Live",
    description: "Real-time frameworks engaged across theft and inventory matrices.",
    icon: <Gauge className="w-5 h-5" />,
    stats: "STREAM: SECURE",
    status: "PENDING",
    side: "right" as const
  },
  {
    id: "SUPPORT_EPSILON_05",
    title: "Phase 05 / Sustained Intel",
    subtitle: "Strategic Continuity",
    description: "Dedicated SOC monitoring and quarterly retraining for new retail vectors.",
    icon: <HeartHandshake className="w-5 h-5" />,
    stats: "UPTIME: 99.9%",
    status: "MONITORING",
    side: "left" as const
  },
];

const DeploymentJourney = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start 60%", "end 80%"]
  });

  const scaleY = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  return (
    <section 
      ref={containerRef}
      className="py-16 md:py-24 bg-[#000000] relative overflow-hidden"
    >
      {/* Background Grid Accent */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-[0.03]" 
           style={{ backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`, backgroundSize: '60px 60px' }} />
      
      <div className="mx-auto max-w-[1400px] px-4 md:px-8 relative z-10">
        <div className="flex flex-col items-center text-center mb-16">
          <SectionBadge text="DEPLOYMENT PROTOCOL" />
          <h2 className="mt-4 text-4xl md:text-5xl lg:text-6xl font-black text-white uppercase tracking-tighter leading-[0.85]" style={{ fontFamily: "'Chakra Petch', sans-serif" }}>
            Live in 48 Hours. <br />
            <span className="text-gray-500">Zero Red Tape.</span>
          </h2>
          <div className="mt-6 h-px w-16 bg-white/20" />
          <p className="mt-6 text-sm md:text-base text-gray-400 font-medium max-w-2xl leading-relaxed uppercase tracking-wide">
            Our integration pipeline is engineered for speed, utilizing existing infrastructure to bypass legacy bottlenecks.
          </p>
        </div>

        <div className="relative space-y-12 md:space-y-20">
          {/* Vertical Data Conduit (Inside container) */}
          <div className="absolute left-1/2 top-10 bottom-0 w-0.5 bg-white/5 -translate-x-1/2 hidden lg:block">
            <motion.div 
              style={{ scaleY }}
              className="w-full h-full bg-gradient-to-b from-white via-white to-transparent origin-top shadow-[0_0_25px_rgba(255,255,255,0.8)]"
            />
          </div>

          {deploymentSteps.map((step, index) => (
            <div 
              key={step.id}
              className={`flex flex-col lg:flex-row items-center justify-center gap-12 lg:gap-0 relative`}
            >
              {/* Step Card */}
              <motion.div 
                initial={{ opacity: 0, x: step.side === 'left' ? -50 : 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className={`w-full lg:w-[45%] ${step.side === 'left' ? 'lg:pr-20' : 'lg:pl-20 lg:order-2'}`}
              >
                <div className="relative border border-white/10 bg-[#050505] p-8 group hover:border-white/40 transition-all duration-500">
                  {/* Tactical Corners */}
                  <div className="absolute top-0 left-0 w-2 h-0.5 bg-white opacity-40" />
                  <div className="absolute top-0 left-0 w-0.5 h-2 bg-white opacity-40" />
                  <div className="absolute top-0 right-0 w-8 h-[1px] bg-white/10" />
                  
                  <div className="flex items-start justify-between mb-8">
                    <div className="p-3 bg-white/5 border border-white/10 group-hover:bg-white group-hover:text-black transition-all duration-500">
                      {step.icon}
                    </div>
                    <div className="text-right">
                      <span className="block text-[10px] font-mono text-gray-600 tracking-widest">{step.id}</span>
                      <span className={`text-[10px] font-mono font-bold tracking-widest ${step.status === 'COMPLETE' ? 'text-green-500' : 'text-yellow-500/50'}`}>
                        // {step.status}
                      </span>
                    </div>
                  </div>

                  <h3 className="text-2xl font-black text-white uppercase tracking-widest font-[Chakra Petch] mb-2">
                    {step.title}
                  </h3>
                  <p className="text-xs font-mono text-gray-500 uppercase tracking-widest mb-6">
                    {step.subtitle}
                  </p>
                  
                  <p className="text-gray-400 leading-relaxed text-sm mb-8 font-medium uppercase tracking-wider">
                    {step.description}
                  </p>

                  <div className="flex items-center gap-4 pt-6 border-t border-white/5">
                    <div className="flex items-center gap-2">
                      <Activity className="h-3 w-3 text-white/20" />
                      <span className="text-[10px] font-mono text-gray-500 tracking-[0.2em]">{step.stats}</span>
                    </div>
                    <div className="h-1 w-1 bg-white/10 rounded-full" />
                    <div className="flex items-center gap-2">
                      <Terminal className="h-3 w-3 text-white/20" />
                      <span className="text-[10px] font-mono text-gray-600 tracking-[0.2em]">VERIFIED: TRUE</span>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Center Node (Desktop) */}
              <div className="absolute left-1/2 -translate-x-1/2 hidden lg:flex items-center justify-center z-20">
                <motion.div 
                   initial={{ scale: 0, opacity: 0 }}
                   whileInView={{ scale: 1, opacity: 1 }}
                   viewport={{ once: true }}
                   transition={{ delay: 0.4, type: "spring", stiffness: 200 }}
                   className="w-12 h-12 bg-black border border-white/40 flex items-center justify-center relative shadow-[0_0_20px_rgba(255,255,255,0.2)]"
                >
                  <div className="absolute inset-0 bg-white/5 animate-pulse" />
                  <span className="font-mono text-[10px] font-black text-white">0{index + 1}</span>
                  
                  {/* Connecting lines to card */}
                  <motion.div 
                    initial={{ width: 0 }}
                    whileInView={{ width: 80 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.6, duration: 0.4 }}
                    className={`absolute top-1/2 -translate-y-1/2 h-px bg-white/20 ${step.side === 'left' ? 'right-full' : 'left-full'}`}
                  />
                </motion.div>
              </div>

              {/* Empty Space for alignment (Desktop) */}
              <div className={`hidden lg:block w-[45%] ${step.side === 'left' ? 'order-2' : ''}`} />
            </div>
          ))}
        </div>

        {/* Deployment Footer */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-12 max-w-xl mx-auto border border-white/20 bg-white/5 p-6 relative text-center backdrop-blur-md"
        >
          <div className="absolute -top-3 -left-3 w-6 h-6 bg-white flex items-center justify-center">
            <ShieldCheck className="w-4 h-4 text-black" />
          </div>
          <div className="absolute top-0 right-0 w-16 h-16 border-t border-r border-white/10" />
          
          <h4 className="text-lg font-bold text-white uppercase tracking-[0.3em] font-[Chakra Petch] mb-3">
            SLA RECONNAISSANCE PROTOCOL
          </h4>
          <p className="text-xs font-mono text-gray-400 leading-relaxed uppercase tracking-widest max-w-xl mx-auto">
            Guaranteed 98% detection accuracy post 7-day calibration phase. 
            Full system synchronization within 48 hours of reconnaissance completion.
          </p>
          
          <div className="mt-6 flex flex-wrap justify-center gap-8 border-t border-white/10 pt-6">
            {[
              { label: "LATENCY", val: "< 15MS" },
              { label: "UPTIME", val: "99.98%" },
              { label: "SECURITY", val: "AES-256" },
            ].map(stat => (
              <div key={stat.label} className="text-center">
                <span className="block text-[9px] font-mono text-gray-600 tracking-widest mb-1">{stat.label}</span>
                <span className="text-sm font-black text-white tracking-[0.2em]">{stat.val}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default DeploymentJourney;
