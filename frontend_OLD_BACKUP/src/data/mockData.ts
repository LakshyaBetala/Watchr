export const stores = [
  { id: 'mumbai', name: 'Mumbai Central', location: 'Mumbai, MH', cameras: 4, status: 'online' },
  { id: 'delhi', name: 'Delhi NCR', location: 'Gurugram, HR', cameras: 4, status: 'online' },
  { id: 'bangalore', name: 'Bangalore MG Road', location: 'Bangalore, KA', cameras: 4, status: 'online' },
];

export const cameras = [
  { id: 'cam-01', storeId: 'mumbai', name: 'Entrance A', zone: 'Entry', status: 'online', lastPing: '2s ago' },
  { id: 'cam-02', storeId: 'mumbai', name: 'Aisle 3', zone: 'Floor', status: 'online', lastPing: '1s ago' },
  { id: 'cam-03', storeId: 'mumbai', name: 'Billing Counter', zone: 'POS', status: 'online', lastPing: '3s ago' },
  { id: 'cam-04', storeId: 'mumbai', name: 'Storage Room', zone: 'Back', status: 'offline', lastPing: '14m ago' },
  { id: 'cam-05', storeId: 'delhi', name: 'Main Gate', zone: 'Entry', status: 'online', lastPing: '1s ago' },
  { id: 'cam-06', storeId: 'delhi', name: 'Electronics Section', zone: 'Floor', status: 'online', lastPing: '2s ago' },
  { id: 'cam-07', storeId: 'delhi', name: 'Trial Rooms', zone: 'Floor', status: 'online', lastPing: '4s ago' },
  { id: 'cam-08', storeId: 'delhi', name: 'Cashier Row', zone: 'POS', status: 'online', lastPing: '1s ago' },
  { id: 'cam-09', storeId: 'bangalore', name: 'Entrance B', zone: 'Entry', status: 'online', lastPing: '2s ago' },
  { id: 'cam-10', storeId: 'bangalore', name: 'Ladies Section', zone: 'Floor', status: 'online', lastPing: '1s ago' },
  { id: 'cam-11', storeId: 'bangalore', name: 'Fitting Rooms', zone: 'Floor', status: 'online', lastPing: '3s ago' },
  { id: 'cam-12', storeId: 'bangalore', name: 'Stockroom', zone: 'Back', status: 'online', lastPing: '5s ago' },
];

export const alerts = [
  { id: 'a001', storeId: 'mumbai', cameraId: 'cam-02', module: 'Loss Prevention', type: 'Concealment Gesture', severity: 'critical', description: 'Suspicious pocket motion detected near Aisle 3', status: 'active', timestamp: '2 min ago', assignedTo: null },
  { id: 'a002', storeId: 'mumbai', cameraId: 'cam-03', module: 'Loss Prevention', type: 'POS Fraud Flag', severity: 'critical', description: 'Scan-skip detected at Billing Counter', status: 'active', timestamp: '7 min ago', assignedTo: 'Rahul S.' },
  { id: 'a003', storeId: 'delhi', cameraId: 'cam-07', module: 'People Re-ID', type: 'Blacklist Match', severity: 'critical', description: 'Flagged individual re-identified in Trial Rooms', status: 'active', timestamp: '15 min ago', assignedTo: null },
  { id: 'a004', storeId: 'bangalore', cameraId: 'cam-09', module: 'Customer Analytics', type: 'Crowd Density', severity: 'high', description: 'Entrance zone at 94% capacity', status: 'active', timestamp: '22 min ago', assignedTo: null },
  { id: 'a005', storeId: 'mumbai', cameraId: 'cam-02', module: 'Staff Monitor', type: 'Idle Time', severity: 'high', description: 'Staff ID #S04 idle for 18 minutes in Aisle 3', status: 'active', timestamp: '31 min ago', assignedTo: null },
  { id: 'a006', storeId: 'delhi', cameraId: 'cam-06', module: 'Fire & Safety', type: 'Thermal Anomaly', severity: 'high', description: 'Elevated heat signature near Electronics shelf', status: 'investigating', timestamp: '45 min ago', assignedTo: 'Priya K.' },
  { id: 'a007', storeId: 'bangalore', cameraId: 'cam-12', module: 'Loss Prevention', type: 'Unauthorized Zone', severity: 'medium', description: 'Unidentified person in stockroom after hours', status: 'active', timestamp: '1 hr ago', assignedTo: null },
  { id: 'a008', storeId: 'mumbai', cameraId: 'cam-01', module: 'Customer Analytics', type: 'Dwell Alert', severity: 'medium', description: 'Person at entrance for over 12 minutes without entering', status: 'resolved', timestamp: '2 hr ago', assignedTo: null },
  { id: 'a009', storeId: 'delhi', cameraId: 'cam-05', module: 'People Re-ID', type: 'Cross-Zone Track', severity: 'medium', description: 'Customer tracked across 3 zones in 4 minutes', status: 'resolved', timestamp: '3 hr ago', assignedTo: null },
  { id: 'a010', storeId: 'bangalore', cameraId: 'cam-10', module: 'Staff Monitor', type: 'Zone Breach', severity: 'low', description: 'Staff left assigned zone for 8 minutes', status: 'resolved', timestamp: '4 hr ago', assignedTo: null },
];

