import { Shield, Activity, Wifi, Lock, Terminal, Cpu, Database, Network } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const footerLinks = {
  Capabilities: [
    { label: "Theft Prevention", to: "/capabilities/theft-prevention", id: "CAP_01" },
    { label: "Customer Analytics", to: "/capabilities/customer-analytics", id: "CAP_02" },
    { label: "Fire Detection", to: "/capabilities/fire-detection", id: "CAP_03" },
  ],
  Infrastructure: [
    { label: "Edge Hardware", to: "/approach", id: "INF_01" },
    { label: "Compliance", to: "/approach", id: "INF_02" },
  ],
  Intel: [
    { label: "Documentation", to: "/approach", id: "ITL_01" },
    { label: "Support Node", to: "/company#contact", id: "ITL_02" },
  ],
};

const Footer = () => {
  return (
    <footer className="relative bg-[#000000] pt-16 pb-8 overflow-hidden border-t border-white/10">
      {/* Scanline Effect */}
      <div className="scanline" />
      
      {/* Background Grid Accent */}
      <div className="absolute inset-0 bg-grid opacity-20 pointer-events-none" />

      <div className="mx-auto max-w-[1400px] px-4 md:px-8 relative z-10">
        {/* Top Branding Section */}
        <div className="mb-12 flex flex-col lg:flex-row lg:items-end justify-between gap-8">
          <div className="max-w-xl">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="flex items-center gap-4 mb-4"
            >
              <div className="p-2 bg-white text-black shadow-[0_0_20px_rgba(255,255,255,0.3)]">
                <Shield className="h-6 w-6" />
              </div>
              <h2 className="text-3xl md:text-5xl font-black text-white uppercase tracking-tighter font-[Chakra Petch]">
                VisionIQ
              </h2>
            </motion.div>
            <p className="text-base md:text-lg font-bold text-gray-500 uppercase tracking-[0.2em] leading-tight">
              Industrial-grade AI surveillance for high-density retail and commercial enterprises.
            </p>
          </div>

          <div className="flex flex-wrap gap-8">
            {[
              { icon: <Cpu className="w-5 h-5" />, label: "Edge_Compute", status: "ONLINE" },
              { icon: <Network className="w-5 h-5" />, label: "Node_Mesh", status: "ENCRYPTED" },
              { icon: <Database className="w-5 h-5" />, label: "Data_Lake", status: "SECURE" },
            ].map((node, i) => (
              <div key={i} className="flex flex-col gap-2">
                <div className="flex items-center gap-2 text-white/40">
                  {node.icon}
                  <span className="text-[10px] font-mono font-bold tracking-[0.3em] uppercase">{node.label}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#00F0FF] animate-pulse" />
                  <span className="text-xs font-mono font-black text-white tracking-[0.1em]">{node.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Link Matrix */}
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4 border-t border-white/10 pt-10">
          <div className="lg:col-span-1">
            <h4 className="text-[10px] font-black text-[#00F0FF] uppercase tracking-[0.4em] mb-6 flex items-center gap-3">
              <Terminal className="w-3 h-3" />
              Connect_Protocol
            </h4>
            <div className="flex flex-col gap-4">
              {["TWITTER", "LINKEDIN", "GITHUB"].map((s) => (
                <a 
                  key={s} 
                  href="#" 
                  className="group flex items-center justify-between p-3 border border-white/5 hover:border-[#00F0FF]/40 hover:bg-white/5 transition-all duration-300"
                >
                  <span className="text-xs font-mono font-bold text-gray-400 group-hover:text-white tracking-[0.3em]">{s}</span>
                  <Activity className="w-4 h-4 text-white/10 group-hover:text-[#00F0FF] group-hover:animate-pulse" />
                </a>
              ))}
            </div>
          </div>

          {Object.entries(footerLinks).map(([title, links], idx) => (
            <div key={title}>
              <h4 className="text-[10px] font-black text-white uppercase tracking-[0.4em] mb-6 flex items-center gap-3 font-[Chakra Petch]">
                <span className="text-gray-600 font-mono text-[9px]">0{idx + 1} //</span>
                {title}
              </h4>
              <ul className="space-y-4">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link 
                      to={link.to} 
                      className="group flex flex-col gap-1 transition-all duration-300"
                    >
                      <span className="text-[9px] font-mono text-gray-600 group-hover:text-[#00F0FF] transition-colors tracking-widest">{link.id}</span>
                      <span className="text-xs font-bold text-gray-400 group-hover:text-white uppercase tracking-widest transition-colors">
                        {link.label}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Status Bar */}
        <div className="mt-16 pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-6 bg-transparent">
          <div className="flex flex-col md:flex-row items-center gap-6 md:gap-10">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-ping" />
              <span className="text-[10px] font-mono text-gray-500 font-bold tracking-[0.4em]">SYSTEM_READY_V2.6</span>
            </div>
            <div className="flex items-center gap-6">
              <span className="text-[10px] font-mono text-gray-700 hover:text-white cursor-pointer tracking-[0.4em] uppercase transition-colors font-bold">Privacy_Protocol</span>
              <span className="text-[10px] font-mono text-gray-700 hover:text-white cursor-pointer tracking-[0.4em] uppercase transition-colors font-bold">Service_Terms</span>
            </div>
          </div>

          <div className="text-[10px] font-mono text-gray-700 tracking-[0.4em] uppercase font-bold text-center md:text-right">
            © 2026 VISIONIQ_CORP // DATA_DRIVEN_SECURITY
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
