import { useState, useRef, useCallback, useEffect } from "react";
import { Shield, Globe, Menu, X, ChevronDown, ChevronRight } from "lucide-react";
import {
  Eye, Package, RefreshCw, ShieldOff, Flame, Thermometer,
  BarChart3, Footprints, HardHat, CheckSquare,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate, useLocation } from "react-router-dom";

// ── Capabilities data ──
const capabilityCategories = [
  {
    label: "Loss Prevention",
    features: [
      { icon: Eye, title: "Concealment Gesture AI", slug: "theft-prevention", desc: "Detect shoplifting gestures like hiding merchandise in bags, pockets, or clothing using real-time pose estimation and behavioral analysis.", desc2: "Our proprietary model trained on 50,000+ retail theft scenarios achieves 94% accuracy with under 2% false positive rate." },
      { icon: Package, title: "POS Fraud Detection", slug: "pos-fraud", desc: "Identify sweethearting, pass-arounds, and no-scan events by correlating camera feeds with POS transaction data in real time.", desc2: "Integrates with all major POS systems. Flags discrepancies instantly and logs video evidence for review." },
      { icon: RefreshCw, title: "People Re-Identification", slug: "people-reid", desc: "Track flagged individuals across multiple camera zones without facial recognition — using gait, silhouette, and clothing features.", desc2: "Privacy-compliant re-identification that works across stores, floors, and time windows up to 72 hours." },
      { icon: ShieldOff, title: "Unauthorized Zone Access", slug: "unauthorized-access", desc: "Detect unauthorized personnel entering restricted areas like stock rooms, server rooms, or staff-only zones.", desc2: "Configurable zone boundaries with instant alerts to security teams via app, SMS, or WhatsApp." },
    ],
  },
  {
    label: "Customer Intelligence",
    features: [
      { icon: BarChart3, title: "Customer Heat Maps", slug: "customer-analytics", desc: "Visualize foot traffic density across your store floor in real time with zone-level granularity.", desc2: "Identify dead zones, optimize product placement, and measure campaign impact with historical heat map comparisons." },
      { icon: Footprints, title: "Footfall Analytics", slug: "footfall-analytics", desc: "Accurate bi-directional people counting at every entry and exit point, with hourly and daily trend analysis.", desc2: "Compare across stores, correlate with weather and promotions, and forecast staffing needs automatically." },
    ],
  },
  {
    label: "Staff Operations",
    features: [
      { icon: HardHat, title: "Staff Zone Monitoring", slug: "staff-monitor", desc: "Track staff presence across assigned zones and flag deviations from scheduled floor coverage in real time.", desc2: "Shift-level compliance scoring helps managers optimize rosters and identify training gaps." },
      { icon: CheckSquare, title: "Task Verification AI", slug: "task-verification", desc: "Verify completion of operational tasks like shelf restocking, cleaning, and display setup using visual confirmation.", desc2: "Replace manual checklists with automated verification. Photo evidence logged for audit trails." },
    ],
  },
  {
    label: "Fire & Safety",
    features: [
      { icon: Flame, title: "AI Fire & Smoke Detection", slug: "fire-detection", desc: "Detect real fire and smoke with 97%+ accuracy, distinguishing from steam, cigarettes, and cooking vapors.", desc2: "Sub-3-second detection time. Integrates with building fire alarm and sprinkler systems for automated response." },
      { icon: Thermometer, title: "Thermal Anomaly Detection", slug: "thermal-detection", desc: "Monitor electrical panels, server rooms, and equipment for overheating using thermal camera integration.", desc2: "Predictive alerts before equipment failure. Reduce fire risk and unplanned downtime by up to 80%." },
    ],
  },
];

