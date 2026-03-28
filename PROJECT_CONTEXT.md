# VisionIQ (Watchr) — Complete Project Context

> **This document is written for AI handover. It covers every file, every function, every design decision, and the current implementation status from scratch. Read this before touching any code.**

---

## 1. Project Identity

| Field | Value |
|---|---|
| **Product Name** | VisionIQ (internally codenamed **Watchr**) |
| **Repo** | https://github.com/LakshyaBetala/Watchr |
| **Root Directory** | `C:\Users\yashm\Watchr` |
| **Type** | B2B AI-integrated smart surveillance platform |
| **Target Market** | Retail, F&B, Fashion, Warehouses, Hospitality in India and emerging markets |

---

## 2. Business Idea — The Full Picture

### The Problem
Traditional CCTV is **passive**. It records incidents after they happen. Businesses using it face four compounding crises:

| Crisis | Detail |
|---|---|
| 📦 Retail Loss | Shoplifting surged 93% globally between 2019–2023. CCTV doesn't prevent it. |
| 👀 Zero Customer Intel | No visibility into which products attract attention, dwell time, or footfall patterns. |
| 🧑‍💼 Unmonitored Staff | Managers can't see if staff are in their zones, idle, or skipping tasks — especially across large stores. |
| 🔥 Fire & Safety Lag | Traditional alarms react too late; they can't distinguish real fire from cigarette smoke or steam. |

### The Solution — A "Big Five" Module Platform
VisionIQ replaces five separate tools with **one unified edge-deployed platform**:

1. **Theft & Loss Prevention**: AI detects suspicious behavior (concealment gestures, bypassing billing before exiting).
2. **Customer Analytics**: Real-time heatmaps, footfall counting, dwell time per zone, demographic estimation.
3. **Staff Productivity Monitor**: Zone adherence, task verification, idle time detection.
4. **AI Fire & Smoke Detection**: Triple-signal validation (color + motion + heatmap) to minimize false positives.
5. **People Re-ID**: Tracks people across camera zones using appearance-based vectors without biometric databases.

### Revenue Model
- **Hardware Sale**: One-time AI camera and edge processor sale (creates lock-in).
- **SaaS Subscription**: Monthly/annual fee per camera/store for dashboard and AI updates.
- **Analytics Reports**: Premium margin monthly intelligence reports.
- **Integration Fee**: POS/ERP API integration setup.

---

## 3. Repository Structure

```
Watchr/
├── ai-engine/          — Python AI module (primary telemetry producer)
│   ├── main.py
│   ├── video_capture.py
│   ├── detection.py
│   ├── tracking.py
│   ├── zone_mapping.py
│   ├── theft_detection.py
│   ├── fire_detection.py
│   ├── employee_kiosk.py
│   ├── auto_calibrator.py
│   ├── auto_zones.json
│   ├── multi_camera.py
│   ├── export_onnx.py
│   ├── requirements.txt
│   ├── yolov8n.pt          — YOLOv8 Nano model weights (6.5 MB)
│   └── yolov8n.onnx        — ONNX export of the same model (12.7 MB)
│
├── backend/            — Node.js/WebSocket bridge (PLACEHOLDER — not implemented yet)
│   └── README.md
│
├── frontend/           — React/Vite dashboard (primary active codebase)
│   ├── src/
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   ├── index.css
│   │   ├── components/
│   │   │   ├── watchr/
│   │   │   │   └── WatchrShell.tsx
│   │   │   ├── landing/
│   │   │   └── ui/              — Shadcn UI components
│   │   ├── pages/
│   │   │   ├── watchr/
│   │   │   │   ├── LiveCanvas.tsx
│   │   │   │   ├── ThreatMonitor.tsx
│   │   │   │   ├── SafetySentinel.tsx
│   │   │   │   ├── EmployeeKiosk.tsx
│   │   │   │   ├── CustomerAnalytics.tsx
│   │   │   │   ├── AlertsCenter.tsx
│   │   │   │   └── Settings.tsx
│   │   │   └── [landing pages...]
│   │   ├── data/
│   │   │   ├── watchrMockData.ts
│   │   │   └── [other data files]
│   │   ├── hooks/
│   │   ├── lib/
│   │   └── store/
│   └── package.json
│
└── PROJECT_CONTEXT.md  — This file
```

---

## 4. AI Engine — Complete Deep-Dive

