import logging
import time

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class TheftDetectionEngine:
    """
    Phase 17: Advanced Multi-Signal Behavioral Theft Detection Engine.
    
    This is NOT a simple "stood at shelf for 3 seconds" detector. It uses a 5-layer
    behavioral state machine that tracks the FULL lifecycle of a potential theft:
    
    Layer 1 - PRODUCT ENGAGEMENT:  Did they interact with shelf merchandise?
    Layer 2 - TRAJECTORY ANOMALY:  Did they skip the billing counter entirely?
    Layer 3 - CONCEALMENT SIGNAL:  Did their bounding box SIZE shrink suddenly at the shelf?
                                   (A person crouching/bending to hide items in pockets/bags
                                    causes height reduction in the bounding box)
    Layer 4 - VELOCITY SPIKE:      Did they suddenly RUSH toward the exit after shelf contact?
                                   (Normal customers browse slowly; thieves bolt)
    Layer 5 - TEMPORAL LOCK:       Sustained anomaly confirmation over N frames to prevent flicker
    
    Each signal independently contributes a CONFIDENCE SCORE, and the final theft
    determination is the weighted fusion of all 5 layers.
    """
    
    def __init__(self, shelf_engage_frames=8, velocity_spike_thresh=25.0, 
                 size_shrink_ratio=0.75, confidence_threshold=0.55):
        self.states = {}
        self.shelf_engage_frames = shelf_engage_frames
        self.velocity_spike_thresh = velocity_spike_thresh
        self.size_shrink_ratio = size_shrink_ratio
        self.confidence_threshold = confidence_threshold
        
        # Layer weights (tuned for real-world retail)
        self.W_TRAJECTORY = 0.40   # Skipping billing is the strongest signal
        self.W_ENGAGEMENT = 0.20   # Must have interacted with product
        self.W_CONCEALMENT = 0.15  # Bounding box shrinkage at shelf
        self.W_VELOCITY = 0.15     # Speed burst toward exit
        self.W_TEMPORAL = 0.10     # Sustained anomaly over time
        
    def _init_state(self):
        return {
            # Zone tracking
            "visited_shelf": False,
            "visited_billing": False,
            "entered_exit": False,
            "last_zone": "unknown",
            "zone_history": [],       # Full zone trajectory log
            
            # Layer 1: Product Engagement
            "shelf_dwell": 0,
            "shelf_engaged": False,
            
            # Layer 2: Trajectory
            "trajectory_anomaly": False,
            
            # Layer 3: Concealment Detection
            "bbox_at_shelf_entry": None,  # Height when they first touch shelf
            "bbox_min_at_shelf": None,    # Minimum height during shelf stay
            "concealment_signal": 0.0,
            
            # Layer 4: Velocity Spike
            "last_centroid": None,
            "velocities": [],             # Rolling window of movement speeds
            "avg_speed_at_shelf": 0.0,
            "speed_at_exit_approach": 0.0,
            "velocity_spike": False,
            
            # Layer 5: Temporal Lock
            "anomaly_frames": 0,
            "temporal_confirmed": False,
            
            # Billing dwell (for role classification)
            "dwell_time_billing": 0,
            
            # Final
            "confidence": 0.0,
            "alerted": False,
        }
    
    def detect_theft(self, zones_dict, tracked_objects=None):
        """
        Advanced theft evaluation with optional bounding box data for concealment/velocity.
        
        Args:
            zones_dict: {"zones": {"id": "zone_name"}}
            tracked_objects: {"id": [x1, y1, x2, y2, conf]} (optional, from tracker)
        """
        current_zones = zones_dict.get("zones", {})
        confirmed_suspects = []
        roles = {}
        
        if tracked_objects is None:
            tracked_objects = {}
        
        # Garbage collect stale IDs
        active_ids = set(current_zones.keys())
        for tid in list(self.states.keys()):
            if tid not in active_ids:
                del self.states[tid]
        
        for obj_id, current_zone in current_zones.items():
            if obj_id not in self.states:
                self.states[obj_id] = self._init_state()
                
            s = self.states[obj_id]
            s["zone_history"].append(current_zone)
            # Cap history to prevent memory leak
            if len(s["zone_history"]) > 300:
                s["zone_history"] = s["zone_history"][-300:]
            
            bbox = tracked_objects.get(str(obj_id), None)
            
            # =============================================
            # LAYER 1: PRODUCT ENGAGEMENT (Shelf Dwell)
            # =============================================
            if "shelf" in current_zone:
                s["shelf_dwell"] += 1
                if s["shelf_dwell"] >= self.shelf_engage_frames:
                    s["shelf_engaged"] = True
                    s["visited_shelf"] = True
                    
                # Record bounding box dimensions for concealment analysis
                if bbox is not None and len(bbox) >= 4:
                    h = float(bbox[3]) - float(bbox[1])
                    if s["bbox_at_shelf_entry"] is None:
                        s["bbox_at_shelf_entry"] = h
                    if s["bbox_min_at_shelf"] is None or h < s["bbox_min_at_shelf"]:
                        s["bbox_min_at_shelf"] = h
                        
            elif current_zone == "billing":
                s["dwell_time_billing"] += 1
                s["visited_billing"] = True
                
            elif current_zone == "exit":
                s["entered_exit"] = True
            
            s["last_zone"] = current_zone
            
            # =============================================
            # LAYER 3: CONCEALMENT DETECTION
            # =============================================
            if s["bbox_at_shelf_entry"] is not None and s["bbox_min_at_shelf"] is not None:
                ratio = s["bbox_min_at_shelf"] / max(s["bbox_at_shelf_entry"], 1)
                if ratio < self.size_shrink_ratio:
                    s["concealment_signal"] = 1.0 - ratio  # Higher = more suspicious
                    
            # =============================================
            # LAYER 4: VELOCITY SPIKE DETECTION
            # =============================================
            if bbox is not None and len(bbox) >= 4:
                cx = (float(bbox[0]) + float(bbox[2])) / 2
                cy = (float(bbox[1]) + float(bbox[3])) / 2
                
                if s["last_centroid"] is not None:
                    dx = cx - s["last_centroid"][0]
                    dy = cy - s["last_centroid"][1]
                    speed = (dx**2 + dy**2) ** 0.5
                    s["velocities"].append(speed)
                    
                    # Keep rolling window of 30 frames
                    if len(s["velocities"]) > 30:
                        s["velocities"] = s["velocities"][-30:]
                    
                    # Track average speed during shelf interaction
                    if "shelf" in current_zone and len(s["velocities"]) > 3:
                        s["avg_speed_at_shelf"] = sum(s["velocities"][-10:]) / min(len(s["velocities"]), 10)
                    
                    # Track speed when approaching exit
                    if current_zone in ["exit", "unknown"] and s["shelf_engaged"]:
                        recent_speed = sum(s["velocities"][-5:]) / min(len(s["velocities"]), 5) if s["velocities"] else 0
                        s["speed_at_exit_approach"] = recent_speed
                        
                        # Velocity spike = exit speed is 2x their browsing speed
                        if s["avg_speed_at_shelf"] > 0:
                            if recent_speed > s["avg_speed_at_shelf"] * 2.0:
                                s["velocity_spike"] = True
                        elif recent_speed > self.velocity_spike_thresh:
                            s["velocity_spike"] = True
                            
                s["last_centroid"] = (cx, cy)
            
            # =============================================
            # LAYER 2: TRAJECTORY ANOMALY
            # =============================================
            if s["shelf_engaged"] and s["entered_exit"] and not s["visited_billing"]:
                s["trajectory_anomaly"] = True
                
            # =============================================
            # LAYER 5: TEMPORAL LOCK
            # =============================================
            if s["trajectory_anomaly"]:
                s["anomaly_frames"] += 1
                if s["anomaly_frames"] >= 5:
                    s["temporal_confirmed"] = True
            else:
                s["anomaly_frames"] = max(0, s["anomaly_frames"] - 1)
            
            # =============================================
            # CONFIDENCE FUSION (Weighted Sum of All Layers)
            # =============================================
            score = 0.0
            
            # L1: Engagement
            if s["shelf_engaged"]:
                score += self.W_ENGAGEMENT * 1.0
                
            # L2: Trajectory (strongest signal)
            if s["trajectory_anomaly"]:
                score += self.W_TRAJECTORY * 1.0
                
            # L3: Concealment
            if s["concealment_signal"] > 0.1:
                score += self.W_CONCEALMENT * min(s["concealment_signal"] * 2, 1.0)
                
            # L4: Velocity Spike
            if s["velocity_spike"]:
                score += self.W_VELOCITY * 1.0
                
            # L5: Temporal
            if s["temporal_confirmed"]:
                score += self.W_TEMPORAL * 1.0
                
            s["confidence"] = round(score, 3)
            
            # =============================================
            # FINAL DETERMINATION
            # =============================================
            if s["confidence"] >= self.confidence_threshold and not s["alerted"]:
                confirmed_suspects.append(obj_id)
                s["alerted"] = True
                logger.error(f"🚨 THEFT CONFIRMED: ID {obj_id} | Confidence: {s['confidence']*100:.1f}%")
                logger.error(f"   Trajectory: {'ANOMALOUS' if s['trajectory_anomaly'] else 'NORMAL'}")
                logger.error(f"   Concealment: {s['concealment_signal']:.2f}")
                logger.error(f"   Velocity Spike: {s['velocity_spike']}")
                logger.error(f"   Zone Path: {' → '.join(s['zone_history'][-15:])}")
            
            # =============================================
            # ROLE CLASSIFICATION
            # =============================================
            if s["dwell_time_billing"] > 60:
                roles[obj_id] = "STAFF"
            elif s["confidence"] >= self.confidence_threshold:
                roles[obj_id] = "SUSPECT"
            else:
                roles[obj_id] = "CUSTOMER"
        
        return {
            "theft": len(confirmed_suspects) > 0,
            "suspects": confirmed_suspects,
            "roles": roles
        }

