import { motion } from "framer-motion";
import { ArrowRight, Terminal } from "lucide-react";
import SectionBadge from "./SectionBadge";

const posts = [
  { category: "Case Study", title: "How AI Cameras Cut Shrinkage by 60% at a Mumbai Fashion Chain", excerpt: "A deep dive into deploying concealment detection across 8 stores and the measurable impact on loss prevention.", date: "02 / MAR / 2026", readTime: "06 MIN", id: "DSP_001" },
  { category: "Industry", title: "The Real Cost of Passive CCTV in Indian Retail", excerpt: "Why traditional surveillance is costing retailers ₹1.2 lakh crore annually — and what the alternative looks like.", date: "18 / FEB / 2026", readTime: "04 MIN", id: "DSP_002" },
  { category: "Case Study", title: "Fire Detection: Warehouse in Pune Averts Disaster", excerpt: "How VisionIQ's thermal + visual AI detected an electrical fire 11 minutes before the smoke alarm triggered.", date: "05 / FEB / 2026", readTime: "05 MIN", id: "DSP_003" },
];

const BlogSection = () => (
  <section className="py-24 md:py-32 bg-[#000000] relative overflow-hidden border-b border-white/10">
    <div className="mx-auto max-w-7xl px-4 md:px-8 relative z-10">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-16 md:mb-24 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="max-w-3xl"
        >
          <SectionBadge text="FIELD DISPATCHES" />
          <h2 className="mt-6 text-4xl md:text-5xl lg:text-7xl font-black text-white uppercase tracking-tighter" style={{ fontFamily: "'Chakra Petch', sans-serif" }}>
            Operational <br />
            <span className="text-gray-500">Intelligence.</span>
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
            Latest analysis and telemetry reports from live tactical surveillance deployments.
          </p>
        </motion.div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {posts.map((post, i) => (
          <motion.article
            key={i}
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1 }}
            viewport={{ once: true }}
            className="group relative border border-white/10 bg-[#050505] overflow-hidden transition-all duration-300 hover:border-white/30"
          >
            {/* Corner Indicators */}
            <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-white/20 group-hover:border-white/40 transition-all" />
            <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-white/20 group-hover:border-white/40 transition-all" />

            {/* Dithered placeholder header */}
            <div className="h-40 bg-[#0A0A0A] border-b border-white/10 flex items-center justify-center relative overflow-hidden">
               <div className="absolute inset-0 opacity-10 group-hover:opacity-20 transition-opacity bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:10px:10px]" />
               <Terminal size={40} className="text-white/10 group-hover:text-white/30 transition-all duration-500 group-hover:scale-110" />
               <div className="absolute bottom-4 left-6 text-[10px] font-mono text-gray-700 tracking-[0.4em] uppercase">
                 ID: {post.id}
               </div>
            </div>

            <div className="p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-1.5 h-1.5 bg-white rounded-full group-hover:animate-ping" />
                <span className="text-[10px] font-mono font-bold text-gray-500 uppercase tracking-widest">{post.category}</span>
              </div>

              <h3 className="text-xl font-black text-white mb-4 leading-tight uppercase tracking-tight group-hover:text-gray-200 transition-colors" style={{ fontFamily: "'Chakra Petch', sans-serif" }}>
                {post.title}
              </h3>
              <p className="text-xs font-medium text-gray-500 mb-8 line-clamp-2 uppercase tracking-wide leading-relaxed">
                {post.excerpt}
              </p>

              <div className="flex items-center justify-between border-t border-white/10 pt-6">
                <div className="flex flex-col">
                  <span className="text-[10px] font-mono text-gray-600 tracking-widest uppercase mb-1">Posted</span>
                  <span className="text-[10px] font-mono font-bold text-white tracking-widest">{post.date}</span>
                </div>
                <div className="flex flex-col text-right">
                  <span className="text-[10px] font-mono text-gray-600 tracking-widest uppercase mb-1">Time</span>
                  <span className="text-[10px] font-mono font-bold text-white tracking-widest">{post.readTime}</span>
                </div>
              </div>

              <div className="mt-8 flex items-center justify-between group/link">
                <span className="text-[10px] font-mono font-bold text-white uppercase tracking-[0.3em] group-hover:tracking-[0.4em] transition-all">Read Intel Report</span>
                <ArrowRight className="h-4 w-4 text-white group-hover:translate-x-2 transition-transform" />
              </div>
            </div>
          </motion.article>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.8 }}
        className="mt-20 flex items-center gap-3 text-white/10"
      >
        <span className="text-[10px] font-mono tracking-[0.4em] uppercase">Telemetry Logs End // All Systems Normal</span>
      </motion.div>
    </div>
  </section>
);

export default BlogSection;
