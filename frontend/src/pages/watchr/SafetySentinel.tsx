import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from "recharts";
import { Flame, AlertTriangle, CheckCircle2, Thermometer, Zap, Eye } from "lucide-react";
import {
  fireSignalHistory, signalStrengths, heatmapZoneCells,
} from "@/data/watchrMockData";

const containerVar = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.05 } },
};
const itemVar = {
  hidden: { opacity: 0, y: 14 },
  visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 320, damping: 28 } },
};

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

// Thermal heatmap grid
function ThermalGrid() {
  const [cells, setCells] = useState(heatmapZoneCells);

  useEffect(() => {
    const id = setInterval(() => {
      setCells(prev => prev.map(([r, c, h]) => {
        const noise = (Math.random() - 0.5) * 0.15;
        return [r, c, Math.max(0, Math.min(1, (h as number) + noise))] as [number, number, number];
      }));
    }, 1800);
    return () => clearInterval(id);
  }, []);

  const ROWS = 5, COLS = 5;
  const CELL_W = 60, CELL_H = 44;

  function heatColor(h: number) {
    // cold = dark blue, warm = amber, hot = red
    if (h < 0.3) return `rgba(0,100,200,${h * 2 + 0.1})`;
    if (h < 0.6) return `rgba(245,158,11,${h})`;
    return `rgba(239,68,68,${h})`;
  }

  return (
    <svg viewBox={`0 0 ${COLS * CELL_W} ${ROWS * CELL_H}`} className="w-full h-full">
      <defs>
        <filter id="thermalBlur">
          <feGaussianBlur stdDeviation="3" />
        </filter>
      </defs>
      {/* Blurred heat layer */}
      <g filter="url(#thermalBlur)">
        {cells.map(([r, c, h]) => (
          <rect key={`${r}-${c}`}
            x={(c as number) * CELL_W} y={(r as number) * CELL_H}
            width={CELL_W} height={CELL_H}
            fill={heatColor(h as number)}
            style={{ transition: "fill 1.2s ease" }} />
        ))}
      </g>
      {/* Grid lines */}
      {Array.from({ length: COLS + 1 }).map((_, i) => (
        <line key={`v${i}`} x1={i * CELL_W} y1={0} x2={i * CELL_W} y2={ROWS * CELL_H}
          stroke="rgba(255,255,255,0.08)" strokeWidth="0.5" />
      ))}
      {Array.from({ length: ROWS + 1 }).map((_, i) => (
        <line key={`h${i}`} x1={0} y1={i * CELL_H} x2={COLS * CELL_W} y2={i * CELL_H}
          stroke="rgba(255,255,255,0.08)" strokeWidth="0.5" />
      ))}
      {/* Heat labels */}
      {cells.map(([r, c, h]) => (
        <text key={`t-${r}-${c}`}
          x={(c as number) * CELL_W + CELL_W / 2}
          y={(r as number) * CELL_H + CELL_H / 2 + 4}
          textAnchor="middle" fontSize="8"
          fill={(h as number) > 0.4 ? "white" : "rgba(255,255,255,0.4)"}
          fontFamily="IBM Plex Mono">
          {((h as number) * 100).toFixed(0)}%
        </text>
      ))}
    </svg>
  );
}

