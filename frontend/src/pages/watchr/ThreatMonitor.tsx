import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer
} from "recharts";
import { ShieldAlert, Activity, Flame, Clock, AlertTriangle, LogIn, Eye, ZapOff, DoorOpen, XCircle, LogOut } from "lucide-react";
import { BaseCard, KpiCard, TrendBadge } from "./components/DashboardUI";

// ─── Types ───────────────────────────────────────────────────────────────────
interface LogEvent {
  id?: number | string;
  time: string;
  event: string;
  details?: {
    confidence?: number;
    [key: string]: any;
  };
}

// ─── Mocks (Offline Fallbacks) ───────────────────────────────────────────────
const MOCK_LOGS: LogEvent[] = [
  { id: 1, time: new Date(Date.now() - 1000 * 60 * 25).toISOString(), event: "THEFT_DETECTED", details: { confidence: 0.94 } },
  { id: 2, time: new Date(Date.now() - 1000 * 60 * 180).toISOString(), event: "UNAUTHORIZED_ACCESS", details: { confidence: 0.88 } },
];

export default function ThreatMonitor() {
  const [status, setStatus] = useState("SAFE");
  const [logs, setLogs] = useState<LogEvent[]>([]);
  const [isOffline, setIsOffline] = useState(false);
  const [sessionNum, setSessionNum] = useState(9921);
  const [sessionOpacity, setSessionOpacity] = useState(1);

  useEffect(() => {
    const cycle = setInterval(() => {
      setSessionOpacity(0);
      setTimeout(() => {
        setSessionNum(Math.floor(1000 + Math.random() * 9000));
        setSessionOpacity(1);
      }, 300);
    }, 8000);
    return () => clearInterval(cycle);
  }, []);

  useEffect(() => {
    let mounted = true;
    const pollStatus = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/status", { signal: AbortSignal.timeout(2000) });
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
        const res = await fetch("http://localhost:5000/api/logs?limit=50", { signal: AbortSignal.timeout(2000) });
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

  // ─── Data Derivation ───────────────────────────────────────────────────────
  const activeLogs = isOffline && logs.length === 0 ? MOCK_LOGS : logs;
  
  const threatLogs = activeLogs.filter(
    (l) => l.event === "THEFT_DETECTED" || l.event === "UNAUTHORIZED_ACCESS"
  ).sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());

  const lastIncident = threatLogs.find(l => l.event === "THEFT_DETECTED");
  const lastIncidentTime = lastIncident 
    ? new Date(lastIncident.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
    : "None today";

  const hourlyData = Array.from({ length: 12 }).map((_, i) => {
    const d = new Date();
    d.setHours(d.getHours() - (11 - i));
    const hrStr = `${d.getHours()}:00`;
    const count = threatLogs.filter(l => new Date(l.time).getHours() === d.getHours()).length;
    return { time: hrStr, count };
  });

  const isAlert = status === "THEFT_DETECTED";

  // ─── Custom Tooltip ────────────────────────────────────────────────────────
  const ChartTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    return (
      <div className="chart-tooltip">
        <span style={{ color: "var(--text-muted)" }}>{label}</span>
        <span className="value" style={{ color: "var(--negative)" }}>{payload[0].value} <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>events</span></span>
      </div>
    );
  };

  return (
    <div className="dashboard-grid min-h-screen">
      
      {/* ── BANNER ───────────────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="col-12 flex items-center justify-between rounded-xl flex-shrink-0"
        style={{
          background: isAlert ? "color-mix(in srgb, var(--negative) 15%, transparent)" : "color-mix(in srgb, var(--positive) 10%, transparent)",
          borderLeft: `4px solid ${isAlert ? "var(--negative)" : "var(--positive)"}`,
          padding: "20px 28px",
        }}
      >
        <div className="flex items-center gap-4 relative">
          {isAlert ? (
            <motion.div
              animate={{ opacity: [1, 0.4, 1], scale: [1, 1.2, 1] }}
              transition={{ repeat: Infinity, duration: 1.2 }}
              className="relative"
            >
              <div className="w-4 h-4 rounded-full bg-[var(--negative)] shadow-[0_0_20px_var(--negative)]" />
              <div className="absolute inset-0 w-8 h-8 -left-2 -top-2 rounded-full border border-[var(--negative)] opacity-20 animate-ping" />
            </motion.div>
          ) : (
            <div className="relative">
              <div className="w-3 h-3 rounded-full bg-[var(--positive)] shadow-[0_0_10px_var(--positive)]" />
              <div className="absolute inset-0 w-6 h-6 -left-1.5 -top-1.5 rounded-full border border-[var(--positive)] opacity-10 animate-pulse" />
            </div>
          )}
          <span className={`font-black tracking-tighter text-3xl font-jetbrains ${isAlert ? "text-[var(--negative)]" : "text-[var(--positive)]"}`}>
            {isAlert ? "THEFT ALERT ACTIVE" : "STORE SECURE"}
          </span>
        </div>
        {isOffline && (
          <span className="text-xs px-2 py-1 rounded bg-[color-mix(in_srgb,var(--accent)_20%,transparent)] text-[var(--accent)] font-jetbrains">
            OFFLINE MOCK DATA
          </span>
        )}
      </motion.div>

      {/* ── KPI CARDS ────────────────────────────────────────────────────────── */}
      <KpiCard
        className="col-4"
        delay={0.1}
        title="Risk Level"
        value={isAlert ? "HIGH" : "LOW"}
        trendValue={isAlert ? "Elevated" : "Normal"}
        trendUp={!isAlert}
        icon={ShieldAlert}
        accent={isAlert} // If alert is active, highlight this card
      />
      <KpiCard
        className="col-4"
        delay={0.15}
        title="Theft Events Today"
        value={threatLogs.length.toString()}
        trendValue="Matched behavior profiles"
        trendUp={threatLogs.length === 0}
        icon={Activity}
      />
      <KpiCard
        className="col-4"
        delay={0.2}
        title="Last Incident"
        value={lastIncidentTime}
        trendValue="Logged in AI engine"
        trendUp={!lastIncident}
        icon={Clock}
      />

      {/* ── BODY COLUMNS ─────────────────────────────────────────────────────── */}
      <BaseCard className="col-4 flex flex-col p-0 min-h-[450px]">
        <div className="card-header px-6 pt-5 pb-3 border-b border-[var(--border)] m-0 flex-shrink-0">
          <span className="card-title text-[var(--text-primary)]">Behavioral Events</span>
        </div>
        
        <div className="flex-1 overflow-y-auto w-full p-4">
          {threatLogs.length === 0 ? (
            <div className="rounded-xl px-4 py-8 text-center text-sm font-bold border border-dashed border-[var(--positive)] text-[var(--positive)] bg-[color-mix(in_srgb,var(--positive)_10%,transparent)]">
              No incidents recorded today ✓
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              <AnimatePresence>
                {threatLogs.map((log) => {
                  const isTheft = log.event === "THEFT_DETECTED";
                  const itemColor = isTheft ? "var(--negative)" : "var(--accent)";
                  const msg = isTheft ? "Suspicious checkout behavior" : "Unauthorized zone access";
                  
                  return (
                    <motion.div
                      key={`${log.time}-${log.event}`}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      className="p-4 rounded-xl flex flex-col gap-2 bg-[var(--bg-base)] border-[var(--border)] border"
                      style={{ borderLeft: `3px solid ${itemColor}` }}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex flex-col">
                          <span className="text-[0.55rem] font-jetbrains font-black text-[var(--accent)] opacity-40 uppercase tracking-widest mb-1">
                            [SID:9921-{log.id || 'A'}]
                          </span>
                          <span className="font-semibold text-[0.85rem] text-[var(--text-primary)]">{msg}</span>
                        </div>
                        <span className="text-[0.65rem] text-[var(--text-muted)] font-jetbrains">
                          {new Date(log.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                        </span>
                      </div>
                      {log.details?.confidence && (
                        <span className="text-xs font-semibold" style={{ color: itemColor }}>
                          AI Match: {(log.details.confidence * 100).toFixed(1)}%
                        </span>
                      )}
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )}
        </div>
      </BaseCard>

      <BaseCard className="col-8 flex flex-col">
        <div className="flex items-center justify-between mb-4 flex-shrink-0 relative z-10">
          <span className="card-title text-[var(--text-primary)]">Risk Over Time (12h)</span>
          <div className="flex items-center gap-3">
            <span className="text-[0.6rem] font-jetbrains text-[var(--text-muted)] uppercase tracking-widest">Scanning active</span>
            <Flame size={16} className="text-[var(--negative)] animate-pulse" />
          </div>
        </div>
        <div className="relative w-full p-2" style={{ height: 240 }}>
          {/* Technical Backdrop */}
          <div className="absolute inset-x-0 top-0 bottom-4 pointer-events-none opacity-[0.05] z-0" 
               style={{ background: 'repeating-linear-gradient(90deg, var(--text-muted), var(--text-muted) 1px, transparent 1px, transparent 40px)' }} />
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={hourlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <XAxis
                dataKey="time"
                axisLine={false}
                tickLine={false}
                dy={10}
              />
              <YAxis
                domain={[0, 4]}
                allowDecimals={false}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={<ChartTooltip />} cursor={{ stroke: "rgba(255,255,255,0.05)", strokeWidth: 1 }} />
              <Line
                type="monotone"
                dataKey="count"
                name="Events"
                stroke="var(--negative)"
                strokeWidth={3}
                dot={{ r: 4, fill: "var(--bg-card)", stroke: "var(--negative)", strokeWidth: 2 }}
                activeDot={{ r: 6, fill: "var(--negative)", stroke: "var(--bg-card)", strokeWidth: 2 }}
                animationDuration={1500}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </BaseCard>

      {/* ── BEHAVIORAL STATE PATH VISUALIZER ──────────────────────────────────── */}
      <BaseCard className="col-12 p-8 relative overflow-hidden">

        {/* CSS keyframes for inline animations */}
        <style>{`
          @keyframes borderPulse {
            0%, 100% { opacity: 0.5; box-shadow: 0 0 8px rgba(198,241,53,0.15); }
            50%       { opacity: 1;   box-shadow: 0 0 18px rgba(198,241,53,0.4); }
          }
          @keyframes redBlink {
            0%, 49% { opacity: 1; }
            50%, 100% { opacity: 0.2; }
          }
          @keyframes travelDot {
            0%   { left: 0%; opacity: 0; }
            5%   { opacity: 1; }
            95%  { opacity: 1; }
            100% { left: calc(66% - 6px); opacity: 0; }
          }
          .node-active-box {
            animation: borderPulse 2s ease-in-out infinite;
          }
          .dot-blink {
            animation: redBlink 1.4s step-start infinite;
          }
          .travel-dot {
            animation: travelDot 3s linear infinite;
          }
        `}</style>

        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <div>
            <p className="text-[0.7rem] font-bold text-[var(--text-primary)] uppercase tracking-[0.15em]">
              Behavioral State Path Visualizer
            </p>
            <p className="text-[0.6rem] text-[var(--text-muted)] font-jetbrains uppercase tracking-widest mt-0.5">
              Real-time sequence analysis
            </p>
          </div>
          <span
            className="px-3 py-1 rounded-full bg-[var(--bg-base)] border border-[var(--border)] text-[0.6rem] font-bold text-[var(--accent)] font-jetbrains uppercase tracking-wider"
            style={{ opacity: sessionOpacity, transition: 'opacity 300ms ease' }}
          >
            Active Session: #{sessionNum}
          </span>
        </div>

        {/* Nodes + connecting line */}
        <div className="relative flex items-start justify-between px-12">

          {/* Base line — full width, very dim */}
          <div className="absolute left-12 right-12 top-7 h-px z-0" style={{ background: 'rgba(255,255,255,0.12)' }}>
            {/* Green traveled segment: node 1 → node 3 (≈ 66% of the line) */}
            <div className="absolute left-0 h-full" style={{ width: '66%', background: 'rgba(198,241,53,0.4)' }} />
            {/* Traveling dot along the green segment */}
            <div
              className="travel-dot absolute top-[-1px] w-[6px] h-[3px] rounded-sm"
              style={{ background: 'var(--accent)', boxShadow: '0 0 6px var(--accent)' }}
            />
          </div>

          {([
            { id: "SEQ_01",       label: "Enters Store",   sub: "Target tracked",   icon: LogIn,   meta: "9s",       status: "active"   },
            { id: "SEQ_06",       label: "Browses Shelf",  sub: "Extended dwell",   icon: Eye,     meta: "+4m 12s",  status: "inactive" },
            { id: "VIOLATION_04", label: "Skips Billing",  sub: "Sequence breach",  icon: XCircle, meta: "+5m 58s",  status: "warning"  },
            { id: "OUT_04",       label: "Exits Location", sub: "Leaves unbilled",  icon: LogOut,  meta: "+4m 35s",  status: "inactive" },
          ] as const).map((step, i) => {
            const isActive   = step.status === "active";
            const isWarning  = step.status === "warning";
            const isInactive = step.status === "inactive";
            const Icon = step.icon;

            return (
              <motion.div
                key={step.id}
                className={`flex flex-col items-center relative z-10 w-44`}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: isInactive ? 0.5 : 1, y: 0 }}
                transition={{ duration: 0.3, delay: i * 0.12 }}
              >
                {/* Icon box */}
                <div
                  className={[
                    "w-14 h-14 rounded-lg border flex items-center justify-center mb-3",
                    isActive  ? "border-[var(--accent)]   bg-[color-mix(in_srgb,var(--accent)_8%,transparent)]   node-active-box" : "",
                    isWarning ? "border-[var(--negative)]  bg-[color-mix(in_srgb,var(--negative)_6%,transparent)]" : "",
                    isInactive ? "border-[var(--border)]   bg-transparent" : "",
                  ].join(" ")}
                  style={isWarning ? { boxShadow: '0 0 12px rgba(255,80,80,0.25)' } : undefined}
                >
                  <Icon
                    size={20}
                    className={
                      isActive  ? "text-[var(--accent)]"   :
                      isWarning ? "text-[var(--negative)]" :
                                  "text-[var(--text-subtle)]"
                    }
                  />
                </div>

                {/* Status dot */}
                {isActive && (
                  <div className="w-1.5 h-1.5 rounded-full mb-3 bg-[var(--accent)]" />
                )}
                {isWarning && (
                  <div className="dot-blink w-1.5 h-1.5 rounded-full mb-3 bg-[var(--negative)]" />
                )}
                {isInactive && <div className="h-[18px]" />}

                {/* Labels */}
                <span className="text-[0.52rem] font-jetbrains font-bold text-[var(--accent)] uppercase tracking-widest opacity-50 mb-0.5">
                  {step.id}
                </span>
                <span className="text-[0.58rem] font-jetbrains text-[var(--text-muted)] mb-2">
                  {step.meta}
                </span>
                <span className={`text-[0.9rem] font-semibold tracking-tight mb-1 text-center
                  ${isActive || isWarning ? "text-[var(--text-primary)]" : "text-[var(--text-muted)]"}
                `}>
                  {step.label}
                </span>
                <span className="text-[0.65rem] text-[var(--text-muted)] italic text-center opacity-60">
                  {step.sub}
                </span>
              </motion.div>
            );
          })}
        </div>

      </BaseCard>

    </div>
  );
}
