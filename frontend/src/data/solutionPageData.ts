import {
  ShirtIcon, ShoppingCart, Coffee, Warehouse, Cpu, Hotel,
  Eye, Package, Lock, Footprints, Users, Activity,
  Target, Shield, FileText, Clock, TrendingUp, MapPin,
  CheckSquare, Bell, AlertTriangle, Thermometer, Flame,
  Smartphone, LayoutGrid, Gauge, Radio, Zap, HardHat,
  ClipboardCheck, UserSearch, RefreshCw
} from "lucide-react";

export interface SolutionStep {
  title: string;
  desc: string;
  link?: { text: string; href?: string };
}

export interface SolutionIncluded {
  icon: typeof Eye;
  title: string;
  desc: string;
}

export interface MonitorCategory {
  title: string;
  items: string[];
}

export interface SolutionPageData {
  badge: string;
  heroTitle: string;
  heroSub: string;
  ctaBtn: string;
  stats: { value: string; label: string }[];
  deepDiveBadge: string;
  deepDiveTitle: string;
  deepDiveBody: string[];
  deepDiveListTitle: string;
  deepDiveList: string[];
  pricing: { label: string; value: string }[];
  steps: SolutionStep[];
  whyBadge: string;
  whyTitle: string;
  whySub: string;
  whyCards: SolutionIncluded[];
  monitorBadge: string;
  monitorTitle: string;
  monitorCategories: MonitorCategory[];
  useCasesBadge: string;
  useCasesTitle: string;
  useCases: string[];
  howItWorksBadge: string;
  howItWorksTitle: string;
  howItWorksSub: string;
  howItWorksSteps: { title: string; desc: string }[];
  advantageBadge: string;
  advantageTitle: string;
  advantageBody: string;
  advantageBullets: string[];
  deliverables: string[];
  faqs: { q: string; a: string }[];
  bottomCTA: { title: string; sub: string; btn1: string; btn2: string };
  sectorCode: string;
}

