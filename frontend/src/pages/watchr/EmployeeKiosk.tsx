import { motion } from "framer-motion";
import { UserPlus, MapPin, Clock, Camera, ScanFace, BarChart2 } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { BaseCard, KpiCard } from "./components/DashboardUI";
import { useDashboardStore } from "@/store/dashboardStore";

// ─── Fallback mock (shown only when AI engine hasn't sent data yet) ────────────
const MOCK_EMPLOYEES = [
  { id: "EMP-7001", uniform_bgr: [34, 45, 180],  status: "active",    name: "Aisha Patel",    zone: "Billing",  shift: "Morning Shift", faceConf: 0.92, uniform: "#222db4" },
  { id: "EMP-7002", uniform_bgr: [180, 120, 34],  status: "active",    name: "Marcus Johnson", zone: "Shelf",    shift: "Morning Shift", faceConf: 0.87, uniform: "#b47822" },
  { id: "EMP-7003", uniform_bgr: [34, 160, 90],   status: "inactive",  name: "Sarah Chen",    zone: "—",        shift: "Evening Shift",  faceConf: 0.95, uniform: "#22a05a" },
  { id: "EMP-7004", uniform_bgr: [100, 45, 200],  status: "active",    name: "David Kim",     zone: "Entrance", shift: "Morning Shift", faceConf: 0.89, uniform: "#642dc8" },
];

const MOCK_SCANS = [
  { time: "Just now", result: "Verified", id: "EMP-7002", bgr: [180, 120, 34], match: 98.4 },
  { time: "2m ago",   result: "Verified", id: "EMP-7001", bgr: [35, 47, 182],  match: 95.1 },
  { time: "15m ago",  result: "Unknown",  id: "UNREGISTERED", bgr: [50, 50, 50], match: 12.0 },
  { time: "1h ago",   result: "Verified", id: "EMP-7004", bgr: [98, 45, 198],  match: 96.5 },
];

const bgrToRgb = (bgr: number[]) => `rgb(${bgr[2]}, ${bgr[1]}, ${bgr[0]})`;
const getInitials = (name: string) => name.split(" ").map(n => n.charAt(0).toUpperCase()).join("");

const GlowTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[var(--bg-card)] border border-[var(--border)] px-3 py-2 rounded text-xs font-mono">
      <p className="text-[var(--text-muted)] mb-1">{label}:00</p>
      {payload.map((p: any) => <p key={p.name} style={{ color: p.color }}>{p.name}: {p.value}</p>)}
    </div>
  );
};

