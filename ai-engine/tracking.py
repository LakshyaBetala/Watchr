import math
import logging
import cv2

logging.basicConfig(level=logging.INFO, format='%(message)s')
logger = logging.getLogger(__name__)


class YOLOTracker:
    """
    Enterprise tracker using YOLO's built-in BoT-SORT (Better than DeepSORT).
    Provides stable IDs across occlusions via Kalman Filter + ReID embeddings.
    Extracts per-person confidence scores for Kyberastra theft detection.
    """
    
    def __init__(self, model, conf_thresh=0.5):
        self.model = model
        self.conf_thresh = conf_thresh
        self.person_class = 0
    
    def track(self, frame):
        try:
            results = self.model.track(frame, persist=True, verbose=False,
                                        conf=self.conf_thresh, classes=[self.person_class])
            
            objects = {}
            per_person_conf = {}
            detections = []
            ids = []
            
            if results and results[0].boxes is not None:
                boxes = results[0].boxes
                
                if boxes.id is not None:
                    track_ids = boxes.id.int().cpu().tolist()
                else:
                    track_ids = list(range(len(boxes)))
                
                for i, box in enumerate(boxes):
                    cls_id = int(box.cls[0])
                    if cls_id != self.person_class:
                        continue
                    
                    conf = float(box.conf[0])
                    x1, y1, x2, y2 = map(int, box.xyxy[0])
                    track_id = track_ids[i] if i < len(track_ids) else i
                    
                    obj_id_str = str(track_id)
                    objects[obj_id_str] = [x1, y1, x2, y2, conf]
                    per_person_conf[obj_id_str] = conf
                    detections.append([x1, y1, x2, y2, conf])
                    ids.append(track_id)
            
            return {
                "people_count": len(objects),
                "ids": ids,
                "objects": objects,
                "per_person_confidence": per_person_conf,
                "detections": detections,
            }
            
        except Exception as e:
            logger.error(f"YOLO tracking failed: {e}")
            return {"people_count": 0, "ids": [], "objects": {}, "per_person_confidence": {}, "detections": []}
    
    def track_batch(self, frames):
        return [self.track(f) for f in frames]


class CentroidTracker:
    """Fallback centroid-based tracker for ONNX deployments without native DeepSORT."""
    
    def __init__(self, max_distance=50, max_missed=5):
        self.objects = {}
        self.next_id = 1
        self.max_distance = max_distance
        self.max_missed = max_missed

    def _get_centroid(self, bbox):
        x1, y1, x2, y2 = bbox[:4]
        return (int((x1 + x2) / 2.0), int((y1 + y2) / 2.0))

    def _calculate_distance(self, c1, c2):
        return math.hypot(c1[0] - c2[0], c1[1] - c2[1])

    def track(self, detections):
        if len(detections) == 0:
            for obj_id in list(self.objects.keys()):
                self.objects[obj_id]["missed_frames"] += 1
                if self.objects[obj_id]["missed_frames"] > self.max_missed:
                    del self.objects[obj_id]
            return self._format_output()

        new_centroids = [(self._get_centroid(bbox), bbox) for bbox in detections]

        if len(self.objects) == 0:
            for centroid, bbox in new_centroids:
                self._register(centroid, bbox)
        else:
            object_ids = list(self.objects.keys())
            object_centroids = [self.objects[oid]["centroid"] for oid in object_ids]
            distance_pairs = []
            
            for i, oc in enumerate(object_centroids):
                for j, (nc, _) in enumerate(new_centroids):
                    dist = self._calculate_distance(oc, nc)
                    distance_pairs.append((dist, i, j))

            distance_pairs.sort(key=lambda x: x[0])
            used_obj = set()
            used_new = set()

            for dist, oi, ni in distance_pairs:
                if oi in used_obj or ni in used_new:
                    continue
                if dist < self.max_distance:
                    obj_id = object_ids[oi]
                    self.objects[obj_id]["centroid"] = new_centroids[ni][0]
                    self.objects[obj_id]["bbox"] = new_centroids[ni][1]
                    self.objects[obj_id]["missed_frames"] = 0
                    used_obj.add(oi)
                    used_new.add(ni)

            for i, obj_id in enumerate(object_ids):
                if i not in used_obj:
                    self.objects[obj_id]["missed_frames"] += 1
                    if self.objects[obj_id]["missed_frames"] > self.max_missed:
                        del self.objects[obj_id]

            for j, (nc, bbox) in enumerate(new_centroids):
                if j not in used_new:
                    self._register(nc, bbox)

        return self._format_output()

    def _register(self, centroid, bbox):
        self.objects[self.next_id] = {"centroid": centroid, "bbox": bbox, "missed_frames": 0}
        self.next_id += 1

    def _format_output(self):
        output_objects = {}
        per_person_conf = {}
        all_detections = []
        for obj_id in self.objects:
            bbox = self.objects[obj_id]["bbox"]
            output_objects[str(obj_id)] = bbox
            conf = float(bbox[4]) if len(bbox) > 4 else 0.0
            per_person_conf[str(obj_id)] = conf
            all_detections.append(bbox)
        
        return {"people_count": len(self.objects), "ids": list(self.objects.keys()),
                "objects": output_objects, "per_person_confidence": per_person_conf, "detections": all_detections}


def visualize_tracking(frame, tracking_response):
    for obj_id_str, bbox in tracking_response.get("objects", {}).items():
        x1, y1, x2, y2 = map(int, bbox[:4])
        conf = float(bbox[4]) if len(bbox) > 4 else 0.0
        obj_id = int(obj_id_str) if obj_id_str.isdigit() else hash(obj_id_str)
        color = ((obj_id * 37) % 255, (obj_id * 101) % 255, (obj_id * 211) % 255)
        cv2.rectangle(frame, (x1, y1), (x2, y2), color, 2)
        cv2.putText(frame, f"ID:{obj_id_str} [{conf:.0%}]", (x1, y1 - 10),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.5, color, 2, cv2.LINE_AA)
        cx, cy = (x1 + x2) // 2, (y1 + y2) // 2
        cv2.circle(frame, (cx, cy), 4, color, -1)
    return frame
