import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { LogIn, Eye, XCircle, LogOut } from "lucide-react";
import { BaseCard } from "./components/DashboardUI";

export default function BehavioralStatePathVisualizer() {
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

  const steps = [
    {
      id: "SEQ_01",
      icon: LogIn,
      timeOffset: "9s",
      label: "Enters Store",
      sublabel: "Target tracked",
      status: "active",
    },
    {
      id: "SEQ_06",
      icon: Eye,
      timeOffset: "+4m 12s",
      label: "Browses Shelf",
      sublabel: "Extended dwell",
      status: "default",
    },
    {
      id: "VIOLATION_04",
      icon: XCircle,
      timeOffset: "+5m 58s",
      label: "Skips Billing",
      sublabel: "Sequence breach",
      status: "warning",
    },
    {
      id: "OUT_04",
      icon: LogOut,
      timeOffset: "+4m 35s",
      label: "Exits Location",
      sublabel: "Leaves unbilled",
      status: "default",
    },
  ];

  return (
    <div className="w-full mt-4">
      {/* Top divider */}
      <div className="w-full h-px bg-[var(--border)] mb-8 opacity-50" />

      {/* CSS keyframes */}
      <style>{`
        @keyframes borderPulse {
          0%, 100% { border-color: rgba(198,241,53,0.6); box-shadow: 0 0 12px rgba(198,241,53,0.15); }
          50%       { border-color: rgba(198,241,53,1); box-shadow: 0 0 20px rgba(198,241,53,0.3); }
        }
        @keyframes redBlink {
          0%, 49%   { opacity: 1; }
          50%, 100% { opacity: 0.2; }
        }
        @keyframes travelDot {
          0%   { left: 0%; opacity: 0; }
          5%   { opacity: 1; }
          95%  { opacity: 1; }
          100% { left: calc(66.6% - 8px); opacity: 0; }
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

      {/* HEADER ROW */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h2 className="text-white text-[13px] font-semibold uppercase tracking-wider mb-1">
            Behavioral State Path Visualizer
          </h2>
          <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-[0.15em]">
            Real-time sequence analysis
          </p>
        </div>
        <div
          className="px-3 py-1.5 rounded-full border border-[var(--border)] bg-[#111] transition-opacity"
          style={{ opacity: sessionOpacity, transitionDuration: '300ms' }}
        >
          <span className="text-[10px] font-black text-[var(--accent)] font-jetbrains uppercase tracking-widest">
            Active Session: #{sessionNum}
          </span>
        </div>
      </div>

      {/* TIMELINE AREA */}
      <div className="relative flex justify-between items-start pt-6 pb-2 px-10">
        {/* Connecting line */}
        <div className="absolute left-10 right-10 top-[50px] h-px z-0" style={{ backgroundColor: 'rgba(255,255,255,0.10)' }}>
          {/* Active green segment */}
          <div className="absolute left-0 top-0 h-full bg-[var(--accent)]" style={{ width: '66.6%', opacity: 0.35 }} />
          {/* Traveling dot */}
          <div
            className="travel-dot absolute top-[-0.5px] w-[8px] h-[2px] rounded-sm bg-[var(--accent)] shadow-[0_0_6px_var(--accent)]"
          />
        </div>

        {/* Nodes */}
        {steps.map((step, i) => {
          const isActive = step.status === "active";
          const isWarning = step.status === "warning";
          const isDefault = step.status === "default";
          const Icon = step.icon;

          // Icon Box Styling
          let boxClasses = "w-[52px] h-[52px] rounded-xl flex items-center justify-center relative z-10 mx-auto ";
          let iconColor = "";

          if (isActive) {
            boxClasses += "border-[2px] border-[var(--accent)] bg-[color-mix(in_srgb,var(--accent)_8%,transparent)] node-active-box";
            iconColor = "var(--accent)";
          } else if (isWarning) {
            boxClasses += "border-[2px] border-[var(--negative)] bg-[color-mix(in_srgb,var(--negative)_8%,transparent)]";
            iconColor = "var(--negative)";
          } else {
            boxClasses += "border-[1px] border-[rgba(255,255,255,0.30)] bg-[rgba(255,255,255,0.06)]";
            iconColor = "#ffffff";
          }

          return (
            <motion.div
              key={step.id}
              className="flex flex-col items-center w-[140px]"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.28, ease: "easeOut", delay: i * 0.12 }}
            >
              {/* Box */}
              <div className={boxClasses}>
                <Icon size={22} color={iconColor} strokeWidth={isActive ? 2.5 : 2} />
              </div>

              {/* State Dot (Spacer for defaults to maintain height) */}
              <div className="h-4 flex items-center justify-center mt-2 mb-3">
                {isActive && <div className="w-1.5 h-1.5 rounded-full bg-[var(--accent)]" />}
                {isWarning && <div className="dot-blink w-1.5 h-1.5 rounded-full bg-[var(--negative)]" />}
              </div>

              {/* Text Fields (All identical styles globally) */}
              <span className="text-[10px] font-jetbrains font-bold text-white uppercase tracking-widest mb-1">
                {step.id}
              </span>
              <span className="text-[11px] text-[var(--text-muted)] font-medium mb-2.5">
                {step.timeOffset}
              </span>
              <span className="text-[15px] font-semibold tracking-tight text-white mb-1 whitespace-nowrap">
                {step.label}
              </span>
              <span className="text-[12px] text-[var(--text-muted)] italic leading-tight">
                {step.sublabel}
              </span>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