// Signal strength gauge
function SignalGauge({ signal, value, threshold, unit }: { signal: string; value: number; threshold: number; unit: string }) {
  const pct = Math.min(1, value / threshold);
  const active = value >= threshold;
  const color = active ? "#FF003C" : value / threshold > 0.6 ? "#F59E0B" : "#00F0FF";

  return (
    <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
      className="flex flex-col gap-2 p-4 rounded-lg border border-[#2d3440] bg-[#11141a]">
      <div className="flex items-center justify-between">
        <span className="text-[9px] font-mono text-[#8c9baf] uppercase tracking-widest">{signal}</span>
        <div className="flex items-center gap-1.5">
          {active
            ? <motion.div animate={{ opacity: [1,0.3,1] }} transition={{ repeat: Infinity, duration: 0.7 }}>
                <Flame className="w-3 h-3 text-[#FF003C]" />
              </motion.div>
            : <CheckCircle2 className="w-3 h-3 text-[#10b981]" />
          }
          <span className="text-[10px] font-mono font-bold" style={{ color }}>
            {value} {unit}
          </span>
        </div>
      </div>
      {/* Progress bar */}
      <div className="h-1.5 bg-[#2d3440] rounded-full overflow-hidden">
        <motion.div className="h-full rounded-full"
          style={{ background: color }}
          initial={{ width: 0 }}
          animate={{ width: `${pct * 100}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }} />
      </div>
      <div className="flex justify-between text-[8px] font-mono text-[#8c9baf]">
        <span>0</span>
        <span className="text-[#F59E0B]">THRESH: {threshold}</span>
        <span>{threshold * 1.5}</span>
      </div>
    </motion.div>
  );
}

// Fire status badge
function FireStatusBadge({ active }: { active: boolean }) {
  return (
    <AnimatePresence mode="wait">
      {active ? (
        <motion.div key="fire"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          className="flex items-center gap-2 px-3 py-1.5 rounded border bg-[#FF003C]/15 border-[#FF003C]/40 text-[10px] font-mono text-[#FF003C]">
          <motion.div animate={{ rotate: [0, -10, 10, -10, 0] }} transition={{ repeat: Infinity, duration: 0.6 }}>
            <Flame className="w-3.5 h-3.5" />
          </motion.div>
          FIRE DETECTED
        </motion.div>
      ) : (
        <motion.div key="clear"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          className="flex items-center gap-2 px-3 py-1.5 rounded border bg-[#10b981]/10 border-[#10b981]/25 text-[10px] font-mono text-[#10b981]">
          <CheckCircle2 className="w-3.5 h-3.5" />
          SAFETY · CLEAR
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default function SafetySentinel() {
  const [fireActive] = useState(false);
  const [heatCore] = useState(0.9);

  return (
    <motion.div variants={containerVar} initial="hidden" animate="visible"
      className="flex flex-col h-full gap-6">

      {/* Header */}
      <motion.header variants={itemVar} className="flex items-center justify-between flex-shrink-0">
        <div>
          <h1 className="text-[22px] font-black font-display tracking-[0.15em]" style={{ color: "#FF003C" }}>
            SAFETY SENTINEL
          </h1>
          <p className="text-[10px] font-mono text-[#8c9baf] uppercase tracking-[0.25em] mt-0.5">
            Triple-Signal Fire Detection · Heatmap Analysis
          </p>
        </div>
        <div className="flex items-center gap-3">
          <FireStatusBadge active={fireActive} />
          <div className="flex items-center gap-2 px-3 py-1.5 rounded border bg-[#11141a] border-[#2d3440] text-[10px] font-mono text-[#8c9baf]">
            <Thermometer className="w-3 h-3 text-[#F59E0B]" />
            HEAT CORE: {heatCore.toFixed(1)}
          </div>
        </div>
      </motion.header>

      {/* Main layout */}
      <div className="flex gap-4 flex-1 min-h-0">

        {/* Left: Thermal heatmap */}
        <motion.div variants={itemVar}
          className="flex-1 tactical-panel rounded-xl border border-[#2d3440] flex flex-col overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-[#2d3440]">
            <div className="flex items-center gap-2">
              <Eye className="w-3.5 h-3.5 text-[#F59E0B]" />
              <span className="text-[10px] font-mono text-[#8c9baf] uppercase tracking-widest">Spatial Heatmap (Dwell × Motion)</span>
            </div>
            <div className="flex items-center gap-3 text-[8px] font-mono text-[#8c9baf]">
              <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-sm bg-blue-600 opacity-60" /> Cold</div>
              <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-sm bg-amber-500" /> Warm</div>
              <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-sm bg-red-500" /> Hot</div>
            </div>
          </div>
          <div className="flex-1 p-4">
            <ThermalGrid />
          </div>
          {/* Heatmap decay note */}
          <div className="px-4 py-2 border-t border-[#2d3440] text-[9px] font-mono text-[#8c9baf]">
            Decay rate: 0.85/frame · Stable Core threshold: 5000px · HSV flame filter: H:0–35°
          </div>
        </motion.div>

        {/* Right column */}
        <div className="w-72 flex flex-col gap-4">

          {/* Triple-Signal Gauges */}
          <motion.div variants={itemVar}
            className="tactical-panel rounded-xl border border-[#2d3440] p-4 flex flex-col gap-3 flex-shrink-0">
            <p className="text-[10px] font-mono text-[#8c9baf] uppercase tracking-widest">
              Triple-Signal Validation
            </p>
            {signalStrengths.map(s => (
              <SignalGauge key={s.signal} {...s} />
            ))}
          </motion.div>

          {/* Fire signal history */}
          <motion.div variants={itemVar}
            className="tactical-panel rounded-xl border border-[#2d3440] p-4 flex-1 min-h-0 flex flex-col gap-2">
            <p className="text-[10px] font-mono text-[#8c9baf] uppercase tracking-widest mb-1">
              Signal History (10 min)
            </p>
            <div className="flex items-center gap-3 mb-2">
              {[["Color","#F59E0B"],["Motion","#00F0FF"],["Heat","#FF003C"]].map(([l,c]) => (
                <div key={l} className="flex items-center gap-1.5">
                  <div className="w-2 h-1.5 rounded-sm" style={{ background: c }} />
                  <span className="text-[8px] font-mono text-[#8c9baf]">{l}</span>
                </div>
              ))}
            </div>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={fireSignalHistory} margin={{ top: 0, right: 0, left: -28, bottom: 0 }}>
                <defs>
                  {[["color","#F59E0B"],["motion","#00F0FF"],["heat","#FF003C"]].map(([k,c]) => (
                    <linearGradient key={k} id={`fg-${k}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={c} stopOpacity={0.3} />
                      <stop offset="95%" stopColor={c} stopOpacity={0.02} />
                    </linearGradient>
                  ))}
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="t" tick={{ fontSize: 8, fill: "#8c9baf", fontFamily: "IBM Plex Mono" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 8, fill: "#8c9baf", fontFamily: "IBM Plex Mono" }} axisLine={false} tickLine={false} />
                <Tooltip content={<GlowTooltip />} />
                <Area type="monotone" dataKey="color" stroke="#F59E0B" strokeWidth={1.5} fill="url(#fg-color)" name="Color" />
                <Area type="monotone" dataKey="motion" stroke="#00F0FF" strokeWidth={1.5} fill="url(#fg-motion)" name="Motion" />
                <Area type="monotone" dataKey="heat" stroke="#FF003C" strokeWidth={1.5} fill="url(#fg-heat)" name="Heat" />
              </AreaChart>
            </ResponsiveContainer>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
