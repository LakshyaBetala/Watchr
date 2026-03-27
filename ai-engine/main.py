import cv2
import json
import logging

from video_capture import initialize_capture
from detection import PersonDetector
from tracking import CentroidTracker
from zone_mapping import ZoneMapper, visualize_zones
from theft_detection import TheftDetectionEngine
from fire_detection import FireDetector

# Configure minimal, clean logging focused strictly on JSON layout for the terminal integration
logging.basicConfig(level=logging.INFO, format='%(message)s')
logger = logging.getLogger(__name__)

def main():
    logger.info("Starting Watchr AI Engine Integration...")

    # --- 1. INITIALIZE MODULES (Fault Tolerant Start) ---
    try:
        primary_source = 0
        fallback_source = "fallback.mp4"
        cap = initialize_capture(primary_source)
        if cap is None:
            logger.warning("Webcam unavailable. Engaging secondary fallback...")
            cap = initialize_capture(fallback_source)
            if cap is None:
                logger.error("SYSTEM HALT: All video ingestion sources failed.")
                return

        # Load isolated Intelligence Engines
        detector = PersonDetector(model_name="yolov8n.pt", conf_thresh=0.5)
        tracker = CentroidTracker(max_distance=50, max_missed=5)
        zone_mapper = ZoneMapper()  # Evaluates physical mapping
        theft_engine = TheftDetectionEngine(shelf_dwell_threshold=3, theft_confirm_threshold=3)
        fire_engine = FireDetector(area_threshold=5000, buffer_size=5, min_trigger=3)
        
    except Exception as e:
        logger.error(f"CRITICAL MODULE FAILURE during initialization: {e}")
        return

    logger.info("Pipeline Online. Processing Frames...")

    prev_frame = None
    camera_id = 1

    # --- 2. THE CONTINUOUS INTELLIGENCE PIPELINE ---
    while True:
        assert cap is not None  # Hint for type checkers inside the loop
        try:
            # 2.1 Video Input
            ret, frame = cap.read()
            if not ret or frame is None:
                logger.warning("Stream gap detected. Attempting stream recovery.")
                if cap is not None:
                    cap.release()
                cap = initialize_capture(fallback_source)
                if cap is None:
                    break
                continue
            
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

            # 2.5 Behavioral Theft State Machine
            try:
                theft_output = theft_engine.detect_theft(zones_output)
            except Exception as e:
                logger.error(f"Theft state machine stalled: {e}")
                theft_output = {"theft": False, "suspects": []}

            # 2.6 Fire/Safety Sentinel
            try:
                fire_output = fire_engine.detect_fire(frame, prev_frame)
            except Exception as e:
                logger.error(f"Life safety / Fire evaluation corrupted: {e}")
                fire_output = {"fire": False}

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
                "fire": fire_output.get("fire", False)
            }

            # Single unified broadcast point to stdout for backend/IoT consumption
            logger.info(json.dumps(system_payload))

            # --- 4. VISUALIZATION ENGINE ---
            try:
                # Renders static geometric boundaries and dynamically tracked IDs
                display_frame = visualize_zones(display_frame, zone_mapper, track_output, zones_output)
                roles_dict = system_payload.get("roles", {})
                
                # Extract and render Role & YOLO Confidence Score per tracked object
                for obj_id_str, bbox in track_output.get("objects", {}).items():
                    if isinstance(bbox, list) and len(bbox) >= 5:
                        conf = float(bbox[4])
                        x1, y1, x2, y2 = map(int, bbox[:4])
                        role = roles_dict.get(obj_id_str, "CUSTOMER")
                        
                        label_color = (0, 255, 255) if role == "CUSTOMER" else (255, 100, 100)
                        if role == "SUSPECT": label_color = (0, 0, 255)
                        
                        label = f"{role} ({conf:.2f})"
                        cv2.putText(display_frame, label, (x1, y1 - 8), 
                                    cv2.FONT_HERSHEY_SIMPLEX, 0.6, label_color, 2, cv2.LINE_AA)
                
                # Render Demographics Metrics overlay
                staff_count = list(roles_dict.values()).count("STAFF")
                cust_count = list(roles_dict.values()).count("CUSTOMER")
                metrics_text = f"Staff Logged: {staff_count} | Customers: {cust_count}"
                cv2.putText(display_frame, metrics_text, (30, 95), 
                            cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255, 255, 255), 2, cv2.LINE_AA)
                
                # Render Critical Alerts cleanly over the frame
                if system_payload["theft"]:
                    # Safely extract suspected IDs and calculate average threat confidence
                    suspects_list = system_payload.get("suspects", [])
                    max_conf = 0.0
                    if isinstance(suspects_list, list):
                        for sid in suspects_list:
                            bbox = track_output["objects"].get(str(sid), [])
                            if isinstance(bbox, list) and len(bbox) >= 5:
                                conf = float(bbox[4])
                                if conf > max_conf: max_conf = conf
                            
                    display_conf = max_conf if max_conf > 0 else 0.99
                    
                    if isinstance(suspects_list, list):
                        safe_suspects_str = ", ".join([str(s) for s in suspects_list])
                    else:
                        safe_suspects_str = "UNKNOWN"
                        
                    alert_text = f"🚨 SUSPICIOUS ACTIVITY [CONF: {display_conf*100:.1f}%]"
                    cv2.putText(display_frame, alert_text, (30, 60), 
                                cv2.FONT_HERSHEY_SIMPLEX, 0.9, (0, 0, 255), 3, cv2.LINE_AA)
                    
                if system_payload["fire"]:
                    cv2.putText(display_frame, "🔥 FIRE DETECTED", (30, 135), 
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
    if cap is not None:
        cap.release()
    cv2.destroyAllWindows()
    logger.info("Pipeline terminated safely.")

if __name__ == "__main__":
    main()
