// ─── Watchr AI Engine — Mock Telemetry Data ───────────────────────────────

export const ZONES = [
  { id: "shelf", label: "Shelf Zone", color: "#00F0FF" },
  { id: "billing", label: "Billing Counter", color: "#10b981" },
  { id: "exit", label: "Exit Gate", color: "#ef4444" },
  { id: "entrance", label: "Entrance", color: "#a78bfa" },
];

export const trackedObjects = [
  { id: 1, zone: "shelf", dwell: 8, status: "suspicious", conf: 0.91 },
  { id: 2, zone: "billing", dwell: 2, status: "cleared", conf: 0.87 },
  { id: 3, zone: "entrance", dwell: 1, status: "new", conf: 0.78 },
  { id: 4, zone: "shelf", dwell: 14, status: "suspicious", conf: 0.95 },
  { id: 5, zone: "exit", dwell: 3, status: "threat", conf: 0.93 },
];

export const alertFeed = [
  { id: "a1", ts: "01:08:34", type: "theft", msg: "ID #5 at Exit without Billing clearance", sev: "critical" },
  { id: "a2", ts: "01:08:21", type: "dwell", msg: "ID #4 occupied Shelf for 14s", sev: "warning" },
  { id: "a3", ts: "01:08:09", type: "dwell", msg: "ID #1 occupied Shelf for 8s", sev: "warning" },
  { id: "a4", ts: "01:07:55", type: "cleared", msg: "ID #2 cleared at Billing", sev: "ok" },
  { id: "a5", ts: "01:07:40", type: "new", msg: "ID #3 registered at Entrance", sev: "info" },
  { id: "a6", ts: "01:07:22", type: "theft", msg: "ID #9 — Theft Confirmed (counter=3)", sev: "critical" },
  { id: "a7", ts: "01:07:01", type: "fire", msg: "Fire signal: heatmap decayed below threshold", sev: "ok" },
];

export const kpiData = [
  { label: "Active IDs", value: 5, unit: "", trend: +2, trendDir: "up" },
  { label: "Threats", value: 1, unit: "", trend: 0, trendDir: "neutral" },
  { label: "Avg Confidence", value: "88.8", unit: "%", trend: +1.2, trendDir: "up" },
  { label: "Dwell Alerts", value: 2, unit: "", trend: +1, trendDir: "up" },
];

// ─── Threat Monitor ─────────────────────────────────────────────────────────

export const threatEvents = [
  { time: "01:07:22", id: 9, state: "THEFT_CONFIRMED", zone: "exit", cleared: false },
  { time: "01:06:45", id: 7, state: "SHELF_ENGAGED", zone: "shelf", cleared: false },
  { time: "01:05:30", id: 7, state: "BILLING_CLEARED", zone: "billing", cleared: true },
  { time: "01:04:12", id: 3, state: "THEFT_CONFIRMED", zone: "exit", cleared: false },
  { time: "01:02:58", id: 11, state: "SHELF_ENGAGED", zone: "shelf", cleared: false },
  { time: "01:01:33", id: 11, state: "BILLING_CLEARED", zone: "billing", cleared: true },
  { time: "01:00:10", id: 2, state: "THEFT_CONFIRMED", zone: "exit", cleared: false },
];

export const stateTransitionData = [
  { minute: "00:55", confirmed: 0, engaged: 1, cleared: 2 },
  { minute: "00:58", confirmed: 1, engaged: 2, cleared: 2 },
  { minute: "01:01", confirmed: 1, engaged: 3, cleared: 3 },
  { minute: "01:04", confirmed: 2, engaged: 3, cleared: 3 },
  { minute: "01:06", confirmed: 2, engaged: 4, cleared: 3 },
  { minute: "01:08", confirmed: 3, engaged: 5, cleared: 4 },
];

export const suspicionScores = [
  { id: "ID #1", score: 72 },
  { id: "ID #4", score: 88 },
  { id: "ID #5", score: 95 },
  { id: "ID #7", score: 61 },
  { id: "ID #9", score: 100 },
];

// ─── Safety Sentinel ─────────────────────────────────────────────────────────

export const fireSignalHistory = [
  { t: "01:00", color: 12, motion: 5, heat: 0.2 },
  { t: "01:01", color: 18, motion: 9, heat: 0.8 },
  { t: "01:02", color: 9, motion: 4, heat: 0.4 },
  { t: "01:03", color: 22, motion: 14, heat: 1.6 },
  { t: "01:04", color: 35, motion: 28, heat: 3.1 },
  { t: "01:05", color: 48, motion: 42, heat: 6.0 },
  { t: "01:06", color: 31, motion: 22, heat: 4.2 },
  { t: "01:07", color: 14, motion: 8, heat: 2.5 },
  { t: "01:08", color: 7, motion: 3, heat: 0.9 },
];

