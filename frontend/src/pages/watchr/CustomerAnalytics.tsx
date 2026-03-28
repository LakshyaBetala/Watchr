import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine,
  AreaChart, Area
} from "recharts";
import { Users, Clock, Activity, LogOut, Verified } from "lucide-react";
import { BaseCard, KpiCard } from "./components/DashboardUI";

// ─── Types ───────────────────────────────────────────────────────────────────
interface TrackingLog {
  customer_id: string;
  first_seen: string;
  last_seen: string;
  status: "ACTIVE" | "EXITED";
  dwell_time: number; // in seconds
}

interface AnalyticsResponse {
  total_unique_visitors: number;
  current_active_count: number;
  tracking_logs: TrackingLog[];
}

// ─── Mocks (Offline Fallbacks) ───────────────────────────────────────────────
const MOCK_DATA: AnalyticsResponse = {
  total_unique_visitors: 142,
  current_active_count: 6,
  tracking_logs: [
    { customer_id: "89-X", first_seen: new Date(Date.now() - 1000 * 60 * 12).toISOString(), last_seen: new Date().toISOString(), status: "ACTIVE", dwell_time: 720 },
    { customer_id: "88-Y", first_seen: new Date(Date.now() - 1000 * 60 * 25).toISOString(), last_seen: new Date().toISOString(), status: "ACTIVE", dwell_time: 1500 },
    { customer_id: "87-Z", first_seen: new Date(Date.now() - 1000 * 60 * 45).toISOString(), last_seen: new Date(Date.now() - 1000 * 60 * 5).toISOString(), status: "EXITED", dwell_time: 2400 },
    { customer_id: "86-W", first_seen: new Date(Date.now() - 1000 * 60 * 120).toISOString(), last_seen: new Date(Date.now() - 1000 * 60 * 80).toISOString(), status: "EXITED", dwell_time: 2400 },
  ],
};

// ─── Custom Tooltip ────────────────────────────────────────────────────────
const ChartTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="chart-tooltip">
      <span style={{ color: "var(--text-muted)" }}>{label}</span>
      <span className="value" style={{ color: "var(--accent)" }}>
        {payload[0].value} {payload[0].name === "Dwell Time" ? "min" : ""}
      </span>
    </div>
  );
};

