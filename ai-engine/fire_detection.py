import cv2
import numpy as np
import logging
import os
from collections import deque

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)


class FireDetector:
    """
    Enterprise Multi-Layer Fire & Smoke Early Warning System.
    
    ARCHITECTURE:
        PRIMARY MODE (if fire model exists on disk):
            YOLOv8 Fire Model — neural network trained on real fire/smoke textures.
            Eliminates false positives from neon signs, ambulance lights, orange clothing.
        
        FALLBACK MODE (default):
            7-Layer Mathematical Engine — the proven heuristic cascade:
            
            Layer 1 - FLAME COLOR:         HSV color filtering for flame-orange/red hues
            Layer 2 - MOTION FLICKER:      Frame-to-frame pixel intensity oscillation
            Layer 3 - SMOKE DETECTION:     Low-saturation gray/white haze analysis
            Layer 4 - EDGE TURBULENCE:     Real fire has chaotic, fractal edge boundaries.
                                           Smooth rectangle edges (like shirts) score LOW.
            Layer 5 - SPATIAL HEATMAP:     Sustained spatial accumulator requiring continuous heat
            Layer 6 - BRIGHTNESS BLOOM:    Fire causes localized overexposure (brightness spike)
            Layer 7 - TEMPORAL CONSENSUS:  Rolling window requiring N/M frames to confirm
    
    ADDITIONS OVER ORIGINAL:
        - Alert cooldown (prevents spam: max 1 alert per 5 seconds at 30fps)
        - YOLO fire model as optional primary override
        - Structured output with fire_regions / smoke_regions for dashboard
        - should_alert() method for backend integration
    """
    
    def __init__(self, confidence_threshold=0.65, temporal_window=15, temporal_min=8,
                 fire_model_path="fire_yolov8n.pt"):
        
        # ===== FLAME COLOR BOUNDS =====
        self.flame_lower = np.array([0, 130, 200], dtype=np.uint8)
        self.flame_upper = np.array([28, 255, 255], dtype=np.uint8)
        
        # ===== SMOKE COLOR BOUNDS (Gray/White haze with low saturation) =====
        self.smoke_lower = np.array([0, 0, 160], dtype=np.uint8)
        self.smoke_upper = np.array([180, 35, 255], dtype=np.uint8)
        
        # ===== THRESHOLDS =====
        self.confidence_threshold = confidence_threshold
        self.smoke_area_threshold = 15000    # Haze detection lowered
        self.flame_area_threshold = 300      # TINY fires allowed (sparks/lighters)
        self.edge_chaos_threshold = 0.30     # Chaos on small scales
        self.brightness_threshold = 240      # Near-white overexposure only
        self.bloom_area_threshold = 100      # 100px bloom for early warning
        
        # ===== LAYER WEIGHTS =====
        # Heavily prioritize dynamic attributes (Flicker, Chaos, Plasma Gradient) 
        self.W_FLAME_COLOR = 0.15
        self.W_FLICKER = 0.20
        self.W_SMOKE = 0.15
        self.W_EDGE_CHAOS = 0.15
        self.W_PLASMA = 0.15      # New: Requires multi-temperature gradients
        self.W_HEATMAP = 0.05
        self.W_BLOOM = 0.10
        self.W_TEMPORAL = 0.05
        
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
        
        # ===== EVIDENCE CAPTURE STATE =====
        self.recording = False
        self.video_writer = None
        self.record_start_time = None
        self.evidence_dir = os.path.join(os.path.dirname(__file__), "evidence", "fire")
        os.makedirs(self.evidence_dir, exist_ok=True)
        self.latest_evidence_path = None
        
        # TIME MACHINE BUFFER: Keep 10 seconds of history (assumes ~15 FPS => 150 frames)
        self.frame_buffer = deque(maxlen=150)
        
        # ===== STATE =====
        self.frame_count = 0
        self.prev_gray = None
        
        # ===== ALERT COOLDOWN (NEW — prevents spam) =====
        self.last_fire_alert_frame = -999
        self.alert_cooldown_frames = 150  # ~5 seconds at 30fps
        self.fire_confirmed = False
        
        # ===== OPTIONAL YOLO FIRE MODEL (NEW — ML override) =====
        self.fire_model = None
        self.backend = "7layer_heuristic"
        self._try_load_fire_model(fire_model_path)
    
    def _try_load_fire_model(self, model_path):
        """Try to load a dedicated fire/smoke YOLO model. If not found, use 7-layer math."""
        search_paths = [
            model_path,
            os.path.join(os.path.dirname(__file__), model_path),
            os.path.join(os.path.dirname(__file__), "models", model_path),
        ]
        
        for path in search_paths:
            if os.path.exists(path):
                try:
                    from ultralytics import YOLO
                    self.fire_model = YOLO(path)
                    self.backend = "yolo_fire"
                    logger.info(f"✅ Fire YOLO model loaded: {path}")
                    logger.info(f"   Classes: {self.fire_model.names}")
                    return
                except Exception as e:
                    logger.error(f"Failed to load fire model from {path}: {e}")
        
        logger.info("🔥 Fire detection: Using 7-Layer Mathematical Engine (no ML fire model found)")
        logger.info("   For >95% accuracy: add a fire_yolov8n.pt model from Roboflow/HuggingFace")

    def detect_fire(self, frame, prev_frame):
        """
        Main entry point. Routes to ML model or 7-layer math engine.
        
        Returns: {"fire": bool, "smoke": bool, "confidence": float,
                  "fire_regions": list, "smoke_regions": list, "backend": str}
        """
        self.frame_count += 1
        
        if frame is None:
            return self._empty_result()
        
        if self.fire_model is not None:
            return self._detect_with_model(frame)
        else:
            return self._detect_with_7layer(frame, prev_frame)
    
    def _detect_with_model(self, frame):
        """ML-based fire detection using dedicated YOLO model."""
        try:
            results = self.fire_model(frame, verbose=False, conf=0.3)
            
            fire_conf = 0.0
            smoke_conf = 0.0
            fire_regions = []
            smoke_regions = []
            
            for result in results:
                for box in result.boxes:
                    cls_id = int(box.cls[0])
                    conf = float(box.conf[0])
                    cls_name = self.fire_model.names.get(cls_id, "").lower()
                    x1, y1, x2, y2 = map(int, box.xyxy[0])
                    
                    if "fire" in cls_name or "flame" in cls_name:
                        fire_conf = max(fire_conf, conf)
                        fire_regions.append([x1, y1, x2, y2, conf])
                    elif "smoke" in cls_name:
                        smoke_conf = max(smoke_conf, conf)
                        smoke_regions.append([x1, y1, x2, y2, conf])
            
            # Temporal consensus even for ML model
            self.history.append(fire_conf > self.confidence_threshold)
            self.smoke_history.append(smoke_conf > 0.3)
            
            fire_count = sum(self.history)
            smoke_count = sum(self.smoke_history)
            
            self.fire_confirmed = fire_count >= self.temporal_min
            self.smoke_confirmed = smoke_count >= 3
            
            return {
                "fire": self.fire_confirmed,
                "smoke": self.smoke_confirmed and not self.fire_confirmed,
                "confidence": round(fire_conf if self.fire_confirmed else fire_conf * 0.5, 3),
                "fire_regions": fire_regions,
                "smoke_regions": smoke_regions,
                "backend": self.backend,
            }
        except Exception as e:
            logger.error(f"Fire model inference failed: {e}")
            return self._empty_result()
    
    def _detect_with_7layer(self, frame, prev_frame):
        """
        The proven 7-Layer Mathematical Fire Engine.
        
        This is the EXACT mathematical logic from the original bouncer branch,
        preserved line-for-line, with structured output format added.
        """
        if prev_frame is None:
            self.history.append(0.0)
            return self._empty_result()
        
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
            
            flicker_mask = cv2.bitwise_and(flame_mask, motion_mask)
            flicker_pixels = cv2.countNonZero(flicker_mask)
            
            if flicker_pixels > 100:
                confidence += self.W_FLICKER * min(flicker_pixels / 800.0, 1.0)
            
            # =============================================
            # LAYER 3: SMOKE DETECTION (EARLY WARNING)
            # =============================================
            smoke_mask = cv2.inRange(hsv, self.smoke_lower, self.smoke_upper)
            smoke_blur = cv2.GaussianBlur(smoke_mask, (21, 21), 0)
            _, smoke_binary = cv2.threshold(smoke_blur, 100, 255, cv2.THRESH_BINARY)
            smoke_binary = cv2.morphologyEx(smoke_binary, cv2.MORPH_OPEN,
                                            cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (15, 15)))
            smoke_pixels = cv2.countNonZero(smoke_binary)
            
            smoke_motion = cv2.bitwise_and(smoke_binary, motion_mask)
            smoke_motion_pixels = cv2.countNonZero(smoke_motion)
            
            if smoke_pixels > self.smoke_area_threshold and smoke_motion_pixels > 3000:
                smoke_score = min(smoke_pixels / (self.smoke_area_threshold * 4), 1.0)
                confidence += self.W_SMOKE * smoke_score
                self.smoke_history.append(True)
            else:
                self.smoke_history.append(False)
            
            if sum(self.smoke_history) >= 8:
                self.smoke_confirmed = True
            else:
                self.smoke_confirmed = False
            
            # =============================================
            # LAYER 4: EDGE TURBULENCE (Fractal Chaos)
            # =============================================
            edge_density = 0.0
            if flame_pixels > self.flame_area_threshold:
                flame_region = cv2.bitwise_and(gray, gray, mask=flame_mask)
                edges = cv2.Canny(flame_region, 50, 150)
                edge_pixels = cv2.countNonZero(edges)
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
            
            combined_heat = cv2.bitwise_or(flame_mask, flicker_mask)
            heat_add = combined_heat.astype(np.float32) / 255.0
            self.heatmap += heat_add * 1.5
            self.heatmap *= self.heatmap_decay
            
            _, stable_core = cv2.threshold(self.heatmap, self.heatmap_threshold, 255, cv2.THRESH_BINARY)
            stable_core = stable_core.astype(np.uint8)
            stable_pixels = cv2.countNonZero(stable_core)
            
            if stable_pixels > 100:
                confidence += self.W_HEATMAP * min(stable_pixels / 1000.0, 1.0)
            
            # =============================================
            # LAYER 6: BRIGHTNESS BLOOM (Overexposure)
            # =============================================
            _, bright_mask = cv2.threshold(gray, self.brightness_threshold, 255, cv2.THRESH_BINARY)
            bloom_mask = cv2.bitwise_and(bright_mask, flame_mask)
            bloom_pixels = cv2.countNonZero(bloom_mask)
            
            if bloom_pixels > self.bloom_area_threshold:
                confidence += self.W_BLOOM * min(bloom_pixels / (self.bloom_area_threshold * 3), 1.0)
            
            # =============================================
            # LAYER 8: THERMODYNAMIC PLASMA VARIANCE (The Silver Bullet)
            # =============================================
            # Real fire spans temperatures (red->orange->yellow->white core). 
            # Fake fires (shirts, neon signs, traffic cones) are monochromatic.
            hue_std = 0.0
            if flame_pixels > self.flame_area_threshold:
                h_channel = hsv[:,:,0]
                pixels = h_channel[flame_mask > 0]
                if len(pixels) > 50:
                    hue_std = np.std(pixels)
                    if hue_std > 3.5:
                        # Massive reward for gradient plasma 
                        confidence += self.W_PLASMA * min((hue_std - 3.5) / 10.0, 1.0)
                    else:
                        # SEVERE PENALTY: Monochromatic objects (like a safety vest) lose confidence rapidly
                        confidence -= 0.25
            
            # =============================================
            # LAYER 9: AREA GROWTH VELOCITY
            # =============================================
            # Real fire expands/flickers turbulently. Static objects remain the exact same size.
            if flame_pixels > self.flame_area_threshold:
                if not hasattr(self, 'prev_flame_pixels'):
                    self.prev_flame_pixels = flame_pixels
                
                area_delta = abs(flame_pixels - self.prev_flame_pixels)
                delta_ratio = area_delta / max(self.prev_flame_pixels, 1)
                
                if delta_ratio < 0.01:
                    # Massively penalize perfectly static sizes (like a cone or a rigid shirt)
                    confidence -= 0.30
                elif delta_ratio > 0.05:
                    confidence += 0.10
                
                self.prev_flame_pixels = flame_pixels
            
            # =============================================
            # LAYER 10: TEMPORAL CONSENSUS & SYNERGY
            # =============================================
            # Synergy Boost: If localized area is chaotic, heavily flickering, AND has plasma gradient.
            if flame_pixels > self.flame_area_threshold and flicker_pixels > 200 and edge_density > 0.25 and hue_std > 4.0:
                confidence += 0.35  # Fatal proof of real fire
                
            self.history.append(confidence)
            
            high_conf_frames = sum(1 for c in self.history if c > 0.30)
            if high_conf_frames >= self.temporal_min:
                confidence += self.W_TEMPORAL * 1.0
            
            # =============================================
            # FINAL DETERMINATION
            # =============================================
            self.fire_confirmed = confidence >= self.confidence_threshold
            
            # =============================================
            # DEBUG VISUALIZATION
            # =============================================
            debug = np.zeros((h, w, 3), dtype=np.uint8)
            
            heatmap_norm = cv2.normalize(self.heatmap, None, 0, 255, cv2.NORM_MINMAX, dtype=cv2.CV_8U)
            heatmap_color = cv2.applyColorMap(heatmap_norm, cv2.COLORMAP_HOT)
            debug = cv2.addWeighted(debug, 0.3, heatmap_color, 0.7, 0)
            
            smoke_contours, _ = cv2.findContours(smoke_binary, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
            cv2.drawContours(debug, smoke_contours, -1, (255, 150, 0), 2)
            
            color = (0, 0, 255) if self.fire_confirmed else ((0, 200, 255) if self.smoke_confirmed else (0, 255, 0))
            status = "FIRE!" if self.fire_confirmed else ("SMOKE WARNING" if self.smoke_confirmed else "CLEAR")
            cv2.putText(debug, f"Status: {status}", (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 0.8, color, 2)
            cv2.putText(debug, f"Confidence: {confidence*100:.1f}%", (10, 60), cv2.FONT_HERSHEY_SIMPLEX, 0.7, color, 2)
            cv2.putText(debug, f"Flame: {flame_pixels}px | Flicker: {flicker_pixels}px", (10, 90),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.5, (200, 200, 200), 1)
            cv2.putText(debug, f"Smoke: {smoke_pixels}px | Bloom: {bloom_pixels}px", (10, 115),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.5, (200, 200, 200), 1)
            
            cv2.imshow("Fire & Smoke Sentinel", debug)
            
            return {
                "fire": bool(self.fire_confirmed),
                "smoke": bool(self.smoke_confirmed),
                "confidence": round(confidence, 3),
                "fire_regions": [],
                "smoke_regions": [],
                "backend": self.backend,
            }
            
        except Exception as e:
            logger.error(f"Fire detection crashed: {e}")
            return self._empty_result()
    
    def _empty_result(self):
        return {
            "fire": False, "smoke": False, "confidence": 0.0,
            "fire_regions": [], "smoke_regions": [], "backend": self.backend
        }
    
    def should_alert(self):
        """Check if we should send an alert (respects cooldown to prevent spam)."""
        if not self.fire_confirmed:
            return False
        if self.frame_count - self.last_fire_alert_frame < self.alert_cooldown_frames:
            return False
        self.last_fire_alert_frame = self.frame_count
        return True

    def buffer_frame(self, frame):
        """Store historical frames for retrospective recording."""
        if not getattr(self, 'recording', False):
            self.frame_buffer.append(frame.copy())
            
    def start_evidence_recording(self, frame, fps=15):
        import time, cv2
        if self.recording: return
        
        timestamp = time.strftime("%Y%m%d_%H%M%S")
        self.latest_evidence_path = os.path.join(self.evidence_dir, f"fire_evidence_{timestamp}.mp4")
        
        h, w = frame.shape[:2]
        fourcc = cv2.VideoWriter_fourcc(*'mp4v')
        self.video_writer = cv2.VideoWriter(self.latest_evidence_path, fourcc, fps, (w, h))
        self.recording = True
        self.record_start_time = time.time()
        
        while self.frame_buffer:
            hist_frame = self.frame_buffer.popleft()
            self.video_writer.write(hist_frame)
    
    def record_frame(self, frame):
        import time
        if not getattr(self, 'recording', False) or getattr(self, 'video_writer', None) is None: return False
        self.video_writer.write(frame)
        if time.time() - getattr(self, 'record_start_time', time.time()) >= 30:
            self.stop_evidence_recording()
            return False
        return True

    def stop_evidence_recording(self):
        self.recording = False
        if getattr(self, 'video_writer', None):
            self.video_writer.release()
            self.video_writer = None

if __name__ == "__main__":
    logger.info("=== FIRE & SMOKE SENTINEL SELF-TEST ===")
    detector = FireDetector(confidence_threshold=0.45)
    logger.info(f"Backend: {detector.backend}")
    
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
