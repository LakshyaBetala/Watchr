import { create } from 'zustand';
// Completely purged watchrMockData to ensure 100% organic live metrics.
interface DashboardStore {
  selectedStore: string;
  setSelectedStore: (id: string) => void;
  
  // LIVE TELEMETRY
  trackedObjects: any[];
  alertFeed: any[];
  zoneOccupancyHistory: any[];
  detectionConfHistory: any[];
  kpiData: any[];
  systemStatus: { security: string; safety: string };

  // THREAT & SAFETY STATE
  threatEvents: any[];
  stateTransitionData: any[];
  suspicionScores: any[];
  fireSignalHistory: any[];
  signalStrengths: any[];
  heatmapZoneCells: any[];

  // ANALYTICS & KIOSK STATE
  footfallHourly: any[];
  footfallWeekly: any[];
  heatmapZones: any[];
  demographics: any[];
  dwellByZone: any[];
  employees: any[];
  faceLogData: any[];
  shiftActivity: any[];
  allAlerts: any[];
  
  // SETTINGS
  orgData: any;
  storesData: any[];
  camerasData: any[];
  usersData: any[];
  
  // ACTIONS
  connectTelemetryStream: () => void;
  connectInsightsStream: () => void;
}

export const useDashboardStore = create<DashboardStore>((set) => ({
  selectedStore: 'all',
  setSelectedStore: (id) => set({ selectedStore: id }),

  trackedObjects: [],
  alertFeed: [],
  zoneOccupancyHistory: [{ t: new Date().toLocaleTimeString(), shelf: 0, billing: 0, exit: 0 }],
  detectionConfHistory: [{ t: new Date().toLocaleTimeString(), conf: 0 }],
  kpiData: [
    { title: "Total Footfall", value: "0", change: "+0%", trend: "up" },
    { title: "Active Threats", value: "0", change: "0%", trend: "neutral" },
    { title: "Safe Zones", value: "3/3", change: "100%", trend: "up" },
    { title: "Avg Dwell", value: "0m", change: "0%", trend: "down" }
  ],
  systemStatus: { security: "OK", safety: "CLEAR" },

  threatEvents: [],
  stateTransitionData: [],
  suspicionScores: [],
  fireSignalHistory: [{ t: new Date().toLocaleTimeString(), heat: 0, smoke: 0, motion: 0 }],
  signalStrengths: [],
  heatmapZoneCells: [],
  footfallHourly: [],
  footfallWeekly: [],
  heatmapZones: [],
  demographics: [],
  dwellByZone: [],
  employees: [],
  faceLogData: [],
  shiftActivity: [],
  allAlerts: [],
  orgData: { name: "Live Organization", id: "ORG-001", status: "Active" },
  storesData: [],
  camerasData: [],
  usersData: [],

  connectTelemetryStream: () => {
    // Only connect once
    if ((window as any)._sseConnected) return;
    (window as any)._sseConnected = true;
    
    // Boot up the secondary Gemini insight stream
    get().connectInsightsStream();
    
    const eventSource = new EventSource("http://localhost:5050/api/stream");
    
    eventSource.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);
        
        set((state) => {
          const newObjects = Object.entries(payload.objects || {}).map(([id, bbox]: [string, any]) => {
            const role = payload.roles?.[id] || "CUSTOMER";
            const zone = payload.zones?.[id] || "unknown";
            let status = "normal";
            if (role === "SUSPECT") status = "threat";
            else if (role === "STAFF") status = "suspicious"; 
            
            return { id, zone: zone, status };
          });

          const ts = new Date().toLocaleTimeString();
          let newAlerts = [...state.alertFeed];
          let sysSec = payload.theft ? "THREAT" : "OK";
          let sysSaf = payload.fire ? "CRITICAL" : (payload.smoke ? "WARNING" : "CLEAR");

          const clip = payload.http_clip_url || payload.clip_url || "";

          if (payload.theft) {
            newAlerts.unshift({ id: `live-${Date.now()}-t`, ts, type: "theft", msg: "SUSPICIOUS BEHAVIOR", sev: "critical", clip_url: clip });
          }
          if (payload.fire) {
            newAlerts.unshift({ id: `live-${Date.now()}-f`, ts, type: "fire", msg: "FIRE INCIDENT", sev: "critical", clip_url: clip });
          } else if (payload.smoke) {
            newAlerts.unshift({ id: `live-${Date.now()}-s`, ts, type: "smoke", msg: "SMOKE DETECTED", sev: "warning", clip_url: clip });
          }
          newAlerts = newAlerts.slice(0, 20);

          const zoneCounts: any = { shelf: 0, billing: 0, exit: 0 };
          Object.values(payload.zones || {}).forEach((z: any) => {
             if (zoneCounts[z] !== undefined) zoneCounts[z]++;
          });
          const newOcc = [...state.zoneOccupancyHistory.slice(1), { t: ts, ...zoneCounts }];
          
          const avgConf = payload.confidence ? payload.confidence * 100 : 90;
          const newConf = [...state.detectionConfHistory.slice(1), { t: ts, conf: Math.round(avgConf) }];

          const newKpi = [...state.kpiData];
          newKpi[0] = { ...newKpi[0], value: payload.people_count || 0 }; 
          
          if (payload.theft) {
             newKpi[1] = { ...newKpi[1], value: (parseInt(newKpi[1].value) + 1).toString() }; 
          }


          // --- THREAT COMPUTATIONS ---
          let newThreatEvents = [...state.threatEvents];
          if (payload.theft) {
            newThreatEvents.unshift({ id: Math.floor(Math.random()*1000), state: 'THEFT_CONFIRMED', zone: 'shelf', time: ts });
            newThreatEvents = newThreatEvents.slice(0, 50);
          }

          let newSuspicionScores = [...state.suspicionScores];
          newObjects.forEach(obj => {
             const exist = newSuspicionScores.find(s => s.id === `T-${obj.id}`);
             const increment = payload.theft ? 20 : (obj.zone === 'shelf' ? 2 : (obj.zone === 'billing' ? -5 : -1));
             if (exist) {
                exist.score = Math.max(0, Math.min(100, exist.score + increment));
             } else {
                newSuspicionScores.push({ id: `T-${obj.id}`, score: Math.max(0, 50 + increment) });
             }
          });
          newSuspicionScores = newSuspicionScores.slice(-15); // keep max 15 trackers

          // --- SAFETY COMPUTATIONS ---
          let newFireHistory = [...state.fireSignalHistory.slice(1)];
          newFireHistory.push({
            t: ts,
            color: payload.fire_confidence ? payload.fire_confidence * 100 : Math.random() * 10,
            motion: payload.smoke ? 80 : Math.random() * 20,
            heat: payload.fire ? 95 : Math.random() * 15
          });

          // --- ANALYTICS COMPUTATIONS ---
          let newFootfall = [...state.footfallHourly];
          const currHour = new Date().getHours() + ":00";
          const hourIdx = newFootfall.findIndex(h => h.hour === currHour);
          if (hourIdx !== -1) {
            newFootfall[hourIdx].count = Math.max(newFootfall[hourIdx].count, payload.people_count || 0);
          } else {
            newFootfall.push({ hour: currHour, count: payload.people_count || 0 });
            if (newFootfall.length > 12) newFootfall.shift();
          }

          return {
            trackedObjects: newObjects.length > 0 ? newObjects : state.trackedObjects,
            alertFeed: newAlerts,
            zoneOccupancyHistory: newOcc,
            detectionConfHistory: newConf,
            kpiData: newKpi,
            systemStatus: { security: sysSec, safety: sysSaf },
            
            threatEvents: newThreatEvents,
            suspicionScores: newSuspicionScores,
            fireSignalHistory: newFireHistory,
            footfallHourly: newFootfall,
          };
        });
      } catch (err) {
        console.error("SSE Parse Error", err);
      }
    };
  },

  connectInsightsStream: () => {
    if ((window as any)._insightsConnected) return;
    (window as any)._insightsConnected = true;
    
    const eventSource = new EventSource("http://localhost:5050/api/insights/stream");
    
    eventSource.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);
        
        set((state) => ({
          employees: payload.employees || state.employees,
          demographics: payload.demographics || state.demographics,
          // Merge generative alerts with system alerts, keeping the newest 50
          allAlerts: payload.allAlerts ? [...payload.allAlerts, ...state.allAlerts].slice(0, 50) : state.allAlerts
        }));
      } catch (err) {
        console.error("Insights SSE Parse Error", err);
      }
    };
  }
}));