export const staff = [
  { id: 'S01', storeId: 'mumbai', name: 'Amit Verma', role: 'Floor Staff', zone: 'Aisle 1-3', compliance: 91, idleMinutes: 8, conversions: 4, status: 'active' },
  { id: 'S02', storeId: 'mumbai', name: 'Sneha Patel', role: 'Cashier', zone: 'POS', compliance: 98, idleMinutes: 2, conversions: 12, status: 'active' },
  { id: 'S03', storeId: 'mumbai', name: 'Rohit Das', role: 'Security', zone: 'Entry', compliance: 84, idleMinutes: 14, conversions: 0, status: 'active' },
  { id: 'S04', storeId: 'mumbai', name: 'Kavya Nair', role: 'Floor Staff', zone: 'Aisle 3-5', compliance: 67, idleMinutes: 22, conversions: 1, status: 'flagged' },
  { id: 'S05', storeId: 'delhi', name: 'Aryan Singh', role: 'Floor Staff', zone: 'Electronics', compliance: 88, idleMinutes: 11, conversions: 6, status: 'active' },
  { id: 'S06', storeId: 'delhi', name: 'Meena Gupta', role: 'Cashier', zone: 'POS', compliance: 96, idleMinutes: 3, conversions: 9, status: 'active' },
  { id: 'S07', storeId: 'bangalore', name: 'Vikram Rao', role: 'Floor Staff', zone: 'Ladies Section', compliance: 79, idleMinutes: 18, conversions: 3, status: 'active' },
  { id: 'S08', storeId: 'bangalore', name: 'Divya Kumar', role: 'Security', zone: 'Entry', compliance: 93, idleMinutes: 5, conversions: 0, status: 'active' },
];

export const footfallData = [
  { hour: '9AM', count: 112 }, { hour: '10AM', count: 287 }, { hour: '11AM', count: 496 },
  { hour: '12PM', count: 634 }, { hour: '1PM', count: 581 }, { hour: '2PM', count: 342 },
  { hour: '3PM', count: 298 }, { hour: '4PM', count: 389 }, { hour: '5PM', count: 521 },
  { hour: '6PM', count: 698 }, { hour: '7PM', count: 741 }, { hour: '8PM', count: 487 },
  { hour: '9PM', count: 189 },
];

export const weeklyFootfall = [
  { day: 'Mon', count: 2841 }, { day: 'Tue', count: 3120 }, { day: 'Wed', count: 2967 },
  { day: 'Thu', count: 3340 }, { day: 'Fri', count: 3847 }, { day: 'Sat', count: 4210 }, { day: 'Sun', count: 3980 },
];

export const heatmapZones = [
  { zone: 'Entry', x: 0, y: 0, intensity: 85 }, { zone: 'Aisle 1', x: 1, y: 0, intensity: 42 },
  { zone: 'Aisle 2', x: 2, y: 0, intensity: 67 }, { zone: 'Aisle 3', x: 3, y: 0, intensity: 91 },
  { zone: 'Aisle 4', x: 0, y: 1, intensity: 38 }, { zone: 'Aisle 5', x: 1, y: 1, intensity: 55 },
  { zone: 'Electronics', x: 2, y: 1, intensity: 78 }, { zone: 'Trial Rooms', x: 3, y: 1, intensity: 63 },
  { zone: 'POS Area', x: 0, y: 2, intensity: 95 }, { zone: 'Stockroom', x: 1, y: 2, intensity: 12 },
  { zone: 'Cafe Corner', x: 2, y: 2, intensity: 48 }, { zone: 'Exit', x: 3, y: 2, intensity: 71 },
];

