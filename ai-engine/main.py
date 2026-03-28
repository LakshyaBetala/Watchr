import cv2
import json
import logging
import time
import numpy as np
from collections import Counter

from multi_camera import MultiCameraManager
from detection import PersonDetector
from tracking import CentroidTracker
from zone_mapping import ZoneMapper, visualize_zones
from theft_detection import TheftDetectionEngine
from fire_detection import FireDetector

logging.basicConfig(level=logging.INFO, format='%(message)s')
logger = logging.getLogger(__name__)

# ─── Camera Grid Coordinate Offsets ───────────────────────────────────
# Each camera occupies a 640x480 tile in the 2x2 mosaic:
#   CAM 1: (0,0)      CAM 2: (640,0)
#   CAM 3: (0,480)    CAM 4: (640,480)
GRID_OFFSETS = [
    (0, 0),        # CAM 1 top-left
    (640, 0),      # CAM 2 top-right
    (0, 480),      # CAM 3 bottom-left
    (640, 480),    # CAM 4 bottom-right
]

def get_dominant_color(image, k=3):
    """Extract dominant color for ReID."""
    pixels = image.reshape((-1, 3)).astype(np.float32)
    criteria = (cv2.TERM_CRITERIA_EPS + cv2.TERM_CRITERIA_MAX_ITER, 10, 1.0)
    _, labels, centers = cv2.kmeans(pixels, k, None, criteria, 10, cv2.KMEANS_RANDOM_CENTERS)
    counts = Counter(labels.flatten())
    dominant = centers[counts.most_common(1)[0][0]]
    return [int(c) for c in dominant]

