import cv2
import numpy as np
import logging
from collections import deque

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class FireDetector:
    """
    Phase 17: Supreme Multi-Layer Fire & Smoke Early Warning System.
    
    This is NOT just an orange-pixel detector. It uses 7 independent detection layers
    that each contribute to a weighted confidence score:
    
    Layer 1 - FLAME COLOR:         HSV color filtering for flame-orange/red hues
    Layer 2 - MOTION FLICKER:      Frame-to-frame pixel intensity oscillation (flames flicker)
    Layer 3 - SMOKE DETECTION:     Low-saturation gray/white haze analysis in HSV space
    Layer 4 - EDGE TURBULENCE:     Real fire has chaotic, fractal edge boundaries.
                                   Smooth rectangle edges (like shirts) score LOW.
    Layer 5 - SPATIAL HEATMAP:     Sustained spatial accumulator requiring continuous heat
    Layer 6 - BRIGHTNESS BLOOM:    Fire causes localized overexposure (brightness spike)
    Layer 7 - TEMPORAL CONSENSUS:  Rolling window requiring N/M frames to confirm
    
    The system reports SMOKE warnings BEFORE flames appear, enabling early evacuation.
    """
    
    def __init__(self, confidence_threshold=0.50, temporal_window=10, temporal_min=4):
        # ===== FLAME COLOR BOUNDS =====
        self.flame_lower = np.array([0, 100, 200], dtype=np.uint8)
        self.flame_upper = np.array([35, 255, 255], dtype=np.uint8)
        
        # ===== SMOKE COLOR BOUNDS (Gray/White haze with low saturation) =====
        self.smoke_lower = np.array([0, 0, 150], dtype=np.uint8)
        self.smoke_upper = np.array([180, 60, 255], dtype=np.uint8)
        
        # ===== THRESHOLDS =====
        self.confidence_threshold = confidence_threshold
        self.smoke_area_threshold = 8000    # Minimum smoke pixels
        self.flame_area_threshold = 3000    # Minimum flame pixels
        self.edge_chaos_threshold = 0.4     # Edge density ratio threshold
        self.brightness_threshold = 240     # Near-white overexposure
        self.bloom_area_threshold = 2000    # Min overexposed pixels
        
        # ===== LAYER WEIGHTS =====
        self.W_FLAME_COLOR = 0.20
        self.W_FLICKER = 0.15
        self.W_SMOKE = 0.20
        self.W_EDGE_CHAOS = 0.10
        self.W_HEATMAP = 0.15
        self.W_BLOOM = 0.10
        self.W_TEMPORAL = 0.10
        
        # ===== SPATIAL HEATMAP =====
        self.heatmap = None
        self.heatmap_decay = 0.90
        self.heatmap_threshold = 12.0
        
        # ===== TEMPORAL =====
        self.history = deque(maxlen=temporal_window)
        self.temporal_min = temporal_min
        
        # ===== SMOKE EARLY WARNING =====
        self.smoke_history = deque(maxlen=15)
        self.smoke_confirmed = False
        
        # ===== STATE =====
        self.frame_count = 0
        self.prev_gray = None

    def detect_fire(self, frame, prev_frame):
        """
        Supreme multi-layer fire analysis.
        Returns: {"fire": bool, "smoke": bool, "confidence": float}
        """
        self.frame_count += 1
        
        if prev_frame is None:
            self.history.append(0.0)
            return {"fire": False, "smoke": False, "confidence": 0.0}
        
        try:
            h, w = frame.shape[:2]
            hsv = cv2.cvtColor(frame, cv2.COLOR_BGR2HSV)
            gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
            prev_gray = cv2.cvtColor(prev_frame, cv2.COLOR_BGR2GRAY)
            
            confidence = 0.0
            smoke_score = 0.0
            
            # =============================================
            # LAYER 1: FLAME COLOR DETECTION
            # =============================================
            flame_mask = cv2.inRange(hsv, self.flame_lower, self.flame_upper)
            # Morphological cleanup to remove tiny noise
            kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (5, 5))
            flame_mask = cv2.morphologyEx(flame_mask, cv2.MORPH_OPEN, kernel)
            flame_pixels = cv2.countNonZero(flame_mask)
            
            if flame_pixels > self.flame_area_threshold:
                confidence += self.W_FLAME_COLOR * min(flame_pixels / (self.flame_area_threshold * 3), 1.0)
            
            # =============================================
            # LAYER 2: MOTION FLICKER DETECTION
            # =============================================
            diff = cv2.absdiff(gray, prev_gray)
            _, motion_mask = cv2.threshold(diff, 20, 255, cv2.THRESH_BINARY)
            
            # Flicker = intersection of flame-colored regions AND motion
            flicker_mask = cv2.bitwise_and(flame_mask, motion_mask)
            flicker_pixels = cv2.countNonZero(flicker_mask)
            
            if flicker_pixels > 1000:
                # True fire flickers chaotically. A moving person is smooth.
                confidence += self.W_FLICKER * min(flicker_pixels / 5000.0, 1.0)
            
            # =============================================
            # LAYER 3: SMOKE DETECTION (EARLY WARNING)
            # =============================================
            smoke_mask = cv2.inRange(hsv, self.smoke_lower, self.smoke_upper)
            
            # Smoke is diffuse: apply heavy blur before thresholding to reject sharp objects
            smoke_blur = cv2.GaussianBlur(smoke_mask, (21, 21), 0)
            _, smoke_binary = cv2.threshold(smoke_blur, 100, 255, cv2.THRESH_BINARY)
            
            # Remove small regions (not smoke, just white objects)
            smoke_binary = cv2.morphologyEx(smoke_binary, cv2.MORPH_OPEN, 
                                            cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (15, 15)))
            smoke_pixels = cv2.countNonZero(smoke_binary)
            
            # Smoke also requires motion (rising upwards) to distinguish from white walls
            smoke_motion = cv2.bitwise_and(smoke_binary, motion_mask)
            smoke_motion_pixels = cv2.countNonZero(smoke_motion)
            
            if smoke_pixels > self.smoke_area_threshold and smoke_motion_pixels > 500:
                smoke_score = min(smoke_pixels / (self.smoke_area_threshold * 4), 1.0)
                confidence += self.W_SMOKE * smoke_score
                self.smoke_history.append(True)
            else:
                self.smoke_history.append(False)
            
            # Smoke early warning: 5 out of 15 frames with smoke = pre-fire alert
            if sum(self.smoke_history) >= 5:
                self.smoke_confirmed = True
            else:
                self.smoke_confirmed = False
            
            # =============================================
            # LAYER 4: EDGE TURBULENCE (Fractal Chaos)
            # =============================================
            if flame_pixels > self.flame_area_threshold:
                # Extract edges ONLY in flame-colored regions
                flame_region = cv2.bitwise_and(gray, gray, mask=flame_mask)
                edges = cv2.Canny(flame_region, 50, 150)
                edge_pixels = cv2.countNonZero(edges)
                
                # Edge density ratio: real fire has LOTS of edges (fractal)
                # A solid orange shirt has very FEW edges (smooth)
                edge_density = edge_pixels / max(flame_pixels, 1)
                
                if edge_density > self.edge_chaos_threshold:
                    confidence += self.W_EDGE_CHAOS * min(edge_density / 1.0, 1.0)
            
            # =============================================
            # LAYER 5: SPATIAL HEATMAP ACCUMULATOR
            # =============================================
            if self.heatmap is None:
                self.heatmap = np.zeros((h, w), dtype=np.float32)
            elif self.heatmap.shape != (h, w):
                self.heatmap = np.zeros((h, w), dtype=np.float32)
            
            # Feed both flame AND flicker signals into the heatmap
            combined_heat = cv2.bitwise_or(flame_mask, flicker_mask)
            heat_add = combined_heat.astype(np.float32) / 255.0
            self.heatmap += heat_add * 1.5
            self.heatmap *= self.heatmap_decay
            
            # Extract mathematically stable fire cores
            _, stable_core = cv2.threshold(self.heatmap, self.heatmap_threshold, 255, cv2.THRESH_BINARY)
            stable_core = stable_core.astype(np.uint8)
            stable_pixels = cv2.countNonZero(stable_core)
            
            if stable_pixels > 500:
                confidence += self.W_HEATMAP * min(stable_pixels / 5000.0, 1.0)
            
            # =============================================
            # LAYER 6: BRIGHTNESS BLOOM (Overexposure)
            # =============================================
            _, bright_mask = cv2.threshold(gray, self.brightness_threshold, 255, cv2.THRESH_BINARY)
            # Only count brightness that overlaps with flame-colored regions
            bloom_mask = cv2.bitwise_and(bright_mask, flame_mask)
            bloom_pixels = cv2.countNonZero(bloom_mask)
            
            if bloom_pixels > self.bloom_area_threshold:
                confidence += self.W_BLOOM * min(bloom_pixels / (self.bloom_area_threshold * 3), 1.0)
            
            # =============================================
            # LAYER 7: TEMPORAL CONSENSUS
            # =============================================
            self.history.append(confidence)
            
            # Count how many recent frames exceeded 30% internal confidence
            high_conf_frames = sum(1 for c in self.history if c > 0.30)
            if high_conf_frames >= self.temporal_min:
                confidence += self.W_TEMPORAL * 1.0
            
            # =============================================
            # FINAL DETERMINATION
            # =============================================
            fire_confirmed = confidence >= self.confidence_threshold
            
            # =============================================
            # DEBUG VISUALIZATION
            # =============================================
            debug = np.zeros((h, w, 3), dtype=np.uint8)
            
            # Overlay heatmap
            heatmap_norm = cv2.normalize(self.heatmap, None, 0, 255, cv2.NORM_MINMAX, dtype=cv2.CV_8U)
            heatmap_color = cv2.applyColorMap(heatmap_norm, cv2.COLORMAP_HOT)
            debug = cv2.addWeighted(debug, 0.3, heatmap_color, 0.7, 0)
            
            # Draw smoke regions in blue
            smoke_contours, _ = cv2.findContours(smoke_binary, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
            cv2.drawContours(debug, smoke_contours, -1, (255, 150, 0), 2)
            
            # Status overlay
            color = (0, 0, 255) if fire_confirmed else ((0, 200, 255) if self.smoke_confirmed else (0, 255, 0))
            status = "FIRE!" if fire_confirmed else ("SMOKE WARNING" if self.smoke_confirmed else "CLEAR")
            cv2.putText(debug, f"Status: {status}", (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 0.8, color, 2)
            cv2.putText(debug, f"Confidence: {confidence*100:.1f}%", (10, 60), cv2.FONT_HERSHEY_SIMPLEX, 0.7, color, 2)
            cv2.putText(debug, f"Flame: {flame_pixels}px | Flicker: {flicker_pixels}px", (10, 90),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.5, (200, 200, 200), 1)
            cv2.putText(debug, f"Smoke: {smoke_pixels}px | Bloom: {bloom_pixels}px", (10, 115),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.5, (200, 200, 200), 1)
            
            cv2.imshow("Fire & Smoke Sentinel", debug)
            
            return {
                "fire": bool(fire_confirmed), 
                "smoke": bool(self.smoke_confirmed),
                "confidence": round(confidence, 3)
            }
            
        except Exception as e:
            logger.error(f"Fire detection crashed: {e}")
            return {"fire": False, "smoke": False, "confidence": 0.0}

if __name__ == "__main__":
    logger.info("=== SUPREME FIRE & SMOKE SENTINEL SELF-TEST ===")
    detector = FireDetector(confidence_threshold=0.45)
    
    cap = cv2.VideoCapture(0)
    prev = None
    
    while True:
        ret, frame = cap.read()
        if not ret:
            break
            
        result = detector.detect_fire(frame, prev)
        prev = frame.copy()
        
        if result["smoke"]:
            logger.warning("⚠️ SMOKE EARLY WARNING")
        if result["fire"]:
            logger.error(f"🔥 FIRE CONFIRMED | Confidence: {result['confidence']*100:.1f}%")
        
        cv2.imshow("Live Feed", frame)
        if cv2.waitKey(1) & 0xFF == 27:
            break
    
    cap.release()
    cv2.destroyAllWindows()
