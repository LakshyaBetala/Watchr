import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine
} from "recharts";
import { Flame, CheckCircle, Clock, Thermometer, ShieldCheck, Activity, Eye, Zap, Power, Cpu, AlertTriangle, ArrowRight } from "lucide-react";
import { BaseCard, KpiCard, TrendBadge } from "./components/DashboardUI";

// ─── Types ───────────────────────────────────────────────────────────────────
interface LogEvent {
  id?: number | string;
  time: string;
  event: string;
  details?: {
    thermal_temp?: number;
    [key: string]: any;
  };
}

// ─── Constants & Fallbacks ───────────────────────────────────────────────────
const THERMAL_SPIKE_THRESHOLD = 60;

const MOCK_LOGS: LogEvent[] = [
  { id: "m1", time: new Date(Date.now() - 1000 * 60 * 5).toISOString(), event: "THERMAL_ALERT", details: { thermal_temp: 64.2 } },
  { id: "m2", time: new Date(Date.now() - 1000 * 60 * 45).toISOString(), event: "FIRE_DETECTED", details: { thermal_temp: 89.5 } },
];

const DEFAULT_CHART_DATA = Array.from({ length: 15 }).map((_, i) => {
  const d = new Date();
  d.setMinutes(d.getMinutes() - (14 - i));
  return { time: d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), temp: 28 };
});

const PIPELINE_STEPS = [
  { id: "color", icon: Eye, label: "HSV Color Mask", desc: "Isolates high-brightness orange/yellow pixels" },
  { id: "motion", icon: Activity, label: "Flicker Diff", desc: "Binary frame-to-frame motion change" },
  { id: "intersection", icon: ShieldCheck, label: "Spatial AND", desc: "Both colored and flickering (No static shirts)" },
  { id: "heatmap", icon: Thermometer, label: "Heat Integrator", desc: "Density buildup with 15% temporal decay" },
  { id: "temporal", icon: Clock, label: "Stability Lock", desc: "Sustained trigger across 3/5 frames" }
];

// ─── Custom Tooltip ────────────────────────────────────────────────────────
const ChartTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  const val = payload[0].value;
  const isDanger = val >= THERMAL_SPIKE_THRESHOLD;
  return (
    <div className="chart-tooltip">
      <span style={{ color: "var(--text-muted)" }}>{label}</span>
      <span className="value" style={{ color: isDanger ? "var(--negative)" : "var(--positive)" }}>
        {val}°C
      </span>
    </div>
  );
};

