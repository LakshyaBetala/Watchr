import { motion, useInView } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import { Shield, BarChart3, Users, Flame, ScanFace, Layers } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import SectionBadge from "./SectionBadge";
import { useIsMobile } from "@/hooks/use-mobile";

const columnIcons = [Shield, BarChart3, Users, Flame, ScanFace, Layers];
const features = ["Theft AI", "Customer Analytics", "Staff Monitor", "Fire Detection", "Re-ID", "Integrated"];

const companies = [
  { name: "VisionIQ", checks: [true, true, true, true, true, true], highlight: true },
  { name: "Verkada", checks: [true, false, false, false, false, false] },
  { name: "Hikvision", checks: [false, false, false, true, false, false] },
  { name: "Veesion", checks: [true, false, false, false, false, false] },
  { name: "RetailNext", checks: [false, true, false, false, false, false] },
  { name: "Scylla", checks: [true, false, false, true, true, false] },
];

const VisionIQCheck = ({ delay }: { delay: number }) => (
  <motion.div
    initial={{ scale: 0, opacity: 0 }}
    whileInView={{ scale: 1, opacity: 1 }}
    viewport={{ once: true }}
    transition={{ type: "spring", stiffness: 300, damping: 15, delay }}
    className="flex justify-center"
  >
    <div className="relative group">
      <div className="absolute inset-0 bg-white/20 blur-[4px] group-hover:blur-[8px] transition-all" />
      <svg width="22" height="22" viewBox="0 0 20 20" className="relative">
        <rect x="2" y="2" width="16" height="16" fill="rgba(255,255,255,0.1)" stroke="white" strokeWidth="1" />
        <path d="M5 10l3 3 7-7" stroke="white" strokeWidth="2.5" fill="none" strokeLinecap="square" strokeLinejoin="miter" />
      </svg>
    </div>
  </motion.div>
);

const CompetitorCheck = ({ delay }: { delay: number }) => (
  <motion.div
    initial={{ scale: 0, opacity: 0 }}
    whileInView={{ scale: 1, opacity: 1 }}
    viewport={{ once: true }}
    transition={{ type: "spring", stiffness: 300, damping: 15, delay }}
    className="flex justify-center"
  >
    <svg width="20" height="20" viewBox="0 0 20 20">
      <rect x="3" y="3" width="14" height="14" fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
      <path d="M5 10l3 3 7-7" stroke="rgba(255,255,255,0.4)" strokeWidth="1.8" fill="none" strokeLinecap="square" strokeLinejoin="miter" />
    </svg>
  </motion.div>
);

const XMark = () => (
  <div className="flex justify-center opacity-30">
    <svg width="20" height="20" viewBox="0 0 20 20">
      <rect x="3" y="3" width="14" height="14" fill="transparent" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
      <path d="M6 6l8 8M14 6l-8 8" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" fill="none" strokeLinecap="square" />
    </svg>
  </div>
);

