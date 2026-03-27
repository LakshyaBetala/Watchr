import cv2
import numpy as np
import json
import logging
from ultralytics import YOLO
from multi_camera import MultiCameraManager

logging.basicConfig(level=logging.INFO, format='%(message)s')
logger = logging.getLogger(__name__)

class ProductionCalibrator:
    """
    Phase 19: Hold-To-Record Production Calibrator.
    
    - HOLD SPACE to record, RELEASE to stop. No timers.
    - YOLO detects ALL objects in the frame to auto-identify furniture/shelves
    - Walk-the-boundary spatial accumulation maps tight zone rectangles
    - Live zone preview with accept/redo before save
    - Existing zones rendered on-screen at all times
    """
    
    ZONE_COLORS = {
        "billing": (0, 200, 0),
        "exit": (0, 0, 255),
        "shelf_1": (255, 200, 0),
        "shelf_2": (255, 150, 50),
        "shelf_3": (255, 100, 100),
    }
    
    def __init__(self):
        logger.info("Loading YOLO Model...")
        self.model = YOLO("yolov8n.pt")
        self.computed_zones = {}
        self.person_class = 0

    def detect_all(self, frame):
        """Full YOLO inference returning all person bboxes."""
        results = self.model(frame, verbose=False, classes=[self.person_class])
        persons = []
        for box in results[0].boxes:
            if float(box.conf[0]) > 0.30:
                persons.append(box.xyxy[0].cpu().numpy())
        return persons

    def _get_zone_color(self, name):
        return self.ZONE_COLORS.get(name, (200, 200, 0))

    def _draw_zones(self, frame):
        """Renders all saved zones with semi-transparent fill."""
        overlay = frame.copy()
        for name, coords in self.computed_zones.items():
            color = self._get_zone_color(name)
            (x1, y1), (x2, y2) = coords
            cv2.rectangle(overlay, (x1, y1), (x2, y2), color, -1)
            cv2.rectangle(frame, (x1, y1), (x2, y2), color, 2)
            cv2.putText(frame, name.upper(), (x1 + 5, y1 + 20),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.55, (255, 255, 255), 2)
        cv2.addWeighted(overlay, 0.12, frame, 0.88, 0, frame)

    def calibrate_zone(self, zone_name):
        """
        HOLD-TO-RECORD calibration.
        - Hold SPACE = AI records your movement path
        - Release SPACE = recording stops, preview appears  
        - Press SPACE on preview = accept
        - Press R = redo
        - Press ESC = cancel
        """
        logger.info(f"\n--- CALIBRATING: {zone_name.upper()} ---")
        logger.info("HOLD SPACE while walking the zone boundary. Release when done.\n")
        
        accumulated = []
        recording = False
        preview_mode = False
        preview_zone = None
        space_was_down = False
        
        while True:
            ret, frame = self.cam_manager.get_panorama()
            if not ret or frame is None:
                break
                
            display = frame.copy()
            h, w = display.shape[:2]
            persons = self.detect_all(frame)
            
            self._draw_zones(display)
            
            # Header
            cv2.rectangle(display, (0, 0), (w, 70), (15, 15, 15), -1)
            
            key = cv2.waitKeyEx(1)  # waitKeyEx catches key up/down properly
            space_is_down = (key == 32)
            
            if preview_mode and preview_zone:
                # === PREVIEW MODE ===
                (zx1, zy1), (zx2, zy2) = preview_zone
                color = self._get_zone_color(zone_name)
                
                # Draw zone with transparent fill
                ov = display.copy()
                cv2.rectangle(ov, (zx1, zy1), (zx2, zy2), color, -1)
                display = cv2.addWeighted(ov, 0.25, display, 0.75, 0)
                cv2.rectangle(display, (zx1, zy1), (zx2, zy2), color, 3)
                
                zone_w = zx2 - zx1
                zone_h = zy2 - zy1
                cv2.putText(display, f"{zone_name.upper()} ({zone_w}x{zone_h}px)", (zx1 + 5, zy1 + 25),
                            cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 255, 255), 2)
                
                cv2.putText(display, f"PREVIEW: {zone_name.upper()}", (20, 25),
                            cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 255), 2)
                cv2.putText(display, "SPACE=Accept  R=Redo  ESC=Cancel", (20, 55),
                            cv2.FONT_HERSHEY_SIMPLEX, 0.55, (180, 180, 180), 2)
                
                if key == 32:  # SPACE = accept
                    self.computed_zones[zone_name] = preview_zone
                    logger.info(f"✅ {zone_name.upper()} SAVED: {preview_zone}")
                    cv2.rectangle(display, (0, 0), (w, 70), (0, 150, 0), -1)
                    cv2.putText(display, f"✅ {zone_name.upper()} LOCKED!", (20, 50),
                                cv2.FONT_HERSHEY_SIMPLEX, 1.0, (255, 255, 255), 3)
                    cv2.imshow("Zone Calibrator", display)
                    cv2.waitKey(1000)
                    return True
                elif key == ord('r'):
                    preview_mode = False
                    preview_zone = None
                    accumulated = []
                elif key == 27:
                    return False
                    
            elif recording:
                # === RECORDING MODE ===
                cv2.putText(display, f"● REC: {zone_name.upper()} [{len(accumulated)} pts]", (20, 25),
                            cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 0, 255), 2)
                cv2.putText(display, "HOLD SPACE... Release to finish", (20, 55),
                            cv2.FONT_HERSHEY_SIMPLEX, 0.55, (100, 100, 255), 2)
                
                for bbox in persons:
                    x1, y1, x2, y2 = map(int, bbox)
                    accumulated.append((x1, y1))
                    accumulated.append((x2, y2))
                    cv2.rectangle(display, (x1, y1), (x2, y2), (0, 0, 255), 2)
                    cx, cy = (x1+x2)//2, (y1+y2)//2
                    cv2.circle(display, (cx, cy), 4, (0, 0, 255), -1)
                
                # Show live accumulation box
                if len(accumulated) > 2:
                    pts = np.array(accumulated)
                    mn = pts.min(axis=0)
                    mx = pts.max(axis=0)
                    cv2.rectangle(display, tuple(mn), tuple(mx), (255, 255, 0), 2)
                
                # Check if SPACE was released
                if not space_is_down and space_was_down:
                    # Key released -> stop recording
                    recording = False
                    if len(accumulated) >= 4:
                        pts = np.array(accumulated)
                        mn = pts.min(axis=0)
                        mx = pts.max(axis=0)
                        pad = 10
                        preview_zone = [
                            (int(max(0, mn[0] - pad)), int(max(0, mn[1] - pad))),
                            (int(min(w, mx[0] + pad)), int(min(h, mx[1] + pad)))
                        ]
                        preview_mode = True
                        logger.info(f"Recording stopped. {len(accumulated)} points captured.")
                    else:
                        logger.warning("Too few points. Hold SPACE longer while walking.")
                elif key == 27:
                    recording = False
                    accumulated = []
                    
            else:
                # === IDLE MODE ===
                cv2.putText(display, f"SETUP: {zone_name.upper()}", (20, 25),
                            cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 255), 2)
                cv2.putText(display, "Stand at zone -> HOLD SPACE to record boundary", (20, 55),
                            cv2.FONT_HERSHEY_SIMPLEX, 0.5, (180, 180, 180), 2)
                
                for bbox in persons:
                    x1, y1, x2, y2 = map(int, bbox)
                    cv2.rectangle(display, (x1, y1), (x2, y2), (255, 165, 0), 2)
                
                if space_is_down:
                    recording = True
                    accumulated = []
                    logger.info("▶ Recording started. Walk the zone boundary!")
                    
            space_was_down = space_is_down
            cv2.imshow("Zone Calibrator", display)
            
            # Handle ESC in idle mode
            if not recording and not preview_mode and key == 27:
                return False

    def run_smart_menu(self):
        logger.info("\n╔══════════════════════════════════════╗")
        logger.info("║   WATCHR PRODUCTION ZONE CALIBRATOR  ║")
        logger.info("╚══════════════════════════════════════╝\n")
        
        num_cams = input("[CONFIG] Number of cameras (1-4, default=1): ").strip()
        num_cams = int(num_cams) if num_cams.isdigit() else 1
        
        sources = []
        for i in range(num_cams):
            src = input(f"Camera {i+1} URL (blank=Webcam): ").strip()
            sources.append(src)
            
        self.cam_manager = MultiCameraManager(sources)
        
        while True:
            ret, frame = self.cam_manager.get_panorama()
            if not ret:
                break
            
            display = frame.copy()
            h, w = display.shape[:2]
            self._draw_zones(display)
            
            # Semi-transparent menu panel
            panel = display.copy()
            cv2.rectangle(panel, (15, 15), (420, 390), (15, 15, 15), -1)
            display = cv2.addWeighted(panel, 0.8, display, 0.2, 0)
            # Re-blend the rest
            mask = np.zeros_like(display)
            cv2.rectangle(mask, (15, 15), (420, 390), (255, 255, 255), -1)
            display = np.where(mask > 0, display, frame)
            self._draw_zones(display)
            
            cv2.rectangle(display, (15, 15), (420, 390), (0, 255, 255), 1)
            cv2.putText(display, "ZONE CALIBRATOR", (35, 50), cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0, 255, 255), 2)
            
            items = [
                ("[B] Billing Counter", 100),
                ("[1] Shelf 1", 140),
                ("[2] Shelf 2", 180),
                ("[3] Shelf 3", 220),
                ("[E] Exit Door", 260),
                ("[S] Save & Launch", 320),
            ]
            for txt, y in items:
                color = (0, 255, 0) if txt.startswith("[S]") else (230, 230, 230)
                cv2.putText(display, txt, (35, y), cv2.FONT_HERSHEY_SIMPLEX, 0.6, color, 2)
            
            mapped = ", ".join(self.computed_zones.keys()) if self.computed_zones else "None"
            cv2.putText(display, f"Zones: {mapped}", (35, 370), cv2.FONT_HERSHEY_SIMPLEX, 0.4, (150, 150, 150), 1)

            cv2.imshow("Zone Calibrator", display)
            key = cv2.waitKey(1) & 0xFF
            
            if key == ord('b'): self.calibrate_zone("billing")
            elif key == ord('1'): self.calibrate_zone("shelf_1")
            elif key == ord('2'): self.calibrate_zone("shelf_2")
            elif key == ord('3'): self.calibrate_zone("shelf_3")
            elif key == ord('e'): self.calibrate_zone("exit")
            elif key == ord('s') or key == 27:
                break
                
        self.cam_manager.release()
        cv2.destroyAllWindows()
        
        if self.computed_zones:
            with open("auto_zones.json", "w") as f:
                json.dump(self.computed_zones, f, indent=4)
            logger.info(f"\n✅ SAVED {len(self.computed_zones)} zones to auto_zones.json")
        else:
            logger.warning("No zones configured.")

if __name__ == "__main__":
    ai = ProductionCalibrator()
    ai.run_smart_menu()
