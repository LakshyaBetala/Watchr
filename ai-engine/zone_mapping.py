import logging
import cv2
import os
import json
import time

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)


class ZoneMapper:
    """
    Enterprise Spatial Intelligence Engine.
    Maps tracked objects to semantic zones and provides:
    - Per-zone assignment based on centroid collision
    - Per-person dwell time accumulator (seconds per zone)
    - Zone transition log with timestamps
    - Dynamic zone loading from auto_calibrator.py
    """
    
    def __init__(self, zones=None):
        if zones is None:
            self.zones = {
                "shelf": [(100, 100), (300, 400)],
                "billing": [(400, 150), (600, 300)],
                "exit": [(400, 350), (600, 480)]
            }
            if os.path.exists("auto_zones.json"):
                try:
                    with open("auto_zones.json", "r") as f:
                        auto_data = json.load(f)
                        if isinstance(auto_data, dict):
                            loaded_zones = {}
                            for name, coords in auto_data.items():
                                if isinstance(coords, list) and len(coords) == 2:
                                    loaded_zones[name] = [tuple(coords[0]), tuple(coords[1])]
                            if loaded_zones:
                                self.zones = loaded_zones
                except Exception as e:
                    logger.error(f"Failed to load auto_zones.json: {e}")
        else:
            self.zones = zones
        
        self.dwell_times = {}      
        self.last_zone = {}        
        self.zone_entry_time = {}  
        self.transitions = []      
        self.MAX_TRANSITIONS = 500

    def _get_centroid(self, bbox):
        x1, y1, x2, y2 = bbox[:4]
        return ((x1 + x2) // 2, (y1 + y2) // 2)

    def _is_inside(self, point, zone_bbox):
        px, py = point
        if len(zone_bbox) == 2:
            (zx1, zy1), (zx2, zy2) = zone_bbox
        else:
            zx1, zy1, zx2, zy2 = zone_bbox
        return (zx1 <= px <= zx2) and (zy1 <= py <= zy2)

    def map_zones(self, objects):
        mapping = {}
        current_time = time.time()
        new_transitions = []
        
        if not objects:
            return {"zones": {}, "dwell_times": {}, "transitions": []}
            
        for obj_id_str, bbox in objects.items():
            centroid = self._get_centroid(bbox)
            assigned_zone = "unknown"
            
            for zone_name, zone_bbox in self.zones.items():
                if self._is_inside(centroid, zone_bbox):
                    assigned_zone = zone_name
                    break
                    
            mapping[str(obj_id_str)] = assigned_zone
            
            if obj_id_str not in self.dwell_times:
                self.dwell_times[obj_id_str] = {}
                self.zone_entry_time[obj_id_str] = current_time
            
            prev_zone = self.last_zone.get(obj_id_str, "unknown")
            
            if assigned_zone != prev_zone:
                entry_time = self.zone_entry_time.get(obj_id_str, current_time)
                elapsed = current_time - entry_time
                
                if prev_zone != "unknown" and elapsed > 0.5:
                    self.dwell_times[obj_id_str][prev_zone] = \
                        self.dwell_times[obj_id_str].get(prev_zone, 0) + elapsed
                
                transition = {
                    "id": obj_id_str,
                    "from_zone": prev_zone,
                    "to_zone": assigned_zone,
                    "timestamp": time.strftime("%H:%M:%S"),
                    "epoch": current_time,
                }
                new_transitions.append(transition)
                self.transitions.append(transition)
                if len(self.transitions) > self.MAX_TRANSITIONS:
                    self.transitions = self.transitions[-self.MAX_TRANSITIONS:]
                self.zone_entry_time[obj_id_str] = current_time
            
            self.last_zone[obj_id_str] = assigned_zone
        
        active_ids = set(objects.keys())
        for stale_id in list(self.last_zone.keys()):
            if stale_id not in active_ids:
                if stale_id in self.zone_entry_time:
                    last_z = self.last_zone.get(stale_id, "unknown")
                    elapsed = current_time - self.zone_entry_time[stale_id]
                    if last_z != "unknown" and elapsed > 0.5:
                        if stale_id not in self.dwell_times:
                            self.dwell_times[stale_id] = {}
                        self.dwell_times[stale_id][last_z] = \
                            self.dwell_times[stale_id].get(last_z, 0) + elapsed
                
                self.last_zone.pop(stale_id, None)
                self.zone_entry_time.pop(stale_id, None)
        
        return {"zones": mapping, "dwell_times": dict(self.dwell_times), "transitions": new_transitions}

def visualize_zones(frame, zone_mapper, tracking_dict, mapping_dict):
    """Draw semantic zone boundaries and occupant labels."""
    for zone_name, zone_bbox in zone_mapper.zones.items():
        if len(zone_bbox) == 2:
            (zx1, zy1), (zx2, zy2) = zone_bbox
        else:
            zx1, zy1, zx2, zy2 = zone_bbox
        cv2.rectangle(frame, (int(zx1), int(zy1)), (int(zx2), int(zy2)), (255, 50, 50), 2)
        cv2.putText(frame, f"ZONE: {zone_name.upper()}", (zx1 + 5, zy1 + 25), 
                    cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 50, 50), 2, cv2.LINE_AA)

    if tracking_dict and "objects" in tracking_dict:
        tracked_objects = tracking_dict["objects"]
        mapped_zones = mapping_dict.get("zones", {})
        dwell_times = mapping_dict.get("dwell_times", {})
        
        for obj_id_str, bbox in tracked_objects.items():
            x1, y1, x2, y2 = map(int, bbox[:4])
            current_zone = mapped_zones.get(obj_id_str, "unknown")
            dwell = dwell_times.get(obj_id_str, {}).get(current_zone, 0)
            cx, cy = (x1+x2)//2, (y1+y2)//2
            cv2.circle(frame, (cx, cy), 5, (0, 0, 255), -1)
            color = (0, 200, 0) if current_zone != "unknown" else (0, 165, 255)
            cv2.rectangle(frame, (x1, y1), (x2, y2), color, 2)
            cv2.putText(frame, f"ID:{obj_id_str} [{current_zone}] {dwell:.0f}s", (x1, y2 + 20), 
                        cv2.FONT_HERSHEY_SIMPLEX, 0.5, color, 2, cv2.LINE_AA)
    return frame