export const signalStrengths = [
  { signal: "Color (HSV Flame)", value: 7, threshold: 40, unit: "px%" },
  { signal: "Motion Delta", value: 3, threshold: 30, unit: "px%" },
  { signal: "Heatmap Core", value: 0.9, threshold: 15, unit: "score" },
];

export const heatmapZoneCells = [
  // [row, col, heat 0-1]
  [0,0,0.1],[0,1,0.3],[0,2,0.2],[0,3,0.1],[0,4,0.05],
  [1,0,0.2],[1,1,0.6],[1,2,0.4],[1,3,0.2],[1,4,0.1],
  [2,0,0.3],[2,1,0.8],[2,2,0.5],[2,3,0.3],[2,4,0.15],
  [3,0,0.2],[3,1,0.5],[3,2,0.35],[3,3,0.2],[3,4,0.1],
  [4,0,0.1],[4,1,0.2],[4,2,0.15],[4,3,0.1],[4,4,0.05],
];

// ─── Employee Kiosk ──────────────────────────────────────────────────────────

export const employees = [
  { id: "EMP-7001", name: "Alex Chen", shift: "08:00–16:00", uniform: "#1E3A5F", status: "active", faceConf: 0.92 },
  { id: "EMP-7002", name: "Maria Santos", shift: "09:00–17:00", uniform: "#2D1B69", status: "active", faceConf: 0.87 },
  { id: "EMP-7003", name: "James Park", shift: "12:00–20:00", uniform: "#1A4731", status: "active", faceConf: 0.94 },
  { id: "EMP-7004", name: "Priya Nair", shift: "14:00–22:00", uniform: "#4A1515", status: "off-shift", faceConf: 0.89 },
  { id: "EMP-7005", name: "Luca Bianchi", shift: "06:00–14:00", uniform: "#2F2F2F", status: "off-shift", faceConf: 0.91 },
];

export const faceLogData = [
  { ts: "01:08:11", id: "EMP-7001", action: "Recognized", conf: 0.92, zone: "Entrance" },
  { ts: "01:06:47", id: "EMP-7003", action: "Recognized", conf: 0.94, zone: "Billing" },
  { ts: "01:05:22", id: "EMP-7002", action: "Recognized", conf: 0.87, zone: "Entrance" },
  { ts: "01:03:10", id: "EMP-7005", action: "Clock-Out", conf: 0.91, zone: "Exit" },
  { ts: "01:01:55", id: "UNKNOWN", action: "Unknown Face", conf: 0.41, zone: "Shelf" },
];

export const shiftActivity = [
  { hour: "06", count: 1 },
  { hour: "07", count: 1 },
  { hour: "08", count: 2 },
  { hour: "09", count: 3 },
  { hour: "10", count: 3 },
  { hour: "11", count: 3 },
  { hour: "12", count: 4 },
  { hour: "13", count: 4 },
  { hour: "14", count: 3 },
  { hour: "15", count: 3 },
  { hour: "16", count: 2 },
  { hour: "17", count: 1 },
];

// ─── Live Canvas Overview ────────────────────────────────────────────────────

export const zoneOccupancyHistory = [
  { t: "01:03", shelf: 2, billing: 1, exit: 0, entrance: 1 },
  { t: "01:04", shelf: 3, billing: 1, exit: 0, entrance: 2 },
  { t: "01:05", shelf: 2, billing: 2, exit: 1, entrance: 1 },
  { t: "01:06", shelf: 4, billing: 1, exit: 1, entrance: 0 },
  { t: "01:07", shelf: 3, billing: 2, exit: 2, entrance: 1 },
  { t: "01:08", shelf: 2, billing: 1, exit: 1, entrance: 1 },
];

export const detectionConfHistory = [
  { t: "01:03", conf: 82 },
  { t: "01:04", conf: 86 },
  { t: "01:05", conf: 84 },
  { t: "01:06", conf: 91 },
  { t: "01:07", conf: 88 },
  { t: "01:08", conf: 89 },
];

// --- Customer Analytics --------------------------------------------------------