export const demographics = [
  { group: '18–24', male: 18, female: 22 }, { group: '25–34', male: 28, female: 31 },
  { group: '35–44', male: 22, female: 19 }, { group: '45–54', male: 14, female: 12 },
  { group: '55+', male: 8, female: 6 },
];

export const incidentTrend = [
  { date: 'Mar 21', theft: 3, fire: 0, access: 1 },
  { date: 'Mar 22', theft: 5, fire: 0, access: 2 },
  { date: 'Mar 23', theft: 2, fire: 1, access: 0 },
  { date: 'Mar 24', theft: 4, fire: 0, access: 3 },
  { date: 'Mar 25', theft: 6, fire: 0, access: 1 },
  { date: 'Mar 26', theft: 3, fire: 0, access: 2 },
  { date: 'Mar 27', theft: 7, fire: 1, access: 2 },
];

export const reidEvents = [
  { id: '#RID-0041', type: 'Blacklist Match', zone: 'Trial Rooms', time: '3 min ago', severity: 'critical', storeId: 'delhi' },
  { id: '#RID-0038', type: 'Cross-Zone Track', zone: 'Electronics → POS', time: '12 min ago', severity: 'medium', storeId: 'delhi' },
  { id: '#RID-0035', type: 'Crowd Density', zone: 'Entrance B', time: '22 min ago', severity: 'high', storeId: 'bangalore' },
  { id: '#RID-0029', type: 'Repeat Visitor', zone: 'Aisle 3', time: '1 hr ago', severity: 'low', storeId: 'mumbai' },
  { id: '#RID-0022', type: 'Blacklist Match', zone: 'Entry', time: '2 hr ago', severity: 'critical', storeId: 'mumbai' },
  { id: '#RID-0018', type: 'Dwell Alert', zone: 'POS Area', time: '3 hr ago', severity: 'medium', storeId: 'bangalore' },
];

export const blacklistEntries = [
  { personId: '#BL-0012', timesSeen: 3, lastZone: 'Trial Rooms', lastTime: '3 min ago', cameraId: 'cam-07', storeId: 'delhi' },
  { personId: '#BL-0007', timesSeen: 2, lastZone: 'Entry', lastTime: '2 hr ago', cameraId: 'cam-01', storeId: 'mumbai' },
  { personId: '#BL-0019', timesSeen: 1, lastZone: 'Aisle 3', lastTime: '1 day ago', cameraId: 'cam-02', storeId: 'mumbai' },
];

export const generatedReports = [
  { name: 'Weekly Theft Summary — W12', type: 'Theft', store: 'All Stores', dateRange: 'Mar 17-23, 2026', generatedAt: 'Mar 24, 2026', size: '1.2 MB' },
  { name: 'Footfall Analysis — Mumbai', type: 'Footfall', store: 'Mumbai Central', dateRange: 'Mar 1-27, 2026', generatedAt: 'Mar 27, 2026', size: '842 KB' },
  { name: 'Monthly Staff Compliance', type: 'Staff', store: 'All Stores', dateRange: 'Feb 2026', generatedAt: 'Mar 1, 2026', size: '1.8 MB' },
  { name: 'Fire & Safety Audit Q1', type: 'Fire', store: 'All Stores', dateRange: 'Jan-Mar 2026', generatedAt: 'Mar 20, 2026', size: '990 KB' },
  { name: 'Delhi NCR Full Report', type: 'Full', store: 'Delhi NCR', dateRange: 'Mar 1-27, 2026', generatedAt: 'Mar 27, 2026', size: '3.4 MB' },
  { name: 'Weekly Summary — W11', type: 'Full', store: 'All Stores', dateRange: 'Mar 10-16, 2026', generatedAt: 'Mar 17, 2026', size: '2.1 MB' },
];
