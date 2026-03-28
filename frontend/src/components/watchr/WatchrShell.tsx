import { ReactNode, useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutGrid,
  Users,
  ShieldAlert,
  UserCheck,
  Flame,
  Bell,
  ChevronLeft,
  ChevronRight,
  Activity,
  Wifi,
  Cpu,
  BarChart3,
  Settings,
} from "lucide-react";

interface WatchrShellProps {
  children: ReactNode;
}

const SIDEBAR_LINKS = [
  {
    icon: <LayoutGrid className="w-4 h-4" />,
    path: "/dashboard",
    label: "Overview",
    sublabel: "Live Canvas",
    color: "#00F0FF",
  },
  {
    icon: <ShieldAlert className="w-4 h-4" />,
    path: "/dashboard/threat-monitor",
    label: "Threat Monitor",
    sublabel: "State Machine",
    color: "#FF003C",
  },
  {
    icon: <Flame className="w-4 h-4" />,
    path: "/dashboard/safety",
    label: "Safety Sentinel",
    sublabel: "Fire Detection",
    color: "#F59E0B",
  },
  {
    icon: <UserCheck className="w-4 h-4" />,
    path: "/dashboard/kiosk",
    label: "Employee Kiosk",
    sublabel: "Identity & Uniform",
    color: "#10b981",
  },
  {
    icon: <BarChart3 className="w-4 h-4" />,
    path: "/dashboard/customer-analytics",
    label: "Customer Analytics",
    sublabel: "Footfall & Demographics",
    color: "#a855f7",
  },
  {
    icon: <Bell className="w-4 h-4" />,
    path: "/dashboard/alerts",
    label: "Alerts Center",
    sublabel: "Unified Event Feed",
    color: "#f43f5e",
    badge: 3,
  },
  {
    icon: <Settings className="w-4 h-4" />,
    path: "/dashboard/settings",
    label: "Settings",
    sublabel: "Organization & Config",
    color: "#94a3b8",
  },
];

