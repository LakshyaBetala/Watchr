import os
import cv2
import json
import logging
import time
import datetime
import numpy as np
from collections import Counter
import requests
import threading

from multi_camera import MultiCameraManager
from detection import PersonDetector
from tracking import CentroidTracker, YOLOTracker, visualize_tracking
from zone_mapping import ZoneMapper, visualize_zones
from theft_detection import TheftDetectionEngine
from fire_detection import FireDetector
from auto_calibrator import ProductionCalibrator
from identity_manager import IdentityManager

logging.basicConfig(level=logging.INFO, format='%(message)s')
logger = logging.getLogger(__name__)

# ─── Camera Grid Coordinate Offsets ───────────────────────────────────
GRID_OFFSETS = [
    (0, 0),        # CAM 1 top-left
    (640, 0),      # CAM 2 top-right
    (0, 480),      # CAM 3 bottom-left
    (640, 480),    # CAM 4 bottom-right
]


def get_dominant_color(image, k=3):
    """Extract dominant color for ReID clothing matching."""
    try:
        pixels = image.reshape((-1, 3)).astype(np.float32)
        criteria = (cv2.TERM_CRITERIA_EPS + cv2.TERM_CRITERIA_MAX_ITER, 10, 1.0)
        _, labels, centers = cv2.kmeans(pixels, k, None, criteria, 10, cv2.KMEANS_RANDOM_CENTERS)
        counts = Counter(labels.flatten())
        dominant = centers[counts.most_common(1)[0][0]]
        return [int(c) for c in dominant]
    except Exception:
        return [128, 128, 128]

def color_name(b, g, r):
    colors = {
        "Red": (0, 0, 255), "Green": (0, 255, 0), "Blue": (255, 0, 0),
        "Yellow": (0, 255, 255), "Black": (0, 0, 0), "White": (255, 255, 255),
        "Gray": (128, 128, 128), "Orange": (0, 165, 255), "Purple": (128, 0, 128),
        "Brown": (0, 75, 150),
    }
    min_dist = float('inf')
    closest = "Unknown"
    for name, (cb, cg, cr) in colors.items():
        dist = (cb-b)**2 + (cg-g)**2 + (cr-r)**2
        if dist < min_dist:
            min_dist = dist
            closest = name
    return closest

def play_audio_then_speak(mp3_filename, loops, text):
    """Background thread: play MP3 `loops` times, then speak TTS."""
    import subprocess, threading, os
    def _worker():
        import time as _time
        audio_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "audio", mp3_filename)
        logger.info(f"🔊 Audio trigger: {mp3_filename} x{loops} | Path: {audio_path} | Exists: {os.path.exists(audio_path)}")
        
        if os.path.exists(audio_path):
            try:
                import pygame
                if not pygame.mixer.get_init():
                    pygame.mixer.init(frequency=44100, size=-16, channels=2, buffer=2048)
                pygame.mixer.music.load(audio_path)
                # play(loops-1) because pygame counts 0=play once, 1=play twice, etc.
                pygame.mixer.music.play(loops - 1)
                while pygame.mixer.music.get_busy():
                    _time.sleep(0.2)
                _time.sleep(0.3)  # grace period
                pygame.mixer.music.stop()
            except Exception as e:
                logger.error(f"Pygame audio error: {e}")
                # Fallback to beeps
                import winsound
                for _ in range(loops):
                    winsound.Beep(1200, 600)
                    _time.sleep(0.15)
        else:
            logger.warning(f"MP3 not found at {audio_path}, using beep fallback")
            import winsound
            for _ in range(loops):
                winsound.Beep(1200, 600)
                _time.sleep(0.15)
        
        # TTS after audio
        if text:
            safe_text = str(text).replace("'", "").replace('"', '')
            cmd = f'powershell -c "Add-Type -AssemblyName System.speech; (New-Object System.Speech.Synthesis.SpeechSynthesizer).Speak(\'{safe_text}\')"'
            subprocess.run(cmd, shell=True)
    threading.Thread(target=_worker, daemon=True).start()


