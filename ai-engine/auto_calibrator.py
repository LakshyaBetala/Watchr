import cv2
import numpy as np
import json
import logging
from detection import PersonDetector

logging.basicConfig(level=logging.INFO, format='%(message)s')
logger = logging.getLogger(__name__)

class SequencedCalibrator:
    def __init__(self):
        """
        Phase 12: Supreme Guided Calibration UX.
        Guides the user through setting up the Billing, Shelf, and Exit zones
        one by one via an on-screen visual interface.
        """
        self.detector = PersonDetector()
        self.computed_zones = {}

    def calibrate_step(self, cap, zone_name, instruction, frames_to_watch=200):
        # --- Pre-Calibration Warning UI ---
        logger.info(f"--- PREPARING: {zone_name.upper()} ---")
        prep_frames = 150 # 5 seconds of warning at ~30 FPS
        
        for i in range(prep_frames):
            ret, frame = cap.read()
            if not ret or frame is None:
                return False
                
            display = frame.copy()
            # Draw Red Warning Banner
            cv2.rectangle(display, (0, 0), (640, 120), (0, 0, 150), -1) 
            cv2.putText(display, f"PREPARE: {zone_name.upper()} ZONE", (20, 50), 
                        cv2.FONT_HERSHEY_SIMPLEX, 1.2, (255, 255, 255), 3)
                        
            seconds_left = max(1, 5 - int((i / 30)))
            cv2.putText(display, f"{instruction} in {seconds_left}s...", (20, 100), 
                        cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0, 255, 255), 2)
                        
            cv2.imshow("Supreme Guided Calibrator", display)
            if cv2.waitKey(1) & 0xFF == 27:
                return False
                
        # --- Actual Calibration Phase ---
        logger.info(f"--- STARTING DATA STREAM: {zone_name.upper()} ---")
        frame_count = 0
        feet_heatmap = None
        
        while frame_count < frames_to_watch:
            ret, frame = cap.read()
            if not ret or frame is None:
                break

            if feet_heatmap is None:
                feet_heatmap = np.zeros(frame.shape[:2], dtype=np.float32)

            detect_output = self.detector.detect(frame)
            display = frame.copy()
            
            # --- Guided UI Overlay ---
            progress = int((frame_count / frames_to_watch) * 100)
            cv2.rectangle(display, (0, 0), (640, 90), (20, 20, 20), -1)
            cv2.putText(display, f"STEP: {instruction}", (20, 35), 
                        cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0, 255, 255), 2)
            cv2.putText(display, f"Training [{zone_name.upper()}] ... {progress}%", (20, 70), 
                        cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 0), 2)

            # Map Feet Anchor
            for bbox in detect_output["detections"]:
                x1, y1, x2, y2 = map(int, bbox[:4])
                cx = (x1 + x2) // 2
                cv2.circle(feet_heatmap, (cx, y2), radius=35, color=(1.0), thickness=-1)
                cv2.circle(display, (cx, y2), 8, (0, 0, 255), -1)

            # Draw Realtime Heatmap
            heat_norm = cv2.normalize(feet_heatmap, None, 0, 255, cv2.NORM_MINMAX, dtype=cv2.CV_8U)
            heat_color = cv2.applyColorMap(heat_norm, cv2.COLORMAP_JET)
            mask = heat_norm > 15
            
            # Blend
            combined = display.copy()
            combined[mask] = cv2.addWeighted(display[mask], 0.3, heat_color[mask], 0.7, 0)
            
            cv2.imshow("Supreme Guided Calibrator", combined)
            if cv2.waitKey(1) & 0xFF == 27:
                break
                
            frame_count += 1
            
        # Extract highest density anchor for the specific zone
        if feet_heatmap is not None:
            heat_norm = cv2.normalize(feet_heatmap, None, 0, 255, cv2.NORM_MINMAX, dtype=cv2.CV_8U)
            _, thresh = cv2.threshold(heat_norm, 100, 255, cv2.THRESH_BINARY)
            contours, _ = cv2.findContours(thresh, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
            contours = list(contours)
            
            if len(contours) > 0:
                contours = sorted(contours, key=cv2.contourArea, reverse=True)
                x, y, w, h = cv2.boundingRect(contours[0])
                # Inflate rectangle to match body width/height
                self.computed_zones[zone_name] = [(max(0, x-50), max(0, y-180)), (x+w+50, y+h+40)]
                logger.info(f"✅ Extracted Geometry for {zone_name.upper()}.")
                
                # --- Success Interstitial UI ---
                for _ in range(40):
                    ret, frame = cap.read()
                    success_ui = frame.copy()
                    cv2.rectangle(success_ui, (0, 0), (640, 100), (0, 180, 0), -1)
                    cv2.putText(success_ui, f"✅ {zone_name.upper()} ZONE SECURED!", (30, 60), 
                                cv2.FONT_HERSHEY_SIMPLEX, 1.2, (255, 255, 255), 3)
                    cv2.imshow("Supreme Guided Calibrator", success_ui)
                    cv2.waitKey(1)
            else:
                logger.error(f"❌ Failed to find movement for {zone_name.upper()}.")

    def run_full_calibration(self):
        cap = cv2.VideoCapture(0)
        
        # Sequenced Guided Loop
        self.calibrate_step(cap, "billing", "Walk to the CHECKOUT COUNTER", frames_to_watch=200)
        self.calibrate_step(cap, "shelf", "Walk to the PRODUCT SHELF", frames_to_watch=200)
        self.calibrate_step(cap, "exit", "Walk to the DOOR / EXIT", frames_to_watch=150)
        
        cap.release()
        cv2.destroyAllWindows()
        
        # Save output JSON for override
        with open("auto_zones.json", "w") as f:
            json.dump(self.computed_zones, f, indent=4)
        logger.info("\n🏁 SUPREME CALIBRATION COMPLETE. Floor Map locked to [auto_zones.json].")

if __name__ == "__main__":
    ai = SequencedCalibrator()
    ai.run_full_calibration()