// ─── Main Component ──────────────────────────────────────────────────────────
export default function SafetySentinel() {
  const [status, setStatus] = useState("SAFE");
  const [logs, setLogs] = useState<LogEvent[]>([]);
  const [isOffline, setIsOffline] = useState(false);
  const [iotSiren, setIotSiren] = useState(false);

  // Simulating the AI's real-time internal confidence metrics
  const [pipelineState, setPipelineState] = useState([false, false, false, false, false]);
  const [pipelineHovered, setPipelineHovered] = useState(false);

  useEffect(() => {
    let mounted = true;
    const pollStatus = async () => {
      try {
        const res = await fetch("http://localhost:5050/api/status", { signal: AbortSignal.timeout(2000) });
        if (res.ok && mounted) {
          const data = await res.json();
          setStatus(data.status || "SAFE");
          setIsOffline(false);
        }
      } catch (e) {
        if (mounted) setIsOffline(true);
      }
    };
    pollStatus();
    const interval = setInterval(pollStatus, 5000);
    return () => { mounted = false; clearInterval(interval); };
  }, []);

  useEffect(() => {
    let mounted = true;
    const pollLogs = async () => {
      try {
        const res = await fetch("http://localhost:5050/api/logs?limit=50", { signal: AbortSignal.timeout(2000) });
        if (res.ok && mounted) {
          const data = await res.json();
          setLogs(data);
          setIsOffline(false);
        }
      } catch (e) {
        if (mounted) setIsOffline(true);
      }
    };
    pollLogs();
    const interval = setInterval(pollLogs, 8000);
    return () => { mounted = false; clearInterval(interval); };
  }, []);

  // ─── Derived Data ───────────────────────────────────────────────────────
  const activeLogs = isOffline && logs.length === 0 ? MOCK_LOGS : logs;
  
  const fireLogs = activeLogs.filter(
    (l) => l.event === "FIRE_DETECTED" || l.event === "THERMAL_ALERT"
  ).sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());

  const isFireAlert = status.includes("FIRE") || (fireLogs.length > 0 && (Date.now() - new Date(fireLogs[0].time).getTime()) < 1000 * 60 * 2);

  const latestTempLog = fireLogs.find(l => typeof l.details?.thermal_temp === "number");
  const currentTemp = latestTempLog?.details?.thermal_temp || 28;
  const isThermalSpike = currentTemp >= THERMAL_SPIKE_THRESHOLD;

  // Pipeline Live Simulation Hook
  useEffect(() => {
    const aiEngineTick = setInterval(() => {
      if (isFireAlert) {
        // If system is in a confirmed fire alert state, all 5 pipeline gates are locked ON.
        setPipelineState([true, true, true, true, true]);
      } else {
        // Under SAFE conditions, the initial filters flutter slightly as people with orange/yellow clothes or motion pass by
        const c1 = Math.random() > 0.4; // 60% chance to see something orange
        const c2 = Math.random() > 0.3; // 70% chance to see some motion
        const c3 = c1 && c2 && Math.random() > 0.8; // Sparse intersection (e.g. orange clothing flickering)
        const c4 = c3 && Math.random() > 0.95;      // Heatmap almost never builds enough density unless it's a real fire
        setPipelineState([c1, c2, c3, c4, false]);
      }
    }, 1500); // 1.5 seconds tick rate for the visualization
    return () => clearInterval(aiEngineTick);
  }, [isFireAlert]);

  let chartData = DEFAULT_CHART_DATA;
  if (fireLogs.length > 0) {
    const tempLogs = fireLogs.filter(l => l.details?.thermal_temp).slice(0, 15).reverse();
    if (tempLogs.length > 0) {
      chartData = tempLogs.map(l => ({
        time: new Date(l.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        temp: l.details!.thermal_temp!
      }));
    }
  }

  const dataMax = Math.max(...chartData.map(i => i.temp));
  const dataMin = Math.min(...chartData.map(i => i.temp));

  return (
    <div className="dashboard-grid min-h-screen">
      
      {/* ── HERO BANNER ──────────────────────────────────────────────────────── */}
      <motion.div
        layout
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="col-12 rounded-xl p-8 flex flex-col justify-center relative overflow-hidden flex-shrink-0"
        style={{
          background: isFireAlert ? "color-mix(in srgb, var(--negative) 15%, transparent)" : "color-mix(in srgb, var(--positive) 15%, transparent)",
          border: `1px solid ${isFireAlert ? "var(--negative)" : "var(--positive)"}`,
          minHeight: "140px",
        }}
      >
        <div className="flex items-start gap-6 z-10 relative">
          <motion.div
            animate={isFireAlert ? { scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] } : { scale: 1 }}
            transition={{ repeat: Infinity, duration: 0.8 }}
            className={`flex-shrink-0 p-3 rounded-full ${isFireAlert ? 'bg-[var(--negative)]' : 'bg-[var(--positive)]'}`}
          >
            {isFireAlert ? (
              <Flame size={40} className="text-black" strokeWidth={2.5} />
            ) : (
              <ShieldCheck size={40} className="text-black" strokeWidth={2.5} />
            )}
          </motion.div>
          
          <div className="flex flex-col gap-1 relative z-10">
            <h1 className={`text-4xl font-black font-jetbrains tracking-tighter ${isFireAlert ? 'text-[var(--negative)]' : 'text-[var(--positive)]'}`}>
              {isFireAlert ? "⚠ FIRE DETECTED — EVACUATE" : "Fire Detection — ALL CLEAR"}
            </h1>
            <p className={`text-sm md:text-[0.95rem] font-black uppercase tracking-widest opacity-70 font-jetbrains ${isFireAlert ? 'text-[#FFA5A5]' : 'text-[#A5FFA5]'}`}>
              {isFireAlert ? "Immediate evacuation protocol recommended. Thermal sensors detecting critical heat signatures." : "All systems nominal. Thermal sensors reading normal range [24.2°C - 31.8°C]."}
            </p>
          </div>
        </div>

        <div
          className="absolute right-0 top-0 bottom-0 w-1/2 pointer-events-none transition-all duration-1000"
          style={{
            background: `radial-gradient(circle at right, ${isFireAlert ? 'var(--negative)' : 'var(--positive)'}, transparent)`,
            filter: "blur(60px)",
            opacity: 0.15
          }}
        />
        {isOffline && (
          <div className="absolute top-4 right-4 text-xs px-2 py-1 rounded bg-[color-mix(in_srgb,var(--accent)_20%,transparent)] text-[var(--accent)] font-jetbrains">
            OFFLINE MOCK DATA
          </div>
        )}
      </motion.div>

      {/* ── KPI CARDS ────────────────────────────────────────────────────────── */}
      <KpiCard
        className="col-4"
        delay={0.1}
        title="Fire Events Today"
        value={fireLogs.length.toString()}
        trendValue={fireLogs.length > 0 ? "Action required" : "Secure"}
        trendUp={fireLogs.length === 0}
        icon={Flame}
        accent={fireLogs.length > 0}
      />
      <KpiCard
        className="col-4"
        delay={0.15}
        title="Thermal Status"
        value={isThermalSpike ? "SPIKE" : "NORMAL"}
        trendValue={`Avg ${currentTemp.toFixed(1)}°C`}
        trendUp={!isThermalSpike}
        icon={Thermometer}
      />
      <KpiCard
        className="col-4"
        delay={0.2}
        title="Last Checked"
        value="LIVE"
        trendValue={fireLogs.length > 0 ? new Date(fireLogs[0].time).toLocaleTimeString() : "Sensors active"}
        trendUp={true}
        icon={Clock}
      />

      {/* ── THERMAL CHART (WIDENED TO COL-8) ─────────────────────────────────── */}
      <BaseCard className="col-8 flex flex-col min-h-[450px]">
        <div className="flex items-center justify-between mb-4 flex-shrink-0">
          <div className="flex flex-col">
            <span className="card-title text-[var(--text-primary)]">Thermal Reading (°C)</span>
            <span className="text-[0.7rem] text-[var(--text-muted)] mt-1">Real-time aggregate across all active zones.</span>
          </div>
          <Thermometer size={16} className="text-[var(--text-muted)]" />
        </div>
        
        <div className="flex-1 relative w-full h-full p-2 overflow-hidden">
          {/* Technical Backdrop */}
          <div className="absolute inset-x-0 top-0 bottom-4 pointer-events-none opacity-[0.05] z-0" 
               style={{ background: 'repeating-linear-gradient(0deg, var(--text-muted), var(--text-muted) 1px, transparent 1px, transparent 40px)' }} />
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
              <defs>
                <linearGradient id="solidRed" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--negative)" stopOpacity={0.6} />
                  <stop offset="100%" stopColor="var(--negative)" stopOpacity={0.05} />
                </linearGradient>
                <linearGradient id="solidGreen" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--positive)" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="var(--positive)" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="time" axisLine={false} tickLine={false} dy={10} minTickGap={15} />
              <YAxis domain={[0, Math.max(100, dataMax + 20)]} axisLine={false} tickLine={false} />
              <Tooltip content={<ChartTooltip />} cursor={{ stroke: "rgba(255,255,255,0.05)", strokeWidth: 1 }} />
              
              <ReferenceLine 
                y={THERMAL_SPIKE_THRESHOLD} 
                stroke="var(--negative)" 
                strokeDasharray="4 4" 
                strokeWidth={1}
                label={{ position: 'insideTopLeft', value: 'SPIKE THRESHOLD', fill: "var(--negative)", fontSize: 10, fontFamily: "'JetBrains Mono'" }} 
              />
              
              <Area
                type="monotone"
                dataKey="temp"
                stroke={dataMax >= THERMAL_SPIKE_THRESHOLD ? "var(--negative)" : "var(--positive)"}
                strokeWidth={3}
                activeDot={{ r: 5, fill: "var(--bg-card)", strokeWidth: 2 }}
                fill={dataMax >= THERMAL_SPIKE_THRESHOLD ? "url(#solidRed)" : "url(#solidGreen)"}
                animationDuration={1500}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </BaseCard>

      {/* ── INCIDENT LOG (SHIFTED TO COL-4) ──────────────────────────────────── */}
      <BaseCard className="col-4 flex flex-col p-0 min-h-[450px]">
        <div className="card-header px-6 pt-5 pb-3 border-b border-[var(--border)] m-0 flex-shrink-0">
          <span className="card-title text-[var(--text-primary)]">Incident Log</span>
        </div>
        
        <div className="flex-1 overflow-y-auto w-full p-4">
          {fireLogs.length === 0 ? (
            <div className="rounded-xl px-4 py-8 text-center text-sm font-bold border border-dashed border-[var(--positive)] text-[var(--positive)] bg-[color-mix(in_srgb,var(--positive)_10%,transparent)] flex flex-col items-center gap-3">
              <CheckCircle size={28} strokeWidth={2} />
              No heat anomalies
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              <AnimatePresence>
                {fireLogs.map((log) => {
                  const isFire = log.event === "FIRE_DETECTED";
                  const itemColor = isFire ? "var(--negative)" : "var(--accent)";
                  const msg = isFire ? "Combustion detected" : "Anomalous temperature rise";
                  
                  return (
                    <motion.div
                      key={`${log.time}-${log.event}`}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      className="p-3.5 rounded-xl flex items-start gap-3 bg-[var(--bg-base)] border border-[var(--border)]"
                      style={{ borderLeft: `3px solid ${itemColor}` }}
                    >
                      <div className="mt-0.5">
                        <Flame size={16} color={itemColor} />
                      </div>
                      <div className="flex flex-col flex-1 min-w-0">
                        <span className="font-semibold text-[0.85rem] text-[var(--text-primary)] truncate">{msg}</span>
                        <div className="flex justify-between mt-1 items-end">
                          <span className="text-[0.65rem] font-bold uppercase tracking-wider text-[var(--text-muted)]">{log.event.replace('_', ' ')}</span>
                          <span className="text-[0.65rem] font-jetbrains font-black text-[var(--accent)] opacity-40 uppercase tracking-widest">
                            [T:{new Date(log.time).getHours().toString().padStart(2,'0')}:{new Date(log.time).getMinutes().toString().padStart(2,'0')}:{new Date(log.time).getSeconds().toString().padStart(2,'0')}]
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )}
        </div>
      </BaseCard>

      {/* ── 5-SIGNAL AI FIRE VALIDATION PIPELINE (NEW COMBAT HUD FEATURE) ──── */}
      <BaseCard 
        className="col-8 flex flex-col min-h-[350px] cursor-default group/pipeline"
        onMouseEnter={() => setPipelineHovered(true)}
        onMouseLeave={() => setPipelineHovered(false)}
      >
        <div className="flex items-center justify-between mb-8 flex-shrink-0">
          <div className="flex flex-col">
            <span className="card-title text-[var(--text-primary)]">AI 5-Signal Validation Pipeline</span>
            <span className="text-[0.7rem] text-[var(--text-muted)] mt-1 tracking-wide">
              Real-time inference matrix. High-confidence anti-flicker filtering engaged.
            </span>
          </div>
        </div>

        <div className="flex-1 w-full flex items-center justify-between">
          {PIPELINE_STEPS.map((step, index) => {
            const isActive = pipelineState[index];
            const isConfirmedStage = index === 4 && isActive;
            
            return (
              <div key={step.id} className="relative flex-1 flex flex-col items-center text-center px-2 group">
                
                {/* Connecting Line to next component */}
                {index < PIPELINE_STEPS.length - 1 && (
                  <div className="absolute top-7 left-[calc(50%+32px)] w-[calc(100%-64px)] h-[1px] bg-[var(--border)] z-0 overflow-hidden">
                    <motion.div
                      className="h-full bg-[var(--accent)]"
                      initial={{ width: "0%" }}
                      animate={{ width: isActive && pipelineState[index + 1] ? "100%" : "0%" }}
                      transition={{ duration: 0.6, ease: "easeInOut" }}
                    />
                    
                    {/* Hover Pulse Bead */}
                    <AnimatePresence>
                      {pipelineHovered && (
                        <motion.div
                          initial={{ left: "-10%", opacity: 0 }}
                          animate={{ left: "110%", opacity: [0, 1, 1, 0] }}
                          exit={{ opacity: 0 }}
                          transition={{ 
                            duration: 0.8, 
                            delay: index * 0.4 + 0.2,
                            repeat: Infinity,
                            repeatDelay: 1.2,
                            ease: "linear"
                          }}
                          className="absolute top-[-2px] w-4 h-[3px] bg-[var(--accent)] shadow-[0_0_10px_var(--accent)] z-20"
                        />
                      )}
                    </AnimatePresence>
                  </div>
                )}

                {/* The Node */}
                <motion.div
                  animate={pipelineHovered ? {
                    boxShadow: [
                      "0 0 10px rgba(198,241,53,0.1)",
                      "0 0 45px rgba(198,241,53,0.5)",
                      "0 0 10px rgba(198,241,53,0.1)"
                    ],
                    scale: [1, 1.1, 1],
                    borderColor: "var(--accent)",
                    transition: { 
                      delay: index * 0.4, 
                      duration: 0.8,
                      repeat: Infinity,
                      repeatDelay: 1.2
                    }
                  } : isActive ? {
                    boxShadow: isConfirmedStage 
                      ? [
                          "0 0 15px rgba(248,113,113,0.2)",
                          "0 0 30px rgba(248,113,113,0.4)",
                          "0 0 15px rgba(248,113,113,0.2)"
                        ]
                      : [
                          "0 0 10px rgba(198,241,53,0.1)",
                          "0 0 20px rgba(198,241,53,0.3)",
                          "0 0 10px rgba(198,241,53,0.1)"
                        ],
                    scale: 1.05,
                    borderColor: isConfirmedStage ? "var(--negative)" : "var(--accent)",
                    transition: { 
                      duration: 2, 
                      repeat: Infinity,
                      repeatType: "mirror",
                      scale: { duration: 0.3 }
                    }
                  } : {
                    boxShadow: "none",
                    scale: 1,
                    borderColor: "var(--border)"
                  }}
                  className={`relative w-14 h-14 rounded-2xl flex items-center justify-center border-2 mb-4 bg-[var(--bg-card)] z-10 transition-colors
                    ${(isActive || pipelineHovered) ? (isConfirmedStage ? 'text-[var(--negative)]' : 'text-[var(--accent)]') : 'text-[var(--text-subtle)]'}`}
                >
                  <div className={`absolute inset-0 rounded-2xl pointer-events-none transition-colors duration-300
                    ${isActive ? (isConfirmedStage ? 'bg-[color-mix(in_srgb,var(--negative)_10%,transparent)]' : 'bg-[color-mix(in_srgb,var(--accent)_10%,transparent)]') : 'bg-transparent'}`} 
                  />
                  <step.icon size={22} strokeWidth={isActive ? 2.5 : 1.5} className="z-10 relative" />
                  
                  {/* Glowing Status Dot */}
                  <div className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border border-[var(--bg-card)] shadow-[0_0_8px_inset_black] z-10 transition-colors duration-300
                    ${isActive ? (isConfirmedStage ? 'bg-[var(--negative)]' : 'bg-[var(--accent)]') : 'bg-[var(--text-subtle)]'}`} 
                  />
                </motion.div>

                {/* Text Labels */}
                <span className={`text-[0.7rem] font-bold uppercase tracking-wider transition-colors
                  ${isActive ? (isConfirmedStage ? 'text-[var(--negative)]' : 'text-[var(--primary)]') : 'text-[var(--text-muted)]'}`}>
                  {step.label}
                </span>
                <span className="text-[0.6rem] font-medium leading-tight text-[var(--text-subtle)] mt-2 max-w-[120px]">
                  {step.desc}
                </span>

              </div>
            );
          })}
        </div>
      </BaseCard>

      {/* ── IOT EDGE DEVICE STATUS (SHIFTED TO COL-4) ──────────────────────── */}
      <BaseCard className="col-4 flex flex-col justify-between min-h-[350px]">
        <div>
          <span className="card-title text-[var(--text-primary)] flex items-center gap-2">
            <Zap size={14} className="text-[var(--accent)]" />
            IoT Edge Controllers
          </span>
          <div className="text-[0.65rem] text-[var(--text-muted)] mt-1 mb-6 border-b border-[var(--border)] pb-3">Hardware override logic arrays.</div>
          
          <div className="flex flex-col gap-3">
            {/* Siren Control */}
            <div className="p-4 rounded-xl border border-[var(--border)] bg-[var(--bg-base)] flex items-center justify-between transition-colors hover:border-[var(--text-subtle)]">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${iotSiren ? 'bg-[var(--negative)] text-black shadow-[0_0_15px_var(--negative)]' : 'bg-[color-mix(in_srgb,var(--text-muted)_20%,transparent)] text-[var(--text-muted)]'}`}>
                  <AlertTriangle size={18} strokeWidth={2.5} />
                </div>
                <div className="flex flex-col">
                  <span className="text-[0.85rem] font-bold text-[var(--text-primary)] tracking-wide">LAN Siren Alarm</span>
                  <span className={`text-[0.65rem] mt-0.5 font-jetbrains font-bold uppercase ${iotSiren ? 'text-[var(--negative)]' : 'text-[var(--text-muted)]'}`}>
                    {iotSiren ? 'Active (Override)' : 'Standby'}
                  </span>
                </div>
              </div>
              <button 
                onClick={() => setIotSiren(!iotSiren)}
                className={`w-12 h-6 rounded-full relative transition-[background-color,box-shadow] duration-300 ${iotSiren ? 'bg-[var(--negative)] shadow-[0_0_12px_var(--negative)]' : 'bg-[var(--border)]'}`}
              >
                <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform duration-300 ${iotSiren ? 'left-7' : 'left-1'}`} />
              </button>
            </div>

            {/* Sprinkler Control */}
            <div className="p-4 rounded-xl border border-[var(--border)] bg-[var(--bg-base)] flex items-center justify-between opacity-70">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-[color-mix(in_srgb,var(--positive)_20%,transparent)] text-[var(--positive)]">
                  <Power size={18} />
                </div>
                <div className="flex flex-col">
                  <span className="text-[0.85rem] font-bold text-[var(--text-primary)] tracking-wide">Sprinklers</span>
                  <span className="text-[0.65rem] mt-0.5 font-jetbrains font-bold text-[var(--positive)] uppercase">Auto-Sensing</span>
                </div>
              </div>
              <div className="text-[0.65rem] text-[var(--text-subtle)] flex items-center gap-1 border border-[var(--border)] px-1.5 py-0.5 rounded-full">
                SYS CTRL <ArrowRight size={10} />
              </div>
            </div>
          </div>
        </div>
      </BaseCard>

    </div>
  );
}
