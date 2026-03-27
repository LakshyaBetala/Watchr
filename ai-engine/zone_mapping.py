import logging
import cv2
import os
import json

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class ZoneMapper:
    def __init__(self, zones=None):
        """
        Initializes the ZoneMapper with predefined rectangular zones.
        
        Args:
            zones (dict): Dictionary mapping zone_name to boundaries (x1, y1, x2, y2).
                          If None, initializes with default retail dummy zones.
        """
        if zones is None:
            # Default geometric zones fallback
            self.zones = {
                "shelf": [(100, 100), (300, 400)],
                "billing": [(400, 150), (600, 300)],
                "exit": [(400, 350), (600, 480)]
            }
            
            # SUPREME AI: If the user has ran `auto_calibrator.py`, completely override hardcoded zones with dynamic layout
            if os.path.exists("auto_zones.json"):
                try:
                    with open("auto_zones.json", "r") as f:
                        auto_data = json.load(f)
                        # Ensure the loaded data is a dictionary and has valid coordinates
                        if isinstance(auto_data, dict):
                            loaded_zones = {}
                            for name, coords in auto_data.items():
                                if isinstance(coords, list) and len(coords) == 2 and \
                                   isinstance(coords[0], list) and len(coords[0]) == 2 and \
                                   isinstance(coords[1], list) and len(coords[1]) == 2:
                                    # Remap learned matrix arrays into OpenCV-compliant tuples
                                    loaded_zones[name] = [tuple(coords[0]), tuple(coords[1])]
                            if loaded_zones: # Only override if valid zones were loaded
                                self.zones = loaded_zones
                                logger.info("🧠 SUPREME AI LOADED: Overriding defaults with dynamically learned spatial mapping.")
                        else:
                            logger.warning("auto_zones.json content is not a dictionary. Using default zones.")
                except json.JSONDecodeError:
                    logger.error("Error decoding auto_zones.json. Using default zones.")
                except Exception as e:
                    logger.error(f"An unexpected error occurred while loading auto_zones.json: {e}. Using default zones.")
        else:
            self.zones = zones
            
        logger.info(f"ZoneMapper initialized with {len(self.zones)} semantic zones.")

    def _get_centroid(self, bbox):
        """Computes the geometric center (x, y) coordinates of a bounding box."""
        # Extract centroid to determine point-in-polygon
        x1, y1, x2, y2 = bbox[:4]
        cx = (x1 + x2) // 2
        cy = (y1 + y2) // 2
        return (cx, cy)

    def _is_inside(self, point, zone_bbox):
        """Checks if a specific (x, y) point falls strictly inside a bounding box."""
        px, py = point
        # Extract the two points regardless of format. Handle 2-element tuples.
        if len(zone_bbox) == 2:
            (zx1, zy1), (zx2, zy2) = zone_bbox
        else:
            zx1, zy1, zx2, zy2 = zone_bbox
            
        return (zx1 <= px <= zx2) and (zy1 <= py <= zy2)

    def map_zones(self, objects):
        """
        Maps tracked objects to semantic zones based on their centroids.
        
        Args:
            objects (dict): Tracked objects dictionary { str(id): [x1, y1, x2, y2] }
            
        Returns:
            dict: { "zones": { str(id): "zone_name" } }
        """
        mapping = {}
        
        # 1. Edge Case: Empty Tracking
        if not objects:
            return {"zones": {}}
            
        for obj_id_str, bbox in objects.items():
            centroid = self._get_centroid(bbox)
            assigned_zone = "unknown"  # Default 🛡️ Fallback
            
            # 2. Iterate Zones: Check which geometric boundary the centroid occupies
            for zone_name, zone_bbox in self.zones.items():
                if self._is_inside(centroid, zone_bbox):
                    assigned_zone = zone_name
                    break  # Zones are assumed non-overlapping priority
                    
            mapping[str(obj_id_str)] = assigned_zone
            
        return {"zones": mapping}

def visualize_zones(frame, zone_mapper, tracking_dict, mapping_dict):
    """
    Utility to comprehensively draw the semantic boundaries and label the occupants' behavior.
    """
    # 1. Overlay configured physical zones onto frame
    for zone_name, zone_bbox in zone_mapper.zones.items():
        if len(zone_bbox) == 2:
            (zx1, zy1), (zx2, zy2) = zone_bbox
        else:
            zx1, zy1, zx2, zy2 = zone_bbox
            
        cv2.rectangle(frame, (int(zx1), int(zy1)), (int(zx2), int(zy2)), (255, 50, 50), 2)
        
        # Label zone
        cv2.putText(frame, f"ZONE: {zone_name.upper()}", (zx1 + 5, zy1 + 25), 
                    cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 50, 50), 2, cv2.LINE_AA)

    # 2. Map tracking outputs inside zones
    if tracking_dict and "objects" in tracking_dict:
        tracked_objects = tracking_dict["objects"]
        mapped_zones = mapping_dict.get("zones", {})
        
        for obj_id_str, bbox in tracked_objects.items():
            x1, y1, x2, y2 = map(int, bbox[:4])
            current_zone = mapped_zones.get(obj_id_str, "unknown")
            
            # Draw centroid point used for calculation
            cx, cy = int((x1+x2)/2), int((y1+y2)/2)
            cv2.circle(frame, (cx, cy), 5, (0, 0, 255), -1)
            
            # Overlay ID and semantic state
            color = (0, 200, 0) if current_zone != "unknown" else (0, 165, 255)
            cv2.rectangle(frame, (x1, y1), (x2, y2), color, 2)
            cv2.putText(frame, f"ID:{obj_id_str} [{current_zone}]", (x1, y2 + 20), 
                        cv2.FONT_HERSHEY_SIMPLEX, 0.7, color, 2, cv2.LINE_AA)

    return frame

def test_standalone():
    """Dummy frame simulation to cleanly validate boundary interaction logic."""
    import numpy as np
    
    logger.info("Starting standalone semantic zone mapping test...")
    mapper = ZoneMapper()
    
    # Dummy Tracking Output Feed
    # Frame 1: Person 1 is in the middle of 'shelf'. Person 2 is at 'billing'.
    # Frame 2: Person 1 wanders outside to blank area ('unknown'). Person 2 shifts into 'exit'
    dummy_tracker_output = {
        1: {"objects": {"1": [100, 100, 150, 200], "2": [350, 100, 400, 180]}},
        2: {"objects": {"1": [10, 10, 40, 40], "2": [350, 300, 400, 380]}}
    }
    
    for i in range(1, 3):
        frame = np.zeros((500, 600, 3), dtype=np.uint8)
        tracked = dummy_tracker_output[i]["objects"]
        
        # Run module
        mapping_result = mapper.map_zones(tracked)
        
        logger.info(f"Frame {i} Tracking: {tracked}")
        logger.info(f"Frame {i} Zone Mapping: {mapping_result}")
        
        # Render logic
        frame = visualize_zones(frame, mapper, dummy_tracker_output[i], mapping_result)
        cv2.putText(frame, f"Zone Test Frame {i}", (10, 30), 
                    cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255, 255, 255), 2)
                    
        cv2.imshow("Smart Zone Engine", frame)
        cv2.waitKey(2500)
        
    cv2.destroyAllWindows()
    logger.info("Semantic Boundary test completed.")

if __name__ == "__main__":
    test_standalone()