def dispatch_to_backend(payload):
    """Fire-and-forget HTTP POST to Flask backend."""
    try:
        mapped_payload = {
            "theft": payload.get("theft", False),
            "unauthorized_access": False,
            "people_count": payload.get("people_count", 0),
            "tracked_ids": payload.get("ids", []),
            "fire": payload.get("fire", False),
            "smoke": payload.get("smoke", False),
            "thermal_temp": 25,
            "cross_sell_opportunity": False,
            "clip_url": payload.get("incident_clip_path", "http://localhost:8080/live"),
            "confidence": payload.get("fire_confidence", 0.0),
            # Enriched analytics payload
            "objects": payload.get("objects", {}),
            "zones": payload.get("zones", {}),
            "roles": payload.get("roles", {}),
            "per_person_confidence": payload.get("per_person_confidence", {}),
            "zone_dwell_times": payload.get("zone_dwell_times", {}),
            "zone_transitions": payload.get("zone_transitions", []),
            "camera_health": payload.get("camera_health", []),
            "suspect_details": payload.get("suspect_details", []),
        }
        requests.post("http://localhost:5050/api/detect", json=mapped_payload, timeout=0.5)
    except requests.exceptions.RequestException:
        pass
    
    # Also dispatch to Supabase
    threading.Thread(target=dispatch_to_supabase, args=(mapped_payload,), daemon=True).start()

SUPABASE_URL = os.environ.get('SUPABASE_URL', 'https://jqybouilcscdjouueaum.supabase.co')
SUPABASE_KEY = os.environ.get('SUPABASE_KEY', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpxeWJvdWlsY3NjZGpvdXVlYXVtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDYwODE4NCwiZXhwIjoyMDkwMTg0MTg0fQ.UKx3PzJwHQ_oChm3LAnAxAVfAfzvQmUUq2ToMx8UCaE')

def dispatch_to_supabase(payload):
    """Fire-and-forget HTTP POST to Supabase."""
    event_type = "engine_telemetry"
    if payload.get("fire") or payload.get("smoke"):
        event_type = "fire_alert"
    elif payload.get("theft"):
        event_type = "theft_alert"
        
    supabase_payload = {
        "event": event_type,
        "details": payload,
        "time": datetime.datetime.now(datetime.timezone.utc).isoformat()
    }
    
    headers = {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}",
        "Content-Type": "application/json",
        "Prefer": "return=minimal"
    }
    
    try:
        requests.post(f"{SUPABASE_URL}/rest/v1/logs", headers=headers, json=supabase_payload, timeout=1.0)
    except Exception:
        pass