The AI engine is the **heart** of the system. It is a standalone Python application that processes video frames and outputs a structured JSON telemetry stream to `stdout`. It follows a **Pipe-and-Filter architecture** where each module is fault-tolerant and isolated.

### 4.1 `requirements.txt`
```
ultralytics
opencv-python
```
No other dependencies. The engine is intentionally minimal to run on edge hardware.

---

### 4.2 `video_capture.py`
**Role**: Fault-tolerant video input layer. Abstracts the camera source.

**Key Function: `initialize_capture(source)`**
- Accepts either an integer (webcam index, e.g., `0`) or a string path (e.g., `"fallback.mp4"`).
- Calls `cv2.VideoCapture(source)`.
- Returns the capture object if `.isOpened()` is True, else returns `None`.

**`main()` logic (standalone):**
1. Attempts `VideoCapture(0)` — live webcam.
2. If webcam fails, automatically switches to `"fallback.mp4"`.
3. In the frame loop, tracks `consecutive_failures`. If >10 failures occur:
   - If using webcam: switches to fallback video.
   - If using fallback video (which reached the end): loops it back to frame 0 using `cap.set(cv2.CAP_PROP_POS_FRAMES, 0)`.
4. FPS is overlayed live on the frame.
5. ESC key exits cleanly.

**Used by `main.py`**: Only the `initialize_capture()` function is imported; the `main()` standalone function is for testing only.

---

### 4.3 `detection.py`
**Role**: YOLOv8 inference layer with temporal stability anti-flicker filtering.

**Class: `PersonDetector`**

**`__init__(model_name, conf_thresh, buffer_size, min_stable)`**
- Loads `yolov8n.pt` via `ultralytics.YOLO`.
- Default params: `conf_thresh=0.5`, `buffer_size=5`, `min_stable=3`.
- Creates a `deque(maxlen=5)` as a sliding window history buffer.

**`detect(frame)` → returns `{"people_count": int, "detections": list, "stable": bool}`**

Step-by-step:
1. Runs `self.model(frame, verbose=False)` — YOLO inference on the BGR frame.
2. Filters results: only tracks boxes where `cls_id == 0` (COCO class for "person") AND `conf >= conf_thresh`.
3. Extracts `[x1, y1, x2, y2, conf]` for each qualifying detection.
4. **Stability Layer**: Records `True/False` (did we see anyone?) into the history deque.
5. `stable = sum(history) >= min_stable` — a person is "stable" only if detected in at least 3 of the last 5 frames. This eliminates ghost detections.
6. Draws colored bounding boxes: **Green** = stable, **Orange** = unstable.
7. Returns the detections list and stability status.

**Key insight**: The `detections` list is what feeds into the `CentroidTracker`. Each item is `[x1, y1, x2, y2, conf]`.

---

### 4.4 `tracking.py`
**Role**: Multi-object identity persistence using Euclidean Centroid Tracking.

**Class: `CentroidTracker`**

**`__init__(max_distance, max_missed)`**
- `max_distance=50`: Max pixel distance to consider a new detection as the same person.
- `max_missed=5`: An ID is kept alive for 5 frames even if not detected (handles walking behind a shelf).
- `self.objects`: Internal dict `{id: {"centroid": (x,y), "bbox": [...], "missed_frames": int}}`.
- `self.next_id = 1`: Auto-incrementing unique integer ID.

**`track(detections)` → returns `{"people_count": int, "ids": list, "objects": {str(id): [x1,y1,x2,y2,conf]}}`**

Step-by-step:
1. **No detections**: Increments `missed_frames` for all tracked objects. Deletes any that exceed `max_missed`.
2. **First-time tracking** (empty `self.objects`): Registers every detection as a new ID.
3. **Matching**: Builds all pairwise Euclidean distances between existing centroids and new detection centroids. Sorts by shortest distance (greedy nearest-neighbor matching).
4. Assigns the new detection to the existing ID if `dist < max_distance`, resets its `missed_frames` to 0.
5. Any existing IDs that were NOT matched → increment `missed_frames`, delete if over limit.
6. Any new detections that were NOT matched → register as a brand new ID.

**`_register(centroid, bbox)`**: Adds to `self.objects` under `self.next_id`, increments the counter.

**`_format_output()`**: Converts internal dict to the strict output format. Object IDs are stringified (`str(id)`) in the output.

