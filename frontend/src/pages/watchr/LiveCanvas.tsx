import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";
import { Users, Bell, HardHat, Flame, Camera, ChevronRight, Share2, Activity } from "lucide-react";
import LiveStoreMap from "./components/LiveStoreMap";
import { BaseCard, KpiCard, TrendBadge } from "./components/DashboardUI";
import { useDashboardStore } from "@/store/dashboardStore";

// ─── Types ────────────────────────────────────────────────────────────────────
interface Event {
  id: number;
  time: string;
  icon: string;
  msg: string;
  color: string;
}

// ─── Fallback synthetic events ────────────────────────────────────────────────
const SYNTHETIC_TEMPLATES = [
  { icon: "🛒", msg: "Customer entered Shelf area", color: "var(--accent)" },
  { icon: "✅", msg: "Customer paid and exited",    color: "var(--positive)" },
  { icon: "👷", msg: "Staff moved to Billing",      color: "var(--positive)" },
  { icon: "🚪", msg: "New customer arrived",        color: "var(--accent)" },
];

// ─── Custom Tooltip ────────────────────────────────────────────────────────
const ChartTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="chart-tooltip">
      <span style={{ color: "var(--text-muted)" }}>{label}</span>
      <span className="value" style={{ color: "var(--accent)" }}>{payload[0].value} <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>visitors</span></span>
    </div>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function LiveCanvas() {
  const {
    connectTelemetryStream,
    trackedObjects,
    alertFeed,
    footfallHourly,
    kpiData,
    systemStatus,
    employees,
  } = useDashboardStore();

  const [events, setEvents] = useState<Event[]>([]);
  const [nextId, setNextId] = useState(100);

  // ── Connect SSE on mount ──────────────────────────────────────────────────
  useEffect(() => {
    connectTelemetryStream();
  }, []);

  // ── Mirror alertFeed → behavioural events panel ───────────────────────────
  useEffect(() => {
    const mapped: Event[] = alertFeed.slice(0, 8).map((a: any, i: number) => {
      const icon = a.type === "theft" ? "🚨" : a.type === "fire" ? "🔥" : a.type === "smoke" ? "💨" : "⚠️";
      const color = a.sev === "critical" ? "var(--negative)" : "var(--accent)";
      return { id: i, time: a.ts || new Date().toLocaleTimeString(), icon, msg: a.msg || a.type, color };
    });
    if (mapped.length > 0) setEvents(mapped);
  }, [alertFeed]);

  // ── Synthetic feed when backend is offline ────────────────────────────────
  useEffect(() => {
    const feedId = setInterval(() => {
      if (alertFeed.length > 0) return; // real data takes over
      const t = new Date();
      const ts = `[T:${String(t.getHours()).padStart(2,'0')}:${String(t.getMinutes()).padStart(2,'0')}:${String(t.getSeconds()).padStart(2,'0')}]`;
      const pick = SYNTHETIC_TEMPLATES[Math.floor(Math.random() * SYNTHETIC_TEMPLATES.length)];
      setNextId(id => id + 1);
      setEvents(prev => [{ id: nextId, time: ts, ...pick }, ...prev].slice(0, 8));
    }, 6000);
    return () => clearInterval(feedId);
  }, [nextId, alertFeed]);

  // ── Derived metrics from store ────────────────────────────────────────────
  const peopleCount  = kpiData[0]?.value ?? trackedObjects.length;
  const alertCount   = alertFeed.length;
  const staffCount   = employees.filter((e: any) => e.status === "active").length || "—";
  const fireSafe     = systemStatus.safety === "CLEAR";

  // ── Footfall chart ────────────────────────────────────────────────────────
  const footfall = footfallHourly.length > 0 ? footfallHourly.map((f: any) => ({ hour: f.hour, visitors: f.count ?? f.visitors ?? 0 })) : [];
  const totalInflow = footfall.reduce((acc, curr) => acc + curr.visitors, 0);
  const peakData = [...footfall].sort((a, b) => b.visitors - a.visitors)[0];
  const lastHourVisitors    = footfall[footfall.length - 2]?.visitors || 0;
  const currentHourVisitors = footfall[footfall.length - 1]?.visitors || 0;
  const trendPercent = lastHourVisitors > 0
    ? Math.round(((currentHourVisitors - lastHourVisitors) / lastHourVisitors) * 100)
    : 0;

  const avgDwell = kpiData[3]?.value ?? "—";

  return (
    <div className="dashboard-grid min-h-screen">
      
      {/* ── ROW 1: KPI CARDS ──────────────────────────────────────────────── */}
      <KpiCard
        className="col-3"
        delay={0.1}
        title="People Inside"
        value={peopleCount}
        trendValue={systemStatus.security === "THREAT" ? "THREAT DETECTED" : "Live tracking"}
        trendUp={systemStatus.security !== "THREAT"}
        icon={Users}
      />
      <KpiCard
        className="col-3"
        delay={0.15}
        title="Alerts Today"
        value={alertCount}
        trendValue={alertCount === 0 ? "All clear" : "Active incidents"}
        trendUp={alertCount === 0}
        icon={Bell}
        accent={alertCount > 0}
      />
      <KpiCard
        className="col-3"
        delay={0.2}
        title="Staff Active"
        value={staffCount}
        trendValue="Optimal ratio"
        trendUp={true}
        icon={HardHat}
      />
      <KpiCard
        className="col-3"
        delay={0.25}
        title="Fire System"
        value={fireSafe ? "SAFE" : systemStatus.safety}
        trendValue={fireSafe ? "Online" : "ALERT"}
        trendUp={fireSafe}
        icon={Flame}
        accent={!fireSafe}
      />

      {/* ── ROW 2: SPATIAL MAP & RECENT EVENTS ────────────────────────────── */}
      
      {/* Spatial Map */}
      <BaseCard className="col-8 h-[500px] flex flex-col p-6 overflow-hidden">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <h3 className="card-title m-0">Live Spatial Layout</h3>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[var(--accent)] animate-pulse" />
              <span className="text-[0.65rem] font-black font-jetbrains text-[var(--accent)] uppercase tracking-widest">Active Scan</span>
            </div>
            <button className="text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors">
              <Share2 size={16} />
            </button>
          </div>
        </div>
        
        <div className="flex-1 min-h-0 bg-[#0a0a0a] rounded-xl border border-[var(--border)] relative overflow-hidden group">
          <LiveStoreMap />
          
          {/* Radar Sweep Overlay */}
          <div className="absolute inset-0 pointer-events-none opacity-20 z-0">
            <svg width="100%" height="100%" className="w-full h-full">
              <defs>
                <linearGradient id="sweepGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="var(--accent)" stopOpacity="0" />
                  <stop offset="50%" stopColor="var(--accent)" stopOpacity="0.5" />
                  <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
                </linearGradient>
              </defs>
              <rect width="200%" height="200%" fill="url(#sweepGradient)" x="-100%">
                <animateTransform attributeName="transform" type="translate" from="-100% 0" to="100% 0" dur="4s" repeatCount="indefinite" />
              </rect>
            </svg>
          </div>
          <div className="absolute inset-0 pointer-events-none opacity-5 z-0" 
               style={{ background: 'repeating-linear-gradient(0deg, transparent, transparent 1px, #fff 2px)' }} />
          <div className="absolute bottom-4 left-4 bg-[#111] border border-[var(--border)] rounded-lg p-3 flex flex-col gap-2 z-10">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[var(--accent)] shadow-[0_0_8px_var(--accent)]" /> 
              <span className="text-[0.65rem] font-bold uppercase tracking-wider">Customer</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[var(--positive)] shadow-[0_0_8px_var(--positive)]" /> 
              <span className="text-[0.65rem] font-bold uppercase tracking-wider">Staff</span>
            </div>
          </div>
        </div>
      </BaseCard>

      {/* Recent Activity */}
      <BaseCard className="col-4 flex flex-col h-[500px]">
        <div className="flex items-center justify-between mb-4">
          <span className="card-title">Live Behavioral Feed</span>
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] animate-pulse" />
            <span className="text-[0.65rem] font-jetbrains text-[var(--accent)] opacity-70 uppercase tracking-widest">Live</span>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto px-1 custom-scrollbar">
          <AnimatePresence mode="popLayout" initial={false}>
            {events.map((ev) => (
              <motion.div
                key={ev.id}
                initial={{ opacity: 0, x: -20, height: 0 }}
                animate={{ opacity: 1, x: 0, height: 'auto' }}
                exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
                transition={{ type: "spring", stiffness: 350, damping: 25 }}
                className="flex items-start gap-4 p-3 rounded-xl hover:bg-[var(--bg-base)] cursor-pointer group transition-colors"
              >
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-sm flex-shrink-0"
                  style={{ 
                    background: `color-mix(in srgb, ${ev.color || 'var(--accent)'} 10%, transparent)`, 
                    border: `1px solid color-mix(in srgb, ${ev.color || 'var(--accent)'} 20%, transparent)`, 
                  }}
                >
                  {ev.icon}
                </div>
                <div className="flex flex-col min-w-0 flex-1 justify-center py-0.5">
                  <p className="text-[0.8rem] text-[var(--text-primary)] font-medium leading-tight truncate group-hover:text-[var(--accent)] transition-colors">
                    {ev.msg}
                  </p>
                  <p className="text-[0.65rem] font-jetbrains text-[var(--text-muted)] mt-1 tracking-wide">
                    {ev.time}
                  </p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </BaseCard>

      {/* ── ROW 3: FLEET, FOOTFALL, ZONES ─────────────────────────────────── */}
      
      {/* Camera Fleet from store */}
      <BaseCard className="col-4 flex flex-col justify-between">
        <div>
          <span className="card-title">Multi-Camera Fleet</span>
          <div className="mt-6 flex flex-col gap-3">
            <div className="flex items-center justify-between p-3 rounded-lg border border-[var(--accent)] bg-[color-mix(in_srgb,var(--accent)_5%,transparent)]">
              <div className="flex items-center gap-3">
                <Camera className="w-4 h-4 text-[var(--accent)]" />
                <span className="text-sm font-semibold text-[var(--text-primary)]">Cam 01: Main Floor</span>
              </div>
              <span className="text-xs font-jetbrains text-[var(--accent)]">32 FPS</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg border border-[var(--border)] bg-[var(--bg-base)]">
              <div className="flex items-center gap-3">
                <Camera className="w-4 h-4 text-[var(--text-muted)]" />
                <span className="text-sm font-semibold text-[var(--text-muted)]">Cam 02: Warehouse</span>
              </div>
              <span className="text-xs font-jetbrains text-[var(--text-muted)]">30 FPS</span>
            </div>
          </div>
        </div>
        <div className="pt-4 border-t border-[var(--border)]">
          <div className="flex justify-between items-center">
            <span className="text-[0.65rem] font-bold text-[var(--text-muted)] uppercase tracking-widest">Network Health</span>
            <span className="text-[0.65rem] font-bold text-[var(--positive)] uppercase tracking-widest">
              {systemStatus.security === "OK" ? "Stable" : "DEGRADED"}
            </span>
          </div>
          <div className="w-full h-1 bg-[var(--bg-base)] rounded-full mt-2 overflow-hidden">
            <div className={`h-full ${systemStatus.security === "OK" ? "w-[85%] bg-[var(--positive)]" : "w-[40%] bg-[var(--negative)]"}`} />
          </div>
        </div>
      </BaseCard>

      {/* Footfall Chart — now live from Gemini/SSE */}
      <BaseCard className="col-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex flex-col gap-1">
            <span className="card-title">Footfall Dynamics</span>
            <div className="flex items-center gap-3 mt-1">
              <span className="text-[0.7rem] font-medium text-[var(--text-muted)] flex items-center gap-1.5">
                <Activity size={14} className="text-[var(--accent)]" /> Real-time Inflow Pattern
              </span>
              <TrendBadge value={`${trendPercent > 0 ? '+' : ''}${trendPercent}%`} isUp={trendPercent >= 0} />
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-right">
              <span className="block text-[0.6rem] font-black text-[var(--text-muted)] uppercase tracking-widest opacity-50">Peak Inflow</span>
              <span className="text-sm font-black text-[var(--text-primary)]">
                {peakData?.visitors ?? "—"} <span className="text-[0.6rem] font-normal uppercase opacity-70">at {peakData?.hour ?? "—"}</span>
              </span>
            </div>
            <button className="flex items-center gap-2 bg-[var(--bg-base)] border border-[var(--border)] px-4 py-2 rounded-xl text-[0.65rem] font-black uppercase tracking-[0.1em] hover:border-[var(--accent)] hover:text-[var(--accent)] transition-all">
              Detailed Intelligence <ChevronRight size={14} />
            </button>
          </div>
        </div>

        <div className="h-[260px] w-full mt-4">
          {footfall.length === 0 ? (
            <div className="h-full flex items-center justify-center text-sm text-[var(--text-muted)]">
              Waiting for AI engine data…
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={footfall} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="footfallGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--accent)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="var(--accent)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="hour" axisLine={false} tickLine={false} tick={{ fill: "var(--text-muted)", fontSize: 10, fontWeight: 700 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: "var(--text-muted)", fontSize: 10, fontWeight: 700 }} />
                <Tooltip content={<ChartTooltip />} cursor={{ stroke: 'var(--border)', strokeWidth: 1, strokeDasharray: '4 4' }} />
                {peakData && <ReferenceLine y={peakData.visitors} stroke="var(--accent)" strokeDasharray="3 3" opacity={0.3} />}
                <Area type="monotone" dataKey="visitors" stroke="var(--accent)" strokeWidth={3} fillOpacity={1} fill="url(#footfallGradient)" animationDuration={2000} activeDot={{ r: 4, fill: "var(--accent)", stroke: "var(--bg-card)", strokeWidth: 2 }} />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
        
        <div className="grid grid-cols-4 gap-4 mt-8 pt-8 border-t border-[var(--border)] border-dashed">
          <div className="flex flex-col gap-1">
            <span className="text-[0.6rem] font-black text-[var(--text-muted)] uppercase tracking-widest opacity-50">Total Inflow</span>
            <span className="text-xl font-black text-[var(--text-primary)] tabular-nums">{totalInflow || "—"}</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-[0.6rem] font-black text-[var(--text-muted)] uppercase tracking-widest opacity-50">Last Hour</span>
            <span className="text-xl font-black text-[var(--text-primary)] tabular-nums">{currentHourVisitors || "—"}</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-[0.6rem] font-black text-[var(--text-muted)] uppercase tracking-widest opacity-50">Avg Dwell Time</span>
            <span className="text-xl font-black text-[var(--text-primary)] tabular-nums">{avgDwell}</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-[0.6rem] font-black text-[var(--text-muted)] uppercase tracking-widest opacity-50">Threats</span>
            <span className="text-xl font-black text-[var(--accent)] tabular-nums">{kpiData[1]?.value ?? "0"}</span>
          </div>
        </div>
      </BaseCard>

    </div>
  );
}
