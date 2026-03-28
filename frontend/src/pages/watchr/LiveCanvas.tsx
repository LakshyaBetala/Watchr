import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useMotionValue, useTransform } from "framer-motion";
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from "recharts";
import {
  Activity, ShieldAlert, Zap, Eye, AlertTriangle,
  TrendingUp, Users, CheckCircle2, XCircle, Clock,
} from "lucide-react";
import {
  kpiData, alertFeed, zoneOccupancyHistory,
  detectionConfHistory, trackedObjects, ZONES,
} from "@/data/watchrMockData";

// ── Stagger variants ─────────────────────────────────────────────────────────
const containerVar = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.07, delayChildren: 0.1 } },
};
const itemVar = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 320, damping: 28 } },
};

// ── Animated Counter ─────────────────────────────────────────────────────────
function AnimCounter({ to, duration = 800 }: { to: number; duration?: number }) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    let start = 0;
    const step = to / (duration / 16);
    const t = setInterval(() => {
      start += step;
      if (start >= to) { setVal(to); clearInterval(t); }
      else setVal(Math.floor(start));
    }, 16);
    return () => clearInterval(t);
  }, [to, duration]);
  return <>{val}</>;
}

// ── Custom Tooltip ────────────────────────────────────────────────────────────
const GlowTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#11141a] border border-[#2d3440] px-3 py-2 rounded text-xs font-mono">
      <p className="text-[#8c9baf] mb-1">{label}</p>
      {payload.map((p: any) => (
        <p key={p.name} style={{ color: p.color }}>{p.name}: {p.value}</p>
      ))}
    </div>
  );
};

// ── Zone Canvas (SVG floor map) ───────────────────────────────────────────────
const ZONE_RECTS = [
  { id: "shelf",    x: 40,  y: 30,  w: 180, h: 80,  label: "SHELF ZONE",    color: "#00F0FF" },
  { id: "billing",  x: 260, y: 30,  w: 140, h: 80,  label: "BILLING",       color: "#10b981" },
  { id: "exit",     x: 260, y: 140, w: 140, h: 60,  label: "EXIT GATE",     color: "#ef4444" },
  { id: "entrance", x: 40,  y: 140, w: 140, h: 60,  label: "ENTRANCE",      color: "#a78bfa" },
];

function ZoneCanvas() {
  const pulseRef = useRef(0);
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 1200);
    return () => clearInterval(id);
  }, []);

  const dots = trackedObjects.map((o, i) => {
    const zone = ZONE_RECTS.find(z => z.id === o.zone);
    if (!zone) return null;
    const x = zone.x + zone.w / 2 + (i % 3 - 1) * 24;
    const y = zone.y + zone.h / 2 + (i % 2 === 0 ? -10 : 10);
    return { ...o, cx: x, cy: y, zoneColor: zone.color };
  }).filter(Boolean);

  return (
    <svg viewBox="0 0 440 220" className="w-full h-full" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
      {/* Background grid */}
      <defs>
        <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
          <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="0.5" />
        </pattern>
        {ZONE_RECTS.map(z => (
          <radialGradient key={`grad-${z.id}`} id={`grad-${z.id}`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={z.color} stopOpacity="0.12" />
            <stop offset="100%" stopColor={z.color} stopOpacity="0.02" />
          </radialGradient>
        ))}
      </defs>
      <rect width="440" height="220" fill="url(#grid)" />

      {/* Zone rectangles */}
      {ZONE_RECTS.map(z => (
        <g key={z.id}>
          <rect x={z.x} y={z.y} width={z.w} height={z.h}
            fill={`url(#grad-${z.id})`}
            stroke={z.color} strokeWidth="1" strokeOpacity="0.5" rx="4" />
          {/* Corner brackets */}
          <path d={`M${z.x+2},${z.y+10} L${z.x+2},${z.y+2} L${z.x+10},${z.y+2}`}
            stroke={z.color} strokeWidth="1.5" fill="none" strokeOpacity="0.9" />
          <path d={`M${z.x+z.w-10},${z.y+z.h-2} L${z.x+z.w-2},${z.y+z.h-2} L${z.x+z.w-2},${z.y+z.h-10}`}
            stroke={z.color} strokeWidth="1.5" fill="none" strokeOpacity="0.9" />
          <text x={z.x + 8} y={z.y + z.h - 8} fontSize="7" fill={z.color} fillOpacity="0.7" letterSpacing="0.1em">
            {z.label}
          </text>
        </g>
      ))}

      {/* Tracked ID dots */}
      {dots.map((d: any) => (
        <g key={d.id}>
          {/* Pulse ring */}
          <circle cx={d.cx} cy={d.cy} r={tick % 2 === 0 ? 12 : 8}
            fill="none" stroke={d.status === "threat" ? "#FF003C" : d.zoneColor}
            strokeWidth="0.8" strokeOpacity="0.3"
            style={{ transition: "r 0.6s ease" }} />
          <circle cx={d.cx} cy={d.cy} r={5}
            fill={d.status === "threat" ? "#FF003C" : d.status === "suspicious" ? "#F59E0B" : d.zoneColor}
            fillOpacity="0.9" />
          <text x={d.cx + 8} y={d.cy + 4} fontSize="7" fill="white" fillOpacity="0.8">
            ID#{d.id}
          </text>
        </g>
      ))}

      {/* Scanline sweep */}
      <line x1="0" y1="0" x2="440" y2="0" stroke="#00F0FF" strokeWidth="1" strokeOpacity="0.08">
        <animateTransform attributeName="transform" type="translate" from="0,0" to="0,220"
          dur="3s" repeatCount="indefinite" />
      </line>
    </svg>
  );
}

