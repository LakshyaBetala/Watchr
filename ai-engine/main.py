import cv2
import json
import logging
import numpy as np
from collections import Counter
import requests
import threading

from multi_camera import MultiCameraManager
from detection import PersonDetector
from tracking import CentroidTracker
from zone_mapping import ZoneMapper, visualize_zones
from theft_detection import TheftDetectionEngine
from fire_detection import FireDetector

# Configure minimal, clean logging focused strictly on JSON layout for the terminal integration
logging.basicConfig(level=logging.INFO, format='%(message)s')
logger = logging.getLogger(__name__)

def get_dominant_color(image, k=3):
    """Dynamically extracts the uniform color signature of a suspect for Multi-Camera ReID."""
    pixels = image.reshape((-1, 3))
    pixels = np.float32(pixels)
    criteria = (cv2.TERM_CRITERIA_EPS + cv2.TERM_CRITERIA_MAX_ITER, 10, 1.0)
    _, labels, centers = cv2.kmeans(pixels, k, None, criteria, 10, cv2.KMEANS_RANDOM_CENTERS)
    counts = Counter(labels.flatten())
    dominant = centers[counts.most_common(1)[0][0]]
    return [int(c) for c in dominant]

def dispatch_to_backend(payload):
    try:
        mapped_payload = {
            "theft": payload.get("theft", False),
            "unauthorized_access": False, 
            "people_count": payload.get("people_count", 0),
            "tracked_ids": payload.get("ids", []),
            "fire": payload.get("fire", False),
            "thermal_temp": 25,
            "cross_sell_opportunity": False,
            "clip_url": "http://localhost:8080/live",
            "confidence": payload.get("fire_confidence", 0.99)
        }
        requests.post("http://localhost:5050/api/detect", json=mapped_payload, timeout=0.5)
    except requests.exceptions.RequestException:
        pass

