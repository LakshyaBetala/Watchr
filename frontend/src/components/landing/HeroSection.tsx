import { useEffect, useRef, useState } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import SectionBadge from "./SectionBadge";
import { DitheringShader } from "@/components/ui/dithering-shader";

const stats = [
  { value: 2.4, prefix: "₹", suffix: "Cr+", label: "Shrinkage Prevented" },
  { value: 500, prefix: "", suffix: "+", label: "Cameras Deployed" },
  { value: 97, prefix: "", suffix: "%", label: "Fire Detection Acc" },
  { value: 60, prefix: "", suffix: "%", label: "Loss Reduction" },
];

const cycleWords = ["Threat", "Shoplifter", "Blind Spot", "Anomaly"];

function AnimatedCounter({ value, prefix, suffix }: { value: number; prefix: string; suffix: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (!inView) return;
    const duration = 2000;
    const startTime = performance.now();
    const easeOutExpos = (t: number) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t));
    const animate = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      setCount(easeOutExpos(progress) * value);
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [inView, value]);

  const display = value < 10 ? count.toFixed(1) : Math.round(count);

  return (
    <span ref={ref} className="text-3xl sm:text-5xl font-black text-white font-[Chakra Petch] tracking-tighter drop-shadow-[0_0_8px_rgba(255,255,255,0.4)]">
      {prefix}{display}{suffix}
    </span>
  );
}

function CyclingWord() {
  const [index, setIndex] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => setIndex((p) => (p + 1) % cycleWords.length), 2200);
    return () => clearInterval(interval);
  }, []);

  return (
    <span className="relative inline-flex min-w-[200px] sm:min-w-[300px] text-left">
      <AnimatePresence mode="wait">
        <motion.span
          key={cycleWords[index]}
          initial={{ opacity: 0, y: 15, filter: "blur(4px)", scale: 0.95 }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)", scale: 1 }}
          exit={{ opacity: 0, y: -15, filter: "blur(4px)", scale: 1.05 }}
          transition={{ duration: 0.4, type: "spring", bounce: 0 }}
          className="inline-block text-white border-b-4 border-white pb-1"
        >
          {cycleWords[index]}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

const HeroSection = () => {
  return (
    <section id="hero-section" className="relative min-h-screen overflow-hidden bg-[#050505] flex flex-col border-b border-white/10">
      
      {/* Tactical Background Grid */}
      <div 
        className="absolute inset-0 z-0 pointer-events-none opacity-20"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 255, 255, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
        }}
      />

      {/* Dithering Shader - Tactical Monochrome */}
      <div className="absolute inset-0 z-[1] pointer-events-none opacity-40 mix-blend-screen">
        <DitheringShader
          shape="wave"
          type="4x4"
          colorBack="#000000"
          colorFront="#ffffff"
          pxSize={4}
          speed={0.3}
          className="w-full h-full"
          width={1920}
          height={1080}
        />
      </div>
      
      {/* Center Vignette */}
      <div className="absolute inset-0 z-[2] pointer-events-none bg-[radial-gradient(circle_at_center,rgba(5,5,5,0)_0%,rgba(5,5,5,0.9)_80%)]" />

      { /* Main Content Area - Top-aligned with substantial padding for a premium feel */ }
      <div className="relative z-10 mx-auto max-w-7xl px-4 md:px-8 w-full flex-grow flex flex-col pt-32 md:pt-48 pb-20 text-left items-start">
        
        <motion.div 
          initial={{ opacity: 0, x: -30 }} 
          animate={{ opacity: 1, x: 0 }} 
          transition={{ duration: 0.7, delay: 0.1 }}
          className="flex flex-col items-start text-left max-w-5xl w-full"
        >
          <div className="mb-6">
            <SectionBadge text="TACTICAL INTELLIGENCE NODE" />
          </div>
          
          <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-[90px] font-black leading-[1.05] tracking-tight text-white mb-8 w-full uppercase" style={{ fontFamily: "'Chakra Petch', sans-serif" }}>
            Always Ahead<br /> 
            of the <CyclingWord />
          </h1>
          
          <p className="max-w-2xl text-lg md:text-2xl leading-relaxed text-gray-400 font-medium border-l-2 border-white/20 pl-6">
            Stop shrinkage, map customer flow, and secure your perimeter — utilizing one industrial-grade AI camera framework.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Link to="/dashboard" className="w-full block">
                <Button size="lg" className="w-full rounded-none font-bold text-lg h-16 px-10 bg-white text-black hover:bg-gray-200 uppercase tracking-widest relative overflow-hidden group">
                  <span className="relative z-10 flex items-center">
                    Enter Command Center <ArrowRight className="ml-3 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </span>
                  <div className="absolute inset-0 h-full w-full bg-black/10 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-300" />
                </Button>
              </Link>
            </motion.div>
            
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Link to="/approach" className="w-full block">
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full rounded-none font-bold text-lg h-16 px-10 border-2 border-white/30 text-white bg-transparent hover:bg-white/5 uppercase tracking-widest"
                >
                  System Specs
                </Button>
              </Link>
            </motion.div>
          </div>
        </motion.div>
      </div>

      {/* Tactical Bottom Bar - Normal document flow instead of absolute positioning */}
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        transition={{ duration: 0.8, delay: 0.4, type: "spring", bounce: 0 }}
        className="w-full relative mt-auto border-t border-white/10 bg-black/80 backdrop-blur-xl z-20"
      >
        <div className="max-w-7xl mx-auto px-4 md:px-8 grid grid-cols-2 lg:grid-cols-4 divide-x divide-white/10">
          {stats.map((stat, idx) => (
            <div key={idx} className="flex flex-col py-6 px-4 md:px-8 group">
              <span className="text-[10px] md:text-xs font-bold text-gray-500 uppercase tracking-[0.2em] mb-2 group-hover:text-white transition-colors">{stat.label}</span>
              <AnimatedCounter value={stat.value} prefix={stat.prefix} suffix={stat.suffix} />
            </div>
          ))}
        </div>
      </motion.div>
    </section>
  );
};

export default HeroSection;