// ── Solutions data ──
const solutionCategories = [
  {
    label: "Fashion & Apparel",
    features: [
      { icon: Eye, title: "Fitting Room Monitoring", slug: "fitting-room-configuration", desc: "Track fitting room occupancy and dwell time. Detect concealment attempts without compromising privacy.", desc2: "Reduce fitting room shrinkage by up to 45% with non-invasive behavioral AI." },
      { icon: BarChart3, title: "Visual Merchandising Analytics", slug: "visual-merchandising-analytics", desc: "Measure customer engagement with displays, mannequins, and promotional setups using attention heat maps.", desc2: "A/B test store layouts and measure ROI on visual merchandising investments." },
    ],
    stat: "58% shrinkage reduction for a Mumbai fashion chain in 30 days.",
    solutionSlug: "fashion",
  },
  {
    label: "Supermarkets",
    features: [
      { icon: Package, title: "Self-Checkout Fraud Prevention", slug: "checkout-&-pos-integration", desc: "Detect scan-avoidance, barcode switching, and pass-around fraud at self-checkout stations.", desc2: "Real-time alerts to attendants with video evidence. Reduces self-checkout losses by 62%." },
      { icon: Footprints, title: "Aisle Traffic Optimization", slug: "aisle-&-traffic-calibration", desc: "Understand traffic flow patterns to optimize product placement and reduce congestion at peak hours.", desc2: "Data-driven planogram recommendations based on actual customer movement patterns." },
    ],
    stat: "₹1.2Cr annual savings for a 14-store grocery chain.",
    solutionSlug: "supermarkets",
  },
  {
    label: "Cafes & QSR",
    features: [
      { icon: HardHat, title: "Service Speed Monitoring", slug: "station-camera-setup", desc: "Track order-to-serve time using camera-based queue analysis and kitchen activity monitoring.", desc2: "Identify bottlenecks and optimize staffing during peak hours." },
      { icon: CheckSquare, title: "Hygiene Compliance", slug: "workflow-calibration", desc: "Verify handwashing, glove usage, and food handling compliance using visual AI.", desc2: "Automated FSSAI compliance logging with photo evidence." },
    ],
    stat: "22% faster service times across 8 QSR outlets.",
    solutionSlug: "qsr",
  },
  {
    label: "Warehouses",
    features: [
      { icon: ShieldOff, title: "Perimeter Security", slug: "perimeter-&-fire-sensor-deployment", desc: "24/7 perimeter monitoring with intrusion detection and vehicle tracking across loading docks.", desc2: "Integrates with access control systems for automated gate management." },
      { icon: Flame, title: "Fire & Hazard Prevention", slug: "industrial-calibration", desc: "Thermal monitoring of electrical panels, machinery, and stored goods for fire prevention.", desc2: "Warehouse-specific fire detection trained on industrial smoke and chemical vapor patterns." },
    ],
    stat: "Zero fire incidents across 6 warehouses in 18 months.",
    solutionSlug: "warehousing",
  },
  {
    label: "Electronics",
    features: [
      { icon: Eye, title: "High-Value Item Protection", slug: "high-value-zone-coverage", desc: "Concealment detection optimized for small, high-value electronics items.", desc2: "Combined with POS fraud matching and People Re-ID for comprehensive loss prevention." },
      { icon: Package, title: "POS Fraud Detection", slug: "product-specific-calibration", desc: "Transaction-to-video correlation catches sweethearting and scan-skip at electronics checkout.", desc2: "Integrates with all major POS systems with timestamped video evidence." },
    ],
    stat: "73% shrinkage reduction for a multi-store electronics chain.",
    solutionSlug: "electronics",
  },
  {
    label: "Hotels",
    features: [
      { icon: Footprints, title: "Guest Flow Analytics", slug: "multi-zone-camera-setup", desc: "Understand guest movement across lobby, restaurants, pool, and event spaces for operational optimization.", desc2: "Anonymized analytics help optimize staffing and service placement." },
      { icon: Flame, title: "Kitchen Fire Safety", slug: "service-pattern-calibration", desc: "Real-time fire and smoke detection in commercial kitchens, distinguishing cooking smoke from actual fire.", desc2: "Integrates with kitchen suppression systems for sub-5-second automated response." },
    ],
    stat: "40% improvement in guest service response times.",
    solutionSlug: "hospitality",
  },
];

