import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bell, CheckCircle2, XCircle, AlertTriangle, Activity, Check, Search, Filter, ShieldCheck, MapPin, Video,
  ChevronDown
} from "lucide-react";
import { allAlerts } from "@/data/watchrMockData";

const containerVar = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
};
const itemVar = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 400, damping: 30 } },
};

const SEV_STYLES: Record<string, { bg: string; text: string; icon: JSX.Element }> = {
  critical: { bg: "bg-[#FF003C]/10 border-[#FF003C]/30", text: "text-[#FF003C]", icon: <XCircle className="w-3.5 h-3.5" /> },
  high:     { bg: "bg-[#f59e0b]/10 border-[#f59e0b]/30", text: "text-[#f59e0b]", icon: <AlertTriangle className="w-3.5 h-3.5" /> },
  medium:   { bg: "bg-[#a855f7]/10 border-[#a855f7]/30", text: "text-[#a855f7]", icon: <Activity className="w-3.5 h-3.5" /> },
  low:      { bg: "bg-[#00F0FF]/10 border-[#00F0FF]/30", text: "text-[#00F0FF]", icon: <Bell className="w-3.5 h-3.5" /> },
};

export default function AlertsCenter() {
  const [alerts, setAlerts] = useState(allAlerts);
  const [search, setSearch] = useState("");
  const [sevFilter, setSevFilter] = useState("All");
  const [modFilter, setModFilter] = useState("All Modules");
  const [storeFilter, setStoreFilter] = useState("All Stores");

  // Summary counts
  const criticalCount = alerts.filter(a => a.severity === 'critical' && a.status !== 'resolved').length;
  const highCount = alerts.filter(a => a.severity === 'high' && a.status !== 'resolved').length;
  const mediumCount = alerts.filter(a => a.severity === 'medium' && a.status !== 'resolved').length;
  const resolvedCount = alerts.filter(a => a.status === 'resolved').length;

  // Derive filter options
  const modules = ["All Modules", ...Array.from(new Set(alerts.map(a => a.module)))];
  const stores = ["All Stores", ...Array.from(new Set(alerts.map(a => a.store)))];
  const severities = ["All", "Critical", "High", "Medium", "Low"];

  const filteredAlerts = useMemo(() => {
    return alerts.filter(a => {
      const matchSearch = a.description.toLowerCase().includes(search.toLowerCase()) || 
                          a.type.toLowerCase().includes(search.toLowerCase()) ||
                          a.id.toLowerCase().includes(search.toLowerCase());
      const matchSev = sevFilter === "All" || a.severity.toLowerCase() === sevFilter.toLowerCase();
      const matchMod = modFilter === "All Modules" || a.module === modFilter;
      const matchStore = storeFilter === "All Stores" || a.store === storeFilter;
      return matchSearch && matchSev && matchMod && matchStore;
    });
  }, [alerts, search, sevFilter, modFilter, storeFilter]);

  const handleResolve = (id: string) => {
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, status: "resolved" } : a));
  };
  
  const handleAssign = (id: string) => {
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, assignedTo: "Me (Admin)", status: "investigating" } : a));
  };

  return (
    <motion.div variants={containerVar} initial="hidden" animate="visible" className="w-full h-full flex flex-col gap-5">
      
      {/* ─── Header ─── */}
      <div className="flex items-end justify-between border-b border-[#2d3440] pb-4 flex-shrink-0">
        <div>
          <h1 className="text-3xl font-black font-display tracking-wide text-white flex items-center gap-3">
            ALERTS CENTER
          </h1>
          <p className="text-[10px] font-mono text-[#8c9baf] uppercase tracking-[0.2em] mt-1.5 flex items-center gap-2">
            UNIFIED EVENT FEED <span className="w-1 h-1 rounded-full bg-[#f43f5e]" /> INCIDENT TRIAGE
          </p>
        </div>
      </div>

      {/* ─── Count Cards ─── */}
      <div className="grid grid-cols-4 gap-4 flex-shrink-0">
        <motion.div variants={itemVar} className="tactical-panel bg-[#FF003C]/5 border border-[#FF003C]/20 rounded-lg p-4 flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-mono text-[#FF003C] uppercase tracking-widest">Critical Active</span>
            <span className="text-2xl font-black font-display text-white">{criticalCount}</span>
          </div>
          <XCircle className="w-6 h-6 text-[#FF003C]/50" />
        </motion.div>
        <motion.div variants={itemVar} className="tactical-panel bg-[#f59e0b]/5 border border-[#f59e0b]/20 rounded-lg p-4 flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-mono text-[#f59e0b] uppercase tracking-widest">High Priority</span>
            <span className="text-2xl font-black font-display text-white">{highCount}</span>
          </div>
          <AlertTriangle className="w-6 h-6 text-[#f59e0b]/50" />
        </motion.div>
        <motion.div variants={itemVar} className="tactical-panel bg-[#a855f7]/5 border border-[#a855f7]/20 rounded-lg p-4 flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-mono text-[#a855f7] uppercase tracking-widest">Medium Active</span>
            <span className="text-2xl font-black font-display text-white">{mediumCount}</span>
          </div>
          <Activity className="w-6 h-6 text-[#a855f7]/50" />
        </motion.div>
        <motion.div variants={itemVar} className="tactical-panel bg-[#10b981]/5 border border-[#10b981]/20 rounded-lg p-4 flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-mono text-[#10b981] uppercase tracking-widest">Resolved 24h</span>
            <span className="text-2xl font-black font-display text-white">{resolvedCount}</span>
          </div>
          <ShieldCheck className="w-6 h-6 text-[#10b981]/50" />
        </motion.div>
      </div>

      {/* ─── Filters ─── */}
      <motion.div variants={itemVar} className="flex items-center gap-3 p-3 bg-[#0a0c10] border border-[#2d3440] rounded-lg shadow-black/40 flex-shrink-0">
        <Filter className="w-4 h-4 text-[#8c9baf] ml-1" />
        
        {/* Severity Pills */}
        <div className="flex bg-[#11141a] p-1 rounded-md border border-[#2d3440]/50">
          {severities.map(s => (
            <button key={s} onClick={() => setSevFilter(s)}
              className={`px-3 py-1.5 rounded text-[10px] font-mono font-bold uppercase transition-all
                ${sevFilter === s ? "bg-[#00F0FF] text-black" : "text-[#8c9baf] hover:bg-[#2d3440]/50 hover:text-white"}`}>
              {s}
            </button>
          ))}
        </div>

        {/* Module Dropdown */}
        <div className="relative group">
          <select value={modFilter} onChange={(e) => setModFilter(e.target.value)}
            className="appearance-none bg-[#11141a] border border-[#2d3440]/50 text-white text-[10px] font-mono py-1.5 pl-3 pr-8 rounded-md outline-none cursor-pointer focus:border-[#00F0FF]/50 transition-colors uppercase w-[160px]">
            {modules.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#8c9baf] pointer-events-none group-hover:text-white" />
        </div>

        {/* Store Dropdown */}
        <div className="relative group">
          <select value={storeFilter} onChange={(e) => setStoreFilter(e.target.value)}
            className="appearance-none bg-[#11141a] border border-[#2d3440]/50 text-white text-[10px] font-mono py-1.5 pl-3 pr-8 rounded-md outline-none cursor-pointer focus:border-[#00F0FF]/50 transition-colors uppercase w-[160px]">
            {stores.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
          <MapPin className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#8c9baf] pointer-events-none group-hover:text-white" />
        </div>

        {/* Search */}
        <div className="relative flex-1 group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#8c9baf] group-focus-within:text-[#00F0FF] transition-colors" />
          <input 
            type="text" 
            placeholder="Search descriptions, IDs..." 
            value={search} onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#11141a] border border-[#2d3440]/50 text-white text-[11px] font-mono py-1.5 pl-9 pr-3 rounded-md outline-none placeholder:text-[#8c9baf]/60 focus:border-[#00F0FF]/50 transition-all font-light"
          />
        </div>

        {/* Count string */}
        <div className="text-[10px] font-mono text-[#8c9baf] pr-2 whitespace-nowrap">
          Showing {filteredAlerts.length} of {alerts.length}
        </div>
      </motion.div>

      {/* ─── Table ─── */}
      <motion.div variants={itemVar} className="flex-1 min-h-0 bg-[#0a0c10] border border-[#2d3440] rounded-xl overflow-hidden flex flex-col relative w-full tactical-panel">
        
        {/* Header */}
        <div className="grid grid-cols-[100px_140px_1fr_130px_100px_90px_100px_140px] gap-3 p-3 border-b border-[#2d3440] bg-[#11141a]/90 text-[10px] font-mono text-[#8c9baf] uppercase font-bold tracking-widest sticky top-0 z-10">
          <div>Severity</div>
          <div>Module / Type</div>
          <div>Description</div>
          <div>Location</div>
          <div>Camera</div>
          <div>Time</div>
          <div>Assignment</div>
          <div className="text-right">Actions</div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <AnimatePresence>
            {filteredAlerts.length === 0 ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-40 flex items-center justify-center text-sm font-mono text-[#8c9baf]/50">
                No alerts matching filters.
              </motion.div>
            ) : (
              filteredAlerts.map((a) => {
                const sStyle = SEV_STYLES[a.severity] || SEV_STYLES.low;
                const isResolved = a.status === 'resolved';

                return (
                  <motion.div 
                    layout 
                    initial={{ opacity: 0, y: -10 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    exit={{ opacity: 0, scale: 0.95 }}
                    key={a.id} 
                    className={`grid grid-cols-[100px_140px_1fr_130px_100px_90px_100px_140px] gap-3 p-3 items-center border-b border-[#2d3440]/40 transition-colors hover:bg-white/[0.02]
                      ${isResolved ? "opacity-40 grayscale-[0.8]" : ""}
                    `}
                  >
                    
                    {/* Severity */}
                    <div className="flex items-center gap-2">
                      <div className={`px-2 py-1 rounded border ${sStyle.bg} flex items-center gap-1.5`}>
                        {sStyle.icon}
                        <span className={`text-[9px] font-bold uppercase tracking-wider ${sStyle.text}`}>{a.severity}</span>
                      </div>
                    </div>

                    {/* Module & Type */}
                    <div className="flex flex-col gap-0.5">
                      <span className={`text-[10px] font-mono ${isResolved ? "text-[#8c9baf]" : "text-white"}`}>{a.module}</span>
                      <span className="text-[9px] font-mono text-[#8c9baf]/70 truncate">{a.type}</span>
                    </div>

                    {/* Desc */}
                    <div className="text-[11px] font-mono text-[#8c9baf] leading-tight truncate pr-4">
                      {isResolved ? <s>{a.description}</s> : a.description}
                    </div>

                    {/* Store */}
                    <div className="text-[10px] font-mono text-[#8c9baf] truncate flex items-center gap-1.5">
                      <MapPin className="w-3 h-3 text-[#2d3440]" /> {a.store}
                    </div>

                    {/* Camera */}
                    <div className="text-[10px] font-mono text-[#8c9baf] flex items-center gap-1.5">
                      <Video className="w-3 h-3 text-[#2d3440]" /> {a.camera}
                    </div>

                    {/* Time */}
                    <div className="text-[10px] font-mono text-[#8c9baf]">{a.time}</div>

                    {/* Assignee & Status */}
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[10px] font-mono text-white text-opacity-80">
                        {a.assignedTo || <span className="text-[#8c9baf]/40 italic">Unassigned</span>}
                      </span>
                      {a.status === 'active' && <span className="text-[8px] font-bold text-[#FF003C] uppercase tracking-wider">Active</span>}
                      {a.status === 'investigating' && <span className="text-[8px] font-bold text-[#00F0FF] uppercase tracking-wider">Investigating</span>}
                      {a.status === 'resolved' && <span className="text-[8px] font-bold text-[#10b981] uppercase tracking-wider">Resolved</span>}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-end gap-2">
                       {!isResolved && (
                         <>
                           {!a.assignedTo && (
                             <button onClick={() => handleAssign(a.id)} className="px-2.5 py-1 text-[9px] font-mono font-bold uppercase tracking-wider text-black bg-[#00F0FF] hover:bg-[#00F0FF]/80 rounded transition-colors">
                               Assign
                             </button>
                           )}
                           <button onClick={() => handleResolve(a.id)} className="px-2.5 py-1 text-[9px] font-mono font-bold uppercase tracking-wider text-[#8c9baf] border border-[#2d3440] hover:text-[#10b981] hover:border-[#10b981] rounded transition-colors flex items-center gap-1">
                             <Check className="w-3 h-3" /> Resolve
                           </button>
                         </>
                       )}
                       {isResolved && (
                         <span className="text-[10px] font-mono text-[#10b981] flex items-center gap-1.5 pr-2">
                           <CheckCircle2 className="w-3 h-3" /> Cleared
                         </span>
                       )}
                    </div>
                  </motion.div>
                );
              })
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  );
}