def main():
    logger.info("Starting Watchr AI Engine...")

    try:
        print("\n╔══════════════════════════════════════════════╗")
        print("║  WATCHR AI ENGINE — BATCHED GPU INFERENCE    ║")
        print("╚══════════════════════════════════════════════╝")
        
        num_cams = input("[CONFIG] Number of cameras (1-4, Default=1): ").strip()
        num_cams = int(num_cams) if num_cams.isdigit() else 1
        
        sources = []
        for i in range(num_cams):
            src = input(f"Camera {i+1} URL (blank=Webcam): ").strip()
            sources.append(src)
            
        cam_manager = MultiCameraManager(sources)
        
        # Init modules — detection engine auto-selects ONNX or Ultralytics
        detector = PersonDetector(model_name="yolov8n.pt", conf_thresh=0.5)
        tracker = CentroidTracker(max_distance=50, max_missed=5)
        zone_mapper = ZoneMapper()
        theft_engine = TheftDetectionEngine(shelf_dwell_threshold=3, theft_confirm_threshold=3)
        fire_engine = FireDetector(area_threshold=5000, buffer_size=5, min_trigger=3)
        
        logger.info(f"Inference backend: {detector.backend}")
        
    except Exception as e:
        logger.error(f"INIT FAILED: {e}")
        return

    prev_frame = None
    camera_id = 1
    store_lockdown = False
    global_suspect_signatures = []
    fps_counter = time.perf_counter()

    # ─── MAIN LOOP ────────────────────────────────────────────────────
    while True:
        try:
            loop_start = time.perf_counter()
            
            # ── 1. FETCH INDIVIDUAL FRAMES (no stitching) ─────────────
            raw_frames = cam_manager.get_individual_frames()
            
            # Extract valid frames for inference
            valid_frames = []
            valid_indices = []
            for i, (ret, frame) in enumerate(raw_frames):
                if ret and frame is not None:
                    valid_frames.append(frame)
                    valid_indices.append(i)
            
            if not valid_frames:
                logger.warning("No camera feeds available.")
                break
            
            # ── 2. BATCHED GPU INFERENCE (one call for all cameras) ───
            try:
                batch_results = detector.detect_batch(valid_frames)
            except Exception as e:
                logger.error(f"Batched detection failed: {e}")
                batch_results = [{"people_count": 0, "detections": [], "stable": False}] * len(valid_frames)
            
            # ── 3. MERGE DETECTIONS WITH COORDINATE OFFSETS ───────────
            # Map per-camera detections to mosaic coordinate space
            merged_detections = []
            for cam_idx, det_result in zip(valid_indices, batch_results):
                ox, oy = GRID_OFFSETS[cam_idx] if cam_idx < len(GRID_OFFSETS) else (0, 0)
                
                for det in det_result.get("detections", []):
                    x1, y1, x2, y2 = det[0], det[1], det[2], det[3]
                    conf = det[4] if len(det) > 4 else 0.0
                    # Offset to mosaic coordinate space
                    merged_detections.append([x1 + ox, y1 + oy, x2 + ox, y2 + oy, conf])
            
            # ── 4. BUILD MOSAIC FOR DISPLAY (after inference) ─────────
            display_frames = [f for f in valid_frames]
            _, mosaic = cam_manager.get_mosaic(display_frames)
            display_frame = mosaic.copy()
            
            # Use mosaic as the unified frame for fire detection
            frame = mosaic
            
            # ── 5. TRACKING ──────────────────────────────────────────
            try:
                track_output = tracker.track(merged_detections)
            except Exception as e:
                logger.error(f"Tracking failed: {e}")
                track_output = {"people_count": 0, "ids": [], "objects": {}}

            # ── 6. ZONE MAPPING ──────────────────────────────────────
            try:
                zones_output = zone_mapper.map_zones(track_output.get("objects", {}))
            except Exception as e:
                logger.error(f"Zone mapping failed: {e}")
                zones_output = {"zones": {}}

            # ── 7. THEFT STATE MACHINE ───────────────────────────────
            try:
                theft_output = theft_engine.detect_theft(zones_output, track_output.get("objects", {}))
            except Exception as e:
                logger.error(f"Theft engine failed: {e}")
                theft_output = {"theft": False, "suspects": [], "roles": {}}

            # ── 8. FIRE & SMOKE SENTINEL ─────────────────────────────
            try:
                fire_output = fire_engine.detect_fire(frame, prev_frame)
            except Exception as e:
                logger.error(f"Fire detection failed: {e}")
                fire_output = {"fire": False, "smoke": False, "confidence": 0.0}

            prev_frame = frame.copy()

            # ── 9. JSON PAYLOAD ──────────────────────────────────────
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

            logger.info(json.dumps(system_payload))

            # ── 10. VISUALIZATION ────────────────────────────────────
            try:
                display_frame = visualize_zones(display_frame, zone_mapper, track_output, zones_output)
                roles_dict = system_payload.get("roles", {})
                zones_map = zones_output.get("zones", {})
                
                # Per-zone occupancy
                zone_counts = {}
                for oid, zname in zones_map.items():
                    zone_counts[zname] = zone_counts.get(zname, 0) + 1
                
                # Per-person labels
                for obj_id_str, bbox in track_output.get("objects", {}).items():
                    if isinstance(bbox, list) and len(bbox) >= 4:
                        conf = float(bbox[4]) if len(bbox) >= 5 else 0.0
                        x1, y1, x2, y2 = map(int, bbox[:4])
                        role = roles_dict.get(obj_id_str, "CUSTOMER")
                        zone = zones_map.get(obj_id_str, "unknown")
                        
                        if role == "SUSPECT":
                            box_color = (0, 0, 255)
                            label_color = (0, 0, 255)
                        elif role == "STAFF":
                            box_color = (255, 100, 100)
                            label_color = (255, 150, 100)
                        else:
                            box_color = (0, 255, 200)
                            label_color = (0, 255, 200)
                        
                        cv2.rectangle(display_frame, (x1, y1), (x2, y2), box_color, 2)
                        
                        cv2.rectangle(display_frame, (x1, y1 - 45), (x1 + 200, y1), (20, 20, 20), -1)
                        cv2.putText(display_frame, f"ID:{obj_id_str}", (x1 + 3, y1 - 30),
                                    cv2.FONT_HERSHEY_SIMPLEX, 0.45, (255, 255, 255), 1, cv2.LINE_AA)
                        cv2.putText(display_frame, f"{role} [{conf*100:.0f}%]", (x1 + 3, y1 - 15),
                                    cv2.FONT_HERSHEY_SIMPLEX, 0.45, label_color, 1, cv2.LINE_AA)
                        cv2.putText(display_frame, f"@ {zone.upper()}", (x1 + 3, y1 - 2),
                                    cv2.FONT_HERSHEY_SIMPLEX, 0.35, (180, 180, 180), 1, cv2.LINE_AA)
                
                # Analytics Panel (top-right)
                fw = display_frame.shape[1]
                panel_w, panel_h = 280, 220
                px1, py1 = fw - panel_w - 10, 10
                px2, py2 = fw - 10, py1 + panel_h
                
                overlay = display_frame.copy()
                cv2.rectangle(overlay, (px1, py1), (px2, py2), (15, 15, 15), -1)
                display_frame = cv2.addWeighted(overlay, 0.75, display_frame, 0.25, 0)
                cv2.rectangle(display_frame, (px1, py1), (px2, py2), (0, 255, 255), 1)
                
                # FPS
                fps = 1.0 / (loop_start - fps_counter) if (loop_start - fps_counter) > 0 else 0
                fps_counter = loop_start
                
                cv2.putText(display_frame, f"WATCHR [{detector.backend.upper()}]", (px1+10, py1+22),
                            cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 255), 2, cv2.LINE_AA)
                cv2.putText(display_frame, f"FPS: {fps:.0f}", (px1+10, py1+45),
                            cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 0), 1, cv2.LINE_AA)
                
                total = system_payload.get("people_count", 0)
                staff_count = list(roles_dict.values()).count("STAFF")
                cust_count = list(roles_dict.values()).count("CUSTOMER")
                suspect_count = list(roles_dict.values()).count("SUSPECT")
                
                y_off = py1 + 70
                cv2.putText(display_frame, f"Total: {total}", (px1+10, y_off),
                            cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255,255,255), 1, cv2.LINE_AA)
                cv2.putText(display_frame, f"Staff: {staff_count}", (px1+10, y_off+22),
                            cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255,150,100), 1, cv2.LINE_AA)
                cv2.putText(display_frame, f"Customers: {cust_count}", (px1+10, y_off+44),
                            cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0,255,200), 1, cv2.LINE_AA)
                if suspect_count > 0:
                    cv2.putText(display_frame, f"SUSPECTS: {suspect_count}", (px1+10, y_off+66),
                                cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0,0,255), 2, cv2.LINE_AA)
                
                # Zone occupancy bars
                y_off += 90
                for zname, zcount in zone_counts.items():
                    if zname == "unknown": continue
                    bar = min(zcount * 30, panel_w - 100)
                    cv2.rectangle(display_frame, (px1+80, y_off-10), (px1+80+bar, y_off), (0,200,200), -1)
                    cv2.putText(display_frame, f"{zname}: {zcount}", (px1+10, y_off),
                                cv2.FONT_HERSHEY_SIMPLEX, 0.35, (200,200,200), 1, cv2.LINE_AA)
                    y_off += 18
                
                # Theft / ReID
                if system_payload["theft"]:
                    store_lockdown = True
                    for sid in system_payload.get("suspects", []):
                        bbox = track_output["objects"].get(str(sid), [])
                        if isinstance(bbox, list) and len(bbox) >= 4:
                            x1, y1, x2, y2 = map(int, bbox[:4])
                            h = y2 - y1
                            roi = frame[y1+int(h*0.2):y2-int(h*0.2), x1:x2]
                            if roi.size > 0:
                                global_suspect_signatures.append(get_dominant_color(roi))
                
                if store_lockdown:
                    cv2.putText(display_frame, "STORE LOCKDOWN: THEFT IN PROGRESS", (30, 40),
                                cv2.FONT_HERSHEY_SIMPLEX, 1.0, (0, 0, 255), 3, cv2.LINE_AA)
                    
                    for id_str, role in roles_dict.items():
                        if zones_output["zones"].get(id_str) == "exit":
                            bbox = track_output["objects"].get(str(id_str), [])
                            if isinstance(bbox, list) and len(bbox) >= 4:
                                x1, y1, x2, y2 = map(int, bbox[:4])
                                h = y2 - y1
                                roi = frame[y1+int(h*0.2):y2-int(h*0.2), x1:x2]
                                match = False
                                if roi.size > 0:
                                    test_sig = get_dominant_color(roi)
                                    for thief_sig in global_suspect_signatures:
                                        if np.linalg.norm(np.array(test_sig) - np.array(thief_sig)) < 65:
                                            match = True
                                            break
                                if match:
                                    cv2.rectangle(display_frame, (0,0), (fw, display_frame.shape[0]), (0,0,255), 10)
                                    cv2.putText(display_frame, "SUSPECT ESCAPING EXIT", (30, 100),
                                                cv2.FONT_HERSHEY_SIMPLEX, 1.5, (0,0,255), 5, cv2.LINE_AA)

                # Smoke / Fire overlays
                if system_payload.get("smoke") and not system_payload["fire"]:
                    ov = display_frame.copy()
                    cv2.rectangle(ov, (0,0), (fw, 50), (0,140,255), -1)
                    display_frame = cv2.addWeighted(ov, 0.6, display_frame, 0.4, 0)
                    cv2.putText(display_frame, "SMOKE DETECTED - EARLY WARNING", (30, 35),
                                cv2.FONT_HERSHEY_SIMPLEX, 0.9, (255,255,255), 3, cv2.LINE_AA)
                
                if system_payload["fire"]:
                    fconf = system_payload.get("fire_confidence", 0) * 100
                    cv2.rectangle(display_frame, (0,0), (fw, display_frame.shape[0]), (0,0,255), 8)
                    cv2.putText(display_frame, f"FIRE CONFIRMED [{fconf:.0f}%]", (30, 135),
                                cv2.FONT_HERSHEY_SIMPLEX, 1.2, (0,165,255), 4, cv2.LINE_AA)
                
                cv2.imshow("Watchr AI Engine", display_frame)
                
            except Exception as e:
                logger.error(f"Visualization crashed: {e}")

            if cv2.waitKey(1) & 0xFF == 27:
                logger.info("ESC pressed. Shutting down.")
                break

        except Exception as e:
            logger.error(f"SYSTEM PANIC: {e}")
            break

    if 'cam_manager' in locals():
        cam_manager.release()
    cv2.destroyAllWindows()
    logger.info("Pipeline terminated.")

if __name__ == "__main__":
    main()