type MegaMenuType = "capabilities" | "solutions" | null;

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeMenu, setActiveMenu] = useState<MegaMenuType>(null);
  const [activeCatIdx, setActiveCatIdx] = useState(0);
  const [activeFeatureIdx, setActiveFeatureIdx] = useState(0);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mobileRef = useRef<HTMLDivElement>(null);

  const categories = activeMenu === "capabilities" ? capabilityCategories : activeMenu === "solutions" ? solutionCategories : [];
  const activeCategory = categories[activeCatIdx] || categories[0];
  const activeFeature = activeCategory?.features[activeFeatureIdx] || activeCategory?.features[0];

  const openMenu = useCallback((menu: MegaMenuType) => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setActiveMenu(menu);
    setActiveCatIdx(0);
    setActiveFeatureIdx(0);
  }, []);

  const scheduleClose = useCallback(() => {
    closeTimer.current = setTimeout(() => setActiveMenu(null), 100);
  }, []);

  const cancelClose = useCallback(() => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
  }, []);

  const isActive = (path: string) => location.pathname === path || location.pathname.startsWith(path + "/");

  // Close mobile menu on outside click
  useEffect(() => {
    if (!mobileOpen) return;
    const handler = (e: MouseEvent) => {
      if (mobileRef.current && !mobileRef.current.contains(e.target as Node)) {
        setMobileOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [mobileOpen]);

  // Close mobile on route change
  useEffect(() => { setMobileOpen(false); }, [location.pathname]);

  const navLinks = [
    { label: "Deployments", to: "/case-studies" },
    { label: "Systems", to: "/company" },
  ];

  const megaMenuItems = [
    { label: "Frameworks", menu: "capabilities" as MegaMenuType },
    { label: "Sectors", menu: "solutions" as MegaMenuType },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 pointer-events-none" ref={mobileRef}>
      <div className="border-b border-white/10 bg-[#000000]/90 backdrop-blur-md pointer-events-auto">
        <div className="mx-auto flex max-w-[1400px] items-center justify-between px-4 py-3 md:px-8 md:py-4">
          
          {/* Logo (Tactical) */}
          <Link to="/" className="flex items-center gap-3 group relative">
            <div className="relative flex items-center justify-center w-8 h-8 bg-white text-black shrink-0 shadow-[0_0_15px_rgba(255,255,255,0.3)]">
              <Shield className="w-5 h-5 group-hover:scale-110 transition-transform duration-500" />
            </div>
            <span className="text-xl md:text-2xl font-black text-white tracking-widest uppercase mt-1" style={{ fontFamily: "'Chakra Petch', sans-serif" }}>
              VSN-IQ
            </span>
          </Link>

          {/* Center Nav — desktop */}
          <div className="hidden items-center gap-1 lg:flex border border-white/10 bg-[#0A0A0A] px-2 h-12 relative">
            {/* Nav Corners */}
            <div className="absolute top-0 left-0 w-1.5 h-1.5 border-t border-l border-white/40" />
            <div className="absolute top-0 right-0 w-1.5 h-1.5 border-t border-r border-white/40" />
            <div className="absolute bottom-0 left-0 w-1.5 h-1.5 border-b border-l border-white/40" />
            <div className="absolute bottom-0 right-0 w-1.5 h-1.5 border-b border-r border-white/40" />

            {megaMenuItems.map((item) => (
              <button
                key={item.label}
                className={`flex items-center gap-2 px-5 py-2 text-[11px] font-bold tracking-[0.1em] uppercase transition-colors ${
                  activeMenu === item.menu || (isActive("/capabilities") && item.menu === "capabilities")
                    ? "text-white bg-white/5"
                    : "text-gray-500 hover:text-white hover:bg-white/5"
                }`}
                onMouseEnter={() => openMenu(item.menu)}
                onMouseLeave={scheduleClose}
              >
                [{item.label}]
                <ChevronDown className={`h-3 w-3 transition-transform ${activeMenu === item.menu ? "rotate-180" : ""}`} />
              </button>
            ))}
            <div className="w-px h-6 bg-white/10 mx-2" />
            {navLinks.map((item) => (
              <Link
                key={item.label}
                to={item.to}
                className={`flex items-center gap-2 px-5 py-2 text-[11px] font-bold tracking-[0.1em] uppercase transition-colors ${
                  isActive(item.to) ? "text-white bg-white/5" : "text-gray-500 hover:text-white hover:bg-white/5"
                }`}
              >
                [{item.label}]
              </Link>
            ))}
          </div>

          {/* Right — desktop */}
          <div className="hidden items-center gap-4 lg:flex">
            <div className="text-[10px] font-mono text-gray-500 uppercase flex flex-col items-end leading-tight tracking-[0.2em] select-none">
              <span>SYS.ONLINE</span>
              <span className="text-white/40">v4.2.0</span>
            </div>
            <Link to="/dashboard">
              <Button className="rounded-none bg-white text-black hover:bg-gray-200 h-10 px-6 text-xs font-bold font-mono tracking-widest uppercase border border-white shadow-[0_0_10px_rgba(255,255,255,0.2)]">
                Initialize_
              </Button>
            </Link>
          </div>

          {/* Mobile toggle */}
          <button className="flex h-10 w-10 items-center justify-center border border-white/20 bg-[#0A0A0A] text-white lg:hidden pointer-events-auto" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mega Menu Dropdown — desktop */}
      <AnimatePresence>
        {activeMenu && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
            className="absolute left-0 right-0 border-b border-white/20 bg-[#050505] shadow-[0_20px_50px_rgba(0,0,0,0.5)] hidden lg:block pointer-events-auto"
            onMouseEnter={cancelClose}
            onMouseLeave={scheduleClose}
          >
            <div className="mx-auto grid max-w-[1400px] grid-cols-[260px_1fr_1fr] gap-0 px-8 py-0">
              {/* LEFT */}
              <div className="border-r border-white/10 py-6 pr-4 bg-[#0A0A0A]/50">
                <p className="mb-4 px-3 text-[10px] font-bold uppercase tracking-[0.2em] text-white/40 font-mono">
                  {activeMenu === "capabilities" ? "// Module Classes" : "// Industry Matrices"}
                </p>
                {categories.map((cat, i) => (
                  <button
                    key={cat.label}
                    onMouseEnter={() => { setActiveCatIdx(i); setActiveFeatureIdx(0); }}
                    className={`flex w-full items-center justify-between px-4 py-3 text-xs font-bold uppercase tracking-widest transition-all whitespace-nowrap ${
                      activeCatIdx === i ? "bg-white text-black" : "text-gray-400 hover:bg-white/5 hover:text-white"
                    }`}
                  >
                    {cat.label}
                    <ChevronRight className={`h-4 w-4 shrink-0 ${activeCatIdx === i ? "opacity-100" : "opacity-0 -translate-x-2 transition-all"}`} />
                  </button>
                ))}
              </div>

              {/* MIDDLE */}
              <div className="border-r border-white/10 py-6 px-6">
                <p className="mb-4 text-[10px] font-bold uppercase tracking-[0.2em] text-white/40 font-mono">// Engagements</p>
                <div className="space-y-1">
                  {activeCategory?.features.map((feat, i) => {
                    const Icon = feat.icon;
                    return (
                      <button
                        key={feat.title}
                        onMouseEnter={() => setActiveFeatureIdx(i)}
                        onClick={() => {
                          if ("slug" in feat && feat.slug) {
                            setActiveMenu(null);
                            if (activeMenu === "solutions") {
                              const sCat = activeCategory as any;
                              navigate(`/solutions/${sCat.solutionSlug}#${feat.slug}`);
                            } else {
                              navigate(`/capabilities/${feat.slug}`);
                            }
                          }
                        }}
                        className={`group flex w-full items-center gap-4 border border-transparent px-4 py-4 text-left transition-all ${
                          activeFeatureIdx === i ? "bg-[#0A0A0A] border-white/20" : "hover:bg-white/5"
                        }`}
                      >
                        <div className={`p-2 shrink-0 border ${activeFeatureIdx === i ? "bg-white text-black border-white" : "bg-black text-gray-500 border-white/10 group-hover:text-white group-hover:border-white/30"}`}>
                          <Icon className="h-4 w-4" />
                        </div>
                        <span className={`text-sm font-black uppercase font-[Chakra Petch] tracking-wide ${activeFeatureIdx === i ? "text-white" : "text-gray-400 group-hover:text-white"}`}>
                          {feat.title}
                        </span>
                        <ChevronRight className={`ml-auto h-4 w-4 text-white/20 transition-transform ${activeFeatureIdx === i ? "translate-x-1 opacity-100 text-white" : "opacity-0"}`} />
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* RIGHT */}
              <div className="py-6 pl-8 bg-[linear-gradient(90deg,transparent_0%,rgba(255,255,255,0.02)_100%)]">
                {activeFeature && (
                  <motion.div
                    key={activeFeature.title}
                    initial={{ opacity: 0, x: 8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.15 }}
                    className="flex h-full flex-col relative"
                  >
                    <div className="absolute top-0 right-0 w-16 h-16 border-t border-r border-white/10 pointer-events-none" />
                    
                    <div className="flex items-center gap-3 mb-4 mt-2">
                      <div className="p-2 border border-white/30 bg-white/5 text-white">
                        <activeFeature.icon className="h-5 w-5" />
                      </div>
                      <h4 className="text-xl font-black text-white uppercase tracking-widest font-[Chakra Petch]">{activeFeature.title}</h4>
                    </div>
                    
                    <div className="w-12 h-px bg-white/20 mb-6" />
                    
                    <p className="text-sm font-medium text-gray-400 mb-4 leading-relaxed">{activeFeature.desc}</p>
                    <p className="text-sm font-medium text-gray-500 mb-8 leading-relaxed">{activeFeature.desc2}</p>
                    
                    {activeMenu === "solutions" && "stat" in activeCategory && (
                      <div className="border border-white/20 bg-black p-4 mb-6 relative">
                        <div className="absolute top-0 left-0 w-2 h-2 bg-white" />
                        <p className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-gray-500 mb-2">// FIELD REPORT</p>
                        <p className="text-sm font-bold text-white uppercase">{String((activeCategory as any).stat)}</p>
                      </div>
                    )}
                    
                    <div className="mt-auto flex flex-col gap-3 pb-2">
                      {"slug" in activeFeature && activeFeature.slug && (
                        <Link
                          to={activeMenu === "solutions" 
                            ? `/solutions/${(activeCategory as any).solutionSlug}#${activeFeature.slug}`
                            : `/capabilities/${activeFeature.slug}`}
                          onClick={() => setActiveMenu(null)}
                          className="group flex items-center gap-2 text-[11px] font-mono font-bold text-gray-400 hover:text-white uppercase tracking-[0.2em]"
                        >
                          [ ENGAGE PROTOCOL ] <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                        </Link>
                      )}
                      {activeMenu === "solutions" && "solutionSlug" in activeCategory && (
                        <Link
                          to={`/solutions/${String((activeCategory as any).solutionSlug)}`}
                          onClick={() => setActiveMenu(null)}
                          className="group flex items-center gap-2 text-[11px] font-mono font-bold text-gray-500 hover:text-white uppercase tracking-[0.2em]"
                        >
                          [ VIEW SECTOR LOGS ] <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                        </Link>
                      )}
                    </div>
                  </motion.div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile menu — full-screen overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: "-100%" }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: "-100%" }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="fixed inset-0 top-0 z-[100] flex flex-col bg-[#050505] lg:hidden pointer-events-auto"
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-black">
              <Link to="/" className="flex items-center gap-3" onClick={() => setMobileOpen(false)}>
                <div className="flex items-center justify-center w-8 h-8 bg-white text-black shrink-0">
                  <Shield className="w-5 h-5" />
                </div>
                <span className="text-xl font-black text-white tracking-widest uppercase mt-1" style={{ fontFamily: "'Chakra Petch', sans-serif" }}>
                  VSN-IQ
                </span>
              </Link>
              <button className="flex h-10 w-10 items-center justify-center border border-white/20 bg-black text-white" onClick={() => setMobileOpen(false)}>
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex-1 flex flex-col items-center justify-center gap-4 px-6 relative mt-16">
              <div className="absolute inset-0 z-0 pointer-events-none opacity-[0.03]" style={{ backgroundImage: `linear-gradient(rgba(255, 255, 255, 1) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 1) 1px, transparent 1px)`, backgroundSize: '40px 40px' }} />
              
              {[
                { label: "Home", to: "/" },
                { label: "Frameworks", to: "/capabilities/theft-prevention" },
                { label: "Sectors", to: "/solutions" },
                { label: "Deployments", to: "/case-studies" },
                { label: "Systems", to: "/company" },
              ].map((item, i) => (
                <Link
                  key={item.label}
                  to={item.to}
                  onClick={() => setMobileOpen(false)}
                  className={`w-full text-center py-4 text-2xl font-black uppercase tracking-widest font-[Chakra Petch] border border-white/10 bg-black/50 transition-colors flex items-center justify-center z-10 ${
                    isActive(item.to) ? "text-white border-white/40 shadow-[0_0_15px_rgba(255,255,255,0.1)]" : "text-gray-500 active:bg-white/5 active:text-white"
                  }`}
                >
                  <span className="mr-3 opacity-20 text-sm font-mono mt-1">{"0" + (i + 1)}</span>
                  {item.label}
                </Link>
              ))}
            </div>
            <div className="px-6 pb-12 pt-8 z-10">
              <Link to="/dashboard" onClick={() => setMobileOpen(false)} className="w-full block">
                <Button className="w-full rounded-none font-bold text-base h-16 bg-white text-black uppercase tracking-widest font-[Chakra Petch]">
                  [ Initialize Dashboard ]
                </Button>
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
