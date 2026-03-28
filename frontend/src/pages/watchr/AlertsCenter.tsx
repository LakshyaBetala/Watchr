import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bell, CheckCircle2, XCircle, AlertTriangle, Activity, Check, Search, Filter, ShieldCheck, MapPin, Video,
  ChevronDown
} from "lucide-react";
import { allAlerts } from "@/data/watchrMockData";
import { BaseCard, KpiCard, FilterPill } from "./components/DashboardUI";

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

  const handleResolve = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, status: "resolved" } : a));
  };
  
  const handleAssign = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, assignedTo: "Me (Admin)", status: "investigating" } : a));
  };

  const SEV_COLORS: Record<string, string> = {
    critical: "var(--negative)",
    high:     "#f59e0b",
    medium:   "#a855f7",
    low:      "var(--accent)",
  };

  return (
    <div className="dashboard-grid min-h-screen">
      
      {/* ─── Header ─── */}
      <div className="col-12 flex items-end justify-between mb-2">
        <div>
          <h1 className="text-3xl font-black font-jakarta tracking-tight text-[var(--text-primary)]">
            Alerts Center
          </h1>
          <p className="text-[0.8rem] font-semibold text-[var(--text-muted)] mt-1">
            Unified Event Feed • Incident Triage
          </p>
        </div>
      </div>

      {/* ─── Count Cards ─── */}
      <KpiCard
        className="col-3"
        delay={0.1}
        title="Critical Active"
        value={criticalCount}
        icon={XCircle}
        accent={criticalCount > 0}
        trendUp={criticalCount === 0}
        trendValue="Immediate action"
      />
      <KpiCard
        className="col-3"
        delay={0.15}
        title="High Priority"
        value={highCount}
        icon={AlertTriangle}
      />
      <KpiCard
        className="col-3"
        delay={0.2}
        title="Medium Active"
        value={mediumCount}
        icon={Activity}
      />
      <KpiCard
        className="col-3"
        delay={0.25}
        title="Resolved (24h)"
        value={resolvedCount}
        icon={ShieldCheck}
      />

      {/* ─── Table Body ─── */}
      <BaseCard className="col-12 flex flex-col p-0 min-h-[850px] h-auto border border-[var(--border)] relative overflow-hidden">
        
        {/* Filters Top Bar */}
        <div className="card-header px-6 py-4 border-b border-[var(--border)] m-0 flex-shrink-0 flex items-center justify-between bg-[var(--bg-base)]">
          <div className="flex items-center gap-4">
            <Filter size={16} className="text-[var(--text-muted)]" />
            <div className="flex gap-2">
              {severities.map(s => (
                <FilterPill 
                  key={s} 
                  label={s} 
                  active={sevFilter === s} 
                  onClick={() => setSevFilter(s)} 
                />
              ))}
            </div>
            
            <div className="w-px h-6 bg-[var(--border)] mx-2" />

            <div className="relative group">
              <select 
                value={modFilter} 
                onChange={(e) => setModFilter(e.target.value)}
                className="appearance-none bg-[var(--bg-card)] border border-[var(--border)] text-[var(--text-primary)] text-[0.7rem] font-bold py-1.5 pl-3 pr-8 rounded-lg outline-none cursor-pointer focus:border-[var(--accent)] hover:border-[var(--text-subtle)] transition-colors uppercase"
              >
                {modules.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[var(--text-muted)] pointer-events-none group-hover:text-[var(--text-primary)]" />
            </div>

            <div className="relative group">
              <select 
                value={storeFilter} 
                onChange={(e) => setStoreFilter(e.target.value)}
                className="appearance-none bg-[var(--bg-card)] border border-[var(--border)] text-[var(--text-primary)] text-[0.7rem] font-bold py-1.5 pl-3 pr-8 rounded-lg outline-none cursor-pointer focus:border-[var(--accent)] hover:border-[var(--text-subtle)] transition-colors uppercase"
              >
                {stores.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
              <MapPin className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[var(--text-muted)] pointer-events-none group-hover:text-[var(--text-primary)]" />
            </div>
          </div>

          <div className="relative w-64 group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)] group-focus-within:text-[var(--accent)] transition-colors" />
            <input 
              type="text" 
              placeholder="Search descriptions, IDs..." 
              value={search} 
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[var(--bg-card)] border border-[var(--border)] text-[var(--text-primary)] text-xs py-2 pl-9 pr-3 rounded-lg outline-none placeholder:text-[var(--text-muted)] focus:border-[var(--accent)] transition-all font-semibold"
            />
          </div>
        </div>

        {/* Dense Feed Header */}
        <div className="grid grid-cols-[100px_160px_1fr_120px_100px_100px_140px] gap-4 px-6 py-2.5 border-b border-[var(--border)] bg-[var(--bg-card)] text-[0.65rem] font-bold text-[var(--text-muted)] uppercase tracking-widest sticky top-0 z-10 flex-shrink-0">
          <div>Severity</div>
          <div>Entity / Type</div>
          <div>Description</div>
          <div>Location</div>
          <div>Camera</div>
          <div>Time</div>
          <div className="text-right">Actions</div>
        </div>

        {/* Feed List Items */}
        <div className="flex-1 overflow-y-auto w-full pb-4">
          <AnimatePresence>
            {filteredAlerts.length === 0 ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-40 flex items-center justify-center text-sm font-semibold text-[var(--text-muted)]">
                No alerts matching filters.
              </motion.div>
            ) : (
              filteredAlerts.map((a, i) => {
                const isResolved = a.status === 'resolved';
                const color = SEV_COLORS[a.severity] || SEV_COLORS.low;

                return (
                  <motion.div 
                    layout 
                    initial={{ opacity: 0, y: -10 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    exit={{ opacity: 0, scale: 0.98 }}
                    transition={{ delay: i > 25 ? 0 : i * 0.02 }}
                    key={a.id} 
                    className={`group grid grid-cols-[100px_160px_1fr_120px_100px_100px_140px] gap-4 px-6 py-3 items-center border-b border-[var(--border)] transition-colors cursor-pointer hover:bg-[color-mix(in_srgb,var(--text-muted)_5%,transparent)]
                      ${isResolved ? "opacity-50 grayscale" : ""}
                    `}
                  >
                    
                    {/* Severity */}
                    <div className="flex items-center">
                      <div className="flex items-center gap-2 px-2.5 py-1 rounded border border-transparent group-hover:border-[var(--border)] transition-colors" style={{ color }}>
                        <div className="w-1.5 h-1.5 rounded-full" style={{ background: color, boxShadow: `0 0 6px ${color}` }} />
                        <span className="text-[0.65rem] font-bold uppercase tracking-widest font-jetbrains">{a.severity}</span>
                      </div>
                    </div>

                    {/* Module & Type */}
                    <div className="flex flex-col gap-0.5 min-w-0">
                      <span className="text-[0.75rem] font-bold text-[var(--text-primary)] truncate">{a.module}</span>
                      <span className="text-[0.65rem] font-semibold text-[var(--text-muted)] truncate">{a.type}</span>
                    </div>

                    {/* Desc */}
                    <div className={`text-[0.8rem] font-medium leading-snug pr-4 ${isResolved ? "text-[var(--text-muted)] line-through" : "text-[var(--text-primary)]"}`}>
                      {a.description}
                    </div>

                    {/* Store */}
                    <div className="text-[0.7rem] font-semibold text-[var(--text-muted)] flex items-center gap-2">
                      <MapPin size={12} className="text-[var(--text-subtle)]" />
                      <span className="truncate">{a.store}</span>
                    </div>

                    {/* Camera */}
                    <div className="text-[0.7rem] font-jetbrains text-[var(--text-muted)] flex items-center gap-2">
                      <Video size={12} className="text-[var(--text-subtle)]" />
                      <span className="truncate">{a.camera}</span>
                    </div>

                    {/* Time */}
                    <div className="text-[0.7rem] font-jetbrains text-[var(--text-muted)]">
                      {a.time}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                       {!isResolved ? (
                         <>
                           {!a.assignedTo && (
                             <button onClick={(e) => handleAssign(a.id, e)} className="px-3 py-1.5 text-[0.65rem] font-bold uppercase tracking-wider text-black bg-[var(--accent)] hover:bg-[color-mix(in_srgb,var(--accent)_80%,transparent)] rounded-lg transition-colors shadow-sm">
                               Assign
                             </button>
                           )}
                           <button onClick={(e) => handleResolve(a.id, e)} className="px-3 py-1.5 text-[0.65rem] font-bold uppercase tracking-wider text-[var(--text-muted)] border border-[var(--border)] hover:text-black hover:bg-[var(--positive)] hover:border-transparent rounded-lg transition-all flex items-center gap-1.5 shadow-sm">
                             <Check size={12} /> Resolve
                           </button>
                         </>
                       ) : (
                         <span className="text-[0.7rem] font-semibold text-[var(--positive)] flex items-center gap-1.5 pr-2">
                           <CheckCircle2 size={12} /> Cleared
                         </span>
                       )}
                    </div>
                  </motion.div>
                );
              })
            )}
          </AnimatePresence>
        </div>
      </BaseCard>

    </div>
  );
}
