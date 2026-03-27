import cv2
import time
import logging
from collections import deque
from ultralytics import YOLO

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class PersonDetector:
    def __init__(self, model_name="yolov8n.pt", conf_thresh=0.5, buffer_size=5, min_stable=3):
        """
        Initializes YOLOv8 and sets up the stability tracking buffer.
        """
        logger.info(f"Loading YOLOv8 model: {model_name}")
        try:
            self.model = YOLO(model_name)
        except Exception as e:
            logger.error(f"Failed to load YOLO model. Error: {e}")
            # Fallback -> motion detection initialization can go here later
            self.model = None

        self.conf_thresh = conf_thresh
        
        # Stability Layer setup (Buffer)
        self.buffer_size = buffer_size
        self.min_stable = min_stable
        # Deque naturally acts as a sliding window of the last N frames
        self.history = deque(maxlen=self.buffer_size)

    def detect(self, frame):
        """
        Runs object detection, filters for 'person', maintains temporal stability.
        
        Args:
            frame: Raw BGR frame from OpenCV
            
        Returns:
            dict: { "people_count": int, "detections": list, "stable": bool }
        """
        # 🛡️ Fallback if YOLO failed to load
        if self.model is None:
            logger.warning("YOLO model not loaded. Returning empty detection (Fallback to Motion Detection logic needed).")
            return {"people_count": 0, "detections": [], "stable": False}

        # 1. Run YOLO detection (verbose=False to avoid console spam)
        results = self.model(frame, verbose=False)

        current_detections = []
        people_count = 0

        # 2. Extract bounding boxes and apply Filtering (confidence + class)
        for result in results:
            for box in result.boxes:
                cls_id = int(box.cls[0])    # 0 is 'person' in COCO dataset
                conf = float(box.conf[0])   # Confidence score
                
                if cls_id == 0 and conf >= self.conf_thresh:
                    # Extract bounding box [x1, y1, x2, y2] and confidence
                    x1, y1, x2, y2 = map(int, box.xyxy[0])
                    current_detections.append([x1, y1, x2, y2, conf])
                    people_count += 1

        # 3. Stability Layer (Anti-flicker thresholding)
        # Did we detect *any* person in this frame? Track that boolean in history
        has_people = (people_count > 0)
        self.history.append(has_people)

        # "Stable" defined as: true in at least (min_stable) out of (buffer_size) last frames
        stable = sum(self.history) >= self.min_stable

        # 4. Visualization
        # Use a distinct color when stable (Green) vs unstable (Orange)
        color = (0, 255, 0) if stable else (0, 165, 255)

        for bbox in current_detections:
            x1, y1, x2, y2 = map(int, bbox[:4])
            cv2.rectangle(frame, (x1, y1), (x2, y2), color, 2)
            # Add label
            # The confidence value is at index 4 in bbox
            conf_val = bbox[4]
            cv2.putText(frame, f"Person {conf_val:.2f}", (x1, y1 - 10), 
                        cv2.FONT_HERSHEY_SIMPLEX, 0.5, color, 2)

        # Display people count and stability status on frame
        cv2.putText(frame, f"People Count: {people_count}", (20, 120), 
                    cv2.FONT_HERSHEY_SIMPLEX, 0.8, color, 2, cv2.LINE_AA)
        
        cv2.putText(frame, f"Stable: {stable}", (20, 160), 
                    cv2.FONT_HERSHEY_SIMPLEX, 0.8, color, 2, cv2.LINE_AA)

        return {
            "people_count": people_count,
            "detections": current_detections,
            "stable": stable
        }

def test_standalone():
    """Simple test loop using native webcam input to verify standalone logic."""
    logger.info("Starting standalone test loop for detection module...")
    cap = cv2.VideoCapture(0)
    
    if not cap.isOpened():
        logger.error("Webcam not found for standalone test.")
        return

    detector = PersonDetector(model_name="yolov8n.pt", conf_thresh=0.5)

    prev_time = time.time()

    while True:
        ret, frame = cap.read()
        if not ret or frame is None:
            break

        # Run inference
        output = detector.detect(frame)

        # FPS calculation
        current_time = time.time()
        time_diff = current_time - prev_time
        fps = 1.0 / time_diff if time_diff > 0 else 0.0
        prev_time = current_time
        
        # Display FPS
        cv2.putText(frame, f"FPS: {int(fps)}", (20, 40), 
                    cv2.FONT_HERSHEY_SIMPLEX, 1.0, (0, 255, 0), 2, cv2.LINE_AA)

        cv2.imshow("YOLOv8 Detection Test", frame)

        if cv2.waitKey(1) & 0xFF == 27:
            logger.info("ESC key pressed. Exiting standalone test.")
            break

    cap.release()
    cv2.destroyAllWindows()

if __name__ == "__main__":
    test_standalone()