// ── Alert Ticker ──────────────────────────────────────────────────────────────
const SEV_STYLES: Record<string, { border: string; text: string; bg: string; icon: JSX.Element }> = {
  critical: { border: "border-[#FF003C]/40", text: "text-[#FF003C]", bg: "bg-[#FF003C]/5", icon: <XCircle className="w-3 h-3" /> },
  warning:  { border: "border-[#F59E0B]/40", text: "text-[#F59E0B]", bg: "bg-[#F59E0B]/5", icon: <AlertTriangle className="w-3 h-3" /> },
  ok:       { border: "border-[#10b981]/40", text: "text-[#10b981]", bg: "bg-[#10b981]/5", icon: <CheckCircle2 className="w-3 h-3" /> },
  info:     { border: "border-[#00F0FF]/40", text: "text-[#00F0FF]",  bg: "bg-[#00F0FF]/5",  icon: <Activity className="w-3 h-3" /> },
};

function AlertTicker() {
  const [alerts, setAlerts] = useState(alertFeed);

  useEffect(() => {
    const id = setInterval(() => {
      const now = new Date();
      const ts = `${String(now.getHours()).padStart(2,"0")}:${String(now.getMinutes()).padStart(2,"0")}:${String(now.getSeconds()).padStart(2,"0")}`;
      const synths = [
        { type: "dwell", msg: `ID #${Math.floor(Math.random()*15)+1} entered Shelf zone`, sev: "warning" },
        { type: "cleared", msg: `ID #${Math.floor(Math.random()*10)+1} cleared at Billing`, sev: "ok" },
        { type: "theft", msg: `SUSPICIOUS EXIT detected — ID #${Math.floor(Math.random()*8)+1}`, sev: "critical" },
        { type: "new", msg: `New tracker registered — conf ${(0.7 + Math.random()*0.25).toFixed(2)}`, sev: "info" },
      ];
      const pick = synths[Math.floor(Math.random() * synths.length)];
      setAlerts(prev => [{ id: `live-${Date.now()}`, ts, ...pick }, ...prev.slice(0, 11)]);
    }, 4000);
    return () => clearInterval(id);
  }, []);

  return (
    <motion.ul variants={containerVar} initial="hidden" animate="visible" className="flex flex-col gap-1.5 overflow-hidden">
      <AnimatePresence initial={false}>
        {alerts.map((a) => {
          const s = SEV_STYLES[a.sev] || SEV_STYLES.info;
          return (
            <motion.li key={a.id}
              layout
              initial={{ opacity: 0, x: -20, height: 0 }}
              animate={{ opacity: 1, x: 0, height: "auto" }}
              exit={{ opacity: 0, x: 20, height: 0 }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
              className={`flex items-start gap-2 px-3 py-2 rounded border ${s.border} ${s.bg} text-xs font-mono`}>
              <span className={`mt-0.5 flex-shrink-0 ${s.text}`}>{s.icon}</span>
              <span className="text-[#8c9baf] flex-shrink-0">{a.ts}</span>
              <span className={s.text}>{a.msg}</span>
            </motion.li>
          );
        })}
      </AnimatePresence>
    </motion.ul>
  );
}

// ── KPI Card ──────────────────────────────────────────────────────────────────
function KpiCard({ label, value, unit, trend, trendDir, i }: any) {
  const isUp = trendDir === "up";
  const isDown = trendDir === "down";
  return (
    <motion.div variants={itemVar}
      whileHover={{ scale: 1.02, borderColor: "rgba(0,240,255,0.3)" }}
      className="tactical-panel rounded-xl p-5 flex flex-col gap-1 cursor-default border border-[#2d3440] transition-all">
      <p className="text-[10px] font-mono text-[#8c9baf] uppercase tracking-widest">{label}</p>
      <div className="flex items-end gap-2 mt-1">
        <span className="text-3xl font-black font-display text-white leading-none">
          <AnimCounter to={typeof value === "number" ? value : parseFloat(value as string)} />
        </span>
        {unit && <span className="text-base text-[#8c9baf] font-mono mb-0.5">{unit}</span>}
      </div>
      {trend !== 0 && (
        <div className={`flex items-center gap-1 text-[10px] font-mono mt-1 ${isUp ? "text-[#10b981]" : isDown ? "text-[#ef4444]" : "text-[#8c9baf]"}`}>
          <TrendingUp className={`w-3 h-3 ${isDown ? "rotate-180" : ""}`} />
          {isUp ? "+" : ""}{trend} since last cycle
        </div>
      )}
    </motion.div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function LiveCanvas() {
  const [systemStatus] = useState({ security: "OK", safety: "CLEAR" });
  const [fps, setFps] = useState(28);

  useEffect(() => {
    const id = setInterval(() => setFps(24 + Math.floor(Math.random() * 8)), 2000);
    return () => clearInterval(id);
  }, []);

  return (
    <motion.div variants={containerVar} initial="hidden" animate="visible"
      className="flex flex-col h-full gap-6">

      {/* ── Header ────────────────────────────────────────────────────────── */}
      <motion.header variants={itemVar} className="flex items-center justify-between flex-shrink-0">
        <div>
          <h1 className="text-[22px] font-black font-display tracking-[0.15em] text-white">
            LIVE CANVAS
          </h1>
          <p className="text-[10px] font-mono text-[#8c9baf] uppercase tracking-[0.25em] mt-0.5">
            Global Telemetry Stream · YOLOv8n · {fps} FPS
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Status badges */}
          <motion.div animate={{ opacity: [1, 0.6, 1] }} transition={{ repeat: Infinity, duration: 2 }}
            className={`flex items-center gap-2 px-3 py-1.5 rounded border text-[10px] font-mono
              ${systemStatus.security === "OK"
                ? "bg-[#10b981]/10 border-[#10b981]/25 text-[#10b981]"
                : "bg-[#FF003C]/10 border-[#FF003C]/25 text-[#FF003C]"
              }`}>
            <div className={`w-1.5 h-1.5 rounded-full ${systemStatus.security === "OK" ? "bg-[#10b981]" : "bg-[#FF003C]"} animate-pulse`} />
            SECURITY · {systemStatus.security}
          </motion.div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded border bg-[#10b981]/10 border-[#10b981]/25 text-[10px] font-mono text-[#10b981]">
            <div className="w-1.5 h-1.5 rounded-full bg-[#10b981]" />
            SAFETY · {systemStatus.safety}
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded border bg-[#00F0FF]/5 border-[#00F0FF]/15 text-[10px] font-mono text-[#00F0FF]">
            <Activity className="w-3 h-3" />
            SYS · V2.6.1
          </div>
        </div>
      </motion.header>

      {/* ── KPI Row ───────────────────────────────────────────────────────── */}
      <motion.div variants={containerVar} className="grid grid-cols-4 gap-4 flex-shrink-0">
        {kpiData.map((k, i) => <KpiCard key={k.label} {...k} i={i} />)}
      </motion.div>

      {/* ── Main Body ─────────────────────────────────────────────────────── */}
      <div className="flex gap-4 flex-1 min-h-0">

        {/* Zone Canvas */}
        <motion.div variants={itemVar}
          className="flex-1 tactical-panel rounded-xl overflow-hidden flex flex-col border border-[#2d3440]">
          <div className="flex items-center justify-between px-4 py-3 border-b border-[#2d3440]">
            <div className="flex items-center gap-2">
              <Eye className="w-3.5 h-3.5 text-[#00F0FF]" />
              <span className="text-[10px] font-mono text-[#8c9baf] uppercase tracking-widest">Zone Telemetry</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-[#00F0FF] animate-pulse" />
              <span className="text-[9px] font-mono text-[#00F0FF]">LIVE</span>
            </div>
          </div>
          <div className="flex-1 p-2">
            <ZoneCanvas />
          </div>
          {/* Legend */}
          <div className="flex items-center gap-4 px-4 py-2 border-t border-[#2d3440]">
            <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-[#00F0FF]" /><span className="text-[9px] font-mono text-[#8c9baf]">Normal</span></div>
            <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-[#F59E0B]" /><span className="text-[9px] font-mono text-[#8c9baf]">Suspicious</span></div>
            <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-[#FF003C]" /><span className="text-[9px] font-mono text-[#8c9baf]">Threat</span></div>
          </div>
        </motion.div>

        {/* Right column */}
        <div className="w-72 flex flex-col gap-4">

          {/* Occupancy Chart */}
          <motion.div variants={itemVar}
            className="tactical-panel rounded-xl border border-[#2d3440] p-4 flex flex-col gap-2 flex-shrink-0" style={{ height: 180 }}>
            <p className="text-[10px] font-mono text-[#8c9baf] uppercase tracking-widest">Zone Occupancy / Min</p>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={zoneOccupancyHistory} margin={{ top: 4, right: 0, left: -28, bottom: 0 }}>
                <defs>
                  {[["shelf","#00F0FF"],["billing","#10b981"],["exit","#ef4444"]].map(([key,col]) => (
                    <linearGradient key={key} id={`g-${key}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={col} stopOpacity={0.3} />
                      <stop offset="95%" stopColor={col} stopOpacity={0.02} />
                    </linearGradient>
                  ))}
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="t" tick={{ fontSize: 8, fill: "#8c9baf", fontFamily: "IBM Plex Mono" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 8, fill: "#8c9baf", fontFamily: "IBM Plex Mono" }} axisLine={false} tickLine={false} />
                <Tooltip content={<GlowTooltip />} />
                <Area type="monotone" dataKey="shelf" stroke="#00F0FF" strokeWidth={1.5} fill="url(#g-shelf)" name="Shelf" />
                <Area type="monotone" dataKey="billing" stroke="#10b981" strokeWidth={1.5} fill="url(#g-billing)" name="Billing" />
                <Area type="monotone" dataKey="exit" stroke="#ef4444" strokeWidth={1.5} fill="url(#g-exit)" name="Exit" />
              </AreaChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Conf Sparkline */}
          <motion.div variants={itemVar}
            className="tactical-panel rounded-xl border border-[#2d3440] p-4 flex flex-col gap-2 flex-shrink-0" style={{ height: 140 }}>
            <p className="text-[10px] font-mono text-[#8c9baf] uppercase tracking-widest">Detection Confidence %</p>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={detectionConfHistory} margin={{ top: 4, right: 0, left: -28, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="t" tick={{ fontSize: 8, fill: "#8c9baf", fontFamily: "IBM Plex Mono" }} axisLine={false} tickLine={false} />
                <YAxis domain={[70, 100]} tick={{ fontSize: 8, fill: "#8c9baf", fontFamily: "IBM Plex Mono" }} axisLine={false} tickLine={false} />
                <Tooltip content={<GlowTooltip />} />
                <Line type="monotone" dataKey="conf" stroke="#a78bfa" strokeWidth={2} dot={false} name="Conf%" />
              </LineChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Alert ticker */}
          <motion.div variants={itemVar}
            className="tactical-panel rounded-xl border border-[#2d3440] flex flex-col flex-1 min-h-0 overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-[#2d3440] flex-shrink-0">
              <ShieldAlert className="w-3.5 h-3.5 text-[#F59E0B]" />
              <span className="text-[10px] font-mono text-[#8c9baf] uppercase tracking-widest">Alert Ticker</span>
              <div className="ml-auto flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-[#F59E0B] animate-pulse" />
                <span className="text-[9px] font-mono text-[#F59E0B]">LIVE</span>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-3">
              <AlertTicker />
            </div>
          </motion.div>

        </div>
      </div>
    </motion.div>
  );
}