// ─── Main Component ──────────────────────────────────────────────────────────
export default function CustomerAnalytics() {
  const [data, setData] = useState<AnalyticsResponse | null>(null);
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    let mounted = true;
    const pollAnalytics = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/customers", { signal: AbortSignal.timeout(2000) });
        if (res.ok && mounted) {
          const json = await res.json();
          setData(json);
          setIsOffline(false);
        } else {
          throw new Error("Bad response");
        }
      } catch (e) {
        if (mounted) setIsOffline(true);
      }
    };
    pollAnalytics();
    const interval = setInterval(pollAnalytics, 10000);
    return () => { mounted = false; clearInterval(interval); };
  }, []);

  const activeData = (isOffline && !data) ? MOCK_DATA : (data || MOCK_DATA);
  const { total_unique_visitors, current_active_count, tracking_logs } = activeData;

  // ─── Data Derivations ──────────────────────────────────────────────────────
  const avgDwellSeconds = useMemo(() => {
    if (tracking_logs.length === 0) return 0;
    const total = tracking_logs.reduce((sum, log) => sum + log.dwell_time, 0);
    return Math.round(total / tracking_logs.length);
  }, [tracking_logs]);

  const avgDwellMinutes = Math.round(avgDwellSeconds / 60);

  const barChartData = useMemo(() => {
    return tracking_logs.slice(0, 20).map(log => ({
      name: `C-${log.customer_id}`,
      dwellMin: Number((log.dwell_time / 60).toFixed(1))
    }));
  }, [tracking_logs]);

  const sessionTimelineData = useMemo(() => {
    const counts = Array.from({ length: 24 }).map((_, i) => ({
      hour: `${i.toString().padStart(2, '0')}:00`,
      visitors: 0
    }));
    
    tracking_logs.forEach(log => {
      const h = new Date(log.first_seen).getHours();
      if (!isNaN(h)) counts[h].visitors++;
    });

    const currentHour = new Date().getHours();
    const startIdx = 6;
    const endIdx = Math.max(currentHour + 1, startIdx + 6);
    return counts.slice(startIdx, endIdx);
  }, [tracking_logs]);

  const peakStatus = current_active_count > 5 ? "Active" : "Quiet";

  // Mock Mix values
  const staffCount = 4;
  const mixTotal = activeData.current_active_count + staffCount;
  const staffPercent = mixTotal > 0 ? (staffCount / mixTotal) * 100 : 0;
  const custPercent = mixTotal > 0 ? (activeData.current_active_count / mixTotal) * 100 : 0;

  return (
    <div className="dashboard-grid min-h-screen">
      
      {/* ── HEADER ───────────────────────────────────────────────────────────── */}
      <div className="col-12 flex justify-between items-end mb-2">
        <div>
          <h1 className="text-3xl font-black text-[var(--text-primary)] font-jakarta tracking-tight">Customer Analytics</h1>
          <p className="text-[var(--text-muted)] mt-1 font-semibold text-sm">Real-time footfall dynamics and spatial dwell-time analysis</p>
        </div>
        {isOffline && (
          <div className="text-xs px-3 py-1.5 rounded-lg border border-[var(--accent)] font-bold bg-[color-mix(in_srgb,var(--accent)_20%,transparent)] text-[var(--accent)] font-jetbrains">
            OFFLINE MOCK DATA
          </div>
        )}
      </div>

      {/* ── KPI CARDS ────────────────────────────────────────────────────────── */}
      <KpiCard
        className="col-3"
        delay={0.1}
        title="Visitors Today"
        value={total_unique_visitors}
        icon={Users}
        trendUp={true}
        trendValue="High Volume"
      />
      <KpiCard
        className="col-3"
        delay={0.15}
        title="Currently Inside"
        value={current_active_count}
        trendValue="Live tracks"
        icon={Activity}
        accent={true}
      />
      <KpiCard
        className="col-3"
        delay={0.2}
        title="Avg Dwell Time"
        value={`${avgDwellMinutes}m`}
        trendValue="Customer engagement"
        trendUp={avgDwellMinutes > 15}
        icon={Clock}
      />
      <KpiCard
        className="col-3"
        delay={0.25}
        title="Peak Status"
        value={peakStatus}
        trendValue={peakStatus === "Active" ? "High Density" : "Nominal"}
        trendUp={peakStatus === "Active"}
        icon={peakStatus === "Active" ? Activity : LogOut}
      />

      {/* ── ROW: LOGS & DWELL TIME ───────────────────────────────────────────── */}
      <BaseCard className="col-4 flex flex-col p-0 min-h-[450px]">
        <div className="card-header px-6 pt-5 pb-3 border-b border-[var(--border)] m-0 flex-shrink-0">
          <span className="card-title text-[var(--text-primary)]">Live Visitors</span>
        </div>
        
        <div className="flex-1 p-4 overflow-y-auto">
          {tracking_logs.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center p-8 text-center" style={{ color: "var(--text-muted)" }}>
              <LogOut size={32} className="mb-3 opacity-50" />
              <p className="text-sm font-semibold">No active tracking sessions</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              <AnimatePresence>
                {tracking_logs.slice(0, 10).map((log, i) => {
                  const isActive = log.status === "ACTIVE";
                  const dwellMin = Math.round(log.dwell_time / 60);
                  
                  return (
                    <motion.div
                      key={log.customer_id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ delay: i * 0.05 }}
                      className="p-3 rounded-xl flex items-center gap-4 bg-[var(--bg-base)] border border-[var(--border)]"
                    >
                      <div className={`w-10 h-10 rounded-full flex flex-col items-center justify-center text-[0.6rem] font-bold font-jetbrains border ${isActive ? 'bg-[color-mix(in_srgb,var(--accent)_10%,transparent)] text-[var(--accent)] border-[var(--accent)]' : 'bg-[color-mix(in_srgb,var(--text-muted)_10%,transparent)] text-[var(--text-muted)] border-[var(--border)]'}`}>
                        C-{log.customer_id.substring(0, 2)}
                      </div>
                      
                      <div className="flex flex-col flex-1">
                        <span className="text-[0.55rem] font-jetbrains font-black text-[var(--accent)] opacity-40 uppercase tracking-widest mb-1">
                          [CID:TRAK-{log.customer_id}]
                        </span>
                        <span className="font-bold text-sm text-[var(--text-primary)]">
                          Customer Tracking Session
                        </span>
                        <span className="text-[0.65rem] text-[var(--text-muted)] font-medium">
                          Duration: {dwellMin} min
                        </span>
                      </div>

                      <div className={`px-2.5 py-1 rounded-full text-[0.6rem] font-bold uppercase tracking-wider border ${isActive ? 'text-black bg-[var(--accent)] border-transparent' : 'text-[var(--text-subtle)] bg-[var(--bg-card)] border-[var(--border)]'}`}>
                        {isActive ? "Inside" : "Exited"}
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )}
        </div>
      </BaseCard>

      <BaseCard className="col-8 flex flex-col">
        <div className="flex items-center justify-between mb-4 flex-shrink-0">
          <div className="flex flex-col">
            <span className="card-title text-[var(--text-primary)]">Dwell Time Distribution</span>
            <span className="text-[0.7rem] text-[var(--text-muted)] mt-1">Cross-sectional analysis of customer retention.</span>
          </div>
          <span className="text-[0.65rem] px-2 py-1 rounded bg-[color-mix(in_srgb,var(--accent)_20%,transparent)] text-[var(--accent)] font-jetbrains font-bold">AVG: {avgDwellMinutes}m</span>
        </div>
        
        <div className="relative w-full p-2 overflow-hidden" style={{ height: 240 }}>
          {/* Subtle vertical guide lines */}
          <div className="absolute inset-x-0 top-0 bottom-4 pointer-events-none opacity-[0.03] z-0" 
               style={{ background: 'repeating-linear-gradient(90deg, var(--text-muted), var(--text-muted) 1px, transparent 1px, transparent 60px)' }} />
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={barChartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
              <defs>
                <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--accent)" stopOpacity={1} />
                  <stop offset="100%" stopColor="var(--accent)" stopOpacity={0.25} />
                </linearGradient>
              </defs>
              <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false}
                tick={{ fill: 'var(--text-muted)', fontSize: 11, fontFamily: "'JetBrains Mono'" }}
                dy={10}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false}
                tick={{ fill: 'var(--text-muted)', fontSize: 10, fontFamily: "'JetBrains Mono'" }}
              />
              <Tooltip cursor={{ fill: "rgba(255,255,255,0.03)" }} content={<ChartTooltip />} />
              <ReferenceLine 
                y={avgDwellMinutes} 
                stroke="var(--text-muted)" 
                strokeDasharray="3 3"
                strokeOpacity={0.4}
                label={{ position: 'insideTopRight', value: 'AVG DWELL', fill: "var(--text-muted)", fontSize: 9, fontFamily: "'JetBrains Mono'", opacity: 0.5 }} 
              />
              <Bar 
                dataKey="dwellMin" 
                name="Dwell Time"
                fill="url(#barGradient)" 
                radius={[4, 4, 0, 0]} 
                animationDuration={1200}
                barSize={36}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

      </BaseCard>

      {/* ── ROW 3 ────────────────────────────────────────────────────────────── */}
      <BaseCard className="col-4 flex flex-col justify-center items-center py-8">
        <span className="card-title text-[var(--text-primary)] w-full text-left mb-6">Staff vs Customer Mix</span>
        
        <div className="relative w-48 h-48 flex items-center justify-center">
          {/* SVG Donut Gauge */}
          <svg className="w-full h-full transform -rotate-90">
            {/* Background track */}
            <circle 
              cx="96" cy="96" r="80" 
              stroke="var(--bg-base)" 
              strokeWidth="16" 
              fill="none" 
            />
            
            {/* Staff Segment */}
            <circle 
              cx="96" cy="96" r="80" 
              stroke="var(--positive)" 
              strokeWidth="16" 
              fill="none" 
              strokeDasharray={`${staffPercent * 5.02} 502`} // 2 * pi * 80 ~= 502
              strokeLinecap="round"
              className="drop-shadow-[0_0_8px_var(--positive)]"
            />
            
            {/* Customer Segment */}
            <circle 
              cx="96" cy="96" r="80" 
              stroke="var(--accent)" 
              strokeWidth="16" 
              fill="none" 
              strokeDasharray={`${custPercent * 5.02} 502`} 
              strokeDashoffset={`-${staffPercent * 5.02}`} 
              strokeLinecap="round"
              className="drop-shadow-[0_0_8px_var(--accent)]"
            />
          </svg>
          
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-1">
            <span className="text-3xl font-black font-jetbrains text-[var(--text-primary)]">{mixTotal}</span>
            <span className="text-xs text-[var(--text-muted)] uppercase tracking-widest font-bold">Total Ppl</span>
          </div>
        </div>

        <div className="flex gap-6 mt-6 w-full justify-center">
          <div className="flex flex-col items-center gap-1">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[var(--positive)]" />
              <span className="text-xs text-[var(--text-muted)] font-bold uppercase">Staff</span>
            </div>
            <span className="text-lg font-jetbrains font-bold text-[var(--text-primary)]">{staffCount}</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[var(--accent)]" />
              <span className="text-xs text-[var(--text-muted)] font-bold uppercase">Customers</span>
            </div>
            <span className="text-lg font-jetbrains font-bold text-[var(--text-primary)]">{current_active_count}</span>
          </div>
        </div>
      </BaseCard>

      <BaseCard className="col-8 flex flex-col">
        <div className="flex items-center justify-between mb-4 flex-shrink-0">
          <div className="flex flex-col">
            <span className="card-title text-[var(--text-primary)]">Session Timeline</span>
            <span className="text-[0.7rem] text-[var(--text-muted)] mt-1">Hourly unique visitor aggregation</span>
          </div>
        </div>
        
        <div className="w-full relative p-2 overflow-hidden" style={{ height: 240 }}>
          {/* Scanline Backdrop */}
          <div className="absolute inset-0 pointer-events-none opacity-[0.02] z-0" 
               style={{ background: 'repeating-linear-gradient(0deg, var(--text-muted), var(--text-muted) 1px, transparent 1px, transparent 4px)' }} />
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={sessionTimelineData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
              <defs>
                <linearGradient id="colorVisAccent" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--accent)" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="var(--accent)" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis 
                dataKey="hour" 
                axisLine={false} 
                tickLine={false} 
                dy={10}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                allowDecimals={false}
              />
              <Tooltip content={<ChartTooltip />} cursor={{ stroke: "rgba(255,255,255,0.05)" }} />
              <Area 
                type="monotone" 
                dataKey="visitors" 
                name="Visitors"
                stroke="var(--accent)" 
                strokeWidth={3}
                fill="url(#colorVisAccent)" 
                activeDot={{ r: 6, fill: "var(--bg-card)", strokeWidth: 2, stroke: "var(--accent)" }}
                animationDuration={2000}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </BaseCard>

    </div>
  );
}
