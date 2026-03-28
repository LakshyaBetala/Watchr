import { motion } from "framer-motion";
import { UserPlus, MapPin, Clock, Camera, ScanFace } from "lucide-react";
import { BaseCard, KpiCard } from "./components/DashboardUI";

// ─── Design System Constants ─────────────────────────────────────────────────
const MOCK_EMPLOYEES = [
  {
    id: "EMP-7001",
    uniform_bgr: [34, 45, 180],
    status: "Shift_Started",
    name: "Aisha Patel",
    zone: "Billing",
    since: "09:00 AM",
  },
  {
    id: "EMP-7002",
    uniform_bgr: [180, 120, 34],
    status: "Shift_Started",
    name: "Marcus Johnson",
    zone: "Shelf",
    since: "10:30 AM",
  },
  {
    id: "EMP-7003",
    uniform_bgr: [34, 160, 90],
    status: "Off_Shift",
    name: "Sarah Chen",
    zone: "—",
    since: "—",
  },
  {
    id: "EMP-7004",
    uniform_bgr: [100, 45, 200],
    status: "Shift_Started",
    name: "David Kim",
    zone: "Entrance",
    since: "08:15 AM",
  }
];

// Mock for Role Verification Feed (Recent scan attempts)
const RECENT_SCANS = [
  { time: "Just now", result: "Verified", id: "EMP-7002", bgr: [180, 120, 34], match: 98.4 },
  { time: "2m ago", result: "Verified", id: "EMP-7001", bgr: [35, 47, 182], match: 95.1 }, // Slight color variance
  { time: "15m ago", result: "Unknown", id: "UNREGISTERED", bgr: [50, 50, 50], match: 12.0 },
  { time: "1h ago", result: "Verified", id: "EMP-7004", bgr: [98, 45, 198], match: 96.5 },
];

const bgrToRgb = (bgr: number[]) => `rgb(${bgr[2]}, ${bgr[1]}, ${bgr[0]})`;

const getInitials = (name: string) => {
  return name.split(" ").map(n => n.charAt(0).toUpperCase()).join("");
};

