import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Settings as SettingsIcon, Building2, MapPin, Video, Users, BellRing,
  CheckCircle2, AlertCircle, Save, Plus, Edit2, Trash2, ShieldCheck, UserCheck, Activity, EyeOff
} from "lucide-react";
import { orgData, storesData, camerasData, usersData } from "@/data/watchrMockData";

const containerVar = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
};
const itemVar = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 400, damping: 30 } },
};

export default function Settings() {
  const [activeTab, setActiveTab] = useState("organization");
  const [savedMsg, setSavedMsg] = useState(false);

  const triggerSave = () => {
    setSavedMsg(true);
    setTimeout(() => setSavedMsg(false), 3000);
  };

  const tabs = [
    { id: "organization", label: "Organization", icon: <Building2 className="w-4 h-4" /> },
    { id: "stores", label: "Stores", icon: <MapPin className="w-4 h-4" /> },
    { id: "cameras", label: "Cameras", icon: <Video className="w-4 h-4" /> },
    { id: "users", label: "Users & Roles", icon: <Users className="w-4 h-4" /> },
    { id: "notifications", label: "Notifications", icon: <BellRing className="w-4 h-4" /> },
  ];

  return (
    <motion.div variants={containerVar} initial="hidden" animate="visible" className="w-full h-full flex flex-col gap-6 relative">
      
      {/* ─── Header ─── */}
      <div className="flex items-end justify-between border-b border-[#2d3440] pb-4 flex-shrink-0">
        <div>
          <h1 className="text-3xl font-black font-display tracking-wide text-white flex items-center gap-3">
            SETTINGS
          </h1>
          <p className="text-[10px] font-mono text-[#8c9baf] uppercase tracking-[0.2em] mt-1.5 flex items-center gap-2">
            SYSTEM CONFIGURATION <span className="w-1 h-1 rounded-full bg-[#94a3b8]" /> ACCESS CONTROL
          </p>
        </div>
      </div>

      <div className="flex flex-1 min-h-0 gap-6">
        {/* ─── Sidebar Tabs ─── */}
        <div className="w-56 flex flex-col gap-2 flex-shrink-0">
          {tabs.map(t => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`flex items-center gap-3 p-3 rounded-lg text-sm font-mono transition-all border
                ${activeTab === t.id 
                  ? "bg-[#00F0FF]/10 text-[#00F0FF] border-[#00F0FF]/30" 
                  : "bg-transparent text-[#8c9baf] border-transparent hover:bg-white/5 hover:text-white"
                }`}
            >
              {t.icon}
              <span className="font-bold tracking-wider uppercase text-[10px]">{t.label}</span>
            </button>
          ))}
        </div>

        {/* ─── Tab Content Area ─── */}
        <div className="flex-1 bg-[#0a0c10] border border-[#2d3440] rounded-xl p-6 tactical-panel overflow-y-auto custom-scrollbar relative">
          <AnimatePresence mode="wait">
            
            {/* --- ORGANIZATION TAB --- */}
            {activeTab === "organization" && (
              <motion.div key="org" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex flex-col gap-8 max-w-2xl">
                <div>
                  <h3 className="text-sm font-mono font-bold text-white uppercase tracking-widest mb-1">Company Profile</h3>
                  <p className="text-[#8c9baf] text-[11px] font-mono">Manage primary organization details and active subscriptions.</p>
                </div>

                <div className="grid grid-cols-2 gap-5">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-mono text-[#8c9baf] uppercase tracking-widest">Organization Name</label>
                    <input type="text" defaultValue={orgData.name} className="bg-[#11141a] border border-[#2d3440] rounded-md px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-[#00F0FF]/50 transition-colors" />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-mono text-[#8c9baf] uppercase tracking-widest">Contact Email</label>
                    <input type="email" defaultValue={orgData.email} className="bg-[#11141a] border border-[#2d3440] rounded-md px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-[#00F0FF]/50 transition-colors" />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-mono text-[#8c9baf] uppercase tracking-widest">Phone Number</label>
                    <input type="text" defaultValue={orgData.phone} className="bg-[#11141a] border border-[#2d3440] rounded-md px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-[#00F0FF]/50 transition-colors" />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-mono text-[#8c9baf] uppercase tracking-widest">Billing Address</label>
                    <input type="text" defaultValue={orgData.address} className="bg-[#11141a] border border-[#2d3440] rounded-md px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-[#00F0FF]/50 transition-colors" />
                  </div>
                </div>

                <div className="border-t border-[#2d3440] pt-6 flex flex-col gap-4">
                  <h3 className="text-sm font-mono font-bold text-white uppercase tracking-widest">Subscription Plan</h3>
                  <div className="bg-[#10b981]/5 border border-[#10b981]/30 rounded-lg p-5 flex items-center justify-between">
                    <div className="flex flex-col">
                      <span className="text-lg font-black font-display text-white tracking-widest flex items-center gap-2">
                        {orgData.plan} <CheckCircle2 className="w-4 h-4 text-[#10b981]" />
                      </span>
                      <span className="text-[10px] font-mono text-[#8c9baf] mt-1">Full access to 5 AI visual modules. Active until Dec 2026.</span>
                    </div>
                    <button className="text-[10px] font-bold uppercase tracking-wider text-black bg-[#10b981] px-4 py-2 rounded shadow-md shadow-[#10b981]/20 hover:bg-[#10b981]/80 transition-colors">Manage Plan</button>
                  </div>
                </div>

                <div className="border-t border-[#2d3440] pt-6 flex gap-4 mt-4">
                  <button onClick={triggerSave} className="flex items-center gap-2 bg-[#00F0FF] text-black px-6 py-2.5 rounded text-[11px] font-mono font-bold uppercase tracking-widest hover:bg-[#00F0FF]/80 transition-colors">
                    <Save className="w-4 h-4" /> Save Changes
                  </button>
                  {savedMsg && <span className="text-[#10b981] text-[11px] font-mono flex items-center gap-1.5 animate-pulse"><CheckCircle2 className="w-4 h-4" /> Settings Saved.</span>}
                </div>
              </motion.div>
            )}

            {/* --- STORES TAB --- */}
            {activeTab === "stores" && (
              <motion.div key="stores" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex flex-col gap-5 h-full">
                <div className="flex items-center justify-between mb-2 border-b border-[#2d3440] pb-4">
                  <h3 className="text-sm font-mono font-bold text-white uppercase tracking-widest">Store Locations</h3>
                  <button className="flex items-center gap-2 bg-[#11141a] border border-[#2d3440] hover:border-[#00F0FF]/50 text-[#00F0FF] px-4 py-1.5 rounded text-[10px] font-mono font-bold uppercase tracking-widest transition-colors">
                    <Plus className="w-3.5 h-3.5" /> Add Store
                  </button>
                </div>

                <div className="grid gap-3">
                  {storesData.map(s => (
                    <div key={s.id} className="grid grid-cols-[1fr_2fr_100px_80px_100px] gap-4 items-center p-4 bg-[#11141a] border border-[#2d3440] rounded-lg hover:border-[#2d3440]/80 transition-colors">
                      <span className="text-[12px] font-mono font-bold text-white uppercase truncate">{s.name}</span>
                      <span className="text-[10px] font-mono text-[#8c9baf] truncate flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-[#2d3440]" /> {s.location}</span>
                      <span className="text-[10px] font-mono text-[#8c9baf] text-center bg-black/30 py-1 rounded border border-[#2d3440]/50">{s.cameras} Cameras</span>
                      <div className="flex justify-center">
                        <div className={`w-10 h-5 rounded-full p-1 relative transition-colors ${s.status ? 'bg-[#10b981]/20' : 'bg-[#2d3440]'}`}>
                          <div className={`w-3 h-3 rounded-full absolute top-1 transition-all ${s.status ? 'bg-[#10b981] left-[22px]' : 'bg-[#8c9baf] left-1'}`} />
                        </div>
                      </div>
                      <div className="flex gap-2 justify-end">
                        <button className="p-1.5 text-[#8c9baf] hover:text-[#00F0FF] transition-colors"><Edit2 className="w-3.5 h-3.5" /></button>
                        <button className="p-1.5 text-[#8c9baf] hover:text-white transition-colors"><Video className="w-3.5 h-3.5" /></button>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* --- CAMERAS TAB --- */}
            {activeTab === "cameras" && (
              <motion.div key="cameras" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex flex-col gap-5 h-full">
                <div className="flex items-center justify-between mb-2 border-b border-[#2d3440] pb-4">
                  <h3 className="text-sm font-mono font-bold text-white uppercase tracking-widest flex items-center gap-2">
                    Video Sources <span className="bg-[#2d3440] text-[9px] px-2 py-0.5 rounded-full text-[#8c9baf]">11/12 ACTIVE</span>
                  </h3>
                </div>

                <div className="grid gap-2 overflow-y-auto pr-2 custom-scrollbar flex-1 pb-4">
                  {camerasData.map(c => (
                    <div key={c.id} className={`grid grid-cols-[80px_1.5fr_1fr_100px_2fr_60px] gap-3 items-center p-3 rounded-md border transition-colors
                      ${c.status ? 'bg-[#11141a] border-[#2d3440]/60' : 'bg-[#FF003C]/5 border-[#FF003C]/30 grayscale-[0.8] opacity-60'}
                    `}>
                      <span className={`text-[10px] font-mono font-bold uppercase ${c.status ? 'text-white' : 'text-[#FF003C]'}`}>{c.id}</span>
                      <span className="text-[11px] font-mono text-[#8c9baf] truncate flex items-center gap-1.5">
                        {c.status ? <Video className="w-3 h-3 text-[#2d3440]" /> : <EyeOff className="w-3 h-3 text-[#FF003C]" />} 
                        {c.name}
                      </span>
                      <span className="text-[9px] font-mono text-[#8c9baf] truncate uppercase">{c.store}</span>
                      <span className="text-[9px] font-mono text-[#00F0FF] bg-[#00F0FF]/10 px-2 py-0.5 rounded text-center truncate">{c.zone}</span>
                      
                      <div className="flex gap-1 flex-wrap">
                        {c.modules.map(m => (
                          <span key={m} className="text-[8px] font-mono text-[#8c9baf] border border-[#2d3440] rounded px-1.5 py-0.5 truncate max-w-[100px]">{m}</span>
                        ))}
                      </div>

                      <div className="flex justify-end">
                        <div className={`w-8 h-4 rounded-full p-0.5 relative transition-colors ${c.status ? 'bg-[#10b981]/20' : 'bg-[#FF003C]/20'}`}>
                          <div className={`w-3 h-3 rounded-full absolute top-[2px] transition-all ${c.status ? 'bg-[#10b981] left-[18px]' : 'bg-[#FF003C] left-[2px]'}`} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* --- USERS TAB --- */}
            {activeTab === "users" && (
              <motion.div key="users" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex flex-col gap-5 h-full">
                <div className="flex items-center justify-between mb-2 border-b border-[#2d3440] pb-4">
                  <h3 className="text-sm font-mono font-bold text-white uppercase tracking-widest">Directory</h3>
                  <button className="flex items-center gap-2 bg-[#11141a] border border-[#2d3440] hover:border-[#00F0FF]/50 text-[#00F0FF] px-4 py-1.5 rounded text-[10px] font-mono font-bold uppercase tracking-widest transition-colors">
                    <UserCheck className="w-3.5 h-3.5" /> Invite User
                  </button>
                </div>

                <div className="grid gap-3">
                  {usersData.map((u, i) => {
                    // Quick coloring for roles
                    let roleStyle = "text-[#8c9baf] border-[#2d3440] bg-transparent";
                    if (u.role === "Super Admin") roleStyle = "text-[#FF003C] border-[#FF003C]/30 bg-[#FF003C]/5";
                    if (u.role === "Store Manager") roleStyle = "text-[#a855f7] border-[#a855f7]/30 bg-[#a855f7]/5";
                    if (u.role === "Analyst") roleStyle = "text-[#00F0FF] border-[#00F0FF]/30 bg-[#00F0FF]/5";
                    
                    return (
                      <div key={u.id} className="grid grid-cols-[200px_1.5fr_1fr_100px_80px] gap-4 items-center p-3 border-b border-[#2d3440]/50 hover:bg-white/[0.02] transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-[#2d3440] flex items-center justify-center text-[10px] font-black font-display text-white">
                            {u.name.split(' ').map(n=>n[0]).join('')}
                          </div>
                          <span className="text-[12px] font-mono font-bold text-white uppercase truncate">{u.name}</span>
                        </div>
                        <span className="text-[11px] font-mono text-[#8c9baf] truncate">{u.email}</span>
                        <div>
                          <span className={`inline-flex px-2 py-0.5 rounded text-[9px] font-mono uppercase tracking-wider border ${roleStyle}`}>
                            {u.role}
                          </span>
                        </div>
                        <span className="text-[9px] font-mono text-[#8c9baf]/60 truncate italic">{u.lastActive}</span>
                        <div className="flex gap-2 justify-end">
                          <button className="p-1.5 text-[#8c9baf] hover:text-[#00F0FF] transition-colors"><Edit2 className="w-3.5 h-3.5" /></button>
                          {u.role !== "Super Admin" && <button className="p-1.5 text-[#8c9baf] hover:text-[#FF003C] transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </motion.div>
            )}

            {/* --- NOTIFICATIONS TAB --- */}
            {activeTab === "notifications" && (
              <motion.div key="notifications" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex flex-col gap-5 h-full max-w-2xl">
                <div className="flex items-center justify-between mb-2 border-b border-[#2d3440] pb-4">
                  <div>
                    <h3 className="text-sm font-mono font-bold text-white uppercase tracking-widest">Alert Preferences</h3>
                    <p className="text-[#8c9baf] text-[10px] font-mono mt-1">Configure which modules can push notifications and summarize data.</p>
                  </div>
                </div>

                <div className="flex flex-col gap-0 border border-[#2d3440] rounded-xl overflow-hidden bg-[#11141a]">
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
                    <div key={i} className={`flex items-center justify-between p-4 ${i !== 7 ? 'border-b border-[#2d3440]/50' : ''}`}>
                      <div className="flex flex-col gap-1">
                        <span className="text-[11px] font-mono font-bold text-white uppercase tracking-wide">{row.title}</span>
                        <span className="text-[10px] font-mono text-[#8c9baf]">{row.desc}</span>
                      </div>
                      <div className={`w-10 h-5 rounded-full p-1 relative transition-colors cursor-pointer ${row.def ? 'bg-[#00F0FF]/30' : 'bg-[#2d3440]'}`}>
                        <div className={`w-3 h-3 rounded-full absolute top-1 transition-all shadow-md ${row.def ? 'bg-[#00F0FF] left-[24px]' : 'bg-[#8c9baf] left-1'}`} />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex gap-4 mt-6">
                  <button onClick={triggerSave} className="flex items-center gap-2 bg-[#00F0FF] text-black px-6 py-2.5 rounded text-[11px] font-mono font-bold uppercase tracking-widest hover:bg-[#00F0FF]/80 transition-colors">
                    <Save className="w-4 h-4" /> Save Preferences
                  </button>
                  {savedMsg && <span className="text-[#00F0FF] text-[11px] font-mono flex items-center gap-1.5 animate-pulse"><CheckCircle2 className="w-4 h-4" /> Saved.</span>}
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}
