import cv2
import numpy as np
import json
import os
import logging
from collections import Counter

logging.basicConfig(level=logging.INFO, format='%(message)s')
logger = logging.getLogger(__name__)

DB_FILE = "employee_db.json"

class EmployeeKiosk:
    def __init__(self):
        """
        Initializes the Employee Kiosk UI.
        Uses lightweight Haar Cascades for lightning-fast edge face detection
        without requiring heavy GPU/dlib C++ dependencies on Windows.
        """
        # Load local OpenCV Face Detection ML model
        self.face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')
        self.db = self._load_db()

    def _load_db(self):
        if os.path.exists(DB_FILE):
            with open(DB_FILE, 'r') as f:
                return json.load(f)
        return {}

    def _save_db(self):
        with open(DB_FILE, 'w') as f:
            json.dump(self.db, f, indent=4)

    def extract_dominant_color(self, image, k=3):
        """
        Uses K-Means clustering Machine Learning to isolate the dominant
        uniform/shirt color of the employee, ignoring background noise.
        """
        pixels = image.reshape((-1, 3))
        pixels = np.float32(pixels)

        # K-Means constraints
        criteria = (cv2.TERM_CRITERIA_EPS + cv2.TERM_CRITERIA_MAX_ITER, 10, 1.0)
        _, labels, centers = cv2.kmeans(pixels, k, None, criteria, 10, cv2.KMEANS_RANDOM_CENTERS)
        
        # Extract the largest color cluster
        counts = Counter(labels.flatten())
        dominant = centers[counts.most_common(1)[0][0]]
        
        # Return cleanly as BGR int array
        return [int(c) for c in dominant]

    def start_kiosk(self):
        """Launches the dedicated Security Kiosk UI for Employee Sign-In."""
        cap = cv2.VideoCapture(0)
        if not cap.isOpened():
            logger.error("Camera not accessible for Kiosk Terminal.")
            return

        logger.info("=========================================")
        logger.info("   SUPREME AI: EMPLOYEE TERMINAL ACTIVE  ")
        logger.info("=========================================")
        logger.info("-> Stand in front of camera.")
        logger.info("-> Press 's' to Scan Face & Uniform.")
        logger.info("-> Press 'q' or ESC to exit.")

        latest_emp = ""

        while True:
            ret, frame = cap.read()
            if not ret:
                break

            display = frame.copy()
            gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
            
            # Detect faces mathematically
            faces = self.face_cascade.detectMultiScale(gray, scaleFactor=1.3, minNeighbors=5)

            # Draw Kiosk Digital UI
            cv2.rectangle(display, (0, 0), (640, 90), (20, 20, 20), -1)
            cv2.putText(display, "SUPREME SECURE SIGN-IN", (20, 40), 
                        cv2.FONT_HERSHEY_SIMPLEX, 1, (255, 255, 255), 2)
            cv2.putText(display, "Press 'S' to Register Profile", (20, 75), 
                        cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 255, 255), 2)
            
            face_coords = None
            for (x, y, w, h) in faces:
                # Map Face Bounds
                cv2.rectangle(display, (x, y), (x+w, y+h), (0, 255, 0), 2)
                cv2.putText(display, "FACE LOCKED", (x, y-10), 
                            cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 255, 0), 2)
                face_coords = (x, y, w, h)

                # Dynamically Map Torso/Uniform Region based on cranial proportions
                torso_y1 = y + h
                torso_y2 = min(frame.shape[0], y + int(h * 3.0))
                torso_x1 = max(0, x - int(w*0.7))
                torso_x2 = min(frame.shape[1], x + int(w*1.7))
                
                if torso_y2 > torso_y1 and torso_x2 > torso_x1:
                    cv2.rectangle(display, (torso_x1, torso_y1), (torso_x2, torso_y2), (255, 200, 0), 2)
                    cv2.putText(display, "UNIFORM SCAN AREA", (torso_x1, torso_y2+20), 
                                cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 200, 0), 2)

            if latest_emp:
                # Banner confirming sign in
                cv2.rectangle(display, (0, 400), (640, 480), (0, 150, 0), -1)
                cv2.putText(display, f"SUCCESS: {latest_emp} PROFILED!", (20, 450), 
                            cv2.FONT_HERSHEY_SIMPLEX, 1.0, (255, 255, 255), 3)

            cv2.imshow("Employee Security Kiosk", display)
            
            key = cv2.waitKey(1) & 0xFF
            if key == ord('q') or key == 27:
                break
            elif key == ord('s') and face_coords is not None:
                # Execute Profile Re-ID Capture
                x, y, w, h = face_coords
                
                # Snip Torso array
                torso_y1, torso_y2 = y + h, min(frame.shape[0], y + int(h * 3.0))
                torso_x1, torso_x2 = max(0, x - int(w*0.7)), min(frame.shape[1], x + int(w*1.7))
                
                if torso_y2 > torso_y1 and torso_x2 > torso_x1:
                    torso_roi = frame[torso_y1:torso_y2, torso_x1:torso_x2]
                    dom_color = self.extract_dominant_color(torso_roi)
                else:
                    dom_color = [0, 0, 0] # Failsafe

                # Generate Auto-ID
                emp_id = f"EMP-{len(self.db) + 7001}"
                
                self.db[emp_id] = {
                    "uniform_bgr": dom_color,
                    "status": "Shift_Started"
                }
                self._save_db()
                latest_emp = emp_id
                
                logger.info(f"✅ Registered {emp_id} to Matrix. Vector Color Signature: {dom_color}")

        cap.release()
        cv2.destroyAllWindows()
        logger.info("Kiosk Offline.")

if __name__ == "__main__":
    kiosk = EmployeeKiosk()
    kiosk.start_kiosk()
