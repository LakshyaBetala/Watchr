import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Building2, MapPin, Video, Users, BellRing, Target,
  CheckCircle2, AlertCircle, Save, Plus, Edit2, Trash2, UserCheck, EyeOff
} from "lucide-react";
import { orgData, storesData, camerasData, usersData } from "@/data/watchrMockData";
import { BaseCard } from "./components/DashboardUI";

export default function Settings() {
  const [activeTab, setActiveTab] = useState("organization");
  const [savedMsg, setSavedMsg] = useState(false);

  const triggerSave = () => {
    setSavedMsg(true);
    setTimeout(() => setSavedMsg(false), 3000);
  };

  const tabs = [
    { id: "organization", label: "Organization",   sub: "Active",      icon: <Building2 size={16} /> },
    { id: "stores",       label: "Stores",         sub: "6 Locations",  icon: <MapPin size={16} /> },
    { id: "cameras",      label: "Cameras",        sub: "12 Channels",  icon: <Video size={16} /> },
    { id: "users",        label: "Users & Roles",  sub: "4 Active",     icon: <Users size={16} /> },
    { id: "notifications",label: "Notifications",  sub: "8 Enabled",    icon: <BellRing size={16} /> },
    { id: "auto_calibrator",label: "Auto-Calibrator", sub: "Ready",      icon: <Target size={16} /> },
  ];

  // Helper component for toggles
  const SelectorPill = ({ checked, onChange }: { checked: boolean; onChange?: () => void }) => (
    <div 
      onClick={onChange}
      className={`relative w-11 h-6 rounded-full cursor-pointer transition-colors border ${checked ? 'bg-[color-mix(in_srgb,var(--accent)_20%,transparent)] border-[var(--accent)]' : 'bg-[var(--bg-card)] border-[var(--border)]'}`}
    >
      <div className={`absolute top-[3px] w-4 h-4 rounded-full transition-all duration-300 shadow-sm ${checked ? 'left-[22px] bg-[var(--accent)] shadow-[0_0_8px_var(--accent)]' : 'left-[3px] bg-[var(--text-muted)]'}`} />
    </div>
  );

  return (
    <div className="dashboard-grid min-h-screen">
      
      {/* ─── Header ─── */}
      <div className="col-12 flex items-end justify-between mb-2">
        <div>
          <h1 className="text-3xl font-black font-jakarta tracking-tight text-[var(--text-primary)]">
            Settings
          </h1>
          <p className="text-[0.8rem] font-semibold text-[var(--text-muted)] mt-1">
            System Configuration • Access Control • Calibration
          </p>
        </div>
      </div>

      {/* ─── Sidebar Tabs ─── */}
      <div className="col-3 flex flex-col gap-3">
        {tabs.map(t => {
          const isActive = activeTab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`flex items-center gap-4 p-4 rounded-xl text-left transition-all border group relative overflow-hidden
                ${isActive 
                  ? "bg-[color-mix(in_srgb,var(--accent)_10%,transparent)] text-[var(--accent)] border-[var(--accent)] shadow-[0_0_20px_color-mix(in_srgb,var(--accent)_5%,transparent)]" 
                  : "bg-[var(--bg-card)] text-[var(--text-muted)] border-[var(--border)] hover:border-[var(--text-subtle)]"
                }`}
            >
              <div className={`p-2 rounded-lg border transition-colors ${isActive ? 'border-[var(--accent)] bg-[var(--accent-dim)]' : 'border-[var(--border)] bg-[var(--bg-base)] group-hover:border-[var(--text-muted)]'}`}>
                {t.icon}
              </div>
              <div className="flex flex-col min-w-0">
                <span className={`text-[0.85rem] font-bold tracking-tight ${isActive ? 'text-[var(--accent)]' : 'text-[var(--text-primary)]'} transition-colors`}>
                  {t.label}
                </span>
                <span className="text-[0.6rem] font-black font-jetbrains uppercase tracking-widest opacity-50">
                  {t.sub}
                </span>
              </div>
            </button>
          )
        })}
      </div>

      {/* ─── Tab Content Area ─── */}
      <BaseCard className="col-9 min-h-[800px] h-auto overflow-y-auto custom-scrollbar p-6">
        <AnimatePresence mode="wait">
          
          {/* --- ORGANIZATION TAB --- */}
          {activeTab === "organization" && (
            <motion.div key="org" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }} className="flex flex-col h-full">
              <div className="mb-10">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-1.5 h-6 bg-[var(--accent)] rounded-full" />
                  <h3 className="text-xl font-black font-jakarta text-[var(--text-primary)] tracking-tight">System Identity</h3>
                </div>
                <p className="text-[var(--text-muted)] text-[0.85rem] font-medium leading-relaxed max-w-xl">
                  Configure global organization parameters and administrative contact profiles. 
                  These details appear on all generated AI intelligence reports.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-8 mb-12">
                {[
                  { label: "ORG_ID_NAME", default: orgData.name, icon: <Building2 size={14} /> },
                  { label: "AUTH_CON_EMAIL", default: orgData.email, icon: <Building2 size={14} /> },
                  { label: "SYS_CON_PHONE", default: orgData.phone, icon: <Building2 size={14} /> },
                  { label: "LOC_GEO_ADDR", default: orgData.address, icon: <MapPin size={14} /> },
                ].map((field, i) => (
                  <div key={i} className="flex flex-col gap-3 group">
                    <div className="flex items-center gap-2">
                      <span className="text-[0.62rem] font-black font-jetbrains text-[var(--accent)] uppercase tracking-[0.2em]">{field.label}</span>
                      <div className="flex-1 h-[1px] bg-[var(--border)] opacity-50 group-focus-within:bg-[var(--accent)] transition-colors" />
                    </div>
                    <div className="relative">
                      <input 
                        type="text" 
                        defaultValue={field.default} 
                        className="w-full bg-[var(--bg-base)] border border-[var(--border)] rounded-xl px-5 py-4 text-[0.9rem] font-bold text-[var(--text-primary)] font-jakarta focus:outline-none focus:border-[var(--accent)] focus:ring-4 focus:ring-[var(--accent-dim)] transition-all placeholder:opacity-30" 
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-auto pt-8 border-t border-[var(--border)] flex flex-col gap-6">
                <div>
                  <h3 className="text-sm font-black text-[var(--text-primary)] uppercase tracking-widest mb-4">Contract Status</h3>
                  <div className="bg-[var(--bg-base)] border border-[var(--border)] rounded-2xl p-6 flex items-center justify-between group hover:border-[var(--positive)] transition-colors">
                    <div className="flex items-center gap-5">
                      <div className="w-12 h-12 rounded-xl bg-[color-mix(in_srgb,var(--positive)_10%,transparent)] border border-[color-mix(in_srgb,var(--positive)_20%,transparent)] flex items-center justify-center text-[var(--positive)]">
                        <CheckCircle2 size={24} />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-lg font-black font-jakarta text-[var(--text-primary)] tracking-tight">
                          {orgData.plan} • VisionIQ Elite
                        </span>
                        <span className="text-[0.75rem] font-medium text-[var(--text-muted)] mt-0.5">Automated visual surveillance • Priority inference compute</span>
                      </div>
                    </div>
                    <button className="px-6 py-2.5 rounded-xl border border-[var(--border)] text-[0.7rem] font-bold uppercase tracking-widest hover:border-[var(--accent)] hover:text-[var(--accent)] transition-all">
                      Upgrade Tier
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between bg-[var(--bg-card)] p-2 pl-6 rounded-2xl border border-[var(--border)]">
                  <div className="flex items-center gap-4">
                    {savedMsg ? (
                      <span className="text-[var(--positive)] text-[0.75rem] font-black uppercase tracking-widest flex items-center gap-2 animate-pulse">
                        <CheckCircle2 size={16} /> Data Commited
                      </span>
                    ) : (
                      <span className="text-[var(--text-muted)] text-[0.7rem] font-bold uppercase tracking-widest flex items-center gap-2">
                        <AlertCircle size={14} /> Pending Changes
                      </span>
                    )}
                  </div>
                  <button onClick={triggerSave} className="flex items-center gap-3 bg-[var(--accent)] text-black px-8 py-4 rounded-xl text-[0.75rem] font-black uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all shadow-[0_8px_30px_color-mix(in_srgb,var(--accent)_30%,transparent)]">
                    <Save size={18} /> Sync Local State
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* --- STORES TAB --- */}
          {activeTab === "stores" && (
            <motion.div key="stores" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="flex flex-col gap-5 h-full">
              <div className="flex items-center justify-between mb-2 border-b border-[var(--border)] pb-4">
                <h3 className="text-sm font-bold text-[var(--text-primary)] uppercase tracking-widest">Store Locations</h3>
                <button className="flex items-center gap-2 bg-[var(--bg-card)] border border-[var(--border)] hover:border-[var(--accent)] text-[var(--accent)] px-4 py-1.5 rounded-lg text-[0.7rem] font-bold uppercase tracking-widest transition-all shadow-sm">
                  <Plus size={14} /> Add Store
                </button>
              </div>

              <div className="grid gap-3">
                {storesData.map(s => (
                  <div key={s.id} className="grid grid-cols-[1fr_2fr_100px_80px_100px] gap-4 items-center p-4 bg-[var(--bg-card)] border border-[var(--border)] rounded-xl hover:bg-[color-mix(in_srgb,var(--text-muted)_5%,transparent)] transition-colors">
                    <span className="text-[0.8rem] font-bold text-[var(--text-primary)] truncate">{s.name}</span>
                    <span className="text-[0.7rem] font-semibold text-[var(--text-muted)] truncate flex items-center gap-1.5"><MapPin size={14} className="text-[var(--text-subtle)]" /> {s.location}</span>
                    <span className="text-[0.7rem] font-jetbrains text-[var(--text-muted)] text-center bg-[color-mix(in_srgb,var(--text-muted)_10%,transparent)] py-1 rounded-md border border-[var(--border)]">{s.cameras} Cams</span>
                    <div className="flex justify-center">
                      <SelectorPill checked={s.status} />
                    </div>
                    <div className="flex gap-2 justify-end">
                      <button className="p-1.5 text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors"><Edit2 size={14} /></button>
                      <button className="p-1.5 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"><Video size={14} /></button>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* --- CAMERAS TAB --- */}
          {activeTab === "cameras" && (
            <motion.div key="cameras" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="flex flex-col gap-5 h-full">
              <div className="flex items-center justify-between mb-2 border-b border-[var(--border)] pb-4">
                <h3 className="text-sm font-bold text-[var(--text-primary)] uppercase tracking-widest flex items-center gap-2">
                  Video Sources <span className="bg-[var(--bg-card)] border border-[var(--border)] text-[0.6rem] px-2 py-0.5 rounded-full text-[var(--text-muted)] font-jetbrains">11/12 ACTIVE</span>
                </h3>
              </div>

              <div className="grid gap-3 overflow-y-auto pr-2 custom-scrollbar flex-1 pb-4">
                {camerasData.map(c => (
                  <div key={c.id} className={`grid grid-cols-[80px_1.5fr_1fr_100px_2fr_60px] gap-3 items-center p-3 rounded-xl border transition-all
                    ${c.status ? 'bg-[var(--bg-card)] border-[var(--border)] hover:bg-[color-mix(in_srgb,var(--text-muted)_5%,transparent)]' : 'bg-[color-mix(in_srgb,var(--negative)_5%,transparent)] border-[color-mix(in_srgb,var(--negative)_30%,transparent)] grayscale'}
                  `}>
                    <span className={`text-[0.7rem] font-jetbrains font-bold uppercase ${c.status ? 'text-[var(--text-primary)]' : 'text-[var(--negative)]'}`}>{c.id}</span>
                    <span className="text-[0.75rem] font-semibold text-[var(--text-muted)] truncate flex items-center gap-1.5">
                      {c.status ? <Video size={14} className="text-[var(--text-subtle)]" /> : <EyeOff size={14} className="text-[var(--negative)]" />} 
                      {c.name}
                    </span>
                    <span className="text-[0.65rem] font-bold text-[var(--text-muted)] truncate uppercase">{c.store}</span>
                    <span className="text-[0.65rem] font-jetbrains font-bold text-[var(--accent)] bg-[color-mix(in_srgb,var(--accent)_10%,transparent)] border border-[color-mix(in_srgb,var(--accent)_20%,transparent)] px-2 py-0.5 rounded-md text-center truncate">{c.zone}</span>
                    
                    <div className="flex gap-1.5 flex-wrap">
                      {c.modules.map(m => (
                        <span key={m} className="text-[0.6rem] font-bold text-[var(--text-muted)] bg-[var(--bg-card)] border border-[var(--border)] rounded px-1.5 py-0.5 truncate max-w-[100px]">{m}</span>
                      ))}
                    </div>

                    <div className="flex justify-end pr-2">
                      <SelectorPill checked={c.status} />
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* --- USERS TAB --- */}
          {activeTab === "users" && (
            <motion.div key="users" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="flex flex-col gap-5 h-full">
              <div className="flex items-center justify-between mb-2 border-b border-[var(--border)] pb-4">
                <h3 className="text-sm font-bold text-[var(--text-primary)] uppercase tracking-widest">Directory</h3>
                <button className="flex items-center gap-2 bg-[var(--bg-card)] border border-[var(--border)] hover:border-[var(--accent)] text-[var(--accent)] px-4 py-1.5 rounded-lg text-[0.7rem] font-bold uppercase tracking-widest transition-colors shadow-sm">
                  <UserCheck size={14} /> Invite User
                </button>
              </div>

              <div className="grid gap-3">
                {usersData.map((u) => {
                  let roleColors = "text-[var(--text-muted)] border-[var(--border)] bg-[var(--bg-card)]";
                  if (u.role === "Super Admin") roleColors = "text-[var(--negative)] border-[color-mix(in_srgb,var(--negative)_30%,transparent)] bg-[color-mix(in_srgb,var(--negative)_5%,transparent)]";
                  if (u.role === "Store Manager") roleColors = "text-[#a855f7] border-[color-mix(in_srgb,#a855f7_30%,transparent)] bg-[color-mix(in_srgb,#a855f7_5%,transparent)]";
                  if (u.role === "Analyst") roleColors = "text-[var(--accent)] border-[color-mix(in_srgb,var(--accent)_30%,transparent)] bg-[color-mix(in_srgb,var(--accent)_5%,transparent)]";
                  
                  return (
                    <div key={u.id} className="grid grid-cols-[200px_1.5fr_1fr_100px_80px] gap-4 items-center p-4 border border-[var(--border)] rounded-xl bg-[var(--base-card)] hover:bg-[color-mix(in_srgb,var(--text-muted)_5%,transparent)] transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[color-mix(in_srgb,var(--text-muted)_20%,transparent)] flex items-center justify-center text-[0.7rem] font-black font-jakarta text-[var(--text-primary)]">
                          {u.name.split(' ').map(n=>n[0]).join('')}
                        </div>
                        <span className="text-[0.8rem] font-bold text-[var(--text-primary)] truncate">{u.name}</span>
                      </div>
                      <span className="text-[0.75rem] font-medium text-[var(--text-muted)] truncate">{u.email}</span>
                      <div>
                        <span className={`inline-flex px-2 py-0.5 rounded-md text-[0.6rem] font-bold uppercase tracking-wider border ${roleColors}`}>
                          {u.role}
                        </span>
                      </div>
                      <span className="text-[0.65rem] font-jetbrains font-medium text-[var(--text-muted)] opacity-70 truncate italic">{u.lastActive}</span>
                      <div className="flex gap-2 justify-end">
                        <button className="p-1.5 text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors"><Edit2 size={14} /></button>
                        {u.role !== "Super Admin" && <button className="p-1.5 text-[var(--text-muted)] hover:text-[var(--negative)] transition-colors"><Trash2 size={14} /></button>}
                      </div>
                    </div>
                  )
                })}
              </div>
            </motion.div>
          )}

          {/* --- NOTIFICATIONS TAB --- */}
          {activeTab === "notifications" && (
            <motion.div key="notifications" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="flex flex-col gap-5 h-full max-w-2xl">
              <div className="flex items-center justify-between mb-2 border-b border-[var(--border)] pb-4">
                <div>
                  <h3 className="text-sm font-bold text-[var(--text-primary)] uppercase tracking-widest">Alert Preferences</h3>
                  <p className="text-[var(--text-muted)] text-[0.8rem] mt-1">Configure which modules can push notifications and summarize data.</p>
                </div>
              </div>

              <div className="flex flex-col gap-0 border border-[var(--border)] rounded-xl overflow-hidden bg-[var(--bg-card)]">
                {[
                  { title: "Critical Alerts", desc: "Immediate alerts for theft, fire, and blacklist matches", def: true },
                  { title: "High Priority Alerts", desc: "All high severity alerts across modules", def: true },
                  { title: "Staff Idle Warnings", desc: "When staff exceed idle time threshold", def: true },
                  { title: "Fire & Thermal Events", desc: "All fire detection and thermal anomaly triggers", def: true },
                  { title: "Crowd Density Alerts", desc: "When a zone exceeds safe capacity", def: false },
                  { title: "Daily Summary Report", desc: "End-of-day summary of all incidents and KPIs", def: true },
                  { title: "Weekly Analytics Report", desc: "Weekly footfall and behaviour digest", def: false },
                  { title: "Camera Offline Alerts", desc: "When a camera loses connection for 2+ minutes", def: true },
                ].map((row, i) => (
                  <div key={i} className={`flex items-center justify-between p-4 ${i !== 7 ? 'border-b border-[var(--border)]' : ''} hover:bg-[color-mix(in_srgb,var(--text-muted)_5%,transparent)] transition-colors`}>
                    <div className="flex flex-col gap-1">
                      <span className="text-[0.75rem] font-bold text-[var(--text-primary)] uppercase tracking-wide">{row.title}</span>
                      <span className="text-[0.7rem] font-medium text-[var(--text-muted)]">{row.desc}</span>
                    </div>
                    <SelectorPill checked={row.def} />
                  </div>
                ))}
              </div>

              <div className="flex gap-4 mt-6">
                <button onClick={triggerSave} className="flex items-center gap-2 bg-[var(--accent)] text-black px-6 py-2.5 rounded-lg text-[0.7rem] font-bold uppercase tracking-widest hover:brightness-110 transition-all shadow-[0_4px_14px_color-mix(in_srgb,var(--accent)_20%,transparent)]">
                  <Save size={16} /> Save Preferences
                </button>
                {savedMsg && <span className="text-[var(--positive)] text-[0.75rem] font-bold flex items-center gap-1.5 animate-pulse"><CheckCircle2 size={16} /> Saved.</span>}
              </div>
            </motion.div>
          )}

          {/* --- AUTO-CALIBRATOR TAB --- */}
          {activeTab === "auto_calibrator" && (
            <motion.div key="auto_calibrator" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="flex flex-col h-full items-center justify-center text-center relative overflow-hidden">
              <div className="absolute inset-0 z-0 flex items-center justify-center">
                <div className="w-[600px] h-[600px] bg-[var(--accent)] opacity-[0.02] rounded-full blur-[100px] animate-pulse" />
              </div>
              
              <div className="relative z-10 w-full max-w-lg">
                <div className="relative w-64 h-64 mx-auto mb-10 group cursor-crosshair">
                  {/* Calibration rings */}
                  <motion.div 
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 15, ease: "linear" }}
                    className="absolute inset-0 rounded-full border border-[var(--accent)] border-dashed opacity-30" 
                  />
                  <motion.div 
                    animate={{ rotate: -360 }}
                    transition={{ repeat: Infinity, duration: 25, ease: "linear" }}
                    className="absolute inset-6 rounded-full border border-[var(--accent)] opacity-10" 
                  />
                  <div className="absolute inset-12 rounded-full border-2 border-[var(--accent)] border-dashed opacity-60 animate-pulse" />
                  
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="relative">
                      <Target size={64} className="text-[var(--accent)] animate-pulse" />
                      {/* Scanning Line */}
                      <motion.div 
                        animate={{ top: ['0%', '100%', '0%'] }}
                        transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                        className="absolute left-[-40px] right-[-40px] h-[1px] bg-gradient-to-r from-transparent via-[var(--accent)] to-transparent shadow-[0_0_10px_var(--accent)]"
                      />
                    </div>
                  </div>
                  
                  {/* Corner reticles */}
                  <div className="absolute -top-4 -left-4 w-8 h-8 border-t-2 border-l-2 border-[var(--accent)] shadow-[0_0_15px_var(--accent-dim)]" />
                  <div className="absolute -top-4 -right-4 w-8 h-8 border-t-2 border-r-2 border-[var(--accent)] shadow-[0_0_15px_var(--accent-dim)]" />
                  <div className="absolute -bottom-4 -left-4 w-8 h-8 border-b-2 border-l-2 border-[var(--accent)] shadow-[0_0_15px_var(--accent-dim)]" />
                  <div className="absolute -bottom-4 -right-4 w-8 h-8 border-b-2 border-r-2 border-[var(--accent)] shadow-[0_0_15px_var(--accent-dim)]" />
                </div>

                <div className="space-y-4">
                  <div>
                    <h2 className="text-4xl font-black font-jakarta text-[var(--text-primary)] mb-3 tracking-tighter uppercase italic">Spatial Cal v4</h2>
                    <div className="flex items-center justify-center gap-4">
                      <span className="flex items-center gap-1.5 text-[0.65rem] font-black font-jetbrains text-[var(--accent)] bg-[var(--accent-dim)] px-2 py-1 rounded">
                        <div className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] animate-ping" />
                        SYSTEM_IDLE
                      </span>
                      <span className="text-[0.65rem] font-black font-jetbrains text-[var(--text-muted)] uppercase tracking-widest">
                        Ready for point-cloud mapping
                      </span>
                    </div>
                  </div>
                  
                  <p className="text-[0.9rem] text-[var(--text-muted)] leading-relaxed font-medium mx-auto max-w-sm">
                    Initiate boundary detection to automatically synchronize camera coordinates with physical store sectors.
                  </p>

                  <div className="pt-6">
                    <button className="group relative px-12 py-5 rounded-2xl bg-[var(--accent)] overflow-hidden transition-all hover:scale-[1.05] active:scale-[0.95]">
                      <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity" />
                      <span className="relative z-10 text-[0.8rem] font-black uppercase tracking-[0.2em] text-black">
                        Start Calibration
                      </span>
                    </button>
                    <p className="mt-4 text-[0.65rem] font-jetbrains text-[var(--text-muted)] opacity-50">
                      EST_PROCESS_TIME: 12.4s • MODULE: ZONE_MAP_V2
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </BaseCard>
    </div>
  );
}