const ComparisonTable = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const tableScrollRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });
  const isMobile = useIsMobile();
  const [scrollHintVisible, setScrollHintVisible] = useState(true);

  useEffect(() => {
    if (!isMobile || !tableScrollRef.current) return;
    const el = tableScrollRef.current;
    const onScroll = () => { if (el.scrollLeft > 10) setScrollHintVisible(false); };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, [isMobile]);

  const competitorRows = companies.filter((c) => !c.highlight);
  const visioniq = companies.find((c) => c.highlight)!;
  const competitorDelays = [0.65, 0.73, 0.81, 0.89, 0.97];

  return (
    <section
      ref={sectionRef}
      className="py-16 md:py-32 relative bg-[#050505] border-b border-white/10"
    >
      {/* Background Tactical Grid */}
      <div 
        className="absolute inset-0 z-0 pointer-events-none opacity-10"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 255, 255, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: '80px 80px',
        }}
      />
      
      <div className="relative z-10 mx-auto max-w-7xl px-4 md:px-8">
        {/* Headline */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="text-left mb-12 md:mb-16 border-l-2 border-white/30 pl-6"
        >
          <SectionBadge text="SYSTEM BENCHMARKS" />
          <h2 className="text-3xl font-black text-white md:text-5xl mt-4 uppercase tracking-tighter" style={{ fontFamily: "'Chakra Petch', sans-serif" }}>
            The Only Platform<br />
            Doing All Five.
          </h2>
          <p className="mt-4 md:mt-6 text-sm md:text-xl text-gray-400 max-w-2xl font-medium">
            Fragmented solutions create security vulnerabilities. Deploy a single, unified operations framework that completely outclasses point solutions.
          </p>
        </motion.div>

        {/* Tactical Data Table */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
          className="relative"
        >
          {/* Table Container Corners */}
          <div className="absolute -top-2 -left-2 w-4 h-4 border-t-2 border-l-2 border-white/40" />
          <div className="absolute -top-2 -right-2 w-4 h-4 border-t-2 border-r-2 border-white/40" />
          <div className="absolute -bottom-2 -left-2 w-4 h-4 border-b-2 border-l-2 border-white/40" />
          <div className="absolute -bottom-2 -right-2 w-4 h-4 border-b-2 border-r-2 border-white/40" />

          <div
            ref={tableScrollRef}
            className="overflow-hidden border border-white/10 bg-[#0A0A0A]"
            style={{
              ...(isMobile
                ? {
                    overflowX: "scroll",
                    WebkitOverflowScrolling: "touch",
                    maskImage: "linear-gradient(to right, black 85%, transparent 100%)",
                    WebkitMaskImage: "linear-gradient(to right, black 85%, transparent 100%)",
                  }
                : {}),
            }}
          >
            <table className="w-full" style={{ minWidth: 700 }}>
              {/* Header */}
              <motion.thead
                initial={{ opacity: 0, y: "-100%" }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: 0.3 }}
              >
                <tr className="bg-white/5 border-b border-white/10">
                  <th
                    className="text-left text-[14px] font-bold text-white uppercase tracking-widest h-16"
                    style={{
                      paddingLeft: 28,
                      ...(isMobile ? { position: "sticky" as const, left: 0, zIndex: 2, borderRight: "1px solid rgba(255,255,255,0.08)" } : {}),
                      background: isMobile ? "#0A0A0A" : undefined,
                    }}
                  >
                    System vendor
                  </th>
                  {features.map((f, i) => {
                    const Icon = columnIcons[i];
                    return (
                      <th key={f} className="text-center h-16 px-2 md:px-3 border-l border-white/5">
                        <Icon size={16} className="text-white/40 mx-auto mb-2" />
                        <span className="text-[10px] uppercase tracking-widest text-white/50 font-bold">
                          {f}
                        </span>
                      </th>
                    );
                  })}
                </tr>
              </motion.thead>

              <tbody>
                {/* VisionIQ Row */}
                <motion.tr
                  initial={{ opacity: 0, x: -40 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.5, ease: "easeOut" }}
                  className="h-[80px] border-b border-white/20 relative group"
                  style={{
                    background: "linear-gradient(90deg, rgba(255,255,255,0.08) 0%, transparent 100%)",
                    boxShadow: "inset 4px 0 0 0 #FFFFFF",
                  }}
                >
                  <td
                    className="text-[18px] font-black text-white uppercase"
                    style={{
                      paddingLeft: 24,
                      fontFamily: "'Chakra Petch', sans-serif",
                      ...(isMobile ? { position: "sticky" as const, left: 0, zIndex: 2, borderRight: "1px solid rgba(255,255,255,0.2)", background: "rgba(10,10,10,0.95)" } : {}),
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <span>{visioniq.name}</span>
                      <span className="hidden sm:inline-block border border-white/40 bg-white/10 text-white text-[10px] uppercase tracking-[0.2em] px-3 py-1 font-bold shadow-[0_0_10px_rgba(255,255,255,0.1)]">
                        v4.2.0 Array
                      </span>
                    </div>
                  </td>
                  {visioniq.checks.map((_, j) => (
                    <td key={j} className="text-center align-middle border-l border-white/5 bg-white/5 group-hover:bg-white/10 transition-colors">
                      <VisionIQCheck delay={0.6 + j * 0.04} />
                    </td>
                  ))}
                </motion.tr>

                {/* Competitor Rows */}
                {competitorRows.map((c, i) => (
                  <motion.tr
                    key={c.name}
                    initial={{ opacity: 0, y: 15 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.35, delay: competitorDelays[i], ease: "easeOut" }}
                    className={`group h-14 border-b border-white/10 transition-colors ${
                      i % 2 !== 0 ? "bg-white/[0.02]" : "bg-transparent"
                    } hover:bg-white/5`}
                  >
                    <td
                      className="text-sm font-bold text-gray-500 group-hover:text-white transition-colors"
                      style={{
                        paddingLeft: 28,
                        ...(isMobile ? { position: "sticky" as const, left: 0, zIndex: 2, borderRight: "1px solid rgba(255,255,255,0.08)" } : {}),
                        background: isMobile ? "#0A0A0A" : undefined,
                      }}
                    >
                      {c.name}
                    </td>
                    {c.checks.map((checked, j) => (
                      <td key={j} className="text-center align-middle border-l border-white/5">
                        {checked ? <CompetitorCheck delay={competitorDelays[i] + 0.1 + j * 0.04} /> : <XMark />}
                      </td>
                    ))}
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile scroll hint */}
          {isMobile && scrollHintVisible && (
            <p className="text-left mt-3 text-gray-500 text-[10px] font-mono tracking-widest uppercase">
              [ Swipe left for full telemetry ]
            </p>
          )}
        </motion.div>

        {/* Footnote */}
        <p className="mt-6 font-mono text-gray-500 text-[10px] uppercase tracking-widest">
          SYS/REF: Publicly available product documentation, Q1 2026. VisionIQ is the only platform executing all six vectors under one contract.
        </p>

        {/* Action Row */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-col sm:flex-row items-center justify-between mt-16 gap-6 p-8 bg-[#0A0A0A] border border-white/20 relative"
        >
          {/* Tactical Corners */}
          <div className="absolute top-0 left-0 w-2 h-2 bg-white" />
          <div className="absolute bottom-0 right-0 w-2 h-2 bg-white" />

          <div className="text-center sm:text-left">
            <h4 className="text-xl font-black text-white mb-2 uppercase tracking-wide font-[Chakra Petch]">Deploy Advanced Security</h4>
            <Link to="/approach" className="text-xs font-bold font-mono text-gray-400 hover:text-white flex items-center gap-2 justify-center sm:justify-start uppercase tracking-widest transition-colors">
               Review full system logic
            </Link>
          </div>
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="w-full sm:w-auto">
            <Link to="/dashboard" className="w-full sm:w-auto block">
              <Button size="lg" className="w-full sm:w-auto rounded-none font-bold text-base px-10 h-14 bg-white text-black hover:bg-gray-200 uppercase tracking-widest">
                Initialize Dashboard
              </Button>
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default ComparisonTable;