export const solutionPages: Record<string, SolutionPageData> = {
  fashion: {
    badge: "FASHION & APPAREL",
    sectorCode: "SEC_FA_01",
    heroTitle: "Complete AI Intelligence for Fashion Retail",
    heroSub: "Track which designs attract attention, eliminate fitting room theft, and monitor staff performance across every floor.",
    ctaBtn: "Request Fashion Retail Demo →",
    stats: [
      { value: "58%", label: "Shrinkage Reduction" },
      { value: "22%", label: "Sales Lift from Layout Optimization" },
      { value: "14 Days", label: "To First Insight" },
    ],
    deepDiveBadge: "RETAIL INTELLIGENCE",
    deepDiveTitle: "Beyond Security: Fashion Retail as a Data Problem",
    deepDiveBody: [
      "Fashion retail loses more to organized theft than almost any other format — and fitting rooms remain the single biggest blind spot in traditional CCTV deployments.",
      "But VisionIQ treats your store as a data environment. Every customer interaction, every zone dwell, every staff movement is a signal that improves your operations and protects your margins.",
    ],
    deepDiveListTitle: "What VisionIQ Gives Fashion Retailers",
    deepDiveList: [
      "Heat maps of which designs attract the most customer attention",
      "Fitting room occupancy monitoring without privacy invasion",
      "Concealment gesture detection trained on apparel-specific theft patterns",
      "Staff zone compliance during high-traffic weekend shifts",
      "Demographic estimation to inform visual merchandising decisions",
    ],
    pricing: [
      { label: "Hardware", value: "From ₹85,000 per store" },
      { label: "SaaS", value: "From ₹12,000/month per store" },
      { label: "Deployment", value: "48 hours" },
    ],
    steps: [
      { title: "Pre-Deployment", desc: "Our team visits your flagship store, maps the floor, and identifies the top 5 theft vectors and top 3 engagement drop-off zones specific to your layout.", link: { text: "Get a Pre-Deployment Floor Check →" } },
      { title: "Fitting Room Configuration", desc: "VisionIQ monitors fitting room occupancy, dwell time, and exit behavior — without any in-room camera. Motion at entrance + POS matching catches concealment at exit." },
      { title: "Visual Merchandising Analytics", desc: "Over the first 30 days, dwell heat maps reveal which displays drive pickups, which kill conversion, and where to move slow inventory for maximum exposure." },
      { title: "Ongoing Shrinkage Reporting", desc: "Monthly report: ₹ value of incidents prevented, staff compliance scores, top risk zones, and comparison to previous month." },
    ],
    whyBadge: "WHY VISIONIQ FOR FASHION",
    whyTitle: "Why Choose VisionIQ for Fashion Retail?",
    whySub: "No other platform combines shrinkage prevention with merchandising intelligence in a single system.",
    whyCards: [
      { icon: Eye, title: "Fitting Room Protection", desc: "Occupancy + exit behavior monitoring without in-room cameras." },
      { icon: Target, title: "Design Performance Tracking", desc: "See which products customers pick up, examine, and replace." },
      { icon: AlertTriangle, title: "Organized Retail Crime Detection", desc: "Pattern recognition across multiple visits by the same individual." },
      { icon: Users, title: "Staff Deployment Optimization", desc: "Know exactly which zones are understaffed during peak hours." },
      { icon: Activity, title: "Demographic Merchandising", desc: "Align product placement with the actual customer profile visiting each zone." },
      { icon: FileText, title: "Compliance Documentation", desc: "Full incident log for insurance claims and loss audit requirements." },
    ],
    monitorBadge: "FULL COVERAGE",
    monitorTitle: "What VisionIQ Monitors in Fashion Retail",
    monitorCategories: [
      { title: "Store Entrance & Floor", items: ["Footfall counting with direction", "Demographic estimation", "Dwell time per zone", "Product interest detection"] },
      { title: "Fitting Rooms", items: ["Occupancy monitoring", "Extended dwell alerts", "Item count discrepancy", "Exit behavior classification"] },
      { title: "Checkout & POS", items: ["Self-checkout monitoring", "Scan-skip detection", "Cashier compliance", "Queue length + wait time"] },
      { title: "Staff & Operations", items: ["Zone assignment compliance", "Task completion verification", "Idle time flagging", "Shift performance scores"] },
    ],
    useCasesBadge: "IDEAL USE CASES",
    useCasesTitle: "Ideal For These Fashion Formats",
    useCases: ["Multi-brand flagship stores", "Single-brand outlet chains", "Mall anchor stores", "High street boutiques", "Discount/off-price outlets", "Luxury fashion boutiques"],
    howItWorksBadge: "IN DETAIL",
    howItWorksTitle: "How VisionIQ Works for Fashion Retail",
    howItWorksSub: "From first store visit to monthly intelligence report — a rigorous process that delivers measurable outcomes.",
    howItWorksSteps: [
      { title: "Scoping", desc: "Floor walk, blind spot mapping, module recommendation" },
      { title: "Installation", desc: "Edge cameras + AI processor, 6 hours average" },
      { title: "Shadow Mode", desc: "14 days learning your store patterns" },
      { title: "Go Live", desc: "Real-time alerts + dashboard access" },
      { title: "Monthly Review", desc: "Report + model optimization call" },
    ],
    advantageBadge: "THE VISIONIQ ADVANTAGE",
    advantageTitle: "What Sets Us Apart for Fashion Retail",
    advantageBody: "We bring deep retail operations expertise combined with cutting-edge computer vision — giving you both the AI capability and the store-floor context to act on it.",
    advantageBullets: [
      "Concealment model trained specifically on apparel theft patterns",
      "Fitting room protection without any in-room recording",
      "Heat map data formatted for visual merchandising decisions",
      "Staff performance data structured for HR review conversations",
      "Monthly reports in plain language — no data science degree required",
    ],
    deliverables: [
      "Risk heat map (within 48hrs of site visit)",
      "Deployment in 48 hours",
      "14-day calibration period",
      "Live dashboard + mobile alerts",
      "Monthly shrinkage report",
      "Quarterly model update",
      "Dedicated customer success manager",
    ],
    faqs: [
      { q: "Can VisionIQ detect fitting room theft without in-room cameras?", a: "Yes. We monitor fitting room entrances for occupancy, dwell time, and exit behavior. Combined with POS matching, this catches concealment without any invasive in-room surveillance." },
      { q: "How does demographic estimation work without facial recognition?", a: "We use silhouette analysis — body proportions, height, and movement patterns — to estimate age group and gender. No facial features are captured or stored." },
      { q: "What's the typical ROI timeline for a fashion retailer?", a: "Most fashion retailers see measurable shrinkage reduction within 30 days. Visual merchandising insights start delivering value within 14 days of calibration." },
      { q: "Can the system handle a store with 200+ SKUs on the floor?", a: "VisionIQ doesn't track individual SKUs — it tracks customer behavior, zone engagement, and staff compliance. It works regardless of SKU count." },
      { q: "How are staff performance reports shared with HR?", a: "Reports can be exported as PDF, emailed on schedule, or accessed via the dashboard with role-based permissions for HR teams." },
    ],
    bottomCTA: {
      title: "Ready to Prove Your Store's ROI?",
      sub: "Get a scoping call with our fashion retail team. We'll walk your store and provide a deployment plan and expected outcome projections.",
      btn1: "Request Fashion Retail Demo →",
      btn2: "View Case Studies →",
    },
  },

  supermarkets: {
    badge: "SUPERMARKETS & GROCERY",
    sectorCode: "SEC_GZ_02",
    heroTitle: "AI-Powered Intelligence for Supermarket Operations",
    heroSub: "From self-checkout fraud to aisle optimization — complete visibility across every square foot of your store.",
    ctaBtn: "Request Supermarket Demo →",
    stats: [
      { value: "62%", label: "Self-Checkout Loss Reduction" },
      { value: "₹1.2Cr", label: "Annual Savings (14-store chain)" },
      { value: "48hr", label: "Deployment Time" },
    ],
    deepDiveBadge: "SUPERMARKET INTELLIGENCE",
    deepDiveTitle: "Beyond Cameras: Supermarkets as Data Ecosystems",
    deepDiveBody: [
      "Supermarkets face a unique combination of challenges — high foot traffic, self-checkout fraud, aisle congestion, and perishable inventory management — all requiring real-time intelligence.",
      "VisionIQ transforms your camera network into an operational intelligence platform that prevents loss, optimizes layouts, and improves service speed simultaneously.",
    ],
    deepDiveListTitle: "What VisionIQ Gives Supermarkets",
    deepDiveList: [
      "Self-checkout scan-skip and barcode switching detection",
      "Aisle-level traffic flow and congestion alerts",
      "Checkout queue length monitoring with staffing recommendations",
      "Staff zone compliance during peak shopping hours",
      "Real-time shrinkage alerts for high-value categories",
    ],
    pricing: [
      { label: "Hardware", value: "From ₹1,20,000 per store" },
      { label: "SaaS", value: "From ₹15,000/month per store" },
      { label: "Deployment", value: "48 hours" },
    ],
    steps: [
      { title: "Store Walk & Risk Assessment", desc: "Our team maps your store layout, identifies high-shrinkage zones, and evaluates self-checkout vulnerability. Delivered as a risk report within 48 hours.", link: { text: "Get a Free Store Assessment →" } },
      { title: "Checkout & POS Integration", desc: "Cameras calibrated at checkout lanes and self-checkout stations. POS integration enables real-time transaction-to-video correlation." },
      { title: "Aisle & Traffic Calibration", desc: "Over 14 days, the system maps traffic patterns, identifies peak congestion periods, and establishes baselines for each aisle zone." },
      { title: "Live Intelligence Dashboard", desc: "Real-time dashboard shows shrinkage alerts, checkout fraud events, traffic heat maps, and staff compliance — all in one view." },
    ],
    whyBadge: "WHY VISIONIQ FOR SUPERMARKETS",
    whyTitle: "Why Choose VisionIQ for Supermarkets?",
    whySub: "Purpose-built for high-volume, high-traffic retail environments where traditional CCTV falls short.",
    whyCards: [
      { icon: Package, title: "Self-Checkout Protection", desc: "Detect scan-skip, barcode switching, and pass-around fraud in real time." },
      { icon: Activity, title: "Aisle Traffic Intelligence", desc: "Optimize product placement based on actual customer movement patterns." },
      { icon: Clock, title: "Queue Management", desc: "Automated checkout staffing alerts when queue lengths exceed thresholds." },
      { icon: Eye, title: "High-Value Zone Monitoring", desc: "Targeted surveillance on electronics, alcohol, and premium product aisles." },
      { icon: HardHat, title: "Staff Coverage Tracking", desc: "Ensure every department has adequate staffing during peak hours." },
      { icon: FileText, title: "Category Shrinkage Reports", desc: "Monthly shrinkage analysis by product category with trend comparison." },
    ],
    monitorBadge: "FULL COVERAGE",
    monitorTitle: "What VisionIQ Monitors in Supermarkets",
    monitorCategories: [
      { title: "Store Entrance", items: ["Bi-directional footfall counting", "Cart vs. basket tracking", "Peak hour identification", "Marketing campaign measurement"] },
      { title: "Aisles & Floor", items: ["Traffic flow heat maps", "Congestion detection", "Product engagement tracking", "Dead zone identification"] },
      { title: "Checkout & POS", items: ["Self-checkout fraud detection", "Scan-skip identification", "Cashier compliance monitoring", "Queue length tracking"] },
      { title: "Staff & Back Office", items: ["Zone assignment compliance", "Restocking task verification", "Break schedule adherence", "Shift performance scoring"] },
    ],
    useCasesBadge: "IDEAL USE CASES",
    useCasesTitle: "Ideal For These Supermarket Formats",
    useCases: ["Hypermarkets", "Neighborhood grocery chains", "Discount supermarkets", "Premium gourmet stores", "Cash & carry wholesale", "Online-to-offline grocery"],
    howItWorksBadge: "IN DETAIL",
    howItWorksTitle: "How VisionIQ Works for Supermarkets",
    howItWorksSub: "From store assessment to monthly intelligence — a structured process for maximum loss prevention.",
    howItWorksSteps: [
      { title: "Assessment", desc: "Store walk, shrinkage analysis, self-checkout audit" },
      { title: "Installation", desc: "Edge cameras at checkout, aisles, and entrances" },
      { title: "Calibration", desc: "14 days of traffic and transaction pattern learning" },
      { title: "Go Live", desc: "Real-time fraud alerts + traffic intelligence" },
      { title: "Monthly Review", desc: "Shrinkage report + layout optimization call" },
    ],
    advantageBadge: "THE VISIONIQ ADVANTAGE",
    advantageTitle: "What Sets Us Apart for Supermarkets",
    advantageBody: "We understand the unique challenges of high-volume grocery retail — from self-checkout fraud to perishable shrinkage — and build solutions that address each one.",
    advantageBullets: [
      "Self-checkout fraud model trained on 100,000+ grocery transactions",
      "Aisle-level traffic data formatted for category management teams",
      "Real-time queue alerts that prevent checkout bottlenecks",
      "Shrinkage reports broken down by category and department",
      "Integration with all major grocery POS systems",
    ],
    deliverables: [
      "Store risk assessment (within 48hrs)",
      "Deployment in 48 hours",
      "14-day calibration period",
      "Live dashboard + mobile alerts",
      "Monthly shrinkage report by category",
      "Quarterly model update",
      "Dedicated customer success manager",
    ],
    faqs: [
      { q: "How does self-checkout fraud detection work?", a: "Cameras match visible items on the belt/basket with scanned items in real time. Any mismatch triggers an attendant alert with video evidence." },
      { q: "Can it handle 5,000+ daily transactions?", a: "Yes. The system processes all POS transactions in real time with no performance degradation, even during peak hours." },
      { q: "Does it track perishable shrinkage?", a: "VisionIQ tracks theft and fraud-related shrinkage. For spoilage and waste tracking, we integrate with inventory management systems." },
      { q: "How are aisle traffic reports useful?", a: "Traffic data helps category managers optimize product placement, identify dead zones, and measure the impact of promotions on foot traffic." },
      { q: "What's the typical payback period?", a: "Most supermarkets see full ROI within 60-90 days through reduced self-checkout fraud and theft prevention alone." },
    ],
    bottomCTA: {
      title: "Ready to Reduce Supermarket Shrinkage?",
      sub: "Get a scoping call with our grocery retail team. We'll assess your self-checkout vulnerability and provide a deployment plan.",
      btn1: "Request Supermarket Demo →",
      btn2: "View Case Studies →",
    },
  },

  qsr: {
    badge: "CAFES & QSR",
    sectorCode: "SEC_QSR_05",
    heroTitle: "AI Operations Intelligence for Cafes & QSR",
    heroSub: "Monitor service speed, hygiene compliance, and staff efficiency — all from your existing camera infrastructure.",
    ctaBtn: "Request QSR Demo →",
    stats: [
      { value: "22%", label: "Faster Service Times" },
      { value: "98%", label: "Hygiene Compliance" },
      { value: "28%", label: "Staff Efficiency Gain" },
    ],
    deepDiveBadge: "QSR INTELLIGENCE",
    deepDiveTitle: "Beyond Security: QSR as a Speed & Compliance Problem",
    deepDiveBody: [
      "In quick-service restaurants, speed is revenue. Every second of delay costs you customers. And every missed hygiene check risks your FSSAI license.",
      "VisionIQ turns your cameras into operational sensors — measuring order-to-serve time, verifying hygiene compliance, and optimizing staffing in real time.",
    ],
    deepDiveListTitle: "What VisionIQ Gives Cafes & QSR",
    deepDiveList: [
      "Order-to-serve time tracking across every station",
      "Automated handwashing and glove usage verification",
      "Queue length monitoring with staffing alerts",
      "Kitchen activity and bottleneck identification",
      "FSSAI compliance logging with photo evidence",
    ],
    pricing: [
      { label: "Hardware", value: "From ₹60,000 per outlet" },
      { label: "SaaS", value: "From ₹8,000/month per outlet" },
      { label: "Deployment", value: "24 hours" },
    ],
    steps: [
      { title: "Outlet Assessment", desc: "Our team maps your kitchen workflow, service counter layout, and queue patterns to identify bottlenecks and compliance gaps.", link: { text: "Get a Free Outlet Assessment →" } },
      { title: "Station Camera Setup", desc: "Cameras positioned at order counter, prep stations, handwash areas, and pickup points for complete operational visibility." },
      { title: "Workflow Calibration", desc: "System learns your standard service flow over 7 days — from order placement to food pickup — establishing timing baselines." },
      { title: "Live Speed & Compliance Dashboard", desc: "Real-time dashboard shows service speed, queue length, hygiene scores, and alerts when thresholds are exceeded." },
    ],
    whyBadge: "WHY VISIONIQ FOR QSR",
    whyTitle: "Why Choose VisionIQ for Cafes & QSR?",
    whySub: "Purpose-built for speed-critical food service environments where every second and every compliance check matters.",
    whyCards: [
      { icon: Clock, title: "Service Speed Monitoring", desc: "Track order-to-serve time with camera-based analysis at every station." },
      { icon: ClipboardCheck, title: "Hygiene Compliance", desc: "Automated handwashing, glove usage, and food handling verification." },
      { icon: Users, title: "Queue Intelligence", desc: "Real-time queue length monitoring with automated staffing alerts." },
      { icon: Activity, title: "Kitchen Bottleneck Detection", desc: "Identify which stations slow down service during peak hours." },
      { icon: HardHat, title: "Staff Efficiency Scoring", desc: "Shift-level performance metrics for every team member." },
      { icon: FileText, title: "FSSAI Compliance Reports", desc: "Automated compliance logging with photo evidence for audits." },
    ],
    monitorBadge: "FULL COVERAGE",
    monitorTitle: "What VisionIQ Monitors in QSR",
    monitorCategories: [
      { title: "Order Counter", items: ["Queue length tracking", "Order placement timing", "Customer wait time", "Peak hour identification"] },
      { title: "Kitchen & Prep", items: ["Station activity monitoring", "Order-to-serve timing", "Bottleneck detection", "Temperature compliance"] },
      { title: "Hygiene Stations", items: ["Handwashing verification", "Glove usage monitoring", "Food handling compliance", "Station cleanliness checks"] },
      { title: "Staff & Operations", items: ["Shift compliance scoring", "Break schedule adherence", "Task completion verification", "Performance benchmarking"] },
    ],
    useCasesBadge: "IDEAL USE CASES",
    useCasesTitle: "Ideal For These QSR Formats",
    useCases: ["Fast food chains", "Cafe & coffee chains", "Cloud kitchens", "Food courts", "Bakery chains", "Ice cream & dessert outlets"],
    howItWorksBadge: "IN DETAIL",
    howItWorksTitle: "How VisionIQ Works for QSR",
    howItWorksSub: "From outlet assessment to daily compliance reports — speed and hygiene intelligence delivered continuously.",
    howItWorksSteps: [
      { title: "Assessment", desc: "Kitchen workflow mapping, compliance gap analysis" },
      { title: "Installation", desc: "Camera setup at all critical stations, 4 hours" },
      { title: "Calibration", desc: "7 days learning your service flow patterns" },
      { title: "Go Live", desc: "Real-time speed and compliance alerts" },
      { title: "Weekly Review", desc: "Performance report + optimization call" },
    ],
    advantageBadge: "THE VISIONIQ ADVANTAGE",
    advantageTitle: "What Sets Us Apart for QSR",
    advantageBody: "We understand the unique pressure of food service — where speed, hygiene, and consistency must coexist. Our platform is built for that reality.",
    advantageBullets: [
      "Service speed models calibrated to your specific menu complexity",
      "FSSAI compliance automation eliminates manual audit burden",
      "Kitchen-specific fire detection that filters cooking smoke",
      "Staff performance data structured for franchise-level benchmarking",
      "Multi-outlet dashboard for chain-wide operational visibility",
    ],
    deliverables: [
      "Outlet assessment (within 24hrs)",
      "Deployment in 24 hours",
      "7-day calibration period",
      "Live dashboard + mobile alerts",
      "Daily hygiene compliance report",
      "Weekly performance scorecard",
      "Dedicated customer success manager",
    ],
    faqs: [
      { q: "Can VisionIQ monitor handwashing frequency?", a: "Yes. Cameras at handwash stations verify frequency, duration, and proper technique. Violations trigger immediate alerts to shift managers." },
      { q: "How does service speed tracking work?", a: "The system tracks each order's journey from placement to pickup using camera-based timing at each station in the workflow." },
      { q: "Does it work in a cloud kitchen without customer-facing areas?", a: "Yes. VisionIQ monitors kitchen operations, prep compliance, and packaging accuracy even without customer-facing cameras." },
      { q: "Can franchise owners compare outlet performance?", a: "Yes. The multi-outlet dashboard provides franchise-level benchmarking across speed, hygiene, and staff metrics." },
      { q: "What's the typical ROI for a QSR outlet?", a: "Most outlets see measurable service speed improvement within 14 days and full hygiene compliance within 7 days of going live." },
    ],
    bottomCTA: {
      title: "Ready to Speed Up Service?",
      sub: "Get a scoping call with our QSR team. We'll assess your kitchen workflow and provide a deployment plan.",
      btn1: "Request QSR Demo →",
      btn2: "View Case Studies →",
    },
  },

  warehousing: {
    badge: "WAREHOUSES & LOGISTICS",
    sectorCode: "SEC_WH_03",
    heroTitle: "AI Security & Safety for Warehouse Operations",
    heroSub: "24/7 perimeter security, fire prevention, and operational monitoring for warehouses and distribution centers.",
    ctaBtn: "Request Warehouse Demo →",
    stats: [
      { value: "Zero", label: "Fire Incidents (18 months)" },
      { value: "99%", label: "Perimeter Detection Rate" },
      { value: "80%", label: "Downtime Reduction" },
    ],
    deepDiveBadge: "WAREHOUSE INTELLIGENCE",
    deepDiveTitle: "Beyond CCTV: Warehouses as Risk Environments",
    deepDiveBody: [
      "Warehouses face a unique combination of security threats, fire risks, and operational inefficiencies — spread across massive floor areas with limited staff coverage.",
      "VisionIQ transforms your camera network into a comprehensive risk management platform that prevents intrusion, detects fire before it spreads, and monitors operational compliance.",
    ],
    deepDiveListTitle: "What VisionIQ Gives Warehouses",
    deepDiveList: [
      "24/7 perimeter intrusion detection with vehicle tracking",
      "Thermal monitoring of electrical panels and machinery",
      "Loading dock activity monitoring and unauthorized access alerts",
      "Staff safety compliance — hard hats, vests, restricted zone adherence",
      "Fire detection trained on industrial smoke and chemical vapor patterns",
    ],
    pricing: [
      { label: "Hardware", value: "From ₹2,00,000 per facility" },
      { label: "SaaS", value: "From ₹20,000/month per facility" },
      { label: "Deployment", value: "48-72 hours" },
    ],
    steps: [
      { title: "Facility Risk Assessment", desc: "Our engineers map your perimeter, loading docks, high-risk zones, and electrical infrastructure. Delivered as a comprehensive risk report.", link: { text: "Get a Free Facility Assessment →" } },
      { title: "Perimeter & Fire Sensor Deployment", desc: "Cameras positioned at all entry points, perimeter boundaries, and high-risk fire zones. Thermal sensors added at electrical panels and machinery." },
      { title: "Industrial Calibration", desc: "System calibrated over 14 days to distinguish between vehicles, animals, weather events, and actual intrusions — and between industrial smoke and real fire." },
      { title: "24/7 Operations Dashboard", desc: "Real-time dashboard shows perimeter status, fire risk levels, access logs, and safety compliance — monitored 24/7 with escalation protocols." },
    ],
    whyBadge: "WHY VISIONIQ FOR WAREHOUSES",
    whyTitle: "Why Choose VisionIQ for Warehouses?",
    whySub: "Industrial-grade AI surveillance built for the unique challenges of warehouse and logistics environments.",
    whyCards: [
      { icon: Lock, title: "Perimeter Intrusion Detection", desc: "24/7 boundary monitoring with vehicle tracking and gate integration." },
      { icon: Flame, title: "Industrial Fire Detection", desc: "Thermal + visual AI trained on industrial smoke and chemical vapor patterns." },
      { icon: AlertTriangle, title: "Safety Compliance Monitoring", desc: "Hard hat, vest, and PPE verification across all operational zones." },
      { icon: MapPin, title: "Loading Dock Intelligence", desc: "Activity monitoring, unauthorized access alerts, and vehicle tracking." },
      { icon: Thermometer, title: "Equipment Health Monitoring", desc: "Thermal anomaly detection for electrical panels and machinery." },
      { icon: FileText, title: "Compliance Documentation", desc: "Full audit trail for insurance, safety inspections, and regulatory reviews." },
    ],
    monitorBadge: "FULL COVERAGE",
    monitorTitle: "What VisionIQ Monitors in Warehouses",
    monitorCategories: [
      { title: "Perimeter & Gates", items: ["Intrusion detection", "Vehicle identification", "Gate access logging", "After-hours alerts"] },
      { title: "Loading Docks", items: ["Activity monitoring", "Unauthorized access", "Vehicle dwell time", "Shipping verification"] },
      { title: "Fire & Safety", items: ["Thermal anomaly detection", "Industrial smoke detection", "PPE compliance", "Emergency exit monitoring"] },
      { title: "Operations", items: ["Staff zone compliance", "Forklift safety monitoring", "Inventory zone access", "Shift change verification"] },
    ],
    useCasesBadge: "IDEAL USE CASES",
    useCasesTitle: "Ideal For These Warehouse Formats",
    useCases: ["Distribution centers", "Cold storage facilities", "Manufacturing warehouses", "E-commerce fulfillment centers", "Third-party logistics (3PL)", "Bonded warehouses"],
    howItWorksBadge: "IN DETAIL",
    howItWorksTitle: "How VisionIQ Works for Warehouses",
    howItWorksSub: "From facility assessment to 24/7 monitoring — industrial-grade security and safety intelligence.",
    howItWorksSteps: [
      { title: "Assessment", desc: "Facility walk, perimeter mapping, fire risk analysis" },
      { title: "Installation", desc: "Cameras + thermal sensors at all critical zones" },
      { title: "Calibration", desc: "14 days learning facility patterns and baselines" },
      { title: "Go Live", desc: "24/7 perimeter, fire, and access monitoring" },
      { title: "Monthly Review", desc: "Safety report + incident analysis call" },
    ],
    advantageBadge: "THE VISIONIQ ADVANTAGE",
    advantageTitle: "What Sets Us Apart for Warehouses",
    advantageBody: "We bring industrial safety expertise combined with cutting-edge computer vision — giving you both the detection capability and the operational context to act on it.",
    advantageBullets: [
      "Fire detection models trained on industrial smoke, chemical vapor, and electrical fire patterns",
      "Perimeter AI that distinguishes vehicles, animals, and weather from actual intrusions",
      "PPE compliance verification across all operational zones",
      "Integration with access control, gate systems, and fire suppression",
      "24/7 monitoring dashboard with configurable escalation protocols",
    ],
    deliverables: [
      "Facility risk assessment (within 48hrs)",
      "Deployment in 48-72 hours",
      "14-day calibration period",
      "24/7 monitoring dashboard",
      "Monthly safety compliance report",
      "Quarterly model update",
      "Dedicated customer success manager",
    ],
    faqs: [
      { q: "Can VisionIQ monitor an outdoor perimeter?", a: "Yes. Our perimeter AI works in all weather conditions — rain, fog, and low light — with thermal camera support for nighttime detection." },
      { q: "How does it handle false alarms from animals or weather?", a: "The system is calibrated during the 14-day setup period to distinguish between animals, weather events, and actual intrusions. False alarm rate drops below 1%." },
      { q: "Does it integrate with existing gate access systems?", a: "Yes. VisionIQ integrates with all major access control and gate management systems for automated response." },
      { q: "Can it detect forklift safety violations?", a: "Yes. The system monitors forklift zones for speed violations, pedestrian proximity, and unauthorized operation." },
      { q: "What fire detection certifications does it have?", a: "VisionIQ fire detection meets industrial safety standards and provides documentation suitable for insurance and regulatory inspections." },
    ],
    bottomCTA: {
      title: "Ready to Secure Your Facility?",
      sub: "Get a scoping call with our warehouse security team. We'll assess your perimeter and provide a comprehensive security plan.",
      btn1: "Request Warehouse Demo →",
      btn2: "View Case Studies →",
    },
  },

  electronics: {
    badge: "ELECTRONICS RETAIL",
    sectorCode: "SEC_ELC_04",
    heroTitle: "AI Loss Prevention for Electronics Stores",
    heroSub: "Protect high-value inventory with concealment detection, customer analytics, and POS fraud prevention.",
    ctaBtn: "Request Electronics Demo →",
    stats: [
      { value: "73%", label: "Shrinkage Reduction" },
      { value: "96%", label: "POS Fraud Detection" },
      { value: "30 days", label: "ROI Timeline" },
    ],
    deepDiveBadge: "ELECTRONICS INTELLIGENCE",
    deepDiveTitle: "Beyond Security: Electronics Retail as a High-Value Problem",
    deepDiveBody: [
      "Electronics retailers face disproportionate shrinkage because every item on the floor is high-value and easy to conceal. Traditional CCTV coverage misses the sophisticated theft patterns common in this format.",
      "VisionIQ combines concealment gesture detection with POS fraud matching and customer journey analytics to create a comprehensive loss prevention system built for electronics retail.",
    ],
    deepDiveListTitle: "What VisionIQ Gives Electronics Retailers",
    deepDiveList: [
      "Concealment detection for small, high-value items (phones, accessories, components)",
      "POS fraud matching to catch sweethearting and scan-skip at checkout",
      "Customer dwell tracking near high-value display cases",
      "Staff presence monitoring in high-theft zones",
      "Repeat offender flagging via People Re-ID across visits",
    ],
    pricing: [
      { label: "Hardware", value: "From ₹1,00,000 per store" },
      { label: "SaaS", value: "From ₹14,000/month per store" },
      { label: "Deployment", value: "48 hours" },
    ],
    steps: [
      { title: "Store Assessment", desc: "Our team identifies high-value zones, display case vulnerabilities, and checkout fraud vectors specific to your electronics layout.", link: { text: "Get a Free Store Assessment →" } },
      { title: "High-Value Zone Coverage", desc: "Edge AI cameras positioned at display cases, demo stations, and checkout — areas where electronics theft and fraud are most common." },
      { title: "Product-Specific Calibration", desc: "System calibrated to detect concealment patterns specific to small electronics — phones, accessories, and components." },
      { title: "Live Loss Prevention", desc: "Real-time alerts for concealment, POS fraud, and repeat offenders. Monthly shrinkage reports with ₹ value recovery tracking." },
    ],
    whyBadge: "WHY VISIONIQ FOR ELECTRONICS",
    whyTitle: "Why Choose VisionIQ for Electronics Retail?",
    whySub: "Specialized loss prevention for high-value inventory environments where every item matters.",
    whyCards: [
      { icon: Eye, title: "Small Item Concealment", desc: "Detection optimized for phones, accessories, and small electronics." },
      { icon: Package, title: "POS Fraud Matching", desc: "Transaction-to-video correlation catches sweethearting and scan-skip." },
      { icon: UserSearch, title: "Repeat Offender Tracking", desc: "People Re-ID flags known shoplifters across visits." },
      { icon: Activity, title: "Display Case Analytics", desc: "Track customer engagement with high-value display areas." },
      { icon: HardHat, title: "Staff Zone Compliance", desc: "Ensure staff presence in high-theft zones during operating hours." },
      { icon: FileText, title: "Recovery Value Reports", desc: "Monthly reports showing ₹ value of theft prevented and recovered." },
    ],
    monitorBadge: "FULL COVERAGE",
    monitorTitle: "What VisionIQ Monitors in Electronics Stores",
    monitorCategories: [
      { title: "Display & Floor", items: ["High-value zone monitoring", "Customer dwell tracking", "Product pickup detection", "Demo station surveillance"] },
      { title: "Concealment Detection", items: ["Pocketing behavior detection", "Bag concealment alerts", "Group distraction patterns", "Emergency exit monitoring"] },
      { title: "Checkout & POS", items: ["Scan-skip detection", "Sweethearting identification", "Return fraud monitoring", "Employee discount abuse"] },
      { title: "Security & Re-ID", items: ["Repeat offender flagging", "Cross-visit tracking", "Blacklist alerts", "Incident timeline logging"] },
    ],
    useCasesBadge: "IDEAL USE CASES",
    useCasesTitle: "Ideal For These Electronics Formats",
    useCases: ["Multi-brand electronics stores", "Single-brand experience centers", "Mobile phone retailers", "Computer & accessories shops", "Consumer electronics chains", "Refurbished electronics outlets"],
    howItWorksBadge: "IN DETAIL",
    howItWorksTitle: "How VisionIQ Works for Electronics Retail",
    howItWorksSub: "From store assessment to monthly shrinkage recovery reports — specialized for high-value inventory.",
    howItWorksSteps: [
      { title: "Assessment", desc: "Store walk, high-value zone mapping, fraud analysis" },
      { title: "Installation", desc: "Edge cameras at displays, checkout, and exits" },
      { title: "Calibration", desc: "14 days learning electronics-specific theft patterns" },
      { title: "Go Live", desc: "Real-time concealment and fraud alerts" },
      { title: "Monthly Review", desc: "Shrinkage report + recovery value analysis" },
    ],
    advantageBadge: "THE VISIONIQ ADVANTAGE",
    advantageTitle: "What Sets Us Apart for Electronics Retail",
    advantageBody: "We specialize in high-value inventory environments where traditional CCTV misses the concealment patterns that matter most.",
    advantageBullets: [
      "Concealment models trained specifically on small electronics theft patterns",
      "POS fraud detection integrated with all major electronics POS systems",
      "People Re-ID tracks repeat offenders across multiple store visits",
      "Display case analytics that show which products attract the most attention",
      "Monthly recovery value reports that quantify ROI in rupees",
    ],
    deliverables: [
      "Store risk assessment (within 48hrs)",
      "Deployment in 48 hours",
      "14-day calibration period",
      "Live dashboard + mobile alerts",
      "Monthly shrinkage + recovery report",
      "Quarterly model update",
      "Dedicated customer success manager",
    ],
    faqs: [
      { q: "Can it detect concealment of small items like earbuds?", a: "Yes. Our models are trained specifically on small electronics concealment — including earbuds, phone cases, and accessories." },
      { q: "How does it handle demo station theft?", a: "VisionIQ monitors demo stations for cable-cut attempts, device removal, and suspicious interaction patterns." },
      { q: "Can it track the same shoplifter across multiple visits?", a: "Yes. People Re-ID uses appearance-based matching to flag known offenders when they return — without facial recognition." },
      { q: "Does it integrate with our electronic article surveillance (EAS)?", a: "VisionIQ complements EAS by providing visual verification and pre-exit alerts before EAS tags are triggered." },
      { q: "What's the typical shrinkage reduction?", a: "Most electronics retailers see 60-73% shrinkage reduction within 60 days, with ROI achieved in the first month." },
    ],
    bottomCTA: {
      title: "Ready to Protect Your Inventory?",
      sub: "Get a scoping call with our electronics retail team. We'll assess your store and provide a loss prevention deployment plan.",
      btn1: "Request Electronics Demo →",
      btn2: "View Case Studies →",
    },
  },

  hospitality: {
    badge: "HOTELS & HOSPITALITY",
    sectorCode: "SEC_HOS_06",
    heroTitle: "AI-Powered Guest Experience & Safety for Hotels",
    heroSub: "Optimize guest flow, ensure kitchen fire safety, and monitor staff service levels across your entire property.",
    ctaBtn: "Request Hotel Demo →",
    stats: [
      { value: "40%", label: "Service Response Improvement" },
      { value: "Zero", label: "Fire False Alarms" },
      { value: "24/7", label: "Property Monitoring" },
    ],
    deepDiveBadge: "HOSPITALITY INTELLIGENCE",
    deepDiveTitle: "Beyond Security: Hotels as Service Optimization Platforms",
    deepDiveBody: [
      "Hotels operate across multiple environments — lobbies, restaurants, pools, event spaces — each with unique security and service challenges. Traditional CCTV covers security but misses operations.",
      "VisionIQ transforms your property's camera network into a guest experience and safety platform that optimizes staffing, prevents kitchen fires, and improves service response times.",
    ],
    deepDiveListTitle: "What VisionIQ Gives Hotels",
    deepDiveList: [
      "Guest flow analytics across lobby, restaurants, pool, and event spaces",
      "Kitchen fire safety with cooking smoke discrimination",
      "Staff service response time tracking and optimization",
      "Pool and common area occupancy monitoring",
      "Event space utilization measurement and optimization",
    ],
    pricing: [
      { label: "Hardware", value: "From ₹1,50,000 per property" },
      { label: "SaaS", value: "From ₹18,000/month per property" },
      { label: "Deployment", value: "48-72 hours" },
    ],
    steps: [
      { title: "Property Assessment", desc: "Our team maps your property's key zones — lobby, restaurants, kitchen, pool, event spaces — and identifies service bottlenecks and safety risks.", link: { text: "Get a Free Property Assessment →" } },
      { title: "Multi-Zone Camera Setup", desc: "Cameras positioned across all public areas for guest flow tracking and in kitchens for fire safety. Average setup: 8 hours per property." },
      { title: "Service Pattern Calibration", desc: "System learns guest movement patterns, peak occupancy periods, and staff service baselines over 14 days." },
      { title: "Live Property Dashboard", desc: "Real-time dashboard shows guest flow, occupancy by zone, kitchen fire safety status, and staff service performance." },
    ],
    whyBadge: "WHY VISIONIQ FOR HOTELS",
    whyTitle: "Why Choose VisionIQ for Hotels?",
    whySub: "Purpose-built for hospitality environments where guest experience, safety, and operational efficiency must coexist.",
    whyCards: [
      { icon: Footprints, title: "Guest Flow Analytics", desc: "Understand movement across lobby, restaurants, pool, and event spaces." },
      { icon: Flame, title: "Kitchen Fire Safety", desc: "Real-time fire detection that distinguishes cooking smoke from actual fire." },
      { icon: Clock, title: "Service Response Tracking", desc: "Monitor and optimize staff response times across all service zones." },
      { icon: Users, title: "Occupancy Monitoring", desc: "Real-time occupancy tracking for pools, lounges, and event spaces." },
      { icon: Activity, title: "Event Space Utilization", desc: "Measure actual usage patterns for better event space management." },
      { icon: FileText, title: "Operational Reports", desc: "Weekly performance reports covering service, safety, and efficiency metrics." },
    ],
    monitorBadge: "FULL COVERAGE",
    monitorTitle: "What VisionIQ Monitors in Hotels",
    monitorCategories: [
      { title: "Lobby & Common Areas", items: ["Guest flow tracking", "Check-in queue monitoring", "Concierge response time", "Peak occupancy alerts"] },
      { title: "Restaurant & Kitchen", items: ["Kitchen fire safety", "Service speed tracking", "Hygiene compliance", "Table turnover analytics"] },
      { title: "Pool & Recreation", items: ["Occupancy monitoring", "Safety compliance", "Towel station management", "Peak usage tracking"] },
      { title: "Staff & Operations", items: ["Service response timing", "Zone coverage compliance", "Housekeeping verification", "Shift performance scores"] },
    ],
    useCasesBadge: "IDEAL USE CASES",
    useCasesTitle: "Ideal For These Hospitality Formats",
    useCases: ["Luxury hotels", "Business hotels", "Resort properties", "Boutique hotels", "Convention centers", "Serviced apartments"],
    howItWorksBadge: "IN DETAIL",
    howItWorksTitle: "How VisionIQ Works for Hotels",
    howItWorksSub: "From property assessment to weekly operational intelligence — guest experience and safety in one platform.",
    howItWorksSteps: [
      { title: "Assessment", desc: "Property walk, zone mapping, service bottleneck analysis" },
      { title: "Installation", desc: "Multi-zone camera setup, kitchen fire sensors" },
      { title: "Calibration", desc: "14 days learning guest and staff patterns" },
      { title: "Go Live", desc: "Guest flow + fire safety + service monitoring" },
      { title: "Weekly Review", desc: "Operational report + optimization call" },
    ],
    advantageBadge: "THE VISIONIQ ADVANTAGE",
    advantageTitle: "What Sets Us Apart for Hotels",
    advantageBody: "We understand that hotels are service businesses first. Our platform is built to improve guest experience while ensuring safety and operational efficiency.",
    advantageBullets: [
      "Guest flow analytics that don't compromise privacy",
      "Kitchen fire detection that eliminates false alarms from cooking",
      "Service response tracking that improves guest satisfaction scores",
      "Pool and recreation area monitoring for safety compliance",
      "Multi-property dashboard for hotel chains and management companies",
    ],
    deliverables: [
      "Property assessment (within 48hrs)",
      "Deployment in 48-72 hours",
      "14-day calibration period",
      "Live property dashboard",
      "Weekly operational report",
      "Quarterly model update",
      "Dedicated customer success manager",
    ],
    faqs: [
      { q: "Does guest flow tracking compromise guest privacy?", a: "No. All tracking is fully anonymized — no guest identification, no facial recognition, no personal data storage. Only aggregate movement patterns are analyzed." },
      { q: "Can it detect kitchen fires while ignoring cooking smoke?", a: "Yes. Kitchen-specific models are trained to distinguish between normal cooking smoke/steam and actual fire. Zero false alarm rate in deployed properties." },
      { q: "How does service response tracking work?", a: "The system measures time from guest arrival at a service point to staff engagement, tracking response patterns across shifts and zones." },
      { q: "Can it monitor pool area safety?", a: "Yes. Pool occupancy monitoring tracks the number of guests and flags when lifeguard-to-swimmer ratios are exceeded." },
      { q: "Does it work across multiple properties?", a: "Yes. The multi-property dashboard provides chain-level benchmarking across all your hotel locations." },
    ],
    bottomCTA: {
      title: "Ready to Optimize Your Property?",
      sub: "Get a scoping call with our hospitality team. We'll assess your property and provide a deployment plan tailored to your operations.",
      btn1: "Request Hotel Demo →",
      btn2: "View Case Studies →",
    },
  },
};

export const solutionIndex = [
  { slug: "fashion", title: "Fashion & Apparel", desc: "Fitting room protection, visual merchandising analytics, and apparel-specific theft prevention.", icon: "ShirtIcon" },
  { slug: "supermarkets", title: "Supermarkets & Grocery", desc: "Self-checkout fraud detection, aisle traffic optimization, and category shrinkage reporting.", icon: "ShoppingCart" },
  { slug: "qsr", title: "Cafes & QSR", desc: "Service speed monitoring, hygiene compliance automation, and kitchen operations intelligence.", icon: "Coffee" },
  { slug: "warehousing", title: "Warehouses & Logistics", desc: "Perimeter security, industrial fire detection, and safety compliance monitoring.", icon: "Warehouse" },
  { slug: "electronics", title: "Electronics Retail", desc: "High-value item concealment detection, POS fraud matching, and repeat offender tracking.", icon: "Cpu" },
  { slug: "hospitality", title: "Hotels & Hospitality", desc: "Guest flow optimization, kitchen fire safety, and service response monitoring.", icon: "Hotel" },
];
