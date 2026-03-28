import { ReactNode, useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutGrid,
  ShieldAlert,
  UserCheck,
  Flame,
  Bell,
  Activity,
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
  },
  {
    icon: <ShieldAlert className="w-4 h-4" />,
    path: "/dashboard/threat-monitor",
    label: "Threat Monitor",
  },
  {
    icon: <Flame className="w-4 h-4" />,
    path: "/dashboard/safety",
    label: "Safety Sentinel",
  },
  {
    icon: <UserCheck className="w-4 h-4" />,
    path: "/dashboard/kiosk",
    label: "Employee Kiosk",
  },
  {
    icon: <BarChart3 className="w-4 h-4" />,
    path: "/dashboard/customer-analytics",
    label: "Customer Analytics",
  },
  {
    icon: <Bell className="w-4 h-4" />,
    path: "/dashboard/alerts",
    label: "Alerts Center",
    badge: 3,
  },
  {
    icon: <Settings className="w-4 h-4" />,
    path: "/dashboard/settings",
    label: "Settings",
  },
];

function WatchrLogo() {
  return (
    <Link to="/dashboard" className="flex items-center gap-3 overflow-hidden mr-4">
      <div className="relative w-9 h-9 flex-shrink-0">
        <div className="w-9 h-9 rounded-xl bg-[var(--accent)] text-black flex items-center justify-center shadow-[0_0_20px_rgba(198,241,53,0.3)]">
          <span className="text-xl font-black font-display tracking-tighter select-none">V</span>
        </div>
      </div>
      <div className="flex flex-col justify-center gap-1">
        <p className="text-sm font-black font-display tracking-[0.2em] text-[var(--text-primary)] leading-none">WATCHR</p>
      </div>
    </Link>
  );
}

function NavItem({
  link,
  isActive,
}: {
  link: (typeof SIDEBAR_LINKS)[0];
  isActive: boolean;
}) {
  return (
    <Link
      to={link.path}
      className={`relative flex items-center gap-2 px-4 py-2.5 rounded-full transition-all duration-200 whitespace-nowrap
        ${isActive
          ? "bg-[color-mix(in_srgb,var(--accent)_15%,transparent)] text-[var(--accent)]"
          : "bg-[color-mix(in_srgb,var(--bg-base)_50%,transparent)] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[color-mix(in_srgb,white_5%,transparent)]"
        }`}
    >
      <span className="flex-shrink-0">{link.icon}</span>
      <span className="text-xs font-bold tracking-wide">{link.label}</span>
      
      {link.badge && (
        <span className="ml-1.5 flex-shrink-0 min-w-[20px] h-[20px] rounded-full bg-[var(--accent)] text-black flex items-center justify-center text-[10px] font-bold font-jetbrains shadow-[0_0_10px_rgba(198,241,53,0.4)]">
          {link.badge}
        </span>
      )}
    </Link>
  );
}



export const WatchrShell = ({ children }: WatchrShellProps) => {
  const location = useLocation();

  return (
    <div className="flex flex-col h-screen bg-[var(--bg-base)] text-[var(--text-primary)] overflow-hidden selection:bg-[color-mix(in_srgb,var(--accent)_30%,transparent)]">
      
      {/* TOP NAVIGATION BAR */}
      <header className="w-full flex items-center px-6 py-4 border-b border-[var(--border)] bg-[var(--bg-card)] flex-shrink-0 z-40 relative">
        <div className="flex items-center w-full">
          <WatchrLogo />
          
          <nav className="flex items-center gap-2 overflow-x-auto no-scrollbar ml-4">
            {SIDEBAR_LINKS.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <NavItem key={link.path} link={link} isActive={isActive} />
              );
            })}
          </nav>
        </div>
      </header>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 relative overflow-auto flex flex-col min-w-0 w-full">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="flex-1 relative z-10 w-full h-full pb-20">
            {children}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
};
