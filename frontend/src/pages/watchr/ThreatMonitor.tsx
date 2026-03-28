import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BarChart, Bar, LineChart, Line,
  XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, Cell, ReferenceLine,
} from "recharts";
import {
  ShieldAlert, Clock, CheckCircle2, XCircle,
  AlertTriangle, User, Crosshair, Activity,
} from "lucide-react";
import {
  threatEvents, stateTransitionData,
  suspicionScores,
} from "@/data/watchrMockData";

const containerVar = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.07, delayChildren: 0.05 } },
};
const itemVar = {
  hidden: { opacity: 0, y: 14 },
  visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 320, damping: 28 } },
};

const STATE_STYLES: Record<string, { color: string; bg: string; label: string; icon: JSX.Element }> = {
  THEFT_CONFIRMED:  { color: "#FF003C", bg: "bg-[#FF003C]/10", label: "THEFT CONFIRMED",  icon: <XCircle className="w-3.5 h-3.5" /> },
  SHELF_ENGAGED:    { color: "#F59E0B", bg: "bg-[#F59E0B]/10", label: "SHELF ENGAGED",    icon: <AlertTriangle className="w-3.5 h-3.5" /> },
  BILLING_CLEARED:  { color: "#10b981", bg: "bg-[#10b981]/10", label: "BILLING CLEARED",  icon: <CheckCircle2 className="w-3.5 h-3.5" /> },
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

// State machine node diagram (mini pipeline viz)
function StateMachineViz() {
  const states = [
    { id: "INIT",    label: "INIT",   color: "#8c9baf" },
    { id: "SHELF",   label: "SHELF",  color: "#F59E0B" },
    { id: "BILLING", label: "CLEAR",  color: "#10b981" },
    { id: "EXIT",    label: "EXIT",   color: "#FF003C" },
  ];

  return (
    <div className="relative flex items-center justify-between px-6">
      {states.map((s, i) => (
        <div key={s.id} className="flex items-center gap-0">
          <motion.div
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: i * 0.12, type: "spring" }}
            className="flex flex-col items-center gap-2">
            <div className="w-10 h-10 rounded-full border-2 flex items-center justify-center"
              style={{ borderColor: s.color, background: `${s.color}15` }}>
              <span className="text-[9px] font-mono font-bold" style={{ color: s.color }}>
                {s.id.slice(0, 3)}
              </span>
            </div>
            <span className="text-[8px] font-mono text-[#8c9baf] tracking-wider">{s.label}</span>
          </motion.div>
          {i < states.length - 1 && (
            <div className="flex-1 flex items-center mb-5 mx-1">
              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: i * 0.12 + 0.1, duration: 0.3 }}
                className="h-px flex-1" style={{ background: `linear-gradient(90deg, ${states[i].color}, ${states[i+1].color})`, originX: 0 }} />
              <motion.div
                animate={{ opacity: [1, 0.3, 1] }}
                transition={{ repeat: Infinity, duration: 1.5, delay: i * 0.3 }}
                className="w-1 h-1 rounded-full" style={{ background: states[i+1].color }} />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export default function ThreatMonitor() {
  const [selectedId, setSelectedId] = useState<number | null>(null);

  return (
    <motion.div variants={containerVar} initial="hidden" animate="visible"
      className="flex flex-col h-full gap-6">

      {/* Header */}
      <motion.header variants={itemVar} className="flex items-center justify-between flex-shrink-0">
        <div>
          <h1 className="text-[22px] font-black font-display tracking-[0.15em] text-white">
            THREAT MONITOR
          </h1>
          <p className="text-[10px] font-mono text-[#8c9baf] uppercase tracking-[0.25em] mt-0.5">
            Theft State Machine Analytics · Centroid Tracker
          </p>
        </div>
        <div className="flex items-center gap-3">
          <motion.div animate={{ opacity: [1, 0.4, 1] }} transition={{ repeat: Infinity, duration: 1.5 }}
            className="flex items-center gap-2 px-3 py-1.5 rounded border bg-[#FF003C]/10 border-[#FF003C]/30 text-[10px] font-mono text-[#FF003C]">
            <ShieldAlert className="w-3 h-3" />
            3 THEFT EVENTS
          </motion.div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded border bg-[#F59E0B]/10 border-[#F59E0B]/25 text-[10px] font-mono text-[#F59E0B]">
            <Crosshair className="w-3 h-3" />
            DWELL_THRESH: 3s
          </div>
        </div>
      </motion.header>

      {/* State machine pipeline */}
      <motion.div variants={itemVar}
        className="tactical-panel rounded-xl border border-[#2d3440] px-6 py-5 flex-shrink-0">
        <p className="text-[10px] font-mono text-[#8c9baf] uppercase tracking-widest mb-4">
          State Machine Pipeline
        </p>
        <StateMachineViz />
      </motion.div>

      {/* Main body */}
      <div className="flex gap-4 flex-1 min-h-0">

        {/* Left: event timeline */}
        <motion.div variants={itemVar}
          className="w-72 tactical-panel rounded-xl border border-[#2d3440] flex flex-col overflow-hidden flex-shrink-0">
          <div className="flex items-center gap-2 px-4 py-3 border-b border-[#2d3440]">
            <Clock className="w-3.5 h-3.5 text-[#8c9baf]" />
            <span className="text-[10px] font-mono text-[#8c9baf] uppercase tracking-widest">Event Log</span>
          </div>
          <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-2">
            <AnimatePresence>
              {threatEvents.map((e, i) => {
                const s = STATE_STYLES[e.state];
                return (
                  <motion.button key={`${e.time}-${e.id}`}
                    variants={itemVar}
                    whileHover={{ x: 3 }}
                    onClick={() => setSelectedId(selectedId === e.id ? null : e.id)}
                    className={`w-full text-left flex items-start gap-2.5 p-2.5 rounded border transition-all
                      ${selectedId === e.id ? `border-[${s.color}]/50 bg-[${s.color}]/10` : "border-transparent hover:border-[#2d3440]"}`}>
                    <span style={{ color: s.color }} className="mt-0.5 flex-shrink-0">{s.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[9px] font-mono text-[#8c9baf]">{e.time}</span>
                        <span className="text-[8px] font-mono px-1.5 py-0.5 rounded"
                          style={{ color: s.color, background: `${s.color}20` }}>
                          {e.zone.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-[10px] font-mono mt-0.5" style={{ color: s.color }}>
                        {s.label}
                      </p>
                      <p className="text-[9px] font-mono text-[#8c9baf] mt-0.5">
                        <User className="inline w-2.5 h-2.5 mr-0.5" />
                        ID #{e.id}
                      </p>
                    </div>
                  </motion.button>
                );
              })}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Right: charts */}
        <div className="flex-1 flex flex-col gap-4 min-h-0">

          {/* Suspicion Scores */}
          <motion.div variants={itemVar}
            className="tactical-panel rounded-xl border border-[#2d3440] p-5 flex-shrink-0" style={{ height: 200 }}>
            <p className="text-[10px] font-mono text-[#8c9baf] uppercase tracking-widest mb-3">
              Suspicion Risk Score (per Tracker ID)
            </p>
            <ResponsiveContainer width="100%" height="80%">
              <BarChart data={suspicionScores} margin={{ top: 0, right: 0, left: -28, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="id" tick={{ fontSize: 8, fill: "#8c9baf", fontFamily: "IBM Plex Mono" }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 8, fill: "#8c9baf", fontFamily: "IBM Plex Mono" }} axisLine={false} tickLine={false} />
                <Tooltip content={<GlowTooltip />} />
                <ReferenceLine y={70} stroke="#F59E0B" strokeDasharray="4 4" strokeWidth={1} label={{ value: "WARN", position: "right", fontSize: 8, fill: "#F59E0B", fontFamily: "IBM Plex Mono" }} />
                <ReferenceLine y={90} stroke="#FF003C" strokeDasharray="4 4" strokeWidth={1} label={{ value: "CRIT", position: "right", fontSize: 8, fill: "#FF003C", fontFamily: "IBM Plex Mono" }} />
                <Bar dataKey="score" radius={[2, 2, 0, 0]} name="Score">
                  {suspicionScores.map((entry) => (
                    <Cell key={entry.id}
                      fill={entry.score >= 90 ? "#FF003C" : entry.score >= 70 ? "#F59E0B" : "#00F0FF"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </motion.div>

          {/* State Transitions Over Time */}
          <motion.div variants={itemVar}
            className="tactical-panel rounded-xl border border-[#2d3440] p-5 flex-1 min-h-0">
            <div className="flex items-center justify-between mb-3">
              <p className="text-[10px] font-mono text-[#8c9baf] uppercase tracking-widest">
                State Transitions / Minute
              </p>
              <div className="flex items-center gap-4">
                {[["Confirmed","#FF003C"],["Engaged","#F59E0B"],["Cleared","#10b981"]].map(([l,c]) => (
                  <div key={l} className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-sm" style={{ background: c }} />
                    <span className="text-[8px] font-mono text-[#8c9baf]">{l}</span>
                  </div>
                ))}
              </div>
            </div>
            <ResponsiveContainer width="100%" height="85%">
              <LineChart data={stateTransitionData} margin={{ top: 0, right: 0, left: -28, bottom: 0 }}>
                <defs>
                  {[["confirmed","#FF003C"],["engaged","#F59E0B"],["cleared","#10b981"]].map(([k,c]) => (
                    <linearGradient key={k} id={`tg-${k}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={c} stopOpacity={0.2} />
                      <stop offset="95%" stopColor={c} stopOpacity={0} />
                    </linearGradient>
                  ))}
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="minute" tick={{ fontSize: 8, fill: "#8c9baf", fontFamily: "IBM Plex Mono" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 8, fill: "#8c9baf", fontFamily: "IBM Plex Mono" }} axisLine={false} tickLine={false} />
                <Tooltip content={<GlowTooltip />} />
                <Line type="monotone" dataKey="confirmed" stroke="#FF003C" strokeWidth={2} dot={{ fill: "#FF003C", r: 3, strokeWidth: 0 }} name="Confirmed" />
                <Line type="monotone" dataKey="engaged" stroke="#F59E0B" strokeWidth={2} dot={{ fill: "#F59E0B", r: 3, strokeWidth: 0 }} name="Engaged" />
                <Line type="monotone" dataKey="cleared" stroke="#10b981" strokeWidth={2} dot={{ fill: "#10b981", r: 3, strokeWidth: 0 }} name="Cleared" />
              </LineChart>
            </ResponsiveContainer>
          </motion.div>

        </div>
      </div>
    </motion.div>
  );
}
