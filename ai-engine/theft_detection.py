import logging
import time
import cv2
import os
from collections import deque

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)


class TheftDetectionEngine:
    """
    Enterprise Multi-Signal Behavioral Theft Detection Engine.
    
    This engine fuses 6 independent detection layers into a weighted confidence score.
    It builds entirely on the original 5-layer heuristic engine, but natively integrates
    the 'Confidence Drop' machine-learning anomaly signal inspired by Kyberastra.
    
    Layer 1 - PRODUCT ENGAGEMENT:    Did they interact with shelf merchandise? (zone dwell)
    Layer 2 - TRAJECTORY ANOMALY:    Did they skip the billing counter entirely? (shelf→exit)
    Layer 3 - CONFIDENCE DROP:       Did YOLO's detection confidence drop sharply at the shelf?
                                     (A person bending/crouching to conceal items causes
                                      their silhouette to warp, dropping YOLO confidence)
    Layer 4 - VELOCITY SPIKE:        Did they rush toward the exit after shelf contact?
    Layer 5 - TEMPORAL LOCK:         Sustained anomaly confirmation over N frames
    Layer 6 - CONCEALMENT SIGNAL:    Bounding box height shrinkage at shelf
    
    EVIDENCE CAPTURE:
        When theft confidence exceeds threshold, the engine automatically records
        a 30-second evidence clip.
    """
    
    def __init__(self, shelf_engage_frames=8, velocity_spike_thresh=25.0, 
                 confidence_drop_threshold=0.20, size_shrink_ratio=0.75,
                 confidence_threshold=0.50, evidence_duration=30):
        self.states = {}
        self.shelf_engage_frames = shelf_engage_frames
        self.velocity_spike_thresh = velocity_spike_thresh
        self.confidence_drop_threshold = confidence_drop_threshold
        self.size_shrink_ratio = size_shrink_ratio
        self.confidence_threshold = confidence_threshold
        self.evidence_duration = evidence_duration
        
        # Layer weights (tuned for real-world retail)
        self.W_TRAJECTORY = 0.30     # Skipping billing is the strongest signal
        self.W_ENGAGEMENT = 0.15     # Must have interacted with product
        self.W_CONF_DROP = 0.20      # YOLO confidence drop (from kyberastra)
        self.W_VELOCITY = 0.15       # Speed burst toward exit
        self.W_TEMPORAL = 0.10       # Sustained anomaly over time
        self.W_CONCEALMENT = 0.10    # Bounding box shrinkage
        
        # ===== EVIDENCE CAPTURE STATE =====
        self.recording = False
        self.video_writer = None
        self.record_start_time = None
        self.evidence_dir = os.path.join(os.path.dirname(__file__), "evidence", "theft")
        os.makedirs(self.evidence_dir, exist_ok=True)
        self.latest_evidence_path = None
        
        # TIME MACHINE BUFFER: Keep 10 seconds of history (assumes ~15 FPS => 150 frames)
        self.frame_buffer = deque(maxlen=150)
        
        # ===== ALERT DEDUPLICATION =====
        self.alert_cooldown = {}
        self.ALERT_COOLDOWN_SECS = 300  # 5 minutes
        
    def buffer_frame(self, frame):
        """Silently store historical frames for retrospective recording."""
        if not self.recording:
            self.frame_buffer.append(frame.copy())

    def _init_state(self):
        return {
            # Zone tracking
            "visited_shelf": False,
            "visited_billing": False,
            "entered_exit": False,
            "last_zone": "unknown",
            "zone_history": [],
            
            # Layer 1: Product Engagement
            "shelf_dwell": 0,
            "shelf_engaged": False,
            
            # Layer 2: Trajectory
            "trajectory_anomaly": False,
            
            # Layer 3: Confidence Drop (Kyberastra integration)
            "confidence_history": deque(maxlen=30),
            "baseline_confidence": None,
            "confidence_drop_detected": False,
            "max_confidence_drop": 0.0,
            
            # Layer 4: Velocity Spike
            "last_centroid": None,
            "velocities": [],
            "avg_speed_at_shelf": 0.0,
            "speed_at_exit_approach": 0.0,
            "velocity_spike": False,
            
            # Layer 5: Temporal Lock
            "anomaly_frames": 0,
            "temporal_confirmed": False,
            
            # Layer 6: Concealment (bbox shrinkage)
            "bbox_at_shelf_entry": None,
            "bbox_min_at_shelf": None,
            "concealment_signal": 0.0,
            
            # Roles
            "dwell_time_billing": 0,
            "billed_items": False,
            "confidence": 0.0,
            "alerted": False,
            "first_seen": time.time(),
        }
    
    def detect_theft(self, zones_dict, tracked_objects=None, per_person_confidence=None, staff_overrides=None):
        """
        Engine evaluation loop.
        Arg: per_person_confidence is required for Layer 3.
        Arg: staff_overrides contains ReID/Uniform derived staff flags.
        """
        current_zones = zones_dict.get("zones", {})
        confirmed_suspects = []
        roles = {}
        suspect_details = []
        
        if tracked_objects is None:
            tracked_objects = {}
        if per_person_confidence is None:
            per_person_confidence = {}
        if staff_overrides is None:
            staff_overrides = {}
        
        active_ids = set(current_zones.keys())
        for tid in list(self.states.keys()):
            if tid not in active_ids:
                state = self.states[tid]
                if time.time() - state.get("first_seen", 0) > 120:
                    del self.states[tid]
        
        for obj_id, current_zone in current_zones.items():
            if obj_id not in self.states:
                self.states[obj_id] = self._init_state()
                
            s = self.states[obj_id]
            s["zone_history"].append(current_zone)
            if len(s["zone_history"]) > 300:
                s["zone_history"] = s["zone_history"][-300:]
            
            bbox = tracked_objects.get(str(obj_id), None)
            current_conf = per_person_confidence.get(str(obj_id), None)
            
            # =============================================
            # LAYER 1 & 6: ENGAGEMENT & CONCEALMENT
            # =============================================
            if "shelf" in current_zone:
                s["shelf_dwell"] += 1
                if s["shelf_dwell"] >= self.shelf_engage_frames:
                    s["shelf_engaged"] = True
                    s["visited_shelf"] = True
                    
                if bbox is not None and len(bbox) >= 4:
                    h = float(bbox[3]) - float(bbox[1])
                    if s["bbox_at_shelf_entry"] is None:
                        s["bbox_at_shelf_entry"] = h
                    if s["bbox_min_at_shelf"] is None or h < s["bbox_min_at_shelf"]:
                        s["bbox_min_at_shelf"] = h
                        
            elif current_zone == "billing":
                s["dwell_time_billing"] += 1
                s["visited_billing"] = True
                # If they dwell here for ~10 seconds (150 frames), they paid.
                if s["dwell_time_billing"] > 150:
                    s["billed_items"] = True
                
            elif current_zone == "exit":
                s["entered_exit"] = True
            
            s["last_zone"] = current_zone
            
            if s["bbox_at_shelf_entry"] is not None and s["bbox_min_at_shelf"] is not None:
                ratio = s["bbox_min_at_shelf"] / max(s["bbox_at_shelf_entry"], 1)
                if ratio < self.size_shrink_ratio:
                    s["concealment_signal"] = 1.0 - ratio
            
            # =============================================
            # LAYER 3: CONFIDENCE DROP (Kyberastra Layer)
            # =============================================
            if current_conf is not None:
                s["confidence_history"].append(current_conf)
                
                if s["baseline_confidence"] is None and len(s["confidence_history"]) >= 5:
                    s["baseline_confidence"] = max(list(s["confidence_history"])[:5])
                
                if s["baseline_confidence"] is not None and "shelf" in current_zone:
                    drop = s["baseline_confidence"] - current_conf
                    s["max_confidence_drop"] = max(s["max_confidence_drop"], drop)
                    
                    if drop > self.confidence_drop_threshold:
                        s["confidence_drop_detected"] = True
            
            # =============================================
            # LAYER 4: VELOCITY SPIKE
            # =============================================
            if bbox is not None and len(bbox) >= 4:
                cx = (float(bbox[0]) + float(bbox[2])) / 2
                cy = (float(bbox[1]) + float(bbox[3])) / 2
                
                if s["last_centroid"] is not None:
                    dx = cx - s["last_centroid"][0]
                    dy = cy - s["last_centroid"][1]
                    speed = (dx**2 + dy**2) ** 0.5
                    s["velocities"].append(speed)
                    
                    if len(s["velocities"]) > 30:
                        s["velocities"] = s["velocities"][-30:]
                    
                    if "shelf" in current_zone and len(s["velocities"]) > 3:
                        s["avg_speed_at_shelf"] = sum(s["velocities"][-10:]) / min(len(s["velocities"]), 10)
                    
                    if current_zone in ["exit", "unknown"] and s["shelf_engaged"]:
                        recent_speed = sum(s["velocities"][-5:]) / min(len(s["velocities"]), 5) if s["velocities"] else 0
                        s["speed_at_exit_approach"] = recent_speed
                        
                        if s["avg_speed_at_shelf"] > 0:
                            if recent_speed > s["avg_speed_at_shelf"] * 2.0:
                                s["velocity_spike"] = True
                        elif recent_speed > self.velocity_spike_thresh:
                            s["velocity_spike"] = True
                            
                s["last_centroid"] = (cx, cy)
            
            # =============================================
            # LAYER 2: TRAJECTORY ANOMALY
            # =============================================
            # Must hit exit after shelf WITHOUT dwelling at billing for >10s
            if s["shelf_engaged"] and s["entered_exit"] and not s["billed_items"]:
                s["trajectory_anomaly"] = True
                
            # =============================================
            # LAYER 5: TEMPORAL LOCK
            # =============================================
            active_signals = sum([
                s["trajectory_anomaly"],
                s["confidence_drop_detected"],
                s["velocity_spike"],
                s["concealment_signal"] > 0.1
            ])
            
            if active_signals >= 2:
                s["anomaly_frames"] += 1
                if s["anomaly_frames"] >= 5:
                    s["temporal_confirmed"] = True
            else:
                s["anomaly_frames"] = max(0, s["anomaly_frames"] - 1)
                
            # HARD POCKETING OVERRIDE (Partial Theft Rule)
            # If a person shows BOTH a sharp YOLO confidence drop AND physical height
            # shrinkage at the shelf, it means they crouched/bent to conceal an item
            # inside their clothing. This is a definitive physical theft action.
            if s["confidence_drop_detected"] and s["concealment_signal"] > 0.1:
                s["hard_pocketing"] = True
            else:
                s["hard_pocketing"] = s.get("hard_pocketing", False)
            
            # =============================================
            # CONFIDENCE FUSION
            # =============================================
            score = 0.0
            
            if s["shelf_engaged"]:
                score += self.W_ENGAGEMENT * 1.0
            if s["trajectory_anomaly"]:
                score += self.W_TRAJECTORY * 1.0
            if s["confidence_drop_detected"]:
                drop_magnitude = min(s["max_confidence_drop"] / 0.5, 1.0)
                score += self.W_CONF_DROP * drop_magnitude
            if s["velocity_spike"]:
                score += self.W_VELOCITY * 1.0
            if s["temporal_confirmed"]:
                score += self.W_TEMPORAL * 1.0
            if s["concealment_signal"] > 0.1:
                score += self.W_CONCEALMENT * min(s["concealment_signal"] * 2, 1.0)
                
            # If definitive pocketing occurred, boost score to ensure threshold is met
            # even if the person later visits the billing queue (Partial Theft bypass).
            if s.get("hard_pocketing", False):
                score += 0.35
                
            s["confidence"] = round(score, 3)
            
            # =============================================
            # FINAL DETERMINATION
            # =============================================
            if s["confidence"] >= self.confidence_threshold and not s["alerted"]:
                cooldown_key = f"pattern_{obj_id}"
                last_alert = self.alert_cooldown.get(cooldown_key, 0)
                
                if time.time() - last_alert > self.ALERT_COOLDOWN_SECS:
                    confirmed_suspects.append(obj_id)
                    s["alerted"] = True
                    self.alert_cooldown[cooldown_key] = time.time()
                    
                    detail = {
                        "id": obj_id,
                        "confidence": s["confidence"],
                        "trajectory_anomaly": s["trajectory_anomaly"],
                        "confidence_drop": s["confidence_drop_detected"],
                        "max_conf_drop": round(s["max_confidence_drop"], 3),
                        "velocity_spike": s["velocity_spike"],
                        "concealment": round(s["concealment_signal"], 3),
                        "zone_path": s["zone_history"][-15:],
                    }
                    suspect_details.append(detail)
                    
                    logger.error(f"🚨 THEFT CONFIRMED: ID {obj_id} | Confidence: {s['confidence']*100:.1f}%")
            
            # =============================================
            # ROLE CLASSIFICATION
            # =============================================
            # REAL-WORLD STAFF RULE: 
            # A black shirt alone does not make someone staff (customers wear black).
            # They must be wearing the uniform AND have spent time at the billing counter.
            is_wearing_uniform = staff_overrides.get(str(obj_id)) == "STAFF"
            has_billing_dwell = s["dwell_time_billing"] > 1500  # 100 seconds
            
            is_staff = is_wearing_uniform and has_billing_dwell
            
            # PRIORITY 1: Staff Members (Immune to theft triggers when restocking)
            if is_staff:
                roles[obj_id] = "STAFF"
                
            # PRIORITY 2: Physical theft evidence overrides everything else.
            elif s["confidence"] >= self.confidence_threshold:
                roles[obj_id] = "SUSPECT"
                if not s["alerted"] and obj_id not in confirmed_suspects:
                    confirmed_suspects.append(obj_id)
                    s["alerted"] = True
                    
            # PRIORITY 3: Genuine customers (paid at billing)
            elif s["billed_items"]:
                roles[obj_id] = "CUSTOMER"
                
            # PRIORITY 4: Default fallback
            else:
                roles[obj_id] = "CUSTOMER"
                
        # =============================================
        # ENTERPRISE BUSINESS INSIGHTS (RETAIL ANALYTICS)
        # =============================================
        unattended_customers = 0
        checkout_queue_size = 0
        staff_at_billing = False
        cart_abandonments = 0
        
        for obj_id, s in self.states.items():
            if obj_id not in roles: continue
            role = roles[obj_id]
            
            # Tracking staff presence at the register
            if role == "STAFF" and s["last_zone"] == "billing":
                staff_at_billing = True
                
            # Tracking queue length
            if role == "CUSTOMER" and s["last_zone"] == "billing":
                checkout_queue_size += 1
                
            # Unserviced customer (dwelling at shelf > 20s = 300 frames)
            if role == "CUSTOMER" and "shelf" in s["last_zone"] and s["shelf_dwell"] > 300:
                unattended_customers += 1
                
            # Missed Conversion / Walk-out (Browsed shelves, went to exit, didn't buy, didn't steal)
            if role == "CUSTOMER" and s["entered_exit"] and s["visited_shelf"] and not s["billed_items"]:
                cart_abandonments += 1
                
        business_insights = {
            "checkout_bottleneck_risk": checkout_queue_size >= 2 and not staff_at_billing,
            "queue_size": checkout_queue_size,
            "unserviced_customers": unattended_customers,
            "missed_conversions": cart_abandonments,
            "active_staff_count": list(roles.values()).count("STAFF")
        }
        
        return {
            "theft": len(confirmed_suspects) > 0,
            "suspects": confirmed_suspects,
            "roles": roles,
            "suspect_details": suspect_details,
            "business_insights": business_insights,
        }
    
    def start_evidence_recording(self, frame, fps=15):
        """Record 30s evidence video."""
        if self.recording: return
        
        timestamp = time.strftime("%Y%m%d_%H%M%S")
        filename = f"theft_evidence_{timestamp}.mp4"
        self.latest_evidence_path = os.path.join(self.evidence_dir, filename)
        
        h, w = frame.shape[:2]
        fourcc = cv2.VideoWriter_fourcc(*'mp4v')
        self.video_writer = cv2.VideoWriter(self.latest_evidence_path, fourcc, fps, (w, h))
        self.recording = True
        self.record_start_time = time.time()
        logger.info(f"📹 Evidence recording started: {self.latest_evidence_path}")
        
        # Dump the time-machine buffer into the physical file FIRST
        frames_dumped = 0
        while self.frame_buffer:
            hist_frame = self.frame_buffer.popleft()
            self.video_writer.write(hist_frame)
            frames_dumped += 1
        logger.info(f"   [RETROSPECTIVE INJECT]: Dumped past {frames_dumped} frames of evidence.")
    
    def record_frame(self, frame):
        if not self.recording or self.video_writer is None: return False
        self.video_writer.write(frame)
        if time.time() - self.record_start_time >= self.evidence_duration:
            self.stop_evidence_recording()
            return False
        return True
    
    def stop_evidence_recording(self):
        if self.video_writer is not None:
            self.video_writer.release()
            self.video_writer = None
        self.recording = False
        logger.info(f"📹 Evidence saved: {self.latest_evidence_path}")
    
    def get_latest_evidence_path(self):
        if self.latest_evidence_path and os.path.exists(self.latest_evidence_path):
            return self.latest_evidence_path
        return None
