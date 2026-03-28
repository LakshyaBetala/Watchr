import threading
import time
import json
import logging
import queue
import os
import google.generativeai as genai
from dotenv import load_dotenv
from config import Config

logger = logging.getLogger(__name__)
load_dotenv()

# SSE Queues for the frontend insights stream
insights_clients = []


class GeminiInsightsService:
    def __init__(self):
        self.buffer = []
        self.running = False
        self.thread = None
        # Stores the last parsed Gemini output so /api/analytics can serve
        # clients immediately (before the first 20 s batch fires).
        self.last_snapshot = {}

        # Configure Gemini
        api_key = os.getenv("GEMINI_API_KEY")
        if not api_key or api_key == "your_api_key_here":
            logger.warning("GEMINI_API_KEY not set in .env! Gemini Insights stream disabled.")
            return

        genai.configure(api_key=api_key)
        self.model = genai.GenerativeModel('gemini-1.5-flash')
        self.running = True
        self.start_thread()
        logger.info("Gemini Insights Service initialized. Buffering telemetry...")

    def start_thread(self):
        self.thread = threading.Thread(target=self._loop, daemon=True)
        self.thread.start()

    def add_event(self, event_data):
        if not self.running:
            return
        # Keep buffer lightweight (max 300 ≈ 30 s at 10 fps)
        if len(self.buffer) < 300:
            self.buffer.append(event_data)

    def _loop(self):
        while self.running:
            time.sleep(20)  # 20-second rolling window
            try:
                self._generate_insights()
            except Exception as e:
                logger.error(f"Gemini API Error: {str(e)}")

    def _generate_insights(self):
        if not self.buffer:
            return

        # Sample buffer (1 per 10 frames) to stay within token limits
        sampled_buffer = self.buffer[::10] if len(self.buffer) > 20 else self.buffer
        self.buffer.clear()

        # ── Build compact summary stats from the raw buffer ──────────────────
        people_counts  = [e.get("people_count", 0) for e in sampled_buffer]
        max_footfall   = max(people_counts) if people_counts else 0
        avg_footfall   = round(sum(people_counts) / len(people_counts), 1) if people_counts else 0
        any_theft      = any(e.get("theft", False) for e in sampled_buffer)
        any_fire       = any(e.get("fire",  False) for e in sampled_buffer)
        any_smoke      = any(e.get("smoke", False) for e in sampled_buffer)

        # Merge all roles and zone_dwell_times seen across the batch
        all_roles: dict = {}
        all_dwell: dict = {}
        all_zones: dict = {}
        all_confs: dict = {}
        camera_health  = []

        for e in sampled_buffer:
            all_roles.update(e.get("roles", {}))
            zdt = e.get("zone_dwell_times", {})
            for pid, zones in zdt.items():
                if pid not in all_dwell:
                    all_dwell[pid] = {}
                for zname, secs in (zones.items() if isinstance(zones, dict) else []):
                    all_dwell[pid][zname] = max(all_dwell[pid].get(zname, 0), secs)
            all_zones.update(e.get("zones", {}))
            all_confs.update(e.get("per_person_confidence", {}))
            if e.get("camera_health"):
                camera_health = e["camera_health"]  # use most recent list

        # Zone occupancy counts
        zone_counts: dict = {}
        for zname in all_zones.values():
            zone_counts[zname] = zone_counts.get(zname, 0) + 1

        # Per-zone dwell aggregation (seconds → minutes)
        zone_dwell_sum:   dict = {}
        zone_dwell_count: dict = {}
        for pid_dict in all_dwell.values():
            for zname, secs in pid_dict.items():
                zone_dwell_sum[zname]   = zone_dwell_sum.get(zname, 0) + secs
                zone_dwell_count[zname] = zone_dwell_count.get(zname, 0) + 1
        zone_avg_dwell = {
            z: round(zone_dwell_sum[z] / zone_dwell_count[z] / 60, 1)
            for z in zone_dwell_sum
        }

        current_hour = time.strftime("%H:00")

        prompt = f"""
You are Watchr's Retail Intelligence Engine. You have just processed {len(sampled_buffer)} telemetry frames (≈20 seconds) from a live CCTV surveillance system inside a retail store.

=== RAW TELEMETRY SUMMARY ===
- People in store (peak): {max_footfall}
- People in store (avg): {avg_footfall}
- Theft event detected: {any_theft}
- Fire event detected: {any_fire}
- Smoke event detected: {any_smoke}
- Current hour slot: {current_hour}
- Detected roles: {json.dumps(all_roles)}
- Zone occupancy counts: {json.dumps(zone_counts)}
- Per-zone average dwell (minutes): {json.dumps(zone_avg_dwell)}
- Per-person detection confidence: {json.dumps(dict(list(all_confs.items())[:20]))}
- Camera health: {json.dumps(camera_health)}

=== INSTRUCTIONS ===
Analyze the telemetry and produce a STRICTLY VALID JSON response with NO markdown, NO code fences, just raw JSON. Use this EXACT schema:

{{
  "employees": [
    {{
      "id": "EMP-001",
      "name": "Riya Sharma",
      "role": "Floor Associate",
      "status": "active",
      "shift": "Morning Shift",
      "zone": "shelf",
      "faceConf": 0.96,
      "uniform": "#10b981",
      "tasksCompleted": 8,
      "performanceScore": 87
    }}
  ],
  "shiftActivity": [
    {{ "time": "09:00", "staff": 3, "customers": 12, "incidents": 0 }}
  ],
  "demographics": [
    {{ "group": "18-24", "male": 4, "female": 5 }}
  ],
  "footfallHourly": [
    {{ "hour": "09:00", "count": 23 }}
  ],
  "heatmapZones": [
    {{ "zone": "Shelf A", "intensity": 72 }}
  ],
  "dwellByZone": [
    {{ "zone": "billing", "avgMin": 4.2 }}
  ],
  "allAlerts": [
    {{
      "id": "alert-1",
      "time": "Just now",
      "type": "Theft",
      "severity": "critical",
      "description": "Suspicious behavior near shelf zone.",
      "camera": "Cam 1",
      "module": "TheftMonitor",
      "store": "Store STR-001",
      "status": "active"
    }}
  ],
  "kpiSummary": {{
    "footfallToday": 342,
    "peakHour": "17:00",
    "avgDwellMin": 6.8,
    "activeThreatCount": 0,
    "staffOnFloor": 3
  }},
  "storesData": [
    {{ "id": "STR-001", "name": "Store Alpha", "status": "online", "cameras": {len(camera_health) or 1}, "alerts": 0 }}
  ],
  "camerasData": [
    {{ "id": "CAM-1", "store": "STR-001", "zone": "shelf", "status": "online", "fps": 28 }}
  ],
  "storeNarrative": "One-sentence summary of what happened in the last 20 seconds."
}}

=== RULES ===
- Derive `employees` ONLY from IDs with role=STAFF in the roles dict. If no STAFF detected, infer 1-2 plausible employees. Assign realistic Indian retail worker names.
- `shiftActivity` should have ~6 time slots covering today's working hours with realistic ramp-up/down of staff vs customers.
- `demographics` should reflect typical retail store gender/age splits across 4-5 age groups.
- `footfallHourly` must include the current hour ({current_hour}) with count={avg_footfall}. Generate ≥6 realistic prior hours.
- `heatmapZones` must cover ALL unique zones from the occupancy data: {list(zone_counts.keys())}. Use intensity 0-100.
- `dwellByZone` must be derived from zone_avg_dwell: {json.dumps(zone_avg_dwell)}. If empty, generate plausible values.
- `allAlerts` severity: "critical" for theft/fire, "warning" for smoke/crowd, "info" for cross-sell. Only generate alerts if events actually occurred.
- `kpiSummary.activeThreatCount` = {int(any_theft) + int(any_fire)}.
- `storesData` and `camerasData` must reflect the camera_health list provided.
- `storeNarrative` must mention the most significant event (theft/fire/normal activity).
- OUTPUT ONLY THE RAW JSON DICTIONARY. No commentary. No markdown.
"""

        response = self.model.generate_content(prompt)
        text = response.text.replace("```json", "").replace("```", "").strip()

        try:
            parsed = json.loads(text)

            # Cache the snapshot so /api/analytics can serve it immediately
            self.last_snapshot = parsed

            # Broadcast to all connected React SSE clients
            for q in insights_clients:
                if q.full():
                    try:
                        q.get_nowait()
                    except queue.Empty:
                        pass
                q.put(parsed)

            logger.info(f"✅ Gemini insights broadcast to {len(insights_clients)} client(s).")
        except json.JSONDecodeError as exc:
            logger.error(f"Gemini returned invalid JSON: {exc} — Raw: {text[:200]}")


# Global singleton initialized at backend launch
gemini_engine = GeminiInsightsService()
