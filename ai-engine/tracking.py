import math
import logging
import cv2
import numpy as np

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class CentroidTracker:
    def __init__(self, max_distance=50, max_missed=5):
        """
        Initializes the multi-object centroid tracker.
        
        Args:
            max_distance (int): Max Euclidean distance (in pixels) to consider a centroid the same object.
            max_missed (int): Number of consecutive frames an object can be missing before deletion.
        """
        # Dictionary to store tracked objects
        # Format: { id: {"centroid": (x, y), "bbox": [x1, y1, x2, y2], "missed_frames": int} }
        self.objects = {}
        self.next_id = 1
        
        self.max_distance = max_distance
        self.max_missed = max_missed

    def _get_centroid(self, bbox):
        """Computes the geometric center (x, y) coordinates of a bounding box."""
        x1, y1, x2, y2 = bbox[:4]
        cx = int((x1 + x2) / 2.0)
        cy = int((y1 + y2) / 2.0)
        return (cx, cy)

    def _calculate_distance(self, c1, c2):
        """Computes the Euclidean distance between two centroids."""
        return math.hypot(c1[0] - c2[0], c1[1] - c2[1])

    def track(self, detections):
        """
        Takes raw bounding box detections, updates active tracks, assigns IDs.
        
        Args:
            detections (list): list of bounding boxes [[x1, y1, x2, y2], ...]
            
        Returns:
            dict: { "people_count": int, "ids": list, "objects": { "id_as_str": [x1, y1, x2, y2] } }
        """
        # 1. Edge Case: No detections in current frame
        if len(detections) == 0:
            for obj_id in list(self.objects.keys()):
                self.objects[obj_id]["missed_frames"] += 1
                # 4. Deletion: Remove if not seen for N frames
                if self.objects[obj_id]["missed_frames"] > self.max_missed:
                    del self.objects[obj_id]
            
            return self._format_output()

        # 2. Compute centroids for all new detections
        new_centroids = [(self._get_centroid(bbox), bbox) for bbox in detections]

        # 3. If tracking no objects currently, register everything as new
        if len(self.objects) == 0:
            for centroid, bbox in new_centroids:
                self._register(centroid, bbox)
        else:
            # Match existing objects to new detections
            object_ids = list(self.objects.keys())
            object_centroids = [self.objects[obj_id]["centroid"] for obj_id in object_ids]

            # Generate distance matrix pairing and sort by shortest distance
            distance_pairs = []
            for i, obj_centroid in enumerate(object_centroids):
                for j, (new_centroid, _) in enumerate(new_centroids):
                    dist = self._calculate_distance(obj_centroid, new_centroid)
                    distance_pairs.append((dist, i, j))

            # Greedy nearest neighbor
            distance_pairs.sort(key=lambda x: x[0])
            
            used_obj_indices = set()
            used_new_indices = set()

            for dist, obj_idx, new_idx in distance_pairs:
                if obj_idx in used_obj_indices or new_idx in used_new_indices:
                    continue

                # 2. Matching: Closest centroid = same ID
                if dist < self.max_distance:
                    obj_idx_int = int(obj_idx)
                    new_idx_int = int(new_idx)
                    obj_id = object_ids[obj_idx_int]
                    self.objects[obj_id]["centroid"] = new_centroids[new_idx_int][0]
                    self.objects[obj_id]["bbox"] = new_centroids[new_idx_int][1]
                    self.objects[obj_id]["missed_frames"] = 0  # Reset missing counter
                    
                    used_obj_indices.add(obj_idx)
                    used_new_indices.add(new_idx)

            # 3. ID Persistence: Check existings objects that were NOT matched
            for i, obj_id in enumerate(object_ids):
                if i not in used_obj_indices:
                    self.objects[obj_id]["missed_frames"] += 1
                    if self.objects[obj_id]["missed_frames"] > self.max_missed:
                        del self.objects[obj_id]

            # 1. ID Assignment: Check new detections that were NOT matched (spawn new ID)
            for j, (new_centroid, bbox) in enumerate(new_centroids):
                if j not in used_new_indices:
                    self._register(new_centroid, bbox)

        return self._format_output()

    def _register(self, centroid, bbox):
        """Registers a newly detected object with a fresh incremental ID."""
        self.objects[self.next_id] = {
            "centroid": centroid,
            "bbox": bbox,
            "missed_frames": 0
        }
        self.next_id += 1

    def _format_output(self):
        """Formats the internal tracking state into the strictly required output dict."""
        output_objects = {str(obj_id): self.objects[obj_id]["bbox"] for obj_id in self.objects}
        
        return {
            "people_count": len(self.objects),
            "ids": list(self.objects.keys()),
            "objects": output_objects
        }

def visualize_tracking(frame, tracking_response):
    """
    Visual utility to draw tracked bounding boxes cleanly.
    """
    for obj_id_str, bbox in tracking_response["objects"].items():
        obj_id = int(obj_id_str)
        x1, y1, x2, y2 = map(int, bbox)
        
        # Pseudo-random unique color based on ID
        color = ((obj_id * 37) % 255, (obj_id * 101) % 255, (obj_id * 211) % 255)
        
        cv2.rectangle(frame, (x1, y1), (x2, y2), color, 3)
        # ID Overlay
        cv2.putText(frame, f"ID:{obj_id}", (x1, y1 - 10), 
                    cv2.FONT_HERSHEY_SIMPLEX, 0.7, color, 2, cv2.LINE_AA)
        
        # Center dot mapping
        cx = int((x1 + x2) / 2)
        cy = int((y1 + y2) / 2)
        cv2.circle(frame, (cx, cy), 5, color, -1)

    return frame

def test_standalone():
    """Dummy frame-by-frame test loop to simulate tracking logic."""
    tracker = CentroidTracker(max_distance=50, max_missed=5)
    logger.info("Starting standalone tracker test...")
    
    # Simulating 5 frames. P2 gets temporarily occluded/lost in Frame 3 & 4.
    dummy_detections = [
        [[100, 100, 150, 200], [300, 100, 350, 200]],    # Frame 1: P1, P2
        [[105, 100, 155, 200], [310, 100, 360, 200]],    # Frame 2: Shift right
        [[110, 100, 160, 200]],                          # Frame 3: P2 lost
        [[115, 100, 165, 200]],                          # Frame 4: P2 lost
        [[120, 100, 170, 200], [320, 100, 370, 200]],    # Frame 5: P2 reappears near old spot -> ID persists!
    ]
    
    for i, dets in enumerate(dummy_detections):
        # Create a blank black canvas to visualize
        frame = np.zeros((400, 600, 3), dtype=np.uint8)
        
        # Run tracking output
        output = tracker.track(dets)
        logger.info(f"Frame {i+1} Output: \n{output}")
        
        # Draw Output
        frame = visualize_tracking(frame, output)
        cv2.putText(frame, f"Frame {i+1} - Missed frame occlusion test", (10, 30), 
                    cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255, 255, 255), 2)
        
        cv2.imshow("Tracking Standalone", frame)
        cv2.waitKey(2000)  # Hold visual for 2 seconds per frame
        
    cv2.destroyAllWindows()
    logger.info("Test finished.")

if __name__ == "__main__":
    test_standalone()
