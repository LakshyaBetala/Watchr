import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid,
} from "recharts";
import {
  UserCheck, ScanFace, Clock, CheckCircle2,
  XCircle, AlertTriangle, User, Activity,
} from "lucide-react";
import { employees, faceLogData, shiftActivity } from "@/data/watchrMockData";

const containerVar = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.07, delayChildren: 0.05 } },
};
const itemVar = {
  hidden: { opacity: 0, y: 14 },
  visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 320, damping: 28 } },
};

const GlowTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#11141a] border border-[#2d3440] px-3 py-2 rounded text-xs font-mono">
      <p className="text-[#8c9baf] mb-1">{label}:00</p>
      {payload.map((p: any) => (
        <p key={p.name} style={{ color: p.color }}>{p.name}: {p.value}</p>
      ))}
    </div>
  );
};

// Animated confidence arc (mini radial)
function ConfArc({ conf, size = 40 }: { conf: number; size?: number }) {
  const r = size / 2 - 4;
  const circ = 2 * Math.PI * r;
  const dash = circ * conf;
  const color = conf > 0.85 ? "#10b981" : conf > 0.65 ? "#F59E0B" : "#FF003C";

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={size / 2} cy={size / 2} r={r}
        strokeWidth="2.5" stroke="#2d3440" fill="none" />
      <motion.circle
        cx={size / 2} cy={size / 2} r={r}
        strokeWidth="2.5" fill="none"
        stroke={color}
        strokeLinecap="round"
        strokeDasharray={`${dash} ${circ}`}
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
        initial={{ strokeDasharray: `0 ${circ}` }}
        animate={{ strokeDasharray: `${dash} ${circ}` }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      />
      <text x={size / 2} y={size / 2 + 3.5}
        textAnchor="middle" fontSize="7" fill={color}
        fontFamily="IBM Plex Mono" fontWeight="bold">
        {Math.round(conf * 100)}%
      </text>
    </svg>
  );
}

// Uniform color chip (K-Means result visualization)
function UniformChip({ color, empId }: { color: string; empId: string }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <motion.div
        whileHover={{ scale: 1.15 }}
        className="w-8 h-8 rounded-lg border border-white/10 shadow-inner"
        style={{ background: color }}
        title={`Dominant uniform color (K-Means k=3) for ${empId}`}
      />
      <span className="text-[7px] font-mono text-[#8c9baf]">{color.toUpperCase()}</span>
    </div>
  );
}

// Status pill
function StatusPill({ status }: { status: string }) {
  const isActive = status === "active";
  return (
    <span className={`px-2 py-0.5 rounded text-[8px] font-mono font-bold uppercase tracking-wider
      ${isActive
        ? "bg-[#10b981]/15 text-[#10b981] border border-[#10b981]/25"
        : "bg-[#2d3440]/80 text-[#8c9baf] border border-[#2d3440]"
      }`}>
      {status}
    </span>
  );
}

// Face log action icon
function FaceAction({ action }: { action: string }) {
  if (action === "UNKNOWN" || action === "Unknown Face")
    return <AlertTriangle className="w-3.5 h-3.5 text-[#F59E0B]" />;
  if (action === "Clock-Out")
    return <XCircle className="w-3.5 h-3.5 text-[#8c9baf]" />;
  return <CheckCircle2 className="w-3.5 h-3.5 text-[#10b981]" />;
}