export default function EmployeeKiosk() {
  const { employees: liveEmployees, faceLogData, shiftActivity } = useDashboardStore();

  // Use live Gemini employees if available, else show mock
  const employees = liveEmployees.length > 0 ? liveEmployees : MOCK_EMPLOYEES;
  const scans     = faceLogData.length    > 0
    ? faceLogData.slice(0, 4).map((f: any, i: number) => ({
        time:   f.ts    || "—",
        result: f.action === "Clock-In" || f.action === "Verified" ? "Verified" : "Unknown",
        id:     f.id    || "UNKNOWN",
        bgr:    [50, 50, 200],
        match:  f.conf  ? f.conf * 100 : 0,
      }))
    : MOCK_SCANS;

  const activeStaff = employees.filter((e: any) => e.status === "active" || e.status === "Shift_Started").length;
  const isLive = liveEmployees.length > 0;

  return (
    <div className="dashboard-grid min-h-screen">

      {/* ── HEADER ────────────────────────────────────────────────────────── */}
      <div className="col-12 flex justify-between items-end mb-2">
        <div>
          <h1 className="text-3xl font-black text-[var(--text-primary)] font-jakarta tracking-tight">Identity &amp; Uniform</h1>
          <p className="text-[var(--text-muted)] mt-1 font-semibold text-sm">Color-space K-Means segmentation verification</p>
        </div>
        <div className="flex items-center gap-3">
          {isLive && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded border bg-[var(--accent)]/5 border-[var(--accent)]/20 text-[10px] font-mono text-[var(--accent)]">
              <div className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] animate-pulse" /> GEMINI LIVE
            </div>
          )}
          <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold border border-[var(--accent)] text-[var(--accent)] hover:bg-[color-mix(in_srgb,var(--accent)_10%,transparent)] transition-colors">
            <UserPlus size={16} /> Register New Staff
          </button>
        </div>
      </div>

      {/* ── KPI ROW ───────────────────────────────────────────────────────── */}
      <KpiCard className="col-4" title="Total Registered" value={employees.length} icon={UserPlus} trendValue="Active profiles" trendUp={true} />
      <KpiCard className="col-4" title="On Shift" value={activeStaff} icon={Clock} trendValue="Currently deployed" trendUp={true} accent={true} />
      <KpiCard className="col-4" title="System Status" value="K-Means Active" icon={ScanFace} trendValue="Color segmentation live" trendUp={true} />

      {/* ── MAIN COLUMNS ──────────────────────────────────────────────────── */}
      <div className="col-8 grid grid-cols-2 gap-4 h-fit">
        {employees.map((emp: any, i: number) => {
          const hasUniformBgr = Array.isArray(emp.uniform_bgr);
          const rgbColor = hasUniformBgr ? bgrToRgb(emp.uniform_bgr) : (emp.uniform || "#3b82f6");
          const isOnShift = emp.status === "active" || emp.status === "Shift_Started";

          return (
            <motion.div
              key={emp.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.05 }}
              className="p-5 rounded-2xl flex flex-col gap-5 border border-[var(--border)] bg-[var(--bg-card)] hover:border-[var(--text-subtle)] transition-colors group relative overflow-hidden"
            >
              <div className="absolute inset-x-0 top-0 h-24 pointer-events-none opacity-[0.03] z-0"
                   style={{ background: 'repeating-linear-gradient(90deg, var(--text-muted), var(--text-muted) 1px, transparent 1px, transparent 40px)' }} />

              <div className="flex justify-between items-start">
                <div className="flex gap-4 items-center">
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center font-black text-lg text-white shadow-lg transition-transform group-hover:scale-105"
                    style={{ background: rgbColor, textShadow: "0px 1px 3px rgba(0,0,0,0.5)" }}
                  >
                    {getInitials(emp.name || emp.id)}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[0.55rem] font-mono font-black text-[var(--accent)] opacity-40 uppercase tracking-widest mb-0.5">
                      [STF:{emp.id.replace('EMP-', '')}-A]
                    </span>
                    <span className="font-bold text-lg text-[var(--text-primary)] leading-none">{emp.name || emp.id}</span>
                  </div>
                </div>
                <div className={`px-3 py-1 rounded-full text-[0.65rem] font-bold uppercase tracking-wider border ${
                  isOnShift ? "text-[var(--positive)] border-[var(--positive)] bg-[color-mix(in_srgb,var(--positive)_10%,transparent)]"
                            : "text-[var(--text-muted)] border-[var(--border)] bg-[var(--bg-base)]"
                }`}>
                  {isOnShift ? "On Shift" : "Off Shift"}
                </div>
              </div>

              {/* Uniform Color Swatch */}
              <div className="flex items-center justify-between p-3 rounded-xl border border-dashed border-[var(--border)] bg-[var(--bg-base)]">
                <span className="text-[0.65rem] font-bold uppercase tracking-wider text-[var(--text-muted)]">Vector Profile</span>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-[var(--text-muted)] font-mono">
                    {hasUniformBgr ? `[${emp.uniform_bgr.join(', ')}]` : rgbColor}
                  </span>
                  <div className="w-6 h-6 rounded-full border border-white/10 shadow-inner" style={{ background: rgbColor }} />
                </div>
              </div>

              {/* Zone & Shift */}
              <div className="flex justify-between pt-2 border-t border-[var(--border)]">
                <div className="flex items-center gap-2">
                  <MapPin size={14} className={isOnShift ? "text-[var(--accent)]" : "text-[var(--text-muted)]"} />
                  <span className={`text-sm font-semibold ${isOnShift ? "text-[var(--text-primary)]" : "text-[var(--text-muted)]"}`}>
                    {emp.zone || "—"}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock size={14} className={isOnShift ? "text-[var(--accent)]" : "text-[var(--text-muted)]"} />
                  <span className={`text-sm font-semibold font-mono ${isOnShift ? "text-[var(--text-primary)]" : "text-[var(--text-muted)]"}`}>
                    {emp.shift || emp.since || "—"}
                  </span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* ── RIGHT: SCANS + SHIFT CHART ────────────────────────────────────── */}
      <div className="col-4 flex flex-col gap-4">

        {/* Role Verification Feed */}
        <BaseCard className="flex flex-col p-0 flex-1">
          <div className="card-header px-6 pt-5 pb-3 border-b border-[var(--border)] m-0 flex-shrink-0">
            <span className="card-title text-[var(--text-primary)]">Role Verification Feed</span>
          </div>
          <div className="flex-1 p-5 overflow-y-auto">
            <div className="flex items-center gap-3 mb-6 p-3 rounded-xl bg-[color-mix(in_srgb,var(--bg-card)_50%,transparent)] border border-[var(--border)] border-dashed">
              <Camera className="w-8 h-8 text-[var(--text-subtle)]" strokeWidth={1.5} />
              <div className="flex flex-col text-xs">
                <span className="text-[var(--text-primary)] font-bold">Live Extractor Enabled</span>
                <span className="text-[var(--text-muted)]">Camera feed polling for staff profiles.</span>
              </div>
            </div>
            <div className="flex flex-col gap-4">
              {scans.map((scan: any, i: number) => {
                const isVerified = scan.result === "Verified";
                const bgColor = isVerified ? "var(--positive)" : "var(--negative)";
                const scanRgb = Array.isArray(scan.bgr) ? bgrToRgb(scan.bgr) : "#3b82f6";
                return (
                  <motion.div key={i} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + i * 0.1 }}
                    className="flex flex-col p-4 rounded-xl border border-[var(--border)] bg-[var(--bg-base)]">
                    <div className="flex justify-between items-center mb-3">
                      <span className={`text-xs font-bold uppercase ${isVerified ? 'text-[var(--positive)]' : 'text-[var(--negative)]'}`}>{scan.result}</span>
                      <span className="text-xs text-[var(--text-muted)] font-mono">{scan.time}</span>
                    </div>
                    <div className="flex justify-between items-end">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg shadow-inner border border-white/10" style={{ background: scanRgb }} />
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-[var(--text-primary)]">{scan.id}</span>
                          <span className="text-[0.65rem] font-mono text-[var(--text-subtle)] mt-0.5">
                            {Array.isArray(scan.bgr) ? `BGR: ${scan.bgr.join(',')}` : ""}
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className="text-[0.65rem] text-[var(--text-muted)] uppercase font-bold mb-0.5">Match</span>
                        <span className="text-sm font-mono font-bold" style={{ color: bgColor }}>{scan.match.toFixed(1)}%</span>
                      </div>
                    </div>
                    <div className="mt-4 h-1 w-full bg-[var(--border)] rounded-full overflow-hidden">
                      <motion.div className="h-full rounded-full" style={{ background: bgColor }}
                        initial={{ width: 0 }} animate={{ width: `${scan.match}%` }}
                        transition={{ delay: 0.5 + i * 0.1, duration: 1 }} />
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </BaseCard>

        {/* Shift Activity Chart */}
        {shiftActivity.length > 0 && (
          <BaseCard className="p-4 flex flex-col gap-2" style={{ minHeight: 200 }}>
            <div className="flex items-center gap-2 mb-1">
              <BarChart2 size={14} className="text-[var(--accent)]" />
              <span className="text-[10px] font-mono text-[var(--text-muted)] uppercase tracking-widest">Staff On-Shift / Hour</span>
            </div>
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={shiftActivity} margin={{ top: 4, right: 0, left: -30, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="hour" tick={{ fontSize: 7, fill: "var(--text-muted)", fontFamily: "IBM Plex Mono" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 7, fill: "var(--text-muted)", fontFamily: "IBM Plex Mono" }} axisLine={false} tickLine={false} />
                <Tooltip content={<GlowTooltip />} />
                <Bar dataKey="staff" fill="var(--accent)" fillOpacity={0.75} radius={[2, 2, 0, 0]} name="Staff" />
              </BarChart>
            </ResponsiveContainer>
          </BaseCard>
        )}
      </div>

    </div>
  );
}