// Animated "V" logo
function WatchrLogo({ collapsed }: { collapsed: boolean }) {
  return (
    <motion.div layout className="flex items-center gap-3 px-4 overflow-hidden">
      {/* Glitch V icon */}
      <div className="relative w-9 h-9 flex-shrink-0">
        <div className="w-9 h-9 rounded-xl bg-white text-black flex items-center justify-center shadow-[0_0_20px_rgba(255,255,255,0.25)]">
          <span className="text-xl font-black font-display select-none">V</span>
        </div>
        {/* Glitch overlays */}
        <span className="absolute inset-0 flex items-center justify-center text-xl font-black font-display text-[#00F0FF] translate-x-[1.5px] mix-blend-exclusion opacity-80 select-none">V</span>
        <span className="absolute inset-0 flex items-center justify-center text-xl font-black font-display text-[#FF003C] -translate-x-[1.5px] mix-blend-exclusion opacity-80 select-none">V</span>
      </div>

      <AnimatePresence>
        {!collapsed && (
          <motion.div
            initial={{ opacity: 0, width: 0 }}
            animate={{ opacity: 1, width: "auto" }}
            exit={{ opacity: 0, width: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden whitespace-nowrap">
            <p className="text-sm font-black font-display tracking-[0.2em] text-white leading-none">WATCHR</p>
            <p className="text-[8px] font-mono text-[#8c9baf] tracking-[0.15em] mt-0.5">AI ENGINE v2.6</p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// Single sidebar nav item
function NavItem({
  link,
  isActive,
  collapsed,
}: {
  link: (typeof SIDEBAR_LINKS)[0];
  isActive: boolean;
  collapsed: boolean;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <motion.div layout className="relative w-full px-2">
      <Link
        to={link.path}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className={`relative flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group
          ${isActive
            ? "bg-white/8 text-white"
            : "text-[#8c9baf] hover:text-white hover:bg-white/4"
          }`}
      >
        {/* Active left bar */}
        {isActive && (
          <motion.div
            layoutId="activeBar"
            className="absolute -left-2 top-1/2 -translate-y-1/2 w-1 h-7 rounded-r-full"
            style={{
              background: link.color,
              boxShadow: `0 0 8px ${link.color}`,
            }}
            transition={{ type: "spring", stiffness: 500, damping: 35 }}
          />
        )}

        {/* Icon */}
        <span
          className="flex-shrink-0 transition-colors"
          style={{ color: isActive ? link.color : undefined }}>
          {link.icon}
        </span>

        {/* Label */}
        <AnimatePresence>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: "auto" }}
              exit={{ opacity: 0, width: 0 }}
              transition={{ duration: 0.18 }}
              className="overflow-hidden whitespace-nowrap flex-1 min-w-0">
              <p className="text-[11px] font-mono font-semibold leading-none">{link.label}</p>
              <p className="text-[8px] font-mono text-[#8c9baf]/70 mt-0.5 leading-none">{link.sublabel}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Badge */}
        {link.badge && (
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className={`flex-shrink-0 min-w-[18px] h-[18px] rounded-full bg-[#FF003C] flex items-center justify-center text-[8px] font-bold font-mono
              ${collapsed ? "absolute top-0.5 right-0.5" : ""}`}>
            {link.badge}
          </motion.div>
        )}
      </Link>

      {/* Tooltip for collapsed mode */}
      <AnimatePresence>
        {collapsed && hovered && (
          <motion.div
            initial={{ opacity: 0, x: -6 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -6 }}
            transition={{ duration: 0.15 }}
            className="absolute left-full top-1/2 -translate-y-1/2 ml-3 z-50 pointer-events-none">
            <div className="bg-[#11141a] border border-[#2d3440] rounded-lg px-3 py-2 whitespace-nowrap shadow-xl">
              <p className="text-[11px] font-mono text-white font-semibold">{link.label}</p>
              <p className="text-[8px] font-mono text-[#8c9baf] mt-0.5">{link.sublabel}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// System telemetry strip at sidebar bottom
function SysTelemetry({ collapsed }: { collapsed: boolean }) {
  const [fps, setFps] = useState(28);
  const [cpu, setCpu] = useState(34);

  useEffect(() => {
    const id = setInterval(() => {
      setFps(24 + Math.floor(Math.random() * 8));
      setCpu(28 + Math.floor(Math.random() * 20));
    }, 2500);
    return () => clearInterval(id);
  }, []);

  return (
    <div className={`px-3 py-3 border-t border-[#2d3440] flex flex-col gap-2.5 ${collapsed ? "items-center" : ""}`}>
      {/* Connection dot */}
      <div className={`flex items-center gap-2 ${collapsed ? "justify-center" : ""}`}>
        <motion.div animate={{ opacity: [1, 0.4, 1] }} transition={{ repeat: Infinity, duration: 1.6 }}
          className="w-1.5 h-1.5 rounded-full bg-[#10b981]" />
        <AnimatePresence>
          {!collapsed && (
            <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="text-[9px] font-mono text-[#10b981] uppercase tracking-widest">
              ENGINE LIVE
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      {/* FPS */}
      <div className={`flex items-center gap-2 ${collapsed ? "justify-center" : ""}`}>
        <Activity className="w-3 h-3 text-[#8c9baf] flex-shrink-0" />
        <AnimatePresence>
          {!collapsed && (
            <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="text-[9px] font-mono text-[#8c9baf]">
              {fps} FPS · YOLOv8n
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      {/* CPU */}
      <div className={`flex items-center gap-2 ${collapsed ? "justify-center" : ""}`}>
        <Cpu className="w-3 h-3 text-[#8c9baf] flex-shrink-0" />
        <AnimatePresence>
          {!collapsed && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="flex-1 flex items-center gap-2">
              <span className="text-[9px] font-mono text-[#8c9baf]">CPU</span>
              <div className="flex-1 h-1 bg-[#2d3440] rounded-full overflow-hidden">
                <motion.div className="h-full rounded-full bg-[#00F0FF]"
                  animate={{ width: `${cpu}%` }}
                  transition={{ duration: 0.6, ease: "easeOut" }} />
              </div>
              <span className="text-[9px] font-mono text-[#00F0FF]">{cpu}%</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export const WatchrShell = ({ children }: WatchrShellProps) => {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="flex h-screen bg-[#0a0c10] text-white overflow-hidden selection:bg-[#00F0FF]/30">
      {/* Tactical Sidebar */}
      <motion.aside
        layout
        animate={{ width: collapsed ? 64 : 220 }}
        transition={{ type: "spring", stiffness: 400, damping: 38 }}
        className="border-r border-[#2d3440] flex flex-col py-5 bg-[#050507] z-50 overflow-hidden relative flex-shrink-0">

        {/* Logo */}
        <div className="mb-6 flex-shrink-0">
          <WatchrLogo collapsed={collapsed} />
        </div>

        {/* Divider */}
        <div className="mx-3 mb-4 h-px bg-[#2d3440]" />

        {/* Nav */}
        <nav className="flex-1 flex flex-col gap-1 overflow-hidden">
          {SIDEBAR_LINKS.map((link) => {
            const isActive = location.pathname === link.path;
            return (
              <NavItem key={link.path} link={link} isActive={isActive} collapsed={collapsed} />
            );
          })}
        </nav>

        {/* System telemetry */}
        <SysTelemetry collapsed={collapsed} />

        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed(c => !c)}
          className="absolute -right-3 top-14 z-50 w-6 h-6 rounded-full bg-[#11141a] border border-[#2d3440] flex items-center justify-center text-[#8c9baf] hover:text-white hover:border-[#8c9baf] transition-all">
          {collapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
        </button>
      </motion.aside>

      {/* Main Content */}
      <main className="flex-1 relative overflow-hidden flex flex-col min-w-0">
        {/* Background atmosphere */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_20%_0%,rgba(0,240,255,0.025)_0%,transparent_60%)] pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_80%_100%,rgba(255,0,60,0.02)_0%,transparent_60%)] pointer-events-none" />
        <div
          className="absolute inset-0 opacity-[0.018] pointer-events-none"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
            backgroundSize: "40px 40px",
          }}
        />
        {/* Scanline */}
        <div className="scanline" />

        {/* Page content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className="flex-1 overflow-auto p-7 relative z-10 w-full h-full">
            {children}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
};