export default function EmployeeKiosk() {
  const [selected, setSelected] = useState<string | null>(null);

  const selectedEmp = employees.find(e => e.id === selected);

  return (
    <motion.div variants={containerVar} initial="hidden" animate="visible"
      className="flex flex-col h-full gap-6">

      {/* Header */}
      <motion.header variants={itemVar} className="flex items-center justify-between flex-shrink-0">
        <div>
          <h1 className="text-[22px] font-black font-display tracking-[0.15em] text-[#00F0FF]">
            EMPLOYEE KIOSK
          </h1>
          <p className="text-[10px] font-mono text-[#8c9baf] uppercase tracking-[0.25em] mt-0.5">
            K-Means Uniform Extraction · Face Analysis · Auto-Registration
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded border bg-[#00F0FF]/5 border-[#00F0FF]/20 text-[10px] font-mono text-[#00F0FF]">
            <ScanFace className="w-3 h-3" />
            {employees.filter(e => e.status === "active").length} ACTIVE
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded border bg-[#11141a] border-[#2d3440] text-[10px] font-mono text-[#8c9baf]">
            <Activity className="w-3 h-3" />
            K-MEANS k=3
          </div>
        </div>
      </motion.header>

      {/* Main body */}
      <div className="flex gap-4 flex-1 min-h-0">

        {/* Left: Employee roster */}
        <motion.div variants={itemVar}
          className="w-80 tactical-panel rounded-xl border border-[#2d3440] flex flex-col overflow-hidden flex-shrink-0">
          <div className="flex items-center gap-2 px-4 py-3 border-b border-[#2d3440]">
            <UserCheck className="w-3.5 h-3.5 text-[#00F0FF]" />
            <span className="text-[10px] font-mono text-[#8c9baf] uppercase tracking-widest">Registered Staff</span>
            <span className="ml-auto text-[9px] font-mono text-[#00F0FF]">{employees.length} profiles</span>
          </div>
          <div className="flex-1 overflow-y-auto p-2 flex flex-col gap-1.5">
            {employees.map((emp) => (
              <motion.button key={emp.id}
                variants={itemVar}
                whileHover={{ x: 2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setSelected(selected === emp.id ? null : emp.id)}
                className={`w-full text-left flex items-center gap-3 p-3 rounded-lg border transition-all
                  ${selected === emp.id
                    ? "border-[#00F0FF]/40 bg-[#00F0FF]/5"
                    : "border-transparent hover:border-[#2d3440] hover:bg-white/2"
                  }`}>

                {/* Avatar */}
                <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 border border-white/10"
                  style={{ background: `${emp.uniform}30` }}>
                  <User className="w-4 h-4 text-white/60" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] font-mono font-bold text-white truncate">{emp.name}</span>
                    <StatusPill status={emp.status} />
                  </div>
                  <p className="text-[9px] font-mono text-[#8c9baf] mt-0.5">{emp.id}</p>
                  <p className="text-[8px] font-mono text-[#8c9baf] flex items-center gap-1 mt-0.5">
                    <Clock className="w-2.5 h-2.5" />
                    {emp.shift}
                  </p>
                </div>

                <ConfArc conf={emp.faceConf} size={36} />
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Right: detail + charts */}
        <div className="flex-1 flex flex-col gap-4 min-h-0">

          {/* Employee detail card */}
          <AnimatePresence mode="wait">
            {selectedEmp ? (
              <motion.div key={selectedEmp.id}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ type: "spring", stiffness: 350, damping: 30 }}
                className="tactical-panel rounded-xl border border-[#00F0FF]/30 p-5 flex gap-6 flex-shrink-0">

                {/* Left info */}
                <div className="flex flex-col gap-3 flex-1">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center border border-[#00F0FF]/25"
                      style={{ background: `${selectedEmp.uniform}25` }}>
                      <User className="w-6 h-6 text-[#00F0FF]" />
                    </div>
                    <div>
                      <h3 className="text-base font-black font-display text-white tracking-wide">{selectedEmp.name}</h3>
                      <p className="text-[9px] font-mono text-[#00F0FF]">{selectedEmp.id}</p>
                    </div>
                    <div className="ml-auto">
                      <StatusPill status={selectedEmp.status} />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { label: "Shift", value: selectedEmp.shift },
                      { label: "Status", value: selectedEmp.status.toUpperCase() },
                      { label: "Face Confidence", value: `${(selectedEmp.faceConf * 100).toFixed(0)}%` },
                      { label: "Analysis", value: "Haar Cascade" },
                    ].map(({label, value}) => (
                      <div key={label} className="p-2.5 rounded-lg bg-[#0a0c10] border border-[#2d3440]">
                        <p className="text-[8px] font-mono text-[#8c9baf] uppercase tracking-wider">{label}</p>
                        <p className="text-[11px] font-mono text-white font-bold mt-0.5">{value}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* K-Means uniform color chips */}
                <div className="flex flex-col gap-3 items-center">
                  <p className="text-[8px] font-mono text-[#8c9baf] uppercase tracking-widest">K-Means Clusters</p>
                  <div className="flex gap-3">
                    {/* Simulate 3 cluster colors from the dominant uniform color */}
                    {[selectedEmp.uniform, adjustHex(selectedEmp.uniform, 30), adjustHex(selectedEmp.uniform, -30)].map((c, i) => (
                      <UniformChip key={i} color={c} empId={selectedEmp.id} />
                    ))}
                  </div>
                  <p className="text-[8px] font-mono text-[#8c9baf] text-center max-w-[120px] leading-relaxed">
                    Extracted from torso ROI via k=3 clustering
                  </p>
                </div>
              </motion.div>
            ) : (
              <motion.div key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="tactical-panel rounded-xl border border-[#2d3440] p-5 flex items-center justify-center gap-3 flex-shrink-0">
                <User className="w-4 h-4 text-[#8c9baf]" />
                <span className="text-[11px] font-mono text-[#8c9baf]">Select an employee to view profile details</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Bottom row: face log + shift chart */}
          <div className="flex gap-4 flex-1 min-h-0">

            {/* Face scan log */}
            <motion.div variants={itemVar}
              className="flex-1 tactical-panel rounded-xl border border-[#2d3440] flex flex-col overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-3 border-b border-[#2d3440] flex-shrink-0">
                <ScanFace className="w-3.5 h-3.5 text-[#00F0FF]" />
                <span className="text-[10px] font-mono text-[#8c9baf] uppercase tracking-widest">Face Scan Log</span>
                <div className="ml-auto flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#00F0FF] animate-pulse" />
                  <span className="text-[9px] font-mono text-[#00F0FF]">LIVE</span>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto p-3">
                <motion.div variants={containerVar} initial="hidden" animate="visible"
                  className="flex flex-col gap-1.5">
                  {faceLogData.map((entry, i) => {
                    const isUnknown = entry.id === "UNKNOWN";
                    return (
                      <motion.div key={i} variants={itemVar}
                        className={`flex items-center gap-3 px-3 py-2 rounded border text-xs font-mono
                          ${isUnknown
                            ? "border-[#F59E0B]/25 bg-[#F59E0B]/5"
                            : "border-[#2d3440] bg-[#0a0c10]"
                          }`}>
                        <FaceAction action={entry.action} />
                        <span className="text-[#8c9baf] flex-shrink-0">{entry.ts}</span>
                        <span className={`font-bold flex-shrink-0 ${isUnknown ? "text-[#F59E0B]" : "text-[#00F0FF]"}`}>
                          {entry.id}
                        </span>
                        <span className="text-white/70 text-[10px] truncate">{entry.action}</span>
                        <span className="ml-auto text-[#8c9baf] flex-shrink-0 text-[9px]">{entry.zone}</span>
                        <span className={`text-[9px] flex-shrink-0 ${entry.conf > 0.7 ? "text-[#10b981]" : "text-[#F59E0B]"}`}>
                          {(entry.conf * 100).toFixed(0)}%
                        </span>
                      </motion.div>
                    );
                  })}
                </motion.div>
              </div>
            </motion.div>

            {/* Shift occupancy chart */}
            <motion.div variants={itemVar}
              className="w-56 tactical-panel rounded-xl border border-[#2d3440] p-4 flex flex-col gap-2">
              <p className="text-[10px] font-mono text-[#8c9baf] uppercase tracking-widest">Staff On-Shift / Hour</p>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={shiftActivity} margin={{ top: 4, right: 0, left: -30, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                  <XAxis dataKey="hour" tick={{ fontSize: 7, fill: "#8c9baf", fontFamily: "IBM Plex Mono" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 7, fill: "#8c9baf", fontFamily: "IBM Plex Mono" }} axisLine={false} tickLine={false} />
                  <Tooltip content={<GlowTooltip />} />
                  <Bar dataKey="count" fill="#00F0FF" fillOpacity={0.75} radius={[2, 2, 0, 0]} name="Staff" />
                </BarChart>
              </ResponsiveContainer>
            </motion.div>

          </div>
        </div>
      </div>
    </motion.div>
  );
}

// Simple hex color brightness adjuster for K-Means cluster simulation
function adjustHex(hex: string, amount: number): string {
  try {
    const clamp = (v: number) => Math.max(0, Math.min(255, v));
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `#${clamp(r + amount).toString(16).padStart(2, "0")}${clamp(g + amount).toString(16).padStart(2, "0")}${clamp(b + amount).toString(16).padStart(2, "0")}`;
  } catch {
    return hex;
  }
}
