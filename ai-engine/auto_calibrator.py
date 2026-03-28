import cv2
import numpy as np
import json
import logging
from multi_camera import MultiCameraManager

logging.basicConfig(level=logging.INFO, format='%(message)s')
logger = logging.getLogger(__name__)

class ProductionCalibrator:
    """
    Precision Point-and-Click Calibrator.
    
    - Replaces YOLO-based walk-accumulation with an exact manual draw.
    - Click and drag to draw a bounding box for billing, shelf, or exit zones.
    - SPACE to confirm, R to redo, ESC to exit.
    """
    
    ZONE_COLORS = {
        "billing": (0, 200, 0),
        "exit": (0, 0, 255),
        "shelf_1": (255, 200, 0),
        "shelf_2": (255, 150, 50),
        "shelf_3": (255, 100, 100),
    }
    
    def __init__(self):
        self.computed_zones = {}
        self.drawing = False
        self.ix, self.iy = -1, -1
        self.current_rect = None
        self.window_name = "Zone Calibrator"
        self.show_menu = True
        self.fullscreen = False

    def _get_zone_color(self, name):
        return self.ZONE_COLORS.get(name, (200, 200, 0))

    def _draw_zones(self, frame):
        overlay = frame.copy()
        for name, coords in self.computed_zones.items():
            color = self._get_zone_color(name)
            (x1, y1), (x2, y2) = coords
            cv2.rectangle(overlay, (x1, y1), (x2, y2), color, -1)
            cv2.rectangle(frame, (x1, y1), (x2, y2), color, 2)
            cv2.putText(frame, name.upper(), (x1 + 5, y1 + 20),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.55, (255, 255, 255), 2)
        cv2.addWeighted(overlay, 0.12, frame, 0.88, 0, frame)
        
    def _mouse_callback(self, event, x, y, flags, param):
        if event == cv2.EVENT_LBUTTONDOWN:
            self.drawing = True
            self.ix, self.iy = x, y
            self.current_rect = None
        elif event == cv2.EVENT_MOUSEMOVE:
            if self.drawing:
                self.current_rect = [(self.ix, self.iy), (x, y)]
        elif event == cv2.EVENT_LBUTTONUP:
            self.drawing = False
            self.current_rect = [(min(self.ix, x), min(self.iy, y)), (max(self.ix, x), max(self.iy, y))]

    def calibrate_zone(self, zone_name):
        logger.info(f"\n--- CALIBRATING: {zone_name.upper()} ---")
        logger.info("Click and drag to draw the zone boundary. Press SPACE to save, R to redraw, ESC to cancel.\n")
        
        # We need a static frame to draw on. Fetch one good panorama from cameras.
        ret, frame = self.cam_manager.get_panorama()
        if not ret or frame is None:
            logger.error("Could not capture frame to calibrate.")
            return False
            
        scene = frame.copy()
        self.current_rect = None
        self.drawing = False
        
        cv2.setMouseCallback(self.window_name, self._mouse_callback)
        
        while True:
            display = scene.copy()
            self._draw_zones(display)
            
            # Header
            h, w = display.shape[:2]
            color = self._get_zone_color(zone_name)
            
            if self.show_menu:
                cv2.rectangle(display, (0, 0), (w, 70), (15, 15, 15), -1)
                cv2.putText(display, f"CALIBRATING: {zone_name.upper()}  [H] Hide UI  [F] Fullscreen", (20, 25),
                            cv2.FONT_HERSHEY_SIMPLEX, 0.6, color, 2)
                cv2.putText(display, "Click & Drag to draw. [SPACE]=Accept  [R]=Redo  [ESC]=Cancel", (20, 55),
                            cv2.FONT_HERSHEY_SIMPLEX, 0.55, (180, 180, 180), 2)
            else:
                cv2.putText(display, f"[{zone_name.upper()}]  [H] Show UI  [F] Fullscreen", (20, 30),
                            cv2.FONT_HERSHEY_SIMPLEX, 0.6, color, 2)
                        
            # Live drawing
            if self.current_rect is not None:
                pt1, pt2 = self.current_rect
                cv2.rectangle(display, pt1, pt2, color, 2)
                # Show overlay
                ov = display.copy()
                cv2.rectangle(ov, pt1, pt2, color, -1)
                cv2.addWeighted(ov, 0.25, display, 0.75, 0, display)
            
            cv2.imshow(self.window_name, display)
            key = cv2.waitKey(1) & 0xFF
            
            if key == 32 and self.current_rect is not None: # SPACE
                self.computed_zones[zone_name] = self.current_rect
                logger.info(f"✅ {zone_name.upper()} SAVED: {self.current_rect}")
                cv2.setMouseCallback(self.window_name, lambda *args: None) # Remove callback
                # Show locked screen flash
                cv2.rectangle(display, (0, 0), (w, 70), (0, 150, 0), -1)
                cv2.putText(display, f"✅ {zone_name.upper()} LOCKED!", (20, 50),
                            cv2.FONT_HERSHEY_SIMPLEX, 1.0, (255, 255, 255), 3)
                cv2.imshow(self.window_name, display)
                cv2.waitKey(800)
                return True
            elif key == ord('r') or key == ord('R'):
                self.current_rect = None
            elif key == ord('h') or key == ord('H'):
                self.show_menu = not self.show_menu
            elif key == ord('f') or key == ord('F'):
                self.fullscreen = not self.fullscreen
                if self.fullscreen:
                    cv2.setWindowProperty(self.window_name, cv2.WND_PROP_FULLSCREEN, cv2.WINDOW_FULLSCREEN)
                else:
                    cv2.setWindowProperty(self.window_name, cv2.WND_PROP_FULLSCREEN, cv2.WINDOW_NORMAL)
            elif key == 27: # ESC
                cv2.setMouseCallback(self.window_name, lambda *args: None)
                return False

    def run_smart_menu(self):
        logger.info("\n╔══════════════════════════════════════╗")
        logger.info("║   WATCHR PRECISION ZONE CALIBRATOR   ║")
        logger.info("╚══════════════════════════════════════╝\n")
        
        if not hasattr(self, 'cam_manager'):
            num_cams = input("[CONFIG] Number of cameras (1-4, default=1): ").strip()
            num_cams = int(num_cams) if num_cams.isdigit() else 1
            
            sources = []
            for i in range(num_cams):
                src = input(f"Camera {i+1} URL (blank=Webcam): ").strip()
                sources.append(src)
                
            self.cam_manager = MultiCameraManager(sources)
            
        cv2.namedWindow(self.window_name)
        
        while True:
            ret, frame = self.cam_manager.get_panorama()
            if not ret:
                break
            
            display = frame.copy()
            self._draw_zones(display)
            
            if self.show_menu:
                # Semi-transparent menu panel
                panel = display.copy()
                cv2.rectangle(panel, (15, 15), (420, 420), (15, 15, 15), -1)
                display = cv2.addWeighted(panel, 0.8, display, 0.2, 0)
                # Re-blend the rest
                mask = np.zeros_like(display)
                cv2.rectangle(mask, (15, 15), (420, 420), (255, 255, 255), -1)
                display = np.where(mask > 0, display, frame)
                self._draw_zones(display)
                
                cv2.rectangle(display, (15, 15), (420, 420), (0, 255, 255), 1)
                cv2.putText(display, "PRECISION CALIBRATOR", (35, 50), cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0, 255, 255), 2)
                
                items = [
                    ("[B] Billing Counter", 100),
                    ("[1] Shelf 1", 140),
                    ("[2] Shelf 2", 180),
                    ("[3] Shelf 3", 220),
                    ("[E] Exit Door", 260),
                    ("[H] Hide UI / [F] Fullscreen", 300),
                    ("[S] Save & Launch", 350),
                ]
                for txt, y in items:
                    color = (0, 255, 0) if txt.startswith("[S]") else (230, 230, 230)
                    cv2.putText(display, txt, (35, y), cv2.FONT_HERSHEY_SIMPLEX, 0.6, color, 2)
                
                mapped = ", ".join(self.computed_zones.keys()) if self.computed_zones else "None"
                cv2.putText(display, f"Zones: {mapped}", (35, 400), cv2.FONT_HERSHEY_SIMPLEX, 0.4, (150, 150, 150), 1)
            else:
                cv2.putText(display, "[H] Show Calibrator UI  [F] Fullscreen", (20, 30), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 255, 255), 2)

            cv2.imshow(self.window_name, display)
            key = cv2.waitKey(1) & 0xFF
            
            if key == ord('b') or key == ord('B'): self.calibrate_zone("billing")
            elif key == ord('1'): self.calibrate_zone("shelf_1")
            elif key == ord('2'): self.calibrate_zone("shelf_2")
            elif key == ord('3'): self.calibrate_zone("shelf_3")
            elif key == ord('e') or key == ord('E'): self.calibrate_zone("exit")
            elif key == ord('h') or key == ord('H'): self.show_menu = not self.show_menu
            elif key == ord('f') or key == ord('F'):
                self.fullscreen = not self.fullscreen
                if self.fullscreen:
                    cv2.setWindowProperty(self.window_name, cv2.WND_PROP_FULLSCREEN, cv2.WINDOW_FULLSCREEN)
                else:
                    cv2.setWindowProperty(self.window_name, cv2.WND_PROP_FULLSCREEN, cv2.WINDOW_NORMAL)
            elif key == ord('s') or key == ord('S') or key == 27:
                break
                
        # Don't release cam_manager here — let main.py reuse the live connection
        # to avoid FFmpeg stream assertion crashes on DroidCam reconnect.
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
