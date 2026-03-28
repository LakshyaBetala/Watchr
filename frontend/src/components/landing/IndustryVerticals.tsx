import { motion } from "framer-motion";
import {
  Shirt, ShoppingCart, Coffee, Warehouse,
  Monitor, Hotel, ArrowUpRight
} from "lucide-react";
import SectionBadge from "./SectionBadge";
import { Link } from "react-router-dom";

const verticals = [
  { 
    icon: Shirt, 
    name: "Fashion & Apparel", 
    desc: "Fitting room occupancy tracking, visual merchandising, & shrinkage detection.", 
    className: "md:col-span-2 bg-[#050505]",
    code: "SEC_FA_01",
    slug: "fashion"
  },
  { 
    icon: ShoppingCart, 
    name: "Supermarkets", 
    desc: "Automated checkout monitoring, shelf stock tracking, & shrink reduction.", 
    className: "col-span-1",
    code: "SEC_GZ_02",
    slug: "supermarkets"
  },
  { 
    icon: Warehouse, 
    name: "Warehousing", 
    desc: "Perimeter security & PPE safety compliance tracking.", 
    className: "col-span-1",
    code: "SEC_WH_03",
    slug: "warehousing"
  },
  { 
    icon: Monitor, 
    name: "Electronics", 
    desc: "High-value asset tracking & behavior alerts.", 
    className: "col-span-1",
    code: "SEC_ELC_04",
    slug: "electronics"
  },
  { 
    icon: Coffee, 
    name: "Cafes & QSR", 
    desc: "Queue lengths & order turnaround speed metrics.", 
    className: "col-span-1",
    code: "SEC_QSR_05",
    slug: "qsr"
  },
  { 
    icon: Hotel, 
    name: "Hospitality", 
    desc: "VIP arrival alerts & unauthorized entry prevention.", 
    className: "md:col-span-2 bg-[#080808]",
    code: "SEC_HOS_06",
    slug: "hospitality"
  },
];

const IndustryVerticals = () => (
  <section className="py-24 md:py-32 bg-[#000000] relative overflow-hidden border-b border-white/10">
    {/* Heavy Grid Pattern */}
    <div className="absolute inset-0 z-0 pointer-events-none opacity-20 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[length:100%_40px]" />

    <div className="mx-auto max-w-[1400px] px-4 md:px-8 relative z-10">
      
      <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-16 md:mb-24 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="max-w-3xl"
        >
          <SectionBadge text="SECTOR DEPLOYMENT" />
          <h2 className="mt-6 text-4xl md:text-5xl lg:text-7xl font-black text-white uppercase tracking-tighter" style={{ fontFamily: "'Chakra Petch', sans-serif" }}>
            Tactical <br />
            <span className="text-gray-500">Verticals.</span>
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
            VisionIQ adapts to high-density environments. Our AI modules provides mission-critical telemetry across diverse industries.
          </p>
        </motion.div>
      </div>

      {/* Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-1 divide-white/10 border border-white/10 p-1">
        {verticals.map((v, i) => (
          <Link 
            key={v.name} 
            to={`/solutions/${v.slug}`}
            className={`group block relative ${v.className || ""}`}
          >
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ delay: i * 0.05, duration: 0.4 }}
              viewport={{ once: true }}
              className={`relative flex flex-col justify-between border border-white/5 bg-[#050505] p-6 min-h-[220px] h-full transition-all duration-300 hover:bg-[#0a0a0a] hover:border-white/30`}
            >
              <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <ArrowUpRight className="h-4 w-4 text-white" />
              </div>

              {/* Corner Markers */}
              <div className="absolute top-0 right-0 w-2 h-2 border-r border-t border-white/0 group-hover:border-white/40 transition-all" />
              
              <div className="flex justify-between items-start mb-10">
                <div className="p-3 bg-white/5 border border-white/10 group-hover:bg-white group-hover:text-black transition-all">
                  <v.icon className="h-6 w-6" />
                </div>
                <div className="text-[10px] font-mono font-bold text-gray-700 tracking-[0.3em] uppercase">
                  {v.code}
                </div>
              </div>

              {/* Text Content */}
              <div className="mt-auto">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-xl font-black text-white uppercase tracking-widest font-[Chakra Petch]">
                    {v.name}
                  </h3>
                </div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-widest transition-colors leading-relaxed group-hover:text-gray-300">
                  {v.desc}
                </p>
              </div>
            </motion.div>
          </Link>
        ))}
      </div>
      
      {/* Footer Line */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 1 }}
        className="mt-16 flex items-center justify-between border-t border-white/10 pt-8"
      >
        <div className="flex items-center gap-3">
          <div className="w-1.5 h-1.5 bg-white animate-pulse rounded-full" />
          <span className="text-[10px] font-mono tracking-[0.3em] uppercase text-white/20">Sector Analysis: Complete</span>
        </div>
        <div className="text-[10px] font-mono tracking-[0.3em] uppercase text-white/20">
          SCAN_ID: 0x88F2
        </div>
      </motion.div>
    </div>
  </section>
);

export default IndustryVerticals;