**Visual**: `visualize_tracking(frame, tracking_response)` draws per-ID pseudo-random colored boxes and centroid dots.

---

### 4.5 `zone_mapping.py`
**Role**: Converts pixel coordinates to semantic store areas (Shelf, Billing, Exit).

**Class: `ZoneMapper`**

**`__init__(zones=None)`**
- If `zones` is `None`, loads hardcoded fallback rectangles:
  ```python
  "shelf":   [(100, 100), (300, 400)]
  "billing": [(400, 150), (600, 300)]
  "exit":    [(400, 350), (600, 480)]
  ```
- **CRITICAL**: Checks if `auto_zones.json` exists. If it does, overrides the hardcoded zones with dynamically learned coordinates. This is the "SUPREME AI" override.

**`_is_inside(point, zone_bbox)`**:
- Checks `zx1 <= px <= zx2` and `zy1 <= py <= zy2`.
- Handles both 2-tuple format `[(x1,y1), (x2,y2)]` and flat 4-element format.

**`map_zones(objects)` → returns `{"zones": {str(id): "zone_name"}}`**
- For each tracked object, computes its centroid.
- Iterates through all zones. First match wins (zones are assumed non-overlapping).
- Default zone if no match: `"unknown"`.

**`auto_zones.json`** (currently committed with real calibration data):
```json
{
    "billing": [[79, 134], [255, 429]],
    "shelf":   [[234, 203], [499, 520]],
    "exit":    [[234, 89],  [690, 520]]
}
```
These coordinates were captured by running `auto_calibrator.py` with a real store walkthrough.

---

### 4.6 `theft_detection.py`
**Role**: The core business logic. A behavioral state machine that detects theft patterns.

**Class: `TheftDetectionEngine`**

**`__init__(shelf_dwell_threshold=3, theft_confirm_threshold=3)`**
- `self.states`: Per-ID dictionary holding behavioral state.

**`_init_state()`**: Returns a fresh state template:
```python
{
  "visited_shelf": False,
  "visited_billing": False,
  "entered_exit": False,
  "dwell_time": 0,           # Frames spent in shelf zone
  "dwell_time_billing": 0,   # Frames spent at billing counter
  "last_zone": "unknown",
  "theft_counter": 0         # Consecutive "suspicious" frames
}
```

**`detect_theft(zones_dict)` → returns `{"theft": bool, "suspects": [ids], "roles": {id: role}}`**

Step-by-step:
1. **Stale ID cleanup**: If an ID that was being tracked disappears from the tracking pipeline (person left frame), wipes their state to prevent memory leaks.
2. **Per-ID state update**:
   - `shelf` zone → increments `dwell_time`. If `dwell_time > 3`, marks `visited_shelf = True`.
   - `billing` zone → increments `dwell_time_billing`, marks `visited_billing = True`. This "clears" the person from suspicion.
   - `exit` zone → marks `entered_exit = True`.
3. **Theft Evaluation** (the core rule):
   - If `visited_shelf == True` AND `visited_billing == False` AND `entered_exit == True`:
   - Increments `theft_counter`.
   - When `theft_counter >= 3` (sustained for 3 consecutive frames): **THEFT CONFIRMED**.
   - After confirmation, the state is **reset** to prevent repeated alerts for the same person.