def main():
    logger.info("Starting Watchr AI Engine Integration...")

    # --- 1. INITIALIZE MODULES (Fault Tolerant Start) ---
    try:
        print("\n==========================================")
        print(" WATCHR AI SURVEILLANCE ENGINE - CORE BOOT")
        print("==========================================")
        num_cams = input("[CONFIG] How many cameras to orchestrate? (1-4, Default=1): ").strip()
        num_cams = int(num_cams) if num_cams.isdigit() else 1
        
        sources = []
        for i in range(num_cams):
            src = input(f"URL for Camera {i+1} (Leave blank for Webcam 0): ").strip()
            sources.append(src)
            
        cam_manager = MultiCameraManager(sources)

        # Load isolated Intelligence Engines
        detector = PersonDetector(model_name="yolov8n.pt", conf_thresh=0.5)
        tracker = CentroidTracker(max_distance=50, max_missed=5)
        zone_mapper = ZoneMapper()  # Evaluates physical mapping
        theft_engine = TheftDetectionEngine()
        fire_engine = FireDetector()
        
    except Exception as e:
        logger.error(f"CRITICAL MODULE FAILURE during initialization: {e}")
        return

    logger.info("Pipeline Online. Processing Frames...")

    prev_frame = None
    camera_id = 1
    store_lockdown = False
    global_suspect_signatures = []

    # --- 2. THE CONTINUOUS INTELLIGENCE PIPELINE ---
    while True:
        try:
            # 2.1 Video Input (Mosaic Pipeline)
            ret, frame = cam_manager.get_panorama()
            if not ret or frame is None:
                logger.warning("Master Mosaic stream gap detected.")
                break
            
            # Isolated rendering canvas
            display_frame = frame.copy()
            
            # 🛡️ FAULT-TOLERANT EXECUTION BLOCKS (Isolation per module)
            
            # 2.2 Stable Detection Layer
            try:
                det_output = detector.detect(frame)
                raw_detections = det_output.get("detections", [])
            except Exception as e:
                logger.error(f"Detection engine dropped frame: {e}")
                raw_detections = []

            # 2.3 Centroid Tracking
            try:
                track_output = tracker.track(raw_detections)
            except Exception as e:
                logger.error(f"Tracking linkage collapsed: {e}")
                track_output = {"people_count": 0, "ids": [], "objects": {}}

            # 2.4 Semantic Zone Mapping
            try:
                zones_output = zone_mapper.map_zones(track_output.get("objects", {}))
            except Exception as e:
                logger.error(f"Zone mapping failed to classify: {e}")
                zones_output = {"zones": {}}

            # 2.5 Behavioral Theft State Machine (Now receives bbox data for concealment/velocity)
            try:
                theft_output = theft_engine.detect_theft(zones_output, track_output.get("objects", {}))
            except Exception as e:
                logger.error(f"Theft state machine stalled: {e}")
                theft_output = {"theft": False, "suspects": [], "roles": {}}

            # 2.6 Fire & Smoke Sentinel
            try:
                fire_output = fire_engine.detect_fire(frame, prev_frame)
            except Exception as e:
                logger.error(f"Life safety / Fire evaluation corrupted: {e}")
                fire_output = {"fire": False, "smoke": False, "confidence": 0.0}

            # Preserve frame strictly for next dynamic loop cycle calculation
            prev_frame = frame.copy()

            # --- 3. FINAL JSON PAYLOAD AGGREGATION ---
            # Contract: Guaranteed to remain valid JSON regardless of upstream chaos
            system_payload = {
                "camera_id": camera_id,
                "people_count": track_output.get("people_count", 0),
                "ids": track_output.get("ids", []),
                "objects": track_output.get("objects", {}),
                "zones": zones_output.get("zones", {}),
                "roles": theft_output.get("roles", {}),
                "theft": theft_output.get("theft", False),
                "suspects": theft_output.get("suspects", []),
                "fire": fire_output.get("fire", False),
                "smoke": fire_output.get("smoke", False),
                "fire_confidence": fire_output.get("confidence", 0.0)
            }

            # Single unified broadcast point to stdout for backend/IoT consumption
            logger.info(json.dumps(system_payload))
            
            # Fire async HTTP POST to Flask backend
            threading.Thread(target=dispatch_to_backend, args=(system_payload,), daemon=True).start()

            # --- 4. PRODUCTION VISUALIZATION ENGINE ---
            try:
                # Render zone boundaries with transparent fills
                display_frame = visualize_zones(display_frame, zone_mapper, track_output, zones_output)
                roles_dict = system_payload.get("roles", {})
                zones_map = zones_output.get("zones", {})
                
                # Per-zone occupancy counter
                zone_counts = {}
                for oid, zname in zones_map.items():
                    zone_counts[zname] = zone_counts.get(zname, 0) + 1
                
                # === PER-PERSON OVERLAY: Role + Zone + Confidence ===
                for obj_id_str, bbox in track_output.get("objects", {}).items():
                    if isinstance(bbox, list) and len(bbox) >= 4:
                        conf = float(bbox[4]) if len(bbox) >= 5 else 0.0
                        x1, y1, x2, y2 = map(int, bbox[:4])
                        role = roles_dict.get(obj_id_str, "CUSTOMER")
                        zone = zones_map.get(obj_id_str, "unknown")
                        
                        # Color coding by role
                        if role == "SUSPECT":
                            box_color = (0, 0, 255)
                            label_color = (0, 0, 255)
                        elif role == "STAFF":
                            box_color = (255, 100, 100)
                            label_color = (255, 150, 100)
                        else:
                            box_color = (0, 255, 200)
                            label_color = (0, 255, 200)
                        
                        # Draw person bbox
                        cv2.rectangle(display_frame, (x1, y1), (x2, y2), box_color, 2)
                        
                        # Label: ID + Role + Confidence Badge
                        id_label = f"ID:{obj_id_str}"
                        role_label = f"{role} [{conf*100:.0f}%]"
                        zone_label = f"@ {zone.upper()}"
                        
                        # Background pill for label
                        cv2.rectangle(display_frame, (x1, y1 - 45), (x1 + 200, y1), (20, 20, 20), -1)
                        cv2.putText(display_frame, id_label, (x1 + 3, y1 - 30),
                                    cv2.FONT_HERSHEY_SIMPLEX, 0.45, (255, 255, 255), 1, cv2.LINE_AA)
                        cv2.putText(display_frame, role_label, (x1 + 3, y1 - 15),
                                    cv2.FONT_HERSHEY_SIMPLEX, 0.45, label_color, 1, cv2.LINE_AA)
                        cv2.putText(display_frame, zone_label, (x1 + 3, y1 - 2),
                                    cv2.FONT_HERSHEY_SIMPLEX, 0.35, (180, 180, 180), 1, cv2.LINE_AA)
                
                # === ANALYTICS PANEL (Top-Right Corner) ===
                panel_w, panel_h = 280, 200
                fw = display_frame.shape[1]
                px1, py1 = fw - panel_w - 10, 10
                px2, py2 = fw - 10, py1 + panel_h
                
                # Semi-transparent panel
                overlay = display_frame.copy()
                cv2.rectangle(overlay, (px1, py1), (px2, py2), (15, 15, 15), -1)
                display_frame = cv2.addWeighted(overlay, 0.75, display_frame, 0.25, 0)
                cv2.rectangle(display_frame, (px1, py1), (px2, py2), (0, 255, 255), 1)
                
                # Title
                cv2.putText(display_frame, "LIVE ANALYTICS", (px1 + 10, py1 + 25),
                            cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 255, 255), 2, cv2.LINE_AA)
                
                # People count
                total = system_payload.get("people_count", 0)
                staff_count = list(roles_dict.values()).count("STAFF")
                cust_count = list(roles_dict.values()).count("CUSTOMER")
                suspect_count = list(roles_dict.values()).count("SUSPECT")
                
                y_off = py1 + 55
                cv2.putText(display_frame, f"Total: {total}", (px1 + 10, y_off),
                            cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 255, 255), 1, cv2.LINE_AA)
                cv2.putText(display_frame, f"Staff: {staff_count}", (px1 + 10, y_off + 25),
                            cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 150, 100), 1, cv2.LINE_AA)
                cv2.putText(display_frame, f"Customers: {cust_count}", (px1 + 10, y_off + 50),
                            cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 200), 1, cv2.LINE_AA)
                if suspect_count > 0:
                    cv2.putText(display_frame, f"SUSPECTS: {suspect_count}", (px1 + 10, y_off + 75),
                                cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 0, 255), 2, cv2.LINE_AA)
                
                # Per-zone occupancy bars
                y_off += 100
                cv2.putText(display_frame, "Zone Occupancy:", (px1 + 10, y_off),
                            cv2.FONT_HERSHEY_SIMPLEX, 0.4, (180, 180, 180), 1, cv2.LINE_AA)
                y_off += 20
                for zname, zcount in zone_counts.items():
                    if zname == "unknown":
                        continue
                    bar_len = min(zcount * 30, panel_w - 100)
                    cv2.rectangle(display_frame, (px1 + 80, y_off - 10), (px1 + 80 + bar_len, y_off), (0, 200, 200), -1)
                    cv2.putText(display_frame, f"{zname}: {zcount}", (px1 + 10, y_off),
                                cv2.FONT_HERSHEY_SIMPLEX, 0.35, (200, 200, 200), 1, cv2.LINE_AA)
                    y_off += 18
                
                # Add Global Threat memory & Synthesize ReID Vector Signature
                if system_payload["theft"]:
                    store_lockdown = True
                    for sid in system_payload.get("suspects", []):
                        bbox = track_output["objects"].get(str(sid), [])
                        if isinstance(bbox, list) and len(bbox) >= 4:
                            x1, y1, x2, y2 = map(int, bbox[:4])
                            # Extract 50% Torso ROI precisely
                            h = y2 - y1
                            roi = frame[y1+int(h*0.2):y2-int(h*0.2), x1:x2]
                            if roi.size > 0:
                                sig = get_dominant_color(roi)
                                global_suspect_signatures.append(sig)
                                
                    
                # Render Critical Alerts cleanly over the frame
                if store_lockdown:
                    cv2.putText(display_frame, "🚨 STORE IN LOCKDOWN: THEFT IN PROGRESS 🚨", (30, 40), 
                                cv2.FONT_HERSHEY_SIMPLEX, 1.2, (0, 0, 255), 4, cv2.LINE_AA)
                                
                    # Watch the exit door across the multi-camera grid via ReID Core
                    for id_str, role in roles_dict.items():
                        if zones_output["zones"].get(id_str) == "exit":
                            # Extract this exit candidate's color
                            bbox = track_output["objects"].get(str(id_str), [])
                            if isinstance(bbox, list) and len(bbox) >= 4:
                                x1, y1, x2, y2 = map(int, bbox[:4])
                                h = y2 - y1
                                roi = frame[y1+int(h*0.2):y2-int(h*0.2), x1:x2]
                                
                                match = False
                                if roi.size > 0:
                                    test_sig = get_dominant_color(roi)
                                    # Cross-reference with all active global thieves
                                    for thief_sig in global_suspect_signatures:
                                        dist = np.linalg.norm(np.array(test_sig) - np.array(thief_sig))
                                        if dist < 65:  # High-confidence Euclidean color match
                                            match = True
                                            break
                                            
                                if match:
                                    cv2.rectangle(display_frame, (0, 0), (display_frame.shape[1], display_frame.shape[0]), (0, 0, 255), 10)
                                    cv2.putText(display_frame, "❗ RE-IDENTIFIED SUSPECT ESCAPING EXIT ❗", (30, 100), 
                                                cv2.FONT_HERSHEY_SIMPLEX, 1.5, (0, 0, 255), 5, cv2.LINE_AA)
                                else:
                                    cv2.putText(display_frame, f"Civilian ID:{id_str} Exiting Safely", (x1, y1-30), 
                                                cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 0), 2, cv2.LINE_AA)
                    
                if system_payload.get("smoke", False) and not system_payload["fire"]:
                    # Amber overlay for smoke early warning
                    overlay = display_frame.copy()
                    cv2.rectangle(overlay, (0, 0), (display_frame.shape[1], 50), (0, 140, 255), -1)
                    display_frame = cv2.addWeighted(overlay, 0.6, display_frame, 0.4, 0)
                    cv2.putText(display_frame, "⚠️ SMOKE DETECTED - EARLY WARNING", (30, 35), 
                                cv2.FONT_HERSHEY_SIMPLEX, 0.9, (255, 255, 255), 3, cv2.LINE_AA)
                                
                if system_payload["fire"]:
                    fire_conf = system_payload.get("fire_confidence", 0) * 100
                    # Full red border flash for confirmed fire
                    cv2.rectangle(display_frame, (0, 0), (display_frame.shape[1], display_frame.shape[0]), (0, 0, 255), 8)
                    cv2.putText(display_frame, f"🔥 FIRE CONFIRMED [{fire_conf:.0f}%]", (30, 135), 
                                cv2.FONT_HERSHEY_SIMPLEX, 1.2, (0, 165, 255), 4, cv2.LINE_AA)
                    
                # Blast to screen
                cv2.imshow("Watchr AI Engine - LIVE", display_frame)
                
            except Exception as e:
                logger.error(f"Visualization overlay crashed: {e}")

            # 2.7 Hardware Exit Lock
            if cv2.waitKey(1) & 0xFF == 27:
                logger.info("Terminate instruction received (ESC).")
                break

        except Exception as e:
            logger.error(f"SYSTEM PANIC in main loop: {e}")
            break

    # Graceful garbage collection
    if 'cam_manager' in locals():
        cam_manager.release()
    cv2.destroyAllWindows()
    logger.info("Pipeline terminated safely.")

if __name__ == "__main__":
    main()