export default function EmployeeKiosk() {
  const activeStaff = MOCK_EMPLOYEES.filter(e => e.status === "Shift_Started").length;

  return (
    <div className="dashboard-grid min-h-screen">
      
      {/* ── HEADER ROW ──────────────────────────────────────────────────────── */}
      <div className="col-12 flex justify-between items-end mb-2">
        <div>
          <h1 className="text-3xl font-black text-[var(--text-primary)] font-jakarta tracking-tight">Identity & Uniform</h1>
          <p className="text-[var(--text-muted)] mt-1 font-semibold text-sm">Color-space K-Means segmentation verification</p>
        </div>
        <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold border border-[var(--accent)] text-[var(--accent)] hover:bg-[color-mix(in_srgb,var(--accent)_10%,transparent)] transition-colors shadow-[0_0_15px_color-mix(in_srgb,var(--accent)_20%,transparent)]">
          <UserPlus size={16} />
          Register New Staff
        </button>
      </div>

      {/* ── KPI ROW ──────────────────────────────────────────────────────────── */}
      <KpiCard
        className="col-4"
        title="Total Registered"
        value={MOCK_EMPLOYEES.length}
        icon={UserPlus}
        trendValue="Active profiles"
        trendUp={true}
      />
      <KpiCard
        className="col-4"
        title="On Shift"
        value={activeStaff}
        icon={Clock}
        trendValue="Currently deployed"
        trendUp={true}
        accent={true}
      />
      <KpiCard
        className="col-4"
        title="System Status"
        value="K-Means Active"
        icon={ScanFace}
        trendValue="Color segmentation live"
        trendUp={true}
      />

      {/* ── MAIN COLUMNS ─────────────────────────────────────────────────────── */}
      <div className="col-8 grid grid-cols-2 gap-4 h-fit">
        {MOCK_EMPLOYEES.map((emp, i) => {
          const rgbColor = bgrToRgb(emp.uniform_bgr);
          const isOnShift = emp.status === "Shift_Started";

          return (
            <motion.div
              key={emp.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.05 }}
              className="p-5 rounded-2xl flex flex-col gap-5 border border-[var(--border)] bg-[var(--bg-card)] hover:border-[var(--text-subtle)] transition-colors group relative overflow-hidden"
            >
              {/* Tactical Backdrop */}
              <div className="absolute inset-x-0 top-0 h-24 pointer-events-none opacity-[0.03] z-0" 
                   style={{ background: 'repeating-linear-gradient(90deg, var(--text-muted), var(--text-muted) 1px, transparent 1px, transparent 40px)' }} />
              {/* Card Header */}
              <div className="flex justify-between items-start">
                <div className="flex gap-4 items-center">
                  <div className="relative">
                    {/* Hex Background Pattern */}
                    <div className="absolute inset-0 opacity-20 pointer-events-none scale-150" 
                         style={{ backgroundImage: 'radial-gradient(var(--text-muted) 1px, transparent 1px)', backgroundSize: '8px 8px' }} />
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center font-black text-lg text-white shadow-lg transition-transform group-hover:scale-105 relative z-10"
                      style={{ background: rgbColor, textShadow: "0px 1px 3px rgba(0,0,0,0.5)" }}
                    >
                      {getInitials(emp.name)}
                    </div>
                  </div>
                    <span className="text-[0.55rem] font-jetbrains font-black text-[var(--accent)] opacity-40 uppercase tracking-widest mb-0.5">
                      [STF:{emp.id.replace('EMP-', '')}-A]
                    </span>
                    <span className="font-bold text-lg text-[var(--text-primary)] leading-none">
                      {emp.name}
                    </span>
                </div>
                
                <div
                  className={`px-3 py-1 rounded-full text-[0.65rem] font-bold uppercase tracking-wider border ${
                    isOnShift ? "text-[var(--positive)] border-[var(--positive)] bg-[color-mix(in_srgb,var(--positive)_10%,transparent)]" : "text-[var(--text-muted)] border-[var(--border)] bg-[var(--bg-base)]"
                  }`}
                >
                  {isOnShift ? "On Shift" : "Off Shift"}
                </div>
              </div>

              {/* Uniform Color Swatch */}
              <div className="flex items-center justify-between p-3 rounded-xl border border-dashed border-[var(--border)] bg-[var(--bg-base)]">
                <span className="text-[0.65rem] font-bold uppercase tracking-wider text-[var(--text-muted)]">
                  Vector Profile
                </span>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-[var(--text-muted)] font-jetbrains">
                    [{emp.uniform_bgr.join(', ')}]
                  </span>
                  <div
                    className="w-6 h-6 rounded-full border border-[rgba(255,255,255,0.1)] shadow-inner"
                    style={{ background: rgbColor }}
                  />
                </div>
              </div>

              {/* Location & Time Info */}
              <div className="flex justify-between pt-2 border-t border-[var(--border)]">
                <div className="flex items-center gap-2">
                  <MapPin size={14} className={isOnShift ? "text-[var(--accent)]" : "text-[var(--text-muted)]"} />
                  <span className={`text-sm font-semibold ${isOnShift ? "text-[var(--text-primary)]" : "text-[var(--text-muted)]"}`}>
                    {emp.zone}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock size={14} className={isOnShift ? "text-[var(--accent)]" : "text-[var(--text-muted)]"} />
                  <span className={`text-sm font-semibold font-jetbrains ${isOnShift ? "text-[var(--text-primary)]" : "text-[var(--text-muted)]"}`}>
                    {emp.since}
                  </span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* ── ROLE VERIFICATION FEED ────────────────────────────────────────────── */}
      <BaseCard className="col-4 flex flex-col p-0 min-h-[600px]">
        <div className="card-header px-6 pt-5 pb-3 border-b border-[var(--border)] m-0 flex-shrink-0 relative overflow-hidden">
          {/* Scanline Effect */}
          <div className="absolute inset-0 opacity-[0.05] pointer-events-none animate-scan" style={{ background: 'linear-gradient(transparent, var(--accent), transparent)', height: '10%' }} />
          <span className="card-title text-[var(--text-primary)] relative z-10">Role Verification Feed</span>
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
            {RECENT_SCANS.map((scan, i) => {
              const isVerified = scan.result === "Verified";
              const bgColor = isVerified ? "var(--positive)" : "var(--negative)";
              
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + i * 0.1 }}
                  className="flex flex-col p-4 rounded-xl border border-[var(--border)] bg-[var(--bg-base)]"
                >
                  <div className="flex justify-between items-center mb-3">
                    <span className={`text-xs font-bold uppercase ${isVerified ? 'text-[var(--positive)]' : 'text-[var(--negative)]'}`}>
                      {scan.result}
                    </span>
                    <span className="text-xs text-[var(--text-muted)] font-jetbrains">{scan.time}</span>
                  </div>
                  
                  <div className="flex justify-between items-end">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg shadow-inner border border-[rgba(255,255,255,0.1)]" style={{ background: bgrToRgb(scan.bgr) }} />
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-[var(--text-primary)]">{scan.id}</span>
                        <span className="text-[0.65rem] font-jetbrains text-[var(--text-subtle)] mt-0.5">
                          BGR: {scan.bgr.join(',')}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex flex-col items-end">
                      <span className="text-[0.65rem] text-[var(--text-muted)] uppercase font-bold mb-0.5">Match</span>
                      <span className="text-sm font-jetbrains font-bold" style={{ color: bgColor }}>{scan.match}%</span>
                    </div>
                  </div>
                  
                  {/* Confidence Bar */}
                  <div className="mt-4 h-1 w-full bg-[var(--border)] rounded-full overflow-hidden">
                    <motion.div 
                      className="h-full rounded-full"
                      style={{ background: bgColor }}
                      initial={{ width: 0 }}
                      animate={{ width: `${scan.match}%` }}
                      transition={{ delay: 0.5 + i * 0.1, duration: 1 }}
                    />
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </BaseCard>

    </div>
  );
}
