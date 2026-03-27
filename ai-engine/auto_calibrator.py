import cv2
import numpy as np
import json
import logging
from ultralytics import YOLO
from multi_camera import MultiCameraManager

logging.basicConfig(level=logging.INFO, format='%(message)s')
logger = logging.getLogger(__name__)

class HackathonCalibrator:
    def __init__(self):
        """
        Phase 13: Supreme Gesture Calibrator (Hackathon Edition).
        Replaces time-based heatmaps with Object-Triggered Spatial Locking. 
        Instead of waiting 5 seconds, the user holds up a CELL PHONE (YOLO Class 67).
        When the AI sees the symbol, it instantly scans the person's floor coordinate and locks the zone!
        """
        logger.info("Loading Supreme AI Vision Graph...")
        self.model = YOLO("yolov8n.pt")
        self.computed_zones = {}
        # COCO class 67 is 'cell phone'. We use this as the "Symbol/Sign" trigger.
        self.trigger_class = 67  
        self.person_class = 0

    def get_trigger_and_person(self, results):
        """Scans the YOLO output to find a trigger, and ONLY returns the person holding it."""
        persons = []
        trigger_bbox = None
        
        for box in results[0].boxes:
            cls_id = int(box.cls[0])
            conf = float(box.conf[0])
            
            if conf > 0.4:
                bbox = box.xyxy[0].cpu().numpy()
                if cls_id == self.person_class:
                    persons.append(bbox)
                elif cls_id == self.trigger_class:
                    trigger_bbox = bbox
                    
        # Mathematical Isolation: If there are 100 people, ONLY grab the one holding the phone
        if trigger_bbox is not None and persons:
            tx1, ty1, tx2, ty2 = trigger_bbox
            tcx = (tx1 + tx2) / 2
            tcy = (ty1 + ty2) / 2
            
            for p_ext in persons:
                px1, py1, px2, py2 = p_ext
                # If the phone's center is inside this person's bounding box boundaries:
                if px1 <= tcx <= px2 and py1 <= tcy <= py2:
                    return p_ext, True
                    
        return None, False

    def calibrate_zone(self, zone_name):
        logger.info(f"--- MAPPING: {zone_name.upper()} ---")
        trigger_hold_frames = 0
        required_hold = 15  # Frames required to hold the trigger symbol steady
        
        while True:
            ret, frame = self.cam_manager.get_panorama()
            if not ret or frame is None:
                break
                
            display = frame.copy()
            results = self.model(frame, verbose=False)
            
            person_bbox, trigger_detected = self.get_trigger_and_person(results)
            
            # --- UI Render ---
            cv2.rectangle(display, (0, 0), (640, 100), (20, 20, 20), -1)
            cv2.putText(display, f"MAPPING: {zone_name.upper()}", (20, 35), 
                        cv2.FONT_HERSHEY_SIMPLEX, 0.9, (0, 255, 255), 2)
            cv2.putText(display, "Hackathon Mode: Point a CELL PHONE at the camera to lock!", (20, 75), 
                        cv2.FONT_HERSHEY_SIMPLEX, 0.6, (200, 200, 200), 2)
            
            # Render Person bounding box
            if person_bbox is not None:
                x1, y1, x2, y2 = map(int, person_bbox)
                cx = (x1 + x2) // 2
                cv2.rectangle(display, (x1, y1), (x2, y2), (255, 165, 0), 2)
                cv2.circle(display, (cx, y2), 10, (0, 0, 255), -1)  # Draw Foot Anchor
                
            if trigger_detected and person_bbox is not None:
                trigger_hold_frames += 1
                progress = int((trigger_hold_frames / required_hold) * 100)
                cv2.putText(display, f"SYMBOL DETECTED! LOCKING... {progress}%", (x1, y1 - 20), 
                            cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0, 255, 0), 2)
                
                # Lock the Zone!
                if trigger_hold_frames >= required_hold:
                    # Calculate floor anchor bounds based on person's feet and width
                    anchor_x1 = max(0, x1 - 30)
                    anchor_x2 = min(frame.shape[1], x2 + 30)
                    anchor_y1 = max(0, y2 - 150) # Extend upwards to capture torsos standing there
                    anchor_y2 = min(frame.shape[0], y2 + 60)
                    
                    self.computed_zones[zone_name] = [(int(anchor_x1), int(anchor_y1)), (int(anchor_x2), int(anchor_y2))]
                    
                    # Success UI Freeze
                    cv2.rectangle(display, (0, 0), (640, 100), (0, 180, 0), -1)
                    cv2.putText(display, f"✅ {zone_name.upper()} MATHEMATICALLY LOCKED!", (30, 60), 
                                cv2.FONT_HERSHEY_SIMPLEX, 1.0, (255, 255, 255), 3)
                    cv2.circle(display, (cx, y2), 20, (0, 255, 0), -1)
                    cv2.imshow("Hackathon Gesture Calibrator", display)
                    cv2.waitKey(1500)
                    logger.info(f"✅ Locked {zone_name.upper()} at foot anchor ({cx}, {y2})")
                    return True
            else:
                trigger_hold_frames = max(0, trigger_hold_frames - 2) # Cool down if symbol dropped
                
            cv2.imshow("Hackathon Gesture Calibrator", display)
            key = cv2.waitKey(1) & 0xFF
            if key == 27:  # ESC to skip
                return False

    def run_smart_menu(self):
        logger.info("\n=== SUPREME AI HACKATHON DASHBOARD ===")
        logger.info("[ARCHITECTURE SETUP]")
        logger.info("Camera 1 (Top-Left):   BILLING COUNTER")
        logger.info("Camera 2 (Top-Right):  SHELVES (1, 2, 3...)")
        logger.info("Camera 3 (Bottom-Left):EXIT DOOR")
        
        num_cams = input("\n[CONFIG] How many cameras to orchestrate? (1-4, Default=3): ").strip()
        num_cams = int(num_cams) if num_cams.isdigit() else 3
        
        sources = []
        for i in range(num_cams):
            src = input(f"URL for Camera {i+1} (Leave blank for Webcam 0): ").strip()
            sources.append(src)
            
        self.cam_manager = MultiCameraManager(sources)
        
        while True:
            ret, frame = self.cam_manager.get_panorama()
            if not ret: break
            
            display = frame.copy()
            cv2.rectangle(display, (0, 0), (640, 480), (10, 10, 10), -1)
            cv2.putText(display, "SUPREME HACKATHON CALIBRATOR", (100, 50), cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0, 255, 255), 2)
            cv2.putText(display, "Lock laptops down. Cams must be STATIC.", (80, 100), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 0, 255), 2)
            cv2.putText(display, "Press 'B' - Map Billing [Camera 1 Focus]", (50, 180), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255, 255, 255), 2)
            cv2.putText(display, "Press '1' - Map Shelf 1 [Camera 2 Focus]", (50, 230), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255, 255, 255), 2)
            cv2.putText(display, "Press '2' - Map Shelf 2 [Camera 2 Focus]", (50, 280), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255, 255, 255), 2)
            cv2.putText(display, "Press 'E' - Map Exit    [Camera 3 Focus]", (50, 330), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255, 255, 255), 2)
            cv2.putText(display, "Press 'S' - Save Global Blueprint & Quit", (50, 430), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 0), 2)
            
            # Show current saved zones overlaying the menu
            mapped = ", ".join(self.computed_zones.keys())
            cv2.putText(display, f"Mapped so far: [{mapped}]", (50, 380), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (200, 200, 200), 1)

            cv2.imshow("Hackathon Gesture Calibrator", display)
            key = cv2.waitKey(1) & 0xFF
            
            if key == ord('b'): self.calibrate_zone("billing")
            elif key == ord('1'): self.calibrate_zone("shelf_1")
            elif key == ord('2'): self.calibrate_zone("shelf_2")
            elif key == ord('3'): self.calibrate_zone("shelf_3")
            elif key == ord('e'): self.calibrate_zone("exit")
            elif key == ord('s'): 
                logger.info("Saving multi-camera configurations...")
                break
            elif key == 27:
                break
                
        self.cam_manager.release()
        cv2.destroyAllWindows()
        
        if self.computed_zones:
            with open("auto_zones.json", "w") as f:
                json.dump(self.computed_zones, f, indent=4)
            logger.info(f"✅ HACKATHON CONFIGURATION SAVED: {list(self.computed_zones.keys())}")
        else:
            logger.warning("Exited without saving any zones.")

if __name__ == "__main__":
    ai = HackathonCalibrator()
    ai.run_smart_menu()