export const footfallHourly = [
  { hour: '9AM', count: 112 }, { hour: '10AM', count: 287 },
  { hour: '11AM', count: 496 }, { hour: '12PM', count: 634 },
  { hour: '1PM', count: 581 }, { hour: '2PM', count: 342 },
  { hour: '3PM', count: 298 }, { hour: '4PM', count: 389 },
  { hour: '5PM', count: 521 }, { hour: '6PM', count: 698 },
  { hour: '7PM', count: 741 }, { hour: '8PM', count: 487 },
  { hour: '9PM', count: 189 },
];

export const footfallWeekly = [
  { day: 'Mon', count: 2841 }, { day: 'Tue', count: 3120 },
  { day: 'Wed', count: 2967 }, { day: 'Thu', count: 3340 },
  { day: 'Fri', count: 3847 }, { day: 'Sat', count: 4210 },
  { day: 'Sun', count: 3980 },
];

export const heatmapZones = [
  { zone: 'Entry', intensity: 85 }, { zone: 'Aisle 1', intensity: 42 },
  { zone: 'Aisle 2', intensity: 67 }, { zone: 'Aisle 3', intensity: 91 },
  { zone: 'Aisle 4', intensity: 38 }, { zone: 'Aisle 5', intensity: 55 },
  { zone: 'Electronics', intensity: 78 }, { zone: 'Trial Rooms', intensity: 63 },
  { zone: 'POS Area', intensity: 95 }, { zone: 'Stockroom', intensity: 12 },
  { zone: 'Cafe Corner', intensity: 48 }, { zone: 'Exit', intensity: 71 },
];

export const demographics = [
  { group: '18�24', male: 18, female: 22 },
  { group: '25�34', male: 28, female: 31 },
  { group: '35�44', male: 22, female: 19 },
  { group: '45�54', male: 14, female: 12 },
  { group: '55+', male: 8, female: 6 },
];

export const dwellByZone = [
  { zone: 'Entry', avgMin: 1.2 }, { zone: 'Electronics', avgMin: 8.4 },
  { zone: 'Trial Rooms', avgMin: 11.7 }, { zone: 'POS Area', avgMin: 4.1 },
  { zone: 'Aisle 3', avgMin: 6.3 }, { zone: 'Cafe Corner', avgMin: 14.2 },
];

// --- Alerts Center -------------------------------------------------------------

export const allAlerts = [
  { id: 'A001', severity: 'critical', module: 'Loss Prevention', type: 'Concealment Gesture', description: 'Suspicious pocket motion near Aisle 3', store: 'Mumbai Central', camera: 'cam-02', time: '2 min ago', status: 'active', assignedTo: null },
  { id: 'A002', severity: 'critical', module: 'Loss Prevention', type: 'POS Fraud Flag', description: 'Scan-skip detected at Billing Counter', store: 'Mumbai Central', camera: 'cam-03', time: '7 min ago', status: 'active', assignedTo: 'Rahul S.' },
  { id: 'A003', severity: 'critical', module: 'People Re-ID', type: 'Blacklist Match', description: 'Flagged individual re-identified in Trial Rooms', store: 'Delhi NCR', camera: 'cam-07', time: '15 min ago', status: 'active', assignedTo: null },
  { id: 'A004', severity: 'high', module: 'Customer Analytics', type: 'Crowd Density', description: 'Entrance zone at 94% capacity', store: 'Bangalore MG Road', camera: 'cam-09', time: '22 min ago', status: 'active', assignedTo: null },
  { id: 'A005', severity: 'high', module: 'Staff Monitor', type: 'Idle Time Alert', description: 'Staff ID S04 idle 18 min in Aisle 3', store: 'Mumbai Central', camera: 'cam-02', time: '31 min ago', status: 'active', assignedTo: null },
  { id: 'A006', severity: 'high', module: 'Fire & Safety', type: 'Thermal Anomaly', description: 'Elevated heat signature near Electronics shelf', store: 'Delhi NCR', camera: 'cam-06', time: '45 min ago', status: 'investigating', assignedTo: 'Priya K.' },
  { id: 'A007', severity: 'medium', module: 'Loss Prevention', type: 'Unauthorized Zone', description: 'Unidentified person in stockroom after hours', store: 'Bangalore MG Road', camera: 'cam-12', time: '1 hr ago', status: 'active', assignedTo: null },
  { id: 'A008', severity: 'medium', module: 'Customer Analytics', type: 'Dwell Alert', description: 'Person at entrance 12+ min without entering', store: 'Mumbai Central', camera: 'cam-01', time: '2 hr ago', status: 'resolved', assignedTo: null },
  { id: 'A009', severity: 'medium', module: 'People Re-ID', type: 'Cross-Zone Track', description: 'Customer tracked across 3 zones in 4 minutes', store: 'Delhi NCR', camera: 'cam-05', time: '3 hr ago', status: 'resolved', assignedTo: null },
  { id: 'A010', severity: 'low', module: 'Staff Monitor', type: 'Zone Breach', description: 'Staff left assigned zone for 8 minutes', store: 'Bangalore MG Road', camera: 'cam-10', time: '4 hr ago', status: 'resolved', assignedTo: null },
  { id: 'A011', severity: 'low', module: 'Fire & Safety', type: 'False Alarm', description: 'Steam from kitchen triggered smoke sensor', store: 'Mumbai Central', camera: 'cam-04', time: '5 hr ago', status: 'resolved', assignedTo: null },
  { id: 'A012', severity: 'medium', module: 'Loss Prevention', type: 'Loitering Detected', description: 'Individual near high-value display for 9 min', store: 'Delhi NCR', camera: 'cam-06', time: '6 hr ago', status: 'resolved', assignedTo: 'Amit V.' },
];

