import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  BarChart, Bar, Legend,
} from "recharts";
import { Users, Clock, Zap, TrendingUp, BarChart3, ChevronRight } from "lucide-react";
import {
  footfallHourly, footfallWeekly, heatmapZones, demographics, dwellByZone
} from "@/data/watchrMockData";
import {
  AnimatedCard,
  CardBody,
  CardDescription,
  CardTitle,
  CardVisual,
  Visual1
} from "@/components/ui/animated-card";

const containerVar = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};
const itemVar = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 350, damping: 30 } },
};

const GlowTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#11141a] border border-[#2d3440] px-3 py-2 rounded text-xs font-mono shadow-xl shadow-black/50">
      <p className="text-[#8c9baf] mb-1">{label}</p>
      {payload.map((p: any) => (
        <p key={p.name} style={{ color: p.color }}>
          {p.name}: <span className="font-bold text-white">{p.value}</span>
        </p>
      ))}
    </div>
  );
};

export default function CustomerAnalytics() {
  const [timeView, setTimeView] = useState<"today" | "week">("today");

  const trendData = timeView === "today" ? footfallHourly : footfallWeekly;
  const xAxisKey = timeView === "today" ? "hour" : "day";

  return (
    <motion.div variants={containerVar} initial="hidden" animate="visible" className="w-full h-full flex flex-col gap-6">
      
      {/* ─── Header ─── */}
      <div className="flex items-end justify-between border-b border-[#2d3440] pb-4 flex-shrink-0">
        <div>
          <h1 className="text-3xl font-black font-display tracking-wide text-white flex items-center gap-3">
            CUSTOMER ANALYTICS
          </h1>
          <p className="text-[10px] font-mono text-[#8c9baf] uppercase tracking-[0.2em] mt-1.5 flex items-center gap-2">
            BEHAVIORAL MAPPING <span className="w-1 h-1 rounded-full bg-[#a855f7]" /> FOOTFALL TRENDS
          </p>
        </div>
      </div>

      {/* ─── Section 1: KPI Cards ─── */}
      <div className="grid grid-cols-3 gap-5">
        <motion.div variants={itemVar} className="tactical-panel rounded-xl p-5 border border-[#2d3440] flex flex-col gap-2 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#00F0FF]/5 rounded-bl-[100px] -z-10 group-hover:bg-[#00F0FF]/10 transition-colors" />
          <div className="flex justify-between items-start">
            <p className="text-[10px] font-mono text-[#8c9baf] uppercase tracking-widest">Total Footfall</p>
            <Users className="w-4 h-4 text-[#00F0FF]" />
          </div>
          <div className="flex items-end gap-3 mt-1">
            <span className="text-4xl font-black font-display">3,847</span>
            <span className="text-[11px] font-mono text-[#10b981] flex items-center mb-1.5">
              <TrendingUp className="w-3 h-3 mr-1" /> +12%
            </span>
          </div>
        </motion.div>

        <motion.div variants={itemVar} className="tactical-panel rounded-xl p-5 border border-[#2d3440] flex flex-col gap-2 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#FF003C]/5 rounded-bl-[100px] -z-10 group-hover:bg-[#FF003C]/10 transition-colors" />
          <div className="flex justify-between items-start">
            <p className="text-[10px] font-mono text-[#8c9baf] uppercase tracking-widest">Peak Hour</p>
            <Zap className="w-4 h-4 text-[#FF003C]" />
          </div>
          <div className="flex items-end gap-3 mt-1">
            <span className="text-4xl font-black font-display">7:00 PM</span>
            <span className="text-[11px] font-mono text-[#8c9baf] mb-1.5 whitespace-nowrap">741 visitors</span>
          </div>
        </motion.div>

        <motion.div variants={itemVar} className="tactical-panel rounded-xl p-5 border border-[#2d3440] flex flex-col gap-2 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#a855f7]/5 rounded-bl-[100px] -z-10 group-hover:bg-[#a855f7]/10 transition-colors" />
          <div className="flex justify-between items-start">
            <p className="text-[10px] font-mono text-[#8c9baf] uppercase tracking-widest">Avg Dwell Time</p>
            <Clock className="w-4 h-4 text-[#a855f7]" />
          </div>
          <div className="flex items-end gap-3 mt-1">
            <span className="text-4xl font-black font-display">8.4</span>
            <span className="text-[11px] font-mono text-[#8c9baf] mb-1.5">minutes</span>
          </div>
        </motion.div>
      </div>

      {/* ─── Section 2: Footfall Chart / Zone Heatmap ─── */}
      <div className="grid grid-cols-2 gap-5 min-h-[320px]">
        {/* Left: Chart */}
        <motion.div variants={itemVar} className="tactical-panel rounded-xl border border-[#2d3440] p-5 flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-[11px] font-mono text-[#8c9baf] uppercase tracking-widest flex items-center gap-2">
              <BarChart3 className="w-3.5 h-3.5" /> Visitor Footfall
            </h3>
            <div className="flex bg-[#11141a] border border-[#2d3440] rounded-lg p-1">
              <button 
                onClick={() => setTimeView("today")}
                className={`py-1 px-3 rounded-md text-[10px] font-mono font-bold uppercase transition-all ${timeView === "today" ? "bg-[#00F0FF] text-black" : "text-[#8c9baf] hover:text-white"}`}>
                Today
              </button>
              <button 
                onClick={() => setTimeView("week")}
                className={`py-1 px-3 rounded-md text-[10px] font-mono font-bold uppercase transition-all ${timeView === "week" ? "bg-[#00F0FF] text-black" : "text-[#8c9baf] hover:text-white"}`}>
                7 Days
              </button>
            </div>
          </div>
          <div className="flex-1 min-h-0 relative -ml-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00F0FF" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#00F0FF" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#2d3440" />
                <XAxis dataKey={xAxisKey} axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: "#8c9baf", fontFamily: "monospace" }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: "#8c9baf", fontFamily: "monospace" }} />
                <Tooltip content={<GlowTooltip />} cursor={{ fill: "rgba(0,240,255,0.05)" }} />
                <Area type="monotone" dataKey="count" name="Visitors" stroke="#00F0FF" strokeWidth={2} fillOpacity={1} fill="url(#colorCount)" animated />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Right: Heatmap */}
        <motion.div variants={itemVar} className="tactical-panel rounded-xl border border-[#2d3440] p-5 flex flex-col">
          <h3 className="text-[11px] font-mono text-[#8c9baf] uppercase tracking-widest flex items-center gap-2 mb-6">
            <ChevronRight className="w-3.5 h-3.5 text-[#FF003C]" /> Zone Intensity Map
          </h3>
          <div className="flex-1 grid grid-cols-4 grid-rows-3 gap-2">
            {heatmapZones.map((z) => {
              // Interpolate color from low (cool) to high (hot)
              const hue = Math.max(0, 220 - (z.intensity * 2.2)); // 220 is blue, 0 is red
              const intensityColor = `hsl(${hue}, 80%, 50%)`;
              return (
                <div key={z.zone} 
                  className="rounded-md relative overflow-hidden border border-white/5 group flex flex-col items-center justify-center gap-1 transition-all hover:scale-[1.03] cursor-crosshair"
                  style={{ backgroundColor: `hsla(${hue}, 80%, 30%, 0.15)` }}>
                  
                  {/* Background Fill scaled by intensity */}
                  <div className="absolute inset-0 opacity-20 group-hover:opacity-40 transition-opacity" style={{ backgroundColor: intensityColor }} />
                  <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black/50 to-transparent h-1/2" />
                  
                  <span className="relative z-10 text-[9px] font-mono text-center px-1 text-[#8c9baf] leading-tight uppercase font-bold group-hover:text-white selection:bg-transparent">
                    {z.zone}
                  </span>
                  <span className="relative z-10 text-lg font-black font-display text-white selection:bg-transparent" style={{ textShadow: `0 0 10px ${intensityColor}` }}>
                    {z.intensity}%
                  </span>
                </div>
              );
            })}
          </div>
        </motion.div>
      </div>

      {/* ─── Section 3: Demographics / Dwell Time ─── */}
      <div className="grid grid-cols-2 gap-5 min-h-[250px] flex-1 pb-5">
        {/* Left: Demographics */}
        <motion.div variants={itemVar} className="tactical-panel rounded-xl border border-[#2d3440] p-5 flex flex-col">
          <h3 className="text-[11px] font-mono text-[#8c9baf] uppercase tracking-widest flex items-center gap-2 mb-6">
            <Users className="w-3.5 h-3.5 text-[#a855f7]" /> Demographics Split
          </h3>
          <div className="flex-1 -ml-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={demographics}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#2d3440" />
                <XAxis dataKey="group" axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: "#8c9baf", fontFamily: "monospace" }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: "#8c9baf", fontFamily: "monospace" }} />
                <Tooltip cursor={{ fill: "rgba(255,255,255,0.03)" }} content={<GlowTooltip />} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: "10px", fontFamily: "monospace", color: "#8c9baf" }} />
                <Bar dataKey="male" name="Male" fill="#00F0FF" radius={[2, 2, 0, 0]} barSize={20} />
                <Bar dataKey="female" name="Female" fill="#a855f7" radius={[2, 2, 0, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Right: Dwell Time */}
        <motion.div variants={itemVar} className="tactical-panel rounded-xl border border-[#2d3440] p-5 overflow-hidden flex flex-col">
          <h3 className="text-[11px] font-mono text-[#8c9baf] uppercase tracking-widest flex items-center gap-2 mb-5">
            <Clock className="w-3.5 h-3.5 text-[#f59e0b]" /> Avg Dwell by Zone
          </h3>
          <div className="flex-1 flex flex-col gap-4 overflow-y-auto pr-2 custom-scrollbar">
            {dwellByZone.sort((a,b) => b.avgMin - a.avgMin).map((z) => {
              const maxDwell = 15; // normalize against 15 min max
              const width = `${Math.min(100, (z.avgMin / maxDwell) * 100)}%`;
              return (
                <div key={z.zone} className="flex items-center gap-4 group">
                  <div className="w-24 text-[10px] font-mono text-[#8c9baf] uppercase truncate group-hover:text-white transition-colors">
                    {z.zone}
                  </div>
                  <div className="flex-[3] h-2 bg-[#11141a] rounded-full overflow-hidden relative">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width }}
                      transition={{ duration: 1, type: "spring" }}
                      className="absolute left-0 top-0 h-full bg-gradient-to-r from-[#f59e0b]/40 to-[#f59e0b]" 
                    />
                  </div>
                  <div className="w-16 text-right text-[11px] font-mono font-bold text-white">
                    {z.avgMin} <span className="text-[#8c9baf] text-[9px]">min</span>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      </div>

      {/* ─── Section 4: Live Telemetry Card (Animated) ─── */}
      <motion.div variants={itemVar} className="flex gap-5 border-t border-[#2d3440] pt-6 pb-2 mt-2">
        <div className="flex flex-col gap-2 max-w-sm">
          <h3 className="text-sm font-mono font-bold text-white uppercase tracking-widest flex items-center gap-2">
            <Zap className="w-4 h-4 text-[#00F0FF]" /> AI Telemetry Stream
          </h3>
          <p className="text-[11px] font-mono text-[#8c9baf]">
            Live visualizations piped directly from the YOLOv8n hardware cluster, showing background data ingestion loops and model inferences on raw camera streams.
          </p>
        </div>
        
        <AnimatedCard className="bg-[#0a0c10] border-[#2d3440] shadow-xl shadow-black">
          <CardVisual>
            <Visual1 mainColor="#00F0FF" secondaryColor="#a855f7" gridColor="rgba(255,255,255,0.03)" />
          </CardVisual>
          <CardBody className="border-[#2d3440] bg-[#11141a]">
            <CardTitle className="text-white text-sm font-mono uppercase tracking-wider">Vision Model Active</CardTitle>
            <CardDescription className="text-[#8c9baf] text-[11px] font-mono">
              Processing 24 nodes simultaneously at 30 inferences/sec.
            </CardDescription>
          </CardBody>
        </AnimatedCard>
      </motion.div>

    </motion.div>
  );
}
