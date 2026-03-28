import cv2
import numpy as np
import time
import logging

logger = logging.getLogger(__name__)

class IdentityManager:
    """
    Handles Multi-Camera Re-Identification (ReID) and Visual Staff Recognition (Uniforms).
    Extracts the Torso Color Signature to persistently track IDs across grids/cameras.
    """
    def __init__(self, staff_color="black", reid_memory_seconds=30):
        self.staff_color = staff_color.lower()
        self.reid_memory_seconds = reid_memory_seconds
        
        # Maps tracker_id (BoT-SORT ID) -> Global persistent ID
        self.active_tracker_to_global = {}
        
        # Memory Bank: global_id -> {"signature": hist, "last_seen": timestamp, "is_staff": bool}
        self.memory_bank = {}
        
        self.next_global_id = 1
        
    def _extract_torso_signature(self, frame, bbox):
        """Extract dominant color histogram from the upper 40% of the bounding box (torso/shirt)."""
        x1, y1, x2, y2 = map(int, bbox[:4])
        # Validate crop
        if x1 < 0 or y1 < 0 or x2 > frame.shape[1] or y2 > frame.shape[0]:
            return None
            
        h = y2 - y1
        if h < 10 or (x2 - x1) < 10:
            return None
            
        # Crop upper 40% (torso)
        torso_roi = frame[y1:y1 + int(h * 0.4), x1:x2]
        if torso_roi.size == 0:
            return None
            
        # Convert to HSV 
        hsv_roi = cv2.cvtColor(torso_roi, cv2.COLOR_BGR2HSV)
        
        # Calculate normalized 2D Histogram (Hue & Saturation)
        mask = cv2.inRange(hsv_roi, np.array((0, 20, 20)), np.array((180, 255, 255)))
        hist = cv2.calcHist([hsv_roi], [0, 1], mask, [16, 16], [0, 180, 0, 256])
        cv2.normalize(hist, hist, alpha=0, beta=1, norm_type=cv2.NORM_MINMAX)
        
        return hist
        
    def _is_staff_uniform(self, frame, bbox):
        """Analyze torso color directly to identify staff uniforms."""
        x1, y1, x2, y2 = map(int, bbox[:4])
        # Validate crop
        if x1 < 0 or y1 < 0 or x2 > frame.shape[1] or y2 > frame.shape[0]:
            return False
            
        h = y2 - y1
        if h < 10 or (x2 - x1) < 10:
            return False
            
        # Crop upper 40% (torso)
        torso_roi = frame[y1:y1 + int(h * 0.4), x1:x2]
        if torso_roi.size == 0:
            return False
            
        hsv_roi = cv2.cvtColor(torso_roi, cv2.COLOR_BGR2HSV)
        
        avg_v = np.mean(hsv_roi[:, :, 2])
        avg_s = np.mean(hsv_roi[:, :, 1])
        
        if self.staff_color == "black":
            return avg_v < 60
        elif self.staff_color == "blue":
            avg_h = np.mean(hsv_roi[:, :, 0])
            return 100 < avg_h < 140 and avg_s > 50 and avg_v > 40
            
        return False

    def process_tracking(self, frame, track_output):
        current_time = time.time()
        
        new_objects = {}
        new_per_person_conf = {}
        new_ids = []
        global_roles = {}
        
        current_tracker_ids = list(track_output.get("objects", {}).keys())
        
        expired_ids = [gid for gid, data in self.memory_bank.items() 
                       if current_time - data["last_seen"] > self.reid_memory_seconds]
        for gid in expired_ids:
            if gid not in self.active_tracker_to_global.values():
                del self.memory_bank[gid]
        
        disappeared = [tid for tid in list(self.active_tracker_to_global.keys()) 
                       if str(tid) not in current_tracker_ids]
        for tid in disappeared:
            del self.active_tracker_to_global[tid]
            
        for tid_str, bbox in track_output.get("objects", {}).items():
            conf = track_output.get("per_person_confidence", {}).get(tid_str, 0.0)
            
            signature = self._extract_torso_signature(frame, bbox)
            is_staff = self._is_staff_uniform(frame, bbox)
            
            gid = None
            
            if tid_str in self.active_tracker_to_global:
                gid = self.active_tracker_to_global[tid_str]
                if signature is not None and gid in self.memory_bank:
                    self.memory_bank[gid]["signature"] = signature
                    self.memory_bank[gid]["last_seen"] = current_time
                    if is_staff:
                        self.memory_bank[gid]["is_staff"] = True
            else:
                best_match_gid = None
                best_score = 0
                
                if signature is not None:
                    for mem_gid, data in self.memory_bank.items():
                        if mem_gid in self.active_tracker_to_global.values():
                            continue
                            
                        mem_sig = data["signature"]
                        if mem_sig is not None:
                            score = cv2.compareHist(signature, mem_sig, cv2.HISTCMP_CORREL)
                            if score > best_score:
                                best_score = score
                                best_match_gid = mem_gid
                            
                if best_match_gid is not None and best_score > 0.85:
                    gid = best_match_gid
                    self.active_tracker_to_global[tid_str] = gid
                    self.memory_bank[gid]["last_seen"] = current_time
                    if is_staff:
                        self.memory_bank[gid]["is_staff"] = True
                else:
                    gid = self.next_global_id
                    self.next_global_id += 1
                    self.active_tracker_to_global[tid_str] = gid
                    self.memory_bank[gid] = {
                        "signature": signature,
                        "last_seen": current_time,
                        "is_staff": is_staff
                    }
                    
            gid_str = str(gid)
            new_objects[gid_str] = bbox
            new_per_person_conf[gid_str] = conf
            new_ids.append(gid)
            if self.memory_bank[gid]["is_staff"]:
                global_roles[gid_str] = "STAFF"
                
        return {
            "people_count": track_output.get("people_count", 0),
            "ids": new_ids,
            "objects": new_objects,
            "per_person_confidence": new_per_person_conf,
            "detections": track_output.get("detections", []),
            "staff_overrides": global_roles
        }