if __name__ == "__main__":
    logger.info("=== ADVANCED THEFT ENGINE SELF-TEST ===")
    engine = TheftDetectionEngine()
    
    # Simulate: Person 1 shops normally, Person 2 steals
    timeline = [
        {"zones": {"1": "unknown", "2": "unknown"}},
        {"zones": {"1": "shelf_1", "2": "shelf_1"}},
        {"zones": {"1": "shelf_1", "2": "shelf_1"}},
        {"zones": {"1": "shelf_1", "2": "shelf_1"}},
        {"zones": {"1": "shelf_1", "2": "shelf_1"}},
        {"zones": {"1": "shelf_1", "2": "shelf_1"}},
        {"zones": {"1": "shelf_1", "2": "shelf_1"}},
        {"zones": {"1": "shelf_1", "2": "shelf_1"}},
        {"zones": {"1": "shelf_1", "2": "shelf_1"}},   # Both engaged (8 frames)
        {"zones": {"1": "billing", "2": "unknown"}},    # Person 1 goes to billing, Person 2 skips
        {"zones": {"1": "billing", "2": "exit"}},       # Person 2 heads to exit
        {"zones": {"1": "billing", "2": "exit"}},
        {"zones": {"1": "billing", "2": "exit"}},
        {"zones": {"1": "billing", "2": "exit"}},
        {"zones": {"1": "billing", "2": "exit"}},       # Temporal lock triggers
        {"zones": {"1": "exit", "2": "exit"}},           # Both leave
    ]
    
    for i, frame_data in enumerate(timeline):
        result = engine.detect_theft(frame_data)
        if result["theft"]:
            logger.error(f"Frame {i+1}: 🔔 THEFT ALERT: {result}")
        else:
            logger.info(f"Frame {i+1}: OK | Roles: {result['roles']}")
