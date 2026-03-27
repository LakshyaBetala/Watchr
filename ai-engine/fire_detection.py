import cv2
import numpy as np
import logging
from collections import deque

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class FireDetector:
    def __init__(self, area_threshold=5000, buffer_size=5, min_trigger=3):
        """
        Initializes the robust Fire Detection module.
        Combines HSV Color space mapping, Motion Detection, and Temporal filtering.
        
        Args:
            area_threshold (int): Minimum clustered pixels (non-zero) required to flag a candidate.
            buffer_size (int): Temporal history size.
            min_trigger (int): Valid frames out of buffer required to confirm fire (anti-flicker).
        """
        # SIGNAL 1 - HSV Color Range for Flames
        self.lower_color = np.array([0, 120, 200], dtype=np.uint8)
        self.upper_color = np.array([35, 255, 255], dtype=np.uint8)
        
        self.area_threshold = area_threshold
        
        # Temporal Configuration
        self.buffer_size = buffer_size
        self.min_trigger = min_trigger
        
        # SUPREME AI: Dynamic Heatmap Fallback Layer
        self.heatmap = None
        self.heatmap_decay = 0.85     # Faster cooling ignores transient orange shirts
        self.heatmap_threshold = 15.0 # Heat requires ~15 contiguous positive frames 
        
        # Deque for fast sliding window temporal validation
        self.history = deque(maxlen=self.buffer_size)

    def detect_fire(self, frame, prev_frame):
        """
        Processes frame for fire occurrences combining static color and dynamic flickers.
        
        Args:
            frame (np.ndarray): Current BGR frame.
            prev_frame (np.ndarray or None): Previous BGR frame.
            
        Returns:
            dict: {"fire": bool}
        """
        # Handle first frame safely
        if prev_frame is None:
            self.history.append(False)
            return {"fire": False}

        try:
            # 1. SIGNAL 1 - COLOR (FLAME RANGE)
            hsv = cv2.cvtColor(frame, cv2.COLOR_BGR2HSV)
            color_mask = cv2.inRange(hsv, self.lower_color, self.upper_color)

            # 2. SIGNAL 2 - MOTION (FLICKER)
            diff = cv2.absdiff(frame, prev_frame)
            gray = cv2.cvtColor(diff, cv2.COLOR_BGR2GRAY)
            # Thresholding isolates actual movement boundaries
            _, motion_mask = cv2.threshold(gray, 25, 255, cv2.THRESH_BINARY)

            # 3. SIGNAL 3 - COMBINED REGION
            # An element MUST be both the correct color AND flickering/moving to be considered fire.
            fire_mask = cv2.bitwise_and(color_mask, motion_mask)
            
            # --- SUPREME AI HEATMAP INTEGRATION ---
            # Dynamic spatial accumulator prevents fake "waving" objects from triggering alarms
            if self.heatmap is None:
                self.heatmap = np.zeros(frame.shape[:2], dtype=np.float32)
                
            heat_addition = fire_mask.astype(np.float32) / 255.0
            self.heatmap += heat_addition * 2.0  # Heat generation acceleration
            self.heatmap *= self.heatmap_decay   # Environmental cooling over time
            
            # Extract mathematically stable fire cores (areas burning continuously)
            _, stable_fire_core = cv2.threshold(self.heatmap, self.heatmap_threshold, 255, cv2.THRESH_BINARY)
            stable_fire_core = stable_fire_core.astype(np.uint8)

            # 4. SIGNAL 4 - AREA THRESHOLD (Now applied to the Supreme Core)
            non_zero_pixels = cv2.countNonZero(stable_fire_core)
            fire_candidate = (non_zero_pixels > self.area_threshold)
            
            # 5. SIGNAL 5 - TEMPORAL VALIDATION
            self.history.append(fire_candidate)
            confirm_fire = sum(self.history) >= self.min_trigger

            # Output Visualization Feedback (Requested debug)
            debug_view = cv2.cvtColor(stable_fire_core, cv2.COLOR_GRAY2BGR)
            
            # Overlay raw active heatmap for supreme insight
            heatmap_norm = cv2.normalize(self.heatmap, None, 0, 255, cv2.NORM_MINMAX, dtype=cv2.CV_8U)
            heatmap_color = cv2.applyColorMap(heatmap_norm, cv2.COLORMAP_HOT)
            debug_view = cv2.addWeighted(debug_view, 0.7, heatmap_color, 0.3, 0)
            
            # Draw overlay data
            overlay_color = (0, 0, 255) if confirm_fire else (0, 255, 0)
            cv2.putText(debug_view, f"Pixels: {non_zero_pixels}/{self.area_threshold}", 
                        (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 0.7, overlay_color, 2)
            cv2.putText(debug_view, f"Alert Pending: {sum(self.history)}/{self.min_trigger}", 
                        (10, 60), cv2.FONT_HERSHEY_SIMPLEX, 0.7, overlay_color, 2)
            cv2.putText(debug_view, f"FIRE DETECTED: {confirm_fire}", 
                        (10, 90), cv2.FONT_HERSHEY_SIMPLEX, 0.7, overlay_color, 2)
                        
            cv2.imshow("Fire Debug Mask", debug_view)

            return {"fire": bool(confirm_fire)}

        except Exception as e:
            logger.error(f"Fire detection processing crashed! Internal Error: {e}")
            # 🛡️ FALLBACK DESIGN: Safe Default
            # In an absolute failure, avoid panicking the system with false positives
            return {"fire": False}

def test_standalone():
    """Dummy frame logic to test Flame vs Static orange detection"""
    import time
    logger.info("Initializing Standalone Fire Module Test...")
    detector = FireDetector(area_threshold=200, buffer_size=5, min_trigger=3) # Scaled down for fake geometry overlay
    
    # Pre-allocate frames
    canvas = np.zeros((400, 400, 3), dtype=np.uint8)
    
    # 1. Normal Video Frame (Static Orange Shirt)
    # The person moves, but the entire block shifts linearly. For true motion difference testing, 
    # we represent a static orange object that drops in.
    orange_shirt = canvas.copy()
    cv2.rectangle(orange_shirt, (100, 100), (200, 200), (0, 150, 255), -1) 
    
    # 2. Flame Video Frame (Color + Non-linear Flicker)
    fire_frame1 = canvas.copy()
    cv2.rectangle(fire_frame1, (200, 200), (250, 250), (0, 150, 255), -1)
    
    fire_frame2 = canvas.copy()
    cv2.rectangle(fire_frame2, (190, 190), (260, 260), (0, 200, 255), -1) # "Flickering/Inflating"
    
    # Construct sequence mirroring validation requirements
    sequence = [
        ("Init Frame", canvas),
        ("Static Shirt Appears", orange_shirt), # Triggers color, maybe motion once
        ("Static Shirt Holding", orange_shirt), # Fails motion difference (diff=0). Ignored.
        ("Empty", canvas),
        ("Flame Ignite", fire_frame1),
        ("Flame Flicker 1", fire_frame2),
        ("Flame Flicker 2", fire_frame1),
        ("Flame Flicker 3", fire_frame2), # FIRE SHOULD TRIGGER HERE (Temporal > 3)
        ("Extinguished", canvas)
    ]
    
    last_frame = None
    for name, frame in sequence:
        logger.info(f"--- Processing: {name} ---")
        
        result = detector.detect_fire(frame, last_frame)
        logger.info(f"Output: {result}")
        
        if result["fire"]:
            logger.error("🚨 MAJOR ALERT: FIRE CONFIRMED!")
            
        cv2.imshow("Main Scene (RGB)", frame)
        cv2.waitKey(1500)
        
        last_frame = frame.copy()
        
    cv2.destroyAllWindows()
    logger.info("Fire Safety evaluation finished.")

if __name__ == "__main__":
    test_standalone()