def main():
    logger.info("Starting Watchr AI Engine...")

    try:
        print("\n╔══════════════════════════════════════════════════╗")
        print("║  WATCHR AI ENGINE — ENTERPRISE INFERENCE v3.0   ║")
        print("║  Fire ML | Theft Hybrid | BoT-SORT Tracking     ║")
        print("╚══════════════════════════════════════════════════╝")
        
        num_cams = input("[CONFIG] Number of cameras (1-4, Default=1): ").strip()
        num_cams = int(num_cams) if num_cams.isdigit() else 1
        
        sources = []
        for i in range(num_cams):
            src = input(f"Camera {i+1} URL (blank=Webcam): ").strip()
            sources.append(src)
        
        # ── ZONE CALIBRATION ──
        calibrate = input("[CONFIG] Calibrate zones? (y/N): ").strip().lower()
        cam_manager = None
        if calibrate == 'y':
            print("\n🎯 Launching Precision Zone Calibrator...")
            print("   [B] = Billing  |  [1][2][3] = Shelves  |  [E] = Exit")
            print("   Click and drag to draw zone boundaries, then accept/redo.")
            print("   Press [S] to save & continue to engine.\n")
            cal = ProductionCalibrator()
            cal.cam_manager = MultiCameraManager(sources)
            cal.run_smart_menu()
            # Reuse calibrator's live camera connection (avoids FFmpeg crash on reconnect)
            cam_manager = cal.cam_manager
            print("✅ Zones calibrated. Starting engine...\n")
            time.sleep(1)
        
        # ── FPS GOVERNOR (30 FPS default) ──
        max_fps = 30
        min_loop_time = 1.0 / max_fps
        
        # Only create new camera manager if calibration was skipped
        if cam_manager is None:
            cam_manager = MultiCameraManager(sources)
        
        # Init detection engine (auto-selects ONNX or Ultralytics)
        detector = PersonDetector(model_name="yolov8n.pt", conf_thresh=0.5)
        
        # Init tracker: YOLOTracker if Ultralytics backend, CentroidTracker for ONNX
        if detector.backend == "ultralytics" and hasattr(detector, 'model'):
            tracker = YOLOTracker(detector.model, conf_thresh=0.5)
            tracker_mode = "BoT-SORT"
            use_yolo_tracker = True
        else:
            tracker = CentroidTracker(max_distance=50, max_missed=5)
            tracker_mode = "Centroid"
            use_yolo_tracker = False
        
        zone_mapper = ZoneMapper()
        theft_engine = TheftDetectionEngine(
            shelf_engage_frames=8,
            confidence_drop_threshold=0.20,
            confidence_threshold=0.50
        )
        fire_engine = FireDetector(confidence_threshold=0.55)
        # ReID & Uniform Manager
        identity_manager = IdentityManager(staff_color="black")
        
        logger.info(f"Detection backend: {detector.backend}")
        logger.info(f"Tracker mode: {tracker_mode}")
        logger.info(f"Fire backend: {fire_engine.backend}")
        logger.info(f"FPS governor: {max_fps} FPS max")
        
    except Exception as e:
        logger.error(f"INIT FAILED: {e}")
        import traceback; traceback.print_exc()
        return

    prev_frame = None
    camera_id = 1
    store_lockdown = False
    global_suspect_signatures = []
    fps_counter = time.perf_counter()
    frame_number = 0
    
    # ── AUDIO TRACKERS ──
    fire_duration_start = None
    theft_last_spoke = 0
    fire_last_spoke = 0

    # ─── MAIN LOOP ────────────────────────────────────────────────────
    while True:
        try:
            loop_start = time.perf_counter()
            frame_number += 1
            
            # ── 1. FETCH INDIVIDUAL FRAMES ─────────────────────────────
            raw_frames = cam_manager.get_individual_frames()
            
            valid_frames = []
            valid_indices = []
            for i, (ret, frame) in enumerate(raw_frames):
                if ret and frame is not None:
                    valid_frames.append(frame)
                    valid_indices.append(i)
            
            if not valid_frames:
                # Graceful degradation: wait and retry instead of crashing
                if cam_manager.get_online_count() == 0:
                    logger.warning("All cameras offline. Waiting for reconnection...")
                    time.sleep(2)
                    continue
                else:
                    time.sleep(0.1)
                    continue
            
            # ── 2. TRACKING + DETECTION ──────────────────────────────
            if use_yolo_tracker:
                # YOLOTracker does detection + tracking in one call per camera
                # For multi-cam, track each camera independently then merge
                all_objects = {}
                all_confs = {}
                all_detections = []
                all_ids = []
                
                for cam_idx, frame_data in zip(valid_indices, valid_frames):
                    track_result = tracker.track(frame_data)
                    ox, oy = GRID_OFFSETS[cam_idx] if cam_idx < len(GRID_OFFSETS) else (0, 0)
                    
                    for oid, bbox in track_result.get("objects", {}).items():
                        # Offset to mosaic coordinate space
                        global_id = f"c{cam_idx}_{oid}"
                        x1, y1, x2, y2 = bbox[0]+ox, bbox[1]+oy, bbox[2]+ox, bbox[3]+oy
                        conf = bbox[4] if len(bbox) > 4 else 0.0
                        all_objects[global_id] = [x1, y1, x2, y2, conf]
                        all_confs[global_id] = track_result["per_person_confidence"].get(oid, conf)
                        all_detections.append([x1, y1, x2, y2, conf])
                        all_ids.append(global_id)
                
                track_output = {
                    "people_count": len(all_objects),
                    "ids": all_ids,
                    "objects": all_objects,
                    "per_person_confidence": all_confs,
                    "detections": all_detections,
                }
            else:
                # CentroidTracker: need separate detection then tracking
                try:
                    batch_results = detector.detect_batch(valid_frames)
                except Exception as e:
                    logger.error(f"Detection failed: {e}")
                    batch_results = [{"people_count": 0, "detections": [], "stable": False}] * len(valid_frames)
                
                merged_detections = []
                for cam_idx, det_result in zip(valid_indices, batch_results):
                    ox, oy = GRID_OFFSETS[cam_idx] if cam_idx < len(GRID_OFFSETS) else (0, 0)
                    for det in det_result.get("detections", []):
                        x1, y1, x2, y2 = det[0], det[1], det[2], det[3]
                        conf = det[4] if len(det) > 4 else 0.0
                        merged_detections.append([x1 + ox, y1 + oy, x2 + ox, y2 + oy, conf])
                
                track_output = tracker.track(merged_detections)
            
            # ── 3. BUILD MOSAIC FOR DISPLAY ──────────────────────────
            _, mosaic = cam_manager.get_mosaic(valid_frames)
            display_frame = mosaic.copy()
            frame = mosaic
            
            # ── 3.5 IDENTITY MANAGER (ReID & STAFF UNIFORMS) ─────────
            # Replaces per-camera IDs (c0_5, c1_3) with persistent Global IDs
            # Extracts Torso signatures and identifies STAFF uniforms (e.g. black)
            track_output = identity_manager.process_tracking(frame, track_output)
            staff_overrides = track_output.get("staff_overrides", {})
            
            # ── 4. ZONE MAPPING ──────────────────────────────────────
            try:
                zones_output = zone_mapper.map_zones(track_output.get("objects", {}))
            except Exception as e:
                logger.error(f"Zone mapping failed: {e}")
                zones_output = {"zones": {}, "dwell_times": {}, "transitions": []}

            # ── 5. THEFT DETECTION (with confidence-drop analysis) ───
            theft_engine.buffer_frame(frame)
            try:
                theft_output = theft_engine.detect_theft(
                    zones_output, 
                    track_output.get("objects", {}),
                    per_person_confidence=track_output.get("per_person_confidence", {}),
                    staff_overrides=staff_overrides
                )
                
                # Start evidence recording if theft detected
                if theft_output.get("theft") and not theft_engine.recording:
                    theft_engine.start_evidence_recording(frame)
                
                # Continue recording evidence
                if theft_engine.recording:
                    theft_engine.record_frame(frame)
                    
            except Exception as e:
                logger.error(f"Theft engine failed: {e}")
                theft_output = {"theft": False, "suspects": [], "roles": {}, "suspect_details": []}

            # ── 6. FIRE & SMOKE DETECTION ──
            try:
                if hasattr(fire_engine, 'buffer_frame'):
                    fire_engine.buffer_frame(frame)
            except Exception: pass
            
            if frame_number % 5 == 0:
                try:
                    fire_output = fire_engine.detect_fire(frame, prev_frame)
                except Exception as e:
                    logger.error(f"Fire detection failed: {e}")
                    fire_output = {"fire": False, "smoke": False, "confidence": 0.0}
            else:
                if 'fire_output' not in locals():
                    fire_output = {"fire": False, "smoke": False, "confidence": 0.0}
            
            try:
                if fire_output.get("fire") and not getattr(fire_engine, 'recording', False):
                    if hasattr(fire_engine, 'start_evidence_recording'):
                        fire_engine.start_evidence_recording(frame)
                if getattr(fire_engine, 'recording', False) and hasattr(fire_engine, 'record_frame'):
                    fire_engine.record_frame(frame)
            except Exception: pass

            prev_frame = frame.copy()

            # ── 7. ENRICHED JSON PAYLOAD ─────────────────────────────
            system_payload = {
                "camera_id": camera_id,
                "frame_number": frame_number,
                "timestamp": time.strftime("%Y-%m-%dT%H:%M:%S"),
                "people_count": track_output.get("people_count", 0),
                "ids": track_output.get("ids", []),
                "objects": track_output.get("objects", {}),
                "zones": zones_output.get("zones", {}),
                "roles": theft_output.get("roles", {}),
                "per_person_confidence": track_output.get("per_person_confidence", {}),
                "zone_dwell_times": zones_output.get("dwell_times", {}),
                "zone_transitions": zones_output.get("transitions", []),
                # Threat signals
                "theft": theft_output.get("theft", False),
                "suspects": theft_output.get("suspects", []),
                "suspect_details": theft_output.get("suspect_details", []),
                "fire": fire_output.get("fire", False),
                "smoke": fire_output.get("smoke", False),
                "fire_confidence": fire_output.get("confidence", 0.0),
                "incident_clip_path": theft_engine.get_latest_evidence_path(),
                # System health
                "camera_health": cam_manager.get_health_report(),
                "tracker_mode": tracker_mode,
                "fire_backend": fire_engine.backend,
            }

            # Log compact version
            compact_log = {
                "ppl": system_payload["people_count"],
                "theft": system_payload["theft"],
                "fire": system_payload["fire"],
                "smoke": system_payload["smoke"],
            }
            logger.info(json.dumps(compact_log))
            
            # Fire async HTTP POST to Flask backend
            threading.Thread(target=dispatch_to_backend, args=(system_payload,), daemon=True).start()

            # ── 8. VISUALIZATION ─────────────────────────────────────
            try:
                display_frame = visualize_zones(display_frame, zone_mapper, track_output, zones_output)
                roles_dict = system_payload.get("roles", {})
                zones_map = zones_output.get("zones", {})
                dwell_map = zones_output.get("dwell_times", {})
                
                zone_counts = {}
                for oid, zname in zones_map.items():
                    zone_counts[zname] = zone_counts.get(zname, 0) + 1
                
                for obj_id_str, bbox in track_output.get("objects", {}).items():
                    if isinstance(bbox, list) and len(bbox) >= 4:
                        conf = float(bbox[4]) if len(bbox) >= 5 else 0.0
                        x1, y1, x2, y2 = map(int, bbox[:4])
                        role = roles_dict.get(obj_id_str, "CUSTOMER")
                        zone = zones_map.get(obj_id_str, "unknown")
                        dwell = dwell_map.get(obj_id_str, {}).get(zone, 0)
                        
                        if role == "SUSPECT":
                            box_color = (0, 0, 255)
                        elif role == "STAFF":
                            box_color = (255, 100, 100)
                        else:
                            box_color = (0, 255, 200)
                        
                        cv2.rectangle(display_frame, (x1, y1), (x2, y2), box_color, 2)
                        cv2.rectangle(display_frame, (x1, y1 - 52), (x1 + 220, y1), (20, 20, 20), -1)
                        cv2.putText(display_frame, f"ID:{obj_id_str} [{conf*100:.0f}%]", (x1+3, y1-38),
                                    cv2.FONT_HERSHEY_SIMPLEX, 0.4, (255,255,255), 1, cv2.LINE_AA)
                        cv2.putText(display_frame, f"{role}", (x1+3, y1-24),
                                    cv2.FONT_HERSHEY_SIMPLEX, 0.4, box_color, 1, cv2.LINE_AA)
                        cv2.putText(display_frame, f"@ {zone.upper()} ({dwell:.0f}s)", (x1+3, y1-10),
                                    cv2.FONT_HERSHEY_SIMPLEX, 0.35, (180,180,180), 1, cv2.LINE_AA)
                
                # Analytics Panel
                fw = display_frame.shape[1]
                
                # Auto Layout Scaling
                if fw <= 640:
                    panel_w, panel_h = 240, 180
                    scale, y_step = 0.35, 14
                elif fw <= 1280:
                    panel_w, panel_h = 280, 220
                    scale, y_step = 0.40, 18
                else:
                    panel_w, panel_h = 300, 250
                    scale, y_step = 0.45, 20
                
                px1, py1 = fw - panel_w - 10, 10
                px2, py2 = fw - 10, py1 + panel_h
                
                overlay = display_frame.copy()
                cv2.rectangle(overlay, (px1, py1), (px2, py2), (15, 15, 15), -1)
                display_frame = cv2.addWeighted(overlay, 0.75, display_frame, 0.25, 0)
                cv2.rectangle(display_frame, (px1, py1), (px2, py2), (0, 255, 255), 1)
                
                fps = 1.0 / (loop_start - fps_counter) if (loop_start - fps_counter) > 0 else 0
                fps_counter = loop_start
                
                cv2.putText(display_frame, f"WATCHR v3.0 [{detector.backend.upper()}]", (px1+10, py1+(y_step+2)),
                            cv2.FONT_HERSHEY_SIMPLEX, scale, (0, 255, 255), 1, cv2.LINE_AA)
                cv2.putText(display_frame, f"FPS: {fps:.0f} | Fire: {fire_engine.backend}", 
                            (px1+10, py1+(y_step*2)+2), cv2.FONT_HERSHEY_SIMPLEX, scale-0.1, (150,150,150), 1, cv2.LINE_AA)
                
                total = system_payload.get("people_count", 0)
                staff_count = list(roles_dict.values()).count("STAFF")
                cust_count = list(roles_dict.values()).count("CUSTOMER")
                suspect_count = list(roles_dict.values()).count("SUSPECT")
                
                y_off = py1 + (y_step*3) + 5
                cv2.putText(display_frame, f"Total: {total}", (px1+10, y_off), cv2.FONT_HERSHEY_SIMPLEX, scale, (255,255,255), 1)
                cv2.putText(display_frame, f"Staff: {staff_count}", (px1+10, y_off+y_step), cv2.FONT_HERSHEY_SIMPLEX, scale, (255,150,100), 1)
                cv2.putText(display_frame, f"Customers: {cust_count}", (px1+10, y_off+(y_step*2)), cv2.FONT_HERSHEY_SIMPLEX, scale, (0,255,200), 1)
                if suspect_count > 0:
                    cv2.putText(display_frame, f"SUSPECTS: {suspect_count}", (px1+10, y_off+(y_step*3)), cv2.FONT_HERSHEY_SIMPLEX, scale, (0,0,255), 2)
                
                # Zone bars
                y_off += (y_step*4)
                for zname, zcount in zone_counts.items():
                    if zname == "unknown": continue
                    bar = min(zcount * 25, panel_w - 90)
                    cv2.rectangle(display_frame, (px1+70, y_off-10), (px1+70+bar, y_off), (0,200,200), -1)
                    cv2.putText(display_frame, f"{zname[:7]}: {zcount}", (px1+10, y_off), cv2.FONT_HERSHEY_SIMPLEX, scale-0.05, (200,200,200), 1)
                    y_off += y_step
                
                # Camera health
                y_off += 5
                for ch in system_payload.get("camera_health", []):
                    status_color = (0,255,0) if ch["status"] == "online" else (0,0,255)
                    cv2.putText(display_frame, f"CAM{ch['cam_id']}: {ch['status'].upper()}", (px1+10, y_off),
                                cv2.FONT_HERSHEY_SIMPLEX, 0.3, status_color, 1)
                    y_off += 14
                
                # Theft / ReID overlay + AUDIO
                if system_payload["theft"]:
                    store_lockdown = True
                    for sid in system_payload.get("suspects", []):
                        bbox = track_output["objects"].get(str(sid), [])
                        if isinstance(bbox, list) and len(bbox) >= 4:
                            x1, y1, x2, y2 = map(int, bbox[:4])
                            h = y2 - y1
                            roi = frame[max(0,y1+int(h*0.2)):y2-int(h*0.2), max(0,x1):x2]
                            if roi.size > 0:
                                dom_c = get_dominant_color(roi)
                                global_suspect_signatures.append(dom_c)
                                
                                # Voice Alert Logic
                                if time.time() - theft_last_spoke > 15:
                                    c_name = color_name(*dom_c)
                                    zone_loc = system_payload["zones"].get(str(sid), "unknown").replace("_", " ")
                                    txt = f"Theft detected. Customer in {c_name} shirt near {zone_loc}."
                                    play_audio_then_speak("theft_audio.mp3", 1, txt)
                                    theft_last_spoke = time.time()
                
                if store_lockdown:
                    cv2.putText(display_frame, "STORE LOCKDOWN: THEFT IN PROGRESS", (30, 40),
                                cv2.FONT_HERSHEY_SIMPLEX, 0.9, (0, 0, 255), 3, cv2.LINE_AA)
                
                # Smoke / Fire overlays + 5 SEC AUDIO DELAY
                if system_payload.get("smoke") or system_payload.get("fire"):
                    if fire_duration_start is None:
                        fire_duration_start = time.time()
                    elif time.time() - fire_duration_start > 2.75:
                        if time.time() - fire_last_spoke > 20:
                            txt = "Warning. Fire danger detected. Please evacuate."
                            play_audio_then_speak("fire_audio.mp3", 3, txt)
                            fire_last_spoke = time.time()
                else:
                    fire_duration_start = None

                if system_payload.get("smoke") and not system_payload["fire"]:
                    ov = display_frame.copy()
                    cv2.rectangle(ov, (0,0), (fw, 50), (0,140,255), -1)
                    display_frame = cv2.addWeighted(ov, 0.6, display_frame, 0.4, 0)
                    cv2.putText(display_frame, "SMOKE DETECTED - EARLY WARNING", (30, 35),
                                cv2.FONT_HERSHEY_SIMPLEX, 0.8, (255,255,255), 2, cv2.LINE_AA)
                
                if system_payload["fire"]:
                    fconf = system_payload.get("fire_confidence", 0) * 100
                    cv2.rectangle(display_frame, (0,0), (fw, display_frame.shape[0]), (0,0,255), 8)
                    cv2.putText(display_frame, f"FIRE CONFIRMED [{fconf:.0f}%]", (30, 135),
                                cv2.FONT_HERSHEY_SIMPLEX, 1.1, (0,165,255), 3, cv2.LINE_AA)
                
                cv2.imshow("Watchr AI Engine v3.0", display_frame)
                
            except Exception as e:
                logger.error(f"Visualization error: {e}")

            if cv2.waitKey(1) & 0xFF == 27:
                logger.info("ESC pressed. Shutting down.")
                break
            
            # ── FPS GOVERNOR ─────────────────────────────────────────
            elapsed = time.perf_counter() - loop_start
            if elapsed < min_loop_time:
                time.sleep(min_loop_time - elapsed)

        except Exception as e:
            logger.error(f"SYSTEM ERROR: {e}")
            import traceback; traceback.print_exc()
            time.sleep(1)  # Don't crash-loop, wait and retry
            continue

    # Cleanup
    if theft_engine.recording:
        theft_engine.stop_evidence_recording()
    if 'cam_manager' in locals():
        cam_manager.release()
    cv2.destroyAllWindows()
    logger.info("Pipeline terminated cleanly.")


if __name__ == "__main__":
    main()