4. **Role Classification**:
   - If `dwell_time_billing > 60` frames → classified as `"STAFF"` (they're behind the counter).
   - Otherwise → `"CUSTOMER"`.
   - Confirmed suspects → `"SUSPECT"` (overrides the above).

**Output payload**: `{"theft": True/False, "suspects": [list_of_ids], "roles": {id: "CUSTOMER"/"STAFF"/"SUSPECT"}}`.

---

### 4.7 `fire_detection.py`
**Role**: High-confidence fire and smoke detection using 5-signal validation to eliminate false positives.

**Class: `FireDetector`**

**`__init__(area_threshold=5000, buffer_size=5, min_trigger=3)`**
- HSV color range for flames: `lower=[0, 120, 200]`, `upper=[35, 255, 255]` — isolates orange/yellow hues at high brightness.
- `self.heatmap`: A 2D float32 accumulator map (same size as frame). Starts at `None`, initialized on first frame.
- `heatmap_decay = 0.85`: The heatmap cools by 15% every frame. This means a static orange object (e.g., an orange shirt that isn't moving) will be ignored.
- `heatmap_threshold = 15.0`: A pixel must have accumulated at least ~15 consecutive positive readings to be considered part of the "stable fire core".

**`detect_fire(frame, prev_frame)` → returns `{"fire": bool}`**

The 5-signal pipeline:
1. **SIGNAL 1 — Color**: Convert frame to HSV. Apply color range mask to isolate flame-colored pixels.
2. **SIGNAL 2 — Motion**: `cv2.absdiff(frame, prev_frame)` → detect pixel changes between frames. Threshold at 25 to create a binary motion mask. This detects flickering.
3. **SIGNAL 3 — Combined Region**: `fire_mask = color_mask AND motion_mask`. A pixel must be BOTH flame-colored AND flickering to qualify. This is what eliminates static orange objects.
4. **SIGNAL 4 — Heatmap Integration**: 
   - Adds `fire_mask / 255.0 * 2.0` to the accumulator.
   - Multiplies the entire heatmap by `0.85` (decay). 
   - Thresholds the heatmap at 15.0 to extract the `stable_fire_core` — regions that have been burning continuously.
   - Counts non-zero pixels in `stable_fire_core`. If `> area_threshold (5000)`, sets `fire_candidate = True`.
5. **SIGNAL 5 — Temporal Validation**: Appends `fire_candidate` boolean to a `deque(maxlen=5)`. Fire is only **confirmed** if `sum(history) >= 3` (true in 3 of last 5 frames).

**Key design insight**: A static orange shirt → passes Signal 1, fails Signal 2 (no motion diff if just standing). A real flame → passes all 5 signals because it flickers.

---

### 4.8 `employee_kiosk.py`
**Role**: A dedicated sign-in terminal for staff to register their uniform color signature.

**Class: `EmployeeKiosk`**

**`__init__()`**:
- Loads OpenCV's built-in Haar Cascade classifier (`haarcascade_frontalface_default.xml`) for real-time face detection. **No GPU required.**
- Loads `employee_db.json` if it exists, otherwise starts with empty `{}`.

**`extract_dominant_color(image, k=3)` — The ML component**:
- Takes a cropped image region (the torso/uniform area).
- Reshapes it to a flat list of pixels.
- Runs **K-Means clustering** (k=3 clusters) using `cv2.kmeans`.
- Returns the BGR value of the most common color cluster — the "dominant uniform color".
- This is what makes re-identification possible without face recognition.

**`start_kiosk()`**:
1. Opens webcam. Overlays a dark header banner reading "SUPREME SECURE SIGN-IN".
2. Runs Haar Cascade `detectMultiScale` to detect faces in real-time.
3. When a face is detected, dynamically calculates the **torso region** based on face proportions:
   - `torso_y1 = face_y + face_height`
   - `torso_y2 = face_y + face_height * 3.0`
   - `torso_x` is widened (0.7× face_width on each side).
4. Draws the "UNIFORM SCAN AREA" rectangle around the estimated torso.
5. **'S' key**: Captures the torso ROI, extracts dominant color, generates an ID (`EMP-7001`, `EMP-7002`...), and saves to `employee_db.json`.
6. **`employee_db.json` format**:
   ```json
   { "EMP-7001": { "uniform_bgr": [34, 45, 180], "status": "Shift_Started" } }
   ```

---

### 4.9 `auto_calibrator.py`
**Role**: An interactive guided UI to automatically learn the physical store zone coordinates. Removes the need for manual coordinate entry.

**Class: `SequencedCalibrator`**

**`calibrate_step(cap, zone_name, instruction, frames_to_watch=200)`**:
1. Shows a red "PREPARE" countdown banner for 5 seconds.
2. For 200 frames (~6-7 seconds at 30fps), watches for people moving in the specified area.
3. For each detected person, plots their "feet anchor" (bottom-center of bounding box) onto a float32 `feet_heatmap` accumulator using a circle of radius 35.
4. After collecting data, normalizes the heatmap, applies a threshold at 100, finds contours.
5. Takes the largest contour, gets its bounding rect, inflates it by 50px (x-axis) and 180px (y-axis upward) to match full body height.
6. Saves result as `self.computed_zones[zone_name] = [(x1, y1), (x2, y2)]`.

**`run_full_calibration()`**:
- Runs 3 sequential steps: `billing` → `shelf` → `exit`.
- Saves all learned zones to `auto_zones.json`.

**How to re-calibrate**: Run `python auto_calibrator.py` in the `ai-engine/` directory. Walk to each zone when prompted. The new coordinates will override `auto_zones.json` and be automatically picked up by the main engine on next start.

---

### 4.10 `main.py`
**Role**: The orchestration loop. Glues all modules together and produces the unified JSON output stream.

**Initialization**:
```python
detector    = PersonDetector(model_name="yolov8n.pt", conf_thresh=0.5)
tracker     = CentroidTracker(max_distance=50, max_missed=5)
zone_mapper = ZoneMapper()
theft_engine = TheftDetectionEngine(shelf_dwell_threshold=3, theft_confirm_threshold=3)
fire_engine  = FireDetector(area_threshold=5000, buffer_size=5, min_trigger=3)
```

**Per-frame pipeline (inside `while True` loop)**:
```
Frame → detect() → track() → map_zones() → detect_theft() → detect_fire()
```

Each step wrapped in `try/except`. If any module crashes, it returns a safe empty default and the pipeline continues.

**Final JSON payload broadcast**:
```json
{
  "camera_id": 1,
  "people_count": 2,
  "ids": [1, 2],
  "objects": {
    "1": [x1, y1, x2, y2, conf],
    "2": [x1, y1, x2, y2, conf]
  },
  "zones": {
    "1": "shelf",
    "2": "billing"
  },
  "roles": {
    "1": "CUSTOMER",
    "2": "STAFF"
  },
  "theft": false,
  "suspects": [],
  "fire": false
}
```

Broadcast via `logger.info(json.dumps(system_payload))` to `stdout`. The backend is expected to read this stream and forward to frontend via WebSocket.

**Visualization overlay** (OpenCV window "Watchr AI Engine - LIVE"):
- Draws zone rectangles (from `visualize_zones()`).
- Draws per-ID role labels in color (CUSTOMER=cyan, STAFF=blue, SUSPECT=red).
- Shows "Staff Logged: N | Customers: N" metrics.
- Shows `🚨 SUSPICIOUS ACTIVITY` banner with confidence if theft is active.
- Shows `🔥 FIRE DETECTED` if fire is confirmed.

---

### 4.11 `multi_camera.py`
**Role**: Extends the system to handle multiple camera feeds concurrently. Each camera runs its own detection and tracking pipeline. (Implementation exists but is not integrated into the main orchestration flow yet.)

### 4.12 `export_onnx.py`
**Role**: Exports the `yolov8n.pt` model to ONNX format for deployment on devices without PyTorch (e.g., Raspberry Pi, Hailo). The `.onnx` file (12.7 MB) is already committed.

---

## 5. Backend — Current Status

**Location**: `Watchr/backend/`

**Status**: **PLACEHOLDER**. The `README.md` contains only "just a placeholder file".

**Planned Architecture** (not yet implemented):
- **Technology**: Node.js with `child_process` to spawn `python main.py` as a subprocess.
- **Protocol**: WebSockets via `Socket.io` to broadcast the JSON telemetry from Python `stdout` to all connected frontend clients in real-time.
- **Database**: Supabase or PostgreSQL to persist confirmed theft/fire alerts with timestamps.
- **Integration points**: REST API endpoints for POS/ERP systems.

**What needs to be built**:
1. A Node.js process that reads from Python's stdout line-by-line.
2. A Socket.io server that emits each JSON line as a `telemetry` event.
3. An alerts persistence service that writes only `theft: true` or `fire: true` events to the database.

---

## 6. Frontend — Complete Deep-Dive

**Location**: `Watchr/frontend/`
**Framework**: React 18 + Vite 7 + TypeScript
**Styling**: Tailwind CSS (dark "Cyber-Ops" theme) + custom CSS in `index.css`
**Component Library**: Shadcn UI (located in `src/components/ui/`)
**Routing**: React Router v6
**Charts**: Recharts
**Animation**: Framer Motion
**Icons**: Lucide-React
**State**: No global state manager yet; components use local `useState` and `useEffect`. Mock data is imported from `src/data/watchrMockData.ts`.

### 6.1 `src/main.tsx`
Standard Vite React entry point. Mounts `<App />` to the `#root` div.

### 6.2 `src/App.tsx`
**Role**: Application root. Configures routing for both landing pages and the dashboard.

**Two distinct sections**:
1. **Landing pages** (`/`, `/approach`, `/capabilities/:slug`, `/solutions`, etc.): These are marketing pages for VisionIQ.
2. **Watchr Dashboard** (all `/dashboard/*` routes): Wrapped in `<WatchrShell>` layout component.

**`ScrollToTop` component**: Scrolls to top on every route change, except for routes starting with `/dashboard` (dashboard pages don't need this).

**Dashboard routes**:
| Route | Component |
|---|---|
| `/dashboard` | `<LiveCanvas />` |
| `/dashboard/threat-monitor` | `<ThreatMonitor />` |
| `/dashboard/safety` | `<SafetySentinel />` |
| `/dashboard/kiosk` | `<EmployeeKiosk />` |
| `/dashboard/customer-analytics` | `<CustomerAnalytics />` |
| `/dashboard/alerts` | `<AlertsCenter />` |
| `/dashboard/settings` | `<Settings />` |

### 6.3 `src/index.css`
Global styles. Contains the "Cyber-Ops" design system:
- `font-display` class (used for titles) — mapped to a premium display font.
- `.tactical-panel` class — the reusable dark card with a subtle radial glow background.
- `.scanline` — a CSS animation that creates a subtle horizontal scan line sweeping across the screen, adding to the surveillance aesthetic.
- Base background color: `#0a0c10` (deep near-black).
- Primary accent: `#00F0FF` (electric cyan).
- Threat accent: `#FF003C` (alarm red).
- Warning: `#F59E0B` (amber).
- Success/safe: `#10b981` (emerald green).

### 6.4 `src/components/watchr/WatchrShell.tsx`
**Role**: The persistent dashboard layout wrapper. Everything in `/dashboard/*` is rendered inside this.

**Key sub-components**:

**`WatchrLogo`**:
- Renders the animated "V" logo with a CSS glitch effect.
- Two `<span>` overlays positioned with `mix-blend-exclusion` — one in cyan offset right, one in red offset left. Creates a chromatic aberration glitch effect on the white "V".
- Logo text "WATCHR" and "AI ENGINE v2.6" animate in/out with Framer Motion when sidebar is expanded/collapsed.

**`NavItem`**:
- Renders a single sidebar navigation link.
- Uses Framer Motion `layoutId="activeBar"` for a spring-animated left border indicator that smoothly slides between nav items.
- When sidebar is **collapsed**: Shows icon only + an animated tooltip on hover (appears to the right of the sidebar).
- When sidebar is **expanded**: Shows icon + label + sublabel in monospace font.
- Alert badge (e.g., the `3` on Alerts Center) pulses with a scale animation.

**`SysTelemetry`** (bottom of sidebar):
- Shows a pulsing green dot "ENGINE LIVE" indicator.
- Simulates FPS (24-32 range) and CPU % (28-48 range) with `setInterval` that updates every 2.5 seconds.
- Renders a CPU% progress bar with Framer Motion animated width.

**`WatchrShell` main layout**:
- A dark `bg-[#0a0c10]` full-screen flex container.
- The sidebar animates between `width: 64px` (collapsed) and `width: 220px` (expanded) via Framer Motion `layout` prop.
- The main content area has:
  - Two radial gradient atmosphere glows (cyan top-left, red bottom-right).
  - A subtle grid overlay (40px squares at 1.8% opacity).
  - A `scanline` CSS animation element.
  - Page content wrapped in `AnimatePresence` with `mode="wait"` for smooth fade+slide transitions between routes.

**SIDEBAR_LINKS array**: The canonical navigation configuration. Each entry has `icon`, `path`, `label`, `sublabel`, `color` (the active accent color), and optionally `badge`.

### 6.5 `src/data/watchrMockData.ts`
**Role**: All mock/simulated data that feeds the dashboard charts, KPI cards, and event logs. This is what drives the UI while the real backend WebSocket is not yet connected.

**Key exports**:
- `kpiData`: Array of KPI cards for the Live Canvas overview (people count, alert count, etc.).
- `alertFeed`: Initial list of alert events with timestamps, severity, and message.
- `zoneOccupancyHistory`: Time-series data for the zone occupancy area chart.
- `detectionConfHistory`: Time-series data for detection confidence sparkline.
- `trackedObjects`: Array of mock tracked person objects with their zone and status (normal/suspicious/threat).
- `ZONES`: Zone definitions.
- `threatEvents`: Threat event log for Threat Monitor page.
- `stateTransitionData`: Time-series data for "State Transitions per Minute" chart.
- `suspicionScores`: Per-ID suspicion risk scores for the bar chart.

### 6.6 `src/pages/watchr/LiveCanvas.tsx`
**Route**: `/dashboard` (the home/overview page)
**Role**: Real-time global overview. Shows zone telemetry, KPI metrics, and live alert feed.

**Sub-components**:
- **`AnimCounter`**: A number counter that smoothly animates from 0 to its target value over 800ms using `setInterval` at 16ms intervals (60fps).
- **`GlowTooltip`**: Custom dark-themed tooltip for all Recharts charts in the dashboard.
- **`ZoneCanvas`**: SVG-based floor map visualization.
  - Uses an SVG `<pattern>` for the background grid.
  - Draws 4 zone rectangles (Shelf, Billing, Exit, Entrance) with radial gradient fills, thin colored borders, and corner bracket decorations.
  - Renders tracked person dots inside zones with pulsing ring animation (alternates between r=8 and r=12 every 1.2 seconds).
  - Dot color: cyan=normal, amber=suspicious, red=threat.
  - A horizontal scan line sweeps down the entire SVG every 3 seconds using SVG `<animateTransform>`.
- **`AlertTicker`**: Real-time alert feed.
  - Initially loaded from `alertFeed` mock data.
  - Generates new synthetic alerts every 4 seconds via `setInterval`, prepending them to the list (cap at 12 visible items).
  - Each alert slides in with Framer Motion spring animation and slides out on removal.
  - Alert severity styles: critical=red, warning=amber, ok=green, info=cyan.
- **`KpiCard`**: Stat display card with an `AnimCounter`, unit label, and trend indicator with directional arrows.

**Page layout**:
- Header with system status badges (SECURITY OK/BREACH, SAFETY CLEAR/FIRE).
- 4-column KPI grid.
- Main body: ZoneCanvas (left, flexible width) + right column with Occupancy chart, Confidence sparkline, and Alert Ticker.

### 6.7 `src/pages/watchr/ThreatMonitor.tsx`
**Route**: `/dashboard/threat-monitor`
**Role**: Deep-dive into theft detection analytics. Visualizes the state machine and behavioral events.

**Sub-components**:
- **`StateMachineViz`**: Visual pipeline diagram showing the 4 states (INIT → SHELF → BILLING/CLEAR → EXIT) as connected circles with animated gradient connector lines. Each state has its own color. The connector lines animate from 0 scale to full width on mount.

**Charts**:
- **Suspicion Risk Score Bar Chart** (Recharts `BarChart`): Shows per-tracker-ID risk scores (0-100). Bars are colored dynamically: `>90` = red (critical), `>70` = amber (warning), else cyan. Includes reference lines at 70 (WARN) and 90 (CRIT).
- **State Transitions per Minute Line Chart** (Recharts `LineChart`): 3 lines for CONFIRMED (red), ENGAGED (amber), CLEARED (green) events over time.

**Event Log**: Left panel. Selectable list of `threatEvents` sorted by time. Clicking an event highlights it and shows details. Uses `selectedId` state to track the active event.

**STATE_STYLES**: Maps state keys (`THEFT_CONFIRMED`, `SHELF_ENGAGED`, `BILLING_CLEARED`) to colors and icons.

### 6.8 `src/pages/watchr/SafetySentinel.tsx`
**Route**: `/dashboard/safety`
**Role**: Dedicated fire and safety telemetry view. Shows fire detection status, historical incident log, and sensor readings.

### 6.9 `src/pages/watchr/EmployeeKiosk.tsx`
**Route**: `/dashboard/kiosk`
**Role**: Frontend view of the employee registration system. Shows registered employee profiles, their uniform color signatures, and shift status.

### 6.10 `src/pages/watchr/CustomerAnalytics.tsx`
**Route**: `/dashboard/customer-analytics`
**Role**: Customer behavior intelligence page. Visualizes store-level heatmaps, footfall counts, dwell time per zone, and demographic breakdowns.

### 6.11 `src/pages/watchr/AlertsCenter.tsx`
**Route**: `/dashboard/alerts`
**Role**: Unified event feed aggregating all alert types (theft, fire, access violations). Supports filtering by severity.

### 6.12 `src/pages/watchr/Settings.tsx`
**Route**: `/dashboard/settings`
**Role**: Configuration interface. Covers organization details, camera configuration, AI thresholds (dwell threshold, confidence threshold), and zone calibration overrides.

---

## 7. Design System — "Cyber-Ops"

The dashboard follows a strict design language inspired by military ops dashboards and SIEM security platforms.

| Token | Value | Usage |
|---|---|---|
| Background | `#0a0c10` | Full page background |
| Surface | `#050507` | Sidebar background |
| Panel | `#11141a` | Cards, tooltips |
| Border | `#2d3440` | All panel borders |
| Muted text | `#8c9baf` | Labels, sublabels, secondary text |
| Accent Cyan | `#00F0FF` | Primary highlights, live elements |
| Threat Red | `#FF003C` | Theft, critical alerts |
| Warning Amber | `#F59E0B` | Suspicious activity, fire |
| Safe Green | `#10b981` | Billing cleared, OK status |
| Analytics Purple | `#a855f7` | Customer analytics |
| Font — Display | `font-display` | Titles (heavy, tracked) |
| Font — Mono | `IBM Plex Mono` | All data labels, stats |

**Animation constants**:
- Page transitions: `opacity: 0 → 1, y: 8 → 0, duration: 0.22s`
- Stagger children: `0.07s` delay between items
- Spring: `stiffness: 320, damping: 28`
- Sidebar: `stiffness: 400, damping: 38`

---

## 8. Dependency Stack

### Frontend `package.json` (pinned versions for stability)
```json
{
  "vite": "^7.0.0",
  "eslint": "^9.0.0",
  "@vitejs/plugin-react-swc": "^3.11.0",
  "vitest": "^3.2.4",
  "react": "^18.3.1",
  "framer-motion": "^11.x",
  "recharts": "^2.x",
  "lucide-react": "latest",
  "react-router-dom": "^6.x",
  "@tanstack/react-query": "^5.x"
}
```

> **Critical**: Vite must stay at `^7.x`. The `lovable-tagger` plugin and `@vitejs/plugin-react-swc@3.x` are incompatible with Vite 8.

### AI Engine `requirements.txt`
```
ultralytics
opencv-python
```

---

## 9. Task: How to Run

### Run the AI Engine
```powershell
cd ai-engine
python main.py
# Optional: recalibrate zones
python auto_calibrator.py
# Optional: register staff
python employee_kiosk.py
```

### Run the Frontend Dashboard
```powershell
cd frontend
npm install    # First time only
npm run dev    # Starts at http://localhost:8080
```

---

## 10. What Is NOT Yet Built

| Feature | Status |
|---|---|
| Backend WebSocket bridge | ❌ Not started |
| Real-time data in dashboard (currently mock data) | ❌ Not connected |
| Database persistence of alerts | ❌ Not started |
| Re-ID across multiple cameras | ⚠️ `multi_camera.py` exists but not integrated |
| POS/ERP API integration | ❌ Not started |
| Demographics estimation (age/gender) | ❌ Not started |
| Mobile alert push (WhatsApp/SMS) | ❌ Not started |

---

## 11. Key Design Decisions & Gotchas

1. **Why `auto_zones.json` format uses list-of-lists, not tuples**: JSON doesn't support tuples. The `ZoneMapper` handles conversion back to tuples on load.
2. **Why the theft counter resets after confirmation**: Prevents an infinite loop of alerts for the same "confirmed" theft event. The state resets so the person starts fresh.
3. **Why fire detection uses 5 signals instead of just color**: A person wearing an orange shirt would trigger a naive color-only detector. The combined motion+color+heatmap+area+temporal filters eliminate this class of false positive.
4. **Why the frontend uses mock data**: The backend WebSocket bridge doesn't exist yet. The mock data in `watchrMockData.ts` simulates what live telemetry would look like.
5. **Why Vite is pinned to 7**: `lovable-tagger` (a development tool in the project) has an explicit peer dependency on `vite < 8.0.0`. Upgrading breaks `npm install`.
6. **Centroid tracker IDs are integers internally but strings in the output dict**: The `_format_output()` method does `str(obj_id)`. This is because JSON keys must be strings. The theft engine and zone mapper both use the string version.

---

*Document last updated: March 2026. Read every section before writing any code.*
