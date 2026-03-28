# Watchr AI Engine - Comprehensive Implementation Deep-Dive

This document provides a low-level technical breakdown of the **Watchr** system to support the development of a production-grade monitoring dashboard.

---

## 🏗️ 1. Architecture & Data Ingestion
The system follows a **Pipe-and-Filter architecture**. The Python AI Engine acts as the primary data producer, outputting a high-frequency telemetry stream to `stdout`.

### Pipeline Execution Flow:
1.  **Capture**: [video_capture.py](file:///c:/Users/yashm/visor%20ai%20backend/Watchr/ai-engine/video_capture.py) initializes OpenCV streams (Webcam `0` or `fallback.mp4`).
2.  **Inference**: [detection.py](file:///c:/Users/yashm/visor%20ai%20backend/Watchr/ai-engine/detection.py) runs YOLOv8n on the BGR frame.
3.  **Linkage**: [tracking.py](file:///c:/Users/yashm/visor%20ai%20backend/Watchr/ai-engine/tracking.py) correlates detections with historical Centroids.
4.  **Spatial Context**: [zone_mapping.py](file:///c:/Users/yashm/visor%20ai%20backend/Watchr/ai-engine/zone_mapping.py) assigns IDs to geometric polygons.
5.  **Behavioral Analysis**: [theft_detection.py](file:///c:/Users/yashm/visor%20ai%20backend/Watchr/ai-engine/theft_detection.py) updates state machines based on zone entry/exit events.
6.  **Safety**: [fire_detection.py](file:///c:/Users/yashm/visor%20ai%20backend/Watchr/ai-engine/fire_detection.py) monitors pixel-level delta changes for smoke/flame signatures.
7.  **Broadcast**: [main.py](file:///c:/Users/yashm/visor%20ai%20backend/Watchr/ai-engine/main.py) aggregates all module outputs into a single JSON object.

---

## 🧠 2. Deep-Dive: Modular Logic & Thresholds

### A. Detection & Stability ([detection.py](file:///c:/Users/yashm/visor%20ai%20backend/Watchr/ai-engine/detection.py))
*   **Model**: YOLOv8 Nano ([yolov8n.pt](file:///c:/Users/yashm/visor%20ai%20backend/Watchr/ai-engine/yolov8n.pt)) optimized for edge inference.
*   **Thresholds**:
    *   `conf_thresh = 0.50`: Minimum confidence to register a "Person".
    *   `buffer_size = 5`: Sliding window size for temporal verification.
    *   `min_stable = 3`: A person is only "Confirmed" if detected in 3 out of 5 frames (prevents "ghost" detections).

### B. Centroid Tracking ([tracking.py](file:///c:/Users/yashm/visor%20ai%20backend/Watchr/ai-engine/tracking.py))
*   **Logic**: Greedy Euclidean distance matching.
*   **Persistence**:
    *   `max_distance = 50px`: Threshold to assign a new detection to an existing ID.
    *   `max_missed = 5`: Frames an ID is kept in memory after disappearing (handles brief occlusions behind shelves).

### C. Spatial Mapping ([zone_mapping.py](file:///c:/Users/yashm/visor%20ai%20backend/Watchr/ai-engine/zone_mapping.py))
*   **Coordinate System**: Normal OpenCV integer coordinates (0,0 is top-left).
*   **Collision Detection**: Ray-casting or Point-in-Rectangle mapping.
*   **Zones Configuration**: Loaded from [auto_zones.json](file:///c:/Users/yashm/visor%20ai%20backend/Watchr/ai-engine/auto_zones.json). If missing, falls back to hardcoded retail coordinates.

### D. Theft State Machine ([theft_detection.py](file:///c:/Users/yashm/visor%20ai%20backend/Watchr/ai-engine/theft_detection.py))
This is the core business logic. It tracks **Transitions** between semantic states:
1.  **ID Initialization**: Every new tracker ID gets a clean state object.
2.  **Shelf Engagement**: Triggered when `dwell_time > 3` (default `shelf_dwell_threshold`) in the `shelf` zone.
3.  **Billing Neutralization**: If the ID enters the `billing` zone, it is "cleared" from suspicion.
4.  **Suspicious Exit**: If an ID enters the `exit` zone while having visited the shelf but NOT the billing area:
    *   An internal `theft_counter` increments per frame.
    *   When counter hits `3` (default `theft_confirm_threshold`), a **Theft Alert** is broadcast.

### E. Safety Sentinel ([fire_detection.py](file:///c:/Users/yashm/visor%20ai%20backend/Watchr/ai-engine/fire_detection.py))
Uses a **Triple-Signal Validation** approach to minimize false positives:
1.  **Color Signal**: HSV mapping isolates flame-like oranges (`H:0-35, S:120-255, V:200-255`).
2.  **Motion Signal**: Frame differencing (`cv2.absdiff`) detects the high-frequency flicker characteristic of flames.
3.  **Heatmap Signal**: A "Supreme AI Heatmap" accumulates motion/color intersections and decays at a rate of `0.85` per frame.
4.  **Trigger**: Fire is confirmed only if the "Stable Fire Core" (pixels with heat > `15.0`) exceeds `5000` pixels.

### F. Employee Kiosk ([employee_kiosk.py](file:///c:/Users/yashm/visor%20ai%20backend/Watchr/ai-engine/employee_kiosk.py))
A dedicated sign-in terminal for staff profiling:
*   **Face Analysis**: Uses Haar Cascades for real-time frontal face detection.
*   **Uniform Signature**: Uses **K-Means Clustering** (k=3) on the torso region to extract the dominant "Uniform Color".
*   **Auto-Registration**: Generates `EMP-7xxx` IDs and stores them in `employee_db.json`.

---

## 🛠️ 3. Dashboard Integration Roadmap

### Step 1: The Gateway (Backend)
You need a process to "tail" the AI engine's output and convert it into a dashboard-friendly format.
*   **Technology**: Node.js (Child Process) or Python (Subprocess).
*   **Protocol**: WebSockets (Socket.io) for real-time UI updates.
*   **Database**: Supabase or PostgreSQL to store specific `alert` events (Theft/Fire) with captured timestamps.

### Step 2: The UI Components
1.  **Live Canvas**: An `HTML5 Canvas` or `SVG` layer that maps the `objects` dictionary to bounding boxes.
    - *Formula*: Scale `x1, y1` coordinates by [(video_display_width / raw_frame_width)](file:///c:/Users/yashm/visor%20ai%20backend/Watchr/ai-engine/main.py#16-197).
2.  **Alert Ticker**: A reactive feed that shows "ID #5 occupied Shelf for 5s", "ID #12 at Exit without Billing".
3.  **Heatmap**: A visualization of the [auto_zones.json](file:///c:/Users/yashm/visor%20ai%20backend/Watchr/ai-engine/auto_zones.json) metrics showing which areas have the highest cumulative `dwell_time`.
4.  **Status Badges**: 
    - `Security: OK / BREACH`
    - `Safety: CLEAR / FIRE`

### Step 3: Interactive Calibration
The [auto_calibrator.py](file:///c:/Users/yashm/visor%20ai%20backend/Watchr/ai-engine/auto_calibrator.py) provides the raw data. The dashboard should allow an admin to:
- View the learned [auto_zones.json](file:///c:/Users/yashm/visor%20ai%20backend/Watchr/ai-engine/auto_zones.json).
- Manual override coordinates for the Billing, Shelf, and Exit zones.

---
*Created for deep-dive technical alignment.*