// --- Settings ------------------------------------------------------------------

export const orgData = {
  name: 'Pantaloons Retail Pvt. Ltd.',
  plan: 'Enterprise',
  email: 'ops@pantaloons.in',
  phone: '+91 98200 12345',
  address: 'Kurla West, Mumbai, MH 400070',
};

export const storesData = [
  { id: 'mumbai', name: 'Mumbai Central', location: 'Kurla West, Mumbai', cameras: 4, status: true },
  { id: 'delhi', name: 'Delhi NCR', location: 'Gurugram, Haryana', cameras: 4, status: true },
  { id: 'bangalore', name: 'Bangalore MG Road', location: 'MG Road, Bangalore', cameras: 4, status: true },
];

export const camerasData = [
  { id: 'cam-01', store: 'Mumbai Central', name: 'Entrance A', zone: 'Entry', modules: ['Customer Analytics', 'People Re-ID'], status: true },
  { id: 'cam-02', store: 'Mumbai Central', name: 'Aisle 3', zone: 'Floor', modules: ['Loss Prevention', 'Staff Monitor'], status: true },
  { id: 'cam-03', store: 'Mumbai Central', name: 'Billing Counter', zone: 'POS', modules: ['Loss Prevention'], status: true },
  { id: 'cam-04', store: 'Mumbai Central', name: 'Storage Room', zone: 'Back', modules: ['Fire & Safety'], status: false },
  { id: 'cam-05', store: 'Delhi NCR', name: 'Main Gate', zone: 'Entry', modules: ['Customer Analytics'], status: true },
  { id: 'cam-06', store: 'Delhi NCR', name: 'Electronics Section', zone: 'Floor', modules: ['Loss Prevention', 'Fire & Safety'], status: true },
  { id: 'cam-07', store: 'Delhi NCR', name: 'Trial Rooms', zone: 'Floor', modules: ['People Re-ID', 'Loss Prevention'], status: true },
  { id: 'cam-08', store: 'Delhi NCR', name: 'Cashier Row', zone: 'POS', modules: ['Loss Prevention'], status: true },
  { id: 'cam-09', store: 'Bangalore MG Road', name: 'Entrance B', zone: 'Entry', modules: ['Customer Analytics', 'People Re-ID'], status: true },
  { id: 'cam-10', store: 'Bangalore MG Road', name: 'Ladies Section', zone: 'Floor', modules: ['Staff Monitor', 'Loss Prevention'], status: true },
  { id: 'cam-11', store: 'Bangalore MG Road', name: 'Fitting Rooms', zone: 'Floor', modules: ['Loss Prevention'], status: true },
  { id: 'cam-12', store: 'Bangalore MG Road', name: 'Stockroom', zone: 'Back', modules: ['Fire & Safety'], status: true },
];

export const usersData = [
  { id: 'U01', name: 'Arjun Mehta', email: 'arjun@pantaloons.in', role: 'Super Admin', lastActive: '2 min ago' },
  { id: 'U02', name: 'Priya Nair', email: 'priya@pantaloons.in', role: 'Store Manager', lastActive: '14 min ago' },
  { id: 'U03', name: 'Rahul Sharma', email: 'rahul@pantaloons.in', role: 'Security Staff', lastActive: '1 hr ago' },
  { id: 'U04', name: 'Anika Singh', email: 'anika@pantaloons.in', role: 'Analyst', lastActive: '3 hr ago' },
  { id: 'U05', name: 'Dev Patel', email: 'dev@pantaloons.in', role: 'Store Manager', lastActive: 'Yesterday' },
];
